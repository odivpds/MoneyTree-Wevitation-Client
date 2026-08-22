🔴 Bug Fungsional Kritis

1. Tab "✨ Visual Edit" rusak total untuk template default
Mekanisme WYSIWYG (ELEMENT_CLICKED, postMessage) hanya bisa jalan kalau preview di-render lewat <iframe> (via HtmlAdapter). Tapi template default adalah 'agung', yang di-render sebagai komponen React biasa (AgungTemplate), bukan iframe. Artinya user baru yang buka editor langsung akan melihat tab Visual Edit yang sama sekali tidak merespons klik apa pun — tidak ada pesan error, cuma diam.

2. Countdown timer salah zona waktu
new Date(formData.weddingDate) dari <input type="date"> diparse sebagai UTC midnight, bukan waktu lokal. Untuk user WITA (+8), hitungan mundur bisa meleset ~8 jam; untuk tamu di zona waktu lain bisa meleset lebih jauh — bahkan tanggal yang ditampilkan (toLocaleDateString) berpotensi geser satu hari untuk timezone negatif.

3. Kegagalan simpan foto di-diam-kan (silent failure)
Foto disimpan sebagai base64 di localStorage (ukuran naik ~33% dari file asli). File 5MB (batas validasi) jadi ~6.6MB base64 — gampang melebihi kuota localStorage banyak browser (~5-10MB). Di tombol "👁️ PREVIEW", catch (e) {} kosong berarti kalau setItem gagal (quota exceeded), user tetap diarahkan ke halaman preview tanpa peringatan apa pun, dan preview akan menampilkan data lama/basi.

4. Satu try/catch untuk tiga localStorage read yang berbeda

js
try {
  savedData = ...; savedPhoto = ...; savedOverrides = ...;
} catch (e) {}

Kalau JSON.parse untuk formData gagal (data korup), exception langsung keluar dari block — savedPhoto dan savedOverrides yang sebenarnya valid pun ikut gagal dimuat.

5. Race condition data template lokal vs CMS
setTemplatesData(data) mengganti TEMPLATES sepenuhnya, bukan merge. Kalau /api/templates mengembalikan daftar yang tidak lengkap, preview yang tadinya normal bisa tiba-tiba berubah jadi pesan "Template belum tersedia" begitu fetch selesai.

6. Auth guard tidak menahan render
Redirect ke /login terjadi di useEffect, artinya seluruh UI editor tetap sempat ter-render sekilas sebelum redirect jalan (flash of content untuk user yang belum login).

🔒 Bug Keamanan

7. postMessage listener tanpa validasi origin

js
window.addEventListener('message', handleMessage);

Tidak ada pengecekan event.origin sama sekali. Iframe/tab/script pihak ketiga apa pun bisa mengirim pesan ELEMENT_CLICKED atau SECTIONS_DETECTED palsu dan komponen akan memprosesnya begitu saja.

8. postMessage dikirim dengan target '*'
Di handleVisualEdit dan scrollToSection, target origin memakai wildcard '*' alih-alih origin spesifik dari iframe preview — praktik yang tidak aman untuk pertukaran data.

9. document.querySelector('iframe') tidak di-scope
Dipanggil ulang setiap kali dibutuhkan, bukan lewat ref. Kalau ada iframe lain di halaman, fungsi bisa salah target.

🎨 Bug Visual & CSS

10. Class .editor__tab-content dipakai di JSX tapi TIDAK ADA definisinya di CSS. Semua panel tab (Info/Foto/Acara/Desain/Visual) kehilangan styling container dasarnya.

11. Tombol "✨ Visual Edit" pakai warna biru hardcoded 
#0070f3 — sama sekali tidak match dengan palet emas/burgundy Bali yang konsisten dipakai di seluruh desain lain.

12. Banyak warna hex hardcoded di tab Visual Edit (#eee, white, #ddd) bukan CSS variable. Akibatnya kalau user ganti "Warna Aksen" di tab Desain, elemen-elemen ini tidak ikut berubah.

13. Dua "default gold" berbeda: state JS accentColor: '#d4a574' vs CSS --accent-gold: #b69d74 — dua sumber kebenaran untuk hal yang sama.

14. Palet swatch warna aksen kurang koheren: ada hijau terang 
#2ecc71 dan ungu lavender 
#c0a0e0, kontras jauh dari mood elegant gold/burgundy yang dibangun CSS.

15. Ornamen sudut .bali-frame::before/::after (offset -4px) berpotensi terpotong karena parent .editor__preview-frame punya overflow-x: hidden.

16. Potensi transform saling menimpa — jika kartu .pricing-card--featured juga pakai .glass-card: scale(1.03) vs translateY(-4px) saat hover tidak bisa digabung dalam CSS (bukan additive), jadi efek "featured" hilang sesaat saat di-hover.

17. Class .upload-area.dragover didefinisikan tapi tidak pernah dipicu — tidak ada onDragOver/onDrop di komponen, jadi drag-and-drop foto sebenarnya tidak berfungsi walau CSS-nya "siap".

♿ Bug Aksesibilitas

18. outline: none global di semua button, input, textarea, select, tanpa style focus pengganti (tidak ada :focus-visible di manapun) — pengguna keyboard tidak akan melihat indikator fokus sama sekali di seluruh situs. Ini pelanggaran WCAG 2.4.7 yang cukup serius.

19. Tab Info/Foto/Acara/Desain/Visual tidak punya role tablist/tab/tabpanel atau aria-selected — screen reader tidak tahu ini interaksi tab.

20. Swatch warna aksen (5 tombol polos) tanpa aria-label — tidak ada cara bagi screen reader mengetahui warna apa yang diwakili.

21. Area upload foto (div onClick) tidak tabIndex/role="button" — tidak bisa diakses via keyboard.

22. Kontras teks gagal WCAG AA: --text-muted: #999999 di atas putih ≈ 2.85:1 (butuh 4.5:1), --text-light: #bbbbbb untuk placeholder ≈ 1.9:1 — dipakai luas di subtitle, deskripsi kartu, link footer.

🧩 Bug Logika Data & UX

23. Duplikasi & inkonsistensi validasi — tombol "PREVIEW" menyalin ulang logic handleSave tapi tanpa validasi nama mempelai, jadi user bisa lompat ke preview dengan form kosong lewat tombol ini meski tombol "Simpan & Bagikan" akan menolaknya.

24. Toast saling menimpa — displayToast tidak membatalkan setTimeout sebelumnya. Dua toast berdekatan (misal upload foto → langsung klik Simpan gagal validasi) bisa membuat toast kedua hilang lebih cepat dari 3 detik.

25. Interval countdown tidak pernah di-clear meski sudah 0 — tetap setInterval jalan selamanya walau nilainya sudah '0'.

26. Pesan error membocorkan detail struktur folder development ke end-user production: "Silakan buat komponennya di src/components/templates/..."

27. Efek samping CSS variable global tidak dibersihkan — document.documentElement.style.setProperty('--accent-gold', ...) diset di :root dokumen utama tanpa cleanup saat unmount. Karena navigasi pakai Next.js router (client-side, tanpa reload), warna kustom ini berpotensi "bocor" ke halaman lain dalam sesi yang sama.

28. Warna aksen kemungkinan besar tidak muncul di preview template HTML — karena CSS variable di-set di document utama, bukan di document terpisah milik iframe (HtmlAdapter). Customisasi warna kemungkinan cuma berlaku untuk AgungTemplate.

29. Satu weddingDate untuk dua acara berbeda — form memisahkan waktu Akad dan Resepsi (yang di budaya Bali sering beda hari), tapi countdown cuma punya satu field tanggal.

30. Type-safety dilewati — (t as any).slug menandakan tipe TEMPLATES tidak benar-benar cocok dengan bentuk data CMS, berpotensi menyembunyikan bug lain saat API berubah bentuk.