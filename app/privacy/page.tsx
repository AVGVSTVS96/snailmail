import type { Metadata } from "next";
import { Policy } from "@/components/policy";

export const metadata: Metadata = { title: "Privacy · snailmail" };

export default function Privacy() {
  return (
    <Policy title="Privacy">
      <p className="keep-text">
        When you sign in with Google, snailmail gets your name, email address and profile picture. It uses them to show
        who you are, sign your letters and email you when a letter is opened. Nothing else is asked of your Google
        account.
      </p>
      <p className="keep-text">
        snailmail keeps the letters you write: the words, the envelope, and any photo, video or voice note you add.
        Anyone with a letter’s link can read it, so share the link only with the person it’s for.
      </p>
      <p className="keep-text">
        When a letter is opened, snailmail counts the open. To stop people guessing links, it briefly counts wrong links
        per network.
      </p>
      <p className="keep-text">
        There are no ads or trackers, and nothing is sold or shared beyond the services that run snailmail: WorkOS for
        sign-in, Convex for storage, Vercel for hosting. Delete a letter from your letters page and it’s gone.
      </p>
      <p className="keep-text">
        Questions: <a href="https://github.com/AVGVSTVS96/snailmail/issues">github.com/AVGVSTVS96/snailmail</a>
      </p>
    </Policy>
  );
}
