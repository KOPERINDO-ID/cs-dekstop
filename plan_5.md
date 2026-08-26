# TASK: Sync Fitur Sales ↔ CS (Sesi 5: Merge Fungsi Kritis)

## Konteks

Sesi paling kompleks. Ini bukan copy-paste biasa — ada function yang **sama nama tapi implementasi berbeda** di Sales dan CS. Perlu merge manual yang hati-hati.

**Wajib selesaikan Sesi 1-4 dulu.**

---

## ⚠️ Aturan Utama Sesi Ini

Sebelum modifikasi apapun:
1. **Buat backup** file yang akan diubah:
   ```
   cp cs/js/penjualan.js cs/js/penjualan.js.bak-sesi5
   cp sales/js/penjualan.js sales/js/penjualan.js.bak-sesi5
   ```
2. Setiap sub-task harus diverifikasi sebelum lanjut ke berikutnya.

---

## TASK 1: `getPerformaHeaderPenjualan()` — Merge Logic Approval ke CS

**Perbedaan utama:**
- **Sales** punya: deteksi `isOwnerAll`, warna row orange untuk approval pending, icon merah jika `needs_approval == 1`
- **CS** tidak punya logika approval ini

**Yang perlu dilakukan:**

1. Lihat kedua implementasi berdampingan:
   ```
   grep -n "^function getPerformaHeaderPenjualan" sales/js/penjualan.js
   grep -n "^function getPerformaHeaderPenjualan" cs/js/penjualan.js
   ```

2. Di CS, **tambahkan** blok logika berikut di dalam loop `$.each(data.data, ...)`:

   **Tambahan warna row (setelah `color_tr` ditetapkan):**
   ```js
   // Tambahkan di CS setelah: if (item2.status == 'tidak_aktif') { color_tr = '#000080'; }
   if (item2.needs_approval == 1 && item2.approval_status == 'pending') {
       color_tr = '#FF9800'; // orange
   }
   ```

   **Tambahan `row_valid_blink`:**
   ```js
   if (item2.valid_cs == 2 || (item2.needs_approval == 1 && item2.approval_status == 'rejected')) {
       var row_valid_blink = 'announcement card-color-red';
   } else {
       var row_valid_blink = '';
   }
   ```

   **Tambahan logic icon merah/normal:**
   ```js
   if (item2.needs_approval == 1 && (item2.approval_status == 'pending' || item2.approval_status == 'rejected')) {
       var image_potongan = '<img onclick="penjualanGetPerformaDownload(...)" src="img/logo/donwloadproforma_merah.png" ...>';
   } else {
       var image_potongan = '<img onclick="penjualanGetPerformaDownload(...)" src="img/logo/donwloadproforma.png" ...>';
   }
   ```

3. Sesuaikan parameter `penjualanGetPerformaDownload()` dengan yang sudah ada di CS.

4. **Jangan** tambahkan kolom "Sales" (`isOwnerAll`) ke CS — itu fitur khusus Sales untuk view owner.

---

## TASK 2: `penjualanGetPerformaDownload()` — Merge Logic Approval Status

**Perbedaan:** Sales punya logika tampilkan/sembunyikan potongan harga merah berdasarkan `needs_approval` dan `approval_status`. CS tidak punya.

1. Lihat section approval di Sales:
   ```
   grep -n "needs_approval\|approval_status\|potongan_price" sales/js/penjualan.js | head -20
   ```

2. Di CS, dalam function `penjualanGetPerformaDownload()`, cari bagian render `potongan_price`. Tambahkan kondisi:
   ```js
   if (val.potongan_price != 0) {
       var needsApproval = data.data[0].needs_approval || 0;
       var approvalStatus = data.data[0].approval_status || '';
       if (needsApproval == 1 && (approvalStatus == 'pending' || approvalStatus == 'rejected')) {
           var potongan = '<span style="font-weight:bold;color:red;">' + number_format(val.potongan_price) + '</span>';
           var potongan_total = '<span style="font-weight:bold;color:red;">' + number_format(parseFloat(val.potongan_price) * parseFloat(val.qty)) + '</span>';
       } else {
           var potongan = '';
           var potongan_total = '';
       }
   } else {
       var potongan = '';
       var potongan_total = '';
   }
   ```

---

## TASK 3: `invoicePenjualan()` — Tambah Baris Packing ke CS

**Perbedaan:** Sales menampilkan baris "Packing" di invoice dengan `total_biaya_packing`. CS tidak punya.

1. Di CS, cari dalam `invoicePenjualan()` di bagian setelah baris "Biaya Kirim":
   ```
   grep -n "Biaya Kirim\|biaya_kirim\|total_biaya_packing" cs/js/penjualan.js | head -10
   ```

2. Tambahkan blok baris Packing dari Sales ke CS (setelah baris Biaya Kirim):
   ```js
   var packing_label = (data.data[0].packing && data.data[0].packing !== '') ? data.data[0].packing : '-';
   var biaya_packing_val = parseFloat(data.data[0].total_biaya_packing || 0);

   invoice_penjualan += '\t\t<tr>';
   invoice_penjualan += '\t\t\t<td colspan="4" style="font-weight:bold;" align="right"></td>';
   invoice_penjualan += '\t\t\t<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
   invoice_penjualan += '\t\t\t\tPacking : ' + packing_label;
   invoice_penjualan += '\t\t\t</td>';
   invoice_penjualan += '\t\t\t<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
   invoice_penjualan += '\t\t\t <font style="float:right;">' + number_format(biaya_packing_val) + '</font>';
   invoice_penjualan += '\t\t\t</td>';
   invoice_penjualan += '\t\t</tr>';
   ```

3. Update perhitungan "Jumlah" agar ikut memperhitungkan `biaya_packing_val` (lihat cara Sales menghitung di `invoicePenjualan()`).

---

## TASK 4: `spkPo()` — Tambah Baris Packing ke CS

Sama seperti Task 3 tapi di function `spkPo()` CS. Lihat implementasi `spkPo()` di Sales dan bandingkan dengan CS — tambahkan blok packing yang ada di Sales ke CS.

---

## TASK 5: `getBankLabelById()` — Harmonisasi

**Perbedaan minor:** CS dan Sales punya implementasi yang sedikit berbeda.

1. Bandingkan:
   ```
   grep -A 15 "^function getBankLabelById" sales/js/penjualan.js
   grep -A 15 "^function getBankLabelById" cs/js/penjualan.js
   ```
2. Jika versi Sales lebih lengkap (ada fallback hardcoded), update versi CS menggunakan versi Sales.

---

## Verifikasi Akhir Sesi 5

1. Test `getPerformaHeaderPenjualan()` di CS — baris dengan `needs_approval = 1` harus orange
2. Test `invoicePenjualan()` di CS — harus ada baris Packing jika data ada
3. Backup file tidak terhapus (`.bak-sesi5` masih ada)
4. Jika ada yang tidak bisa di-merge karena struktur terlalu berbeda, buat catatan di `TODO_sesi5.md`