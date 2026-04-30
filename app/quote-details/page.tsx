'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/breadcrumbs-tooltips';
import { addQuote } from '@/lib/mock-store';
import { useTour } from '@/hooks/useTour';
import { TourOverlay } from '@/components/common/tour-overlay';

const VENDORS_LIST = ['Cisco', 'HPE', 'Dell', 'Lenovo'];
const TERRITORIES_LIST = ['Sao Paulo', 'Rio de Janeiro', 'Minas Gerais'];
const BU_LIST = ['BU Storage', 'BU Network', 'BU Compute'];
const STAGES_LIST = ['Pipelined', 'Pricing 25%', 'Up Selling 50%', 'Committed 75%', 'Net Lost'];
const REVENDA_LIST = ['Revenda A', 'Revenda B', 'Revenda C', 'Revenda D', 'Revenda E'];
const STATUS_GROUPS = {
  'Virou Pedido': ['BACKORDER', 'BOSOSPLIT', 'CONVERTOK', 'PARTIALBO', 'SALESORDER', 'TERMSFIX'],
  'Quote Ativa':  ['QUOTEPO', 'QUOTESHEET', 'READYAF', 'POCHANGE', 'POLINEQC'],
  'Quote Cancelada': ['CANCELLED'],
};

const EMPTY_FORM = {
  cpo_id: '',
  part_no: '',
  sales_territory: '',
  team: '',
  vendor: '',
  master_customer: '',
  end_user: '',
  description: '',
  quote_name: '',
  quote_number: '',
  stage: '',
  probability: '',
  usd_value: '',
  budgetary: '',
  close_date: '',
  bu: '',
  status: '',
};

type FormState = typeof EMPTY_FORM;
type Errors = Partial<Record<keyof FormState, string>>;

const REQUIRED: (keyof FormState)[] = ['cpo_id', 'quote_name', 'vendor', 'stage', 'usd_value', 'close_date', 'status'];

function validate(form: FormState): Errors {
  const errs: Errors = {};
  for (const k of REQUIRED) {
    if (!form[k]) errs[k] = 'Campo obrigatorio';
  }
  if (form.probability && (Number(form.probability) < 0 || Number(form.probability) > 100)) {
    errs.probability = '0 a 100';
  }
  return errs;
}

const lbl = 'block text-[11px] font-semibold text-gray-500 mb-1';
const inp = 'w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
const sel = `${inp} bg-gray-50`;
const errCls = 'border-red-400 focus:ring-red-400 focus:border-red-400';

const NEW_QUOTE_TOUR_STEPS = [
  { id: 'pipeline-group', selector: '[data-tour="group-pipeline"]', title: 'Grupo Pipeline', description: 'Stage e Status sao os campos mais importantes. Stage define o estagio comercial, Status define a situacao operacional do quote.', position: 'bottom' as const },
  { id: 'values-group', selector: '[data-tour="group-values"]', title: 'Grupo Valores', description: 'USD Value e obrigatorio. Probability e um numero de 0 a 100. Budget indica se o cliente tem orcamento aprovado.', position: 'bottom' as const },
  { id: 'classification-group', selector: '[data-tour="group-classification"]', title: 'Grupo Classificacao', description: 'Territory, Vendor, Revenda e End User identificam os envolvidos no negocio. BU indica a Business Unit responsavel.', position: 'bottom' as const },
  { id: 'required', selector: '[data-tour="submit-area"]', title: 'Campos Obrigatorios', description: 'Campos com * sao obrigatorios. Se algum estiver vazio ao salvar, o campo fica vermelho com mensagem de erro.', position: 'top' as const },
  { id: 'submit', selector: '[data-tour="submit-area"]', title: 'Salvar e Sincronizar', description: 'Ao salvar, a quote e adicionada ao mock store e aparece automaticamente na aba Details sem precisar recarregar a pagina.', position: 'top' as const },
];

export default function NewQuotePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const tour = useTour(NEW_QUOTE_TOUR_STEPS);

  const set = (k: keyof FormState, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    addQuote({
      cpo_id: form.cpo_id,
      part_no: form.part_no,
      sales_territory: form.sales_territory,
      team: form.team,
      vendor: form.vendor,
      master_customer: form.master_customer,
      end_user: form.end_user,
      description: form.description,
      quote_name: form.quote_name,
      quote_number: form.quote_number,
      stage: form.stage,
      probability: Number(form.probability) || 0,
      usd_value: Number(form.usd_value) || 0,
      budgetary: form.budgetary || 'No',
      close_date: form.close_date,
      bu: form.bu,
      status: form.status,
    });
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          <h2 className="text-lg font-bold text-gray-900">Quote criada com sucesso</h2>
          <p className="text-sm text-gray-500">A nova entrada foi adicionada ao topo da aba Details.</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setForm({ ...EMPTY_FORM }); setErrors({}); setSaved(false); }}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Criar outra
            </button>
            <button
              onClick={() => router.push('/pipeline-details')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Ver em Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
        <Breadcrumbs items={[{ label: 'New Quote' }]} />

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Quote</h1>
            <p className="text-sm text-gray-500 mt-0.5">Preencha os dados abaixo. Campos marcados com * sao obrigatorios.</p>
          </div>
          <button
            onClick={tour.startTour}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm shadow-sm shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
            Iniciar Tour
          </button>
        </div>


        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">

          {/* Identificacao */}
          <div data-tour="group-pipeline" className="px-6 py-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Identificacao</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>CPO ID *</label>
                <input type="text" placeholder="CPO-1001" value={form.cpo_id} onChange={e => set('cpo_id', e.target.value)} className={`${inp} ${errors.cpo_id ? errCls : ''}`} />
                {errors.cpo_id && <p className="text-[10px] text-red-500 mt-0.5">{errors.cpo_id}</p>}
              </div>
              <div>
                <label className={lbl}>Part No</label>
                <input type="text" placeholder="NX-10000" value={form.part_no} onChange={e => set('part_no', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Quote Name *</label>
                <input type="text" placeholder="QT-024000" value={form.quote_name} onChange={e => set('quote_name', e.target.value)} className={`${inp} ${errors.quote_name ? errCls : ''}`} />
                {errors.quote_name && <p className="text-[10px] text-red-500 mt-0.5">{errors.quote_name}</p>}
              </div>
              <div>
                <label className={lbl}>Quote Number</label>
                <input type="text" placeholder="QN-1001" value={form.quote_number} onChange={e => set('quote_number', e.target.value)} className={inp} />
              </div>
              <div className="md:col-span-2">
                <label className={lbl}>Descricao</label>
                <input type="text" placeholder="Descricao da solucao..." value={form.description} onChange={e => set('description', e.target.value)} className={inp} />
              </div>
            </div>
          </div>

          {/* Classificacao */}
          <div data-tour="group-classification" className="px-6 py-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Classificacao</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Vendor *</label>
                <select value={form.vendor} onChange={e => set('vendor', e.target.value)} className={`${sel} ${errors.vendor ? errCls : ''}`}>
                  <option value="">Selecione...</option>
                  {VENDORS_LIST.map(v => <option key={v}>{v}</option>)}
                </select>
                {errors.vendor && <p className="text-[10px] text-red-500 mt-0.5">{errors.vendor}</p>}
              </div>
              <div>
                <label className={lbl}>Territory</label>
                <select value={form.sales_territory} onChange={e => set('sales_territory', e.target.value)} className={sel}>
                  <option value="">Selecione...</option>
                  {TERRITORIES_LIST.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Revenda</label>
                <select value={form.master_customer} onChange={e => set('master_customer', e.target.value)} className={sel}>
                  <option value="">Selecione...</option>
                  {REVENDA_LIST.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>End User</label>
                <input type="text" placeholder="Nome do cliente final..." value={form.end_user} onChange={e => set('end_user', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>BU</label>
                <select value={form.bu} onChange={e => set('bu', e.target.value)} className={sel}>
                  <option value="">Selecione...</option>
                  {BU_LIST.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Team</label>
                <input type="text" placeholder="Nome do time..." value={form.team} onChange={e => set('team', e.target.value)} className={inp} />
              </div>
            </div>
          </div>

          {/* Stage e Valores */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Stage e Valores</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={lbl}>Stage *</label>
                <select value={form.stage} onChange={e => set('stage', e.target.value)} className={`${sel} ${errors.stage ? errCls : ''}`}>
                  <option value="">Selecione...</option>
                  {STAGES_LIST.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.stage && <p className="text-[10px] text-red-500 mt-0.5">{errors.stage}</p>}
              </div>
              <div>
                <label className={lbl}>Probabilidade (%)</label>
                <input type="number" min="0" max="100" placeholder="0" value={form.probability} onChange={e => set('probability', e.target.value)} className={`${inp} ${errors.probability ? errCls : ''}`} />
                {errors.probability && <p className="text-[10px] text-red-500 mt-0.5">{errors.probability}</p>}
              </div>
              <div>
                <label className={lbl}>USD Value *</label>
                <input type="number" placeholder="100000" value={form.usd_value} onChange={e => set('usd_value', e.target.value)} className={`${inp} ${errors.usd_value ? errCls : ''}`} />
                {errors.usd_value && <p className="text-[10px] text-red-500 mt-0.5">{errors.usd_value}</p>}
              </div>
              <div>
                <label className={lbl}>Budget</label>
                <select value={form.budgetary} onChange={e => set('budgetary', e.target.value)} className={sel}>
                  <option value="">Selecione...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data e Status */}
          <div data-tour="group-values" className="px-6 py-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Data e Status</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Close Date *</label>
                <input type="date" value={form.close_date} onChange={e => set('close_date', e.target.value)} className={`${inp} ${errors.close_date ? errCls : ''}`} />
                {errors.close_date && <p className="text-[10px] text-red-500 mt-0.5">{errors.close_date}</p>}
              </div>
              <div>
                <label className={lbl}>Status *</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className={`${sel} ${errors.status ? errCls : ''}`}>
                  <option value="">Selecione...</option>
                  {Object.entries(STATUS_GROUPS).map(([group, vals]) => (
                    <optgroup key={group} label={group}>
                      {vals.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  ))}
                </select>
                {errors.status && <p className="text-[10px] text-red-500 mt-0.5">{errors.status}</p>}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div data-tour="submit-area" className="flex items-center justify-end gap-2 pb-6">
          <button
            onClick={() => { setForm({ ...EMPTY_FORM }); setErrors({}); }}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition"
          >
            Limpar campos
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Salvar Quote
          </button>
        </div>
      </div>

      <TourOverlay
        isActive={tour.isTourActive}
        currentStep={tour.currentStep}
        steps={NEW_QUOTE_TOUR_STEPS}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onClose={tour.closeTour}
        totalSteps={tour.totalSteps}
      />
    </div>
  );
}
