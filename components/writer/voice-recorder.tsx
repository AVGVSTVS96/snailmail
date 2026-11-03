"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { duration } from "@/components/mail/voice-note";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const maxSeconds = 180;

function length(file: Blob) {
  return new Promise<number>((resolve) => {
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => resolve(0);
  });
}

export function VoiceRecorder({
  id,
  voice,
}: {
  id: Id<"letters">;
  voice: { url: string | null; seconds: number } | null;
}) {
  const uploadUrl = useMutation(api.writer.voiceUploadUrl);
  const setVoice = useMutation(api.writer.setVoice);
  const [state, setState] = useState<"idle" | "recording" | "saving">("idle");
  const [seconds, setSeconds] = useState(0);
  const [problem, setProblem] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function store(file: Blob, length: number) {
    setState("saving");

    try {
      const url = await uploadUrl({ id });
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await response.json();
      await setVoice({ id, file: storageId, seconds: length });
      setProblem("");
    } catch {
      setProblem("That didn't save. Try again.");
    }

    setState("idle");
  }

  async function record() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((t) => MediaRecorder.isTypeSupported(t));
      const media = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks: Blob[] = [];
      const started = performance.now();
      media.ondataavailable = (event) => chunks.push(event.data);

      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());

        if (timer.current) clearInterval(timer.current);
        void store(new Blob(chunks, { type: media.mimeType.split(";")[0] }), (performance.now() - started) / 1000);
      };

      recorder.current = media;
      media.start();
      setSeconds(0);
      setState("recording");

      timer.current = setInterval(() => {
        const elapsed = (performance.now() - started) / 1000;
        setSeconds(elapsed);

        if (elapsed >= maxSeconds) media.stop();
      }, 250);
    } catch {
      setProblem("The microphone isn't available. You can upload a recording instead.");
    }
  }

  if (state === "recording")
    return (
      <div className="w-extra w-extra-on">
        <span className="w-rec-dot w-rec-live" />
        <div>
          <div className="w-strong">Recording · {duration(seconds)}</div>
          <div className="w-soft">Up to 3 minutes</div>
        </div>
        <button type="button" className="w-button w-small" onClick={() => recorder.current?.stop()}>
          Stop
        </button>
      </div>
    );

  if (voice)
    return (
      <div className="w-extra w-extra-on">
        <span className="w-rec-dot" />
        <div>
          <div className="w-strong">Voice note · {duration(voice.seconds)}</div>
          <div className="w-soft">Plays from the letter</div>
        </div>
        <button type="button" className="w-text-button" onClick={() => void setVoice({ id, file: null, seconds: 0 })}>
          Remove
        </button>
      </div>
    );

  return (
    <div>
      <div className="w-extra">
        <button type="button" className="w-extra-main" onClick={record} disabled={state === "saving"}>
          <span className="w-rec-dot" />
          <span>
            <span className="w-strong">{state === "saving" ? "Saving…" : "Record a voice note"}</span>
            <span className="w-soft">Up to 3 minutes, plays from the letter</span>
          </span>
        </button>
        <label className="w-text-button">
          Upload
          <input
            type="file"
            accept="audio/*"
            hidden
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) return;
              const seconds = await length(file);

              if (seconds > maxSeconds + 1) return setProblem("Voice notes can be up to 3 minutes.");
              await store(file, seconds);
            }}
          />
        </label>
      </div>
      {problem && <p className="w-problem">{problem}</p>}
    </div>
  );
}
