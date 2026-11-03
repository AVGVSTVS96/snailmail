import { Envelope } from "@/components/mail/envelope";
import { keepsake } from "@/lib/theme";
import { deskProps } from "@/lib/texture";

const sample = {
  to: "June",
  toPlace: "Brooklyn, New York",
  from: "Avery",
  openWhen: "you have a quiet minute",
  postmark: { city: "SAN FRANCISCO", date: "NOV 2", year: "2026" },
};

export default function Home() {
  return (
    <main className="desk home" {...deskProps(keepsake)}>
      <section className="home-copy">
        <div className="wordmark">
          <span className="wordmark-dot" />
          snailmail
        </div>
        <h1>A letter, sent as a link, that opens like real mail.</h1>
        <p>
          The person you write to gets an envelope with a stamp and a postmark, breaks a wax seal, unfolds the letter
          and reads it on paper.
        </p>
      </section>
      <div className="home-envelope" aria-hidden>
        <Envelope theme={keepsake} address={sample} seed={7} initial="A" />
      </div>
      <footer className="credit home-credit">
        <div className="credit-label">MAIL ART INSPIRED BY</div>
        <a className="credit-title" href="https://www.penguin.co.uk/books/481503" target="_blank" rel="noreferrer">
          The Art of Snail Mail
        </a>
        <div className="credit-by">by Martina Calvi · Quadrille, 2026</div>
      </footer>
    </main>
  );
}
