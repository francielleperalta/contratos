const STORAGE_KEY = 'contratos-editaveis-v1';
let contratos = [];
let contratoEmEdicao = null;

const el = {
  tbody: document.getElementById('tbodyContratos'),
  tRow: document.getElementById('rowTemplate'),
  busca: document.getElementById('fBusca'),
  unid: document.getElementById('fUnidade'),
  status: document.getElementById('fStatus'),
  btnLimpar: document.getElementById('btnLimpar'),
  btnNovo: document.getElementById('btnNovo'),
  btnExportar: document.getElementById('btnExportar'),
  inputImportar: document.getElementById('inputImportar'),
  modal: document.getElementById('modalContrato'),
  form: document.getElementById('formContrato'),
  tituloModal: document.getElementById('tituloModal'),
  btnFechar: document.getElementById('btnFechar'),
  btnCancelar: document.getElementById('btnCancelar'),
  btnExcluir: document.getElementById('btnExcluir'),
  kpiTotal: document.getElementById('kpiTotal'),
  kpiUrgente: document.getElementById('kpiUrgente'),
  kpiVencido: document.getElementById('kpiVencido'),
  kpiValor: document.getElementById('kpiValor'),
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const today = () => new Date().toISOString().slice(0,10);

function calcularStatus(data) {
  if (!data) return 'Sem data';
  const hoje = new Date(today() + 'T00:00:00');
  const fim = new Date(data + 'T00:00:00');
  const diff = Math.ceil((fim - hoje) / 86400000);
  if (Number.isNaN(diff)) return 'Sem data';
  if (diff < 0) return 'Vencido';
  if (diff <= 15) return 'Urgente';
  if (diff <= 30) return 'Atenção';
  return 'Normal';
}

function persistir() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contratos));
}

async function carregarBaseInicial() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (salvo) {
    contratos = JSON.parse(salvo);
    return;
  }
  const resp = await fetch('contratos.json');
  contratos = await resp.json();
  persistir();
}

function preencherFiltroUnidade() {
  const unidades = [...new Set(contratos.map(c => c.unidade).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const current = el.unid.value;
  el.unid.innerHTML = '<option value="">Todas as unidades</option>';
  unidades.forEach(u => {
    const op = document.createElement('option');
    op.value = u; op.textContent = u;
    el.unid.appendChild(op);
  });
  el.unid.value = current;
}

function filtrarDados() {
  const q = el.busca.value.trim().toLowerCase();
  const un = el.unid.value;
  const st = el.status.value;
  return contratos.filter(c => {
    const status = calcularStatus(c.dataFimVigencia);
    const txt = [c.id, c.numeroContrato, c.empresa, c.processoSei, c.objeto].join(' ').toLowerCase();
    return (!q || txt.includes(q)) && (!un || c.unidade === un) && (!st || status === st);
  });
}

function atualizarKPIs(lista) {
  const urg = lista.filter(c => ['Urgente','Atenção'].includes(calcularStatus(c.dataFimVigencia))).length;
  const venc = lista.filter(c => calcularStatus(c.dataFimVigencia) === 'Vencido').length;
  const tot = lista.reduce((s,c) => s + (Number(c.valorTotal)||0), 0);
  el.kpiTotal.textContent = String(lista.length);
  el.kpiUrgente.textContent = String(urg);
  el.kpiVencido.textContent = String(venc);
  el.kpiValor.textContent = money.format(tot);
}

function render() {
  const lista = filtrarDados();
  el.tbody.innerHTML = '';
  atualizarKPIs(lista);
  lista.forEach(c => {
    const row = el.tRow.content.firstElementChild.cloneNode(true);
    row.querySelector('[data-k="id"]').textContent = c.id || '';
    row.querySelector('[data-k="numeroContrato"]').textContent = c.numeroContrato || '-';
    row.querySelector('[data-k="empresa"]').textContent = c.empresa || '-';
    row.querySelector('[data-k="unidade"]').textContent = c.unidade || '-';
    row.querySelector('[data-k="dataFimVigencia"]').textContent = c.dataFimVigencia || '-';
    const status = calcularStatus(c.dataFimVigencia);
    const tdStatus = row.querySelector('[data-k="status"]');
    tdStatus.textContent = status;
    tdStatus.className = 'status ' + status.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g,'-');
    row.querySelector('[data-k="valorTotal"]').textContent = c.valorTotal ? money.format(Number(c.valorTotal)) : '-';
    row.querySelector('[data-k="faseAtual"]').textContent = c.faseAtual || '-';
    row.querySelector('[data-action="edit"]').addEventListener('click', () => abrirModal(c.id));
    el.tbody.appendChild(row);
  });
}

function abrirModal(id = null) {
  contratoEmEdicao = id;
  el.form.reset();
  const isEdit = !!id;
  el.tituloModal.textContent = isEdit ? 'Editar contrato' : 'Novo contrato';
  el.btnExcluir.classList.toggle('hidden', !isEdit);
  const base = isEdit ? contratos.find(c => c.id === id) : { id: gerarNovoId(), origemAba: 'Cadastro manual' };
  Object.entries(base).forEach(([k,v]) => {
    if (el.form.elements[k]) el.form.elements[k].value = v ?? '';
  });
  el.modal.showModal();
}

function fecharModal() {
  el.modal.close();
  contratoEmEdicao = null;
}

function gerarNovoId() {
  const nums = contratos.map(c => Number(String(c.id || '').replace(/\D/g,''))).filter(Boolean);
  const next = (Math.max(0, ...nums) + 1).toString().padStart(4, '0');
  return `CTR-${next}`;
}

function salvarContrato(ev) {
  ev.preventDefault();
  const fd = new FormData(el.form);
  const data = Object.fromEntries(fd.entries());
  data.valorTotal = data.valorTotal ? Number(data.valorTotal) : null;
  if (contratoEmEdicao) {
    contratos = contratos.map(c => c.id === contratoEmEdicao ? { ...c, ...data } : c);
  } else {
    contratos.unshift(data);
  }
  persistir();
  preencherFiltroUnidade();
  render();
  fecharModal();
}

function excluirContrato() {
  if (!contratoEmEdicao) return;
  const ok = confirm('Deseja excluir este contrato?');
  if (!ok) return;
  contratos = contratos.filter(c => c.id !== contratoEmEdicao);
  persistir();
  preencherFiltroUnidade();
  render();
  fecharModal();
}

function exportarJson() {
  const blob = new Blob([JSON.stringify(contratos, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'contratos-editados.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importarJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const dados = JSON.parse(reader.result);
      if (!Array.isArray(dados)) throw new Error('Arquivo inválido');
      contratos = dados;
      persistir();
      preencherFiltroUnidade();
      render();
      alert('Importação concluída com sucesso.');
    } catch (e) {
      alert('Não foi possível importar o JSON.');
    }
  };
  reader.readAsText(file, 'utf-8');
}

el.busca.addEventListener('input', render);
el.unid.addEventListener('change', render);
el.status.addEventListener('change', render);
el.btnLimpar.addEventListener('click', () => { el.busca.value=''; el.unid.value=''; el.status.value=''; render(); });
el.btnNovo.addEventListener('click', () => abrirModal());
el.btnFechar.addEventListener('click', fecharModal);
el.btnCancelar.addEventListener('click', fecharModal);
el.form.addEventListener('submit', salvarContrato);
el.btnExcluir.addEventListener('click', excluirContrato);
el.btnExportar.addEventListener('click', exportarJson);
el.inputImportar.addEventListener('change', (e) => { if (e.target.files[0]) importarJson(e.target.files[0]); });

document.querySelector('.btn-file').addEventListener('click', () => el.inputImportar.click());

await carregarBaseInicial();
preencherFiltroUnidade();
render();
