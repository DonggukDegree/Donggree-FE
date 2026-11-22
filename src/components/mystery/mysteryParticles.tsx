/** [정각원의 비밀] React Bits Particles의 부유·반짝임·포인터 반응을 참고한 흰 배경용 금가루.
 * 참고: https://reactbits.dev/c/backgrounds/particles — 별도 의존성 없이 화면 크기의 2D 캔버스만 사용한다.
 */
import { useEffect, useRef } from 'react';

export default function MysteryParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const particles = Array.from({ length: 110 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      depth: 0.3 + Math.random() * 0.7,
      size: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      star: index % 9 === 0,
    }));
    const pointer = { x: -1000, y: -1000, offsetX: 0, offsetY: 0, active: false };
    const bursts: { x: number; y: number; age: number }[] = [];
    let width = 1;
    let height = 1;
    let frameId = 0;
    let lastFrame = 0;
    let elapsed = 0;
    const draw = (delta = 0) => {
      elapsed += delta;
      context.clearRect(0, 0, width, height);
      for (const burst of bursts) burst.age += delta;
      while (bursts[0] && bursts[0].age > 1.2) bursts.shift();
      const count = width < 640 ? 55 : particles.length;
      for (const particle of particles.slice(0, count)) {
        let x = particle.x * width + Math.sin(elapsed * 0.2 + particle.phase) * 6;
        let y = (((particle.y * height - elapsed * 3 * particle.depth) % height) + height) % height;
        const depth = particle.depth;
        if (!motion.matches) {
          x += pointer.offsetX * depth;
          y += pointer.offsetY * depth;
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (pointer.active && distance > 0 && distance < 130) {
            const push = (1 - distance / 130) * 13;
            x += (dx / distance) * push;
            y += (dy / distance) * push;
          }
          for (const burst of bursts) {
            const bx = x - burst.x;
            const by = y - burst.y;
            const burstDistance = Math.hypot(bx, by);
            const wave = Math.max(0, 1 - Math.abs(burstDistance - burst.age * 200) / 65) * (1 - burst.age / 1.2);
            if (burstDistance > 0) {
              x += (bx / burstDistance) * wave * 16;
              y += (by / burstDistance) * wave * 16;
            }
          }
        }
        const alpha = 0.16 + (Math.sin(elapsed * 0.8 + particle.phase) + 1) * 0.15;
        const radius = particle.size * (particle.star ? 2 : 1);
        const halo = context.createRadialGradient(x, y, 0, x, y, radius * 4);
        halo.addColorStop(0, `rgba(208, 166, 66, ${alpha * 0.3})`);
        halo.addColorStop(1, 'rgba(208, 166, 66, 0)');
        context.fillStyle = halo;
        context.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8);
        context.fillStyle = `rgba(173, 126, 33, ${alpha})`;
        context.beginPath();
        if (particle.star) {
          context.moveTo(x, y - radius * 1.6);
          context.lineTo(x + radius * 0.28, y - radius * 0.28);
          context.lineTo(x + radius, y);
          context.lineTo(x + radius * 0.28, y + radius * 0.28);
          context.lineTo(x, y + radius * 1.6);
          context.lineTo(x - radius * 0.28, y + radius * 0.28);
          context.lineTo(x - radius, y);
          context.lineTo(x - radius * 0.28, y - radius * 0.28);
          context.closePath();
        } else context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    };
    const frame = (now: number) => {
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
      lastFrame = now;
      pointer.offsetX += ((pointer.active ? (pointer.x / width - 0.5) * 10 : 0) - pointer.offsetX) * 0.03;
      pointer.offsetY += ((pointer.active ? (pointer.y / height - 0.5) * 10 : 0) - pointer.offsetY) * 0.03;
      draw(delta);
      frameId = requestAnimationFrame(frame);
    };
    const resume = () => {
      cancelAnimationFrame(frameId);
      lastFrame = 0;
      if (motion.matches || document.hidden) {
        draw();
        return;
      }
      frameId = requestAnimationFrame(frame);
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };
    const move = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };
    const burst = (event: PointerEvent) => {
      if (motion.matches) return;
      move(event);
      bursts.push({ x: event.clientX, y: event.clientY, age: 0 });
      if (bursts.length > 3) bursts.shift();
    };
    const leave = () => {
      pointer.x = width / 2;
      pointer.y = height / 2;
      pointer.active = false;
    };
    const up = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') leave();
    };
    resize();
    leave();
    resume();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', burst, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', burst);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', resume);
      motion.removeEventListener('change', resume);
    };
  }, []);
  return <canvas ref={canvasRef} className="mystery-particles" aria-hidden="true" />;
}
