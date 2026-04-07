function getYearHistoryProduksiAdmin() {
    let startYear = 2010;
    let endYear = new Date().getFullYear();
    for (i = endYear; i > startYear; i--) {
        if (i == endYear) {
			$('.point_history_years_produksi').append($('<option selected />').val(i).html(i));
		} else {
			$('.point_history_years_produksi').append($('<option />').val(i).html(i));
		}
    }
}
function kirimAlamatHistoryProduksi(penjualan_id) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-Alamat",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $("#input_alamat_kirim_history_popup")[0].reset();
        },
        success: function (data) {
            app.dialog.close();
            var alamat_client = "";
            var alamat_kirim = "";
            var client_nama = "";
            var hp_alamat = "";
            if (data.data != null) {
                alamat_client = data.data.client_alamat;
                alamat_kirim = data.data.alamat_kirim_penjualan;
                client_nama = data.data.client_nama;
                hp_alamat = data.data.client_telp;
            } else {
                alamat_client = '-';
                alamat_kirim = '-';
                client_nama = '-';
                hp_alamat = '-';
            }
            $$('#alamat_sekarang_popup_history_produksi').val(alamat_client);
            $$('#alamat_kirim_popup_history_produksi').val(alamat_kirim);
            $$('#nama-client-alamat-history-produksi').html(client_nama);
            $$('#hp_alamat_produksi').val(hp_alamat);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function changeBulanHistoryProduksi() {
    jQuery('#tanggal_akhir_point_history_produksi_menu').val('');
    historyPointProduksi();
}

function historyPointProduksi() {

    $('#btn-bukti-confirm-produksi').removeClass("btn-color-blueWhite");
    $('#btn-bukti-confirm-produksi').addClass("bg-dark-gray-young text-add-colour-black-soft");

    var point_bulan = jQuery('#point_history_produki_bulan_admin').val();
    var year = jQuery('#point_history_year_produksi').val();

    // var point_date = new Date(moment().year(), jQuery('#point_history_produki_bulan_admin').val() - 1);
    // var start_date = moment(point_date).startOf('month').format('YYYY-MM-DD');
    // var end_date = moment(point_date).endOf('month').format('YYYY-MM-DD');

    // var bulan_range = "";
    // bulan_range = document.getElementById("tanggal_akhir_point_history_produksi_menu");
    // bulan_range.setAttribute("min", start_date)
    // bulan_range.setAttribute('max', end_date)

    // var tanggal_akhir = "";
    // if (jQuery('#tanggal_akhir_point_history_produksi_menu').val() == null || jQuery('#tanggal_akhir_point_history_produksi_menu').val() == "") {
    //     tanggal_akhir = end_date;
    // } else {
    //     tanggal_akhir = jQuery('#tanggal_akhir_point_history_produksi_menu').val();
    // }



    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/donwload-point-history-produksi-cs",
        dataType: 'JSON',
        data: {
            month: point_bulan,
            year: year,
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
            // tanggal_awal: start_date,
            // tanggal_akhir: tanggal_akhir,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $('#history_point_produksi_admin').html("");
        },
        success: function (data) {
            app.dialog.close();
            var point_produksi_admin = '';
            var point_produksi_admin_total = 0;
            var no = 0;

            $.each(data.data, function (i, item) {
                no++
                var btn_detail_point_produksi = "";
                if (item.bukti_confirm != null) {
                    btn_detail_point_produksi = "btn-color-blueWhite"
                } else {
                    btn_detail_point_produksi = "bg-dark-gray-young text-add-colour-black-soft";
                }
                point_produksi_admin_total += parseFloat(item.total);
                point_produksi_admin += '<tr>';
                point_produksi_admin += '<td align="center" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                point_produksi_admin += '<td align="center" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray;" class="label-cell">' + moment(item.tanggal_awal).format('DD-MMM-YY') + '</td>';
                point_produksi_admin += '<td align="center" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray;" class="label-cell">' + moment(item.tanggal_akhir).format('DD-MMM-YY') + '</td>';
                point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.total) + '</td>';
                point_produksi_admin += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                point_produksi_admin += '   <button  class="' + btn_detail_point_produksi + ' button-small col button popup-open text-bold" data-popup=".detail-point-produksi" onclick="detailPointProduksi(\'' + item.id_point + '\',\'' + item.tanggal_awal + '\',\'' + item.tanggal_akhir + '\');">Detail</button>';
                point_produksi_admin += '</td>';
                point_produksi_admin += '</tr>';

            });


            $('#point_history_produksi_admin_total').html('Total : ' + number_format(point_produksi_admin_total));
            localStorage.setItem('point_history_produksi_admin_total', point_produksi_admin_total);
            $('#history_point_produksi_admin').html(point_produksi_admin);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function detailPointProduksi(id_point, tanggal_awal, tanggal_akhir) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/donwload-point-detail-history-produksi-new",
        dataType: 'JSON',
        data: {
            id_point: id_point,
            tanggal_awal: tanggal_awal,
            tanggal_akhir: tanggal_akhir,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $('#point_popup').html("");
        },
        success: function (data) {
            app.dialog.close();
            var point_produksi_admin = '';
            var point_produksi_admin_total = 0;
            jQuery('#show_foto_history_point_produksi').attr('src', BASE_PATH_IMAGE_BUKTI_POINT + '/' + data.data.bukti_confirm);


            $.each(data.data_penjualan, function (i, item) {

                if (item.bantuan_cabang == 'Jakarta') {
                    if (item.penjualan_jenis.indexOf("HC") != -1) {
                        var point = 100;
                    } else {
                        var point = 100;
                    }
                } else {
                    if (item.penjualan_jenis.indexOf("HC") != -1) {
                        var point = 200;
                    } else {
                        var point = 100;
                    }
                }

                if (item.bantuan_cabang != null) {
                    if (item.bantuan_cabang == 'Jakarta') {
                        var cabang = 'Xinyao';
                    } else {
                        var cabang = item.bantuan_cabang;
                    }
                } else {
                    var cabang = '-';
                }

                var alamat_kirim_penjualan = "";
                var btn_alamat_kirim_penjualan = "";
                if (item.alamat_kirim_penjualan != null) {
                    alamat_kirim_penjualan = item.alamat_kirim_penjualan;
                    btn_alamat_kirim_penjualan = "btn-color-blueWhite"
                } else {
                    alamat_kirim_penjualan = "";
                    btn_alamat_kirim_penjualan = "bg-dark-gray-young text-add-colour-black-soft";
                }

                if (item.status_produksi == 'selesai') {
                    if (item.status_pengirman == 'selesai') {
                        point_produksi_admin_total += parseFloat(item.penjualan_qty) * point;
                        point_produksi_admin += '<tr>';
                        // point_produksi_admin += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                        // point_produksi_admin += '   <button  class="' + btn_alamat_kirim_penjualan + ' button-small col button popup-open text-bold" data-popup=".input-alamat-kirim-produksi" onclick="kirimAlamatProduksi(\'' + item.penjualan_id + '\');">Kirim</button>';
                        // point_produksi_admin += '</td>';
                        point_produksi_admin += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.produksi_tanggal_selesai).format('DD-MMM') + '</td>';
                        point_produksi_admin += '<td align="left" class="popup-open" data-popup=".detail-penjualan-point-produksi" onclick="detailPenjualanPointProduksi(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
                        point_produksi_admin += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
                        point_produksi_admin += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_jenis + '</td>';

                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + point + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_qty + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(parseFloat(item.penjualan_qty) * point) + '</td>';
                        point_produksi_admin += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + cabang + ' </td>';

                        point_produksi_admin += '</tr>';

                    }
                }
            });


            $('#point_history_detail_produksi_admin_total').html('Total : ' + number_format(point_produksi_admin_total));
            $('#history_detail_point_produksi_admin').html(point_produksi_admin);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function downloadPointHistoryProduksi() {

    var point_bulan = jQuery('#point_history_produki_bulan_admin').val();
    var year = jQuery('#point_history_year_produksi').val();


    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/donwload-point-history-produksi-cs",
        dataType: 'JSON',
        data: {
            month: point_bulan,
            year: year,
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $('#history_point_produksi_admin').html("");
        },
        success: function (data) {
            app.dialog.close();
            var point_produksi_admin = '';
            var point_produksi_admin_total = 0;
            var no = 0;
            point_produksi_admin += '  <table cellspacing="1" cellpadding="1" width="100%">';
            point_produksi_admin += '  <thead class="bg-dark-gray-medium text-align-center">';
            point_produksi_admin += '    <tr>';
            point_produksi_admin += '      <th class="label-cell" style="border-top:1px solid gray; border-left:1px solid gray; border-bottom:1px solid gray;" width="6%">No</th>';
            point_produksi_admin += '      <th class="label-cell" style="border-top:1px solid gray; border-left:1px solid gray; border-bottom:1px solid gray;" width="13%">Tgl Awal</th>';
            point_produksi_admin += '      <th class="label-cell" style="border-top:1px solid gray; border-left:1px solid gray; border-bottom:1px solid gray;" width="13%">Tgl Akhir</th>';
            point_produksi_admin += '      <th class="label-cell" style="border-top:1px solid gray; border-left:1px solid gray; border-bottom:1px solid gray; border-right:1px solid gray;" width="13%">Total</th>';
            point_produksi_admin += '  </tr>';
            point_produksi_admin += ' </thead>';
            point_produksi_admin += '  <tbody class="text-align-center">';
            $.each(data.data, function (i, item) {
                no++

                point_produksi_admin_total += parseFloat(item.total);
                point_produksi_admin += '<tr>';
                point_produksi_admin += '<td align="center" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
                point_produksi_admin += '<td align="center" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray;" class="label-cell">' + moment(item.tanggal_awal).format('DD-MMM-YY') + '</td>';
                point_produksi_admin += '<td align="center" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray;" class="label-cell">' + moment(item.tanggal_akhir).format('DD-MMM-YY') + '</td>';
                point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.total) + '</td>';
                point_produksi_admin += '</tr>';

            });


            point_produksi_admin += ' <tr class="bg-dark-gray-medium text-align-center">';
            point_produksi_admin += '<td style="border-bottom:1px solid gray; border-left:1px solid gray;" colspan="3"  align="right"><b>&nbsp;&nbsp;Total</b></td>';
            point_produksi_admin += '  <td align="right"  class="label-cell" style=" border-left:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;"><b>' + number_format(point_produksi_admin_total) + '</b></td>';
            point_produksi_admin += '    </tr>';

            point_produksi_admin += '  </tbody>';
            point_produksi_admin += '  </table>';



            // $('#point_produksi_admin_total').html('Total : ' + number_format(point_produksi_admin_total));

            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'point_history_produksi_' + point_bulan + '.pdf'
            }

            pdf.fromData(point_produksi_admin, options)
                .then((stats) => console.log('status', stats))
                .catch((err) => console.err(err))
            console.log(point_produksi_admin);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function buktiPointProduksi() {
    $('#show_foto_history_point_produksi').attr('src', '');
    if (localStorage.getItem("link_foto_bukti") == null || localStorage.getItem("link_foto_bukti") == undefined || localStorage.getItem("link_foto_bukti") == 'undefined') {
        jQuery('#show_foto_history_point_produksi').attr('src', 'https://indokoper.com/noimage.jpg');

    } else {
        jQuery('#show_foto_history_point_produksi').attr('src', BASE_PATH_IMAGE_BUKTI_POINT + '/' + localStorage.getItem("link_foto_bukti"));
    }
}

