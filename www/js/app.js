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

// ========================================
// INTERVAL STATE - DEFINISI GLOBAL
// ========================================
var intervalState = {
  isRunning: false,      // Flag apakah interval sedang berjalan
  lastRunTime: 0,        // Timestamp terakhir interval dijalankan
  runCount: 0,           // Jumlah interval yang sudah berjalan
  skipCount: 0           // Jumlah interval yang di-skip karena masih pending
};


// ========================================
// FUNGSI HELPER: Sequential Function Runner
// Menjalankan fungsi secara bergantian dengan max 2 concurrent
// ========================================
function runFunctionsSequentially(functions, maxConcurrent) {
  maxConcurrent = maxConcurrent || 2;

  console.log('🔄 Starting sequential execution of ' + functions.length + ' functions (max ' + maxConcurrent + ' concurrent)');

  return new Promise(function (resolveAll) {
    var currentIndex = 0;
    var activeCount = 0;
    var completedCount = 0;

    function runNext() {
      if (completedCount >= functions.length) {
        console.log('✅ All functions completed (' + completedCount + '/' + functions.length + ')');
        resolveAll();
        return;
      }

      while (activeCount < maxConcurrent && currentIndex < functions.length) {
        var funcIndex = currentIndex;
        var funcItem = functions[funcIndex];
        currentIndex++;
        activeCount++;

        console.log('▶️  Running: ' + funcItem.name + ' (' + (funcIndex + 1) + '/' + functions.length + ') [Active: ' + activeCount + ']');

        (function (index, item) {
          try {
            var result = item.func();

            if (result && typeof result.then === 'function') {
              result.then(function () {
                onComplete(index, item.name);
              }).catch(function (err) {
                console.error('❌ Error in ' + item.name + ':', err);
                onComplete(index, item.name);
              });
            } else {
              setTimeout(function () {
                onComplete(index, item.name);
              }, 100);
            }
          } catch (error) {
            console.error('❌ Error executing ' + item.name + ':', error);
            onComplete(index, item.name);
          }
        })(funcIndex, funcItem);
      }
    }

    function onComplete(index, name) {
      activeCount--;
      completedCount++;
      console.log('✓ Completed: ' + name + ' (' + completedCount + '/' + functions.length + ') [Active: ' + activeCount + ']');
      runNext();
    }

    runNext();
  });
}

// ========================================
// FUNGSI HELPER: Wrap function untuk compatibility
// ========================================
function wrapFunction(func, name) {
  return function () {
    return new Promise(function (resolve) {
      try {
        func();
        // Tunggu sebentar untuk memastikan AJAX selesai
        setTimeout(resolve, 200);
      } catch (error) {
        console.error('Error in ' + name + ':', error);
        resolve();
      }
    });
  };
}

/**
 * Schedule next interval check
 */
function scheduleNextIntervalCheck(intervalMs) {
  intervalMs = intervalMs || 10000;

  console.log('🔄 Scheduling next interval check in ' + (intervalMs / 1000) + 's');

  setTimeout(function () {
    runIntervalChecksRecursive(intervalMs);
  }, intervalMs);
}

/**
 * Run interval checks recursively
 */
function runIntervalChecksRecursive(intervalMs) {
  // ⭐ CEK APAKAH MASIH ADA YANG RUNNING ⭐
  if (intervalState.isRunning) {
    intervalState.skipCount++;
    console.log('⏸️  Interval check SKIPPED (previous check still running) - Skip count: ' + intervalState.skipCount);

    // Jadwal ulang check berikutnya
    scheduleNextIntervalCheck(intervalMs);
    return;  // ⭐ KELUAR TANPA MENJALANKAN CHECK ⭐
  }

  // ⭐ SET FLAG RUNNING ⭐
  intervalState.isRunning = true;
  intervalState.runCount++;

  console.log('🔄 Interval check #' + intervalState.runCount + ' started (Skip: ' + intervalState.skipCount + ')');

  var startTime = Date.now();

  // Jalankan fungsi secara sequential
  runFunctionsSequentially([
    {
      name: 'internetCheckQueue',
      func: function () {
        return new Promise(function (resolve) {
          try {
            internetCheckQueue.check();
            setTimeout(resolve, 100);
          } catch (error) {
            console.error('Error in internetCheckQueue:', error);
            resolve();
          }
        });
      }
    },
    {
      name: 'getNotifDelayRed',
      func: function () {
        return new Promise(function (resolve) {
          try {
            getNotifDelayRed();
            setTimeout(resolve, 100);
          } catch (error) {
            console.error('Error in getNotifDelayRed:', error);
            resolve();
          }
        });
      }
    },
    {
      name: 'getNotifRed',
      func: function () {
        return new Promise(function (resolve) {
          try {
            getNotifRed();
            setTimeout(resolve, 100);
          } catch (error) {
            console.error('Error in getNotifRed:', error);
            resolve();
          }
        });
      }
    }
  ], 2).then(function () {
    // ⭐ SEMUA FUNGSI SELESAI ⭐
    var duration = Date.now() - startTime;
    intervalState.lastRunTime = Date.now();
    intervalState.isRunning = false;  // ⭐ RESET FLAG ⭐

    console.log('✅ Interval check #' + intervalState.runCount + ' completed in ' + duration + 'ms');

    // Schedule next check
    scheduleNextIntervalCheck(intervalMs);

  }).catch(function (error) {
    // ⭐ ERROR HANDLING ⭐
    console.error('❌ Interval check error:', error);
    intervalState.isRunning = false;  // ⭐ RESET FLAG MESKIPUN ERROR ⭐

    // Tetap schedule next check
    scheduleNextIntervalCheck(intervalMs);
  });
}

/**
 * Start interval checks using recursive setTimeout
 */
function startIntervalChecksRecursive(intervalMs) {
  intervalMs = intervalMs || 10000;

  console.log('🚀 Starting recursive interval checks every ' + (intervalMs / 1000) + 's');
  console.log('⚠️  Skip mechanism: ENABLED (will skip if previous check still running)');

  // Reset counters
  intervalState.isRunning = false;
  intervalState.runCount = 0;
  intervalState.skipCount = 0;

  // Run first check
  runIntervalChecksRecursive(intervalMs);
}

var PageLoadTracker = {
  loadedPages: {},
  loadTimeout: 5000, // 5 detik cooldown

  canLoad: function (pageName) {
    var now = Date.now();
    var lastLoad = this.loadedPages[pageName] || 0;

    if (now - lastLoad < this.loadTimeout) {
      console.log('Page ' + pageName + ' sudah di-load baru-baru ini, skip...');
      return false;
    }

    this.loadedPages[pageName] = now;
    return true;
  },

  reset: function (pageName) {
    if (pageName) {
      delete this.loadedPages[pageName];
    } else {
      this.loadedPages = {};
    }
  }
};


var $$ = Dom7;
var app = new Framework7({
  photoBrowser: {
    type: 'popup',
    toolbar: false
  },
  root: '#app',
  id: 'id.vertice.tasindosalesapp',
  name: 'Sales App',
  theme: 'md',
  data: function () {
    return {};
  },
  methods: {},
  routes: routes,
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  view: {
    pushState: true,
    cacheDynamicPages: false, // ← nonaktifkan cache
    reloadPages: true,        // ← selalu reload halaman
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
        // ============================================
        // PERBAIKAN: Init notification SETELAH deviceready
        // ============================================
        console.log('[App] User logged in, initializing notification...');

        // Cek apakah Cordova app
        if (f7.device.cordova) {
          console.log('[App] Cordova app detected, waiting for deviceready...');

          // Set flag untuk track deviceready
          if (!window.cordovaDeviceReady) {
            document.addEventListener('deviceready', function () {
              console.log('[App] ✅ deviceready event fired!');
              window.cordovaDeviceReady = true;

              // Init notification setelah deviceready
              initNotificationManagerOnStartup();
              getMenuUser();
            }, false);
          } else {
            // deviceready sudah fired sebelumnya
            console.log('[App] deviceready already fired, init now');
            initNotificationManagerOnStartup();
          }
        } else {
          // Bukan Cordova app (web browser)
          console.log('[App] Not a Cordova app, init directly');
          setTimeout(function () {
            initNotificationManagerOnStartup();
          }, 500);
        }

        var jabatan = localStorage.getItem("jabatan");

        $$('#karyawan_nama_header').html('<b>' + localStorage.getItem('karyawan_nama') + '</b>');
        $$('#karyawan_nama_header').html('<img src="img/logo/logo_new.png" width="85px" />');

        // ========================================
        // START INTERVAL CHECKS
        // Tunggu 2 detik setelah app init untuk stabilitas
        // ========================================
        setTimeout(function () {
          console.log('🎯 User logged in - Starting interval checks...');
          startIntervalChecksRecursive(10000); // 10 detik interval
        }, 2000);
        startTimeMain();
        setTimeout(function () {
          return app.views.main.router.navigate('/notif');
        }, 300);
      }
    },
  },
});

// ========================================
// PAGE HANDLERS - SISTEM SEQUENTIAL (MAX 2 CONCURRENT)
// ========================================

$$(document).on('page:afterin', '.page[data-name="prospek"]', function (e) {
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getProspekHeaderManager', func: wrapFunction(getProspekHeaderManager, 'getProspekHeaderManager') },
    { name: 'selectBoxSalesProspekManager', func: wrapFunction(selectBoxSalesProspekManager, 'selectBoxSalesProspekManager') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
})

$$(document).on('page:afterin', '.page[data-name="surat_jalan_admin"]', function (e) {
  clearPageIntervals();

  jQuery('.role_pusat').hide();
  jQuery('.role_asia').hide();
  $$("#logo_show").hide();

  runFunctionsSequentially([
    { name: 'getBulanSummarySjAdmin', func: wrapFunction(getBulanSummarySjAdmin, 'getBulanSummarySjAdmin') },
    { name: 'getYearSummarySjAdmin', func: wrapFunction(getYearSummarySjAdmin, 'getYearSummarySjAdmin') },
    { name: 'getSuratJalanCs', func: wrapFunction(getSuratJalanCs, 'getSuratJalanCs') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="share_link"]', function (e) {
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getDataKatalogText', func: wrapFunction(getDataKatalogText, 'getDataKatalogText') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="notif"]', function (e) {
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  if (localStorage.getItem('username') === 'CSO') {
    $$('#bayarFilterMenuNotif').show();
    $$('#shipmentFilterMenuNotif').show();
    $$('#kirimFilterMenuNotif').show();
    $$('#proformaFilterMenuNotif').hide();
    $$('#salesFilterMenuNotif').hide();
    changeFilterMenuNotif('bayar');
  } else {
    $$('#proformaFilterMenuNotif').show();
    $$('#salesFilterMenuNotif').show();
    $$('#bayarFilterMenuNotif').hide();
    $$('#shipmentFilterMenuNotif').hide();
    $$('#kirimFilterMenuNotif').hide();
    changeFilterMenuNotif('proforma');
  }

  runFunctionsSequentially([
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="delay_go"]', function (e) {
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getViewDelayManagerShipment', func: wrapFunction(getViewDelayManagerShipment, 'getViewDelayManagerShipment') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="kpi"]', function (e) {
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getTargetInputBroadcastCsNotif', func: wrapFunction(getTargetInputBroadcastCsNotif, 'getTargetInputBroadcastCsNotif') },
    { name: 'dateRangeDeclarationKpi', func: wrapFunction(dateRangeDeclarationKpi, 'dateRangeDeclarationKpi') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="kpi_broadcast"]', function (e) {
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'dateRangeDeclarationKpiBroadcast', func: wrapFunction(dateRangeDeclarationKpiBroadcast, 'dateRangeDeclarationKpiBroadcast') },
    { name: 'getTargetBroadcastCsNotif', func: wrapFunction(getTargetBroadcastCsNotif, 'getTargetBroadcastCsNotif') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="penjualan"]', function (e, page) {
  if (page.name == 'penjualan') {
    document.getElementById("page_sales").style.pointerEvents = "none";
  } else {
    document.getElementById("page_sales").style.pointerEvents = "initial";
  }
  localStorage.removeItem('arsip');
  localStorage.removeItem("menu_notif")

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

  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getYearSalesAdmin', func: wrapFunction(getYearSalesAdmin, 'getYearSalesAdmin') },
    { name: 'selectBoxSales', func: wrapFunction(selectBoxSales, 'selectBoxSales') },
    { name: 'getBulanTransaksiPerforma', func: wrapFunction(getBulanTransaksiPerforma, 'getBulanTransaksiPerforma') },
    { name: 'getYearTransaksiPerforma', func: wrapFunction(getYearTransaksiPerforma, 'getYearTransaksiPerforma') },
    { name: 'getBulanTransaksiPenjualan', func: wrapFunction(getBulanTransaksiPenjualan, 'getBulanTransaksiPenjualan') },
    { name: 'getYearTransaksiPenjualan', func: wrapFunction(getYearTransaksiPenjualan, 'getYearTransaksiPenjualan') },
    { name: 'selectMonthValues', func: wrapFunction(selectMonthValues, 'selectMonthValues') },
    { name: 'selectBankPembayaran', func: wrapFunction(selectBankPembayaran, 'selectBankPembayaran') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') },
    { name: 'tampilDataManager', func: wrapFunction(tampilDataManager, 'tampilDataManager') }
  ], 2);
})

$$(document).on('page:afterin', '.page[data-name="tools"]', function (e) {
  $$('#karyawan_nama_header').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getDataTools', func: wrapFunction(getDataTools, 'getDataTools') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="log"]', function (e) {
  $$('#karyawan_nama_header').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getDataLogBroadcast', func: wrapFunction(getDataLogBroadcast, 'getDataLogBroadcast') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="client"]', function (e) {
  localStorage.setItem('show_eye', 'tidak_aktif');

  // Hanya izinkan angka pada input telp
  $$("#tambah_client_telp_broadcast").keypress(function (event) {
    var key = event.which;
    if (!(key >= 48 && key <= 57)) event.preventDefault();
  });

  $$('#karyawan_nama_header').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'selectBoxKotaBrodacast', func: wrapFunction(selectBoxKotaBrodacast, 'selectBoxKotaBrodacast') },
    { name: 'getDataClientHead', func: wrapFunction(getDataClientHead, 'getDataClientHead') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') },
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="penjualan_input"]', function (e) {
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

  jQuery('#tanggal_pemesanan_1').val(moment().format('YYYY-MM-DD'));
  jQuery('#tanggal_pemesanan').val(moment().format('YYYY-MM-DD'));

  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'selectBank', func: wrapFunction(selectBank, 'selectBank') },
    { name: 'penjualanGetPerformaData', func: wrapFunction(penjualanGetPerformaData, 'penjualanGetPerformaData') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="kunjungan"]', function (e) {
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getProspekHeader', func: wrapFunction(getProspekHeader, 'getProspekHeader') },
    { name: 'selectBoxClientProspek', func: wrapFunction(selectBoxClientProspek, 'selectBoxClientProspek') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
})

$$(document).on('page:afterin', '.page[data-name="home"]', function (e) {
  backToSales();
});

$$(document).on('page:afterin', '.page[data-name="absensi-sales"]', function (e) {
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  $$('#showDataGajiSales').show();
  $$('#showDataValidasiSales').hide();
  $$('#hideDocSales').show();
  $$('#hideDocPeriodeSales').hide();
  $('.clear-btn-color-sales').removeClass("bg-dark-gray-medium");
  $('#colorBtnGajiSales').addClass("bg-dark-gray-medium");

  runFunctionsSequentially([
    { name: 'getDataKaryawanSales', func: wrapFunction(getDataKaryawanSales, 'getDataKaryawanSales') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'btnPeriodeSales', func: wrapFunction(btnPeriodeSales, 'btnPeriodeSales') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="data-gaji"]', function (e) {
  console.log(localStorage.getItem("karyawan_nama"));
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
});

$$(document).on('page:afterin', '.page[data-name="surat_jalan"]', function (e) {
  runFunctionsSequentially([
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'getHeaderPenjualanKunjungan', func: wrapFunction(function () { getHeaderPenjualanKunjungan(1); }, 'getHeaderPenjualanKunjungan') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="kunjungan-sales"]', function (e) {
  console.log(localStorage.getItem("karyawan_nama"));
  console.log(localStorage.getItem("id_kunjungan_log"))
  $$("#logo_show").hide();

  runFunctionsSequentially([
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getProspekHeaderAbsen', func: wrapFunction(getProspekHeaderAbsen, 'getProspekHeaderAbsen') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="login"]', function (e) {
  jQuery('#logout_logo').hide();
  app.popup.close();

  runFunctionsSequentially([
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="point-sales"]', function (e) {
  $$("#logo_show").hide();
  $$("#nama_absen").hide();
  checkConnection();
  changeFilterSubMenu('komisi');
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

  runFunctionsSequentially([
    { name: 'getSalesAdmin', func: wrapFunction(getSalesAdmin, 'getSalesAdmin') },
    { name: 'getYearSalesAdmin', func: wrapFunction(getYearSalesAdmin, 'getYearSalesAdmin') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="point-produksi"]', function (e) {
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

  runFunctionsSequentially([
    { name: 'getYearProduksiAdmin', func: wrapFunction(getYearProduksiAdmin, 'getYearProduksiAdmin') },
    { name: 'pointProduksi', func: wrapFunction(pointProduksi, 'pointProduksi') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="history-point-produksi"]', function (e) {
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

  runFunctionsSequentially([
    { name: 'getYearHistoryProduksiAdmin', func: wrapFunction(getYearHistoryProduksiAdmin, 'getYearHistoryProduksiAdmin') },
    { name: 'historyPointProduksi', func: wrapFunction(historyPointProduksi, 'historyPointProduksi') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="history-point-admin"]', function (e) {
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

  runFunctionsSequentially([
    { name: 'getYearHistoryPointAdmin', func: wrapFunction(getYearHistoryPointAdmin, 'getYearHistoryPointAdmin') },
    { name: 'historyPointAdmin', func: wrapFunction(historyPointAdmin, 'historyPointAdmin') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="point-admin"]', function (e) {
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

  runFunctionsSequentially([
    { name: 'getYearPointAdmin', func: wrapFunction(getYearPointAdmin, 'getYearPointAdmin') },
    { name: 'pointAdmin', func: wrapFunction(pointAdmin, 'pointAdmin') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="point-sj"]', function (e) {
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

  runFunctionsSequentially([
    { name: 'getYearPointSj', func: wrapFunction(getYearPointSj, 'getYearPointSj') },
    { name: 'pointSj', func: wrapFunction(pointSj, 'pointSj') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="history-point-sj"]', function (e) {
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

  runFunctionsSequentially([
    { name: 'getYearHistoryPointSj', func: wrapFunction(getYearHistoryPointSj, 'getYearHistoryPointSj') },
    { name: 'historyPointSj', func: wrapFunction(historyPointSj, 'historyPointSj') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="katalog"]', function (e) {
  runFunctionsSequentially([
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'getProduk', func: wrapFunction(getProduk, 'getProduk') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
})

$$(document).on('page:afterin', '.page[data-name="detail_product"]', function (e) {
  runFunctionsSequentially([
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'getProdukDetail', func: wrapFunction(getProdukDetail, 'getProdukDetail') },
    { name: 'getProdukWarna', func: wrapFunction(getProdukWarna, 'getProdukWarna') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);

  $$('.switch_frame').on('click', function () {
    jQuery("#main_frame").fadeOut('fast', function () {
      jQuery("#main_frame").fadeIn('fast');
    });
    jQuery("#main_frame").attr("src", jQuery(this).attr('data-src'));
  });
})

$$(document).on('page:afterin', '.page[data-name="tagihan"]', function (e) {
  $$('#karyawan-nama').html(localStorage.getItem("karyawan_nama"));
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getDataTagihan', func: wrapFunction(getDataTagihan, 'getDataTagihan') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'getYearCustom', func: wrapFunction(function () { getYearCustom('tagihan_years', true); }, 'getYearCustom') },
    { name: 'getMonthCustom', func: wrapFunction(function () { getMonthCustom('tagihan_bulan', true); }, 'getMonthCustom') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:afterin', '.page[data-name="sales-csm"]', function (e) {
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getYearSalesAdminCSM', func: wrapFunction(getYearSalesAdminCSM, 'getYearSalesAdminCSM') },
    { name: 'getYearSalesAdminCSM', func: wrapFunction(getYearSalesAdminCSM, 'getYearSalesAdminCSM') },
    { name: 'getPenjualanHeaderCSM', func: wrapFunction(getPenjualanHeaderCSM, 'getPenjualanHeaderCSM') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'getPerformaHeaderPenjualanCSM', func: wrapFunction(getPerformaHeaderPenjualanCSM, 'getPerformaHeaderPenjualanCSM') },
    { name: 'dateRangeDeclarationPenjualanCSM', func: wrapFunction(dateRangeDeclarationPenjualanCSM, 'dateRangeDeclarationPenjualanCSM') },
    { name: 'initCalendarRangePerformaCSM', func: wrapFunction(initCalendarRangePerformaCSM, 'initCalendarRangePerformaCSM') },
    { name: 'selectBankPembayaran', func: wrapFunction(selectBankPembayaran, 'selectBankPembayaran') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);

  $$('#el_ukuran_hc_tambah_1_csm').hide();
  $$('#el_ukuran_ts_tambah_1_csm').hide();
  $$('#el_ukuran_hc_edit_1_csm').hide();
  $$('#el_ukuran_ts_edit_1_csm').hide();
  $$('#el_style_hc_tambah_1_csm').hide();
  $$('#el_style_hc_edit_1_csm').hide();

  $$('#el_ukuran_hc_penjualan_tambah_1_csm').hide();
  $$('#el_ukuran_ts_penjualan_tambah_1_csm').hide();
  $$('#el_ukuran_hc_penjualan_edit_1_csm').hide();
  $$('#el_ukuran_ts_penjualan_edit_1_csm').hide();
  $$('#el_style_hc_penjualan_tambah_1_csm').hide();
  $$('#el_style_hc_penjualan_edit_1_csm').hide();
  localStorage.removeItem('arsip');
})

$$(document).on('page:afterin', '.page[data-name="katalog-csm"]', function (e) {
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getProduk', func: wrapFunction(getProduk, 'getProduk') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
})

$$(document).on('page:beforeremove', '.page[data-name="katalog-csm"]', function () {
  PageLoadTracker.reset('katalog-csm');
});

$$(document).on('page:afterin', '.page[data-name="visit-csm"]', function (e) {
  clearPageIntervals();
  runFunctionsSequentially([
    { name: 'loadVisitList', func: wrapFunction(loadVisitList, 'loadVisitList') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);
});

$$(document).on('page:beforein', '.page[data-name="performa_input"]', function () {
  console.log('📄 Performa Input page beforein');

  // Reset state jika bukan edit mode
  if (localStorage.getItem('edit_performa_mode') !== 'true') {
    isEditMode = false;
    editPerformaHeaderId = null;
    editPerformaData = null;

    // Reset UI ke normal
    $$('#edit_mode_badge').remove();
    $$('#performa_input_button_save span').text('Simpan');
    $$('.smart-select-perusahaan').removeClass('disabled');
    $$('.smart-select-perusahaan').css('pointer-events', '');
    $$('.smart-select-perusahaan').css('opacity', '');
    $$('#show-add-perusahaan').show();
  }
});

$$(document).on('page:afterin', '.page[data-name="performa_input"]', function (e) {
  checkLogin();
  selectBoxClient();
  $$('#count_performa').val($$('.performa_group_field_count').length);
  jQuery('.input-item-price').mask('000,000,000,000', { reverse: true });
  jQuery('.input-item-potongan-price').mask('000,000,000,000', { reverse: true });
  checkConnection();
  getPengumuman();
  $$('#el_ukuran_hc_1').hide();
  $$('#el_ukuran_ts_1').hide();
  $$('#el_style_hc_1').hide();
  $$('#el_material_hc_1').hide();
  clearArray();
  $$('#bank-section-performa').hide();
  // $("#show-add-perusahaan").hide();
  if (localStorage.getItem('username') != 'Stn') {
    // $("#display_extra").css({ display: "none" });
    $("#display_stock").css({ display: "none" });
  }

  // Check edit mode
  checkEditMode();

  // Initialize edit mode process handler
  initEditModeProcessHandler();
  setTimeout(function () {
    initBankChangeHandler();
  }, 500);

  // $('#extra').on('click', function () {
  //   if ($$('#extra').is(':checked')) {
  //     $("#pilihWilayah").css({ display: "initial" });
  //   } else {
  //     $("#pilihWilayah").css({ display: "none" });
  //     $('#wilayah').val('');
  //     $('#wilayah').trigger('change')
  //   }
  // });

  $$(document).on('blur', '.performa-input.input-item-qty', function () {
    var currentQty = $$(this).val();
    if (!currentQty || currentQty === '' || parseInt(currentQty) === 0) {
      $$(this).val('100');
      var count = $$(this).attr('id').replace('qty_', '');
      console.log('Auto-filled qty_' + count + ' to 100');
      // Trigger recalculation
      changeTotalValue(count);
    }
  });
});

$$(document).on('page:afterin', '.page[data-name="pengiriman"]', function (e) {
  clearPageIntervals();

  runFunctionsSequentially([
    { name: 'getViewDelayManagerShipment', func: wrapFunction(getViewDelayManagerShipment, 'getViewDelayManagerShipment') },
    { name: 'getMenuUser', func: wrapFunction(getMenuUser, 'getMenuUser') },
    { name: 'checkLogin', func: wrapFunction(checkLogin, 'checkLogin') },
    { name: 'checkConnection', func: wrapFunction(checkConnection, 'checkConnection') },
    { name: 'getPengumuman', func: wrapFunction(getPengumuman, 'getPengumuman') }
  ], 2);

  // Init langsung — tidak perlu masuk antrian
  PengirimanPage.init();
});

// ============================================
// NOTIFICATION MANAGER HELPER FUNCTIONS
// ============================================

/**
 * Init NotificationManager saat app startup (user sudah login sebelumnya)
 * MODE: STARTUP - Load dari localStorage, tidak fetch dari server
 */
function initNotificationManagerOnStartup() {
  var userId = localStorage.getItem("user_id");

  if (!userId) {
    console.log('[App] No user_id, skipping notification init');
    return;
  }

  console.log('[App] 🚀 Initializing NotificationManager on startup');
  console.log('[App]    User ID:', userId);
  console.log('[App]    Mode: STARTUP (no fetch)');

  // Cek NotificationManager tersedia
  if (typeof NotificationManager === 'undefined') {
    console.error('[App] ❌ NotificationManager not loaded!');
    console.error('[App]    Make sure notification.js is included in index.html');
    return;
  }

  // Update API URL
  if (typeof BASE_API !== 'undefined') {
    NotificationManager.config.apiUrl = BASE_API;
    console.log('[App]    API URL:', BASE_API);
  }

  // Init dengan forceRefresh = FALSE
  // Ini akan:
  // 1. Load notifikasi dari localStorage
  // 2. Setup UI listeners
  // 3. Setup Firebase listeners (jika token sudah ada)
  // 4. TIDAK fetch dari server
  // 5. TIDAK request token baru
  NotificationManager.init(userId, false);

  console.log('[App] ✅ NotificationManager initialized (startup mode)');
}

/**
 * Init NotificationManager setelah login berhasil
 * MODE: LOGIN - Request token, register ke server, fetch dari server
 */
function initNotificationManagerAfterLogin() {
  var userId = localStorage.getItem("user_id");

  if (!userId) {
    console.error('[Login] ❌ No user_id after login');
    return;
  }

  console.log('[Login] 🚀 Initializing NotificationManager after login');
  console.log('[Login]    User ID:', userId);
  console.log('[Login]    Mode: LOGIN (full init)');

  // Cek NotificationManager tersedia
  if (typeof NotificationManager === 'undefined') {
    console.error('[Login] ❌ NotificationManager not loaded!');
    return;
  }

  // Update API URL
  if (typeof BASE_API !== 'undefined') {
    NotificationManager.config.apiUrl = BASE_API;
    console.log('[Login]    API URL:', BASE_API);
  }

  // CRITICAL: Cek apakah Cordova ready
  if (typeof cordova !== 'undefined') {
    console.log('[Login] 📱 Cordova detected');

    if (window.cordovaDeviceReady) {
      // deviceready sudah fired
      console.log('[Login] ✅ deviceready already fired, init now');
      _doInitNotificationLogin(userId);
    } else {
      // Tunggu deviceready
      console.log('[Login] ⏳ Waiting for deviceready event...');

      // Set timeout sebagai fallback
      var timeoutId = setTimeout(function () {
        console.warn('[Login] ⚠️ deviceready timeout, init anyway');
        _doInitNotificationLogin(userId);
      }, 5000); // 5 detik timeout

      document.addEventListener('deviceready', function deviceReadyHandler() {
        console.log('[Login] ✅ deviceready fired!');
        clearTimeout(timeoutId);
        window.cordovaDeviceReady = true;

        // Remove listener to prevent multiple calls
        document.removeEventListener('deviceready', deviceReadyHandler);

        _doInitNotificationLogin(userId);
      }, false);
    }
  } else {
    // Bukan Cordova app
    console.log('[Login] 🌐 Not Cordova, init directly');
    setTimeout(function () {
      _doInitNotificationLogin(userId);
    }, 500);
  }
}

/**
 * Actual initialization setelah deviceready
 */
function _doInitNotificationLogin(userId) {
  console.log('[Login] 🔧 _doInitNotificationLogin executing...');

  // Debug: Cek Firebase plugin availability
  if (typeof cordova !== 'undefined') {
    console.log('[Login] 🔍 Debug Info:');
    console.log('[Login]    cordova.platformId:', cordova.platformId);
    console.log('[Login]    cordova.plugins:', cordova.plugins ? Object.keys(cordova.plugins).join(', ') : 'undefined');

    if (cordova.plugins && cordova.plugins.firebase) {
      console.log('[Login]    ✅ cordova.plugins.firebase exists');
      console.log('[Login]    firebase properties:', Object.keys(cordova.plugins.firebase).join(', '));

      if (cordova.plugins.firebase.messaging) {
        console.log('[Login]    ✅ firebase.messaging exists!');
      } else {
        console.error('[Login]    ❌ firebase.messaging NOT FOUND');
      }
    } else {
      console.error('[Login]    ❌ cordova.plugins.firebase NOT FOUND');
      console.error('[Login]    Available plugins:', cordova.plugins ? Object.keys(cordova.plugins).join(', ') : 'none');
    }
  }

  // Init dengan forceRefresh = TRUE
  // Ini akan:
  // 1. Request notification permission
  // 2. Get FCM token dari Firebase
  // 3. Register token ke server
  // 4. Setup Firebase listeners
  // 5. Fetch notifications dari server
  console.log('[Login] 🎯 Calling NotificationManager.init(userId, true)...');
  NotificationManager.init(userId, true);

  console.log('[Login] ✅ NotificationManager.init called');

  // Force refresh token setelah delay untuk memastikan Firebase ready
  setTimeout(function () {
    console.log('[Login] 🔄 Force refreshing FCM token...');

    if (NotificationManager.isFirebaseAvailable && NotificationManager.isFirebaseAvailable()) {
      console.log('[Login]    ✅ Firebase available, getting token');

      if (typeof NotificationManager.getFirebaseToken === 'function') {
        NotificationManager.getFirebaseToken();
      } else {
        console.warn('[Login]    ⚠️ getFirebaseToken method not found');
      }
    } else {
      console.error('[Login]    ❌ Firebase NOT available!');
      console.error('[Login]    Possible causes:');
      console.error('[Login]    1. Plugin not installed: cordova plugin add cordova-plugin-firebase-messaging');
      console.error('[Login]    2. google-services.json missing');
      console.error('[Login]    3. App not built for Android');
      console.error('[Login]    4. deviceready not fired yet (should not happen here)');
    }
  }, 2000);
}

/**
 * Cleanup NotificationManager sebelum logout
 */
function cleanupNotificationManager(callback) {
  console.log('[App] 🧹 Cleaning up NotificationManager...');

  if (typeof NotificationManager !== 'undefined') {
    NotificationManager.cleanup(function () {
      console.log('[App] ✅ NotificationManager cleaned up');
      if (callback) callback();
    });
  } else {
    console.warn('[App] ⚠️ NotificationManager not found, skipping cleanup');
    if (callback) callback();
  }
}