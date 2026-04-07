// ========================================
// CATALOG FUNCTIONS
// ========================================

/**
 * Get katalog by type
 */
function getKatalog(count, type) {
    console.log('getKatalog called - count:', count, 'type:', type);

    app.preloader.show();

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-katalog",
        dataType: "JSON",
        data: {
            type: type
        },
        success: function (data) {
            app.preloader.hide();

            if (data.status == 200 && data.data && data.data.length > 0) {
                // Show katalog popup
                showKatalogPopup(count, type, data.data);
            } else {
                app.dialog.alert('Katalog tidak ditemukan');
            }
        },
        error: function () {
            app.preloader.hide();
            app.dialog.alert('Terjadi kesalahan saat mengambil katalog');
        }
    });
}

/**
 * Show katalog popup
 */
function showKatalogPopup(count, type, katalogData) {
    var html = '<div class="list media-list">';
    html += '<ul>';

    jQuery.each(katalogData, function (i, item) {
        var imageUrl = BASE_PATH_IMAGE_PRODUK + '/' + item.gambar_produk;
        var produkId = item.produk_id;
        var produkNama = item.produk_nama || produk_id;

        html += '<li>';
        html += '  <a href="#" class="item-link item-content katalog-item" data-count="' + count + '" data-produk-id="' + produkId + '">';
        html += '    <div class="item-media"><img src="' + imageUrl + '" width="80" /></div>';
        html += '    <div class="item-inner">';
        html += '      <div class="item-title-row">';
        html += '        <div class="item-title">' + produkNama + '</div>';
        html += '      </div>';
        html += '      <div class="item-subtitle">' + produkId + '</div>';
        html += '    </div>';
        html += '  </a>';
        html += '</li>';
    });

    html += '</ul>';
    html += '</div>';

    var popup = app.popup.create({
        content: '<div class="popup">' +
            '  <div class="page">' +
            '    <div class="navbar">' +
            '      <div class="navbar-bg"></div>' +
            '      <div class="navbar-inner">' +
            '        <div class="title">Pilih Katalog ' + type + '</div>' +
            '        <div class="right"><a href="#" class="link popup-close">Close</a></div>' +
            '      </div>' +
            '    </div>' +
            '    <div class="page-content">' +
            html +
            '    </div>' +
            '  </div>' +
            '</div>',
        on: {
            opened: function () {
                // Setup click handlers
                $$('.katalog-item').on('click', function (e) {
                    e.preventDefault();
                    var itemCount = $$(this).data('count');
                    var produkId = $$(this).data('produk-id');

                    fillProformaInput(itemCount, produkId);
                    popup.close();
                });
            }
        }
    });

    popup.open();
}

/**
 * Fill proforma input from katalog selection
 */
function fillProformaInput(count, produkId) {
    console.log('fillProformaInput - count:', count, 'produkId:', produkId);

    // Set jenis input
    $$('#jenis_' + count).val(produkId);

    // Trigger product type detection
    var productInfo = detectProductType(produkId);

    // Show appropriate UI
    if (productInfo.isKoper) {
        if (productInfo.isCustom) {
            showCustomKoperUI(count);
        } else {
            showKatalogKoperUI(count);
        }

        // Load dropdowns
        selectBoxUkuran(count, produkId);
        selectBoxStyle(count, produkId);
        selectBoxMaterial(count, produkId);
    }

    console.log('✓ Katalog filled for item #' + count);
}

/**
 * Handle katalog selection
 */
function handleKatalogSelection(count, produkId) {
    fillProformaInput(count, produkId);
}