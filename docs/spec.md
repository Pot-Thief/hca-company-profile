# Spec: Website Company Profile

Status: menunggu review. Ditulis di akhir Fase 1.
Branch: `feat/company-profile`

Dokumen ini mengunci content model, aturan validasi, batas komponen, dan acceptance
criteria per section. Rencana eksekusi per task ditulis terpisah di `docs/plan.md`
pada Fase 2.

---

## 1. Keputusan yang sudah dikunci

| Topik              | Keputusan                                                               | Alasan                                                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sumber konten      | JSON di `public/data/`, di-fetch runtime dari Server Component          | Editor mengubah teks tanpa menyentuh kode                                                                                                                                                                                         |
| Base URL konten    | `process.env.CONTENT_BASE_URL`, default ke origin sendiri               | `fetch` di server menolak URL relatif, jadi penyusun base URL wajib ada. Override-nya satu baris tambahan, dan membuka jalan memindahkan JSON ke luar artifact tanpa mengubah loader                                              |
| Cache              | `next: { revalidate: 60 }`, bisa di-override lewat `CONTENT_REVALIDATE` | Edit terlihat dalam 60 detik, halaman tetap disajikan dari cache sehingga target Lighthouse Performance 90 tercapai. Override-nya ada supaya test E2E bisa membuktikan konten berubah tanpa rebuild tanpa harus menunggu 60 detik |
| Bahasa label UI    | English                                                                 | Keputusan user di Fase 1                                                                                                                                                                                                          |
| Bahasa dokumentasi | `EDITING-CONTENT.md` Indonesia, `README.md` English                     | Pembaca berbeda                                                                                                                                                                                                                   |
| Nav mobile         | Panel full-screen (shadcn Sheet)                                        | Focus trap dan Esc ditangani Radix                                                                                                                                                                                                |
| Arah visual        | Editorial                                                               | Detail token diputuskan di Fase 5                                                                                                                                                                                                 |
| Interaksi opsional | Portfolio disclosure, team bio expand, copy-to-clipboard                | Tiga sisanya dibuang karena tidak lolos uji fungsi satu kalimat                                                                                                                                                                   |
| shadcn             | `button`, `sheet`, `collapsible`                                        | Tidak ada komponen lain yang diinstall                                                                                                                                                                                            |
| Tema               | Satu tema, tanpa toggle                                                 | Tidak ada di spec                                                                                                                                                                                                                 |

---

## 2. Arsitektur konten

### 2.1 Pemuatan

```
public/data/*.json
      |
      v
loadSection(name, schema)          src/lib/content/loader.ts
      |  fetch `${contentBase()}/${name}.json`, revalidate 60
      |  zod safeParse
      v
data terverifikasi + typed         src/lib/content/types.ts
      |
      v
app/page.tsx  Promise.all([...8 loader])
      |
      v
<Hero {...hero} /> <About {...about} /> ...
```

Komponen section tidak pernah melakukan fetch. Semua data masuk lewat props.

```ts
function contentBase() {
  if (process.env.CONTENT_BASE_URL) return process.env.CONTENT_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/data`;
  return 'http://localhost:3000/data';
}
```

### 2.2 Aturan validasi dan fallback

Setiap field punya default di schema. Konsekuensinya `safeParse` hanya gagal untuk
JSON malformed atau tipe root yang salah, dan field yang hilang tidak pernah
menjatuhkan section.

| Kondisi                           | Perilaku                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| Fetch gagal atau status bukan 2xx | `console.warn(file, status)`, pakai fallback                                          |
| JSON tidak bisa di-parse          | `console.warn(file, 'invalid JSON')`, pakai fallback                                  |
| Root bukan object                 | `console.warn(file, issues)`, pakai fallback                                          |
| Field wajib hilang                | Default dari schema dipakai, tanpa warn                                               |
| Tipe field salah                  | Default dipakai, `console.warn(file, path, expected, received)`                       |
| Field tidak dikenal               | Dibuang zod, tanpa warn                                                               |
| Satu item di array rusak          | Item itu dibuang, sisanya dirender, satu `console.warn` menyebut jumlah dan indeksnya |
| Array kosong                      | Section merender empty state                                                          |
| Nama ikon tidak dikenal           | Ikon fallback dipakai, `console.warn(name)`                                           |

Fallback tiap section adalah objek valid minimum dengan string kosong dan array
kosong. Halaman tidak pernah blank.

Validasi per elemen dilakukan helper `arrayOf(itemSchema)`, sehingga satu typo di
`services.json` item ke-7 menghasilkan 11 kartu plus satu warning, bukan section
yang hilang.

### 2.3 Judul section saat data tidak lengkap

Setiap section selalu merender `<h2>` supaya urutan heading tetap valid. Isinya
diambil berurutan: `headline`, lalu `label`, lalu id section. Elemen opsional
seperti `eyebrow` tidak dirender kalau nilainya kosong.

### 2.4 Schema per file

Kolom "Wajib" berarti wajib secara editorial. Secara teknis semuanya punya default,
jadi tidak ada yang bisa membuat halaman gagal render.

#### `site.json`

| Field              | Tipe              | Wajib | Default |
| ------------------ | ----------------- | ----- | ------- |
| `meta.title`       | string            | ya    | `""`    |
| `meta.description` | string            | ya    | `""`    |
| `meta.ogImage.src` | string            | ya    | `""`    |
| `meta.ogImage.alt` | string            | ya    | `""`    |
| `logo.wordmark`    | string            | ya    | `""`    |
| `nav[].label`      | string            | ya    | —       |
| `nav[].href`       | string            | ya    | —       |
| `cta.label`        | string            | ya    | `""`    |
| `cta.href`         | string            | ya    | `""`    |
| `footer.nav[]`     | `{label, href}[]` | tidak | `[]`    |
| `footer.copyright` | string            | ya    | `""`    |

Nilai `nav[].href` harus cocok dengan id section (`#about`, `#purpose`, `#services`,
`#portfolio`, `#team`, `#contact`). Id ditetapkan di kode, bukan di JSON, dan
tercatat di `EDITING-CONTENT.md` sebagai hal yang tidak boleh diubah.

#### `hero.json`

| Field                 | Tipe                   | Wajib | Default     |
| --------------------- | ---------------------- | ----- | ----------- |
| `eyebrow`             | string                 | tidak | `""`        |
| `headline`            | string                 | ya    | `""`        |
| `subheadline`         | string                 | tidak | `""`        |
| `backgroundImage.src` | string                 | ya    | `""`        |
| `backgroundImage.alt` | string                 | ya    | `""`        |
| `actions[].label`     | string                 | ya    | —           |
| `actions[].href`      | string                 | ya    | —           |
| `actions[].variant`   | `"primary" \| "ghost"` | tidak | `"primary"` |

#### `about.json`

| Field           | Tipe     | Wajib | Default |
| --------------- | -------- | ----- | ------- |
| `label`         | string   | tidak | `""`    |
| `headline`      | string   | ya    | `""`    |
| `paragraphs`    | string[] | ya    | `[]`    |
| `stats[].value` | string   | ya    | —       |
| `stats[].label` | string   | ya    | —       |

`paragraphs` diisi 2 sampai 3 item dan `stats` diisi 3 item. Jumlah ini adalah
panduan editorial supaya layout tidak pecah, bukan batasan yang dipaksakan schema.
Schema tidak memasang `min` atau `max` di mana pun, karena melanggar batas jumlah
seharusnya menghasilkan layout yang renggang, bukan section yang hilang.

`stats[].value` adalah string utuh (`"120+"`), tidak dipecah jadi angka dan suffix,
karena count-up sudah dibuang dari scope.

#### `purpose.json`

| Field           | Tipe   | Wajib | Default |
| --------------- | ------ | ----- | ------- |
| `label`         | string | tidak | `""`    |
| `headline`      | string | ya    | `""`    |
| `items[].title` | string | ya    | —       |
| `items[].body`  | string | ya    | —       |

`items` diisi 4 item.

#### `services.json`

| Field                 | Tipe                | Wajib | Default |
| --------------------- | ------------------- | ----- | ------- |
| `label`               | string              | tidak | `""`    |
| `headline`            | string              | ya    | `""`    |
| `items[].icon`        | string, nama lucide | ya    | —       |
| `items[].name`        | string              | ya    | —       |
| `items[].description` | string              | ya    | —       |

`items` diisi 12 item. Services bukan sequence, jadi tidak dinomori di UI.

#### `portfolio.json`

| Field                 | Tipe   | Wajib | Default |
| --------------------- | ------ | ----- | ------- |
| `label`               | string | tidak | `""`    |
| `headline`            | string | ya    | `""`    |
| `items[].logo.src`    | string | ya    | —       |
| `items[].logo.alt`    | string | ya    | —       |
| `items[].title`       | string | ya    | —       |
| `items[].category`    | string | ya    | —       |
| `items[].description` | string | tidak | `""`    |

`items` diisi 6 item. `description` terisi berarti baris jadi disclosure yang bisa
dibuka. `description` kosong berarti baris statis tanpa kontrol interaktif.

#### `team.json`

| Field                 | Tipe   | Wajib | Default |
| --------------------- | ------ | ----- | ------- |
| `label`               | string | tidak | `""`    |
| `headline`            | string | ya    | `""`    |
| `members[].photo.src` | string | ya    | —       |
| `members[].photo.alt` | string | ya    | —       |
| `members[].name`      | string | ya    | —       |
| `members[].role`      | string | ya    | —       |
| `members[].bio`       | string | ya    | —       |

`members` diisi 2 item.

#### `contact.json`

| Field              | Tipe                                                       | Wajib | Default   |
| ------------------ | ---------------------------------------------------------- | ----- | --------- |
| `label`            | string                                                     | tidak | `""`      |
| `headline`         | string                                                     | ya    | `""`      |
| `channels[].type`  | `email \| phone \| whatsapp \| address \| social \| hours` | ya    | —         |
| `channels[].label` | string                                                     | ya    | —         |
| `channels[].value` | string                                                     | ya    | —         |
| `channels[].href`  | string                                                     | tidak | tidak ada |

Channel dengan `type` di luar daftar dibuang beserta satu warn. Menambah atau
menghapus channel dilakukan dengan menambah atau menghapus elemen array, tanpa
menyentuh kode.

Link sosial hanya hidup di file ini. Footer memfilter `channels` bertipe `social`,
dan tidak punya array sosial sendiri.

---

## 3. Helper

### 3.1 `channelHref(type, value, href?)`

`href` eksplisit di JSON selalu menang atas hasil turunan.

| `type`     | Hasil                                                        |
| ---------- | ------------------------------------------------------------ |
| `email`    | `mailto:{value}`                                             |
| `phone`    | `tel:` + `value` tanpa spasi, tanda kurung, dan tanda hubung |
| `whatsapp` | `https://wa.me/` + digit dari `value`                        |
| `social`   | `value` apa adanya                                           |
| `address`  | `href` kalau ada, selain itu tidak ada link                  |
| `hours`    | tidak pernah link                                            |

Fungsi mengembalikan `undefined` untuk `address` tanpa `href` dan untuk `hours`.
Komponen merender `<a>` kalau hasilnya string, `<span>` kalau `undefined`.

Tombol copy hanya muncul pada `email`, `phone`, dan `whatsapp`.

### 3.2 Icon registry

Peta dari string nama lucide ke komponen. Nama tidak dikenal jatuh ke satu ikon
fallback plus `console.warn`. Registry adalah daftar kurasi, bukan seluruh set
lucide, supaya bundle tidak menarik ratusan ikon yang tidak dipakai.

Konsekuensinya editor hanya bisa memakai nama yang ada di registry. Daftar nama itu
ditulis lengkap di `EDITING-CONTENT.md`, dan menambah nama baru berarti menambah
satu baris di registry. Registry diisi ikon yang dipakai 12 service ditambah
cadangan yang masuk akal untuk perusahaan jasa IT.

---

## 4. Batas komponen

Semua section adalah Server Component. Client island hanya enam:

| Island         | Tanggung jawab                                                |
| -------------- | ------------------------------------------------------------- |
| `MobileNav`    | Buka dan tutup panel nav, focus trap dan Esc dari Radix Sheet |
| `NavLinks`     | IntersectionObserver menentukan active section                |
| `Reveal`       | Wrapper, menambah state terlihat saat elemen masuk viewport   |
| `PortfolioRow` | Disclosure, `aria-expanded`                                   |
| `TeamMember`   | Expand bio, `aria-expanded`                                   |
| `CopyButton`   | Menulis ke clipboard, konfirmasi visual 2 detik               |

### 4.1 Reveal tanpa JS

Konten terlihat penuh secara default. Kondisi tersembunyi hanya berlaku di dalam
`@media (scripting: enabled)`, dan dimatikan lagi di
`@media (prefers-reduced-motion: reduce)`.

```css
[data-reveal] {
  opacity: 1;
}

@media (scripting: enabled) {
  [data-reveal] {
    opacity: 0;
    transform: translateY(8px);
  }
  [data-reveal='shown'] {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

JS gagal berarti tidak ada animasi dan tidak ada konten yang hilang, tanpa satu
baris JS pun harus jalan lebih dulu.

### 4.2 Offset anchor

Tinggi navbar disimpan di CSS variable `--nav-h` dan tidak pernah berubah. Setiap
section memakai `scroll-margin-top: var(--nav-h)`.

Draf sebelumnya menyebut navbar mengecil saat scroll. Itu dibatalkan: tinggi adalah
properti layout, menganimasikannya menggeser seluruh isi di bawahnya dan melanggar
aturan di bagian 6 dokumen ini. Yang berubah saat scroll adalah latar navbar dan
garis bawahnya, keduanya murni perubahan warna pada elemen yang posisinya sudah
tetap.

---

## 5. Arah visual

Editorial. Detail token diputuskan dan disetujui di Fase 5 lewat `/styleguide`.
Yang sudah dikunci sekarang:

- Dasar terang sebagai warna utama, blok gelap dipakai sebagai ritme antar section.
  Latar near-black sepanjang halaman ditolak karena itu pola default yang mau
  dihindari.
- Tiga typeface: serif display kontras tinggi untuk headline, grotesque netral
  untuk body, mono untuk label dan caption. Inter tidak dipakai untuk semuanya.
- Kedalaman datang dari nilai grayscale, garis rambut 1px, dan spasi. Tanpa
  `shadow-2xl`, tanpa `backdrop-blur` dekoratif.
- Tanpa kartu generik. Pembatas antar item berupa garis, bukan border kotak
  membulat.
- Services dan Portfolio tidak dinomori.
- Grid services: 1 kolom di bawah 768px, 2 kolom di 768px, 3 kolom di 1280px.
  Dua belas item terlalu panjang sebagai daftar satu kolom di layar lebar.
- Palet monokrom murni: setiap nilai netral, R sama dengan G sama dengan B. Penjaga di
  `tokens.test.ts` menolak hex apa pun dengan selisih channel di atas nol, jadi hue tidak
  bisa masuk sama sekali, bukan sekadar dibatasi.
- Tepat dua radius, tanpa skala di antaranya: `0` untuk tepi struktural seperti blok section,
  gambar, dan sel berpembatas garis rambut, dan satu nilai kecil untuk permukaan interaktif.
  Skala radius bawaan Tailwind dikosongkan, jadi `rounded-lg` tidak menghasilkan apa pun.
  Nilai kecil itu ada karena tombol bersudut benar-benar lancip terbaca kaku di layar, bukan
  presisi. Print editorial memang tidak punya sudut membulat, tapi print juga tidak punya
  tombol.

---

## 6. Inventaris animasi

Tujuh animasi, semuanya hanya menyentuh `transform` dan `opacity`.

| Animasi                         | Fungsi                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Latar navbar muncul saat scroll | Memisahkan navbar dari konten yang lewat di bawahnya, supaya link tetap terbaca setelah pembaca meninggalkan hero |
| Active section indicator        | Memberi tahu pembaca posisinya di dalam halaman                                                                   |
| Reveal per section              | Menandai batas section saat masuk layar                                                                           |
| Hover baris portfolio           | Menunjukkan baris mana yang akan terbuka kalau diklik                                                             |
| Disclosure portfolio dan team   | Menampilkan detail panjang tanpa memindahkan pembaca ke halaman lain                                              |
| Panel nav mobile                | Menunjukkan panel datang dari mana, supaya tombol tutup mudah ditemukan                                           |
| Konfirmasi copy                 | Memberi bukti nilai sudah masuk clipboard                                                                         |

Token motion: `fast 150ms`, `base 250ms`, `slow 400ms`. Easing `ease-out` untuk
elemen masuk, `ease-in-out` untuk perubahan state. Semua didefinisikan sekali di
Fase 5 dan dipakai ulang, tidak ada komponen yang menulis timing sendiri.

---

## 7. Aset gambar

Placeholder di-generate lokal dengan `sharp`, yang sudah jadi dependency produksi
Next.js. Script sekali jalan di `scripts/`, hasilnya file raster yang di-commit.
File raster asli membuat `next/image`, konversi WebP dan AVIF, serta visual
regression benar-benar teruji. Placeholder SVG tidak melewati pipeline itu.

| Slot            | Nama file                                    | Ukuran    | Rasio |
| --------------- | -------------------------------------------- | --------- | ----- |
| Hero background | `hero-bg.jpg`                                | 1920x1080 | 16:9  |
| Portfolio logo  | `portfolio-01.png` sampai `portfolio-06.png` | 600x200   | 3:1   |
| Team photo      | `team-01.jpg`, `team-02.jpg`                 | 800x800   | 1:1   |

Rasio ini masuk ke schema sebagai dokumentasi dan diulang di `EDITING-CONTENT.md`.

---

## 8. Acceptance criteria per section

Berlaku untuk semua section: `<h2>` selalu ada dan urut di bawah `<h1>` hero,
semua gambar punya `alt` dari JSON, setiap elemen interaktif punya accessible name,
tidak ada teks yang ditulis di JSX.

Urutan heading dikunci begini: `<h1>` hanya di hero, `<h2>` satu per section, dan
`<h3>` untuk judul item di dalam section, yaitu nama service, judul proyek
portfolio, judul purpose, dan nama anggota team. Tidak ada level yang dilompati.

### Navbar

- Merender logo wordmark, satu link per item `site.nav`, dan satu tombol CTA.
- `site.nav` kosong berarti navbar tetap merender logo dan CTA.
- Di bawah 768px hanya tombol menu yang terlihat, dan menekannya membuka panel
  berisi seluruh link plus CTA.
- Panel bisa ditutup dengan Esc dan mengembalikan fokus ke tombol pembuka.
- Link section yang sedang berada di viewport ditandai, dan tandanya berubah saat
  scroll.

### Hero

- Merender `<h1>` dari `headline`.
- `eyebrow` atau `subheadline` kosong berarti elemennya tidak dirender sama sekali.
- Merender satu tombol per item `actions`, dengan `variant` menentukan tampilannya.
- `actions` kosong berarti tidak ada tombol dan tidak ada wadah tombol yang tersisa.
- Background image punya `alt` dari JSON dan memakai `priority`.

### About

- Merender satu `<p>` per item `paragraphs`.
- Merender 3 stat dari `stats`, masing-masing menampilkan `value` dan `label`.
- `paragraphs` atau `stats` kosong berarti blok itu tidak dirender, section tetap ada.

### Purpose

- Merender persis sejumlah item di `items`, diuji dengan fixture berisi 4 item.
- `items` kosong berarti empty state.

### Services

- Merender persis 12 item dari fixture.
- Setiap item menampilkan ikon dari `icon`, `name`, dan `description`.
- Nama ikon tidak dikenal merender ikon fallback dan memanggil `console.warn`.
- `items` kosong berarti `No services yet. Add items to services.json.`

### Portfolio

- Merender persis 6 item dari fixture, masing-masing dengan logo, `title`, dan
  `category`.
- Item dengan `description` merender kontrol disclosure ber-`aria-expanded`, yang
  bisa dioperasikan dengan Enter dan Space.
- Item tanpa `description` tidak merender kontrol interaktif apa pun.
- `items` kosong berarti `No projects yet. Add items to portfolio.json.`

### Team

- Merender persis 2 anggota, masing-masing dengan foto, `name`, dan `role`.
- `bio` berada di dalam disclosure ber-`aria-expanded`.
- `members` kosong berarti `No team members yet. Add members to team.json.`

### Contact

- Tidak ada `<form>` maupun `<input>` di seluruh halaman.
- Setiap channel merender `href` sesuai tabel di bagian 3.1.
- `address` tanpa `href` dan `hours` dirender sebagai teks, bukan link.
- Tombol copy hanya muncul di `email`, `phone`, dan `whatsapp`, punya accessible
  name, dan menampilkan konfirmasi selama 2 detik setelah ditekan.
- `channels` kosong berarti `No contact channels yet. Add channels to contact.json.`

### Footer

- Merender logo wordmark, `footer.nav`, link sosial hasil filter `contact.channels`,
  dan `footer.copyright`.
- Tidak ada channel bertipe `social` berarti blok sosial tidak dirender.

---

## 9. Strategi test

| Lapis                                                                        | Alat                          | Target          |
| ---------------------------------------------------------------------------- | ----------------------------- | --------------- |
| Schema, loader, `channelHref`, icon registry                                 | Vitest                        | 100% branch     |
| Sembilan komponen section                                                    | Vitest, React Testing Library | ≥ 90% statement |
| Perakitan halaman, scroll, keyboard, reduced-motion, axe, visual, Lighthouse | Playwright                    | skenario Fase 8 |

Bukti nol teks hardcoded dilakukan dua arah:

1. Fixture memakai nilai sentinel unik per field, dan test mengassert nilai itu
   yang muncul di DOM.
2. Satu test memindai file di `src/components/sections/` untuk string literal yang
   dirender sebagai teks di JSX. Yang diizinkan hanya string empty state, dan
   daftar itu ditulis eksplisit di test.

---

## 10. Asumsi dan penyimpangan dari prompt awal

| Hal                          | Prompt                    | Spec ini                                                               | Alasan                                                                                                                                                                |
| ---------------------------- | ------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cache                        | `cache: 'no-store'`       | `revalidate: 60`                                                       | Delapan fetch per request membuat target Lighthouse Performance 90 sulit dicapai. Edit tetap terlihat dalam 60 detik                                                  |
| Kontak "semuanya link aktif" | semua channel jadi link   | `hours` teks, `address` link hanya kalau `href` diisi                  | Jam operasional tidak punya skema URL. Alamat jadi link kalau editor mengisi link petanya                                                                             |
| Ganti JSON tanpa rebuild     | butir DoD                 | Dibuktikan lewat `CONTENT_BASE_URL` diarahkan ke fixture server di E2E | File di `public/` ikut jadi artifact deployment, jadi tidak bisa diedit setelah deploy. Mekanismenya yang dibuktikan, dan pintunya terbuka kalau JSON dipindah keluar |
| `context7`                   | dipakai untuk dokumentasi | `WebFetch` ke dokumentasi resmi                                        | MCP tidak terpasang di environment ini                                                                                                                                |
| plugin `playwright`          | dipakai di Fase 8         | Playwright CLI langsung                                                | Plugin tidak terpasang                                                                                                                                                |
| `no-ai-slop`                 | dipakai di Fase 11        | Checklist Bagian 5.3 dijalankan manual, laporan deteksi tetap ditempel | Skill tidak terpasang                                                                                                                                                 |

---

## 11. Di luar scope

Tidak dibangun, dan tidak akan ditambahkan tanpa permintaan baru: form apa pun,
newsletter, CMS, database, backend, section di luar sembilan yang terdaftar,
toggle tema, multi bahasa, blog, dan halaman kedua.
