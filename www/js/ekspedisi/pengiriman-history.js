// ============================================================
//  popup-history-pengiriman.js
//  History Pengiriman — Sheet Modal
//  Pola: Framework7 v7 + jQuery ($$ = F7, $ = jQuery)
// ============================================================

// ── Mock data history — ganti dengan fetch API nyata ─────────
// Status: 'selesai' | 'proses' | 'terlambat'
var dataHistoryPengiriman = [
    {
        id: 1, kode: 'SHIP-0126-001',
        nama_ekspedisi: 'PT MULYAGUNA', pic: 'SUPRIADI',
        rute: 'SIDOARJO → JAKARTA TIMUR',
        tgl_kirim: '2026-01-10', tgl_sampai: '2026-01-14',
        tgl_aktual_sampai: '2026-01-14',
        skor: 88, estimasi_hari: 4,
        jumlah_spk: 3, status: 'selesai'
    },
    {
        id: 2, kode: 'SHIP-0126-002',
        nama_ekspedisi: 'CV CEPAT SAMPAI', pic: 'BUDI',
        rute: 'SIDOARJO → JAKARTA PUSAT',
        tgl_kirim: '2026-01-15', tgl_sampai: '2026-01-18',
        tgl_aktual_sampai: '2026-01-20',
        skor: 91, estimasi_hari: 3,
        jumlah_spk: 2, status: 'terlambat'
    },
    {
        id: 3, kode: 'SHIP-0226-003',
        nama_ekspedisi: 'PT JAYA LOGISTIK', pic: 'SUPRIADI',
        rute: 'SIDOARJO → JAKARTA TIMUR',
        tgl_kirim: '2026-02-11', tgl_sampai: '2026-03-08',
        tgl_aktual_sampai: null,
        skor: 74, estimasi_hari: 25,
        jumlah_spk: 5, status: 'proses'
    },
    {
        id: 4, kode: 'SHIP-0226-004',
        nama_ekspedisi: 'PT MULYAGUNA', pic: 'HENDRA',
        rute: 'SIDOARJO → BANDUNG',
        tgl_kirim: '2026-02-18', tgl_sampai: '2026-02-22',
        tgl_aktual_sampai: '2026-02-22',
        skor: 85, estimasi_hari: 4,
        jumlah_spk: 1, status: 'selesai'
    },
    {
        id: 5, kode: 'SHIP-0326-005',
        nama_ekspedisi: 'PT KARGO NUSANTARA', pic: '-',
        rute: 'SIDOARJO → SURABAYA',
        tgl_kirim: '2026-03-01', tgl_sampai: '2026-03-04',
        tgl_aktual_sampai: '2026-03-03',
        skor: 55, estimasi_hari: 3,
        jumlah_spk: 2, status: 'selesai'
    },
    {
        id: 6, kode: 'SHIP-0326-006',
        nama_ekspedisi: 'CV CEPAT SAMPAI', pic: 'BUDI',
        rute: 'SIDOARJO → JAKARTA TIMUR',
        tgl_kirim: '2026-03-15', tgl_sampai: '2026-04-10',
        tgl_aktual_sampai: null,
        skor: 91, estimasi_hari: 26,
        jumlah_spk: 4, status: 'proses'
    },
];

// ── State ─────────────────────────────────────────────────────
var histActivePeriod = 'all';
var histCustomFrom = null;
var histCustomTo = null;

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

function histStatusConfig(status) {
    if (status === 'selesai') return { dot: '#1D9E75', badge: '#0d3b2b', badgeTxt: '#1D9E75', label: 'Selesai' };
    if (status === 'terlambat') return { dot: '#E24B4A', badge: '#3b0d0d', badgeTxt: '#E24B4A', label: 'Terlambat' };
    return { dot: '#EF9F27', badge: '#3b2d0d', badgeTxt: '#EF9F27', label: 'Dalam Proses' };
}

// Hitung selisih hari (aktual vs deadline) — positif = terlambat
function histDeltaHari(tglSampai, tglAktual) {
    if (!tglSampai || !tglAktual) return null;
    var a = new Date(tglAktual), b = new Date(tglSampai);
    return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

// ── Filter data ───────────────────────────────────────────────
function histFilterData(keyword, period, fromDate, toDate) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var q = (keyword || '').toLowerCase();

    return dataHistoryPengiriman.filter(function (item) {
        // Keyword filter
        if (q && (
            item.kode.toLowerCase().indexOf(q) === -1 &&
            item.nama_ekspedisi.toLowerCase().indexOf(q) === -1 &&
            item.rute.toLowerCase().indexOf(q) === -1
        )) return false;

        // Period filter
        var tglKirim = new Date(item.tgl_kirim);
        if (period === 'thismonth') {
            if (tglKirim.getMonth() !== today.getMonth() || tglKirim.getFullYear() !== today.getFullYear()) return false;
        } else if (period === 'lastmonth') {
            var lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            var lmEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            if (tglKirim < lm || tglKirim > lmEnd) return false;
        } else if (period === '3month') {
            var threeAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
            if (tglKirim < threeAgo) return false;
        } else if (period === 'custom' && fromDate && toDate) {
            var f = new Date(fromDate), t = new Date(toDate);
            if (tglKirim < f || tglKirim > t) return false;
        }

        return true;
    });
}

// ── Render list ───────────────────────────────────────────────
function histRenderList(data) {
    if (!data || data.length === 0) {
        $('#hist-list').html(
            '<div style="text-align:center; padding:48px 20px; color:#444;">' +
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
        html += '<div style="display:flex; align-items:center; gap:8px; padding:14px 2px 8px;">' +
            '<div style="font-size:11px; font-weight:800; color:#555; letter-spacing:1px; text-transform:uppercase;">' + groupKey + '</div>' +
            '<div style="flex:1; height:1px; background:#222;"></div>' +
            '<div style="font-size:10px; color:#444;">' + grouped[groupKey].length + ' pengiriman</div>' +
            '</div>';

        grouped[groupKey].forEach(function (item) {
            var sc = histStatusConfig(item.status);
            var lc = histGetLogoColor(item.nama_ekspedisi);
            var initials = histGetInitials(item.nama_ekspedisi);
            var delta = histDeltaHari(item.tgl_sampai, item.tgl_aktual_sampai);
            var deltaHtml = '';
            if (item.status === 'selesai') {
                if (delta === null) deltaHtml = '';
                else if (delta > 0) deltaHtml = '<span style="font-size:10px; color:#E24B4A; margin-left:6px;">+' + delta + ' hari terlambat</span>';
                else if (delta < 0) deltaHtml = '<span style="font-size:10px; color:#1D9E75; margin-left:6px;">' + Math.abs(delta) + ' hari lebih awal</span>';
                else deltaHtml = '<span style="font-size:10px; color:#1D9E75; margin-left:6px;">tepat waktu</span>';
            } else if (item.status === 'proses') {
                var today2 = new Date(); today2.setHours(0, 0, 0, 0);
                var deadline = new Date(item.tgl_sampai);
                var sisa = Math.round((deadline - today2) / (1000 * 60 * 60 * 24));
                if (sisa < 0) deltaHtml = '<span style="font-size:10px; color:#E24B4A; margin-left:6px;">lewat ' + Math.abs(sisa) + ' hari</span>';
                else if (sisa === 0) deltaHtml = '<span style="font-size:10px; color:#EF9F27; margin-left:6px;">jatuh tempo hari ini</span>';
                else deltaHtml = '<span style="font-size:10px; color:#EF9F27; margin-left:6px;">sisa ' + sisa + ' hari</span>';
            }

            html +=
                '<div class="hist-item-card" data-id="' + item.id + '" ' +
                'style="display:flex; align-items:flex-start; gap:10px; padding:12px 10px; ' +
                'background:#1a1a1a; border-radius:10px; margin-bottom:8px; cursor:pointer; ' +
                'border:1px solid #252525; transition:background 0.15s;">' +

                // Status dot + logo stack
                '<div style="position:relative; flex-shrink:0; width:42px;">' +
                '<div style="width:42px; height:42px; border-radius:10px; background:' + lc.bg + '; color:' + lc.text + '; ' +
                'display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800;">' +
                initials + '</div>' +
                '<div style="position:absolute; bottom:-2px; right:-2px; width:12px; height:12px; border-radius:50%; ' +
                'background:' + sc.dot + '; border:2px solid #1a1a1a;"></div>' +
                '</div>' +

                // Info utama
                '<div style="flex:1; min-width:0;">' +

                // Baris 1: kode + badge status
                '<div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:2px;">' +
                '<span style="font-size:12px; font-weight:800; color:#e0e0e0; letter-spacing:0.3px;">' + item.kode + '</span>' +
                '<span style="font-size:10px; padding:1px 7px; border-radius:10px; background:' + sc.badge + '; color:' + sc.badgeTxt + '; font-weight:700;">' + sc.label + '</span>' +
                deltaHtml +
                '</div>' +

                // Baris 2: nama ekspedisi
                '<div style="font-size:13px; font-weight:700; color:#fff; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' +
                item.nama_ekspedisi + '</div>' +

                // Baris 3: rute
                '<div style="font-size:11px; color:#777; display:flex; align-items:center; gap:4px; margin-bottom:6px;">' +
                '<i class="f7-icons" style="font-size:11px; color:#555; pointer-events:none;">location</i>' +
                item.rute +
                '</div>' +

                // Baris 4: metadata chips
                '<div style="display:flex; flex-wrap:wrap; gap:5px;">' +

                // Tgl kirim
                '<span style="font-size:10px; padding:2px 7px; background:#252525; border:1px solid #333; border-radius:4px; color:#999;">' +
                '<span style="color:#666;">Kirim</span> ' + histFormatTgl(item.tgl_kirim) + '</span>' +

                // Tgl sampai / aktual
                (item.status === 'selesai' && item.tgl_aktual_sampai
                    ? '<span style="font-size:10px; padding:2px 7px; background:#0d3b2b; border:1px solid #1D9E75; border-radius:4px; color:#1D9E75;">' +
                    '<span style="color:#0a6645;">Tiba</span> ' + histFormatTgl(item.tgl_aktual_sampai) + '</span>'
                    : '<span style="font-size:10px; padding:2px 7px; background:#252525; border:1px solid #333; border-radius:4px; color:#999;">' +
                    '<span style="color:#666;">Req</span> ' + histFormatTgl(item.tgl_sampai) + '</span>') +

                // Jumlah SPK
                '<span style="font-size:10px; padding:2px 7px; background:#1e2a1e; border:1px solid #2e4a2e; border-radius:4px; color:#6abf6a;">' +
                item.jumlah_spk + ' SPK</span>' +

                // Estimasi hari
                '<span style="font-size:10px; padding:2px 7px; background:#1e1e2a; border:1px solid #333; border-radius:4px; color:#7a7abf;">' +
                item.estimasi_hari + ' hari</span>' +

                '</div>' + // end chips
                '</div>' + // end info

                // Kanan: skor
                '<div style="flex-shrink:0; text-align:center; min-width:36px;">' +
                '<div style="font-size:16px; font-weight:900; color:' + (item.skor >= 80 ? '#1D9E75' : item.skor >= 60 ? '#EF9F27' : '#E24B4A') + ';">' + item.skor + '</div>' +
                '<div style="font-size:9px; color:#555; letter-spacing:0.5px;">SKOR</div>' +
                '</div>' +

                '</div>'; // end card
        });
    });

    $('#hist-list').html(html);

    // Count label
    var selesai = data.filter(function (d) { return d.status === 'selesai'; }).length;
    var proses = data.filter(function (d) { return d.status === 'proses'; }).length;
    var lambat = data.filter(function (d) { return d.status === 'terlambat'; }).length;
    $('#hist-count-label').html(
        '<b style="color:#ddd;">' + data.length + '</b> data &nbsp;·&nbsp; ' +
        '<span style="color:#1D9E75;">' + selesai + ' selesai</span> · ' +
        '<span style="color:#EF9F27;">' + proses + ' proses</span> · ' +
        '<span style="color:#E24B4A;">' + lambat + ' terlambat</span>'
    );

    // Bind klik item → buka detail
    $('.hist-item-card').off('click').on('click', function () {
        var id = parseInt($(this).data('id'));
        var item = $.grep(dataHistoryPengiriman, function (d) { return d.id === id; })[0];
        if (!item) return;
        bukaDetailHistoryPengiriman(item);
    });
}

// ── Refresh helper ────────────────────────────────────────────
function histRefreshList() {
    var keyword = $('#hist-search').val() || '';
    var from = histCustomFrom, to = histCustomTo;
    var filtered = histFilterData(keyword, histActivePeriod, from, to);
    histRenderList(filtered);
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

        // Handle bar
        '<div style="display:flex; justify-content:center; padding:10px;">' +
        '<div style="width:36px; height:4px; border-radius:2px; background:#333;"></div>' +
        '</div>' +

        // Header ekspedisi
        '<div style="display:flex; align-items:center; gap:12px; padding:8px 16px 16px;">' +
        '<div style="width:52px; height:52px; border-radius:12px; background:' + lc.bg + '; color:' + lc.text + '; ' +
        'display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; flex-shrink:0;">' +
        initials + '</div>' +
        '<div style="flex:1;">' +
        '<div style="font-size:15px; font-weight:800; color:#fff;">' + item.nama_ekspedisi + '</div>' +
        '<div style="font-size:12px; color:#777; margin-top:2px;">' + item.kode + '</div>' +
        '</div>' +
        '<span style="font-size:11px; padding:3px 10px; border-radius:12px; background:' + sc.badge + '; color:' + sc.badgeTxt + '; font-weight:700;">' + sc.label + '</span>' +
        '</div>' +

        // Divider
        '<div style="height:1px; background:#222; margin:0 16px;"></div>' +

        // Info rows
        '<div style="padding:16px;">' +
        histDetailRow('location', 'Rute', item.rute) +
        histDetailRow('calendar', 'Tgl Kirim', histFormatTgl(item.tgl_kirim)) +
        histDetailRow('clock', 'Req Sampai', histFormatTgl(item.tgl_sampai)) +
        (item.tgl_aktual_sampai ? histDetailRow('checkmark_circle', 'Tiba Aktual', histFormatTgl(item.tgl_aktual_sampai)) : '') +
        (deltaText ? histDetailRow('timer', 'Performa', deltaText) : '') +
        histDetailRow('doc_on_doc', 'Jumlah SPK', item.jumlah_spk + ' SPK') +
        histDetailRow('person', 'PIC', item.pic || '-') +
        histDetailRow('star', 'Skor Ekspedisi', item.skor) +
        histDetailRow('hourglass', 'Estimasi', item.estimasi_hari + ' hari') +
        '</div>' +

        // Close button
        '<div style="padding:0 16px 28px;">' +
        '<button id="hist-detail-close-btn" ' +
        'style="width:100%; padding:13px; background:#222; color:#fff; border:1px solid #333; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer;">' +
        'Tutup' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>';

    // Inject & open
    if ($('#hist-detail-sheet').length) $('#hist-detail-sheet').remove();
    $('body').append(html);
    app.sheet.open('#hist-detail-sheet');

    $('#hist-detail-close-btn').off('click').on('click', function () {
        app.sheet.close('#hist-detail-sheet');
    });

    // Cleanup DOM setelah tutup
    $(document).one('sheet:closed', '#hist-detail-sheet', function () {
        setTimeout(function () { $('#hist-detail-sheet').remove(); }, 300);
    });
}

function histDetailRow(icon, label, value) {
    return '<div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:14px;">' +
        '<i class="f7-icons" style="font-size:16px; color:#555; flex-shrink:0; margin-top:1px; pointer-events:none;">' + icon + '</i>' +
        '<div style="flex:1;">' +
        '<div style="font-size:10px; color:#555; letter-spacing:0.5px; margin-bottom:1px;">' + label.toUpperCase() + '</div>' +
        '<div style="font-size:13px; color:#ddd; font-weight:600;">' + value + '</div>' +
        '</div>' +
        '</div>';
}

// ── Buka popup history ────────────────────────────────────────
function bukaHistoryPengiriman() {
    histActivePeriod = 'all';
    histCustomFrom = null;
    histCustomTo = null;

    // Pindah ke body (sama seperti popup lain)
    $('.poup-modal-history-pengiriman').appendTo('body');
    app.sheet.open('.poup-modal-history-pengiriman');

    // Reset UI
    $('#hist-search').val('');
    $('#hist-custom-range').hide();
    $('.hist-chip').css({ background: '#1e1e1e', color: '#888', 'border-color': '#333' });
    $('.hist-chip[data-period="all"]').css({ background: '#2e7d32', color: '#fff', 'border-color': '#2e7d32' });

    histRefreshList();

    // ── Bind events (off() dulu agar tidak dobel) ──

    // Filter chips
    $(document).off('click.hist', '.hist-chip').on('click.hist', '.hist-chip', function () {
        var period = $(this).data('period');
        histActivePeriod = period;
        $('.hist-chip').css({ background: '#1e1e1e', color: '#888', 'border-color': '#333' });
        $(this).css({ background: '#2e7d32', color: '#fff', 'border-color': '#2e7d32' });

        if (period === 'custom') {
            $('#hist-custom-range').show();
        } else {
            $('#hist-custom-range').hide();
            histCustomFrom = null;
            histCustomTo = null;
            histRefreshList();
        }
    });

    // Custom range apply
    $('#hist-btn-apply-range').off('click').on('click', function () {
        histCustomFrom = $('#hist-date-from').val();
        histCustomTo = $('#hist-date-to').val();
        if (!histCustomFrom || !histCustomTo) {
            app.toast.create({ text: 'Pilih tanggal dari dan sampai.', closeTimeout: 2000 }).open();
            return;
        }
        histRefreshList();
    });

    // Search realtime
    $('#hist-search').off('input').on('input', function () {
        histRefreshList();
    });

    // Cleanup listener saat sheet ditutup
    $(document).one('sheet:closed', '.poup-modal-history-pengiriman', function () {
        $(document).off('click.hist', '.hist-chip');
    });
}