import { useState } from 'react';
import { Plus, Pencil, Trash2, UserPlus, Phone, Mail, BadgeCheck, Users, UserCheck } from 'lucide-react';
import { useStore, FUNCOES } from '../store';
import { Badge, Campo, Chips, Modal, Vazio, useConfirmar, useToast } from '../components/ui';
import { uid } from '../utils/format';
import type { Funcao, Profissional } from '../types';

const VAZIO: Omit<Profissional, 'id'> = { nome: '', funcao: 'veterinario', crmv: '', especialidade: '', telefone: '', email: '', ativo: true };

export default function Equipe() {
  const { db, atualizar } = useStore();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [form, setForm] = useState<(Omit<Profissional, 'id'> & { id?: string }) | null>(null);
  const [filtro, setFiltro] = useState<Funcao | undefined>();
  const equipe = db.config.equipe;
  const lista = equipe
    .filter((e) => !filtro || e.funcao === filtro)
    .sort((a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome));

  const set = <K extends keyof Profissional>(k: K, v: Profissional[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const salvar = () => {
    if (!form) return;
    const nome = form.nome.trim();
    if (!nome) return toast('Informe o nome do profissional', 'erro');
    if (equipe.some((e) => e.nome.toLowerCase() === nome.toLowerCase() && e.id !== form.id)) return toast('Já existe um profissional com esse nome', 'erro');
    const p: Profissional = { ...form, id: form.id ?? uid(), nome, crmv: form.crmv?.trim() || undefined };
    atualizar((d) => {
      const i = d.config.equipe.findIndex((e) => e.id === p.id);
      if (i >= 0) {
        const antigo = d.config.equipe[i].nome;
        d.config.equipe[i] = p;
        if (d.usuarioAtual === antigo) d.usuarioAtual = p.ativo ? p.nome : '';
      } else {
        d.config.equipe.push(p);
      }
      if (!d.usuarioAtual && p.ativo) d.usuarioAtual = p.nome;
    });
    toast(form.id ? 'Profissional atualizado' : `${nome} adicionado(a) à equipe`);
    setForm(null);
  };

  const alternarAtivo = (p: Profissional) => atualizar((d) => {
    const e = d.config.equipe.find((x) => x.id === p.id)!;
    e.ativo = !e.ativo;
    if (!e.ativo && d.usuarioAtual === e.nome) d.usuarioAtual = d.config.equipe.find((x) => x.ativo)?.nome ?? '';
    if (e.ativo && !d.usuarioAtual) d.usuarioAtual = e.nome;
  });

  const excluir = async (p: Profissional) => {
    const ok = await confirmar({
      titulo: `Excluir ${p.nome}?`,
      texto: 'O nome continua nos registros já feitos (aplicações, evoluções, boletins). Se a pessoa só saiu da escala, prefira Desativar.',
      botao: 'Excluir',
      perigo: true,
    });
    if (!ok) return;
    atualizar((d) => {
      d.config.equipe = d.config.equipe.filter((x) => x.id !== p.id);
      if (d.usuarioAtual === p.nome) d.usuarioAtual = d.config.equipe.find((x) => x.ativo)?.nome ?? '';
    });
  };

  const ativos = equipe.filter((e) => e.ativo).length;
  const vets = equipe.filter((e) => e.ativo && e.funcao === 'veterinario').length;

  return (
    <div className="pagina">
      <div className="pagina-cab">
        <div>
          <h1>Profissionais</h1>
          <p className="sub">{ativos} ativo(s) • {vets} médico(s)-veterinário(s)</p>
        </div>
        <button className="btn btn-primario" onClick={() => setForm({ ...VAZIO })}><UserPlus size={18} /> Adicionar profissional</button>
      </div>

      {equipe.length === 0 ? (
        <Vazio
          icone={<Users size={36} />}
          titulo="Nenhum profissional cadastrado"
          texto="Cadastre veterinários, enfermeiros e auxiliares. Eles aparecem como responsáveis nas prescrições, na checagem das medicações, no monitoramento e assinam o boletim e a alta."
          acao={<button className="btn btn-primario" onClick={() => setForm({ ...VAZIO })}><Plus size={18} /> Cadastrar o primeiro profissional</button>}
        />
      ) : (
        <>
          <div className="filtros cartao">
            <Chips<Funcao> valor={filtro} onChange={setFiltro} opcoes={(Object.keys(FUNCOES) as Funcao[]).filter((f) => equipe.some((e) => e.funcao === f)).map((f) => ({ v: f, r: FUNCOES[f] }))} />
          </div>
          <div className="grade-equipe">
            {lista.map((p) => (
              <div key={p.id} className={`cartao card-prof ${!p.ativo ? 'inativo' : ''}`}>
                <div className="card-prof-cab">
                  <div className="avatar avatar-prof">{p.nome.replace(/^(dra?\.|enf\.|aux\.)\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase()}</div>
                  <div className="flex1">
                    <strong>{p.nome}</strong>
                    <small>{FUNCOES[p.funcao]}{p.especialidade ? ` • ${p.especialidade}` : ''}</small>
                  </div>
                  {p.ativo ? (db.usuarioAtual === p.nome ? <Badge tom="info">De plantão</Badge> : <Badge tom="ok">Ativo</Badge>) : <Badge>Inativo</Badge>}
                </div>
                <div className="card-prof-dados">
                  {p.crmv && <span><BadgeCheck size={14} /> {p.crmv}</span>}
                  {p.telefone && <span><Phone size={14} /> {p.telefone}</span>}
                  {p.email && <span><Mail size={14} /> {p.email}</span>}
                  {!p.crmv && !p.telefone && !p.email && <span className="muted">Sem contato cadastrado</span>}
                </div>
                <div className="card-prof-acoes">
                  {p.ativo && db.usuarioAtual !== p.nome && (
                    <button className="btn btn-sm btn-fantasma" onClick={() => atualizar((d) => { d.usuarioAtual = p.nome; })}><UserCheck size={14} /> Assumir plantão</button>
                  )}
                  <span className="flex1" />
                  <button className="btn btn-sm btn-secundario" onClick={() => alternarAtivo(p)}>{p.ativo ? 'Desativar' : 'Reativar'}</button>
                  <button className="btn-icone" title="Editar" onClick={() => setForm({ ...p })}><Pencil size={16} /></button>
                  <button className="btn-icone perigo" title="Excluir" onClick={() => excluir(p)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        aberto={!!form}
        onFechar={() => setForm(null)}
        titulo={form?.id ? 'Editar profissional' : 'Adicionar profissional'}
        rodape={
          <>
            <span className="flex1" />
            <button className="btn btn-secundario" onClick={() => setForm(null)}>Cancelar</button>
            <button className="btn btn-primario" onClick={salvar}>Salvar</button>
          </>
        }
      >
        {form && (
          <div className="grade-form g2">
            <Campo rotulo="Nome completo *" span={2}>
              <input id="prof-nome" autoFocus value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Ex.: Dra. Maria Oliveira" />
            </Campo>
            <Campo rotulo="Função" span={2}>
              <Chips<Funcao> permitirLimpar={false} valor={form.funcao} onChange={(v) => v && set('funcao', v)} opcoes={(Object.keys(FUNCOES) as Funcao[]).map((f) => ({ v: f, r: FUNCOES[f] }))} />
            </Campo>
            {form.funcao === 'veterinario' && (
              <>
                <Campo rotulo="CRMV" dica="Aparece na assinatura do boletim e da alta">
                  <input id="prof-crmv" value={form.crmv ?? ''} onChange={(e) => set('crmv', e.target.value)} placeholder="Ex.: CRMV-TO 1234" />
                </Campo>
                <Campo rotulo="Especialidade">
                  <input id="prof-esp" value={form.especialidade ?? ''} onChange={(e) => set('especialidade', e.target.value)} placeholder="Ex.: Clínica médica, cirurgia" />
                </Campo>
              </>
            )}
            <Campo rotulo="Telefone / WhatsApp">
              <input id="prof-tel" inputMode="tel" value={form.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} />
            </Campo>
            <Campo rotulo="E-mail">
              <input id="prof-email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            </Campo>
          </div>
        )}
      </Modal>
    </div>
  );
}
