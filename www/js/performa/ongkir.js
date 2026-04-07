// ========================================
// ONGKIR/SHIPPING COST FUNCTIONS
// ========================================

/**
 * Calculate ongkir based on client location
 */
function calculateOngkir() {
    var clientId = $$('#client_id').val();
    var totalQty = 0;

    // Calculate total qty
    $$('.performa-input.input-item-qty').each(function () {
        var qty = parseInt($$(this).val()) || 0;
        totalQty += qty;
    });

    if (!clientId || clientId === '') {
        $$('#biaya_kirim').val('');
        return;
    }

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/calculate-ongkir",
        dataType: "JSON",
        data: {
            client_id: clientId,
            total_qty: totalQty
        },
        success: function (data) {
            if (data.status == 200 && data.data) {
                var ongkir = data.data.biaya_kirim || 0;
                $$('#biaya_kirim').val(number_format(ongkir));
                $$('#status_ongkir').val(data.data.status_ongkir || '');
            }
        }
    });
}

/**
 * Update ongkir display
 */
function updateOngkirDisplay(value) {
    $$('#biaya_kirim').val(number_format(value));
}

/**
 * Handle ongkir change manually
 */
function handleOngkirChange() {
    var value = $$('#biaya_kirim').val();
    if (value && value !== '') {
        $$('#biaya_kirim').val(number_format(value.replace(/\,/g, '')));
    }
}