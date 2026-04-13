// ========================================
// EKSPEDISI SELECTOR — Opsi C (List Row)
// ========================================

var selectedEkspedisiId = null;
var selectedEkspedisiData = null;

/**
 * Buka popup pilih ekspedisi.
 * Dipanggil dari tombol "Pilih Ekspedisi" di row tabel delay-go,
 * atau dari dalam popup detail alamat.
 *
 * @param {string} penjualan_id
 * @param {string} kota_asal      – ambil dari localStorage / config
 * @param {string} kota_tujuan    – dari data client_kota
 * @param {string} tgl_kirim      – YYYY-MM-DD, tanggal rencana kirim
 * @param {string} tgl_butuh      – YYYY-MM-DD, tgl_req_shipment
 * @param {number} total_berat    – berat total order (kg)
 */
function openEkspedisiSelector(penjualan_id, kota_asal, kota_tujuan, tgl_kirim, tgl_butuh, total_berat) {
    selectedEkspedisiId = null;
    selectedEkspedisiData = null;

    // simpan penjualan_id aktif ke hidden field agar bisa dipakai saat confirm
    $('#ekspedisi_target_penjualan_id').val(penjualan_id);

    // reset state UI
    $('#ekspedisi_list_rows').html('');
    $('#ekspedisi_confirm_btn').prop('disabled', true).addClass('disabled-btn');
    $('#ekspedisi_kota_label').text(kota_asal + ' → ' + kota_tujuan);
    $('#ekspedisi_tgl_label').text(
        'Kirim: ' + moment(tgl_kirim).format('DD MMM YY') +
        '  |  Butuh sampai: ' + (tgl_butuh ? moment(tgl_butuh).format('DD MMM YY') : '-')
    );

    // buka popup
    app.popup.open('.popup-ekspedisi-selector');

    // fetch rekomendasi
    loadEkspedisiRekomendasi(kota_asal, kota_tujuan, tgl_kirim, tgl_butuh, total_berat);
}

function loadEkspedisiRekomendasi(kota_asal, kota_tujuan, tgl_kirim, tgl_butuh, total_berat) {
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + '/cs/ekspedisi/get-rekomendasi-ekspedisi',
        dataType: 'JSON',
        data: {
            kota_asal: kota_asal,
            kota_tujuan: kota_tujuan,
            tgl_kirim: tgl_kirim,
            tgl_butuh_sampai: tgl_butuh || '',
            total_berat: total_berat || 1,
        },
        beforeSend: function () {
            $('#ekspedisi_list_rows').html(renderEkspedisiSkeleton());
        },
        success: function (res) {
            if (!res.data || res.data.length === 0) {
                $('#ekspedisi_list_rows').html(
                    '<div class="ekspedisi-empty">Tidak ada ekspedisi tersedia untuk rute ini.</div>'
                );
                return;
            }
            renderEkspedisiList(res.data);
        },
        error: function () {
            $('#ekspedisi_list_rows').html(
                '<div class="ekspedisi-empty" style="color:#D85A30;">Gagal memuat data ekspedisi.</div>'
            );
        }
    });
}

// ── Render list rows ──────────────────────────────────────────────
function renderEkspedisiList(list) {
    var html = '';
    list.forEach(function (item, idx) {
        var tepat = parseFloat(item.pct_tepat_waktu) || 0;
        var skor = parseFloat(item.skor_total) || 0;
        var bisaTepat = parseInt(item.bisa_tepat_waktu) === 1;
        var dotColor = bisaTepat
            ? (skor >= 70 ? '#1D9E75' : '#EF9F27')
            : '#E24B4A';
        var subColor = bisaTepat ? '' : 'color:#D85A30;';
        var subText = bisaTepat
            ? 'Skor ' + skor + ' &nbsp;·&nbsp; ' + tepat + '% tepat waktu'
            : 'Melebihi deadline &nbsp;·&nbsp; ' + tepat + '% tepat waktu';
        var rowClass = bisaTepat ? 'ekspedisi-row' : 'ekspedisi-row ekspedisi-row-late';
        var harga = parseInt(item.total_harga).toLocaleString('id-ID');
        var initials = getInitials(item.nama_expedisi);
        var logoColor = getLogoColor(idx);

        html += '<div class="' + rowClass + '" '
            + 'data-id="' + item.id_expedisi + '" '
            + 'data-nama="' + item.nama_expedisi + '" '
            + 'data-harga="' + item.total_harga + '" '
            + 'data-hari="' + item.estimasi_hari + '" '
            + 'data-skor="' + skor + '" '
            + 'onclick="pilihEkspedisiRow(this)">'

            // dot status
            + '<div class="e-dot" style="background:' + dotColor + ';"></div>'

            // logo
            + '<div class="e-logo" style="background:' + logoColor.bg + ';color:' + logoColor.text + ';">'
            + initials
            + '</div>'

            // info
            + '<div class="e-info">'
            + '<div class="e-name">' + item.nama_expedisi + '</div>'
            + '<div class="e-sub" style="' + subColor + '">' + subText + '</div>'
            + '</div>'

            // right: harga & hari
            + '<div class="e-right">'
            + '<div class="e-price">Rp ' + harga + '</div>'
            + '<div class="e-hari">' + item.estimasi_hari + ' hari</div>'
            + '</div>'

            // selected check (hidden by default)
            + '<div class="e-check">&#10003;</div>'
            + '</div>';
    });
    $('#ekspedisi_list_rows').html(html);
}

// ── Pilih row ─────────────────────────────────────────────────────
function pilihEkspedisiRow(el) {
    var $el = $(el);
    // lewati jika melebihi deadline — tetap bisa dipilih tapi dengan warning
    $('.ekspedisi-row').removeClass('ekspedisi-row-selected');
    $el.addClass('ekspedisi-row-selected');

    selectedEkspedisiId = $el.data('id');
    selectedEkspedisiData = {
        id_expedisi: $el.data('id'),
        nama_expedisi: $el.data('nama'),
        total_harga: $el.data('harga'),
        estimasi_hari: $el.data('hari'),
        skor_total: $el.data('skor'),
    };

    $('#ekspedisi_confirm_btn').prop('disabled', false).removeClass('disabled-btn');
}

// ── Confirm pilihan ───────────────────────────────────────────────
function confirmEkspedisi() {
    if (!selectedEkspedisiData) return;

    var penjualan_id = $('#ekspedisi_target_penjualan_id').val();

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + '/cs/ekspedisi/set-ekspedisi-penjualan',
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id,
            id_expedisi: selectedEkspedisiData.id_expedisi,
            total_harga: selectedEkspedisiData.total_harga,
        },
        beforeSend: function () {
            app.dialog.preloader('Menyimpan...');
        },
        success: function (res) {
            app.dialog.close();
            if (res.status === 'success') {
                app.popup.close('.popup-ekspedisi-selector');
                app.dialog.alert('Ekspedisi berhasil dipilih: ' + selectedEkspedisiData.nama_expedisi);
                getViewDelayManagerShipment();   // refresh tabel utama
            } else {
                app.dialog.alert('Gagal menyimpan ekspedisi.');
            }
        },
        error: function () {
            app.dialog.close();
            app.dialog.alert('Terjadi kesalahan jaringan.');
        }
    });
}

// ── Helpers ───────────────────────────────────────────────────────
function getInitials(nama) {
    if (!nama) return '??';
    var parts = nama.trim().split(/\s+/);
    if (parts.length === 1) return nama.substring(0, 3).toUpperCase();
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
function getLogoColor(idx) {
    return _logoColors[idx % _logoColors.length];
}

function renderEkspedisiSkeleton() {
    var html = '';
    for (var i = 0; i < 3; i++) {
        html += '<div class="ekspedisi-row ekspedisi-skeleton">'
            + '<div class="e-dot" style="background:#ccc;"></div>'
            + '<div class="e-logo" style="background:#eee;color:#eee;">--</div>'
            + '<div class="e-info">'
            + '<div class="skel-line" style="width:60%;"></div>'
            + '<div class="skel-line" style="width:80%;margin-top:5px;"></div>'
            + '</div>'
            + '<div class="e-right">'
            + '<div class="skel-line" style="width:60px;"></div>'
            + '<div class="skel-line" style="width:30px;margin-top:5px;"></div>'
            + '</div>'
            + '</div>';
    }
    return html;
}