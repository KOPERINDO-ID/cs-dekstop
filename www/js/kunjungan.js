var calendarRangeProspek;
var delayTimer;
function doSearchByPerusahaanKunjungan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getProspekHeader();
	}, 1000);
}


function detailProspek(tanggal_komunikasi, hasil_komunikasi, client_alamat, person, posisi, client_id, client_kota, client_nama, telpon, kunjungan_detail_id, karyawan_id, status, tanggal_janjian, tanggal_status1, tanggal_status2, tanggal_status3, hasil_pertemuan1, hasil_pertemuan2, hasil_pertemuan3) {



	$$('#popup-prospek-tgl-komunikasi').html(tanggal_komunikasi);
	$$('#popup-prospek-td-client_nama').html(client_nama);
	$$('#popup-prospek-client_person').html(person);
	$$('#popup-prospek-client_kota').html(client_kota);
	$$('#popup-prospek-client_posisi').html(posisi);
	$$('#popup-prospek-client_telpon').html(telpon);
	$$('#popup-prospek-status1').html(tanggal_status1);
	$$('#popup-prospek-status2').html(tanggal_status2);
	$$('#popup-prospek-status3').html(tanggal_status3);
	$$('#popup-prospek-hasil-komunikasi').html('Hasil Pertemuan:&#10;"' + hasil_komunikasi + '"');
	$$('#popup-prospek-keterangan1').html('Hasil Pertemuan:&#10;"' + hasil_pertemuan1 + '"');
	$$('#popup-prospek-keterangan2').html('Hasil Pertemuan:&#10;"' + hasil_pertemuan2 + '"');
	$$('#popup-prospek-keterangan3').html('Hasil Pertemuan:&#10;"' + hasil_pertemuan3 + '"');
}


function selectBoxClientProspek() {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-sales-manager",
		dataType: "JSON",
		data: {
			user_id: localStorage.getItem("user_id"),
		},
		beforeSend: function () {
		},
		success: function (data) {
			var select_box_client;
			select_box_client += '<option value="" selected>ALL SALES</option>';
			jQuery.each(data.data, function (i, val) {
				select_box_client += '<option value="' + val.user_id + '">' + val.karyawan_nama + ' | ' + val.kota + '</option>';
			});
			$$('#sales_id_prospek').html(select_box_client);
		}
	});

	$$('.item_after_sales_id_prospek').html('ALL SALES');
}
function updateProspek(lat_1, lng_1, lat_2, lng_2, lat_3, lng_3, file_selfie_card_1, file_selfie_card_2, file_selfie_card_3, file_id_card_1, file_id_card_2, file_id_card_3, tanggal_komunikasi, hasil_komunikasi, client_alamat, person, posisi, client_id, client_kota, client_nama, telpon, kunjungan_detail_id, karyawan_id, status, tanggal_janjian, tanggal_status1, tanggal_status2, tanggal_status3, hasil_pertemuan1, hasil_pertemuan2, hasil_pertemuan3) {

	var tes = "coba tes";
	var today = moment().format('YYYY-MM-DD');
	document.getElementsByName("tanggal_janjian_update")[0].setAttribute('min', today);

	jQuery('#tanggal_janjian_update').val(moment().format('YYYY-MM-DD'));
	jQuery('#keterangan_janjian_update').val("");

	jQuery('#btn_update_proses').show();

	$$('#popup-prospek-tgl-komunikasi').html(tanggal_komunikasi);
	$$('#popup-prospek-td-client_nama').html(client_nama);
	$$('#popup-prospek-client_person').html(person);
	$$('#popup-prospek-client_kota').html(client_kota);
	$$('#popup-prospek-client_posisi').html(posisi);
	$$('#popup-prospek-client_telpon').html(telpon);
	$$('#popup-prospek-hasil-komunikasi').html(hasil_komunikasi);
	$$('#kunjungan_detail_id_update').val(kunjungan_detail_id);
	$$('#tanggal_status1_update').val(moment(tanggal_status1).format('YYYY-MM-DD'));
	$$('#tanggal_status2_update').val(moment(tanggal_status2).format('YYYY-MM-DD'));
	$$('#tanggal_status3_update').val(moment(tanggal_status3).format('YYYY-MM-DD'));

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
		jQuery('#btn_update_proses').hide();
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

	$$('.pertemuan_1_section').hide();
	$$('.pertemuan_2_section').hide();
	$$('.pertemuan_3_section').hide();
	$('#hasil_pertemuan1_update').removeClass('required');
	$('#tanggal_status1_update').removeClass('required');
	$('#hasil_pertemuan2_update').removeClass('required');
	$('#tanggal_status2_update').removeClass('required');
	$('#hasil_pertemuan3_update').removeClass('required');
	$('#tanggal_status3_update').removeClass('required');

	var no_kunjungan = 1;

	if (hasil_pertemuan1 != "-") {
		no_kunjungan = 2;
		$$('.pertemuan_2_section').show();
		$('#hasil_pertemuan2_update').addClass('required');
		$('#tanggal_status2_update').addClass('required');
		$$("#file_id_card_1_view").attr("src", "");
		$$("#file_selfie_card_1_view").attr("src", "");
		$('#hasil_pertemuan1_update').val(hasil_pertemuan1);
		$('#hasil_pertemuan1_update').prop('readonly', true);
		$('#tanggal_status1_update').prop('readonly', true);
		$('#file_id_card_1').hide();
		$('#file_selfie_card_1').hide();
		$$("#file_id_card_1_view").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_1);
		$$("#file_selfie_card_1_view").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_1);
		$('.keterangan_foto1').show();

	} else {
		$$("#file_id_card_1_view").attr("src", "");
		$$("#file_selfie_card_1_view").attr("src", "");
		$('#hasil_pertemuan1_update').val('');
		$('#hasil_pertemuan1_update').addClass('required');
		$('#tanggal_status1_update').addClass('required');
		$('#hasil_pertemuan1_update').prop('readonly', false);
		$('#tanggal_status1_update').prop('readonly', true);
		document.getElementById('tanggal_status1_update').value = moment().format('YYYY-MM-DD');
		$('#file_id_card_1').show();
		$('#file_selfie_card_1').show();
		$('.keterangan_foto1').hide();
		$$("#file_selfie_card_1_view").attr("src", "");
	}

	if (hasil_pertemuan2 != "-") {
		no_kunjungan = 3;
		$$('.pertemuan_3_section').show();
		$('#hasil_pertemuan3_update').addClass('required');
		$('#tanggal_status3_update').addClass('required');
		$$("#file_selfie_card_2_view").attr("src", "");
		$$("#file_id_card_2_view").attr("src", "");
		$('#hasil_pertemuan2_update').val(hasil_pertemuan2);
		$('#hasil_pertemuan2_update').prop('readonly', true);
		$('#tanggal_status2_update').prop('readonly', true);
		$('#file_id_card_2').hide();
		$('#file_selfie_card_2').hide();
		$$("#file_id_card_2_view").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_2);
		$$("#file_selfie_card_2_view").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_2);
		$('.keterangan_foto2').show();
		$('#hasil_pertemuan2_update').removeClass('required');
		$('#tanggal_status2_update').removeClass('required');
	} else {
		$$("#file_id_card_2_view").attr("src", "");
		$$("#file_selfie_card_2_view").attr("src", "");
		$('#hasil_pertemuan2_update').val('');
		$('#hasil_pertemuan2_update').prop('readonly', false);
		$('#tanggal_status2_update').prop('readonly', true);
		document.getElementById('tanggal_status2_update').value = moment().format('YYYY-MM-DD');
		$('#file_id_card_2').show();
		$('#file_selfie_card_2').show();
		$('.keterangan_foto2').hide();
		$$("#file_selfie_card_2_view").attr("src", "");
	}

	if (hasil_pertemuan3 != "-") {
		no_kunjungan = 3;
		$$("#file_id_card_3_view").attr("src", "");
		$$("#file_selfie_card_3_view").attr("src", "");
		$('#hasil_pertemuan3_update').val(hasil_pertemuan3);
		$('#hasil_pertemuan3_update').prop('readonly', true);
		$('#tanggal_status3_update').prop('readonly', true);
		$('#file_id_card_3').hide();
		$('#file_selfie_card_3').hide();
		$$("#file_id_card_3_view").attr("src", BASE_PATH_IMAGE + '/' + file_id_card_3);
		$$("#file_selfie_card_3_view").attr("src", BASE_PATH_IMAGE + '/' + file_selfie_card_3);
		$('.keterangan_foto3').show();
		$$('#hasil_pertemuan3_update').removeClass('required');
		$$('#tanggal_status3_update').removeClass('required');
		$$(".div_janjian").hide();
	} else {
		$$("#file_id_card_3_view").attr("src", "");
		$$("#file_selfie_card_3_view").attr("src", "");
		$('#hasil_pertemuan3_update').val('');
		$('#hasil_pertemuan3_update').prop('readonly', false);
		$('#tanggal_status3_update').prop('readonly', true);
		document.getElementById('tanggal_status3_update').value = moment().format('YYYY-MM-DD');
		$$(".div_janjian").show();
		$('#file_id_card_3').show();
		$('#file_selfie_card_3').show();
		$('.keterangan_foto3').hide();
		$$("#file_selfie_card_3_view").attr("src", "");
	}
	localStorage.setItem("no_kunjungan", no_kunjungan);
	console.log(no_kunjungan);


}

function getProspekHeader(page) {
	if (page == '' || page == null) {
		var page_now = 1;
	} else {
		var page_now = page;
	}

	var user_id = ""
	if (jQuery("#sales_id_prospek").val() == "" || jQuery("#sales_id_prospek").val() == null) {
		user_id = 'empty';
	} else {
		user_id = jQuery("#sales_id_prospek").val();
	}

	var prospek_value = "";
	var pagination_button = "";
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-prospek-header-manager?page=" + page_now + "",
		dataType: 'JSON',
		data: {
			karyawan_id: user_id,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			no = 1;
			for (i = 0; i < data.data.last_page; i++) {
				no = i + 1;
				pagination_button += '<i onclick="getProspekHeader(' + no + ');"  style="border-radius:2px; width:40px; height:40px; background-color:#4c5269; padding-left:8px; padding-right:8px; margin:2px;">' + no + '</i>';
			}

			$.each(data.data.data, function (i, item) {

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
				var a = moment([moment(item.tanggal_update_status).format('YYYY'), moment(item.tanggal_update_status).format('MM'), moment(item.tanggal_update_status).format('DD')]);
				var b = moment([moment().format('YYYY'), moment().format('MM'), moment().format('DD')]);

				prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
				prospek_value += '<button onclick="detailProspek(\'' + item.lat_1 + '\',\'' + item.lng_1 + '\',\'' + item.lat_2 + '\',\'' + item.lng_2 + '\',\'' + item.lat_3 + '\',\'' + item.lng_3 + '\',\'' + item.file_selfie_card_1 + '\',\'' + item.file_selfie_card_2 + '\',\'' + item.file_selfie_card_3 + '\',\'' + item.file_id_card_1 + '\',\'' + item.file_id_card_2 + '\',\'' + item.file_id_card_3 + '\',\'' + tanggal_komunikasi + '\',\'' + hasil_komunikasi.replace(/\s/g, " ") + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.kunjungan_detail_id + '\',\'' + item.karyawan_id + '\',\'' + item.status + '\',\'' + item.tanggal_janjian + '\',\'' + item.tanggal_status1 + '\',\'' + item.tanggal_status2 + '\',\'' + item.tanggal_status3 + '\',\'' + hasil_pertemuan1.replace(/\s/g, " ") + '\',\'' + hasil_pertemuan2.replace(/\s/g, " ") + '\',\'' + hasil_pertemuan3.replace(/\s/g, " ") + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-prospek">Detail</button>';
				prospek_value += '</td>';
				prospek_value += '<td style="border-right :1px solid gray; border-bottom :1px solid gray;" class="label-cell">';
				prospek_value += '<button onclick="getKunjunganBbm(\'' + item.kunjungan_detail_id + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".bbm-popup">BBM</button>';
				prospek_value += '</td>';
				prospek_value += '</tr>';
			});
			$$('#prospek_value').html(prospek_value);
			$$('#pagination_button').html(pagination_button);
			$$('#current_page').html(data.data.current_page);
			$$('#from_data').html(data.data.from);
			$$('#to_data').html(data.data.to);
			$$('#total_data').html(data.data.total);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
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