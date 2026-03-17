import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import type { EventBus, ResolvedScene, StagePosition } from '@aivn/core';

const STAGE_POSITIONS: Record<StagePosition, number> = {
  'far-left': -3,
  'left': -1.5,
  'center': 0,
  'right': 1.5,
  'far-right': 3,
};

const BG_WIDTH = 16;
const BG_HEIGHT = 9;

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement;
  eventBus: EventBus;
}

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private bgMesh: THREE.Mesh | null = null;
  private characterModels = new Map<string, THREE.Group>();
  private gltfLoader = new GLTFLoader();
  private textureLoader = new THREE.TextureLoader();
  private eventBus: EventBus;
  private animationId: number | null = null;

  constructor(options: SceneManagerOptions) {
    this.eventBus = options.eventBus;

    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);
    this.camera.position.set(0, 1.2, 5);
    this.camera.lookAt(0, 1, 0);

    this.setupLighting();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff5e6, 1.0);
    key.position.set(2, 3, 4);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xe6f0ff, 0.4);
    fill.position.set(-2, 2, 3);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, 2, -3);
    this.scene.add(rim);
  }

  private handleResize(): void {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  start(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  async setBackground(url: string): Promise<void> {
    const texture = await this.textureLoader.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;

    if (this.bgMesh) {
      const oldMesh = this.bgMesh;
      // Fade out old background
      gsap.to((oldMesh.material as THREE.MeshBasicMaterial), {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          this.scene.remove(oldMesh);
          oldMesh.geometry.dispose();
          (oldMesh.material as THREE.MeshBasicMaterial).dispose();
        },
      });
    }

    const geometry = new THREE.PlaneGeometry(BG_WIDTH, BG_HEIGHT);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
    });

    this.bgMesh = new THREE.Mesh(geometry, material);
    this.bgMesh.position.set(0, BG_HEIGHT / 2 - 1, -5);
    this.scene.add(this.bgMesh);

    gsap.to(material, { opacity: 1, duration: 0.8 });

    this.eventBus.emit('background:ready', { url });
  }

  setBackgroundColor(color: string | number): void {
    this.scene.background = new THREE.Color(color);
  }

  async loadCharacterModel(characterId: string, modelUrl: string): Promise<void> {
    const gltf = await this.gltfLoader.loadAsync(modelUrl);
    const model = gltf.scene;
    model.visible = false;
    model.userData['characterId'] = characterId;
    this.scene.add(model);
    this.characterModels.set(characterId, model);
  }

  setCharacterPosition(characterId: string, position: StagePosition, animate = true): void {
    const model = this.characterModels.get(characterId);
    if (!model) return;

    const targetX = STAGE_POSITIONS[position];

    if (animate) {
      gsap.to(model.position, { x: targetX, duration: 0.6, ease: 'power2.out' });
    } else {
      model.position.x = targetX;
    }
  }

  setCharacterVisible(characterId: string, visible: boolean, animate = true): void {
    const model = this.characterModels.get(characterId);
    if (!model) return;

    if (animate) {
      if (visible) {
        model.visible = true;
        model.traverse(child => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (!mat.transparent) {
              mat.transparent = true;
            }
            gsap.fromTo(mat, { opacity: 0 }, { opacity: 1, duration: 0.5 });
          }
        });
      } else {
        model.traverse(child => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;
            gsap.to(mat, {
              opacity: 0,
              duration: 0.5,
              onComplete: () => { model.visible = false; },
            });
          }
        });
      }
    } else {
      model.visible = visible;
    }
  }

  setCharacterExpression(characterId: string, morphTargets: Record<string, number>): void {
    const model = this.characterModels.get(characterId);
    if (!model) return;

    model.traverse(child => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetInfluences && child.morphTargetDictionary) {
        for (const [name, weight] of Object.entries(morphTargets)) {
          const idx = child.morphTargetDictionary[name];
          if (idx !== undefined) {
            gsap.to(child.morphTargetInfluences, {
              [idx]: weight,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
        }
      }
    });
  }

  getCharacterModel(characterId: string): THREE.Group | undefined {
    return this.characterModels.get(characterId);
  }

  async transitionScene(scene: ResolvedScene): Promise<void> {
    this.eventBus.emit('scene:transition-start', { to: scene.sceneId });

    // Fade out all characters
    for (const [id] of this.characterModels) {
      this.setCharacterVisible(id, false);
    }

    if (scene.backgroundUrl) {
      await this.setBackground(scene.backgroundUrl);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    this.eventBus.emit('scene:transition-end', { sceneId: scene.sceneId });
  }

  dispose(): void {
    this.stop();
    this.characterModels.forEach(model => {
      this.scene.remove(model);
    });
    this.characterModels.clear();
    if (this.bgMesh) {
      this.scene.remove(this.bgMesh);
    }
    this.renderer.dispose();
    window.removeEventListener('resize', () => this.handleResize());
  }
}
