import React, { useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Layers, 
  Calendar, 
  Info 
} from 'lucide-react';

export default function ImageModal({ 
  images = [], 
  currentIndex = 0, 
  onClose, 
  onNavigate 
}) {
  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    if (images.length > 1) {
      const nextIdx = (currentIndex - 1 + images.length) % images.length;
      onNavigate(nextIdx);
    }
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length > 1) {
      const nextIdx = (currentIndex + 1) % images.length;
      onNavigate(nextIdx);
    }
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  if (!currentImage) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer modal"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full bg-[#0a0f1d] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              {currentImage.item_type || 'Photo'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Item {currentIndex + 1} of {images.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Image Area with Navigation Buttons */}
        <div className="relative flex-1 bg-black/60 flex items-center justify-center min-h-[300px] sm:min-h-[420px] overflow-hidden select-none">
          <img
            src={currentImage.image_url}
            alt={currentImage.title}
            className="max-h-[60vh] max-w-full object-contain mx-auto"
          />

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Previous Image (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Next Image (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Modal Information Footer */}
        <div className="p-5 border-t border-white/10 bg-[#080d1a] overflow-y-auto max-h-48 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-semibold text-white">
              {currentImage.title}
            </h3>
            {currentImage.source_url && (
              <a
                href={currentImage.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline shrink-0 font-medium"
              >
                Official Image Record <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {currentImage.description && (
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-3">
              {currentImage.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/5">
            <span className="font-mono text-slate-300">
              Attribution: {currentImage.attribution || 'NASA / JPL Archive'}
            </span>
            {currentImage.publication_date && (
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                Date: {currentImage.publication_date}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
