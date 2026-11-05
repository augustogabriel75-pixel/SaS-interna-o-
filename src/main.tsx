import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { StoreProvider } from './store';
import { ToastProvider, ConfirmProvider } from './components/ui';
import { AuthProvider, useAuth } from './auth';
import { NUVEM } from './lib/supabase';
import Login, { AguardandoLiberacao, Carregando, NovaSenha } from './pages/Login';
import { registrarOffline } from './lib/pwa';
import './styles.css';

/** Na versão em nuvem só mostra o sistema depois do login de um usuário liberado */
function Portao() {
  const { carregando, sessao, perfil, recuperacao } = useAuth();
  if (NUVEM) {
    if (carregando) return <Carregando />;
    if (recuperacao) return <NovaSenha />;
    if (!sessao) return <Login />;
    if (!perfil) return <Carregando texto="Carregando seu perfil..." />;
    if (!perfil.ativo) return <AguardandoLiberacao />;
  }
  return (
    <StoreProvider key={perfil?.id ?? 'local'}>
      <App />
    </StoreProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <Portao />
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
);

registrarOffline();
