import type { EventBus, ResolvedStep } from '@aivn/core';
import { DialogueBox } from './components/dialogue-box.js';
import { ChoicePanel } from './components/choice-panel.js';
import { LoadingIndicator } from './components/loading-indicator.js';

export class UIManager {
  private overlay: HTMLElement;
  private dialogueBox: DialogueBox;
  private choicePanel: ChoicePanel;
  private loadingIndicator: LoadingIndicator;

  constructor(parent: HTMLElement, private eventBus: EventBus) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'aivn-overlay';
    parent.appendChild(this.overlay);

    this.dialogueBox = new DialogueBox(this.overlay, eventBus);
    this.choicePanel = new ChoicePanel(this.overlay, eventBus);
    this.loadingIndicator = new LoadingIndicator(this.overlay, eventBus);

    this.setupKeyboard();
  }

  private setupKeyboard(): void {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.eventBus.emit('engine:advance');
          break;
      }
    });
  }

  showStep(step: ResolvedStep): void {
    switch (step.type) {
      case 'narration':
        this.choicePanel.hide();
        this.dialogueBox.showDialogue(null, step.text);
        break;
      case 'dialogue':
        this.choicePanel.hide();
        this.dialogueBox.showDialogue(step.speakerName, step.text);
        break;
      case 'choice':
        this.dialogueBox.hide();
        this.choicePanel.show(step.prompt, step.options);
        break;
    }
  }

  hideAll(): void {
    this.dialogueBox.hide();
    this.choicePanel.hide();
  }

  dispose(): void {
    this.dialogueBox.dispose();
    this.choicePanel.dispose();
    this.loadingIndicator.dispose();
    this.overlay.remove();
  }
}
