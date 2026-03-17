import { z } from 'zod';

const stagePositionSchema = z.enum(['left', 'center', 'right', 'far-left', 'far-right']);

const characterDirectionSchema = z.object({
  position: stagePositionSchema.optional(),
  expression: z.string().optional(),
  enter: z.boolean().optional(),
  exit: z.boolean().optional(),
});

const narrationDirectionSchema = z.object({
  narration: z.string(),
  characters: z.record(characterDirectionSchema).optional(),
});

const dialogueDirectionSchema = z.object({
  dialogue: z.object({
    speaker: z.string(),
    intent: z.string().optional(),
    line: z.string().optional(),
  }),
});

const choiceOptionSchema = z.object({
  text: z.string(),
  leads_to: z.string().optional(),
  ai_generate: z.boolean().optional(),
});

const choiceDirectionSchema = z.object({
  choice: z.object({
    prompt: z.string(),
    options: z.array(choiceOptionSchema),
  }),
});

const sceneDirectionSchema = z.union([
  narrationDirectionSchema,
  dialogueDirectionSchema,
  choiceDirectionSchema,
]);

const backgroundSpecSchema = z.object({
  style: z.string(),
  mood: z.string(),
  negative_prompt: z.string().optional(),
});

const expressionDefSchema = z.object({
  morphTargets: z.record(z.number()),
});

const characterDefinitionSchema = z.object({
  name: z.string(),
  model: z.string(),
  description: z.string(),
  default_expression: z.string().default('neutral'),
  expressions: z.record(expressionDefSchema).optional(),
});

const sceneDefinitionSchema = z.object({
  id: z.string(),
  setting: z.string(),
  background: backgroundSpecSchema.optional(),
  direction: z.array(sceneDirectionSchema),
});

export const storyScriptSchema = z.object({
  meta: z.object({
    title: z.string(),
    author: z.string(),
    version: z.string().optional(),
  }),
  characters: z.record(characterDefinitionSchema),
  scenes: z.array(sceneDefinitionSchema),
});

export type StoryScriptInput = z.infer<typeof storyScriptSchema>;
