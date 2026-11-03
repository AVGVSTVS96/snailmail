import {
  Caveat,
  Cormorant_Garamond,
  Courier_Prime,
  EB_Garamond,
  Geist,
  Geist_Mono,
  IM_Fell_English,
  Mrs_Saint_Delafield,
  Ms_Madi,
  Newsreader,
  Pinyon_Script,
} from "next/font/google";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: ["400", "600"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: "400" });
const delafield = Mrs_Saint_Delafield({ variable: "--font-delafield", subsets: ["latin"], weight: "400" });
const fell = IM_Fell_English({ variable: "--font-fell", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: "500",
  style: "italic",
  preload: false,
});

const lazy = { subsets: ["latin"], preload: false } as const;
const courier = Courier_Prime({ ...lazy, variable: "--font-courier", weight: ["400", "700"] });
const newsreader = Newsreader({ ...lazy, variable: "--font-newsreader", style: ["normal", "italic"] });
const garamond = EB_Garamond({ ...lazy, variable: "--font-garamond", style: ["normal", "italic"] });
const madi = Ms_Madi({ ...lazy, variable: "--font-madi", weight: "400" });
const pinyon = Pinyon_Script({ ...lazy, variable: "--font-pinyon", weight: "400" });

export const fontVariables = [
  geist,
  geistMono,
  caveat,
  delafield,
  fell,
  cormorant,
  courier,
  newsreader,
  garamond,
  madi,
  pinyon,
]
  .map((font) => font.variable)
  .join(" ");
