// ============================================================
//  pengiriman.js
//  Sub Menu: Ekspedisi (Master) & Transaksi
//  Framework7 v7 + Cordova
// ============================================================

var PengirimanPage = (function () {

    // -------------------------------------------------------
    // STATE
    // -------------------------------------------------------
    var activeTab = 'master';

    // Mock data — ganti dengan pemanggilan API nyata
    var dataMaster = [
        { id: 1, nama: 'PT MULYAGUNA', pic: 'SUPRIADI', alamat: 'Jalan Hayam Wuruk 48E', noTelp: '08123456789', noRekening: '4300123456', skor: 85 },
        { id: 2, nama: 'PT JAYA LOGISTIK', pic: 'SUPRIADI', alamat: 'Jalan Raya Darmo 12', noTelp: '08129876543', noRekening: '1200123456', skor: 88 },
    ];

    var dataTransaksi = [
        { id: 1, kode: 'SHIP-100326-001', nama: 'PT MULYAGUNA', pic: 'SUPRIADI', rute: 'KOTA SIDOARJO > KOTA JAKARTA TIMUR', noTelp: '08123456789', noRekening: '4300123456', skor: 85, tglKirim: '2026-02-11', tglSampai: '2026-03-08' },
        { id: 2, kode: 'SHIP-120326-002', nama: 'PT JAYA LOGISTIK', pic: 'SUPRIADI', rute: 'KOTA SIDOARJO > KOTA JAKARTA PUSAT', noTelp: '08123456789', noRekening: '1200123456', skor: 88, tglKirim: '2026-02-14', tglSampai: '2026-03-24' },
    ];

    // -------------------------------------------------------
    // STYLE CONSTANTS
    // -------------------------------------------------------
    var S = {
        headerBg: '#1a3a5c',
        headerTxt: '#ffffff',
        rowBg: '#ffffff',
        rowAltBg: '#f5f5f5',
        rowTxt: '#111111',
        borderClr: '#cccccc',
        infoBg: '#1565c0',
        infoTxt: '#ffffff',
        subInactive: '#9e9e9e',
        subActive: '#1a3a5c',
        btnDetail: '#b0bec5',
        tglOk: '#2e7d32',
        tglLate: '#c62828',
    };

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------
    function formatTgl(dateStr) {
        if (!dateStr) return '-';
        var d = new Date(dateStr);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    function tglSampaiStyle(dateStr) {
        if (!dateStr) return S.headerBg;
        var tgl = new Date(dateStr);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return tgl >= today ? S.tglOk : S.tglLate;
    }

    var thStyle = 'padding:6px 8px; text-align:left; color:' + S.headerTxt + '; font-size:12px; font-weight:600; white-space:nowrap; border-right:1px solid #2a5080;';
    var thCenterStyle = thStyle + ' text-align:center;';

    function tdStyle(idx) {
        var bg = (idx % 2 === 0) ? S.rowBg : S.rowAltBg;
        return 'padding:5px 8px; font-size:12px; color:' + S.rowTxt + '; border-bottom:1px solid ' + S.borderClr + '; background:' + bg + ';';
    }
    function tdCenterStyle(idx) { return tdStyle(idx) + ' text-align:center;'; }

    // -------------------------------------------------------
    // INFO BAR (Data | N + ikon)
    // -------------------------------------------------------
    function infoBar(count, showHistory) {
        var historyIcon = showHistory
            ? '<span id="btnHistory" style="cursor:pointer; margin-right:6px; font-size:18px; color:#fff;" title="History">&#128336;</span>'
            : '';
        return (
            '<div style="margin-top:20px; display:flex; align-items:center; justify-content:space-between; background:' + S.infoBg + '; padding:4px 10px; height:32px; border-radius:4px 4px 0 0;">' +
            '<span style="color:' + S.infoTxt + '; font-size:13px; font-weight:600;">Data | ' + count + '</span>' +
            '<div style="display:flex; align-items:center; gap:4px;">' +
            historyIcon +
            '<span id="btnTambah" style="cursor:pointer; font-size:20px; color:#4caf50; font-weight:bold;" title="Tambah">&#43;&#9398;</span>' +
            '<span id="btnRefresh" style="cursor:pointer; font-size:18px; color:#4caf50; margin-left:4px;" title="Refresh">&#10227;</span>' +
            '</div>' +
            '</div>'
        );
    }

    function searchBar() {
        return '<input id="searchPengiriman" type="text" placeholder="Cari Data..." style="width:100%; box-sizing:border-box; padding:6px 10px; border:none; border-bottom:1px solid ' + S.borderClr + '; font-size:13px; outline:none; background:#fff; color:#111;">';
    }

    // -------------------------------------------------------
    // RENDER MASTER (Ekspedisi)
    // -------------------------------------------------------
    function renderMaster() {
        var filtered = dataMaster;

        var rows = filtered.map(function (item, idx) {
            return (
                '<tr>' +
                '<td style="' + tdCenterStyle(idx) + '">' + (idx + 1) + '</td>' +
                '<td style="' + tdStyle(idx) + ' font-weight:700;">' + item.nama + '</td>' +
                '<td style="' + tdStyle(idx) + '">' + item.pic + '</td>' +
                '<td style="' + tdStyle(idx) + '">' + item.alamat + '</td>' +
                '<td style="' + tdStyle(idx) + '">' + item.noTelp + '</td>' +
                '<td style="' + tdStyle(idx) + '">' + item.noRekening + '</td>' +
                '<td style="' + tdCenterStyle(idx) + '">' + item.skor + '</td>' +
                '<td style="' + tdCenterStyle(idx) + '">' +
                '<button class="btn-detail-master" data-id="' + item.id + '" ' +
                'style="background:' + S.btnDetail + '; border:none; padding:3px 12px; font-size:11px; font-weight:600; cursor:pointer; border-radius:2px;">DETAIL</button>' +
                '</td>' +
                '</tr>'
            );
        }).join('');

        var html =
            infoBar(dataMaster.length, false) +
            searchBar() +
            '<div style="overflow-x:auto;">' +
            '<table style="width:100%; border-collapse:collapse;">' +
            '<thead>' +
            '<tr style="background:' + S.headerBg + ';">' +
            '<th style="' + thCenterStyle + ' width:40px;">NO</th>' +
            '<th style="' + thStyle + '">Nama</th>' +
            '<th style="' + thStyle + '">PIC</th>' +
            '<th style="' + thStyle + '">Alamat</th>' +
            '<th style="' + thStyle + '">No Telp</th>' +
            '<th style="' + thStyle + '">No Rekening</th>' +
            '<th style="' + thCenterStyle + ' width:50px;">Skor</th>' +
            '<th style="' + thCenterStyle + ' width:80px;">Opsi</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' + rows + '</tbody>' +
            '</table>' +
            '</div>';

        document.getElementById('mainContentPengiriman').innerHTML = html;
        bindMasterEvents();
    }

    function bindMasterEvents() {
        // Refresh
        var btnRefresh = document.getElementById('btnRefresh');
        if (btnRefresh) btnRefresh.addEventListener('click', function () { renderMaster(); });

        // Tambah
        var btnTambah = document.getElementById('btnTambah');
        if (btnTambah) {
            btnTambah.addEventListener('click', function () {
                document.getElementById('popupMasterTitle').innerText = 'Tambah Ekspedisi';
                document.getElementById('inputNamaEkspedisi').value = '';
                document.getElementById('inputPicEkspedisi').value = '';
                document.getElementById('inputAlamatEkspedisi').value = '';
                document.getElementById('inputTelpEkspedisi').value = '';
                document.getElementById('inputRekeningEkspedisi').value = '';
                app.popup.open('#popupMaster');
            });
        }

        // Simpan
        var btnSimpan = document.getElementById('btnSimpanMaster');
        if (btnSimpan) {
            // Hapus listener lama agar tidak duplikat
            var newBtn = btnSimpan.cloneNode(true);
            btnSimpan.parentNode.replaceChild(newBtn, btnSimpan);
            newBtn.addEventListener('click', function () {
                var nama = document.getElementById('inputNamaEkspedisi').value.trim();
                var pic = document.getElementById('inputPicEkspedisi').value.trim();
                var alamat = document.getElementById('inputAlamatEkspedisi').value.trim();
                var noTelp = document.getElementById('inputTelpEkspedisi').value.trim();
                var noRek = document.getElementById('inputRekeningEkspedisi').value.trim();

                if (!nama || !pic) {
                    app.toast.create({ text: 'Nama dan PIC wajib diisi!', closeTimeout: 2000 }).open();
                    return;
                }
                // TODO: POST ke API
                var newId = dataMaster.length ? dataMaster[dataMaster.length - 1].id + 1 : 1;
                dataMaster.push({ id: newId, nama: nama.toUpperCase(), pic: pic.toUpperCase(), alamat: alamat, noTelp: noTelp, noRekening: noRek, skor: 0 });
                app.popup.close('#popupMaster');
                app.toast.create({ text: 'Ekspedisi berhasil ditambahkan.', closeTimeout: 2000 }).open();
                renderMaster();
            });
        }

        // Search
        var searchInput = document.getElementById('searchPengiriman');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                var q = this.value.toLowerCase();
                document.querySelectorAll('#mainContentPengiriman tbody tr').forEach(function (tr) {
                    tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
                });
            });
        }

        // Detail
        document.querySelectorAll('.btn-detail-master').forEach(function (el) {
            el.addEventListener('click', function () {
                var id = parseInt(this.dataset.id);
                var item = dataMaster.find(function (d) { return d.id === id; });
                if (!item) return;
                // TODO: navigasi ke halaman detail atau buka popup detail
                app.toast.create({ text: 'Detail: ' + item.nama, closeTimeout: 1500 }).open();
            });
        });
    }

    // -------------------------------------------------------
    // RENDER TRANSAKSI
    // -------------------------------------------------------
    function renderTransaksi() {
        var rows = dataTransaksi.map(function (item, idx) {
            var tglSampaiColor = tglSampaiStyle(item.tglSampai);
            return (
                '<tr>' +
                '<td style="' + tdStyle(idx) + ' font-size:11px;">' + item.kode + '</td>' +
                '<td style="' + tdStyle(idx) + ' font-weight:700;">' + item.nama + '</td>' +
                '<td style="' + tdStyle(idx) + '">' + item.pic + '</td>' +
                '<td style="' + tdStyle(idx) + '">' + item.rute + '</td>' +
                '<td style="' + tdStyle(idx) + '">' + item.noTelp + '</td>' +
                '<td style="' + tdStyle(idx) + '">' + item.noRekening + '</td>' +
                '<td style="' + tdCenterStyle(idx) + '">' + item.skor + '</td>' +
                '<td style="' + tdCenterStyle(idx) + '">' + formatTgl(item.tglKirim) + '</td>' +
                '<td style="padding:5px 8px; font-size:12px; text-align:center; border-bottom:1px solid ' + S.borderClr + '; background:' + tglSampaiColor + '; color:#fff; font-weight:600;">' +
                formatTgl(item.tglSampai) +
                '</td>' +
                '<td style="' + tdCenterStyle(idx) + '">' +
                '<button class="btn-detail-transaksi" data-id="' + item.id + '" ' +
                'style="background:' + S.btnDetail + '; border:none; padding:3px 12px; font-size:11px; font-weight:600; cursor:pointer; border-radius:2px;">DETAIL</button>' +
                '</td>' +
                '</tr>'
            );
        }).join('');

        var html =
            infoBar(dataTransaksi.length, true) +
            searchBar() +
            '<div style="overflow-x:auto;">' +
            '<table style="width:100%; border-collapse:collapse;">' +
            '<thead>' +
            '<tr style="background:' + S.headerBg + ';">' +
            '<th style="' + thStyle + '">ID</th>' +
            '<th style="' + thStyle + '">Nama</th>' +
            '<th style="' + thStyle + '">PIC</th>' +
            '<th style="' + thStyle + '">Rute</th>' +
            '<th style="' + thStyle + '">No Telp</th>' +
            '<th style="' + thStyle + '">No Rekening</th>' +
            '<th style="' + thCenterStyle + ' width:50px;">Skor</th>' +
            '<th style="' + thCenterStyle + ' width:90px;">Tgl Kirim</th>' +
            '<th style="' + thCenterStyle + ' width:90px;">Tgl Sampai</th>' +
            '<th style="' + thCenterStyle + ' width:80px;">Opsi</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' + rows + '</tbody>' +
            '</table>' +
            '</div>';

        document.getElementById('mainContentPengiriman').innerHTML = html;
        bindTransaksiEvents();
    }

    function bindTransaksiEvents() {
        // Refresh
        var btnRefresh = document.getElementById('btnRefresh');
        if (btnRefresh) btnRefresh.addEventListener('click', function () { renderTransaksi(); });

        // History
        var btnHistory = document.getElementById('btnHistory');
        if (btnHistory) {
            btnHistory.addEventListener('click', function () {
                // TODO: navigasi ke halaman history pengiriman
                app.toast.create({ text: 'History pengiriman', closeTimeout: 1500 }).open();
            });
        }

        // Tambah
        var btnTambah = document.getElementById('btnTambah');
        if (btnTambah) {
            btnTambah.addEventListener('click', function () {
                // Isi dropdown ekspedisi dari dataMaster
                var sel = document.getElementById('inputEkspedisiTransaksi');
                sel.innerHTML = dataMaster.map(function (m) {
                    return '<option value="' + m.id + '">' + m.nama + '</option>';
                }).join('');

                document.getElementById('popupTransaksiTitle').innerText = 'Tambah Pengiriman';
                document.getElementById('inputPicTransaksi').value = '';
                document.getElementById('inputRuteTransaksi').value = '';
                document.getElementById('inputTelpTransaksi').value = '';
                document.getElementById('inputRekeningTransaksi').value = '';
                document.getElementById('inputTglKirimTransaksi').value = '';
                document.getElementById('inputTglSampaiTransaksi').value = '';
                app.popup.open('#popupTransaksi');
            });
        }

        // Simpan
        var btnSimpan = document.getElementById('btnSimpanTransaksi');
        if (btnSimpan) {
            var newBtn = btnSimpan.cloneNode(true);
            btnSimpan.parentNode.replaceChild(newBtn, btnSimpan);
            newBtn.addEventListener('click', function () {
                var ekspId = document.getElementById('inputEkspedisiTransaksi').value;
                var ekspedisi = dataMaster.find(function (m) { return m.id === parseInt(ekspId); });
                var pic = document.getElementById('inputPicTransaksi').value.trim();
                var rute = document.getElementById('inputRuteTransaksi').value.trim();
                var noTelp = document.getElementById('inputTelpTransaksi').value.trim();
                var noRek = document.getElementById('inputRekeningTransaksi').value.trim();
                var tglKirim = document.getElementById('inputTglKirimTransaksi').value;
                var tglSampai = document.getElementById('inputTglSampaiTransaksi').value;

                if (!ekspedisi || !rute) {
                    app.toast.create({ text: 'Ekspedisi dan Rute wajib diisi!', closeTimeout: 2000 }).open();
                    return;
                }
                // TODO: POST ke API
                var newId = dataTransaksi.length ? dataTransaksi[dataTransaksi.length - 1].id + 1 : 1;
                var bulan = String(new Date().getMonth() + 1).padStart(2, '0');
                var tahun = String(new Date().getFullYear()).slice(-2);
                var kode = 'SHIP-' + bulan + tahun + '-' + String(newId).padStart(3, '0');
                dataTransaksi.push({
                    id: newId, kode: kode, nama: ekspedisi.nama, pic: pic.toUpperCase(),
                    rute: rute.toUpperCase(), noTelp: noTelp, noRekening: noRek,
                    skor: ekspedisi.skor, tglKirim: tglKirim, tglSampai: tglSampai
                });
                app.popup.close('#popupTransaksi');
                app.toast.create({ text: 'Pengiriman berhasil ditambahkan.', closeTimeout: 2000 }).open();
                renderTransaksi();
            });
        }

        // Search
        var searchInput = document.getElementById('searchPengiriman');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                var q = this.value.toLowerCase();
                document.querySelectorAll('#mainContentPengiriman tbody tr').forEach(function (tr) {
                    tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
                });
            });
        }

        // Detail
        document.querySelectorAll('.btn-detail-transaksi').forEach(function (el) {
            el.addEventListener('click', function () {
                var id = parseInt(this.dataset.id);
                var item = dataTransaksi.find(function (d) { return d.id === id; });
                if (!item) return;
                // TODO: navigasi ke halaman detail transaksi
                app.toast.create({ text: 'Detail: ' + item.kode, closeTimeout: 1500 }).open();
            });
        });
    }

    // -------------------------------------------------------
    // TAB SWITCHING
    // -------------------------------------------------------
    var ACTIVE_BG = 'bg-dark-gray-medium';
    var INACTIVE_BG = 'bg-dark-gray-young';

    function setActiveTab(tab) {
        activeTab = tab;

        var elMaster = document.getElementById('masterPengiriman');
        var elTransaksi = document.getElementById('transaksiPengiriman');
        if (!elMaster || !elTransaksi) return;

        if (tab === 'master') {
            elMaster.classList.add(ACTIVE_BG);
            elMaster.classList.remove(INACTIVE_BG);
            elTransaksi.classList.add(INACTIVE_BG);
            elTransaksi.classList.remove(ACTIVE_BG);
            renderMaster();
        } else {
            elTransaksi.classList.add(ACTIVE_BG);
            elTransaksi.classList.remove(INACTIVE_BG);
            elMaster.classList.add(INACTIVE_BG);
            elMaster.classList.remove(ACTIVE_BG);
            renderTransaksi();
        }
    }

    function bindSubMenuEvents() {
        var elMaster = document.getElementById('masterPengiriman');
        var elTransaksi = document.getElementById('transaksiPengiriman');
        if (elMaster) elMaster.addEventListener('click', function () { setActiveTab('master'); });
        if (elTransaksi) elTransaksi.addEventListener('click', function () { setActiveTab('transaksi'); });
    }

    // -------------------------------------------------------
    // INIT
    // -------------------------------------------------------
    function init() {
        bindSubMenuEvents();
        setActiveTab('master');
    }

    return { init: init };

})();