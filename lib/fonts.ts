import { Caveat, Cormorant_Garamond, Geist, Geist_Mono, IM_Fell_English, Mrs_Saint_Delafield } from "next/font/google";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: ["400", "600"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: "400" });
const delafield = Mrs_Saint_Delafield({ variable: "--font-delafield", subsets: ["latin"], weight: "400" });
const fell = IM_Fell_English({ variable: "--font-fell", subsets: ["latin"], weight: "400" });

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: "500",
  style: "italic",
  preload: false,
});

export const fontVariables = [geist, geistMono, caveat, delafield, fell, cormorant]
  .map((font) => font.variable)
  .join(" ");
