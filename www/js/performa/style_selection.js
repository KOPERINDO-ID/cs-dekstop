// ========================================
// STYLE & COLOR SELECTION FUNCTIONS
// ========================================

/**
 * Handle style selection
 */
function handleStyleSelection(count) {
    var styleId = $$('#style_hc_' + count).val();

    if (styleId && styleId !== '0') {
        // Fill harga based on style
        fillHargaVariasiProduk(count);
    } else {
        // Reset style price
        $$('#harga_style_' + count).val(0);

        // Recalculate total price
        var price = parseFloat($$('#harga_satuan_' + count).val()) || 0;
        $$('#price_' + count).val(number_format(price));
        changeTotalValue(count);
    }
}

/**
 * Handle color selection
 */
function handleColorSelection(count, colorName, colorHex) {
    console.log('handleColorSelection - count:', count, 'color:', colorName, 'hex:', colorHex);

    // Update color badge
    updateColorBadge(count, colorName, colorHex);

    // Store color info
    $$('#keterangan_full_' + count).val(colorName);

    // Update global color variable
    globalKoperColor.name = colorName;
    globalKoperColor.hex = colorHex;
}

/**
 * Update color badge display
 */
function updateColorBadge(count, colorName, colorHex) {
    var badgeElement = $$('#color_badge_' + count);

    if (badgeElement.length > 0) {
        badgeElement.css('background-color', colorHex);
        badgeElement.text(colorName);

        // Set text color based on background luminance
        var textColor = getContrastColor(colorHex);
        badgeElement.css('color', textColor);

        badgeElement.show();
    }
}