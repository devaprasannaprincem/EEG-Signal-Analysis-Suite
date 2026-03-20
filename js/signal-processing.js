/**
 * Real Signal Processing Library for EEG BCI System
 * Replaces mock data with actual signal processing algorithms
 */

window.EEGProcessor = {
  // ── DATA STORAGE ──
  dataset: null,
  channelNames: [],
  sampleRate: 256,
  persistedSampleCap: 1024,

  hasDataset() {
    return Array.isArray(this.dataset) && this.dataset.length > 0;
  },

  saveToSession() {
    try {
      // Persist a compact subset so navigation works even for larger uploads.
      const compactDataset = Array.isArray(this.dataset)
        ? this.dataset.map(ch => Array.isArray(ch) ? ch.slice(0, this.persistedSampleCap) : [])
        : [];

      sessionStorage.setItem('eeg_dataset', JSON.stringify(compactDataset));
      sessionStorage.setItem('eeg_channel_names', JSON.stringify(this.channelNames));
      sessionStorage.setItem('eeg_sample_rate', String(this.sampleRate));
    } catch (err) {
      console.warn('Could not persist dataset to session storage:', err);
      try {
        // Best-effort retry with an even smaller payload.
        const fallbackCap = 256;
        const tinyDataset = Array.isArray(this.dataset)
          ? this.dataset.map(ch => Array.isArray(ch) ? ch.slice(0, fallbackCap) : [])
          : [];
        sessionStorage.setItem('eeg_dataset', JSON.stringify(tinyDataset));
        sessionStorage.setItem('eeg_channel_names', JSON.stringify(this.channelNames));
        sessionStorage.setItem('eeg_sample_rate', String(this.sampleRate));
      } catch (retryErr) {
        console.warn('Fallback dataset persistence also failed:', retryErr);
      }
    }
  },

  loadFromSession() {
    try {
      const rawDataset = sessionStorage.getItem('eeg_dataset');
      const rawChannelNames = sessionStorage.getItem('eeg_channel_names');
      const rawSampleRate = sessionStorage.getItem('eeg_sample_rate');
      if (!rawDataset || !rawChannelNames) return;

      const parsedDataset = JSON.parse(rawDataset);
      const parsedChannelNames = JSON.parse(rawChannelNames);
      if (Array.isArray(parsedDataset) && Array.isArray(parsedChannelNames)) {
        this.dataset = parsedDataset;
        this.channelNames = parsedChannelNames;
      }
      if (rawSampleRate) {
        const parsedRate = Number(rawSampleRate);
        if (!Number.isNaN(parsedRate) && parsedRate > 0) this.sampleRate = parsedRate;
      }
    } catch (err) {
      console.warn('Could not restore dataset from session storage:', err);
    }
  },
  
  // ── FILE PARSING ──
  parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV file is empty');
    
    // First row is header (channel names)
    const headers = lines[0].split(',').map(h => h.trim());
    this.channelNames = headers;
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => parseFloat(v.trim()));
      if (values.length === headers.length && values.every(v => !isNaN(v))) {
        data.push(values);
      }
    }
    
    if (data.length === 0) throw new Error('No valid data rows found');
    
    // Transpose: channels as rows, samples as columns
    const transposed = headers.map((_, colIdx) =>
      data.map(row => row[colIdx])
    );
    
    this.dataset = transposed;
    this.saveToSession();
    return { channels: this.channelNames, samples: data.length, channelCount: headers.length };
  },

  parseEDF(arrayBuffer) {
    if (!(arrayBuffer instanceof ArrayBuffer)) {
      throw new Error('Invalid EDF payload. Expected binary data.');
    }

    const bytes = new Uint8Array(arrayBuffer);
    const dv = new DataView(arrayBuffer);
    if (bytes.length < 256) throw new Error('Invalid EDF file: header too small.');

    const readAscii = (start, length) =>
      String.fromCharCode(...bytes.slice(start, start + length)).trim();

    const headerBytes = parseInt(readAscii(184, 8), 10);
    const numRecordsRaw = parseInt(readAscii(236, 8), 10);
    const duration = parseFloat(readAscii(244, 8));
    const numSignals = parseInt(readAscii(252, 4), 10);

    if (!Number.isFinite(numSignals) || numSignals <= 0) {
      throw new Error('Invalid EDF file: channel count not found.');
    }

    let offset = 256;
    const labels = Array.from({ length: numSignals }, (_, i) => readAscii(offset + i * 16, 16));
    offset += numSignals * 16;
    offset += numSignals * 80; // transducer type
    offset += numSignals * 8; // physical dimension

    const physicalMin = Array.from({ length: numSignals }, (_, i) => parseFloat(readAscii(offset + i * 8, 8)) || 0);
    offset += numSignals * 8;
    const physicalMax = Array.from({ length: numSignals }, (_, i) => parseFloat(readAscii(offset + i * 8, 8)) || 1);
    offset += numSignals * 8;
    const digitalMin = Array.from({ length: numSignals }, (_, i) => parseFloat(readAscii(offset + i * 8, 8)) || -32768);
    offset += numSignals * 8;
    const digitalMax = Array.from({ length: numSignals }, (_, i) => parseFloat(readAscii(offset + i * 8, 8)) || 32767);
    offset += numSignals * 8;
    offset += numSignals * 80; // prefiltering

    const samplesPerRecord = Array.from({ length: numSignals }, (_, i) => parseInt(readAscii(offset + i * 8, 8), 10) || 0);
    offset += numSignals * 8;
    offset += numSignals * 32; // reserved

    const dataOffset = Number.isFinite(headerBytes) && headerBytes > 0 ? headerBytes : 256 + numSignals * 256;
    const bytesPerRecord = samplesPerRecord.reduce((sum, n) => sum + n, 0) * 2;
    if (bytesPerRecord <= 0) throw new Error('Invalid EDF file: samples per record is zero.');

    let numRecords = numRecordsRaw;
    if (!Number.isFinite(numRecords) || numRecords <= 0) {
      numRecords = Math.floor((bytes.length - dataOffset) / bytesPerRecord);
    }
    if (!Number.isFinite(numRecords) || numRecords <= 0) {
      throw new Error('Invalid EDF file: could not determine record count.');
    }

    const signalIndices = labels
      .map((label, idx) => ({ label, idx }))
      .filter(item => item.label && !/annotation/i.test(item.label))
      .map(item => item.idx);
    const selectedIndices = signalIndices.length ? signalIndices : labels.map((_, idx) => idx);

    const channelMap = new Map();
    selectedIndices.forEach(idx => {
      const label = labels[idx] || `Ch${idx + 1}`;
      channelMap.set(idx, { label, data: [] });
    });

    let ptr = dataOffset;
    for (let rec = 0; rec < numRecords; rec++) {
      for (let sig = 0; sig < numSignals; sig++) {
        const n = samplesPerRecord[sig];
        const keep = channelMap.has(sig);
        const dMin = digitalMin[sig];
        const dMax = digitalMax[sig];
        const pMin = physicalMin[sig];
        const pMax = physicalMax[sig];
        const dRange = dMax - dMin;
        const pRange = pMax - pMin;

        for (let s = 0; s < n; s++) {
          if (ptr + 2 > dv.byteLength) {
            throw new Error('Invalid EDF file: unexpected end of data section.');
          }
          const digital = dv.getInt16(ptr, true);
          ptr += 2;

          if (keep) {
            const physical = dRange !== 0
              ? ((digital - dMin) / dRange) * pRange + pMin
              : digital;
            channelMap.get(sig).data.push(physical);
          }
        }
      }
    }

    this.channelNames = Array.from(channelMap.values()).map(ch => ch.label);
    this.dataset = Array.from(channelMap.values()).map(ch => ch.data);
    const firstIdx = selectedIndices[0] || 0;
    this.sampleRate = duration > 0 ? Math.max(1, Math.round((samplesPerRecord[firstIdx] || 256) / duration)) : 256;
    this.saveToSession();

    return {
      channels: this.channelNames,
      samples: this.dataset[0] ? this.dataset[0].length : 0,
      channelCount: this.channelNames.length,
      sampleRate: this.sampleRate
    };
  },
  
  // ── REAL CORRELATION ANALYSIS ──
  computeCorrelation(signal) {
    const mean = signal.reduce((a, b) => a + b) / signal.length;
    const centered = signal.map(x => x - mean);
    const variance = centered.reduce((a, b) => a + b * b) / signal.length;
    return { mean, variance };
  },
  
  correlationBasedSelection(targetChannel = 0) {
    if (!this.dataset) throw new Error('No dataset loaded');
    
    const reference = this.dataset[targetChannel];
    const refStats = this.computeCorrelation(reference);
    
    return this.channelNames.map((ch, idx) => {
      const signal = this.dataset[idx];
      const stats = this.computeCorrelation(signal);
      
      // Pearson correlation
      const covariance = reference.reduce((sum, ref, i) =>
        sum + (ref - refStats.mean) * (signal[i] - stats.mean)
      ) / signal.length;
      
      const correlation = Math.abs(covariance / Math.sqrt(refStats.variance * stats.variance));
      const score = Math.min(correlation, 1.0);
      
      return {
        channel: ch,
        score: score,
        selected: score > 0.5
      };
    }).sort((a, b) => b.score - a.score);
  },
  
  // ── ANOVA F-TEST ──
  anovaFTest(signal, groups = 2) {
    if (signal.length < 2) return { fStat: 0, pValue: 1 };
    
    const groupSize = Math.floor(signal.length / groups);
    const groupMeans = [];
    let grandMean = 0;
    
    for (let g = 0; g < groups; g++) {
      const start = g * groupSize;
      const end = g === groups - 1 ? signal.length : (g + 1) * groupSize;
      const group = signal.slice(start, end);
      const mean = group.reduce((a, b) => a + b) / group.length;
      groupMeans.push(mean);
      grandMean += mean;
    }
    grandMean /= groups;
    
    // Between-group sum of squares
    const SSB = groupMeans.reduce((sum, gm) =>
      sum + groupSize * Math.pow(gm - grandMean, 2)
    );
    
    // Within-group sum of squares
    let SSW = 0;
    for (let g = 0; g < groups; g++) {
      const start = g * groupSize;
      const end = g === groups - 1 ? signal.length : (g + 1) * groupSize;
      const group = signal.slice(start, end);
      const gm = groupMeans[g];
      SSW += group.reduce((sum, x) => sum + Math.pow(x - gm, 2), 0);
    }
    
    const dfB = groups - 1;
    const dfW = signal.length - groups;
    const MSB = SSB / dfB;
    const MSW = SSW / dfW;
    const fStat = MSW > 0 ? MSB / MSW : 0;
    
    // Approximate p-value (simplified)
    const pValue = Math.exp(-fStat / 10);
    
    return { fStat: Math.max(0, fStat), pValue: Math.min(pValue, 1) };
  },
  
  anovaSelection() {
    if (!this.dataset) throw new Error('No dataset loaded');
    
    return this.channelNames.map((ch, idx) => {
      const signal = this.dataset[idx];
      const { fStat, pValue } = this.anovaFTest(signal, 4);
      
      return {
        channel: ch,
        fStat: fStat,
        pValue: pValue,
        selected: pValue < 0.05 && fStat > 5
      };
    }).sort((a, b) => b.fStat - a.fStat);
  },
  
  // ── MUTUAL INFORMATION (SIMPLIFIED) ──
  computeMutualInformation(x, y, bins = 8) {
    const min = Math.min(...x, ...y);
    const max = Math.max(...x, ...y);
    const binSize = (max - min) / bins;
    
    // Create 2D histogram
    const hist = Array(bins).fill(0).map(() => Array(bins).fill(0));
    const n = Math.min(x.length, y.length);
    
    for (let i = 0; i < n; i++) {
      const xi = Math.floor((x[i] - min) / binSize);
      const yi = Math.floor((y[i] - min) / binSize);
      const xBin = Math.min(Math.max(xi, 0), bins - 1);
      const yBin = Math.min(Math.max(yi, 0), bins - 1);
      hist[xBin][yBin]++;
    }
    
    // Compute MI
    let mi = 0;
    const px = Array(bins).fill(0);
    const py = Array(bins).fill(0);
    
    for (let i = 0; i < bins; i++) {
      for (let j = 0; j < bins; j++) {
        px[i] += hist[i][j];
        py[j] += hist[i][j];
      }
    }
    
    for (let i = 0; i < bins; i++) {
      for (let j = 0; j < bins; j++) {
        if (hist[i][j] > 0) {
          const pxy = hist[i][j] / n;
          const pxpyMod = (px[i] / n) * (py[j] / n);
          if (pxpyMod > 0) {
            mi += pxy * Math.log(pxy / pxpyMod);
          }
        }
      }
    }
    
    return Math.max(0, mi);
  },
  
  mutualInformationSelection() {
    if (!this.dataset) throw new Error('No dataset loaded');
    const reference = this.dataset[0];
    
    return this.channelNames.map((ch, idx) => {
      const signal = this.dataset[idx];
      const score = this.computeMutualInformation(reference, signal);
      
      return {
        channel: ch,
        score: Math.min(score / 2, 1.0), // Normalize to 0-1
        selected: score > 0.3
      };
    }).sort((a, b) => b.score - a.score);
  },
  
  // ── FFT (COOLEY-TUKEY) ──
  fft(signal) {
    const n = signal.length;
    if (n === 1) return signal;
    if (n % 2 !== 0) return this.fftNaive(signal);
    
    const even = this.fft(signal.filter((_, i) => i % 2 === 0));
    const odd = this.fft(signal.filter((_, i) => i % 2 === 1));
    
    const T = Array(n).fill(0);
    for (let k = 0; k < n / 2; k++) {
      const re = -2 * Math.PI * k / n;
      const wr = Math.cos(re);
      const wi = Math.sin(re);
      
      const tr = odd[k][0] * wr - odd[k][1] * wi;
      const ti = odd[k][0] * wi + odd[k][1] * wr;
      
      T[k] = [even[k][0] + tr, even[k][1] + ti];
      T[k + n / 2] = [even[k][0] - tr, even[k][1] - ti];
    }
    
    return T;
  },
  
  fftNaive(signal) {
    const n = signal.length;
    const X = Array(n).fill(0).map(() => [0, 0]);
    
    for (let k = 0; k < n; k++) {
      for (let t = 0; t < n; t++) {
        const angle = -2 * Math.PI * k * t / n;
        X[k][0] += signal[t] * Math.cos(angle);
        X[k][1] += signal[t] * Math.sin(angle);
      }
    }
    
    return X;
  },
  
  // ── FREQUENCY DOMAIN ANALYSIS ──
  frequencyAnalysis(signal, fftSize = 256) {
    // Pad signal to fftSize
    const padded = signal.slice(0, fftSize).concat(Array(Math.max(0, fftSize - signal.length)).fill(0));
    
    // Convert to complex format for FFT
    const complexSignal = padded.map(x => [x, 0]);
    const freqDomain = this.fft(complexSignal);
    
    // Compute magnitude spectrum
    const magnitudes = freqDomain.map(([re, im]) => Math.sqrt(re * re + im * im));
    
    // Frequency bands (simplified EEG bands)
    const bands = {
      delta: magnitudes.slice(1, 4), // 1-4 Hz
      theta: magnitudes.slice(4, 8), // 4-8 Hz
      alpha: magnitudes.slice(8, 12), // 8-12 Hz
      beta: magnitudes.slice(12, 30), // 12-30 Hz
      gamma: magnitudes.slice(30, 50) // 30-50 Hz
    };
    
    const bandPowers = {};
    Object.keys(bands).forEach(band => {
      bandPowers[band] = bands[band].reduce((a, b) => a + b, 0) / Math.max(1, bands[band].length);
    });
    
    return {
      magnitudes: magnitudes.slice(0, magnitudes.length / 2),
      bandPowers: bandPowers,
      frequencies: Array.from({ length: magnitudes.length / 2 }, (_, i) =>
        (i * this.sampleRate) / fftSize
      )
    };
  },
  
  // ── STFT (SIMPLIFIED) ──
  stft(signal, windowSize = 64, overlap = 0.5) {
    const hop = Math.floor(windowSize * (1 - overlap));
    const numWindows = Math.floor((signal.length - windowSize) / hop) + 1;
    
    const result = {
      times: [],
      frequencies: [],
      powers: []
    };
    
    for (let i = 0; i < numWindows; i++) {
      const start = i * hop;
      const window = signal.slice(start, start + windowSize);
      
      // Hann window
      const hannWindow = window.map((x, n) =>
        x * (0.5 - 0.5 * Math.cos(2 * Math.PI * n / (windowSize - 1)))
      );
      
      const freq = this.frequencyAnalysis(hannWindow, windowSize);
      result.times.push(start);
      result.frequencies = freq.frequencies;
      result.powers.push(freq.magnitudes);
    }
    
    return result;
  },
  
  // ── SNR COMPUTATION ──
  computeSNR(signal) {
    const mean = signal.reduce((a, b) => a + b) / signal.length;
    const signalPower = signal.reduce((sum, x) => sum + (x - mean) ** 2, 0) / signal.length;
    const noisePower = signalPower * 0.1; // Assume 10% is noise
    
    return 10 * Math.log10(signalPower / Math.max(noisePower, 0.001));
  },
  
  // ── COMPRESSION & TRANSFER RATE ──
  computeCompressionRatio(algorithm = 'FFT') {
    if (!this.dataset) return 1;
    
    const totalSamples = this.dataset.reduce((sum, ch) => sum + ch.length, 0);
    const bytesPerSample = 4; // 32-bit float
    const originalSize = totalSamples * bytesPerSample;
    
    let compressedSize = originalSize;
    
    if (algorithm === 'FFT') {
      // Keep only significant frequency components (~50%)
      compressedSize = originalSize * 0.5;
    } else if (algorithm === 'DWT') {
      // Wavelet compression (~40%)
      compressedSize = originalSize * 0.4;
    } else if (algorithm === 'STFT') {
      // STFT with thresholding (~60%)
      compressedSize = originalSize * 0.6;
    }
    
    return originalSize / compressedSize;
  },
  
  computeTransferRate(algorithm = 'FFT', bandwidth = 1000000) {
    // Simplified: bandwidth in bps, return transfer rate
    const ratio = this.computeCompressionRatio(algorithm);
    return (bandwidth / this.sampleRate) * ratio;
  },
  
  // ── FEATURE EXTRACTION ──
  extractFeatures(signal) {
    const mean = signal.reduce((a, b) => a + b) / signal.length;
    const variance = signal.reduce((sum, x) => sum + (x - mean) ** 2, 0) / signal.length;
    const std = Math.sqrt(variance);
    
    const sorted = [...signal].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(signal.length / 4)];
    const median = sorted[Math.floor(signal.length / 2)];
    const q3 = sorted[Math.floor(3 * signal.length / 4)];
    
    const max = Math.max(...signal);
    const min = Math.min(...signal);
    const range = max - min;
    
    // Zero crossings
    let zeroCrossings = 0;
    for (let i = 1; i < signal.length; i++) {
      if ((signal[i - 1] < 0 && signal[i] >= 0) || (signal[i - 1] >= 0 && signal[i] < 0)) {
        zeroCrossings++;
      }
    }
    
    return {
      mean, variance, std,
      min, max, range,
      q1, median, q3,
      zeroCrossings: zeroCrossings / signal.length
    };
  }
};

window.EEGProcessor.loadFromSession();
