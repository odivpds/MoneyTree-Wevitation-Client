1. Arsitektur informasi & navigasi
Tidak ada jalan keluar dari editor. Begitu masuk, tidak ada breadcrumb/link kembali ke galeri template atau dashboard. Kalau user ingin membandingkan template lain, mereka harus tahu cara mengubah URL sendiri.
Ganti template = ambigu terhadap data lama. Karena data form disimpan di satu key global (undanganBali_data), bukan per-template, ganti template lewat URL akan otomatis menerapkan data yang sama tanpa memberi tahu user bahwa itu terjadi. User bisa bingung: "kenapa nama saya sudah otomatis terisi di template yang baru saya buka?"
Dua model interaksi yang bertabrakan tanpa penjelasan: tab Info/Foto/Acara/Desain adalah form-based editing, tab Visual Edit adalah direct-manipulation editing (klik elemen di preview). Ini dua mental model berbeda dalam satu produk, dan tidak ada penjelasan kapan harus pakai yang mana — apalagi kalau field yang sama (misal nama mempelai) bisa diedit lewat dua jalur berbeda, dengan potensi konflik nilai (form vs override) yang user tidak akan pernah tahu mana yang menang.
2. Feedback & status sistem
Perubahan visual (warna aksen, font) tidak dikonfirmasi apa pun selain preview yang (mudah-mudahan) berubah. Tidak ada toast, highlight, atau indikator "diterapkan". Kalau device kecil dan preview tidak terlihat penuh, user tidak yakin klik-nya "kena".
Fetch template dari CMS tidak punya loading state. User bisa mulai mengisi form di atas data lokal, lalu tiba-tiba (tanpa peringatan) tampilan berubah begitu fetch API selesai — konten "bergeser di bawah kaki" tanpa penjelasan.
Tombol Simpan/Preview tidak disable saat proses berjalan (ada delay 1.5 detik sebelum redirect). Tidak ada spinner/disabled state, jadi user berpotensi klik dua-tiga kali karena mengira klik pertama tidak berhasil — di beberapa alur ini bisa memicu perilaku ganda yang tak diinginkan.
Mode Visual Builder tidak punya indikator "sedang aktif" di luar teks statis. Tidak ada visual cue (misal border biru di sekeliling preview) yang menegaskan "sekarang preview kamu klik-able", terpisah dari kondisi normal.
3. Pencegahan & pemulihan error
Validasi tidak konsisten antar tombol. "Simpan & Bagikan" mengecek nama mempelia, tapi "Preview" tidak — padahal keduanya menyimpan ke localStorage dengan cara yang nyaris sama. User bisa lompat ke preview dengan form kosong dan bingung kenapa hasilnya aneh.
Validasi cuma di level toast umum, tidak per-field. Kalau salah satu input bermasalah, user harus menebak sendiri field mana yang dimaksud — tidak ada border merah/pesan di bawah input yang relevan.
Tidak ada peringatan sebelum keluar/tutup tab dengan perubahan belum disimpan. Karena data hanya persist saat klik Simpan/Preview secara eksplisit (tidak per-perubahan), risiko kehilangan isian cukup nyata, khususnya di data sepenting nama & tanggal pernikahan.
Tidak ada undo, terutama krusial di tab Visual Edit — begitu teks/gambar suatu elemen ditimpa, versi sebelumnya tidak bisa dikembalikan kecuali diketik ulang manual.
Hapus foto langsung permanen tanpa konfirmasi (risiko rendah karena re-upload mudah, tapi tetap satu klik yang tak bisa dibatalkan).
4. Beban kognitif & discoverability
Mekanisme Visual Edit tidak self-explanatory. Instruksinya cuma satu kalimat teks ("klik elemen apa saja di preview") tanpa affordance visual di dalam preview sendiri (hover state, cursor berubah, highlight saat di-hover) yang bisa membantu user paham elemen mana yang sebenarnya bisa diklik sebelum mereka coba-coba.
"Struktur Halaman" (quick-jump section) cuma muncul kalau iframe mengirim data SECTIONS_DETECTED — kalau gagal (seperti pada template non-iframe), fitur ini menghilang begitu saja tanpa fallback atau penjelasan. User tidak akan pernah tahu fitur itu ada.
Swatch warna tanpa nama/label. User tidak tahu apakah warna itu "Emas Klasik" atau sekadar kotak warna acak — untuk keputusan yang cukup personal (warna undangan pernikahan), tidak adanya label/nama warna mengurangi rasa kontrol.
✅ Yang sudah bagus di bagian ini: pilihan font ditampilkan dalam font aslinya ("Great Vibes — Contoh Nama" ditulis pakai Great Vibes) — ini contoh affordance yang baik, dan empty state "belum ada elemen dipilih" di tab Visual (ikon + teks) juga sudah tepat.
5. UX mobile — ini yang paling perlu diperhatikan

Di layar ≤1024px, CSS memindahkan preview ke atas (order: -1) dengan tinggi calc(100vh - 140px), minimal 600px. Artinya di HP, user harus scroll melewati hampir satu layar penuh berisi preview (non-interaktif untuk tugas utama) sebelum sampai ke form isian pertama. Untuk tugas yang fundamentalnya adalah mengisi data, ini menempatkan konten sekunder di atas konten primer — kebalikan dari yang seharusnya. Mengingat mayoritas pengguna kemungkinan besar mengedit dari HP, ini bukan masalah kecil.

Selain itu, interaksi Visual Edit (klik elemen presisi di dalam iframe) jauh lebih sulit dilakukan dengan jari di layar kecil dibanding mouse — elemen teks kecil di undangan berpotensi susah di-tap dengan akurat.

6. Efisiensi alur kerja
Dua tombol dengan logika simpan yang nyaris identik ("Preview" dan "Simpan & Bagikan" sama-sama menulis ke localStorage) menciptakan pertanyaan implisit di kepala user: "kalau saya preview dulu, apa itu juga tersimpan? Apa bedanya dengan tombol satunya?" — tidak ada penjelasan bedanya.
Tidak ada opsi "simpan sebagai draft" terpisah dari "final/siap dibagikan". Untuk konteks pernikahan, biasanya ada tahap review keluarga sebelum undangan benar-benar dikirim ke tamu — produk ini tidak mengakomodasi alur "saya masih coba-coba" vs "ini sudah final", padahal itu kebutuhan nyata di domain ini.
Tidak bisa menyimpan beberapa versi/draft untuk dibandingkan (misalnya template A vs B) — karena semua data global per browser, mencoba template lain berarti berpotensi "menimpa" pekerjaan sebelumnya secara diam-diam.
7. Kepercayaan pengguna terhadap keamanan data

Ini poin yang menurut saya paling penting secara emosional: data yang diisi (nama, tanggal, lokasi pernikahan) hanya tersimpan di localStorage browser — hilang kalau ganti device, ganti browser, atau cache dibersihkan. Tapi toast setelah simpan berbunyi "Undangan berhasil disimpan! 🎉" — bahasa yang menyiratkan keamanan/persistensi yang sebenarnya rapuh. Untuk data yang secara emosional bernilai tinggi dan biasanya cuma diisi sekali, ini adalah gap kepercayaan yang nyata: produk perlu jujur soal di mana data disimpan, atau (lebih baik) benar-benar dipindah ke penyimpanan server.

8. Microcopy & konsistensi bahasa
Tombol "💾 SIMPAN & BAGIKAN" menjanjikan dua aksi (simpan dan bagikan), tapi yang terjadi hanya simpan lalu redirect ke halaman preview — tidak ada aksi "bagikan" yang benar-benar terjadi di titik ini. Label tombol seharusnya konsisten dengan hasil aksinya: kalau belum benar-benar dibagikan, jangan janjikan itu di label.
Toast sukses bilang "disimpan", bukan "dibagikan" — mismatch kecil tapi konsisten dengan poin di atas: instruksi UI (nama tombol) dan hasil (toast) sebaiknya memakai kata kerja yang sama persis, supaya user belajar pola aplikasi dengan andal.
Pesan error kosong-template membocorkan istilah teknis (folder src/components/templates/) ke end-user — bukan bahasa yang mengundang aksi, hanya menjelaskan struktur sistem yang tidak relevan bagi pengantin.
9. Aksesibilitas sebagai hambatan tugas (bukan cuma checklist)

Karena outline: none diterapkan global tanpa pengganti fokus, pengguna keyboard-only benar-benar kehilangan jejak posisi mereka saat mengisi form sepanjang ini — bukan cuma isu kepatuhan WCAG, tapi benar-benar menghalangi penyelesaian tugas bagi sebagian pengguna.