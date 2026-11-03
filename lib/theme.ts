export type Rgb = readonly [number, number, number];

export const papers = {
  cotton: { name: "Cotton", color: "#F5EEE1" },
  ivory: { name: "Ivory", color: "#EFE8DA" },
  onionskin: { name: "Onionskin", color: "#E6ECF1" },
  kraft: { name: "Kraft", color: "#D9C3A0" },
  bone: { name: "Bone", color: "#F4F1E7" },
  black: { name: "Black", color: "#15161D" },
} as const;

export const finishes = { plain: "Plain", laid: "Laid", ruled: "Ruled", deckle: "Deckle" } as const;

export const inks = {
  ironGall: { name: "Iron gall", color: "#2E2622", soft: "#6B5D52" },
  navy: { name: "Navy", color: "#1E2F52", soft: "#55678A" },
  oxblood: { name: "Oxblood", color: "#6E1A22", soft: "#8A5458" },
  moss: { name: "Moss", color: "#34402A", soft: "#6A7360" },
  sepia: { name: "Sepia", color: "#3A2E25", soft: "#7A6B5C" },
  pale: { name: "Pale", color: "#ECE3CF", soft: "#9C9584" },
} as const;

export const typefaces = {
  handwritten: { name: "Handwritten", family: "Caveat", font: "var(--font-caveat)" },
  letterpress: { name: "Letterpress", family: "IM Fell English", font: "var(--font-fell)" },
  clean: { name: "Clean", family: "Newsreader", font: "var(--font-newsreader)" },
  typewriter: { name: "Typewriter", family: "Courier Prime", font: "var(--font-courier)" },
  book: { name: "Book serif", family: "EB Garamond", font: "var(--font-garamond)" },
} as const;

export const waxes = {
  oxblood: { name: "Oxblood", wax: "#7B1E26", hi: "#A23A40", lo: "#4A0F15" },
  navy: { name: "Navy", wax: "#23407A", hi: "#3E5D9A", lo: "#142748" },
  moss: { name: "Moss", wax: "#5C6B4A", hi: "#7D8C68", lo: "#3A4630" },
  gold: { name: "Gold", wax: "#B8914A", hi: "#E0C27E", lo: "#7A5C26" },
  blush: { name: "Blush", wax: "#C98C8A", hi: "#E2B0AE", lo: "#94605E" },
  black: { name: "Black", wax: "#222024", hi: "#4A464C", lo: "#0E0D10" },
} as const;

export const emblems = {
  initial: "Initial",
  heart: "Heart",
  star: "Star",
  flower: "Flower",
  moon: "Moon",
  snail: "Snail",
} as const;

export const stamps = {
  snail: { name: "Snail", paper: "#F3E7D3", art: "#7B1E26", caption: "LOVE" },
  swallow: { name: "Swallow", paper: "#DCE6F1", art: "#23407A", caption: "PAR AVION" },
  poppy: { name: "Poppy", paper: "#EEF0E2", art: "#B5543F", caption: "FLORA" },
  moon: { name: "Moon", paper: "#1F2540", art: "#E0C27E", caption: "NOCTURNE" },
  heart: { name: "Heart", paper: "#F6E4E1", art: "#B23A48", caption: "AMOR" },
  bridge: { name: "Bridge", paper: "#F4E4D2", art: "#C0462B", caption: "SAN FRANCISCO" },
} as const;

export const liners = {
  none: "None",
  dots: "Dots",
  stripes: "Stripes",
  sprigs: "Sprigs",
  stars: "Stars",
  marble: "Marble",
} as const;

export type PaperKey = keyof typeof papers;

export type FinishKey = keyof typeof finishes;

export type InkKey = keyof typeof inks;

export type TypefaceKey = keyof typeof typefaces;

export type WaxKey = keyof typeof waxes;

export type EmblemKey = keyof typeof emblems;

export type StampKey = keyof typeof stamps;

export type LinerKey = keyof typeof liners;

export type Style = {
  paper: PaperKey;
  finish: FinishKey;
  ink: InkKey;
  typeface: TypefaceKey;
  wax: WaxKey;
  emblem: EmblemKey;
  stamp: StampKey;
  liner: LinerKey;
};

type Base = {
  name: string;
  mood: string;
  blurb: string;
  surface: string;
  surface2: string;
  surfaceText: string;
  envelope: string;
  envelopeShade: string;
  envelopeInk: string;
  liner: string;
  linerInk: string;
  grain: Rgb;
  postmarkInk: string;
  darkDesk: boolean;
  address: "script" | "typewriter" | "display" | "letterpress";
  signature: { font: string; scale: number; rotate: number; hi: boolean };
  letterhead: "emboss" | "airmail" | "seal";
  airmail: boolean;
  sprig: boolean;
  style: Style;
};

const bases = {
  keepsake: {
    name: "Keepsake",
    mood: "Candlelit",
    blurb: "Cream cotton paper on a walnut desk, oxblood wax, a hand-written letter.",
    surface: "#2B2320",
    surface2: "#3A2F29",
    surfaceText: "#E9DCC6",
    envelope: "#EFE5D2",
    envelopeShade: "#E2D5BC",
    envelopeInk: "#2E2622",
    liner: "#7B1E26",
    linerInk: "#EFE5D2",
    grain: [0.28, 0.2, 0.12],
    postmarkInk: "#2E2622",
    darkDesk: true,
    address: "script",
    signature: { font: "var(--font-delafield)", scale: 1, rotate: -4, hi: false },
    letterhead: "emboss",
    airmail: false,
    sprig: false,
    style: {
      paper: "cotton",
      finish: "laid",
      ink: "ironGall",
      typeface: "handwritten",
      wax: "oxblood",
      emblem: "initial",
      stamp: "snail",
      liner: "dots",
    },
  },
  parAvion: {
    name: "Par Avion",
    mood: "Maritime",
    blurb: "Thin airmail paper, a red-and-navy border and a typed letter.",
    surface: "#C9D3DC",
    surface2: "#B8C4CF",
    surfaceText: "#1E2F52",
    envelope: "#F7F5EF",
    envelopeShade: "#ECE8DE",
    envelopeInk: "#1E2F52",
    liner: "#23407A",
    linerInk: "#F7F5EF",
    grain: [0.15, 0.2, 0.3],
    postmarkInk: "#1E2F52",
    darkDesk: false,
    address: "typewriter",
    signature: { font: "var(--font-madi)", scale: 58 / 66, rotate: -3, hi: false },
    letterhead: "airmail",
    airmail: true,
    sprig: false,
    style: {
      paper: "onionskin",
      finish: "plain",
      ink: "navy",
      typeface: "typewriter",
      wax: "navy",
      emblem: "initial",
      stamp: "swallow",
      liner: "stripes",
    },
  },
  pressed: {
    name: "Pressed",
    mood: "Botanical",
    blurb: "Deckle-edged cotton paper with a pressed flower and moss-green wax.",
    surface: "#DCDCCB",
    surface2: "#CFD0BC",
    surfaceText: "#3D4A30",
    envelope: "#F2EEE3",
    envelopeShade: "#E7E1D2",
    envelopeInk: "#3A2E25",
    liner: "#5C6B4A",
    linerInk: "#E9E4D3",
    grain: [0.25, 0.25, 0.15],
    postmarkInk: "#3A2E25",
    darkDesk: false,
    address: "display",
    signature: { font: "var(--font-pinyon)", scale: 48 / 66, rotate: -2, hi: false },
    letterhead: "emboss",
    airmail: false,
    sprig: true,
    style: {
      paper: "bone",
      finish: "deckle",
      ink: "sepia",
      typeface: "book",
      wax: "moss",
      emblem: "flower",
      stamp: "poppy",
      liner: "sprigs",
    },
  },
  midnight: {
    name: "Midnight",
    mood: "Inky",
    blurb: "Black paper and pale ink, gold wax, a night-blue envelope.",
    surface: "#0C0C10",
    surface2: "#16161C",
    surfaceText: "#D9C9A0",
    envelope: "#1B1E2C",
    envelopeShade: "#141623",
    envelopeInk: "#D9C9A0",
    liner: "#B8914A",
    linerInk: "#1B1E2C",
    grain: [0.9, 0.85, 0.7],
    postmarkInk: "#D9C9A0",
    darkDesk: true,
    address: "letterpress",
    signature: { font: "var(--font-delafield)", scale: 1, rotate: -4, hi: true },
    letterhead: "seal",
    airmail: false,
    sprig: false,
    style: {
      paper: "black",
      finish: "plain",
      ink: "pale",
      typeface: "letterpress",
      wax: "gold",
      emblem: "moon",
      stamp: "moon",
      liner: "stars",
    },
  },
} satisfies Record<string, Base>;

export type ThemeKey = keyof typeof bases;

// SAFETY: Object.keys of a literal object returns exactly its keys
export const themeKeys = Object.keys(bases) as ReadonlyArray<ThemeKey>;

export type Theme = Omit<Base, "style"> & {
  key: ThemeKey;
  style: Style;
  paper: string;
  paperDark: boolean;
  ink: string;
  inkSoft: string;
  face: string;
  wax: string;
  waxHi: string;
  waxLo: string;
  stamp: { kind: StampKey; paper: string; art: string; caption: string };
};

function luminance(hex: string) {
  const channel = (i: number) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;

    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi + 0.05) / (lo + 0.05);
}

export function inkFits(ink: InkKey, paper: PaperKey) {
  return contrast(inks[ink].color, papers[paper].color) >= 4.5;
}

export function defaultStyle(key: ThemeKey): Style {
  return { ...bases[key].style };
}

export function resolveTheme(key: ThemeKey, style: Partial<Style> = {}): Theme {
  const base = bases[key];
  const chosen: Style = { ...base.style, ...style };

  if (!inkFits(chosen.ink, chosen.paper)) {
    // SAFETY: Object.keys of a literal object returns exactly its keys
    const fitting = (Object.keys(inks) as InkKey[]).find((ink) => inkFits(ink, chosen.paper));
    chosen.ink = fitting ?? chosen.ink;
  }

  const ink = inks[chosen.ink];
  const wax = waxes[chosen.wax];
  const stamp = stamps[chosen.stamp];
  const paper = papers[chosen.paper].color;
  const ownInk = chosen.ink !== base.style.ink && contrast(ink.color, base.envelope) >= 4.5;

  return {
    ...base,
    key,
    style: chosen,
    paper,
    paperDark: luminance(paper) < 0.2,
    ink: ink.color,
    inkSoft: ink.soft,
    envelopeInk: ownInk ? ink.color : base.envelopeInk,
    face: typefaces[chosen.typeface].font,
    wax: wax.wax,
    waxHi: wax.hi,
    waxLo: wax.lo,
    liner: chosen.wax === base.style.wax ? base.liner : wax.wax,
    stamp: { kind: chosen.stamp, paper: stamp.paper, art: stamp.art, caption: stamp.caption },
  };
}

export const keepsake = resolveTheme("keepsake");

export const themes = {
  keepsake,
  parAvion: resolveTheme("parAvion"),
  pressed: resolveTheme("pressed"),
  midnight: resolveTheme("midnight"),
};
