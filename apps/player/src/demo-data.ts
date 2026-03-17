import type { ResolvedScene, StoryScript } from '@aivn/core';

/**
 * Hardcoded demo scene for Phase 1 testing.
 * This will be replaced by script-parser + AI Director in Phase 2.
 */
export const DEMO_SCENE: ResolvedScene = {
  sceneId: 'opening',
  setting: '暴风雨前的悬崖，破旧灯塔矗立在暮色中。',
  steps: [
    {
      type: 'narration',
      text: '暴风雨酝酿了一整个下午。乌云从海面上翻滚而来，空气中弥漫着潮湿的咸味。',
      characters: [],
    },
    {
      type: 'narration',
      text: '那座灯塔已经在悬崖上矗立了一百多年。油漆斑驳，铁锈蔓延，却依然倔强地站在那里。',
      characters: [
        {
          characterId: 'mari',
          name: 'Mari',
          position: 'right',
          expression: 'neutral',
          visible: true,
        },
      ],
    },
    {
      type: 'dialogue',
      speaker: 'mari',
      speakerName: 'Mari',
      text: '又一场暴风雨要来了……这次看起来不太一样。',
      characters: [
        {
          characterId: 'mari',
          name: 'Mari',
          position: 'right',
          expression: 'worried',
          visible: true,
        },
      ],
    },
    {
      type: 'dialogue',
      speaker: 'mari',
      speakerName: 'Mari',
      text: '不过没关系。灯塔经历过比这更猛烈的风暴，我也一样。',
      characters: [
        {
          characterId: 'mari',
          name: 'Mari',
          position: 'right',
          expression: 'determined',
          visible: true,
        },
      ],
    },
    {
      type: 'narration',
      text: 'Mari 的风衣在海风中猎猎作响。她望向远处翻涌的海面，目光坚定。',
      characters: [
        {
          characterId: 'mari',
          name: 'Mari',
          position: 'center',
          expression: 'determined',
          visible: true,
        },
      ],
    },
    {
      type: 'choice',
      prompt: 'Mari 决定……',
      options: [
        { text: '点亮灯塔，迎接暴风雨', leadsTo: 'light_the_lamp' },
        { text: '先检查灯塔的结构安全', leadsTo: 'inspect_tower' },
        { text: '下山寻找之前的守塔人', leadsTo: 'find_keeper' },
      ],
    },
  ],
};

export const DEMO_SCENE_2: ResolvedScene = {
  sceneId: 'light_the_lamp',
  setting: '灯塔内部，螺旋楼梯通向顶端的灯室。昏暗的光线从窗缝中渗入。',
  steps: [
    {
      type: 'narration',
      text: 'Mari 推开沉重的铁门，走进灯塔。空气中飘着机油和旧书的味道。',
      characters: [],
    },
    {
      type: 'narration',
      text: '螺旋楼梯在她脚下发出低沉的呻吟。每一步都带起微小的铁锈碎片。',
      characters: [
        {
          characterId: 'mari',
          name: 'Mari',
          position: 'center',
          expression: 'determined',
          visible: true,
        },
      ],
    },
    {
      type: 'dialogue',
      speaker: 'mari',
      speakerName: 'Mari',
      text: '爷爷说过，只要灯还亮着，船就能找到回家的路。',
      characters: [
        {
          characterId: 'mari',
          name: 'Mari',
          position: 'center',
          expression: 'sad',
          visible: true,
        },
      ],
    },
    {
      type: 'dialogue',
      speaker: 'mari',
      speakerName: 'Mari',
      text: '今晚，我一定要让它亮起来。',
      characters: [
        {
          characterId: 'mari',
          name: 'Mari',
          position: 'center',
          expression: 'determined',
          visible: true,
        },
      ],
    },
  ],
};

/** Demo story script for Phase 2 testing */
export const DEMO_SCRIPT: StoryScript = {
  meta: {
    title: '灯塔守望者',
    author: 'AIVN Demo',
  },
  characters: {
    mari: {
      id: 'mari',
      name: 'Mari',
      model: 'characters/mari.glb',
      description: '年轻的灯塔守护者，短发，风衣',
      default_expression: 'neutral',
    },
  },
  scenes: [
    {
      id: 'opening',
      setting: '暴风雨前的悬崖，破旧灯塔矗立在暮色中。',
      background: { style: 'watercolor anime', mood: 'melancholic' },
      direction: [
        {
          narration: '暴风雨酝酿了一整个下午。乌云从海面上翻滚而来。',
          characters: {
            mari: { position: 'right', expression: 'neutral' },
          },
        },
        {
          dialogue: {
            speaker: 'mari',
            line: '又一场暴风雨要来了……这次看起来不太一样。',
          },
        },
        {
          choice: {
            prompt: 'Mari 决定……',
            options: [
              { text: '点亮灯塔', leads_to: 'light_the_lamp' },
              { text: '检查结构', leads_to: 'inspect_tower' },
            ],
          },
        },
      ],
    },
  ],
};
