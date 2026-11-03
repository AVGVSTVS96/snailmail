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

function deckleEdge(width: number, height: number, seed: number) {
  let a = seed;

  const next = () => {
    a = (a * 16807) % 2147483647;

    return a / 2147483647;
  };

  const points = Array.from({ length: 31 }, (_, i) => `${((i * width) / 30).toFixed(1)},${(next() * 3).toFixed(1)}`);

  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><path d='M0,${height} L${points.join(" L")} L${width},${height} Z' fill='#000'/></svg>`,
  );
}

const edge = deckleEdge(120, 4, 7);
const side = deckleEdge(120, 4, 13);

export const deckleMask = {
  image: `linear-gradient(#000,#000), ${edge}, ${edge}, ${side}, ${side}`,
};

export function themeStyle(theme: Theme) {
  const paperGrain = theme.paperDark ? 0.07 : 0.11;
  const paperMottle = theme.paperDark ? 0.006 : 0.016;
  const envelopeDark = theme.key === "midnight";
  const finish = theme.style.finish === "laid" ? `, ${laid}` : "";
  const surfaceTint: Rgb = theme.darkDesk ? [0.6, 0.55, 0.5] : [0.2, 0.2, 0.2];

  return {
    "--surface": theme.surface,
    "--surface-text": theme.surfaceText,
    "--envelope": theme.envelope,
    "--paper": theme.paper,
    "--ink": theme.ink,
    "--ink-soft": theme.inkSoft,
    "--wax-hi": theme.waxHi,
    "--letter-face": theme.face,
    "--deckle": deckleMask.image,
    "--sign-face": theme.signature.font,
    "--sign-scale": String(theme.signature.scale),
    "--sign-rotate": `${theme.signature.rotate}deg`,
    "--sign-color": theme.signature.hi ? theme.waxHi : theme.ink,
    "--surface-bg": `${grain(0.07, 0.7, surfaceTint)}, radial-gradient(ellipse 120% 70% at 50% 40%, ${theme.surface2} 0%, ${theme.surface} 72%)`,
    "--paper-bg": `${grain(paperGrain, 0.9, theme.grain)}, ${mottle(paperMottle, theme.grain)}${finish}`,
    "--envelope-bg": `${grain(envelopeDark ? 0.07 : 0.12, 0.8, theme.grain)}, ${mottle(envelopeDark ? 0.008 : 0.03, theme.grain)}`,
  };
}

export function deskProps(theme: Theme) {
  return {
    style: themeStyle(theme),
    "data-theme": theme.key,
    "data-face": theme.style.typeface,
    "data-finish": theme.style.finish,
    "data-light": theme.darkDesk ? undefined : "",
    "data-paper-dark": theme.paperDark ? "" : undefined,
  };
}
