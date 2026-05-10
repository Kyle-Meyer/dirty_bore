import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { GEOMETRY, SECTIONS } from '@/lib/config';
import {
  usePageStore,
  selectPhase,
  selectActiveChamber,
  selectHoveredChamber,
  selectCylinderActive,
} from '@/store/pageStore';
import type { Point, TweenHandle } from '@/types';

const { W, H, CX, CY, NUM, OUTER_R, CHAM_R, BODY_R, INNER_R } = GEOMETRY;

// ─────────────────────────────────────────────────────────────
// Pure geometry helpers (no React / store dependency)
// ─────────────────────────────────────────────────────────────

function getChamberCenter(i: number, rotation: number): Point {
  const angle = (Math.PI * 2 / NUM) * i + rotation;
  return {
    x: CX + OUTER_R * Math.cos(angle),
    y: CY + OUTER_R * Math.sin(angle),
  };
}

function chamberAt(mx: number, my: number, rotation: number): number {
  for (let i = 0; i < NUM; i++) {
    const c  = getChamberCenter(i, rotation);
    const dx = mx - c.x;
    const dy = my - c.y;
    if (dx * dx + dy * dy < CHAM_R * CHAM_R) return i;
  }
  return -1;
}

// ─────────────────────────────────────────────────────────────
// Canvas draw (pure function — takes all state as args)
// ─────────────────────────────────────────────────────────────

function drawCylinder(
  ctx: CanvasRenderingContext2D,
  rotation: number,
  loadedChamber: number,
  hoveredChamber: number,
): void {
  ctx.clearRect(0, 0, W, H);

  // Outer cylinder disc
  ctx.beginPath();
  ctx.arc(CX, CY, OUTER_R + CHAM_R + 2, 0, Math.PI * 2);
  ctx.fillStyle = '#1a0a0a';
  ctx.fill();
  ctx.strokeStyle = '#4a1818';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Spoke lines
  for (let i = 0; i < NUM; i++) {
    const angle = (Math.PI * 2 / NUM) * i + rotation;
    ctx.beginPath();
    ctx.moveTo(CX + BODY_R * Math.cos(angle), CY + BODY_R * Math.sin(angle));
    ctx.lineTo(
      CX + (OUTER_R - CHAM_R) * Math.cos(angle),
      CY + (OUTER_R - CHAM_R) * Math.sin(angle),
    );
    ctx.strokeStyle = '#3a1111';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Chambers
  for (let i = 0; i < NUM; i++) {
    const c        = getChamberCenter(i, rotation);
    const isLoaded = loadedChamber  === i;
    const isHover  = hoveredChamber === i;
    const col      = SECTIONS[i].color;

    ctx.beginPath();
    ctx.arc(c.x, c.y, CHAM_R, 0, Math.PI * 2);
    ctx.fillStyle   = isLoaded ? col : isHover ? '#2a0a0a' : '#150505';
    ctx.strokeStyle = isLoaded ? col : isHover ? col : '#3a1111';
    ctx.lineWidth   = isLoaded || isHover ? 1.5 : 0.5;
    ctx.fill();
    ctx.stroke();

    // Inner ring (unloaded only)
    if (!isLoaded) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = isHover ? col : '#3a1111';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Primer pin
    ctx.beginPath();
    ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isLoaded ? 'rgba(255,255,255,0.5)' : '#4a2020';
    ctx.fill();
  }

  // Centre hub
  ctx.beginPath();
  ctx.arc(CX, CY, BODY_R, 0, Math.PI * 2);
  ctx.fillStyle = '#150505';
  ctx.fill();
  ctx.strokeStyle = '#3a1111';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(CX, CY, INNER_R, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(CX, CY, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#cc2222';
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

interface UseRevolverReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Call from the wrapping div's onMouseMove */
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  /** Current tooltip data — null when hidden */
  tooltip: { label: string; x: number; y: number } | null;
}

export function useRevolver(
  wrapperRef: React.RefObject<HTMLElement>,
): UseRevolverReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation state lives in refs — never triggers React re-renders
  const rotation  = useRef<number>(0);
  const spinTween = useRef<TweenHandle | null>(null);
  const tooltipState = useRef<{ label: string; x: number; y: number } | null>(null);

  // Pull what we need from the store
  const phase          = usePageStore(selectPhase);
  const activeChamber  = usePageStore(selectActiveChamber);
  const hoveredChamber = usePageStore(selectHoveredChamber);
  const cylinderActive = usePageStore(selectCylinderActive);

  const {
    beginSpin,
    onSpinComplete,
    onSlideComplete,
    switchChamber,
    onSwitchComplete,
    onCloseComplete,
    setHoveredChamber,
  } = usePageStore.getState();

  // Pre-warm GSAP so its RAF ticker is running before the first click
  useEffect(() => {
    const t = gsap.to({}, { duration: 0.001 });
    return () => { t.kill(); };
  }, []);

  // ── Draw whenever relevant store values change ────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!ctx) return;
    drawCylinder(ctx, rotation.current, activeChamber, hoveredChamber);
  }, [activeChamber, hoveredChamber]);

  useEffect(() => { redraw(); }, [redraw]);

  // ── Phase sequencer ───────────────────────────────────────
  useEffect(() => {
    if (phase === 'SPINNING') {
      // Full dramatic open spin
      const obj = { r: rotation.current };
      const end = rotation.current + Math.PI * 2.8;
      gsap.to(obj, {
        r: end,
        duration: 1.0,
        ease: 'power3.out',
        onUpdate: () => {
          rotation.current = obj.r;
          redraw();
        },
        onComplete: () => {
          rotation.current = end % (Math.PI * 2);
          redraw();
          onSpinComplete();   // → SLIDING
        },
      });
    }

    if (phase === 'SLIDING') {
      const timer = setTimeout(onSlideComplete, 850);
      return () => clearTimeout(timer);
    }

    if (phase === 'CLOSING') {
      const timer = setTimeout(onCloseComplete, 850);
      return () => clearTimeout(timer);
    }

    if (phase === 'SWITCHING') {
      // Quick re-spin when user changes chamber while menu is open
      if (spinTween.current) spinTween.current.kill();
      const obj = { r: rotation.current };
      const end = rotation.current + Math.PI * (1.4 + Math.random() * 0.8);
      spinTween.current = gsap.to(obj, {
        r: end,
        duration: 0.55,
        ease: 'power2.out',
        onUpdate: () => {
          rotation.current = obj.r;
          redraw();
        },
        onComplete: () => {
          rotation.current  = end % (Math.PI * 2);
          spinTween.current = null;
          onSwitchComplete(); // → MENU_OPEN
        },
      });
    }
  }, [phase, redraw, onSpinComplete, onSlideComplete, onSwitchComplete, onCloseComplete]);

  // ── Tooltip helper ────────────────────────────────────────
  const getTooltipPosition = useCallback(
    (idx: number): { label: string; x: number; y: number } | null => {
      const canvas  = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return null;

      const canvasRect  = canvas.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const scale       = canvasRect.width / W;
      const c           = getChamberCenter(idx, rotation.current);

      return {
        label: SECTIONS[idx].label,
        x: canvasRect.left - wrapperRect.left + c.x * scale,
        y: canvasRect.top  - wrapperRect.top  + c.y * scale - CHAM_R * scale - 6,
      };
    },
    [wrapperRef],
  );

  // ── Canvas event handlers ─────────────────────────────────

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!cylinderActive) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx   = (e.clientX - rect.left) * (W / rect.width);
      const my   = (e.clientY - rect.top)  * (H / rect.height);
      const idx  = chamberAt(mx, my, rotation.current);

      if (idx !== hoveredChamber) {
        setHoveredChamber(idx);
        tooltipState.current = idx >= 0 ? getTooltipPosition(idx) : null;
      } else if (idx >= 0) {
        tooltipState.current = getTooltipPosition(idx);
      }
    },
    [cylinderActive, hoveredChamber, setHoveredChamber, getTooltipPosition],
  );

  const onMouseLeave = useCallback(() => {
    setHoveredChamber(-1);
    tooltipState.current = null;
  }, [setHoveredChamber]);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!cylinderActive) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx   = (e.clientX - rect.left) * (W / rect.width);
      const my   = (e.clientY - rect.top)  * (H / rect.height);
      const idx  = chamberAt(mx, my, rotation.current);
      if (idx < 0) return;

      tooltipState.current = null;

      if (phase === 'IDLE') {
        beginSpin(idx);
      } else if (phase === 'MENU_OPEN' && idx !== activeChamber) {
        switchChamber(idx);
      }
    },
    [cylinderActive, phase, activeChamber, beginSpin, switchChamber],
  );

  return {
    canvasRef,
    onMouseMove,
    onMouseLeave,
    onClick,
    tooltip: tooltipState.current,
  };
}
