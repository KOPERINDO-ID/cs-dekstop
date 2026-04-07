function changeFilterSubMenu(menu) {
    $$('.pointSalesFilterMenu').removeClass('bg-dark-gray-orange');
    $$('.komisiFilterMenu').removeClass('bg-dark-gray-orange');
    $$('.emoneyFilterMenu').removeClass('bg-dark-gray-orange');

    switch (menu) {
        case 'komisi':
            $$('#submenu-point-sales').hide();
            $$('#submenu-emoney').hide();
            $$('.komisiFilterMenu').addClass('bg-dark-gray-orange');
            $$('#submenu-komisi').show();
            getDataKomisi();
            break;
        case 'emoney':
            $$('#submenu-point-sales').hide();
            $$('#submenu-komisi').hide();
            $$('.emoneyFilterMenu').addClass('bg-dark-gray-orange');
            $$('#submenu-emoney').show();
            getDataEmoney();
            break;
        default:
            $$('#submenu-emoney').hide();
            $$('#submenu-komisi').hide();
            $$('.pointSalesFilterMenu').addClass('bg-dark-gray-orange');
            $$('#submenu-point-sales').show();
            break;
    }
}

function pointSalesClick(karyawan_id, karyawan_nama) {
    jQuery('#karyawan_nama_hidden').val(karyawan_nama);
    jQuery('#karyawan_id_hidden').val(karyawan_id);
    jQuery('#point_bulan').val();
    jQuery('#point_year').val();
    pointSales();
}

function createNewFileEntrySales(imgUri) {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {
        // JPEG file
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {
            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            console.log("got file: " + fileEntry.fullPath);
            alert(fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to");
        }, onErrorCreateFile);
    }, onErrorResolveUrl);
}

function getFileEntrySales(imgUri) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

        // Do something with the FileEntry object, like write to it, upload it, etc.
        // writeFile(fileEntry, imgUri);
        alert("got file: " + fileEntry.nativeURL);
        // displayFileData(fileEntry.nativeURL, "Native URL");

    }, function () {
        // If don't get the FileEntry (which may happen when testing
        // on some emulators), copy to a new FileEntry.
        createNewFileEntrySales(imgUri);
    });
}

function toDataURLSales(path, callback) {
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

function openCameraFotoPoint(id) {
    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptionsSales(srcType);
    var func = createNewFileEntrySales;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
        // displayImage(imageUri);
        // // You may choose to copy the picture, save it somewhere, or upload.

        // alert(imageUri);
        toDataURLSales(imageUri, function (base64Image) {
            //window.open(base64Image);
            $$("#" + id + "_view").attr("src", base64Image);
            $$("#" + id).hide();
            localStorage.setItem(id, base64Image);

            // Then you'll be able to handle the myimage.png file as base64
        });

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");
        alert("Unable to obtain picture: ");

    }, options);
}

function setOptionsSales(srcType) {
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

function zoom_view(src) {
    console.log('KLIK');
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

function detailSalesAdmin(nama, hp, alamat) {
    jQuery('#nama_sales').html(nama);
    jQuery('#no_hp_sales').html(hp);
    jQuery('#alamat_sales').html(alamat);
}

function uploadFotoPoint(penjualan_id, bulan, tahun, isi_foto, id_pembayaran_point) {
    getDataFotoPoint(id_pembayaran_point);
}


function uploadFotoLunasPoint(penjualan_id, bulan, tahun, isi_foto, id_pembayaran_point) {
    getDataFotoPoint(id_pembayaran_point);
}

function getDataFotoPoint(id_pembayaran_point) {
    var BASE_PATH_IMAGE_FOTO_POINT = BASE_API.replace('/api', '');
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-foto-point",
        dataType: 'JSON',
        data: {
            id_pembayaran_point: id_pembayaran_point,
        },
        beforeSend: function () {
            jQuery('#btn_upload_foto_point_selesai').hide();
            jQuery('#btn_upload_foto_lunas_selesai').hide();
            jQuery('#file_foto_lunas_point_view').attr('src', '');
            jQuery('#file_foto_pelunasan_view_now_point').attr('src', '');
            jQuery('#file_foto_point_view').attr('src', '');
            jQuery('#file_foto_pembayaran_view_now_point').attr('src', '');
            $$('#label_file_foto_lunas_point').html('Foto');
            $$('#file_foto_lunas_point').val('');
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            if (data.data != null) {
                localStorage.setItem("id_pembayaran_point", data.data.id_pembayaran_point);
                if (data.data.foto_lunas != null) {
                    // jQuery('#file_foto_lunas_point').hide();
                    $$('#label_file_foto_lunas_point').hide();
                    // jQuery('#file_foto_pelunasan_view_now_point').show();
                    jQuery('#file_foto_pelunasan_view_now_point').attr('src', BASE_PATH_IMAGE_FOTO_POINT + '/foto_bukti_point/' + data.data.foto_lunas);
                } else {
                    // jQuery('#file_foto_lunas_point').show();
                    // jQuery('#file_foto_pelunasan_view_now_point').hide();
                    $$('#label_file_foto_lunas_point').show();
                    $$("#file_foto_pelunasan_view_now_point").attr("src", "https://indokoper.com/noimage.jpg");
                    jQuery('#btn_upload_foto_lunas_selesai').show();
                }

                if (data.data.foto_point != null) {
                    jQuery('#file_foto_point').hide();
                    jQuery('#file_foto_pembayaran_view_now_point').show();
                    jQuery('#file_foto_pembayaran_view_now_point').attr('src', BASE_PATH_IMAGE_FOTO_POINT + '/foto_bukti_point/' + data.data.foto_point);
                } else {
                    jQuery('#file_foto_point').show();
                    jQuery('#file_foto_pembayaran_view_now_point').hide();
                    jQuery('#btn_upload_foto_point_selesai').show();
                }
            } else {

                localStorage.setItem("id_pembayaran_point", null);
                // jQuery('#file_foto_lunas_point').show();
                // jQuery('#file_foto_pelunasan_view_now_point').hide();
                $$("#file_foto_pelunasan_view_now_point").attr("src", "https://indokoper.com/noimage.jpg");
                jQuery('#btn_upload_foto_lunas_selesai').show();
                jQuery('#file_foto_point').show();
                $$('#label_file_foto_lunas_point').show();
                jQuery('#file_foto_pembayaran_view_now_point').hide();
                jQuery('#btn_upload_foto_point_selesai').show();
            }


        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function updateFotoPointProcess() {
    var formData = new FormData(jQuery("#upload_foto_point")[0]);
    formData.append('file_foto_point', localStorage.getItem("file_foto_point"));
    formData.append('karyawan_id', jQuery("#karyawan_id_hidden").val());
    formData.append('bulan', jQuery("#point_bulan_admin").val());
    formData.append('tahun', jQuery('#point_year').val());
    formData.append('id_pembayaran_point', localStorage.getItem("id_pembayaran_point"));


    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/update-file-foto-point",
        dataType: "JSON",
        data: formData,
        contentType: false,
        processData: false,
        xhr: function () {
            var dialog = app.dialog.progress('Loading ', 0);
            dialog.setText('0%');
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {

                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    dialog.setProgress(Math.round(percentComplete * 100));
                    dialog.setText('' + (Math.round(percentComplete * 100)) + '%');
                }

            }, false);
            return xhr;
        },
        success: function (data) {
            app.dialog.close();
            if (data.status == 'done') {
                pointSales();
                $('#upload_foto_btn_close').click();
                app.dialog.alert('Berhasil update foto');
            } else if (data.status == 'failed') {
                app.dialog.alert('Gagal Update Foto');
            } else if (data.status == 'gagal') {
                app.dialog.alert('Harap Isi Foto');
            }
        }
    });
}

function updateFotoLunasPointProcess() {
    var formData = new FormData(jQuery('#upload_foto_lunas_point_admin')[0]);
    // formData.append('file_foto_lunas_point', localStorage.getItem("file_foto_lunas_point"));

    var file = $('#file_foto_lunas_point').get(0).files[0];
    formData.append('file_foto_lunas_point', file);
    formData.append('karyawan_id', jQuery("#karyawan_id_hidden").val());
    formData.append('bulan', jQuery("#point_bulan_admin").val());
    formData.append('tahun', jQuery('#point_year').val());
    formData.append('id_pembayaran_point', localStorage.getItem("id_pembayaran_point"));


    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/update-file-foto-lunas-point",
        dataType: "JSON",
        data: formData,
        contentType: false,
        processData: false,
        xhr: function () {
            var dialog = app.dialog.progress('Loading ', 0);
            dialog.setText('0%');
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {

                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    dialog.setProgress(Math.round(percentComplete * 100));
                    dialog.setText('' + (Math.round(percentComplete * 100)) + '%');
                }

            }, false);
            return xhr;
        },
        success: function (data) {
            app.dialog.close();
            if (data.status == 'done') {
                pointSales();
                $('#upload_foto_lunas_btn_close').click();
                $$('#label_file_foto_lunas_point').html('Foto');
                $$('#file_foto_lunas_point').val('');
                app.dialog.alert('Berhasil update foto');
            } else if (data.status == 'failed') {
                app.dialog.alert('Gagal Update Foto');
            } else if (data.status == 'gagal') {
                app.dialog.alert('Harap Isi Foto');
            }
        }
    });
}

function detailPenjualanOwner(penjualan_id) {
    detail_sales_data = '';

    var base_server = BASE_API;
    var image_server = base_server.replace('/api', '');
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-penjualan-detail-performa",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            penjualan_id: penjualan_id
        },
        beforeSend: function () {
            $$('#detail_sales_data').html('');
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {


            app.dialog.close();
            console.log(data.data.length);
            if (data.data.length != 0) {
                jQuery.each(data.data, function (i, val) {
                    var no = i + 1;
                    detail_sales_data += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
                    detail_sales_data += '<tbody>';
                    detail_sales_data += ' <tr class="bg-dark-gray-medium">';
                    detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
                    detail_sales_data += '   Produk #' + no + '';
                    detail_sales_data += ' </td>';
                    detail_sales_data += '</tr>';
                    if (val.keterangan != null) {
                        var keterangan_fix = val.keterangan;
                    } else {
                        var keterangan_fix = '';
                    }

                    if (val.gambar.substring(0, 5) == "koper") {
                        var path_image = image_server + '/product_image_new/';
                    } else {
                        var path_image = image_server + '/performa_image/';
                    }
                    detail_sales_data += ' <tr>';
                    detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br><img data-image-src="' + path_image + val.gambar + '" class="pb-popup-dark" src="' + path_image + val.gambar + '" width="100%"></td>';
                    detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="60%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br><font color="red">' + keterangan_fix + '</font></td>';
                    detail_sales_data += '</tr>';
                    detail_sales_data += ' <tr class="">';
                    detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">Qty : ' + val.penjualan_qty + '</td>';
                    detail_sales_data += ' </tr>';
                    detail_sales_data += '</tbody>';
                    detail_sales_data += '</table><br>';
                });

                detail_sales_data += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
                detail_sales_data += '<tbody>';
                detail_sales_data += ' <tr class="bg-dark-gray-medium">';
                detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
                detail_sales_data += '   Customer Logo';
                detail_sales_data += ' </td>';
                detail_sales_data += '</tr>';
                detail_sales_data += ' <tr >';
                detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
                detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo + '" />';
                detail_sales_data += ' </td>';
                detail_sales_data += '</tr>';
                detail_sales_data += ' <tr class="bg-dark-gray-medium">';
                detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
                detail_sales_data += '   Logo Bordir';
                detail_sales_data += ' </td>';
                detail_sales_data += '</tr>';
                detail_sales_data += ' <tr >';
                detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
                detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo_bordir + '" />';
                detail_sales_data += ' </td>';
                detail_sales_data += '</tr>';

                if (data.data[0].customer_logo_tambahan != "") {
                    detail_sales_data += ' <tr class="bg-dark-gray-medium">';
                    detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
                    detail_sales_data += '   Logo Tambahan';
                    detail_sales_data += ' </td>';
                    detail_sales_data += '</tr>';
                    detail_sales_data += ' <tr >';
                    detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
                    detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo_tambahan + '" />';
                    detail_sales_data += ' </td>';
                    detail_sales_data += '</tr>';
                }
                detail_sales_data += '</table>';




                $$('#detail_sales_data_owner').html(detail_sales_data);
            } else {
                $$('#detail_sales_data_owner').html('<center><h3>Tidak Ada Data</h3></center>');
            }

            $$('.pb-popup-dark').on('click', function () {
                console.log($$(this).attr("data-image-src"));
                var gambar_zoom = $$(this).attr("data-image-src");
                var myPhotoBrowserPopupDark = app.photoBrowser.create({
                    photos: [
                        '' + gambar_zoom + ''
                    ],
                    theme: 'dark',
                    type: 'popup'
                });
                myPhotoBrowserPopupDark.open();
            });
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });

}

function downloadPointSales() {
    jQuery('#karyawan_nama_point').html(jQuery('#karyawan_nama_hidden').val());

    var base_server = jQuery('#server_pilihan_master_Sales').val();
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/download-point-admin",
        dataType: 'JSON',
        data: {
            karyawan_id: jQuery('#karyawan_id_hidden').val(),
            month: jQuery('#point_bulan_admin').val(),
            year: jQuery('#point_year').val()
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $('#point_popup').html("");
        },
        success: function (data) {
            app.dialog.close();
            var point_popup = '';
            var no = 0;
            var jumlah_point_sales = 0;
            var total_point_sales = 0;
            console.log(data.foto);

            point_popup += '  <table cellspacing="1" cellpadding="1" width="100%">';
            point_popup += '  <thead class="bg-dark-gray-medium text-align-center">';

            point_popup += '    <tr>';
            point_popup += '      <th class="label-cell" style="border-bottom:1px solid gray; border-left:1px solid gray; border-top:1px solid gray;" width="14%">Tgl</th>';
            point_popup += '      <th class="label-cell" style="border-bottom:1px solid gray; border-left:1px solid gray; border-top:1px solid gray;" width="23%">SPK</th>';
            point_popup += '     <th class="label-cell" style="border-bottom:1px solid gray; border-left:1px solid gray; border-top:1px solid gray;" width="26%">Perusahaan</th>';

            point_popup += '      <th class="label-cell" style="border-bottom:1px solid gray; border-left:1px solid gray; border-top:1px solid gray;" width="14%">Nilai Jual</th>';
            point_popup += '   <th class="label-cell" style="border-bottom:1px solid gray; border-left:1px solid gray; border-top:1px solid gray;" width="11%">%</th>';
            point_popup += '    <th class="label-cell" style="border-bottom:1px solid gray; border-right:1px solid gray; border-left:1px solid gray; border-top:1px solid gray;" width="11%">Total</th>';
            point_popup += '    </tr>';
            point_popup += '  </thead>';
            point_popup += '   <tbody class="text-align-center">';


            $.each(data.data, function (i, item) {
                no++
                if (item.point_valid_manager == 1) {
                    total_point_sales += parseFloat(item.penjualan_grandtotal);
                    jumlah_point_sales += (parseFloat(item.penjualan_grandtotal) * item.presentase_omset) / 100;
                }
                var kurang_bayar = parseFloat(item.penjualan_grandtotal - item.penjualan_jumlah_pembayaran);
                var count_foto_bayar_miss = 0;
                var text_foto_bayar_miss = "";



                point_popup += '<tr>';
                point_popup += '<td style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" align="center" class="label-cell">' + no + '</td>';
                point_popup += '<td style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.penjualan_tanggal).format('DD-MMM') + '</td>';
                point_popup += '<td class="popup-open" data-popup=".detail-sales-owner" onclick="detailPenjualanOwner(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                point_popup += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
                // point_popup += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                // point_popup += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-pembayaran-owner" onclick="detailPembayaranOwner(\'' + item.penjualan_tanggal + '\',\'' + item.performa_id_relation + '\',\'' + item.bank_1 + '\',\'' + item.bank_2 + '\',\'' + item.bank_3 + '\',\'' + item.bank_4 + '\',\'' + item.bank_5 + '\',\'' + item.bank_6 + '\',\'' + item.bank_7 + '\',\'' + item.bank_8 + '\',\'' + item.bank_9 + '\',\'' + item.bank_10 + '\',\'' + item.pembayaran1_tgl + '\',\'' + item.pembayaran2_tgl + '\',\'' + item.pembayaran3_tgl + '\',\'' + item.pembayaran4_tgl + '\',\'' + item.pembayaran5_tgl + '\',\'' + item.pembayaran6_tgl + '\',\'' + item.pembayaran7_tgl + '\',\'' + item.pembayaran8_tgl + '\',\'' + item.pembayaran9_tgl + '\',\'' + item.pembayaran10_tgl + '\',\'' + item.bank + '\',\'' + item.pembayaran_1 + '\',\'' + item.pembayaran_2 + '\',\'' + item.pembayaran_3 + '\',\'' + item.pembayaran_4 + '\',\'' + item.pembayaran_5 + '\',\'' + item.pembayaran_6 + '\',\'' + item.pembayaran_7 + '\',\'' + item.pembayaran_8 + '\',\'' + item.pembayaran_9 + '\',\'' + item.pembayaran_10 + '\',\'' + item.client_nama + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_total_qty + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.client_id + '\',\'' + item.penjualan_status_pembayaran + '\');">Bayar</button>';
                // point_popup += '</td>';
                point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.penjualan_grandtotal) + '</td>';

                point_popup += '<td  style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" align="right">';
                point_popup += '' + item.presentase_omset + '';
                point_popup += '</td>';
                point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format((parseFloat(item.penjualan_grandtotal) * item.presentase_omset) / 100) + '</td>';

                point_popup += '</tr>';

                console.log(total_point_sales);
            });

            point_popup += '<tr>';
            point_popup += '<td style="border-bottom:1px solid gray; border-left:1px solid gray;" colspan="1"  align="center"><b>Total</b></td>';
            point_popup += '<td style="border-bottom:1px solid gray;" align="center"><b></b></td>';
            point_popup += '<td style="border-bottom:1px solid gray;" align="center"><b></b></td>';
            point_popup += '<td colspan="1" style="border-left:1px solid gray; border-bottom:1px solid gray; border-right:1px solid gray;"   align="right"><b>' + number_format(total_point_sales) + '</b></td>';
            point_popup += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" align="center"><b></b></td>';
            point_popup += '<td colspan="1" style="border-right:1px solid gray; border-bottom:1px solid gray; border-right:1px solid gray;"   align="right"><b>' + number_format(jumlah_point_sales) + '</b></td>';
            point_popup += '</tr>';

            point_popup += '</tbody>';
            point_popup += '</table>';


            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'point_sales' + jQuery('#point_bulan_admin').val() + '.pdf'
            }
            console.log(point_popup);
            pdf.fromData(point_popup, options)
                .then((stats) => console.log('status', stats))
                .catch((err) => console.err(err))

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function pointSales() {
    jQuery('#karyawan_nama_point').html(jQuery('#karyawan_nama_hidden').val());

    var base_server = jQuery('#server_pilihan_master_Sales').val();
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/download-point-admin",
        dataType: 'JSON',
        data: {
            karyawan_id: jQuery('#karyawan_id_hidden').val(),
            month: jQuery('#point_bulan_admin').val(),
            year: jQuery('#point_year').val()
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $('#point_popup').html("");
        },
        success: function (data) {
            app.dialog.close();
            var point_popup = '';
            var jumlah_point_sales = 0;
            var no = 0;
            var total_point_sales = 0;
            console.log(data.foto);

            if (data.foto != null) {
                var id_pembayaran_point = data.foto.id_pembayaran_point;
                if (data.foto.foto_point != null) {
                    $('#foto_bukti_point').html("<button  onclick='uploadFotoPoint(\"" + data.data[0].penjualan_id + "\",\"" + jQuery('#point_bulan_admin').val() + "\",\"" + jQuery('#point_year').val() + "\",\"" + data.foto.foto_point + "\",\"" + id_pembayaran_point + "\");' data-popup='.upload-foto-point' style='background-color:blue; color:white;' class='popup-open text-add-colour-black-soft button-small col button text-bold'>BUKTI</button>");
                } else {
                    $('#foto_bukti_point').html("<button  onclick='uploadFotoPoint(\"" + data.data[0].penjualan_id + "\",\"" + jQuery('#point_bulan_admin').val() + "\",\"" + jQuery('#point_year').val() + "\",\"" + null + "\",\"" + id_pembayaran_point + "\");' data-popup='.upload-foto-point' class='popup-open text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold'>BUKTI</button>");
                }
                // if (data.foto.foto_lunas != null) {
                //     $('#foto_bukti_lunas_point').html("<button  onclick='uploadFotoLunasPoint(\"" + data.data[0].penjualan_id + "\",\"" + jQuery('#point_bulan_admin').val() + "\",\"" + jQuery('#point_year').val() + "\",\"" + data.foto.foto_lunas + "\",\"" + id_pembayaran_point + "\");' data-popup='.upload-foto-lunas-point' style='background-color:blue; color:white;' class='popup-open text-add-colour-black-soft button-small col button text-bold'>LUNAS</button>");
                // } else {
                //     $('#foto_bukti_lunas_point').html("<button  onclick='uploadFotoLunasPoint(\"" + data.data[0].penjualan_id + "\",\"" + jQuery('#point_bulan_admin').val() + "\",\"" + jQuery('#point_year').val() + "\",\"" + null + "\",\"" + id_pembayaran_point + "\");' data-popup='.upload-foto-lunas-point' class='popup-open text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold'>LUNAS</button>");
                // }
            } else {
                $('#foto_bukti_point').html("<button  onclick='uploadFotoPoint(\"" + data.data[0].penjualan_id + "\",\"" + jQuery('#point_bulan_admin').val() + "\",\"" + jQuery('#point_year').val() + "\",\"" + null + "\",\"" + null + "\");' data-popup='.upload-foto-point' class='popup-open text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold'>BUKTI</button>");
                // $('#foto_bukti_lunas_point').html("<button  onclick='uploadFotoLunasPoint(\"" + data.data[0].penjualan_id + "\",\"" + jQuery('#point_bulan_admin').val() + "\",\"" + jQuery('#point_year').val() + "\",\"" + null + "\",\"" + null + "\");' data-popup='.upload-foto-lunas-point' class='popup-open text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold'>LUNAS</button>");
            }

            $.each(data.data, function (i, item) {
                no++
                if (item.point_valid_manager == 1) {
                    total_point_sales += parseFloat(item.penjualan_grandtotal);
                    jumlah_point_sales += (parseFloat(item.penjualan_grandtotal) * item.presentase_omset) / 100;
                }
                var kurang_bayar = parseFloat(item.penjualan_grandtotal - item.penjualan_jumlah_pembayaran);
                var count_foto_bayar_miss = 0;
                var text_foto_bayar_miss = "";

                var alamat_kirim_penjualan = "";
                var btn_alamat_kirim_penjualan = "";
                if (item.alamat_kirim_penjualan != null) {
                    alamat_kirim_penjualan = item.alamat_kirim_penjualan;
                    btn_alamat_kirim_penjualan = "btn-color-blueWhite"
                } else {
                    alamat_kirim_penjualan = "";
                    btn_alamat_kirim_penjualan = "bg-dark-gray-young text-add-colour-black-soft";
                }

                point_popup += '<tr>';
                point_popup += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + no + '</td>';
                point_popup += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                point_popup += '   <button  class="' + btn_alamat_kirim_penjualan + ' button-small col button popup-open text-bold" data-popup=".input-alamat-kirim-sales" onclick="kirimAlamatSales(\'' + item.penjualan_id + '\');">Kirim</button>';
                point_popup += '</td>';
                point_popup += '<td style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.penjualan_tanggal).format('DD-MMM') + '</td>';
                point_popup += '<td class="popup-open" data-popup=".detail-sales-owner" onclick="detailPenjualanOwner(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
                point_popup += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
                // point_popup += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                // point_popup += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-pembayaran-owner" onclick="detailPembayaranOwner(\'' + item.penjualan_tanggal + '\',\'' + item.performa_id_relation + '\',\'' + item.bank_1 + '\',\'' + item.bank_2 + '\',\'' + item.bank_3 + '\',\'' + item.bank_4 + '\',\'' + item.bank_5 + '\',\'' + item.bank_6 + '\',\'' + item.bank_7 + '\',\'' + item.bank_8 + '\',\'' + item.bank_9 + '\',\'' + item.bank_10 + '\',\'' + item.pembayaran1_tgl + '\',\'' + item.pembayaran2_tgl + '\',\'' + item.pembayaran3_tgl + '\',\'' + item.pembayaran4_tgl + '\',\'' + item.pembayaran5_tgl + '\',\'' + item.pembayaran6_tgl + '\',\'' + item.pembayaran7_tgl + '\',\'' + item.pembayaran8_tgl + '\',\'' + item.pembayaran9_tgl + '\',\'' + item.pembayaran10_tgl + '\',\'' + item.bank + '\',\'' + item.pembayaran_1 + '\',\'' + item.pembayaran_2 + '\',\'' + item.pembayaran_3 + '\',\'' + item.pembayaran_4 + '\',\'' + item.pembayaran_5 + '\',\'' + item.pembayaran_6 + '\',\'' + item.pembayaran_7 + '\',\'' + item.pembayaran_8 + '\',\'' + item.pembayaran_9 + '\',\'' + item.pembayaran_10 + '\',\'' + item.client_nama + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_total_qty + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.client_id + '\',\'' + item.penjualan_status_pembayaran + '\');">Bayar</button>';
                // point_popup += '</td>';
                point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.penjualan_grandtotal) + '</td>';

                point_popup += '<td  style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" align="right">';
                point_popup += '' + item.presentase_omset + '';
                point_popup += '</td>';
                point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format((parseFloat(item.penjualan_grandtotal) * item.presentase_omset) / 100) + '</td>';
                point_popup += '<td  style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" align="right">';
                if (item.point_valid_manager == 1) {
                    point_popup += '   <button  style="background-color:blue; color:white;" class="text-add-colour-black-soft button-small col button text-bold"  onclick="validPointManager(\'' + item.penjualan_id + '\',0);">Valid</button>';
                } else {
                    point_popup += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"  onclick="validPointManager(\'' + item.penjualan_id + '\',1);">Belum Valid</button>';
                }
                point_popup += '</td>';



                point_popup += '</tr>';


            });

            point_popup += '<tr>';
            point_popup += '<td style="border-bottom:1px solid gray; border-left:1px solid gray;" colspan="1"  align="center"><b>Total</b></td>';
            point_popup += '<td style="border-bottom:1px solid gray;" align="center"><b></b></td>';
            point_popup += '<td style="border-bottom:1px solid gray;" align="center"><b></b></td>';
            point_popup += '<td style="border-bottom:1px solid gray;" align="center"><b></b></td>';
            point_popup += '<td style="border-bottom:1px solid gray;" align="center"><b></b></td>';
            point_popup += '<td colspan="1" style="border-left:1px solid gray; border-bottom:1px solid gray; border-right:1px solid gray;"   align="right"><b>' + number_format(total_point_sales) + '</b></td>';
            point_popup += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" align="center"><b></b></td>';
            point_popup += '<td colspan="1" style="border-right:1px solid gray; border-bottom:1px solid gray; border-right:1px solid gray;"   align="right"><b>' + number_format(jumlah_point_sales) + '</b></td>';
            point_popup += '</tr>';

            $('#point_popup_sales').html(point_popup);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function validPointManager(penjualan_id, values) {
    var base_server = jQuery('#server_pilihan_master_Sales').val();
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/valid-point-manager",
        dataType: 'JSON',
        data: {
            values: values,
            penjualan_id: penjualan_id
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            if (values == 1) {
                app.dialog.alert('Berhasil Validasi Point Sales', function () {
                    pointSales();
                });
            } else {
                app.dialog.alert('Berhasil Gagalkan Validasi Point Sales', function () {
                    pointSales();
                });
            }

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    })
}

function getSalesAdmin(page) {
    var year_now = new Date().getFullYear();
    if (jQuery('#point_year').val() == '') {
        var year = year_now;
    } else {
        var year = jQuery('#point_year').val();
    }
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-sales-admin-cs",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            point_bulan_admin: jQuery('#point_bulan_admin').val(),
            year: year,
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            var user_sales_value = "";
            var warna_button = "";
            $.each(data.data, function (i, item) {

                if (data.foto[item.karyawan_id] != null && data.foto[item.karyawan_id].foto_point != null) {
                    warna_button = 'btn-color-blueLightWhite';
                } else {
                    warna_button = 'text-add-colour-black-soft bg-dark-gray-young';
                }

                console.log(data.get_total[item.karyawan_id].total.bonus);
                user_sales_value += '<tr>';
                user_sales_value += '<td align="left" class="label-cell popup-open" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="20%" onclick="detailSalesAdmin(\'' + item.karyawan_nama + '\',\'' + item.karyawan_hp + '\',\'' + item.karyawan_alamat + '\');" data-popup=".detail-sales-admin">' + item.karyawan_nama + '</td>';
                user_sales_value += '<td align="right" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="20%">' + number_format(data.get_total[item.karyawan_id].total.bonus) + '</td>';
                if (data.get_total[item.karyawan_id].total.bonus != null) {
                    user_sales_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="10%">';
                    user_sales_value += '   <button  class="' + warna_button + ' button-small col button text-bold popup-open" data-popup=".point-sales" onclick="pointSalesClick(\'' + item.karyawan_id + '\',\'' + item.karyawan_nama + '\');">Point</button>';
                    user_sales_value += '</td>';
                } else {
                    user_sales_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="10%">';
                    user_sales_value += '</td>';
                }
                user_sales_value += '</tr>';
            });

            $$('#user_sales_value').html(user_sales_value);

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function kirimAlamatSales(penjualan_id) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-Alamat",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id,
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $("#input_alamat_kirim_popup")[0].reset();
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
            $$('#alamat_sekarang_popup_sales').val(alamat_client);
            $$('#alamat_kirim_popup_sales').val(alamat_kirim);
            $$('#nama-client-alamat-sales').html(client_nama);
            $$('#hp_alamat_sales').val(hp_alamat);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function getYearSalesAdmin() {
    let startYear = 2010;
    let endYear = new Date().getFullYear();
    for (i = endYear; i > startYear; i--) {
        if (i == endYear) {
            $('.point_years').append($('<option selected />').val(i).html(i));
        } else {
            $('.point_years').append($('<option />').val(i).html(i));
        }
    }
}

function readURLFotoLunas(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#file_foto_pelunasan_view_now_point').attr('src', e.target.result);
            $$('#label_file_foto_lunas_point').html(input.files[0].name);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

/** Fungsi Baru */
function getDataKomisi() {
    const formData = new FormData();

    formData.append('month', 'empty');
    formData.append('perusahaan_komisi', 'empty');

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-komisi-internal",
        dataType: 'JSON',
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (response) {
            app.dialog.close();
            console.log(response);
            if (response && response.data && Array.isArray(response.data)) {
                let tableBody = '';
                let no_row = 0;

                response.data.forEach((item) => {
                    no_row++;

                    const id = item.client_id || '';
                    const tanggal_claim = item.tanggal_claim || '';
                    const nama_klien = item.nama_klien || '-';
                    const total_klaim = item.grand_total_claim || 0;
                    const foto_claim = item.foto_claim || '';

                    tableBody += '<tr>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + no_row + '</td>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + formatDateToDayMonth(tanggal_claim) + '</td>';
                    tableBody += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + nama_klien + '</td>';
                    tableBody += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(total_klaim) + '</td>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    tableBody += `   <button class="button-small col button popup-open text-bold text-add-colour-black-soft bg-dark-gray-young" data-popup=".detail-komisi" onclick="getDetailKomisi(${id}, ${foto_claim});">DETAIL</button>`;
                    tableBody += '</td>';
                    tableBody += '</tr>';
                });

                app.$('#total-data-komisi').text(no_row);
                app.$('#tabel_data_komisi').html(tableBody);
            } else {
                app.dialog.alert("Data tidak valid atau kosong!", "Peringatan");
                console.error("Invalid data:", response);
            }
        },
        error: function (xhr, status, error) {
            alert("Gagal mengambil data! Status: " + status);
            console.error("Error details:", xhr.responseText);
        }
    });
}

function getDetailKomisi(detailId, detailPicture = null) {
    const formData = new FormData();

    // formData.append('id_claim', detailId);
    formData.append('id_claim', 22);
    console.log("Detail Picture: ", detailPicture);

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-komisi-internal-detail",
        dataType: 'JSON',
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (response) {
            app.dialog.close();
            console.log(response);
            if (response && response.data && Array.isArray(response.data)) {
                let tableBody = '';
                let no_row = 0;
                let presentase_komisi = response.data[0].komisi;
                let total_nominal_komisi = 0;

                if (detailPicture != null) {
                    app.$('#container-upload-bukti-komisi').css('display', 'none');
                    app.$('#btn-lihat-bukti-komisi').css('display', 'flex');
                }

                response.data.forEach((item) => {
                    no_row++;

                    const id = item.client_id || '';
                    const tanggal_penjualan = item.tanggal_penjualan || '';
                    const penjualan_id = item.penjualan_id || '-';
                    const omzet = item.total_omzet || 0;
                    const nominal_komisi = omzet * (presentase_komisi * 0.01);

                    total_nominal_komisi += nominal_komisi;

                    tableBody += '<tr>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + formatDateToDayMonth(tanggal_penjualan) + '</td>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + penjualan_id + '</td>';
                    tableBody += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(omzet) + '</td>';
                    tableBody += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(nominal_komisi) + '</td>';
                    tableBody += '</tr>';
                });

                app.$('.presentase-komisi').text(presentase_komisi);
                app.$('.nominal-komisi').text(number_format(total_nominal_komisi));
                app.$('#tabel_detail_komisi').html(tableBody);
            } else {
                app.dialog.alert("Data tidak valid atau kosong!", "Peringatan");
                console.error("Invalid data:", response);
            }
        },
        error: function (xhr, status, error) {
            alert("Gagal mengambil data! Status: " + status);
            console.error("Error details:", xhr.responseText);
        }
    });
}

function triggerUploadBuktiKomisi() {
    const input = document.getElementById('bukti-upload');
    input.click();
}

function uploadBuktiKomisi(file) {
    const formData = new FormData();
    formData.append('file', file);

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + '/update-foto-claim',
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function () {
            alert("MASUK");
            app.dialog.preloader('Mengunggah file...');
        },
        success: function (response) {
            app.dialog.close();
            app.dialog.alert('File berhasil diunggah!', 'Sukses');
            console.log('Response:', response);

            app.$('#file-upload').val('');
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            app.dialog.alert('Gagal mengunggah file: ' + error + ' (Status: ' + xhr.status + ')', 'Error');
            console.error('Error details:', xhr.responseText);
        }
    });
}

$(document).on('popupOpen', function (popup) {
    if (popup.el.querySelector('#container-upload-bukti-komisi')) {
        app.$('#btn-upload-bukti-komisi').on('click', function () {
            console.log('Upload button clicked');
            triggerUploadBuktiKomisi();
        });
    }
});

function getDataEmoney() {
    jQuery.ajax({
        type: 'GET',
        url: BASE_API3 + "/emoney",
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (response) {
            app.dialog.close();
            if (response && response.data && Array.isArray(response.data)) {
                let tableBody = '';
                let no_row = 0;
                // console.log("E-Money: ", response);

                response.data.forEach((item) => {
                    no_row++;

                    const id = item.id || '';
                    const company = item.company || '-';
                    const name = item.name || '-';
                    const phone = item.phone || '-';
                    const status = item.status || '-';
                    const valid = item.is_valid || null;

                    const opsiButtonStyle = valid == true ? 'btn-color-orange' : 'text-add-colour-black-soft bg-dark-gray-young';

                    let statusButtonStyle;
                    switch (status.toUpperCase()) {
                        case 'HOLD':
                            statusButtonStyle = 'text-add-colour-black-soft bg-dark-gray-young';
                            break;
                        case 'PROSES':
                            statusButtonStyle = 'btn-color-green';
                            break;
                        case 'SELESAI':
                            statusButtonStyle = 'btn-color-blue';
                            break;
                        default:
                            statusButtonStyle = 'text-add-colour-black-soft bg-dark-gray-young';
                    }

                    tableBody += '<tr>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + no_row + '</td>';
                    tableBody += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + company + '</td>';
                    tableBody += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + name + '</td>';
                    tableBody += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + phone + '</td>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    tableBody += `   <button class="button-small col button popup-open text-bold ${opsiButtonStyle}" data-popup=".detail-emoney" onclick="getDetailEmoney(${id});">DETAIL</button>`;
                    tableBody += '</td>';
                    tableBody += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                    tableBody += `   <button class="button-small col button popup-open text-bold ${statusButtonStyle}" data-popup=".popup-delivery-emoney" onclick="getDetailEmoney(${id});">${status}</button>`;
                    tableBody += '</td>';
                    tableBody += '</tr>';
                });

                app.$('#total-data-emoney').text(no_row);
                app.$('#tabel_data_emoney').html(tableBody);
            } else {
                app.dialog.alert("Data tidak valid atau kosong!", "Peringatan");
                console.error("Invalid data:", response);
            }
        },
        error: function (xhr, status, error) {
            alert("Gagal mengambil data! Status: " + status);
            console.error("Error details:", xhr.responseText);
        }
    });
}

function getDetailEmoney(detailId) {
    const formData = new FormData();

    formData.append('id', detailId);

    jQuery.ajax({
        type: 'POST',
        url: BASE_API3 + '/emoney/detail',
        dataType: 'JSON',
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (response) {
            app.dialog.close();

            const defaultImage = './img/logo/logo-not-found.png';
            const invalidUrl = 'https://be.order.devkoperindo.com/storage/emoney';

            if (response.logo && response.logo !== invalidUrl) {
                app.$('#img-logo').attr('src', response.logo);
            } else {
                app.$('#img-logo').attr('src', defaultImage);
            }

            if (response.emoney && response.emoney !== invalidUrl) {
                app.$('#img-emoney').attr('src', response.emoney);
            } else {
                app.$('#img-emoney').attr('src', defaultImage);
            }

            app.$('.nama-perusahaan').text(response.company);
            app.$('#val-perusahaan').text(response.company);
            app.$('#val-telepon').text(response.phone);
            app.$('#val-pic').text(response.name);
            app.$('#val-alamat').text(response.address);

            app.$('#container-btn-valid').html(`
                <button class="button btn-color-blueWhite button-small text-bold popup-open"
                id="btn-valid" onclick="validEmoney(${response.id});">VALID</button>
            `);

            app.$('#nama_input_valid_emoney').val(response.company).attr('disabled', true);
            app.$('#alamat_input_valid_emoney').val(response.address).attr('disabled', true);

            app.$('#container-btn-delivery').html(`
                <button onclick="deliveryEmoney(${response.id});"
                class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"
                id="button_save_valid_emoney">SIMPAN
                </button>
            `);
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            app.dialog.alert('Gagal: ' + error + ' (Status: ' + xhr.status + ')', 'Error');
        }
    })
}

function validEmoney(detailId) {
    const formData = new FormData();

    formData.append('id', detailId);

    jQuery.ajax({
        type: 'POST',
        url: BASE_API3 + '/emoney/update-validation',
        dataType: 'JSON',
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function () {
            app.dialog.close();
            app.$('#closeDetailEmoney').click();
            getDataEmoney();
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            app.dialog.alert('Gagal: ' + error + ' (Status: ' + xhr.status + ')', 'Error');
        }
    })
};

function deliveryEmoney(detailId) {
    const formData = new FormData();

    formData.append('emoney_id', detailId);
    formData.append('name', app.$('#nama_input_valid_emoney').val());
    formData.append('address', app.$('#alamat_input_valid_emoney').val());
    formData.append('document_number', app.$('#nomor_sj_valid_emoney').val());
    formData.append('document_file', app.$('#sj_valid_emoney').val());

    jQuery.ajax({
        type: 'POST',
        url: BASE_API3 + '/emoney/delivery',
        dataType: 'JSON',
        data: formData,
        contentType: false,
        processData: false,
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function () {
            app.dialog.close();
            app.$('#closeDeliveryEmoney').click();
            getDataEmoney();
        }

    })

}

/** Helper Function */
function formatDateToDayMonth(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0'); // Mendapatkan tanggal dengan 2 digit
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()]; // Mendapatkan nama bulan singkat
    return `${day}-${month}`;
}

function searchEmoneyByCompany() {
    const searchQuery = app.$('#search-company').val().trim();
    getDataEmoney(searchQuery);
}

let searchTimeout;
$(document).on('input', '#search-company', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchEmoneyByCompany, 500);
});

