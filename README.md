# ♠ ♥ Klondike Solitaire ♦ ♣

A modern, responsive, zero-dependency Klondike Solitaire game designed to play seamlessly on both **Desktop PC** and **iPhone** (or any smartphone/tablet).

---

## 🚀 Quick Start

### Play Solitaire

Open [Klondike Solitaire](https://brentpope.github.io/Solitaire/) on your PC or iPhone. On iPhone, open the link in Safari, tap **Share → Add to Home Screen → Add** to install it for full-screen and offline play. From the game, use **Settings → Show QR code for another iPhone** to open it on another iPhone.

For more legible cards, open **Settings** and enable **Larger card numbers and suits**. This enlarges the rank and suit marks while keeping the seven cards fitted across the board.

Watch the [illustrated iPhone install walkthrough](media/solitaire-iphone-install-guide.mp4).

### Usage counts

Sharing basic usage counts is enabled by default. Uncheck the box on first launch to opt out, or change the setting later in Settings. Firebase Anonymous Authentication supplies a random app ID used to count daily active installations and whether the game was opened in standalone (installed) mode. The app does not send names, email addresses, phone numbers, page URLs, or user-agent strings. Counts are written to the `solitaire_usage` collection in the Blueprint Softphone Firebase project; installed-mode totals are estimates based on first-party app IDs, not browser-reported install events.

---

## 🎮 Game Controls & Features

### Desktop PC Controls
- **Drag & Drop**: Click and hold any face-up card or stack of cards to drag it to another pile.
- **Smart Click / Tap-to-Move**: Click once on any playable card to automatically move it to the best available spot (Foundation or Tableau).
- **Double-Click**: Quickly send a card to its Foundation pile.
- **Keyboard Shortcuts**:
  - `Ctrl + Z` / `Z` : Undo move
  - `H` : Show strategic hint
  - `N` : Deal new game
  - `D` : Draw card from Stock pile

### iPhone & Mobile Touch Controls
- **Tap-to-Move**: Designed for effortless one-handed thumb play. Tap any card to fly it to the best spot!
- **Smooth Touch Drag**: Intuitive touch dragging with realistic elevation and drop highlights.
- **Mobile Bottom Navigation**: Quick thumb access to [Undo], [Hint], [New Game], [Sound], and [Settings].
- **Responsive Layout**: Specially optimized column spacing and card scaling for iPhone screen sizes in both portrait and landscape orientation.

---

## ✨ Features

- **Classic Klondike Rules**:
  - 7 Tableau columns, 4 Foundation piles (Ace to King), Stock & Waste.
  - Draw 1 (Relaxed) or Draw 3 (Tournament Challenge) modes.
  - Auto-flips uncovered hidden cards.
- **Unlimited Undo**: Never regret a misclick; walk back moves all the way to the beginning.
- **Smart Hint System**: Highlights recommended moves to uncover hidden cards or build sequences.
- **Auto-Complete (Auto Win)**: Once all hidden cards are exposed, an "Auto Win" button appears to swiftly send all remaining cards home!
- **Iconic Win Animation**: Classic Windows Solitaire cascading bouncy cards waterfall rendered on HTML5 canvas.
- **Web Audio Sound Effects**: Zero external audio files needed; pure synthesized card flips, shuffles, snaps, and victory fanfare.
- **Visual Customization**:
  - 4 Table Felt themes: Classic Casino Green, Midnight Sapphire Blue, Royal Velvet Wine, Obsidian Dark.
  - 4 Card Back styles: Classic Crimson Ornament, Royal Sapphire Star, Obsidian & Gold Foil, Emerald Casino Tartan.
- **PWA & Offline Support**: Service Worker caches all assets locally for instant, offline play.
