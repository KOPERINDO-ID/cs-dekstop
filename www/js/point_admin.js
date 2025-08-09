function changeBulanAdmin() {
    jQuery('#tanggal_akhir_point_admin_menu').val('');
    pointAdmin();
}

function getYearPointAdmin() {
    let startYear = 2010;
    let endYear = new Date().getFullYear();
    for (i = endYear; i > startYear; i--) {
        if (i == endYear) {
            $('.point_years_admin').append($('<option selected />').val(i).html(i));
        } else {
            $('.point_years_admin').append($('<option />').val(i).html(i));
        }
    }
}

function pointAdmin() {

    var point_bulan = jQuery('#bulan_admin').val();
    var years = jQuery('#point_year_admin').val();
    var dateTime = moment(point_bulan + ' ' + years, 'MM/YYYY');

    var point_date = new Date(moment().year(), jQuery('#bulan_admin').val() - 1);

    var point_date = dateTime.format('YYYY-MM-DD')
    var start_date = moment(point_date).startOf('month').format('YYYY-MM-DD');
    var end_date = moment(point_date).endOf('month').format('YYYY-MM-DD');

    localStorage.setItem("start_date", start_date);
    localStorage.setItem("end_date", end_date);
    // var bulan_range = "";
    // bulan_range = document.getElementById("tanggal_akhir_point_admin_menu");
    // bulan_range.setAttribute("min", start_date)
    // bulan_range.setAttribute('max', end_date)

    var tanggal_akhir = "";
    if (jQuery('#tanggal_akhir_point_admin_menu').val() == null || jQuery('#tanggal_akhir_point_admin_menu').val() == "") {
        tanggal_akhir = 'empty';
    } else {
        tanggal_akhir = jQuery('#tanggal_akhir_point_admin_menu').val();
    }

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/download-point-admin-new-cs",
        dataType: 'JSON',
        data: {
            month: point_bulan,
            tanggal_awal: localStorage.getItem("start_date"),
            tanggal_akhir: localStorage.getItem("end_date"),
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
                var point = 100;

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
                        // if (item.tujuan_kirim != 'customer') {
                        if ((item.penjualan_grandtotal - item.penjualan_jumlah_pembayaran) <= 0) {
                            point_produksi_admin_total += ((parseFloat(item.penjualan_total_qty) * point));
                            point_produksi_admin += '<tr>';
                            point_produksi_admin += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                            point_produksi_admin += '   <button  class="' + btn_alamat_kirim_penjualan + ' button-small col button popup-open text-bold" data-popup=".input-alamat-kirim-admin" onclick="kirimAlamatAdmin(\'' + item.penjualan_id + '\');">Kirim</button>';
                            point_produksi_admin += '</td>';
                            point_produksi_admin += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.produksi_tanggal_selesai).format('DD-MMM') + '</td>';
                            point_produksi_admin += '<td align="left" class="popup-open" data-popup=".detail-penjualan-point-produksi" onclick="detailPenjualanPointProduksi(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
                            point_produksi_admin += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
                            point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + (point) + '</td>';
                            point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_total_qty + '</td>';
                            point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format((parseFloat(item.penjualan_total_qty) * point)) + '</td>';


                            point_produksi_admin += '</tr>';
                            // }
                        }
                    }
                }
            });


            $('#point_admin_total').html('Total : ' + number_format(point_produksi_admin_total));
            localStorage.setItem('point_total_admin', point_produksi_admin_total);
            $('#point_admin').html(point_produksi_admin);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function downloadPointAdmin() {

    var point_bulan = jQuery('#bulan_admin').val();
    var years = jQuery('#point_year_admin').val();
    var dateTime = moment(point_bulan + ' ' + years, 'MM/YYYY');

    // var point_date = new Date(moment().year(), jQuery('#bulan_admin').val() - 1);

    var point_date = dateTime.format('YYYY-MM-DD')
    var start_date = moment(point_date).startOf('month').format('YYYY-MM-DD');
    var end_date = moment(point_date).endOf('month').format('YYYY-MM-DD');

    // var bulan_range = "";
    // bulan_range = document.getElementById("tanggal_akhir_point_admin_menu");
    // bulan_range.setAttribute("min", start_date)
    // bulan_range.setAttribute('max', end_date)

    var tanggal_akhir = "";
    if (jQuery('#tanggal_akhir_point_admin_menu').val() == null || jQuery('#tanggal_akhir_point_admin_menu').val() == "") {
        tanggal_akhir = 'empty';
    } else {
        tanggal_akhir = jQuery('#tanggal_akhir_point_admin_menu').val();
    }

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/download-point-admin-new-apk",
        dataType: 'JSON',
        data: {
            month: point_bulan,
            tanggal_awal: localStorage.getItem("start_date"),
            tanggal_akhir: localStorage.getItem("end_date"),
            year: years
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
            point_produksi_admin += '   <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="7%">Point</th>';
            point_produksi_admin += '   <th class="label-cell" style="border-top:1px solid gray;border-left:1px solid gray; border-bottom:1px solid gray;" width="9%">Qty</th>';
            point_produksi_admin += '    <th class="label-cell" style="border-top:1px solid gray; border-left:1px solid gray; border-bottom:1px solid gray; border-right:1px solid gray;" width="13%">Total</th>';

            point_produksi_admin += '  </tr>';
            point_produksi_admin += ' </thead>';
            point_produksi_admin += '  <tbody class="text-align-center">';
            $.each(data.data, function (i, item) {
                var point = 100;

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
                        // if (item.tujuan_kirim != 'customer') {
                        point_produksi_admin_total += ((parseFloat(item.penjualan_total_qty) * point));
                        point_produksi_admin += '<tr>';
                        point_produksi_admin += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.tanggal_pembayaran_terakhir).format('DD-MMM') + '</td>';
                        point_produksi_admin += '<td align="left" class="popup-open" data-popup=".detail-penjualan-point-produksi" onclick="detailPenjualanPointProduksi(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
                        point_produksi_admin += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + (point) + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_total_qty + '</td>';
                        point_produksi_admin += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format((parseFloat(item.penjualan_total_qty) * point)) + '</td>';


                        point_produksi_admin += '</tr>';
                        // }
                    }
                }
            });

            point_produksi_admin += ' <tr class="bg-dark-gray-medium text-align-center">';
            point_produksi_admin += '<td style="border-bottom:1px solid gray; border-left:1px solid gray;" colspan="5"  align="right"><b>&nbsp;&nbsp;Total</b></td>';
            point_produksi_admin += '  <td align="right"  class="label-cell" style=" border-left:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;"><b>' + number_format(point_produksi_admin_total) + '</b></td>';
            point_produksi_admin += '    </tr>';

            point_produksi_admin += ' </tbody>';
            point_produksi_admin += ' </table>';

            console.log(point_produksi_admin);
            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'point_admin_' + point_bulan + '.pdf'
            }

            pdf.fromData(point_produksi_admin, options)
                .then((stats) => console.log('status', stats))
                .catch((err) => console.err(err))
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}
function kirimAlamatAdmin(penjualan_id) {
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
            $$('#alamat_sekarang_popup_admin').val(alamat_client);
            $$('#alamat_kirim_popup_admin').val(alamat_kirim);
            $$('#nama-client-alamat-admin').html(client_nama);
            $$('#hp_alamat_admin').val(hp_alamat);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}


function getFileContentAsBase64PointAdmin(path, callback) {
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

function createNewFileEntryPointAdmin(imgUri) {
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


//Config Get Image From Camera
function setOptionsPointAdmin(srcType) {
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

function openCameraPointAdmin(selection) {
    app.dialog.confirm('Yakin Konfirmasi Point ini ?', function () {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = setOptionsPointAdmin(srcType);
        var func = createNewFileEntryPointAdmin;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            // displayImage(imageUri);
            // // You may choose to copy the picture, save it somewhere, or upload.

            getFileContentAsBase64PointAdmin(imageUri, function (base64Image) {
                //window.open(base64Image);
                localStorage.setItem("confirm_foto_point_admin", base64Image);
                // alert(base64Image);
                confirmFotoPointAdmin();

                // Then you'll be able to handle the myimage.png file as base64
            });

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");
            alert("Unable to obtain picture: ");

        }, options);

    });
}


function confirmFotoPointAdmin() {
    
    if (localStorage.getItem("internet_koneksi") == 'fail') {
        app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
        });
    } else {
        if (localStorage.getItem("confirm_foto_point_admin") != null || localStorage.getItem("confirm_foto_point_admin") != 'null' || localStorage.getItem("confirm_foto_point_admin") != '') {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/confirm-point-admin-cs",
                dataType: "JSON",
                data: {
                    karyawan_nama: localStorage.getItem("karyawan_nama"),
                    point: localStorage.getItem("point_total_admin"),
                    tanggal_awal: localStorage.getItem("start_date"),
                    tanggal_akhir: localStorage.getItem("end_date"),
                    photo_bukti: localStorage.getItem("confirm_foto_point_admin"),
                    lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
                    point_divisi: 'Admin',
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                    jQuery('#tanggal_akhir_point_admin_menu').val('')
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'done') {
                        pointAdmin();
                        $("#confirm_point_admin_popup_close").click();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Konfirmasi Point Admin');
                    }
                }
            });
        } else {
            app.dialog.alert('Silahkan Foto Bukti Pembayaran Point Admin');
        }
    }
}