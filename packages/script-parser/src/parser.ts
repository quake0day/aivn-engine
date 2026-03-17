import { parse as parseYaml } from 'yaml';
import type { StoryScript, CharacterDefinition, SceneDefinition, SceneDirection } from '@aivn/core';
import { storyScriptSchema } from './schema.js';

export class ScriptParseError extends Error {
  constructor(message: string, public issues?: unknown[]) {
    super(message);
    this.name = 'ScriptParseError';
  }
}

export function parseScript(yamlContent: string): StoryScript {
  let raw: unknown;
  try {
    raw = parseYaml(yamlContent);
  } catch (err) {
    throw new ScriptParseError(`YAML parse error: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = storyScriptSchema.safeParse(raw);
  if (!result.success) {
    throw new ScriptParseError('Script validation failed', result.error.issues);
  }

  const data = result.data;

  // Transform to internal types, adding character IDs
  const characters: Record<string, CharacterDefinition> = {};
  for (const [id, charDef] of Object.entries(data.characters)) {
    characters[id] = {
      id,
      ...charDef,
    };
  }

  const scenes: SceneDefinition[] = data.scenes.map(scene => ({
    id: scene.id,
    setting: scene.setting,
    background: scene.background,
    direction: scene.direction as SceneDirection[],
  }));

  return {
    meta: data.meta,
    characters,
    scenes,
  };
}
