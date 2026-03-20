# EEG BCI System - Comprehensive Codebase Analysis

**Project:** NeuroSync — EEG BCI Analysis System  
**Analysis Date:** March 20, 2026  
**Codebase Overview:** 5 HTML pages, 1 shared JavaScript library, 1 CSS stylesheet

---

## TABLE OF CONTENTS
1. [HTML Structure Overview](#html-structure-overview)
2. [JavaScript Architecture](#javascript-architecture)
3. [EEGSim Mock Data System](#eegsim-mock-data-system)
4. [Function Dependencies](#function-dependencies)
5. [Mock Data Call Dependency Map](#mock-data-call-dependency-map)
6. [Event Handlers & Callbacks](#event-handlers--callbacks)
7. [Data Structures & State Management](#data-structures--state-management)
8. [CSS Structure](#css-structure)

---

## HTML STRUCTURE OVERVIEW

### 1. **index.html** (Dashboard Landing Page)
**Location:** `c:\Users\princ\Downloads\eeg-bci-system\index.html`

**Purpose:** Main dashboard/hero page with system introduction

**Key Elements:**
- Navigation bar with links to all modules
- 4 analysis module cards (Channel Selection, Signal Transform, Performance, Results)
- Processing pipeline visualization
- Application domains showcase
- Statistics bar (64 channels, 4 methods, 3 algorithms, 3 metrics)

**External Dependencies:**
- `js/main.js` (line 359 in file)
- `css/main.css`

**No page-specific inline scripts** — uses only shared library functions

---

### 2. **pages/channel-selection.html** (Channel Selection Module)
**Location:** `c:\Users\princ\Downloads\eeg-bci-system\pages\channel-selection.html`

**Purpose:** Channel selection using 4 statistical/ML methods

**Key Elements:**
- File upload zone (drag & drop)
- Method selector (4 options)
- Number of channels slider (4-32)
- Threshold score slider (0.1-1.0)
- EEG head map visualization (canvas)
- Channel scores bar chart
- Results table with 30+ channels
- Selected channels summary tags

**Inline Script Functions:**
- `handleFile(file)` — Stores file in AppState (line 267)
- `drawHeadMap(scores)` — Renders electrode positions on head map (line 319)
- `drawScoreChart(scores)` — Chart.js bar chart of top 20 channels (line 401)
- `runSelection()` — Main execution function (line 421)
- `renderTable(scores, threshold)` — Populates results table (line 459)

**Event Handlers:**
- Method selector change → `updateMethodDesc()` (line 239)
- N-channels slider input → Updates display text (line 232)
- Threshold slider input → Updates display text (line 233)
- Upload zone click/drag/drop → `handleFile()` (line 244)
- Run button click → `onclick="runSelection()"` (line 221)

**EEGSim Dependencies:**
- `window.EEGSim.correlationScore()` — Line 436 in runSelection()
- `window.EEGSim.mutualInfoScore()` — Line 437 in runSelection()
- `window.EEGSim.anovaScore()` — Line 438 in runSelection()

---

### 3. **pages/signal-transform.html** (Signal Transform Module)
**Location:** `c:\Users\princ\Downloads\eeg-bci-system\pages\signal-transform.html`

**Purpose:** Time-frequency domain transformation using FFT, DWT, STFT

**Key Elements:**
- Algorithm selector (FFT, DWT, STFT)
- Channel selector (15 EEG channels)
- Algorithm-specific parameter panels
- Time domain signal chart
- Frequency domain chart (changes by algorithm)
- Brainwave band power visualization
- All-three-algorithms comparison chart

**Inline Script Functions:**
- `updateAlgoParams()` — Shows/hides algo-specific params (line 243)
- `generateTimeSeries(samples)` — Creates synthetic EEG signal (line 251)
- `computeFFT(signal)` — Manual FFT implementation (line 260)
- `computeDWT(signal)` — DWT band simulation (line 281)
- `computeSTFT(signal)` — STFT spectrogram simulation (line 287)
- `drawTimeChart(signal)` — Chart.js line chart (line 301)
- `drawFreqChart(algo, signal)` — Algorithm-specific frequency chart (line 327)
- `drawBandsPanel(signal)` — Brainwave band power bars (line 434)
- `drawCompareChart()` — Three-algorithm comparison (line 467)
- `runTransform()` — Main execution function (line 492)

**Event Handlers:**
- Algorithm selector change → `updateAlgoParams()` (line 241)
- Overlap slider input → Updates display (line 242)
- Transform button click → `onclick="runTransform()"` (line 232)

**EEGSim Dependencies:**
- `window.EEGSim.computeCompressionRatio(algo)` — Line 511
- `window.EEGSim.computeTransferRate(algo)` — Line 512

---

### 4. **pages/performance.html** (Performance Metrics Module)
**Location:** `c:\Users\princ\Downloads\eeg-bci-system\pages\performance.html`

**Purpose:** Evaluate SNR, Compression Ratio, Transfer Rate across algorithms

**Key Elements:**
- Configuration panel (3 dropdowns)
- Metric cards (SNR, CR, TR with progress bars)
- Threshold reference table
- SNR comparison bar chart
- Compression ratio bar chart
- Transfer rate line chart
- Radar chart (6-axis performance)
- Detailed results table

**Constants:**
- `SNR_THRESH = 15` (line 232)
- `CR_THRESH = 3.0` (line 232)
- `TR_THRESH = 800` (line 232)

**Inline Script Functions:**
- `generateMetrics()` — Creates 3 algo metrics (line 235)
- `runEvaluation()` — Main execution with animation (line 241)
- `drawSNRChart(metrics)` — Bar chart with threshold line (line 274)
- `drawCRChart(metrics)` — Compression ratio bar chart (line 285)
- `drawTRChart()` — Transfer rate line chart (line 298)
- `drawRadarChart(metrics)` — 6-axis radar chart (line 321)
- `drawDetailTable(metrics)` — Results table with badges (line 338)

**Event Handlers:**
- Evaluate button click → `onclick="runEvaluation()"` (line 183)
- Auto-run animation with `animateValue()` (lines 258-260)

**EEGSim Dependencies:**
- `window.EEGSim.computeCompressionRatio(algo)` — Line 237
- `window.EEGSim.computeTransferRate(algo)` — Line 238

---

### 5. **pages/results.html** (Results & Decisions Module)
**Location:** `c:\Users\princ\Downloads\eeg-bci-system\pages\results.html`

**Purpose:** Complete comparison matrix and automatic RIGHT/WRONG classification

**Key Elements:**
- Generate full analysis report panel
- Progress indicator (13 steps)
- Summary metric cards
- Complete results matrix table (12 rows: 4 methods × 3 algorithms)
- Decision distribution pie chart
- SNR by method combination bar chart
- Best method recommendation box
- Per-method performance summary (4 cards)

**Constants:**
- `SNR_T = 15, CR_T = 3.0, TR_T = 800` (line 316)
- `selMethods = ['Correlation', 'Mutual Info', 'ANOVA', 'Embedded ML']` (line 317)
- `transforms = ['FFT', 'DWT', 'STFT']` (line 318)

**Inline Script Functions:**
- `generateAll()` — Main execution with progress steps (line 321)
- `finishAnalysis()` — Renders all results (line 364)
- `buildResultsData()` — Creates 12-row dataset (line 380)
- `renderTable(data)` — Populates results matrix (line 396)
- `renderSummaryCards(data)` — Updates metric cards (line 425)
- `renderCharts(data)` — Pie & combo charts (line 448)
- `renderMethodSummary(data)` — Per-method cards (line 484)

**Event Handlers:**
- Generate button click → `onclick="generateAll()"` (line 296)

**EEGSim Dependencies:** None directly (generates random data instead)

---

## JAVASCRIPT ARCHITECTURE

### File Structure
**Location:** `c:\Users\princ\Downloads\eeg-bci-system\js\main.js`  
**Total Lines:** 337  
**Sections:** 7 distinct code blocks

### Global Scope Exports

#### 1. **Brainwave Canvas Animation** (Lines 1-49)
- IIFE (Immediately Invoked Function Expression)
- Renders animated background waveforms on `#brainwave-canvas`
- 5 sine-wave overlays with varying frequencies
- Responsive to window resize
- **No EEGSim dependencies**

#### 2. **Navigation Active State** (Lines 51-62)
- IIFE
- Sets `.active` class on current page nav link
- Parses URL pathname
- **No EEGSim dependencies**

#### 3. **Tab System** (Lines 64-82)
- `initTabs()` function
- Handles tab switching via `data-tab` attributes
- Adds/removes `.active` classes
- **No EEGSim dependencies**

#### 4. **File Upload & Drag/Drop** (Lines 84-119)
- `initUploadZones()` — Sets up all `.upload-zone` elements
- `handleFileUpload(file, zone)` — Stores file globally and dispatches event
- Click, dragover, dragleave, drop handlers
- Stores file in `window.uploadedFile`, `window.uploadedFileName`
- Dispatches `fileUploaded` CustomEvent
- **No EEGSim dependencies**

#### 5. **EEGSim Mock Data System** (Lines 121-200) ⭐ **KEY**
```javascript
window.EEGSim = {
  channels: [64 channel names],
  generateSignal(samples, freq, noise),
  correlationScore(),
  mutualInfoScore(),
  anovaScore(),
  computeSNR(signal),
  computeCompressionRatio(algorithm),
  computeTransferRate(algorithm)
}
```

#### 6. **Animation Utilities** (Lines 202-213)
- `animateValue(el, start, end, duration, decimals)` — Easing counter animation
- Exported to `window.animateValue`
- Used by performance.html for metric cards
- **No EEGSim dependencies**

#### 7. **Shared Application State** (Lines 215-223)
```javascript
window.AppState = {
  dataset: null,
  selectedMethod: 'correlation',
  selectedChannels: [],
  transformResults: {},
  metrics: {}
}
```

---

## EEGSIM MOCK DATA SYSTEM

### Location
Lines **121-200** in `js/main.js`

### Methods Overview

#### **1. `EEGSim.generateSignal(samples = 256, freq = 10, noise = 0.3)`**
**Lines 131-138**

**Description:** Generates synthetic EEG signal with multiple frequency components

**Parameters:**
- `samples` (default 256) — Number of samples to generate
- `freq` (default 10) — Base frequency (Hz)
- `noise` (default 0.3) — Noise amplitude multiplier

**Output:** Array of 256 float samples

**Algorithm:**
```
signal[i] = sin(2π × 10 × t)          [fundamental]
          + 0.5 × sin(2π × 20 × t)    [harmonic 2]
          + 0.25 × sin(2π × 40 × t)   [harmonic 4]
          + noise × (random - 0.5)    [noise]
```

**Usage Locations:**
- **signal-transform.html** line 251 (`generateTimeSeries()` — calls indirectly)
- Not directly called in current codebase

---

#### **2. `EEGSim.correlationScore()`**
**Lines 140-145**

**Description:** Generates correlation scores for all 64 channels

**Output:** Array of 64 objects:
```javascript
{
  channel: "Fp1",
  score: [0.4 to 1.0],
  selected: [true/false]
}
```
Sorted descending by score

**Algorithm:**
- Random score between 0.4-1.0 per channel
- 40% probability of selection (random > 0.6)

**Usage Locations:**
- **channel-selection.html** line 436 in `runSelection()`
  ```javascript
  if (method === 'correlation') scores = window.EEGSim.correlationScore();
  ```
- **channel-selection.html** line 443 (fallback in embedded ML)
  ```javascript
  else scores = window.EEGSim.correlationScore().map(s => ({...s, score: s.score * (0.8 + Math.random()*0.4)}));
  ```

---

#### **3. `EEGSim.mutualInfoScore()`**
**Lines 147-152**

**Description:** Generates mutual information scores for all 64 channels

**Output:** Array of 64 objects:
```javascript
{
  channel: "Fp1",
  score: [0.2 to 1.0],
  selected: [true/false]
}
```
Sorted descending by score

**Algorithm:**
- Random score between 0.2-1.0 per channel
- 35% probability of selection (random > 0.65)

**Usage Locations:**
- **channel-selection.html** line 437 in `runSelection()`
  ```javascript
  else if (method === 'mutual_info') scores = window.EEGSim.mutualInfoScore();
  ```

---

#### **4. `EEGSim.anovaScore()`**
**Lines 154-160**

**Description:** Generates ANOVA F-statistics for all 64 channels

**Output:** Array of 64 objects:
```javascript
{
  channel: "Fp1",
  fStat: [5 to 55],
  pValue: [0 to 0.05],
  selected: [true/false]
}
```
Sorted descending by fStat

**Algorithm:**
- Random F-statistic between 5-55 per channel
- Random p-value between 0-0.05
- 40% probability of selection (random > 0.6)

**Usage Locations:**
- **channel-selection.html** line 438 in `runSelection()`
  ```javascript
  else if (method === 'anova') scores = window.EEGSim.anovaScore().map(s => ({...s, score: s.fStat/60}));
  ```

---

#### **5. `EEGSim.computeSNR(signal)`**
**Lines 162-167**

**Description:** Calculates Signal-to-Noise Ratio from signal array

**Input:** Signal array (typically 256 samples)

**Output:** SNR value in dB (float)

**Algorithm:**
```
signal_power = Σ(signal[i]²) / length
noise = signal[i] + (random - 0.5) × 0.1
noise_power = Σ(noise[i]²) / length
SNR(dB) = 10 × log₁₀(signal_power / noise_power)
```

**Usage Locations:** Currently unused in visible codebase

---

#### **6. `EEGSim.computeCompressionRatio(algorithm)`**
**Lines 169-172**

**Description:** Generates compression ratio for specific algorithm

**Input:** Algorithm name ("FFT", "DWT", "STFT")

**Output:** Compression ratio value (float)

**Algorithm:**
```
FFT:  4.2 + random(0-2)    = [4.2 to 6.2]
DWT:  6.8 + random(0-3)    = [6.8 to 9.8]
STFT: 2.1 + random(0-1.5)  = [2.1 to 3.6]
```

**Usage Locations:**
- **signal-transform.html** line 511 in `runTransform()`
  ```javascript
  const cr = window.EEGSim.computeCompressionRatio(algo).toFixed(2);
  ```
- **performance.html** line 237 in `generateMetrics()`
  ```javascript
  cr: window.EEGSim.computeCompressionRatio(algo).toFixed(2),
  ```

---

#### **7. `EEGSim.computeTransferRate(algorithm)`**
**Lines 174-177**

**Description:** Generates transfer rate for specific algorithm

**Input:** Algorithm name ("FFT", "DWT", "STFT")

**Output:** Transfer rate in bits-per-second (float)

**Algorithm:**
```
FFT:  950 + random(0-200)   = [950 to 1150 bps]
DWT:  1100 + random(0-300)  = [1100 to 1400 bps]
STFT: 780 + random(0-200)   = [780 to 980 bps]
```

**Usage Locations:**
- **signal-transform.html** line 512 in `runTransform()`
  ```javascript
  const tr = window.EEGSim.computeTransferRate(algo).toFixed(0);
  ```
- **performance.html** line 238 in `generateMetrics()`
  ```javascript
  tr: window.EEGSim.computeTransferRate(algo).toFixed(0)
  ```

---

## FUNCTION DEPENDENCIES

### Dependency Graph: EEGSim Methods → Calling Functions

```
┌─────────────────────────────────────────────────────────────┐
│              EEGSim Mock Data Functions                      │
└─────────────────────────────────────────────────────────────┘
            ↓               ↓              ↓
    ┌───────────────┬──────────────┬─────────────────┐
    │               │              │                 │
    ↓               ↓              ↓                 ↓
correlationScore()  mutualInfoScore()  anovaScore()   computeSNR()
    │               │              │
    └───────────────┴──────────────┘
            ↓
    runSelection()
    (channel-selection.html:421)
            ↓
    ├─ drawHeadMap(scores)
    ├─ drawScoreChart(scores)
    └─ renderTable(scores, threshold)


computeCompressionRatio()  ←  runTransform()
                            ←  generateMetrics()
                                   ↓
        computeTransferRate()  ←─┘
```

---

## MOCK DATA CALL DEPENDENCY MAP

### Complete Cross-Reference: Line Numbers & Functions

#### **CHANNEL-SELECTION.HTML**
```
runSelection() [Line 421]
├─ Calls: window.EEGSim.correlationScore()      [Line 436]
├─ Calls: window.EEGSim.mutualInfoScore()       [Line 437]
├─ Calls: window.EEGSim.anovaScore()            [Line 438]
├─ Calls: window.EEGSim.correlationScore()      [Line 443] (embedded ML fallback)
└─ Then calls:
   ├─ drawHeadMap(scores)     [Line 445]
   ├─ drawScoreChart(scores)  [Line 446]
   └─ renderTable(scores)     [Line 447]
```

**Flow:**
1. User selects method from dropdown (correlation/mutual_info/anova/embedded)
2. User clicks "Run Channel Selection" button
3. `runSelection()` executes setTimeout → calls appropriate EEGSim scoring function
4. Scores array passed to visualization functions
5. Results displayed in headmap, chart, and table

---

#### **SIGNAL-TRANSFORM.HTML**
```
runTransform() [Line 492]
├─ Calls: window.EEGSim.computeCompressionRatio(algo)  [Line 511]
├─ Calls: window.EEGSim.computeTransferRate(algo)      [Line 512]
└─ Then calls:
   ├─ drawTimeChart(signal)    [Line 507]
   ├─ drawFreqChart(algo)      [Line 508]
   ├─ drawBandsPanel(signal)   [Line 509]
   └─ drawCompareChart()       [Line 516]
```

**Flow:**
1. User selects algorithm (FFT/DWT/STFT)
2. User clicks "Apply Transform" button
3. `runTransform()` executes setTimeout → generates synthetic time-series
4. Calls `computeCompressionRatio()` and `computeTransferRate()` with selected algo
5. Results displayed in stats panel
6. Three algorithms automatically compared

---

#### **PERFORMANCE.HTML**
```
runEvaluation() [Line 241]
├─ Calls: generateMetrics() [Line 249]
│  ├─ Returns array of 3 objects (FFT, DWT, STFT)
│  └─ Each object calls:
│     ├─ window.EEGSim.computeCompressionRatio(algo)  [Line 237]
│     └─ window.EEGSim.computeTransferRate(algo)      [Line 238]
├─ Calls: animateValue() [Lines 258-260]
├─ Compares metrics against thresholds:
│  ├─ SNR_THRESH = 15 dB
│  ├─ CR_THRESH = 3.0×
│  └─ TR_THRESH = 800 bps
└─ Then calls:
   ├─ drawSNRChart(metrics)    [Line 271]
   ├─ drawCRChart(metrics)     [Line 272]
   ├─ drawTRChart()            [Line 273]
   ├─ drawRadarChart(metrics)  [Line 274]
   └─ drawDetailTable(metrics) [Line 275]
```

**Flow:**
1. Page loads → `setTimeoutrunEvaluation()` triggers after 300ms (auto-run feature)
   - OR user clicks "Evaluate Performance"
2. `generateMetrics()` creates metric set by calling EEGSim methods 3 times
3. Metrics compared against hardcoded thresholds
4. Badges updated (PASS/FAIL)
5. Progress bars animated with `animateValue()`
6. Charts regenerated with new data
7. State saved to `window.AppState.metrics`

---

#### **RESULTS.HTML**
```
generateAll() [Line 321]
├─ Progress steps displayed (13 steps)
├─ NO DIRECT EEGSim CALLS (uses pure random data)
└─ Then calls:
   ├─ buildResultsData()      [Line 382]
   │  └─ Generates 12 rows (4 methods × 3 algorithms)
   │     with random SNR/CR/TR values
   ├─ renderTable(data)       [Line 383]
   ├─ renderCharts(data)      [Line 384]
   ├─ renderSummaryCards(data) [Line 385]
   └─ renderMethodSummary(data) [Line 386]
```

**Note:** Results page does NOT call EEGSim methods. Instead:
- Generates random data in `buildResultsData()` loop
- Creates 12-row matrix: 4 selection methods × 3 transform algorithms
- Each row has randomly generated metrics
- Classifications based on thresholds matching performance.html

---

## EVENT HANDLERS & CALLBACKS

### Channel-Selection.html

| Event | Handler | Action |
|-------|---------|--------|
| Method select change | `updateMethodDesc()` | Updates method description panel |
| N-channels slider input | Inline arrow function | Updates label: "16 channels" |
| Threshold slider input | Inline arrow function | Updates label: "0.50" |
| Upload zone click | `fileInput.click()` | Opens file browser |
| Upload zone dragover | `.classList.add('drag-over')` | Visual feedback |
| Upload zone dragleave | `.classList.remove('drag-over')` | Reset visual |
| Upload zone drop | `handleFile()` | Process dropped file |
| File input change | `handleFile()` | Process selected file |
| **Run button click** | `onclick="runSelection()"` | **Main execution** |

### Signal-Transform.html

| Event | Handler | Action |
|-------|---------|--------|
| Algorithm select change | `updateAlgoParams()` | Shows/hides algo-specific panels |
| Overlap slider input | Updates label: "50%" | Visual feedback |
| **Transform button click** | `onclick="runTransform()"` | **Main execution** |

### Performance.html

| Event | Handler | Action |
|-------|---------|--------|
| **Evaluate button click** | `onclick="runEvaluation()"` | **Main execution** |
| Page load (document ready) | `setTimeout(runEvaluation, 300)` | **Auto-run** |

### Results.html

| Event | Handler | Action |
|-------|---------|--------|
| **Generate button click** | `onclick="generateAll()"` | **Main execution** |

---

## DATA STRUCTURES & STATE MANAGEMENT

### Window.AppState (Global Shared State)
**Location:** `js/main.js` lines 215-223

```javascript
window.AppState = {
  dataset: null,              // File object from upload
  selectedMethod: 'correlation',  // Last selected method
  selectedChannels: [],       // Array of selected channel names
  transformResults: {},       // Object with algo results
  metrics: {}                 // Performance metrics object
}
```

**Usage Locations:**
1. **channel-selection.html line 262** — Set `AppState.dataset`
2. **channel-selection.html line 444** — Set `AppState.selectedChannels`
3. **signal-transform.html line 530** — Set `AppState.transformResults[algo]`
4. **performance.html line 269** — Set `AppState.metrics`

### Channel Positions Map
**Location:** channel-selection.html line 307

```javascript
const chPos = {
  'Fp1': [-0.18, -0.85],
  'Fp2': [0.18, -0.85],
  // ... 38 more entries
  'TP10': [0.87, 0.35]
}
```
Total: 40 channel positions (10-20 system coordinates)

### Algorithm Descriptions
**Stored in:** Each page has local copy

- **channel-selection.html** — 4 method descriptions (correlation, mutual_info, anova, embedded)
- **signal-transform.html** — 3 algorithm descriptions (FFT, DWT, STFT)

---

## CSS STRUCTURE

### File Location
`c:\Users\princ\Downloads\eeg-bci-system\css\main.css`

### Design System

#### **Color Palette (CSS Variables)**
```css
--bg: #030810                    /* Deep navy background */
--cyan: #00c8ff                  /* Primary: bright cyan */
--green: #00ff9d                 /* Success: neon green */
--red: #ff3d5a                   /* Error: hot pink-red */
--amber: #ffc400                 /* Warning: gold */
--text: #e0eeff                  /* Primary text: light blue */
--text-dim: rgba(180,210,255,...)  /* Secondary text */
```

#### **Typography**
- **Display Font:** Orbitron (monospace sci-fi)
- **Mono Font:** Space Mono (technical readouts)
- **Body Font:** DM Sans (interface text)

#### **Key Component Classes**
```css
.navbar               /* Sticky top nav */
.nav-link            /* Nav items with hover states */
.panel               /* Content cards with borders */
.btn-primary         /* CTA buttons (cyan) */
.btn-ghost           /* Secondary buttons */
.badge              /* Status indicators (right/wrong/cyan) */
.metric-card        /* Stats display boxes */
.metric-value       /* Large metric numbers */
.progress-bar       /* Performance indicator bars */
.data-table         /* Results tables with alternating rows */
.upload-zone        /* Drag-drop file input */
.chart-wrap         /* Chart.js container */
.grid-2, .grid-3    /* CSS grid layouts */
```

#### **Responsive Design**
- Flexbox-based layouts
- Media queries for mobile (if any)
- Fixed navbar with 60px height
- Max-width container: 1200px for content

#### **Animation/Effects**
- `pulse-dot` animation (nav status indicator)
- Backdrop blur on navbar
- Box shadows for depth
- Gradient backgrounds (subtle)
- Smooth transitions (0.2s timing)

---

## COMPREHENSIVE DEPENDENCY SUMMARY

### Functions Depending on EEGSim.generateSignal()
**Current Usage:** NOT DIRECTLY CALLED
- Referenced in signal-transform.html but wrapped in `generateTimeSeries()`
- Indirectly used by chart rendering functions

### Functions Depending on EEGSim.correlationScore()
1. **runSelection()** — channel-selection.html:436
   - Condition: `method === 'correlation'`
   - Output used by: drawHeadMap(), drawScoreChart(), renderTable()

2. **runSelection()** — channel-selection.html:443 (fallback)
   - Condition: `method === 'embedded'`
   - Modified with variance: `score * (0.8 + Math.random() * 0.4)`

### Functions Depending on EEGSim.mutualInfoScore()
1. **runSelection()** — channel-selection.html:437
   - Condition: `method === 'mutual_info'`
   - Output used by: drawHeadMap(), drawScoreChart(), renderTable()

### Functions Depending on EEGSim.anovaScore()
1. **runSelection()** — channel-selection.html:438
   - Condition: `method === 'anova'`
   - Score normalized: `score: s.fStat/60` (divides F-stat by 60)
   - Output used by: drawHeadMap(), drawScoreChart(), renderTable()

### Functions Depending on EEGSim.computeCompressionRatio()
1. **runTransform()** — signal-transform.html:511
   - Called with: `algo` parameter (FFT, DWT, or STFT)
   - Results stored in stats panel
   - Saved to: `window.AppState.transformResults[algo]`

2. **generateMetrics()** — performance.html:237
   - Called for each of 3 algorithms
   - Returns array used by: drawCRChart(), drawRadarChart()

3. **drawDetailTable()** — performance.html (implicitly)
   - Displays metrics from generateMetrics() call

### Functions Depending on EEGSim.computeTransferRate()
1. **runTransform()** — signal-transform.html:512
   - Called with: `algo` parameter (FFT, DWT, or STFT)
   - Results stored in stats panel

2. **generateMetrics()** — performance.html:238
   - Called for each of 3 algorithms
   - Returns array used by: drawTRChart(), drawRadarChart()

### Functions Depending on EEGSim.computeSNR()
**Current Usage:** NOT DIRECTLY CALLED IN VISIBLE CODEBASE
- Method exists but not invoked
- Alternative: SNR generated as random value in `generateMetrics()`
  ```javascript
  snr: (10 + Math.random() * 20).toFixed(2)  // Line 236
  ```

---

## CALL HIERARCHY DIAGRAM

```
Page Load (index.html)
├─ Main JS loads (line 359)
│  ├─ Brainwave animation starts
│  ├─ Nav active state set
│  ├─ Tab system initialized
│  ├─ Upload zones initialized
│  └─ Returns

User Navigation → channel-selection.html
├─ Main JS loads (with brainwave, nav, etc.)
├─ Inline scripts execute
│  ├─ Method descriptions loaded
│  ├─ Sliders bound
│  └─ File upload handlers bound
└─ User clicks "Run Channel Selection"
   └─ runSelection() [Line 421]
      ├─ Calls: EEGSim.correlationScore() OR mutualInfoScore() OR anovaScore()
      ├─ Returns: Array of 64 channel scores
      ├─ Calls: drawHeadMap(scores) → Canvas render
      ├─ Calls: drawScoreChart(scores) → Chart.js render
      ├─ Calls: renderTable(scores, threshold) → DOM table
      └─ Updates: AppState.selectedChannels

User Navigation → signal-transform.html
├─ Main JS loads
├─ Inline scripts execute
└─ User clicks "Apply Transform"
   └─ runTransform() [Line 492]
      ├─ Generates: generateTimeSeries()
      ├─ Calls: EEGSim.computeCompressionRatio(algo)
      ├─ Calls: EEGSim.computeTransferRate(algo)
      ├─ Calls: drawTimeChart()
      ├─ Calls: drawFreqChart()
      ├─ Calls: drawBandsPanel()
      ├─ Calls: drawCompareChart()
      └─ Updates: AppState.transformResults

User Navigation → performance.html
├─ Main JS loads
├─ AUTO-RUN: setTimeout(runEvaluation, 300) [Line 536]
   OR
├─ User clicks "Evaluate Performance"
   └─ runEvaluation() [Line 241]
      ├─ Calls: generateMetrics() [Line 249]
      │  ├─ Returns array of 3 algo metrics
      │  └─ Each entry calls:
      │     ├─ EEGSim.computeCompressionRatio(algo)
      │     └─ EEGSim.computeTransferRate(algo)
      ├─ Calls: animateValue() 3× for metrics
      ├─ Threshold comparison (SNR/CR/TR)
      ├─ Calls: drawSNRChart()
      ├─ Calls: drawCRChart()
      ├─ Calls: drawTRChart()
      ├─ Calls: drawRadarChart()
      ├─ Calls: drawDetailTable()
      └─ Updates: AppState.metrics

User Navigation → results.html
├─ Main JS loads
└─ User clicks "Generate All Results"
   └─ generateAll() [Line 321] — NO EEGSim CALLS
      ├─ Progress indicator (13 steps)
      ├─ Calls: buildResultsData() [Line 382]
      │  └─ Generates 12 rows with random data
      ├─ Calls: renderTable(data)
      ├─ Calls: renderCharts(data) → pie + combo chart
      ├─ Calls: renderSummaryCards(data)
      └─ Calls: renderMethodSummary(data)
```

---

## THRESHOLD CONSTANTS

Located in **performance.html** (line 232):

```javascript
const SNR_THRESH = 15;      // Signal-to-Noise Ratio minimum
const CR_THRESH = 3.0;      // Compression Ratio minimum
const TR_THRESH = 800;      // Transfer Rate minimum (bps)
```

**Classification Logic:**
- **Decision = "RIGHT"** if ALL three conditions met:
  - SNR ≥ 15 dB
  - CR ≥ 3.0×
  - TR ≥ 800 bps

- **Decision = "WRONG"** if ANY condition fails

---

## SUMMARY STATISTICS

| Metric | Count |
|--------|-------|
| HTML Pages | 5 |
| Shared JS Functions | 7 main blocks |
| EEGSim Methods | 7 |
| Page-Specific Inline Scripts | 5 |
| EEG Channels (simulated) | 64 |
| Channel Positions Mapped | 40 |
| Selection Methods | 4 |
| Transform Algorithms | 3 |
| Performance Metrics | 3 |
| Evaluation Combinations | 12 (4×3) |
| CSS Custom Properties | 15+ |
| Chart.js Charts Used | 8+ |
| Global State Objects | 1 (AppState) |

---

## KEY FINDINGS

✅ **Well-Organized:** Each page has single responsibility  
✅ **Centralized Mock Data:** All simulations via EEGSim object  
✅ **Predictable Random Ranges:** Clear value ranges per metric  
✅ **Progressive Workflow:** Dashboard → Selection → Transform → Performance → Results  
✅ **Consistent Theming:** Unified design language across pages  

⚠️ **Points of Attention:**
- EEGSim.computeSNR() not currently used (SNR generated as random)
- EEGSim.generateSignal() exists but not directly called
- Results page generates independent random data (not using performance metrics)
- No error handling for invalid file uploads

---

**End of Analysis**
