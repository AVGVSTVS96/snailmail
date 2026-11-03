"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";
import { Wordmark } from "./chrome";

export function Nav() {
  const { user } = useAuth();
  const letter = (user?.firstName ?? user?.email ?? "").slice(0, 1).toUpperCase();

  return (
    <header className="w-nav">
      <Wordmark />
      <nav className="w-nav-links">
        <Link href="/letters" className="w-nav-on">
          Letters
        </Link>
      </nav>
      <div className="w-nav-user">
        <span className="w-nav-email">{user?.email}</span>
        <details className="w-avatar-menu">
          <summary className="w-avatar" aria-label="Account">
            {user?.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt="" referrerPolicy="no-referrer" />
            ) : (
              letter
            )}
          </summary>
          <form action="/sign-out" method="post" className="w-menu">
            <button type="submit">Sign out</button>
          </form>
        </details>
      </div>
    </header>
  );
}
