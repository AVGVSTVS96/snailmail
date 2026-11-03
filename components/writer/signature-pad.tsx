"use client";

import { useRef } from "react";

type Point = readonly [number, number];

function smooth(points: readonly Point[]) {
  if (points.length === 0) return "";
  const [first, ...rest] = points;

  if (rest.length === 0) return `M${first[0]},${first[1]} l0.1,0`;
  let d = `M${first[0].toFixed(1)},${first[1].toFixed(1)}`;

  for (let i = 0; i < rest.length - 1; i++) {
    const [x, y] = rest[i];
    const [nx, ny] = rest[i + 1];
    d += ` Q${x.toFixed(1)},${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)},${((y + ny) / 2).toFixed(1)}`;
  }

  const [lx, ly] = rest[rest.length - 1];

  return `${d} L${lx.toFixed(1)},${ly.toFixed(1)}`;
}

export function SignaturePad({
  value,
  ink,
  onChange,
}: {
  value: string | null;
  ink: string;
  onChange: (path: string | null) => void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const strokes = useRef<string[]>(value ? [value] : []);
  const current = useRef<Point[]>([]);
  const live = useRef<SVGPathElement>(null);

  function point(event: React.PointerEvent): Point {
    const box = svg.current?.getBoundingClientRect();

    if (!box) return [0, 0];

    return [((event.clientX - box.left) / box.width) * 300, ((event.clientY - box.top) / box.height) * 120];
  }

  function draw() {
    live.current?.setAttribute("d", [...strokes.current, smooth(current.current)].join(" "));
  }

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
          if (current.current.length === 0) return;
          current.current.push(point(event));
          draw();
        }}
        onPointerUp={() => {
          if (current.current.length === 0) return;
          strokes.current.push(smooth(current.current));
          current.current = [];
          onChange(strokes.current.join(" "));
        }}
        aria-label="Draw your signature"
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
}
