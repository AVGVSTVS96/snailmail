import Link from "next/link";
import { keepsake } from "@/lib/theme";
import { themeStyle } from "@/lib/texture";

export default function NotFound() {
  return (
    <main className="desk missing" style={themeStyle(keepsake)}>
      <h1 className="keep-title">This letter isn’t here anymore.</h1>
      <p className="keep-text">The link may be mistyped, or the writer took the letter back.</p>
      <Link className="credit-site" href="/">
        snailmail
      </Link>
    </main>
  );
}
