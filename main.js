// Huffman Coding - Main Application Logic
// Includes: encoding, decoding, tree animation, history management

// Data Structures

class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
    this.id = HuffmanNode._id++;
  }
}
HuffmanNode._id = 0;

class MinHeap {
  constructor() { this.heap = []; }

  insert(n) {
    this.heap.push(n);
    this._up(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 1) return this.heap.pop();
    const m = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._down(0);
    return m;
  }

  _up(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p].freq <= this.heap[i].freq) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  _down(i) {
    const n = this.heap.length;
    while (true) {
      let s = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].freq < this.heap[s].freq) s = l;
      if (r < n && this.heap[r].freq < this.heap[s].freq) s = r;
      if (s === i) break;
      [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
      i = s;
    }
  }

  get size() { return this.heap.length; }
}

// section
function huffmanEncode(text) {
  if (!text || !text.length) throw new Error('Input is empty.');
  HuffmanNode._id = 0;

  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;

  const unique = Object.keys(freq).length;

  if (unique === 1) {
    const ch   = Object.keys(freq)[0];
    const root = new HuffmanNode(null, freq[ch], new HuffmanNode(ch, freq[ch]), null);
    return buildResult(text, freq, { [ch]: '0' }, root, []);
  }

  const heap = new MinHeap();
  for (const [c, f] of Object.entries(freq)) heap.insert(new HuffmanNode(c, f));

  const buildSteps = [];
  buildSteps.push({ type: 'init', nodes: heap.heap.map(n => ({ char: n.char, freq: n.freq, id: n.id })) });

  while (heap.size > 1) {
    const left   = heap.extractMin();
    const right  = heap.extractMin();
    const parent = new HuffmanNode(null, left.freq + right.freq, left, right);
    heap.insert(parent);
    buildSteps.push({
      type: 'merge',
      left:  { char: left.char,   freq: left.freq,   id: left.id },
      right: { char: right.char,  freq: right.freq,  id: right.id },
      parent: { freq: parent.freq, id: parent.id },
      heapSnapshot: heap.heap.map(n => ({ char: n.char, freq: n.freq, id: n.id }))
    });
  }

  const root  = heap.extractMin();
  const codes = {};

  function trav(node, code) {
    if (!node) return;
    if (node.char !== null) { codes[node.char] = code || '0'; return; }
    trav(node.left,  code + '0');
    trav(node.right, code + '1');
  }
  trav(root, '');

  return buildResult(text, freq, codes, root, buildSteps);
}

/** Assemble the full result object and compute compression metrics. */
function buildResult(text, freq, codes, root, buildSteps) {
  const encoded   = text.split('').map(c => codes[c]).join('');
  const origBits  = text.length * 8;
  const compBits  = encoded.length;
  const saved     = origBits - compBits;
  const ratio     = ((saved / origBits) * 100).toFixed(2);
  const total     = text.length;

  let entropy = 0;
  for (const [, f] of Object.entries(freq)) {
    const p = f / total;
    entropy -= p * Math.log2(p);
  }

  const weightedAvg = Object.entries(freq).reduce((s, [c, f]) => s + (f / total) * codes[c].length, 0);

  return {
    input: text, freq, codes, encoded, root, buildSteps,
    metrics: {
      originalBits:   origBits,
      compressedBits: compBits,
      savedBits:      saved,
      ratio:          parseFloat(ratio),
      avgCodeLen:     parseFloat((compBits / total).toFixed(3)),
      entropy:        parseFloat(entropy.toFixed(4)),
      weightedAvg:    parseFloat(weightedAvg.toFixed(4)),
      totalChars:     total,
      uniqueChars:    Object.keys(freq).length
    }
  };
}

/** Decode a bit-string using a previously built Huffman tree. */
function huffmanDecode(bits, root) {
  if (!root)                    return { error: 'No tree. Encode first.' };
  if (!/^[01]+$/.test(bits))   return { error: 'Only 0s and 1s allowed.' };
  if (root.left && root.left.char !== null && !root.right)
    return { decoded: root.left.char.repeat(bits.length) };

  let node = root, decoded = '';
  for (const b of bits) {
    node = b === '0' ? node.left : node.right;
    if (!node) return { error: 'Invalid bit-stream for this tree.' };
    if (node.char !== null) { decoded += node.char; node = root; }
  }

  if (node !== root) return { error: 'Bit-stream ended mid-code, possibly truncated.' };
  return { decoded };
}

// Serialize tree to JSON-compatible object
function serializeTree(node) {
  if (!node) return null;
  return { char: node.char, freq: node.freq, left: serializeTree(node.left), right: serializeTree(node.right) };
}

// Deserialize JSON object back to HuffmanNode instances
function deserializeTree(obj) {
  if (!obj) return null;
  const n = new HuffmanNode(obj.char, obj.freq);
  n.left = deserializeTree(obj.left);
  n.right = deserializeTree(obj.right);
  return n;
}

// section
let lastResult = null;
let lastRoot   = null;

// Preset Sample Strings
const PRESETS = [
  { label: 'abracadabra',  text: 'abracadabra' },
  { label: 'banana',       text: 'banana' },
  { label: 'hello world',  text: 'hello world' },
  { label: 'mississippi',  text: 'mississippi' },
  { label: 'aardvark',     text: 'aardvark' },
  { label: 'DNA sequence', text: 'AGTCAGTCAGTCGTAC' },
  { label: 'repetitive',   text: 'aaabbbccddddeeee' },
];

// Initialize preset buttons on page load
(function initPresets() {
  const row = document.getElementById('presets');
  PRESETS.forEach(p => {
    const chip = document.createElement('button');
    chip.className = 'preset-chip';
    chip.textContent = p.label;
    chip.onclick = () => {
      document.getElementById('inputText').value = p.text;
      updateCharCount();
    };
    row.appendChild(chip);
  });
})();

document.getElementById('inputText').addEventListener('input', updateCharCount);

function updateCharCount() {
  const t = document.getElementById('inputText').value;
  document.getElementById('charCount').textContent = `${t.length} chars`;
}

// Encoding Action
function encode() {
  const text = document.getElementById('inputText').value.trim();
  if (!text) { showToast('Please enter some text first.'); return; }

  try {
    const result = huffmanEncode(text);
    lastResult = result;
    lastRoot   = result.root;

    renderBitOutput(result);
    renderCompareRow(result);
    renderMetrics(result);
    renderCodeTable(result);
    TreeAnim.init(result);
    updateHeroStats(result);
    addSession(result);
    renderHistory();

    document.getElementById('outputPlaceholder').style.display = 'none';
    showToast('Encoded successfully!');

    document.getElementById('fromTextNote').innerHTML =
      'Text encoded! Click below to calculate compression metrics.';
  } catch (e) {
    showToast('Error: ' + e.message);
  }
}

// Render Helpers: Output Display

/** Render colour-coded bit stream (each character gets a unique palette colour). */
function renderBitOutput(result) {
  const el  = document.getElementById('bitOutput');
  const sec = document.getElementById('bitSection');

  const chars   = [...new Set(result.input.split(''))];
  const palette = ['#818cf8','#f4a942','#34d399','#f472b6','#22d3ee','#a78bfa','#fbbf24','#4ade80','#fb923c','#60a5fa'];
  const colorMap = {};
  chars.forEach((c, i) => colorMap[c] = palette[i % palette.length]);

  let html = '';
  for (const c of result.input) {
    for (const b of result.codes[c]) html += `<span style="color:${colorMap[c]}">${b}</span>`;
  }

  el.innerHTML = html;
  el.style.display  = 'block';
  sec.style.display = 'block';
}

function renderCompareRow(result) {
  const m = result.metrics;
  document.getElementById('ccOrigBits').textContent  = m.originalBits.toLocaleString();
  document.getElementById('ccOrigSub').textContent   = `${m.totalChars} chars x 8 bits`;
  document.getElementById('ccCompBits').textContent  = m.compressedBits.toLocaleString();
  document.getElementById('ccCompSub').textContent   = `${m.avgCodeLen} bits/char avg`;
  document.getElementById('ccSavedBits').textContent = m.savedBits.toLocaleString();
  document.getElementById('ccSavedPct').textContent  = `${m.ratio}% compression ratio`;
  document.getElementById('compareRow').style.display = 'grid';
}

function renderMetrics(result) {
  const m = result.metrics;
  document.getElementById('mEntropy').textContent    = m.entropy.toFixed(4) + ' bits';
  document.getElementById('mAvgLen').textContent     = m.weightedAvg.toFixed(4) + ' bits';
  const eff = (m.entropy / m.weightedAvg * 100).toFixed(2) + '%';
  document.getElementById('mEfficiency').textContent = eff;
  document.getElementById('mUnique').textContent     = m.uniqueChars;
  document.getElementById('metricsGrid').style.display = 'grid';
}

function renderCodeTable(result) {
  const total  = result.metrics.totalChars;
  const sorted = Object.entries(result.freq).sort((a, b) => b[1] - a[1]);

  const rows = sorted.map(([c, f]) => {
    const code       = result.codes[c];
    const prob       = (f / total).toFixed(4);
    const saved      = 8 - code.length;
    const savedTotal = saved * f;
    const pct        = Math.max(0, Math.round((savedTotal / (8 * f)) * 100));
    const charDisplay = c === ' ' ? 'space' : c === '\n' ? 'newline' : c === '\t' ? 'tab' : c;
    const bits = code.split('').map(b => `<span class="bit-${b}">${b}</span>`).join('');

    return `<tr>
      <td><span class="char-badge">${charDisplay}</span></td>
      <td>${f}</td>
      <td>${prob}</td>
      <td><span class="code-bits">${bits}</span></td>
      <td>${code.length}</td>
      <td>8</td>
      <td>
        <div class="savings-bar-wrap">
          <span style="font-size:13px;color:${savedTotal >= 0 ? 'var(--green)' : 'var(--red)'}">${savedTotal >= 0 ? '+' : ''}${savedTotal}</span>
          <div class="savings-bar-bg"><div class="savings-bar-fill" style="width:${pct}%"></div></div>
        </div>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('codeTableBody').innerHTML = rows;
  document.getElementById('codeTableMeta').textContent = `${sorted.length} unique symbols`;
  document.getElementById('codeTable').style.display = 'block';
}

function copyBits() {
  if (!lastResult) return;
  navigator.clipboard.writeText(lastResult.encoded).then(() => showToast('Bits copied!'));
}

function pasteLastEncoded() {
  if (!lastResult) { showToast('Encode something first.'); return; }
  document.getElementById('decodeInput').value = lastResult.encoded;
}

// Decoder
function doDecode() {
  const bits = document.getElementById('decodeInput').value.trim();
  const el   = document.getElementById('decodeResult');

  if (!bits)     { el.className = 'error'; el.textContent = 'Enter a bit-stream to decode.'; return; }
  if (!lastRoot) { el.className = 'error'; el.textContent = 'No tree available. Encode some text first.'; return; }

  const res = huffmanDecode(bits, lastRoot);
  if (res.error) { el.className = 'error';   el.textContent = 'Error: ' + res.error; }
  else           { el.className = 'success'; el.textContent = res.decoded; }
}

// Tree Animation Engine
const TreeAnim = (() => {
  let steps = [], currentStep = 0, root = null, codes = {}, timer = null, playing = false;

  function init(result) {
    steps = result.buildSteps;
    root  = result.root;
    codes = result.codes;
    currentStep = 0;
    playing = false;
    if (timer) { clearInterval(timer); timer = null; }
    document.getElementById('btnPlay').textContent = 'Play';
    document.getElementById('btnPlay').classList.remove('active');
    renderStep(0);
  }

  function renderStep(idx) {
    if (!steps || !steps.length) return;
    const step  = steps[idx];
    const total = steps.length - 1;

    document.getElementById('stepLabel').textContent = `Step ${idx} / ${total}`;
    document.getElementById('stepProgressFill').style.width = `${(idx / Math.max(total, 1)) * 100}%`;

    updateDesc(step, idx, total);
    updateHeap(step, idx);
    updateTree(idx);
  }

  function updateDesc(step, idx, total) {
    const el = document.getElementById('stepDesc');
    if (!step) { el.innerHTML = 'Done!'; return; }

    if (step.type === 'init') {
      el.innerHTML = `<strong>Step 0: Build Initial Heap.</strong> All ${step.nodes.length} unique characters are inserted into a Min-Priority Queue, sorted by frequency. The smallest frequency node is always extracted first.`;
    } else if (step.type === 'merge') {
      const lc = step.left.char  === null ? 'internal' : (step.left.char  === ' ' ? 'space' : step.left.char);
      const rc = step.right.char === null ? 'internal' : (step.right.char === ' ' ? 'space' : step.right.char);
      el.innerHTML = `<strong>Step ${idx}: Merge.</strong> Extract two minimum nodes: <span class="hl-left">'${lc}' (freq=${step.left.freq})</span> and <span class="hl-right">'${rc}' (freq=${step.right.freq})</span>. Create a new internal node with combined frequency <strong>${step.parent.freq}</strong>. Re-insert into heap.`;
    }

    if (idx === total) el.innerHTML += ` <span style="color:var(--green);font-weight:600"> Tree Complete!</span>`;
  }

  function updateHeap(step, idx) {
    const container = document.getElementById('heapNodes');
    let nodes = [];
    let displayNodes = [];

    if (step.type === 'init') {
      nodes = step.nodes;
      displayNodes = nodes.sort((a, b) => a.freq - b.freq).map(n => ({ node: n, cls: 'leaf' }));
    } else if (step.type === 'merge') {
      nodes = step.heapSnapshot;
      const sorted = [...nodes].sort((a, b) => a.freq - b.freq);
      displayNodes = [
        { node: step.left,  cls: 'highlight-left' },
        { node: step.right, cls: 'highlight-right' },
        { node: { char: null, freq: step.parent.freq, id: step.parent.id }, cls: 'new-node' },
        ...sorted.filter(n => n.id !== step.parent.id).map(n => ({ node: n, cls: 'leaf' }))
      ];
    }

    container.innerHTML = '';
    displayNodes.forEach(({ node, cls }) => {
      const isLeaf   = node.char !== null;
      const charLabel = node.char === null ? 'int' : (node.char === ' ' ? 'sp' : node.char);
      const div = document.createElement('div');
      div.className = `heap-node ${isLeaf ? 'leaf' : 'internal'} ${cls}`;
      div.innerHTML = `<div class="heap-node-circle"><span class="hc-char">${charLabel}</span><span class="hc-freq">${node.freq}</span></div>`;
      container.appendChild(div);
    });
  }

  function updateTree(idx) {
    const area = document.getElementById('treeSvgArea');
    if (!root) { area.innerHTML = '<div class="tree-placeholder-msg">Encode text first.</div>'; return; }

    layoutTree(root);
    const allNodes = collectNodes(root);
    const maxX = Math.max(...allNodes.map(n => n._x));
    const maxY = Math.max(...allNodes.map(n => n._y));
    const W = Math.max(500, (maxX + 1) * 70 + 80);
    const H = (maxY + 1) * 90 + 80;
    const scaleX = (W - 160) / Math.max(maxX, 1);
    allNodes.forEach(n => { n._px = 80 + n._x * scaleX; n._py = 50 + n._y * 90; });

    const visibleIds = new Set();
    for (let i = 0; i <= idx && i < steps.length; i++) {
      const s = steps[i];
      if (s.type === 'init') s.nodes.forEach(n => visibleIds.add(n.id));
      else if (s.type === 'merge') {
        visibleIds.add(s.left.id);
        visibleIds.add(s.right.id);
        visibleIds.add(s.parent.id);
      }
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', '100%');
    svg.style.overflow = 'visible';

    allNodes.forEach(node => {
      if (!visibleIds.has(node.id)) return;
      if (node.left && visibleIds.has(node.left.id)) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', node._px); line.setAttribute('y1', node._py);
        line.setAttribute('x2', node.left._px); line.setAttribute('y2', node.left._py);
        line.setAttribute('stroke', '#6366f1'); line.setAttribute('stroke-width', '2'); line.setAttribute('opacity', '0.7');
        svg.appendChild(line);
        drawEdgeLabel(svg, node, node.left, '0', '#818cf8');
      }
      if (node.right && visibleIds.has(node.right.id)) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', node._px); line.setAttribute('y1', node._py);
        line.setAttribute('x2', node.right._px); line.setAttribute('y2', node.right._py);
        line.setAttribute('stroke', '#f59e0b'); line.setAttribute('stroke-width', '2'); line.setAttribute('opacity', '0.7');
        svg.appendChild(line);
        drawEdgeLabel(svg, node, node.right, '1', '#f4a942');
      }
    });

    allNodes.forEach(node => {
      if (!visibleIds.has(node.id)) return;
      const isLeaf = node.char !== null;
      const r      = isLeaf ? 22 : 26;
      const isNew  = idx > 0 && steps[idx].type === 'merge' && steps[idx].parent.id === node.id;
      const g      = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      if (isNew) g.style.animation = 'nodePop 0.4s cubic-bezier(0.34,1.56,0.64,1)';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node._px); circle.setAttribute('cy', node._py); circle.setAttribute('r', r);
      circle.setAttribute('fill',   isLeaf ? 'rgba(244,169,66,0.15)' : 'rgba(124,111,255,0.12)');
      circle.setAttribute('stroke', isLeaf ? '#f4a942' : '#7c6fff');
      circle.setAttribute('stroke-width', '2');
      g.appendChild(circle);

      if (isLeaf) {
        const cl = node.char === ' ' ? 'sp' : node.char;
        const ct = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ct.setAttribute('x', node._px); ct.setAttribute('y', node._py - 3);
        ct.setAttribute('text-anchor', 'middle'); ct.setAttribute('fill', '#f4a942');
        ct.setAttribute('font-size', '13'); ct.setAttribute('font-family', 'JetBrains Mono, monospace'); ct.setAttribute('font-weight', 'bold');
        ct.textContent = cl; g.appendChild(ct);

        const ft = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ft.setAttribute('x', node._px); ft.setAttribute('y', node._py + 11);
        ft.setAttribute('text-anchor', 'middle'); ft.setAttribute('fill', '#94a3b8');
        ft.setAttribute('font-size', '9'); ft.setAttribute('font-family', 'JetBrains Mono, monospace');
        ft.textContent = node.freq; g.appendChild(ft);

        if (idx === steps.length - 1 && codes[node.char]) {
          const code = codes[node.char];
          const bx = node._px, by = node._py + r + 14;
          const bw = code.length * 8 + 10;
          const br = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          br.setAttribute('x', bx - bw / 2); br.setAttribute('y', by - 9);
          br.setAttribute('width', bw); br.setAttribute('height', 16); br.setAttribute('rx', 4); br.setAttribute('fill', '#0f172a');
          g.appendChild(br);
          const bt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          bt.setAttribute('x', bx); bt.setAttribute('y', by + 3); bt.setAttribute('text-anchor', 'middle');
          bt.setAttribute('fill', '#4ade80'); bt.setAttribute('font-size', '9'); bt.setAttribute('font-family', 'JetBrains Mono, monospace');
          bt.textContent = code; g.appendChild(bt);
        }
      } else {
        const ft = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ft.setAttribute('x', node._px); ft.setAttribute('y', node._py + 5);
        ft.setAttribute('text-anchor', 'middle'); ft.setAttribute('fill', '#a78bfa');
        ft.setAttribute('font-size', '11'); ft.setAttribute('font-family', 'JetBrains Mono, monospace');
        ft.textContent = node.freq; g.appendChild(ft);
      }

      svg.appendChild(g);
    });

    area.innerHTML = '';
    area.appendChild(svg);
  }

  function drawEdgeLabel(svg, parent, child, label, color) {
    const mx = (parent._px + child._px) / 2;
    const my = (parent._py + child._py) / 2;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', mx - 8); rect.setAttribute('y', my - 8);
    rect.setAttribute('width', 16); rect.setAttribute('height', 16);
    rect.setAttribute('rx', 3); rect.setAttribute('fill', color);
    svg.appendChild(rect);
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', mx); txt.setAttribute('y', my + 5); txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('fill', '#fff'); txt.setAttribute('font-size', '10');
    txt.setAttribute('font-family', 'JetBrains Mono, monospace'); txt.setAttribute('font-weight', 'bold');
    txt.textContent = label;
    svg.appendChild(txt);
  }

  function play() {
    if (!steps.length) { showToast('Encode text first.'); return; }
    if (playing) { pause(); return; }
    if (currentStep >= steps.length - 1) currentStep = 0;
    playing = true;
    document.getElementById('btnPlay').textContent = 'Pause';
    document.getElementById('btnPlay').classList.add('active');
    const speed = parseInt(document.getElementById('animSpeed').value);
    timer = setInterval(() => {
      if (currentStep >= steps.length - 1) { pause(); return; }
      currentStep++;
      renderStep(currentStep);
    }, speed);
  }

  function pause() {
    playing = false;
    clearInterval(timer);
    timer = null;
    document.getElementById('btnPlay').textContent = 'Play';
    document.getElementById('btnPlay').classList.remove('active');
  }

  function step() {
    if (!steps.length) { showToast('Encode text first.'); return; }
    if (currentStep < steps.length - 1) { currentStep++; renderStep(currentStep); }
  }

  function reset() {
    pause();
    currentStep = 0;
    if (steps.length) renderStep(0);
  }

  return { init, play, step, reset };
})();

// Tree Layout Helpers
function layoutTree(node, depth = 0, counter = { val: 0 }) {
  if (!node) return;
  layoutTree(node.left,  depth + 1, counter);
  node._x = counter.val++;
  node._y = depth;
  layoutTree(node.right, depth + 1, counter);
}

function collectNodes(node, arr = []) {
  if (!node) return arr;
  collectNodes(node.left,  arr);
  arr.push(node);
  collectNodes(node.right, arr);
  return arr;
}

// Calculator
let itcMode = 'from-text';

function switchITC(mode) {
  itcMode = mode;
  document.querySelectorAll('.itc-tab').forEach((t, i) =>
    t.classList.toggle('active', (i === 0 && mode === 'from-text') || (i === 1 && mode === 'manual'))
  );
  document.getElementById('itcPanelFromText').classList.toggle('active', mode === 'from-text');
  document.getElementById('itcPanelManual').classList.toggle('active',   mode === 'manual');
  document.getElementById('solutionSteps').style.display = 'none';
  document.getElementById('solutionSteps').classList.remove('visible');
}

/** Populate default symbols for the manual tab on load. */
(function initManualSymbols() {
  const defaults = [{ s: 'A', p: '0.4' }, { s: 'B', p: '0.3' }, { s: 'C', p: '0.2' }, { s: 'D', p: '0.1' }];
  defaults.forEach(d => addManualSymbol(d.s, d.p));
})();

function addManualSymbol(sym = '', prob = '') {
  const grid = document.getElementById('manualSymbols');
  const row  = document.createElement('div');
  row.className = 'symbol-row';
  row.innerHTML = `
    <span class="sym-label">Symbol:</span>
    <input type="text" maxlength="3" placeholder="x" value="${sym}" class="sym-char" style="width:40px">
    <span class="sym-label">P:</span>
    <input type="number" step="0.001" min="0" max="1" placeholder="0.25" value="${prob}" class="sym-prob" style="width:70px">
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:0 4px" title="Remove">x</button>
  `;
  grid.appendChild(row);
}

// Calculator - compute entropy and efficiency

function calcITCFromText() {
  if (!lastResult) { showToast('Encode some text first!'); return; }
  const total   = lastResult.metrics.totalChars;
  const symbols = Object.entries(lastResult.freq).sort((a, b) => b[1] - a[1]).map(([c, f]) => ({
    symbol: c === ' ' ? 'space' : c === '\n' ? 'newline' : c,
    prob:   f / total,
    freq:   f,
    code:   lastResult.codes[c]
  }));
  renderITCSolution(symbols, lastResult);
}

// Calculate from manually entered data

function calcITCManual() {
  const chars = document.querySelectorAll('#manualSymbols .sym-char');
  const probs = document.querySelectorAll('#manualSymbols .sym-prob');
  const symbols = [];
  let sum = 0;

  for (let i = 0; i < chars.length; i++) {
    const s = chars[i].value.trim() || `x${i + 1}`;
    const p = parseFloat(probs[i].value);
    if (isNaN(p) || p <= 0) { showToast(`Invalid probability for symbol ${s}`); return; }
    symbols.push({ symbol: s, prob: p });
    sum += p;
  }

  if (Math.abs(sum - 1) > 0.01) { showToast(`Probabilities sum to ${sum.toFixed(3)}, not 1.0`); return; }

  HuffmanNode._id = 0;
  const heap = new MinHeap();
  symbols.forEach(s => heap.insert(new HuffmanNode(s.symbol, s.prob)));
  while (heap.size > 1) {
    const l = heap.extractMin(), r = heap.extractMin();
    heap.insert(new HuffmanNode(null, l.freq + r.freq, l, r));
  }
  const root  = heap.extractMin();
  const codes = {};
  function trav(node, code) {
    if (!node) return;
    if (node.char !== null) { codes[node.char] = code || '0'; return; }
    trav(node.left,  code + '0');
    trav(node.right, code + '1');
  }
  trav(root, '');

  const symsWithCodes = symbols.map(s => ({ ...s, code: codes[s.symbol] }));
  renderITCSolution(symsWithCodes, null);
}

// Render the solution with entropy and efficiency calculations

function renderITCSolution(symbols, result) {
  const container = document.getElementById('solutionSteps');
  container.style.display = 'block';
  container.innerHTML = '';

  let H = 0, L = 0;
  symbols.forEach(s => {
    if (s.prob > 0) H -= s.prob * Math.log2(s.prob);
    if (s.code)     L += s.prob * s.code.length;
  });
  const eta = H / L;

  const stepsData = [
    {
      num: 1, title: 'Symbol Table with Probabilities and Codewords',
      render: () => {
        const rows = symbols.map(s => {
          const fraction = toFraction(s.prob);
          const codeBits = s.code ? s.code.split('').map(b => `<span class="bit-${b}">${b}</span>`).join('') : 'N/A';
          return `<tr>
            <td style="text-align:center">${s.symbol}</td>
            <td>${s.freq ? s.freq : 'N/A'}</td>
            <td>${fraction} = ${s.prob.toFixed(4)}</td>
            <td>${codeBits}</td>
            <td>${s.code ? s.code.length : 'N/A'}</td>
          </tr>`;
        }).join('');
        return `<div class="sym-table-wrap"><table class="sym-tbl">
          <thead><tr><th>Symbol</th><th>Frequency</th><th>Probability p(xi)</th><th>Codeword</th><th>Length ni</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`;
      }
    },
    {
      num: 2, title: 'Shannon Entropy H(X) = sum p(xi) x log2(1/p(xi))',
      render: () => {
        const terms = symbols.map(s => {
          if (s.prob <= 0) return '';
          const log2val = -Math.log2(s.prob);
          const contrib = s.prob * log2val;
          return `<div style="margin:4px 0;font-size:13px">
            <span style="color:var(--text2)">${s.symbol}: </span>
            <span class="term-chip" style="color:var(--accent2);border-color:rgba(124,111,255,0.3);background:rgba(124,111,255,0.08)">${s.prob.toFixed(4)}</span>
            <span style="color:var(--muted)"> x log2(1/${s.prob.toFixed(4)}) = </span>
            <span class="term-chip" style="color:var(--gold);border-color:rgba(244,169,66,0.3);background:rgba(244,169,66,0.08)">${contrib.toFixed(4)}</span>
          </div>`;
        }).join('');
        return `<div class="formula-box">
          ${terms}
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
            <span style="color:var(--text2)">H(X) = </span>
            <span class="formula-result">${H.toFixed(4)} bits/symbol</span>
          </div>
        </div>`;
      }
    },
    {
      num: 3, title: 'Average Codeword Length L = sum p(xi) x ni',
      render: () => {
        const terms = symbols.map(s => {
          if (!s.code) return '';
          return `<div style="margin:4px 0;font-size:13px">
            <span style="color:var(--text2)">${s.symbol}: </span>
            <span class="term-chip" style="color:var(--accent2);border-color:rgba(124,111,255,0.3);background:rgba(124,111,255,0.08)">${s.prob.toFixed(4)}</span>
            <span style="color:var(--muted)"> x ${s.code.length} = </span>
            <span class="term-chip" style="color:var(--gold);border-color:rgba(244,169,66,0.3);background:rgba(244,169,66,0.08)">${(s.prob * s.code.length).toFixed(4)}</span>
          </div>`;
        }).join('');
        return `<div class="formula-box">
          ${terms}
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
            <span style="color:var(--text2)">L = </span>
            <span class="formula-result">${L.toFixed(4)} bits/symbol</span>
          </div>
        </div>`;
      }
    },
    {
      num: 4, title: 'Efficiency = H(X) / L x 100%',
      render: () => {
        const pct = (eta * 100).toFixed(2);
        return `<div>
          <div class="formula-box" style="margin-bottom:16px">
            <div class="formula-line">efficiency = H(X) / L = ${H.toFixed(4)} / ${L.toFixed(4)}</div>
            <div class="formula-result">efficiency = ${pct}%</div>
          </div>
          <div class="efficiency-display">
            <div class="eff-card">
              <div class="eff-val">${H.toFixed(4)}</div>
              <div class="eff-lbl">Entropy H(X) <span style="font-size:10px">(bits/symbol)</span></div>
            </div>
            <div class="eff-card">
              <div class="eff-val">${L.toFixed(4)}</div>
              <div class="eff-lbl">Avg Length L <span style="font-size:10px">(bits/symbol)</span></div>
            </div>
            <div class="eff-card highlight">
              <div class="eff-val">${pct}%</div>
              <div class="eff-lbl">Efficiency H/L</div>
            </div>
          </div>
          <div style="margin-top:16px;padding:14px 16px;background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.2);border-radius:8px;font-size:13px;color:var(--text2)">
            ${pct >= 95 ? 'Excellent efficiency. Huffman code is near-optimal for this source.' :
              pct >= 85 ? 'Good efficiency. Minimal redundancy in the encoding.' :
                          'Moderate efficiency. Source has structure Huffman can exploit further.'}
          </div>
        </div>`;
      }
    }
  ];

  stepsData.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'sol-step';
    div.innerHTML = `
      <div class="sol-step-header">
        <div class="step-num">${s.num}</div>
        <div class="step-title-text">${s.title}</div>
      </div>
      <div>${s.render()}</div>
      ${i < stepsData.length - 1 ? '<div class="step-connector">down</div>' : ''}
    `;
    container.appendChild(div);
  });

  container.classList.add('visible');
  container.querySelectorAll('.sol-step').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 400 + 100);
  });
}

/** Convert a decimal probability to a readable fraction string. */
function toFraction(decimal) {
  if (decimal === 1) return '1';
  const tolerance = 1e-6;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = decimal;
  do {
    const a = Math.floor(b);
    let aux = h1; h1 = a * h1 + h2; h2 = aux;
    aux = k1; k1 = a * k1 + k2; k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance && k1 < 1000);
  if (k1 <= 1 || k1 > 100) return decimal.toFixed(4);
  return `${h1}/${k1}`;
}

// Algorithm Explainer
const HOW_STEPS = [
  {
    num: '01', title: 'Count Character Frequencies',
    desc: 'Scan the input text and count how many times each character appears. More frequent characters will get shorter codes; this is the key insight behind Huffman coding.',
    visual: `
      <div class="mini-node"><div class="mini-circle leaf">a</div><div class="mini-freq">5x</div></div>
      <div class="mini-node"><div class="mini-circle leaf">b</div><div class="mini-freq">2x</div></div>
      <div class="mini-node"><div class="mini-circle leaf">c</div><div class="mini-freq">1x</div></div>
      <div class="mini-node"><div class="mini-circle leaf">d</div><div class="mini-freq">1x</div></div>
    `
  },
  {
    num: '02', title: 'Build a Min-Priority Queue (Heap)',
    desc: 'Insert all characters into a Min-Heap sorted by frequency. The heap always gives you the two least-frequent nodes first; they form the deepest (longest code) leaves in the tree.',
    visual: `
      <div style="font-family:JetBrains Mono,monospace;font-size:13px;color:var(--text2)">
        Heap: [c:1] [d:1] [b:2] [a:5]<br>
        <span style="color:var(--accent2)">Min always extracted first</span>
      </div>
    `
  },
  {
    num: '03', title: 'Merge the Two Smallest Nodes',
    desc: 'Extract the two minimum-frequency nodes from the heap. Create a new internal node whose frequency equals their sum, then re-insert it. Repeat until only one node remains.',
    visual: `
      <div class="mini-node"><div class="mini-circle leaf">c</div><div class="mini-freq">1</div></div>
      <div class="arrow-sep">+</div>
      <div class="mini-node"><div class="mini-circle leaf">d</div><div class="mini-freq">1</div></div>
      <div class="arrow-sep">to</div>
      <div class="mini-node"><div class="mini-circle internal">int</div><div class="mini-freq">2</div></div>
    `
  },
  {
    num: '04', title: 'Traverse the Tree to Assign Codes',
    desc: 'Starting from the root, go left to add "0", go right to add "1". The code for each character is the path from root to its leaf node. No code is a prefix of another; this is a prefix-free code.',
    visual: `
      <div style="font-family:JetBrains Mono,monospace;font-size:13px">
        <div><span style="color:var(--gold)">a</span> to <span style="color:#818cf8">0</span></div>
        <div><span style="color:var(--gold)">b</span> to <span style="color:#818cf8">10</span></div>
        <div><span style="color:var(--gold)">c</span> to <span style="color:#818cf8">110</span></div>
        <div><span style="color:var(--gold)">d</span> to <span style="color:#818cf8">111</span></div>
      </div>
    `
  },
  {
    num: '05', title: 'Encode the Original Text',
    desc: 'Replace each character in the original text with its Huffman code. The result is a compact bit-stream, typically 20 to 80% fewer bits than standard ASCII (8 bits per character).',
    visual: `
      <div style="font-family:JetBrains Mono,monospace;font-size:12px;color:var(--text2)">
        "abba" to <span style="color:#818cf8">0</span><span style="color:#f4a942">10</span><span style="color:#f4a942">10</span><span style="color:#818cf8">0</span>
        <br><span style="color:var(--green)">6 bits vs 32 bits ASCII = 81% saved</span>
      </div>
    `
  },
  {
    num: '06', title: 'Decode Using the Same Tree',
    desc: 'To decode, traverse the tree bit by bit: left on 0, right on 1. When you hit a leaf, output that character and return to the root. The same tree used for encoding is required for decoding.',
    visual: `
      <div style="font-family:JetBrains Mono,monospace;font-size:12px;color:var(--text2)">
        <span style="color:#818cf8">0</span> means root to left = <span style="color:var(--gold)">a</span><br>
        <span style="color:#818cf8">10</span> means root to right to left = <span style="color:var(--gold)">b</span>
      </div>
    `
  }
];

(function renderHowItWorks() {
  const flow = document.getElementById('stepsFlow');
  HOW_STEPS.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'flow-step';
    div.style.transitionDelay = `${i * 0.1}s`;
    div.innerHTML = `
      <div class="flow-num">${s.num}</div>
      <div class="flow-content">
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <div class="flow-visual">${s.visual}</div>
      </div>
    `;
    flow.appendChild(div);
  });
})();

// Session History Management
// Sessions stored in browser localStorage - persists until cleared
// history.json is seed-only (browser security prevents direct writes)
// Use Export/Import buttons for backup/restore

const STORAGE_KEY = 'huffman_sessions';

// Load sessions from localStorage
function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

// Save sessions to localStorage
function saveSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); }
  catch { console.warn('localStorage save failed'); }
}

// Save current sessions to history.json file (for export/persistence)
async function saveSessionsToFile(sessions) {
  try {
    const response = await fetch('./history.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessions, null, 2)
    });
    if (!response.ok) console.warn('history.json write failed:', response.status);
  } catch (err) {
    // Note: Browser security may prevent direct file writes
    // Use exportHistory() button for manual export instead
    console.log('history.json write not available (browser security)');
  }
}

// Add new session to history and persist
function addSession(result) {
  const sessions = loadSessions();
  const newSession = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    input: result.input,
    inputPreview: result.input.length > 40 ? result.input.slice(0, 40) + '...' : result.input,
    codes: result.codes,
    encoded: result.encoded,
    tree: serializeTree(result.root),
    metrics: result.metrics
  };
  sessions.unshift(newSession);
  if (sessions.length > 50) sessions.length = 50;
  saveSessions(sessions);
  
  // Attempt to sync with history.json (may not work in browser)
  saveSessionsToFile(sessions);
}

// Render all sessions in the history panel
function renderHistory() {
  const sessions = loadSessions();
  const list = document.getElementById('historyList');

  if (!sessions.length) {
    list.innerHTML = '<div class="hist-empty">No sessions yet. Encode some text to get started.</div>';
    return;
  }

  list.innerHTML = sessions.map((s, i) => `
    <div class="hist-card" onclick="loadSession(${i})">
      <div class="hist-preview">"${s.inputPreview}"</div>
      <div class="hist-meta">
        <span class="hist-tag">${s.metrics.ratio}% saved</span>
        <span class="hist-tag">${s.metrics.uniqueChars} symbols</span>
        <span style="font-size:11px;color:var(--muted);margin-left:auto">${new Date(s.timestamp).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');
}

// Load a previous session and re-encode
function loadSession(idx) {
  const sessions = loadSessions();
  const s = sessions[idx];
  if (!s) return;
  document.getElementById('inputText').value = s.input;
  updateCharCount();
  encode();
  showToast('Session loaded!');
  document.getElementById('encoder').scrollIntoView({ behavior: 'smooth' });
}

// Export sessions as JSON file
function exportHistory() {
  const sessions = loadSessions();
  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `huffman_history_${Date.now()}.json`;
  a.click();
  showToast('History exported!');
}

// Import sessions from JSON file
function importHistory() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          saveSessions(data);
          renderHistory();
          showToast('History imported!');
        } else {
          showToast('Invalid JSON format');
        }
      } catch {
        showToast('Error reading file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Clear all history
function clearHistory() {
  if (!confirm('Clear all session history? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
  updateHeroStats({ metrics: { totalChars: 0, savedBits: 0 }, root: null });
  showToast('History cleared.');
}

// section
function updateHeroStats(result) {
  const sessions  = loadSessions();
  const totalChars = sessions.reduce((a, s) => a + (s.metrics.totalChars || 0), 0);
  const totalBits  = sessions.reduce((a, s) => a + (s.metrics.savedBits  || 0), 0);
  animCount('heroCharsEncoded', totalChars);
  animCount('heroBitsSaved',    totalBits);
  animCount('heroSessions',     sessions.length);
}

function animCount(id, target) {
  const el    = document.getElementById(id);
  const start = parseInt(el.textContent.replace(/,/g, '')) || 0;
  const diff  = target - start;
  const dur   = 600;
  const startT = Date.now();
  function frame() {
    const t = Math.min(1, (Date.now() - startT) / dur);
    el.textContent = Math.round(start + diff * t).toLocaleString();
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Notifications
let toastTimer = null;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// Navigation
(function initScrollspy() {
  const sectionIds = ['hero', 'encoder', 'tree', 'decoder', 'info-theory', 'how-it-works', 'history'];
  const links      = document.querySelectorAll('.nav-links a');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
})();

// Animations
(function initScrollAnim() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { rootMargin: '0px 0px -80px 0px' });
  document.querySelectorAll('.flow-step').forEach(el => obs.observe(el));
})();

// section
(async function init() {
  try {
    const res = await fetch('./history.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && !loadSessions().length) saveSessions(data);
    }
  } catch {}

  renderHistory();

  const sessions = loadSessions();
  if (sessions.length) {
    const totalChars = sessions.reduce((a, s) => a + (s.metrics?.totalChars || 0), 0);
    const totalBits  = sessions.reduce((a, s) => a + (s.metrics?.savedBits  || 0), 0);
    document.getElementById('heroCharsEncoded').textContent = totalChars.toLocaleString();
    document.getElementById('heroBitsSaved').textContent    = totalBits.toLocaleString();
    document.getElementById('heroSessions').textContent     = sessions.length;
  }
})();
