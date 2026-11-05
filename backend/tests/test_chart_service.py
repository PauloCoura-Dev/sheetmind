import pandas as pd

from app.services.chart_service import generate_charts
from tests.test_quality_service import meta


def test_so_uma_coluna_numerica_gera_histograma():
    df = pd.DataFrame({"idade": [18, 22, 25, 31, 34, 40, 41, 47, 52, 60]})

    charts = generate_charts(df, meta(df))

    assert len(charts) == 1
    hist = charts[0]
    assert hist["chart_type"] == "bar"
    assert hist["title"] == "Distribuição de idade"
    assert len(hist["data"]) == 10
    assert sum(b["value"] for b in hist["data"]) == 10
    assert hist["data"][-1]["category"].endswith("60.0")
