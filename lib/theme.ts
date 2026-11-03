export type Rgb = readonly [number, number, number];

export type Theme = {
  name: string;
  surface: string;
  surface2: string;
  surfaceText: string;
  envelope: string;
  envelopeShade: string;
  liner: string;
  linerInk: string;
  paper: string;
  ink: string;
  inkSoft: string;
  wax: string;
  waxHi: string;
  waxLo: string;
  grain: Rgb;
  postmarkInk: string;
  stamp: { paper: string; art: string; caption: string };
};

export const keepsake: Theme = {
  name: "Keepsake",
  surface: "#2B2320",
  surface2: "#3A2F29",
  surfaceText: "#E9DCC6",
  envelope: "#EFE5D2",
  envelopeShade: "#E2D5BC",
  liner: "#7B1E26",
  linerInk: "#EFE5D2",
  paper: "#F5EEE1",
  ink: "#2E2622",
  inkSoft: "#6B5D52",
  wax: "#7B1E26",
  waxHi: "#A23A40",
  waxLo: "#4A0F15",
  grain: [0.28, 0.2, 0.12],
  postmarkInk: "#2E2622",
  stamp: { paper: "#F3E7D3", art: "#7B1E26", caption: "LOVE" },
};

export const themes = { keepsake };

export type ThemeKey = keyof typeof themes;
