# EEG BCI System - Mock Data Dependency Map

**Quick Reference Guide for EEGSim Function Dependencies**

---

## MOCK DATA FUNCTION REFERENCE

### EEGSim.generateSignal(samples, freq, noise)
**File:** `js/main.js` — Lines 131-138  
**Export:** `window.EEGSim.generateSignal()`  

**Direct Callers:** NONE (in current visible codebase)
- Exists but not directly invoked
- Functionally equivalent code is recreated as `generateTimeSeries()` in signal-transform.html

**Indirect Usage:** 
- signal-transform.html line 251: `generateTimeSeries()` recreates this logic locally

**Return Type:** `Float32Array | Array<number>` (256 samples)

---

### EEGSim.correlationScore()
**File:** `js/main.js` — Lines 140-145  
**Export:** `window.EEGSim.correlationScore()`  

**Direct Callers:**
1. **channel-selection.html:436** in `runSelection()` 
   ```javascript
   if (method === 'correlation') scores = window.EEGSim.correlationScore();
   ```

2. **channel-selection.html:443** in `runSelection()` (Embedded ML fallback)
   ```javascript
   else scores = window.EEGSim.correlationScore().map(s => ({...s, score: s.score * (0.8 + Math.random()*0.4)}));
   ```

**Downstream Functions:**
- `drawHeadMap(scores)` — Visualizes channels on head map
- `drawScoreChart(scores)` — Renders top 20 channels as bar chart
- `renderTable(scores, threshold)` — Displays full 30-row results table

**Return Type:** `Array<{channel: string, score: number, selected: boolean}>`

---

### EEGSim.mutualInfoScore()
**File:** `js/main.js` — Lines 147-152  
**Export:** `window.EEGSim.mutualInfoScore()`  

**Direct Callers:**
1. **channel-selection.html:437** in `runSelection()`
   ```javascript
   else if (method === 'mutual_info') scores = window.EEGSim.mutualInfoScore();
   ```

**Downstream Functions:**
- `drawHeadMap(scores)`
- `drawScoreChart(scores)`
- `renderTable(scores, threshold)`

**Return Type:** `Array<{channel: string, score: number, selected: boolean}>`

---

### EEGSim.anovaScore()
**File:** `js/main.js` — Lines 154-160  
**Export:** `window.EEGSim.anovaScore()`  

**Direct Callers:**
1. **channel-selection.html:438** in `runSelection()`
   ```javascript
   else if (method === 'anova') scores = window.EEGSim.anovaScore().map(s => ({...s, score: s.fStat/60}));
   ```

**Downstream Functions:**
- `drawHeadMap(scores)` — (score normalized to 0-1 range)
- `drawScoreChart(scores)` — (score normalized)
- `renderTable(scores, threshold)` — (score normalized)

**Return Type:** `Array<{channel: string, fStat: number, pValue: number, selected: boolean}>`  
**Processing:** fStat divided by 60 to normalize to 0-1 scale

---

### EEGSim.computeSNR(signal)
**File:** `js/main.js` — Lines 162-167  
**Export:** `window.EEGSim.computeSNR(signal)`  

**Direct Callers:** NONE (method unused in current codebase)

**Would-Be Usage:** Signal quality assessment  
**Alternative:** performance.html:236 generates random SNR instead:
```javascript
snr: (10 + Math.random() * 20).toFixed(2)
```

**Return Type:** `number` (dB value, typically 10-30)

---

### EEGSim.computeCompressionRatio(algorithm)
**File:** `js/main.js` — Lines 169-172  
**Export:** `window.EEGSim.computeCompressionRatio(algorithm)`  

**Direct Callers:**
1. **signal-transform.html:511** in `runTransform()`
   ```javascript
   const cr = window.EEGSim.computeCompressionRatio(algo).toFixed(2);
   ```
   - Parameter: `algo` → "FFT" | "DWT" | "STFT"
   - Result displayed in stats grid

2. **performance.html:237** in `generateMetrics()`
   ```javascript
   cr: window.EEGSim.computeCompressionRatio(algo).toFixed(2),
   ```
   - Called 3 times (once per algorithm)
   - Results used by: `drawCRChart()`, `drawRadarChart()`, `drawDetailTable()`

**Algorithm Ranges:**
- FFT: 4.2–6.2×
- DWT: 6.8–9.8×
- STFT: 2.1–3.6×

**Return Type:** `number` (compression multiplier)

**Threshold:** ≥ 3.0× for "RIGHT" classification

---

### EEGSim.computeTransferRate(algorithm)
**File:** `js/main.js` — Lines 174-177  
**Export:** `window.EEGSim.computeTransferRate(algorithm)`  

**Direct Callers:**
1. **signal-transform.html:512** in `runTransform()`
   ```javascript
   const tr = window.EEGSim.computeTransferRate(algo).toFixed(0);
   ```
   - Parameter: `algo` → "FFT" | "DWT" | "STFT"
   - Result displayed in stats grid

2. **performance.html:238** in `generateMetrics()`
   ```javascript
   tr: window.EEGSim.computeTransferRate(algo).toFixed(0)
   ```
   - Called 3 times (once per algorithm)
   - Results used by: `drawTRChart()`, `drawRadarChart()`, `drawDetailTable()`

**Algorithm Ranges:**
- FFT: 950–1150 bps
- DWT: 1100–1400 bps
- STFT: 780–980 bps

**Return Type:** `number` (bits per second)

**Threshold:** ≥ 800 bps for "RIGHT" classification

---

## FUNCTION CALL FLOW DIAGRAMS

### Channel Selection Page Flow

```
User Action: Select method + Click "Run"
        ↓
    runSelection()
    [channel-selection.html:421]
        ↓
    ┌───────────────────┬──────────────────┬──────────────┐
    ↓                   ↓                  ↓              ↓
correlation         mutual_info         anova         embedded
   ↓                   ↓                 ↓              ↓
EEGSim              EEGSim             EEGSim        EEGSim
correlation         mutualInfo         anova          correlation
Score()             Score()            Score()        Score()
   ↓                   ↓                 ↓              ↓
scores array (64 channels each)
    ↓
    ├─→ drawHeadMap(scores)
    │       ↓
    │   Canvas visualization
    │   (40 positioned electrodes)
    │
    ├─→ drawScoreChart(scores)
    │       ↓
    │   Chart.js bar chart
    │   (top 20 channels)
    │
    └─→ renderTable(scores, threshold)
            ↓
        HTML table (top 30)
        ↓
    Update: window.AppState.selectedChannels
```

### Signal Transform Page Flow

```
User Action: Select algorithm + Click "Apply Transform"
        ↓
    runTransform()
    [signal-transform.html:492]
        ↓
    Generate synthetic signal
    generateTimeSeries(256)
        ↓
    ┌────────────────────────┬────────────────────────┐
    ↓                        ↓                        ↓
EEGSim                  EEGSim                  Display
computeCompressionRatio computeTransferRate     Stats
(algo)                  (algo)
    ↓                        ↓
    └────────────────────────┴────────────────────────┐
            ↓
    Update stats panel:
    - SNR: 10 + random(0-20)
    - CR: algorithm-specific range
    - TR: algorithm-specific range
            ↓
    Save to: window.AppState.transformResults[algo]
            ↓
    Render: drawTimeChart(), drawFreqChart(), 
            drawBandsPanel(), drawCompareChart()
```

### Performance Metrics Page Flow

```
Page Load or User Click
        ↓
    runEvaluation()
    [performance.html:241]
        ↓
    generateMetrics()
    [Line 235]
        ↓
    For each of 3 algorithms (FFT, DWT, STFT):
    ┌────────────────────┬────────────────────┐
    ↓                    ↓                    ↓
    EEGSim          EEGSim              Random
    computeCR       computeTR           SNR gen
    (algo)          (algo)              [Line 236]
    ↓               ↓                   ↓
    └───────────────┴───────────────────┘
            ↓
    metrics = [
      {algo:"FFT", snr:X, cr:Y, tr:Z},
      {algo:"DWT", snr:X, cr:Y, tr:Z},
      {algo:"STFT", snr:X, cr:Y, tr:Z}
    ]
        ↓
    Threshold comparison:
    ├─ SNR ≥ 15 dB ?
    ├─ CR ≥ 3.0× ?
    └─ TR ≥ 800 bps ?
        ↓
    Render:
    ├─ animateValue() [3×] → update metric cards
    ├─ drawSNRChart(metrics)
    ├─ drawCRChart(metrics)
    ├─ drawTRChart()
    ├─ drawRadarChart(metrics)
    └─ drawDetailTable(metrics)
        ↓
    Save: window.AppState.metrics
        ↓
    Classification badges: PASS/FAIL for each metric
```

### Results Page Flow

```
User Click: "Generate All Results"
        ↓
    generateAll()
    [results.html:321]
        ↓
    Display 13-step progress
        ↓
    buildResultsData()
    [Line 382]
    └─ NO EEGSim calls
       Generates 12 rows:
       Loop through:
       - 4 selection methods
       - 3 algorithms
       └─ Random data:
          snr: 8 + random(0-22)
          cr: 1.5 + random(0-8)
          tr: 500 + random(0-900)
        ↓
    Threshold testing:
    For each of 12 rows:
    ├─ Check SNR ≥ 15
    ├─ Check CR ≥ 3.0
    └─ Check TR ≥ 800
    └─ RIGHT if all pass, WRONG if any fail
        ↓
    Render:
    ├─ renderTable(data) → 12-row matrix
    ├─ renderCharts(data) → pie + combo chart
    ├─ renderSummaryCards(data) → counts + best method
    └─ renderMethodSummary(data) → per-method cards
```

---

## PARAMETER & OUTPUT SPECIFICATIONS

### EEGSim.correlationScore() Output Structure

```javascript
[
  {
    channel: "Fp1",           // Channel name
    score: 0.45–1.0,          // Random correlation (0.4 + random*0.6)
    selected: true|false      // Random selection (40% probability: random > 0.6)
  },
  // ... 64 total
]
// Sorted descending by score
```

### EEGSim.mutualInfoScore() Output Structure

```javascript
[
  {
    channel: "Fp1",
    score: 0.2–1.0,           // Random MI value (0.2 + random*0.8)
    selected: true|false      // 35% probability (random > 0.65)
  },
  // ... 64 total
]
// Sorted descending by score
```

### EEGSim.anovaScore() Output Structure

```javascript
[
  {
    channel: "Fp1",
    fStat: 5–55,              // F-statistic (5 + random*50)
    pValue: 0–0.05,           // P-value (random*0.05)
    selected: true|false      // 40% probability (random > 0.6)
  },
  // ... 64 total
]
// Sorted descending by fStat
```

### EEGSim.computeCompressionRatio(algo) Return Values

```javascript
{
  "FFT":   4.2 + random(0-2)   → [4.2–6.2]
  "DWT":   6.8 + random(0-3)   → [6.8–9.8]  ← BEST
  "STFT":  2.1 + random(0-1.5) → [2.1–3.6]
}
```

### EEGSim.computeTransferRate(algo) Return Values

```javascript
{
  "FFT":   950 + random(0-200)   → [950–1150]
  "DWT":   1100 + random(0-300)  → [1100–1400] ← BEST
  "STFT":  780 + random(0-200)   → [780–980]
}
```

---

## CLASSIFICATION THRESHOLDS

### For "RIGHT" Classification
All three conditions must be TRUE:

| Metric | Operator | Threshold | Pass Examples |
|--------|----------|-----------|---|
| SNR | ≥ | 15 dB | 15.0, 20.5, 28.3 |
| Compression Ratio | ≥ | 3.0× | 3.0, 5.2, 8.9 |
| Transfer Rate | ≥ | 800 bps | 800, 1000, 1350 |

### Classification Logic (JavaScript)

```javascript
const SNR_T = 15, CR_T = 3.0, TR_T = 800;

const snrOk = snr >= SNR_T;
const crOk = cr >= CR_T;
const trOk = tr >= TR_T;

const isRIGHT = snrOk && crOk && trOk;  // ALL must be true
const isWRONG = !isRIGHT;               // ANY failure = WRONG
```

---

## STATE PERSISTENCE

### AppState Object Modifications

**Set in channel-selection.html:**
```javascript
// Line 262: File upload
window.AppState.dataset = file;

// Line 444: After runSelection()
window.AppState.selectedChannels = ['Fp1', 'Fp2', 'F3', ...]; // Array of selected channels
```

**Set in signal-transform.html:**
```javascript
// Line 530: After runTransform()
window.AppState.transformResults = {
  FFT: { snr: 15.2, cr: 5.1, tr: 1020 },
  DWT: { snr: 18.7, cr: 8.2, tr: 1250 },
  STFT: { snr: 12.4, cr: 2.9, tr: 850 }
};
```

**Set in performance.html:**
```javascript
// Line 269: After runEvaluation() & threshold comparison
window.AppState.metrics = {
  snr: 15.2,           // Average across 3 algos
  cr: 5.4,             // Average across 3 algos
  tr: 1040,            // Average across 3 algos
  pass: {
    snr: true,         // 15.2 >= 15 ✓
    cr: true,          // 5.4 >= 3.0 ✓
    tr: true           // 1040 >= 800 ✓
  },
  details: [
    {algo:"FFT", snr:14.8, cr:5.1, tr:970},
    {algo:"DWT", snr:18.7, cr:8.2, tr:1250},
    {algo:"STFT", snr:12.1, cr:2.9, tr:850}
  ]
};
```

---

## CROSS-FILE DEPENDENCIES

### JavaScript to HTML References

```
js/main.js
├─ Exported to window.EEGSim
│  └─ Used by: all 5 HTML pages (when appropriate)
│
├─ Exported to window.animateValue()
│  └─ Used by: performance.html (line 258-260)
│
└─ Exported to window.AppState
   └─ Used by: all pages for cross-page data sharing
```

### CSS Applied Across All Pages

```
css/main.css
├─ Design tokens (colors, fonts, spacing)
├─ Component classes (.btn-primary, .panel, .badge, etc.)
├─ Chart styling (for Chart.js containers)
├─ Responsive breakpoints
└─ Animation definitions (@keyframes)

Applied to:
├─ index.html
├─ pages/channel-selection.html
├─ pages/signal-transform.html
├─ pages/performance.html
└─ pages/results.html
```

### Chart.js Dependency

**Library:** `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`

**Used in Pages:**
- channel-selection.html (2 charts: headmap canvas + score bar chart)
- signal-transform.html (3 charts: time line + freq chart + compare line)
- performance.html (5 charts: SNR + CR + TR + radar + detail table)
- results.html (2 charts: pie + combo bar)

---

## EXECUTION TIMELINE

### Page Load Sequence

```
1. HTML loads
2. CSS loads (all styling applied)
3. Chart.js loads (if page uses charts)
4. js/main.js loads
   a. Brainwave canvas starts animating
   b. Nav active state set
   c. Tab system initialized
   d. Upload zones initialized
   e. EEGSim object initialized
   f. AppState initialized
   g. animateValue() exported
5. Page-specific inline scripts load
   a. Event listeners bound
   b. Initial visualizations rendered (if any)
6. Ready for user interaction
```

### Interaction Sequence Example (Channel Selection)

```
T=0:    User navigates to channel-selection.html
T=50:   Page loaded and rendered
T=100:  User selects "Mutual Information" method
T=150:  updateMethodDesc() displays MI description
T=500:  User changes n-channels to 20
T=800:  Display updates to "20 channels"
T=1200: User clicks "Run Channel Selection"
T=1250: runSelection() starts (setTimeout triggered)
T=1300: EEGSim.mutualInfoScore() called
T=1400: Returns 64 scored channels
T=1450: drawHeadMap() renders canvas
T=1500: drawScoreChart() renders Chart.js
T=1600: renderTable() populates DOM
T=2400: Button text changes to "✓ Done — Run Again"
T=2450: AppState.selectedChannels updated
```

---

## COMMONLY QUERIED PATHS

### "Where is [method] called?"

**Q: Where is correlationScore() called?**  
A: 
- channel-selection.html:436 (main path)
- channel-selection.html:443 (embedded ML fallback)

**Q: Where is computeCompressionRatio() called?**  
A:
- signal-transform.html:511 (display in transform stats)
- performance.html:237 (collect metrics for comparison)

**Q: Where is computeTransferRate() called?**  
A:
- signal-transform.html:512 (display in transform stats)
- performance.html:238 (collect metrics for comparison)

### "What data flows where?"

**Flow: User selects channel → What happens?**
1. Selection stored in `scores[i].selected` boolean
2. Filtered into `selectedChannels` array
3. Saved to `window.AppState.selectedChannels`
4. Available for next page in pipeline

**Flow: Algorithm metrics computed → Where used?**
1. Metrics array created by `generateMetrics()`
2. Threshold comparison performed (`SNR >= 15` etc.)
3. Badges rendered (PASS/FAIL)
4. Saved to `window.AppState.metrics`
5. Results page can access via AppState

---

## CODE SNIPPETS FOR REFERENCE

### Adding a New EEGSim Method

```javascript
// In js/main.js, within window.EEGSim = { ... }

newMethod(param1, param2) {
  return this.channels.map(channel => ({
    channel: channel,
    value: Math.random() * 100,
    metadata: param1 + param2
  }));
}
```

### Calling EEGSim from page

```javascript
// In page inline script
const results = window.EEGSim.newMethod(10, 20);
results.forEach(r => console.log(r.channel, r.value));
```

### Saving results to AppState

```javascript
window.AppState = window.AppState || {};
window.AppState.myData = results;
```

### Accessing cross-page data

```javascript
// From another page
if (window.AppState && window.AppState.myData) {
  console.log(window.AppState.myData);
}
```

---

**Last Updated:** Analysis Date: March 20, 2026  
**Reference Version:** v1.0.0
