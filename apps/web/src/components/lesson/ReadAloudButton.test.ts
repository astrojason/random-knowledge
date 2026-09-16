// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReadAloudButton } from "./ReadAloudButton";
import { buildLessonSpeechText } from "@/lib/speech";
import type { Lesson } from "@/lib/types";

const lesson: Lesson = {
  category: "nature", title: "How glaciers carve valleys",
  body: ["Glaciers move slowly downhill.", "They grind rock into fine sediment."],
  wikiQuery: "glaciers", youtubeQuery: "glaciers", quiz: [],
};

const lessonWithAudio: Lesson = { ...lesson, audioUrl: "https://storage.example/lesson.mp3" };

class FakeUtterance {
  text: string;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) { this.text = text; }
}

class FakeAudio {
  static instances: FakeAudio[] = [];
  src: string;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  currentTime = 0;
  play = vi.fn();
  pause = vi.fn();
  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }
}

let container: HTMLDivElement;
let root: Root;
const speak = vi.fn();
const pause = vi.fn();
const resume = vi.fn();
const cancel = vi.fn();

async function click(el: Element | null) {
  if (!el) throw new Error("element not found");
  await act(async () => el.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

function button(text: string) {
  return [...container.querySelectorAll("button")].find((b) => b.textContent === text) ?? null;
}

async function mount(lessonToRender: Lesson = lesson) {
  await act(async () => root.render(createElement(ReadAloudButton, { lesson: lessonToRender })));
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("speechSynthesis", { speak, pause, resume, cancel });
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  vi.stubGlobal("Audio", FakeAudio);
  FakeAudio.instances = [];
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("ReadAloudButton", () => {
  it("speaks the lesson title and body when clicked", async () => {
    await mount();
    await click(button("Listen to this lesson"));

    expect(speak).toHaveBeenCalledTimes(1);
    const utterance = speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.text).toBe(buildLessonSpeechText(lesson));
  });

  it("pauses and resumes without restarting playback", async () => {
    await mount();
    await click(button("Listen to this lesson"));

    await click(button("Pause"));
    expect(pause).toHaveBeenCalledTimes(1);
    expect(button("Resume")).not.toBeNull();

    await click(button("Resume"));
    expect(resume).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("stops playback and returns to the idle label", async () => {
    await mount();
    await click(button("Listen to this lesson"));

    await click(button("Stop"));
    expect(cancel).toHaveBeenCalled();
    expect(button("Listen to this lesson")).not.toBeNull();
  });

  it("cancels any in-progress speech when unmounted", async () => {
    await mount();
    await click(button("Listen to this lesson"));

    await act(async () => root.unmount());
    expect(cancel).toHaveBeenCalled();
  });
});

describe("ReadAloudButton with a cloned-voice recording", () => {
  it("plays the audio file instead of using speech synthesis", async () => {
    await mount(lessonWithAudio);
    await click(button("Listen to this lesson"));

    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0].src).toBe(lessonWithAudio.audioUrl);
    expect(FakeAudio.instances[0].play).toHaveBeenCalledTimes(1);
    expect(speak).not.toHaveBeenCalled();
    expect(button("Pause")).not.toBeNull();
  });

  it("pauses and resumes the audio element without recreating it", async () => {
    await mount(lessonWithAudio);
    await click(button("Listen to this lesson"));

    await click(button("Pause"));
    expect(FakeAudio.instances[0].pause).toHaveBeenCalledTimes(1);
    expect(button("Resume")).not.toBeNull();

    await click(button("Resume"));
    expect(FakeAudio.instances[0].play).toHaveBeenCalledTimes(2);
    expect(FakeAudio.instances).toHaveLength(1);
  });

  it("stops playback and resets to the start", async () => {
    await mount(lessonWithAudio);
    await click(button("Listen to this lesson"));

    FakeAudio.instances[0].currentTime = 42;
    await click(button("Stop"));
    expect(FakeAudio.instances[0].pause).toHaveBeenCalled();
    expect(FakeAudio.instances[0].currentTime).toBe(0);
    expect(button("Listen to this lesson")).not.toBeNull();
  });

  it("pauses the audio element when unmounted", async () => {
    await mount(lessonWithAudio);
    await click(button("Listen to this lesson"));

    await act(async () => root.unmount());
    expect(FakeAudio.instances[0].pause).toHaveBeenCalled();
  });
});
