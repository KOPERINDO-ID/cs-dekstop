# TASK: Sync Fitur Sales → CS (Sesi 3: SPK Generator 3 Lembar)

## Konteks

Sales punya `SPK1()`, `SPK2()`, `SPK3()` — generate PDF SPK menjadi 3 lembar (Operasional, Produksi, Purchase) dalam satu file PDF.

CS tidak punya fungsi ini sama sekali, hanya punya `spkPo()` yang berbeda (untuk SPK PO saja).

**Pastikan Sesi 1 selesai sebelum ini.**

---

## TASK 1: Copy SPK1, SPK2, SPK3 dari Sales ke CS

**File target:** `cs/js/penjualan.js`

Copy 3 function berikut dari `sales/js/penjualan.js` ke CS:
```
grep -n "^function SPK1\|^function SPK2\|^function SPK3" sales/js/penjualan.js
```

Taruh setelah function `spkPo()` di CS.

**Perhatian saat copy:**
- Ketiga function memakai `BASE_PATH_IMAGE_CUSTOMER` dan `BASE_PATH_IMAGE_PRODUCT` — pastikan variable ini sudah ada di `cs/js/global.js`. Cek dengan:
  ```
  grep -n "BASE_PATH_IMAGE_CUSTOMER\|BASE_PATH_IMAGE_PRODUCT" cs/js/global.js
  ```
- Function memakai `pdf.fromData()` — pastikan library pdf sudah di-load di CS. Cek:
  ```
  grep -rn "html2pdf\|pdf\.fromData\|cordova-plugin-pdf" cs/
  ```

---

## TASK 2: Tambah Tombol SPK di HTML CS

**File target:** `cs/pages/penjualan.html`

**Situasi:** CS perlu tombol untuk memanggil `SPK1()`. Fungsi ini dipanggil dari tabel list penjualan.

**Cari dulu** di HTML CS dimana tombol SPK PO (spkPo) dipanggil:
```
grep -n "spkPo\|SPK1\|SPK2\|SPK3" cs/pages/penjualan.html
```

Jika sudah ada tombol `spkPo()`, tambahkan tombol baru di sebelahnya untuk `SPK1()`:

```html
<button onclick="SPK1('..params..')" class="button button-small">SPK 3 Lembar</button>
```

**Params untuk SPK1** sama persis dengan yang dipakai di Sales — lihat cara pemanggilan di `sales/pages/penjualan.html`:
```
grep -n "SPK1(" sales/pages/penjualan.html | head -3
```

Sesuaikan nama variable dengan yang dipakai CS di row yang sama.

---

## TASK 3: Verifikasi Dependencies

Sebelum test, pastikan:

1. **Library PDF tersedia** di CS (biasanya di-load via Cordova plugin atau `<script>` tag di index)
2. **Variable global path** tersedia: `BASE_PATH_IMAGE_CUSTOMER`, `BASE_PATH_IMAGE_PRODUCT`
3. **moment.js** sudah ada (SPK pakai `moment()`)

Jika ada dependency yang kurang, catat di `TODO_sesi3.md` dan jangan lanjutkan — dependency harus ada dulu.

---

## Verifikasi Akhir Sesi 3

```
grep -c "^function SPK1\|^function SPK2\|^function SPK3" cs/js/penjualan.js
```
Harus return `3`.