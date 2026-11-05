import pandas as pd


MAX_CHARTS = 5
PIE_MAX_CATEGORIES = 8


def generate_charts(df: pd.DataFrame, column_meta: list[dict]) -> list[dict]:
    """Generate Recharts-ready chart configurations from the DataFrame."""
    charts = []

    date_cols = [c["name"] for c in column_meta if c["inferred_type"] == "date"]
    numeric_cols = [c["name"] for c in column_meta if c["inferred_type"] == "numeric"]
    cat_cols = [c["name"] for c in column_meta if c["inferred_type"] == "categorical"]

    # 1. Line charts: date × numeric (up to 2)
    if date_cols and numeric_cols:
        date_col = date_cols[0]
        for num_col in numeric_cols[:2]:
            chart = _build_line_chart(df, date_col, num_col)
            if chart:
                charts.append(chart)

    # 2. Bar / Pie: categorical × numeric
    if cat_cols and numeric_cols:
        cat_col = cat_cols[0]
        num_col = numeric_cols[0]
        chart = _build_cat_chart(df, cat_col, num_col)
        if chart:
            charts.append(chart)

        # Second categorical column if available
        if len(cat_cols) > 1 and len(charts) < MAX_CHARTS:
            chart2 = _build_cat_chart(df, cat_cols[1], num_col)
            if chart2:
                charts.append(chart2)

    # 3. Scatter: two numeric columns
    if len(numeric_cols) >= 2 and len(charts) < MAX_CHARTS:
        chart = _build_scatter_chart(df, numeric_cols[0], numeric_cols[1])
        if chart:
            charts.append(chart)

    # 4. Histogram fallback: single numeric, no date/cat
    if not charts and numeric_cols:
        chart = _build_histogram(df, numeric_cols[0])
        if chart:
            charts.append(chart)

    return charts[:MAX_CHARTS]


def _build_line_chart(df: pd.DataFrame, date_col: str, num_col: str) -> dict | None:
    try:
        tmp = df[[date_col, num_col]].copy()
        # Try BR format first, then let pandas infer silently
        parsed = None
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
            try:
                parsed = pd.to_datetime(tmp[date_col], format=fmt, errors="coerce")
                if parsed.notna().sum() / len(tmp) >= 0.8:
                    break
            except Exception:
                pass
        if parsed is None:
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                parsed = pd.to_datetime(tmp[date_col], errors="coerce")
        tmp[date_col] = parsed
        tmp = tmp.dropna()
        tmp = tmp.sort_values(date_col)
        # Aggregate by month if many rows
        if len(tmp) > 60:
            tmp[date_col] = tmp[date_col].dt.to_period("M").dt.to_timestamp()
            tmp = tmp.groupby(date_col, as_index=False)[num_col].sum()
        tmp[date_col] = tmp[date_col].dt.strftime("%b %Y")
        data = tmp.rename(columns={date_col: "date", num_col: "value"}).to_dict(orient="records")
        if not data:
            return None
        return {
            "chart_type": "line",
            "title": f"{num_col} ao longo do tempo",
            "x_key": "date",
            "y_key": "value",
            "data": data,
        }
    except Exception:
        return None


_MEAN_KEYWORDS = {"média", "media", "nota", "taxa", "percentual", "percent", "score", "rating", "avaliação", "avaliacao", "indice", "índice", "ratio"}


def _should_use_mean(col_name: str) -> bool:
    return any(kw in col_name.lower() for kw in _MEAN_KEYWORDS)


def _build_cat_chart(df: pd.DataFrame, cat_col: str, num_col: str) -> dict | None:
    try:
        tmp = df[[cat_col, num_col]].dropna()
        use_mean = _should_use_mean(num_col)
        agg_func = "mean" if use_mean else "sum"
        grouped = tmp.groupby(cat_col, as_index=False)[num_col].agg(agg_func)
        if use_mean:
            grouped[num_col] = grouped[num_col].round(2)
        grouped = grouped.sort_values(num_col, ascending=False).head(20)
        unique_count = grouped[cat_col].nunique()

        if unique_count <= PIE_MAX_CATEGORIES:
            data = grouped.rename(columns={cat_col: "name", num_col: "value"}).to_dict(orient="records")
            label = "Média de" if use_mean else "Distribuição de"
            return {
                "chart_type": "pie",
                "title": f"{label} {num_col} por {cat_col}",
                "name_key": "name",
                "y_key": "value",
                "data": data,
            }
        else:
            data = grouped.rename(columns={cat_col: "category", num_col: "value"}).to_dict(orient="records")
            title = f"Média de {num_col} por {cat_col}" if use_mean else f"{num_col} por {cat_col}"
            return {
                "chart_type": "bar",
                "title": title,
                "x_key": "category",
                "y_key": "value",
                "data": data,
            }
    except Exception:
        return None


def _build_scatter_chart(df: pd.DataFrame, x_col: str, y_col: str) -> dict | None:
    try:
        tmp = df[[x_col, y_col]].dropna().head(500)
        data = tmp.rename(columns={x_col: "x", y_col: "y"}).to_dict(orient="records")
        if not data:
            return None
        return {
            "chart_type": "scatter",
            "title": f"Relação entre {x_col} e {y_col}",
            "x_key": "x",
            "y_key": "y",
            "data": data,
        }
    except Exception:
        return None


def _build_histogram(df: pd.DataFrame, num_col: str) -> dict | None:
    try:
        series = df[num_col].dropna()
        if len(series) == 0:
            return None
        counts, edges = pd.cut(series, bins=10, retbins=True)
        hist_data = (
            counts.value_counts(sort=False)
            .reset_index()
        )
        data = [
            {"category": f"{edges[i]:.1f}–{edges[i+1]:.1f}", "value": int(row.iloc[1])}
            for i, (_, row) in enumerate(hist_data.iterrows())
        ]
        return {
            "chart_type": "bar",
            "title": f"Distribuição de {num_col}",
            "x_key": "category",
            "y_key": "value",
            "data": data,
        }
    except Exception:
        return None
