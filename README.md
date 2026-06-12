# Pipeline UPP — Guia de Desenvolvimento

## 📋 Visão Geral

**Pipeline UPP** é uma plataforma de gestão e análise de pipeline comercial em tempo real. A aplicação fornece visibilidade completa sobre quotes em diferentes estágios de negociação (Pipelined, Pricing, Committed, Lost, etc.), com suporte a múltiplos cenários alternativos por oportunidade, filtros avançados, e exportação de dados.

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4

---

## 🏗️ Arquitetura e Estrutura de Pastas

```
/vercel/share/v0-project/
├── /app                          # Rotas e páginas Next.js
│   ├── /dashboard               # Dashboard executivo (KPIs, gráficos, cenários)
│   ├── /pipeline-manager        # Manager — view em Kanban/Tabela com multiedição
│   ├── /pipeline-details        # Details — tabela completa com 15+ colunas, filtros avançados
│   ├── layout.tsx              # Root layout com fonts, metadata, providers
│   └── page.tsx                # Home — hero + cards de navegação (3 funcionalidades)
├── /components
│   ├── /pages                   # Componentes de página (landing-page.tsx, etc)
│   ├── /common                  # Componentes reutilizáveis (modals, editors)
│   ├── dashboard.tsx            # Lógica e render do Dashboard
│   ├── manager.tsx              # Lógica e render do Manager
│   ├── pipeline-details.tsx     # Lógica e render do Details
│   └── ...                      # Outros componentes
├── /lib
│   ├── mock-store.ts           # Gerador de dados mockados (85 quotes)
│   ├── data-service.ts         # Funções utilitárias de cálculo/agregação
│   └── mock-data.ts            # Dados estáticos (cenários, grupos, etc)
├── /types
│   └── index.ts                # Definições TypeScript (Quote, Stage, etc)
├── /hooks
│   ├── useExport.ts            # Hook para export CSV
│   └── ...                     # Outros custom hooks
├── /public                     # Assets estáticos
└── globals.css                 # Design tokens, Tailwind config v4
```

---

## 📊 Estrutura de Dados Principal

### **Quote** (tipo principal)
```typescript
interface Quote {
  // Identificação
  id: string;                    // UUID único
  cpo_id: string;               // Ex: "CPO-1001"
  cpo_no: string;               // Ex: "CPO-001234"
  quote_name: string;           // Ex: "QT-024000"
  
  // Status e Stage
  status: 'SALESORDER' | 'QUOTEPO' | 'CANCELLED';
  stage: 'Not Classified' | 'Pipelined' | 'Pricing 25%' | 'Up Selling 50%' | 'Committed 75%' | 'Net Lost';
  probability: number;          // 0-100%, correlato ao stage
  
  // Localização e Mercado
  sales_territory: string;      // Ex: "Rio de Janeiro"
  vpc_code: string;             // Ex: "VPC-SP01"
  
  // Partes e Descrição
  part_no: string;              // Pode conter múltiplos separados por ",": "NX-10000, HP-20000, DL-30000"
  description: string;          // Descrição técnica da parte
  hts_code: string;             // Código HTS de importação
  hts_description: string;      // Descrição HTS
  
  // Clientes
  master_customer: string;      // Ex: "Revenda A"
  end_user: string;            // Ex: "Cliente 2 Ltda"
  bill_to: string;             // Entidade de faturamento
  team: string;                // Time responsável
  vendor: string;              // Fornecedor
  
  // Valores Financeiros
  usd_value: number;           // CIF em USD (valor principal)
  net_value: number;           // NET em USD
  fob_value: number;           // FOB em USD
  gm_pct: number;              // Margem Bruta (%)
  cpo_qty: number;             // Quantidade de itens
  
  // Datas
  created_date: string;        // Data de criação (ISO)
  close_date: string;          // Data esperada de fechamento (ISO)
  
  // Comercial
  prod_type: 'Hardware' | 'Software' | 'Services' | 'Renewal';
  renew: 'Yes' | 'No';         // É renovação?
  is_engineering_ticket: string; // Número da engenharia (opcional)
  credito_aprovado?: string;   // "Sim" | "Não" — editável (individual e em lote)
  vendor_opportunity_id?: string; // Registro de Oportunidade no Vendor — texto livre, opcional
  lost_reason: string;         // Se stage=Net Lost, motivo da perda
  cpo_pay_meth: string;        // Método de pagamento CPO
  pay_meth_name: string;       // Nome do método
  opportunity: string;         // Identificador da oportunidade
  
  // Comentários
  pipe_comments: string;       // Editável pelo usuário (Pipe Comments)
  quote_comments: string;      // Read-only, preenchido pelo sistema
}
```

### **Stage** (constantes)
```typescript
type Stage = 'Not Classified' | 'Pipelined' | 'Pricing 25%' | 'Up Selling 50%' | 'Committed 75%' | 'Net Lost';

// Cores por stage (Tailwind)
const STAGE_BORDER: Record<Stage, string> = {
  'Not Classified': 'border-l-gray-400',
  'Pipelined':      'border-l-blue-400',
  'Pricing 25%':    'border-l-purple-400',
  'Up Selling 50%': 'border-l-yellow-400',
  'Committed 75%':  'border-l-emerald-400',
  'Net Lost':       'border-l-red-400',
};
```

### **Scenario** (Cenário Alternativo)
```typescript
interface Scenario {
  id: string;
  cpo_id: string;
  label: string;               // Ex: "Mais Provável", "Alternativo"
  probability: 'Mais Provável' | 'Alternativo' | 'Menos Provável';
  value: number;              // Valor em USD
  is_primary: boolean;        // É o cenário principal?
}
```

### **ScenarioGroup** (Grupo de Cenários)
```typescript
interface ScenarioGroup {
  id: string;
  name: string;               // Ex: "Expansão Datacenter Cliente X"
  scenarios: Scenario[];
  cpo_ids: string[];         // CPOs agrupados
  probability: string;       // "Mais Provável" | "Alternativo" | "Menos Provável"
}
```

---

## 🎓 Sistema de Tours Interativos

Cada página (Dashboard, Manager, Details) possui um **tour completo e contextual** que guia usuários pelas funcionalidades principais.

### Features do Tour:

**Visuais:**
- Barra de progresso colorida (completo em emerald, current em blue, pending em gray)
- Badge animado com número do step (bounce + pulsing spotlight)
- Ícones lucide em cada passo (BarChart3, Sliders, Table2, Zap, etc)
- Tooltip rico com múltiplas seções

**Conteúdo:**
- **Call-to-Action**: "Clique em X para fazer Y" — exemplos práticos
- **Pro Tips**: Insights estratégicos (ex: "Combine filtros para análises mais precisas")
- **Próximo Passo**: Dica de qual é a próxima funcionalidade a explorar
- **Descrição detalhada**: Contexto completo de cada feature

**Funcionalidade:**
- localStorage: Salva tours completados e "nunca mostrar novamente"
- Botão "Pular tour" explícito
- Botão "Nunca mostrar novamente"
- Link "Mostrar tour novamente" (aparece quando tour foi skipado)
- Navegação: Voltar, Seguir, Concluir

### Tours Disponíveis:

1. **Dashboard Tour** (6 steps)
   - KPIs Executivos → Filtros Rápidos → Gráfico de Barras → Evolução Mensal → Vendor → Análises Complementares

2. **Pipeline Manager Tour** (5 steps)
   - Resumo Executivo → Alternar Visão → Gráficos Comparativos → Tabela de Quotes → Paginação

3. **Pipeline Details Tour** (10 steps)
   - Cards de Filtro → Busca Rápida → Filtros Avançados → Tags Ativas → Ordenação → Seleção de Linhas → Edição Individual → Histórico → Edição em Lote → Export CSV

### Uso do Hook `useTour`:

```typescript
import { useTour } from '@/hooks/useTour';

// Define os steps
const TOUR_STEPS = [
  {
    id: 'kpis',
    selector: '[data-tour="kpi-grid"]',
    title: 'KPIs Executivos',
    description: '...',
    position: 'bottom' as const,
    icon: 'Zap',                      // Lucide icon name
    callToAction: 'Clique no primeiro KPI...',
    proTip: 'Mantenha >35% para pipeline saudável',
    nextStep: 'Próximo: use os filtros rápidos',
  },
  // ... mais steps
];

// Cria o tour com chave para localStorage
const tour = useTour(TOUR_STEPS, 'dashboard-tour');

// No JSX:
// <button onClick={tour.startTour}>Iniciar Tour</button>
// <TourOverlay
//   isActive={tour.isTourActive}
//   currentStep={tour.currentStep}
//   steps={TOUR_STEPS}
//   onNext={tour.nextStep}
//   onPrev={tour.prevStep}
//   onClose={tour.closeTour}
//   onSkip={tour.skipTour}
//   onNeverShow={tour.neverShowThisTourAgain}
//   totalSteps={tour.totalSteps}
// />
```

---

## 🎯 Features & Comportamentos

> **IMPORTANTE para devs**: A maior parte da lógica do **Pipeline Details** (a tela mais rica do produto) vive em um único arquivo: **`app/pipeline-details/page.tsx`** (~3.100 linhas). As páginas `/dashboard` e `/pipeline-manager` têm suas próprias `page.tsx`. Os arquivos em `/components` (`dashboard.tsx`, `manager.tsx`, `details.tsx`, etc.) são versões/protótipos auxiliares — ao alterar comportamento de Details, edite **`app/pipeline-details/page.tsx`**.

---

### **1. Dashboard Executivo** (`app/dashboard/page.tsx`)
- **KPIs em tempo real**: Total Pipeline, Not Classified, High Prob (75%), Lost Value, Avg CIF, Win Rate, Cenários Alternativos.
- **Gráficos**: Distribuição de Stages (últimos 6 meses), Cenários por Probabilidade, Top Revendas, Top Fornecedores, Território.
- **Filtros**: Territory, Revenda, Stage, Vendor, End User, Prod Type, datas.
- **Comportamento**: Todos os KPIs e gráficos são recalculados via `useMemo` conforme os filtros aplicados — não há fetch, tudo deriva do array de quotes em memória.

---

### **2. Pipeline Manager** (`app/pipeline-manager/page.tsx`)
- **Alternar Visão (Charts / Table)**: toggle no topo (`viewMode === 'charts' | 'table'`). Charts mostra gráficos comparativos; Table mostra o grid de quotes.
- **Paginação**: fixa em 25 por página (`pageSize = 25`), com navegação numérica no rodapé.
- **Comportamento**: É uma visão mais executiva/resumida. A edição pesada acontece no Details.

---

### **3. Pipeline Details** (`app/pipeline-details/page.tsx`) — tela principal

Esta tela concentra a maioria das funcionalidades. Abaixo, **como cada controle funciona**:

#### 3.1. Cards de KPI / Filtro Rápido (topo)
- Linha de cards clicáveis no topo (ex: Pipelined, Alta Probabilidade, etc.).
- **Clicar em um card aplica um filtro rápido** sobre a tabela. Clicar de novo remove. São atalhos para os filtros avançados.

#### 3.2. Busca Rápida (search box)
- Campo de texto que filtra em tempo real (`searchTerm`). Faz match em múltiplos campos (CPO ID, cliente, part no, etc.).
- O **"x"** dentro do campo limpa a busca e volta para a página 1.

#### 3.3. Seletor de Visão: **Lista / Cards / Kanban** (`viewMode`)
- **Lista**: tabela completa com colunas reordenáveis (ver 3.8). É a visão padrão.
- **Cards**: cada quote vira um cartão.
- **Kanban**: colunas por Stage (`Not Classified`, `Pricing 25%`, `Up Selling 50%`, `Committed 75%`, `Net Lost`). **Arrastar um card entre colunas altera o Stage** da quote (e a probabilidade associada). *Pipelined NÃO é coluna do Kanban* — é apenas um agrupador virtual de filtro (25%+50%+75%).
- A visão também pode ser trocada por ações da sidebar (evento `sidebar-feature-action`).

#### 3.4. Botão **Filtros** (painel avançado colapsável)
Abre/fecha o painel de filtros (`filtersOpen`). As seções são:
- **Identificacao**: CPO ID, Part No, Quote Name.
- **Classificacao**: Territory, Revenda, **Stage** (multi-seleção; selecionar "Pipelined" expande automaticamente para 25%+50%+75%), Vendor, End User, Prod Type.
- **Valores, Datas e Idade**: CIF (USD), GM%, Age (dias), Close Date, Created Date.
- **Flags**: Renew (Yes/No), Eng. Ticket (Yes/No).
- **Filtros Ativos (Tags)**: cada filtro aplicado vira um chip removível abaixo da barra. Há também um botão para **limpar todos** os filtros.
- **Persistência em URL**: os filtros aplicados são serializados na query string (`syncFiltersToUrl`), então a visão filtrada é compartilhável por link e sobrevive a refresh.

#### 3.5. Ordenação por coluna (sort)
- **Clicar no cabeçalho de uma coluna ordena** por ela; clicar de novo inverte a direção (`sortKey` + direção). Uma seta indica a coluna/direção ativa.
- Importante: o clique no header **diferencia sort de drag** — se o mouse ficou pressionado mais de 200ms (arraste), trata como reordenação de coluna, não como sort (ver `handleHeaderClick`).

#### 3.6. Seleção de Linhas + Edição em Lote
- **Checkbox por linha** (`selectedIds`) e checkbox no header para selecionar/desmarcar a página inteira.
- Com 1+ linhas marcadas, aparece a barra **"Editar em Lote"** com o select "Editar campo...". Campos disponíveis: **Stage, Close Date, Credito Aprovado, Renew, Eng. Ticket**.
- **Se nenhuma linha estiver marcada**, a edição em lote aplica a **todas as quotes filtradas no momento**.
- Há confirmação antes de aplicar (`confirmBulk`) e a ação entra na pilha de **Undo** (ver 3.10).

#### 3.7. Agrupar Cenários
- O botão **"Agrupar Cenarios (N)"** só aparece quando **2 ou mais** linhas estão selecionadas.
- Abre um modal para criar um grupo de cenários (nome da oportunidade + probabilidade compartilhada) a partir dos CPOs selecionados.

#### 3.8. **Reordenamento de Colunas (drag-and-drop)** — visão Lista
Esta é a feature sobre a qual o time mais perguntou. Funciona assim:

- **Ordem padrão (`DEFAULT_COL_ORDER`)**: derivada de `ALL_COLUMNS` no código. É a ordem "de fábrica" que todo usuário vê na primeira vez.
- **Arrastar para reordenar**: cada cabeçalho de coluna é "draggable". Arraste um header e solte sobre outro — a coluna é movida para aquela posição (`handleDragStart` → `handleDragOver` → `handleDrop`).
- **Persistência automática por usuário**: a cada arraste, a nova ordem é salva em `localStorage` na chave **`pipeline-col-order`**. Ou seja, a customização é por navegador/usuário e sobrevive a refresh — **não afeta os outros usuários**.
- **Menu de colunas** (ícone no canto da barra) oferece 3 ações:
  1. **Salvar como preferencial** → grava a ordem atual em **`pipeline-col-order-preferred`**. Essa "ordem preferencial" tem prioridade no carregamento da página.
  2. **Restaurar preferencial** → só aparece quando existe uma preferencial salva E a ordem atual é diferente dela. Volta para a visão salva.
  3. **Resetar para original** → remove ambas as chaves do localStorage e volta para `DEFAULT_COL_ORDER`.
- **Prioridade no load** (em `useState` inicial de `colOrder`): `pipeline-col-order-preferred` > `pipeline-col-order` > `DEFAULT_COL_ORDER`.
- **`mergeWithDefault`**: ao carregar uma ordem salva, o sistema reconcilia com `ALL_COLUMNS` — descarta chaves que não existem mais e adiciona no fim quaisquer colunas novas que foram criadas depois que o usuário salvou. Isso garante que **adicionar uma coluna nova no código nunca quebra** a preferência salva de quem já usava o produto.

> **Para mudar a ordem padrão para todos**: edite a ordem do array **`ALL_COLUMNS`** em `app/pipeline-details/page.tsx`. Mas atenção: usuários que já salvaram preferência continuarão vendo a ordem deles (localStorage). Para forçar a nova ordem, eles precisam usar "Resetar para original".

#### 3.9. Edição Individual (Modal de Quote)
- **Clicar numa linha/card** abre o modal de edição com os blocos: **Identificacao, Valores, Pipeline, Comentários**.
- Campos editáveis mostram um **ponto âmbar** quando alterados (diferença vs. valor salvo). Há confirmação ao salvar (`confirmEditSave`).
- **Stage + Credito Aprovado** ficam na mesma linha (2 colunas). Mudar o Stage ajusta a probabilidade sugerida automaticamente.
- **Mudar Stage para "Net Lost"** dispara um popup obrigatório (`netLostOpen`) pedindo **motivo + comentário** — não é possível concluir sem preencher os dois.
- **Comentários**: abas **Pipe Comments** (editável, rich text) e **Quote Comments** (read-only, com ícone de cadeado). Cada comentário salvo entra num histórico com autor e timestamp.

#### 3.10. Histórico, Versionamento e Undo
- **Versionamento de campo** (`recordVersion`): toda alteração individual ou em lote grava old/new value por campo, visível no histórico da quote.
- **Histórico de operações** (`addToHistory`): registra eventos (Edit, BulkEdit, Export, Undo) com status.
- **Undo** (`handleUndo`): a edição em lote empilha o estado anterior (até 9 níveis) e pode ser desfeita.

#### 3.11. Export CSV
- Botão de exportar gera um **CSV respeitando os filtros e a ordenação atuais** (`sortedQuotes`).
- O evento é registrado no histórico de operações. Headers em português.

#### 3.12. Paginação
- Select de tamanho de página (25/50/...) no topo; trocar reseta para a página 1.
- Rodapé mostra "Mostrando X–Y de Z registros" e, quando há seleção, "N selecionados para edicao em lote".

---

### **4. Multi-PN (Part Numbers múltiplos)**
Quotes podem ter vários Part Numbers separados por vírgula. A célula mostra o primeiro + um badge **"+N"**; o popover lista todos e oferece **"copiar todos"** (junta com `, `).

---

### **5. Tratamento do Stage "Pipelined"**
`Pipelined` **não é um estágio editável** nem uma coluna do Kanban. Ele existe apenas como **agrupador de filtro**: representa a soma de `Pricing 25%` + `Up Selling 50%` + `Committed 75%`. Por isso:
- Não aparece no select de Stage da edição (individual ou em lote).
- Não é coluna no Kanban.
- **Aparece** como opção no filtro de Stage e, quando selecionado, expande para os 3 estágios reais.

---

## 🔄 Fluxo de Dados

### **Origem dos Dados**
```
mock-store.ts (gerador)
  → generateMockQuotes() retorna array de 85 Quote[]
  → armazenado em estado React (primaryQuotes)
  → filtrado por filterState (Identificacao, Classificacao, Valores, Flags)
  → renderizado em Dashboard / Manager / Details
```

### **Mutações**
- Edição de quote → atualiza estado local (`editingQuote`)
- Clique "Salvar" → commit no array principal (mock, ou seria DB depois)
- Multiedição → aplica a todos os IDs selecionados

### **Cálculos Derivados**
```typescript
// Dashboard KPIs (calculados via useMemo)
const totalPipeline = primaryQuotes.reduce((s, q) => s + q.usd_value, 0);
const notClassifiedCount = primaryQuotes.filter(q => q.stage === 'Not Classified').length;
const avgGm = (totalGm / quoteCount) * 100; // Margem média
const winRate = (committedCount / totalCount) * 100;
```

---

## 🎨 Convenções de Código

### **TypeScript**
- Imports: sempre tipadas com `interface` ou `type`
- Campos de Quote: snake_case (ex: `part_no`, `usd_value`)
- Props de componentes: camelCase
- Estados: `useState<Type>(initialValue)`

### **Tailwind CSS**
- Design tokens em `/globals.css` (variáveis CSS customizadas)
- Cores: uso de tokens via `bg-background`, `text-foreground`, etc
- Spacing: escala padrão (p-4, gap-6, etc)
- Responsividade: `md:`, `lg:` prefixes
- Bordas de Stage: `border-l-{color}-400`

### **Componentes React**
```typescript
// Padrão: componente funcional com props tipadas
interface MyComponentProps {
  quote: Quote;
  onSave: (updated: Quote) => void;
  isEditing?: boolean;
}

export function MyComponent({ quote, onSave, isEditing = false }: MyComponentProps) {
  const [state, setState] = useState<Type>(initial);
  // ...
  return <div>{/* ... */}</div>;
}
```

### **Hooks Customizados**
- `useExport()`: retorna função `exportToCSV(quotes, fields)`
- Estado compartilhado: `useContext` ou props drilling (conforme scale)

---

## 🚀 Próximos Passos

### **Curto Prazo** (MVP funcional)
- [ ] Integração com banco de dados real (Supabase/Neon, não mock)
- [ ] Autenticação (Login de usuários)
- [ ] Validação de entrada (form fields, ranges de valores)
- [ ] Testes unitários (Quote, filtros, cálculos)

### **Médio Prazo**
- [ ] Permissões por usuário (RLS — Row Level Security)
- [ ] Histórico de alterações (audit log)
- [ ] Notificações em tempo real (quote close date próximo, stage mudou)
- [ ] Integração com sistemas externos (CRM, ERP)

### **Longo Prazo**
- [ ] Inteligência Artificial (previsão de probabilidade, recomendações)
- [ ] Mobile app (React Native)
- [ ] Webhooks e APIs públicas

---

## 🗄️ Mapeamento de Campos para Banco de Dados

A aplicação atualmente usa **mock data** em memória. Quando integrar com o **BI Pipeline (DEV_NORMALIZED.FACT_PIPELINE)**, use o mapeamento abaixo:

| Campo Frontend | Coluna BI / DB | Editável? | Status |
|---|---|---|---|
| **IDENTIFICACAO** | | | |
| cpo_id | CPO_ID | Não | ✅ Mapeado |
| status | CPO_STATUS | Não | ✅ Mapeado |
| vpc_code | VPC_CODE | Não | ✅ Mapeado |
| part_no | SKU_NO ou PART_NO | Não | ✅ Mapeado |
| description | ? | Não | ⚠️ Indefinido |
| **CLASSIFICACAO** | | | |
| sales_territory | SALES_TERR | Não | ✅ Mapeado |
| team | ? | n/a | ⚠️ Indefinido |
| vendor | VEND_NO | Não | ✅ Mapeado |
| master_customer | CPO_CUST_NO | Não | ✅ Mapeado |
| bill_to | SOLD_TO_MASTER_ACC | Não | ✅ Mapeado |
| end_user | END_USER | Não | ✅ Mapeado |
| prod_type | ? | Não | ⚠️ Indefinido |
| **VALORES FINANCEIROS** | | | |
| usd_value (CIF) | ? | Não | ⚠️ Indefinido |
| net_value (NET) | SO_NET_PRICE | Não | ✅ Mapeado |
| fob_value (FOB) | CPO_UNIT_COST | Não | ✅ Mapeado |
| gm_pct (GM%) | CPO_GM_PERCENT | Não | ✅ Mapeado |
| cpo_qty | CPO_LINE_QTY | Não | ✅ Mapeado |
| **DATAS** | | | |
| created_date | CPO_DATE | Não | ✅ Mapeado |
| close_date | CLOSE_DATE | Não | ✅ Mapeado |
| **PIPELINE & STAGE** | | | |
| stage | PROBABILITY (Range) | Sim | ✅ Mapeado |
| probability | PROBABILITY | Sim | ✅ Mapeado |
| lost_reason | ? | Sim | ⚠️ Indefinido |
| **COMERCIAL** | | | |
| cpo_no | CPO_NO | Não | ✅ Mapeado |
| cpo_pay_meth | CPO_PAY_METH | Não | ✅ Mapeado |
| pay_meth_name | ? | Não | ⚠️ Indefinido |
| opportunity | OPPORTUNITY_NAME | Não | ✅ Mapeado |
| renew | NEW_RENEW | Sim | ✅ Mapeado |
| is_engineering_ticket | ? | Sim | ⚠️ Indefinido |
| **COMENTARIOS** | | | |
| pipe_comments | ? | Sim | ⚠️ Indefinido |
| quote_comments | ? | Sim | ⚠️ Indefinido |
| **OUTROS** | | | |
| hts_code | HTS_CODE | n/a | ✅ Mapeado |
| hts_description | ? | n/a | ⚠️ Indefinido |

**Legenda**:
- ✅ **Mapeado**: Campo tem origem clara no BI/DB
- ⚠️ **Indefinido**: Campo com `?` — necessário confirmar origem ou criar novo field no BI
- **Editável**: Sim = pode ser alterado pelo usuário; Não = read-only; n/a = não aplica (ex: HTS)

**Próximas ações**:
1. Confirmar origem dos campos marcados com `?`
2. Ajustar query SQL para trazer todos os 30+ campos
3. Implementar transformação BI → tipos TypeScript do frontend
4. Migrar mock-store.ts para usar dados reais do BI

---

## 📝 Notas Importantes

### **Multi-PN Handling**
Quotes podem ter múltiplos Part Numbers separados por vírgula:
```typescript
const parts = (quote.part_no ?? '').split(',').map(s => s.trim()).filter(Boolean);
// parts = ['NX-10000', 'HP-20000', 'DL-30000']

// Popover mostra todos + "copiar todos" (copia com separador ", ")
```

### **Filtros Colapsiveis**
Seções do painel avançado abrem/fecham via estado `filterSections`:
```typescript
const [filterSections, setFilterSections] = useState({
  identificacao: true,
  classificacao: true,
  valores: true,
  flags: true
});
```

### **Quote Comments Read-Only**
Preenchido automaticamente pelo sistema, com ícone de cadeado (Lock) para indicar que não é editável.

### **Stages e Probabilidade**
Cada stage tem uma probabilidade associada (não configurável por usuário):
- Not Classified: 0%
- Pipelined: 20% *(agrupador virtual — ver abaixo)*
- Pricing 25%: 40%
- Up Selling 50%: 60%
- Committed 75%: 80%
- Net Lost: 0%

> **Pipelined não é um stage editável**: é um agrupador de filtro que representa `Pricing 25%` + `Up Selling 50%` + `Committed 75%`. Não aparece no select de edição nem como coluna do Kanban — apenas no filtro de Stage (onde expande para os 3 estágios reais).

### **Reordenamento de Colunas (chaves localStorage)**
- `pipeline-col-order` → ordem atual de trabalho (atualizada a cada arraste).
- `pipeline-col-order-preferred` → "ordem preferencial" salva pelo usuário; tem prioridade no carregamento.
- A ordem de fábrica vem de `ALL_COLUMNS` em `app/pipeline-details/page.tsx`. `mergeWithDefault` reconcilia preferências salvas com novas colunas adicionadas no código.

---

## 🚀 Getting Started (para dev)

```bash
# Instalar dependências
pnpm install

# Rodar dev server
pnpm dev

# Abrir browser
open http://localhost:3000
```

---

## 📞 Dúvidas & Suporte

- **Pipeline Details (tela principal, todas as features)**: `app/pipeline-details/page.tsx`
- **Dashboard**: `app/dashboard/page.tsx`
- **Pipeline Manager**: `app/pipeline-manager/page.tsx`
- **Estrutura de dados**: Consultar `/types/index.ts`
- **Geração de dados mockados**: Consultar `/lib/mock-store.ts`
- **Design tokens**: Consultar `/globals.css`

---

**Última atualização**: Jun 2026 | **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
