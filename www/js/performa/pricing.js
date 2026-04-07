// ========================================
// PRICE CALCULATION FUNCTIONS
// ========================================

/**
 * Fill harga produk koper
 */
function fillHargaProduk(count) {
    var tipe = jQuery('#jenis_' + count).val();
    var productInfo = detectProductType(tipe);

    if (productInfo.isCustom) {
        var produk_id = getCustomSimilarityCode(productInfo.type);
    } else {
        var produk_id = tipe;
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
        success: function (data) {
            var price = 0;
            if ($$('#ukuran_hc_' + count).val() != '' && $$('#ukuran_hc_' + count).val() != 'none') {
                if (xtra == 1) {
                    if (data.data.harga_ukuran != 0) {
                        $$('#harga_satuan_' + count).val(data.data.harga_ukuran);

                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);

                        setTimeout(function () {
                            getPotonganKoper(count);
                        }, 150);
                    } else {
                        console.log('⚠️ Harga Ukuran ' + message + ' tidak ada');
                        $$('#harga_satuan_' + count).val(0);
                        $$('#price_' + count).val('');
                        $$('#total_' + count).val('');

                        if (productInfo.isCustom) {
                            var priceField = document.getElementById('price_' + count);
                            if (priceField) {
                                priceField.readOnly = false;
                                priceField.removeAttribute('data-is-koper');
                            }
                        }
                    }
                } else {
                    if (data.data.harga_ukuran_grosir != 0) {
                        $$('#harga_satuan_' + count).val(data.data.harga_ukuran_grosir);

                        price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);

                        setTimeout(function () {
                            getPotonganKoper(count);
                        }, 150);
                    } else {
                        console.log('⚠️ Harga Ukuran ' + message + ' tidak ada');
                        $$('#harga_satuan_' + count).val(0);
                        $$('#price_' + count).val('');
                        $$('#total_' + count).val('');

                        if (productInfo.isCustom) {
                            var priceField = document.getElementById('price_' + count);
                            if (priceField) {
                                priceField.readOnly = false;
                                priceField.removeAttribute('data-is-koper');
                            }
                        }
                    }
                }
            }
        }
    });
}

/**
 * Fill harga variasi produk (style)
 */
function fillHargaVariasiProduk(count) {
    var tipe = jQuery('#jenis_' + count).val();
    var productInfo = detectProductType(tipe);

    if (productInfo.isCustom) {
        var produk_id = getCustomSimilarityCode(productInfo.type);
    } else {
        var produk_id = tipe;
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
        url: "" + BASE_API + "/get-produk-harga-style",
        dataType: "JSON",
        data: {
            produk_id: produk_id,
            id_style: $$('#style_hc_' + count).val(),
        },
        success: function (data) {
            if ($$('#style_hc_' + count).val() != '' && $$('#style_hc_' + count).val() != '0') {
                if (xtra == 1) {
                    if (data.data.harga_style != 0) {
                        $$('#harga_style_' + count).val(data.data.harga_style);

                        var price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);

                        setTimeout(function () {
                            getPotonganKoper(count);
                        }, 150);
                    } else {
                        console.log('⚠️ Harga Style ' + message + ' tidak ada');
                    }
                } else {
                    if (data.data.harga_style_grosir != 0) {
                        $$('#harga_style_' + count).val(data.data.harga_style_grosir);

                        var price = parseFloat($$('#harga_satuan_' + count).val()) + parseFloat($$('#harga_style_' + count).val());
                        $$('#price_' + count).val(number_format(price));
                        changeTotalValue(count);

                        setTimeout(function () {
                            getPotonganKoper(count);
                        }, 150);
                    } else {
                        console.log('⚠️ Harga Style ' + message + ' tidak ada');
                    }
                }
            }
        }
    });
}

/**
 * Fill harga material produk
 */
function fillHargaMaterialProduk(count) {
    var tipe = jQuery('#jenis_' + count).val();
    var productInfo = detectProductType(tipe);

    if (productInfo.isCustom) {
        var produk_id = getCustomSimilarityCode(productInfo.type);
    } else {
        var produk_id = tipe;
    }

    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-produk-harga-material",
        dataType: "JSON",
        data: {
            produk_id: produk_id,
            id_material: $$('#material_hc_' + count).val(),
        },
        success: function (data) {
            if ($$('#material_hc_' + count).val() != '' && $$('#material_hc_' + count).val() != '0') {
                console.log('Material harga:', data.data.harga_material);
            }
        }
    });
}

/**
 * Fill harga TAS
 */
function fillHargaTs(count) {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-tas-harga",
        dataType: "JSON",
        data: {
            id_ukuran_tas: $$('#ukuran_ts_' + count).val(),
        },
        success: function (data) {
            if ($$('#ukuran_ts_' + count).val() != '' && $$('#ukuran_ts_' + count).val() != 'none') {
                if (data.data.harga_ukuran_tas != 0) {
                    $$('#harga_satuan_' + count).val(data.data.harga_ukuran_tas);

                    var price = parseFloat($$('#harga_satuan_' + count).val());
                    $$('#price_' + count).val(number_format(price));
                    changeTotalValue(count);

                    setTimeout(function () {
                        getPotonganTas(count);
                    }, 150);
                } else {
                    console.log('⚠️ Harga TAS tidak ada');
                    $$('#harga_satuan_' + count).val(0);
                    $$('#price_' + count).val('');
                    $$('#total_' + count).val('');
                }
            }
        }
    });
}

/**
 * Fill harga material TAS
 */
function fillHargaMaterialProdukTs(count) {
    jQuery.ajax({
        type: "POST",
        url: "" + BASE_API + "/get-tas-harga-material",
        dataType: "JSON",
        data: {
            id_material_tas: $$('#material_ts_' + count).val(),
        },
        success: function (data) {
            if ($$('#material_ts_' + count).val() != '' && $$('#material_ts_' + count).val() != '0') {
                console.log('Material TAS harga:', data.data.harga_material_tas);
            }
        }
    });
}

/**
 * Fill harga material universal
 */
function fillHargaMaterialProdukUniversal(count, materialType) {
    console.log('fillHargaMaterialProdukUniversal - count:', count, 'type:', materialType);
}

/**
 * Callback harga setelah load
 */
function callbackHarga(count) {
    console.log('callbackHarga - count:', count);
    changeTotalValue(count);
}

/**
 * Call price calculation
 */
function callPrice(count) {
    fillHargaProduk(count);
}