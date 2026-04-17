// ============================================================
//  pengiriman-history.js
//  History Pengiriman — Sheet Modal
//  Pola: Framework7 v7 + jQuery ($$ = F7, $ = jQuery)
//  Catatan font: minimum 12px (siap export ke desktop)
//  Warna status: biru=selesai, hijau=proses, merah=terlambat/bermasalah
// ============================================================

// ── State ─────────────────────────────────────────────────────
var histActivePeriod = 'all';
var histCustomFrom = null;
var histCustomTo = null;
var dataHistoryPengiriman = [];   // diisi dari API, bukan lagi hardcoded
var _histIsFetching = false;   // guard double-call

// ── Helpers ───────────────────────────────────────────────────
var _histLogoColors = [
    { bg: '#E1F5EE', text: '#0F6E56' },
    { bg: '#E6F1FB', text: '#185FA5' },
    { bg: '#FAEEDA', text: '#854F0B' },
    { bg: '#FAECE7', text: '#993C1D' },
    { bg: '#EEEDFE', text: '#3C3489' },
    { bg: '#FBEAF0', text: '#993556' },
];

function histGetInitials(nama) {
    if (!nama) return '??';
    var parts = nama.trim().replace(/^(PT|CV|UD)\s+/i, '').split(/\s+/);
    if (parts.length === 1) return nama.substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function histGetLogoColor(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return _histLogoColors[Math.abs(hash) % _histLogoColors.length];
}

function histFormatTgl(dateStr) {
    if (!dateStr) return '-';
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

// ── Konfigurasi warna per status ──────────────────────────────
function histStatusConfig(status) {
    if (status === 'selesai') return { dot: '#1565c0', badge: '#0d1f3c', badgeTxt: '#42a5f5', label: 'Selesai' };
    if (status === 'terlambat') return { dot: '#ef5350', badge: '#3b0d0d', badgeTxt: '#ef9a9a', label: 'Terlambat' };
    return { dot: '#43a047', badge: '#0d3b0d', badgeTxt: '#81c784', label: 'Proses' };
}

// Selisih hari (aktual vs deadline) — positif = terlambat
function histDeltaHari(tglSampai, tglAktual) {
    if (!tglSampai || !tglAktual) return null;
    var a = new Date(tglAktual), b = new Date(tglSampai);
    return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

// ── Konversi period chip → date_from / date_to ─────────────────
function histPeriodToDateRange(period) {
    var today = new Date(); today.setHours(0, 0, 0, 0);

    function fmt(d) {
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + dd;
    }

    if (period === 'thismonth') {
        var from = new Date(today.getFullYear(), today.getMonth(), 1);
        var to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { date_from: fmt(from), date_to: fmt(to) };
    }
    if (period === 'lastmonth') {
        var from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        var to = new Date(today.getFullYear(), today.getMonth(), 0);
        return { date_from: fmt(from), date_to: fmt(to) };
    }
    if (period === '3month') {
        var from = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        return { date_from: fmt(from), date_to: fmt(today) };
    }
    if (period === 'custom' && histCustomFrom && histCustomTo) {
        return { date_from: histCustomFrom, date_to: histCustomTo };
    }
    // 'all' → tidak kirim filter tanggal
    return {};
}

// ── Filter client-side (search keyword saja — periode dihandle BE) ────
function histFilterKeyword(data, keyword) {
    var q = (keyword || '').toLowerCase();
    if (!q) return data;
    return data.filter(function (item) {
        return (
            (item.kode || '').toLowerCase().indexOf(q) > -1 ||
            (item.nama_ekspedisi || '').toLowerCase().indexOf(q) > -1 ||
            (item.rute || '').toLowerCase().indexOf(q) > -1
        );
    });
}

// ── Fetch dari API kemudian render ────────────────────────────
function histFetchAndRender(keyword) {
    if (_histIsFetching) return;
    _histIsFetching = true;

    // Tampilkan skeleton/loading sementara fetch
    $('#hist-count-label').text('Memuat data...');
    $('#hist-list').html(
        '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px; color:#444;">' +
        '<div style="width:32px; height:32px; border:3px solid #2a2a2a; border-top-color:#2e7d32; border-radius:50%;' +
        ' animation:pgmSpin 0.75s linear infinite; margin-bottom:12px;"></div>' +
        '<div style="font-size:13px; color:#555;">Memuat riwayat pengiriman...</div>' +
        '</div>'
    );

    var dateRange = histPeriodToDateRange(histActivePeriod);

    apiCall('/get-history-pengiriman', dateRange,
        function (data) {
            _histIsFetching = false;

            // Normalisasi field BE → field yang dipakai histRenderList
            dataHistoryPengiriman = $.map(data, function (d) {
                return {
                    id: d.id,
                    kode: d.kode,
                    nama_ekspedisi: d.nama_expedisi,
                    pic: d.pic || '-',
                    rute: d.rute,
                    tgl_kirim: d.tgl_kirim,
                    tgl_sampai: d.tgl_sampai,
                    tgl_aktual_sampai: d.tgl_aktual_sampai || null,
                    skor: parseFloat(d.skor) || 0,
                    estimasi_hari: d.estimasi_hari || 0,
                    jumlah_spk: d.jumlah_spk || 0,
                    status: d.status || 'proses',
                };
            });

            var filtered = histFilterKeyword(dataHistoryPengiriman, keyword);
            histRenderList(filtered);
        },
        function () {
            _histIsFetching = false;
            $('#hist-count-label').text('Gagal memuat data');
            $('#hist-list').html(
                '<div style="text-align:center; padding:40px; color:#ef5350; font-size:13px;">' +
                '<i class="f7-icons" style="font-size:32px; display:block; margin-bottom:8px;">exclamationmark_triangle</i>' +
                'Gagal memuat riwayat pengiriman. Coba lagi.</div>'
            );
        }
    );
}

// ── Filter & render ulang dari data lokal (hanya keyword) ─────
function histRefreshList() {
    var keyword = $('#hist-search').val() || '';
    var filtered = histFilterKeyword(dataHistoryPengiriman, keyword);
    histRenderList(filtered);
}

// ── Render list ───────────────────────────────────────────────
function histRenderList(data) {
    if (!data || data.length === 0) {
        $('#hist-list').html(
            '<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; padding:48px 20px; color:#444;">' +
            '<i class="f7-icons" style="font-size:48px; display:block; margin-bottom:12px; color:#2a2a2a;">tray</i>' +
            '<div style="font-size:13px; font-weight:600; color:#555;">Tidak ada data pengiriman</div>' +
            '<div style="font-size:12px; color:#333; margin-top:4px;">Coba ubah filter atau kata kunci</div>' +
            '</div>'
        );
        $('#hist-count-label').text('0 data ditemukan');
        return;
    }

    // Grup berdasarkan bulan-tahun tgl_kirim
    var grouped = {};
    var groupOrder = [];
    data.forEach(function (item) {
        var d = new Date(item.tgl_kirim);
        var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        var key = months[d.getMonth()] + ' ' + d.getFullYear();
        if (!grouped[key]) { grouped[key] = []; groupOrder.push(key); }
        grouped[key].push(item);
    });

    var html = '';
    groupOrder.forEach(function (groupKey) {

        // Group header
        html +=
            '<div style="display:flex; align-items:center; gap:8px; padding:14px 2px 8px;">' +
            '<div style="font-size:12px; font-weight:800; color:#555; letter-spacing:1px; text-transform:uppercase;">' + groupKey + '</div>' +
            '<div style="flex:1; height:1px; background:#222;"></div>' +
            '<div style="font-size:12px; color:#444;">' + grouped[groupKey].length + ' pengiriman</div>' +
            '</div>';

        // Tabel header
        html +=
            '<div style="overflow-x:auto;">' +
            '<table style="width:100%; border-collapse:collapse; min-width:520px;">' +
            '<thead>' +
            '<tr style="border-bottom:1px solid #222;">' +
            '<th style="padding:6px 8px; font-size:11px; color:#555; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; text-align:left; white-space:nowrap; width:120px;">Kode</th>' +
            '<th style="padding:6px 8px; font-size:11px; color:#555; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; text-align:left;">Ekspedisi</th>' +
            '<th style="padding:6px 8px; font-size:11px; color:#555; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; text-align:center; white-space:nowrap;">Tgl Kirim</th>' +
            '<th style="padding:6px 8px; font-size:11px; color:#555; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; text-align:center; white-space:nowrap;">Req Sampai</th>' +
            '<th style="padding:6px 8px; font-size:11px; color:#555; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; text-align:center; white-space:nowrap;">SPK</th>' +
            '<th style="padding:6px 8px; font-size:11px; color:#555; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; text-align:center; white-space:nowrap;">Status</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

        grouped[groupKey].forEach(function (item) {
            var sc = histStatusConfig(item.status);
            var lc = histGetLogoColor(item.nama_ekspedisi);
            var initials = histGetInitials(item.nama_ekspedisi);

            html +=
                '<tr class="hist-item-card" data-id="' + item.id + '" ' +
                'style="border-bottom:1px solid #1a1a1a; cursor:pointer; transition:background 0.12s;">' +

                // Kode + dot status
                '<td style="padding:10px 8px; vertical-align:middle;">' +
                '<div style="display:flex; align-items:center; gap:6px;">' +
                '<div style="width:8px; height:8px; border-radius:50%; background:' + sc.dot + '; flex-shrink:0;"></div>' +
                '<span style="font-size:12px; font-weight:700; color:#ccc; white-space:nowrap;">' + item.kode + '</span>' +
                '</div>' +
                '</td>' +

                // Nama ekspedisi + logo
                '<td style="padding:10px 8px; vertical-align:middle;">' +
                '<div style="display:flex; align-items:center; gap:8px;">' +
                '<div style="width:30px; height:30px; border-radius:6px; background:' + lc.bg + '; color:' + lc.text + '; ' +
                'display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0;">' + initials + '</div>' +
                '<div>' +
                '<div style="font-size:13px; font-weight:700; color:#fff;">' + item.nama_ekspedisi + '</div>' +
                '<div style="font-size:11px; color:#555; margin-top:1px;">' + item.rute + '</div>' +
                '</div>' +
                '</div>' +
                '</td>' +

                // Tgl Kirim
                '<td style="padding:10px 8px; vertical-align:middle; text-align:center;">' +
                '<span style="font-size:12px; color:#aaa;">' + histFormatTgl(item.tgl_kirim) + '</span>' +
                '</td>' +

                // Req Sampai
                '<td style="padding:10px 8px; vertical-align:middle; text-align:center;">' +
                '<span style="font-size:12px; color:#aaa;">' + histFormatTgl(item.tgl_sampai) + '</span>' +
                '</td>' +

                // Jumlah SPK
                '<td style="padding:10px 8px; vertical-align:middle; text-align:center;">' +
                '<span style="font-size:12px; color:#777;">' + item.jumlah_spk + ' SPK</span>' +
                '</td>' +

                // Status badge
                '<td style="padding:10px 10px; vertical-align:middle; text-align:center;">' +
                '<span style="font-size:11px; padding:3px 8px; border-radius:10px; background:' + sc.badge + '; color:' + sc.badgeTxt + '; font-weight:700; white-space:nowrap;">' + sc.label + '</span>' +
                '</td>' +

                '</tr>';
        });

        html += '</tbody></table></div>';
    });

    $('#hist-list').html(html);

    // Count label
    var selesai = data.filter(function (d) { return d.status === 'selesai'; }).length;
    var proses = data.filter(function (d) { return d.status === 'proses'; }).length;
    var lambat = data.filter(function (d) { return d.status === 'terlambat'; }).length;
    $('#hist-count-label').html(
        '<b style="color:#ddd;">' + data.length + '</b> data &nbsp;·&nbsp; ' +
        '<span style="color:#42a5f5;">' + selesai + ' selesai</span> · ' +
        '<span style="color:#81c784;">' + proses + ' proses</span> · ' +
        '<span style="color:#ef9a9a;">' + lambat + ' terlambat</span>'
    );

    // Bind klik item → detail
    $('.hist-item-card').off('click').on('click', function () {
        var id = parseInt($(this).data('id'));
        var item = $.grep(dataHistoryPengiriman, function (d) { return d.id === id; })[0];
        if (!item) return;
        bukaDetailHistoryPengiriman(item);
    });
}

// ── Detail sheet (level 2) ────────────────────────────────────
function bukaDetailHistoryPengiriman(item) {
    var sc = histStatusConfig(item.status);
    var lc = histGetLogoColor(item.nama_ekspedisi);
    var initials = histGetInitials(item.nama_ekspedisi);
    var delta = histDeltaHari(item.tgl_sampai, item.tgl_aktual_sampai);

    var deltaText = '';
    if (item.status === 'selesai' && delta !== null) {
        if (delta > 0) deltaText = '+' + delta + ' hari terlambat';
        else if (delta < 0) deltaText = Math.abs(delta) + ' hari lebih awal';
        else deltaText = 'Tepat waktu';
    }

    var html =
        '<div class="sheet-modal" id="hist-detail-sheet" ' +
        'style="height:auto; max-height:85vh; --f7-sheet-border-radius:14px 14px 0 0;">' +
        '<div style="overflow-y:auto; max-height:85vh; background:#141414; border-radius:14px 14px 0 0;">' +

        '<div style="display:flex; justify-content:center; padding:10px;">' +
        '<div style="width:36px; height:4px; border-radius:2px; background:#333;"></div>' +
        '</div>' +

        '<div style="display:flex; align-items:center; gap:12px; padding:8px 16px 16px;">' +
        '<div style="width:52px; height:52px; border-radius:12px; background:' + lc.bg + '; color:' + lc.text + '; ' +
        'display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; flex-shrink:0;">' +
        initials + '</div>' +
        '<div style="flex:1;">' +
        '<div style="font-size:15px; font-weight:800; color:#fff;">' + item.nama_ekspedisi + '</div>' +
        '<div style="font-size:12px; color:#777; margin-top:2px;">' + item.kode + '</div>' +
        '</div>' +
        '<span style="font-size:12px; padding:3px 10px; border-radius:12px; background:' + sc.badge + '; color:' + sc.badgeTxt + '; font-weight:700;">' + sc.label + '</span>' +
        '</div>' +

        '<div style="height:1px; background:#222; margin:0 16px;"></div>' +

        '<div style="padding:12px 16px 8px;">' +
        '<table style="width:100%; border-collapse:collapse;">' +
        '<tbody>' +
        histDetailRow('location', 'Rute', item.rute) +
        histDetailRow('calendar', 'Tgl Kirim', histFormatTgl(item.tgl_kirim)) +
        histDetailRow('clock', 'Req Sampai', histFormatTgl(item.tgl_sampai)) +
        (item.tgl_aktual_sampai ? histDetailRow('checkmark_circle', 'Tiba Aktual', histFormatTgl(item.tgl_aktual_sampai)) : '') +
        (deltaText ? histDetailRow('timer', 'Performa', deltaText) : '') +
        histDetailRow('doc_on_doc', 'Jumlah SPK', item.jumlah_spk + ' SPK') +
        histDetailRow('person', 'PIC', item.pic || '-') +
        histDetailRow('star', 'Skor Ekspedisi', item.skor) +
        histDetailRow('hourglass', 'Estimasi', item.estimasi_hari + ' hari') +
        '</tbody></table>' +
        '</div>' +

        '<div style="padding:0 16px 28px;">' +
        '<button id="hist-detail-close-btn" ' +
        'style="width:100%; padding:13px; background:#222; color:#fff; border:1px solid #333; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer;">' +
        'Tutup' +
        '</button>' +
        '</div>' +

        '</div>' +
        '</div>';

    if ($('#hist-detail-sheet').length) $('#hist-detail-sheet').remove();
    $('body').append(html);
    app.sheet.open('#hist-detail-sheet');

    $('#hist-detail-close-btn').off('click').on('click', function () {
        app.sheet.close('#hist-detail-sheet');
    });

    $(document).one('sheet:closed', '#hist-detail-sheet', function () {
        setTimeout(function () { $('#hist-detail-sheet').remove(); }, 300);
    });
}

function histDetailRow(icon, label, value) {
    return (
        '<tr style="border-bottom:1px solid #1e1e1e;">' +
        '<td style="padding:8px 6px 8px 0; width:28px; vertical-align:middle;">' +
        '<div style="width:28px; height:28px; border-radius:6px; background:#1e1e1e; display:flex; align-items:center; justify-content:center;">' +
        '<i class="f7-icons" style="font-size:14px; color:#555; pointer-events:none;">' + icon + '</i>' +
        '</div></td>' +
        '<td style="padding:8px 12px 8px 4px; font-size:12px; color:#555; letter-spacing:0.4px; text-transform:uppercase; white-space:nowrap; vertical-align:middle; width:110px;">' + label + '</td>' +
        '<td style="padding:8px 0; font-size:13px; color:#ddd; font-weight:600; vertical-align:middle; word-break:break-word;">' + value + '</td>' +
        '</tr>'
    );
}

// ── Buka popup history ────────────────────────────────────────
function bukaHistoryPengiriman() {
    histActivePeriod = 'all';
    histCustomFrom = null;
    histCustomTo = null;

    $('.poup-modal-history-pengiriman').appendTo('body');
    app.sheet.open('.poup-modal-history-pengiriman');

    // Reset UI chip
    $('#hist-search').val('');
    $('#hist-custom-range').hide();
    $('.hist-chip').css({ background: '#1e1e1e', color: '#888', 'border-color': '#333' });
    $('.hist-chip[data-period="all"]').css({ background: '#2e7d32', color: '#fff', 'border-color': '#2e7d32' });

    // Fetch pertama kali (period = 'all', tanpa filter tanggal)
    histFetchAndRender('');

    // ── Filter chips ────────────────────────────────────────────
    $(document).off('click.hist', '.hist-chip').on('click.hist', '.hist-chip', function () {
        var period = $(this).data('period');
        histActivePeriod = period;

        $('.hist-chip').css({ background: '#1e1e1e', color: '#888', 'border-color': '#333' });
        $(this).css({ background: '#2e7d32', color: '#fff', 'border-color': '#2e7d32' });

        if (period === 'custom') {
            $('#hist-custom-range').show();
            // Tunggu user isi tanggal, jangan fetch dulu
        } else {
            $('#hist-custom-range').hide();
            histCustomFrom = null;
            histCustomTo = null;
            // Fetch ulang dari BE dengan range baru
            histFetchAndRender($('#hist-search').val() || '');
        }
    });

    // ── Custom range apply ───────────────────────────────────────
    $('#hist-btn-apply-range').off('click').on('click', function () {
        histCustomFrom = $('#hist-date-from').val();
        histCustomTo = $('#hist-date-to').val();
        if (!histCustomFrom || !histCustomTo) {
            app.toast.create({ text: 'Pilih tanggal dari dan sampai.', closeTimeout: 2000 }).open();
            return;
        }
        histFetchAndRender($('#hist-search').val() || '');
    });

    // ── Search realtime (filter lokal, tidak re-fetch) ───────────
    $('#hist-search').off('input').on('input', function () {
        histRefreshList();
    });

    // ── Cleanup listener saat sheet ditutup ─────────────────────
    $(document).one('sheet:closed', '.poup-modal-history-pengiriman', function () {
        $(document).off('click.hist', '.hist-chip');
        _histIsFetching = false;
    });
}