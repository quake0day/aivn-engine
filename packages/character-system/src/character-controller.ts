import type { EventBus, CharacterDefinition, ResolvedCharacterState, StagePosition } from '@aivn/core';
import { SceneManager } from '@aivn/renderer';
import { ExpressionManager } from './expression-map.js';

export interface CharacterState {
  id: string;
  name: string;
  position: StagePosition;
  expression: string;
  visible: boolean;
  modelLoaded: boolean;
}

export class CharacterController {
  private characters = new Map<string, CharacterState>();
  private expressionManager = new ExpressionManager();

  constructor(
    private sceneManager: SceneManager,
    private eventBus: EventBus,
  ) {}

  async registerCharacter(def: CharacterDefinition): Promise<void> {
    this.characters.set(def.id, {
      id: def.id,
      name: def.name,
      position: 'center',
      expression: def.default_expression,
      visible: false,
      modelLoaded: false,
    });

    // Register custom expressions if provided
    if (def.expressions) {
      for (const [name, exprDef] of Object.entries(def.expressions)) {
        this.expressionManager.registerExpression(def.id, name, {
          morphTargets: exprDef.morphTargets,
        });
      }
    }
  }

  async loadModel(characterId: string, modelUrl: string): Promise<void> {
    await this.sceneManager.loadCharacterModel(characterId, modelUrl);
    const state = this.characters.get(characterId);
    if (state) {
      state.modelLoaded = true;
    }
  }

  applyState(charState: ResolvedCharacterState): void {
    const state = this.characters.get(charState.characterId);
    if (!state) return;

    // Update position
    if (state.position !== charState.position) {
      state.position = charState.position;
      this.sceneManager.setCharacterPosition(charState.characterId, charState.position);
    }

    // Update visibility
    if (state.visible !== charState.visible) {
      state.visible = charState.visible;
      this.sceneManager.setCharacterVisible(charState.characterId, charState.visible);
    }

    // Update expression
    if (state.expression !== charState.expression) {
      state.expression = charState.expression;
      const mapping = this.expressionManager.getExpression(charState.characterId, charState.expression);
      this.sceneManager.setCharacterExpression(charState.characterId, mapping.morphTargets);
    }
  }

  applyStates(states: ResolvedCharacterState[]): void {
    // Hide characters not in the new state list
    const activeIds = new Set(states.filter(s => s.visible).map(s => s.characterId));
    for (const [id, state] of this.characters) {
      if (state.visible && !activeIds.has(id)) {
        state.visible = false;
        this.sceneManager.setCharacterVisible(id, false);
      }
    }

    for (const charState of states) {
      this.applyState(charState);
    }
  }

  getState(characterId: string): CharacterState | undefined {
    return this.characters.get(characterId);
  }
}
