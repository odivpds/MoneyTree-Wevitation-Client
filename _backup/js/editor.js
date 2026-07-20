/* ============================================
   UNDANGAN BALI — Editor JavaScript
   Live preview, photo upload, tab switching,
   form handling, real-time updates
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initEditorTabs();
  initPhotoUpload();
  initLivePreview();
  initColorPicker();
  initFontPicker();
  initGreetingPicker();
  initSaveShare();
  loadTemplateFromURL();
});

/* --- Tab Switching --- */
function initEditorTabs() {
  const tabs = document.querySelectorAll('.editor__tab');
  const contents = document.querySelectorAll('.editor__tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab button
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show corresponding content
      contents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.style.display = 'block';
          content.style.animation = 'fadeInUp 0.3s ease forwards';
        } else {
          content.style.display = 'none';
        }
      });
    });
  });
}

/* --- Photo Upload (Drag & Drop + Click) --- */
function initPhotoUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('photoUpload');
  const uploadContent = document.getElementById('uploadContent');
  const uploadPreview = document.getElementById('uploadPreview');
  const uploadPreviewImg = document.getElementById('uploadPreviewImg');
  const removeBtn = document.getElementById('removePhoto');
  const previewPhotoImg = document.getElementById('previewPhotoImg');
  const photoPlaceholder = document.getElementById('photoPlaceholder');

  if (!uploadArea || !fileInput) return;

  // Click to upload
  uploadArea.addEventListener('click', (e) => {
    if (e.target.closest('.remove-btn')) return;
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // Drag & Drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  });

  // Remove photo
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadContent.style.display = '';
      uploadPreview.classList.remove('active');
      uploadPreviewImg.src = '';
      fileInput.value = '';

      // Update preview
      if (previewPhotoImg) previewPhotoImg.style.display = 'none';
      if (photoPlaceholder) photoPlaceholder.style.display = 'flex';

      showToast('Foto berhasil dihapus', 'success');
    });
  }

  function handleFile(file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar! Maksimal 5MB.', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Format file tidak didukung! Gunakan JPG, PNG, atau WebP.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;

      // Show in upload area
      uploadContent.style.display = 'none';
      uploadPreview.classList.add('active');
      uploadPreviewImg.src = dataUrl;

      // Update live preview
      if (previewPhotoImg) {
        previewPhotoImg.src = dataUrl;
        previewPhotoImg.style.display = 'block';
      }
      if (photoPlaceholder) {
        photoPlaceholder.style.display = 'none';
      }

      showToast('Foto berhasil diupload! 📸', 'success');
    };
    reader.readAsDataURL(file);
  }
}

/* --- Live Preview Updates --- */
function initLivePreview() {
  const fieldMappings = [
    { input: 'groomName', preview: 'previewGroomName', default: 'Nama Pria' },
    { input: 'brideName', preview: 'previewBrideName', default: 'Nama Wanita' },
    { input: 'mainVenue', preview: 'previewVenue', default: 'Lokasi Acara' },
    { input: 'akadTime', preview: 'previewAkadTime', default: '09:00 WITA - Selesai' },
    { input: 'akadVenue', preview: 'previewAkadVenue', default: 'Pura Keluarga' },
    { input: 'resepsiTime', preview: 'previewResepsiTime', default: '18:00 WITA - Selesai' },
    { input: 'resepsiVenue', preview: 'previewResepsiVenue', default: 'Nama Venue' },
  ];

  fieldMappings.forEach(({ input, preview, default: defaultVal }) => {
    const inputEl = document.getElementById(input);
    const previewEl = document.getElementById(preview);

    if (inputEl && previewEl) {
      inputEl.addEventListener('input', () => {
        previewEl.textContent = inputEl.value.trim() || defaultVal;
        
        // Add highlight animation
        previewEl.style.animation = 'none';
        previewEl.offsetHeight; // Force reflow
        previewEl.style.animation = 'fadeIn 0.3s ease';
      });
    }
  });

  // Date field special handling
  const dateInput = document.getElementById('weddingDate');
  const datePreview = document.getElementById('previewDate');

  if (dateInput && datePreview) {
    dateInput.addEventListener('change', () => {
      if (dateInput.value) {
        const date = new Date(dateInput.value);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('id-ID', options);
        datePreview.textContent = formattedDate;
        
        // Update countdown
        updateCountdown(date);
      } else {
        datePreview.textContent = 'Tanggal Pernikahan';
      }
    });
  }
}

/* --- Update Countdown in Preview --- */
function updateCountdown(targetDate) {
  const daysEl = document.getElementById('previewDays');
  const hoursEl = document.getElementById('previewHours');
  const minutesEl = document.getElementById('previewMinutes');
  const secondsEl = document.getElementById('previewSeconds');

  if (!daysEl) return;

  function tick() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minutesEl.textContent = '0';
      secondsEl.textContent = '0';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;
  }

  tick();
  setInterval(tick, 1000);
}

/* --- Color Picker --- */
function initColorPicker() {
  const colorOptions = document.querySelectorAll('.color-option');
  
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      colorOptions.forEach(o => {
        o.style.borderColor = 'transparent';
        o.classList.remove('active');
      });
      
      option.style.borderColor = option.dataset.color;
      option.classList.add('active');

      // Apply color to preview
      const color = option.dataset.color;
      document.documentElement.style.setProperty('--accent-gold', color);
      
      showToast('Warna aksen diubah! 🎨', 'success');
    });
  });
}

/* --- Font Picker --- */
function initFontPicker() {
  const fontOptions = document.querySelectorAll('.font-option');
  const namesEl = document.querySelector('.invitation-preview__names');
  
  fontOptions.forEach(option => {
    option.addEventListener('click', () => {
      fontOptions.forEach(o => {
        o.style.borderColor = 'var(--border-color)';
        o.classList.remove('active');
      });
      
      option.style.borderColor = 'var(--accent-gold)';
      option.classList.add('active');

      // Apply font to preview names
      if (namesEl) {
        namesEl.style.fontFamily = option.dataset.font;
      }
      
      showToast('Font nama diubah! ✨', 'success');
    });
  });
}

/* --- Greeting Picker --- */
function initGreetingPicker() {
  const greetingSelect = document.getElementById('greeting');
  
  if (!greetingSelect) return;

  greetingSelect.addEventListener('change', () => {
    // Update preview greeting text
    const previewFrame = document.getElementById('previewFrame');
    if (previewFrame) {
      const greetingEl = previewFrame.querySelector('[style*="letter-spacing: 3px"]');
      if (greetingEl) {
        greetingEl.textContent = greetingSelect.value;
      }
    }
  });
}

/* --- Save & Share --- */
function initSaveShare() {
  const saveShareBtn = document.getElementById('saveShareBtn');
  
  if (saveShareBtn) {
    saveShareBtn.addEventListener('click', () => {
      // Collect all form data
      const formData = {
        groomName: document.getElementById('groomName')?.value || '',
        brideName: document.getElementById('brideName')?.value || '',
        weddingDate: document.getElementById('weddingDate')?.value || '',
        mainVenue: document.getElementById('mainVenue')?.value || '',
        dressCode: document.getElementById('dressCode')?.value || '',
        akadTime: document.getElementById('akadTime')?.value || '',
        akadVenue: document.getElementById('akadVenue')?.value || '',
        resepsiTime: document.getElementById('resepsiTime')?.value || '',
        resepsiVenue: document.getElementById('resepsiVenue')?.value || '',
        mapLink: document.getElementById('mapLink')?.value || '',
      };

      // Validate required fields
      if (!formData.groomName || !formData.brideName) {
        showToast('Harap isi nama mempelai pria dan wanita! ⚠️', 'error');
        return;
      }

      // Save to localStorage (simulating backend)
      try {
        localStorage.setItem('undanganBali_data', JSON.stringify(formData));
        
        // Save photo if available
        const previewPhotoImg = document.getElementById('previewPhotoImg');
        if (previewPhotoImg && previewPhotoImg.src && previewPhotoImg.style.display !== 'none') {
          localStorage.setItem('undanganBali_photo', previewPhotoImg.src);
        }

        showToast('Undangan berhasil disimpan! 🎉', 'success');
        
        // Redirect to preview after a short delay
        setTimeout(() => {
          window.location.href = 'preview.html';
        }, 1500);
      } catch (e) {
        showToast('Gagal menyimpan. Coba lagi.', 'error');
      }
    });
  }
}

/* --- Load Template from URL --- */
function loadTemplateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const template = params.get('template');
  const templateNameDisplay = document.getElementById('templateNameDisplay');

  const templateNames = {
    agung: 'Agung — Traditional',
    dewi: 'Dewi — Minimalis',
    surya: 'Surya — Royal',
    ratih: 'Ratih — Tropical',
    candra: 'Candra — Art Deco',
    purnama: 'Purnama — Sunset',
  };

  if (template && templateNameDisplay && templateNames[template]) {
    templateNameDisplay.textContent = templateNames[template];
  }

  // Load saved data if exists
  try {
    const savedData = localStorage.getItem('undanganBali_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      
      // Populate form fields
      Object.entries(data).forEach(([key, value]) => {
        const el = document.getElementById(key);
        if (el && value) {
          el.value = value;
          el.dispatchEvent(new Event('input'));
          if (el.type === 'date') {
            el.dispatchEvent(new Event('change'));
          }
        }
      });
    }

    // Load photo
    const savedPhoto = localStorage.getItem('undanganBali_photo');
    if (savedPhoto) {
      const previewPhotoImg = document.getElementById('previewPhotoImg');
      const photoPlaceholder = document.getElementById('photoPlaceholder');
      const uploadPreview = document.getElementById('uploadPreview');
      const uploadPreviewImg = document.getElementById('uploadPreviewImg');
      const uploadContent = document.getElementById('uploadContent');

      if (previewPhotoImg) {
        previewPhotoImg.src = savedPhoto;
        previewPhotoImg.style.display = 'block';
      }
      if (photoPlaceholder) photoPlaceholder.style.display = 'none';
      if (uploadPreview) {
        uploadPreview.classList.add('active');
        if (uploadPreviewImg) uploadPreviewImg.src = savedPhoto;
      }
      if (uploadContent) uploadContent.style.display = 'none';
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}
