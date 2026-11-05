/**
 * Mescla de 3 vias usada na sincronização: base = última versão do servidor que este aparelho conhecia,
 * local = versão com as alterações deste aparelho, remoto = versão atual do servidor.
 * Listas de itens com `id` (aplicações, registros, prescrições...) são mescladas item a item,
 * assim duas pessoas podem registrar coisas diferentes no mesmo paciente ao mesmo tempo.
 */
type J = unknown;

const igual = (a: J, b: J) => JSON.stringify(a) === JSON.stringify(b);
const ehObj = (x: J): x is Record<string, J> => !!x && typeof x === 'object' && !Array.isArray(x);
const listaComId = (x: J): x is { id: string }[] => Array.isArray(x) && x.every((i) => ehObj(i) && typeof i.id === 'string');

export function mesclar<T>(base: T | undefined, local: T, remoto: T): T {
  return m(base, local, remoto) as T;
}

function m(b: J, l: J, r: J): J {
  if (igual(l, b)) return r;
  if (igual(r, b) || igual(l, r)) return l;
  if (listaComId(l) && listaComId(r) && (b === undefined || listaComId(b))) return mesclarLista((b as { id: string }[]) ?? [], l, r);
  if (ehObj(l) && ehObj(r) && (b === undefined || ehObj(b))) {
    const bo = (b as Record<string, J>) ?? {};
    const out: Record<string, J> = {};
    for (const k of new Set([...Object.keys(l), ...Object.keys(r), ...Object.keys(bo)])) {
      const inL = k in l, inR = k in r, inB = k in bo;
      if (!inL && inB && igual(r[k], bo[k])) continue; // removido localmente
      if (!inR && inB && igual(l[k], bo[k])) continue; // removido no servidor
      const v = m(bo[k], l[k], r[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  return l; // conflito em valor simples: vale a alteração deste aparelho
}

function mesclarLista(b: { id: string }[], l: { id: string }[], r: { id: string }[]) {
  const mb = new Map(b.map((i) => [i.id, i]));
  const ml = new Map(l.map((i) => [i.id, i]));
  const mr = new Map(r.map((i) => [i.id, i]));
  const ordem = [...r.map((i) => i.id), ...l.map((i) => i.id).filter((id) => !mr.has(id))];
  const out: J[] = [];
  for (const id of ordem) {
    const bi = mb.get(id), li = ml.get(id), ri = mr.get(id);
    if (bi && !li) { if (ri && !igual(ri, bi)) out.push(ri); continue; } // excluído aqui (a menos que alterado lá)
    if (bi && !ri) { if (li && !igual(li, bi)) out.push(li); continue; } // excluído lá (a menos que alterado aqui)
    if (li && ri) out.push(m(bi, li, ri));
    else out.push(li ?? ri);
  }
  return out;
}
