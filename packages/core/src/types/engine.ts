/** Engine state types */

export type EngineState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'waiting-choice'
  | 'transitioning'
  | 'paused';

export interface StoryContext {
  currentSceneId: string;
  stepIndex: number;
  history: HistoryEntry[];
  variables: Record<string, unknown>;
}

export interface HistoryEntry {
  sceneId: string;
  stepIndex: number;
  choiceMade?: string;
  timestamp: number;
}

export interface SaveData {
  id: string;
  label: string;
  context: StoryContext;
  timestamp: number;
  thumbnail?: string;
}
