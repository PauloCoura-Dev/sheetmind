import pandas as pd


def analyze_quality(df: pd.DataFrame, column_meta: list[dict]) -> dict:
    """Analyze data quality and return a report with issues."""
    issues = []
    total_rows = len(df)

    for col_info in column_meta:
        col = col_info["name"]
        null_count = col_info["null_count"]

        if col not in df.columns:
            continue

        # Fully empty column
        if null_count == total_rows:
            issues.append(
                {
                    "column": col,
                    "issue_type": "empty_column",
                    "description": f"A coluna '{col}' está completamente vazia.",
                    "suggestion": "Remova ou preencha esta coluna antes de analisar.",
                    "affected_rows": total_rows,
                    "severity": "critical",
                }
            )
        # High null rate (>30%)
        elif null_count > 0 and total_rows > 0 and (null_count / total_rows) > 0.3:
            pct = int(null_count / total_rows * 100)
            issues.append(
                {
                    "column": col,
                    "issue_type": "high_null_rate",
                    "description": f"A coluna '{col}' tem {null_count} valores em branco ({pct}% das linhas).",
                    "suggestion": "Considere preencher os valores ausentes com a média ou remover esta coluna.",
                    "affected_rows": null_count,
                    "severity": "warning",
                }
            )

        # Mixed types: text column with partial numeric content
        if col_info["inferred_type"] == "text":
            series_str = df[col].dropna().astype(str)
            if len(series_str) > 0:
                numeric_count = int(pd.to_numeric(series_str, errors="coerce").notna().sum())
                ratio = numeric_count / len(series_str)
                if 0.1 < ratio < 0.9:
                    issues.append(
                        {
                            "column": col,
                            "issue_type": "mixed_types",
                            "description": (
                                f"A coluna '{col}' mistura texto e números. "
                                "Isso pode causar erros em cálculos."
                            ),
                            "suggestion": "Uniformize o tipo de dado desta coluna (ex: somente números ou somente texto).",
                            "affected_rows": numeric_count,
                            "severity": "warning",
                        }
                    )

    # Duplicate rows
    duplicate_rows = int(df.duplicated().sum())
    if duplicate_rows > 0:
        dup_pct = duplicate_rows / total_rows if total_rows > 0 else 0
        issues.append(
            {
                "column": None,
                "issue_type": "duplicate_rows",
                "description": f"{duplicate_rows} linhas duplicadas encontradas ({int(dup_pct * 100)}% do total).",
                "suggestion": "Remova as linhas duplicadas para evitar distorções nos cálculos.",
                "affected_rows": duplicate_rows,
                "severity": "critical" if dup_pct >= 0.1 else "warning",
            }
        )

    # Score: starts at 100, penalizes per issue by severity
    penalty = sum(20 if i["severity"] == "critical" else 10 for i in issues)
    score = max(0, 100 - penalty)

    # Prioritize: critical first, then by affected_rows descending
    issues.sort(key=lambda x: (0 if x["severity"] == "critical" else 1, -(x["affected_rows"] or 0)))

    return {
        "score": score,
        "total_rows": total_rows,
        "issues": issues,
    }
