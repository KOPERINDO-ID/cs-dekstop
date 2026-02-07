function changeFilterMenuNotif(menu) {
    localStorage.setItem('menu_notif', menu);
    $(".clearFilterMenuNotif").removeClass("bg-dark-gray-medium");
    changeFilterMenuNotifType();
    getCountStatusCsNotifView();
}

function changeFilterMenuNotifType() {
    $('.' + localStorage.getItem("menu_notif") + 'FilterMenuNotif').addClass("bg-dark-gray-medium");
    if (localStorage.getItem("menu_notif") == 'proforma') {
        $$('#notif-proforma').show();
        $$('#notif-prospek').hide();
        $$('#notif-sales').hide();
        $$('#notif-kirim').hide();
        $$('#notif-bayar').hide();
        $$('#notif-shipment').hide();
        getPerformaHeaderNotifPenjualan();
    } else if (localStorage.getItem("menu_notif") == 'sales') {
        $$('#notif-proforma').hide();
        $$('#notif-prospek').hide();
        $$('#notif-sales').show();
        $$('#notif-kirim').hide();
        $$('#notif-bayar').hide();
        $$('#notif-shipment').hide();
        getViewNotifManagerSales();
    } else if (localStorage.getItem("menu_notif") == 'bayar') {
        $$('#notif-proforma').hide();
        $$('#notif-prospek').hide();
        $$('#notif-sales').hide();
        $$('#notif-kirim').hide();
        $$('#notif-bayar').show();
        $$('#notif-shipment').hide();
        getViewNotifManagerBayar();
    } else if (localStorage.getItem("menu_notif") == 'kirim') {
        $$('#notif-proforma').hide();
        $$('#notif-prospek').hide();
        $$('#notif-sales').hide();
        $$('#notif-kirim').show();
        $$('#notif-bayar').hide();
        $$('#notif-shipment').hide();
        getViewNotifManagerKirim(1);
    } else if (localStorage.getItem("menu_notif") == 'shipment') {
        $$('#notif-proforma').hide();
        $$('#notif-prospek').hide();
        $$('#notif-sales').hide();
        $$('#notif-kirim').hide();
        $$('#notif-shipment').show();
        $$('#notif-bayar').hide();
        getViewNotifManagerShipment(1);
    }
}

function getCountStatusCsNotifView() {

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-count-status-cs-notif-view",
        dataType: 'JSON',
        data: {
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
        },
        beforeSend: function () {
        },
        success: function (data) {

            if (data.data_kirim > 0) {
                $$('.merah-kirim').removeClass("card-color-red-important announcement");
                $$('.merah-kirim').addClass("card-color-red-important announcement");
            } else {
                $$('.merah-kirim').removeClass("card-color-red-important announcement");
            }

            if (data.data_performa > 0) {
                $$('.merah-performa').removeClass("card-color-red-important announcement");
                $$('.merah-performa').addClass("card-color-red-important announcement");
            } else {
                $$('.merah-performa').removeClass("card-color-red-important announcement");
            }

            if (data.data_sales > 0) {
                $$('.merah-sales').removeClass("card-color-red-important announcement");
                $$('.merah-sales').addClass("card-color-red-important announcement");
            } else {
                $$('.merah-sales').removeClass("card-color-red-important announcement");
            }

            if (data.data_bayar > 0) {
                $$('.merah-bayar').removeClass("card-color-red-important announcement");
                $$('.merah-bayar').addClass("card-color-red-important announcement");
            } else {
                $$('.merah-bayar').removeClass("card-color-red-important announcement");
            }

            if (data.data_shipment > 0) {
                $$('.merah-shipment').removeClass("card-color-red-important announcement");
                $$('.merah-shipment').addClass("card-color-red-important announcement");
            } else {
                $$('.merah-shipment').removeClass("card-color-red-important announcement");
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}


function getViewNotifManagerSales() {

    var user_id = ""
    if (jQuery("#sales_id").val() == "" || jQuery("#sales_id").val() == null) {
        user_id = 'empty';
    } else {
        user_id = jQuery("#sales_id").val();
    }

    if (jQuery('#range-penjualan').val() == '' || jQuery('#range-penjualan').val() == null) {
        var startdate = "empty";
        var enddate = "empty";
    } else {
        var startdate_new = new Date(calendarRangePenjualan.value[0]);
        var enddate_new = new Date(calendarRangePenjualan.value[1]);
        var startdate = moment(startdate_new).format('YYYY-MM-DD');
        var enddate = moment(enddate_new).format('YYYY-MM-DD');
    }
    if (jQuery('#perusahaan_penjualan_filter').val() == '' || jQuery('#perusahaan_penjualan_filter').val() == null) {
        perusahaan_penjualan_value = "empty";
    } else {
        perusahaan_penjualan_value = jQuery('#perusahaan_penjualan_filter').val();
    }
    var penjualan_value = "";
    var pagination_button = "";

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-status-cs-sales",
        dataType: 'JSON',
        data: {
            karyawan_id: user_id,
            startdate: startdate,
            enddate: enddate,
            perusahaan_penjualan_value: perusahaan_penjualan_value,
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
                if (item.valid_cs == 2) {
                    var btn_valid = 'card-color-red';
                } else {
                    var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                }

                no_row++
                var wilayah = "";
                var nama_kota = "";
                if (item.wilayah_header == null) {
                    wilayah = '-';
                } else {
                    wilayah = item.wilayah_header;
                }
                if (item.nama_kota == null) {
                    nama_kota = '-';
                } else {
                    nama_kota = item.nama_kota;
                }
                penjualan_value += '<tr>';
                penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
                penjualan_value += '<td style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.karyawan_nama + '</td>';
                // penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                // penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-spkpo-popup" onclick="spkPo(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\');">Spk PO</button>';
                // penjualan_value += '</td>';
                // penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + nama_kota + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + wilayah + '</td>';
                // if (item.is_edit == 1) {
                //     penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                //     penjualan_value += '   <button  class="button-small card-color-red col button text-bold" >Edit</button>';
                //     penjualan_value += '</td>';
                // } else {
                //     penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                //     penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".edit-penjualan" onclick="editPenjualan(\'' + item.penjualan_id + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.client_id + '\',\'' + item.karyawan_id + '\',\'' + item.client_nama + '\',\'' + item.performa_header_id + '\',\'' + item.customer_logo + '\',\'' + item.customer_logo_bordir + '\',\'' + item.customer_logo_tambahan + '\');">Edit</button>';
                //     penjualan_value += '</td>';
                // }
                // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifSales(\'' + item.penjualan_id + '\',1);">eye</i></label>';
                // penjualan_value += '</td>';
                penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                penjualan_value += '   <button  class="' + btn_valid + ' button-small col button popup-open text-bold" data-popup=".detail-notif-sales-spkpo-popup" onclick="spkPoNotifSales(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\',\'' + item.valid_cs + '\');">Detail</button>';
                penjualan_value += '</td>';
                penjualan_value += '</tr>';

            });

            jQuery('#data_status_notif_manager').html(penjualan_value);

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function getViewNotifManagerKirim() {

    var penjualan_value = "";

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-surat-jalan-notif",
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
            $.each(data.data, function (i, item) {
                no_row++
                penjualan_value += '<tr>';
                penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
                penjualan_value += '  <td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center><b>' + moment(item.tanggal).format('DD-MMM-YY') + '</b></center></td>';
                penjualan_value += '  <td style="border-bottom:1px solid gray;"><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.no_surat_jalan + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.plat + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.kendaraan + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.pengirim + '</td>';
                // var alamat_kirim_penjualan = "";
                // var btn_alamat_kirim_penjualan = "";
                // if (item.alamat_kirim_penjualan != null) {
                //     alamat_kirim_penjualan = item.alamat_kirim_penjualan;
                //     btn_alamat_kirim_penjualan = "btn-color-blueWhite"
                // } else {
                //     alamat_kirim_penjualan = "";
                //     btn_alamat_kirim_penjualan = "bg-dark-gray-young text-add-colour-black-soft";
                // }
                var no_transaksi = moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');
                if (item.valid_cs == 2) {
                    var btn_valid = 'card-color-red';
                } else {
                    var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                }
                penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                penjualan_value += '   <button  class="' + btn_valid + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-notif" onclick="kirimAlamatNotif(\'' + item.no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + item.client_nama + '\',\'' + item.penjualan_id + '\');">Detail</button>';
                penjualan_value += '</td>';
                // penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                // penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-spkpo-popup" onclick="spkPo(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\');">Spk PO</button>';
                // penjualan_value += '</td>';
                // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifKirim(\'' + item.penjualan_id + '\',1);">eye</i></label>';
                // penjualan_value += '</td>';
                penjualan_value += '</tr>';
            });

            jQuery('#data_status_notif_kirim_manager').html(penjualan_value);

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function getViewNotifManagerShipment() {

    var penjualan_value = "";

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-status-cs-shipment",
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
                penjualan_value += '<tr>';
                penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
                penjualan_value += '  <td style="border-bottom:1px solid gray;"><center><b>' + no_transaksi + '</b></center></td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_kota + '</td>';
                penjualan_value += '  <td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center><b>' + moment(item.penjualan_tanggal_kirim).format('DD-MMM-YY') + '</b></center></td>';
                penjualan_value += '  <td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center><b>' + tgl_req_kirim + '</b></center></td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_telp + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + alamat_kirim_penjualan + '</td>';

                if (item.valid_shipment == 2) {
                    var btn_valid = 'card-color-red';
                } else {
                    var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                }
                penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                penjualan_value += '   <button  class="' + btn_valid + ' button-small col button popup-open text-bold" data-popup=".input-alamat-kirim-notif" onclick="shipmentNotif(\'' + item.penjualan_id + '\');">Shipment</button>';
                penjualan_value += '</td>';
                penjualan_value += '</tr>';
            });

            jQuery('#data_status_notif_shipment_manager').html(penjualan_value);

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function shipmentNotif(penjualan_id) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-Alamat",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $("#input_alamat_kirim_notif_popup")[0].reset();
        },
        success: function (data) {
            app.dialog.close();
            var alamat_client = "";
            var alamat_kirim = "";
            var client_nama = "";
            var hp_alamat = "";
            var client_kota = "";
            var tgl_kirim_cabang = "";
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
                keterangan_cabang = data.data.keterangan_cabang;
            } else {
                alamat_client = '-';
                alamat_kirim = '-';
                client_nama = '-';
                hp_alamat = '-';
                client_kota = '-';
                packing = '-';
                tgl_kirim_cabang = '';
                keterangan_cabang = '';
            }

            if (data.data.valid_shipment != 2) {
                jQuery('#show_reset_reject_element_shipment').hide();
                jQuery('#show_reject_element_shipment').show();
            } else {
                jQuery('#show_reset_reject_element_shipment').show();
                jQuery('#show_reject_element_shipment').hide();
            }
            
            // ⭐ LOGIKA CARD PEMBAYARAN BELUM LUNAS
            var penjualan_grandtotal = parseFloat(data.data.penjualan_grandtotal || 0);
            var penjualan_jumlah_pembayaran = parseFloat(data.data.penjualan_jumlah_pembayaran || 0);
            var sisa_bayar = penjualan_grandtotal - penjualan_jumlah_pembayaran;
            var shipment_status = data.data.shipment_status || null;
            
            if (sisa_bayar > 0) {
                // Belum lunas - tampilkan card warning
                jQuery('#card-pembayaran-belum-lunas-notif').show();
                
                // Update status badge dan text berdasarkan shipment_status
                if (shipment_status == 'approved') {
                    jQuery('#notif-shipment-status-text').text('Disetujui');
                    jQuery('#notif-shipment-status-badge')
                        .text('APPROVED')
                        .css('background', 'rgba(76, 175, 80, 0.9)'); // Hijau
                } else if (shipment_status == 'requested') {
                    jQuery('#notif-shipment-status-text').text('Menunggu Approval');
                    jQuery('#notif-shipment-status-badge')
                        .text('PENDING')
                        .css('background', 'rgba(255, 193, 7, 0.9)'); // Kuning
                } else if (shipment_status == 'rejected') {
                    jQuery('#notif-shipment-status-text').text('Ditolak');
                    jQuery('#notif-shipment-status-badge')
                        .text('REJECTED')
                        .css('background', 'rgba(244, 67, 54, 0.9)'); // Merah lebih gelap
                } else {
                    jQuery('#notif-shipment-status-text').text('Belum Diajukan');
                    jQuery('#notif-shipment-status-badge')
                        .text('PENDING')
                        .css('background', 'rgba(255, 152, 0, 0.9)'); // Orange
                }
            } else {
                // Sudah lunas - sembunyikan card warning
                jQuery('#card-pembayaran-belum-lunas-notif').hide();
            }
            
            $$("#detail_valid_notif_shipment").val(data.data.valid_shipment);
            $$('#alamat_sekarang_notif_popup').val(alamat_client);
            $$('#alamat_kirim_notif_popup').val(alamat_kirim);
            $$('#kota_kirim_notif_popup').val(client_kota);
            $$('#nama-client-alamat-notif').html(client_nama);
            $$('#penjualan_id_notif_alamat').val(penjualan_id);
            if (data.data.foto_produksi_selesai != null) {
                jQuery('#file_foto_produksi_selesai_notif_view').attr('src', BASE_PATH_IMAGE_BUKTI_PRODUKSI + '/' + data.data.foto_produksi_selesai);
            } else {
                jQuery('#file_foto_produksi_selesai_notif_view').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
            }
            $$('#hp_notif_alamat').val(hp_alamat);
            $$('#tgl_kirim_cabang_notif').val(tgl_kirim_cabang);
            $$('#keterangan_cabang_notif').val(keterangan_cabang);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function kirimAlamatNotif(no_surat_jalan, no_transaksi, client_nama, penjualan_id) {
    var penjualan_value = '';
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-surat-jalan-list-notif",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id,
            no_surat_jalan: no_surat_jalan,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $$('#detail_surat_jalan_history_notif').html('');
        },
        success: function (data) {
            app.dialog.close();

            jQuery('#show_reset_reject_element_kirim').hide();
            jQuery('#show_reject_element_kirim').hide();
            jQuery('#keterangan_valid_kirim').val('');
            $$("#detail_penjualan_id_notif_kirim").val(no_surat_jalan);
            $$("#nomer_sj").html('<h3>' + no_transaksi + ' ' + client_nama + '</h3>');
            $.each(data.data_distinct, function (i_d, item_d) {
                penjualan_value += '<tr>';
                penjualan_value += '<td  style="border-top:1px solid gray;border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;" align="center"  class="label-cell col col-border bg-dark-gray-medium">' + item_d.no_surat_jalan + '</td>';
                penjualan_value += '<td align="center" colspan="3" style="border-top:1px solid gray;border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell col col-border bg-dark-gray-medium">' + moment(item_d.tanggal).format('DD-MMM-YY hh:mm') + '</td>';
                if (item_d.foto_surat_jalan != null) {
                    penjualan_value += '<td align="center"  style="border-top:1px solid gray;border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><button style="background-color: blue; color:white;" class="text-add-colour-black-soft button-small col button text-bold"  onclick="lihatFotoSuratJalanNotif(\'' + item_d.foto_surat_jalan + '\');">Foto</button></td>';
                } else {
                    penjualan_value += '<td align="center"  style="border-top:1px solid gray;border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"  onclick="lihatFotoSuratJalanNotif(\'' + item_d.foto_surat_jalan + '\');">Foto</button></td>';
                }
                if (item_d.valid_cs != 2) {
                    jQuery('#show_reset_reject_element_kirim').hide();
                    jQuery('#show_reject_element_kirim').show();
                } else {
                    jQuery('#show_reset_reject_element_kirim').show();
                    jQuery('#show_reject_element_kirim').hide();
                }
                $$("#detail_valid_notif_kirim").val(item_d.valid_cs);
                penjualan_value += '</tr>';
                penjualan_value += '<tr>';
                penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Jumlah</td>';
                penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Type</td>';
                penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Plat</td>';
                penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Kendaraan</td>';
                penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Pengirim</td>';

                penjualan_value += '</tr>';
                $.each(data.data, function (i, item) {
                    if (item.jumlah_kirim != null && item.jumlah_kirim != 0) {
                        if (item_d.tanggal == item.tanggal) {
                            penjualan_value += '<tr>';
                            penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.jumlah_kirim + '</td>';
                            penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.penjualan_jenis + '</td>';
                            penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.plat + '</td>';
                            penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.kendaraan + '</td>';
                            penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.pengirim + '</td>';

                            penjualan_value += '</tr>';
                        }
                    }
                });

            });

            $$('#detail_surat_jalan_history_notif').html(penjualan_value);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function lihatFotoSuratJalanNotif(src) {
    console.log('KLIK');
    var gambar_zoom = BASE_PATH_IMAGE_SURAT_JALAN + '/' + src;
    var myPhotoBrowserPopupDark = app.photoBrowser.create({
        photos: [
            '' + gambar_zoom + ''
        ],
        theme: 'dark',
        type: 'popup'
    });
    myPhotoBrowserPopupDark.open();
}

function getViewNotifManagerBayar() {

    var penjualan_value = "";

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-status-cs-bayar",
        dataType: 'JSON',
        data: {
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            var no = 0;
            $.each(data.data, function (i, item) {
                no++
                if (item.foto_urutan == 'foto_1') {
                    if (item.valid_cs_1 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_2') {
                    if (item.valid_cs_2 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_3') {
                    if (item.valid_cs_3 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_4') {
                    if (item.valid_cs_4 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_5') {
                    if (item.valid_cs_5 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_6') {
                    if (item.valid_cs_6 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_7') {
                    if (item.valid_cs_7 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_8') {
                    if (item.valid_cs_8 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_9') {
                    if (item.valid_cs_9 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                } else if (item.foto_urutan == 'foto_10') {
                    if (item.valid_cs_10 == 2) {
                        var btn_valid = 'card-color-red';
                    } else {
                        var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                }

                if (item.valid_cs_1 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_2 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_3 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_4 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_5 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_6 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_7 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_8 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_9 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center" style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center" style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                } else if (item.valid_cs_10 != 1) {
                    penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                    penjualan_value += '<td align="center"  style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.datetime).format('DD-MMM-YY') + '</td>';
                    penjualan_value += '<td  style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.penjualan_tanggal).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    penjualan_value += '<td align="right" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.jumlah_payment) + '</td>';
                    penjualan_value += '<td align="left" style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.urutan_payment + '</td>';
                    penjualan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                    penjualan_value += '   <button  class="' + btn_valid + ' button-small col button text-bold popup-open" data-popup=".bukti-foto-pembayaran-notif"  onclick="fotoBayarView(\'' + item.penjualan_id + '\',\'' + item.foto_urutan + '\',\'' + item.valid_cs + '\',\'' + item.jumlah_payment + '\');">Foto</button>';
                    penjualan_value += '</td>';
                    // penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    // penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifBayar(\'' + item.id_log_pembayaran + '\',1);">eye</i></label>';
                    // penjualan_value += '</td>';
                    penjualan_value += '</tr>';
                }

            });

            jQuery('#data_status_notif_bayar_manager').html(penjualan_value);
            app.dialog.close();

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function zoom_view_global(src) {
    var gambar_zoom = src;
    var myPhotoBrowserPopupDark = app.photoBrowser.create({
        photos: [
            '' + gambar_zoom + ''
        ],
        theme: 'dark',
        type: 'popup'
    });
    myPhotoBrowserPopupDark.open();
}

function fotoBayarView(penjualan_id, urutan_foto, valid_cs, jumlah_payment) {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-data-status-cs-bayar-foto",
        dataType: "JSON",
        data: {
            penjualan_id: penjualan_id,
            foto_urutan: urutan_foto,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            jQuery('#keterangan_valid_bayar').val('');
            $$("#detail_penjualan_id_notif_bayar").val(data.data.penjualan_id);
            $$("#detail_foto_urutan_notif_bayar").val(urutan_foto);
            $$("#jumlah_pembayaran_popup_bukti").val(number_format(jumlah_payment));
            if (urutan_foto == 'foto_1') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_1);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_1)
                if (data.data.valid_cs_1 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_2') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_2);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_2)
                if (data.data.valid_cs_2 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_3') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_3);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_3)
                if (data.data.valid_cs_3 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_4') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_4);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_4)
                if (data.data.valid_cs_4 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_5') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_5);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_5)
                if (data.data.valid_cs_5 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_6') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_6);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_6)
                if (data.data.valid_cs_6 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_7') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_7);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_7)
                if (data.data.valid_cs_7 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_8') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_8);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_8)
                if (data.data.valid_cs_8 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_9') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_9);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_9)
                if (data.data.valid_cs_9 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            } else if (urutan_foto == 'foto_10') {
                $$("#file_foto_bayar_notif_view_now").attr("src", BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + data.data.foto_10);
                jQuery("#detail_valid_notif_bayar").val(data.data.valid_cs_10)
                if (data.data.valid_cs_10 != 2) {
                    jQuery('#show_reset_reject_element_bayar').hide();
                    jQuery('#show_reject_element_bayar').show();
                } else {
                    jQuery('#show_reset_reject_element_bayar').show();
                    jQuery('#show_reject_element_bayar').hide();
                }
            }
        }
    });
}

function getPerformaHeaderNotifPenjualan() {
    var performa_value = "";
    var user_id = ""
    if (jQuery("#sales_id").val() == "" || jQuery("#sales_id").val() == null) {
        user_id = 'empty';
    } else {
        user_id = jQuery("#sales_id").val();
    }
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-status-cs-performa",
        dataType: 'JSON',
        data: {
            karyawan_id: user_id,
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
            version_app: localStorage.getItem("versioon_app_now")
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            if (data.data.length != 0) {
                var color_tr = "";
                var no = 0;
                $.each(data.data, function (i2, item2) {
                    no++
                    if (item2.valid_cs == 2) {
                        color_tr = 'red';
                        if (data.potongan[item2.performa_header_id] != 0) {
                            var btn_valid = 'card-color-red';
                        } else {
                            var btn_valid = 'card-color-red';
                        }
                    } else {
                        color_tr = '';
                        if (data.potongan[item2.performa_header_id] != 0) {
                            var btn_valid = 'card-color-red';
                        } else {
                            var btn_valid = 'text-add-colour-black-soft bg-dark-gray-young';
                        }
                    }

                    if (data.potongan[item2.performa_header_id] != 0) {
                        var btn_potongan = 'card-color-red';
                    } else {
                        var btn_potongan = 'text-add-colour-black-soft bg-dark-gray-young';
                    }
                    if (item2.valid_cs != 1) {
                        performa_value += '<tr>';
                        performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;">';
                        performa_value += '' + no + '';
                        performa_value += '</td>';
                        performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
                        performa_value += '' + moment(item2.dt_record).format('DD-MMM') + '';
                        performa_value += '</td>';
                        performa_value += '<td class="label-cell" style="background-color:' + color_tr + ';  gray; border-right:1px solid gray; border-bottom:1px solid gray;">';
                        performa_value += '' + moment(item2.dt_record).format('DDMMYY') + '-' + item2.performa_header_id.replace(/\PI_/g, '').replace(/^0+/, '') + '';
                        performa_value += '</td>';
                        performa_value += '<td class="label-cell text-align-left" style=" background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
                        performa_value += '' + item2.client_nama + '';
                        performa_value += '</td>';
                        performa_value += '<td class="label-cell text-align-left" style=" background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
                        performa_value += '' + item2.karyawan_nama + '';
                        performa_value += '</td>';
                        performa_value += '<td class="label-cell text-align-left" style=" background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
                        performa_value += '' + number_format(item2.total_performa) + '';
                        performa_value += '</td>';
                        // performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
                        // performa_value += '<img class="popup-open" data-popup=".detail-proforma-popup" onclick="penjualanGetPerformaNotifDownload(\'' + item2.performa_header_id + '\',\'' + item2.karyawan_id + '\',\'' + item2.client_kota + '\',\'' + item2.client_nama + '\',\'' + item2.dt_record + '\',\'' + item2.performa_total_qty + '\',\'' + item2.extra + '\');" src="img/logo/donwloadproforma.png" width="80px" />';
                        // performa_value += '</td>';
                        performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
                        performa_value += '   <button  class="' + btn_valid + '  button-small col button popup-open text-bold" data-popup=".detail-proforma-notif-popup" onclick="penjualanGetPerformaNotifDownload(\'' + item2.performa_header_id + '\',\'' + item2.karyawan_id + '\',\'' + item2.client_kota + '\',\'' + item2.client_nama + '\',\'' + item2.dt_record + '\',\'' + item2.performa_total_qty + '\',\'' + item2.extra + '\',\'' + item2.valid_cs + '\',\'' + (item2.needs_approval || 0) + '\',\'' + (item2.approval_status || '') + '\');">Detail</button>';
                        performa_value += '</td>';
                        // performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
                        // performa_value += '   <button  class="' + btn_potongan + ' button-small col button popup-open text-bold" data-popup=".pengajuan-potongan-notif-popup" onclick="potonganPenjualanNotif(\'' + item2.performa_header_id + '\',\'' + item2.status + '\');">Potongan</button>';
                        // performa_value += '</td>';
                        // performa_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                        // performa_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNotifPerforma(\'' + item2.performa_header_id + '\',1);">eye</i></label>';
                        // performa_value += '</td>';
                        performa_value += '</tr>';
                    }
                });

            } else {
                performa_value += '<tr>';
                performa_value += '<td colspan="4" ><font style="color:red;font-weight:bold;">Data Proforma Tidak Ada</font></td>';
                performa_value += '</tr>';
            }

            $$('#performa_notif_value').html(performa_value);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function potonganPenjualanNotif(performa_header_id, status) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/edit-performa-header-penjualan",
        dataType: 'JSON',
        data: {
            performa_header_id: performa_header_id
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            var editPerformaHeaderPenjualanPage = '';
            if (data.data.length <= 0) {
                editPerformaHeaderPenjualanPage += '<tr>';
                editPerformaHeaderPenjualanPage += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" colspan="5">Tidak Ada Data</td>';
                editPerformaHeaderPenjualanPage += '<tr>';

            } else {
                $.each(data.data, function (i, item) {
                    editPerformaHeaderPenjualanPage += '<tr>';
                    editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + item.jenis + '</td>';
                    editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + item.qty + '</td>';
                    editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + number_format(item.price) + '</td>';
                    editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + number_format(item.potongan_price) + '</td>';
                    editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + number_format(item.total) + '</td>';
                    editPerformaHeaderPenjualanPage += '<tr>';
                });
            }
            $$('#potongan_penjualan_notif').html(editPerformaHeaderPenjualanPage);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });

}

function getDetailPenjualanOwner(penjualan_id) {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-detail-penjualan-owner",
        dataType: "JSON",
        data: {
            penjualan_id: penjualan_id
        },
        beforeSend: function () {
        },
        success: function (data) {
            var detail_penjualan_val = "";
            jQuery.each(data.data, function (i, item) {
                detail_penjualan_val += '<tr>';

                detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="20%">' + item.penjualan_jenis + '</td>';
                detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="7%">' + item.penjualan_qty + '</td>';
                detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="15%">' + number_format(item.penjualan_harga) + '</td>';
                detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="15%">' + number_format(item.penjualan_detail_grandtotal) + '</td>';
                detail_penjualan_val += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                detail_penjualan_val += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" data-popup=".edit-detail-manager-penjualan"  onclick="editDetailOwnerPenjualan(\'' + item.penjualan_detail_performa_id + '\');">Edit</button>';
                detail_penjualan_val += '</td>';
                detail_penjualan_val += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
                detail_penjualan_val += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"   onclick="hapusDetailPenjualanOwner(\'' + item.penjualan_detail_performa_id + '\',\'' + item.penjualan_id + '\');">Hapus</button>';
                detail_penjualan_val += '</td>';
                detail_penjualan_val += '</tr>';

            });
            $$('#detail_penjualan_val').html(detail_penjualan_val);

        }
    });

}

function updateStatusNotifSales(penjualan_id, status_view) {
    app.dialog.create({
        title: 'Ubah Status View',
        text: 'Apakah Anda Yakin Mengubah Status View Data ini ? ',
        cssClass: 'custom-dialog',
        closeByBackdropClick: 'true',
        buttons: [
            {
                text: 'Ya',
                onClick: function () {
                    jQuery.ajax({
                        type: 'POST',
                        url: "" + BASE_API + "/update-status-notif-cs-sales",
                        dataType: 'JSON',
                        data: {
                            penjualan_id: penjualan_id,
                            status_view: status_view
                        },
                        beforeSend: function () {
                            app.dialog.preloader('Harap Tunggu');
                        },
                        success: function (data) {
                            app.dialog.close();
                            getViewNotifManagerSales();
                        },
                        error: function (xmlhttprequest, textstatus, message) {
                        }
                    });
                },
            },
            {
                text: 'Tidak',
                onClick: function () {

                },
            },
        ],
    }).open();

}

function updateStatusNotifKirim(penjualan_id, status_view) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/update-status-notif-cs-kirim",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id,
            status_view: status_view
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            getViewNotifManagerKirim();
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function updateStatusNotifBayar(id_log_pembayaran, status_view) {
    app.dialog.create({
        title: 'Ubah Status View',
        text: 'Apakah Anda Yakin Mengubah Status View Data ini ? ',
        cssClass: 'custom-dialog',
        closeByBackdropClick: 'true',
        buttons: [
            {
                text: 'Ya',
                onClick: function () {
                    jQuery.ajax({
                        type: 'POST',
                        url: "" + BASE_API + "/update-status-notif-cs-bayar",
                        dataType: 'JSON',
                        data: {
                            id_log_pembayaran: id_log_pembayaran,
                            status_view: status_view
                        },
                        beforeSend: function () {
                            app.dialog.preloader('Harap Tunggu');
                        },
                        success: function (data) {
                            app.dialog.close();
                            getViewNotifManagerBayar();
                        },
                        error: function (xmlhttprequest, textstatus, message) {
                        }
                    });
                },
            },
            {
                text: 'Tidak',
                onClick: function () {

                },
            },
        ],
    }).open();

}

function updateStatusNotifPerforma(performa_header_id, status_view) {
    app.dialog.create({
        title: 'Ubah Status View',
        text: 'Apakah Anda Yakin Mengubah Status View Data ini ? ',
        cssClass: 'custom-dialog',
        closeByBackdropClick: 'true',
        buttons: [
            {
                text: 'Ya',
                onClick: function () {
                    jQuery.ajax({
                        type: 'POST',
                        url: "" + BASE_API + "/update-status-notif-cs-performa",
                        dataType: 'JSON',
                        data: {
                            performa_header_id: performa_header_id,
                            status_view: status_view
                        },
                        beforeSend: function () {
                            app.dialog.preloader('Harap Tunggu');
                        },
                        success: function (data) {
                            app.dialog.close();
                            getPerformaHeaderNotifPenjualan();
                        },
                        error: function (xmlhttprequest, textstatus, message) {
                        }
                    });
                },
            },
            {
                text: 'Tidak',
                onClick: function () {

                },
            },
        ],
    }).open();

}

function penjualanGetPerformaNotifDownload(performa_header_id, karyawan_id, client_kota, client_nama, performa_tanggal_kirim, performa_total_qty, extra, valid_cs, needs_approval, approval_status) {
    var proforma_data = "";
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-performa-cs",
        dataType: 'JSON',
        data: {
            karyawan_id: karyawan_id,
            performa_header_id: performa_header_id
        },
        beforeSend: function () {
            jQuery('#show_reset_reject_element_proforma').hide();
            jQuery('#show_reject_element_proforma').hide();
            jQuery('#keterangan_valid_proforma').val('');
            jQuery("#detail_valid_notif_performa").val('');
            jQuery("#detail_performa_header_id_notif_performa").val('');

            if (extra != 1) {
                header_koper = 'INDOKOPER';
                header_web = '';
                tipe_grosir = "Grosir"
            } else {
                header_koper = 'KOPERINDO';
                header_web = 'www.koperindo.id';
                tipe_grosir = "Xtra"
            }
            proforma_data += '<table width="100%" border="0">';
            proforma_data += '	<tr>';
            proforma_data += '		<td colspan="6"  align="center"><b>' + header_koper + '</b><br>Industri Tas & Koper</td>';
            proforma_data += '	</tr>';
            proforma_data += '	<tr>';
            proforma_data += '		<td colspan="6" align="center">' + header_web + '';
            proforma_data += '			<hr>';
            proforma_data += '		</td>';
            proforma_data += '	</tr>';
            proforma_data += '	<tr>';
            proforma_data += '		<td colspan="5" align="center">Proforma</td>';
            proforma_data += '	</tr>';
            proforma_data += '	<tr>';
            proforma_data += '		<td colspan="3" align="left" >Kepada Yth :  ' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + ' <br><font style="padding:94px;"> ' + client_kota + '</font></td>';
            proforma_data += '		<td colspan="2" align="right">' + moment(performa_tanggal_kirim).format('DDMMYY') + '-' + performa_header_id.replace(/\PI_/g, '').replace(/^0+/, '') + '</td>';
            proforma_data += '	</tr>';
            proforma_data += '	<tr>';
            proforma_data += '		<td colspan="2" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Spesifikasi</td>';
            proforma_data += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
            proforma_data += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
            proforma_data += '		<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Total Rp.</td>';
            proforma_data += '	</tr>';
        },
        success: function (data) {
            if (valid_cs != 2) {
                jQuery('#show_reset_reject_element_proforma').hide();
                jQuery('#show_reject_element_proforma').show();
            } else {
                jQuery('#show_reset_reject_element_proforma').show();
                jQuery('#show_reject_element_proforma').hide();
            }

            jQuery("#detail_valid_notif_performa").val(valid_cs);
            jQuery("#detail_performa_header_id_notif_performa").val(performa_header_id);

            if (data.data.length != 0) {

                var penjualan_total = 0;

                proforma_data += '<tbody>';
                jQuery.each(data.data, function (i, val) {
                    if (val.style != null && val.style != 'none') {
                        var style = val.style;
                    } else {
                        var style = '';
                    }
                    if (!val.keterangan) {
                        var ket_item = '';
                    } else {

                        var ket_item = '<font color="red"><br>KET :<br>' + style + ' ' + val.keterangan + '</font>';

                    }


                    if (val.gambar.substring(0, 5) == "koper") {
                        var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
                    } else {
                        var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
                    }

                    // Potongan - LOGIKA SAMA DENGAN ICON DOWNLOAD DI PENJUALAN.JS
                    // Tampilkan potongan HANYA jika: needs_approval = 1 DAN (approval_status = 'pending' ATAU 'rejected')
                    var potongan = '';
                    var potongan_total = '';
                    if (val.potongan_price != 0) {
                        // Convert ke integer/string untuk perbandingan
                        var needs_approval_check = parseInt(needs_approval || 0);
                        var approval_status_check = (approval_status || '').toString();
                        
                        // Tampilkan angka potongan merah HANYA jika needs_approval dan status pending/rejected
                        if (needs_approval_check == 1 && (approval_status_check == 'pending' || approval_status_check == 'rejected')) {
                            potongan = '<span style="font-weight:bold;color:red;">' + number_format(val.potongan_price) + '<span>';
                            potongan_total = '<span style="font-weight:bold;color:red;">' + number_format(parseFloat(val.potongan_price) * parseFloat(val.qty)) + '<span>';
                        }
                        // Jika sudah approved atau tidak perlu approval, tidak tampilkan angka potongan
                    }

                    proforma_data += '		<tr>';
                    proforma_data += '			<td width="30%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; "><center>' + val.jenis + '<br><img src="' + path_image + '/' + val.gambar + '" width="70%"></center></td>';
                    proforma_data += '			<td width="20%" class="label-cell" align="left" style="border-top: solid 1px; white-space: pre;">SPESIFIKASI<br>' + val.spesifikasi + '<br>' + ket_item + '</td>';
                    proforma_data += '				<td width="10%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
                    proforma_data += '					<center>' + val.qty + '</center>';
                    proforma_data += '				</td>';
                    proforma_data += '				<td width="20%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
                    proforma_data += '					<center>' + number_format(val.price) + '<br>' + potongan + '</center>';
                    proforma_data += '				</td>';
                    proforma_data += '				<td width="20%" colspan="2" class="label-cell text-align-center" style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
                    proforma_data += '					<center>' + number_format(val.total) + '<br>' + potongan_total + ' </center > ';
                    proforma_data += '				</td>';
                    proforma_data += '			</tr>';

                    penjualan_total += parseInt(val.total);
                });
                proforma_data += '</tbody>';
                proforma_data += '		<tr>';
                proforma_data += '			<td colspan="3" style=" border-top: solid 1px;  font-weight:bold;" align="right"></td>';
                proforma_data += '			<td colspan="1" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
                proforma_data += '				Total';
                proforma_data += '			</td>';
                proforma_data += '			<td colspan="1" style="border-bottom: solid 1px; padding-left:10px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
                proforma_data += '				<font style="float:right; padding-right:10px;">' + number_format(penjualan_total) + '</font>';
                proforma_data += '			</td>';
                proforma_data += '		</tr>';


                if (number_format(data.data[0].biaya_kirim) != 0) {
                    //	proforma_data += '		<tr>';
                    //	proforma_data += '			<td colspan="3" style="font-weight:bold;" align="right"></td>';
                    //	proforma_data += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
                    //	proforma_data += '				Biaya Kirim';
                    //	proforma_data += '			</td>';
                    //	proforma_data += '			<td colspan="1" style="padding-left:10px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;  font-weight:bold;" align="left">';
                    //	proforma_data += '				<font style="float:right; padding-right:10px;">' + number_format(data.data[0].biaya_kirim) + '</font>';
                    //	proforma_data += '			</td>';
                    //	proforma_data += '		</tr>';
                }

                //	proforma_data += '		<tr>';
                //	proforma_data += '			<td colspan="3" style="font-weight:bold;" align="right"></td>';
                //	proforma_data += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
                //	proforma_data += '				Jumlah';
                //	proforma_data += '			</td>';
                //	proforma_data += '			<td colspan="1" style="padding-left:10px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
                //	proforma_data += '				 <font style="float:right; padding-right:10px;">' + number_format((parseInt(penjualan_total))) + '</font>';
                //	proforma_data += '			</td>';
                //	proforma_data += '		</tr>'

                proforma_data += '	</table><br>';
                proforma_data += '	<table width="100%" border="0">';
                proforma_data += '      <tr>';
                proforma_data += '          <td style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Emblem</td>';
                proforma_data += '          <td style="border-top: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="34%" align="center">Logo Bordir</td>';
                proforma_data += '          <td style="border-top: solid 1px;  border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Tambah</td>';
                proforma_data += '      </tr>';
                proforma_data += '      <tr>';
                proforma_data += '          <td style=" border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo + '" width="80%" /></td>';

                if (data.data[0].customer_logo_bordir != "") {
                    proforma_data += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo_bordir + '" width="80%" /> </td>';
                } else {
                    proforma_data += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

                }
                if (data.data[0].customer_logo_tambahan != "") {
                    proforma_data += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo_tambahan + '" width="80%" /> </td>';
                } else {
                    proforma_data += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

                }
                proforma_data += '      </tr>';
                proforma_data += '	</table>';

            }

            // let options = {
            // 	documentSize: 'A4',
            // 	type: 'share',
            // 	fileName: 'Proforma_' + client_nama + '.pdf'
            // }

            var spk1_pdf = proforma_data;
            $$('#detail_proforma_notif_table_popup').html(proforma_data);
            // console.log(spk1_pdf);
            // pdf.fromData(spk1_pdf, options)
            // 	.then((stats) => console.log('status', stats))
            // 	.catch((err) => console.err(err))
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });

}


function UpdateValidNotifPerforma(type) {
    if (jQuery("#detail_valid_notif_performa").val() != 0) {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        } else if (type == 2) {
            var message = 'Reset Data';
            var type_valid = 0;
        }
    } else {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        }
    }

    app.dialog.confirm('' + message + ' ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-performa",
                dataType: "JSON",
                data: {
                    performa_header_id: $("#detail_performa_header_id_notif_performa").val(),
                    valid: type_valid
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        getPerformaHeaderNotifPenjualan();
                        app.popup.close();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        getPerformaHeaderNotifPenjualan();
                        app.popup.close();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    app.popup.close();
                }
            });

        }
    });
}

function UpdateValidNotifRejectPerforma() {
    app.dialog.confirm('Update Data Reject ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-performa",
                dataType: "JSON",
                data: {
                    performa_header_id: $("#detail_performa_header_id_notif_performa").val(),
                    keterangan: $("#keterangan_valid_proforma").val(),
                    valid: 2,
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        $("#keterangan_valid_proforma").val('');
                        jQuery("#back-update-valid-reject-proforma").click();
                        app.popup.close();
                        getPerformaHeaderNotifPenjualan();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        $("#keterangan_valid_proforma").val('');
                        jQuery("#back-update-valid-reject-proforma").click();
                        app.popup.close();
                        getPerformaHeaderNotifPenjualan();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    jQuery("#back-update-valid-reject-proforma").click();
                    app.popup.close();
                }
            });

        }
    });
}

function spkPoNotifSales(penjualan_id_primary, performa_id_relation, performa_header_id, biaya_kirim, client_alamat, client_cp, client_cp_posisi, client_id, client_kota, client_nama, client_telp, jenis_penjualan, karyawan_id, penjualan_global_diskon, penjualan_grandtotal, penjualan_id, penjualan_jumlah_pembayaran, penjualan_keterangan, penjualan_status, penjualan_status_pembayaran, penjualan_tanggal, penjualan_tanggal_kirim, penjualan_total, penjualan_void_keterangan, penjualan_total_qty, extra, valid_cs) {
    var invoice_penjualan = '';
    var no_invoice_penjualan = 0;
    var header_koper = "";
    var header_web = "";
    var tipe_grosir = "";

    if (extra != 1) {
        header_koper = 'INDOKOPER';
        header_web = '';
        tipe_grosir = "Grosir"
    } else {
        header_koper = 'KOPERINDO';
        header_web = 'www.koperindo.id';
        tipe_grosir = "Xtra"
    }
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/spk-po-manager",
        dataType: 'JSON',
        data: {
            karyawan_id: jQuery("#sales_id").val(),
            performa_header_id: performa_header_id,
            jenis_penjualan: jenis_penjualan,
            penjualan_id_primary: penjualan_id
        },
        beforeSend: function () {
            app.dialog.preloader('Mengambil Data Po');

            jQuery('#show_reset_reject_element_sales').hide();
            jQuery('#show_reject_element_sales').hide();
            jQuery('#keterangan_valid_sales').val('');
            jQuery("#detail_valid_notif_sales").val('');
            jQuery("#detail_penjualan_id_notif_sales").val('');
            invoice_penjualan += '<table width="100%" border="0">';
            invoice_penjualan += '<tr>';
            invoice_penjualan += '		<td colspan="6"  align="center"><b>' + header_koper + '</b><br>Industri Tas & Koper</td>';
            invoice_penjualan += '	</tr>';
            invoice_penjualan += '	<tr>';
            invoice_penjualan += '		<td colspan="6" align="center">' + header_web + '';
            invoice_penjualan += '			<hr>';
            invoice_penjualan += '		</td>';
            invoice_penjualan += '	</tr>';
            invoice_penjualan += '	<tr>';
            invoice_penjualan += '		<td colspan="6" align="center"><h2>SPK</h2><h3 style="color:red;margin-top:-10px">' + tipe_grosir + '</h3></td>';
            invoice_penjualan += '	</tr>';
            invoice_penjualan += '	<tr>';
            invoice_penjualan += '		<td colspan="4" align="left" >Kepada Yth :  ' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + ' <br> <font style="padding:94px;">' + client_kota + '</font></td>';
            invoice_penjualan += '		<td colspan="2" align="right">' + moment(penjualan_tanggal).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
            invoice_penjualan += '	</tr>';
            invoice_penjualan += '	<tr>';
            invoice_penjualan += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">No</td>';
            invoice_penjualan += '		<td colspan="2" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Spesifikasi</td>';
            invoice_penjualan += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
            invoice_penjualan += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
            invoice_penjualan += '		<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Total Rp.</td>';
            invoice_penjualan += '	</tr>';
        },
        success: function (data) {
            app.dialog.close();

            if (data.data.length != 0) {
                if (valid_cs != 2) {
                    jQuery('#show_reset_reject_element_sales').hide();
                    jQuery('#show_reject_element_sales').show();
                } else {
                    jQuery('#show_reset_reject_element_sales').show();
                    jQuery('#show_reject_element_sales').hide();
                }

                jQuery("#detail_valid_notif_sales").val(valid_cs);
                jQuery("#detail_penjualan_id_notif_sales").val(penjualan_id);

                var penjualan_total = 0;
                var invest_molding = data.data[0].invest_molding;

                invoice_penjualan += '<tbody>';
                jQuery.each(data.data, function (i, val) {
                    if (val.style != null && val.style != 'none') {
                        var style = val.style;
                    } else {
                        var style = '';
                    }
                    if (!val.keterangan) {
                        var ket_item = '';
                    } else {

                        var ket_item = '<font color="red"><br>KET :<br>' + style + ' ' + val.keterangan + '</font>';

                    }


                    if (val.gambar.substring(0, 5) == "koper") {
                        var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
                    } else {
                        var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
                    }

                    invoice_penjualan += '		<tr>';
                    invoice_penjualan += '			<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; "><center>' + (no_invoice_penjualan += 1) + '</center></td>';
                    invoice_penjualan += '			<td width="25%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; "><center>' + val.penjualan_jenis + '<br><img src="' + path_image + '/' + val.gambar + '" width="70%"></center></td>';
                    invoice_penjualan += '			<td width="20%" class="label-cell" align="left" style="border-top: solid 1px; white-space: pre;">SPESIFIKASI<br>' + val.produk_keterangan_kustom + '<br>' + ket_item + '</td>';
                    invoice_penjualan += '				<td width="10%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
                    invoice_penjualan += '					<center>' + val.penjualan_qty + '</center>';
                    invoice_penjualan += '				</td>';
                    invoice_penjualan += '				<td width="20%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
                    invoice_penjualan += '					<center>' + number_format(val.penjualan_harga) + '</center>';
                    invoice_penjualan += '				</td>';
                    invoice_penjualan += '				<td width="20%" colspan="2" class="label-cell text-align-center" style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
                    invoice_penjualan += '					<center>' + number_format(val.penjualan_detail_grandtotal) + '</center>';
                    invoice_penjualan += '				</td>';
                    invoice_penjualan += '			</tr>';

                    penjualan_total += parseInt(val.penjualan_detail_grandtotal);
                });
                invoice_penjualan += '</tbody>';
                invoice_penjualan += '		<tr>';
                invoice_penjualan += '			<td colspan="4" style=" border-top: solid 1px; font-weight:bold;" align="right"></td>';
                invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
                invoice_penjualan += '				Total';
                invoice_penjualan += '			</td>';
                invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
                invoice_penjualan += '			<font style="float:right;">' + number_format(penjualan_total) + '</font>';
                invoice_penjualan += '			</td>';
                invoice_penjualan += '		</tr>';
                if (number_format(data.data[0].invest_molding) != 0) {
                    invoice_penjualan += '		<tr>';
                    invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
                    invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
                    invoice_penjualan += '				Molding';
                    invoice_penjualan += '			</td>';
                    invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
                    invoice_penjualan += '				 <font style="float:right; ">' + number_format(invest_molding) + '</font>';
                    invoice_penjualan += '			</td>';
                    invoice_penjualan += '		</tr>';
                }
                if (number_format(data.data[0].pembayaran_1) != 0) {
                    invoice_penjualan += '		<tr>';
                    invoice_penjualan += '			<td colspan="4" style="  font-weight:bold;" align="right"></td>';
                    invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
                    invoice_penjualan += '				Deposit';
                    invoice_penjualan += '			</td>';
                    invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
                    invoice_penjualan += '			<font style="float:right; ">' + number_format(data.data[0].pembayaran_1) + '</font>';
                    invoice_penjualan += '			</td>';
                    invoice_penjualan += '		</tr>';
                }
                if (number_format(data.data[0].biaya_kirim) != 0) {
                    //invoice_penjualan += '		<tr>';
                    //invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
                    //invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
                    //invoice_penjualan += '				Biaya Kirim';
                    //invoice_penjualan += '			</td>';
                    //invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;  font-weight:bold;" align="left">';
                    //invoice_penjualan += '			<font style="float:right;">' + number_format(biaya_kirim) + '</font>';
                    //invoice_penjualan += '			</td>';
                    //invoice_penjualan += '		</tr>';
                }


                invoice_penjualan += '		<tr>';
                invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
                invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
                invoice_penjualan += '				Jumlah';
                invoice_penjualan += '			</td>';
                invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
                if (number_format(data.data[0].pembayaran_1) != 0) {
                    invoice_penjualan += '			 <font style="float:right;">' + number_format(parseFloat(penjualan_total) - parseFloat(data.data[0].pembayaran_1)) + '</font>';
                } else {
                    invoice_penjualan += '			 <font style="float:right;">' + number_format(parseFloat(penjualan_total)) + '</font>';

                }
                invoice_penjualan += '			</td>';
                invoice_penjualan += '		</tr>'

                invoice_penjualan += '		<tr>';
                invoice_penjualan += '			<td colspan="5"></td>';
                invoice_penjualan += '		</tr>';
                invoice_penjualan += '	</table>';

                invoice_penjualan += '	<table width="100%" border="0">';
                invoice_penjualan += '      <tr>';
                invoice_penjualan += '          <td style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Emblem</td>';
                invoice_penjualan += '          <td style="border-top: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="34%" align="center">Logo Bordir</td>';
                invoice_penjualan += '          <td style="border-top: solid 1px;  border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Tambah</td>';
                invoice_penjualan += '      </tr>';
                invoice_penjualan += '      <tr>';
                invoice_penjualan += '          <td style=" border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo + '" width="80%" /></td>';

                if (data.data[0].customer_logo_bordir != "") {
                    invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo_bordir + '" width="80%" /> </td>';
                } else {
                    invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

                }

                if (data.data[0].customer_logo_tambahan != "") {
                    invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo_tambahan + '" width="80%" /> </td>';
                } else {
                    invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

                }

                invoice_penjualan += '      </tr>';
                invoice_penjualan += '	</table>';



            }


            // let options = {
            // 	documentSize: 'A4',
            // 	type: 'share',
            // 	fileName: 'report_' + client_nama + '.pdf'
            // }

            // pdf.fromData(invoice_penjualan, options)
            // 	.then((stats) => console.log('status', stats))
            // 	.catch((err) => console.err(err))

            $$('#detail_notif_sales_spkpo_table_popup').html(invoice_penjualan);
            console.log(invoice_penjualan);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}


function UpdateValidNotifSales(type) {
    if (jQuery("#detail_valid_notif_sales").val() != 0) {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        } else if (type == 2) {
            var message = 'Reset Data';
            var type_valid = 0;
        }
    } else {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        }
    }

    app.dialog.confirm('' + message + ' ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-sales",
                dataType: "JSON",
                data: {
                    penjualan_id: $("#detail_penjualan_id_notif_sales").val(),
                    valid: type_valid
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        getViewNotifManagerSales();
                        app.popup.close();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        getViewNotifManagerSales();
                        app.popup.close();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    app.popup.close();
                }
            });

        }
    });
}

function UpdateValidNotifRejectSales() {
    app.dialog.confirm('Update Data Reject ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-sales",
                dataType: "JSON",
                data: {
                    penjualan_id: $("#detail_penjualan_id_notif_sales").val(),
                    keterangan: $("#keterangan_valid_sales").val(),
                    valid: 2,
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        $("#keterangan_valid_sales").val('');
                        jQuery("#back-update-valid-reject-sales").click();
                        app.popup.close();
                        getViewNotifManagerSales();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        $("#keterangan_valid_sales").val('');
                        jQuery("#back-update-valid-reject-sales").click();
                        app.popup.close();
                        getViewNotifManagerSales();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    jQuery("#back-update-valid-reject-sales").click();
                    app.popup.close();
                }
            });

        }
    });
}


function UpdateValidNotifBayar(type) {
    if (jQuery("#detail_valid_notif_bayar").val() != 0) {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        } else if (type == 2) {
            var message = 'Reset Data';
            var type_valid = 0;
        }
    } else {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        }
    }

    app.dialog.confirm('' + message + ' ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-bayar",
                dataType: "JSON",
                data: {
                    penjualan_id: $("#detail_penjualan_id_notif_bayar").val(),
                    foto_urutan: $("#detail_foto_urutan_notif_bayar").val(),
                    valid: type_valid
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        getViewNotifManagerBayar();
                        app.popup.close();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        getViewNotifManagerBayar();
                        app.popup.close();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    app.popup.close();
                }
            });

        }
    });
}

function UpdateValidNotifRejectBayar() {
    app.dialog.confirm('Update Data Reject ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-bayar",
                dataType: "JSON",
                data: {
                    penjualan_id: $("#detail_penjualan_id_notif_bayar").val(),
                    foto_urutan: $("#detail_foto_urutan_notif_bayar").val(),
                    keterangan: $("#keterangan_valid_bayar").val(),
                    valid: 2,
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        $("#keterangan_valid_bayar").val('');
                        jQuery("#back-update-valid-reject-bayar").click();
                        app.popup.close();
                        getViewNotifManagerBayar();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        $("#keterangan_valid_bayar").val('');
                        jQuery("#back-update-valid-reject-bayar").click();
                        app.popup.close();
                        getViewNotifManagerBayar();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    jQuery("#back-update-valid-reject-bayar").click();
                    app.popup.close();
                }
            });

        }
    });
}


function UpdateValidNotifKirim(type) {
    if (jQuery("#detail_valid_notif_kirim").val() != 0) {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        } else if (type == 2) {
            var message = 'Reset Data';
            var type_valid = 0;
        }
    } else {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        }
    }

    app.dialog.confirm('' + message + ' ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-kirim",
                dataType: "JSON",
                data: {
                    penjualan_id: $("#detail_penjualan_id_notif_kirim").val(),
                    foto_urutan: $("#detail_foto_urutan_notif_kirim").val(),
                    valid: type_valid
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        getViewNotifManagerKirim();
                        app.popup.close();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        getViewNotifManagerKirim();
                        app.popup.close();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    app.popup.close();
                }
            });

        }
    });
}

function UpdateValidNotifRejectKirim() {
    app.dialog.confirm('Update Data Reject ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-kirim",
                dataType: "JSON",
                data: {
                    penjualan_id: $("#detail_penjualan_id_notif_kirim").val(),
                    keterangan: $("#keterangan_valid_kirim").val(),
                    valid: 2,
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        $("#keterangan_valid_kirim").val('');
                        jQuery("#back-update-valid-reject-kirim").click();
                        app.popup.close();
                        getViewNotifManagerKirim();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        $("#keterangan_valid_kirim").val('');
                        jQuery("#back-update-valid-reject-kirim").click();
                        app.popup.close();
                        getViewNotifManagerKirim();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    jQuery("#back-update-valid-reject-kirim").click();
                    app.popup.close();
                }
            });

        }
    });
}

function UpdateValidNotifShipment(type) {
    if (jQuery("#detail_valid_notif_shipment").val() != 0) {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        } else if (type == 2) {
            var message = 'Reset Data';
            var type_valid = 0;
        }
    } else {
        if (type == 1) {
            var message = 'Update Data Valid';
            var type_valid = 1;
        }
    }

    app.dialog.confirm('' + message + ' ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-shipment",
                dataType: "JSON",
                data: {
                    penjualan_id: $("#penjualan_id_notif_alamat").val(),
                    valid: type_valid
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        if (type_valid == 1) {
                            packingProcess();
                        } else {
                            app.dialog.alert('Berhasil Update Data');
                            getViewNotifManagerShipment();
                            app.popup.close();
                        }
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        getViewNotifManagerShipment();
                        app.popup.close();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    app.popup.close();
                }
            });

        }
    });
}

function UpdateValidNotifRejectShipment() {
    app.dialog.confirm('Update Data Reject ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/update-valid-notif-shipment",
                dataType: "JSON",
                data: {
                    penjualan_id: $("#penjualan_id_notif_alamat").val(),
                    keterangan: $("#keterangan_valid_shipment").val(),
                    valid: 2,
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'success') {
                        app.dialog.alert('Berhasil Update Data');
                        $("#keterangan_valid_shipment").val('');
                        jQuery("#back-input-alamat-kirim-notif").click();
                        app.popup.close();
                        getViewNotifManagerShipment();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Update Data');
                        $("#keterangan_valid_shipment").val('');
                        jQuery("#back-input-alamat-kirim-notif").click();
                        app.popup.close();
                        getViewNotifManagerShipment();
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
                    jQuery("#back-input-alamat-kirim-notif").click();
                    app.popup.close();
                }
            });

        }
    });
}

function packingProcess() {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/update-packing-admin",
        dataType: 'JSON',
        data: {
            penjualan_id: $$('#penjualan_id_notif_alamat').val(),
            packing: $$('#packing-select').val()
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            if (data.status == 'success') {
                app.dialog.alert('Berhasil Update Data');
                getViewNotifManagerShipment();
                app.popup.close();
            } else if (data.status == 'failed') {
                app.dialog.alert('Gagal Update Data');
                getViewNotifManagerShipment();
                app.popup.close();
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}