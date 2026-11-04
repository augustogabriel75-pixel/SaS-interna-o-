import type { Config } from '../types';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function textoParaHtml(t: string) {
  return esc(t)
    .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
    .replace(/_([^_\n]+)_/g, '<i>$1</i>')
    .replace(/\n/g, '<br>');
}

/** Abre uma janela com cabeçalho da clínica e dispara a impressão / salvar em PDF */
export function imprimirDocumento(titulo: string, corpoHtml: string, cfg: Config) {
  const w = window.open('', '_blank', 'width=820,height=1000');
  if (!w) {
    alert('Permita pop-ups para imprimir.');
    return;
  }
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)}</title>
<style>
  *{box-sizing:border-box} body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;margin:0;padding:32px 40px;font-size:13.5px;line-height:1.55}
  header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #0f766e;padding-bottom:12px;margin-bottom:20px}
  header h1{margin:0;font-size:20px;color:#0f766e} header small{color:#475569;display:block}
  h2{font-size:16px;margin:0 0 12px;text-transform:uppercase;letter-spacing:.04em}
  h3{font-size:13.5px;margin:18px 0 6px;color:#0f766e;text-transform:uppercase}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid #cbd5e1;padding:5px 7px;text-align:left;font-size:12.5px;vertical-align:top} th{background:#f1f5f9}
  .grade{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px}
  .assin{margin-top:60px;text-align:center} .assin div{border-top:1px solid #0f172a;width:280px;margin:0 auto;padding-top:4px}
  footer{margin-top:30px;color:#64748b;font-size:11px;text-align:center}
  @media print{body{padding:12mm}}
</style></head><body>
<header><div><h1>${esc(cfg.clinica)}</h1><small>${esc(cfg.endereco)}</small><small>${esc(cfg.telefone)}</small></div><small>Emitido em ${new Date().toLocaleString('pt-BR')}</small></header>
${corpoHtml}
<footer>Documento gerado pelo sistema VetInterna</footer>
<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
</body></html>`);
  w.document.close();
}
