# AIVN Engine

AI-powered Visual Novel Engine built with TypeScript, Three.js, and a modular monorepo architecture.

## Architecture

```
aivn-engine/
├── apps/
│   └── player/          # Vite-based web player
├── packages/
│   ├── core/            # Shared types, event bus
│   ├── renderer/        # Three.js 3D scene rendering
│   ├── character-system/ # Character state & expression management
│   ├── ui/              # Dialogue box, choices, loading overlay
│   ├── script-parser/   # Story script parsing
│   ├── ai-director/     # Scene resolution & dialogue orchestration
│   └── image-gen/       # Background image generation (ComfyUI integration)
└── examples/
```

## Features

- **Three.js Renderer** — 3D scene with background textures, character models (GLTF), lighting, and GSAP animations
- **Typewriter Dialogue** — Character-by-character text reveal with speaker names and narration mode
- **Branching Choices** — Player-driven story branching with animated choice panels
- **Event-Driven Architecture** — Decoupled subsystems communicating via a typed EventBus
- **AI Background Generation** — Placeholder gradient backgrounds with planned ComfyUI integration
- **Modular Monorepo** — Independent packages managed with pnpm workspaces and Turborepo

## Tech Stack

- **Runtime**: TypeScript, Three.js, GSAP
- **Build**: Vite, Turborepo, pnpm workspaces
- **3D**: Three.js with GLTF model loading, morph target expressions
- **UI**: Vanilla DOM with CSS animations

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build
```

## Roadmap

- **Phase 1** (current): Core engine with hardcoded demo scenes
- **Phase 2**: Script parser + AI Director for dynamic scene resolution
- **Phase 3**: ComfyUI integration for AI-generated backgrounds
- **Phase 4**: Character model generation and full pipeline

## License

MIT
