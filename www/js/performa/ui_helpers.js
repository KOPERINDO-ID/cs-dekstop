// ========================================
// UI MANIPULATION HELPERS
// ========================================

/**
 * Hide semua input koper (gambar, color, ukuran, dll)
 */
function hideAllKoperInputs(count) {
    $$('#color_proforma_input_' + count).css("display", "none");
    $$('#gambar_proforma_input_' + count).css("display", "none");
    $$('#file_' + count).prop('required', false);
    $$('#file_' + count).prop('validate', false);
    $$('#el_ukuran_hc_' + count).hide();
    $$('#el_ukuran_ts_' + count).css("display", "none");
    $$('#el_style_hc_' + count).hide();
    $$('#el_material_hc_' + count).hide();
}

/**
 * Reset input jenis dan semua field terkait
 */
function resetJenisInput(count) {
    jQuery('#jenis_' + count).val('');
    hideAllKoperInputs(count);
}

/**
 * Set field harga readonly (untuk koper)
 */
function setHargaReadonly(count, isReadonly) {
    document.getElementById("price_" + count).readOnly = isReadonly;
    if (isReadonly) {
        document.getElementById("price_" + count).setAttribute('data-is-koper', 'true');
    } else {
        document.getElementById("price_" + count).removeAttribute('data-is-koper');
    }
}

/**
 * Show UI untuk custom koper (HCC)
 */
function showCustomKoperUI(type, count) {
    $$('#gambar_proforma_input_' + count).css("display", "initial");
    $$('#color_proforma_input_' + count).css("display", "none");
    $$('#el_ukuran_hc_' + count).show();
    $$('#el_ukuran_ts_' + count).css("display", "none");
    $$('#type_proforma_input_' + count).removeClass('col-100');
    $$('#type_proforma_input_' + count).addClass('col-80');
    $$('#el_style_hc_' + count).show();
    $$('#el_material_hc_' + count).show();
    $$('#file_' + count).prop('required', true);
    $$('#file_' + count).prop('validate', true);
    setHargaReadonly(count, true);

    const similarityCode = getCustomSimilarityCode(type);
    showselectBoxUkuran(similarityCode, count);
    selectBoxMaterial(similarityCode, count);
}

/**
 * Show UI untuk katalog koper popup
 */
function showKatalogKoperUI(count) {
    hideAllKoperInputs(count);
    setHargaReadonly(count, true);
}

/**
 * Clear input select helper
 */
function clearInputSelect(count) {
    $$('#el_ukuran_ts_' + count).css("display", "none");
    $$('#gambar_proforma_input_' + count).css("display", "none");
    $$('#color_proforma_input_' + count).css("display", "none");
    $$('#type_proforma_input_' + count).css("display", "initial");
    $$('#type_proforma_input_' + count).removeClass('col-80');
    $$('#type_proforma_input_' + count).addClass('col-100');
}

/**
 * Hide element performa
 */
function hideElPerforma(count) {
    console.log(count);
    $$('#el_ukuran_hc_' + count).hide();
    $$('#el_style_hc_' + count).hide();
    $$('#el_material_hc_' + count).hide();
    $$('#el_ukuran_ts_' + count).css("display", "none");
}

/**
 * FIX: Unlock price field jika harga kosong (khusus untuk custom koper HCC)
 * Dipanggil setelah semua komponen harga selesai diload dari API
 * @param {number} count - Proforma counter
 */
function unlockPriceIfEmpty(count) {
    var tipe = jQuery('#jenis_' + count).val();
    var productInfo = detectProductType(tipe);

    // Hanya untuk custom koper (HCC)
    if (!productInfo.isCustom) {
        return;
    }

    var priceField = document.getElementById('price_' + count);
    if (!priceField) return;

    var currentPrice = priceField.value.replace(/,/g, '').trim();

    // Jika harga kosong atau 0, unlock field agar user bisa input manual
    if (!currentPrice || currentPrice === '' || parseFloat(currentPrice) === 0) {
        priceField.readOnly = false;
        priceField.removeAttribute('data-is-koper');
        console.log('✅ unlockPriceIfEmpty: Price field unlocked for manual input (HCC with empty price)');
    }
}

/**
 * Update UI elements untuk mode edit
 */
function updateUIForEditMode() {
    // Ubah judul halaman
    $$('.page[data-name="performa_input"] .navbar .title').text('Edit Proforma');

    // Ubah text button dari "Simpan" ke "Update"
    $$('#performa_input_button_save').text('Update');

    // Disable client selection (tidak boleh ganti client saat edit)
    $$('.smart-select-perusahaan').addClass('disabled');
    $$('.smart-select-perusahaan').css('pointer-events', 'none');
    $$('.smart-select-perusahaan').css('opacity', '0.7');

    // Hide tombol tambah perusahaan
    $$('#show-add-perusahaan').hide();

    // Set status_perusahaan ke 'perusahaan_database'
    $$('#status_perusahaan').val('perusahaan_database');

    // Hide section tambah perusahaan dan show section database
    $$('.perusahaan_tambah').hide();
    $$('.perusahaan_database').show();

    // Hapus required attribute dari field perusahaan_tambah
    $$('.perusahaan_tambah input, .perusahaan_tambah select, .perusahaan_tambah textarea').each(function () {
        $$(this).prop('required', false);
        $$(this).removeAttr('validate');
    });

    // Eksplisit untuk field kota, posisi, dll
    $$('#kota').prop('required', false).removeAttr('validate');
    $$('#posisi').prop('required', false).removeAttr('validate');
    $$('#client_nama').prop('required', false).removeAttr('validate');
    $$('#alamat').prop('required', false).removeAttr('validate');
    $$('#person').prop('required', false).removeAttr('validate');
    $$('#telepon').prop('required', false).removeAttr('validate');

    $$('#bank-section-performa').show();

    console.log('✅ UI updated for Edit Mode');
}

/**
 * Setup Pay Badge For Smart Select
 */
function setupPayBadgeForSmartSelect() {
    var smartSelectEl = $$('.smart-select-perusahaan')[0];

    if (!smartSelectEl) return;

    $$(smartSelectEl).on('smartselect:open', function (e) {
        setTimeout(function () {
            console.log('Smart Select opened, adding PAY badges...');

            $$('#client_id option').each(function (index, option) {
                var wilayah = $$(option).attr('data-wilayah') || '';
                var clientId = $$(option).val();

                console.log('Checking client:', $$(option).text(), 'Wilayah:', wilayah, 'ID:', clientId);

                if (wilayah.toUpperCase() === 'JAKARTA' && clientId) {
                    console.log('Jakarta client found! Adding badge...');

                    var possibleSelectors = [
                        '.smart-select-page li.item-radio input[value="' + clientId + '"]',
                        '.smart-select-page li input[value="' + clientId + '"]',
                        '.popup.modal-in li input[value="' + clientId + '"]'
                    ];

                    var radioInput = null;
                    for (var i = 0; i < possibleSelectors.length; i++) {
                        radioInput = $$(possibleSelectors[i]);
                        if (radioInput.length > 0) {
                            console.log('Found with selector:', possibleSelectors[i]);
                            break;
                        }
                    }

                    if (radioInput && radioInput.length > 0) {
                        var listItem = radioInput.closest('li');

                        if (listItem.length > 0) {
                            var itemContent = listItem.find('.item-content');

                            if (itemContent.length > 0) {
                                if (itemContent.find('.pay-badge').length === 0) {
                                    itemContent.append('<div class="pay-badge"></div>');
                                    console.log('Badge added successfully!');
                                }
                            }
                        }
                    }
                }
            });

            setTimeout(function () {
                if ($$('.pay-badge').length === 0) {
                    console.log('No badges added, trying alternative approach...');

                    $$('.smart-select-page li, .popup.modal-in li').each(function (idx, li) {
                        var itemText = $$(li).find('.item-title').text();

                        $$('#client_id option').each(function (index, option) {
                            var wilayah = $$(option).attr('data-wilayah') || '';
                            var optionText = $$(option).text();

                            if (wilayah.toUpperCase() === 'JAKARTA' && itemText === optionText) {
                                var itemContent = $$(li).find('.item-content');
                                if (itemContent.length > 0 && itemContent.find('.pay-badge').length === 0) {
                                    itemContent.append('<div class="pay-badge">PAY</div>');
                                    console.log('Badge added via alternative approach for:', optionText);
                                }
                            }
                        });
                    });
                }
            }, 50);
        }, 150);
    });
}

/**
 * Setup Smart Select Popup Styling
 */
function setupSmartSelectPopupStyling() {
    $$(".smart-select").on("smartselect:open", function () {
        setTimeout(function () {
            $$(".smart-select-popup .navbar-inner").addClass("bg-dark-gray-medium");
            console.log("Smart Select popup navbar styled with bg-dark-gray-medium");
        }, 100);
    });

    $$(document).on("smartselect:open", ".smart-select", function () {
        setTimeout(function () {
            $$(".smart-select-popup .navbar-inner").addClass("bg-dark-gray-medium");
        }, 100);
    });
}

/**
 * Handle dropdown katalog button click
 */
function handleDropdownKatalog(count) {
    if (typeof count === 'undefined') {
        count = 1;
    }
    currentProformaCount = count;
    console.log('handleDropdownKatalog - Opening choose catalog type popup for count:', count);
    $$('#openPopupChoose_' + count).click();
}

/**
 * Open katalog by type
 */
function openKatalogByType(type) {
    console.log('Opening katalog type:', type, 'for count:', currentProformaCount);

    app.popup.close('.choose-katalog-type-popup');

    if (type === 'tas') {
        setTimeout(function () {
            console.log('Opening TAS popup...');
            $$('#openPopupTs_' + currentProformaCount).click();
            selectBoxTS(currentProformaCount);
        }, 300);
    } else if (type === 'koper') {
        setTimeout(function () {
            console.log('Opening KOPER popup...');
            $$('#openPopupAll_' + currentProformaCount).click();
            getKatalogPopupAll(currentProformaCount);
        }, 300);
    }
}