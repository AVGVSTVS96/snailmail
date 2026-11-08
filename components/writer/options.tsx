"use client";

import { useId } from "react";

import { Liner } from "@/components/mail/envelope";
import { Emblem, WaxSeal } from "@/components/mail/seal";
import { SealedEnvelope } from "@/components/mail/sealed";
import { Stamp } from "@/components/mail/stationery";
import {
  emblems,
  finishes,
  inkFits,
  inks,
  liners,
  papers,
  resolveTheme,
  stamps,
  themeKeys,
  typefaces,
  waxes,
} from "@/lib/theme";
import type { Style, Theme, ThemeKey } from "@/lib/theme";

import { SignaturePad } from "./signature-pad";

export interface Fields {
  theme: ThemeKey;
  style: Style;
  to: string;
  toPlace: string;
  from: string;
  initial: string;
  city: string;
  openWhen: string;
  signature: string | null;
}

interface Props {
  fields: Fields;
  look: Theme;
  seed: number;
  onTheme: (theme: ThemeKey) => void;
  onStyle: (style: Partial<Style>) => void;
  onField: (field: Partial<Omit<Fields, "theme" | "style">>) => void;
}

const keysOf = <T extends object>(catalog: T) =>
  // SAFETY: Object.keys of a literal catalog returns exactly its keys
  Object.keys(catalog) as (keyof T)[];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="w-section">
    <h2 className="w-label">{title}</h2>
    {children}
  </section>
);

const Field = ({
  label,
  value,
  placeholder,
  max,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  max: number;
  onChange: (value: string) => void;
}) => {
  const id = useId();

  return (
    <div className="w-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        maxLength={max}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </div>
  );
};

const Segments = <K extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Record<K, string>;
  value: K;
  onChange: (value: K) => void;
  label: string;
}) => (
  <div className="w-segments" role="radiogroup" aria-label={label}>
    {keysOf(options).map((key) => (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={key === value}
        className={key === value ? "w-on" : ""}
        onClick={() => {
          onChange(key);
        }}
      >
        {options[key]}
      </button>
    ))}
  </div>
);

export const Options = ({ fields, look, seed, onTheme, onStyle, onField }: Props) => {
  const { style } = look;
  const initial = (fields.initial || fields.from.slice(0, 1) || "S").toUpperCase();

  return (
    <div className="w-options">
      <Section title="Theme">
        <div className="w-themes" role="radiogroup" aria-label="Theme">
          {themeKeys.map((key) => {
            const theme = resolveTheme(key);

            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={fields.theme === key}
                className={`w-theme ${fields.theme === key ? "w-on" : ""}`}
                onClick={() => {
                  onTheme(key);
                }}
              >
                <span className="w-theme-desk" style={{ background: theme.surface }}>
                  <SealedEnvelope theme={theme} from={null} initial={initial} seed={seed} />
                </span>
                <span>{theme.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Envelope">
        <Field
          label="To"
          value={fields.to}
          placeholder="June"
          max={60}
          onChange={(to) => {
            onField({ to });
          }}
        />
        <Field
          label="Address line"
          value={fields.toPlace}
          placeholder="Brooklyn, New York"
          max={80}
          onChange={(toPlace) => {
            onField({ toPlace });
          }}
        />
        <Field
          label="From"
          value={fields.from}
          placeholder="Avery"
          max={60}
          onChange={(from) => {
            onField({ from });
          }}
        />
        <Field
          label="Postmark city"
          value={fields.city}
          placeholder="San Francisco"
          max={40}
          onChange={(city) => {
            onField({ city });
          }}
        />
        <Field
          label="Open when…"
          value={fields.openWhen}
          placeholder="you have a quiet minute"
          max={40}
          onChange={(openWhen) => {
            onField({ openWhen });
          }}
        />
      </Section>

      <Section title="Paper">
        <div className="w-swatches" role="radiogroup" aria-label="Paper colour">
          {keysOf(papers).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={style.paper === key}
              aria-label={papers[key].name}
              title={papers[key].name}
              className={`w-swatch ${style.paper === key ? "w-on" : ""}`}
              style={{ background: papers[key].color }}
              onClick={() => {
                onStyle({ paper: key });
              }}
            />
          ))}
        </div>
        <Segments
          label="Paper finish"
          options={finishes}
          value={style.finish}
          onChange={(finish) => {
            onStyle({ finish });
          }}
        />
      </Section>

      <Section title="Ink">
        <div className="w-swatches" role="radiogroup" aria-label="Ink">
          {keysOf(inks).map((key) => {
            const fits = inkFits(key, style.paper);

            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={style.ink === key}
                aria-label={inks[key].name}
                title={fits ? inks[key].name : `${inks[key].name} is too faint on this paper`}
                disabled={!fits}
                className={`w-swatch ${style.ink === key ? "w-on" : ""}`}
                style={{ background: inks[key].color }}
                onClick={() => {
                  onStyle({ ink: key });
                }}
              />
            );
          })}
        </div>
      </Section>

      <Section title="Typeface">
        <div className="w-faces" role="radiogroup" aria-label="Typeface">
          {keysOf(typefaces).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={style.typeface === key}
              className={`w-face ${style.typeface === key ? "w-on" : ""}`}
              onClick={() => {
                onStyle({ typeface: key });
              }}
            >
              <span className="w-face-aa" style={{ fontFamily: typefaces[key].font }}>
                Aa
              </span>
              <span className="w-face-name">{typefaces[key].name}</span>
              <span className="w-face-family">{typefaces[key].family}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Signature">
        <Segments
          label="Signature"
          options={{ script: "Script", drawn: "Draw your own" }}
          value={fields.signature === null ? "script" : "drawn"}
          onChange={(kind) => {
            onField({ signature: kind === "script" ? null : "" });
          }}
        />
        {fields.signature === null ? (
          <div
            className="w-sign-preview"
            style={{
              fontFamily: look.signature.font,
              color: look.signature.hi ? look.waxHi : look.ink,
              background: look.paper,
            }}
          >
            {fields.from || "Your name"}
          </div>
        ) : (
          <SignaturePad
            value={fields.signature || null}
            ink={look.ink}
            onChange={(signature) => {
              onField({ signature: signature ?? "" });
            }}
          />
        )}
      </Section>

      <Section title="Wax seal">
        <div className="w-seals" role="radiogroup" aria-label="Wax colour">
          {keysOf(waxes).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={style.wax === key}
              aria-label={waxes[key].name}
              title={waxes[key].name}
              className={`w-seal ${style.wax === key ? "w-on" : ""}`}
              onClick={() => {
                onStyle({ wax: key });
              }}
            >
              <WaxSeal
                theme={resolveTheme(fields.theme, { ...style, wax: key })}
                initial={initial}
                seed={seed}
              />
            </button>
          ))}
        </div>
        <div className="w-emblems" role="radiogroup" aria-label="Seal emblem">
          {keysOf(emblems).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={style.emblem === key}
              aria-label={emblems[key]}
              title={emblems[key]}
              className={`w-emblem ${style.emblem === key ? "w-on" : ""}`}
              onClick={() => {
                onStyle({ emblem: key });
              }}
            >
              {key === "initial" ? (
                <span className="font-fell">{initial}</span>
              ) : (
                <svg viewBox="-12 -12 24 24" fill="currentColor" color="currentColor">
                  <Emblem kind={key} />
                </svg>
              )}
            </button>
          ))}
        </div>
        {style.emblem === "initial" && (
          <Field
            label="Initial"
            value={fields.initial}
            placeholder={fields.from.slice(0, 1).toUpperCase() || "A"}
            max={1}
            onChange={(value) => {
              onField({ initial: value.toUpperCase() });
            }}
          />
        )}
      </Section>

      <Section title="Stamp">
        <div className="w-stamps" role="radiogroup" aria-label="Stamp">
          {keysOf(stamps).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={style.stamp === key}
              aria-label={`${stamps[key].name}, ${stamps[key].caption}`}
              title={`${stamps[key].name} · ${stamps[key].caption}`}
              className={`w-stamp ${style.stamp === key ? "w-on" : ""}`}
              onClick={() => {
                onStyle({ stamp: key });
              }}
            >
              <svg viewBox="-2 -2 64 76">
                <Stamp
                  theme={{
                    ...resolveTheme(fields.theme, { ...style, stamp: key }),
                    envelope: "#FFFFFF",
                  }}
                />
              </svg>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Envelope liner">
        <div className="w-liners" role="radiogroup" aria-label="Envelope liner">
          {keysOf(liners).map((key) => (
            <LinerSwatch
              key={key}
              theme={resolveTheme(fields.theme, { ...style, liner: key })}
              label={liners[key]}
              on={style.liner === key}
              onPick={() => {
                onStyle({ liner: key });
              }}
            />
          ))}
        </div>
      </Section>
    </div>
  );
};

const LinerSwatch = ({
  theme,
  label,
  on,
  onPick,
}: {
  theme: Theme;
  label: string;
  on: boolean;
  onPick: () => void;
}) => {
  const id = useId();

  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={label}
      title={label}
      className={`w-liner ${on ? "w-on" : ""}`}
      onClick={onPick}
    >
      <svg viewBox="0 0 46 46">
        <defs>
          <Liner id={id} theme={theme} />
        </defs>
        <rect
          width="46"
          height="46"
          fill={theme.style.liner === "none" ? "#F4F2EE" : `url(#${id})`}
        />
      </svg>
    </button>
  );
};
