import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function Modal({ titulo, aberto, onFechar, children, rodape, largo }: {
  titulo: ReactNode; aberto: boolean; onFechar: () => void; children: ReactNode; rodape?: ReactNode; largo?: boolean;
}) {
  useEffect(() => {
    if (!aberto) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className={`modal ${largo ? 'modal-largo' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-cab">
          <h3>{titulo}</h3>
          <button className="btn-icone" onClick={onFechar} aria-label="Fechar"><X size={20} /></button>
        </div>
        <div className="modal-corpo">{children}</div>
        {rodape && <div className="modal-rodape">{rodape}</div>}
      </div>
    </div>
  );
}

export function Campo({ rotulo, children, dica, span }: { rotulo: string; children: ReactNode; dica?: ReactNode; span?: 1 | 2 | 3 | 4 }) {
  return (
    <label className={`campo ${span ? 'span-' + span : ''}`}>
      <span className="campo-rotulo">{rotulo}</span>
      {children}
      {dica && <span className="campo-dica">{dica}</span>}
    </label>
  );
}

export function Chips<T extends string | number | boolean>({ opcoes, valor, onChange, permitirLimpar = true }: {
  opcoes: { v: T; r: string; tom?: 'ok' | 'alerta' | 'perigo' | 'neutro' }[];
  valor: T | undefined;
  onChange: (v: T | undefined) => void;
  permitirLimpar?: boolean;
}) {
  return (
    <div className="chips">
      {opcoes.map((o) => (
        <button
          type="button"
          key={String(o.v)}
          className={`chip ${valor === o.v ? 'ativo tom-' + (o.tom ?? 'neutro') : ''}`}
          onClick={() => onChange(valor === o.v && permitirLimpar ? undefined : o.v)}
        >
          {o.r}
        </button>
      ))}
    </div>
  );
}

export function Badge({ tom = 'neutro', children }: { tom?: 'ok' | 'alerta' | 'perigo' | 'neutro' | 'info' | 'roxo'; children: ReactNode }) {
  return <span className={`badge badge-${tom}`}>{children}</span>;
}

export function Vazio({ icone, titulo, texto, acao }: { icone?: ReactNode; titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <div className="vazio">
      {icone && <div className="vazio-icone">{icone}</div>}
      <strong>{titulo}</strong>
      {texto && <p>{texto}</p>}
      {acao}
    </div>
  );
}

// ───── Toasts
type Toast = { id: number; texto: string; tipo: 'ok' | 'erro' | 'info' };
const ToastCtx = createContext<(texto: string, tipo?: Toast['tipo']) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Toast[]>([]);
  const mostrar = useCallback((texto: string, tipo: Toast['tipo'] = 'ok') => {
    const id = Date.now() + Math.random();
    setLista((l) => [...l, { id, texto, tipo }]);
    setTimeout(() => setLista((l) => l.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={mostrar}>
      {children}
      <div className="toasts">
        {lista.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`}>
            {t.tipo === 'ok' ? <CheckCircle2 size={18} /> : t.tipo === 'erro' ? <AlertTriangle size={18} /> : <Info size={18} />}
            {t.texto}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

export function Abas<T extends string>({ abas, ativa, onChange }: { abas: { id: T; rotulo: string; icone?: ReactNode; contador?: number }[]; ativa: T; onChange: (t: T) => void }) {
  return (
    <div className="abas" role="tablist">
      {abas.map((a) => (
        <button key={a.id} role="tab" aria-selected={ativa === a.id} className={`aba ${ativa === a.id ? 'ativa' : ''}`} onClick={() => onChange(a.id)}>
          {a.icone}
          <span>{a.rotulo}</span>
          {!!a.contador && <span className="aba-contador">{a.contador}</span>}
        </button>
      ))}
    </div>
  );
}

export function Stat({ rotulo, valor, icone, tom = 'neutro', onClick }: { rotulo: string; valor: ReactNode; icone: ReactNode; tom?: 'ok' | 'alerta' | 'perigo' | 'neutro' | 'info'; onClick?: () => void }) {
  return (
    <button type="button" className={`stat stat-${tom}`} onClick={onClick} disabled={!onClick}>
      <div className="stat-icone">{icone}</div>
      <div>
        <div className="stat-valor">{valor}</div>
        <div className="stat-rotulo">{rotulo}</div>
      </div>
    </button>
  );
}
