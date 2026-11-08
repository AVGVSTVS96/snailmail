import type { Metadata } from "next";
import { Policy } from "@/components/policy";

export const metadata: Metadata = { title: "Terms · snailmail" };

export default function Terms() {
  return (
    <Policy title="Terms">
      <p className="keep-text">
        snailmail is free to use. Write letters you have the right to send, and nothing unlawful, hateful or meant to
        harm the person reading it.
      </p>
      <p className="keep-text">
        Your letters are yours. You let snailmail store and show them to whoever has their link, until you delete them.
      </p>
      <p className="keep-text">
        snailmail comes as it is, without promises that it will always be up or keep every letter forever. A letter that
        breaks these terms can be taken down.
      </p>
      <p className="keep-text">
        Questions: <a href="https://github.com/AVGVSTVS96/snailmail/issues">github.com/AVGVSTVS96/snailmail</a>
      </p>
    </Policy>
  );
}
