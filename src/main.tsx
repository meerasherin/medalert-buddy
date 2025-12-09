
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core';

// Register service worker for push notifications (web only)
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
