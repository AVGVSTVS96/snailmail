"use client";

import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";

import { SealedEnvelope } from "@/components/mail/sealed";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { letterLink } from "@/lib/links";
import type { Hosts } from "@/lib/links";
import { useOnMount, useTimeout } from "@/lib/outside";
import { themeStyle } from "@/lib/texture";
import type { Theme } from "@/lib/theme";

import { CopyButton } from "./copy";
import { useHosts } from "./providers";

interface Props {
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
}

const previewWait = 90_000;

type Link = { slug: string | null; key: string | null } | null;

const headline = (link: Link, holding: boolean, problem: string) => {
  if (link === null) {
    return problem === "" ? "Sealing…" : "Not sealed yet";
  }

  return holding ? "Sealed, almost ready" : "Sealed and ready to send";
};

const explanation = (problem: string, holding: boolean, to: string) => {
  if (problem !== "") {
    return problem;
  }

  if (holding) {
    return "Making its link preview, the envelope people see in Messages. It takes about half a minute.";
  }

  return `${to === "" ? "They" : to} opens it at this link, on any phone. No account needed.`;
};

const problemOf = (error: Error) =>
  error.message.replace(/^.*ConvexError: /u, "").replace(/\s+at .*$/su, "");

const subdomain = (link: Link, root: string | null) =>
  link?.slug === undefined || link.slug === null || root === null ? null : `${link.slug}.${root}`;

const Rename = ({
  id,
  root,
  name,
  onName,
  onSave,
}: {
  id: Id<"letters">;
  root: string;
  name: string;
  onName: (name: string) => void;
  onSave: () => void;
}) => {
  const check = useQuery(api.writer.slugFree, name === "" ? "skip" : { id, slug: name });

  return (
    <form
      className="w-rename"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <input
        value={name}
        onChange={(event) => {
          onName(event.target.value);
        }}
        aria-label="Subdomain name"
      />
      <span className="w-soft">.{root}</span>
      <button type="submit" className="w-button w-small" disabled={check?.free === false}>
        Save
      </button>
      {check && (
        <span className={check.free ? "w-ok" : "w-problem"}>
          {check.free
            ? `${check.slug} is free`
            : `${check.slug === "" ? "That" : check.slug} is taken`}
        </span>
      )}
    </form>
  );
};

const LinkField = ({
  link,
  url,
  holding,
  hosts,
}: {
  link: NonNullable<Link>;
  url: string;
  holding: boolean;
  hosts: Hosts;
}) => {
  const shown = url.replace(/^https?:\/\//u, "");
  const host = subdomain(link, hosts.root);

  return (
    <div className="w-link-field">
      <span className="w-link-text">
        {host === null ? (
          shown
        ) : (
          <>
            <b>{link.slug}</b>
            {shown.slice(link.slug?.length ?? 0)}
          </>
        )}
      </span>
      <CopyButton
        text={url}
        className="w-button w-primary w-copy"
        label="Copy link"
        disabled={holding}
      />
    </div>
  );
};

export const PublishDialog = ({
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
}: Props) => {
  const publish = useMutation(api.writer.publish);
  const save = useMutation(api.writer.save);
  const unpublish = useMutation(api.writer.unpublish);
  const hosts = useHosts();
  const dialog = useRef<HTMLDialogElement>(null);

  const [link, setLink] = useState<Link>(wasPublished ? { slug: savedSlug, key: savedKey } : null);

  const [problem, setProblem] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(savedSlug ?? "");
  const [privateLink, setPrivateLink] = useState(wasPublished ? savedKey !== null : true);
  const [waitedOut, setWaitedOut] = useState(false);

  useTimeout(
    () => {
      setWaitedOut(true);
    },
    previewReady ? null : previewWait,
  );

  const holding = !previewReady && !waitedOut;

  const seal = async (slug: string, keep: boolean, exact: boolean) => {
    try {
      setLink(await publish({ id, slug, private: keep, exact }));
      setProblem("");
      setEditing(false);
    } catch (error) {
      setProblem(error instanceof Error ? problemOf(error) : "");
    }
  };

  const sealOnOpen = useRef(!wasPublished);

  useOnMount(() => {
    dialog.current?.showModal();

    if (sealOnOpen.current) {
      sealOnOpen.current = false;
      void seal(to, true, false);
    }
  });

  const takeBack = async () => {
    await unpublish({ id });
    dialog.current?.close();
  };

  const close = () => {
    dialog.current?.close();
  };

  const url = link ? letterLink({ token, slug: link.slug, key: link.key }, hosts) : "";
  const host = subdomain(link, hosts.root);
  const reader = to === "" ? "they" : to;

  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- Escape already closes the modal; this adds a tap on the backdrop
    <dialog
      ref={dialog}
      className="w-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) {
          close();
        }
      }}
    >
      <div className="w-dialog-desk" style={{ ...themeStyle(look), background: look.surface }}>
        <SealedEnvelope theme={look} from={from} initial={initial} seed={seed} />
      </div>
      <div className="w-dialog-body">
        <h2>{headline(link, holding, problem)}</h2>
        <p className="w-dialog-line">{explanation(problem, holding, to)}</p>
        {link && (
          <>
            <LinkField link={link} url={url} holding={holding} hosts={hosts} />
            {hosts.root !== null && (
              <div className="w-avail">
                {editing && (
                  <Rename
                    id={id}
                    root={hosts.root}
                    name={name}
                    onName={setName}
                    onSave={() => {
                      void seal(name, privateLink, true);
                    }}
                  />
                )}
                {!editing && host !== null && (
                  <span className="w-ok">
                    ✓ {host} is yours ·{" "}
                    <button
                      type="button"
                      className="w-text-button"
                      onClick={() => {
                        setEditing(true);
                      }}
                    >
                      change
                    </button>
                  </span>
                )}
              </div>
            )}
            {hosts.root !== null && (
              <label className="w-toggle">
                <span>
                  <span className="w-strong">Private link</span>
                  <span className="w-soft">
                    Adds a short key so the name alone doesn&apos;t open it
                  </span>
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
                <span className="w-strong">Tell me when it&apos;s opened</span>
                <span className="w-soft">One email, the first time {reader} opens it</span>
              </span>
              <input
                type="checkbox"
                defaultChecked={notify}
                onChange={(event) => {
                  void save({ id, notify: event.target.checked });
                }}
              />
            </label>
          </>
        )}
        <div className="w-dialog-actions">
          {link && (
            <button
              type="button"
              className="w-text-button w-danger"
              onClick={() => {
                void takeBack();
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
              onClick={() => {
                void navigator.share({ title: `A letter for ${to}`, url }).catch(() => null);
              }}
            >
              Share…
            </button>
          )}
          <button type="button" className="w-button w-primary" onClick={close}>
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
};
