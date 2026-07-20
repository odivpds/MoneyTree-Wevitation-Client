/* ============================================
   UNDANGAN BALI — Preview Page JavaScript
   Countdown timer, RSVP, sharing, QR code
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadInvitationData();
  initCountdown();
  initRSVP();
  initSharing();
  initQRCode();
  initDownload();
  
  // Animate share panel
  const sharePanel = document.getElementById('sharePanel');
  if (sharePanel) {
    setTimeout(() => {
      sharePanel.style.opacity = '1';
      sharePanel.style.transform = 'translateY(0)';
    }, 600);
  }
});

/* --- Load Saved Invitation Data --- */
function loadInvitationData() {
  try {
    const savedData = localStorage.getItem('undanganBali_data');
    if (savedData) {
      const data = JSON.parse(savedData);

      // Update couple names
      const namesEl = document.getElementById('coupleNames');
      if (namesEl && (data.groomName || data.brideName)) {
        const groom = data.groomName || 'Nama Pria';
        const bride = data.brideName || 'Nama Wanita';
        namesEl.innerHTML = `
          ${groom}
          <span style="font-size: 0.5em; display: block; margin: -8px 0;">&</span>
          ${bride}
        `;
      }

      // Update date
      const dateEl = document.getElementById('weddingDate');
      if (dateEl && data.weddingDate) {
        const date = new Date(data.weddingDate);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = date.toLocaleDateString('id-ID', options);
      }

      // Update venue
      const venueEl = document.getElementById('weddingVenue');
      if (venueEl && data.mainVenue) {
        venueEl.textContent = data.mainVenue;
      }
    }

    // Load photo
    const savedPhoto = localStorage.getItem('undanganBali_photo');
    if (savedPhoto) {
      const previewPhotoImg = document.getElementById('previewPhotoImg');
      const photoPlaceholder = document.getElementById('photoPlaceholder');
      
      if (previewPhotoImg) {
        previewPhotoImg.src = savedPhoto;
        previewPhotoImg.style.display = 'block';
      }
      if (photoPlaceholder) {
        photoPlaceholder.style.display = 'none';
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

/* --- Countdown Timer --- */
function initCountdown() {
  // Try to load saved date
  let targetDate;
  try {
    const savedData = localStorage.getItem('undanganBali_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.weddingDate) {
        targetDate = new Date(data.weddingDate);
      }
    }
  } catch (e) {}

  // Default to 100 days from now if no date saved
  if (!targetDate || isNaN(targetDate.getTime())) {
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 100);
  }

  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minutesEl = document.getElementById('countMinutes');
  const secondsEl = document.getElementById('countSeconds');

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

    // Animate number changes
    animateNumber(daysEl, days);
    animateNumber(hoursEl, hours);
    animateNumber(minutesEl, minutes);
    animateNumber(secondsEl, seconds);
  }

  function animateNumber(el, newVal) {
    const currentVal = el.textContent;
    if (currentVal !== String(newVal)) {
      el.textContent = newVal;
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'scaleIn 0.3s ease';
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* --- RSVP Form --- */
function initRSVP() {
  const submitBtn = document.getElementById('rsvpSubmitBtn');
  
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const name = document.getElementById('rsvpName')?.value?.trim();
    const attendance = document.getElementById('rsvpAttendance')?.value;
    const guests = document.getElementById('rsvpGuests')?.value;
    const message = document.getElementById('rsvpMessage')?.value?.trim();

    // Validate
    if (!name) {
      showToast('Harap isi nama Anda! ⚠️', 'error');
      return;
    }
    if (!attendance) {
      showToast('Harap pilih konfirmasi kehadiran! ⚠️', 'error');
      return;
    }

    // Add to wishes display
    addWish(name, attendance, message);

    // Clear form
    document.getElementById('rsvpName').value = '';
    document.getElementById('rsvpAttendance').value = '';
    if (document.getElementById('rsvpGuests')) document.getElementById('rsvpGuests').value = '';
    if (document.getElementById('rsvpMessage')) document.getElementById('rsvpMessage').value = '';

    showToast('Terima kasih atas konfirmasinya! 🙏💕', 'success');
  });
}

function addWish(name, attendance, message) {
  const container = document.getElementById('wishesContainer');
  if (!container) return;

  const attendanceText = {
    hadir: '✅ Akan hadir',
    tidak: '❌ Tidak bisa hadir',
    ragu: '🤔 Masih belum pasti'
  };

  const colors = ['#d4a574', '#8b1a2b', '#2ecc71', '#e8c87a', '#c0a0e0'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const initial = name.charAt(0).toUpperCase();

  const wishHTML = `
    <div style="padding: var(--space-4); background: var(--surface-subtle); border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: var(--space-4); animation: fadeInUp 0.5s ease forwards;">
      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
        <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: ${randomColor}; display: flex; align-items: center; justify-content: center; font-size: var(--text-sm); color: white; font-weight: 700; flex-shrink: 0;">${initial}</div>
        <div>
          <p style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary);">${escapeHTML(name)}</p>
          <p style="font-size: var(--text-xs); color: var(--text-muted);">${attendanceText[attendance] || attendance}</p>
        </div>
      </div>
      ${message ? `<p style="font-size: var(--text-sm); color: var(--text-secondary); padding-left: calc(36px + var(--space-3));">${escapeHTML(message)}</p>` : ''}
    </div>
  `;

  // Insert at the top
  container.insertAdjacentHTML('afterbegin', wishHTML);
}

/* --- Sharing Functions --- */
function initSharing() {
  const shareWhatsapp = document.getElementById('shareWhatsapp');
  const shareInstagram = document.getElementById('shareInstagram');
  const shareCopyLink = document.getElementById('shareCopyLink');
  const shareMainBtn = document.getElementById('shareMainBtn');

  // Get couple names for share message
  let groomName = 'Mempelai Pria';
  let brideName = 'Mempelai Wanita';
  
  try {
    const savedData = localStorage.getItem('undanganBali_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.groomName) groomName = data.groomName;
      if (data.brideName) brideName = data.brideName;
    }
  } catch (e) {}

  const shareText = `💍 Undangan Pernikahan\n\n${groomName} & ${brideName}\n\nKami mengundang Anda untuk hadir di acara pernikahan kami.\n\n🔗 Lihat undangan: ${window.location.href}\n\nTerima kasih! 🙏`;

  // WhatsApp share
  if (shareWhatsapp) {
    shareWhatsapp.addEventListener('click', () => {
      const whatsappURL = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappURL, '_blank');
      showToast('Membuka WhatsApp... 💬', 'success');
    });
  }

  // Instagram (copy link since Instagram doesn't have share API)
  if (shareInstagram) {
    shareInstagram.addEventListener('click', () => {
      copyToClipboard(window.location.href);
      showToast('Link disalin! Paste di Instagram Story/Post Anda 📷', 'success');
    });
  }

  // Copy link
  if (shareCopyLink) {
    shareCopyLink.addEventListener('click', () => {
      copyToClipboard(window.location.href);
      shareCopyLink.innerHTML = '✅ Link Disalin!';
      setTimeout(() => {
        shareCopyLink.innerHTML = '🔗 Salin Link';
      }, 2000);
    });
  }

  // Main share button in navbar
  if (shareMainBtn) {
    shareMainBtn.addEventListener('click', () => {
      // Try Web Share API first
      if (navigator.share) {
        navigator.share({
          title: `Undangan Pernikahan ${groomName} & ${brideName}`,
          text: `Kami mengundang Anda ke pernikahan ${groomName} & ${brideName}`,
          url: window.location.href
        }).catch(() => {
          // Fallback: scroll to share panel
          document.getElementById('sharePanel')?.scrollIntoView({ behavior: 'smooth' });
        });
      } else {
        document.getElementById('sharePanel')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* --- QR Code Generator (Simple Canvas-based) --- */
function initQRCode() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const size = 140;
  const moduleCount = 21; // Simple QR size
  const moduleSize = size / moduleCount;

  // Generate a decorative QR-like pattern (visual representation)
  // In production, use a real QR library like qrcode.js
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#d4a574';

  // Draw finder patterns (corners)
  drawFinderPattern(ctx, 0, 0, moduleSize);
  drawFinderPattern(ctx, (moduleCount - 7) * moduleSize, 0, moduleSize);
  drawFinderPattern(ctx, 0, (moduleCount - 7) * moduleSize, moduleSize);

  // Draw random data modules
  const seed = 42;
  let rng = seed;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Skip finder pattern areas
      if ((row < 8 && col < 8) || (row < 8 && col > moduleCount - 9) || (row > moduleCount - 9 && col < 8)) continue;
      
      rng = (rng * 16807) % 2147483647;
      if (rng % 3 !== 0) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 0.5, moduleSize - 0.5);
      }
    }
  }

  // Add center text
  ctx.fillStyle = 'white';
  ctx.fillRect(size/2 - 20, size/2 - 8, 40, 16);
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 7px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UNDANGAN', size/2, size/2 + 2);
  ctx.fillText('BALI', size/2, size/2 + 10);
}

function drawFinderPattern(ctx, x, y, moduleSize) {
  // Outer border
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
  
  // Inner white
  ctx.fillStyle = 'white';
  ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
  
  // Center dark
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
}

/* --- Download as Image --- */
function initDownload() {
  const downloadBtn = document.getElementById('downloadBtn');
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      showToast('Fitur download akan tersedia segera! 📥', 'success');
      // In production, use html2canvas library to capture the invitation
    });
  }
}

/* --- Utility: Copy to Clipboard --- */
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Link berhasil disalin! 📋', 'success');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Link berhasil disalin! 📋', 'success');
  } catch (e) {
    showToast('Gagal menyalin link.', 'error');
  }
  document.body.removeChild(textarea);
}

/* --- Utility: Escape HTML --- */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
