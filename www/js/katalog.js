function dateRangeDeclarationKatalog() {
	var calendarRangeKunjungan = app.calendar.create({
		inputEl: '#demo-calendar-range',
		rangePicker: true
	});
}

function getProduk() {
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
				produk_data += ' <a href="/detail-product">';
				produk_data += '   <img onclick="getProdukSetId(\'' + item.produk_id + '\');" src="' + BASE_PATH_IMAGE_PRODUCT + '/' + item.foto_depan + '" height="100%" width="100%" />';
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
			jQuery('#produk_data').html(produk_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}