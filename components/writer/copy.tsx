"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy link",
  className,
  disabled = false,
}: {
  text: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className ?? "w-icon-button"}
      aria-label={label}
      disabled={disabled}
      title={copied ? "Copied" : label}
      onClick={(event) => {
        event.stopPropagation();
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        });
      }}
    >
      {copied ? (
        <svg viewBox="0 0 16 16" className="w-copied" aria-hidden>
          <path d="M3 8.5l3 3 7-7" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" aria-hidden>
          <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
          <path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v6A1.5 1.5 0 0 0 3 10.5h.5" />
        </svg>
      )}
    </button>
  );
}
