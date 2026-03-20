# EEG BCI System - Event Handlers, Callbacks & Data Processing

**Comprehensive reference for event handling and data flow**

---

## TABLE OF CONTENTS

1. [Event Handler Registry](#event-handler-registry)
2. [Callback Chain Analysis](#callback-chain-analysis)
3. [Data Transformation Pipeline](#data-transformation-pipeline)
4. [Async Execution Flow](#async-execution-flow)
5. [Error & State Handling](#error--state-handling)
6. [Memory & Performance](#memory--performance)

---

## EVENT HANDLER REGISTRY

### Channel Selection Page (`channel-selection.html`)

#### **1. Method Selector Change Event**
**Element:** `select#method-select`  
**Event:** `change`  
**Handler:** `updateMethodDesc()`  
**Location:** Line 239  

```javascript
const methodSel = document.getElementById('method-select');
function updateMethodDesc() { 
  document.getElementById('method-desc').innerHTML = methodDesc[methodSel.value]; 
}
methodSel.addEventListener('change', updateMethodDesc);
updateMethodDesc();  // Initial call
```

**Actions:**
1. Gets current value from selector: `correlation` | `mutual_info` | `anova` | `embedded`
2. Looks up description from `methodDesc` object
3. Sets `.innerHTML` of `#method-desc` panel
4. Executed immediately on page load with default value

**Side Effects:** None (display only)

---

#### **2. N-Channels Slider Input Event**
**Element:** `input#n-channels` (range: 4-32)  
**Event:** `input`  
**Handler:** Inline arrow function  
**Location:** Line 232  

```javascript
const nSlider = document.getElementById('n-channels');
nSlider.addEventListener('input', () => { 
  document.getElementById('n-channels-val').textContent = nSlider.value + ' channels'; 
});
```

**Actions:**
1. Fires on every slider move
2. Updates display text with current value
3. No data model update yet

**Data Flow:** Slider value → Display only

---

#### **3. Threshold Slider Input Event**
**Element:** `input#threshold` (range: 0.1-1.0, step: 0.05)  
**Event:** `input`  
**Handler:** Inline arrow function  
**Location:** Line 233  

```javascript
const tSlider = document.getElementById('threshold');
tSlider.addEventListener('input', () => { 
  document.getElementById('threshold-val').textContent = parseFloat(tSlider.value).toFixed(2); 
});
```

**Actions:**
1. Fires on every slider move
2. Updates display with 2-decimal precision

**Data Flow:** Slider value → Display only

---

#### **4. Upload Zone Click Event**
**Element:** `div.upload-zone#uploadZone`  
**Event:** `click`  
**Handler:** Inline function triggering file input  
**Location:** Line 244  

```javascript
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
uploadZone.addEventListener('click', () => fileInput.click());
```

**Actions:**
1. Simulates click on hidden file input
2. Opens file selection dialog

**Side Effects:** Opens OS file dialog

---

#### **5. Upload Zone Dragover Event**
**Element:** `div.upload-zone#uploadZone`  
**Event:** `dragover`  
**Handler:** Inline function  
**Location:** Line 245  

```javascript
uploadZone.addEventListener('dragover', e => { 
  e.preventDefault(); 
  uploadZone.classList.add('drag-over'); 
});
```

**Actions:**
1. Prevents default browser behavior (file open)
2. Adds visual feedback class for CSS styling

**Side Effects:** Visual highlighting

---

#### **6. Upload Zone Dragleave Event**
**Element:** `div.upload-zone#uploadZone`  
**Event:** `dragleave`  
**Handler:** Inline function  
**Location:** Line 246  

```javascript
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
```

**Actions:**
1. Removes drag-over highlighting

**Side Effects:** Visual de-highlighting

---

#### **7. Upload Zone Drop Event** ⭐ KEY
**Element:** `div.upload-zone#uploadZone`  
**Event:** `drop`  
**Handler:** `handleFile()`  
**Location:** Line 247  

```javascript
uploadZone.addEventListener('drop', e => { 
  e.preventDefault(); 
  uploadZone.classList.remove('drag-over'); 
  handleFile(e.dataTransfer.files[0]); 
});
```

**Actions:**
1. Prevents default browser file handling
2. Extracts first file from dropped files
3. Calls `handleFile()` with File object

**Data Flow:** 
```
Drop Event
    ↓
File object extracted
    ↓
handleFile()
    ↓
AppState.dataset = file
Display updated
```

---

#### **8. File Input Change Event** ⭐ KEY
**Element:** `input#fileInput` (hidden file input)  
**Event:** `change`  
**Handler:** Inline with `handleFile()`  
**Location:** Line 248  

```javascript
fileInput.addEventListener('change', () => { 
  if (fileInput.files[0]) handleFile(fileInput.files[0]); 
});
```

**Actions:**
1. Checks if file was selected
2. Calls `handleFile()` with selected file

**Data Flow:** Same as drop event

---

#### **9. handleFile() Function** ⭐ KEY
**Location:** Lines 262-272  

```javascript
function handleFile(file) {
  // 1. Update UI elements
  document.querySelector('#uploadZone .upload-title').textContent = '✓ ' + file.name;
  document.querySelector('#uploadZone .upload-sub').textContent = 
    (file.size/1024).toFixed(1) + ' KB loaded';
  uploadZone.style.borderColor = 'var(--green)';
  uploadZone.style.background = 'var(--green-dim)';
  
  // 2. Show file info panel
  const info = document.getElementById('file-info');
  info.style.display = 'block';
  
  // 3. Populate file metadata
  document.getElementById('file-name').textContent = file.name;
  document.getElementById('file-meta').textContent = 
    `Size: ${(file.size/1024).toFixed(1)} KB  |  64 channels detected  |  256 Hz`;
  
  // 4. Save to global state
  window.AppState = window.AppState || {};
  window.AppState.dataset = file;
}
```

**Side Effects:**
- 5 DOM updates
- 1 global state modification
- Visual feedback

**Callback Chain:**
```
handleFile()
├─ Update zone title/sub/colors
├─ Show file-info panel
├─ Update file-name and file-meta displays
└─ Set window.AppState.dataset
```

---

#### **10. Run Selection Button Click Event** ⭐ KEY
**Element:** `button#run-btn` with `onclick` attribute  
**Event:** `click`  
**Handler:** `runSelection()` (via onclick)  
**Location:** Line 221 (button), Function at 421  

```html
<button class="btn-primary" id="run-btn" onclick="runSelection()" ...>
  <span>Run Channel Selection</span>
</button>
```

```javascript
function runSelection() {
  const method = methodSel.value;
  const nCh = parseInt(nSlider.value);
  const threshold = parseFloat(tSlider.value);
  const btn = document.getElementById('run-btn');
  
  // Set loading state
  btn.innerHTML = '<span class="spinner"></span><span>Processing...</span>';
  btn.disabled = true;

  // Async execution
  setTimeout(() => {
    // Call mock data based on method
    let scores;
    if (method === 'correlation') 
      scores = window.EEGSim.correlationScore();
    else if (method === 'mutual_info') 
      scores = window.EEGSim.mutualInfoScore();
    else if (method === 'anova') 
      scores = window.EEGSim.anovaScore().map(s => ({...s, score: s.fStat/60}));
    else 
      scores = window.EEGSim.correlationScore().map(s => ({...s, score: s.score * (0.8 + Math.random()*0.4)}));

    // Mark top N as selected
    scores.forEach((s, i) => { s.selected = i < nCh; });
    selectedChannels = scores.filter(s => s.selected).map(s => s.channel);
    
    // Update global state
    window.AppState = window.AppState || {};
    window.AppState.selectedChannels = selectedChannels;

    // Render visualizations
    drawHeadMap(scores);
    drawScoreChart(scores);
    renderTable(scores, threshold);

    // Update UI
    btn.innerHTML = '<span>✓ Done — Run Again</span>';
    btn.disabled = false;

    // Show results panels
    document.getElementById('results-panel').style.display = 'block';
    document.getElementById('selected-panel').style.display = 'block';
    document.getElementById('selected-count').textContent = nCh + ' channels selected';

    // Render channel tags
    const tagsEl = document.getElementById('channel-tags');
    tagsEl.innerHTML = '';
    scores.forEach((s, i) => {
      const tag = document.createElement('span');
      tag.className = 'ch-tag' + (s.selected ? (i < 5 ? ' best' : ' selected') : '');
      tag.textContent = s.channel;
      tagsEl.appendChild(tag);
    });
  }, 1200);  // 1.2 second delay for simulated processing
}
```

**Callback Chain:**
```
User clicks button
    ↓
runSelection() triggered
    ↓
1. Button state: disabled, spinner shown
2. setTimeout(..., 1200ms) queued
    ↓
[After delay...]
    ↓
1. Call EEGSim method based on selection
2. Mark top N channels as selected
3. Update AppState.selectedChannels
4. Call visualization functions:
   ├─ drawHeadMap(scores)
   ├─ drawScoreChart(scores)
   └─ renderTable(scores, threshold)
5. Update button state
6. Show results panels
7. Generate channel tags
    ↓
Complete
```

---

### Signal Transform Page (`signal-transform.html`)

#### **1. Algorithm Selector Change Event**
**Element:** `select#algo-select`  
**Event:** `change`  
**Handler:** `updateAlgoParams()`  
**Location:** Line 241  

```javascript
const algoSel = document.getElementById('algo-select');
function updateAlgoParams() {
  const v = algoSel.value;  // Get algorithm: FFT | DWT | STFT
  
  // Show/hide algorithm-specific parameter panels
  document.getElementById('fft-params').style.display = v === 'FFT' ? '' : 'none';
  document.getElementById('dwt-params').style.display = v === 'DWT' ? '' : 'none';
  document.getElementById('stft-params').style.display = v === 'STFT' ? '' : 'none';
  
  // Update algorithm description
  document.getElementById('algo-desc').innerHTML = algoDesc[v];
  
  // Update chart labels
  document.getElementById('freq-label').textContent = v + ' Output';
  document.getElementById('freq-title').textContent = 
    v === 'STFT' ? 'Spectrogram — Time-Frequency Power' 
                 : 'Power Spectral Density (dB) vs Frequency (Hz)';
}
algoSel.addEventListener('change', updateAlgoParams);
updateAlgoParams();  // Initial call
```

**Actions:**
1. Gets selected algorithm value
2. Conditionally shows parameter panels
3. Updates description and labels

**Side Effects:** 3 DOM updates + visibility changes

---

#### **2. STFT Overlap Slider Input Event**
**Element:** `input#stft-overlap` (range: 0-90%)  
**Event:** `input`  
**Handler:** Inline arrow function  
**Location:** Line 242  

```javascript
const overlapSlider = document.getElementById('stft-overlap');
overlapSlider && overlapSlider.addEventListener('input', () => { 
  document.getElementById('overlap-val').textContent = overlapSlider.value + '%'; 
});
```

**Actions:**
1. Updates display value
2. Only shown when STFT algorithm selected

**Data Flow:** Slider → Display

---

#### **3. Transform Button Click Event** ⭐ KEY
**Element:** `button#transform-btn` with `onclick` attribute  
**Handler:** `runTransform()`  
**Location:** Line 232 (button), Function at 492  

```javascript
function runTransform() {
  const algo = algoSel.value;  // Get selected algorithm
  const btn = document.getElementById('transform-btn');
  
  // Set loading state
  btn.innerHTML = '<span class="spinner"></span><span>Transforming...</span>';
  btn.disabled = true;

  setTimeout(() => {
    // 1. Generate synthetic signal
    const signal = generateTimeSeries(256);
    
    // 2. Get metrics from EEGSim
    const snr = (10 + Math.random() * 15).toFixed(2);
    const cr = window.EEGSim.computeCompressionRatio(algo).toFixed(2);
    const tr = window.EEGSim.computeTransferRate(algo).toFixed(0);
    
    // 3. Draw visualizations
    drawTimeChart(signal);
    drawFreqChart(algo, signal);
    drawBandsPanel(signal);
    
    // 4. Update stats panel
    document.getElementById('stats-grid').innerHTML = `
      <div class="metric-card">
        <span class="metric-value" style="font-size:1.5rem;">${snr}</span>
        <span class="metric-label">SNR (dB)</span>
      </div>
      <div class="metric-card">
        <span class="metric-value" style="font-size:1.5rem;">${cr}x</span>
        <span class="metric-label">Comp. Ratio</span>
      </div>
      <div class="metric-card">
        <span class="metric-value" style="font-size:1.5rem;">${tr}</span>
        <span class="metric-label">Transfer Rate (bps)</span>
      </div>
    `;
    
    // 5. Show panels
    document.getElementById('stats-panel').style.display = 'block';
    document.getElementById('bands-panel').style.display = 'block';
    document.getElementById('compare-panel').style.display = 'block';
    
    // 6. Draw comparison chart
    drawCompareChart();

    // 7. Save to state
    window.AppState = window.AppState || {};
    window.AppState.transformResults = window.AppState.transformResults || {};
    window.AppState.transformResults[algo] = { 
      snr: parseFloat(snr), 
      cr: parseFloat(cr), 
      tr: parseInt(tr) 
    };

    // 8. Reset button
    btn.innerHTML = '<span>✓ Done — Run Again</span>';
    btn.disabled = false;
  }, 1000);  // 1 second delay
}
```

**Callback Chain:**
```
User clicks button
    ↓
runTransform() triggered
    ↓
Button locked, spinner shown
    ↓
[After 1 second...]
    ↓
1. Generate synthetic signal
2. Call EEGSim methods:
   ├─ computeCompressionRatio(algo)
   └─ computeTransferRate(algo)
3. Call visualization functions:
   ├─ drawTimeChart(signal)
   ├─ drawFreqChart(algo, signal)
   ├─ drawBandsPanel(signal)
   └─ drawCompareChart()
4. Update DOM with metric values
5. Show result panels
6. Save to AppState.transformResults
7. Reset button state
    ↓
Complete
```

---

### Performance Page (`performance.html`)

#### **1. Evaluate Button Click Event** ⭐ KEY
**Element:** `button#eval-btn` with `onclick` attribute  
**Handler:** `runEvaluation()`  
**Location:** Line 183 (button), Function at 241  

```javascript
function runEvaluation() {
  const btn = document.getElementById('eval-btn');
  
  // Lock button with loading state
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;

  setTimeout(() => {
    // 1. Generate metrics for all 3 algorithms
    const metrics = generateMetrics();
    
    // 2. Calculate averages
    const avgSNR = (metrics.reduce((s, m) => s + parseFloat(m.snr), 0) / 3);
    const avgCR = (metrics.reduce((s, m) => s + parseFloat(m.cr), 0) / 3);
    const avgTR = (metrics.reduce((s, m) => s + parseFloat(m.tr), 0) / 3);

    // 3. Animate metric cards
    animateValue(document.getElementById('snr-val'), 0, avgSNR, 800, 2);
    animateValue(document.getElementById('cr-val'), 0, avgCR, 800, 2);
    animateValue(document.getElementById('tr-val'), 0, avgTR, 800, 0);

    // 4. Threshold comparison
    const snrOk = avgSNR >= SNR_THRESH;  // 15 dB
    const crOk = avgCR >= CR_THRESH;      // 3.0×
    const trOk = avgTR >= TR_THRESH;      // 800 bps

    // 5. Update badges
    document.getElementById('snr-badge').innerHTML = 
      `<span class="badge badge-${snrOk?'right':'wrong'}">${snrOk?'PASS':'FAIL'}</span>`;
    document.getElementById('cr-badge').innerHTML = 
      `<span class="badge badge-${crOk?'right':'wrong'}">${crOk?'PASS':'FAIL'}</span>`;
    document.getElementById('tr-badge').innerHTML = 
      `<span class="badge badge-${trOk?'right':'wrong'}">${trOk?'PASS':'FAIL'}</span>`;

    // 6. Calculate percentages
    const snrPct = Math.min(100, (avgSNR / 30 * 100)).toFixed(0);
    const crPct = Math.min(100, (avgCR / 10 * 100)).toFixed(0);
    const trPct = Math.min(100, (avgTR / 1500 * 100)).toFixed(0);

    // 7. Update progress bars
    setTimeout(() => {
      document.getElementById('snr-bar').style.width = snrPct + '%';
      document.getElementById('snr-bar').style.background = snrOk ? 'var(--green)' : 'var(--red)';
      document.getElementById('cr-bar').style.width = crPct + '%';
      document.getElementById('cr-bar').style.background = crOk ? 'var(--green)' : 'var(--amber)';
      document.getElementById('tr-bar').style.width = trPct + '%';
      document.getElementById('tr-bar').style.background = trOk ? 'var(--green)' : 'var(--red)';
    }, 200);

    // 8. Render all charts
    drawSNRChart(metrics);
    drawCRChart(metrics);
    drawTRChart();
    drawRadarChart(metrics);
    drawDetailTable(metrics);

    // 9. Save to state
    window.AppState = window.AppState || {};
    window.AppState.metrics = { 
      snr: avgSNR, 
      cr: avgCR, 
      tr: avgTR, 
      pass: { snr: snrOk, cr: crOk, tr: trOk }, 
      details: metrics 
    };

    // 10. Reset button
    btn.innerHTML = 'Evaluate Performance';
    btn.disabled = false;
  }, 1100);  // 1.1 second delay
}
```

**Callback Chain Breakdown:**

```
User clicks button
    ↓
runEvaluation() triggered
    ↓
[Async @ T=1100ms...]
    ↓
1. generateMetrics()
   ├─ For FFT: EEGSim.computeCompressionRatio("FFT")
   ├─ For FFT: EEGSim.computeTransferRate("FFT")
   ├─ For DWT: EEGSim.computeCompressionRatio("DWT")
   ├─ For DWT: EEGSim.computeTransferRate("DWT")
   ├─ For STFT: EEGSim.computeCompressionRatio("STFT")
   └─ For STFT: EEGSim.computeTransferRate("STFT")
   └─ Returns array of 3 metric objects
    ↓
2. Calculate averages across 3 algorithms
    ↓
3. Animate metric card values:
   ├─ animateValue(snr-val, 0→avgSNR, 800ms)
   ├─ animateValue(cr-val, 0→avgCR, 800ms)
   └─ animateValue(tr-val, 0→avgTR, 800ms)
    ↓
4. Threshold comparison:
   if (avgSNR >= 15) snrOk = true
   if (avgCR >= 3.0) crOk = true
   if (avgTR >= 800) trOk = true
    ↓
5. Update badges (PASS/FAIL)
    ↓
6. Calculate percentage values
    ↓
[After 200ms delay...]
    ↓
7. Animate progress bars to final widths
    ↓
8. Render all charts:
   ├─ drawSNRChart(metrics)
   ├─ drawCRChart(metrics)
   ├─ drawTRChart()
   ├─ drawRadarChart(metrics)
   └─ drawDetailTable(metrics)
    ↓
9. Save results to AppState.metrics
    ↓
10. Reset button to normal state
    ↓
Complete
```

#### **2. Page Load Auto-Run Event**
**Handler:** Page load with `setTimeout`  
**Location:** Line 536  

```javascript
// Auto-run on load
setTimeout(runEvaluation, 300);
```

**Actions:**
1. Waits 300ms after page loads
2. Automatically calls `runEvaluation()`
3. No user interaction required

**Purpose:** Immediately show users performance data on page load

---

#### **3. animateValue() Utility Function**
**Location:** js/main.js, lines 202-213  
**Export:** `window.animateValue()`  

```javascript
function animateValue(el, start, end, duration, decimals = 0) {
  const range = end - start;
  const startTime = performance.now();
  
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function: cubic ease-out
    const ease = 1 - Math.pow(1 - progress, 3);
    
    // Update element text
    el.textContent = (start + range * ease).toFixed(decimals);
    
    // Continue animation or stop
    if (progress < 1) requestAnimationFrame(update);
  }
  
  requestAnimationFrame(update);
}
```

**Usage in performance.html:**
```javascript
animateValue(document.getElementById('snr-val'), 0, 18.5, 800, 2);
// Animates element from 0 to 18.5 over 800ms with 2 decimals
```

---

### Results Page (`results.html`)

#### **1. Generate Button Click Event** ⭐ KEY
**Element:** `button#gen-btn` with `onclick` attribute  
**Handler:** `generateAll()`  
**Location:** Line 234 (button), Function at 321  

```javascript
function generateAll() {
  const btn = document.getElementById('gen-btn');
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;

  // Show progress panel
  const pp = document.getElementById('progress-panel');
  const stepsEl = document.getElementById('progress-steps');
  pp.style.display = 'block';
  stepsEl.innerHTML = '';

  // 13 processing steps
  const steps = [
    'Loading dataset...',
    'Applying Correlation-Based selection...',
    'Applying Mutual Information selection...',
    'Applying ANOVA F-Score selection...',
    'Applying Embedded ML selection...',
    'Running FFT transformation...',
    'Running DWT transformation...',
    'Running STFT transformation...',
    'Computing SNR metrics...',
    'Computing Compression Ratios...',
    'Computing Transfer Rates...',
    'Classifying results...',
    'Generating report...'
  ];

  // Step-by-step execution with visual feedback
  let i = 0;
  function runStep() {
    if (i >= steps.length) {
      finishAnalysis();  // ← Key callback
      return;
    }
    
    const step = document.createElement('div');
    step.style.cssText = 'display:flex;align-items:center;...';
    step.innerHTML = `<span class="spinner" ...></span><span>${steps[i]}</span>`;
    stepsEl.appendChild(step);
    stepsEl.scrollTop = stepsEl.scrollHeight;
    
    setTimeout(() => {
      // Change spinner to checkmark
      step.querySelector('.spinner').outerHTML = `<span style="color:var(--green);">✓</span>`;
      step.style.color = 'var(--text-dim)';
      
      i++;
      runStep();  // Recursive call for next step
    }, 180 + Math.random() * 200);
  }
  
  runStep();  // Start execution
}
```

**Callback Chain:**
```
User clicks button
    ↓
generateAll() triggered
    ↓
Button locked, progress panel shown
    ↓
runStep() called recursively
    ├─ For each of 13 steps:
    │  ├─ Create progress item
    │  ├─ Wait 180-380ms (random)
    │  ├─ Update item to checkmark
    │  └─ Recursive call to runStep()
    ↓
[After all 13 steps...]
    ↓
finishAnalysis() called
```

#### **2. finishAnalysis() Callback** ⭐ KEY
**Location:** Line 364  

```javascript
function finishAnalysis() {
  // 1. Generate results data
  const data = buildResultsData();
  
  // 2. Render all visualizations
  renderTable(data);
  renderCharts(data);
  renderSummaryCards(data);
  renderMethodSummary(data);

  // 3. Show result panels
  document.getElementById('summary-cards').style.display = 'grid';
  document.getElementById('full-table-panel').style.display = 'block';
  document.getElementById('charts-row').style.display = 'grid';
  document.getElementById('best-decision-panel').style.display = 'block';
  document.getElementById('method-summary-panel').style.display = 'block';

  // 4. Reset button
  const btn = document.getElementById('gen-btn');
  btn.innerHTML = 'Generate All Results';
  btn.disabled = false;
}
```

---

## DATA TRANSFORMATION PIPELINE

### Input → Processing → Output Flow

#### **Channel Selection Pipeline**

```
USER INPUT
├─ Method select: "correlation" | "mutual_info" | "anova" | "embedded"
├─ N-channels slider: 4-32
├─ Threshold slider: 0.1-1.0
└─ File upload: File object (optional)
    ↓
PROCESSING (setTimeout 1200ms)
├─ Call EEGSim method
│  └─ Returns 64 channel objects with scores
├─ Filter top N channels
│  └─ Set selected = true for top N
├─ Create visualization data
│  ├─ Channel positions (headmap)
│  ├─ Top 20 scores (chart)
│  └─ Top 30 for table
└─ Build DOM elements
    ↓
OUTPUT
├─ Update: AppState.selectedChannels[]
├─ Display: Head map canvas
├─ Display: Chart.js bar chart
├─ Display: Results table
└─ Display: Channel tags
    ↓
STATE SAVED
└─ window.AppState.selectedChannels accessible to next page
```

#### **Signal Transform Pipeline**

```
USER INPUT
├─ Algorithm select: "FFT" | "DWT" | "STFT"
├─ Channel select: 15 choices
└─ Algorithm-specific parameters
    ↓
PROCESSING (setTimeout 1000ms)
├─ Generate synthetic signal: 256 samples
├─ Call EEGSim methods
│  ├─ computeCompressionRatio(algo)
│  └─ computeTransferRate(algo)
├─ Create frequency domain data
│  ├─ FFT: Magnitude spectrum
│  ├─ DWT: Band powers
│  └─ STFT: Spectrogram
├─ Analyze brainwave bands
│  ├─ Delta, Theta, Alpha, Beta, Gamma
│  └─ Power per band
└─ Compare all three algorithms
    ↓
OUTPUT
├─ Display: Time domain chart (all)
├─ Display: Frequency domain chart (algorithm-specific)
├─ Display: Band power bars
├─ Display: Algorithm comparison
└─ Display: Stats grid (SNR, CR, TR)
    ↓
STATE SAVED
└─ window.AppState.transformResults[algo] = {snr, cr, tr}
```

#### **Performance Metrics Pipeline**

```
USER INPUT (or auto-trigger)
├─ Selection method
├─ Transform algorithm
└─ Channel count
    ↓
PROCESSING (setTimeout 1100ms)
├─ Call generateMetrics()
│  ├─ For FFT:
│  │  ├─ Call EEGSim. computeCompressionRatio("FFT")
│  │  ├─ Call EEGSim.computeTransferRate("FFT")
│  │  └─ Add random SNR
│  ├─ For DWT: [same pattern]
│  └─ For STFT: [same pattern]
├─ Aggregate results (average across 3)
├─ Compare thresholds
│  ├─ SNR >= 15 dB?
│  ├─ CR >= 3.0×?
│  └─ TR >= 800 bps?
├─ Animate metric cards (800ms)
├─ Generate chart data
│  ├─ SNR bar chart
│  ├─ CR bar chart
│  ├─ TR line chart
│  ├─ Radar chart
│  └─ Detail table
└─ Save to AppState.metrics
    ↓
OUTPUT
├─ Metric cards (animated numbers)
├─ Progress bars (animated width)
├─ Badges (PASS/FAIL per metric)
├─ 5 charts (Chart.js instances)
└─ Color coding (green=pass, red/amber=fail)
    ↓
STATE SAVED
└─ window.AppState.metrics includes pass/fail decisions
```

#### **Results Compilation Pipeline**

```
USER INPUT
└─ Click "Generate All Results"
    ↓
PROCESSING
├─ Progress steps (13 total, 180-380ms each)
│  └─ ~3-5 seconds total display
├─ buildResultsData()
│  ├─ 4 selection methods × 3 transform algorithms
│  ├─ 12 total combinations
│  └─ Per row:
│     ├─ Random SNR: 8-30 dB
│     ├─ Random CR: 1.5-9.5×
│     ├─ Random TR: 500-1400 bps
│     └─ Classification: ALL thresholds met = RIGHT
├─ Render visualizations
│  ├─ renderTable(data) → 12 rows
│  ├─ renderCharts(data) → Pie + Combo bar
│  ├─ renderSummaryCards(data) → 3 metric cards
│  └─ renderMethodSummary(data) → 4 method cards
└─ Populate decision box
    ↓
OUTPUT
├─ Complete results matrix
├─ Decision distribution (pie chart)
├─ SNR comparison (bar chart)
├─ Best method recommendation
├─ Method performance summary
└─ Detailed explanation text
    ↓
FINAL STATE
└─ All analysis complete, user can review full report
```

---

## ASYNC EXECUTION FLOW

### Event Loop & setTimeout Usage

```javascript
T=0ms:      User interaction triggers event
T=0-5ms:    Event handler function begins
T=1-10ms:   setState/UI updates
T=10-50ms:  setTimeout(..., delayMs) queued
T=50-1000ms: Other code executes, browser stays responsive
T=1000ms:   Event loop checks setTimeout callbacks
T=1000-1100ms: Callback executes with updated DOM context
T=1100ms:   Callback completes, returns to main loop
```

### Why setTimeout is Used

1. **UI Responsiveness:** Prevents blocking main thread
2. **Visual Feedback:** Loading spinners can display
3. **Realistic Simulation:** Mimics actual processing time
4. **Animation:** Allows for easing functions (animateValue)

### Delays by Page

| Page | Delay | Purpose |
|------|-------|---------|
| channel-selection | 1200ms | Selection processing + visualization |
| signal-transform | 1000ms | Transform computation |
| performance | 1100ms | Metric generation + animation |
| results | 180-380ms per step (13×) | Progress indication (~3-5s total) |

---

## ERROR & STATE HANDLING

### Current Error Handling

⚠️ **Minimal Error Handling** (Areas of risk):

1. **File Upload:**
   ```javascript
   if (fileInput.files[0]) handleFile(fileInput.files[0]);
   // Only checks if file exists, no type/size validation
   ```

2. **Method Selection:**
   ```javascript
   let scores;
   if (method === 'correlation') scores = ...
   else if (method === 'mutual_info') scores = ...
   // Falls through to default if method unexpected
   ```

3. **Chart Rendering:**
   - Charts not destroyed if page changes
   - Memory leak risk: multiple Chart instances

4. **AppState Access:**
   ```javascript
   window.AppState = window.AppState || {};  // Safe
   window.AppState.transformResults = window.AppState.transformResults || {};  // Safe
   ```

### Global State Dependencies

**Flow across pages:**
```
Page 1: Set AppState.dataset
  ↓
[User navigates]
  ↓
Page 2: Read/set AppState.selectedChannels
  ↓
[User navigates]
  ↓
Page 3: Read selectednChain, set transformResults
  ↓
[User navigates]
  ↓
Page 4: Read metrics, compute decisions
```

⚠️ **Risk:** Navigating directly to page 4 will have incomplete AppState

---

## MEMORY & PERFORMANCE

### DOM Operations per Function

| Function | DOM Reads | DOM Writes | Graph Renders |
|----------|-----------|------------|---|
| runSelection() | 7 | 12+ | 3 |
| runTransform() | 8 | 15+ | 4 |
| runEvaluation() | 10 | 20+ | 5 |
| generateAll() | 15 | 50+ | 2 |

### Memory Impacts

1. **Chart.js Instances:**
   - Each chart allocates ~100-200KB
   - Performance page: 5 charts = 500KB-1MB
   - Results page: 2 charts = 200-400KB
   - ⚠️ Charts not explicitly destroyed between recreations

2. **Array Storage:**
   - correlationScore(): 64 objects × ~200 bytes = 12.8KB
   - Full results matrix: 12 rows × ~500 bytes = 6KB
   - Minimal impact

3. **Canvas Rendering:**
   - Brainwave animation: Runs continuously
   - Head map: Single draw per interaction
   - Minimal performance impact on modern browsers

### Performance Optimization Suggestions

```javascript
// Before creating new chart:
if (chartInstance) chartInstance.destroy();

// Chart cleanup:
Chart.helpers.each(Chart.instances, function(instance){
  instance.destroy();
});

// Memory-efficient event delegation:
document.addEventListener('click', function(e) {
  if (e.target.matches('.chart-container')) {
    // Handle click
  }
});
```

---

## CALLBACK DEPENDENCY TREE

### Complete Event → Action → State Tree

```
index.html
├─ (No callbacks - static page)

channel-selection.html
├─ methodSel.change → updateMethodDesc()
├─ nSlider.input → Update display text
├─ tSlider.input → Update display text
├─ uploadZone.click → fileInput.click()
├─ uploadZone.dragover → classList.add('drag-over')
├─ uploadZone.dragleave → classList.remove('drag-over')
├─ uploadZone.drop → handleFile()
├─ fileInput.change → handleFile()
└─ runButton.click → runSelection()
        ├─ EEGSim.correlationScore() | mutualInfoScore() | anovaScore()
        ├─ drawHeadMap(scores)
        ├─ drawScoreChart(scores)
        └─ renderTable(scores, threshold)

signal-transform.html
├─ algoSel.change → updateAlgoParams()
├─ overlapSlider.input → Update display text
└─ transformButton.click → runTransform()
        ├─ generateTimeSeries()
        ├─ EEGSim.computeCompressionRatio(algo)
        ├─ EEGSim.computeTransferRate(algo)
        ├─ drawTimeChart(signal)
        ├─ drawFreqChart(algo, signal)
        ├─ drawBandsPanel(signal)
        └─ drawCompareChart()

performance.html
├─ [Auto] page.load → setTimeout(runEvaluation, 300)
└─ evalButton.click → runEvaluation()
        ├─ generateMetrics()
        │   ├─ EEGSim.computeCompressionRatio(algo) × 3
        │   └─ EEGSim.computeTransferRate(algo) × 3
        ├─ animateValue(el, start, end, 800, decimals) × 3
        ├─ [Threshold comparison]
        ├─ setTimeout(..., 200) → Update progress bars
        ├─ drawSNRChart(metrics)
        ├─ drawCRChart(metrics)
        ├─ drawTRChart()
        ├─ drawRadarChart(metrics)
        └─ drawDetailTable(metrics)

results.html
└─ generateButton.click → generateAll()
        └─ runStep() [recursive] × 13
                └─ finishAnalysis()
                        ├─ buildResultsData()
                        ├─ renderTable(data)
                        ├─ renderCharts(data)
                        ├─ renderSummaryCards(data)
                        └─ renderMethodSummary(data)
```

---

**End of Event Handlers & Callbacks Analysis**
