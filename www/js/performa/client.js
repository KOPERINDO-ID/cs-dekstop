// ========================================
// CLIENT MANAGEMENT FUNCTIONS
// ========================================

/**
 * Handle client selection change
 */
function handleClientSelection() {
    var clientId = $$('#client_id').val();

    if (clientId && clientId !== '') {
        // Get client details
        jQuery.ajax({
            type: "POST",
            url: BASE_API + "/get-client-detail",
            dataType: "JSON",
            data: {
                client_id: clientId
            },
            success: function (data) {
                if (data.status == 200 && data.data) {
                    var client = data.data;

                    // Fill client info
                    $$('#client_nama').val(client.client_nama || '');
                    $$('#alamat').val(client.alamat || '');
                    $$('#kota').val(client.kota_id || '');
                    $$('#kota_id').val(client.kota_id || '');
                    $$('#person').val(client.person || '');
                    $$('#posisi').val(client.posisi || '');
                    $$('#telepon').val(client.telepon || '');

                    // Set status perusahaan
                    var status = (client.status_pembayaran_client || 'NORMAL').toUpperCase();
                    $$('#status_perusahaan').val(status);

                    // Show warning if needed
                    if (status === 'WARNING' || status === 'DELAYED' || status === 'PROBLEM') {
                        var warningMsg = 'Status pembayaran client: ' + status;
                        if (client.keterangan) {
                            warningMsg += '<br>' + client.keterangan;
                        }
                        app.dialog.alert(warningMsg);
                    }
                }
            }
        });
    } else {
        // Clear client info
        $$('#client_nama').val('');
        $$('#alamat').val('');
        $$('#kota').val('');
        $$('#kota_id').val('');
        $$('#person').val('');
        $$('#posisi').val('');
        $$('#telepon').val('');
        $$('#status_perusahaan').val('');
    }
}

/**
 * Check phone availability
 */
function checkPhoneAvailability(phone) {
    if (!phone || phone.trim() === '') {
        phoneCheckInProgress = false;
        phoneCheckResult = null;
        return;
    }

    phoneCheckInProgress = true;

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/check-phone",
        dataType: "JSON",
        data: {
            telepon: phone
        },
        success: function (data) {
            phoneCheckInProgress = false;

            if (data.status == 200) {
                if (data.exists) {
                    phoneCheckResult = 'exists';
                    app.dialog.alert('Nomor telepon sudah terdaftar!');
                } else {
                    phoneCheckResult = 'available';
                }
            }
        },
        error: function () {
            phoneCheckInProgress = false;
            phoneCheckResult = null;
        }
    });
}

/**
 * Update client info realtime
 */
function updateClientInfo(field, value) {
    var selector = '#' + field;
    $$(selector).val(value);
}