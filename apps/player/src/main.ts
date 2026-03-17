import { Engine } from './engine.js';
import { DEMO_SCENE, DEMO_SCENE_2 } from './demo-data.js';
import '@aivn/ui/styles/dialogue.css';

async function main() {
  const container = document.getElementById('game')!;

  const engine = new Engine(container);
  const eventBus = engine.getEventBus();

  // Store scenes for branch navigation
  const scenes = new Map([
    [DEMO_SCENE.sceneId, DEMO_SCENE],
    [DEMO_SCENE_2.sceneId, DEMO_SCENE_2],
  ]);

  // Handle choice-based scene transitions
  eventBus.on('choice:select', ({ index }) => {
    const currentSteps = DEMO_SCENE.steps;
    const choiceStep = currentSteps[currentSteps.length - 1];
    if (choiceStep.type === 'choice') {
      const option = choiceStep.options[index];
      if (option.leadsTo) {
        const nextScene = scenes.get(option.leadsTo);
        if (nextScene) {
          setTimeout(() => engine.playResolvedScene(nextScene), 100);
        }
      }
    }
  });

  // Debug logging
  eventBus.on('engine:state-change', ({ from, to }) => {
    console.log(`[Engine] ${from} → ${to}`);
  });

  eventBus.on('engine:error', ({ message, error }) => {
    console.error(`[Engine Error] ${message}`, error);
  });

  // Start the demo
  await engine.playResolvedScene(DEMO_SCENE);
}

main().catch(console.error);
