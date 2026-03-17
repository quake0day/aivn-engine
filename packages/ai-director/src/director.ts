import type {
  EventBus,
  StoryScript,
  SceneDefinition,
  ResolvedScene,
  ResolvedStep,
  ResolvedCharacterState,
  StoryContext,
  NarrationDirection,
  DialogueDirection,
  ChoiceDirection,
} from '@aivn/core';

/**
 * AI Director — resolves scene definitions into renderable steps.
 *
 * Phase 1: Static resolution (no AI, uses hardcoded/line text).
 * Phase 2: Will integrate Claude API for intent-based dialogue generation.
 */
export class AIDirector {
  private script: StoryScript | null = null;
  private context: StoryContext | null = null;

  constructor(private eventBus: EventBus) {}

  loadScript(script: StoryScript): void {
    this.script = script;
    this.context = {
      currentSceneId: script.scenes[0]?.id ?? '',
      stepIndex: 0,
      history: [],
      variables: {},
    };
  }

  async resolveScene(sceneId: string): Promise<ResolvedScene> {
    if (!this.script) throw new Error('No script loaded');

    const sceneDef = this.script.scenes.find(s => s.id === sceneId);
    if (!sceneDef) throw new Error(`Scene not found: ${sceneId}`);

    const steps = this.resolveDirections(sceneDef);

    return {
      sceneId: sceneDef.id,
      setting: sceneDef.setting,
      steps,
    };
  }

  private resolveDirections(scene: SceneDefinition): ResolvedStep[] {
    const steps: ResolvedStep[] = [];
    const currentCharacters = new Map<string, ResolvedCharacterState>();

    for (const direction of scene.direction) {
      if ('narration' in direction) {
        const d = direction as NarrationDirection;
        this.updateCharacterStates(currentCharacters, d.characters);

        steps.push({
          type: 'narration',
          text: d.narration,
          characters: Array.from(currentCharacters.values()),
        });
      } else if ('dialogue' in direction) {
        const d = direction as DialogueDirection;
        const charDef = this.script!.characters[d.dialogue.speaker];
        const speakerName = charDef?.name ?? d.dialogue.speaker;

        // Phase 1: use line directly, or intent as placeholder
        const text = d.dialogue.line ?? d.dialogue.intent ?? '...';

        steps.push({
          type: 'dialogue',
          speaker: d.dialogue.speaker,
          speakerName,
          text,
          characters: Array.from(currentCharacters.values()),
        });
      } else if ('choice' in direction) {
        const d = direction as ChoiceDirection;
        steps.push({
          type: 'choice',
          prompt: d.choice.prompt,
          options: d.choice.options.map(opt => ({
            text: opt.ai_generate ? '(AI will generate...)' : opt.text,
            leadsTo: opt.leads_to,
          })),
        });
      }
    }

    return steps;
  }

  private updateCharacterStates(
    current: Map<string, ResolvedCharacterState>,
    characters?: Record<string, { position?: string; expression?: string; enter?: boolean; exit?: boolean }>,
  ): void {
    if (!characters) return;

    for (const [id, dir] of Object.entries(characters)) {
      const charDef = this.script!.characters[id];
      const existing = current.get(id);

      if (dir.exit) {
        current.delete(id);
        continue;
      }

      current.set(id, {
        characterId: id,
        name: charDef?.name ?? id,
        position: (dir.position as ResolvedCharacterState['position']) ?? existing?.position ?? 'center',
        expression: dir.expression ?? existing?.expression ?? charDef?.default_expression ?? 'neutral',
        visible: true,
      });
    }
  }

  getContext(): StoryContext | null {
    return this.context;
  }
}
