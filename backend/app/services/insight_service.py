import asyncio
import json

import anthropic

from app.config import settings

_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

INSIGHT_TOOL = {
    "name": "generate_insights",
    "description": "Gera insights em português do Brasil a partir de uma análise de planilha.",
    "input_schema": {
        "type": "object",
        "properties": {
            "insights": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["growth", "peak", "anomaly", "quality", "summary"],
                        },
                        "text": {
                            "type": "string",
                            "description": "Texto explicativo em português do Brasil, claro e direto.",
                        },
                        "severity": {
                            "type": "string",
                            "enum": ["info", "warning", "critical"],
                        },
                    },
                    "required": ["type", "text", "severity"],
                },
                "minItems": 1,
                "maxItems": 8,
            }
        },
        "required": ["insights"],
    },
}


def _build_prompt(
    column_meta: list[dict],
    quality_report: dict,
    chart_configs: list[dict],
) -> str:
    # Compact summary to stay under 2000 tokens
    col_summary = [
        {
            "nome": c["name"],
            "tipo": c["inferred_type"],
            "nulos": c["null_count"],
            "únicos": c["unique_count"],
            "exemplos": c["sample_values"][:3],
        }
        for c in column_meta
    ]

    chart_summary = [
        {"tipo": ch["chart_type"], "titulo": ch["title"]}
        for ch in chart_configs
    ]

    issues = quality_report.get("issues", [])

    prompt_data = json.dumps(
        {
            "colunas": col_summary,
            "score_qualidade": quality_report.get("score"),
            "total_linhas": quality_report.get("total_rows"),
            "problemas": [i["description"] for i in issues],
            "graficos_gerados": chart_summary,
        },
        ensure_ascii=False,
    )

    return (
        "Você é um analista de dados que ajuda pequenos empreendedores a entenderem suas planilhas.\n"
        "Com base nos metadados da planilha abaixo, gere de 3 a 6 insights úteis em português do Brasil.\n"
        "Use linguagem simples, evite jargões técnicos. Seja direto e prático.\n\n"
        f"Dados da planilha:\n{prompt_data}"
    )


async def generate_insights(
    column_meta: list[dict],
    quality_report: dict,
    chart_configs: list[dict],
) -> tuple[list[dict], str]:
    """Call Claude Haiku and return (insights, raw_response_text)."""
    prompt = _build_prompt(column_meta, quality_report, chart_configs)

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            message = await _client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                tools=[INSIGHT_TOOL],
                tool_choice={"type": "tool", "name": "generate_insights"},
                messages=[{"role": "user", "content": prompt}],
            )

            raw = str(message.model_dump())

            # Extract tool use block
            for block in message.content:
                if block.type == "tool_use" and block.name == "generate_insights":
                    insights = block.input.get("insights", [])
                    return insights, raw

            return [], raw

        except Exception as exc:
            last_error = exc
            wait = 2 ** attempt
            await asyncio.sleep(wait)

    # All retries failed — return quality issues as fallback insights
    fallback = [
        {
            "type": "quality",
            "text": issue["description"],
            "severity": issue["severity"],
        }
        for issue in quality_report.get("issues", [])[:3]
    ]
    return fallback, f"Erro após 3 tentativas: {last_error}"
