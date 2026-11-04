export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function fmtData(iso?: string | Date) {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString('pt-BR');
}

export function fmtHora(iso?: string | Date) {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDataHora(iso?: string | Date) {
  if (!iso) return '—';
  return `${fmtData(iso)} ${fmtHora(iso)}`;
}

export function diasInternado(entrada: string, ate: Date = new Date()) {
  const ms = ate.getTime() - new Date(entrada).getTime();
  return Math.max(0, Math.floor(ms / 86400_000));
}

export function tempoInternado(entrada: string, ate: Date = new Date()) {
  const ms = Math.max(0, ate.getTime() - new Date(entrada).getTime());
  const d = Math.floor(ms / 86400_000);
  const h = Math.floor((ms % 86400_000) / 3600_000);
  if (d === 0) return `${h} h`;
  return `${d} d ${h} h`;
}

/** Valor para <input type="datetime-local"> */
export function toLocalInput(d: Date | string = new Date()) {
  const x = typeof d === 'string' ? new Date(d) : d;
  const off = x.getTimezoneOffset();
  return new Date(x.getTime() - off * 60_000).toISOString().slice(0, 16);
}

export function fromLocalInput(v: string) {
  return new Date(v).toISOString();
}

export function toDateInput(d: Date | string = new Date()) {
  return toLocalInput(d).slice(0, 10);
}

export function inicioDoDia(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function fimDoDia(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function relativo(d: Date, agora = new Date()) {
  const min = Math.round((d.getTime() - agora.getTime()) / 60_000);
  const abs = Math.abs(min);
  const txt = abs < 60 ? `${abs} min` : abs < 1440 ? `${Math.floor(abs / 60)} h ${abs % 60 ? (abs % 60) + ' min' : ''}`.trim() : `${Math.floor(abs / 1440)} d`;
  if (abs < 1) return 'agora';
  return min > 0 ? `em ${txt}` : `há ${txt}`;
}

export function soDigitos(s: string) {
  return (s || '').replace(/\D/g, '');
}

export function linkWhatsApp(telefone: string, texto: string) {
  let n = soDigitos(telefone);
  if (n && n.length <= 11) n = '55' + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

export const especieRotulo = (e: string) => (e === 'canina' ? 'Canino' : 'Felino');
export const sexoRotulo = (s: string, castrado?: boolean) =>
  (s === 'macho' ? 'Macho' : 'Fêmea') + (castrado ? (s === 'macho' ? ' castrado' : ' castrada') : '');
