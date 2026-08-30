# Panduan Mengedit Konten Website

Panduan ini untuk siapa saja yang perlu mengubah teks, gambar, atau daftar isi di
website ini, tanpa perlu tahu cara kerja kodenya.

## 1. Aturan dasar

Semua teks dan tautan gambar yang tampil di website disimpan dalam delapan file
di folder `public/data/`:

- `site.json` — nama perusahaan, menu navigasi, tombol, dan label tombol kecil
- `hero.json` — judul besar paling atas halaman
- `about.json` — bagian "About"
- `purpose.json` — bagian "Purpose"
- `services.json` — bagian "Services"
- `portfolio.json` — bagian "Portfolio"
- `team.json` — bagian "Team"
- `contact.json` — bagian "Contact"

Setiap file berisi baris berbentuk `"kunci": "nilai"`. **Kunci** (tulisan di
sebelah kiri tanda titik dua, contoh `"headline"`) adalah nama teknis yang
dibaca oleh website — jangan pernah diubah. **Nilai** (tulisan di sebelah kanan,
di dalam tanda kutip) adalah teks yang tampil di layar — ini yang boleh dan
memang untuk diubah.

Contoh:

```json
"headline": "Lorem ipsum dolor sit amet consectetur"
```

`headline` adalah kunci (jangan diubah). `"Lorem ipsum dolor sit amet
consectetur"` adalah nilai (ganti dengan judul Anda sendiri).

---

## 2. Mengubah teks

Satu contoh sebelum/sesudah untuk tiap file.

### `site.json` — nama perusahaan dan menu

Kunci `logo.wordmark`:

```json
// Sebelum
"logo": { "wordmark": "PLACEHOLDER" }

// Sesudah
"logo": { "wordmark": "PT Nama Perusahaan" }
```

Kunci `nav[0].label` (nama menu pertama):

```json
// Sebelum
{ "label": "About", "href": "#about" }

// Sesudah
{ "label": "Tentang Kami", "href": "#about" }
```

Perhatikan: nilai `"href"` (`#about`) **tidak ikut diubah** — lihat Bagian 6.

`site.json` juga punya kunci `ui` yang isinya label tombol-tombol kecil di
seluruh halaman:

| Kunci             | Tampil di mana                                       |
| ----------------- | ---------------------------------------------------- |
| `menu`            | Tombol buka menu di layar sempit (HP)                |
| `closeMenu`       | Tombol tutup menu di layar sempit                    |
| `copy`            | Tombol salin di sebelah email/telepon/WhatsApp       |
| `copied`          | Teks yang muncul sesaat setelah tombol salin ditekan |
| `expandBio`       | Tombol "buka" riwayat anggota tim                    |
| `collapseBio`     | Tombol "tutup" riwayat anggota tim                   |
| `expandProject`   | Tombol "buka" detail proyek portfolio                |
| `collapseProject` | Tombol "tutup" detail proyek portfolio               |

### `hero.json` — judul besar

Kunci `headline`:

```json
// Sebelum
"headline": "Lorem ipsum dolor sit amet consectetur adipiscing elit"

// Sesudah
"headline": "Solusi Teknologi untuk Bisnis Anda"
```

### `about.json`

Kunci `headline` dan salah satu isi `paragraphs`:

```json
// Sebelum
"headline": "Lorem ipsum dolor sit amet consectetur",
"paragraphs": ["Lorem ipsum dolor sit amet, consectetur adipiscing elit..."]

// Sesudah
"headline": "Siapa Kami",
"paragraphs": ["Kami adalah perusahaan yang berdiri sejak 2015..."]
```

Bagian ini idealnya diisi 2 sampai 3 paragraf, dan 3 kartu `stats` (angka +
label di bawahnya, contoh `"120+"` dan `"Klien Puas"`).

### `purpose.json`

Kunci `items[0].title` dan `items[0].body`:

```json
// Sebelum
{ "title": "Lorem Ipsum Placeholder One", "body": "Lorem ipsum dolor sit amet..." }

// Sesudah
{ "title": "Fokus pada Kualitas", "body": "Setiap proyek melewati proses..." }
```

Bagian ini dirancang untuk persis 4 item.

### `services.json`

Kunci `items[0].name` dan `items[0].description`:

```json
// Sebelum
{ "icon": "code", "name": "Service Name Placeholder 01", "description": "Lorem ipsum..." }

// Sesudah
{ "icon": "code", "name": "Pengembangan Aplikasi", "description": "Kami membangun aplikasi..." }
```

Kunci `icon` juga wajib diisi — lihat daftar nama ikon yang boleh dipakai di
Bagian 4.

### `portfolio.json`

Kunci `items[0].title` dan `items[0].category`:

```json
// Sebelum
{ "title": "Client Placeholder 01", "category": "Lorem ipsum" }

// Sesudah
{ "title": "Toko Online Maju Jaya", "category": "E-commerce" }
```

### `team.json`

Kunci `members[0].name`, `members[0].role`, dan `members[0].bio`:

```json
// Sebelum
{ "name": "Team Member Placeholder 01", "role": "Role Placeholder", "bio": "Lorem ipsum..." }

// Sesudah
{ "name": "Budi Santoso", "role": "Direktur Teknologi", "bio": "Budi memimpin tim..." }
```

### `contact.json`

Kunci `channels[].value`, contoh untuk email:

```json
// Sebelum
{ "type": "email", "label": "Email", "value": "hello@placeholder.test" }

// Sesudah
{ "type": "email", "label": "Email", "value": "halo@perusahaananda.com" }
```

Cara menambah dan menghapus baris kontak dijelaskan di Bagian 5.

---

## 3. Mengubah gambar

Semua file gambar disimpan di folder `public/assets/images/`. Setiap slot
punya **nama file tetap** dan **ukuran piksel serta rasio** yang harus diikuti
supaya tampilannya tidak gepeng atau terpotong aneh.

| Slot                    | Nama file                                    | Ukuran piksel | Rasio |
| ----------------------- | -------------------------------------------- | ------------- | ----- |
| Gambar latar Hero       | `hero-bg.jpg`                                | 1920 × 1080   | 16:9  |
| Logo klien di Portfolio | `portfolio-01.png` sampai `portfolio-06.png` | 600 × 200     | 3:1   |
| Foto anggota Tim        | `team-01.jpg`, `team-02.jpg`                 | 800 × 800     | 1:1   |

Cara mengganti: siapkan gambar baru dengan ukuran piksel yang sama persis,
beri nama file **yang sama persis** dengan nama di tabel (termasuk huruf besar
kecil dan angka di depannya), lalu ganti file lama dengan file baru itu di
folder yang sama. Nama file tidak pernah disebut di dalam JSON kecuali sebagai
nilai `"src"`, jadi kalau nama filenya diganti, kunci `"src"` yang menunjuk ke
file itu juga harus diubah supaya tetap cocok, contoh:

```json
"backgroundImage": { "src": "/assets/images/hero-bg.jpg", "alt": "..." }
```

Setiap gambar juga punya kunci `"alt"` di sebelahnya, isinya kalimat pendek
yang menjelaskan isi gambar itu (dibaca oleh pengguna tunanetra lewat pembaca
layar, dan oleh mesin pencari). Selalu ubah `"alt"` setiap kali gambar diganti
supaya kalimatnya tetap menggambarkan gambar yang baru.

---

## 4. Daftar nama ikon (untuk `services.json`)

Setiap item di `services.json` punya kunci `"icon"`. Nilainya harus **persis
sama** dengan salah satu dari 20 nama berikut (huruf kecil semua, tanda hubung
`-` untuk nama dua kata):

```
boxes, cloud, code, cpu, database, globe, headphones, layers, line-chart,
lock, monitor, network, search, server, settings, shield, smartphone,
terminal, workflow, wrench
```

Nama di luar daftar ini akan tampil sebagai lingkaran putus-putus, bukan
ikon yang dimaksud — lihat Bagian 7.

---

## 5. Menambah dan menghapus item

`services.json`, `portfolio.json`, dan `team.json` masing-masing punya satu
daftar (`items` untuk dua yang pertama, `members` untuk tim). Menambah atau
menghapus baris di sana berarti menambah atau menghapus satu blok `{ ... }` di
dalam daftar itu.

**Menambah**: salin satu blok `{ ... }` yang sudah ada (termasuk tanda kurung
kurawal pembuka dan penutupnya), tempel di bawah blok terakhir, beri tanda
koma `,` di akhir blok sebelumnya, lalu ubah isinya.

**Menghapus**: hapus satu blok `{ ... }` secara utuh beserta satu tanda koma
di dekatnya (koma yang memisahkannya dari blok tetangga), supaya tidak
tersisa koma ganda atau koma yang menggantung di akhir daftar.

Layout halaman ini dirancang untuk jumlah item berikut. Menambah atau
mengurangi sedikit tidak merusak website, tapi jumlah yang jauh berbeda akan
membuat tampilan grid terasa janggal (baris tidak penuh atau terlalu panjang):

| File             | Kunci daftar | Jumlah yang dirancang |
| ---------------- | ------------ | --------------------- |
| `services.json`  | `items`      | 12 item               |
| `portfolio.json` | `items`      | 6 item                |
| `team.json`      | `members`    | 2 orang               |

Khusus `portfolio.json`: item yang kunci `"description"`-nya diisi akan
mendapat tombol buka/tutup detail. Item yang kunci `"description"`-nya
dihapus seluruhnya akan tampil sebagai baris biasa tanpa tombol.

---

## 6. Menambah dan menghapus channel kontak

`contact.json` punya daftar `channels`. Setiap channel punya kunci `"type"`
yang nilainya harus persis salah satu dari enam kata berikut, dan setiap kata
menentukan apa yang dihasilkan di layar:

| `type`     | Yang dihasilkan                                                                     |
| ---------- | ----------------------------------------------------------------------------------- |
| `email`    | Tautan `mailto:` yang membuka aplikasi email, plus tombol salin                     |
| `phone`    | Tautan telepon (`tel:`) yang bisa langsung ditekan di HP, plus tombol salin         |
| `whatsapp` | Tautan yang membuka WhatsApp memakai angka di `"value"`, plus tombol salin          |
| `social`   | Tautan biasa memakai `"value"` apa adanya — isi `"value"` dengan alamat web lengkap |
| `address`  | Teks biasa, bukan tautan, kecuali diberi kunci `"href"` tambahan (lihat di bawah)   |
| `hours`    | Selalu teks biasa, tidak pernah menjadi tautan                                      |

Contoh menambah channel Instagram:

```json
{ "type": "social", "label": "Instagram", "value": "https://instagram.com/perusahaananda" }
```

Untuk membuat alamat kantor bisa diklik dan membuka peta, tambahkan kunci
`"href"` di channel bertipe `address`:

```json
{
  "type": "address",
  "label": "Office",
  "value": "Jalan Placeholder No. 1",
  "href": "https://maps.google.com/?q=Jalan+Placeholder+No.+1"
}
```

Menambah dan menghapus channel mengikuti cara yang sama seperti Bagian 5:
salin/tempel atau hapus satu blok `{ ... }` beserta koma di dekatnya.

---

## 7. Yang tidak boleh diubah

- **Nama kunci** (tulisan sebelum tanda titik dua, contoh `headline`,
  `items`, `type`, `href`). Ini nama teknis yang dibaca oleh website, bukan
  teks yang tampil di layar. Mengubah, menghapus, atau menerjemahkannya akan
  membuat bagian itu berhenti tampil.
- **Struktur daftar**, yaitu tanda kurung siku `[ ]` yang membungkus deretan
  blok `{ ... }`. Jangan pernah dihapus atau diganti jenis tandanya.
- **Nilai `href` di dalam `site.json` bagian `nav`**. Nilai-nilainya
  (`#about`, `#purpose`, `#services`, `#portfolio`, `#team`, `#contact`) harus
  tetap persis sama karena itulah yang menghubungkan setiap menu ke bagian
  halaman yang bersangkutan. Hanya nilai `"label"` di sebelahnya yang boleh
  diganti.

---

## 8. Memeriksa file sebelum diunggah

Sebelum mengunggah file JSON yang sudah diubah, periksa dulu supaya
susunannya tidak salah tulis (kurang tanda kutip, kurang koma, atau kurang
kurung). Caranya:

1. Buka situs pemeriksa JSON, misalnya <https://jsonlint.com>.
2. Salin seluruh isi file yang sudah diubah, tempel ke kotak di situs
   tersebut.
3. Tekan tombol "Validate JSON" (atau sejenisnya).
4. Kalau muncul tanda hijau/pesan "Valid JSON", file aman diunggah. Kalau
   muncul pesan merah, situs itu akan menunjukkan baris tempat kesalahannya —
   biasanya tanda koma yang lupa dihapus atau lupa ditambah, atau tanda kutip
   yang tidak berpasangan.

---

## 9. Troubleshooting

**Satu bagian di halaman terlihat kosong / kehilangan sebagian besar isinya**

Penyebab yang paling umum: ada kesalahan susunan (tanda kutip atau tanda koma
yang tidak lengkap) di suatu tempat dalam file JSON itu. Kalau seluruh file
tidak bisa dibaca, bagian itu hanya menampilkan judul kecil tanpa isi lain.
Perbaikan: buka file yang bersangkutan (nama filenya sama dengan nama
bagian, misalnya `services.json` untuk bagian Services), periksa dengan
pemeriksa JSON di Bagian 8, lalu perbaiki baris yang ditunjuk sebagai
kesalahan.

**Sebuah ikon di bagian Services tampil sebagai lingkaran putus-putus**

Penyebab: nilai kunci `"icon"` pada item itu tidak sama persis dengan salah
satu nama di daftar Bagian 4 (salah ketik, huruf besar, atau lupa tanda
hubung). Perbaikan: buka `services.json`, cari item yang ikonnya salah, ganti
nilai `"icon"` dengan salah satu nama yang tertulis persis di Bagian 4.

**Tautan di bagian Contact tidak mengarah ke mana-mana saat diklik**

Ada dua kemungkinan penyebab, keduanya di `contact.json`:

1. Nilai `"type"` pada channel itu salah ketik dan tidak sama persis dengan
   salah satu dari enam kata di Bagian 6 — channel dengan `"type"` yang tidak
   dikenal akan dibuang seluruhnya dari halaman. Perbaikan: perbaiki ejaan
   `"type"` sampai sama persis dengan salah satu dari: `email`, `phone`,
   `whatsapp`, `address`, `social`, `hours`.
2. Channel itu bertipe `address` atau `hours` — keduanya memang **sengaja**
   tidak pernah menjadi tautan, kecuali `address` diberi kunci `"href"`
   tambahan (lihat Bagian 6). Kalau ini yang terjadi, bukan berarti ada yang
   rusak.
