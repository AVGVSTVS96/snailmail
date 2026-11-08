"use client";

import { useRef } from "react";

type Point = readonly [number, number];

const smooth = (points: readonly Point[]) => {
  const [first, ...rest] = points;

  if (first === undefined) {
    return "";
  }

  const last = rest.at(-1);

  if (last === undefined) {
    return `M${first[0]},${first[1]} l0.1,0`;
  }

  let d = `M${first[0].toFixed(1)},${first[1].toFixed(1)}`;
  let control: Point | null = null;

  for (const [nx, ny] of rest) {
    if (control !== null) {
      const [x, y] = control;
      d += ` Q${x.toFixed(1)},${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)},${((y + ny) / 2).toFixed(1)}`;
    }

    control = [nx, ny];
  }

  return `${d} L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
};

export const SignaturePad = ({
  value,
  ink,
  onChange,
}: {
  value: string | null;
  ink: string;
  onChange: (path: string | null) => void;
}) => {
  const svg = useRef<SVGSVGElement>(null);
  const strokes = useRef<string[]>(value === null || value === "" ? [] : [value]);
  const current = useRef<Point[]>([]);
  const live = useRef<SVGPathElement>(null);

  const point = (event: React.PointerEvent): Point => {
    const box = svg.current?.getBoundingClientRect();

    if (!box) {
      return [0, 0];
    }

    return [
      ((event.clientX - box.left) / box.width) * 300,
      ((event.clientY - box.top) / box.height) * 120,
    ];
  };

  const draw = () => {
    live.current?.setAttribute("d", [...strokes.current, smooth(current.current)].join(" "));
  };

  return (
    <div className="w-sign-pad">
      <svg
        ref={svg}
        viewBox="0 0 300 120"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          current.current = [point(event)];
          draw();
        }}
        onPointerMove={(event) => {
          if (current.current.length === 0) {
            return;
          }

          current.current.push(point(event));
          draw();
        }}
        onPointerUp={() => {
          if (current.current.length === 0) {
            return;
          }

          strokes.current.push(smooth(current.current));
          current.current = [];
          onChange(strokes.current.join(" "));
        }}
        aria-label="Draw your signature"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- the pad is a live SVG drawing surface, which an <img> can't be
        role="img"
      >
        <line x1="20" y1="96" x2="280" y2="96" className="w-sign-line" />
        <path ref={live} d={value ?? ""} stroke={ink} />
      </svg>
      <button
        type="button"
        className="w-text-button"
        onClick={() => {
          strokes.current = [];
          live.current?.setAttribute("d", "");
          onChange(null);
        }}
      >
        Clear
      </button>
    </div>
  );
};
