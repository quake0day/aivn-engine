import type { EventBus, ResolvedChoiceOption } from '@aivn/core';
import { gsap } from 'gsap';

export class ChoicePanel {
  private container: HTMLElement;
  private eventBus: EventBus;

  constructor(parent: HTMLElement, eventBus: EventBus) {
    this.eventBus = eventBus;

    this.container = document.createElement('div');
    this.container.className = 'aivn-choices';
    this.container.style.display = 'none';
    parent.appendChild(this.container);
  }

  show(prompt: string, options: ResolvedChoiceOption[]): void {
    this.container.innerHTML = '';
    this.container.style.display = '';

    this.eventBus.emit('choice:show', {
      prompt,
      options: options.map(o => ({ text: o.text })),
    });

    options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'aivn-choice-btn';
      btn.textContent = option.text;

      btn.addEventListener('click', () => {
        this.eventBus.emit('choice:select', { index, text: option.text });
        this.hide();
      });

      this.container.appendChild(btn);

      // Staggered entrance animation
      gsap.fromTo(btn,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, delay: index * 0.1, ease: 'power2.out' },
      );
    });
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }

  dispose(): void {
    this.container.remove();
  }
}
