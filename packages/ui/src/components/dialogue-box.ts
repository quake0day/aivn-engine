import type { EventBus } from '@aivn/core';

const CHAR_DELAY = 35; // ms per character (typewriter speed)

export class DialogueBox {
  private container: HTMLElement;
  private speakerEl: HTMLElement;
  private textEl: HTMLElement;
  private indicatorEl: HTMLElement;
  private eventBus: EventBus;

  private typewriterTimer: number | null = null;
  private fullText = '';
  private currentIndex = 0;
  private isComplete = false;

  constructor(parent: HTMLElement, eventBus: EventBus) {
    this.eventBus = eventBus;

    this.container = document.createElement('div');
    this.container.className = 'aivn-dialogue';
    this.container.style.display = 'none';

    this.speakerEl = document.createElement('div');
    this.speakerEl.className = 'aivn-dialogue-speaker';

    this.textEl = document.createElement('div');
    this.textEl.className = 'aivn-dialogue-text';

    this.indicatorEl = document.createElement('div');
    this.indicatorEl.className = 'aivn-dialogue-indicator';

    this.container.appendChild(this.speakerEl);
    this.container.appendChild(this.textEl);
    this.container.appendChild(this.indicatorEl);
    parent.appendChild(this.container);

    this.container.addEventListener('click', () => this.handleClick());

    // Listen for skip events
    this.eventBus.on('dialogue:skip', () => this.skipToEnd());
  }

  showDialogue(speaker: string | null, text: string): void {
    this.container.style.display = '';
    this.indicatorEl.classList.remove('visible');

    if (speaker) {
      this.container.classList.remove('aivn-narration');
      this.speakerEl.textContent = speaker;
      this.speakerEl.style.display = '';
    } else {
      this.container.classList.add('aivn-narration');
      this.speakerEl.style.display = 'none';
    }

    this.fullText = text;
    this.currentIndex = 0;
    this.isComplete = false;
    this.textEl.innerHTML = '<span class="aivn-cursor"></span>';

    this.eventBus.emit('dialogue:start', { speaker: speaker ?? '', text });
    this.startTypewriter();
  }

  private startTypewriter(): void {
    this.stopTypewriter();

    this.typewriterTimer = window.setInterval(() => {
      if (this.currentIndex >= this.fullText.length) {
        this.completeTypewriter();
        return;
      }

      const char = this.fullText[this.currentIndex];
      this.currentIndex++;

      // Build displayed text up to currentIndex, append cursor
      this.textEl.innerHTML =
        escapeHtml(this.fullText.slice(0, this.currentIndex)) +
        '<span class="aivn-cursor"></span>';

      this.eventBus.emit('dialogue:char', { char, index: this.currentIndex });
    }, CHAR_DELAY);
  }

  private stopTypewriter(): void {
    if (this.typewriterTimer !== null) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  }

  private completeTypewriter(): void {
    this.stopTypewriter();
    this.isComplete = true;
    this.textEl.textContent = this.fullText;
    this.indicatorEl.classList.add('visible');
    this.eventBus.emit('dialogue:complete');
  }

  private skipToEnd(): void {
    if (!this.isComplete) {
      this.completeTypewriter();
    }
  }

  private handleClick(): void {
    if (!this.isComplete) {
      this.skipToEnd();
    } else {
      this.eventBus.emit('engine:advance');
    }
  }

  hide(): void {
    this.stopTypewriter();
    this.container.style.display = 'none';
  }

  dispose(): void {
    this.stopTypewriter();
    this.container.remove();
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
