function kirimAlamatProduksi(penjualan_id) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-Alamat",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id,
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
            $$('#alamat_sekarang_popup_produksi').val(alamat_client);
            $$('#alamat_kirim_popup_produksi').val(alamat_kirim);
            $$('#nama-client-alamat-produksi').html(client_nama);
            $$('#hp_alamat_produksi').val(hp_alamat);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function changeBulanProduksi() {
    jQuery('#tanggal_akhir_point_produksi_menu').val('');
    pointProduksi();
}

function getYearProduksiAdmin() {
    let startYear = 2010;
    let endYear = new Date().getFullYear();
    for (i = endYear; i > startYear; i--) {
        if (i == endYear) {
            $('.point_years_produksi').append($('<option selected />').val(i).html(i));
        } else {
            $('.point_years_produksi').append($('<option />').val(i).html(i));
        }
    }
}


function pointProduksi() {

    var point_bulan = jQuery('#point_produki_bulan_admin').val();
    var years = jQuery('#point_year_produksi').val();
    var dateTime = moment(point_bulan + ' ' + years, 'MM/YYYY');

    // var point_date = new Date(moment().year(), dateTime.format('YYYY-MM-DD'));
    var point_date = dateTime.format('YYYY-MM-DD')
    var start_date = moment(point_date).startOf('month').format('YYYY-MM-DD');
    var end_date = moment(point_date).endOf('month').format('YYYY-MM-DD');


    localStorage.setItem("start_date_produksi", start_date);
    localStorage.setItem("end_date_produksi", end_date);
    // var bulan_range = "";
    // bulan_range = document.getElementById("tanggal_akhir_point_produksi_menu");
    // bulan_range.setAttribute("min", start_date)
    // bulan_range.setAttribute('max', end_date)

    // var tanggal_akhir = "";
    // if (jQuery('#tanggal_akhir_point_produksi_menu').val() == null || jQuery('#tanggal_akhir_point_produksi_menu').val() == "") {
    //     tanggal_akhir = 'empty';
    // } else {
    //     tanggal_akhir = jQuery('#tanggal_akhir_point_produksi_menu').val();
    // }


    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/donwload-point-produksi-cs",
        dataType: 'JSON',
        data: {
            month: point_bulan,
            tanggal_awal: localStorage.getItem("start_date_produksi"),
            tanggal_akhir: localStorage.getItem("end_date_produksi"),
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
            year: years,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $('#point_popup').html("");
        },
        success: function (data) {
            app.dialog.close();
            var point_produksi_admin = '';
            var point_produksi_admin_total = 0;
            $.each(data.data, function (i, item) {

                if (item.bantuan_cabang == 'Jakarta' || item.bantuan_cabang == 'Milano' || item.bantuan_cabang == 'Geneva' || item.bantuan_cabang == 'Asia') {
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
                        point_produksi_admin += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                        point_produksi_admin += '   <button  class="' + btn_alamat_kirim_penjualan + ' button-small col button popup-open text-bold" data-popup=".input-alamat-kirim-produksi" onclick="kirimAlamatProduksi(\'' + item.penjualan_id + '\');">Kirim</button>';
                        point_produksi_admin += '</td>';
                        point_produksi_admin += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.produksi_tanggal_selesai).format('DD-MMM') + '</td>';
                        point_produksi_admin += '<td align="left" class="popup-open" data-popup=".detail-penjualan-point-produksi" onclick="detailPenjualanPointProduksi(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
                        point_produksi_admin += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
                        point_produksi_admin += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_jenis + '</td>';

                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + point + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_qty + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(parseFloat(item.penjualan_qty) * point) + '</td>';
                        point_produksi_admin += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + cabang + ' </td>';

                        // point_produksi_admin += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                        // point_produksi_admin += '   <button  class="bg-dark-gray-young text-add-colour-black-soft button-small col button popup-open text-bold" data-popup=".confirm-point-produksi-popup" onclick="confirmBuktiPointProduksi(\'' + item.penjualan_id + '\',\'' + tanggal_akhir + '\',\'' + point + '\',\'' + item.penjualan_qty + '\',\'' + parseFloat(item.penjualan_qty) * point + '\');">Bukti</button>';
                        // point_produksi_admin += '</td>';

                        point_produksi_admin += '</tr>';

                    }
                }
            });


            $('#point_produksi_admin_total').html('Total : ' + number_format(point_produksi_admin_total));
            localStorage.setItem('point_total_produksi', point_produksi_admin_total);
            $('#point_produksi_admin').html(point_produksi_admin);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function downloadPointProduksi() {

    var point_bulan = jQuery('#point_produki_bulan_admin').val();
    var years = jQuery('#point_year_produksi').val();
    var dateTime = moment(point_bulan + ' ' + years, 'MM/YYYY');

    // var point_date = new Date(moment().year(), dateTime.format('YYYY-MM-DD'));
    var point_date = dateTime.format('YYYY-MM-DD')
    var start_date = moment(point_date).startOf('month').format('YYYY-MM-DD');
    var end_date = moment(point_date).endOf('month').format('YYYY-MM-DD');

    // var bulan_range = "";
    // bulan_range = document.getElementById("tanggal_akhir_point_produksi_menu");
    // bulan_range.setAttribute("min", start_date)
    // bulan_range.setAttribute('max', end_date)

    // var tanggal_akhir = "";
    // if (jQuery('#tanggal_akhir_point_produksi_menu').val() == null || jQuery('#tanggal_akhir_point_produksi_menu').val() == "") {
    //     tanggal_akhir = 'empty';
    // } else {
    //     tanggal_akhir = jQuery('#tanggal_akhir_point_produksi_menu').val();
    // }


    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/donwload-point-produksi-new",
        dataType: 'JSON',
        data: {
            month: point_bulan,
            tanggal_awal: localStorage.getItem("start_date_produksi"),
            tanggal_akhir: localStorage.getItem("end_date_produksi"),
            year: years,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $('#point_popup').html("");
        },
        success: function (data) {
            app.dialog.close();
            var point_produksi_admin = '';
            var point_produksi_admin_total = 0;
            point_produksi_admin += '  <table cellspacing="1" cellpadding="1" width="100%">';
            point_produksi_admin += '  <thead class="bg-dark-gray-medium text-align-center">';
            point_produksi_admin += '    <tr>';
            point_produksi_admin += '     <th class="label-cell" style="border-top:1px solid gray; border-left:1px solid gray; border-bottom:1px solid gray;" width="13%">Tgl Selesai</th>';
            point_produksi_admin += '    <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="21%">SPK</th>';
            point_produksi_admin += '    <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="22%">Perusahaan</th>';
            point_produksi_admin += '    <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="21%">Jenis</th>';
            point_produksi_admin += '   <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="7%">Point</th>';
            point_produksi_admin += '   <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="9%">Qty</th>';
            point_produksi_admin += '    <th class="label-cell" style="border-top:1px solid gray; border-left:1px solid gray; border-bottom:1px solid gray; border-right:1px solid gray;" width="13%">Total</th>';
            point_produksi_admin += '    <th class="label-cell" style="border-top:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" width="10%">Cabang</th>';

            point_produksi_admin += '  </tr>';
            point_produksi_admin += ' </thead>';
            point_produksi_admin += '  <tbody class="text-align-center">';

            $.each(data.data, function (i, item) {

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
                        point_produksi_admin += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.produksi_tanggal_selesai).format('DD-MMM') + '</td>';
                        point_produksi_admin += '<td align="left" class="popup-open" data-popup=".detail-penjualan-point-produksi" onclick="detailPenjualanPointProduksi(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
                        point_produksi_admin += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
                        point_produksi_admin += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_jenis + '</td>';

                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + point + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_qty + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(parseFloat(item.penjualan_qty) * point) + '</td>';
                        point_produksi_admin += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + cabang + ' </td>';

                        // point_produksi_admin += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                        // point_produksi_admin += '   <button  class="bg-dark-gray-young text-add-colour-black-soft button-small col button popup-open text-bold" data-popup=".confirm-point-produksi-popup" onclick="confirmBuktiPointProduksi(\'' + item.penjualan_id + '\',\'' + tanggal_akhir + '\',\'' + point + '\',\'' + item.penjualan_qty + '\',\'' + parseFloat(item.penjualan_qty) * point + '\');">Bukti</button>';
                        // point_produksi_admin += '</td>';

                        point_produksi_admin += '</tr>';

                    }
                }
            });

            point_produksi_admin += ' <tr class="bg-dark-gray-medium text-align-center">';
            point_produksi_admin += '<td style="border-bottom:1px solid gray; border-left:1px solid gray;" colspan="6"  align="right"><b>&nbsp;&nbsp;Total</b></td>';
            point_produksi_admin += '  <td align="right"  class="label-cell" style=" border-left:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;"><b>' + number_format(point_produksi_admin_total) + '</b></td>';
            point_produksi_admin += '    </tr>';

            point_produksi_admin += '  </tbody>';
            point_produksi_admin += '  </table>';



            // $('#point_produksi_admin_total').html('Total : ' + number_format(point_produksi_admin_total));

            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'point_produksi_' + point_bulan + '.pdf'
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

// function confirmBuktiPointProduksi() {
//     var tanggal_akhir = ""
//     if (jQuery('#tanggal_akhir_point_produksi_menu').val() == null || jQuery('#tanggal_akhir_point_produksi_menu').val() == "") {
//         tanggal_akhir = "empty";
//         app.dialog.alert('Tanggal Akhir Belum Di Pilih');
//         app.popup.close();
//     } else {
//         tanggal_akhir = jQuery('#tanggal_akhir_point_produksi_menu').val();
//         jQuery('#tanggal_akhir_point_produksi').val(tanggal_akhir);
//         jQuery('#tot_point_produksi').val(localStorage.getItem("point_total_produksi"));
//     }
// }


//Config Get Image From Camera
function setOptionsPointProduksi(srcType) {
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

function getFileEntryPointProduksi(imgUri) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

        // Do something with the FileEntry object, like write to it, upload it, etc.
        // writeFile(fileEntry, imgUri);
        alert("got file: " + fileEntry.nativeURL);
        // displayFileData(fileEntry.nativeURL, "Native URL");

    }, function () {
        // If don't get the FileEntry (which may happen when testing
        // on some emulators), copy to a new FileEntry.
        createNewFileEntryPointProduksi(imgUri);
    });
}

function getFileContentAsBase64PointProduksi(path, callback) {
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


function createNewFileEntryPointProduksi(imgUri) {
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


function openCameraPointProduksi(selection) {
    app.dialog.confirm('Yakin Konfirmasi Point ini ?', function () {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = setOptionsPointProduksi(srcType);
        var func = createNewFileEntryPointProduksi;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            // displayImage(imageUri);
            // // You may choose to copy the picture, save it somewhere, or upload.

            getFileContentAsBase64PointProduksi(imageUri, function (base64Image) {
                //window.open(base64Image);
                localStorage.setItem("confirm_foto_point_produksi", base64Image);
                confirmFotoPointProduksi();

                // Then you'll be able to handle the myimage.png file as base64
            });

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");
            alert("Unable to obtain picture: ");

        }, options);

    });
}


function confirmFotoPointProduksi() {
    if (localStorage.getItem("internet_koneksi") == 'fail') {
        app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
        });
    } else {
        if (localStorage.getItem("confirm_foto_point_produksi") != null || localStorage.getItem("confirm_foto_point_produksi") != 'null' || localStorage.getItem("confirm_foto_point_produksi") != '') {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/confirm-point-admin-cs",
                dataType: "JSON",
                data: {
                    karyawan_nama: localStorage.getItem("karyawan_nama"),
                    tanggal_akhir: localStorage.getItem("end_date_produksi"),
                    point: localStorage.getItem("point_total_produksi"),
                    tanggal_awal: localStorage.getItem("start_date_produksi"),
                    photo_bukti: localStorage.getItem("confirm_foto_point_produksi"),
                    lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
                    point_divisi: 'Produksi',
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'done') {
                        pointProduksi();
                        $("#confirm_point_produksi_popup_close").click();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Konfirmasi Point Produksi');
                    }
                }
            });
        } else {
            app.dialog.alert('Silahkan Foto Bukti Pembayaran Point Produksi');
        }
    }
}