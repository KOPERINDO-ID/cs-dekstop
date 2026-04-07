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
		getSuratJalanCs(1);
	}, 1000);
}

function filterBulanSjAdmin() {
	getSuratJalanCs();
}

function resetGetSuratJalanCs() {
	jQuery('#perusahaan_penjualan_filter_admin').val('');
	getSuratJalanCs();
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

    var fotosPerPage = 2; // 2 foto per halaman, dalam 1 row
    for (var p = 0; p < valid_foto.length; p += fotosPerPage) {
        invoice_penjualan += `
<div style="page-break-before:always; padding-top:5px;">
${kopHeader}
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:20px; table-layout:fixed;">
    <tr>`;
        var end = Math.min(p + fotosPerPage, valid_foto.length);
        for (var q = p; q < end; q++) {
            invoice_penjualan += `
        <td width="50%" align="center" valign="top" style="padding:8px;">
            <img src="${BASE_PATH_IMAGE_SURAT_JALAN}/${valid_foto[q]}" class="foto-sj-pdf" style="max-width:100%; max-height:420px; object-fit:contain;">
        </td>`;
        }
        // Kalau jumlah foto ganjil, isi td kosong biar layout tetap 50/50
        if ((end - p) < fotosPerPage) {
            invoice_penjualan += `<td width="50%"></td>`;
        }
        invoice_penjualan += `
    </tr>
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
 * downloadTable
 * Menggunakan html2pdf untuk mengkonversi elemen HTML ke PDF A4 portrait.
 * Style override diterapkan agar background/warna muncul di PDF.
 */
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

	var fotoSJImages = element.querySelectorAll('img.foto-sj-pdf');
	fotoSJImages.forEach(function(img) {
		if (!img.crossOrigin) {
			img.crossOrigin = 'anonymous';
			// Force reload supaya request baru dikirim dengan CORS
			var originalSrc = img.src;
			img.src = '';
			img.src = originalSrc;
		}
	});

    // Tunggu semua gambar selesai load
    var images = element.querySelectorAll('img');
    var imgPromises = Array.from(images).map(function(img) {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(function(resolve) {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });

    Promise.all(imgPromises).then(function() {
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

function pilihTemplateHistory(no_surat_jalan, penjualan_id, tanggal, historyId) {
    app.dialog.create({
        title: 'Pilih Template Invoice',
        text: '',
        buttons: [
            {
                text: 'Template 1',
                onClick: function() {
                    downloadInvoiceAdminPdf(no_surat_jalan, penjualan_id, tanggal, historyId, 'table_download_history', 1);
                }
            },
            {
                text: 'Template 2',
                onClick: function() {
                    downloadInvoiceAdminPdf(no_surat_jalan, penjualan_id, tanggal, historyId, 'table_download_history', 2);
                }
            }
        ],
        verticalButtons: true
    }).open();
}

function downloadHistoryInvoicePopup() {
	var penjualan_value = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-history-invoice-surat-jalan",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$$('#detail_history_invoice_download_admin').html('');
		},
		success: function (data) {
			app.dialog.close();
			var no = 0;
			var penjualan_id = '';
			var id = '';
			var idx = '';
			$.each(data.data, function (i, item) {
				no++
				penjualan_value += '<tr>';
				penjualan_value += '	<td align="center" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + no + '</td>';
				penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + moment(item.tanggal_invoice_sj).format('DD-MMM-YYYY') + '</td>';
				penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">INV-' + item.id_history_invoice_sj + '</td>';
				penjualan_id = item.penjualan_id;
				id = penjualan_id.replaceAll("INV_", " ");
				idx = id.replaceAll(", ", ",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

				penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">INV ' + idx + '</td>';
				penjualan_value += '	<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.client_nama + '</td>';
				penjualan_value += '	<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
				penjualan_value += '   		<button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" onclick="pilihTemplateHistory(\'' + item.no_surat_jalan + '\',\'' + item.penjualan_id + '\',\'' + item.tanggal_invoice_sj + '\',\'' + item.id_history_invoice_sj + '\');">Download</button>';
				penjualan_value += '	</td>';
				penjualan_value += '</tr>';

			});

			$$('#detail_history_invoice_download_admin').html(penjualan_value);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
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

    var fotosPerPage = 2; // 2 foto per halaman, dalam 1 row
    for (var p = 0; p < valid_foto.length; p += fotosPerPage) {
        html += `
<div style="page-break-before:always; padding-top:5px;">
${kopHeader2}
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:20px; table-layout:fixed;">
    <tr>`;
        var end = Math.min(p + fotosPerPage, valid_foto.length);
        for (var q = p; q < end; q++) {
            html += `
        <td width="50%" align="center" valign="top" style="padding:8px;">
            <img src="${BASE_PATH_IMAGE_SURAT_JALAN}/${valid_foto[q]}" class="foto-sj-pdf" style="max-width:100%; max-height:420px; object-fit:contain;">
        </td>`;
        }
        // Kalau jumlah foto ganjil, isi td kosong biar layout tetap 50/50
        if ((end - p) < fotosPerPage) {
            html += `<td width="50%"></td>`;
        }
        html += `
    </tr>
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