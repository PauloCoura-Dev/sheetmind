import pandas as pd

from app.services.parser_service import _infer_type
from app.services.quality_service import analyze_quality


def meta(df: pd.DataFrame) -> list[dict]:
    """Os mesmos metadados que o parse_file monta, sem precisar de arquivo."""
    return [
        {
            "name": str(col),
            "inferred_type": _infer_type(df[col]),
            "null_count": int(df[col].isna().sum()),
        }
        for col in df.columns
    ]


def analisar(df: pd.DataFrame) -> dict:
    return analyze_quality(df, meta(df))


def tipos(report: dict) -> list[str]:
    return [i["issue_type"] for i in report["issues"]]


def test_planilha_limpa_tira_nota_100():
    df = pd.DataFrame({"produto": [f"item {i}" for i in range(10)], "valor": range(10)})

    report = analisar(df)

    assert report == {"score": 100, "total_rows": 10, "issues": []}


def test_coluna_totalmente_vazia_e_critica():
    df = pd.DataFrame({"valor": range(10), "obs": [None] * 10})

    report = analisar(df)

    assert tipos(report) == ["empty_column"]
    issue = report["issues"][0]
    assert issue["column"] == "obs"
    assert issue["severity"] == "critical"
    assert issue["affected_rows"] == 10
    assert report["score"] == 80


def test_mais_de_30_por_cento_em_branco_e_atencao():
    df = pd.DataFrame({"valor": range(10), "telefone": [None] * 4 + [f"9999-000{i}" for i in range(6)]})

    report = analisar(df)

    assert tipos(report) == ["high_null_rate"]
    issue = report["issues"][0]
    assert issue["severity"] == "warning"
    assert issue["affected_rows"] == 4
    assert "40%" in issue["description"]
    assert report["score"] == 90


def test_exatamente_30_por_cento_em_branco_nao_e_problema():
    df = pd.DataFrame({"valor": range(10), "telefone": [None] * 3 + [f"9999-000{i}" for i in range(7)]})

    assert analisar(df)["issues"] == []


def test_texto_misturado_com_numero_e_atencao():
    valores = ["10", "20", "30", "40", "50", "dez", "vinte", "trinta", "quarenta", "cinquenta"]
    df = pd.DataFrame({"quantidade": valores})

    report = analisar(df)

    assert tipos(report) == ["mixed_types"]
    assert report["issues"][0]["affected_rows"] == 5


def test_poucos_numeros_no_meio_do_texto_nao_contam_como_mistura():
    # 1 número em 20 valores fica abaixo do limite de 10%
    nomes = [f"cliente {i}" for i in range(19)] + ["123"]
    df = pd.DataFrame({"nome": nomes})

    assert "mixed_types" not in tipos(analisar(df))


def test_duplicadas_abaixo_de_10_por_cento_sao_atencao():
    linhas = [{"id": i, "valor": i * 10} for i in range(19)]
    df = pd.DataFrame(linhas + [linhas[0]])  # 1 duplicada em 20 = 5%

    report = analisar(df)

    assert tipos(report) == ["duplicate_rows"]
    assert report["issues"][0]["severity"] == "warning"
    assert report["issues"][0]["affected_rows"] == 1


def test_duplicadas_a_partir_de_10_por_cento_sao_criticas():
    linhas = [{"id": i, "valor": i * 10} for i in range(9)]
    df = pd.DataFrame(linhas + [linhas[0]])  # 1 duplicada em 10 = 10%

    report = analisar(df)

    assert report["issues"][0]["severity"] == "critical"
    assert report["score"] == 80


def test_criticos_vem_antes_e_empate_ordena_por_linhas_afetadas():
    df = pd.DataFrame(
        {
            "valor": range(10),
            "pouco_vazio": [None] * 4 + list(range(6)),
            "muito_vazio": [None] * 8 + list(range(2)),
            "vazia": [None] * 10,
        }
    )

    report = analisar(df)

    assert [i["column"] for i in report["issues"]] == ["vazia", "muito_vazio", "pouco_vazio"]
    assert report["score"] == 60  # 100 - 20 - 10 - 10


def test_nota_nunca_fica_negativa():
    df = pd.DataFrame({f"vazia_{i}": [None] * 5 for i in range(6)})

    report = analisar(df)

    assert len(report["issues"]) == 7  # 6 colunas vazias + linhas duplicadas
    assert report["score"] == 0


def test_coluna_dos_metadados_que_nao_existe_na_planilha_e_ignorada():
    df = pd.DataFrame({"valor": range(10)})
    metadados = meta(df) + [{"name": "sumiu", "inferred_type": "empty", "null_count": 10}]

    assert analyze_quality(df, metadados)["issues"] == []
