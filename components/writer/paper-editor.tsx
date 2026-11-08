"use client";

import { useEffect, useRef } from "react";

import { paragraphs } from "@/components/mail/sheet";

const escape = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const toHtml = (body: string) => {
  const blocks = paragraphs(body).map(
    (p) =>
      `<p>${escape(p)
        .replaceAll(/\*\*([^*]+)\*\*/gu, "<b>$1</b>")
        .replaceAll(/\*([^*]+)\*/gu, "<i>$1</i>")
        .replaceAll("\n", "<br>")}</p>`,
  );

  return blocks.length ? blocks.join("") : "<p><br></p>";
};

const inlineText = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  if (node.tagName === "BR") {
    return "\n";
  }

  const inner = Array.from(node.childNodes, inlineText).join("");

  if (inner.trim() === "") {
    return inner;
  }

  const weight = node.style.fontWeight;

  const bold =
    node.tagName === "B" || node.tagName === "STRONG" || weight === "bold" || Number(weight) >= 600;

  const italic = node.tagName === "I" || node.tagName === "EM" || node.style.fontStyle === "italic";

  if (bold) {
    return `**${inner}**`;
  }

  if (italic) {
    return `*${inner}*`;
  }

  return inner;
};

const toBody = (root: HTMLElement) => {
  const blocks: string[] = [];
  let loose = "";

  for (const node of [...root.childNodes]) {
    const block = node instanceof HTMLElement && (node.tagName === "P" || node.tagName === "DIV");

    if (block) {
      if (loose.trim()) {
        blocks.push(loose);
      }

      loose = "";
      blocks.push(inlineText(node));
    } else {
      loose += inlineText(node);
    }
  }

  if (loose.trim()) {
    blocks.push(loose);
  }

  return blocks
    .flatMap((block) => {
      const clean = block.replace(/\n+$/u, "").replaceAll("\u00A0", " ");

      return clean.trim() === "" ? [] : [clean];
    })
    .join("\n\n");
};

export const words = (body: string) => body.split(/\s+/u).filter((word) => /\w/u.test(word)).length;

export const PaperEditor = ({
  body,
  onChange,
}: {
  body: string;
  onChange: (body: string) => void;
}) => {
  const editor = useRef<HTMLDivElement>(null);
  const last = useRef(body);

  useEffect(() => {
    const element = editor.current;

    if (!element || body === last.current) {
      return;
    }

    last.current = body;
    element.innerHTML = toHtml(body);
  }, [body]);

  useEffect(() => {
    if (editor.current) {
      editor.current.innerHTML = toHtml(last.current);
    }

    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, []);

  const changed = () => {
    if (!editor.current) {
      return;
    }

    last.current = toBody(editor.current);
    onChange(last.current);
  };

  return (
    <div
      ref={editor}
      className="w-paper-text"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline
      aria-label="Your letter"
      spellCheck
      onInput={changed}
      onKeyDown={(event) => {
        if (!(event.metaKey || event.ctrlKey)) {
          return;
        }

        const key = event.key.toLowerCase();

        if (key === "u") {
          event.preventDefault();
        }

        if (key !== "b" && key !== "i") {
          return;
        }

        event.preventDefault();
        document.execCommand(key === "b" ? "bold" : "italic");
        changed();
      }}
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain").replaceAll("\r\n", "\n");

        const html = paragraphs(text)
          .map((p) => `<p>${escape(p).replaceAll("\n", "<br>")}</p>`)
          .join("");

        document.execCommand("insertHTML", false, html || escape(text));
        changed();
      }}
    />
  );
};
