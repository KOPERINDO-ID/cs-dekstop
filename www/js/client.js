function changeFilterMenu(menu) {
	if (localStorage.getItem("stat_log") == 1) {
		if (localStorage.getItem("menu_log") == 'new') {
			localStorage.setItem('menu', 'new');
			localStorage.setItem('api_menu', 'get-data-client-new');
			localStorage.setItem('eye_menu', 'get-data-client-new-hide');
			$(".newFilterMenu").addClass("bg-dark-gray-medium");
			$(".performaFilterMenu").removeClass("bg-dark-gray-medium");
			$(".salesFilterMenu").removeClass("bg-dark-gray-medium");
			$("#hide_prospek_icon").css("display", "inline")
			$("#label_kolom_new").html('New');
		} else if (localStorage.getItem("menu_log") == 'proforma') {
			localStorage.setItem('menu', 'proforma');
			localStorage.setItem('api_menu', 'get-data-client-proforma');
			$(".newFilterMenu").removeClass("bg-dark-gray-medium");
			$(".performaFilterMenu").addClass("bg-dark-gray-medium");
			$(".salesFilterMenu").removeClass("bg-dark-gray-medium");
			$("#hide_prospek_icon").css("display", "none")
		} else if (localStorage.getItem("menu_log") == 'sales') {
			localStorage.setItem('menu', 'sales');
			localStorage.setItem('api_menu', 'get-data-client-sales');
			localStorage.setItem('eye_menu', 'get-data-client-sales-hide');
			$(".newFilterMenu").removeClass("bg-dark-gray-medium");
			$(".performaFilterMenu").removeClass("bg-dark-gray-medium");
			$(".salesFilterMenu").addClass("bg-dark-gray-medium");
			$("#hide_prospek_icon").css("display", "none")
		} else if (localStorage.getItem("menu_log") == null) {
			localStorage.setItem('menu', 'sales');
			localStorage.setItem('api_menu', 'get-data-client-sales');
			localStorage.setItem('eye_menu', 'get-data-client-sales-hide');
			$(".newFilterMenu").removeClass("bg-dark-gray-medium");
			$(".performaFilterMenu").removeClass("bg-dark-gray-medium");
			$(".salesFilterMenu").addClass("bg-dark-gray-medium");
			$("#hide_prospek_icon").css("display", "none")
		}

		getDataClient();
		localStorage.removeItem("stat_log");
	} else if (localStorage.getItem("stat_log") == null) {
		if (menu == 'new') {
			localStorage.setItem('menu', 'new');
			localStorage.setItem('api_menu', 'get-data-client-new');
			localStorage.setItem('eye_menu', 'get-data-client-new-hide');
			$(".newFilterMenu").addClass("bg-dark-gray-medium");
			$(".performaFilterMenu").removeClass("bg-dark-gray-medium");
			$(".salesFilterMenu").removeClass("bg-dark-gray-medium");
			$("#hide_prospek_icon").css("display", "inline")
			$("#label_kolom_new").html('New');
		} else if (menu == 'proforma') {
			localStorage.setItem('menu', 'proforma');
			localStorage.setItem('api_menu', 'get-data-client-proforma');
			$(".newFilterMenu").removeClass("bg-dark-gray-medium");
			$(".performaFilterMenu").addClass("bg-dark-gray-medium");
			$(".salesFilterMenu").removeClass("bg-dark-gray-medium");
			$("#hide_prospek_icon").css("display", "none")
		} else if (menu == 'sales') {
			localStorage.setItem('menu', 'sales');
			localStorage.setItem('api_menu', 'get-data-client-sales');
			localStorage.setItem('eye_menu', 'get-data-client-sales-hide');
			$(".newFilterMenu").removeClass("bg-dark-gray-medium");
			$(".performaFilterMenu").removeClass("bg-dark-gray-medium");
			$(".salesFilterMenu").addClass("bg-dark-gray-medium");
			$("#hide_prospek_icon").css("display", "none")
		} else if (menu == null) {
			localStorage.setItem('menu', 'sales');
			localStorage.setItem('api_menu', 'get-data-client-sales');
			localStorage.setItem('eye_menu', 'get-data-client-sales-hide');
			$(".newFilterMenu").removeClass("bg-dark-gray-medium");
			$(".performaFilterMenu").removeClass("bg-dark-gray-medium");
			$(".salesFilterMenu").addClass("bg-dark-gray-medium");
			$("#hide_prospek_icon").css("display", "none")
		}

		getDataClient();
	}
	console.log(localStorage.getItem("stat_log"));
	console.log(localStorage.getItem("menu"));
	console.log(localStorage.getItem("menu_log"));
	getDataClientHead();
}

function activeEye() {
	if (localStorage.getItem('show_eye') == 'aktif') {
		localStorage.setItem('show_eye', 'tidak_aktif');
		$$('#perusahaan_broadcast').val('');
	} else {
		localStorage.setItem('show_eye', 'aktif');
		$$('#perusahaan_broadcast').val('');
	}
	showEyeLocalstorage()
}

function showEyeLocalstorage() {
	console.log(localStorage.getItem('show_eye'));
	console.log(localStorage.getItem('menu'));
	if (localStorage.getItem('show_eye') == 'tidak_aktif') {
		$$("#change-color-eye").css("color", "white");
		if (localStorage.getItem('menu') == 'new') {
			getDataClient();
		} else if (localStorage.getItem('menu') == 'proforma') {
			getDataClient();
		} else if (localStorage.getItem('menu') == 'sales') {
			getDataClient();
		} else if (localStorage.getItem('menu') == null) {
			getDataClient();
		}
	} else if (localStorage.getItem('show_eye') == 'aktif') {
		$$("#change-color-eye").css("color", "red");
		if (localStorage.getItem('menu') == 'new') {
			getDataClientHide();
		} else if (localStorage.getItem('menu') == 'proforma') {
			getDataClientHide();
		} else if (localStorage.getItem('menu') == 'sales') {
			getDataClientHide();
		} else if (localStorage.getItem('menu') == null) {
			getDataClientHide();
		}

	}
}

var delayTimer;
function doSearchByPerusahaan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		showEyeLocalstorage();
	}, 1000);
}

function zoom_view(src) {
	var gambar_zoom = src;
	var myPhotoBrowserPopupDark = app.photoBrowser.create({
		photos: [
			'' + gambar_zoom + ''
		],
		theme: 'dark',
		type: 'popup'
	});
	myPhotoBrowserPopupDark.open();
}
// End COnfig


function toggle(source) {
	checkboxes = document.getElementsByClassName('checked_all');
	for (var i = 0, n = checkboxes.length; i < n; i++) {
		checkboxes[i].checked = source.checked;
	}
}

function reloadData() {
	getDataClient();
}

function getDataClient() {

	if (jQuery('#perusahaan_broadcast').val() == '' || jQuery('#perusahaan_broadcast').val() == null) {
		perusahaan_broadcast_value = "empty";
	} else {
		perusahaan_broadcast_value = jQuery('#perusahaan_broadcast').val();
	}

	if (jQuery('#filter_bulan').val() == '0' || jQuery('#filter_bulan').val() == null) {
		bulan_value = "empty";
	} else {
		bulan_value = jQuery('#filter_bulan').val();
	}

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/" + localStorage.getItem("api_menu"),
		dataType: 'JSON',
		data: {
			perusahaan_broadcast_value: perusahaan_broadcast_value,
			bulan_value: bulan_value,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var data_client = '';

			if (data.data.length != 0) {
				var no = 0;
				if (bulan_value != 'empty') {

					jQuery.each(data.data, function (i, val) {
						var status_client = '';
						if (val.bulan_selisih == 0 || val.bulan_selisih == null) {
							status_client = 'new';
						} else if (val.bulan_selisih > 2) {
							status_client = 'non_aktif';
						} else if (val.bulan_selisih > 0 && val.bulan_selisih <= 2) {
							status_client = 'aktif';
						}


						var warna_status = '';
						if (data.client_log[val.client_id] != null) {
							if (data.client_log[val.client_id].status_broadcast == 'F' || data.client_log[val.client_id].status_broadcast == 'A' || data.client_log[val.client_id].status_broadcast == null) {
								warna_status = 'card-color-red';
							} else if (data.client_log[val.client_id].status_broadcast == 'S') {
								warna_status = 'btn-color-greenWhite';
							} else if (data.client_log[val.client_id].status_broadcast == 'D' || data.client_log[val.client_id].status_broadcast == 'R') {
								warna_status = 'btn-color-blueWhite';
							}
						} else {
							warna_status = '';
						}

						no++
						data_client += '<tr class="' + warna_status + '">';
						data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + no + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_nama + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_kota + ' <input style="width: 100%;" type="hidden" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
						// data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"><input style="width: 100%;" type="text" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
						data_client += '	 <td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						data_client += '		<center><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".data-client-popup" onclick="detailsClientBroadcast(\'' + val.client_id + '\',\'' + val.client_nama + '\',\'' + val.client_cp + '\',\'' + val.client_kota + '\',\'' + val.client_cp_posisi + '\',\'' + val.client_telp + '\',\'' + val.client_alamat + '\')" style="width:100px;">Details</a></center>';
						data_client += '	 </td>';
						// data_client += '	 <td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						// data_client += '		<a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" href="/log" onclick="localClientID(' + val.client_id + ',1)">Log</a>';
						// data_client += '	 </td>';
						// data_client += '	<td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						// data_client += '  		<label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateHideBroadcast(\'' + val.client_id + '\',1);">eye_slash</i></label>';
						// data_client += '	</td>';
						// data_client += '	 <td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						// data_client += '		<input type="hidden"  name="check_client_' + no + '" value="0" >';
						// data_client += '		<input type="checkbox" value="1" id="check_client_' + no + '" name="c" class="checked_all check_wa">';
						// data_client += '		<input value="' + val.client_id + '" type="hidden" id="client_check_client_' + no + '" name="client_check_client_' + no + '"';
						// data_client += '	 </td>';
						data_client += '</tr>';

					});

				} else {
					jQuery.each(data.data, function (i, val) {
						no++
						var status_client = '';
						if (val.bulan_selisih == 0 || val.bulan_selisih == null) {
							status_client = 'new';
						} else if (val.bulan_selisih > 2) {
							status_client = 'non_aktif';
						} else if (val.bulan_selisih > 0 && val.bulan_selisih <= 2) {
							status_client = 'aktif';
						}

						var warna_status = '';
						if (data.client_log[val.client_id] != null) {
							if (data.client_log[val.client_id].status_broadcast == 'F' || data.client_log[val.client_id].status_broadcast == 'A' || data.client_log[val.client_id].status_broadcast == null) {
								warna_status = 'card-color-red';
							} else if (data.client_log[val.client_id].status_broadcast == 'S') {
								warna_status = 'btn-color-greenWhite';
							} else if (data.client_log[val.client_id].status_broadcast == 'D' || data.client_log[val.client_id].status_broadcast == 'R') {
								warna_status = 'btn-color-blueWhite';
							}
						} else {
							warna_status = '';
						}

						data_client += '<tr class="' + warna_status + '">';
						data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + no + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_nama + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_kota + ' <input style="width: 100%;" type="hidden" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
						// data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"><input style="width: 100%;" type="text" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
						data_client += '	 <td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						data_client += '		<center><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".data-client-popup" onclick="detailsClientBroadcast(\'' + val.client_id + '\',\'' + val.client_nama + '\',\'' + val.client_cp + '\',\'' + val.client_kota + '\',\'' + val.client_cp_posisi + '\',\'' + val.client_telp + '\',\'' + val.client_alamat + '\')" style="width:100px;">Details</a></center>';
						data_client += '	 </td>';
						// data_client += '	 <td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						// data_client += '		<a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" href="/log" onclick="localClientID(' + val.client_id + ',1)">Log</a>';
						// data_client += '	 </td>';
						// data_client += '	<td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						// data_client += '  		<label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateHideBroadcast(\'' + val.client_id + '\',1);">eye_slash</i></label>';
						// data_client += '	</td>';
						// data_client += '	 <td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						// data_client += '		<input type="hidden"  name="check_client_' + no + '" value="0" >';
						// data_client += '		<input type="checkbox" value="1" id="check_client_' + no + '" name="c" class="checked_all check_wa">';
						// data_client += '		<input value="' + val.client_id + '" type="hidden" id="client_check_client_' + no + '" name="client_check_client_' + no + '"';
						// data_client += '	 </td>';
						data_client += '</tr>';
					});

				}


				jQuery("#tabel_data_client").html(data_client);
				jQuery("#total-client-broadcast").html(no);
			} else {
				jQuery("#tabel_data_client").html('<tr><td colspan="6" align="center">Tidak Ada Data</td></tr>');
				jQuery("#total-client-broadcast").html('0');
			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function getDataClientHide() {

	if (jQuery('#perusahaan_broadcast').val() == '' || jQuery('#perusahaan_broadcast').val() == null) {
		perusahaan_broadcast_value = "empty";
	} else {
		perusahaan_broadcast_value = jQuery('#perusahaan_broadcast').val();
	}

	if (jQuery('#filter_bulan').val() == '0' || jQuery('#filter_bulan').val() == null) {
		bulan_value = "empty";
	} else {
		bulan_value = jQuery('#filter_bulan').val();
	}

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/" + localStorage.getItem("eye_menu"),
		dataType: 'JSON',
		data: {
			perusahaan_broadcast_value: perusahaan_broadcast_value,
			bulan_value: bulan_value,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			var data_client = '';

			if (data.data.length != 0) {
				var no = 0;
				if (bulan_value != 'empty') {

					jQuery.each(data.data, function (i, val) {
						var status_client = '';
						if (val.bulan_selisih == 0 || val.bulan_selisih == null) {
							status_client = 'new';
						} else if (val.bulan_selisih > 2) {
							status_client = 'non_aktif';
						} else if (val.bulan_selisih > 0 && val.bulan_selisih <= 2) {
							status_client = 'aktif';
						}

						var warna_status = '';
						if (data.client_log[val.client_id] != null) {
							if (data.client_log[val.client_id].status_broadcast == 'F' || data.client_log[val.client_id].status_broadcast == 'A' || data.client_log[val.client_id].status_broadcast == null) {
								warna_status = 'card-color-red';
							} else if (data.client_log[val.client_id].status_broadcast == 'S') {
								warna_status = 'btn-color-greenWhite';
							} else if (data.client_log[val.client_id].status_broadcast == 'D' || data.client_log[val.client_id].status_broadcast == 'R') {
								warna_status = 'btn-color-blueWhite';
							}
						} else {
							warna_status = '';
						}

						no++
						data_client += '<tr class="' + warna_status + '">';
						data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + no + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_nama + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_kota + ' <input style="width: 100%;" type="hidden" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
						// data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"><input style="width: 100%;" type="text" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
						data_client += '	 <td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						data_client += '		<a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" href="/log" onclick="localClientID(' + val.client_id + ',1)">Log</a>';
						data_client += '	 </td>';
						data_client += '	<td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						data_client += '  		<label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateHideBroadcast(\'' + val.client_id + '\',0);">eye_slash</i></label>';
						data_client += '	</td>';
						data_client += '	 <td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						data_client += '		<input type="hidden"  name="check_client_' + no + '" value="0" >';
						data_client += '		<input type="checkbox" value="1" id="check_client_' + no + '" name="c" class="checked_all check_wa">';
						data_client += '		<input value="' + val.client_id + '" type="hidden" id="client_check_client_' + no + '" name="client_check_client_' + no + '"';
						data_client += '	 </td>';
						data_client += '</tr>';

					});


				} else {
					jQuery.each(data.data, function (i, val) {
						no++
						var status_client = '';
						if (val.bulan_selisih == 0 || val.bulan_selisih == null) {
							status_client = 'new';
						} else if (val.bulan_selisih > 2) {
							status_client = 'non_aktif';
						} else if (val.bulan_selisih > 0 && val.bulan_selisih <= 2) {
							status_client = 'aktif';
						}

						var warna_status = '';
						if (data.client_log[val.client_id] != null) {
							if (data.client_log[val.client_id].status_broadcast == 'F' || data.client_log[val.client_id].status_broadcast == 'A' || data.client_log[val.client_id].status_broadcast == null) {
								warna_status = 'card-color-red';
							} else if (data.client_log[val.client_id].status_broadcast == 'S') {
								warna_status = 'btn-color-greenWhite';
							} else if (data.client_log[val.client_id].status_broadcast == 'D' || data.client_log[val.client_id].status_broadcast == 'R') {
								warna_status = 'btn-color-blueWhite';
							}
						} else {
							warna_status = '';
						}

						data_client += '<tr class="' + warna_status + '">';
						data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + no + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_nama + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_kota + ' <input style="width: 100%;" type="hidden" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
						// data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"><input style="width: 100%;" type="text" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
						data_client += '	 <td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						data_client += '		<a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" href="/log" onclick="localClientID(' + val.client_id + ',1)">Log</a>';
						data_client += '	 </td>';
						data_client += '	<td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						data_client += '  		<label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateHideBroadcast(\'' + val.client_id + '\',0);">eye_slash</i></label>';
						data_client += '	</td>';
						data_client += '	 <td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
						data_client += '		<input type="hidden"  name="check_client_' + no + '" value="0" >';
						data_client += '		<input type="checkbox" value="1" id="check_client_' + no + '" name="c" class="checked_all check_wa">';
						data_client += '		<input value="' + val.client_id + '" type="hidden" id="client_check_client_' + no + '" name="client_check_client_' + no + '"';
						data_client += '	 </td>';
						data_client += '</tr>';
					});

				}


				jQuery("#tabel_data_client").html(data_client);
				jQuery("#total-client-broadcast").html(no);
			} else {
				jQuery("#tabel_data_client").html('<tr><td colspan="6" align="center">Tidak Ada Data</td></tr>');
				jQuery("#total-client-broadcast").html('0');
			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function updateHideBroadcast(client_id, hide_broadcast) {
	if (hide_broadcast == 1) {
		var message = "Menyembunyikan";
	} else {
		var message = "Perlihatkan";
	}
	app.dialog.create({
		title: 'Hide Client',
		text: 'Apakah Anda Yakin ' + message + ' Client ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/update-hide-broadcast",
						dataType: 'JSON',
						data: {
							client_id: client_id,
							hide_broadcast: hide_broadcast
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							if (hide_broadcast == 0) {
								getDataClientHide();
							} else {
								getDataClient();
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


function openPopupClientProspek() {

	if (jQuery('#perusahaan_prospek_broadcast_filter').val() == '' || jQuery('#perusahaan_prospek_broadcast_filter').val() == null) {
		perusahaan_broadcast_value = "empty";
	} else {
		perusahaan_broadcast_value = jQuery('#perusahaan_prospek_broadcast_filter').val();
	}

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-client-prospek",
		dataType: 'JSON',
		data: {
			perusahaan_broadcast_value: perusahaan_broadcast_value,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			var data_client = '';

			if (data.data.length != 0) {
				var no = 0;
				jQuery.each(data.data, function (i, val) {

					no++

					data_client += '<tr >';
					data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + no + '</td>';
					data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_nama + '</td>';
					data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_kota + '</td>';
					data_client += '	 <td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
					data_client += '  		<label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusNewBroadcast(\'' + val.client_id + '\',1);">plus_app_fill</i></label>';
					data_client += '	 </td>';
					data_client += '</tr>';

				});


				jQuery("#tabel_data_prospek_client").html(data_client);
				jQuery("#total-client-prospek-broadcast").html(no);


			} else {
				jQuery("#tabel_data_prospek_client").html('<tr><td colspan="5" align="center">Tidak Ada Data</td></tr>');
				jQuery("#total-client-prospek-broadcast").html('0');
			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function updateStatusNewBroadcast(client_id, new_client_performa) {
	if (new_client_performa == 1) {
		var message = "Mengubah Status New";
	} else {
		var message = "Mengubah Status New";
	}
	app.dialog.create({
		title: 'New Client',
		text: 'Apakah Anda Yakin ' + message + ' Client ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/update-status-new-broadcast",
						dataType: 'JSON',
						data: {
							client_id: client_id,
							new_client_performa: new_client_performa
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							openPopupClientProspek();
							getDataClient();
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

var delayTimer;
function doSearchByProspekPerusahaan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		openPopupClientProspek(1);
	}, 1000);
}

var delayTimer;
function doSearchByClientInfo(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getClientInfo(1);
	}, 1000);
}

function tambahDataClient() {
	$$("#tambah_client_nama_broadcast").val('');
	$$("#tambah_client_cp_broadcast").val('');
	$$("#tambah_cp_posisi_broadcast").val('');
	$$("#tambah_client_telp_broadcast").val('');
	$$("#tambah_client_alamat_broadcast").val('');
	selectBoxKotaBrodacast();
	$$("#show_table_client").hide();
}


function getClientInfo() {
	var client_name = '';
	if (jQuery('#tambah_client_nama_broadcast').val() == '' || jQuery('#tambah_client_nama_broadcast').val() == null) {
		client_name = "empty";
		$$("#show_table_client").hide();
	} else {
		client_name = jQuery('#tambah_client_nama_broadcast').val();
		$$("#show_table_client").show();

		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/get-client-info",
			dataType: 'JSON',
			data: {
				client_name: client_name,
			},
			beforeSend: function () {
			},
			success: function (data) {
				var data_client = '';

				if (data.data.length != 0) {
					var no = 0;

					jQuery.each(data.data, function (i, val) {
						no++
						data_client += '<tr>';
						data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + no + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_nama + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_cp + '</td>';
						data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_telp + '</td>';
						data_client += '     <td align="center" style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_kota + '</td>';
						data_client += '</tr>';
					});


					jQuery("#tabel_data_show_client").html(data_client);

				} else {
					jQuery("#tabel_data_show_client").html('<tr><td colspan="5" align="center">Tidak Ada Data</td></tr>');
					$$("#show_table_client").hide();

				}
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});

	}
}

function selectBoxKotaBrodacast() {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-kota-broadcast",
		dataType: "JSON",
		data: {
		},
		beforeSend: function () {
		},
		success: function (data) {
			var select_box_kota;
			select_box_kota += '<option value="">Pilih Kota</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_kota += '<option value="' + val.id_kota + '">' + val.nama_kota + '</option>';
			});
			$$('#tambah_kota_broadcast').html(select_box_kota);
		}
	});

	$$('.item_after_tambah_kota_broadcast').html('Pilih Kota');
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

function kirimBroadcast() {
	app.dialog.confirm('Apakah ingin mengirim broadcast sekarang ?', function () {
		if (localStorage.getItem("internet_koneksi") == 'fail') {
			app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
			});
		} else {
			var count_checkbox = $('input:checkbox.check_wa:checked').length;

			if (!$$('#form_send_broadcast')[0].checkValidity()) {
				app.dialog.alert('Cek Isian Anda');
			} else {
				var formData = new FormData();
				var number_input = 0;
				$("input:checkbox.check_wa:checked").each(function () {
					number_input++;
					formData.append('client_id_' + number_input + '', $('#client_' + $(this).attr("id")).val());
					formData.append('status_' + number_input + '', $('#status_' + $(this).attr("id")).val());
					formData.append('number_input', number_input);
					formData.append('user_id', localStorage.getItem("user_id"));
				});


				jQuery.ajax({
					type: "POST",
					url: "" + BASE_API + "/send-broadcast",
					dataType: "JSON",
					data: formData,
					timeout: 5000,
					contentType: false,
					processData: false,
					beforeSend: function () {
						app.dialog.preloader('Harap Tunggu');
					},
					success: function (data) {
						app.dialog.close();
						if (data.status == 'success') {
							getDataClient();
							getTargetBroadcastCs();
						} else if (data.status == 'failed') {
							getDataClient();
							getTargetBroadcastCs();
						}
					},
					error: function (xmlhttprequest, textstatus, message) {
						app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
						getDataClient();
						getTargetBroadcastCs();
					}

				});
			}
		}
	});
}


function simpanClientBroadcast() {
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
		});
	} else {
		if (!$$('#form_tambah_client_broadcast')[0].checkValidity()) {
			app.dialog.alert('Cek Isian Anda');
		} else {
			var formData = new FormData(jQuery("#form_tambah_client_broadcast")[0]);
			formData.append('user_id', localStorage.getItem("user_id"));
			formData.append('user_record', localStorage.getItem("karyawan_nama"));
			formData.append('client_kota', $("#tambah_kota_broadcast option:selected").text());

			jQuery.ajax({
				type: "POST",
				url: "" + BASE_API + "/simpan-client-broadcast",
				dataType: "JSON",
				data: formData,
				timeout: 7000,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Harap Tunggu');
				},
				success: function (data) {
					app.dialog.close();
					$$('.clear_tambah_client_broadcast').val('');
					var smartSelect = app.smartSelect.get('.smart-select');
					smartSelect.setValue([])
					if (data.status == 'success') {
						app.popup.close();
						getDataClient();
					} else if (data.status == 'failed') {
						app.popup.close();
						getDataClient();
					}
				},
				error: function (xmlhttprequest, textstatus, message) {
					app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
					app.popup.close();
					getDataClient();
				}

			});
		}
	}
}

function localClientID(client_id, stat_log) {
	localStorage.setItem('client_id_broadcast', client_id);
	localStorage.setItem("menu_log", localStorage.getItem("menu"));
	localStorage.setItem("stat_log", stat_log);
}

function getDataLogBroadcast() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-log-broadcast",
		dataType: 'JSON',
		data: {
			client_id: localStorage.getItem("client_id_broadcast"),
		},
		beforeSend: function () {
		},
		success: function (data) {
			var data_client = '';

			if (data.data.length != 0) {
				var no = 0;

				jQuery.each(data.data, function (i, val) {
					no++

					var badge_status = '';
					if (val.status_broadcast == 'F' || val.status_broadcast == 'A' || val.status_broadcast == null) {
						badge_status = '<span class="badge color-red">FAILED</span>';
					} else if (val.status_broadcast == 'D' || val.status_broadcast == 'R') {
						badge_status = '<span class="badge color-blue">' + val.err_code + '</span>';
					} else if (val.status_broadcast == 'S') {
						badge_status = '<span class="badge color-green">' + val.err_code + '</span>';
					}

					data_client += '<tr>';
					data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + no + '</td>';
					data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + moment(val.sent_date).format('DD-MMM-YY') + '</td>';
					data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_nama + '</td>';
					data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + badge_status + '</td>';
					data_client += '     <td align="left" style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"><div class="module line-clamp"><p>' + val.pesan_broadcast + '</p></div></td>';
					data_client += '</tr>';
				});


				jQuery("#log_broadcast_value").html(data_client);

			} else {
				jQuery("#log_broadcast_value").html('<tr><td colspan="5" align="center">Tidak Ada Data</td></tr>');

			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getDataClientHead() {

	if (jQuery('#perusahaan_broadcast_head').val() == '' || jQuery('#perusahaan_broadcast_head').val() == null) {
		perusahaan_broadcast_value = "empty";
	} else {
		perusahaan_broadcast_value = jQuery('#perusahaan_broadcast_head').val();
	}

	if (jQuery('#filter_kota_broadcast_head').val() == '' || jQuery('#filter_kota_broadcast_head').val() == null) {
		client_kota = "empty";
	} else {
		client_kota = jQuery('#filter_kota_broadcast_head').val();
	}

	var year_now = new Date().getFullYear();
	if (jQuery('#client_penjualan_years_head option:selected').val() == null) {
		var year = year_now;
	} else if (jQuery('#client_penjualan_years_head option:selected').val() == 'all') {
		var year = 'empty';
	} else {
		var year = jQuery('#client_penjualan_years_head option:selected').val();
	}

	var month_now = new Date().getMonth() + 1;
	if (jQuery('#client_penjualan_bulan_head option:selected').val() == null) {
		var month = month_now;
	} else if (jQuery('#client_penjualan_bulan_head option:selected').val() == 'all') {
		var month = 'empty';
	} else {
		var month = jQuery('#client_penjualan_bulan_head option:selected').val();
	}

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-data-client-new-head-dm",
		dataType: 'JSON',
		data: {
			perusahaan_broadcast_value: perusahaan_broadcast_value,
			client_kota: client_kota,
			user_id: localStorage.getItem("user_id"),
			year: year,
			month: month,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			var data_client = '';
			app.dialog.close();

			if (data.data.length != 0) {
				var no = 0;
				jQuery.each(data.data, function (i, val) {
					var kota = cleanText(val.client_kota);
					no++
					var status_client = '';
					if (val.bulan_selisih == 0 || val.bulan_selisih == null) {
						status_client = 'new';
					} else if (val.bulan_selisih > 2) {
						status_client = 'non_aktif';
					} else if (val.bulan_selisih > 0 && val.bulan_selisih <= 2) {
						status_client = 'aktif';
					}

					var warna_status = '';
					if (data.client_log[val.client_id] != null) {
						if (data.client_log[val.client_id].status_broadcast == 'F' || data.client_log[val.client_id].status_broadcast == 'A' || data.client_log[val.client_id].status_broadcast == null) {
							warna_status = 'card-color-red';
						} else if (data.client_log[val.client_id].status_broadcast == 'S') {
							warna_status = 'btn-color-greenWhite';
						} else if (data.client_log[val.client_id].status_broadcast == 'D' || data.client_log[val.client_id].status_broadcast == 'R') {
							warna_status = 'btn-color-blueWhite';
						}
					} else {
						warna_status = '';
					}

					data_client += '<tr class="' + warna_status + '">';
					data_client += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + no + '</td>';
					data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.client_nama + '</td>';
					data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + kota + ' <input style="width: 100%;" type="hidden" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
					data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell">' + val.karyawan_nama + '</td>';
					// data_client += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"><input style="width: 100%;" type="text" id="status_check_client_' + no + '" name="status_check_client_' + no + '"  value = "' + status_client + '" readonly></td>';
					data_client += '	 <td style="border-left: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
					data_client += '		<center><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" href="/log" onclick="localClientID(' + val.client_id + ',1)" style="width:100px;">Log</a></center>';
					data_client += '	 </td>';
					// data_client += '	<td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
					// data_client += '  		<label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateHideBroadcast(\'' + val.client_id + '\',1);">eye_slash</i></label>';
					// data_client += '	</td>';
					// data_client += '	 <td style="border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
					// data_client += '		<input type="hidden"  name="check_client_' + no + '" value="0" >';
					// data_client += '		<input type="checkbox" value="1" id="check_client_' + no + '" name="c" class="checked_all check_wa">';
					// data_client += '		<input value="' + val.client_id + '" type="hidden" id="client_check_client_' + no + '" name="client_check_client_' + no + '"';
					// data_client += '	 </td>';
					data_client += '	 <td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
					data_client += '		<center><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".data-client-head-popup" onclick="detailsClientBroadcastHead(\'' + val.client_id + '\',\'' + val.client_nama + '\',\'' + val.client_cp + '\',\'' + val.client_kota + '\',\'' + val.client_cp_posisi + '\',\'' + val.client_telp + '\',\'' + val.client_alamat + '\')" style="width:100px;">Details</a></center>';
					data_client += '	 </td>';
					data_client += '</tr>';
				});


				jQuery("#tabel_data_client_head").html(data_client);
				jQuery("#total-client-broadcast-head").html(no);
			} else {
				jQuery("#tabel_data_client_head").html('<tr><td colspan="6" align="center">Tidak Ada Data</td></tr>');
				jQuery("#total-client-broadcast-head").html('0');
			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function detailsClientBroadcastHead(client_id, client_nama, client_cp, client_kota, client_cp_posisi, client_telp, client_alamat) {
	// selectBoxKotaBrodacastHead(client_kota);
	$$("#edit_kota_broadcast_head").val(client_kota);
	$$("#edit_client_id_broadcast_head").val(client_id);
	$$("#edit_client_nama_broadcast_head").val(client_nama);
	$$("#edit_client_cp_broadcast_head").val(client_cp);
	$$("#edit_client_posisi_broadcast_head").val(client_cp_posisi);
	$$("#edit_client_telp_broadcast_head").val(client_telp);
	$$("#edit_client_alamat_broadcast_head").val(client_alamat);
}