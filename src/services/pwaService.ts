import { useState, useEffect, useCallback } from 'react';
import { APP_VERSION, BUILD_DATE } from '../version';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA a été installée avec succès');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return { isInstallable, isInstalled, triggerInstall };
}

const LAST_CHECK_KEY = 'oisor_last_update_check';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastCheckDate, setLastCheckDate] = useState<string | null>(() => {
    return localStorage.getItem(LAST_CHECK_KEY);
  });
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const formatNow = () => {
    const d = new Date();
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Listen for SW registration updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setSwRegistration(reg);

        if (reg.waiting) {
          setUpdateAvailable(true);
          setStatusMessage('Une nouvelle version est prête à être installée !');
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                setStatusMessage('Une mise à jour est disponible !');
              }
            });
          }
        });
      }
    });

    // Listen for controller changes
    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Manual Check for Updates
  const checkUpdate = useCallback(async () => {
    setChecking(true);
    setStatusMessage('Vérification des mises à jour en cours...');

    const nowFormatted = formatNow();
    localStorage.setItem(LAST_CHECK_KEY, nowFormatted);
    setLastCheckDate(nowFormatted);

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          if (reg.waiting) {
            setUpdateAvailable(true);
            setStatusMessage('Une mise à jour est disponible et prête !');
          } else {
            // Also attempt a quick HEAD fetch to check if birds.json or index.html changed
            try {
              const res = await fetch('/data/birds.json?t=' + Date.now(), { method: 'HEAD' });
              if (res.ok) {
                setStatusMessage('✅ Votre application est parfaitement à jour !');
              }
            } catch {
              setStatusMessage('✅ Mode hors-ligne : aucune mise à jour détectée.');
            }
          }
        } else {
          setStatusMessage('✅ Votre application est à jour !');
        }
      } else {
        setStatusMessage('✅ Votre application est à jour !');
      }
    } catch (err) {
      console.warn('Erreur lors de la vérification des mises à jour:', err);
      setStatusMessage('Impossible de vérifier les mises à jour (mode hors-ligne).');
    } finally {
      setChecking(false);
    }
  }, []);

  // Force Update function
  const forceUpdate = useCallback(async () => {
    setStatusMessage('Application de la mise à jour...');
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      // Clear cache storage and force page reload
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    }
    // Hard reload
    window.location.reload();
  }, []);

  return {
    currentVersion: `v${APP_VERSION}`,
    lastUpdateDate: BUILD_DATE,
    lastCheckDate,
    updateAvailable,
    checking,
    statusMessage,
    checkUpdate,
    forceUpdate,
  };
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => {
          console.log('ServiceWorker registered with scope: ', reg.scope);
        },
        (err) => {
          console.error('ServiceWorker registration failed: ', err);
        }
      );
    });
  }
}
