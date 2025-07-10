# MEGA Megaverses

This directory contains the 3D megaverse scenes for different MEGA projects.

## Structure

```
src/megaverses/
├── megaverse-manager.ts     # Main manager for all megaverses
├── shared/                  # Shared 3D objects and utilities
│   └── objects/            # Reusable 3D objects (forest, lake, drones, etc.)
├── megafeu/                # Project Megafeu megaverse
│   └── megafeu-megaverse.ts
├── vitesse/                # Project Vitesse megaverse (TODO)
├── plastic/                # Project Plastic megaverse (TODO)
├── racine/                 # Project Racine megaverse (TODO)
├── goggo/                  # Project Goggo megaverse (TODO)
└── convoi/                 # Project Convoi megaverse (TODO)
```

## Adding a New Project Megaverse

1. Create a new directory for your project: `src/megaverses/[project-name]/`
2. Create the megaverse file: `[project-name]-megaverse.ts`
3. Export a function named `show[ProjectName]Megaverse()`
4. Update `megaverse-manager.ts` to include your new project
5. Add the megaverse button to the HTML with `data-project="[project-name]"`

## Example

```typescript
// src/megaverses/vitesse/vitesse-megaverse.ts
export function showVitesseMegaverse() {
  // Your 3D scene implementation
}

// src/megaverses/megaverse-manager.ts
case 'vitesse':
  showVitesseMegaverse();
  break;

// index.html
<button class="megaverse-button" data-project="vitesse">See in Megaverse</button>
```

## Shared Objects

The `shared/objects/` directory contains truly reusable 3D objects:

- `mountains.ts` - Background mountain terrain
- `ball.ts` - Interactive ball for user control
- `ground.ts` - Basic ground plane

## Project-Specific Objects

Each project megaverse contains its own specific objects:

### Megafeu
- `forest.ts` - Forest and fire effects
- `lake.ts` - Lake for water resupply
- `drone.ts` - Firefighting drones
- `spiders.ts` - Firefighting spider robots 