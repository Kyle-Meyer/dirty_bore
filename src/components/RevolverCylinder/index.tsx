import { useRef } from 'react';
import { useRevolver } from '@/hooks/useRevolver';
import { usePageStore, selectPhase } from '@/store/pageStore';
import { GEOMETRY } from '@/lib/config';
import styles from './RevolverCylinder.module.css';

const { W, H } = GEOMETRY;

// ─────────────────────────────────────────────────────────────
// Tooltip
// ─────────────────────────────────────────────────────────────

interface TooltipProps {
  label: string;
  x: number;
  y: number;
}

function Tooltip({ label, x, y }: TooltipProps) {
  return (
    <div
      className={styles.tooltip}
      style={{ left: x, top: y }}
      role="tooltip"
    >
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RevolverCylinder
// ─────────────────────────────────────────────────────────────

export default function RevolverCylinder() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const phase      = usePageStore(selectPhase);

  const { canvasRef, onMouseMove, onMouseLeave, onClick, tooltip } =
    useRevolver(wrapperRef);

  // CSS class drives the translate-left animation.
  // 'fired' = any phase where the revolver is off-centre.
  const isFired =
    phase === 'SLIDING'      ||
    phase === 'MENU_OPEN'    ||
    phase === 'SWITCHING'    ||
    phase === 'CONTENT_OPEN' ||
    phase === 'CLOSING';

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrap} ${isFired ? styles.fired : ''}`}
    >
      <canvas
        ref={canvasRef}
        id="rev"
        width={W}
        height={H}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        aria-label="Revolver navigation cylinder — click a chamber to open its menu"
      />

      {tooltip && (
        <Tooltip label={tooltip.label} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
