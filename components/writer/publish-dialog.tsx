"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { SealedEnvelope } from "@/components/mail/sealed";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { letterLink } from "@/lib/links";
import type { Theme } from "@/lib/theme";
import { themeStyle } from "@/lib/texture";
import { CopyButton } from "./copy";
import { useHosts } from "./providers";

type Props = {
  id: Id<"letters">;
  token: string;
  to: string;
  from: string;
  look: Theme;
  initial: string;
  seed: number;
  wasPublished: boolean;
  savedSlug: string | null;
  savedKey: string | null;
  previewReady: boolean;
  notify: boolean;
  onClose: () => void;
};

const previewWait = 90_000;

export function PublishDialog({
  id,
  token,
  to,
  from,
  look,
  initial,
  seed,
  wasPublished,
  savedSlug,
  savedKey,
  previewReady,
  notify,
  onClose,
}: Props) {
  const publish = useMutation(api.writer.publish);
  const save = useMutation(api.writer.save);
  const unpublish = useMutation(api.writer.unpublish);
  const hosts = useHosts();
  const dialog = useRef<HTMLDialogElement>(null);

  const [link, setLink] = useState<{ slug: string | null; key: string | null } | null>(
    wasPublished ? { slug: savedSlug, key: savedKey } : null,
  );

  const [problem, setProblem] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(savedSlug ?? "");
  const [privateLink, setPrivateLink] = useState(wasPublished ? savedKey !== null : true);
  const check = useQuery(api.writer.slugFree, editing && name ? { id, slug: name } : "skip");
  const [waitedOut, setWaitedOut] = useState(false);

  useEffect(() => {
    if (previewReady) return;
    const timer = setTimeout(() => setWaitedOut(true), previewWait);

    return () => clearTimeout(timer);
  }, [previewReady]);

  const holding = !previewReady && !waitedOut;

  async function seal(slug: string, keep: boolean, exact: boolean) {
    try {
      setLink(await publish({ id, slug, private: keep, exact }));
      setProblem("");
      setEditing(false);
    } catch (error) {
      setProblem(error instanceof Error ? error.message.replace(/^.*ConvexError: /, "").replace(/\s+at .*$/s, "") : "");
    }
  }

  const sealOnOpen = useRef(!wasPublished);

  useEffect(() => {
    dialog.current?.showModal();

    if (!sealOnOpen.current) return;
    sealOnOpen.current = false;
    void seal(to, true, false);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const url = link ? letterLink({ token, slug: link.slug, key: link.key }, hosts) : "";
  const shown = url.replace(/^https?:\/\//, "");
  const host = link?.slug && hosts.root ? `${link.slug}.${hosts.root}` : null;

  return (
    <dialog
      ref={dialog}
      className="w-dialog"
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && dialog.current?.close()}
    >
      <div className="w-dialog-desk" style={{ ...themeStyle(look), background: look.surface }}>
        <SealedEnvelope theme={look} from={from} initial={initial} seed={seed} />
      </div>
      <div className="w-dialog-body">
        <h2>{link ? "Sealed and ready to send" : problem ? "Not sealed yet" : "Sealing…"}</h2>
        <p className="w-dialog-line">
          {problem ||
            (holding
              ? "Making its link preview, the envelope people see in Messages. It takes about half a minute."
              : `${to || "They"} opens it at this link, on any phone. No account needed.`)}
        </p>
        {link && (
          <>
            <div className="w-link-field">
              <span className="w-link-text">
                {host ? (
                  <>
                    <b>{link.slug}</b>
                    {shown.slice(link.slug?.length ?? 0)}
                  </>
                ) : (
                  shown
                )}
              </span>
              <CopyButton text={url} className="w-button w-primary w-copy" label="Copy link" disabled={holding} />
            </div>
            {hosts.root && (
              <div className="w-avail">
                {editing ? (
                  <form
                    className="w-rename"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void seal(name, privateLink, true);
                    }}
                  >
                    <input value={name} onChange={(event) => setName(event.target.value)} aria-label="Subdomain name" />
                    <span className="w-soft">.{hosts.root}</span>
                    <button type="submit" className="w-button w-small" disabled={check?.free === false}>
                      Save
                    </button>
                    {check && (
                      <span className={check.free ? "w-ok" : "w-problem"}>
                        {check.free ? `${check.slug} is free` : `${check.slug || "That"} is taken`}
                      </span>
                    )}
                  </form>
                ) : (
                  host && (
                    <span className="w-ok">
                      ✓ {host} is yours ·{" "}
                      <button type="button" className="w-text-button" onClick={() => setEditing(true)}>
                        change
                      </button>
                    </span>
                  )
                )}
              </div>
            )}
            {hosts.root && (
              <label className="w-toggle">
                <span>
                  <span className="w-strong">Private link</span>
                  <span className="w-soft">Adds a short key so the name alone doesn't open it</span>
                </span>
                <input
                  type="checkbox"
                  checked={privateLink}
                  onChange={(event) => {
                    setPrivateLink(event.target.checked);
                    void seal(link.slug ?? to, event.target.checked, true);
                  }}
                />
              </label>
            )}
            <label className="w-toggle">
              <span>
                <span className="w-strong">Tell me when it's opened</span>
                <span className="w-soft">One email, the first time {to || "they"} opens it</span>
              </span>
              <input
                type="checkbox"
                defaultChecked={notify}
                onChange={(event) => void save({ id, notify: event.target.checked })}
              />
            </label>
          </>
        )}
        <div className="w-dialog-actions">
          {link && (
            <button
              type="button"
              className="w-text-button w-danger"
              onClick={async () => {
                await unpublish({ id });
                dialog.current?.close();
              }}
            >
              Take it back
            </button>
          )}
          <span className="w-grow" />
          {link && typeof navigator !== "undefined" && "share" in navigator && (
            <button
              type="button"
              className="w-button"
              disabled={holding}
              onClick={() => void navigator.share({ title: `A letter for ${to}`, url }).catch(() => undefined)}
            >
              Share…
            </button>
          )}
          <button type="button" className="w-button w-primary" onClick={() => dialog.current?.close()}>
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
}
