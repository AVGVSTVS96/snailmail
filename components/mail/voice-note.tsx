"use client";

import { useRef, useState } from "react";

const bars = [4, 8, 12, 7, 14, 10, 6, 12, 16, 9, 5, 11, 7, 13, 8, 4, 9, 6];

export const duration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));

  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const VoiceNote = ({ url, seconds }: { url: string; seconds: number }) => {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const played = Math.round(progress * bars.length);

  const toggle = () => {
    const player = audio.current;

    if (!player) {
      return;
    }

    if (player.paused) {
      void player.play();
    } else {
      player.pause();
    }
  };

  return (
    <button
      type="button"
      className="voice-note"
      onClick={toggle}
      aria-label={playing ? "Pause the voice note" : `Play the voice note, ${duration(seconds)}`}
    >
      <span className="voice-disc" aria-hidden>
        {playing ? (
          <svg viewBox="0 0 10 12">
            <path d="M1.5,1 H3.8 V11 H1.5 Z M6.2,1 H8.5 V11 H6.2 Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 10 12">
            <path d="M1,0.8 L9,6 L1,11.2 Z" />
          </svg>
        )}
      </span>
      <svg className="voice-wave" viewBox="0 0 72 18" aria-hidden>
        {bars.map((h, i) => (
          <rect
            key={i}
            x={i * 4}
            y={9 - h / 2}
            width="2"
            height={h}
            rx="1"
            opacity={i < (playing || progress > 0 ? played : 9) ? 0.9 : 0.35}
          />
        ))}
      </svg>
      <span className="voice-time">{duration(seconds)}</span>
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- a writer's spoken voice note has no caption track to offer */}
      <audio
        ref={audio}
        src={url}
        preload="none"
        onPlay={() => {
          setPlaying(true);
        }}
        onPause={() => {
          setPlaying(false);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={(event) => {
          const player = event.currentTarget;
          setProgress(player.duration > 0 ? player.currentTime / player.duration : 0);
        }}
      />
    </button>
  );
};
