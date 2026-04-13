// ============================================================
//  pengiriman.js
//  Sub Menu: Ekspedisi (Master) & Transaksi
//  Menggunakan jQuery ($$ = Framework7 alias, $ = jQuery)
//  Framework7 v7 + Cordova
// ============================================================

var PengirimanPage = (function () {

    // -------------------------------------------------------
    // STATE
    // -------------------------------------------------------
    var activeTab = 'master';
    var editMasterId = null;
    var editTransaksiId = null;

    // Mock data — ganti dengan pemanggilan API nyata
    var dataMaster = [
        { id: 1, nama: 'PT MULYAGUNA', pic: 'SUPRIADI', alamat: 'Jalan Hayam Wuruk 48E', telp: '08123456789', bank: 'BCA', rekening: '4300123456', namaRekening: 'PT MULYAGUNA', skor: 85 },
        { id: 2, nama: 'PT JAYA LOGISTIK', pic: 'SUPRIADI', alamat: 'Jalan Raya Darmo 12', telp: '08129876543', bank: 'BRI', rekening: '1200123456', namaRekening: 'PT JAYA LOGISTIK', skor: 88 },
    ];

    var dataTransaksi = [
        { id: 1, kode: 'SHIP-100326-001', nama: 'PT MULYAGUNA', pic: 'SUPRIADI', rute: 'KOTA SIDOARJO > KOTA JAKARTA TIMUR', telp: '08123456789', rekening: '4300123456', skor: 85, tglKirim: '2026-02-11', tglSampai: '2026-03-08' },
        { id: 2, kode: 'SHIP-120326-002', nama: 'PT JAYA LOGISTIK', pic: 'SUPRIADI', rute: 'KOTA SIDOARJO > KOTA JAKARTA PUSAT', telp: '08123456789', rekening: '1200123456', skor: 88, tglKirim: '2026-02-14', tglSampai: '2026-03-24' },
    ];

    // -------------------------------------------------------
    // TAB SWITCHING
    // -------------------------------------------------------
    var ACTIVE_BG = 'bg-dark-gray-medium';
    var INACTIVE_BG = 'bg-dark-gray-young';

    function setActiveTab(tab) {
        activeTab = tab;

        var $master = $('#masterPengiriman');
        var $transaksi = $('#transaksiPengiriman');
        if (!$master.length || !$transaksi.length) return;

        if (tab === 'master') {
            $master.addClass(ACTIVE_BG).removeClass(INACTIVE_BG);
            $transaksi.addClass(INACTIVE_BG).removeClass(ACTIVE_BG);
            renderMaster();
        } else {
            $transaksi.addClass(ACTIVE_BG).removeClass(INACTIVE_BG);
            $master.addClass(INACTIVE_BG).removeClass(ACTIVE_BG);
            renderTransaksi();
        }
    }

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------
    function formatTgl(dateStr) {
        if (!dateStr) return '-';
        var d = new Date(dateStr);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    function tglSampaiBg(dateStr) {
        if (!dateStr) return '';
        var tgl = new Date(dateStr);
        var today = new Date(); today.setHours(0, 0, 0, 0);
        return tgl >= today
            ? 'background:#1b5e20; color:#fff;'
            : 'background:#b71c1c; color:#fff;';
    }

    // Style ikon circle seragam: background putih, border-radius penuh
    var IC = 'display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:#fff; cursor:pointer;';

    // suffix: 'Master' | 'Transaksi' — agar ID unik per tab, tidak konflik di DOM
    function buildCardHeader(count, showHistory, suffix) {
        var historyBtn = showHistory
            ? '<span id="btnHistory" style="' + IC + ' margin-right:2px;">' +
            '<i class="f7-icons" style="font-size:32px; color:#222;">clock_fill</i>' +
            '</span>'
            : '';
        return (
            '<div class="card-header bg-dark-gray-young" style="padding: 0 10px;">' +
            '<div class="data-table-title" style="height:2px; margin-left:6px;">' +
            '<h3 class="margin-15" style="color:white;">Data | <i id="countData">' + count + '</i></h3>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:8px;">' +
            historyBtn +
            '<span id="btnRefresh' + suffix + '" style="' + IC + '">' +
            '<i class="f7-icons" style="font-size:32px; color:#2e7d32;">arrow_2_circlepath_circle_fill</i>' +
            '</span>' +
            '<span id="btnTambah' + suffix + '" style="' + IC + '">' +
            '<i class="f7-icons" style="font-size:32px; color:#2e7d32;">plus_circle_fill</i>' +
            '</span>' +
            '</div>' +
            '</div>'
        );
    }

    function buildSearchBar(idInput, placeholder) {
        return (
            '<div class="card-content bg-dark-gray-medium" style="padding:8px 10px;">' +
            '<input type="text" id="' + idInput + '" placeholder="' + placeholder + '" ' +
            'style="width:100%; padding:7px 10px; background:#1a1a1a; color:white; border:none; border-bottom:1px solid #555; outline:none; font-size:13px;">' +
            '</div>'
        );
    }

    // -------------------------------------------------------
    // RENDER MASTER (Ekspedisi)
    // -------------------------------------------------------
    function renderMaster() {
        var TD = 'padding:4px 6px; border:1px solid #ddd;';
        var rows = $.map(dataMaster, function (item, idx) {
            return (
                '<tr>' +
                '<td style="' + TD + '">' + (idx + 1) + '</td>' +
                '<td style="' + TD + ' font-weight:700;">' + item.nama + '</td>' +
                '<td style="' + TD + '">' + item.pic + '</td>' +
                '<td style="' + TD + '">' + item.alamat + '</td>' +
                '<td style="' + TD + '">' + item.telp + '</td>' +
                '<td style="' + TD + '">' + item.bank + '</td>' +
                '<td style="' + TD + '">' + item.rekening + '</td>' +
                '<td style="' + TD + '">' + item.namaRekening + '</td>' +
                '<td style="' + TD + '">' + item.skor + '</td>' +
                '<td style="' + TD + '">' +
                '<button class="btn-detail-master button button-small bg-dark-gray-young text-add-colour-white" data-id="' + item.id + '" ' +
                'style="font-size:11px; font-weight:600;">DETAIL</button>' +
                '</td>' +
                '</tr>'
            );
        }).join('');

        var html =
            buildCardHeader(dataMaster.length, false, 'Master') +
            buildSearchBar('searchMaster', 'Cari Ekspedisi...') +
            '<div class="card-content" style="overflow-x:auto; width:100%;">' +
            '<table cellspacing="1" cellpadding="1" width="100%">' +
            '<thead class="bg-dark-gray-medium" style="position:sticky; top:0; z-index:1;">' +
            '<tr>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="4%">No</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="16%">Nama</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="9%">PIC</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;">Alamat</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="11%">No Telp</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="8%">Bank</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="11%">No Rekening</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="11%">Nama Rekening</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="5%">Skor</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="7%">Opsi</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody class="text-align-center" id="tbodyMaster">' + rows + '</tbody>' +
            '</table>' +
            '</div>';

        $('#mainContentPengiriman').html(html);
        bindMasterEvents();
    }

    function bindMasterEvents() {
        // Refresh
        $('#btnRefreshMaster').on('click', function () {
            // TODO: fetch ulang dari API
            renderMaster();
        });

        // Tambah
        $('#btnTambahMaster').on('click', function () {
            editMasterId = null;
            $('#popupEkspedisiTitle').text('Tambah Ekspedisi');
            $('#expedisi-nama-perusahaan').val('');
            $('#expedisi-pic').val('');
            $('#expedisi-alamat').val('');
            $('#expedisi-telp').val('');
            $('#expedisi-bank').val('');
            $('#expedisi-rekening').val('');
            $('#expedisi-nama-rekening').val('');
            app.popup.open('.popup-form-ekspedisi');
        });

        // Simpan
        $('#btnSimpanEkspedisi').off('click').on('click', simpanEkspedisi);

        // Search
        $('#searchMaster').on('input', function () {
            filterTable('#tbodyMaster', $(this).val());
        });

        // Detail
        $(document).off('click', '.btn-detail-master').on('click', '.btn-detail-master', function () {
            var id = parseInt($(this).data('id'));
            var item = $.grep(dataMaster, function (d) { return d.id === id; })[0];
            if (!item) return;
            // TODO: buka halaman / popup detail
            app.toast.create({ text: 'Detail: ' + item.nama, closeTimeout: 1500 }).open();
        });
    }

    function simpanEkspedisi() {
        var nama = $('#expedisi-nama-perusahaan').val().trim();
        var pic = $('#expedisi-pic').val().trim();
        var alamat = $('#expedisi-alamat').val().trim();
        var telp = $('#expedisi-telp').val().trim();
        var bank = $('#expedisi-bank').val().trim();
        var rekening = $('#expedisi-rekening').val().trim();
        var namaRekening = $('#expedisi-nama-rekening').val().trim();

        if (!nama) {
            app.toast.create({ text: 'Nama Perusahaan wajib diisi!', closeTimeout: 2000 }).open();
            return;
        }

        if (editMasterId) {
            // TODO: PUT ke API
            var item = $.grep(dataMaster, function (d) { return d.id === editMasterId; })[0];
            if (item) {
                item.nama = nama.toUpperCase(); item.pic = pic.toUpperCase(); item.alamat = alamat;
                item.telp = telp; item.bank = bank; item.rekening = rekening; item.namaRekening = namaRekening.toUpperCase();
            }
        } else {
            // TODO: POST ke API
            var newId = dataMaster.length ? dataMaster[dataMaster.length - 1].id + 1 : 1;
            dataMaster.push({
                id: newId, nama: nama.toUpperCase(), pic: pic.toUpperCase(),
                alamat: alamat, telp: telp, bank: bank,
                rekening: rekening, namaRekening: namaRekening.toUpperCase(), skor: 0
            });
        }

        app.popup.close('.popup-form-ekspedisi');
        app.toast.create({ text: 'Data ekspedisi disimpan.', closeTimeout: 2000 }).open();
        renderMaster();
    }

    // -------------------------------------------------------
    // RENDER TRANSAKSI
    // -------------------------------------------------------
    function renderTransaksi() {
        var TD = 'padding:4px 6px; border:1px solid #ddd;';
        var rows = $.map(dataTransaksi, function (item, idx) {
            var tglStyle = tglSampaiBg(item.tglSampai);
            return (
                '<tr>' +
                '<td style="' + TD + ' font-size:11px;">' + item.kode + '</td>' +
                '<td style="' + TD + ' font-weight:700;">' + item.nama + '</td>' +
                '<td style="' + TD + '">' + item.pic + '</td>' +
                '<td style="' + TD + '">' + item.rute + '</td>' +
                '<td style="' + TD + '">' + item.telp + '</td>' +
                '<td style="' + TD + '">' + item.rekening + '</td>' +
                '<td style="' + TD + '">' + item.skor + '</td>' +
                '<td style="' + TD + '">' + formatTgl(item.tglKirim) + '</td>' +
                '<td style="' + TD + tglStyle + '">' + formatTgl(item.tglSampai) + '</td>' +
                '<td style="' + TD + '">' +
                '<button class="btn-detail-transaksi button button-small bg-dark-gray-young text-add-colour-white" data-id="' + item.id + '" ' +
                'style="font-size:11px; font-weight:600;">DETAIL</button>' +
                '</td>' +
                '</tr>'
            );
        }).join('');

        var html =
            buildCardHeader(dataTransaksi.length, true, 'Transaksi') +
            buildSearchBar('searchTransaksi', 'Cari Pengiriman...') +
            '<div class="card-content" style="overflow-x:auto; width:100%;">' +
            '<table cellspacing="1" cellpadding="1" width="100%">' +
            '<thead class="bg-dark-gray-medium" style="position:sticky; top:0; z-index:1;">' +
            '<tr>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="10%">ID</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="14%">Nama</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="9%">PIC</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;">Rute</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="11%">No Telp</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="11%">No Rekening</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="5%">Skor</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="8%">Tgl Kirim</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="8%">Tgl Sampai</th>' +
            '<th class="label-cell text-align-center" style="border-bottom:1px solid gray;" width="7%">Opsi</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody class="text-align-center" id="tbodyTransaksi">' + rows + '</tbody>' +
            '</table>' +
            '</div>';

        $('#mainContentPengiriman').html(html);
        bindTransaksiEvents();
    }

    function bindTransaksiEvents() {
        // Refresh
        $('#btnRefreshTransaksi').on('click', function () {
            // TODO: fetch ulang dari API
            renderTransaksi();
        });

        // History
        $('#btnHistory').on('click', function () {
            // TODO: navigasi ke halaman history
            app.toast.create({ text: 'History pengiriman', closeTimeout: 1500 }).open();
        });

        // Tambah — buka popup 2-step (SPK → Ekspedisi)
        $('#btnTambahTransaksi').on('click', function () {
            bukaPopupTambahTransaksi();
        });

        // Search
        $('#searchTransaksi').on('input', function () {
            filterTable('#tbodyTransaksi', $(this).val());
        });

        // Detail
        $(document).off('click', '.btn-detail-transaksi').on('click', '.btn-detail-transaksi', function () {
            var id = parseInt($(this).data('id'));
            var item = $.grep(dataTransaksi, function (d) { return d.id === id; })[0];
            if (!item) return;
            // TODO: buka halaman / popup detail
            app.toast.create({ text: 'Detail: ' + item.kode, closeTimeout: 1500 }).open();
        });
    }

    // -------------------------------------------------------
    // FILTER / SEARCH
    // -------------------------------------------------------
    function filterTable(tbodySelector, keyword) {
        var q = keyword.toLowerCase();
        $(tbodySelector + ' tr').each(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(q) > -1);
        });
    }

    // -------------------------------------------------------
    // BIND SUB MENU CLICK
    // -------------------------------------------------------
    function bindSubMenuEvents() {
        $('#masterPengiriman').on('click', function () { setActiveTab('master'); });
        $('#transaksiPengiriman').on('click', function () { setActiveTab('transaksi'); });
    }

    // -------------------------------------------------------
    // INIT — dipanggil dari app.js page:afterin
    // -------------------------------------------------------
    function init() {
        bindSubMenuEvents();
        setActiveTab('master');
    }

    return { init: init };

})();
// ============================================================
//  POPUP TAMBAH TRANSAKSI — 2-Step
//  Step 1: Pilih SPK   |   Step 2: Pilih Ekspedisi
// ============================================================

// ── State popup ──────────────────────────────────────────────
var trxSelectedSpk = [];   // array of SPK object yang dipilih
var trxSelectedEkspedisi = null; // object ekspedisi terpilih

// Mock SPK — ganti dengan fetch API nyata
// Field: id, kode_spk, nama_client, kota_asal, kota_tujuan, ukuran, tgl_kirim, tgl_req_sampai
var dataSPK = [
    { id: 1, kode_spk: 'SPK-001-2026', nama_client: 'CV MAJU JAYA', kota_asal: 'SIDOARJO', kota_tujuan: 'JAKARTA TIMUR', ukuran: 'L', tgl_kirim: '2026-04-20', tgl_req_sampai: '2026-04-25' },
    { id: 2, kode_spk: 'SPK-002-2026', nama_client: 'PT SINAR ABADI', kota_asal: 'SIDOARJO', kota_tujuan: 'JAKARTA TIMUR', ukuran: 'M', tgl_kirim: '2026-04-20', tgl_req_sampai: '2026-04-26' },
    { id: 3, kode_spk: 'SPK-003-2026', nama_client: 'UD BERKAH', kota_asal: 'SIDOARJO', kota_tujuan: 'JAKARTA PUSAT', ukuran: 'XL', tgl_kirim: '2026-04-21', tgl_req_sampai: '2026-04-27' },
    { id: 4, kode_spk: 'SPK-004-2026', nama_client: 'PT KARYA UTAMA', kota_asal: 'SIDOARJO', kota_tujuan: 'JAKARTA TIMUR', ukuran: 'S', tgl_kirim: '2026-04-22', tgl_req_sampai: '2026-04-28' },
    { id: 5, kode_spk: 'SPK-005-2026', nama_client: 'CV TERANG BARU', kota_asal: 'SIDOARJO', kota_tujuan: 'SURABAYA', ukuran: 'M', tgl_kirim: '2026-04-20', tgl_req_sampai: '2026-04-23' },
];

// Mock rekomendasi ekspedisi — ganti dengan fetch API nyata
var dataRekomendasiEkspedisi = [
    { id_expedisi: 1, nama_expedisi: 'PT MULYAGUNA', estimasi_hari: 3, total_harga: 450000, pct_tepat_waktu: 92, skor_total: 88, bisa_tepat_waktu: 1 },
    { id_expedisi: 2, nama_expedisi: 'PT JAYA LOGISTIK', estimasi_hari: 4, total_harga: 320000, pct_tepat_waktu: 78, skor_total: 74, bisa_tepat_waktu: 1 },
    { id_expedisi: 3, nama_expedisi: 'CV CEPAT SAMPAI', estimasi_hari: 2, total_harga: 580000, pct_tepat_waktu: 95, skor_total: 91, bisa_tepat_waktu: 1 },
    { id_expedisi: 4, nama_expedisi: 'PT KARGO NUSANTARA', estimasi_hari: 6, total_harga: 210000, pct_tepat_waktu: 61, skor_total: 55, bisa_tepat_waktu: 0 },
];

// ── Helpers (mengikuti pola index.js) ────────────────────────
function trxGetInitials(nama) {
    if (!nama) return '??';
    var parts = nama.trim().split(/\s+/);
    if (parts.length === 1) return nama.substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

var _trxLogoColors = [
    { bg: '#E1F5EE', text: '#0F6E56' },
    { bg: '#E6F1FB', text: '#185FA5' },
    { bg: '#FAEEDA', text: '#854F0B' },
    { bg: '#FAECE7', text: '#993C1D' },
    { bg: '#EEEDFE', text: '#3C3489' },
    { bg: '#FBEAF0', text: '#993556' },
];
function trxGetLogoColor(idx) {
    return _trxLogoColors[idx % _trxLogoColors.length];
}

// Ambil tgl_kirim paling awal dari SPK terpilih
function trxGetEarliestTglKirim() {
    if (!trxSelectedSpk.length) return '';
    return trxSelectedSpk.reduce(function (min, s) {
        return s.tgl_kirim < min ? s.tgl_kirim : min;
    }, trxSelectedSpk[0].tgl_kirim);
}

// Ambil tgl_req_sampai paling awal dari SPK terpilih
function trxGetEarliestTglReq() {
    if (!trxSelectedSpk.length) return '';
    return trxSelectedSpk.reduce(function (min, s) {
        return s.tgl_req_sampai < min ? s.tgl_req_sampai : min;
    }, trxSelectedSpk[0].tgl_req_sampai);
}

function trxFormatTgl(dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

// ── Buka popup & reset ────────────────────────────────────────
function bukaPopupTambahTransaksi() {
    trxSelectedSpk = [];
    trxSelectedEkspedisi = null;

    // Reset ke step 1
    transaksiGoStep(1);

    // Reset search
    $('#trx-search-spk').val('');

    // Render seluruh SPK (belum ada filter anchor)
    renderSpkList(dataSPK, null);

    app.popup.open('.popup-form-transaksi');

    // Bind search realtime
    $('#trx-search-spk').off('input').on('input', function () {
        var q = $(this).val().toLowerCase();
        var anchor = trxSelectedSpk.length ? trxSelectedSpk[0] : null;
        var filtered = $.grep(dataSPK, function (s) {
            return s.kode_spk.toLowerCase().indexOf(q) > -1 ||
                s.nama_client.toLowerCase().indexOf(q) > -1 ||
                s.kota_tujuan.toLowerCase().indexOf(q) > -1;
        });
        renderSpkList(filtered, anchor);
    });

    // Tombol lanjut
    $('#trx-btn-lanjut').off('click').on('click', function () {
        if (trxSelectedSpk.length === 0) return;
        transaksiGoStep(2);
        renderEkspedisiStep2();
    });

    // Tombol konfirmasi
    $('#trx-btn-konfirmasi').off('click').on('click', function () {
        if (!trxSelectedEkspedisi || trxSelectedSpk.length === 0) return;
        simpanTransaksiStep2();
    });
}

// ── Step navigation ───────────────────────────────────────────
function transaksiGoStep(step) {
    if (step === 1) {
        $('#trx-step-1').show();
        $('#trx-step-2').hide();
        $('#trx-btn-back').hide();
        $('#popupTransaksiTitle').text('Tambah Pengiriman');
        // step indicator
        $('#trx-step-ind-1').css({ 'color': '#fff', 'border-bottom-color': '#2e7d32' });
        $('#trx-step-ind-2').css({ 'color': '#666', 'border-bottom-color': 'transparent' });
    } else {
        $('#trx-step-1').hide();
        $('#trx-step-2').show();
        $('#trx-btn-back').show();
        $('#popupTransaksiTitle').text('Pilih Ekspedisi');
        // step indicator
        $('#trx-step-ind-1').css({ 'color': '#666', 'border-bottom-color': 'transparent' });
        $('#trx-step-ind-2').css({ 'color': '#fff', 'border-bottom-color': '#2e7d32' });
    }
}

// ── STEP 1: Render list SPK ───────────────────────────────────
function renderSpkList(list, anchor) {
    if (!list || list.length === 0) {
        $('#trx-spk-list').html(
            '<div style="text-align:center; color:#666; padding:20px; font-size:13px;">Tidak ada SPK ditemukan.</div>'
        );
        return;
    }

    var html = '';
    list.forEach(function (spk) {
        var isChecked = $.grep(trxSelectedSpk, function (s) { return s.id === spk.id; }).length > 0;
        var isAnchor = anchor && spk.id === anchor.id;

        // Jika sudah ada anchor, tampilkan hanya SPK yg kota_asal & kota_tujuan sama
        // SPK lain (beda rute) tetap tampil tapi disabled
        var isCompatible = !anchor || (spk.kota_asal === anchor.kota_asal && spk.kota_tujuan === anchor.kota_tujuan);
        var rowOpacity = (!isCompatible) ? '0.35' : '1';
        var rowCursor = (!isCompatible) ? 'not-allowed' : 'pointer';

        var checkBg = isChecked ? '#2e7d32' : '#333';
        var checkBdr = isChecked ? '#2e7d32' : '#555';
        var anchorBadge = isAnchor
            ? '<span style="font-size:10px; background:#1565c0; color:#fff; padding:1px 6px; border-radius:3px; margin-left:6px;">ANCHOR</span>'
            : '';

        html += '<div class="trx-spk-row" data-id="' + spk.id + '" data-compatible="' + isCompatible + '" '
            + 'style="display:flex; align-items:center; gap:10px; padding:10px 6px; border-bottom:1px solid #2a2a2a; opacity:' + rowOpacity + '; cursor:' + rowCursor + ';">'

            // Checkbox
            + '<div class="trx-spk-check" style="width:22px; height:22px; border-radius:4px; border:2px solid ' + checkBdr + '; background:' + checkBg + '; display:flex; align-items:center; justify-content:center; flex-shrink:0; pointer-events:none;">'
            + (isChecked ? '<i class="f7-icons" style="font-size:14px; color:#fff; pointer-events:none;">checkmark</i>' : '')
            + '</div>'

            // Info SPK
            + '<div style="flex:1; min-width:0;">'
            + '<div style="font-size:13px; font-weight:700; color:#fff;">' + spk.kode_spk + anchorBadge + '</div>'
            + '<div style="font-size:12px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + spk.nama_client + '</div>'
            + '<div style="font-size:11px; color:#777; margin-top:2px;">'
            + spk.kota_asal + ' → ' + spk.kota_tujuan
            + ' &nbsp;·&nbsp; Ukuran: <b style="color:#ddd;">' + spk.ukuran + '</b>'
            + '</div>'
            + '</div>'

            // Tanggal
            + '<div style="text-align:right; flex-shrink:0;">'
            + '<div style="font-size:11px; color:#888;">Kirim</div>'
            + '<div style="font-size:12px; color:#ddd;">' + trxFormatTgl(spk.tgl_kirim) + '</div>'
            + '<div style="font-size:11px; color:#ff9800; margin-top:2px;">Req: ' + trxFormatTgl(spk.tgl_req_sampai) + '</div>'
            + '</div>'

            + '</div>';
    });

    $('#trx-spk-list').html(html);

    // Bind klik per row
    $('.trx-spk-row').off('click').on('click', function () {
        var compatible = $(this).data('compatible');
        if (!compatible || compatible === false || compatible === 'false') return;

        var id = parseInt($(this).data('id'));
        var spk = $.grep(dataSPK, function (s) { return s.id === id; })[0];
        if (!spk) return;

        var idx = -1;
        $.each(trxSelectedSpk, function (i, s) { if (s.id === id) { idx = i; return false; } });

        if (idx > -1) {
            // Uncheck
            trxSelectedSpk.splice(idx, 1);
            // Jika anchor di-uncheck, reset semua
            if (trxSelectedSpk.length === 0) {
                renderSpkList(dataSPK, null);
                updateSpkSummary();
                return;
            }
        } else {
            // Check
            trxSelectedSpk.push(spk);
        }

        var newAnchor = trxSelectedSpk.length ? trxSelectedSpk[0] : null;
        renderSpkList(dataSPK, newAnchor);
        updateSpkSummary();
    });
}

function updateSpkSummary() {
    var count = trxSelectedSpk.length;
    if (count === 0) {
        $('#trx-spk-summary').hide();
        setLanjutBtn(false);
        return;
    }

    var ukuranList = $.map(trxSelectedSpk, function (s) { return s.ukuran; }).join(', ');
    var rute = trxSelectedSpk[0].kota_asal + ' → ' + trxSelectedSpk[0].kota_tujuan;

    $('#trx-spk-summary')
        .html('<b>' + count + ' SPK dipilih</b> &nbsp;·&nbsp; ' + rute + ' &nbsp;·&nbsp; Ukuran: ' + ukuranList)
        .show();

    setLanjutBtn(count > 0);
}

function setLanjutBtn(active) {
    if (active) {
        $('#trx-btn-lanjut')
            .prop('disabled', false)
            .css({ 'background-color': '#2e7d32', 'color': '#fff', 'cursor': 'pointer' });
    } else {
        $('#trx-btn-lanjut')
            .prop('disabled', true)
            .css({ 'background-color': '#555', 'color': '#999', 'cursor': 'not-allowed' });
    }
}

// ── STEP 2: Render rekomendasi ekspedisi ──────────────────────
function renderEkspedisiStep2() {
    trxSelectedEkspedisi = null;
    setKonfirmasiBtn(false);

    // Info rute & tanggal dari SPK terpilih
    var anchor = trxSelectedSpk[0];
    var tglKirim = trxGetEarliestTglKirim();
    var tglReq = trxGetEarliestTglReq();

    $('#trx-eksp-rute').text(anchor.kota_asal + ' → ' + anchor.kota_tujuan);
    $('#trx-eksp-tgl').text(
        'Kirim: ' + trxFormatTgl(tglKirim) +
        '  |  Req sampai: ' + trxFormatTgl(tglReq)
    );

    // Skeleton loading
    $('#trx-eksp-list').html(renderTrxEkspedisiSkeleton());

    // TODO: ganti dengan fetch API nyata
    // Simulasi async fetch dengan setTimeout
    setTimeout(function () {
        // Sort by skor_total desc
        var sorted = dataRekomendasiEkspedisi.slice().sort(function (a, b) {
            return parseFloat(b.skor_total) - parseFloat(a.skor_total);
        });
        renderTrxEkspedisiList(sorted);
    }, 600);
}

function renderTrxEkspedisiList(list) {
    if (!list || list.length === 0) {
        $('#trx-eksp-list').html(
            '<div style="text-align:center; color:#666; padding:20px; font-size:13px;">Tidak ada ekspedisi tersedia untuk rute ini.</div>'
        );
        return;
    }

    var html = '';
    list.forEach(function (item, idx) {
        var tepat = parseFloat(item.pct_tepat_waktu) || 0;
        var skor = parseFloat(item.skor_total) || 0;
        var bisaTepat = parseInt(item.bisa_tepat_waktu) === 1;
        var dotColor = bisaTepat ? (skor >= 70 ? '#1D9E75' : '#EF9F27') : '#E24B4A';
        var subColor = bisaTepat ? '' : 'color:#D85A30;';
        var subText = bisaTepat
            ? 'Skor ' + skor + ' &nbsp;·&nbsp; ' + tepat + '% tepat waktu'
            : 'Melebihi deadline &nbsp;·&nbsp; ' + tepat + '% tepat waktu';
        var harga = parseInt(item.total_harga).toLocaleString('id-ID');
        var initials = trxGetInitials(item.nama_expedisi);
        var logoColor = trxGetLogoColor(idx);

        html += '<div class="trx-eksp-row" '
            + 'data-id="' + item.id_expedisi + '" '
            + 'data-nama="' + item.nama_expedisi + '" '
            + 'data-harga="' + item.total_harga + '" '
            + 'data-hari="' + item.estimasi_hari + '" '
            + 'data-skor="' + skor + '" '
            + 'style="display:flex; align-items:center; padding:12px 6px; border-bottom:1px solid #2a2a2a; cursor:pointer; border-radius:4px; margin-top:4px; transition:background 0.15s;">'

            // dot status
            + '<div style="width:10px; height:10px; border-radius:50%; background:' + dotColor + '; flex-shrink:0; margin-right:8px;"></div>'

            // logo inisial
            + '<div style="width:38px; height:38px; border-radius:8px; background:' + logoColor.bg + '; color:' + logoColor.text + '; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex-shrink:0; margin-right:10px; pointer-events:none;">'
            + initials
            + '</div>'

            // info
            + '<div style="flex:1; min-width:0;">'
            + '<div style="font-size:13px; font-weight:700; color:#fff;">' + item.nama_expedisi + '</div>'
            + '<div style="font-size:11px; margin-top:2px; ' + subColor + '">' + subText + '</div>'
            + '</div>'

            // kanan: harga & hari
            + '<div style="text-align:right; flex-shrink:0; width:90px;">'
            + '<div style="font-size:13px; font-weight:700; color:#fff;">Rp ' + harga + '</div>'
            + '<div style="font-size:11px; color:#aaa; margin-top:2px;">' + item.estimasi_hari + ' hari</div>'
            + '</div>'

            // checkmark (hidden by default)
            + '<div class="trx-eksp-check" style="display:none; margin-left:8px; color:#2e7d32; font-size:18px; font-weight:900;">✓</div>'

            + '</div>';
    });

    $('#trx-eksp-list').html(html);

    // Bind klik
    $('.trx-eksp-row').off('click').on('click', function () {
        $('.trx-eksp-row').css('background', 'transparent');
        $('.trx-eksp-check').hide();

        $(this).css('background', '#1b3a1b');
        $(this).find('.trx-eksp-check').show();

        trxSelectedEkspedisi = {
            id_expedisi: $(this).data('id'),
            nama_expedisi: $(this).data('nama'),
            total_harga: $(this).data('harga'),
            estimasi_hari: $(this).data('hari'),
            skor_total: $(this).data('skor'),
        };

        setKonfirmasiBtn(true);
    });
}

function renderTrxEkspedisiSkeleton() {
    var html = '';
    for (var i = 0; i < 3; i++) {
        html += '<div style="display:flex; align-items:center; padding:12px 6px; border-bottom:1px solid #2a2a2a;">'
            + '<div style="width:10px; height:10px; border-radius:50%; background:#333; margin-right:8px;"></div>'
            + '<div style="width:38px; height:38px; border-radius:8px; background:#2a2a2a; margin-right:10px;"></div>'
            + '<div style="flex:1;">'
            + '<div style="height:13px; background:#2a2a2a; border-radius:4px; width:55%; margin-bottom:6px;"></div>'
            + '<div style="height:11px; background:#222; border-radius:4px; width:75%;"></div>'
            + '</div>'
            + '<div style="width:70px; text-align:right;">'
            + '<div style="height:13px; background:#2a2a2a; border-radius:4px; margin-bottom:5px;"></div>'
            + '<div style="height:11px; background:#222; border-radius:4px;"></div>'
            + '</div>'
            + '</div>';
    }
    return html;
}

function setKonfirmasiBtn(active) {
    if (active) {
        $('#trx-btn-konfirmasi')
            .prop('disabled', false)
            .css({ 'background-color': '#1565c0', 'color': '#fff', 'cursor': 'pointer' });
    } else {
        $('#trx-btn-konfirmasi')
            .prop('disabled', true)
            .css({ 'background-color': '#555', 'color': '#999', 'cursor': 'not-allowed' });
    }
}

// ── Simpan (Step 2 confirm) ───────────────────────────────────
function simpanTransaksiStep2() {
    if (!trxSelectedEkspedisi || trxSelectedSpk.length === 0) return;

    // TODO: POST ke API dengan payload trxSelectedSpk + trxSelectedEkspedisi
    var newId = dataTransaksi.length ? dataTransaksi[dataTransaksi.length - 1].id + 1 : 1;
    var bln = String(new Date().getMonth() + 1).padStart(2, '0');
    var thn = String(new Date().getFullYear()).slice(-2);
    var kode = 'SHIP-' + bln + thn + '-' + String(newId).padStart(3, '0');
    var anchor = trxSelectedSpk[0];

    dataTransaksi.push({
        id: newId,
        kode: kode,
        nama: trxSelectedEkspedisi.nama_expedisi,
        pic: '-',
        rute: anchor.kota_asal + ' > ' + anchor.kota_tujuan,
        telp: '-',
        rekening: '-',
        skor: trxSelectedEkspedisi.skor_total,
        tglKirim: trxGetEarliestTglKirim(),
        tglSampai: trxGetEarliestTglReq(),
    });

    app.popup.close('.popup-form-transaksi');
    app.toast.create({
        text: kode + ' — ' + trxSelectedEkspedisi.nama_expedisi + ' (' + trxSelectedSpk.length + ' SPK)',
        closeTimeout: 3000
    }).open();
    renderTransaksi();
}