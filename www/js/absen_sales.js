var delayTimer;
function doSearchKaryawanAbsenSales(text) {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(function () {
        getDataKaryawanSales();
    }, 1000);
}

function backToabsensiGajiSales() {
    return app.views.main.router.navigate(app.views.main.router.currentRoute.url, { reloadCurrent: true, ignoreCache: true, });
}


//Config Get Image From Camera
function setOptionsAbsenSales(srcType) {
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

function getFileEntryAbsenSales(imgUri) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

        // Do something with the FileEntry object, like write to it, upload it, etc.
        // writeFile(fileEntry, imgUri);
        alert("got file: " + fileEntry.nativeURL);
        // displayFileData(fileEntry.nativeURL, "Native URL");

    }, function () {
        // If don't get the FileEntry (which may happen when testing
        // on some emulators), copy to a new FileEntry.
        createNewFileEntryAbsenSales(imgUri);
    });
}

function getFileContentAsBase64AbsenSales(path, callback) {
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


function createNewFileEntryAbsenSales(imgUri) {
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

function clearDateAbsenSales() {
    jQuery('#tanggal_akhir_gaji_sales_confirm').val('');
}

function openCameraAbsenSales(selection) {
    var tanggal_akhir_sales_confirm = jQuery('#tanggal_akhir_gaji_sales_confirm').val();
    app.dialog.confirm('Konfirmasi Gaji ' + localStorage.getItem("karyawan_nama_gaji_sales") + ' ?', function () {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = setOptionsAbsenSales(srcType);
        var func = createNewFileEntryAbsenSales;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            // displayImage(imageUri);
            // // You may choose to copy the picture, save it somewhere, or upload.

            getFileContentAsBase64AbsenSales(imageUri, function (base64Image) {
                //window.open(base64Image);
                localStorage.setItem("bukti_gaji_sales", base64Image);
                geDetailGajiSalesConfirm(tanggal_akhir_sales_confirm);

                // Then you'll be able to handle the myimage.png file as base64
            });

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");
            alert("Unable to obtain picture: ");

        }, options);

    });
}


function btnShowGajiSales() {
    $$('#showDataGajiSales').show();
    $('.clear-btn-color-sales').removeClass("bg-dark-gray-medium");
    $('#colorBtnGajiSales').addClass("bg-dark-gray-medium");
    $$('#showDataValidasiSales').hide();
    getDataKaryawanSales();
}

function btnShowValidSales() {
    $$('#showDataGajiSales').hide();
    $$('#data-absen-tolak-sales').hide();
    $('.clear-btn-color-sales').removeClass("bg-dark-gray-medium");
    $('#colorBtnValidSales').addClass("bg-dark-gray-medium");
    $$('#showDataValidasiSales').show();
    btnShowDataValidSales();
}

function btnShowDataValidSales() {
    $$('#data-absen-tolak-sales').hide();
    $('.clear-btn-color-sales-valid').removeClass("bg-dark-gray-medium");
    $('#btnDataValidSales').addClass("bg-dark-gray-medium");
    $$('#data-absen-valid-sales').show();
    getDataValidSales();
}

function btnShowDataTolakSales() {
    $$('#data-absen-valid-sales').hide();
    $('.clear-btn-color-sales-valid').removeClass("bg-dark-gray-medium");
    $('#btnDataValidTolakSales').addClass("bg-dark-gray-medium");
    $$('#data-absen-tolak-sales').show();
    getDataTolakSales();
}

function btnPeriodeSales() {
    var btnPeriode = "";
    var periode_1 = moment().subtract(14, "days").format("YYYY/MM/DD");
    var periode_2 = moment().subtract(14, "days").format("YYYY/MM/DD");
    var periode_3 = moment().subtract(28, "days").format("YYYY/MM/DD");
    var periode_4 = moment().subtract(42, "days").format("YYYY/MM/DD");
    var periode_5 = moment().subtract(56, "days").format("YYYY/MM/DD");
    var periode_6 = moment().subtract(70, "days").format("YYYY/MM/DD");
    var periode_7 = moment().subtract(84, "days").format("YYYY/MM/DD");
    var periode_8 = moment().subtract(98, "days").format("YYYY/MM/DD");
    var periode_9 = moment().subtract(112, "days").format("YYYY/MM/DD");
    var periode_10 = moment().subtract(126, "days").format("YYYY/MM/DD");

    for (let i = 1; i < 11; i++) {
        btnPeriode += '<td>';
        btnPeriode += ' <center>';

        if (i == 1) {
            btnPeriode += '     <button id="btnPeriodeSales_last" onclick="getDataKaryawanSales(\'' + 1 + '\')" class="button button-small button-fill bg-dark-gray-medium text-add-colour-white active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';
        } else if (i == 2) {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_2 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';
        } else if (i == 3) {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_3 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';

        } else if (i == 4) {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_4 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';

        } else if (i == 5) {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_5 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';

        } else if (i == 6) {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_6 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';

        } else if (i == 7) {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_7 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';

        } else if (i == 8) {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_8 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';

        } else if (i == 9) {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_9 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';

        } else {
            btnPeriode += '     <button id="btnPeriodeSales_' + i + '" onclick="getGajiPeriodeSales(\'' + periode_10 + '\',\'' + i + '\',\'' + 1 + '\')" class="button button-small button-fill text-add-colour-gray active-periode-sales" style="background-color: lightgrey;width:15px;">';
            btnPeriode += '     ' + i + '</button>';

        }
        btnPeriode += ' </center>';
        btnPeriode += '</td>';
    }
    $$('#btn-periode-sales').html(btnPeriode);

}

function getGajiPeriodeSales(tanggal_periode, urutan, page) {


    // $$('#show_acc_disiplin').hide();
    if (page == '' || page == null) {
        var page_now = 1;
    } else {
        var page_now = page;
    }


    $$('#hideDocSales').hide();
    $$('#hideDocPeriodeSales').show();


    localStorage.setItem("urutan_sales", urutan);
    localStorage.setItem("tanggal_periode", tanggal_periode);

    if (jQuery(".active-periode-sales").hasClass("bg-dark-gray-medium text-add-colour-white")) {
        jQuery(".active-periode-sales").removeClass("bg-dark-gray-medium text-add-colour-white");
        jQuery(".active-periode-sales").addClass("text-add-colour-gray");
        jQuery("#btnPeriodeSales_" + urutan).removeClass("text-add-colour-gray");
        jQuery("#btnPeriodeSales_" + urutan).addClass("bg-dark-gray-medium text-add-colour-white");
    } else {
        jQuery("#btnPeriodeSales_" + urutan).removeClass("text-add-colour-gray");
        jQuery("#btnPeriodeSales_" + urutan).addClass("bg-dark-gray-medium text-add-colour-white");
    }

    if (jQuery('#karyawan_filter_sales').val() == '' || jQuery('#karyawan_filter_sales').val() == null) {
        karyawan_nama = "empty";
    } else {
        karyawan_nama = jQuery('#karyawan_filter_sales').val();
    }

    var periode_value = "";
    var pagination_button = "";


    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-gaji-periode-sales?page=" + page_now + "",
        dataType: 'JSON',
        data: {
            tanggal: tanggal_periode,
            urutan: urutan
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            $$('#data_karyawan_absensi_sales').html('');
        },
        success: function (data) {
            app.dialog.close();
            no = 1;
            no_urut = 0;
            var tanggal_awal;
            var tanggal_akhir;
            var grand_total = 0;
            for (i = 0; i < data.data.last_page; i++) {
                no = i + 1;
                pagination_button += '<i onclick="getGajiPeriodeSales(' + no + ');"  style="border-radius:2px; width:40px; height:40px; background-color:#4c5269; padding-left:8px; padding-right:8px; margin:2px;">' + no + '</i>';
            }

            $.each(data.data.data, function (i, val) {
                no_urut++
                periode_value += '<tr>';
                periode_value += '<td align="center" style="border-bottom:1px solid gray; border-left:1px solid gray;"  class="label-cell"  >' + no_urut + '</td>';
                periode_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + val.nik + '</td>';
                periode_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="popup-open" data-popup=".popup-ktp-sales" onclick="fotoKtpSales(\'' + val.user_id + '\',\'' + val.foto_ktp + '\',\'' + val.karyawan_nama + '\',\'' + val.karyawan_alamat + '\',\'' + val.karyawan_hp + '\');">' + val.karyawan_nama + '</td>';


                // localStorage.setItem("karyawan_nama_gaji", val.karyawan_nama);

                var total_gaji = 0;
                // var tunjangan = 0;
                var potongan_nominal = 0;
                var bonus_disiplin = 0;
                var count_day = 0;
                var bukti_gaji;
                var checked = "";

                $.each(data.count_day[val.user_id], function (i, val_log) {
                    total_gaji = val_log.total_gaji;
                    // tunjangan = val_log.total_tunjangan;
                    potongan_nominal = val_log.total_potongan;
                    bonus_disiplin = val_log.bonus_disiplin;
                    bukti_gaji = val_log.bukti_gaji;
                    tanggal_awal = val_log.tanggal_awal;
                    tanggal_akhir = val_log.tanggal_akhir;
                    count_day = val_log.count_days;

                }); parseFloat((total_gaji + bonus_disiplin) - potongan_nominal)

                if (bonus_disiplin != 0) {
                    checked = "checked";
                } else {
                    checked = "";
                }
                periode_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="numeric-cell text-align-center">';
                periode_value += '' + number_format(data.count_prospek[val.user_id]) + '';
                periode_value += '</td>';
                periode_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="numeric-cell text-align-center">';
                periode_value += '' + number_format(count_day) + '';
                periode_value += '</td>';
                periode_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="numeric-cell text-align-center">';
                periode_value += '' + number_format(bonus_disiplin) + '';
                periode_value += '</td>';
                periode_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="numeric-cell text-align-center">';
                periode_value += '' + number_format((parseFloat(total_gaji) + parseFloat(bonus_disiplin)) - parseFloat(potongan_nominal)) + '';
                periode_value += '</td>';
                grand_total += (parseFloat(total_gaji) + parseFloat(bonus_disiplin)) - parseFloat(potongan_nominal);


                if (bukti_gaji != null) {
                    var btn_bukti = "btn-color-blueWhite";
                } else {
                    var btn_bukti = "text-add-colour-black-soft bg-dark-gray-young";
                }

                periode_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                periode_value += '   <a class="' + btn_bukti + ' button-small col button text-bold" href="/data-gaji-sales" onclick="geDetailGajiHistorySales(\'' + val.user_id + '\',\'' + val.karyawan_nama + '\',\'' + tanggal_awal + '\',\'' + tanggal_akhir + '\',\'' + bonus_disiplin + '\' ,\'' + bukti_gaji + '\');">Detail</a>';
                periode_value += '</td>';


                // periode_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                // periode_value += '  <button class="' + btn_bukti + ' button-small col button text-bold popup-open" data-popup=".bukti-gaji" onclick="buktiGaji(\'' + val.t_absensi_log_id + '\',\'' + bukti_gaji + '\');">Bukti</button>';
                // periode_value += '</td>';

                var sp_label = '';
                if (val.sp == null || val.sp == "0") {
                    sp_label = '-';
                } else if (val.sp == "sp") {
                    sp_label = 'SP';
                } else if (val.sp == "sp1") {
                    sp_label = 'SP-1';
                } else if (val.sp == "sp2") {
                    sp_label = 'SP-2';
                } else if (val.sp == "sp3") {
                    sp_label = 'SP-3';
                }
                periode_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                periode_value += '   <a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" data-popup=".data-sp-sales" onclick="getDataSpSales(\'' + val.user_id + '\',\'' + val.karyawan_nama + '\',\'' + val.sp + '\');">' + sp_label + '</a>';
                periode_value += '</td>';
                periode_value += '</tr>';
            });

            periode_value += '<tr>';
            periode_value += '     <td colspan="5" align="right"></td>';
            periode_value += '     <td align="center" style="border:1px solid gray;"  class="label-cell"  >' + number_format(parseFloat(grand_total)) + '</td>';
            periode_value += '</tr>';



            $$('#periodeGajiSales').show();
            if (tanggal_awal != undefined && tanggal_akhir != undefined) {
                $$('#periodeGajiSales').html('Periode : ' + moment(data.start_date.tanggal_awal).format('DD/MMM/YY') + ' - ' + moment(data.start_date.dt_record).format('DD/MMM/YY'));
            } else {
                $$('#periodeGajiSales').html('Periode : -');
            }

            $$('#data_karyawan_absensi_sales').html(periode_value);
            // $$('#pagination_button_absen').html(pagination_button);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function geDetailGajiHistorySales(user_id, karyawan_nama, tanggal_awal, tanggal_akhir, bonus_disiplin, bukti_gaji) {

    // $$('#btnConfirmGaji').css("display", "none");
    // $$('#btnBuktiDataGaji').css("display", "inline");

    $$("#nama_absen").show();
    $$("#nama_absen").html(karyawan_nama);


    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-history-absen-sales",
        dataType: 'JSON',
        data: {
            karyawan_id: user_id,
            tanggal_awal: tanggal_awal,
            tanggal_akhir: tanggal_akhir
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            localStorage.removeItem("calc_total_sales");
            localStorage.removeItem("tanggal_awal_sales");
            localStorage.removeItem("tanggal_akhir_sales");
        },
        success: function (data) {
            app.dialog.close();
            var data_absen = '';
            $$("#tanggal_awal_gaji_sales").val(tanggal_awal);
            $$("#tanggal_akhir_gaji_sales").val(tanggal_akhir);
            localStorage.setItem("bukti_gaji_sales", bukti_gaji);
            $$("#karyawan-nama-data-gaji-sales").html(karyawan_nama);
            $$('#btnConfirmGajiSales').hide();
            $$('#btnBuktiDataGajiSales').show();
            localStorage.setItem("user_id_gaji_sales", user_id);


            if (data.data.length != 0) {
                var no = 0;
                var calc_total = 0;
                var grand_total = 0;
                var calc_gaji = 0;
                var calc_potongan = 0;
                // var calc_tunjangan = 0;
                // var tunjangan = 0;
                var total = 0;
                var color_row = "";
                jQuery.each(data.data, function (i, val) {
                    no++

                    var status_terlambat = "";
                    var potongan_nominal = 0;

                    if (val.is_valid == 1 && val.jam_keluar != null && val.jam_masuk != null) {
                        color_row = "card-color-blue";
                    } else if (val.is_valid == 2) {
                        color_row = "card-color-blood";
                    } else if (val.jam_keluar == null) {
                        color_row = "card-color-orange";
                    } else {
                        color_row = "";
                    }

                    data_absen += '<tr class="' + color_row + '">';
                    data_absen += '		<td style="width:13%;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + no + '</td>';
                    data_absen += '		<td style="width:25%;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + moment(val.tanggal_absen).format('DD-MMM-YY') + '</td>';
                    data_absen += '		<td style="width:12%;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(val.gaji_pokok) + '</td>';


                    if (val.jam_masuk != null && val.is_valid == 1) {
                        // var time_telat = addMinutesToTimeSales(addMinutesToTimeSales(val.jam_masuk_shift, val.batas_telat), 1)
                        var selisih = diffSales(val.jam_masuk_shift, val.jam_masuk)
                        var convertMinute = moment.duration(selisih).asMinutes()
                        // var potongan_nominal = (convertMinute / val.batas_telat) * val.potongan;	
                        if (val.hide_potongan != 0) {
                            if (parseInt(convertMinute) >= 2 && parseInt(convertMinute) <= 5) {
                                potongan_nominal = 5000;
                            }
                            if (parseInt(convertMinute) >= 6 && parseInt(convertMinute) <= 20) {
                                potongan_nominal = 20000;
                            }
                            if (parseInt(convertMinute) > 20) {
                                potongan_nominal = 20000;
                            }
                        } else {
                            potongan_nominal = 0;
                        }
                        if (parseInt(convertMinute) >= 2 && val.is_valid == 1) {
                            status_terlambat = 'Terlambat';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        } else if (parseInt(convertMinute) < 2 && val.is_valid == 1) {
                            status_terlambat = 'Valid';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        } else if (val.is_valid == 0) {
                            status_terlambat = 'Belum Valid';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        }
                    } else if (val.is_valid == 2) {
                        status_terlambat = 'Di Tolak';
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                    } else {
                        status_terlambat = 'Belum Valid';
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                    }


                    if (val.jam_keluar != null) {
                        // tunjangan = val.tunjangan;
                        total = parseFloat(val.gaji_pokok) - parseFloat(potongan_nominal);
                    } else {
                        total = 0;
                        // tunjangan = 0;
                    }
                    // data_absen += '		<td style="width:12%;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(tunjangan) + '</td>';

                    if (data.count_prospek[val.tanggal_absen].length != 0) {
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center"><a style="color:white;" onclick="getPageProspek(\'' + val.tanggal_absen + '\')">' + number_format(data.count_prospek[val.tanggal_absen].length) + '</a></td>';
                    } else {
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center"><a style="color:white;">' + number_format(0) + '</a></td>';
                    }



                    if (val.jam_masuk != null && val.jam_keluar != null) {
                        var btn_jam_detail = "btn-color-blueWhite";
                    } else if (val.jam_masuk == null || val.jam_keluar == null) {
                        var btn_jam_detail = "card-color-red";
                    } else {
                        var btn_jam_detail = "text-add-colour-black-soft bg-dark-gray-young";
                    }

                    data_absen += '		<td style="width:12%;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(total) + '</td>';
                    data_absen += '		<td style="width:12%;border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
                    data_absen += '			<button onclick="getDetailDataAbsenSales(\'' + val.foto_masuk + '\',\'' + val.foto_keluar + '\',\'' + val.tanggal_absen + '\',\'' + val.jam_masuk + '\',\'' + val.jam_keluar + '\',\'' + val.gaji_pokok + '\',\'' + potongan_nominal + '\',\'' + status_terlambat + '\',\'' + total + '\',\'' + karyawan_nama + '\',\'' + val.lat_masuk + '\',\'' + val.long_masuk + '\',\'' + val.lat_keluar + '\',\'' + val.long_keluar + '\',\'' + val.long_keluar + '\')" class="' + btn_jam_detail + ' button-small col button popup-open text-bold" data-popup=".detail-data-gaji-sales">Detail</button>';
                    data_absen += '		</td>';
                    data_absen += '</tr>';

                    if (val.jam_masuk != null && val.jam_keluar != null) {
                        calc_total += parseFloat(total);
                    } else {
                        calc_total += parseFloat(0);
                    }

                    grand_total += parseFloat(total);
                    calc_gaji += parseFloat(val.gaji_pokok);
                    calc_potongan += parseFloat(potongan_nominal);
                    // calc_tunjangan += parseFloat(tunjangan);
                });


                data_absen += '<tr>';
                data_absen += '     <td colspan="5" align="right"></td>';
                data_absen += '     <td align="center" style="border:1px solid gray;"  class="label-cell"  >' + number_format(parseFloat(grand_total)) + '</td>';
                data_absen += '</tr>';

                localStorage.setItem("calc_total_sales", calc_total);
                localStorage.setItem("bonus_disiplin_sales", bonus_disiplin);


                if (no < 12) {
                    jQuery("#count_day_total_sales").html('<span style="margin-left: 12px;color:red">' + no + '</span>');
                } else {
                    jQuery("#count_day_total_sales").html('<span style="margin-left: 12px;color:navy">' + no + '</span>');
                }

                jQuery("#tabel_data_gaji_sales").html(data_absen);
                jQuery("#total-data-gaji_sales").html(number_format(calc_total));
                jQuery("#disiplin-value-sales").html(number_format(bonus_disiplin));

                // if (bonus_disiplin != 0 || bonus_disiplin != null) {
                //     $('#bonus-disiplin').prop('checked', true);
                //     $("#bonus-disiplin").click((e) => {
                //         e.stopPropagation();
                //         return false;
                //     });
                // } else {
                //     $('#bonus-disiplin').prop('checked', false);
                //     $("#bonus-disiplin").attr("disabled", true)
                //     $("#bonus-disiplin").click((e) => {
                //         e.stopPropagation();
                //         return false;
                //     });
                // }
                jQuery("#grand-total-gaji-sales").html(number_format(parseFloat(calc_total) + parseFloat(bonus_disiplin)));
            } else {
                jQuery("#tabel_data_gaji_sales").html('<td align="center" colspan="8">Tidak Ada data</td>');

            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function getDataKaryawanSales(page) {

    if (page == '' || page == null) {
        var page_now = 1;
    } else {
        var page_now = page;
    }

    $$('#periodeGajiSales').hide();
    // $$('#show_acc_disiplin').show();

    $$('#hideDocSales').show();
    $$('#hideDocPeriodeSales').hide();

    if (jQuery(".active-periode-sales").hasClass("bg-dark-gray-medium text-add-colour-white")) {
        jQuery(".active-periode-sales").removeClass("bg-dark-gray-medium text-add-colour-white");
        jQuery(".active-periode-sales").addClass("text-add-colour-gray");
        jQuery("#btnPeriodeSales_last").removeClass("text-add-colour-gray");
        jQuery("#btnPeriodeSales_last").addClass("bg-dark-gray-medium text-add-colour-white");
    }

    if (jQuery('#karyawan_filter_sales').val() == '' || jQuery('#karyawan_filter_sales').val() == null) {
        var karyawan_nama = "empty";
    } else {
        var karyawan_nama = jQuery('#karyawan_filter_sales').val();
    }

    var karyawan_value = "";
    var pagination_button = "";


    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-karyawan-sales?page=" + page_now + "",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id_gaji_sales"),
            karyawan_nama: karyawan_nama
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            no = 1;
            no_urut = 0;
            var grand_total = 0;
            for (i = 0; i < data.data.last_page; i++) {
                no = i + 1;
                pagination_button += '<i onclick="getDataKaryawanSales(' + no + ');"  style="border-radius:2px; width:40px; height:40px; background-color:#4c5269; padding-left:8px; padding-right:8px; margin:2px;">' + no + '</i>';
            }


            $.each(data.data.data, function (i, val) {
                no_urut++
                karyawan_value += '<tr>';
                karyawan_value += '<td align="center" style="border-bottom:1px solid gray; border-left:1px solid gray;"  class="label-cell"  >' + no_urut + '</td>';
                karyawan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + val.nik + '</td>';
                karyawan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="popup-open" data-popup=".popup-ktp-sales" onclick="fotoKtpSales(\'' + val.user_id + '\',\'' + val.foto_ktp + '\',\'' + val.karyawan_nama + '\',\'' + val.karyawan_alamat + '\',\'' + val.karyawan_hp + '\');">' + val.karyawan_nama + '</td>';

                var total = 0;
                var disiplin = 0;
                // var tunjangan = 0;

                var checked = "";
                var readonly = "";

                $.each(data.status_disiplin[val.user_id], function (i_disiplin, val_disiplin) {
                    if (val_disiplin.status_disiplin != 0 && val_disiplin.length != 0) {
                        checked = "checked";
                        disiplin = parseFloat(50000);
                    } else {
                        checked = "";
                        disiplin = parseFloat(0);
                    }
                });

                $.each(data.count_day[val.user_id], function (i_lembur, val_lembur) {
                    var lembur_nominal = (parseFloat(val.gaji_pokok) / 8);
                    var lmbr1 = 0;
                    var lmbr1_detail = 0;
                    var lmbr2 = 0;
                    var lmbr = 0;
                    var potongan_nominal = 0;

                    if (val_lembur.is_valid == 1) {
                        if (val_lembur.jam_keluar != null) {
                            tunjangan = val_lembur.tunjangan_absen;

                            var selisihLembur = diffSales(data.shift.jam_keluar_shift, val_lembur.jam_keluar);
                            var convertMinuteLembur = moment.duration(selisihLembur).asMinutes();
                            if (val.hide_lembur != 0) {
                                if (convertMinuteLembur >= 120) {
                                    lmbr1_detail = parseFloat(lembur_nominal) + 2000;
                                    lmbr2 = parseFloat(lembur_nominal) + 5000;
                                    lmbr = parseFloat(lmbr2) + parseFloat(lmbr1_detail);
                                } else if (convertMinuteLembur >= 60) {
                                    lmbr1_detail = parseFloat(lembur_nominal) + 2000;
                                    lmbr1 = parseFloat(lembur_nominal) + 2000;
                                    lmbr = lmbr1;
                                }
                            } else {
                                lmbr = 0;
                            }
                        }

                        if (val_lembur.jam_masuk != null) {

                            var selisih = diffSales(data.shift.jam_masuk_shift, val_lembur.jam_masuk)
                            var convertMinute = moment.duration(selisih).asMinutes()
                            if (val.hide_potongan != 0) {
                                if (parseInt(convertMinute) >= 2 && parseInt(convertMinute) <= 5) {
                                    potongan_nominal = 5000;
                                    readonly = "readonly";
                                    cssReadonly = "outline: 3px solid red";
                                    onclickCheck = "return false";
                                    // processDisiplinTelat(val.user_id, val.karyawan_nama, checked);
                                    // disiplin = parseFloat(0);
                                }
                                if (parseInt(convertMinute) >= 6 && parseInt(convertMinute) <= 20) {
                                    potongan_nominal = 20000;
                                    readonly = "readonly";
                                    cssReadonly = "outline: 3px solid red";
                                    onclickCheck = "return false";
                                    // processDisiplinTelat(val.user_id, val.karyawan_nama, checked);
                                    // disiplin = parseFloat(0);
                                }
                                if (parseInt(convertMinute) > 20) {
                                    potongan_nominal = 20000;
                                    readonly = "readonly";
                                    cssReadonly = "outline: 3px solid red";
                                    onclickCheck = "return false";
                                    // processDisiplinTelat(val.user_id, val.karyawan_nama, checked);
                                    // disiplin = parseFloat(0);
                                }
                            } else {
                                potongan_nominal = 0;
                            }
                        }
                        total += parseFloat(val.gaji_pokok) - parseFloat(potongan_nominal);
                    }
                });

                var prospek = 0;
                if (data.count_prospek[val.karyawan_id] > 0) {
                    prospek = 1;
                } else {
                    prospek = 0;
                }

                karyawan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="numeric-cell text-align-center">';
                karyawan_value += '' + number_format(prospek) + '';
                karyawan_value += '</td>';

                karyawan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="numeric-cell text-align-center">';
                karyawan_value += '' + number_format(data.count_day[val.user_id].length) + '';
                karyawan_value += '</td>';

                grand_total += parseFloat(total) + parseFloat(disiplin);
                // $('#tunjangan_' + val.user_id + '').mask('000,000,000,000', { reverse: true });
                karyawan_value += '<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(disiplin) + '</td>';
                karyawan_value += '<td style="border-left: 1px solid grey;border-right:1px solid gray; border-bottom:1px solid gray;" class="numeric-cell text-align-center">';
                karyawan_value += '' + number_format(parseFloat(total) + parseFloat(disiplin)) + '';
                karyawan_value += '</td>';


                if (val.bukti_gaji != null) {
                    var btn_foto = "btn-color-blueWhite";
                } else {
                    var btn_foto = "text-add-colour-black-soft bg-dark-gray-young";
                }

                // karyawan_value += '<td style="border-bottom:1px solid gray;" class="label-cell">';
                // karyawan_value += '   <input ' + checked + ' readonly="' + readonly + '" style="height: 15px; width: 15px;" onchange="processDisiplinSales(\'' + val.user_id + '\',\'' + val.karyawan_nama + '\')" type="checkbox" name="bonus_disiplin_check_sales_' + val.user_id + '" id="bonus_disiplin_check_sales_' + val.user_id + '"/>';
                // karyawan_value += '</td>';

                karyawan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                karyawan_value += '   <a class="' + btn_foto + ' button-small col button text-bold" href="/data-gaji-sales" onclick="geDetailGajiSales(\'' + val.user_id + '\',\'' + val.karyawan_nama + '\');">Detail</a>';
                karyawan_value += '</td>';
                // karyawan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                // karyawan_value += '  <button class="' + btn_foto + ' button-small col button text-bold popup-open" data-popup=".bukti-gaji" onclick="buktiGaji(\'' + val.t_absensi_log_id + '\',\'' + val.bukti_gaji + '\');">Bukti</button>';
                // karyawan_value += '</td>';

                var sp_label = '';
                if (val.sp == null || val.sp == "0") {
                    sp_label = '-';
                } else if (val.sp == "sp") {
                    sp_label = 'SP';
                } else if (val.sp == "sp1") {
                    sp_label = 'SP-1';
                } else if (val.sp == "sp2") {
                    sp_label = 'SP-2';
                } else if (val.sp == "sp3") {
                    sp_label = 'SP-3';
                }
                karyawan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
                karyawan_value += '   <a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" data-popup=".data-sp-sales" onclick="getDataSpSales(\'' + val.user_id + '\',\'' + val.karyawan_nama + '\',\'' + val.sp + '\');">' + sp_label + '</a>';
                karyawan_value += '</td>';
                karyawan_value += '</tr>';
            });

            karyawan_value += '<tr>';
            karyawan_value += '     <td colspan="6" align="right"></td>';
            karyawan_value += '     <td align="center" style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  >' + number_format(parseFloat(grand_total)) + '</td>';
            karyawan_value += '</tr>';

            $$('#data_karyawan_absensi_sales').html(karyawan_value);
            // $$('#pagination_button_absen').html(pagination_button);

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function processDisiplinSales(user_id, karyawan_nama) {

    var disiplin = 0;
    var text = "";
    var text_succees = "";

    if ($$("#bonus_disiplin_check_sales_" + user_id).prop('checked') == true) {
        disiplin = 1;
        text = "Konfirmasi Bonus Disiplin ";
        text_succees = "Berhasil Menambahkan Bonus Disiplin ";
    } else {
        disiplin = 0;
        text = "Hapus Bonus Disiplin ";
        text_succees = "Berhasil Menghapus Bonus Disiplin ";
    }
    app.dialog.confirm('' + text + ' ' + karyawan_nama + ' ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/process-disiplin-sales",
                dataType: "JSON",
                data: {
                    user_id: user_id,
                    disiplin: disiplin,
                    karyawan_nama: karyawan_nama,
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.status == 'done') {
                        app.dialog.create({
                            text: text_succees,
                            verticalButtons: true,
                        }).open();
                        setTimeout(function () {
                            app.dialog.close();
                            app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
                                ignoreCache: true,
                                reloadCurrent: true
                            });
                        }, 2000);
                    } else if (data.status == 'failed') {
                        app.dialog.create({
                            text: 'Gagal Ubah Bonus Disiplin',
                            verticalButtons: true,
                        }).open();
                        setTimeout(function () {
                            app.dialog.close();
                        }, 2000);
                    }
                }
            });

        }
    }, function () { $('#bonus_disiplin_check_sales_' + user_id).prop('checked', false); });
}

function geDetailGajiSales(user_id, karyawan_nama) {
    // $$('#btnConfirmGaji').css("display", "inline");
    // $$('#btnBuktiDataGaji').css("display", "none");
    $("#bonus-disiplin-sales").click((e) => {
        e.stopPropagation();
        return true;
    });

    $$("#nama_absen").show();
    $$("#nama_absen").html(karyawan_nama);

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-absen-sales",
        dataType: 'JSON',
        data: {
            karyawan_id: user_id
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
            localStorage.removeItem("calc_total_sales");
            localStorage.removeItem("karyawan_nama_gaji_sales");
            localStorage.removeItem("user_id_gaji_sales");
        },
        success: function (data) {
            app.dialog.close();
            var data_absen = '';
            localStorage.setItem("karyawan_nama_gaji_sales", karyawan_nama);
            localStorage.setItem("user_id_gaji_sales", user_id);
            $$('#btnConfirmGajiSales').show();
            $$('#btnBuktiDataGajiSales').hide();
            $$("#karyawan-nama-data-gaji-sales").html(localStorage.getItem("karyawan_nama_gaji_sales"));
            if (data.data.length != 0) {
                var no = 0;
                var calc_total = 0;
                var calc_gaji = 0;
                var disiplin = 0;
                var calc_potongan = 0;
                // var calc_tunjangan = 0;

                jQuery.each(data.data, function (i, val) {
                    no++
                    // var tunjangan = 0;
                    var total = 0;
                    var potongan_nominal = 0;
                    var gaji_pokok = 0;
                    var status_terlambat = "";
                    var color_row = "";

                    if (val.is_valid == 1 && val.jam_keluar != null && val.jam_masuk != null) {
                        color_row = "card-color-blue";
                    } else if (val.is_valid == 2) {
                        color_row = "card-color-blood";
                    } else if (val.jam_keluar == null) {
                        color_row = "card-color-orange";
                    } else {
                        color_row = "";
                    }

                    if (val.is_valid == 1 && val.jam_keluar != null && val.jam_masuk != null) {
                        gaji_pokok = val.gaji_pokok;
                    }
                    data_absen += '<tr class="' + color_row + '">';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + no + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + moment(val.tanggal_absen).format('DD-MMM-YY') + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(gaji_pokok) + '</td>';


                    if (val.jam_masuk != null && val.is_valid == 1) {
                        // var time_telat = addMinutesToTimeSales(addMinutesToTimeSales(val.jam_masuk_shift, val.batas_telat), 1)
                        var selisih = diffSales(val.jam_masuk_shift, val.jam_masuk)
                        var convertMinute = moment.duration(selisih).asMinutes()
                        // var potongan_nominal = (convertMinute / val.batas_telat) * val.potongan;	
                        if (val.hide_potongan != 0) {
                            if (parseInt(convertMinute) >= 2 && parseInt(convertMinute) <= 5) {
                                potongan_nominal = 5000;
                            }
                            if (parseInt(convertMinute) >= 6 && parseInt(convertMinute) <= 20) {
                                potongan_nominal = 20000;
                            }
                            if (parseInt(convertMinute) > 20) {
                                potongan_nominal = 20000;
                            }
                        } else {
                            potongan_nominal = 0;
                        }
                        if (parseInt(convertMinute) >= 2 && val.is_valid == 1) {
                            status_terlambat = 'Terlambat';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        } else if (parseInt(convertMinute) < 2 && val.is_valid == 1) {
                            status_terlambat = 'Valid';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        } else if (val.is_valid == 0) {
                            status_terlambat = 'Belum Valid';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        }
                    } else if (val.is_valid == 2) {
                        status_terlambat = 'Di Tolak';
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                    } else {
                        status_terlambat = 'Belum Valid';
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                    }

                    if (val.jam_masuk != null && val.jam_keluar != null && val.is_valid == 1) {
                        // tunjangan = val.tunjangan_absen;
                        total = parseFloat(parseFloat(gaji_pokok)) - parseFloat(potongan_nominal);
                    } else {
                        // tunjangan = 0;
                        total = 0;
                    }

                    // data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(tunjangan) + '</td>';


                    if (val.jam_masuk != null && val.jam_keluar != null) {
                        var btn_jam_detail = "btn-color-blueWhite";
                    } else if (val.jam_masuk == null || val.jam_keluar == null) {
                        var btn_jam_detail = "card-color-red";
                    } else {
                        var btn_jam_detail = "text-add-colour-black-soft bg-dark-gray-young";
                    }

                    if (data.count_prospek[val.tanggal_absen].length != 0) {
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center"><a style="color:white;" onclick="getPageProspek(\'' + val.tanggal_absen + '\')">' + number_format(data.count_prospek[val.tanggal_absen].length) + '</a></td>';
                    } else {
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center"><a style="color:white;">' + number_format(0) + '</a></td>';
                    }


                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(total) + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
                    data_absen += '			<button onclick="getDetailDataAbsenSales(\'' + val.foto_masuk + '\',\'' + val.foto_keluar + '\',\'' + val.tanggal_absen + '\',\'' + val.jam_masuk + '\',\'' + val.jam_keluar + '\',\'' + gaji_pokok + '\',\'' + potongan_nominal + '\',\'' + status_terlambat + '\',\'' + total + '\',\'' + karyawan_nama + '\',\'' + val.lat_masuk + '\',\'' + val.long_masuk + '\',\'' + val.lat_keluar + '\',\'' + val.long_keluar + '\')" class="' + btn_jam_detail + ' button-small col button popup-open text-bold" data-popup=".detail-data-gaji-sales">Detail</button>';
                    data_absen += '		</td>';
                    data_absen += '</tr>';


                    if (val.jam_masuk != null && val.jam_keluar != null && val.is_valid == 1) {
                        calc_total += parseFloat(total);
                        calc_gaji += parseFloat(gaji_pokok);
                        // calc_tunjangan += parseFloat(tunjangan);
                        calc_potongan += parseFloat(potongan_nominal);
                    } else {
                        calc_total += parseFloat(0);

                    }

                });

                data_absen += '<tr>';
                data_absen += '     <td colspan="5" align="right"></td>';
                data_absen += '     <td align="center" style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  >' + number_format(parseFloat(calc_total)) + '</td>';
                data_absen += '</tr>';
                if (no < 12) {
                    jQuery("#count_day_total").html('<span style="color:red"><b>' + no + '</b></span>');
                } else {
                    jQuery("#count_day_total").html('<span style="color:navy"><b>' + no + '</b></span>');
                }



                if (data.status_disiplin.status_disiplin != 0 && data.status_disiplin != 0) {
                    checked = "checked disabled";
                    disiplin = parseFloat(50000);
                } else {
                    checked = "";
                    disiplin = parseFloat(0);
                }

                jQuery("#tabel_data_gaji_sales").html(data_absen);

                localStorage.setItem("calc_total_sales", calc_total);
                jQuery("#total-data-gaji-sales").html(number_format(calc_total));
                jQuery("#disiplin-value-sales").html(number_format(disiplin));
                jQuery("#grand-total-gaji-sales").html(number_format(parseFloat(calc_total) + parseFloat(disiplin)));

            } else {
                jQuery("#tabel_data_gaji_sales").html('<td align="center" colspan="8">Tidak Ada data</td>');

            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function geDetailGajiSalesConfirm(tanggal_akhir_sales) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-absen-sales-confirm",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id_gaji_sales"),
            tanggal_akhir: tanggal_akhir_sales
        },
        beforeSend: function () {
        },
        success: function (data) {
            app.dialog.close();
            var data_absen = '';
            if (data.data.length != 0) {
                var no = 0;
                var calc_total = 0;
                var calc_gaji = 0;
                var disiplin = 0;
                var calc_potongan = 0;
                // var calc_tunjangan = 0;

                jQuery.each(data.data, function (i, val) {
                    no++
                    // var tunjangan = 0;
                    var total = 0;
                    var potongan_nominal = 0;
                    var gaji_pokok = 0;
                    var status_terlambat = "";
                    var color_row = "";
                    if (val.is_valid == 1 && val.jam_keluar != null && val.jam_masuk != null) {
                        gaji_pokok = val.gaji_pokok;
                    }

                    if (val.jam_masuk != null && val.is_valid == 1) {
                        // var time_telat = addMinutesToTimeSales(addMinutesToTimeSales(val.jam_masuk_shift, val.batas_telat), 1)
                        var selisih = diffSales(val.jam_masuk_shift, val.jam_masuk)
                        var convertMinute = moment.duration(selisih).asMinutes()
                        // var potongan_nominal = (convertMinute / val.batas_telat) * val.potongan;	
                        if (val.hide_potongan != 0) {
                            if (parseInt(convertMinute) >= 2 && parseInt(convertMinute) <= 5) {
                                potongan_nominal = 5000;
                            }
                            if (parseInt(convertMinute) >= 6 && parseInt(convertMinute) <= 20) {
                                potongan_nominal = 20000;
                            }
                            if (parseInt(convertMinute) > 20) {
                                potongan_nominal = 20000;
                            }
                        } else {
                            potongan_nominal = 0;
                        }
                    }

                    if (val.jam_masuk != null && val.jam_keluar != null && val.is_valid == 1) {
                        total = parseFloat(parseFloat(gaji_pokok)) - parseFloat(potongan_nominal);
                    } else {
                        total = 0;
                    }

                    if (val.jam_masuk != null && val.jam_keluar != null && val.is_valid == 1) {
                        calc_total += parseFloat(total);
                        calc_gaji += parseFloat(gaji_pokok);
                        // calc_tunjangan += parseFloat(tunjangan);
                        calc_potongan += parseFloat(potongan_nominal);
                    } else {
                        calc_total += parseFloat(0);

                    }

                });


                if (data.status_disiplin.status_disiplin != 0 && data.status_disiplin != 0) {
                    checked = "checked disabled";
                    disiplin = parseFloat(50000);
                } else {
                    checked = "";
                    disiplin = parseFloat(0);
                }

                jQuery("#tabel_data_gaji_sales").html(data_absen);

                localStorage.setItem("calc_total_sales", calc_total);
                localStorage.setItem("calc_gaji_sales", calc_gaji);
                localStorage.setItem("calc_potongan_sales", calc_potongan);

                jQuery("#total-data-gaji-sales").html(number_format(calc_total));
                jQuery("#disiplin-value-sales").html(number_format(disiplin));
                jQuery("#grand-total-gaji-sales").html(number_format(parseFloat(calc_total) + parseFloat(disiplin)));

                confirmGajiSales(tanggal_akhir_sales);
            } else {
                jQuery("#tabel_data_gaji_sales").html('<td align="center" colspan="8">Tidak Ada data</td>');

            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function getPageProspek(tanggal_absen) {
    localStorage.setItem("tanggal_kunjungan", tanggal_absen);
    return app.views.main.router.navigate('/kunjungan-sales');
}

function buktiGajiSales() {
    var bukti_gaji = localStorage.getItem("bukti_gaji_sales");
    $('#file_foto_view_now_sales').attr('src', '');
    if (bukti_gaji == null || bukti_gaji == undefined || bukti_gaji == 'undefined') {
        jQuery('#file_foto_view_now_sales').attr('src', BASE_PATH_IMAGE_BUKTI_GAJI + '/noimage.jpg');
    } else {
        jQuery('#file_foto_view_now_sales').attr('src', BASE_PATH_IMAGE_BUKTI_GAJI + '/' + bukti_gaji);
    }
}

function fotoKtpSales(user_id, foto_ktp, karyawan_nama, karyawan_alamat, karyawan_hp) {
    $('#karyawan_nama_ktp_sales').html(karyawan_nama);
    $('#nama_ktp_sales').html(' ' + karyawan_nama);
    $('#handphone_ktp_sales').html(' ' + karyawan_hp);
    $('#alamat_ktp_sales').html(' ' + karyawan_alamat);
    $('#file_ktp_view_now_sales').attr('src', '');
    if (foto_ktp == null || foto_ktp == 'null' || foto_ktp == undefined || foto_ktp == 'undefined') {
        jQuery('#file_ktp_view_now_sales').attr('src', BASE_PATH_IMAGE_FOTO_KTP + '/noimage.jpg');
    } else {
        jQuery('#file_ktp_view_now_sales').attr('src', BASE_PATH_IMAGE_FOTO_KTP + '/' + foto_ktp);
    }
}

function getDataSpSales(user_id, karyawan_nama, sp) {
    $('#file_foto_view_sp_now_sales').attr('src', '');
    $$("#show-btn-foto-sales").hide();
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-detail-karyawan-sales",
        dataType: 'JSON',
        data: {
            user_id: user_id
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            localStorage.setItem("user_id_sp_sales", user_id);
            var data_sp = '';
            var optionSp = '';

            if (data.data.sp == null || data.data.sp == "0") {
                data_sp = '-';
            } else if (data.data.sp == "sp") {
                data_sp = 'SP';
            } else if (data.data.sp == "sp1") {
                data_sp = 'SP-1';
            } else if (data.data.sp == "sp2") {
                data_sp = 'SP-2';
            } else if (data.data.sp == "sp3") {
                data_sp = 'SP-3';
            }
            jQuery('#status_sp_sales').html(data_sp);
            localStorage.setItem("data_sp_sales", data.data.sp);

            if (data.data.sp == null || data.data.sp == "0") {
                optionSp += '<option value="" selected>Pilih SP</option>';
                optionSp += '<option value="sp">SP</option>';
            } else if (data.data.sp == "sp") {
                $$("#show-btn-foto-sales").show();
                optionSp += '<option value="" selected>Pilih SP</option>';
                optionSp += '<option value="0">Tidak Ada</option>';
                optionSp += '<option value="sp1">SP-1</option>';
            } else if (data.data.sp == "sp1") {
                $$("#show-btn-foto-sales").show();
                optionSp += '<option value="" selected>Pilih SP</option>';
                optionSp += '<option value="sp">SP</option>';
                optionSp += '<option value="sp2">SP-2</option>';
            } else if (data.data.sp == "sp2") {
                $$("#show-btn-foto-sales").show();
                optionSp += '<option value="" selected>Pilih SP</option>';
                optionSp += '<option value="sp1">SP-1</option>';
                optionSp += '<option value="sp3">SP-3</option>';
            } else if (data.data.sp == "sp3") {
                $$("#show-btn-foto-sales").show();
                optionSp += '<option value="" selected>Pilih SP</option>';
                optionSp += '<option value="sp2">SP-2</option>';
            }

            jQuery('#sp_value_sales').html(optionSp);

            if (data.data.bukti_sp == null) {
                jQuery('#file_foto_view_sp_now_sales').attr('src', BASE_PATH_IMAGE_BUKTI_SP + '/noimage.jpg');
            } else {
                jQuery('#file_foto_view_sp_now_sales').attr('src', BASE_PATH_IMAGE_BUKTI_SP + '/' + data.data.bukti_sp);
            }

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function btnFotoShowSales(user_id, karyawan_nama) {
    if (jQuery('#sp_value_sales').val() == "sp") {
        $$("#show-btn-foto-sales").show();
    } else if (jQuery('#sp_value_sales').val() == "sp1") {
        if (jQuery('#sp_value_sales').val() == "sp") {
            $$("#show-btn-foto-sales").hide();
        } else {
            $$("#show-btn-foto-sales").show();
        }
    } else if (jQuery('#sp_value_sales').val() == "sp2") {
        $$("#show-btn-foto-sales").show();
    } else if (jQuery('#sp_value_sales').val() == "sp3") {
        $$("#show-btn-foto-sales").show();
    } else {
        $$("#show-btn-foto-sales").hide();
    }
}

function fillTunjanganSales(user_id, karyawan_nama) {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(function () {
        var tunjangan = jQuery('#tunjangan_sales_' + user_id).val();
        var replace_tunjangan = tunjangan.replace(/\,/g, '')
        changeTunjanganSales(replace_tunjangan, user_id, karyawan_nama);
    }, 3000);
}

function addMinutesToTimeSales(time, minsAdd) {
    function z(n) { return (n < 10 ? '0' : '') + n; };
    var bits = time.split(':');
    var mins = bits[0] * 60 + +bits[1] + +minsAdd;
    return z(mins % (24 * 60) / 60 | 0) + ':' + z(mins % 60);
}

function diffSales(start, end) {
    start = start.split(":");
    end = end.split(":");
    var startDate = new Date(0, 0, 0, start[0], start[1], 0);
    var endDate = new Date(0, 0, 0, end[0], end[1], 0);
    var diff = endDate.getTime() - startDate.getTime();
    var hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    var minutes = Math.floor(diff / 1000 / 60);

    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
}

function dateDiffInDaysSales(a, b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function getDetailDataAbsenSales(foto_masuk, foto_keluar, tanggal_absen, jam_masuk, jam_keluar, gaji, potongan, status_terlambat, total, karyawan_nama, lat_masuk, long_masuk, lat_keluar, long_keluar) {
    jQuery("#tanggal_gaji_detail_sales").html(moment(tanggal_absen).format('DD-MMM-YY'));

    if (jam_masuk != 'null') {
        jQuery("#jam_masuk_detail_gaji_sales").html(jam_masuk);
        jQuery("#jam_masuk_detail_gaji_sales").removeClass('text-add-colour-red text-bold');
    } else {
        jQuery("#jam_masuk_detail_gaji_sales").html('Belum Absen');
        jQuery("#jam_masuk_detail_gaji_sales").addClass('text-add-colour-red text-bold');
    }

    if (jam_keluar != 'null') {
        jQuery("#jam_keluar_detail_gaji_sales").html(jam_keluar);
        jQuery("#jam_keluar_detail_gaji_sales").removeClass('text-add-colour-red text-bold');
    } else {
        jQuery("#jam_keluar_detail_gaji_sales").html('Belum Absen');
        jQuery("#jam_keluar_detail_gaji_sales").addClass('text-add-colour-red text-bold');
    }

    var lokasi_masuk = "";
    lokasi_masuk += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
    lokasi_masuk += 'src="https://maps.google.com/maps?q=' + lat_masuk + ',' + long_masuk + '&hl=id&z=14&amp;output=embed">';
    lokasi_masuk += '</iframe>';

    if (lat_masuk != 'null' && long_masuk != 'null') {
        jQuery("#map-masuk-sales").html(lokasi_masuk);
    } else {
        jQuery("#map-masuk-sales").html("Lokasi Tidak Ada");
    }


    var lokasi_keluar = "";
    lokasi_keluar += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
    lokasi_keluar += 'src="https://maps.google.com/maps?q=' + lat_keluar + ',' + long_keluar + '&hl=id&z=14&amp;output=embed">';
    lokasi_keluar += '</iframe>';

    if (lat_keluar != 'null' && long_keluar != 'null') {
        jQuery("#map-keluar-sales").html(lokasi_keluar);
    } else {
        jQuery("#map-keluar-sales").html("Lokasi Tidak Ada");
    }

    // jQuery("#tunjangan_detail_gaji_sales").html(number_format(tunjangan));
    jQuery("#gaji_pokok_detail_gaji_sales").html(number_format(gaji));
    jQuery("#potongan_detail_gaji_sales").html(number_format(potongan));
    jQuery("#karyawan-nama-detail-gaji-sales").html(karyawan_nama);
    jQuery("#total_gaji_detail_gaji_sales").html(number_format(total));
    jQuery("#status_terlambat_detail_gaji_sales").html(status_terlambat);

    if (status_terlambat == 'Terlambat' || status_terlambat == 'Di Tolak') {
        jQuery("#potongan_detail_gaji_sales").removeClass("text-bold");
        jQuery("#status_terlambat_detail_gaji_sales").removeClass("btn-color-blueWhite");
        jQuery("#jam_masuk_detail_gaji_sales").removeClass("text-bold");
        jQuery("#potongan_detail_gaji_sales").addClass("text-add-colour-red text-bold");
        jQuery("#status_terlambat_detail_gaji_sales").addClass("card-color-red ");
        jQuery("#jam_masuk_detail_gaji_sales").addClass("text-add-colour-red text-bold");
    } else if (status_terlambat == 'Valid') {
        jQuery("#potongan_detail_gaji_sales").removeClass("text-add-colour-red text-bold");
        jQuery("#status_terlambat_detail_gaji_sales").removeClass("card-color-red");
        jQuery("#jam_masuk_detail_gaji_sales").removeClass("text-add-colour-red text-bold");
        jQuery("#potongan_detail_gaji_sales").addClass("text-bold");
        jQuery("#status_terlambat_detail_gaji_sales").addClass("btn-color-blueWhite");
        jQuery("#jam_masuk_detail_gaji_sales").addClass("text-bold");
    } else {
        jQuery("#potongan_detail_gaji_sales").removeClass("text-add-colour-red text-bold");
        jQuery("#status_terlambat_detail_gaji_sales").removeClass("card-color-red ");
        jQuery("#status_terlambat_detail_gaji_sales").removeClass("btn-color-blueWhite");
        jQuery("#jam_masuk_detail_gaji_sales").removeClass("text-add-colour-red text-bold");
    }


    var image_masuk = '';
    if (foto_masuk != 'null') {
        image_masuk = BASE_PATH_IMAGE_ABSEN + "/" + foto_masuk;
        jQuery("#image-data-masuk-sales").attr("src", "" + image_masuk + "");
    } else {
        image_masuk = BASE_PATH_IMAGE_ABSEN + "/noimage.jpg";
        jQuery("#image-data-masuk-sales").attr("src", "" + image_masuk + "");
    }

    var image_keluar = '';
    if (foto_keluar != 'null') {
        image_keluar = BASE_PATH_IMAGE_ABSEN + "/" + foto_keluar;
        jQuery("#image-data-keluar-sales").attr("src", "" + image_keluar + "");
    } else {
        image_keluar = BASE_PATH_IMAGE_ABSEN + "/noimage.jpg";
        jQuery("#image-data-keluar-sales").attr("src", "" + image_keluar + "");
    }

}

function gambarSpSales() {
    if (jQuery('#bukti_sp_sales').val() == '' || jQuery('#bukti_sp_sales').val() == null) {
        $$('#value_bukti_sp_sales').html('FOTO SP');
    } else {
        $$('#value_bukti_sp_sales').html($$('#bukti_sp_sales').val().replace('fakepath', ''));
    }
}

function confirmGajiSales(tanggal_akhir_sales) {

    if (localStorage.getItem("internet_koneksi") == 'fail') {
        app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
        });
    } else {

        var disiplin = 0;
        var total_gaji = 0;

        if ($('#bonus-disiplin-sales').prop('checked', true)) {
            disiplin = 50000;
        } else {
            disiplin = 0;
        }

        var formData = new FormData();
        formData.append('user_id_sales', localStorage.getItem("user_id_gaji_sales"));
        formData.append('calc_gaji_sales', localStorage.getItem("calc_gaji_sales"));
        formData.append('calc_potongan_sales', localStorage.getItem("calc_potongan_sales"));
        formData.append('karyawan_nama_sales', localStorage.getItem("karyawan_nama_gaji_sales"));
        formData.append('disiplin_sales', disiplin);
        // formData.append('bukti_gaji_sales', $('#bukti_gaji_sales').prop('files')[0]);     
        formData.append('bukti_gaji_sales', localStorage.getItem("bukti_gaji_sales"));
        formData.append('tanggal_akhir_sales', tanggal_akhir_sales);


        if (localStorage.getItem("bukti_gaji_sales") != null || localStorage.getItem("bukti_gaji_sales") != 'null' || localStorage.getItem("bukti_gaji_sales") != '') {

            // $$("#formdata-append").html(localStorage.getItem("user_id_gaji_sales") + '<br>' + localStorage.getItem("calc_gaji_sales") + '<br>' + localStorage.getItem("calc_potongan_sales") + '<br>' + localStorage.getItem("karyawan_nama_sales") + '<br>' + disiplin + '<br>' + localStorage.getItem("bukti_gaji_sales") + '</br>' + tanggal_akhir_sales);
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/confirm-gaji-sales",
                dataType: "JSON",
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'done') {
                        app.dialog.alert('Berhasil Konfirmasi Gaji');
                        app.popup.close();
                        setTimeout(function () {
                            app.views.main.router.navigate('/absensi');
                        }, 2000);
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Konfirmasi Gaji');
                    }
                }
            });
        } else {
            app.dialog.alert('Silahkan Pilih Bukti Gaji');
        }
    }
}

function simpanSPsales() {
    if (!$$('#insert-sp-sales')[0].checkValidity()) {
        app.dialog.alert('Cek Isian SP Anda');
    } else {
        if (localStorage.getItem("data_sp_sales") == "sp" && $$("#sp_value_sales").val() == '0' || $$("#sp_value_sales").val() == 'sp') {
            if (localStorage.getItem("internet_koneksi") == 'fail') {
                app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

                });
            } else {
                var formData = new FormData(jQuery("#insert-sp-sales")[0]);
                formData.append('user_id_sales', localStorage.getItem("user_id_sp_sales"));
                jQuery.ajax({
                    type: "POST",
                    url: "" + BASE_API + "/simpan-sp-sales",
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
                            app.dialog.alert('Berhasil Simpan Data SP');
                            getDataKaryawanSales();
                            $$('#value_bukti_sp_sales').html('FOTO SP');
                            $$('#bukti_sp_sales').val('');
                            app.popup.close();
                        } else if (data.status == 'failed') {
                            app.dialog.alert('Gagal Simpan Data SP');
                        }
                    }
                });
            }
        } else {
            if ($$('#bukti_sp_sales').val() != '') {
                if (localStorage.getItem("internet_koneksi") == 'fail') {
                    app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

                    });
                } else {
                    var formData = new FormData(jQuery("#insert-sp-sales")[0]);
                    formData.append('user_id_sales', localStorage.getItem("user_id_sp_sales"));
                    jQuery.ajax({
                        type: "POST",
                        url: "" + BASE_API + "/simpan-sp-sales",
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
                                app.dialog.alert('Berhasil Simpan Data SP');
                                getDataKaryawanSales();
                                $$('#value_bukti_sp_sales').html('FOTO SP');
                                $$('#bukti_sp_sales').val('');

                                app.popup.close();
                            } else if (data.status == 'failed') {
                                app.dialog.alert('Gagal Simpan Data SP');
                            }
                        }
                    });
                }
            } else {
                app.dialog.alert('Silahkan Upload Foto Bukti');
            }
        }
    }
}


function downloadPdfGajiSales() {
    var nom_disiplin = 0;

    if ($$('#bonus-disiplin-sales').is(':checked')) {
        nom_disiplin = 50000;
    } else {
        nom_disiplin = 0;
    }

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-history-absen-sales",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id_gaji_sales"),
            tanggal_awal: $$("#tanggal_awal_gaji_sales").val(),
            tanggal_akhir: $$("#tanggal_akhir_gaji_sales").val(),
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();

            var no = 0;
            var calc_total = 0;
            var total = 0;
            // var tunjangan = 0;
            var disiplin = 0;
            var gaji_pdf = '';


            if (data.data_log != null) {
                disiplin = data.data_log.bonus_disiplin;
            } else {
                if (data.status_disiplin.status_disiplin != 0 && data.status_disiplin != 0) {
                    disiplin = 50000;
                } else {
                    disiplin = 0;
                }
            }

            gaji_pdf += '<table width="100%" border="0">';
            gaji_pdf += '<tr colspan="7" ><td><br></td></tr>';
            gaji_pdf += '<tr>';
            gaji_pdf += '<td colspan="4" style="table-layout: auto;width: 100%;" align="left"><b>Karyawan : ' + data.data[0].karyawan_nama + '</b></td>';
            gaji_pdf += '</tr>';

            gaji_pdf += '<tr colspan="7" ><td><br></td></tr>';
            gaji_pdf += '</table>';
            gaji_pdf += '<table width="100%" border="0">';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center;">No</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Tanggal</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Gaji</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Potongan</th>';
            // gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Tunjangan</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-right: 1px solid grey;border-top: 1px solid grey;text-align:center">Total</th>';
            gaji_pdf += '</thead>';
            gaji_pdf += '<tbody>';

            if (data.data.length != 0) {

                jQuery.each(data.data, function (i, val) {

                    var potongan_nominal = 0;
                    if (val.is_valid == 1 && val.jam_masuk != null && val.jam_keluar != null) {
                        no++
                        gaji_pdf += '<tr>';
                        gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + no + '</td>';
                        gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + moment(val.tanggal_absen).format('DD-MMM-YY') + '</td>';
                        gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(val.gaji_pokok) + '</td>';


                        // if (val.jam_keluar != null) {
                        //     if (val.tunjangan != null || val.tunjangan == 0) {
                        //         tunjangan = val.tunjangan;
                        //     } else {
                        //         tunjangan = 0;
                        //     }

                        // } 

                        if (val.jam_masuk != null && val.is_valid == 1) {
                            // var time_telat = addMinutesToTimeSales(addMinutesToTimeSales(val.jam_masuk_shift, val.batas_telat), 1)
                            var selisih = diffSales(val.jam_masuk_shift, val.jam_masuk)
                            var convertMinute = moment.duration(selisih).asMinutes()
                            // var potongan_nominal = (convertMinute / val.batas_telat) * val.potongan;	
                            if (val.hide_potongan != 0) {
                                if (parseInt(convertMinute) >= 2 && parseInt(convertMinute) <= 5) {
                                    potongan_nominal = 5000;
                                }
                                if (parseInt(convertMinute) >= 6 && parseInt(convertMinute) <= 20) {
                                    potongan_nominal = 20000;
                                }
                                if (parseInt(convertMinute) > 20) {
                                    potongan_nominal = 20000;
                                }
                            } else {
                                potongan_nominal = 0;
                            }
                            if (parseInt(convertMinute) >= 2 && val.is_valid == 1) {
                                status_terlambat = 'Terlambat';
                                gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                            } else if (parseInt(convertMinute) < 2 && val.is_valid == 1) {
                                status_terlambat = 'Valid';
                                gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                            } else if (val.is_valid == 0) {
                                status_terlambat = 'Belum Valid';
                                gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                            }
                        } else if (val.is_valid == 2) {
                            status_terlambat = 'Di Tolak';
                            gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        } else {
                            status_terlambat = 'Belum Valid';
                            gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        }

                        // gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(tunjangan) + '</td>';
                        if (val.jam_keluar != null && val.is_valid != 2 && val.is_valid != 2) {

                            // tunjangan = val.tunjangan;
                            total = parseFloat(val.gaji_pokok) - parseFloat(potongan_nominal);
                        } else {
                            total = 0;
                            // tunjangan = 0;
                        }



                        gaji_pdf += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-right: 1px solid grey;text-align:center">' + number_format(total) + '</td>';;
                        gaji_pdf += '</tr>';

                        calc_total += parseFloat(total);
                    }
                });


                gaji_pdf += '<tr>';
                gaji_pdf += '		<td colspan="3" style="text-align:center;"></td>';
                gaji_pdf += '		<td colspan="1" style="text-align:left; padding-left:100px;">Gaji</td>';
                gaji_pdf += '		<td style="border-right: 1px solid grey;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(localStorage.getItem("calc_total_sales")) + '</td>';
                gaji_pdf += '</tr>';
                gaji_pdf += '<tr>';
                gaji_pdf += '		<td colspan="3" style="text-align:center;"></td>';
                gaji_pdf += '		<td colspan="1" style="text-align:left; padding-left:100px;">Disiplin</td>';
                gaji_pdf += '		<td style="border-right: 1px solid grey;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(disiplin) + '</td>';
                gaji_pdf += '</tr>';
                gaji_pdf += '<tr>';
                gaji_pdf += '		<td colspan="3" style="text-align:center;"></td>';
                gaji_pdf += '		<td colspan="1" style="text-align:left; padding-left:100px;">Total</td>';
                gaji_pdf += '		<td style="border-right: 1px solid grey;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(parseFloat(localStorage.getItem("calc_total_sales")) + parseFloat(disiplin)) + '</td>';
                gaji_pdf += '</tr>';


            } else {

                gaji_pdf += '<tr>';
                gaji_pdf += '		<td colspan="5" style="border-right: 1px solid grey;border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">Tidak Ada Data</td>';
                gaji_pdf += '</tr>';

            }

            gaji_pdf += '</tbody>';
            gaji_pdf += '</table>';

            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'report_gaji_' + data.data[0].karyawan_nama + '.pdf'
            }

            pdf.fromData(gaji_pdf, options)
                .then((stats) => console.log('status', stats))
                .catch((err) => console.err(err))

            console.log(gaji_pdf);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    })
}

function getDataValidSales() {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-absen-valid-sales",
        dataType: 'JSON',
        data: {
        },
        beforeSend: function () {
        },
        success: function (data) {
            var data_absen = '';
            if (data.data.length != 0) {
                var no = 0;
                var calc_total = 0;
                var calc_gaji = 0;
                var disiplin = 0;
                var calc_potongan = 0;

                jQuery.each(data.data, function (i, val) {
                    no++
                    var total = 0;
                    var gaji_pokok = 0;
                    var status_terlambat = "";

                    var potongan_nominal = 0;

                    if (val.jam_keluar != null && val.jam_masuk != null) {
                        gaji_pokok = val.gaji_pokok;
                    }
                    data_absen += '<tr>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + no + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + moment(val.tanggal_absen).format('DD-MMM-YY') + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + val.karyawan_nama + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(gaji_pokok) + '</td>';



                    if (val.jam_masuk != null) {
                        // var time_telat = addMinutesToTime(addMinutesToTime(val.jam_masuk_shift, val.batas_telat), 1)
                        var selisih = diffSales(val.jam_masuk_shift, val.jam_masuk)
                        var convertMinute = moment.duration(selisih).asMinutes()
                        // var potongan_nominal = (convertMinute / val.batas_telat) * val.potongan;	
                        if (val.hide_potongan != 0) {
                            if (parseInt(convertMinute) >= 2 && parseInt(convertMinute) <= 5) {
                                potongan_nominal = 5000;
                            }
                            if (parseInt(convertMinute) >= 6 && parseInt(convertMinute) <= 20) {
                                potongan_nominal = 20000;
                            }
                            if (parseInt(convertMinute) > 20) {
                                potongan_nominal = 20000;
                            }
                        } else {
                            potongan_nominal = 0;
                        }
                        if (parseInt(convertMinute) >= 2) {
                            status_terlambat = 'Terlambat';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        } else if (val.is_valid == 0) {
                            status_terlambat = 'Belum Valid';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        }
                    } else {
                        status_terlambat = 'Belum Valid';
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                    }

                    if (val.jam_masuk != null && val.jam_keluar != null) {
                        tunjangan = val.tunjangan_absen;
                        total = parseFloat(parseFloat(gaji_pokok) + parseFloat(0) + parseFloat(0)) - parseFloat(potongan_nominal);
                    } else {
                        tunjangan = 0;
                        total = 0;
                    }

                    if (val.jam_masuk != null && val.jam_keluar != null) {
                        var btn_jam_detail = "btn-color-blueWhite";
                    } else if (val.jam_masuk == null || val.jam_keluar == null) {
                        var btn_jam_detail = "card-color-red";
                    } else {
                        var btn_jam_detail = "text-add-colour-black-soft bg-dark-gray-young";
                    }

                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(total) + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
                    data_absen += '			<button onclick="getDetailDataValidSales(\'' + val.foto_masuk + '\',\'' + val.foto_keluar + '\',\'' + val.tanggal_absen + '\',\'' + val.jam_masuk + '\',\'' + val.jam_keluar + '\',\'' + val.gaji_pokok + '\',\'' + potongan_nominal + '\',\'' + status_terlambat + '\',\'' + total + '\',\'' + val.karyawan_nama + '\',\'' + val.absensi_id + '\',\'' + val.lat_masuk + '\',\'' + val.long_masuk + '\',\'' + val.lat_keluar + '\',\'' + val.long_keluar + '\',\'' + val.foto_karyawan + '\',\'' + val.user_id + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-data-gaji-valid-sales">Valid</button>';
                    data_absen += '		</td>';
                    data_absen += '</tr>';

                    if (val.jam_masuk != null && val.jam_keluar != null) {
                        calc_total += parseFloat(total);
                        calc_gaji += parseFloat(gaji_pokok);
                        calc_potongan += parseFloat(potongan_nominal);
                    } else {
                        calc_total += parseFloat(0);

                    }
                });

                data_absen += '<tr>';
                data_absen += '     <td colspan="5" align="right"></td>';
                data_absen += '     <td align="center" style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  >' + number_format(parseFloat(calc_total)) + '</td>';
                data_absen += '</tr>';

                jQuery("#count_data_valid_sales").html('<span style="color:white"><b>' + no + '</b></span>');
                jQuery("#tabel_data_absen_valid_sales").html(data_absen);
            } else {
                jQuery("#tabel_data_absen_valid_sales").html('<td align="center" colspan="8">Tidak Ada data</td>');

            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function getDetailDataValidSales(foto_masuk, foto_keluar, tanggal_absen, jam_masuk, jam_keluar, gaji, potongan, status_terlambat, total, karyawan_nama, absensi_id, lat_masuk, long_masuk, lat_keluar, long_keluar, foto_karyawan, user_id_disiplin) {

    localStorage.setItem("absensi_id_sales", absensi_id)
    localStorage.setItem("user_id_disiplin_sales", user_id_disiplin)
    jQuery("#tanggal_gaji_detail_valid_sales").html(moment(tanggal_absen).format('DD-MMM-YY'));

    if (jam_masuk != 'null') {
        jQuery("#jam_masuk_detail_valid_sales").html(jam_masuk);
    } else {
        jQuery("#jam_masuk_detail_valid_sales").html('Belum Absen');
        jQuery("#jam_masuk_detail_valid_sales").addClass('text-add-colour-red text-bold');
    }

    if (jam_keluar != 'null') {
        jQuery("#jam_keluar_detail_valid_sales").html(jam_keluar);
    } else {
        jQuery("#jam_keluar_detail_valid_sales").html('Belum Absen');
        jQuery("#jam_keluar_detail_valid_sales").addClass('text-add-colour-red text-bold');
    }

    // jQuery("#tunjangan_detail_valid_sales").html(number_format(tunjangan));
    jQuery("#gaji_pokok_detail_valid_sales").html(number_format(gaji));
    jQuery("#potongan_detail_valid_sales").html(number_format(potongan));
    jQuery("#karyawan-nama-detail-valid-sales").html(karyawan_nama);
    jQuery("#total_gaji_detail_valid_sales").html(number_format(total));
    jQuery("#status_terlambat_detail_valid_sales").html(status_terlambat);

    if (status_terlambat == 'Terlambat' || status_terlambat == 'Di Tolak') {
        jQuery("#potongan_detail_valid_sales").addClass("text-add-colour-red text-bold");
        jQuery("#status_terlambat_detail_valid_sales").addClass("card-color-red ");
        jQuery("#jam_masuk_detail_valid_sales").addClass("text-add-colour-red text-bold");
    } else if (status_terlambat == 'Valid') {
        jQuery("#potongan_detail_valid_sales").removeClass("text-add-colour-red text-bold");
        jQuery("#status_terlambat_detail_valid_sales").removeClass("card-color-red");
        jQuery("#jam_masuk_detail_valid_sales").removeClass("text-add-colour-red text-bold");
        jQuery("#potongan_detail_valid_sales").addClass("text-bold");
        jQuery("#status_terlambat_detail_valid_sales").addClass("btn-color-blueWhite");
        jQuery("#jam_masuk_detail_valid_sales").addClass("text-bold");
    } else {
        jQuery("#potongan_detail_valid_sales").removeClass("text-add-colour-red text-bold");
        jQuery("#status_terlambat_detail_valid_sales").removeClass("card-color-red ");
        jQuery("#jam_masuk_detail_valid_sales").removeClass("text-add-colour-red text-bold");
    }

    var lokasi_masuk = "";
    lokasi_masuk += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
    lokasi_masuk += 'src="https://maps.google.com/maps?q=' + lat_masuk + ',' + long_masuk + '&hl=id&z=14&amp;output=embed">';
    lokasi_masuk += '</iframe>';

    if (lat_masuk != 'null' && long_masuk != 'null') {
        jQuery("#map-masuk-valid-sales").html(lokasi_masuk);
    } else {
        jQuery("#map-masuk-valid-sales").html("Lokasi Tidak Ada");
    }


    var lokasi_keluar = "";
    lokasi_keluar += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
    lokasi_keluar += 'src="https://maps.google.com/maps?q=' + lat_keluar + ',' + long_keluar + '&hl=id&z=14&amp;output=embed">';
    lokasi_keluar += '</iframe>';

    if (lat_keluar != 'null' && long_keluar != 'null') {
        jQuery("#map-keluar-valid-sales").html(lokasi_keluar);
    } else {
        jQuery("#map-keluar-valid-sales").html("Lokasi Tidak Ada");
    }

    var image_masuk = '';
    if (foto_masuk != 'null') {
        image_masuk = BASE_PATH_IMAGE_ABSEN + "/" + foto_masuk;
        jQuery("#image-data-masuk-valid-sales").attr("src", "" + image_masuk + "");
    } else {
        image_masuk = BASE_PATH_IMAGE_ABSEN + "/noimage.jpg";
        jQuery("#image-data-masuk-valid-sales").attr("src", "" + image_masuk + "");
    }

    var image_keluar = '';
    if (foto_keluar != 'null') {
        image_keluar = BASE_PATH_IMAGE_ABSEN + "/" + foto_keluar;
        jQuery("#image-data-keluar-valid-sales").attr("src", "" + image_keluar + "");
    } else {
        image_keluar = BASE_PATH_IMAGE_ABSEN + "/noimage.jpg";
        jQuery("#image-data-keluar-valid-sales").attr("src", "" + image_keluar + "");
    }

    var image_selfie = '';
    if (foto_karyawan != 'null') {
        image_selfie = BASE_PATH_IMAGE_FOTO_SELFIE + "/" + foto_karyawan;
        jQuery("#image-data-selfie-valid-sales").attr("src", "" + image_selfie + "");
    } else {
        image_selfie = BASE_PATH_IMAGE_FOTO_SELFIE + "/noimage.jpg";
        jQuery("#image-data-selfie-valid-sales").attr("src", "" + image_selfie + "");
    }

}

function getDataTolakSales() {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-data-absen-valid-tolak-sales",
        dataType: 'JSON',
        data: {
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            var data_absen = '';
            if (data.data.length != 0) {
                var no = 0;
                var calc_total = 0;
                var grand_total = 0;
                var calc_gaji = 0;
                var calc_potongan = 0;
                // var calc_tunjangan = 0;
                // var tunjangan = 0;
                var total = 0;

                var potongan_nominal = 0;

                jQuery.each(data.data, function (i, val) {
                    no++
                    data_absen += '<tr>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + no + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + moment(val.tanggal_absen).format('DD-MMM-YY') + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + val.karyawan_nama + '</td>';
                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(val.gaji_pokok) + '</td>';



                    if (val.jam_masuk != null && val.is_valid == 1) {
                        // var time_telat = addMinutesToTimeSales(addMinutesToTimeSales(val.jam_masuk_shift, val.batas_telat), 1)
                        var selisih = diffSales(val.jam_masuk_shift, val.jam_masuk)
                        var convertMinute = moment.duration(selisih).asMinutes()
                        // var potongan_nominal = (convertMinute / val.batas_telat) * val.potongan;	
                        if (val.hide_potongan != 0) {
                            if (parseInt(convertMinute) >= 2 && parseInt(convertMinute) <= 5) {
                                potongan_nominal = 5000;
                            }
                            if (parseInt(convertMinute) >= 6 && parseInt(convertMinute) <= 20) {
                                potongan_nominal = 20000;
                            }
                            if (parseInt(convertMinute) > 20) {
                                potongan_nominal = 20000;
                            }
                        } else {
                            potongan_nominal = 0;
                        }
                        if (parseInt(convertMinute) >= 2 && val.is_valid == 1) {
                            status_terlambat = 'Terlambat';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        } else if (parseInt(convertMinute) < 2 && val.is_valid == 1) {
                            status_terlambat = 'Valid';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        } else if (val.is_valid == 0) {
                            status_terlambat = 'Belum Valid';
                            data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                        }
                    } else if (val.is_valid == 2) {
                        status_terlambat = 'Di Tolak';
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                    } else {
                        status_terlambat = 'Belum Absen';
                        data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                    }

                    if (val.jam_keluar != null) {
                        // tunjangan = val.tunjangan;
                        total = parseFloat(val.gaji_pokok) - parseFloat(potongan_nominal);
                    } else {
                        // tunjangan = 0;
                        total = 0;
                    }

                    // data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(tunjangan) + '</td>';




                    if (val.jam_masuk != null && val.jam_keluar != null) {
                        var btn_jam_detail = "btn-color-blueWhite";
                    } else if (val.jam_masuk == null || val.jam_keluar == null) {
                        var btn_jam_detail = "card-color-red";
                    } else {
                        var btn_jam_detail = "text-add-colour-black-soft bg-dark-gray-young";
                    }

                    data_absen += '		<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-right: 1px solid grey;text-align:center">' + number_format(total) + '</td>';

                    data_absen += '</tr>';

                    if (val.jam_masuk != null && val.jam_keluar != null) {
                        calc_total += parseFloat(total);
                        calc_gaji += parseFloat(val.gaji_pokok);
                        // calc_tunjangan += parseFloat(tunjangan);
                        calc_potongan += parseFloat(potongan_nominal);
                    } else {
                        calc_total += parseFloat(0);
                    }



                    grand_total += parseFloat(total);
                });

                data_absen += '<tr>';
                data_absen += '     <td colspan="5" align="right"></td>';
                data_absen += '     <td align="center" style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  >' + number_format(parseFloat(grand_total)) + '</td>';
                data_absen += '</tr>';

                jQuery("#count_data_tolak_sales").html('<span style="color:white"><b>' + no + '</b></span>');
                jQuery("#tabel_data_absen_tolak_sales").html(data_absen);
            } else {
                jQuery("#tabel_data_absen_tolak_sales").html('<td align="center" colspan="8">Tidak Ada data</td>');

            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function simpanValidSales(valid) {
    var label_valid = "";
    if (valid == 1) {
        label_valid = "Validasi";
    } else {
        label_valid = "Tolak";
    }

    app.dialog.confirm('Yakin ' + label_valid + ' Absensi ini ?', function () {
        if (localStorage.getItem("internet_koneksi") == 'fail') {
            app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
            });
        } else {
            jQuery.ajax({
                type: "POST",
                url: "" + BASE_API + "/simpan-valid-sales",
                dataType: "JSON",
                data: {
                    is_valid: valid,
                    absensi_id: localStorage.getItem("absensi_id_sales"),
                    user_id: localStorage.getItem("user_id_disiplin_sales"),
                    karyawan_nama: localStorage.getItem("karyawan_nama")
                },
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'done') {
                        app.dialog.alert('Berhasil Validasi Absensi');
                        app.popup.close();
                        getDataValidSales();
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Validasi Absensi');
                    }
                }
            });
        }
    });
}


function getProspekHeaderAbsen() {
    var prospek_value = "";
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-prospek-absen-sales",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id_gaji_sales"),
            tanggal_kunjungan: localStorage.getItem("tanggal_kunjungan"),
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            no = 0;
            var no_kunjungan = 0;
            $.each(data.data, function (i, item) {
                no++
                $$('#tgl_prospek').html(moment(localStorage.getItem("tanggal_kunjungan")).format('DD-MMM-YYYY'))
                if (item.tanggal_komunikasi == '' || item.tanggal_komunikasi == null) {
                    tanggal_komunikasi = '-';
                } else {
                    tanggal_komunikasi = moment(item.tanggal_komunikasi).format('DD-MMM');

                }

                if (item.tanggal_status1 == '' || item.tanggal_status1 == null || item.hasil_pertemuan1 == '' || item.hasil_pertemuan1 == null) {
                    hasil_pertemuan1 = '-';
                    tanggal_1 = '-';
                } else {
                    hasil_pertemuan1 = item.hasil_pertemuan1;
                    tanggal_1 = moment(item.tanggal_status1).format('DD-MMM');

                }

                if (item.tanggal_status2 == '' || item.tanggal_status2 == null || item.hasil_pertemuan2 == '' || item.hasil_pertemuan2 == null) {
                    hasil_pertemuan2 = '-';
                    tanggal_2 = '-';
                } else {
                    hasil_pertemuan2 = item.hasil_pertemuan2;
                    tanggal_2 = moment(item.tanggal_status2).format('DD-MMM');

                }

                if (item.tanggal_status3 == '' || item.tanggal_status3 == null || item.hasil_pertemuan3 == '' || item.hasil_pertemuan3 == null) {
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

                prospek_value += '<tr>';
                prospek_value += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;text-align:center;">' + no + '</td>';
                prospek_value += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;">' + item.client_nama + ', PT</td>';
                prospek_value += '<td class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray; border-bottom :1px solid gray;">' + data.count_prospek[item.karyawan_id] + '</td>';

                prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
                prospek_value += '<button onclick="updateProspek(\'' + item.lat_1 + '\',\'' + item.lng_1 + '\',\'' + item.lat_2 + '\',\'' + item.lng_2 + '\',\'' + item.lat_3 + '\',\'' + item.lng_3 + '\',\'' + item.file_selfie_card_1 + '\',\'' + item.file_selfie_card_2 + '\',\'' + item.file_selfie_card_3 + '\',\'' + item.file_id_card_1 + '\',\'' + item.file_id_card_2 + '\',\'' + item.file_id_card_3 + '\',\'' + item.tanggal_komunikasi + '\',\'' + hasil_komunikasi.replace(/\s/g, " ") + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.kunjungan_detail_id + '\',\'' + item.karyawan_id + '\',\'' + item.status + '\',\'' + item.tanggal_janjian + '\',\'' + item.tanggal_status1 + '\',\'' + item.tanggal_status2 + '\',\'' + item.tanggal_status3 + '\',\'' + hasil_pertemuan1.replace(/\s/g, " ") + '\',\'' + hasil_pertemuan2.replace(/\s/g, " ") + '\',\'' + hasil_pertemuan3.replace(/\s/g, " ") + '\',\'' + data.count_prospek[item.karyawan_id] + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".update-prospek">Detail</button>';
                prospek_value += '</td>';
                prospek_value += '</tr>';
            });
            $$('#prospek_value').html(prospek_value);
            $$('#total_data').html(data.data.total);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}



function updateProspek(lat_1, lng_1, lat_2, lng_2, lat_3, lng_3, file_selfie_card_1, file_selfie_card_2, file_selfie_card_3, file_id_card_1, file_id_card_2, file_id_card_3, tanggal_komunikasi, hasil_komunikasi, client_alamat, person, posisi, client_id, client_kota, client_nama, telpon, kunjungan_detail_id, karyawan_id, status, tanggal_janjian, tanggal_status1, tanggal_status2, tanggal_status3, hasil_pertemuan1, hasil_pertemuan2, hasil_pertemuan3, no_kunjungan) {

    $$('#popup-prospek-tgl-komunikasi').html(tanggal_komunikasi);
    $$('#popup-prospek-td-client_nama').html(client_nama);
    $$('#popup-prospek-client_person').html(person);
    $$('#popup-prospek-client_kota').html(client_kota);
    $$('#popup-prospek-client_posisi').html(posisi);
    $$('#popup-prospek-client_telpon').html(telpon);
    $$('#popup-prospek-hasil-komunikasi').html(hasil_komunikasi);
    $$('#kunjungan_detail_id_update').val(kunjungan_detail_id);

    var tanggal_status = "";
    var hasil_pertemuan = "";
    var foto = "";
    var foto_selfie = "";

    if (no_kunjungan == 1) {
        tanggal_status = moment(tanggal_status1).format('DD-MM-YYYY');
        hasil_pertemuan = hasil_pertemuan1;
        foto = file_id_card_1;
        foto_selfie = file_selfie_card_1;
    } else if (no_kunjungan == 2) {
        tanggal_status = moment(tanggal_status2).format('DD-MM-YYYY');
        hasil_pertemuan = hasil_pertemuan2;
        foto = file_id_card_2;
        foto_selfie = file_selfie_card_2;
    } else {
        tanggal_status = moment(tanggal_status3).format('DD-MM-YYYY');
        hasil_pertemuan = hasil_pertemuan3;
        foto = file_id_card_3;
        foto_selfie = file_selfie_card_3;

    }

    if (tanggal_status != 'Invalid date') {
        $$('#tanggal_status1_update').val(tanggal_status);
    } else {
        $$('#tanggal_status1_update').val('-');
    }

    $$('#hasil_pertemuan1_update').val(hasil_pertemuan);
    $$('#kunjungan_nomer').html(no_kunjungan);

    if (foto != 'null') {
        $$("#file_id_card_1_view").attr("src", BASE_PATH_IMAGE + '/' + foto);
    } else {
        $$('#file_id_card_1_view').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
    }

    if (foto_selfie != 'null') {
        $$("#file_selfie_card_1_view").attr("src", BASE_PATH_IMAGE + '/' + foto_selfie);
    } else {
        $$('#file_selfie_card_1_view').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
    }
}

function downloadPdfAllDivSales() {
    var nom_disiplin_sales = 0;

    if ($$('#bonus-disiplin-sales').is(':checked')) {
        nom_disiplin_sales = 50000;
    } else {
        nom_disiplin_sales = 0;
    }

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/download-pdf-all-div-sales",
        dataType: 'JSON',
        data: {
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();

            var no_urut = 0;
            var gaji_pdf = "";

            var grand_total = 0;
            gaji_pdf += '<table width="100%" border="0">';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">NIK</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Nama</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Posisi</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Hari</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Gaji</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Potongan</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Disiplin</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-right: 1px solid grey;border-top: 1px solid grey;text-align:center">Total</th>';
            gaji_pdf += '</thead>';
            gaji_pdf += '<tbody>';

            $.each(data.data.data, function (i, val_karyawan) {

                var total = 0;
                var disiplin = 0;
                var tunjangan = 0;


                $.each(data.status_disiplin[val_karyawan.user_id], function (i_disiplin, val_disiplin) {
                    if (val_disiplin.status_disiplin != 0 && val_disiplin.length != 0) {
                        disiplin = parseFloat(50000);
                    } else {
                        checked = "";
                        disiplin = parseFloat(0);
                    }
                });


                var calc_gaji = 0;
                var calc_tunjangan = 0;
                var calc_potongan = 0;
                var calc_lembur_1 = 0;
                var calc_lembur_2 = 0;
                var lembur_nominal = (parseFloat(val_karyawan.gaji_pokok) / 8);
                $.each(data.count_day[val_karyawan.user_id], function (i_lembur, val_lembur) {

                    var potongan_nominal = 0;
                    if (val_lembur.length != 0) {

                        var lmbr1 = 0;
                        var lmbr1_detail = 0;
                        var lmbr2 = 0;
                        var lmbr = 0;
                        if (val_lembur.is_valid == 1) {
                            if (val_lembur.jam_keluar != null) {
                                tunjangan = val_lembur.tunjangan_absen;

                                var selisihLembur = diffSales(data.shift.jam_keluar_shift, val_lembur.jam_keluar);
                                var convertMinuteLembur = moment.duration(selisihLembur).asMinutes();
                                if (val_lembur.hide_lembur != 0) {
                                    if (convertMinuteLembur >= 120) {
                                        lmbr1_detail = parseFloat(lembur_nominal) + 2000;
                                        lmbr2 = parseFloat(lembur_nominal) + 5000;
                                        lmbr = parseFloat(lmbr2) + parseFloat(lmbr1_detail);
                                    } else if (convertMinuteLembur >= 60) {
                                        lmbr1_detail = parseFloat(lembur_nominal) + 2000;
                                        lmbr1 = parseFloat(lembur_nominal) + 2000;
                                        lmbr = lmbr1;
                                    }
                                } else {
                                    lmbr = 0;
                                }

                            }

                            if (val_lembur.jam_masuk != null) {

                                var selisih = diffSales(data.shift.jam_masuk_shift, val_lembur.jam_masuk)
                                var convertMinute = moment.duration(selisih).asMinutes()
                                if (val_lembur.hide_potongan != 0) {
                                    if (parseInt(convertMinute) >= 2 && parseInt(convertMinute) <= 5) {
                                        potongan_nominal = 5000;
                                    }
                                    if (parseInt(convertMinute) >= 6 && parseInt(convertMinute) <= 20) {
                                        potongan_nominal = 20000;
                                    }
                                    if (parseInt(convertMinute) > 20) {
                                        potongan_nominal = 20000;
                                    }
                                } else {
                                    potongan_nominal = 0;
                                }
                            }

                            calc_gaji += parseFloat(val_karyawan.gaji_pokok);
                            calc_potongan += parseFloat(potongan_nominal);
                            total += parseFloat(parseFloat(val_karyawan.gaji_pokok) - parseFloat(potongan_nominal));

                        }
                    }
                });

                if (number_format(data.count_day[val_karyawan.user_id].length) != 0) {

                    var row_pdf = "";
                    if (number_format(data.count_day[val_karyawan.user_id].length) < 10) {
                        row_pdf = "background-color: #b20000;color: white;";
                    } else {
                        row_pdf = "";
                    }

                    gaji_pdf += '<tr style ="' + row_pdf + '">';
                    gaji_pdf += '<td align="center" style="border-left:1px solid gray; border-bottom:1px solid gray;" >' + val_karyawan.nik + '</td>';
                    gaji_pdf += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + val_karyawan.karyawan_nama + '</td>';
                    gaji_pdf += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + val_karyawan.user_position + '</td>';
                    gaji_pdf += '<td style="border-bottom:1px solid gray;"align="center" class="numeric-cell">';
                    gaji_pdf += '' + number_format(data.count_day[val_karyawan.user_id].length) + '';
                    gaji_pdf += '</td>';
                    gaji_pdf += '<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(calc_gaji) + '</td>';
                    gaji_pdf += '<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(calc_potongan) + '</td>';
                    gaji_pdf += '<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(disiplin) + '</td>';
                    gaji_pdf += '<td style="border-left: 1px solid grey;border-right:1px solid gray; border-bottom:1px solid gray;" align="right" class="numeric-cell">';
                    gaji_pdf += '' + number_format(parseFloat(total) + parseFloat(disiplin)) + '';
                    gaji_pdf += '</td>';

                    grand_total += parseFloat(total) + parseFloat(disiplin);
                }

                gaji_pdf += '</tr>';


            });
            gaji_pdf += '<tr>';
            gaji_pdf += '   <td colspan="7" align="right" style="font-weight:bold;">Grand Total</td>';
            gaji_pdf += '   <td align="right" style="border-right: 1px solid grey;border-left: 1px solid grey;border-bottom: 1px solid grey;">' + number_format(grand_total) + '</td>';
            gaji_pdf += '<tr>';
            gaji_pdf += '</tbody>';
            gaji_pdf += '</table>';



            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'report_gaji_divisi' + moment().format("YYYY/MM/DD") + '.pdf'
            }

            pdf.fromData(gaji_pdf, options)
                .then((stats) => console.log('status', stats))
                .catch((err) => console.err(err))

            console.log(gaji_pdf);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    })
}

function downloadPdfAllDivSalesPeriode() {
    var nom_disiplin = 0;

    if ($$('#bonus-disiplin-sales').is(':checked')) {
        nom_disiplin = 50000;
    } else {
        nom_disiplin = 0;
    }

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/download-pdf-all-div-sales-periode",
        dataType: 'JSON',
        data: {
            tanggal: localStorage.getItem("tanggal_periode_sales"),
            urutan: localStorage.getItem("urutan_sales")
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();


            var no_urut = 0;
            var gaji_pdf = "";

            var grand_total = 0;
            gaji_pdf += '<table width="100%" border="0">';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">NIK</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Nama</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Posisi</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Hari</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Gaji</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Potongan</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-top: 1px solid grey;text-align:center">Disiplin</th>';
            gaji_pdf += '<th class="label-cell" style="border-left: 1px solid grey;border-bottom: 1px solid grey;border-right: 1px solid grey;border-top: 1px solid grey;text-align:center">Total</th>';
            gaji_pdf += '</thead>';
            gaji_pdf += '<tbody>';

            $.each(data.data.data, function (i, val_karyawan) {


                var total_gaji = 0;
                var lmbr1 = 0;
                var lmbr2 = 0;
                var tunjangan = 0;
                var potongan_nominal = 0;
                var bonus_disiplin = 0;
                var count_day = 0;

                jQuery.each(data.data_gaji[val_karyawan.user_id], function (i, val) {
                    total_gaji = val.total_gaji;
                    potongan_nominal = val.total_potongan;
                    bonus_disiplin = val.bonus_disiplin;
                    bukti_gaji = val.bukti_gaji;
                    tanggal_awal = val.tanggal_awal;
                    tanggal_akhir = val.tanggal_akhir;
                    count_day = val.count_days;
                });

                if (count_day != 0) {
                    var row_pdf = "";
                    if (count_day < 10) {
                        row_pdf = "background-color: #b20000;color: white;";
                    } else {
                        row_pdf = "";
                    }
                    gaji_pdf += '<tr style ="' + row_pdf + '">';
                    gaji_pdf += '<td align="center" style="border-left:1px solid gray; border-bottom:1px solid gray;" >' + val_karyawan.nik + '</td>';
                    gaji_pdf += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + val_karyawan.karyawan_nama + '</td>';
                    gaji_pdf += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + val_karyawan.user_position + '</td>';
                    gaji_pdf += '<td style="border-bottom:1px solid gray;"align="center" class="numeric-cell">';
                    gaji_pdf += '' + count_day + '';
                    gaji_pdf += '</td>';
                    gaji_pdf += '<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(total_gaji) + '</td>';
                    gaji_pdf += '<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(potongan_nominal) + '</td>';
                    gaji_pdf += '<td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">' + number_format(bonus_disiplin) + '</td>';
                    gaji_pdf += '<td style="border-left: 1px solid grey;border-right:1px solid gray; border-bottom:1px solid gray;" align="right" class="numeric-cell">';
                    gaji_pdf += '' + number_format((parseFloat(total_gaji) + parseFloat(bonus_disiplin)) - parseFloat(potongan_nominal)) + '';
                    gaji_pdf += '</td>';

                    grand_total += (parseFloat(total_gaji) + parseFloat(bonus_disiplin)) - parseFloat(potongan_nominal);

                    gaji_pdf += '</tr>';
                }



            });
            gaji_pdf += '<tr>';
            gaji_pdf += '   <td colspan="7" align="right" style="font-weight:bold;">Grand Total</td>';
            gaji_pdf += '   <td align="right" style="border-right: 1px solid grey;border-left: 1px solid grey;border-bottom: 1px solid grey;">' + number_format(grand_total) + '</td>';
            gaji_pdf += '<tr>';
            gaji_pdf += '</tbody>';
            gaji_pdf += '</table>';

            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'report_gaji_divisi' + moment().format("YYYY/MM/DD") + '.pdf'
            }

            pdf.fromData(gaji_pdf, options)
                .then((stats) => console.log('status', stats))
                .catch((err) => console.err(err))

            console.log(gaji_pdf);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    })
}

function getDataKaryawanShiftSales() {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-data-karyawan-shift-sales",
        dataType: "JSON",
        data: {
            user_id: localStorage.getItem("user_id_gaji_sales"),
        },
        beforeSend: function () {
        },
        success: function (data) {

            var jam_masuk = moment(data.data.jam_masuk_shift, "HH:mm:ss").format('HH:mm') + ' - ' + moment(data.data.batas_absen_masuk, "HH:mm:ss").format('HH:mm');
            $$("#info-jam-masuk-sales").html(jam_masuk);
            var jam_pulang = moment(data.data.jam_keluar_shift, "HH:mm:ss").format('HH:mm') + ' - ' + moment(data.data.batas_absen_keluar, "HH:mm:ss").format('HH:mm');
            $$("#info-jam-pulang-sales").html(jam_pulang);
        }
    });
}