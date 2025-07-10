import { showMegafeuMegaverse } from './megafeu/megafeu-megaverse';
import { showVitesseMegaverse } from './vitesse/vitesse-megaverse';
import { showRacineMegaverse } from './racine/racine-megaverse';

export type ProjectMegaverse = 'megafeu' | 'vitesse' | 'plastic' | 'racine' | 'goggo' | 'convoi';

export function showMegaverse(project: ProjectMegaverse = 'megafeu'): void {
  switch (project) {
    case 'megafeu':
      showMegafeuMegaverse();
      break;
    case 'vitesse':
      showVitesseMegaverse();
      break;
    case 'plastic':
      // TODO: Implement Plastic megaverse
      console.log('Plastic megaverse not yet implemented');
      break;
    case 'racine':
      showRacineMegaverse();
      break;
    case 'goggo':
      // TODO: Implement Goggo megaverse
      console.log('Goggo megaverse not yet implemented');
      break;
    case 'convoi':
      // TODO: Implement Convoi megaverse
      console.log('Convoi megaverse not yet implemented');
      break;
    default:
      showMegafeuMegaverse();
      break;
  }
} 