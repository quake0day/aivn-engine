import type { EventBus } from '@aivn/core';

export class LoadingIndicator {
  private container: HTMLElement;

  constructor(parent: HTMLElement, eventBus: EventBus) {
    this.container = document.createElement('div');
    this.container.className = 'aivn-loading';
    this.container.style.display = 'none';
    this.container.innerHTML = `
      <div class="aivn-loading-spinner"></div>
      <span>Loading...</span>
    `;
    parent.appendChild(this.container);

    eventBus.on('background:loading', () => this.show('Generating background...'));
    eventBus.on('background:ready', () => this.hide());
    eventBus.on('background:error', () => this.hide());
  }

  show(message = 'Loading...'): void {
    this.container.style.display = '';
    const span = this.container.querySelector('span');
    if (span) span.textContent = message;
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  dispose(): void {
    this.container.remove();
  }
}
