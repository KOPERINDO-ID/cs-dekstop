// ========================================
// DROPDOWN/SELECT BOX FUNCTIONS
// ========================================

/**
 * Select box untuk client dropdown
 */
function selectBoxClient() {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-client",
        dataType: "JSON",
        data: {
            user_id: localStorage.getItem("user_id")
        },
        success: function (data) {
            var select_box_client_id = '';
            select_box_client_id += '<option value="" selected>-- CUSTOMER --</option>';

            jQuery.each(data.data, function (i, val) {
                var status = (val.status_pembayaran_client || 'NORMAL').toUpperCase();
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
                var wilayah = (val.wilayah || '').toUpperCase();

                select_box_client_id +=
                    '<option value="' + val.client_id + '" ' +
                    'data-status="' + status + '" ' +
                    'data-option-class="' + optionClass + '" ' +
                    'data-wilayah="' + wilayah + '">' +
                    textOption +
                    '</option>';
            });

            $$('#client_id').html(select_box_client_id);
            $$('.perusahaan_database .item-after').html('CUSTOMER');

            setupPayBadgeForSmartSelect();
            setupSmartSelectPopupStyling();
        }
    });
}

/**
 * Select box untuk kota performa
 */
function selectBoxKotaPerforma() {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-kota",
        dataType: "JSON",
        data: {
            user_id: localStorage.getItem("user_id")
        },
        success: function (data) {
            var select_box_kota = '';
            select_box_kota += '<option value="" selected>-- PILIH KOTA --</option>';

            jQuery.each(data.data, function (i, val) {
                select_box_kota += '<option value="' + val.kota_id + '">' + val.kota_nama + '</option>';
            });

            $$('#kota').html(select_box_kota);
        }
    });
}

/**
 * Select box untuk ukuran koper
 */
function selectBoxUkuran(count, produk_id) {
    console.log('selectBoxUkuran called - count:', count, 'produk_id:', produk_id);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-ukuran",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_ukuran = '';
            select_box_ukuran += '<option value="none" selected>-- PILIH UKURAN --</option>';

            jQuery.each(data.data, function (i, val) {
                select_box_ukuran += '<option value="' + val.id_ukuran + '">' + val.nama_ukuran + '</option>';
            });

            $$('#ukuran_hc_' + count).html(select_box_ukuran);
        }
    });
}

/**
 * Select box untuk style koper
 */
function selectBoxStyle(count, produk_id) {
    console.log('selectBoxStyle called - count:', count, 'produk_id:', produk_id);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-style",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_style = '';
            select_box_style += '<option value="0" selected>-- PILIH STYLE --</option>';

            jQuery.each(data.data, function (i, val) {
                select_box_style += '<option value="' + val.id_style + '">' + val.nama_style + '</option>';
            });

            $$('#style_hc_' + count).html(select_box_style);
        }
    });
}

/**
 * Select box untuk material koper
 */
function selectBoxMaterial(count, produk_id) {
    console.log('selectBoxMaterial called - count:', count, 'produk_id:', produk_id);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-material",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_material = '';
            select_box_material += '<option value="0" selected>-- PILIH MATERIAL --</option>';

            jQuery.each(data.data, function (i, val) {
                select_box_material += '<option value="' + val.id_material + '">' + val.nama_material + '</option>';
            });

            $$('#material_hc_' + count).html(select_box_material);
        }
    });
}

/**
 * Select box untuk ukuran TAS
 */
function selectBoxTS(count) {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-tas-ukuran",
        dataType: "JSON",
        success: function (data) {
            var select_box_ts = '';
            select_box_ts += '<option value="none" selected>-- PILIH UKURAN --</option>';

            jQuery.each(data.data, function (i, val) {
                select_box_ts += '<option value="' + val.id_ukuran_tas + '">' + val.nama_ukuran_tas + '</option>';
            });

            $$('#ukuran_ts_' + count).html(select_box_ts);
        }
    });
}

/**
 * Select box untuk material TAS
 */
function selectBoxMaterialTs(count) {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-tas-material",
        dataType: "JSON",
        success: function (data) {
            var select_box_material_ts = '';
            select_box_material_ts += '<option value="0" selected>-- PILIH MATERIAL --</option>';

            jQuery.each(data.data, function (i, val) {
                select_box_material_ts += '<option value="' + val.id_material_tas + '">' + val.nama_material_tas + '</option>';
            });

            $$('#material_ts_' + count).html(select_box_material_ts);
        }
    });
}

/**
 * Load ukuran dropdown untuk edit mode
 */
function loadUkuranForEdit(count, produk_id, selectedUkuranId) {
    console.log('loadUkuranForEdit - count:', count, 'produk_id:', produk_id, 'selectedUkuranId:', selectedUkuranId);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-ukuran",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_ukuran = '';
            select_box_ukuran += '<option value="none">-- PILIH UKURAN --</option>';

            jQuery.each(data.data, function (i, val) {
                var selected = (val.id_ukuran == selectedUkuranId) ? 'selected' : '';
                select_box_ukuran += '<option value="' + val.id_ukuran + '" ' + selected + '>' + val.nama_ukuran + '</option>';
            });

            $$('#ukuran_hc_' + count).html(select_box_ukuran);
        }
    });
}

/**
 * Load material dropdown untuk edit mode
 */
function loadMaterialForEdit(count, produk_id, selectedMaterialId) {
    console.log('loadMaterialForEdit - count:', count, 'produk_id:', produk_id, 'selectedMaterialId:', selectedMaterialId);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-material",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_material = '';
            select_box_material += '<option value="0">-- PILIH MATERIAL --</option>';

            jQuery.each(data.data, function (i, val) {
                var selected = (val.id_material == selectedMaterialId) ? 'selected' : '';
                select_box_material += '<option value="' + val.id_material + '" ' + selected + '>' + val.nama_material + '</option>';
            });

            $$('#material_hc_' + count).html(select_box_material);
        }
    });
}

/**
 * Load style dropdown untuk edit mode
 */
function loadStyleForEdit(count, produk_id, selectedStyleId) {
    console.log('loadStyleForEdit - count:', count, 'produk_id:', produk_id, 'selectedStyleId:', selectedStyleId);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-style",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_style = '';
            select_box_style += '<option value="0">-- PILIH STYLE --</option>';

            jQuery.each(data.data, function (i, val) {
                var selected = (val.id_style == selectedStyleId) ? 'selected' : '';
                select_box_style += '<option value="' + val.id_style + '" ' + selected + '>' + val.nama_style + '</option>';
            });

            $$('#style_hc_' + count).html(select_box_style);
        }
    });
}

/**
 * Load ukuran with callback
 */
function loadUkuranForEditWithCallback(count, produk_id, selectedUkuranId, callback) {
    console.log('loadUkuranForEditWithCallback - count:', count, 'produk_id:', produk_id);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-ukuran",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_ukuran = '';
            select_box_ukuran += '<option value="none">-- PILIH UKURAN --</option>';

            jQuery.each(data.data, function (i, val) {
                var selected = (val.id_ukuran == selectedUkuranId) ? 'selected' : '';
                select_box_ukuran += '<option value="' + val.id_ukuran + '" ' + selected + '>' + val.nama_ukuran + '</option>';
            });

            $$('#ukuran_hc_' + count).html(select_box_ukuran);

            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    });
}

/**
 * Load material with callback
 */
function loadMaterialForEditWithCallback(count, produk_id, selectedMaterialId, callback) {
    console.log('loadMaterialForEditWithCallback - count:', count, 'produk_id:', produk_id);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-material",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_material = '';
            select_box_material += '<option value="0">-- PILIH MATERIAL --</option>';

            jQuery.each(data.data, function (i, val) {
                var selected = (val.id_material == selectedMaterialId) ? 'selected' : '';
                select_box_material += '<option value="' + val.id_material + '" ' + selected + '>' + val.nama_material + '</option>';
            });

            $$('#material_hc_' + count).html(select_box_material);

            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    });
}

/**
 * Load style with callback
 */
function loadStyleForEditWithCallback(count, produk_id, selectedStyleId, callback) {
    console.log('loadStyleForEditWithCallback - count:', count, 'produk_id:', produk_id);

    var apiReadyProdukId = getApiReadyProdukId(produk_id);

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-style",
        dataType: "JSON",
        data: {
            produk_id: apiReadyProdukId
        },
        success: function (data) {
            var select_box_style = '';
            select_box_style += '<option value="0">-- PILIH STYLE --</option>';

            jQuery.each(data.data, function (i, val) {
                var selected = (val.id_style == selectedStyleId) ? 'selected' : '';
                select_box_style += '<option value="' + val.id_style + '" ' + selected + '>' + val.nama_style + '</option>';
            });

            $$('#style_hc_' + count).html(select_box_style);

            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    });
}