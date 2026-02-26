function getViewDelayManagerShipment() {

    var penjualan_value = "";

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-status-delay-shipment",
        dataType: 'JSON',
        data: {
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            no = 1;
            var no_row = 0;
            $.each(data.data.data, function (i, item) {
                no_row++
                var no_transaksi = moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

                if (item.tgl_req_shipment != null) {
                    var tgl_req_kirim = moment(item.tgl_req_shipment).format('DD-MMM-YY');
                } else {
                    var tgl_req_kirim = '-';
                }

                if (item.alamat_kirim_penjualan != null) {
                    var alamat_kirim_penjualan = item.alamat_kirim_penjualan;
                } else {
                    var alamat_kirim_penjualan = '-';
                }

                moment.locale('id');
                let hari = moment(item.penjualan_tanggal_kirim).format('dddd');

                penjualan_value += '<tr>';
                penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
                penjualan_value += '  <td style="border-bottom:1px solid gray;"><center><b>' + no_transaksi + '</b></center></td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_kota + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + hari + '</td>';
                penjualan_value += '<td style="border-right:1px solid gray;border-bottom:1px solid gray;" class="tgl-kirim-cell-' + no_row + '"><center>' +
                    '<input type="text" ' +
                    'id="edit-tanggal-kirim-shipment-' + no + '" ' +
                    'name="edit-tanggal-kirim-shipment-' + no + '" ' +
                    'value="' + moment(item.penjualan_tanggal_kirim).format('DD-MMM-YYYY') + '" ' +
                    'onfocus="focusTanggalKirim(this)" ' +
                    'onblur="blurTanggalKirim(this,\'' + item.penjualan_id + '\',\'' + no_row + '\')" ' +
                    'class="form-control" style="text-align:center;">' +
                    '</center></td>';
                penjualan_value += '<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + tgl_req_kirim + '</center></td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_telp + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + alamat_kirim_penjualan + '</td>';

                penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".input-alamat-kirim-delay" onclick="shipmentNotifDelay(\'' + item.penjualan_id + '\');">Detail</button>';
                penjualan_value += '</td>';
                penjualan_value += '</tr>';
            });

            app.dialog.close();
            jQuery('#data_status_notif_delay_go').html(penjualan_value);
            jQuery('#count_notif_delay_go').text(no_row);

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function focusTanggalKirim(el) {
    // convert dari dd-MMM-yyyy -> yyyy-mm-dd
    let val = el.value.trim();
    if (val !== "") {
        let iso = moment(val, "DD-MMM-YYYY").format("YYYY-MM-DD");
        el.type = "date";  // ubah jadi input date
        el.value = iso;
    } else {
        el.type = "date";
    }
}

function blurTanggalKirim(el, penjualan_id, row) {
    let val = el.value.trim();
    let display = "";
    let iso = "";

    if (val !== "") {
        // dari yyyy-mm-dd → dd-MMM-yyyy
        display = moment(val, "YYYY-MM-DD").format("DD-MMM-YYYY");
        iso = moment(val, "YYYY-MM-DD").format("YYYY-MM-DD");
    }

    // kembalikan type text agar tampil custom format
    el.type = "text";
    el.value = display;

    // jalankan function update tanggal
    editTanggalKirimShipment(penjualan_id, row, iso);
}

function changeDateShipment(tgl, no, penjualan_id) {
    const currentVal = tgl;
    const $input = $('<input type="date" class="tgl-kirim-input" id="edit-tanggal-kirim-shipment-' + no + '" name="edit-tanggal-kirim-shipment-' + no + '" onchange="editTanggalKirimShipment(\'' + no + '\',\'' + penjualan_id + '\');" value="' + currentVal + '" />');
    jQuery('.tgl-kirim-cell-' + no).html($input);
}

function editTanggalKirimShipment(id, no, date) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/update-tanggal-kirim-shipment-cs",
        dataType: 'JSON',
        data: {
            tanggal_kirim: date,
            penjualan_id: id,
            no: no
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            if (data.status == 'success') {
                app.dialog.alert('Berhasil Update Data');
                app.dialog.close();
                getViewDelayManagerShipment();
            } else if (data.status == 'failed') {
                app.dialog.alert('Gagal Update Data');
                app.dialog.close();
                getViewDelayManagerShipment();
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}


function shipmentNotifDelay(penjualan_id) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-Alamat",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $("#input_alamat_kirim_delay_popup")[0].reset();
        },
        success: function (data) {
            app.dialog.close();
            var alamat_client = "";
            var alamat_kirim = "";
            var client_nama = "";
            var hp_alamat = "";
            var client_kota = "";
            var tgl_kirim_cabang = "";
            var tgl_req_kirim_cabang = "";
            var keterangan_cabang = "";
            var packing = "";
            if (data.data != null) {
                alamat_client = data.data.client_alamat;
                alamat_kirim = data.data.alamat_kirim_penjualan;
                client_nama = data.data.client_nama;
                hp_alamat = data.data.client_telp;
                client_kota = data.data.client_kota;
                if (data.data.tgl_kirim_cabang != null) {
                    tgl_kirim_cabang = moment(data.data.tgl_kirim_cabang).format('YYYY-MM-DD');
                } else {
                    tgl_kirim_cabang = '';
                }
                if (data.data.tgl_req_shipment != null) {
                    tgl_req_kirim_cabang = moment(data.data.tgl_req_shipment).format('YYYY-MM-DD');
                } else {
                    tgl_req_kirim_cabang = '';
                }
                keterangan_cabang = data.data.keterangan_cabang;
                packing = toSentenceCase(data.data.packing);
            } else {
                alamat_client = '-';
                alamat_kirim = '-';
                client_nama = '-';
                hp_alamat = '-';
                client_kota = '-';
                tgl_kirim_cabang = '';
                tgl_req_kirim_cabang = '';
                keterangan_cabang = '';
                packing = 'Polos';
            }

            $$('#alamat_sekarang_delay_popup').val(alamat_client);
            $$('#alamat_kirim_delay_popup').val(alamat_kirim);
            $$('#kota_kirim_delay_popup').val(client_kota);
            $$('#nama-client-alamat-delay').html(client_nama);
            $$('#packing_notif_alamat').val(packing);
            if (data.data.foto_produksi_selesai != null) {
                jQuery('#file_foto_produksi_selesai_delay_view').attr('src', BASE_PATH_IMAGE_BUKTI_PRODUKSI + '/' + data.data.foto_produksi_selesai);
            } else {
                jQuery('#file_foto_produksi_selesai_delay_view').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
            }
            $$('#hp_delay_alamat').val(hp_alamat);
            $$('#tgl_kirim_cabang_delay').val(tgl_kirim_cabang);
            $$('#tgl_req_kirim_cabang_delay').val(tgl_req_kirim_cabang);
            $$('#keterangan_cabang_delay').val(keterangan_cabang);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function toSentenceCase(str) {
    if (!str) return '';
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================================
// FILTER / SEARCH DELAY GO TABLE
// ========================================
function filterDelayGoTable() {
    var keyword = (jQuery('#search_delay_go_client').val() || '').toLowerCase();
    jQuery('#data_status_notif_delay_go tr').each(function() {
        var rowText = jQuery(this).text().toLowerCase();
        jQuery(this).toggle(!keyword || rowText.indexOf(keyword) !== -1);
    });
}