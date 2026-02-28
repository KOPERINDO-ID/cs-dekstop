// ============================================================
// Store sementara data client — di-index by client_id
// Menghindari karakter berbahaya (apostrof/kutip) di onclick
// ============================================================
var clientDataStore = {};

// ============================================================
// LOAD DATA CLIENT (tabel utama)
// ============================================================
function getDataClientHead() {
    var perusahaan_broadcast_value = (jQuery('#perusahaan_broadcast_head').val() || '') || 'empty';
    var client_kota = (jQuery('#filter_kota_broadcast_head').val() || '') || 'empty';

    var year_now = new Date().getFullYear();
    var selectedYear = jQuery('#client_penjualan_years_head option:selected').val();
    var year = (!selectedYear) ? year_now
        : (selectedYear === 'all') ? 'empty'
            : selectedYear;

    var month_now = new Date().getMonth() + 1;
    var selectedMonth = jQuery('#client_penjualan_bulan_head option:selected').val();
    var month = (!selectedMonth) ? month_now
        : (selectedMonth === 'all') ? 'empty'
            : selectedMonth;

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-data-client-new-head-dm",
        dataType: 'JSON',
        data: {
            perusahaan_broadcast_value: perusahaan_broadcast_value,
            client_kota: client_kota,
            user_id: localStorage.getItem("user_id"),
            year: year,
            month: month,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();

            // Reset store setiap reload
            clientDataStore = {};

            if (data.data.length !== 0) {
                var no = 0;
                var rows = '';

                jQuery.each(data.data, function (i, val) {
                    var kota = cleanText(val.client_kota);
                    no++;

                    // Status client berdasarkan bulan_selisih
                    var status_client;
                    if (val.bulan_selisih == 0 || val.bulan_selisih == null) {
                        status_client = 'new';
                    } else if (val.bulan_selisih > 2) {
                        status_client = 'non_aktif';
                    } else {
                        status_client = 'aktif';
                    }

                    // Warna row berdasarkan status broadcast log
                    var warna_status = '';
                    var log = data.client_log[val.client_id];
                    if (log) {
                        if (log.status_broadcast === 'F' || log.status_broadcast === 'A' || log.status_broadcast == null) {
                            warna_status = 'card-color-red';
                        } else if (log.status_broadcast === 'S') {
                            warna_status = 'btn-color-greenWhite';
                        } else if (log.status_broadcast === 'D' || log.status_broadcast === 'R') {
                            warna_status = 'btn-color-blueWhite';
                        }
                    }

                    // Simpan data lengkap ke store — tombol hanya kirim client_id
                    clientDataStore[val.client_id] = {
                        client_id: val.client_id,
                        client_nama: val.client_nama || '',
                        client_cp: val.client_cp || '',
                        client_kota: val.client_kota || '',
                        client_cp_posisi: val.client_cp_posisi || '',
                        client_telp: val.client_telp || '',
                        client_alamat: val.client_alamat || '',
                    };

                    rows += '<tr class="' + warna_status + '">';
                    rows += '  <td align="center" class="label-cell" style="border-left:1px solid grey;border-bottom:1px solid grey;">' + no + '</td>';
                    rows += '  <td align="left" class="label-cell" style="border-left:1px solid grey;border-bottom:1px solid grey;">'
                        + val.client_nama
                        + '<input type="hidden" id="status_check_client_' + no + '" name="status_check_client_' + no + '" value="' + status_client + '" readonly>'
                        + '</td>';
                    rows += '  <td align="left" class="label-cell" style="border-left:1px solid grey;border-bottom:1px solid grey;">' + kota + '</td>';
                    rows += '  <td style="border-left:1px solid grey;border-right:1px solid grey;border-bottom:1px solid grey;text-align:center;">';
                    rows += '    <center><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" onclick="openClientDetail(' + val.client_id + ')" style="width:100px;">Details</a></center>';
                    rows += '  </td>';
                    rows += '</tr>';
                });

                jQuery("#tabel_data_client_head").html(rows);
                jQuery("#total-client-broadcast-head").html(no);
            } else {
                jQuery("#tabel_data_client_head").html('<tr><td colspan="4" align="center">Tidak Ada Data</td></tr>');
                jQuery("#total-client-broadcast-head").html('0');
            }
        },
        error: function () {
            app.dialog.close();
            app.dialog.error("GAGAL");
        }
    });
}

// ============================================================
// DETAIL CLIENT — isi field popup lalu buka popup
// ============================================================
function openClientDetail(client_id) {
    var d = clientDataStore[client_id];
    if (!d) return;

    // Set semua field terlebih dahulu
    $$("#edit_client_id_broadcast_head").val(d.client_id);
    $$("#edit_client_nama_broadcast_head").val(d.client_nama);
    $$("#edit_client_cp_broadcast_head").val(d.client_cp);
    $$("#edit_kota_broadcast_head").val(d.client_kota);
    $$("#edit_client_posisi_broadcast_head").val(d.client_cp_posisi);
    $$("#edit_client_telp_broadcast_head").val(d.client_telp);
    $$("#edit_client_alamat_broadcast_head").val(d.client_alamat);

    // Baru buka popup — tidak ada race condition
    app.popup.open('.data-client-head-popup');
}

// ============================================================
// TAMBAH CLIENT — reset form lalu buka popup
// ============================================================
function tambahDataClient() {
    $$("#tambah_client_nama_broadcast").val('');
    $$("#tambah_client_cp_broadcast").val('');
    $$("#tambah_cp_posisi_broadcast").val('');
    $$("#tambah_client_telp_broadcast").val('');
    $$("#tambah_client_alamat_broadcast").val('');
    $$("#show_table_client").hide();
    selectBoxKotaBrodacast();
    $$("#tambah_kota_broadcast_display").val('');
    $$("#tambah_kota_broadcast").val('');
}

// ============================================================
// SIMPAN CLIENT BARU
// ============================================================
function simpanClientBroadcast() {
    if (localStorage.getItem("internet_koneksi") === 'fail') {
        app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal, Internet Tidak Stabil. Box Koneksi Harus Berwarna Hijau');
        return;
    }

    if (!$$('#form_tambah_client_broadcast')[0].checkValidity()) {
        app.dialog.alert('Cek Isian Anda');
        return;
    }

    var formData = new FormData(jQuery("#form_tambah_client_broadcast")[0]);
    formData.append('user_id', localStorage.getItem("user_id"));
    formData.append('user_record', localStorage.getItem("karyawan_nama"));
    formData.append('client_kota', $$('#tambah_kota_broadcast_display').val());

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/simpan-client-broadcast",
        dataType: "JSON",
        data: formData,
        timeout: 7000,
        contentType: false,
        processData: false,
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            $$('.clear_tambah_client_broadcast').val('');
            app.popup.close();
            getDataClientHead();
        },
        error: function () {
            app.dialog.close();
            app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
            app.popup.close();
            getDataClientHead();
        }
    });
}

// ============================================================
// LOAD DATA KOTA — simpan ke global, isi juga filter tabel utama
// ============================================================
var kotaList = [];
var currentKotaMode = '';

function selectBoxKotaBrodacast() {
    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-kota-broadcast",
        dataType: "JSON",
        success: function (data) {
            kotaList = data.data || [];

            // Isi filter kota di tabel utama (native select)
            var optionsFilter = '<option value="">Semua Kota</option>';
            jQuery.each(kotaList, function (i, val) {
                optionsFilter += '<option value="' + val.id_kota + '">' + val.nama_kota + '</option>';
            });
            $$('#filter_kota_broadcast_head').html(optionsFilter);
        }
    });
}

// ============================================================
// POPUP PILIH KOTA — buka, render, filter, pilih
// ============================================================
function openPilihKotaPopup(mode) {
    currentKotaMode = mode;
    var searchInput = document.getElementById('search-kota-input');
    if (searchInput) searchInput.value = '';
    renderKotaList(kotaList);
    app.popup.open('.popup-pilih-kota');
}

function renderKotaList(dataKota) {
    var listContainer = document.getElementById('kota-list-items');
    if (!listContainer) return;
    var html = '';
    if (!dataKota || dataKota.length === 0) {
        html = '<li><div class="item-content"><div class="item-inner">' +
            '<div class="item-title" style="color:#888;">Tidak ada data kota</div>' +
            '</div></div></li>';
    } else {
        jQuery.each(dataKota, function (i, kota) {
            html += '<li>' +
                '<a href="#" class="item-link item-content" onclick="selectKota(\'' + kota.id_kota + '\', \'' + escapeKotaString(kota.nama_kota) + '\')">' +
                '<div class="item-inner">' +
                '<div class="item-title">' + kota.nama_kota + '</div>' +
                '</div></a></li>';
        });
    }
    listContainer.innerHTML = html;
}

function filterKotaList() {
    var searchInput = document.getElementById('search-kota-input');
    var searchValue = searchInput ? searchInput.value.toLowerCase() : '';
    if (!searchValue) {
        renderKotaList(kotaList);
        return;
    }
    var filtered = kotaList.filter(function (kota) {
        return kota.nama_kota.toLowerCase().indexOf(searchValue) !== -1;
    });
    renderKotaList(filtered);
}

function selectKota(kotaId, kotaNama) {
    if (currentKotaMode === 'tambah_client') {
        $$('#tambah_kota_broadcast_display').val(kotaNama);
        $$('#tambah_kota_broadcast').val(kotaId);
    }
    app.popup.close('.popup-pilih-kota');
}

function escapeKotaString(str) {
    return str ? str.replace(/\\/g, '\\\\').replace(/'/g, "\\'") : '';
}


// ============================================================
// SEARCH CLIENT SAAT MENGETIK NAMA (cek duplikat)
// ============================================================
var delayTimer;
function doSearchByClientInfo() {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(function () {
        getClientInfo();
    }, 1000);
}

function getClientInfo() {
    var client_name = jQuery('#tambah_client_nama_broadcast').val() || '';

    if (client_name === '') {
        $$("#show_table_client").hide();
        return;
    }

    $$("#show_table_client").show();

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-client-info",
        dataType: 'JSON',
        data: { client_name: client_name },
        success: function (data) {
            if (data.data.length !== 0) {
                var no = 0;
                var rows = '';
                jQuery.each(data.data, function (i, val) {
                    no++;
                    rows += '<tr>';
                    rows += '  <td align="center" style="border-left:1px solid grey;border-bottom:1px solid grey;" class="label-cell">' + no + '</td>';
                    rows += '  <td align="left"   style="border-left:1px solid grey;border-bottom:1px solid grey;" class="label-cell">' + val.client_nama + '</td>';
                    rows += '  <td align="left"   style="border-left:1px solid grey;border-bottom:1px solid grey;" class="label-cell">' + val.client_cp + '</td>';
                    rows += '  <td align="left"   style="border-left:1px solid grey;border-bottom:1px solid grey;" class="label-cell">' + val.client_telp + '</td>';
                    rows += '  <td align="center" style="border-left:1px solid grey;border-right:1px solid grey;border-bottom:1px solid grey;" class="label-cell">' + val.client_kota + '</td>';
                    rows += '</tr>';
                });
                jQuery("#tabel_data_show_client").html(rows);
            } else {
                jQuery("#tabel_data_show_client").html('<tr><td colspan="5" align="center">Tidak Ada Data</td></tr>');
                $$("#show_table_client").hide();
            }
        }
    });
}

// ============================================================
// SEARCH PERUSAHAAN DI TABEL UTAMA (dengan debounce)
// ============================================================
var delayTimerPerusahaan;
function doSearchByPerusahaan() {
    clearTimeout(delayTimerPerusahaan);
    delayTimerPerusahaan = setTimeout(function () {
        getDataClientHead();
    }, 1000);
}

// ============================================================
// RELOAD TABEL UTAMA
// ============================================================
function reloadData() {
    getDataClientHead();
}