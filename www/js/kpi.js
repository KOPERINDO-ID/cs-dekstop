function dateRangeDeclarationKpi() {
    calendarRangePenjualan = app.calendar.create({
        inputEl: '#range-kpi',
        rangePicker: true,
        dateFormat: 'dd-mm-yyyy',
        closeOnSelect: true,
        rangePickerMinDays: 1,
        on: {
            close: function () {
                getTargetInputBroadcastCsNotif();
            }
        }
    });
}

function dateRangeDeclarationKpiBroadcast() {
    calendarRangePenjualan = app.calendar.create({
        inputEl: '#range-kpi-broadcast',
        rangePicker: true,
        dateFormat: 'dd-mm-yyyy',
        closeOnSelect: true,
        rangePickerMinDays: 1,
        on: {
            close: function () {
                getTargetBroadcastCsNotif();
            }
        }
    });
}

function getTargetInputBroadcastCsNotif() {
    if (jQuery('#range-kpi').val() == '' || jQuery('#range-kpi').val() == null) {
        var startdate_new = new Date(moment().format('YYYY-MM-DD'));
        var enddate_new = new Date(moment().format('YYYY-MM-DD'));
        var startdate = moment().format('YYYY-MM-DD');
        var enddate = moment().format('YYYY-MM-DD');
    } else {
        var startdate_new = new Date(calendarRangePenjualan.value[0]);
        var enddate_new = new Date(calendarRangePenjualan.value[1]);
        var startdate = moment(startdate_new).format('YYYY-MM-DD');
        var enddate = moment(enddate_new).format('YYYY-MM-DD');
    }

    var difference = Math.floor((enddate_new - startdate_new) / (1000 * 60 * 60 * 24) + 1);
    
    var kpi_input = '';
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-target-broadcast-cs-input",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            startdate_client: startdate,
            enddate_client: enddate,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            jQuery('#target-kpi-input').html(parseFloat(difference * data.data_karyawan.target_input_client));
            jQuery('#capai-kpi-input').html(parseFloat(data.data_target_input));
            jQuery('#sisa-kpi-input').html(parseFloat((difference * data.data_karyawan.target_input_client) - data.data_target_input));
            var no = 0;
            if (data.data_input.length > 0) {
                $.each(data.data_input, function (i, item) {
                    no++
                    kpi_input += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;">';
                    kpi_input += '    <td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + no + '</td>';
                    kpi_input += '    <td align="center" style="border-right:1px solid gray;border-bottom:1px solid gray;" class="label-cell">' + moment(item.dt_record).format('DD-MM-YYYY') + '</td>';
                    kpi_input += '    <td align="left" style="border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    kpi_input += '</tr>';
                });

                jQuery('#kpi_input_value').html(kpi_input);
                jQuery('#total_data_kpi').html(no);
            } else {
                jQuery("#total_data_kpi").html(number_format(0));
                jQuery("#kpi_input_value").html('<tr><td colspan="3" align="center">Tidak Ada Data</td></tr>');
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}



function getTargetBroadcastCsNotif() {
    if (jQuery('#range-kpi-broadcast').val() == '' || jQuery('#range-kpi-broadcast').val() == null) {
        var startdate_new = new Date(moment().format('YYYY-MM-DD'));
        var enddate_new = new Date(moment().format('YYYY-MM-DD'));
        var startdate = moment().format('YYYY-MM-DD');
        var enddate = moment().format('YYYY-MM-DD');
    } else {
        var startdate_new = new Date(calendarRangePenjualan.value[0]);
        var enddate_new = new Date(calendarRangePenjualan.value[1]);
        var startdate = moment(startdate_new).format('YYYY-MM-DD');
        var enddate = moment(enddate_new).format('YYYY-MM-DD');
    }

    var difference = Math.floor((enddate_new - startdate_new) / (1000 * 60 * 60 * 24) + 1);

    var kpi_broadcast = '';
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-target-broadcast-cs-broadcast",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            startdate: startdate,
            enddate: enddate,
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            jQuery('#target-kpi-broadcast').html(parseFloat(difference * data.data_karyawan.target_broadcast));
            jQuery('#capai-kpi-broadcast').html(parseFloat(data.data_target_broadcast));
            jQuery('#sisa-kpi-broadcast').html(parseFloat((difference * data.data_karyawan.target_broadcast) - data.data_target_broadcast));
            var no = 0;
            if (data.data_broadcast.length > 0) {
                $.each(data.data_broadcast, function (i, item) {
                    no++
                    kpi_broadcast += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;">';
                    kpi_broadcast += '    <td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + no + '</td>';
                    kpi_broadcast += '    <td align="center" style="border-right:1px solid gray;border-bottom:1px solid gray;" class="label-cell">' + moment(item.sent_date).format('DD-MM-YYYY') + '</td>';
                    kpi_broadcast += '    <td align="left" style="border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
                    kpi_broadcast += '</tr>';
                });

                jQuery('#kpi_broadcast_value').html(kpi_broadcast);
                jQuery('#total_data_kpi_broadcast').html(no);
            } else {
                jQuery("#total_data_kpi_broadcast").html(number_format(0));
                jQuery("#kpi_broadcast_value").html('<tr><td colspan="3" align="center">Tidak Ada Data</td></tr>');
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}
