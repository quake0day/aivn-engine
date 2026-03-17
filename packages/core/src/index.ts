export type {
  ScriptMeta,
  CharacterDefinition,
  ExpressionDef,
  StagePosition,
  CharacterDirection,
  BackgroundSpec,
  NarrationDirection,
  DialogueDirection,
  ChoiceDirection,
  ChoiceOption,
  SceneDirection,
  SceneDefinition,
  StoryScript,
} from './types/script.js';

export type {
  ResolvedCharacterState,
  ResolvedNarration,
  ResolvedDialogue,
  ResolvedChoice,
  ResolvedChoiceOption,
  ResolvedStep,
  ResolvedScene,
} from './types/resolved.js';

export type {
  EngineState,
  StoryContext,
  HistoryEntry,
  SaveData,
} from './types/engine.js';

export { createEventBus } from './events/event-bus.js';
export type { EventBus, EngineEvents } from './events/event-bus.js';
