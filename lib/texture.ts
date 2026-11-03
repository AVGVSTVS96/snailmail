import type { Rgb, Theme } from "./theme";

function svgUrl(svg: string) {
  return `url(data:image/svg+xml;base64,${btoa(svg)})`;
}

export function grain(alpha: number, frequency: number, [r, g, b]: Rgb) {
  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${alpha} 0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`,
  );
}

export function mottle(alpha: number, [r, g, b]: Rgb) {
  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${alpha * 6} -${alpha * 2.2}'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`,
  );
}

const laid =
  "repeating-linear-gradient(90deg, rgba(120,90,60,0) 0px, rgba(120,90,60,0) 5px, rgba(120,90,60,0.045) 5px, rgba(120,90,60,0.045) 6px)";

export function themeStyle(theme: Theme) {
  return {
    "--surface": theme.surface,
    "--surface-text": theme.surfaceText,
    "--envelope": theme.envelope,
    "--paper": theme.paper,
    "--ink": theme.ink,
    "--ink-soft": theme.inkSoft,
    "--surface-bg": `${grain(0.07, 0.7, [0.6, 0.55, 0.5])}, radial-gradient(ellipse 120% 70% at 50% 40%, ${theme.surface2} 0%, ${theme.surface} 72%)`,
    "--paper-bg": `${grain(0.11, 0.9, theme.grain)}, ${mottle(0.016, theme.grain)}, ${laid}`,
    "--envelope-bg": `${grain(0.12, 0.8, theme.grain)}, ${mottle(0.03, theme.grain)}`,
  };
}
