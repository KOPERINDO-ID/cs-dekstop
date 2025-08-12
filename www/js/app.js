function daysInThisMonth() {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function daysNameInThisMonth() {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDay();
}

function abbreviateNumber(number) {
  var SI_PREFIXES = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: ' Ribu' },
    { value: 1e6, symbol: ' Juta' },
    { value: 1e9, symbol: ' Milyar' },
    { value: 1e12, symbol: ' Triliun' },
  ]
  if (number === 0) return number

  var tier = SI_PREFIXES.filter((n) => number >= n.value).pop()
  var numberFixed = (number / tier.value).toFixed(0)

  return numberFixed + tier.symbol
}


var $$ = Dom7;
var app = new Framework7({
  photoBrowser: {
    type: 'popup',
    toolbar: false
  },
  root: '#app', // App root element
  id: 'id.vertice.tasindosalesapp', // App bundle ID
  name: 'Sales App', // App name
  theme: 'md', // Automatic theme detection
  // App root data
  data: function () {
    return {
    };
  },
  // App root methods
  methods: {
  },
  // App routes
  routes: routes,

  // Input settings
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  on: {
    init: function () {

      var f7 = this;
      if (f7.device.cordova) {
        cordovaApp.init(f7);
      }

      if (localStorage.getItem("login") != "true") {
        $$('#karyawan_nama_header').html('<img src="img/logo/logo_new.png" width="85px" />');
        setTimeout(function () {
          return app.views.main.router.navigate('/login');
        }, 300);
      } else {
        getMenuUser();
        var jabatan = localStorage.getItem("jabatan");
        startTimeMain();
        showLineGraph();
        selectBankPembayaran();
        getPengumuman();
        $$('#karyawan_nama_header').html('<b>' + localStorage.getItem('karyawan_nama') + '</b>');
        console.log(localStorage.getItem('karyawan_nama'));
        getPengumuman();
        $$('#karyawan_nama_header').html('<img src="img/logo/logo_new.png" width="85px" />');
        getPlayAudio();
        setTimeout(function () {
          return app.views.main.router.navigate('/notif');
        }, 300);
      }
    },
  },
});

$$(document).on('page:afterin', '.page[data-name="prospek"]', function (e) {
  getNotifRed();
  getProspekHeaderManager();
  selectBoxSalesProspekManager();
  checkConnection();
  checkLogin();
})

$$(document).on('page:afterin', '.page[data-name="share_link"]', function (e) {
  getNotifRed();
  getMenuUser();
  checkLogin();
  checkConnection();
  getPengumuman();
  getDataKatalogText();
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
});

$$(document).on('page:afterin', '.page[data-name="notif"]', function (e) {
  getNotifRed();
  getMenuUser();
  checkLogin();
  checkConnection();
  getPengumuman();
  changeFilterMenuNotif('proforma');
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
});

$$(document).on('page:afterin', '.page[data-name="delay_go"]', function (e) {
  getMenuUser();
  checkLogin();
  checkConnection();
  getPengumuman();
  getViewDelayManagerShipment();
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
});

$$(document).on('page:afterin', '.page[data-name="kpi"]', function (e) {
  getNotifRed();
  getMenuUser();
  checkLogin();
  checkConnection();
  getPengumuman();
  getTargetInputBroadcastCsNotif();
  dateRangeDeclarationKpi();
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
});

$$(document).on('page:afterin', '.page[data-name="kpi_broadcast"]', function (e) {
  getNotifRed();
  getMenuUser();
  checkLogin();
  checkConnection();
  getPengumuman();
  getTargetBroadcastCsNotif();
  dateRangeDeclarationKpiBroadcast();
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
});

// Page Penjualan On load
$$(document).on('page:afterin', '.page[data-name="penjualan"]', function (e, page) {
  getNotifRed();
  if (page.name == 'penjualan') {
    document.getElementById("page_sales").style.pointerEvents = "none";
  } else {
    document.getElementById("page_sales").style.pointerEvents = "initial";
  }
  checkLogin();
  checkConnection();
  localStorage.removeItem('arsip');
  localStorage.removeItem("menu_notif")
  // openDialogViewManager();
  getYearSalesAdmin();
  selectMonthValues();
  selectBankPembayaran();
  getPengumuman();
  tampilDataManager();
  selectBoxClient();

  $$('#el_ukuran_hc_tambah_1').hide();
  $$('#el_ukuran_ts_tambah_1').hide();
  $$('#el_ukuran_hc_edit_1').hide();
  $$('#el_ukuran_ts_edit_1').hide();
  $$('#el_style_hc_tambah_1').hide();
  $$('#el_style_hc_edit_1').hide();

  $$('#el_ukuran_hc_penjualan_tambah_1').hide();
  $$('#el_ukuran_ts_penjualan_tambah_1').hide();
  $$('#el_ukuran_hc_penjualan_edit_1').hide();
  $$('#el_ukuran_ts_penjualan_edit_1').hide();
  $$('#el_style_hc_penjualan_tambah_1').hide();
  $$('#el_style_hc_penjualan_edit_1').hide();
  $$('#karyawan_nama_header').html('Customer Service');
})

$$(document).on('page:afterin', '.page[data-name="tools"]', function (e) {
  getNotifRed();
  getMenuUser();
  checkLogin();
  checkConnection();
  getPengumuman();
  getDataTools();
  $$('#karyawan_nama_header').html(localStorage.getItem("karyawan_nama"));
});

$$(document).on('page:afterin', '.page[data-name="log"]', function (e) {
  getNotifRed();
  getMenuUser();
  checkLogin();
  checkConnection();
  getPengumuman();
  getDataLogBroadcast();
  $$('#karyawan_nama_header').html(localStorage.getItem("karyawan_nama"));
});

$$(document).on('page:afterin', '.page[data-name="client"]', function (e) {
  getNotifRed();
  getMenuUser();
  checkLogin();
  checkConnection();
  getTargetBroadcastCs();
  changeFilterMenu('sales');
  localStorage.setItem('show_eye', 'tidak_aktif');
  getPengumuman();
  selectBoxKotaBrodacast();
  $$("#tambah_client_telp_broadcast").keypress(function (event) {
    var key = event.which;
    if (!(key >= 48 && key <= 57))
      event.preventDefault();
  });
  $$('#karyawan_nama_header').html(localStorage.getItem("karyawan_nama"));
});


// Page penjualan input On load
$$(document).on('page:afterin', '.page[data-name="penjualan_input"]', function (e) {
  getNotifRed();
  var dtToday = new Date();

  var month = dtToday.getMonth();
  var day = dtToday.getDate();
  var year = dtToday.getFullYear();
  if (month < 10)
    month = '0' + month.toString();
  if (day < 10)
    day = '0' + day.toString();

  var maxDate = year + '-' + month + '-' + day;

  $('.input-item-tanggal-kirim').attr('min', maxDate);
  $('.input-item-tanggal-kirim-single').attr('min', maxDate);



  checkLogin();
  selectBank();
  penjualanGetPerformaData();
  checkConnection();
  getPengumuman();


  jQuery('#tanggal_pemesanan_1').val(moment().format('YYYY-MM-DD'));
  jQuery('#tanggal_pemesanan').val(moment().format('YYYY-MM-DD'));

});

$$(document).on('page:afterin', '.page[data-name="kunjungan"]', function (e) {
  getNotifRed();
  checkLogin();
  getProspekHeader();
  selectBoxClientProspek();
  checkConnection();
  getPengumuman();
})

// Page Home / main On load
$$(document).on('page:afterin', '.page[data-name="home"]', function (e) {
  backToSales();
});

$$(document).on('page:afterin', '.page[data-name="absensi-sales"]', function (e) {
  getNotifRed();
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  $$('#showDataGajiSales').show();
  $$('#showDataValidasiSales').hide();
  $$('#hideDocSales').show();
  $$('#hideDocPeriodeSales').hide();
  $('.clear-btn-color-sales').removeClass("bg-dark-gray-medium");
  $('#colorBtnGajiSales').addClass("bg-dark-gray-medium");
  getDataKaryawanSales();
  checkConnection();
  btnPeriodeSales();
});

$$(document).on('page:afterin', '.page[data-name="data-gaji"]', function (e) {
  getNotifRed();
  console.log(localStorage.getItem("karyawan_nama"));
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
});

$$(document).on('page:afterin', '.page[data-name="surat_jalan"]', function (e) {
  getNotifRed();
  getMenuUser();
  checkLogin();
  getHeaderPenjualanKunjungan(1);
  checkConnection();
  getPengumuman();
});


$$(document).on('page:afterin', '.page[data-name="kunjungan-sales"]', function (e) {
  getNotifRed();
  console.log(localStorage.getItem("karyawan_nama"));
  console.log(localStorage.getItem("id_kunjungan_log"))
  $$("#logo_show").hide();
  checkConnection();
  getProspekHeaderAbsen();
});


// Page penjualan input On load
$$(document).on('page:afterin', '.page[data-name="login"]', function (e) {
  getNotifRed();
  jQuery('#logout_logo').hide();
  app.popup.close();
  checkConnection();
  getPengumuman();
});


$$(document).on('page:afterin', '.page[data-name="point-sales"]', function (e) {
  getNotifRed();
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
  $('#point_bulan_admin').append($('<option>', {
    value: moment().format('M'),
    text: moment().format('MMMM')
  }));

  $('#point_bulan_admin').append($('<option>', {
    value: moment().subtract(1, 'months').format('M'),
    text: moment().subtract(1, 'months').format('MMMM')
  }));
  $('#point_bulan_admin').append($('<option>', {
    value: moment().subtract(2, 'months').format('M'),
    text: moment().subtract(2, 'months').format('MMMM')
  }));
  $('#point_bulan_admin').append($('<option>', {
    value: moment().subtract(3, 'months').format('M'),
    text: moment().subtract(3, 'months').format('MMMM')
  }));
  $('#point_bulan_admin').append($('<option>', {
    value: moment().subtract(4, 'months').format('M'),
    text: moment().subtract(4, 'months').format('MMMM')
  }));
  getSalesAdmin();
  getYearSalesAdmin();
});

$$(document).on('page:afterin', '.page[data-name="point-produksi"]', function (e) {
  getNotifRed();
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
  $('#point_produki_bulan_admin').append($('<option>', {
    value: moment().format('M'),
    text: moment().format('MMMM')
  }));

  $('#point_produki_bulan_admin').append($('<option>', {
    value: moment().subtract(1, 'months').format('M'),
    text: moment().subtract(1, 'months').format('MMMM')
  }));
  $('#point_produki_bulan_admin').append($('<option>', {
    value: moment().subtract(2, 'months').format('M'),
    text: moment().subtract(2, 'months').format('MMMM')
  }));
  $('#point_produki_bulan_admin').append($('<option>', {
    value: moment().subtract(3, 'months').format('M'),
    text: moment().subtract(3, 'months').format('MMMM')
  }));
  $('#point_produki_bulan_admin').append($('<option>', {
    value: moment().subtract(4, 'months').format('M'),
    text: moment().subtract(4, 'months').format('MMMM')
  }));
  getYearProduksiAdmin();
  pointProduksi();
});


$$(document).on('page:afterin', '.page[data-name="history-point-produksi"]', function (e) {
  getNotifRed();
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
  $('#point_history_produki_bulan_admin').append($('<option>', {
    value: moment().format('M'),
    text: moment().format('MMMM')
  }));

  $('#point_history_produki_bulan_admin').append($('<option>', {
    value: moment().subtract(1, 'months').format('M'),
    text: moment().subtract(1, 'months').format('MMMM')
  }));
  $('#point_history_produki_bulan_admin').append($('<option>', {
    value: moment().subtract(2, 'months').format('M'),
    text: moment().subtract(2, 'months').format('MMMM')
  }));
  $('#point_history_produki_bulan_admin').append($('<option>', {
    value: moment().subtract(3, 'months').format('M'),
    text: moment().subtract(3, 'months').format('MMMM')
  }));
  $('#point_history_produki_bulan_admin').append($('<option>', {
    value: moment().subtract(4, 'months').format('M'),
    text: moment().subtract(4, 'months').format('MMMM')
  }));
  getYearHistoryProduksiAdmin();
  historyPointProduksi();
});

$$(document).on('page:afterin', '.page[data-name="history-point-admin"]', function (e) {
  getNotifRed();
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
  $('#point_history_admin_bulan').append($('<option>', {
    value: moment().format('M'),
    text: moment().format('MMMM')
  }));

  $('#point_history_admin_bulan').append($('<option>', {
    value: moment().subtract(1, 'months').format('M'),
    text: moment().subtract(1, 'months').format('MMMM')
  }));
  $('#point_history_admin_bulan').append($('<option>', {
    value: moment().subtract(2, 'months').format('M'),
    text: moment().subtract(2, 'months').format('MMMM')
  }));
  $('#point_history_admin_bulan').append($('<option>', {
    value: moment().subtract(3, 'months').format('M'),
    text: moment().subtract(3, 'months').format('MMMM')
  }));
  $('#point_history_admin_bulan').append($('<option>', {
    value: moment().subtract(4, 'months').format('M'),
    text: moment().subtract(4, 'months').format('MMMM')
  }));
  getYearHistoryPointAdmin();
  historyPointAdmin();
});

$$(document).on('page:afterin', '.page[data-name="point-admin"]', function (e) {
  getNotifRed();
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
  $('#bulan_admin').append($('<option>', {
    value: moment().format('M'),
    text: moment().format('MMMM')
  }));

  $('#bulan_admin').append($('<option>', {
    value: moment().subtract(1, 'months').format('M'),
    text: moment().subtract(1, 'months').format('MMMM')
  }));

  $('#bulan_admin').append($('<option>', {
    value: moment().subtract(2, 'months').format('M'),
    text: moment().subtract(2, 'months').format('MMMM')
  }));
  $('#bulan_admin').append($('<option>', {
    value: moment().subtract(3, 'months').format('M'),
    text: moment().subtract(3, 'months').format('MMMM')
  }));
  $('#bulan_admin').append($('<option>', {
    value: moment().subtract(4, 'months').format('M'),
    text: moment().subtract(4, 'months').format('MMMM')
  }));

  getYearPointAdmin();
  pointAdmin();
});

$$(document).on('page:afterin', '.page[data-name="point-sj"]', function (e) {
  getNotifRed();
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
  $('#bulan_sj').append($('<option>', {
    value: moment().format('M'),
    text: moment().format('MMMM')
  }));

  $('#bulan_sj').append($('<option>', {
    value: moment().subtract(1, 'months').format('M'),
    text: moment().subtract(1, 'months').format('MMMM')
  }));

  $('#bulan_sj').append($('<option>', {
    value: moment().subtract(2, 'months').format('M'),
    text: moment().subtract(2, 'months').format('MMMM')
  }));
  $('#bulan_sj').append($('<option>', {
    value: moment().subtract(3, 'months').format('M'),
    text: moment().subtract(3, 'months').format('MMMM')
  }));
  $('#bulan_sj').append($('<option>', {
    value: moment().subtract(4, 'months').format('M'),
    text: moment().subtract(4, 'months').format('MMMM')
  }));
  getYearPointSj();
  pointSj();
});

$$(document).on('page:afterin', '.page[data-name="history-point-sj"]', function (e) {
  getNotifRed();
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
  $('#point_history_sj_bulan').append($('<option>', {
    value: moment().format('M'),
    text: moment().format('MMMM')
  }));

  $('#point_history_sj_bulan').append($('<option>', {
    value: moment().subtract(1, 'months').format('M'),
    text: moment().subtract(1, 'months').format('MMMM')
  }));
  $('#point_history_sj_bulan').append($('<option>', {
    value: moment().subtract(2, 'months').format('M'),
    text: moment().subtract(2, 'months').format('MMMM')
  }));
  $('#point_history_sj_bulan').append($('<option>', {
    value: moment().subtract(3, 'months').format('M'),
    text: moment().subtract(3, 'months').format('MMMM')
  }));
  $('#point_history_sj_bulan').append($('<option>', {
    value: moment().subtract(4, 'months').format('M'),
    text: moment().subtract(4, 'months').format('MMMM')
  }));
  getYearHistoryPointSj();
  historyPointSj();
});

// Page Katalog On load
$$(document).on('page:afterin', '.page[data-name="katalog"]', function (e) {
  getNotifRed();
  checkLogin();
  getProduk();
  checkConnection();
  getPengumuman();
})


// Page Detail Product On load
$$(document).on('page:afterin', '.page[data-name="detail_product"]', function (e) {
  getNotifRed();
  checkLogin();
  getProdukDetail();
  getProdukWarna();
  checkConnection();
  getPengumuman();
  $$('.switch_frame').on('click', function () {
    jQuery("#main_frame").fadeOut('fast', function () {
      jQuery("#main_frame").fadeIn('fast');
    });
    jQuery("#main_frame").attr("src", jQuery(this).attr('data-src'));
  });
})