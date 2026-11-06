import React, { useEffect, useRef } from 'react';

/**
 * Cinematic3DBackground
 * Renders an ambient, high-performance HTML5 Canvas 3D particle field
 * simulating floating cinematic dust, embers, and volumetric projector light beams.
 * GPU accelerated, pauses when hidden/reduced-motion, zero dependencies.
 */
const Cinematic3DBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    let animationFrameId;
    const dims = {
      width: (canvas.width = window.innerWidth),
      height: (canvas.height = window.innerHeight),
    };

    // Mouse coordinates for subtle interactive gravity
    const mouse = {
      x: dims.width / 2,
      y: dims.height / 2,
      targetX: dims.width / 2,
      targetY: dims.height / 2,
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      dims.width = canvas.width = window.innerWidth;
      dims.height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // 3D Particles with depth (z) - Subtle ember motes
    const PARTICLE_COUNT = 35;
    const particles = [];

    const colors = [
      'rgba(240, 68, 50, ',   // Cinematic Vermilion Ember
      'rgba(255, 120, 62, ',  // Warm Amber Orange
      'rgba(255, 255, 255, ', // Subtle Specular Starlight
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * dims.width * 1.5,
        y: (Math.random() - 0.5) * dims.height * 1.5,
        z: Math.random() * 1000 + 100, // Depth from camera
        size: Math.random() * 2 + 1,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseAngle: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4 - 0.15, // Gentle upward drift
      });
    }

    const focalLength = 400; // 3D Camera focal perspective

    const beamState = { angle: 0 };

    const render = () => {
      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, dims.width, dims.height);

      // 1. Volumetric Projector Spotlight Cone
      beamState.angle += 0.005;
      const beamCenterX = dims.width * 0.5 + Math.sin(beamState.angle) * 60;
      const beamGradient = ctx.createRadialGradient(
        beamCenterX,
        -50,
        20,
        beamCenterX,
        dims.height * 0.6,
        dims.width * 0.7
      );
      beamGradient.addColorStop(0, 'rgba(240, 68, 50, 0.03)');
      beamGradient.addColorStop(0.4, 'rgba(255, 120, 62, 0.015)');
      beamGradient.addColorStop(0.8, 'rgba(8, 9, 11, 0)');
      beamGradient.addColorStop(1, 'rgba(8, 9, 11, 0)');

      ctx.fillStyle = beamGradient;
      ctx.fillRect(0, 0, dims.width, dims.height);

      // 2. Render 3D Floating Particles
      const mouseOffsetX = (mouse.x - dims.width / 2) * 0.08;
      const mouseOffsetY = (mouse.y - dims.height / 2) * 0.08;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulseAngle += p.pulseSpeed;

        // Wrap around bounds in 3D
        if (p.z <= 10) p.z = 1000;
        if (p.y < -dims.height) p.y = dims.height;
        if (p.x < -dims.width) p.x = dims.width;
        if (p.x > dims.width) p.x = -dims.width;

        // Perspective 3D projection
        const scale = focalLength / (focalLength + p.z);
        const screenX = (p.x - mouseOffsetX) * scale + dims.width / 2;
        const screenY = (p.y - mouseOffsetY) * scale + dims.height / 2;
        const radius = Math.max(0.5, p.size * scale);
        const dynamicAlpha = Math.max(0, p.alpha * (0.8 + 0.2 * Math.sin(p.pulseAngle)));

        if (screenX >= -10 && screenX <= dims.width + 10 && screenY >= -10 && screenY <= dims.height + 10) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.colorBase}${dynamicAlpha})`;
          ctx.fill();

          // Subtle halo around larger closer particles
          if (scale > 0.6) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `${p.colorBase}${dynamicAlpha * 0.2})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause rendering when tab is hidden to save energy
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cinematic-3d-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default React.memo(Cinematic3DBackground);
