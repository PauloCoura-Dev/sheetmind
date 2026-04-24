import pandas as pd


def parse_file(file_path: str) -> tuple[pd.DataFrame, list[dict]]:
    """Load spreadsheet and return DataFrame + column metadata."""
    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    # Drop fully empty rows
    df.dropna(how="all", inplace=True)
    df.reset_index(drop=True, inplace=True)

    column_meta = []
    for col in df.columns:
        series = df[col]
        non_null = series.dropna()
        null_count = int(series.isna().sum())
        unique_count = int(non_null.nunique())
        sample_values = [str(v) for v in non_null.head(5).tolist()]
        inferred_type = _infer_type(series)

        column_meta.append(
            {
                "name": str(col),
                "inferred_type": inferred_type,
                "null_count": null_count,
                "unique_count": unique_count,
                "sample_values": sample_values,
            }
        )

    return df, column_meta


def _infer_type(series: pd.Series) -> str:
    non_null = series.dropna()
    if len(non_null) == 0:
        return "empty"

    # Numeric check first (fastest)
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"

    # DateTime check on string columns — try common BR/ISO formats explicitly
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            parsed = pd.to_datetime(non_null, format=fmt, errors="coerce")
            success_rate = parsed.notna().sum() / len(non_null)
            if success_rate >= 0.8:
                return "date"
        except Exception:
            pass
    # Fallback: let pandas infer (suppresses individual-element warnings)
    try:
        with __import__("warnings").catch_warnings():
            __import__("warnings").simplefilter("ignore")
            parsed = pd.to_datetime(non_null, errors="coerce")
        success_rate = parsed.notna().sum() / len(non_null)
        if success_rate >= 0.8:
            return "date"
    except Exception:
        pass

    # Categorical: low cardinality
    unique_ratio = non_null.nunique() / len(non_null)
    if unique_ratio < 0.05 and non_null.nunique() < 20:
        return "categorical"

    return "text"
