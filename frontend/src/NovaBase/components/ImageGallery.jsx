import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  ExternalLink, 
  ZoomIn, 
  AlertCircle, 
  Layers 
} from 'lucide-react';

export default function ImageGallery({ 
  images = [], 
  hardwareName, 
  onSelectImage 
}) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  if (!images || images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/30 p-6 text-center text-slate-500 dark:text-slate-400">
        <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-xs sm:text-sm">Information not available in the current sources</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Official imagery pending ingestion.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-[11px]">
          <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          {images.length} verified item{images.length !== 1 ? 's' : ''} (Max 10)
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">Click to enlarge</span>
      </div>

      {/* Responsive Grid: 1-2 columns on mobile, 2-3 on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {images.slice(0, 10).map((img, index) => {
          const isError = imageErrors[img.id];

          return (
            <div 
              key={img.id || index}
              className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 hover:border-cyan-500/50 transition-all flex flex-col cursor-pointer shadow-2xs"
              onClick={() => onSelectImage(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectImage(index);
                }
              }}
              aria-label={`View enlarged image: ${img.title}`}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                {isError ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                    <AlertCircle className="w-5 h-5 text-amber-500/70 mb-1" />
                    <span className="text-xs">Image unavailable</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={img.image_url}
                      alt={img.title || `${hardwareName} photographic record`}
                      loading="lazy"
                      onError={() => handleImageError(img.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-cyan-950/90 text-cyan-300 text-xs px-2.5 py-1 rounded-full border border-cyan-500/40 flex items-center gap-1.5 shadow-lg">
                        <ZoomIn className="w-3.5 h-3.5" /> Enlarge
                      </span>
                    </div>
                  </>
                )}

                {/* Item Type Badge (Photo, Diagram, Data Viz) */}
                <span className="absolute top-2 left-2 text-[9px] uppercase font-semibold px-2 py-0.5 rounded bg-black/70 text-white border border-white/10 backdrop-blur-xs">
                  {img.item_type || 'Photo'}
                </span>
              </div>

              {/* Caption & Attribution Info */}
              <div className="p-2.5 flex-1 flex flex-col justify-between bg-slate-50/70 dark:bg-slate-900/40">
                <div>
                  <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    {img.title}
                  </h4>
                  {img.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {img.description}
                    </p>
                  )}
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[150px]" title={img.attribution}>
                    Credit: {img.attribution || 'NASA / JPL Archive'}
                  </span>
                  {img.source_url && (
                    <a
                      href={img.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0"
                      title="Open source archive"
                    >
                      Source <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
