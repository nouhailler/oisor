import React, { useState } from 'react';
import { Feather, ZoomIn, X } from 'lucide-react';

interface BirdImageProps {
  src: string;
  alt: string;
  name: string;
  className?: string;
  aspectRatio?: string;
  enableZoom?: boolean;
}

export const BirdImage: React.FC<BirdImageProps> = ({
  src,
  alt,
  name,
  className = 'w-full h-48 object-cover rounded-xl',
  enableZoom = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // SVG Fallback representation with elegant colors based on bird name
  const getGradient = (birdName: string) => {
    const lower = birdName.toLowerCase();
    if (lower.includes('rouge-gorge') || lower.includes('rougegorge')) return 'from-amber-600 via-orange-500 to-amber-800';
    if (lower.includes('mésange')) return 'from-sky-500 via-emerald-400 to-amber-400';
    if (lower.includes('merle')) return 'from-slate-800 via-zinc-900 to-amber-500';
    if (lower.includes('pigeon')) return 'from-slate-400 via-slate-600 to-purple-800';
    if (lower.includes('pie')) return 'from-zinc-900 via-slate-800 to-sky-700';
    if (lower.includes('martinet')) return 'from-slate-900 via-zinc-800 to-amber-900';
    if (lower.includes('héron')) return 'from-slate-400 via-sky-600 to-indigo-900';
    if (lower.includes('chardonneret')) return 'from-red-500 via-yellow-400 to-slate-900';
    if (lower.includes('faucon') || lower.includes('épervier')) return 'from-amber-700 via-yellow-700 to-stone-800';
    if (lower.includes('canard')) return 'from-emerald-700 via-teal-800 to-amber-600';
    if (lower.includes('aigle') || lower.includes('gypaète') || lower.includes('milan') || lower.includes('circaète')) return 'from-amber-800 via-yellow-900 to-stone-900';
    if (lower.includes('tétras') || lower.includes('lagopède')) return 'from-stone-700 via-cyan-900 to-slate-900';
    if (lower.includes('chocard')) return 'from-zinc-900 via-slate-800 to-yellow-600';
    if (lower.includes('fou') || lower.includes('macareux') || lower.includes('goéland') || lower.includes('sterne')) return 'from-sky-600 via-teal-700 to-indigo-900';
    if (lower.includes('cormoran') || lower.includes('huîtrier') || lower.includes('gravelot') || lower.includes('aigrette')) return 'from-slate-800 via-cyan-900 to-teal-900';
    if (lower.includes('pic')) return 'from-emerald-700 via-red-600 to-zinc-900';
    if (lower.includes('chouette')) return 'from-amber-900 via-stone-800 to-zinc-950';
    if (lower.includes('pinson') || lower.includes('moineau')) return 'from-amber-700 via-orange-600 to-slate-800';
    return 'from-emerald-600 via-teal-700 to-slate-800';
  };

  return (
    <>
      <div className={`relative overflow-hidden group ${className.includes('rounded') ? '' : 'rounded-xl'}`}>
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setHasError(true)}
            className={`${className} transition-transform duration-500 group-hover:scale-105`}
          />
        ) : (
          <div className={`w-full h-full min-h-[160px] bg-gradient-to-br ${getGradient(name)} flex flex-col items-center justify-center p-4 text-white text-center shadow-inner relative`}>
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-lg">
              <Feather className="w-8 h-8 text-white animate-pulse" />
            </div>
            <span className="font-semibold text-sm drop-shadow">{name}</span>
            <span className="text-xs text-white/80 italic mt-0.5">Illustration de fiche</span>
          </div>
        )}

        {enableZoom && !hasError && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
            className="absolute bottom-2 right-2 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-900/90 shadow-md"
            title="Agrandir la photo"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={src} alt={alt} className="w-full h-auto max-h-[80vh] object-contain" />
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-slate-200">
              <span className="font-semibold text-lg">{name}</span>
              <span className="text-sm text-slate-400">Photo HD</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
