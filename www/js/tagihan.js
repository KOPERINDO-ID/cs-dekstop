// ============================================================
// TAGIHAN.JS - Complete Implementation with Payment Button
// ============================================================

// === BANK HELPER VARIABLES & FUNCTIONS (untuk popup pembayaran) ===
var globalBankData = [];
var kotaDataCache = null;

/**
 * Load data bank dari server - dipanggil saat halaman load
 */
function loadBankData() {
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-all-bank",
        dataType: 'JSON',
        data: { user_id: localStorage.getItem("user_id") },
        success: function(response) {
            if (response.data && Array.isArray(response.data)) {
                globalBankData = response.data;
            } else if (Array.isArray(response)) {
                globalBankData = response;
            }
            console.log('Bank data loaded (tagihan):', globalBankData);
            renderBankOptionsToStaticDropdowns();
        },
        error: function(xhr, status, error) {
            console.error('Error loading bank data:', error);
        }
    });
}

/**
 * Generate <option> HTML dari globalBankData
 * @param selectedValue - bank_id yang dipilih (numeric)
 * @param excludeTunai - true untuk sembunyikan Tunai
 */
function generateBankOptions(selectedValue, excludeTunai) {
    var options = '';
    var defaultSelected = selectedValue || 3; // Default Mandiri (bank_id=3)

    if (globalBankData.length > 0) {
        for (var i = 0; i < globalBankData.length; i++) {
            var bank = globalBankData[i];
            if (excludeTunai && bank.bank_kode && bank.bank_kode.toLowerCase() === 'tunai') continue;
            var bankId = bank.bank_id;
            // Gunakan bank_label dari API jika tersedia, jika tidak buat label lengkap
            var label;
            if (bank.bank_label) {
                label = bank.bank_label;
            } else {
                label = bank.bank_nama || bank.bank_kode || 'Bank ' + bankId;
                if (bank.bank_no_rekening) label += ' (' + bank.bank_no_rekening;
                if (bank.bank_atas_nama) label += ' A/N ' + bank.bank_atas_nama;
                if (bank.bank_no_rekening || bank.bank_atas_nama) label += ')';
            }
            var sel = (bankId == defaultSelected) ? ' selected' : '';
            options += '<option value="' + bankId + '"' + sel + '>' + label + '</option>';
        }
    }

    // Fallback hardcoded jika API belum load
    if (options === '') {
        var hardcoded = [
            { id: 1, nama: 'BCA (01831 29551 A/N Sutono)' },
            { id: 2, nama: 'BRI (058401031165502 A/N Sutono)' },
            { id: 3, nama: 'Mandiri (1410002255818 A/N Sutono)' },
            { id: 4, nama: 'Mandiri (1410506070895 A/N Santoso)' },
            { id: 5, nama: 'Tunai' },
            { id: 6, nama: 'Mandiri (1180014824725 A/N Yu Shujin)' }
        ];
        for (var j = 0; j < hardcoded.length; j++) {
            if (excludeTunai && hardcoded[j].nama === 'Tunai') continue;
            var sel2 = (hardcoded[j].id == defaultSelected) ? ' selected' : '';
            options += '<option value="' + hardcoded[j].id + '"' + sel2 + '>' + hardcoded[j].nama + '</option>';
        }
    }

    return options;
}

/**
 * Get bank label dari bank_id atau bank_code
 * Menampilkan label lengkap: NamaBank (NoRekening A/N NamaAtas)
 */
function getBankLabel(bankIdOrCode) {
    if (!bankIdOrCode || bankIdOrCode === '' || bankIdOrCode === 'null') return '-';

    // Cek apakah numeric (bank_id)
    if (!isNaN(bankIdOrCode) && parseInt(bankIdOrCode) > 0) {
        var bankId = parseInt(bankIdOrCode);

        // Cek dari API globalBankData dulu (ada bank_label dari server)
        var found = globalBankData.find(function(b) { return b.bank_id === bankId; });
        if (found) {
            // Gunakan bank_label jika tersedia (dari API)
            if (found.bank_label) return found.bank_label;
            // Buat label lengkap dari fields
            var label = found.bank_nama || found.bank_kode || 'Bank ' + bankId;
            if (found.bank_no_rekening) label += ' (' + found.bank_no_rekening;
            if (found.bank_atas_nama) label += ' A/N ' + found.bank_atas_nama;
            if (found.bank_no_rekening || found.bank_atas_nama) label += ')';
            return label;
        }

        // Hardcoded fallback dengan label lengkap
        var fallback = {
            1: 'BCA (01831 29551 A/N Sutono)',
            2: 'BRI (058401031165502 A/N Sutono)',
            3: 'Mandiri (1410002255818 A/N Sutono)',
            4: 'Mandiri (1410506070895 A/N Santoso)',
            5: 'Tunai',
            6: 'Mandiri (1180014824725 A/N Yu Shujin)'
        };
        return fallback[bankId] || 'Bank ' + bankId;
    }

    // String (bank_code lama) - cari di globalBankData dulu
    var foundByCode = globalBankData.find(function(b) {
        return b.bank_kode && b.bank_kode.toLowerCase() === bankIdOrCode.toLowerCase();
    });
    if (foundByCode) {
        if (foundByCode.bank_label) return foundByCode.bank_label;
        var label = foundByCode.bank_nama || foundByCode.bank_kode;
        if (foundByCode.bank_no_rekening) label += ' (' + foundByCode.bank_no_rekening;
        if (foundByCode.bank_atas_nama) label += ' A/N ' + foundByCode.bank_atas_nama;
        if (foundByCode.bank_no_rekening || foundByCode.bank_atas_nama) label += ')';
        return label;
    }

    // Return as-is jika tidak ditemukan
    return bankIdOrCode;
}

/**
 * Convert bank_code (string) ke bank_id (number)
 */
function getBankIdByCode(bankCode) {
    if (!bankCode) return 3;
    var found = globalBankData.find(function(b) {
        return (b.bank_kode && b.bank_kode.toLowerCase() === bankCode.toLowerCase()) ||
               (b.bank_nama && b.bank_nama.toLowerCase() === bankCode.toLowerCase());
    });
    if (found) return found.bank_id;

    var codeMap = { 'bca': 1, 'bri': 2, 'mandiri': 3, 'mandiri bisnis': 4, 'tunai': 5 };
    return codeMap[bankCode.toLowerCase()] || 3;
}

/**
 * Render bank options ke dropdown statis di HTML (jika ada)
 */
function renderBankOptionsToStaticDropdowns() {
    for (var i = 1; i <= 10; i++) {
        var el = jQuery('#bank_tagihan_' + i);
        if (el.length) el.html(generateBankOptions(3));
    }
    var editEl = jQuery('#bank_edit_tagihan');
    if (editEl.length) editEl.html(generateBankOptions(3));
}

// === ADDITIONAL HELPER FUNCTIONS (disamakan dari penjualan.js) ===

/**
 * Cek apakah user adalah owner (Stn)
 */
function checkIsOwner() {
    var username = localStorage.getItem("username");
    return username === 'Stn';
}

/**
 * Get bank label dari payment data (prioritas bank_id dulu, baru bank_code)
 * Sama persis dengan penjualan.js
 */
function getBankLabelFromPayment(bankId, bankCode) {
    // Prioritas 1: bank_X_id (integer)
    if (bankId !== null && bankId !== undefined && bankId !== 'null' && bankId !== 'undefined' && bankId !== '') {
        return getBankLabel(bankId);
    }
    // Prioritas 2: bank_X (bisa string angka "6" atau code "BCA")
    if (bankCode !== null && bankCode !== undefined && bankCode !== 'null' && bankCode !== 'undefined' && bankCode !== '') {
        return getBankLabel(bankCode);
    }
    return '-';
}

/**
 * Get bank info lengkap dari bank_id
 * Sama persis dengan penjualan.js
 */
function getBankInfoById(bankId) {
    var defaultBank = {
        nama: 'Mandiri',
        rekening: '141 000 225 5818',
        atas_nama: 'Sutono'
    };
    if (!bankId) return defaultBank;
    var bank = globalBankData.find(function(b) {
        return b.bank_id === bankId;
    });
    if (bank) {
        return {
            nama: bank.bank_nama || bank.bank_kode,
            rekening: bank.bank_no_rekening || '',
            atas_nama: bank.bank_atas_nama || ''
        };
    }
    var hardcodedBanks = {
        1: { nama: 'BCA', rekening: '01831 29551', atas_nama: 'Sutono' },
        2: { nama: 'BRI', rekening: '058401031165502', atas_nama: 'Sutono' },
        3: { nama: 'Mandiri', rekening: '141 000 225 5818', atas_nama: 'Sutono' },
        4: { nama: 'Mandiri Bisnis', rekening: '1410506070895', atas_nama: 'Santoso' },
        5: { nama: 'Tunai', rekening: '-', atas_nama: '-' },
        6: { nama: 'Mandiri', rekening: '1180014824725', atas_nama: 'Yu Shujin' }
    };
    return hardcodedBanks[bankId] || defaultBank;
}

// === ONGKIR HELPER FUNCTIONS (untuk popup pembayaran) ===

function handleOngkirClick(element, count, penjualan_id, originalValue, statusOngkir) {
    var $field = jQuery(element);
    var isEdited = $field.attr('data-is-edited') === 'true';
    var currentValue = $field.val().replace(/,/g, '');
    
    statusOngkir = statusOngkir || $field.attr('data-status-ongkir') || 'pending';
    
    // Jika sudah diedit & disave, tidak bisa edit lagi
    if (isEdited) {
        var displayAsli = (originalValue == 0 || originalValue == '0') ? '-' : number_format(originalValue);
        app.dialog.alert(
            '<div style="padding:15px;">' +
            '<h3 style="text-align:center; color:#ff3b30; margin:0 0 8px 0; font-size:17px; font-weight:bold;">🔒 Data Terkunci</h3>' +
            '<p style="text-align:center; font-size:13px; color:#8e8e93; margin:0 0 15px 0;">Data ongkir sudah pernah diedit dan tidak dapat diubah lagi.</p>' +
            '<table style="width:100%; border-collapse:collapse; border:1px solid #38383a; table-layout:fixed;">' +
            '<thead><tr style="border-bottom:1px solid #38383a;">' +
            '<th style="width:50%; padding:10px; text-align:center; background:#2c2c2e; color:white; font-size:12px; font-weight:600; border-right:1px solid #38383a;">ASLI</th>' +
            '<th style="width:50%; padding:10px; text-align:center; background:#2c2c2e; color:white; font-size:12px; font-weight:600;">SEKARANG</th>' +
            '</tr></thead><tbody><tr>' +
            '<td style="width:50%; padding:12px; text-align:center; background:#2c2c2e; border-right:1px solid #38383a;">' +
            '<div style="color:#ff3b30; font-size:18px; font-weight:bold;">' + displayAsli + '</div></td>' +
            '<td style="width:50%; padding:12px; text-align:center; background:#fff;">' +
            '<div style="color:#34c759; font-size:18px; font-weight:bold;">' + number_format(currentValue) + '</div></td>' +
            '</tr></tbody></table></div>'
        );
        return;
    }
    
    if (statusOngkir === 'pending') {
        showOngkirPendingPopup($field, count, penjualan_id, originalValue, currentValue);
    } else {
        showOngkirEditPopup($field, count, penjualan_id, originalValue, currentValue);
    }
}

function showOngkirEditPopup($field, count, penjualan_id, originalValue, currentValue) {
    var displayAsli = (originalValue == 0 || originalValue == '0') ? '-' : number_format(originalValue);
    
    var modalHTML = 
        '<div class="ongkir-modal-wrapper" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 13000; display: flex; align-items: center; justify-content: center;">' +
        '  <div class="ongkir-backdrop" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px);"></div>' +
        '  <div class="ongkir-modal-content" style="position: relative; width: 380px; max-width: 90vw; background: #1c1c1e; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); z-index: 1;">' +
        '    <div style="padding: 15px 15px 8px 15px;">' +
        '      <h3 style="margin: 0; text-align: center; color: #fff; font-size: 17px; font-weight: bold;">ONGKIR</h3>' +
        '      <div style="text-align: center; color: #ff9500; font-size: 10px; margin-top: 6px;">⚠️ Bisa di edit 1x</div>' +
        '    </div>' +
        '    <div style="border-bottom: 1px solid #38383a;"></div>' +
        '    <div style="padding: 15px;">' +
        '      <table style="width: 100%; border-collapse: collapse; border: 1px solid #38383a; table-layout: fixed;">' +
        '        <thead><tr style="border-bottom: 1px solid #38383a;">' +
        '          <th style="width: 50%; padding: 10px; text-align: center; background: #2c2c2e; color: white; font-size: 12px; font-weight: 600; border-right: 1px solid #38383a;">ASLI</th>' +
        '          <th style="width: 50%; padding: 10px; text-align: center; background: #2c2c2e; color: white; font-size: 12px; font-weight: 600;">NET</th>' +
        '        </tr></thead>' +
        '        <tbody><tr>' +
        '          <td style="width: 50%; padding: 12px; text-align: center; background: #2c2c2e; border-right: 1px solid #38383a;">' +
        '            <div style="color: #ff3b30; font-size: 18px; font-weight: bold;">' + displayAsli + '</div></td>' +
        '          <td style="width: 50%; padding: 6px; text-align: center; background: #fff;">' +
        '            <input type="text" id="ongkir_net_input" style="width: 100%; background: transparent; border: none; color: #000; font-size: 18px; font-weight: bold; text-align: center; padding: 6px 4px; outline: none;" value="' + number_format(currentValue) + '" />' +
        '          </td></tr></tbody></table>' +
        '    </div>' +
        '    <div style="padding: 0 15px 15px 15px; display: flex; gap: 8px;">' +
        '      <button class="btn-batal-ongkir" style="flex: 1; background: #48484a; color: #fff; border: none; border-radius: 6px; height: 40px; font-weight: 600; font-size: 14px; cursor: pointer;">BATAL</button>' +
        '      <button class="btn-simpan-ongkir" style="flex: 1; background: #007aff; color: #fff; border: none; border-radius: 6px; height: 40px; font-weight: 600; font-size: 14px; cursor: pointer;">SIMPAN</button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    
    jQuery('body').append(modalHTML);
    jQuery('body').css('overflow', 'hidden');
    
    setTimeout(function() {
        jQuery('#ongkir_net_input').mask('000,000,000,000', { reverse: true });
        jQuery('#ongkir_net_input').focus().select();
    }, 100);
    
    function closeModal() {
        jQuery('.ongkir-modal-wrapper').remove();
        jQuery('body').css('overflow', '');
    }
    
    jQuery('.btn-batal-ongkir').on('click', closeModal);
    jQuery('.ongkir-backdrop').on('click', closeModal);
    
    jQuery('.btn-simpan-ongkir').on('click', function() {
        var newValue = jQuery('#ongkir_net_input').val().replace(/,/g, '');
        if (!newValue || newValue === '0' || newValue === '') {
            app.dialog.alert('Nilai ongkir tidak boleh kosong atau 0!');
            return;
        }
        if (newValue === originalValue.toString()) {
            app.dialog.alert('Tidak ada perubahan.');
            closeModal();
            return;
        }
        closeModal();
        setTimeout(function() {
            saveOngkirEdit($field, count, penjualan_id, originalValue, newValue);
        }, 100);
    });
}

function showOngkirPendingPopup($field, count, penjualan_id, originalValue, currentValue) {
    loadKotaData(function(kotaList) {
        var modalHTML = 
            '<div class="ongkir-modal-wrapper" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 13000; display: flex; align-items: center; justify-content: center;">' +
            '  <div class="ongkir-backdrop" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px);"></div>' +
            '  <div class="ongkir-modal-content" style="position: relative; width: 380px; max-width: 90vw; background: #1c1c1e; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); z-index: 1; max-height: 90vh; overflow-y: auto;">' +
            '    <div style="padding: 15px 15px 8px 15px;">' +
            '      <h3 style="margin: 0; text-align: center; color: #fff; font-size: 17px; font-weight: bold;">ONGKIR</h3>' +
            '      <div style="text-align: center; color: #ff9500; font-size: 10px; margin-top: 6px;">⚠️ Bisa di edit 1x</div>' +
            '    </div>' +
            '    <div style="border-bottom: 1px solid #38383a;"></div>' +
            '    <div style="padding: 15px;">' +
            '      <label style="display: flex; align-items: center; padding: 12px; background: #2c2c2e; border-radius: 8px; margin-bottom: 10px; cursor: pointer;">' +
            '        <input type="radio" name="status_ongkir_pending" value="free" style="width: 20px; height: 20px; margin-right: 12px; accent-color: #4cd964;">' +
            '        <div><div style="color: #fff; font-size: 15px; font-weight: 600;">FREE ONGKIR</div>' +
            '        <div style="color: #8e8e93; font-size: 12px;">Ongkos kirim gratis (Rp 0)</div></div>' +
            '      </label>' +
            '      <label style="display: flex; align-items: center; padding: 12px; background: #2c2c2e; border-radius: 8px; cursor: pointer;">' +
            '        <input type="radio" name="status_ongkir_pending" value="nominal" style="width: 20px; height: 20px; margin-right: 12px; accent-color: #007aff;">' +
            '        <div><div style="color: #fff; font-size: 15px; font-weight: 600;">NOMINAL</div>' +
            '        <div style="color: #8e8e93; font-size: 12px;">Tentukan biaya ongkos kirim</div></div>' +
            '      </label>' +
            '    </div>' +
            '    <div id="ongkir_free_content" style="display: none; padding: 0 15px 15px 15px;">' +
            '      <div style="margin-bottom: 12px;">' +
            '        <label style="color: #8e8e93; font-size: 12px; margin-bottom: 6px; display: block;">KOTA PENGIRIMAN</label>' +
            '        <div id="kota_select_container_free" style="position: relative;">' +
            '          <div id="kota_select_display_free" style="width: 100%; padding: 12px 35px 12px 12px; border-radius: 8px; border: 1px solid #38383a; background: #2c2c2e; color: #8e8e93; font-size: 14px; cursor: pointer; position: relative; box-sizing: border-box;">' +
            '            -- Pilih Kota Pengiriman --' +
            '            <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #8e8e93;">▼</span>' +
            '          </div>' +
            '          <input type="hidden" id="kota_pengiriman_ongkir_free" value="" data-nama-kota="">' +
            '        </div>' +
            '      </div>' +
            '      <div style="background: #4cd964; border-radius: 8px; padding: 20px; text-align: center;">' +
            '        <div style="color: #fff; font-size: 14px; font-weight: 600;">ONGKOS KIRIM</div>' +
            '        <div style="color: #fff; font-size: 32px; font-weight: bold; margin-top: 5px;">Rp 0</div>' +
            '        <div style="color: rgba(255,255,255,0.8); font-size: 12px; margin-top: 5px;">GRATIS</div>' +
            '      </div>' +
            '    </div>' +
            '    <div id="ongkir_nominal_content" style="display: none; padding: 0 15px 15px 15px;">' +
            '      <div style="margin-bottom: 12px;">' +
            '        <label style="color: #8e8e93; font-size: 12px; margin-bottom: 6px; display: block;">KOTA PENGIRIMAN</label>' +
            '        <div id="kota_select_container" style="position: relative;">' +
            '          <div id="kota_select_display" style="width: 100%; padding: 12px 35px 12px 12px; border-radius: 8px; border: 1px solid #38383a; background: #2c2c2e; color: #8e8e93; font-size: 14px; cursor: pointer; position: relative; box-sizing: border-box;">' +
            '            -- Pilih Kota Pengiriman --' +
            '            <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #8e8e93;">▼</span>' +
            '          </div>' +
            '          <input type="hidden" id="kota_pengiriman_ongkir" value="" data-nama-kota="">' +
            '        </div>' +
            '      </div>' +
            '      <table style="width: 100%; border-collapse: collapse; border: 1px solid #38383a; table-layout: fixed;">' +
            '        <thead><tr style="border-bottom: 1px solid #38383a;">' +
            '          <th style="width: 50%; padding: 10px; text-align: center; background: #2c2c2e; color: white; font-size: 12px; font-weight: 600; border-right: 1px solid #38383a;">ASLI</th>' +
            '          <th style="width: 50%; padding: 10px; text-align: center; background: #2c2c2e; color: white; font-size: 12px; font-weight: 600;">NET</th>' +
            '        </tr></thead>' +
            '        <tbody><tr>' +
            '          <td style="width: 50%; padding: 12px; text-align: center; background: #2c2c2e; border-right: 1px solid #38383a;">' +
            '            <div style="color: #ff3b30; font-size: 18px; font-weight: bold;">-</div></td>' +
            '          <td style="width: 50%; padding: 6px; text-align: center; background: #fff;">' +
            '            <input type="text" id="ongkir_net_input_pending" style="width: 100%; background: transparent; border: none; color: #000; font-size: 18px; font-weight: bold; text-align: center; padding: 6px 4px; outline: none;" placeholder="0" value="" />' +
            '          </td></tr></tbody></table>' +
            '    </div>' +
            '    <div style="padding: 0 15px 15px 15px; display: flex; gap: 8px;">' +
            '      <button class="btn-batal-ongkir-pending" style="flex: 1; background: #48484a; color: #fff; border: none; border-radius: 6px; height: 40px; font-weight: 600; font-size: 14px; cursor: pointer;">BATAL</button>' +
            '      <button class="btn-simpan-ongkir-pending" style="flex: 1; background: #007aff; color: #fff; border: none; border-radius: 6px; height: 40px; font-weight: 600; font-size: 14px; cursor: pointer;" disabled>SIMPAN</button>' +
            '    </div>' +
            '  </div>' +
            '</div>';
        
        jQuery('body').append(modalHTML);
        jQuery('body').css('overflow', 'hidden');
        
        setTimeout(function() {
            jQuery('#ongkir_net_input_pending').mask('000,000,000,000', { reverse: true });
        }, 100);
        
        function closeModal() {
            jQuery('.ongkir-modal-wrapper').remove();
            jQuery('.kota-dropdown-popup').remove();
            jQuery('body').css('overflow', '');
        }

        jQuery('#kota_select_display').on('click', function(e) {
            e.stopPropagation();
            openKotaDropdownPopup(kotaList);
        });
        jQuery('#kota_select_display_free').on('click', function(e) {
            e.stopPropagation();
            openKotaDropdownPopupForFree(kotaList);
        });
        
        jQuery('input[name="status_ongkir_pending"]').on('change', function() {
            var selectedValue = jQuery(this).val();
            if (selectedValue === 'free') {
                jQuery('#ongkir_free_content').show();
                jQuery('#ongkir_nominal_content').hide();
                checkFreeValidity();
            } else if (selectedValue === 'nominal') {
                jQuery('#ongkir_free_content').hide();
                jQuery('#ongkir_nominal_content').show();
                checkNominalValidity();
                jQuery('#ongkir_net_input_pending').focus();
            }
        });
        
        function checkNominalValidity() {
            var kotaVal = jQuery('#kota_pengiriman_ongkir').val();
            var nominalVal = jQuery('#ongkir_net_input_pending').val().replace(/,/g, '');
            jQuery('.btn-simpan-ongkir-pending').prop('disabled', !(kotaVal && nominalVal && parseInt(nominalVal) > 0));
        }
        function checkFreeValidity() {
            var kotaVal = jQuery('#kota_pengiriman_ongkir_free').val();
            jQuery('.btn-simpan-ongkir-pending').prop('disabled', !kotaVal);
        }
        
        jQuery('#ongkir_net_input_pending').on('input keyup', checkNominalValidity);
        window.checkOngkirNominalValidity = checkNominalValidity;
        window.checkOngkirFreeValidity = checkFreeValidity;
        
        jQuery('.btn-batal-ongkir-pending').on('click', closeModal);
        jQuery('.ongkir-backdrop').on('click', closeModal);
        
        jQuery('.btn-simpan-ongkir-pending').on('click', function() {
            var selectedStatus = jQuery('input[name="status_ongkir_pending"]:checked').val();
            if (!selectedStatus) { app.dialog.alert('Pilih status ongkir!'); return; }
            
            if (selectedStatus === 'free') {
                var kotaVal = jQuery('#kota_pengiriman_ongkir_free').val();
                var kotaNama = jQuery('#kota_pengiriman_ongkir_free').attr('data-nama-kota');
                if (!kotaVal) { app.dialog.alert('Pilih kota pengiriman!'); return; }
                closeModal();
                saveOngkirPending($field, count, penjualan_id, 'free', 0, kotaVal, kotaNama);
            } else if (selectedStatus === 'nominal') {
                var kotaVal = jQuery('#kota_pengiriman_ongkir').val();
                var kotaNama = jQuery('#kota_pengiriman_ongkir').attr('data-nama-kota');
                var nominalVal = jQuery('#ongkir_net_input_pending').val().replace(/,/g, '');
                if (!kotaVal) { app.dialog.alert('Pilih kota pengiriman!'); return; }
                if (!nominalVal || parseInt(nominalVal) <= 0) { app.dialog.alert('Nilai ongkir harus lebih dari 0!'); return; }
                closeModal();
                saveOngkirPending($field, count, penjualan_id, 'nominal', nominalVal, kotaVal, kotaNama);
            }
        });
    });
}

function loadKotaData(callback) {
    if (kotaDataCache) { callback(kotaDataCache); return; }
    jQuery.ajax({
        type: 'POST', url: BASE_API + "/get-kota", dataType: 'JSON',
        data: { user_id: localStorage.getItem("user_id") },
        beforeSend: function() { app.dialog.preloader('Memuat data kota...'); },
        success: function(response) {
            app.dialog.close();
            kotaDataCache = response.data || response || [];
            callback(kotaDataCache);
        },
        error: function() { app.dialog.close(); app.dialog.alert('Gagal memuat data kota'); }
    });
}

function openKotaDropdownPopup(kotaList) {
    jQuery('.kota-dropdown-popup').remove();
    
    var kotaListHTML = '';
    jQuery.each(kotaList, function(i, val) {
        kotaListHTML += '<div class="kota-item" data-id="' + val.id_kota + '" data-nama="' + val.nama_kota + '" ' +
            'style="padding: 12px 15px; border-bottom: 1px solid #38383a; cursor: pointer; color: #fff;">' +
            val.nama_kota + '</div>';
    });
    
    var dropdownHTML = 
        '<div class="kota-dropdown-popup" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 14000; display: flex; align-items: center; justify-content: center;">' +
        '  <div class="kota-dropdown-backdrop" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5);"></div>' +
        '  <div class="kota-dropdown-content" style="position: relative; width: 350px; max-width: 90vw; max-height: 70vh; background: #1c1c1e; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); z-index: 1; display: flex; flex-direction: column;">' +
        '    <div style="padding: 15px; border-bottom: 1px solid #38383a;">' +
        '      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
        '        <h4 style="margin: 0; color: #fff; font-size: 16px;">Pilih Kota Pengiriman</h4>' +
        '        <span class="close-kota-dropdown" style="color: #007aff; cursor: pointer; font-size: 14px;">Tutup</span>' +
        '      </div>' +
        '      <input type="text" id="kota_search_input" placeholder="Cari kota..." style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #38383a; background: #2c2c2e; color: #fff; font-size: 14px; box-sizing: border-box;">' +
        '    </div>' +
        '    <div id="kota_list_container" style="flex: 1; overflow-y: auto;">' + kotaListHTML + '</div>' +
        '  </div>' +
        '</div>';
    
    jQuery('body').append(dropdownHTML);
    setTimeout(function() { jQuery('#kota_search_input').focus(); }, 100);
    
    jQuery('#kota_search_input').on('input keyup', function() {
        var searchText = jQuery(this).val().toLowerCase();
        jQuery('.kota-item').each(function() {
            jQuery(this).toggle(jQuery(this).attr('data-nama').toLowerCase().indexOf(searchText) !== -1);
        });
    });
    
    jQuery('.kota-item').on('click', function() {
        jQuery('#kota_pengiriman_ongkir').val(jQuery(this).attr('data-id')).attr('data-nama-kota', jQuery(this).attr('data-nama'));
        jQuery('#kota_select_display').html(
            jQuery(this).attr('data-nama') + '<span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #8e8e93;">▼</span>'
        ).css('color', '#fff');
        jQuery('.kota-dropdown-popup').remove();
        if (typeof window.checkOngkirNominalValidity === 'function') window.checkOngkirNominalValidity();
    });
    
    jQuery('.kota-item').on('mouseenter', function() { jQuery(this).css('background-color', '#007aff'); })
        .on('mouseleave', function() { jQuery(this).css('background-color', 'transparent'); });
    jQuery('.close-kota-dropdown, .kota-dropdown-backdrop').on('click', function() { jQuery('.kota-dropdown-popup').remove(); });
}

function openKotaDropdownPopupForFree(kotaList) {
    jQuery('.kota-dropdown-popup').remove();
    
    var kotaListHTML = '';
    jQuery.each(kotaList, function(i, val) {
        kotaListHTML += '<div class="kota-item-free" data-id="' + val.id_kota + '" data-nama="' + val.nama_kota + '" ' +
            'style="padding: 12px 15px; border-bottom: 1px solid #38383a; cursor: pointer; color: #fff;">' +
            val.nama_kota + '</div>';
    });
    
    var dropdownHTML = 
        '<div class="kota-dropdown-popup" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 14000; display: flex; align-items: center; justify-content: center;">' +
        '  <div class="kota-dropdown-backdrop" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5);"></div>' +
        '  <div class="kota-dropdown-content" style="position: relative; width: 350px; max-width: 90vw; max-height: 70vh; background: #1c1c1e; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); z-index: 1; display: flex; flex-direction: column;">' +
        '    <div style="padding: 15px; border-bottom: 1px solid #38383a;">' +
        '      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
        '        <h4 style="margin: 0; color: #fff; font-size: 16px;">Pilih Kota Pengiriman</h4>' +
        '        <span class="close-kota-dropdown" style="color: #007aff; cursor: pointer; font-size: 14px;">Tutup</span>' +
        '      </div>' +
        '      <input type="text" id="kota_search_input_free" placeholder="Cari kota..." style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #38383a; background: #2c2c2e; color: #fff; font-size: 14px; box-sizing: border-box;">' +
        '    </div>' +
        '    <div id="kota_list_container_free" style="flex: 1; overflow-y: auto;">' + kotaListHTML + '</div>' +
        '  </div>' +
        '</div>';
    
    jQuery('body').append(dropdownHTML);
    setTimeout(function() { jQuery('#kota_search_input_free').focus(); }, 100);
    
    jQuery('#kota_search_input_free').on('input keyup', function() {
        var searchText = jQuery(this).val().toLowerCase();
        jQuery('.kota-item-free').each(function() {
            jQuery(this).toggle(jQuery(this).attr('data-nama').toLowerCase().indexOf(searchText) !== -1);
        });
    });
    
    jQuery('.kota-item-free').on('click', function() {
        jQuery('#kota_pengiriman_ongkir_free').val(jQuery(this).attr('data-id')).attr('data-nama-kota', jQuery(this).attr('data-nama'));
        jQuery('#kota_select_display_free').html(
            jQuery(this).attr('data-nama') + '<span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #8e8e93;">▼</span>'
        ).css('color', '#fff');
        jQuery('.kota-dropdown-popup').remove();
        if (typeof window.checkOngkirFreeValidity === 'function') window.checkOngkirFreeValidity();
    });
    
    jQuery('.kota-item-free').on('mouseenter', function() { jQuery(this).css('background-color', '#007aff'); })
        .on('mouseleave', function() { jQuery(this).css('background-color', 'transparent'); });
    jQuery('.close-kota-dropdown, .kota-dropdown-backdrop').on('click', function() { jQuery('.kota-dropdown-popup').remove(); });
}

function saveOngkirPending($field, count, penjualan_id, statusOngkir, ongkirValue, idKota, namaKota) {
    if (!idKota || !namaKota) {
        app.dialog.alert('Kota pengiriman harus dipilih!');
        return;
    }

    jQuery.ajax({
        type: 'POST', url: BASE_API + "/update-ongkir-detail-pembayaran-new", dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id, status_ongkir: statusOngkir,
            ongkir: ongkirValue || 0, id_kota_pengiriman: idKota,
            nama_kota_pengiriman: namaKota, is_edited: 'true'
        },
        beforeSend: function() { app.dialog.preloader('Menyimpan...'); },
        success: function(data) {
            app.dialog.close();
            if (data.status === 'success') {
                var message = statusOngkir === 'free'
                    ? '✅ Ongkir FREE - ' + namaKota
                    : '✅ Ongkir: Rp ' + number_format(ongkirValue) + ' - ' + namaKota;
                app.dialog.alert(message, function() {
                    app.popup.close('.detail-pembayaran-tagihan');
                    if (typeof getDataTagihan === 'function') getDataTagihan(1);
                });
            } else {
                app.dialog.alert('Gagal: ' + (data.message || 'Terjadi kesalahan'));
            }
        },
        error: function() { app.dialog.close(); app.dialog.alert('Gagal menyimpan ongkir'); }
    });
}

function saveOngkirEdit($field, count, penjualan_id, originalValue, newValue) {
    var idKota = $field.attr('data-id-kota-pengiriman') || '';
    var namaKota = $field.attr('data-nama-kota-pengiriman') || '';

    jQuery.ajax({
        type: 'POST', url: BASE_API + "/update-ongkir-detail-pembayaran-new", dataType: 'JSON',
        data: {
            ongkir: newValue, ongkir_original: originalValue.toString().replace(/,/g, ''),
            penjualan_id: penjualan_id, is_edited: 'true', status_ongkir: 'nominal',
            id_kota_pengiriman: idKota, nama_kota_pengiriman: namaKota
        },
        beforeSend: function() { app.dialog.preloader('Menyimpan...'); },
        success: function(data) {
            app.dialog.close();
            if (data.status === 'success') {
                // Update field: lock permanently
                $field.val(number_format(newValue));
                $field.attr('data-original-value', newValue);
                $field.attr('data-is-edited', 'true');
                $field.css({
                    'background-color': '#34c759', 'color': 'white',
                    'cursor': 'not-allowed', 'border': 'none', 'font-weight': 'bold'
                });
                $field.prop('readonly', true);
                $field.off('blur').off('click');
                $field.unmask();

                app.dialog.alert('✅ Ongkir berhasil diupdate', function() {
                    app.popup.close('.detail-pembayaran-tagihan');
                    if (typeof getDataTagihan === 'function') getDataTagihan(1);
                });
            } else {
                app.dialog.alert('Gagal: ' + (data.message || 'Terjadi kesalahan'));
            }
        },
        error: function() { app.dialog.close(); app.dialog.alert('Gagal update ongkir'); }
    });
}

// === END BANK & ONGKIR HELPERS ===

/**
 * Get Data Tagihan dengan Color Coding
 * Warna berdasarkan hari keterlambatan:
 * - H+2-6: Kuning (WARNING)
 * - H+7-11: Orange (DELAYED)
 * - H+12+: Merah (PROBLEM)
 */
function getDataTagihan(page) {
    console.log('Loading tagihan page:', page);

    var page_now = page || 1;

    // === FILTER YEAR ===
    var year_now = new Date().getFullYear();
    var year;
    if (jQuery('#transaksi_tagihan_years option:selected').val() == null) {
        year = 'empty';
    } else if (jQuery('#transaksi_tagihan_years option:selected').val() == 'all') {
        year = 'empty';
    } else {
        year = jQuery('#transaksi_tagihan_years option:selected').val();
    }

    // === FILTER MONTH ===
    var month_now = new Date().getMonth() + 1;
    var month;
    if (jQuery('#transaksi_tagihan_bulan option:selected').val() == null) {
        month = 'empty';
    } else if (jQuery('#transaksi_tagihan_bulan option:selected').val() == 'all') {
        month = 'empty';
    } else {
        month = jQuery('#transaksi_tagihan_bulan option:selected').val();
    }

    // === FILTER PERUSAHAAN / NAMA CLIENT ===
    // Prioritas: input nama client > select perusahaan
    var perusahaan_penjualan_value;
    var filter_client_input = jQuery('#filter_nama_client_tagihan').val();
    
    if (filter_client_input && filter_client_input.trim() !== '') {
        // Jika ada input nama client, gunakan itu
        perusahaan_penjualan_value = filter_client_input.trim();
    } else if (jQuery('#perusahaan_penjualan_tagihan_filter').val() == '' ||
        jQuery('#perusahaan_penjualan_tagihan_filter').val() == null) {
        perusahaan_penjualan_value = "empty";
    } else {
        perusahaan_penjualan_value = jQuery('#perusahaan_penjualan_tagihan_filter').val();
    }

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-data-tagihan-cs?page=" + page_now,
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            month: month,
            year: year,
            perusahaan_penjualan_value: perusahaan_penjualan_value,
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
            version_app: localStorage.getItem("versioon_app_now")
        },
        beforeSend: function () {
            app.dialog.preloader('Memuat data tagihan...');
        },
        success: function (data) {
            app.dialog.close();

            if (data.status != 200) {
                jQuery('#data_status_notif_tagihan').html(
                    '<tr><td colspan="10" style="text-align:center; padding:20px; color:#888;">' +
                    'Tidak ada data tagihan</td></tr>'
                );
                return;
            }

            var html = '';
            var no = (page_now - 1) * 50;

            if (data.data.data.length === 0) {
                html = '<tr><td colspan="10" style="text-align:center; padding:20px; color:#888;">' +
                    'Tidak ada tagihan untuk filter yang dipilih</td></tr>';
            } else {
                jQuery.each(data.data.data, function (i, item) {
                    no++;

                    // Hitung nilai jual murni (tanpa ongkir) - disamakan dengan penjualan sales
                    var nilaiJualMurni = parseFloat(item.penjualan_grandtotal) - parseFloat(item.ongkir || 0);

                    // Hitung sisa pembayaran (dari grandtotal asli, sama seperti penjualan sales)
                    var sisaPembayaran = parseFloat(item.penjualan_grandtotal) -
                        parseFloat(item.penjualan_jumlah_pembayaran || 0);

                    // Tentukan warna row
                    var rowColor = getRowColorByDays(item.hari_keterlambatan);
                    var statusBadge = getStatusBadge(item.hari_keterlambatan);

                    // Format nomor invoice
                    var nomorInvoice = moment(item.dt_record).format('DDMMYY') + '-' +
                        item.penjualan_id.replace(/INV_/g, '').replace(/^0+/, '');

                    // Format tanggal
                    var bulanIndo = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
                    var tanggalSelesai = '-';
                    if (item.tgl_surat_jalan_selesai) {
                        var tgl = moment(item.tgl_surat_jalan_selesai);
                        tanggalSelesai = tgl.format('D') + ' ' + bulanIndo[tgl.month()] + ' ' + tgl.format('YYYY');
                    }

                    html += '<tr style="' + rowColor + '">';
                    html += '<td align="center" style="border:1px solid gray; padding:8px;">' + no + '</td>';
                    html += '<td align="center" style="border:1px solid gray; padding:8px;">';
                    html += '<b>' + nomorInvoice + '</b>';
                    html += '</td>';
                    html += '<td align="left" style="border:1px solid gray; padding:8px;">';
                    html += (item.client_nama || '-') + '<br>';
                    html += '</td>';
                    html += '<td align="center" style="border:1px solid gray; padding:8px;">' + tanggalSelesai + '</td>';
                    html += '<td align="center" style="border:1px solid gray; padding:8px;">' + (item.client_kota || '-') + '</td>';
                    html += '<td align="right" style="border:1px solid gray; padding:8px;">' + number_format(item.penjualan_grandtotal) + '</td>';
                    html += '<td align="right" style="border:1px solid gray; padding:8px;">' + number_format(item.penjualan_jumlah_pembayaran || 0) + '</td>';
                    html += '<td align="right" style="border:1px solid gray; padding:8px;"><b>' + number_format(sisaPembayaran) + '</b></td>';

                    var sisa = parseFloat(item.penjualan_grandtotal) - parseFloat(item.penjualan_jumlah_pembayaran || 0);

                    // === WARNA TOMBOL BAYAR BERDASARKAN HARI KETERLAMBATAN ===
                    var color_btn_byr = "bg-dark-gray-young text-add-colour-black-soft"; // default abu-abu
                    var style_btn_byr = "";

                    if (sisa <= 0) {
                        // Sudah lunas - biru
                        color_btn_byr = "btn-color-blueWhite";
                        style_btn_byr = "";
                    } else if (item.tgl_surat_jalan_selesai) {
                        var tglSelesai = moment(item.tgl_surat_jalan_selesai);
                        var today = moment().startOf('day');
                        var hariKeterlambatan = today.diff(tglSelesai, 'days');

                        if (hariKeterlambatan >= 12) {
                            // H+12 ke atas - MERAH
                            color_btn_byr = "";
                            style_btn_byr = "background:#c0392b; color:#fff; border:none;";
                        } else if (hariKeterlambatan >= 7) {
                            // H+7 sampai H+11 - ORANGE
                            color_btn_byr = "";
                            style_btn_byr = "background:#e67e22; color:#fff; border:none;";
                        } else if (hariKeterlambatan >= 2) {
                            // H+2 sampai H+6 - KUNING
                            color_btn_byr = "";
                            style_btn_byr = "background:#f1c40f; color:#333; border:none;";
                        }
                    }

                    // === 2 TOMBOL: LOG dan BAYAR ===
                    html += '<td align="center" style="border-bottom:1px solid gray; padding:5px;">';
                    // Tombol LOG Broadcast
                    html += '         <a href="#" onclick="showBroadcastLogTagihan(\'' + item.penjualan_id + '\', \'' + (item.client_nama || '').replace(/'/g, "\\'") + '\'); return false;" class="button button-small button-fill popup-open" data-popup=".log-broadcast-tagihan" style="width:96px;background: linear-gradient(#6C63FF, #4B44C9); color: white; padding: 4px 8px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; border-radius: 4px;">';
                    html += '             <i class="f7-icons" style="font-size:13px;">doc_text</i> <span>LOG</span>';
                    html += '         </a>';
                    html += '</td>';
                    html += '<td align="center" style="border-right:1px solid gray;border-bottom:1px solid gray; padding:5px;">';
                    
                    // === TOMBOL BAYAR - SAMA DENGAN PENJUALAN TAPI ID/NAME BERBEDA ===
                    html += '<button class="' + color_btn_byr + ' button-small col button popup-open text-bold" style="' + style_btn_byr + '" data-popup=".detail-pembayaran-tagihan" ';
                    html += 'onclick="detailPembayaranTagihan(';
                    html += '\'' + item.dt_record + '\',';
                    html += '\'' + (item.penjualan_tanggal) + '\',';
                    html += '\'' + (item.performa_id_relation) + '\',';  // performa_id_relation
                    html += '\'' + (item.bank_1_id) + '\',';
                    html += '\'' + (item.bank_2_id) + '\',';
                    html += '\'' + (item.bank_3_id) + '\',';
                    html += '\'' + (item.bank_4_id) + '\',';
                    html += '\'' + (item.bank_5_id) + '\',';
                    html += '\'' + (item.bank_6_id) + '\',';
                    html += '\'' + (item.bank_7_id) + '\',';
                    html += '\'' + (item.bank_8_id) + '\',';
                    html += '\'' + (item.bank_9_id) + '\',';
                    html += '\'' + (item.bank_10_id) + '\',';
                    html += '\'' + (item.pembayaran1_tgl) + '\',';
                    html += '\'' + (item.pembayaran2_tgl) + '\',';
                    html += '\'' + (item.pembayaran3_tgl) + '\',';
                    html += '\'' + (item.pembayaran4_tgl) + '\',';
                    html += '\'' + (item.pembayaran5_tgl) + '\',';
                    html += '\'' + (item.pembayaran6_tgl) + '\',';
                    html += '\'' + (item.pembayaran7_tgl) + '\',';
                    html += '\'' + (item.pembayaran8_tgl) + '\',';
                    html += '\'' + (item.pembayaran9_tgl) + '\',';
                    html += '\'' + (item.pembayaran10_tgl) + '\',';
                    html += '\'' + (item.bank) + '\',';  // bank
                    html += '\'' + (item.pembayaran_1) + '\',';
                    html += '\'' + (item.pembayaran_2) + '\',';
                    html += '\'' + (item.pembayaran_3) + '\',';
                    html += '\'' + (item.pembayaran_4) + '\',';
                    html += '\'' + (item.pembayaran_5) + '\',';
                    html += '\'' + (item.pembayaran_6) + '\',';
                    html += '\'' + (item.pembayaran_7) + '\',';
                    html += '\'' + (item.pembayaran_8) + '\',';
                    html += '\'' + (item.pembayaran_9) + '\',';
                    html += '\'' + (item.pembayaran_10) + '\',';
                    html += '\'' + item.client_nama + '\',';
                    html += '\'' + (item.penjualan_jumlah_pembayaran) + '\',';
                    html += '\'' + (item.penjualan_total_qty) + '\',';
                    html += '\'' + (item.penjualan_grandtotal) + '\',';
                    html += '\'' + item.penjualan_id + '\',';
                    html += '\'' + item.client_id + '\',';
                    html += '\'' + (item.penjualan_status_pembayaran || 'Belum Lunas') + '\',';
                    html += '\'' + (item.ongkir || 0) + '\'';
                    html += ');">Bayar</button>';
                    
                    html += '</td>';
                    html += '</tr>';
                });
            }

            jQuery('#data_status_notif_tagihan').html(html);
            jQuery('#count_notif_tagihan').text(data.data.data.length || 0);
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            console.error('Error loading tagihan:', error);
            app.dialog.alert('Gagal memuat data: ' + error);
        }
    });
}

/**
 * Get Row Color Based on Days
 */
function getRowColorByDays(days) {
    if (days >= 12) {
        return 'background-color: rgba(244, 67, 54, 0.2);'; // Red
    } else if (days >= 7) {
        return 'background-color: rgba(255, 152, 0, 0.2);'; // Orange
    } else if (days >= 2) {
        return 'background-color: rgba(255, 235, 59, 0.15);'; // Yellow
    }
    return '';
}

/**
 * Get Status Badge
 */
function getStatusBadge(days) {
    if (days >= 12) {
        return '<span style="color:#f44336; font-size:11px;">⚠ PROBLEM</span>';
    } else if (days >= 7) {
        return '<span style="color:#ff9800; font-size:11px;">⚠ DELAYED</span>';
    } else if (days >= 2) {
        return '<span style="color:#ffc107; font-size:11px;">⚠ WARNING</span>';
    }
    return '<span style="color:#4caf50; font-size:11px;">✓ OK</span>';
}

/**
 * Show Broadcast Log untuk Tagihan
 * Menampilkan popup berisi history broadcast otomatis (H+2, H+7, H+12)
 */

/**
 * Format teks WhatsApp: *bold* → <b>, _italic_ → <i>
 * Juga convert newline ke <br> dan escape HTML
 */
function formatWhatsAppText(text) {
    if (!text) return '';
    // Escape HTML dulu
    var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Bold: *teks* → <b>teks</b>
    escaped = escaped.replace(/\*([^*\n]+)\*/g, '<b>$1</b>');
    // Italic: _teks_ → <em>teks</em>
    escaped = escaped.replace(/_([^_\n]+)_/g, '<em>$1</em>');
    // Strikethrough: ~teks~ → <s>teks</s>
    escaped = escaped.replace(/~([^~\n]+)~/g, '<s>$1</s>');
    // Newline ke <br>
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
}

function showBroadcastLogTagihan(penjualan_id, client_nama) {
    console.log('Loading broadcast log for:', penjualan_id);

    // Set nama client di header popup
    jQuery('#log-broadcast-client-nama').text(client_nama || penjualan_id);

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-tagihan-broadcast-log",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualan_id
        },
        beforeSend: function () {
            jQuery('#log-broadcast-tagihan-content').html(
                '<div style="text-align:center; padding:40px; color:#888;">' +
                '<div class="preloader" style="margin:0 auto;"></div>' +
                '<p style="margin-top:10px;">Memuat data log...</p></div>'
            );
        },
        success: function (data) {
            var html = '';

            if (!data.data || data.data.length === 0) {
                html = '<div style="text-align:center; padding:40px;">' +
                    '<div style="font-size:48px; margin-bottom:15px;">📭</div>' +
                    '<p style="color:#8e8e93; font-size:15px; margin:0;">Belum ada broadcast untuk tagihan ini</p>' +
                    '<p style="color:#636366; font-size:12px; margin-top:8px;">Broadcast otomatis akan dikirim pada H+2, H+7, dan H+12 setelah pengiriman selesai</p>' +
                    '</div>';
            } else {
                html += '<div style="margin-bottom:10px; padding:8px 12px; background:#2c2c2e; border-radius:8px;">';
                html += '<span style="color:#8e8e93; font-size:12px;">Total broadcast: <b style="color:#fff;">' + data.data.length + '</b></span>';
                html += '</div>';

                jQuery.each(data.data, function (i, log) {
                    // Icon & warna berdasarkan hari_ke
                    var icon = '📋';
                    var labelColor = '#007aff';
                    var labelText = 'Reminder';
                    if (log.hari_ke >= 12) {
                        icon = '⚠️';
                        labelColor = '#ff3b30';
                        labelText = 'URGENT - H+' + log.hari_ke;
                    } else if (log.hari_ke >= 7) {
                        icon = '🔔';
                        labelColor = '#ff9500';
                        labelText = 'Reminder ke-2 - H+' + log.hari_ke;
                    } else {
                        icon = '📋';
                        labelColor = '#007aff';
                        labelText = 'Reminder - H+' + log.hari_ke;
                    }

                    // Status delivery
                    var statusIcon = '⏳';
                    var statusText = 'Pending';
                    var statusColor = '#8e8e93';
                    if (log.is_sent == 1) {
                        switch (log.status_broadcast) {
                            case 'R':
                                statusIcon = '✅';
                                statusText = 'Dibaca';
                                statusColor = '#34c759';
                                break;
                            case 'D':
                                statusIcon = '☑️';
                                statusText = 'Terkirim';
                                statusColor = '#30d158';
                                break;
                            case 'S':
                                statusIcon = '✓';
                                statusText = 'Sent';
                                statusColor = '#64d2ff';
                                break;
                            case 'F':
                                statusIcon = '❌';
                                statusText = 'Gagal';
                                statusColor = '#ff3b30';
                                break;
                            default:
                                statusIcon = '✓';
                                statusText = 'Terkirim';
                                statusColor = '#30d158';
                        }
                    } else {
                        if (log.error_message) {
                            statusIcon = '❌';
                            statusText = 'Error';
                            statusColor = '#ff3b30';
                        } else {
                            statusIcon = '⏳';
                            statusText = 'Menunggu';
                            statusColor = '#ff9f0a';
                        }
                    }

                    // Format tanggal kirim
                    var tglKirim = '-';
                    if (log.sent_date) {
                        tglKirim = moment(log.sent_date).format('DD MMM YYYY HH:mm');
                    } else if (log.dt_record) {
                        tglKirim = moment(log.dt_record).format('DD MMM YYYY HH:mm') + ' (dijadwalkan)';
                    }

                    // Format nominal
                    var sisaBayar = parseFloat(log.sisa_pembayaran || 0);

                    // Warna accent strip kiri berdasarkan tipe
                    var accentColor = labelColor;

                    html += '<div style="background:#1c1c1e; border:1px solid #38383a; border-radius:12px; margin-bottom:12px; margin-top: 30px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.3);">';

                    // Header bar dengan accent color strip
                    html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:linear-gradient(135deg, #2c2c2e 60%, rgba(60,60,65,0.8)); border-bottom:2px solid ' + accentColor + '33;">';
                    // Kiri: icon + label
                    html += '<div style="display:flex; align-items:center; gap:8px;">';
                    html += '<div style="width:32px; height:32px; border-radius:50%; background:' + accentColor + '22; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0;">' + icon + '</div>';
                    html += '<div>';
                    html += '<div style="color:' + accentColor + '; font-size:13px; font-weight:700; letter-spacing:0.2px;">' + labelText + '</div>';
                    html += '<div style="color:#636366; font-size:10px; margin-top:1px;">Broadcast #' + (i + 1) + '</div>';
                    html += '</div>';
                    html += '</div>';
                    // Kanan: status badge
                    html += '<div style="background:' + statusColor + '22; border:1px solid ' + statusColor + '55; border-radius:20px; padding:4px 10px; display:flex; align-items:center; gap:5px;">';
                    html += '<span style="font-size:11px; line-height:1;">' + statusIcon + '</span>';
                    html += '<span style="color:' + statusColor + '; font-size:11px; font-weight:700;">' + statusText + '</span>';
                    html += '</div>';
                    html += '</div>';

                    // Body info rows
                    html += '<div style="padding:12px 14px;">';

                    // Row: Tanggal Kirim
                    html += '<div style="display:flex; align-items:center; padding:9px 0; border-bottom:1px solid #2c2c2e;">';
                    html += '<span style="color:#ffffff; font-size:13px; width:115px; flex-shrink:0;">📅 Tanggal Kirim</span>';
                    html += '<span style="color:#ffffff; font-size:14px; font-weight:500; flex:1; text-align:right;">' + tglKirim + '</span>';
                    html += '</div>';

                    // Row: No Telepon
                    html += '<div style="display:flex; align-items:center; padding:9px 0; border-bottom:1px solid #2c2c2e;">';
                    html += '<span style="color:#ffffff; font-size:13px; width:115px; flex-shrink:0;">📱 No. Telepon</span>';
                    html += '<span style="color:#ffffff; font-size:14px; font-weight:500; flex:1; text-align:right;">' + (log.phone_number || '-') + '</span>';
                    html += '</div>';

                    // Row: Sisa Bayar
                    html += '<div style="display:flex; align-items:center; padding:9px 0;">';
                    html += '<span style="color:#ffffff; font-size:13px; width:115px; flex-shrink:0;">💰 Sisa Bayar</span>';
                    html += '<span style="color:#ff453a; font-size:15px; font-weight:700; flex:1; text-align:right;">Rp ' + number_format(sisaBayar) + '</span>';
                    html += '</div>';

                    // Error message jika ada
                    if (log.error_message) {
                        html += '<div style="margin-top:8px; padding:8px 10px; background:rgba(255,59,48,0.12); border:1px solid rgba(255,59,48,0.3); border-radius:8px; display:flex; align-items:flex-start; gap:6px;">';
                        html += '<span style="font-size:13px; margin-top:1px;">⚠️</span>';
                        html += '<span style="color:#ff6b6b; font-size:11px; line-height:1.5;">' + log.error_message + '</span>';
                        html += '</div>';
                    }

                    // Pesan preview (collapsible)
                    if (log.message_content) {
                        var previewId = 'msg-preview-' + log.log_broadcast_tagihan_id;
                        html += '<div style="margin-top:10px; border-top:1px solid #2c2c2e; padding-top:10px;">';
                        html += '<a href="#" onclick="var el=jQuery(\'#' + previewId + '\'); el.slideToggle(200); jQuery(this).find(\'.toggle-arrow\').toggleClass(\'rotated\'); return false;" style="text-decoration:none; display:flex; align-items:center; justify-content:space-between;">';
                        html += '<div style="display:flex; align-items:center; gap:6px;">';
                        html += '<span style="font-size:13px;">💬</span>';
                        html += '<span style="color:#007aff; font-size:14px; font-weight:600;">Lihat Isi Pesan</span>';
                        html += '</div>';
                        html += '<span class="toggle-arrow" style="color:#007aff; font-size:11px; transition:transform 0.2s; display:inline-block;">▼</span>';
                        html += '</a>';
                        html += '<div id="' + previewId + '" style="display:none; margin-top:10px;">';
                        html += '<div style="background:#005c4b; border-radius:12px 12px 4px 12px; padding:12px 14px; max-height:240px; overflow-y:auto; box-shadow:0 2px 6px rgba(0,0,0,0.5); position:relative;">';
                        html += '<div style="position:absolute; top:6px; right:8px; color:#ffffff44; font-size:10px;">WhatsApp</div>';
                        html += '<div style="color:#e9fbe5; font-size:13px; line-height:1.7; word-wrap:break-word;">' + formatWhatsAppText(log.message_content) + '</div>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                    }

                    html += '</div>'; // end body
                    html += '</div>'; // end card
                });
            }

            jQuery('#log-broadcast-tagihan-content').html(html);
        },
        error: function (xhr, status, error) {
            jQuery('#log-broadcast-tagihan-content').html(
                '<div style="text-align:center; padding:40px;">' +
                '<div style="font-size:48px; margin-bottom:15px;">⚠️</div>' +
                '<p style="color:#ff3b30; font-size:14px;">Gagal memuat data log</p>' +
                '<p style="color:#636366; font-size:12px;">' + error + '</p>' +
                '</div>'
            );
        }
    });
}

function detailPembayaranTagihan(dt_record, penjualan_tanggal_choose, performa_id_relation, bank_1_id, bank_2_id, bank_3_id, bank_4_id, bank_5_id, bank_6_id, bank_7_id, bank_8_id, bank_9_id, bank_10_id, pembayaran1_tgl, pembayaran2_tgl, pembayaran3_tgl, pembayaran4_tgl, pembayaran5_tgl, pembayaran6_tgl, pembayaran7_tgl, pembayaran8_tgl, pembayaran9_tgl, pembayaran10_tgl, bank_id, pembayaran_1, pembayaran_2, pembayaran_3, pembayaran_4, pembayaran_5, pembayaran_6, pembayaran_7, pembayaran_8, pembayaran_9, pembayaran_10, client_nama, penjualan_jumlah_pembayaran, penjualan_total_qty, penjualan_grandtotal, penjualan_id, client_id, penjualan_status_pembayaran, ongkir) {
	jQuery('#history_pembayaran_multiple').html("");

	if (performa_id_relation != "single") {
		jQuery('.pembayaran_tagihan_single_div').hide();
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/detail-pembayaran-multiple",
			dataType: 'JSON',
			data: {
				performa_id: performa_id_relation,
				user_id: localStorage.getItem("user_id"),
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				jQuery("#bayar_pembayaran").val('');
				$$('#popup-pembayaran-tagihan-td-nospk').html('' + moment(dt_record).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));
				$$('#popup-pembayaran-tagihan-td-client_nama').html(client_nama);
				$$(".bank_pembayaran_tagihan").val(bank_id);
				$$('#popup-pembayaran-tagihan-penjualan_jumlah_pembayaran').html(number_format(data.penjualan_jumlah_pembayaran) + ' ,-');

				var history_pembayaran_multiple = "";
				var no = 1;
				var total_jumlah_pembayaran = 0;
				var ongkir = 0;
				var hasOngkirPending = false;
				
				var ownerBankFromPenjualan = bank_id;
				var ownerBankIdNumeric = null;
				if (ownerBankFromPenjualan) {
					if (!isNaN(ownerBankFromPenjualan) && parseInt(ownerBankFromPenjualan) > 0) {
						ownerBankIdNumeric = parseInt(ownerBankFromPenjualan);
					} else {
						ownerBankIdNumeric = getBankIdByCode(ownerBankFromPenjualan);
					}
				}
				if (!ownerBankIdNumeric) {
					ownerBankIdNumeric = 3;
				}
				var ownerBankDefault = checkIsOwner() ? ownerBankIdNumeric : 3;
				
				function generateBankOptionsForOwnerPayment(selectedBankId) {
					if (checkIsOwner() && selectedBankId) {
						var bankInfo = getBankInfoById(parseInt(selectedBankId));
						var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
						return '<option value="' + selectedBankId + '" selected>' + label + '</option>';
					} else {
						return generateBankOptions(selectedBankId || 3, false);
					}
				}
				
				jQuery.each(data.pembayaran_data, function (i, val) {
					var no = i++;
					var allSlots = [
						val.pembayaran_1, val.pembayaran_2, val.pembayaran_3, val.pembayaran_4, val.pembayaran_5,
						val.pembayaran_6, val.pembayaran_7, val.pembayaran_8, val.pembayaran_9, val.pembayaran_10
					];
					var nextSlot = 1;
					for (var s = 0; s < allSlots.length; s++) {
						if (allSlots[s] === null || allSlots[s] === undefined) {
							nextSlot = s + 1;
							break;
						}
						nextSlot = s + 2;
					}
					if (nextSlot > 10) { nextSlot = null; }

					var renderedInputSlot = null;

					pembayaran_1 = number_format(val.pembayaran_1).replace(/\,/g, '');
					pembayaran_2 = number_format(val.pembayaran_2).replace(/\,/g, '');
					pembayaran_3 = number_format(val.pembayaran_3).replace(/\,/g, '');
					pembayaran_4 = number_format(val.pembayaran_4).replace(/\,/g, '');
					pembayaran_5 = number_format(val.pembayaran_5).replace(/\,/g, '');
					pembayaran_6 = number_format(val.pembayaran_6).replace(/\,/g, '');
					pembayaran_7 = number_format(val.pembayaran_7).replace(/\,/g, '');
					pembayaran_8 = number_format(val.pembayaran_8).replace(/\,/g, '');
					pembayaran_9 = number_format(val.pembayaran_9).replace(/\,/g, '');
					pembayaran_10 = number_format(val.pembayaran_10).replace(/\,/g, '');

					total_jumlah_pembayaran = parseInt(pembayaran_1) + parseInt(pembayaran_2) + parseInt(pembayaran_3) + parseInt(pembayaran_4) + parseInt(pembayaran_5) + parseInt(pembayaran_6) + parseInt(pembayaran_7) + parseInt(pembayaran_8) + parseInt(pembayaran_9) + parseInt(pembayaran_10);

					var total_pembayaran_valid = 0;
					var has_pending_payment = false;
					
					if (val.pembayaran_1 != null && val.pembayaran_1 != 0) {
						if (val.valid_cs_1 == 1) { total_pembayaran_valid += parseInt(pembayaran_1); }
						else if (val.valid_cs_1 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_2 != null && val.pembayaran_2 != 0) {
						if (val.valid_cs_2 == 1) { total_pembayaran_valid += parseInt(pembayaran_2); }
						else if (val.valid_cs_2 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_3 != null && val.pembayaran_3 != 0) {
						if (val.valid_cs_3 == 1) { total_pembayaran_valid += parseInt(pembayaran_3); }
						else if (val.valid_cs_3 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_4 != null && val.pembayaran_4 != 0) {
						if (val.valid_cs_4 == 1) { total_pembayaran_valid += parseInt(pembayaran_4); }
						else if (val.valid_cs_4 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_5 != null && val.pembayaran_5 != 0) {
						if (val.valid_cs_5 == 1) { total_pembayaran_valid += parseInt(pembayaran_5); }
						else if (val.valid_cs_5 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_6 != null && val.pembayaran_6 != 0) {
						if (val.valid_cs_6 == 1) { total_pembayaran_valid += parseInt(pembayaran_6); }
						else if (val.valid_cs_6 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_7 != null && val.pembayaran_7 != 0) {
						if (val.valid_cs_7 == 1) { total_pembayaran_valid += parseInt(pembayaran_7); }
						else if (val.valid_cs_7 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_8 != null && val.pembayaran_8 != 0) {
						if (val.valid_cs_8 == 1) { total_pembayaran_valid += parseInt(pembayaran_8); }
						else if (val.valid_cs_8 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_9 != null && val.pembayaran_9 != 0) {
						if (val.valid_cs_9 == 1) { total_pembayaran_valid += parseInt(pembayaran_9); }
						else if (val.valid_cs_9 == 0) { has_pending_payment = true; }
					}
					if (val.pembayaran_10 != null && val.pembayaran_10 != 0) {
						if (val.valid_cs_10 == 1) { total_pembayaran_valid += parseInt(pembayaran_10); }
						else if (val.valid_cs_10 == 0) { has_pending_payment = true; }
					}

					var statusOngkir = val.status_ongkir || 'pending';
					if (statusOngkir === 'pending') { hasOngkirPending = true; }
					var ongkirLabel = '';
					var ongkirColor = '';
					var ongkirDisplay = '';
					var ongkirEditable = false;
					var isOngkirEdited = val.is_ongkir_edited === 1 || val.is_ongkir_edited === '1';
					var ongkirOriginal = val.ongkir_original || ongkir;

					if (parseInt(val.penjualan_grandtotal) <= parseInt(total_pembayaran_valid) && statusOngkir !== 'pending' && !has_pending_payment) {
						var background_multiple = "#133788";
						var status_lunas = "lunas";
					} else {
						var background_multiple = "";
						var status_lunas = "belum_lunas";
					}

					if (val.ongkir != null) { ongkir += val.ongkir; } else { ongkir = 0; }

					if (statusOngkir === 'pending') {
						ongkirLabel = '(Pending)';
						ongkirColor = '#ff3b30';
						ongkirDisplay = ongkir || 0;
						ongkirEditable = !isOngkirEdited;
					} else if (statusOngkir === 'free') {
						ongkirLabel = '(Free)';
						ongkirColor = '#4cd964';
						ongkirDisplay = 0;
						ongkirEditable = false;
					} else if (statusOngkir === 'nominal') {
						ongkirLabel = '';
						ongkirColor = '#ffa500';
						ongkirDisplay = ongkir;
						ongkirEditable = !isOngkirEdited;
					}
					if (isOngkirEdited) { ongkirColor = '#34c759'; ongkirLabel = ''; }
					
					var sisa_pembayaran = parseFloat(val.penjualan_grandtotal - total_pembayaran_valid);

					$('#ongkir_' + i + '').mask('000,000,000,000', { reverse: true });
					history_pembayaran_multiple += '<table align="center" width="800px" border="0" style="border-collapse: collapse; border:1px solid white;">';

					history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
					history_pembayaran_multiple += '<td align="center" width="15%" colspan="2">';
					history_pembayaran_multiple += '<input type="hidden" id="status_lunas_tagihan_' + i + '" value="' + status_lunas + '" name="status_lunas_tagihan_' + i + '"  /><input type="hidden" id="total_harus_bayar_tagihan_' + val.pembayaran_id + '" value="' + val.penjualan_grandtotal + '" name="total_harus_bayar_tagihan_' + val.pembayaran_id + '"  /><input type="hidden" id="sudah_bayar_tagihan_' + val.pembayaran_id + '" value="' + total_pembayaran_valid + '" name="sudah_bayar_tagihan_' + val.pembayaran_id + '"  />Deadline ' + i + ' : <br>' + moment(val.penjualan_tanggal_kirim).format('DD-MMM-YY') + '';
					history_pembayaran_multiple += '</td>';
					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" colspan="1"';
					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Total : <br>' + number_format(val.penjualan_grandtotal - ongkir) + '';
					history_pembayaran_multiple += '</td>';
					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" colspan="1"';
					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Terbayar : <br>' + number_format(total_pembayaran_valid) + '';
					history_pembayaran_multiple += '</td>';
					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Sisa : <br>' + number_format((val.penjualan_grandtotal - total_pembayaran_valid)) + '';
					history_pembayaran_multiple += '</td>';
					history_pembayaran_multiple += '<td width="25%" colspan="3" style="border-collapse: collapse; border-left:1px solid white; border-top:1px solid white; border-bottom:1px solid white; background-color:' + ongkirColor + ';" colspan="1"';
					history_pembayaran_multiple += ' class="numeric-cell text-align-center">';
					
					var ongkirText = 'Ongkir';
					if (val.nama_kota_pengiriman) { ongkirText += ' (' + val.nama_kota_pengiriman + ')'; }
					if (ongkirLabel) {
						history_pembayaran_multiple += '<span style="color:white; font-weight:bold;">' + ongkirText + ' : ' + ongkirLabel + '</span><br>';
					} else {
						history_pembayaran_multiple += '<span style="color:white; font-weight:bold;">' + ongkirText + ' :</span><br>';
					}
					
					if (ongkirEditable) {
						history_pembayaran_multiple += '<input style="text-align:center; width:100%; background-color:#e5e5e7; color:#3a3a3c; cursor:pointer;" ';
						history_pembayaran_multiple += 'placeholder="Klik untuk edit" ';
						history_pembayaran_multiple += 'value="' + ongkirDisplay + '" ';
						history_pembayaran_multiple += 'onclick="handleOngkirClick(this, \'' + i + '\', \'' + val.penjualan_id + '\', \'' + ongkirOriginal + '\', \'' + statusOngkir + '\');" ';
						history_pembayaran_multiple += 'name="ongkir_tagihan_' + i + '" id="ongkir_tagihan_' + i + '" ';
						history_pembayaran_multiple += 'data-original-value="' + ongkirOriginal + '" data-is-edited="false" ';
						history_pembayaran_multiple += 'data-penjualan-id="' + val.penjualan_id + '" data-status-ongkir="' + statusOngkir + '" ';
						history_pembayaran_multiple += 'data-id-kota-pengiriman="' + (val.id_kota_pengiriman || '') + '" ';
						history_pembayaran_multiple += 'data-nama-kota-pengiriman="' + (val.nama_kota_pengiriman || '') + '" ';
						history_pembayaran_multiple += 'class="text-add-colour-black-soft button-small text-bold ongkir-field" type="text" readonly>';
					} else if (isOngkirEdited) {
						history_pembayaran_multiple += '<input style="text-align:center; width:100%; background-color:#34c759; color:white; cursor:not-allowed; font-weight:bold;" ';
						history_pembayaran_multiple += 'value="' + ongkirDisplay + '" ';
						history_pembayaran_multiple += 'onclick="handleOngkirClick(this, \'' + i + '\', \'' + val.penjualan_id + '\', \'' + ongkirOriginal + '\', \'' + statusOngkir + '\');" ';
						history_pembayaran_multiple += 'name="ongkir_tagihan_' + i + '" id="ongkir_tagihan_' + i + '" ';
						history_pembayaran_multiple += 'data-original-value="' + ongkirOriginal + '" data-is-edited="true" ';
						history_pembayaran_multiple += 'data-penjualan-id="' + val.penjualan_id + '" data-status-ongkir="' + statusOngkir + '" ';
						history_pembayaran_multiple += 'data-id-kota-pengiriman="' + (val.id_kota_pengiriman || '') + '" ';
						history_pembayaran_multiple += 'data-nama-kota-pengiriman="' + (val.nama_kota_pengiriman || '') + '" ';
						history_pembayaran_multiple += 'class="text-add-colour-black-soft button-small text-bold ongkir-field" type="text" readonly>';
					} else {
						history_pembayaran_multiple += '<span style="font-size:16px; font-weight:bold; color:white;">' + ongkirDisplay + '</span>';
					}
					history_pembayaran_multiple += '</td>';

					history_pembayaran_multiple += ' </tr>';
					history_pembayaran_multiple += '<tr class="bg-dark-gray-medium">';
					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar</td>';
					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">Tanggal</td>';
					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">Bank</td>';
					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">Jumlah</td>';
					history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="3" class="numeric-cell text-align-center">Keterangan</td>';
					history_pembayaran_multiple += '  </tr>';
					history_pembayaran_multiple += '<tbody id="table_num_tagihan_' + i + '">';

					// ============================================================
					// BAYAR 1
					// ============================================================
					if (val.pembayaran_1 != null && val.pembayaran_1 != 0) {
						if (val.valid_cs_1 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 1</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran1_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_1_id, val.bank_1) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="total_jumlah_pembayaran_tagihan_' + i + ' numeric-cell text-align-center">' + number_format(val.pembayaran_1) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_1 != null ? val.keterangan_1 : '-') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 1\',\'foto_1\',\'' + val.pembayaran_id + '\',\'' + val.foto_1 + '\',\'' + val.pembayaran_1 + '\',\'' + val.keterangan_1 + '\',\'' + val.bank_1 + '\',\'' + val.pembayaran1_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_1 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_1 == 1 || val.valid_cs_1 == 0) {
							var bg_row_1 = (val.valid_cs_1 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_1 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 1</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran1_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_1_id, val.bank_1) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="total_jumlah_pembayaran_tagihan_' + i + ' numeric-cell text-align-center">' + number_format(val.pembayaran_1) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_1 != null ? val.keterangan_1 : '-') + '</td>';
							if (val.foto_1 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_1\',\'' + val.pembayaran_id + '\',\'' + val.foto_1 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_1\',\'' + val.pembayaran_id + '\',\'' + val.foto_1 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (nextSlot !== null) {
							var ns = nextSlot;
							renderedInputSlot = ns;

							history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_' + ns + '_' + val.pembayaran_id + '"><tr>';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar ' + ns + '</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;text-align:center;" id="tanggal_tagihan_' + ns + '_' + val.pembayaran_id + '" name="tanggal_tagihan_' + ns + '_' + val.pembayaran_id + '" type="date" value="' + moment().format('YYYY-MM-DD') + '" class="date-multiple-penbayaran-tagihan" readonly></td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
							if (checkIsOwner() && ownerBankDefault) {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_' + ns + '_' + val.pembayaran_id + '" name="bank_tagihan_' + ns + '_' + val.pembayaran_id + '">';
								history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
								history_pembayaran_multiple += '</select>';
							} else {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_' + ns + '_' + val.pembayaran_id + '" name="bank_tagihan_' + ns + '_' + val.pembayaran_id + '">';
								history_pembayaran_multiple += generateBankOptions(3, false);
								history_pembayaran_multiple += '</select>';
							}
							history_pembayaran_multiple += '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" class="input-pembayaran-multiple-tagihan" id="pembayaran_tagihan_' + ns + '_' + val.pembayaran_id + '" name="pembayaran_tagihan_' + ns + '_' + val.pembayaran_id + '" type="text"></td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_' + ns + '_' + val.pembayaran_id + '" name="keterangan_tagihan_' + ns + '_' + val.pembayaran_id + '" type="text"></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_' + ns + '_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_' + ns + '_' + val.pembayaran_id + '" name="foto_bukti_tagihan_' + ns + '_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',' + ns + ');"></td>';
							history_pembayaran_multiple += ' </tr></form>';
						}
					}

					// ============================================================
					// BAYAR 2
					// ============================================================
					if (val.pembayaran_2 != null && val.pembayaran_2 != 0) {
						if (val.valid_cs_2 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 2</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran2_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_2_id, val.bank_2) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_2) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_2 != null ? val.keterangan_2 : '') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 2\',\'foto_2\',\'' + val.pembayaran_id + '\',\'' + val.foto_2 + '\',\'' + val.pembayaran_2 + '\',\'' + val.keterangan_2 + '\',\'' + val.bank_2 + '\',\'' + val.pembayaran2_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_2 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_2 == 1 || val.valid_cs_2 == 0) {
							var bg_row_2 = (val.valid_cs_2 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_2 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 2</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran2_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_2_id, val.bank_2) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_2) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_2 != null ? val.keterangan_2 : '') + '</td>';
							if (val.foto_2 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_2\',\'' + val.pembayaran_id + '\',\'' + val.foto_2 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_2\',\'' + val.pembayaran_id + '\',\'' + val.foto_2 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_1 != null && val.pembayaran_1 != 0) {
							if (status_lunas != "lunas" && val.valid_cs_1 == 1) {
								if (renderedInputSlot != 2) {
									history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_2_' + val.pembayaran_id + '"><tr>';
									history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 2</td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_2_' + val.pembayaran_id + '" name="tanggal_tagihan_2_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
									history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
									if (checkIsOwner() && ownerBankDefault) {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_2_' + val.pembayaran_id + '" name="bank_tagihan_2_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
										history_pembayaran_multiple += '</select>';
									} else {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_2_' + val.pembayaran_id + '" name="bank_tagihan_2_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(3, false);
										history_pembayaran_multiple += '</select>';
									}
									history_pembayaran_multiple += '</td>';
									history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_2_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_2_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_2_' + val.pembayaran_id + '" name="keterangan_tagihan_2_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_2_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_2_' + val.pembayaran_id + '" name="foto_bukti_tagihan_2_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',2);"></td>';
									history_pembayaran_multiple += ' </tr></form>';
								}
							}
						}
					}

					// ============================================================
					// BAYAR 3
					// ============================================================
					if (val.pembayaran_3 != null && val.pembayaran_3 != 0) {
						if (val.valid_cs_3 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 3</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran3_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_3_id, val.bank_3) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_3) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_3 != null ? val.keterangan_3 : '-') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 3\',\'foto_3\',\'' + val.pembayaran_id + '\',\'' + val.foto_3 + '\',\'' + val.pembayaran_3 + '\',\'' + val.keterangan_3 + '\',\'' + val.bank_3 + '\',\'' + val.pembayaran3_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_3 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_3 == 1 || val.valid_cs_3 == 0) {
							var bg_row_3 = (val.valid_cs_3 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_3 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 3</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran3_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_3_id, val.bank_3) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_3) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_3 != null ? val.keterangan_3 : '-') + '</td>';
							if (val.foto_3 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_3\',\'' + val.pembayaran_id + '\',\'' + val.foto_3 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_3\',\'' + val.pembayaran_id + '\',\'' + val.foto_3 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_2 != null && val.pembayaran_2 != 0) {
							if (status_lunas != "lunas" && val.valid_cs_2 == 1) {
								if (renderedInputSlot != 3) {
									history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_3_' + val.pembayaran_id + '"><tr>';
									history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 3</td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_3_' + val.pembayaran_id + '" name="tanggal_tagihan_3_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
									history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
									if (checkIsOwner() && ownerBankDefault) {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_3_' + val.pembayaran_id + '" name="bank_tagihan_3_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
										history_pembayaran_multiple += '</select>';
									} else {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_3_' + val.pembayaran_id + '" name="bank_tagihan_3_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(3, false);
										history_pembayaran_multiple += '</select>';
									}
									history_pembayaran_multiple += '</td>';
									history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_3_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_3_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_3_' + val.pembayaran_id + '" name="keterangan_tagihan_3_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_3_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_3_' + val.pembayaran_id + '" name="foto_bukti_tagihan_3_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',3);"></td>';
									history_pembayaran_multiple += ' </tr></form>';
								}
							}
						}
					}

					// ============================================================
					// BAYAR 4
					// ============================================================
					if (val.pembayaran_4 != null && val.pembayaran_4 != 0) {
						if (val.valid_cs_4 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 4</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran4_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_4_id, val.bank_4) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_4) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_4 != null ? val.keterangan_4 : '-') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 4\',\'foto_4\',\'' + val.pembayaran_id + '\',\'' + val.foto_4 + '\',\'' + val.pembayaran_4 + '\',\'' + val.keterangan_4 + '\',\'' + val.bank_4 + '\',\'' + val.pembayaran4_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_4 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_4 == 1 || val.valid_cs_4 == 0) {
							var bg_row_4 = (val.valid_cs_4 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_4 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 4</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran4_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_4_id, val.bank_4) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_4) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_4 != null ? val.keterangan_4 : '-') + '</td>';
							if (val.foto_4 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_4\',\'' + val.pembayaran_id + '\',\'' + val.foto_4 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_4\',\'' + val.pembayaran_id + '\',\'' + val.foto_4 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_3 != null && val.pembayaran_3 != 0) {
							if (status_lunas != "lunas" && val.valid_cs_3 == 1) {
								if (renderedInputSlot != 4) {
									history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_4_' + val.pembayaran_id + '"><tr>';
									history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 4</td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_4_' + val.pembayaran_id + '" name="tanggal_tagihan_4_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
									if (checkIsOwner() && ownerBankDefault) {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_4_' + val.pembayaran_id + '" name="bank_tagihan_4_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
										history_pembayaran_multiple += '</select>';
									} else {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_4_' + val.pembayaran_id + '" name="bank_tagihan_4_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(3, false);
										history_pembayaran_multiple += '</select>';
									}
									history_pembayaran_multiple += '</td>';
									history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_4_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_4_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_4_' + val.pembayaran_id + '" name="keterangan_tagihan_4_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_4_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_4_' + val.pembayaran_id + '" name="foto_bukti_tagihan_4_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',4);"></td>';
									history_pembayaran_multiple += ' </tr></form>';
								}
							}
						}
					}

					// ============================================================
					// BAYAR 5
					// ============================================================
					if (val.pembayaran_5 != null && val.pembayaran_5 != 0) {
						if (val.valid_cs_5 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 5</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran5_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_5_id, val.bank_5) + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_5) + '</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_5 != null ? val.keterangan_5 : '-') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 5\',\'foto_5\',\'' + val.pembayaran_id + '\',\'' + val.foto_5 + '\',\'' + val.pembayaran_5 + '\',\'' + val.keterangan_5 + '\',\'' + val.bank_5 + '\',\'' + val.pembayaran5_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_5 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_5 == 1 || val.valid_cs_5 == 0) {
							var bg_row_5 = (val.valid_cs_5 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_5 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 5</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran5_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_5_id, val.bank_5) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_5) + '</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_5 != null ? val.keterangan_5 : '-') + '</td>';
							if (val.foto_5 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_5\',\'' + val.pembayaran_id + '\',\'' + val.foto_5 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_5\',\'' + val.pembayaran_id + '\',\'' + val.foto_5 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_4 != null && val.pembayaran_4 != 0) {
							if (status_lunas != "lunas" && val.valid_cs_4 == 1) {
								if (renderedInputSlot != 5) {
									history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_5_' + val.pembayaran_id + '"><tr>';
									history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 5</td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_5_' + val.pembayaran_id + '" name="tanggal_tagihan_5_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
									if (checkIsOwner() && ownerBankDefault) {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_5_' + val.pembayaran_id + '" name="bank_tagihan_5_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
										history_pembayaran_multiple += '</select>';
									} else {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_5_' + val.pembayaran_id + '" name="bank_tagihan_5_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(3, false);
										history_pembayaran_multiple += '</select>';
									}
									history_pembayaran_multiple += '</td>';
									history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_5_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_5_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_5_' + val.pembayaran_id + '" name="keterangan_tagihan_5_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_5_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_5_' + val.pembayaran_id + '" name="foto_bukti_tagihan_5_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',5);"></td>';
									history_pembayaran_multiple += ' </tr></form>';
								}
							}
						}
					}

					// ============================================================
					// BAYAR 6
					// ============================================================
					if (val.pembayaran_6 != null && val.pembayaran_6 != 0) {
						if (val.valid_cs_6 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 6</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran6_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_6_id, val.bank_6) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_6) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_6 != null ? val.keterangan_6 : '-') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 6\',\'foto_6\',\'' + val.pembayaran_id + '\',\'' + val.foto_6 + '\',\'' + val.pembayaran_6 + '\',\'' + val.keterangan_6 + '\',\'' + val.bank_6 + '\',\'' + val.pembayaran6_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_6 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_6 == 1 || val.valid_cs_6 == 0) {
							var bg_row_6 = (val.valid_cs_6 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_6 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 6</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran6_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_6_id, val.bank_6) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_6) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_6 != null ? val.keterangan_6 : '-') + '</td>';
							if (val.foto_6 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_6\',\'' + val.pembayaran_id + '\',\'' + val.foto_6 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_6\',\'' + val.pembayaran_id + '\',\'' + val.foto_6 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_5 != null && val.pembayaran_5 != 0 && val.valid_cs_5 == 1) {
							if (renderedInputSlot != 6) {
								history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_6_' + val.pembayaran_id + '"><tr>';
								history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 6</td>';
								history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_6_' + val.pembayaran_id + '" name="tanggal_tagihan_6_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
								if (checkIsOwner() && ownerBankDefault) {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_6_' + val.pembayaran_id + '" name="bank_tagihan_6_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
									history_pembayaran_multiple += '</select>';
								} else {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_6_' + val.pembayaran_id + '" name="bank_tagihan_6_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(3, false);
									history_pembayaran_multiple += '</select>';
								}
								history_pembayaran_multiple += '</td>';
								history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_6_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_6_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_6_' + val.pembayaran_id + '" name="keterangan_tagihan_6_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_6_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_6_' + val.pembayaran_id + '" name="foto_bukti_tagihan_6_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',6);"></td>';
								history_pembayaran_multiple += ' </tr></form>';
							}
						}
					}

					// ============================================================
					// BAYAR 7
					// ============================================================
					if (val.pembayaran_7 != null && val.pembayaran_7 != 0) {
						if (val.valid_cs_7 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 7</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran7_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_7_id, val.bank_7) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_7) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" ' + (val.keterangan_7 != null ? 'class="numeric-cell text-align-center">' + val.keterangan_7 : 'class="numeric-cell text-align-center">-') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 7\',\'foto_7\',\'' + val.pembayaran_id + '\',\'' + val.foto_7 + '\',\'' + val.pembayaran_7 + '\',\'' + val.keterangan_7 + '\',\'' + val.bank_7 + '\',\'' + val.pembayaran7_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_7 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_7 == 1 || val.valid_cs_7 == 0) {
							var bg_row_7 = (val.valid_cs_7 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_7 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 7</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran7_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_7_id, val.bank_7) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_7) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" ' + (val.keterangan_7 != null ? 'class="numeric-cell text-align-center">' + val.keterangan_7 : 'class="numeric-cell text-align-center">-') + '</td>';
							if (val.foto_7 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_7\',\'' + val.pembayaran_id + '\',\'' + val.foto_7 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_7\',\'' + val.pembayaran_id + '\',\'' + val.foto_7 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_6 != null && val.pembayaran_6 != 0 && val.valid_cs_6 == 1) {
							if (renderedInputSlot != 7) {
								history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_7_' + val.pembayaran_id + '"><tr>';
								history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 7</td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_7_' + val.pembayaran_id + '" name="tanggal_tagihan_7_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
								history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
								if (checkIsOwner() && ownerBankDefault) {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_7_' + val.pembayaran_id + '" name="bank_tagihan_7_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
									history_pembayaran_multiple += '</select>';
								} else {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_7_' + val.pembayaran_id + '" name="bank_tagihan_7_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(3, false);
									history_pembayaran_multiple += '</select>';
								}
								history_pembayaran_multiple += '</td>';
								history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_7_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_7_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_7_' + val.pembayaran_id + '" name="keterangan_tagihan_7_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_7_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_7_' + val.pembayaran_id + '" name="foto_bukti_tagihan_7_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',7);"></td>';
								history_pembayaran_multiple += ' </tr></form>';
							}
						}
					}

					// ============================================================
					// BAYAR 8
					// ============================================================
					if (val.pembayaran_8 != null && val.pembayaran_8 != 0) {
						if (val.valid_cs_8 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 8</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran8_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_8_id, val.bank_8) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_8) + '</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_8 != null ? val.keterangan_8 : '-') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 8\',\'foto_8\',\'' + val.pembayaran_id + '\',\'' + val.foto_8 + '\',\'' + val.pembayaran_8 + '\',\'' + val.keterangan_8 + '\',\'' + val.bank_8 + '\',\'' + val.pembayaran8_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_8 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_8 == 1 || val.valid_cs_8 == 0) {
							var bg_row_8 = (val.valid_cs_8 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_8 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 8</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran8_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_8_id, val.bank_8) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_8) + '</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_8 != null ? val.keterangan_8 : '-') + '</td>';
							if (val.foto_8 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_8\',\'' + val.pembayaran_id + '\',\'' + val.foto_8 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_8\',\'' + val.pembayaran_id + '\',\'' + val.foto_8 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_7 != null && val.pembayaran_7 != 0 && val.valid_cs_7 == 1) {
							if (renderedInputSlot != 8) {
								history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_8_' + val.pembayaran_id + '"><tr>';
								history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 8</td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_8_' + val.pembayaran_id + '" name="tanggal_tagihan_8_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
								if (checkIsOwner() && ownerBankDefault) {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_8_' + val.pembayaran_id + '" name="bank_tagihan_8_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
									history_pembayaran_multiple += '</select>';
								} else {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_8_' + val.pembayaran_id + '" name="bank_tagihan_8_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(3, false);
									history_pembayaran_multiple += '</select>';
								}
								history_pembayaran_multiple += '</td>';
								history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_8_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_8_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_8_' + val.pembayaran_id + '" name="keterangan_tagihan_8_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_8_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_8_' + val.pembayaran_id + '" name="foto_bukti_tagihan_8_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',8);"></td>';
								history_pembayaran_multiple += ' </tr></form>';
							}
						}
					}

					// ============================================================
					// BAYAR 9
					// ============================================================
					if (val.pembayaran_9 != null && val.pembayaran_9 != 0) {
						if (val.valid_cs_9 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 9</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran9_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_9_id, val.bank_9) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_9) + '</td>';
							history_pembayaran_multiple += (val.keterangan_9 != null ? '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + val.keterangan_9 + '</td>' : '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">-</td>');
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 9\',\'foto_9\',\'' + val.pembayaran_id + '\',\'' + val.foto_9 + '\',\'' + val.pembayaran_9 + '\',\'' + val.keterangan_9 + '\',\'' + val.bank_9 + '\',\'' + val.pembayaran9_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_9 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_9 == 1 || val.valid_cs_9 == 0) {
							var bg_row_9 = (val.valid_cs_9 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_9 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 9</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran9_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_9_id, val.bank_9) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_9) + '</td>';
							history_pembayaran_multiple += (val.keterangan_9 != null ? '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + val.keterangan_9 + '</td>' : '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">-</td>');
							if (val.foto_9 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_9\',\'' + val.pembayaran_id + '\',\'' + val.foto_9 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_9\',\'' + val.pembayaran_id + '\',\'' + val.foto_9 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_8 != null && val.pembayaran_8 != 0 && val.valid_cs_8 == 1) {
							if (renderedInputSlot != 9) {
								history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_9_' + val.pembayaran_id + '"><tr>';
								history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 9</td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_9_' + val.pembayaran_id + '" name="tanggal_tagihan_9_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
								if (checkIsOwner() && ownerBankDefault) {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_9_' + val.pembayaran_id + '" name="bank_tagihan_9_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
									history_pembayaran_multiple += '</select>';
								} else {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_9_' + val.pembayaran_id + '" name="bank_tagihan_9_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(3, false);
									history_pembayaran_multiple += '</select>';
								}
								history_pembayaran_multiple += '</td>';
								history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_9_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_9_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_9_' + val.pembayaran_id + '" name="keterangan_tagihan_9_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_9_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_9_' + val.pembayaran_id + '" name="foto_bukti_tagihan_9_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',9);"></td>';
								history_pembayaran_multiple += ' </tr></form>';
							}
						}
					}

					// ============================================================
					// BAYAR 10
					// ============================================================
					if (val.pembayaran_10 != null && val.pembayaran_10 != 0) {
						if (val.valid_cs_10 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 10</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran10_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_10_id, val.bank_10) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_10) + '</td>';
							history_pembayaran_multiple += (val.keterangan_10 != null ? '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + val.keterangan_10 + '</td>' : '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">-</td>');
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 10\',\'foto_10\',\'' + val.pembayaran_id + '\',\'' + val.foto_10 + '\',\'' + val.pembayaran_10 + '\',\'' + val.keterangan_10 + '\',\'' + val.bank_10 + '\',\'' + val.pembayaran10_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_10 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_10 == 1 || val.valid_cs_10 == 0) {
							var bg_row_10 = (val.valid_cs_10 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_10 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 10</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran10_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_10_id, val.bank_10) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(val.pembayaran_10) + '</td>';
							history_pembayaran_multiple += (val.keterangan_10 != null ? '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + val.keterangan_10 + '</td>' : '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">-</td>');
							if (val.foto_10 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_10\',\'' + val.pembayaran_id + '\',\'' + val.foto_10 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_10\',\'' + val.pembayaran_id + '\',\'' + val.foto_10 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_9 != null && val.pembayaran_9 != 0 && val.valid_cs_9 == 1) {
							if (renderedInputSlot != 10) {
								history_pembayaran_multiple += '<form id="pembayaran_form_multiple_tagihan_10_' + val.pembayaran_id + '"><tr>';
								history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 10</td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_tagihan_10_' + val.pembayaran_id + '" name="tanggal_tagihan_10_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran-tagihan" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
								if (checkIsOwner() && ownerBankDefault) {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_10_' + val.pembayaran_id + '" name="bank_tagihan_10_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
									history_pembayaran_multiple += '</select>';
								} else {
									history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank-tagihan" id="bank_tagihan_10_' + val.pembayaran_id + '" name="bank_tagihan_10_' + val.pembayaran_id + '" required validate>';
									history_pembayaran_multiple += generateBankOptions(3, false);
									history_pembayaran_multiple += '</select>';
								}
								history_pembayaran_multiple += '</td>';
								history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_tagihan_10_' + val.pembayaran_id + '" class="input-pembayaran-multiple-tagihan" name="pembayaran_tagihan_10_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="20%" colspan="2" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_tagihan_10_' + val.pembayaran_id + '" name="keterangan_tagihan_10_' + val.pembayaran_id + '" type="text"/></td>';
								history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_tagihan_10_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_tagihan_10_' + val.pembayaran_id + '" name="foto_bukti_tagihan_10_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + val.pembayaran_id + ',10);"></td>';
								history_pembayaran_multiple += ' </tr></form>';
							}
						}
					}

					history_pembayaran_multiple += '<tbody>';
					history_pembayaran_multiple += '</table><br>';
				});

				$$('#popup-pembayaran-tagihan-penjualan_grandtotal').html(number_format(parseInt(data.penjualan_total)) + ' ,-');
				$$('#popup-pembayaran-tagihan-penjualan_kekurangan').html(number_format((parseInt(data.penjualan_grandtotal)) - data.penjualan_jumlah_pembayaran) + ' ,-');
				$$('#popup-pembayaran-tagihan-ongkir').html(number_format(parseInt(data.ongkir)) + ' ,-');
				$$('#popup-pembayaran-tagihan-packing').html(number_format(parseInt(data.total_biaya_packing)) + ' ,-');

				if (((data.penjualan_grandtotal) - data.penjualan_jumlah_pembayaran) <= 0 && !hasOngkirPending) {
					$$('#popup-pembayaran-tagihan-penjualan_status_pembayaran').html('<b class="card-color-blue" style="padding-left:42px; padding-right:12px;">Lunas</b>');
					$$('#popup-pembayaran-tagihan-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue');
				} else {
					$$('#popup-pembayaran-tagihan-penjualan_status_pembayaran').html('<b class="card-color-green" style="padding-left:42px; padding-right:12px;">Belum Lunas</b>');
					$$('#popup-pembayaran-tagihan-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue');
				}

				jQuery('#history_pembayaran_multiple').html(history_pembayaran_multiple);
				jQuery('#table_num_tagihan_1').show();
				jQuery('#table_num_tagihan_2').show();
				jQuery('#table_num_tagihan_3').show();
				jQuery('#table_num_tagihan_4').show();
				jQuery('#table_num_tagihan_5').show();
				jQuery('#table_num_tagihan_6').show();
				jQuery('#table_num_tagihan_7').show();
				jQuery('#table_num_tagihan_8').show();
				jQuery('#table_num_tagihan_9').show();
				jQuery('#table_num_tagihan_10').show();

				var today = moment().format('YYYY-MM-DD');
				document.getElementsByClassName("date-multiple-penbayaran-tagihan")[0].setAttribute('min', today);
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});

	} else {
		jQuery('.pembayaran_tagihan_single_div').show();

		jQuery("#bayar_pembayaran").val('');
		$$('#popup-pembayaran-tagihan-td-client_nama').html(client_nama + ', PT');
		$$(".bank_pembayaran_tagihan").val(bank_id);
		$$('#popup-pembayaran-tagihan-penjualan_grandtotal').html(number_format(penjualan_grandtotal) + ' ,-');
		$$('#popup-pembayaran-tagihan-penjualan_jumlah_pembayaran').html(number_format(penjualan_jumlah_pembayaran) + ' ,-');
		$$('#popup-pembayaran-tagihan-penjualan_kekurangan').html(number_format((penjualan_grandtotal + ongkir) - penjualan_jumlah_pembayaran) + ' ,-');
		$$('#popup-pembayaran-tagihan-penjualan_status_pembayaran').html('<b>' + penjualan_status_pembayaran + '</b>');

		if (penjualan_status_pembayaran == 'Lunas') {
			$$('#popup-pembayaran-tagihan-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue').addClass('card-color-blue');
			$$('#content_bayar1_tagihan').css("background-color", "#133788");
			$$('#content_bayar2_tagihan').css("background-color", "#133788");
			$$('#content_bayar3_tagihan').css("background-color", "#133788");
			$$('#content_bayar4_tagihan').css("background-color", "#133788");
			$$('#content_bayar5_tagihan').css("background-color", "#133788");
			$$('#content_bayar6_tagihan').css("background-color", "#133788");
			$$('#content_bayar7_tagihan').css("background-color", "#133788");
			$$('#content_bayar8_tagihan').css("background-color", "#133788");
			$$('#content_bayar9_tagihan').css("background-color", "#133788");
			$$('#content_bayar10_tagihan').css("background-color", "#133788");
		} else {
			$$('#popup-pembayaran-tagihan-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue').addClass('card-color-green');
		}
	}

	$$('#tanggal_pembayaran_choose').html(moment(penjualan_tanggal_choose).format('DD-MMM-YYYY'));

	// BAYAR 1
	if (number_format(pembayaran_1) != 0) {
		$$('#content_bayar2_tagihan').show();
		$$('#pembayaran_tagihan_1_dp_awal').val(number_format(pembayaran_1));
		$$('#popup-pembayaran-tagihan-tgl1').html(moment(pembayaran1_tgl).format('DD-MMM-YYYY'));
		$$('#pembayaran_tagihan_1_dp_awal').attr('readonly', true);
		$$('#pembayaran_tagihan_1_dp_awal').prop("onclick", null).off("click");
		$$('#bank_tagihan_1').val(bank_id);
	} else {
		$$('#pembayaran_tagihan_1_dp_awal').val(number_format(0));
		$$('#content_bayar2_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl1').html("");
		$$('#pembayaran_tagihan_1_dp_awal').removeAttr("readonly");
		$$('#pembayaran_tagihan_1_dp_awal').attr('onClick', 'emptyValue("pembayaran_tagihan_1_dp_awal")');
		$$('#bank_tagihan_1').val(bank_id);
	}

	// BAYAR 2
	if (number_format(pembayaran_2) != 0) {
		$$('#content_bayar3_tagihan').show();
		$$('#pembayaran_tagihan_2').val(number_format(pembayaran_2));
		$$('#popup-pembayaran-tagihan-tgl2').html(moment(pembayaran2_tgl).format('DD-MMM-YYYY'));
		$$('#pembayaran_tagihan_2').attr('readonly', true);
		$$('#pembayaran_tagihan_2').prop("onclick", null).off("click");
		$$('#bank_tagihan_2').val(bank_2_id);
	} else {
		$$('#pembayaran_tagihan_2').val(number_format(0));
		$$('#content_bayar3_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl2').html("");
		$$('#pembayaran_tagihan_2').removeAttr("readonly");
		$$('#pembayaran_tagihan_2').attr('onClick', 'emptyValue("pembayaran_tagihan_2")');
		$$('#bank_tagihan_2').val(bank_id);
	}

	// BAYAR 3
	if (number_format(pembayaran_3) != 0) {
		$$('#pembayaran_tagihan_3').val(number_format(pembayaran_3));
		$$('#popup-pembayaran-tagihan-tgl3').html(moment(pembayaran3_tgl).format('DD-MMM-YYYY'));
		$$('#pembayaran_tagihan_3').attr('readonly', true);
		$$('#content_bayar4_tagihan').show();
		$$('#pembayaran_tagihan_3').prop("onclick", null).off("click");
		$$('#bank_tagihan_3').val(bank_3_id);
	} else {
		$$('#pembayaran_tagihan_3').val(number_format(0));
		$$('#content_bayar4_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl3').html("");
		$$('#pembayaran_tagihan_3').removeAttr("readonly");
		$$('#pembayaran_tagihan_3').attr('onClick', 'emptyValue("pembayaran_tagihan_3")');
		$$('#bank_tagihan_3').val(bank_id);
	}

	// BAYAR 4
	if (number_format(pembayaran_4) != 0) {
		$$('#pembayaran_tagihan_4').val(number_format(pembayaran_4));
		$$('#popup-pembayaran-tagihan-tgl4').html(moment(pembayaran4_tgl).format('DD-MMM-YYYY'));
		$$('#pembayaran_tagihan_4').attr('readonly', true);
		$$('#content_bayar5_tagihan').show();
		$$('#pembayaran_tagihan_4').prop("onclick", null).off("click");
		$$('#bank_tagihan_4').val(bank_4_id);
	} else {
		$$('#pembayaran_tagihan_4').val(number_format(0));
		$$('#content_bayar5_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl4').html("");
		$$('#pembayaran_tagihan_4').removeAttr("readonly");
		$$('#pembayaran_tagihan_4').attr('onClick', 'emptyValue("pembayaran_tagihan_4")');
		$$('#bank_tagihan_4').val(bank_id);
	}

	// BAYAR 5
	if (number_format(pembayaran_5) != 0) {
		$$('#pembayaran_tagihan_5').val(number_format(pembayaran_5));
		$$('#pembayaran_tagihan_5').attr('readonly', true);
		$$('#popup-pembayaran-tagihan-tgl5').html(moment(pembayaran5_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar6_tagihan').show();
		$$('#pembayaran_tagihan_5').prop("onclick", null).off("click");
		$$('#bank_tagihan_5').val(bank_5_id);
	} else {
		$$('#pembayaran_tagihan_5').val(number_format(0));
		$$('#content_bayar6_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl5').html("");
		$$('#pembayaran_tagihan_5').removeAttr("readonly");
		$$('#pembayaran_tagihan_5').attr('onClick', 'emptyValue("pembayaran_tagihan_5")');
		$$('#bank_tagihan_5').val(bank_id);
	}

	// BAYAR 6
	if (number_format(pembayaran_6) != 0) {
		$$('#pembayaran_tagihan_6').val(number_format(pembayaran_6));
		$$('#pembayaran_tagihan_6').attr('readonly', true);
		$$('#popup-pembayaran-tagihan-tgl6').html(moment(pembayaran6_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar7_tagihan').show();
		$$('#pembayaran_tagihan_6').prop("onclick", null).off("click");
		$$('#bank_tagihan_6').val(bank_6_id);
	} else {
		$$('#pembayaran_tagihan_6').val(number_format(0));
		$$('#content_bayar7_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl6').html("");
		$$('#pembayaran_tagihan_6').removeAttr("readonly");
		$$('#pembayaran_tagihan_6').attr('onClick', 'emptyValue("pembayaran_tagihan_6")');
		$$('#bank_tagihan_6').val(bank_id);
	}

	// BAYAR 7
	if (number_format(pembayaran_7) != 0) {
		$$('#pembayaran_tagihan_7').val(number_format(pembayaran_7));
		$$('#pembayaran_tagihan_7').attr('readonly', true);
		$$('#popup-pembayaran-tagihan-tgl7').html(moment(pembayaran7_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar8_tagihan').show();
		$$('#pembayaran_tagihan_7').prop("onclick", null).off("click");
		$$('#bank_tagihan_7').val(bank_7_id);
	} else {
		$$('#pembayaran_tagihan_7').val(number_format(0));
		$$('#content_bayar8_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl7').html("");
		$$('#pembayaran_tagihan_7').removeAttr("readonly");
		$$('#pembayaran_tagihan_7').attr('onClick', 'emptyValue("pembayaran_tagihan_7")');
		$$('#bank_tagihan_7').val(bank_id);
	}

	// BAYAR 8
	if (number_format(pembayaran_8) != 0) {
		$$('#pembayaran_tagihan_8').val(number_format(pembayaran_8));
		$$('#pembayaran_tagihan_8').attr('readonly', true);
		$$('#popup-pembayaran-tagihan-tgl8').html(moment(pembayaran8_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar9_tagihan').show();
		$$('#pembayaran_tagihan_8').prop("onclick", null).off("click");
		$$('#bank_tagihan_8').val(bank_8_id);
	} else {
		$$('#pembayaran_tagihan_8').val(number_format(0));
		$$('#content_bayar9_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl8').html("");
		$$('#pembayaran_tagihan_8').removeAttr("readonly");
		$$('#pembayaran_tagihan_8').attr('onClick', 'emptyValue("pembayaran_tagihan_8")');
		$$('#bank_tagihan_8').val(bank_id);
	}

	// BAYAR 9
	if (number_format(pembayaran_9) != 0) {
		$$('#pembayaran_tagihan_9').val(number_format(pembayaran_9));
		$$('#pembayaran_tagihan_9').attr('readonly', true);
		$$('#popup-pembayaran-tagihan-tgl9').html(moment(pembayaran9_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar10_tagihan').show();
		$$('#pembayaran_tagihan_9').prop("onclick", null).off("click");
		$$('#bank_tagihan_9').val(bank_9_id);
	} else {
		$$('#pembayaran_tagihan_9').val(number_format(0));
		$$('#content_bayar10_tagihan').hide();
		$$('#popup-pembayaran-tagihan-tgl9').html("");
		$$('#pembayaran_tagihan_9').removeAttr("readonly");
		$$('#pembayaran_tagihan_9').attr('onClick', 'emptyValue("pembayaran_tagihan_9")');
		$$('#bank_tagihan_9').val(bank_id);
	}

	// BAYAR 10
	if (number_format(pembayaran_10) != 0) {
		$$('#pembayaran_tagihan_10').val(number_format(pembayaran_10));
		$$('#pembayaran_tagihan_10').prop("onclick", null).off("click");
		$$('#pembayaran_tagihan_10').attr('readonly', true);
		$$('#popup-pembayaran-tagihan-tgl10').html(moment(pembayaran10_tgl).format('DD-MMM-YYYY'));
		$$('#bank_tagihan_10').val(bank_10_id);
	} else {
		$$('#pembayaran_tagihan_10').val(number_format(0));
		$$('#popup-pembayaran-tagihan-tgl10').html("");
		$$('#pembayaran_tagihan_10').removeAttr("readonly");
		$$('#pembayaran_tagihan_10').attr('onClick', 'emptyValue("pembayaran_tagihan_10")');
		$$('#bank_tagihan_10').val(bank_id);
	}

	$$('#pembayaran-penjualan_id').val(penjualan_id);
	$$('#pembayaran-client_id').val(client_id);
	setTimeout(function () {
		if (localStorage.getItem("username") != 'Stn') {
			$$('.hide_bank option[value="Tunai"]').remove();
		}
	}, 1000);
}

/**
 * Proses Pembayaran Tagihan Multiple
        $$('#pembayaran_tagihan_9').val(number_format(pembayaran_9));
        if (pembayaran9_tgl && moment(pembayaran9_tgl).isValid()) {
            $$('#popup-pembayaran-tagihan-tgl9').html(moment(pembayaran9_tgl).format('DD-MMM-YYYY'));
        } else {
            $$('#popup-pembayaran-tagihan-tgl9').html('-');
        }
        $$('#pembayaran_tagihan_9').attr('readonly', true);
        $$('#pembayaran_tagihan_9').prop("onclick", null).off("click");
        $$('#bank_tagihan_9').val(bank_9 || bank);
    } else {
        $$('#pembayaran_tagihan_9').val(number_format(0));
        $$('#content_bayar10_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl9').html("");
        $$('#pembayaran_tagihan_9').removeAttr("readonly");
        $$('#pembayaran_tagihan_9').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_9")');
        $$('#bank_tagihan_9').val(bank);
    }

    // === PEMBAYARAN 10 ===
    if (number_format(pembayaran_10) != 0) {
        $$('#pembayaran_tagihan_10').val(number_format(pembayaran_10));
        $$('#pembayaran_tagihan_10').prop("onclick", null).off("click");
        $$('#pembayaran_tagihan_10').attr('readonly', true);
        if (pembayaran10_tgl && moment(pembayaran10_tgl).isValid()) {
            $$('#popup-pembayaran-tagihan-tgl10').html(moment(pembayaran10_tgl).format('DD-MMM-YYYY'));
        } else {
            $$('#popup-pembayaran-tagihan-tgl10').html('-');
        }
        $$('#bank_tagihan_10').val(bank_10 || bank);
    } else {
        $$('#pembayaran_tagihan_10').val(number_format(0));
        $$('#popup-pembayaran-tagihan-tgl10').html("");
        $$('#pembayaran_tagihan_10').removeAttr("readonly");
        $$('#pembayaran_tagihan_10').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_10")');
        $$('#bank_tagihan_10').val(bank);
    }
        $$('#pembayaran_tagihan_6').prop("onclick", null).off("click");
        $$('#bank_tagihan_6').val(bank_6);
    } else {
        $$('#pembayaran_tagihan_6').val(number_format(0));
        $$('#content_bayar7_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl6').html("");
        $$('#pembayaran_tagihan_6').removeAttr("readonly");
        $$('#pembayaran_tagihan_6').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_6")');
        $$('#bank_tagihan_6').val(bank);
    }

    // === PEMBAYARAN 7 ===
    if (number_format(pembayaran_7) != 0) {
        $$('#pembayaran_tagihan_7').val(number_format(pembayaran_7));
        $$('#pembayaran_tagihan_7').attr('readonly', true);
        $$('#popup-pembayaran-tagihan-tgl7').html(moment(pembayaran7_tgl).format('DD-MMM-YYYY'));
        $$('#content_bayar8_tagihan').show();
        $$('#pembayaran_tagihan_7').prop("onclick", null).off("click");
        $$('#bank_tagihan_7').val(bank_7);
    } else {
        $$('#pembayaran_tagihan_7').val(number_format(0));
        $$('#content_bayar8_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl7').html("");
        $$('#pembayaran_tagihan_7').removeAttr("readonly");
        $$('#pembayaran_tagihan_7').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_7")');
        $$('#bank_tagihan_7').val(bank);
    }

    // === PEMBAYARAN 8 ===
    if (number_format(pembayaran_8) != 0) {
        $$('#pembayaran_tagihan_8').val(number_format(pembayaran_8));
        $$('#pembayaran_tagihan_8').attr('readonly', true);
        $$('#popup-pembayaran-tagihan-tgl8').html(moment(pembayaran8_tgl).format('DD-MMM-YYYY'));
        $$('#content_bayar9_tagihan').show();
        $$('#pembayaran_tagihan_8').prop("onclick", null).off("click");
        $$('#bank_tagihan_8').val(bank_8);
    } else {
        $$('#pembayaran_tagihan_8').val(number_format(0));
        $$('#content_bayar9_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl8').html("");
        $$('#pembayaran_tagihan_8').removeAttr("readonly");
        $$('#pembayaran_tagihan_8').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_8")');
        $$('#bank_tagihan_8').val(bank);
    }

    // === PEMBAYARAN 9 ===
    if (number_format(pembayaran_9) != 0) {
        $$('#pembayaran_tagihan_9').val(number_format(pembayaran_9));
        $$('#pembayaran_tagihan_9').attr('readonly', true);
        $$('#popup-pembayaran-tagihan-tgl9').html(moment(pembayaran9_tgl).format('DD-MMM-YYYY'));
        $$('#content_bayar10_tagihan').show();
        $$('#pembayaran_tagihan_9').prop("onclick", null).off("click");
        $$('#bank_tagihan_9').val(bank_9);
    } else {
        $$('#pembayaran_tagihan_9').val(number_format(0));
        $$('#content_bayar10_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl9').html("");
        $$('#pembayaran_tagihan_9').removeAttr("readonly");
        $$('#pembayaran_tagihan_9').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_9")');
        $$('#bank_tagihan_9').val(bank);
    }

    // === PEMBAYARAN 10 ===
    if (number_format(pembayaran_10) != 0) {
        $$('#pembayaran_tagihan_10').val(number_format(pembayaran_10));
        $$('#pembayaran_tagihan_10').prop("onclick", null).off("click");
        $$('#pembayaran_tagihan_10').attr('readonly', true);
        $$('#popup-pembayaran-tagihan-tgl10').html(moment(pembayaran10_tgl).format('DD-MMM-YYYY'));
        $$('#bank_tagihan_10').val(bank_10);
    } else {
        $$('#pembayaran_tagihan_10').val(number_format(0));
        $$('#popup-pembayaran-tagihan-tgl10').html("");
        $$('#pembayaran_tagihan_10').removeAttr("readonly");
        $$('#pembayaran_tagihan_10').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_10")');
        $$('#bank_tagihan_10').val(bank);
    }

    $$('#pembayaran-tagihan-penjualan_id').val(penjualan_id);
    $$('#pembayaran-tagihan-client_id').val(client_id);
    
    // Hide Tunai option for non-admin
    setTimeout(function () {
        if (localStorage.getItem("username") != 'Stn') {
            $$('.hide_bank option[value="Tunai"]').remove();
            $$('.hide_bank option[value="5"]').remove(); // Tunai bank_id=5
        }
    }, 1000);
    
    // Open popup (jika belum terbuka dari data-popup attribute)
    // app.popup.open('.detail-pembayaran-tagihan');
}

/**
 * Generate History Multiple Tagihan
 * DISAMAKAN PERSIS dengan penjualan.js detailPembayaran
 * - Inline Bayar 1-10 (bukan loop)
 * - nextSlot logic
 * - valid_cs sequential display
 * - Owner bank logic
 * - getBankLabelFromPayment dual-field lookup
 * - prosesPembayaranMultipleTagihan dengan file upload
 */
function generateHistoryMultipleTagihan(pembayaran_data) {
    var history_pembayaran_multiple = '';
    var ongkir = 0;
    var hasOngkirPending = false;
    
    // Owner bank logic (sama dengan penjualan.js)
    var ownerBankDefault = checkIsOwner() ? 3 : 3;
    
    jQuery.each(pembayaran_data, function (i, val) {
        var no = i;

        // Hitung nextSlot: slot null pertama (sama dengan penjualan.js)
        var allSlots = [
            val.pembayaran_1, val.pembayaran_2, val.pembayaran_3, val.pembayaran_4, val.pembayaran_5,
            val.pembayaran_6, val.pembayaran_7, val.pembayaran_8, val.pembayaran_9, val.pembayaran_10
        ];
        var nextSlot = 1;
        for (var s = 0; s < allSlots.length; s++) {
            if (allSlots[s] === null || allSlots[s] === undefined) {
                nextSlot = s + 1;
                break;
            }
            nextSlot = s + 2;
        }

        var pembayaran_1 = number_format(val.pembayaran_1).replace(/\,/g, '');
        var pembayaran_2 = number_format(val.pembayaran_2).replace(/\,/g, '');
        var pembayaran_3 = number_format(val.pembayaran_3).replace(/\,/g, '');
        var pembayaran_4 = number_format(val.pembayaran_4).replace(/\,/g, '');
        var pembayaran_5 = number_format(val.pembayaran_5).replace(/\,/g, '');
        var pembayaran_6 = number_format(val.pembayaran_6).replace(/\,/g, '');
        var pembayaran_7 = number_format(val.pembayaran_7).replace(/\,/g, '');
        var pembayaran_8 = number_format(val.pembayaran_8).replace(/\,/g, '');
        var pembayaran_9 = number_format(val.pembayaran_9).replace(/\,/g, '');
        var pembayaran_10 = number_format(val.pembayaran_10).replace(/\,/g, '');

        var total_jumlah_pembayaran = parseInt(pembayaran_1) + parseInt(pembayaran_2) + parseInt(pembayaran_3) + parseInt(pembayaran_4) + parseInt(pembayaran_5) + parseInt(pembayaran_6) + parseInt(pembayaran_7) + parseInt(pembayaran_8) + parseInt(pembayaran_9) + parseInt(pembayaran_10);

        // Hitung total_pembayaran_valid (hanya valid_cs == 1)
        var total_pembayaran_valid = 0;
        var has_pending_payment = false;
        
        for (var k = 1; k <= 10; k++) {
            var pay_val_check = parseInt(number_format(val['pembayaran_' + k]).replace(/\,/g, ''));
            if (val['pembayaran_' + k] != null && val['pembayaran_' + k] != 0) {
                if (val['valid_cs_' + k] == 1) {
                    total_pembayaran_valid += pay_val_check;
                } else if (val['valid_cs_' + k] == 0) {
                    has_pending_payment = true;
                }
            }
        }

        // Status Ongkir (sama dengan penjualan.js)
        var statusOngkir = val.status_ongkir || 'pending';
        if (statusOngkir === 'pending') {
            hasOngkirPending = true;
        }
        var ongkirLabel = '';
        var ongkirColor = '';
        var ongkirDisplay = '';
        var ongkirEditable = false;
        
        var isOngkirEdited = val.is_ongkir_edited === 1 || val.is_ongkir_edited === '1';
        var ongkirOriginal = val.ongkir_original || ongkir;

        // Status lunas (sama dengan penjualan.js)
        if (parseInt(val.penjualan_grandtotal) <= parseInt(total_pembayaran_valid) && statusOngkir !== 'pending' && !has_pending_payment) {
            var background_multiple = "#133788";
            var status_lunas = "lunas";
        } else {
            var background_multiple = "";
            var status_lunas = "belum_lunas";
        }

        if (val.ongkir != null) {
            ongkir += val.ongkir;
        } else {
            ongkir = 0;
        }

        if (statusOngkir === 'pending') {
            ongkirLabel = '(Pending)';
            ongkirColor = '#ff3b30';
            ongkirDisplay = ongkir || 0;
            ongkirEditable = !isOngkirEdited;
        } else if (statusOngkir === 'free') {
            ongkirLabel = '(Free)';
            ongkirColor = '#4cd964';
            ongkirDisplay = 0;
            ongkirEditable = false;
        } else if (statusOngkir === 'nominal') {
            ongkirLabel = '';
            ongkirColor = '#ffa500';
            ongkirDisplay = ongkir;
            ongkirEditable = !isOngkirEdited;
        }
        
        if (isOngkirEdited) {
            ongkirColor = '#34c759';
            ongkirLabel = '';
        }

        var sisa_pembayaran = parseFloat(val.penjualan_grandtotal - total_pembayaran_valid);

        $('#ongkir_' + i + '').mask('000,000,000,000', { reverse: true });
        history_pembayaran_multiple += '<table align="center" width="800px" border="0" style="border-collapse: collapse; border:1px solid white;">';

        // === HEADER ROW ===
        history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
        history_pembayaran_multiple += '<td align="center" width="15%" colspan="2">';
        history_pembayaran_multiple += '<input type="hidden" id="status_lunas_' + i + '" value="' + status_lunas + '" name="status_lunas_' + i + '"  /><input type="hidden"  id="total_harus_bayar_' + val.pembayaran_id + '" value="' + val.penjualan_grandtotal + '" name="total_harus_bayar_' + val.pembayaran_id + '"  /><input type="hidden" id="sudah_bayar_' + val.pembayaran_id + '" value="' + total_pembayaran_valid + '" name="sudah_bayar_' + val.pembayaran_id + '"  />Deadline ' + i + ' : <br>' + moment(val.penjualan_tanggal_kirim).format('DD-MMM-YY') + '';
        history_pembayaran_multiple += '</td>';
        history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" colspan="1" class="numeric-cell text-align-center">Total : <br>' + number_format(val.penjualan_grandtotal - ongkir) + '</td>';
        history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" colspan="1" class="numeric-cell text-align-center">Terbayar : <br>' + number_format(total_pembayaran_valid) + '</td>';
        history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">Sisa : <br>' + number_format((val.penjualan_grandtotal - total_pembayaran_valid)) + '</td>';

        // === ONGKIR CELL ===
        history_pembayaran_multiple += '<td width="25%" colspan="3" style="border-collapse: collapse; border-left:1px solid white; border-top:1px solid white; border-bottom:1px solid white; background-color:' + ongkirColor + ';" class="numeric-cell text-align-center">';
        
        var ongkirText = 'Ongkir';
        if (val.nama_kota_pengiriman) {
            ongkirText += ' (' + val.nama_kota_pengiriman + ')';
        }
        if (ongkirLabel) {
            history_pembayaran_multiple += '<span style="color:white; font-weight:bold;">' + ongkirText + ' : ' + ongkirLabel + '</span><br>';
        } else {
            history_pembayaran_multiple += '<span style="color:white; font-weight:bold;">' + ongkirText + ' :</span><br>';
        }
        
        if (ongkirEditable) {
            history_pembayaran_multiple += '<input style="text-align:center; width:100%; background-color:#e5e5e7; color:#3a3a3c; cursor:pointer;" placeholder="Klik untuk edit" value="' + ongkirDisplay + '" onclick="handleOngkirClick(this, \'' + i + '\', \'' + val.penjualan_id + '\', \'' + ongkirOriginal + '\', \'' + statusOngkir + '\');" name="ongkir_' + i + '" id="ongkir_' + i + '" data-original-value="' + ongkirOriginal + '" data-is-edited="false" data-penjualan-id="' + val.penjualan_id + '" data-status-ongkir="' + statusOngkir + '" data-id-kota-pengiriman="' + (val.id_kota_pengiriman || '') + '" data-nama-kota-pengiriman="' + (val.nama_kota_pengiriman || '') + '" class="text-add-colour-black-soft button-small text-bold ongkir-field" type="text" readonly>';
        } else if (isOngkirEdited) {
            history_pembayaran_multiple += '<input style="text-align:center; width:100%; background-color:#34c759; color:white; cursor:not-allowed; font-weight:bold;" value="' + ongkirDisplay + '" onclick="handleOngkirClick(this, \'' + i + '\', \'' + val.penjualan_id + '\', \'' + ongkirOriginal + '\', \'' + statusOngkir + '\');" name="ongkir_' + i + '" id="ongkir_' + i + '" data-original-value="' + ongkirOriginal + '" data-is-edited="true" data-penjualan-id="' + val.penjualan_id + '" data-status-ongkir="' + statusOngkir + '" data-id-kota-pengiriman="' + (val.id_kota_pengiriman || '') + '" data-nama-kota-pengiriman="' + (val.nama_kota_pengiriman || '') + '" class="text-add-colour-black-soft button-small text-bold ongkir-field" type="text" readonly>';
        } else {
            history_pembayaran_multiple += '<span style="font-size:16px; font-weight:bold; color:white;">' + ongkirDisplay + '</span>';
        }
        
        history_pembayaran_multiple += '</td>';
        history_pembayaran_multiple += ' </tr>';

        // === COLUMN HEADERS ===
        history_pembayaran_multiple += '<tr class="bg-dark-gray-medium">';
        history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar</td>';
        history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">Tanggal</td>';
        history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">Bank</td>';
        history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">Jumlah</td>';
        history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="3" class="numeric-cell text-align-center">Keterangan</td>';
        history_pembayaran_multiple += '  </tr>';
        history_pembayaran_multiple += '<tbody id="table_num_tagihan_' + i + '">';

        // Helper: generate existing payment row
        function genExistingRow(idx, pay_val, pay_tgl_field, bank_id_field, bank_field, keterangan_field, foto_field, valid_cs, keterangan_reject_field) {
            var h = '';
            if (pay_val != null && pay_val != 0) {
                if (valid_cs == 2) {
                    h += '<tr class="card-color-red">';
                    h += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar ' + idx + '</td>';
                    h += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(pay_tgl_field).format('DD-MMM-YYYY') + '</td>';
                    h += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(bank_id_field, bank_field) + '</td>';
                    h += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(pay_val) + '</td>';
                    h += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (keterangan_field != null ? keterangan_field : '-') + '</td>';
                    h += '<td class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran-tagihan" onclick="editPembayaranTagihanPopup(\'Bayar ' + idx + '\',\'foto_' + idx + '\',\'' + val.pembayaran_id + '\',\'' + foto_field + '\',\'' + pay_val + '\',\'' + keterangan_field + '\',\'' + bank_field + '\',\'' + pay_tgl_field + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + keterangan_reject_field + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
                    h += ' </tr>';
                } else if (valid_cs == 1 || valid_cs == 0) {
                    var bg_row = (valid_cs == 1) ? '#133788' : '';
                    h += '<tr style="background-color:' + bg_row + '">';
                    h += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar ' + idx + '</td>';
                    h += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(pay_tgl_field).format('DD-MMM-YYYY') + '</td>';
                    h += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(bank_id_field, bank_field) + '</td>';
                    h += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + number_format(pay_val) + '</td>';
                    h += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (keterangan_field != null ? keterangan_field : '-') + '</td>';
                    if (foto_field != null) {
                        h += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_' + idx + '\',\'' + val.pembayaran_id + '\',\'' + foto_field + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
                    } else {
                        h += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran-tagihan" onclick="uploadFotoPembayaranTagihan(\'foto_' + idx + '\',\'' + val.pembayaran_id + '\',\'' + foto_field + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
                    }
                    h += ' </tr>';
                }
                return { html: h, exists: true };
            }
            return { html: '', exists: false };
        }

        // Helper: generate empty payment row (form input)
        function genEmptyRow(idx, pembayaran_id_val) {
            var h = '';
            h += '<form id="pembayaran_form_multiple_' + idx + '_' + pembayaran_id_val + '">';
            h += '<tr>';
            h += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar ' + idx + '</td>';
            h += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;text-align:center;" id="tanggal_' + idx + '_' + pembayaran_id_val + '" name="tanggal_' + idx + '_' + pembayaran_id_val + '" type="date" value="' + moment().format('YYYY-MM-DD') + '" class="date-multiple-penbayaran" readonly></td>';
            h += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
            if (checkIsOwner() && ownerBankDefault) {
                var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
                var bLabel = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
                h += '<div style=" padding:5px;">' + bLabel + '</div>';
                h += '<input type="hidden" id="bank_' + idx + '_' + pembayaran_id_val + '" name="bank_' + idx + '_' + pembayaran_id_val + '" value="' + ownerBankDefault + '">';
            } else {
                h += '<select style="width:100%; background-color:#1c1c1d; " class="hide_bank performa-input input-item-bank" id="bank_' + idx + '_' + pembayaran_id_val + '" name="bank_' + idx + '_' + pembayaran_id_val + '">';
                h += generateBankOptions(3, false);
                h += '</select>';
            }
            h += '</td>';
            h += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" class="input-pembayaran-multiple" id="pembayaran_' + idx + '_' + pembayaran_id_val + '" name="pembayaran_' + idx + '_' + pembayaran_id_val + '" type="text"></td>';
            h += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_' + idx + '_' + pembayaran_id_val + '" name="keterangan_' + idx + '_' + pembayaran_id_val + '" type="text"></td>';
            h += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_' + idx + '_' + pembayaran_id_val + '">FOTO</label><input style="display: none" style="width:100%;" id="foto_bukti_' + idx + '_' + pembayaran_id_val + '" name="foto_bukti_' + idx + '_' + pembayaran_id_val + '" type="file" onchange="prosesPembayaranMultipleTagihan(' + pembayaran_id_val + ',' + idx + ');"></td>';
            h += ' </tr></form>';
            return h;
        }

        // === BAYAR 1 ===
        var r1 = genExistingRow(1, val.pembayaran_1, val.pembayaran1_tgl, val.bank_1_id, val.bank_1, val.keterangan_1, val.foto_1, val.valid_cs_1, val.keterangan_valid_cs_1);
        if (r1.exists) { history_pembayaran_multiple += r1.html; }
        else { history_pembayaran_multiple += genEmptyRow(nextSlot, val.pembayaran_id); }

        // === BAYAR 2 ===
        var r2 = genExistingRow(2, val.pembayaran_2, val.pembayaran2_tgl, val.bank_2_id, val.bank_2, val.keterangan_2, val.foto_2, val.valid_cs_2, val.keterangan_valid_cs_2);
        if (r2.exists) { history_pembayaran_multiple += r2.html; }
        else { if (val.pembayaran_1 != null && val.pembayaran_1 != 0 && status_lunas != "lunas" && val.valid_cs_1 == 1) { history_pembayaran_multiple += genEmptyRow(2, val.pembayaran_id); } }

        // === BAYAR 3 ===
        var r3 = genExistingRow(3, val.pembayaran_3, val.pembayaran3_tgl, val.bank_3_id, val.bank_3, val.keterangan_3, val.foto_3, val.valid_cs_3, val.keterangan_valid_cs_3);
        if (r3.exists) { history_pembayaran_multiple += r3.html; }
        else { if (val.pembayaran_2 != null && val.pembayaran_2 != 0 && status_lunas != "lunas" && val.valid_cs_2 == 1) { history_pembayaran_multiple += genEmptyRow(3, val.pembayaran_id); } }

        // === BAYAR 4 ===
        var r4 = genExistingRow(4, val.pembayaran_4, val.pembayaran4_tgl, val.bank_4_id, val.bank_4, val.keterangan_4, val.foto_4, val.valid_cs_4, val.keterangan_valid_cs_4);
        if (r4.exists) { history_pembayaran_multiple += r4.html; }
        else { if (val.pembayaran_3 != null && val.pembayaran_3 != 0 && status_lunas != "lunas" && val.valid_cs_3 == 1) { history_pembayaran_multiple += genEmptyRow(4, val.pembayaran_id); } }

        // === BAYAR 5 ===
        var r5 = genExistingRow(5, val.pembayaran_5, val.pembayaran5_tgl, val.bank_5_id, val.bank_5, val.keterangan_5, val.foto_5, val.valid_cs_5, val.keterangan_valid_cs_5);
        if (r5.exists) { history_pembayaran_multiple += r5.html; }
        else { if (val.pembayaran_4 != null && val.pembayaran_4 != 0 && status_lunas != "lunas" && val.valid_cs_4 == 1) { history_pembayaran_multiple += genEmptyRow(5, val.pembayaran_id); } }

        // === BAYAR 6 ===
        var r6 = genExistingRow(6, val.pembayaran_6, val.pembayaran6_tgl, val.bank_6_id, val.bank_6, val.keterangan_6, val.foto_6, val.valid_cs_6, val.keterangan_valid_cs_6);
        if (r6.exists) { history_pembayaran_multiple += r6.html; }
        else { if (val.pembayaran_5 != null && val.pembayaran_5 != 0 && val.valid_cs_5 == 1) { history_pembayaran_multiple += genEmptyRow(6, val.pembayaran_id); } }

        // === BAYAR 7 ===
        var r7 = genExistingRow(7, val.pembayaran_7, val.pembayaran7_tgl, val.bank_7_id, val.bank_7, val.keterangan_7, val.foto_7, val.valid_cs_7, val.keterangan_valid_cs_7);
        if (r7.exists) { history_pembayaran_multiple += r7.html; }
        else { if (val.pembayaran_6 != null && val.pembayaran_6 != 0 && val.valid_cs_6 == 1) { history_pembayaran_multiple += genEmptyRow(7, val.pembayaran_id); } }

        // === BAYAR 8 ===
        var r8 = genExistingRow(8, val.pembayaran_8, val.pembayaran8_tgl, val.bank_8_id, val.bank_8, val.keterangan_8, val.foto_8, val.valid_cs_8, val.keterangan_valid_cs_8);
        if (r8.exists) { history_pembayaran_multiple += r8.html; }
        else { if (val.pembayaran_7 != null && val.pembayaran_7 != 0 && val.valid_cs_7 == 1) { history_pembayaran_multiple += genEmptyRow(8, val.pembayaran_id); } }

        // === BAYAR 9 ===
        var r9 = genExistingRow(9, val.pembayaran_9, val.pembayaran9_tgl, val.bank_9_id, val.bank_9, val.keterangan_9, val.foto_9, val.valid_cs_9, val.keterangan_valid_cs_9);
        if (r9.exists) { history_pembayaran_multiple += r9.html; }
        else { if (val.pembayaran_8 != null && val.pembayaran_8 != 0 && val.valid_cs_8 == 1) { history_pembayaran_multiple += genEmptyRow(9, val.pembayaran_id); } }

        // === BAYAR 10 ===
        var r10 = genExistingRow(10, val.pembayaran_10, val.pembayaran10_tgl, val.bank_10_id, val.bank_10, val.keterangan_10, val.foto_10, val.valid_cs_10, val.keterangan_valid_cs_10);
        if (r10.exists) { history_pembayaran_multiple += r10.html; }
        else { if (val.pembayaran_9 != null && val.pembayaran_9 != 0 && val.valid_cs_9 == 1) { history_pembayaran_multiple += genEmptyRow(10, val.pembayaran_id); } }

        history_pembayaran_multiple += '<tbody>';
        history_pembayaran_multiple += '</table><br>';
    });
    
    return history_pembayaran_multiple;
}

/**
 * Edit Pembayaran Tagihan Popup
 */
function editPembayaranTagihanPopup(bayar_ke, type_foto, pembayaran_id, foto_ke, pembayaran_nominal, keterangan_ke, bank_ke, pembayaran_tgl, sisa_pembayaran, penjualan_grandtotal, total_bayar, keterangan_reject) {
    jQuery('#pembayaran_id_edit_tagihan').val(pembayaran_id);
    jQuery('#bayar_ke_edit_tagihan').val(bayar_ke);
    jQuery('#pembayaran_type_foto_edit_tagihan').val(type_foto);
    jQuery('#sisa_pembayaran_edit_tagihan').val(sisa_pembayaran);
    jQuery('#penjualan_grandtotal_edit_tagihan').val(penjualan_grandtotal);
    jQuery('#total_bayar_edit_tagihan').val(total_bayar);
    jQuery('#last_bayar_edit_tagihan').val(pembayaran_nominal);
    jQuery('#uraian_reject_edit_tagihan').val(keterangan_reject);
    jQuery('#tanggal_pembayaran_edit_tagihan').val(moment(pembayaran_tgl).format('DD-MMM-YYYY'));
    
    // Populate bank dropdown dari API, lalu set selected value
    var bankIdVal = bank_ke;
    if (isNaN(bank_ke) && bank_ke) {
        bankIdVal = getBankIdByCode(bank_ke);
    }
    jQuery('#bank_edit_tagihan').html(generateBankOptions(bankIdVal, false));
    
    jQuery('#jumlah_pembayaran_edit_tagihan').val(number_format(pembayaran_nominal));
    jQuery('#keterangan_pembayaran_edit_tagihan').val(keterangan_ke);
    
    if (foto_ke != 'null' && foto_ke) {
        jQuery('#file_foto_edit_pembayaran_tagihan_view').attr('src', BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + foto_ke);
    } else {
        jQuery('#file_foto_edit_pembayaran_tagihan_view').attr('src', 'https://indokoper.com/noimage.jpg');
    }
    
    // Show/hide reject keterangan
    if (keterangan_reject && keterangan_reject != 'null') {
        jQuery('.edit_keterangan_reject_tagihan_li').show();
        jQuery('#edit_keterangan_reject_tagihan').val(keterangan_reject);
    } else {
        jQuery('.edit_keterangan_reject_tagihan_li').hide();
    }
}

/**
 * Edit Pembayaran Tagihan Proses
 * DISAMAKAN dengan editPembayaranProses di penjualan.js
 */
function editPembayaranTagihanProses() {
    var elem = jQuery('#pembayaran_type_foto_edit_tagihan').val();
    var pembayaran_ke = elem.replace(/(.*)_/, "");

    // Ambil nilai-nilai yang diperlukan (sama dengan penjualan.js)
    var penjualan_grandtotal = parseInt(jQuery('#penjualan_grandtotal_edit_tagihan').val());
    var total_bayar = parseInt(jQuery('#total_bayar_edit_tagihan').val());
    var last_bayar = parseInt(jQuery('#last_bayar_edit_tagihan').val());
    var jumlah_baru = parseInt(jQuery('#jumlah_pembayaran_edit_tagihan').val().replace(/\,/g, ''));

    // Hitung pembayaran lain (selain yang sedang diedit)
    var bayar_lainnya = total_bayar - last_bayar;
    // Hitung total pembayaran setelah edit
    var total_bayar_baru = bayar_lainnya + jumlah_baru;
    // Hitung sisa yang harus dibayar
    var sisa_harus_bayar = penjualan_grandtotal - total_bayar_baru;

    if (sisa_harus_bayar < 0) {
        var lebih_bayar = Math.abs(sisa_harus_bayar);
        app.dialog.alert('Pembayaran Melebihi Nominal <br> <br> Nominal Lebih : ' + number_format(lebih_bayar) + ' <br><br>Bagi Pada Angsuran Berikutnya');
    } else {
        if (!jQuery('#edit_pembayaran_tagihan_popup')[0].checkValidity()) {
            app.dialog.alert('Cek Isian Form Anda');
        } else {
            var formData = new FormData(jQuery("#edit_pembayaran_tagihan_popup")[0]);
            formData.append('pembayaran_ke', pembayaran_ke);
            formData.append('bank_id', jQuery('#bank_edit_tagihan').val());
            jQuery.ajax({
                type: 'POST',
                url: "" + BASE_API + "/proses-pembayaran-multiple-edit",
                dataType: 'JSON',
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function () {
                    app.dialog.preloader('Harap Tunggu');
                },
                success: function (data) {
                    app.dialog.close();
                    if (data.status == 'done' || data.status == 'success') {
                        app.dialog.alert('Berhasil Edit Pembayaran', function() {
                            app.popup.close('.edit-pembayaran-tagihan');
                            app.popup.close('.detail-pembayaran-tagihan');
                            if (typeof getDataTagihan === 'function') {
                                getDataTagihan(1);
                            }
                        });
                    } else if (data.status == 'failed') {
                        app.dialog.alert('Gagal Edit Pembayaran');
                        app.popup.close('.edit-pembayaran-tagihan');
                    }
                },
                error: function (xmlhttprequest, textstatus, message) {
                    app.dialog.close();
                    app.dialog.alert('Error: ' + message);
                }
            });
        }
    }
}

/**
 * Proses Pembayaran Multiple (New Payment)
 * DISAMAKAN PERSIS dengan prosesPembayaranMultiple di penjualan.js
 */
function prosesPembayaranMultipleTagihan(pembayaran_id, number) {
	// Ambil nilai bank_id
	var bankIdValue = jQuery('#bank_tagihan_' + number + '_' + pembayaran_id + '').val();
	
	// FALLBACK: Jika owner dan bank_id kosong, gunakan default
	if (checkIsOwner() && (!bankIdValue || bankIdValue === '' || bankIdValue === 'null')) {
		bankIdValue = window.ownerBankDefault || 3;
		console.log('Owner bank_id kosong, menggunakan default:', bankIdValue);
	}
	
	// Validasi
	if (jQuery('#pembayaran_tagihan_' + number + '_' + pembayaran_id + '').val() == "" || 
		!bankIdValue || 
		bankIdValue === "" || 
		bankIdValue === "null" ||
		jQuery('#tanggal_tagihan_' + number + '_' + pembayaran_id + '').val() == "" || 
		jQuery('#foto_bukti_tagihan_' + number + '_' + pembayaran_id).val() == "") {
		
		app.dialog.alert('Isi Data Pembayaran Dengan Lengkap');
		console.log('Validasi gagal:');
		console.log(number + ' - pembayaran: ' + jQuery('#pembayaran_tagihan_' + number + '_' + pembayaran_id + '').val());
		console.log(number + ' - bank_id: ' + bankIdValue);
		console.log(number + ' - tanggal: ' + jQuery('#tanggal_tagihan_' + number + '_' + pembayaran_id + '').val());
		console.log(number + ' - foto_bukti: ' + jQuery('#foto_bukti_tagihan_' + number + '_' + pembayaran_id).val());
	} else {

		var total_harus_bayar = parseInt(jQuery('#total_harus_bayar_tagihan_' + pembayaran_id + '').val());

		var sudah_bayar = parseInt(jQuery('#sudah_bayar_tagihan_' + pembayaran_id + '').val()) + parseInt(jQuery('#pembayaran_tagihan_' + number + '_' + pembayaran_id + '').val().replace(/\,/g, ''));
		var sisa_harus_bayar = total_harus_bayar - sudah_bayar;

		if (sisa_harus_bayar < 0) {
			var lebih_bayar = sudah_bayar - total_harus_bayar;
			app.dialog.alert('Pembayaran Melebihi Nominal <br> <br> Nominal Lebih : ' + number_format(lebih_bayar) + ' <br><br>Bagi Pada Angsuran Berikutnya');
		} else {

			var formData = new FormData($('#pembayaran_form_multiple_tagihan_' + number + '_' + pembayaran_id)[0]);

			formData.append('pembayaran', jQuery('#pembayaran_tagihan_' + number + '_' + pembayaran_id + '').val());
			formData.append('bank_id', bankIdValue);
			formData.append('tanggal', jQuery('#tanggal_tagihan_' + number + '_' + pembayaran_id + '').val());
			formData.append('keterangan', jQuery('#keterangan_tagihan_' + number + '_' + pembayaran_id + '').val());
			formData.append('pembayaran_id', pembayaran_id);
			formData.append('pembayaran_ke', number);
			formData.append('foto_bukti', jQuery('#foto_bukti_tagihan_' + number + '_' + pembayaran_id + '').prop('files')[0]);

			console.log('Submit pembayaran tagihan dengan bank_id:', bankIdValue);

			jQuery.ajax({
				type: 'POST',
				url: "" + BASE_API + "/proses-pembayaran-multiple",
				dataType: 'JSON',
				data: formData,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Harap Tunggu');
				},
				success: function (data) {
					getPenjualanHeader(1);
					app.dialog.close();
					app.popup.close();
					if (data.status == 'done') {
						app.dialog.alert('Berhasil Input Pembayaran');
					} else if (data.status == 'failed') {
						app.dialog.alert('Gagal Input Pembayaran');
					}
				},
				error: function (xmlhttprequest, textstatus, message) {
				}
			});
		}
	}
}

/**
 * Proses Pembayaran Single Mode
 */
function prosesPembayaranTagihan() {
    var penjualan_id = jQuery('#pembayaran-tagihan-penjualan_id').val();
    var client_id = jQuery('#pembayaran-tagihan-client_id').val();
    
    if (!penjualan_id) {
        app.dialog.alert('Data tidak lengkap');
        return;
    }
    
    // Collect payments
    var payments = [];
    var fields = [
        {num: 1, field: 'pembayaran_tagihan_1_dp_awal', bank: 'bank_tagihan_1'},
        {num: 2, field: 'pembayaran_tagihan_2', bank: 'bank_tagihan_2'},
        {num: 3, field: 'pembayaran_tagihan_3', bank: 'bank_tagihan_3'},
        {num: 4, field: 'pembayaran_tagihan_4', bank: 'bank_tagihan_4'},
        {num: 5, field: 'pembayaran_tagihan_5', bank: 'bank_tagihan_5'},
        {num: 6, field: 'pembayaran_tagihan_6', bank: 'bank_tagihan_6'},
        {num: 7, field: 'pembayaran_tagihan_7', bank: 'bank_tagihan_7'},
        {num: 8, field: 'pembayaran_tagihan_8', bank: 'bank_tagihan_8'},
        {num: 9, field: 'pembayaran_tagihan_9', bank: 'bank_tagihan_9'},
        {num: 10, field: 'pembayaran_tagihan_10', bank: 'bank_tagihan_10'}
    ];
    
    fields.forEach(function(f) {
        var nominal = jQuery('#' + f.field).val().replace(/,/g, '');
        var bank = jQuery('#' + f.bank).val();
        
        if (nominal && parseInt(nominal) > 0) {
            payments.push({
                number: f.num,
                nominal: nominal,
                bank: bank
            });
        }
    });
    
    if (payments.length == 0) {
        app.dialog.alert('Tidak ada pembayaran');
        return;
    }
    
    app.dialog.confirm('Proses pembayaran?', function () {
        jQuery.ajax({
            type: "POST",
            url: BASE_API + "/pembayaran",
            dataType: "JSON",
            data: {
                pembayaran_1: payments.find(p => p.number === 1)?.nominal || 0,
                pembayaran_2: payments.find(p => p.number === 2)?.nominal || 0,
                pembayaran_3: payments.find(p => p.number === 3)?.nominal || 0,
                pembayaran_4: payments.find(p => p.number === 4)?.nominal || 0,
                pembayaran_5: payments.find(p => p.number === 5)?.nominal || 0,
                pembayaran_6: payments.find(p => p.number === 6)?.nominal || 0,
                pembayaran_7: payments.find(p => p.number === 7)?.nominal || 0,
                pembayaran_8: payments.find(p => p.number === 8)?.nominal || 0,
                pembayaran_9: payments.find(p => p.number === 9)?.nominal || 0,
                pembayaran_10: payments.find(p => p.number === 10)?.nominal || 0,
                bank_1: jQuery("#bank_tagihan_1").val(),
                bank_2: jQuery("#bank_tagihan_2").val(),
                bank_3: jQuery("#bank_tagihan_3").val(),
                bank_4: jQuery("#bank_tagihan_4").val(),
                bank_5: jQuery("#bank_tagihan_5").val(),
                bank_6: jQuery("#bank_tagihan_6").val(),
                bank_7: jQuery("#bank_tagihan_7").val(),
                bank_8: jQuery("#bank_tagihan_8").val(),
                bank_9: jQuery("#bank_tagihan_9").val(),
                bank_10: jQuery("#bank_tagihan_10").val(),
                karyawan_id: localStorage.getItem("user_id"),
                client_id: client_id,
                penjualan_id: penjualan_id,
            },
            beforeSend: function () {
                app.dialog.preloader('Processing...');
            },
            success: function (data) {
                app.dialog.close();
                if (data.status == 'success' || data.status == 'done') {
                    app.popup.close('.detail-pembayaran-tagihan');
                    app.dialog.alert('Berhasil proses', function() {
                        if (typeof getDataTagihan === 'function') {
                            getDataTagihan(1);
                        }
                    });
                } else {
                    app.dialog.alert('Gagal: ' + (data.message || 'Unknown'));
                }
            },
            error: function (xhr, status, error) {
                app.dialog.close();
                app.dialog.alert('Error: ' + error);
            }
        });
    });
}

/**
 * Upload Foto Pembayaran Tagihan
 */
function uploadFotoPembayaranTagihan(foto_urutan, pembayaran_id, isi_foto) {
	jQuery('#penjualan_id_foto_pembayaran_tagihan').val(pembayaran_id);
	jQuery('#foto_urutan_tagihan').val(foto_urutan);

	jQuery('#file_foto_pembayaran_tagihan').val('');
	localStorage.removeItem('file_foto_pembayaran_tagihan');
	$('#file_foto_pembayaran_tagihan_view').attr('src', '');
	$('#file_foto_pembayaran_tagihan_view_now').attr('src', '');
	$$(".custom-file-upload-foto-pembayaran").show();
	if (isi_foto != 'null') {
		$('.btn-payment-penjualan').hide();
		jQuery('#file_foto_pembayaran_tagihan_view_now').attr('src', BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + isi_foto);
	} else {
		$('.btn-payment-penjualan').show();
		jQuery('#file_foto_pembayaran_tagihan_view_now').attr('src', 'https://indokoper.com/noimage.jpg');
	}
}

/**
 * Helper: Empty Value
 */
function emptyValueTagihan(inputId) {
    jQuery('#' + inputId).val('');
}

/**
 * Helper: Zoom View Foto
 */
function zoom_view_foto_bayar(src) {
    if (typeof zoom_view === 'function') {
        zoom_view(src);
    }
}

// ============================================================================
// FILTER NAMA CLIENT - DEBOUNCE & RESET
// ============================================================================

var _timerFilterNamaClient = null;

/**
 * Debounce filter nama client - tunggu 500ms setelah user berhenti mengetik
 */
function filterNamaClientTagihanDebounce() {
    if (_timerFilterNamaClient) {
        clearTimeout(_timerFilterNamaClient);
    }
    _timerFilterNamaClient = setTimeout(function () {
        getDataTagihan();
    }, 500);
}

/**
 * Reset filter nama client
 */
function resetFilterNamaClientTagihan() {
    jQuery('#filter_nama_client_tagihan').val('');
    getDataTagihan();
}

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('=== TAGIHAN.JS WITH PAYMENT BUTTON LOADED ===');

// Apply mask on page load
jQuery(document).ready(function() {
    loadBankData();
    jQuery('.input-pembayaran-multiple-tagihan').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_1_dp_awal').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_2').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_3').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_4').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_5').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_6').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_7').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_8').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_9').mask('000,000,000,000', { reverse: true });
    jQuery('#pembayaran_tagihan_10').mask('000,000,000,000', { reverse: true });
});