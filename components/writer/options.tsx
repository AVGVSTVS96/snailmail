"use client";

import { useId } from "react";

import { Liner } from "@/components/mail/envelope";
import { Emblem, WaxSeal } from "@/components/mail/seal";
import { SealedEnvelope } from "@/components/mail/sealed";
import { Stamp } from "@/components/mail/stationery";
import { initialOf } from "@/lib/delivery";
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

const keysOf = <K extends string, V>(catalog: Record<K, V>) =>
  Object.keys(catalog).filter((key): key is K => Object.hasOwn(catalog, key));

const Choice = ({
  on,
  onPick,
  kind = "",
  label,
  title = label,
  disabled = false,
  style,
  children,
}: {
  on: boolean;
  onPick: () => void;
  kind?: string;
  label?: string;
  title?: string | undefined;
  disabled?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => (
  <button
    type="button"
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- each choice is drawn artwork inside a radiogroup, which a native radio input can't hold
    role="radio"
    aria-checked={on}
    aria-label={label}
    title={title}
    disabled={disabled}
    className={`${kind} ${on ? "w-on" : ""}`.trim()}
    style={style}
    onClick={onPick}
  >
    {children}
  </button>
);

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
      <Choice
        key={key}
        on={key === value}
        onPick={() => {
          onChange(key);
        }}
      >
        {options[key]}
      </Choice>
    ))}
  </div>
);

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
    <Choice kind="w-liner" on={on} label={label} onPick={onPick}>
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
    </Choice>
  );
};

export const Options = ({ fields, look, seed, onTheme, onStyle, onField }: Props) => {
  const { style } = look;
  const initial = initialOf(fields);

  return (
    <div className="w-options">
      <Section title="Theme">
        <div className="w-themes" role="radiogroup" aria-label="Theme">
          {themeKeys.map((key) => {
            const theme = resolveTheme(key);

            return (
              <Choice
                key={key}
                kind="w-theme"
                on={fields.theme === key}
                onPick={() => {
                  onTheme(key);
                }}
              >
                <span className="w-theme-desk" style={{ background: theme.surface }}>
                  <SealedEnvelope theme={theme} from={null} initial={initial} seed={seed} />
                </span>
                <span>{theme.name}</span>
              </Choice>
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
            <Choice
              key={key}
              kind="w-swatch"
              on={style.paper === key}
              label={papers[key].name}
              style={{ background: papers[key].color }}
              onPick={() => {
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
              <Choice
                key={key}
                kind="w-swatch"
                on={style.ink === key}
                label={inks[key].name}
                title={fits ? inks[key].name : `${inks[key].name} is too faint on this paper`}
                disabled={!fits}
                style={{ background: inks[key].color }}
                onPick={() => {
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
            <Choice
              key={key}
              kind="w-face"
              on={style.typeface === key}
              onPick={() => {
                onStyle({ typeface: key });
              }}
            >
              <span className="w-face-aa" style={{ fontFamily: typefaces[key].font }}>
                Aa
              </span>
              <span className="w-face-name">{typefaces[key].name}</span>
              <span className="w-face-family">{typefaces[key].family}</span>
            </Choice>
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
            <Choice
              key={key}
              kind="w-seal"
              on={style.wax === key}
              label={waxes[key].name}
              onPick={() => {
                onStyle({ wax: key });
              }}
            >
              <WaxSeal
                theme={resolveTheme(fields.theme, { ...style, wax: key })}
                initial={initial}
                seed={seed}
              />
            </Choice>
          ))}
        </div>
        <div className="w-emblems" role="radiogroup" aria-label="Seal emblem">
          {keysOf(emblems).map((key) => (
            <Choice
              key={key}
              kind="w-emblem"
              on={style.emblem === key}
              label={emblems[key]}
              onPick={() => {
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
            </Choice>
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
            <Choice
              key={key}
              kind="w-stamp"
              on={style.stamp === key}
              label={`${stamps[key].name}, ${stamps[key].caption}`}
              title={`${stamps[key].name} · ${stamps[key].caption}`}
              onPick={() => {
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
            </Choice>
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
