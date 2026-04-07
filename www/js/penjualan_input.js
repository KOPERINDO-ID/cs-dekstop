jQuery('#nilai_penjualan').mask('000.000.000', { reverse: false });
jQuery('.input-item-price').mask('000,000,000,000', { reverse: true });
jQuery('.input-item-pembayaran').mask('000,000,000,000', { reverse: true });
jQuery('.input-item-invest-molding').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_dp_akhir').mask('000,000,000,000', { reverse: true });

// ========================================
// VARIABEL DAN FUNCTION UNTUK BANK
// ========================================
var globalBankData = [];
var isOwner = false;
var id_provinsi_single = null;
var id_kota_single = null;
var id_provinsi_multiple = null;
var id_kota_multiple = null;

/**
 * Cek apakah user adalah owner (Stn)
 */
function checkIsOwner() {
    var username = localStorage.getItem("username");
    return username === 'Stn';
}

/**
 * Load data bank dari server
 * Kirim username untuk filter bank (owner dapat semua, sales dapat yang umum)
 */
function loadBankDataInput() {
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
                console.log('Bank data loaded (input):', globalBankData);
                console.log('Is Owner:', isOwner);
                
                // Render ke dropdown bank di halaman input
                renderBankOptionsInput();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading bank data:', error);
        }
    });
}

/**
 * Generate HTML options untuk dropdown bank
 */
function generateBankOptionsInput(selectedValue = 3, excludeTunai = false) {
    var options = '';
    
    if (globalBankData.length === 0) {
        options = '<option value="">Loading...</option>';
        return options;
    }
    
    // Default ke Mandiri (id=3)
    if (selectedValue === null || selectedValue === '' || selectedValue === 'null') {
        selectedValue = 3;
    }
    
    var selectedBankId = null;
    
    if (!isNaN(selectedValue) && parseInt(selectedValue) > 0) {
        selectedBankId = parseInt(selectedValue);
    } else if (typeof selectedValue === 'string') {
        var bankByCode = globalBankData.find(function(b) {
            return b.bank_kode === selectedValue;
        });
        if (bankByCode) {
            selectedBankId = bankByCode.bank_id;
        }
    }
    
    if (selectedBankId === null) {
        selectedBankId = 3;
    }
    
    globalBankData.forEach(function(bank) {
        if (excludeTunai && bank.bank_kode === 'Tunai') {
            return;
        }
        
        var selected = (bank.bank_id === selectedBankId) ? ' selected' : '';
        options += '<option value="' + bank.bank_id + '"' + selected + '>' + bank.bank_label + '</option>';
    });
    
    return options;
}

/**
 * Render bank options ke dropdown di halaman input penjualan
 */
function renderBankOptionsInput() {
    console.log('renderBankOptionsInput called, globalBankData:', globalBankData);
    
    // Untuk penjualan_input.html (multiple) - gunakan selector lebih spesifik
    // Cari select#bank_1 yang ada di dalam form, bukan yang di tabel
    var bankSelectMultiple = jQuery('#penjualan_form select#bank_1, form#penjualan_form select[name="bank_1"]').first();
    
    if (bankSelectMultiple.length) {
        console.log('Found #bank_1 in form, rendering options...');
        console.log('bank_1 element:', bankSelectMultiple[0]);
        console.log('bank_1 parent:', bankSelectMultiple.parent().prop('tagName'), bankSelectMultiple.parent().attr('class'));
        
        bankSelectMultiple.html(generateBankOptionsInput(3));
        
        // Refresh Framework7 Smart Select dengan cara yang benar
        setTimeout(function() {
            try {
                // Cari smart select parent dari element yang benar
                var smartSelectEl = bankSelectMultiple.closest('.smart-select')[0];
                
                console.log('Smart select element for bank_1:', smartSelectEl);
                
                if (smartSelectEl && typeof app !== 'undefined') {
                    var ss = app.smartSelect.get(smartSelectEl);
                    
                    // Jika smart select belum ada, create baru
                    if (!ss) {
                        console.log('Creating new smart select for bank_1');
                        ss = app.smartSelect.create({
                            el: smartSelectEl,
                            openIn: 'popup',
                            searchbar: true,
                            searchbarPlaceholder: 'Pilih Bank'
                        });
                    }
                    
                    // Update value text display
                    var selectedOption = bankSelectMultiple.find('option:selected').text();
                    jQuery(smartSelectEl).find('.item-after').text(selectedOption);
                    jQuery('.title_select_bank').text(selectedOption);
                    console.log('Smart select updated successfully for bank_1');
                } else {
                    console.log('Smart select element not found or app not defined');
                    // Fallback: update text directly
                    var selectedOption = bankSelectMultiple.find('option:selected').text();
                    jQuery('.title_select_bank').text(selectedOption || 'Pilih Bank');
                }
            } catch(e) {
                console.log('Smart select refresh error (bank_1):', e);
            }
        }, 500);
    }
    
    // Untuk penjualan_input_single.html - gunakan selector lebih spesifik
    var bankSelectSingle = jQuery('#penjualan_form select#bank, form#penjualan_form select[name="bank"]').first();
    
    if (bankSelectSingle.length) {
        console.log('Found #bank in form, rendering options...');
        bankSelectSingle.html(generateBankOptionsInput(3));
        
        // Refresh Framework7 Smart Select dengan cara yang benar
        setTimeout(function() {
            try {
                var smartSelectEl = bankSelectSingle.closest('.smart-select')[0];
                
                console.log('Smart select element for bank:', smartSelectEl);
                
                if (smartSelectEl && typeof app !== 'undefined') {
                    var ss = app.smartSelect.get(smartSelectEl);
                    
                    // Jika smart select belum ada, create baru
                    if (!ss) {
                        console.log('Creating new smart select for bank');
                        ss = app.smartSelect.create({
                            el: smartSelectEl,
                            openIn: 'popup',
                            searchbar: true,
                            searchbarPlaceholder: 'Pilih Bank'
                        });
                    }
                    
                    // Update value text display
                    var selectedOption = bankSelectSingle.find('option:selected').text();
                    jQuery(smartSelectEl).find('.item-after').text(selectedOption);
                    jQuery('.title_select_bank').text(selectedOption);
                    console.log('Smart select updated successfully for bank');
                } else {
                    console.log('Smart select element not found or app not defined');
                    // Fallback: update text directly
                    var selectedOption = bankSelectSingle.find('option:selected').text();
                    jQuery('.title_select_bank').text(selectedOption || 'Pilih Bank');
                }
            } catch(e) {
                console.log('Smart select refresh error (bank):', e);
            }
        }, 500);
    }
}

// Panggil loadBankDataInput saat DOM ready
jQuery(document).ready(function() {
    console.log('DOM ready - calling loadBankDataInput');
    loadBankDataInput();
    
    // Juga setup event listener untuk Framework7 jika belum ada
    setupF7PageEvents();
});

// Function untuk setup Framework7 page events
function setupF7PageEvents() {
    if (typeof app !== 'undefined' && typeof $$ !== 'undefined') {
        console.log('Setting up F7 page events for penjualan_input');
        
        // Event ketika page init
        $$(document).on('page:init', '.page[data-name="penjualan_input"]', function() {
            console.log('Page penjualan_input init - loading bank data');
            loadBankDataInput();
        });
        
        // Event ketika page mounted
        $$(document).on('page:mounted', '.page[data-name="penjualan_input"]', function() {
            console.log('Page penjualan_input mounted - ensuring bank data');
            if (globalBankData.length === 0) {
                loadBankDataInput();
            } else {
                renderBankOptionsInput();
            }
        });
    }
}

// ========================================
// FUNCTION LAINNYA
// ========================================

/**
 * Helper function untuk generate label status ongkir dengan warna
 * @param {string} statusOngkir - pending/free/nominal
 * @returns {object} - {text: string, color: string}
 */
function getOngkirStatusLabel(statusOngkir) {
	var labelText = '';
	var labelColor = '';
	
	if (statusOngkir === 'pending') {
		labelText = '(Pending)';
		labelColor = '#ff3b30'; // Merah
	} else if (statusOngkir === 'free') {
		labelText = '(Free)';
		labelColor = '#34c759'; // Hijau
	} else if (statusOngkir === 'nominal') {
		labelText = '(Nominal)';
		labelColor = '#007aff'; // Biru
	} else {
		labelText = '(Pending)';
		labelColor = '#ff3b30'; // Default merah
	}
	
	return {
		text: labelText,
		color: labelColor
	};
}

function changeDate(id) {
	$("." + id + "").prop('type', 'date');
	console.log(id);
}


var delayTimer;
function doSearchProspek() {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		penjualanGetPerformaData();
	}, 1000);
}



function deletePerformaPenjualan(performa_id_table) {


	$$('.delete-performa-' + (performa_id_table - 1)).show();

	console.log('delete-performa-' + (performa_id_table - 1));
	$$('#count_performa').val($$('.performa_group_field_count').length - 1);
	$$('#performa_' + performa_id_table + '').remove();
	$$('#title_' + performa_id_table + '').remove();
	var total = $$('#price_' + performa_id_table + '').val() * $$('#qty_' + performa_id_table + '').val();
	$$('#total_' + performa_id_table + '').val(total);
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
	var count_file = 1;
	$$('.input-item-file').each(function () {
		$$(this).attr("name", 'file_' + count_file);
		$$(this).attr("id", 'file_' + count_file);
		count_file++;
	});

	var count_invest_molding = 1;
	$$('.input-item-invest-molding').each(function () {
		$$(this).attr("name", 'invest_molding_' + count_invest_molding);
		$$(this).attr("id", 'invest_molding_' + count_invest_molding);
		count_invest_molding++;
	});

	var count_title_performa = 1;

	$$('.title-performa').each(function () {
		$$(this).html('Sales #' + count_title_performa);
		count_title_performa++;
	});

	var count_kode = 1;
	$$('.input-item-kode').each(function () {
		$$(this).attr("name", 'kode_' + count_kode);
		$$(this).attr("id", 'kode_' + count_kode);
		count_kode++;
	});

	var count_bank = 1;
	$$('.input-item-bank').each(function () {
		$$(this).attr("name", 'bank_' + count_bank);
		$$(this).attr("id", 'bank_' + count_bank);
		count_bank++;
	});

	var count_tanggal_pemesanan = 1;
	$$('.input-item-tanggal-pemesanan').each(function () {
		$$(this).attr("name", 'tanggal_pemesanan_' + count_tanggal_pemesanan);
		$$(this).attr("id", 'tanggal_pemesanan_' + count_tanggal_pemesanan);
		count_tanggal_pemesanan++;
	});

	var count_tanggal_pengiriman = 1;
	$$('.input-item-tanggal-kirim').each(function () {
		$$(this).attr("name", 'tanggal_kirim_' + count_tanggal_pengiriman);
		$$(this).attr("id", 'tanggal_kirim_' + count_tanggal_pengiriman);
		count_tanggal_pengiriman++;
	});

	var count_biaya_kirim = 1;
	$$('.input-item-biaya-kirim-multiple').each(function () {
		$$(this).attr("name", 'biaya_kirim_multiple_' + count_biaya_kirim);
		$$(this).attr("id", 'biaya_kirim_multiple_' + count_biaya_kirim);
		count_biaya_kirim++;
	});
}


function deleteKodePerformaPenjualan(performa_id_table, urutan) {
	console.log(performa_id_table);
	console.log(urutan);
	$$('#count_kode_' + performa_id_table + '').val($$('.kode_content_' + performa_id_table + '').length - 1);
	$$('.urutan_li_' + performa_id_table + '_' + urutan + '').remove();

	var kode = 1;
	$$('.kode_content_' + performa_id_table + '').each(function () {
		$$(this).attr("name", 'kode_content_' + performa_id_table + '_' + kode);
		$$(this).attr("id", 'kode_content_' + performa_id_table + '_' + kode);
		$$(this).attr("placeholder", "Kode " + kode + "");
		kode++;
	});

	var section = performa_id_table;
	$$('.qty_' + section + '').each(function () {
		$$(this).attr("name", 'qty_' + section + '_' + kode);
		$$(this).attr("id", 'qty_' + section + '_' + kode);
		$$(this).attr("onchange", "checkPrice(value,'" + section + "','" + kode + "')");
		kode++;
	});

	kode = 1;
	$$('.sub_harga_' + section + '').each(function () {
		$$(this).attr("name", 'sub_harga_' + section + '_' + kode);
		$$(this).attr("id", 'sub_harga_' + section + '_' + kode);
		$$(this).attr("placeholder", "Kode " + kode + "");
		kode++;
	});
}


function checkPrice(qty, section, urutan) {
	var performa_id = $$('#kode_content_' + section + '_' + urutan + '').val();
	console.log(section);
	console.log(urutan);
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/check-price",
		dataType: "JSON",
		data: {
			performa_id: performa_id,
			performa_header_id: localStorage.getItem("performa_header_id")
		},
		beforeSend: function () {
			app.dialog.preloader('Menghitung Data');
		},
		success: function (data) {

			if (data.data.length != 0) {
				app.dialog.close();
				$$('#sub_harga_' + section + '_' + urutan + '').val(number_format(parseInt(data.data[0].price) * parseInt(qty)));
				localStorage.setItem("item_" + performa_id + "", data.data[0].qty);

				$$('#qty_' + section + '_' + urutan + '').attr('class', '');
				$$('#qty_' + section + '_' + urutan + '').addClass("item_" + performa_id + "");
				$$('#qty_' + section + '_' + urutan + '').addClass("qty_" + section + " text-add-colour-black-soft bg-dark-gray-young button-small text-bold input-with-value");

				var sum = 0;
				$$(".item_" + performa_id + "").each(function () {
					sum += parseFloat(this.value);
				});

				var penjualan_total = 0;
				$$('.sub_harga_' + section + '').each(function () {
					penjualan_total += parseFloat(this.value.replace(/\,/g, ''));
				});
				$$('#penjualan_total_' + section + '').val(penjualan_total);

				var qty_total = 0;
				$$('.qty_' + section + '').each(function () {
					qty_total += parseFloat(this.value.replace(/\,/g, ''));
				});
				$$('#qty_total_' + section + '').val(qty_total);



				if (sum > localStorage.getItem("item_" + performa_id + "")) {
					app.dialog.alert("Quantity melewati batas");
					$$('#qty_' + section + '_' + urutan + '').css("background-color", "red");
					$$('#qty_' + section + '_' + urutan + '').val("");
					$$('#sub_harga_' + section + '_' + urutan + '').val(0);
				} else {
					$$('#qty_' + section + '_' + urutan + '').css("background-color", "");
				}

			} else {
				app.dialog.close();
				console.log('data tidak ada');
				app.dialog.alert("Kode Item Tidak Ada Di Performa Ini");
				$$('#qty_' + section + '_' + urutan + '').val("");
				$$('#sub_harga_' + section + '_' + urutan + '').val(0);
			}
		}
	});
}

function addKodePerformaPenjualan(section, urutan) {
	var count_kode_content = 1;
	$$('.kode_content_' + section + '').each(function () {
		count_kode_content++;
	});


	$$('#count_kode_' + section + '').val($$('.kode_content_' + section + '').length + 1);


	var kode_1 = "";
	kode_1 += '<li class="item-content item-input margin-5 urutan_li_' + section + '_' + count_kode_content + '">';
	kode_1 += '<a  class="delete_kode_performa_penjual' + section + '_' + count_kode_content + ' f7-icons" onclick="deleteKodePerformaPenjualan(\'' + section + '\',\'' + count_kode_content + '\');" style="float:right; font-size:39px; margin-left:-60px; margin-right:19px; color:red;">bag_fill_badge_minus</a>';
	kode_1 += '<div class="item-inner" style="height:8px; Width:126px;">';
	kode_1 += '<div class="item-input-wrap">';
	kode_1 += '    <input placeholder="Kode" name="kode_content_' + section + '_' + count_kode_content + '" id="kode_content_' + section + '_' + count_kode_content + '"  class="kode_content_' + section + ' text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="text" required validate>';
	kode_1 += '  </div>';
	kode_1 += '</div>';
	kode_1 += '<div class="item-inner" style="height:8px;  Width:140px;">';
	kode_1 += '<div class="item-input-wrap">';
	kode_1 += '<input placeholder="Qty"  name="qty_' + section + '_' + count_kode_content + '" id="qty_' + section + '_' + count_kode_content + '" onchange="checkPrice(value,\'' + section + '\',\'' + count_kode_content + '\')"  class="qty_' + section + ' text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="number" required validate>';
	kode_1 += '</div>';
	kode_1 += '</div>';
	kode_1 += '<div class="item-inner" style="height:8px;">';
	kode_1 += '     <div class="item-input-wrap">';
	kode_1 += '       <input  style="width:100%;" placeholder="Total" value="0" name="sub_harga_' + section + '_' + count_kode_content + '" id="sub_harga_' + section + '_' + count_kode_content + '"  class="sub_harga_' + section + ' text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="text" readonly>';
	kode_1 += '     </div>';
	kode_1 += '   </div>';
	kode_1 += '</li>';

	$$('#kode_content_' + section + '_html').append(kode_1);



}


jQuery('.biaya_kirim_multiple_number').mask('000,000,000,000', { reverse: true });
function addPerformaPenjualan() {

	$$('.delete-performa').hide();
	console.log($$('.performa_group_field_count').length);
	$$('#count_performa').val($$('.performa_group_field_count').length + 1);


	var html_performa_group_field = '';
	html_performa_group_field += '<h3 style="margin-left:13px; margin-top:8px;" id="title_' + ($('.performa_group_field_count').length + 1) + '"  class="title-performa" >Sales #' + ($('.performa_group_field_count').length + 1) + '</h3><ul id="performa_' + ($('.performa_group_field_count').length + 1) + '" class="performa_group_field_count" style="background-color:#1c1c1d; border-radius:2px; margin:15px; border:1px solid gray; ">';


	html_performa_group_field += '    <li class="item-content item-input" style="">';
	html_performa_group_field += '       <a  class="add_kode_performa_' + ($('.performa_group_field_count').length + 1) + '_1 f7-icons" onclick="addKodePerformaPenjualan(' + ($('.performa_group_field_count').length + 1) + ',1);" style="float:right; font-size:39px; margin-left:-57px; margin-right:19px; color:forestgreen;">bag_fill_badge_plus</a>';
	html_performa_group_field += '       <div class="item-inner" style="height:8px; Width:120px;">';
	html_performa_group_field += '         <div class="item-input-wrap">';
	html_performa_group_field += '           <input placeholder="Kode" name="kode_content_' + ($('.performa_group_field_count').length + 1) + '_1" id="kode_content_' + ($('.performa_group_field_count').length + 1) + '_1"  class="kode_content_' + ($('.performa_group_field_count').length + 1) + ' text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="text"  required validate>';
	html_performa_group_field += '         </div>';
	html_performa_group_field += '       </div>';
	html_performa_group_field += '       <div class="item-inner" style="height:8px; Width:140px;">';
	html_performa_group_field += '        <div class="item-input-wrap">';
	html_performa_group_field += '        <input placeholder="Qty" name="qty_' + ($('.performa_group_field_count').length + 1) + '_1" id="qty_' + ($('.performa_group_field_count').length + 1) + '_1" onchange="checkPrice(value,' + ($('.performa_group_field_count').length + 1) + ',1)"  class="qty_' + ($('.performa_group_field_count').length + 1) + ' text-add-colour-black-soft bg-dark-gray-young button-small text-bold"  type="number" required validate>';
	html_performa_group_field += '        </div>';
	html_performa_group_field += '      </div>';
	html_performa_group_field += '     <div class="item-inner" style="height:8px;">';
	html_performa_group_field += '       <div class="item-input-wrap">';
	html_performa_group_field += '         <input  placeholder="Total" name="sub_harga_' + ($('.performa_group_field_count').length + 1) + '_1" id="sub_harga_' + ($('.performa_group_field_count').length + 1) + '_1"  class="sub_harga_' + ($('.performa_group_field_count').length + 1) + ' text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="text" readonly>';
	html_performa_group_field += '      </div>';
	html_performa_group_field += '    </div>';
	html_performa_group_field += '  </li>';
	html_performa_group_field += '<div id="kode_content_' + ($('.performa_group_field_count').length + 1) + '_html"> </div>';
	html_performa_group_field += '<li class="item-content item-input">';
	html_performa_group_field += '  <div class="item-inner">';
	html_performa_group_field += '    <label style="margin-top:-9px; height:17px;">';
	html_performa_group_field += '      <b>Biaya Kirim</b>';
	html_performa_group_field += '      <span id="label_status_ongkir_' + ($('.performa_group_field_count').length + 1) + '" style="font-size:12px; margin-left:5px;"></span>';
	html_performa_group_field += '    </label>';
	html_performa_group_field += '    <div class="item-input-wrap">';
	html_performa_group_field += '      <input id="biaya_kirim_multiple_' + ($('.performa_group_field_count').length + 1) + '" class="performa-input textbox-n input-item-biaya-kirim-multiple biaya_kirim_multiple_number" type="text" name="biaya_kirim_multiple_' + ($('.performa_group_field_count').length + 1) + '" readonly style="cursor: not-allowed;">'; 
	html_performa_group_field += '    </div>';
	html_performa_group_field += '  </div>';
	html_performa_group_field += '</li>';
	html_performa_group_field += '<li class="item-content item-input">';
	html_performa_group_field += '  <div class="item-inner">';
	html_performa_group_field += ' <label style="margin-top:-9px; height:17px;"><b>Tanggal Order</b></label>';
	html_performa_group_field += '   <div class="item-input-wrap">';
	html_performa_group_field += '    <input  placeholder="Tanggal Pemesanan" id="tanggal_pemesanan_' + ($('.performa_group_field_count').length + 1) + '"  class="performa-input textbox-n input-item-tanggal-pemesanan" type="date"  name="tanggal_pemesanan_' + ($('.performa_group_field_count').length + 1) + '" value="' + moment().format('YYYY-MM-DD') + '"  readonly required validate> ';
	html_performa_group_field += '   <span class="input-clear-button"></span>';
	html_performa_group_field += '  </div>';
	html_performa_group_field += '  </div>';
	html_performa_group_field += ' </li>';
	html_performa_group_field += '<li class="item-content item-input margin-3">';
	html_performa_group_field += '  <div class="item-inner">';
	html_performa_group_field += ' <label style="margin-top:-15px; height:17px;"><b>Tanggal  Kirim</b></label>';
	html_performa_group_field += '   <div class="item-input-wrap">';
	html_performa_group_field += '    <input placeholder="Tanggal Kirim" id="tanggal_kirim_' + ($('.performa_group_field_count').length + 1) + '" class="performa-input textbox-n input-item-tanggal-kirim" type="date"  name="tanggal_kirim_' + ($('.performa_group_field_count').length + 1) + '" required validate> ';
	html_performa_group_field += '    <span class="input-clear-button"></span>';
	html_performa_group_field += '  </div>';
	html_performa_group_field += '  </div>';
	html_performa_group_field += ' <a onclick="addPerformaPenjualan();" id="add_performa" style="float:right; font-size:39px; margin-right:10px; color:forestgreen;" class="add_performa f7-icons">plus_rectangle_fill_on_rectangle_fill</a> <a style="float:right; font-size:36px;  margin-right:10px; margin-top:2px; color:red;" data-id="performa_' + ($('.performa_group_field_count').length + 1) + '"  class="f7-icons delete-performa delete-performa-' + ($('.performa_group_field_count').length + 1) + '" onclick="deletePerformaPenjualan(' + ($('.performa_group_field_count').length + 1) + ');">minus_rectangle_fill</a>';
	html_performa_group_field += ' </li>';

	html_performa_group_field += '<input  name="penjualan_total_' + ($('.performa_group_field_count').length + 1) + '" id="penjualan_total_' + ($('.performa_group_field_count').length + 1) + '" value="" class="penjualan_total_1 omset_total text-bold" type="hidden"  required validate>';
	html_performa_group_field += '<input  name="qty_total_' + ($('.performa_group_field_count').length + 1) + '" id="qty_total_' + ($('.performa_group_field_count').length + 1) + '" value="" class="sum_qty qty_total_' + ($('.performa_group_field_count').length + 1) + ' text-bold" type="hidden"  required validate>';
	html_performa_group_field += '<input  name="count_kode_' + ($('.performa_group_field_count').length + 1) + '" id="count_kode_' + ($('.performa_group_field_count').length + 1) + '" value="1" class="count_kode_' + ($('.performa_group_field_count').length + 1) + ' text-add-colour-black-soft bg-dark-gray-young button-small text-bold" type="hidden"  required validate>';


	console.log(html_performa_group_field);
	$$('.performa_group_field').append(html_performa_group_field);


	var dtToday = new Date();

	var month = dtToday.getMonth() + 1;
	var day = dtToday.getDate();
	var year = dtToday.getFullYear();
	if (month < 10)
		month = '0' + month.toString();
	if (day < 10)
		day = '0' + day.toString();

	var maxDate = year + '-' + month + '-' + day;

	$('.input-item-tanggal-kirim').attr('min', maxDate);
	$('.input-item-tanggal-kirim-single').attr('min', maxDate);


}

function penjualanGetPerformaData() {
	$$('#performa').val(localStorage.getItem("performa_header_id"));

	var invoice_performa = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-performa",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("karyawan_id_performa"),
			performa_header_id: localStorage.getItem("performa_header_id")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			console.log(data.data.length);
			if (data.data.length != 0) {
				var penjualan_total = 0;
				
				// Ambil data provinsi dan kota dari data pertama untuk auto-select
				if (data.data.length > 0) {
					var firstData = data.data[0];
					id_provinsi_multiple = firstData.id_provinsi;
					id_kota_multiple = firstData.id_kota;
					
					console.log('Auto-select Provinsi ID:', id_provinsi_multiple);
					console.log('Auto-select Kota ID:', id_kota_multiple);
					
					// Set biaya kirim dan status ongkir untuk form multiple
					var statusOngkir = firstData.status_ongkir || 'pending';
					var biayaKirim = parseFloat(firstData.biaya_kirim) || 0;
					
					console.log('Status Ongkir (Multiple):', statusOngkir, 'Biaya Kirim:', biayaKirim);
					
					// Set biaya kirim value (formatted)
					$$('#biaya_kirim_multiple_1').val(number_format(biayaKirim));
					
					// Set hidden field untuk status_ongkir
					$$('#status_ongkir').val(statusOngkir);
					
					// Set hidden field untuk budget ongkir total (jika diperlukan)
					$$('#budget_ongkir_total').val(biayaKirim);
					
					// Set label status dengan warna menggunakan helper function
					var ongkirLabel = getOngkirStatusLabel(statusOngkir);
					$$('#label_status_ongkir_1').html('<span style="color:' + ongkirLabel.color + ';">' + ongkirLabel.text + '</span>');
				}
				
				invoice_performa += '<center><table width="97%" border="0" style="border-spacing: 0; background-color:white; color:black;">';
				invoice_performa += '	<tr>';
				invoice_performa += '		<td colspan="5" align="center">Invoice Performa</td>';
				invoice_performa += '	</tr>';
				invoice_performa += '	<tr>';
				invoice_performa += '		<td colspan="2" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Spesifikasi</td>';
				invoice_performa += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
				invoice_performa += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Harga</td>';
				invoice_performa += '		<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Total Rp.</td>';
				invoice_performa += '	</tr>';
				invoice_performa += '<tbody>';
				jQuery.each(data.data, function (i, val) {

					if (localStorage.getItem("type_penjualan_input") == "single") {
						// Untuk single mode
						id_provinsi_single = val.id_provinsi;
						id_kota_single = val.id_kota;
						selectBoxProvinsiSingle(id_provinsi_single);
						var kode_header_image = val.jenis;
						
						// Set biaya kirim dan status ongkir untuk single mode (hanya sekali di iterasi pertama)
						if (i === 0) {
							var statusOngkir = val.status_ongkir || 'pending';
							var biayaKirim = parseFloat(val.biaya_kirim) || 0;
							
							console.log('Status Ongkir (Single - penjualanGetPerformaData):', statusOngkir, 'Biaya Kirim:', biayaKirim);
							
							// Set biaya kirim value (formatted)
							$$('#biaya_kirim_single').val(number_format(biayaKirim));
							
							// Set hidden field untuk status_ongkir
							$$('#status_ongkir').val(statusOngkir);
							
							// Set label status dengan warna menggunakan helper function
							var ongkirLabel = getOngkirStatusLabel(statusOngkir);
							$$('#label_status_ongkir_single').html('<span style="color:' + ongkirLabel.color + ';">' + ongkirLabel.text + '</span>');
						}
					} else {
						// Untuk multiple mode - panggil dengan parameter id_provinsi
						selectBoxProvinsiMultiple(id_provinsi_multiple);
						var kode_header_image = val.performa_id;
					}



					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://indokoper.com/product_image_new';
					} else {
						var path_image = 'https://indokoper.com/performa_image';
					}

					invoice_performa += '		<tr>';
					invoice_performa += '			<td width="30%" class="label-cell text-align-left" style="border-top: solid 1px; border-left: solid 1px; "><center>' + kode_header_image + '<br><img src="' + path_image + '/' + val.gambar + '" width="70%"></center></td>';
					invoice_performa += '			<td width="20%" class="label-cell" align="left" style="border-top: solid 1px; white-space: pre;">' + val.spesifikasi + '</td>';
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
				invoice_performa += '	</table></center>';
				app.dialog.alert('Data Performa Ditemukan');
				$$('#penjualan_save').show();
			} else {
				app.dialog.alert('ID Performa Tidak Valid');
				$$('#penjualan_save').hide();
			}
			$$('#penjualan_performa_get').html(invoice_performa);
			jQuery('.input-item-price').mask('000,000,000,000', { reverse: false });


		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});

}

function getFileName(elm) {
	var fn = $(elm).val();
	var filename = fn.match(/[^\\/]*$/)[0]; // remove C:\fakename
	jQuery('#foto_upload_single_name').val(filename);
}

function getFileNameMultiple(elm) {
	var fn = $(elm).val();
	var filename = fn.match(/[^\\/]*$/)[0]; // remove C:\fakename
	jQuery('#foto_upload_multiple_name').val(filename);
}


function penjualanProcessSingle() {
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
		});
	} else {
		var startDate = $$('#tanggal_pemesanan').val();
		var endDate = $$('#tanggal_kirim').val();
		var a = moment([moment(startDate).format('YYYY'), moment(startDate).format('MM'), moment(startDate).format('DD')]);
		var b = moment([moment(endDate).format('YYYY'), moment(endDate).format('MM'), moment(endDate).format('DD')]);

		if (!$$('#penjualan_form')[0].checkValidity()) {
			app.dialog.alert('Cek Isian Penjualan Anda');
			console.log(localStorage.getItem("jabatan_kantor"));
		} else {
			var formData = new FormData(jQuery("#penjualan_form")[0]);
			formData.append('karyawan_id', localStorage.getItem("karyawan_id_performa"));
			formData.append('jabatan_kantor', localStorage.getItem("jabatan_kantor"));
			formData.append('sales_kota', localStorage.getItem("sales_kota"));
			formData.append('lokasi_pabrik_sales', localStorage.getItem("lokasi_pabrik_sales"));

			jQuery.ajax({
				type: "POST",
				url: "" + BASE_API + "/input-penjualan-performa",
				dataType: "JSON",
				data: formData,
				timeout: 7000,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Proses');
				},
				success: function (data) {
					app.dialog.close();
					$$('.performa-input').val('');
					var smartSelect = app.smartSelect.get('.smart-select');
					if (smartSelect) {
						smartSelect.setValue([]);
					}
					$$('#total_performa').html(number_format(0));
					$$('.performa_group_field').empty();
					$$('#penjualan_performa_get').html("");

					if (data.status == 'done') {
						backToSales();
						getPenjualanHeader(1);
					} else if (data.status == 'failed') {
						backToSales();
						getPenjualanHeader(1);
					} else if (data.status == 'full') {
						backToSales();
						getPenjualanHeader(1);
					}
				},
				error: function (xmlhttprequest, textstatus, message) {
					app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
					backToSales();
					getPenjualanHeader(1);
				}

			});
		}

	}
}

function penjualanProcess() {
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		var startDate = $$('#tanggal_pemesanan').val();
		var endDate = $$('#tanggal_kirim').val();
		var a = moment([moment(startDate).format('YYYY'), moment(startDate).format('MM'), moment(startDate).format('DD')]);
		var b = moment([moment(endDate).format('YYYY'), moment(endDate).format('MM'), moment(endDate).format('DD')]);

		var omset_total = 0;
		$$(".omset_total").each(function () {
			omset_total += +$$(this).val().replace(/\,/g, '');
		});

		var qty_sum = 0;
		$$(".sum_qty").each(function () {
			qty_sum += +$$(this).val();
		});

		if (!$$('#penjualan_form')[0].checkValidity()) {
			app.dialog.alert('Cek Isian Penjualan Anda');
		} else {
			var formData = new FormData(jQuery("#penjualan_form")[0]);
			formData.append('karyawan_id', localStorage.getItem("karyawan_id_performa"));
			formData.append('omset_total', omset_total);
			formData.append('qty_sum', qty_sum);
			formData.append('lokasi_pabrik_sales', localStorage.getItem("lokasi_pabrik_sales"));
			formData.append('jabatan_kantor', localStorage.getItem("jabatan_kantor"));
			formData.append('sales_kota', localStorage.getItem("sales_kota"));
			var sum = 0;
			$$(".total-value").each(function () {
				sum += +$$(this).val().replace(/\,/g, '');
			});
			jQuery.ajax({
				type: "POST",
				url: "" + BASE_API + "/input-penjualan-multiple",
				dataType: "JSON",
				data: formData,
				timeout: 7000,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Proses');
				},
				success: function (data) {
					console.log(data.status);
					if (data.status == 'done') {
						app.dialog.close();
						$$('.performa-input').val('');
						var smartSelect = app.smartSelect.get('.smart-select');
						if (smartSelect) {
							smartSelect.setValue([]);
						}
						$$('#total_performa').html(number_format(0));
						$$('.performa_group_field').empty();

						$$('#penjualan_performa_get').html("");
						backToSales();
					} else if (data.status == 'failed') {
						app.dialog.close();
						$$('.performa-input').val('');
						var smartSelect = app.smartSelect.get('.smart-select');
						if (smartSelect) {
							smartSelect.setValue([]);
						}
						$$('#total_performa').html(number_format(0));
						$$('.performa_group_field').empty();

						$$('#penjualan_performa_get').html("");
						backToSales();
					} else if (data.status == 'full') {
						$$('.performa-input').val('');
						var smartSelect = app.smartSelect.get('.smart-select');
						if (smartSelect) {
							smartSelect.setValue([]);
						}
						$$('#total_performa').html(number_format(0));
						$$('.performa_group_field').empty();

						$$('#penjualan_performa_get').html("");
					} else if (data.status == 'warning') {
						backToSales();
						app.dialog.alert('Total Qty Penjualan Tidak Sama dengan Total Qty Performa');
					}

				},
				error: function (xmlhttprequest, textstatus, message) {
					app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
					backToSales();
					getPenjualanHeader(1);

				}
			});
		}

	}

}


function penjualanNonProcess() {
	if (!$$('#penjualan_non_performa_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Penjualan Anda');
	} else {
		var formData = new FormData(jQuery("#penjualan_non_performa_form")[0]);
		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/penjualan-input-non-performa",
			dataType: "JSON",
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: function () {
				app.dialog.preloader('Proses');
			},
			success: function (data) {
				$$('.non-performa-input').val('');
				$$('#total_performa').html(number_format(0));
				$$('.performa_group_field').empty();
				app.dialog.close();
				if (data.status == 'done') {
					app.dialog.alert('Berhasil Input penjualan');
				} else if (data.status == 'failed') {
					app.dialog.alert('Gagal Input Penjualan');
				}
			}
		});
	}
}



function getPerforma() {
	var performa_data = '';

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-performa",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("karyawan_id_performa"),
			performa_header_id: $$('#performa').val()
		},
		beforeSend: function () {
			$$('#performa_data').html("");
		},
		success: function (data) {

			if (data.data.length != 0) {
				// Ambil data ongkir dan lokasi dari data pertama
				if (data.data.length > 0) {
					var firstData = data.data[0];
					
					// Auto-select provinsi dan kota
					id_provinsi_single = firstData.id_provinsi;
					id_kota_single = firstData.id_kota;
					
					console.log('Auto-select Provinsi ID (Single):', id_provinsi_single);
					console.log('Auto-select Kota ID (Single):', id_kota_single);
					
					// Load provinsi dengan auto-select
					selectBoxProvinsiSingle(id_provinsi_single);
					
					// Set ongkir
					var statusOngkir = firstData.status_ongkir || 'pending';
					var biayaKirim = parseFloat(firstData.biaya_kirim) || 0;
					
					console.log('Status Ongkir (Single):', statusOngkir, 'Biaya Kirim:', biayaKirim);
					
					// Set biaya kirim value (formatted)
					$$('#biaya_kirim_single').val(number_format(biayaKirim));
					
					// Set hidden field untuk status_ongkir
					$$('#status_ongkir').val(statusOngkir);
					
					// Set label status dengan warna menggunakan helper function
					var ongkirLabel = getOngkirStatusLabel(statusOngkir);
					$$('#label_status_ongkir_single').html('<span style="color:' + ongkirLabel.color + ';">' + ongkirLabel.text + '</span>');
				}
				
				jQuery.each(data.data, function (i, val) {
					var no = i + 1;
					performa_data += '<table border="1">';
					performa_data += '<tbody>';
					performa_data += ' <tr>';
					performa_data += '  <td colspan="2" class="label-cell text-align-center">';
					performa_data += '   <h3>Performa #' + no + '</h3>';
					performa_data += ' </td>';
					performa_data += '</tr>';
					performa_data += '<tr class="bg-dark-gray-medium">';
					performa_data += '  <td class="label-cell text-align-center" width="50%">Gambar</td>';
					performa_data += ' <td class="label-cell text-align-center" width="50%">';
					performa_data += '  Spesifikasi';
					performa_data += ' </td>';
					performa_data += ' </tr>';
					performa_data += ' <tr>';
					performa_data += '   <td class="label-cell text-align-center"><img src="' + BASE_PATH_IMAGE_PERFORMA + '/' + val.gambar + '" width="100%"> </td>';
					performa_data += '   <td class="label-cell text-align-center" style="white-space: pre;">';
					performa_data += '   ' + val.spesifikasi + '';
					performa_data += '  </td>';
					performa_data += '</tr>';
					performa_data += ' <tr class="bg-dark-gray-medium">';
					performa_data += '  <td class="label-cell text-align-center">Qty</td>';
					performa_data += '  <td class="label-cell text-align-center">Price</td>';
					performa_data += ' </tr>';
					performa_data += ' <tr>';
					performa_data += '  <td class="label-cell text-align-center">' + val.qty + '</td>';
					performa_data += '  <td class="label-cell text-align-center">' + number_format(val.price) + '</td>';
					performa_data += '</tr>';
					performa_data += ' <tr class="bg-dark-gray-medium">';
					performa_data += '   <td colspan="2" class="label-cell text-align-center">Total</td>';
					performa_data += ' </tr>';
					performa_data += ' <tr>';
					performa_data += '  <td colspan="2" class="label-cell text-align-center">' + number_format(val.price * val.qty) + '</td>';
					performa_data += ' </tr>';
					performa_data += '</tbody>';
					performa_data += '</table><br>';
				});
				app.dialog.alert('Data Performa Di Temukan');
				$$('#penjualan_save').show();
			} else {
				app.dialog.alert('Data Dengan Kode Performa Ini Tidak Ada');

				$$('#penjualan_save').hide();
			}


			$$('#performa_data').html(performa_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function selectBoxProvinsiMultiple(selected_id = null) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-provinsi-penjualan",
		dataType: "JSON",
		data: {
			user_id: localStorage.getItem("karyawan_id_performa")
		},
		beforeSend: function () {
		},
		success: function (data) {
			var select_box_provinsi = '';
			console.log('Selected Provinsi ID:', selected_id);
			select_box_provinsi += '<option value="">-- Provinsi --</option>';
			
			var provinsiFound = false;
			jQuery.each(data.data, function (i, val) {
				if (selected_id && selected_id == val.id_provinsi) {
					console.log('Matching Provinsi:', val.nama_provinsi);
					select_box_provinsi += '<option value="' + val.id_provinsi + '" selected>' + val.nama_provinsi + '</option>';
					provinsiFound = true;
					
					// Set display text
					$$('.item_after_provinsi_multiple').html(val.nama_provinsi);
					$$('#provinsi_multiple').val(val.id_provinsi);
				} else {
					select_box_provinsi += '<option value="' + val.id_provinsi + '">' + val.nama_provinsi + '</option>';
				}
			});
			
			$$('#provinsi_multiple').html(select_box_provinsi);
			
			// Jika provinsi ditemukan dan ada id_kota_multiple, load kota
			if (provinsiFound && id_kota_multiple) {
				console.log('Triggering selectBoxKotaMultiple with:', id_kota_multiple);
				setTimeout(function() {
					selectBoxKotaMultiple(id_kota_multiple);
				}, 300);
			} else if (selected_id) {
				// Jika provinsi terselect tapi tidak ada id_kota_multiple, tetap load kota
				setTimeout(function() {
					selectBoxKotaMultiple();
				}, 300);
			}
			
			// Set default text jika tidak ada yang selected
			if (!provinsiFound) {
				$$('.item_after_provinsi_multiple').html('PROVINSI');
			}
		}
	});
}

function selectBoxKotaMultiple(selected_id = null) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-kota-penjualan",
		dataType: "JSON",
		data: {
			user_id: localStorage.getItem("karyawan_id_performa"),
			id_provinsi: $$("#provinsi_multiple").val()
		},
		beforeSend: function () {
			$$('.item_title_kota_multiple').hide();
		},
		success: function (data) {
			var select_box_kota = '';
			console.log('Selected Kota ID:', selected_id);
			select_box_kota += '<option value="">-- Kota --</option>';
			
			var kotaFound = false;
			jQuery.each(data.data, function (i, val) {
				if (selected_id && selected_id == val.id_kota) {
					console.log('Matching Kota:', val.nama_kota);
					select_box_kota += '<option value="' + val.id_kota + '" selected>' + val.nama_kota + '</option>';
					kotaFound = true;
					
					// Set display text
					$$('.item_after_kota_multiple').html(val.nama_kota);
					$$('#kota_multiple').val(val.id_kota);
				} else {
					select_box_kota += '<option value="' + val.id_kota + '">' + val.nama_kota + '</option>';
				}
			});
			
			$$('#kota_multiple').html(select_box_kota);
			
			// Set default text jika tidak ada yang selected
			if (!kotaFound) {
				$$('.item_after_kota_multiple').html('KOTA');
			}
		}
	});
}


function selectBoxProvinsiSingle(selected_id = null) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-provinsi-penjualan",
		dataType: "JSON",
		data: {
			user_id: localStorage.getItem("karyawan_id_performa")
		},
		beforeSend: function () {
		},
		success: function (data) {
			var select_box_provinsi = '';
			console.log('Selected Provinsi ID (Single):', selected_id);
			select_box_provinsi += '<option value="">-- Provinsi --</option>';
			
			var provinsiFound = false;
			jQuery.each(data.data, function (i, val) {
				if (selected_id && selected_id == val.id_provinsi) {
					console.log('Matching Provinsi (Single):', val.nama_provinsi);
					select_box_provinsi += '<option value="' + val.id_provinsi + '" selected>' + val.nama_provinsi + '</option>';
					provinsiFound = true;
					
					// Set display text
					$$('.item_after_provinsi_single').html(val.nama_provinsi);
					$$('#provinsi_single').val(val.id_provinsi);
				} else {
					select_box_provinsi += '<option value="' + val.id_provinsi + '">' + val.nama_provinsi + '</option>';
				}
			});
			
			$$('#provinsi_single').html(select_box_provinsi);
			
			// Jika provinsi ditemukan dan ada id_kota_single, load kota
			if (provinsiFound && id_kota_single) {
				console.log('Triggering selectBoxKotaSingle with:', id_kota_single);
				setTimeout(function() {
					selectBoxKotaSingle(id_kota_single);
				}, 300);
			} else if (selected_id) {
				// Jika provinsi terselect tapi tidak ada id_kota_single, tetap load kota
				setTimeout(function() {
					selectBoxKotaSingle();
				}, 300);
			}
			
			// Set default text jika tidak ada yang selected
			if (!provinsiFound) {
				$$('.item_after_provinsi_single').html('PROVINSI');
			}
		}
	});
}

function selectBoxKotaSingle(selected_id = null) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-kota-penjualan",
		dataType: "JSON",
		data: {
			user_id: localStorage.getItem("karyawan_id_performa"),
			id_provinsi: $$("#provinsi_single").val()
		},
		beforeSend: function () {
			$$('.item_title_kota_single').hide();
		},
		success: function (data) {
			var select_box_kota = '';
			console.log('Selected Kota ID (Single):', selected_id);
			select_box_kota += '<option value="">-- Kota --</option>';
			
			var kotaFound = false;
			jQuery.each(data.data, function (i, val) {
				if (selected_id && selected_id == val.id_kota) {
					console.log('Matching Kota (Single):', val.nama_kota);
					select_box_kota += '<option value="' + val.id_kota + '" selected>' + val.nama_kota + '</option>';
					kotaFound = true;
					
					// Set display text
					$$('.item_after_kota_single').html(val.nama_kota);
					$$('#kota_single').val(val.id_kota);
				} else {
					select_box_kota += '<option value="' + val.id_kota + '">' + val.nama_kota + '</option>';
				}
			});
			
			$$('#kota_single').html(select_box_kota);
			
			// Set default text jika tidak ada yang selected
			if (!kotaFound) {
				$$('.item_after_kota_single').html('KOTA');
			}
		}
	});
}

function validateBudgetOngkir() {
	// FUNGSI INI TIDAK DIPERLUKAN LAGI
	// Karena semua field ongkir sudah auto-fill dengan nilai penuh dan readonly
	// Tidak ada lagi validasi "total harus = budget"
	
	var budgetTotal = parseFloat($$('#budget_ongkir_total').val()) || 0;
	
	// Hitung total ongkir dari semua sales section
	var totalOngkir = 0;
	$$('.biaya_kirim_multiple_number').each(function() {
		var value = $$(this).val().replace(/,/g, '');
		totalOngkir += parseFloat(value) || 0;
	});
	
	var sisaBudget = budgetTotal - totalOngkir;
	
	// Update tampilan sisa (untuk informasi saja)
	$$('#sisa_budget_ongkir').html(number_format(Math.abs(sisaBudget)));
	$$('#sisa_budget_ongkir').css('color', '#34c759'); // Hijau
	
	return true; // Selalu valid karena auto-fill
}