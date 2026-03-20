// ── BRAINWAVE CANVAS ANIMATION ──
(function() {
  const canvas = document.getElementById('brainwave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, waves = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createWaves() {
    waves = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      waves.push({
        y: H * (0.15 + i * 0.18),
        amplitude: 20 + Math.random() * 40,
        frequency: 0.005 + Math.random() * 0.008,
        speed: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.03 + Math.random() * 0.08,
        color: i % 2 === 0 ? '0,200,255' : '0,255,157'
      });
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.016;
    waves.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(0, w.y);
      for (let x = 0; x <= W; x += 3) {
        // EEG-like with occasional spikes
        const spike = Math.random() > 0.998 ? (Math.random() - 0.5) * 80 : 0;
        const y = w.y + Math.sin(x * w.frequency + t * w.speed + w.phase) * w.amplitude
                  + Math.sin(x * w.frequency * 3.1 + t * w.speed * 0.7) * (w.amplitude * 0.3)
                  + spike;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${w.color},${w.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createWaves();
  draw();
  window.addEventListener('resize', () => { resize(); createWaves(); });
})();

// ── NAV ACTIVE STATE ──
(function() {
  const links = document.querySelectorAll('.nav-link');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(l => {
    const href = l.getAttribute('href').split('/').pop();
    if (href === current) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });
})();

// ── TAB SYSTEM ──
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const btns = tabGroup.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll(`.tab-content[data-tab="${target}"]`).forEach(c => c.classList.add('active'));
        document.querySelectorAll(`.tab-content:not([data-tab="${target}"])`).forEach(c => c.classList.remove('active'));
      });
    });
  });
}
initTabs();

// ── FILE UPLOAD DRAG & DROP ──
function initUploadZones() {
  document.querySelectorAll('.upload-zone').forEach(zone => {
    const input = zone.querySelector('input[type=file]');
    zone.addEventListener('click', () => input && input.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length) handleFileUpload(files[0], zone);
    });
    if (input) {
      input.addEventListener('change', () => { if (input.files.length) handleFileUpload(input.files[0], zone); });
    }
  });
}

function handleFileUpload(file, zone) {
  const title = zone.querySelector('.upload-title');
  const sub = zone.querySelector('.upload-sub');
  const lowerName = (file && file.name ? file.name : '').toLowerCase();
  const isCSV = lowerName.endsWith('.csv');
  const isTXT = lowerName.endsWith('.txt');
  const isEDF = lowerName.endsWith('.edf');
  
  // Show loading state
  if (title) title.textContent = '⏳ Processing...';
  if (sub) sub.textContent = 'Reading file...';

  if (!isCSV && !isTXT && !isEDF) {
    if (title) title.textContent = '✗ Error';
    if (sub) sub.textContent = 'Unsupported format. Use CSV, TXT, or EDF files.';
    zone.style.borderColor = 'var(--red)';
    zone.style.background = 'rgba(255,61,90,0.1)';
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      
      // Parse based on file extension
      const meta = isEDF
        ? window.EEGProcessor.parseEDF(content)
        : window.EEGProcessor.parseCSV(content);

      if (window.EEGProcessor.saveToSession) window.EEGProcessor.saveToSession();
      if (title) title.textContent = '✓ ' + file.name;
      if (sub) sub.textContent = `${meta.channelCount} channels, ${meta.samples} samples — Ready`;
      zone.style.borderColor = 'var(--green)';
      zone.style.background = 'var(--green-dim)';
      
      // Dispatch event
      window.uploadedFile = file;
      window.uploadedFileName = file.name;
      window.uploadedData = window.EEGProcessor.dataset;
      document.dispatchEvent(new CustomEvent('fileUploaded', { detail: { file, meta } }));
    } catch (error) {
      if (title) title.textContent = '✗ Error';
      if (sub) sub.textContent = error.message;
      zone.style.borderColor = 'var(--red)';
      zone.style.background = 'rgba(255,61,90,0.1)';
      console.error('File processing error:', error);
    }
  };
  
  reader.onerror = function() {
    if (title) title.textContent = '✗ Read Error';
    if (sub) sub.textContent = 'Failed to read file';
    zone.style.borderColor = 'var(--red)';
    zone.style.background = 'rgba(255,61,90,0.1)';
  };
  
  if (isEDF) reader.readAsArrayBuffer(file);
  else reader.readAsText(file);
}
initUploadZones();

// ── DEPRECATED: SIMULATED EEG DATA (REMOVED - USE REAL PROCESSING) ──
// All mock data has been replaced with EEGProcessor for real signal analysis
// See signal-processing.js for actual implementations

// ── ANIMATE COUNTERS ──
function animateValue(el, start, end, duration, decimals = 0) {
  const range = end - start;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = (start + range * ease).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
window.animateValue = animateValue;

// ── SHARED STATE ──
window.AppState = {
  dataset: null,
  selectedMethod: 'correlation',
  selectedChannels: [],
  transformResults: {},
  metrics: {}
};
