import type { Metadata } from "next";
import { Suspense } from "react";

import { SealedEnvelope } from "@/components/mail/sealed";
import { bookUrl, Wordmark } from "@/components/writer/chrome";
import { GoogleButton } from "@/components/writer/google-button";
import { deskProps } from "@/lib/texture";
import { keepsake } from "@/lib/theme";

import "../letters/writer.css";

export const metadata: Metadata = { title: "Sign in · snailmail" };

const google = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
    />
  </svg>
);

const SignIn = () => (
  <main className="w-signin">
    <section className="desk w-signin-desk" {...deskProps(keepsake)}>
      <SealedEnvelope
        theme={keepsake}
        from="Avery"
        initial="A"
        seed={11}
        className="w-signin-envelope"
      />
      <footer className="w-signin-credit">
        <div className="credit-label">MAIL ART INSPIRED BY</div>
        <a className="credit-title" href={bookUrl} target="_blank" rel="noreferrer">
          The Art of Snail Mail
        </a>
        <div className="credit-by">by Martina Calvi · Quadrille, 2026</div>
      </footer>
    </section>
    <section className="w-signin-form">
      <Wordmark />
      <div className="w-signin-copy">
        <h1>Letters worth opening.</h1>
        <p>
          Write a letter, seal it with wax and send it as a link. It arrives in an envelope and
          opens like real mail.
        </p>
        <Suspense
          fallback={
            <a className="w-google" href="/auth/google">
              {google()}
              Continue with Google
            </a>
          }
        >
          <GoogleButton>
            {google()}
            Continue with Google
          </GoogleButton>
        </Suspense>
        <p className="w-fine">Sign-in by WorkOS. Opening a letter never needs an account.</p>
      </div>
      <div className="w-fine w-signin-foot">snailmail</div>
    </section>
  </main>
);

export default SignIn;
