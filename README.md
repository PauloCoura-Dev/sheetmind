# SheetMind

Análise automática de planilhas para micro e pequenas empresas.

Você envia um `.xlsx`, `.xls` ou `.csv` e o SheetMind devolve:

- **uma nota de confiabilidade de 0 a 100**, com cada problema encontrado, onde ele está e como corrigir;
- **gráficos montados sozinhos**, escolhidos pelo tipo de cada coluna e feitos só com os dados do arquivo;
- **de 3 a 6 recomendações em linguagem simples**, geradas pela API do Claude a partir de um resumo da planilha.

Projeto pessoal, feito em dois dias (abril de 2026).

## Como funciona

```
 upload ──▶ leitura ──▶ qualidade ──▶ gráficos ──▶ insights ──▶ relatório
            pandas      regras        por tipo     Claude API    PostgreSQL
```

O processamento roda em segundo plano depois do upload. A tela acompanha o status até o relatório ficar pronto.

### 1. Leitura e tipos

Cada coluna é classificada como **número**, **data**, **categoria**, **texto** ou **vazia**. Datas são reconhecidas nos formatos brasileiros e ISO (`dd/mm/aaaa`, `aaaa-mm-dd` e variações) quando pelo menos 80% dos valores batem com o formato.

### 2. Nota de confiabilidade

A nota começa em 100 e perde pontos por problema: **20 por crítico** e **10 por atenção**.

| Problema | Gravidade |
|---|---|
| Coluna totalmente vazia | crítico |
| Mais de 30% das células em branco | atenção |
| Texto misturado com número na mesma coluna | atenção |
| Linhas duplicadas | crítico a partir de 10% das linhas, senão atenção |

Os problemas aparecem do mais grave para o mais leve, com a sugestão de correção de cada um.

### 3. Gráficos

Até 5 gráficos, sempre com dados reais da planilha:

| Colunas encontradas | Gráfico |
|---|---|
| data + número | linha ao longo do tempo |
| categoria + número | pizza (até 8 categorias) ou barras |
| dois números | dispersão |
| só um número | histograma |

Colunas cujo nome indica média (nota, taxa, percentual, avaliação, índice...) são agregadas pela média; as outras, pela soma.

### 4. Insights

O Claude Haiku recebe **só um resumo**: nome e tipo de cada coluna, contagens, até 3 exemplos de valor por coluna, a nota e a lista de problemas. A planilha inteira nunca é enviada. A resposta volta em formato estruturado (tool use). Se a API falhar três vezes, o relatório sai mesmo assim, com os principais problemas de qualidade no lugar dos insights.

## Stack

| Camada | Tecnologias |
|---|---|
| Back-end | Python 3.12, FastAPI, pandas, SQLAlchemy 2 (async), Alembic, PostgreSQL 16, JWT |
| Front-end | Next.js 15, React 19, TypeScript, TanStack Query, Recharts, Tailwind CSS, Zod |
| IA | Anthropic API (Claude Haiku) |
| Infra | Docker Compose, GitHub Actions (lint, testes e build), Railway |
| Testes | pytest |

## Rodar localmente

Precisa de Docker e de uma chave da API da Anthropic.

```bash
cp .env.example .env
```

Preencha `SECRET_KEY` e `ANTHROPIC_API_KEY` no `.env` e suba tudo:

```bash
docker compose up --build
```

- Aplicação: http://localhost:3000
- API e documentação interativa: http://localhost:8000/docs

As migrations rodam sozinhas quando o back-end sobe.

## Testes

As regras da nota de confiabilidade e a montagem dos gráficos têm testes automatizados. O GitHub Actions roda o lint (ruff) e os testes a cada push, junto com o build do front-end.

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Estrutura

```
backend/
  app/
    routers/     auth, uploads, analyses  (/api/v1/...)
    services/    parser, quality, chart, insight, pipeline
    models/      user, upload, analysis
  alembic/       migrations
  tests/         regras de qualidade e gráficos
frontend/
  src/
    app/         login, cadastro, painel, relatório
    components/  upload, gráficos, alertas de qualidade, insights
```

## Autor

Paulo Coura · [portfólio](https://paulocoura-dev.github.io) · [LinkedIn](https://www.linkedin.com/in/paulo-coura-barbosa)
