import type { ReactNode } from 'react';

export interface DiffSpot {
  id: string;
  /** Coordonnées dans le viewBox 0..320 x 0..220 */
  x: number;
  y: number;
  r: number;
  label: string;
}

export interface DiffScene {
  id: string;
  title: string;
  icon: string;
  spots: DiffSpot[]; // 7 différences au total (5 utilisées en 1re année, 7 en 3e année)
  render: (variant: 'left' | 'right', activeDiffIds: Set<string>) => ReactNode;
}

export const DIFF_SCENES: DiffScene[] = [
  {
    id: 'parc',
    title: 'Le Parc Ensoleillé',
    icon: '🌳',
    spots: [
      { id: 'sun', x: 52, y: 42, r: 26, label: 'Couleur du soleil' },
      { id: 'cloud', x: 185, y: 38, r: 28, label: 'Nuage en plus' },
      { id: 'roof', x: 245, y: 112, r: 30, label: 'Couleur du toit' },
      { id: 'apple', x: 86, y: 118, r: 22, label: 'Pomme dans l’arbre' },
      { id: 'flower', x: 155, y: 188, r: 24, label: 'Fleur rouge' },
      { id: 'door', x: 245, y: 162, r: 22, label: 'Porte de la maison' },
      { id: 'bird', x: 122, y: 58, r: 22, label: 'Petit oiseau' },
    ],
    render: (variant, active) => {
      const diff = (id: string) => variant === 'right' && active.has(id);
      return (
        <svg viewBox="0 0 320 220" className="h-full w-full">
          <rect width="320" height="220" fill="#BAE6FD" />
          <rect y="155" width="320" height="65" fill="#86EFAC" />
          {/* Soleil */}
          <circle cx="52" cy="42" r="22" fill={diff('sun') ? '#FB923C' : '#FACC15'} />
          {/* Nuage */}
          <g fill="#FFFFFF">
            <circle cx="115" cy="42" r="14" />
            <circle cx="130" cy="38" r="18" />
            <circle cx="146" cy="43" r="13" />
          </g>
          {!diff('cloud') && (
            <g fill="#FFFFFF">
              <circle cx="176" cy="40" r="12" />
              <circle cx="190" cy="36" r="15" />
              <circle cx="204" cy="41" r="11" />
            </g>
          )}
          {/* Oiseau */}
          {diff('bird') && (
            <path d="M112 60 Q117 52 122 58 Q127 52 132 60" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
          )}
          {/* Arbre */}
          <rect x="68" y="128" width="22" height="50" rx="4" fill="#92400E" />
          <circle cx="79" cy="108" r="36" fill="#22C55E" />
          <circle cx="66" cy="102" r="6" fill="#EF4444" />
          {!diff('apple') && <circle cx="88" cy="118" r="6" fill="#EF4444" />}
          {/* Maison */}
          <rect x="208" y="118" width="74" height="58" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <polygon points="200,120 245,86 290,120" fill={diff('roof') ? '#8B5CF6' : '#EF4444'} />
          <rect x="234" y="146" width="22" height="30" rx="3" fill={diff('door') ? '#0EA5E9' : '#B45309'} />
          <rect x="216" y="130" width="14" height="14" rx="2" fill="#38BDF8" />
          {/* Fleurs */}
          <circle cx="122" cy="188" r="7" fill="#F472B6" />
          <circle cx="122" cy="188" r="3" fill="#FACC15" />
          {!diff('flower') && (
            <>
              <circle cx="155" cy="188" r="8" fill="#EF4444" />
              <circle cx="155" cy="188" r="3.5" fill="#FACC15" />
            </>
          )}
          <circle cx="188" cy="192" r="7" fill="#C084FC" />
          <circle cx="188" cy="192" r="3" fill="#FACC15" />
        </svg>
      );
    },
  },
  {
    id: 'espace',
    title: 'Voyage dans l’Espace',
    icon: '🚀',
    spots: [
      { id: 'planet', x: 74, y: 66, r: 30, label: 'Couleur de Saturne' },
      { id: 'rocket', x: 184, y: 120, r: 28, label: 'Hublot de la fusée' },
      { id: 'moon', x: 266, y: 48, r: 26, label: 'Cratère sur la lune' },
      { id: 'star1', x: 136, y: 40, r: 22, label: 'Étoile jaune' },
      { id: 'ufo', x: 70, y: 170, r: 28, label: 'Soucoupe volante' },
      { id: 'flame', x: 184, y: 168, r: 24, label: 'Flamme de la fusée' },
      { id: 'earth', x: 268, y: 166, r: 26, label: 'Planète verte' },
    ],
    render: (variant, active) => {
      const diff = (id: string) => variant === 'right' && active.has(id);
      return (
        <svg viewBox="0 0 320 220" className="h-full w-full">
          <rect width="320" height="220" fill="#0F172A" />
          <circle cx="28" cy="28" r="2.5" fill="#FFFFFF" />
          <circle cx="220" cy="30" r="2" fill="#FFFFFF" />
          <circle cx="298" cy="106" r="2.5" fill="#FFFFFF" />
          <circle cx="32" cy="128" r="2" fill="#FFFFFF" />
          {/* Étoile */}
          {!diff('star1') && <circle cx="136" cy="40" r="9" fill="#FACC15" />}
          {/* Saturne */}
          <ellipse cx="74" cy="66" rx="38" ry="10" fill="none" stroke="#FDE047" strokeWidth="4" />
          <circle cx="74" cy="66" r="20" fill={diff('planet') ? '#F472B6' : '#FB923C'} />
          {/* Lune */}
          <circle cx="266" cy="48" r="20" fill="#E2E8F0" />
          <circle cx="260" cy="44" r="4" fill="#94A3B8" />
          {!diff('moon') && <circle cx="274" cy="54" r="5" fill="#94A3B8" />}
          {/* Fusée */}
          <path d="M184 74 C202 95 202 140 198 152 L170 152 C166 140 166 95 184 74 Z" fill="#F8FAFC" />
          <path d="M184 74 C192 84 195 92 197 98 L171 98 C173 92 176 84 184 74 Z" fill="#EF4444" />
          <circle cx="184" cy="120" r="10" fill={diff('rocket') ? '#FACC15' : '#38BDF8'} stroke="#1E293B" strokeWidth="3" />
          <polygon points="170,136 156,156 170,152" fill="#EF4444" />
          <polygon points="198,136 212,156 198,152" fill="#EF4444" />
          <polygon points="174,152 194,152 184,182" fill={diff('flame') ? '#38BDF8' : '#FB923C'} />
          {/* Soucoupe */}
          {!diff('ufo') && (
            <g>
              <ellipse cx="70" cy="172" rx="24" ry="8" fill="#94A3B8" />
              <path d="M56 170 Q70 150 84 170" fill="#34D399" />
            </g>
          )}
          {/* Petite planète */}
          <circle cx="268" cy="166" r="18" fill={diff('earth') ? '#A855F7' : '#34D399'} />
        </svg>
      );
    },
  },
  {
    id: 'ocean',
    title: 'Le Fond de l’Océan',
    icon: '🐠',
    spots: [
      { id: 'fish1', x: 86, y: 74, r: 28, label: 'Couleur du poisson' },
      { id: 'octopus', x: 230, y: 92, r: 30, label: 'Poulpe violet' },
      { id: 'starfish', x: 76, y: 184, r: 24, label: 'Étoile de mer' },
      { id: 'chest', x: 236, y: 174, r: 28, label: 'Coffre au trésor' },
      { id: 'bubbles', x: 152, y: 52, r: 24, label: 'Bulles d’air' },
      { id: 'seaweed', x: 154, y: 168, r: 26, label: 'Algue verte' },
      { id: 'fish2', x: 158, y: 112, r: 24, label: 'Petit poisson bleu' },
    ],
    render: (variant, active) => {
      const diff = (id: string) => variant === 'right' && active.has(id);
      return (
        <svg viewBox="0 0 320 220" className="h-full w-full">
          <rect width="320" height="220" fill="#0284C7" />
          <rect y="168" width="320" height="52" fill="#FDE68A" />
          {/* Bulles */}
          {!diff('bubbles') && (
            <g fill="none" stroke="#BAE6FD" strokeWidth="2.5">
              <circle cx="146" cy="58" r="6" />
              <circle cx="158" cy="42" r="9" />
            </g>
          )}
          {/* Poisson 1 */}
          <ellipse cx="86" cy="74" rx="22" ry="14" fill={diff('fish1') ? '#F472B6' : '#FB923C'} />
          <polygon points="64,74 48,60 48,88" fill={diff('fish1') ? '#F472B6' : '#FB923C'} />
          <circle cx="96" cy="70" r="3" fill="#0F172A" />
          {/* Petit poisson 2 */}
          {!diff('fish2') && (
            <g>
              <ellipse cx="158" cy="112" rx="14" ry="9" fill="#38BDF8" />
              <polygon points="144,112 134,104 134,120" fill="#38BDF8" />
              <circle cx="164" cy="110" r="2" fill="#0F172A" />
            </g>
          )}
          {/* Poulpe */}
          <circle cx="230" cy="86" r="20" fill={diff('octopus') ? '#FACC15' : '#C084FC'} />
          <circle cx="222" cy="84" r="3" fill="#0F172A" />
          <circle cx="238" cy="84" r="3" fill="#0F172A" />
          <path d="M214 102 Q210 120 218 122 M226 104 Q226 122 232 122 M242 102 Q248 120 240 122" stroke={diff('octopus') ? '#FACC15' : '#C084FC'} strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Algue */}
          <path d="M36 186 Q28 156 38 130" stroke="#16A34A" strokeWidth="8" fill="none" strokeLinecap="round" />
          {!diff('seaweed') && (
            <path d="M154 188 Q164 160 150 136" stroke="#22C55E" strokeWidth="8" fill="none" strokeLinecap="round" />
          )}
          {/* Étoile de mer */}
          {!diff('starfish') && <circle cx="76" cy="186" r="12" fill="#FB7185" />}
          {/* Coffre */}
          <rect x="212" y="160" width="48" height="30" rx="5" fill={diff('chest') ? '#7C3AED' : '#B45309'} />
          <rect x="212" y="170" width="48" height="5" fill="#FACC15" />
          <circle cx="236" cy="173" r="4" fill="#FDE047" />
        </svg>
      );
    },
  },
  {
    id: 'chateau',
    title: 'Le Château Magique',
    icon: '🏰',
    spots: [
      { id: 'flag1', x: 96, y: 42, r: 22, label: 'Drapeau gauche' },
      { id: 'flag2', x: 224, y: 42, r: 22, label: 'Drapeau droit' },
      { id: 'gate', x: 160, y: 158, r: 28, label: 'Porte du château' },
      { id: 'rainbow', x: 256, y: 84, r: 28, label: 'Arc-en-ciel' },
      { id: 'window', x: 160, y: 100, r: 22, label: 'Fenêtre centrale' },
      { id: 'bush', x: 56, y: 176, r: 24, label: 'Buisson fleuri' },
      { id: 'dragon', x: 52, y: 66, r: 26, label: 'Étoile magique' },
    ],
    render: (variant, active) => {
      const diff = (id: string) => variant === 'right' && active.has(id);
      return (
        <svg viewBox="0 0 320 220" className="h-full w-full">
          <rect width="320" height="220" fill="#DDD6FE" />
          <rect y="166" width="320" height="54" fill="#4ADE80" />
          {/* Arc-en-ciel */}
          {!diff('rainbow') && (
            <g fill="none" strokeWidth="5">
              <path d="M210 110 A46 46 0 0 1 302 110" stroke="#F43F5E" />
              <path d="M216 110 A40 40 0 0 1 296 110" stroke="#FACC15" />
              <path d="M222 110 A34 34 0 0 1 290 110" stroke="#38BDF8" />
            </g>
          )}
          {/* Étoile magique */}
          {!diff('dragon') && <circle cx="52" cy="66" r="12" fill="#FACC15" />}
          {/* Château */}
          <rect x="82" y="88" width="32" height="86" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <rect x="206" y="88" width="32" height="86" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <rect x="114" y="106" width="92" height="68" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
          <polygon points="78,88 98,52 118,88" fill="#EC4899" />
          <polygon points="202,88 222,52 242,88" fill="#EC4899" />
          {/* Drapeaux */}
          <polygon points="98,52 98,36 116,44" fill={diff('flag1') ? '#38BDF8' : '#FACC15'} />
          {!diff('flag2') && <polygon points="222,52 222,36 240,44" fill="#FACC15" />}
          {/* Fenêtre */}
          <circle cx="160" cy="120" r="10" fill={diff('window') ? '#FACC15' : '#38BDF8'} />
          {/* Porte */}
          <path d="M142 174 L142 150 A18 18 0 0 1 178 150 L178 174 Z" fill={diff('gate') ? '#0EA5E9' : '#92400E'} />
          {/* Buisson */}
          {!diff('bush') && <circle cx="56" cy="176" r="18" fill="#16A34A" />}
        </svg>
      );
    },
  },
  {
    id: 'chambre',
    title: 'La Chambre Colorée',
    icon: '🛏️',
    spots: [
      { id: 'pillow', x: 84, y: 138, r: 24, label: 'Couleur du coussin' },
      { id: 'poster', x: 162, y: 66, r: 28, label: 'Tableau au mur' },
      { id: 'lamp', x: 256, y: 120, r: 26, label: 'Lampe allumée' },
      { id: 'ball', x: 168, y: 186, r: 24, label: 'Ballon sur le tapis' },
      { id: 'window', x: 64, y: 66, r: 28, label: 'Rideau de fenêtre' },
      { id: 'clock', x: 256, y: 56, r: 22, label: 'Horloge murale' },
      { id: 'rug', x: 168, y: 196, r: 28, label: 'Couleur du tapis' },
    ],
    render: (variant, active) => {
      const diff = (id: string) => variant === 'right' && active.has(id);
      return (
        <svg viewBox="0 0 320 220" className="h-full w-full">
          <rect width="320" height="160" fill="#FEF3C7" />
          <rect y="160" width="320" height="60" fill="#FDE68A" />
          {/* Fenêtre */}
          <rect x="40" y="40" width="48" height="52" rx="4" fill="#BAE6FD" stroke="#FFFFFF" strokeWidth="4" />
          {!diff('window') && <rect x="40" y="40" width="14" height="52" fill="#F472B6" />}
          {/* Poster */}
          <rect x="136" y="42" width="52" height="46" rx="4" fill={diff('poster') ? '#34D399' : '#818CF8'} stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="162" cy="65" r="10" fill="#FACC15" />
          {/* Horloge */}
          {!diff('clock') && (
            <g>
              <circle cx="256" cy="56" r="16" fill="#FFFFFF" stroke="#F97316" strokeWidth="3" />
              <line x1="256" y1="56" x2="256" y2="46" stroke="#1E293B" strokeWidth="2.5" />
              <line x1="256" y1="56" x2="265" y2="56" stroke="#1E293B" strokeWidth="2.5" />
            </g>
          )}
          {/* Lit */}
          <rect x="34" y="138" width="112" height="38" rx="8" fill="#60A5FA" />
          <rect x="42" y="124" width="36" height="18" rx="6" fill={diff('pillow') ? '#FACC15' : '#F472B6'} />
          {/* Table & Lampe */}
          <rect x="234" y="142" width="44" height="36" rx="4" fill="#D97706" />
          <polygon points="242,126 270,126 264,104 248,104" fill={diff('lamp') ? '#38BDF8' : '#FACC15'} />
          <rect x="253" y="126" width="6" height="16" fill="#78350F" />
          {/* Tapis & Ballon */}
          <ellipse cx="168" cy="194" rx="58" ry="14" fill={diff('rug') ? '#C084FC' : '#34D399'} />
          {!diff('ball') && <circle cx="168" cy="184" r="11" fill="#EF4444" />}
        </svg>
      );
    },
  },
  {
    id: 'foret',
    title: 'La Forêt des Animaux',
    icon: '🦊',
    spots: [
      { id: 'mushroom', x: 70, y: 176, r: 24, label: 'Champignon rouge' },
      { id: 'pine', x: 256, y: 92, r: 30, label: 'Couleur du sapin' },
      { id: 'butterfly', x: 162, y: 56, r: 24, label: 'Papillon rose' },
      { id: 'pond', x: 224, y: 184, r: 30, label: 'Mare bleue' },
      { id: 'sun', x: 64, y: 42, r: 24, label: 'Soleil' },
      { id: 'fox', x: 146, y: 148, r: 26, label: 'Queue du renard' },
      { id: 'berry', x: 264, y: 150, r: 22, label: 'Baies rouges' },
    ],
    render: (variant, active) => {
      const diff = (id: string) => variant === 'right' && active.has(id);
      return (
        <svg viewBox="0 0 320 220" className="h-full w-full">
          <rect width="320" height="220" fill="#ECFCCB" />
          <rect y="148" width="320" height="72" fill="#86EFAC" />
          {/* Soleil */}
          {!diff('sun') && <circle cx="64" cy="42" r="20" fill="#FACC15" />}
          {/* Papillon */}
          {!diff('butterfly') && (
            <g>
              <circle cx="155" cy="54" r="8" fill="#F472B6" />
              <circle cx="169" cy="54" r="8" fill="#F472B6" />
              <rect x="160" y="48" width="4" height="14" rx="2" fill="#1E293B" />
            </g>
          )}
          {/* Sapin */}
          <rect x="248" y="130" width="16" height="28" fill="#78350F" />
          <polygon points="256,42 222,134 290,134" fill={diff('pine') ? '#0D9488' : '#16A34A'} />
          {/* Renard stylisé */}
          <circle cx="146" cy="144" r="18" fill="#F97316" />
          <polygon points="130,134 136,116 144,128" fill="#F97316" />
          <polygon points="162,134 156,116 148,128" fill="#F97316" />
          <circle cx="140" cy="142" r="2.5" fill="#1E293B" />
          <circle cx="152" cy="142" r="2.5" fill="#1E293B" />
          {!diff('fox') && <ellipse cx="174" cy="154" rx="14" ry="7" fill="#FB923C" />}
          {/* Champignon */}
          <rect x="64" y="176" width="12" height="16" rx="3" fill="#FEF3C7" />
          <path d="M52 178 A18 16 0 0 1 88 178 Z" fill={diff('mushroom') ? '#A855F7' : '#EF4444'} />
          {/* Mare */}
          <ellipse cx="224" cy="186" rx="36" ry="14" fill={diff('pond') ? '#2DD4BF' : '#38BDF8'} />
          {/* Baies */}
          {!diff('berry') && (
            <g fill="#E11D48">
              <circle cx="260" cy="150" r="4" />
              <circle cx="268" cy="154" r="4" />
            </g>
          )}
        </svg>
      );
    },
  },
];
