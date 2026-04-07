
function pilihRadioFile(type) {
	if (type == 'Gambar') {
		jQuery("#element_gambar").show();
		jQuery("#element_video").hide();
	} else if (type == 'Video') {
		jQuery("#element_gambar").hide();
		jQuery("#element_video").show();
	}
}

function getDataTools() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-tools-marketing",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
		},
		success: function (data) {
			var data_tools = '';

			if (data.data.length != 0) {
				var no = 0;
				var pesan_broadcast = '';

				jQuery.each(data.data, function (i, val) {
					no++
					if (val.pesan_broadcast != null) {
						pesan_broadcast = val.pesan_broadcast;
					} else {
						pesan_broadcast = '-';
					}
					data_tools += '<tr>';
					data_tools += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  >' + no + '</td>';
					data_tools += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  ><div class="module line-clamp"><p>' + pesan_broadcast + '</p></div></td>';
					data_tools += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  >' + val.status_client + '</td>';
					data_tools += '		<td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
					data_tools += '			<button onclick="getDataEditToolsBroadcast(\'' + val.tools_marketing_id + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".edit-tools-broadcast-popup">Edit</button>';
					data_tools += '		</td>';
					data_tools += '</tr>';
				});


				jQuery("#tools_broadcast_value").html(data_tools);

			} else {
				jQuery("#tools_broadcast_value").html('<tr><td colspan="4" align="center">Tidak Ada Data</td></tr>');

			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function getDataEditToolsBroadcast(tools_marketing_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-edit-tools-broadcast",
		dataType: 'JSON',
		data: {
			tools_marketing_id: tools_marketing_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$$("#edit_foto_broadcast").val('');
			$$('#value_edit_foto_broadcast').html('Pilih Gambar');
			$$("#edit_video_broadcast").val('');
			$$('#value_edit_video_broadcast').html('Pilih Video');
			$$("#edit_tools_pesan_broadcast").val('');
			$$("#edit_tools_marketing_id").val('');
		},
		success: function (data) {
			app.dialog.close();
			if (data.data.media_type == 'Gambar') {
				jQuery('#view_video_broadcast').attr('src', 'https://indokoper.com/novideo.mp4');
				$("#head_video_broadcast")[0].load();
				$("#radio-gambar").prop("checked", true);
				pilihRadioFile('Gambar');
				if (data.data.gambar_broadcast != 'null') {
					jQuery('#view_gambar_broadcast').attr('src', BASE_PATH_IMAGE_BROADCAST + '/' + data.data.gambar_broadcast);
				} else {
					jQuery('#view_gambar_broadcast').attr('src', 'https://indokoper.com/noimage.jpg');
				}
			} else {
				jQuery('#view_gambar_broadcast').attr('src', 'https://indokoper.com/noimage.jpg');
				$("#radio-video").prop("checked", true);
				pilihRadioFile('Video');
				if (data.data.gambar_broadcast != 'null') {
					jQuery('#view_video_broadcast').attr('src', BASE_PATH_IMAGE_BROADCAST + '/' + data.data.gambar_broadcast);
					$("#head_video_broadcast")[0].load();
				} else {
					jQuery('#view_video_broadcast').attr('src', 'https://indokoper.com/novideo.mp4');
					$("#head_video_broadcast")[0].load();
				}
			}


			if (data.data.pesan_broadcast != null) {
				pesan_broadcast = data.data.pesan_broadcast;
			} else {
				pesan_broadcast = '-';
			}
			$$("#edit_tools_pesan_broadcast").val(pesan_broadcast);
			$$("#edit_status_client_broadcast").val(data.data.status_client).change();
			$$("#edit_tools_marketing_id").val(tools_marketing_id);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function updateToolsMarketing() {
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
		});
	} else {
		var formData = new FormData(jQuery("#form_edit_tools_broadcast")[0]);
		formData.append('user_modified', localStorage.getItem("karyawan_nama"));

		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/update-tools-marketing",
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
				$$('.clear_edit_tools_broadcast').val('');
				if (data.status == 'success') {
					$("#back-edit-tools-broadcast-popup").click();
					getDataTools();
				} else if (data.status == 'failed') {
					$("#back-edit-tools-broadcast-popup").click();
					getDataTools();
				}
			},
			error: function (xmlhttprequest, textstatus, message) {
				app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
				$("#back-edit-tools-broadcast-popup").click();
				getDataTools();
			}

		});
	}
}

function gambarBroadcast() {
	if (jQuery('#edit_foto_broadcast').val() == '' || jQuery('#edit_foto_broadcast').val() == null) {
		$$('#value_edit_foto_broadcast').html('Pilih Gambar');
	} else {
		$$('#value_edit_foto_broadcast').html($$('#edit_foto_broadcast').val().replace('fakepath', ''));
		var input = document.getElementById("edit_foto_broadcast");
		var fReader = new FileReader();
		fReader.readAsDataURL(input.files[0]);
		fReader.onloadend = function (event) {
			var img = document.getElementById("view_gambar_broadcast");
			img.src = event.target.result;
		}
	}
}

function removeGambarBroadcast() {
	jQuery('#view_gambar_broadcast').attr('src', 'https://indokoper.com/noimage.jpg');
	jQuery('#edit_foto_broadcast').val('');
	$$('#value_edit_foto_broadcast').html('Pilih Gambar');
}


function videoBroadcast() {
	if (jQuery('#edit_video_broadcast').val() == '' || jQuery('#edit_video_broadcast').val() == null) {
		$$('#value_edit_video_broadcast').html('Pilih Video');
	} else {
		var input = document.getElementById("edit_video_broadcast");
		const fileSize = input.files[0].size / 1024 / 1024; // in MiB
		if (fileSize > 1) {
			app.dialog.alert('Video Lebih dari 1 MB');
			// $(file).val(''); //for clearing with Jquery
		} else {
			$$('#value_edit_video_broadcast').html($$('#edit_video_broadcast').val().replace('fakepath', ''));
			var fReader = new FileReader();
			fReader.readAsDataURL(input.files[0]);
			fReader.onloadend = function (event) {
				var img = document.getElementById("view_video_broadcast");
				img.src = event.target.result;
				$("#head_video_broadcast")[0].load();
			}
		}
	}
}

function removeVideoBroadcast() {
	jQuery('#view_video_broadcast').attr('src', 'https://indokoper.com/novideo.mp4');
	$("#head_video_broadcast")[0].load();
	jQuery('#edit_video_broadcast').val('');
	$$('#value_edit_video_broadcast').html('Pilih Video');
}