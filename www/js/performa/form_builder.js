// ========================================
// FORM BUILDING & REINDEXING FUNCTIONS
// ========================================

/**
 * Build clean FormData (bypass reindex bugs)
 * Membaca field berdasarkan CSS class di dalam container,
 * BUKAN berdasarkan name/id attribute. Index DIJAMIN sequential.
 */
function buildCleanFormData() {
    var formData = new FormData();
    var containers = document.querySelectorAll('.performa_group_field_count');
    var totalItems = containers.length;

    console.log('🔧 buildCleanFormData: Found ' + totalItems + ' performa items');

    // 1. SET count_performa
    formData.append('count_performa', totalItems);

    // 2. HEADER / NON-INDEXED FIELDS
    var form = document.getElementById('performa_form');

    NON_INDEXED_FIELDS.forEach(function (fieldName) {
        var el = form.querySelector('[name="' + fieldName + '"]');
        if (el) {
            if (el.type === 'file') {
                if (el.files && el.files.length > 0) formData.append(fieldName, el.files[0]);
            } else if (el.type === 'radio') {
                var checked = form.querySelector('[name="' + fieldName + '"]:checked');
                if (checked) formData.append(fieldName, checked.value);
            } else {
                formData.append(fieldName, el.value || '');
            }
        }
    });

    // File uploads (customer logos)
    FILE_UPLOAD_FIELDS.forEach(function (fn) {
        var el = form.querySelector('[name="' + fn + '"]');
        if (el && el.type === 'file' && el.files && el.files.length > 0) {
            formData.append(fn, el.files[0]);
        }
    });

    // Checkbox grosir/extra
    var grosirEl = form.querySelector('#grosir');
    var xtraEl = form.querySelector('#xtra');
    var extraEl = form.querySelector('#extra');
    if (grosirEl) formData.append('grosir', grosirEl.checked ? 1 : 0);
    if (xtraEl) formData.append('xtra', xtraEl.checked ? 1 : 0);
    if (extraEl) formData.append('extra', extraEl.checked ? 1 : 0);

    // 3. INDEXED FIELDS PER ITEM (loop by DOM order)
    var has_needs_approval = false;

    containers.forEach(function (container, index) {
        var i = index + 1;

        function getVal(cssClass) {
            var el = container.querySelector('.' + cssClass);
            return el ? (el.value || '') : '';
        }
        function getHtml(cssClass) {
            var el = container.querySelector('.' + cssClass);
            return el ? (el.innerHTML || '') : '';
        }
        function getFile(cssClass) {
            var el = container.querySelector('.' + cssClass);
            return (el && el.files && el.files.length > 0) ? el.files[0] : null;
        }

        // Basic
        formData.append('jenis_' + i, getVal('input-item-jenis'));
        formData.append('qty_' + i, getVal('input-item-qty'));
        formData.append('price_' + i, getVal('input-item-price'));
        formData.append('total_' + i, getVal('input-item-total'));

        // Koper
        formData.append('ukuran_hc_' + i, getVal('input-item-ukuran-hc'));
        formData.append('style_hc_' + i, getVal('input-item-style-hc'));
        formData.append('material_' + i, getVal('input-item-material'));
        formData.append('keterangan_full_' + i, getVal('input-item-ket-full'));
        formData.append('keterangan_singkat_' + i, getVal('input-item-keterangan-singkat'));

        // Tas
        formData.append('ukuran_ts_' + i, getVal('input-item-ukuran-ts'));

        // Hidden fields
        formData.append('id_ukuran_hc_' + i, getVal('input-item-id-ukuran-hc'));
        formData.append('id_material_' + i, getVal('input-item-id-material'));
        var idProdukTs = container.querySelector('.el_id_produk_ts');
        formData.append('id_produk_ts_' + i, idProdukTs ? (idProdukTs.value || '') : '');

        formData.append('proforma_produk_detail_id_' + i, getVal('el_proforma_produk_detail_id'));
        formData.append('proforma_produk_id_' + i, getVal('el_proforma_produk_id'));
        formData.append('harga_satuan_' + i, getVal('el_proforma_harga_satuan'));
        formData.append('harga_style_' + i, getVal('el_proforma_harga_style'));
        formData.append('harga_material_' + i, getVal('el_proforma_harga_material'));

        // Extra
        formData.append('extra_detail_' + i, getVal('input-item-extra'));

        // Potongan
        formData.append('potongan_price_' + i, getVal('input-item-potongan-price'));
        formData.append('potongan_otomatis_' + i, getVal('input-item-potongan-otomatis'));
        var needsApproval = getVal('input-item-needs-approval');
        formData.append('needs_approval_' + i, needsApproval || '0');
        if (parseInt(needsApproval) === 1) has_needs_approval = true;

        // Color
        formData.append('selected_color_' + i, getVal('input-selected-color'));
        formData.append('selected_hex_color_' + i, getVal('input-selected-hex-color'));

        // Note
        formData.append('note_' + i, getVal('input-item-note'));

        // Style HTML - FIX: Filter "Pilih Style"
        var styleHtml = getHtml('el_style_hc_input');
        if (styleHtml === 'Pilih Style' || styleHtml.trim() === '' || styleHtml.trim() === 'Pilih Style') {
            styleHtml = '';
        }
        formData.append('style_new_hc_' + i, styleHtml);

        // File upload
        var file = getFile('input-item-file');
        if (file) formData.append('file_' + i, file);

        // Edit mode: dynamic fields
        var performaIdEl = container.querySelector('[id^="performa_id_"]');
        if (performaIdEl) formData.append('performa_id_' + i, performaIdEl.value || '');
        var existingGambarEl = container.querySelector('[id^="existing_gambar_"]');
        if (existingGambarEl) formData.append('existing_gambar_' + i, existingGambarEl.value || '');

        console.log('  ✅ Item #' + i + ': jenis=' + getVal('input-item-jenis') + ', qty=' + getVal('input-item-qty'));
    });

    // 4. META FIELDS
    formData.append('has_needs_approval', has_needs_approval ? 1 : 0);
    formData.append('karyawan_id', localStorage.getItem("user_id") || '');
    formData.append('user_id', localStorage.getItem("user_id") || '');
    formData.append('sales_kota', localStorage.getItem("sales_kota") || '');
    formData.append('lokasi_pabrik_sales', localStorage.getItem("lokasi_pabrik_sales") || '');
    formData.append('kota', jQuery("#kota option:selected").text() || '');
    formData.append('kota_id', jQuery("#kota").val() || '');

    // Edit mode flags
    if (isEditMode) {
        formData.append('is_edit', '1');
        if (editPerformaHeaderId) {
            formData.append('performa_header_id', editPerformaHeaderId);
        }
    }

    // Existing customer images for edit mode
    if (isEditMode && editPerformaData) {
        var headerData = editPerformaData.header || (Array.isArray(editPerformaData) ? editPerformaData[0] : {});

        // Hanya kirim existing image path jika TIDAK ada file baru di-upload
        var logoEl = form.querySelector('[name="customer_logo"]');
        if ((!logoEl || !logoEl.files || logoEl.files.length === 0) && headerData.customer_logo) {
            formData.append('existing_customer_logo', headerData.customer_logo);
        }
        var bordirEl = form.querySelector('[name="customer_logo_bordir"]');
        if ((!bordirEl || !bordirEl.files || bordirEl.files.length === 0) && headerData.customer_logo_bordir) {
            formData.append('existing_customer_logo_bordir', headerData.customer_logo_bordir);
        }
        var tambahanEl = form.querySelector('[name="customer_logo_tambahan"]');
        if ((!tambahanEl || !tambahanEl.files || tambahanEl.files.length === 0) && headerData.customer_logo_tambahan) {
            formData.append('existing_customer_logo_tambahan', headerData.customer_logo_tambahan);
        }
    }

    // Arrays for backward compat
    containers.forEach(function (container) {
        var na = container.querySelector('.input-item-needs-approval');
        var po = container.querySelector('.input-item-potongan-otomatis');
        formData.append('needs_approval[]', na ? (na.value || '0') : '0');
        formData.append('potongan_otomatis[]', po ? (po.value || '') : '');
    });

    // Debug log
    console.log('🔧 ===== CLEAN FORMDATA CONTENTS =====');
    for (var pair of formData.entries()) {
        if (pair[1] instanceof File) {
            console.log('  ' + pair[0] + ' = [File: ' + pair[1].name + ']');
        } else if (pair[1] !== '' && pair[1] !== '0' && pair[1] !== null) {
            console.log('  ' + pair[0] + ' = ' + pair[1]);
        }
    }
    console.log('🔧 ===== END FORMDATA =====');

    return formData;
}

/**
 * Complete reindex (mencakup SEMUA field)
 */
function reindexAllPerformaFields() {
    console.log('🔄 reindexAllPerformaFields starting...');

    // Reindex container UL
    var cc = 1;
    $$('.performa_group_field_count').each(function () {
        $$(this).attr("id", 'performa_' + cc); cc++;
    });

    // Helper
    function reindex(selector, namePrefix, idPrefix, extraAttrs) {
        var c = 1;
        $$(selector).each(function () {
            if (namePrefix) $$(this).attr("name", namePrefix + c);
            if (idPrefix) $$(this).attr("id", idPrefix + c);
            if (extraAttrs) {
                for (var attr in extraAttrs) {
                    var val = extraAttrs[attr];
                    $$(this).attr(attr, typeof val === 'function' ? val(c) : val.replace(/{n}/g, c));
                }
            }
            c++;
        });
    }

    // Titles
    var tc = 1;
    $$('.title-performa').each(function () {
        $$(this).html('Proforma #' + tc); $$(this).attr("id", 'title_' + tc); tc++;
    });

    // Basic fields
    reindex('.input-item-jenis', 'jenis_', 'jenis_', {
        'onkeyup': function (n) { return 'doSearchByNewType(' + n + ');'; },
        'oninput': function () { return 'this.value = this.value.toUpperCase()'; }
    });
    reindex('.input-item-qty', 'qty_', 'qty_', {
        'onchange': function (n) { return 'changeTotalValue(' + n + ');changeQtyTs(' + n + ');'; }
    });
    reindex('.input-item-price', 'price_', 'price_', {
        'onchange': function (n) { return 'changeTotalValue(' + n + ');'; }
    });
    reindex('.input-item-total', 'total_', 'total_', null);

    // Koper
    reindex('.input-item-ukuran-hc', 'ukuran_hc_', 'ukuran_hc_', {
        'onchange': function (n) { return 'fillHargaProduk(' + n + ');'; }
    });
    reindex('.input-item-style-hc', 'style_hc_', 'style_hc_', {
        'onchange': function (n) { return 'fillHargaVariasiProduk(' + n + ');changeWarnaFullColor(' + n + ');'; }
    });
    reindex('.input-item-material', 'material_', 'material_', {
        'onchange': function (n) { return 'fillHargaMaterialProduk(' + n + ');'; }
    });
    reindex('.input-item-ket-full', 'keterangan_full_', 'keterangan_full_', null);
    reindex('.input-item-keterangan-singkat', 'keterangan_singkat_', 'keterangan_singkat_', null);
    reindex('.input-item-note', 'note_', 'note_', null);

    // Tas
    reindex('.input-item-ukuran-ts', 'ukuran_ts_', 'ukuran_ts_', {
        'onchange': function (n) { return 'fillHargaTs(' + n + ');'; }
    });

    // Hidden fields that were previously NOT reindexed
    reindex('.input-item-id-ukuran-hc', 'id_ukuran_hc_', 'id_ukuran_hc_', null);
    reindex('.input-item-id-material', 'id_material_', 'id_material_', null);
    reindex('.el_id_produk_ts', 'id_produk_ts_', 'id_produk_ts_', null);

    // Extra detail
    reindex('.input-item-extra', 'extra_detail_', 'extra_detail_', {
        'onchange': function (n) { return 'callbackHarga(' + n + ');'; }
    });

    // Hidden fields
    reindex('.el_proforma_produk_detail_id', 'proforma_produk_detail_id_', 'proforma_produk_detail_id_', null);
    reindex('.el_proforma_produk_id', 'proforma_produk_id_', 'proforma_produk_id_', null);
    reindex('.el_proforma_harga_satuan', 'harga_satuan_', 'harga_satuan_', null);
    reindex('.el_proforma_harga_style', 'harga_style_', 'harga_style_', null);
    reindex('.el_proforma_harga_material', 'harga_material_', 'harga_material_', null);

    // Potongan
    reindex('.input-item-potongan-price', 'potongan_price_', 'potongan_price_', null);
    reindex('.input-item-potongan-otomatis', 'potongan_otomatis_', 'potongan_otomatis_', null);
    reindex('.input-item-needs-approval', 'needs_approval_', 'needs_approval_', null);

    // Color
    reindex('.input-selected-color', 'selected_color_', 'selected_color_', null);
    reindex('.input-selected-hex-color', 'selected_hex_color_', 'selected_hex_color_', null);

    // Is editing flag
    reindex('.is-editing-flag', null, 'is_editing_', null);

    // File
    reindex('.input-item-file', 'file_', 'file_', {
        'onchange': function (n) { return 'gambarPerforma(' + n + ');'; }
    });

    // UI elements (ID only)
    reindex('.el_type_proforma_input', null, 'type_proforma_input_', null);
    reindex('.el_gambar_proforma_input', null, 'gambar_proforma_input_', null);
    reindex('.el-smart-style', null, 'ss_style_hc_', null);
    reindex('.el_style_hc_input', null, 'style_hc_input_', null);
    reindex('.el_color_proforma_input', null, 'color_proforma_input_', null);
    reindex('.item-input-el-extra', null, 'el_extra_', null);
    reindex('.show-selected-color', null, 'show_color_fullcolor_', null);
    reindex('.input-clear-button-jenis', null, 'input-clear-button-type-', null);
    reindex('.el-input-ukuran-hc', null, 'el_ukuran_hc_', null);
    reindex('.el-input-style-hc', null, 'el_style_hc_', null);
    reindex('.el-input-material-hc', null, 'el_material_hc_', null);
    reindex('.el-input-ukuran-ts', null, 'el_ukuran_ts_', null);

    // Popups
    reindex('.open_popup_1', 'openPopup_', 'openPopup_', null);
    reindex('.open_popup_all_1', 'openPopupAll_', 'openPopupAll_', null);
    reindex('.open_popup_ts', 'openPopupTs_', 'openPopupTs_', null);

    // Value performa (label)
    var vpc = 1;
    $$('.value_performa').each(function () {
        $$(this).attr("id", 'value_performa_' + vpc);
        $$(this).attr("for", 'file_' + vpc); vpc++;
    });

    // Reset buttons
    reindex('.item-reset-value-qty', null, 'reset_value_qty_', {
        'onclick': function (n) { return 'resetValueQty(' + n + ');'; }
    });
    reindex('.item-reset-value-net-harga', null, 'reset_value_net_harga_', {
        'onclick': function (n) { return 'resetValueNetHarga(' + n + ');'; }
    });

    // Potongan display
    var ndc = 1;
    $$('[id^="nominal_potongan_display_"]').each(function () {
        $$(this).attr("id", 'nominal_potongan_display_' + ndc); ndc++;
    });
    reindex('.icon-copy-potongan', null, 'copy_potongan_icon_', {
        'onclick': function (n) { return 'copyPotonganToNetHarga(' + n + ');'; }
    });
    var ipc = 1;
    $$('.show-potongan-info').each(function () {
        $$(this).attr("id", 'info_potongan_' + ipc);
        $$(this).attr("data-count", ipc); ipc++;
    });
    var wc = 1;
    $$('[id^="warning_perubahan_"]').each(function () {
        $$(this).attr("id", 'warning_perubahan_' + wc); wc++;
    });

    console.log('✅ reindexAllPerformaFields complete');
}