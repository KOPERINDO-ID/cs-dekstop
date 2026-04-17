// ============================================================
//  pengiriman.js
//  Sub Menu: Ekspedisi (Master) & Transaksi
//  Framework7 v7 + jQuery + Cordova
//  Catatan font: minimum 12px (siap export ke desktop)
//  Warna status: biru=selesai, hijau=proses, merah=bermasalah
// ============================================================

function apiCall(endpoint, data, onSuccess, onError) {
    $.ajax({
        url: BASE_API + '/cs/ekspedisi' + endpoint,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function (res) {
            if (res.status === 'success') {
                onSuccess(res.data || res);
            } else {
                var msg = res.message || 'Terjadi kesalahan.';
                app.toast.create({ text: msg, closeTimeout: 3000 }).open();
                if (onError) onError(msg);
            }
        },
        error: function (xhr) {
            var msg = 'Gagal terhubung ke server.';
            app.toast.create({ text: msg, closeTimeout: 3000 }).open();
            if (onError) onError(msg);
        }
    });
}

var PengirimanPage = (function () {

    // -------------------------------------------------------
    // STATE
    // -------------------------------------------------------
    var activeTab = 'master';
    var editMasterId = null;
    var editTransaksiId = null;

    // Diisi dari API — tidak lagi hardcoded
    var dataMaster = [];
    var dataTransaksi = [];

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
            loadAndRenderMaster();
        } else {
            $transaksi.addClass(ACTIVE_BG).removeClass(INACTIVE_BG);
            $master.addClass(INACTIVE_BG).removeClass(ACTIVE_BG);
            loadAndRenderTransaksi();
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
            ? 'background:#0d3a1a; color:#4caf50;'
            : 'background:#3a0d0d; color:#ef5350;';
    }

    function skorStyle(skor) {
        var s = parseFloat(skor) || 0;
        if (s >= 80) return { color: '#42a5f5', bg: '#0d1f3c', border: '#1565c0' };
        if (s >= 50) return { color: '#ffb74d', bg: '#2b1e00', border: '#7a5200' };
        return { color: '#ef9a9a', bg: '#3b0d0d', border: '#7a1f1f' };
    }

    function getInitials(nama) {
        if (!nama) return '??';
        var parts = nama.trim().replace(/^(PT|CV|UD)\s+/i, '').split(/\s+/);
        if (parts.length === 1) return nama.substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    var _logoColors = [
        { bg: '#E1F5EE', text: '#0F6E56' },
        { bg: '#E6F1FB', text: '#185FA5' },
        { bg: '#FAEEDA', text: '#854F0B' },
        { bg: '#FAECE7', text: '#993C1D' },
        { bg: '#EEEDFE', text: '#3C3489' },
        { bg: '#FBEAF0', text: '#993556' },
    ];
    function getLogoColor(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return _logoColors[Math.abs(hash) % _logoColors.length];
    }

    var IC = 'display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:#fff; cursor:pointer;';

    function buildCardHeader(count, showHistory, suffix) {
        var historyBtn = showHistory
            ? '<span id="btnHistory" style="' + IC + ' margin-right:2px;">' +
            '<i class="f7-icons" style="font-size:30px; color:#222; pointer-events:none;">clock_fill</i>' +
            '</span>'
            : '';
        return (
            '<div class="card-header bg-dark-gray-young" style="padding:0 10px;">' +
            '<div class="data-table-title" style="height:2px; margin-left:6px;">' +
            '<h3 class="margin-10" style="color:white; font-size:16px;">Data | <i id="countData">' + count + '</i></h3>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:8px;">' +
            historyBtn +
            '<div id="btnRefresh' + suffix + '" style="' + IC + '">' +
            '<i id="iconRefresh' + suffix + '" class="f7-icons" style="font-size:30px; color:#2e7d32; pointer-events:none;">arrow_2_circlepath_circle_fill</i>' +
            '</div>' +
            '<div id="btnTambah' + suffix + '" style="' + IC + '">' +
            '<i class="f7-icons" style="font-size:30px; color:#2e7d32; pointer-events:none;">plus_circle_fill</i>' +
            '</div>' +
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
    // LOADER
    // -------------------------------------------------------
    function ensureLoaderStyle() {
        if ($('#pgm-loader-style').length) return;
        $('<style id="pgm-loader-style">' +
            '@keyframes pgmSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }' +
            '@keyframes pgmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }' +
            '#pgm-loader-overlay {' +
            '  position:absolute; inset:0; z-index:50;' +
            '  background:rgba(14,14,14,0.95);' +
            '  display:flex; flex-direction:column; align-items:center; justify-content:center;' +
            '  gap:12px; min-height:120px;' +
            '}' +
            '#pgm-loader-overlay .pgm-ring { width:40px; height:40px; border:3px solid #2a2a2a; border-top-color:#2e7d32; border-radius:50%; animation:pgmSpin 0.75s linear infinite; }' +
            '#pgm-loader-overlay .pgm-label { font-size:16px; font-weight:700; color:#cccccc; animation:pgmPulse 1.6s ease-in-out infinite; }' +
            '#pgm-loader-overlay .pgm-sub   { font-size:14px; color:#999; margin-top:-4px; }' +
            '._pgm-icon-spin { animation:pgmSpin 0.75s linear infinite !important; }' +
            '</style>').appendTo('head');
    }

    function showLoader(suffix, label, sub) {
        ensureLoaderStyle();
        $('#mainContentPengiriman').css('position', 'relative');
        $('#iconRefresh' + suffix).addClass('_pgm-icon-spin');
        $('#pgm-loader-overlay').remove();
        var subHtml = sub ? '<div class="pgm-sub">' + sub + '</div>' : '';
        $('#mainContentPengiriman').append(
            '<div id="pgm-loader-overlay"><div class="pgm-ring"></div>' +
            '<div class="pgm-label">' + (label || 'Memuat data...') + '</div>' +
            subHtml + '</div>'
        );
    }

    function hideLoader(suffix) {
        $('#pgm-loader-overlay').remove();
        $('#iconRefresh' + suffix).removeClass('_pgm-icon-spin');
        $('#mainContentPengiriman').css('position', '');
    }

    // -------------------------------------------------------
    // FILTER TABLE (search helper)
    // -------------------------------------------------------
    function filterTable(tbodySelector, keyword) {
        var q = (keyword || '').toLowerCase();
        $(tbodySelector + ' tr').each(function () {
            var txt = $(this).text().toLowerCase();
            $(this).toggle(q === '' || txt.indexOf(q) > -1);
        });
    }

    // -------------------------------------------------------
    // RENDER MASTER (Ekspedisi)
    // -------------------------------------------------------
    function renderMaster() {
        var TD = 'padding:5px 6px; border:1px solid #ddd; font-size:12px;';
        var TH = 'border-bottom:1px solid gray; font-size:12px;';

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
                (function () { var ss = skorStyle(item.skor); return '<td style="' + TD + ' text-align:center; font-weight:700; background:' + ss.bg + '; color:' + ss.color + ';">' + item.skor + '</td>'; })() +
                '<td style="' + TD + '">' +
                '<button class="btn-detail-master button button-small bg-dark-gray-young text-add-colour-white" data-id="' + item.id + '" style="font-size:12px; font-weight:600;">DETAIL</button>' +
                '</td></tr>'
            );
        }).join('');

        var html =
            buildCardHeader(dataMaster.length, false, 'Master') +
            buildSearchBar('searchMaster', 'Cari Ekspedisi...') +
            '<div class="card-content" style="overflow-x:auto; width:100%;">' +
            '<table cellspacing="1" cellpadding="1" width="100%">' +
            '<thead class="bg-dark-gray-medium" style="position:sticky; top:0; z-index:1;"><tr>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="4%">No</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="16%">Nama</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="9%">PIC</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '">Alamat</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="11%">No Telp</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="8%">Bank</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="11%">No Rekening</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="11%">Nama Rekening</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="5%">Skor</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="7%">Opsi</th>' +
            '</tr></thead>' +
            '<tbody class="text-align-center" id="tbodyMaster">' + rows + '</tbody>' +
            '</table></div>';

        $('#mainContentPengiriman').html(html);
        bindMasterEvents();
    }

    function bindMasterEvents() {
        var $cnt = $('#mainContentPengiriman');

        $cnt.off('click', '#btnRefreshMaster').on('click', '#btnRefreshMaster', function () {
            loadAndRenderMaster();
        });

        $cnt.off('click', '#btnTambahMaster').on('click', '#btnTambahMaster', function () {
            editMasterId = null;
            $('#popupEkspedisiTitle').text('Tambah Ekspedisi');
            $('#expedisi-nama-perusahaan, #expedisi-pic, #expedisi-alamat, ' +
                '#expedisi-telp, #expedisi-bank, #expedisi-rekening, #expedisi-nama-rekening').val('');
            $('#btnSimpanEkspedisi').show();
            $('#btnHapusEkspedisi').hide();
            app.popup.open('.popup-form-ekspedisi');
        });

        $('#btnSimpanEkspedisi').off('click').on('click', simpanEkspedisi);
        $('#btnHapusEkspedisi').off('click').on('click', hapusEkspedisi);

        $cnt.off('input', '#searchMaster').on('input', '#searchMaster', function () {
            filterTable('#tbodyMaster', $(this).val());
        });

        $cnt.off('click', '.btn-detail-master').on('click', '.btn-detail-master', function () {
            var id = parseInt($(this).data('id'));
            var item = $.grep(dataMaster, function (d) { return d.id === id; })[0];
            if (!item) return;
            bukaDetailMaster(item);
        });
    }

    // -------------------------------------------------------
    // LOAD MASTER dari API
    // -------------------------------------------------------
    function loadAndRenderMaster() {
        showLoader('Master', 'Memuat data ekspedisi...', 'Harap tunggu sebentar');

        apiCall('/get-master-ekspedisi', {},
            function (data) {
                dataMaster = $.map(data, function (d) {
                    return {
                        id: d.id_expedisi,
                        nama: d.nama_expedisi,
                        pic: d.pic || '-',
                        alamat: d.alamat || '-',
                        telp: d.no_telp || '-',
                        bank: d.nama_bank || '-',
                        rekening: d.no_rekening || '-',
                        namaRekening: d.nama_rekening || '-',
                        skor: d.skor || 0,
                    };
                });
                hideLoader('Master');
                renderMaster();
            },
            function () { hideLoader('Master'); }
        );
    }

    function bukaDetailMaster(item) {
        editMasterId = item.id;
        $('#popupEkspedisiTitle').text('Detail Ekspedisi');
        $('#expedisi-nama-perusahaan').val(item.nama);
        $('#expedisi-pic').val(item.pic);
        $('#expedisi-alamat').val(item.alamat);
        $('#expedisi-telp').val(item.telp);
        $('#expedisi-bank').val(item.bank);
        $('#expedisi-rekening').val(item.rekening);
        $('#expedisi-nama-rekening').val(item.namaRekening);
        $('#btnSimpanEkspedisi').show();
        $('#btnHapusEkspedisi').show();
        app.popup.open('.popup-form-ekspedisi');
    }

    function simpanEkspedisi() {
        var nama = $('#expedisi-nama-perusahaan').val().trim();
        var pic = $('#expedisi-pic').val().trim();
        var alamat = $('#expedisi-alamat').val().trim();
        var telp = $('#expedisi-telp').val().trim();
        var bank = $('#expedisi-bank').val().trim();
        var rekening = $('#expedisi-rekening').val().trim();
        var namaRek = $('#expedisi-nama-rekening').val().trim();

        if (!nama) {
            app.toast.create({ text: 'Nama Perusahaan wajib diisi!', closeTimeout: 2000 }).open();
            return;
        }

        var isEdit = !!editMasterId;
        var label = isEdit ? 'memperbarui' : 'menyimpan';

        app.dialog.confirm(
            'Apakah Anda yakin ingin ' + label + ' data ekspedisi <b>' + nama.toUpperCase() + '</b>?',
            'Konfirmasi Simpan',
            function () {
                var endpoint = isEdit ? '/update-master-ekspedisi' : '/save-master-ekspedisi';
                var payload = {
                    nama_expedisi: nama.toUpperCase(),
                    pic: pic.toUpperCase(),
                    alamat: alamat,
                    no_telp: telp,
                    nama_bank: bank,
                    no_rekening: rekening,
                    nama_rekening: namaRek.toUpperCase(),
                };
                if (isEdit) payload.id_expedisi = editMasterId;

                $('#btnSimpanEkspedisi').prop('disabled', true).text('Menyimpan...');
                apiCall(endpoint, payload,
                    function () {
                        app.popup.close('.popup-form-ekspedisi');
                        app.toast.create({ text: 'Data ekspedisi berhasil disimpan.', closeTimeout: 2000 }).open();
                        loadAndRenderMaster();
                        $('#btnSimpanEkspedisi').prop('disabled', false).text('SIMPAN');
                    },
                    function () {
                        $('#btnSimpanEkspedisi').prop('disabled', false).text('SIMPAN');
                    }
                );
            }
        );
    }

    function hapusEkspedisi() {
        if (!editMasterId) return;
        var item = $.grep(dataMaster, function (d) { return d.id === editMasterId; })[0];
        if (!item) return;

        app.dialog.confirm(
            'Apakah Anda yakin ingin <b>menghapus</b> data ekspedisi <b>' + item.nama + '</b>?<br>' +
            '<span style="font-size:12px; color:#ef5350;">Tindakan ini tidak dapat dibatalkan.</span>',
            'Konfirmasi Hapus',
            function () {
                $('#btnHapusEkspedisi').prop('disabled', true).text('Menghapus...');
                apiCall('/delete-master-ekspedisi', { id_expedisi: editMasterId },
                    function () {
                        editMasterId = null;
                        app.popup.close('.popup-form-ekspedisi');
                        app.toast.create({ text: 'Data ekspedisi berhasil dihapus.', closeTimeout: 2000 }).open();
                        loadAndRenderMaster();
                    },
                    function () {
                        $('#btnHapusEkspedisi').prop('disabled', false).text('HAPUS DATA INI');
                    }
                );
            }
        );
    }

    // -------------------------------------------------------
    // RENDER TRANSAKSI
    // -------------------------------------------------------
    function renderTransaksi() {
        var TD = 'padding:5px 6px; border:1px solid #ddd; font-size:12px;';
        var TH = 'border-bottom:1px solid gray; font-size:12px;';

        var rows = $.map(dataTransaksi, function (item) {
            var tglStyle = tglSampaiBg(item.tglSampai);
            var spkCount = (item.spk_list || []).length;
            return (
                '<tr>' +
                '<td style="' + TD + '">' + item.kode + '</td>' +
                '<td style="' + TD + ' font-weight:700;">' + item.nama + '</td>' +
                '<td style="' + TD + '">' + item.pic + '</td>' +
                '<td style="' + TD + '">' + item.rute + '</td>' +
                '<td style="' + TD + ' text-align:center;">' + spkCount + ' SPK</td>' +
                '<td style="' + TD + '">' + item.telp + '</td>' +
                (function () { var ss = skorStyle(item.skor); return '<td style="' + TD + ' text-align:center; font-weight:700; background:' + ss.bg + '; color:' + ss.color + ';">' + item.skor + '</td>'; })() +
                '<td style="' + TD + '">' + formatTgl(item.tglKirim) + '</td>' +
                '<td style="' + TD + tglStyle + '">' + formatTgl(item.tglSampai) + '</td>' +
                '<td style="' + TD + '">' +
                '<button class="btn-detail-transaksi button button-small bg-dark-gray-young text-add-colour-white" data-id="' + item.id + '" style="font-size:12px; font-weight:600;">DETAIL</button>' +
                '</td></tr>'
            );
        }).join('');

        var html =
            buildCardHeader(dataTransaksi.length, true, 'Transaksi') +
            buildSearchBar('searchTransaksi', 'Cari Pengiriman...') +
            '<div class="card-content" style="overflow-x:auto; width:100%;">' +
            '<table cellspacing="1" cellpadding="1" width="100%">' +
            '<thead class="bg-dark-gray-medium" style="position:sticky; top:0; z-index:1;"><tr>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="10%">Kode</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="13%">Ekspedisi</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="8%">PIC</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '">Rute</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="6%">SPK</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="10%">No Telp</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="5%">Skor</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="8%">Tgl Kirim</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="8%">Tgl Sampai</th>' +
            '<th class="label-cell text-align-center" style="' + TH + '" width="7%">Opsi</th>' +
            '</tr></thead>' +
            '<tbody class="text-align-center" id="tbodyTransaksi">' + rows + '</tbody>' +
            '</table></div>';

        $('#mainContentPengiriman').html(html);
        bindTransaksiEvents();
    }

    function bindTransaksiEvents() {
        var $cnt = $('#mainContentPengiriman');

        // ── Tombol Refresh → fetch ulang dari API ──────────────────
        $cnt.off('click', '#btnRefreshTransaksi').on('click', '#btnRefreshTransaksi', function () {
            loadAndRenderTransaksi();
        });

        $cnt.off('click', '#btnHistory').on('click', '#btnHistory', function () {
            bukaHistoryPengiriman();
        });

        $cnt.off('click', '#btnTambahTransaksi').on('click', '#btnTambahTransaksi', function () {
            bukaPopupTambahTransaksi();
        });

        $cnt.off('input', '#searchTransaksi').on('input', '#searchTransaksi', function () {
            filterTable('#tbodyTransaksi', $(this).val());
        });

        $cnt.off('click', '.btn-detail-transaksi').on('click', '.btn-detail-transaksi', function () {
            var id = parseInt($(this).data('id'));
            var item = $.grep(dataTransaksi, function (d) { return d.id === id; })[0];
            if (!item) return;
            bukaDetailTransaksi(item);
        });
    }

    // -------------------------------------------------------
    // LOAD TRANSAKSI dari API  ← INTEGRASI UTAMA
    // -------------------------------------------------------
    function loadAndRenderTransaksi() {
        showLoader('Transaksi', 'Memuat data pengiriman...', 'Harap tunggu sebentar');

        apiCall('/get-transaksi-pengiriman', {},
            function (data) {
                // Mapping field BE → field yang dipakai renderTransaksi() & detail
                dataTransaksi = $.map(data, function (d) {
                    return {
                        id: d.id,
                        kode: d.kode,
                        nama: d.nama_expedisi,
                        pic: d.pic || '-',
                        telp: d.no_telp || '-',
                        rute: d.rute,
                        skor: parseFloat(d.skor) || 0,
                        estimasi_hari: d.estimasi_hari || 0,
                        total_harga: d.total_harga || 0,
                        pct_tepat_waktu: d.skor || 0, // skor dari performa
                        tglKirim: d.tgl_kirim,
                        tglSampai: d.tgl_sampai,
                        // spk_list: array objek dari BE (sudah terisi via JOIN)
                        spk_list: $.map(d.spk_list || [], function (s) {
                            return {
                                penjualan_id: s.penjualan_id,
                                kode_spk: s.kode_spk,
                                nama_client: s.nama_client,
                                kota_asal: s.kota_asal,
                                kota_tujuan: s.kota_tujuan,
                                ukuran: s.ukuran || '-',
                                tgl_kirim: s.tgl_kirim,
                                tgl_req_sampai: s.tgl_req_sampai,
                            };
                        }),
                    };
                });
                hideLoader('Transaksi');
                renderTransaksi();
            },
            function () { hideLoader('Transaksi'); }
        );
    }

    // -------------------------------------------------------
    // DETAIL TRANSAKSI — Sheet Modal, Read-Only
    // -------------------------------------------------------
    function bukaDetailTransaksi(item) {
        editTransaksiId = item.id;
        $('.sheet-detail-transaksi').appendTo('body');
        renderDetailTrxReadOnly(item);
        app.sheet.open('.sheet-detail-transaksi');

        $(document).one('sheet:closed', '.sheet-detail-transaksi', function () {
            $(document).off('click.detailTrx');
            editTransaksiId = null;
        });
    }

    function renderDetailTrxReadOnly(item) {
        var lc = getLogoColor(item.nama);
        var initials = getInitials(item.nama);
        var tglOk = new Date(item.tglSampai) >= new Date(new Date().setHours(0, 0, 0, 0));
        var spkList = item.spk_list || [];

        var harga = item.total_harga
            ? 'Rp ' + parseInt(item.total_harga).toLocaleString('id-ID')
            : '-';

        // ── Tabel SPK ──
        var spkHtml = '';
        if (spkList.length === 0) {
            spkHtml = '<div style="padding:24px 0; font-size:12px; color:#555; text-align:center;">Tidak ada data SPK</div>';
        } else {
            var TDs = 'padding:8px 6px; font-size:12px; border-bottom:1px solid #1e1e1e; vertical-align:middle;';
            var THs = 'padding:6px 6px; font-size:11px; color:#555; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; border-bottom:1px solid #2a2a2a; white-space:nowrap;';
            spkHtml =
                '<table style="width:100%; border-collapse:collapse;">' +
                '<thead><tr>' +
                '<th style="' + THs + ' width:28px; text-align:center;">No</th>' +
                '<th style="' + THs + '">Kode SPK</th>' +
                '<th style="' + THs + '">Client</th>' +
                '<th style="' + THs + ' text-align:center;">Ukuran</th>' +
                '<th style="' + THs + ' text-align:center;">Tgl Kirim</th>' +
                '<th style="' + THs + ' text-align:center;">Req Sampai</th>' +
                '</tr></thead>' +
                '<tbody>';
            spkList.forEach(function (spk, idx) {
                var ukuranColor = spk.ukuran === 'XL' ? '#ef9a9a'
                    : spk.ukuran === 'L' ? '#ffb74d'
                        : spk.ukuran === 'M' ? '#81c784'
                            : '#90caf9';
                spkHtml +=
                    '<tr>' +
                    '<td style="' + TDs + ' text-align:center; color:#666;">' + (idx + 1) + '</td>' +
                    '<td style="' + TDs + ' font-weight:700; color:#fff; white-space:nowrap;">' + spk.kode_spk + '</td>' +
                    '<td style="' + TDs + ' color:#aaa;">' + spk.nama_client + '</td>' +
                    '<td style="' + TDs + ' text-align:center;">' +
                    '<span style="font-size:11px; padding:1px 7px; border-radius:10px; background:#222; color:' + ukuranColor + '; border:1px solid ' + ukuranColor + '; font-weight:700;">' + spk.ukuran + '</span>' +
                    '</td>' +
                    '<td style="' + TDs + ' text-align:center; color:#ddd; white-space:nowrap;">' + formatTgl(spk.tgl_kirim) + '</td>' +
                    '<td style="' + TDs + ' text-align:center; color:#ff9800; white-space:nowrap;">' + formatTgl(spk.tgl_req_sampai) + '</td>' +
                    '</tr>';
            });
            spkHtml += '</tbody></table>';
        }

        var ss = skorStyle(item.skor);
        var tglBg = tglOk
            ? 'background:#0d3a1a; color:#4caf50;'
            : 'background:#3a0d0d; color:#ef5350;';

        var html =
            '<div style="padding:16px 20px 12px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #1e1e1e;">' +
            '<div style="display:flex; align-items:center; gap:14px;">' +
            '<div style="width:48px; height:48px; border-radius:12px; background:' + lc.bg + '; color:' + lc.text + '; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; flex-shrink:0;">' + initials + '</div>' +
            '<div>' +
            '<div style="font-size:15px; font-weight:800; color:#fff;">' + item.nama + '</div>' +
            '<div style="font-size:12px; color:#777; margin-top:2px;">' + item.kode + '</div>' +
            '</div>' +
            '</div>' +
            '<div style="font-size:14px; font-weight:800; padding:6px 12px; border-radius:8px; background:' + ss.bg + '; color:' + ss.color + '; border:1px solid ' + ss.border + ';">' + item.skor + '</div>' +
            '</div>' +

            '<div style="display:flex; gap:0;">' +
            // Kolom kiri: info ekspedisi + jadwal
            '<div style="flex:1; padding:16px; border-right:1px solid #1a1a1a;">' +
            '<div style="font-size:11px; color:#555; font-weight:700; letter-spacing:1px; margin-bottom:10px;">EKSPEDISI</div>' +
            detailRow('person', 'PIC', item.pic) +
            detailRow('phone', 'Telp', item.telp) +
            detailRow('location', 'Rute', item.rute) +
            '<div style="height:1px; background:#1e1e1e; margin:10px 0;"></div>' +
            '<div style="font-size:11px; color:#555; font-weight:700; letter-spacing:1px; margin-bottom:10px;">JADWAL</div>' +
            detailRow('calendar', 'Tgl Kirim', formatTgl(item.tglKirim)) +
            '<div style="display:flex; align-items:center; gap:8px; margin:4px 0; padding:6px 8px; border-radius:6px; ' + tglBg + '">' +
            '<i class="f7-icons" style="font-size:14px; flex-shrink:0;">clock</i>' +
            '<div style="flex:1;">' +
            '<div style="font-size:11px; opacity:0.75;">TGL SAMPAI</div>' +
            '<div style="font-size:13px; font-weight:700;">' + formatTgl(item.tglSampai) + '</div>' +
            '</div></div>' +
            detailRow('star', 'Harga Ongkir', harga) +
            '</div>' +
            // Kolom kanan: daftar SPK
            '<div style="flex:1.2; display:flex; flex-direction:column;">' +
            '<div style="padding:12px 16px 8px; display:flex; align-items:center; justify-content:space-between;">' +
            '<div style="font-size:11px; color:#555; font-weight:700; letter-spacing:1px;">DAFTAR SPK</div>' +
            '<div style="font-size:11px; color:#444;">' + spkList.length + ' SPK</div>' +
            '</div>' +
            '<div style="flex:1; overflow-y:auto; max-height:300px; padding:0 12px 12px;">' + spkHtml + '</div>' +
            '</div>' +
            '</div>' +

            '<div style="padding:0 16px 20px;">' +
            '<button id="btnTutupDetailTrx" ' +
            'style="width:100%; padding:13px; background:#222; color:#fff; border:1px solid #333; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer;">' +
            'Tutup' +
            '</button>' +
            '</div>';

        $('.sheet-detail-transaksi .page-content').html(html);

        $(document).off('click.detailTrx', '#btnTutupDetailTrx')
            .on('click.detailTrx', '#btnTutupDetailTrx', function () {
                app.sheet.close('.sheet-detail-transaksi');
            });
    }

    function detailRow(icon, label, value) {
        return (
            '<div style="display:flex; align-items:center; gap:8px; margin:4px 0;">' +
            '<i class="f7-icons" style="font-size:14px; color:#555; width:16px; flex-shrink:0;">' + icon + '</i>' +
            '<div style="font-size:11px; color:#555; min-width:70px; text-transform:uppercase; letter-spacing:0.4px;">' + label + '</div>' +
            '<div style="font-size:13px; color:#ddd; font-weight:600;">' + value + '</div>' +
            '</div>'
        );
    }

    // -------------------------------------------------------
    // INIT PAGE
    // -------------------------------------------------------
    function init() {
        $('#masterPengiriman').off('click').on('click', function () { setActiveTab('master'); });
        $('#transaksiPengiriman').off('click').on('click', function () { setActiveTab('transaksi'); });
        setActiveTab('master'); // default tab
    }

    return { init: init };

})();

// ============================================================
//  POPUP TAMBAH TRANSAKSI — 2 Step
//  Step 1: Pilih SPK
//  Step 2: Pilih Ekspedisi & Konfirmasi
// ============================================================

var dataSPK = [];       // data dari API /get-spk-ready-kirim
var trxSelectedSpk = [];       // SPK yang dipilih user
var trxSelectedEkspedisi = null;  // Ekspedisi yang dipilih di step 2

// ── Helpers (duplikat dari PengirimanPage agar bisa dipakai di luar IIFE) ──
function trxFormatTgl(dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

var _trxLogoColors = [
    { bg: '#E1F5EE', text: '#0F6E56' }, { bg: '#E6F1FB', text: '#185FA5' },
    { bg: '#FAEEDA', text: '#854F0B' }, { bg: '#FAECE7', text: '#993C1D' },
    { bg: '#EEEDFE', text: '#3C3489' }, { bg: '#FBEAF0', text: '#993556' },
];
function trxGetLogoColor(idx) { return _trxLogoColors[idx % _trxLogoColors.length]; }
function trxGetInitials(nama) {
    if (!nama) return '??';
    var parts = nama.trim().replace(/^(PT|CV|UD)\s+/i, '').split(/\s+/);
    if (parts.length === 1) return nama.substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}
function trxGetEarliestTglKirim() {
    return trxSelectedSpk.reduce(function (min, s) {
        return (!min || s.tgl_kirim < min) ? s.tgl_kirim : min;
    }, null);
}
function trxGetEarliestTglReq() {
    return trxSelectedSpk.reduce(function (min, s) {
        return (!min || s.tgl_req_sampai < min) ? s.tgl_req_sampai : min;
    }, null);
}

// ── Buka popup & load SPK ────────────────────────────────────
function bukaPopupTambahTransaksi() {
    trxSelectedSpk = [];
    trxSelectedEkspedisi = null;
    dataSPK = [];

    app.popup.open('.popup-form-transaksi');
    transaksiGoStep(1);

    // Load SPK yang siap dikirim (belum ada pengiriman)
    $('#trx-spk-list').html('<div style="text-align:center; padding:30px; color:#666; font-size:13px;">Memuat data SPK...</div>');

    apiCall('/get-spk-ready-kirim', {},
        function (data) {
            dataSPK = data;
            renderSpkList(dataSPK, null);
        },
        function () {
            $('#trx-spk-list').html('<div style="color:#ef5350; padding:20px; text-align:center; font-size:13px;">Gagal memuat data SPK.</div>');
        }
    );

    // Event: search SPK
    $('#trx-search-spk').off('input').on('input', function () {
        var q = $(this).val().toLowerCase();
        var filtered = dataSPK.filter(function (s) {
            return (
                (s.kode_spk || '').toLowerCase().indexOf(q) > -1 ||
                (s.nama_client || '').toLowerCase().indexOf(q) > -1 ||
                (s.kota_tujuan || '').toLowerCase().indexOf(q) > -1
            );
        });
        var anchor = trxSelectedSpk.length ? trxSelectedSpk[0] : null;
        renderSpkList(filtered, anchor);
    });

    // Event: Lanjut ke step 2
    $('#trx-btn-lanjut').off('click').on('click', function () {
        if (!trxSelectedSpk.length) return;
        transaksiGoStep(2);
        renderEkspedisiStep2();
    });

    // Event: Konfirmasi simpan
    $('#trx-btn-konfirmasi').off('click').on('click', function () {
        simpanTransaksiStep2();
    });
}

// ── Step navigation ─────────────────────────────────────────
function transaksiGoStep(step) {
    if (step === 1) {
        $('#trx-step-1').show();
        $('#trx-step-2').hide();
        $('#trx-btn-back').hide();
        $('#trx-step-ind-1').css({ color: '#fff', 'border-bottom-color': '#2e7d32' });
        $('#trx-step-ind-2').css({ color: '#666', 'border-bottom-color': 'transparent' });
    } else {
        $('#trx-step-1').hide();
        $('#trx-step-2').show();
        $('#trx-btn-back').show();
        $('#trx-step-ind-1').css({ color: '#666', 'border-bottom-color': 'transparent' });
        $('#trx-step-ind-2').css({ color: '#fff', 'border-bottom-color': '#2e7d32' });
    }
}

// ── Render daftar SPK (Step 1) ───────────────────────────────
function renderSpkList(list, anchorSpk) {
    if (!list || list.length === 0) {
        $('#trx-spk-list').html('<div style="text-align:center; color:#555; padding:40px 20px; font-size:13px;">Tidak ada SPK tersedia.</div>');
        return;
    }

    var html = '';
    list.forEach(function (spk) {
        var isSelected = trxSelectedSpk.some(function (s) { return s.id === spk.id; });
        // Disabled jika rute berbeda dengan anchor (hanya boleh satu rute per pengiriman)
        var isDisabled = anchorSpk &&
            (spk.kota_asal !== anchorSpk.kota_asal || spk.kota_tujuan !== anchorSpk.kota_tujuan);

        var bgColor = isSelected ? '#1b3a1b' : 'transparent';
        var opacity = isDisabled ? '0.35' : '1';
        var checkHtml = isSelected
            ? '<div style="margin-left:8px; color:#2e7d32; font-size:18px; font-weight:900;">✓</div>'
            : '';

        html +=
            '<div class="trx-spk-row" data-id="' + spk.id + '" ' +
            'style="display:flex; align-items:center; padding:10px 6px; border-bottom:1px solid #1e1e1e; ' +
            'background:' + bgColor + '; opacity:' + opacity + '; cursor:' + (isDisabled ? 'default' : 'pointer') + '; ' +
            'border-radius:4px; margin-top:2px;" ' +
            (isDisabled ? 'data-disabled="1"' : '') + '>' +

            '<div style="flex:1; min-width:0;">' +
            '<div style="font-size:13px; font-weight:700; color:#fff;">' + spk.kode_spk + '</div>' +
            '<div style="font-size:12px; color:#aaa; margin-top:2px;">' +
            spk.nama_client + ' &nbsp;·&nbsp; ' + spk.kota_asal + ' → ' + spk.kota_tujuan +
            '</div>' +
            '</div>' +

            '<div style="text-align:right; flex-shrink:0;">' +
            '<div style="font-size:12px; color:#888;">' + trxFormatTgl(spk.tgl_kirim) + '</div>' +
            '<div style="font-size:11px; color:#555; margin-top:2px;">req: ' + trxFormatTgl(spk.tgl_req_sampai) + '</div>' +
            '</div>' +

            checkHtml +
            '</div>';
    });

    $('#trx-spk-list').html(html);

    $('.trx-spk-row').off('click').on('click', function () {
        if ($(this).data('disabled')) return;
        var id = parseInt($(this).data('id'));
        var spk = dataSPK.filter(function (s) { return s.id === id; })[0];
        if (!spk) return;

        var idx = -1;
        $.each(trxSelectedSpk, function (i, s) { if (s.id === id) { idx = i; return false; } });
        if (idx > -1) {
            trxSelectedSpk.splice(idx, 1);
            if (trxSelectedSpk.length === 0) { renderSpkList(dataSPK, null); updateSpkSummary(); return; }
        } else {
            trxSelectedSpk.push(spk);
        }
        renderSpkList(dataSPK, trxSelectedSpk.length ? trxSelectedSpk[0] : null);
        updateSpkSummary();
    });
}

function updateSpkSummary() {
    var count = trxSelectedSpk.length;
    if (count === 0) { $('#trx-spk-summary').hide(); setLanjutBtn(false); return; }
    var ukuranList = $.map(trxSelectedSpk, function (s) { return s.ukuran; }).join(', ');
    var rute = trxSelectedSpk[0].kota_asal + ' → ' + trxSelectedSpk[0].kota_tujuan;
    $('#trx-spk-summary').html('<b>' + count + ' SPK dipilih</b> &nbsp;·&nbsp; ' + rute + ' &nbsp;·&nbsp; Ukuran: ' + ukuranList).show();
    setLanjutBtn(true);
}

function setLanjutBtn(active) {
    if (active) {
        $('#trx-btn-lanjut').prop('disabled', false).css({ 'background-color': '#2e7d32', color: '#fff', cursor: 'pointer' });
    } else {
        $('#trx-btn-lanjut').prop('disabled', true).css({ 'background-color': '#555', color: '#999', cursor: 'not-allowed' });
    }
}

// ── Render Step 2: pilih ekspedisi ───────────────────────────
function renderEkspedisiStep2() {
    trxSelectedEkspedisi = null;
    setKonfirmasiBtn(false);

    var anchor = trxSelectedSpk[0];
    var tglKirim = trxGetEarliestTglKirim();
    var tglReq = trxGetEarliestTglReq();

    $('#trx-eksp-rute').text(anchor.kota_asal + ' → ' + anchor.kota_tujuan);
    $('#trx-eksp-tgl').text('Kirim: ' + trxFormatTgl(tglKirim) + '  |  Req sampai: ' + trxFormatTgl(tglReq));
    $('#trx-eksp-list').html(renderTrxEkspedisiSkeleton());

    var totalBerat = trxSelectedSpk.reduce(function (sum, s) {
        return sum + (parseFloat(s.berat) || 1);
    }, 0);

    apiCall('/get-rekomendasi-ekspedisi', {
        kota_asal: anchor.kota_asal,
        kota_tujuan: anchor.kota_tujuan,
        tgl_kirim: tglKirim,
        tgl_butuh_sampai: tglReq,
        total_berat: totalBerat,
    }, function (data) {
        renderTrxEkspedisiList(data);
    }, function () {
        $('#trx-eksp-list').html('<div style="color:#ef5350;padding:20px;text-align:center;">Gagal memuat rekomendasi.</div>');
    });
}

function renderTrxEkspedisiList(list) {
    if (!list || list.length === 0) {
        $('#trx-eksp-list').html('<div style="text-align:center; color:#666; padding:20px; font-size:13px;">Tidak ada ekspedisi tersedia.</div>');
        return;
    }
    var html = '';
    list.forEach(function (item, idx) {
        var tepat = parseFloat(item.pct_tepat_waktu) || 0;
        var skor = parseFloat(item.skor_total) || 0;
        var bisaTepat = parseInt(item.bisa_tepat_waktu) === 1;
        var dotColor = !bisaTepat ? '#ef5350' : (skor >= 70 ? '#1565c0' : '#43a047');
        var subColor = bisaTepat ? '' : 'color:#ef9a9a;';
        var subText = bisaTepat
            ? 'Skor ' + skor + ' &nbsp;·&nbsp; ' + tepat + '% tepat waktu'
            : 'Melebihi deadline &nbsp;·&nbsp; ' + tepat + '% tepat waktu';
        var harga = parseInt(item.total_harga).toLocaleString('id-ID');
        var initials = trxGetInitials(item.nama_expedisi);
        var logoColor = trxGetLogoColor(idx);

        html +=
            '<div class="trx-eksp-row" data-id="' + item.id_expedisi + '" data-nama="' + item.nama_expedisi + '" ' +
            'data-harga="' + item.total_harga + '" data-hari="' + item.estimasi_hari + '" data-skor="' + skor + '" ' +
            'data-pct="' + tepat + '" ' +
            'style="display:flex; align-items:center; padding:12px 6px; border-bottom:1px solid #2a2a2a; cursor:pointer; border-radius:4px; margin-top:4px; transition:background 0.15s;">' +
            '<div style="width:10px; height:10px; border-radius:50%; background:' + dotColor + '; flex-shrink:0; margin-right:8px;"></div>' +
            '<div style="width:38px; height:38px; border-radius:8px; background:' + logoColor.bg + '; color:' + logoColor.text + '; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex-shrink:0; margin-right:10px; pointer-events:none;">' + initials + '</div>' +
            '<div style="flex:1; min-width:0;">' +
            '<div style="font-size:13px; font-weight:700; color:#fff;">' + item.nama_expedisi + '</div>' +
            '<div style="font-size:12px; margin-top:2px; ' + subColor + '">' + subText + '</div>' +
            '</div>' +
            '<div style="text-align:right; flex-shrink:0; width:90px;">' +
            '<div style="font-size:13px; font-weight:700; color:#fff;">Rp ' + harga + '</div>' +
            '<div style="font-size:12px; color:#aaa; margin-top:2px;">' + item.estimasi_hari + ' hari</div>' +
            '</div>' +
            '<div class="trx-eksp-check" style="display:none; margin-left:8px; color:#2e7d32; font-size:18px; font-weight:900;">✓</div>' +
            '</div>';
    });
    $('#trx-eksp-list').html(html);

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
            pct_tepat_waktu: $(this).data('pct'),
        };
        setKonfirmasiBtn(true);
    });
}

function renderTrxEkspedisiSkeleton() {
    var html = '';
    for (var i = 0; i < 3; i++) {
        html +=
            '<div style="display:flex; align-items:center; padding:12px 6px; border-bottom:1px solid #2a2a2a;">' +
            '<div style="width:10px; height:10px; border-radius:50%; background:#333; margin-right:8px;"></div>' +
            '<div style="width:38px; height:38px; border-radius:8px; background:#2a2a2a; margin-right:10px;"></div>' +
            '<div style="flex:1;">' +
            '<div style="height:13px; background:#2a2a2a; border-radius:4px; width:55%; margin-bottom:6px;"></div>' +
            '<div style="height:12px; background:#222; border-radius:4px; width:75%;"></div>' +
            '</div>' +
            '<div style="width:70px; text-align:right;">' +
            '<div style="height:13px; background:#2a2a2a; border-radius:4px; margin-bottom:5px;"></div>' +
            '<div style="height:12px; background:#222; border-radius:4px;"></div>' +
            '</div></div>';
    }
    return html;
}

function setKonfirmasiBtn(active) {
    if (active) {
        $('#trx-btn-konfirmasi').prop('disabled', false).css({ 'background-color': '#1565c0', color: '#fff', cursor: 'pointer' });
    } else {
        $('#trx-btn-konfirmasi').prop('disabled', true).css({ 'background-color': '#555', color: '#999', cursor: 'not-allowed' });
    }
}

// ── Simpan transaksi (Step 2) ─────────────────────────────────
// Kirim penjualan_ids sebagai ARRAY → BE handle bulk dalam 1 transaksi DB
function simpanTransaksiStep2() {
    if (!trxSelectedEkspedisi || trxSelectedSpk.length === 0) return;

    $('#trx-btn-konfirmasi').prop('disabled', true).text('Menyimpan...');

    // Kumpulkan semua penjualan_id dari SPK yang dipilih
    var penjualanIds = trxSelectedSpk.map(function (s) { return s.penjualan_id; });

    apiCall('/set-ekspedisi-penjualan', {
        penjualan_ids: penjualanIds,                      // ← array
        id_expedisi: trxSelectedEkspedisi.id_expedisi,
        total_harga: trxSelectedEkspedisi.total_harga,
    }, function () {
        app.popup.close('.popup-form-transaksi');
        app.toast.create({
            text: trxSelectedEkspedisi.nama_expedisi + ' (' + trxSelectedSpk.length + ' SPK) berhasil disimpan.',
            closeTimeout: 3000
        }).open();
        loadAndRenderTransaksi(); // refresh tab transaksi dari API
    }, function () {
        $('#trx-btn-konfirmasi').prop('disabled', false).text('KONFIRMASI');
    });
}