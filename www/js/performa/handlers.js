// ========================================
// TOGGLE HANDLERS
// ========================================

/**
 * Handle XTRA toggle
 */
function handleXtraToggle() {
    var isXtraChecked = jQuery('#xtra').prop('checked');

    if (isXtraChecked) {
        // Uncheck EXTRA
        jQuery('#extra').prop('checked', false);

        // Update all extra_detail fields to 0 (XTRA)
        $$('.performa_group_field_count').each(function (index) {
            var count = index + 1;
            $$('#extra_detail_' + count).val(0);
        });

        console.log('✓ XTRA mode activated - extra_detail = 0');
    }
}

/**
 * Handle EXTRA toggle
 */
function handleExtraToggle() {
    var isExtraChecked = jQuery('#extra').prop('checked');

    if (isExtraChecked) {
        // Uncheck XTRA
        jQuery('#xtra').prop('checked', false);

        // Update all extra_detail fields to 1 (EXTRA/GROSIR)
        $$('.performa_group_field_count').each(function (index) {
            var count = index + 1;
            $$('#extra_detail_' + count).val(1);
        });

        console.log('✓ EXTRA/GROSIR mode activated - extra_detail = 1');
    }
}

/**
 * Handle Full Colour toggle
 */
function handleFullColourToggle() {
    var isFullColourChecked = jQuery('#full_colour').prop('checked');

    $$('.performa_group_field_count').each(function (index) {
        var count = index + 1;

        if (isFullColourChecked) {
            // Enable full colour for all items
            $$('#full_colour_' + count).val(1);
            console.log('✓ Full Colour enabled for item #' + count);
        } else {
            // Disable full colour for all items
            $$('#full_colour_' + count).val(0);
            console.log('✓ Full Colour disabled for item #' + count);
        }
    });
}

// ========================================
// EVENT HANDLERS & LISTENERS
// ========================================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');

    // Client selection change
    setupClientChangeListener();

    // Jenis input listeners
    setupJenisInputListeners();

    // Qty change listeners
    setupQtyChangeListeners();

    // Price change listeners
    setupPriceChangeListeners();

    // Net harga change listeners
    setupNetHargaChangeListeners();

    // Ukuran, style, material change listeners
    setupKoperDropdownListeners();

    // Toggle listeners
    setupToggleListeners();

    // Button listeners
    setupButtonListeners();

    // Biaya kirim listener
    setupBiayaKirimListener();

    // Phone check listener
    setupPhoneCheckListener();

    console.log('✓ All event listeners set up');
}

/**
 * Setup client change listener
 */
function setupClientChangeListener() {
    $$(document).on('change', '#client_id', function () {
        handleClientSelection();
    });
}

/**
 * Setup jenis input listeners (delegated for dynamic elements)
 */
function setupJenisInputListeners() {
    $$(document).on('input', '[id^="jenis_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('jenis_', '');

        if (delayTimer) {
            clearTimeout(delayTimer);
        }

        delayTimer = setTimeout(function () {
            var tipe = $$('#jenis_' + count).val().toUpperCase();

            // Apply shortcuts
            tipe = applyInputShortcut(tipe);
            $$('#jenis_' + count).val(tipe);

            var productInfo = detectProductType(tipe);

            if (!productInfo.isValid) {
                return;
            }

            if (productInfo.isKoper) {
                if (productInfo.isCustom) {
                    showCustomKoperUI(count);
                } else {
                    showKatalogKoperUI(count);
                }

                selectBoxUkuran(count, tipe);
                selectBoxStyle(count, tipe);
                selectBoxMaterial(count, tipe);
            } else if (productInfo.type === 'TAS') {
                hideAllKoperInputs(count);
                selectBoxTS(count);
                selectBoxMaterialTs(count);
            }
        }, 800);
    });
}

/**
 * Setup qty change listeners
 */
function setupQtyChangeListeners() {
    $$(document).on('input', '[id^="qty_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('qty_', '');

        changeTotalValue(count);

        if (delayTimer1) {
            clearTimeout(delayTimer1);
        }

        delayTimer1 = setTimeout(function () {
            autoFillNetHargaBasedOnQty(count);
        }, 1000);
    });
}

/**
 * Setup price change listeners
 */
function setupPriceChangeListeners() {
    $$(document).on('input', '[id^="price_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('price_', '');

        changeTotalValue(count);
    });
}

/**
 * Setup net harga change listeners
 */
function setupNetHargaChangeListeners() {
    $$(document).on('input', '[id^="potongan_price_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('potongan_price_', '');

        handleNetHargaInput(count);
    });

    $$(document).on('blur', '[id^="potongan_price_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('potongan_price_', '');

        validateNetHargaChange(count);
    });
}

/**
 * Setup koper dropdown listeners
 */
function setupKoperDropdownListeners() {
    // Ukuran change
    $$(document).on('change', '[id^="ukuran_hc_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('ukuran_hc_', '');

        var selectedOption = $$(this).find('option:selected');
        var idUkuran = selectedOption.val();

        $$('#id_ukuran_hc_' + count).val(idUkuran);

        fillHargaProduk(count);
    });

    // Style change
    $$(document).on('change', '[id^="style_hc_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('style_hc_', '');

        var selectedOption = $$(this).find('option:selected');
        var idStyle = selectedOption.val();

        $$('#id_style_hc_' + count).val(idStyle);

        handleStyleSelection(count);
    });

    // Material change
    $$(document).on('change', '[id^="material_hc_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('material_hc_', '');

        var selectedOption = $$(this).find('option:selected');
        var idMaterial = selectedOption.val();

        $$('#id_material_hc_' + count).val(idMaterial);

        fillHargaMaterialProduk(count);
    });

    // TAS ukuran change
    $$(document).on('change', '[id^="ukuran_ts_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('ukuran_ts_', '');

        var selectedOption = $$(this).find('option:selected');
        var idUkuranTs = selectedOption.val();

        $$('#id_ukuran_ts_' + count).val(idUkuranTs);

        fillHargaTs(count);
    });

    // TAS material change
    $$(document).on('change', '[id^="material_ts_"]', function () {
        var inputId = $$(this).attr('id');
        var count = inputId.replace('material_ts_', '');

        var selectedOption = $$(this).find('option:selected');
        var idMaterialTs = selectedOption.val();

        $$('#id_material_ts_' + count).val(idMaterialTs);

        fillHargaMaterialProdukTs(count);
    });
}

/**
 * Setup toggle listeners
 */
function setupToggleListeners() {
    $$(document).on('change', '#xtra', function () {
        handleXtraToggle();
    });

    $$(document).on('change', '#extra', function () {
        handleExtraToggle();
    });

    $$(document).on('change', '#full_colour', function () {
        handleFullColourToggle();
    });
}

/**
 * Setup button listeners
 */
function setupButtonListeners() {
    // Add performa button
    $$(document).on('click', '#btn_add_performa', function () {
        addPerforma();
    });

    // Delete performa button (delegated for dynamic elements)
    $$(document).on('click', '[id^="btn_delete_"]', function () {
        var buttonId = $$(this).attr('id');
        var count = buttonId.replace('btn_delete_', '');
        deletePerforma(count);
    });

    // Copy potongan button
    $$(document).on('click', '[id^="copy_potongan_icon_"]', function () {
        var buttonId = $$(this).attr('id');
        var count = buttonId.replace('copy_potongan_icon_', '');
        copyPotonganToNetHarga(count);
    });

    // Submit button
    $$(document).on('click', '#performa_input_button_save', function () {
        if (isEditMode) {
            updatePerformaProcess();
        } else {
            performaProcess();
        }
    });

    // Catalog buttons
    $$(document).on('click', '[id^="btn_katalog_"]', function () {
        var buttonId = $$(this).attr('id');
        var matches = buttonId.match(/btn_katalog_([A-Z]+)_(\d+)/);
        if (matches) {
            var type = matches[1];
            var count = matches[2];
            getKatalog(count, type);
        }
    });
}

/**
 * Setup biaya kirim listener
 */
function setupBiayaKirimListener() {
    $$(document).on('input', '#biaya_kirim', function () {
        handleOngkirChange();
    });
}

/**
 * Setup phone check listener
 */
function setupPhoneCheckListener() {
    $$(document).on('blur', '#telepon', function () {
        var phone = $$(this).val();
        checkPhoneAvailability(phone);
    });
}