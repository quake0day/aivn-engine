import mitt from 'mitt';
import type { ResolvedStep, ResolvedScene } from '../types/resolved.js';
import type { EngineState } from '../types/engine.js';

export type EngineEvents = {
  // Scene lifecycle
  'scene:load': ResolvedScene;
  'scene:transition-start': { from?: string; to: string };
  'scene:transition-end': { sceneId: string };

  // Step progression
  'step:show': { step: ResolvedStep; index: number };
  'step:complete': { index: number };

  // Dialogue
  'dialogue:start': { speaker: string; text: string };
  'dialogue:char': { char: string; index: number };
  'dialogue:complete': void;
  'dialogue:skip': void;

  // Choices
  'choice:show': { prompt: string; options: Array<{ text: string }> };
  'choice:select': { index: number; text: string };

  // Background
  'background:loading': { prompt: string };
  'background:ready': { url: string };
  'background:error': { error: string };

  // Engine state
  'engine:state-change': { from: EngineState; to: EngineState };
  'engine:advance': void;
  'engine:error': { message: string; error?: unknown };
};

export function createEventBus() {
  return mitt<EngineEvents>();
}

export type EventBus = ReturnType<typeof createEventBus>;
