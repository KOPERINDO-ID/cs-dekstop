function changeBulanSj() {
    // jQuery('#tanggal_akhir_point_sj_menu').val('');
    pointSj();
}
function getYearPointSj() {
    let startYear = 2010;
    let endYear = new Date().getFullYear();
    for (i = endYear; i > startYear; i--) {
        if (i == endYear) {
            $('.point_years_sj').append($('<option selected />').val(i).html(i));
        } else {
            $('.point_years_sj').append($('<option />').val(i).html(i));
        }
    }
}

function pointSj() {

    var point_bulan = jQuery('#bulan_sj').val();
    var years = jQuery('#point_year_sj').val();
    var dateTime = moment(point_bulan + ' ' + years, 'MM/YYYY');

    // var point_date = new Date(moment().year(), jQuery('#bulan_sj').val() - 1);
    var point_date = dateTime.format('YYYY-MM-DD')
    var start_date = moment(point_date).startOf('month').format('YYYY-MM-DD');
    var end_date = moment(point_date).endOf('month').format('YYYY-MM-DD');


    localStorage.setItem("start_date_sj",start_date);
    localStorage.setItem("end_date_sj",end_date);
    // var bulan_range = "";
    // bulan_range = document.getElementById("tanggal_akhir_point_sj_menu");
    // bulan_range.setAttribute("min", start_date)
    // bulan_range.setAttribute('max', end_date)


    // var tanggal_akhir = "";
    // if (jQuery('#tanggal_akhir_point_sj_menu').val() == null || jQuery('#tanggal_akhir_point_sj_menu').val() == "") {
    //     tanggal_akhir = 'empty';
    // } else {
    //     tanggal_akhir = jQuery('#tanggal_akhir_point_sj_menu').val();
    // }

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/donwload-point-sj-new-cs",
        dataType: 'JSON',
        data: {
            month: point_bulan,
            tanggal_awal: localStorage.getItem("start_date_sj"),
            tanggal_akhir: localStorage.getItem("end_date_sj"),
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
            year: years
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $('#point_popup').html("");
        },
        success: function (data) {
            app.dialog.close();
            var point_sj = '';
            var point_sj_total = 0;
            $.each(data.data, function (i, item) {

                var point = 50;


                if (item.bantuan_cabang != null) {
                    var cabang = item.bantuan_cabang;
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
                var sisa_kirim_sj = parseFloat(item.penjualan_qty) - parseFloat(data.surat_jalan_count[item.penjualan_detail_performa_id]);

                if (sisa_kirim_sj <= 0) {
                    if (item.tujuan_kirim != 'customer') {
                        point_sj_total += ((parseFloat(item.penjualan_total_qty) * point));
                        point_sj += '<tr>';
                        point_sj += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                        point_sj += '   <button  class="' + btn_alamat_kirim_penjualan + ' button-small col button popup-open text-bold" data-popup=".input-alamat-kirim-point-sj" onclick="kirimAlamatPointSj(\'' + item.penjualan_id + '\');">Kirim</button>';
                        point_sj += '</td>';
                        point_sj += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.tgl_surat_jalan_selesai).format('DD-MMM') + '</td>';
                        point_sj += '<td align="left" class="popup-open" data-popup=".detail-penjualan-point-produksi" onclick="detailPenjualanPointProduksi(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
                        point_sj += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';

                        point_sj += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + point + '</td>';
                        point_sj += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_total_qty + '</td>';
                        point_sj += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(parseFloat(item.penjualan_total_qty) * point) + '</td>';

                        point_sj += '</tr>';
                    }
                }
            });


            $('#point_sj_total').html('Total : ' + number_format(point_sj_total));
            $('#point_sj').html(point_sj);
            localStorage.setItem('point_total_sj', point_sj_total);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function downloadPointSj() {

    var point_bulan = jQuery('#bulan_sj').val();
    var years = jQuery('#point_year_sj').val();
    var dateTime = moment(point_bulan + ' ' + years, 'MM/YYYY');

    // var point_date = new Date(moment().year(), jQuery('#bulan_sj').val() - 1);
    var point_date = dateTime.format('YYYY-MM-DD')
    var start_date = moment(point_date).startOf('month').format('YYYY-MM-DD');
    var end_date = moment(point_date).endOf('month').format('YYYY-MM-DD');

    // var bulan_range = "";
    // bulan_range = document.getElementById("tanggal_akhir_point_sj_menu");
    // bulan_range.setAttribute("min", start_date)
    // bulan_range.setAttribute('max', end_date)


    // var tanggal_akhir = "";
    // if (jQuery('#tanggal_akhir_point_sj_menu').val() == null || jQuery('#tanggal_akhir_point_sj_menu').val() == "") {
    //     tanggal_akhir = 'empty';
    // } else {
    //     tanggal_akhir = jQuery('#tanggal_akhir_point_sj_menu').val();
    // }

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/donwload-point-sj-new-apk",
        dataType: 'JSON',
        data: {
            month: jQuery('#bulan_sj').val(),
            tanggal_awal: localStorage.getItem("start_date_sj"),
            tanggal_akhir: localStorage.getItem("end_date_sj"),
            year: years
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
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
            point_produksi_admin += '   <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="7%">Point</th>';
            point_produksi_admin += '   <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="9%">Qty</th>';
            point_produksi_admin += '    <th class="label-cell" style="border-top:1px solid gray; border-left:1px solid gray; border-bottom:1px solid gray; border-right:1px solid gray;" width="13%">Total</th>';

            point_produksi_admin += '  </tr>';
            point_produksi_admin += ' </thead>';
            point_produksi_admin += '  <tbody class="text-align-center">';


            var point = 50;
            $.each(data.data, function (i, item) {
                if (item.bantuan_cabang != null) {
                    var cabang = item.bantuan_cabang;
                } else {
                    var cabang = '-';
                }

                var sisa_kirim_sj = parseFloat(item.penjualan_qty) - parseFloat(data.surat_jalan_count[item.penjualan_detail_performa_id]);


                if (sisa_kirim_sj <= 0) {
                    if (item.tujuan_kirim != 'customer') {
                        point_produksi_admin_total += ((parseFloat(item.penjualan_total_qty) * point));
                        point_produksi_admin += '<tr>';
                        point_produksi_admin += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.penjualan_tanggal_kirim).format('DD-MMM') + '</td>';
                        point_produksi_admin += '<td align="left" class="popup-open" data-popup=".detail-penjualan-point-produksi" onclick="detailPenjualanPointProduksi(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
                        point_produksi_admin += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + (point) + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_total_qty + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format((parseFloat(item.penjualan_total_qty) * point)) + '</td>';
                       

                        point_produksi_admin += '</tr>';
                    }
                }
            });

            point_produksi_admin += '<tr>';
            point_produksi_admin += '<td colspan="4"  align="center"><b></b></td>';
            point_produksi_admin += '<td align="right" ><b>Total</b></td>';
            point_produksi_admin += '<td align="right" ><b>' + number_format(point_produksi_admin_total) + '</b></td>';
            point_produksi_admin += '</tr>';

            point_produksi_admin += '</tbody>';



            point_produksi_admin += '</table>';

            console.log(point_produksi_admin);

            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'report_point_' + moment().format('M') + '.pdf'
            }

            pdf.fromData(point_produksi_admin, options)
                .then((stats) => console.log('status', stats))
                .catch((err) => console.err(err))
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    })
}

function kirimAlamatPointSj(penjualan_id) {
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
            $$('#alamat_sekarang_popup_point_sj').val(alamat_client);
            $$('#alamat_kirim_popup_point_sj').val(alamat_kirim);
            $$('#nama-client-alamat-point-sj').html(client_nama);
            $$('#hp_alamat_point_sj').val(hp_alamat);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}


// function confirmBuktiPointSj() {
//     var tanggal_akhir = ""
//     if (jQuery('#tanggal_akhir_point_sj_menu').val() == null || jQuery('#tanggal_akhir_point_sj_menu').val() == "") {
//         tanggal_akhir = "empty";
//         app.dialog.alert('Tanggal Akhir Belum Di Pilih');
//         app.popup.close();
//     } else {
//         tanggal_akhir = jQuery('#tanggal_akhir_point_sj_menu').val();
//         jQuery('#tanggal_akhir_point_sj').val(tanggal_akhir);
//         jQuery('#tot_point_sj').val(localStorage.getItem("point_total_sj"));
//     }
// }


//Config Get Image From Camera
function setOptionsPointSj(srcType) {
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

function getFileEntryPointSj(imgUri) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

        // Do something with the FileEntry object, like write to it, upload it, etc.
        // writeFile(fileEntry, imgUri);
        alert("got file: " + fileEntry.nativeURL);
        // displayFileData(fileEntry.nativeURL, "Native URL");

    }, function () {
        // If don't get the FileEntry (which may happen when testing
        // on some emulators), copy to a new FileEntry.
        createNewFileEntryPointSj(imgUri);
    });
}

function getFileContentAsBase64PointSj(path, callback) {
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


function createNewFileEntryPointSj(imgUri) {
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


function openCameraPointSj(selection) {
    app.dialog.confirm('Yakin Konfirmasi Point ini ?', function () {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = setOptionsPointSj(srcType);
        var func = createNewFileEntryPointSj;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            // displayImage(imageUri);
            // // You may choose to copy the picture, save it somewhere, or upload.

            getFileContentAsBase64PointSj(imageUri, function (base64Image) {
                //window.open(base64Image);
                localStorage.setItem("confirm_foto_point_sj", base64Image);
                confirmFotoPointSj();

                // Then you'll be able to handle the myimage.png file as base64
            });

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");
            alert("Unable to obtain picture: ");

        }, options);

    });
}


function confirmFotoPointSj() {
  if (localStorage.getItem("internet_koneksi") == 'fail') {
        app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
        });
    } else {
        if (localStorage.getItem("confirm_foto_point_sj") != null || localStorage.getItem("confirm_foto_point_sj") != 'null' || localStorage.getItem("confirm_foto_point_sj") != '') {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/confirm-point-admin-cs",
                dataType: "JSON",
                data: {
                    karyawan_nama: localStorage.getItem("karyawan_nama"),
                    tanggal_akhir: localStorage.getItem("end_date_sj"),
                    point: localStorage.getItem("point_total_sj"),
                    tanggal_awal: localStorage.getItem("start_date_sj"),
                    lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
                    photo_bukti: localStorage.getItem("confirm_foto_point_sj"),
                    point_divisi: 'Sj',
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                    // jQuery('#tanggal_akhir_point_sj_menu').val('')
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'done') {
                        pointSj();
                        $("#confirm_point_sj_popup_close").click();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Konfirmasi Point Sj');
                    }
                }
            });
        } else {
            app.dialog.alert('Silahkan Foto Bukti Pembayaran Point Sj');
        }
    }
}