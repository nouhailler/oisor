import React from 'react';
import { useOnlineStatus } from '../services/pwaService';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center space-x-2 shadow-md">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        Mode Hors-Ligne Actif : L'application fonctionne à 100% avec les données locales et vos observations.
      </span>
    </div>
  );
};
