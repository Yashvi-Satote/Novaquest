import React, { useEffect, useRef } from 'react';

/**
 * MenuDustCanvas
 * Renders an ambient micro-particle drift effect representing lunar dust
 * and cosmic motes over the main menu scene.
 */
export default function MenuDustCanvas({ density = 'High' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = density === 'Low' ? 35 : density === 'Off' ? 0 : 75;
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.4) * 0.25,
        vy: -Math.random() * 0.3 - 0.05,
        alpha: Math.random() * 0.6 + 0.2,
        dAlpha: (Math.random() * 0.01 - 0.005)
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.dAlpha;

        if (p.alpha <= 0.1 || p.alpha >= 0.8) {
          p.dAlpha = -p.dAlpha;
        }

        if (p.y < 0) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 240, 255, ${p.alpha * 0.7})`;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    if (count > 0) {
      animId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-70"
    />
  );
}
