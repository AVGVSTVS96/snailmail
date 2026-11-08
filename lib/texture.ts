import type { Rgb, Theme } from "./theme";

const svgUrl = (svg: string) => `url(data:image/svg+xml;base64,${btoa(svg)})`;

export const grain = (alpha: number, frequency: number, [r, g, b]: Rgb) =>
  svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${alpha} 0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`,
  );

export const mottle = (alpha: number, [r, g, b]: Rgb) =>
  svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${alpha * 6} -${alpha * 2.2}'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`,
  );

const laid =
  "repeating-linear-gradient(90deg, rgba(120,90,60,0) 0px, rgba(120,90,60,0) 5px, rgba(120,90,60,0.045) 5px, rgba(120,90,60,0.045) 6px)";

type Edge = "top" | "bottom" | "left" | "right";

const tile = 240;
const depth = 5;

const tornEdge = (edge: Edge, seed: number) => {
  let a = seed;

  const random = () => {
    a = (a * 16_807) % 2_147_483_647;

    return a / 2_147_483_647;
  };

  let wander = 1.8;

  const bites = Array.from({ length: tile / 2 }, () => {
    wander = Math.min(2.8, Math.max(0.8, wander + (random() - 0.5) * 0.8));

    return Math.min(3.6, Math.max(0.3, wander + (random() - 0.5) * 1.2));
  });

  bites.push(bites[0] ?? 1.8);

  const place = (along: number, bite: number) => {
    const corners: Record<Edge, [number, number]> = {
      top: [along, bite],
      bottom: [along, depth - bite],
      left: [bite, along],
      right: [depth - bite, along],
    };

    const [x, y] = corners[edge];

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const fibres = bites.map((bite) => Math.max(0, bite - 0.3 - random() * 0.8));
  fibres[fibres.length - 1] = fibres[0] ?? 0;
  const line = (depths: number[]) => depths.map((bite, i) => place(i * 2, bite)).join(" L");
  const inner = place(0, depth);
  const innerEnd = place(tile, depth);
  const [w, h] = edge === "top" || edge === "bottom" ? [tile, depth] : [depth, tile];

  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='M${inner} L${line(fibres)} L${innerEnd} Z' fill-opacity='0.4'/><path d='M${inner} L${line(bites)} L${innerEnd} Z'/></svg>`,
  );
};

const deckle = {
  "--deckle-top": tornEdge("top", 7),
  "--deckle-bottom": tornEdge("bottom", 11),
  "--deckle-left": tornEdge("left", 13),
  "--deckle-right": tornEdge("right", 17),
};

export const themeStyle = (theme: Theme) => {
  const paperGrain = theme.paperDark ? 0.07 : 0.11;
  const paperMottle = theme.paperDark ? 0.006 : 0.016;
  const envelopeDark = theme.key === "midnight";
  const finish = theme.style.finish === "laid" ? `, ${laid}` : "";
  const surfaceTint: Rgb = theme.darkDesk ? [0.6, 0.55, 0.5] : [0.2, 0.2, 0.2];

  const style = {
    "--surface": theme.surface,
    "--surface-text": theme.surfaceText,
    "--envelope": theme.envelope,
    "--paper": theme.paper,
    "--ink": theme.ink,
    "--ink-soft": theme.inkSoft,
    "--wax-hi": theme.waxHi,
    "--letter-face": theme.face,
    "--sign-face": theme.signature.font,
    "--sign-scale": String(theme.signature.scale),
    "--sign-rotate": `${theme.signature.rotate}deg`,
    "--sign-color": theme.signature.hi ? theme.waxHi : theme.ink,
    "--surface-bg": `${grain(0.07, 0.7, surfaceTint)}, radial-gradient(ellipse 120% 70% at 50% 40%, ${theme.surface2} 0%, ${theme.surface} 72%)`,
    "--paper-bg": `${grain(paperGrain, 0.9, theme.grain)}, ${mottle(paperMottle, theme.grain)}${finish}`,
    "--envelope-bg": `${grain(envelopeDark ? 0.07 : 0.12, 0.8, theme.grain)}, ${mottle(envelopeDark ? 0.008 : 0.03, theme.grain)}`,
  };

  return theme.style.finish === "deckle" ? { ...style, ...deckle } : style;
};

export const deskProps = (theme: Theme) => ({
  style: themeStyle(theme),
  "data-theme": theme.key,
  "data-face": theme.style.typeface,
  "data-finish": theme.style.finish,
  "data-light": theme.darkDesk ? undefined : "",
  "data-paper-dark": theme.paperDark ? "" : undefined,
});
