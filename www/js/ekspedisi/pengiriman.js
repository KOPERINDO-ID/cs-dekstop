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
    var IC = 'display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:50%; background:#fff; cursor:pointer;';

    // suffix: 'Master' | 'Transaksi' — agar ID unik per tab, tidak konflik di DOM
    function buildCardHeader(count, showHistory, suffix) {
        var historyBtn = showHistory
            ? '<span id="btnHistory" style="' + IC + ' margin-right:2px;">' +
            '<i class="f7-icons" style="font-size:32px; color:#222; pointer-events:none;">clock_fill</i>' +
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
            '<i class="f7-icons" style="font-size:32px; color:#2e7d32; pointer-events:none;">arrow_2_circlepath_circle_fill</i>' +
            '</span>' +
            '<span id="btnTambah' + suffix + '" style="' + IC + '">' +
            '<i class="f7-icons" style="font-size:32px; color:#2e7d32; pointer-events:none;">plus_circle_fill</i>' +
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
                '<td style="' + TD + ' font-size:14; font-weight:700;">' + item.kode + '</td>' +
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

        // Tambah
        $('#btnTambahTransaksi').on('click', function () {
            editTransaksiId = null;
            $('#popupTransaksiTitle').text('Tambah Pengiriman');

            // Isi dropdown ekspedisi dari dataMaster
            var options = $.map(dataMaster, function (m) {
                return '<option value="' + m.id + '">' + m.nama + '</option>';
            }).join('');
            $('#transaksi-ekspedisi').html(options);

            $('#transaksi-pic').val('');
            $('#transaksi-rute').val('');
            $('#transaksi-telp').val('');
            $('#transaksi-rekening').val('');
            $('#transaksi-tgl-kirim').val('');
            $('#transaksi-tgl-sampai').val('');
            app.popup.open('.popup-form-transaksi');
        });

        // Simpan
        $('#btnSimpanTransaksi').off('click').on('click', simpanTransaksi);

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

    function simpanTransaksi() {
        var ekspId = $('#transaksi-ekspedisi').val();
        var ekspedisi = $.grep(dataMaster, function (m) { return m.id === parseInt(ekspId); })[0];
        var pic = $('#transaksi-pic').val().trim();
        var rute = $('#transaksi-rute').val().trim();
        var telp = $('#transaksi-telp').val().trim();
        var rekening = $('#transaksi-rekening').val().trim();
        var tglKirim = $('#transaksi-tgl-kirim').val();
        var tglSampai = $('#transaksi-tgl-sampai').val();

        if (!ekspedisi || !rute || !pic) {
            app.toast.create({ text: 'Ekspedisi, PIC, dan Rute wajib diisi!', closeTimeout: 2000 }).open();
            return;
        }

        if (editTransaksiId) {
            // TODO: PUT ke API
            var item = $.grep(dataTransaksi, function (d) { return d.id === editTransaksiId; })[0];
            if (item) {
                $.extend(item, {
                    nama: ekspedisi.nama, pic: pic.toUpperCase(), rute: rute.toUpperCase(),
                    telp: telp, rekening: rekening, skor: ekspedisi.skor,
                    tglKirim: tglKirim, tglSampai: tglSampai
                });
            }
        } else {
            // TODO: POST ke API
            var newId = dataTransaksi.length ? dataTransaksi[dataTransaksi.length - 1].id + 1 : 1;
            var bln = String(new Date().getMonth() + 1).padStart(2, '0');
            var thn = String(new Date().getFullYear()).slice(-2);
            var kode = 'SHIP-' + bln + thn + '-' + String(newId).padStart(3, '0');
            dataTransaksi.push({
                id: newId, kode: kode, nama: ekspedisi.nama, pic: pic.toUpperCase(),
                rute: rute.toUpperCase(), telp: telp, rekening: rekening,
                skor: ekspedisi.skor, tglKirim: tglKirim, tglSampai: tglSampai
            });
        }

        app.popup.close('.popup-form-transaksi');
        app.toast.create({ text: 'Data pengiriman disimpan.', closeTimeout: 2000 }).open();
        renderTransaksi();
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