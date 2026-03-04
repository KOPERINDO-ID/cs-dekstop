// ========================================
// FORM MANAGEMENT FUNCTIONS
// ========================================

/**
 * Add new performa item
 */
function addPerforma() {
    saveHC($$('.performa_group_field_count').length);
    $$('#count_performa').val($$('.performa_group_field_count').length + 1);

    var html_performa_group_field = '';
    var count = $('.performa_group_field_count').length + 1;

    // Build HTML untuk performa baru
    html_performa_group_field += '<h3 style="margin-top:8px;" id="title_' + count + '" class="title-performa">Proforma #' + count + '</h3>';
    html_performa_group_field += '<ul id="performa_' + count + '" class="performa_group_field_count" style="background-color:#1c1c1d; border-radius:2px; margin-top:-12px; border:1px solid gray; list-style:none; padding-left:0; margin-left:0;">';

    // NOTE: HTML construction lengkap untuk form performa ada di file asli
    // Copy exact HTML dari performa_input.js original
    html_performa_group_field += '<!-- FULL HTML FORM HERE -->';
    html_performa_group_field += '</ul>';

    $$('.performa_group_field').append(html_performa_group_field);
    jQuery('.input-item-price').mask('000,000,000,000', { reverse: true });
    jQuery('.input-item-potongan-price').mask('000,000,000,000', { reverse: true });
    hideElPerforma($$('.performa_group_field_count').length);

    // Set default warna dari Global Variable
    var newCount = $$('.performa_group_field_count').length;
    if (globalKoperColor.name && globalKoperColor.hex) {
        jQuery('#keterangan_full_' + newCount).val(globalKoperColor.name);
    }

    // Reinitialize smart select
    app.smartSelect.create({
        el: '#ss_style_hc_' + newCount,
        openIn: 'popover',
        closeOnSelect: true
    });

    // Set default extra_detail
    if ($('#xtra').prop('checked')) {
        $$('#extra_detail_' + newCount).val(0);
    } else if ($('#extra').prop('checked')) {
        $$('#extra_detail_' + newCount).val(1);
    }
}

/**
 * Delete performa item
 */
function deletePerforma(count) {
    app.dialog.confirm(
        'Hapus item #' + count + '?',
        function () {
            // Flag for preventing auto-fill during delete
            isRestoringAfterDelete = true;

            // Hide the item
            $$('#title_' + count).hide();
            $$('#performa_' + count).hide();

            // Reindex all remaining items
            setTimeout(function () {
                reindexAllPerformaFields();
                isRestoringAfterDelete = false;
            }, 100);

            console.log('✓ Deleted performa #' + count);
        }
    );
}

/**
 * Change total value calculation
 */
function changeTotalValue(count) {
    var qty = parseFloat($$('#qty_' + count).val()) || 0;
    var price = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;
    var netPrice = parseFloat($$('#potongan_price_' + count).val().replace(/\,/g, '')) || 0;

    var total = 0;

    // Use net price if available, otherwise use normal price
    if (netPrice > 0) {
        total = qty * netPrice;
    } else {
        total = qty * price;
    }

    $$('#total_' + count).val(number_format(total));

    // Update sum totals
    updateSumTotals();

    console.log('✓ Updated total for #' + count + ':', total);
}

/**
 * Update sum totals (qty and price)
 */
function updateSumTotals() {
    var totalQty = 0;
    var totalSum = 0;

    $$('.performa_group_field_count').each(function (index) {
        var count = index + 1;

        if (!isElementHidden('performa_' + count)) {
            var qty = parseInt($$('#qty_' + count).val()) || 0;
            var total = parseFloat($$('#total_' + count).val().replace(/\,/g, '')) || 0;

            totalQty += qty;
            totalSum += total;
        }
    });

    $$('#total_performa_qty').val(totalQty);
    $$('#total_performa_sum').val(number_format(totalSum));

    console.log('✓ Updated sum totals - Qty:', totalQty, 'Sum:', totalSum);
}

/**
 * Change qty for TAS
 */
function changeQtyTs(count) {
    changeTotalValue(count);
    autoFillNetHargaBasedOnQty(count);
}

/**
 * Change HC (koper) related fields
 */
function changeHC(count) {
    console.log('changeHC called for #' + count);
    changeTotalValue(count);
}

/**
 * Save HC data
 */
function saveHC(count) {
    console.log('saveHC called for #' + count);
    // Save current state if needed
}

/**
 * Reset value qty
 */
function resetValueQty(count) {
    $$('#qty_' + count).val('');
    $$('#total_' + count).val('');
    updateSumTotals();
}

/**
 * Reset value harga
 */
function resetValueHarga(count) {
    $$('#price_' + count).val('');
    $$('#harga_satuan_' + count).val(0);
    $$('#harga_style_' + count).val(0);
    $$('#total_' + count).val('');
    updateSumTotals();
}

/**
 * Reset value net harga
 */
function resetValueNetHarga(count) {
    $$('#potongan_price_' + count).val('');
    $$('#potongan_otomatis_' + count).val('');
    clearPotonganInfo(count);
    changeTotalValue(count);
}

/**
 * Reset value biaya kirim
 */
function resetValueBiayaKirim() {
    $$('#biaya_kirim').val('');
}

/**
 * Reset all proforma fields
 */
function resetProformaFields(count) {
    console.log('resetProformaFields called for #' + count);

    resetValueQty(count);
    resetValueHarga(count);
    resetValueNetHarga(count);

    // Reset jenis
    $$('#jenis_' + count).val('');

    // Reset ukuran, style, material
    $$('#ukuran_hc_' + count).val('none');
    $$('#style_hc_' + count).val('0');
    $$('#material_hc_' + count).val('0');

    // Reset colors
    $$('#keterangan_full_' + count).val('');
    $$('#color_badge_' + count).hide();

    // Hide koper inputs
    hideAllKoperInputs(count);

    console.log('✓ Reset all fields for #' + count);
}