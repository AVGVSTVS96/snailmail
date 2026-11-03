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
const fell = IM_Fell_English({
  variable: "--font-fell",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: "500",
  style: "italic",
  preload: false,
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  preload: false,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  preload: false,
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  preload: false,
});
const madi = Ms_Madi({ variable: "--font-madi", subsets: ["latin"], weight: "400", preload: false });
const pinyon = Pinyon_Script({ variable: "--font-pinyon", subsets: ["latin"], weight: "400", preload: false });

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
