# Huffman Coding

An interactive, browser-based tool for exploring **Huffman Encoding** - a lossless data compression algorithm.

---

## 🎯 Features

- **Encoder** — Type any text and instantly see Huffman codes, the encoded bit-stream, and compression statistics.
- **Animated Tree Builder** — Step through or auto-play the Min-Heap merge process and watch the Huffman tree grow.
- **Decoder** — Paste any bit-stream and decode it using the tree from your last session.
- **Calculator** — Compute Shannon Entropy, average codeword length, and coding efficiency. Supports both auto-population from encoded text and manual symbol/probability input.
- **Algorithm Explainer** — A six-step visual walkthrough of the Huffman algorithm.
- **Session History** — Save, reload, export, and import encoding sessions.

---

## 📋 How It Works

1. **Count Frequencies** — Scanner counts character occurrences
2. **Build Min-Heap** — Characters sorted by frequency in a priority queue
3. **Merge Nodes** — Two least-frequent nodes merge repeatedly until one tree remains
4. **Assign Codes** — Each character gets a unique bit-code (left=0, right=1)
5. **Encode Text** — Replace characters with their bit-codes
6. **Decode** — Use the same tree to decode any bit-stream back to original text

---

## 🗂️ Project Structure

```
huffman-coding/
├── index.html          Main HTML file
├── style.css           Styling
├── main.js             Application logic
├── history.json        Session seed file (optional)
└── README.md           This file
```

---

## 🚀 Quick Start

Open `index.html` in any modern browser. For full features, serve over HTTP:

```bash
# Python
python -m http.server 8080

# Node.js  
npx serve .

# VS Code
# Use Live Server extension
```

Then visit `http://localhost:8080`

---

## 💾 Session History

- **Auto-save** — Sessions saved to browser localStorage
- **Export** — Download sessions as JSON
- **Import** — Load previously exported sessions
- **history.json** — Pre-load demo sessions on first visit

---

## 📊 Metrics

### Compression Ratio
`(Original - Compressed) / Original × 100%`

### Shannon Entropy H(X)
$H(X) = -\sum p(x_i) \log_2(p(x_i))$

### Average Length L
$L = \sum p(x_i) \times n_i$

### Efficiency
$\text{Efficiency} = \frac{H(X)}{L} \times 100\%$

---

## 🎨 Features

- Color-coded bit streams
- Live character counter
- Preset sample texts
- Tree animations
- Step-by-step solutions
- Responsive design

---

## 🎛️ Customization

### Add Presets
Edit `PRESETS` array in `main.js`

### Change Colors
Modify CSS variables in `style.css`:
```css
:root {
  --accent: #7c6fff;
  --gold: #f4a942;
  /* ... more */
}
```

---

## 📱 Browser Support

- Chrome/Edge/Brave ✅
- Firefox ✅
- Safari 15+ ✅
- Mobile browsers ✅

---

## 🚀 Deploy to GitHub Pages

1. Push to GitHub
2. Settings > Pages
3. Select `main` branch
4. Site live at `https://<username>.github.io/<repo-name>/`

---

## 📚 About Huffman Coding

Huffman coding is an optimal algorithm for lossless data compression. It assigns variable-length codes based on character frequency - more frequent characters get shorter codes.

**Reference:**
> Huffman, D.A. (1952). "A Method for the Construction of Minimum-Redundancy Codes." *Proceedings of the IRE*, 40(9), 1098–1101.

---

## 📝 Notes

- **Storage** — History stored in browser localStorage
- **Privacy** — All processing in-browser; no server uploads
- **Performance** — Best with texts under 10,000 characters
- **Decoder** — Uses tree from last encoding session

---

## 🤝 Contributing

Found a bug? Have suggestions? Submit issues or pull requests on GitHub!

Enjoy exploring Huffman encoding!
# Huffman Lab

An interactive, browser-based studio for exploring **Huffman Encoding** and information theory. Built for the **Information Theory and Coding** course at K.J. Somaiya College of Engineering.

---

## 🎯 Features

- **Encoder** — Type any text and instantly see Huffman codes, the encoded bit-stream, and compression statistics vs. ASCII.
- **Animated Tree Builder** — Step through or auto-play the Min-Heap merge process and watch the Huffman tree grow node-by-node.
- **Decoder** — Paste any bit-stream and decode it using the tree from your last session.
- **Information Theory Calculator** — Compute Shannon Entropy H(X), average codeword length L, and coding efficiency with full animated stepwise solutions. Supports both auto-population from encoded text and manual symbol/probability input.
- **Algorithm Explainer** — A six-step visual walkthrough of the Huffman algorithm with scroll-reveal animations.
- **Session History** — All encoding sessions are saved to browser localStorage, can be reloaded, exported as JSON, or imported from files. Supports up to 50 sessions.

---

## 📋 How It Works - Quick Overview

1. **Count Frequencies** — The encoder scans your input text and counts character occurrences.
2. **Build Min-Heap** — All characters are sorted by frequency in a priority queue.
3. **Merge Nodes** — The two least-frequent nodes merge repeatedly until a binary tree forms (the Huffman tree).
4. **Assign Codes** — Each character gets a unique bit-code based on its path in the tree (left=0, right=1).
5. **Encode Text** — Your input is replaced with its bit-codes, creating a compressed bit-stream.
6. **Decode** — Using the same tree, any bit-stream can be decoded back to the original text.

---

## 🗂️ Project Structure

```
huffman-lab/
├── index.html          Main HTML shell; all DOM structure and sections
├── style.css           All CSS: design tokens, layout, components, animations
├── main.js             All JavaScript: encoding, decoding, tree animation, ITC, history
├── history.json        Seed file for pre-loading demo sessions (leave as empty array [])
└── README.md           This file
```

---

## 🚀 How to Run Locally

No build step is required. Simply open `index.html` in any modern browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

**For full functionality** (especially history.json seed loading), serve files over HTTP:

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# VS Code
# Use the "Live Server" extension (right-click > Open with Live Server)
```

Then visit `http://localhost:8080` in your browser.

---

## 💾 Session History & Data Persistence

### How History Works

- **localStorage Storage** — Every encoding session is automatically saved to your browser's localStorage under the key `huffman_lab_history`.
- **History Display** — The History section displays up to 50 recent sessions with compression ratio and symbol count.
- **Click to Reload** — Click any session card to restore that encoding session and re-display all outputs.

### Export / Import / Seed Sessions

- **Export JSON** — Click "Export JSON" to download all sessions as a `.json` file for backup or sharing.
- **Import JSON** — Click "Import JSON" to load sessions from a previously exported file.
- **Seed with history.json** — If `history.json` contains a non-empty array of session objects and your browser's localStorage is empty, those sessions are loaded automatically on page load.

### history.json Schema

Each session object in `history.json` must match this structure:

```json
{
  "id": 1700000000000,
  "timestamp": "2024-11-14T10:00:00.000Z",
  "input": "abracadabra",
  "inputPreview": "abracadabra",
  "codes": { "a": "0", "b": "101", "r": "100", "c": "1100", "d": "1101" },
  "encoded": "010110010001101001010",
  "tree": { "char": null, "freq": 11, "left": {...}, "right": {...} },
  "metrics": {
    "originalBits": 88,
    "compressedBits": 25,
    "savedBits": 63,
    "ratio": 71.59,
    "avgCodeLen": 2.273,
    "entropy": 2.1492,
    "weightedAvg": 2.2727,
    "totalChars": 11,
    "uniqueChars": 5
  }
}
```

To pre-seed the app with demo sessions, populate `history.json` with an array of such objects.

---

## 📊 Key Metrics Explained

### Compression Ratio
- **Formula** — `(Original Bits - Compressed Bits) / Original Bits × 100%`
- **Shows** — Percentage of bits saved by Huffman vs. standard ASCII (8 bits per character).

### Shannon Entropy H(X)
- **Formula** — $H(X) = -\sum p(x_i) \log_2(p(x_i))$
- **Meaning** — The theoretical lower bound on the average number of bits needed to encode each symbol.

### Average Codeword Length L
- **Formula** — $L = \sum p(x_i) \times n_i$, where $n_i$ is the code length for symbol $x_i$.
- **Meaning** — The actual average bits per symbol in the Huffman encoding.

### Coding Efficiency
- **Formula** — $\text{Efficiency} = \frac{H(X)}{L} \times 100\%$
- **Interpretation** — Shows how close Huffman gets to the theoretical minimum.
  - **95%+** → Excellent (near-optimal)
  - **85–94%** → Good (minimal redundancy)
  - **<85%** → Moderate (structure exists but less exploited)

---

## 🧠 Information Theory Calculator

### "From Encoded Text" Mode
1. Encode some text using the Encoder.
2. Go to **Info Theory** section.
3. Click **"Calculate from encoded text"**.
4. The system reads your last encoding session and displays a full step-by-step solution showing:
   - Symbol table with frequencies, probabilities, and assigned codes
   - Entropy calculation for each symbol
   - Average codeword length calculation for each symbol
   - Overall efficiency H(X)/L

### "Manual Symbols" Mode
1. Enter custom symbols and their probabilities (must sum to ≈1.0).
2. The system builds a Huffman tree, assigns codes, and solves entropy/efficiency in real time.
3. Perfect for learning how source probability distribution affects compression.

---

## 🎨 UI Features & Interactions

- **Color-Coded Bit Stream** — Each character is assigned a unique color in the encoded output for visual tracking.
- **Live Character Count** — Text input shows character count in real time.
- **Preset Samples** — Click any preset chip to instantly load sample texts like "banana", "hello world", etc.
- **Heap Animator** — Visualizes the Min-Heap during tree construction, highlighting merge operations.
- **Tree Visualization** — Large SVG diagram grows step-by-step, showing node positions, frequencies, and final codes.
- **Play/Step/Reset Controls** — Animation speed can be adjusted; play full or step through manually.
- **One-Click Paste** — "Paste last encoded" button instantly fills the decoder input.
- **Toast Notifications** — Feedback on every action (success/error messages).

---

## 🔧 Configuration & Customization

### Adding More Preset Samples
Edit the `PRESETS` array in `main.js`:

```javascript
const PRESETS = [
  { label: 'My text',  text: 'your text here' },
  // ... add more
];
```

### Adjusting History Limit
In `main.js`, modify the history length limit in `addSession()`:

```javascript
if (sessions.length > 50) sessions.length = 50;  // Change 50 to desired max
```

### Styling Customization
All colors, spacing, and fonts are defined as CSS custom properties in `style.css`:

```css
:root {
  --accent: #7c6fff;     /* Primary purple */
  --gold: #f4a942;       /* Secondary orange */
  /* ... many more variables */
}
```

---

## 📱 Browser Compatibility

- **Chromium-based** — Chrome, Edge, Brave (full support)
- **Firefox** — Full support
- **Safari** — Full support (15+)
- **Mobile Browsers** — Responsive design; works on mobile (though best experienced on desktop for tree visualization)

---

## 🚀 Deployment to GitHub Pages

1. **Push to GitHub** — Ensure all files (`index.html`, `style.css`, `main.js`, `history.json`) are in the repository root.
2. **Enable Pages** — Go to repository **Settings > Pages**.
3. **Set Source** — Select `main` branch, `/ (root)` folder.
4. **Live** — Your site will be live at `https://<username>.github.io/<repo-name>/`.

Example: If your repo is `myuser/huffman-lab`, the site is at `https://myuser.github.io/huffman-lab/`.

---

## 🧠 Algorithm Guarantees

- **Optimal Prefix-Free Codes** — Huffman codes minimize the average code length among all prefix-free codes.
- **Uniqueness** — No code is a prefix of another, ensuring unambiguous decoding.
- **Proof** — See Huffman's original paper (1952): *"A Method for the Construction of Minimum-Redundancy Codes"* and information theory textbooks (e.g., Cover & Thomas).

---

## 📚 Learning Resources

- **Shannon Entropy** — Measure of information content; read in any information theory textbook.
- **Huffman Coding Video** — Search "Huffman Coding Explained" on YouTube for visual walkthroughs.
- **Min-Heap / Priority Queue** — Learn about heap data structures in any computer science algorithms course.
- **Lossless Compression** — Related techniques: LZ77, Arithmetic Coding, and Range Coding.

---

## 📝 Notes for Users

- **Browser Storage** — Session history is stored in your browser's localStorage and persists across sessions. Clearing browser data deletes history.
- **Single Tree Per Session** — The decoder uses the Huffman tree from your most recent encoding. To decode with a different tree, re-encode or load a previous session.
- **Performance** — Works smoothly with texts up to ~10,000 characters. Very large texts may slow animation.
- **Privacy** — All processing happens in your browser; no data is sent to any server.

---

## Algorithm Reference

Huffman coding is an optimal prefix-free code. The construction algorithm:

1. Count character frequencies.
2. Insert all characters as leaf nodes into a Min-Heap ordered by frequency.
3. Repeatedly extract the two minimum-frequency nodes, create an internal node with their combined frequency, and re-insert.
4. Repeat until one node (the root) remains.
5. Assign codes by traversing the tree: left edges add "0", right edges add "1".
6. Encode by replacing each character with its code; decode by traversing the tree bit by bit.

**Reference:** Huffman, D.A. (1952). A Method for the Construction of Minimum-Redundancy Codes. *Proceedings of the IRE*, 40(9), 1098-1101.

---


