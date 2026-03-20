# EEG Signal Analysis Suite

A browser-based EEG + BCI analysis platform for channel selection, signal transformation, performance benchmarking, and final decision reporting.

## Overview

EEG Signal Analysis Suite is a multi-page frontend project that lets you:

1. Upload EEG datasets (`.csv`, `.txt`, `.edf`)
2. Select relevant EEG channels using statistical methods
3. Transform signals (FFT, DWT-style, STFT)
4. Compute performance metrics (SNR, Compression Ratio, Transfer Rate)
5. Compare method combinations and classify results as RIGHT/WRONG

Everything runs client-side in the browser.

## Features

- Modern multi-page dashboard UI
- EEG file upload support:
  - CSV
  - TXT
  - EDF (binary parser)
- Channel selection methods:
  - Correlation-based
  - Mutual Information
  - ANOVA F-score
  - Embedded ML (UI option)
- Signal transform module:
  - FFT
  - DWT-style comparison visualization
  - STFT
- Metrics module:
  - SNR (dB)
  - Compression ratio
  - Transfer rate (bps)
- Results matrix with threshold-based RIGHT/WRONG decisions
- Session persistence of uploaded data across pages

## Project Structure

```text
.
├── index.html
├── css/
│   └── main.css
├── js/
│   ├── main.js
│   └── signal-processing.js
├── pages/
│   ├── channel-selection.html
│   ├── signal-transform.html
│   ├── performance.html
│   └── results.html
├── QUICK_START.md
├── REAL_PROCESSING_IMPLEMENTATION.md
├── CODEBASE_ANALYSIS.md
├── MOCK_DATA_DEPENDENCIES.md
└── EVENTS_AND_CALLBACKS.md
```

## Getting Started

### 1. Clone repository

```bash
git clone https://github.com/devaprasannaprincem/EEG-Signal-Analysis-Suite.git
cd EEG-Signal-Analysis-Suite
```

### 2. Run locally

Because this is a static frontend project, run it with a local server.

#### Python

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080/index.html
```

#### Alternative (Node)

```bash
npx serve -l 8080
```

## Usage Flow

1. Open **Channel Selection**
2. Upload your EEG file
3. Select method + threshold and run channel scoring
4. Move to **Signal Transform** and apply FFT/DWT/STFT
5. Open **Performance** to evaluate metrics
6. Open **Results** for full matrix and decision summary

## Threshold Logic (RIGHT/WRONG)

A combination is marked **RIGHT** only if all thresholds pass:

- SNR >= 15 dB
- Compression Ratio >= 3.0x
- Transfer Rate >= 800 bps

Otherwise it is marked **WRONG**.

## Notes

- If `localhost:8080` shows connection refused, start the local server first.
- EDF parsing supports common EDF layouts. Some uncommon EDF variants may require additional parser handling.
- Large datasets are compactly persisted for cross-page navigation in the same tab/session.

## Documentation

- [QUICK_START.md](QUICK_START.md)
- [REAL_PROCESSING_IMPLEMENTATION.md](REAL_PROCESSING_IMPLEMENTATION.md)
- [CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md)
- [MOCK_DATA_DEPENDENCIES.md](MOCK_DATA_DEPENDENCIES.md)
- [EVENTS_AND_CALLBACKS.md](EVENTS_AND_CALLBACKS.md)

## Author

Developed by [devaprasannaprincem](https://github.com/devaprasannaprincem)
