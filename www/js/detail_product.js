function getProdukSetId(produk_id) {
	localStorage.setItem("produk_id", produk_id);
	return app.views.main.router.navigate('/detail-product');
}

function getProdukDetail(produk_detail_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-detail-produk-new",
		dataType: 'JSON',
		data: {
			produk_id: localStorage.getItem("produk_id"),
			produk_detail_id: produk_detail_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			if (data.data.kode_warna != null) {
				var kode_warna = data.data.kode_warna;
			} else {
				var kode_warna = '-';
			}
			jQuery("#name_kode").html('<b>' + localStorage.getItem("produk_id") + '</b>');
			jQuery("#name_warna").html('<b>' + kode_warna + ' | ' + data.data.nama_warna + '</b>');
			jQuery("#main_frame").attr("src", BASE_PATH_IMAGE_PRODUCT + '/' + data.data.foto_depan);
			jQuery('#main_frame').data('id', BASE_PATH_IMAGE_PRODUCT + '/' + data.data.foto_depan);
			localStorage.setItem("produk_grup_warna", data.data.produk_grup_warna)
			getSharelink();
			app.dialog.close();
			// console.log(data.data[0].keterangan);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getProdukWarna() {
	var color_content = "";
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-detail-warna-new",
		dataType: 'JSON',
		data: {
			produk_id: localStorage.getItem("produk_id")
		},
		beforeSend: function () {
		},
		success: function (data) {
			// jQuery('#keterangan_produk').html('<br><b>Deskripsi</b><br>'+data.data[0].produk_keterangan);

			jQuery.each(data.data, function (i, val) {
				color_content += '<svg onclick="getProdukDetail(\'' + val.produk_detail_id + '\');" width="28" height="28" style="float:center; text-align:center;">';
				color_content += '<rect width="28" height="28" style="fill:' + val.produk_grup_warna + ';stroke-width:2;stroke:rgb(0,0,0)" />';
				color_content += '</svg>';
			});
			jQuery('#color_produk').html(color_content);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getSharelink() {

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-share-link-broadcast-detail",
		dataType: 'JSON',
		data: {
			id_katalog_text: 1
		},
		beforeSend: function () {
		},
		success: function (data) {
			var table_link = ''

			var initials = localStorage.getItem("karyawan_nama").split(" ");
			var produk_id = localStorage.getItem("produk_id");
			var produk = produk_id.substr(produk_id.length - 3);
			var warna = localStorage.getItem("produk_grup_warna").replace('#', '');
			var uri = data.data.katalog_text_link;
			var encode_katalog_text = encodeURI(uri);

			if (initials.length > 1) {
				var initial_name = localStorage.getItem("karyawan_nama").split(/\s/).reduce((response, word) => response += word.slice(0, 1), '')
			} else {
				var initial_name = localStorage.getItem("karyawan_nama").split(/\s/).reduce((response, word) => response += word.slice(0, 2), '')
			}

			var number;
			do {
				number = Math.floor(Math.random() * 999);
			} while (number < 1);
			var time = moment().format("hhmmss");
			// var text_link = 'https://www.koperindo.com/' + produk.toLowerCase() + '/' + initial_name.toLowerCase();
			var text_link = 'https://wa.me/?text=Link%20Katalog%20%3A%20%0A%0Ahttps%3A%2F%2Fsales.koperindo.id%2F' + produk.toLowerCase() + '.' + localStorage.getItem("user_id") + '.' + warna + '.' + number + time + localStorage.getItem("user_id") + '%2F' + initial_name.toLowerCase() + '%0A%0A' + encode_katalog_text;
			localStorage.setItem("rand_number", number + time + localStorage.getItem("user_id"));
			jQuery("#share_produk").attr("href", text_link);
			jQuery('#link_share').val(text_link);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});

}

function saveLogShare() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/save-log-share",
		dataType: 'JSON',
		data: {
			number: localStorage.getItem("rand_number"),
			user_record: localStorage.getItem("karyawan_nama")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function copyText() {
	// Get the text field
	var copyText = document.getElementById("link_share");

	// Select the text field
	copyText.select();
	copyText.setSelectionRange(0, 99999); // For mobile devices

	// Copy the text inside the text field
	navigator.clipboard.writeText(copyText.value);

}

// function changeColor(produk_detail_id) {
// 	localStorage.setItem("produk_detail_id", produk_detail_id);
// 	getProdukDetail()
// }