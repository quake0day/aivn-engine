/** Resolved scene types — output from AI Director, ready for rendering */

import type { StagePosition } from './script.js';

export interface ResolvedCharacterState {
  characterId: string;
  name: string;
  position: StagePosition;
  expression: string;
  visible: boolean;
}

export interface ResolvedNarration {
  type: 'narration';
  text: string;
  characters: ResolvedCharacterState[];
}

export interface ResolvedDialogue {
  type: 'dialogue';
  speaker: string;
  speakerName: string;
  text: string;
  characters: ResolvedCharacterState[];
}

export interface ResolvedChoice {
  type: 'choice';
  prompt: string;
  options: ResolvedChoiceOption[];
}

export interface ResolvedChoiceOption {
  text: string;
  leadsTo?: string;
}

export type ResolvedStep = ResolvedNarration | ResolvedDialogue | ResolvedChoice;

export interface ResolvedScene {
  sceneId: string;
  setting: string;
  backgroundUrl?: string;
  steps: ResolvedStep[];
}
