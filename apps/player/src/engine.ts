import {
  createEventBus,
  type EventBus,
  type ResolvedScene,
  type ResolvedStep,
  type EngineState,
  type StoryScript,
} from '@aivn/core';
import { SceneManager } from '@aivn/renderer';
import { CharacterController } from '@aivn/character-system';
import { UIManager } from '@aivn/ui';
import { AIDirector } from '@aivn/ai-director';
import { ComfyUIClient } from '@aivn/image-gen';

export class Engine {
  private eventBus: EventBus;
  private sceneManager: SceneManager;
  private characterController: CharacterController;
  private uiManager: UIManager;
  private aiDirector: AIDirector;
  private imageGen: ComfyUIClient;

  private state: EngineState = 'idle';
  private currentScene: ResolvedScene | null = null;
  private stepIndex = 0;

  constructor(container: HTMLElement) {
    this.eventBus = createEventBus();

    // Create canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Initialize subsystems
    this.sceneManager = new SceneManager({ canvas, eventBus: this.eventBus });
    this.characterController = new CharacterController(this.sceneManager, this.eventBus);
    this.uiManager = new UIManager(container, this.eventBus);
    this.aiDirector = new AIDirector(this.eventBus);
    this.imageGen = new ComfyUIClient(this.eventBus);

    this.setupEventHandlers();
    this.sceneManager.start();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('engine:advance', () => {
      if (this.state === 'playing') {
        this.advanceStep();
      }
    });

    this.eventBus.on('choice:select', ({ index }) => {
      if (this.state === 'waiting-choice' && this.currentScene) {
        const step = this.currentScene.steps[this.stepIndex];
        if (step.type === 'choice') {
          const option = step.options[index];
          if (option.leadsTo && this.aiDirector.getContext()) {
            // Only handle internally when a script is loaded
            this.playScene(option.leadsTo);
          } else if (!option.leadsTo) {
            this.advanceStep();
          }
          // If no script loaded, let external handlers (main.ts) handle navigation
        }
      }
    });

    this.eventBus.on('dialogue:complete', () => {
      // Dialogue animation finished, waiting for player click
    });
  }

  private setState(newState: EngineState): void {
    const from = this.state;
    this.state = newState;
    this.eventBus.emit('engine:state-change', { from, to: newState });
  }

  async loadScript(script: StoryScript): Promise<void> {
    this.setState('loading');
    this.aiDirector.loadScript(script);

    // Register characters
    for (const charDef of Object.values(script.characters)) {
      await this.characterController.registerCharacter(charDef);
    }
  }

  async playScene(sceneId: string): Promise<void> {
    this.setState('transitioning');
    this.uiManager.hideAll();

    try {
      const scene = await this.aiDirector.resolveScene(sceneId);
      this.currentScene = scene;
      this.stepIndex = 0;

      // Generate background in parallel
      if (scene.setting) {
        this.imageGen.generateBackground(scene.setting).then(url => {
          this.sceneManager.setBackground(url);
        }).catch(err => {
          console.warn('Background generation failed:', err);
        });
      }

      await this.sceneManager.transitionScene(scene);
      this.setState('playing');
      this.showCurrentStep();
    } catch (err) {
      this.setState('idle');
      this.eventBus.emit('engine:error', {
        message: `Failed to play scene: ${sceneId}`,
        error: err,
      });
    }
  }

  private showCurrentStep(): void {
    if (!this.currentScene) return;

    const step = this.currentScene.steps[this.stepIndex];
    if (!step) {
      // Scene complete
      this.setState('idle');
      return;
    }

    // Apply character states
    if ('characters' in step && step.characters) {
      this.characterController.applyStates(step.characters);
    }

    // Show UI
    this.uiManager.showStep(step);

    if (step.type === 'choice') {
      this.setState('waiting-choice');
    } else {
      this.setState('playing');
    }

    this.eventBus.emit('step:show', { step, index: this.stepIndex });
  }

  private advanceStep(): void {
    if (!this.currentScene) return;

    this.stepIndex++;
    this.eventBus.emit('step:complete', { index: this.stepIndex - 1 });

    if (this.stepIndex < this.currentScene.steps.length) {
      this.showCurrentStep();
    } else {
      // Scene ended
      this.uiManager.hideAll();
      this.setState('idle');
    }
  }

  /** Load a resolved scene directly (for Phase 1 testing without scripts) */
  async playResolvedScene(scene: ResolvedScene): Promise<void> {
    this.setState('transitioning');
    this.currentScene = scene;
    this.stepIndex = 0;

    if (scene.backgroundUrl) {
      await this.sceneManager.setBackground(scene.backgroundUrl);
    } else if (scene.setting) {
      // Generate placeholder background from setting description
      try {
        const url = await this.imageGen.generateBackground(scene.setting);
        await this.sceneManager.setBackground(url);
      } catch (err) {
        console.warn('Background generation failed:', err);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    this.setState('playing');
    this.showCurrentStep();
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  dispose(): void {
    this.sceneManager.dispose();
    this.uiManager.dispose();
  }
}
