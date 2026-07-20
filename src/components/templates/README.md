# Panduan Standarisasi Template Undangan Bali

Dokumen ini adalah panduan resmi ("syarat-syarat wajib") bagi tim developer dan desainer ketika ingin membuat desain template undangan baru untuk platform **Undangan Bali**.

Arsitektur aplikasi ini menggunakan sistem **Plug-and-Play**. Artinya, Editor akan mengumpulkan data dari pengguna, dan mengirimkannya ke komponen Template Anda. Komponen Anda hanya bertugas **menerima data dan merendernya dengan cantik**.

---

## 1. Syarat Komponen Wajib (Data Contract)
Setiap template **HARUS** dibuat sebagai fungsional komponen React yang menerima props `TemplateProps`.

Anda wajib mengimpor tipe data dari `src/types/template.ts`.

### Struktur Tipe Data (`TemplateProps`)
Komponen template Anda akan selalu menerima 3 objek properti berikut:

```typescript
import { TemplateProps } from '@/types/template';

// data: Berisi seluruh input form dari mempelai
// photo: URL base64 gambar utama pengantin (bisa bernilai null jika belum diupload)
// timeLeft: Objek waktu untuk fitur countdown (hari, jam, menit, detik)
```

Berikut adalah rincian isi dari object `data` (`InvitationData`) yang *pasti* tersedia dan bisa Anda gunakan di dalam desain:
- `groomName` (string) - Nama mempelai pria
- `brideName` (string) - Nama mempelai wanita
- `weddingDate` (string) - Tanggal acara
- `mainVenue` (string) - Lokasi utama acara
- `dressCode` (string) - Pakaian/tema tamu
- `akadTime` & `akadVenue` (string) - Waktu & Tempat Akad/Pawiwahan
- `resepsiTime` & `resepsiVenue` (string) - Waktu & Tempat Resepsi
- `mapLink` (string) - Link Google Maps
- `accentColor` (string) - Warna utama (hex) pilihan pengguna
- `fontFamily` (string) - Font pilihan pengguna
- `greeting` (string) - Kalimat pembuka (contoh: "Om Swastyastu")

---

## 2. Syarat Styling & CSS
Agar warna aksen dan font dapat diubah secara dinamis oleh pengguna melalui Editor, Anda **wajib** menggunakan *CSS Variables* bawaan aplikasi ketika melakukan styling template Anda.

Gunakan variabel berikut di elemen HTML/CSS template Anda:
- **Warna Aksen:** `color: var(--accent-gold)` atau `background: var(--accent-gold)`
- **Font Utama/Heading:** `fontFamily: var(--font-heading)`
- **Font Tulisan Sambung:** `fontFamily: var(--font-script)` atau gunakan langsung dari `data.fontFamily`.

---

## 3. Contoh Implementasi Sederhana
Berikut adalah kerangka *boilerplate* wajib ketika Anda membuat template baru, misalnya `MinimalisTemplate.tsx`:

```tsx
import React from 'react';
import { TemplateProps } from '@/types/template';

export default function MinimalisTemplate({ data, photo, timeLeft }: TemplateProps) {
  return (
    <div className="template-minimalis" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Warna Tema Dinamis */}
      <h1 style={{ color: 'var(--accent-gold)', fontFamily: data.fontFamily }}>
        {data.groomName} & {data.brideName}
      </h1>
      
      {/* Menampilkan Foto Jika Ada */}
      {photo && (
        <img src={photo} alt="Pengantin" style={{ width: '100%', borderRadius: '8px' }} />
      )}

      {/* Menampilkan Waktu Mundur */}
      <div className="countdown">
        <span>{timeLeft.days} Hari</span>
      </div>
      
      {/* Menampilkan Lokasi & Waktu */}
      <div>
        <h2>Resepsi</h2>
        <p>{data.resepsiTime} di {data.resepsiVenue}</p>
      </div>
    </div>
  );
}
```

---

## 4. Cara Meregistrasi Template Baru
Setelah Anda selesai membuat file komponen template di folder `src/components/templates/`, lakukan hal ini agar template muncul di website:

1. **Daftarkan di Editor**: Buka `src/app/editor/page.tsx`
2. Temukan blok `<div id="previewFrame">`
3. Tambahkan logika pengkondisian untuk memuat template Anda berdasarkan ID:
   ```tsx
   {template === 'agung' && <AgungTemplate data={formData} photo={photo} timeLeft={timeLeft} />}
   ```
4. **Tampilkan di Galeri**: Buka `src/config/templates.ts`, tambahkan meta data template Anda ke array `TEMPLATES` dengan tipe `react`.

---

## 5. Membuat Template HTML Murni (Vanilla)
Jika tim Anda lebih memilih menggunakan HTML dan CSS tanpa React, Anda dapat menggunakan rute ini:

1. Buat folder baru di dalam `public/templates/[ID_TEMPLATE]`.
2. Buat file `index.html` dan `style.css` di dalamnya.
3. Gunakan sintaks kurung kurawal ganda (Mustache style) untuk memanggil variabel, contoh: `{{groomName}}`, `{{weddingDate}}`.
4. Daftarkan template di `src/config/templates.ts` dengan menyetel property `type: 'html'`.

Contoh file `index.html`:
```html
<div class="undangan-saya">
  <h1 style="color: var(--accent-gold);">{{groomName}} & {{brideName}}</h1>
  <p>{{weddingDate}}</p>
  <img src="{{photoUrl}}" alt="Foto Pasangan" />
</div>
```

Editor akan secara cerdas memuat file tersebut dan mengganti tag-tag tersebut dengan inputan dari klien secara seketika!

---
Dengan mengikuti panduan ini, setiap desain yang dibuat tim Anda akan otomatis bekerja dengan fitur *live preview*, pengaturan warna, font, dan fitur upload gambar yang ada di Editor. Selamat berkreasi!
