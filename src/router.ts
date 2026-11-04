import { useEffect, useState } from 'react';

export function useRota() {
  const [hash, setHash] = useState(() => window.location.hash || '#/painel');
  useEffect(() => {
    const h = () => {
      setHash(window.location.hash || '#/painel');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  const [caminho, query = ''] = hash.replace(/^#/, '').split('?');
  const partes = caminho.split('/').filter(Boolean);
  return { partes, params: new URLSearchParams(query) };
}

export function ir(rota: string) {
  window.location.hash = rota;
}
