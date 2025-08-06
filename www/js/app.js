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

        setTimeout(function () {
          return app.views.main.router.navigate('/notif');
        }, 300);
      }
    },
  },
});

$$(document).on('page:afterin', '.page[data-name="notif"]', function (e) {
  getMenuUser();
  checkLogin();
  checkConnection();
  getPengumuman();
  changeFilterMenuNotif('proforma');
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
});


// Page Home / main On load
$$(document).on('page:afterin', '.page[data-name="home"]', function (e) {
  backToSales();
});

// Page penjualan input On load
$$(document).on('page:afterin', '.page[data-name="login"]', function (e) {
  jQuery('#logout_logo').hide();
  app.popup.close();
  checkConnection();
  getPengumuman();
});
