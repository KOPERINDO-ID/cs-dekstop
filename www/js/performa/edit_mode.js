// ========================================
// EDIT MODE FUNCTIONS
// ========================================

/**
 * Check if in edit mode and load data
 */
function checkEditMode() {
    var performaHeaderId = $$('#performa_header_id').val();

    if (performaHeaderId && performaHeaderId !== '' && performaHeaderId !== '0') {
        console.log('🔧 EDIT MODE DETECTED - performa_header_id:', performaHeaderId);
        isEditMode = true;

        // Update UI for edit mode
        updateUIForEditMode();

        // Load performa data
        loadPerformaDataForEdit(performaHeaderId);
    } else {
        console.log('✨ CREATE MODE');
        isEditMode = false;
    }
}

/**
 * Load performa data for edit
 */
function loadPerformaDataForEdit(performaHeaderId) {
    app.preloader.show();

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-performa-detail",
        dataType: "JSON",
        data: {
            performa_header_id: performaHeaderId
        },
        success: function (data) {
            app.preloader.hide();

            if (data.status == 200 && data.data) {
                editPerformaData = data.data;
                populateEditFormProforma(data.data);
            } else {
                app.dialog.alert('Data performa tidak ditemukan');
            }
        },
        error: function () {
            app.preloader.hide();
            app.dialog.alert('Terjadi kesalahan saat mengambil data');
        }
    });
}

/**
 * Populate form with edit data
 */
function populateEditFormProforma(data) {
    console.log('📝 Populating edit form with data:', data);

    // Fill header info
    if (data.client_id) {
        $$('#client_id').val(data.client_id);
    }
    if (data.client_nama) $$('#client_nama').val(data.client_nama);
    if (data.alamat) $$('#alamat').val(data.alamat);
    if (data.kota_id) {
        $$('#kota').val(data.kota_id);
        $$('#kota_id').val(data.kota_id);
    }
    if (data.person) $$('#person').val(data.person);
    if (data.posisi) $$('#posisi').val(data.posisi);
    if (data.telepon) $$('#telepon').val(data.telepon);
    if (data.status_perusahaan) $$('#status_perusahaan').val(data.status_perusahaan);
    if (data.bank_id) {
        loadBankForEdit(data.bank_id);
    }

    // Fill ongkir
    if (data.biaya_kirim) {
        $$('#biaya_kirim').val(number_format(data.biaya_kirim));
    }
    if (data.status_ongkir) {
        $$('#status_ongkir').val(data.status_ongkir);
    }

    // Fill toggle states
    if (data.is_xtra == 1) {
        jQuery('#xtra').prop('checked', true);
    }
    if (data.is_grosir == 1) {
        jQuery('#extra').prop('checked', true);
    }
    if (data.full_colour == 1) {
        jQuery('#full_colour').prop('checked', true);
    }

    // Populate items
    if (data.items && data.items.length > 0) {
        var currentCount = $$('.performa_group_field_count').length;
        var itemsNeeded = data.items.length;

        // Add more performa items if needed
        while (currentCount < itemsNeeded) {
            addPerforma();
            currentCount++;
        }

        // Populate each item
        jQuery.each(data.items, function (index, item) {
            var count = index + 1;
            populateItemData(count, item);
        });
    }
}

/**
 * Populate individual item data
 */
function populateItemData(count, item) {
    console.log('📝 Populating item #' + count + ' with data:', item);

    // Set is_editing flag
    var isEditingField = document.getElementById('is_editing_' + count);
    if (isEditingField) {
        isEditingField.value = 'true';
    }

    // Fill jenis/produk_id
    if (item.produk_id) {
        $$('#jenis_' + count).val(item.produk_id);

        var productInfo = detectProductType(item.produk_id);

        if (productInfo.isKoper) {
            if (productInfo.isCustom) {
                showCustomKoperUI(count);
            } else {
                showKatalogKoperUI(count);
            }

            // Load dropdowns dengan callback
            if (item.id_ukuran) {
                loadUkuranForEditWithCallback(count, item.produk_id, item.id_ukuran, function () {
                    if (item.id_ukuran) {
                        $$('#id_ukuran_hc_' + count).val(item.id_ukuran);
                    }
                });
            }

            if (item.id_style) {
                loadStyleForEditWithCallback(count, item.produk_id, item.id_style, function () {
                    if (item.id_style) {
                        $$('#id_style_hc_' + count).val(item.id_style);
                    }
                });
            }

            if (item.id_material) {
                loadMaterialForEditWithCallback(count, item.produk_id, item.id_material, function () {
                    if (item.id_material) {
                        $$('#id_material_hc_' + count).val(item.id_material);
                    }
                });
            }
        }
    }

    // Fill qty
    if (item.qty) {
        $$('#qty_' + count).val(item.qty);
    }

    // Fill prices
    if (item.harga_satuan) {
        $$('#harga_satuan_' + count).val(item.harga_satuan);
    }
    if (item.harga_style) {
        $$('#harga_style_' + count).val(item.harga_style);
    }
    if (item.price) {
        $$('#price_' + count).val(number_format(item.price));
    }
    if (item.total) {
        $$('#total_' + count).val(number_format(item.total));
    }

    // Fill net harga (potongan_price)
    if (item.harga_setelah_potongan) {
        $$('#potongan_price_' + count).val(number_format(item.harga_setelah_potongan));
        $$('#potongan_otomatis_' + count).val(item.harga_setelah_potongan);
    }

    // Fill color info
    if (item.keterangan_full) {
        $$('#keterangan_full_' + count).val(item.keterangan_full);

        // Restore color badge if has color
        if (item.warna_hex) {
            restoreColorBadge(count, item.keterangan_full, item.warna_hex);
        }
    }

    // Fill extra_detail
    if (item.extra_detail !== undefined) {
        $$('#extra_detail_' + count).val(item.extra_detail);
    }

    // Fill full_colour
    if (item.full_colour !== undefined) {
        $$('#full_colour_' + count).val(item.full_colour);
    }

    // Handle existing images
    if (item.customer_logo) {
        handleEditImages(count, 'customer_logo', item.customer_logo);
    }
    if (item.customer_logo_bordir) {
        handleEditImages(count, 'customer_logo_bordir', item.customer_logo_bordir);
    }
    if (item.customer_logo_tambahan) {
        handleEditImages(count, 'customer_logo_tambahan', item.customer_logo_tambahan);
    }

    // Apply color validation
    setTimeout(function () {
        applyQtyAndNetPriceColorValidation(count);
    }, 500);
}

/**
 * Handle images for edit mode
 */
function handleEditImages(count, fieldName, imagePath) {
    if (imagePath && imagePath !== '') {
        var fullImageUrl = BASE_PATH_IMAGE_UPLOAD + '/' + imagePath;
        $$('#preview_' + fieldName + '_' + count).attr('src', fullImageUrl);
        $$('#preview_' + fieldName + '_' + count).show();
        $$('#existing_' + fieldName + '_' + count).val(imagePath);
    }
}

/**
 * Restore color badge for edit
 */
function restoreColorBadge(count, colorName, colorHex) {
    var badgeElement = $$('#color_badge_' + count);

    if (badgeElement.length > 0) {
        badgeElement.css('background-color', colorHex);
        badgeElement.text(colorName);

        var textColor = getContrastColor(colorHex);
        badgeElement.css('color', textColor);

        badgeElement.show();
    }
}

/**
 * Setup edit mode UI
 */
function setupEditMode() {
    // Disable client selection
    $$('#client_id').prop('disabled', true);

    // Hide add company button
    $$('.btn-add-company').hide();
}