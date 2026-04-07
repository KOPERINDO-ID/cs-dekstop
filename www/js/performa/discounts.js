// ========================================
// POTONGAN/DISCOUNT FUNCTIONS
// ========================================

/**
 * Get potongan untuk produk KOPER
 */
function getPotonganKoper(count) {
    if (typeof globalPotonganData === 'undefined') {
        window.globalPotonganData = {};
    }

    var produk_id = $$('#jenis_' + count).val();
    var id_ukuran = $$('#id_ukuran_hc_' + count).val();
    var qty = $$('#qty_' + count).val() || 0;

    console.log('getPotonganKoper called - count:', count);

    if (!produk_id || produk_id === '') {
        console.warn('produk_id tidak valid');
        return;
    }

    if (!id_ukuran || id_ukuran === '' || isNaN(id_ukuran)) {
        console.warn('id_ukuran tidak valid');
        return;
    }

    var qtyInt = parseInt(qty);
    if (isNaN(qtyInt) || qtyInt === 0) {
        clearPotonganInfo(count);
        return;
    }

    if (qtyInt < 100) {
        clearPotonganInfo(count);
        changeTotalValue(count);
        return;
    }

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
            $$('#copy_potongan_icon_' + count).hide();
        },
        success: function (response) {
            if (response.status === 200 && response.data) {
                var potongan = response.data;

                globalPotonganData[count] = {
                    nominal_potongan: potongan.nominal_potongan,
                    harga_setelah_potongan: potongan.harga_setelah_potongan,
                    minimal_qty: potongan.minimal_qty,
                    harga_normal: potongan.harga_normal
                };

                $$('#copy_potongan_icon_' + count).show();

                var currentPrice = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;
                var nominalPotongan = parseFloat(potongan.nominal_potongan) || 0;
                var hargaSetelahPotonganAktual = currentPrice - nominalPotongan;

                globalPotonganData[count].harga_setelah_potongan = hargaSetelahPotonganAktual;

                $$('#nominal_potongan_display_' + count).text(number_format(hargaSetelahPotonganAktual));
                $$('#nominal_potongan_display_' + count).show();

                $$('#potongan_otomatis_' + count).val(hargaSetelahPotonganAktual);

                applyQtyAndNetPriceColorValidation(count);

                $$('#info_potongan_' + count).hide();
                $$('#warning_perubahan_' + count).hide();

            } else {
                if (!isEditMode) {
                    clearPotonganInfo(count);
                    $$('#potongan_price_' + count).val('');
                } else {
                    clearPotonganInfo(count);
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('Error getting potongan koper:', error);
            if (!isEditMode) {
                clearPotonganInfo(count);
            }
        }
    });
}

/**
 * Get potongan untuk produk TAS
 */
function getPotonganTas(count) {
    if (typeof globalPotonganData === 'undefined') {
        window.globalPotonganData = {};
    }

    var id_ukuran_tas = $$('#id_ukuran_tas_' + count).val();
    var qty = $$('#qty_' + count).val() || 0;

    console.log('getPotonganTas called - count:', count);

    if (!id_ukuran_tas || id_ukuran_tas === '' || isNaN(id_ukuran_tas)) {
        console.warn('id_ukuran_tas tidak valid');
        return;
    }

    var qtyInt = parseInt(qty);
    if (isNaN(qtyInt) || qtyInt === 0) {
        clearPotonganInfo(count);
        return;
    }

    if (qtyInt < 100) {
        clearPotonganInfo(count);
        changeTotalValue(count);
        return;
    }

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-potongan-tas",
        dataType: "JSON",
        data: {
            id_ukuran_tas: parseInt(id_ukuran_tas),
            qty: qtyInt
        },
        beforeSend: function () {
            $$('#copy_potongan_icon_' + count).hide();
        },
        success: function (response) {
            if (response.status === 200 && response.data) {
                var potongan = response.data;

                globalPotonganData[count] = {
                    nominal_potongan: potongan.nominal_potongan,
                    harga_setelah_potongan: potongan.harga_setelah_potongan,
                    minimal_qty: potongan.minimal_qty,
                    harga_normal: potongan.harga_normal
                };

                $$('#copy_potongan_icon_' + count).show();

                var currentPrice = parseFloat($$('#price_' + count).val().replace(/\,/g, '')) || 0;
                var nominalPotongan = parseFloat(potongan.nominal_potongan) || 0;
                var hargaSetelahPotonganAktual = currentPrice - nominalPotongan;

                globalPotonganData[count].harga_setelah_potongan = hargaSetelahPotonganAktual;

                $$('#nominal_potongan_display_' + count).text(number_format(hargaSetelahPotonganAktual));
                $$('#nominal_potongan_display_' + count).show();

                $$('#potongan_otomatis_' + count).val(hargaSetelahPotonganAktual);

                applyQtyAndNetPriceColorValidation(count);

                $$('#info_potongan_' + count).hide();
                $$('#warning_perubahan_' + count).hide();

            } else {
                if (!isEditMode) {
                    clearPotonganInfo(count);
                    $$('#potongan_price_' + count).val('');
                } else {
                    clearPotonganInfo(count);
                }
            }
        },
        error: function (xhr, status, error) {
            console.error('Error getting potongan tas:', error);
            if (!isEditMode) {
                clearPotonganInfo(count);
            }
        }
    });
}

/**
 * Clear potongan info
 */
function clearPotonganInfo(count) {
    $$('#copy_potongan_icon_' + count).hide();
    $$('#nominal_potongan_display_' + count).hide();
    $$('#nominal_potongan_display_' + count).text('');
    $$('#info_potongan_' + count).hide();
    $$('#potongan_otomatis_' + count).val('');

    if (globalPotonganData && globalPotonganData[count]) {
        delete globalPotonganData[count];
    }

    console.log('✓ Cleared potongan info for #' + count);
}

/**
 * Copy potongan to net harga
 */
function copyPotonganToNetHarga(count) {
    if (globalPotonganData[count] && globalPotonganData[count].harga_setelah_potongan) {
        var hargaSetelahPotongan = globalPotonganData[count].harga_setelah_potongan;
        $$('#potongan_price_' + count).val(number_format(hargaSetelahPotongan));

        console.log('✓ Copied potongan to net harga for #' + count + ':', hargaSetelahPotongan);

        changeTotalValue(count);
        applyQtyAndNetPriceColorValidation(count);
    }
}

/**
 * Show tier potongan preview
 */
function showTierPotonganPreview(count) {
    var produk_id = $$('#jenis_' + count).val();
    var id_ukuran = $$('#id_ukuran_hc_' + count).val();

    if (!produk_id || !id_ukuran) {
        return;
    }

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-potongan-tiers",
        dataType: "JSON",
        data: {
            produk_id: produk_id,
            id_ukuran: id_ukuran
        },
        success: function (response) {
            if (response.status === 200 && response.data) {
                var tiers = response.data;
                var html = '<div class="list"><ul>';

                jQuery.each(tiers, function (i, tier) {
                    html += '<li>';
                    html += '  <div class="item-content">';
                    html += '    <div class="item-inner">';
                    html += '      <div class="item-title">Qty ' + tier.minimal_qty + '+</div>';
                    html += '      <div class="item-after">' + number_format(tier.harga_setelah_potongan) + '</div>';
                    html += '    </div>';
                    html += '  </div>';
                    html += '</li>';
                });

                html += '</ul></div>';

                app.dialog.alert(html, 'Tier Potongan');
            }
        }
    });
}

/**
 * Get potongan summary for display
 */
function getPotonganSummary() {
    var summary = '';
    var totalDiscount = 0;

    $$('.performa_group_field_count').each(function (index) {
        var count = index + 1;
        if (globalPotonganData[count]) {
            var potongan = globalPotonganData[count];
            var qty = parseInt($$('#qty_' + count).val()) || 0;
            var discount = parseFloat(potongan.nominal_potongan) || 0;

            totalDiscount += (discount * qty);
        }
    });

    if (totalDiscount > 0) {
        summary = 'Total Potongan: Rp ' + number_format(totalDiscount);
    }

    return summary;
}