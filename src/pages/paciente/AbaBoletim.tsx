import { useEffect, useState } from 'react';
import { RefreshCw, Copy, Printer, Save, MessageCircle, FileText, Trash2 } from 'lucide-react';
import type { Paciente } from '../../types';
import { useStore } from '../../store';
import { Campo, Chips, Badge, useToast } from '../../components/ui';
import { gerarBoletim, OPCOES_PADRAO, type OpcoesBoletim } from '../../utils/boletim';
import { fmtDataHora, linkWhatsApp, uid } from '../../utils/format';
import { imprimirDocumento, textoParaHtml } from '../../utils/imprimir';

const ESTADOS = [
  'estável, alimentando-se e respondendo bem ao tratamento',
  'estável e apresentando melhora clínica progressiva',
  'estável, porém ainda requer cuidados e monitoramento',
  'em estado delicado, sob monitoramento intensivo',
  'em estado grave, recebendo todos os cuidados intensivos necessários',
];

export default function AbaBoletim({ p }: { p: Paciente }) {
  const { db, atualizarPaciente } = useStore();
  const toast = useToast();
  const [o, setO] = useState<OpcoesBoletim>(OPCOES_PADRAO);
  const [texto, setTexto] = useState('');
  const [editado, setEditado] = useState(false);
  const setOp = <K extends keyof OpcoesBoletim>(k: K, v: OpcoesBoletim[K]) => setO((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    if (!editado) setTexto(gerarBoletim(p, db.config, o));
  }, [p, db.config, o, editado]);

  const regenerar = () => { setEditado(false); setTexto(gerarBoletim(p, db.config, o)); };

  const salvarHistorico = (enviado = false) => {
    atualizarPaciente(p.id, (x) => { x.boletins.push({ id: uid(), dataHora: new Date().toISOString(), texto, autor: db.usuarioAtual, enviado }); });
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      toast('Boletim copiado — cole no WhatsApp ou e-mail');
    } catch {
      toast('Não foi possível copiar automaticamente', 'erro');
    }
  };

  const whatsapp = () => {
    if (!p.tutor.telefone) return toast('Cadastre o telefone do tutor', 'erro');
    salvarHistorico(true);
    window.open(linkWhatsApp(p.tutor.telefone, texto), '_blank');
  };

  const imprimir = () => imprimirDocumento(`Boletim — ${p.nome}`, `<h2>Boletim médico</h2><div>${textoParaHtml(texto)}</div>`, db.config);

  const historico = [...p.boletins].sort((a, b) => b.dataHora.localeCompare(a.dataHora));

  return (
    <div className="aba-conteudo">
      <div className="secao-cab"><h2>Boletim médico para o tutor</h2></div>
      <div className="boletim-layout">
        <div className="cartao boletim-opcoes">
          <h3 className="cartao-titulo">Como o paciente está?</h3>
          <div className="estados">
            {ESTADOS.map((e) => (
              <button key={e} type="button" className={`chip chip-bloco ${o.estadoGeral === e ? 'ativo tom-info' : ''}`} onClick={() => { setEditado(false); setOp('estadoGeral', o.estadoGeral === e ? '' : e); }}>{e.charAt(0).toUpperCase() + e.slice(1)}</button>
            ))}
          </div>
          <Campo rotulo="Período considerado">
            <Chips<number> permitirLimpar={false} valor={o.periodoHoras} onChange={(v) => { setEditado(false); setOp('periodoHoras', v ?? 24); }} opcoes={[{ v: 6, r: '6 h' }, { v: 12, r: '12 h' }, { v: 24, r: '24 h' }, { v: 48, r: '48 h' }]} />
          </Campo>
          <div className="lista-checks">
            <label className="check"><input type="checkbox" checked={o.incluirParametros} onChange={(e) => { setEditado(false); setOp('incluirParametros', e.target.checked); }} /> Incluir parâmetros vitais</label>
            <label className="check"><input type="checkbox" checked={o.incluirMedicacoes} onChange={(e) => { setEditado(false); setOp('incluirMedicacoes', e.target.checked); }} /> Incluir tratamento</label>
            {o.incluirMedicacoes && <label className="check sub-check"><input type="checkbox" checked={o.nomesMedicacoes} onChange={(e) => { setEditado(false); setOp('nomesMedicacoes', e.target.checked); }} /> Mostrar nomes das medicações</label>}
            <label className="check"><input type="checkbox" checked={o.incluirFluido} onChange={(e) => { setEditado(false); setOp('incluirFluido', e.target.checked); }} /> Incluir fluidoterapia</label>
            <label className="check"><input type="checkbox" checked={o.incluirAltaPrevista} onChange={(e) => { setEditado(false); setOp('incluirAltaPrevista', e.target.checked); }} /> Incluir previsão de alta</label>
          </div>
          <Campo rotulo="Observações do veterinário">
            <textarea rows={4} value={o.observacao} onChange={(e) => { setEditado(false); setOp('observacao', e.target.value); }} placeholder="Ex.: Os exames de hoje mostraram melhora. Liberamos visita amanhã às 15h." />
          </Campo>
        </div>

        <div className="cartao boletim-previa">
          <div className="secao-cab">
            <h3 className="cartao-titulo">Prévia {editado && <Badge tom="alerta">editado manualmente</Badge>}</h3>
            <button className="btn btn-sm btn-fantasma" onClick={regenerar}><RefreshCw size={14} /> Regerar</button>
          </div>
          <textarea className="boletim-texto" value={texto} onChange={(e) => { setTexto(e.target.value); setEditado(true); }} />
          <div className="boletim-acoes">
            <button className="btn btn-whats" onClick={whatsapp}><MessageCircle size={18} /> Enviar no WhatsApp</button>
            <button className="btn btn-secundario" onClick={copiar}><Copy size={16} /> Copiar</button>
            <button className="btn btn-secundario" onClick={imprimir}><Printer size={16} /> Imprimir / PDF</button>
            <button className="btn btn-secundario" onClick={() => { salvarHistorico(); toast('Boletim salvo no histórico'); }}><Save size={16} /> Salvar</button>
          </div>
          <small className="muted">Enviando para: {p.tutor.nome} • {p.tutor.telefone || 'sem telefone'}</small>
        </div>
      </div>

      {historico.length > 0 && (
        <>
          <h3 className="mt">Boletins emitidos</h3>
          <div className="cartao lista-simples">
            {historico.map((b) => (
              <details key={b.id} className="item-boletim">
                <summary>
                  <FileText size={16} /> <b>{fmtDataHora(b.dataHora)}</b> — {b.autor} {b.enviado && <Badge tom="ok">Enviado</Badge>}
                  <button className="btn-icone perigo" onClick={(e) => { e.preventDefault(); atualizarPaciente(p.id, (x) => { x.boletins = x.boletins.filter((i) => i.id !== b.id); }); }}><Trash2 size={14} /></button>
                </summary>
                <pre>{b.texto}</pre>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
