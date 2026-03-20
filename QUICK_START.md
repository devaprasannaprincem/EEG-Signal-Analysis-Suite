# Quick Start Guide — Real Processing

## 5-Minute Setup

### 1. Open the Application
- Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
- You should see the NeuroSync dashboard with 4 analysis modules

### 2. Create Test Data (Optional)

Save as `test_eeg.csv`:
```csv
Cz,Fz,Pz,C3,C4
2.3,-1.5,0.8,1.2,-0.9
2.5,-1.3,1.1,1.4,-0.7
2.1,-1.7,0.5,1.0,-1.1
1.9,-1.2,0.9,1.3,-0.8
2.4,-1.6,0.7,1.1,-1.0
2.2,-1.4,1.0,1.2,-0.9
2.0,-1.8,0.6,0.9,-1.2
2.6,-1.1,0.9,1.5,-0.6
2.3,-1.5,0.8,1.2,-0.9
2.5,-1.3,1.1,1.4,-0.7
```

### 3. Run Analysis

**Step 1: Upload Data**
1. Click "Begin Analysis" on dashboard
2. Navigate to "Channel Selection" tab
3. Drag & drop `test_eeg.csv` onto the upload zone
4. Confirm file loads (should show channel count)

**Step 2: Select Channels**
1. Choose "Correlation-Based Selection" from dropdown
2. Keep defaults (16 channels, 0.50 threshold)
3. Click "Run Channel Selection"
4. View results table, head map, and channel scores

**Step 3: Transform Signals**
1. Click "Signal Transform" tab
2. Select "FFT" algorithm
3. Choose "Cz" channel
4. Click "Apply Transform"
5. View time-domain and frequency-domain plots

**Step 4: Check Metrics**
1. Click "Performance" tab
2. Click "Evaluate Performance"
3. View SNR, Compression Ratio, Transfer Rate
4. Check PASS/FAIL status

**Step 5: Compare**
1. Click "Results" tab
2. Click "Generate All Results"
3. See all method combinations rated as RIGHT/WRONG
4. Find best recommendation

---

## What You'll See

### Channel Selection
- **Head Map**: Electrode positions colored by score (cyan=top, green=selected)
- **Score Chart**: Bar chart of top 20 channels ranked
- **Results Table**: Detailed metrics for each channel

### Signal Transform
- **Time Domain**: Raw signal waveform
- **Frequency Domain**: Power spectrum from FFT/DWT/STFT
- **Band Power**: Energy in EEG frequency bands (delta, theta, alpha, beta, gamma)
- **Algorithm Comparison**: All three methods overlaid

### Performance Metrics
- **SNR Card**: Signal quality (target ≥ 15 dB)
- **Compression Card**: Data efficiency (target ≥ 3.0×)
- **Transfer Rate Card**: Throughput (target ≥ 800 bps)
- **Radar Chart**: Multi-dimensional comparison

### Results & Decisions
- **RIGHT/WRONG**: Pass/fail classification
- **Decision Matrix**: All 12 combinations (4 selection × 3 transforms)
- **Best Recommendation**: Top-scoring combination
- **Detailed Breakdown**: Why best choice was selected

---

## Understanding the Thresholds

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| SNR ≥ 15 dB | Required | Signal is clean enough for BCI |
| CR ≥ 3.0× | Required | Data compresses efficiently |
| TR ≥ 800 bps | Required | Can transmit in real-time |

All three must be **PASS** for overall **RIGHT** classification.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Please upload an EEG dataset first!" | Go to Channel Selection and drag file onto upload zone |
| No data appears after upload | Check CSV format (comma-separated, first row = channel names) |
| Metrics show "—" | Make sure data is uploaded before clicking evaluate |
| FFT shows no peaks | Signal might be too short or too noisy - try longer CSV |
| Buttons don't respond | Wait for spinner to finish (1-2 seconds) |

---

## Sample Data Generator

To create realistic test data programmatically:

```javascript
// Run in browser console on any page after loading
const signal1 = Array.from({length: 512}, (_, i) => {
  const t = i / 256;
  return 2.5 * Math.sin(2*Math.PI*10*t) +    // 10 Hz alpha
         1.2 * Math.sin(2*Math.PI*20*t) +    // 20 Hz beta
         (Math.random()-0.5)*0.5;            // noise
});
const signal2 = signal1.map(x => x * 0.9 + (Math.random()-0.5)*0.3);
const signal3 = signal1.map(x => x * 0.8 + (Math.random()-0.5)*0.4);

const csv = 'Cz,Fz,Pz\n' +
  Array.from({length: 500}, (_, i) => 
    `${signal1[i].toFixed(3)},${signal2[i].toFixed(3)},${signal3[i].toFixed(3)}`
  ).join('\n');

// Copy the CSV content
console.log(csv);
```

---

## Browser Requirements

- **Minimum:** Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features used:**
  - FileReader API (file upload)
  - Canvas (animations, head map)
  - Chart.js (visualizations)
  - CSS Grid/Flexbox
  
All modern browsers from 2018+ are supported.

---

## Tips for Best Results

1. **Data format:** Ensure CSV has channel names as first row
2. **Sample size:** Use at least 256 samples per channel (1 second @ 256 Hz)
3. **Channels:** 8+ channels recommended for good statistics
4. **Real data:** Use actual EEG recordings for meaningful results
5. **Clean data:** Pre-process to remove artifacts if possible

---

## What Gets Computed Locally

All processing happens **in the browser** — no server required:
- ✅ CSV parsing
- ✅ FFT computation
- ✅ Statistical analysis (ANOVA, MI, correlation)
- ✅ Metric calculations
- ✅ Chart rendering

**Privacy:** Your data never leaves your machine!

---

## Next Steps

After confirming real processing works:
1. Try with your own EEG data
2. Experiment with different selection methods
3. Compare FFT vs DWT vs STFT outputs
4. Note which combinations achieve RIGHT classification
5. Optimize channel selection and transform parameters

---

**Happy analyzing!** 🧠⬡
