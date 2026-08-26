# TASK: Sync Fitur CS → Sales (Sesi 4: Urgent, WhatsApp Status, Filter Transaksi)

## Konteks

Sesi ini memindahkan fitur-fitur dari CS ke Sales yang **tidak butuh perubahan DB besar**:
- Urgent system (tampilan + tombol — backend mungkin perlu dicek)
- WhatsApp status update
- Filter transaksi by bulan/tahun
- Beberapa utilities kecil

**Sesi ini fokus JS dulu, HTML popup menyusul jika diperlukan.**

---

## TASK 1: Filter Transaksi by Bulan/Tahun

**File target:** `sales/js/penjualan.js`

Copy 6 function berikut dari `cs/js/penjualan.js` ke Sales:
```
grep -n "^function filterDataTransaksiPenjualan\|^function filterDataTransaksiPerforma\|^function getBulanTransaksiPenjualan\|^function getYearTransaksiPenjualan\|^function getBulanTransaksiPerforma\|^function getYearTransaksiPerforma" cs/js/penjualan.js
```

Taruh di dekat `dateRangeDeclarationPenjualan()` yang sudah ada di Sales.

**Cek duplikat:** Pastikan belum ada di Sales:
```
grep -n "^function filterDataTransaksiPenjualan" sales/js/penjualan.js
```

---

## TASK 2: doSearchByPerusahaanProforma()

**File target:** `sales/js/penjualan.js`

Sales hanya punya `doSearchByPerusahaan()` (untuk penjualan). CS punya juga versi untuk proforma: `doSearchByPerusahaanProforma()` dan `doSearchByPerusahaanPenjualan()`.

Copy dari CS:
```
grep -n "^function doSearchByPerusahaanProforma\|^function doSearchByPerusahaanPenjualan" cs/js/penjualan.js
```

Taruh di dekat `doSearchByPerusahaan()` yang sudah ada di Sales.

---

## TASK 3: showAlertUrgent()

**File target:** `sales/js/penjualan.js`

Function kecil, tidak ada dependency:
```js
function showAlertUrgent() {
    app.dialog.alert('Belum Memasuki Tgl Urgent Deadline');
}
```

**Catatan:** Apakah Sales butuh urgent system? Cek apakah ada field `tgl_cs_deadline` atau `status_urgent` di response API Sales:
```
grep -n "tgl_cs_deadline\|status_urgent" sales/js/penjualan.js
```
Jika belum ada sama sekali di Sales → tambahkan function tapi jangan tambahkan tombol urgent ke HTML dulu.

---

## TASK 4: updateStatusWhatsapp()

**File target:** `sales/js/penjualan.js`

Copy dari CS:
```
grep -n "^function updateStatusWhatsapp" cs/js/penjualan.js
```

**Catatan penting:** Endpoint yang dipakai adalah `/update-status-whatsapp-cs`. Sebelum menambahkan tombol di HTML Sales, **konfirmasi dulu ke developer backend** apakah endpoint ini juga berlaku untuk Sales atau ada endpoint terpisah untuk Sales.

Untuk saat ini: copy function saja ke Sales, jangan tambahkan tombol ke HTML dulu.

---

## TASK 5: selectBoxSales() dan tampilDataManager()

**File target:** `sales/js/penjualan.js`

Copy 2 function dari CS:
```
grep -n "^function selectBoxSales\|^function tampilDataManager" cs/js/penjualan.js
```

**Cek dulu endpoint yang dipakai:**
```
grep -A 20 "^function tampilDataManager" cs/js/penjualan.js | grep "url:"
```
Jika endpoint mengandung URL spesifik CS (bukan endpoint universal), catat saja dan skip implementasi sampai ada konfirmasi.

---

## TASK 6: openPopupLog()

**File target:** `sales/js/penjualan.js`

Copy dari CS:
```
grep -n "^function openPopupLog" cs/js/penjualan.js
```

Cek apakah popup log juga ada di HTML Sales:
```
grep -n "log-whatsapp\|popup-log" sales/pages/penjualan.html
```
Jika belum ada di HTML → copy function tapi catat HTML perlu ditambahkan.

---

## TASK 7: intervalState + PageLoadTracker (app.js)

**File target:** `sales/js/app.js`

CS punya guard untuk mencegah interval check tumpuk (`intervalState`) dan tracker halaman (`PageLoadTracker`). Ini improvement stabilitas.

**Lihat implementasi di CS:**
```
grep -n "intervalState\|PageLoadTracker" cs/js/app.js
```

**Copy blok `intervalState`** (baris 30-210 kira-kira) dan **blok `PageLoadTracker`** dari `cs/js/app.js` ke `sales/js/app.js`.

**Perhatian:**
- Cek dulu apakah Sales sudah punya setInterval/polling di `app.js`:
  ```
  grep -n "setInterval\|intervalState" sales/js/app.js
  ```
- Jika ada, wrap setInterval yang ada dengan pattern `intervalState.isRunning` dari CS.

---

## Verifikasi Akhir Sesi 4

1. Cek tidak ada duplikat:
   ```
   grep -c "^function filterDataTransaksiPenjualan\|^function doSearchByPerusahaanProforma\|^function showAlertUrgent" sales/js/penjualan.js
   ```
2. Semua harus return `1`
3. Tidak ada perubahan HTML di sesi ini
4. Buat file `PENDING_backend_confirm.md` berisi daftar fitur yang butuh konfirmasi backend sebelum aktif