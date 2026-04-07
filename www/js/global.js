// Configuration APP
function checkConnection() {
	var networkState = navigator.connection.type;

	var states = {};
	states[Connection.UNKNOWN] = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI] = 'WiFi connection';
	states[Connection.CELL_2G] = 'Cell 2G connection';
	states[Connection.CELL_3G] = 'Cell 3G connection';
	states[Connection.CELL_4G] = 'Cell 4G connection';
	states[Connection.CELL] = 'Cell generic connection';
	states[Connection.NONE] = 'no_network';

	if (states[networkState] == 'no_network') {
		app.dialog.alert('Internet Sangat Lambat, Cek Koneksi Lalu Klik Oke', function () {
			app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
				ignoreCache: true,
				reloadCurrent: true
			});
		});
	}

	if (states[networkState] == 'no_network') {
        $("#box_internet").css("background-color", "red"); // ← TAMBAHKAN
        localStorage.setItem("internet_koneksi", "fail");  // ← TAMBAHKAN
        app.dialog.alert('Internet Sangat Lambat, Cek Koneksi Lalu Klik Oke', function () {
            app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
				ignoreCache: true,
				reloadCurrent: true
			});
        });
    } else {
        // Kalau ada koneksi, tetap jalankan AJAX check untuk validasi server
        internetCheckQueue.check();
    }
}




// var BASE_API = 'https://tasindo-sale-webservice.digiseminar.id/api';
var BASE_API = 'https://indokoper.com/api';

var BASE_API2 = 'https://indokoper.com/api';
var BASE_API3 = 'https://be.order.devkoperindo.com/api';
var BASE_PATH_IMAGE_ABSEN = 'https://indokoper.com/absen';
var BASE_PATH_IMAGE = 'https://indokoper.com/kunjungan';
var BASE_PATH_IMAGE_BBM = 'https://indokoper.com/foto_bbm';
var BASE_PATH_IMAGE_PERFORMA = 'https://indokoper.com/performa_image';
var BASE_PATH_IMAGE_CUSTOMER = 'https://indokoper.com/customer_logo';
var BASE_PATH_IMAGE_PRODUCT = 'https://indokoper.com/product_image_new';
var BASE_PATH_IMAGE_BUKTI_PRODUKSI = 'https://indokoper.com/foto_produksi';
var BASE_PATH_IMAGE_SURAT_JALAN = 'https://indokoper.com/foto_surat_jalan';
var BASE_PATH_IMAGE_FOTO_PEMBAYARAN = 'https://indokoper.com/foto_pembayaran';
var BASE_PATH_IMAGE_FOTO_FEE = 'https://indokoper.com/foto_fee';
var BASE_PATH_IMAGE_BUKTI_GAJI = 'https://indokoper.com/bukti_gaji';
var BASE_PATH_IMAGE_FOTO_KTP = 'https://indokoper.com/foto_ktp';
var BASE_PATH_IMAGE_FOTO_SELFIE = 'https://indokoper.com/public_selfie';
var BASE_PATH_IMAGE_BUKTI_SP = 'https://indokoper.com/bukti_sp';
var BASE_PATH_IMAGE_BUKTI_POINT = 'https://indokoper.com/foto_bukti_point';
var BASE_PATH_IMAGE_BROADCAST = 'https://indokoper.com/gambar_broadcast';


function refreshPage() {
	return app.views.main.router.navigate(app.views.main.router.currentRoute.url, { reloadCurrent: true, ignoreCache: true, });
}


function backToSales() {
	setTimeout(function () {
		return app.views.main.router.navigate('/sales');
	}, 200);
}


var internetCheckQueue = {
	isRunning: false,
	hasPending: false,

	check: function () {
		if (this.isRunning) {
			console.log('⏸️ checkInternet already running, marking as pending...');
			this.hasPending = true;
			return false;
		}

		this.isRunning = true;
		this.hasPending = false;
		console.log('✅ checkInternet started');

		var self = this;

		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/check-internet-cs",
			dataType: 'JSON',
			data: {
				karyawan_id: localStorage.getItem("user_id"),
				password: localStorage.getItem("password")
			},
			timeout: 10000,
			success: function (data) {
				console.log(data.password);
				console.log(localStorage.getItem("password"));

				if (data.version.config_value_string == localStorage.getItem("versioon_app_now")) {
					if (localStorage.getItem("password") == data.password) {
						console.log('Password Accept')
					} else {
						app.dialog.alert('Password Anda Tidak Sesuai', function () {
							logOut();
						});
					}
					console.log('Version Accept');
				} else {
					app.dialog.alert(data.version.config_keterangan, function () {
						logOut();
					});
				}

				localStorage.setItem("internet_koneksi", "good");
				$("#box_internet").css("background-color", "green");
			},
			error: function (xmlhttprequest, textstatus, message) {
				if (textstatus === "timeout") {
					$("#box_internet").css("background-color", "red");
					localStorage.setItem("internet_koneksi", "fail");
				} else {
					$("#box_internet").css("background-color", "red");
					localStorage.setItem("internet_koneksi", "fail");
				}
			},
			complete: function () {
				self.isRunning = false;
				console.log('✅ checkInternet completed');

				// Jika ada pending request, jalankan setelah delay singkat
				if (self.hasPending) {
					console.log('🔄 Running pending checkInternet...');
					setTimeout(function () {
						self.check();
					}, 1000); // Delay 1 detik sebelum menjalankan pending request
				}
			}
		});
	}
};


function getPlayAudio() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-count-status-cs-notif-audio-view",
		dataType: 'JSON',
		data: {
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
		},
		beforeSend: function () {
		},
		success: function (data) {

			if (data.data_count_all > 0) {
				var audio = new Audio('img/sound/audio.wav');
				audio.play();
				setTimeout(() => {
					audio.pause();
					audio.currentTime = 0; // Mengatur ulang waktu audio ke awal
					console.log('Audio berhenti.');
				}, 20000);
				$$('.merah-notif-all').removeClass("card-color-red-important announcement");
				$$('.merah-notif-all').addClass("card-color-red-important announcement");
			} else {
				$$('.merah-notif-all').removeClass("card-color-red-important announcement");
			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}
function getNotifRed() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-count-status-cs-notif-view",
		dataType: 'JSON',
		data: {
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
		},
		beforeSend: function () {
		},
		success: function (data) {

			if (data.data_count_all > 0) {
				$$('.merah-notif-all').removeClass("card-color-red-important announcement");
				$$('.merah-notif-all').addClass("card-color-red-important announcement");
			} else {
				$$('.merah-notif-all').removeClass("card-color-red-important announcement");
			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getNotifDelayRed() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-colunt-delay-shipment",
		dataType: 'JSON',
		data: {
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
		},
		beforeSend: function () {
		},
		success: function (data) {

			if (data.data > 0) {
				$$('.notif-merah-delay').removeClass("card-color-red-important announcement");
				$$('.notif-merah-delay').addClass("card-color-red-important announcement");
			} else {
				$$('.notif-merah-delay').removeClass("card-color-red-important announcement");
			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function inputLog(id_transaksi, jenis, keterangan) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/input-log-proses",
		dataType: 'JSON',
		data: {
			id_transaksi: id_transaksi,
			jenis: jenis,
			keterangan: keterangan
		},
		beforeSend: function () {
		},
		success: function (data) {
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function selectBank() {
	if (localStorage.getItem("user_location") == 'luar_pulau') {
		$(".input-item-bank option[value='BCA']").remove();
		$(".input-item-bank option[value='BRI']").remove();
		$(".input-item-bank option[value='Mandiri']").remove();
	} else {
		$(".input-item-bank option[value='Mandiri Bisnis']").remove();
	}
}

function zoom_view(src) {
	console.log('KLIK');
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

function selectBankPembayaran() {
	if (localStorage.getItem("user_location") == 'luar_pulau') {
		$(".bank_pembayaran option[value='BCA']").remove();
		$(".bank_pembayaran option[value='BRI']").remove();
		$(".bank_pembayaran option[value='Mandiri']").remove();
	} else {
		$(".bank_pembayaran option[value='Mandiri Bisnis']").remove();
	}
}

function checkLogin() {
	if (localStorage.getItem("login") != "true") {
		$$('#karyawan_nama_header').html('<img src="img/logo/logo_new.png" width="85px" />');
		return app.views.main.router.navigate('/login');
	} else {
		$$('#karyawan_nama_header').html('<b>' + localStorage.getItem('karyawan_nama') + '</b>');
		console.log('is_login');
		console.log(localStorage.getItem("login"));
		console.log(localStorage.getItem("user_location"));
	}
}


function logOut() {
	localStorage.clear();
	$$('#karyawan_nama_header').html('<img src="img/logo/logo_new.png" width="85px" />');
	return app.views.main.router.navigate('/login');
}

function writeLog(str) {
	if (!logOb) return;
	var log = str + " [" + (new Date()) + "]\n";
	logOb.createWriter(function (fileWriter) {
		fileWriter.seek(fileWriter.length);
		var blob = new Blob([log], { type: 'text/plain' });
		fileWriter.write(blob);
	}, fail);
}

function screenshot_me(client_nama) {
	jQuery('#button_invoice').remove();
	jQuery('.menu-detail-product').hide();
	jQuery('.navbar').hide();


	setTimeout(function () {
		navigator.screenshot.save(function (error, res) {
			if (error) {
				app.dialog.preloader('Gagal');
				setTimeout(function () {
					app.dialog.close();
					app.popup.close();
				}, 2000);
				jQuery('.menu-detail-product').show();
				jQuery('.navbar').show();
			} else {
				app.dialog.preloader('Berhasil');
				setTimeout(function () {
					app.dialog.close();
					app.popup.close();
				}, 2000);
				jQuery('.menu-detail-product').show();
				jQuery('.navbar').show();
			}
		}, 'jpg', 50, '' + client_nama + '_' + moment().format('DDMMYYYYHHmmss') + '');
	}, 1000);
}

function number_format(number, decimals, dec_point, thousands_sep) {
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function (n, prec) {
			var k = Math.pow(10, prec);
			return '' + Math.round(n * k) / k;
		};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
}


// audio notif tiap 5 menit (cukup 1 interval saja)
setInterval(function () {
	getPlayAudio();
}, 300000); // 5 menit

setInterval(function () {
	let now = new Date();
	let jam = now.getHours();
	let menit = now.getMinutes();
	let tanggal = now.toDateString(); // misal: "Mon Nov 03 2025"

	// simpan tanggal terakhir dijalankan
	let lastDate = localStorage.getItem('deadline_last_date');
	if (lastDate !== tanggal) {
		// reset jika tanggal berubah
		Object.keys(localStorage).forEach(k => {
			if (k.startsWith('deadline_run_')) localStorage.removeItem(k);
		});
		localStorage.setItem('deadline_last_date', tanggal);
	}

	// eksekusi jam 09:00 & 13:00
	if ((jam === 9 || jam === 13) && menit === 0) {
		let key = 'deadline_run_' + jam + '_' + tanggal;
		if (!localStorage.getItem(key)) {
			localStorage.setItem(key, '1');
			cekDeadlineDanBukaPopup();
		}
	}
}, 30000);


function renderPopupDeadlinePenjualan() {
	let html_popup = `
		<div class="popup popup-deadline-penjualan">
			<div class="view view-init">
				<div class="page">
					<div class="navbar">
						<div class="navbar-bg"></div>
						<div class="navbar-inner bg-dark-gray-medium">
							<div class="title">SPK Deadline Pengiriman</div>
							<div class="right">
								<a class="link popup-close" data-popup=".popup-deadline-penjualan" style="color:#fff;" onclick="alertClosePopupDeadline();">Tutup</a>
							</div>
						</div>
					</div>
					<div class="page-content">
						<div class="table-responsive">
							<table class="table table-sm" style="width:100%;border-collapse:collapse;">
								<thead>
									<tr>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">No</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">SPK</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">Perusahaan</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">Hari</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">Tgl Kirim</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">Status</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;" colspan="2">Aksi</th>
									</tr>
								</thead>
								<tbody id="deadline_penjualan_popup_tbody">
									<tr><td colspan="7" align="center">Memuat…</td></tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>`;
	jQuery('body').append(html_popup);
}

function BadgeLevel(row) {
	var label = String(row.status_deadline || '-');
	if (label === 'Hari Ini') return 'red';
	if (/^H-\d+/.test(label)) {
		var n = parseInt(row.hari_menuju_deadline, 10) || 0;
		if (n <= 1) return 'red';
		if (n <= 2) return 'orange';
		return 'yellow';
	}
	return 'grey';
}

function BadgeHtml(row) {
	var level = BadgeLevel(row);
	var style = 'padding:2px 8px;border-radius:12px;font-size:12px;display:inline-block;';
	if (level === 'red') style += 'background:#FF3B30;color:#fff;';
	else if (level === 'orange') style += 'background:#FF9500;color:#222;';
	else if (level === 'yellow') style += 'background:#FFD60A;color:#222;';
	else style += 'background:#555;color:#eee;';
	return '<span style="' + style + '">' + row.status_deadline + '</span>';
}

function cekDeadlineDanBukaPopup() {
	renderPopupDeadlinePenjualan();
	jQuery('#deadline_penjualan_popup_tbody').html('<tr><td colspan="7" align="center">Memuat…</td></tr>');

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/penjualan-deadline',
		data: {
			lokasi_pabrik: localStorage.getItem('lokasi_pabrik_sales')
		},
		dataType: 'JSON',
		success: function (res) {
			var $tbody = jQuery('#deadline_penjualan_popup_tbody');
			$tbody.empty();

			if (!res || !res.status || !res.data || !res.data.length) return;

			jQuery.each(res.data, function (i, item) {

				if (item.tgl_cs_deadline != null) {
					if (item.keterangan_urgent != null && item.tgl_produksi_selesai != null) {
						color_urgent_blink = 'announcement';
						date_urgent = moment(item.tgl_cs_deadline).format('DD-MMM');
						date_selesai = moment(item.tgl_produksi_selesai).format('DD-MMM-YYYY');
						btn_color_urgent_blink = 'card-color-red';
						onclick_urgent = 'onclick="detailPenjualan(\'' + item.dt_record + '\',\'' + item.penjualan_id + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.karyawan_nama + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.tgl_cs_deadline + '\',\'' + item.lokasi_pabrik + '\',\'' + item.nama_kota + '\',1);"';
						onclick_keterangan = 'onclick="detailKeterangan(\'' + item.keterangan_urgent + '\',\'' + date_selesai + '\');"';
						var btnKeterangan = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button popup-open text-bold" data-popup=".detail-keterangan" ' + onclick_keterangan + ' >Keterangan</button>';
					} else {
						color_urgent_blink = 'announcement';
						date_urgent = moment(item.tgl_cs_deadline).format('DD-MMM');
						btn_color_urgent_blink = 'btn-color-orange';
						onclick_urgent = 'onclick="detailPenjualan(\'' + item.dt_record + '\',\'' + item.penjualan_id + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.karyawan_nama + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.tgl_cs_deadline + '\',\'' + item.lokasi_pabrik + '\',\'' + item.nama_kota + '\',1);"';
						onclick_keterangan = '';
						var btnKeterangan = '';
					}
				} else {
					color_urgent_blink = '';
					date_urgent = moment(item.penjualan_tanggal_kirim).format('DD-MMM');
					btn_color_urgent_blink = 'bg-dark-gray-young text-add-colour-black-soft';
					onclick_urgent = 'onclick="detailPenjualan(\'' + item.dt_record + '\',\'' + item.penjualan_id + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.karyawan_nama + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.tgl_cs_deadline + '\',\'' + item.lokasi_pabrik + '\',\'' + item.nama_kota + '\',1);"';
					onclick_keterangan = '';
					var btnKeterangan = '';
				}

				// var btnPO = '<button class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".detail-spkpo-popup" onclick="spkPo(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\');">Spk PO</button>';
				var btnUrgent = '<button class="' + btn_color_urgent_blink + ' button-small col button popup-open text-bold" data-popup=".detail-sales" ' + onclick_urgent + ' >Urgent</button>';


				moment.locale('id');
				let hari = moment(item.penjualan_tanggal_kirim).format('dddd');

				var tr =
					'<tr>' +
					'<td style="border-bottom: 1px solid gray;border-left: 1px solid gray;" align="center">' + (i + 1) + '</td>' +
					'<td style="border-bottom: 1px solid gray;border-left: 1px solid gray;" align="center"><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>' +
					'<td style="border-bottom: 1px solid gray;border-left: 1px solid gray;">' + item.client_nama + '</td>' +
					'<td style="border-bottom: 1px solid gray;border-left: 1px solid gray;">' + hari + '</td>' +
					'<td style="border-bottom: 1px solid gray;border-left: 1px solid gray;" align="center">' + moment(item.penjualan_tanggal_kirim).format('DD-MMM-YY') + '</td>' +
					'<td style="border-bottom: 1px solid gray;border-left: 1px solid gray;" align="center">' + BadgeHtml(item) + '</td>' +
					// '<td style="border-bottom: 1px solid gray;border-left: 1px solid gray;" align="center">' + btnPO + '</td>' +
					'<td style=border-left: 1px solid gray;border-bottom: 1px solid gray;" align="center">' + btnUrgent + '</td>' +
					'<td style=border-left: 1px solid gray;border-bottom: 1px solid gray;border-right: 1px solid gray;" align="center">' + btnKeterangan + '</td>' +
					'</tr>';

				jQuery('#deadline_penjualan_popup_tbody').append(tr);
			});

			// buka popup
			let $popup = jQuery('.popup-deadline-penjualan');
			if ($popup.length === 0) {
				console.warn('Popup .popup-deadline-penjualan belum ter-append ke halaman.');
				return;
			}

			// ===== Cek apakah popup sudah terbuka =====
			let isOpen = $popup.hasClass('modal-in') || $popup.is(':visible');

			// ===== Jika belum terbuka, buka dulu =====
			if (!isOpen) {
				if (window.app && app.popup && app.popup.open) {
					app.popup.open('.popup-deadline-penjualan');
				} else {
					// fallback jika bukan Framework7
					$popup.show();
					$popup.find('.popup-close').off('click').on('click', function () {
						$popup.hide();
					});
				}
			}
		},
		error: function (xhr) {
			console.error('Gagal cek deadline:', xhr);
		}
	});
}

function ensureRejectPopupExists() {
	if ($('.popup.detail-keterangan-urgent').length > 0) {
		return; // sudah ada
	}

	var popupHtml = ''
		+ '<div class="popup detail-keterangan-urgent">'
		+ '  <div class="view view-init">'
		+ '    <div class="page">'
		+ '      <div class="navbar">'
		+ '        <div class="navbar-bg"></div>'
		+ '        <div class="navbar-inner bg-dark-gray-medium">'
		+ '          <div class="title">Keterangan Produksi</div>'
		+ '          <div class="right">'
		+ '            <p class="text-add-colour-white link popup-close"'
		+ '               data-popup=".detail-keterangan-urgent">'
		+ '              <i style="margin-right:5px;" class="f7-icons">xmark_rectangle_fill</i>'
		+ '            </p>'
		+ '          </div>'
		+ '        </div>'
		+ '      </div>'
		+ '      <div class="page-content">'
		+ '        <div class="card card-outline margin-top">'
		+ '          <div class="card-content">'
		+ '            <div class="row">'
		+ '              <div class="col-100">'
		+ '                <div class="card-content">'
		+ '                  <div class="list no-hairlines-md">'
		+ '                    <div class="list">'
		+ '                      <ul>'
		+ '                        <!-- Tanggal + Hari -->'
		+ '                        <li class="item-content item-input">'
		+ '                          <div class="item-inner">'
		+ '                            <div class="item-title item-label">Tanggal Selesai</div>'
		+ '                            <div class="item-input-wrap">'
		+ '                              <input type="text"'
		+ '                                     id="popup_keterangan_tanggal"'
		+ '                                     readonly'
		+ '                                     >'
		+ '                            </div>'
		+ '                          </div>'
		+ '                        </li>'
		+ '                        <!-- Keterangan -->'
		+ '                        <li class="item-content item-input">'
		+ '                          <div class="item-inner">'
		+ '                            <div class="item-title item-label">Keterangan</div>'
		+ '                            <div class="item-input-wrap">'
		+ '                              <textarea id="popup_keterangan_text"'
		+ '                                        readonly'
		+ '                                        style="min-height:80px;"></textarea>'
		+ '                            </div>'
		+ '                          </div>'
		+ '                        </li>'
		+ '                      </ul>'
		+ '                    </div>'
		+ '                  </div>'
		+ '                </div>'
		+ '              </div>'
		+ '            </div>'
		+ '          </div>'
		+ '        </div>'
		+ '      </div>'
		+ '    </div>'
		+ '  </div>'
		+ '</div>';

	$('body').append(popupHtml);
}

// === 2. Fungsi global untuk render & buka popup ===
// panggil dari button: detailKeterangan(item.keterangan_urgent, date_selesai);
function detailKeterangan(keterangan, date_selesai) {
	ensureRejectPopupExists();

	keterangan = keterangan || '';
	date_selesai = date_selesai || '';

	// FORMAT TANGGAL + HARI (kalau ada moment.js)
	var teksTanggal = '';
	if (date_selesai) {
		// contoh: "Senin, 14-Nov-2025"
		if (typeof moment !== 'undefined') {
			moment.locale('id');
			var hari = moment(date_selesai).format('dddd');
			var tgl = moment(date_selesai).format('DD-MMM-YYYY');
			teksTanggal = hari + ', ' + tgl;
		} else {
			teksTanggal = date_selesai;
		}
	}

	// set nilai ke input popup
	$('#popup_keterangan_tanggal').val(teksTanggal);
	$('#popup_keterangan_text').val(keterangan);

	// buka popup Framework7
	try {
		app.popup.open('.detail-keterangan-urgent');
	} catch (e) {
		var popupEl = document.querySelector('.detail-keterangan-urgent');
		if (popupEl && popupEl.f7Modal) {
			popupEl.f7Modal.open();
		}
	}
}

function hasPendingItems() {

	var TBODY_SEL = '#deadline_penjualan_popup_tbody';
	var $rows = jQuery(TBODY_SEL).find('tr');
	// anggap baris "Memuat…" bukan pending. Pending = ada tr data.
	if ($rows.length === 0) return false;
	if ($rows.length === 1 && $rows.eq(0).find('td').text().trim().match(/^Memuat/i)) return false;
	return true;
}

function alertClosePopupDeadline() {
	if (!hasPendingItems()) return;       // tidak ada data → biarkan tutup
	var msg = 'Masih terdapat Spk yang perlu segera di kirim, dan konfirmasi ke divisi produksi, apakah anda yakin menutup notif ?';
	var POPUP_SEL = '.popup-deadline-penjualan';
	app.dialog.confirm(
		msg,
		'Konfirmasi',
		function onOk() {
			// user setuju menutup
			if (app.popup && app.popup.close) app.popup.close(POPUP_SEL);
			else jQuery(POPUP_SEL).hide();
		},
		function onCancel() {
			// batal → tetap terbuka
		}
	);
}

function renderPopupDeadlineProduksiSelesai() {
	let html_popup = `
		<div class="popup popup-deadline-produksi-selesai">
			<div class="view view-init">
				<div class="page">
					<div class="navbar">
						<div class="navbar-bg"></div>
						<div class="navbar-inner bg-dark-gray-medium">
							<div class="title">Produksi Selesai</div>
							<div class="right">
								<a class="link popup-close" data-popup=".popup-deadline-produksi-selesai" style="color:#fff;" onclick="alertClosePopupProduksiSelesai();">Tutup</a>
							</div>
						</div>
					</div>
					<div class="page-content">
						<div class="table-responsive">
							<table class="table table-sm" style="width:100%;border-collapse:collapse;">
								<thead>
									<tr>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">No</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">SPK</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">Perusahaan</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">Tipe</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">Qty</th>
										<th class="label-cell bg-dark-gray-young" style="border-bottom:1px solid gray;">Aksi</th>
									</tr>
								</thead>
								<tbody id="deadline_produksi_selesai_popup_tbody">
									<tr><td colspan="7" align="center">Memuat…</td></tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>`;
	jQuery('body').append(html_popup);
}

/* =====================================================
   REQUEST QUEUE — jQuery Style
   ===================================================== */

let PAGE_INTERVALS = [];

function addPageInterval(fn, delay) {
	const id = setInterval(fn, delay);
	PAGE_INTERVALS.push(id);
	return id;
}

function clearPageIntervals() {
	PAGE_INTERVALS.forEach(id => clearInterval(id));
	PAGE_INTERVALS = [];
}

// Loader sederhana, gaya kamu
function runWithLoading(fn) {
	// buka loading
	if (window.app && app.preloader && typeof app.preloader.show === 'function') {
		app.preloader.show();
	}

	let result;
	try {
		result = fn();
	} catch (e) {
		console.error('runWithLoading error:', e);
		if (window.app && app.preloader && typeof app.preloader.hide === 'function') {
			app.preloader.hide();
		}
		return;
	}

	// helper tutup loader
	const hideLoader = () => {
		if (window.app && app.preloader && typeof app.preloader.hide === 'function') {
			app.preloader.hide();
		}
	};

	// jQuery ajax / Deferred
	if (result && typeof result.always === 'function') {
		result.always(() => {
			hideLoader();
		});
	}
	// Promise modern
	else if (result && typeof result.finally === 'function') {
		result.finally(() => {
			hideLoader();
		});
	}
	// Promise biasa
	else if (result && typeof result.then === 'function') {
		result.then(() => {
			hideLoader();
		}, () => {
			hideLoader();
		});
	}
	// fungsi sync / nggak return apa-apa
	else {
		// kasih delay dikit biar loader kelihatan
		setTimeout(hideLoader, 400);
	}

	return result;
}

// Queue simpel, satu-per-satu
function RequestQueue() {
	this.running = false;
	this.queue = [];
}

/* Tambah job */
RequestQueue.prototype.push = function (fn) {
	if (typeof fn !== 'function') return;
	this.queue.push(fn);
	this.next();
};

/* Eksekusi job berikutnya */
RequestQueue.prototype.next = function () {
	const self = this;

	if (self.running) return;
	if (!self.queue.length) return;

	self.running = true;

	const job = self.queue.shift(); // ambil job

	try {
		const res = job();

		// jQuery ajax / Deferred
		if (res && typeof res.always === 'function') {
			res.always(() => {
				self.running = false;
				setTimeout(() => {
					self.next();
				}, 100);
			});
		}
		// Promise modern
		else if (res && typeof res.finally === 'function') {
			res.finally(() => {
				self.running = false;
				setTimeout(() => {
					self.next();
				}, 100);
			});
		}
		// Promise biasa
		else if (res && typeof res.then === 'function') {
			res.then(() => {
				self.running = false;
				setTimeout(() => {
					self.next();
				}, 100);
			}, () => {
				self.running = false;
				setTimeout(() => {
					self.next();
				}, 100);
			});
		}
		// fungsi sync
		else {
			self.running = false;
			setTimeout(() => {
				self.next();
			}, 80);
		}
	} catch (e) {
		console.error('RequestQueue error:', e);
		self.running = false;
		setTimeout(() => {
			self.next();
		}, 100);
	}
};

/* Instance global */
var rq = new RequestQueue();

/* Helper biar simpel */
function enqueueTask(fn) {
	rq.push(fn);
}
// helper untuk job background TANPA loader
function enqueueTaskSilent(fn) {
	rq.push(fn);
}

function getYearCustom(element, defaultAll) {
	let startYear = 2018;
	let endYear = new Date().getFullYear();
	if (defaultAll) {
		$('.transaksi_' + element).append($('<option selected/>').val('all').html('All Tahun'));
	} else {
		$('.transaksi_' + element).append($('<option/>').val('all').html('All Tahun'));
	}
	for (i = endYear; i > startYear; i--) {
		if (i == endYear && !defaultAll) {
			$('.transaksi_' + element).append($('<option selected/>').val(i).html(i));
		} else {
			$('.transaksi_' + element).append($('<option />').val(i).html(i));
		}
	}
}

function getMonthCustom(element, defaultAll) {
	var m = moment.months();
	var month_now = moment().month();
	var n = 0;
	if (defaultAll) {
		$('.transaksi_' + element).append($('<option selected/>').val('all').html('All Bulan'));
	} else {
		$('.transaksi_' + element).append($('<option/>').val('all').html('All Bulan'));
	}
	for (var i = 0; i < 12; i++) {
		n++
		if (i == month_now && !defaultAll) {
			$('.transaksi_' + element).append($('<option selected/>').val(n).html(m[i]));
		} else {
			$('.transaksi_' + element).append($('<option />').val(n).html(m[i]));
		}
	}
}

// ============================================================
// EXPEDISI GLOBAL
// Satu set function untuk semua halaman.
// Popup ada di index.html (.popup-expedisi-global, dll)
// Dipanggil dari penjualan, notif, atau halaman lain manapun.
// ============================================================

// State
window._expedisiGlobalData = [];
window._expedisiGlobalCurrentId = null;
window._expedisiGlobalCurrentNama = null;

// ------ BUKA POPUP ------
function openExpedisiGlobal() {
	app.popup.open('.popup-expedisi-global');
	loadDataExpedisiGlobal();
}

// ------ LOAD DAFTAR ------
function loadDataExpedisiGlobal() {
	app.preloader.show();
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/get-expedisi-list',
		dataType: 'JSON',
		data: {},
		success: function (res) {
			app.preloader.hide();
			if (res.status === 200) {
				window._expedisiGlobalData = res.data || [];
				renderExpedisiGlobal(window._expedisiGlobalData);
			} else {
				app.dialog.alert(res.message || 'Gagal memuat data.', 'Error');
			}
		},
		error: function () {
			app.preloader.hide();
			app.dialog.alert('Gagal menghubungi server.', 'Error');
		}
	});
}

// ------ RENDER TABEL ------
function renderExpedisiGlobal(data) {
	var tbody = jQuery('#expedisi-global-tbody');
	jQuery('#expedisi-global-count').text(data.length);

	if (!data || data.length === 0) {
		tbody.html('<tr><td colspan="6" style="padding:30px; text-align:center; color:gray;">' +
			'<i class="f7-icons" style="font-size:40px;">tray</i><br>Tidak ada data expedisi</td></tr>');
		return;
	}

	var html = '';
	jQuery.each(data, function (i, item) {
		var nama = escapeHtmlGlobal(item.perusahaan_acc || '-');
		html += '<tr>';
		html += '<td style="border:1px solid gray;">' + (i + 1) + '</td>';
		html += '<td style="border:1px solid gray; text-align:left;">' + nama + '</td>';
		html += '<td style="border:1px solid gray; text-align:left;">' + escapeHtmlGlobal(item.pic || '-') + '</td>';
		html += '<td style="border:1px solid gray; text-align:left;">' + escapeHtmlGlobal(item.alamat || '-') + '</td>';
		html += '<td style="border:1px solid gray;">' + escapeHtmlGlobal(item.no_telp || '-') + '</td>';
		html += '<td style="border:1px solid gray;">';
		html += '<button class="button button-small button-fill bg-color-blue" ';
		html += 'onclick="showHistoryExpedisiGlobal(' + item.id_perusahaan_acc + ', \'' + nama + '\')" ';
		html += 'style="width:100%;">';
		html += '<i class="f7-icons" style="font-size:14px;">doc_text_search</i> Detail';
		html += '</button>';
		html += '</td>';
		html += '</tr>';
	});
	tbody.html(html);
}

// ------ SEARCH ------
function searchExpedisiGlobal() {
	var keyword = (jQuery('#expedisi-global-search').val() || '').toLowerCase();
	var data = window._expedisiGlobalData || [];
	if (!keyword) { renderExpedisiGlobal(data); return; }
	var filtered = data.filter(function (item) {
		return (item.perusahaan_acc || '').toLowerCase().indexOf(keyword) !== -1
			|| (item.pic || '').toLowerCase().indexOf(keyword) !== -1
			|| (item.alamat || '').toLowerCase().indexOf(keyword) !== -1;
	});
	renderExpedisiGlobal(filtered);
}

// ------ SIMPAN BARU ------
function simpanExpedisiGlobal() {
	var perusahaan = jQuery('#expedisi-global-perusahaan').val().trim();
	if (!perusahaan) { app.dialog.alert('Nama Perusahaan wajib diisi!', 'Perhatian'); return; }

	var payload = {
		perusahaan_acc: perusahaan,
		pic: jQuery('#expedisi-global-pic').val().trim(),
		alamat: jQuery('#expedisi-global-alamat').val().trim(),
		no_telp: jQuery('#expedisi-global-telp').val().trim(),
		nama_bank: jQuery('#expedisi-global-bank').val().trim(),
		no_rekening: jQuery('#expedisi-global-rekening').val().trim(),
		nama_rekening: jQuery('#expedisi-global-nama-rekening').val().trim(),
		user_record: localStorage.getItem('karyawan_nama') || 'System'
	};

	app.preloader.show();
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/create-expedisi',
		dataType: 'JSON',
		data: payload,
		success: function (res) {
			app.preloader.hide();
			if (res.status === 200) {
				app.dialog.alert('Expedisi berhasil ditambahkan!', 'Berhasil', function () {
					// Reset form
					jQuery('#expedisi-global-perusahaan, #expedisi-global-pic, #expedisi-global-alamat, ' +
						'#expedisi-global-telp, #expedisi-global-bank, #expedisi-global-rekening, ' +
						'#expedisi-global-nama-rekening').val('');
					app.popup.close('.popup-tambah-expedisi-global');
					loadDataExpedisiGlobal();
				});
			} else if (res.status === 409) {
				app.dialog.alert('Nama perusahaan sudah terdaftar!', 'Duplikat');
			} else {
				app.dialog.alert(res.message || 'Gagal menyimpan data.', 'Error');
			}
		},
		error: function () {
			app.preloader.hide();
			app.dialog.alert('Gagal menghubungi server.', 'Error');
		}
	});
}

// ------ HISTORY ------
function showHistoryExpedisiGlobal(idExpedisi, namaExpedisi) {
	window._expedisiGlobalCurrentId = idExpedisi;
	window._expedisiGlobalCurrentNama = namaExpedisi;

	jQuery('#expedisi-global-history-nama').text(namaExpedisi);
	jQuery('#expedisi-global-current-id').val(idExpedisi);

	app.popup.open('.popup-history-expedisi-global');
	loadHistoryExpedisiGlobal(idExpedisi);
}

function loadHistoryExpedisiGlobal(idExpedisi) {
	jQuery('#expedisi-global-history-tbody').html(
		'<tr><td colspan="8" style="padding:30px; text-align:center; color:gray;">' +
		'<i class="f7-icons" style="font-size:40px;">arrow_clockwise</i><br>Memuat...</td></tr>'
	);
	app.preloader.show();
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/get-expedisi-history',
		dataType: 'JSON',
		data: { id_expedisi: idExpedisi },
		success: function (res) {
			app.preloader.hide();
			if (res.status === 200) {
				renderHistoryExpedisiGlobal(res.data || []);
			} else if (res.status === 404) {
				renderHistoryExpedisiGlobal([]);
			} else {
				app.dialog.alert(res.message || 'Gagal memuat history.', 'Error');
			}
		},
		error: function () {
			app.preloader.hide();
			app.dialog.alert('Gagal menghubungi server.', 'Error');
		}
	});
}

function renderHistoryExpedisiGlobal(data) {
	var tbody = jQuery('#expedisi-global-history-tbody');
	var emptyEl = document.getElementById('expedisi-global-history-empty');

	jQuery('#expedisi-global-history-count').text(data.length);

	if (!data || data.length === 0) {
		tbody.html('');
		if (emptyEl) emptyEl.style.display = 'block';
		return;
	}
	if (emptyEl) emptyEl.style.display = 'none';

	var html = '';
	var totalNominal = 0;
	jQuery.each(data, function (i, item) {
		var nominal = parseFloat(item.nominal_acc || 0);
		totalNominal += nominal;
		var tanggal = item.tanggal_transaksi ? item.tanggal_transaksi.substring(0, 10) : '-';
		var rute = (item.perusahaan_dari || '-') + ' -> ' + (item.perusahaan_tujuan || '-');

		html += '<tr>';
		html += '<td style="border:1px solid gray;">' + (i + 1) + '</td>';
		html += '<td style="border:1px solid gray;">' + tanggal + '</td>';
		html += '<td style="border:1px solid gray;">' + escapeHtmlGlobal(item.perusahaan_pic || '-') + '</td>';
		html += '<td style="border:1px solid gray;">' + escapeHtmlGlobal(item.perusahaan_no_hp || '-') + '</td>';
		html += '<td style="border:1px solid gray;">' + escapeHtmlGlobal(rute) + '</td>';
		html += '<td style="border:1px solid gray;">' + escapeHtmlGlobal(item.pengirim_acc || '-') + '</td>';
		html += '<td style="border:1px solid gray;">' + escapeHtmlGlobal(item.penerima_acc || '-') + '</td>';
		html += '<td style="border:1px solid gray; text-align:right;"><strong>Rp ' +
			parseFloat(nominal).toLocaleString('id-ID') + '</strong></td>';
		html += '</tr>';
	});
	tbody.html(html);
}

function reloadHistoryExpedisiGlobal() {
	if (window._expedisiGlobalCurrentId) {
		loadHistoryExpedisiGlobal(window._expedisiGlobalCurrentId);
	}
}

// ------ HELPER ------
function escapeHtmlGlobal(text) {
	if (!text) return '';
	return String(text).replace(/[&<>"']/g, function (m) {
		return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
	});
}

// Auto-load saat popup list dibuka
jQuery(document).on('popup:open', '.popup-expedisi-global', function () {
	loadDataExpedisiGlobal();
});

console.log('✅ Expedisi Global loaded');

/**
 * Clean text - remove KAB./KOTA prefix
 */
function cleanText(text) {
	return text.replace(/^(KAB\.|KOTA)\s*/i, '').trim();
}