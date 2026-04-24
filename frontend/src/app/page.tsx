import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SheetMind — Análise Inteligente de Planilhas com IA",
  description:
    "Envie sua planilha e receba gráficos, insights e relatório de qualidade automaticamente. Sem fórmulas, sem analista. Resultados em segundos.",
  openGraph: {
    title: "SheetMind — Análise Inteligente de Planilhas com IA",
    description:
      "Envie sua planilha e receba gráficos, insights e relatório de qualidade automaticamente.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">SheetMind</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <span className="inline-block bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Análise com Inteligência Artificial
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
          Sua planilha vira um dashboard em{" "}
          <span className="text-brand-600">menos de 1 minuto</span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto">
          Envie um arquivo <strong>.xlsx</strong> ou <strong>.csv</strong> e receba
          gráficos automáticos, insights em português e um relatório completo de qualidade dos
          dados — sem precisar saber nada de análise de dados.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-brand-600 text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors"
          >
            Analisar minha planilha grátis
          </Link>
          <Link
            href="/login"
            className="border border-gray-200 text-gray-700 px-8 py-3 rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-400">Sem cartão de crédito · Resultado imediato</p>
      </section>

      {/* Como funciona */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Envie sua planilha",
                desc: "Arraste e solte seu arquivo .xlsx ou .csv. Suportamos arquivos de até 20MB.",
              },
              {
                step: "2",
                title: "A IA analisa os dados",
                desc: "Em segundos, identificamos padrões, calculamos métricas e geramos gráficos automaticamente.",
              },
              {
                step: "3",
                title: "Receba seus insights",
                desc: "Dashboard completo com gráficos, insights em português e relatório de qualidade dos dados.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          Tudo que você precisa para entender seus dados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "📊",
              title: "Gráficos automáticos",
              desc: "Linhas, barras, pizza e dispersão gerados automaticamente a partir dos seus dados, sem configuração.",
            },
            {
              icon: "💡",
              title: "Insights em português",
              desc: "Análises escritas em linguagem simples explicando os principais achados da sua planilha.",
            },
            {
              icon: "🔍",
              title: "Relatório de qualidade",
              desc: "Detectamos células vazias, duplicatas, inconsistências e sugerimos como corrigir cada problema.",
            },
            {
              icon: "📈",
              title: "Tendências e padrões",
              desc: "Identificamos crescimento, quedas, picos e concentrações que passariam despercebidos.",
            },
            {
              icon: "📁",
              title: "Histórico de análises",
              desc: "Todas as suas análises ficam salvas. Acesse, compare e exporte quando quiser.",
            },
            {
              icon: "🖨️",
              title: "Exportar relatório",
              desc: "Imprima ou salve em PDF para compartilhar com clientes, sócios ou equipe.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 mt-3 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quem é */}
      <section className="bg-brand-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Feito para quem não tem tempo a perder
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Pequenos empreendedores, autônomos e gestores que precisam de respostas rápidas
            — sem depender de analistas ou aprender Excel avançado.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Vendas e faturamento",
              "Controle de estoque",
              "Relatórios financeiros",
              "Dados de clientes",
              "Pesquisas e formulários",
              "Controle de metas",
            ].map((tag) => (
              <span
                key={tag}
                className="bg-white border border-brand-100 text-brand-700 text-sm px-4 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Pronto para entender seus dados?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Crie sua conta grátis e analise sua primeira planilha agora mesmo.
        </p>
        <Link
          href="/register"
          className="inline-block bg-brand-600 text-white px-10 py-4 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors"
        >
          Começar grátis
        </Link>
        <p className="mt-4 text-xs text-gray-400">Sem cartão de crédito · Cancele quando quiser</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-gray-700">SheetMind</span>
          <span>Análise inteligente de planilhas com IA</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gray-600 transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="hover:text-gray-600 transition-colors">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
