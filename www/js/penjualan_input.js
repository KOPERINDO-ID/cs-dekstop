jQuery('#nilai_penjualan').mask('000.000.000', { reverse: false });
jQuery('.input-item-price').mask('000,000,000,000', { reverse: true });
jQuery('.input-item-pembayaran').mask('000,000,000,000', { reverse: true });
jQuery('.input-item-invest-molding').mask('000,000,000,000', { reverse: true });
jQuery('#pembayaran_dp_akhir').mask('000,000,000,000', { reverse: true });



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
		//var count_kode_content = 1;
		//console.log(count_tanggal_pengiriman-1);
		//	var fix_count_tanggal_pengiriman = count_tanggal_pengiriman-1;
		//	$$('.kode_content_'+count_tanggal_pengiriman+'').each(function(){
		//		$$(this).attr("name",'kode_content_'+fix_count_tanggal_pengiriman+'_'+count_kode_content);
		//		$$(this).attr("id",'kode_content_'+fix_count_tanggal_pengiriman+'_'+count_kode_content);
		//		$$(this).addClass('kode_content_'+fix_count_tanggal_pengiriman+'');
		//		$$(this).removeClass('kode_content_'+count_tanggal_pengiriman+'');			
		//		count_kode_content++;
		//	});
	});



	var count_kode_kota = 1;
	$$('.input-item-kode-kota').each(function () {
		$$(this).attr("name", 'kode_kota_' + count_kode_kota);
		$$(this).attr("id", 'kode_kota_' + count_kode_kota);
		count_kode_kota++;
	});

	var count_no_spk = 1;
	$$('.input-item-no-spk').each(function () {
		$$(this).attr("name", 'no_spk_' + count_no_spk);
		$$(this).attr("id", 'no_spk_' + count_no_spk);
		count_no_spk++;
	});

	var count_jenis = 1;
	$$('.input-item-jenis').each(function () {
		$$(this).attr("name", 'jenis_' + count_jenis);
		$$(this).attr("id", 'jenis_' + count_jenis);
		count_jenis++;
	});


	var count_qty = 1;
	$$('.input-item-qty').each(function () {
		$$(this).attr("name", 'qty_' + count_qty);
		$$(this).attr("id", 'qty_' + count_qty);
		$$(this).attr("onchange", 'changeTotalValue(' + count_qty + ');');
		count_qty++;
	});

	var count_price = 1;
	$$('.input-item-price').each(function () {
		$$(this).attr("name", 'price_' + count_price);
		$$(this).attr("id", 'price_' + count_price);
		$$(this).attr("onchange", 'changeTotalValue(' + count_price + ');');
		count_price++;
	});

	var count_total = 1;
	$$('.input-item-total').each(function () {
		$$(this).attr("name", 'total_' + count_total);
		$$(this).attr("id", 'total_' + count_total);
		count_total++;
	});

	var count_pembayaran = 1;
	$$('.input-item-pembayaran').each(function () {
		$$(this).attr("name", 'pembayaran_' + count_pembayaran);
		$$(this).attr("id", 'pembayaran_' + count_pembayaran);
		count_pembayaran++;
	});



}
//Multiple



function deleteKodePerformaPenjualan(section, urutan) {

	var count_kode_content = 0;
	$$('.kode_content_' + section + '').each(function () {
		count_kode_content++;
	});


	$$('#count_kode_' + section + '').val(count_kode_content - 1);

	$$('.urutan_li_' + section + '_' + urutan + '').remove();


	//$$('.qty_1').off('change');
	var qty_total = 1;

	$$('.qty_' + section + '').each(function () {
		$$(this).attr("name", 'qty_' + section + '_' + qty_total);
		$$(this).attr("id", 'qty_' + section + '_' + qty_total);
		$$(this).attr("onchange", 'checkPrice(value,\'' + section + '\',\'' + qty_total + '\');');
		qty_total++;
	});

	var penjualan_total = 1;
	$$('.sub_harga_' + section + '').each(function () {
		$$(this).attr("name", 'sub_harga_' + section + '_' + penjualan_total);
		$$(this).attr("id", 'sub_harga_' + section + '_' + penjualan_total);
		penjualan_total++;
	});

	var kode = 1;
	$$('.kode_content_' + section + '').each(function () {
		$$(this).attr("name", 'kode_content_' + section + '_' + kode);
		$$(this).attr("id", 'kode_content_' + section + '_' + kode);
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
	html_performa_group_field += ' <label style="margin-top:-9px; height:17px;"><b>Biaya Kirim<span style="color:red;font-size:12px;"> *Optional</span></b></label>';
	html_performa_group_field += '   <div class="item-input-wrap">';
	html_performa_group_field += '    <input value="0" id="biaya_kirim_multiple_' + ($('.performa_group_field_count').length + 1) + '"  class="performa-input textbox-n input-item-biaya-kirim-multiple biaya_kirim_multiple_number" type="text"  name="biaya_kirim_multiple_' + ($('.performa_group_field_count').length + 1) + '"> ';
	html_performa_group_field += '   <span class="input-clear-button"></span>';
	html_performa_group_field += '  </div>';
	html_performa_group_field += '  </div>';
	html_performa_group_field += ' </li>';
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
			if (localStorage.getItem("username") != 'Stn') {
				$$('#bank option[value="Tunai"]').remove();
				$$('#bank_1 option[value="Tunai"]').remove();
			}
			app.dialog.close();
			console.log(data.data.length);
			if (data.data.length != 0) {
				var penjualan_total = 0;
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
						selectBoxProvinsiSingle();
						var kode_header_image = val.jenis;
					} else {
						selectBoxProvinsiMultiple();
						var kode_header_image = val.performa_id;
					}



					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
					} else {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
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
					smartSelect.setValue([])
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
					app.dialog.close();
					if (data.status == 'done') {
						backToSales();
						$$('.performa-input').val('');
						var smartSelect = app.smartSelect.get('.smart-select');
						smartSelect.setValue([])
						$$('#total_performa').html(number_format(0));
						$$('.performa_group_field').empty();

						$$('#penjualan_performa_get').html("");
					} else if (data.status == 'failed') {
						backToSales();
						$$('.performa-input').val('');
						var smartSelect = app.smartSelect.get('.smart-select');
						smartSelect.setValue([])
						$$('#total_performa').html(number_format(0));
						$$('.performa_group_field').empty();

						$$('#penjualan_performa_get').html("");
						backToSales();
					} else if (data.status == 'full') {
						$$('.performa-input').val('');
						var smartSelect = app.smartSelect.get('.smart-select');
						smartSelect.setValue([])
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


function selectBoxProvinsiMultiple() {
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
			var select_box_kota;
			select_box_kota += '<option value="" selected>-- Provinsi --</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.id_provinsi + '">' + val.nama_provinsi + '</option>';
			});
			$$('#provinsi_multiple').html(select_box_kota);
		}
	});

	$$('.item_after_provinsi_multiple').html('PROVINSI');
}

function selectBoxKotaMultiple() {
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
			var select_box_kota;
			select_box_kota += '<option value="" selected>-- Kota --</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.id_kota + '">' + val.nama_kota + '</option>';
			});
			$$('#kota_multiple').html(select_box_kota);
		}
	});

	$$('.item_after_kota_multiple').html('KOTA');
}


function selectBoxProvinsiSingle() {
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
			var select_box_kota;
			select_box_kota += '<option value="" selected>-- Provinsi --</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.id_provinsi + '">' + val.nama_provinsi + '</option>';
			});
			$$('#provinsi_single').html(select_box_kota);
		}
	});

	$$('.item_after_provinsi_single').html('PROVINSI');
}

function selectBoxKotaSingle() {
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
			var select_box_kota;
			select_box_kota += '<option value="" selected>-- Kota --</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.id_kota + '">' + val.nama_kota + '</option>';
			});
			$$('#kota_single').html(select_box_kota);
		}
	});

	$$('.item_after_kota_single').html('KOTA');
}