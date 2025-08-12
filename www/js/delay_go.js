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
                penjualan_value += '<tr>';
                penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
                penjualan_value += '  <td style="border-bottom:1px solid gray;"><center><b>' + no_transaksi + '</b></center></td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_kota + '</td>';
                penjualan_value += '  <td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center><b>' + moment(item.penjualan_tanggal_kirim).format('DD-MMM-YY') + '</b></center></td>';
                penjualan_value += '  <td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center><b>' + tgl_req_kirim + '</b></center></td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_telp + '</td>';
                penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + alamat_kirim_penjualan + '</td>';

                penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".input-alamat-kirim-delay" onclick="shipmentNotifDelay(\'' + item.penjualan_id + '\');">Shipment</button>';
                penjualan_value += '</td>';
                penjualan_value += '</tr>';
            });

            jQuery('#data_status_notif_delay_go').html(penjualan_value);

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
			var keterangan_cabang = "";
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
				tgl_kirim_cabang = '';
				keterangan_cabang = '';
            }

            $$('#alamat_sekarang_delay_popup').val(alamat_client);
            $$('#alamat_kirim_delay_popup').val(alamat_kirim);
            $$('#kota_kirim_delay_popup').val(client_kota);
            $$('#nama-client-alamat-delay').html(client_nama);
            if (data.data.foto_produksi_selesai != null) {
                jQuery('#file_foto_produksi_selesai_delay_view').attr('src', BASE_PATH_IMAGE_BUKTI_PRODUKSI + '/' + data.data.foto_produksi_selesai);
            } else {
                jQuery('#file_foto_produksi_selesai_delay_view').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
            }
            $$('#hp_delay_alamat').val(hp_alamat);
			$$('#tgl_kirim_cabang_delay').val(tgl_kirim_cabang);
			$$('#keterangan_cabang_delay').val(keterangan_cabang);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}