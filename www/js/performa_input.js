// ========================================
// GLOBAL CONFIGURATION & FEATURE FLAGS
// ========================================

/**
 * Feature flags untuk custom koper types
 * Set ke true untuk enable, false untuk disable
 */
const FEATURE_FLAGS = {
    ENABLE_HCC: true,   // Hard Case Custom - ACTIVE (satu-satunya custom koper)
    ENABLE_HPP: false,  // DISABLED - HPP sekarang jadi shortcut ke PP (katalog)
    ENABLE_HPC: false,  // DISABLED - HPC sekarang jadi shortcut ke PC (katalog)
};

/**
 * Similarity codes untuk custom types
 * Digunakan saat load ukuran/material/style dropdown
 * Code ini memiliki data lengkap di database
 */
const CUSTOM_SIMILARITY_CODES = {
    HCC: "HC-112",  // Hard Case yang paling lengkap
};

/**
 * Valid koper types
 * Array ini digunakan untuk validasi dan deteksi
 */
const KOPER_TYPES = {
    KATALOG: ["HC", "PP", "PC"],           // Koper katalog (2 atau 6 digit)
    CUSTOM: ["HCC"]          // Koper custom (jika enabled)
};

/**
 * Validation rules untuk format input
 */
const FORMAT_RULES = {
    KOPER_KATALOG: [2, 6],   // HC, PP, PC: 2 atau 6 digit
    KOPER_CUSTOM: null,       // HCC: flexible (HPP/HPC sudah jadi shortcut ke PP/PC)
    TAS: [3]                  // TAS: hanya 3 digit
};

/**
 * Input shortcuts - auto-convert ketikan user ke kode katalog
 * Contoh: user ketik "HCA" -> otomatis jadi "HC"
 * Yang dikirim ke backend tetap HC, PC, PP (kode katalog)
 */
const INPUT_SHORTCUTS = {
    "HCA": "HC",   // HCA -> HC (Hard Case katalog)
    "HPC": "PC",   // HPC -> PC (Polycarbonate katalog)
    "HPP": "PP"    // HPP -> PP (Polypropylene katalog)
};

/**
 * Apply shortcut conversion pada input value
 * Cek apakah input match dengan salah satu shortcut, jika ya convert
 * @param {string} value - Input value (sudah uppercase)
 * @returns {object} - { converted: boolean, original: string, result: string }
 */
function applyInputShortcut(value) {
    if (!value) return { converted: false, original: value, result: value };
    var upper = value.toUpperCase().trim();
    if (INPUT_SHORTCUTS[upper]) {
        console.log("🔄 Shortcut applied: " + upper + " -> " + INPUT_SHORTCUTS[upper]);
        return { converted: true, original: upper, result: INPUT_SHORTCUTS[upper] };
    }
    return { converted: false, original: upper, result: upper };
}

// ========================================
// EXISTING GLOBAL VARIABLES
// ========================================
var delayTimer;
var isRestoringAfterDelete = false;  // Flag untuk block submit saat restore

var currentProformaCount = 1; // Variable untuk menyimpan proforma count yang sedang aktif

// ========================================
// FIX: BUILD CLEAN FORMDATA (bypass reindex bugs)
// Membaca field berdasarkan CSS class di dalam container,
// BUKAN berdasarkan name/id attribute. Index DIJAMIN sequential.
// ========================================
function buildCleanFormData() {
    var formData = new FormData();
    var containers = document.querySelectorAll('.performa_group_field_count');
    var totalItems = containers.length;

    console.log('🔧 buildCleanFormData: Found ' + totalItems + ' performa items');

    // 1. SET count_performa
    formData.append('count_performa', totalItems);

    // 2. HEADER / NON-INDEXED FIELDS
    var form = document.getElementById('performa_form');
    var nonIndexedFields = [
        'status_perusahaan', 'client_id',
        'total_performa_sum', 'total_performa_qty',
        'status_ongkir', 'biaya_kirim',
        'client_nama', 'alamat', 'kota', 'kota_id',
        'person', 'posisi', 'telepon', 'sales_kota',
        'performa_header_id', 'bank_performa'
    ];

    nonIndexedFields.forEach(function (fieldName) {
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
    ['customer_logo', 'customer_logo_bordir', 'customer_logo_tambahan'].forEach(function (fn) {
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

        // Hidden fields (yang SEBELUMNYA TIDAK di-reindex = sumber bug!)
        formData.append('id_ukuran_hc_' + i, getVal('input-item-id-ukuran-hc'));
        formData.append('id_material_' + i, getVal('input-item-id-material'));
        var idProdukTs = container.querySelector('.el_id_produk_ts');
        formData.append('id_produk_ts_' + i, idProdukTs ? (idProdukTs.value || '') : '');

        formData.append('proforma_produk_detail_id_' + i, getVal('el_proforma_produk_detail_id'));
        formData.append('proforma_produk_id_' + i, getVal('el_proforma_produk_id'));
        formData.append('harga_satuan_' + i, getVal('el_proforma_harga_satuan'));
        formData.append('harga_style_' + i, getVal('el_proforma_harga_style'));
        formData.append('harga_material_' + i, getVal('el_proforma_harga_material'));

        // Extra (FIX BUG: sebelumnya reindex ubah ke "extraN" bukan "extra_detail_N")
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

    // ========================================
    // FIX CELAH #12: Tambah flag edit mode ke FormData
    // Agar backend tahu ini UPDATE bukan CREATE
    // ========================================
    if (isEditMode) {
        formData.append('is_edit', '1');
        if (editPerformaHeaderId) {
            formData.append('performa_header_id', editPerformaHeaderId);
        }
    }

    // ========================================
    // FIX CELAH #13: Kirim existing customer images jika di edit mode
    // Jika user TIDAK upload gambar baru, backend perlu tahu gambar lama
    // ========================================
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

// ========================================
// FIX: COMPLETE REINDEX (mencakup SEMUA field)
// ========================================
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

    // FIX BUG 1: Field yang SEBELUMNYA TIDAK di-reindex
    reindex('.input-item-id-ukuran-hc', 'id_ukuran_hc_', 'id_ukuran_hc_', null);
    reindex('.input-item-id-material', 'id_material_', 'id_material_', null);
    reindex('.el_id_produk_ts', 'id_produk_ts_', 'id_produk_ts_', null);

    // FIX BUG 2: extra_detail (sebelumnya jadi "extraN" bukan "extra_detail_N")
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

    // FIX CELAH #8: Reindex is_editing flag
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

// ========================================
// GLOBAL VARIABLE UNTUK DATA POTONGAN
// ========================================
var globalPotonganData = {};

// ========================================
// GLOBAL VARIABLE UNTUK WARNA KOPER
// ========================================
var globalKoperColor = {
    name: '',    // Nama warna, contoh: "Biru benhor"
    hex: ''      // Kode hex, contoh: "#0033de"
};

// ========================================
// GLOBAL VARIABLE UNTUK EDIT PERFORMA
// ========================================
var isEditMode = false;
var editPerformaHeaderId = null;
var editPerformaData = null;


/**
 * Cek apakah halaman dibuka dalam mode edit
 * Dipanggil saat page:init
 */
function checkEditMode() {
    isEditMode = localStorage.getItem('edit_performa_mode') === 'true';
    editPerformaHeaderId = localStorage.getItem('edit_performa_header_id');

    console.log('🔍 Checking Edit Mode...');
    console.log('isEditMode:', isEditMode);
    console.log('editPerformaHeaderId:', editPerformaHeaderId);

    if (isEditMode && editPerformaHeaderId) {
        console.log('✅ Edit Mode detected! Loading data...');

        // Update UI untuk edit mode
        updateUIForEditMode();

        // Load data dari server
        setTimeout(function () {
            loadPerformaDataForEdit(editPerformaHeaderId);
        }, 1000);

        // ========================================
        // FIX CELAH #10: Clear localStorage SETELAH data berhasil dimuat
        // Sebelumnya localStorage dihapus sebelum AJAX selesai
        // Jika page reload saat loading, edit mode hilang
        // Pindahkan ke success callback loadPerformaDataForEdit
        // ========================================
        // NOTE: localStorage tetap di-clear di sini untuk mencegah stuck di edit mode
        // Tapi editPerformaHeaderId sudah disimpan di variable global
        localStorage.removeItem('edit_performa_mode');
        localStorage.removeItem('edit_performa_header_id');
    } else {
        console.log('📝 Normal Mode - New Proforma');
        isEditMode = false;
        editPerformaHeaderId = null;
    }
}

function loadBankDataPerforma() {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-all-bank",
        dataType: "JSON",
        data: {
            username: localStorage.getItem("username")
        },
        beforeSend: function () {
            console.log("⏳ Loading bank data for performa...");
        },
        success: function (response) {
            if (response.status == 200) {
                globalBankData = response.data;
                console.log("📦 Bank data loaded for performa:", globalBankData);
                console.log("📦 edit performa data:", editPerformaData);

                // Populate ke smart select #bank_performa
                var bankSelect = $$('#bank_performa');
                bankSelect.empty();

                // Add placeholder
                bankSelect.append('<option value="" disabled selected>Pilih Bank</option>');

                // Add bank options
                globalBankData.forEach(function (bank) {
                    console.log("📦 Adding bank option:", bank);

                    // ========================================
                    // FIX CELAH #5: Safe access ke editPerformaData.header.bank_id
                    // editPerformaData bisa berupa array (format lama) atau object
                    // Jika array, tidak punya .header → crash
                    // ========================================
                    var editBankId = null;
                    if (editPerformaData) {
                        if (editPerformaData.header && editPerformaData.header.bank_id) {
                            editBankId = editPerformaData.header.bank_id;
                        } else if (Array.isArray(editPerformaData) && editPerformaData.length > 0 && editPerformaData[0].bank_id) {
                            editBankId = editPerformaData[0].bank_id;
                        }
                    }

                    if (editBankId) {
                        // Jika dalam mode edit, select bank sesuai data
                        if (bank.bank_id == editBankId) {
                            bankSelect.append('<option value="' + bank.bank_id + '" selected>' + bank.bank_label + '</option>');
                        } else {
                            bankSelect.append('<option value="' + bank.bank_id + '">' + bank.bank_label + '</option>');
                        }
                    } else {
                        // Default: select bank_id = 3
                        if (bank.bank_id == 3 || bank.bank_id == '3') {
                            bankSelect.append('<option value="' + bank.bank_id + '" selected>' + bank.bank_label + '</option>');
                        } else {
                            bankSelect.append('<option value="' + bank.bank_id + '">' + bank.bank_label + '</option>');
                        }
                    }
                });

                // Update display text setelah populate
                updateBankDisplayText();

            } else {
                console.error("❌ Failed to load bank data for performa");
            }
        },
        error: function (xhr, status, error) {
            console.error("❌ Error loading bank data for performa:", error);
            console.error("XHR:", xhr);
            console.error("Status:", status);
        }
    });
}

/**
 * Update display text di smart select bank
 */
function updateBankDisplayText() {
    var selectedBankId = $$('#bank_performa').val();

    if (selectedBankId && globalBankData) {
        var selectedBank = globalBankData.find(function (bank) {
            return bank.bank_id == selectedBankId;
        });

        if (selectedBank) {
            $$('.smart-select-bank .item-after').text(selectedBank.bank_label);
            console.log('✅ Bank display updated:', selectedBank.bank_label);
        }
    }
}

/**
 * Get selected bank data
 * @returns {Object|null}
 */
function getSelectedBankData() {
    var selectedBankId = $$('#bank_performa').val();

    if (!selectedBankId || selectedBankId === '') {
        return null;
    }

    var selectedBank = globalBankData.find(function (bank) {
        return bank.bank_id == selectedBankId;
    });

    return selectedBank || null;
}

/**
 * Event handler untuk perubahan bank selection
 */
function initBankChangeHandler() {
    $$('#bank_performa').on('change', function () {
        updateBankDisplayText();
    });
}

/**
 * Update UI elements untuk mode edit
 */
function updateUIForEditMode() {
    // Ubah judul halaman
    $$('.page[data-name="performa_input"] .navbar .title').text('Edit Proforma');

    // Ubah text button dari "Simpan" ke "Update"
    $$('#performa_input_button_save').text('Update');

    // Tambah badge/indicator edit mode
    // $$('#total_performa').parent().prepend(
    //     '<span id="edit_mode_badge" style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;">EDIT MODE</span>'
    // );

    // Disable client selection (tidak boleh ganti client saat edit)
    $$('.smart-select-perusahaan').addClass('disabled');
    $$('.smart-select-perusahaan').css('pointer-events', 'none');
    $$('.smart-select-perusahaan').css('opacity', '0.7');

    // Hide tombol tambah perusahaan
    $$('#show-add-perusahaan').hide();

    // FIX: Set status_perusahaan ke 'perusahaan_database'
    // Di edit mode, client sudah dipilih dari database, bukan tambah baru
    // Ini penting agar validasi field kota, posisi, dll tidak aktif
    $$('#status_perusahaan').val('perusahaan_database');

    // FIX: Hide section tambah perusahaan dan show section database
    $$('.perusahaan_tambah').hide();
    $$('.perusahaan_database').show();

    // ========================================
    // FIX CELAH #18: Hapus required attribute dari field perusahaan_tambah
    // Agar HTML5 validation tidak cek field yang di-hide
    // ========================================
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
 * Load data performa dari server untuk edit
 * 
 * @param {string} headerId - performa_header_id
 */
function loadPerformaDataForEdit(headerId) {
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-performa-for-edit",
        dataType: 'JSON',
        data: {
            performa_header_id: headerId
        },
        beforeSend: function () {
            app.dialog.preloader('Memuat data proforma...');
        },
        success: function (response) {
            app.dialog.close();

            console.log('📦 API Response:', response);
            console.log('📦 Response Type:', typeof response);
            console.log('📦 Response.data:', response.data);
            console.log('📦 Response.data Type:', typeof response.data);
            console.log('📦 Is Array?:', Array.isArray(response.data));

            // FIX: Cek response structure lebih detail
            if (response.status === 'success') {
                // Cek apakah response.data ada dan tidak null/undefined
                if (response.data !== null && response.data !== undefined) {
                    console.log('✅ Performa data loaded for edit');
                    editPerformaData = response.data;

                    // Log struktur data untuk debugging
                    console.log('editPerformaData structure:', {
                        type: typeof editPerformaData,
                        isArray: Array.isArray(editPerformaData),
                        keys: Object.keys(editPerformaData),
                        sample: editPerformaData
                    });

                    // Panggil populateEditForm
                    console.log('🔄 Calling populateEditForm...');
                    populateEditFormProforma(response.data);
                    console.log('✅ Form populated for edit');
                } else {
                    console.error('❌ response.data is null or undefined');
                    app.dialog.alert('Gagal memuat data proforma: Data tidak ditemukan');
                    setTimeout(function () {
                        app.views.main.router.back();
                    }, 2000);
                }
            } else {
                console.error('❌ Response status is not success:', response.status);
                app.dialog.alert('Gagal memuat data proforma: ' + (response.message || 'Unknown error'));
                setTimeout(function () {
                    app.views.main.router.back();
                }, 2000);
            }
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            console.error('❌ Error loading performa data:', error);
            console.error('XHR:', xhr);
            console.error('Status:', status);
            app.dialog.alert('Error: ' + error);

            setTimeout(function () {
                app.views.main.router.back();
            }, 2000);
        }
    });
}


/**
 * Apply color validation untuk qty dan net price - EDIT MODE
 * Fungsi ini HANYA apply warna, TIDAK mengubah nilai net harga!
 * 
 * KONDISI WARNA (URUTAN PRIORITAS):
 * 1. KUNING (#FF9800): Net harga berbeda dari potongan otomatis → needs_approval = 1
 * 2. MERAH (#fd1414): Qty < 50 → needs_approval = 1
 * 3. ORANGE (#fd7d14): Qty 50-99 → needs_approval = 0
 * 4. NORMAL: Qty >= 100 atau Net = Potongan → needs_approval = 0
 * 
 * @param {number} count - Form index (1, 2, 3...)
 */
function applyQtyAndNetPriceColorValidation(count) {
    console.log('🎨 applyQtyAndNetPriceColorValidation called for count:', count);

    var qtyElement = $$('#qty_' + count);
    var netHargaElement = $$('#potongan_price_' + count);
    var needsApprovalElement = $$('#needs_approval_' + count);

    // Ambil nilai qty
    var qty = parseInt(qtyElement.val()) || 0;

    // Ambil nilai net harga dan potongan otomatis
    var netHargaValue = netHargaElement.val().replace(/\,/g, '');
    var netHarga = parseFloat(netHargaValue) || 0;
    var potonganOtomatis = parseFloat($$('#potongan_otomatis_' + count).val()) || 0;

    // Ambil harga satuan untuk debugging
    var hargaSatuan = parseFloat($$('#harga_satuan_' + count).val()) || 0;

    console.log('  📊 Qty:', qty);
    console.log('  📊 Net Harga (from DB):', netHarga);
    console.log('  📊 Potongan Otomatis:', potonganOtomatis);
    console.log('  📊 Harga Satuan:', hargaSatuan);

    var needsApproval = 0;
    var color = '';

    // ========================================
    // PRIORITAS 1: CEK APAKAH NET HARGA BERBEDA DARI POTONGAN OTOMATIS DAN PRICE
    // Ini adalah kondisi WARNA KUNING (#FF9800)
    // HARUS DICEK DULU sebelum validasi qty
    // 
    // Kondisi BUTUH APPROVAL:
    //   - netHarga != potonganOtomatis (bukan harga diskon sistem)
    //   - DAN netHarga != price (bukan harga normal)
    //   → artinya user input harga custom yang beda dari kedua opsi valid
    //
    // Kondisi TIDAK BUTUH APPROVAL:
    //   - netHarga == potonganOtomatis → user pakai diskon sistem → OK
    //   - netHarga == price → user pakai harga normal → OK
    // ========================================
    var normalPrice = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;

    console.log('  📊 Normal Price:', normalPrice);

    if (potonganOtomatis > 0 && netHarga > 0 && netHarga !== potonganOtomatis && netHarga !== normalPrice) {
        // Net harga BERBEDA dari potongan otomatis DAN dari harga normal
        // → WARNA KUNING + needs_approval = 1
        console.log('  🟡 Net harga berbeda dari potongan otomatis DAN dari harga normal');
        console.log('     Net Harga: ' + netHarga + ' vs Potongan: ' + potonganOtomatis + ' vs Price: ' + normalPrice);
        console.log('     → WARNA KUNING (#FF9800) + NEEDS APPROVAL');

        color = '#FF9800'; // Kuning/Orange untuk approval
        needsApproval = 1;

        // HANYA SET WARNA, JANGAN UBAH NILAI!
        qtyElement.css('color', color);
        netHargaElement.css('color', color);
        needsApprovalElement.val(needsApproval);

        // Update button text untuk approval
        updateButtonText();

        // STOP di sini, jangan lanjut ke kondisi qty
        return;
    }

    // ========================================
    // PRIORITAS 2: VALIDASI WARNA BERDASARKAN QTY
    // Hanya dijalankan jika Net Harga = Potongan Otomatis atau tidak ada potongan
    // CATATAN: HANYA apply warna, TIDAK mengubah net harga!
    // ========================================

    if (qty >= 100) {
        // Qty >= 100: Warna normal (tidak ada warna khusus)
        console.log('  ✓ Qty >= 100 - Normal color');
        color = '';
        needsApproval = 0;
    }
    else if (qty >= 50 && qty < 100) {
        // Qty 50-99: Warna ORANGE (#fd7d14)
        // EDIT MODE: Net harga sudah ada di database (sudah + 5000 saat create)
        // Jadi HANYA apply warna, JANGAN ubah nilai!
        console.log('  🟠 Qty 50-99 - Orange color (#fd7d14) - NO APPROVAL');
        console.log('     Net Harga dari DB: ' + netHarga + ' (TIDAK DIUBAH)');
        color = '#fd7d14';
        needsApproval = 0;
    }
    else if (qty < 50) {
        // Qty < 50: Warna MERAH (#fd1414)
        // EDIT MODE: Net harga sudah ada di database (sudah + 10000 saat create)
        // Jadi HANYA apply warna, JANGAN ubah nilai!
        console.log('  🔴 Qty < 50 - Red color (#fd1414) - NEEDS APPROVAL');
        console.log('     Net Harga dari DB: ' + netHarga + ' (TIDAK DIUBAH)');
        color = '#fd1414';
        needsApproval = 1;
    }

    // HANYA SET WARNA dan needs_approval
    // JANGAN ubah nilai net harga!
    qtyElement.css('color', color);
    netHargaElement.css('color', color);
    needsApprovalElement.val(needsApproval);

    // Update button text
    updateButtonText();
}

/**
 * Populate form dengan data dari server
 * 
 * @param {object} data - Data dari API (header + details)
 */
/**
 * Populate form dengan data dari server - VERSI BARU
 * PERBAIKAN: Deteksi koper vs tas dengan benar dan trigger event yang diperlukan
 * 
 * @param {object} data - Data dari API (header + details)
 */
function populateEditFormProforma(data) {
    console.log('🔄 populateEditForm CALLED!');
    console.log('🔄 Data received:', data);
    console.log('🔄 Data type:', typeof data);
    console.log('🔄 Is Array?:', Array.isArray(data));

    app.dialog.preloader('Memuat data ke form...');

    var header, details;
    loadBankDataPerforma();
    // DETECT RESPONSE FORMAT
    if (Array.isArray(data)) {
        console.log('📋 Format detected: ARRAY (details only)');
        details = data;

        if (details.length > 0) {
            header = {
                performa_header_id: details[0].performa_header_id,
                client_id: details[0].client_id,
                client_nama: details[0].client_nama || '',
                client_kota: details[0].client_kota || '',
                grosir: details[0].grosir,
                extra: details[0].extra,
                status_ongkir: details[0].status_ongkir || 'pending',
                biaya_kirim: details[0].biaya_kirim || 0
            };
        } else {
            console.error('❌ Empty details array');
            app.dialog.close();
            app.dialog.alert('Data proforma kosong');
            return;
        }
    } else if (data.header && data.details) {
        console.log('📋 Format detected: OBJECT with header & details');
        header = data.header;
        details = data.details;
    } else {
        console.error('❌ Unknown data format:', data);
        app.dialog.close();
        app.dialog.alert('Format data tidak sesuai');
        return;
    }

    console.log('📦 Header:', header);
    console.log('📦 Details:', details);

    // ========================================
    // 1. SET HEADER DATA
    // ========================================

    console.log('1️⃣ Setting header data...');

    if (!$$('#edit_performa_header_id').length) {
        $$('#performa_form').append('<input type="hidden" id="edit_performa_header_id" name="performa_header_id" value="' + header.performa_header_id + '">');
    } else {
        $$('#edit_performa_header_id').val(header.performa_header_id);
    }
    console.log('✓ Header ID set:', header.performa_header_id);

    function setClientDataForEdit() {
        var maxAttempts = 10;
        var attempts = 0;

        var intervalId = setInterval(function () {
            attempts++;
            var optionsCount = $$('#client_id option').length;

            if (optionsCount > 1) {
                clearInterval(intervalId);

                // Set client value
                $$('#client_id').val(header.client_id);

                // Update display text
                var clientText = (header.client_nama || '') + ' - ' + (header.client_kota || '');
                $$('.smart-select-perusahaan .item-after').text(clientText);

                // PENTING: Trigger change event
                $$('#client_id').trigger('change');

                console.log('✅ Client set successfully');
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(intervalId);
                console.error('❌ Failed to set client');
            }
        }, 200);
    }

    setClientDataForEdit();

    // Set XTRA/POLO checkbox
    if (header.grosir == 1) {
        $$('#extra').prop('checked', true);
        $$('#xtra').prop('checked', false);
        console.log('✓ POLO checked');
    } else {
        $$('#xtra').prop('checked', true);
        $$('#extra').prop('checked', false);
        console.log('✓ XTRA checked');
    }

    // Set Ongkos Kirim
    $$('input[name="status_ongkir"][value="' + (header.status_ongkir || 'pending') + '"]').prop('checked', true);
    if (header.status_ongkir === 'nominal') {
        $$('#input_nominal_ongkir').show();
        $$('#biaya_kirim').val(number_format(header.biaya_kirim || 0));
    }
    console.log('✓ Ongkir set:', header.status_ongkir);

    // ========================================
    // SET NOTE REJECT CRM
    // Kondisi: needs_approval_crm = 1 AND approval_status_crm = 'rejected'
    // ========================================
    if (header.needs_approval_crm == 1 && header.approval_status_crm === 'rejected') {
        console.log('📝 Showing CRM reject note section');
        $$('#note-reject-crm-section').show();

        // Tampilkan note jika ada, atau pesan default jika kosong
        var crmNote = header.approval_note_crm || '(Tidak ada catatan reject dari CRM)';
        $$('#note-reject-crm-text').text(crmNote);
    } else {
        $$('#note-reject-crm-section').hide();
        console.log('✓ CRM reject note hidden (not rejected)');
    }

    // ========================================
    // SET NOTE REJECT CS
    // Kondisi: valid_cs = 2
    // ========================================
    if (header.valid_cs == 2) {
        console.log('📝 Showing CS reject note section');
        $$('#note-reject-cs-section').show();

        // Tampilkan note jika ada, atau pesan default jika kosong
        var csNote = header.keterangan_valid_cs || '(Tidak ada catatan reject dari CS)';
        $$('#note-reject-cs-text').text(csNote);
    } else {
        $$('#note-reject-cs-section').hide();
        console.log('✓ CS reject note hidden (valid_cs != 2)');
    }

    // ========================================
    // PERBAIKAN: SET GAMBAR DARI HEADER (bukan dari detail)
    // ========================================
    console.log('📷 Setting customer images from header...');

    // Emblem
    if (header.customer_logo) {
        var imageEmblemUrl = BASE_PATH_IMAGE_CUSTOMER + '/' + header.customer_logo;
        console.log('  📷 Emblem image:', imageEmblemUrl);

        // Buat wrapper div untuk preview gambar jika belum ada
        setTimeout(function () {
            if (!$$('#preview_customer_logo').length) {
                $$('#value_customer_logo').parent().prepend('<div id="preview_customer_logo" style="text-align: center; margin-bottom: 5px;"></div>');
            }

            // Tampilkan preview gambar
            $$('#preview_customer_logo').html('<img src="' + imageEmblemUrl + '" style="width: 120px; border-radius: 5px; height: 120px; object-fit: contain;" onclick="zoom_view(this.src);" onerror="this.onerror=null; this.src=\'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg\';">');

            // Update label button
            $$('#value_customer_logo').html('Emblem');
        }, 600);
    } else {
        console.log('  ⚠️ No emblem image found in header');

        setTimeout(function () {
            if (!$$('#preview_customer_logo').length) {
                $$('#value_customer_logo').parent().prepend('<div id="preview_customer_logo" style="text-align: center; margin-bottom: 5px;"></div>');
            }
            $$('#preview_customer_logo').html('<img src="https://tasindo-sale-webservice.digiseminar.id/noimage.jpg" style="width: 120px; border-radius: 5px; height: 120px; object-fit: contain;">');
            $$('#value_customer_logo').html('Emblem');
        }, 600);
    }

    // Bordir
    if (header.customer_logo_bordir) {
        var imageBordirUrl = BASE_PATH_IMAGE_CUSTOMER + '/' + header.customer_logo_bordir;
        console.log('  📷 Bordir image:', imageBordirUrl);

        setTimeout(function () {
            if (!$$('#preview_customer_logo_bordir').length) {
                $$('#value_customer_logo_bordir').parent().prepend('<div id="preview_customer_logo_bordir" style="text-align: center; margin-bottom: 5px;"></div>');
            }

            $$('#preview_customer_logo_bordir').html('<img src="' + imageBordirUrl + '" style="width: 120px; border-radius: 5px; height: 120px; object-fit: contain;" onclick="zoom_view(this.src);" onerror="this.onerror=null; this.src=\'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg\';">');
            $$('#value_customer_logo_bordir').html('Bordir');
        }, 600);
    } else {
        console.log('  ⚠️ No bordir image found in header');

        setTimeout(function () {
            if (!$$('#preview_customer_logo_bordir').length) {
                $$('#value_customer_logo_bordir').parent().prepend('<div id="preview_customer_logo_bordir" style="text-align: center; margin-bottom: 5px;"></div>');
            }
            $$('#preview_customer_logo_bordir').html('<img src="https://tasindo-sale-webservice.digiseminar.id/noimage.jpg" style="width: 120px; border-radius: 5px; height: 120px; object-fit: contain;">');
            $$('#value_customer_logo_bordir').html('Bordir');
        }, 600);
    }

    // Logo Tambahan
    if (header.customer_logo_tambahan) {
        var imageLogoUrl = BASE_PATH_IMAGE_CUSTOMER + '/' + header.customer_logo_tambahan;
        console.log('  📷 Logo tambahan image:', imageLogoUrl);

        setTimeout(function () {
            if (!$$('#preview_customer_logo_tambahan').length) {
                $$('#value_customer_logo_tambahan').parent().prepend('<div id="preview_customer_logo_tambahan" style="text-align: center; margin-bottom: 5px;"></div>');
            }

            $$('#preview_customer_logo_tambahan').html('<img src="' + imageLogoUrl + '" style="width: 120px; border-radius: 5px; height: 120px; object-fit: contain;" onclick="zoom_view(this.src);" onerror="this.onerror=null; this.src=\'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg\';">');
            $$('#value_customer_logo_tambahan').html('+ Logo');
        }, 600);
    } else {
        console.log('  ⚠️ No logo tambahan image found in header');

        setTimeout(function () {
            if (!$$('#preview_customer_logo_tambahan').length) {
                $$('#value_customer_logo_tambahan').parent().prepend('<div id="preview_customer_logo_tambahan" style="text-align: center; margin-bottom: 5px;"></div>');
            }
            $$('#preview_customer_logo_tambahan').html('<img src="https://tasindo-sale-webservice.digiseminar.id/noimage.jpg" style="width: 120px; border-radius: 5px; height: 120px; object-fit: contain;">');
            $$('#value_customer_logo_tambahan').html('+ Logo');
        }, 600);
    }

    // ========================================
    // 2. SET DETAIL DATA
    // ========================================

    console.log('2️⃣ Setting details data...');

    if (details && details.length > 0) {
        console.log('📝 Processing ' + details.length + ' details...');

        details.forEach(function (detail, index) {
            var count = index + 1;

            console.log('📝 Detail #' + count + ':', detail);

            if (count > 1) {
                console.log('➕ Adding new form for detail #' + count);
                addPerforma();
            }

            setTimeout(function () {
                console.log('🔄 Populating form #' + count + '...');

                // PENTING: Deteksi apakah ini KOPER atau TAS
                // Koper: jenis memiliki delimiter "." (contoh: "PC-107.24", "HC-112.20")
                // Tas: jenis TIDAK memiliki delimiter "."
                var isKoper = detail.jenis && detail.jenis.indexOf('.') !== -1;
                var isTas = detail.jenis && detail.jenis.toUpperCase().indexOf('TAS') !== -1;

                // Cek dari produk_id juga
                if (detail.produk_id) {
                    var produkIdUpper = detail.produk_id.toUpperCase();
                    if (produkIdUpper.indexOf('HC') !== -1 || produkIdUpper.indexOf('PP') !== -1 || produkIdUpper.indexOf('PC') !== -1) {
                        isKoper = true;
                        isTas = false;
                    } else if (produkIdUpper.indexOf('TAS') !== -1) {
                        isTas = true;
                        isKoper = false;
                    }
                }

                console.log('  🔍 Product detection - isKoper:', isKoper, 'isTas:', isTas, 'jenis:', detail.jenis);

                // Panggil fungsi khusus berdasarkan tipe
                if (isKoper) {
                    populateKoperFormForEdit(count, detail);
                } else if (isTas) {
                    populateTasFormForEdit(count, detail);
                } else {
                    // Fallback
                    if (detail.jenis && detail.jenis.indexOf('.') !== -1) {
                        populateKoperFormForEdit(count, detail);
                    } else {
                        populateTasFormForEdit(count, detail);
                    }
                }

                console.log('✅ Form #' + count + ' populated successfully');

            }, count * 500);
        });

        setTimeout(function () {
            app.dialog.close();
            console.log('✅✅✅ ALL FORMS POPULATED SUCCESSFULLY! ✅✅✅');

            updateGrandTotalWithOngkir();

            app.toast.create({
                text: '✓ Data berhasil dimuat untuk edit',
                position: 'center',
                closeTimeout: 2000
            }).open();
        }, (details.length * 500) + 1000);

    } else {
        console.error('❌ No details found');
        app.dialog.close();
        app.dialog.alert('Tidak ada item proforma yang ditemukan');
    }
}
// ========================================
// FUNGSI BARU UNTUK EDIT MODE - KOPER DAN TAS
// ========================================

/**
 * Populate form KOPER untuk edit mode
 * Koper memiliki: jenis dengan "." delimiter, ukuran, material, style, warna
 * 
 * @param {number} count - Form index (1, 2, 3...)
 * @param {object} detail - Detail data dari API
 */
function populateKoperFormForEdit(count, detail) {
    console.log('🧳 Populating KOPER form #' + count);
    console.log('🧳 Detail data:', detail);

    // Parse jenis: "PC-107.24" -> produk_id: "PC-107", ukuran: "24"
    var jenisParts = (detail.jenis || '').split('.');
    var produkId = detail.produk_id || jenisParts[0] || '';
    var ukuran = detail.ukuran_jual || jenisParts[1] || '';

    console.log('  📦 Parsed - produkId:', produkId, 'ukuran:', ukuran);

    // ========================================
    // FIX: Deteksi apakah ini koper CUSTOM (HCC only - HPP/HPC sudah dihapus)
    // Custom koper: butuh upload gambar, TIDAK ada color badge dari katalog
    // Katalog koper: gambar otomatis dari DB, ADA color badge
    // ========================================
    var isCustomKoper = false;
    var produkIdUpper = produkId.toUpperCase();
    if (produkIdUpper === 'HCC') {
        isCustomKoper = true;
    }
    if (!isCustomKoper && detail.jenis) {
        var jenisPrefix = detail.jenis.split('.')[0].toUpperCase();
        if (jenisPrefix === 'HCC') {
            isCustomKoper = true;
        }
    }
    console.log('  🔧 isCustomKoper:', isCustomKoper);

    // 1. Set Jenis/Type
    $$('#jenis_' + count).val(produkId);
    $$('#proforma_produk_id_' + count).val(produkId);
    console.log('  ✓ Jenis set:', produkId);

    // 2. Setup UI berdasarkan tipe koper
    if (isCustomKoper) {
        // CUSTOM KOPER (HCC): Tampilkan gambar upload, hide color badge
        $$('#gambar_proforma_input_' + count).css("display", "initial");
        $$('#color_proforma_input_' + count).css("display", "none");
        $$('#type_proforma_input_' + count).removeClass('col-100').addClass('col-80');
        // Jangan set file required karena sudah ada existing gambar
        $$('#file_' + count).prop('required', false);
        $$('#file_' + count).prop('validate', false);

        // Show preview gambar existing
        if (detail.gambar) {
            var imageUrlCustom = (typeof BASE_PATH_IMAGE_PERFORMA !== 'undefined'
                ? BASE_PATH_IMAGE_PERFORMA : BASE_URL + '/performa_image') + '/' + detail.gambar;
            $$('#value_performa_' + count).html(
                '<img src="' + imageUrlCustom + '" style="max-width: 50px; max-height: 30px;" ' +
                'onerror="this.onerror=null;this.src=\'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg\';">'
            );
            console.log('  ✓ Custom koper gambar preview set:', imageUrlCustom);
        }
    } else {
        // KATALOG KOPER: Tampilkan color badge, hide gambar upload
        $$('#color_proforma_input_' + count).css("display", "block");
        $$('#gambar_proforma_input_' + count).css("display", "none");
        $$('#type_proforma_input_' + count).addClass('col-100').removeClass('col-80');
    }

    $$('#el_ukuran_hc_' + count).show();
    $$('#el_ukuran_ts_' + count).hide();
    $$('#el_style_hc_' + count).show();
    $$('#el_material_hc_' + count).show();
    $$('#el_extra_' + count).show();

    // Disable required untuk ukuran_ts karena ini koper
    $$('#ukuran_ts_' + count).prop('required', false);

    // Set harga readonly untuk koper
    var priceField = document.getElementById('price_' + count);
    if (priceField) {
        priceField.readOnly = true;
        priceField.setAttribute('data-is-koper', 'true');
    }

    // 3. Set extra/grosir detail SEBELUM load dropdown
    if (detail.grosir_detail == 1) {
        $$('#extra_detail_' + count).val('1'); // POLO
        console.log('  ✓ POLO (grosir) selected for detail');
    } else {
        $$('#extra_detail_' + count).val('0'); // XTRA
        console.log('  ✓ XTRA selected for detail');
    }

    // ========================================
    // FIX: Set warna fields SEBELUM load dropdown
    // ========================================
    // Set selected_color dan selected_hex_color dari detail
    if (detail.style_color) {
        $$('#selected_hex_color_' + count).val(detail.style_color);
        console.log('  ✓ selected_hex_color set:', detail.style_color);
    }

    // Extract nama warna dari style jika ada "Asesoris F.C (Kuning)"
    if (detail.style) {
        var colorMatch = detail.style.match(/\(([^)]+)\)/);
        if (colorMatch) {
            $$('#selected_color_' + count).val(colorMatch[1]);
            console.log('  ✓ selected_color set from style:', colorMatch[1]);
        }
    }

    // ========================================
    // FIX: Untuk custom koper, SKIP query produk_detail_id
    // Custom koper tidak ada di tabel produk katalog
    // Untuk katalog koper: resolve produk_detail_id dari warna atau dari existing data
    // ========================================
    if (!isCustomKoper && produkId) {
        if (detail.warna_hex) {
            // Resolve by warna_hex
            jQuery.ajax({
                type: "POST",
                url: BASE_API + "/get-produk-detail-by-color",
                dataType: "JSON",
                async: false,
                data: {
                    produk_id: produkId,
                    warna_hex: detail.warna_hex
                },
                success: function (response) {
                    if (response.data && response.data.produk_detail_id) {
                        $$('#proforma_produk_detail_id_' + count).val(response.data.produk_detail_id);
                        console.log('  ✓ proforma_produk_detail_id set from warna_hex:', response.data.produk_detail_id);
                    } else {
                        console.log('  ⚠️ produk_detail_id not found by warna_hex');
                    }
                },
                error: function () {
                    console.log('  ⚠️ Failed to get produk_detail_id by warna_hex');
                }
            });
        }

        // FIX Bug 3: Jika masih kosong, coba resolve by nama_warna (keterangan_full/spesifikasi)
        if (!$$('#proforma_produk_detail_id_' + count).val()) {
            var namaWarna = detail.spesifikasi || detail.kode_warna || keteranganValue;
            if (namaWarna && namaWarna !== '-') {
                jQuery.ajax({
                    type: "POST",
                    url: BASE_API + "/get-produk-detail-by-color",
                    dataType: "JSON",
                    async: false,
                    data: {
                        produk_id: produkId,
                        nama_warna: namaWarna
                    },
                    success: function (response) {
                        if (response.data && response.data.produk_detail_id) {
                            $$('#proforma_produk_detail_id_' + count).val(response.data.produk_detail_id);
                            console.log('  ✓ proforma_produk_detail_id set from nama_warna:', namaWarna, '->', response.data.produk_detail_id);
                        } else {
                            console.log('  ⚠️ produk_detail_id not found by nama_warna:', namaWarna);
                        }
                    },
                    error: function () {
                        console.log('  ⚠️ Failed to get produk_detail_id by nama_warna');
                    }
                });
            }
        }
    }

    // ========================================
    // FIX: Untuk custom koper, gunakan similarity code untuk API calls dropdown
    // ========================================
    var apiProdukId = produkId;
    if (isCustomKoper) {
        apiProdukId = getApiReadyProdukId(produkId);
        console.log('  🔄 Custom koper: using similarity code', apiProdukId, 'for dropdown API calls');
    }

    // 4. Load dropdown ukuran dengan selected value
    loadUkuranForEditWithCallback(apiProdukId, count, ukuran, detail.id_ukuran, function () {
        console.log('  ✓ Ukuran dropdown loaded and selected:', ukuran);

        setTimeout(function () {
            $$('#id_ukuran_hc_' + count).val(detail.id_ukuran);

            // Harga, potongan, dan total sudah di-set sebelumnya (lihat step 10)
            // Hanya trigger recalculate
            changeTotalValue(count);
        }, 300);
    });

    // 5. Load dropdown material
    loadMaterialForEditWithCallback(apiProdukId, count, detail.material, function () {
        console.log('  ✓ Material dropdown loaded:', detail.material);
    });

    // 6. Load dropdown style DAN set style_hc_input untuk submit
    loadStyleForEditWithCallback(apiProdukId, count, detail.style, detail.style_color, function () {
        console.log('  ✓ Style dropdown loaded:', detail.style);

        // FIX: Pastikan style_hc_input berisi value yang benar untuk submit
        // Backend akan mengambil dari style_new_hc_X yang diambil dari $('#style_hc_input_' + i).html()
        if (detail.style && detail.style !== 'Pilih Style') {
            // Normalize style untuk display (hapus warna dalam kurung)
            var displayStyle = detail.style.replace(/\s*\([^)]+\)\s*/g, '').trim();
            // Tapi untuk submit, kita perlu style asli
            // Cek apakah sudah di-set oleh loadStyleForEditWithCallback
            var currentStyle = $$('#style_hc_input_' + count).html();
            if (!currentStyle || currentStyle === 'Pilih Style' || currentStyle === '') {
                $$('#style_hc_input_' + count).html(displayStyle || detail.style);
            }
            console.log('  ✓ style_hc_input set for submit:', $$('#style_hc_input_' + count).html());
        }
    });

    // 7. Set keterangan_full dengan spesifikasi dari API
    var keteranganValue = detail.keterangan_full || detail.spesifikasi || detail.kode_warna || '-';
    $$('#keterangan_full_' + count).val(keteranganValue);

    // FIX: Untuk custom koper, JANGAN hide keterangan_full (user mungkin perlu edit warna)
    if (isCustomKoper) {
        $$('#el_keterangan_full_' + count).css("display", "");
        console.log('  ✓ Keterangan full visible (custom koper):', keteranganValue);
    } else {
        $$('#el_keterangan_full_' + count).css("display", "none");
        console.log('  ✓ Keterangan full hidden (katalog koper):', keteranganValue);
    }

    // 8. Set color indicator - HANYA untuk katalog koper (custom koper tidak punya warna dari katalog)
    if (!isCustomKoper && detail.warna_hex) {
        var contrastColor = getContrastColor(detail.warna_hex);
        var namaWarna = detail.spesifikasi || detail.kode_warna || '';

        // PERBAIKAN: Gunakan struktur HTML yang sama persis seperti saat input
        $$('#color_input_' + count).html(
            '<div id="performa_color_' + count + '" data-color="' + detail.warna_hex + '" ' +
            'style="display: inline-block; width: 120px; padding: 5px 12px; font-size: 11px; ' +
            'font-weight: bold; color: ' + contrastColor + '; text-align: center; ' +
            'text-transform: uppercase; letter-spacing: 0.5px; border-radius: 5px; ' +
            'background-color:' + detail.warna_hex + ';">' + namaWarna + '</div>'
        );
        console.log('  ✓ Color badge displayed:', namaWarna, 'hex:', detail.warna_hex);
    }

    // 9. Set Keterangan
    if (detail.keterangan) {
        $$('#keterangan_singkat_' + count).val(detail.keterangan);
    }

    // 10. Set Harga dan Potongan SEBELUM trigger getPotongan
    if (detail.price) {
        $$('#harga_satuan_' + count).val(detail.price);
        $$('#price_' + count).val(number_format(detail.price));
        console.log('  ✓ Harga set:', detail.price);
    }

    // PERBAIKAN: Set potongan price dan pastikan field ter-populate
    if (detail.potongan_price) {
        var potonganFormatted = number_format(detail.potongan_price);
        $$('#potongan_price_' + count).val(potonganFormatted);
        // $$('#potongan_otomatis_' + count).val(detail.potongan_price); // REMOVED - FIX CELAH APPROVAL: biarkan API yang set potongan_otomatis
        console.log('  ✓ Potongan price set:', detail.potongan_price, 'formatted:', potonganFormatted);
    }

    if (detail.total) {
        $$('#total_' + count).val(number_format(detail.total));
        console.log('  ✓ Total set:', detail.total);
    }

    // 11. Set Qty dan Trigger getPotongan (tapi jangan replace existing net harga)
    if (detail.qty) {
        $$('#qty_' + count).val(detail.qty);

        // PERBAIKAN: Set flag untuk mencegah auto-replace net harga di edit mode
        $$('#is_editing_' + count).val('true');

        // Simpan net harga existing untuk ditampilkan nanti
        var existingNetHarga = detail.potongan_price || detail.price;

        // PERBAIKAN: Trigger getPotongan setelah set qty (dengan delay lebih lama untuk stability)
        setTimeout(function () {
            console.log("  🔍 Triggering getPotongan for count:", count);

            // Deteksi tipe produk
            var produkId = $$('#jenis_' + count).val();
            var isTas = produkId === 'TAS' || (detail.jenis && detail.jenis.toUpperCase().indexOf('TAS') !== -1);

            // Trigger getPotongan untuk mendapatkan data potongan terbaru
            if (isTas) {
                console.log("  📦 Getting potongan for TAS...");
                getPotonganTas(count);
            } else {
                console.log("  📦 Getting potongan for KOPER...");
                getPotonganKoper(count);
            }


            // PERBAIKAN: Delay tambahan untuk menampilkan icon/nominal SETELAH getPotongan selesai
            setTimeout(function () {
                console.log("  🎯 Displaying icon/nominal based on existing net harga");

                // Ambil harga satuan dan net harga existing
                var hargaSatuan = parseFloat(detail.price || 0);
                var netHargaExisting = parseFloat(existingNetHarga || 0);

                // Cek apakah ada potongan dari API
                var hasPotonganFromAPI = globalPotonganData[count] && globalPotonganData[count].harga_setelah_potongan;

                console.log("  📊 Debug values:", {
                    hargaSatuan: hargaSatuan,
                    netHargaExisting: netHargaExisting,
                    hasPotonganFromAPI: hasPotonganFromAPI,
                    potonganFromAPI: hasPotonganFromAPI ? globalPotonganData[count].harga_setelah_potongan : null,
                    potongan_price_from_detail: detail.potongan_price
                });

                // LOGIKA BARU: Utamakan detail.potongan_price sebagai indikator
                // 1. Jika ADA potongan_price dari database -> cek apakah sama/beda dengan API
                // 2. Jika TIDAK ADA potongan_price -> cek apakah API punya potongan
                if (detail.potongan_price) {
                    // Ada potongan_price dari database - sudah di-set di Net Harga
                    var potonganPrice = parseFloat(detail.potongan_price);

                    if (hasPotonganFromAPI) {
                        var potonganFromAPI = parseFloat(globalPotonganData[count].harga_setelah_potongan);

                        if (Math.abs(potonganPrice - potonganFromAPI) < 0.01) {
                            // Potongan_price SAMA dengan potongan dari API
                            console.log("  ✓ Potongan_price SAMA dengan API, show icon + nominal");
                            $$('#copy_potongan_icon_' + count).show();
                            $$('#nominal_potongan_display_' + count).text(number_format(potonganFromAPI));
                            $$('#nominal_potongan_display_' + count).show();
                        } else {
                            // Potongan_price BEDA dengan potongan dari API
                            console.log("  ⚠️ Potongan_price BEDA dengan API, show icon + nominal API");
                            $$('#copy_potongan_icon_' + count).show();
                            $$('#nominal_potongan_display_' + count).text(number_format(potonganFromAPI));
                            $$('#nominal_potongan_display_' + count).show();
                        }
                    } else {
                        // Tidak ada potongan dari API, tapi ada potongan_price (custom input)
                        console.log("  ✓ No API potongan, but has potongan_price (custom), hide icon");
                        $$('#copy_potongan_icon_' + count).hide();
                        $$('#nominal_potongan_display_' + count).hide();
                    }
                } else {
                    // Tidak ada potongan_price dari database
                    if (hasPotonganFromAPI) {
                        // Ada potongan dari API - tampilkan icon + nominal
                        console.log("  ✓ No potongan_price, but API has potongan, show icon + nominal");
                        var potonganFromAPI = parseFloat(globalPotonganData[count].harga_setelah_potongan);
                        $$('#copy_potongan_icon_' + count).show();
                        $$('#nominal_potongan_display_' + count).text(number_format(potonganFromAPI));
                        $$('#nominal_potongan_display_' + count).show();
                    } else {
                        // Tidak ada potongan sama sekali
                        console.log("  ✓ No potongan at all, hide everything");
                        $$('#copy_potongan_icon_' + count).hide();
                        $$('#nominal_potongan_display_' + count).hide();
                    }
                }

                // Clear flag editing
                $$('#is_editing_' + count).val('false');

                // ========================================
                // PERBAIKAN: Trigger validasi warna qty dan net price
                // ========================================
                console.log("  🎨 Applying color validation for qty and net price...");
                applyQtyAndNetPriceColorValidation(count);
            }, 500);
        }, 1200); // Delay lebih lama untuk memastikan semua field sudah ready
    }

    // ========================================
    // 12. Hidden fields - SET DENGAN BENAR
    // ========================================
    // FIX: id_ukuran harus di-set dari detail
    $$('#id_ukuran_hc_' + count).val(detail.id_ukuran || '');
    console.log('  ✓ id_ukuran_hc set:', detail.id_ukuran);

    // Simpan performa_id
    if (!$$('#performa_id_' + count).length) {
        $$('#performa_' + count).append('<input type="hidden" id="performa_id_' + count + '" name="performa_id_' + count + '" value="' + (detail.performa_id || '') + '">');
    } else {
        $$('#performa_id_' + count).val(detail.performa_id || '');
    }

    // Simpan existing gambar
    if (!$$('#existing_gambar_' + count).length) {
        $$('#performa_' + count).append('<input type="hidden" id="existing_gambar_' + count + '" name="existing_gambar_' + count + '" value="' + (detail.gambar || '') + '">');
    } else {
        $$('#existing_gambar_' + count).val(detail.gambar || '');
    }

    console.log('  ✅ KOPER form #' + count + ' populated successfully');
    console.log('  📋 Hidden fields status:', {
        proforma_produk_id: $$('#proforma_produk_id_' + count).val(),
        proforma_produk_detail_id: $$('#proforma_produk_detail_id_' + count).val(),
        id_ukuran_hc: $$('#id_ukuran_hc_' + count).val(),
        selected_color: $$('#selected_color_' + count).val(),
        selected_hex_color: $$('#selected_hex_color_' + count).val(),
        style_hc_input: $$('#style_hc_input_' + count).html()
    });
}

/**
 * Populate form TAS untuk edit mode
 */
function populateTasFormForEdit(count, detail) {
    console.log('👜 Populating TAS form #' + count);

    // 1. Set Jenis = TAS
    $$('#jenis_' + count).val('TAS');

    // 2. Setup UI untuk TAS
    $$('#gambar_proforma_input_' + count).css("display", "initial");
    $$('#color_proforma_input_' + count).css("display", "none");
    $$('#el_ukuran_ts_' + count).css("display", "initial");
    $$('#type_proforma_input_' + count).css("display", "none");
    $$('#el_ukuran_ts_' + count).removeClass('col-100').addClass('col-80');
    $$('#el_ukuran_hc_' + count).hide();
    $$('#el_style_hc_' + count).hide();
    $$('#el_material_hc_' + count).show();
    $$('#el_extra_' + count).hide();

    // Set harga editable untuk TAS
    var priceField = document.getElementById('price_' + count);
    if (priceField) {
        priceField.readOnly = false;
        priceField.removeAttribute('data-is-koper');
    }

    // 3. Set ukuran TAS
    var ukuranTs = detail.jenis || detail.ukuran_jual || '';
    $$('#ukuran_ts_' + count).val(ukuranTs);

    // 4. Cari id_produk_ts
    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-produk-ts",
        async: false,
        success: function (data) {
            if (data && data.data) {
                var found = data.data.find(function (item) {
                    return item.nama_produk_ts === ukuranTs;
                });
                if (found) {
                    $$('#id_produk_ts_' + count).val(found.id_produk_ts);
                    selectBoxMaterialTs(found.id_produk_ts, count);
                }
            }
        }
    });

    // 5. Set Material
    setTimeout(function () {
        if (detail.material) {
            $$('#material_' + count).val(detail.material);
        }
    }, 500);

    // 6. Set Warna/Spesifikasi
    if (detail.spesifikasi) {
        $$('#keterangan_full_' + count).val(detail.spesifikasi);
    }

    // 7. Set Keterangan
    if (detail.keterangan) {
        $$('#keterangan_singkat_' + count).val(detail.keterangan);
    }

    // 8. Set Harga dan Potongan SEBELUM trigger getPotongan
    if (detail.price) {
        $$('#harga_satuan_' + count).val(detail.price);
        $$('#price_' + count).val(number_format(detail.price));
    }

    if (detail.potongan_price) {
        $$('#potongan_price_' + count).val(number_format(detail.potongan_price));
        // $$('#potongan_otomatis_' + count).val(detail.potongan_price); // REMOVED - FIX CELAH APPROVAL: biarkan API yang set potongan_otomatis
    }

    if (detail.total) {
        $$('#total_' + count).val(number_format(detail.total));
    }

    // 9. Set Qty dan Trigger getPotongan (tapi jangan replace existing net harga)
    if (detail.qty) {
        $$('#qty_' + count).val(detail.qty);

        // PERBAIKAN: Set flag untuk mencegah auto-replace net harga di edit mode
        $$('#is_editing_' + count).val('true');

        // Simpan net harga existing untuk ditampilkan nanti
        var existingNetHarga = detail.potongan_price || detail.price;

        // PERBAIKAN: Trigger getPotongan untuk TAS setelah set qty (dengan delay lebih lama untuk stability)
        setTimeout(function () {
            console.log("  🔍 Triggering getPotongan for TAS, count:", count);
            getPotonganTas(count);

            // PERBAIKAN: Delay tambahan untuk menampilkan icon/nominal SETELAH getPotongan selesai
            setTimeout(function () {
                console.log("  🎯 Displaying icon/nominal based on existing net harga (TAS)");

                // Ambil harga satuan dan net harga existing
                var hargaSatuan = parseFloat(detail.price || 0);
                var netHargaExisting = parseFloat(existingNetHarga || 0);

                // Cek apakah ada potongan dari API
                var hasPotonganFromAPI = globalPotonganData[count] && globalPotonganData[count].harga_setelah_potongan;

                if (hasPotonganFromAPI) {
                    // Ada potongan dari API
                    var potonganFromAPI = globalPotonganData[count].harga_setelah_potongan;

                    // Cek apakah net harga existing sama dengan harga normal
                    if (Math.abs(netHargaExisting - hargaSatuan) < 0.01) {
                        // Net harga = harga normal, tampilkan icon copy + nominal dari API
                        console.log("  ✓ Net harga = harga normal (TAS), show copy icon + nominal from API");
                        $$('#copy_potongan_icon_' + count).show();
                        $$('#nominal_potongan_display_' + count).text(number_format(potonganFromAPI));
                        $$('#nominal_potongan_display_' + count).show();
                    } else {
                        // Net harga ≠ harga normal, tampilkan icon copy + nominal existing
                        console.log("  ✓ Net harga ≠ harga normal (TAS), show copy icon + nominal existing");
                        $$('#copy_potongan_icon_' + count).show();
                        $$('#nominal_potongan_display_' + count).text(number_format(netHargaExisting));
                        $$('#nominal_potongan_display_' + count).show();
                    }
                } else {
                    // Tidak ada potongan dari API
                    if (Math.abs(netHargaExisting - hargaSatuan) < 0.01) {
                        // Net harga = harga normal, tidak ada potongan, hide icon
                        console.log("  ✓ No potongan from API (TAS), net = normal, hide icon");
                        $$('#copy_potongan_icon_' + count).hide();
                        $$('#nominal_potongan_display_' + count).hide();
                    } else {
                        // Net harga ≠ harga normal (custom), tampilkan icon copy
                        console.log("  ✓ No potongan from API (TAS), but has custom net harga");
                        $$('#copy_potongan_icon_' + count).show();
                        $$('#nominal_potongan_display_' + count).hide();
                    }
                }

                // Clear flag editing
                $$('#is_editing_' + count).val('false');

                // ========================================
                // PERBAIKAN: Trigger validasi warna qty dan net price (TAS)
                // ========================================
                console.log("  🎨 Applying color validation for qty and net price (TAS)...");
                applyQtyAndNetPriceColorValidation(count);
            }, 500);

        }, 1200); // Delay lebih lama untuk memastikan semua field sudah ready
    }

    // 10. Recalculate (harga sudah di-set di step 8)
    setTimeout(function () {
        changeTotalValue(count);
    }, 1500);

    // 11. Hidden fields
    $$('#proforma_produk_id_' + count).val('TAS');

    if (!$$('#performa_id_' + count).length) {
        $$('#performa_' + count).append('<input type="hidden" id="performa_id_' + count + '" name="performa_id_' + count + '" value="' + (detail.performa_id || '') + '">');
    } else {
        $$('#performa_id_' + count).val(detail.performa_id || '');
    }

    if (!$$('#existing_gambar_' + count).length) {
        $$('#performa_' + count).append('<input type="hidden" id="existing_gambar_' + count + '" name="existing_gambar_' + count + '" value="' + (detail.gambar || '') + '">');
    } else {
        $$('#existing_gambar_' + count).val(detail.gambar || '');
    }

    // 14. Image preview
    if (detail.gambar) {
        var imageUrl = (typeof BASE_PATH_IMAGE_PERFORMA !== 'undefined' ? BASE_PATH_IMAGE_PERFORMA : BASE_URL + '/performa_image') + '/' + detail.gambar;
        $$('#value_performa_' + count).html('<img src="' + imageUrl + '" style="max-width: 50px; max-height: 30px;">');
    }

    // CATATAN: Gambar emblem/bordir/logo sudah di-set dari header di populateEditFormProforma()

    // 15. Validation
    $$('#ukuran_hc_' + count).prop('required', false).prop('validate', false);
    $$('#style_hc_' + count).prop('required', false).prop('validate', false);
    $$('#ukuran_ts_' + count).prop('required', true).prop('validate', true);
    $$('#material_' + count).prop('required', true).prop('validate', true);
}

/**
 * Load ukuran dropdown untuk edit mode dengan callback
 */
function loadUkuranForEditWithCallback(produkId, count, selectedValue, selectedIdUkuran, callback) {
    console.log('Loading ukuran for edit - produkId:', produkId, 'selectedValue:', selectedValue);

    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#ukuran_hc_' + count).html('<option value="">Pilih Ukuran</option>');

    var xtra = $$('#extra_detail_' + count).val() != '1' ? 1 : 0;

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-ukuran",
        dataType: "JSON",
        data: {
            produk_id: produkId,
            xtra: xtra
        },
        success: function (data) {
            if (data.data && data.data.length > 0) {
                var options = '<option value="">Pilih Ukuran</option>';

                data.data.forEach(function (val) {
                    var isSelected = (val.nama_ukuran == selectedValue) || (val.id_ukuran == selectedIdUkuran);
                    var selected = isSelected ? ' selected' : '';
                    options += '<option value="' + val.nama_ukuran + '" data-id="' + val.id_ukuran + '"' + selected + '> Uk : ' + val.nama_ukuran + '</option>';
                });

                $$('#ukuran_hc_' + count).html(options);

                if (selectedIdUkuran) {
                    $$('#id_ukuran_hc_' + count).val(selectedIdUkuran);
                }
            }

            if (typeof callback === 'function') callback();
        },
        error: function () {
            if (typeof callback === 'function') callback();
        }
    });
}

/**
 * Load material dropdown untuk edit mode dengan callback
 */
function loadMaterialForEditWithCallback(produkId, count, selectedValue, callback) {
    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#material_' + count).html('<option value="">Pilih Material</option>');

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-produk-material",
        dataType: "JSON",
        data: {
            produk_id: produkId
        },
        success: function (data) {
            if (data.data && data.data.length > 0) {
                var options = '<option value="">Pilih Material</option>';

                data.data.forEach(function (val) {
                    var isSelected = (val.nama_material == selectedValue);
                    var selected = isSelected ? ' selected' : '';
                    options += '<option value="' + val.nama_material + '"' + selected + '>' + val.nama_material + '</option>';
                });

                $$('#material_' + count).html(options);
            }

            if (typeof callback === 'function') callback();
        },
        error: function () {
            if (typeof callback === 'function') callback();
        }
    });
}

/**
 * Load style dropdown untuk edit mode dengan callback
 */
function loadStyleForEditWithCallback(produkId, count, selectedStyles, styleColor, callback) {
    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#style_hc_' + count).html('');
    $$('#style_hc_input_' + count).html('Pilih Style');

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-variasi",
        dataType: "JSON",
        data: {
            produk_id: produkId
        },
        success: function (data) {
            if (data.data && data.data.length > 0) {
                var options = '';

                var normalizedStyles = selectedStyles;
                if (selectedStyles && selectedStyles.indexOf('Asesoris F.C') !== -1) {
                    // FIX: Hanya replace bagian "Asesoris F.C" menjadi "Full colour"
                    // JANGAN timpa seluruh string agar style lain (misal "+ 3 buckle") tetap ada
                    // Contoh: "+ 3 buckle,Asesoris F.C (Putih gading)" -> "+ 3 buckle,Full colour (Putih gading)"
                    normalizedStyles = selectedStyles.replace(/Asesoris F\.C/, 'Full colour');
                    console.log('📝 Normalized style:', selectedStyles, '->', normalizedStyles);
                }

                var selectedArray = normalizedStyles ? normalizedStyles.split(',').map(function (s) { return s.trim(); }) : [];

                data.data.forEach(function (val) {
                    var isSelected = selectedArray.some(function (sel) {
                        return sel.indexOf(val.nama_variasi) !== -1 || val.nama_variasi.indexOf(sel) !== -1;
                    });
                    var selected = isSelected ? ' selected' : '';
                    options += '<option value="' + val.nama_variasi + '"' + selected + '>' + val.nama_variasi + '</option>';
                });

                $$('#style_hc_' + count).html(options);

                if (normalizedStyles) {
                    var displayStyle = normalizedStyles.replace(/\s*\([^)]+\)\s*/g, '').trim();
                    $$('#style_hc_input_' + count).html(displayStyle);
                } else {
                    $$('#style_hc_input_' + count).html('Pilih Style');
                }

                if (styleColor) {
                    $$('#selected_hex_color_' + count).val(styleColor);
                    $$('#color_button_' + count).css('background-color', styleColor);
                    $$('#color_button_' + count).css('width', '120px');
                    $$('#color_button_' + count).show();

                    var colorMatch = normalizedStyles ? normalizedStyles.match(/\(([^)]+)\)/) : null;
                    if (colorMatch) {
                        $$('#selected_color_' + count).val(colorMatch[1]);
                        $$('#color_button_' + count).text(colorMatch[1]);
                        $$('#color_button_' + count).css('color', getContrastColor(styleColor));
                    }
                }
            }

            if (typeof callback === 'function') callback();
        },
        error: function () {
            if (typeof callback === 'function') callback();
        }
    });
}
/**
 * Populate satu form detail proforma
 * 
 * @param {number} count - Index form (1, 2, 3, ...)
 * @param {object} detail - Data detail dari API
 */
function populateDetailForm(count, detail) {
    console.log('🔧 Populating detail form #' + count);
    console.log('Detail data:', detail);

    // Parse jenis untuk mendapatkan produk_id dan ukuran
    // Format jenis biasanya: "PC-107.24" atau "HC-112.20"
    var jenisParts = (detail.jenis || '').split('.');
    var produkId = jenisParts[0] || '';
    var ukuran = jenisParts[1] || detail.ukuran_jual || '';

    console.log('Parsed - produkId:', produkId, 'ukuran:', ukuran);

    // Detect product type
    var isKoper = produkId.indexOf('HC') !== -1 || produkId.indexOf('PP') !== -1 || produkId.indexOf('PC') !== -1;
    var isTas = produkId.indexOf('TAS') !== -1 || (detail.jenis && detail.jenis.indexOf('TAS') !== -1);

    console.log('Product type - isKoper:', isKoper, 'isTas:', isTas);

    // ========================================
    // SET HIDDEN FIELDS
    // ========================================
    $$('#proforma_produk_id_' + count).val(produkId);
    $$('#proforma_produk_detail_id_' + count).val(detail.produk_id || '');
    $$('#id_ukuran_hc_' + count).val(detail.id_ukuran || '');

    // Simpan existing gambar (untuk update tanpa upload baru)
    if (!$$('#existing_gambar_' + count).length) {
        $$('#performa_' + count).append('<input type="hidden" id="existing_gambar_' + count + '" name="existing_gambar_' + count + '" value="' + (detail.gambar || '') + '">');
    } else {
        $$('#existing_gambar_' + count).val(detail.gambar || '');
    }

    // Simpan performa_id untuk referensi
    if (!$$('#performa_id_' + count).length) {
        $$('#performa_' + count).append('<input type="hidden" id="performa_id_' + count + '" name="performa_id_' + count + '" value="' + (detail.performa_id || '') + '">');
    } else {
        $$('#performa_id_' + count).val(detail.performa_id || '');
    }

    // ========================================
    // SET COMMON FIELDS DULU (sebelum load dropdown)
    // ========================================

    // Warna/Spesifikasi
    $$('#keterangan_full_' + count).val(detail.spesifikasi || '');

    // Keterangan
    $$('#keterangan_singkat_' + count).val(detail.keterangan || '');

    // Qty
    $$('#qty_' + count).val(detail.qty || 100);

    // Price (harga satuan)
    $$('#price_' + count).val(number_format(detail.price || 0));
    $$('#harga_satuan_' + count).val(detail.price || 0);

    // Net Harga / Potongan Price
    $$('#potongan_price_' + count).val(number_format(detail.potongan_price || 0));

    // Total
    $$('#total_' + count).val(number_format(detail.total || 0));

    // Note
    if ($$('#note_' + count).length) {
        $$('#note_' + count).val(detail.note || '');
    }

    // ========================================
    // SET VISIBLE FIELDS BERDASARKAN TIPE
    // ========================================

    if (isKoper) {
        // === KOPER (HC, PP, PC) ===
        console.log('Processing as KOPER...');

        // Set jenis/type input
        $$('#jenis_' + count).val(produkId);

        // Show koper UI elements
        $$('#el_ukuran_hc_' + count).show();
        $$('#el_style_hc_' + count).show();
        $$('#el_material_hc_' + count).show();
        $$('#el_extra_' + count).show();
        $$('#el_ukuran_ts_' + count).hide();
        $$('#gambar_proforma_input_' + count).hide();
        $$('#color_proforma_input_' + count).show();

        // Set price readonly untuk koper
        var priceField = document.getElementById('price_' + count);
        if (priceField) {
            priceField.readOnly = true;
            priceField.setAttribute('data-is-koper', 'true');
        }

        // Set extra/grosir detail SEBELUM load dropdown
        // grosir_detail = 1 berarti POLO, grosir_detail = 0 berarti XTRA (extra_detail = 1)
        if (detail.grosir_detail == 1) {
            $$('#extra_detail_' + count).val('1'); // POLO
        } else {
            $$('#extra_detail_' + count).val('0'); // XTRA
        }
        console.log('Set extra_detail_' + count + ' to:', $$('#extra_detail_' + count).val());

        // Load dropdown dengan fungsi yang sudah ada
        // Dan set selected value setelah load
        loadUkuranForEdit(produkId, count, ukuran, detail.id_ukuran);
        loadMaterialForEdit(produkId, count, detail.material);
        loadStyleForEdit(produkId, count, detail.style, detail.style_color);

        // Show color indicator jika ada
        if (detail.warna_hex) {
            $$('#color_input_' + count).css('background-color', detail.warna_hex);
            $$('#color_input_' + count).html('<span style="color: ' + getContrastColor(detail.warna_hex) + '; padding: 5px; font-size: 12px;">' + (detail.kode_warna || '') + '</span>');
        }

    } else if (isTas) {
        // === TAS ===
        console.log('Processing as TAS...');

        $$('#jenis_' + count).val('TAS');
        $$('#ukuran_ts_' + count).val(detail.jenis || detail.ukuran_jual);

        // Show TAS UI elements
        $$('#el_ukuran_ts_' + count).show();
        $$('#el_ukuran_hc_' + count).hide();
        $$('#el_style_hc_' + count).hide();
        $$('#el_material_hc_' + count).hide();
        $$('#el_extra_' + count).hide();
        $$('#gambar_proforma_input_' + count).hide();
        $$('#color_proforma_input_' + count).hide();

    } else {
        // === CUSTOM / OTHER ===
        console.log('Processing as CUSTOM/OTHER...');

        $$('#jenis_' + count).val(produkId || detail.jenis);

        // Show upload gambar untuk custom
        $$('#gambar_proforma_input_' + count).show();
        $$('#el_ukuran_hc_' + count).show();
        $$('#el_style_hc_' + count).show();
        $$('#el_material_hc_' + count).show();

        // Load options jika produkId ada
        if (produkId) {
            loadUkuranForEdit(produkId, count, ukuran, detail.id_ukuran);
            loadMaterialForEdit(produkId, count, detail.material);
            loadStyleForEdit(produkId, count, detail.style, detail.style_color);
        }

        // Show existing image preview
        if (detail.gambar) {
            var imageUrl = BASE_PATH_IMAGE_PERFORMA + '/' + detail.gambar;
            $$('#value_performa_' + count).html('<img src="' + imageUrl + '" style="max-width: 50px; max-height: 30px;">');
        }
    }

    console.log('✅ Detail #' + count + ' populated');
}

/**
 * Load opsi ukuran untuk edit mode
 */
function loadUkuranForEdit(produkId, count, selectedValue, selectedIdUkuran) {
    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#ukuran_hc_' + count).html('<option value="">Pilih Ukuran</option>');

    var xtra = $$('#extra_detail_' + count).val() != '1' ? 1 : 0;

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-ukuran",
        dataType: "JSON",
        data: {
            produk_id: produkId,
            xtra: xtra
        },
        success: function (data) {
            if (data.data && data.data.length > 0) {
                var options = '<option value="">Pilih Ukuran</option>';

                data.data.forEach(function (val) {
                    var isSelected = (val.nama_ukuran == selectedValue) || (val.id_ukuran == selectedIdUkuran);
                    var selected = isSelected ? ' selected' : '';
                    options += '<option value="' + val.nama_ukuran + '" data-id="' + val.id_ukuran + '"' + selected + '> Uk : ' + val.nama_ukuran + '</option>';
                });

                $$('#ukuran_hc_' + count).html(options);

                if (selectedIdUkuran) {
                    $$('#id_ukuran_hc_' + count).val(selectedIdUkuran);
                }
            }
        }
    });
}

/**
 * Load opsi material untuk edit mode
 */
function loadMaterialForEdit(produkId, count, selectedValue) {
    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#material_' + count).html('<option value="">Pilih Material</option>');

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-produk-material",
        dataType: "JSON",
        data: {
            produk_id: produkId
        },
        success: function (data) {
            if (data.data && data.data.length > 0) {
                var options = '<option value="">Pilih Material</option>';

                data.data.forEach(function (val) {
                    var isSelected = (val.nama_material == selectedValue);
                    var selected = isSelected ? ' selected' : '';
                    options += '<option value="' + val.nama_material + '"' + selected + '>' + val.nama_material + '</option>';
                });

                $$('#material_' + count).html(options);
            }
        }
    });
}

/**
 * Load opsi style untuk edit mode
 */
function loadStyleForEdit(produkId, count, selectedStyles, styleColor) {
    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#style_hc_' + count).html('');
    $$('#style_hc_input_' + count).html('Pilih Style');

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-variasi",
        dataType: "JSON",
        data: {
            produk_id: produkId
        },
        success: function (data) {
            if (data.data && data.data.length > 0) {
                var options = '';

                // FIX: Normalize "Asesoris F.C" -> "Full colour" agar bisa match dengan dropdown
                var normalizedStyles = selectedStyles;
                if (selectedStyles && selectedStyles.indexOf('Asesoris F.C') !== -1) {
                    normalizedStyles = selectedStyles.replace(/Asesoris F\.C/, 'Full colour');
                    console.log('📝 loadStyleForEdit normalized:', selectedStyles, '->', normalizedStyles);
                }

                var selectedArray = normalizedStyles ? normalizedStyles.split(',').map(function (s) { return s.trim(); }) : [];

                data.data.forEach(function (val) {
                    var isSelected = selectedArray.some(function (sel) {
                        return sel.indexOf(val.nama_variasi) !== -1 || val.nama_variasi.indexOf(sel) !== -1;
                    });
                    var selected = isSelected ? ' selected' : '';
                    options += '<option value="' + val.nama_variasi + '"' + selected + '>' + val.nama_variasi + '</option>';
                });

                $$('#style_hc_' + count).html(options);

                if (normalizedStyles) {
                    var displayStyle = normalizedStyles.replace(/\s*\([^)]+\)\s*/g, '').trim();
                    $$('#style_hc_input_' + count).html(displayStyle);
                } else {
                    $$('#style_hc_input_' + count).html('Pilih Style');
                }

                if (styleColor) {
                    $$('#selected_hex_color_' + count).val(styleColor);
                    $$('#color_button_' + count).css('background-color', styleColor);
                    $$('#color_button_' + count).css('width', '120px');
                    $$('#color_button_' + count).show();

                    var colorMatch = normalizedStyles ? normalizedStyles.match(/\(([^)]+)\)/) : null;
                    if (colorMatch) {
                        $$('#selected_color_' + count).val(colorMatch[1]);
                        $$('#color_button_' + count).text(colorMatch[1]);
                        $$('#color_button_' + count).css('color', getContrastColor(styleColor));
                    }
                }
            }
        }
    });
}

/**
 * Show color indicator untuk koper
 */
function showColorIndicatorForEdit(count, hexColor, colorCode) {
    if (hexColor) {
        $$('#color_proforma_input_' + count).show();
        $$('#color_input_' + count).css('background-color', hexColor);
        $$('#color_input_' + count).html('<span style="color: ' + getContrastColor(hexColor) + '; padding: 5px;">' + (colorCode || '') + '</span>');
    }
}

/**
 * Show existing image preview
 */
function showExistingImagePreview(count, imageName) {
    if (imageName) {
        var imageUrl = BASE_URL + '/performa_image/' + imageName;
        $$('#value_performa_' + count).html('<img src="' + imageUrl + '" style="max-width: 50px; max-height: 30px;">');
        $$('#value_performa_' + count).css('background-color', 'transparent');
    }
}

/**
 * Fungsi untuk menentukan warna text (hitam/putih) berdasarkan brightness background color
 * Menggunakan rumus luminance: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getContrastColor(hexColor) {
    // Remove # jika ada
    hexColor = hexColor.replace('#', '');

    // Convert hex to RGB
    var r = parseInt(hexColor.substr(0, 2), 16);
    var g = parseInt(hexColor.substr(2, 2), 16);
    var b = parseInt(hexColor.substr(4, 2), 16);

    // Hitung luminance
    // Formula: (0.299 * R + 0.587 * G + 0.114 * B)
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b);

    // Jika luminance > 128 (terang), gunakan text hitam
    // Jika luminance <= 128 (gelap), gunakan text putih
    return luminance > 128 ? '#000000' : '#ffffff';
}

// ========================================
// HELPER FUNCTIONS - PRODUCT TYPE DETECTION
// ========================================

/**
 * Deteksi tipe produk dari input
 * @param {string} tipe - Input tipe (contoh: "HC-112", "PP", "PC-118")
 * @returns {object} - { type: 'HC'|'PP'|'PC'|'TAS', isCustom: boolean, isKoper: boolean }
 */
function detectProductType(tipe) {
    if (!tipe) return { type: null, isCustom: false, isKoper: false };

    // Check custom types first (lebih spesifik) - hanya jika enabled
    for (let customType of KOPER_TYPES.CUSTOM) {
        if (FEATURE_FLAGS['ENABLE_' + customType] && tipe.indexOf(customType) != -1) {
            var CUSTOM_TO_BASE = { "HCC": "HC" };
            const baseType = CUSTOM_TO_BASE[customType] || customType.substring(0, 2);
            return { type: baseType, isCustom: true, isKoper: true };
        }
    }

    // Check katalog types
    for (let koperType of KOPER_TYPES.KATALOG) {
        if (tipe.indexOf(koperType) != -1) {
            return { type: koperType, isCustom: false, isKoper: true };
        }
    }

    // Check tas
    if (tipe.indexOf("TAS") != -1) {
        return { type: 'TAS', isCustom: false, isKoper: false };
    }

    return { type: null, isCustom: false, isKoper: false };
}

/**
 * Validasi format input berdasarkan tipe
 * @param {string} tipe - Input tipe
 * @returns {object} - { valid: boolean, message: string }
 */
function validateInputFormat(tipe) {
    const productInfo = detectProductType(tipe);

    if (!productInfo.type) return { valid: true, message: '' };
    if (productInfo.isCustom) return { valid: true, message: '' };

    if (productInfo.isKoper) {
        const validLengths = FORMAT_RULES.KOPER_KATALOG;
        if (!validLengths.includes(tipe.length)) {
            return {
                valid: false,
                message: "Panjang Huruf Tipe " + productInfo.type + " harus " + validLengths.join(' atau ') + " Digit. Contoh: (" + productInfo.type + " atau " + productInfo.type + "-112)"
            };
        }
    }

    if (productInfo.type == 'TAS') {
        const validLengths = FORMAT_RULES.TAS;
        if (!validLengths.includes(tipe.length)) {
            return {
                valid: false,
                message: 'Panjang Huruf Tipe TAS adalah 3 Digit. Contoh: (TAS)'
            };
        }
    }

    return { valid: true, message: '' };
}

/**
 * Get similarity code untuk custom type
 * @param {string} type - Base type (HC, PP, PC)
 * @returns {string} - Similarity code
 */
function getCustomSimilarityCode(type) {
    var BASE_TO_CUSTOM = { "HC": "HCC" };
    var customKey = BASE_TO_CUSTOM[type];
    if (customKey && CUSTOM_SIMILARITY_CODES[customKey]) {
        return CUSTOM_SIMILARITY_CODES[customKey];
    }
    return type + '-112';
}

// ========================================
// HELPER FUNCTIONS - UI MANIPULATION
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


// ========================================
// HELPER FUNCTIONS - PRODUCT TYPE DETECTION
// ========================================

/**
 * Deteksi tipe produk dari input
 * @param {string} tipe - Input tipe (contoh: "HC-112", "PP", "PC-118")
 * @returns {object} - { type: 'HC'|'PP'|'PC'|'TAS', isCustom: boolean, isKoper: boolean }
 */
function detectProductType(tipe) {
    if (!tipe) return { type: null, isCustom: false, isKoper: false };

    // Check custom types first (lebih spesifik) - hanya jika enabled
    for (let customType of KOPER_TYPES.CUSTOM) {
        if (FEATURE_FLAGS['ENABLE_' + customType] && tipe.indexOf(customType) != -1) {
            var CUSTOM_TO_BASE = { "HCC": "HC" };
            const baseType = CUSTOM_TO_BASE[customType] || customType.substring(0, 2);
            return { type: baseType, isCustom: true, isKoper: true };
        }
    }

    // Check katalog types
    for (let koperType of KOPER_TYPES.KATALOG) {
        if (tipe.indexOf(koperType) != -1) {
            return { type: koperType, isCustom: false, isKoper: true };
        }
    }

    // Check tas
    if (tipe.indexOf("TAS") != -1) {
        return { type: 'TAS', isCustom: false, isKoper: false };
    }

    return { type: null, isCustom: false, isKoper: false };
}

/**
 * Validasi format input berdasarkan tipe
 * @param {string} tipe - Input tipe
 * @returns {object} - { valid: boolean, message: string }
 */
function validateInputFormat(tipe) {
    const productInfo = detectProductType(tipe);

    if (!productInfo.type) return { valid: true, message: '' };
    if (productInfo.isCustom) return { valid: true, message: '' };

    if (productInfo.isKoper) {
        const validLengths = FORMAT_RULES.KOPER_KATALOG;
        if (!validLengths.includes(tipe.length)) {
            return {
                valid: false,
                message: "Panjang Huruf Tipe " + productInfo.type + " harus " + validLengths.join(' atau ') + " Digit. Contoh: (" + productInfo.type + " atau " + productInfo.type + "-112)"
            };
        }
    }

    if (productInfo.type == 'TAS') {
        const validLengths = FORMAT_RULES.TAS;
        if (!validLengths.includes(tipe.length)) {
            return {
                valid: false,
                message: 'Panjang Huruf Tipe TAS adalah 3 Digit. Contoh: (TAS)'
            };
        }
    }

    return { valid: true, message: '' };
}

/**
 * Get similarity code untuk custom type
 * @param {string} type - Base type (HC, PP, PC)
 * @returns {string} - Similarity code
 */
function getCustomSimilarityCode(type) {
    var BASE_TO_CUSTOM = { "HC": "HCC" };
    var customKey = BASE_TO_CUSTOM[type];
    if (customKey && CUSTOM_SIMILARITY_CODES[customKey]) {
        return CUSTOM_SIMILARITY_CODES[customKey];
    }
    return type + '-112';
}

// ========================================
// HELPER FUNCTIONS - UI MANIPULATION
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

function doSearchByType(text) {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(function () {
        var tipe = jQuery('#jenis_1').val();
        getKatalog(tipe);
    }, 2000);
}

function clearArray() {
    jenis_produk = [];
    object_produk = {};
    // localStorage.removeItem("qty_hc");
}

var jenis_produk = [];
var object_produk = {};


function clearInputSelect(count) {
    $$('#el_ukuran_ts_' + count).css("display", "none");
    $$('#gambar_proforma_input_' + count).css("display", "none");
    $$('#color_proforma_input_' + count).css("display", "none");
    $$('#type_proforma_input_' + count).css("display", "initial");
    $$('#type_proforma_input_' + count).removeClass('col-80');
    $$('#type_proforma_input_' + count).addClass('col-100');
}

/**
 * Reset semua field proforma saat tipe berubah
 * @param {number} count - Proforma counter
 */
function resetProformaFields(count) {
    // Reset harga dan total
    $$('#price_' + count).val('');
    $$('#qty_' + count).val('');
    $$('#total_' + count).val('');

    // Reset net harga / potongan
    $$('#potongan_price_' + count).val('');
    $$('#potongan_otomatis_' + count).val('');
    $$('#potongan_price_' + count).css('color', ''); // Reset warna

    // Reset hidden fields
    $$('#id_ukuran_hc_' + count).val('');
    $$('#id_material_' + count).val('');
    $$('#id_produk_ts_' + count).val('');
    $$('#harga_satuan_' + count).val(0);
    $$('#harga_style_' + count).val(0);
    $$('#harga_material_' + count).val(0);

    // Reset ukuran dan material dropdowns
    $$('#ukuran_hc_' + count).val('');
    $$('#material_' + count).val('');
    $$('#style_hc_' + count).val('');

    // Reset potongan data
    if (typeof globalPotonganData !== 'undefined') {
        globalPotonganData[count] = null;
    }

    // Hide info dan warning
    $$('#info_potongan_' + count).hide();
    $$('#warning_perubahan_' + count).hide();
    $$('#needs_approval_' + count).val(0);

    // Update grand total
    updateGrandTotalWithOngkir();

    console.log('Reset proforma fields for count:', count);
}

function callPrice() {
    var count = $$('.performa_group_field_count').length;
    for (let i = 0; i < count; i++) {
        if ($('price_' + i).val() != '' || $('price_' + i).val() != 0) {
            fillHargaTs(i);
            fillHargaProduk(i);
        }
    }
}


/**
 * Main function untuk handle input jenis produk
 * Support: HC, PP, PC (katalog & custom jika enabled), TAS
 * REFACTORED VERSION - Support PP & PC
 * 
 * @param {string} tipe - Input dari field jenis_1
 */
function getKatalog(tipe) {
    const count = 1;

    // STEP 0: Apply shortcut conversion (HCA->HC, HPC->PC, HPP->PP)
    var shortcut = applyInputShortcut(tipe);
    if (shortcut.converted) {
        jQuery('#jenis_' + count).val(shortcut.result);
        tipe = shortcut.result;
    }

    // STEP 1: Reset semua field
    resetProformaFields(count);

    // STEP 2: Handle input kosong
    if (tipe == "") {
        $$('#gambar_proforma_input_' + count).css("display", "initial");
        $$('#color_proforma_input_' + count).css("display", "none");
        $$('#type_proforma_input_' + count).removeClass('col-100');
        $$('#type_proforma_input_' + count).addClass('col-80');
        $$('#el_ukuran_hc_' + count).hide();
        $$('#el_ukuran_ts_' + count).css("display", "none");
        $$('#el_style_hc_' + count).hide();
        $$('#el_material_hc_' + count).hide();
        return;
    }

    // STEP 3: Validasi format input
    const validation = validateInputFormat(tipe);
    if (!validation.valid) {
        app.dialog.alert(validation.message);
        resetJenisInput(count);
        return;
    }

    // STEP 4: Deteksi tipe produk
    const productInfo = detectProductType(tipe);

    // STEP 5: Route berdasarkan tipe
    if (productInfo.isKoper) {
        if (productInfo.isCustom) {
            // Custom koper (HCC only)
            handleCustomKoper(productInfo.type, tipe, count);
        } else {
            // Katalog koper (HC, PP, PC)
            handleKatalogKoper(productInfo.type, tipe, count);
        }
    } else if (productInfo.type == 'TAS') {
        handleTas(tipe, count);
    } else {
        // Tipe tidak dikenali - handle sebagai TAS default (backward compatibility)
        console.log('Unknown product type - fallback to TAS:', tipe);
        handleTasLegacy(tipe, count);
    }
}

// ========================================
// HANDLER FUNCTIONS - NEW & MODULAR
// ========================================

/**
 * Handle custom koper (HCC)
 * Hanya dipanggil jika feature flag enabled
 */
function handleCustomKoper(type, tipe, count) {
    console.log('Handle Custom Koper:', type, tipe);
    showCustomKoperUI(type, count);

    // FIX: Setelah semua dropdown selesai load, cek apakah price perlu di-unlock
    // Delay 2 detik untuk memastikan semua AJAX selesai
    setTimeout(function () {
        unlockPriceIfEmpty(count);
    }, 2000);
}

/**
 * Handle katalog koper (HC, PP, PC)
 * Request ke backend untuk ambil data produk
 */
function handleKatalogKoper(type, tipe, count) {
    console.log('Handle Katalog Koper:', type, tipe);

    // AJAX request ke backend
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-produk-proforma",
        dataType: 'JSON',
        data: {
            jenis_1: tipe  // ⚠️ PERUBAHAN PENTING: Kirim FULL CODE, bukan substr(-3)
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();

            // Hide style & material (tidak diperlukan untuk katalog)
            $$('#el_style_hc_' + count).hide();
            $$('#el_material_hc_' + count).hide();

            // Route berdasarkan panjang input
            if (tipe.length == 6) {
                // Katalog spesifik (HC-112, PP-501, PC-118)
                handleKatalogSpesifik(type, tipe, data, count);
            } else if (tipe.length == 2) {
                // Semua katalog (HC, PP, PC)
                handleKatalogSemua(type, tipe, data, count);
            }
            // Format lain sudah divalidasi sebelumnya
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            app.dialog.alert('Gagal memuat data katalog. Silakan coba lagi.');
            console.error('AJAX Error:', error);
            resetJenisInput(count);
        }
    });
}

/**
 * Handle katalog koper spesifik (6 digit)
 * Contoh: HC-112, PP-501, PC-118
 */
function handleKatalogSpesifik(type, tipe, data, count) {
    if (data.data && data.data.length > 0) {
        // Ada data - buka popup katalog
        $("#openPopup_" + count).click();
        getKatalogPopup(tipe, count);  // ⚠️ Kirim full code, bukan substr(-3)
        showKatalogKoperUI(count);

        console.log('Katalog spesifik ditemukan:', type, tipe, data.data.length, 'produk');
    } else {
        // Tidak ada data
        app.dialog.alert('Tidak Ada ' + type + ' Dengan Tipe Ini');
        resetJenisInput(count);

        console.log('Katalog spesifik tidak ditemukan:', type, tipe);
    }
}

/**
 * Handle semua katalog koper (2 digit)
 * Contoh: HC, PP, PC
 */
function handleKatalogSemua(type, tipe, data, count) {
    if (data.data && data.data.length > 0) {
        // Ada data - buka popup semua katalog
        $("#openPopupAll_" + count).click();
        getKatalogPopupAll(count, type);  // ⚠️ PASS TYPE PARAMETER
        showKatalogKoperUI(count);

        console.log('Semua katalog ditemukan:', type, data.data.length, 'produk');
    } else {
        // Tidak ada data
        app.dialog.alert('Tidak Ada ' + type + ' Dengan Tipe Ini');
        resetJenisInput(count);

        console.log('Semua katalog tidak ditemukan:', type);
    }
}

/**
 * Handle tas
 * Format: harus 3 digit (TAS)
 */
function handleTas(tipe, count) {
    console.log('Handle TAS:', tipe);

    $("#openPopupTs_" + count).click();

    // UI configuration
    $$('#gambar_proforma_input_' + count).css("display", "initial");
    $$('#color_proforma_input_' + count).css("display", "none");
    $$('#el_ukuran_ts_' + count).css("display", "initial");
    $$('#type_proforma_input_' + count).css("display", "none");
    $$('#el_ukuran_ts_' + count).removeClass('col-100');
    $$('#el_ukuran_ts_' + count).addClass('col-80');
    $$('#file_' + count).prop('required', true);
    $$('#file_' + count).prop('validate', true);
    $$('#el_ukuran_hc_' + count).hide();

    // Material required untuk TAS (added 24 Des 2025)
    $$('#el_material_hc_' + count).show();
    $$('#material_' + count).prop('required', true);
    $$('#material_' + count).prop('validate', true);

    // Harga tas = manual input (tidak readonly)
    setHargaReadonly(count, false);

    showselectBoxTS(count);
}

/**
 * Handle TAS legacy (backward compatibility)
 * Untuk tipe yang tidak dikenali, fallback ke TAS behavior
 */
function handleTasLegacy(tipe, count) {
    console.log('Handle TAS Legacy (fallback):', tipe);

    $("#openPopupTs_" + count).click();
    $$('#gambar_proforma_input_' + count).css("display", "initial");
    $$('#color_proforma_input_' + count).css("display", "none");
    $$('#el_ukuran_ts_' + count).css("display", "initial");
    $$('#type_proforma_input_' + count).css("display", "none");
    $$('#el_ukuran_ts_' + count).removeClass('col-100');
    $$('#el_ukuran_ts_' + count).addClass('col-80');
    $$('#file_' + count).prop('required', true);
    $$('#file_' + count).prop('validate', true);
    document.getElementById("price_" + count).readOnly = false;
    document.getElementById("price_" + count).removeAttribute('data-is-koper');
    $$('#el_ukuran_hc_' + count).hide();
    showselectBoxTS(count);
}



function showselectBoxTS(count) {
    $('#ukuran_ts_' + count).html('');
    $$('#ukuran_ts_' + count).prop('required', true);
    $$('#ukuran_ts_' + count).prop('validate', true);
    $$('#ukuran_hc_' + count).prop('required', false);
    $$('#ukuran_hc_' + count).prop('validate', false);
    $$('#material_' + count).prop('required', false);
    $$('#material_' + count).prop('validate', false);
    // $$('#type_proforma_input_' + count).prop('required', false);
    // $$('#type_proforma_input_' + count).prop('validate', false);
    // Author: Crysna Wima - 24 Desember 2025
    $$('#type_proforma_input_' + count).prop('required', true);
    $$('#type_proforma_input_' + count).prop('validate', true);
    // End Author
    $$('#el_style_hc_' + count).hide();
    // $$('#el_material_hc_' + count).hide();
    // Author: Crysna Wima - 24 Desember 2025
    $$('#el_material_hc_' + count).show();
    // End Author
    $$('#el_extra_' + count).hide();
    $$('#extra_detail_' + count).prop('required', false);
    $$('#extra_detail_' + count).prop('validate', false);
    $$('#qty_' + count).addClass('change_qty_ts');

    var button = document.getElementById('reset_value_qty_' + count);

    // var a = jenis_produk;
    // var term = 'HC'; // search term (regex pattern)
    // var search = new RegExp(term, 'i'); // prepare a regex object
    // let b = a.filter(item => search.test(item));

    // console.log(b.length);
    // if (jenis_produk.length > 0) {
    //     $$('#qty_' + count).val(jenis_produk[0].qty);
    //     console.log('found hc')
    // } else {
    //     console.log('not found hc')
    // }

    selectBoxTS(count);
    changeHC(count);
}

function showselectBoxUkuran(produk_id, count) {
    $('#ukuran_hc_' + count).html('');
    $$('#ukuran_hc_' + count).prop('required', true);
    $$('#ukuran_hc_' + count).prop('validate', true);
    $$('#ukuran_ts_' + count).prop('required', false);
    $$('#ukuran_ts_' + count).prop('validate', false);
    $$('#material_' + count).prop('required', true);
    $$('#material_' + count).prop('validate', true);
    $$('#type_proforma_input_' + count).prop('required', true);
    $$('#type_proforma_input_' + count).prop('validate', true);

    // ========================================
    // SHOW DROPDOWN XTRA/POLO untuk KOPER
    // ========================================
    $$('#el_extra_' + count).show();
    $$('#extra_detail_' + count).prop('required', true);
    $$('#extra_detail_' + count).prop('validate', true);
    $$('#extra_detail_' + count).prop('disabled', false); // Enable dropdown

    // ========================================
    // PERBAIKAN: Set default value HANYA jika proforma BELUM DIISI
    // Cek apakah price sudah ada nilainya
    // ========================================
    var currentPrice = $$('#price_' + count).val();
    var isAlreadyFilled = currentPrice && currentPrice !== '' && currentPrice !== '0';

    if (!isAlreadyFilled) {
        // Proforma BELUM diisi, set default value sesuai checkbox header
        var headerXtraChecked = $$('#xtra').prop('checked');
        var headerPoloChecked = $$('#extra').prop('checked');

        if (headerPoloChecked) {
            $$('#extra_detail_' + count).val(1); // Polo
            console.log('✅ Set extra_detail_' + count + ' to POLO (1) from header');
        } else {
            $$('#extra_detail_' + count).val(0); // Xtra (default)
            console.log('✅ Set extra_detail_' + count + ' to XTRA (0) from header');
        }
    } else {
        console.log('⚠️ Skipped setting extra_detail_' + count + ' default (already filled)');
    }

    $$('#qty_' + count).removeClass('change_qty_ts');
    selectBoxUkuran(produk_id, count);
    selectBoxStyle(produk_id, count)
    changeHC(count);
}

function getKatalogPopup(tipe, count) {
    // Default count = 1 jika tidak ada parameter
    if (typeof count === 'undefined' || !count) {
        count = 1;
    }

    var katalog_data = '';
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-produk-proforma",
        dataType: 'JSON',
        data: {
            jenis_1: tipe
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            $.each(data.data, function (i, item) {
                if (item.kode_warna != null) {
                    var kode_warna = item.kode_warna;
                } else {
                    var kode_warna = '-';
                }
                katalog_data += '<div class="col-50" style="margin:4px;">';
                katalog_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
                katalog_data += '   <img onclick="fillProformaInput(\'' + item.produk_detail_id + '\',\'' + item.produk_grup_warna + '\',\'' + item.produk_id + '\',\'' + item.nama_warna + '\',' + count + ');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
                katalog_data += '  <h3 style="margin-top:2px;margin-bottom:5px;">' + item.produk_id + '</h3>';
                katalog_data += '  <h6 style="margin-top:2px;margin-bottom:5px;">' + kode_warna + ' | ' + item.nama_warna + '</h6>';
                katalog_data += ' <div style="margin-left:auto;margin-right:auto;">';
                katalog_data += '  <div style="margin-left:auto;margin-right:auto;margin-bottom:10px;width:100px;height:20px;background-color:' + item.produk_grup_warna + '"></div>';
                katalog_data += ' </div>';
                if (item.grosir == 0 && item.xtra == 1) {
                    katalog_data += '	<div class="col-100">';
                    katalog_data += '		<img src="img/logo/lblXtra.png" style="width:101%;margin-bottom:-2px;" />';
                    katalog_data += '	</div>';
                } else if (item.grosir == 1 && item.xtra == 0) {
                    katalog_data += '	<div class="col-100">';
                    katalog_data += '		<img src="img/logo/lblStandart.png" style="width:101%;margin-bottom:-2px;" />';
                    katalog_data += '	</div>';
                } else if (item.grosir == 1 && item.xtra == 1) {
                    katalog_data += '	<div class="col-100">';
                    katalog_data += '		<img src="img/logo/lblCombi.png" style="width:101%;margin-bottom:-2px;" />';
                    katalog_data += '	</div>';
                } else {
                    katalog_data += '	<div class="col-100">';
                    katalog_data += '		';
                    katalog_data += '	</div>';
                }
                katalog_data += '</div>';
                katalog_data += ' </div>';

            });

            app.dialog.close();
            jQuery('#katalog_data').html(katalog_data);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function openPopupKatalog(produk_id, count) {
    $('#openPopup_' + count).click();
    $('#close-all-katalog-popup').click();
    $('#jenis_' + count).val(produk_id);
    if (count != 1) {
        getKatalogPopupAdd(produk_id, count);
    } else {
        getKatalogPopup(produk_id, count);
    }
}

function getKatalogPopupAll(count, type) {
    // Default type to empty string for backward compatibility
    if (typeof type === 'undefined') {
        type = '';
    }

    var produk_data = '';
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-tipe-produk",
        dataType: 'JSON',
        data: {
            tipe_koper: type  // ⚠️ KIRIM TYPE PARAMETER (HC, PP, PC)
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            $.each(data.data, function (i, item) {

                produk_data += '<div class="col-50" style="margin:4px;">';
                produk_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
                produk_data += ' <a>';
                produk_data += '   <img onclick="openPopupKatalog(\'' + item.produk_id + '\',\'' + count + '\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
                produk_data += ' </a>';
                if (item.xtra == 1 && item.grosir == 1) {
                    var size_margin = '5px';
                } else if (item.xtra == 1 || item.grosir == 1) {
                    var size_margin = '5px';
                } else {
                    var size_margin = '33px';
                }
                produk_data += '  <h3 style="margin-top:2px;margin-bottom: ' + size_margin + ';">' + item.produk_id + '</h3>';

                produk_data += '<div class="row d-flex justify-content-center">';
                if (item.grosir == 0 && item.xtra == 1) {
                    produk_data += '	<div class="col-100">';
                    produk_data += '		<img src="img/logo/lblXtra.png" style="width:101%;margin-bottom:-2px;" />';
                    produk_data += '	</div>';
                } else if (item.grosir == 1 && item.xtra == 0) {
                    produk_data += '	<div class="col-100">';
                    produk_data += '		<img src="img/logo/lblStandart.png" style="width:101%;margin-bottom:-2px;" />';
                    produk_data += '	</div>';
                } else if (item.grosir == 1 && item.xtra == 1) {
                    produk_data += '	<div class="col-100">';
                    produk_data += '		<img src="img/logo/lblCombi.png" style="width:101%;margin-bottom:-2px;" />';
                    produk_data += '	</div>';
                } else {
                    produk_data += '	<div class="col-100">';
                    produk_data += '		';
                    produk_data += '	</div>';
                }
                produk_data += '</div>';
                produk_data += '</div>';
                produk_data += ' </div>';

            });

            console.log('getKatalogPopupAll loaded:', type || 'ALL', 'products');

            app.dialog.close();
            jQuery('#produk_data_all_katalog').html(produk_data);

            console.log('getKatalogPopupAll loaded:', type || 'ALL', 'products');
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function fillProformaInput(produk_detail_id, produk_grup_warna, produk_id, nama_warna, count) {
    // Default count = 1 jika tidak ada parameter
    if (typeof count === 'undefined' || !count) {
        count = 1;
    }

    var countAll = document.querySelectorAll('.input-item-ket-full').length;
    $("#close-katalog-popup").click();
    $$('#color_proforma_input_' + count).css("display", "inline");
    $$('#type_proforma_input_' + count).removeClass('col-100');
    $$('#type_proforma_input_' + count).addClass('col-100');
    $$('#ukuran_ts_' + count).prop('required', false);
    $$('#ukuran_ts_' + count).prop('validate', false);

    // Tentukan warna text berdasarkan brightness background
    var textColor = getContrastColor(produk_grup_warna);
    $$('#color_input_' + count).html('<div id="performa_color_' + count + '" data-color="' + produk_grup_warna + '" style="display: inline-block; width: 120px; padding: 5px 12px; font-size: 11px; font-weight: bold; color: ' + textColor + '; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 5px; background-color:' + produk_grup_warna + '">' + nama_warna + '</div>');
    $$('#el_keterangan_full_' + count).css("display", "none");
    $$('#proforma_produk_detail_id_' + count).val(produk_detail_id);
    $$('#proforma_produk_id_' + count).val(produk_id);
    $$('#keterangan_full_' + count).val(nama_warna);

    // ========================================
    // SET GLOBAL VARIABLE - Warna Koper untuk Proforma #1
    // ========================================
    if (count === 1) {
        globalKoperColor.name = nama_warna;
        globalKoperColor.hex = produk_grup_warna;
        console.log('✅ Global koper color set:', globalKoperColor);
    }

    $$('#el_ukuran_hc_' + count).show();
    $$('#el_ukuran_ts_' + count).css("display", "none");
    $$('#el_style_hc_' + count).show();
    $$('#el_material_hc_' + count).show();
    $$('#jenis_' + count).val(produk_id);

    // Set price field readonly dan tandai sebagai koper (harga fixed)
    var priceField = document.getElementById('price_' + count);
    if (priceField) {
        priceField.readOnly = true;
        priceField.setAttribute('data-is-koper', 'true');
    }

    showselectBoxUkuran(produk_id, count);
    selectBoxMaterial(produk_id, count)
}

jQuery('.input-item-biaya-kirim').mask('000,000,000,000', { reverse: true });

function invoicePerforma(client_alamat, performa_header_id, client_name, tanggal_performa) {
    var invoice_performa = '';
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-performa",
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            performa_header_id: performa_header_id
        },
        beforeSend: function () {
            invoice_performa += '<table width="100%" border="0" style="border-spacing: 0; background-color:white; color:black;">';
            invoice_performa += '	<tr>';
            invoice_performa += '		<td colspan="5" style="font-weight:bold;" align="center">SENTRAL TAS & KOPER</td>';
            invoice_performa += '	</tr>';
            invoice_performa += '	<tr>';
            invoice_performa += '		<td colspan="5" align="center">Jl. Raya Kludan No.15A Tanggulangin</td>';
            invoice_performa += '	</tr>';
            invoice_performa += '	<tr>';
            invoice_performa += '		<td colspan="5" align="center">Sidoarjo - Jawa Timur (031) 8053567';
            invoice_performa += '			<hr>';
            invoice_performa += '		</td>';
            invoice_performa += '	</tr>';
            invoice_performa += '	<tr>';
            invoice_performa += '		<td colspan="5" align="center">Proforma Invoice</td>';
            invoice_performa += '	</tr>';
            invoice_performa += '	<tr>';
            invoice_performa += '		<td colspan="3" align="left" >Kepada Yth : <br> ' + client_name.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + ' <br> ' + client_alamat + '</td>';
            invoice_performa += '		<td colspan="2" align="right">' + moment(tanggal_performa).format('DDMMYY') + '-' + performa_header_id.replace(/\PI_/g, '').replace(/^0+/, '') + '</td>';
            invoice_performa += '	</tr>';
            invoice_performa += '	<tr>';
            invoice_performa += '		<td colspan="2" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Spesifikasi</td>';
            invoice_performa += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
            invoice_performa += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
            invoice_performa += '		<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Total Rp.</td>';
            invoice_performa += '	</tr>';

            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            app.dialog.close();
            if (data.data.length != 0) {
                var penjualan_total = 0;

                invoice_performa += '<tbody>';
                jQuery.each(data.data, function (i, val) {

                    invoice_performa += '		<tr>';
                    invoice_performa += '			<td width="30%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; "><center>' + val.jenis + '<br><img src="' + BASE_PATH_IMAGE_PERFORMA + '/' + val.gambar + '" width="70%"></center></td>';
                    invoice_performa += '			<td width="20%" class="label-cell" align="left" style="border-top: solid 1px; white-space: pre;">' + val.spesifikasi + '<font color="red"><br>KET :<br>' + val.keterangan + '</font></td>';
                    invoice_performa += '				<td width="10%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
                    invoice_performa += '					<center>' + val.qty + '</center>';
                    invoice_performa += '				</td>';
                    invoice_performa += '				<td width="20%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
                    invoice_performa += '					<center>' + number_format(val.price) + '</center>';
                    invoice_performa += '				</td>';
                    invoice_performa += '				<td width="20%" colspan="2" class="label-cell text-align-center" style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
                    invoice_performa += '					<center>' + number_format(val.total) + '</center>';
                    invoice_performa += '				</td>';
                    invoice_performa += '			</tr>';

                    penjualan_total += parseInt(val.total);
                });
                invoice_performa += '</tbody>';
                invoice_performa += '		<tr>';
                invoice_performa += '			<td colspan="3" style=" border-top: solid 1px; font-weight:bold;" align="right"></td>';
                invoice_performa += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px;  font-weight:bold; " align="left">';
                invoice_performa += '				Total';
                invoice_performa += '			</td>';
                invoice_performa += '			<td colspan="1" style="padding-left:10px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
                invoice_performa += '				Rp. <font style="float:right; padding-right:10px;">' + number_format(penjualan_total) + '</font>';

                invoice_performa += '			</td>';
                invoice_performa += '		</tr>';

                if (number_format(data.data[0].biaya_kirim) != 0) {
                    invoice_performa += '		<tr>';
                    invoice_performa += '			<td colspan="3" style="font-weight:bold;" align="right"></td>';
                    invoice_performa += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
                    invoice_performa += '				Biaya Kirim';
                    invoice_performa += '			</td>';
                    invoice_performa += '			<td colspan="1" style="padding-left:10px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;  font-weight:bold;" align="left">';
                    invoice_performa += '				Rp. <font style="float:right; padding-right:10px;">' + number_format(data.data[0].biaya_kirim) + '</font>';
                    invoice_performa += '			</td>';
                    invoice_performa += '		</tr>';
                }

                invoice_performa += '		<tr>';
                invoice_performa += '			<td colspan="3" style="font-weight:bold;" align="right"></td>';
                invoice_performa += '			<td colspan="1" style="border-top: solid 1px; border-bottom: solid 1px; border-left: solid 1px;  font-weight:bold; " align="left">';
                invoice_performa += '				Jumlah';
                invoice_performa += '			</td>';
                invoice_performa += '			<td colspan="1" style="padding-left:10px; border-top: solid 1px; border-bottom: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';

                invoice_performa += '				Rp. <font style="float:right; padding-right:10px;">' + number_format(parseInt(penjualan_total) + parseInt(data.data[0].biaya_kirim)) + '</font>';
                invoice_performa += '			</td>';
                invoice_performa += '		</tr>'
                invoice_performa += '		<tr>';
                invoice_performa += '			<td colspan="5">Ket :</td>';
                invoice_performa += '		</tr>';
                invoice_performa += '	</table>';
                invoice_performa += '	<table width="100%" border="0">';
                invoice_performa += '      <tr>';
                invoice_performa += '          <td width="1%">-</td>';
                invoice_performa += '          <td width="70%">Packing finishing plastic</td>';
                invoice_performa += '          <td width="16%" align="center"></td>';
                invoice_performa += '          <td width="13%" align="center"></td>';
                invoice_performa += '      </tr>';
                invoice_performa += '      <tr>';
                invoice_performa += '          <td width="1%">-</td>';
                invoice_performa += '          <td width="70%">Harga produk belum termasuk biaya kirim</td>';
                invoice_performa += '          <td width="16%" align="center"></td>';
                invoice_performa += '          <td width="13%" align="center"></td>';
                invoice_performa += '      </tr>';
                invoice_performa += '      <tr>';
                invoice_performa += '          <td width="1%">-</td>';
                invoice_performa += '          <td width="70%">Komplain lebih 3 hari setelah barang di terima tidak dapat di layani</td>';
                invoice_performa += '          <td width="16%" align="center"></td>';
                invoice_performa += '          <td width="13%" align="center"></td>';
                invoice_performa += '      </tr>';
                invoice_performa += '      <tr>';
                invoice_performa += '          <td width="1%">-</td>';
                invoice_performa += '          <td width="70%">DP 50% sebagai deposit, 50% untuk pelunasan Sebelum Shipping </td>';
                invoice_performa += '          <td width="16%" align="center" style="">Sales</td>';
                invoice_performa += '          <td width="13%" align="center" style="">Customer</td>';
                invoice_performa += '      </tr>';
                invoice_performa += '		<tr>';
                invoice_performa += '			<td colspan="1"></td>';
                invoice_performa += '			<td colspan="2">Expedisi</td>';
                invoice_performa += '		</tr>';
                invoice_performa += '	</table>';
                invoice_performa += '  <table border="0" width="100%" style="border-spacing: 0;">';
                invoice_performa += '      <tr>';
                invoice_performa += '          <td width="50%" align="left" colspan="3" class=""><b>Rekening</b></td>';
                invoice_performa += '          <td width="20%" align="left"  class=""><b></b></td>';
                invoice_performa += '          <td width="15%" align="center" class=""></td>';
                invoice_performa += '          <td width="15%" align="center" class=""></td>';
                invoice_performa += '      </tr>';
                invoice_performa += '      <tr>';
                invoice_performa += '          <td style="border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">BCA</td>';
                invoice_performa += '          <td style="border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
                invoice_performa += '          <td style="border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">01831 29551 a.n Sutono</td>';
                invoice_performa += '          <td width="20%" align="center" class=""></td>';
                invoice_performa += '          <td width="15%" align="center" class=""></td>';
                invoice_performa += '          <td width="15%" align="center" class=""></td>';
                invoice_performa += '      </tr>';
                invoice_performa += '      <tr>';
                invoice_performa += '          <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">Mandiri</td>';
                invoice_performa += '          <td style="border-bottom: solid 1px;  border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
                invoice_performa += '          <td style="border-bottom: solid 1px;  border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">141 000 518 7422 a.n Sutono</td>';
                invoice_performa += '          <td width="20%" align="left"  class=""><b></b></td>';
                invoice_performa += '          <td width="15%" align="center"  style="" class="">' + localStorage.getItem("karyawan_nama") + '</td>';
                invoice_performa += '          <td width="15%" align="center" style="" class="">' + client_name.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + '</td>';
                invoice_performa += '      </tr>';
                invoice_performa += '  </table>';

            }
            console.log(invoice_performa);
            let options = {
                documentSize: 'A4',
                type: 'share',
                fileName: 'invoice_PI_' + client_name + '.pdf'
            }

            pdf.fromData(invoice_performa, options)
                .then((stats) => console.log('status', stats))
                .catch((err) => console.err(err))
            //return app.views.main.router.navigate('/performa');

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });

}

function selectBoxKotaPerforma() {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-kota",
        dataType: "JSON",
        data: {
            user_id: localStorage.getItem("user_id"),
        },
        beforeSend: function () {
        },
        success: function (data) {
            var select_box_kota;
            select_box_kota += '<option value="" selected>-- Kota --</option>';
            jQuery.each(data.data, function (i, val) {
                select_box_kota += '<option value="' + val.id_kota + '" data-nama-kota="' + val.nama_kota + '">' + val.nama_kota + '</option>';
            });
            $$('#kota').html(select_box_kota);
        }
    });

    $$('.item_after_kota').html('KOTA');
}

function selectBoxUkuran(produk_id, count) {
    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#ukuran_hc_' + count).html('<option value="" selected>Pilih Ukuran</option>');

    if ($('#extra_detail_' + count).val() != 1) {
        var xtra = 1;
    } else {
        var xtra = 0;
    }
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-ukuran",
        dataType: "JSON",
        data: {
            produk_id: produk_id,
            xtra: xtra
        },
        beforeSend: function () {
            // Dropdown sudah dikosongkan di atas
        },
        success: function (data) {
            // FIX: Inisialisasi dengan string kosong dan option default
            var select_box_kota = '';
            select_box_kota += '<option value="" selected>Pilih Ukuran</option>';
            jQuery.each(data.data, function (i, val) {
                console.log('Ukuran data:', val);
                select_box_kota += '<option value="' + val.nama_ukuran + '" data-id="' + val.id_ukuran + '"> Uk : ' + val.nama_ukuran + '</option>';
            });
            $$('#ukuran_hc_' + count).html(select_box_kota);

            // FIX: Unbind event handler lama sebelum bind yang baru
            $$('#ukuran_hc_' + count).off('change').on('change', function () {
                var selectElement = this;
                var selectedOption = selectElement.options[selectElement.selectedIndex];
                var id_ukuran = selectedOption ? selectedOption.getAttribute('data-id') : null;

                console.log('Ukuran changed - Setting id_ukuran_hc_' + count + ' to:', id_ukuran);
                $$('#id_ukuran_hc_' + count).val(id_ukuran);

                console.log('Triggering fillHargaProduk after id_ukuran set');
            });
        }
    });
}

function selectBoxStyle(produk_id, count) {
    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#style_hc_' + count).html('');
    $$('#style_hc_input_' + count).html('Pilih Style');

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-variasi",
        dataType: "JSON",
        data: {
            produk_id: produk_id,
        },
        beforeSend: function () {
            // Dropdown sudah dikosongkan di atas
        },
        success: function (data) {
            // FIX: Inisialisasi dengan string kosong (bukan undefined)
            var select_box_style = '';
            jQuery.each(data.data, function (i, val) {
                select_box_style += '<option value="' + val.nama_variasi + '">' + val.nama_variasi + '</option>';
            });
            $$('#style_hc_' + count).html(select_box_style);
            $$('#style_hc_input_' + count).html('Pilih Style');
        }
    });
}


function selectBoxMaterial(produk_id, count) {
    // FIX: Kosongkan dropdown terlebih dahulu
    $$('#material_' + count).html('<option value="" >Pilih Material</option>');

    if ($('#extra_detail_' + count).val() != 1) {
        var xtra = 1;
    } else {
        var xtra = 0;
    }
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-material",
        dataType: "JSON",
        data: {
            produk_id: produk_id,
        },
        beforeSend: function () {
            // Dropdown sudah dikosongkan di atas
        },
        success: function (data) {
            // FIX: Inisialisasi dengan string kosong
            var select_box_kota = '';
            var materialCount = data.data ? data.data.length : 0;
            var autoSelect = (materialCount === 1); // Auto-select jika hanya 1 material

            select_box_kota += '<option value="" >Pilih Material</option>';
            jQuery.each(data.data, function (i, val) {
                if (autoSelect || val.nama_material === 'ABS') {
                    // Auto-select: jika hanya 1 material ATAU jika material = ABS
                    select_box_kota += '<option value="' + val.nama_material + '" selected>' + val.nama_material + '</option>';
                } else {
                    select_box_kota += '<option value="' + val.nama_material + '">' + val.nama_material + '</option>';
                }
            });
            $$('#material_' + count).html(select_box_kota);

            // Jika hanya 1 material, langsung trigger hitung harga material
            if (autoSelect) {
                console.log('✅ Auto-select material: hanya 1 opsi (' + data.data[0].nama_material + ') untuk count=' + count);
                setTimeout(function () {
                    fillHargaMaterialProduk(count);
                }, 300);
            }
        }
    });
}

let currentHCCount = null;
let fullColourPopup = null;

function openStyleSmartSelect(count) {
    const ss = app.smartSelect.get('#ss_style_hc_' + count);
    if (ss) {
        ss.open();
    }
}

function changeWarnaFullColor(count) {
    const $sel = jQuery('#style_hc_' + count);
    const values = ($sel.val() || []); // multiple → array
    const hasFull = Array.isArray(values)
        ? values.includes('Full colour')
        : (values === 'Full colour');

    // Update tampilan text style yang dipilih
    const styleText = Array.isArray(values) ? values.join(', ') : (values || '');
    jQuery('#style_hc_input_' + count).text(styleText);

    // ambil instance SmartSelect
    const ss = app.smartSelect.get('#ss_style_hc_' + count);
    console.log(ss);

    if (hasFull) {
        // jalankan popup warna (tapi kasih sedikit delay juga biar urut)
        setTimeout(() => {
            ss.close();
            selectBoxStyleFullColor(count);
        }, 900);
    } else {
        // reset hidden jika bukan full_color
        ss.close();
        jQuery('#selected_color_' + count).val('');
        jQuery('#selected_hex_color_' + count).val('');
        jQuery('#color_button_' + count).hide();
    }
}


function selectBoxStyleFullColor(count) {
    currentHCCount = count;
    const produk_id_raw = jQuery('#jenis_' + count).val();
    const produk_id = getApiReadyProdukId(produk_id_raw); // Convert HCC ke similarity code
    const color = jQuery('#selected_color_' + count).val();

    if (!color) {
        if (!fullColourPopup) {
            fullColourPopup = app.popup.create({
                el: '.fullcolour-performa-popup',
                closeByBackdropClick: false,
                closeOnEscape: false,
                swipeToClose: false,
            });
        }

        const $grid = jQuery('#swatch-container');
        $grid.empty().append('<div class="text-color-gray">Memuat warna…</div>');

        jQuery.ajax({
            type: "POST",
            url: BASE_API + "/get-produk-fullcolor-internal",
            dataType: "JSON",
            data: { produk_id: produk_id },
            success: function (res) {
                $grid.empty();

                const list = res.data;
                if (!list.length) {
                    $grid.append('<div class="text-color-gray">Tidak ada pilihan warna.</div>');
                    fullColourPopup.open();
                    return;
                }

                // render item: teks + badge warna
                const html = list.map(v => {
                    const hex = v.produk_grup_fullcolor;     // contoh: "#FF0000"
                    const name = v.nama_fullcolor;            // contoh: "Merah Ferrari"
                    return `
				<button type="button" class="swatch-item" data-hex="${hex}" data-name="${escapeHtml(name)}">
					<span class="swatch-chip" style="background:${hex}"></span>
					<span class="swatch-name">${escapeHtml(name)}</span>
				</button>`;
                }).join('');

                $grid.append(html);
                fullColourPopup.open();
            },
            error: function () {
                $grid.empty().append('<div class="text-color-red">Gagal memuat warna.</div>');
                fullColourPopup.open();
            }
        });
    }
}

/** handler pilih warna (delegation) */
jQuery(document).off('click', '.swatch-item').on('click', '.swatch-item', function () {
    const hex = jQuery(this).data('hex');
    const name = jQuery(this).data('name');
    const idx = currentHCCount || 1;

    // simpan ke hidden input
    jQuery('#selected_color_' + idx).val(name).trigger('change');
    jQuery('#selected_hex_color_' + idx).val(hex).trigger('change');

    // Tentukan warna text berdasarkan brightness background
    const textColor = getContrastColor(hex);

    // tampilkan nama warna di dalam button dengan background warna dan fixed width
    const $colorButton = jQuery('#color_button_' + idx);
    $colorButton.text(name)
        .css({
            'background-color': hex,
            'color': textColor,
            'width': '120px'
        })
        .show();

    // tutup popup
    jQuery("#close-katalog-popup").click();
});

/** util: escape HTML sederhana */
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function selectBoxTS(count) {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-ts",
        dataType: "JSON",
        data: {
        },
        beforeSend: function () {
            // $$('#ukuran_hc_' + count).html('');
        },
        success: function (data) {
            var select_box_ts = '';
            jQuery.each(data.data, function (i, val) {
                select_box_ts += '<li>';
                select_box_ts += '<label class="item-radio item-content">';
                select_box_ts += '  <input type="radio" class="item-ukuran-radio" onclick="fillUkuranTsInput(\'' + val.nama_produk_ts + '\',\'' + count + '\');" name="ukuran_radio_' + count + '" id="ukuran_radio_' + count + '"/>';
                select_box_ts += '  <i class="icon icon-radio"></i>';
                select_box_ts += '  <div class="item-inner">';
                select_box_ts += '		<div class="item-title">' + val.nama_produk_ts + '</div>';
                select_box_ts += '  </div>';
                select_box_ts += '</label>';
                select_box_ts += '</li>';
            });
            $$('#katalog_ts_data').html(select_box_ts);
        }
    });
}

function fillUkuranTsInput(ukuran_ts, count) {
    console.log('fillUkuranTsInput called - ukuran_ts:', ukuran_ts, 'count:', count);

    // Ambil data produk TS untuk mendapatkan ID
    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-produk-ts",
        success: function (data) {
            console.log('fillUkuranTsInput - API response:', data);

            var selected = data.data.find(item => item.nama_produk_ts === ukuran_ts);
            console.log('fillUkuranTsInput - selected product:', selected);

            if (selected) {
                // Simpan NAMA di field ukuran_ts (visible untuk user)
                $$('#ukuran_ts_' + count).val(selected.nama_produk_ts);
                console.log('fillUkuranTsInput - Set ukuran_ts_' + count + ' to:', selected.nama_produk_ts);

                // Simpan ID di field hidden (untuk API)
                $$('#id_produk_ts_' + count).val(selected.id_produk_ts);
                console.log('fillUkuranTsInput - Set id_produk_ts_' + count + ' to:', selected.id_produk_ts);

                // Tutup popup
                $("#close-katalog-ts-popup").click();

                // Load material berdasarkan id_produk_ts
                selectBoxMaterialTs(selected.id_produk_ts, count);

                // Set price field menjadi editable untuk produk TAS (berlaku untuk semua count)
                var priceField = document.getElementById("price_" + count);
                if (priceField) {
                    priceField.readOnly = false;
                    priceField.removeAttribute('data-is-koper');
                }

                // Trigger perubahan untuk update form display
                if (count === 1) {
                    // Set jenis_1 value jika belum ada (dari dropdown)
                    if (!$$('#jenis_1').val() || $$('#jenis_1').val() === '') {
                        $$('#jenis_1').val('TAS'); // Default untuk TS/Polo
                    }

                    // Update display form - sama seperti ketika user ketik "TAS"
                    $$('#gambar_proforma_input_1').show();
                    $$('#color_proforma_input_1').hide();
                    $$('#el_ukuran_ts_1').show(); // SHOW ukuran_ts field
                    $$('#type_proforma_input_1').hide(); // HIDE type field
                    $$('#el_ukuran_ts_1').removeClass('col-100');
                    $$('#el_ukuran_ts_1').addClass('col-80');
                    $$('#el_ukuran_hc_1').hide();
                    $$('#el_material_hc_1').show();
                    $$('#material_1').prop('required', true);
                    $$('#material_1').prop('validate', true);
                    $$('#file_1').prop('required', true);
                    $$('#file_1').prop('validate', true);

                    // ========================================
                    // FIX: Remove required dari field yang di-hide untuk TAS
                    // ========================================
                    // Field Ukuran Koper tidak digunakan untuk TAS
                    $$('#ukuran_hc_1').prop('required', false);
                    $$('#ukuran_hc_1').prop('validate', false);

                    // Field Style HC tidak digunakan untuk TAS
                    $$('#style_hc_1').prop('required', false);
                    $$('#style_hc_1').prop('validate', false);

                    console.log('fillUkuranTsInput - Disabled validation for hidden HC fields (count 1)');
                } else {
                    // ========================================
                    // FIX: Show upload file untuk Proforma #2, #3, dst
                    // ========================================
                    console.log('fillUkuranTsInput - Showing upload file for Proforma #' + count);
                    $$('#gambar_proforma_input_' + count).css('display', 'initial');
                    $$('#color_proforma_input_' + count).hide();
                    $$('#el_ukuran_ts_' + count).show();
                    $$('#type_proforma_input_' + count).hide();
                    $$('#el_ukuran_ts_' + count).removeClass('col-100');
                    $$('#el_ukuran_ts_' + count).addClass('col-80');
                    $$('#el_ukuran_hc_' + count).hide();
                    $$('#el_material_hc_' + count).show();

                    // Set required untuk field yang digunakan TAS
                    $$('#material_' + count).prop('required', true);
                    $$('#material_' + count).prop('validate', true);
                    $$('#file_' + count).prop('required', true);
                    $$('#file_' + count).prop('validate', true);

                    // ========================================
                    // FIX: Remove required dari field yang di-hide untuk TAS
                    // ========================================
                    // Field Type (jenis) tidak digunakan untuk TAS
                    $$('#jenis_' + count).prop('required', false);
                    $$('#jenis_' + count).prop('validate', false);

                    // Field Ukuran Koper tidak digunakan untuk TAS
                    $$('#ukuran_hc_' + count).prop('required', false);
                    $$('#ukuran_hc_' + count).prop('validate', false);

                    // Field Style HC tidak digunakan untuk TAS
                    $$('#style_hc_' + count).prop('required', false);
                    $$('#style_hc_' + count).prop('validate', false);

                    console.log('fillUkuranTsInput - Disabled validation for hidden HC fields');
                }

                // Panggil fillHargaTs untuk mengisi harga
                console.log('fillUkuranTsInput - Calling fillHargaTs');
                fillHargaTs(count);
            } else {
                console.error('fillUkuranTsInput - Product not found for:', ukuran_ts);
            }
        },
        error: function (xhr, status, error) {
            console.error('fillUkuranTsInput - API error:', error);
        }
    });
}


function callbackHarga(count) {
    fillHargaProduk(count);
    fillHargaVariasiProduk(count);
}


function fillHargaTs(count) {
    if ($('#extra_detail_' + count).val() != 1) {
        var xtra = 1;
        var message = 'Xtra';
    } else {
        var xtra = 0;
        var message = 'Grosir';
    }

    // Ambil id_produk_ts dari field hidden
    var id_produk_ts = $$('#id_produk_ts_' + count).val();

    console.log('fillHargaTs - count:', count);
    console.log('fillHargaTs - id_produk_ts from hidden field:', id_produk_ts);
    console.log('fillHargaTs - ukuran_ts value:', $$('#ukuran_ts_' + count).val());

    // Jika tidak ada id_produk_ts di field hidden, gunakan value dari ukuran_ts (backward compatibility)
    if (!id_produk_ts || id_produk_ts === '') {
        id_produk_ts = $$('#ukuran_ts_' + count).val();
        console.log('fillHargaTs - using ukuran_ts fallback:', id_produk_ts);
    }

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-ts-harga",
        dataType: "JSON",
        data: {
            id_produk_ts: id_produk_ts,
        },
        beforeSend: function () {
            // $$('#ukuran_hc_' + count).html('');
        },
        success: function (data) {
            console.log('fillHargaTs - API response:', data);

            // Null check untuk data.data
            if (!data || !data.data) {
                console.error('fillHargaTs - No data returned from API');
                app.dialog.alert('Harga tidak ditemukan untuk produk ini');
                $$('#price_' + count).val(0);
                return;
            }

            if (xtra == 1) {
                // if (data.data.harga_xtra != 0) {
                $$('#harga_satuan_' + count).val(data.data.harga_xtra);
                // } else {
                // 	app.dialog.alert('Harga ' + message + ' tidak ada di tipe ini');
                // 	$$('#harga_satuan_' + count).val(0);
                // }
            } else {
                // if (data.data.harga_grosir != 0) {
                $$('#harga_satuan_' + count).val(data.data.harga_grosir);
                // } else {
                // 	app.dialog.alert('Harga ' + message + ' tidak ada di tipe ini');
                // 	$$('#harga_satuan_' + count).val(0);
                // }
            }

            $$('#price_' + count).val(number_format($$('#harga_satuan_' + count).val()));
            changeTotalValue(count);
        },
        error: function (xhr, status, error) {
            console.error('fillHargaTs - API error:', error);
            app.dialog.alert('Gagal mengambil harga produk');
        }
    });
}


function fillHargaProduk(count) {
    var tipe = jQuery('#jenis_' + count).val();
    var productInfo = detectProductType(tipe);

    if (productInfo.isCustom) {
        var produk_id = getCustomSimilarityCode(productInfo.type);
    } else {
        var produk_id = tipe; // Kirim full, bukan substr(-3)
    }

    if ($('#extra_detail_' + count).val() != 1) {
        var xtra = 1;
        var message = 'Xtra';
    } else {
        var xtra = 0;
        var message = 'Grosir';
    }
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-harga",
        dataType: "JSON",
        data: {
            produk_id: produk_id,
            nama_ukuran: $$('#ukuran_hc_' + count).val(),
        },
        beforeSend: function () {
            // $$('#ukuran_hc_' + count).html('');
        },
        success: function (data) {
            var price = 0;
            if ($$('#ukuran_hc_' + count).val() != '' && $$('#ukuran_hc_' + count).val() != 'none') {
                if (xtra == 1) {
                    if (data.data.harga_ukuran != 0) {
                        $$('#harga_satuan_' + count).val(data.data.harga_ukuran);

                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);
                        // Delay untuk memastikan id_ukuran_hc sudah di-set oleh event change
                        console.log('Scheduling getPotonganKoper in 150ms...');
                        setTimeout(function () {
                            console.log('Now calling getPotonganKoper for count:', count);
                            getPotonganKoper(count);
                        }, 150);
                    } else {
                        // FIX: Jika harga ukuran tidak ada, unlock field harga agar user bisa input manual
                        // Khususnya untuk HCC yang tidak punya harga dari database
                        console.log('⚠️ Harga Ukuran ' + message + ' tidak ada - unlocking price field for manual input');
                        $$('#harga_satuan_' + count).val(0);
                        $$('#price_' + count).val('');
                        $$('#total_' + count).val('');

                        // Unlock price field jika custom koper (HCC)
                        if (productInfo.isCustom) {
                            var priceField = document.getElementById('price_' + count);
                            if (priceField) {
                                priceField.readOnly = false;
                                priceField.removeAttribute('data-is-koper');
                                console.log('✅ Price field unlocked for manual input (custom koper with no price)');
                            }
                        } else {
                            selectBoxUkuran(tipe, count);
                        }
                    }
                } else {
                    if (data.data.harga_ukuran_grosir != 0) {
                        $$('#harga_satuan_' + count).val(data.data.harga_ukuran_grosir);

                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);
                        // Delay untuk memastikan id_ukuran_hc sudah di-set oleh event change
                        console.log('Scheduling getPotonganKoper in 150ms...');
                        setTimeout(function () {
                            console.log('Now calling getPotonganKoper for count:', count);
                            getPotonganKoper(count);
                        }, 150);
                    } else {
                        // FIX: Jika harga ukuran tidak ada, unlock field harga agar user bisa input manual
                        // Khususnya untuk HCC yang tidak punya harga dari database
                        console.log('⚠️ Harga Ukuran ' + message + ' tidak ada - unlocking price field for manual input');
                        $$('#harga_satuan_' + count).val(0);
                        $$('#price_' + count).val('');
                        $$('#total_' + count).val('');

                        // Unlock price field jika custom koper (HCC)
                        if (productInfo.isCustom) {
                            var priceField = document.getElementById('price_' + count);
                            if (priceField) {
                                priceField.readOnly = false;
                                priceField.removeAttribute('data-is-koper');
                                console.log('✅ Price field unlocked for manual input (custom koper with no price)');
                            }
                        } else {
                            selectBoxUkuran(tipe, count);
                        }
                    }
                }
            } else {
                $$('#harga_satuan_' + count).val(0);
                $$('#price_' + count).val('');
                $$('#total_' + count).val('');
                selectBoxUkuran(tipe, count);
            }

        }
    });
}


function fillHargaVariasiProduk(count) {
    var tipe = jQuery('#jenis_' + count).val();
    var productInfo = detectProductType(tipe);

    if (productInfo.isCustom) {
        var produk_id = getCustomSimilarityCode(productInfo.type);
    } else {
        var produk_id = tipe; // Kirim full, bukan substr(-3)
    }

    if ($('#extra_detail_' + count).val() != 1) {
        var xtra = 1;
        var message = 'Xtra';
    } else {
        var xtra = 0;
        var message = 'Grosir';
    }

    console.log($$('#style_hc_' + count).val().length);
    var price = 0;
    if ($$('#style_hc_' + count).val().length != 0) {
        jQuery.ajax({
            type: "POST",
            url: "" + BASE_API + "/get-produk-style-harga",
            dataType: "JSON",
            data: {
                produk_id: produk_id,
                nama_variasi: $$('#style_hc_' + count).val(),
                xtra: xtra,
            },
            beforeSend: function () {
            },
            success: function (data) {

                var ukuran = $$('#ukuran_hc_' + count).val();
                if (data.data != 0) {
                    if (ukuran.indexOf("+") != -1) {
                        $$('#harga_style_' + count).val(parseFloat(data.data) * 2);
                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);
                    } else {
                        $$('#harga_style_' + count).val(data.data);
                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);
                    }

                    // ========================================
                    // FIX: Recalculate potongan setelah style berubah
                    // Karena price sudah berubah (include harga_style),
                    // potongan harus dihitung ulang agar net harga benar.
                    // Contoh: HC-107 base 240k + Full Colour 25k = 265k
                    // Potongan 5k → net harga = 260k (bukan 235k)
                    // ========================================
                    var tipeForPotongan = jQuery('#jenis_' + count).val();
                    if (tipeForPotongan && tipeForPotongan.indexOf("HC") != -1) {
                        console.log('🔄 Style changed, recalculating potongan for count:', count);
                        setTimeout(function () {
                            getPotonganKoper(count);
                        }, 150);
                    }
                } else {
                    // FIX: Jika harga style tidak ada, unlock field harga untuk custom koper
                    $$('#harga_style_' + count).val(0);

                    // Hitung price dari komponen lain
                    price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());

                    // Jika total price masih 0 atau kosong untuk custom koper, unlock field
                    if (productInfo.isCustom && (price === 0 || isNaN(price))) {
                        var priceField = document.getElementById('price_' + count);
                        if (priceField) {
                            priceField.readOnly = false;
                            priceField.removeAttribute('data-is-koper');
                            console.log('✅ Price field unlocked (style harga tidak ada untuk custom koper)');
                        }
                    }

                    console.log('⚠️ Harga Style ' + message + ' tidak ada di tipe ini');

                    // ========================================
                    // FIX: Recalculate potongan setelah style harga = 0
                    // Agar net harga kembali ke base price - potongan
                    // ========================================
                    var tipeForPotongan2 = jQuery('#jenis_' + count).val();
                    if (tipeForPotongan2 && tipeForPotongan2.indexOf("HC") != -1) {
                        console.log('🔄 Style harga = 0, recalculating potongan for count:', count);
                        setTimeout(function () {
                            getPotonganKoper(count);
                        }, 150);
                    }
                }
            }
        });
    } else {
        setTimeout(function () {
            $$("#style_hc_input_" + count).html('Pilih Style');
            $$('#harga_style_' + count).val(0);
            price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
            console.log(price);
            if (price != 0) {
                $$('#price_' + count).val(number_format(price));
            } else {
                $$('#price_' + count).val('');

                // FIX: Unlock price field untuk custom koper jika price masih 0
                if (productInfo.isCustom) {
                    var priceField = document.getElementById('price_' + count);
                    if (priceField) {
                        priceField.readOnly = false;
                        priceField.removeAttribute('data-is-koper');
                        console.log('✅ Price field unlocked (no style, price is 0 for custom koper)');
                    }
                }
            }
            changeTotalValue(count);

            // ========================================
            // FIX: Recalculate potongan setelah style di-reset
            // Agar net harga kembali ke base price - potongan
            // ========================================
            var tipeForPotongan = jQuery('#jenis_' + count).val();
            if (tipeForPotongan && tipeForPotongan.indexOf("HC") != -1) {
                console.log('🔄 Style removed, recalculating potongan for count:', count);
                setTimeout(function () {
                    getPotonganKoper(count);
                }, 150);
            }
        }, 500);
    }
}



function fillHargaMaterialProduk(count) {
    var tipe = jQuery('#jenis_' + count).val();
    var productInfo = detectProductType(tipe);

    if (productInfo.isCustom) {
        var produk_id = getCustomSimilarityCode(productInfo.type);
    } else {
        var produk_id = tipe; // Kirim full, bukan substr(-3)
    }

    if ($('#extra_detail_' + count).val() != 1) {
        var xtra = 1;
        var message = 'Xtra';
    } else {
        var xtra = 0;
        var message = 'Grosir';
    }

    var price = 0;
    if ($$('#material_' + count).val() != '') {
        jQuery.ajax({
            type: "POST",
            url: "" + BASE_API + "/get-produk-material-harga",
            dataType: "JSON",
            data: {
                produk_id: produk_id,
                nama_material: $$('#material_' + count).val(),
                xtra: xtra,
            },
            beforeSend: function () {
            },
            success: function (data) {

                var ukuran = $$('#ukuran_hc_' + count).val();
                if (data.data != 0) {
                    if (ukuran.indexOf("+") != -1) {
                        $$('#harga_material_' + count).val(parseFloat(data.data) * 2);
                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val()) + parseFloat($$('#harga_material_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);
                    } else {
                        $$('#harga_material_' + count).val(data.data);
                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val()) + parseFloat($$('#harga_material_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);
                    }
                } else {
                    // FIX: Jika harga material tidak ada, cek apakah perlu unlock field
                    $$('#harga_material_' + count).val(0);

                    // Hitung total price dari komponen lain
                    price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val()) + parseFloat($$('#harga_material_' + count).val());

                    // Jika total price masih 0 atau kosong untuk custom koper, unlock field
                    if (productInfo.isCustom && (price === 0 || isNaN(price))) {
                        var priceField = document.getElementById('price_' + count);
                        if (priceField) {
                            priceField.readOnly = false;
                            priceField.removeAttribute('data-is-koper');
                            console.log('✅ Price field unlocked (material harga tidak ada untuk custom koper)');
                        }
                    }
                    // app.dialog.alert('Harga Material ' + message + ' tidak ada di tipe ini');
                }
            }
        });
    } else {
        setTimeout(function () {
            $$('#harga_material_' + count).val(0);
            price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val()) + parseFloat($$('#harga_material_' + count).val());
            console.log(price);
            if (price != 0) {
                $$('#price_' + count).val(number_format(price));
            } else {
                $$('#price_' + count).val('');

                // FIX: Unlock price field untuk custom koper jika price masih 0
                if (productInfo.isCustom) {
                    var priceField = document.getElementById('price_' + count);
                    if (priceField) {
                        priceField.readOnly = false;
                        priceField.removeAttribute('data-is-koper');
                        console.log('✅ Price field unlocked (no material, price is 0 for custom koper)');
                    }
                }
            }
            changeTotalValue(count);
        }, 500);
    }
}

function sumElementsByClass(className) {
    // if ($('#extra').val() != 1) {
    // 	var checkbox_true = false;
    // } else {
    // 	var checkbox_true = true;
    // }
    const elements = document.getElementsByClassName(className);
    // $$('#price_' + performa_id_table + '').val().replace(/\,/g, '')
    let sum = 0;
    for (let i = 0; i < elements.length; i++) {
        const elementValue = parseFloat(elements[i].value) || parseFloat(elements[i].textContent) || 0;
        sum += elementValue;
    }
    // if (sum > 0) {
    // 	app.dialog.confirm('Total Sudah terisi, Harap tidak mengganti Xtra/Grosir', function () {
    // 		$('#extra').prop('checked', checkbox_true);
    // 	});
    // }
}

function checkAllPolo() {

    if ($('#extra').prop('checked') == true) {
        console.log('✅ POLO checkbox checked');
        localStorage.setItem("polo_check", 1);
        $('.input-item-extra').val(1);
        console.log('Updated all Koper items to POLO (1)');
    } else {
        console.log('✅ POLO checkbox unchecked (XTRA active)');
        localStorage.setItem("polo_check", 0);
        $('.input-item-extra').val(0);
        console.log('Updated all Koper items to XTRA (0)');
    }


    var length = $$('.performa_group_field_count').length;
    for (let i = 1; i <= length; i++) {
        var tipe = $$('#jenis_' + i).val();
        if (tipe.indexOf("HC") != -1) {
            callbackHarga(i);
        }
    }
}

/**
 * Handle toggle between XTRA and POLO checkboxes (mutual exclusive)
 * XTRA checked (default) → extra_detail = 0
 * POLO checked → extra_detail = 1
 * 
 * PERBAIKAN: Hanya update proforma yang BELUM DIISI (price kosong)
 */
function handleXtraPoloToggle(type) {
    if (type === 'xtra') {
        // Jika XTRA di-check, uncheck POLO
        if ($('#xtra').prop('checked')) {
            $('#extra').prop('checked', false);
            console.log('XTRA selected');
            localStorage.setItem("polo_check", 0);

            // PERBAIKAN: Hanya update proforma yang BELUM DIISI
            updateEmptyProformaExtraDetail(0);
            console.log('✅ Updated empty Koper items to XTRA');
        } else {
            // Jika XTRA di-uncheck, otomatis check POLO
            $('#extra').prop('checked', true);
            console.log('POLO auto-selected (XTRA unchecked)');
            localStorage.setItem("polo_check", 1);

            // PERBAIKAN: Hanya update proforma yang BELUM DIISI
            updateEmptyProformaExtraDetail(1);
            console.log('✅ Updated empty Koper items to POLO');
        }
    } else if (type === 'polo') {
        // Jika POLO di-check, uncheck XTRA
        if ($('#extra').prop('checked')) {
            $('#xtra').prop('checked', false);
            console.log('POLO selected');
            localStorage.setItem("polo_check", 1);

            // PERBAIKAN: Hanya update proforma yang BELUM DIISI
            updateEmptyProformaExtraDetail(1);
            console.log('✅ Updated empty Koper items to POLO');
        } else {
            // Jika POLO di-uncheck, otomatis check XTRA
            $('#xtra').prop('checked', true);
            console.log('XTRA auto-selected (POLO unchecked)');
            localStorage.setItem("polo_check", 0);

            // PERBAIKAN: Hanya update proforma yang BELUM DIISI
            updateEmptyProformaExtraDetail(0);
            console.log('✅ Updated empty Koper items to XTRA');
        }
    }

    // Recalculate harga HANYA untuk item yang BELUM DIISI
    sumElementsByClass('grand-total-value');
    var length = $$('.performa_group_field_count').length;
    for (let i = 1; i <= length; i++) {
        var tipe = $$('#jenis_' + i).val();
        var price = $$('#price_' + i).val();

        // Hanya recalculate jika KOPER dan price KOSONG (belum diisi)
        if (tipe && tipe.indexOf("HC") != -1 && (!price || price === '' || price === '0')) {
            callbackHarga(i);
        }
    }
}

/**
 * Update extra_detail hanya untuk proforma yang BELUM DIISI
 * Proforma dianggap "sudah diisi" jika field price sudah ada nilainya
 * 
 * @param {number} value - 0 untuk Xtra, 1 untuk Polo
 */
function updateEmptyProformaExtraDetail(value) {
    var length = $$('.performa_group_field_count').length;

    for (let i = 1; i <= length; i++) {
        var price = $$('#price_' + i).val();
        var tipe = $$('#jenis_' + i).val();

        // Cek apakah proforma sudah diisi (price ada nilainya)
        var isAlreadyFilled = price && price !== '' && price !== '0';

        if (!isAlreadyFilled) {
            // Proforma BELUM diisi, update extra_detail
            $$('#extra_detail_' + i).val(value);
            console.log('✅ Updated extra_detail_' + i + ' to ' + (value === 0 ? 'XTRA' : 'POLO'));
        } else {
            // Proforma SUDAH diisi, JANGAN ubah
            console.log('⚠️ Skipped extra_detail_' + i + ' (already filled with price: ' + price + ')');
        }
    }
}

var originalPerformaProcess = null;

function initEditModeProcessHandler() {
    // Jika belum di-wrap
    if (!originalPerformaProcess && typeof performaProcess === 'function') {
        originalPerformaProcess = performaProcess;

        // Override performaProcess
        window.performaProcess = function () {
            if (isEditMode && editPerformaHeaderId) {
                updatePerformaProcess();
            } else {
                originalPerformaProcess();
            }
        };

        console.log('✅ performaProcess wrapped for edit mode');
    }
}

function debugFormValidity() {
    var form = document.getElementById('performa_form');
    if (!form) {
        console.error('❌ Form not found!');
        return;
    }

    var invalidFields = [];
    var allInputs = form.querySelectorAll('input, select, textarea');

    console.log('🔍 ========== DEBUG FORM VALIDITY ==========');
    console.log('Total fields to check:', allInputs.length);

    allInputs.forEach(function (input) {
        // Cek apakah field required
        var isRequired = input.hasAttribute('required');
        var isValid = input.validity.valid;
        var isHidden = isElementHidden(input);
        var value = input.value;

        if (isRequired && !isValid) {
            var fieldInfo = {
                id: input.id || 'NO_ID',
                name: input.name || 'NO_NAME',
                type: input.type,
                value: value,
                isHidden: isHidden,
                validityState: {
                    valueMissing: input.validity.valueMissing,
                    typeMismatch: input.validity.typeMismatch,
                    patternMismatch: input.validity.patternMismatch,
                    tooLong: input.validity.tooLong,
                    tooShort: input.validity.tooShort,
                    rangeUnderflow: input.validity.rangeUnderflow,
                    rangeOverflow: input.validity.rangeOverflow,
                    stepMismatch: input.validity.stepMismatch,
                    badInput: input.validity.badInput,
                    customError: input.validity.customError
                }
            };

            invalidFields.push(fieldInfo);

            console.log('❌ INVALID FIELD:', {
                id: fieldInfo.id,
                name: fieldInfo.name,
                type: fieldInfo.type,
                value: value || '(EMPTY)',
                hidden: isHidden,
                reason: input.validity.valueMissing ? 'VALUE MISSING' : 'OTHER'
            });
        }
    });

    console.log('🔍 ========== END DEBUG ==========');
    console.log('Total invalid fields:', invalidFields.length);
    console.log('Invalid fields detail:', invalidFields);

    return invalidFields;
}

/**
 * Cek apakah element hidden (display:none atau parent hidden)
 */
function isElementHidden(element) {
    if (!element) return true;

    // Cek element sendiri
    var style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
        return true;
    }

    // Cek parent elements
    var parent = element.parentElement;
    while (parent && parent !== document.body) {
        var parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * Process update performa (untuk edit mode)
 */
function updatePerformaProcess() {
    const length = $$('.performa_group_field_count').length;
    var has_needs_approval = hasNeedsApproval();

    // ========================================
    // FIX: Validasi menggunakan container DOM, bukan ID selector
    // Karena setelah delete+reindex, $$('#total_1').val() bisa return empty
    // meskipun value terlihat di UI
    // ========================================
    var containers = document.querySelectorAll('.performa_group_field_count');
    for (var idx = 0; idx < containers.length; idx++) {
        var container = containers[idx];
        var totalEl = container.querySelector('.input-item-total');
        var priceEl = container.querySelector('.input-item-price');
        var qtyEl = container.querySelector('.input-item-qty');
        var itemNum = idx + 1;

        var totalVal = totalEl ? totalEl.value : '';

        // Jika total kosong, coba recalculate dari price * qty
        if (!totalVal || totalVal === '' || totalVal === '0') {
            console.log('⚠️ total_' + itemNum + ' kosong via container, mencoba recalculate...');
            var price = priceEl ? parseFloat((priceEl.value || '0').replace(/,/g, '')) : 0;
            var qty = qtyEl ? parseFloat((qtyEl.value || '0').replace(/,/g, '')) : 0;
            var recalcTotal = price * qty;

            console.log('  📊 Recalc: price=' + price + ' × qty=' + qty + ' = ' + recalcTotal);

            if (recalcTotal > 0 && totalEl) {
                totalEl.value = number_format(recalcTotal);
                totalVal = totalEl.value;
                console.log('  ✅ Total auto-fixed ke: ' + totalVal);
            }
        }

        // Final check
        if (!totalVal || totalVal === '' || totalVal === '0') {
            console.log('❌ total_' + itemNum + ' masih kosong setelah recalculate');
            app.dialog.alert('Cek Isian Performa Anda');
            return;
        }
    }

    // Validasi ongkir
    var statusOngkir = $$('input[name="status_ongkir"]:checked').val();
    if (statusOngkir === 'nominal') {
        if ($$('#biaya_kirim').val() === '' || $$('#biaya_kirim').val() === '0') {
            app.dialog.alert('Silakan masukkan nominal biaya kirim atau pilih opsi lain.');
            return;
        }
    }

    // ========================================
    // FIX VALIDASI EDIT MODE
    // ========================================

    // FIX 1: Remove .perusahaan_tambah section
    // Section ini untuk "Tambah Client Baru" - tidak diperlukan di edit mode
    // karena di edit mode pasti sudah pilih client dari database
    // Field kota, posisi, dll di section ini punya required tapi hidden
    var statusPerusahaan = $$('#status_perusahaan').val();
    if (statusPerusahaan === 'perusahaan_database') {
        $$('.perusahaan_tambah').remove();
        console.log('🔧 FIX: Removed .perusahaan_tambah section (using existing client)');
    }

    // FIX 2: Remove required dari customer_logo di edit mode
    // Karena file sudah ada di server, tidak perlu upload ulang
    // Input type="file" tidak bisa di-set value secara programatis
    var customerLogo = document.getElementById('customer_logo');
    if (customerLogo && customerLogo.hasAttribute('required')) {
        customerLogo.removeAttribute('required');
        console.log('🔧 FIX: Removed required from customer_logo (file exists on server)');
    }

    // FIX 3: Pastikan keterangan_full yang hidden tetap punya value
    for (let i = 1; i <= length; i++) {
        var keteranganEl = document.getElementById('keterangan_full_' + i);
        var keteranganWrapper = document.getElementById('el_keterangan_full_' + i);
        if (keteranganEl && keteranganWrapper) {
            var isHidden = window.getComputedStyle(keteranganWrapper).display === 'none';
            if (isHidden && (!keteranganEl.value || keteranganEl.value.trim() === '')) {
                keteranganEl.value = '-'; // Set dummy value untuk pass validasi
                console.log('🔧 FIX: Set dummy value for hidden keterangan_full_' + i);
            }
        }
    }

    // Form validity check
    if (!$$('#performa_form')[0].checkValidity()) {
        app.dialog.alert('Cek Isian Performa Anda - Ada field yang belum diisi');
        return;
    }

    var bank_performa = $$('#bank_performa').val();
    if (bank_performa == '' || bank_performa == null) {
        app.dialog.alert('Silakan pilih bank untuk proforma ini.');
        return;
    }

    // Cek internet
    if (localStorage.getItem("internet_koneksi") === 'fail') {
        app.dialog.alert('Gagal, Internet Tidak Stabil');
        return;
    }

    // Siapkan FormData
    // FIX: Gunakan buildCleanFormData() agar index SELALU benar setelah delete
    console.log('🚀 Building clean FormData for UPDATE...');
    const formData = buildCleanFormData();

    // Append edit-specific fields (override jika sudah ada)
    formData.set('performa_header_id', editPerformaHeaderId);
    formData.set('bank_id', bank_performa);

    // Lock tombol
    $("#performa_input_button_save").attr('disabled', 'true');
    $("#performa_input_button_save span").text('Mengupdate...');

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/update-performa",
        dataType: "JSON",
        data: formData,
        contentType: false,
        processData: false,
        xhr: function () {
            const dialog = app.dialog.progress('Updating...', 0);
            dialog.setText('0%');
            const xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    const pct = Math.round((evt.loaded / evt.total) * 100);
                    dialog.setProgress(pct);
                    dialog.setText(pct + '%');
                }
            }, false);
            return xhr;
        },
        success: function (data) {
            // Unlock tombol
            $("#performa_input_button_save").removeAttr('disabled');
            $("#performa_input_button_save span").text('Update');
            app.dialog.close();

            if (data.status === 'done') {
                app.dialog.alert('Proforma berhasil diupdate!', 'Sukses', function () {
                    // Reset edit mode
                    isEditMode = false;
                    editPerformaHeaderId = null;
                    editPerformaData = null;

                    // Redirect ke halaman penjualan
                    app.views.main.router.navigate('/sales');
                });
            } else {
                app.dialog.alert('Gagal update proforma: ' + (data.message || 'Unknown error'));
            }
        },
        error: function (xhr, status, error) {
            $("#performa_input_button_save").removeAttr('disabled');
            $("#performa_input_button_save span").text('Update');
            app.dialog.close();
            app.dialog.alert('Terjadi kesalahan: ' + error);
        }
    });
}

function performaProcess() {
    // Check if restore is in progress
    if (isRestoringAfterDelete) {
        app.dialog.alert('Mohon tunggu, sedang memproses data...');
        console.log('⚠️ Submit blocked - restore in progress');
        return;
    }

    const length = $$('.performa_group_field_count').length;
    var has_needs_approval = hasNeedsApproval();

    // ========================================
    // FIX: Validasi menggunakan container DOM, bukan ID selector
    // ========================================
    var containers = document.querySelectorAll('.performa_group_field_count');
    for (var idx = 0; idx < containers.length; idx++) {
        var container = containers[idx];
        var totalEl = container.querySelector('.input-item-total');
        var priceEl = container.querySelector('.input-item-price');
        var qtyEl = container.querySelector('.input-item-qty');
        var itemNum = idx + 1;

        var totalVal = totalEl ? totalEl.value : '';

        // Jika total kosong, coba recalculate dari price * qty
        if (!totalVal || totalVal === '' || totalVal === '0') {
            console.log('⚠️ total_' + itemNum + ' kosong via container, mencoba recalculate...');
            var price = priceEl ? parseFloat((priceEl.value || '0').replace(/,/g, '')) : 0;
            var qty = qtyEl ? parseFloat((qtyEl.value || '0').replace(/,/g, '')) : 0;
            var recalcTotal = price * qty;

            console.log('  📊 Recalc: price=' + price + ' × qty=' + qty + ' = ' + recalcTotal);

            if (recalcTotal > 0 && totalEl) {
                totalEl.value = number_format(recalcTotal);
                totalVal = totalEl.value;
                console.log('  ✅ Total auto-fixed ke: ' + totalVal);
            }
        }

        // Final check
        if (!totalVal || totalVal === '' || totalVal === '0') {
            console.log('❌ total_' + itemNum + ' masih kosong setelah recalculate');
            app.dialog.alert('Cek Isian Performa Anda');
            return;
        }
    }

    const statusPerusahaan = $$('#status_perusahaan').val();

    // ========================================
    // FIX CELAH #3 + #18: Gunakan .hide() bukan .remove()
    // DAN hapus required attribute dari field yang di-hide
    // Supaya HTML5 validation tidak cek field hidden
    // ========================================
    if (statusPerusahaan === 'perusahaan_database') {
        $$('.perusahaan_tambah').hide();
        // Remove required dari semua field perusahaan_tambah
        $$('.perusahaan_tambah input, .perusahaan_tambah select, .perusahaan_tambah textarea').each(function () {
            $$(this).prop('required', false);
            $$(this).removeAttr('validate');
        });
        // Juga hapus required dari field kota dan posisi secara eksplisit
        $$('#kota').prop('required', false).removeAttr('validate');
        $$('#posisi').prop('required', false).removeAttr('validate');
        $$('#client_nama').prop('required', false).removeAttr('validate');
        $$('#alamat').prop('required', false).removeAttr('validate');
        $$('#person').prop('required', false).removeAttr('validate');
        $$('#telepon').prop('required', false).removeAttr('validate');
    } else if (statusPerusahaan === 'perusahaan_tambah') {
        $$('.perusahaan_database').hide();
        // Remove required dari client_id karena akan input manual
        $$('#client_id').prop('required', false).removeAttr('validate');
    }

    // perusahaan wajib dipilih
    // ========================================
    // FIX CELAH #17: Di edit mode, client sudah di-set dan disabled
    // Tapi .val() mungkin belum ready saat options belum loaded
    // Tambah pengecekan isEditMode
    // ========================================
    if (!isEditMode) {
        if (jQuery('#client_id').val() == '' || jQuery('#client_id').val() == null) {
            $$('#perusahaan_kosong_value').show();
        } else {
            $$('#perusahaan_kosong_value').hide();
        }
    } else {
        $$('#perusahaan_kosong_value').hide();
    }

    // ========================================
    // FIX CELAH #4: Di edit mode, customer_logo mungkin kosong (file input)
    // tapi gambar existing tetap ada → jangan tandai merah
    // ========================================
    if ($$('#customer_logo').val() !== "") {
        $$('#value_customer_logo').addClass('bg-dark-gray-young').css('background-color', '');
    } else {
        if (isEditMode && $$('#preview_customer_logo img').length > 0) {
            // Edit mode + ada preview image → logo sudah ada, jangan merah
            $$('#value_customer_logo').addClass('bg-dark-gray-young').css('background-color', '');
        } else {
            $$('#value_customer_logo').css("background-color", "#ff3b30").removeClass('bg-dark-gray-young');
        }
    }

    var statusOngkir = $$('input[name="status_ongkir"]:checked').val();

    if (statusOngkir === 'nominal') {
        // ========================================
        // FIX CELAH #11: Strip comma/formatting sebelum validasi
        // Di edit mode, biaya_kirim bisa terformat "1,500,000"
        // ========================================
        var biayaKirimRaw = ($$('#biaya_kirim').val() || '').replace(/\,/g, '');
        if (biayaKirimRaw === '' || biayaKirimRaw === '0' || parseFloat(biayaKirimRaw) <= 0) {
            app.dialog.alert('Silakan masukkan nominal biaya kirim atau pilih opsi lain.');
            return;
        }
    }

    // form HTML5 validity
    if (!$$('#performa_form')[0].checkValidity()) {
        console.log('form invalid');

        // ========================================
        // FIX: Find and highlight invalid field
        // ========================================
        var invalidFields = [];
        var firstInvalidField = null;

        // Cari semua field yang invalid
        $$('#performa_form')[0].querySelectorAll('input, select, textarea').forEach(function (field) {
            // ========================================
            // FIX CELAH #16: Skip field yang truly hidden
            // Tambah check parentElement display dan closest() hidden ancestor
            // Sebelumnya offsetParent check bisa miss beberapa kasus
            // ========================================
            var isHidden = false;
            var el = field;
            while (el && el !== document.body) {
                var style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    isHidden = true;
                    break;
                }
                el = el.parentElement;
            }

            if (!field.checkValidity() && !isHidden) {
                var fieldName = field.id || field.name || 'unknown';
                var label = '';

                // Tentukan label berdasarkan ID field
                if (fieldName.includes('jenis_')) {
                    label = 'Type Produk';
                } else if (fieldName.includes('ukuran_ts_')) {
                    label = 'Ukuran TAS';
                } else if (fieldName.includes('ukuran_hc_')) {
                    label = 'Ukuran Koper';
                } else if (fieldName.includes('material_')) {
                    label = 'Material';
                } else if (fieldName.includes('style_hc_')) {
                    label = 'Style';
                } else if (fieldName.includes('keterangan_full_')) {
                    label = 'Warna';
                } else if (fieldName.includes('keterangan_singkat_')) {
                    label = 'Keterangan';
                } else if (fieldName.includes('qty_')) {
                    label = 'Quantity';
                } else if (fieldName.includes('price_')) {
                    label = 'Harga';
                } else if (fieldName.includes('total_')) {
                    label = 'Total';
                } else if (fieldName.includes('file_')) {
                    label = 'Gambar/Upload';
                } else if (fieldName.includes('customer_logo')) {
                    label = 'Logo Perusahaan';
                } else {
                    label = fieldName;
                }

                // Cari nomor proforma dari field ID
                var proformaNum = fieldName.match(/_(\d+)$/);
                if (proformaNum) {
                    label = 'Proforma #' + proformaNum[1] + ' - ' + label;
                }

                invalidFields.push({
                    element: field,
                    label: label,
                    id: fieldName
                });

                // Simpan first invalid field untuk scroll
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }

                // Highlight field dengan border merah
                $$(field).css('border', '2px solid #ff3b30');

                console.log('Invalid field:', fieldName, 'Label:', label);
            }
        });

        // Scroll ke first invalid field
        if (firstInvalidField) {
            firstInvalidField.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Focus ke field (jika bisa)
            setTimeout(function () {
                try {
                    firstInvalidField.focus();
                } catch (e) {
                    // Ignore jika field readonly atau hidden
                }
            }, 500);
        }

        // Buat error message detail
        var errorMessage = '<div style="text-align:left;">';

        // ========================================
        // FIX CELAH #19: Handle edge case - form invalid tapi tidak ada visible invalid field
        // Ini bisa terjadi jika ada hidden field yang masih required
        // ========================================
        if (invalidFields.length === 0) {
            // Tidak ada visible invalid field, tapi form masih invalid
            // Kemungkinan ada hidden field yang required - force remove required
            console.log('⚠️ No visible invalid fields found, but form is invalid. Forcing validation pass...');

            // Force remove required dari semua hidden fields
            $$('#performa_form')[0].querySelectorAll('input, select, textarea').forEach(function (field) {
                var isHidden = false;
                var el = field;
                while (el && el !== document.body) {
                    var style = window.getComputedStyle(el);
                    if (style.display === 'none' || style.visibility === 'hidden') {
                        isHidden = true;
                        break;
                    }
                    el = el.parentElement;
                }

                if (isHidden && field.required) {
                    console.log('  Removing required from hidden field:', field.id || field.name);
                    field.required = false;
                    field.removeAttribute('validate');
                }
            });

            // Re-check validity setelah force remove
            if ($$('#performa_form')[0].checkValidity()) {
                console.log('✅ Form now valid after removing hidden required fields');
                // Jangan return, lanjutkan ke proses submit
            } else {
                // Masih invalid - tampilkan pesan generic
                errorMessage += '<strong>Mohon periksa kembali isian form Anda.</strong><br><br>';
                errorMessage += 'Beberapa field mungkin belum terisi dengan benar.';
                errorMessage += '</div>';
                app.dialog.alert(errorMessage, 'Cek Isian Performa Anda');
                return;
            }
        } else {
            // Ada visible invalid fields - tampilkan list
            errorMessage += '<strong>Field yang belum diisi:</strong><br><br>';
            invalidFields.forEach(function (field, index) {
                errorMessage += (index + 1) + '. ' + field.label + '<br>';
            });
            errorMessage += '</div>';

            app.dialog.alert(errorMessage, 'Cek Isian Performa Anda');

            // Remove highlight setelah 5 detik
            setTimeout(function () {
                invalidFields.forEach(function (field) {
                    $$(field.element).css('border', '');
                });
            }, 5000);

            return;
        }
    }

    // ========================================
    // VALIDASI XTRA/POLO untuk KOPER
    // ========================================
    var headerXtraChecked = $$('#xtra').prop('checked');
    var headerPoloChecked = $$('#extra').prop('checked');
    var headerValue = headerPoloChecked ? 1 : 0; // 0 = Xtra, 1 = Polo
    var headerLabel = headerPoloChecked ? 'POLO' : 'XTRA';

    console.log('🔍 Validating XTRA/POLO consistency...');
    console.log('Header checkbox:', headerLabel, '(value=' + headerValue + ')');

    // Hitung jumlah koper dan berapa yang match dengan header
    var totalKoper = 0;
    var matchingKoper = 0;
    var koperDetails = [];

    // Loop semua proforma items untuk check koper
    for (let i = 1; i <= length; i++) {
        var jenisValue = $$('#jenis_' + i).val();

        // ========================================
        // FIX CELAH #15: Cek SEMUA tipe koper, bukan hanya HC
        // PP dan PC juga punya XTRA/POLO
        // ========================================
        if (jenisValue && (jenisValue.indexOf("HC") != -1 || jenisValue.indexOf("PP") != -1 || jenisValue.indexOf("PC") != -1)) {
            totalKoper++;
            var itemExtraValue = parseInt($$('#extra_detail_' + i).val());
            var itemLabel = itemExtraValue === 1 ? 'POLO' : 'XTRA';

            console.log('Proforma #' + i + ': ' + jenisValue + ' → ' + itemLabel + ' (value=' + itemExtraValue + ')');

            // Simpan detail koper
            koperDetails.push({
                index: i,
                jenis: jenisValue,
                value: itemExtraValue,
                label: itemLabel
            });

            // Hitung yang match dengan header
            if (itemExtraValue === headerValue) {
                matchingKoper++;
            }
        }
    }

    // Validasi: jika ada koper, minimal SATU harus sama dengan header
    if (totalKoper > 0 && matchingKoper === 0) {
        var errorMsg = '<div style="text-align:left; padding: 10px;">';
        errorMsg += '<strong>❌ Validasi XTRA/POLO Gagal!</strong><br><br>';
        errorMsg += '<div style="background: #ffebee; padding: 10px; border-left: 4px solid #f44336; margin: 10px 0;">';
        errorMsg += '<strong>Header:</strong> ' + headerLabel + '<br>';
        errorMsg += '<strong>Item Koper:</strong><br>';

        // Tampilkan semua koper yang tidak match
        for (var k = 0; k < koperDetails.length; k++) {
            var koper = koperDetails[k];
            errorMsg += '&nbsp;&nbsp;• Proforma #' + koper.index + ': ' + koper.label + ' (' + koper.jenis + ')<br>';
        }

        errorMsg += '</div>';
        errorMsg += '<p style="margin-top: 15px;">Pastikan <strong>minimal salah satu</strong> item Koper menggunakan <strong>' + headerLabel + '</strong> yang sama dengan pilihan di header.</p>';
        errorMsg += '</div>';

        app.dialog.alert(errorMsg, '⚠️ Validasi Gagal');

        // Highlight field pertama yang bermasalah
        if (koperDetails.length > 0) {
            $$('#extra_detail_' + koperDetails[0].index).css('border', '3px solid #f44336');

            // Scroll ke field
            $$('#extra_detail_' + koperDetails[0].index)[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Remove highlight setelah 5 detik
            setTimeout(function () {
                $$('#extra_detail_' + koperDetails[0].index).css('border', '');
            }, 5000);
        }

        return; // Stop process
    }

    console.log('✅ XTRA/POLO validation passed! (' + matchingKoper + '/' + totalKoper + ' koper match with header)');

    // cek internet
    if (localStorage.getItem("internet_koneksi") === 'fail') {
        app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau');
        return;
    }


    // ========================================
    // FIX: Gunakan buildCleanFormData() agar index SELALU benar setelah delete
    // ========================================
    console.log('🚀 Building clean FormData...');
    const formData = buildCleanFormData();

    // ========================================
    // FIX CELAH #1: Deteksi edit mode → gunakan endpoint UPDATE
    // Sebelumnya SELALU ke /performa-input-backup (CREATE)
    // ========================================
    var submitUrl = BASE_API + "/performa-input-backup"; // Default: CREATE
    var submitLabel = 'Menyimpan...';
    var successLabel = 'Simpan';

    if (isEditMode && editPerformaHeaderId) {
        submitUrl = BASE_API + "/performa-update"; // EDIT endpoint
        submitLabel = 'Mengupdate...';
        successLabel = 'Update';
        formData.append('performa_header_id', editPerformaHeaderId);
        formData.append('is_edit', '1');
        console.log('📝 EDIT MODE: Submitting to /performa-update with header_id:', editPerformaHeaderId);
    } else {
        console.log('📝 CREATE MODE: Submitting to /performa-input-backup');
    }

    // lock tombol
    $("#performa_input_button_save").attr('disabled', 'true').text(submitLabel);

    jQuery.ajax({
        type: "POST",
        url: submitUrl,
        dataType: "JSON",
        data: formData,
        contentType: false,
        processData: false,
        xhr: function () {
            const dialog = app.dialog.progress('Loading ', 0);
            dialog.setText('0%');
            const xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    const pct = Math.round((evt.loaded / evt.total) * 100);
                    dialog.setProgress(pct);
                    dialog.setText(pct + '%');
                }
            }, false);
            return xhr;
        },
        success: function (data) {
            app.dialog.close();
            // buka kunci tombol
            $("#performa_input_button_save").removeAttr('disabled').text(successLabel);

            // ========================================
            // FIX CELAH #2: Cek status SEBELUM reset form
            // Sebelumnya form SELALU di-reset meskipun gagal → user kehilangan data
            // ========================================
            if (data.status === 'no_photo') {
                app.dialog.alert('Foto Ada Yang Tidak Di Isi');
                return; // JANGAN reset form → user bisa perbaiki & submit ulang
            } else if (data.status === 'terintegerasi') {
                app.dialog.alert('Gagal, Customer Terintegrasi Dengan Sales');
                return;
            } else if (data.status === 'gagal_client') {
                app.dialog.alert('Gagal, Customer ' + $$("#client_nama").val() + ', ' + $("#kota option:selected").text() + ' Sudah Ada');
                return;
            } else if (data.status === 'done') {
                // SUKSES → Baru reset form
                $$('#value_customer_logo').html('Logo Perusahaan');
                $$('#value_customer_logo_bordir').html('Logo Bordir');
                $$('#value_customer_logo_tambahan').html('Logo Tambah');
                $$('.value_performa').html('Gambar');
                $$('.performa-input').val('');
                $$('#total_performa').html(number_format(0));
                $$('.performa_group_field').empty();

                // Clear edit mode flags
                isEditMode = false;
                editPerformaHeaderId = null;
                editPerformaData = null;

                // ========================================
                // FIX: Safe access ke data.tanggal
                // tanggal bisa berupa object (Carbon) atau string
                // Error di sini akan menghentikan redirect
                // ========================================
                try {
                    localStorage.setItem('last_performa_id', data.id || '');
                    localStorage.setItem('last_performa_client', data.client_name || '');
                    localStorage.setItem('last_performa_alamat', data.client_alamat || '');

                    var tanggalStr = '';
                    if (data.tanggal) {
                        if (typeof data.tanggal === 'object' && data.tanggal.date) {
                            tanggalStr = data.tanggal.date;
                        } else if (typeof data.tanggal === 'string') {
                            tanggalStr = data.tanggal;
                        } else {
                            tanggalStr = new Date().toISOString();
                        }
                    } else {
                        tanggalStr = new Date().toISOString();
                    }
                    localStorage.setItem('last_performa_tanggal', tanggalStr);
                } catch (e) {
                    console.error('Error saving to localStorage:', e);
                }

                // Langsung redirect ke halaman Sales setelah alert sukses
                app.dialog.alert('Proforma Berhasil Disimpan', 'Sukses', function () {
                    app.views.main.router.navigate('/Sales');
                });
                return;
            } else {
                app.dialog.alert('Gagal Input Performa: ' + (data.message || 'Unknown error'));
                return;
            }
        },
        error: function (xhr, status, error) {
            $("#performa_input_button_save").removeAttr('disabled').text(successLabel);
            app.dialog.close();
            app.dialog.alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
            console.error('❌ Submit error:', error, 'Status:', status);
        }
    });
}



function logoPerusahaan() {
    if (jQuery('#customer_logo').val() == '' || jQuery('#customer_logo').val() == null) {
        $$('#value_customer_logo').html('Logo Emblem');
        $$('#value_customer_logo').css("background-color", "#ff3b30");
        $$('#value_customer_logo').removeClass('bg-dark-gray-young');
    } else {
        $$('#value_customer_logo').html($$('#customer_logo').val().replace('fakepath', ''));
        $$('#value_customer_logo').addClass('bg-dark-gray-young');
    }

}

function logoPerusahaanBordir() {

    if (jQuery('#customer_logo_bordir').val() == '' || jQuery('#customer_logo_bordir').val() == null) {
        $$('#value_customer_logo_bordir').html('Logo Bordir');
        $$('#value_customer_logo_bordir').css("background-color", "#ff3b30");
        $$('#value_customer_logo_bordir').removeClass('bg-dark-gray-young');
    } else {
        $$('#value_customer_logo_bordir').html($$('#customer_logo_bordir').val().replace('fakepath', ''));
        $$('#value_customer_logo_bordir').addClass('bg-dark-gray-young');
    }
}

function logoPerusahaanTambahan() {
    if (jQuery('#customer_logo_tambahan').val() == '' || jQuery('#customer_logo_tambahan').val() == null) {
        $$('#value_customer_logo_tambahan').html('Logo Tambahan');
    } else {
        $$('#value_customer_logo_tambahan').html($$('#customer_logo_tambahan').val().replace('fakepath', ''));
    }
}


function gambarPerforma(performa_table_id) {
    if (jQuery('#file_' + performa_table_id + '').val() == '' || jQuery('#file_' + performa_table_id + '').val() == null) {
        $$('#value_performa_' + performa_table_id + '').html('Gambar');
    } else {
        $$('#value_performa_' + performa_table_id + '').html($$('#file_' + performa_table_id + '').val().replace('fakepath', ''));
    }
}

var delayTimer1;
function doSearchByNewType(count) {
    clearTimeout(delayTimer1);
    var tipe2 = '';
    delayTimer1 = setTimeout(function () {
        tipe2 = jQuery('#jenis_' + count).val();

        // Apply shortcut: HCA->HC, HPC->PC, HPP->PP
        var shortcut = applyInputShortcut(tipe2);
        if (shortcut.converted) {
            jQuery('#jenis_' + count).val(shortcut.result);
            tipe2 = shortcut.result;
        }

        getKatalogAdd(tipe2, count)
        console.log('Tipe = ' + tipe2 + ' Count = ' + count)
    }, 2000);

}


function getKatalogAdd(tipe, count) {
    // Apply shortcut conversion (HCA->HC, HPC->PC, HPP->PP)
    var shortcut = applyInputShortcut(tipe);
    if (shortcut.converted) {
        jQuery('#jenis_' + count).val(shortcut.result);
        tipe = shortcut.result;
    }

    // Reset semua field terkait proforma saat tipe berubah
    resetProformaFields(count);

    // $$('#price_' + count).val(0);
    if (tipe == "") {
        $$('#gambar_proforma_input_' + count).css("display", "initial");
        $$('#color_proforma_input_' + count).css("display", "none");
        $$('#type_proforma_input_' + count).removeClass('col-100');
        $$('#type_proforma_input_' + count).addClass('col-80');
        $$('#el_ukuran_hc_' + count).hide();
        $$('#el_ukuran_ts_' + count).css("display", "none");
        $$('#el_style_hc_' + count).hide();
        $$('#el_material_hc_' + count).hide();
        document.getElementById('price_' + count).readOnly = true;
    } else {
        jQuery.ajax({
            type: 'POST',
            url: "" + BASE_API + "/get-produk-proforma",
            dataType: 'JSON',
            data: {
                jenis_1: tipe // Kirim full, bukan substr(-3)
            },
            beforeSend: function () {
                app.dialog.preloader('Harap Tunggu');
            },
            success: function (data) {
                app.dialog.close();
                $$('#el_style_hc_' + count).hide();
                $$('#el_material_hc_' + count).hide();
                if (tipe.indexOf("HCC") != -1) {
                    $$('#gambar_proforma_input_' + count).css("display", "initial");
                    $$('#color_proforma_input_' + count).css("display", "none");
                    $$('#el_ukuran_hc_' + count).show();
                    $$('#el_ukuran_ts_' + count).css("display", "none");
                    $$('#type_proforma_input_' + count).removeClass('col-100');
                    $$('#type_proforma_input_' + count).addClass('col-80');
                    $$('#file_' + count).prop('required', true);
                    $$('#file_' + count).prop('validate', true);
                    $$('#el_style_hc_' + count).show();
                    $$('#el_material_hc_' + count).show();
                    document.getElementById('price_' + count).readOnly = true;
                    document.getElementById('price_' + count).setAttribute('data-is-koper', 'true');
                    var similarityCode = getCustomSimilarityCode('HC');
                    showselectBoxUkuran(similarityCode, count);
                    selectBoxMaterial(similarityCode, count)
                    // NOTE: HPP dan HPC blocks dibawah ini sudah tidak akan tereksekusi
                    // karena HPP->PP dan HPC->PC diconvert di awal fungsi getKatalogAdd
                } else if (tipe.indexOf("HPP") != -1) {
                    $$('#gambar_proforma_input_' + count).css("display", "initial");
                    $$('#color_proforma_input_' + count).css("display", "none");
                    $$('#el_ukuran_hc_' + count).show();
                    $$('#el_ukuran_ts_' + count).css("display", "none");
                    $$('#type_proforma_input_' + count).removeClass('col-100');
                    $$('#type_proforma_input_' + count).addClass('col-80');
                    $$('#file_' + count).prop('required', true);
                    $$('#file_' + count).prop('validate', true);
                    $$('#el_style_hc_' + count).show();
                    $$('#el_material_hc_' + count).show();
                    document.getElementById('price_' + count).readOnly = true;
                    document.getElementById('price_' + count).setAttribute('data-is-koper', 'true');
                    var similarityCode = getCustomSimilarityCode('PP');
                    showselectBoxUkuran(similarityCode, count);
                    selectBoxMaterial(similarityCode, count)
                } else if (tipe.indexOf("HPC") != -1) {
                    $$('#gambar_proforma_input_' + count).css("display", "initial");
                    $$('#color_proforma_input_' + count).css("display", "none");
                    $$('#el_ukuran_hc_' + count).show();
                    $$('#el_ukuran_ts_' + count).css("display", "none");
                    $$('#type_proforma_input_' + count).removeClass('col-100');
                    $$('#type_proforma_input_' + count).addClass('col-80');
                    $$('#file_' + count).prop('required', true);
                    $$('#file_' + count).prop('validate', true);
                    $$('#el_style_hc_' + count).show();
                    $$('#el_material_hc_' + count).show();
                    document.getElementById('price_' + count).readOnly = true;
                    document.getElementById('price_' + count).setAttribute('data-is-koper', 'true');
                    var similarityCode = getCustomSimilarityCode('PC');
                    showselectBoxUkuran(similarityCode, count);
                    selectBoxMaterial(similarityCode, count)
                } else if (tipe.indexOf("HC") != -1) {
                    document.getElementById('price_' + count).readOnly = true;
                    document.getElementById('price_' + count).setAttribute('data-is-koper', 'true');
                    if (tipe.length == 6) {
                        if (data.data.length != 0) {
                            $("#openPopup_" + count).click();
                            getKatalogPopupAdd(tipe, count); // Kirim full, bukan substr(-3)
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        } else {
                            app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            jQuery('#jenis_' + count).val('');
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        }
                    } else if (tipe.length == 2) {
                        if (data.data.length != 0) {
                            $("#openPopupAll_" + count).click();
                            getKatalogPopupAll(count, 'HC');  // FIX: Pass type parameter
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        } else {
                            app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            jQuery('#jenis_' + count).val('');
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        }
                    } else {
                        app.dialog.alert('Panjang Huruf Tipe HC 6 Digit, Contoh : (HC-112)');
                        $$('#color_proforma_input_' + count).css("display", "none");
                        $$('#gambar_proforma_input_' + count).css("display", "none");
                        $$('#el_ukuran_hc_' + count).hide();
                        jQuery('#jenis_' + count).val('');
                        $$('#el_ukuran_ts_' + count).css("display", "none");
                        $$('#file_' + count).prop('required', false);
                        $$('#file_' + count).prop('validate', false);
                    }
                } else if (tipe.indexOf("PP") != -1) {
                    document.getElementById('price_' + count).readOnly = true;
                    document.getElementById('price_' + count).setAttribute('data-is-koper', 'true');
                    if (tipe.length == 6) {
                        if (data.data.length != 0) {
                            $("#openPopup_" + count).click();
                            getKatalogPopupAdd(tipe, count);
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        } else {
                            app.dialog.alert('Tidak Ada PP Dengan Tipe Ini');
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            jQuery('#jenis_' + count).val('');
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        }
                    } else if (tipe.length == 2) {
                        if (data.data.length != 0) {
                            $("#openPopupAll_" + count).click();
                            getKatalogPopupAll(count, 'PP');  // FIX: Pass type parameter
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        } else {
                            app.dialog.alert('Tidak Ada PP Dengan Tipe Ini');
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            jQuery('#jenis_' + count).val('');
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        }
                    } else {
                        app.dialog.alert('Panjang Huruf Tipe PP 2 atau 6 Digit, Contoh : (PP atau PP-501)');
                        $$('#color_proforma_input_' + count).css("display", "none");
                        $$('#gambar_proforma_input_' + count).css("display", "none");
                        $$('#el_ukuran_hc_' + count).hide();
                        jQuery('#jenis_' + count).val('');
                        $$('#el_ukuran_ts_' + count).css("display", "none");
                        $$('#file_' + count).prop('required', false);
                        $$('#file_' + count).prop('validate', false);
                    }
                } else if (tipe.indexOf("PC") != -1) {
                    document.getElementById('price_' + count).readOnly = true;
                    document.getElementById('price_' + count).setAttribute('data-is-koper', 'true');
                    if (tipe.length == 6) {
                        if (data.data.length != 0) {
                            $("#openPopup_" + count).click();
                            getKatalogPopupAdd(tipe, count);
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        } else {
                            app.dialog.alert('Tidak Ada PC Dengan Tipe Ini');
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            jQuery('#jenis_' + count).val('');
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        }
                    } else if (tipe.length == 2) {
                        if (data.data.length != 0) {
                            $("#openPopupAll_" + count).click();
                            getKatalogPopupAll(count, 'PC');  // FIX: Pass type parameter
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        } else {
                            app.dialog.alert('Tidak Ada PC Dengan Tipe Ini');
                            $$('#color_proforma_input_' + count).css("display", "none");
                            $$('#gambar_proforma_input_' + count).css("display", "none");
                            jQuery('#jenis_' + count).val('');
                            $$('#file_' + count).prop('required', false);
                            $$('#file_' + count).prop('validate', false);
                            $$('#el_ukuran_hc_' + count).hide();
                            $$('#el_ukuran_ts_' + count).css("display", "none");
                        }
                    } else {
                        app.dialog.alert('Panjang Huruf Tipe PC 2 atau 6 Digit, Contoh : (PC atau PC-118)');
                        $$('#color_proforma_input_' + count).css("display", "none");
                        $$('#gambar_proforma_input_' + count).css("display", "none");
                        $$('#el_ukuran_hc_' + count).hide();
                        jQuery('#jenis_' + count).val('');
                        $$('#el_ukuran_ts_' + count).css("display", "none");
                        $$('#file_' + count).prop('required', false);
                        $$('#file_' + count).prop('validate', false);
                    }
                } else if (tipe.indexOf("TAS") != -1) {
                    if (tipe.length == 3) {
                        $('#openPopupTs_' + count).click();
                        $$('#gambar_proforma_input_' + count).css("display", "initial");
                        $$('#color_proforma_input_' + count).css("display", "none");
                        $$('#el_ukuran_ts_' + count).css("display", "initial");
                        $$('#type_proforma_input_' + count).css("display", "none");
                        $$('#el_ukuran_ts_' + count).removeClass('col-100');
                        $$('#el_ukuran_ts_' + count).addClass('col-80');
                        $$('#file_' + count).prop('required', true);
                        $$('#file_' + count).prop('validate', true);
                        $$('#el_ukuran_hc_' + count).hide();
                        showselectBoxTS(count);
                        document.getElementById('price_' + count).readOnly = false;
                        document.getElementById('price_' + count).removeAttribute('data-is-koper');
                    } else {
                        app.dialog.alert('Panjang Huruf Tipe TS 3 Digit, Contoh : (TAS)');
                    }
                } else {
                    $('#openPopupTs_' + count).click();
                    $$('#gambar_proforma_input_' + count).css("display", "initial");
                    $$('#color_proforma_input_' + count).css("display", "none");
                    $$('#el_ukuran_ts_' + count).css("display", "initial");
                    $$('#type_proforma_input_' + count).css("display", "none");
                    $$('#el_ukuran_ts_' + count).removeClass('col-100');
                    $$('#el_ukuran_ts_' + count).addClass('col-80');
                    $$('#file_' + count).prop('required', true)
                    $$('#file_' + count).prop('validate', true)
                    document.getElementById('price_' + count).readOnly = false;
                    document.getElementById('price_' + count).removeAttribute('data-is-koper');
                    $$('#el_ukuran_hc_' + count).hide();
                    showselectBoxTS(count);
                }
            },
            error: function (xmlhttprequest, textstatus, message) {
            }
        });
    }
}

function getKatalogPopupAdd(tipe, count) {
    var katalog_data = '';
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-produk-proforma",
        dataType: 'JSON',
        data: {
            jenis_1: tipe
        },
        beforeSend: function () {
            app.dialog.preloader('Harap Tunggu');
        },
        success: function (data) {
            $.each(data.data, function (i, item) {
                if (item.kode_warna != null) {
                    var kode_warna = item.kode_warna;
                } else {
                    var kode_warna = '-';
                }
                katalog_data += '<div class="col-50" style="margin:4px;">';
                katalog_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
                katalog_data += '   <img onclick="fillProformaNewInput(\'' + count + '\',\'' + item.produk_detail_id + '\',\'' + item.produk_grup_warna + '\',\'' + item.produk_id + '\',\'' + item.nama_warna + '\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
                katalog_data += '  <h4 style="margin-top:2px;">' + item.produk_id + '</h4>';
                if (item.grosir == 0 && item.xtra == 1) {
                    katalog_data += '	<div class="col-100">';
                    katalog_data += '		<img src="img/logo/lblXtra.png" style="width:101%;margin-bottom:5px;" />';
                    katalog_data += '	</div>';
                } else if (item.grosir == 1 && item.xtra == 0) {
                    katalog_data += '	<div class="col-100">';
                    katalog_data += '		<img src="img/logo/lblStandart.png" style="width:101%;margin-bottom:5px;" />';
                    katalog_data += '	</div>';
                } else if (item.grosir == 1 && item.xtra == 1) {
                    katalog_data += '	<div class="col-100">';
                    katalog_data += '		<img src="img/logo/lblCombi.png" style="width:101%;margin-bottom:5px;" />';
                    katalog_data += '	</div>';
                } else {
                    katalog_data += '	<div class="col-100">';
                    katalog_data += '		';
                    katalog_data += '	</div>';
                }
                katalog_data += '  <h6 style="margin-top:2px;margin-bottom:5px;">' + kode_warna + ' | ' + item.nama_warna + '</h6>';
                katalog_data += ' <div style="margin-left:auto;margin-right:auto;">';
                katalog_data += '  <div style="margin-left:auto;margin-right:auto;margin-bottom:10px;width:100px;height:20px;background-color:' + item.produk_grup_warna + '"></div>';
                katalog_data += ' </div>';
                katalog_data += '</div>';
                katalog_data += ' </div>';

            });

            app.dialog.close();
            jQuery('#katalog_data').html(katalog_data);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function fillProformaNewInput(count, produk_detail_id, produk_grup_warna, produk_id, nama_warna) {

    $("#close-katalog-popup").click();
    $$('#color_proforma_input_' + count).css("display", "inline");
    $$('#type_proforma_input_' + count).removeClass('col-100');
    $$('#type_proforma_input_' + count).addClass('col-100');
    $$('#ukuran_ts_' + count).prop('required', false);
    $$('#ukuran_ts_' + count).prop('validate', false);

    // Tentukan warna text berdasarkan brightness background
    var textColor = getContrastColor(produk_grup_warna);
    $$('#color_input_' + count).html('<div style="display: inline-block; width: 120px; padding: 5px 12px; font-size: 11px; font-weight: bold; color: ' + textColor + '; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 5px; background-color:' + produk_grup_warna + '">' + nama_warna + '</div>');
    $$('#proforma_produk_detail_id_' + count).val(produk_detail_id);
    $$('#el_keterangan_full_' + count).css("display", "none");
    $$('#proforma_produk_id_' + count).val(produk_id);
    $$('#keterangan_full_' + count).val(nama_warna);
    $$('#el_ukuran_hc_' + count).show();
    $$('#el_ukuran_ts_' + count).css("display", "none");
    $$('#el_style_hc_' + count).show();
    $$('#el_material_hc_' + count).show();

    // Set price field readonly dan tandai sebagai koper (harga fixed)
    var priceField = document.getElementById('price_' + count);
    if (priceField) {
        priceField.readOnly = true;
        priceField.setAttribute('data-is-koper', 'true');
    }

    showselectBoxUkuran(produk_id, count);
    selectBoxMaterial(produk_id, count)
    $$('#jenis_' + count).val(produk_id);

}

function saveHC(count) {
    var tipe = '';
    tipe = $$('#jenis_' + count).val();
    $$('#jenis_' + count).removeClass('this_hc');
    if (tipe.indexOf("HC") != -1) {
        // localStorage.setItem("jenis_hc", $$('#jenis_' + $$('.performa_group_field_count').length).val())
        // localStorage.setItem("qty_hc", $$('#qty_' + $$('.performa_group_field_count').length).val())
        $$('#jenis_' + count).addClass('this_hc');
        if (jenis_produk < 1) {
            object_produk.jenis = $$('#jenis_' + count).val();
            object_produk.qty = $$('#qty_' + count).val();
            jenis_produk.push(object_produk);
            $$('#jenis_' + count).addClass('declare_first_hc');
        }
    }
}


function addPerforma() {

    saveHC($$('.performa_group_field_count').length);
    $$('#count_performa').val($$('.performa_group_field_count').length + 1);
    console.log($$('.performa_group_field_count').length);
    var html_performa_group_field = '';

    html_performa_group_field += '<h3 style="margin-top:8px;" id="title_' + ($('.performa_group_field_count').length + 1) + '" class="title-performa">Proforma #' + ($('.performa_group_field_count').length + 1) + '</h3>';
    html_performa_group_field += '<ul id="performa_' + ($('.performa_group_field_count').length + 1) + '" class="performa_group_field_count" style="background-color:#1c1c1d; border-radius:2px; margin-top:-12px; border:1px solid gray; list-style:none; padding-left:0; margin-left:0;">';
    html_performa_group_field += '<div class="row no-gap" style="margin-top: 5px;">';
    html_performa_group_field += '<li class="item-content item-input margin-8 col-100 el_type_proforma_input" id="type_proforma_input_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<div class="item-inner" style="height:8px;">';
    html_performa_group_field += '<div class="item-input-wrap" style="display: flex; align-items: center;">';
    html_performa_group_field += '<input oninput="this.value = this.value.toUpperCase()" onkeyup="doSearchByNewType(' + ($('.performa_group_field_count').length + 1) + ');" placeholder="Type" name="jenis_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'id="jenis_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'class="performa-input input-item-jenis text-add-colour-black-soft bg-dark-gray-young button-small text-bold jenis_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'type="text" required validate style="flex: 1;">';
    html_performa_group_field += '<span id="input-clear-button-type-' + ($('.performa_group_field_count').length + 1) + '" class="input-clear-button-jenis"></span>';
    html_performa_group_field += '<i class="f7-icons" id="dropdown-katalog-icon-' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'onclick="handleDropdownKatalog(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'style="cursor: pointer; margin-left: 5px; font-size: 21px; color: #aaaaaa;">chevron_down_circle_fill</i>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '<input type="hidden" id="openPopup_' + ($('.performa_group_field_count').length + 1) + '" class="popup-open open_popup_1" data-popup=".katalog-popup" name="openPopup_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input type="hidden" id="openPopupAll_' + ($('.performa_group_field_count').length + 1) + '" class="popup-open open_popup_all_1" data-popup=".all-katalog-popup" name="openPopupAll_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input type="hidden" id="openPopupChoose_' + ($('.performa_group_field_count').length + 1) + '" class="popup-open open_popup_choose_1" data-popup=".choose-katalog-type-popup" name="openPopupChoose_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input type="hidden" id="openPopupTs_' + ($('.performa_group_field_count').length + 1) + '" class="popup-open open_popup_ts" data-popup=".katalog-ts-popup" name="openPopupTs_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input type="hidden" class="el_proforma_produk_detail_id" id="proforma_produk_detail_id_' + ($('.performa_group_field_count').length + 1) + '" name="proforma_produk_detail_id_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input type="hidden" class="el_proforma_produk_id" id="proforma_produk_id_' + ($('.performa_group_field_count').length + 1) + '" name="proforma_produk_id_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input type="hidden" class="el_proforma_harga_satuan" id="harga_satuan_' + ($('.performa_group_field_count').length + 1) + '" name="harga_satuan_' + ($('.performa_group_field_count').length + 1) + '" value="0">';
    html_performa_group_field += '<input type="hidden" class="el_proforma_harga_style" id="harga_style_' + ($('.performa_group_field_count').length + 1) + '" name="harga_style_' + ($('.performa_group_field_count').length + 1) + '" value="0">';
    html_performa_group_field += '<input type="hidden" class="el_proforma_harga_material" id="harga_material_' + ($('.performa_group_field_count').length + 1) + '" name="harga_material_' + ($('.performa_group_field_count').length + 1) + '" value="0">';
    html_performa_group_field += '<input type="hidden" class="el_id_produk_ts" id="id_produk_ts_' + ($('.performa_group_field_count').length + 1) + '" name="id_produk_ts_' + ($('.performa_group_field_count').length + 1) + '" value="">';
    html_performa_group_field += '<input type="hidden" class="performa-input input-item-id-ukuran-hc" id="id_ukuran_hc_' + ($('.performa_group_field_count').length + 1) + '" name="id_ukuran_hc_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input type="hidden" class="performa-input input-item-id-material" id="id_material_' + ($('.performa_group_field_count').length + 1) + '" name="id_material_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input type="hidden" class="is-editing-flag" id="is_editing_' + ($('.performa_group_field_count').length + 1) + '" value="false">';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-8 col-100 el-input-ukuran-ts" id="el_ukuran_ts_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<input type="text" id="ukuran_ts_' + ($('.performa_group_field_count').length + 1) + '" name="ukuran_ts_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'class="performa-input input-item-ukuran-ts text-add-colour-black-soft bg-dark-gray-young button-small text-bold" required ';
    html_performa_group_field += 'validate readonly onchange="fillHargaTs(' + ($('.performa_group_field_count').length + 1) + ');">';
    html_performa_group_field += '<span class="input-clear-button" onclick="clearInputSelect(' + ($('.performa_group_field_count').length + 1) + ');"></span>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-8 col-50 el_color_proforma_input color_proforma_input_koper" id="color_proforma_input_' + ($('.performa_group_field_count').length + 1) + '" style="display: none; position:absolute;">';
    html_performa_group_field += '<div class="item-inner" style="height:8px;">';
    html_performa_group_field += '<div class="item-input-wrap" id="color_input_' + ($('.performa_group_field_count').length + 1) + '" style="border-radius: 5px;"></div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-16 col-20 el_gambar_proforma_input" id="gambar_proforma_input_' + ($('.performa_group_field_count').length + 1) + '" style="display: none;margin-left: 0px;padding-left: 0px;">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<br>';
    html_performa_group_field += '<center>';
    html_performa_group_field += '<label style="width:100%;height:27px; float:left; margin-bottom:10px;" for="file_' + ($('.performa_group_field_count').length + 1) + '" id="value_performa_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'class="margin-18 text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold custom-file-upload value_performa"><i class="f7-icons">photo_fill</i></label>';
    html_performa_group_field += '<input class="performa-input input-item-file text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" ';
    html_performa_group_field += 'type="file" style="display:none;" onchange="gambarPerforma(' + ($('.performa_group_field_count').length + 1) + ');" name="file_' + ($('.performa_group_field_count').length + 1) + '" id="file_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'accept="image/*">';
    html_performa_group_field += '</center>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '<li class="item-content item-input margin-4 item-input-el-extra" id="el_extra_' + ($('.performa_group_field_count').length + 1) + '" style="display:none;">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<select style="color:gray;" id="extra_detail_' + ($('.performa_group_field_count').length + 1) + '" name="extra_detail_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'class="performa-input input-item-extra resizable" required validate onchange="callbackHarga(' + ($('.performa_group_field_count').length + 1) + ');">';
    html_performa_group_field += '<option value="0">Xtra</option>';
    html_performa_group_field += '<option value="1">Polo</option>';
    html_performa_group_field += '</select>';
    html_performa_group_field += '<span class="input-clear-button"></span>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input el-input-ukuran-hc margin-4" id="el_ukuran_hc_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<select style="color:gray;" id="ukuran_hc_' + ($('.performa_group_field_count').length + 1) + '" name="ukuran_hc_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'class="performa-input input-item-ukuran-hc resizable" required ';
    html_performa_group_field += 'validate onchange="fillHargaProduk(' + ($('.performa_group_field_count').length + 1) + ');">';
    html_performa_group_field += '</select>';
    html_performa_group_field += '<span class="input-clear-button"></span>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-4 el-input-material-hc" id="el_material_hc_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<select style="border-color:white;" id="material_' + ($('.performa_group_field_count').length + 1) + '" name="material_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'onchange="fillHargaMaterialProdukUniversal(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'class="performa-input input-item-material" required validate>';
    html_performa_group_field += '</select>';
    html_performa_group_field += '<span class="input-clear-button"></span>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-4" id="el_keterangan_full_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<textarea style="border-color:white;" id="keterangan_full_' + ($('.performa_group_field_count').length + 1) + '" name="keterangan_full_' + ($('.performa_group_field_count').length + 1) + '" class="performa-input input-item-ket-full resizable" placeholder="Warna" required validate></textarea>';
    html_performa_group_field += '<span class="input-clear-button"></span>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-4 el-input-style-hc" style="width: 100%;" id="el_style_hc_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap" onclick="openStyleSmartSelect(' + ($('.performa_group_field_count').length + 1) + ');" style="display: flex; align-items: center; cursor: pointer;">';
    html_performa_group_field += '<div style="flex: 1; display: flex; align-items: center; gap: 10px;">';
    html_performa_group_field += '<span id="style_hc_input_' + ($('.performa_group_field_count').length + 1) + '" class="el_style_hc_input" style="color: white; font-size: 16px;"></span>';
    html_performa_group_field += '<div id="color_button_' + ($('.performa_group_field_count').length + 1) + '" class="color-box-style" ';
    html_performa_group_field += 'style="display: none; padding: 5px 12px; font-size: 11px; font-weight: bold; color: white; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 5px; margin-left: auto;"></div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '<i class="f7-icons" ';
    html_performa_group_field += 'style="margin-left: 5px; font-size: 21px; color: #aaaaaa;">chevron_down_circle_fill</i>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '<a class="item-link smart-select smart-select-init el-smart-style" id="ss_style_hc_' + ($('.performa_group_field_count').length + 1) + '" data-open-in="popover" data-close-on-select="true" style="display: none;">';
    html_performa_group_field += '<select id="style_hc_' + ($('.performa_group_field_count').length + 1) + '" name="style_hc_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'onchange="fillHargaVariasiProduk(' + ($('.performa_group_field_count').length + 1) + ');changeWarnaFullColor(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'class="performa-input input-item-style-hc resizable" multiple>';
    html_performa_group_field += '</select>';
    html_performa_group_field += '</a>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '<input class="input-selected-color" type="hidden" id="selected_color_' + ($('.performa_group_field_count').length + 1) + '" name="selected_color_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<input class="input-selected-hex-color" type="hidden" id="selected_hex_color_' + ($('.performa_group_field_count').length + 1) + '" name="selected_hex_color_' + ($('.performa_group_field_count').length + 1) + '">';
    html_performa_group_field += '<small class="show-selected-color" id="show_color_fullcolor_' + ($('.performa_group_field_count').length + 1) + '" style="display:none;"></small>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-4">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<textarea style="border-color:white;" id="keterangan_singkat_' + ($('.performa_group_field_count').length + 1) + '" name="keterangan_singkat_' + ($('.performa_group_field_count').length + 1) + '" class="input-item-keterangan-singkat resizable" placeholder="Keterangan"></textarea>';
    html_performa_group_field += '<span class="input-clear-button"></span>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-8">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<div class="row no-gap">';
    html_performa_group_field += '<!-- Kolom Kiri 75% untuk Input Qty -->';
    html_performa_group_field += '<div class="col-75">';

    // ========================================
    // FIX: Ambil qty dari proforma #1 sebagai default qty untuk item baru
    // Owner request: jika proforma #1 qty = 100, maka proforma baru juga 100
    // ========================================
    // var defaultQty = $$('#qty_1').val() || '100';
    var defaultQty = '100';

    html_performa_group_field += '<input min="1" placeholder="Qty" value="' + defaultQty + '" name="qty_' + ($('.performa_group_field_count').length + 1) + '" id="qty_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'onchange="changeTotalValue(' + ($('.performa_group_field_count').length + 1) + ');changeQtyTs(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'onclick="resetValueQty(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'class="input-item-qty text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="number" required validate>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '<!-- Kolom Kanan 25% untuk Nominal dan Icon Copy -->';
    html_performa_group_field += '<div class="col-25" style="display: flex; align-items: center; justify-content: flex-end; gap: 5px; padding-right: 10px;">';
    html_performa_group_field += '<!-- NOMINAL POTONGAN -->';
    html_performa_group_field += '<span id="nominal_potongan_display_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'style="display: none; font-size: 11px; color: #4CAF50; font-weight: bold; white-space: nowrap;"></span>';
    html_performa_group_field += '<!-- ICON COPY POTONGAN -->';
    html_performa_group_field += '<i class="f7-icons icon-copy-potongan" id="copy_potongan_icon_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'onclick="copyPotonganToNetHarga(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'style="display: none; font-size: 20px; color: #4CAF50; cursor: pointer;">doc_on_doc_fill</i>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-5">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap">';
    html_performa_group_field += '<div class="row no-gap">';
    html_performa_group_field += '<div class="col">';
    html_performa_group_field += '<input placeholder="Harga" name="price_' + ($('.performa_group_field_count').length + 1) + '" id="price_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'onchange="changeTotalValue(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'onclick="resetValueHarga(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'class="input-item-price text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="text" required readonly validate>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '<div class="col">';
    html_performa_group_field += '<input placeholder="Net Harga" name="potongan_price_' + ($('.performa_group_field_count').length + 1) + '" id="potongan_price_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'onblur="validateNetHargaChange(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'oninput="handleNetHargaInput(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'onclick="resetValueNetHarga(' + ($('.performa_group_field_count').length + 1) + ');" ';
    html_performa_group_field += 'class="performa-input input-item-potongan-price text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="text" validate style="text-align: right;">';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    html_performa_group_field += '<li class="item-content item-input margin-8">';
    html_performa_group_field += '<div class="item-inner">';
    html_performa_group_field += '<div class="item-input-wrap" style="margin-bottom:5px;">';
    html_performa_group_field += '<input placeholder="Total" required validate name="total_' + ($('.performa_group_field_count').length + 1) + '" id="total_' + ($('.performa_group_field_count').length + 1) + '" ';
    html_performa_group_field += 'class="input-item-total grand-total-value total-value text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="text" readonly>';
    html_performa_group_field += '<span class="input-clear-button"></span>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</div>';
    html_performa_group_field += '</li>';
    // ========================================
    // HIDDEN FIELDS UNTUK POTONGAN (PENTING!)
    // ========================================
    html_performa_group_field += '<input type="hidden" id="potongan_otomatis_' + ($('.performa_group_field_count').length + 1) + '" name="potongan_otomatis_' + ($('.performa_group_field_count').length + 1) + '" class="performa-input input-item-potongan-otomatis">';
    html_performa_group_field += '<input type="hidden" id="needs_approval_' + ($('.performa_group_field_count').length + 1) + '" name="needs_approval_' + ($('.performa_group_field_count').length + 1) + '" value="0" class="performa-input input-item-needs-approval">';
    html_performa_group_field += '<small id="info_potongan_' + ($('.performa_group_field_count').length + 1) + '" class="show-potongan-info" data-count="' + ($('.performa_group_field_count').length + 1) + '" style="display: none; color: #4CAF50; font-size: 11px; margin-top: 2px; cursor: pointer;"></small>';
    html_performa_group_field += '<small id="warning_perubahan_' + ($('.performa_group_field_count').length + 1) + '" style="display: none; color: #FF9800; font-size: 11px; margin-top: 2px;"></small>';
    html_performa_group_field += '<p style="padding-top:5px;">';
    html_performa_group_field += '<a onclick="addPerforma();" style="float:right; font-size:39px; margin-bottom:10px; margin-right:14px; margin-top:-27px; color:forestgreen;" class="add_performa f7-icons">plus_rectangle_fill</a>';
    html_performa_group_field += '<a style="float:right; font-size:39px; margin-right:14px; margin-top:-27px; color:#ff3b30;" data-id="performa_' + ($('.performa_group_field_count').length + 1) + '" class="f7-icons delete-performa" onclick="deletePerforma(' + ($('.performa_group_field_count').length + 1) + ');">minus_rectangle_fill</a>';
    html_performa_group_field += '</p>';
    html_performa_group_field += '</ul>';
    $$('.performa_group_field').append(html_performa_group_field);
    jQuery('.input-item-price').mask('000,000,000,000', { reverse: true });
    jQuery('.input-item-potongan-price').mask('000,000,000,000', { reverse: true });
    hideElPerforma($$('.performa_group_field_count').length);

    // ========================================
    // SET DEFAULT WARNA dari Global Variable
    // ========================================
    var newCount = $$('.performa_group_field_count').length;
    if (globalKoperColor.name && globalKoperColor.hex) {
        // Set ke textarea keterangan_full
        jQuery('#keterangan_full_' + newCount).val(globalKoperColor.name);
        console.log('✅ Default warna set untuk Proforma #' + newCount + ':', globalKoperColor.name);
    }

    // Reinitialize smart select untuk element yang baru ditambahkan
    app.smartSelect.create({
        el: '#ss_style_hc_' + newCount,
        openIn: 'popover',
        closeOnSelect: true
    });

    // ========================================
    // PERBAIKAN: Set default value extra_detail untuk proforma BARU
    // JANGAN disable dropdown, biarkan user bisa pilih manual jika mau
    // ========================================
    if ($('#xtra').prop('checked')) {
        $$('#extra_detail_' + newCount).val(0); // Xtra
        console.log('✅ Set extra_detail_' + newCount + ' default to XTRA (new proforma)');
    } else if ($('#extra').prop('checked')) {
        $$('#extra_detail_' + newCount).val(1); // Polo
        console.log('✅ Set extra_detail_' + newCount + ' default to POLO (new proforma)');
    }
    // Dropdown tetap enabled agar user bisa ubah jika mau

}

function hideElPerforma(count) {
    console.log(count);
    $$('#el_ukuran_hc_' + count).hide();
    $$('#el_style_hc_' + count).hide();
    $$('#el_material_hc_' + count).hide();
    $$('#el_ukuran_ts_' + count).css("display", "none");
}

function changeHC(count) {
    if ($('#jenis_' + count).hasClass('declare_first_hc')) {
        if ($$('#jenis_' + count).val() != jenis_produk[0].jenis) {
            clearArray();
            $$('#jenis_' + count).removeClass('this_hc');
            $$('#jenis_' + count).removeClass('declare_first_hc');
            var child = document.querySelectorAll(".this_hc");
            var child, i;
            var childall = [];
            for (i = 0; i < child.length; i++) {
                childall.push(document.getElementsByClassName('this_hc')[i].id);
            }
            var jenis_count = childall[0].replace(/^jenis_+/, '');
            console.log(jenis_count);
            saveHC(jenis_count)
            changeQtyTs(jenis_count);
        }
    }
}

function changeQtyTs(count) {
    var tipe = '';
    if ($('#jenis_' + count).hasClass('declare_first_hc')) {
        if ($$('#jenis_' + count).val() == jenis_produk[0].jenis) {
            $('.change_qty_ts').val($$('#qty_' + count).val());
            jenis_produk[0].qty = $$('#qty_' + count).val();
        }
    }

    // ========================================
    // TAMBAHAN: Recalculate potongan saat qty berubah
    // ========================================
    var jenisValue = jQuery('#jenis_' + count).val();

    // SECURITY FIX: Kosongkan net harga saat qty berubah
    console.log('🔄 Qty changed for count #' + count + ' - clearing net harga');
    $$('#potongan_price_' + count).val('');
    $$('#potongan_otomatis_' + count).val('');
    $$('#needs_approval_' + count).val(0);
    $$('#potongan_price_' + count).css('color', '');
    $$('#qty_' + count).css('color', '');
    $$('#info_potongan_' + count).hide();
    $$('#warning_perubahan_' + count).hide();

    // Update button text
    updateButtonText();

    // Delay sedikit untuk memastikan qty sudah terupdate
    setTimeout(function () {
        if (jenisValue && jenisValue.indexOf("HC") != -1) {
            // Koper - recalculate potongan
            console.log('🔄 Qty changed for Koper #' + count + ', recalculating potongan...');
            getPotonganKoper(count);
        } else if (jenisValue && jenisValue.indexOf("TAS") != -1 || jenisValue && jenisValue.indexOf("TS") != -1) {
            // Tas - recalculate potongan
            console.log('🔄 Qty changed for Tas #' + count + ', recalculating potongan...');
            getPotonganTas(count);
        }
    }, 150);
}


function deletePerforma(performa_id_table) {
    console.log('🗑️ deletePerforma called for item #' + performa_id_table);

    // 1. Update jenis_produk array
    var itemIndex = jenis_produk.indexOf($$('#jenis_' + performa_id_table).val());
    if (itemIndex > -1) {
        jenis_produk.splice(itemIndex, 1);
    }

    // 2. Remove DOM elements
    $$('#performa_' + performa_id_table).remove();
    $$('#title_' + performa_id_table).remove();

    // 3. Update count
    var newCount = $$('.performa_group_field_count').length;
    $$('#count_performa').val(newCount);

    // 4. Recalculate totals
    var sum = 0;
    $$(".total-value").each(function () {
        sum += +$$(this).val().replace(/\,/g, '');
    });
    $$('#total_performa').html(number_format(sum));
    $$('#total_performa_sum').val(sum);

    var totalqty = 0;
    $$(".input-item-qty").each(function () {
        totalqty += +$$(this).val().replace(/\,/g, '');
    });
    $$('#total_performa_qty').val(totalqty);

    // 5. FULL REINDEX semua fields (fungsi baru yang LENGKAP)
    reindexAllPerformaFields();

    // 5b. FIX: Force recalculate total tiap item via DOM langsung
    // Setelah reindex, pastikan total_N punya value yang benar
    var containers = document.querySelectorAll('.performa_group_field_count');
    containers.forEach(function (container, idx) {
        var totalEl = container.querySelector('.input-item-total');
        var priceEl = container.querySelector('.input-item-price');
        var qtyEl = container.querySelector('.input-item-qty');
        var n = idx + 1;

        if (totalEl && (!totalEl.value || totalEl.value === '')) {
            var price = priceEl ? parseFloat((priceEl.value || '0').replace(/,/g, '')) : 0;
            var qty = qtyEl ? parseFloat((qtyEl.value || '0').replace(/,/g, '')) : 0;
            var recalc = price * qty;
            if (recalc > 0) {
                totalEl.value = number_format(recalc);
                console.log('  🔧 Force-set total_' + n + ' = ' + totalEl.value);
            }
        } else if (totalEl) {
            console.log('  ✅ total_' + n + ' OK = ' + totalEl.value);
        }
    });

    // 6. Re-index globalPotonganData
    var newGlobalPotonganData = {};
    var gpIdx = 1;
    for (var oldIndex in globalPotonganData) {
        if (oldIndex != performa_id_table && globalPotonganData[oldIndex]) {
            newGlobalPotonganData[gpIdx] = globalPotonganData[oldIndex];
            gpIdx++;
        }
    }
    globalPotonganData = newGlobalPotonganData;
    console.log('✅ Re-indexed globalPotonganData:', globalPotonganData);

    // 7. Recalculate grand total with ongkir
    if (typeof updateGrandTotalWithOngkir === 'function') {
        updateGrandTotalWithOngkir();
    }

    console.log('✅ deletePerforma complete. Remaining items:', newCount);
}

function changeTotalValue(performa_id_table) {
    // ========================================
    // PERBAIKAN: Grand Total SELALU dari qty * price (harga normal)
    // Net Harga hanya untuk referensi, TIDAK untuk perhitungan total
    // ========================================

    var normalHargaField = $$('#price_' + performa_id_table).val();
    var price = 0;

    // SELALU gunakan harga normal untuk perhitungan total
    if (normalHargaField && normalHargaField.trim() !== '') {
        price = parseFloat(normalHargaField.replace(/\,/g, '')) || 0;
    }

    var qty = parseFloat($$('#qty_' + performa_id_table).val()) || 0;

    if (qty === 0) {
        qty = 100;
        $$('#qty_' + performa_id_table).val('100');
        console.log('Auto-corrected qty to 100 in changeTotalValue');
    }

    var total = price * qty;

    // Debug log
    console.log('💰 Calculate Total #' + performa_id_table + ':', {
        price: price,
        qty: qty,
        total: total
    });

    if (total != 0) {
        $$('#total_' + performa_id_table).val(number_format(total));
    } else {
        $$('#total_' + performa_id_table).val('');
    }

    // Hitung grand total dari semua item
    var sum = 0;
    $$(".total-value").each(function () {
        sum += +$$(this).val().replace(/\,/g, '');
    });
    $$('#total_performa').html(number_format(sum));
    $$('#total_performa_sum').val(sum);

    // Hitung total qty
    var totalqty = 0;
    $$(".input-item-qty").each(function () {
        totalqty += +$$(this).val().replace(/\,/g, '');
    });
    $$('#total_performa_qty').val(totalqty);

    // Update grand total dengan ongkir
    updateGrandTotalWithOngkir();

    // ========================================
    // TAMBAHAN: Auto-fill Net Harga berdasarkan qty
    // ========================================
    autoFillNetHargaBasedOnQty(performa_id_table);
}


/**
 * ========================================
 * FUNGSI: Auto-fill Net Harga berdasarkan qty
 * ========================================
 * Aturan BARU:
 * - qty >= 100: Net harga sesuai potongan dari API (jika ada), atau kosong
 * - 50 <= qty < 100: Net harga otomatis = price + 5000 (warna NORMAL, TIDAK butuh pengajuan)
 * - qty < 50: Net harga otomatis = price + 10000 (warna NORMAL, TIDAK butuh pengajuan)
 * - Pengajuan HANYA butuh jika user UBAH MANUAL net harga
 * 
 * @param {number} count - Proforma counter
 */
function autoFillNetHargaBasedOnQty(count) {
    // ========================================
    // FIX CELAH #9: Cek BOTH is_editing element DAN global isEditMode
    // Sebelumnya hanya cek is_editing_X yang bisa tidak exist → silent fail
    // ========================================
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

    // Ambil harga normal
    if (normalHargaField && normalHargaField.trim() !== '') {
        price = parseFloat(normalHargaField.replace(/\,/g, '')) || 0;
    }

    // Jika tidak ada harga atau qty, skip
    if (price === 0 || qty === 0) {
        return;
    }

    var netHargaElement = $$('#potongan_price_' + count);
    var qtyElement = $$('#qty_' + count);
    var needsApprovalElement = $$('#needs_approval_' + count);
    var warningElement = $$('#warning_perubahan_' + count);

    // Cek apakah ada potongan dari API (untuk qty >= 100)
    var hasPotonganFromAPI = globalPotonganData[count] && globalPotonganData[count].harga_setelah_potongan;

    // Cek apakah user sudah isi net harga secara manual
    var currentNetHarga = netHargaElement.val().replace(/\,/g, '');
    var potonganOtomatis = $$('#potongan_otomatis_' + count).val();

    // Jika user sudah isi net harga secara manual (berbeda dari potongan otomatis), jangan override
    if (currentNetHarga && potonganOtomatis &&
        parseFloat(currentNetHarga) !== parseFloat(potonganOtomatis)) {
        console.log('⚠️ User sudah isi net harga manual, skip auto-fill');
        return;
    }

    if (qty >= 100) {
        // ========================================
        // QTY >= 100: Gunakan potongan dari API (jika ada)
        // ========================================
        if (hasPotonganFromAPI) {
            // Jangan auto-fill, biarkan user klik icon copy
            // Hanya tampilkan icon copy dan nominal
            console.log('✅ qty >= 100, ada potongan dari API');
            // Reset warna dan flags (karena qty >= 100 tidak butuh approval otomatis)
            netHargaElement.css('color', '');
            qtyElement.css('color', '');
            needsApprovalElement.val(0);
            warningElement.hide();
        } else {
            // Tidak ada potongan dari API
            // CEK DULU: Jika user sudah isi manual, JANGAN kosongkan!
            var currentNetHarga = netHargaElement.val().replace(/\,/g, '');
            if (!currentNetHarga || currentNetHarga === '' || parseFloat(currentNetHarga) === 0) {
                // Hanya kosongkan jika memang belum ada isi
                netHargaElement.val('');
                netHargaElement.css('color', '');
                qtyElement.css('color', '');
                needsApprovalElement.val(0);
                console.log('⚠️ qty >= 100, tidak ada potongan API, net harga dikosongkan');
            } else {
                // User sudah isi manual, biarkan saja
                // TIDAK perlu pengajuan karena tidak ada potongan otomatis
                netHargaElement.css('color', ''); // Normal - tidak perlu pengajuan
                qtyElement.css('color', '');
                needsApprovalElement.val(0); // TIDAK perlu pengajuan
                console.log('✅ qty >= 100, tidak ada potongan API, user isi manual → KEEP (no approval needed)');
            }
            warningElement.hide();
            $$('#potongan_otomatis_' + count).val('');
        }
    } else if (qty >= 50 && qty < 100) {
        // ========================================
        // 50 <= QTY < 100: Net = price + 5000 (NORMAL, TIDAK BUTUH PENGAJUAN)
        // ========================================
        var netHarga = price + 5000;
        netHargaElement.val(number_format(netHarga));
        netHargaElement.css('color', '#fd7d14'); // Warna orange
        qtyElement.css('color', '#fd7d14'); // Warna orange
        needsApprovalElement.val(0); // TIDAK butuh pengajuan

        // Hide warning text
        warningElement.hide();

        // Simpan sebagai potongan otomatis
        $$('#potongan_otomatis_' + count).val(netHarga);

        console.log('✅ qty 50-99, net = price + 5000 (NORMAL, no approval)');
    } else if (qty < 50) {
        // ========================================
        // QTY < 50: Net = price + 10000 (NORMAL, TIDAK BUTUH PENGAJUAN)
        // ========================================
        var netHarga = price + 10000;
        netHargaElement.val(number_format(netHarga));
        netHargaElement.css('color', '#fd1414'); // Warna orange
        qtyElement.css('color', '#fd1414'); // Warna orange
        needsApprovalElement.val(1); // TIDAK butuh pengajuan

        // Hide warning text
        warningElement.hide();

        // Simpan sebagai potongan otomatis
        $$('#potongan_otomatis_' + count).val(netHarga);

        console.log('✅ qty < 50, net = price + 10000 (NORMAL, no approval)');
    }

    // Update button text
    updateButtonText();
}

function selectBoxClient() {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-client",
        dataType: "JSON",
        data: {
            user_id: localStorage.getItem("user_id")
        },
        beforeSend: function () {
        },
        success: function (data) {
            var select_box_client_id = '';
            select_box_client_id += '<option value="" selected>-- CUSTOMER --</option>';

            jQuery.each(data.data, function (i, val) {

                // status dari backend (NORMAL / WARNING / DELAYED / PROBLEM)
                var status = (val.status_pembayaran_client || 'NORMAL').toUpperCase();

                // mapping ke class CSS untuk warna Smart Select popup
                var optionClass = '';
                switch (status) {
                    case 'WARNING':
                        optionClass = 'client-status-warning';
                        break;
                    case 'DELAYED':
                        optionClass = 'client-status-delayed';
                        break;
                    case 'PROBLEM':
                        optionClass = 'client-status-problem';
                        break;
                    default:
                        optionClass = 'client-status-normal';
                        break;
                }

                var textOption = val.client_nama + ' | ' + val.client_kota;

                // Ambil field wilayah untuk deteksi Jakarta
                var wilayah = (val.wilayah || '').toUpperCase();

                // PERHATIKAN: ada data-status, data-option-class, dan data-wilayah
                select_box_client_id +=
                    '<option value="' + val.client_id + '" ' +
                    'data-status="' + status + '" ' +
                    'data-option-class="' + optionClass + '" ' +
                    'data-wilayah="' + wilayah + '">' +
                    textOption +
                    '</option>';
            });

            // isi select Smart Select
            $$('#client_id').html(select_box_client_id);

            // label default
            $$('.perusahaan_database .item-after').html('CUSTOMER');

            // Setup event listener untuk menambahkan badge PAY saat Smart Select popup dibuka
            setupPayBadgeForSmartSelect();
            setupSmartSelectPopupStyling();
        }
    });
}

// ========================================
// Styling Smart Select Popup: bg-dark-gray-medium pada header
// ========================================
function setupSmartSelectPopupStyling() {
    // Listen pada semua smart select elements untuk event open
    $$(".smart-select").on("smartselect:open", function () {
        setTimeout(function () {
            // Cari smart-select-popup yang sedang aktif dan style navbar-nya
            $$(".smart-select-popup .navbar-inner").addClass("bg-dark-gray-medium");
            console.log("Smart Select popup navbar styled with bg-dark-gray-medium");
        }, 100);
    });

    // Fallback: listen juga via document untuk smart select yang dibuat setelah init
    $$(document).on("smartselect:open", ".smart-select", function () {
        setTimeout(function () {
            $$(".smart-select-popup .navbar-inner").addClass("bg-dark-gray-medium");
        }, 100);
    });
}

// Fungsi untuk menambahkan badge PAY pada item Smart Select popup
function setupPayBadgeForSmartSelect() {
    // Cari Smart Select instance
    var smartSelectEl = $$('.smart-select-perusahaan')[0];

    if (!smartSelectEl) return;

    // Event listener untuk Smart Select opened
    $$(smartSelectEl).on('smartselect:open', function (e) {
        // Tunggu sebentar agar DOM popup sudah ter-render
        setTimeout(function () {
            console.log('Smart Select opened, adding PAY badges...');

            // Loop semua option di select
            $$('#client_id option').each(function (index, option) {
                var wilayah = $$(option).attr('data-wilayah') || '';
                var clientId = $$(option).val();

                console.log('Checking client:', $$(option).text(), 'Wilayah:', wilayah, 'ID:', clientId);

                // Jika wilayah adalah Jakarta
                if (wilayah.toUpperCase() === 'JAKARTA' && clientId) {
                    console.log('Jakarta client found! Adding badge...');

                    // Cari li item yang sesuai di popup menggunakan berbagai selector
                    // Framework7 biasanya membuat list item dengan radio
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
                        // Naik ke parent <li>
                        var listItem = radioInput.closest('li');

                        if (listItem.length > 0) {
                            // Cari .item-content di dalam li
                            var itemContent = listItem.find('.item-content');

                            if (itemContent.length > 0) {
                                // Cek apakah badge sudah ada
                                if (itemContent.find('.pay-badge').length === 0) {
                                    // Tambahkan badge PAY
                                    itemContent.append('<div class="pay-badge"></div>');
                                    console.log('Badge added successfully!');
                                } else {
                                    console.log('Badge already exists');
                                }
                            } else {
                                console.log('item-content not found in list item');
                            }
                        } else {
                            console.log('List item not found');
                        }
                    } else {
                        console.log('Radio input not found for client ID:', clientId);
                    }
                }
            });

            // Fallback: jika tidak ada badge yang ditambahkan, coba approach alternatif
            setTimeout(function () {
                if ($$('.pay-badge').length === 0) {
                    console.log('No badges added, trying alternative approach...');

                    // Cari semua li di popup
                    $$('.smart-select-page li, .popup.modal-in li').each(function (idx, li) {
                        var itemText = $$(li).find('.item-title').text();

                        // Loop option lagi untuk match berdasarkan text
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

document.addEventListener('DOMContentLoaded', function () {
    var $$ = window.Dom7;

    // Initialize XTRA/POLO checkbox state
    // XTRA checked by default, POLO unchecked
    $('#xtra').prop('checked', true);
    $('#extra').prop('checked', false);
    localStorage.setItem("polo_check", 0);
    // Set all extra_detail to 0 (Xtra) and disable
    $('.input-item-extra').val(0);
    $('.input-item-extra').prop('disabled', true);

    // ketika client dipilih dari Smart Select
    $$(document).on('change', '#client_id', function () {
        var selectEl = this;

        // kalau kosong / "-- CUSTOMER --" jangan apa-apa
        if (!selectEl.value) return;

        var selectedOption = selectEl.options[selectEl.selectedIndex];
        var status = (selectedOption.getAttribute('data-status') || 'NORMAL').toUpperCase();

        if (status !== 'NORMAL') {
            // tampilkan warning dialog
            app.dialog.alert(
                'Customer <b>Bermasalah</b>.<br>Harap cek riwayat pembayarannya sebelum melanjutkan.',
                'Peringatan'
            );
        }
    });
});


// function showPerusahaanInput() {
// 	if ($$("#client_id").val() == 'tambah') {
// 		$("#show-add-perusahaan").show();	
// 		$("#cari-client-dropdown").removeClass('col-100');	
// 		$("#cari-client-dropdown").addClass('col-80');
// 	} else {
// 		$("#show-add-perusahaan").hide();
// 	}
// }

function resetValueQty(count) {
    $$('#qty_' + count).val('100');
    console.log('Reset qty to default: 100');
}

// Author: Crysna Wima - 24 Desember 2025
/**
 * Reset field Harga (price) saat diklik
 * FIX: Izinkan reset jika harga kosong (untuk HCC yang tidak punya harga dari database)
 */
function resetValueHarga(count) {
    console.log('reset harga');

    // Cek apakah field price memiliki data attribute data-is-koper
    var priceField = document.getElementById('price_' + count);
    var isKoper = priceField.getAttribute('data-is-koper') === 'true';
    var currentPrice = priceField.value.replace(/,/g, '').trim();

    // Jika harga kosong atau 0, izinkan reset (tidak dikunci)
    // Ini untuk handle kasus HCC yang tidak punya harga dari database
    if (!currentPrice || currentPrice === '' || parseFloat(currentPrice) === 0) {
        $$('#price_' + count).val('');
        return;
    }

    // Hanya tampilkan alert jika produk adalah koper DAN sudah ada harga fixed
    if (isKoper) {
        app.dialog.alert('Harga produk koper tidak dapat direset karena harga sudah fixed.');
        return;
    }

    $$('#price_' + count).val('');
}

/**
 * Reset field Net Harga (potongan_price) saat diklik
 */
function resetValueNetHarga(count) {
    console.log('reset net harga');
    $$('#potongan_price_' + count).val('');
}

function resetValueBiayaKirim() {
    console.log('reset biaya kirim');
    $$('#biaya_kirim').val('');
}

/**
 * Handle dropdown katalog button click
 * Selalu menampilkan popup pilihan TAS atau KOPER (tidak bergantung checkbox POLO/STOCK)
 */
function handleDropdownKatalog(count) {
    if (typeof count === 'undefined') {
        count = 1; // default untuk backward compatibility
    }
    currentProformaCount = count; // Simpan count yang sedang aktif
    console.log('handleDropdownKatalog - Opening choose catalog type popup for count:', count);
    // Selalu buka popup pilihan TAS atau KOPER
    $$('#openPopupChoose_' + count).click();
}

/**
 * Open katalog by type (dipanggil dari popup pilihan)
 * @param {string} type - 'tas' atau 'koper'
 */
function openKatalogByType(type) {
    console.log('Opening katalog type:', type, 'for count:', currentProformaCount);

    // Tutup popup pilihan
    app.popup.close('.choose-katalog-type-popup');

    // Buka popup sesuai type menggunakan currentProformaCount
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

// End Author

function inputPerusahaan() {
    $$('.perusahaan_database').hide();
    $$('.perusahaan_tambah').show();
    $$('.perusahaan-tambah-input').val('');
    $$('#status_perusahaan').val('perusahaan_tambah');
    selectBoxKotaPerforma();
}

function cariPerusahaan() {
    $$('.perusahaan_database').show();
    $$('.perusahaan_tambah').hide();
    $$('#status_perusahaan').val('perusahaan_database');
    $$('.perusahaan-tambah-input').val('-');
}

/**
 * Function untuk mengisi dropdown material produk TS (POLO)
 * Author: Crysna Wima - 24 Desember 2025
 */
function selectBoxMaterialTs(id_produk_ts, count) {
    if ($('#extra_detail_' + count).val() != 1) {
        var xtra = 1;
    } else {
        var xtra = 0;
    }

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-ts-material",
        dataType: "JSON",
        data: {
            id_produk_ts: id_produk_ts,
        },
        beforeSend: function () {
            // Loading indicator
        },
        success: function (data) {
            var select_box_material = '';
            select_box_material += '<option value="">Pilih Material</option>';

            jQuery.each(data.data, function (i, val) {
                if (val.nama_material === 'ABS') {
                    select_box_material += '<option value="' + val.nama_material + '" data-id="' + val.id_material + '" selected>' + val.nama_material + '</option>';
                } else {
                    select_box_material += '<option value="' + val.nama_material + '" data-id="' + val.id_material + '">' + val.nama_material + '</option>';
                }
            });

            $$('#material_' + count).html(select_box_material);

            // Event handler untuk set id_material saat material berubah
            $$('#material_' + count).on('change', function () {
                var selectElement = this;
                var selectedOption = selectElement.options[selectElement.selectedIndex];
                var id_material = selectedOption ? selectedOption.getAttribute('data-id') : null;

                console.log('Material changed - Setting id_material_' + count + ' to:', id_material);
                $$('#id_material_' + count).val(id_material);
            });

            // Set initial id_material jika ada default selected (ABS)
            var initialSelect = document.getElementById('material_' + count);
            if (initialSelect && initialSelect.selectedIndex > 0) {
                var initialOption = initialSelect.options[initialSelect.selectedIndex];
                var initialIdMaterial = initialOption ? initialOption.getAttribute('data-id') : null;
                $$('#id_material_' + count).val(initialIdMaterial);
                console.log('Initial id_material_' + count + ' set to:', initialIdMaterial);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading material TS:', error);
            app.dialog.alert('Gagal memuat material. Silakan coba lagi.');
        }
    });
}

/**
 * Function untuk mengisi harga material produk TS (POLO)
 * Author: Crysna Wima - 24 Desember 2025
 */
function fillHargaMaterialProdukTs(count) {
    if ($$('#material_' + count).val() != '') {
        // Ambil id_produk_ts dari field hidden
        var id_produk_ts = $$('#id_produk_ts_' + count).val();

        // Jika tidak ada id_produk_ts di field hidden, gunakan value dari ukuran_ts (backward compatibility)
        if (!id_produk_ts || id_produk_ts === '') {
            id_produk_ts = $$('#ukuran_ts_' + count).val();
        }

        // Ambil id_material dari option yang dipilih
        var materialSelect = document.getElementById('material_' + count);
        if (materialSelect && materialSelect.selectedIndex >= 0) {
            var selectedOption = materialSelect.options[materialSelect.selectedIndex];
            var id_material = selectedOption ? selectedOption.getAttribute('data-id') : null;
            $$('#id_material_' + count).val(id_material);
            console.log('fillHargaMaterialProdukTs - Setting id_material_' + count + ' to:', id_material);
        }

        jQuery.ajax({
            type: "POST",
            url: "" + BASE_API + "/get-produk-ts-material-harga",
            dataType: "JSON",
            data: {
                id_produk_ts: id_produk_ts,
                nama_material: $$('#material_' + count).val(),
            },
            beforeSend: function () {
                // Loading
            },
            success: function (data) {
                var price = 0;

                if ($('#extra_detail_' + count).val() != 1) {
                    // Xtra - kalikan 2
                    if (data.data != null) {
                        $$('#harga_material_' + count).val(parseFloat(data.data) * 2);
                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val()) + parseFloat($$('#harga_material_' + count).val());
                    } else {
                        $$('#harga_material_' + count).val(0);
                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                    }
                } else {
                    // Grosir - harga normal
                    if (data.data != null) {
                        $$('#harga_material_' + count).val(data.data);
                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val()) + parseFloat($$('#harga_material_' + count).val());
                    } else {
                        $$('#harga_material_' + count).val(0);
                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                    }
                }

                $$('#price_' + count).val(number_format(price));
                changeTotalValue(count);
                getPotonganTas(count);
            },
            error: function (xhr, status, error) {
                console.error('Error loading material price TS:', error);
                $$('#harga_material_' + count).val(0);
                price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                $$('#price_' + count).val(number_format(price));
                changeTotalValue(count);
            }
        });
    } else {
        $$('#harga_material_' + count).val(0);
        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
        $$('#price_' + count).val(number_format(price));
        changeTotalValue(count);
    }
}

/**
 * Function wrapper untuk handle material HC dan TS
 * Author: Crysna Wima - 24 Desember 2025
 */
function fillHargaMaterialProdukUniversal(count) {
    var tipe = jQuery('#jenis_' + count).val();

    if (tipe && tipe.indexOf("TS") != -1) {
        fillHargaMaterialProdukTs(count);
    } else {
        fillHargaMaterialProduk(count);
    }
}

// ========== ONGKOS KIRIM FUNCTIONS ==========
// Author: Crysna Wima - 24 Desember 2025

/**
 * Initialize ongkir radio button events
 */
function initOngkirEvents() {
    console.log('Initializing ongkir events...');

    // Listen to radio button change
    $$('input[name="status_ongkir"]').on('change', function () {
        var status = $$(this).val();
        console.log('Ongkir status changed to:', status);
        handleOngkirChange(status);
    });

    // Listen to biaya_kirim input change
    $$('#biaya_kirim').on('input change keyup', function () {
        console.log('Biaya kirim changed:', $$(this).val());
        updateGrandTotalWithOngkir();
    });

    // Set initial state
    handleOngkirChange('pending');
}

/**
 * Handle show/hide input nominal
 */
function handleOngkirChange(status) {
    console.log('handleOngkirChange called with:', status);

    if (status === 'nominal') {
        // Show input nominal inline with flex display
        console.log('Showing input nominal inline...');
        $$('#input_nominal_ongkir').css('display', 'flex');
        $$('#biaya_kirim').prop('required', true);
        $$('#biaya_kirim').val(''); // Clear input
    } else {
        // Hide input nominal
        console.log('Hiding input nominal...');
        $$('#input_nominal_ongkir').css('display', 'none');
        $$('#biaya_kirim').val('');
        $$('#biaya_kirim').prop('required', false);
    }

    // Update grand total
    updateGrandTotalWithOngkir();
}

/**
 * Update grand total with ongkir
 */
function updateGrandTotalWithOngkir() {
    // Get total performa (tanpa ongkir)
    var totalPerforma = 0;
    $$(".total-value").each(function () {
        var val = $$(this).val().replace(/\,/g, '');
        if (val !== '') {
            totalPerforma += parseFloat(val) || 0;
        }
    });

    // Get ongkir (hanya jika nominal selected dan ada input)
    var ongkir = 0;
    if ($$('input[name="status_ongkir"]:checked').val() === 'nominal') {
        var biayaKirim = $$('#biaya_kirim').val().replace(/\,/g, '');
        if (biayaKirim !== '') {
            ongkir = parseFloat(biayaKirim) || 0;
        }
    }

    // Calculate grand total
    var grandTotal = totalPerforma + ongkir;

    console.log('Total Performa:', totalPerforma, 'Ongkir:', ongkir, 'Grand Total:', grandTotal);

    // Update display
    $$('#total_performa').html(number_format(grandTotal));
    $$('#total_performa_sum').val(totalPerforma); // Store original total
}

/**
 * Initialize on page ready / page init
 */
// Option 1: Document ready
$$(document).ready(function () {
    console.log('Document ready - initializing ongkir...');

    // Apply mask to biaya_kirim
    if (typeof jQuery !== 'undefined' && jQuery.fn.mask) {
        jQuery('#biaya_kirim').mask('000,000,000,000', { reverse: true });
        console.log('Mask applied to biaya_kirim');
    }

    // Initialize events
    initOngkirEvents();
});

// ========== END ONGKOS KIRIM FUNCTIONS ==========

// ============================================
// POTONGAN HARGA FUNCTIONS
// Author: Crysna Wima - 16 Januari 2026
// ============================================

/**
 * Global variable untuk menyimpan data potongan otomatis
 * Format: { 
 *   count: { 
 *     nominal_potongan: number, 
 *     harga_setelah_potongan: number,
 *     minimal_qty: number
 *   } 
 * }
 */
// FIX CELAH #14: globalPotonganData sudah dideklarasikan di atas (line ~410)
// var globalPotonganData = {}; // REMOVED - duplikat menyebabkan data hilang saat file di-load
if (typeof globalPotonganData === 'undefined') { globalPotonganData = {}; }

/**
 * Get potongan untuk produk KOPER
 * Dipanggil setelah fillHargaProduk() berhasil
 * 
 * @param {number} count - Proforma counter
 */
function getPotonganKoper(count) {
    // Safety check untuk globalPotonganData
    if (typeof globalPotonganData === 'undefined') {
        window.globalPotonganData = {};
    }

    var produk_id = $$('#jenis_' + count).val();
    var id_ukuran = $$('#id_ukuran_hc_' + count).val();
    var qty = $$('#qty_' + count).val() || 0;

    console.log('getPotonganKoper called - count:', count, 'produk_id:', produk_id, 'id_ukuran:', id_ukuran, 'qty:', qty);

    // Validasi produk_id
    if (!produk_id || produk_id === '') {
        console.warn('produk_id tidak valid, skip getPotonganKoper');
        return;
    }

    // Validasi id_ukuran - STRICT CHECK
    if (!id_ukuran || id_ukuran === '' || id_ukuran === 'undefined' || id_ukuran === 'null' || isNaN(id_ukuran)) {
        console.warn('id_ukuran tidak valid (' + id_ukuran + '), skip getPotonganKoper');
        return;
    }

    // Validasi qty
    var qtyInt = parseInt(qty);
    if (isNaN(qtyInt) || qtyInt === 0) {
        console.log('qty = 0 atau invalid, skip getPotonganKoper');
        clearPotonganInfo(count);
        return;
    }

    // ========================================
    // PERBAIKAN: Jangan trigger API jika qty < 100
    // Tapi tetap panggil changeTotalValue untuk auto-fill net harga
    // ========================================
    if (qtyInt < 100) {
        console.log('⚠️ qty < 100, skip API call getPotonganKoper');
        clearPotonganInfo(count);
        // Panggil changeTotalValue untuk trigger autoFillNetHargaBasedOnQty
        changeTotalValue(count);
        return;
    }

    console.log('All validation passed, calling API with id_ukuran:', parseInt(id_ukuran));

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-potongan-koper",
        dataType: "JSON",
        data: {
            produk_id: produk_id,
            id_ukuran: parseInt(id_ukuran),
            qty: qtyInt
        },
        beforeSend: function () {
            // Hide icon copy sementara
            $$('#copy_potongan_icon_' + count).hide();
        },
        success: function (response) {
            if (response.status === 200 && response.data) {
                // Ada potongan
                var potongan = response.data;

                // Simpan data potongan ke global variable
                // NOTE: harga_setelah_potongan akan di-update setelah dihitung dari price aktual
                globalPotonganData[count] = {
                    nominal_potongan: potongan.nominal_potongan,
                    harga_setelah_potongan: potongan.harga_setelah_potongan, // dari API (base only)
                    minimal_qty: potongan.minimal_qty,
                    harga_normal: potongan.harga_normal
                };

                // ========================================
                // TAMPILKAN ICON COPY DI SEBELAH QTY
                // ========================================
                $$('#copy_potongan_icon_' + count).show();

                // ========================================
                // FIX: Hitung harga_setelah_potongan dari PRICE AKTUAL (sudah include style)
                // bukan dari API yang hanya hitung dari harga_ukuran (base price saja).
                // Ini penting agar Full Colour / style lain ikut diperhitungkan.
                // ========================================
                var currentPrice = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;
                var nominalPotongan = parseFloat(potongan.nominal_potongan) || 0;
                var hargaSetelahPotonganAktual = currentPrice - nominalPotongan;

                // Update globalPotonganData dengan nilai aktual
                globalPotonganData[count].harga_setelah_potongan = hargaSetelahPotonganAktual;

                console.log('💡 Potongan calculation:', {
                    currentPrice: currentPrice,
                    nominalPotongan: nominalPotongan,
                    hargaSetelahPotongan_API: potongan.harga_setelah_potongan,
                    hargaSetelahPotongan_AKTUAL: hargaSetelahPotonganAktual
                });

                // TAMPILKAN HARGA SETELAH POTONGAN (dari price aktual)
                $$('#nominal_potongan_display_' + count).text(number_format(hargaSetelahPotonganAktual));
                $$('#nominal_potongan_display_' + count).show();

                console.log('✅ Potongan tersedia - showing copy icon for count:', count);

                // ========================================
                // FIX CELAH APPROVAL: SELALU set potongan_otomatis dari PRICE AKTUAL
                // agar validasi needs_approval bisa membandingkan net harga user
                // vs harga diskon sistem dengan benar.
                // Sebelumnya pakai potongan.harga_setelah_potongan dari API yang
                // hanya hitung dari harga_ukuran, tidak include harga_style.
                // ========================================
                $$('#potongan_otomatis_' + count).val(hargaSetelahPotonganAktual);
                console.log('potongan_otomatis set from ACTUAL price:', hargaSetelahPotonganAktual, '(API was:', potongan.harga_setelah_potongan, ')');

                // FIX: Jangan blindly reset needs_approval ke 0
                // Gunakan applyQtyAndNetPriceColorValidation agar net harga
                // yang sudah diubah manual tetap terdeteksi butuh approval
                applyQtyAndNetPriceColorValidation(count);

                // Hide info dan warning
                $$('#info_potongan_' + count).hide();
                $$('#warning_perubahan_' + count).hide();

            } else {
                // Tidak ada potongan - hide icon copy
                // PERBAIKAN: Jangan clear potongan_price jika sedang edit mode

                if (!isEditMode) {
                    // Mode input baru - clear net harga
                    clearPotonganInfo(count);
                    $$('#potongan_price_' + count).val('');
                    console.log('⚠️ No potongan from API (INPUT mode) - cleared net harga');
                } else {
                    // Mode edit - jangan clear net harga yang sudah ada
                    clearPotonganInfo(count);
                    console.log('⚠️ No potongan from API (EDIT mode) - keeping existing net harga');
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('Error getting potongan koper:', error);
            // PERBAIKAN: Jangan clear net harga di edit mode saat error
            if (!isEditMode) {
                clearPotonganInfo(count);
            }
        }
    });
}

/**
 * Get potongan untuk produk TAS
 * Dipanggil setelah fillHargaMaterialProdukTs() berhasil
 * 
 * @param {number} count - Proforma counter
 */
function getPotonganTas(count) {
    var id_produk_ts = $$('#id_produk_ts_' + count).val() || $$('#ukuran_ts_' + count).val();
    var id_material = $$('#id_material_' + count).val();
    var qty = $$('#qty_' + count).val() || 0;

    // Jika qty = 0 atau belum ada material, skip
    if (parseInt(qty) === 0 || !id_material) {
        clearPotonganInfo(count);
        return;
    }

    // ========================================
    // PERBAIKAN: Jangan trigger API jika qty < 100
    // Tapi tetap panggil changeTotalValue untuk auto-fill net harga
    // ========================================
    var qtyInt = parseInt(qty);
    if (qtyInt < 100) {
        console.log('⚠️ qty < 100, skip API call getPotonganTas');
        clearPotonganInfo(count);
        // Panggil changeTotalValue untuk trigger autoFillNetHargaBasedOnQty
        changeTotalValue(count);
        return;
    }

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-potongan-tas",
        dataType: "JSON",
        data: {
            id_produk_ts: parseInt(id_produk_ts),
            id_material: parseInt(id_material),
            qty: qtyInt
        },
        beforeSend: function () {
            // Hide icon copy sementara
            $$('#copy_potongan_icon_' + count).hide();
        },
        success: function (response) {
            if (response.status === 200 && response.data) {
                // Ada potongan
                var potongan = response.data;

                // Simpan data potongan ke global variable
                globalPotonganData[count] = {
                    nominal_potongan: potongan.nominal_potongan,
                    harga_setelah_potongan: potongan.harga_setelah_potongan,
                    minimal_qty: potongan.minimal_qty,
                    harga_normal: potongan.harga_normal
                };

                // ========================================
                // TAMPILKAN ICON COPY DI SEBELAH QTY
                // ========================================
                $$('#copy_potongan_icon_' + count).show();

                // ========================================
                // FIX: Hitung harga_setelah_potongan dari PRICE AKTUAL
                // (sama seperti fix di getPotonganKoper)
                // ========================================
                var currentPriceTas = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;
                var nominalPotonganTas = parseFloat(potongan.nominal_potongan) || 0;
                var hargaSetelahPotonganAktualTas = currentPriceTas - nominalPotonganTas;

                // Update globalPotonganData dengan nilai aktual
                globalPotonganData[count].harga_setelah_potongan = hargaSetelahPotonganAktualTas;

                console.log('💡 Potongan TAS calculation:', {
                    currentPrice: currentPriceTas,
                    nominalPotongan: nominalPotonganTas,
                    hargaSetelahPotongan_API: potongan.harga_setelah_potongan,
                    hargaSetelahPotongan_AKTUAL: hargaSetelahPotonganAktualTas
                });

                // TAMPILKAN HARGA SETELAH POTONGAN (dari price aktual)
                $$('#nominal_potongan_display_' + count).text(number_format(hargaSetelahPotonganAktualTas));
                $$('#nominal_potongan_display_' + count).show();

                console.log('✅ Potongan TAS tersedia - showing copy icon for count:', count);

                // ========================================
                // FIX: Set potongan_otomatis dari PRICE AKTUAL
                // (sama seperti fix di getPotonganKoper)
                // ========================================
                $$('#potongan_otomatis_' + count).val(hargaSetelahPotonganAktualTas);
                console.log('potongan_otomatis set from ACTUAL price (TAS):', hargaSetelahPotonganAktualTas, '(API was:', potongan.harga_setelah_potongan, ')');

                // FIX: Gunakan applyQtyAndNetPriceColorValidation
                applyQtyAndNetPriceColorValidation(count);

                // Hide info dan warning
                $$('#info_potongan_' + count).hide();
                $$('#warning_perubahan_' + count).hide();

            } else {
                // Tidak ada potongan - hide icon copy
                // PERBAIKAN: Jangan clear potongan_price jika sedang edit mode

                if (!isEditMode) {
                    // Mode input baru - clear net harga
                    clearPotonganInfo(count);
                    $$('#potongan_price_' + count).val('');
                    console.log('⚠️ No potongan TAS from API (INPUT mode) - cleared net harga');
                } else {
                    // Mode edit - jangan clear net harga yang sudah ada
                    clearPotonganInfo(count);
                    console.log('⚠️ No potongan TAS from API (EDIT mode) - keeping existing net harga');
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('Error getting potongan tas:', error);
            // PERBAIKAN: Jangan clear net harga di edit mode saat error
            if (!isEditMode) {
                clearPotonganInfo(count);
            }
        }
    });
}

/**
 * Clear/reset potongan info
 * 
 * @param {number} count - Proforma counter
 */
function clearPotonganInfo(count) {
    // Pastikan globalPotonganData ada dan tidak undefined
    if (typeof globalPotonganData === 'undefined') {
        globalPotonganData = {};
    }

    globalPotonganData[count] = null;

    // ========================================
    // HIDE ICON COPY
    // ========================================
    if ($$('#copy_potongan_icon_' + count).length) {
        $$('#copy_potongan_icon_' + count).hide();
    }
    // HIDE NOMINAL POTONGAN
    if ($$('#nominal_potongan_display_' + count).length) {
        $$('#nominal_potongan_display_' + count).hide();
    }


    // Safe check untuk element sebelum manipulasi
    if ($$('#info_potongan_' + count).length) {
        $$('#info_potongan_' + count).hide();
    }
    if ($$('#warning_perubahan_' + count).length) {
        $$('#warning_perubahan_' + count).hide();
    }
    if ($$('#potongan_otomatis_' + count).length) {
        $$('#potongan_otomatis_' + count).val('');
    }
    if ($$('#potongan_price_' + count).length) {
        $$('#potongan_price_' + count).css('color', ''); // Reset warna ke normal
    }
    if ($$('#qty_' + count).length) {
        $$('#qty_' + count).css('color', ''); // Reset warna qty
    }
    if ($$('#needs_approval_' + count).length) {
        $$('#needs_approval_' + count).val(0);
    }

    // Reset button text ke "Simpan"
    if (typeof updateButtonText === 'function') {
        updateButtonText();
    }
}

/**
 * Validate perubahan net harga
 * Dipanggil saat user blur dari field potongan_price
 * 
 * @param {number} count - Proforma counter
 */
function validateNetHargaChange(count) {
    var net_harga_input = $$('#potongan_price_' + count).val().replace(/\,/g, '');
    var potongan_otomatis = $$('#potongan_otomatis_' + count).val();
    var qty = parseFloat($$('#qty_' + count).val()) || 0;

    // Convert ke number
    var net_harga = parseFloat(net_harga_input) || 0;
    var harga_otomatis = parseFloat(potongan_otomatis) || 0;

    // ========================================
    // LOGIKA VALIDASI NET HARGA (UPDATED):
    // ========================================
    // 1. Jika Net Harga kosong → NORMAL (no approval)
    // 2. Jika Net Harga SAMA dengan potongan otomatis → NORMAL (no approval)
    // 2b. Jika Net Harga SAMA dengan harga normal (price) → NORMAL (no approval)
    // 3. Jika qty >= 50 DAN TIDAK ada potongan otomatis → NORMAL (no approval) - user bebas isi
    // 4. Jika ADA potongan otomatis DAN net harga beda dari potongan DAN beda dari price → ORANGE (pengajuan)
    // 5. Jika qty < 50 → NORMAL (no approval) - auto-fill harga + 10000

    var needsApproval = 0; // 0 = no approval, 1 = pengajuan
    var reason = '';
    var color = '';

    // Ambil harga normal (price = harga_satuan + harga_style)
    var normalPrice = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;

    if (net_harga === 0) {
        // Case 1: Net Harga kosong → NORMAL
        needsApproval = 0;
        color = '';
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' kosong');

    } else if (harga_otomatis > 0 && net_harga === harga_otomatis) {
        // Case 2: Net Harga SAMA dengan potongan otomatis → NORMAL (tidak peduli qty)
        needsApproval = 0;
        color = '';

        // HILANGKAN warning text
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' sama dengan potongan otomatis - NO APPROVAL');

    } else if (normalPrice > 0 && net_harga === normalPrice) {
        // Case 2b: Net Harga SAMA dengan harga normal (price) → NORMAL
        // User memilih harga normal tanpa diskon → tidak perlu approval
        needsApproval = 0;
        color = '';

        // HILANGKAN warning text
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' sama dengan harga normal (' + normalPrice + ') - NO APPROVAL');

    } else if (qty >= 50 && (!potongan_otomatis || potongan_otomatis === '' || harga_otomatis === 0)) {
        // Case 3: QTY >= 50 DAN TIDAK ada potongan otomatis → NORMAL (no approval)
        // User bebas isi net harga, tidak perlu pengajuan
        needsApproval = 0;
        color = '';

        // HILANGKAN warning text
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' qty >= 50, tidak ada potongan otomatis - NO APPROVAL (qty=' + qty + ')');

    } else if (harga_otomatis > 0 && net_harga !== harga_otomatis && net_harga !== normalPrice) {
        // Case 4: ADA potongan otomatis DAN net harga beda dari potongan DAN beda dari price → ORANGE (pengajuan)
        // Artinya user input harga custom yang bukan harga normal dan bukan harga diskon
        needsApproval = 1; // Pengajuan
        color = '#FF9800'; // Orange

        // HILANGKAN warning text
        $$('#warning_perubahan_' + count).hide();

        console.log('⚠️ Net Harga #' + count + ' needs approval: net harga (' + net_harga + ') beda dari potongan (' + harga_otomatis + ') DAN price (' + normalPrice + ')');

    } else if (qty < 50 && (!potongan_otomatis || potongan_otomatis === '' || harga_otomatis === 0)) {
        // Case 5: QTY < 50 DAN tidak ada potongan otomatis → NORMAL (no approval)
        needsApproval = 0;
        color = '';

        // HILANGKAN warning text
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' qty < 50, tidak ada potongan otomatis - NO APPROVAL (qty=' + qty + ')');

    } else {
        // Fallback: kondisi lain yang tidak terdefinisi
        needsApproval = 0;
        color = '';
        $$('#warning_perubahan_' + count).hide();
        console.log('✅ Net Harga #' + count + ' fallback case - NO APPROVAL');
    }

    // Set needs approval flag dan warna
    $$('#needs_approval_' + count).val(needsApproval);

    // Set warna input net harga dan qty
    $$('#potongan_price_' + count).css('color', color);
    $$('#qty_' + count).css('color', color);

    // Update button text
    updateButtonText();

    // JANGAN panggil changeTotalValue di sini untuk menghindari rekursif
    // changeTotalValue sudah dipanggil dari event handler lain
}

/**
 * Update button text berdasarkan apakah ada item yang needs approval
 */
function updateButtonText() {
    var has_approval = false;

    // Check semua proforma items untuk approval
    $$('.performa-input.input-item-needs-approval').each(function () {
        var level = parseInt($$(this).val()) || 0;
        if (level > 0) {
            has_approval = true;
            return false; // break
        }
    });

    // Update button
    if (has_approval) {
        // Ada approval: Pengajuan (warna sesuai dengan warna input tertinggi)
        $$('#performa_input_button_save span').text('Ajukan Persetujuan');
        $$('#performa_input_button_save').css('background', '#FF9800'); // Orange
        $$('#performa_input_button_save').css('color', '#fff');
    } else {
        // Tidak ada approval: Normal
        $$('#performa_input_button_save span').text('Simpan');
        $$('#performa_input_button_save').css('background', '');
        $$('#performa_input_button_save').css('color', '');
    }
}

/**
 * Show preview tier potongan (optional - untuk info user)
 * Bisa dipanggil saat user tap pada info potongan
 * 
 * @param {number} count - Proforma counter
 */
function showTierPotonganPreview(count) {
    var tipe = jQuery('#jenis_' + count).val();

    if (tipe && tipe.indexOf("HC") != -1) {
        // Koper
        var produk_id = $$('#jenis_' + count).val();
        var id_ukuran = $$('#id_ukuran_hc_' + count).val();

        jQuery.ajax({
            type: "POST",
            url: BASE_API + "/get-all-tier-potongan-koper",
            dataType: "JSON",
            data: {
                produk_id: produk_id,
                id_ukuran: parseInt(id_ukuran)
            },
            success: function (response) {
                if (response.status === 200 && response.data.length > 0) {
                    var html = '<div style="padding: 10px;"><h4>Tier Potongan Tersedia:</h4><table style="width: 100%; border-collapse: collapse;">';
                    html += '<tr style="border-bottom: 1px solid #ddd;"><th>Min Qty</th><th>Potongan/pcs</th><th>Harga Netto</th></tr>';

                    response.data.forEach(function (tier) {
                        html += '<tr style="border-bottom: 1px solid #ddd;">';
                        html += '<td>' + tier.minimal_qty + ' pcs</td>';
                        html += '<td>Rp ' + number_format(tier.nominal_potongan) + '</td>';
                        html += '<td>Rp ' + number_format(tier.harga_setelah_potongan) + '</td>';
                        html += '</tr>';
                    });

                    html += '</table></div>';

                    app.dialog.alert(html, 'Info Potongan');
                } else {
                    app.dialog.alert('Tidak ada tier potongan untuk produk ini', 'Info');
                }
            }
        });

    } else if (tipe && tipe.indexOf("TAS") != -1) {
        // Tas
        var id_produk_ts = $$('#id_produk_ts_' + count).val() || $$('#ukuran_ts_' + count).val();
        var id_material = $$('#id_material_' + count).val();

        jQuery.ajax({
            type: "POST",
            url: BASE_API + "/get-all-tier-potongan-tas",
            dataType: "JSON",
            data: {
                id_produk_ts: parseInt(id_produk_ts),
                id_material: parseInt(id_material)
            },
            success: function (response) {
                if (response.status === 200 && response.data.length > 0) {
                    var html = '<div style="padding: 10px;"><h4>Tier Potongan Tersedia:</h4><table style="width: 100%; border-collapse: collapse;">';
                    html += '<tr style="border-bottom: 1px solid #ddd;"><th>Min Qty</th><th>Potongan/pcs</th><th>Harga Netto</th></tr>';

                    response.data.forEach(function (tier) {
                        html += '<tr style="border-bottom: 1px solid #ddd;">';
                        html += '<td>' + tier.minimal_qty + ' pcs</td>';
                        html += '<td>Rp ' + number_format(tier.nominal_potongan) + '</td>';
                        html += '<td>Rp ' + number_format(tier.harga_setelah_potongan) + '</td>';
                        html += '</tr>';
                    });

                    html += '</table></div>';

                    app.dialog.alert(html, 'Info Potongan');
                } else {
                    app.dialog.alert('Tidak ada tier potongan untuk produk ini', 'Info');
                }
            }
        });
    }
}

// ============================================
// MODIFY EXISTING FUNCTIONS
// ============================================

/**
 * MODIFY: fillHargaProduk (untuk KOPER)
 * Tambahkan call getPotonganKoper() setelah berhasil get harga
 * 
 * Di dalam success callback dari fillHargaProduk(), tambahkan:
 */
/*
function fillHargaProduk(count) {
    // ... existing code ...
	
    jQuery.ajax({
        // ... existing ajax config ...
        success: function(data) {
            // ... existing code untuk set harga ...
        	
            // TAMBAHKAN INI:
            // Get potongan otomatis
            getPotonganKoper(count);
        }
    });
}
*/

/**
 * MODIFY: fillHargaMaterialProdukTs (untuk TAS)
 * Tambahkan call getPotonganTas() setelah berhasil get harga material
 * 
 * Di dalam success callback dari fillHargaMaterialProdukTs(), tambahkan:
 */
/*
function fillHargaMaterialProdukTs(count) {
    // ... existing code ...
	
    jQuery.ajax({
        // ... existing ajax config ...
        success: function(data) {
            // ... existing code untuk set harga ...
        	
            // TAMBAHKAN INI:
            // Get potongan otomatis
            getPotonganTas(count);
        }
    });
}
*/

/**
 * MODIFY: changeTotalValue
 * Tambahkan validasi net harga setelah calculate total
 */
/*
function changeTotalValue(count) {
    // ... existing code untuk calculate total ...
	
    // TAMBAHKAN INI DI AKHIR:
    // Validate net harga (tapi jangan trigger infinite loop)
    // validateNetHargaChange(count); // Optional, bisa dipanggil manual saat blur
}
*/

/**
 * MODIFY: performaProcess (submit form)
 * Tambahkan field needs_approval ke FormData
 */
/*
function performaProcess() {
    // ... existing code ...
	
    // Di loop untuk append data per item:
    for (var i = 1; i <= count_performa; i++) {
        // ... existing append fields ...
    	
        // TAMBAHKAN INI:
        form_data.append('needs_approval[]', $('#needs_approval_' + i).val() || 0);
        form_data.append('potongan_otomatis[]', $('#potongan_otomatis_' + i).val() || '');
    }
	
    // ... rest of code ...
}
*/

// ============================================
// EVENT LISTENERS - INIT ON DOCUMENT READY
// ============================================

// $$(document).on('page:init', '.page[data-name="performa_input"]', function() {
// 	console.log('Performa Input page initialized - setting up potongan events');

// 	// Event listener untuk qty change - recalculate potongan
// 	$$(document).on('change', '.performa-input.input-item-qty', function() {
// 		var count = $$(this).attr('id').replace('qty_', '');
// 		// PERBAIKAN: Cek apakah sedang dalam mode edit

// 		if (isEditMode) {
// 			console.log('⏭️ Qty changed in EDIT mode - SKIP clearing net harga for #' + count);
// 			// Dalam edit mode, JANGAN kosongkan Net Harga
// 			// Biarkan Net Harga tetap ada dari database

// 			// Tapi tetap trigger getPotongan untuk update icon/nominal
// 			setTimeout(function() {
// 				var tipe = jQuery('#jenis_' + count).val();

// 				if (tipe && tipe.indexOf("HC") != -1) {
// 					getPotonganKoper(count);
// 				} else if (tipe && tipe.indexOf("TAS") != -1) {
// 					getPotonganTas(count);
// 				}
// 			}, 100);

// 			return; // SKIP rest of function
// 		}


// 		// SECURITY FIX: Kosongkan Net Harga saat qty berubah
// 		// Karena potongan berubah, net harga lama tidak relevan
// 		console.log('🔄 Qty changed for #' + count + ' - clearing net harga');
// 		$$('#potongan_price_' + count).val('');
// 		$$('#potongan_otomatis_' + count).val('');
// 		$$('#needs_approval_' + count).val(0);
// 		$$('#potongan_price_' + count).css('color', '');
// 		$$('#qty_' + count).css('color', '');
// 		$$('#info_potongan_' + count).hide();
// 		$$('#warning_perubahan_' + count).hide();

// 		// Update button text
// 		updateButtonText();

// 		// Delay sedikit untuk ensure qty sudah terupdate
// 		setTimeout(function() {
// 			var tipe = jQuery('#jenis_' + count).val();

// 			if (tipe && tipe.indexOf("HC") != -1) {
// 				// Koper - recalculate potongan
// 				getPotonganKoper(count);
// 			} else if (tipe && tipe.indexOf("TAS") != -1) {
// 				// Tas - recalculate potongan
// 				getPotonganTas(count);
// 			}
// 		}, 100);
// 	});

// 	// Event listener untuk net harga input - recalculate total realtime
// 	$$(document).on('input', '.performa-input.input-item-potongan-price', function() {
// 		var count = $$(this).attr('id').replace('potongan_price_', '');
// 		// Recalculate total dengan net harga baru
// 		changeTotalValue(count);
// 	});

// 	// Event listener untuk net harga blur - validate perubahan (warna merah jika beda)
// 	$$(document).on('blur', '.performa-input.input-item-potongan-price', function() {
// 		var count = $$(this).attr('id').replace('potongan_price_', '');
// 		validateNetHargaChange(count);
// 	});

// 	// Event listener untuk tap info potongan - show tier preview
// 	$$(document).on('click', '.show-potongan-info', function() {
// 		var count = $$(this).attr('data-count');
// 		showTierPotonganPreview(count);
// 	});
// });

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check apakah ada perubahan net harga yang perlu approval
 * @returns {boolean}
 */
function hasNeedsApproval() {
    var has_approval = false;
    $$('.performa-input.input-item-needs-approval').each(function () {
        if ($$(this).val() == '1') {
            has_approval = true;
            return false; // break
        }
    });
    return has_approval;
}

/**
 * Get summary potongan untuk display
 * @returns {object} { total_potongan: number, count_items: number }
 */
function getPotonganSummary() {
    var total_potongan = 0;
    var count_items = 0;

    for (var key in globalPotonganData) {
        if (globalPotonganData[key]) {
            var qty = parseFloat($$('#qty_' + key).val()) || 0;
            var nominal = globalPotonganData[key].nominal_potongan || 0;
            total_potongan += (qty * nominal);
            count_items++;
        }
    }

    return {
        total_potongan: total_potongan,
        count_items: count_items
    };
}

/**
 * Copy potongan otomatis ke field Net Harga
 * Dipanggil saat user klik icon copy
 * 
 * @param {number} count - Proforma counter
 */
function copyPotonganToNetHarga(count) {
    var potongan_otomatis = $$('#potongan_otomatis_' + count).val();

    if (potongan_otomatis && parseFloat(potongan_otomatis) > 0) {
        // Set net harga dengan value potongan otomatis
        $$('#potongan_price_' + count).val(number_format(potongan_otomatis));

        // Reset warna dan flags
        $$('#potongan_price_' + count).css('color', '');
        $$('#qty_' + count).css('color', '');
        $$('#needs_approval_' + count).val(0);

        // Update button text
        updateButtonText();

        // Recalculate total
        changeTotalValue(count);
        // Sembunyikan nominal potongan setelah di-copy
        $$('#nominal_potongan_display_' + count).hide();


        // Show feedback
        app.toast.create({
            text: '✓ Potongan berhasil diterapkan',
            position: 'center',
            closeTimeout: 1500
        }).open();

        console.log('✅ Copied potongan to Net Harga #' + count + ':', potongan_otomatis);
    } else {
        app.dialog.alert('Tidak ada potongan otomatis yang tersedia');
    }
}

/**
 * Handle input net harga realtime (untuk recalculate total)
 * Dipanggil saat user mengetik di field potongan_price
 * 
 * @param {number} count - Proforma counter
 */
function handleNetHargaInput(count) {
    // Recalculate total dengan net harga baru
    changeTotalValue(count);
}

$$(document).on('page:init', '.page[data-name="performa_input"]', function () {
    console.log('Performa Input page initialized - setting up potongan events');

    // Event listener untuk qty change - recalculate potongan
    $$(document).on('change', '.performa-input.input-item-qty', function () {
        var count = $$(this).attr('id').replace('qty_', '');
        // PERBAIKAN: Cek apakah sedang dalam mode edit

        // ========================================
        // FIX CELAH #6: Bedakan initial load vs user interaction di edit mode
        // Saat initial load (is_editing flag = true) → jangan clear net harga
        // Saat user UBAH qty manual → clear net harga karena sudah tidak relevan
        // ========================================
        var isInitialLoad = $$('#is_editing_' + count).length && $$('#is_editing_' + count).val() === 'true';

        if (isEditMode && isInitialLoad) {
            console.log('⏭️ Qty changed in EDIT mode (initial load) - SKIP clearing net harga for #' + count);
            // Dalam edit mode, JANGAN kosongkan Net Harga
            // Biarkan Net Harga tetap ada dari database

            // Tapi tetap trigger getPotongan untuk update icon/nominal
            setTimeout(function () {
                var tipe = jQuery('#jenis_' + count).val();

                if (tipe && tipe.indexOf("HC") != -1) {
                    getPotonganKoper(count);
                } else if (tipe && tipe.indexOf("TAS") != -1) {
                    getPotonganTas(count);
                }
            }, 100);

            return; // SKIP rest of function
        }


        // SECURITY FIX: Kosongkan Net Harga saat qty berubah
        // Karena potongan berubah, net harga lama tidak relevan
        console.log('🔄 Qty changed for #' + count + ' - clearing net harga');
        $$('#potongan_price_' + count).val('');
        $$('#potongan_otomatis_' + count).val('');
        $$('#needs_approval_' + count).val(0);
        $$('#potongan_price_' + count).css('color', '');
        $$('#qty_' + count).css('color', '');
        $$('#info_potongan_' + count).hide();
        $$('#warning_perubahan_' + count).hide();

        // Update button text
        updateButtonText();

        // Delay sedikit untuk ensure qty sudah terupdate
        setTimeout(function () {
            var tipe = jQuery('#jenis_' + count).val();

            if (tipe && tipe.indexOf("HC") != -1) {
                // Koper - recalculate potongan
                getPotonganKoper(count);
            } else if (tipe && tipe.indexOf("TAS") != -1) {
                // Tas - recalculate potongan
                getPotonganTas(count);
            }
        }, 100);
    });

    // Event listener untuk net harga input - recalculate total realtime
    $$(document).on('input', '.performa-input.input-item-potongan-price', function () {
        var count = $$(this).attr('id').replace('potongan_price_', '');
        // Recalculate total dengan net harga baru
        handleNetHargaInput(count);
    });

    // Event listener untuk net harga blur - validate perubahan (warna orange jika beda)
    $$(document).on('blur', '.performa-input.input-item-potongan-price', function () {
        var count = $$(this).attr('id').replace('potongan_price_', '');
        validateNetHargaChange(count);
    });

    // Event listener untuk tap info potongan - show tier preview
    $$(document).on('click', '.show-potongan-info', function () {
        var count = $$(this).attr('data-count');
        showTierPotonganPreview(count);
    });

    // Event listener untuk click icon copy potongan
    $$(document).on('click', '.icon-copy-potongan', function () {
        var count = $$(this).attr('id').replace('copy_potongan_icon_', '');
        copyPotonganToNetHarga(count);
    });
});

var phoneCheckInProgress = false;
var phoneCheckResult = null;

/**
 * Check apakah nomor telepon client sudah terdaftar
 * Dipanggil saat user blur dari input telepon
 */
function checkClientPhoneExists() {
    var telepon = jQuery('#telepon').val();
    var user_id = localStorage.getItem("user_id");

    // Reset message
    jQuery('#phone_check_message').hide();

    // Validasi input
    if (!telepon || telepon.trim() === '') {
        return;
    }

    if (!user_id) {
        console.error('User ID tidak ditemukan');
        return;
    }

    // Bersihkan nomor telepon dari spasi dan karakter khusus
    var clean_phone = telepon.replace(/[^0-9]/g, '');

    if (clean_phone.length < 10) {
        showPhoneCheckMessage('Nomor telepon terlalu pendek', 'warning');
        phoneCheckResult = null;
        return;
    }

    // Set flag
    phoneCheckInProgress = true;

    // Show loading
    app.dialog.preloader('Memeriksa nomor telepon...');

    // AJAX request ke backend
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/check-client-phone",
        dataType: 'JSON',
        data: {
            client_telp: clean_phone,
            user_id: user_id
        },
        success: function (response) {
            app.dialog.close();
            phoneCheckInProgress = false;

            if (response.exists) {
                // Nomor sudah terdaftar
                phoneCheckResult = 'exists';
                showPhoneCheckMessage(
                    '⚠️ ' + response.message,
                    'error'
                );

                // Tampilkan dialog konfirmasi
                app.dialog.alert(
                    'Nomor telepon sudah terdaftar' + '<br><br>' +
                    'Nomor telepon ' + telepon + ' sudah terdaftar untuk client:<br><br>' +
                    '<strong>' + response.data.client_nama + '</strong><br>' +
                    response.data.client_kota + '<br><br>',
                    function () {
                        jQuery('#telepon').focus();
                    }
                );
            } else {
                // Nomor tersedia
                phoneCheckResult = 'available';
                showPhoneCheckMessage(
                    '✓ Nomor telepon tersedia',
                    'success'
                );

                // Auto hide setelah 3 detik
                setTimeout(function () {
                    jQuery('#phone_check_message').fadeOut();
                }, 3000);
            }
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            phoneCheckInProgress = false;
            phoneCheckResult = null;

            console.error('Error checking phone:', error);
            showPhoneCheckMessage(
                '⚠️ Gagal memeriksa nomor telepon',
                'warning'
            );
        }
    });
}

/**
 * Tampilkan pesan hasil pengecekan telepon
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe pesan: 'success', 'error', 'warning'
 */
function showPhoneCheckMessage(message, type) {
    var messageEl = jQuery('#phone_check_message');

    // Set warna sesuai tipe
    var color = '';
    switch (type) {
        case 'success':
            color = '#4CAF50'; // Hijau
            break;
        case 'error':
            color = '#F44336'; // Merah
            break;
        case 'warning':
            color = '#FF9800'; // Orange
            break;
        default:
            color = '#888';
    }

    // Tampilkan pesan
    messageEl.html(message);
    messageEl.css('color', color);
    messageEl.css('font-size', '12px');
    messageEl.css('margin-top', '5px');
    messageEl.fadeIn();
}

/**
 * Validasi sebelum submit form
 * Cek apakah ada phone check yang masih dalam progress
 */
function validatePhoneBeforeSubmit() {
    if (phoneCheckInProgress) {
        app.dialog.alert('Mohon tunggu pengecekan nomor telepon selesai');
        return false;
    }

    // Jika nomor sudah ada dan belum dikonfirmasi, tanya lagi
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

/**
 * Convert produk_id ke API-ready code
 * Jika produk_id adalah koper custom (HCC), convert ke similarity code
 * Jika bukan, return as-is
 * 
 * @param {string} produk_id - Produk ID dari input (bisa HCC, HC-112, TAS, dll)
 * @returns {string} - API-ready produk_id
 */
function getApiReadyProdukId(produk_id) {
    if (!produk_id) return produk_id;

    var upperProdukId = produk_id.toUpperCase();

    // Cek apakah ini koper custom
    if (CUSTOM_SIMILARITY_CODES[upperProdukId]) {
        // Return similarity code untuk custom koper
        return CUSTOM_SIMILARITY_CODES[upperProdukId];
    }

    // Bukan custom koper, return as-is
    return produk_id;
}