import { registerSW } from 'virtual:pwa-register';

/** Instala o "service worker" que guarda o sistema no aparelho para abrir sem internet */
export function registrarOffline() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || window.self !== window.top) return;
  registerSW({ immediate: true });
}
