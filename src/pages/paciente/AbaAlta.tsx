import { useState } from 'react';
import { LogOut, Printer, RotateCcw, Wand2, MessageCircle } from 'lucide-react';
import type { Paciente, StatusInternacao } from '../../types';
import { useStore, nomeBox, assinatura } from '../../store';
import { Campo, Chips, useToast, useConfirmar, PODE_IMPRIMIR } from '../../components/ui';
import { fmtData, fmtDataHora, toLocalInput, fromLocalInput, toDateInput, especieRotulo, sexoRotulo, diasInternado, linkWhatsApp } from '../../utils/format';
import { rotuloFrequencia } from '../../data/medicamentos';
import { textoQuantidade } from '../../utils/calc';
import { imprimirDocumento, textoParaHtml } from '../../utils/imprimir';

const ORIENTACOES = [
  'Manter o animal em ambiente tranquilo, limpo e arejado.',
  'Oferecer água fresca à vontade.',
  'Oferecer alimentação em pequenas porções, várias vezes ao dia.',
  'Manter o colar elizabetano até a retirada dos pontos.',
  'Limpar a ferida cirúrgica 2x ao dia com soro fisiológico.',
  'Restringir exercícios e evitar que suba/desça escadas ou móveis.',
  'Retornar imediatamente se apresentar vômito, diarreia, apatia, falta de apetite ou dificuldade respiratória.',
  'Administrar as medicações nos horários indicados, sem interromper o tratamento antes do prazo.',
];

export default function AbaAlta({ p }: { p: Paciente }) {
  const { db, atualizarPaciente } = useStore();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [f, setF] = useState(() => ({
    tipo: (p.alta?.tipo ?? 'alta') as StatusInternacao,
    data: toLocalInput(p.alta?.data ?? new Date()),
    condicao: p.alta?.condicao ?? 'Paciente estável, alimentando-se e com parâmetros dentro da normalidade.',
    orientacoes: p.alta?.orientacoes ?? '',
    receita: p.alta?.receita ?? '',
    retorno: p.alta?.retorno ? toDateInput(p.alta.retorno) : toDateInput(new Date(Date.now() + 7 * 86400_000)),
  }));
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const gerarReceita = () => {
    const orais = p.prescricoes.filter((x) => x.ativa && ['VO', 'Tópica', 'Oftálmica', 'Otológica', 'Transdérmica'].includes(x.via));
    if (!orais.length) return toast('Nenhuma medicação oral/tópica ativa para copiar', 'info');
    const t = orais.map((x, i) => `${i + 1}. ${x.nome} — ${textoQuantidade(x, p.peso)} via ${x.via}, ${rotuloFrequencia(x.frequenciaHoras).toLowerCase()}, por ___ dias.`).join('\n');
    set('receita', (f.receita ? f.receita + '\n' : '') + t);
  };

  const addOrientacao = (o: string) => set('orientacoes', f.orientacoes.includes(o) ? f.orientacoes : (f.orientacoes ? f.orientacoes + '\n' : '') + '• ' + o);

  const sumarioHtml = () => {
    const tipo = f.tipo === 'alta' ? 'Sumário de alta' : f.tipo === 'obito' ? 'Declaração de óbito' : 'Sumário de transferência';
    const meds = p.prescricoes.map((x) => `<tr><td>${x.nome}</td><td>${textoQuantidade(x, p.peso)}</td><td>${x.via}</td><td>${rotuloFrequencia(x.frequenciaHoras)}</td><td>${fmtData(x.inicio)}</td></tr>`).join('');
    return `<h2>${tipo}</h2>
      <div class="grade">
        <div><b>Paciente:</b> ${p.nome}</div><div><b>Tutor:</b> ${p.tutor.nome}</div>
        <div><b>Espécie/raça:</b> ${especieRotulo(p.especie)} • ${p.raca}</div><div><b>Telefone:</b> ${p.tutor.telefone}</div>
        <div><b>Sexo/idade:</b> ${sexoRotulo(p.sexo, p.castrado)} • ${p.idade || '—'}</div><div><b>Peso:</b> ${p.peso.toLocaleString('pt-BR')} kg</div>
        <div><b>Entrada:</b> ${fmtDataHora(p.dataEntrada)}</div><div><b>Saída:</b> ${fmtDataHora(fromLocalInput(f.data))} (${diasInternado(p.dataEntrada, new Date(fromLocalInput(f.data)))} dia(s))</div>
      </div>
      <h3>Motivo da internação</h3><div>${textoParaHtml(p.queixa || '—')}</div>
      <h3>Diagnóstico</h3><div>${p.diagnosticos.join(', ') || '—'}${p.diagnosticoObs ? '<br>' + textoParaHtml(p.diagnosticoObs) : ''}</div>
      <h3>Tratamento realizado</h3>${meds ? `<table><tr><th>Medicação</th><th>Dose</th><th>Via</th><th>Frequência</th><th>Início</th></tr>${meds}</table>` : '—'}
      ${p.fluidos.length ? `<div>Fluidoterapia: ${p.fluidos.map((x) => `${x.solucao} ${x.taxaMlH} mL/h`).join('; ')}</div>` : ''}
      <h3>Condição na ${f.tipo === 'alta' ? 'alta' : 'saída'}</h3><div>${textoParaHtml(f.condicao)}</div>
      ${f.receita ? `<h3>Prescrição para casa</h3><div>${textoParaHtml(f.receita)}</div>` : ''}
      ${f.orientacoes ? `<h3>Orientações</h3><div>${textoParaHtml(f.orientacoes)}</div>` : ''}
      ${f.tipo === 'alta' && f.retorno ? `<h3>Retorno</h3><div>${fmtData(f.retorno + 'T12:00')}</div>` : ''}
      <div class="assin"><div>${assinatura(db.config, p.veterinario).replace(' — ', '<br>')}</div></div>`;
  };

  const imprimir = () => imprimirDocumento(`Alta — ${p.nome}`, sumarioHtml(), db.config);

  const confirmarSaida = async () => {
    const msg = f.tipo === 'alta' ? `Confirmar ALTA de ${p.nome}? O box será liberado.` : f.tipo === 'obito' ? `Registrar ÓBITO de ${p.nome}?` : `Registrar TRANSFERÊNCIA de ${p.nome}?`;
    if (!(await confirmar({ titulo: msg, botao: 'Confirmar', perigo: f.tipo === 'obito' }))) return;
    const agora = fromLocalInput(f.data);
    atualizarPaciente(p.id, (x) => {
      x.status = f.tipo;
      x.alta = { data: agora, tipo: f.tipo, condicao: f.condicao, orientacoes: f.orientacoes, receita: f.receita, retorno: f.retorno ? new Date(f.retorno + 'T12:00').toISOString() : undefined, responsavel: db.usuarioAtual };
      x.prescricoes.forEach((r) => { if (r.ativa) { r.ativa = false; r.suspensaEm = agora; } });
      x.fluidos.forEach((fl) => { if (fl.ativo) { fl.ativo = false; fl.encerradoEm = agora; } });
      x.boxId = null;
    });
    toast(f.tipo === 'alta' ? `Alta de ${p.nome} registrada` : 'Saída registrada');
  };

  const reabrir = async () => {
    if (!(await confirmar({ titulo: 'Reabrir a internação?', texto: 'O paciente volta para a lista de internados. Escolha um box na aba Resumo.', botao: 'Reabrir' }))) return;
    atualizarPaciente(p.id, (x) => { x.status = 'internado'; x.alta = undefined; });
  };

  const mensagemAlta = () => {
    return linkWhatsApp(p.tutor.telefone, textoAlta());
  };
  const textoAlta = () => {
    const t = `🏥 *${db.config.clinica}*\n\nOlá, ${p.tutor.nome}! ${p.nome} recebeu alta hoje 🎉\n\n*Condição:* ${f.condicao}\n${f.receita ? `\n*Medicações para casa:*\n${f.receita}\n` : ''}${f.orientacoes ? `\n*Orientações:*\n${f.orientacoes}\n` : ''}${f.retorno ? `\n*Retorno:* ${fmtData(f.retorno + 'T12:00')}\n` : ''}\nQualquer dúvida, estamos à disposição!\n_${p.veterinario}_`;
    return t;
  };

  if (p.status !== 'internado' && p.alta) {
    return (
      <div className="aba-conteudo">
        <div className="secao-cab">
          <h2>{p.status === 'alta' ? 'Alta registrada' : p.status === 'obito' ? 'Óbito registrado' : 'Transferência registrada'}</h2>
          <div className="acoes">
            {PODE_IMPRIMIR && <button className="btn btn-secundario" onClick={imprimir}><Printer size={16} /> Imprimir sumário</button>}
            {p.status === 'alta' && p.tutor.telefone && <a className="btn btn-whats" href={mensagemAlta()} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Enviar ao tutor</a>}
            <button className="btn btn-fantasma" onClick={reabrir}><RotateCcw size={16} /> Reabrir internação</button>
          </div>
        </div>
        <div className="cartao">
          <p><b>Data:</b> {fmtDataHora(p.alta.data)} • <b>Responsável:</b> {p.alta.responsavel}</p>
          <p><b>Condição:</b> {p.alta.condicao}</p>
          {p.alta.receita && <><b>Prescrição para casa:</b><pre className="pre">{p.alta.receita}</pre></>}
          {p.alta.orientacoes && <><b>Orientações:</b><pre className="pre">{p.alta.orientacoes}</pre></>}
          {p.alta.retorno && <p><b>Retorno:</b> {fmtData(p.alta.retorno)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="aba-conteudo">
      <div className="secao-cab"><h2>Alta / saída do paciente</h2></div>
      <div className="cartao">
        <div className="grade-form g4">
          <Campo rotulo="Tipo de saída" span={2}>
            <Chips<StatusInternacao> permitirLimpar={false} valor={f.tipo} onChange={(v) => v && set('tipo', v)} opcoes={[
              { v: 'alta', r: 'Alta médica', tom: 'ok' }, { v: 'transferido', r: 'Transferência' }, { v: 'obito', r: 'Óbito', tom: 'perigo' },
            ]} />
          </Campo>
          <Campo rotulo="Data/hora"><input type="datetime-local" value={f.data} onChange={(e) => set('data', e.target.value)} /></Campo>
          {f.tipo === 'alta' && <Campo rotulo="Retorno"><input type="date" value={f.retorno} onChange={(e) => set('retorno', e.target.value)} /></Campo>}
          <Campo rotulo="Condição clínica na saída" span={4}><textarea rows={2} value={f.condicao} onChange={(e) => set('condicao', e.target.value)} /></Campo>
          {f.tipo === 'alta' && (
            <>
              <Campo rotulo="Prescrição para casa" span={4} dica={<button type="button" className="link" onClick={gerarReceita}><Wand2 size={12} /> Copiar medicações orais/tópicas ativas</button>}>
                <textarea rows={4} value={f.receita} onChange={(e) => set('receita', e.target.value)} placeholder="1. Medicação — dose, via, frequência, duração" />
              </Campo>
              <Campo rotulo="Orientações ao tutor" span={4}>
                <div className="chips mb">{ORIENTACOES.map((o) => <button type="button" key={o} className="chip" onClick={() => addOrientacao(o)}>+ {o.length > 48 ? o.slice(0, 46) + '…' : o}</button>)}</div>
                <textarea rows={5} value={f.orientacoes} onChange={(e) => set('orientacoes', e.target.value)} />
              </Campo>
            </>
          )}
        </div>
        <div className="rodape-form">
          <span className="muted flex1">Box atual: {nomeBox(db.config, p.boxId)}</span>
          {PODE_IMPRIMIR && <button className="btn btn-secundario" onClick={imprimir}><Printer size={16} /> Pré-visualizar / imprimir</button>}
          <button className={`btn ${f.tipo === 'obito' ? 'btn-perigo' : 'btn-primario'}`} onClick={confirmarSaida}><LogOut size={18} /> Confirmar {f.tipo === 'alta' ? 'alta' : f.tipo === 'obito' ? 'óbito' : 'transferência'}</button>
        </div>
      </div>
    </div>
  );
}
