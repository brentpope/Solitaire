/**
 * engine.js - Core Klondike Solitaire rules, game state, validation, undo history, and hint system
 */

class SolitaireEngine {
  constructor() {
    this.drawMode = parseInt(localStorage.getItem('solitaire_draw_mode') || '1', 10); // 1 or 3
    this.stock = [];
    this.waste = [];
    // Foundations: 0: Spades, 1: Hearts, 2: Clubs, 3: Diamonds
    this.foundations = [[], [], [], []];
    // Tableau: 7 columns
    this.tableau = [[], [], [], [], [], [], []];

    this.score = 0;
    this.moves = 0;
    this.history = [];
    this.recycleCount = 0;
    this.gameStarted = false;
    this.gameWon = false;
  }

  setDrawMode(mode) {
    if (mode === 1 || mode === 3) {
      this.drawMode = mode;
      localStorage.setItem('solitaire_draw_mode', mode);
    }
  }

  newGame() {
    const rawDeck = createDeck();
    const shuffled = shuffleDeck(rawDeck);

    this.stock = [];
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableau = [[], [], [], [], [], [], []];
    this.score = 0;
    this.moves = 0;
    this.history = [];
    this.recycleCount = 0;
    this.gameStarted = false;
    this.gameWon = false;

    // Deal cards to Tableau:
    // Col 0: 1 card
    // Col 1: 2 cards ... Col 6: 7 cards
    let cardIdx = 0;
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = shuffled[cardIdx++];
        // Only the top card of each column is face-up initially
        card.faceUp = (row === col);
        this.tableau[col].push(card);
      }
    }

    // Remainder (24 cards) go to stock (face down)
    while (cardIdx < shuffled.length) {
      const card = shuffled[cardIdx++];
      card.faceUp = false;
      this.stock.push(card);
    }
  }

  /**
   * Draw card(s) from Stock to Waste
   */
  drawCards() {
    if (this.stock.length === 0) {
      // Recycle Waste back to Stock
      if (this.waste.length === 0) return false;

      this.recycleCount++;
      const recycledCards = [...this.waste].reverse();
      recycledCards.forEach(c => c.faceUp = false);

      const penalty = (this.drawMode === 3 && this.recycleCount > 3) ? -20 : (this.drawMode === 1 && this.recycleCount > 1 ? -100 : 0);
      const prevScore = this.score;
      this.score = Math.max(0, this.score + penalty);
      this.moves++;

      this.history.push({
        type: 'recycle',
        cards: [...this.waste],
        prevScore: prevScore,
        prevMoves: this.moves - 1
      });

      this.stock = recycledCards;
      this.waste = [];
      this.gameStarted = true;
      return { type: 'recycle', count: this.stock.length };
    }

    const drawCount = Math.min(this.drawMode, this.stock.length);
    const drawn = [];

    for (let i = 0; i < drawCount; i++) {
      const card = this.stock.pop();
      card.faceUp = true;
      this.waste.push(card);
      drawn.push(card);
    }

    this.moves++;
    this.history.push({
      type: 'draw',
      count: drawCount,
      cards: drawn,
      prevScore: this.score,
      prevMoves: this.moves - 1
    });

    this.gameStarted = true;
    return { type: 'draw', cards: drawn };
  }

  /**
   * Can a card be placed on a specific foundation?
   */
  canPlaceOnFoundation(card, fIndex) {
    if (!card) return false;
    const foundation = this.foundations[fIndex];
    const targetSuit = SUIT_LIST[fIndex];

    if (foundation.length === 0) {
      // Must be an Ace of the designated suit
      return card.rank === 1 && card.suit.id === targetSuit.id;
    }

    const topCard = foundation[foundation.length - 1];
    return card.suit.id === topCard.suit.id && card.rank === topCard.rank + 1;
  }

  /**
   * Finds the first valid foundation index for a card, or -1
   */
  findValidFoundation(card) {
    if (!card) return -1;
    for (let i = 0; i < 4; i++) {
      if (this.canPlaceOnFoundation(card, i)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Can a card (or base of stack) be placed on a tableau column?
   */
  canPlaceOnTableau(card, colIndex) {
    if (!card) return false;
    const col = this.tableau[colIndex];

    if (col.length === 0) {
      // Only a King (rank 13) can go to an empty column
      return card.rank === 13;
    }

    const topCard = col[col.length - 1];
    if (!topCard.faceUp) return false;

    // Must be opposite color and 1 rank lower
    return card.color !== topCard.color && card.rank === topCard.rank - 1;
  }

  /**
   * Move card(s) from a source to a target
   */
  executeMove(source, target) {
    // source: { area: 'waste'|'tableau'|'foundation', col?: number, cardIndex?: number }
    // target: { area: 'tableau'|'foundation', index: number }
    let movingCards = [];
    let sourceCol = null;

    if (source.area === 'waste') {
      if (this.waste.length === 0) return false;
      movingCards = [this.waste[this.waste.length - 1]];
    } else if (source.area === 'foundation') {
      const f = this.foundations[source.index];
      if (f.length === 0) return false;
      movingCards = [f[f.length - 1]];
    } else if (source.area === 'tableau') {
      sourceCol = this.tableau[source.col];
      const startIdx = (source.cardIndex !== undefined) ? source.cardIndex : sourceCol.length - 1;
      if (startIdx < 0 || startIdx >= sourceCol.length) return false;
      if (!sourceCol[startIdx].faceUp) return false;
      movingCards = sourceCol.slice(startIdx);
    }

    if (movingCards.length === 0) return false;
    const leadCard = movingCards[0];

    // Validate target
    if (target.area === 'foundation') {
      if (movingCards.length > 1) return false; // Can only move 1 card to foundation
      if (!this.canPlaceOnFoundation(leadCard, target.index)) return false;
    } else if (target.area === 'tableau') {
      if (source.area === 'tableau' && source.col === target.index) return false; // Moving to same column
      if (!this.canPlaceOnTableau(leadCard, target.index)) return false;
    } else {
      return false;
    }

    // Execute move & manage history
    const prevScore = this.score;
    const prevMoves = this.moves;
    let cardFlipped = false;
    let flippedCard = null;

    // 1. Remove from source
    if (source.area === 'waste') {
      this.waste.pop();
    } else if (source.area === 'foundation') {
      this.foundations[source.index].pop();
    } else if (source.area === 'tableau') {
      this.tableau[source.col].splice(source.cardIndex, movingCards.length);
      // Check if top card in source tableau column needs to be flipped face-up
      const remainingCol = this.tableau[source.col];
      if (remainingCol.length > 0) {
        const newTop = remainingCol[remainingCol.length - 1];
        if (!newTop.faceUp) {
          newTop.faceUp = true;
          newTop.justFlipped = true;
          cardFlipped = true;
          flippedCard = newTop;
          this.score += 5; // Reward for flipping card
        }
      }
    }

    // 2. Add to target
    if (target.area === 'foundation') {
      this.foundations[target.index].push(leadCard);
      // Scoring: Waste to Foundation = +10, Tableau to Foundation = +10
      this.score += 10;
    } else if (target.area === 'tableau') {
      this.tableau[target.index].push(...movingCards);
      // Scoring: Waste to Tableau = +5
      if (source.area === 'waste') {
        this.score += 5;
      } else if (source.area === 'foundation') {
        // Foundation to Tableau penalty = -15
        this.score = Math.max(0, this.score - 15);
      }
    }

    this.moves++;
    this.gameStarted = true;

    // Save undo entry
    this.history.push({
      type: 'move',
      source: { ...source },
      target: { ...target },
      cards: [...movingCards],
      cardFlipped: cardFlipped,
      flippedCard: flippedCard,
      prevScore: prevScore,
      prevMoves: prevMoves
    });

    // Check win condition
    this.checkWinCondition();

    return {
      success: true,
      movingCards,
      cardFlipped,
      target
    };
  }

  /**
   * Unlimited Undo
   */
  undo() {
    if (this.history.length === 0) return null;

    const action = this.history.pop();
    this.score = action.prevScore;
    this.moves = action.prevMoves;

    if (action.type === 'draw') {
      // Move drawn cards back from waste to stock
      for (let i = 0; i < action.count; i++) {
        const card = this.waste.pop();
        card.faceUp = false;
        this.stock.push(card);
      }
      return { type: 'undo_draw', action };
    }

    if (action.type === 'recycle') {
      // Move cards back from stock to waste
      this.recycleCount = Math.max(0, this.recycleCount - 1);
      const recycledCards = [...this.stock].reverse();
      recycledCards.forEach(c => c.faceUp = true);
      this.waste = recycledCards;
      this.stock = [];
      return { type: 'undo_recycle', action };
    }

    if (action.type === 'move') {
      const { source, target, cards, cardFlipped, flippedCard } = action;

      // 1. Remove cards from target
      if (target.area === 'foundation') {
        this.foundations[target.index].pop();
      } else if (target.area === 'tableau') {
        this.tableau[target.index].splice(this.tableau[target.index].length - cards.length, cards.length);
      }

      // 2. If a card was flipped in source tableau, flip it back face-down
      if (cardFlipped && flippedCard) {
        flippedCard.faceUp = false;
      }

      // 3. Put cards back into source
      if (source.area === 'waste') {
        this.waste.push(...cards);
      } else if (source.area === 'foundation') {
        this.foundations[source.index].push(...cards);
      } else if (source.area === 'tableau') {
        this.tableau[source.col].push(...cards);
      }

      this.gameWon = false;
      return { type: 'undo_move', action };
    }

    return null;
  }

  /**
   * Smart Click / Tap-to-Move:
   * Finds the best automatic destination for a given clicked card.
   */
  findSmartMove(source) {
    let card = null;
    if (source.area === 'waste') {
      if (this.waste.length === 0) return null;
      card = this.waste[this.waste.length - 1];
    } else if (source.area === 'tableau') {
      const col = this.tableau[source.col];
      const idx = source.cardIndex !== undefined ? source.cardIndex : col.length - 1;
      if (idx < 0 || idx >= col.length || !col[idx].faceUp) return null;
      card = col[idx];
    } else if (source.area === 'foundation') {
      // From foundation, try to move to tableau
      const f = this.foundations[source.index];
      if (f.length === 0) return null;
      card = f[f.length - 1];
    }

    if (!card) return null;

    // 1. First preference: If only 1 card is being moved, check if it can go to Foundation!
    const isSingleCard = (source.area !== 'tableau') || (source.cardIndex === this.tableau[source.col].length - 1);
    if (isSingleCard && source.area !== 'foundation') {
      const fIdx = this.findValidFoundation(card);
      if (fIdx !== -1) {
        return { target: { area: 'foundation', index: fIdx } };
      }
    }

    // 2. Second preference: Try to move to a Tableau column
    // Prefer non-empty columns first, then empty columns (for Kings)
    let bestCol = -1;
    let fallbackEmptyCol = -1;

    for (let c = 0; c < 7; c++) {
      if (source.area === 'tableau' && source.col === c) continue;

      if (this.canPlaceOnTableau(card, c)) {
        if (this.tableau[c].length > 0) {
          bestCol = c;
          break;
        } else if (fallbackEmptyCol === -1) {
          // If King is already at the bottom of its column and that column has NO face-down cards beneath it,
          // moving King to another empty column is pointless!
          if (source.area === 'tableau' && source.cardIndex === 0) {
            // Pointless move, don't auto-move King from empty column to empty column
          } else {
            fallbackEmptyCol = c;
          }
        }
      }
    }

    if (bestCol !== -1) {
      return { target: { area: 'tableau', index: bestCol } };
    }
    if (fallbackEmptyCol !== -1) {
      return { target: { area: 'tableau', index: fallbackEmptyCol } };
    }

    return null;
  }

  /**
   * Hint Finder:
   * Finds the best available strategic move on the board.
   */
  findHint() {
    // Priority 1: Move tableau card to foundation if safe/helpful
    for (let c = 0; c < 7; c++) {
      const col = this.tableau[c];
      if (col.length === 0) continue;
      const topCard = col[col.length - 1];
      const fIdx = this.findValidFoundation(topCard);
      if (fIdx !== -1) {
        return {
          type: 'tableau-to-foundation',
          source: { area: 'tableau', col: c, cardIndex: col.length - 1 },
          target: { area: 'foundation', index: fIdx },
          card: topCard,
          description: `Move ${topCard.rankName} of ${topCard.suit.name} to Foundation`
        };
      }
    }

    // Priority 2: Move waste card to foundation
    if (this.waste.length > 0) {
      const topWaste = this.waste[this.waste.length - 1];
      const fIdx = this.findValidFoundation(topWaste);
      if (fIdx !== -1) {
        return {
          type: 'waste-to-foundation',
          source: { area: 'waste' },
          target: { area: 'foundation', index: fIdx },
          card: topWaste,
          description: `Move ${topWaste.rankName} of ${topWaste.suit.name} from Waste to Foundation`
        };
      }
    }

    // Priority 3: Move tableau stack to uncover a face-down card
    for (let c = 0; c < 7; c++) {
      const col = this.tableau[c];
      // Find the deepest face-up card in this column
      const firstFaceUpIdx = col.findIndex(c => c.faceUp);
      if (firstFaceUpIdx > 0) { // Has face-down cards underneath!
        const cardToMove = col[firstFaceUpIdx];
        for (let targetCol = 0; targetCol < 7; targetCol++) {
          if (targetCol === c) continue;
          if (this.canPlaceOnTableau(cardToMove, targetCol)) {
            return {
              type: 'tableau-to-tableau',
              source: { area: 'tableau', col: c, cardIndex: firstFaceUpIdx },
              target: { area: 'tableau', index: targetCol },
              card: cardToMove,
              description: `Move ${cardToMove.rankName} of ${cardToMove.suit.name} to uncover hidden card`
            };
          }
        }
      }
    }

    // Priority 4: Move Waste to Tableau
    if (this.waste.length > 0) {
      const topWaste = this.waste[this.waste.length - 1];
      for (let targetCol = 0; targetCol < 7; targetCol++) {
        if (this.canPlaceOnTableau(topWaste, targetCol)) {
          return {
            type: 'waste-to-tableau',
            source: { area: 'waste' },
            target: { area: 'tableau', index: targetCol },
            card: topWaste,
            description: `Move ${topWaste.rankName} of ${topWaste.suit.name} to Column ${targetCol + 1}`
          };
        }
      }
    }

    // Priority 5: Move King to empty column if it uncovers or consolidates
    for (let c = 0; c < 7; c++) {
      const col = this.tableau[c];
      const firstFaceUp = col.findIndex(card => card.faceUp);
      if (firstFaceUp >= 0 && col[firstFaceUp].rank === 13) {
        if (firstFaceUp > 0) { // Has hidden cards beneath
          const emptyCol = this.tableau.findIndex(tc => tc.length === 0);
          if (emptyCol !== -1) {
            return {
              type: 'king-to-empty',
              source: { area: 'tableau', col: c, cardIndex: firstFaceUp },
              target: { area: 'tableau', index: emptyCol },
              card: col[firstFaceUp],
              description: `Move King of ${col[firstFaceUp].suit.name} to empty column`
            };
          }
        }
      }
    }

    // Priority 6: Any other valid Tableau to Tableau move
    for (let c = 0; c < 7; c++) {
      const col = this.tableau[c];
      const firstFaceUp = col.findIndex(card => card.faceUp);
      if (firstFaceUp >= 0) {
        for (let idx = firstFaceUp; idx < col.length; idx++) {
          const card = col[idx];
          for (let targetCol = 0; targetCol < 7; targetCol++) {
            if (targetCol === c) continue;
            if (this.canPlaceOnTableau(card, targetCol)) {
              if (this.tableau[targetCol].length > 0) {
                return {
                  type: 'tableau-to-tableau',
                  source: { area: 'tableau', col: c, cardIndex: idx },
                  target: { area: 'tableau', index: targetCol },
                  card: card,
                  description: `Move ${card.rankName} of ${card.suit.name} to Column ${targetCol + 1}`
                };
              }
            }
          }
        }
      }
    }

    // Priority 7: Draw from Stock
    if (this.stock.length > 0 || this.waste.length > 0) {
      return {
        type: 'draw',
        description: 'Draw card from Stock pile'
      };
    }

    return null;
  }

  /**
   * Check if game is winnable automatically:
   * (Stock empty, Waste empty, and all Tableau cards face up)
   */
  isWinnableAuto() {
    if (this.stock.length > 0 || this.waste.length > 0) return false;
    for (const col of this.tableau) {
      for (const card of col) {
        if (!card.faceUp) return false;
      }
    }
    // And foundations aren't full yet
    return !this.isWon();
  }

  /**
   * Check if game is won
   */
  isWon() {
    let count = 0;
    for (const f of this.foundations) {
      count += f.length;
    }
    return count === 52;
  }

  checkWinCondition() {
    if (this.isWon()) {
      this.gameWon = true;
      return true;
    }
    return false;
  }
}
