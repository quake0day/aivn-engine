import type { EventBus, BackgroundSpec } from '@aivn/core';
import { get, set } from 'idb-keyval';

/**
 * ComfyUI client — Phase 3 implementation.
 * For now, provides a stub that returns placeholder backgrounds.
 */
export class ComfyUIClient {
  private serverUrl: string;

  constructor(
    private eventBus: EventBus,
    serverUrl = 'http://127.0.0.1:8188',
  ) {
    this.serverUrl = serverUrl;
  }

  async generateBackground(setting: string, spec?: BackgroundSpec): Promise<string> {
    const cacheKey = this.hashPrompt(setting + JSON.stringify(spec ?? {}));

    // Check IndexedDB cache
    const cached = await get<string>(`bg:${cacheKey}`);
    if (cached) {
      return cached;
    }

    this.eventBus.emit('background:loading', {
      prompt: setting,
    });

    try {
      // Phase 3: Will send to ComfyUI REST API
      // For now, return a placeholder gradient
      const url = this.generatePlaceholderBackground(setting, spec);

      // Cache the result
      await set(`bg:${cacheKey}`, url);

      this.eventBus.emit('background:ready', { url });
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.eventBus.emit('background:error', { error: message });
      throw err;
    }
  }

  private generatePlaceholderBackground(setting: string, spec?: BackgroundSpec): string {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    // Generate a mood-based gradient
    const mood = spec?.mood ?? 'neutral';
    const colors = this.moodColors(mood);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.6, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add setting text
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    const lines = setting.split(/[。，]/).filter(Boolean);
    lines.forEach((line, i) => {
      ctx.fillText(line.trim(), canvas.width / 2, canvas.height / 2 - 30 + i * 36);
    });

    return canvas.toDataURL('image/jpeg', 0.85);
  }

  private moodColors(mood: string): [string, string, string] {
    const moods: Record<string, [string, string, string]> = {
      'melancholic': ['#2c3e50', '#34495e', '#1a252f'],
      'romantic': ['#e74c3c', '#c0392b', '#2c1810'],
      'mysterious': ['#1a1a2e', '#16213e', '#0f0f23'],
      'cheerful': ['#f39c12', '#e67e22', '#d35400'],
      'tense': ['#7f8c8d', '#95a5a6', '#2c3e50'],
      'peaceful': ['#3498db', '#2ecc71', '#1a5276'],
      'neutral': ['#2c3e50', '#3498db', '#1a252f'],
    };
    return moods[mood] ?? moods['neutral'];
  }

  private hashPrompt(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
}
