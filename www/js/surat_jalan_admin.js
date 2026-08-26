function changeZero() {
	var s = 'SJ_0009204';
	s = s.replace(/^SJ_0+/, '');
	console.log(s);
}

function zeroPad(num) {
	return num.toString().padStart(6, "0");
}

var delayTimer;
function doSearchByPerusahaanSuratJalan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getPenjualanSjAdmin(1);
	}, 1000);
}

function filterBulanSjAdmin() {
	getPenjualanSjAdmin();
}

function arsipSjAdmin() {
	if (localStorage.getItem('arsip_sj_admin') == 'aktif') {
		$$('#arsipBtnSjAdmin').css('color', 'white');
		localStorage.removeItem('arsip_sj_admin');
	} else {
		$$('#arsipBtnSjAdmin').css('color', 'red');
		localStorage.setItem('arsip_sj_admin', 'aktif');
	}
	getPenjualanSjAdmin();
}

function resetGetSuratJalanCs() {
	jQuery('#perusahaan_penjualan_filter_admin').val('');
	window._selectedSjAdminIds = {};
	toggleFloatingDownloadSjAdmin();
	getPenjualanSjAdmin();
}

function getPenjualanSjAdmin(page) {
	if (page == '' || page == null) {
		var page_now = 1;
	} else {
		var page_now = page;
	}

	if (jQuery('#perusahaan_penjualan_filter_admin').val() == '' || jQuery('#perusahaan_penjualan_filter_admin').val() == null) {
		var perusahaan_value = "empty";
	} else {
		var perusahaan_value = jQuery('#perusahaan_penjualan_filter_admin').val();
	}

	var year_now = new Date().getFullYear();
	if (jQuery('#summary_years_sj_admin').val() == '') {
		var year = year_now;
	} else {
		var year = jQuery('#summary_years_sj_admin').val();
	}

	var month_now = new Date().getMonth() + 1;
	if (jQuery('#summary_bulan_sj_admin').val() == '') {
		var month = month_now;
	} else {
		var month = jQuery('#summary_bulan_sj_admin').val();
	}

	var penjualan_value = "";

	var arsip_sj = (localStorage.getItem('arsip_sj_admin') == 'aktif') ? 'aktif' : 'empty';

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-penjualan-header-cs?page=" + page_now + "",
		dataType: 'JSON',
		data: {
			karyawan_id: 'empty',
			startdate: 'empty',
			enddate: 'empty',
			month: month,
			year: year,
			perusahaan_penjualan_value: perusahaan_value,
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
			version_app: localStorage.getItem("versioon_app_now"),
			arsip: arsip_sj
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();

			$.each(data.data.data, function (i, item) {
				var total_pembayaran_validated = 0;
				for (var p = 1; p <= 10; p++) {
					if (item['valid_cs_' + p] == 1 && item['pembayaran_' + p] != null) {
						total_pembayaran_validated += parseFloat(item['pembayaran_' + p]);
					}
				}

				var sisa = item.penjualan_grandtotal - total_pembayaran_validated;
				var sisa_fix = number_format(parseFloat(sisa));
				if (sisa <= 0) {
					sisa_fix = sisa_fix.toString().replace(/\-/g, '+');
				}

				var color_class = (sisa <= 0) ? "card-color-blue" : "card-blank";

				var tipe_grosir = (item.extra == '1') ? "Xtra" : "Polo";
				var style_xtra = (item.extra == '1') ? '' : 'red';
				var pabrik = (item.lokasi_pabrik != null && item.lokasi_pabrik != 'Pusat') ? 'Jakarta' : 'Surabaya';
				// Cache untuk invoice gabungan
				if (!window._penjualanItemCache) window._penjualanItemCache = {};
				window._penjualanItemCache[item.penjualan_id] = {
					client_nama: item.client_nama,
					nama_kota: item.nama_kota || '',
					dt_record: item.dt_record,
					extra: item.extra,
					jenis_penjualan: item.jenis_penjualan,
					penjualan_grandtotal: item.penjualan_grandtotal,
					sisa: sisa,
					packing: item.packing || ''
				};

				var invoice_no = moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

				var sisa_kirim_sj = 0;
				if (data.surat_jalan_count && data.surat_jalan_count[item.penjualan_id] != null) {
					if (item.penjualan_total_qty_detail == 0) {
						sisa_kirim_sj = parseFloat(item.penjualan_total_qty) - parseFloat(data.surat_jalan_count[item.penjualan_id]);
					} else {
						sisa_kirim_sj = parseFloat(item.penjualan_total_qty_detail) - parseFloat(data.surat_jalan_count[item.penjualan_id]);
					}
				}

				var table_color = "";
				if (item.tgl_cs_deadline != null) {
					table_color = "card-color-red";
				} else {
					var firstDate = new Date(moment().format('YYYY, MM, DD'));
					var secondDate = new Date(moment(item.penjualan_tanggal_kirim).format('YYYY-MM-DD'));
					var diffDays = Math.round(Math.abs((firstDate - secondDate) / (24 * 60 * 60 * 1000)));
					if (firstDate >= secondDate) {
						table_color = (sisa_kirim_sj <= 0) ? "card-color-blue" : "card-color-red";
					} else if (diffDays >= 3 && diffDays <= 5) {
						table_color = (sisa_kirim_sj <= 0) ? "card-color-blue" : "card-color-orange";
					} else if (diffDays >= 0 && diffDays <= 2) {
						table_color = (sisa_kirim_sj <= 0) ? "card-color-blue" : "card-color-red";
					}
				}

				var spk_bg = (sisa_kirim_sj <= 0) ? 'background-color:#000080;' : '';

				// warna button bayar
				var color_btn_byr;
				if (total_pembayaran_validated == 0) {
					color_btn_byr = "card-color-yellow-text-white";
				} else if (sisa <= 0) {
					var hasPending = (data.log_pembayaran && data.log_pembayaran[item.penjualan_id] && data.log_pembayaran[item.penjualan_id].length > 0);
					color_btn_byr = hasPending ? "btn-color-greenWhite" : "btn-color-blueWhite";
				} else if (sisa > 0 && item.pembayaran1_tgl != null) {
					color_btn_byr = "btn-color-greenWhite";
				} else if (data.log_pembayaran_rejected && data.log_pembayaran_rejected[item.penjualan_id] && data.log_pembayaran_rejected[item.penjualan_id].length > 0) {
					color_btn_byr = "btn-color-redWhite";
				} else {
					color_btn_byr = "bg-dark-gray-young text-add-colour-black-soft";
				}

				// warna button s.jalan
				var color_btn_sj;
				if (sisa_kirim_sj <= 0) {
					color_btn_sj = "btn-color-blueWhite";
				} else if (item.penjualan_total_kirim == null) {
					color_btn_sj = "bg-dark-gray-young text-add-colour-black-soft";
				} else {
					color_btn_sj = "btn-color-greenWhite";
				}

				var has_sjc = data.surat_jalan_customer && data.surat_jalan_customer[item.penjualan_id] && data.surat_jalan_customer[item.penjualan_id].length > 0;
				var popup_sj = (item.penjualan_total_qty_detail > 0) ? "popup-open" : "";

				var tampil = (arsip_sj === 'aktif')
					? (sisa_kirim_sj <= 0 && sisa <= 0)
					: (sisa_kirim_sj > 0 || sisa > 0);
				if (!tampil) return;

				penjualan_value += '<tr style="border-bottom:1px solid gray;">';
				penjualan_value += '<td class="' + table_color + '" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;">' + moment(item.penjualan_tanggal_kirim).format('DD-MMM') + '</td>';
				penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px; ' + spk_bg + '"><center><b>' + invoice_no + '</b></center></td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;">' + item.client_nama + '</td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;">' + item.client_telp + '</td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px; color:' + style_xtra + ';" class="' + color_class + '">' + tipe_grosir + '</td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="' + color_class + '">' + item.karyawan_nama + '</td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="' + color_class + '">' + pabrik + '</td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="' + color_class + '">' + item.nama_kota + '</td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="' + color_class + '">' + item.type_penjualan + '</td>';
				penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="' + color_class + '">' + number_format(parseInt(item.penjualan_grandtotal)) + '</td>';
				penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="' + color_class + '">' + number_format(total_pembayaran_validated) + '</td>';
				penjualan_value += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="' + color_class + '">' + sisa_fix + '</td>';

				// SPK Po button
				penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="label-cell">';
				penjualan_value += '  <button class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-spkpo-popup" onclick="spkPo(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\');">Spk Po</button>';
				penjualan_value += '</td>';

				// Bayar button
				penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="label-cell">';
				penjualan_value += '  <button class="' + color_btn_byr + ' button-small col button popup-open text-bold" data-popup=".detail-pembayaran" onclick="detailPembayaran(\'' + item.dt_record + '\',\'' + item.penjualan_tanggal + '\',\'' + item.performa_id_relation + '\',\'' + item.bank_1_id + '\',\'' + item.bank_2_id + '\',\'' + item.bank_3_id + '\',\'' + item.bank_4_id + '\',\'' + item.bank_5_id + '\',\'' + item.bank_6_id + '\',\'' + item.bank_7_id + '\',\'' + item.bank_8_id + '\',\'' + item.bank_9_id + '\',\'' + item.bank_10_id + '\',\'' + item.pembayaran1_tgl + '\',\'' + item.pembayaran2_tgl + '\',\'' + item.pembayaran3_tgl + '\',\'' + item.pembayaran4_tgl + '\',\'' + item.pembayaran5_tgl + '\',\'' + item.pembayaran6_tgl + '\',\'' + item.pembayaran7_tgl + '\',\'' + item.pembayaran8_tgl + '\',\'' + item.pembayaran9_tgl + '\',\'' + item.pembayaran10_tgl + '\',\'' + item.bank + '\',\'' + item.pembayaran_1 + '\',\'' + item.pembayaran_2 + '\',\'' + item.pembayaran_3 + '\',\'' + item.pembayaran_4 + '\',\'' + item.pembayaran_5 + '\',\'' + item.pembayaran_6 + '\',\'' + item.pembayaran_7 + '\',\'' + item.pembayaran_8 + '\',\'' + item.pembayaran_9 + '\',\'' + item.pembayaran_10 + '\',\'' + item.client_nama + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_total_qty + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.client_id + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.ongkir + '\',\'' + item.karyawan_id + '\');">Bayar</button>';
				penjualan_value += '</td>';

				// S.Jalan button
				penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;" class="label-cell">';
				if (has_sjc) {
					penjualan_value += '  <button class="btn-color-greenWhite button-small col button popup-open text-bold" data-popup=".produksi-sjc-foto-cabang" onclick="getSuratJalanListCustomer(\'' + item.penjualan_id + '\');">S.Jalan</button>';
				} else {
					penjualan_value += '  <button class="' + color_btn_sj + ' button-small col button ' + popup_sj + ' text-bold popup-open" data-popup=".surat-jalan-penjualan" onclick="getSuratJalanDetailPenjualan(\'' + item.dt_record + '\',\'' + item.client_nama + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_total_qty + '\');">S.Jalan</button>';
				}
				penjualan_value += '</td>';

				// Checkbox pilih
				var _isChecked = (window._selectedSjAdminIds && window._selectedSjAdminIds[item.penjualan_id]) ? 'checked' : '';
				penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; padding:7px 4px;">';
				penjualan_value += '  <input type="checkbox" class="cb-download-sj-admin" data-id="' + item.penjualan_id + '" style="width:18px; height:18px; cursor:pointer;" ' + _isChecked + ' onchange="toggleSjAdminSelection(this);">';
				penjualan_value += '</td>';
				penjualan_value += '</tr>';
			});

			jQuery('#penjualan_value_sj_admin').html(penjualan_value);
		},
		error: function (xmlhttprequest, textstatus, message) {
			app.dialog.close();
		}
	});
}

function getSuratJalanCs() {

	var penjualan_value = "";

	if (jQuery('#perusahaan_penjualan_filter_admin').val() == '' || jQuery('#perusahaan_penjualan_filter_admin').val() == null) {
		perusahaan_penjualan_value = "empty";
		$$("#btnInvoiceDownload").hide();
	} else {
		perusahaan_penjualan_value = jQuery('#perusahaan_penjualan_filter_admin').val();
		$$("#btnInvoiceDownload").show();
	}

	var year_now = new Date().getFullYear();
	if (jQuery('#summary_years_sj_admin').val() == '') {
		var year = year_now;
	} else {
		var year = jQuery('#summary_years_sj_admin').val();
	}
	var month_now = new Date().getMonth() + 1;
	if (jQuery('#summary_bulan_sj_admin').val() == '') {
		var month = month_now;
	} else {
		var month = jQuery('#summary_bulan_sj_admin').val();
	}

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-surat-jalan-cs",
		dataType: 'JSON',
		data: {
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik"),
			perusahaan_penjualan_value: perusahaan_penjualan_value,
			month: month,
			year: year,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			no = 1;
			var no_row = 0;

			if (perusahaan_penjualan_value != "empty") {
				var arr = data.no_sj;
				arr.reverse();
				var sisa = 0;
				$.each(arr, function (i, item) {
					no_row++

					sisa = (data.data[item].penjualan_grandtotal) - data.data[item].penjualan_jumlah_pembayaran;

					if (sisa > 0 && data.data[item].status_cetak_invoice == 1) {
						penjualan_value += '<tr class="card-color-light-blue">';
						penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + moment(data.data[item].tanggal).format('DD-MMM-YY') + '</center></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + data.data[item].no_surat_jalan + '</td>';
						penjualan_value += '	<td style="border-bottom:1px solid gray;"><center>' + moment(data.data[item].dt_record).format('DDMMYY') + '-' + data.data[item].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + data.data[item].client_nama + '</td>';

						var no_transaksi = moment(data.data[item].dt_record).format('DDMMYY') + '-' + data.data[item].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

						penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   		<button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan-notif-admin" onclick="getSuratJalanDetailAdmin(\'' + data.data[item].no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + data.data[item].client_nama + '\',\'' + data.data[item].penjualan_id + '\');">Detail</button>';
						penjualan_value += '	</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center">';
						penjualan_value += '	</td>';
						penjualan_value += '</tr>';
					} else if (sisa > 0 && data.data[item].status_cetak_invoice == 0) {
						penjualan_value += '<tr>';
						penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + moment(data.data[item].tanggal).format('DD-MMM-YY') + '</center></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + data.data[item].no_surat_jalan + '</td>';
						penjualan_value += '	<td style="border-bottom:1px solid gray;"><center>' + moment(data.data[item].dt_record).format('DDMMYY') + '-' + data.data[item].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + data.data[item].client_nama + '</td>';

						var no_transaksi = moment(data.data[item].dt_record).format('DDMMYY') + '-' + data.data[item].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

						penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   		<button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan-notif-admin" onclick="getSuratJalanDetailAdmin(\'' + data.data[item].no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + data.data[item].client_nama + '\',\'' + data.data[item].penjualan_id + '\');">Detail</button>';
						penjualan_value += '	</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center">';
						penjualan_value += '		<input type="hidden"  name="check_no_surat_jalan_' + no_row + '" value="0" >';
						penjualan_value += '		<input style="width: 100%;" type="hidden" id="penjualan_id_check_no_surat_jalan_' + no_row + '" name="penjualan_id_check_no_surat_jalan_' + no_row + '"  value = "' + data.data[item].penjualan_id + '" readonly></input>';
						penjualan_value += '		<input style="width: 100%;" type="hidden" id="client_id_check_no_surat_jalan_' + no_row + '" name="client_id_check_no_surat_jalan_' + no_row + '"  value = "' + data.data[item].client_id + '" readonly></input>';
						penjualan_value += '		<input type="checkbox" value="1" id="check_no_surat_jalan_' + no_row + '" name="c" class="checked_all pilih_no_surat_jalan">';
						penjualan_value += '		<input value="' + data.data[item].no_surat_jalan + '" type="hidden" id="client_check_no_surat_jalan_' + no_row + '" name="client_check_no_surat_jalan_' + no_row + '"';
						penjualan_value += '	</td>';
						penjualan_value += '</tr>';
					} else if (sisa <= 0 && data.data[item].status_cetak_invoice == 1) {
						penjualan_value += '<tr class="card-color-blue">';
						penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + moment(data.data[item].tanggal).format('DD-MMM-YY') + '</center></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + data.data[item].no_surat_jalan + '</td>';
						penjualan_value += '	<td style="border-bottom:1px solid gray;"><center>' + moment(data.data[item].dt_record).format('DDMMYY') + '-' + data.data[item].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + data.data[item].client_nama + '</td>';

						var no_transaksi = moment(data.data[item].dt_record).format('DDMMYY') + '-' + data.data[item].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

						penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   		<button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan-notif-admin" onclick="getSuratJalanDetailAdmin(\'' + data.data[item].no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + data.data[item].client_nama + '\',\'' + data.data[item].penjualan_id + '\');">Detail</button>';
						penjualan_value += '	</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center">';
						penjualan_value += '	</td>';
						penjualan_value += '</tr>';
					} else if (sisa <= 0 && data.data[item].status_cetak_invoice == 0) {
						penjualan_value += '<tr class="card-color-blue">';
						penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + moment(data.data[item].tanggal).format('DD-MMM-YY') + '</center></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + data.data[item].no_surat_jalan + '</td>';
						penjualan_value += '	<td style="border-bottom:1px solid gray;"><center>' + moment(data.data[item].dt_record).format('DDMMYY') + '-' + data.data[item].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + data.data[item].client_nama + '</td>';

						var no_transaksi = moment(data.data[item].dt_record).format('DDMMYY') + '-' + data.data[item].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

						penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
						penjualan_value += '   		<button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan-notif-admin" onclick="getSuratJalanDetailAdmin(\'' + data.data[item].no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + data.data[item].client_nama + '\',\'' + data.data[item].penjualan_id + '\');">Detail</button>';
						penjualan_value += '	</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center">';
						penjualan_value += '	</td>';
						penjualan_value += '</tr>';
					}
				});
			} else {
				var firstElement = data.no_sj[0];
				var lastElement = data.no_sj[data.no_sj.length - 1];
				var last = parseFloat(lastElement) + parseFloat(1);
				var first = parseFloat(firstElement) - parseFloat(1);

				for (let i = last; i > first; i--) {
					no_row++

					if (data.data[i] != null || data.data[i] != undefined) {
						var sisa = (data.data[i].penjualan_grandtotal) - data.data[i].penjualan_jumlah_pembayaran;
						if (sisa > 0 && data.data[i].status_cetak_invoice == 1) {
							penjualan_value += '<tr class="card-color-light-blue">';
							penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
							penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + moment(data.data[i].tanggal).format('DD-MMM-YY') + '</center></td>';
							penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + data.data[i].no_surat_jalan + '</td>';
							penjualan_value += '	<td style="border-bottom:1px solid gray;"><center>' + moment(data.data[i].dt_record).format('DDMMYY') + '-' + data.data[i].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center></td>';
							penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + data.data[i].client_nama + '</td>';

							var no_transaksi = moment(data.data[i].dt_record).format('DDMMYY') + '-' + data.data[i].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

							penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							penjualan_value += '   		<button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan-notif-admin" onclick="getSuratJalanDetailAdmin(\'' + data.data[i].no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + data.data[i].client_nama + '\',\'' + data.data[i].penjualan_id + '\');">Detail</button>';
							penjualan_value += '	</td>';
							penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center">';
							penjualan_value += '	</td>';
							penjualan_value += '</tr>';
						} else if (sisa > 0 && data.data[i].status_cetak_invoice == 0) {
							penjualan_value += '<tr>';
							penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
							penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + moment(data.data[i].tanggal).format('DD-MMM-YY') + '</center></td>';
							penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + data.data[i].no_surat_jalan + '</td>';
							penjualan_value += '	<td style="border-bottom:1px solid gray;"><center>' + moment(data.data[i].dt_record).format('DDMMYY') + '-' + data.data[i].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center></td>';
							penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + data.data[i].client_nama + '</td>';

							var no_transaksi = moment(data.data[i].dt_record).format('DDMMYY') + '-' + data.data[i].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

							penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							penjualan_value += '   		<button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan-notif-admin" onclick="getSuratJalanDetailAdmin(\'' + data.data[i].no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + data.data[i].client_nama + '\',\'' + data.data[i].penjualan_id + '\');">Detail</button>';
							penjualan_value += '	</td>';
							penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center">';
							penjualan_value += '		<input type="hidden"  name="check_no_surat_jalan_' + no_row + '" value="0" >';
							penjualan_value += '		<input style="width: 100%;" type="hidden" id="penjualan_id_check_no_surat_jalan_' + no_row + '" name="penjualan_id_check_no_surat_jalan_' + no_row + '"  value = "' + data.data[i].penjualan_id + '" readonly></input>';
							penjualan_value += '		<input style="width: 100%;" type="hidden" id="client_id_check_no_surat_jalan_' + no_row + '" name="client_id_check_no_surat_jalan_' + no_row + '"  value = "' + data.data[i].client_id + '" readonly></input>';
							penjualan_value += '		<input type="checkbox" value="1" id="check_no_surat_jalan_' + no_row + '" name="c" class="checked_all pilih_no_surat_jalan">';
							penjualan_value += '		<input value="' + data.data[i].no_surat_jalan + '" type="hidden" id="client_check_no_surat_jalan_' + no_row + '" name="client_check_no_surat_jalan_' + no_row + '"';
							penjualan_value += '	</td>';
							penjualan_value += '</tr>';
						} else if (sisa <= 0 && data.data[i].status_cetak_invoice == 1) {
							penjualan_value += '<tr class="card-color-blue">';
							penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
							penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + moment(data.data[i].tanggal).format('DD-MMM-YY') + '</center></td>';
							penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + data.data[i].no_surat_jalan + '</td>';
							penjualan_value += '	<td style="border-bottom:1px solid gray;"><center>' + moment(data.data[i].dt_record).format('DDMMYY') + '-' + data.data[i].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center></td>';
							penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + data.data[i].client_nama + '</td>';

							var no_transaksi = moment(data.data[i].dt_record).format('DDMMYY') + '-' + data.data[i].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

							penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							penjualan_value += '   		<button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan-notif-admin" onclick="getSuratJalanDetailAdmin(\'' + data.data[i].no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + data.data[i].client_nama + '\',\'' + data.data[i].penjualan_id + '\');">Detail</button>';
							penjualan_value += '	</td>';
							penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center">';
							penjualan_value += '	</td>';
							penjualan_value += '</tr>';
						} else if (sisa <= 0 && data.data[i].status_cetak_invoice == 0) {
							penjualan_value += '<tr class="card-color-blue">';
							penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
							penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"><center>' + moment(data.data[i].tanggal).format('DD-MMM-YY') + '</center></td>';
							penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" >' + data.data[i].no_surat_jalan + '</td>';
							penjualan_value += '	<td style="border-bottom:1px solid gray;"><center>' + moment(data.data[i].dt_record).format('DDMMYY') + '-' + data.data[i].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</center></td>';
							penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + data.data[i].client_nama + '</td>';

							var no_transaksi = moment(data.data[i].dt_record).format('DDMMYY') + '-' + data.data[i].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

							penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
							penjualan_value += '   		<button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan-notif-admin" onclick="getSuratJalanDetailAdmin(\'' + data.data[i].no_surat_jalan + '\',\'' + no_transaksi + '\',\'' + data.data[i].client_nama + '\',\'' + data.data[i].penjualan_id + '\');">Detail</button>';
							penjualan_value += '	</td>';
							penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center">';
							penjualan_value += '	</td>';
							penjualan_value += '</tr>';
						}
					} else {
						penjualan_value += '<tr>';
						penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell card-color-red">' + no_row + '</td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom:1px solid gray;"></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell card-color-red">SJ_' + zeroPad(i) + '</td>';
						penjualan_value += '	<td style="border-bottom:1px solid gray;"></td>';
						penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" ></td>';
						penjualan_value += '	<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell"></td>';
						penjualan_value += '	<td style="border-right:1px solid gray;border-bottom: 1px solid grey;text-align:center"></td>';
						penjualan_value += '</tr>';
					}
				}
			}

			jQuery('#detail_surat_jalan_admin').html(penjualan_value);

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getSuratJalanDetailAdmin(no_surat_jalan, no_transaksi, client_nama, penjualan_id) {
	var penjualan_value = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-surat-jalan-list-cs",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
			no_surat_jalan: no_surat_jalan,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$$('#detail_surat_jalan_history_admin').html('');
		},
		success: function (data) {
			app.dialog.close();

			jQuery('#show_reset_reject_element_kirim_admin').hide();
			jQuery('#show_reject_element_kirim_admin').hide();
			jQuery('#keterangan_valid_kirim_admin').val('');
			$$("#detail_penjualan_id_notif_kirim_admin").val(no_surat_jalan);
			$$("#nomer_sj_admin").html('<h3>' + no_transaksi + ' ' + client_nama + '</h3>');
			$.each(data.data_distinct, function (i_d, item_d) {
				penjualan_value += '<tr>';
				penjualan_value += '<td  style="border-top:1px solid gray;border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;" align="center"  class="label-cell col col-border bg-dark-gray-medium">' + item_d.no_surat_jalan + '</td>';
				penjualan_value += '<td align="center" colspan="3" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell col col-border bg-dark-gray-medium">' + moment(item_d.tanggal).format('DD-MMM-YY hh:mm') + '</td>';
				if (item_d.foto_surat_jalan != null) {
					penjualan_value += '<td align="center"  style=" border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><button style="background-color: blue; color:white;" class="text-add-colour-black-soft button-small col button text-bold"  onclick="lihatFotoSuratJalanNotifAdmin(\'' + item_d.foto_surat_jalan + '\');">Foto</button></td>';
				} else {
					penjualan_value += '<td align="center"  style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"  onclick="lihatFotoSuratJalanNotifAdmin(\'' + item_d.foto_surat_jalan + '\');">Foto</button></td>';
				}
				$$("#detail_valid_notif_kirim_admin").val(item_d.valid_cs);
				penjualan_value += '</tr>';
				penjualan_value += '<tr>';
				penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Jumlah</td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Type</td>';
				penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Plat</td>';
				penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Kendaraan</td>';
				penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Pengirim</td>';

				penjualan_value += '</tr>';
				$.each(data.data, function (i, item) {
					if (item.jumlah_kirim != null && item.jumlah_kirim != 0) {
						if (item_d.tanggal == item.tanggal) {
							penjualan_value += '<tr>';
							penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.jumlah_kirim + '</td>';
							penjualan_value += '<td align="center" width="18%" style="border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.penjualan_jenis + '</td>';
							penjualan_value += '<td align="center" width="17%" style="border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.plat + '</td>';
							penjualan_value += '<td align="center" width="20%" style="border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.kendaraan + '</td>';
							penjualan_value += '<td align="center" width="15%" style="border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.pengirim + '</td>';

							penjualan_value += '</tr>';
						}
					}
				});

			});

			$$('#detail_surat_jalan_history_admin').html(penjualan_value);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function lihatFotoSuratJalanNotifAdmin(src) {
	console.log('KLIK');
	var gambar_zoom = BASE_PATH_IMAGE_SURAT_JALAN + '/' + src;
	var myPhotoBrowserPopupDark = app.photoBrowser.create({
		photos: [
			'' + gambar_zoom + ''
		],
		theme: 'dark',
		type: 'popup'
	});
	myPhotoBrowserPopupDark.open();
}

function downloadInvoiceAdmin() {
	app.dialog.confirm('Apakah ingin download invoice sekarang ?', function () {
		if (localStorage.getItem("internet_koneksi") == 'fail') {
			app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
			});
		} else {
			var count_checkbox = $('input:checkbox.pilih_no_surat_jalan:checked').length;
			var tanggal_download = $("#tanggal_invoice_download_admin").val();
			if (!$$('#input_invoice_download_admin')[0].checkValidity()) {
				app.dialog.alert('Cek Isian Anda');
			} else {
				var formData = new FormData(jQuery("#input_invoice_download_admin")[0]);
				var number_input = 0;
				var array_sj = [];
				var array_penjualan_id = [];
				$("input:checkbox.pilih_no_surat_jalan:checked").each(function () {
					number_input++;
					formData.append('no_surat_jalan_' + number_input + '', $('#client_' + $(this).attr("id")).val());
					formData.append('penjualan_id_' + number_input + '', $('#penjualan_id_' + $(this).attr("id")).val());
					formData.append('client_id_' + number_input + '', $('#client_id_' + $(this).attr("id")).val());
					array_sj.push($('#client_' + $(this).attr("id")).val());
					array_penjualan_id.push($('#penjualan_id_' + $(this).attr("id")).val());
				});

				formData.append('number_input', number_input);
				formData.append('lokasi_pabrik', localStorage.getItem("lokasi_pabrik"));
				formData.append('user_id', localStorage.getItem("user_id"));
				formData.append('karyawan_nama', localStorage.getItem("karyawan_nama"));

				jQuery.ajax({
					type: "POST",
					url: "" + BASE_API + "/download-invoice-admin",
					dataType: "JSON",
					data: formData,
					timeout: 5000,
					contentType: false,
					processData: false,
					beforeSend: function () {
						app.dialog.preloader('Harap Tunggu');
					},
					success: function (data) {
						if (data.status == 'success') {
							downloadInvoiceAdminPdf(array_sj, array_penjualan_id, tanggal_download, 0, 'table_download_invoice', parseInt($('input[name="template_invoice_admin"]:checked').val() || 1));
						} else if (data.status == 'failed') {
							app.popup.close();
							$("#tanggal_invoice_download_admin").val('');
							app.dialog.alert('Gagal Download Invoice, Silahkan Coba Kembali');
						}
					},
					error: function (xmlhttprequest, textstatus, message) {
						app.popup.close();
						$("#tanggal_invoice_download_admin").val('');
						app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
					}

				});
			}
		}
	});
}

function downloadInvoiceAdminPdf(no_surat_jalan, array_penjualan_id, tanggal_download, history, table, templateType) {
    var invoice_penjualan = '';
    if (!templateType) templateType = 1;

    if (table != 'table_download_invoice') {
        var sj = no_surat_jalan;
        var no_surat = [];
        no_surat = sj.split(",");
        var jl_id = array_penjualan_id;
        var penjualan_id = [];
        penjualan_id = jl_id.split(",");
    } else {
        var no_surat = no_surat_jalan;
        var penjualan_id = array_penjualan_id;
    }

    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-surat-jalan-pdf",
        dataType: 'JSON',
        data: {
            no_surat_jalan: no_surat,
            penjualan_id: penjualan_id,
            id_history_invoice_sj: history,
        },
        beforeSend: function () {
            app.dialog.close();
            app.dialog.preloader('Mengambil Data Surat Jalan');
        },
        success: function (data) {
            app.dialog.close();

            // Kumpulkan jenis produk unik
            var jenis_produk = [];
            jQuery.each(data.data_sj_distinct, function (i, val) {
                jenis_produk.push(val.ukuran_jual);
            });

            // Nomor Invoice
            var no_invoice = (history && history != 0)
                ? String(history).padStart(4, '0')
                : String(data.lastIDHistory).padStart(4, '0');
            var bulan_invoice = moment(tanggal_download).format('MM');
            var tahun_invoice = moment(tanggal_download).format('YY');
            var no_invoice_full = bulan_invoice + tahun_invoice + ' - ' + no_invoice;

            // Info client
            var client_nama = (data.data && data.data.length > 0) ? data.data[0].client_nama : '';
            var client_kota = (data.data && data.data.length > 0) ? data.data[0].client_kota : '';
            var client_alamat = (data.data && data.data.length > 0 && data.data[0].client_alamat) ? data.data[0].client_alamat : '';
            var tanggal_formatted = 'Sidoarjo, ' + moment(tanggal_download).format('DD MMMM YYYY');

            // Hitung lebar kolom dinamis
            var colWidthProduk = jenis_produk.length > 0 ? Math.floor(50 / jenis_produk.length) : 25;

            // ─────────────────────────────────────────────
            // TEMPLATE SELECTION
            // ─────────────────────────────────────────────
            if (templateType == 2) {
                invoice_penjualan = buildInvoiceTemplate2(data, tanggal_download, no_invoice_full, client_nama, client_kota, client_alamat);

                $('#' + table).html(invoice_penjualan);
                rotatePortraitImages('#' + table).then(function() {
                    downloadTable(tanggal_download, 'invoice-print-area');
                });
                return;
            }

            // ─────────────────────────────────────────────
            // TEMPLATE 1 - MULAI BUILD HTML INVOICE
            // ─────────────────────────────────────────────

            // Reusable KOP header
            var kopHeader = `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:0px; font-family: 'Times New Roman', Times, serif;">
    <tr>
        <td width="170" align="center" valign="middle" style="padding:5px 8px;">
            <img src="img/logo/logo-koperindo-invoice.png" width="150" height="100"
                 onerror="this.style.display='none'">
        </td>
        <td align="center" valign="middle" style="padding:5px 80px 5px 10px;">
            <div style="font-size:32px; font-weight:bold; color:#000000; letter-spacing:3px; margin-bottom:-2px;">KOPER INDONESIA</div>
            <div style="font-size:16px; color:#000000; font-weight:bold; line-height:1.1;">
                Permata blok R3 No.32 - 39, Kludan, Kec. Tanggulangin,<br>
                Kabupaten Sidoarjo, Jawa Timur 61272
            </div>
            <div style="font-size:16px; font-weight:bold;"><a href="http://www.koperindo.id" style="color:#0000FF; text-decoration:underline;">www.koperindo.id</a></div>
        </td>
    </tr>
</table>
<div style="border-top:3.5px solid #000000; margin:4px 0 4px 0;"></div>`;

            invoice_penjualan += `
<div id="invoice-print-area" style="
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 15px;
    color: #000;
    background: #fff;
    padding: 0px 5px 15px 15px;
    max-width: 780px;
    margin: 0 auto;
    line-height: 1.4;
">

<!-- ===== HEADER ===== -->
${kopHeader}

<div style="margin: 15px 20px; font-family: 'Calibri', 'Arial', sans-serif;">
<!-- ===== INFO TANGGAL & CLIENT (Calibri 11) ===== -->
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:10px; font-family: 'Calibri', 'Arial', sans-serif; font-size:15px;">
    <tr>
        <td width="100%" valign="top" style="line-height:1.4;">
            <div>Tanggal : ${tanggal_formatted}</div>
            <div>Kepada :</div>
            <div style="font-weight:bold; font-size:15px;">${client_nama}</div>`;

            if (client_alamat) {
                invoice_penjualan += `
            <div style="font-size:15px;">${client_alamat}</div>`;
            }

            invoice_penjualan += `
            <div style="font-size:15px;">${client_kota}</div>
        </td>
    </tr>
</table>

<!-- ===== NO INVOICE (pojok kanan atas tabel) ===== -->
<div style="text-align:right; margin-bottom:4px; font-family: 'Calibri', 'Arial', sans-serif; font-size:15px;">
    No. Invoice : <b>${no_invoice_full}</b>
</div>

<!-- ===== TABEL SURAT JALAN (Calibri 8.5) ===== -->
<table width="100%" border="0" cellspacing="0" cellpadding="0"
       style="border-collapse:collapse; margin-bottom:16px; font-family: 'Calibri', 'Arial', sans-serif; font-size:12.5px;">
    <thead>
        <tr>
            <td align="center" width="6%"
                style="border:1px solid #666; font-weight:bold; padding:5px 2px; font-size:12.5px; background-color:#e5e5e5;">NO</td>
            <td align="center" width="14%"
                style="border:1px solid #666; font-weight:bold; padding:5px 2px; font-size:12.5px; background-color:#e5e5e5;">TANGGAL</td>
            <td align="center" width="14%"
                style="border:1px solid #666; font-weight:bold; padding:5px 2px; font-size:12.5px; background-color:#e5e5e5;">SURAT JALAN</td>`;

            // Header kolom jenis produk
            jQuery.each(jenis_produk, function (i, val) {
                invoice_penjualan += `
            <td align="center" width="${colWidthProduk}%"
                style="border:1px solid #666; font-weight:bold; padding:5px 2px; font-size:12.5px; background-color:#e5e5e5;">
                ${val}
            </td>`;
            });

            invoice_penjualan += `
        </tr>
    </thead>
    <tbody>`;

            // Baris data
            var no = 0;
            var foto_sj = [];
            var total_ongkir = 0;

            // Hitung total per jenis
            var totals = {};
            jQuery.each(jenis_produk, function (i, val) { totals[val] = 0; });

            jQuery.each(data.data, function (i, val) {
                no++;
                var ongkir = data.data_penjualan[val.no_surat_jalan]
                    ? parseFloat(data.data_penjualan[val.no_surat_jalan].ongkir)
                    : 0;
                total_ongkir += ongkir;

                if (data.data_sj[val.no_surat_jalan] && data.data_sj[val.no_surat_jalan][0]) {
                    foto_sj.push(data.data_sj[val.no_surat_jalan][0].foto_surat_jalan);
                }

                // Cek apakah ada multi-row untuk SJ ini (beberapa jenis di SJ yang sama)
                var rowSpanCount = 1;
                if (data.data_sum[val.no_surat_jalan]) {
                    var distinctJenis = [];
                    $.each(data.data_sum[val.no_surat_jalan], function (k, val_sj) {
                        if (distinctJenis.indexOf(val_sj.ukuran_jual) === -1) {
                            distinctJenis.push(val_sj.ukuran_jual);
                        }
                    });
                }

                invoice_penjualan += `
        <tr>
            <td align="center" style="border:1px solid #666; padding:4px 2px; font-size:12.5px;">${no}</td>
            <td align="center" style="border:1px solid #666; padding:4px 2px; font-size:12.5px;">${moment(val.tanggal).format('DD.MM.YYYY')}</td>
            <td align="center" style="border:1px solid #666; padding:4px 2px; font-size:12.5px;">${val.no_surat_jalan}</td>`;

                for (var j = 0; j < jenis_produk.length; j++) {
                    var jumlah_kirim = 0;
                    if (data.data_sum[val.no_surat_jalan]) {
                        $.each(data.data_sum[val.no_surat_jalan], function (k, val_sj) {
                            if (jenis_produk[j] == val_sj.ukuran_jual) {
                                jumlah_kirim = parseInt(val_sj.jumlah_kirim);
                            }
                        });
                    }
                    totals[jenis_produk[j]] = (totals[jenis_produk[j]] || 0) + jumlah_kirim;

                    invoice_penjualan += `
            <td align="center" style="border:1px solid #666; padding:4px 2px; font-size:12.5px;">${jumlah_kirim > 0 ? jumlah_kirim : '-'}</td>`;
                }
                invoice_penjualan += `
        </tr>`;
            });

            // Baris JUMLAH
            invoice_penjualan += `
        <tr>
            <td style="border:none; padding:5px 2px;"></td>
            <td style="border:none; padding:5px 2px;"></td>
            <td align="center" style="border:1px solid #666; font-weight:bold; padding:5px 2px; font-size:12.5px; background-color:#8db4e3; color:#000000;">
                JUMLAH
            </td>`;

            jQuery.each(jenis_produk, function (i, val) {
                invoice_penjualan += `
            <td align="center" style="border:1px solid #666; font-weight:bold; padding:5px 2px; font-size:12.5px; background-color:#8db4e3; color:#000000;">
                ${totals[val] || ''}
            </td>`;
            });

            invoice_penjualan += `
        </tr>
    </tbody>
</table>

<!-- ===== SECTION BAWAH: HARGA + TTD (sejajar), REKENING dibawah ===== -->
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:10px;">
    <tr valign="top">
        <!-- KIRI: Harga -->
        <td width="48%" valign="top">
            <!-- Ringkasan harga (blue box, Times New Roman bold) -->
            <table border="0" cellspacing="0" cellpadding="0"
                   style="border:1.5px solid #8db4e3; width:100%; font-family: 'Times New Roman', Times, serif; font-size:15px; font-weight:bold; background-color:#8db4e3; color:#000000;">`;

            var grand_total = 0;
            jQuery.each(data.data_total, function (i, total_sj) {
                grand_total += parseFloat(total_sj.total_harga);
                invoice_penjualan += `
                <tr>
                    <td style="padding:4px 8px; font-weight:bold; white-space:nowrap; color:#000000;">
                        HARGA ${number_format(total_sj.satuan_harga)}
                    </td>
                    <td align="center" style="padding:4px 10px; font-weight:bold; color:#000000;">X</td>
                    <td align="left" style="padding:4px 6px; font-weight:bold; white-space:nowrap; color:#000000;">
                        ${total_sj.jumlah_kirim}
                    </td>
                    <td align="center" style="padding:4px 10px; font-weight:bold; color:#000000;">=</td>
                    <td align="right" style="padding:4px 8px; font-weight:bold; white-space:nowrap; color:#000000;">
                        ${number_format(total_sj.total_harga)}
                    </td>
                </tr>`;
            });

            if (total_ongkir > 0) {
                invoice_penjualan += `
                <tr>
                    <td colspan="3" style="padding:4px 8px; font-weight:bold; color:#000000;">ONGKIR</td>
                    <td align="center" style="padding:4px 10px; font-weight:bold; color:#000000;">=</td>
                    <td align="right" style="padding:4px 8px; font-weight:bold; color:#000000;">
                        ${number_format(total_ongkir)}
                    </td>
                </tr>`;
                grand_total += total_ongkir;
            }

            invoice_penjualan += `
                <tr>
                    <td colspan="3" style="padding:4px 8px; font-weight:bold; color:#000000;">TOTAL PEMBAYARAN</td>
                    <td align="center" style="padding:4px 10px; font-weight:bold; color:#000000;">=</td>
                    <td align="right" style="padding:4px 8px; font-weight:bold; color:#000000;">
                        ${number_format(grand_total)}
                    </td>
                </tr>
            </table>
        </td>

        <!-- Spacer -->
        <td width="4%"></td>

        <!-- KANAN: Tanda Tangan (sejajar dengan harga) -->
        <td width="48%" align="center" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: 'Calibri', 'Arial', sans-serif; font-size:15px;">
                <tr>
                    <td align="center" width="50%" style="padding-bottom:4px;">Di Cetak Oleh,</td>
                    <td align="center" width="50%" style="padding-bottom:4px;">Disetujui Oleh,</td>
                </tr>
                <tr style="height:65px;">
                    <td align="center" valign="bottom"></td>
                    <td align="center" valign="bottom"></td>
                </tr>
                <tr>
                    <td align="center" style="padding-top:6px; font-size:15px;">
                        Aris Tri Wibowo
                    </td>
                    <td align="center" style="padding-top:6px; font-size:15px;">
                        Sutono
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- Rekening (gray box, Times New Roman bold) - dibawah harga & ttd -->
<table width="48%" border="0" cellspacing="0" cellpadding="1" style="font-family: 'Times New Roman', Times, serif; font-size:15px; font-weight:bold; background-color:#d4d4d4; padding:6px; margin-top:10px;">
    <tr>
        <td style="padding:2px 6px;">Rekening</td>
        <td width="10px" style="padding:2px 4px;">:</td>
        <td></td>
    </tr>
    <tr>
        <td style="padding:2px 6px;">BCA</td>
        <td style="padding:2px 4px;">:</td>
        <td>0183129551 a.n SUTONO</td>
    </tr>
    <tr>
        <td style="padding:2px 6px;">Mandiri</td>
        <td style="padding:2px 4px;">:</td>
        <td>141 000 225 5818 a.n SUTONO</td>
    </tr>
</table>
</div>

<!-- ===== FOTO SURAT JALAN ===== -->`;

            // Group 4 foto per halaman with kop
            var valid_foto = [];
    $.each(foto_sj, function(i, v) { if (v && v != '-') valid_foto.push(v); });

    var fotosPerPage = 4; // 4 foto per halaman, 2x2 grid
    for (var p = 0; p < valid_foto.length; p += fotosPerPage) {
        invoice_penjualan += `
<div style="page-break-before:always; padding-top:5px;">
${kopHeader}
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:20px; table-layout:fixed;">`;
        var end = Math.min(p + fotosPerPage, valid_foto.length);
        for (var q = p; q < end; q++) {
            if ((q - p) % 2 === 0) invoice_penjualan += '<tr>';
            invoice_penjualan += `
        <td width="50%" align="center" valign="top" style="padding:6px;">
            <img src="${BASE_PATH_IMAGE_SURAT_JALAN}/${valid_foto[q]}" class="foto-sj-pdf" style="max-width:100%; max-height:360px; object-fit:contain;">
        </td>`;
            if ((q - p) % 2 === 1 || q === end - 1) {
                if (q === end - 1 && (q - p) % 2 === 0) invoice_penjualan += '<td width="50%"></td>';
                invoice_penjualan += '</tr>';
            }
        }
        invoice_penjualan += `
</table>
</div>`;
    }

            invoice_penjualan += `
</div><!-- end #invoice-print-area -->
`;

            // ─────────────────────────────────────────────
            // RENDER ke DOM lalu panggil html2pdf
            // ─────────────────────────────────────────────
            $('#' + table).html(invoice_penjualan);
            console.log(invoice_penjualan);

            rotatePortraitImages('#' + table).then(function() {
                downloadTable(tanggal_download, 'invoice-print-area');
            });
        },

        error: function (xmlhttprequest, textstatus, message) {
            app.dialog.close();
            app.dialog.alert('Gagal mengambil data surat jalan');
        }
    });
}


/**
 * Generate QR code sebagai data URL (GIF base64) dari sebuah teks/URL.
 * Menggunakan library qrcode-generator (js/lib/qrcode.min.js).
 */
function generateQrDataUrl(text, cellSize) {
	try {
		var qr = qrcode(0, 'M');
		qr.addData(text);
		qr.make();
		return qr.createDataURL(cellSize || 5, 4);
	} catch (e) {
		console.error('generateQrDataUrl error:', e);
		return null;
	}
}

/**
 * Simpan snapshot invoice ke server untuk keperluan verifikasi keaslian,
 * lalu return Promise berisi { token, url, qrImg } siap dipakai di HTML invoice.
 * Jika gagal (offline/error), Promise tetap resolve dengan qrImg = null agar invoice tetap bisa dibuat.
 */
function simpanInvoiceVerifikasiDanBuatQr(payload) {
	return new Promise(function(resolve) {
		jQuery.ajax({
			type: 'POST',
			url: BASE_API + '/simpan-invoice-verifikasi',
			dataType: 'JSON',
			data: payload,
			success: function(res) {
				if (res && res.status === 200 && res.url) {
					var qrImg = generateQrDataUrl(res.url, 5);
					resolve({ token: res.token, url: res.url, qrImg: qrImg });
				} else {
					resolve({ token: null, url: null, qrImg: null });
				}
			},
			error: function() {
				resolve({ token: null, url: null, qrImg: null });
			}
		});
	});
}

/**
 * downloadTable
 * Menggunakan html2pdf untuk mengkonversi elemen HTML ke PDF A4 portrait.
 * Style override diterapkan agar background/warna muncul di PDF.
 */
function _readExifOrientation(buffer) {
	var view = new DataView(buffer);
	if (view.byteLength < 2 || view.getUint16(0, false) !== 0xFFD8) {
		console.log('[EXIF] bukan JPEG'); return 1;
	}
	var offset = 2;
	while (offset + 4 < view.byteLength) {
		var marker = view.getUint16(offset, false);
		offset += 2;
		if (marker === 0xFFE1) {
			var segLen = view.getUint16(offset, false);
			offset += 2; // skip length
			if (view.getUint32(offset, false) !== 0x45786966) {
				console.log('[EXIF] tidak ada Exif header'); return 1;
			}
			offset += 6; // skip "Exif\0\0"
			var tiffStart = offset;
			var little = view.getUint16(offset, false) === 0x4949;
			var ifd0 = tiffStart + view.getUint32(offset + 4, little);
			var numTags = view.getUint16(ifd0, little);
			console.log('[EXIF] little=', little, 'numTags=', numTags, 'ifd0=', ifd0);
			for (var i = 0; i < numTags; i++) {
				var tagOff = ifd0 + 2 + i * 12;
				if (tagOff + 12 > view.byteLength) break;
				var tagId = view.getUint16(tagOff, little);
				if (tagId === 0x0112) {
					var val = view.getUint16(tagOff + 8, little);
					console.log('[EXIF] Orientation =', val);
					return val;
				}
			}
			console.log('[EXIF] tag orientation tidak ditemukan'); return 1;
		} else if ((marker & 0xFF00) !== 0xFF00) break;
		else offset += view.getUint16(offset, false);
	}
	console.log('[EXIF] tidak ada APP1 segment'); return 1;
}

function _drawWithOrientation(img, orientation) {
	var w = img.naturalWidth, h = img.naturalHeight;
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var swapped = orientation >= 5 && orientation <= 8;
	canvas.width  = swapped ? h : w;
	canvas.height = swapped ? w : h;
	switch (orientation) {
		case 2: ctx.transform(-1, 0, 0,  1, w, 0); break;
		case 3: ctx.transform(-1, 0, 0, -1, w, h); break;
		case 4: ctx.transform( 1, 0, 0, -1, 0, h); break;
		case 5: ctx.transform( 0, 1, 1,  0, 0, 0); break;
		case 6: ctx.transform( 0, 1,-1,  0, h, 0); break;
		case 7: ctx.transform( 0,-1,-1,  0, h, w); break;
		case 8: ctx.transform( 0,-1, 1,  0, 0, w); break;
		default: break;
	}
	ctx.drawImage(img, 0, 0, w, h);
	return canvas;
}

function fetchImgsAsBase64(container) {
	var imgs = Array.from(container.querySelectorAll('img.foto-sj-pdf'));
	return Promise.all(imgs.map(function(img) {
		var src = img.getAttribute('src');
		if (!src || src.startsWith('data:')) return Promise.resolve();
		var filename = src.split('/').pop();
		var proxyUrl = BASE_PATH_IMAGE_SURAT_JALAN + '/proxy.php?file=' + encodeURIComponent(filename);
		console.log('[fetchImg] fetch:', proxyUrl);
		return fetch(proxyUrl)
			.then(function(r) { return r.arrayBuffer(); })
			.then(function(buffer) {
				var orientation = _readExifOrientation(buffer);
				console.log('[fetchImg]', filename, '→ orientation', orientation, '| bufferSize', buffer.byteLength);
				var blob = new Blob([buffer], { type: 'image/jpeg' });
				return new Promise(function(resolve) {
					var reader = new FileReader();
					reader.onload = function(e) {
						var tempImg = new Image();
						tempImg.onload = function() {
							var w = tempImg.naturalWidth, h = tempImg.naturalHeight;
							// Jika EXIF normal (1) tapi gambar landscape, asumsikan foto diambil miring
							// karena surat jalan selalu portrait → auto-rotate 90° CW
							var effectiveOrientation = (orientation === 1 && w > h) ? 6 : orientation;
							console.log('[fetchImg] naturalSize', w, 'x', h, '→ effectiveOrientation', effectiveOrientation);
							var canvas = _drawWithOrientation(tempImg, effectiveOrientation);
							img.src = canvas.toDataURL('image/jpeg', 0.95);
							resolve();
						};
						tempImg.onerror = function() { img.src = e.target.result; resolve(); };
						tempImg.src = e.target.result;
					};
					reader.onerror = resolve;
					reader.readAsDataURL(blob);
				});
			})
			.catch(function() { /* biarkan src asli jika fetch gagal */ });
	}));
}

function downloadTable(tanggal, table) {
    var element = document.getElementById(table);
    if (!element) {
        console.error('Element #' + table + ' tidak ditemukan');
        return;
    }

    // Inject style override sementara agar warna muncul di PDF
    var styleOverride = document.createElement('style');
    styleOverride.id = 'pdf-style-override';
    styleOverride.innerHTML = `
        #${table} {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        #${table} [style*="background-color:#e5e5e5"],
        #${table} [style*="background-color: #e5e5e5"] {
            background-color: #e5e5e5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        #${table} [style*="background-color:#8db4e3"],
        #${table} [style*="background-color: #8db4e3"] {
            background-color: #8db4e3 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        #${table} [style*="background-color:#d4d4d4"],
        #${table} [style*="background-color: #d4d4d4"] {
            background-color: #d4d4d4 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        #${table} [style*="color:#000000"] {
            color: #000000 !important;
        }
        #${table} td, #${table} th {
            border-color: #666666 !important;
        }
    `;
    document.head.appendChild(styleOverride);

    fetchImgsAsBase64(element).then(function() {
        var opt = {
            margin:       [10, 10, 10, 10],
            filename:     'Invoice_' + moment(tanggal).format('DDMMYYYY') + '.pdf',
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        html2pdf().set(opt).from(element).save().then(function () {
            var el = document.getElementById('pdf-style-override');
            if (el) el.remove();

            getSuratJalanCs();
            if (typeof app !== 'undefined') app.popup.close();
            $("#tanggal_invoice_download_admin").val('');
        });
    });
}

/**
 * rotatePortraitImages
 * Deteksi gambar portrait, rotate 90° via canvas
 */
function rotatePortraitImages(containerSelector) {
    var images = document.querySelectorAll(containerSelector + ' img.foto-sj-pdf');
    var promises = Array.from(images).map(function(img) {
        return new Promise(function(resolve) {
            var processImg = function() {
                if (img.naturalHeight > img.naturalWidth) {
                    var wrapper = document.createElement('div');
                    wrapper.className = 'foto-sj-wrapper';
                    wrapper.style.cssText = 'display:block; overflow:hidden; width:100%; height:300px; text-align:center;';

                    img.parentNode.insertBefore(wrapper, img);
                    wrapper.appendChild(img);

                    img.style.cssText = 'width:auto; height:300px; transform:rotate(90deg); transform-origin:center center; max-width:none;';
                }
                resolve();
            };
            if (img.complete && img.naturalWidth > 0) {
                processImg();
            } else {
                img.onload = processImg;
                img.onerror = resolve;
            }
        });
    });
    return Promise.all(promises);
}

/**
 * buildInvoiceTemplate2
 * Template KOPERINDO style: NO, TANGGAL, SPK, SURAT JALAN, JENIS, QTY, HARGA, TOTAL RP
 */
function buildInvoiceTemplate2(data, tanggal_download, no_invoice_full, client_nama, client_kota, client_alamat) {
    var foto_sj = [];
    var total_ongkir = 0;

    // Header KOP — sama seperti Template 1
    var kopHeader2 = `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:0px; font-family: 'Times New Roman', Times, serif;">
    <tr>
        <td width="170" align="center" valign="middle" style="padding:5px 8px;">
            <img src="img/logo/logo-koperindo-invoice.png" width="150" height="100"
                 onerror="this.style.display='none'">
        </td>
        <td align="center" valign="middle" style="padding:5px 80px 5px 10px;">
            <div style="font-size:32px; font-weight:bold; color:#000000; letter-spacing:3px; margin-bottom:-2px;">KOPER INDONESIA</div>
            <div style="font-size:16px; color:#000000; font-weight:bold; line-height:1.1;">
                Permata blok R3 No.32 - 39, Kludan, Kec. Tanggulangin,<br>
                Kabupaten Sidoarjo, Jawa Timur 61272
            </div>
            <div style="font-size:16px; font-weight:bold;"><a href="http://www.koperindo.id" style="color:#0000FF; text-decoration:underline;">www.koperindo.id</a></div>
        </td>
    </tr>
</table>
<div style="border-top:3.5px solid #000000; margin:4px 0 4px 0;"></div>`;

    var html = `
<div id="invoice-print-area" style="
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 14px;
    color: #000;
    background: #fff;
    padding: 10px 20px 15px 20px;
    max-width: 780px;
    margin: 0 auto;
    line-height: 1.45;
">

${kopHeader2}

<!-- INVOICE TITLE: pakai table 3 kolom biar visual sejajar dengan kop (logo 170 kiri, padding 80 kanan) -->
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:8px 0 14px 0;">
    <tr>
        <td width="170"></td>
        <td align="center" style="padding-right:80px;">
            <span style="font-size:26px; font-weight:bold; letter-spacing:3px;">INVOICE</span>
        </td>
    </tr>
</table>

<!-- INFO CLIENT — pakai table biar nama & alamat sejajar -->
<table border="0" cellspacing="0" cellpadding="0" style="margin-bottom:6px; font-size:14px;">
    <tr>
        <td valign="top" style="white-space:nowrap; padding-right:6px;">Kepada Yth</td>
        <td valign="top" style="padding-right:6px;">:</td>
        <td valign="top"><b>${client_nama}</b></td>
    </tr>`;

    if (client_alamat) {
        html += `
    <tr>
        <td></td>
        <td></td>
        <td>${client_alamat}</td>
    </tr>`;
    }

    html += `
    <tr>
        <td></td>
        <td></td>
        <td>${client_kota}</td>
    </tr>
</table>

<!-- NO INVOICE pojok kanan -->
<div style="text-align:right; margin-bottom:6px; font-size:14px;">
    No. Invoice : <b>${no_invoice_full}</b>
</div>

<table width="100%" border="0" cellspacing="0" cellpadding="0"
       style="border-collapse:collapse; margin-bottom:0; font-size:13px;">
    <thead>
        <tr>
            <td align="center" width="5%"  style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">NO</td>
            <td align="center" width="12%" style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">TANGGAL</td>
            <td align="center" width="8%"  style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">SPK</td>
            <td align="center" width="12%" style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">SURAT JALAN</td>
            <td align="center" width="18%" style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">JENIS</td>
            <td align="center" width="10%" style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">QTY</td>
            <td align="center" width="13%" style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">HARGA</td>
            <td align="center" width="15%" style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">TOTAL RP.</td>
        </tr>
    </thead>
    <tbody>`;

    var no = 0;
    var grand_total = 0;
    var total_qty = 0;

    jQuery.each(data.data, function (i, val) {
        no++;
        var ongkir = data.data_penjualan[val.no_surat_jalan]
            ? parseFloat(data.data_penjualan[val.no_surat_jalan].ongkir)
            : 0;
        total_ongkir += ongkir;

        if (data.data_sj[val.no_surat_jalan] && data.data_sj[val.no_surat_jalan][0]) {
            foto_sj.push(data.data_sj[val.no_surat_jalan][0].foto_surat_jalan);
        }

        var sjItems = data.data_sj[val.no_surat_jalan] || [];
        var rowCount = sjItems.length || 1;
        var spk = val.penjualan_id.replace(/INV_0*/g, '');
        var sjNumber = val.no_surat_jalan.replace(/SJ_\s*/g, '');

        var sjQty = 0;
        if (data.data_sum[val.no_surat_jalan]) {
            $.each(data.data_sum[val.no_surat_jalan], function(k, v) {
                sjQty += parseInt(v.jumlah_kirim);
            });
        }
        total_qty += sjQty;

        $.each(sjItems, function(j, sjItem) {
            var harga = parseFloat(sjItem.penjualan_harga || 0);
            var qty = parseInt(sjItem.jumlah_kirim || 0);
            var totalRp = harga * qty;
            grand_total += totalRp;

            html += '<tr>';
            if (j === 0) {
                html += '<td align="center" rowspan="' + rowCount + '" style="border:1px solid #000; padding:4px 2px;">' + no + '</td>';
                html += '<td align="center" rowspan="' + rowCount + '" style="border:1px solid #000; padding:4px 2px;">' + moment(val.tanggal).format('DD.MM.YYYY') + '</td>';
                html += '<td align="center" rowspan="' + rowCount + '" style="border:1px solid #000; padding:4px 2px;">' + spk + '</td>';
                html += '<td align="center" rowspan="' + rowCount + '" style="border:1px solid #000; padding:4px 2px;">' + sjNumber + '</td>';
            }
            html += '<td align="left" style="border:1px solid #000; padding:4px 5px;">' + sjItem.penjualan_jenis + '</td>';
            if (j === 0 && rowCount > 1) {
                html += '<td align="center" rowspan="' + rowCount + '" style="border:1px solid #000; padding:4px 2px;">' + sjQty + ' Set</td>';
            } else if (rowCount === 1) {
                html += '<td align="center" style="border:1px solid #000; padding:4px 2px;">' + sjQty + ' Set</td>';
            }
            html += '<td align="right" style="border:1px solid #000; padding:4px 5px;">' + number_format(harga) + '</td>';
            html += '<td align="right" style="border:1px solid #000; padding:4px 5px;">' + number_format(totalRp) + '</td>';
            html += '</tr>';
        });

        if (sjItems.length === 0) {
            html += '<tr>';
            html += '<td align="center" style="border:1px solid #000; padding:4px 2px;">' + no + '</td>';
            html += '<td align="center" style="border:1px solid #000; padding:4px 2px;">' + moment(val.tanggal).format('DD.MM.YYYY') + '</td>';
            html += '<td align="center" style="border:1px solid #000; padding:4px 2px;">' + spk + '</td>';
            html += '<td align="center" style="border:1px solid #000; padding:4px 2px;">' + sjNumber + '</td>';
            html += '<td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td><td style="border:1px solid #000;"></td>';
            html += '</tr>';
        }
    });

     html += `
        <tr>
            <td colspan="4" style="border:none;"></td>
            <td align="center" style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">JUMLAH</td>
            <td align="center" style="border:1px solid #000; font-weight:bold; padding:6px 2px; background-color:#e5e5e5;">${total_qty} SET</td>
            <td style="border:none;"></td>
            <td style="border:1px solid #000; padding:0; background-color:#8db4e3;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                        <td align="left"  style="font-weight:bold; padding:6px 5px; color:#000;">Rp</td>
                        <td align="right" style="font-weight:bold; padding:6px 5px; color:#000;">${number_format(grand_total)}</td>
                    </tr>
                </table>
            </td>
        </tr>`;

    if (total_ongkir > 0) {
        grand_total += total_ongkir;
        html += `
        <tr>
            <td colspan="6" align="right" style="border:none; font-weight:bold; padding:4px 8px;">ONGKIR</td>
            <td style="border:none;"></td>
            <td style="border:1px solid #000; padding:0; background-color:#8db4e3;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                        <td align="left"  style="font-weight:bold; padding:4px 5px; color:#000;">Rp</td>
                        <td align="right" style="font-weight:bold; padding:4px 5px; color:#000;">${number_format(total_ongkir)}</td>
                    </tr>
                </table>
            </td>
        </tr>`;
    }

    html += `
        <tr>
            <td colspan="6" align="right" style="border:none; font-weight:bold; padding:4px 8px;">SISA PEMBAYARAN</td>
            <td style="border:none;"></td>
            <td style="border:1px solid #000; padding:0; background-color:#8db4e3;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                        <td align="left"  style="font-weight:bold; padding:4px 5px; color:#000;">Rp</td>
                        <td align="right" style="font-weight:bold; padding:4px 5px; color:#000;">${number_format(grand_total)}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </tbody>
</table>

<!-- FOOTER: Rekening (kiri, titik dua sejajar) & Hormat Kami (kanan, tanpa logo koper) -->
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:25px; font-size:14px;">
    <tr valign="top">
        <td width="55%" valign="top">
            <table border="0" cellspacing="0" cellpadding="0" style="border:1.5px solid #000; background-color:#f2f2f2; font-size:14px;">
                <tr>
                    <td colspan="3" style="padding:4px 10px;"><b>Rekening :</b></td>
                </tr>
                <tr>
                    <td style="padding:3px 10px;"><b>BCA</b></td>
                    <td style="padding:3px 4px;"><b>:</b></td>
                    <td style="padding:3px 10px 3px 0;">0183129551&nbsp;&nbsp;an. SUTONO</td>
                </tr>
                <tr>
                    <td style="padding:3px 10px;"><b>Mandiri</b></td>
                    <td style="padding:3px 4px;"><b>:</b></td>
                    <td style="padding:3px 10px 3px 0;">141 000 225 5818 an. SUTONO</td>
                </tr>
            </table>
        </td>
        <td width="45%" align="right" valign="top">
            <div style="font-weight:bold; margin-bottom:5px;">HORMAT KAMI</div>
            <div style="margin:5px 0;">
                <img src="img/logo/invoiceLogo.png" width="90" height="90"
                     onerror="this.style.display='none'">
            </div>
            <div style="font-weight:bold; margin-top:2px;">KOPERINDO</div>
        </td>
    </tr>
</table>

<!-- ===== FOTO SURAT JALAN ===== -->`;

    var valid_foto = [];
    $.each(foto_sj, function(i, v) { if (v && v != '-') valid_foto.push(v); });

    var fotosPerPage = 4; // 4 foto per halaman, 2x2 grid
    for (var p = 0; p < valid_foto.length; p += fotosPerPage) {
        html += `
<div style="page-break-before:always; padding-top:5px;">
${kopHeader2}
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:20px; table-layout:fixed;">`;
        var end = Math.min(p + fotosPerPage, valid_foto.length);
        for (var q = p; q < end; q++) {
            if ((q - p) % 2 === 0) html += '<tr>';
            html += `
        <td width="50%" align="center" valign="top" style="padding:6px;">
            <img src="${BASE_PATH_IMAGE_SURAT_JALAN}/${valid_foto[q]}" class="foto-sj-pdf" style="max-width:100%; max-height:360px; object-fit:contain;">
        </td>`;
            if ((q - p) % 2 === 1 || q === end - 1) {
                if (q === end - 1 && (q - p) % 2 === 0) html += '<td width="50%"></td>';
                html += '</tr>';
            }
        }
        html += `
</table>
</div>`;
    }

    html += '</div><!-- end #invoice-print-area -->';
    return html;
}


function getBulanSummary() {
	var m = moment.months();
	var month_now = moment().month();
	var n = 0;
	for (var i = 0; i < 12; i++) {
		n++
		if (i == month_now) {
			$('.summary_bulan').append($('<option selected />').val(n).html(m[i]));
		} else {
			$('.summary_bulan').append($('<option />').val(n).html(m[i]));
		}
		console.log('angka = ' + n + ' bulan = ' + m[i])
	}


}

function getYearSummary() {
	let startYear = 2010;
	let endYear = new Date().getFullYear();
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('.summary_years').append($('<option selected />').val(i).html(i));
		} else {
			$('.summary_years').append($('<option />').val(i).html(i));
		}
	}
}

function getBulanSummarySjAdmin() {
	var m = moment.months();
	var month_now = moment().month();
	var n = 0;
	for (var i = 0; i < 12; i++) {
		n++;
		if (i == month_now) {
			$('#summary_bulan_sj_admin').append($('<option selected />').val(n).html(m[i]));
		} else {
			$('#summary_bulan_sj_admin').append($('<option />').val(n).html(m[i]));
		}
	}
}

function getYearSummarySjAdmin() {
	let startYear = 2010;
	let endYear = new Date().getFullYear();
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('#summary_years_sj_admin').append($('<option selected />').val(i).html(i));
		} else {
			$('#summary_years_sj_admin').append($('<option />').val(i).html(i));
		}
	}
}

function toggleSjAdminSelection(el) {
	if (!window._selectedSjAdminIds) window._selectedSjAdminIds = {};
	var pid = jQuery(el).data('id');
	if (el.checked) {
		window._selectedSjAdminIds[pid] = true;
	} else {
		delete window._selectedSjAdminIds[pid];
	}
	toggleFloatingDownloadSjAdmin();
}

function toggleFloatingDownloadSjAdmin() {
	var count = Object.keys(window._selectedSjAdminIds || {}).length;
	if (count > 0) {
		$('#floating-download-sj-admin').show();
		$('#sj-admin-bottom-spacer').show();
	} else {
		$('#floating-download-sj-admin').hide();
		$('#sj-admin-bottom-spacer').hide();
	}
}

function bukaDownloadInvoiceSjAdmin() {
	var count = Object.keys(window._selectedSjAdminIds || {}).length;
	if (count === 0) {
		app.dialog.alert('Pilih minimal satu data terlebih dahulu');
		return;
	}
	app.popup.open('.pilih-tipe-invoice-admin');
}

function pilihInvoiceIndukAdmin() {
	app.popup.close('.pilih-tipe-invoice-admin');
	buatInvoiceIndukSjAdmin();
}

function pilihInvoiceGabunganAdmin() {
	app.popup.close('.pilih-tipe-invoice-admin');
	buatInvoiceGabunganSjAdmin();
}

function buatInvoiceIndukSjAdmin() {
	var selectedIds = Object.keys(window._selectedSjAdminIds || {});
	if (selectedIds.length === 0) {
		app.dialog.alert('Pilih minimal 1 data penjualan.');
		return;
	}

	// Kumpulkan data dari cache
	var ids = [];
	selectedIds.forEach(function (pid) {
		var info = (window._penjualanItemCache && window._penjualanItemCache[pid]) || {};
		ids.push({ penjualan_id: pid, info: info });
	});

	// Validasi: semua harus klien yang sama
	var clients = [...new Set(ids.map(function(x) { return x.info.client_nama || ''; }))];
	if (clients.length > 1) {
		app.dialog.alert('Invoice Induk harus 1 klien yang sama.\nDitemukan ' + clients.length + ' klien berbeda.');
		return;
	}

	// Validasi: semua harus base SPK yang sama (strip -N suffix)
	function getBaseSPK(pid) {
		var clean = pid.replace(/^INV_0*/i, '').replace(/^0+/, '');
		return clean.replace(/-\d+$/, '');
	}
	var bases = [...new Set(ids.map(function(x) { return getBaseSPK(x.penjualan_id); }))];
	if (bases.length > 1) {
		app.dialog.alert('Invoice Induk harus 1 base SPK yang sama.\nDitemukan base: ' + bases.join(', '));
		return;
	}

	var baseSPK = bases[0];
	var clientNama = clients[0];
	var clientNamaClean = clientNama
		.replace(/PT\. /g,'').replace(/PT/g,'')
		.replace(/CV\. /g,'').replace(/CV/g,'')
		.replace(/UD\. /g,'').replace(/UD/g,'').trim();
	var firstInfo = ids[0].info;
	var clientKota = firstInfo.nama_kota || '';
	var noInvoice = moment().format('DDMMYY');
	var header_koper = 'KOPERINDO';

	app.dialog.preloader('Membuat Invoice Induk...');

	var allPromises = ids.map(function (item) {
		return jQuery.ajax({
			type: 'POST',
			url: BASE_API + '/get-penjualan-detail-performa-manager',
			dataType: 'JSON',
			data: {
				karyawan_id: 'empty',
				penjualan_id: item.penjualan_id,
				jenis_penjualan: item.info.jenis_penjualan || ''
			}
		}).then(function (data) {
			return { pid: item.penjualan_id, info: item.info, data: data };
		});
	});

	Promise.all(allPromises).then(function (results) {

		function hitungDpValidated(d0) {
			var total = 0;
			['1','2','3','4','5','6','7','8','9','10'].forEach(function(n) {
				if (d0['valid_cs_'+n] == 1 && d0['pembayaran_'+n] != null) {
					total += parseFloat(d0['pembayaran_'+n]);
				}
			});
			return total;
		}

		var grand_total_sum  = 0;
		var total_dp_sum     = 0;
		var total_ongkir_sum = 0;
		var total_qty_sum    = 0;
		var total_sisa_sum   = 0;

		results.forEach(function(r) {
			if (r.data.data && r.data.data.length > 0) {
				var dp = hitungDpValidated(r.data.data[0]);
				total_dp_sum += dp;
				r.data.data.forEach(function(val) {
					total_ongkir_sum += parseFloat(val.ongkir || 0);
					total_qty_sum    += parseFloat(val.penjualan_qty || 0);
					grand_total_sum  += parseFloat(val.penjualan_detail_grandtotal || 0);
				});
			}
		});
		total_sisa_sum = grand_total_sum + total_ongkir_sum - total_dp_sum;

		var is_lunas = (total_sisa_sum <= 0);
		var lunas_stamp_html = is_lunas
			? '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url(\'img/logo/lunas.jpg\');background-position:center;background-size:45% auto;background-repeat:no-repeat;opacity:0.5;z-index:0;pointer-events:none;"></div>'
			: '';

		var TH = 'style="border:1px solid #000;padding:6px 6px;font-weight:700;background:rgba(242,242,242,0.3);color:#000;text-align:center;white-space:nowrap;letter-spacing:0.5px;font-size:12px;"';
		var NUM_FONT = "font-size:12px;font-weight:500;";

		var kopHeader = '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:0px; font-family: \'Times New Roman\', Times, serif;">'
			+ '<tr>'
			+ '<td width="170" align="center" valign="middle" style="padding:5px 8px;">'
			+ '<img src="img/logo/logo-koperindo-invoice.png" width="150" height="100" onerror="this.style.display=\'none\'">'
			+ '</td>'
			+ '<td align="center" valign="middle" style="padding:5px 80px 5px 5px;">'
			+ '<div style="font-size:32px; font-weight:bold; color:#000000; letter-spacing:3px; margin-bottom:-2px;">KOPER INDONESIA</div>'
			+ '<div style="font-size:16px; color:#000000; font-weight:bold; line-height:1.1;">'
			+ 'Permata blok R3 No.32 - 39, Kludan, Kec. Tanggulangin,<br>'
			+ 'Kabupaten Sidoarjo, Jawa Timur 61272'
			+ '</div>'
			+ '<div style="font-size:16px; font-weight:bold;"><a href="http://www.koperindo.id" style="color:#0000FF; text-decoration:underline;">www.koperindo.id</a></div>'
			+ '</td>'
			+ '</tr>'
			+ '</table>'
			+ '<div style="border-top:3.5px solid #000000; margin:4px 0 4px 0;"></div>';

		var inv = '';
		inv += '<div id="invoice-induk-print-area" style="background-color:#fff;color:#000;font-family:\'Segoe UI\',\'Helvetica Neue\',Arial,sans-serif;font-size:12px;padding:16px 20px;position:relative;">';
		inv += '<div style="position:relative;">'; // wrapper konten invoice saja
		inv += lunas_stamp_html;
		inv += '<div style="position:relative;z-index:1;">';
		inv += kopHeader;
		inv += '<div style="text-align:center;font-size:26px;font-weight:700;letter-spacing:5px;text-decoration:underline;margin:10px 20px 10px 120px;">INVOICE</div>';

		inv += '<table width="100%" style="border-collapse:collapse;margin-bottom:10px;font-size:14px;">';
		inv += '<tr>';
		inv += '  <td style="padding:2px 0;vertical-align:top;font-size:14px;">Kepada Yth : <b style="font-size:15px;">' + clientNamaClean + '</b></td>';
		inv += '  <td style="padding:2px 0;text-align:right;vertical-align:top;font-size:16px;">No. Invoice : <b style="font-size:16px;">' + noInvoice + '</b></td>';
		inv += '</tr>';
		inv += '<tr>';
		inv += '  <td style="padding:1px 0 0 78px;font-size:14px;">' + clientKota + '</td>';
		inv += '  <td style="padding:1px 0;text-align:right;font-size:14px;">SPK : <b>' + baseSPK + '</b></td>';
		inv += '</tr>';
		inv += '</table>';

		// Kumpulkan semua no_surat_jalan dari semua termin
		var all_sj_nos = [];
		results.forEach(function(r) {
			if (r.data.no_surat_jalan_list && r.data.no_surat_jalan_list.length > 0) {
				r.data.no_surat_jalan_list.forEach(function(sj) {
					if (all_sj_nos.indexOf(sj) === -1) all_sj_nos.push(sj);
				});
			}
		});

		// Aggregate semua item lintas termin → group by jenis
		var jenisMap = {};
		results.forEach(function(r) {
			if (!r.data.data) return;
			r.data.data.forEach(function(val) {
				var jenis = val.penjualan_jenis || '-';
				if (jenis === 'LAINNYA') jenis = val.keterangan || '-';
				if (!jenisMap[jenis]) {
					jenisMap[jenis] = { jenis: jenis, qty: 0, harga: parseFloat(val.penjualan_harga || 0), total: 0 };
				}
				jenisMap[jenis].qty   += parseFloat(val.penjualan_qty || 0);
				jenisMap[jenis].total += parseFloat(val.penjualan_detail_grandtotal || 0);
			});
		});
		var jenisRows = Object.values(jenisMap);

		inv += '<table width="100%" style="border-collapse:collapse;table-layout:fixed;font-size:12px;background:transparent;">';
		inv += '<colgroup><col style="width:5%"><col style="width:15%"><col style="width:30%"><col style="width:10%"><col style="width:20%"><col style="width:20%"></colgroup>';
		inv += '<thead><tr>';
		inv += '  <th ' + TH + '>NO</th><th ' + TH + '>SJ</th><th ' + TH + '>JENIS</th>';
		inv += '  <th ' + TH + '>QTY</th><th ' + TH + '>HARGA</th><th ' + TH + '>TOTAL</th>';
		inv += '</tr></thead><tbody>';

		var sj_content = (all_sj_nos.length > 0)
			? all_sj_nos.map(function(sj) { return '<span style="display:block;width:100%;text-align:center;line-height:1.5;">' + sj + '</span>'; }).join('')
			: '<span style="display:block;width:100%;text-align:center;">-</span>';
		var sj_span_style = 'border-left:1px solid #000;border-right:1px solid #000;border-top:1px solid #000;border-bottom:1px solid #000;'
			+ 'padding:0;vertical-align:middle;text-align:center;';

		jenisRows.forEach(function(row, idx) {
			var is_last = (idx === jenisRows.length - 1);
			var zebra = (idx % 2 === 1) ? 'background:rgba(247,249,252,0.3);' : '';
			var td = 'border-left:1px solid #000;border-right:1px solid #000;border-top:1px solid #000;'
				+ (is_last ? 'border-bottom:1px solid #000;' : '')
				+ 'padding:8px 8px;vertical-align:middle;' + zebra;
			inv += '<tr>';
			inv += '<td style="' + td + 'text-align:center;font-size:12px;">' + (idx + 1) + '</td>';
			if (idx === 0) {
				inv += '<td rowspan="' + jenisRows.length + '" style="' + sj_span_style + '">'
					+ '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:28px;width:100%;padding:4px 5px;box-sizing:border-box;font-size:11px;font-weight:500;">'
					+ sj_content + '</div></td>';
			}
			inv += '<td style="' + td + 'text-align:left;font-size:12px;font-weight:500;">' + row.jenis + '</td>';
			inv += '<td style="' + td + 'text-align:center;' + NUM_FONT + '">' + row.qty + '</td>';
			inv += '<td style="' + td + 'text-align:right;' + NUM_FONT + '">' + number_format(row.harga) + '</td>';
			inv += '<td style="' + td + 'text-align:right;' + NUM_FONT + '">' + number_format(row.total) + '</td>';
			inv += '</tr>';
		});

		function sumRow(label, qty_cell, amt) {
			var r = '<tr>';
			if (qty_cell !== null) {
				r += '<td colspan="3" style="border:none;padding:0;"></td>';
				r += '<td style="border-left:1px solid #000;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 8px;font-weight:700;text-align:center;white-space:nowrap;font-size:12px;">' + qty_cell + '</td>';
				r += '<td style="border-left:1px solid #000;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 8px;font-weight:700;text-align:right;font-size:12px;">' + label + '</td>';
			} else {
				r += '<td colspan="4" style="border:none;padding:0;"></td>';
				r += '<td style="border-left:1px solid #000;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 8px;font-weight:700;text-align:right;font-size:12px;">' + label + '</td>';
			}
			r += '<td style="border:1px solid #000;padding:6px 8px;font-weight:700;text-align:right;background:rgba(149,179,215,0.3);color:#000;font-size:12px;">Rp&nbsp;&nbsp;' + number_format(amt) + '</td>';
			r += '</tr>';
			return r;
		}

		inv += sumRow('JUMLAH', null, grand_total_sum);
		if (total_dp_sum > 0) inv += sumRow('DP', null, total_dp_sum);
		if (total_ongkir_sum > 0) inv += sumRow('ONGKIR', null, total_ongkir_sum);
		inv += sumRow('SISA PEMBAYARAN', null, Math.max(total_sisa_sum, 0));
		inv += '</tbody></table>';

		var d0 = (results[0].data.data && results[0].data.data[0]) ? results[0].data.data[0] : {};
		var bankHtml = '<div style="height:22px;line-height:22px;font-size:14px;font-weight:700;text-align:left;">Rekening&nbsp;&nbsp;:</div>';
		bankHtml += '<table style="border-collapse:collapse;font-size:14px;border:none;">';
		if (d0.bank_1_id) {
			var bankId = parseInt(d0.bank_1_id);
			if (d0.bank_1 === 'Mandiri Owner') bankId = 6;
			var bk = (typeof getBankInfoById === 'function') ? getBankInfoById(bankId) : null;
			if (bk) {
				bankHtml += '<tr><td style="border:none;padding:5px 8px;background:#d8d8d8;font-weight:700;font-size:14px;">' + bk.nama + '</td><td style="border:none;padding:5px 6px;background:#d8d8d8;font-size:14px;">:</td><td style="border:none;padding:5px 8px;background:#d8d8d8;font-size:14px;">' + bk.rekening + ' a.n ' + bk.atas_nama + '</td></tr>';
			}
		} else {
			var bc = 'border:none;padding:5px 8px;background:#d8d8d8;font-size:14px;';
			bankHtml += '<tr><td style="' + bc + 'font-weight:700;">BCA</td><td style="' + bc + 'padding:5px 6px;">:</td><td style="' + bc + '">0183129551 &nbsp;an. SUTONO</td></tr>';
			bankHtml += '<tr><td style="' + bc + 'font-weight:700;">Mandiri</td><td style="' + bc + 'padding:5px 6px;">:</td><td style="' + bc + '">141 000 &nbsp;225 5818 &nbsp;a.n SUTONO</td></tr>';
		}
		bankHtml += '</table>';

		inv += '<div style="page-break-inside:avoid;break-inside:avoid;">';
		inv += '<table width="100%" style="border-collapse:collapse;margin-top:18px;font-size:12px;">';
		inv += '<tr>';
		inv += '  <td width="48%" valign="top">' + bankHtml + '</td>';
		inv += '  <td width="22%" align="center" valign="top"><div style="height:22px;line-height:22px;font-size:14px;font-weight:700;visibility:hidden;">QR</div>{{QR_SLOT}}</td>';
		inv += '  <td width="30%" align="center" valign="top">';
		inv += '    <div style="height:22px;line-height:22px;font-size:14px;font-weight:700;">HORMAT KAMI</div>';
		inv += '    <img src="img/logo/invoiceLogo.png" width="90" height="90" style="display:block;margin:0 auto;">';
		inv += '    <b style="font-size:13px;font-weight:700;">' + header_koper + '</b>';
		inv += '  </td>';
		inv += '</tr></table>';
		inv += '</div>';
		inv += '</div></div></div>'; // tutup: z-index:1 div, content-wrapper, print-area

		// Kumpulkan penjualan_id untuk lampiran foto SJ
		var all_pid_for_sj = [];
		results.forEach(function(r) {
			if (all_pid_for_sj.indexOf(r.pid) === -1) all_pid_for_sj.push(r.pid);
		});

		function renderIndukPDF(invHtml) {
			var qrPayload = {
				tipe: 'induk',
				no_invoice: noInvoice,
				spk: baseSPK,
				client_nama: clientNamaClean,
				client_kota: clientKota,
				data: JSON.stringify({
					items: jenisRows,
					jumlah: grand_total_sum,
					dp: total_dp_sum,
					sisa: Math.max(total_sisa_sum, 0),
					status_lunas: is_lunas
				})
			};
			simpanInvoiceVerifikasiDanBuatQr(qrPayload).then(function(qrResult) {
				var qrHtml = qrResult.qrImg
					? ('<img src="' + qrResult.qrImg + '" width="80" height="80" style="display:block;margin:0 auto;vertical-align:top;"><div style="font-size:9px;margin-top:4px;">Scan untuk verifikasi keaslian</div>')
					: '';
				invHtml = invHtml.replace('{{QR_SLOT}}', qrHtml);
				_renderIndukPDFActual(invHtml);
			});
		}

		function _renderIndukPDFActual(invHtml) {
			var printDate = moment().format('DD/MM/YYYY HH:mm');
			var container = document.getElementById('invoice-induk-container');
			if (!container) {
				container = document.createElement('div');
				container.id = 'invoice-induk-container';
				container.style.cssText = 'position:fixed;left:0;top:0;background:white;width:210mm;z-index:-1;opacity:0;';
				document.body.appendChild(container);
			}
			console.log('[Invoice Induk HTML]', invHtml);
			container.innerHTML = invHtml;
			app.dialog.close();

			var styleOverride = document.createElement('style');
			styleOverride.id = 'pdf-induk-style-override';
			styleOverride.innerHTML = '#invoice-induk-print-area{background-color:#fff!important;color:#000!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
				+ '#invoice-induk-print-area td,#invoice-induk-print-area th{color:#000!important;}'
				+ '#invoice-induk-print-area thead{display:table-header-group;}'
				+ '#invoice-induk-print-area tr{page-break-inside:avoid;}';
			document.head.appendChild(styleOverride);

			fetchImgsAsBase64(container).then(function() {
				var opt = {
					margin: [10, 10, 18, 10],
					filename: 'Invoice_Induk_' + baseSPK + '_' + moment().format('DDMMYYYY') + '.pdf',
					image: { type: 'jpeg', quality: 1 },
					html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false },
					jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
					pagebreak: { mode: ['css', 'legacy'] }
				};

				function buildFooterCanvas(pageNum, totalPages, cb) {
					var W = 794, H = 26;
					var canvas = document.createElement('canvas');
					canvas.width = W * 2; canvas.height = H * 2;
					var ctx = canvas.getContext('2d');
					ctx.scale(2, 2);
					ctx.fillStyle = '#D4621A'; ctx.fillRect(0, 0, W, 2);
					ctx.fillStyle = '#3D3D3D'; ctx.fillRect(0, 2, W, H - 2);
					var chevX = W - 175;
					ctx.beginPath(); ctx.moveTo(chevX + 18, 2); ctx.lineTo(W, 2); ctx.lineTo(W, H); ctx.lineTo(chevX, H); ctx.closePath(); ctx.fillStyle = '#C85A14'; ctx.fill();
					ctx.beginPath(); ctx.moveTo(chevX + 18, 2); ctx.lineTo(chevX, H); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
					var ty = H / 2 + 4;
					ctx.font = '9.5px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('Dicetak: ', 10, ty);
					var dw = ctx.measureText('Dicetak: ').width;
					ctx.font = 'bold 9.5px "Segoe UI", Arial, sans-serif'; ctx.fillText(printDate, 10 + dw, ty);
					var midLabel = 'Halaman ' + pageNum + ' / ' + totalPages;
					ctx.font = '9.5px "Segoe UI", Arial, sans-serif';
					var mw = ctx.measureText(midLabel).width;
					ctx.fillText(midLabel, (W - mw) / 2, ty);
					ctx.font = 'bold 9.5px "Segoe UI", Arial, sans-serif'; ctx.fillText('KOPER ', W - 122, ty); ctx.fillText('INDONESIA', W - 84, ty);
					cb(canvas);
				}

				html2pdf().set(opt).from(document.getElementById('invoice-induk-print-area')).toPdf().get('pdf').then(function(pdf) {
					var totalPages = pdf.internal.getNumberOfPages();
					var pageW = pdf.internal.pageSize.getWidth();
					var pageH = pdf.internal.pageSize.getHeight();
					var imgW = pageW - 20;
					for (var p = 1; p <= totalPages; p++) {
						(function(pn) {
							buildFooterCanvas(pn, totalPages, function(fc) {
								pdf.setPage(pn);
								pdf.addImage(fc.toDataURL('image/png'), 'PNG', 10, pageH - 9, imgW, 6.5);
							});
						})(p);
					}
				}).save().then(function() {
					var el = document.getElementById('pdf-induk-style-override');
					if (el) el.remove();
					container.innerHTML = '';
					jQuery('.cb-download-sj-admin').prop('checked', false);
					window._selectedSjAdminIds = {};
					toggleFloatingDownloadSjAdmin();
				});
			});
		}

		// Jika ada SJ, fetch foto dulu lalu append ke inv
		if (all_sj_nos.length > 0) {
			jQuery.ajax({
				type: 'POST',
				url: BASE_API + '/get-surat-jalan-pdf',
				dataType: 'JSON',
				data: { no_surat_jalan: all_sj_nos, penjualan_id: all_pid_for_sj, id_history_invoice_sj: 0 },
				success: function(sjData) {
					var valid_foto = [];
					all_sj_nos.forEach(function(sj_no) {
						if (sjData.data_sj && sjData.data_sj[sj_no] && sjData.data_sj[sj_no][0] && sjData.data_sj[sj_no][0].foto_surat_jalan) {
							valid_foto.push({ no: sj_no, foto: sjData.data_sj[sj_no][0].foto_surat_jalan });
						}
					});

					// Sisipkan lampiran setelah content-wrapper, sebelum print-area closing
					var cutIdx = inv.lastIndexOf('</div>');
					var fullInv = (cutIdx !== -1) ? inv.slice(0, cutIdx) : inv;

					// Halaman foto: 2 per halaman
					var fotosPerPage = 4; // 4 foto per halaman, 2x2 grid
					for (var p = 0; p < valid_foto.length; p += fotosPerPage) {
						var end = Math.min(p + fotosPerPage, valid_foto.length);
						fullInv += '<div style="page-break-before:always;padding:16px 20px;background:#fff;">';
						fullInv += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;border-bottom:2px solid #000;padding-bottom:6px;">LAMPIRAN SURAT JALAN</div>';
						fullInv += '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;">';
						for (var q = p; q < end; q++) {
							if ((q - p) % 2 === 0) fullInv += '<tr>';
							fullInv += '<td width="50%" align="center" valign="top" style="padding:6px;">';
							fullInv += '<div style="font-size:11px;font-weight:700;margin-bottom:4px;text-align:center;">' + valid_foto[q].no + '</div>';
							fullInv += '<img src="' + BASE_PATH_IMAGE_SURAT_JALAN + '/' + valid_foto[q].foto + '" class="foto-sj-pdf" crossorigin="anonymous" style="max-width:100%;max-height:360px;object-fit:contain;">';
							fullInv += '</td>';
							if ((q - p) % 2 === 1 || q === end - 1) {
								if (q === end - 1 && (q - p) % 2 === 0) fullInv += '<td width="50%"></td>';
								fullInv += '</tr>';
							}
						}
						fullInv += '</table></div>';
					}

					// Tutup print-area
					fullInv += '</div>';

					renderIndukPDF(fullInv);
				},
				error: function() {
					// Gagal fetch foto, render invoice saja tanpa lampiran
					renderIndukPDF(inv);
				}
			});
		} else {
			renderIndukPDF(inv);
		}

	}).catch(function (err) {
		app.dialog.close();
		app.dialog.alert('Gagal mengambil data. Silakan coba lagi.');
		console.error('buatInvoiceIndukSjAdmin error:', err);
	});
}

function buatInvoiceGabunganSjAdmin() {
	var selectedIds = Object.keys(window._selectedSjAdminIds || {});
	if (selectedIds.length === 0) {
		app.dialog.alert('Pilih minimal 1 data penjualan.');
		return;
	}

	var ids = [];
	selectedIds.forEach(function (pid) {
		var info = (window._penjualanItemCache && window._penjualanItemCache[pid]) || {};
		ids.push({
			penjualan_id: pid,
			client_nama: info.client_nama || '',
			nama_kota: info.nama_kota || '',
			dt_record: info.dt_record || '',
			extra: info.extra || 0,
			jenis_penjualan: info.jenis_penjualan || '',
			penjualan_grandtotal: info.penjualan_grandtotal || 0,
			sisa: info.sisa || 0,
			packing: info.packing || ''
		});
	});

	var firstInfo = ids[0];
	var header_koper = 'KOPERINDO';
	var client_nama_raw = firstInfo.client_nama;
	var client_nama_clean = client_nama_raw
		.replace(/PT\. /g,'').replace(/PT/g,'')
		.replace(/CV\. /g,'').replace(/CV/g,'')
		.replace(/UD\. /g,'').replace(/UD/g,'').trim();
	var client_kota = firstInfo.nama_kota;
	var no_invoice  = moment().format('DDMMYY');

	app.dialog.preloader('Membuat Invoice Gabungan...');

	var allPromises = ids.map(function (info) {
		return jQuery.ajax({
			type: 'POST',
			url: BASE_API + '/get-penjualan-detail-performa-manager',
			dataType: 'JSON',
			data: {
				karyawan_id: 'empty',
				penjualan_id: info.penjualan_id,
				jenis_penjualan: info.jenis_penjualan
			}
		}).then(function (data) {
			return { info: info, data: data };
		});
	});

	Promise.all(allPromises).then(function (results) {

		var grand_total_sum  = 0;
		var total_dp_sum     = 0;
		var total_ongkir_sum = 0;
		var total_qty_sum    = 0;
		var total_sisa_sum   = 0;

		function hitungDpValidated(d0) {
			var total = 0;
			['1','2','3','4','5','6','7','8','9','10'].forEach(function(n) {
				if (d0['valid_cs_'+n] == 1 && d0['pembayaran_'+n] != null) {
					total += parseFloat(d0['pembayaran_'+n]);
				}
			});
			return total;
		}

		results.forEach(function(r) {
			if (r.data.data && r.data.data.length > 0) {
				var dp = hitungDpValidated(r.data.data[0]);
				total_dp_sum += dp;
				total_ongkir_sum += parseFloat(r.data.data[0].ongkir || 0);
				r.data.data.forEach(function(val) {
					total_qty_sum   += parseFloat(val.penjualan_qty || 0);
					grand_total_sum += parseFloat(val.penjualan_detail_grandtotal || 0);
				});
			}
		});
		total_sisa_sum = grand_total_sum + total_ongkir_sum - total_dp_sum;

		var is_lunas = (total_sisa_sum <= 0);
		var lunas_stamp_html = is_lunas
			? '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url(\'img/logo/lunas.jpg\');background-position:center;background-size:45% auto;background-repeat:no-repeat;opacity:0.5;z-index:0;pointer-events:none;"></div>'
			: '';

		var packingLabels = { polos:'Polos', plastik:'Plastik', kardus:'Kardus' };
		var packing0 = (results[0].data.data && results[0].data.data[0]) ? (results[0].data.data[0].packing || '') : '';
		var packing_label = (packing0 && packing0 !== '0' && packing0 !== '')
			? 'Packing ' + (packingLabels[packing0] || packing0.charAt(0).toUpperCase() + packing0.slice(1))
			: 'Packing finishing plastic';

		var kopHeader = '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:0px; font-family: \'Times New Roman\', Times, serif;">'
			+ '<tr>'
			+ '<td width="170" align="center" valign="middle" style="padding:5px 8px;">'
			+ '<img src="img/logo/logo-koperindo-invoice.png" width="150" height="100" onerror="this.style.display=\'none\'">'
			+ '</td>'
			+ '<td align="center" valign="middle" style="padding:5px 80px 5px 5px;">'
			+ '<div style="font-size:32px; font-weight:bold; color:#000000; letter-spacing:3px; margin-bottom:-2px;">KOPER INDONESIA</div>'
			+ '<div style="font-size:16px; color:#000000; font-weight:bold; line-height:1.1;">'
			+ 'Permata blok R3 No.32 - 39, Kludan, Kec. Tanggulangin,<br>'
			+ 'Kabupaten Sidoarjo, Jawa Timur 61272'
			+ '</div>'
			+ '<div style="font-size:16px; font-weight:bold;"><a href="http://www.koperindo.id" style="color:#0000FF; text-decoration:underline;">www.koperindo.id</a></div>'
			+ '</td>'
			+ '</tr>'
			+ '</table>'
			+ '<div style="border-top:3.5px solid #000000; margin:4px 0 4px 0;"></div>';

		var TH = 'style="border:1px solid #000;padding:6px 6px;font-weight:700;background:rgba(242,242,242,0.3);color:#000;text-align:center;white-space:nowrap;letter-spacing:0.5px;font-size:12px;"';
		var NUM_FONT = "font-size:12px;font-weight:500;";

		var inv = '';
		inv += '<div id="invoice-gabungan-print-area" style="background-color:#fff;color:#000;font-family:\'Segoe UI\',\'Helvetica Neue\',Arial,sans-serif;font-size:12px;padding:16px 20px;position:relative;">';
		inv += lunas_stamp_html;
		inv += '<div style="position:relative;z-index:1;">';
		inv += kopHeader;
		inv += '<div style="text-align:center;font-size:26px;font-weight:700;letter-spacing:5px;text-decoration:underline;margin:10px 20px 10px 120px;">INVOICE</div>';

		inv += '<table width="100%" style="border-collapse:collapse;margin-bottom:10px;font-size:14px;">';
		inv += '<tr>';
		inv += '  <td style="padding:2px 0;vertical-align:top;font-size:14px;">Kepada Yth : <b style="font-size:15px;">' + client_nama_clean + '</b></td>';
		inv += '  <td style="padding:2px 0;text-align:right;vertical-align:top;font-size:16px;">No. Invoice : <b style="font-size:16px;">' + no_invoice + '</b></td>';
		inv += '</tr>';
		inv += '<tr>';
		inv += '  <td style="padding:1px 0 0 78px;font-size:14px;">' + client_kota + '</td>';
		inv += '  <td style="padding:1px 0;">&nbsp;</td>';
		inv += '</tr>';
		inv += '</table>';

		inv += '<table width="100%" style="border-collapse:collapse;table-layout:fixed;font-size:12px;background:transparent;">';
		inv += '<colgroup><col style="width:4%"><col style="width:12%"><col style="width:9%"><col style="width:14%"><col style="width:9%"><col style="width:18%"><col style="width:7%"><col style="width:11%"><col style="width:16%"></colgroup>';
		inv += '<thead><tr>';
		inv += '  <th ' + TH + '>NO</th><th ' + TH + '>TANGGAL</th><th ' + TH + '>SPK</th>';
		inv += '  <th ' + TH + '>PERUSAHAAN</th><th ' + TH + '>SJ</th><th ' + TH + '>JENIS</th>';
		inv += '  <th ' + TH + '>QTY</th><th ' + TH + '>HARGA</th><th ' + TH + '>TOTAL</th>';
		inv += '</tr></thead><tbody>';

		var no_row = 0;
		var groups = [];
		results.forEach(function(r) {
			var info = r.info;
			var data = r.data;
			if (!data.data || data.data.length === 0) return;
			no_row++;
			groups.push({
				pid: info.penjualan_id,
				grp: no_row,
				spk: info.penjualan_id.replace(/INV_/g,'').replace(/^0+/,''),
				tgl: moment(info.dt_record).format('DD.MM.YYYY'),
				perusahaan: info.client_nama || '',
				items: data.data,
				sj_list: (data.no_surat_jalan_list && data.no_surat_jalan_list.length > 0) ? data.no_surat_jalan_list : []
			});
		});

		var total_groups = groups.length;
		groups.forEach(function(grp, g_idx) {
			var items = grp.items;
			var n = items.length;
			var zebra = (grp.grp % 2 === 0) ? 'background:rgba(247,249,252,0.3);' : '';
			var is_last_grp = (g_idx === total_groups - 1);
			var span_style = 'border-left:1px solid #000;border-right:1px solid #000;border-top:1px solid #000;'
				+ (is_last_grp ? 'border-bottom:1px solid #000;' : '')
				+ 'padding:6px 7px;vertical-align:middle;text-align:center;' + zebra;

			items.forEach(function(val, i_val) {
				var is_first = (i_val === 0);
				var is_last_item = (i_val === n - 1);
				var is_very_last = is_last_grp && is_last_item;
				var jenis    = val.penjualan_jenis || '';
				if (jenis === 'LAINNYA') jenis = val.keterangan || '';
				var qty      = parseFloat(val.penjualan_qty || 0);
				var harga    = parseFloat(val.penjualan_harga || 0);
				var subtotal = parseFloat(val.penjualan_detail_grandtotal || 0);
				var bt = is_first ? 'border-top:1px solid #000;' : 'border-top:1px dashed #bbb;';
				var bb = is_very_last ? 'border-bottom:1px solid #000;' : '';
				var item_style = 'border-left:1px solid #000;border-right:1px solid #000;padding:6px 6px;vertical-align:middle;' + bt + bb + zebra;
				var fwrap = 'display:flex;align-items:center;min-height:28px;width:100%;padding:4px 7px;box-sizing:border-box;';
				var fcspan = 'display:block;width:100%;text-align:center;';
				var flspan = 'display:block;width:100%;text-align:left;';

				inv += '<tr>';
				if (is_first) {
					inv += '<td rowspan="' + n + '" style="' + span_style + 'font-size:12px;font-weight:500;padding:0;"><div style="' + fwrap + 'justify-content:center;"><span style="' + fcspan + '">' + grp.grp + '</span></div></td>';
					inv += '<td rowspan="' + n + '" style="' + span_style + NUM_FONT + 'padding:0;"><div style="' + fwrap + 'justify-content:center;"><span style="' + fcspan + '">' + grp.tgl + '</span></div></td>';
					inv += '<td rowspan="' + n + '" style="' + span_style + NUM_FONT + 'padding:0;"><div style="' + fwrap + 'justify-content:center;"><span style="' + fcspan + '">' + grp.spk + '</span></div></td>';
					inv += '<td rowspan="' + n + '" style="' + span_style + 'font-size:11px;font-weight:500;text-align:left;padding:0;"><div style="' + fwrap + '"><span style="' + flspan + '">' + grp.perusahaan + '</span></div></td>';
					var sj_content = (grp.sj_list && grp.sj_list.length > 0)
						? grp.sj_list.map(function(sj) { return '<span style="display:block;width:100%;text-align:center;line-height:1.3;">' + sj + '</span>'; }).join('')
						: '<span style="' + fcspan + '">-</span>';
					inv += '<td rowspan="' + n + '" style="' + span_style + 'font-size:11px;font-weight:500;padding:0;"><div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:28px;width:100%;padding:4px 5px;box-sizing:border-box;">' + sj_content + '</div></td>';
				}
				inv += '<td style="' + item_style + 'text-align:left;font-size:12px;font-weight:500;">' + jenis + '</td>';
				inv += '<td style="' + item_style + 'text-align:center;' + NUM_FONT + '">' + qty + '</td>';
				inv += '<td style="' + item_style + 'text-align:right;' + NUM_FONT + '">' + number_format(harga) + '</td>';
				inv += '<td style="' + item_style + 'text-align:right;' + NUM_FONT + '">' + number_format(subtotal) + '</td>';
				inv += '</tr>';
			});
		});

		function sumRow(label, qty_cell, amt) {
			var r = '<tr>';
			r += '<td colspan="5" style="border:none;padding:0;"></td>';
			if (qty_cell !== null) {
				r += '<td style="border-left:1px solid #000;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 10px;font-weight:700;text-align:right;font-size:12px;">' + label + '</td>';
				r += '<td colspan="2" style="border-left:1px solid #000;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 4px;font-weight:700;text-align:center;white-space:nowrap;font-size:12px;">' + qty_cell + '</td>';
			} else {
				r += '<td colspan="3" style="border-left:1px solid #000;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 10px;font-weight:700;text-align:right;font-size:12px;">' + label + '</td>';
			}
			r += '<td style="border:1px solid #000;padding:6px 10px;font-weight:700;text-align:right;background:rgba(149,179,215,0.3);color:#000;font-size:12px;">Rp&nbsp;&nbsp;' + number_format(amt) + '</td>';
			r += '</tr>';
			return r;
		}

		inv += sumRow('JUMLAH', total_qty_sum + ' SET', grand_total_sum);
		if (total_dp_sum > 0) inv += sumRow('DP', null, total_dp_sum);
		if (total_ongkir_sum > 0) inv += sumRow('ONGKIR', null, total_ongkir_sum);
		inv += sumRow('SISA PEMBAYARAN', null, Math.max(total_sisa_sum, 0));
		inv += '</tbody></table>';

		var d0 = (results[0].data.data && results[0].data.data[0]) ? results[0].data.data[0] : {};
		var bankHtml = '<div style="height:22px;line-height:22px;font-size:14px;font-weight:700;text-align:left;">Rekening&nbsp;&nbsp;:</div>';
		bankHtml += '<table style="border-collapse:collapse;font-size:14px;border:none;">';
		if (d0.bank_1_id) {
			var bankId = parseInt(d0.bank_1_id);
			if (d0.bank_1 === 'Mandiri Owner') bankId = 6;
			var bk = (typeof getBankInfoById === 'function') ? getBankInfoById(bankId) : null;
			if (bk) {
				bankHtml += '<tr><td style="border:none;padding:5px 8px;background:#d8d8d8;font-weight:700;font-size:14px;">' + bk.nama + '</td><td style="border:none;padding:5px 6px;background:#d8d8d8;font-size:14px;">:</td><td style="border:none;padding:5px 8px;background:#d8d8d8;font-size:14px;">' + bk.rekening + ' a.n ' + bk.atas_nama + '</td></tr>';
			}
		} else {
			var bc = 'border:none;padding:5px 8px;background:#d8d8d8;font-size:14px;';
			bankHtml += '<tr><td style="' + bc + 'font-weight:700;">BCA</td><td style="' + bc + 'padding:5px 6px;">:</td><td style="' + bc + '">0183129551 &nbsp;an. SUTONO</td></tr>';
			bankHtml += '<tr><td style="' + bc + 'font-weight:700;">Mandiri</td><td style="' + bc + 'padding:5px 6px;">:</td><td style="' + bc + '">141 000 &nbsp;225 5818 &nbsp;a.n SUTONO</td></tr>';
		}
		bankHtml += '</table>';

		inv += '<div style="page-break-inside:avoid;break-inside:avoid;">';
		inv += '<table width="100%" style="border-collapse:collapse;margin-top:18px;font-size:12px;">';
		inv += '<tr>';
		inv += '  <td width="48%" valign="top">' + bankHtml + '</td>';
		inv += '  <td width="22%" align="center" valign="top"><div style="height:22px;line-height:22px;font-size:14px;font-weight:700;visibility:hidden;">QR</div>{{QR_SLOT}}</td>';
		inv += '  <td width="30%" align="center" valign="top">';
		inv += '    <div style="height:22px;line-height:22px;font-size:14px;font-weight:700;">HORMAT KAMI</div>';
		inv += '    <img src="img/logo/invoiceLogo.png" width="90" height="90" style="display:block;margin:0 auto;">';
		inv += '    <b style="font-size:13px;font-weight:700;">' + header_koper + '</b>';
		inv += '  </td>';
		inv += '</tr></table>';
		inv += '</div>';
		inv += '</div></div>';

		var qrPayload = {
			tipe: 'gabungan',
			no_invoice: no_invoice,
			spk: null,
			client_nama: client_nama_clean,
			client_kota: client_kota,
			data: JSON.stringify({
				jumlah: grand_total_sum,
				dp: total_dp_sum,
				sisa: Math.max(total_sisa_sum, 0),
				status_lunas: is_lunas
			})
		};
		simpanInvoiceVerifikasiDanBuatQr(qrPayload).then(function(qrResult) {
		var qrHtml = qrResult.qrImg
			? ('<img src="' + qrResult.qrImg + '" width="80" height="80" style="display:block;margin:0 auto;vertical-align:top;"><div style="font-size:9px;margin-top:4px;">Scan untuk verifikasi keaslian</div>')
			: '';
		inv = inv.replace('{{QR_SLOT}}', qrHtml);

		// Kumpulkan semua SJ nos dan pids dari groups untuk lampiran
		var all_sj_nos_gabungan = [];
		var all_pids_gabungan = [];
		groups.forEach(function(grp) {
			if (all_pids_gabungan.indexOf(grp.pid) === -1) all_pids_gabungan.push(grp.pid);
			grp.sj_list.forEach(function(sj_no) {
				if (all_sj_nos_gabungan.indexOf(sj_no) === -1) all_sj_nos_gabungan.push(sj_no);
			});
		});

		function renderGabunganPDF(invHtml) {
			var printDate = moment().format('DD/MM/YYYY HH:mm');
			var container = document.getElementById('invoice-gabungan-container');
			if (!container) {
				container = document.createElement('div');
				container.id = 'invoice-gabungan-container';
				container.style.cssText = 'position:fixed;left:0;top:0;background:white;width:210mm;z-index:-1;opacity:0;';
				document.body.appendChild(container);
			}
			container.innerHTML = invHtml;
			app.dialog.close();

			var styleOverride = document.createElement('style');
			styleOverride.id = 'pdf-gabungan-style-override';
			styleOverride.innerHTML = '#invoice-gabungan-print-area{background-color:#fff!important;color:#000!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
				+ '#invoice-gabungan-print-area td,#invoice-gabungan-print-area th{color:#000!important;}'
				+ '#invoice-gabungan-print-area thead{display:table-header-group;}'
				+ '#invoice-gabungan-print-area tr{page-break-inside:avoid;}';
			document.head.appendChild(styleOverride);

			fetchImgsAsBase64(container).then(function() {
			var opt = {
				margin: [10, 10, 18, 10],
				filename: 'Invoice_Gabungan_' + moment().format('DDMMYYYY') + '.pdf',
				image: { type: 'jpeg', quality: 1 },
				html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false },
				jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
				pagebreak: { mode: ['css', 'legacy'] }
			};

			function buildFooterCanvas(pageNum, totalPages, cb) {
				var W = 794, H = 26;
				var canvas = document.createElement('canvas');
				canvas.width = W * 2; canvas.height = H * 2;
				var ctx = canvas.getContext('2d');
				ctx.scale(2, 2);
				ctx.fillStyle = '#D4621A'; ctx.fillRect(0, 0, W, 2);
				ctx.fillStyle = '#3D3D3D'; ctx.fillRect(0, 2, W, H - 2);
				var chevX = W - 175;
				ctx.beginPath(); ctx.moveTo(chevX + 18, 2); ctx.lineTo(W, 2); ctx.lineTo(W, H); ctx.lineTo(chevX, H); ctx.closePath(); ctx.fillStyle = '#C85A14'; ctx.fill();
				ctx.beginPath(); ctx.moveTo(chevX + 18, 2); ctx.lineTo(chevX + 95, 2); ctx.lineTo(chevX + 77, H); ctx.lineTo(chevX, H); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
				ctx.beginPath(); ctx.moveTo(chevX + 18, 2); ctx.lineTo(chevX, H); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
				var ty = H / 2 + 4;
				ctx.font = '9.5px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('Dicetak: ', 10, ty);
				var dw = ctx.measureText('Dicetak: ').width;
				ctx.font = 'bold 9.5px "Segoe UI", Arial, sans-serif'; ctx.fillText(printDate, 10 + dw, ty);
				var midLabel = 'Halaman ' + pageNum + ' / ' + totalPages;
				ctx.font = '9.5px "Segoe UI", Arial, sans-serif';
				var mw = ctx.measureText(midLabel).width;
				ctx.fillText(midLabel, (W - mw) / 2, ty);
				ctx.font = 'bold 9.5px "Segoe UI", Arial, sans-serif'; ctx.fillText('KOPER ', W - 122, ty); ctx.fillText('INDONESIA', W - 84, ty);
				cb(canvas);
			}

			function buildRepeatHeaderCanvas(cb) {
				var W = 794, H = 130;
				var canvas = document.createElement('canvas');
				canvas.width = W * 2; canvas.height = H * 2;
				var ctx = canvas.getContext('2d');
				ctx.scale(2, 2);
				function draw(logoImg) {
					ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
					if (logoImg) ctx.drawImage(logoImg, 8, 5, 150, 100);
					var ix = 170, iw = W - 170 - 80;
					ctx.font = 'bold 32px "Times New Roman", Times, serif'; ctx.fillStyle = '#000000';
					try { ctx.letterSpacing = '3px'; } catch(e) {}
					var ktx = 'KOPER INDONESIA'; ctx.fillText(ktx, ix + (iw - ctx.measureText(ktx).width) / 2, 36);
					try { ctx.letterSpacing = '0px'; } catch(e) {}
					ctx.font = 'bold 16px "Times New Roman", Times, serif'; ctx.fillStyle = '#000000';
					var a1 = 'Permata blok R3 No.32 - 39, Kludan, Kec. Tanggulangin,';
					var a2 = 'Kabupaten Sidoarjo, Jawa Timur 61272';
					ctx.fillText(a1, ix + (iw - ctx.measureText(a1).width) / 2, 60);
					ctx.fillText(a2, ix + (iw - ctx.measureText(a2).width) / 2, 80);
					ctx.font = 'bold 16px "Times New Roman", Times, serif'; ctx.fillStyle = '#0000FF';
					var wt = 'www.koperindo.id';
					var wx = ix + (iw - ctx.measureText(wt).width) / 2;
					ctx.fillText(wt, wx, 100);
					ctx.beginPath(); ctx.moveTo(wx, 102); ctx.lineTo(wx + ctx.measureText(wt).width, 102); ctx.strokeStyle = '#0000FF'; ctx.lineWidth = 1; ctx.stroke();
					ctx.beginPath(); ctx.moveTo(0, 114); ctx.lineTo(W, 114); ctx.strokeStyle = '#000000'; ctx.lineWidth = 3.5; ctx.stroke();
					cb(canvas);
				}
				var img = new Image();
				img.onload = function() { draw(img); };
				img.onerror = function() { draw(null); };
				img.src = 'img/logo/logo-koperindo-invoice.png';
			}

			buildRepeatHeaderCanvas(function(repeatHeaderCanvas) {
				html2pdf().set(opt).from(document.getElementById('invoice-gabungan-print-area')).toPdf().get('pdf').then(function (pdf) {
					var totalPages = pdf.internal.getNumberOfPages();
					var pageW = pdf.internal.pageSize.getWidth();
					var pageH = pdf.internal.pageSize.getHeight();
					var imgW  = pageW - 20;
					var hH    = imgW * (130 / 794);
					for (var p = 1; p <= totalPages; p++) {
						(function(pn) {
							buildFooterCanvas(pn, totalPages, function(fc) {
								pdf.setPage(pn);
								pdf.addImage(fc.toDataURL('image/png'), 'PNG', 10, pageH - 9, imgW, 6.5);
							});
						})(p);
					}
					if (repeatHeaderCanvas && totalPages > 1) {
						var hImgData = repeatHeaderCanvas.toDataURL('image/png');
						for (var p2 = 2; p2 <= totalPages; p2++) {
							pdf.setPage(p2);
							pdf.setFillColor(255, 255, 255);
							pdf.rect(10, 2, imgW, hH, 'F');
							pdf.addImage(hImgData, 'PNG', 10, 2, imgW, hH);
						}
					}
				}).save().then(function () {
					var el = document.getElementById('pdf-gabungan-style-override');
					if (el) el.remove();
					container.innerHTML = '';
					jQuery('.cb-download-sj-admin').prop('checked', false);
					window._selectedSjAdminIds = {};
					toggleFloatingDownloadSjAdmin();
				});
			});
			}); // end fetchImgsAsBase64
		} // end renderGabunganPDF

		if (all_sj_nos_gabungan.length > 0) {
			jQuery.ajax({
				type: 'POST',
				url: BASE_API + '/get-surat-jalan-pdf',
				dataType: 'JSON',
				data: { no_surat_jalan: all_sj_nos_gabungan, penjualan_id: all_pids_gabungan, id_history_invoice_sj: 0 },
				success: function(sjData) {
					var valid_foto = [];
					all_sj_nos_gabungan.forEach(function(sj_no) {
						if (sjData.data_sj && sjData.data_sj[sj_no] && sjData.data_sj[sj_no][0] && sjData.data_sj[sj_no][0].foto_surat_jalan) {
							valid_foto.push({ no: sj_no, foto: sjData.data_sj[sj_no][0].foto_surat_jalan });
						}
					});

					var cutIdx = inv.lastIndexOf('</div>');
					var fullInv = (cutIdx !== -1) ? inv.slice(0, cutIdx) : inv;

					var fotosPerPage = 4;
					for (var p = 0; p < valid_foto.length; p += fotosPerPage) {
						var end = Math.min(p + fotosPerPage, valid_foto.length);
						fullInv += '<div style="page-break-before:always;padding:16px 20px;background:#fff;">';
						fullInv += '<div style="font-size:13px;font-weight:700;margin-bottom:12px;border-bottom:2px solid #000;padding-bottom:6px;">LAMPIRAN SURAT JALAN</div>';
						fullInv += '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;">';
						for (var q = p; q < end; q++) {
							if ((q - p) % 2 === 0) fullInv += '<tr>';
							fullInv += '<td width="50%" align="center" valign="top" style="padding:6px;">';
							fullInv += '<div style="font-size:11px;font-weight:700;margin-bottom:4px;text-align:center;">' + valid_foto[q].no + '</div>';
							fullInv += '<img src="' + BASE_PATH_IMAGE_SURAT_JALAN + '/' + valid_foto[q].foto + '" class="foto-sj-pdf" crossorigin="anonymous" style="max-width:100%;max-height:360px;object-fit:contain;">';
							fullInv += '</td>';
							if ((q - p) % 2 === 1 || q === end - 1) {
								if (q === end - 1 && (q - p) % 2 === 0) fullInv += '<td width="50%"></td>';
								fullInv += '</tr>';
							}
						}
						fullInv += '</table></div>';
					}
					fullInv += '</div>';
					renderGabunganPDF(fullInv);
				},
				error: function() {
					renderGabunganPDF(inv);
				}
			});
		} else {
			renderGabunganPDF(inv);
		}

		}); // end simpanInvoiceVerifikasiDanBuatQr

	}).catch(function (err) {
		app.dialog.close();
		app.dialog.alert('Gagal mengambil data. Silakan coba lagi.');
		console.error('buatInvoiceGabunganSjAdmin error:', err);
	});
}