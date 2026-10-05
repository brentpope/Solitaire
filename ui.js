/**
 * ui.js - Solitaire UI rendering, Touch/Pointer Drag & Drop, Tap-to-move,
 * Timers, Animations, Modals, and Settings.
 */

class SolitaireUI {
  constructor() {
    this.engine = new SolitaireEngine();
    this.winAnim = new WinAnimation('win-canvas');

    // DOM Elements
    this.stockEl = document.getElementById('stock-pile');
    this.wasteEl = document.getElementById('waste-pile');
    this.foundationEls = [
      document.getElementById('foundation-0'),
      document.getElementById('foundation-1'),
      document.getElementById('foundation-2'),
      document.getElementById('foundation-3')
    ];
    this.tableauEls = [
      document.getElementById('tableau-0'),
      document.getElementById('tableau-1'),
      document.getElementById('tableau-2'),
      document.getElementById('tableau-3'),
      document.getElementById('tableau-4'),
      document.getElementById('tableau-5'),
      document.getElementById('tableau-6')
    ];

    this.scoreValEl = document.getElementById('score-val');
    this.movesValEl = document.getElementById('moves-val');
    this.timeValEl = document.getElementById('time-val');
    this.undoBtn = document.getElementById('btn-undo');
    this.hintBtn = document.getElementById('btn-hint');
    this.autoCompleteBtn = document.getElementById('btn-auto-complete');
    this.newGameBtn = document.getElementById('btn-new-game');
    this.settingsBtn = document.getElementById('btn-settings');
    this.shareMobileBtn = document.getElementById('btn-share-mobile');
    this.soundToggleBtn = document.getElementById('btn-sound-toggle');

    // Drag & Drop State
    this.dragState = null;
    this.dragGhost = null;

    // Timer state
    this.timerInterval = null;
    this.elapsedSeconds = 0;

    // Theme preferences
    this.theme = localStorage.getItem('solitaire_theme') || 'green';
    this.cardBack = localStorage.getItem('solitaire_card_back') || 'red';

    // Auto complete running flag
    this.isAutoSolving = false;

    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.applyCardBack(this.cardBack);
    this.updateSoundButton();
    this.setupEventListeners();
    this.startNewGame();
    this.setupNetworkInfo();
  }

  setupEventListeners() {
    // Top Bar Buttons
    if (this.newGameBtn) this.newGameBtn.addEventListener('click', () => this.startNewGame());
    if (this.undoBtn) this.undoBtn.addEventListener('click', () => this.handleUndo());
    if (this.hintBtn) this.hintBtn.addEventListener('click', () => this.handleHint());
    if (this.autoCompleteBtn) this.autoCompleteBtn.addEventListener('click', () => this.handleAutoComplete());
    if (this.settingsBtn) this.settingsBtn.addEventListener('click', () => this.openModal('settings-modal'));
    if (this.shareMobileBtn) this.shareMobileBtn.addEventListener('click', () => this.openMobileShareModal());
    if (this.soundToggleBtn) this.soundToggleBtn.addEventListener('click', () => this.toggleSound());

    // Stock pile click
    this.stockEl.addEventListener('click', (e) => this.handleStockClick(e));

    // Pointer events on play area for smooth Drag and Drop (Mouse & Touch)
    document.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    document.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    document.addEventListener('pointercancel', (e) => this.handlePointerCancel(e));

    // Modals close buttons
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          const modal = el.closest('.modal');
          if (modal) modal.classList.remove('active');
        }
      });
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.handleUndo();
      } else if (e.key.toLowerCase() === 'h') {
        this.handleHint();
      } else if (e.key.toLowerCase() === 'n') {
        this.startNewGame();
      } else if (e.key.toLowerCase() === 'd') {
        this.handleStockClick();
      }
    });

    // Settings form inputs
    const drawModeSelect = document.getElementById('setting-draw-mode');
    if (drawModeSelect) {
      drawModeSelect.value = this.engine.drawMode;
      drawModeSelect.addEventListener('change', (e) => {
        this.engine.setDrawMode(parseInt(e.target.value, 10));
        this.startNewGame();
      });
    }

    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) {
      themeSelect.value = this.theme;
      themeSelect.addEventListener('change', (e) => {
        this.applyTheme(e.target.value);
      });
    }

    const cardBackSelect = document.getElementById('setting-card-back');
    if (cardBackSelect) {
      cardBackSelect.value = this.cardBack;
      cardBackSelect.addEventListener('change', (e) => {
        this.applyCardBack(e.target.value);
      });
    }

    const winModalPlayAgain = document.getElementById('btn-win-play-again');
    if (winModalPlayAgain) {
      winModalPlayAgain.addEventListener('click', () => {
        this.closeModal('win-modal');
        this.winAnim.stop();
        this.startNewGame();
      });
    }

    // Dismiss win animation on click
    const winCanvas = document.getElementById('win-canvas');
    if (winCanvas) {
      winCanvas.addEventListener('click', () => {
        this.winAnim.stop();
        this.openModal('win-modal');
      });
    }
  }

  startNewGame() {
    this.stopTimer();
    this.winAnim.stop();
    this.closeModal('win-modal');
    this.isAutoSolving = false;
    this.elapsedSeconds = 0;
    this.updateTimerDisplay();

    this.engine.newGame();
    sound.playDeal();
    this.render();
  }

  startTimer() {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.elapsedSeconds / 60);
    const secs = this.elapsedSeconds % 60;
    this.timeValEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem('solitaire_theme', theme);
    document.body.className = `theme-${theme}`;
  }

  applyCardBack(cardBack) {
    this.cardBack = cardBack;
    localStorage.setItem('solitaire_card_back', cardBack);
    document.documentElement.setAttribute('data-card-back', cardBack);
  }

  toggleSound() {
    const isMuted = sound.toggleMute();
    this.updateSoundButton();
  }

  updateSoundButton() {
    if (!this.soundToggleBtn) return;
    if (sound.muted) {
      this.soundToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      `;
      this.soundToggleBtn.title = 'Sound Muted (Click to Unmute)';
    } else {
      this.soundToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      `;
      this.soundToggleBtn.title = 'Sound On (Click to Mute)';
    }
  }

  /**
   * Main Render function: updates the entire board DOM accurately
   */
  render() {
    this.scoreValEl.textContent = this.engine.score;
    this.movesValEl.textContent = this.engine.moves;

    // Check Auto-Complete button visibility
    if (this.engine.isWinnableAuto() && !this.isAutoSolving && !this.engine.gameWon) {
      this.autoCompleteBtn.style.display = 'inline-flex';
    } else {
      this.autoCompleteBtn.style.display = 'none';
    }

    // Render Stock Pile
    this.renderStock();

    // Render Waste Pile
    this.renderWaste();

    // Render Foundations
    this.renderFoundations();

    // Render Tableau Columns
    this.renderTableau();

    // Check Win
    if (this.engine.gameWon && !this.winAnim.animating) {
      this.handleGameWon();
    }
  }

  renderStock() {
    this.stockEl.innerHTML = '';
    if (this.engine.stock.length > 0) {
      this.stockEl.classList.remove('empty');
      // Show card back representing the top of stock
      const stockCard = this.engine.stock[this.engine.stock.length - 1];
      const cardEl = stockCard.renderElement();
      cardEl.classList.add('in-stock');
      this.stockEl.appendChild(cardEl);

      // Stock counter indicator
      const badge = document.createElement('div');
      badge.className = 'pile-badge';
      badge.textContent = this.engine.stock.length;
      this.stockEl.appendChild(badge);
    } else {
      this.stockEl.classList.add('empty');
      this.stockEl.innerHTML = `
        <div class="recycle-indicator" title="Recycle waste pile">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
          </svg>
        </div>
      `;
    }
  }

  renderWaste() {
    this.wasteEl.innerHTML = '';
    const wasteLen = this.engine.waste.length;
    if (wasteLen === 0) {
      this.wasteEl.classList.add('empty');
      return;
    }
    this.wasteEl.classList.remove('empty');

    // In Draw 3 mode, show up to the top 3 cards fanned slightly
    const visibleCount = Math.min(3, wasteLen);
    const startIdx = wasteLen - visibleCount;

    for (let i = startIdx; i < wasteLen; i++) {
      const card = this.engine.waste[i];
      const cardEl = card.renderElement();
      const offsetIndex = i - startIdx;

      cardEl.style.transform = `translateX(${offsetIndex * 18}px)`;
      cardEl.style.zIndex = offsetIndex + 1;

      // Only the top card is interactive
      if (i === wasteLen - 1) {
        cardEl.classList.add('top-waste');
        this.attachCardInteractivity(cardEl, { area: 'waste' });
      }

      this.wasteEl.appendChild(cardEl);
    }
  }

  renderFoundations() {
    for (let fIdx = 0; fIdx < 4; fIdx++) {
      const fEl = this.foundationEls[fIdx];
      fEl.innerHTML = '';
      const pile = this.engine.foundations[fIdx];

      if (pile.length === 0) {
        fEl.classList.add('empty');
        // Watermark for the suit
        const suit = SUIT_LIST[fIdx];
        fEl.innerHTML = `
          <div class="foundation-watermark ${suit.color}">
            ${SUIT_SVGS[suit.id]}
          </div>
        `;
      } else {
        fEl.classList.remove('empty');
        // Render top card
        const topCard = pile[pile.length - 1];
        const cardEl = topCard.renderElement();
        this.attachCardInteractivity(cardEl, { area: 'foundation', index: fIdx });
        fEl.appendChild(cardEl);
      }
    }
  }

  renderTableau() {
    for (let colIdx = 0; colIdx < 7; colIdx++) {
      const colEl = this.tableauEls[colIdx];
      colEl.innerHTML = '';
      const pile = this.engine.tableau[colIdx];

      if (pile.length === 0) {
        colEl.classList.add('empty');
        colEl.innerHTML = `<div class="tableau-empty-slot">K</div>`;
        continue;
      }

      colEl.classList.remove('empty');

      // Calculate dynamic vertical cascade offset based on pile size to ensure everything fits on mobile
      const totalCards = pile.length;
      const isMobile = window.innerWidth <= 768;
      const cardDownOffset = isMobile ? 12 : 18;
      const cardUpOffset = isMobile ? (totalCards > 10 ? 20 : 26) : 32;

      let currentTop = 0;

      pile.forEach((card, idx) => {
        const cardEl = card.renderElement();
        cardEl.style.top = `${currentTop}px`;
        cardEl.style.zIndex = idx + 1;

        if (card.faceUp) {
          this.attachCardInteractivity(cardEl, { area: 'tableau', col: colIdx, cardIndex: idx });
          currentTop += cardUpOffset;
        } else {
          currentTop += cardDownOffset;
          // If face-down card is somehow top card, click to flip
          if (idx === pile.length - 1) {
            cardEl.addEventListener('click', () => {
              card.faceUp = true;
              sound.playCardFlip();
              this.render();
            });
          }
        }

        colEl.appendChild(cardEl);
      });

      // Adjust column height so scrolling or overflow is natural
      colEl.style.minHeight = `${currentTop + 120}px`;
    }
  }

  /**
   * Attaches pointer, touch, tap-to-move, and double-click handlers to a card
   */
  attachCardInteractivity(cardEl, source) {
    let pointerDownTime = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    cardEl.addEventListener('pointerdown', (e) => {
      // Only primary mouse button or single touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      pointerDownTime = Date.now();
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;

      this.potentialDrag = {
        source,
        element: cardEl,
        startX,
        startY,
        pointerId: e.pointerId
      };

      // Ensure touch doesn't trigger scroll
      cardEl.setPointerCapture(e.pointerId);
    });

    cardEl.addEventListener('pointermove', (e) => {
      if (!this.potentialDrag || this.potentialDrag.pointerId !== e.pointerId) return;

      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (dist > 8 && !this.dragState) {
        // Drag threshold passed! Initiate full Drag & Drop
        this.initiateDrag(this.potentialDrag, e);
      }
    });

    cardEl.addEventListener('pointerup', (e) => {
      if (!this.potentialDrag || this.potentialDrag.pointerId !== e.pointerId) return;

      const clickDuration = Date.now() - pointerDownTime;
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);

      try {
        cardEl.releasePointerCapture(e.pointerId);
      } catch (err) {}

      this.potentialDrag = null;

      if (this.dragState) {
        // Was dragging: finish drop
        this.finishDrag(e);
      } else if (dist < 10 && clickDuration < 350) {
        // Tap / Click to Move!
        this.handleCardClick(source);
      }
    });

    // Double-click / double-tap shortcut to instantly send to foundation
    cardEl.addEventListener('dblclick', (e) => {
      e.preventDefault();
      this.handleCardDoubleClick(source);
    });
  }

  /**
   * Tap-to-move / Smart Click handler:
   * Finds the best logical destination and animates move!
   */
  handleCardClick(source) {
    if (!this.engine.gameStarted) this.startTimer();

    const smartMove = this.engine.findSmartMove(source);
    if (smartMove) {
      const res = this.engine.executeMove(source, smartMove.target);
      if (res && res.success) {
        if (smartMove.target.area === 'foundation') {
          sound.playFoundation(res.movingCards[0].rank);
        } else {
          sound.playCardPlace();
        }
        if (res.cardFlipped) sound.playCardFlip();
        this.render();
      }
    } else {
      sound.playError();
      this.shakeCard(source);
    }
  }

  handleCardDoubleClick(source) {
    if (!this.engine.gameStarted) this.startTimer();

    // Specifically try Foundation first
    let card = null;
    if (source.area === 'waste') card = this.engine.waste[this.engine.waste.length - 1];
    else if (source.area === 'tableau') {
      const col = this.engine.tableau[source.col];
      card = col[source.cardIndex];
    }

    if (card) {
      const fIdx = this.engine.findValidFoundation(card);
      if (fIdx !== -1) {
        const res = this.engine.executeMove(source, { area: 'foundation', index: fIdx });
        if (res && res.success) {
          sound.playFoundation(card.rank);
          if (res.cardFlipped) sound.playCardFlip();
          this.render();
          return;
        }
      }
    }
  }

  shakeCard(source) {
    let el = null;
    if (source.area === 'tableau') {
      const colEl = this.tableauEls[source.col];
      el = colEl ? colEl.children[source.cardIndex] : null;
    } else if (source.area === 'waste') {
      el = this.wasteEl.querySelector('.top-waste');
    }
    if (el) {
      el.classList.add('invalid-shake');
      setTimeout(() => el.classList.remove('invalid-shake'), 400);
    }
  }

  /**
   * Initiate visual Drag and Drop
   */
  initiateDrag(dragInfo, e) {
    const { source, element } = dragInfo;

    // Collect cards being dragged
    let cardsToDrag = [];
    if (source.area === 'waste') {
      cardsToDrag = [this.engine.waste[this.engine.waste.length - 1]];
    } else if (source.area === 'foundation') {
      cardsToDrag = [this.engine.foundations[source.index][this.engine.foundations[source.index].length - 1]];
    } else if (source.area === 'tableau') {
      cardsToDrag = this.engine.tableau[source.col].slice(source.cardIndex);
    }

    if (cardsToDrag.length === 0) return;

    // Create floating drag container
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    const isMobile = window.innerWidth <= 768;
    const cardUpOffset = isMobile ? 22 : 30;

    cardsToDrag.forEach((card, i) => {
      const cEl = card.renderElement();
      cEl.style.top = `${i * cardUpOffset}px`;
      cEl.style.position = 'absolute';
      ghost.appendChild(cEl);
    });

    document.body.appendChild(ghost);

    const rect = element.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    ghost.style.left = `${e.clientX - offsetX}px`;
    ghost.style.top = `${e.clientY - offsetY}px`;

    // Hide original element during drag
    element.style.opacity = '0.3';

    this.dragState = {
      source,
      element,
      ghost,
      offsetX,
      offsetY,
      cards: cardsToDrag
    };
  }

  handlePointerMove(e) {
    if (!this.dragState) return;

    this.dragState.ghost.style.left = `${e.clientX - this.dragState.offsetX}px`;
    this.dragState.ghost.style.top = `${e.clientY - this.dragState.offsetY}px`;

    // Highlight drop targets
    this.highlightDropTargets(e.clientX, e.clientY);
  }

  handlePointerUp(e) {
    if (this.dragState) {
      this.finishDrag(e);
    }
  }

  handlePointerCancel(e) {
    if (this.dragState) {
      this.cancelDrag();
    }
  }

  highlightDropTargets(x, y) {
    // Clear previous highlights
    document.querySelectorAll('.drop-highlight').forEach(el => el.classList.remove('drop-highlight'));

    const target = this.detectDropTarget(x, y);
    if (target) {
      if (target.area === 'foundation') {
        this.foundationEls[target.index].classList.add('drop-highlight');
      } else if (target.area === 'tableau') {
        this.tableauEls[target.index].classList.add('drop-highlight');
      }
    }
  }

  detectDropTarget(x, y) {
    if (!this.dragState) return null;
    const movingLeadCard = this.dragState.cards[0];
    const isSingle = this.dragState.cards.length === 1;

    // 1. Check Foundations
    if (isSingle) {
      for (let i = 0; i < 4; i++) {
        const rect = this.foundationEls[i].getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom + 20) {
          if (this.engine.canPlaceOnFoundation(movingLeadCard, i)) {
            return { area: 'foundation', index: i };
          }
        }
      }
    }

    // 2. Check Tableau Columns
    for (let c = 0; c < 7; c++) {
      const colEl = this.tableauEls[c];
      const rect = colEl.getBoundingClientRect();
      // Generous hit box for column
      if (x >= rect.left - 10 && x <= rect.right + 10 && y >= rect.top && y <= rect.bottom + 100) {
        if (this.engine.canPlaceOnTableau(movingLeadCard, c)) {
          return { area: 'tableau', index: c };
        }
      }
    }

    return null;
  }

  finishDrag(e) {
    if (!this.dragState) return;

    const target = this.detectDropTarget(e.clientX, e.clientY);
    const { source, ghost, element } = this.dragState;

    if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
    element.style.opacity = '1';

    document.querySelectorAll('.drop-highlight').forEach(el => el.classList.remove('drop-highlight'));

    if (target) {
      if (!this.engine.gameStarted) this.startTimer();
      const res = this.engine.executeMove(source, target);
      if (res && res.success) {
        if (target.area === 'foundation') {
          sound.playFoundation(res.movingCards[0].rank);
        } else {
          sound.playCardPlace();
        }
        if (res.cardFlipped) sound.playCardFlip();
      } else {
        sound.playError();
      }
    }

    this.dragState = null;
    this.render();
  }

  cancelDrag() {
    if (!this.dragState) return;
    const { ghost, element } = this.dragState;
    if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
    element.style.opacity = '1';
    document.querySelectorAll('.drop-highlight').forEach(el => el.classList.remove('drop-highlight'));
    this.dragState = null;
    this.render();
  }

  handleStockClick(e) {
    if (!this.engine.gameStarted) this.startTimer();

    const result = this.engine.drawCards();
    if (result) {
      if (result.type === 'recycle') {
        sound.playCardFlip();
      } else {
        sound.playDeal();
      }
      this.render();
    }
  }

  handleUndo() {
    const res = this.engine.undo();
    if (res) {
      sound.playCardPlace();
      this.render();
    }
  }

  handleHint() {
    const hint = this.engine.findHint();
    if (!hint) {
      alert("No obvious legal moves available. Try drawing cards from the stock pile!");
      return;
    }

    // Highlight source and target
    if (hint.type === 'draw') {
      this.stockEl.classList.add('hint-pulse');
      setTimeout(() => this.stockEl.classList.remove('hint-pulse'), 1800);
      return;
    }

    let sourceEl = null;
    if (hint.source.area === 'waste') {
      sourceEl = this.wasteEl.querySelector('.top-waste');
    } else if (hint.source.area === 'tableau') {
      sourceEl = this.tableauEls[hint.source.col].children[hint.source.cardIndex];
    }

    let targetEl = null;
    if (hint.target.area === 'foundation') {
      targetEl = this.foundationEls[hint.target.index];
    } else if (hint.target.area === 'tableau') {
      targetEl = this.tableauEls[hint.target.index];
    }

    if (sourceEl) sourceEl.classList.add('hint-pulse');
    if (targetEl) targetEl.classList.add('hint-target-pulse');

    setTimeout(() => {
      if (sourceEl) sourceEl.classList.remove('hint-pulse');
      if (targetEl) targetEl.classList.remove('hint-target-pulse');
    }, 1800);
  }

  /**
   * Smooth automated completion when all remaining cards are exposed
   */
  async handleAutoComplete() {
    if (this.isAutoSolving) return;
    this.isAutoSolving = true;
    this.autoCompleteBtn.style.display = 'none';

    while (this.engine.isWinnableAuto() && !this.engine.isWon()) {
      // Find a card that can move to foundation
      let moved = false;
      for (let c = 0; c < 7; c++) {
        const col = this.engine.tableau[c];
        if (col.length > 0) {
          const topCard = col[col.length - 1];
          const fIdx = this.engine.findValidFoundation(topCard);
          if (fIdx !== -1) {
            this.engine.executeMove({ area: 'tableau', col: c, cardIndex: col.length - 1 }, { area: 'foundation', index: fIdx });
            sound.playFoundation(topCard.rank);
            this.render();
            await new Promise(r => setTimeout(r, 120));
            moved = true;
            break;
          }
        }
      }

      if (!moved) break;
    }

    this.isAutoSolving = false;
    this.render();
  }

  handleGameWon() {
    this.stopTimer();
    sound.playWin();

    // Save statistics
    this.saveWinStats();

    // Start victory animation
    this.winAnim.start(this.engine.foundations, this.foundationEls);

    // After a brief delay, show the win modal
    setTimeout(() => {
      this.updateWinModal();
      this.openModal('win-modal');
    }, 2800);
  }

  saveWinStats() {
    const wins = parseInt(localStorage.getItem('solitaire_total_wins') || '0', 10) + 1;
    localStorage.setItem('solitaire_total_wins', wins);

    const bestScore = Math.max(this.engine.score, parseInt(localStorage.getItem('solitaire_best_score') || '0', 10));
    localStorage.setItem('solitaire_best_score', bestScore);

    const bestTime = Math.min(this.elapsedSeconds, parseInt(localStorage.getItem('solitaire_best_time') || '999999', 10));
    localStorage.setItem('solitaire_best_time', bestTime);
  }

  updateWinModal() {
    document.getElementById('win-time').textContent = this.timeValEl.textContent;
    document.getElementById('win-moves').textContent = this.engine.moves;
    document.getElementById('win-score').textContent = this.engine.score;
    document.getElementById('win-best-score').textContent = localStorage.getItem('solitaire_best_score') || this.engine.score;
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  /**
   * Dynamically fetch local IP info or fallback to current origin
   */
  async setupNetworkInfo() {
    try {
      const resp = await fetch('/api/network-info');
      if (resp.ok) {
        const info = await resp.json();
        this.networkInfo = info;
      }
    } catch (e) {
      // Running via file:// or plain static server
    }
  }

  openMobileShareModal() {
    const qrContainer = document.getElementById('mobile-qr-code');
    const urlContainer = document.getElementById('mobile-url-link');
    if (!qrContainer) return;

    qrContainer.innerHTML = '';

    // Determine the best URL to connect from iPhone
    let targetUrl = window.location.origin;
    if (this.networkInfo && this.networkInfo.ip) {
      targetUrl = `http://${this.networkInfo.ip}:${this.networkInfo.port || 8080}`;
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Suggest LAN IP if known from backend or prompt
      targetUrl = `http://${window.location.hostname}:8080`;
    }

    if (urlContainer) {
      urlContainer.textContent = targetUrl;
      urlContainer.href = targetUrl;
    }

    // Render QR Code using David Shim's QRCode.js
    if (window.QRCode) {
      new QRCode(qrContainer, {
        text: targetUrl,
        width: 190,
        height: 190,
        colorDark: '#121212',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    this.openModal('mobile-share-modal');
  }
}

// Instantiate UI when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.solitaireApp = new SolitaireUI();
});
