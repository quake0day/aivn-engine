/** Script AST types — represents parsed .aivn.yaml structure */

export interface ScriptMeta {
  title: string;
  author: string;
  version?: string;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  model: string;
  description: string;
  default_expression: string;
  expressions?: Record<string, ExpressionDef>;
}

export interface ExpressionDef {
  morphTargets: Record<string, number>;
}

export type StagePosition = 'left' | 'center' | 'right' | 'far-left' | 'far-right';

export interface CharacterDirection {
  position: StagePosition;
  expression: string;
  enter?: boolean;
  exit?: boolean;
}

export interface BackgroundSpec {
  style: string;
  mood: string;
  negative_prompt?: string;
}

export interface NarrationDirection {
  narration: string;
  characters?: Record<string, CharacterDirection>;
}

export interface DialogueDirection {
  dialogue: {
    speaker: string;
    intent?: string;
    line?: string;
  };
}

export interface ChoiceOption {
  text: string;
  leads_to?: string;
  ai_generate?: boolean;
}

export interface ChoiceDirection {
  choice: {
    prompt: string;
    options: ChoiceOption[];
  };
}

export type SceneDirection = NarrationDirection | DialogueDirection | ChoiceDirection;

export interface SceneDefinition {
  id: string;
  setting: string;
  background?: BackgroundSpec;
  direction: SceneDirection[];
}

export interface StoryScript {
  meta: ScriptMeta;
  characters: Record<string, CharacterDefinition>;
  scenes: SceneDefinition[];
}
