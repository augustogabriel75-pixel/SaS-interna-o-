import { useRef } from 'react';
import { Plus, Trash2, Download, Upload, RotateCcw, Minus } from 'lucide-react';
import { useStore } from '../store';
import { Campo, useToast, useConfirmar } from '../components/ui';
import { uid } from '../utils/format';
import type { DB } from '../types';

export default function Configuracoes() {
  const { db, atualizar, resetar, importar } = useStore();
  const toast = useToast();
  const confirmar = useConfirmar();
  const arquivo = useRef<HTMLInputElement>(null);
  const c = db.config;
  const ocupados = new Set(db.pacientes.filter((p) => p.status === 'internado').map((p) => p.boxId));

  const exportar = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vetinterna-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const carregarArquivo = (f?: File) => {
    if (!f) return;
    f.text().then((t) => {
      try {
        const d = JSON.parse(t) as DB;
        if (!d.config || !Array.isArray(d.pacientes)) throw new Error();
        importar(d);
        toast('Backup restaurado');
      } catch {
        toast('Arquivo de backup inválido', 'erro');
      }
    });
  };

  return (
    <div className="pagina">
      <div className="pagina-cab"><div><h1>Configurações</h1><p className="sub">Dados da clínica e estrutura da internação</p></div></div>

      <section className="cartao">
        <h2 className="cartao-titulo">Clínica</h2>
        <div className="grade-form g2">
          <Campo rotulo="Nome da clínica / hospital"><input value={c.clinica} onChange={(e) => atualizar((d) => { d.config.clinica = e.target.value; })} /></Campo>
          <Campo rotulo="Telefone / WhatsApp"><input value={c.telefone} onChange={(e) => atualizar((d) => { d.config.telefone = e.target.value; })} /></Campo>
          <Campo rotulo="Endereço"><input value={c.endereco} onChange={(e) => atualizar((d) => { d.config.endereco = e.target.value; })} /></Campo>
          <Campo rotulo="CRMV do responsável técnico" dica="Usado quando o veterinário não tem CRMV cadastrado"><input value={c.crmv} onChange={(e) => atualizar((d) => { d.config.crmv = e.target.value; })} /></Campo>
        </div>
      </section>

      <section className="cartao linha-equipe">
        <div>
          <h2 className="cartao-titulo">Profissionais</h2>
          <p className="muted sem-margem">{c.equipe.filter((e) => e.ativo).length} profissional(is) ativo(s). Cadastro, CRMV e função ficam na aba Profissionais.</p>
        </div>
        <a className="btn btn-secundario" href="#/equipe">Gerenciar profissionais</a>
      </section>

      <section className="cartao">
        <div className="secao-cab">
          <h2 className="cartao-titulo">Alas e boxes</h2>
          <button className="btn btn-sm btn-secundario" onClick={() => atualizar((d) => { const id = uid(); d.config.alas.push({ id, nome: 'Nova ala', cor: '#10b981', boxes: [{ id: id + '-1', nome: 'N01' }] }); })}><Plus size={14} /> Nova ala</button>
        </div>
        <div className="lista-alas">
          {c.alas.map((a, i) => (
            <div key={a.id} className="item-ala">
              <input type="color" value={a.cor} onChange={(e) => atualizar((d) => { d.config.alas[i].cor = e.target.value; })} aria-label="Cor da ala" />
              <input className="flex1" value={a.nome} onChange={(e) => atualizar((d) => { d.config.alas[i].nome = e.target.value; })} />
              <div className="contador">
                <button className="btn-icone" aria-label="Remover box" disabled={a.boxes.length <= 1 || ocupados.has(a.boxes[a.boxes.length - 1].id)} onClick={() => atualizar((d) => { d.config.alas[i].boxes.pop(); })}><Minus size={16} /></button>
                <span>{a.boxes.length} boxes</span>
                <button className="btn-icone" aria-label="Adicionar box" onClick={() => atualizar((d) => {
                  const al = d.config.alas[i];
                  const pref = al.boxes[0]?.nome.replace(/\d+$/, '') || 'B';
                  const n = al.boxes.length + 1;
                  al.boxes.push({ id: `${al.id}-${uid()}`, nome: `${pref}${String(n).padStart(2, '0')}` });
                })}><Plus size={16} /></button>
              </div>
              <button className="btn-icone perigo" title="Excluir ala" disabled={a.boxes.some((b) => ocupados.has(b.id))} onClick={async () => (await confirmar({ titulo: `Excluir a ala ${a.nome}?`, botao: 'Excluir', perigo: true })) && atualizar((d) => { d.config.alas.splice(i, 1); })}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <small className="muted">Boxes ocupados não podem ser removidos.</small>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Dados e backup</h2>
        <p className="muted">Os dados ficam salvos neste navegador. Faça backups regulares.</p>
        <div className="acoes">
          <button className="btn btn-secundario" onClick={exportar}><Download size={16} /> Exportar backup</button>
          <button className="btn btn-secundario" onClick={() => arquivo.current?.click()}><Upload size={16} /> Restaurar backup</button>
          <input ref={arquivo} type="file" accept="application/json" hidden onChange={(e) => carregarArquivo(e.target.files?.[0])} />
          <button className="btn btn-fantasma" onClick={async () => (await confirmar({ titulo: 'Recarregar dados de demonstração?', texto: 'Os dados atuais serão substituídos pelos pacientes de exemplo.', botao: 'Recarregar' })) && resetar(true)}><RotateCcw size={16} /> Dados de demonstração</button>
          <button className="btn btn-perigo" onClick={async () => (await confirmar({ titulo: 'Apagar todos os dados?', texto: 'Pacientes, prescrições e registros serão apagados. Exporte um backup antes, se precisar.', botao: 'Apagar tudo', perigo: true })) && resetar(false)}><Trash2 size={16} /> Começar do zero</button>
        </div>
      </section>
    </div>
  );
}
