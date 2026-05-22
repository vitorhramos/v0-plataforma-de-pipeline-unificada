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

## 🎯 Features & Comportamentos

### **1. Dashboard Executivo** (`/dashboard`)
- **KPIs em tempo real**: Total Pipeline, Not Classified, High Prob (75%), Lost Value, Avg CIF, Win Rate, Cenários Alternativos
- **Gráficos**: Distribuição de Stages (últimos 6 meses), Cenários por Probabilidade, Top Revendas, Top Fornecedores, Território
- **Filtros**: Territory, Revenda, Stage, Vendor, End User, Prod Type, datas
- **Comportamento**: KPIs atualizados em tempo real conforme filtros aplicados

### **2. Pipeline Manager (Kanban/Tabela)** (`/pipeline-manager`)
- **Visão Kanban**: Colunas por Stage (Not Classified, Pipelined, Pricing 25%, etc). Cards draggable entre stages
- **Visão Tabela**: Mesmos dados em grid com colunas: CPO ID, Status, Part No, CIF, GM%, Stage, etc
- **Multiedição**: Botão "Editar em Lote" permite alterar campo(s) em múltiplos cards/linhas de uma vez
- **Comportamento**: Arrastar card de stage = atualiza stage + probability. Edição em lote = aplica a múltiplos registros

### **3. Pipeline Details (Tabela Completa)** (`/pipeline-details`)
- **Tabela de 15+ colunas**: CPO ID, Status, Part No (multi-PN com popover "copiar todos"), CIF, NET, FOB, GM%, Stage, Lost, Created Date, Close Date, etc
- **Filtros Avançados Colapsiveis**: 
  - **Identificacao**: CPO ID, Part No, Quote Name
  - **Classificacao**: Territory, Revenda, Stage, Vendor, End User, Prod Type
  - **Valores, Datas e Idade**: CIF (USD), GM%, Age (dias), Close Date, Created Date
  - **Flags**: Renew (Yes/No), Eng. Ticket (Yes/No)
- **Edição Individual**: Clique no card → modal com todos os 30+ campos editáveis
- **Comportamento**: Filtros abrem/fecham (seções colapsiveis). Part No com +N → popover com lista + "copiar todos". Quote Comments é read-only com ícone de cadeado

### **4. Card Modal (Edição de Quote)**
- **Abas**: Pipe Comments (editável) | Quote Comments (read-only com lock icon)
- **Secções**: Identificacao, Valores, Pipeline, Comentários
- **Comportamento**: Salva alterações, exibe "alterações não salvas" se houver mudanças não commitadas

### **5. Grupo de Cenários Modal** (`Criar Grupo de Cenários`)
- **Input**: Nome da oportunidade (ex: "Expansão Datacenter Cliente X")
- **Select**: Probabilidade (Mais Provável, Alternativo, Menos Provável)
- **Entrada**: Adiciona múltiplos CPOs com labels customizados
- **Comportamento**: Agrupa quotes em um cenário com probabilidade compartilhada

### **6. Export CSV**
- **Botão**: "Editar Campo..." → select de quais colunas exportar
- **Dados**: 31 campos (CPO ID até Eng. Ticket), respeitando filtros aplicados
- **Formato**: CSV com headers em português

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
- Pipelined: 20%
- Pricing 25%: 40%
- Up Selling 50%: 60%
- Committed 75%: 80%
- Net Lost: 0%

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

- **Estrutura de dados**: Consultar `/types/index.ts`
- **Geração de dados mockados**: Consultar `/lib/mock-store.ts`
- **Lógica de Dashboard**: Consultar `/components/dashboard.tsx`
- **Design tokens**: Consultar `/globals.css`

---

**Última atualização**: Mai 2026 | **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
