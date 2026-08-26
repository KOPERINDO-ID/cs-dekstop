# TASK: Sync Fitur Sales → CS (Sesi 1: Safe Utilities)

## Konteks Proyek

Kami punya 2 aplikasi Framework7 (vanilla JS) yang berasal dari source yang sama tapi berkembang sendiri-sendiri:
- **Aplikasi Sales**: `sales/js/penjualan.js`, `sales/pages/penjualan.html`
- **Aplikasi CS**: `cs/js/penjualan.js`, `cs/pages/penjualan.html`

Sesi ini fokus memindahkan fitur dari Sales ke CS yang **aman tanpa perubahan backend** sama sekali.

---

## TASK 1: Dialog Timeout Guard (Bug Fix Kritis)

**File target:** `cs/js/penjualan.js`

**Masalah:** CS tidak punya safety net jika AJAX preloader stuck. Kalau AJAX error tidak tertangani, dialog "Harap Tunggu" tidak pernah hilang.

**Yang perlu ditambahkan** — tambahkan di bagian paling atas file `cs/js/penjualan.js`, setelah deklarasi global variable:

```js
// GLOBAL FIX: Pastikan dialog selalu ditutup saat AJAX error
jQuery(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    console.error('AJAX Error:', settings.url, thrownError);
    if (typeof app !== 'undefined' && app.dialog) {
        try { app.dialog.close(); } catch(e) {}
    }
});

var dialogTimeoutChecker = null;
function startDialogTimeoutChecker() {
    if (dialogTimeoutChecker) clearTimeout(dialogTimeoutChecker);
    dialogTimeoutChecker = setTimeout(function() {
        if (typeof app !== 'undefined' && app.dialog) {
            try {
                var preloader = document.querySelector('.dialog-preloader');
                if (preloader) {
                    console.warn('Dialog preloader timeout - forcing close');
                    app.dialog.close();
                }
            } catch(e) {}
        }
    }, 30000);
}

jQuery(document).ajaxStart(function() {
    startDialogTimeoutChecker();
});

jQuery(document).ajaxStop(function() {
    if (dialogTimeoutChecker) {
        clearTimeout(dialogTimeoutChecker);
        dialogTimeoutChecker = null;
    }
});
```

**Verifikasi:** Pastikan tidak ada duplikat `ajaxError` global di file yang sama.

---

## TASK 2: Tambah Global Variable yang Hilang

**File target:** `cs/js/penjualan.js`

Cek bagian atas file. Jika belum ada, tambahkan:
```js
var calendarRangePenjualan;
var globalPackingData = [];
```

`globalBankData` dan `isOwner` sudah ada di CS, jangan duplikat.

---

## TASK 3: resetInputIfNotReadonly()

**File target:** `cs/js/penjualan.js`

Tambahkan function ini (sudah ada di Sales, belum ada di CS):
```js
function resetInputIfNotReadonly(inputId) {
    var input = document.getElementById(inputId);
    if (input && !input.readOnly) {
        input.value = '';
    }
}
```

---

## TASK 4: resetValueOngkir()

**File target:** `cs/js/penjualan.js`

Tambahkan function ini (sudah ada di Sales, belum ada di CS):
```js
function resetValueOngkir(elem) {
    elem.value = '';
}
```

---

## TASK 5: cancelOngkirEdit() dan enableOngkirEdit()

**File target:** `cs/js/penjualan.js`

Copy kedua function ini dari `sales/js/penjualan.js` ke CS. Cari function `cancelOngkirEdit` dan `enableOngkirEdit` di Sales, lalu tambahkan ke CS di dekat fungsi `saveOngkirEdit()` yang sudah ada.

**Cara cari di Sales:**
```
grep -n "^function cancelOngkirEdit\|^function enableOngkirEdit" sales/js/penjualan.js
```

---

## TASK 6: generateBankOptions() — Upgrade ke versi Sales

**File target:** `cs/js/penjualan.js`

**Masalah:** CS punya versi `generateBankOptions(defaultBankId)` yang sederhana. Sales punya versi lebih lengkap yang backward-compatible dengan `bank_kode` string lama.

**Yang perlu dilakukan:**
1. Ganti function `generateBankOptions` di CS dengan versi dari Sales
2. Tambahkan function-function bank helper dari Sales yang belum ada di CS:
   - `generateBankOptionsByCode()`
   - `getBankIdByCode()`
   - `getBankLabel()`
   - `getBankLabelFromPayment()`
   - `generateBankInfoForInvoice()`

**Cara cari di Sales:**
```
grep -n "^function generateBankOptions\|^function generateBankOptionsByCode\|^function getBankIdByCode\|^function getBankLabel\b\|^function getBankLabelFromPayment\|^function generateBankInfoForInvoice" sales/js/penjualan.js
```

**Perhatian:** CS sudah punya `generateBankOptionsHardcoded()` dan `getBankLabelByCode()`. Jangan hapus fungsi tersebut karena mungkin masih dipakai di tempat lain. Cukup tambahkan versi Sales di bawahnya.

---

## TASK 7: zoom_view_foto_bayar()

**File target:** `cs/js/penjualan.js`

CS belum punya `zoom_view_foto_bayar()`. Cari di CS apakah ada handler foto pembayaran yang memerlukan zoom. Jika ada element foto bayar di HTML CS, tambahkan:

```js
function zoom_view_foto_bayar(src) {
    var gambar_zoom = BASE_PATH_IMAGE_BUKTI_BAYAR + '/' + src;
    var myPhotoBrowserPopupDark = app.photoBrowser.create({
        photos: ['' + gambar_zoom + ''],
        theme: 'dark',
        type: 'popup'
    });
    myPhotoBrowserPopupDark.open();
}
```

**Catatan:** Cek apakah `BASE_PATH_IMAGE_BUKTI_BAYAR` sudah terdefinisi di `cs/js/global.js`. Jika belum, cek nama variabel yang dipakai CS untuk path gambar bukti bayar.

---

## TASK 8: formatTanggal()

**File target:** `cs/js/penjualan.js`

Tambahkan utility function (sudah ada di CS, pastikan ada di Sales juga atau skip jika CS sudah punya):
```
grep -n "^function formatTanggal" cs/js/penjualan.js
```
Jika belum ada di Sales, tambahkan dari CS ke Sales.

---

## Verifikasi Akhir Sesi 1

Setelah semua task selesai:

1. Pastikan tidak ada function duplikat di `cs/js/penjualan.js`
2. Jalankan search untuk duplikat:
   ```
   grep -c "^function startDialogTimeoutChecker\|^function resetInputIfNotReadonly\|^function resetValueOngkir" cs/js/penjualan.js
   ```
   Hasil harus `1` untuk setiap function.
3. Tidak ada perubahan yang diperlukan di backend/API.
4. Tidak ada perubahan di `penjualan.html`.