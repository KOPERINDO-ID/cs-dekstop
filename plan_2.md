# TASK: Sync Fitur Sales → CS (Sesi 2: Style HC Multi-Select System)

## Konteks

Lanjutan dari Sesi 1. Sesi ini memindahkan sistem multi-select style untuk produk HC dari Sales ke CS.

**Sales sudah punya sistem canggih** untuk memilih style HC (multi-select dengan chip warna, SmartSelect sync, parser string style dari DB). CS masih pakai versi sederhana.

**Pastikan Sesi 1 sudah selesai sebelum mulai ini.**

---

## Background: Perbedaan Sistem Style HC

**Sales** punya fungsi-fungsi ini yang CS belum punya:
- `deployStyleToSelectFromDB(styleRaw, hex, idx)` — isi multi-select style dari data DB
- `parseStyleString(raw)` — parse string style dari DB (split koma/newline)
- `keyNormalize(label)` — normalisasi label untuk pencocokan (handle "Full Colour" vs "Asesoris F.C")
- `normalizePlusPrefix(s)` — rapikan "+ 2 Buckle" → "+2 Buckle"
- `extractParenColor(styleRaw)` — ambil nama warna dari "Full color (Teracota)"
- `removeChipHolder(idx)` — hapus chip warna
- `setSelectWhiteOnChoose(selector)` — ubah warna text select saat dipilih
- `escapeHtmlPerforma()` — escape HTML
- `changeWarnaFullColorPerforma()` — ubah warna untuk Full Color
- `selectBoxStyleFullColorPerforma()` — load style Full Color

**`firstShowPerformaEdit()`** di Sales lebih canggih daripada CS karena memanggil `deployStyleToSelectFromDB()`.

---

## TASK 1: Copy Helper Style Functions

**File target:** `cs/js/penjualan.js`

Copy semua function berikut dari `sales/js/penjualan.js` ke CS. Taruh dalam satu blok setelah function `firstShowPerformaEdit()` di CS:

```
grep -n "^function deployStyleToSelectFromDB\|^function parseStyleString\|^function keyNormalize\|^function normalizePlusPrefix\|^function extractParenColor\|^function removeChipHolder\|^function setSelectWhiteOnChoose\|^function escapeHtmlPerforma\|^function changeWarnaFullColorPerforma\|^function selectBoxStyleFullColorPerforma" sales/js/penjualan.js
```

Copy isi seluruh function-function tersebut.

---

## TASK 2: Upgrade `firstShowPerformaEdit()` di CS

**File target:** `cs/js/penjualan.js`

**Situasi:** CS sudah punya `firstShowPerformaEdit()` tapi versi sederhana. Sales punya versi lengkap yang menggunakan `deployStyleToSelectFromDB()`.

**Yang perlu dilakukan:**
1. Lihat implementasi `firstShowPerformaEdit()` di **Sales** (sekitar baris 4808)
2. Lihat implementasi `firstShowPerformaEdit()` di **CS** (sekitar baris 3222)
3. **Ganti** versi CS dengan versi Sales

**Perhatian sebelum ganti:**
- Cek apakah HTML popup "Edit Proforma" di CS (`cs/pages/penjualan.html`) punya element `#proforma_old_style_edit_1`, `#proforma_old_ukuran_edit_1`, `#proforma_old_material_edit_1`, `#proforma_old_hex_edit_1`
- Cek apakah ada element `#style_hc_edit_1` (multi-select) di HTML CS
- Jika element-element tersebut **tidak ada** di HTML CS, jangan ganti dulu — catat sebagai TODO dan skip ke Task 3

---

## TASK 3: `setSelectWhiteOnChoose` — DOMContentLoaded

**File target:** `cs/js/penjualan.js`

Setelah copy `setSelectWhiteOnChoose()`, tambahkan juga DOMContentLoaded handler-nya (dari Sales):

```js
document.addEventListener('DOMContentLoaded', function () {
    setSelectWhiteOnChoose('#extra_edit_detail_1');
    setSelectWhiteOnChoose('#ukuran_edit_hc_1');
});
```

**Cek dulu:** Apakah di CS sudah ada `DOMContentLoaded` listener lain? Kalau ada, gabungkan isinya jangan buat baru.

---

## TASK 4: `isPrefillingStyle` Global Flag

**File target:** `cs/js/penjualan.js`

Sales punya global flag ini untuk mencegah style change event terpicu saat prefill:

```js
let isPrefillingStyle = false;
```

Tambahkan di dekat deklarasi global variable di atas file CS.

---

## TASK 5: Verifikasi HTML Elements (Investigation Only)

**File target:** `cs/pages/penjualan.html`

Cek apakah elemen-elemen berikut sudah ada di HTML CS. Buat laporan singkat mana yang ada dan mana yang belum:

```
grep -n "style_hc_edit_input\|style_hc_edit_1\|proforma_old_style_edit\|proforma_old_hex_edit\|selected_hex_color_edit\|style-color-chip-holder\|show_color_fullcolor_edit" cs/pages/penjualan.html
```

Jika elemen-elemen tersebut belum ada → **catat tapi jangan modifikasi HTML dulu**. HTML perubahan akan jadi scope Sesi tersendiri.

---

## Verifikasi Akhir Sesi 2

1. Tidak ada duplikat function baru yang ditambahkan:
   ```
   grep -c "^function deployStyleToSelectFromDB\|^function parseStyleString\|^function keyNormalize" cs/js/penjualan.js
   ```
2. `isPrefillingStyle` hanya ada 1 kali di file CS
3. Tidak ada perubahan backend/API
4. Jika ada function yang belum bisa dipindahkan karena element HTML belum ada, catat dalam file `TODO_sesi2.md`