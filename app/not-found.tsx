import Link from "next/link";

import { themeStyle } from "@/lib/texture";
import { keepsake } from "@/lib/theme";

const NotFound = () => (
  <main className="desk missing" style={themeStyle(keepsake)}>
    <h1 className="keep-title">This letter isn’t here anymore.</h1>
    <p className="keep-text">The link may be mistyped, or the writer took the letter back.</p>
    <Link className="credit-site" href="/">
      snailmail
    </Link>
  </main>
);

export default NotFound;
