// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Apply color validation untuk qty dan net price - EDIT MODE
 * Fungsi ini HANYA apply warna, TIDAK mengubah nilai net harga!
 */
function applyQtyAndNetPriceColorValidation(count) {
    console.log('🎨 applyQtyAndNetPriceColorValidation called for count:', count);

    var qtyElement = $$('#qty_' + count);
    var netHargaElement = $$('#potongan_price_' + count);
    var needsApprovalElement = $$('#needs_approval_' + count);

    var qty = parseInt(qtyElement.val()) || 0;
    var netHargaValue = netHargaElement.val().replace(/\,/g, '');
    var netHarga = parseFloat(netHargaValue) || 0;
    var potonganOtomatis = parseFloat($$('#potongan_otomatis_' + count).val()) || 0;
    var hargaSatuan = parseFloat($$('#harga_satuan_' + count).val()) || 0;

    console.log('  📊 Qty:', qty);
    console.log('  📊 Net Harga (from DB):', netHarga);
    console.log('  📊 Potongan Otomatis:', potonganOtomatis);
    console.log('  📊 Harga Satuan:', hargaSatuan);

    var needsApproval = 0;
    var color = '';

    var normalPrice = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;

    console.log('  📊 Normal Price:', normalPrice);

    if (potonganOtomatis > 0 && netHarga > 0 && netHarga !== potonganOtomatis && netHarga !== normalPrice) {
        console.log('  🟡 Net harga berbeda dari potongan otomatis DAN dari harga normal');
        color = '#FF9800';
        needsApproval = 1;

        qtyElement.css('color', color);
        netHargaElement.css('color', color);
        needsApprovalElement.val(needsApproval);
        updateButtonText();
        return;
    }

    if (qty >= 100) {
        console.log('  ✓ Qty >= 100 - Normal color');
        color = '';
        needsApproval = 0;
    }
    else if (qty >= 50 && qty < 100) {
        console.log('  🟠 Qty 50-99 - Orange color (#fd7d14) - NO APPROVAL');
        color = '#fd7d14';
        needsApproval = 0;
    }
    else if (qty < 50) {
        console.log('  🔴 Qty < 50 - Red color (#fd1414) - NEEDS APPROVAL');
        color = '#fd1414';
        needsApproval = 1;
    }

    qtyElement.css('color', color);
    netHargaElement.css('color', color);
    needsApprovalElement.val(needsApproval);
    updateButtonText();
}

/**
 * Auto-fill Net Harga berdasarkan qty
 */
function autoFillNetHargaBasedOnQty(count) {
    var isEditingFlag = false;
    var editingEl = document.getElementById('is_editing_' + count);
    if (editingEl && editingEl.value === 'true') {
        isEditingFlag = true;
    }

    if (isEditingFlag) {
        console.log('⏭️ Edit mode detected (is_editing flag) - SKIP autoFillNetHargaBasedOnQty for #' + count);
        return;
    }

    var qty = parseFloat($$('#qty_' + count).val()) || 0;
    var normalHargaField = $$('#price_' + count).val();
    var price = 0;

    if (normalHargaField && normalHargaField.trim() !== '') {
        price = parseFloat(normalHargaField.replace(/\,/g, '')) || 0;
    }

    if (price === 0 || qty === 0) {
        return;
    }

    var netHargaElement = $$('#potongan_price_' + count);
    var qtyElement = $$('#qty_' + count);
    var needsApprovalElement = $$('#needs_approval_' + count);
    var warningElement = $$('#warning_perubahan_' + count);

    var hasPotonganFromAPI = globalPotonganData[count] && globalPotonganData[count].harga_setelah_potongan;
    var currentNetHarga = netHargaElement.val().replace(/\,/g, '');
    var potonganOtomatis = $$('#potongan_otomatis_' + count).val();

    if (currentNetHarga && potonganOtomatis &&
        parseFloat(currentNetHarga) !== parseFloat(potonganOtomatis)) {
        console.log('⚠️ User sudah isi net harga manual, skip auto-fill');
        return;
    }

    if (qty >= 100) {
        if (hasPotonganFromAPI) {
            console.log('✅ qty >= 100, ada potongan dari API');
            netHargaElement.css('color', '');
            qtyElement.css('color', '');
            needsApprovalElement.val(0);
            warningElement.hide();
        } else {
            var currentNetHarga = netHargaElement.val().replace(/\,/g, '');
            if (!currentNetHarga || currentNetHarga === '' || parseFloat(currentNetHarga) === 0) {
                netHargaElement.val('');
                netHargaElement.css('color', '');
                qtyElement.css('color', '');
                needsApprovalElement.val(0);
                console.log('⚠️ qty >= 100, tidak ada potongan API, net harga dikosongkan');
            } else {
                netHargaElement.css('color', '');
                qtyElement.css('color', '');
                needsApprovalElement.val(0);
                console.log('✅ qty >= 100, tidak ada potongan API, user isi manual → KEEP (no approval needed)');
            }
            warningElement.hide();
            $$('#potongan_otomatis_' + count).val('');
        }
    } else if (qty >= 50 && qty < 100) {
        var netHarga = price + 5000;
        netHargaElement.val(number_format(netHarga));
        netHargaElement.css('color', '#fd7d14');
        qtyElement.css('color', '#fd7d14');
        needsApprovalElement.val(0);
        warningElement.hide();
        $$('#potongan_otomatis_' + count).val(netHarga);
        console.log('✅ qty 50-99, net = price + 5000 (NORMAL, no approval)');
    } else if (qty < 50) {
        var netHarga = price + 10000;
        netHargaElement.val(number_format(netHarga));
        netHargaElement.css('color', '#fd1414');
        qtyElement.css('color', '#fd1414');
        needsApprovalElement.val(1);
        warningElement.hide();
        $$('#potongan_otomatis_' + count).val(netHarga);
        console.log('✅ qty < 50, net = price + 10000 (NORMAL, no approval)');
    }

    updateButtonText();
}

/**
 * Validate perubahan net harga
 */
function validateNetHargaChange(count) {
    var net_harga_input = $$('#potongan_price_' + count).val().replace(/\,/g, '');
    var potongan_otomatis = $$('#potongan_otomatis_' + count).val();
    var qty = parseFloat($$('#qty_' + count).val()) || 0;

    var net_harga = parseFloat(net_harga_input) || 0;
    var harga_otomatis = parseFloat(potongan_otomatis) || 0;

    var needsApproval = 0;
    var reason = '';
    var color = '';

    var normalPrice = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;

    if (net_harga === 0) {
        needsApproval = 0;
        color = '';
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' kosong');

    } else if (harga_otomatis > 0 && net_harga === harga_otomatis) {
        needsApproval = 0;
        color = '';
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' sama dengan potongan otomatis - NO APPROVAL');

    } else if (normalPrice > 0 && net_harga === normalPrice) {
        needsApproval = 0;
        color = '';
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' sama dengan harga normal - NO APPROVAL');

    } else if (qty >= 50 && (!potongan_otomatis || potongan_otomatis === '' || harga_otomatis === 0)) {
        needsApproval = 0;
        color = '';
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' qty >= 50, tidak ada potongan otomatis - NO APPROVAL');

    } else if (harga_otomatis > 0 && net_harga !== harga_otomatis && net_harga !== normalPrice) {
        needsApproval = 1;
        color = '#FF9800';
        $$('#warning_perubahan_' + count).hide();
        console.log('⚠️ Net Harga #' + count + ' needs approval');

    } else if (qty < 50 && (!potongan_otomatis || potongan_otomatis === '' || harga_otomatis === 0)) {
        needsApproval = 0;
        color = '';
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' qty < 50, tidak ada potongan otomatis - NO APPROVAL');

    } else {
        needsApproval = 0;
        color = '';
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' fallback case - NO APPROVAL');
    }

    $$('#needs_approval_' + count).val(needsApproval);
    $$('#potongan_price_' + count).css('color', color);
    $$('#qty_' + count).css('color', color);
    updateButtonText();
}

/**
 * Handle input net harga realtime
 */
function handleNetHargaInput(count) {
    changeTotalValue(count);
}

/**
 * Update button text berdasarkan approval status
 */
function updateButtonText() {
    var has_approval = false;

    $$('.performa-input.input-item-needs-approval').each(function () {
        var level = parseInt($$(this).val()) || 0;
        if (level > 0) {
            has_approval = true;
            return false;
        }
    });

    if (has_approval) {
        $$('#performa_input_button_save span').text('Ajukan Persetujuan');
        $$('#performa_input_button_save').css('background', '#FF9800');
        $$('#performa_input_button_save').css('color', '#fff');
    } else {
        $$('#performa_input_button_save span').text('Simpan');
        $$('#performa_input_button_save').css('background', '');
        $$('#performa_input_button_save').css('color', '');
    }
}

/**
 * Check apakah ada perubahan net harga yang perlu approval
 */
function hasNeedsApproval() {
    var has_approval = false;
    $$('.performa-input.input-item-needs-approval').each(function () {
        if ($$(this).val() == '1') {
            has_approval = true;
            return false;
        }
    });
    return has_approval;
}

/**
 * Validate phone before submit
 */
function validatePhoneBeforeSubmit() {
    if (phoneCheckInProgress) {
        app.dialog.alert('Mohon tunggu pengecekan nomor telepon selesai');
        return false;
    }

    if (phoneCheckResult === 'exists') {
        app.dialog.alert(
            'Nomor telepon sudah terdaftar. Silakan gunakan nomor telepon lain atau hubungi admin.',
            function () {
                jQuery('#telepon').focus();
            }
        );
        return false;
    }

    return true;
}