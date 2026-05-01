# Huffman Coding

An interactive, browser-based tool for exploring **Huffman Encoding** — a lossless data compression algorithm.

**Live Demo:** https://deven1305.github.io/huffman-coding/

---

## 🎯 Features

- **Encoder** — Type any text and instantly see Huffman codes, the encoded bit-stream, and compression statistics.
- **Animated Tree Builder** — Step through or auto-play the Min-Heap merge process and watch the Huffman tree grow.
- **Decoder** — Paste any bit-stream and decode it using the tree from your last session.
- **Information Theory Calculator** — Compute Shannon Entropy, average codeword length, and coding efficiency.
- **Algorithm Explainer** — A six-step visual walkthrough of the Huffman algorithm.
- **Session History** — Save, reload, export, and import encoding sessions. Supports up to 50 sessions.

---

## 📋 How It Works

1. **Count Frequencies** — Encoder scans input text and counts character occurrences.
2. **Build Min-Heap** — Characters sorted by frequency in a priority queue.
3. **Merge Nodes** — Two least-frequent nodes merge repeatedly until one tree remains.
4. **Assign Codes** — Each character gets a unique bit-code (left=0, right=1).
5. **Encode Text** — Replace characters with their bit-codes.
6. **Decode** — Use the same tree to decode any bit-stream back to original text.

---

## 🗂️ Project Structure

```
huffman-coding/
├── index.html      Main HTML file
├── style.css       Styling
├── main.js         Application logic
├── history.json    Session seed file
└── README.md       Documentation
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
Use the Live Server extension
```

Then visit `http://localhost:8080`

---

## 💾 Session History

- **Auto-save** — Sessions saved to browser localStorage
- **Export** — Download sessions as JSON
- **Import** — Load previously exported sessions
- **history.json** — Pre-load demo sessions on first visit

---

## 📊 Metrics Explained

### Compression Ratio
`(Original Bits - Compressed Bits) / Original Bits × 100%`

Shows the percentage of bits saved by Huffman vs. standard ASCII (8 bits per character).

### Shannon Entropy H(X)
$H(X) = -\sum p(x_i) \log_2(p(x_i))$

The theoretical lower bound on average bits needed to encode each symbol.

### Average Codeword Length L
$L = \sum p(x_i) \times n_i$

The actual average bits per symbol in the Huffman encoding.

### Coding Efficiency
$\text{Efficiency} = \frac{H(X)}{L} \times 100\%$

How close Huffman gets to the theoretical minimum.

---

## 📱 Browser Support

- Chrome/Edge/Brave ✅
- Firefox ✅
- Safari 15+ ✅
- Mobile browsers ✅

---

## 📝 Notes

- **Storage** — History stored in browser localStorage
- **Privacy** — All processing in-browser; no server uploads
- **Performance** — Best with texts under 10,000 characters
- **Decoder** — Uses tree from last encoding session
