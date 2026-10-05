# ♠ ♥ Klondike Solitaire ♦ ♣

A modern, responsive, zero-dependency Klondike Solitaire game designed to play seamlessly on both **Desktop PC** and **iPhone** (or any smartphone/tablet).

---

## 🚀 Quick Start

### 1. Launch the Game Server
From your terminal:

```bash
cd ~/Projects/solitaire
./start.sh
```

### 2. Play on Desktop PC
Open your web browser and navigate to:
```
http://localhost:8080
```
*(You can also double-click `index.html` to open it directly in any browser without running a server!)*

### 3. Play on iPhone
1. Make sure your iPhone is connected to the same Wi-Fi network as your PC (or connected to your Tailscale network).
2. Look at the terminal output or click the **📱 Play on iPhone** button in the top navigation bar of the desktop game to show a scannable **QR Code**.
3. Open your iPhone Camera and scan the QR Code (or type the URL shown in terminal, e.g. `http://192.168.4.108:8080`).
4. **Install as a Native App (Recommended):**
   - In Safari on your iPhone, tap the **Share** button (box with an arrow pointing up).
   - Scroll down and tap **"Add to Home Screen"**.
   - Tap **Add**.
   - Now Solitaire opens instantly in full screen with no browser address bars, and works **100% offline**!

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
