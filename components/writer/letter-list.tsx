"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { seedFrom } from "@/lib/delivery";
import { letterLink } from "@/lib/links";
import { resolveTheme } from "@/lib/theme";

import { Credit, MiniEnvelope } from "./chrome";
import { CopyButton } from "./copy";
import { Nav } from "./nav";
import { useHosts } from "./providers";
import { ago, day } from "./time";

const opened = (opens: number, at: number | null) => {
  if (opens === 0) {
    return { main: "Not opened yet", sub: "" };
  }

  return {
    main: opens === 1 ? "Opened once" : `Opened ${opens} times`,
    sub: at ? `last ${ago(at)}` : "",
  };
};

const count = (sent: number, drafts: number) => {
  if (sent + drafts === 0) {
    return "Nothing sealed yet";
  }

  const parts = [
    sent ? `${sent} sent` : "",
    drafts ? `${drafts} ${drafts === 1 ? "draft" : "drafts"}` : "",
  ];

  return parts.filter(Boolean).join(", ");
};

export const LetterList = () => {
  const letters = useQuery(api.writer.letters);
  const create = useMutation(api.writer.create);
  const router = useRouter();
  const hosts = useHosts();
  const { user } = useAuth();
  const [making, setMaking] = useState(false);

  const newLetter = async () => {
    setMaking(true);

    const id = await create({
      from: user?.firstName ?? "",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    router.push(`/letters/${id}`);
  };

  const sent = letters?.filter((letter) => letter.status === "published").length ?? 0;
  const drafts = (letters?.length ?? 0) - sent;

  return (
    <div className="writer">
      <Nav />
      <main className="w-page">
        <div className="w-head">
          <div>
            <h1>Letters</h1>
            <p className="w-count">{letters ? count(sent, drafts) : " "}</p>
          </div>
          <button
            type="button"
            className="w-button w-primary"
            onClick={newLetter}
            disabled={making}
          >
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M8 2.5v11M2.5 8h11" />
            </svg>
            New letter
          </button>
        </div>

        {letters && letters.length === 0 ? (
          <div className="w-empty">
            <p className="w-empty-title">Your first letter is a blank sheet away.</p>
            <p>Pick a theme, write it on paper, seal it with wax, and send the link.</p>
          </div>
        ) : (
          <table className="w-table">
            <thead>
              <tr>
                <th>Letter</th>
                <th>Theme</th>
                <th>Status</th>
                <th>Link</th>
                <th>Opened</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {letters?.map((letter) => {
                const published = letter.status === "published";
                const link = letterLink(letter, hosts);
                const seen = opened(letter.opens, letter.openedAt);
                const initial = (letter.initial || letter.from.slice(0, 1) || "S").toUpperCase();

                return (
                  <tr
                    key={letter.id}
                    onClick={() => {
                      router.push(`/letters/${letter.id}`);
                    }}
                  >
                    <td>
                      <div className="w-letter-cell">
                        <MiniEnvelope
                          theme={letter.theme}
                          style={letter.style}
                          initial={initial}
                          seed={seedFrom(letter.token)}
                        />
                        <div>
                          <div className="w-strong">To {letter.to || "…"}</div>
                          <div className="w-soft">from {letter.from || "…"}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Theme">{resolveTheme(letter.theme).name}</td>
                    <td data-label="Status">
                      <span className={`w-pill ${published ? "w-pill-on" : ""}`}>
                        {published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td data-label="Link">
                      {published ? (
                        <span className="w-link">
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            {link.replace(/^https?:\/\//u, "")}
                          </a>
                          <CopyButton text={link} />
                        </span>
                      ) : (
                        <span className="w-faint">–</span>
                      )}
                    </td>
                    <td data-label="Opened">
                      {published ? (
                        <>
                          <div className={letter.opens ? "" : "w-faint"}>{seen.main}</div>
                          {seen.sub && <div className="w-soft">{seen.sub}</div>}
                        </>
                      ) : (
                        <span className="w-faint">—</span>
                      )}
                    </td>
                    <td data-label="Updated">
                      {published ? day(letter.sealedAt) : `Edited ${ago(letter.updatedAt)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <footer className="w-foot">
          <span>Letters are unlisted. Only people with the link can open them.</span>
          <Credit />
        </footer>
      </main>
    </div>
  );
};
