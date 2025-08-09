function selectBoxSalesConfirmProspek() {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-sales-admin-prospek",
        dataType: "JSON",
        data: {
            user_id: localStorage.getItem("user_id"),
        },
        beforeSend: function () {
        },
        success: function (data) {
            var select_box_client;
            select_box_client += '<option value="" selected>PILIH SALES</option>';
            jQuery.each(data.data, function (i, val) {
                select_box_client += '<option value="' + val.user_id + '">' + val.karyawan_nama + ' | ' + val.kota + '</option>';
            });
            $$('#sales_confirm_filter_admin').html(select_box_client);
        }
    });

    $$('.item_after_sales_confirm_filter_admin').html('PILIH SALES');
}
function selectBoxSalesProspekManager() {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-sales-admin-prospek",
        dataType: "JSON",
        data: {
            user_id: localStorage.getItem("user_id"),
        },
        beforeSend: function () {
        },
        success: function (data) {
            var select_box_client;
            select_box_client += '<option value="" selected>ALL SALES</option>';
            jQuery.each(data.data, function (i, val) {
                select_box_client += '<option value="' + val.user_id + '">' + val.karyawan_nama + ' | ' + val.kota + '</option>';
            });
            $$('#sales_filter_manager_new').html(select_box_client);
        }
    });

    $$('.item_after_sales_filter_admin').html('ALL SALES');
}
function getProspekHeaderManager() {

    if (jQuery('#sales_filter_manager_new').val() == '' || jQuery('#sales_filter_manager_new').val() == null) {
        user_id = "empty";
    } else {
        user_id = jQuery('#sales_filter_manager_new').val();
    }

    var prospek_value = "";
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-prospek-header-new",
        dataType: 'JSON',
        data: {
            user_id: user_id,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            no = 1;

            $.each(data.data, function (i, item) {

                if (item.tanggal_komunikasi == '' || item.tanggal_komunikasi == null) {
                    tanggal_komunikasi = '-';
                } else {
                    tanggal_komunikasi = moment(item.tanggal_komunikasi).format('DD-MMM');
                }

                if (item.hasil_pertemuan1 == '' || item.hasil_pertemuan1 == null) {
                    hasil_pertemuan1 = '-';
                    tanggal_1 = '-';
                } else {
                    hasil_pertemuan1 = item.hasil_pertemuan1;
                    tanggal_1 = moment(item.tanggal_status1).format('DD-MMM');
                }

                if (item.hasil_pertemuan2 == '' || item.hasil_pertemuan2 == null) {
                    hasil_pertemuan2 = '-';
                    tanggal_2 = '-';
                } else {
                    hasil_pertemuan2 = item.hasil_pertemuan2;
                    tanggal_2 = moment(item.tanggal_status2).format('DD-MMM');
                }

                if (item.hasil_pertemuan3 == '' || item.hasil_pertemuan3 == null) {
                    hasil_pertemuan3 = '-';
                    tanggal_3 = '-';
                } else {
                    hasil_pertemuan3 = item.hasil_pertemuan3;
                    tanggal_3 = moment(item.tanggal_status3).format('DD-MMM');
                }

                if (item.hasil_komunikasi == '' || item.hasil_komunikasi == null) {
                    hasil_komunikasi = '-';
                } else {
                    hasil_komunikasi = item.hasil_komunikasi;
                }
                if (item.status_kunjungan == 'LOSS') {
                    var LOSS = "selected";
                    var OK = "";
                } else {
                    var OK = "selected";
                    var LOSS = "";
                }

                prospek_value += '<tr>';
                prospek_value += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;">' + item.client_nama + '</td>';
                prospek_value += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;">' + item.karyawan_nama + '</td>';
                prospek_value += '<td style="border-left :1px solid gray; border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell ">' + tanggal_1 + '</td>';
                prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + tanggal_2 + '</td>';
                prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + tanggal_3 + '</td>';
                prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
                prospek_value += '<button onclick="detailProspekAdmin(\'' + item.lat_1 + '\',\'' + item.lng_1 + '\',\'' + item.lat_2 + '\',\'' + item.lng_2 + '\',\'' + item.lat_3 + '\',\'' + item.lng_3 + '\',\'' + item.file_selfie_card_1 + '\',\'' + item.file_selfie_card_2 + '\',\'' + item.file_selfie_card_3 + '\',\'' + item.file_id_card_1 + '\',\'' + item.file_id_card_2 + '\',\'' + item.file_id_card_3 + '\',\'' + tanggal_komunikasi + '\',\'' + hasil_komunikasi.replace(/\s/g, " ") + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.kunjungan_detail_id + '\',\'' + item.karyawan_id + '\',\'' + item.status + '\',\'' + item.tanggal_janjian + '\',\'' + item.tanggal_status1 + '\',\'' + item.tanggal_status2 + '\',\'' + item.tanggal_status3 + '\',\'' + hasil_pertemuan1.replace(/\s/g, " ") + '\',\'' + hasil_pertemuan2.replace(/\s/g, " ") + '\',\'' + hasil_pertemuan3.replace(/\s/g, " ") + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-prospek-admin">Detail</button>';
                prospek_value += '</td>';
                prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
                prospek_value += '<button onclick="getKunjunganBbmAdmin(\'' + item.kunjungan_detail_id + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".bbm-popup-admin">BBM</button>';
                prospek_value += '</td>';
                prospek_value += '</tr>';
            });
            $$('#prospek_value_manager').html(prospek_value);
            $$('#total_data_manager').html(data.data.length);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}



function detailProspekAdmin(lat_1, lng_1, lat_2, lng_2, lat_3, lng_3, file_selfie_card_1, file_selfie_card_2, file_selfie_card_3, file_id_card_1, file_id_card_2, file_id_card_3, tanggal_komunikasi, hasil_komunikasi, client_alamat, person, posisi, client_id, client_kota, client_nama, telpon, kunjungan_detail_id, karyawan_id, status, tanggal_janjian, tanggal_status1, tanggal_status2, tanggal_status3, hasil_pertemuan1, hasil_pertemuan2, hasil_pertemuan3) {


    $$('#popup-detail-prospek-tgl-komunikasi-admin').html(tanggal_komunikasi);
    $$('#popup-detail-prospek-td-client_nama-admin').html(client_nama);
    $$('#popup-detail-prospek-client_person-admin').html(person);
    $$('#popup-detail-prospek-client_kota-admin').html(client_kota);
    $$('#popup-detail-prospek-client_posisi-admin').html(posisi);
    $$('#popup-detail-prospek-client_telpon-admin').html(telpon);
    $$('#popup-detail-prospek-hasil-komunikasi-admin').html(hasil_komunikasi);
    $$('#tanggal_status1_detail_admin').val(moment(tanggal_status1).format('YYYY-MM-DD'));
    $$('#tanggal_status2_detail_admin').val(moment(tanggal_status2).format('YYYY-MM-DD'));
    $$('#tanggal_status3_detail_admin').val(moment(tanggal_status3).format('YYYY-MM-DD'));

    if (lat_1 == "null" && lat_2 == "null" && lat_3 == "null") {
        localStorage.setItem("lat_1", localStorage.getItem("lat_usr"));
        localStorage.setItem("lng_1", localStorage.getItem("lng_usr"));
        localStorage.setItem("lat_2", "-");
        localStorage.setItem("lng_2", "-");
        localStorage.setItem("lat_3", "-");
        localStorage.setItem("lng_3", "-");
    } else if (lat_1 != "-" && lat_2 == "-" && lat_3 == "-") {
        localStorage.setItem("lat_1", lat_1);
        localStorage.setItem("lng_1", lng_1);
        localStorage.setItem("lat_2", localStorage.getItem("lat_usr"));
        localStorage.setItem("lng_2", localStorage.getItem("lng_usr"));
        localStorage.setItem("lat_3", "-");
        localStorage.setItem("lng_3", "-");
    } else if (lat_1 != "-" && lat_2 != "-" && lat_3 == "-") {
        localStorage.setItem("lat_1", lat_1);
        localStorage.setItem("lng_1", lng_1);
        localStorage.setItem("lat_2", lat_2);
        localStorage.setItem("lng_2", lng_2);
        localStorage.setItem("lat_3", localStorage.getItem("lat_usr"));
        localStorage.setItem("lng_3", localStorage.getItem("lng_usr"));
    } else if (lat_1 != "-" && lat_2 != "-" && lat_3 != "-") {
        localStorage.setItem("lat_1", lat_1);
        localStorage.setItem("lng_1", lng_1);
        localStorage.setItem("lat_2", lat_2);
        localStorage.setItem("lng_2", lng_2);
        localStorage.setItem("lat_3", localStorage.getItem("lat_usr"));
        localStorage.setItem("lng_3", localStorage.getItem("lng_usr"));
    }

    if (file_id_card_1 != "-") {
        localStorage.setItem("file_id_card_1", file_id_card_1);
    } else {
        localStorage.setItem("file_id_card_1", 'null');
    }

    if (file_selfie_card_1 != "-") {
        localStorage.setItem("file_selfie_card_1", file_selfie_card_1);
    } else {
        localStorage.setItem("file_selfie_card_1", 'null');
    }

    if (file_id_card_2 != "-") {
        localStorage.setItem("file_id_card_2", file_id_card_2);
    } else {
        localStorage.setItem("file_id_card_2", 'null');
    }

    if (file_selfie_card_2 != "-") {
        localStorage.setItem("file_selfie_card_2", file_selfie_card_2);
    } else {
        localStorage.setItem("file_selfie_card_2", 'null');
    }


    if (file_id_card_3 != "-") {
        localStorage.setItem("file_id_card_3", file_id_card_3);
    } else {
        localStorage.setItem("file_id_card_3", 'null');
    }

    if (file_selfie_card_3 != "-") {
        localStorage.setItem("file_selfie_card_3", file_selfie_card_3);
    } else {
        localStorage.setItem("file_selfie_card_3", 'null');
    }

    $$('.detail_pertemuan_1_section_admin').hide();
    $$('.detail_pertemuan_2_section_admin').hide();
    $$('.detail_pertemuan_3_section_admin').hide();
    $('#hasil_pertemuan1_detail_admin').removeClass('required');
    $('#tanggal_status1_detail_admin').removeClass('required');
    $('#hasil_pertemuan2_detail_admin').removeClass('required');
    $('#tanggal_status2_detail_admin').removeClass('required');
    $('#hasil_pertemuan3_detail_admin').removeClass('required');
    $('#tanggal_status3_detail_admin').removeClass('required');

    var no_kunjungan = 1;

    if (hasil_pertemuan1 != "-") {
        no_kunjungan = 2;
        $$('.detail_pertemuan_2_section_admin').show();
        $('#hasil_pertemuan2_detail_admin').addClass('required');
        $('#tanggal_status2_detail_admin').addClass('required');
        $$("#file_id_card_1_view_detail_admin").attr("src", "");
        $$("#file_selfie_card_1_view_detail_admin").attr("src", "");
        $('#hasil_pertemuan1_detail_admin').val(hasil_pertemuan1);
        $('#hasil_pertemuan1_detail_admin').prop('readonly', true);
        $('#tanggal_status1_detail_admin').prop('readonly', true);
        $('#file_id_card_1_admin').hide();
        $('#file_selfie_card_1_admin').hide();

        var lokasi_1 = "";
        lokasi_1 += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
        lokasi_1 += 'src="https://maps.google.com/maps?q=' + lat_1 + ',' + lng_1 + '&hl=id&z=14&amp;output=embed">';
        lokasi_1 += '</iframe>';

        if (lat_1 != 'null' && lng_1 != 'null' || lat_1 != '-' && lng_1 != '-') {
            jQuery("#lokasi1_detail_admin").html(lokasi_1);
        } else {
            jQuery("#lokasi1_detail_admin").html("Lokasi Tidak Ada");
        }

        $$("#file_id_card_1_view_detail_admin").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_1);
        $$("#file_selfie_card_1_view_detail_admin").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_1);
        $('.keterangan_foto1_admin').show();

    } else {
        $$("#file_id_card_1_view_detail_admin").attr("src", "");
        $$("#file_selfie_card_1_view_detail_admin").attr("src", "");
        $('#hasil_pertemuan1_detail_admin').val('');
        $('#hasil_pertemuan1_detail_admin').addClass('required');
        $('#tanggal_status1_detail_admin').addClass('required');
        $('#hasil_pertemuan1_detail_admin').prop('readonly', false);
        $('#tanggal_status1_detail_admin').prop('readonly', true);
        document.getElementById('tanggal_status1_detail_admin').value = '-';
        $('#file_id_card_1_admin').show();
        $('#file_selfie_card_1_admin').show();
        $('.keterangan_foto1_admin').hide();
        $$("#file_selfie_card_1_view_detail_admin").attr("src", "");
    }

    if (hasil_pertemuan2 != "-") {
        no_kunjungan = 3;
        $$('.detail_pertemuan_3_section_admin').show();
        $('#hasil_pertemuan3_detail_admin').addClass('required');
        $('#tanggal_status3_detail_admin').addClass('required');
        $$("#file_selfie_card_2_view_detail_admin").attr("src", "");
        $$("#file_id_card_2_view_detail_admin").attr("src", "");
        $('#hasil_pertemuan2_detail_admin').val(hasil_pertemuan2);
        $('#hasil_pertemuan2_detail_admin').prop('readonly', true);
        $('#tanggal_status2_detail_admin').prop('readonly', true);
        $('#file_id_card_2_admin').hide();
        $('#file_selfie_card_2_admin').hide();
        $$("#file_id_card_2_view_detail_admin").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_2);
        $$("#file_selfie_card_2_view_detail_admin").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_2);
        var lokasi_2 = "";
        lokasi_2 += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
        lokasi_2 += 'src="https://maps.google.com/maps?q=' + lat_2 + ',' + lng_2 + '&hl=id&z=14&amp;output=embed">';
        lokasi_2 += '</iframe>';

        if (lat_2 != 'null' && lng_2 != 'null' || lat_2 != '-' && lng_2 != '-') {
            jQuery("#lokasi2_detail_admin").html(lokasi_2);
        } else {
            jQuery("#lokasi2_detail_admin").html("Lokasi Tidak Ada");
        }
        $('.keterangan_foto2_admin').show();
        $('#hasil_pertemuan2_detail_admin').removeClass('required');
        $('#tanggal_status2_detail_admin').removeClass('required');
    } else {
        $$("#file_id_card_2_view_detail_admin").attr("src", "");
        $$("#file_selfie_card_2_view_detail_admin").attr("src", "");
        $('#hasil_pertemuan2_detail_admin').val('');
        $('#hasil_pertemuan2_detail_admin').prop('readonly', false);
        $('#tanggal_status2_detail_admin').prop('readonly', true);
        document.getElementById('tanggal_status2_detail_admin').value = '-';
        $('#file_id_card_2_admin').show();
        $('#file_selfie_card_2_admin').show();
        $('.keterangan_foto2_admin').hide();
        $$("#file_selfie_card_2_view_detail_admin").attr("src", "");
    }

    if (hasil_pertemuan3 != "-") {
        no_kunjungan = 3;
        $$("#file_id_card_3_view_detai_adminl").attr("src", "");
        $$("#file_selfie_card_3_view_detail_admin").attr("src", "");
        $('#hasil_pertemuan3_detail_admin').val(hasil_pertemuan3);
        $('#hasil_pertemuan3_detail_admin').prop('readonly', true);
        $('#tanggal_status3_detail_admin').prop('readonly', true);
        $('#file_id_card_3_admin').hide();
        $('#file_selfie_card_3_admin').hide();
        $$("#file_id_card_3_view_detail_admin").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_3);
        $$("#file_selfie_card_3_view_detail_admin").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_3);
        $('.keterangan_foto3_admin').show();
        var lokasi_3 = "";
        lokasi_3 += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
        lokasi_3 += 'src="https://maps.google.com/maps?q=' + lat_3 + ',' + lng_3 + '&hl=id&z=14&amp;output=embed">';
        lokasi_3 += '</iframe>';

        if (lat_3 != 'null' && lng_3 != 'null' || lat_3 != '-' && lng_3 != '-') {
            jQuery("#lokasi3_detail_admin").html(lokasi_3);
        } else {
            jQuery("#lokasi3_detail_admin").html("Lokasi Tidak Ada");
        }
        $$('#hasil_pertemuan3_detail_admin').removeClass('required');
        $$('#tanggal_status3_detail_admin').removeClass('required');
        $$(".div_janjian_admin").hide();
    } else {
        $$("#file_id_card_3_view_detail_admin").attr("src", "");
        $$("#file_selfie_card_3_view_detail_admin").attr("src", "");
        $('#hasil_pertemuan3_detail_admin').val('');
        $('#hasil_pertemuan3_detail_admin').prop('readonly', false);
        $('#tanggal_status3_detail_admin').prop('readonly', true);
        document.getElementById('tanggal_status3_detail_admin').value = '-';
        $$(".div_janjian_admin").show();
        $('#file_id_card_3_admin').show();
        $('#file_selfie_card_3_admin').show();
        $('.keterangan_foto3_admin').hide();
        $$("#file_selfie_card_3_view_detail_admin").attr("src", "");
    }
}

function getKunjunganBbmAdmin(kunjungan_detail_id) {
    var bbm_value = "";
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-kunjungan-bbm-admin",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            kunjungan_detail_id: kunjungan_detail_id,
        },
        beforeSend: function () {
            $$('#bbm_values_admin').html('');
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            no = 0;
            var total_nominal = 0;
            var color_confirm = '';
            localStorage.setItem('kunjungan_detail_id', kunjungan_detail_id);
            $.each(data.data, function (i, item) {
                no++
                if (item.foto_confirm_bbm != null) {
                    color_confirm = 'btn-color-blueWhite';
                } else {
                    color_confirm = 'text-add-colour-black-soft bg-dark-gray-young';
                }
                bbm_value += '<tr>';
                bbm_value += '<td align="center" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;border-right :1px solid gray;">' + no + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell ">' + moment(item.tanggal_bbm).format('DD/MM/YY') + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + item.no_plat + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell" align="right">' + number_format(item.nominal_bbm) + '</td>';
                bbm_value += '</tr>';
                total_nominal += parseInt(item.nominal_bbm);
            });
            bbm_value += '<tr>';
            bbm_value += '<td colspan="4" align="right"><b>TOTAL</b></td>';
            bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;border-left :1px solid gray;" class="label-cell" align="right">' + number_format(total_nominal) + '</td>';
            bbm_value += '</tr>';
            $$('#bbm_values_admin').html(bbm_value);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function showFotoBbmAdmin(foto_bbm, tanggal_nota) {

    $$('#tanggal_nota_admin').html(moment(tanggal_nota).format('DD/MM/YY'));
    if (foto_bbm != null) {
        $$("#show_foto_bbm_admin").attr("src", BASE_PATH_IMAGE_BBM + '/' + foto_bbm);
    } else {
        $$("#show_foto_bbm_admin").attr("src", "https://tasindo-sale-webservice.digiseminar.id/noimage.jpg");
    }
}


function confirmBbmAdmin(id_kunjungan_bbm) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-detail-kunjungan-bbm-admin",
        dataType: 'JSON',
        data: {
            id_kunjungan_bbm: id_kunjungan_bbm,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            $$("#id_kunjungan_bbm").val(id_kunjungan_bbm);
            if (data.data.foto_bbm != null) {
                $$("#show_foto_nota_bbm_admin").attr("src", BASE_PATH_IMAGE_BBM + '/' + data.data.foto_bbm);
            } else {
                $$("#show_foto_nota_bbm_admin").attr("src", "https://tasindo-sale-webservice.digiseminar.id/noimage.jpg");
            }
            if (data.data.foto_confirm_bbm != null) {
                $$("#confirm_bbm_button_save").hide();
                $$("#bukti_pembayaran_bbm").show();
                $$("#show_foto_confirm_bbm_admin").attr("src", BASE_PATH_IMAGE_CONFIRM_BBM + '/' + data.data.foto_confirm_bbm);
            } else {
                $$("#confirm_bbm_button_save").show();
                $$("#bukti_pembayaran_bbm").hide();
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });

}


function validBbmAdmin(id_kunjungan_bbm) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-detail-kunjungan-bbm-admin",
        dataType: 'JSON',
        data: {
            id_kunjungan_bbm: id_kunjungan_bbm,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            $$("#id_kunjungan_bbm_valid").val(id_kunjungan_bbm);
            if (data.data.foto_bbm != null) {
                $$("#show_foto_nota_bbm_admin_valid").attr("src", BASE_PATH_IMAGE_BBM + '/' + data.data.foto_bbm);
            } else {
                $$("#show_foto_nota_bbm_admin_valid").attr("src", "https://tasindo-sale-webservice.digiseminar.id/noimage.jpg");
            }
            if (data.data.valid_bbm != 0) {
                $$("#validasi_bbm_button_save").hide();
            } else {
                $$("#validasi_bbm_button_save").show();
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });

}


function getValidasiBbmAdmin() {
    if (jQuery('#sales_confirm_filter_admin').val() == '' || jQuery('#sales_confirm_filter_admin').val() == null) {
        user_id = "empty";
    } else {
        user_id = jQuery('#sales_confirm_filter_admin').val();
    }
    var bbm_value = "";
    if (jQuery('#sales_confirm_filter_admin').val() == '') {
        $$('#prospek_valid_value_admin').html('<tr><td colspan="6">Silahkan Pilih Sales</td></tr>');
    } else {

        jQuery.ajax({
            type: 'POST',
            url: "" + BASE_API + "/get-validasi-bbm-admin",
            dataType: 'JSON',
            data: {
                user_id: user_id,
            },
            beforeSend: function () {
                $$('#prospek_valid_value_admin').html('');
                app.dialog.preloader('Harap Tunggu');
            },
            success: function (data) {
                app.dialog.close();
                no = 0;
                var total_nominal = 0;
                var color_confirm = '';
                var color_row = '';
                $.each(data.data, function (i, item) {
                    no++
                    if (item.valid_bbm != 0) {
                        color_confirm = 'btn-color-blueWhite';
                        color_row = 'btn-color-blueWhite';
                    } else {
                        color_confirm = 'text-add-colour-black-soft bg-dark-gray-young';
                        color_row = '';
                    }
                    bbm_value += '<tr class="' + color_row + '">';
                    bbm_value += '<td align="center" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;border-right :1px solid gray;">' + no + '</td>';
                    bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell ">' + moment(item.tanggal_bbm).format('DD/MM/YY') + '</td>';
                    bbm_value += '<td align="left" style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    bbm_value += '<td align="left" style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                    bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + item.no_plat + '</td>';
                    bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell" align="right">' + number_format(item.nominal_bbm) + '</td>';
                    bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
                    bbm_value += '<button onclick="validBbmAdmin(\'' + item.id_kunjungan_bbm + '\')" class="' + color_confirm + ' button-small col button popup-open text-bold" data-popup=".validasi-bbm-admin">Valid</button>';
                    bbm_value += '</td>';
                    bbm_value += '</tr>';
                    total_nominal += parseInt(item.nominal_bbm);
                });
                bbm_value += '<tr>';
                bbm_value += '<td colspan="5" align="right"><b>TOTAL</b></td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;border-left :1px solid gray;" class="label-cell" align="right">' + number_format(total_nominal) + '</td>';
                bbm_value += '</tr>';
                $$('#prospek_valid_value_admin').html(bbm_value);
                $$('#total_data_valid_admin').html(data.data.length);
            },
            error: function (xmlhttprequest, textstatus, message) {
            }
        });
    }
}

function getHistoryBbmAdmin() {

    var bbm_value = "";
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-history-bbm-admin",
        dataType: 'JSON',
        data: {
            user_id: user_id,
        },
        beforeSend: function () {
            $$('#history_bbm_values_admin').html('');
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            no = 0;
            $.each(data.data, function (i, item) {
                no++
                bbm_value += '<tr>';
                bbm_value += '<td align="center" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;border-right :1px solid gray;">' + no + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell ">' + moment(item.tanggal_awal).format('DD/MM/YY') + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell ">' + moment(item.tanggal_akhir).format('DD/MM/YY') + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell" align="right">' + number_format(item.nominal) + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
                bbm_value += '<button onclick="showFotoHistoryBbmAdmin(\'' + item.bukti_confirm + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".show-foto-hsitory-bbm-confirm-admin">Foto</button>';
                bbm_value += '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
                bbm_value += '<button onclick="historyDetailBbmAdmin(\'' + item.tanggal_awal + '\',\'' + item.tanggal_akhir + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".history-detail-bbm-admin">Detail</button>';
                bbm_value += '</td>';
                bbm_value += '</tr>';
            });
            $$('#history_bbm_values_admin').html(bbm_value);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function backtoHistoryAll() {
    getHistoryBbmAdmin();
}

function historyDetailBbmAdmin(tanggal_awal, tanggal_akhir) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-history-detail-bbm-admin",
        dataType: 'JSON',
        data: {
            tanggal_awal: tanggal_awal,
            tanggal_akhir: tanggal_akhir
        },
        beforeSend: function () {
            $$('#history_bbm_values_admin').html('');
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            no = 0;
            var total_nominal = 0;
            var color_confirm = '';
            var bbm_value = '';
            $.each(data.data, function (i, item) {
                no++
                if (item.valid_bbm != 0) {
                    color_confirm = 'btn-color-blueWhite';
                } else {
                    color_confirm = 'text-add-colour-black-soft bg-dark-gray-young';
                }
                bbm_value += '<tr>';
                bbm_value += '<td align="center" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;border-right :1px solid gray;">' + no + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell ">' + moment(item.tanggal_bbm).format('DD/MM/YY') + '</td>';
                bbm_value += '<td align="left" style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                bbm_value += '<td align="left" style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + item.no_plat + '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
                bbm_value += '<button onclick="showFotoDetailBbmAdmin(\'' + item.foto_bbm + '\',\'' + item.tanggal_bbm + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".show-foto-detail-history-bbm">Foto</button>';
                bbm_value += '</td>';
                bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell" align="right">' + number_format(item.nominal_bbm) + '</td>';
                bbm_value += '</tr>';
                total_nominal += parseInt(item.nominal_bbm);
            });
            bbm_value += '<tr>';
            bbm_value += '<td colspan="6" align="right"><b>TOTAL</b></td>';
            bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;border-left :1px solid gray;" class="label-cell" align="right">' + number_format(total_nominal) + '</td>';
            bbm_value += '</tr>';
            $$('#detail_bbm_valid_value_admin').html(bbm_value);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function showFotoDetailBbmAdmin(foto_bbm, tanggal_nota) {

    $$('#tanggal_nota_admin_confirm').html(moment(tanggal_nota).format('DD/MM/YY'));
    if (foto_bbm != null) {
        $$("#foto_detail_history_bbm").attr("src", BASE_PATH_IMAGE_BBM + '/' + foto_bbm);
    } else {
        $$("#foto_detail_history_bbm").attr("src", "https://tasindo-sale-webservice.digiseminar.id/noimage.jpg");
    }
}

function showFotoHistoryBbmAdmin(foto_bbm) {

    if (foto_bbm != null) {
        $$("#show_foto_history_bbm_admin").attr("src", BASE_PATH_IMAGE_CONFIRM_BBM + '/' + foto_bbm);
    } else {
        $$("#show_foto_history_bbm_admin").attr("src", "https://tasindo-sale-webservice.digiseminar.id/noimage.jpg");
    }
}

function validationBbm() {
    app.dialog.create({
        title: 'Validasi BBM',
        text: 'Apakah Anda Yakin Validasi Data ini ? ',
        cssClass: 'custom-dialog',
        closeByBackdropClick: 'true',
        buttons: [
            {
                text: 'Ya',
                onClick: function () {
                    jQuery.ajax({
                        type: 'POST',
                        url: "" + BASE_API + "/update-valid-bbm",
                        dataType: 'JSON',
                        data: {
                            id_kunjungan_bbm: $$("#id_kunjungan_bbm_valid").val(),
                            karyawan_nama: localStorage.getItem("karyawan_nama"),
                        },
                        beforeSend: function () {
                            app.dialog.preloader('Harap Tunggu');
                        },
                        success: function (data) {
                            app.dialog.close();
                            getValidasiBbmAdmin();
                            app.popup.close();
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

//Config Get Image From Camera
function setOptionsBbm(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}

function getFileEntryBbm(imgUri) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

        // Do something with the FileEntry object, like write to it, upload it, etc.
        // writeFile(fileEntry, imgUri);
        alert("got file: " + fileEntry.nativeURL);
        // displayFileData(fileEntry.nativeURL, "Native URL");

    }, function () {
        // If don't get the FileEntry (which may happen when testing
        // on some emulators), copy to a new FileEntry.
        createNewFileEntryBbm(imgUri);
    });
}

function getFileContentAsBase64Bbm(path, callback) {
    window.resolveLocalFileSystemURL(path, gotFile, fail);

    function fail(e) {
        alert('Cannot found requested file');
    }

    function gotFile(fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                var content = this.result;
                callback(content);
            };
            // The most important point, use the readAsDatURL Method from the file plugin
            reader.readAsDataURL(file);
        });
    }
}


function createNewFileEntryBbm(imgUri) {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {
        // JPEG file
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {
            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            alert("got file file entry: " + fileEntry.fullPath);

            // displayFileData(fileEntry.fullPath, "File copied to");
        }, onErrorCreateFile);
    }, onErrorResolveUrl);
}


function openCameraBbm(selection) {
    app.dialog.confirm('Yakin Konfirmasi BBM ini ?', function () {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = setOptionsBbm(srcType);
        var func = createNewFileEntryBbm;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            // displayImage(imageUri);
            // // You may choose to copy the picture, save it somewhere, or upload.

            getFileContentAsBase64Bbm(imageUri, function (base64Image) {
                //window.open(base64Image);
                localStorage.setItem("confirm_foto_bbm", base64Image);
                confirmFotoBbm();

                // Then you'll be able to handle the myimage.png file as base64
            });

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");
            alert("Unable to obtain picture: ");

        }, options);

    });
}


function confirmFotoBbm() {
    if (localStorage.getItem("internet_koneksi") == 'fail') {
        app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
        });
    } else {
        if (localStorage.getItem("confirm_foto_bbm") != null || localStorage.getItem("confirm_foto_bbm") != 'null' || localStorage.getItem("confirm_foto_bbm") != '') {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/confirm-bbm-admin",
                dataType: "JSON",
                data: {
                    karyawan_nama: localStorage.getItem("karyawan_nama"),
                    confirm_foto_bbm: localStorage.getItem("confirm_foto_bbm"),
                    user_id: jQuery('#sales_confirm_filter_admin').val(),
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.status == 'done') {
                        app.dialog.alert('Berhasil Konfirmasi BBM');
                        return app.views.main.router.navigate('/confirm_bbm');
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Konfirmasi BBM');
                    }
                }
            });
        } else {
            app.dialog.alert('Silahkan Foto Bukti Pembayaran BBM');
        }
    }
}