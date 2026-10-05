/**
 * cards.js - Playing card data structures, SVG assets, and card rendering engine
 */

const SUITS = {
  SPADES: { id: 'spades', name: 'Spades', symbol: '♠', color: 'black', foundationIndex: 0 },
  HEARTS: { id: 'hearts', name: 'Hearts', symbol: '♥', color: 'red', foundationIndex: 1 },
  CLUBS: { id: 'clubs', name: 'Clubs', symbol: '♣', color: 'black', foundationIndex: 2 },
  DIAMONDS: { id: 'diamonds', name: 'Diamonds', symbol: '♦', color: 'red', foundationIndex: 3 }
};

const SUIT_LIST = [SUITS.SPADES, SUITS.HEARTS, SUITS.CLUBS, SUITS.DIAMONDS];

const RANKS = {
  1: { value: 1, name: 'Ace', symbol: 'A' },
  2: { value: 2, name: '2', symbol: '2' },
  3: { value: 3, name: '3', symbol: '3' },
  4: { value: 4, name: '4', symbol: '4' },
  5: { value: 5, name: '5', symbol: '5' },
  6: { value: 6, name: '6', symbol: '6' },
  7: { value: 7, name: '7', symbol: '7' },
  8: { value: 8, name: '8', symbol: '8' },
  9: { value: 9, name: '9', symbol: '9' },
  10: { value: 10, name: '10', symbol: '10' },
  11: { value: 11, name: 'Jack', symbol: 'J' },
  12: { value: 12, name: 'Queen', symbol: 'Q' },
  13: { value: 13, name: 'King', symbol: 'K' }
};

// SVG Suit Paths
const SUIT_SVGS = {
  hearts: `<svg viewBox="0 0 24 24" class="suit-icon hearts"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  diamonds: `<svg viewBox="0 0 24 24" class="suit-icon diamonds"><path fill="currentColor" d="M12 2.2L3.5 12l8.5 9.8 8.5-9.8L12 2.2z"/></svg>`,
  clubs: `<svg viewBox="0 0 24 24" class="suit-icon clubs"><path fill="currentColor" d="M12 2.5a4 4 0 0 0-4 4c0 1.5.8 2.8 2.1 3.5A4.5 4.5 0 0 0 6 14.5a4.5 4.5 0 0 0 4.5 4.5c.4 0 .9 0 1.3-.2L10 22h4l-1.8-3.2c.4.1.9.2 1.3.2a4.5 4.5 0 0 0 4.5-4.5 4.5 4.5 0 0 0-4.1-4.5c1.3-.7 2.1-2 2.1-3.5a4 4 0 0 0-4-4h-2z"/></svg>`,
  spades: `<svg viewBox="0 0 24 24" class="suit-icon spades"><path fill="currentColor" d="M12 2.2C9.5 6.5 5 8.5 5 13.5c0 3 2.5 5 5 5 1.4 0 2.4-.6 3-1.4.6.8 1.6 1.4 3 1.4 2.5 0 5-2 5-5 0-5-4.5-7-7-11.3zm-1 16.3L9.5 22h5l-1.5-3.5c-.3 0-.7 0-1 0s-.7 0-1 0z"/></svg>`
};

// Royal Court Artwork SVGs for Jack, Queen, King
const COURT_SVGS = {
  J: (suit) => `
    <div class="court-artwork court-jack">
      <svg viewBox="0 0 60 80" class="court-svg">
        <rect x="5" y="5" width="50" height="70" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2,2" opacity="0.4"/>
        <!-- Crown / Helmet -->
        <path d="M22 22 L30 14 L38 22 L35 28 L25 28 Z" fill="currentColor" opacity="0.85"/>
        <circle cx="30" cy="13" r="2.5" fill="#fbc02d"/>
        <!-- Face -->
        <circle cx="30" cy="33" r="8" fill="#ffe0b2"/>
        <path d="M28 32 a1 1 0 0 1 1 -1 M32 32 a1 1 0 0 1 1 -1" stroke="#333" stroke-width="1.5"/>
        <path d="M27 36 Q30 39 33 36" fill="none" stroke="#e65100" stroke-width="1.2"/>
        <!-- Collar & Armor -->
        <path d="M18 43 L30 38 L42 43 L40 65 L20 65 Z" fill="currentColor" opacity="0.75"/>
        <!-- Halberd/Sword -->
        <line x1="16" y1="18" x2="16" y2="65" stroke="currentColor" stroke-width="2.5"/>
        <polygon points="16,12 12,20 20,20" fill="#fbc02d"/>
        <text x="30" y="58" font-size="14" font-weight="900" text-anchor="middle" fill="#fff" opacity="0.95">J</text>
      </svg>
    </div>
  `,
  Q: (suit) => `
    <div class="court-artwork court-queen">
      <svg viewBox="0 0 60 80" class="court-svg">
        <rect x="5" y="5" width="50" height="70" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2,2" opacity="0.4"/>
        <!-- Tiara / Crown -->
        <path d="M20 22 L23 13 L30 18 L37 13 L40 22 Z" fill="#fbc02d" stroke="currentColor" stroke-width="1"/>
        <circle cx="23" cy="12" r="2" fill="#e91e63"/>
        <circle cx="30" cy="16" r="2" fill="#2196f3"/>
        <circle cx="37" cy="12" r="2" fill="#e91e63"/>
        <!-- Face & Hair -->
        <path d="M20 26 Q17 38 23 42 Q30 44 37 42 Q43 38 40 26 Z" fill="#ffd54f" opacity="0.7"/>
        <circle cx="30" cy="33" r="7.5" fill="#ffecb3"/>
        <path d="M28 32 a1 1 0 0 1 1 -1 M32 32 a1 1 0 0 1 1 -1" stroke="#333" stroke-width="1.5"/>
        <path d="M28 37 Q30 39 32 37" fill="none" stroke="#c2185b" stroke-width="1.5"/>
        <!-- Royal Robe -->
        <path d="M17 44 L30 40 L43 44 L41 66 L19 66 Z" fill="currentColor" opacity="0.8"/>
        <!-- Royal Rose / Scepter -->
        <circle cx="43" cy="28" r="4" fill="#e91e63"/>
        <line x1="43" y1="32" x2="43" y2="58" stroke="#fbc02d" stroke-width="2"/>
        <text x="30" y="59" font-size="14" font-weight="900" text-anchor="middle" fill="#fff" opacity="0.95">Q</text>
      </svg>
    </div>
  `,
  K: (suit) => `
    <div class="court-artwork court-king">
      <svg viewBox="0 0 60 80" class="court-svg">
        <rect x="5" y="5" width="50" height="70" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2,2" opacity="0.4"/>
        <!-- Imperial Crown -->
        <path d="M18 22 L20 12 L30 16 L40 12 L42 22 Z" fill="#fbc02d" stroke="currentColor" stroke-width="1.2"/>
        <circle cx="30" cy="11" r="2.5" fill="#f44336"/>
        <line x1="30" y1="6" x2="30" y2="10" stroke="#fbc02d" stroke-width="2"/>
        <line x1="28" y1="8" x2="32" y2="8" stroke="#fbc02d" stroke-width="2"/>
        <!-- Face & Beard -->
        <circle cx="30" cy="32" r="8" fill="#ffe0b2"/>
        <path d="M22 34 Q30 44 38 34 L38 41 Q30 48 22 41 Z" fill="#eeeeee" stroke="#757575" stroke-width="0.8"/>
        <path d="M27 31 a1 1 0 0 1 1 -1 M33 31 a1 1 0 0 1 1 -1" stroke="#333" stroke-width="1.5"/>
        <!-- Robe & Mantle -->
        <path d="M16 43 L30 38 L44 43 L42 66 L18 66 Z" fill="currentColor" opacity="0.85"/>
        <path d="M25 40 L30 48 L35 40 Z" fill="#fff" opacity="0.9"/>
        <!-- Royal Scepter -->
        <line x1="16" y1="26" x2="16" y2="60" stroke="#fbc02d" stroke-width="2.5"/>
        <circle cx="16" cy="24" r="3.5" fill="#fbc02d"/>
        <text x="30" y="60" font-size="14" font-weight="900" text-anchor="middle" fill="#fff" opacity="0.95">K</text>
      </svg>
    </div>
  `
};

class Card {
  constructor(suit, rank) {
    this.suit = suit; // Spades, Hearts, Clubs, Diamonds object
    this.rank = rank; // 1 - 13
    this.faceUp = false;
    this.id = `${suit.id}_${rank}`;
  }

  get color() {
    return this.suit.color;
  }

  get rankSymbol() {
    return RANKS[this.rank].symbol;
  }

  get rankName() {
    return RANKS[this.rank].name;
  }

  get suitSymbol() {
    return this.suit.symbol;
  }

  renderElement() {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${this.faceUp ? 'face-up' : 'face-down'} ${this.color}`;
    cardEl.dataset.cardId = this.id;
    cardEl.dataset.suit = this.suit.id;
    cardEl.dataset.rank = this.rank;
    cardEl.setAttribute('role', 'button');
    cardEl.setAttribute('tabindex', this.faceUp ? '0' : '-1');
    cardEl.setAttribute('aria-label', this.faceUp ? `${this.rankName} of ${this.suit.name}` : 'Hidden Card');

    // Inner card structure
    const innerEl = document.createElement('div');
    innerEl.className = 'card-inner';

    // Front face
    const frontEl = document.createElement('div');
    frontEl.className = `card-face card-front ${this.color}`;
    frontEl.innerHTML = this.renderFrontHTML();

    // Back face
    const backEl = document.createElement('div');
    backEl.className = 'card-face card-back';
    backEl.innerHTML = `
      <div class="card-back-pattern">
        <div class="card-back-border">
          <div class="card-back-center-glyph"></div>
        </div>
      </div>
    `;

    innerEl.appendChild(frontEl);
    innerEl.appendChild(backEl);
    cardEl.appendChild(innerEl);

    return cardEl;
  }

  renderFrontHTML() {
    const suitSvg = SUIT_SVGS[this.suit.id];
    const rankStr = this.rankSymbol;

    // Corner indicator HTML
    const cornerTop = `
      <div class="card-corner corner-top">
        <span class="corner-rank">${rankStr}</span>
        <span class="corner-suit">${suitSvg}</span>
      </div>
    `;
    const cornerBottom = `
      <div class="card-corner corner-bottom">
        <span class="corner-rank">${rankStr}</span>
        <span class="corner-suit">${suitSvg}</span>
      </div>
    `;

    // Center content HTML
    let centerHTML = '';
    if (this.rank >= 11 && this.rank <= 13) {
      // Court cards: J, Q, K
      centerHTML = COURT_SVGS[rankStr](this.suit);
    } else if (this.rank === 1) {
      // Ace: Big prominent centered suit
      centerHTML = `
        <div class="card-pips pip-layout-ace">
          <div class="pip ace-pip">${suitSvg}</div>
        </div>
      `;
    } else {
      // Number cards 2 - 10: Standard pip grids
      centerHTML = this.renderPipLayout();
    }

    return `
      ${cornerTop}
      <div class="card-center">
        ${centerHTML}
      </div>
      ${cornerBottom}
    `;
  }

  renderPipLayout() {
    const suitSvg = SUIT_SVGS[this.suit.id];
    let pips = '';
    for (let i = 0; i < this.rank; i++) {
      pips += `<div class="pip pip-${i + 1}">${suitSvg}</div>`;
    }
    return `<div class="card-pips pip-layout-${this.rank}">${pips}</div>`;
  }
}

/**
 * Creates a standard 52-card deck
 */
function createDeck() {
  const deck = [];
  for (const suit of SUIT_LIST) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push(new Card(suit, rank));
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
