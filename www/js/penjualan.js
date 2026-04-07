var globalBankData = [];
var isOwner = false;

function loadBankData() {
	isOwner = checkIsOwner();

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-all-bank",
		dataType: 'JSON',
		data: {
			username: localStorage.getItem("username")
		},
		success: function (response) {
			if (response.status == 200) {
				globalBankData = response.data;
				console.log('Bank data loaded:', globalBankData);
				renderBankOptionsToStaticDropdowns();
			}
		},
		error: function (xhr, status, error) {
			console.error('Error loading bank data:', error);
		}
	});
}

function checkIsOwner() {
	var username = localStorage.getItem("username");
	return username === 'Stn';
}

function generateBankOptions(defaultBankId) {
	var options = '';

	if (globalBankData.length === 0) {
		return generateBankOptionsHardcoded(defaultBankId);
	}

	globalBankData.forEach(function (bank) {
		var selected = (bank.bank_id == defaultBankId) ? ' selected' : '';
		options += '<option value="' + bank.bank_id + '"' + selected + '>' + bank.bank_label + '</option>';
	});

	return options;
}

function generateBankOptionsHardcoded(defaultBankId) {
	var options = '';
	var banks = [
		{ id: 1, label: 'BCA - Sutono' },
		{ id: 2, label: 'BRI - Sutono' },
		{ id: 3, label: 'Mandiri - Sutono' },
		{ id: 4, label: 'Mandiri Bisnis - Santoso' },
		{ id: 5, label: 'Tunai' },
		{ id: 6, label: 'Mandiri - Yu Shujin' }
	];

	banks.forEach(function (bank) {
		var selected = (bank.id == defaultBankId) ? ' selected' : '';
		options += '<option value="' + bank.id + '"' + selected + '>' + bank.label + '</option>';
	});

	return options;
}

function renderBankOptionsToStaticDropdowns() {
	for (var i = 1; i <= 10; i++) {
		var selectElement = jQuery('#bank_' + i);
		if (selectElement.length) {
			selectElement.html(generateBankOptions(3));
		}
	}

	var bankEditElement = jQuery('#bank_edit');
	if (bankEditElement.length) {
		bankEditElement.html(generateBankOptions(3));
	}
}

function getBankLabelById(bankId) {
	var bank = globalBankData.find(function (b) {
		return b.bank_id == bankId;
	});

	return bank ? bank.bank_label : '-';
}

function getBankLabelByCode(bankCode) {
	if (globalBankData.length > 0) {
		var bankById = globalBankData.find(function (b) {
			return b.bank_id == bankCode;
		});

		if (bankById) {
			return bankById.bank_label;
		}
	}

	var hardcodedBankLabels = {
		1: 'BCA - Sutono',
		2: 'BRI - Sutono',
		3: 'Mandiri - Sutono',
		4: 'Mandiri Bisnis - Santoso',
		5: 'Tunai',
		6: 'Mandiri - Yu Shujin'
	};

	var bankByCode = globalBankData.find(function (b) {
		return b.bank_kode == bankCode;
	});

	if (bankByCode) {
		return bankByCode.bank_label;
	}

	return hardcodedBankLabels[bankCode] || 'Unknown Bank';
}

function getBankLabelFromPayment(bankId, bankCode) {
	if (bankId !== null && bankId !== undefined && bankId !== 'null' && bankId !== 'undefined' && bankId !== '') {
		return getBankLabelByCode(bankId);
	}
	if (bankCode !== null && bankCode !== undefined && bankCode !== 'null' && bankCode !== 'undefined' && bankCode !== '') {
		return getBankLabelByCode(bankCode);
	}
	return '-';
}

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

/**
 * Variable untuk menyimpan data kota (cache)
 */
var kotaDataCache = null;

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

/// KATALOG PERFORMA EDIT & TAMBAH


/**
 * Fungsi untuk mendapatkan informasi bank berdasarkan bank_id
 * Digunakan untuk menampilkan rekening bank secara dinamis di proforma
 */
function getBankInfoById(bankId) {
	// Default fallback
	var defaultBank = {
		nama: 'Mandiri',
		rekening: '141 000 225 5818',
		atas_nama: 'Sutono'
	};

	if (!bankId) return defaultBank;

	// Cari di globalBankData (jika tersedia)
	if (typeof globalBankData !== 'undefined' && globalBankData.length > 0) {
		var bank = globalBankData.find(function (b) {
			return b.bank_id === bankId;
		});

		if (bank) {
			return {
				nama: bank.bank_nama || bank.bank_kode,
				rekening: bank.bank_no_rekening || '',
				atas_nama: bank.bank_atas_nama || ''
			};
		}
	}

	// Fallback hardcoded berdasarkan bank_id
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

function doSearchByTypeEdit(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		var tipe = jQuery('#jenis_edit_popup').val();
		jQuery('#qty_edit_popup').val(0);
		jQuery('#price_edit_popup').val(0);
		getKatalogEdit(tipe);
	}, 2000);
}

function getKatalogEdit(tipe) {
	if (tipe == "") {
		$$('#gambar_proforma_input_1').css("display", "initial");
		$$('#color_proforma_input_1').css("display", "none");
		$$('#type_proforma_input_1').removeClass('col-100');
		$$('#type_proforma_input_1').addClass('col-70');
		$$('#el_ukuran_hc_edit_1').hide();
		$$('#el_ukuran_ts_edit_1').css("display", "none");
		document.getElementById("price_edit_popup").readOnly = true;
	} else {
		var count = 1;
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/get-produk-proforma",
			dataType: 'JSON',
			data: {
				jenis_1: tipe.substr(-3)
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();

				if (tipe.indexOf("HCC") != -1) {
					$$('#gambar_proforma_edit_1').css("display", "initial");
					$$('#color_proforma_edit_1').css("display", "none");
					$$('#el_ukuran_hc_edit_1').show();
					$$('#el_ukuran_ts_edit_1').css("display", "none");
					$$('#type_proforma_edit_1').removeClass('col-100');
					$$('#type_proforma_edit_1').addClass('col-70');
					$$('#el_style_hc_edit_1').show();
					$$('#file_edit_1').prop('required', true)
					$$('#file_edit_1').prop('validate', true)
					showselectBoxUkuranPerformaEdit('HC-112', 1);
					document.getElementById("price_edit_popup").readOnly = true;
				} else if (tipe.indexOf("HC") != -1) {
					document.getElementById("price_edit_popup").readOnly = true;
					if (tipe.length == 6) {
						if (data.data.length != 0) {
							$("#openPopupEdit_1").click();
							getKatalogPopupEdit(tipe.substr(-3));
							$$('#color_proforma_edit_1').css("display", "none");
							$$('#gambar_proforma_edit_1').css("display", "none");
							$$('#file_edit_1').prop('required', false)
							$$('#file_edit_1').prop('validate', false)
							$$('#el_ukuran_hc_edit_1').hide();
							$$('#el_ukuran_ts_edit_1').css("display", "none");
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_proforma_edit_1').css("display", "none");
							$$('#gambar_proforma_edit_1').css("display", "none");
							jQuery('#jenis_edit_popup').val('');
							$$('#file_edit_1').prop('required', false)
							$$('#file_edit_1').prop('validate', false)
							$$('#el_ukuran_hc_edit_1').hide();
							$$('#el_ukuran_ts_edit_1').css("display", "none");
						}
					} else if (tipe.length == 2) {
						if (data.data.length != 0) {
							$("#openPopupEditAll_1").click();
							getKatalogPopupPerformaEditAll(1);
							$$('#color_proforma_input_1').css("display", "none");
							$$('#gambar_proforma_input_1').css("display", "none");
							$$('#file_edit_1').prop('required', false)
							$$('#file_edit_1').prop('validate', false)
							$$('#el_ukuran_hc_edit_1').hide();
							$$('#el_ukuran_ts_edit_1').css("display", "none");
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_proforma_edit_1').css("display", "none");
							$$('#gambar_proforma_edit_1').css("display", "none");
							jQuery('#jenis_edit_popup').val('');
							$$('#file_edit_1').prop('required', false)
							$$('#file_edit_1').prop('validate', false)
							$$('#el_ukuran_hc_edit_1').hide();
							$$('#el_ukuran_ts_edit_1').css("display", "none");
						}
					} else {
						app.dialog.alert('Panjang Huruf Tipe HC 6 Digit, Contoh : (HC-112)');
						$$('#gambar_proforma_edit_1').css("display", "initial");
						$$('#color_proforma_edit_1').css("display", "none");
						$$('#jenis_edit_popup').val("");
						$$('#el_ukuran_hc_edit_1').hide();
						$$('#el_ukuran_ts_edit_1').css("display", "none");
						$$('#file_edit_1').prop('required', true)
						$$('#file_edit_1').prop('validate', true)
					}
				} else if (tipe.indexOf("TAS") != -1) {
					if (tipe.length == 3) {
						$("#openPopupTsEdit_1").click();
						$$('#gambar_proforma_edit_1').css("display", "initial");
						$$('#color_proforma_edit_1').css("display", "none");
						$$('#el_ukuran_ts_edit_1').css("display", "initial");
						$$('#type_proforma_edit_1').css("display", "none");
						$$('#el_ukuran_ts_edit_1').removeClass('col-100');
						$$('#el_ukuran_ts_edit_1').addClass('col-70');
						$$('#file_edit_1').prop('required', true);
						$$('#file_edit_1').prop('validate', true);
						$$('#el_ukuran_hc_edit_1').hide();
						document.getElementById("price_edit_popup").readOnly = false;
						showselectBoxTSPerformaEdit(1);
					} else {
						app.dialog.alert('Panjang Huruf Tipe TS 3 Digit, Contoh : (TAS)');
					}
				} else {
					$("#openPopupTsEdit_1").click();
					$$('#gambar_proforma_edit_1').css("display", "initial");
					$$('#color_proforma_edit_1').css("display", "none");
					$$('#el_ukuran_ts_edit_1').css("display", "initial");
					$$('#type_proforma_edit_1').css("display", "none");
					$$('#el_ukuran_ts_edit_1').removeClass('col-100');
					$$('#el_ukuran_ts_edit_1').addClass('col-70');
					$$('#file_edit_1').prop('required', true);
					$$('#file_edit_1').prop('validate', true);
					$$('#el_ukuran_hc_edit_1').hide();
					document.getElementById("price_edit_popup").readOnly = false;
					showselectBoxTSPerformaEdit(1);
				}


			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function getKatalogPopupEdit(tipe) {
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
				katalog_data += '   <img onclick="fillProformaEdit(\'' + item.produk_detail_id + '\',\'' + item.produk_grup_warna + '\',\'' + item.produk_id + '\',\'' + item.nama_warna + '\',\'1\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
				katalog_data += '  <h4 style="margin-top:2px;margin-bottom:5px;">' + item.produk_id + '</h4>';
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
			jQuery('#katalog_data_edit').html(katalog_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function openPopupKatalogPerformaEdit(produk_id, count) {
	$('#openPopupEdit_1').click();
	$('#jenis_edit_popup').val(produk_id);
	$('#close-all-katalog-edit-popup').click();
	getKatalogPopupEdit(produk_id);
}

function getKatalogPopupPerformaEditAll(count) {
	var produk_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-tipe-produk",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			$.each(data.data, function (i, item) {

				produk_data += '<div class="col-50" style="margin:4px;">';
				produk_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
				produk_data += ' <a>';
				produk_data += '   <img onclick="openPopupKatalogPerformaEdit(\'' + item.produk_id + '\',\'' + count + '\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
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

			app.dialog.close();
			jQuery('#produk_data_all_katalog_edit').html(produk_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function fillProformaEdit(produk_detail_id, produk_grup_warna, produk_id, nama_warna, count) {

	$("#close-katalog-popup-edit").click();
	$$('#color_proforma_edit_1').css("display", "inline");
	$$('#type_proforma_edit_1').removeClass('col-100');
	$$('#type_proforma_edit_1').addClass('col-70');
	$$('#ukuran_ts_edit_1').prop('required', false);
	$$('#ukuran_ts_edit_1').prop('validate', false);

	$$('#color_edit_1').html('<div id="performa_color_edit_1" data-color="' + produk_grup_warna + '" style="margin:5px;text-align:center;height:25px;background-color:' + produk_grup_warna + '"></div>');
	$$('#proforma_produk_detail_edit_id_1').val(produk_detail_id);
	$$('#proforma_produk_id_edit_1').val(produk_id);
	$$('#keterangan_full_edit_popup').val(nama_warna);
	$$('#keterangan_full_edit_popup').val(nama_warna);
	$$('#el_ukuran_hc_edit_1').show();
	$$('#el_ukuran_ts_edit_1').css("display", "none");
	$$('#el_style_hc_edit_1').show();
	showselectBoxUkuranPerformaEdit(produk_id, 1);
	// $$('#jenis_1').val(produk_id);

}

function gambarPerformaEdit(performa_table_id) {
	if (jQuery('#file_edit_' + performa_table_id + '').val() == '' || jQuery('#file_edit_' + performa_table_id + '').val() == null) {
		$$('#value_performa_edit_' + performa_table_id + '').html('Gambar');
	} else {
		$$('#value_performa_edit_' + performa_table_id + '').html($$('#file_edit_' + performa_table_id + '').val().replace('fakepath', ''));
	}
}

// Tambah performa
function doSearchByTypeTambahPopup(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		var tipe = jQuery('#jenis_tambah_popup').val();
		getKatalogTambahPopup(tipe);
	}, 2000);
}

function getKatalogTambahPopup(tipe) {
	if (tipe == "") {
		$$('#gambar_proforma_tambah_1').css("display", "initial");
		$$('#color_proforma_tambah_1').css("display", "none");
		$$('#type_proforma_tambah_1').removeClass('col-100');
		$$('#type_proforma_tambah_1').addClass('col-70');
		$$('#el_ukuran_hc_tambah_1').hide();
		$$('#el_ukuran_ts_tambah_1').css("display", "none");
		document.getElementById("price_tambah_popup").readOnly = true;
	} else {
		var count = 1;
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/get-produk-proforma",
			dataType: 'JSON',
			data: {
				jenis_1: tipe.substr(-3)
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();

				if (tipe.indexOf("HCC") != -1) {
					$$('#gambar_proforma_tambah_1').css("display", "initial");
					$$('#color_proforma_tambah_1').css("display", "none");
					$$('#el_ukuran_hc_tambah_1').show();
					$$('#el_ukuran_ts_tambah_1').css("display", "none");
					$$('#type_proforma_tambah_1').removeClass('col-100');
					$$('#type_proforma_tambah_1').addClass('col-70');
					$$('#file_tambah_1').prop('required', true)
					$$('#file_tambah_1').prop('validate', true)
					$$('#el_style_hc_tambah_1').show();
					document.getElementById("price_tambah_popup").readOnly = true;
					showselectBoxUkuranPerformaTambah('HC-112', 1);
				} else if (tipe.indexOf("HC") != -1) {
					document.getElementById("price_tambah_popup").readOnly = true;
					if (tipe.length == 6) {
						if (data.data.length != 0) {
							$("#openPopupTambah_1").click();
							getKatalogPopupTambah(tipe.substr(-3));
							$$('#color_proforma_tambah_1').css("display", "none");
							$$('#gambar_proforma_tambah_1').css("display", "none");
							$$('#file_tambah_1').prop('required', false)
							$$('#file_tambah_1').prop('validate', false)
							$$('#el_ukuran_hc_tambah_1').hide();
							$$('#el_ukuran_ts_tambah_1').css("display", "none");
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_proforma_tambah_1').css("display", "none");
							$$('#gambar_proforma_tambah_1').css("display", "none");
							jQuery('#jenis_tambah_popup').val('');
							$$('#file_tambah_1').prop('required', false)
							$$('#file_tambah_1').prop('validate', false)
							$$('#el_ukuran_hc_tambah_1').hide();
							$$('#el_ukuran_ts_tambah_1').css("display", "none");
						}
					} else if (tipe.length == 2) {
						if (data.data.length != 0) {
							$("#openPopupTambahAll_1").click();
							getKatalogPopupPerformaTambahAll(1);
							$$('#color_proforma_tambah_1').css("display", "none");
							$$('#gambar_proforma_tambah_1').css("display", "none");
							$$('#file_tambah_1').prop('required', false)
							$$('#file_tambah_1').prop('validate', false)
							$$('#el_ukuran_hc_tambah_1').hide();
							$$('#el_ukuran_ts_tambah_1').css("display", "none");
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_proforma_tambah_1').css("display", "none");
							$$('#gambar_proforma_tambah_1').css("display", "none");
							jQuery('#jenis_tambah_popup').val('');
							$$('#file_tambah_1').prop('required', false)
							$$('#file_tambah_1').prop('validate', false)
							$$('#el_ukuran_hc_tambah_1').hide();
							$$('#el_ukuran_ts_tambah_1').css("display", "none");
						}
					} else {
						app.dialog.alert('Panjang Huruf Tipe HC 6 Digit, Contoh : (HC-112)');
						$$('#gambar_proforma_tambah_1').css("display", "initial");
						$$('#color_proforma_tambah_1').css("display", "none");
						jQuery('#jenis_tambah_popup').val('');
						$$('#el_ukuran_hc_tambah_1').hide();
						$$('#el_ukuran_ts_tambah_1').css("display", "none");
						$$('#file_tambah_1').prop('required', true)
						$$('#file_tambah_1').prop('validate', true)
					}
				} else if (tipe.indexOf("TAS") != -1) {
					if (tipe.length == 3) {
						$("#openPopupTsTambah_1").click();
						$$('#gambar_proforma_tambah_1').css("display", "initial");
						$$('#color_proforma_tambah_1').css("display", "none");
						$$('#el_ukuran_ts_tambah_1').css("display", "initial");
						$$('#type_proforma_tambah_1').css("display", "none");
						$$('#el_ukuran_ts_tambah_1').removeClass('col-100');
						$$('#el_ukuran_ts_tambah_1').addClass('col-70');
						$$('#file_tambah_1').prop('required', true);
						$$('#file_tambah_1').prop('validate', true);
						$$('#el_ukuran_hc_tambah_1').hide();
						document.getElementById("price_tambah_popup").readOnly = false;
						showselectBoxTSPerformaTambah(1);
					} else {
						app.dialog.alert('Panjang Huruf Tipe TS 3 Digit, Contoh : (TAS)');
					}
				} else {
					$("#openPopupTsTambah_1").click();
					$$('#gambar_proforma_tambah_1').css("display", "initial");
					$$('#color_proforma_tambah_1').css("display", "none");
					$$('#el_ukuran_ts_tambah_1').css("display", "initial");
					$$('#type_proforma_tambah_1').css("display", "none");
					$$('#el_ukuran_ts_tambah_1').removeClass('col-100');
					$$('#el_ukuran_ts_tambah_1').addClass('col-70');
					$$('#file_tambah_1').prop('required', true);
					$$('#file_tambah_1').prop('validate', true);
					document.getElementById("price_tambah_popup").readOnly = false;
					$$('#el_ukuran_hc_tambah_1').hide();
					showselectBoxTSPerformaTambah(1);
				}
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function getKatalogPopupTambah(tipe) {
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
				katalog_data += '   <img onclick="fillProformaTambahPopup(\'' + item.produk_detail_id + '\',\'' + item.produk_grup_warna + '\',\'' + item.produk_id + '\',\'' + item.nama_warna + '\',\'1\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
				katalog_data += '  <h4 style="margin-top:2px;margin-bottom:5px;">' + item.produk_id + '</h4>';
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
			jQuery('#katalog_data_tambah').html(katalog_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function openPopupKatalogPerformaTambah(produk_id, count) {
	$('#openPopupTambah_1').click();
	$('#jenis_tambah_popup').val(produk_id);
	$('#close-all-katalog-tambah-popup').click();
	getKatalogPopupTambah(produk_id);
}

function getKatalogPopupPerformaTambahAll(count) {
	var produk_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-tipe-produk",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			$.each(data.data, function (i, item) {

				produk_data += '<div class="col-50" style="margin:4px;">';
				produk_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
				produk_data += ' <a>';
				produk_data += '   <img onclick="openPopupKatalogPerformaTambah(\'' + item.produk_id + '\',\'' + count + '\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
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

			app.dialog.close();
			jQuery('#produk_data_all_katalog_tambah').html(produk_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}
function fillProformaTambahPopup(produk_detail_id, produk_grup_warna, produk_id, nama_warna, count) {

	$("#close-katalog-popup-tambah").click();
	$$('#color_proforma_tambah_1').css("display", "inline");
	$$('#type_proforma_tambah_1').removeClass('col-100');
	$$('#type_proforma_tambah_1').addClass('col-70');
	$$('#ukuran_tambah_ts_1').prop('required', false);
	$$('#ukuran_tambah_ts_1').prop('validate', false);

	$$('#color_tambah_popup_1').html('<div id="performa_color_tambah_popup_1" data-color="' + produk_grup_warna + '" style="margin:5px;text-align:center;height:25px;background-color:' + produk_grup_warna + '"></div>');
	$$('#proforma_produk_detail_tambah_id_1').val(produk_detail_id);
	$$('#proforma_produk_tambah_id_1').val(produk_id);
	$$('#keterangan_full_1').val(produk_id);
	$$('#keterangan_full_tambah_popup').val(nama_warna);
	$$('#el_ukuran_hc_tambah_1').show();
	$$('#el_ukuran_ts_tambah_1').css("display", "none");
	$$('#el_style_hc_tambah_1').show();
	showselectBoxUkuranPerformaTambah(produk_id, 1);
	// $$('#jenis_1').val(produk_id);

}
function showselectBoxTSPerformaTambah(count) {
	$('#ukuran_tambah_ts_' + count).html('');
	$$('#ukuran_tambah_hc_' + count).prop('required', false);
	$$('#ukuran_tambah_hc_' + count).prop('validate', false);
	$$('#ukuran_tambah_ts_' + count).prop('required', true);
	$$('#ukuran_tambah_ts_' + count).prop('validate', true);
	$$('#el_style_hc_tambah_1').hide();
	$$('#style_hc_tambah_' + count).prop('required', false);
	$$('#style_hc_tambah_' + count).prop('validate', false);
	$$('#el_extra_tambah_detail_' + count).hide();
	$$('#extra_tambah_detail_' + count).prop('required', false);
	$$('#extra_tambah_detail_' + count).prop('validate', false);
	selectBoxTSPerformaTambah(count);
}

function showselectBoxUkuranPerformaTambah(produk_id, count) {
	$('#ukuran_tambah_hc_' + count).html('');
	$$('#ukuran_tambah_hc_' + count).prop('required', true);
	$$('#ukuran_tambah_hc_' + count).prop('validate', true);
	$$('#ukuran_tambah_ts_' + count).prop('required', false);
	$$('#ukuran_tambah_ts_' + count).prop('validate', false);
	$$('#el_extra_tambah_detail_' + count).show();
	$$('#extra_tambah_detail_' + count).prop('required', true);
	$$('#extra_tambah_detail_' + count).prop('validate', true);
	selectBoxUkuranPerformaTambah(produk_id, count);
	selectBoxStylePerformaTambah(produk_id, count)
}

function showselectBoxTSPerformaEdit(count) {
	$('#ukuran_edit_ts_' + count).html('');
	$$('#ukuran_edit_hc_' + count).prop('required', false);
	$$('#ukuran_edit_hc_' + count).prop('validate', false);
	$$('#ukuran_edit_ts_' + count).prop('required', true);
	$$('#ukuran_edit_ts_' + count).prop('validate', true);
	$$('#style_hc_edit_' + count).prop('required', false);
	$$('#style_hc_edit_' + count).prop('validate', false);
	$$('#type_proforma_edit_' + count).prop('required', false);
	$$('#type_proforma_edit_' + count).prop('validate', false);
	$$('#el_style_hc_edit_1').hide();
	$$('#el_extra_edit_detail_' + count).hide();
	$$('#extra_edit_detail_' + count).prop('required', false);
	$$('#extra_edit_detail_' + count).prop('validate', false);
	selectBoxTSPerformaEdit(count);
}

function showselectBoxUkuranPerformaEdit(produk_id, count) {
	$('#ukuran_edit_hc_' + count).html('');
	$$('#ukuran_edit_hc_' + count).prop('required', true);
	$$('#ukuran_edit_hc_' + count).prop('validate', true);
	$$('#ukuran_edit_ts_' + count).prop('required', false);
	$$('#ukuran_edit_ts_' + count).prop('validate', false);
	$$('#type_proforma_edit_' + count).prop('required', true);
	$$('#type_proforma_edit_' + count).prop('validate', true);
	$$('#el_extra_edit_detail_' + count).show();
	$$('#extra_edit_detail_' + count).prop('required', true);
	$$('#extra_edit_detail_' + count).prop('validate', true);
	selectBoxUkuranPerformaEdit(produk_id, count);
	selectBoxStylePerformaEdit(produk_id, count)
}

function clearInputSelectTambah() {
	$$('#el_ukuran_ts_tambah_1').css("display", "none");
	$$('#gambar_proforma_tambah_1').css("display", "none");
	$$('#color_proforma_tambah_1').css("display", "none");
	$$('#type_proforma_tambah_1').css("display", "initial");
	$$('#type_proforma_tambah_1').removeClass('col-70');
	$$('#type_proforma_tambah_1').addClass('col-100');
	$$('#el_ukuran_hc_tambah_1').css("display", "none");
	$$('#el_ukuran_ts_tambah_1').css("display", "none");
	$$('#el_style_hc_tambah_1').css("display", "none");
	$$('#value_performa_tambah_1').html('<i class="f7-icons">photo_fill</i>');
	$$('#file_tambah_1').val('');
	document.getElementById("tambah_performa_header_penjualan_popup").reset();
}

function clearInputSelectEdit() {
	$$('#el_ukuran_ts_edit_1').css("display", "none");
	$$('#gambar_proforma_edit_1').css("display", "none");
	$$('#color_proforma_edit_1').css("display", "none");
	$$('#type_proforma_edit_1').css("display", "initial");
	$$('#type_proforma_edit_1').removeClass('col-70');
	$$('#type_proforma_edit_1').addClass('col-100');
	$$('#el_ukuran_hc_edit_1').css("display", "none");
	$$('#el_ukuran_ts_edit_1').css("display", "none");
	$$('#el_style_hc_edit_1').css("display", "none");
	$$('#proforma_produk_detail_edit_id_1').val('');
	$$('#proforma_produk_id_edit_1').val('');
	$$('#value_performa_edit_1').html('<i class="f7-icons">photo_fill</i>');
	$$('#file_edit_1').val('');
	document.getElementById("edit_performa_header_penjualan_popup").reset();
}


function selectBoxUkuranPerformaEdit(produk_id, count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-ukuran",
		dataType: "JSON",
		data: {
			produk_id: produk_id,
			xtra: jQuery('#extra_edit_detail_1').val()
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var select_box_kota;
			select_box_kota += '<option value="" selected>Pilih Ukuran</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.nama_ukuran + '">' + val.nama_ukuran + '</option>';
			});
			$$('#ukuran_edit_hc_1').html(select_box_kota);
		}
	});
}

function selectBoxStylePerformaEdit(produk_id, count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-variasi",
		dataType: "JSON",
		data: {
			produk_id: produk_id,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var select_box_style;
			jQuery.each(data.data, function (i, val) {
				select_box_style += '<option value="' + val.nama_variasi + '">' + val.nama_variasi + '</option>';
			});
			$$('#style_hc_edit_' + count).html(select_box_style);
			$$('#style_hc_edit_input_' + count).html('Pilih Style');
		}
	});
}

function selectBoxTSPerformaEdit(count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-produk-ts",
		dataType: "JSON",
		data: {
		},
		beforeSend: function () {
			$$('#katalog_ts_data_edit').html('');
		},
		success: function (data) {
			var select_box_ts = '';
			jQuery.each(data.data, function (i, val) {
				select_box_ts += '<li>';
				select_box_ts += '<label class="item-radio item-content">';
				select_box_ts += '  <input type="radio" onclick="fillEditUkuranTsInput(\'' + val.nama_produk_ts + '\');fillHargaPerformaTs(\'edit\');" name="edit_ukuran_performa_radio" id="edit_ukuran_performa_radio"/>';
				select_box_ts += '  <i class="icon icon-radio"></i>';
				select_box_ts += '  <div class="item-inner">';
				select_box_ts += '		<div class="item-title">' + val.nama_produk_ts + '</div>';
				select_box_ts += '  </div>';
				select_box_ts += '</label>';
				select_box_ts += '</li>';
			});
			$$('#katalog_ts_data_edit').html(select_box_ts);
		}
	});
}

function fillEditUkuranTsInput(ukuran_ts) {
	$("#close-katalog-ts-popup-edit").click();
	$$('#ukuran_edit_ts_1').val(ukuran_ts);
}

function selectBoxUkuranPerformaTambah(produk_id, count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-ukuran",
		dataType: "JSON",
		data: {
			produk_id: produk_id,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var select_box_kota;
			select_box_kota += '<option value="" selected>Pilih Ukuran</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.nama_ukuran + '">' + val.nama_ukuran + '</option>';
			});
			$$('#ukuran_tambah_hc_1').html(select_box_kota);
		}
	});
}

function selectBoxStylePerformaTambah(produk_id, count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-variasi",
		dataType: "JSON",
		data: {
			produk_id: produk_id,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var select_box_style;
			jQuery.each(data.data, function (i, val) {
				select_box_style += '<option value="' + val.nama_variasi + '">' + val.nama_variasi + '</option>';
			});
			$$('#style_hc_tambah_' + count).html(select_box_style);
			$$('#style_hc_tambah_input_' + count).html('Pilih Style');
		}
	});
}

function selectBoxTSPerformaTambah(count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-produk-ts",
		dataType: "JSON",
		data: {
		},
		beforeSend: function () {
			$$('#katalog_ts_data_tambah').html('');
		},
		success: function (data) {
			var select_box_ts = '';
			jQuery.each(data.data, function (i, val) {
				select_box_ts += '<li>';
				select_box_ts += '<label class="item-radio item-content">';
				select_box_ts += '  <input type="radio" onclick="fillTambahUkuranTsInput(\'' + val.nama_produk_ts + '\');fillHargaPerformaTs(\'tambah\');" name="tambah_ukuran_performa_radio" id="tambah_ukuran_performa_radio"/>';
				select_box_ts += '  <i class="icon icon-radio"></i>';
				select_box_ts += '  <div class="item-inner">';
				select_box_ts += '		<div class="item-title">' + val.nama_produk_ts + '</div>';
				select_box_ts += '  </div>';
				select_box_ts += '</label>';
				select_box_ts += '</li>';
			});
			$$('#katalog_ts_data_tambah').html(select_box_ts);
		}
	});
}

function fillTambahUkuranTsInput(ukuran_ts) {
	$$('#ukuran_tambah_ts_1').val(ukuran_ts);
	$("#close-katalog-ts-popup-tambah").click();
}


function fillHargaPerformaTs(count) {

	if ($('#extra_' + count + '_detail_1').val() != 1) {
		var xtra = 1;
		var message = 'Xtra';
	} else {
		var xtra = 0;
		var message = 'Grosir';
	}
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-produk-ts-harga",
		dataType: "JSON",
		data: {
			id_produk_ts: $$('#ukuran_' + count + '_ts_1').val(),
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			if (xtra != 0) {
				// if (data.data.harga_xtra != 0) {
				$$('#harga_satuan_' + count + '_popup').val(data.data.harga_xtra);
				// } else {
				// 	app.dialog.alert('Harga ' + message + ' tidak ada di tipe ini');
				// 	$$('#harga_satuan_' + count + '_popup').val(0);
				// }
			} else {
				// if (data.data.harga_grosir != 0) {
				$$('#harga_satuan_' + count + '_popup').val(data.data.harga_grosir);
				// } else {
				// 	app.dialog.alert('Harga ' + message + ' tidak ada di tipe ini');
				// 	$$('#harga_satuan_' + count + '_popup').val(0);
				// }
			}

			$$('#price_' + count + '_popup').val(number_format($$('#harga_satuan_' + count + '_popup').val()));
			$$('#jenis_' + count + '_popup').val($$('#ukuran_' + count + '_ts_1').val());
			console.log($$('#price_' + count + '_popup').val());
		}
	});
}

function callbackPerformaInput(count) {
	fillHargaPerformaProduk(count);
	fillHargaVariasiPerformaProduk(count);
}

function fillHargaPerformaProduk(count) {
	var tipe = jQuery('#jenis_' + count + '_popup').val();

	if (tipe.indexOf("HCC") != -1) {
		if ($$('#ukuran_' + count + '_hc_1').val() != '') {
			var produk_id = 'HC-112';
			var ukuran = $$('#ukuran_' + count + '_hc_1').val();
		} else {
			var produk_id = 'HC-112';
			var ukuran = $$('#proforma_old_ukuran_' + count + '_1').val();
		}
	} else {
		if (tipe.length >= 9) {
			if ($$('#ukuran_' + count + '_hc_1').val() != '') {
				var produk_id = tipe.substr(-3);
				var ukuran = $$('#ukuran_' + count + '_hc_1').val();
			} else {
				var produk_id = tipe.substr(3, 3);
				var ukuran = $$('#proforma_old_ukuran_' + count + '_1').val();
			}
		} else {
			if ($$('#ukuran_' + count + '_hc_1').val() != '') {
				var produk_id = tipe.substr(-3);
				var ukuran = $$('#ukuran_' + count + '_hc_1').val();
			} else {
				var produk_id = tipe.substr(3, 3);
				var ukuran = $$('#proforma_old_ukuran_' + count + '_1').val();
			}
		}
	}

	if ($('#extra_' + count + '_detail_1').val() != 1) {
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
			nama_ukuran: ukuran,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var price = 0;
			// if ($$('#ukuran_' + count + '_hc_1').val() != '' && $$('#ukuran_' + count + '_hc_1').val() != 'none') {
			if (xtra != 0) {
				if (data.data.harga_ukuran != 0) {
					$$('#harga_satuan_' + count + '_popup').val(data.data.harga_ukuran);
				} else {
					app.dialog.alert('Harga Ukuran ' + message + ' tidak ada di tipe ini');
					$$('#harga_satuan_' + count + '_popup').val(0);
				}
			} else {
				if (data.data.harga_ukuran_grosir != 0) {
					$$('#harga_satuan_' + count + '_popup').val(data.data.harga_ukuran_grosir);
				} else {
					app.dialog.alert('Harga Ukuran ' + message + ' tidak ada di tipe ini');
					$$('#harga_satuan_' + count + '_popup').val(0);
				}
			}
			// } else {
			// 	$$('#harga_satuan_' + count + '_popup').val(0);
			// 	app.dialog.alert('Harga Ukuran ' + message + ' tidak ada di tipe ini');
			// }

			price = parseFloat($$('#harga_satuan_' + count + '_popup').val()) + parseFloat($$('#harga_style_' + count + '_popup').val());
			$$('#price_' + count + '_popup').val(number_format(price));
			console.log($$('#price_' + count + '_popup').val());
		}
	});
}

function fillHargaVariasiPerformaProduk(count) {
	var tipe = jQuery('#jenis_' + count + '_popup').val();

	if (tipe.indexOf("HCC") != -1) {
		if ($('#el_style_hc_' + count + '_1').css('display') != 'none') {
			var produk_id = 'HC-112';
			var style = $$('#style_hc_' + count + '_1').val();
			var ukuran = $$('#ukuran_' + count + '_hc_1').val();
		} else {
			var produk_id = 'HC-112';
			var ukuran = $$('#proforma_old_ukuran_' + count + '_1').val();
			var style_string = $$('#proforma_old_style_' + count + '_1').val();
			var style = [];
			style = style_string.split(",");
		}
	} else {
		if (tipe.length >= 9) {
			if ($('#el_style_hc_' + count + '_1').css('display') != 'none') {
				var produk_id = tipe.substr(-3);
				var style = $$('#style_hc_' + count + '_1').val();
				var ukuran = $$('#ukuran_' + count + '_hc_1').val();
			} else {
				var produk_id = tipe.substr(3, 3);
				var ukuran = $$('#proforma_old_ukuran_' + count + '_1').val();
				var style_string = $$('#proforma_old_style_' + count + '_1').val();
				var style = [];
				style = style_string.split(",");
			}
		} else {
			if ($('#el_style_hc_' + count + '_1').css('display') != 'none') {
				var produk_id = tipe.substr(-3);
				var ukuran = $$('#ukuran_' + count + '_hc_1').val();
				var style = $$('#style_hc_' + count + '_1').val();
			} else {
				var produk_id = tipe.substr(3, 3);
				var ukuran = $$('#proforma_old_ukuran_' + count + '_1').val();
				var style_string = $$('#proforma_old_style_' + count + '_1').val();
				var style = [];
				style = style_string.split(",");
			}
		}
	}

	if ($('#extra_' + count + '_detail_1').val() != 1) {
		var xtra = 1;
		var message = 'Xtra';
	} else {
		var xtra = 0;
		var message = 'Grosir';
	}

	console.log(style.length);
	var price = 0;
	if (style.length != 0) {
		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/get-produk-style-harga",
			dataType: "JSON",
			data: {
				produk_id: produk_id,
				nama_variasi: style,
				xtra: xtra,
			},
			beforeSend: function () {
			},
			success: function (data) {
				if (data.data != 0) {
					if (ukuran.indexOf("+") != -1) {
						$$('#harga_style_' + count + '_popup').val(parseFloat(data.data) * 2);
						price = parseFloat($$('#harga_satuan_' + count + '_popup').val()) + parseFloat($$('#harga_style_' + count + '_popup').val());
						$$('#price_' + count + '_popup').val(number_format(price));
					} else {
						$$('#harga_style_' + count + '_popup').val(data.data);
						price = parseFloat($$('#harga_satuan_' + count + '_popup').val()) + parseFloat($$('#harga_style_' + count + '_popup').val());
						$$('#price_' + count + '_popup').val(number_format(price));
					}
				} else {
					setTimeout(function () {
						$$("#style_hc_" + count + "_input_1").html('Pilih Style');
						$$('#harga_style_' + count + '_popup').val(0);
						price = parseFloat($$('#harga_satuan_' + count + '_popup').val()) + parseFloat($$('#harga_style_' + count + '_popup').val());
						$$('#price_' + count + '_popup').val(number_format(price));
						app.dialog.alert('Harga Style ' + message + ' tidak ada di tipe ini');
					}, 500);
				}

			}
		});
	} else {
		setTimeout(function () {
			$$("#style_hc_" + count + "_input_1").html('Pilih Style');
			$$('#harga_style_' + count + '_popup').val(0);
			price = parseFloat($$('#harga_satuan_' + count + '_popup').val()) + parseFloat($$('#harga_style_' + count + '_popup').val());
			$$('#price_' + count + '_popup').val(number_format(price));
		}, 500);
	}
}

function getTargetBroadcastCs() {
	var katalog_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-target-broadcast-cs",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			jQuery('#target_broadcast_value').html(parseFloat(data.data_karyawan.target_broadcast));
			jQuery('#tercapai_broadcast_value').html(parseFloat(data.data));
			jQuery('#target_broadcast_minus').html(parseFloat(data.data_karyawan.target_broadcast - data.data));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function gambarPenjualanTambahPopup(penjualan_table_id) {
	if (jQuery('#file_tambah_' + penjualan_table_id + '').val() == '' || jQuery('#file_tambah_' + penjualan_table_id + '').val() == null) {
		$$('#value_penjualan_tambah_' + penjualan_table_id + '').html('Gambar');
	} else {
		$$('#value_penjualan_tambah_' + penjualan_table_id + '').html($$('#file_tambah_' + penjualan_table_id + '').val().replace('fakepath', ''));
	}
}


function gambarPenjualanEdit(penjualan_id) {
	if (jQuery('#file_edit_penjualan_' + penjualan_id + '').val() == '' || jQuery('#file_edit_penjualan_' + penjualan_id + '').val() == null) {
		$$('#value_penjualan_edit_' + penjualan_id + '').html('Gambar');
	} else {
		$$('#value_penjualan_edit_' + penjualan_id + '').html($$('#file_edit_penjualan_' + penjualan_id + '').val().replace('fakepath', ''));
	}
}


function editDetailOwnerPenjualanProses() {
	if (!$$('#edit_penjualan_detail_manager_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Form Anda');
	} else {
		var formData = new FormData(jQuery("#edit_penjualan_detail_manager_form")[0]);
		formData.append('style_new_hc_1', $('#style_hc_penjualan_edit_input_1').html());
		formData.append('penjualan_id', $('#penjualan_id_edit_2').val());
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/edit-detail-penjualan-proses-sales-backup",
			dataType: 'JSON',
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				$("#color_penjualan_edit_1").css("display", "none");
				$("#gambar_penjualan_edit_1").css("display", "none");
				$('#backbutton_edit-detail-manager-penjualan').click();
				document.getElementById("edit_penjualan_detail_manager_form").reset();
				getDetailPenjualanOwner($('#penjualan_id_edit_2').val());
				clearInputSelectPenjualanEdit();
				getPenjualanHeader(1);
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function hapusDetailPenjualanOwner(penjualan_detail_performa_id_hapus, penjualan_id_hapus) {
	app.dialog.create({
		title: 'Hapus Client',
		text: 'Apakah Anda Yakin Menghapus Item Penjualan ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/hapus-detail-penjualan-cs",
						dataType: 'JSON',
						data: {
							penjualan_detail_performa_id: penjualan_detail_performa_id_hapus,
							penjualan_id: penjualan_id_hapus
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							if (localStorage.getItem("menu_notif") != 'sales') {
								getDetailPenjualanOwner(penjualan_id_hapus);
								getPenjualanHeader(1);
							} else {
								getViewNotifManagerSales(1);
							}

						},
						error: function (xmlhttprequest, textstatus, message) {
						}
					});
				},
			},
			{
				text: 'Tidak',
				onClick: function () {

				},
			},
		],
	}).open();
}


function editPenjualanProses() {
	var formData = new FormData(jQuery("#update-logo-penjualan-popup")[0]);
	formData.append('id_penjualan_edit', jQuery('#id_penjualan_edit').val());
	formData.append('client_id_edit_penjualan', jQuery('#client_id_edit_penjualan').val());
	formData.append('penjualan_tanggal_kirim_edit', jQuery('#penjualan_tanggal_kirim_edit').val());
	formData.append('penjualan_tanggal_edit', jQuery('#penjualan_tanggal_edit').val());
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/edit-penjualan-sales-proses",
			dataType: 'JSON',
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				$("#backbutton-edit-penjualan").click();
				getPenjualanHeader(1);

			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function getDataFotoPoint(id_pembayaran_point) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-foto-point-manager",
		dataType: 'JSON',
		data: {
			id_pembayaran_point: id_pembayaran_point,
		},
		beforeSend: function () {
			jQuery('#file_foto_pelunasan_view_now_point').attr('src', '');
			jQuery('#file_foto_pembayaran_view_now_point').attr('src', '');
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			if (data.data != null) {
				// if (data.data.foto_lunas != null) {
				// 	jQuery('#file_foto_pelunasan_view_now_point').attr('src', BASE_PATH_IMAGE_BUKTI_POINT + '/' + data.data.foto_lunas);
				// } else {
				// 	jQuery('#file_foto_pelunasan_view_now_point').attr('src', 'https://indokoper.com/noimage.jpg');
				// }

				if (data.data.foto_point != null) {
					jQuery('#file_foto_pembayaran_view_now_point').attr('src', BASE_PATH_IMAGE_BUKTI_POINT + '/' + data.data.foto_point);
				} else {
					jQuery('#file_foto_pembayaran_view_now_point').attr('src', 'https://indokoper.com/noimage.jpg');
				}
			} else {
				jQuery('#file_foto_pembayaran_view_now_point').attr('src', 'https://indokoper.com/noimage.jpg');
				// jQuery('#file_foto_pelunasan_view_now_point').attr('src', 'https://indokoper.com/noimage.jpg');
			}


		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function selectBoxSales() {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-sales-cs",
		dataType: "JSON",
		data: {
			user_id: localStorage.getItem("user_id"),
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
		},
		beforeSend: function () {
		},
		success: function (data) {
			var select_box_kota;
			select_box_kota += '<option value="" selected>ALL SALES</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.user_id + '">' + val.karyawan_nama + ' | ' + val.kota + '</option>';
			});
			$$('#sales_id').html(select_box_kota);
		}
	});

	$$('.item_after_sales_id').html('ALL SALES');
}

function tampilDataManager() {
	if (jQuery("#sales_id").val() == "" || jQuery("#sales_id").val() == null) {
		$$('#download_point_hide').css("display", "none");
		// $$("#hide_omzet_all").show();
		getPenjualanHeader(1);
		getPerformaHeaderPenjualan();
		// getFee();
		// getOmzetAll();
		localStorage.setItem("sales_nama", jQuery('#sales_id option:selected').text())
	} else {
		$$('#download_point_hide').css("display", "initial");
		// $$("#hide_omzet_all").hide();
		getPenjualanHeader(1);
		getPerformaHeaderPenjualan();
		// getFee();
		localStorage.setItem("sales_nama", jQuery('#sales_id option:selected').text())
	}
}

function getOmzetAll() {
	var omzet_value_all = '';
	var target_omset = 0;
	var penjualan_grandtotal = 0;
	var jml_customer = 0;
	var kurang_omzet = 0;
	var text_color = '';
	var text_color_customer = '';
	var month_now = moment().format('M');

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-fee-manager-all",
		dataType: 'JSON',
		data: {
			bulan: month_now
		},
		beforeSend: function () {
		},
		success: function (data) {
			$.each(data.data_karyawan, function (i, item) {

				if (data.data_fee[item.karyawan_id] != null) {
					penjualan_grandtotal = data.data[item.karyawan_id];
					kurang_omzet = parseInt(data.data[item.karyawan_id]) - parseInt(data.data_fee[item.karyawan_id].target_omset);
					jml_customer = parseInt(data.data_fee[item.karyawan_id].new_customer) - parseInt(data.data_fee[item.karyawan_id].new_customer_target);
				} else {
					kurang_omzet = 0;
					penjualan_grandtotal = 0;
					jml_customer = 0;
				}

				if (kurang_omzet < 0) {
					text_color = 'color:red;';
				} else if (kurang_omzet >= 0) {
					text_color = '';
				}

				if (jml_customer < 0) {
					text_color_customer = 'color:red;';
				} else {
					text_color_customer = '';
				}

				omzet_value_all += '<tr>';
				omzet_value_all += '<td align="left" style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
				omzet_value_all += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(parseInt(penjualan_grandtotal) / 1000) + '</td>';
				omzet_value_all += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;' + text_color + '" class="label-cell">' + number_format(parseInt(kurang_omzet) / 1000) + '</td>';
				omzet_value_all += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;' + text_color_customer + '" class="label-cell">' + number_format(jml_customer) + '</td>';
				omzet_value_all += '</tr>';
			});

			$$('#omzet_value_all').html(omzet_value_all);
			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});

}

function getFee() {
	var target = '';
	var omset = '';
	var omzet_minus = '';
	var min_customer_baru = '';
	var month_now = moment().format('M');

	var user_id = ""
	if (jQuery("#sales_id").val() == "" || jQuery("#sales_id").val() == null) {
		user_id = 'empty';
	} else {
		user_id = jQuery("#sales_id").val();
	}

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-fee-manager",
		dataType: 'JSON',
		data: {
			karyawan_id: user_id,
			bulan: month_now
		},
		beforeSend: function () {
		},
		success: function (data) {
			var target = 0;
			var min_customer_baru = 0;
			console.log(data.data.length);
			if (data.data.length > 1) {
				$.each(data.data, function (i, item) {
					min_customer_baru += parseInt(item.new_customer_target) - parseInt(item.new_customer);
				});
				target = parseInt(5000000000);
			} else {
				$.each(data.data, function (i, item) {
					target += parseInt(item.target_omset);
					min_customer_baru += parseInt(item.new_customer_target) - parseInt(item.new_customer);
				});
			}
			omset = data.data_penjualan;
			omzet_minus = parseInt(target) - parseInt(omset);

			jQuery('#target_value').html(number_format(target / 1000));
			jQuery('#omzet_value').html(number_format(omset / 1000));
			jQuery('#omzet_minus').html(number_format(omzet_minus / 1000));
			jQuery('#min_customer_baru').html('-' + number_format(min_customer_baru));
			if (omzet_minus <= 0) {
				jQuery("#omzet_minus_element").removeClass('card-color-red');
				jQuery("#omzet_minus_element").addClass('card-color-blue');
				jQuery('#omzet_minus').html(number_format(0));
			}

			if (min_customer_baru <= 0) {
				jQuery("#min_customer_element").removeClass('card-color-red');
				jQuery("#min_customer_element").addClass('card-color-blue');
			} else {
				jQuery("#min_customer_element").removeClass('card-color-blue');
				jQuery("#min_customer_element").addClass('card-color-red');
			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});

}


var calendarRangePenjualan;
jQuery('.input-item-price').mask('000,000,000,000', { reverse: true });
jQuery('.input-pembayaran-multiple').mask('000,000,000,000', { reverse: true });
jQuery('.pembayaran_1_dp').mask('000,000,000,000', { reverse: true });
jQuery('#biaya_kirim_single').mask('000,000,000,000', { reverse: true });

jQuery('#invest_molding').mask('000,000,000,000', { reverse: true });

jQuery('#bayar_pembayaran').mask('000.000.000', { reverse: false });
jQuery('#pembayaran_1').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_2').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_3').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_4').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_5').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_6').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_7').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_8').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_9').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_10').mask('000,000,000,000', { reverse: true });

function zoom_view_foto_produksi(src) {
	var gambar_zoom = BASE_PATH_IMAGE_BUKTI_PRODUKSI + '/' + src;
	var myPhotoBrowserPopupDark = app.photoBrowser.create({
		photos: [
			'' + gambar_zoom + ''
		],
		theme: 'dark',
		type: 'popup'
	});
	myPhotoBrowserPopupDark.open();
}

function zoom_view_foto_bayar(src) {
	var myPhotoBrowserPopupDark = app.photoBrowser.create({
		photos: [
			'' + src + ''
		],
		theme: 'dark',
		type: 'popup'
	});
	myPhotoBrowserPopupDark.open();
}



function hapusPerformaHeaderPenjualanPopup(performa_id, performa_header_id) {
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		app.dialog.create({
			title: 'Hapus Item Proforma',
			text: 'Apakah Anda Yakin Menghapus Item Proforma ini ? ',
			cssClass: 'custom-dialog',
			closeByBackdropClick: 'true',
			buttons: [
				{
					text: 'Ya',
					onClick: function () {
						jQuery.ajax({
							type: "POST",
							url: "" + BASE_API + "/delete-item-performa-cs",
							dataType: 'JSON',
							data: {
								performa_id: performa_id,
								performa_header_id: performa_header_id
							},
							beforeSend: function () {
								app.dialog.progress();
							},
							success: function (data) {
								app.dialog.close();
								if (data.status == 1) {
									app.dialog.alert('Berhasil Menghapus Item Performa', function () {
										editPerformaHeaderPenjualanPage();
									});
								} else {
									app.dialog.alert('Gagal Menghapus Item Performa', function () {

									});
								}
							},
							error: function (xmlhttprequest, textstatus, message) {
								app.dialog.close();
								app.dialog.alert('Internet Tidak Stabil / Gangguan Server', function () {
									app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
										ignoreCache: true,
										reloadCurrent: true
									});
								});
							}
						});
					},
				},
				{
					text: 'Tidak',
					onClick: function () {

					},
				},
			],
		}).open();
	}
}

function openCameraFotoPembayaran(id) {
	var srcType = Camera.PictureSourceType.CAMERA;
	var options = setOptions(srcType);
	var func = createNewFileEntry;
	navigator.camera.getPicture(function cameraSuccess(imageUri) {
		$$("#" + id + "_view").attr("src", imageUri);
		$$("#" + id).hide();
		toDataURL(imageUri, function (dataUrl) {
			localStorage.setItem(id, dataUrl);
			//$$("#"+id+"_value").val(dataUrl);
		})
	}, function cameraError(error) {
		console.debug("Unable to obtain picture: " + error, "app");
		alert("Unable to obtain picture: ");
	}, options);
}



function spkPo(penjualan_id_primary, performa_id_relation, performa_header_id, biaya_kirim, client_alamat, client_cp, client_cp_posisi, client_id, client_kota, client_nama, client_telp, jenis_penjualan, karyawan_id, penjualan_global_diskon, penjualan_grandtotal, penjualan_id, penjualan_jumlah_pembayaran, penjualan_keterangan, penjualan_status, penjualan_status_pembayaran, penjualan_tanggal, penjualan_tanggal_kirim, penjualan_total, penjualan_void_keterangan, penjualan_total_qty, extra) {
	var invoice_penjualan = '';
	var no_invoice_penjualan = 0;
	var header_koper = "";
	var header_web = "";
	var tipe_grosir = "";

	if (extra != 1) {
		header_koper = 'INDOKOPER';
		header_web = '';
		tipe_grosir = "Grosir"
	} else {
		header_koper = 'KOPERINDO';
		header_web = 'www.koperindo.id';
		tipe_grosir = "Xtra"
	}
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/spk-po-manager",
		dataType: 'JSON',
		data: {
			karyawan_id: jQuery("#sales_id").val(),
			performa_header_id: performa_header_id,
			jenis_penjualan: jenis_penjualan,
			penjualan_id_primary: penjualan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Po');
			invoice_penjualan += '<table width="100%" border="0">';
			invoice_penjualan += '<tr>';
			invoice_penjualan += '		<td colspan="6"  align="center"><b>' + header_koper + '</b><br>Industri Tas & Koper</td>';
			invoice_penjualan += '	</tr>';
			invoice_penjualan += '	<tr>';
			invoice_penjualan += '		<td colspan="6" align="center">' + header_web + '';
			invoice_penjualan += '			<hr>';
			invoice_penjualan += '		</td>';
			invoice_penjualan += '	</tr>';
			invoice_penjualan += '	<tr>';
			invoice_penjualan += '		<td colspan="6" align="center"><h2>SPK</h2><h3 style="color:red;margin-top:-10px">' + tipe_grosir + '</h3></td>';
			invoice_penjualan += '	</tr>';
			invoice_penjualan += '	<tr>';
			invoice_penjualan += '		<td colspan="4" align="left" >Kepada Yth :  ' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + ' <br> <font style="padding:94px;">' + client_kota + '</font></td>';
			invoice_penjualan += '		<td colspan="2" align="right">' + moment(penjualan_tanggal).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
			invoice_penjualan += '	</tr>';
			invoice_penjualan += '	<tr>';
			invoice_penjualan += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">No</td>';
			invoice_penjualan += '		<td colspan="2" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Spesifikasi</td>';
			invoice_penjualan += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
			invoice_penjualan += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
			invoice_penjualan += '		<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Total Rp.</td>';
			invoice_penjualan += '	</tr>';
		},
		success: function (data) {
			app.dialog.close();

			if (data.data.length != 0) {

				var penjualan_total = 0;
				var invest_molding = data.data[0].invest_molding;

				invoice_penjualan += '<tbody>';
				jQuery.each(data.data, function (i, val) {
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (!val.keterangan) {
						var ket_item = '';
					} else {

						var ket_item = '<font color="red"><br>KET :<br>' + style + ' ' + val.keterangan + '</font>';

					}


					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://indokoper.com/product_image_new';
					} else {
						var path_image = 'https://indokoper.com/performa_image';
					}

					// Cek apakah produk_id_xinyao tidak null, jika iya tampilkan dengan gambar xinyao
					var display_jenis = val.penjualan_jenis;
					var display_gambar = val.gambar;
					var display_path = path_image;

					if (val.produk_id_xinyao != null && val.produk_id_xinyao != '' && val.produk_id_xinyao != 'null') {
						display_jenis = val.penjualan_jenis + ' | ' + val.produk_id_xinyao;
						if (val.gambar_xinyao != null && val.gambar_xinyao != '' && val.gambar_xinyao != 'null') {
							display_gambar = val.gambar_xinyao;
							display_path = 'https://indokoper.com/product_image_new';
						}
					}

					invoice_penjualan += '		<tr>';
					invoice_penjualan += '			<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; "><center>' + (no_invoice_penjualan += 1) + '</center></td>';
					invoice_penjualan += '			<td width="25%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; "><center>' + display_jenis + '<br><img src="' + display_path + '/' + display_gambar + '" width="70%"></center></td>';
					invoice_penjualan += '			<td width="20%" class="label-cell" align="left" style="border-top: solid 1px; white-space: pre;">SPESIFIKASI<br>' + val.produk_keterangan_kustom + '<br>' + ket_item + '</td>';
					invoice_penjualan += '				<td width="10%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
					invoice_penjualan += '					<center>' + val.penjualan_qty + '</center>';
					invoice_penjualan += '				</td>';
					invoice_penjualan += '				<td width="20%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
					invoice_penjualan += '					<center>' + number_format(val.penjualan_harga) + '</center>';
					invoice_penjualan += '				</td>';
					invoice_penjualan += '				<td width="20%" colspan="2" class="label-cell text-align-center" style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
					invoice_penjualan += '					<center>' + number_format(val.penjualan_detail_grandtotal) + '</center>';
					invoice_penjualan += '				</td>';
					invoice_penjualan += '			</tr>';

					penjualan_total += parseInt(val.penjualan_detail_grandtotal);
				});
				invoice_penjualan += '</tbody>';
				invoice_penjualan += '		<tr>';
				invoice_penjualan += '			<td colspan="4" style=" border-top: solid 1px; font-weight:bold;" align="right"></td>';
				invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
				invoice_penjualan += '				Total';
				invoice_penjualan += '			</td>';
				invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
				invoice_penjualan += '			<font style="float:right;">' + number_format(penjualan_total) + '</font>';
				invoice_penjualan += '			</td>';
				invoice_penjualan += '		</tr>';
				if (number_format(data.data[0].invest_molding) != 0) {
					invoice_penjualan += '		<tr>';
					invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
					invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
					invoice_penjualan += '				Molding';
					invoice_penjualan += '			</td>';
					invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
					invoice_penjualan += '				 <font style="float:right; ">' + number_format(invest_molding) + '</font>';
					invoice_penjualan += '			</td>';
					invoice_penjualan += '		</tr>';
				}
				var biaya_packing_val = 0;
				if (data.data[0].total_biaya_packing != null &&
					data.data[0].total_biaya_packing != '' &&
					parseFloat(data.data[0].total_biaya_packing) != 0) {

					biaya_packing_val = parseFloat(data.data[0].total_biaya_packing);
					var nama_packing = (data.data[0].packing != null && data.data[0].packing != '')
						? data.data[0].packing : '-';
					invoice_penjualan += '		<tr>';
					invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
					invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
					invoice_penjualan += '				Packing : ' + nama_packing;
					invoice_penjualan += '			</td>';
					invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
					invoice_penjualan += '			<font style="float:right;">' + number_format(biaya_packing_val) + '</font>';
					invoice_penjualan += '			</td>';
					invoice_penjualan += '		</tr>';
				}

				if (number_format(data.data[0].pembayaran_1) != 0) {
					invoice_penjualan += '		<tr>';
					invoice_penjualan += '			<td colspan="4" style="  font-weight:bold;" align="right"></td>';
					invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
					invoice_penjualan += '				Deposit';
					invoice_penjualan += '			</td>';
					invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
					invoice_penjualan += '			<font style="float:right; ">' + number_format(data.data[0].pembayaran_1) + '</font>';
					invoice_penjualan += '			</td>';
					invoice_penjualan += '		</tr>';
				}
				if (number_format(data.data[0].biaya_kirim) != 0) {
					//invoice_penjualan += '		<tr>';
					//invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
					//invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
					//invoice_penjualan += '				Biaya Kirim';
					//invoice_penjualan += '			</td>';
					//invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;  font-weight:bold;" align="left">';
					//invoice_penjualan += '			<font style="float:right;">' + number_format(biaya_kirim) + '</font>';
					//invoice_penjualan += '			</td>';
					//invoice_penjualan += '		</tr>';
				}


				invoice_penjualan += '		<tr>';
				invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
				invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
				invoice_penjualan += '				Jumlah';
				invoice_penjualan += '			</td>';
				invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
				if (number_format(data.data[0].pembayaran_1) != 0) {
					invoice_penjualan += '   <font style="float:right;">' + number_format(parseFloat(penjualan_total) + biaya_packing_val - parseFloat(data.data[0].pembayaran_1)) + '</font>';
				} else {
					invoice_penjualan += '   <font style="float:right;">' + number_format(parseFloat(penjualan_total) + biaya_packing_val) + '</font>';
				}
				invoice_penjualan += '			</td>';
				invoice_penjualan += '		</tr>'

				invoice_penjualan += '		<tr>';
				invoice_penjualan += '			<td colspan="5"></td>';
				invoice_penjualan += '		</tr>';
				invoice_penjualan += '	</table>';

				invoice_penjualan += '	<table width="100%" border="0">';
				invoice_penjualan += '      <tr>';
				invoice_penjualan += '          <td style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Emblem</td>';
				invoice_penjualan += '          <td style="border-top: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="34%" align="center">Logo Bordir</td>';
				invoice_penjualan += '          <td style="border-top: solid 1px;  border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Tambah</td>';
				invoice_penjualan += '      </tr>';
				invoice_penjualan += '      <tr>';
				invoice_penjualan += '          <td style=" border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://indokoper.com/customer_logo/' + data.data[0].customer_logo + '" width="80%" /></td>';

				if (data.data[0].customer_logo_bordir != "") {
					invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://indokoper.com/customer_logo/' + data.data[0].customer_logo_bordir + '" width="80%" /> </td>';
				} else {
					invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

				}

				if (data.data[0].customer_logo_tambahan != "") {
					invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://indokoper.com/customer_logo/' + data.data[0].customer_logo_tambahan + '" width="80%" /> </td>';
				} else {
					invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

				}

				invoice_penjualan += '      </tr>';
				invoice_penjualan += '	</table>';



			}


			// let options = {
			// 	documentSize: 'A4',
			// 	type: 'share',
			// 	fileName: 'report_' + client_nama + '.pdf'
			// }

			// pdf.fromData(invoice_penjualan, options)
			// 	.then((stats) => console.log('status', stats))
			// 	.catch((err) => console.err(err))

			$$('#detail_spkpo_table_popup').html(invoice_penjualan);
			console.log(invoice_penjualan);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function fullReport(penjualan_id_primary, performa_id_relation, performa_header_id, biaya_kirim, client_alamat, client_cp, client_cp_posisi, client_id, client_kota, client_nama, client_telp, jenis_penjualan, karyawan_id, penjualan_global_diskon, penjualan_grandtotal, penjualan_id, penjualan_jumlah_pembayaran, penjualan_keterangan, penjualan_status, penjualan_status_pembayaran, penjualan_tanggal, penjualan_tanggal_kirim, penjualan_total, penjualan_void_keterangan, penjualan_total_qty, packing) {
	// Format label packing untuk dokumen
	var packingLabels = { 'polos': 'Polos', 'plastik': 'Plastik', 'kardus': 'Kardus' };
	var packing_label = packing && packing !== '0' ? 'Packing ' + (packingLabels[packing] || packing.charAt(0).toUpperCase() + packing.slice(1)) : 'Packing finishing plastic';
	var invoice_penjualan = '';
	var pembayaran_1 = '';
	var sj_content = '';
	var sj_content_qty = 0;
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/full-report-manager",
		dataType: 'JSON',
		data: {
			karyawan_id: jQuery("#sales_id").val(),
			performa_header_id: performa_header_id,
			jenis_penjualan: jenis_penjualan
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Penjualan');
			if (penjualan_status_pembayaran == "Lunas") {
				var style_table = "background-image:url('https://indokoper.com/lunas/lunas.jpg'); border:none;  background-position: center;  background-size:45% auto; margin:0px; background-repeat:no-repeat";
			} else {
				var style_table = "border-spacing: 0; background-color:white; color:black;";
			}
			invoice_penjualan += '<table width="100%" border="0" style="' + style_table + '">';
			invoice_penjualan += '<tr>';
			invoice_penjualan += '<td colspan="6" style="font-weight:bold;" align="right">' + moment().format('DD-MMM-YYYY') + '</td>';
			invoice_penjualan += '</tr>';
			invoice_penjualan += '<tr>';
			invoice_penjualan += '<td colspan="6" style="font-weight:bold;" align="center">RINCIAN TRANSAKSI <br> </td>';
			invoice_penjualan += '</tr>';
			invoice_penjualan += '	<tr>';
			invoice_penjualan += '		<td colspan="6"  align="center"><b>KOPERINDO</b><br>Industri Tas & Koper</td>';
			invoice_penjualan += '	</tr>';
			invoice_penjualan += '	<tr>';
			invoice_penjualan += '		<td colspan="6" align="center">www.koperindo.id';
			invoice_penjualan += '			<hr>';
			invoice_penjualan += '		</td>';
			invoice_penjualan += '	</tr>';
			invoice_penjualan += '<tr>';
			invoice_penjualan += '<td colspan="6" align="left">Kepada Yth : ' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + '<br>';
			invoice_penjualan += '<font style="padding:94px;">' + client_kota + '</font>';
			invoice_penjualan += '</td>';
			invoice_penjualan += '<td colspan="3" align="right"></td>';
			invoice_penjualan += '</tr>';
			invoice_penjualan += '<tr>';
			invoice_penjualan += '<td colspan="6" align="center" style="font-size:20px; font-weight:bold;">';
			invoice_penjualan += 'Order';
			invoice_penjualan += '</td>';
			invoice_penjualan += '</tr>';
			invoice_penjualan += '<tr>';
			invoice_penjualan += '<td style=" border-top: solid 1px; border-bottom: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">';
			invoice_penjualan += 'No</td>';
			invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="center">';
			invoice_penjualan += 'No Invoice</td>';
			invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="center">';
			invoice_penjualan += 'Jenis</td>';
			invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="center">Qty</td>';
			invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
			invoice_penjualan += '<td  style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;"';
			invoice_penjualan += 'align="center">Total Rp.</td>';
			invoice_penjualan += '</tr>';
		},
		success: function (data) {
			var detail_sj_id = '';
			var idx = 0;
			app.dialog.close();

			if (data.data.length != 0) {
				var total_kirim = 0;
				var no_surat = 0;
				var no_penjualan = 0;
				var penjualan_total = 0;
				var total_qty_kirim = 0;
				var invest_molding = data.data[0].invest_molding;
				pembayaran_1 += data.data[0].pembayaran_1;

				invoice_penjualan += '<tbody>';
				jQuery.each(data.data, function (i, val) {
					total_qty_kirim += val.penjualan_qty;
					no_penjualan++
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (!val.keterangan) {
						var ket_item = '';
					} else {

						var ket_item = '<font color="red"><br>KET :<br>' + style + ' ' + val.keterangan + '</font>';

					}


					var no_penjualan_multiple = val.penjualan_id.split("-").pop();

					invoice_penjualan += '<tr>';
					if (val.penjualan_id.indexOf("-") >= 0) {
						invoice_penjualan += '<td width="5%" class="label-cell text-align-left" style="border-bottom: solid 1px;   border-left: solid 1px; ">';
						invoice_penjualan += '<center>' + no_penjualan_multiple + '</center>';

					} else {
						invoice_penjualan += '<td width="5%" class="label-cell text-align-left" style="border-bottom: solid 1px;   border-left: solid 1px; ">';
						invoice_penjualan += '<center>' + no_penjualan + '</center>';
					}

					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/count-jumlah-jenis-sj-manager",
						dataType: 'JSON',
						data: {
							penjualan_detail_performa_id: val.penjualan_detail_performa_id
						},
						beforeSend: function () {
						},
						success: function (data) {
							sj_content += '<tr>';
							if (val.penjualan_id.indexOf("-") >= 0) {
								sj_content += '<td  align="left" style="vertical-align:top;" width="47%">' + val.penjualan_jenis + '-' + no_penjualan_multiple + '</td>';
							} else {
								sj_content += '<td  align="left" style="vertical-align:top;" width="47%">' + val.penjualan_jenis + '</td>';
							}

							sj_content += '<td align="center"  style="vertical-align:top;" width="6%">:</td>';
							sj_content += '<td align="right" style="vertical-align:top;" width="47%">' + data.data + '</td>';
							sj_content += '</tr>';
						},
						error: function (xmlhttprequest, textstatus, message) {
						}
					});
					invoice_penjualan += '</td>';
					invoice_penjualan += '<td width="19%" class="label-cell text-align-left" style="border-bottom: solid 1px; border-left: solid 1px; ">';
					invoice_penjualan += '<center>' + moment(val.pembayaran_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center>';
					invoice_penjualan += '</td>';
					invoice_penjualan += '<td width="19%" class="label-cell text-align-left" style="border-bottom: solid 1px; border-left: solid 1px; ">';
					invoice_penjualan += '<center>' + val.penjualan_jenis + '</center>';
					invoice_penjualan += '</td>';
					invoice_penjualan += '<td width="19%" class="label-cell" style="border-bottom: solid 1px; border-left: solid 1px;">';
					invoice_penjualan += '<center>' + val.penjualan_qty + '</center>';
					invoice_penjualan += '</td>';
					invoice_penjualan += '<td width="19%" align="right" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
					invoice_penjualan += '' + number_format(val.penjualan_harga) + '';
					invoice_penjualan += '</td>';
					invoice_penjualan += '<td width="19%" align="right"  class="label-cell "';
					invoice_penjualan += 'style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
					invoice_penjualan += '' + number_format(val.penjualan_detail_grandtotal) + '';
					invoice_penjualan += '</td>';
					invoice_penjualan += '</tr>';



					penjualan_total += parseInt(val.penjualan_detail_grandtotal);
				});

				if (number_format(data.data[0].invest_molding) != 0) {
					invoice_penjualan += '		<tr>';
					invoice_penjualan += '			<td colspan="4" style="border-top:solid 1px; font-weight:bold;" align="right"></td>';
					invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
					invoice_penjualan += '				Molding';
					invoice_penjualan += '			</td>';
					invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
					invoice_penjualan += '				<font style="float:right; ">' + number_format(data.data[0].invest_molding) + '</font>';
					invoice_penjualan += '			</td>';
					invoice_penjualan += '		</tr>';
				}
				invoice_penjualan += '		<tr>';
				invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
				invoice_penjualan += '			<td colspan="1" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
				invoice_penjualan += '				Total';
				invoice_penjualan += '			</td>';
				invoice_penjualan += '			<td colspan="1" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
				invoice_penjualan += '			<font style="float:right;">' + number_format(penjualan_total) + '</font>';
				invoice_penjualan += '			</td>';
				invoice_penjualan += '		</tr>';
				if (number_format(data.data[0].pembayaran_1) != 0) {
					// invoice_penjualan += '		<tr>';
					// invoice_penjualan += '			<td colspan="4" style="  font-weight:bold;" align="right"></td>';
					// invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
					// invoice_penjualan += '				Deposit';
					// invoice_penjualan += '			</td>';
					// invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
					// invoice_penjualan += '			<font style="float:right;">' + number_format(data.data[0].pembayaran_1) + '</font>';
					// invoice_penjualan += '			</td>';
					// invoice_penjualan += '		</tr>';
				}
				if (number_format(data.data[0].biaya_kirim) != 0) {
					//	invoice_penjualan += '		<tr>';
					//	invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
					//	invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
					//	invoice_penjualan += '				Biaya Kirim';
					//	invoice_penjualan += '			</td>';
					//	invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;  font-weight:bold;" align="left">';
					//	invoice_penjualan += '				<font style="float:right; ">' + number_format(biaya_kirim) + '</font>';
					//	invoice_penjualan += '			</td>';
					//	invoice_penjualan += '		</tr>';
				}

				// invoice_penjualan += '<tr>';
				// invoice_penjualan += '<td colspan="4" style="font-weight:bold;" align="right"></td>';
				// invoice_penjualan += '<td colspan="1"';
				// invoice_penjualan += '	style="border-top: solid 1px; border-left: solid 1px;  border-left: solid 1px;  border-bottom: solid 1px; font-weight:bold;"';
				// invoice_penjualan += '	align="left"> Jumlah </td>';
				// invoice_penjualan += '<td colspan="1"';
				// invoice_penjualan += '	style="padding-left:10px; border-bottom: solid 1px;  border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;"';
				// invoice_penjualan += '	align="right">';
				// invoice_penjualan += '	<font style="">' + number_format(parseInt(penjualan_total) - parseInt(pembayaran_1)) + '</font>';
				// invoice_penjualan += '</td>';
				// invoice_penjualan += '</tr>';
				invoice_penjualan += '</tbody>';
				invoice_penjualan += '	</table>';

				jQuery.ajax({
					type: 'POST',
					url: "" + BASE_API + "/detail-pembayaran-multiple-manager",
					dataType: 'JSON',
					data: {
						performa_id: performa_id_relation
					},
					beforeSend: function () {
						app.dialog.preloader('Mengambil Data Pembayaran');
					},
					success: function (data) {
						app.dialog.close();
						invoice_penjualan += '<table width="100%" style="border-spacing: 0; background-color:white; color:black; padding-top:10px;">';
						invoice_penjualan += '<tr>';
						invoice_penjualan += '<td colspan="6" align="center" style="font-size:20px; font-weight:bold;">';
						invoice_penjualan += 'Bayar';
						invoice_penjualan += '</td>';
						invoice_penjualan += '</tr>';
						invoice_penjualan += '<tr>';
						invoice_penjualan += '<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
						invoice_penjualan += '<center>No</center>';
						invoice_penjualan += '</td>';
						invoice_penjualan += '<td width="19%" align="center" style=" border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">No Invoice</td>';
						invoice_penjualan += '<td width="19%" align="center" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">Tanggal</td>';
						invoice_penjualan += '<td width="19%" align="center" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">Bank</td>';
						invoice_penjualan += '<td width="19%" align="center" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">Jumlah</td>';
						invoice_penjualan += '<td width="19%" align="center"';
						invoice_penjualan += 'style="border-top: solid 1px; border-left: solid 1px; font-weight:bold; border-right: solid 1px; "';
						invoice_penjualan += 'class="numeric-cell ">Keterangan</td>';
						invoice_penjualan += '</tr>';

						var no_pembayaran = 0;
						jQuery.each(data.pembayaran_data, function (i, item2) {

							if (item2.pembayaran_1 != null) {
								invoice_penjualan += '<tr>';
								invoice_penjualan += '	<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
								invoice_penjualan += '	<center>' + (no_pembayaran += 1) + '</center>';
								invoice_penjualan += '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.dt_record).format('DDMMYY') + '-' + item2.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.pembayaran1_tgl).format('DD-MMM-YY') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + item2.bank_1 + '</td>';
								invoice_penjualan += '	<td align="right" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + number_format(item2.pembayaran_1) + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; "';
								invoice_penjualan += '		class="numeric-cell ">' + item2.keterangan_1 + '</td>';
								invoice_penjualan += '</tr>';
							}
							if (item2.pembayaran_2 != null) {
								invoice_penjualan += '<tr>';
								invoice_penjualan += '	<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
								invoice_penjualan += '	<center>' + (no_pembayaran += 1) + '</center>';
								invoice_penjualan += '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.dt_record).format('DDMMYY') + '-' + item2.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.pembayaran2_tgl).format('DD-MMM-YY') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + item2.bank_2 + '</td>';
								invoice_penjualan += '	<td align="right" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + number_format(item2.pembayaran_2) + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; "';
								invoice_penjualan += '		class="numeric-cell ">' + item2.keterangan_2 + '</td>';
								invoice_penjualan += '</tr>';
							}

							if (item2.pembayaran_3 != null) {
								invoice_penjualan += '<tr>';
								invoice_penjualan += '	<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
								invoice_penjualan += '	<center>' + (no_pembayaran += 1) + '</center>';
								invoice_penjualan += '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.dt_record).format('DDMMYY') + '-' + item2.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.pembayaran3_tgl).format('DD-MMM-YY') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + item2.bank_3 + '</td>';
								invoice_penjualan += '	<td align="right" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + number_format(item2.pembayaran_3) + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; "';
								invoice_penjualan += '		class="numeric-cell ">' + item2.keterangan_3 + '</td>';
								invoice_penjualan += '</tr>';
							}

							if (item2.pembayaran_4 != null) {
								invoice_penjualan += '<tr>';
								invoice_penjualan += '	<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
								invoice_penjualan += '	<center>' + (no_pembayaran += 1) + '</center>';
								invoice_penjualan += '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.dt_record).format('DDMMYY') + '-' + item2.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.pembayaran4_tgl).format('DD-MMM-YY') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + item2.bank_4 + '</td>';
								invoice_penjualan += '	<td align="right" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + number_format(item2.pembayaran_4) + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; "';
								invoice_penjualan += '		class="numeric-cell ">' + item2.keterangan_4 + '</td>';
								invoice_penjualan += '</tr>';
							}

							if (item2.pembayaran_5 != null) {
								invoice_penjualan += '<tr>';
								invoice_penjualan += '	<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
								invoice_penjualan += '	<center>' + (no_pembayaran += 1) + '</center>';
								invoice_penjualan += '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.dt_record).format('DDMMYY') + '-' + item2.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + moment(item2.pembayaran5_tgl).format('DD-MMM-YY') + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + item2.bank_5 + '</td>';
								invoice_penjualan += '	<td align="right" width="19%" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
								invoice_penjualan += '		' + number_format(item2.pembayaran_5) + '</td>';
								invoice_penjualan += '	<td align="center" width="19%" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; "';
								invoice_penjualan += '		class="numeric-cell ">' + item2.keterangan_5 + '</td>';
								invoice_penjualan += '</tr>';
							}

						});
						invoice_penjualan += '<tr>';
						invoice_penjualan += '<td align="center" colspan="6" width="10%" style="border-top: solid 1px; " class="numeric-cell ">';
						invoice_penjualan += '</td>';
						invoice_penjualan += '</tr>';
						invoice_penjualan += '</table>';


						//Surat Jalan
						invoice_penjualan += '<table width="100%" style="border-spacing: 0; background-color:white; color:black; padding-top:10px;">';
						invoice_penjualan += '<tr>';
						invoice_penjualan += '<td colspan="7" align="center" style="font-size:20px; font-weight:bold;">';
						invoice_penjualan += 'Kirim';
						invoice_penjualan += '</td>';
						invoice_penjualan += '</tr>';

						invoice_penjualan += '<tr>';
						invoice_penjualan += '<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
						invoice_penjualan += '<center>No</center>';
						invoice_penjualan += '</td>';
						invoice_penjualan += '<td width="20%" align="center" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">No Invoice</td>';
						invoice_penjualan += '<td width="15%" align="center" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">Tanggal</td>';
						invoice_penjualan += '<td width="15%" align="center" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">Jenis</td>';
						invoice_penjualan += '<td width="20%" align="center" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">No Sj</td>';
						invoice_penjualan += '<td width="10%" align="center" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">Jumlah</td>';
						invoice_penjualan += '<td width="15%" align="center"';
						invoice_penjualan += 'style="border-right: solid 1px; border-top: solid 1px; border-left: solid 1px; font-weight:bold;"';
						invoice_penjualan += 'class="numeric-cell ">Plat</td>';
						invoice_penjualan += '</tr>';


						var test2 = "";
						jQuery.each(data.pembayaran_data, function (i3, item3) {
							jQuery.ajax({
								type: 'POST',
								url: "" + BASE_API + "/get-penjualan-surat-jalan-manager",
								dataType: 'JSON',
								data: {
									penjualan_id: item3.penjualan_id
								},
								beforeSend: function () {
									app.dialog.preloader('Mengambil Data Surat Jalan');

								},
								success: function (data) {
									app.dialog.close();
									$.each(data.data, function (ij1, sj2) {


										jQuery.ajax({
											type: 'POST',
											url: "" + BASE_API + "/get-surat-jalan-detail-manager",
											dataType: 'JSON',
											data: {
												penjualan_detail_performa_id: sj2.penjualan_detail_performa_id
											},
											beforeSend: function () {
											},
											success: function (data) {


												jQuery.each(data.data, function (i, val_sj) {
													if (val_sj.no_surat_jalan != null) {
														no_surat++
														total_kirim += val_sj.jumlah_kirim;
														var no_surat_multiple = val_sj.penjualan_id.split("-").pop();
														invoice_penjualan += '<tr>';
														if (val_sj.penjualan_id.indexOf("-") >= 0) {
															invoice_penjualan += '<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
															invoice_penjualan += '<center>' + no_surat_multiple + '</center>';

														} else {
															invoice_penjualan += '<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
															invoice_penjualan += '<center>' + no_surat + '</center>';
														}

														invoice_penjualan += '</td>';
														invoice_penjualan += '<td width="20%" align="center" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
														invoice_penjualan += '' + moment(val_sj.dt_record).format('DDMMYY') + '-' + val_sj.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
														invoice_penjualan += '<td width="15%" align="center" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
														invoice_penjualan += '' + moment(val_sj.tanggal).format('DD-MMM-YY') + '</td>';
														invoice_penjualan += '<td width="15%" align="center" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
														invoice_penjualan += '' + val_sj.penjualan_jenis + '</td>'
														invoice_penjualan += '<td width="20%" align="center" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">';
														invoice_penjualan += '' + val_sj.no_surat_jalan + '</td>';
														invoice_penjualan += '<td width="10%" align="center" style="border-top: solid 1px; border-left: solid 1px; " class="numeric-cell ">' + val_sj.jumlah_kirim + '';
														invoice_penjualan += '</td>';
														invoice_penjualan += '<td width="15%" align="center" style="border-right: solid 1px; border-top: solid 1px; border-left: solid 1px; "';
														invoice_penjualan += 'class="numeric-cell ">';
														invoice_penjualan += '' + val_sj.plat + '</td>';
														invoice_penjualan += '</tr>';

													}
												});

											},
											error: function (xmlhttprequest, textstatus, message) {
											}
										});
									});
								},
								error: function (xmlhttprequest, textstatus, message) {
								}
							});

						});


						app.dialog.preloader('Cetak Data');
						setTimeout(function () {
							app.dialog.close();
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td align="center" colspan="7" width="10%" style="border-top: solid 1px; " class="numeric-cell ">';
							invoice_penjualan += '</td>';
							invoice_penjualan += '</tr>';
							invoice_penjualan += '</table>';


							invoice_penjualan += '<table width="100%" style="padding-top:15px;">';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td width="50%" align="left" style="vertical-align:top;">';
							invoice_penjualan += '<table border="0" width="80%" style="border-spacing: 0; background-color:white; color:black; padding-top:10px;">';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td  width="100%" align="center"  colspan="3"><b>Nilai Transaksi</b></td>';
							invoice_penjualan += '</tr>';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td  align="left" width="47%">';
							invoice_penjualan += 'Total Nilai Order';
							invoice_penjualan += '</td>';
							invoice_penjualan += '<td  align="center"  width="6%">';
							invoice_penjualan += ':';
							invoice_penjualan += '</td>';
							invoice_penjualan += '<td  align="right"   width="47%">';
							invoice_penjualan += '' + number_format(data.penjualan_grandtotal) + '';
							invoice_penjualan += '</td>';
							invoice_penjualan += '</tr>';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td  align="left"  width="47%">';
							invoice_penjualan += 'Total Nilai Bayar';
							invoice_penjualan += '</td>';
							invoice_penjualan += '<td align="center"   width="6%">';
							invoice_penjualan += ':';
							invoice_penjualan += '</td>';
							invoice_penjualan += '<td  align="right" width="47%">';
							invoice_penjualan += '' + number_format(data.penjualan_jumlah_pembayaran) + '';
							invoice_penjualan += '</td>';
							invoice_penjualan += '</tr>';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td align="left"  width="47%">';
							invoice_penjualan += 'Sisa Pembayaran';
							invoice_penjualan += '</td>';
							invoice_penjualan += '<td align="center"  width="6%">';
							invoice_penjualan += ':';
							invoice_penjualan += '</td>';
							invoice_penjualan += '<td align="right"   width="47%">';
							invoice_penjualan += '' + number_format(parseFloat(data.penjualan_grandtotal) - parseFloat(data.penjualan_jumlah_pembayaran)) + '';
							invoice_penjualan += '</td>';
							invoice_penjualan += '</tr>';
							invoice_penjualan += '</table>';
							invoice_penjualan += '</td>';
							invoice_penjualan += '<td width="50%"  align="right" style="vertical-align:top;">';
							invoice_penjualan += '<table border="0" width="80%" style="border-spacing: 0; background-color:white; color:black;">';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td width="50%" align="left" style="vertical-align:top;">';
							invoice_penjualan += '<table border="0" width="80%" style="border-spacing: 0; background-color:white; color:black;">';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td  width="100%" align="center"  colspan="3"><b>Total Kirim</b></td>';
							invoice_penjualan += '</tr>';
							invoice_penjualan += sj_content;
							invoice_penjualan += '</table>';

							console.log(invoice_penjualan);
							$$('#detail_report_table_popup').html(invoice_penjualan);
							app.popup.open('.detail-report-popup');
							// let options = {
							// 	documentSize: 'A4',
							// 	type: 'share',
							// 	fileName: 'report_' + client_nama + '.pdf'
							// }

							// pdf.fromData(invoice_penjualan, options)
							// 	.then((stats) => console.log('status', stats))
							// 	.catch((err) => console.err(err))
						}, 5000);
					},
					error: function (xmlhttprequest, textstatus, message) {
					}
				});
			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});

}

function lihatFotoSuratJalanSales(src) {
	var url = BASE_PATH_IMAGE_SURAT_JALAN + '/' + src;
	var deg = 0;

	var pb = app.photoBrowser.create({
		photos: [url],
		theme: 'dark',
		type: 'popup',
		navbar: true,
		toolbar: true, // <- WAJIB supaya area tombol ada
		on: {
			opened: function (pb) {
				var $root = jQuery(pb.$el);

				// Pastikan toolbar ada
				if ($root.find('.toolbar .toolbar-inner').length === 0) {
					$root.append('<div class="toolbar toolbar-bottom"><div class="toolbar-inner"></div></div>');
				}

				// Tambah tombol rotate kalau belum ada
				var $inner = $root.find('.toolbar .toolbar-inner');
				if ($inner.find('#pb-rotate-left').length === 0) {
					$inner.prepend(
						'<a href="#" class="link" id="pb-rotate-left">⟲</a>' +
						'<a href="#" class="link" id="pb-rotate-right">⟳</a>'
					);
				}

				// Handler klik
				$root.off('click.pbRotate').on('click.pbRotate', '#pb-rotate-left, #pb-rotate-right', function (e) {
					e.preventDefault();
					deg += (this.id === 'pb-rotate-left' ? -90 : 90);
					var $img = $root.find('.swiper-slide-active img');
					$img.css({ transform: 'rotate(' + deg + 'deg)', 'transform-origin': 'center center' });
				});
			},
			closed: function (pb) {
				jQuery(pb.$el).off('click.pbRotate');
			}
		}
	});

	pb.open();
}


function getSuratJalanDetailPenjualan(dt_record, client_nama, penjualan_id, penjualan_qty) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-penjualan-surat-jalan-manager",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
		},
		success: function (data) {
			var total_stock = 0;
			$.each(data.data, function (i_pjl_qty, item_pjl_qty) {
				total_stock += item_pjl_qty.penjualan_qty;
			});

			$$('#stok_sj').html(total_stock);
			$$('#popup-sj-td-nospk').html('' + moment(dt_record).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));
			$$('#popup-sj-td-client_nama').html(client_nama + ', PT');
			getSuratJalanListPenjualan(dt_record, penjualan_id, penjualan_qty);
			var penjualan_value = "";

			$.each(data.data, function (i2, item2) {
				jQuery.ajax({
					type: 'POST',
					url: "" + BASE_API + "/get-surat-jalan-detail-manager",
					dataType: 'JSON',
					data: {
						penjualan_detail_performa_id: item2.penjualan_detail_performa_id
					},
					beforeSend: function () {
					},
					success: function (data) {
						var stock_item = 0;
						var jumlah_pesanan = 0;

						$.each(data.data, function (stok_detail_qty, item_stok_detail) {
							stock_item += item_stok_detail.jumlah_kirim;
						});

						$.each(data.data_sj, function (stok_detail_qty_2, item_stok_detail_2) {
							jumlah_pesanan += item_stok_detail_2.penjualan_qty;
						});
						var total_fix = parseInt(jumlah_pesanan) - parseInt(stock_item);

						$('#jumlah_stok_item_' + item2.penjualan_detail_performa_id + '').html(total_fix);
						$('#kirim_stok_item_' + item2.penjualan_detail_performa_id + '').html(stock_item);
						$('#total_stok_item_' + item2.penjualan_detail_performa_id + '').html(jumlah_pesanan);

					},
					error: function (xmlhttprequest, textstatus, message) {
					}
				});

				penjualan_value += '<tr>';
				penjualan_value += '<td width="25%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item2.penjualan_jenis + '</td>';
				penjualan_value += '<td align="center" width="25%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="total_stok_item_' + item2.penjualan_detail_performa_id + '" ></td>';
				penjualan_value += '<td align="center" width="25%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="kirim_stok_item_' + item2.penjualan_detail_performa_id + '" ></td>';
				penjualan_value += '<td align="center" width="25%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="jumlah_stok_item_' + item2.penjualan_detail_performa_id + '" ></td>';
				penjualan_value += '</tr>'


			});


			$$('#detail_surat_jalan_penjualan').html(penjualan_value);

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getSuratJalanListPenjualan(dt_record, penjualan_id, penjualan_qty) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-surat-jalan-list-manager",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$$('#terkirim_sj_penjualan').html('-');
			$$('#kurang_terkirim_sj_penjualan').html('-');
		},
		success: function (data) {
			app.dialog.close();
			var total_stock = 0;
			$$('#stok_sj_penjualan').html(data.penjualan_total_qty_detail);
			var penjualan_value = "";
			var total_qty = 0;
			if (data.data.length != 0) {
				$.each(data.data, function (i_qty, item_qty) {
					total_qty += item_qty.jumlah_kirim;
				});
				$$('#terkirim_sj_penjualan').html(total_qty);
				$$('#kurang_terkirim_sj_penjualan').html($$('#stok_sj_penjualan').html() - total_qty);
			}
			if (data.data.length != 0) {
				$.each(data.data_distinct, function (i_d, item_d) {
					penjualan_value += '<tr>';
					penjualan_value += '<td  style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;" align="center"  class="label-cell">' + item_d.no_surat_jalan + '</td>';
					penjualan_value += '<td align="center" colspan="3" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + moment(item_d.tanggal).format('DD-MMM-YY hh:mm') + '</td>';
					if (item_d.foto_surat_jalan != null) {
						penjualan_value += '<td align="center"  style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><button   style="background-color:blue; color:white; "  class="text-add-colour-black-soft button-small col button text-bold"  onclick="lihatFotoSuratJalanSales(\'' + item_d.foto_surat_jalan + '\');">Foto</button></td>';
					} else {
						penjualan_value += '<td align="center"  style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;" style=""  class="label-cell"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"  onclick="lihatFotoSuratJalanSales(\'' + item_d.foto_surat_jalan + '\');">Foto</button></td>';
					}
					penjualan_value += '</tr>';

					penjualan_value += '<tr>';
					penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Jumlah</td>';
					penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Type</td>';
					penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Plat</td>';
					penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Kendaraan</td>';
					penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Pengirim</td>';
					penjualan_value += '</tr>';
					$.each(data.data, function (i, item) {
						if (item.jumlah_kirim != 0) {
							if (item_d.tanggal == item.tanggal) {
								penjualan_value += '<tr>';
								penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.jumlah_kirim + '</td>';
								penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.penjualan_jenis + '</td>';
								penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.plat + '</td>';
								penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.kendaraan + '</td>';
								penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.pengirim + '</td>';
								penjualan_value += '</tr>';
							}
						}
					});
				});
			} else {
				app.dialog.alert('Tidak Ada Surat Jalan');
			}
			$$('#detail_surat_jalan_history_penjualan').html(penjualan_value);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function editPerformaHeaderPenjualanPopup(performa_id) {
	localStorage.setItem("edit_performa_performa_id", performa_id);
	jQuery('#price_edit_popup').mask('000,000,000,000', { reverse: true });
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/edit-performa-penjualan",
		dataType: 'JSON',
		data: {
			performa_id: localStorage.getItem("edit_performa_performa_id")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			jQuery('#performa_id_edit_popup').val(data.data.performa_id);
			jQuery('#performa_id_tambah_popup').val(data.data.performa_id);
			jQuery('#qty_edit_popup').val(data.data.qty);
			var jenis_data = data.data.jenis;
			var jenis = jenis_data.split(".")[0];
			jQuery('#jenis_edit_popup').val(jenis);
			jQuery('#proforma_old_jenis_edit_1').val(data.data.jenis);
			jQuery('#proforma_old_style_edit_1').val(data.data.style);
			jQuery('#proforma_old_ukuran_edit_1').val(data.data.ukuran_jual);
			jQuery('#price_edit_popup').val(number_format(data.data.price));
			jQuery('#potongan_price_edit_popup').val(number_format(data.data.potongan_price));
			jQuery('#keterangan_full_edit_popup').val(data.data.spesifikasi);

			if (data.data.extra_detail == 0 && data.data.grosir_detail == 1) {
				jQuery('#extra_edit_detail_1').val(1);
			} else if (data.data.extra_detail == 1 && data.data.grosir_detail == 0) {
				jQuery('#extra_edit_detail_1').val(0);
			} else {
				jQuery('#extra_edit_detail_1').val(0);
			}

			if (data.data.keterangan != null) {
				var keterangan = data.data.keterangan;
			} else {
				var keterangan = '';
			}

			if (data.data.style != null && data.data.style != 'none') {
				var style = data.data.style + ' ' + keterangan;
			} else {
				var style = keterangan;
			}
			// jQuery('#keterangan_style_edit_performa').show();
			// $$('#keterangan_singkat_edit_popup').css("display", "none");
			// jQuery('#keterangan_style_edit_performa').html(style);
			jQuery('#keterangan_singkat_edit_popup').val(keterangan);
			jQuery('#performa_header_id_edit_popup').val(data.data.performa_header_id);
			jQuery('#performa_header_id_tambah_popup').val(data.data.performa_header_id);

			$$('#file_edit_1').prop('required', false);
			$$('#file_edit_1').prop('validate', false);

			var tipe = data.data.jenis;
			if (tipe.indexOf("TAS") != -1) {
				$$('#el_ukuran_hc_edit_1').hide();
				$$('#el_ukuran_ts_edit_1').hide();
				$$('#el_style_hc_edit_1').hide();
				$$('#el_extra_edit_detail_1').hide();
				$$('#ukuran_edit_hc_1').prop('required', false);
				$$('#ukuran_edit_hc_1').prop('validate', false);
				$$('#ukuran_edit_ts_1').prop('required', false);
				$$('#ukuran_edit_ts_1').prop('validate', false);
				$$('#style_hc_edit_1').prop('required', false);
				$$('#style_hc_edit_1').prop('validate', false);
				$$('#extra_edit_detail_1').prop('required', false);
				$$('#extra_edit_detail_1').prop('validate', false);
				document.getElementById("price_edit_popup").readOnly = false;
			} else {
				$$('#el_ukuran_hc_edit_1').show();
				$$('#el_extra_edit_detail_1').show();
				$$('#el_ukuran_ts_edit_1').hide();
				$$('#el_style_hc_edit_1').show();
				$$('#ukuran_edit_hc_1').prop('required', true);
				$$('#ukuran_edit_hc_1').prop('validate', true);
				$$('#ukuran_edit_ts_1').prop('required', false);
				$$('#ukuran_edit_ts_1').prop('validate', false);
				$$('#style_hc_edit_1').prop('required', true);
				$$('#style_hc_edit_1').prop('validate', true);
				$$('#extra_edit_detail_1').prop('required', true);
				$$('#extra_edit_detail_1').prop('validate', true);
				document.getElementById("price_edit_popup").readOnly = true;
				if (tipe.indexOf("HCC") != -1) {
					showselectBoxUkuranPerformaEdit('HC-112', 1)
					firstShowPerformaEdit();
				} else if (tipe.indexOf("HC") != -1) {
					showselectBoxUkuranPerformaEdit(tipe.substr(0, 6), 1)
					firstShowPerformaEdit();
				}
			}

			$$('#jenis_edit_popup').prop('required', false);
			$$('#jenis_edit_popup').prop('validate', false);

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function firstShowPerformaEdit() {
	setTimeout(function () {
		var style = jQuery('#proforma_old_style_edit_1').val();
		var ukuran = jQuery('#proforma_old_ukuran_edit_1').val();
		// var style_array = style.split(', ');
		// var smartSelectStyle = app.smartSelect.get('.smart-select-style-hc-edit');
		// smartSelectStyle.setValue(style_array);
		$$('#ukuran_edit_hc_1').val(ukuran);
		$.each(style.split(', '), function (i, e) {
			$("#style_hc_edit_1 option[value='" + e + "']").prop("selected", true);
		});
		$$('#style_hc_edit_input_1').html(style);
	}, 500);
}


function editPerformaHeaderPenjualanProses() {
	var formData = new FormData(jQuery("#edit_performa_header_penjualan_popup")[0]);
	formData.append('style_new_hc_1', $('#style_hc_edit_input_1').html());
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		if (!$$('#edit_performa_header_penjualan_popup')[0].checkValidity()) {
			app.dialog.alert('Cek Isi Form Anda');
		} else {
			jQuery.ajax({
				type: 'POST',
				url: "" + BASE_API + "/edit-performa-header-penjualan-proses",
				dataType: 'JSON',
				data: formData,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Harap Tunggu');
				},
				success: function (data) {
					app.dialog.close();
					$("#color_proforma_edit_1").css("display", "none");
					$("#gambar_proforma_edit_1").css("display", "none");
					$('#jenis_edit_popup').val('');
					document.getElementById("edit_performa_header_penjualan_popup").reset();
					clearInputSelectEdit();
					$('#back_button_edit_performa').trigger('click');
					editPerformaHeaderPenjualanPage();
				},
				error: function (xmlhttprequest, textstatus, message) {
				}
			});
		}
	}
}


function editPerformaHeaderLogo() {
	var formData = new FormData(jQuery("#update-logo-performa-popup")[0]);
	formData.append('performa_header_id_edit_popup', localStorage.getItem("edit_performa_header_performa_header_id"));
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/edit-performa-logo-header-cs-proses",
			dataType: 'JSON',
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				$('#backbutton-edit-performa-header-penjualan').trigger('click');
				getPerformaHeaderPenjualan();
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function editPerformaHeaderPenjualanPageClick(performa_header_id) {
	localStorage.setItem("edit_performa_header_performa_header_id", performa_header_id);
	editPerformaHeaderPenjualanPage();
}

function editPerformaHeaderPenjualanPage() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/edit-performa-header-penjualan",
		dataType: 'JSON',
		data: {
			performa_header_id: localStorage.getItem("edit_performa_header_performa_header_id")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$$('#edit_value_customer_logo').html('Emblem');
			$$('#edit_value_customer_logo_bordir').html('Bordir');
			$$('#edit_value_customer_logo_tambahan').html('Tambahan');
		},
		success: function (data) {
			app.dialog.close();

			if (data.data[0].customer_logo != "") {
				var customer_logo = '<img style="margin:auto;" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo + '" width="100%">';
			} else {
				var customer_logo = '<font style="color:red;font-wight:bold; margin-right:auto; margin-left:auto;">NO IMAGE</font>';
			}

			if (data.data[0].customer_logo_bordir != "") {
				var customer_logo_bordir = '<img style="margin:auto;" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo_bordir + '" width="100%">';
			} else {
				var customer_logo_bordir = '<font style="color:red;font-wight:bold; margin-right:auto; margin-left:auto;">NO IMAGE</font>';
			}

			if (data.data[0].customer_logo_tambahan != "") {
				var customer_logo_tambahan = '<img style="margin:auto;" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo_tambahan + '" width="100%">';
			} else {
				var customer_logo_tambahan = '<font style="color:red;font-wight:bold; margin-right:auto; margin-left:auto;">NO IMAGE</font>';
			}
			$$('#preview_emblem').html(customer_logo);
			$$('#preview_bordir').html(customer_logo_bordir);
			$$('#preview_tambahan').html(customer_logo_tambahan);
			$$('#keterangan_reject_edit-performa-header-penjualan').val(data.data[0].keterangan_valid_cs);

			if (data.data[0].extra == 1 && data.data[0].grosir == 0) {
				$$('#xtra_tambah_1').val(1);
				$$('#tipe_grosir_performa').html('Xtra');
			} else if (data.data[0].extra == 0 && data.data[0].grosir == 1) {
				$$('#xtra_tambah_1').val(0);
				$$('#tipe_grosir_performa').html('Grosir');
			}

			var editPerformaHeaderPenjualanPage = '';
			$.each(data.data, function (i, item) {
				editPerformaHeaderPenjualanPage += '<tr>';
				editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + item.jenis + '</td>';
				editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + item.qty + '</td>';
				editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + number_format(item.price) + '</td>';
				editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + number_format(item.potongan_price) + '</td>';
				editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;">' + number_format(item.total) + '</td>';
				editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;"><button onclick="editPerformaHeaderPenjualanPopup(\'' + item.performa_id + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".edit-performa-header-penjualan-popup">Edit</button></td>';
				editPerformaHeaderPenjualanPage += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;"><button onclick="hapusPerformaHeaderPenjualanPopup(\'' + item.performa_id + '\',\'' + item.performa_header_id + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" >Hapus</button></td>';
				editPerformaHeaderPenjualanPage += '<tr>';
			});

			$$('#edit_performa_header_penjualan').html(editPerformaHeaderPenjualanPage);



		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});

}

function emptyValue(id) {
	jQuery('#' + id + '').val('');
}

function suratJalanValue(id) {
	jQuery('#' + id + '').val('SJ');
}

function piValue() {
	jQuery('#performa').val('PI_');
}

function invoicePenjualan(performa_header_id, biaya_kirim, client_alamat, client_cp, client_cp_posisi, client_id, client_kota, client_nama, client_telp, jenis_penjualan, karyawan_id, penjualan_global_diskon, penjualan_grandtotal, penjualan_id, penjualan_jumlah_pembayaran, penjualan_keterangan, penjualan_status, penjualan_status_pembayaran, penjualan_tanggal, penjualan_tanggal_kirim, penjualan_total, penjualan_void_keterangan, penjualan_total_qty, sisa_value, extra, packing) {

	// Format label packing untuk dokumen
	var packingLabels = { 'polos': 'Polos', 'plastik': 'Plastik', 'kardus': 'Kardus' };
	var packing_label = packing && packing !== '0' ? 'Packing ' + (packingLabels[packing] || packing.charAt(0).toUpperCase() + packing.slice(1)) : 'Packing finishing plastic';

	if (extra != 1) {
		header_koper = 'INDOKOPER';
		header_web = '';
		tipe_grosir = "Grosir"
	} else {
		header_koper = 'KOPERINDO';
		header_web = 'www.koperindo.id';
		tipe_grosir = "Xtra"
	}

	if (sisa_value == 0) {
		var style_table = "background-image:url('https://indokoper.com/lunas/lunas.jpg'); border:none;  background-position: center;  background-size:45% auto; margin:0px; background-repeat:no-repeat";
	} else {
		var style_table = "border-spacing: 0; background-color:white; color:black;";
	}

	// ⭐ HELPER: Hitung total pembayaran yang sudah divalidasi CS
	function hitungTotalPembayaranValidated(dataItem) {
		var total = 0;
		var fields = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		fields.forEach(function (n) {
			if (dataItem['valid_cs_' + n] == 1 && dataItem['pembayaran_' + n] != null) {
				total += parseFloat(dataItem['pembayaran_' + n]);
			}
		});
		return total;
	}

	app.dialog.create({
		title: 'Tanggal Pengiriman',
		text: 'Apakah Menyertakan Tanggal Pengiriman? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					var invoice_penjualan = '';
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/get-penjualan-detail-performa-manager",
						dataType: 'JSON',
						data: {
							karyawan_id: jQuery("#sales_id").val(),
							penjualan_id: penjualan_id,
							jenis_penjualan: jenis_penjualan
						},
						beforeSend: function () {
							app.dialog.preloader('Mengambil Data Penjualan');
							invoice_penjualan += '<table width="100%" border="0" style="' + style_table + '">';
							invoice_penjualan += '	<tr>';
							invoice_penjualan += '		<td colspan="6"  align="center"><b>' + header_koper + '</b><br>Industri Tas & Koper</td>';
							invoice_penjualan += '	</tr>';
							invoice_penjualan += '	<tr>';
							invoice_penjualan += '		<td colspan="6" align="center">' + header_web + '';
							invoice_penjualan += '			<hr>';
							invoice_penjualan += '		</td>';
							invoice_penjualan += '	</tr>';
							invoice_penjualan += '	<tr>';
							invoice_penjualan += '		<td colspan="6" align="center"><b>Invoice</b></td>';
							invoice_penjualan += '	</tr>';
							invoice_penjualan += '	<tr>';
							invoice_penjualan += '		<td colspan="4" align="left" >Kepada Yth :  ' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + ' <br> <font style="padding:94px;">' + client_kota + '</font></td>';
							invoice_penjualan += '		<td colspan="2" align="right"></td>';
							invoice_penjualan += '	</tr>';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">No</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">';
							invoice_penjualan += 'No Invoice</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">';
							invoice_penjualan += '	Jenis</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;"';
							invoice_penjualan += 'align="center">Total Rp.</td>';
							invoice_penjualan += '</tr >';
						},
						success: function (data) {

							var no_invoice_penjualan = 0;

							if (data.data.length != 0) {

								var penjualan_total = 0;
								var invest_molding = 0;
								invest_molding = data.data[0].invest_molding;

								// ⭐ PERBAIKAN: Hitung total pembayaran yang sudah divalidasi CS
								var total_pembayaran_validated = hitungTotalPembayaranValidated(data.data[0]);

								invoice_penjualan += '<tbody>';
								var ongkir = 0;
								jQuery.each(data.data, function (i, val) {
									if (val.style != null && val.style != 'none') {
										var style = val.style;
									} else {
										var style = '';
									}
									if (!val.keterangan) {
										var ket_item = '';
									} else {
										var ket_item = '<font color="red"><br>KET :<br>' + style + ' ' + val.keterangan + '</font>';
									}

									invoice_penjualan += '<tr>';
									invoice_penjualan += '<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
									invoice_penjualan += '	<center>' + (no_invoice_penjualan += 1) + '</center>';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="15%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
									invoice_penjualan += '<center>' + moment(val.dt_record).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center>';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="15%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
									invoice_penjualan += '	<center>' + val.penjualan_jenis + '</center>';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="10%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
									invoice_penjualan += '	<center>' + val.penjualan_qty + '</center>';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="25%" class="label-cell" align="right" style="border-top: solid 1px; border-left: solid 1px;">';
									invoice_penjualan += '' + number_format(val.penjualan_harga) + '';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="25%"  class="label-cell" align="right"';
									invoice_penjualan += '	style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
									invoice_penjualan += '' + number_format(val.penjualan_detail_grandtotal) + '';
									invoice_penjualan += '</td>';
									invoice_penjualan += '</tr>';

									penjualan_total += parseInt(val.penjualan_detail_grandtotal);
									ongkir = parseInt(val.ongkir);
								});
								invoice_penjualan += '</tbody>';

								// Molding
								if (number_format(data.data[0].invest_molding) != 0) {
									invoice_penjualan += '		<tr>';
									invoice_penjualan += '			<td colspan="4" style="font-weight:bold;;border-top: solid 1px;" align="right"></td>';
									invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				Molding';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				 <font style="float:right; ">' + number_format(invest_molding) + '</font>';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '		</tr>';
								}

								// Biaya Kirim
								invoice_penjualan += '		<tr>';
								invoice_penjualan += '			<td colspan="4" style="border-top: solid 1px;;font-weight:bold;" align="right"></td>';
								invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
								invoice_penjualan += '				Biaya Kirim';
								invoice_penjualan += '			</td>';
								invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;font-weight:bold;" align="left">';
								invoice_penjualan += '			 <font style="float:right;">' + number_format(ongkir != 0 ? ongkir : 0) + '</font>';
								invoice_penjualan += '			</td>';
								invoice_penjualan += '		</tr>';

								// ========== PACKING ==========
								var biaya_packing_val = parseFloat(data.data[0].total_biaya_packing || 0);
								var packing_label_tabel = (data.data[0].packing && data.data[0].packing !== '') ? data.data[0].packing : '-';
								if (biaya_packing_val > 0) {
									invoice_penjualan += '		<tr>';
									invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
									invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				Packing : ' + packing_label_tabel;
									invoice_penjualan += '			</td>';
									invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '			 <font style="float:right;">' + number_format(biaya_packing_val) + '</font>';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '		</tr>';
								}
								// ========== END PACKING ==========

								// Deposit
								if (total_pembayaran_validated > 0) {
									invoice_penjualan += '		<tr>';
									invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
									invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				Deposit';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '			<font style="float:right; ">' + number_format(total_pembayaran_validated) + '</font>';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '		</tr>';
								}

								// ⭐ PERBAIKAN: Jumlah = total + ongkir + packing - total_pembayaran_validated
								invoice_penjualan += '		<tr>';
								invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
								invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
								invoice_penjualan += '				Jumlah';
								invoice_penjualan += '			</td>';
								invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
								invoice_penjualan += '			 <font style="float:right;">' + number_format((parseFloat(penjualan_total) + parseFloat(ongkir) + biaya_packing_val) - total_pembayaran_validated) + '</font>';
								invoice_penjualan += '			</td>';
								invoice_penjualan += '		</tr>';

								var penjualan_tgl_kirim = '';
								jQuery.ajax({
									type: 'POST',
									url: "" + BASE_API + "/full-report-crm",
									dataType: 'JSON',
									data: {
										karyawan_id: karyawan_id,
										performa_header_id: performa_header_id,
										jenis_penjualan: jenis_penjualan
									},
									beforeSend: function () {
										app.dialog.preloader('Mengambil Data Pengiriman');
									},
									success: function (data) {
										app.dialog.close();

										var penjualan_tgl_kirim_no = 0;
										jQuery.each(data.data, function (ikrm, valkrm) {
											var myString = valkrm.penjualan_id;
											if (valkrm.jenis_penjualan != 'PERFORMA') {
												penjualan_tgl_kirim += '<tr>';
												penjualan_tgl_kirim += '<td colspan="5">';
												penjualan_tgl_kirim += '	- Kirim ' + myString[myString.length - 1] + ' : ' + valkrm.penjualan_qty + ' Pcs, Tgl ' + moment(valkrm.penjualan_tanggal_kirim).format('DD-MMM-YYYY') + '';
												penjualan_tgl_kirim += '</td>';
												penjualan_tgl_kirim += '</tr>';
											} else {
												penjualan_tgl_kirim += '<tr>';
												penjualan_tgl_kirim += '<td colspan="5">';
												penjualan_tgl_kirim += '	- Kirim 1 : ' + valkrm.penjualan_qty + ' Pcs, Tgl ' + moment(valkrm.penjualan_tanggal_kirim).format('DD-MMM-YYYY') + '';
												penjualan_tgl_kirim += '</td>';
												penjualan_tgl_kirim += '</tr>';
											}
										});

										invoice_penjualan += '<br>' + penjualan_tgl_kirim + '</br>';
										invoice_penjualan += '		<tr>';
										invoice_penjualan += '			<td colspan="6">:</td>';
										invoice_penjualan += '		</tr>';
										invoice_penjualan += '	</table>';

										invoice_penjualan += '	<table width="100%" border="0">';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="1%">-</td>';
										invoice_penjualan += '          <td width="70%">' + packing_label + '</td>';
										invoice_penjualan += '          <td width="16%" align="center"></td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="1%">-</td>';
										invoice_penjualan += '          <td width="70%">Harga produk belum termasuk biaya kirim</td>';
										invoice_penjualan += '          <td width="16%" align="center"></td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="1%">-</td>';
										invoice_penjualan += '          <td width="70%">Komplain lebih 3 hari setelah barang di terima tidak dapat di layani</td>';
										invoice_penjualan += '          <td width="16%" align="center"></td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="1%">-</td>';
										invoice_penjualan += '          <td width="70%">Dp 50% sebgai deposit, 50% pelunasan sebelum pengiriman</td>';
										invoice_penjualan += '          <td width="16%" align="center">Sales</td>';
										invoice_penjualan += '          <td width="13%" align="center">Customer</td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '		<tr>';
										invoice_penjualan += '			<td colspan="1"></td>';
										invoice_penjualan += '			<td colspan="2"></td>';
										invoice_penjualan += '		</tr>';
										invoice_penjualan += '	</table>';

										invoice_penjualan += '	<table border="0" width="100%" style="border-spacing: 0;">';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="50%" align="left" colspan="3" class=""><b>Rekening</b></td>';
										invoice_penjualan += '          <td width="20%" align="left"  class=""><b></b></td>';
										invoice_penjualan += '			<td width="15%" align="center" rowspan="4">';
										invoice_penjualan += '				<span style="position: relative;">';
										invoice_penjualan += ' 					<img src="https://indokoper.com/lunas/invoiceLogo.png" style="opacity: 0.6;" width="100" height="100">';
										invoice_penjualan += '					<span style="position: absolute;top: -200%;left: 50%;transform: translate(-50%, -50%);"></span>';
										invoice_penjualan += ' 					<span style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);"></span>';
										invoice_penjualan += '				</span>';
										invoice_penjualan += '			</td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';

										var bankInfo = '';
										if (data.data[0].bank_1_id) {
											var bankId = parseInt(data.data[0].bank_1_id);
											if (data.data[0].bank_1 === "Mandiri Owner") {
												bankId = 6;
											}
											var bankData = getBankInfoById(bankId);
											bankInfo += '      <tr>';
											bankInfo += '          <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">' + bankData.nama + '</td>';
											bankInfo += '          <td style="border-bottom: solid 1px;  border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
											bankInfo += '          <td style="border-bottom: solid 1px;  border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">' + bankData.rekening + ' a.n ' + bankData.atas_nama + '</td>';
											bankInfo += '          <td width="13%" align="center"></td>';
											bankInfo += '      </tr>';
										} else {
											bankInfo += '      <tr>';
											bankInfo += '          <td style="border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">BCA</td>';
											bankInfo += '          <td style="border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
											bankInfo += '          <td style="border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">01831 29551 a.n Sutono</td>';
											bankInfo += '          <td width="13%" align="center"></td>';
											bankInfo += '      </tr>';
											bankInfo += '      <tr>';
											bankInfo += '          <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">Mandiri</td>';
											bankInfo += '          <td style="border-bottom: solid 1px;  border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
											bankInfo += '          <td style="border-bottom: solid 1px;  border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">141 000 518 7422 a.n Sutono</td>';
											bankInfo += '          <td width="13%" align="center"></td>';
											bankInfo += '      </tr>';
										}
										invoice_penjualan += bankInfo;

										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="15%" align="center" colspan="4"></td>';
										invoice_penjualan += '          <td width="15%" align="center"><p style="font-weight: bold;">' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + '</p></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '	</table>';

										setTimeout(function () {
											app.dialog.close();
											$$('#detail_invoice_table_popup').html(invoice_penjualan);
											app.popup.open('.detail-invoice-popup');
										}, 1500);
										console.log(invoice_penjualan);
									},
									error: function (xmlhttprequest, textstatus, message) {
									}
								});
							}
						},
						error: function (xmlhttprequest, textstatus, message) {
						}
					});
				},
			},
			{
				text: 'Tidak',
				onClick: function () {
					var invoice_penjualan = '';
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/get-penjualan-detail-performa-manager",
						dataType: 'JSON',
						data: {
							karyawan_id: jQuery("#sales_id").val(),
							penjualan_id: penjualan_id,
							jenis_penjualan: jenis_penjualan
						},
						beforeSend: function () {
							app.dialog.preloader('Mengambil Data Penjualan');
							invoice_penjualan += '<table width="100%" border="0" style="' + style_table + '">';
							invoice_penjualan += '	<tr>';
							invoice_penjualan += '		<td colspan="6"  align="center"><b>' + header_koper + '</b><br>Industri Tas & Koper</td>';
							invoice_penjualan += '	</tr>';
							invoice_penjualan += '	<tr>';
							invoice_penjualan += '		<td colspan="6" align="center">' + header_web + '';
							invoice_penjualan += '			<hr>';
							invoice_penjualan += '		</td>';
							invoice_penjualan += '	</tr>';
							invoice_penjualan += '	<tr>';
							invoice_penjualan += '		<td colspan="6" align="center"><b>Invoice</b></td>';
							invoice_penjualan += '	</tr>';
							invoice_penjualan += '	<tr>';
							invoice_penjualan += '		<td colspan="4" align="left" >Kepada Yth :  ' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + ' <br> <font style="padding:94px;">' + client_kota + '</font></td>';
							invoice_penjualan += '		<td colspan="2" align="right">' + moment(penjualan_tanggal).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
							invoice_penjualan += '	</tr>';
							invoice_penjualan += '<tr>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">No</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">';
							invoice_penjualan += 'No Invoice</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">';
							invoice_penjualan += '	Jenis</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
							invoice_penjualan += '<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;"';
							invoice_penjualan += 'align="center">Total Rp.</td>';
							invoice_penjualan += '</tr >';
						},
						success: function (data) {

							var no_invoice_penjualan = 0;

							if (data.data.length != 0) {

								var penjualan_total = 0;
								var invest_molding = 0;
								invest_molding = data.data[0].invest_molding;
								var ongkir_tidak = 0;

								// ⭐ PERBAIKAN: Hitung total pembayaran yang sudah divalidasi CS
								var total_pembayaran_validated = hitungTotalPembayaranValidated(data.data[0]);

								invoice_penjualan += '<tbody>';

								jQuery.each(data.data, function (i, val) {
									if (val.style != null && val.style != 'none') {
										var style = val.style;
									} else {
										var style = '';
									}
									if (!val.keterangan) {
										var ket_item = '';
									} else {
										var ket_item = '<font color="red"><br>KET :<br>' + style + ' ' + val.keterangan + '</font>';
									}

									invoice_penjualan += '<tr>';
									invoice_penjualan += '<td width="5%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
									invoice_penjualan += '	<center>' + (no_invoice_penjualan += 1) + '</center>';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="15%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
									invoice_penjualan += '	<center>' + moment(val.dt_record).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center>';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="15%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; ">';
									invoice_penjualan += '	<center>' + val.penjualan_jenis + '</center>';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="10%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
									invoice_penjualan += '	<center>' + val.penjualan_qty + '</center>';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="25%" class="label-cell" align="right" style="border-top: solid 1px; border-left: solid 1px;">';
									invoice_penjualan += '' + number_format(val.penjualan_harga) + '';
									invoice_penjualan += '</td>';
									invoice_penjualan += '<td width="25%"  class="label-cell" align="right"';
									invoice_penjualan += '	style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
									invoice_penjualan += '' + number_format(val.penjualan_detail_grandtotal) + '';
									invoice_penjualan += '</td>';
									invoice_penjualan += '</tr>';
									ongkir_tidak = parseInt(val.ongkir);
									penjualan_total += parseInt(val.penjualan_detail_grandtotal);
								});
								invoice_penjualan += '</tbody>';

								// Molding
								if (number_format(data.data[0].invest_molding) != 0) {
									invoice_penjualan += '		<tr>';
									invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
									invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				Molding';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				 <font style="float:right; ">' + number_format(invest_molding) + '</font>';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '		</tr>';
								}

								// Biaya Kirim
								invoice_penjualan += '		<tr>';
								invoice_penjualan += '			<td colspan="4" style="border-top: solid 1px;font-weight:bold;" align="right"></td>';
								invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
								invoice_penjualan += '				Biaya Kirim';
								invoice_penjualan += '			</td>';
								invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;font-weight:bold;" align="left">';
								invoice_penjualan += '			 <font style="float:right;">' + number_format(ongkir_tidak != 0 ? ongkir_tidak : 0) + '</font>';
								invoice_penjualan += '			</td>';
								invoice_penjualan += '		</tr>';

								// ========== PACKING ==========
								var biaya_packing_val_tidak = parseFloat(data.data[0].total_biaya_packing || 0);
								var packing_label_tabel_tidak = (data.data[0].packing && data.data[0].packing !== '') ? data.data[0].packing : '-';
								if (biaya_packing_val_tidak > 0) {
									invoice_penjualan += '		<tr>';
									invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
									invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				Packing : ' + packing_label_tabel_tidak;
									invoice_penjualan += '			</td>';
									invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '			 <font style="float:right;">' + number_format(biaya_packing_val_tidak) + '</font>';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '		</tr>';
								}
								// ========== END PACKING ==========

								// Deposit
								if (total_pembayaran_validated > 0) {
									invoice_penjualan += '		<tr>';
									invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
									invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				 Deposit';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
									invoice_penjualan += '				<font style="float:right; color:red !important; ">' + number_format(total_pembayaran_validated) + '</font>';
									invoice_penjualan += '			</td>';
									invoice_penjualan += '		</tr>';
								}

								// ⭐ PERBAIKAN: Jumlah = total + ongkir + packing - total_pembayaran_validated
								invoice_penjualan += '		<tr>';
								invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
								invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
								invoice_penjualan += '				Jumlah';
								invoice_penjualan += '			</td>';
								invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
								invoice_penjualan += '			 <font style="float:right;">' + number_format((parseFloat(penjualan_total) + parseFloat(ongkir_tidak) + biaya_packing_val_tidak) - total_pembayaran_validated) + '</font>';
								invoice_penjualan += '			</td>';
								invoice_penjualan += '		</tr>';

								var penjualan_tgl_kirim = '';
								jQuery.ajax({
									type: 'POST',
									url: "" + BASE_API + "/full-report",
									dataType: 'JSON',
									data: {
										karyawan_id: karyawan_id,
										performa_header_id: performa_header_id,
										jenis_penjualan: jenis_penjualan
									},
									beforeSend: function () {
										app.dialog.preloader('Cetak Data');
									},
									success: function (data) {
										app.dialog.close();

										invoice_penjualan += '		<tr>';
										invoice_penjualan += '			<td colspan="6"></td>';
										invoice_penjualan += '		</tr>';
										invoice_penjualan += '	</table>';

										invoice_penjualan += '	<table width="100%" border="0">';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="1%">-</td>';
										invoice_penjualan += '          <td width="70%">' + packing_label + '</td>';
										invoice_penjualan += '          <td width="16%" align="center"></td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="1%">-</td>';
										invoice_penjualan += '          <td width="70%">Harga produk belum termasuk biaya kirim</td>';
										invoice_penjualan += '          <td width="16%" align="center"></td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="1%">-</td>';
										invoice_penjualan += '          <td width="70%">Komplain lebih 3 hari setelah barang di terima tidak dapat di layani</td>';
										invoice_penjualan += '          <td width="16%" align="center"></td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="1%">-</td>';
										invoice_penjualan += '          <td width="70%">Dp 50% sebgai deposit, 50% pelunasan sebelum pengiriman</td>';
										invoice_penjualan += '          <td width="16%" align="center">Sales</td>';
										invoice_penjualan += '          <td width="13%" align="center">Customer</td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '		<tr>';
										invoice_penjualan += '			<td colspan="1"></td>';
										invoice_penjualan += '			<td colspan="2"></td>';
										invoice_penjualan += '		</tr>';
										invoice_penjualan += '	</table>';

										invoice_penjualan += '	<table border="0" width="100%" style="border-spacing: 0;">';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="50%" align="left" colspan="3" class=""><b>Rekening</b></td>';
										invoice_penjualan += '          <td width="20%" align="left"  class=""><b></b></td>';
										invoice_penjualan += '			<td width="15%" align="center" rowspan="4">';
										invoice_penjualan += '				<span style="position: relative;">';
										invoice_penjualan += ' 					<img src="https://indokoper.com/lunas/invoiceLogo.png" style="opacity: 0.6;" width="100" height="100">';
										invoice_penjualan += '					<span style="position: absolute;top: -200%;left: 50%;transform: translate(-50%, -50%);"></span>';
										invoice_penjualan += ' 					<span style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);"></span>';
										invoice_penjualan += '				</span>';
										invoice_penjualan += '			</td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td style="border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">BCA</td>';
										invoice_penjualan += '          <td style="border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
										invoice_penjualan += '          <td style="border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">01831 29551 a.n Sutono</td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">Mandiri</td>';
										invoice_penjualan += '          <td style="border-bottom: solid 1px;  border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
										invoice_penjualan += '          <td style="border-bottom: solid 1px;  border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">141 000 518 7422 a.n Sutono</td>';
										invoice_penjualan += '          <td width="13%" align="center"></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '      <tr>';
										invoice_penjualan += '          <td width="15%" align="center" colspan="4"></td>';
										invoice_penjualan += '          <td width="15%" align="center"><p style="font-weight: bold;">' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + '</p></td>';
										invoice_penjualan += '      </tr>';
										invoice_penjualan += '	</table>';

										setTimeout(function () {
											app.dialog.close();
											$$('#detail_invoice_table_popup').html(invoice_penjualan);
											app.popup.open('.detail-invoice-popup');
										}, 1500);
									},
									error: function (xmlhttprequest, textstatus, message) {
									}
								});
							}
						},
						error: function (xmlhttprequest, textstatus, message) {
						}
					});
				},
			},
		],
	}).open();

}

function prosesPembayaranMultiple(pembayaran_id, number) {
	if (jQuery('#pembayaran_' + number + '_' + pembayaran_id + '').val() == "" || jQuery('#bank_' + number + '_' + pembayaran_id + '').val() == "" || jQuery('#tanggal_' + number + '_' + pembayaran_id + '').val() == "" || jQuery('#foto_bukti_' + number + '_' + pembayaran_id).val() == "") {
		app.dialog.alert('Isi Data Pembayaran Dengan Lengkap');
		console.log(number + ' - ' + jQuery('#pembayaran_' + number + '_' + pembayaran_id + '').val());
		console.log(number + ' - ' + jQuery('#bank_' + number + '_' + pembayaran_id + '').val());
		console.log(number + ' - ' + jQuery('#tanggal_' + number + '_' + pembayaran_id + '').val());
		console.log(number + ' - ' + jQuery('#foto_bukti_' + number + '_' + pembayaran_id).val());
	} else {

		var total_harus_bayar = parseInt(jQuery('#total_harus_bayar_' + pembayaran_id + '').val());


		var sudah_bayar = parseInt(jQuery('#sudah_bayar_' + pembayaran_id + '').val()) + parseInt(jQuery('#pembayaran_' + number + '_' + pembayaran_id + '').val().replace(/\,/g, ''));
		var sisa_harus_bayar = total_harus_bayar - sudah_bayar;

		if (sisa_harus_bayar < 0) {
			var lebih_bayar = sudah_bayar - total_harus_bayar;
			app.dialog.alert('Pembayaran Melebihi Nominal <br> <br> Nominal Lebih : ' + number_format(lebih_bayar) + ' <br><br>Bagi Pada Angsuran Berikutnya');
		} else {

			var formData = new FormData($('#pembayaran_form_multiple_' + number + '_' + pembayaran_id)[0]);

			formData.append('pembayaran', jQuery('#pembayaran_' + number + '_' + pembayaran_id + '').val());
			formData.append('bank', jQuery('#bank_' + number + '_' + pembayaran_id + '').val());
			formData.append('tanggal', jQuery('#tanggal_' + number + '_' + pembayaran_id + '').val());
			formData.append('keterangan', jQuery('#keterangan_' + number + '_' + pembayaran_id + '').val());
			formData.append('pembayaran_id', pembayaran_id);
			formData.append('pembayaran_ke', number);
			formData.append('foto_bukti', jQuery('#foto_bukti_' + number + '_' + pembayaran_id + '').prop('files')[0]);

			jQuery.ajax({
				type: 'POST',
				url: "" + BASE_API + "/proses-pembayaran-multiple-manager",
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

function uploadFotoPembayaran(foto_urutan, pembayaran_id, isi_foto) {
	jQuery('#penjualan_id_foto_pembayaran').val(pembayaran_id);
	jQuery('#foto_urutan').val(foto_urutan);

	jQuery('#file_foto_pembayaran').val('');
	localStorage.removeItem('file_foto_pembayaran');
	$('#file_foto_pembayaran_view').attr('src', '');
	$('#file_foto_pembayaran_view_now').attr('src', '');
	$$(".custom-file-upload-foto-pembayaran").show();
	if (isi_foto != 'null') {
		$('.btn-payment-penjualan').hide();
		jQuery('#file_foto_pembayaran_view_now').attr('src', BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + isi_foto);
	} else {
		$('.btn-payment-penjualan').show();
		jQuery('#file_foto_pembayaran_view_now').attr('src', 'https://indokoper.com/noimage.jpg');
	}
}

function updateFotoPembayaranProcess() {
	if ($('#file_foto_pembayaran').val() != "") {
		var formData = new FormData(jQuery("#upload_foto_pembayaran_form")[0]);
		formData.append('file_foto_pembayaran', $('#file_foto_pembayaran').prop('files')[0]);
		formData.append('penjualan_id_foto_pembayaran', jQuery('#penjualan_id_foto_pembayaran').val());
		formData.append('foto_urutan', jQuery('#foto_urutan').val());


		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/update-foto-pembayaran",
			dataType: "JSON",
			data: formData,
			contentType: false,
			processData: false,
			xhr: function () {
				var dialog = app.dialog.progress('Loading ', 0);
				dialog.setText('0%');
				var xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener("progress", function (evt) {

					if (evt.lengthComputable) {
						var percentComplete = evt.loaded / evt.total;
						dialog.setProgress(Math.round(percentComplete * 100));
						dialog.setText('' + (Math.round(percentComplete * 100)) + '%');
					}

				}, false);
				return xhr;
			},
			success: function (data) {
				app.popup.close();
				app.popup.close();
				app.dialog.close();


				if (data.status == 'done') {
					app.dialog.alert('Berhasil Update Foto');

				} else if (data.status == 'failed') {
					app.dialog.alert('Gagal Update Foto');
				}
			}
		});
	} else {
		app.dialog.alert('Harap Isi Foto');
	}
}

function fillOngkir(count, penjualan_id) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		var price_ongkir = jQuery('#ongkir_' + count).val();
		var replace_Ongkir = price_ongkir.replace(/\,/g, '')
		updateOngkirDetailPembayaran(replace_Ongkir, penjualan_id);
	}, 3000);
}

function updateOngkirDetailPembayaran(replace_Ongkir, penjualan_id) {
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
		});
	} else {
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/update-ongkir-detail-pembayaran-manager",
			dataType: 'JSON',
			data: {
				ongkir: replace_Ongkir,
				penjualan_id: penjualan_id
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				$('#backbutton').trigger('click');
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

//! NOTE
// function detailPembayaran(dt_record, penjualan_tanggal_choose, performa_id_relation, bank_1, bank_2, bank_3, bank_4, bank_5, bank_6, bank_7, bank_8, bank_9, bank_10, pembayaran1_tgl, pembayaran2_tgl, pembayaran3_tgl, pembayaran4_tgl, pembayaran5_tgl, pembayaran6_tgl, pembayaran7_tgl, pembayaran8_tgl, pembayaran9_tgl, pembayaran10_tgl, bank, pembayaran_1, pembayaran_2, pembayaran_3, pembayaran_4, pembayaran_5, pembayaran_6, pembayaran_7, pembayaran_8, pembayaran_9, pembayaran_10, client_nama, penjualan_jumlah_pembayaran, penjualan_total_qty, penjualan_grandtotal, penjualan_id, client_id, penjualan_status_pembayaran, biaya_kirim) {
// 	jQuery('#history_pembayaran_multiple').html("");
// 	if (performa_id_relation != "single") {
// 		jQuery('.pembayaran_single_div').hide();
// 		jQuery.ajax({
// 			type: 'POST',
// 			url: "" + BASE_API + "/detail-pembayaran-multiple-manager",
// 			dataType: 'JSON',
// 			data: {
// 				performa_id: performa_id_relation
// 			},
// 			beforeSend: function () {
// 				app.dialog.preloader('Harap Tunggu');
// 			},
// 			success: function (data) {
// 				app.dialog.close();

// 				jQuery("#bayar_pembayaran").val('');
// 				$$('#popup-pembayaran-td-nospk').html('' + moment(dt_record).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));
// 				$$('#popup-pembayaran-td-client_nama').html(client_nama);
// 				$$('#popup-pembayaran-bank').html(getBankLabelByCode(bank));
// 				$$(".bank_pembayaran").val(bank);
// 				$$('#popup-pembayaran-penjualan_jumlah_pembayaran').html(number_format(data.penjualan_jumlah_pembayaran) + ' ,-');


// 				var history_pembayaran_multiple = "";
// 				var no = 1;
// 				var total_jumlah_pembayaran = 0;
// 				var ongkir = 0;
// 				var hasOngkirPending = false;
// 				jQuery.each(data.pembayaran_data, function (i, val) {
// 					var no = i++;
// 					pembayaran_1 = number_format(val.pembayaran_1).replace(/\,/g, '');
// 					pembayaran_2 = number_format(val.pembayaran_2).replace(/\,/g, '');
// 					pembayaran_3 = number_format(val.pembayaran_3).replace(/\,/g, '');
// 					pembayaran_4 = number_format(val.pembayaran_4).replace(/\,/g, '');
// 					pembayaran_5 = number_format(val.pembayaran_5).replace(/\,/g, '');
// 					pembayaran_6 = number_format(val.pembayaran_6).replace(/\,/g, '');
// 					pembayaran_7 = number_format(val.pembayaran_7).replace(/\,/g, '');
// 					pembayaran_8 = number_format(val.pembayaran_8).replace(/\,/g, '');
// 					pembayaran_9 = number_format(val.pembayaran_9).replace(/\,/g, '');
// 					pembayaran_10 = number_format(val.pembayaran_10).replace(/\,/g, '');

// 					total_jumlah_pembayaran = parseInt(pembayaran_1) + parseInt(pembayaran_2) + parseInt(pembayaran_3) + parseInt(pembayaran_4) + parseInt(pembayaran_5) + parseInt(pembayaran_6) + parseInt(pembayaran_7) + parseInt(pembayaran_8) + parseInt(pembayaran_9) + parseInt(pembayaran_10);

// 					if (parseInt(val.penjualan_grandtotal) <= parseInt(total_jumlah_pembayaran)) {
// 						var background_multiple = "#133788";
// 						var status_lunas = "lunas";
// 					} else {
// 						var background_multiple = "";
// 						var status_lunas = "belum_lunas";
// 					}

// 					if (val.ongkir != null) {
// 						ongkir += val.ongkir;
// 					} else {
// 						ongkir = 0;
// 					}


// 					$('#ongkir_' + i + '').mask('000,000,000,000', { reverse: true });
// 					history_pembayaran_multiple += '<table  align="center" width="650px" border="0" style="border-collapse: collapse; border:1px solid white;">';

// 					history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 					history_pembayaran_multiple += '<td align="center" width="25%" colspan="2">';
// 					history_pembayaran_multiple += '<input type="hidden" id="status_lunas_' + i + '" value="' + status_lunas + '" name="status_lunas_' + i + '"  /><input type="hidden"  id="total_harus_bayar_' + val.pembayaran_id + '" value="' + val.penjualan_grandtotal + '" name="total_harus_bayar_' + val.pembayaran_id + '"  /><input type="hidden" id="sudah_bayar_' + val.pembayaran_id + '" value="' + total_jumlah_pembayaran + '" name="sudah_bayar_' + val.pembayaran_id + '"  />Deadline ' + i + ' : <br>' + moment(val.penjualan_tanggal_kirim).format('DD-MMM-YY') + '';
// 					history_pembayaran_multiple += '</td>';
// 					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;" colspan="1"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Total : <br>' + number_format(val.penjualan_grandtotal) + '';
// 					history_pembayaran_multiple += '</td>';
// 					history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="1"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Terbayar : <br>' + number_format(total_jumlah_pembayaran) + '';
// 					history_pembayaran_multiple += '</td>';

// 					history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Sisa : <br>' + number_format(val.penjualan_grandtotal - total_jumlah_pembayaran) + '';
// 					history_pembayaran_multiple += '</td>';

// 					history_pembayaran_multiple += '<td width="25%" colspan="3"  style="border-collapse: collapse; border-left:1px solid white;border-top:1px solid white;border-bottom:1px solid white;" colspan="1"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Ongkir : <br><input disabled style="text-align:center;width:100%;" placeholder="0" value="' + ongkir + '" onkeyup="fillOngkir(\'' + i + '\',\'' + val.penjualan_id + '\')" name="ongkir_' + i + '" id="ongkir_' + i + '" class="text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="text">';
// 					history_pembayaran_multiple += '</td>';

// 					history_pembayaran_multiple += ' </tr>';
// 					history_pembayaran_multiple += '<tr class="bg-dark-gray-medium">';
// 					history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar';
// 					history_pembayaran_multiple += '</td>';
// 					history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Tanggal</td>';
// 					history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 					history_pembayaran_multiple += '  class="numeric-cell text-align-center">Bank</td>';
// 					history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Jumlah</td>';
// 					history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Keterangan</td>';
// 					history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 					history_pembayaran_multiple += ' class="numeric-cell text-align-center">Opsi</td>';

// 					history_pembayaran_multiple += '  </tr>';
// 					history_pembayaran_multiple += '<tbody id="table_num_' + i + '">';
// 					if (val.pembayaran_1 != null && val.pembayaran_1 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 1';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran1_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_1_id, val.bank_1) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="total_jumlah_pembayaran_' + i + ' numeric-cell text-align-center">' + number_format(val.pembayaran_1) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						if (val.keterangan_1 != null) {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + val.keterangan_1 + '</td>';
// 						} else {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">-</td>';
// 						}
// 						if (val.foto_1 != null) {
// 							history_pembayaran_multiple += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_1\',\'' + val.pembayaran_id + '\',\'' + val.foto_1 + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
// 						}

// 						history_pembayaran_multiple += ' </tr>';
// 					}

// 					if (val.pembayaran_2 != null && val.pembayaran_2 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 2';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran2_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_2_id, val.bank_2) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_2) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						if (val.keterangan_2 != null) {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + val.keterangan_2 + '</td>';
// 						} else {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center"></td>';
// 						}

// 						if (val.foto_2 != null) {
// 							history_pembayaran_multiple += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_2\',\'' + val.pembayaran_id + '\',\'' + val.foto_2 + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
// 						}

// 						history_pembayaran_multiple += ' </tr>';
// 					}

// 					if (val.pembayaran_3 != null && val.pembayaran_3 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 3';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran3_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_3_id, val.bank_3) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_3) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						if (val.keterangan_3 != null) {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + val.keterangan_3 + '</td>';
// 						} else {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">-</td>';
// 						}
// 						if (val.foto_3 != null) {
// 							history_pembayaran_multiple += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_3\',\'' + val.pembayaran_id + '\',\'' + val.foto_3 + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
// 						}

// 						history_pembayaran_multiple += ' </tr>';
// 					}


// 					if (val.pembayaran_4 != null && val.pembayaran_4 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 4';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran4_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_4_id, val.bank_4) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_4) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						if (val.keterangan_4 != null) {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + val.keterangan_4 + '</td>';
// 						} else {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">-</td>';
// 						}
// 						if (val.foto_4 != null) {
// 							history_pembayaran_multiple += '<td  class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_4\',\'' + val.pembayaran_id + '\',\'' + val.foto_4 + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
// 						}

// 						history_pembayaran_multiple += ' </tr>';
// 					}
// 					if (val.pembayaran_5 != null && val.pembayaran_5 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 5';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran5_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_5_id, val.bank_5) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_5) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';

// 						if (val.keterangan_5 != null) {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + val.keterangan_5 + '</td>';
// 						} else {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">-</td>';
// 						}
// 						if (val.foto_5 != null) {
// 							history_pembayaran_multiple += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_5\',\'' + val.pembayaran_id + '\',\'' + val.foto_5 + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
// 						}

// 						history_pembayaran_multiple += ' </tr>';
// 					}


// 					if (val.pembayaran_6 != null && val.pembayaran_6 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 6';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran6_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_6_id, val.bank_6) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_6) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						if (val.keterangan_6 != null) {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + val.keterangan_6 + '</td>';
// 						} else {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">-</td>';
// 						}
// 						if (val.foto_6 != null) {
// 							history_pembayaran_multiple += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_6\',\'' + val.pembayaran_id + '\',\'' + val.foto_6 + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
// 						}

// 						history_pembayaran_multiple += ' </tr>';
// 					}

// 					if (val.pembayaran_7 != null && val.pembayaran_7 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 7';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran7_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_7_id, val.bank_7) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_7) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						if (val.keterangan_7 != null) {
// 							history_pembayaran_multiple += 'class="numeric-cell text-align-center">' + val.keterangan_7 + '</td>';
// 						} else {
// 							history_pembayaran_multiple += 'class="numeric-cell text-align-center">-</td>';
// 						}

// 						if (val.foto_7 != null) {
// 							history_pembayaran_multiple += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_7\',\'' + val.pembayaran_id + '\',\'' + val.foto_7 + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
// 						}

// 						history_pembayaran_multiple += ' </tr>';
// 					}


// 					if (val.pembayaran_8 != null && val.pembayaran_8 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 8';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran8_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_8_id, val.bank_8) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_8) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';

// 						if (val.keterangan_8 != null) {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + val.keterangan_8 + '</td>';
// 						} else {
// 							history_pembayaran_multiple += ' class="numeric-cell text-align-center">-</td>';
// 						}
// 						if (val.foto_8 != null) {
// 							history_pembayaran_multiple += '<td class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_8\',\'' + val.pembayaran_id + '\',\'' + val.foto_8 + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
// 						}

// 						history_pembayaran_multiple += ' </tr>';
// 					}

// 					if (val.pembayaran_9 != null && val.pembayaran_9 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 9';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran9_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_9_id, val.bank_9) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_9) + '</td>';
// 					}

// 					if (val.pembayaran_10 != null && val.pembayaran_10 != 0) {
// 						history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" colspan="2"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">Bayar 10';
// 						history_pembayaran_multiple += '</td>';
// 						history_pembayaran_multiple += '<td width="15%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + moment(val.pembayaran10_tgl).format('DD-MMM-YYYY') + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += '  class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_10_id, val.bank_10) + '</td>';
// 						history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;"';
// 						history_pembayaran_multiple += ' class="numeric-cell text-align-center">' + number_format(val.pembayaran_10) + '</td>';
// 						history_pembayaran_multiple += ' </tr>';
// 					}
// 					history_pembayaran_multiple += '<tbody>';
// 					history_pembayaran_multiple += '</table><br>';
// 				});

// 				$$('#popup-pembayaran-penjualan_grandtotal').html(number_format(parseInt(data.penjualan_grandtotal)) + ' ,-');
// 				$$('#popup-pembayaran-penjualan_kekurangan').html(number_format((parseInt(data.penjualan_grandtotal)) - data.penjualan_jumlah_pembayaran) + ' ,-');

// 				if (((data.penjualan_grandtotal + ongkir) - data.penjualan_jumlah_pembayaran) <= 0) {
// 					$$('#popup-pembayaran-penjualan_status_pembayaran').html('<b>Lunas</b>');
// 					$$('#popup-pembayaran-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue').addClass('card-color-blue');


// 				} else {
// 					$$('#popup-pembayaran-penjualan_status_pembayaran').html('<b>Belum Lunas</b>');
// 					$$('#popup-pembayaran-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue').addClass('card-color-green');


// 				}

// 				jQuery('#history_pembayaran_multiple').html(history_pembayaran_multiple);
// 				jQuery('#table_num_1').show()
// 				jQuery('#table_num_2').show()
// 				jQuery('#table_num_3').show()
// 				jQuery('#table_num_4').show()
// 				jQuery('#table_num_5').show()
// 				jQuery('#table_num_6').show()
// 				jQuery('#table_num_7').show()
// 				jQuery('#table_num_8').show()
// 				jQuery('#table_num_9').show()
// 				jQuery('#table_num_10').show()
// 				console.log(jQuery('#status_lunas_2').val());




// 				var today = moment().format('YYYY-MM-DD');
// 				document.getElementsByClassName("date-multiple-penbayaran")[0].setAttribute('min', today);
// 			},
// 			error: function (xmlhttprequest, textstatus, message) {
// 			}
// 		});

// 	} else {
// 		jQuery('.pembayaran_single_div').show();

// 		jQuery("#bayar_pembayaran").val('');
// 		$$('#popup-pembayaran-td-client_nama').html(client_nama + ', PT');
// 		$$('#popup-pembayaran-bank').html(getBankLabelByCode(bank));
// 		$$(".bank_pembayaran").val(bank);
// 		$$('#popup-pembayaran-penjualan_grandtotal').html(number_format(penjualan_grandtotal) + ' ,-');
// 		$$('#popup-pembayaran-penjualan_jumlah_pembayaran').html(number_format(penjualan_jumlah_pembayaran) + ' ,-');
// 		$$('#popup-pembayaran-penjualan_kekurangan').html(number_format((penjualan_grandtotal + biaya_kirim) - penjualan_jumlah_pembayaran) + ' ,-');
// 		$$('#popup-pembayaran-penjualan_status_pembayaran').html('<b>' + penjualan_status_pembayaran + '</b>');

// 		if (penjualan_status_pembayaran == 'Lunas') {
// 			$$('#popup-pembayaran-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue').addClass('card-color-blue');
// 			$$('#content_bayar1').css("background-color", "#133788");
// 			$$('#content_bayar2').css("background-color", "#133788");
// 			$$('#content_bayar3').css("background-color", "#133788");
// 			$$('#content_bayar4').css("background-color", "#133788");
// 			$$('#content_bayar5').css("background-color", "#133788");
// 			$$('#content_bayar6').css("background-color", "#133788");
// 			$$('#content_bayar7').css("background-color", "#133788");
// 			$$('#content_bayar8').css("background-color", "#133788");
// 			$$('#content_bayar9').css("background-color", "#133788");
// 			$$('#content_bayar10').css("background-color", "#133788");
// 		} else {
// 			$$('#popup-pembayaran-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue').addClass('card-color-green');
// 		}
// 	}



// 	$$('#tanggal_pembayaran_choose').html(moment(penjualan_tanggal_choose).format('DD-MMM-YYYY'));

// 	if (number_format(pembayaran_1) != 0) {
// 		$$('#content_bayar2').show();
// 		$$('#pembayaran_1_dp_awal').val(number_format(pembayaran_1));
// 		$$('#popup-pembayaran-tgl1').html(moment(pembayaran1_tgl).format('DD-MMM-YYYY'));
// 		$$('#pembayaran_1_dp_awal').attr('readonly', true);
// 		$$('#pembayaran_1_dp_awal').prop("onclick", null).off("click");
// 		$$('#bank_1').val(bank);

// 	} else {
// 		$$('#pembayaran_1_dp_awal').val(number_format(0));
// 		$$('#content_bayar2').hide();
// 		$$('#popup-pembayaran-tgl1').html("");
// 		$$('#pembayaran_1_dp_awal').removeAttr("readonly");
// 		$$('#pembayaran_1_dp_awal').attr('onClick', 'emptyValue("pembayaran_1")');
// 		$$('#bank_1').val(bank);
// 	}
// 	if (number_format(pembayaran_2) != 0) {
// 		$$('#content_bayar3').show();
// 		$$('#pembayaran_2').val(number_format(pembayaran_2));
// 		$$('#popup-pembayaran-tgl2').html(moment(pembayaran2_tgl).format('DD-MMM-YYYY'));
// 		$$('#pembayaran_2').attr('readonly', true);
// 		$$('#pembayaran_2').prop("onclick", null).off("click");
// 		$$('#bank_2').val(bank_2);

// 	} else {
// 		$$('#pembayaran_2').val(number_format(0));
// 		$$('#content_bayar3').hide();
// 		$$('#popup-pembayaran-tgl2').html("");
// 		$$('#pembayaran_2').removeAttr("readonly");
// 		$$('#pembayaran_2').attr('onClick', 'emptyValue("pembayaran_2")');
// 		$$('#bank_2').val(bank);
// 	}

// 	if (number_format(pembayaran_3) != 0) {
// 		$$('#pembayaran_3').val(number_format(pembayaran_3));
// 		$$('#popup-pembayaran-tgl3').html(moment(pembayaran3_tgl).format('DD-MMM-YYYY'));
// 		$$('#pembayaran_3').attr('readonly', true);
// 		$$('#content_bayar4').show();
// 		$$('#pembayaran_3').prop("onclick", null).off("click");
// 		$$('#bank_3').val(bank_3);
// 	} else {
// 		$$('#pembayaran_3').val(number_format(0));
// 		$$('#content_bayar4').hide();
// 		$$('#popup-pembayaran-tgl3').html("");
// 		$$('#pembayaran_3').removeAttr("readonly");
// 		$$('#pembayaran_3').attr('onClick', 'emptyValue("pembayaran_3")');
// 		$$('#bank_3').val(bank);
// 	}
// 	if (number_format(pembayaran_4) != 0) {
// 		$$('#pembayaran_4').val(number_format(pembayaran_4));
// 		$$('#popup-pembayaran-tgl4').html(moment(pembayaran4_tgl).format('DD-MMM-YYYY'));
// 		$$('#pembayaran_4').attr('readonly', true);
// 		$$('#content_bayar5').show();
// 		$$('#pembayaran_4').prop("onclick", null).off("click");
// 		$$('#bank_4').val(bank_4);
// 	} else {
// 		$$('#pembayaran_4').val(number_format(0));
// 		$$('#content_bayar5').hide();
// 		$$('#popup-pembayaran-tgl4').html("");
// 		$$('#pembayaran_4').removeAttr("readonly");
// 		$$('#pembayaran_4').attr('onClick', 'emptyValue("pembayaran_4")');
// 		$$('#bank_4').val(bank);
// 	}
// 	if (number_format(pembayaran_5) != 0) {
// 		$$('#pembayaran_5').val(number_format(pembayaran_5));
// 		$$('#pembayaran_5').attr('readonly', true);
// 		$$('#popup-pembayaran-tgl5').html(moment(pembayaran5_tgl).format('DD-MMM-YYYY'));
// 		$$('#content_bayar6').show();
// 		$$('#pembayaran_5').prop("onclick", null).off("click");
// 		$$('#bank_5').val(bank_5);
// 	} else {
// 		$$('#pembayaran_5').val(number_format(0));
// 		$$('#content_bayar6').hide();
// 		$$('#popup-pembayaran-tgl5').html("");
// 		$$('#pembayaran_5').removeAttr("readonly");
// 		$$('#pembayaran_5').attr('onClick', 'emptyValue("pembayaran_5")');
// 		$$('#bank_5').val(bank);
// 	}
// 	if (number_format(pembayaran_6) != 0) {
// 		$$('#pembayaran_6').val(number_format(pembayaran_6));
// 		$$('#pembayaran_6').attr('readonly', true);
// 		$$('#popup-pembayaran-tgl6').html(moment(pembayaran6_tgl).format('DD-MMM-YYYY'));
// 		$$('#content_bayar7').show();
// 		$$('#pembayaran_6').prop("onclick", null).off("click");
// 		$$('#bank_6').val(bank_6);
// 	} else {
// 		$$('#pembayaran_6').val(number_format(0));
// 		$$('#content_bayar7').hide();
// 		$$('#popup-pembayaran-tgl6').html("");
// 		$$('#pembayaran_6').removeAttr("readonly");
// 		$$('#pembayaran_6').attr('onClick', 'emptyValue("pembayaran_6")');
// 		$$('#bank_6').val(bank);
// 	}
// 	if (number_format(pembayaran_7) != 0) {
// 		$$('#pembayaran_7').val(number_format(pembayaran_7));
// 		$$('#pembayaran_7').attr('readonly', true);
// 		$$('#popup-pembayaran-tgl7').html(moment(pembayaran7_tgl).format('DD-MMM-YYYY'));
// 		$$('#content_bayar8').show();
// 		$$('#pembayaran_7').prop("onclick", null).off("click");
// 		$$('#bank_7').val(bank_7);
// 	} else {
// 		$$('#pembayaran_7').val(number_format(0));
// 		$$('#content_bayar8').hide();
// 		$$('#popup-pembayaran-tgl7').html("");
// 		$$('#pembayaran_7').removeAttr("readonly");
// 		$$('#pembayaran_7').attr('onClick', 'emptyValue("pembayaran_7")');
// 		$$('#bank_7').val(bank);
// 	}
// 	if (number_format(pembayaran_8) != 0) {
// 		$$('#pembayaran_8').val(number_format(pembayaran_8));
// 		$$('#pembayaran_8').attr('readonly', true);
// 		$$('#popup-pembayaran-tgl8').html(moment(pembayaran8_tgl).format('DD-MMM-YYYY'));
// 		$$('#content_bayar9').show();
// 		$$('#pembayaran_8').prop("onclick", null).off("click");
// 		$$('#bank_8').val(bank_8);
// 	} else {
// 		$$('#pembayaran_8').val(number_format(0));
// 		$$('#content_bayar9').hide();
// 		$$('#popup-pembayaran-tgl8').html("");
// 		$$('#pembayaran_8').removeAttr("readonly");
// 		$$('#pembayaran_8').attr('onClick', 'emptyValue("pembayaran_8")');
// 		$$('#bank_8').val(bank);
// 	}
// 	if (number_format(pembayaran_9) != 0) {
// 		$$('#pembayaran_9').val(number_format(pembayaran_9));
// 		$$('#pembayaran_9').attr('readonly', true);
// 		$$('#popup-pembayaran-tgl9').html(moment(pembayaran9_tgl).format('DD-MMM-YYYY'));
// 		$$('#content_bayar10').show();
// 		$$('#pembayaran_9').prop("onclick", null).off("click");
// 		$$('#bank_9').val(bank_9);
// 	} else {
// 		$$('#pembayaran_9').val(number_format(0));
// 		$$('#content_bayar10').hide();
// 		$$('#popup-pembayaran-tgl9').html("");
// 		$$('#pembayaran_9').removeAttr("readonly");
// 		$$('#pembayaran_9').attr('onClick', 'emptyValue("pembayaran_9")');
// 		$$('#bank_9').val(bank);
// 	}
// 	if (number_format(pembayaran_10) != 0) {
// 		$$('#pembayaran_10').val(number_format(pembayaran_10));
// 		$$('#pembayaran_10').prop("onclick", null).off("click");
// 		$$('#pembayaran_10').attr('readonly', true);
// 		$$('#popup-pembayaran-tgl10').html(moment(pembayaran10_tgl).format('DD-MMM-YYYY'));
// 	} else {
// 		$$('#pembayaran_10').val(number_format(0));
// 		$$('#popup-pembayaran-tgl10').html("");
// 		$$('#pembayaran_10').removeAttr("readonly");
// 		$$('#pembayaran_10').attr('onClick', 'emptyValue("pembayaran_10")');
// 	}

// 	$$('#pembayaran-penjualan_id').val(penjualan_id);
// 	$$('#pembayaran-client_id').val(client_id);
// }

function detailPembayaran(dt_record, penjualan_tanggal_choose, performa_id_relation, bank_1_id, bank_2_id, bank_3_id, bank_4_id, bank_5_id, bank_6_id, bank_7_id, bank_8_id, bank_9_id, bank_10_id, pembayaran1_tgl, pembayaran2_tgl, pembayaran3_tgl, pembayaran4_tgl, pembayaran5_tgl, pembayaran6_tgl, pembayaran7_tgl, pembayaran8_tgl, pembayaran9_tgl, pembayaran10_tgl, bank_id, pembayaran_1, pembayaran_2, pembayaran_3, pembayaran_4, pembayaran_5, pembayaran_6, pembayaran_7, pembayaran_8, pembayaran_9, pembayaran_10, client_nama, penjualan_jumlah_pembayaran, penjualan_total_qty, penjualan_grandtotal, penjualan_id, client_id, penjualan_status_pembayaran, ongkir, karyawan_id) {
	jQuery('#history_pembayaran_multiple').html("");

	if (performa_id_relation != "single") {
		jQuery('.pembayaran_single_div').hide();
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
				$$('#popup-pembayaran-td-nospk').html('' + moment(dt_record).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));
				$$('#popup-pembayaran-td-client_nama').html(client_nama);
				$$('#popup-pembayaran-bank').html(getBankLabel(bank_id));
				$$(".bank_pembayaran").val(bank_id);
				$$('#popup-pembayaran-penjualan_jumlah_pembayaran').html(number_format(data.penjualan_jumlah_pembayaran) + ' ,-');

				var history_pembayaran_multiple = "";
				var no = 1;
				var total_jumlah_pembayaran = 0;
				var ongkir = 0;
				var hasOngkirPending = false;
				var isOwnTransaction = (String(karyawan_id) === String(localStorage.getItem("user_id")));
				
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
					// FIX: Jika nextSlot > 10 berarti semua slot sudah penuh, set null agar tidak ada form input baru
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
						ongkirEditable = !isOngkirEdited && isOwnTransaction;
					} else if (statusOngkir === 'free') {
						ongkirLabel = '(Free)';
						ongkirColor = '#4cd964';
						ongkirDisplay = 0;
						ongkirEditable = false;
					} else if (statusOngkir === 'nominal') {
						ongkirLabel = '';
						ongkirColor = '#ffa500';
						ongkirDisplay = ongkir;
						ongkirEditable = !isOngkirEdited && isOwnTransaction;
					}
					if (isOngkirEdited) { ongkirColor = '#34c759'; ongkirLabel = ''; }
					
					var sisa_pembayaran = parseFloat(val.penjualan_grandtotal - total_pembayaran_valid);

					$('#ongkir_' + i + '').mask('000,000,000,000', { reverse: true });
					history_pembayaran_multiple += '<table  align="center" width="800px" border="0" style="border-collapse: collapse; border:1px solid white;">';

					history_pembayaran_multiple += '<tr style="background-color:' + background_multiple + '">';
					history_pembayaran_multiple += '<td align="center" width="15%" colspan="2">';
					history_pembayaran_multiple += '<input type="hidden" id="status_lunas_' + i + '" value="' + status_lunas + '" name="status_lunas_' + i + '"  /><input type="hidden"  id="total_harus_bayar_' + val.pembayaran_id + '" value="' + val.penjualan_grandtotal + '" name="total_harus_bayar_' + val.pembayaran_id + '"  /><input type="hidden" id="sudah_bayar_' + val.pembayaran_id + '" value="' + total_pembayaran_valid + '" name="sudah_bayar_' + val.pembayaran_id + '"  />Deadline ' + i + ' : <br>' + moment(val.penjualan_tanggal_kirim).format('DD-MMM-YY') + '';
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
						history_pembayaran_multiple += 'name="ongkir_' + i + '" id="ongkir_' + i + '" ';
						history_pembayaran_multiple += 'data-original-value="' + ongkirOriginal + '" data-is-edited="false" ';
						history_pembayaran_multiple += 'data-penjualan-id="' + val.penjualan_id + '" data-status-ongkir="' + statusOngkir + '" ';
						history_pembayaran_multiple += 'data-id-kota-pengiriman="' + (val.id_kota_pengiriman || '') + '" ';
						history_pembayaran_multiple += 'data-nama-kota-pengiriman="' + (val.nama_kota_pengiriman || '') + '" ';
						history_pembayaran_multiple += 'class="text-add-colour-black-soft button-small text-bold ongkir-field" type="text" readonly>';
					} else if (isOngkirEdited) {
						history_pembayaran_multiple += '<input style="text-align:center; width:100%; background-color:#34c759; color:white; cursor:not-allowed; font-weight:bold;" ';
						history_pembayaran_multiple += 'value="' + ongkirDisplay + '" ';
						history_pembayaran_multiple += 'onclick="handleOngkirClick(this, \'' + i + '\', \'' + val.penjualan_id + '\', \'' + ongkirOriginal + '\', \'' + statusOngkir + '\');" ';
						history_pembayaran_multiple += 'name="ongkir_' + i + '" id="ongkir_' + i + '" ';
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
					history_pembayaran_multiple += '<tbody id="table_num_' + i + '">';

					// ============================================================
					// BAYAR 1
					// ============================================================
					if (val.pembayaran_1 != null && val.pembayaran_1 != 0) {
						if (val.valid_cs_1 == 2) {
							history_pembayaran_multiple += '<tr class="card-color-red">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 1</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran1_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_1_id, val.bank_1) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="total_jumlah_pembayaran_' + i + ' numeric-cell text-align-center">' + number_format(val.pembayaran_1) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_1 != null ? val.keterangan_1 : '-') + '</td>';
							history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".edit-pembayaran" onclick="editPembayaranPopup(\'Bayar 1\',\'foto_1\',\'' + val.pembayaran_id + '\',\'' + val.foto_1 + '\',\'' + val.pembayaran_1 + '\',\'' + val.keterangan_1 + '\',\'' + val.bank_1 + '\',\'' + val.pembayaran1_tgl + '\',\'' + sisa_pembayaran + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_pembayaran_valid + '\',\'' + val.keterangan_valid_cs_1 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Edit</button></td>';
							history_pembayaran_multiple += ' </tr>';
						} else if (val.valid_cs_1 == 1 || val.valid_cs_1 == 0) {
							var bg_row_1 = (val.valid_cs_1 == 1) ? '#133788' : '';
							history_pembayaran_multiple += '<tr style="background-color:' + bg_row_1 + '">';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 1</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + moment(val.pembayaran1_tgl).format('DD-MMM-YYYY') + '</td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + getBankLabelFromPayment(val.bank_1_id, val.bank_1) + '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="total_jumlah_pembayaran_' + i + ' numeric-cell text-align-center">' + number_format(val.pembayaran_1) + '</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">' + (val.keterangan_1 != null ? val.keterangan_1 : '-') + '</td>';
							if (val.foto_1 != null) {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_1\',\'' + val.pembayaran_id + '\',\'' + val.foto_1 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_1\',\'' + val.pembayaran_id + '\',\'' + val.foto_1 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						// pembayaran_1 == 0 atau null → render form input dengan nextSlot
						// FIX: Jika nextSlot null berarti semua slot sudah penuh, jangan render apapun
						if (nextSlot !== null && isOwnTransaction) {
							var ns = nextSlot;
							renderedInputSlot = ns; // ← CATAT slot yang sudah di-render

							history_pembayaran_multiple += '<form id="pembayaran_form_multiple_' + ns + '_' + val.pembayaran_id + '"><tr>';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar ' + ns + '</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;text-align:center;" id="tanggal_' + ns + '_' + val.pembayaran_id + '" name="tanggal_' + ns + '_' + val.pembayaran_id + '" type="date" value="' + moment().format('YYYY-MM-DD') + '" class="date-multiple-penbayaran" readonly></td>';
							history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
							if (checkIsOwner() && ownerBankDefault) {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_' + ns + '_' + val.pembayaran_id + '" name="bank_' + ns + '_' + val.pembayaran_id + '">';
								history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
								history_pembayaran_multiple += '</select>';
								// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
								// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
								// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
								// history_pembayaran_multiple += '<input type="hidden" id="bank_' + ns + '_' + val.pembayaran_id + '" name="bank_' + ns + '_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
							} else {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_' + ns + '_' + val.pembayaran_id + '" name="bank_' + ns + '_' + val.pembayaran_id + '">';
								history_pembayaran_multiple += generateBankOptions(3, false);
								history_pembayaran_multiple += '</select>';
							}
							history_pembayaran_multiple += '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" class="input-pembayaran-multiple" id="pembayaran_' + ns + '_' + val.pembayaran_id + '" name="pembayaran_' + ns + '_' + val.pembayaran_id + '" type="text"></td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_' + ns + '_' + val.pembayaran_id + '" name="keterangan_' + ns + '_' + val.pembayaran_id + '" type="text"></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_' + ns + '_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_' + ns + '_' + val.pembayaran_id + '" name="foto_bukti_' + ns + '_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',' + ns + ');"></td>';
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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_2\',\'' + val.pembayaran_id + '\',\'' + val.foto_2 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_2\',\'' + val.pembayaran_id + '\',\'' + val.foto_2 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_1 != null && val.pembayaran_1 != 0) {
							if (status_lunas != "lunas" && val.valid_cs_1 == 1 && isOwnTransaction) {
								// ========================================
								// FIX: Jangan render jika slot 2 sudah di-render oleh blok nextSlot
								// ========================================
								if (renderedInputSlot != 2) {
									history_pembayaran_multiple += '<form id="pembayaran_form_multiple_2_' + val.pembayaran_id + '"><tr>';
									history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 2</td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_2_' + val.pembayaran_id + '" name="tanggal_2_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
									history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
									if (checkIsOwner() && ownerBankDefault) {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_2_' + val.pembayaran_id + '" name="bank_2_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
										history_pembayaran_multiple += '</select>';
										// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
										// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
										// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
										// history_pembayaran_multiple += '<input type="hidden" id="bank_2_' + val.pembayaran_id + '" name="bank_2_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
									} else {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_2_' + val.pembayaran_id + '" name="bank_2_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(3, false);
										history_pembayaran_multiple += '</select>';
									}
									history_pembayaran_multiple += '</td>';
									history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_2_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_2_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_2_' + val.pembayaran_id + '" name="keterangan_2_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_2_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_2_' + val.pembayaran_id + '" name="foto_bukti_2_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',2);"></td>';
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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_3\',\'' + val.pembayaran_id + '\',\'' + val.foto_3 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_3\',\'' + val.pembayaran_id + '\',\'' + val.foto_3 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_2 != null && val.pembayaran_2 != 0) {
							if (status_lunas != "lunas" && val.valid_cs_2 == 1 && isOwnTransaction) {
								// ========================================
								// FIX: Jangan render jika slot 3 sudah di-render oleh blok nextSlot
								// ========================================
								if (renderedInputSlot != 3) {
									history_pembayaran_multiple += '<form id="pembayaran_form_multiple_3_' + val.pembayaran_id + '"><tr>';
									history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 3</td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_3_' + val.pembayaran_id + '" name="tanggal_3_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
									history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
									if (checkIsOwner() && ownerBankDefault) {
										// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
										// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
										// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
										// history_pembayaran_multiple += '<input type="hidden" id="bank_3_' + val.pembayaran_id + '" name="bank_3_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_3_' + val.pembayaran_id + '" name="bank_3_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
										history_pembayaran_multiple += '</select>';
									} else {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_3_' + val.pembayaran_id + '" name="bank_3_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(3, false);
										history_pembayaran_multiple += '</select>';
									}
									history_pembayaran_multiple += '</td>';
									history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_3_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_3_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_3_' + val.pembayaran_id + '" name="keterangan_3_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_3_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_3_' + val.pembayaran_id + '" name="foto_bukti_3_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',3);"></td>';
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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_4\',\'' + val.pembayaran_id + '\',\'' + val.foto_4 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_4\',\'' + val.pembayaran_id + '\',\'' + val.foto_4 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_3 != null && val.pembayaran_3 != 0) {
							if (status_lunas != "lunas" && val.valid_cs_3 == 1 && isOwnTransaction) {
								// FIX: guard renderedInputSlot
								if (renderedInputSlot != 4) {
									history_pembayaran_multiple += '<form id="pembayaran_form_multiple_4_' + val.pembayaran_id + '"><tr>';
									history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 4</td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_4_' + val.pembayaran_id + '" name="tanggal_4_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
									if (checkIsOwner() && ownerBankDefault) {
										// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
										// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
										// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
										// history_pembayaran_multiple += '<input type="hidden" id="bank_4_' + val.pembayaran_id + '" name="bank_4_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_4_' + val.pembayaran_id + '" name="bank_4_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
										history_pembayaran_multiple += '</select>';
									} else {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_4_' + val.pembayaran_id + '" name="bank_4_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(3, false);
										history_pembayaran_multiple += '</select>';
									}
									history_pembayaran_multiple += '</td>';
									history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_4_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_4_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_4_' + val.pembayaran_id + '" name="keterangan_4_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_4_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_4_' + val.pembayaran_id + '" name="foto_bukti_4_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',4);"></td>';
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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_5\',\'' + val.pembayaran_id + '\',\'' + val.foto_5 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_5\',\'' + val.pembayaran_id + '\',\'' + val.foto_5 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_4 != null && val.pembayaran_4 != 0) {
							// NOTE: Kode asli ada bug di sini: pakai valid_cs_1 bukan valid_cs_4
							// Diperbaiki menjadi valid_cs_4
							if (status_lunas != "lunas" && val.valid_cs_4 == 1 && isOwnTransaction) {
								// FIX: guard renderedInputSlot
								if (renderedInputSlot != 5) {
									history_pembayaran_multiple += '<form id="pembayaran_form_multiple_5_' + val.pembayaran_id + '"><tr>';
									history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 5</td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_5_' + val.pembayaran_id + '" name="tanggal_5_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
									history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
									if (checkIsOwner() && ownerBankDefault) {
										// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
										// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
										// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
										// history_pembayaran_multiple += '<input type="hidden" id="bank_5_' + val.pembayaran_id + '" name="bank_5_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_5_' + val.pembayaran_id + '" name="bank_5_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
										history_pembayaran_multiple += '</select>';
									} else {
										history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_5_' + val.pembayaran_id + '" name="bank_5_' + val.pembayaran_id + '" required validate>';
										history_pembayaran_multiple += generateBankOptions(3, false);
										history_pembayaran_multiple += '</select>';
									}
									history_pembayaran_multiple += '</td>';
									history_pembayaran_multiple += '<td width="13%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_5_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_5_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_5_' + val.pembayaran_id + '" name="keterangan_5_' + val.pembayaran_id + '" type="text"/></td>';
									history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_5_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_5_' + val.pembayaran_id + '" name="foto_bukti_5_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',5);"></td>';
									history_pembayaran_multiple += ' </tr></form>';
								}
							}
						}
					}

					// ============================================================
					// BAYAR 6 - 10 (tidak terpengaruh bug, tapi tetap konsisten)
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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_6\',\'' + val.pembayaran_id + '\',\'' + val.foto_6 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_6\',\'' + val.pembayaran_id + '\',\'' + val.foto_6 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_5 != null && val.pembayaran_5 != 0 && val.valid_cs_5 == 1 && isOwnTransaction) {
							// FIX: guard renderedInputSlot
							if (renderedInputSlot != 6) {
							history_pembayaran_multiple += '<form id="pembayaran_form_multiple_6_' + val.pembayaran_id + '"><tr>';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 6</td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_6_' + val.pembayaran_id + '" name="tanggal_6_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
							if (checkIsOwner() && ownerBankDefault) {
								// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
								// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
								// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
								// history_pembayaran_multiple += '<input type="hidden" id="bank_6_' + val.pembayaran_id + '" name="bank_6_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_6_' + val.pembayaran_id + '" name="bank_6_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
								history_pembayaran_multiple += '</select>';
							} else {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_6_' + val.pembayaran_id + '" name="bank_6_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(3, false);
								history_pembayaran_multiple += '</select>';
							}
							history_pembayaran_multiple += '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_6_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_6_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_6_' + val.pembayaran_id + '" name="keterangan_6_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_6_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_6_' + val.pembayaran_id + '" name="foto_bukti_6_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',6);"></td>';
							history_pembayaran_multiple += ' </tr></form>';
							} // end renderedInputSlot != 6
						}
					}

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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_7\',\'' + val.pembayaran_id + '\',\'' + val.foto_7 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_7\',\'' + val.pembayaran_id + '\',\'' + val.foto_7 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_6 != null && val.pembayaran_6 != 0 && val.valid_cs_6 == 1 && isOwnTransaction) {
							// FIX: guard renderedInputSlot
							if (renderedInputSlot != 7) {
							history_pembayaran_multiple += '<form id="pembayaran_form_multiple_7_' + val.pembayaran_id + '"><tr>';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 7</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_7_' + val.pembayaran_id + '" name="tanggal_7_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
							if (checkIsOwner() && ownerBankDefault) {
								// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
								// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
								// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
								// history_pembayaran_multiple += '<input type="hidden" id="bank_7_' + val.pembayaran_id + '" name="bank_7_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_7_' + val.pembayaran_id + '" name="bank_7_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
								history_pembayaran_multiple += '</select>';
							} else {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_7_' + val.pembayaran_id + '" name="bank_7_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(3, false);
								history_pembayaran_multiple += '</select>';
							}
							history_pembayaran_multiple += '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_7_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_7_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_7_' + val.pembayaran_id + '" name="keterangan_7_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_7_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_7_' + val.pembayaran_id + '" name="foto_bukti_7_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',7);"></td>';
							history_pembayaran_multiple += ' </tr></form>';
							} // end renderedInputSlot != 7
						}
					}

					if (val.pembayaran_8 != null && val.pembayaran_8 != 0) {
						// NOTE: Bug di kode asli: valid_cs_8 == 8 seharusnya valid_cs_8 == 2 → diperbaiki
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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_8\',\'' + val.pembayaran_id + '\',\'' + val.foto_8 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_8\',\'' + val.pembayaran_id + '\',\'' + val.foto_8 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_7 != null && val.pembayaran_7 != 0 && val.valid_cs_7 == 1 && isOwnTransaction) {
							// FIX: guard renderedInputSlot
							if (renderedInputSlot != 8) {
							history_pembayaran_multiple += '<form id="pembayaran_form_multiple_8_' + val.pembayaran_id + '"><tr>';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 8</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_8_' + val.pembayaran_id + '" name="tanggal_8_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
							if (checkIsOwner() && ownerBankDefault) {
								// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
								// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
								// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
								// history_pembayaran_multiple += '<input type="hidden" id="bank_8_' + val.pembayaran_id + '" name="bank_8_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_8_' + val.pembayaran_id + '" name="bank_8_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
								history_pembayaran_multiple += '</select>';
							} else {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_8_' + val.pembayaran_id + '" name="bank_8_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(3, false);
								history_pembayaran_multiple += '</select>';
							}
							history_pembayaran_multiple += '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_8_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_8_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_8_' + val.pembayaran_id + '" name="keterangan_8_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_8_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_8_' + val.pembayaran_id + '" name="foto_bukti_8_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',8);"></td>';
							history_pembayaran_multiple += ' </tr></form>';
							} // end renderedInputSlot != 8
						}
					}

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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_9\',\'' + val.pembayaran_id + '\',\'' + val.foto_9 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_9\',\'' + val.pembayaran_id + '\',\'' + val.foto_9 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_8 != null && val.pembayaran_8 != 0 && val.valid_cs_8 == 1 && isOwnTransaction) {
							// FIX: guard renderedInputSlot
							if (renderedInputSlot != 9) {
							history_pembayaran_multiple += '<form id="pembayaran_form_multiple_9_' + val.pembayaran_id + '"><tr>';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 9</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_9_' + val.pembayaran_id + '" name="tanggal_9_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
							if (checkIsOwner() && ownerBankDefault) {
								// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
								// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
								// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
								// history_pembayaran_multiple += '<input type="hidden" id="bank_9_' + val.pembayaran_id + '" name="bank_9_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_9_' + val.pembayaran_id + '" name="bank_9_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
								history_pembayaran_multiple += '</select>';
							} else {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_9_' + val.pembayaran_id + '" name="bank_9_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(3, false);
								history_pembayaran_multiple += '</select>';
							}
							history_pembayaran_multiple += '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_9_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_9_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="20%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_9_' + val.pembayaran_id + '" name="keterangan_9_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_9_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_9_' + val.pembayaran_id + '" name="foto_bukti_9_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',9);"></td>';
							history_pembayaran_multiple += ' </tr></form>';
							} // end renderedInputSlot != 9
						}
					}

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
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_10\',\'' + val.pembayaran_id + '\',\'' + val.foto_10 + '\')" class="popup-open text-add-colour-black-soft card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
							} else {
								history_pembayaran_multiple += '<td style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><button data-popup=".upload-foto-pembayaran" onclick="uploadFotoPembayaran(\'foto_10\',\'' + val.pembayaran_id + '\',\'' + val.foto_10 + '\')" class="popup-open text-add-colour-black-soft button-small col button text-bold bg-dark-gray-young">Foto</button></td>';
							}
							history_pembayaran_multiple += ' </tr>';
						}
					} else {
						if (val.pembayaran_9 != null && val.pembayaran_9 != 0 && val.valid_cs_9 == 1 && isOwnTransaction) {
							// FIX: guard renderedInputSlot
							if (renderedInputSlot != 10) {
							history_pembayaran_multiple += '<form id="pembayaran_form_multiple_10_' + val.pembayaran_id + '"><tr>';
							history_pembayaran_multiple += '<td width="8%" style="border-collapse: collapse; border:1px solid white;" colspan="2" class="numeric-cell text-align-center">Bayar 10</td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:105px;" id="tanggal_10_' + val.pembayaran_id + '" name="tanggal_10_' + val.pembayaran_id + '" type="date" class="date-multiple-penbayaran" value="' + moment().format('YYYY-MM-DD') + '" readonly/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center">';
							if (checkIsOwner() && ownerBankDefault) {
								// var bankInfo = getBankInfoById(parseInt(ownerBankDefault));
								// var label = bankInfo.nama + ' (' + bankInfo.rekening + ' A/N ' + bankInfo.atas_nama + ')';
								// history_pembayaran_multiple += '<div style="padding:5px;">' + label + '</div>';
								// history_pembayaran_multiple += '<input type="hidden" id="bank_10_' + val.pembayaran_id + '" name="bank_10_' + val.pembayaran_id + '" value="' + ownerBankDefault + '">';
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_10_' + val.pembayaran_id + '" name="bank_10_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(ownerBankDefault, false);
								history_pembayaran_multiple += '</select>';
							} else {
								history_pembayaran_multiple += '<select style="width:100%; background-color:#1c1c1d;" class="hide_bank performa-input input-item-bank" id="bank_10_' + val.pembayaran_id + '" name="bank_10_' + val.pembayaran_id + '" required validate>';
								history_pembayaran_multiple += generateBankOptions(3, false);
								history_pembayaran_multiple += '</select>';
							}
							history_pembayaran_multiple += '</td>';
							history_pembayaran_multiple += '<td width="10%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="pembayaran_10_' + val.pembayaran_id + '" class="input-pembayaran-multiple" name="pembayaran_10_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="20%" colspan="2" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><input style="width:100%;" id="keterangan_10_' + val.pembayaran_id + '" name="keterangan_10_' + val.pembayaran_id + '" type="text"/></td>';
							history_pembayaran_multiple += '<td width="25%" style="border-collapse: collapse; border:1px solid white;" class="numeric-cell text-align-center"><label class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" for="foto_bukti_10_' + val.pembayaran_id + '">FOTO</label><input style="display:none;width:100%;" id="foto_bukti_10_' + val.pembayaran_id + '" name="foto_bukti_10_' + val.pembayaran_id + '" type="file" onchange="prosesPembayaranMultiple(' + val.pembayaran_id + ',10);"></td>';
							history_pembayaran_multiple += ' </tr></form>';
							} // end renderedInputSlot != 10
						}
					}

					history_pembayaran_multiple += '<tbody>';
					history_pembayaran_multiple += '</table><br>';
				});

				$$('#popup-pembayaran-penjualan_grandtotal').html(number_format(parseInt(data.penjualan_total)) + ' ,-');
				$$('#popup-pembayaran-penjualan_kekurangan').html(number_format((parseInt(data.penjualan_grandtotal)) - data.penjualan_jumlah_pembayaran) + ' ,-');
				$$('#popup-pembayaran-ongkir').html(number_format(parseInt(data.ongkir)) + ' ,-');
				$$('#popup-pembayaran-packing').html(number_format(parseInt(data.total_biaya_packing)) + ' ,-');

				if (((data.penjualan_grandtotal) - data.penjualan_jumlah_pembayaran) <= 0 && !hasOngkirPending) {
					$$('#popup-pembayaran-penjualan_status_pembayaran').html('<b class="card-color-blue" style="padding-left:42px; padding-right:12px;">Lunas</b>');
					$$('#popup-pembayaran-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue');
				} else {
					$$('#popup-pembayaran-penjualan_status_pembayaran').html('<b class="card-color-green" style="padding-left:42px; padding-right:12px;">Belum Lunas</b>');
					$$('#popup-pembayaran-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue');
				}

				jQuery('#history_pembayaran_multiple').html(history_pembayaran_multiple);
				jQuery('#table_num_1').show();
				jQuery('#table_num_2').show();
				jQuery('#table_num_3').show();
				jQuery('#table_num_4').show();
				jQuery('#table_num_5').show();
				jQuery('#table_num_6').show();
				jQuery('#table_num_7').show();
				jQuery('#table_num_8').show();
				jQuery('#table_num_9').show();
				jQuery('#table_num_10').show();
				console.log(jQuery('#status_lunas_2').val());

				var today = moment().format('YYYY-MM-DD');
				document.getElementsByClassName("date-multiple-penbayaran")[0].setAttribute('min', today);
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});

	} else {
		jQuery('.pembayaran_single_div').show();

		jQuery("#bayar_pembayaran").val('');
		$$('#popup-pembayaran-td-client_nama').html(client_nama + ', PT');
		$$('#popup-pembayaran-bank').html(getBankLabel(bank_id));
		$$(".bank_pembayaran").val(bank_id);
		$$('#popup-pembayaran-penjualan_grandtotal').html(number_format(penjualan_grandtotal) + ' ,-');
		$$('#popup-pembayaran-penjualan_jumlah_pembayaran').html(number_format(penjualan_jumlah_pembayaran) + ' ,-');
		$$('#popup-pembayaran-penjualan_kekurangan').html(number_format((penjualan_grandtotal + ongkir) - penjualan_jumlah_pembayaran) + ' ,-');
		$$('#popup-pembayaran-penjualan_status_pembayaran').html('<b>' + penjualan_status_pembayaran + '</b>');

		if (penjualan_status_pembayaran == 'Lunas') {
			$$('#popup-pembayaran-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue').addClass('card-color-blue');
			$$('#content_bayar1').css("background-color", "#133788");
			$$('#content_bayar2').css("background-color", "#133788");
			$$('#content_bayar3').css("background-color", "#133788");
			$$('#content_bayar4').css("background-color", "#133788");
			$$('#content_bayar5').css("background-color", "#133788");
			$$('#content_bayar6').css("background-color", "#133788");
			$$('#content_bayar7').css("background-color", "#133788");
			$$('#content_bayar8').css("background-color", "#133788");
			$$('#content_bayar9').css("background-color", "#133788");
			$$('#content_bayar10').css("background-color", "#133788");
		} else {
			$$('#popup-pembayaran-penjualan_status_pembayaran').removeClass('card-color-green').removeClass('card-color-blue').addClass('card-color-green');
		}
	}

	$$('#tanggal_pembayaran_choose').html(moment(penjualan_tanggal_choose).format('DD-MMM-YYYY'));

	if (number_format(pembayaran_1) != 0) {
		$$('#content_bayar2').show();
		$$('#pembayaran_1_dp_awal').val(number_format(pembayaran_1));
		$$('#popup-pembayaran-tgl1').html(moment(pembayaran1_tgl).format('DD-MMM-YYYY'));
		$$('#pembayaran_1_dp_awal').attr('readonly', true);
		$$('#pembayaran_1_dp_awal').prop("onclick", null).off("click");
		$$('#bank_1').val(bank_id);
	} else {
		$$('#pembayaran_1_dp_awal').val(number_format(0));
		$$('#content_bayar2').hide();
		$$('#popup-pembayaran-tgl1').html("");
		$$('#pembayaran_1_dp_awal').removeAttr("readonly");
		$$('#pembayaran_1_dp_awal').attr('onClick', 'emptyValue("pembayaran_1")');
		$$('#bank_1').val(bank_id);
	}
	if (number_format(pembayaran_2) != 0) {
		$$('#content_bayar3').show();
		$$('#pembayaran_2').val(number_format(pembayaran_2));
		$$('#popup-pembayaran-tgl2').html(moment(pembayaran2_tgl).format('DD-MMM-YYYY'));
		$$('#pembayaran_2').attr('readonly', true);
		$$('#pembayaran_2').prop("onclick", null).off("click");
		$$('#bank_2').val(bank_2);
	} else {
		$$('#pembayaran_2').val(number_format(0));
		$$('#content_bayar3').hide();
		$$('#popup-pembayaran-tgl2').html("");
		$$('#pembayaran_2').removeAttr("readonly");
		$$('#pembayaran_2').attr('onClick', 'emptyValue("pembayaran_2")');
		$$('#bank_2').val(bank_id);
	}
	if (number_format(pembayaran_3) != 0) {
		$$('#pembayaran_3').val(number_format(pembayaran_3));
		$$('#popup-pembayaran-tgl3').html(moment(pembayaran3_tgl).format('DD-MMM-YYYY'));
		$$('#pembayaran_3').attr('readonly', true);
		$$('#content_bayar4').show();
		$$('#pembayaran_3').prop("onclick", null).off("click");
		$$('#bank_3').val(bank_3);
	} else {
		$$('#pembayaran_3').val(number_format(0));
		$$('#content_bayar4').hide();
		$$('#popup-pembayaran-tgl3').html("");
		$$('#pembayaran_3').removeAttr("readonly");
		$$('#pembayaran_3').attr('onClick', 'emptyValue("pembayaran_3")');
		$$('#bank_3').val(bank_id);
	}
	if (number_format(pembayaran_4) != 0) {
		$$('#pembayaran_4').val(number_format(pembayaran_4));
		$$('#popup-pembayaran-tgl4').html(moment(pembayaran4_tgl).format('DD-MMM-YYYY'));
		$$('#pembayaran_4').attr('readonly', true);
		$$('#content_bayar5').show();
		$$('#pembayaran_4').prop("onclick", null).off("click");
		$$('#bank_4').val(bank_4);
	} else {
		$$('#pembayaran_4').val(number_format(0));
		$$('#content_bayar5').hide();
		$$('#popup-pembayaran-tgl4').html("");
		$$('#pembayaran_4').removeAttr("readonly");
		$$('#pembayaran_4').attr('onClick', 'emptyValue("pembayaran_4")');
		$$('#bank_4').val(bank_id);
	}
	if (number_format(pembayaran_5) != 0) {
		$$('#pembayaran_5').val(number_format(pembayaran_5));
		$$('#pembayaran_5').attr('readonly', true);
		$$('#popup-pembayaran-tgl5').html(moment(pembayaran5_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar6').show();
		$$('#pembayaran_5').prop("onclick", null).off("click");
		$$('#bank_5').val(bank_5);
	} else {
		$$('#pembayaran_5').val(number_format(0));
		$$('#content_bayar6').hide();
		$$('#popup-pembayaran-tgl5').html("");
		$$('#pembayaran_5').removeAttr("readonly");
		$$('#pembayaran_5').attr('onClick', 'emptyValue("pembayaran_5")');
		$$('#bank_5').val(bank_id);
	}
	if (number_format(pembayaran_6) != 0) {
		$$('#pembayaran_6').val(number_format(pembayaran_6));
		$$('#pembayaran_6').attr('readonly', true);
		$$('#popup-pembayaran-tgl6').html(moment(pembayaran6_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar7').show();
		$$('#pembayaran_6').prop("onclick", null).off("click");
		$$('#bank_6').val(bank_6);
	} else {
		$$('#pembayaran_6').val(number_format(0));
		$$('#content_bayar7').hide();
		$$('#popup-pembayaran-tgl6').html("");
		$$('#pembayaran_6').removeAttr("readonly");
		$$('#pembayaran_6').attr('onClick', 'emptyValue("pembayaran_6")');
		$$('#bank_6').val(bank_id);
	}
	if (number_format(pembayaran_7) != 0) {
		$$('#pembayaran_7').val(number_format(pembayaran_7));
		$$('#pembayaran_7').attr('readonly', true);
		$$('#popup-pembayaran-tgl7').html(moment(pembayaran7_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar8').show();
		$$('#pembayaran_7').prop("onclick", null).off("click");
		$$('#bank_7').val(bank_7);
	} else {
		$$('#pembayaran_7').val(number_format(0));
		$$('#content_bayar8').hide();
		$$('#popup-pembayaran-tgl7').html("");
		$$('#pembayaran_7').removeAttr("readonly");
		$$('#pembayaran_7').attr('onClick', 'emptyValue("pembayaran_7")');
		$$('#bank_7').val(bank_id);
	}
	if (number_format(pembayaran_8) != 0) {
		$$('#pembayaran_8').val(number_format(pembayaran_8));
		$$('#pembayaran_8').attr('readonly', true);
		$$('#popup-pembayaran-tgl8').html(moment(pembayaran8_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar9').show();
		$$('#pembayaran_8').prop("onclick", null).off("click");
		$$('#bank_8').val(bank_8);
	} else {
		$$('#pembayaran_8').val(number_format(0));
		$$('#content_bayar9').hide();
		$$('#popup-pembayaran-tgl8').html("");
		$$('#pembayaran_8').removeAttr("readonly");
		$$('#pembayaran_8').attr('onClick', 'emptyValue("pembayaran_8")');
		$$('#bank_8').val(bank_id);
	}
	if (number_format(pembayaran_9) != 0) {
		$$('#pembayaran_9').val(number_format(pembayaran_9));
		$$('#pembayaran_9').attr('readonly', true);
		$$('#popup-pembayaran-tgl9').html(moment(pembayaran9_tgl).format('DD-MMM-YYYY'));
		$$('#content_bayar10').show();
		$$('#pembayaran_9').prop("onclick", null).off("click");
		$$('#bank_9').val(bank_9);
	} else {
		$$('#pembayaran_9').val(number_format(0));
		$$('#content_bayar10').hide();
		$$('#popup-pembayaran-tgl9').html("");
		$$('#pembayaran_9').removeAttr("readonly");
		$$('#pembayaran_9').attr('onClick', 'emptyValue("pembayaran_9")');
		$$('#bank_9').val(bank_id);
	}
	if (number_format(pembayaran_10) != 0) {
		$$('#pembayaran_10').val(number_format(pembayaran_10));
		$$('#pembayaran_10').prop("onclick", null).off("click");
		$$('#pembayaran_10').attr('readonly', true);
		$$('#popup-pembayaran-tgl10').html(moment(pembayaran10_tgl).format('DD-MMM-YYYY'));
	} else {
		$$('#pembayaran_10').val(number_format(0));
		$$('#popup-pembayaran-tgl10').html("");
		$$('#pembayaran_10').removeAttr("readonly");
		$$('#pembayaran_10').attr('onClick', 'emptyValue("pembayaran_10")');
	}

	$$('#pembayaran-penjualan_id').val(penjualan_id);
	$$('#pembayaran-client_id').val(client_id);
	setTimeout(function () {
		if (localStorage.getItem("username") != 'Stn') {
			$$('.hide_bank option[value="Tunai"]').remove();
		}
	}, 1000);
}

function prosesPembayaran() {
	if (jQuery('#proses_pembayaran_btn').is(':hidden')) {
		app.dialog.alert('Anda tidak memiliki akses untuk memproses pembayaran ini.');
		return;
	}

	if (!$$('#pembayaran_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Pembayaran Anda');
	} else {
		sisa_pembayaran = jQuery('#popup-pembayaran-penjualan_kekurangan').text();
		sudah_dibayar = jQuery('#popup-pembayaran-penjualan_jumlah_pembayaran').text();
		pembayaran_1 = jQuery('#pembayaran_1_dp_awal').val();
		pembayaran_2 = jQuery('#pembayaran_2').val();
		pembayaran_3 = jQuery('#pembayaran_3').val();
		pembayaran_4 = jQuery('#pembayaran_4').val();
		pembayaran_5 = jQuery('#pembayaran_5').val();
		pembayaran_6 = jQuery('#pembayaran_6').val();
		pembayaran_7 = jQuery('#pembayaran_7').val();
		pembayaran_8 = jQuery('#pembayaran_8').val();
		pembayaran_9 = jQuery('#pembayaran_9').val();
		pembayaran_10 = jQuery('#pembayaran_10').val();

		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/pembayaran",
			dataType: 'JSON',
			data: {
				pembayaran_1: pembayaran_1.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_2: pembayaran_2.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_3: pembayaran_3.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_4: pembayaran_4.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_5: pembayaran_5.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_6: pembayaran_6.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_7: pembayaran_7.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_8: pembayaran_8.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_9: pembayaran_9.replace(/\,/g, '').replace(/\ -/g, ''),
				pembayaran_10: pembayaran_10.replace(/\,/g, '').replace(/\ -/g, ''),
				bank_1_id: jQuery("#bank_1").val(),
				bank_2_id: jQuery("#bank_2").val(),
				bank_3_id: jQuery("#bank_3").val(),
				bank_4_id: jQuery("#bank_4").val(),
				bank_5_id: jQuery("#bank_5").val(),
				bank_6_id: jQuery("#bank_6").val(),
				bank_7_id: jQuery("#bank_7").val(),
				bank_8_id: jQuery("#bank_8").val(),
				bank_9_id: jQuery("#bank_9").val(),
				bank_10_id: jQuery("#bank_10").val(),
				karyawan_id: karyawan_id,
				client_id: jQuery("#pembayaran-client_id").val(),
				penjualan_id: jQuery("#pembayaran-penjualan_id").val(),
				sisa_pembayaran: sisa_pembayaran.replace(/\,/g, '').replace(/\ -/g, ''),
				sudah_dibayar: sudah_dibayar.replace(/\,/g, '').replace(/\ -/g, '')
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				getPenjualanHeader(1);
				app.dialog.close();
				app.popup.close();
				$$('#pembayaran_field').empty();
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

function showAlertUrgent() {
	app.dialog.alert('Belum Memasuki Tgl Urgent Deadline');
}

function detailPenjualan(dt_record, penjualan_id, client_cp, client_cp_posisi, client_id, client_kota, client_nama, client_telp, jenis_penjualan, karyawan_id, karyawan_nama, penjualan_global_diskon, penjualan_grandtotal, penjualan_id, penjualan_jumlah_pembayaran, penjualan_keterangan, penjualan_status, penjualan_status_pembayaran, penjualan_tanggal, penjualan_tanggal_kirim, penjualan_total, penjualan_void_keterangan, penjualan_total_qty, tgl_cs_deadline, lokasi_pabrik, wilayah, type_page) {
	openPopupDetailSales();
	var detail_cs = '';
	var detail_cs_button = '';

	detail_cs += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
	detail_cs += '<tbody>';
	detail_cs += ' <tr>';
	detail_cs += '   <td colspan="1" class="label-cell text-align-center" width="35%">Tgl Deadline</td>';
	detail_cs += '   <td colspan="2" class="label-cell text-align-center" width="74%">Tgl Urgent</td>';
	detail_cs += '</tr>';
	detail_cs += ' <tr class="">';
	if (tgl_cs_deadline != 'null' && tgl_cs_deadline != null) {
		var tgl_cs = moment(tgl_cs_deadline).format('DD-MMM-YYYY');
	} else {
		var tgl_cs = '-';
	}
	detail_cs += '  <td class="label-cell text-align-center" width="35%">' + moment(penjualan_tanggal_kirim).format('DD-MMM-YYYY') + '</td>';
	detail_cs += '  <td class="label-cell text-align-center" width="37%">' + tgl_cs + '</td>';
	detail_cs += ' </tr>';
	detail_cs += '</tbody>';
	detail_cs += '</table>';
	$$('#detail_cs').html(detail_cs);


	const firstDate = new Date(moment().format('YYYY, MM, DD'));
	const secondDate = new Date(moment(penjualan_tanggal_kirim).format('YYYY-MM-DD'));

	if (tgl_cs_deadline != 'null' && tgl_cs_deadline != null) {
		detail_cs_button += '<center>';
		detail_cs_button += '	<i onclick="updateUrgent(\'' + penjualan_id + '\',\'' + type_page + '\');"';
		detail_cs_button += '  		class="card-color-red button-small col button text-bold" style="width:200px;">Cancel';
		detail_cs_button += '	</i>';
		detail_cs_button += '</center>';
	} else {
		detail_cs_button += '<center>';
		if (firstDate >= secondDate) {
			detail_cs_button += '<i onclick="updateUrgent(\'' + penjualan_id + '\',\'' + type_page + '\');"';
			detail_cs_button += '  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width:200px;">Urgent';
			detail_cs_button += '</i>';
		}
		detail_cs_button += ' </center>';
	}

	$$('#popup-detail-sales-page').val(type_page);

	$$('#detail_cs_button').html(detail_cs_button);

	var detail_sales_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-penjualan-detail-performa-manager",
		dataType: 'JSON',
		data: {
			karyawan_id: jQuery("#sales_id").val(),
			penjualan_id: penjualan_id,
			jenis_penjualan: jenis_penjualan
		},
		beforeSend: function () {
			$$('#detail_sales_data').html('');
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			$$('#popup-penjualan-nospk').html('' + moment(dt_record).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));
			$$('#popup-penjualan-client_nama_header').html(client_nama + ', PT');
			$$('#popup-penjualan-td-client_nama').html(client_nama + ', PT');
			$$('#popup-penjualan-client_person').html(client_cp);
			$$('#popup-penjualan-client_posisi').html(client_cp_posisi);
			$$('#popup-penjualan-client_telpon').html(client_telp);
			$$('#popup-penjualan-karyawan_nama').html(karyawan_nama);
			$$('#popup-penjualan-lokasi_pabrik').html(lokasi_pabrik);
			$$('#popup-penjualan-wilayah').html(wilayah);
			$$('#popup-penjualan-penjualan_tanggal').html(moment(penjualan_tanggal).format('DD-MMM-YYYY'));
			$$('#popup-penjualan-penjualan_selesai').html(moment(penjualan_tanggal_kirim).format('DD-MMM-YYYY'));
			$$('#popup-penjualan-penjualan_jumlah').html(penjualan_total_qty);
			$$('#popup-penjualan-penjualan_grandtotal').html(number_format(penjualan_grandtotal) + ' ,-');
			$$('#popup-penjualan-penjualan_kekurangan').html(number_format(penjualan_grandtotal - penjualan_jumlah_pembayaran) + ' ,-');
			$$('#popup-penjualan-penjualan_jumlah_pembayaran').html(number_format(penjualan_jumlah_pembayaran) + ' ,-');
			$$('#popup-penjualan-penjualan_status_pembayaran').html(penjualan_status_pembayaran);


			if (data.data.length != 0) {
				jQuery.each(data.data, function (i, val) {


					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://indokoper.com/product_image_new';
					} else {
						var path_image = 'https://indokoper.com/performa_image';
					}

					var no = i + 1;
					detail_sales_data += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
					detail_sales_data += '<tbody>';
					detail_sales_data += ' <tr class="bg-dark-gray-medium">';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
					detail_sales_data += '   Produk #' + no + '';
					detail_sales_data += ' </td>';
					detail_sales_data += '</tr>';
					detail_sales_data += ' <tr>';
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="35%">' + val.penjualan_jenis + '<br><img src="' + path_image + '/' + val.gambar + '" width="96px"></td>';
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (val.keterangan != null) {
						detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="74%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br><font color="red">' + style + ' ' + val.keterangan + '</font></td>';
					} else {
						detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="74%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br><font color="red">-</font></td>';

					}
					detail_sales_data += '</tr>';
					detail_sales_data += ' <tr class="">';
					detail_sales_data += '  <td class="label-cell text-align-center" width="35%">Qty</td>';
					detail_sales_data += '  <td class="label-cell text-align-center" width="37%">Price</td>';
					detail_sales_data += '  <td class="label-cell text-align-center" width="37%">Total</td>';
					detail_sales_data += ' </tr>';
					detail_sales_data += ' <tr>';
					detail_sales_data += '  <td class="label-cell text-align-center" width="35%">' + val.penjualan_qty + '</td>';
					detail_sales_data += '  <td class="label-cell text-align-center" width="37%"">' + number_format(val.penjualan_harga) + ',-</td>';
					detail_sales_data += '  <td class="label-cell text-align-center" width="37%">' + number_format(val.penjualan_detail_grandtotal) + ',-</td>';
					detail_sales_data += '</tr>';
					if (val.foto_produksi_selesai != null) {
						detail_sales_data += ' <tr>';
						detail_sales_data += '  <td class="label-cell text-align-center" colspan="3" width="100%"><button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold"  onclick="zoom_view_foto_produksi(\'' + val.foto_produksi_selesai + '\');">Foto Produksi Selesai</button></td>';
						detail_sales_data += '</tr>';
					}
					detail_sales_data += '</tbody>';
					detail_sales_data += '</table><br>';
				});
				$$('#detail_sales_data').html(detail_sales_data);
			} else {
				$$('#detail_sales_data').html('<center><h3>Tidak Ada Data</h3></center>');
			}

			// buka popup
			if (window.app && app.popup && app.popup.open) app.popup.open('.detail-sales');
			else {
				jQuery('.detail-sales').show();
				jQuery('.detail-sales .popup-close').off('click').on('click', function () {
					jQuery('.detail-sales').hide();
				});
			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function detailPenjualanTolltip(penjualan_id) {
	detail_sales_data = '';
	if ($$('.detail_sales_data_tooltip_' + penjualan_id + '').hasClass("open-detail")) {
		$$('.detail_sales_data_tooltip_' + penjualan_id + '').html(detail_sales_data);
		$$('.detail_sales_data_tooltip_' + penjualan_id + '').removeClass('open-detail');
	} else {
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/get-penjualan-detail-performa-manager",
			dataType: 'JSON',
			data: {
				karyawan_id: jQuery("#sales_id").val(),
				penjualan_id: penjualan_id,
			},
			beforeSend: function () {
				$$('#detail_sales_data').html('');
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				detail_sales_data += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
				detail_sales_data += '<tbody>';
				jQuery.each(data.data, function (i, val) {
					var no = i + 1;

					if (val.status_produksi == "proses") {
						var table_color_status_tooltip = "card-color-green";
					} else if (val.status_produksi == "selesai") {
						var table_color_status_tooltip = "card-color-blue";
					}
					detail_sales_data += ' <tr>';
					detail_sales_data += '  <td class="label-cell text-align-left ' + table_color_status_tooltip + '" width="100%">' + val.penjualan_jenis + '</td>';
					detail_sales_data += '</tr>';

				});
				detail_sales_data += '</tbody>';
				detail_sales_data += '</table>';
				$$('.detail_sales_data_tooltip_' + penjualan_id + '').html(detail_sales_data);
				$$('.detail_sales_data_tooltip_' + penjualan_id + '').addClass('open-detail');



			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}

}

function downloadPointPdf() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/donwload-point-pdf-manager",
		dataType: 'JSON',
		data: {
			karyawan_id: jQuery("#sales_id").val(),
			month: jQuery('#point_bulan_sales').val(),
			year: jQuery('#point_year').val()
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var point_popup_pdf = '';
			point_popup_pdf += '<table width="100%" border="0">';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="6" style="font-weight:bold;" align="center">RINCIAN TRANSAKSI <br> </td>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="6"  align="center"><b>KOPERINDO</b><br>Industri Tas & Koper</td>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="6" align="center">www.koperindo.id';
			point_popup_pdf += '<hr>';
			point_popup_pdf += '</td>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="6"  align="center"><b>Point Sales | Bulan ' + $("#point_bulan_sales option:selected").text(); + '</b></td>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" width="5%">No</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" width="14%">Tgl</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="23%">SPK</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="28%">Perusahaan</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="18%">Nilai Jual</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="7%">%</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="10%">Jumlah</th>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '</thead>';
			point_popup_pdf += '<tbody>';

			var jumlah_point_sales = 0;
			var no = 0;
			$.each(data.data, function (i, item) {
				// ⭐⭐⭐ PERBAIKAN: HITUNG TOTAL PEMBAYARAN YANG SUDAH DIVALIDASI CS ⭐⭐⭐
				var total_pembayaran_validated = 0;
				if (item.valid_cs_1 == 1 && item.pembayaran_1 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_1);
				}
				if (item.valid_cs_2 == 1 && item.pembayaran_2 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_2);
				}
				if (item.valid_cs_3 == 1 && item.pembayaran_3 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_3);
				}
				if (item.valid_cs_4 == 1 && item.pembayaran_4 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_4);
				}
				if (item.valid_cs_5 == 1 && item.pembayaran_5 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_5);
				}
				if (item.valid_cs_6 == 1 && item.pembayaran_6 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_6);
				}
				if (item.valid_cs_7 == 1 && item.pembayaran_7 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_7);
				}
				if (item.valid_cs_8 == 1 && item.pembayaran_8 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_8);
				}
				if (item.valid_cs_9 == 1 && item.pembayaran_9 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_9);
				}
				if (item.valid_cs_10 == 1 && item.pembayaran_10 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_10);
				}
				// ⭐ PERBAIKAN: Hitung kurang bayar dari pembayaran yang sudah divalidasi
				var kurang_bayar = parseFloat(item.penjualan_grandtotal - total_pembayaran_validated);

				if (kurang_bayar <= 0) {
					no++
					jumlah_point_sales += (parseFloat(item.penjualan_grandtotal) * item.presentase_omset) / 100;
					point_popup_pdf += '<tr>';
					point_popup_pdf += '<td align="center" style=" padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.penjualan_tanggal).format('DD-MMM') + '</td>';
					point_popup_pdf += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.penjualan_tanggal).format('DD-MMM') + '</td>';
					point_popup_pdf += '<td align="left" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
					point_popup_pdf += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
					point_popup_pdf += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.penjualan_grandtotal) + '</td>';
					point_popup_pdf += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.presentase_omset + '</td>';
					point_popup_pdf += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format((parseFloat(item.penjualan_grandtotal) * item.presentase_omset) / 100) + '</td>';

					point_popup_pdf += '</tr>';
				}
			});

			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="4"  align="center"><b></b></td>';
			point_popup_pdf += '<td align="center"><b>Total</b></td>';
			point_popup_pdf += '<td   align="right"><b>' + number_format(jumlah_point_sales) + '</b></td>';
			point_popup_pdf += '</tr>';

			point_popup_pdf += '</tbody>';



			point_popup_pdf += '</table>';



			let options = {
				documentSize: 'A4',
				type: 'share',
				fileName: 'report_point_' + moment().format('M') + '.pdf'
			}

			pdf.fromData(point_popup_pdf, options)
				.then((stats) => console.log('status', stats))
				.catch((err) => console.err(err))
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	})
}

function selectMonthValues() {
	var m = moment.months();
	var month_now = moment().month();
	var n = 0;
	for (var i = 0; i < 12; i++) {
		n++
		if (i == month_now) {
			$('#point_bulan_sales').append($('<option selected />').val(n).html(m[i]));
		} else {
			$('#point_bulan_sales').append($('<option />').val(n).html(m[i]));
		}
	}
}

function getYearSalesAdmin() {
	let startYear = 2010;
	let endYear = new Date().getFullYear();
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('.point_years').append($('<option selected />').val(i).html(i));
		} else {
			$('.point_years').append($('<option />').val(i).html(i));
		}
	}
}

function donwloadPoint() {

	jQuery('#karyawan_nama_point').html(localStorage.getItem("sales_nama"));

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/donwload-point-manager",
		dataType: 'JSON',
		data: {
			karyawan_id: jQuery("#sales_id").val(),
			month: jQuery('#point_bulan_sales').val(),
			year: jQuery('#point_year').val()
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$('#point_popup').html("");
		},
		success: function (data) {
			app.dialog.close();
			var point_popup = '';
			var jumlah_point_sales = 0;
			var no = 0;

			if (data.foto != null) {
				var id_pembayaran_point = data.foto.id_pembayaran_point;
				if (data.foto.foto_point != null) {
					$('#foto_bukti_point').html("<button  onclick='getDataFotoPoint(\"" + id_pembayaran_point + "\");' data-popup='.upload-foto-point' style='background-color:blue; color:white;' class='popup-open text-add-colour-black-soft button-small col button text-bold'>LUNAS</button>");
				} else {
					$('#foto_bukti_point').html("<button  onclick='getDataFotoPoint(\"" + id_pembayaran_point + "\");' data-popup='.upload-foto-point' class='popup-open text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold'>LUNAS</button>");
				}
				// if (data.foto.foto_lunas != null) {
				// 	$('#foto_bukti_lunas_point').html("<button  onclick='getDataFotoPoint(\"" + id_pembayaran_point + "\");' data-popup='.upload-foto-lunas-point' style='background-color:blue; color:white;' class='popup-open text-add-colour-black-soft button-small col button text-bold'>LUNAS</button>");
				// } else {
				// 	$('#foto_bukti_lunas_point').html("<button  onclick='getDataFotoPoint(\"" + id_pembayaran_point + "\");' data-popup='.upload-foto-lunas-point' class='popup-open text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold'>LUNAS</button>");
				// }
			} else {
				$('#foto_bukti_point').html("<button  onclick='getDataFotoPoint(\"" + null + "\");' data-popup='.upload-foto-point' class='popup-open text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold'>LUNAS</button>");
				// $('#foto_bukti_lunas_point').html("<button  onclick='getDataFotoPoint(\"" + null + "\");' data-popup='.upload-foto-lunas-point' class='popup-open text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold'>LUNAS</button>");
			}

			$.each(data.data, function (i, item) {
				// ⭐⭐⭐ PERBAIKAN: HITUNG TOTAL PEMBAYARAN YANG SUDAH DIVALIDASI CS ⭐⭐⭐
				var total_pembayaran_validated = 0;
				if (item.valid_cs_1 == 1 && item.pembayaran_1 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_1);
				}
				if (item.valid_cs_2 == 1 && item.pembayaran_2 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_2);
				}
				if (item.valid_cs_3 == 1 && item.pembayaran_3 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_3);
				}
				if (item.valid_cs_4 == 1 && item.pembayaran_4 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_4);
				}
				if (item.valid_cs_5 == 1 && item.pembayaran_5 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_5);
				}
				if (item.valid_cs_6 == 1 && item.pembayaran_6 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_6);
				}
				if (item.valid_cs_7 == 1 && item.pembayaran_7 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_7);
				}
				if (item.valid_cs_8 == 1 && item.pembayaran_8 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_8);
				}
				if (item.valid_cs_9 == 1 && item.pembayaran_9 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_9);
				}
				if (item.valid_cs_10 == 1 && item.pembayaran_10 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_10);
				}
				// ⭐ PERBAIKAN: Hitung kurang bayar dari pembayaran yang sudah divalidasi
				var kurang_bayar = parseFloat(item.penjualan_grandtotal - total_pembayaran_validated);

				if (kurang_bayar <= 0) {
					no++
					jumlah_point_sales += (parseFloat(item.penjualan_grandtotal) * item.presentase_omset) / 100;
					point_popup += '<tr>';
					point_popup += '<td align="center" style="padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no + '</td>';
					point_popup += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.penjualan_tanggal).format('DD-MMM') + '</td>';
					point_popup += '<td align="left" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
					point_popup += '<td align="left"  class="popup-open" onclick="getPesananPoint(\'' + item.client_id + '\',\'' + item.client_nama + '\');" data-popup=".pesanan-perusahaan-point" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
					point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.penjualan_grandtotal) + '</td>';
					point_popup += '<td  style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

					point_popup += ' <select style="width:100%; text-align:right;" onchange="updatePointSales(\'' + item.penjualan_id + '\')" name="update_point_sales_' + item.penjualan_id + '" id="update_point_sales_' + item.penjualan_id + '">';
					if (item.presentase_omset == 0.5) {
						point_popup += ' <option value="0.5" selected>0.5%</option>';
					} else {
						point_popup += ' <option value="0.5">0.5%</option>';
					}
					if (item.presentase_omset == 1) {
						point_popup += ' <option value="1" selected>1%</option>';
					} else {
						point_popup += ' <option value="1">1%</option>';
					}
					if (item.presentase_omset == 2) {
						point_popup += '  <option value="2" selected>2%</option>';
					} else {
						point_popup += '  <option value="2">2%</option>';
					}

					point_popup += '  </select>';
					point_popup += '</td>';
					point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format((parseFloat(item.penjualan_grandtotal) * item.presentase_omset) / 100) + '</td>';

					point_popup += '<td  style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
					if (item.point_valid_manager == 1) {
						point_popup += '   <button  style="background-color:blue; color:white;" class="text-add-colour-black-soft button-small col button text-bold"  onclick="validPointSales(\'' + item.penjualan_id + '\',0);">Valid</button>';
					} else {
						point_popup += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"  onclick="validPointSales(\'' + item.penjualan_id + '\',1);">Belum Valid</button>';
					}
					point_popup += '</td>';
					point_popup += '</tr>';
				}
			});

			point_popup += '<tr>';
			point_popup += '<td align="right" style="border-bottom:1px solid gray; border-left:1px solid gray; padding:5px;" colspan="6"  align="center"><b>Total</b></td>';
			point_popup += '<td style="border-bottom:1px solid gray; border-right:1px solid gray;"   align="right"><b>' + number_format(jumlah_point_sales) + '</b></td>';
			point_popup += '</tr>';


			$('#point_popup').html(point_popup);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function validPointSales(penjualan_id, values) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/valid-point-manager",
		dataType: 'JSON',
		data: {
			values: values,
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			if (values == 1) {
				app.dialog.alert('Berhasil Validasi Point Sales', function () {
					donwloadPoint();
				});
			} else {
				app.dialog.alert('Berhasil Gagalkan Validasi Point Sales', function () {
					donwloadPoint();
				});
			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	})
}

function updatePointSales(penjualan_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/update-point-sales-manager",
		dataType: 'JSON',
		data: {
			presentase: jQuery('#update_point_sales_' + penjualan_id + '').val(),
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			pointSales();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	})
}

function dateRangeDeclarationPenjualan() {
	calendarRangePenjualan = app.calendar.create({
		inputEl: '#range-penjualan',
		rangePicker: true,
		dateFormat: 'dd-mm-yyyy',
		closeOnSelect: true,
		rangePickerMinDays: 7,
		on: {
			close: function () {
				getPenjualanHeader(1);
			}
		}
	});
}

var delayTimer;
function doSearchByPerusahaanPenjualan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		tampilDataManager();
	}, 1000);
}

function doSearchByPerusahaanProforma(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getPerformaHeaderPenjualan(1);
	}, 1000);
}

function suratJalanPenjualan(penjualan_id) {
	var suratJalanPenjualanVal = "";
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-penjualan-surat-jalan-manager",
		dataType: 'JSON',
		data: {
			karyawan_id: jQuery("#sales_id").val(),
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
		},
		success: function (data) {
			$.each(data.data, function (i, item) {

				if (item.tgl_kirim1 == "" || item.tgl_kirim1 == null) {
					var tgl_kirim1 = "-";
				} else {
					var tgl_kirim1 = moment(item.tgl_kirim1).format('DD-MMM');

				}

				if (item.tgl_kirim2 == "" || item.tgl_kirim2 == null) {
					var tgl_kirim2 = "-";
				} else {
					var tgl_kirim2 = moment(item.tgl_kirim2).format('DD-MMM');
				}

				if (item.tgl_kirim3 == "" || item.tgl_kirim3 == null) {
					var tgl_kirim3 = "-";
				} else {
					var tgl_kirim3 = moment(item.tgl_kirim3).format('DD-MMM');
				}

				if (item.tgl_kirim4 == "" || item.tgl_kirim4 == null) {
					var tgl_kirim4 = "-";
				} else {
					var tgl_kirim4 = moment(item.tgl_kirim4).format('DD-MMM');
				}

				if (item.tgl_kirim5 == "" || item.tgl_kirim5 == null) {
					var tgl_kirim5 = "-";
				} else {
					var tgl_kirim5 = moment(item.tgl_kirim1).format('DD-MMM');
				}

				if (item.pengiriman_1 == "" || item.pengiriman_1 == null) {
					var pengiriman_1 = "-";
				} else {
					var pengiriman_1 = item.pengiriman_1;
				}

				if (item.pengiriman_2 == "" || item.pengiriman_2 == null) {
					var pengiriman_2 = "-";
				} else {
					var pengiriman_2 = item.pengiriman_2;
				}

				if (item.pengiriman_3 == "" || item.pengiriman_3 == null) {
					var pengiriman_3 = "-";
				} else {
					var pengiriman_3 = item.pengiriman_3;
				}

				if (item.pengiriman_4 == "" || item.pengiriman_4 == null) {
					var pengiriman_4 = "-";
				} else {
					var pengiriman_4 = item.pengiriman_4;
				}

				if (item.pengiriman_5 == "" || item.pengiriman_5 == null) {
					var pengiriman_5 = "-";
				} else {
					var pengiriman_5 = item.pengiriman_5;
				}


				if (item.surat_jalan1 == "" || item.surat_jalan1 == null) {
					var surat_jalan1 = "-";
				} else {
					var surat_jalan1 = item.surat_jalan1;
				}

				if (item.surat_jalan2 == "" || item.surat_jalan2 == null) {
					var surat_jalan2 = "-";
				} else {
					var surat_jalan2 = item.surat_jalan2;
				}

				if (item.surat_jalan3 == "" || item.surat_jalan3 == null) {
					var surat_jalan3 = "-";
				} else {
					var surat_jalan3 = item.surat_jalan3;
				}

				if (item.surat_jalan4 == "" || item.surat_jalan4 == null) {
					var surat_jalan4 = "-";
				} else {
					var surat_jalan4 = item.surat_jalan4;
				}

				if (item.surat_jalan5 == "" || item.surat_jalan5 == null) {
					var surat_jalan5 = "-";
				} else {
					var surat_jalan5 = item.surat_jalan5;
				}


				suratJalanPenjualanVal += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;">';
				suratJalanPenjualanVal += '<td colspan="6" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">Type : ' + item.penjualan_jenis + '</td>';
				suratJalanPenjualanVal += '</tr>';
				suratJalanPenjualanVal += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;">';
				suratJalanPenjualanVal += '<td width="25%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">Tanggal</td>';
				suratJalanPenjualanVal += '<td width="15%" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + tgl_kirim1 + '</td>';
				suratJalanPenjualanVal += '<td width="15%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + tgl_kirim2 + '</td>';
				suratJalanPenjualanVal += '<td width="15%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + tgl_kirim3 + '</td>';
				suratJalanPenjualanVal += '<td width="15%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + tgl_kirim4 + '</td>';
				suratJalanPenjualanVal += '<td width="15%" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + tgl_kirim5 + '</td>';
				suratJalanPenjualanVal += '</tr>';
				suratJalanPenjualanVal += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;">';
				suratJalanPenjualanVal += '<td width="25%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">Surat Jalan</td>';
				suratJalanPenjualanVal += '<td width="15%" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + surat_jalan1 + '</td>';
				suratJalanPenjualanVal += '<td width="15%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + surat_jalan2 + '</td>';
				suratJalanPenjualanVal += '<td width="15%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + surat_jalan3 + '</td>';
				suratJalanPenjualanVal += '<td width="15%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + surat_jalan4 + '</td>';
				suratJalanPenjualanVal += '<td width="15%" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + surat_jalan5 + '</td>';
				suratJalanPenjualanVal += '</tr>';
				suratJalanPenjualanVal += '<tr  style="border-right:1px solid gray; border-bottom:1px solid gray;">';
				suratJalanPenjualanVal += '<td width="25%" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">Jumlah</td>';
				suratJalanPenjualanVal += '<td width="15%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + pengiriman_1 + '</td>';
				suratJalanPenjualanVal += '<td width="15%" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + pengiriman_2 + '</td>';
				suratJalanPenjualanVal += '<td width="15%" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + pengiriman_3 + '</td>';
				suratJalanPenjualanVal += '<td width="15%" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + pengiriman_4 + '</td>';
				suratJalanPenjualanVal += '<td width="15%"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell" align="center">' + pengiriman_5 + '</td>';
				suratJalanPenjualanVal += '</tr>';
			});



			$$('#surat_jalan_penjualan').html(suratJalanPenjualanVal);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});

}

function arsipSalesLocalstorage() {
	if (localStorage.getItem('arsip') == 'aktif') {
		$$("#arsipBtn").css("color", "white");
		localStorage.removeItem('arsip');
	} else if (localStorage.getItem('arsip') == '' || localStorage.getItem('arsip') == null) {
		$$("#arsipBtn").css("color", "red");
		localStorage.setItem('arsip', 'aktif')
	}
	tampilDataManager();
}

function getPenjualanHeader(page) {

	if (page == '' || page == null) {
		var page_now = 1;

	} else {
		var page_now = page;
	}

	var user_id = ""
	if (jQuery("#sales_id").val() == "" || jQuery("#sales_id").val() == null) {
		user_id = 'empty';
	} else {
		user_id = jQuery("#sales_id").val();
	}

	if (jQuery('#range-penjualan').val() == '' || jQuery('#range-penjualan').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangePenjualan.value[0]);
		var enddate_new = new Date(calendarRangePenjualan.value[1]);
		var startdate = moment(startdate_new).format('YYYY-MM-DD');
		var enddate = moment(enddate_new).format('YYYY-MM-DD');
	}

	var year_now = new Date().getFullYear();
	if (jQuery('#transaksi_penjualan_years option:selected').val() == null) {
		var year = year_now;
	} else if (jQuery('#transaksi_penjualan_years option:selected').val() == 'all') {
		var year = 'empty';
	} else {
		var year = jQuery('#transaksi_penjualan_years option:selected').val();
	}

	var month_now = new Date().getMonth() + 1;
	if (jQuery('#transaksi_penjualan_bulan option:selected').val() == null) {
		var month = month_now;
	} else if (jQuery('#transaksi_penjualan_bulan option:selected').val() == 'all') {
		var month = 'empty';
	} else {
		var month = jQuery('#transaksi_penjualan_bulan option:selected').val();
	}

	if (jQuery('#perusahaan_penjualan_filter').val() == '' || jQuery('#perusahaan_penjualan_filter').val() == null) {
		perusahaan_penjualan_value = "empty";
	} else {
		perusahaan_penjualan_value = jQuery('#perusahaan_penjualan_filter').val();
	}
	var penjualan_value = "";
	var pagination_button = "";

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-penjualan-header-cs?page=" + page_now + "",
		dataType: 'JSON',
		data: {
			karyawan_id: user_id,
			startdate: startdate,
			enddate: enddate,
			month: month,
			year: year,
			perusahaan_penjualan_value: perusahaan_penjualan_value,
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
			version_app: localStorage.getItem("versioon_app_now")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			no = 1;
			for (i = 0; i < data.data.last_page; i++) {
				no = i + 1;
				pagination_button += '<i onclick="getPenjualanHeader(' + no + ');"  style="border-radius:2px; width:40px; height:40px; background-color:#4c5269; padding-left:8px; padding-right:8px; margin:2px;">' + no + '</i>';
			}
			var no_empty = 0;
			var no_arsip = 0;
			var bagi_entertain = 0;
			var entertain = 0;
			var nominal_entertain = 0;
			var btn_entertain = '';
			var bantuan_cabang = '';
			var warna_button_packing = '';
			$.each(data.data.data, function (i, item) {
				if (item.penjualan_total_qty_detail == 0) {
					var sisa_kirim_sj = parseFloat(item.penjualan_total_qty) - parseFloat(data.surat_jalan_count[item.penjualan_id]);
				} else {
					var sisa_kirim_sj = parseFloat(item.penjualan_total_qty_detail) - parseFloat(data.surat_jalan_count[item.penjualan_id]);
				}
				// ⭐⭐⭐ PERBAIKAN: HITUNG TOTAL PEMBAYARAN YANG SUDAH DIVALIDASI CS ⭐⭐⭐
				var total_pembayaran_validated = 0;
				if (item.valid_cs_1 == 1 && item.pembayaran_1 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_1);
				}
				if (item.valid_cs_2 == 1 && item.pembayaran_2 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_2);
				}
				if (item.valid_cs_3 == 1 && item.pembayaran_3 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_3);
				}
				if (item.valid_cs_4 == 1 && item.pembayaran_4 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_4);
				}
				if (item.valid_cs_5 == 1 && item.pembayaran_5 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_5);
				}
				if (item.valid_cs_6 == 1 && item.pembayaran_6 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_6);
				}
				if (item.valid_cs_7 == 1 && item.pembayaran_7 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_7);
				}
				if (item.valid_cs_8 == 1 && item.pembayaran_8 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_8);
				}
				if (item.valid_cs_9 == 1 && item.pembayaran_9 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_9);
				}
				if (item.valid_cs_10 == 1 && item.pembayaran_10 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_10);
				}

				if (localStorage.getItem('arsip') == null || localStorage.getItem('arsip') == '') {
					var arsip_value = "empty";
				} else {
					var arsip_value = localStorage.getItem('arsip');
				}

				// bagi_entertain = parseInt(item.penjualan_grandtotal) / parseInt(50000000);
				// nominal_entertain = parseInt(Math.floor(bagi_entertain)) * parseInt(200000);

				// if (bagi_entertain > 0) {
				// 	entertain = parseFloat(nominal_entertain) - parseFloat(item.fee_total);
				// 	if (item.fee_total != 0) {
				// 		if (entertain != 0 || nominal_entertain == item.fee_total) {
				// 			btn_entertain = "btn-color-blueWhite";
				// 		} else {
				// 			btn_entertain = "bg-dark-gray-young text-add-colour-black-soft";
				// 		}
				// 	} else {
				// 		btn_entertain = "bg-dark-gray-young text-add-colour-black-soft";
				// 	}
				// } else {
				// 	entertain = 0;
				// 	btn_entertain = "bg-dark-gray-young text-add-colour-black-soft";
				// }

				entertain = parseInt(item.penjualan_grandtotal) * 0.002;
				btn_entertain = "btn-color-blueWhite";

				if (item.bantuan_cabang != null) {
					bantuan_cabang = item.bantuan_cabang;
				} else {
					bantuan_cabang = '-';
				}

				var color_urgent_blink = '';
				var date_urgent = '';
				var btn_color_urgent_blink = '';
				var onclick_urgent = '';
				var popup_urgent = '';
				var class_urgent = '';
				if (item.tgl_cs_deadline != null) {
					color_urgent_blink = 'announcement';
					date_urgent = moment(item.tgl_cs_deadline).format('DD-MMM');
					btn_color_urgent_blink = 'card-color-red';
					onclick_urgent = 'onclick="detailPenjualan(\'' + item.dt_record + '\',\'' + item.penjualan_id + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.karyawan_nama + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.tgl_cs_deadline + '\',\'' + item.lokasi_pabrik + '\',\'' + item.nama_kota + '\',0);"';
				} else {
					color_urgent_blink = '';
					date_urgent = moment(item.penjualan_tanggal_kirim).format('DD-MMM');
					btn_color_urgent_blink = 'bg-dark-gray-young text-add-colour-black-soft';
					// onclick_urgent = 'onclick="updateUrgent(\'' + item.penjualan_id + '\');"';
					onclick_urgent = 'onclick="detailPenjualan(\'' + item.dt_record + '\',\'' + item.penjualan_id + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.karyawan_nama + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.tgl_cs_deadline + '\',\'' + item.lokasi_pabrik + '\',\'' + item.nama_kota + '\',0);"';
				}

				if (arsip_value == 'empty') {

					$("#kolom-kirim-hide").show();
					// ⭐ PERBAIKAN: Hitung sisa dari pembayaran yang sudah divalidasi
					var sisa = (item.penjualan_grandtotal) - total_pembayaran_validated;
					var sisa_fix = number_format(parseFloat((item.penjualan_grandtotal) - total_pembayaran_validated));

					if (sisa <= 0) {
						var sisa_value = sisa_fix.toString().replace(/\-/g, '+');
					} else {
						var sisa_value = sisa_fix;
					}

					if (sisa_kirim_sj > 0 || sisa > 0) {
						no_empty++
						// ⭐ PERBAIKAN: Cek lunas berdasarkan pembayaran yang sudah divalidasi
						if (parseFloat(item.penjualan_grandtotal - total_pembayaran_validated) <= 0) {
							var color_class = "card-color-blue";
						} else {
							var color_class = "card-blank";
						}

						if (item.status_produksi == "selesai") {
							var table_color_status_produksi = "card-color-blue";
						} else if (item.status_produksi == "proses") {
							var table_color_status_produksi = "card-color-green";
						}



						if (item.penjualan_total_qty_detail == 0) {
							var button_color_surat_jalan = "";
							var popup = "";
						} else {
							if (item.penjualan_total_qty_detail - item.penjualan_total_kirim > 0) {
								var button_color_surat_jalan = "";
								var popup = "popup-open";
							} else {
								var button_color_surat_jalan = "navy";
								var popup = "popup-open";
							}
						}


						const oneDay = 24 * 60 * 60 * 1000;
						const firstDate = new Date(moment().format('YYYY, MM, DD'));
						const secondDate = new Date(moment(item.penjualan_tanggal_kirim).format('YYYY-MM-DD'));

						const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
						if (item.tgl_cs_deadline != null) {
							var table_color_fix = "card-color-red";
						} else {
							if (firstDate >= secondDate) {
								if (sisa_kirim_sj <= 0) {
									var table_color_fix = "card-color-blue";
								} else {
									var table_color_fix = "card-color-red";
								}
							} else {
								if (diffDays >= 3 && diffDays <= 5) {
									if (sisa_kirim_sj <= 0) {
										var table_color_fix = "card-color-blue";
									} else {
										var table_color_fix = "card-color-orange";
									}
								}
								else if (diffDays >= 0 && diffDays <= 2) {
									if (sisa_kirim_sj <= 0) {
										var table_color_fix = "card-color-blue";
									} else {
										var table_color_fix = "card-color-red";
									}
								}
							}
						}




						// ⭐⭐⭐ PERBAIKAN: HITUNG TOTAL PEMBAYARAN YANG SUDAH DIVALIDASI CS ⭐⭐⭐
						var total_pembayaran_validated = 0;

						// Cek setiap pembayaran (1-10) apakah sudah divalidasi
						if (item.valid_cs_1 == 1 && item.pembayaran_1 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_1);
						}
						if (item.valid_cs_2 == 1 && item.pembayaran_2 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_2);
						}
						if (item.valid_cs_3 == 1 && item.pembayaran_3 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_3);
						}
						if (item.valid_cs_4 == 1 && item.pembayaran_4 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_4);
						}
						if (item.valid_cs_5 == 1 && item.pembayaran_5 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_5);
						}
						if (item.valid_cs_6 == 1 && item.pembayaran_6 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_6);
						}
						if (item.valid_cs_7 == 1 && item.pembayaran_7 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_7);
						}
						if (item.valid_cs_8 == 1 && item.pembayaran_8 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_8);
						}
						if (item.valid_cs_9 == 1 && item.pembayaran_9 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_9);
						}
						if (item.valid_cs_10 == 1 && item.pembayaran_10 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_10);
						}

						// ⭐⭐⭐ PERBAIKAN: LOGIKA BUTTON SHIPMENT (menggunakan total_pembayaran_validated) ⭐⭐⭐
						var btn_alamat_kirim_penjualan = "";
						var btn_shipment_text = "Shipment";
						var sisa_bayar = parseFloat(item.penjualan_grandtotal - total_pembayaran_validated);

						// Cek apakah ada pembayaran yang belum divalidasi
						var has_pending_pembayaran = (data.log_pembayaran && data.log_pembayaran[item.penjualan_id] && data.log_pembayaran[item.penjualan_id].length > 0);

						// PRIORITAS 1: Cek apakah SJ sudah lengkap (semua barang sudah dikirim)
						if (sisa_kirim_sj <= 0) {
							// 🟦 BIRU - Semua barang sudah dikirim (SJ lengkap)
							btn_alamat_kirim_penjualan = "btn-color-blueWhite";
						}
						// PRIORITAS 2: Cek apakah belum ada alamat
						else if (item.alamat_kirim_penjualan == null) {
							// ⚫ ABU-ABU - Belum ada alamat (lunas atau belum)
							btn_alamat_kirim_penjualan = "bg-dark-gray-young text-add-colour-black-soft";
						}
						// PRIORITAS 3: Sudah ada alamat
						else {
							// PERBAIKAN: Dianggap lunas HANYA jika sisa_bayar <= 0 DAN tidak ada pembayaran pending
							if (sisa_bayar <= 0 && !has_pending_pembayaran) {
								// 🟢 HIJAU - Sudah lunas (tidak perlu approval)
								btn_alamat_kirim_penjualan = "btn-color-greenWhite";
							} else {
								// Belum lunas atau ada pembayaran pending - cek status approval
								if (item.shipment_status == 'approved') {
									// 🟢 HIJAU - Approved (boleh kirim)
									btn_alamat_kirim_penjualan = "btn-color-greenWhite";
								} else if (item.shipment_status == 'requested') {
									// 🟠 ORANGE - Requested (menunggu approval CS)
									btn_alamat_kirim_penjualan = "btn-color-orangeWhite";
								} else if (item.shipment_status == 'rejected') {
									// 🔴 MERAH - Rejected (ditolak)
									btn_alamat_kirim_penjualan = "btn-color-redWhite";
								} else {
									// 🟠 ORANGE - Belum ada status (baru input alamat, belum request)
									btn_alamat_kirim_penjualan = "btn-color-orangeWhite";
								}
							}
						}

						// kasi warna SPK
						if (item.penjualan_total_qty_detail != 0) {
							var kurang_kirim = item.penjualan_total_qty_detail - item.penjualan_total_kirim;
						} else {
							var kurang_kirim = 999;
						}

						// ⭐ PERBAIKAN: Hitung kurang bayar dari pembayaran yang sudah divalidasi
						var kurang_bayar = parseFloat(item.penjualan_grandtotal - total_pembayaran_validated);
						var produksi_status_now = item.produksi_selesai;
						var invoice_fee = moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

						//if (produksi_status_now == 'selesai' && kurang_kirim <= 0 && kurang_bayar <= 0) {

						var color_spk_produksi = "";
						if (item.produksi_selesai == 'selesai') {
							color_spk_produksi = "card-color-blue";
						}

						var is_valid_cs = (item.valid_cs == 1) ? true : false;

						penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
						penjualan_value += '<td style="border-bottom:1px solid gray;" class="label-cell">';
						if (is_valid_cs) {
						penjualan_value += '   <button  class="' + btn_alamat_kirim_penjualan + ' button-small col button popup-open text-bold" data-popup=".input-alamat-kirim" onclick="kirimAlamat(\'' + item.penjualan_id + '\');">' + btn_shipment_text + '</button>';
						}
						penjualan_value += '</td>';
						penjualan_value += '<td class="' + table_color_fix + ' ' + color_urgent_blink + '" style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + date_urgent + '</td>';

						if (kurang_kirim <= 0) {

							penjualan_value += '  <td class="' + color_spk_produksi + '" style="background-color:#000080; border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';

						} else {
							penjualan_value += '  <td class="' + color_spk_produksi + '" style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';

						}
						//end


						var color_spk_produksi = "";
						if (item.produksi_selesai == 'selesai') {
							penjualan_value += '<td align="left" onclick="detailPenjualanTolltip(\'' + item.penjualan_id + '\');"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; background-color:#000080;" >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';

						} else {
							penjualan_value += '<td align="left" onclick="detailPenjualanTolltip(\'' + item.penjualan_id + '\');"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';

						}
						penjualan_value += '</td>';
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; " >' + item.client_telp + '</td>';
						var tipe_grosir
						var style_xtra = '';
						if (item.extra == '1') {
							tipe_grosir = "Xtra"
							style_xtra = '';
						} else {
							tipe_grosir = "Polo"
							style_xtra = 'red';
						}

						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;color:' + style_xtra + ';" class="label-cell ' + color_class + '">' + tipe_grosir + '</td>';
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + item.karyawan_nama + '</td>';
						var lokasi = '';

						var pabrik = '';
						if (item.lokasi_pabrik != null && item.lokasi_pabrik != 'Pusat') {
							pabrik = 'Jakarta';
						} else {
							pabrik = 'Surabaya';
						}
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + pabrik + '</td>';
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + item.nama_kota + '</td>';
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + item.type_penjualan + '</td>';
						penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + number_format(parseInt(item.penjualan_grandtotal)) + '</td>';
						penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + number_format(total_pembayaran_validated) + '</td>';
						penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + sisa_value + '</td>';


						if (sisa_kirim_sj <= 0) {
							var color_btn_sj_id = "btn-color-blueWhite";
						} else if (item.penjualan_total_kirim == null) {
							var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
						} else if (sisa_kirim_sj > 0) {
							var color_btn_sj_id = "btn-color-greenWhite";
						}

						// if (sisa <= 0) {
						// 	var color_btn_byr = "btn-color-blueWhite";
						// } else {
						// 	var color_btn_byr = "bg-dark-gray-young text-add-colour-black-soft";
						// }

						console.log("button pembayaran - penjualan_id: " + item.penjualan_id + ", total_pembayaran_validated: " + total_pembayaran_validated + ", penjualan_grandtotal: " + item.penjualan_grandtotal + ", sisa: " + sisa + ", has_pending_pembayaran: " + has_pending_pembayaran + ", shipment_status: " + item.shipment_status + ", hasOngkirPending: " + (data.log_pembayaran && data.log_pembayaran[item.penjualan_id] && data.log_pembayaran[item.penjualan_id].length > 0) + ", hasPendingPembayaran: " + has_pending_pembayaran);
						if (total_pembayaran_validated == 0) {
							// 🟡 KUNING - Belum ada pembayaran sama sekali yang tervalidasi
							var color_btn_byr = "card-color-yellow-text-white";
						} else if (sisa <= 0) {
							var hasOngkirPending = (item.status_ongkir === 'pending');
							var hasPendingPembayaran = (data.log_pembayaran && data.log_pembayaran[item.penjualan_id] && data.log_pembayaran[item.penjualan_id].length > 0);

							if (hasPendingPembayaran || hasOngkirPending) {
								// 🟢 HIJAU - Lunas tapi ada pembayaran/ongkir pending validasi
								var color_btn_byr = "btn-color-greenWhite";
							} else {
								// 🔵 BIRU - Benar-benar lunas sempurna
								var color_btn_byr = "btn-color-blueWhite";
							}
						} else if (sisa > 0 && item.pembayaran1_tgl != null) {
							// 🟢 HIJAU - Ada cicilan tapi belum lunas
							var color_btn_byr = "btn-color-greenWhite";
						} else if (data.log_pembayaran_rejected && data.log_pembayaran_rejected[item.penjualan_id] && data.log_pembayaran_rejected[item.penjualan_id].length > 0) {
							// 🔴 MERAH - Ada pembayaran yang ditolak
							var color_btn_byr = "btn-color-redWhite";
						} else {
							// ⚫ ABU-ABU - Default
							var color_btn_byr = "bg-dark-gray-young text-add-colour-black-soft";
						}


						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						if (is_valid_cs) {
							penjualan_value += '   <button  class="' + btn_color_urgent_blink + ' button-small col button text-bold popup-open" data-popup=".detail-sales" ' + onclick_urgent + '>Urgent</button>';
						}
						penjualan_value += '</td>';
						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						if (is_valid_cs) {
							penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-spkpo-popup" onclick="spkPo(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\');">Spk PO</button>';
						}
						penjualan_value += '</td>';
						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						if (is_valid_cs) {
							penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" onclick="invoicePenjualan(\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + sisa_value + '\',\'' + item.extra + '\',\'' + (item.packing || '') + '\');">Invoice</button>';
						}
						penjualan_value += '</td>';
						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						if (is_valid_cs) {
							penjualan_value += '   <button class="' + color_btn_byr + ' button-small col button popup-open text-bold" data-popup=".detail-pembayaran" onclick="detailPembayaran(\'' + item.dt_record + '\',\'' + item.penjualan_tanggal + '\',\'' + item.performa_id_relation + '\',\'' + item.bank_1_id + '\',\'' + item.bank_2_id + '\',\'' + item.bank_3_id + '\',\'' + item.bank_4_id + '\',\'' + item.bank_5_id + '\',\'' + item.bank_6_id + '\',\'' + item.bank_7_id + '\',\'' + item.bank_8_id + '\',\'' + item.bank_9_id + '\',\'' + item.bank_10_id + '\',\'' + item.pembayaran1_tgl + '\',\'' + item.pembayaran2_tgl + '\',\'' + item.pembayaran3_tgl + '\',\'' + item.pembayaran4_tgl + '\',\'' + item.pembayaran5_tgl + '\',\'' + item.pembayaran6_tgl + '\',\'' + item.pembayaran7_tgl + '\',\'' + item.pembayaran8_tgl + '\',\'' + item.pembayaran9_tgl + '\',\'' + item.pembayaran10_tgl + '\',\'' + item.bank + '\',\'' + item.pembayaran_1 + '\',\'' + item.pembayaran_2 + '\',\'' + item.pembayaran_3 + '\',\'' + item.pembayaran_4 + '\',\'' + item.pembayaran_5 + '\',\'' + item.pembayaran_6 + '\',\'' + item.pembayaran_7 + '\',\'' + item.pembayaran_8 + '\',\'' + item.pembayaran_9 + '\',\'' + item.pembayaran_10 + '\',\'' + item.client_nama + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_total_qty + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.client_id + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.ongkir + '\',\'' + item.karyawan_id + '\');">Bayar</button>';
						}
						penjualan_value += '</td>';
						if (data.surat_jalan_customer[item.penjualan_id].length > 0) {
							var color_btn_sjc_id = "btn-color-greenWhite";
						} else if (data.count_surat_jalan_customer[item.penjualan_id].length == data.count_performa[item.penjualan_id].length) {
							var color_btn_byr = "btn-color-blueWhite";
						} else {
							var color_btn_sjc_id = "bg-dark-gray-young text-add-colour-black-soft";
						}

						if (data.surat_jalan_customer[item.penjualan_id].length > 0) {
							penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							if (is_valid_cs) {
								penjualan_value += '  <button  class="' + color_btn_sjc_id + ' button-small col button ' + popup + ' text-bold popup-open"  data-popup=".produksi-sjc-foto-cabang" onclick="getSuratJalanListCustomer(\'' + item.penjualan_id + '\');">S.Jalan</button>';
							}
							penjualan_value += '</td>';
						} else {
							penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							if (is_valid_cs) {
								penjualan_value += '  <button  class="' + color_btn_sj_id + ' button-small col button ' + popup + ' text-bold popup-open"  data-popup=".surat-jalan-penjualan" onclick="getSuratJalanDetailPenjualan(\'' + item.dt_record + '\',\'' + item.client_nama + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_total_qty + '\');">S.Jalan</button>';
							}
							penjualan_value += '</td>';
						}

						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						if (is_valid_cs) {
							penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" onclick="fullReport(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + (item.packing || '') + '\');">Report</button>';
						}
						penjualan_value += '</td>';
						// if (item.valid_cs == 2) {
						// if (item.is_edit == 1) {
						// 	penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						// 	penjualan_value += '   <button  class="button-small card-color-red col button text-bold" >Edit</button>';
						// 	penjualan_value += '</td>';
						// } else {
						// 	penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						// 	penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".edit-penjualan" onclick="editPenjualan(\'' + item.penjualan_id + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.client_id + '\',\'' + item.karyawan_id + '\',\'' + item.client_nama + '\',\'' + item.performa_header_id + '\',\'' + item.customer_logo + '\',\'' + item.customer_logo_bordir + '\',\'' + item.customer_logo_tambahan + '\',\'' + item.keterangan_valid_cs + '\',\'' + item.extra + '\',\'' + item.grosir + '\');">Edit</button>';
						// 	penjualan_value += '</td>';
						// }
						//	penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						//	penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold"  onclick="SPK1(\'' + item.customer_logo + '\',\'' + item.customer_logo_tambahan + '\',\'' + item.no_spk + '\',\'' + item.kode_kota + '\',\'' + item.customer_logo_bordir + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\');">SPK</button>';
						//	penjualan_value += '</td>';
						// }
						penjualan_value += '</tr>';
					}
				} else {
					$("#kolom-kirim-hide").hide();
					// ⭐ PERBAIKAN: Hitung sisa dari pembayaran yang sudah divalidasi
					var sisa = item.penjualan_grandtotal - total_pembayaran_validated;
					var sisa_fix = number_format(parseFloat(item.penjualan_grandtotal - total_pembayaran_validated));
					if (sisa <= 0) {
						var sisa_value = sisa_fix.toString().replace(/\-/g, '+');
					} else {
						var sisa_value = sisa_fix;
					}
					if (sisa_kirim_sj <= 0 && sisa <= 0) {
						no_arsip++
						// ⭐ PERBAIKAN: Cek lunas berdasarkan pembayaran yang sudah divalidasi
						if (parseFloat(item.penjualan_grandtotal - total_pembayaran_validated) <= 0) {
							var color_class = "card-color-blue";
						} else {
							var color_class = "card-blank";
						}

						if (item.status_produksi == "selesai") {
							var table_color_status_produksi = "card-color-blue";
						} else if (item.status_produksi == "proses") {
							var table_color_status_produksi = "card-color-green";
						}



						if (item.penjualan_total_qty_detail == 0) {
							var button_color_surat_jalan = "";
							var popup = "";
						} else {
							if (item.penjualan_total_qty_detail - item.penjualan_total_kirim > 0) {
								var button_color_surat_jalan = "";
								var popup = "popup-open";
							} else {
								var button_color_surat_jalan = "navy";
								var popup = "popup-open";
							}
						}


						const oneDay = 24 * 60 * 60 * 1000;
						const firstDate = new Date(moment().format('YYYY, MM, DD'));
						const secondDate = new Date(moment(item.penjualan_tanggal_kirim).format('YYYY-MM-DD'));

						const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));

						if (item.tgl_cs_deadline != null) {
							var table_color_fix = "card-color-red";
						} else {
							if (firstDate >= secondDate) {
								if (sisa_kirim_sj <= 0) {
									var table_color_fix = "card-color-blue";
								} else {
									var table_color_fix = "card-color-red";
								}
							} else {
								if (diffDays >= 3 && diffDays <= 5) {
									if (sisa_kirim_sj <= 0) {
										var table_color_fix = "card-color-blue";
									} else {
										var table_color_fix = "card-color-orange";
									}
								}
								else if (diffDays >= 0 && diffDays <= 2) {
									if (sisa_kirim_sj <= 0) {
										var table_color_fix = "card-color-blue";
									} else {
										var table_color_fix = "card-color-red";
									}
								}
							}
						}



						// ⭐⭐⭐ PERBAIKAN: HITUNG TOTAL PEMBAYARAN YANG SUDAH DIVALIDASI CS ⭐⭐⭐
						var total_pembayaran_validated = 0;

						// Cek setiap pembayaran (1-10) apakah sudah divalidasi
						if (item.valid_cs_1 == 1 && item.pembayaran_1 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_1);
						}
						if (item.valid_cs_2 == 1 && item.pembayaran_2 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_2);
						}
						if (item.valid_cs_3 == 1 && item.pembayaran_3 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_3);
						}
						if (item.valid_cs_4 == 1 && item.pembayaran_4 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_4);
						}
						if (item.valid_cs_5 == 1 && item.pembayaran_5 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_5);
						}
						if (item.valid_cs_6 == 1 && item.pembayaran_6 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_6);
						}
						if (item.valid_cs_7 == 1 && item.pembayaran_7 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_7);
						}
						if (item.valid_cs_8 == 1 && item.pembayaran_8 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_8);
						}
						if (item.valid_cs_9 == 1 && item.pembayaran_9 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_9);
						}
						if (item.valid_cs_10 == 1 && item.pembayaran_10 != null) {
							total_pembayaran_validated += parseFloat(item.pembayaran_10);
						}

						// ⭐⭐⭐ PERBAIKAN: LOGIKA BUTTON SHIPMENT (menggunakan total_pembayaran_validated) ⭐⭐⭐
						var btn_alamat_kirim_penjualan = "";
						var btn_shipment_text = "Shipment";
						var sisa_bayar = parseFloat(item.penjualan_grandtotal - total_pembayaran_validated);

						// Cek apakah ada pembayaran yang belum divalidasi
						var has_pending_pembayaran = (data.log_pembayaran && data.log_pembayaran[item.penjualan_id] && data.log_pembayaran[item.penjualan_id].length > 0);

						// PRIORITAS 1: Cek apakah SJ sudah lengkap (semua barang sudah dikirim)
						if (sisa_kirim_sj <= 0) {
							// 🟦 BIRU - Semua barang sudah dikirim (SJ lengkap)
							btn_alamat_kirim_penjualan = "btn-color-blueWhite";
						}
						// PRIORITAS 2: Cek apakah belum ada alamat
						else if (item.alamat_kirim_penjualan == null) {
							// ⚫ ABU-ABU - Belum ada alamat (lunas atau belum)
							btn_alamat_kirim_penjualan = "bg-dark-gray-young text-add-colour-black-soft";
						}
						// PRIORITAS 3: Sudah ada alamat
						else {
							// PERBAIKAN: Dianggap lunas HANYA jika sisa_bayar <= 0 DAN tidak ada pembayaran pending
							if (sisa_bayar <= 0 && !has_pending_pembayaran) {
								// 🟢 HIJAU - Sudah lunas (tidak perlu approval)
								btn_alamat_kirim_penjualan = "btn-color-greenWhite";
							} else {
								// Belum lunas atau ada pembayaran pending - cek status approval
								if (item.shipment_status == 'approved') {
									// 🟢 HIJAU - Approved (boleh kirim)
									btn_alamat_kirim_penjualan = "btn-color-greenWhite";
								} else if (item.shipment_status == 'requested') {
									// 🟠 ORANGE - Requested (menunggu approval CS)
									btn_alamat_kirim_penjualan = "btn-color-orangeWhite";
								} else if (item.shipment_status == 'rejected') {
									// 🔴 MERAH - Rejected (ditolak)
									btn_alamat_kirim_penjualan = "btn-color-redWhite";
								} else {
									// 🟠 ORANGE - Belum ada status (baru input alamat, belum request)
									btn_alamat_kirim_penjualan = "btn-color-orangeWhite";
								}
							}
						}

						// kasi warna SPK
						if (item.penjualan_total_qty_detail != 0) {
							var kurang_kirim = item.penjualan_total_qty_detail - item.penjualan_total_kirim;
						} else {
							var kurang_kirim = 999;
						}

						// ⭐ PERBAIKAN: Hitung kurang bayar dari pembayaran yang sudah divalidasi
						var kurang_bayar = parseFloat(item.penjualan_grandtotal - total_pembayaran_validated);
						var produksi_status_now = item.produksi_selesai;
						var invoice_fee = moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

						//if (produksi_status_now == 'selesai' && kurang_kirim <= 0 && kurang_bayar <= 0) {

						var color_spk_produksi = "";
						if (item.produksi_selesai == 'selesai') {
							color_spk_produksi = "card-color-blue";
						}


						penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
						penjualan_value += '<td class="' + table_color_fix + ' ' + color_urgent_blink + '" style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + date_urgent + '</td>';

						if (kurang_kirim <= 0) {

							penjualan_value += '  <td class="' + color_spk_produksi + '" style="background-color:#000080; border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';

						} else {
							penjualan_value += '  <td class="' + color_spk_produksi + '" style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';

						}
						//end


						var color_spk_produksi = "";
						if (item.produksi_selesai == 'selesai') {
							penjualan_value += '<td align="left" onclick="detailPenjualanTolltip(\'' + item.penjualan_id + '\');"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; background-color:#000080;" >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';

						} else {
							penjualan_value += '<td align="left" onclick="detailPenjualanTolltip(\'' + item.penjualan_id + '\');"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';

						}
						penjualan_value += '</td>';

						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; " >' + item.client_telp + '</td>';
						var tipe_grosir
						if (item.extra == '1') {
							tipe_grosir = "Xtra"
						} else {
							tipe_grosir = "Polo"
						}

						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + tipe_grosir + '</td>';
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + item.karyawan_nama + '</td>';
						var lokasi = '';
						var pabrik = '';
						if (item.lokasi_pabrik != null && item.lokasi_pabrik != 'Pusat') {
							pabrik = 'Jakarta';
						} else {
							pabrik = 'Surabaya';
						}
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + pabrik + '</td>';
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + item.nama_kota + '</td>';
						penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + item.type_penjualan + '</td>';
						penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + number_format(parseInt(item.penjualan_grandtotal)) + '</td>';
						penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + number_format(total_pembayaran_validated) + '</td>';
						penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + sisa_value + '</td>';


						if (sisa_kirim_sj <= 0) {
							var color_btn_sj_id = "btn-color-blueWhite";
						} else if (item.penjualan_total_kirim == null) {
							var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
						} else if (sisa_kirim_sj > 0) {
							var color_btn_sj_id = "btn-color-greenWhite";
						}

						if (sisa <= 0) {
							var color_btn_byr = "btn-color-blueWhite";
						} else {
							var color_btn_byr = "bg-dark-gray-young text-add-colour-black-soft";
						}
						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   <button  class="' + btn_color_urgent_blink + ' button-small col button text-bold popup-open" data-popup=".detail-sales" ' + onclick_urgent + '>Urgent</button>';
						penjualan_value += '</td>';
						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-spkpo-popup" onclick="spkPo(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\');">Spk PO</button>';
						penjualan_value += '</td>';
						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" onclick="invoicePenjualan(\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + sisa_value + '\',\'' + item.extra + '\',\'' + (item.packing || '') + '\');">Invoice</button>';
						penjualan_value += '</td>';
						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   <button class="' + color_btn_byr + ' button-small col button popup-open text-bold" data-popup=".detail-pembayaran" onclick="detailPembayaran(\'' + item.dt_record + '\',\'' + item.penjualan_tanggal + '\',\'' + item.performa_id_relation + '\',\'' + item.bank_1_id + '\',\'' + item.bank_2_id + '\',\'' + item.bank_3_id + '\',\'' + item.bank_4_id + '\',\'' + item.bank_5_id + '\',\'' + item.bank_6_id + '\',\'' + item.bank_7_id + '\',\'' + item.bank_8_id + '\',\'' + item.bank_9_id + '\',\'' + item.bank_10_id + '\',\'' + item.pembayaran1_tgl + '\',\'' + item.pembayaran2_tgl + '\',\'' + item.pembayaran3_tgl + '\',\'' + item.pembayaran4_tgl + '\',\'' + item.pembayaran5_tgl + '\',\'' + item.pembayaran6_tgl + '\',\'' + item.pembayaran7_tgl + '\',\'' + item.pembayaran8_tgl + '\',\'' + item.pembayaran9_tgl + '\',\'' + item.pembayaran10_tgl + '\',\'' + item.bank + '\',\'' + item.pembayaran_1 + '\',\'' + item.pembayaran_2 + '\',\'' + item.pembayaran_3 + '\',\'' + item.pembayaran_4 + '\',\'' + item.pembayaran_5 + '\',\'' + item.pembayaran_6 + '\',\'' + item.pembayaran_7 + '\',\'' + item.pembayaran_8 + '\',\'' + item.pembayaran_9 + '\',\'' + item.pembayaran_10 + '\',\'' + item.client_nama + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_total_qty + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.client_id + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.ongkir + '\',\'' + item.karyawan_id + '\');">Bayar</button>';
						penjualan_value += '</td>';
						if (data.surat_jalan_customer[item.penjualan_id].length > 0) {
							var color_btn_sjc_id = "btn-color-greenWhite";
						} else if (data.count_surat_jalan_customer[item.penjualan_id].length == data.count_performa[item.penjualan_id].length) {
							var color_btn_byr = "btn-color-blueWhite";
						} else {
							var color_btn_sjc_id = "bg-dark-gray-young text-add-colour-black-soft";
						}

						if (data.surat_jalan_customer[item.penjualan_id].length > 0) {
							penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							penjualan_value += '  <button  class="' + color_btn_sjc_id + ' button-small col button ' + popup + ' text-bold popup-open"  data-popup=".produksi-sjc-foto-cabang" onclick="getSuratJalanListCustomer(\'' + item.penjualan_id + '\');">S.Jalan</button>';
							penjualan_value += '</td>';
						} else {
							penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							penjualan_value += '  <button  class="' + color_btn_sj_id + ' button-small col button ' + popup + ' text-bold popup-open"  data-popup=".surat-jalan-penjualan" onclick="getSuratJalanDetailPenjualan(\'' + item.dt_record + '\',\'' + item.client_nama + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_total_qty + '\');">S.Jalan</button>';
							penjualan_value += '</td>';
						}
						penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" onclick="fullReport(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + (item.packing || '') + '\');">Report</button>';
						penjualan_value += '</td>';
						// if (item.valid_cs == 2) {
						if (item.is_edit == 1) {
							penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							penjualan_value += '   <button  class="button-small card-color-red col button text-bold" >Edit</button>';
							penjualan_value += '</td>';
						} else {
							penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".edit-penjualan" onclick="editPenjualan(\'' + item.penjualan_id + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.client_id + '\',\'' + item.karyawan_id + '\',\'' + item.client_nama + '\',\'' + item.performa_header_id + '\',\'' + item.customer_logo + '\',\'' + item.customer_logo_bordir + '\',\'' + item.customer_logo_tambahan + '\',\'' + item.keterangan_valid_cs + '\',\'' + item.extra + '\',\'' + item.grosir + '\');">Edit</button>';
							penjualan_value += '</td>';
						}
						//	penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						//	penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold"  onclick="SPK1(\'' + item.customer_logo + '\',\'' + item.customer_logo_tambahan + '\',\'' + item.no_spk + '\',\'' + item.kode_kota + '\',\'' + item.customer_logo_bordir + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\');">SPK</button>';
						//	penjualan_value += '</td>';
						// }
						penjualan_value += '</tr>';
					}
				}

			});


			if (localStorage.getItem('arsip') == null || localStorage.getItem('arsip') == '') {
				jQuery('#total_data_sales').html(no_empty);
			} else {
				jQuery('#total_data_sales').html(no_arsip);
			}

			setTimeout(function () {
				jQuery('#penjualan_value').html(penjualan_value);
				jQuery('#current_page_penjualan').html(data.data.current_page);
				jQuery('#from_data').html();
				jQuery('#to_data').html();
				jQuery('#total_data').html(data.data.total + 5);
			}, 1000);
			app.dialog.close();
			// $$('#pagination_button').html(pagination_button);
			//$.each(data.data_teratas, function(i3, item3) {
			//	$$(".tr_"+item3.penjualan_id+"").remove();
			//});



		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getPenjualanHeaderNotif(page) {

	if (page == '' || page == null) {
		var page_now = 1;

	} else {
		var page_now = page;
	}

	var penjualan_value = "";
	var pagination_button = "";

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-penjualan-header-notif?page=" + page_now + "",
		dataType: 'JSON',
		data: {
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
			version_app: localStorage.getItem("versioon_app_now")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {

			no = 1;
			for (i = 0; i < data.data.last_page; i++) {
				no = i + 1;
				pagination_button += '<i onclick="getPenjualanHeaderNotif(' + no + ');"  style="border-radius:2px; width:40px; height:40px; background-color:#4c5269; padding-left:8px; padding-right:8px; margin:2px;">' + no + '</i>';
			}
			var no_empty = 0;
			var no_arsip = 0;
			var bagi_entertain = 0;
			var entertain = 0;
			var nominal_entertain = 0;
			var btn_entertain = '';
			var bantuan_cabang = '';
			var warna_button_packing = '';
			$.each(data.data.data, function (i, item) {
				if (item.penjualan_total_qty_detail == 0) {
					var sisa_kirim_sj = parseFloat(item.penjualan_total_qty) - parseFloat(data.surat_jalan_count[item.penjualan_id]);
				} else {
					var sisa_kirim_sj = parseFloat(item.penjualan_total_qty_detail) - parseFloat(data.surat_jalan_count[item.penjualan_id]);
				}
				// ⭐⭐⭐ PERBAIKAN: HITUNG TOTAL PEMBAYARAN YANG SUDAH DIVALIDASI CS ⭐⭐⭐
				var total_pembayaran_validated = 0;
				if (item.valid_cs_1 == 1 && item.pembayaran_1 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_1);
				}
				if (item.valid_cs_2 == 1 && item.pembayaran_2 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_2);
				}
				if (item.valid_cs_3 == 1 && item.pembayaran_3 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_3);
				}
				if (item.valid_cs_4 == 1 && item.pembayaran_4 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_4);
				}
				if (item.valid_cs_5 == 1 && item.pembayaran_5 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_5);
				}
				if (item.valid_cs_6 == 1 && item.pembayaran_6 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_6);
				}
				if (item.valid_cs_7 == 1 && item.pembayaran_7 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_7);
				}
				if (item.valid_cs_8 == 1 && item.pembayaran_8 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_8);
				}
				if (item.valid_cs_9 == 1 && item.pembayaran_9 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_9);
				}
				if (item.valid_cs_10 == 1 && item.pembayaran_10 != null) {
					total_pembayaran_validated += parseFloat(item.pembayaran_10);
				}

				if (localStorage.getItem('arsip') == null || localStorage.getItem('arsip') == '') {
					var arsip_value = "empty";
				} else {
					var arsip_value = localStorage.getItem('arsip');
				}

				bagi_entertain = parseInt(item.penjualan_grandtotal) / parseInt(50000000);
				nominal_entertain = parseInt(Math.floor(bagi_entertain)) * parseInt(200000);

				if (bagi_entertain > 0) {
					entertain = parseFloat(nominal_entertain) - parseFloat(item.fee_total);
					if (item.fee_total != 0) {
						if (entertain != 0 || nominal_entertain == item.fee_total) {
							btn_entertain = "btn-color-blueWhite";
						} else {
							btn_entertain = "bg-dark-gray-young text-add-colour-black-soft";
						}
					} else {
						btn_entertain = "bg-dark-gray-young text-add-colour-black-soft";
					}
				} else {
					entertain = 0;
					btn_entertain = "bg-dark-gray-young text-add-colour-black-soft";
				}

				if (item.bantuan_cabang != null) {
					bantuan_cabang = item.bantuan_cabang;
				} else {
					bantuan_cabang = '-';
				}

				var color_urgent_blink = '';
				var date_urgent = '';
				var btn_color_urgent_blink = '';
				if (item.tgl_cs_deadline != null) {
					color_urgent_blink = 'announcement';
					date_urgent = moment(item.tgl_cs_deadline).format('DD-MMM');
					btn_color_urgent_blink = 'card-color-red';
				} else {
					color_urgent_blink = '';
					date_urgent = moment(item.penjualan_tanggal_kirim).format('DD-MMM');
					btn_color_urgent_blink = 'bg-dark-gray-young text-add-colour-black-soft';
				}


				// ⭐ PERBAIKAN: Hitung sisa dari pembayaran yang sudah divalidasi
				var sisa = (item.penjualan_grandtotal) - total_pembayaran_validated;
				var sisa_fix = number_format(parseFloat((item.penjualan_grandtotal) - total_pembayaran_validated));

				if (sisa <= 0) {
					var sisa_value = sisa_fix.toString().replace(/\-/g, '+');
				} else {
					var sisa_value = sisa_fix;
				}

				if (sisa_kirim_sj > 0 || sisa > 0) {
					no_empty++
					// ⭐ PERBAIKAN: Cek lunas berdasarkan pembayaran yang sudah divalidasi
					if (parseFloat(item.penjualan_grandtotal - total_pembayaran_validated) <= 0) {
						var color_class = "card-color-blue";
					} else {
						var color_class = "card-blank";
					}

					if (item.status_produksi == "selesai") {
						var table_color_status_produksi = "card-color-blue";
					} else if (item.status_produksi == "proses") {
						var table_color_status_produksi = "card-color-green";
					}



					if (item.penjualan_total_qty_detail == 0) {
						var button_color_surat_jalan = "";
						var popup = "";
					} else {
						if (item.penjualan_total_qty_detail - item.penjualan_total_kirim > 0) {
							var button_color_surat_jalan = "";
							var popup = "popup-open";
						} else {
							var button_color_surat_jalan = "navy";
							var popup = "popup-open";
						}
					}


					const oneDay = 24 * 60 * 60 * 1000;
					const firstDate = new Date(moment().format('YYYY, MM, DD'));
					const secondDate = new Date(moment(item.penjualan_tanggal_kirim).format('YYYY-MM-DD'));

					const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
					if (item.tgl_cs_deadline != null) {
						var table_color_fix = "card-color-red";
					} else {
						if (firstDate >= secondDate) {
							if (sisa_kirim_sj <= 0) {
								var table_color_fix = "card-color-blue";
							} else {
								var table_color_fix = "card-color-red";
							}
						} else {
							if (diffDays >= 3 && diffDays <= 5) {
								if (sisa_kirim_sj <= 0) {
									var table_color_fix = "card-color-blue";
								} else {
									var table_color_fix = "card-color-orange";
								}
							}
							else if (diffDays >= 0 && diffDays <= 2) {
								if (sisa_kirim_sj <= 0) {
									var table_color_fix = "card-color-blue";
								} else {
									var table_color_fix = "card-color-red";
								}
							}
						}
					}




					// ⭐⭐⭐ PERBAIKAN: HITUNG TOTAL PEMBAYARAN YANG SUDAH DIVALIDASI CS ⭐⭐⭐
					var total_pembayaran_validated = 0;

					// Cek setiap pembayaran (1-10) apakah sudah divalidasi
					if (item.valid_cs_1 == 1 && item.pembayaran_1 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_1);
					}
					if (item.valid_cs_2 == 1 && item.pembayaran_2 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_2);
					}
					if (item.valid_cs_3 == 1 && item.pembayaran_3 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_3);
					}
					if (item.valid_cs_4 == 1 && item.pembayaran_4 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_4);
					}
					if (item.valid_cs_5 == 1 && item.pembayaran_5 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_5);
					}
					if (item.valid_cs_6 == 1 && item.pembayaran_6 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_6);
					}
					if (item.valid_cs_7 == 1 && item.pembayaran_7 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_7);
					}
					if (item.valid_cs_8 == 1 && item.pembayaran_8 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_8);
					}
					if (item.valid_cs_9 == 1 && item.pembayaran_9 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_9);
					}
					if (item.valid_cs_10 == 1 && item.pembayaran_10 != null) {
						total_pembayaran_validated += parseFloat(item.pembayaran_10);
					}

					// ⭐⭐⭐ PERBAIKAN: LOGIKA BUTTON SHIPMENT (menggunakan total_pembayaran_validated) ⭐⭐⭐
					var btn_alamat_kirim_penjualan = "";
					var btn_shipment_text = "Shipment";
					var sisa_bayar = parseFloat(item.penjualan_grandtotal - total_pembayaran_validated);

					// Cek apakah ada pembayaran yang belum divalidasi
					var has_pending_pembayaran = (data.log_pembayaran && data.log_pembayaran[item.penjualan_id] && data.log_pembayaran[item.penjualan_id].length > 0);

					// PRIORITAS 1: Cek apakah SJ sudah lengkap (semua barang sudah dikirim)
					if (sisa_kirim_sj <= 0) {
						// 🟦 BIRU - Semua barang sudah dikirim (SJ lengkap)
						btn_alamat_kirim_penjualan = "btn-color-blueWhite";
					}
					// PRIORITAS 2: Cek apakah belum ada alamat
					else if (item.alamat_kirim_penjualan == null) {
						// ⚫ ABU-ABU - Belum ada alamat (lunas atau belum)
						btn_alamat_kirim_penjualan = "bg-dark-gray-young text-add-colour-black-soft";
					}
					// PRIORITAS 3: Sudah ada alamat
					else {
						// PERBAIKAN: Dianggap lunas HANYA jika sisa_bayar <= 0 DAN tidak ada pembayaran pending
						if (sisa_bayar <= 0 && !has_pending_pembayaran) {
							// 🟢 HIJAU - Sudah lunas (tidak perlu approval)
							btn_alamat_kirim_penjualan = "btn-color-greenWhite";
						} else {
							// Belum lunas atau ada pembayaran pending - cek status approval
							if (item.shipment_status == 'approved') {
								// 🟢 HIJAU - Approved (boleh kirim)
								btn_alamat_kirim_penjualan = "btn-color-greenWhite";
							} else if (item.shipment_status == 'requested') {
								// 🟠 ORANGE - Requested (menunggu approval CS)
								btn_alamat_kirim_penjualan = "btn-color-orangeWhite";
							} else if (item.shipment_status == 'rejected') {
								// 🔴 MERAH - Rejected (ditolak)
								btn_alamat_kirim_penjualan = "btn-color-redWhite";
							} else {
								// 🟠 ORANGE - Belum ada status (baru input alamat, belum request)
								btn_alamat_kirim_penjualan = "btn-color-orangeWhite";
							}
						}
					}

					// kasi warna SPK
					if (item.penjualan_total_qty_detail != 0) {
						var kurang_kirim = item.penjualan_total_qty_detail - item.penjualan_total_kirim;
					} else {
						var kurang_kirim = 999;
					}

					// ⭐ PERBAIKAN: Hitung kurang bayar dari pembayaran yang sudah divalidasi
					var kurang_bayar = parseFloat(item.penjualan_grandtotal - total_pembayaran_validated);
					var produksi_status_now = item.produksi_selesai;
					var invoice_fee = moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

					//if (produksi_status_now == 'selesai' && kurang_kirim <= 0 && kurang_bayar <= 0) {

					var color_spk_produksi = "";
					if (item.produksi_selesai == 'selesai') {
						color_spk_produksi = "card-color-blue";
					}



					penjualan_value += '<tr style="border-right:1px solid gray; border-bottom:1px solid gray;"  tr_' + item.penjualan_id + '">';
					penjualan_value += '<td class="' + table_color_fix + ' ' + color_urgent_blink + '" style=" border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + date_urgent + '</td>';

					if (kurang_kirim <= 0) {

						penjualan_value += '  <td class="' + color_spk_produksi + '" style="background-color:#000080; border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';

					} else {
						penjualan_value += '  <td class="' + color_spk_produksi + '" style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';

					}
					//end


					var color_spk_produksi = "";
					if (item.produksi_selesai == 'selesai') {
						penjualan_value += '<td align="left" onclick="detailPenjualanTolltip(\'' + item.penjualan_id + '\');"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; background-color:#000080;" >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';

					} else {
						penjualan_value += '<td align="left" onclick="detailPenjualanTolltip(\'' + item.penjualan_id + '\');"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';

					}
					penjualan_value += '</td>';

					var tipe_grosir
					if (item.extra == '1') {
						tipe_grosir = "Xtra"
					} else {
						tipe_grosir = "Polo"
					}

					penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + tipe_grosir + '</td>';
					penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + item.karyawan_nama + '</td>';
					var lokasi = '';
					if (item.wilayah_header != null && item.wilayah_header != 'Pusat') {
						lokasi = 'Jakarta';
					} else {
						lokasi = 'Surabaya';
					}

					penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + lokasi + '</td>';
					penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + item.type_penjualan + '</td>';
					penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + number_format(parseInt(item.penjualan_grandtotal)) + '</td>';
					penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + number_format(total_pembayaran_validated) + '</td>';
					penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell ' + color_class + '">' + sisa_value + '</td>';


					if (sisa_kirim_sj <= 0) {
						var color_btn_sj_id = "btn-color-blueWhite";
					} else if (item.penjualan_total_kirim == null) {
						var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
					} else if (sisa_kirim_sj > 0) {
						var color_btn_sj_id = "btn-color-greenWhite";
					}

					if (sisa <= 0) {
						var color_btn_byr = "btn-color-blueWhite";
					} else {
						var color_btn_byr = "bg-dark-gray-young text-add-colour-black-soft";
					}

					penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
					penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold"  onclick="spkPo(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\');">Spk PO</button>';
					penjualan_value += '</td>';
					penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
					penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold"  onclick="invoicePenjualan(\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + sisa_value + '\',\'' + item.extra + '\',\'' + (item.packing || '') + '\');">Invoice</button>';
					penjualan_value += '</td>';
					penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
					penjualan_value += '   <button class="' + color_btn_byr + ' button-small col button popup-open text-bold" data-popup=".detail-pembayaran" onclick="detailPembayaran(\'' + item.dt_record + '\',\'' + item.penjualan_tanggal + '\',\'' + item.performa_id_relation + '\',\'' + item.bank_1_id + '\',\'' + item.bank_2_id + '\',\'' + item.bank_3_id + '\',\'' + item.bank_4_id + '\',\'' + item.bank_5_id + '\',\'' + item.bank_6_id + '\',\'' + item.bank_7_id + '\',\'' + item.bank_8_id + '\',\'' + item.bank_9_id + '\',\'' + item.bank_10_id + '\',\'' + item.pembayaran1_tgl + '\',\'' + item.pembayaran2_tgl + '\',\'' + item.pembayaran3_tgl + '\',\'' + item.pembayaran4_tgl + '\',\'' + item.pembayaran5_tgl + '\',\'' + item.pembayaran6_tgl + '\',\'' + item.pembayaran7_tgl + '\',\'' + item.pembayaran8_tgl + '\',\'' + item.pembayaran9_tgl + '\',\'' + item.pembayaran10_tgl + '\',\'' + item.bank + '\',\'' + item.pembayaran_1 + '\',\'' + item.pembayaran_2 + '\',\'' + item.pembayaran_3 + '\',\'' + item.pembayaran_4 + '\',\'' + item.pembayaran_5 + '\',\'' + item.pembayaran_6 + '\',\'' + item.pembayaran_7 + '\',\'' + item.pembayaran_8 + '\',\'' + item.pembayaran_9 + '\',\'' + item.pembayaran_10 + '\',\'' + item.client_nama + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_total_qty + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.client_id + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.ongkir + '\');">Bayar</button>';
					penjualan_value += '</td>';
					penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
					penjualan_value += '  <button  class="' + color_btn_sj_id + ' button-small col button ' + popup + ' text-bold"  data-popup=".surat-jalan-penjualan" onclick="getSuratJalanDetailPenjualan(\'' + item.dt_record + '\',\'' + item.client_nama + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_total_qty + '\');">S.Jalan</button>';
					penjualan_value += '</td>';
					penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
					penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"  onclick="fullReport(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + (item.packing || '') + '\');">Report</button>';
					penjualan_value += '</td>';
					penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
					penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".edit-penjualan" onclick="editPenjualan(\'' + item.penjualan_id + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.client_id + '\',\'' + item.karyawan_id + '\',\'' + item.client_nama + '\',\'' + item.performa_header_id + '\',\'' + item.customer_logo + '\',\'' + item.customer_logo_bordir + '\',\'' + item.customer_logo_tambahan + '\');">Edit</button>';
					penjualan_value += '</td>';
					penjualan_value += '</tr>';
				}

			});
			jQuery('#penjualan_value_notif').html(penjualan_value);
			app.dialog.close();



		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function updateUrgent(penjualan_id, type_page) {
	// Helper: yyyy-mm-dd (Asia/Jakarta)
	// function todayYMD() {
	// 	const tzDate = new Date(); // asumsi device sudah di WIB, cukup pakai local
	// 	const y = tzDate.getFullYear();
	// 	const m = String(tzDate.getMonth() + 1).padStart(2, '0');
	// 	const d = String(tzDate.getDate()).padStart(2, '0');
	// 	return `${y}-${m}-${d}`;
	// }

	// // Build dialog pilih tanggal
	// var dlg = app.dialog.create({
	// 	title: 'Pilih Tanggal Urgent',
	// 	text:
	// 		'<div class="list no-hairlines-md" style="margin-top:10px;">' +
	// 		'  <ul>' +
	// 		'    <li class="item-content item-input">' +
	// 		'      <div class="item-inner">' +
	// 		'        <div class="item-title item-label">Tanggal Urgent</div>' +
	// 		'        <div class="item-input-wrap">' +
	// 		'          <input type="date" id="tanggal_urgent_cs" value="' + todayYMD() + '" required />' +
	// 		'        </div>' +
	// 		'      </div>' +
	// 		'    </li>' +
	// 		'  </ul>' +
	// 		'</div>',
	// 	cssClass: 'custom-dialog',
	// 	closeByBackdropClick: true,
	// 	buttons: [
	// 		{
	// 			text: 'Batal',
	// 			onClick: function () {
	// 				// do nothing
	// 			}
	// 		},
	// 		{
	// 			text: 'Simpan',
	// 			bold: true,
	// 			onClick: function () {
	// 				var tanggal_urgent = jQuery('#tanggal_urgent_cs').val();
	// 				if (!tanggal_urgent) {
	// 					app.dialog.alert('Tanggal wajib dipilih.');
	// 					return;
	// 				}

	// 				jQuery.ajax({
	// 					type: "POST",
	// 					url: "" + BASE_API + "/update-tgl-urgent-cs",
	// 					dataType: 'JSON',
	// 					data: {
	// 						penjualan_id: penjualan_id,
	// 						tanggal_urgent: tanggal_urgent // <— kirim tanggal yang dipilih
	// 					},
	// 					beforeSend: function () {
	// 						app.dialog.progress();
	// 					},
	// 					success: function (data) {
	// 						app.dialog.close();
	// 						if (data.status == 'success') {
	// 							app.dialog.alert('Berhasil Update Urgent', function () {
	// 								jQuery("#close-detail-sales").click();
	// 								if (type_page != 1) {
	// 									getPenjualanHeader(1);
	// 								} else {
	// 									cekDeadlineDanBukaPopup();
	// 								}
	// 							});
	// 						} else {
	// 							app.dialog.alert(data.message || 'Gagal Update Urgent', function () {
	// 								jQuery("#close-detail-sales").click();
	// 								if (type_page != 1) {
	// 									getPenjualanHeader(1);
	// 								} else {
	// 									cekDeadlineDanBukaPopup();
	// 								}
	// 							});
	// 						}
	// 					},
	// 					error: function () {
	// 						app.dialog.close();
	// 						app.dialog.alert('Internet Tidak Stabil / Gangguan Server', function () {
	// 							app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
	// 								ignoreCache: true,
	// 								reloadCurrent: true
	// 							});
	// 						});
	// 					}
	// 				});
	// 			}
	// 		}
	// 	]
	// });

	// dlg.open();

	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/update-tgl-urgent-cs",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
			// tanggal_urgent: tanggal_urgent // <— kirim tanggal yang dipilih
		},
		beforeSend: function () {
			app.dialog.progress();
		},
		success: function (data) {
			app.dialog.close();
			if (data.status == 'success') {
				app.dialog.alert('Berhasil Update Urgent', function () {
					jQuery("#close-detail-sales").click();
					if (type_page != 1) {
						getPenjualanHeader(1);
					} else {
						cekDeadlineDanBukaPopup();
					}
				});
			} else {
				app.dialog.alert(data.message || 'Gagal Update Urgent', function () {
					jQuery("#close-detail-sales").click();
					if (type_page != 1) {
						getPenjualanHeader(1);
					} else {
						cekDeadlineDanBukaPopup();
					}
				});
			}
		},
		error: function () {
			app.dialog.close();
			app.dialog.alert('Internet Tidak Stabil / Gangguan Server', function () {
				app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
					ignoreCache: true,
					reloadCurrent: true
				});
			});
		}
	});
}



function getPerformaHeaderPenjualan() {
	var user_id = "";
	if (jQuery("#sales_id").val() == "" || jQuery("#sales_id").val() == null) {
		user_id = 'empty';
	} else {
		user_id = jQuery("#sales_id").val();
	}

	var perusahaan_proforma_value = "";
	if (jQuery('#perusahaan_proforma_filter').val() == '' || jQuery('#perusahaan_proforma_filter').val() == null) {
		perusahaan_proforma_value = "empty";
	} else {
		perusahaan_proforma_value = jQuery('#perusahaan_proforma_filter').val();
	}

	var year_now = new Date().getFullYear();
	if (jQuery('#transaksi_performa_years option:selected').val() == null) {
		var year = year_now;
	} else if (jQuery('#transaksi_performa_years option:selected').val() == 'all') {
		var year = 'empty';
	} else {
		var year = jQuery('#transaksi_performa_years option:selected').val();
	}

	var month_now = new Date().getMonth() + 1;
	if (jQuery('#transaksi_performa_bulan option:selected').val() == null) {
		var month = month_now;
	} else if (jQuery('#transaksi_performa_bulan option:selected').val() == 'all') {
		var month = 'empty';
	} else {
		var month = jQuery('#transaksi_performa_bulan option:selected').val();
	}

	console.log(month_now);
	console.log(year);

	var performa_value = "";
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-status-view-performa-cs",
		dataType: 'JSON',
		data: {
			karyawan_id: user_id,
			perusahaan_proforma_value: perusahaan_proforma_value,
			month: month,
			year: year,
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
			version_app: localStorage.getItem("versioon_app_now")
		},
		beforeSend: function () {
		},
		success: function (data) {
			var no = 0;
			if (data.data.length != 0) {
				var color_tr = "";
				var onclick_edit = '';
				var function_edit = '';
				$.each(data.data, function (i2, item2) {
					no++

					// Logika warna background row - update sesuai sales
					if (item2.needs_approval == 1 && item2.approval_status == 'pending') {
						color_tr = '#FF9800';
					} else if (item2.status == 'tidak_aktif') {
						color_tr = '#000080';
					} else {
						color_tr = '';
					}

					if (item2.valid_cs == 2 || (item2.needs_approval == 1 && item2.approval_status == 'rejected')) {
						var row_valid_blink = 'announcement card-color-red';
					} else {
						var row_valid_blink = '';
					}

					performa_value += '<tr class="' + row_valid_blink + '">';
					performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + moment(item2.dt_record).format('DD-MMM') + '';
					performa_value += '</td>';
					performa_value += '<td class="label-cell" style="background-color:' + color_tr + ';  gray; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + moment(item2.dt_record).format('DDMMYY') + '-' + item2.performa_header_id.replace(/\PI_/g, '').replace(/^0+/, '') + '';
					performa_value += '</td>';
					performa_value += '<td class="label-cell text-align-left" style=" background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + item2.client_nama + '';
					performa_value += '</td>';
					performa_value += '<td class="label-cell text-align-left" style=" background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + item2.client_telp + '';
					performa_value += '</td>';
					performa_value += '<td class="label-cell text-align-left" style=" background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + item2.karyawan_nama + '';
					performa_value += '</td>';

					var lokasi = '';
					if (item2.lokasi_pabrik != null && item2.lokasi_pabrik != 'Pusat') {
						lokasi = 'Jakarta';
					} else {
						lokasi = 'Surabaya';
					}



					performa_value += '<td class="label-cell text-align-left" style=" background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + lokasi + '';
					performa_value += '</td>';
					performa_value += '<td class="label-cell text-align-left" style=" background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + item2.type_penjualan + '';
					performa_value += '</td>';
					performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					if (item2.status == 'tidak_aktif') {
					} else {
						if (item2.valid_cs == 1) {
							performa_value += '  <center><a onclick="singlePenjualan(\'' + item2.performa_header_id + '\',\'' + item2.karyawan_id + '\');"  style="font-size:30px; color:forestgreen;" class="f7-icons">plus_rectangle_fill</a>&nbsp; &nbsp; &nbsp;';
							performa_value += '  <a onclick="multiplePenjualan(\'' + item2.performa_header_id + '\',\'' + item2.karyawan_id + '\');" href="/penjualan-input" style="font-size:30px; color:forestgreen;" class="f7-icons">plus_rectangle_fill_on_rectangle_fill</a></center>';
						}
					}
					performa_value += '</td>';

					let nohp = item2.client_telp;

					// hilangkan spasi
					nohp = nohp.replace(/ /g, '');
					// hilangkan tanda kurung
					nohp = nohp.replace(/\(/g, '').replace(/\)/g, '');
					// hilangkan titik
					nohp = nohp.replace(/\./g, '');

					// cek apakah hanya berisi + dan angka
					if (!/[^+0-9]/.test(nohp.trim())) {
						// jika diawali "62"
						if (nohp.trim().substring(0, 2) === '62') {
							var hp = nohp.trim();
						}
						// jika diawali "0"
						else if (nohp.trim().substring(0, 1) === '0') {
							var hp = '62' + nohp.trim().substring(1);
						}
					}

					var text_link = 'https://wa.me/' + hp + '?text=Halo%2C%20Kami%20dari%20Koperindo.id%20ingin%20konfirmasi.%0AApakah%20pesanan%20anda%20sudah%20sesuai%2C%20%0A%0AJika%20ada%20pertanyaan%20bisa%20hubungi%20admin%20CS%20kami%0Adi%20%2B628113181844';


					if (data.count_log[item2.performa_header_id] > 0) {
						performa_value += '<td class="label-cell" style="border-bottom:1px solid gray;">';
						performa_value += '		<button class="btn-color-blueWhite button-small col button text-bold popup-open" data-popup=".popup-log-whatsapp" onclick="openPopupLog(\'' + item2.performa_header_id + '\',\'' + item2.status + '\');">Log</button>';
						performa_value += '</td>';
					} else {
						performa_value += '<td class="label-cell" style="background-color:' + color_tr + ';border-bottom:1px solid gray;">';
						performa_value += '		<button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" data-popup=".popup-log-whatsapp" onclick="openPopupLog(\'' + item2.performa_header_id + '\',\'' + item2.status + '\');">Log</button>';
						performa_value += '</td>';
					}

					performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '		<a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold " onclick="updateStatusWhatsapp(\'' + item2.performa_header_id + '\',\'' + item2.client_nama + '\',\'' + text_link + '\')">Whatsapp</a>';
					performa_value += '</td>';
					// performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';

					// Logika icon download: merah jika needs_approval = 1 dan status pending/rejected
					var image_potongan = '';
					if (item2.needs_approval == 1 && (item2.approval_status == 'pending' || item2.approval_status == 'rejected')) {
						image_potongan = '<img class="popup-open" data-popup=".detail-proforma-popup" onclick="penjualanGetPerformaDownload(\'' + item2.performa_header_id + '\',\'' + item2.karyawan_id + '\',\'' + item2.client_kota + '\',\'' + item2.client_nama + '\',\'' + item2.dt_record + '\',\'' + item2.performa_total_qty + '\',\'' + item2.extra + '\',\'' + (item2.packing || '') + '\');" src="img/logo/donwloadproforma_merah.png" width="80px" />';
					} else {
						image_potongan = '<img class="popup-open" data-popup=".detail-proforma-popup" onclick="penjualanGetPerformaDownload(\'' + item2.performa_header_id + '\',\'' + item2.karyawan_id + '\',\'' + item2.client_kota + '\',\'' + item2.client_nama + '\',\'' + item2.dt_record + '\',\'' + item2.performa_total_qty + '\',\'' + item2.extra + '\',\'' + (item2.packing || '') + '\');" src="img/logo/donwloadproforma.png" width="80px" />';
					}

					performa_value += '<td class="label-cell" style="background-color:' + color_tr + '; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '		' + image_potongan;

					if (item2.is_edit == 1) {
						performa_value += '<td class="label-cell" style="border-right:1px solid gray; border-bottom:1px solid gray;">';
						performa_value += '<a style="color:red;"><i  class="f7-icons">pencil_circle_fill</i></a>';
						performa_value += '</td>';
					} else {
						performa_value += '<td class="label-cell" style="border-right:1px solid gray; border-bottom:1px solid gray;">';
						performa_value += '		<a class="popup-open" style="color:#cf400a;" data-popup=".edit-performa-header-penjualan" onclick="redirectToEditPerforma(\'' + item2.performa_header_id + '\');"><i  class="f7-icons">pencil_circle_fill</i></a>';
						performa_value += '</td>';
					}

					// performa_value += '<td class="label-cell" style="border-right:1px solid gray; border-bottom:1px solid gray;">';
					// performa_value += '<a style="color:#b20e0e;" onclick="deletePerformaHeaderPenjualanPage(\'' + item2.performa_header_id + '\',\'' + item2.status + '\');"><i  class="f7-icons">trash</i></a>';
					// performa_value += '</td>';

					performa_value += '</tr>';
				});

			} else {
				performa_value += '<tr>';
				performa_value += '<td colspan="7" ><font style="color:red;font-weight:bold;">Data Proforma Tidak Ada</font></td>';
				performa_value += '</tr>';
			}

			$$('#performa_value').html(performa_value);
			$$('#total_data_proforma').html(no);
			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function openPopupLog(performa_header_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-whatsapp-log",
		dataType: 'JSON',
		data: {
			performa_header_id: performa_header_id,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var performa_value = '';
			var no = 0;
			if (data.data.length != 0) {
				$.each(data.data, function (i2, item2) {
					no++
					performa_value += '<tr>';
					performa_value += '<td class="label-cell" style="border-left:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + no + '';
					performa_value += '</td>';
					performa_value += '<td class="label-cell" style="border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + moment(item2.tanggal_di_hubungi).format('DD-MMM-YYYY') + '';
					performa_value += '</td>';
					performa_value += '<td class="label-cell" style="border-right:1px solid gray; border-bottom:1px solid gray;">';
					performa_value += '' + item2.user_record + '';
					performa_value += '</td>';
					performa_value += '</tr>';
				});
			} else {
				performa_value += '<tr>';
				performa_value += '<td colspan="3" ><font style="color:red;font-weight:bold;">Data Tidak Ada</font></td>';
				performa_value += '</tr>';
			}
			$("#tanggal_hubungi_wa").html(performa_value);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function updateStatusWhatsapp(performa_header_id, client_nama, text_link) {
	app.dialog.create({
		title: 'Hubungi Client',
		text: 'Apakah Anda Yakin Ingin Menghubungi ' + client_nama + ' ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/update-status-whatsapp-cs",
						dataType: 'JSON',
						data: {
							performa_header_id: performa_header_id,
							user_record: localStorage.getItem("karyawan_nama"),
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							window.open(text_link, '_blank');
							getPerformaHeaderPenjualan();
						},
						error: function (xmlhttprequest, textstatus, message) {
						}
					});
				},
			},
			{
				text: 'Tidak',
				onClick: function () {

				},
			},
		],
	}).open();
}

function singlePenjualan(performa_header_id, karyawan_id) {
	localStorage.setItem("performa_header_id", performa_header_id);
	localStorage.setItem("karyawan_id_performa", karyawan_id);
	localStorage.setItem("type_penjualan_input", "single");
	return app.views.main.router.navigate('/penjualan-input-single');
}

function multiplePenjualan(performa_header_id, karyawan_id) {
	localStorage.setItem("performa_header_id", performa_header_id);
	localStorage.setItem("karyawan_id_performa", karyawan_id);
	localStorage.setItem("type_penjualan_input", "multiple");
	return app.views.main.router.navigate('/penjualan-input-single');
}

function deletePerformaHeaderPenjualanPage(performa_header_id, status) {
	if (status == 'tidak_aktif') {
		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/delete-performa-manager",
			dataType: 'JSON',
			data: { performa_header_id: performa_header_id },
			beforeSend: function () {
				app.dialog.progress();
			},
			success: function (data) {
				app.dialog.close();
				if (data.status == 1) {
					app.dialog.alert('Berhasil Menghapus Performa', function () {
						getPerformaHeaderPenjualan();
					});
				} else {
					app.dialog.alert('Gagal Menghapus Performa', function () {
						getPerformaHeaderPenjualan();
					});
				}
			},
			error: function (xmlhttprequest, textstatus, message) {
				app.dialog.close();
				app.dialog.alert('Internet Tidak Stabil / Gangguan Server', function () {
					app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
						ignoreCache: true,
						reloadCurrent: true
					});
				});
			}
		});
	} else {
		app.dialog.create({
			title: 'Hapus Proforma',
			text: 'Apakah Anda Yakin Menghapus Proforma ini ? ',
			cssClass: 'custom-dialog',
			closeByBackdropClick: 'true',
			buttons: [
				{
					text: 'Ya',
					onClick: function () {
						jQuery.ajax({
							type: "POST",
							url: "" + BASE_API + "/delete-performa-manager",
							dataType: 'JSON',
							data: { performa_header_id: performa_header_id },
							beforeSend: function () {
								app.dialog.progress();
							},
							success: function (data) {
								app.dialog.close();
								if (data.status == 1) {
									app.dialog.alert('Berhasil Menghapus Performa', function () {
										getPerformaHeaderPenjualan();
									});
								} else {
									app.dialog.alert('Gagal Menghapus Performa', function () {
										getPerformaHeaderPenjualan();
									});
								}
							},
							error: function (xmlhttprequest, textstatus, message) {
								app.dialog.close();
								app.dialog.alert('Internet Tidak Stabil / Gangguan Server', function () {
									app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
										ignoreCache: true,
										reloadCurrent: true
									});
								});
							}
						});
					},
				},
				{
					text: 'Tidak',
					onClick: function () {

					},
				},
			],
		}).open();


	}
}


function editPenjualan(penjualan_id, penjualan_tanggal, penjualan_tanggal_kirim, client_id, karyawan_id, client_nama, performa, customer_logo, customer_logo_bordir, customer_logo_tambahan, keterangan_reject, extra, grosir) {
	localStorage.setItem("penjualan_id", penjualan_id);
	localStorage.setItem("performa", performa);
	$('#id_penjualan_edit').val(penjualan_id);
	$('#penjualan_tanggal_edit').val(moment(penjualan_tanggal).format('YYYY-MM-DD'));
	$('#penjualan_tanggal_kirim_edit').val(moment(penjualan_tanggal_kirim).format('YYYY-MM-DD'));
	$('#penjualan_keterangan_reject').val(keterangan_reject);

	if (extra == 1 && grosir == 0) {
		$$('#xtra_penjualan_1').val(1);
		$$('#tipe_grosir_penjualan').html('Xtra');
	} else if (extra == 0 && grosir == 1) {
		$$('#xtra_penjualan_1').val(0);
		$$('#tipe_grosir_penjualan').html('Grosir');
	}

	if (customer_logo != "") {
		var customer_logo = '<img style="margin:auto;" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + customer_logo + '" width="100%">';
	} else {
		var customer_logo = '<font style="color:red;font-wight:bold; margin-right:auto; margin-left:auto;">NO IMAGE</font>';
	}

	if (customer_logo_bordir != "") {
		var customer_logo_bordir = '<img style="margin:auto;" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + customer_logo_bordir + '" width="100%">';
	} else {
		var customer_logo_bordir = '<font style="color:red;font-wight:bold; margin-right:auto; margin-left:auto;">NO IMAGE</font>';
	}

	if (customer_logo_tambahan != "") {
		var customer_logo_tambahan = '<img style="margin:auto;" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + customer_logo_tambahan + '" width="100%">';
	} else {
		var customer_logo_tambahan = '<font style="color:red;font-wight:bold; margin-right:auto; margin-left:auto;">NO IMAGE</font>';
	}
	$$('#preview_emblem_penjualan').html(customer_logo);
	$$('#preview_bordir_penjualan').html(customer_logo_bordir);
	$$('#preview_tambahan_penjualan').html(customer_logo_tambahan);
	getClientEditPenjualan(client_id, client_nama);
	getDetailPenjualanOwner(penjualan_id);

}


function getClientEditPenjualan(client_id, client_nama) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-client-owner",
		dataType: "JSON",
		data: {
			user_id: localStorage.getItem("user_id")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var select_box_client_id;
			jQuery.each(data.data, function (i, val) {
				if (client_id == val.client_id) {
					select_box_client_id += '<option selected value="' + val.client_id + '">' + val.client_nama + ' | ' + val.client_kota + '</option>';
				} else {
					select_box_client_id += '<option value="' + val.client_id + '">' + val.client_nama + ' | ' + val.client_kota + '</option>';
				}

				if (client_id == val.client_id) {
					$$('.item-title-edit-penjualan').html(val.client_nama + ' | ' + val.client_kota);
				}
			});
			$$('#client_id_edit_penjualan').html(select_box_client_id);
		}
	});

}


function getDetailPenjualanOwner(penjualan_id) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-detail-penjualan-owner",
		dataType: "JSON",
		data: {
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
		},
		success: function (data) {
			var detail_penjualan_val = "";
			jQuery.each(data.data, function (i, item) {
				detail_penjualan_val += '<tr>';

				detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="25%">' + item.penjualan_jenis + '</td>';
				detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="7%">' + item.penjualan_qty + '</td>';
				detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="15%">' + number_format(item.penjualan_harga) + '</td>';
				detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="15%">' + number_format(item.penjualan_detail_grandtotal) + '</td>';
				detail_penjualan_val += '<td style="border-left:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
				detail_penjualan_val += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" data-popup=".edit-detail-manager-penjualan"  onclick="editDetailOwnerPenjualan(\'' + item.penjualan_detail_performa_id + '\');">Edit</button>';
				detail_penjualan_val += '</td>';
				detail_penjualan_val += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
				detail_penjualan_val += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"   onclick="hapusDetailPenjualanOwner(\'' + item.penjualan_detail_performa_id + '\',\'' + item.penjualan_id + '\');">Hapus</button>';
				detail_penjualan_val += '</td>';
				detail_penjualan_val += '</tr>';

			});
			$$('#detail_penjualan_val').html(detail_penjualan_val);

		}
	});

}

function editDetailOwnerPenjualan(penjualan_detail_performa_id) {
	jQuery('#price_edit_penjualan_popup').mask('000,000,000,000', { reverse: true });
	jQuery('#penjualan_detail_grandtotal_edit').mask('000,000,000,000', { reverse: true });

	jQuery('#jenis_edit_penjualan_popup').val("");
	jQuery('#penjualan_id_edit_2').val("");
	jQuery('#penjualan_detail_performa_id_edit').val("");
	jQuery('#penjualan_qty_edit').val("");
	jQuery('#price_edit_penjualan_popup').val("");
	jQuery('#penjualan_detail_grandtotal_edit').val("");
	jQuery('#produk_keterangan_custom_edit').val("");
	jQuery('#keterangan_edit').val("");

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/edit-detail-manager-penjualan",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: penjualan_detail_performa_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();

			var jenis_data = data.data.penjualan_jenis;
			var jenis = jenis_data.split(".")[0];
			jQuery('#jenis_edit_penjualan_popup').val(jenis);
			jQuery('#penjualan_old_jenis_edit_1').val(data.data.penjualan_jenis);
			jQuery('#penjualan_old_style_edit_1').val(data.data.style);
			jQuery('#penjualan_old_ukuran_edit_1').val(data.data.ukuran_jual);
			jQuery('#penjualan_id_edit_2').val(data.data.penjualan_id);
			jQuery('#penjualan_detail_performa_id_edit').val(data.data.penjualan_detail_performa_id);
			jQuery('#penjualan_qty_edit').val(data.data.penjualan_qty);
			jQuery('#price_edit_penjualan_popup').val(number_format(data.data.penjualan_harga));
			jQuery('#penjualan_detail_grandtotal_edit').val(number_format(data.data.penjualan_qty * data.data.penjualan_harga));

			if (data.data.produk_keterangan_kustom != null) {
				jQuery('#produk_keterangan_custom_edit').val(data.data.produk_keterangan_kustom);
			} else {
				jQuery('#produk_keterangan_custom_edit').val("");
			}
			if (data.data.keterangan != null) {
				var keterangan = data.data.keterangan;
			} else {
				var keterangan = '';
			}
			if (data.data.style != null && data.data.style != 'none') {
				var style = data.data.style + ' ' + keterangan;
			} else {
				var style = keterangan;
			}
			// jQuery('#keterangan_style_edit_penjualan').show();
			// $$('#keterangan_edit').css("display", "none");
			// jQuery('#keterangan_style_edit_penjualan').html(style);
			jQuery('#keterangan_edit').val(keterangan);

			if (data.data.extra_detail == 0 && data.data.grosir_detail == 1) {
				jQuery('#extra_penjualan_edit_detail_1').val(1);
			} else if (data.data.extra_detail == 1 && data.data.grosir_detail == 0) {
				jQuery('#extra_penjualan_edit_detail_1').val(0);
			} else {
				jQuery('#extra_penjualan_edit_detail_1').val(0);
			}

			$$('#file_edit_penjualan_1').prop('required', false)
			$$('#file_edit_penjualan_1').prop('validate', false)

			var tipe = data.data.penjualan_jenis;
			if (tipe.indexOf("TAS") != -1) {
				$$('#el_ukuran_hc_penjualan_edit_1').hide();
				$$('#el_ukuran_ts_penjualan_edit_1').hide();
				$$('#el_style_hc_penjualan_edit_1').hide();
				$$('#el_extra_penjualan_edit_detail_1').hide();
				$$('#ukuran_penjualan_edit_hc_1').prop('required', false);
				$$('#ukuran_penjualan_edit_hc_1').prop('validate', false);
				$$('#ukuran_penjualan_edit_ts_1').prop('required', false);
				$$('#ukuran_penjualan_edit_ts_1').prop('validate', false);
				$$('#style_hc_penjualan_edit_input_1').prop('required', false);
				$$('#style_hc_penjualan_edit_input_1').prop('validate', false);
				document.getElementById("price_edit_penjualan_popup").readOnly = false;
			} else {
				$$('#el_ukuran_hc_penjualan_edit_1').show();
				$$('#el_extra_penjualan_edit_detail_1').show();
				$$('#el_ukuran_ts_penjualan_edit_1').hide();
				$$('#el_style_hc_penjualan_edit_1').show();
				$$('#ukuran_penjualan_edit_hc_1').prop('required', true);
				$$('#ukuran_penjualan_edit_hc_1').prop('validate', true);
				$$('#ukuran_penjualan_edit_ts_1').prop('required', false);
				$$('#ukuran_penjualan_edit_ts_1').prop('validate', false);
				$$('#style_hc_penjualan_edit_input_1').prop('required', true);
				$$('#style_hc_penjualan_edit_input_1').prop('validate', true);
				document.getElementById("price_edit_penjualan_popup").readOnly = true;
				if (tipe.indexOf("HCC") != -1) {
					showselectBoxUkuranPenjualanEdit('HC-112', 1)
					firstShowPenjualanEdit();
				} else if (tipe.indexOf("HC") != -1) {
					showselectBoxUkuranPenjualanEdit(tipe.substr(0, 6), 1)
					firstShowPenjualanEdit();
				}
			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function firstShowPenjualanEdit() {
	setTimeout(function () {
		var style = jQuery('#penjualan_old_style_edit_1').val();
		var ukuran = jQuery('#penjualan_old_ukuran_edit_1').val();
		// var style_array = style.split(', ');
		// var smartSelectStyle = app.smartSelect.get('.smart-select-style-hc-edit');
		// smartSelectStyle.setValue(style_array);
		$$('#ukuran_penjualan_edit_hc_1').val(ukuran);
		$.each(style.split(', '), function (i, e) {
			$("#style_penjualan_edit_hc_1 option[value='" + e + "']").prop("selected", true);
		});
		$$('#style_hc_penjualan_edit_input_1').html(style);
	}, 500);
}


// function openDialogViewManager() {

// 	var popup;
// 	jQuery.ajax({
// 		type: 'POST',
// 		url: "" + BASE_API + "/get-count-status-cs-view",
// 		dataType: 'JSON',
// 		data: {
// 			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
// 		},
// 		beforeSend: function () {
// 		},
// 		success: function (data) {
// 			if (data.data_kirim > 0) {
// 				// app.popup.open('.status-view-manager');
// 				// // Create popup

// 				if (!popup) {
// 					popup = app.popup.create({
// 						el: '.status-view-manager',
// 						closeByBackdropClick: true,
// 						// closeOnEscape: true,
// 						// swipeToClose: false,
// 					});

// 					// Open it
// 					popup.open();
// 					getPenjualanHeaderNotif(1);
// 				}
// 			}


// 			if (data.data_kirim > 0) {
// 				$$('#merah-kirim').removeClass("card-color-red-important");
// 				$$('#merah-kirim').addClass("card-color-red-important");
// 			} else {
// 				$$('#merah-kirim').removeClass("card-color-red-important");
// 			}


// 		},
// 		error: function (xmlhttprequest, textstatus, message) {
// 		}
// 	});
// }

function getProspekHeaderManager() {

	var prospek_value = "";
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-prospek-header-manager",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			no = 1;

			$.each(data.data, function (i, item) {

				if (item.tanggal_komunikasi == '' || item.tanggal_komunikasi == null) {
					tanggal_komunikasi = '-';
				} else {
					tanggal_komunikasi = moment(item.tanggal_komunikasi).format('DD-MMM');
				}

				if (item.hasil_pertemuan1 == '' || item.hasil_pertemuan1 == null) {
					hasil_pertemuan1 = '-';
					tanggal_1 = '-';
				} else {
					hasil_pertemuan1 = item.hasil_pertemuan1;
					tanggal_1 = moment(item.tanggal_status1).format('DD-MMM');
				}

				if (item.hasil_pertemuan2 == '' || item.hasil_pertemuan2 == null) {
					hasil_pertemuan2 = '-';
					tanggal_2 = '-';
				} else {
					hasil_pertemuan2 = item.hasil_pertemuan2;
					tanggal_2 = moment(item.tanggal_status2).format('DD-MMM');
				}

				if (item.hasil_pertemuan3 == '' || item.hasil_pertemuan3 == null) {
					hasil_pertemuan3 = '-';
					tanggal_3 = '-';
				} else {
					hasil_pertemuan3 = item.hasil_pertemuan3;
					tanggal_3 = moment(item.tanggal_status3).format('DD-MMM');
				}

				if (item.hasil_komunikasi == '' || item.hasil_komunikasi == null) {
					hasil_komunikasi = '-';
				} else {
					hasil_komunikasi = item.hasil_komunikasi;
				}
				if (item.status_kunjungan == 'LOSS') {
					var LOSS = "selected";
					var OK = "";
				} else {
					var OK = "selected";
					var LOSS = "";
				}

				prospek_value += '<tr>';
				prospek_value += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;">' + item.client_nama + '</td>';
				prospek_value += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;">' + item.karyawan_nama + '</td>';
				prospek_value += '<td style="border-left :1px solid gray; border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell ">' + tanggal_1 + '</td>';
				prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + tanggal_2 + '</td>';
				prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + tanggal_3 + '</td>';
				prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
				prospek_value += '<button onclick="detailProspekManager(\'' + item.lat_1 + '\',\'' + item.lng_1 + '\',\'' + item.lat_2 + '\',\'' + item.lng_2 + '\',\'' + item.lat_3 + '\',\'' + item.lng_3 + '\',\'' + item.file_selfie_card_1 + '\',\'' + item.file_selfie_card_2 + '\',\'' + item.file_selfie_card_3 + '\',\'' + item.file_id_card_1 + '\',\'' + item.file_id_card_2 + '\',\'' + item.file_id_card_3 + '\',\'' + tanggal_komunikasi + '\',\'' + hasil_komunikasi.replace(/\s/g, " ") + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.kunjungan_detail_id + '\',\'' + item.karyawan_id + '\',\'' + item.status + '\',\'' + item.tanggal_janjian + '\',\'' + item.tanggal_status1 + '\',\'' + item.tanggal_status2 + '\',\'' + item.tanggal_status3 + '\',\'' + hasil_pertemuan1.replace(/\s/g, " ") + '\',\'' + hasil_pertemuan2.replace(/\s/g, " ") + '\',\'' + hasil_pertemuan3.replace(/\s/g, " ") + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-prospek-manager">Detail</button>';
				prospek_value += '</td>';
				prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
				prospek_value += '<button onclick="getKunjunganBbm(\'' + item.kunjungan_detail_id + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".bbm-popup">BBM</button>';
				prospek_value += '</td>';
				prospek_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
				prospek_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusViewProspek(\'' + item.kunjungan_detail_id + '\',1);">eye</i></label>';
				prospek_value += '</td>';
				prospek_value += '</tr>';
			});
			$$('#prospek_manager_value').html(prospek_value);
			$$('#total_data_manager').html(data.data.length);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function detailProspekManager(lat_1, lng_1, lat_2, lng_2, lat_3, lng_3, file_selfie_card_1, file_selfie_card_2, file_selfie_card_3, file_id_card_1, file_id_card_2, file_id_card_3, tanggal_komunikasi, hasil_komunikasi, client_alamat, person, posisi, client_id, client_kota, client_nama, telpon, kunjungan_detail_id, karyawan_id, status, tanggal_janjian, tanggal_status1, tanggal_status2, tanggal_status3, hasil_pertemuan1, hasil_pertemuan2, hasil_pertemuan3) {


	$$('#popup-detail-prospek-tgl-komunikasi').html(tanggal_komunikasi);
	$$('#popup-detail-prospek-td-client_nama').html(client_nama);
	$$('#popup-detail-prospek-client_person').html(person);
	$$('#popup-detail-prospek-client_kota').html(client_kota);
	$$('#popup-detail-prospek-client_posisi').html(posisi);
	$$('#popup-detail-prospek-client_telpon').html(telpon);
	$$('#popup-detail-prospek-hasil-komunikasi').html(hasil_komunikasi);
	$$('#tanggal_status1_detail').val(moment(tanggal_status1).format('YYYY-MM-DD'));
	$$('#tanggal_status2_detail').val(moment(tanggal_status2).format('YYYY-MM-DD'));
	$$('#tanggal_status3_detail').val(moment(tanggal_status3).format('YYYY-MM-DD'));

	if (lat_1 == "null" && lat_2 == "null" && lat_3 == "null") {
		localStorage.setItem("lat_1", localStorage.getItem("lat_usr"));
		localStorage.setItem("lng_1", localStorage.getItem("lng_usr"));
		localStorage.setItem("lat_2", "-");
		localStorage.setItem("lng_2", "-");
		localStorage.setItem("lat_3", "-");
		localStorage.setItem("lng_3", "-");
	} else if (lat_1 != "-" && lat_2 == "-" && lat_3 == "-") {
		localStorage.setItem("lat_1", lat_1);
		localStorage.setItem("lng_1", lng_1);
		localStorage.setItem("lat_2", localStorage.getItem("lat_usr"));
		localStorage.setItem("lng_2", localStorage.getItem("lng_usr"));
		localStorage.setItem("lat_3", "-");
		localStorage.setItem("lng_3", "-");
	} else if (lat_1 != "-" && lat_2 != "-" && lat_3 == "-") {
		localStorage.setItem("lat_1", lat_1);
		localStorage.setItem("lng_1", lng_1);
		localStorage.setItem("lat_2", lat_2);
		localStorage.setItem("lng_2", lng_2);
		localStorage.setItem("lat_3", localStorage.getItem("lat_usr"));
		localStorage.setItem("lng_3", localStorage.getItem("lng_usr"));
	} else if (lat_1 != "-" && lat_2 != "-" && lat_3 != "-") {
		localStorage.setItem("lat_1", lat_1);
		localStorage.setItem("lng_1", lng_1);
		localStorage.setItem("lat_2", lat_2);
		localStorage.setItem("lng_2", lng_2);
		localStorage.setItem("lat_3", localStorage.getItem("lat_usr"));
		localStorage.setItem("lng_3", localStorage.getItem("lng_usr"));
	}

	if (file_id_card_1 != "-") {
		localStorage.setItem("file_id_card_1", file_id_card_1);
	} else {
		localStorage.setItem("file_id_card_1", 'null');
	}

	if (file_selfie_card_1 != "-") {
		localStorage.setItem("file_selfie_card_1", file_selfie_card_1);
	} else {
		localStorage.setItem("file_selfie_card_1", 'null');
	}

	if (file_id_card_2 != "-") {
		localStorage.setItem("file_id_card_2", file_id_card_2);
	} else {
		localStorage.setItem("file_id_card_2", 'null');
	}

	if (file_selfie_card_2 != "-") {
		localStorage.setItem("file_selfie_card_2", file_selfie_card_2);
	} else {
		localStorage.setItem("file_selfie_card_2", 'null');
	}


	if (file_id_card_3 != "-") {
		localStorage.setItem("file_id_card_3", file_id_card_3);
	} else {
		localStorage.setItem("file_id_card_3", 'null');
	}

	if (file_selfie_card_3 != "-") {
		localStorage.setItem("file_selfie_card_3", file_selfie_card_3);
	} else {
		localStorage.setItem("file_selfie_card_3", 'null');
	}

	$$('.detail_pertemuan_1_section').hide();
	$$('.detail_pertemuan_2_section').hide();
	$$('.detail_pertemuan_3_section').hide();
	$('#hasil_pertemuan1_detail').removeClass('required');
	$('#tanggal_status1_detail').removeClass('required');
	$('#hasil_pertemuan2_detail').removeClass('required');
	$('#tanggal_status2_detail').removeClass('required');
	$('#hasil_pertemuan3_detail').removeClass('required');
	$('#tanggal_status3_detail').removeClass('required');

	var no_kunjungan = 1;

	if (hasil_pertemuan1 != "-") {
		no_kunjungan = 2;
		$$('.detail_pertemuan_2_section').show();
		$('#hasil_pertemuan2_detail').addClass('required');
		$('#tanggal_status2_detail').addClass('required');
		$$("#file_id_card_1_view_detail").attr("src", "");
		$$("#file_selfie_card_1_view_detail").attr("src", "");
		$('#hasil_pertemuan1_detail').val(hasil_pertemuan1);
		$('#hasil_pertemuan1_detail').prop('readonly', true);
		$('#tanggal_status1_detail').prop('readonly', true);
		$('#file_id_card_1').hide();
		$('#file_selfie_card_1').hide();

		var lokasi_1 = "";
		lokasi_1 += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
		lokasi_1 += 'src="https://maps.google.com/maps?q=' + lat_1 + ',' + lng_1 + '&hl=id&z=14&amp;output=embed">';
		lokasi_1 += '</iframe>';

		if (lat_1 != 'null' && lng_1 != 'null' || lat_1 != '-' && lng_1 != '-') {
			jQuery("#lokasi1_detail").html(lokasi_1);
		} else {
			jQuery("#lokasi1_detail").html("Lokasi Tidak Ada");
		}

		$$("#file_id_card_1_view_detail").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_1);
		$$("#file_selfie_card_1_view_detail").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_1);
		$('.keterangan_foto1').show();

	} else {
		$$("#file_id_card_1_view_detail").attr("src", "");
		$$("#file_selfie_card_1_view_detail").attr("src", "");
		$('#hasil_pertemuan1_detail').val('');
		$('#hasil_pertemuan1_detail').addClass('required');
		$('#tanggal_status1_detail').addClass('required');
		$('#hasil_pertemuan1_detail').prop('readonly', false);
		$('#tanggal_status1_detail').prop('readonly', true);
		document.getElementById('tanggal_status1_detail').value = '-';
		$('#file_id_card_1').show();
		$('#file_selfie_card_1').show();
		$('.keterangan_foto1').hide();
		$$("#file_selfie_card_1_view_detail").attr("src", "");
	}

	if (hasil_pertemuan2 != "-") {
		no_kunjungan = 3;
		$$('.detail_pertemuan_3_section').show();
		$('#hasil_pertemuan3_detail').addClass('required');
		$('#tanggal_status3_detail').addClass('required');
		$$("#file_selfie_card_2_view_detail").attr("src", "");
		$$("#file_id_card_2_view_detail").attr("src", "");
		$('#hasil_pertemuan2_detail').val(hasil_pertemuan2);
		$('#hasil_pertemuan2_detail').prop('readonly', true);
		$('#tanggal_status2_detail').prop('readonly', true);
		$('#file_id_card_2').hide();
		$('#file_selfie_card_2').hide();
		$$("#file_id_card_2_view_detail").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_2);
		$$("#file_selfie_card_2_view_detail").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_2);
		var lokasi_2 = "";
		lokasi_2 += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
		lokasi_2 += 'src="https://maps.google.com/maps?q=' + lat_2 + ',' + lng_2 + '&hl=id&z=14&amp;output=embed">';
		lokasi_2 += '</iframe>';

		if (lat_2 != 'null' && lng_2 != 'null' || lat_2 != '-' && lng_2 != '-') {
			jQuery("#lokasi2_detail").html(lokasi_2);
		} else {
			jQuery("#lokasi2_detail").html("Lokasi Tidak Ada");
		}
		$('.keterangan_foto2').show();
		$('#hasil_pertemuan2_detail').removeClass('required');
		$('#tanggal_status2_detail').removeClass('required');
	} else {
		$$("#file_id_card_2_view_detail").attr("src", "");
		$$("#file_selfie_card_2_view_detail").attr("src", "");
		$('#hasil_pertemuan2_detail').val('');
		$('#hasil_pertemuan2_detail').prop('readonly', false);
		$('#tanggal_status2_detail').prop('readonly', true);
		document.getElementById('tanggal_status2_detail').value = '-';
		$('#file_id_card_2').show();
		$('#file_selfie_card_2').show();
		$('.keterangan_foto2').hide();
		$$("#file_selfie_card_2_view_detail").attr("src", "");
	}

	if (hasil_pertemuan3 != "-") {
		no_kunjungan = 3;
		$$("#file_id_card_3_view_detail").attr("src", "");
		$$("#file_selfie_card_3_view_detail").attr("src", "");
		$('#hasil_pertemuan3_detail').val(hasil_pertemuan3);
		$('#hasil_pertemuan3_detail').prop('readonly', true);
		$('#tanggal_status3_detail').prop('readonly', true);
		$('#file_id_card_3').hide();
		$('#file_selfie_card_3').hide();
		$$("#file_id_card_3_view_detail").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_3);
		$$("#file_selfie_card_3_view_detail").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_3);
		$('.keterangan_foto3').show();
		var lokasi_3 = "";
		lokasi_3 += '<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"';
		lokasi_3 += 'src="https://maps.google.com/maps?q=' + lat_3 + ',' + lng_3 + '&hl=id&z=14&amp;output=embed">';
		lokasi_3 += '</iframe>';

		if (lat_3 != 'null' && lng_3 != 'null' || lat_3 != '-' && lng_3 != '-') {
			jQuery("#lokasi3_detail").html(lokasi_3);
		} else {
			jQuery("#lokasi3_detail").html("Lokasi Tidak Ada");
		}
		$$('#hasil_pertemuan3_detail').removeClass('required');
		$$('#tanggal_status3_detail').removeClass('required');
		$$(".div_janjian").hide();
	} else {
		$$("#file_id_card_3_view_detail").attr("src", "");
		$$("#file_selfie_card_3_view_detail").attr("src", "");
		$('#hasil_pertemuan3_detail').val('');
		$('#hasil_pertemuan3_detail').prop('readonly', false);
		$('#tanggal_status3_detail').prop('readonly', true);
		document.getElementById('tanggal_status3_detail').value = '-';
		$$(".div_janjian").show();
		$('#file_id_card_3').show();
		$('#file_selfie_card_3').show();
		$('.keterangan_foto3').hide();
		$$("#file_selfie_card_3_view_detail").attr("src", "");
	}
}

function getKunjunganBbm(kunjungan_detail_id) {
	var bbm_value = "";
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-kunjungan-bbm",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			kunjungan_detail_id: kunjungan_detail_id,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			no = 0;
			var total_nominal = 0;
			localStorage.setItem('kunjungan_detail_id', kunjungan_detail_id);
			$.each(data.data, function (i, item) {
				no++
				bbm_value += '<tr>';
				bbm_value += '<td align="center" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;border-right :1px solid gray;">' + no + '</td>';
				bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell ">' + moment(item.tanggal_bbm).format('DD/MM/YY') + '</td>';
				bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">' + item.no_plat + '</td>';
				bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
				bbm_value += '<button onclick="showFotoBbm(\'' + item.foto_bbm + '\',\'' + item.tanggal_bbm + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".show-foto-bbm">Foto</button>';
				bbm_value += '</td>';
				bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell" align="right">' + number_format(item.nominal_bbm) + '</td>';
				bbm_value += '</tr>';
				total_nominal += parseInt(item.nominal_bbm);
			});
			bbm_value += '<tr>';
			bbm_value += '<td colspan="4" align="right"><b>TOTAL</b></td>';
			bbm_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;border-left :1px solid gray;" class="label-cell" align="right">' + number_format(total_nominal) + '</td>';
			bbm_value += '</tr>';
			$$('#bbm_values').html(bbm_value);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function showFotoBbm(foto_bbm, tanggal_nota) {

	$$('#tanggal_nota').html(moment(tanggal_nota).format('DD/MM/YY'));
	if (foto_bbm != null) {
		$$("#show_foto_bbm").attr("src", BASE_PATH_IMAGE_BBM + '/' + foto_bbm);
	} else {
		$$("#show_foto_bbm").attr("src", "https://indokoper.com/noimage.jpg");
	}
}


function kirimAlamat(penjualan_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-Alamat",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
			user_id: localStorage.getItem("user_id"),
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$("#input_alamat_kirim_popup")[0].reset();
		},
		success: function (data) {
			app.dialog.close();

			var alamat_client = "";
			var alamat_kirim = "";
			var client_nama = "";
			var hp_alamat = "";
			var client_kota = "";
			var tgl_kirim_cabang = "";
			var keterangan_cabang = "";
			var packing_kirim = "";
			var shipment_status = data.data.shipment_status || 'pending';
			var shipment_reject_reason = data.data.shipment_reject_reason || null;

			// ⭐⭐⭐ Hitung total pembayaran yang sudah divalidasi CS ⭐⭐⭐
			var total_pembayaran_validated = 0;

			if (data.data.valid_cs_1 == 1 && data.data.pembayaran_1 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_1);
			}
			if (data.data.valid_cs_2 == 1 && data.data.pembayaran_2 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_2);
			}
			if (data.data.valid_cs_3 == 1 && data.data.pembayaran_3 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_3);
			}
			if (data.data.valid_cs_4 == 1 && data.data.pembayaran_4 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_4);
			}
			if (data.data.valid_cs_5 == 1 && data.data.pembayaran_5 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_5);
			}
			if (data.data.valid_cs_6 == 1 && data.data.pembayaran_6 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_6);
			}
			if (data.data.valid_cs_7 == 1 && data.data.pembayaran_7 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_7);
			}
			if (data.data.valid_cs_8 == 1 && data.data.pembayaran_8 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_8);
			}
			if (data.data.valid_cs_9 == 1 && data.data.pembayaran_9 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_9);
			}
			if (data.data.valid_cs_10 == 1 && data.data.pembayaran_10 != null) {
				total_pembayaran_validated += parseFloat(data.data.pembayaran_10);
			}

			// Hitung sisa bayar dari pembayaran yang sudah divalidasi
			var sisa_bayar = parseFloat(data.data.penjualan_grandtotal - total_pembayaran_validated);

			console.log('=== KIRIM ALAMAT DEBUG ===');
			console.log('Penjualan ID:', penjualan_id);
			console.log('Grand Total:', data.data.penjualan_grandtotal);
			console.log('Pembayaran Total (DB):', data.data.penjualan_jumlah_pembayaran);
			console.log('Pembayaran Validated:', total_pembayaran_validated);
			console.log('Sisa Bayar (Validated):', sisa_bayar);
			console.log('Shipment Status:', shipment_status);

			if (data.data != null) {
				alamat_client = data.data.client_alamat;
				alamat_kirim = data.data.alamat_kirim_penjualan;
				client_nama = data.data.client_nama;
				hp_alamat = data.data.client_telp;
				client_id = data.data.client_id;
				client_kota = data.data.client_kota;
				karyawan_id = data.data.karyawan_id;
				if (data.data.tgl_kirim_cabang != null) {
					tgl_kirim_cabang = moment(data.data.tgl_kirim_cabang).format('YYYY-MM-DD');
				}
				keterangan_cabang = data.data.keterangan_cabang;

				// ✅ FIX: Gunakan packing_id (angka) bukan packing (string nama)
				// karena <option value="1">, <option value="2">, <option value="3">
				packing_kirim = data.data.packing_id ? String(data.data.packing_id) : '0';
			}

			// Set foto produksi
			if (data.data.foto_produksi_selesai != null) {
				jQuery('#file_foto_produksi_selesai_sales_view').attr('src', BASE_PATH_IMAGE_BUKTI_PRODUKSI + '/' + data.data.foto_produksi_selesai);
			} else {
				jQuery('#file_foto_produksi_selesai_sales_view').attr('src', 'https://indokoper.com/noimage.jpg');
			}

			// Set data ke form
			jQuery('#alamat_sekarang_popup').val(alamat_client);
			jQuery('#nama-client-alamat').html(client_nama);
			jQuery('#penjualan_id_alamat').val(penjualan_id);
			jQuery('#client_id_alamat').val(client_id);
			jQuery('#karyawan_id_alamat').val(karyawan_id);
			jQuery('#hp_alamat').val(hp_alamat);
			jQuery('#client_alamat_kota').val(client_kota);
			jQuery('#alamat_kirim_popup').val(alamat_kirim || '');
			jQuery('#tgl_kirim_cabang').val(tgl_kirim_cabang);
			jQuery('#keterangan_cabang').val(keterangan_cabang);
			jQuery('#packing_kirim').val(packing_kirim);  // ✅ Sekarang set ID angka (1/2/3)

			var saveButton = jQuery('#tambah_alamat_kirim_button_save');

			// ===== LOGIKA MODE =====

			if (alamat_kirim != null && alamat_kirim != '' && shipment_status !== 'rejected') {
				// SUDAH ADA ALAMAT KIRIM = VIEW ONLY

				// Disable semua input
				jQuery('#alamat_kirim_popup').prop('disabled', true).prop('readonly', true);
				jQuery('#tgl_kirim_cabang').prop('disabled', true).prop('readonly', true);
				jQuery('#keterangan_cabang').prop('disabled', true).prop('readonly', true);
				jQuery('#packing_kirim').prop('disabled', true);

				// Tampilkan teks readonly, sembunyikan select
				// ✅ FIX: Map dari packing_id ke label
				var packingLabels = { '1': 'Polos', '2': 'Plastik', '3': 'Kardus' };
				var packingVal = (packing_kirim && packing_kirim !== '0')
					? (packingLabels[packing_kirim] || packing_kirim)
					: 'Tidak Ada Packing';
				jQuery('#packing_kirim').hide();
				jQuery('#packing_kirim_readonly').val(packingVal).show();

				// Hide button simpan
				saveButton.hide();

				// Tampilkan status info jika belum lunas dan masih pending
				if (sisa_bayar > 0 && shipment_status === 'requested') {
					if (jQuery('#shipment_status_info').length === 0) {
						var statusHtml = '<div id="shipment_status_info" style="text-align:center; padding:15px; margin-top:-20px;">';
						statusHtml += '<div style="background-color:#ff9500; color:white; padding:12px; border-radius:8px; font-size:15px; font-weight:bold;">';
						statusHtml += '<i class="f7-icons" style="font-size:20px; vertical-align:middle;">clock_fill</i> ';
						statusHtml += 'MENUNGGU PERSETUJUAN CRM';
						statusHtml += '</div>';
						statusHtml += '</div>';
						jQuery('center:has(#tambah_alamat_kirim_button_save)').prepend(statusHtml);
					} else {
						jQuery('#shipment_status_info').show();
					}
				} else {
					jQuery('#shipment_status_info').hide();
				}

			} else {

				// BELUM ADA INPUT ATAU REJECTED = EDITABLE
				if (karyawan_id == localStorage.getItem("user_id")) {
					console.log("TEST: ", localStorage.getItem("user_id"));
					// Enable input
					jQuery('#alamat_kirim_popup').prop('disabled', false).prop('readonly', false);
					jQuery('#tgl_kirim_cabang').prop('disabled', false).prop('readonly', false);
					jQuery('#keterangan_cabang').prop('disabled', false).prop('readonly', false);
					jQuery('#packing_kirim').prop('disabled', false);

					// Sembunyikan teks readonly, tampilkan select
					jQuery('#packing_kirim_readonly').hide();
					jQuery('#packing_kirim').show();

					// Show button dengan text dan style sesuai status pembayaran
					saveButton.show();

					// Clear previous status/reject info
					jQuery('#shipment_status_info').remove();
					jQuery('#shipment_reject_info').remove();

					if (shipment_status === 'rejected') {
						// 🔴 MERAH - Ditolak, bisa edit dan ajukan ulang
						saveButton.text('Ajukan Ulang');
						saveButton.removeClass('bg-dark-gray-young text-add-colour-black-soft btn-color-greenWhite btn-color-blueWhite btn-color-orangeWhite');
						saveButton.addClass('btn-color-redWhite');

						// Tampilkan alasan rejection dari CS
						if (shipment_reject_reason) {
							var rejectHtml = '<div id="shipment_reject_info" style="padding: 10px 10px 15px 0;margin-top:-20px;margin-bottom:10px;">';
							rejectHtml += '<div style="color:#d32f2f; padding:10px 0; font-weight:bold; font-size:14px; text-align:left;">';
							rejectHtml += 'Catatan Reject dari CRM';
							rejectHtml += '</div>';
							rejectHtml += '<div style="border:2px solid #d32f2f; padding:15px; border-radius:8px; color:#d32f2f; font-size:14px; text-align:left;">';
							rejectHtml += shipment_reject_reason;
							rejectHtml += '</div>';
							rejectHtml += '</div>';
							jQuery('center:has(#tambah_alamat_kirim_button_save)').prepend(rejectHtml);
						}

					} else if (sisa_bayar > 0) {
						// 🟠 ORANGE - Belum lunas, perlu ajukan persetujuan
						saveButton.text('Ajukan Persetujuan');
						saveButton.removeClass('bg-dark-gray-young text-add-colour-black-soft btn-color-greenWhite btn-color-blueWhite btn-color-redWhite');
						saveButton.addClass('btn-color-orangeWhite');
					} else {
						// ⚫ ABU-ABU - Sudah lunas, langsung simpan
						saveButton.text('Simpan');
						saveButton.removeClass('btn-color-orangeWhite btn-color-greenWhite btn-color-blueWhite btn-color-redWhite');
						saveButton.addClass('bg-dark-gray-young text-add-colour-black-soft');
					}
					saveButton.prop('disabled', false);
				} else {
					// MILIK USER LAIN = VIEW ONLY

					// Disable semua input
					jQuery('#alamat_kirim_popup').prop('disabled', true).prop('readonly', true);
					jQuery('#tgl_kirim_cabang').prop('disabled', true).prop('readonly', true);
					jQuery('#keterangan_cabang').prop('disabled', true).prop('readonly', true);
					jQuery('#packing_kirim').prop('disabled', true);

					// Tampilkan teks readonly, sembunyikan select
					// ✅ FIX: Map dari packing_id ke label
					var packingLabels = { '1': 'Polos', '2': 'Plastik', '3': 'Kardus' };
					var packingVal = (packing_kirim && packing_kirim !== '0')
						? (packingLabels[packing_kirim] || packing_kirim)
						: 'Tidak Ada Packing';
					jQuery('#packing_kirim').hide();
					jQuery('#packing_kirim_readonly').val(packingVal).show();

					// Hide button simpan
					saveButton.hide();

					// Tampilkan status info jika belum lunas dan masih pending
					if (sisa_bayar > 0 && shipment_status === 'requested') {
						if (jQuery('#shipment_status_info').length === 0) {
							var statusHtml = '<div id="shipment_status_info" style="text-align:center; padding:15px; margin-top:-20px;">';
							statusHtml += '<div style="background-color:#ff9500; color:white; padding:12px; border-radius:8px; font-size:15px; font-weight:bold;">';
							statusHtml += '<i class="f7-icons" style="font-size:20px; vertical-align:middle;">clock_fill</i> ';
							statusHtml += 'MENUNGGU PERSETUJUAN CRM';
							statusHtml += '</div>';
							statusHtml += '</div>';
							jQuery('center:has(#tambah_alamat_kirim_button_save)').prepend(statusHtml);
						} else {
							jQuery('#shipment_status_info').show();
						}
					} else {
						jQuery('#shipment_status_info').hide();
					}
				}

			}
		},
		error: function (xmlhttprequest, textstatus, message) {
			app.dialog.close();
			app.dialog.alert('Gagal mengambil data');
		}
	});
}

function getInputFee(karyawan_id, penjualan_id, entertain, invoice_fee) {
	var logFee_value = "";
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-log-fee-manager",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
			karyawan_id: karyawan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$('#last_fee_penjualan').html('');
			$("#input_fee_penjualan_popup")[0].reset();
		},
		success: function (data) {
			app.dialog.close();
			var number = 0;
			// $$('#invoice_fee').html(invoice_fee);
			$$('#penjualan_id_fee_popup').val(penjualan_id);
			$.each(data.data, function (i, item) {
				number++
				if (item.style != null && item.style != 'none') {
					var style = item.style;
				} else {
					var style = '';
				}
				logFee_value += '<tr>';
				logFee_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number + '</td>';
				logFee_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + moment(item.dt_record).format('DD-MMM-YY') + '</td>';
				logFee_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + style + '' + item.keterangan + '</td>';
				logFee_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(item.nominal_fee) + '</td>';
				logFee_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell"><button data-popup=".bukti-fee-foto" onclick="buktiFotoFeeView(\'' + item.foto + '\')" class="popup-open text-add-colour-black-soft  card-color-blue button-small col button text-bold" style="color:white;">Foto</button></td>';
				logFee_value += '</tr>';
			});

			$$('#last_fee_penjualan').html(logFee_value);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

jQuery('#perusahaan_penjualan_filter').select2({
	placeholder: 'Cari Perusahaan',
	allowClear: true,
	ajax: {
		url: BASE_API + '/list-perusahaan', // ganti dengan endpoint kamu
		dataType: 'json',
		delay: 250,
		data: function (params) {
			return {
				q: params.term || '' // parameter pencarian
			};
		},
		processResults: function (data) {
			// Asumsikan API return: [{id:1, text:'PT ABC'}, {id:2, text:'PT XYZ'}]
			return {
				results: data.map(function (item) {
					return { id: item.client_id, text: item.client_nama };
				})
			};
		}
	},
	minimumInputLength: 1,
	theme: 'default',
	width: 'resolve'
});

// Trigger fungsi lama kamu saat memilih perusahaan
jQuery('#perusahaan_penjualan_filter').on('change', function () {
	doSearchByPerusahaanPenjualan(); // tetap pakai fungsi lama kamu
});

function inputLogFeeProcess() {
	var formData = new FormData(jQuery("#input_fee_penjualan_popup")[0]);
	formData.append('karyawan_nama', localStorage.getItem("karyawan_nama"));
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		if (!$$('#input_fee_penjualan_popup')[0].checkValidity()) {
			app.dialog.alert('Cek Isi Form Anda');
		} else {
			jQuery.ajax({
				type: 'POST',
				url: "" + BASE_API + "/input-fee-process",
				dataType: 'JSON',
				data: formData,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Harap Tunggu');
				},
				success: function (data) {
					app.dialog.close();
					getPenjualanHeader(1);
					getInputFee();
					$('#back_popup_fee_penjualan').trigger('click');
				},
				error: function (xmlhttprequest, textstatus, message) {
				}
			});
		}
	}
}

function buktiFotoFeeView(foto_fee) {
	jQuery('#file_foto_fee_view_now').attr('src', BASE_PATH_IMAGE_FOTO_FEE + '/' + foto_fee);
}

function editLogoPerusahaan() {
	if (jQuery('#edit_customer_logo').val() == '' || jQuery('#edit_customer_logo').val() == null) {
		$$('#edit_value_customer_logo').html('Emblem');
		$$('#edit_value_customer_logo').css("background-color", "#ff3b30");
		$$('#edit_value_customer_logo').removeClass('bg-dark-gray-young');
	} else {
		$$('#edit_value_customer_logo').html($$('#edit_customer_logo').val().replace('fakepath', ''));
		$$('#edit_value_customer_logo').addClass('bg-dark-gray-young');
	}
}

function editLogoPerusahaanPenjualan() {
	if (jQuery('#edit_customer_logo_penjualan').val() == '' || jQuery('#edit_customer_logo_penjualan').val() == null) {
		$$('#edit_value_customer_logo_penjualan').html('Emblem');
		$$('#edit_value_customer_logo_penjualan').css("background-color", "#ff3b30");
		$$('#edit_value_customer_logo_penjualan').removeClass('bg-dark-gray-young');
	} else {
		$$('#edit_value_customer_logo_penjualan').html($$('#edit_customer_logo_penjualan').val().replace('fakepath', ''));
		$$('#edit_value_customer_logo_penjualan').addClass('bg-dark-gray-young');
	}
}

function editLogoPerusahaanBordir() {

	if (jQuery('#edit_customer_logo_bordir').val() == '' || jQuery('#edit_customer_logo_bordir').val() == null) {
		$$('#edit_value_customer_logo_bordir').html('Bordir');
		$$('#edit_value_customer_logo_bordir').css("background-color", "#ff3b30");
		$$('#edit_value_customer_logo_bordir').removeClass('bg-dark-gray-young');
	} else {
		$$('#edit_value_customer_logo_bordir').html($$('#edit_customer_logo_bordir').val().replace('fakepath', ''));
		$$('#edit_value_customer_logo_bordir').addClass('bg-dark-gray-young');
	}
}

function editLogoPerusahaanBordirPenjualan() {

	if (jQuery('#edit_customer_logo_bordir_penjualan').val() == '' || jQuery('#edit_customer_logo_bordir_penjualan').val() == null) {
		$$('#edit_value_customer_logo_bordir_penjualan').html('Bordir');
		$$('#edit_value_customer_logo_bordir_penjualan').css("background-color", "#ff3b30");
		$$('#edit_value_customer_logo_bordir_penjualan').removeClass('bg-dark-gray-young');
	} else {
		$$('#edit_value_customer_logo_bordir_penjualan').html($$('#edit_customer_logo_bordir_penjualan').val().replace('fakepath', ''));
		$$('#edit_value_customer_logo_bordir_penjualan').addClass('bg-dark-gray-young');
	}
}

function editLogoPerusahaanTambahan() {
	if (jQuery('#edit_customer_logo_tambahan').val() == '' || jQuery('#edit_customer_logo_tambahan').val() == null) {
		$$('#edit_value_customer_logo_tambahan').html('Tambahan');
		$$('#edit_value_customer_logo_tambahan').css("background-color", "#ff3b30");
		$$('#edit_value_customer_logo_tambahan').removeClass('bg-dark-gray-young');
	} else {
		$$('#edit_value_customer_logo_tambahan').html($$('#edit_customer_logo_tambahan').val().replace('fakepath', ''));
		$$('#edit_value_customer_logo_tambahan').addClass('bg-dark-gray-young');
	}
}

function editLogoPerusahaanTambahanPenjualan() {
	if (jQuery('#edit_customer_logo_tambahan_penjualan').val() == '' || jQuery('#edit_customer_logo_tambahan_penjualan').val() == null) {
		$$('#edit_value_customer_logo_tambahan_penjualan').html('Tambahan');
		$$('#edit_value_customer_logo_tambahan_penjualan').css("background-color", "#ff3b30");
		$$('#edit_value_customer_logo_tambahan_penjualan').removeClass('bg-dark-gray-young');
	} else {
		$$('#edit_value_customer_logo_tambahan_penjualan').html($$('#edit_customer_logo_tambahan_penjualan').val().replace('fakepath', ''));
		$$('#edit_value_customer_logo_tambahan_penjualan').addClass('bg-dark-gray-young');
	}
}




function getSuratJalanListCustomer(penjualan_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-surat-jalan-list-customer",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var penjualan_value = "";

			if (data.data.length != 0) {
				$.each(data.data, function (i, item) {


					if (item.foto_produksi_sjc != null) {
						var color_btn_sjc_id = "btn-color-blueWhite";
					} else {
						var color_btn_sjc_id = "bg-dark-gray-young text-add-colour-black-soft";
					}

					penjualan_value += '<tr>';
					penjualan_value += '<td width="25%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.penjualan_jenis + '</td>';
					penjualan_value += '<td align="center" width="25%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><button data-popup=".view-foto-sjc" onclick="viewFotoSjc(\'' + item.foto_produksi_sjc + '\')" class="popup-open ' + color_btn_sjc_id + ' button-small col button text-bold">Foto</button></td>';
					penjualan_value += '</tr>'
				});
			} else {
				app.dialog.alert('Tidak Ada Surat Jalan');
			}
			$$('#detail_surat_jalan_customer').html(penjualan_value);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function viewFotoSjc(isi_foto) {
	$('#file_foto_sjc_view_now').attr('src', '');
	var BASE_PATH_IMAGE_BUKTI_SJC_CABANG = 'https://indokoper.com/file_foto_sjc';
	if (isi_foto != 'null') {
		jQuery('#file_foto_sjc_view_now').attr('src', BASE_PATH_IMAGE_BUKTI_SJC_CABANG + '/' + isi_foto);
	} else {
		jQuery('#file_foto_sjc_view_now').attr('src', 'https://indokoper.com/noimage.jpg');
	}
}


function getLastOrder() {
	var bulan_order = "";
	if (jQuery('#bulan_last_order').val() == '' || jQuery('#bulan_last_order').val() == null) {
		bulan_order = 'empty';
	} else {
		bulan_order = jQuery('#bulan_last_order').val();
	}

	var lastOrder_value = "";

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-last-order-cs",
		dataType: 'JSON',
		data: {
			bulan_order: bulan_order,
			karyawan_id: jQuery("#sales_id").val(),
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var number = 0;
			// console.log(data.data_penjualan[8].penjualan_tanggal);

			$.each(data.data, function (i, item) {
				number++
				lastOrder_value += '<tr>';
				lastOrder_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number + '</td>';
				lastOrder_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell popup-open" onclick="openPopupALamat(\'' + item.client_telp + '\',\'' + item.client_cp + '\',\'' + item.client_nama + '\',\'' + item.client_alamat + '\');" data-popup=".popup-alamat">' + item.client_nama + '</td>';
				lastOrder_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.karyawan_nama + '</td>';
				// lastOrder_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.presentase_omset + '</td>';
				lastOrder_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + moment(item.penjualan_tanggal).format('DD-MMM-YY') + '</td>';
				lastOrder_value += '</tr>';
			});
			$$('#last_order_table').html(lastOrder_value);

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function getPesananPoint(client_id, client_nama) {
	var pesanan_value = "";

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-pesanan-client",
		dataType: 'JSON',
		data: {
			client_id: client_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var number = 0;
			// console.log(data.data_penjualan[8].penjualan_tanggal);

			$.each(data.data, function (i, val) {
				number++
				pesanan_value += '<tr>';
				pesanan_value += '<td style="border-left:1px solid gray;border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number + '</td>';
				pesanan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + moment(val.pembayaran_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
				pesanan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + val.penjualan_jenis + '</td>';
				pesanan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + val.penjualan_qty + '</td>';
				pesanan_value += '</tr>';
			});
			$$('#order-perusahaan-point').html(pesanan_value);
			$$('#pesanan-client-nama').html(client_nama);

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function openPopupALamat(client_telp, client_cp, client_nama, client_alamat) {

	$('#popup-alamat-client-td').html(client_nama);
	$('#alamat_client_sj').html(client_alamat);
	$('#pic_sj').html(client_cp);
	$('#no_hp_sj').html(client_telp);
}

function penjualanGetPerformaDownload(performa_header_id, karyawan_id, client_kota, client_nama, performa_tanggal_kirim, performa_total_qty, extra, packing) {
	var proforma_data = "";
	// Format label packing untuk dokumen
	var packingLabels = { 'polos': 'Polos', 'plastik': 'Plastik', 'kardus': 'Kardus' };
	var packing_label = packing && packing !== '0' ? 'Packing ' + (packingLabels[packing] || packing.charAt(0).toUpperCase() + packing.slice(1)) : 'Packing finishing plastic';
	if (extra != 1) {
		header_koper = 'INDOKOPER';
		header_web = '';
		tipe_grosir = "Grosir"
	} else {
		header_koper = 'KOPERINDO';
		header_web = 'www.koperindo.id';
		tipe_grosir = "Xtra"
	}
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-performa-cs",
		dataType: 'JSON',
		data: {
			karyawan_id: karyawan_id,
			performa_header_id: performa_header_id
		},
		beforeSend: function () {

			proforma_data += '<table width="100%" border="0">';
			proforma_data += '	<tr>';
			proforma_data += '		<td colspan="6"  align="center"><b>' + header_koper + '</b><br>Industri Tas & Koper</td>';
			proforma_data += '	</tr>';
			proforma_data += '	<tr>';
			proforma_data += '		<td colspan="6" align="center">' + header_web + '';
			proforma_data += '			<hr>';
			proforma_data += '		</td>';
			proforma_data += '	</tr>';
			proforma_data += '	<tr>';
			proforma_data += '		<td colspan="5" align="center">Proforma</td>';
			proforma_data += '	</tr>';
			proforma_data += '	<tr>';
			proforma_data += '		<td colspan="3" align="left" >Kepada Yth :  ' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + ' <br><font style="padding:94px;"> ' + client_kota + '</font></td>';
			proforma_data += '		<td colspan="2" align="right">' + moment(performa_tanggal_kirim).format('DDMMYY') + '-' + performa_header_id.replace(/\PI_/g, '').replace(/^0+/, '') + '</td>';
			proforma_data += '	</tr>';
			proforma_data += '	<tr>';
			proforma_data += '		<td colspan="2" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Spesifikasi</td>';
			proforma_data += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
			proforma_data += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
			proforma_data += '		<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Total Rp.</td>';
			proforma_data += '	</tr>';
		},
		success: function (data) {

			if (data.data.length != 0) {

				var penjualan_total = 0;

				proforma_data += '<tbody>';
				jQuery.each(data.data, function (i, val) {
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (!val.keterangan) {
						var ket_item = '';
					} else {

						var ket_item = '<font color="red"><br>KET :<br>' + style + ' ' + val.keterangan + '</font>';

					}


					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://indokoper.com/product_image_new';
					} else {
						var path_image = 'https://indokoper.com/performa_image';
					}

					// Logika baru: Tampilkan tulisan merah hanya jika needs_approval = 1 dan status pending/rejected
					if (val.potongan_price != 0) {
						// Cek needs_approval dan approval_status dari header (data.data[0])
						var needsApproval = data.data[0].needs_approval || 0;
						var approvalStatus = data.data[0].approval_status || '';

						if (needsApproval == 1 && (approvalStatus == 'pending' || approvalStatus == 'rejected')) {
							// Tampilkan tulisan merah jika masih pending/rejected
							var potongan = '<span style="font-weight:bold;color:red;">' + number_format(val.potongan_price) + '<span>';
							var potongan_total = '<span style="font-weight:bold;color:red;">' + number_format(parseFloat(val.potongan_price) * parseFloat(val.qty)) + '<span>';
						} else {
							// Jangan tampilkan tulisan merah jika sudah approved atau tidak butuh approval
							var potongan = '';
							var potongan_total = '';
						}
					} else {
						var potongan = '';
						var potongan_total = '';
					}

					proforma_data += '		<tr>';
					proforma_data += '			<td width="30%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; "><center>' + val.jenis + '<br><img src="' + path_image + '/' + val.gambar + '" width="70%"></center></td>';
					proforma_data += '			<td width="20%" class="label-cell" align="left" style="border-top: solid 1px; white-space: pre;">SPESIFIKASI<br>' + val.spesifikasi + '<br>' + ket_item + '</td>';
					proforma_data += '				<td width="10%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
					proforma_data += '					<center>' + val.qty + '</center>';
					proforma_data += '				</td>';
					proforma_data += '				<td width="20%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
					proforma_data += '					<center>' + number_format(val.price) + '<br>' + potongan + '</center>';
					proforma_data += '				</td>';
					proforma_data += '				<td width="20%" colspan="2" class="label-cell text-align-center" style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
					proforma_data += '					<center>' + number_format(val.total) + '<br>' + potongan_total + ' </center > ';
					proforma_data += '				</td>';
					proforma_data += '			</tr>';

					penjualan_total += parseInt(val.total);
				});
				proforma_data += '</tbody>';
				proforma_data += '		<tr>';
				proforma_data += '			<td colspan="3" style=" border-top: solid 1px;  font-weight:bold;" align="right"></td>';
				proforma_data += '			<td colspan="1" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
				proforma_data += '				Total';
				proforma_data += '			</td>';
				proforma_data += '			<td colspan="1" style="border-bottom: solid 1px; padding-left:10px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
				proforma_data += '				<font style="float:right; padding-right:10px;">' + number_format(penjualan_total) + '</font>';
				proforma_data += '			</td>';
				proforma_data += '		</tr>';


				if (number_format(data.data[0].biaya_kirim) != 0) {
					//	proforma_data += '		<tr>';
					//	proforma_data += '			<td colspan="3" style="font-weight:bold;" align="right"></td>';
					//	proforma_data += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
					//	proforma_data += '				Biaya Kirim';
					//	proforma_data += '			</td>';
					//	proforma_data += '			<td colspan="1" style="padding-left:10px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;  font-weight:bold;" align="left">';
					//	proforma_data += '				<font style="float:right; padding-right:10px;">' + number_format(data.data[0].biaya_kirim) + '</font>';
					//	proforma_data += '			</td>';
					//	proforma_data += '		</tr>';
				}

				//	proforma_data += '		<tr>';
				//	proforma_data += '			<td colspan="3" style="font-weight:bold;" align="right"></td>';
				//	proforma_data += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
				//	proforma_data += '				Jumlah';
				//	proforma_data += '			</td>';
				//	proforma_data += '			<td colspan="1" style="padding-left:10px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
				//	proforma_data += '				 <font style="float:right; padding-right:10px;">' + number_format((parseInt(penjualan_total))) + '</font>';
				//	proforma_data += '			</td>';
				//	proforma_data += '		</tr>'

				proforma_data += '	</table><br>';
				proforma_data += '	<table width="100%" border="0">';
				proforma_data += '      <tr>';
				proforma_data += '          <td style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Emblem</td>';
				proforma_data += '          <td style="border-top: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="34%" align="center">Logo Bordir</td>';
				proforma_data += '          <td style="border-top: solid 1px;  border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Tambah</td>';
				proforma_data += '      </tr>';
				proforma_data += '      <tr>';
				proforma_data += '          <td style=" border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://indokoper.com/customer_logo/' + data.data[0].customer_logo + '" width="80%" /></td>';

				if (data.data[0].customer_logo_bordir != "") {
					proforma_data += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://indokoper.com/customer_logo/' + data.data[0].customer_logo_bordir + '" width="80%" /> </td>';
				} else {
					proforma_data += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

				}
				if (data.data[0].customer_logo_tambahan != "") {
					proforma_data += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://indokoper.com/customer_logo/' + data.data[0].customer_logo_tambahan + '" width="80%" /> </td>';
				} else {
					proforma_data += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

				}
				proforma_data += '      </tr>';
				proforma_data += '	</table>';

				proforma_data += '	<table width="100%" border="0">';
				proforma_data += '		<tr>';
				proforma_data += '			<td colspan="4">Ket :</td>';
				proforma_data += '		</tr>';
				proforma_data += '      <tr>';
				proforma_data += '          <td width="1%">-</td>';
				proforma_data += '          <td width="70%">' + packing_label + '</td>';
				proforma_data += '          <td width="16%" align="center"></td>';
				proforma_data += '          <td width="13%" align="center"></td>';
				proforma_data += '      </tr>';
				proforma_data += '      <tr>';
				proforma_data += '          <td width="1%">-</td>';
				proforma_data += '          <td width="70%">Harga produk belum termasuk biaya kirim</td>';
				proforma_data += '          <td width="16%" align="center"></td>';
				proforma_data += '          <td width="13%" align="center"></td>';
				proforma_data += '      </tr>';
				proforma_data += '      <tr>';
				proforma_data += '          <td width="1%">-</td>';
				proforma_data += '          <td width="70%">Komplain lebih 3 hari setelah barang di terima tidak dapat di layani</td>';
				proforma_data += '          <td width="16%" align="center"></td>';
				proforma_data += '          <td width="13%" align="center"></td>';
				proforma_data += '      </tr>';
				proforma_data += '      <tr>';
				proforma_data += '          <td width="1%">-</td>';
				proforma_data += '          <td width="70%">DP 50% sebagai deposit, 50% untuk pelunasan Sebelum Shipping </td>';
				proforma_data += '          <td width="16%" align="center" style="">Sales</td>';
				proforma_data += '          <td width="13%" align="center" style="">Customer</td>';
				proforma_data += '      </tr>';
				proforma_data += '	</table>';
				proforma_data += '	<table border="0" width="100%" style="border-spacing: 0;">';
				proforma_data += '      <tr>';
				proforma_data += '          <td width="50%" align="left" colspan="3" class=""><b>Rekening</b></td>';
				proforma_data += '          <td width="20%" align="left"  class=""><b></b></td>';
				proforma_data += '			<td width="15%" align="center" rowspan="4">';
				proforma_data += '				<span style="position: relative;">';
				proforma_data += ' 					<img src="https://indokoper.com/lunas/invoiceLogo.png" style="opacity: 0.6;" width="100" height="100">';
				proforma_data += '					<span style="position: absolute;top: -200%;left: 50%;transform: translate(-50%, -50%);"><img src="https://indokoper.com/tanda_tangan/' + data.data_user.tanda_tangan + '" width="100" height="100"></span>';
				proforma_data += ' 					<span style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);"><p style="font-weight: bold;">' + data.data_user.karyawan_nama + '</p></span>';
				proforma_data += '				</span>';
				proforma_data += '			</td>';
				proforma_data += '          <td width="13%" align="center"></td>';
				proforma_data += '      </tr>';
				proforma_data += '          <td width="13%" align="center"></td>';
				proforma_data += '      </tr>';

				// ========================================
				// REKENING BANK - Dinamis berdasarkan bank_id di header
				// Jika ada bank_id dan bank_label: tampilkan bank yang dipilih
				// Jika tidak ada: tampilkan BCA dan Mandiri (default)
				// ========================================
				let bankInfo = '';

				// Cek apakah ada bank_id di header proforma
				if (data.data[0].bank_id && data.data[0].bank_label) {
					console.log('Bank dipilih:', data.data[0].bank_id, data.data[0].bank_label);

					// Tampilkan HANYA 1 bank sesuai yang dipilih
					var bankId = parseInt(data.data[0].bank_id);
					var bankData = getBankInfoById(bankId);

					bankInfo += '      <tr>';
					bankInfo += '          <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">' + bankData.nama + '</td>';
					bankInfo += '          <td style="border-bottom: solid 1px; border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
					bankInfo += '          <td style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; padding:2px;" width="47%" align="left" class="">' + bankData.rekening + ' a.n ' + bankData.atas_nama + '</td>';
					bankInfo += '          <td width="13%" align="center"></td>';
					bankInfo += '      </tr>';
				} else {
					console.log('Tidak ada bank dipilih, tampilkan default BCA dan Mandiri');

					// Default: tampilkan BCA dan Mandiri
					bankInfo += '      <tr>';
					bankInfo += '          <td style="border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">BCA</td>';
					bankInfo += '          <td style="border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
					bankInfo += '          <td style="border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">01831 29551 a.n Sutono</td>';
					bankInfo += '          <td width="13%" align="center"></td>';
					bankInfo += '      </tr>';
					bankInfo += '      <tr>';
					bankInfo += '          <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; padding:4px;" width="2%" align="left" class="">Mandiri</td>';
					bankInfo += '          <td style="border-bottom: solid 1px;  border-top: solid 1px; padding:4px;" width="1%" align="left" class="">:</td>';
					bankInfo += '          <td style="border-bottom: solid 1px;  border-top: solid 1px;  border-right: solid  1px; padding:2px;" width="47%" align="left" class="">141 000 225 5818 a.n Sutono</td>';
					bankInfo += '          <td width="13%" align="center"></td>';
					bankInfo += '      </tr>';
				}

				proforma_data += bankInfo;
				proforma_data += '      <tr>';
				proforma_data += '          <td width="15%" align="center" colspan="4"></td>';
				proforma_data += '          <td width="15%" align="center"><p style="font-weight: bold;">' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + '</p></td>';
				proforma_data += '      </tr>';
				proforma_data += '	</table>';

			}

			// let options = {
			// 	documentSize: 'A4',
			// 	type: 'share',
			// 	fileName: 'Proforma_' + client_nama + '.pdf'
			// }

			var spk1_pdf = proforma_data;
			$$('#detail_proforma_table_popup').html(proforma_data);
			// console.log(spk1_pdf);
			// pdf.fromData(spk1_pdf, options)
			// 	.then((stats) => console.log('status', stats))
			// 	.catch((err) => console.err(err))
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});

}

function gambarPerformaTambahPopup(performa_table_id) {
	if (jQuery('#file_tambah_' + performa_table_id + '').val() == '' || jQuery('#file_tambah_' + performa_table_id + '').val() == null) {
		$$('#value_performa_tambah_' + performa_table_id + '').html('Gambar');
	} else {
		$$('#value_performa_tambah_' + performa_table_id + '').html($$('#file_tambah_' + performa_table_id + '').val().replace('fakepath', ''));
	}
}

function tambahPerformaHeaderPenjualanProses() {
	var formData = new FormData(jQuery("#tambah_performa_header_penjualan_popup")[0]);
	formData.append('performa_header_id_tambah_popup', localStorage.getItem("edit_performa_header_performa_header_id"));
	formData.append('style_new_hc_1', $('#style_hc_tambah_input_1').html());

	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		if (!$$('#tambah_performa_header_penjualan_popup')[0].checkValidity()) {
			app.dialog.alert('Cek Isi Form Anda');
		} else {

			jQuery.ajax({
				type: 'POST',
				url: "" + BASE_API + "/tambah-performa-header-penjualan-proses-backup",
				dataType: 'JSON',
				data: formData,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Harap Tunggu');
				},
				success: function (data) {
					app.dialog.close();
					$("#color_proforma_tambah_1").css("display", "none");
					$("#gambar_proforma_tambah_1").css("display", "none");
					$('#jenis_tambah_popup').val('');
					document.getElementById("tambah_performa_header_penjualan_popup").reset();
					clearInputSelectTambah();
					$('#back_button_tambah_performa').trigger('click');
					editPerformaHeaderPenjualanPage();
				},
				error: function (xmlhttprequest, textstatus, message) {
				}
			});
		}
	}
}

function gambarProformaEdit(proforma_id) {
	if (jQuery('#file_edit_proforma_' + proforma_id + '').val() == '' || jQuery('#file_edit_proforma_' + proforma_id + '').val() == null) {
		$$('#value_proforma_edit_' + proforma_id + '').html('Gambar');
	} else {
		$$('#value_proforma_edit_' + proforma_id + '').html($$('#file_edit_proforma_' + proforma_id + '').val().replace('fakepath', ''));
	}
}

////////////////////////// PENJUALAN

// Tambah Penjualan
function doSearchByTypeTambahPenjualanPopup(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		var tipe = jQuery('#jenis_tambah_penjualan_popup').val();
		getKatalogPenjualanTambahPopup(tipe);
	}, 2000);
}


function clearInputSelectPenjualanTambah() {
	$$('#gambar_penjualan_tambah_1').css("display", "none");
	$$('#color_penjualan_tambah_1').css("display", "none");
	$$('#type_penjualan_tambah_1').css("display", "initial");
	$$('#type_penjualan_tambah_1').removeClass('col-70');
	$$('#type_penjualan_tambah_1').addClass('col-100');
	$$('#el_ukuran_hc_penjualan_tambah_1').css("display", "none");
	$$('#el_style_hc_penjualan_tambah_1').css("display", "none");
	$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
	$$('#penjualan_produk_detail_tambah_id_1').val('');
	$$('#penjualan_produk_tambah_id_1').val('');
	$$('#value_penjualan_tambah_1').html('<i class="f7-icons">photo_fill</i>');
	$$('#file_tambah_penjualan_1').val('');
	document.getElementById("tambah_header_penjualan_popup").reset();
}


function clearInputSelectPenjualanEdit() {
	$$('#gambar_penjualan_edit_1').css("display", "none");
	$$('#color_penjualan_edit_1').css("display", "none");
	$$('#type_penjualan_edit_1').css("display", "initial");
	$$('#type_penjualan_edit_1').removeClass('col-70');
	$$('#type_penjualan_edit_1').addClass('col-100');
	$$('#el_ukuran_hc_penjualan_edit_1').css("display", "none");
	$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
	$$('#el_style_hc_penjualan_edit_1').css("display", "none");
	$$('#penjualan_detail_performa_id_edit').val('');
	$$('#penjualan_id_edit_2').val('');
	$$('#value_penjualan_edit_1').html('<i class="f7-icons">photo_fill</i>');
	$$('#file_edit_penjualan_1').val('');
	document.getElementById("edit_penjualan_detail_manager_form").reset();
}

function resetKeteranganSingkatPenjualan() {
	$$("#keterangan_style_edit_penjualan").hide();
	$$('#keterangan_edit').css("display", "initial");
}

function resetKeteranganSingkatPerforma() {
	$$("#keterangan_style_edit_performa").hide();
	$$('#keterangan_singkat_edit_popup').css("display", "initial");
}

function getKatalogPenjualanTambahPopup(tipe) {
	if (tipe == "") {
		$$('#gambar_penjualan_tambah_1').css("display", "initial");
		$$('#color_penjualan_tambah_1').css("display", "none");
		$$('#type_penjualan_tambah_1').removeClass('col-100');
		$$('#type_penjualan_tambah_1').addClass('col-70');
		$$('#el_ukuran_hc_penjualan_tambah_1').hide();
		$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
	} else {
		var count = 1;
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/get-produk-proforma",
			dataType: 'JSON',
			data: {
				jenis_1: tipe.substr(-3)
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();

				if (tipe.indexOf("HCC") != -1) {
					$$('#gambar_penjualan_tambah_1').css("display", "initial");
					$$('#color_penjualan_tambah_1').css("display", "none");
					$$('#el_ukuran_hc_penjualan_tambah_1').show();
					$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
					$$('#type_penjualan_tambah_1').removeClass('col-100');
					$$('#type_penjualan_tambah_1').addClass('col-70');
					$$('#file_tambah_penjualan_1').prop('required', true)
					$$('#file_tambah_penjualan_1').prop('validate', true)
					$$('#el_style_hc_penjualan_tambah_1').show();
					document.getElementById("price_tambah_penjualan_popup").readOnly = true;
					showselectBoxUkuranPenjualanTambah('HC-112', 1);
				} else if (tipe.indexOf("HC") != -1) {
					document.getElementById("price_tambah_penjualan_popup").readOnly = true;
					if (tipe.length == 6) {
						if (data.data.length != 0) {
							$("#openPopupTambahPenjualan_1").click();
							getKatalogPenjualanPopupTambah(tipe.substr(-3));
							$$('#color_penjualan_tambah_1').css("display", "none");
							$$('#gambar_penjualan_tambah_1').css("display", "none");
							$$('#file_tambah_penjualan_1').prop('required', false)
							$$('#file_tambah_penjualan_1').prop('validate', false)
							$$('#el_ukuran_hc_penjualan_tambah_1').hide();
							$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_penjualan_tambah_1').css("display", "none");
							$$('#gambar_penjualan_tambah_1').css("display", "none");
							jQuery('#jenis_tambah_penjualan_popup').val('');
							$$('#file_tambah_penjualan_1').prop('required', false)
							$$('#file_tambah_penjualan_1').prop('validate', false)
							$$('#el_ukuran_hc_penjualan_tambah_1').hide();
							$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
						}
					} else if (tipe.length == 2) {
						if (data.data.length != 0) {
							$("#openPopupTambahPenjualanAll_1").click();
							getKatalogPopupPenjualanTambahAll(1);
							$$('#color_penjualan_tambah_1').css("display", "none");
							$$('#gambar_penjualan_tambah_1').css("display", "none");
							$$('#file_tambah_penjualan_1').prop('required', false)
							$$('#file_tambah_penjualan_1').prop('validate', false)
							$$('#el_ukuran_hc_penjualan_tambah_1').hide();
							$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_penjualan_tambah_1').css("display", "none");
							$$('#gambar_penjualan_tambah_1').css("display", "none");
							jQuery('#jenis_tambah_penjualan_popup').val('');
							$$('#file_tambah_penjualan_1').prop('required', false)
							$$('#file_tambah_penjualan_1').prop('validate', false)
							$$('#el_ukuran_hc_penjualan_tambah_1').hide();
							$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
						}
					} else {
						app.dialog.alert('Panjang Huruf Tipe HC 6 Digit, Contoh : (HC-112)');
						$$('#gambar_penjualan_tambah_1').css("display", "initial");
						$$('#color_penjualan_tambah_1').css("display", "none");
						$$('#jenis_tambah_penjualan_popup').val("");
						$$('#el_ukuran_hc_penjualan_tambah_1').hide();
						$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
						$$('#file_tambah_penjualan_1').prop('required', true)
						$$('#file_tambah_penjualan_1').prop('validate', true)

					}
				} else if (tipe.indexOf("TAS") != -1) {
					if (tipe.length == 3) {
						$("#openPopupPenjualanTambahTs_1").click();
						$$('#gambar_penjualan_tambah_1').css("display", "initial");
						$$('#color_penjualan_tambah_1').css("display", "none");
						$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "initial");
						$$('#type_penjualan_tambah_1').css("display", "none");
						$$('#el_ukuran_ts_penjualan_tambah_1').removeClass('col-100');
						$$('#el_ukuran_ts_penjualan_tambah_1').addClass('col-70');
						$$('#file_tambah_penjualan_1').prop('required', true);
						$$('#file_tambah_penjualan_1').prop('validate', true);
						$$('#el_ukuran_hc_penjualan_tambah_1').hide();
						document.getElementById("price_tambah_penjualan_popup").readOnly = false;
						showselectBoxTSPenjualanTambah(1);
					} else {
						app.dialog.alert('Panjang Huruf Tipe TS 3 Digit, Contoh : (TAS)');
					}
				} else {
					$("#openPopupPenjualanTambahTs_1").click();
					$$('#gambar_penjualan_tambah_1').css("display", "initial");
					$$('#color_penjualan_tambah_1').css("display", "none");
					$$('#type_penjualan_tambah_1').css("display", "none");
					$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "initial");
					$$('#el_ukuran_ts_penjualan_tambah_1').removeClass('col-100');
					$$('#el_ukuran_ts_penjualan_tambah_1').addClass('col-70');
					$$('#file_tambah_penjualan_1').prop('required', true)
					$$('#file_tambah_penjualan_1').prop('validate', true)
					document.getElementById("price_tambah_penjualan_popup").readOnly = false;
					$$('#el_ukuran_hc_penjualan_tambah_1').hide();
					showselectBoxTSPenjualanTambah(1);
				}


			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function getKatalogPenjualanPopupTambah(tipe) {
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
				katalog_data += '   <img onclick="fillPenjualanTambahPopup(\'' + item.produk_detail_id + '\',\'' + item.produk_grup_warna + '\',\'' + item.produk_id + '\',\'' + item.nama_warna + '\',\'1\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
				katalog_data += '  <h4 style="margin-top:2px;margin-bottom:5px;">' + item.produk_id + '</h4>';
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
			jQuery('#katalog_data_tambah_penjualan').html(katalog_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function openPopupKatalogPenjualanTambah(produk_id, count) {
	$('#openPopupTambahPenjualan_1').click();
	$('#jenis_tambah_penjualan_popup').val(produk_id);
	$('#close-all-katalog-tambah-penjualan-popup').click();
	getKatalogPenjualanPopupTambah(produk_id);
}

function getKatalogPopupPenjualanTambahAll(count) {
	var produk_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-tipe-produk",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			$.each(data.data, function (i, item) {

				produk_data += '<div class="col-50" style="margin:4px;">';
				produk_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
				produk_data += ' <a>';
				produk_data += '   <img onclick="openPopupKatalogPenjualanTambah(\'' + item.produk_id + '\',\'' + count + '\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
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

			app.dialog.close();
			jQuery('#produk_data_all_katalog_tambah_penjualan').html(produk_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function fillPenjualanTambahPopup(produk_detail_id, produk_grup_warna, produk_id, nama_warna, count) {

	$("#close-katalog-popup-tambah-penjualan").click();
	$$('#color_penjualan_tambah_1').css("display", "inline");
	$$('#type_penjualan_tambah_1').removeClass('col-100');
	$$('#type_penjualan_tambah_1').addClass('col-70');
	$$('#ukuran_penjualan_tambah_ts_1').prop('required', false);
	$$('#ukuran_penjualan_tambah_ts_1').prop('validate', false);

	$$('#color_tambah_penjualan_popup_1').html('<div id="penjualan_color_tambah_popup_1" data-color="' + produk_grup_warna + '" style="margin:5px;text-align:center;height:25px;background-color:' + produk_grup_warna + '"></div>');
	$$('#penjualan_produk_detail_tambah_id_1').val(produk_detail_id);
	$$('#penjualan_produk_tambah_id_1').val(produk_id);
	$$('#keterangan_full_tambah_penjualan_popup').val(nama_warna);
	$$('#el_ukuran_hc_penjualan_tambah_1').show();
	$$('#el_ukuran_ts_penjualan_tambah_1').css("display", "none");
	$$('#el_style_hc_penjualan_tambah_1').show();
	showselectBoxUkuranPenjualanTambah(produk_id, 1);
	// $$('#jenis_1').val(produk_id);

}

function gambarPenjualanTambahPopup(penjualan_table_id) {
	if (jQuery('#file_tambah_penjualan_' + penjualan_table_id + '').val() == '' || jQuery('#file_tambah_penjualan_' + penjualan_table_id + '').val() == null) {
		$$('#value_penjualan_tambah_' + penjualan_table_id + '').html('Gambar');
	} else {
		$$('#value_penjualan_tambah_' + penjualan_table_id + '').html($$('#file_tambah_penjualan_' + penjualan_table_id + '').val().replace('fakepath', ''));
	}
}

function tambaHeaderPenjualanProses() {
	var formData = new FormData(jQuery("#tambah_header_penjualan_popup")[0]);
	formData.append('penjualan_id', localStorage.getItem("penjualan_id"));
	formData.append('performa', localStorage.getItem("penjualan_id"));
	formData.append('style_new_hc_1', $('#style_hc_penjualan_tambah_input_1').html());
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		if (!$$('#tambah_header_penjualan_popup')[0].checkValidity()) {
			app.dialog.alert('Cek Isi Form Anda');
		} else {

			jQuery.ajax({
				type: 'POST',
				url: "" + BASE_API + "/tambah-penjualan-proses-sales-backup",
				dataType: 'JSON',
				data: formData,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Harap Tunggu');
				},
				success: function (data) {
					app.dialog.close();
					$("#color_penjualan_tambah_1").css("display", "none");
					$("#gambar_penjualan_tambah_1").css("display", "none");
					$('#back_button_tambah_penjualan').trigger('click');
					document.getElementById("tambah_header_penjualan_popup").reset();
					clearInputSelectPenjualanTambah();
					getDetailPenjualanOwner(localStorage.getItem("penjualan_id"));
					getPenjualanHeader(1);
				},
				error: function (xmlhttprequest, textstatus, message) {
				}
			});
		}
	}
}


//edit

function doSearchByTypeEditPenjualanPopup(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		var tipe = jQuery('#jenis_edit_penjualan_popup').val();
		getKatalogEditPenjualan(tipe);
	}, 2000);
}
function getKatalogEditPenjualan(tipe) {
	if (tipe == "") {
		$$('#gambar_penjualan_edit_1').css("display", "initial");
		$$('#color_penjualan_edit_1').css("display", "none");
		$$('#type_penjualan_edit_1').removeClass('col-100');
		$$('#type_penjualan_edit_1').addClass('col-70');
		$$('#el_ukuran_hc_penjualan_edit_1').hide();
		$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
		document.getElementById("price_edit_penjualan_popup").readOnly = true;
	} else {
		var count = 1;
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/get-produk-proforma",
			dataType: 'JSON',
			data: {
				jenis_1: tipe.substr(-3)
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();

				if (tipe.indexOf("HCC") != -1) {
					$$('#gambar_penjualan_edit_1').css("display", "initial");
					$$('#color_penjualan_edit_1').css("display", "none");
					$$('#el_ukuran_hc_penjualan_edit_1').show();
					$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
					$$('#type_penjualan_edit_1').removeClass('col-100');
					$$('#type_penjualan_edit_1').addClass('col-70');
					$$('#file_edit_penjualan_1').prop('required', true)
					$$('#file_edit_penjualan_1').prop('validate', true)
					$$('#el_style_hc_penjualan_edit_1').show();
					document.getElementById("price_edit_penjualan_popup").readOnly = true;
					showselectBoxUkuranPenjualanEdit('HC-112', 1);
				} else if (tipe.indexOf("HC") != -1) {
					document.getElementById("price_edit_penjualan_popup").readOnly = true;
					if (tipe.length == 6) {
						if (data.data.length != 0) {
							$("#openPopupEditPenjualan_1").click();
							getKatalogPopupEditPenjualan(tipe.substr(-3));
							$$('#color_penjualan_edit_1').css("display", "none");
							$$('#gambar_penjualan_edit_1').css("display", "none");
							$$('#file_edit_penjualan_1').prop('required', false)
							$$('#file_edit_penjualan_1').prop('validate', false)
							$$('#el_ukuran_hc_penjualan_edit_1').hide();
							$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_penjualan_edit_1').css("display", "none");
							$$('#gambar_penjualan_edit_1').css("display", "none");
							$$('#jenis_edit_penjualan_popup').val("");
							$$('#file_edit_penjualan_1').prop('required', false)
							$$('#file_edit_penjualan_1').prop('validate', false)
							$$('#el_ukuran_hc_penjualan_edit_1').hide();
							$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
						}
					} else if (tipe.length == 2) {
						if (data.data.length != 0) {
							$("#openPopupEditPenjualanAll_1").click();
							getKatalogPopupPenjualanEditAll(1);
							$$('#color_penjualan_edit_1').css("display", "none");
							$$('#gambar_penjualan_edit_1').css("display", "none");
							$$('#file_edit_penjualan_1').prop('required', false)
							$$('#file_edit_penjualan_1').prop('validate', false)
							$$('#el_ukuran_hc_penjualan_edit_1').hide();
							$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_penjualan_edit_1').css("display", "none");
							$$('#gambar_penjualan_edit_1').css("display", "none");
							$$('#jenis_edit_penjualan_popup').val("");
							$$('#file_edit_penjualan_1').prop('required', false)
							$$('#file_edit_penjualan_1').prop('validate', false)
							$$('#el_ukuran_hc_penjualan_edit_1').hide();
							$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
						}
					} else {
						app.dialog.alert('Panjang Huruf Tipe HC 6 Digit, Contoh : (HC-112)');
						$$('#gambar_penjualan_edit_1').css("display", "initial");
						$$('#color_penjualan_edit_1').css("display", "none");
						$$('#jenis_edit_penjualan_popup').val("");
						$$('#el_ukuran_hc_penjualan_edit_1').hide();
						$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
						$$('#file_edit_penjualan_1').prop('required', true)
						$$('#file_edit_penjualan_1').prop('validate', true)

					}
				} else if (tipe.indexOf("TAS") != -1) {
					if (tipe.length == 3) {
						$("#openPopupPenjualanEditTs_1").click();
						$$('#gambar_penjualan_edit_1').css("display", "initial");
						$$('#color_penjualan_edit_1').css("display", "none");
						$$('#el_ukuran_ts_penjualan_edit_1').css("display", "initial");
						$$('#type_penjualan_edit_1').css("display", "none");
						$$('#el_ukuran_ts_penjualan_edit_1').removeClass('col-100');
						$$('#el_ukuran_ts_penjualan_edit_1').addClass('col-70');
						$$('#file_edit_penjualan_1').prop('required', true);
						$$('#file_edit_penjualan_1').prop('validate', true);
						$$('#el_ukuran_hc_penjualan_edit_1').hide();
						document.getElementById("price_edit_penjualan_popup").readOnly = false;
						showselectBoxTSPenjualanEdit(1);
					} else {
						app.dialog.alert('Panjang Huruf Tipe TS 3 Digit, Contoh : (TAS)');
					}
				} else {
					document.getElementById("price_edit_penjualan_popup").readOnly = false;
					$("#openPopupPenjualanEditTs_1").click();
					$$('#gambar_penjualan_edit_1').css("display", "initial");
					$$('#color_penjualan_edit_1').css("display", "none");
					$$('#type_penjualan_edit_1').css("display", "none");
					$$('#el_ukuran_ts_penjualan_edit_1').css("display", "initial");
					$$('#el_ukuran_ts_penjualan_edit_1').removeClass('col-100');
					$$('#el_ukuran_ts_penjualan_edit_1').addClass('col-70');
					$$('#file_edit_penjualan_1').prop('required', true)
					$$('#file_edit_penjualan_1').prop('validate', true)
					$$('#el_ukuran_hc_penjualan_edit_1').hide();
					showselectBoxTSPenjualanEdit(1);
				}


			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}


function getKatalogPopupEditPenjualan(tipe) {
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
				katalog_data += '   <img onclick="fillPenjualanEditPenjualan(\'' + item.produk_detail_id + '\',\'' + item.produk_grup_warna + '\',\'' + item.produk_id + '\',\'' + item.nama_warna + '\',\'1\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
				katalog_data += '  <h4 style="margin-top:2px;margin-bottom:5px;">' + item.produk_id + '</h4>';
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
			jQuery('#katalog_data_edit_penjualan').html(katalog_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function openPopupKatalogPenjualanEdit(produk_id, count) {
	$('#openPopupEditPenjualan_1').click();
	$('#jenis_edit_penjualan_popup').val(produk_id);
	$('#close-all-katalog-edit-penjualan-popup').click();
	getKatalogPopupEditPenjualan(produk_id);
}

function getKatalogPopupPenjualanEditAll(count) {
	var produk_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-tipe-produk",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			$.each(data.data, function (i, item) {

				produk_data += '<div class="col-50" style="margin:4px;">';
				produk_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
				produk_data += ' <a>';
				produk_data += '   <img onclick="openPopupKatalogPenjualanEdit(\'' + item.produk_id + '\',\'' + count + '\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
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

			app.dialog.close();
			jQuery('#produk_data_all_katalog_edit_penjualan').html(produk_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function fillPenjualanEditPenjualan(produk_detail_id, produk_grup_warna, produk_id, nama_warna, count) {

	$("#close-katalog-popup-edit-penjualan").click();
	$$('#color_penjualan_edit_1').css("display", "inline");
	$$('#type_penjualan_edit_1').removeClass('col-100');
	$$('#type_penjualan_edit_1').addClass('col-70');
	$$('#ukuran_penjualan_edit_ts_1').prop('required', false);
	$$('#ukuran_penjualan_edit_ts_1').prop('validate', false);

	$$('#color_edit_penjualan_1').html('<div id="penjualan_color_edit_penjualan_1" data-color="' + produk_grup_warna + '" style="margin:5px;text-align:center;height:25px;background-color:' + produk_grup_warna + '"></div>');
	$$('#penjualan_produk_detail_edit_id_1').val(produk_detail_id);
	$$('#penjualan_produk_edit_id_1').val(produk_id);
	$$('#jenis_edit_penjualan_popup').val(produk_id);
	$$('#produk_keterangan_custom_edit').val(nama_warna);
	$$('#el_ukuran_hc_penjualan_edit_1').show();
	$$('#el_ukuran_ts_penjualan_edit_1').css("display", "none");
	$$('#el_style_hc_penjualan_edit_1').show();
	showselectBoxUkuranPenjualanEdit(produk_id, 1);
	// $$('#jenis_1').val(produk_id);
}

function showselectBoxTSPenjualanTambah(count) {
	$('#ukuran_penjualan_tambah_ts_' + count).html('');
	$$('#ukuran_penjualan_tambah_hc_' + count).prop('required', false);
	$$('#ukuran_penjualan_tambah_hc_' + count).prop('validate', false);
	$$('#ukuran_penjualan_tambah_ts_' + count).prop('required', true);
	$$('#ukuran_penjualan_tambah_ts_' + count).prop('validate', true);
	$$('#type_penjualan_tambah_' + count).prop('required', false);
	$$('#type_penjualan_tambah_' + count).prop('validate', false);
	$$('#el_style_hc_penjualan_tambah_1').hide();
	$$('#el_extra_penjualan_tambah_detail_' + count).hide();
	$$('#extra_penjualan_tambah_detail_' + count).prop('required', false);
	$$('#extra_penjualan_tambah_detail_' + count).prop('validate', false);
	selectBoxTSPenjualanTambah(count);
}

function showselectBoxUkuranPenjualanTambah(produk_id, count) {
	$('#ukuran_penjualan_tambah_hc_' + count).html('');
	$$('#ukuran_penjualan_tambah_hc_' + count).prop('required', true);
	$$('#ukuran_penjualan_tambah_hc_' + count).prop('validate', true);
	$$('#ukuran_penjualan_tambah_ts_' + count).prop('required', false);
	$$('#ukuran_penjualan_tambah_ts_' + count).prop('validate', false);
	$$('#type_penjualan_tambah_' + count).prop('required', true);
	$$('#type_penjualan_tambah_' + count).prop('validate', true);
	$$('#el_extra_penjualan_tambah_detail_' + count).show();
	$$('#extra_penjualan_tambah_detail_' + count).prop('required', true);
	$$('#extra_penjualan_tambah_detail_' + count).prop('validate', true);
	selectBoxUkuranPenjualanTambah(produk_id, count);
	selectBoxStylePenjualanTambah(produk_id, count);
}

function showselectBoxTSPenjualanEdit(count) {
	$('#ukuran_penjualan_edit_ts_' + count).html('');
	$$('#ukuran_penjualan_edit_hc_' + count).prop('required', false);
	$$('#ukuran_penjualan_edit_hc_' + count).prop('validate', false);
	$$('#ukuran_penjualan_edit_ts_' + count).prop('required', true);
	$$('#ukuran_penjualan_edit_ts_' + count).prop('validate', true);
	$$('#type_penjualan_edit_' + count).prop('required', false);
	$$('#type_penjualan_edit_' + count).prop('validate', false);
	$$('#el_style_hc_penjualan_edit_1').hide();
	$$('#style_penjualan_edit_hc_1').prop('required', false);
	$$('#style_penjualan_edit_hc_1').prop('validate', false);
	$$('#el_extra_penjualan_edit_detail_' + count).hide();
	$$('#extra_penjualan_edit_detail_' + count).prop('required', false);
	$$('#extra_penjualan_edit_detail_' + count).prop('validate', false);
	selectBoxTSPenjualanEdit(count);
}

function showselectBoxUkuranPenjualanEdit(produk_id, count) {
	$('#ukuran_penjualan_edit_hc_' + count).html('');
	$$('#ukuran_penjualan_edit_hc_' + count).prop('required', true);
	$$('#ukuran_penjualan_edit_hc_' + count).prop('validate', true);
	$$('#ukuran_penjualan_edit_ts_' + count).prop('required', false);
	$$('#ukuran_penjualan_edit_ts_' + count).prop('validate', false);
	$$('#type_penjualan_edit_' + count).prop('required', true);
	$$('#type_penjualan_edit_' + count).prop('validate', true);
	$$('#el_extra_penjualan_edit_detail_' + count).show();
	$$('#extra_penjualan_edit_detail_' + count).prop('required', true);
	$$('#extra_penjualan_edit_detail_' + count).prop('validate', true);
	selectBoxUkuranPenjualanEdit(produk_id, count);
	selectBoxStylePenjualanEdit(produk_id, count);
}

function selectBoxUkuranPenjualanTambah(produk_id, count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-ukuran",
		dataType: "JSON",
		data: {
			produk_id: produk_id,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var select_box_kota;
			select_box_kota += '<option value="" selected>Pilih Ukuran</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.nama_ukuran + '">' + val.nama_ukuran + '</option>';
			});
			$$('#ukuran_penjualan_tambah_hc_1').html(select_box_kota);
		}
	});
}

function selectBoxStylePenjualanTambah(produk_id, count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-variasi",
		dataType: "JSON",
		data: {
			produk_id: produk_id,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var select_box_style;
			jQuery.each(data.data, function (i, val) {
				select_box_style += '<option value="' + val.nama_variasi + '">' + val.nama_variasi + '</option>';
			});
			$$('#style_penjualan_tambah_hc_' + count).html(select_box_style);
			$$('#style_hc_penjualan_tambah_input_' + count).html('Pilih Style');
		}
	});
}

function selectBoxTSPenjualanTambah(count) {
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
				select_box_ts += '  <input type="radio" onclick="fillPenjualanTambahUkuranTsInput(\'' + val.nama_produk_ts + '\');fillHargaPenjualanTs(\'tambah\');" name="tambah_ukuran_penjualan_radio" id="tambah_ukuran_penjualan_radio"/>';
				select_box_ts += '  <i class="icon icon-radio"></i>';
				select_box_ts += '  <div class="item-inner">';
				select_box_ts += '		<div class="item-title">' + val.nama_produk_ts + '</div>';
				select_box_ts += '  </div>';
				select_box_ts += '</label>';
				select_box_ts += '</li>';
			});
			$$('#katalog_ts_data_penjualan_tambah').html(select_box_ts);
		}
	});
}

function fillPenjualanTambahUkuranTsInput(ukuran_ts) {
	$$('#ukuran_penjualan_tambah_ts_1').val(ukuran_ts);
	$("#close-katalog-ts-penjualan-tambah-popup").click();
}

function selectBoxUkuranPenjualanEdit(produk_id, count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-ukuran",
		dataType: "JSON",
		data: {
			produk_id: produk_id,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var select_box_kota;
			select_box_kota += '<option value="" selected>Pilih Ukuran</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.nama_ukuran + '">' + val.nama_ukuran + '</option>';
			});
			$$('#ukuran_penjualan_edit_hc_1').html(select_box_kota);
		}
	});
}

function selectBoxStylePenjualanEdit(produk_id, count) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-variasi",
		dataType: "JSON",
		data: {
			produk_id: produk_id,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var select_box_style;
			jQuery.each(data.data, function (i, val) {
				select_box_style += '<option value="' + val.nama_variasi + '">' + val.nama_variasi + '</option>';
			});
			$$('#style_penjualan_edit_hc_' + count).html(select_box_style);
			$$('#style_hc_penjualan_edit_input_' + count).html('Pilih Style');
		}
	});
}

function selectBoxTSPenjualanEdit(count) {
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
				select_box_ts += '  <input type="radio" onclick="fillPenjualanEditUkuranTsInput(\'' + val.nama_produk_ts + '\');fillHargaPenjualanTs(\'edit\');" name="edit_ukuran_penjualan_radio" id="edit_ukuran_penjualan_radio"/>';
				select_box_ts += '  <i class="icon icon-radio"></i>';
				select_box_ts += '  <div class="item-inner">';
				select_box_ts += '		<div class="item-title">' + val.nama_produk_ts + '</div>';
				select_box_ts += '  </div>';
				select_box_ts += '</label>';
				select_box_ts += '</li>';
			});
			$$('#katalog_ts_data_penjualan_edit').html(select_box_ts);
		}
	});
}

function fillPenjualanEditUkuranTsInput(ukuran_ts) {
	$$('#ukuran_penjualan_edit_ts_1').val(ukuran_ts);
	$("#close-katalog-ts-penjualan-edit-popup").click();
}

function fillHargaPenjualanTs(count) {

	if ($('#extra_penjualan_' + count + '_detail_1').val() != 1) {
		var xtra = 1;
		var message = 'Xtra';
	} else {
		var xtra = 0;
		var message = 'Grosir';
	}
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-produk-ts-harga",
		dataType: "JSON",
		data: {
			id_produk_ts: $$('#ukuran_penjualan_' + count + '_ts_1').val(),
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			if (xtra != 0) {
				// if (data.data.harga_xtra != 0) {
				$$('#harga_satuan_' + count + '_penjualan_popup').val(data.data.harga_xtra);
				// } else {
				// 	app.dialog.alert('Harga ' + message + ' tidak ada di tipe ini');
				// 	$$('#harga_satuan_' + count + '_penjualan_popup').val(0);
				// }
			} else {
				// if (data.data.harga_grosir != 0) {
				$$('#harga_satuan_' + count + '_penjualan_popup').val(data.data.harga_grosir);
				// } else {
				// 	app.dialog.alert('Harga ' + message + ' tidak ada di tipe ini');
				// 	$$('#harga_satuan_' + count + '_penjualan_popup').val(0);
				// }
			}

			$$('#price_' + count + '_penjualan_popup').val(number_format($$('#harga_satuan_' + count + '_penjualan_popup').val()));
			$$('#jenis_' + count + '_penjualan_popup').val($$('#ukuran_penjualan_' + count + '_ts_1').val());
			console.log($$('#price_' + count + '_penjualan_popup').val());
		}
	});
}

function callbackPenjualanInput(count) {
	fillHargaPenjualanProduk(count);
	fillHargaVariasiPenjualanProduk(count);
}

function fillHargaPenjualanProduk(count) {
	var tipe = jQuery('#jenis_' + count + '_penjualan_popup').val();

	if (tipe.indexOf("HCC") != -1) {
		if ($$('#ukuran_penjualan_' + count + '_hc_1').val() != '') {
			var produk_id = 'HC-112';
			var ukuran = $$('#ukuran_penjualan_' + count + '_hc_1').val();
		} else {
			var produk_id = 'HC-112';
			var ukuran = $$('#penjualan_old_ukuran_' + count + '_1').val();
		}
	} else {
		if (tipe.length >= 9) {
			if ($$('#ukuran_penjualan_' + count + '_hc_1').val() != '') {
				var produk_id = tipe.substr(-3);
				var ukuran = $$('#ukuran_penjualan_' + count + '_hc_1').val();
			} else {
				var produk_id = tipe.substr(3, 3);
				var ukuran = $$('#penjualan_old_ukuran_' + count + '_1').val();
			}
		} else {
			if ($$('#ukuran_penjualan_' + count + '_hc_1').val() != '') {
				var produk_id = tipe.substr(-3);
				var ukuran = $$('#ukuran_penjualan_' + count + '_hc_1').val();
			} else {
				var produk_id = tipe.substr(3, 3);
				var ukuran = $$('#penjualan_old_ukuran_' + count + '_1').val();
			}
		}
	}

	if ($('#extra_penjualan_' + count + '_detail_1').val() != 1) {
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
			nama_ukuran: ukuran,
		},
		beforeSend: function () {
			// $$('#ukuran_hc_' + count).html('');
		},
		success: function (data) {
			var price = 0;

			// if ($$('#ukuran_penjualan_' + count + '_hc_1').val() != '' && $$('#ukuran_penjualan_' + count + '_hc_1').val() != 'none') {
			if (xtra != 0) {
				if (data.data.harga_ukuran != 0) {
					$$('#harga_satuan_' + count + '_penjualan_popup').val(data.data.harga_ukuran);
				} else {
					app.dialog.alert('Harga Ukuran ' + message + ' tidak ada di tipe ini');
					$$('#harga_satuan_' + count + '_penjualan_popup').val(0);
				}
			} else {
				if (data.data.harga_ukuran_grosir != 0) {
					$$('#harga_satuan_' + count + '_penjualan_popup').val(data.data.harga_ukuran_grosir);
				} else {
					app.dialog.alert('Harga Ukuran ' + message + ' tidak ada di tipe ini');
					$$('#harga_satuan_' + count + '_penjualan_popup').val(0);
				}
			}
			// } else {
			// 	$$('#harga_satuan_' + count + '_penjualan_popup').val(0);
			// 	app.dialog.alert('Harga Ukuran ' + message + ' tidak ada di tipe ini');
			// }
			price = parseFloat($$('#harga_satuan_' + count + '_penjualan_popup').val()) + parseFloat($$('#harga_style_' + count + '_penjualan_popup').val());
			$$('#price_' + count + '_penjualan_popup').val(number_format(price));
			console.log($$('#price_' + count + '_penjualan_popup').val());
		}
	});
}

function fillHargaVariasiPenjualanProduk(count) {
	var tipe = jQuery('#jenis_' + count + '_penjualan_popup').val();

	if (tipe.indexOf("HCC") != -1) {
		if ($('#el_style_hc_penjualan_' + count + '_1').css('display') != 'none') {
			var produk_id = 'HC-112';
			var ukuran = $$('#ukuran_penjualan_' + count + '_hc_1').val();
			var style = $$('#style_penjualan_' + count + '_hc_1').val();
		} else {
			var produk_id = 'HC-112';
			var ukuran = $$('#penjualan_old_ukuran_' + count + '_1').val();
			var style_string = $$('#penjualan_old_style_' + count + '_1').val();
			var style = [];
			style = style_string.split(",");
		}
	} else {
		if (tipe.length >= 9) {
			if ($('#el_style_hc_penjualan_' + count + '_1').css('display') != 'none') {
				var produk_id = tipe.substr(-3);
				var ukuran = $$('#ukuran_penjualan_' + count + '_hc_1').val();
				var style = $$('#style_penjualan_' + count + '_hc_1').val();
			} else {
				var produk_id = tipe.substr(3, 3);
				var ukuran = $$('#penjualan_old_ukuran_' + count + '_1').val();
				var style_string = $$('#penjualan_old_style_' + count + '_1').val();
				var style = [];
				style = style_string.split(",");
			}
		} else {
			if ($('#el_style_hc_penjualan_' + count + '_1').css('display') != 'none') {
				var produk_id = tipe.substr(-3);
				var ukuran = $$('#ukuran_penjualan_' + count + '_hc_1').val();
				var style = $$('#style_penjualan_' + count + '_hc_1').val();
			} else {
				var produk_id = tipe.substr(3, 3);
				var ukuran = $$('#penjualan_old_ukuran_' + count + '_1').val();
				var style_string = $$('#penjualan_old_style_' + count + '_1').val();
				var style = [];
				style = style_string.split(",");
			}
		}
	}

	if ($('#extra_penjualan_' + count + '_detail_1').val() != 1) {
		var xtra = 1;
		var message = 'Xtra';
	} else {
		var xtra = 0;
		var message = 'Grosir';
	}

	var price = 0;
	if (style.length != 0) {
		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/get-produk-style-harga",
			dataType: "JSON",
			data: {
				produk_id: produk_id,
				nama_variasi: style,
				xtra: xtra,
			},
			beforeSend: function () {
			},
			success: function (data) {
				if (data.data != 0) {
					if (ukuran.indexOf("+") != -1) {
						$$('#harga_style_' + count + '_penjualan_popup').val(parseFloat(data.data) * 2);
						price = parseFloat($$('#harga_satuan_' + count + '_penjualan_popup').val()) + parseFloat($$('#harga_style_' + count + '_penjualan_popup').val());
						$$('#price_' + count + '_penjualan_popup').val(number_format(price));
					} else {
						$$('#harga_style_' + count + '_penjualan_popup').val(data.data);
						price = parseFloat($$('#harga_satuan_' + count + '_penjualan_popup').val()) + parseFloat($$('#harga_style_' + count + '_penjualan_popup').val());
						$$('#price_' + count + '_penjualan_popup').val(number_format(price));
					}
				} else {
					$$('#harga_style_' + count + '_penjualan_popup').val(0);
					price = parseFloat($$('#harga_satuan_' + count + '_penjualan_popup').val()) + parseFloat($$('#harga_style_' + count + '_penjualan_popup').val());
					$$('#price_' + count + '_penjualan_popup').val(number_format(price));
					app.dialog.alert('Harga Style ' + message + ' tidak ada di tipe ini');
				}

			}
		});
	} else {
		setTimeout(function () {
			$$("#style_hc_penjualan_" + count + "_input_1").html('Pilih Style');
			$$('#harga_style_' + count + '_penjualan_popup').val(0);
			price = parseFloat($$('#harga_satuan_' + count + '_penjualan_popup').val()) + parseFloat($$('#harga_style_' + count + '_penjualan_popup').val());
			$$('#price_' + count + '_penjualan_popup').val(number_format(price));
		}, 500);

	}
}


function filterDataTransaksiPenjualan() {
	getPenjualanHeader();
}

function filterDataTransaksiPerforma() {
	getPerformaHeaderPenjualan();
}


function getBulanTransaksiPenjualan() {
	var m = moment.months();
	var month_now = moment().month();
	var n = 0;
	$('.transaksi_penjualan_bulan').append($('<option/>').val('all').html('All Bulan'));
	for (var i = 0; i < 12; i++) {
		n++
		if (i == month_now) {
			$('.transaksi_penjualan_bulan').append($('<option selected/>').val(n).html(m[i]));
		} else {
			$('.transaksi_penjualan_bulan').append($('<option />').val(n).html(m[i]));
		}
	}
}

function getYearTransaksiPenjualan() {
	let startYear = 2018;
	let endYear = new Date().getFullYear();
	$('.transaksi_penjualan_years').append($('<option/>').val('all').html('All Tahun'));
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('.transaksi_penjualan_years').append($('<option selected/>').val(i).html(i));
		} else {
			$('.transaksi_penjualan_years').append($('<option />').val(i).html(i));
		}
	}
}

function getBulanTransaksiPerforma() {
	var m = moment.months();
	var month_now = moment().month();
	var n = 0;
	$('.transaksi_performa_bulan').append($('<option/>').val('all').html('All Bulan'));
	for (var i = 0; i < 12; i++) {
		n++
		if (i == month_now) {
			$('.transaksi_performa_bulan').append($('<option selected/>').val(n).html(m[i]));
		} else {
			$('.transaksi_performa_bulan').append($('<option />').val(n).html(m[i]));
		}
	}
}

function getYearTransaksiPerforma() {
	let startYear = 2018;
	let endYear = new Date().getFullYear();
	$('.transaksi_performa_years').append($('<option/>').val('all').html('All Tahun'));
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('.transaksi_performa_years').append($('<option selected/>').val(i).html(i));
		} else {
			$('.transaksi_performa_years').append($('<option />').val(i).html(i));
		}
	}
}

function openPopupDetailSales() {
	let popup = `<div class="popup detail-sales">
      <div class="view">
        <div class="page">
          <div class="navbar">
            <div class="navbar-bg"></div>
            <div class="navbar-inner bg-dark-gray-medium">
              <div class="title">Detail Sales</div>
              <div class="right">
                <!-- Link to close popup -->
                <p class="text-add-colour-white link popup-close" data-popup=".detail-sales" id="close-detail-sales"><i
                    style="margin-right:5px;" class="f7-icons">xmark_rectangle_fill</i></p>
              </div>
            </div>
          </div>
          <div class="page-content">
            <div class="card card-outline margin-top">
              <div class="card-content">
                <div class="row">
                  <div class="col-100">
                    <div class="card-content" style="overflow-x:auto; width:100%;margin-top:5px;" id="detail_cs"></div>
                    <br>
                    <h3 class="text-align-center">
                      <span id="popup-penjualan-nospk"></span>,
                      <span id="popup-penjualan-client_nama_header"></span>
					  <input type="hidden" id="popup-detail-sales-page">
                    </h3>
                    <div class="card-content" style="overflow-x:auto; width:100%;margin-bottom: 10px;">
                      <table width="100%">
                        <tbody>

                          <tr>
                            <td width="35%" class="numeric-cell text-align-left">Perusahaan</td>
                            <td width="15%" class="numeric-cell">:</td>
                            <td width="60%" id="popup-penjualan-td-client_nama" class="numeric-cell"></td>
                          </tr>

                          <tr>
                            <td class="numeric-cell text-align-left">Person</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-client_person" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Posisi</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-client_posisi" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Telpon / Wa</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-client_telpon" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Sales</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-karyawan_nama" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Pabrik</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-lokasi_pabrik" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Wilayah</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-wilayah" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Tanggal Order</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-penjualan_tanggal" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Tanggal Kirim</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-penjualan_selesai" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Jumlah Pesan</td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-penjualan_jumlah" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Penjualan
                            </td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-penjualan_grandtotal" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Dibayar
                            </td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-penjualan_jumlah_pembayaran" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Sisa
                            </td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-penjualan_kekurangan" class="numeric-cell"></td>
                          </tr>
                          <tr>
                            <td class="numeric-cell text-align-left">Status
                            </td>
                            <td class="numeric-cell">:</td>
                            <td id="popup-penjualan-penjualan_status_pembayaran" class="numeric-cell"></td>
                          </tr>
                          <div class="card" id="detail_sales_data">
                          </div>
                        </tbody>
                      </table>
                    </div>
                    <div class="text-align-center" id="detail_cs_button" style="margin-bottom: 10px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

	jQuery('body').append(popup);
}

// ==================== PRODUKSI SELESAI FUNCTIONS (UPDATED) ====================

// Variabel global untuk menyimpan data sementara
let tempProduksiSelesaiData = [];

/**
 * Cek produksi selesai saat halaman dimuat
 * Fungsi ini akan otomatis dipanggil saat halaman penjualan dibuka
 */
function checkProduksiSelesaiOnLoad() {
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-produksi-selesai-notif",
		dataType: 'JSON',
		data: {},
		beforeSend: function () {
			// Silent check, tidak perlu preloader
		},
		success: function (response) {
			if (response.status === 'success' && response.data.length > 0) {
				// Simpan data ke variabel temporary
				tempProduksiSelesaiData = response.data;

				// Tampilkan popup notifikasi
				showPopupProduksiSelesaiNotif(response.data);
			}
		},
		error: function (xhr, status, error) {
			console.error('Error checking produksi selesai:', error);
		}
	});
}

/**
 * Tampilkan popup notifikasi dengan button detail (PATCHED)
 */
function showPopupProduksiSelesaiNotif(data) {
	let html = '';

	if (data.length === 0) {
		html = '<tr><td colspan="7" style="padding: 20px; color: gray;">Tidak ada data</td></tr>';
	} else {
		data.forEach(function (item, index) {
			// Main row
			html += '<tr id="notif-row-' + item.penjualan_detail_performa_id + '">';
			html += '<td style="border: 1px solid gray;" width="15%">' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
			html += '<td style="border: 1px solid gray;text-align:left;" width="20%">' + item.client_nama + '</td>';
			html += '<td style="border: 1px solid gray;text-align:left;" width="15%">' + item.penjualan_jenis + '</td>';
			html += '<td style="border: 1px solid gray;" width="12%">' + formatTanggal(item.penjualan_tanggal) + '</td>';
			html += '<td style="border: 1px solid gray;" width="12%">' + formatTanggal(item.penjualan_tanggal_kirim) + '</td>';
			html += '<td style="border: 1px solid gray;text-align:right;" width="16%">' + number_format(item.penjualan_grandtotal) + '</td>';
			html += '<td style="border: 1px solid gray;" width="10%">';
			html += '<button class="button button-small button-fill bg-color-blue" onclick="toggleDetailNotifProduksi(\'' + item.penjualan_id + '\', \'' + item.penjualan_detail_performa_id + '\')">';
			html += '<i class="f7-icons btn-expand-produksi" id="icon-notif-' + item.penjualan_detail_performa_id + '" style="font-size: 12px;">chevron_down</i> Detail';
			html += '</button>';
			html += '</td>';
			html += '</tr>';

			// Detail row (hidden by default)
			html += '<tr id="notif-detail-' + item.penjualan_detail_performa_id + '" class="detail-row-produksi">';
			html += '<td colspan="7" style="border: 1px solid gray; padding: 0;">';
			html += '<div class="detail-content-produksi" id="notif-content-' + item.penjualan_detail_performa_id + '">';
			html += '<div style="text-align: center; padding: 20px; color: gray;"><i class="f7-icons">arrow_2_circlepath</i> Loading...</div>';
			html += '</div>';
			html += '</td>';
			html += '</tr>';
		});
	}

	jQuery('#produksi-selesai-notif-tbody').html(html);

	// Buka popup
	app.popup.open('.popup-produksi-selesai-notif');
}

// Cache untuk detail yang sudah di-load - HARUS DIDEKLARASIKAN SEBELUM FUNGSI YANG MENGGUNAKANNYA
var detailCacheProduksi = {};

/**
 * Toggle detail di popup notifikasi (INLINE EXPAND)
 */
function toggleDetailNotifProduksi(penjualanId, performaId) {
	let detailRow = jQuery('#notif-detail-' + performaId);
	let icon = jQuery('#icon-notif-' + performaId);

	if (detailRow.hasClass('show')) {
		// Hide detail
		detailRow.removeClass('show');
		icon.removeClass('expanded');
	} else {
		// Show detail
		detailRow.addClass('show');
		icon.addClass('expanded');

		// Load detail jika belum ada di cache
		if (!detailCacheProduksi[performaId]) {
			loadDetailProduksiInline(performaId, 'notif-content-' + performaId);
		}
	}
}

/**
 * Konfirmasi produksi selesai (update is_produksi_selesai = 1)
 */
function confirmProduksiSelesai() {
	if (tempProduksiSelesaiData.length === 0) {
		app.dialog.alert('Tidak ada data untuk dikonfirmasi');
		return;
	}

	// Ambil semua penjualan_id
	let penjualanIds = tempProduksiSelesaiData.map(item => item.penjualan_detail_performa_id);

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/update-is-produksi-selesai",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: penjualanIds
		},
		beforeSend: function () {
			app.dialog.preloader('Menyimpan...');
		},
		success: function (response) {
			app.dialog.close();

			if (response.status === 'success') {
				// Tutup popup notifikasi
				app.popup.close('.popup-produksi-selesai-notif');

				// Refresh data penjualan jika ada fungsi refresh
				if (typeof tampilDataManager === 'function') {
					tampilDataManager();
				}

				// Clear temporary data
				tempProduksiSelesaiData = [];

				app.dialog.alert('Data berhasil disimpan ke riwayat');
			} else {
				app.dialog.alert('Gagal menyimpan data: ' + (response.message || 'Unknown error'));
			}
		},
		error: function (xhr, status, error) {
			app.dialog.close();
			app.dialog.alert('Error: ' + error);
		}
	});
}

/**
 * Ambil data tampungan dari localStorage
 */
function getTampunganProduksiSelesai() {
	let data = localStorage.getItem(STORAGE_KEY_PRODUKSI_SELESAI);
	if (data) {
		try {
			return JSON.parse(data);
		} catch (e) {
			console.error('Error parsing localStorage data:', e);
			return [];
		}
	}
	return [];
}

/**
 * Lihat detail item produksi per penjualan
 */
function viewDetailItemProduksi(penjualanId, noSpk) {
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-detail-produksi-selesai",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: penjualanId
		},
		beforeSend: function () {
			app.dialog.preloader('Memuat detail...');
		},
		success: function (response) {
			app.dialog.close();

			if (response.status === 'success') {
				// Update statistik
				jQuery('#detail-spk-number').text(noSpk);
				jQuery('#stat-selesai').text(response.stats.selesai);
				jQuery('#stat-proses').text(response.stats.proses);
				jQuery('#stat-body').text(response.stats.body);
				jQuery('#stat-noted').text(response.stats.noted);

				// Populate tabel detail
				let html = '';
				if (response.data.length === 0) {
					html = '<tr><td colspan="7" style="padding: 20px; color: gray;">Tidak ada data</td></tr>';
				} else {
					response.data.forEach(function (item, index) {
						let statusColor = '';
						switch (item.status_produksi) {
							case 'selesai': statusColor = 'green'; break;
							case 'proses': statusColor = 'blue'; break;
							case 'body': statusColor = 'orange'; break;
							case 'noted': statusColor = 'gray'; break;
							default: statusColor = 'gray';
						}

						html += '<tr>';
						html += '<td style="border: 1px solid gray;">' + (index + 1) + '</td>';
						html += '<td style="border: 1px solid gray;">' + (item.penjualan_jenis || '-') + '</td>';
						html += '<td style="border: 1px solid gray;">' + (item.penjualan_qty || 0) + '</td>';
						html += '<td style="border: 1px solid gray;">' + (item.ukuran_jual || '-') + '</td>';
						html += '<td style="border: 1px solid gray;">' + (item.kode_warna || '-') + '</td>';
						html += '<td style="border: 1px solid gray;">';
						html += '<span class="badge color-' + statusColor + '">' + (item.status_produksi || '-') + '</span>';
						html += '</td>';
						html += '<td style="border: 1px solid gray;">' + formatTanggal(item.produksi_tanggal_selesai) + '</td>';
						html += '</tr>';
					});
				}

				jQuery('#detail-item-produksi-tbody').html(html);

				// Buka popup detail
				app.popup.open('.popup-detail-item-produksi');
			} else {
				app.dialog.alert('Gagal memuat detail: ' + response.message);
			}
		},
		error: function (xhr, status, error) {
			app.dialog.close();
			app.dialog.alert('Error: ' + error);
		}
	});
}

/**
 * Format tanggal ke format Indonesia (DD/MM/YYYY)
 */
function formatTanggal(dateString) {
	if (!dateString) return '-';

	try {
		let date = new Date(dateString);
		let day = date.getDate().toString().padStart(2, '0');
		let month = (date.getMonth() + 1).toString().padStart(2, '0');
		let year = date.getFullYear();
		return day + '/' + month + '/' + year;
	} catch (e) {
		return dateString;
	}
}


// ==================== AUTO EXECUTE ====================

// Jalankan pengecekan saat halaman penjualan dimuat
// Tambahkan ini di event listener page:init untuk halaman penjualan
jQuery(document).on('page:init', '.page[data-name="penjualan"]', function (e) {
	loadBankData();
	setTimeout(function () {
		checkProduksiSelesaiOnLoad();
	}, 1000);
});


let dataProduksiSelesai = [];

function showTableProduksiSelesai() {
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-riwayat-produksi-selesai",
        dataType: 'JSON',
        data: {},
        beforeSend: function () {
            app.dialog.preloader('Memuat riwayat...');
        },
        success: function (response) {
            app.dialog.close();

            if (response.status === 'success') {
                dataProduksiSelesai = response.data; // Simpan ke variabel global
                jQuery('#filter-nama-client').val('');  // Reset filter
                renderTableProduksiSelesai(dataProduksiSelesai); // Render table
            } else {
                app.dialog.alert('Gagal memuat riwayat: ' + response.message);
            }
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            console.error('Error loading riwayat:', error);
            app.dialog.alert('Error: ' + error);
        }
    });
}

// Pisahkan logic render ke fungsi sendiri
function renderTableProduksiSelesai(data) {
    let html = '';

    if (data.length === 0) {
        jQuery('#tampungan-produksi-selesai-tbody').html('');
        jQuery('#empty-state-tampungan').show();
        return;
    }

    jQuery('#empty-state-tampungan').hide();

    data.forEach(function (item, index) {
        // Main row
        html += '<tr id="riwayat-row-' + item.penjualan_detail_performa_id + '">';
        html += '<td style="border: 1px solid gray;" width="5%">' + (index + 1) + '</td>';
        html += '<td style="border: 1px solid gray;" width="15%">' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
        html += '<td style="border: 1px solid gray;text-align:left;" width="20%">' + item.client_nama + '</td>';
        html += '<td style="border: 1px solid gray;text-align:left;" width="15%">' + item.penjualan_jenis + '</td>';
        html += '<td style="border: 1px solid gray;text-align:right;" width="15%">' + number_format(item.penjualan_grandtotal) + '</td>';
        html += '<td style="border: 1px solid gray;" width="10%"><span class="badge color-blue">Dikonfirmasi</span></td>';
        html += '<td style="border: 1px solid gray;" width="10%">';
        html += '<button class="button button-small button-fill bg-color-green" onclick="toggleDetailRiwayatProduksi(\'' + item.penjualan_id + '\', \'' + item.penjualan_detail_performa_id + '\')">';
        html += '<i class="f7-icons btn-expand-produksi" id="icon-riwayat-' + item.penjualan_detail_performa_id + '" style="font-size: 12px;">chevron_down</i> Detail';
        html += '</button>';
        html += '</td>';
        html += '</tr>';

        // Detail row (hidden by default)
        html += '<tr id="riwayat-detail-' + item.penjualan_detail_performa_id + '" class="detail-row-produksi">';
        html += '<td colspan="7" style="border: 1px solid gray; padding: 0;">';
        html += '<div class="detail-content-produksi" id="riwayat-content-' + item.penjualan_detail_performa_id + '">';
        html += '<div style="text-align: center; padding: 20px; color: gray;"><i class="f7-icons">arrow_2_circlepath</i> Loading...</div>';
        html += '</div>';
        html += '</td>';
        html += '</tr>';
    });

    jQuery('#tampungan-produksi-selesai-tbody').html(html);
}

// Filter berdasarkan input user
function filterTableByClient() {
    let keyword = jQuery('#filter-nama-client').val().toLowerCase().trim();
    
    if (keyword === '') {
        renderTableProduksiSelesai(dataProduksiSelesai);
        return;
    }

    let filtered = dataProduksiSelesai.filter(function (item) {
        return item.client_nama.toLowerCase().includes(keyword);
    });

    renderTableProduksiSelesai(filtered);
}

// Reset filter
function clearFilterClient() {
    jQuery('#filter-nama-client').val('');
    renderTableProduksiSelesai(dataProduksiSelesai);
}

/**
 * Toggle detail di riwayat (INLINE EXPAND)
 */
function toggleDetailRiwayatProduksi(penjualanId, performaId) {
	let detailRow = jQuery('#riwayat-detail-' + performaId);
	let icon = jQuery('#icon-riwayat-' + performaId);

	if (detailRow.hasClass('show')) {
		// Hide detail
		detailRow.removeClass('show');
		icon.removeClass('expanded');
	} else {
		// Show detail
		detailRow.addClass('show');
		icon.addClass('expanded');

		// Load detail jika belum ada di cache
		if (!detailCacheProduksi[performaId]) {
			loadDetailProduksiInline(performaId, 'riwayat-content-' + performaId);
		}
	}
}

/**
 * Load detail produksi INLINE (Jenis, Qty, Foto)
 */
function loadDetailProduksiInline(performaId, targetElementId) {
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-detail-produksi-selesai",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: performaId
		},
		success: function (response) {
			if (response.status === 'success' && response.data.length > 0) {
				// Cache the data
				detailCacheProduksi[performaId] = response.data;

				// Build HTML
				let html = '<div>';

				// Statistik mini


				// Detail items
				response.data.forEach(function (item, index) {
					let statusColor = '';
					switch (item.status_produksi) {
						case 'selesai': statusColor = '#4CAF50'; break;
						case 'proses': statusColor = '#2196F3'; break;
						case 'body': statusColor = '#FF9800'; break;
						case 'noted': statusColor = '#9E9E9E'; break;
						default: statusColor = '#9E9E9E';
					}

					html += '<div class="detail-item-card-produksi">';

					html += '<div style="margin-top: 10px;">';
					html += '<div style="margin-bottom: 5px;"><strong>Jenis:</strong> ' + (item.penjualan_jenis || '-') + '</div>';
					html += '<div><strong>Qty:</strong> ' + (item.penjualan_qty || 0) + ' pcs</div>';
					html += '</div>';

					// Foto
					if (item.foto_produksi_selesai) {
						html += '<div class="item-photos justify-content-center">';
						let photos = item.foto_produksi_selesai.split(/[,|]/);
						photos.forEach(function (photo) {
							if (photo.trim()) {
								let photoUrl = BASE_PATH_IMAGE_BUKTI_PRODUKSI + '/' + photo.trim();
								html += '<img src="' + photoUrl + '" onclick="zoomFotoProduksi(\'' + photoUrl + '\')" onerror="this.style.display=\'none\';" />';
							}
						});
						html += '</div>';
					} else {
						html += '<div style="margin-top: 10px; color: #888; font-style: italic;">Belum ada foto produksi</div>';
					}

					html += '</div>';
				});

				html += '</div>';

				jQuery('#' + targetElementId).html(html);
			} else {
				jQuery('#' + targetElementId).html('<div style="text-align: center; padding: 20px; color: gray;">Tidak ada detail item</div>');
			}
		},
		error: function (xhr, status, error) {
			jQuery('#' + targetElementId).html('<div style="text-align: center; padding: 20px; color: red;">Error loading detail: ' + error + '</div>');
		}
	});
}

/**
 * Zoom foto produksi
 */
function zoomFotoProduksi(photoUrl) {
	if (typeof app !== 'undefined' && app.photoBrowser) {
		var myPhotoBrowser = app.photoBrowser.create({
			photos: [photoUrl],
			theme: 'dark',
			type: 'standalone'
		});
		myPhotoBrowser.open();
	} else {
		// Fallback: open in new window
		window.open(photoUrl, '_blank');
	}
}

// ========================================
// MENU PROFORMA - Created by: Aryakkk
// ========================================

/**
 * Redirect ke halaman Performa Input dalam mode EDIT
 * Fungsi ini dipanggil ketika user klik tombol "Edit" pada performa
 * 
 * @param {string} performa_header_id - ID header performa yang akan diedit
 */
function redirectToEditPerforma(performa_header_id) {
	console.log('🔄 Redirecting to Edit Performa...');
	console.log('performa_header_id:', performa_header_id);

	if (!performa_header_id) {
		app.dialog.alert('Error: ID Performa tidak valid');
		return;
	}

	// Simpan ke localStorage
	localStorage.setItem('edit_performa_mode', 'true');
	localStorage.setItem('edit_performa_header_id', performa_header_id);

	console.log('✅ Edit mode data saved to localStorage');

	// Close popup jika ada yang terbuka
	app.popup.close();

	// Redirect ke halaman performa_input
	app.views.main.router.navigate('/performa/input', {
		reloadCurrent: false,
		ignoreCache: true
	});
}