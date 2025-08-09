function getDataKatalogText() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-share-link-broadcast",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
		},
		success: function (data) {
			var data_tools = '';

			if (data.data.length != 0) {
				var no = 0;
				var katalog_text_link = '';

				jQuery.each(data.data, function (i, val) {
					no++
					if (val.katalog_text_link != null) {
						katalog_text_link = val.katalog_text_link;
					} else {
						katalog_text_link = '-';
					}
					data_tools += '<tr>';
					data_tools += '     <td align="center" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  >' + no + '</td>';
					data_tools += '     <td align="left" style="border-left: 1px solid grey;border-bottom: 1px solid grey;"  class="label-cell"  ><div class="module line-clamp"><p>' + katalog_text_link + '</p></div></td>';
					data_tools += '		<td style="border-left: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;text-align:center">';
					data_tools += '			<button onclick="getDataEditShareLinkBroadcast(\'' + val.id_katalog_text + '\')" class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".edit-share-link-broadcast-popup">Edit</button>';
					data_tools += '		</td>';
					data_tools += '</tr>';
				});


				jQuery("#share_link_broadcast_value").html(data_tools);

			} else {
				jQuery("#share_link_broadcast_value").html('<tr><td colspan="4" align="center">Tidak Ada Data</td></tr>');

			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getDataEditShareLinkBroadcast(id_katalog_text) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-share-link-broadcast-detail",
		dataType: 'JSON',
		data: {
			id_katalog_text:id_katalog_text
		},
		beforeSend: function () {
		},
		success: function (data) {
			$$("#edit_share_link_katalog_text").val(data.data.katalog_text_link);
			$$("#edit_share_link_id").val(data.data.id_katalog_text);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function updateShareLink() {
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {
		});
	} else {
		var formData = new FormData(jQuery("#form_edit_share_broadcast")[0]);
		formData.append('user_modified', localStorage.getItem("karyawan_nama"));

		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/update-share-link",
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
				$$('.clear_edit_share_link_broadcast').val('');
				if (data.status == 'success') {
					app.popup.close();
					getDataKatalogText();
				} else if (data.status == 'failed') {
					app.popup.close();
					getDataKatalogText();
				}
			},
			error: function (xmlhttprequest, textstatus, message) {
				app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
				app.popup.close();
				getDataKatalogText();
			}

		});
	}
}
