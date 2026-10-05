/**
 * win-animation.js - Classic cascading bouncing cards victory celebration
 * Faithful to the iconic Windows Solitaire card bounce effect on HTML5 Canvas!
 */

class WinAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.animating = false;
    this.rafId = null;
    this.bouncingCards = [];
    this.deckQueue = [];
    this.cardWidth = 80;
    this.cardHeight = 112;
    this.cardBitmaps = new Map();

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Pre-renders card images into offscreen canvases for lightning-fast 60fps canvas blitting
   */
  async prepareCardBitmaps(foundations) {
    this.cardBitmaps.clear();

    // Determine card size relative to screen
    const isMobile = window.innerWidth < 768;
    this.cardWidth = isMobile ? Math.floor(window.innerWidth * 0.13) : Math.floor(Math.min(100, window.innerWidth * 0.08));
    this.cardHeight = Math.floor(this.cardWidth * 1.4);

    const cards = [];
    for (const f of foundations) {
      for (const card of f) {
        cards.push(card);
      }
    }

    // Generate offscreen canvas for each card
    for (const card of cards) {
      const offscreen = document.createElement('canvas');
      offscreen.width = this.cardWidth;
      offscreen.height = this.cardHeight;
      const oCtx = offscreen.getContext('2d');

      // Draw rounded card rectangle
      const radius = Math.floor(this.cardWidth * 0.08);
      oCtx.fillStyle = '#ffffff';
      oCtx.strokeStyle = '#cccccc';
      oCtx.lineWidth = 1;

      oCtx.beginPath();
      oCtx.roundRect(0, 0, this.cardWidth, this.cardHeight, radius);
      oCtx.fill();
      oCtx.stroke();

      // Draw suit and rank
      const isRed = card.color === 'red';
      const textColor = isRed ? '#d32f2f' : '#212121';
      oCtx.fillStyle = textColor;
      oCtx.font = `bold ${Math.floor(this.cardWidth * 0.22)}px -apple-system, sans-serif`;
      oCtx.fillText(card.rankSymbol, Math.floor(this.cardWidth * 0.1), Math.floor(this.cardHeight * 0.22));

      // Suit icon
      oCtx.font = `${Math.floor(this.cardWidth * 0.22)}px sans-serif`;
      oCtx.fillText(card.suitSymbol, Math.floor(this.cardWidth * 0.1), Math.floor(this.cardHeight * 0.42));

      // Big center suit
      oCtx.font = `${Math.floor(this.cardWidth * 0.48)}px sans-serif`;
      oCtx.textAlign = 'center';
      oCtx.textBaseline = 'middle';
      oCtx.fillText(card.suitSymbol, this.cardWidth / 2, this.cardHeight / 2 + 5);

      this.cardBitmaps.set(card.id, offscreen);
    }
  }

  /**
   * Starts the victory cascade
   */
  start(foundations, foundationElements) {
    if (!this.canvas || !this.ctx) return;
    this.stop();
    this.resize();

    this.canvas.style.display = 'block';
    this.canvas.style.pointerEvents = 'auto';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.bouncingCards = [];
    this.deckQueue = [];

    // Extract all cards in order from Kings down to Aces across foundations
    for (let r = 13; r >= 1; r--) {
      for (let fIdx = 0; fIdx < 4; fIdx++) {
        const foundation = foundations[fIdx];
        const card = foundation.find(c => c.rank === r);
        if (card) {
          // Get start position from DOM foundation pile if available
          let startX = 50 + fIdx * (this.cardWidth + 20);
          let startY = 80;

          if (foundationElements && foundationElements[fIdx]) {
            const rect = foundationElements[fIdx].getBoundingClientRect();
            startX = rect.left;
            startY = rect.top;
          }

          this.deckQueue.push({ card, startX, startY });
        }
      }
    }

    this.prepareCardBitmaps(foundations).then(() => {
      this.animating = true;
      this.spawnNextCard();
      this.loop();
    });
  }

  spawnNextCard() {
    if (!this.animating || this.deckQueue.length === 0) return;

    const next = this.deckQueue.shift();
    const bitmap = this.cardBitmaps.get(next.card.id);

    if (bitmap) {
      // Classic Solitaire physics
      const vx = (Math.random() * 8 + 3) * (Math.random() < 0.5 ? -1 : 1);
      const vy = -(Math.random() * 5 + 3);

      this.bouncingCards.push({
        bitmap,
        x: next.startX,
        y: next.startY,
        vx,
        vy,
        bounces: 0
      });
    }

    // Schedule next card launch
    if (this.deckQueue.length > 0) {
      setTimeout(() => this.spawnNextCard(), 320);
    }
  }

  loop() {
    if (!this.animating) return;

    const gravity = 0.55;
    const floor = this.canvas.height - this.cardHeight;
    const elasticity = -0.84;

    for (let i = this.bouncingCards.length - 1; i >= 0; i--) {
      const b = this.bouncingCards[i];

      // Draw card at current position (without clearing canvas - leaving the classic trail!)
      this.ctx.drawImage(b.bitmap, Math.round(b.x), Math.round(b.y));

      // Physics update
      b.x += b.vx;
      b.y += b.vy;
      b.vy += gravity;

      // Bounce off floor
      if (b.y >= floor) {
        b.y = floor;
        b.vy *= elasticity;
        b.bounces++;
      }

      // Check if card has exited the screen sides
      if (b.x < -this.cardWidth || b.x > this.canvas.width) {
        this.bouncingCards.splice(i, 1);
      }
    }

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  stop() {
    this.animating = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.canvas) {
      this.canvas.style.display = 'none';
      this.canvas.style.pointerEvents = 'none';
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }
}
