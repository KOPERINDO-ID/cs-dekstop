// ============================================================
// TAGIHAN.JS - Complete Implementation with Payment Button
// ============================================================

/**
 * Get Data Tagihan dengan Color Coding
 * Warna berdasarkan hari keterlambatan:
 * - H+2-6: Kuning (WARNING)
 * - H+7-11: Orange (DELAYED)
 * - H+12+: Merah (PROBLEM)
 */
function getDataTagihan(page) {
    console.log('Loading tagihan page:', page);

    var page_now = page || 1;

    // === FILTER YEAR ===
    var year_now = new Date().getFullYear();
    var year;
    if (jQuery('#transaksi_tagihan_years option:selected').val() == null) {
        year = year_now;
    } else if (jQuery('#transaksi_tagihan_years option:selected').val() == 'all') {
        year = 'empty';
    } else {
        year = jQuery('#transaksi_tagihan_years option:selected').val();
    }

    // === FILTER MONTH ===
    var month_now = new Date().getMonth() + 1;
    var month;
    if (jQuery('#transaksi_tagihan_bulan option:selected').val() == null) {
        month = month_now;
    } else if (jQuery('#transaksi_tagihan_bulan option:selected').val() == 'all') {
        month = 'empty';
    } else {
        month = jQuery('#transaksi_tagihan_bulan option:selected').val();
    }

    // === FILTER PERUSAHAAN ===
    var perusahaan_penjualan_value;
    if (jQuery('#perusahaan_penjualan_tagihan_filter').val() == '' ||
        jQuery('#perusahaan_penjualan_tagihan_filter').val() == null) {
        perusahaan_penjualan_value = "empty";
    } else {
        perusahaan_penjualan_value = jQuery('#perusahaan_penjualan_tagihan_filter').val();
    }

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-data-tagihan-cs?page=" + page_now,
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            month: month,
            year: year,
            perusahaan_penjualan_value: perusahaan_penjualan_value,
            lokasi_pabrik: localStorage.getItem("lokasi_pabrik_sales"),
            version_app: localStorage.getItem("versioon_app_now")
        },
        beforeSend: function () {
            app.dialog.preloader('Memuat data tagihan...');
        },
        success: function (data) {
            app.dialog.close();

            if (data.status != 200) {
                jQuery('#data_status_notif_tagihan').html(
                    '<tr><td colspan="10" style="text-align:center; padding:20px; color:#888;">' +
                    'Tidak ada data tagihan</td></tr>'
                );
                return;
            }

            var html = '';
            var no = (page_now - 1) * 50;

            if (data.data.data.length === 0) {
                html = '<tr><td colspan="10" style="text-align:center; padding:20px; color:#888;">' +
                    'Tidak ada tagihan untuk filter yang dipilih</td></tr>';
            } else {
                jQuery.each(data.data.data, function (i, item) {
                    no++;

                    // Hitung sisa pembayaran
                    var sisaPembayaran = parseFloat(item.penjualan_grandtotal) -
                        parseFloat(item.penjualan_jumlah_pembayaran || 0);

                    // Tentukan warna row
                    var rowColor = getRowColorByDays(item.hari_keterlambatan);
                    var statusBadge = getStatusBadge(item.hari_keterlambatan);

                    // Format nomor invoice
                    var nomorInvoice = moment(item.dt_record).format('DDMMYY') + '-' +
                        item.penjualan_id.replace(/INV_/g, '').replace(/^0+/, '');

                    // Format tanggal
                    var tanggalSelesai = item.tgl_surat_jalan_selesai ?
                        moment(item.tgl_surat_jalan_selesai).format('DD/MM/YY') : '-';

                    html += '<tr style="' + rowColor + '">';
                    html += '<td align="center" style="border:1px solid gray; padding:8px;">' + no + '</td>';
                    html += '<td align="center" style="border:1px solid gray; padding:8px;">';
                    html += '<b>' + nomorInvoice + '</b>';
                    html += '</td>';
                    html += '<td align="left" style="border:1px solid gray; padding:8px;">';
                    html += (item.client_nama || '-') + '<br>';
                    html += '</td>';
                    html += '<td align="center" style="border:1px solid gray; padding:8px;">' + tanggalSelesai + '</td>';
                    html += '<td align="center" style="border:1px solid gray; padding:8px;">' + (item.client_kota || '-') + '</td>';
                    html += '<td align="right" style="border:1px solid gray; padding:8px;">' + number_format(item.penjualan_grandtotal) + '</td>';
                    html += '<td align="right" style="border:1px solid gray; padding:8px;">' + number_format(item.penjualan_jumlah_pembayaran || 0) + '</td>';
                    html += '<td align="right" style="border:1px solid gray; padding:8px;"><b>' + number_format(sisaPembayaran) + '</b></td>';

                    var sisa = (item.penjualan_grandtotal) - item.penjualan_jumlah_pembayaran;
                    if (sisa <= 0) {
                        var color_btn_byr = "btn-color-blueWhite";
                    } else {
                        var color_btn_byr = "bg-dark-gray-young text-add-colour-black-soft";
                    }

                    // === 2 TOMBOL: WA dan BAYAR ===
                    html += '<td align="center" style="border-bottom:1px solid gray; padding:5px;">';
                    // Tombol WhatsApp
                    html += '         <a href="#" onclick="sendWhatsAppTagihan(\'' + item.penjualan_id + '\', \'' + item.client_id + '\', \'' + (item.client_telp || '') + '\'); return false;" class="button button-small button-fill" style="width:96px;background: linear-gradient(#25D366, #128C7E); color: white; padding: 4px 8px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; border-radius: 4px;">';
                    html += '             <img src="img/logo/whatsapp-white-icon.png" style="width:15px;cursor: pointer;vertical-align: middle;" /> <span>Whatsapp</span>';
                    html += '         </a>';
                    html += '</td>';
                    html += '<td align="center" style="border-right:1px solid gray;border-bottom:1px solid gray; padding:5px;">';
                    
                    // === TOMBOL BAYAR - SAMA DENGAN PENJUALAN TAPI ID/NAME BERBEDA ===
                    html += '<button class="' + color_btn_byr + ' button-small col button popup-open text-bold" data-popup=".detail-pembayaran-tagihan" ';
                    html += 'onclick="detailPembayaranTagihan(';
                    html += '\'' + item.dt_record + '\',';
                    html += '\'' + (item.penjualan_tanggal || item.dt_record) + '\',';
                    html += '\'' + (item.performa_id_relation || 'single') + '\',';  // performa_id_relation
                    html += '\'' + (item.bank_1 || '') + '\',';
                    html += '\'' + (item.bank_2 || '') + '\',';
                    html += '\'' + (item.bank_3 || '') + '\',';
                    html += '\'' + (item.bank_4 || '') + '\',';
                    html += '\'' + (item.bank_5 || '') + '\',';
                    html += '\'' + (item.bank_6 || '') + '\',';
                    html += '\'' + (item.bank_7 || '') + '\',';
                    html += '\'' + (item.bank_8 || '') + '\',';
                    html += '\'' + (item.bank_9 || '') + '\',';
                    html += '\'' + (item.bank_10 || '') + '\',';
                    html += '\'' + (item.pembayaran1_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran2_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran3_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran4_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran5_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran6_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran7_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran8_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran9_tgl || '') + '\',';
                    html += '\'' + (item.pembayaran10_tgl || '') + '\',';
                    html += '\'' + (item.bank_1 || 'BCA') + '\',';  // bank
                    html += '\'' + (item.pembayaran_1 || 0) + '\',';
                    html += '\'' + (item.pembayaran_2 || 0) + '\',';
                    html += '\'' + (item.pembayaran_3 || 0) + '\',';
                    html += '\'' + (item.pembayaran_4 || 0) + '\',';
                    html += '\'' + (item.pembayaran_5 || 0) + '\',';
                    html += '\'' + (item.pembayaran_6 || 0) + '\',';
                    html += '\'' + (item.pembayaran_7 || 0) + '\',';
                    html += '\'' + (item.pembayaran_8 || 0) + '\',';
                    html += '\'' + (item.pembayaran_9 || 0) + '\',';
                    html += '\'' + (item.pembayaran_10 || 0) + '\',';
                    html += '\'' + item.client_nama + '\',';
                    html += '\'' + (item.penjualan_jumlah_pembayaran || 0) + '\',';
                    html += '\'' + (item.penjualan_total_qty || 0) + '\',';
                    html += '\'' + item.penjualan_grandtotal + '\',';
                    html += '\'' + item.penjualan_id + '\',';
                    html += '\'' + item.client_id + '\',';
                    html += '\'' + (item.penjualan_status_pembayaran || 'Belum Lunas') + '\',';
                    html += '\'' + (item.ongkir || 0) + '\'';
                    html += ');">Bayar</button>';
                    
                    html += '</td>';
                    html += '</tr>';
                });
            }

            jQuery('#data_status_notif_tagihan').html(html);
        },
        error: function (xhr, status, error) {
            app.dialog.close();
            console.error('Error loading tagihan:', error);
            app.dialog.alert('Gagal memuat data: ' + error);
        }
    });
}

/**
 * Get Row Color Based on Days
 */
function getRowColorByDays(days) {
    if (days >= 12) {
        return 'background-color: rgba(244, 67, 54, 0.2);'; // Red
    } else if (days >= 7) {
        return 'background-color: rgba(255, 152, 0, 0.2);'; // Orange
    } else if (days >= 2) {
        return 'background-color: rgba(255, 235, 59, 0.15);'; // Yellow
    }
    return '';
}

/**
 * Get Status Badge
 */
function getStatusBadge(days) {
    if (days >= 12) {
        return '<span style="color:#f44336; font-size:11px;">⚠ PROBLEM</span>';
    } else if (days >= 7) {
        return '<span style="color:#ff9800; font-size:11px;">⚠ DELAYED</span>';
    } else if (days >= 2) {
        return '<span style="color:#ffc107; font-size:11px;">⚠ WARNING</span>';
    }
    return '<span style="color:#4caf50; font-size:11px;">✓ OK</span>';
}

/**
 * Send WhatsApp Message untuk Tagihan
 */
function sendWhatsAppTagihan(penjualan_id, client_id, phone) {
    console.log('Sending WA for tagihan:', penjualan_id);
    // Implementasi pengiriman WhatsApp
    if (phone && phone !== '') {
        var cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' + cleanPhone.substring(1);
        }
        
        var message = 'Halo, berikut adalah reminder untuk pembayaran invoice ' + penjualan_id;
        var waUrl = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
        window.open(waUrl, '_blank');
    } else {
        app.dialog.alert('Nomor telepon tidak tersedia');
    }
}

/**
 * Detail Pembayaran Tagihan - SELALU GUNAKAN MODE MULTIPLE
 * Mengambil data pembayaran dari DATABASE dengan payload yang benar
 */
function detailPembayaranTagihan(dt_record, penjualan_tanggal_choose, performa_id_relation, bank_1, bank_2, bank_3, bank_4, bank_5, bank_6, bank_7, bank_8, bank_9, bank_10, pembayaran1_tgl, pembayaran2_tgl, pembayaran3_tgl, pembayaran4_tgl, pembayaran5_tgl, pembayaran6_tgl, pembayaran7_tgl, pembayaran8_tgl, pembayaran9_tgl, pembayaran10_tgl, bank, pembayaran_1, pembayaran_2, pembayaran_3, pembayaran_4, pembayaran_5, pembayaran_6, pembayaran_7, pembayaran_8, pembayaran_9, pembayaran_10, client_nama, penjualan_jumlah_pembayaran, penjualan_total_qty, penjualan_grandtotal, penjualan_id, client_id, penjualan_status_pembayaran, ongkir) {
    
    console.log('=== DETAIL PEMBAYARAN TAGIHAN ===');
    console.log('Penjualan ID:', penjualan_id);
    console.log('Performa ID:', performa_id_relation);
    console.log('User ID:', localStorage.getItem("user_id"));
    
    // Hide single mode, always use multiple
    jQuery('.pembayaran_tagihan_single_div').hide();
    jQuery('#history_pembayaran_tagihan_multiple').html("");
    
    // Tentukan payload berdasarkan mode
    var ajaxData = {};
    
    if (performa_id_relation == "single") {
        // Mode SINGLE: kirim penjualan_id
        ajaxData = {
            penjualan_id: penjualan_id,
            performa_id: "single",
            user_id: localStorage.getItem("user_id")
        };
        console.log('Mode: SINGLE - Payload:', ajaxData);
    } else {
        // Mode MULTIPLE: kirim performa_id
        ajaxData = {
            performa_id: performa_id_relation,
            user_id: localStorage.getItem("user_id")
        };
        console.log('Mode: MULTIPLE - Payload:', ajaxData);
    }
    
    // Call API untuk mengambil data pembayaran dari database
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/detail-pembayaran-multiple",
        dataType: 'JSON',
        data: ajaxData,
        beforeSend: function () {
            app.dialog.preloader('Mengambil Data Pembayaran');
        },
        success: function (data) {
            app.dialog.close();
            
            console.log('✓ Data pembayaran berhasil diambil:', data);
            console.log('✓ pembayaran_data:', data.pembayaran_data);
            console.log('✓ data.data:', data.data);
            
            // PENTING: Handle response structure
            var pembayaran_data_array = [];
            
            if (data.pembayaran_data && Array.isArray(data.pembayaran_data)) {
                // Response sudah format array (mode MULTIPLE)
                pembayaran_data_array = data.pembayaran_data;
                console.log('✓ Using pembayaran_data array:', pembayaran_data_array.length, 'items');
            } else if (data.data && !Array.isArray(data.data)) {
                // Response single object (mode SINGLE) - convert ke array
                pembayaran_data_array = [data.data];
                console.log('✓ Converted data.data to array:', pembayaran_data_array);
                console.log('✓ First item pembayaran_1:', pembayaran_data_array[0].pembayaran_1);
                console.log('✓ First item bank_1:', pembayaran_data_array[0].bank_1);
                console.log('✓ First item penjualan_id:', pembayaran_data_array[0].penjualan_id);
            } else if (data.data && Array.isArray(data.data)) {
                // Response sudah array di data.data
                pembayaran_data_array = data.data;
                console.log('✓ Using data.data array:', pembayaran_data_array.length, 'items');
            } else {
                // Fallback: buat manual dari parameter
                console.warn('⚠ No pembayaran_data, creating manual array');
                pembayaran_data_array = [{
                    pembayaran_id: penjualan_id,
                    penjualan_id: penjualan_id,
                    penjualan_tanggal_kirim: penjualan_tanggal_choose,
                    penjualan_grandtotal: penjualan_grandtotal,
                    ongkir: ongkir || 0,
                    pembayaran_1: pembayaran_1 || 0,
                    pembayaran_2: pembayaran_2 || 0,
                    pembayaran_3: pembayaran_3 || 0,
                    pembayaran_4: pembayaran_4 || 0,
                    pembayaran_5: pembayaran_5 || 0,
                    pembayaran_6: pembayaran_6 || 0,
                    pembayaran_7: pembayaran_7 || 0,
                    pembayaran_8: pembayaran_8 || 0,
                    pembayaran_9: pembayaran_9 || 0,
                    pembayaran_10: pembayaran_10 || 0,
                    pembayaran1_tgl: pembayaran1_tgl,
                    pembayaran2_tgl: pembayaran2_tgl,
                    pembayaran3_tgl: pembayaran3_tgl,
                    pembayaran4_tgl: pembayaran4_tgl,
                    pembayaran5_tgl: pembayaran5_tgl,
                    pembayaran6_tgl: pembayaran6_tgl,
                    pembayaran7_tgl: pembayaran7_tgl,
                    pembayaran8_tgl: pembayaran8_tgl,
                    pembayaran9_tgl: pembayaran9_tgl,
                    pembayaran10_tgl: pembayaran10_tgl,
                    bank_1: bank_1 || bank,
                    bank_2: bank_2 || bank,
                    bank_3: bank_3 || bank,
                    bank_4: bank_4 || bank,
                    bank_5: bank_5 || bank,
                    bank_6: bank_6 || bank,
                    bank_7: bank_7 || bank,
                    bank_8: bank_8 || bank,
                    bank_9: bank_9 || bank,
                    bank_10: bank_10 || bank,
                    keterangan_1: '',
                    keterangan_2: '',
                    keterangan_3: '',
                    keterangan_4: '',
                    keterangan_5: '',
                    keterangan_6: '',
                    keterangan_7: '',
                    keterangan_8: '',
                    keterangan_9: '',
                    keterangan_10: '',
                    foto_1: null,
                    foto_2: null,
                    foto_3: null,
                    foto_4: null,
                    foto_5: null,
                    foto_6: null,
                    foto_7: null,
                    foto_8: null,
                    foto_9: null,
                    foto_10: null,
                    valid_cs_1: 1,
                    valid_cs_2: 1,
                    valid_cs_3: 1,
                    valid_cs_4: 1,
                    valid_cs_5: 1,
                    valid_cs_6: 1,
                    valid_cs_7: 1,
                    valid_cs_8: 1,
                    valid_cs_9: 1,
                    valid_cs_10: 1
                }];
            }
            
            console.log('✓ Final pembayaran_data_array:', pembayaran_data_array);
            
            // Format nomor invoice
            var nomor_spk = '';
            if (dt_record && moment(dt_record).isValid()) {
                nomor_spk = moment(dt_record).format('DDMMYY') + '-';
            }
            if (penjualan_id) {
                nomor_spk += penjualan_id.replace(/INV_/g, '').replace(/^0+/, '');
            }
            
            // Set header info
            $$('#popup-pembayaran-tagihan-td-nospk').html(nomor_spk);
            $$('#popup-pembayaran-tagihan-td-client_nama').html(client_nama);
            $$('#popup-pembayaran-tagihan-bank').html(bank);
            $$(".bank_pembayaran_tagihan").val(bank);
            
            // Set tanggal
            var tanggal_display = '';
            if (penjualan_tanggal_choose && moment(penjualan_tanggal_choose).isValid()) {
                tanggal_display = moment(penjualan_tanggal_choose).format('DD-MMM-YYYY');
            } else if (dt_record && moment(dt_record).isValid()) {
                tanggal_display = moment(dt_record).format('DD-MMM-YYYY');
            } else {
                tanggal_display = '-';
            }
            $$('#tanggal_pembayaran_tagihan_choose').html(tanggal_display);
            
            // Set financial summary (dari data yang dikirim API)
            var grandtotal = parseInt(data.penjualan_grandtotal || penjualan_grandtotal);
            var ongkir_val = parseInt(data.ongkir || ongkir || 0);
            var jumlah_bayar = parseInt(data.penjualan_jumlah_pembayaran || penjualan_jumlah_pembayaran || 0);
            
            $$('#popup-pembayaran-tagihan-penjualan_grandtotal').html(number_format(grandtotal - ongkir_val) + ' ,-');
            $$('#popup-pembayaran-tagihan-ongkir').html(number_format(ongkir_val) + ' ,-');
            $$('#popup-pembayaran-tagihan-penjualan_jumlah_pembayaran').html(number_format(jumlah_bayar) + ' ,-');
            $$('#popup-pembayaran-tagihan-penjualan_kekurangan').html(number_format(grandtotal - jumlah_bayar) + ' ,-');
            
            // Set status
            if (grandtotal <= jumlah_bayar) {
                $$('#popup-pembayaran-tagihan-penjualan_status_pembayaran')
                    .html('<b>Lunas</b>')
                    .removeClass('card-color-green card-color-blue').addClass('card-color-blue');
            } else {
                $$('#popup-pembayaran-tagihan-penjualan_status_pembayaran')
                    .html('<b>Belum Lunas</b>')
                    .removeClass('card-color-green card-color-blue').addClass('card-color-green');
            }
            
            // Generate history table menggunakan data dari API
            console.log('▶ Calling generateHistoryMultipleTagihan with:', pembayaran_data_array);
            var history_html = generateHistoryMultipleTagihan(pembayaran_data_array);
            console.log('▶ Generated HTML length:', history_html.length);
            console.log('▶ Generated HTML preview:', history_html.substring(0, 500));
            
            jQuery('#history_pembayaran_tagihan_multiple').html(history_html);
            
            // Show tables
            for (var i = 1; i <= 10; i++) {
                jQuery('#table_num_tagihan_' + i).show();
            }
            
            // Apply mask
            jQuery('.input-pembayaran-tagihan-multiple').mask('000,000,000,000', { reverse: true });
            
            console.log('✅ Pembayaran table rendered successfully');
        },
        error: function (xmlhttprequest, textstatus, message) {
            app.dialog.close();
            console.error('Error mengambil data pembayaran:', message);
            console.error('Status:', xmlhttprequest.status);
            console.error('Response:', xmlhttprequest.responseText);
            
            app.dialog.alert('Gagal mengambil data pembayaran. Silakan coba lagi.', 'Error');
        }
    });
}

/**
 * Proses Pembayaran Tagihan Multiple
        $$('#pembayaran_tagihan_9').val(number_format(pembayaran_9));
        if (pembayaran9_tgl && moment(pembayaran9_tgl).isValid()) {
            $$('#popup-pembayaran-tagihan-tgl9').html(moment(pembayaran9_tgl).format('DD-MMM-YYYY'));
        } else {
            $$('#popup-pembayaran-tagihan-tgl9').html('-');
        }
        $$('#pembayaran_tagihan_9').attr('readonly', true);
        $$('#pembayaran_tagihan_9').prop("onclick", null).off("click");
        $$('#bank_tagihan_9').val(bank_9 || bank);
    } else {
        $$('#pembayaran_tagihan_9').val(number_format(0));
        $$('#content_bayar10_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl9').html("");
        $$('#pembayaran_tagihan_9').removeAttr("readonly");
        $$('#pembayaran_tagihan_9').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_9")');
        $$('#bank_tagihan_9').val(bank);
    }

    // === PEMBAYARAN 10 ===
    if (number_format(pembayaran_10) != 0) {
        $$('#pembayaran_tagihan_10').val(number_format(pembayaran_10));
        $$('#pembayaran_tagihan_10').prop("onclick", null).off("click");
        $$('#pembayaran_tagihan_10').attr('readonly', true);
        if (pembayaran10_tgl && moment(pembayaran10_tgl).isValid()) {
            $$('#popup-pembayaran-tagihan-tgl10').html(moment(pembayaran10_tgl).format('DD-MMM-YYYY'));
        } else {
            $$('#popup-pembayaran-tagihan-tgl10').html('-');
        }
        $$('#bank_tagihan_10').val(bank_10 || bank);
    } else {
        $$('#pembayaran_tagihan_10').val(number_format(0));
        $$('#popup-pembayaran-tagihan-tgl10').html("");
        $$('#pembayaran_tagihan_10').removeAttr("readonly");
        $$('#pembayaran_tagihan_10').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_10")');
        $$('#bank_tagihan_10').val(bank);
    }
        $$('#pembayaran_tagihan_6').prop("onclick", null).off("click");
        $$('#bank_tagihan_6').val(bank_6);
    } else {
        $$('#pembayaran_tagihan_6').val(number_format(0));
        $$('#content_bayar7_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl6').html("");
        $$('#pembayaran_tagihan_6').removeAttr("readonly");
        $$('#pembayaran_tagihan_6').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_6")');
        $$('#bank_tagihan_6').val(bank);
    }

    // === PEMBAYARAN 7 ===
    if (number_format(pembayaran_7) != 0) {
        $$('#pembayaran_tagihan_7').val(number_format(pembayaran_7));
        $$('#pembayaran_tagihan_7').attr('readonly', true);
        $$('#popup-pembayaran-tagihan-tgl7').html(moment(pembayaran7_tgl).format('DD-MMM-YYYY'));
        $$('#content_bayar8_tagihan').show();
        $$('#pembayaran_tagihan_7').prop("onclick", null).off("click");
        $$('#bank_tagihan_7').val(bank_7);
    } else {
        $$('#pembayaran_tagihan_7').val(number_format(0));
        $$('#content_bayar8_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl7').html("");
        $$('#pembayaran_tagihan_7').removeAttr("readonly");
        $$('#pembayaran_tagihan_7').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_7")');
        $$('#bank_tagihan_7').val(bank);
    }

    // === PEMBAYARAN 8 ===
    if (number_format(pembayaran_8) != 0) {
        $$('#pembayaran_tagihan_8').val(number_format(pembayaran_8));
        $$('#pembayaran_tagihan_8').attr('readonly', true);
        $$('#popup-pembayaran-tagihan-tgl8').html(moment(pembayaran8_tgl).format('DD-MMM-YYYY'));
        $$('#content_bayar9_tagihan').show();
        $$('#pembayaran_tagihan_8').prop("onclick", null).off("click");
        $$('#bank_tagihan_8').val(bank_8);
    } else {
        $$('#pembayaran_tagihan_8').val(number_format(0));
        $$('#content_bayar9_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl8').html("");
        $$('#pembayaran_tagihan_8').removeAttr("readonly");
        $$('#pembayaran_tagihan_8').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_8")');
        $$('#bank_tagihan_8').val(bank);
    }

    // === PEMBAYARAN 9 ===
    if (number_format(pembayaran_9) != 0) {
        $$('#pembayaran_tagihan_9').val(number_format(pembayaran_9));
        $$('#pembayaran_tagihan_9').attr('readonly', true);
        $$('#popup-pembayaran-tagihan-tgl9').html(moment(pembayaran9_tgl).format('DD-MMM-YYYY'));
        $$('#content_bayar10_tagihan').show();
        $$('#pembayaran_tagihan_9').prop("onclick", null).off("click");
        $$('#bank_tagihan_9').val(bank_9);
    } else {
        $$('#pembayaran_tagihan_9').val(number_format(0));
        $$('#content_bayar10_tagihan').hide();
        $$('#popup-pembayaran-tagihan-tgl9').html("");
        $$('#pembayaran_tagihan_9').removeAttr("readonly");
        $$('#pembayaran_tagihan_9').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_9")');
        $$('#bank_tagihan_9').val(bank);
    }

    // === PEMBAYARAN 10 ===
    if (number_format(pembayaran_10) != 0) {
        $$('#pembayaran_tagihan_10').val(number_format(pembayaran_10));
        $$('#pembayaran_tagihan_10').prop("onclick", null).off("click");
        $$('#pembayaran_tagihan_10').attr('readonly', true);
        $$('#popup-pembayaran-tagihan-tgl10').html(moment(pembayaran10_tgl).format('DD-MMM-YYYY'));
        $$('#bank_tagihan_10').val(bank_10);
    } else {
        $$('#pembayaran_tagihan_10').val(number_format(0));
        $$('#popup-pembayaran-tagihan-tgl10').html("");
        $$('#pembayaran_tagihan_10').removeAttr("readonly");
        $$('#pembayaran_tagihan_10').attr('onClick', 'emptyValueTagihan("pembayaran_tagihan_10")');
        $$('#bank_tagihan_10').val(bank);
    }

    $$('#pembayaran-tagihan-penjualan_id').val(penjualan_id);
    $$('#pembayaran-tagihan-client_id').val(client_id);
    
    // Hide Tunai option for non-admin
    setTimeout(function () {
        if (localStorage.getItem("username") != 'Stn') {
            $$('.hide_bank option[value="Tunai"]').remove();
        }
    }, 1000);
    
    // Open popup (jika belum terbuka dari data-popup attribute)
    // app.popup.open('.detail-pembayaran-tagihan');
}

/**
 * Generate History Multiple Tagihan
 */
function generateHistoryMultipleTagihan(pembayaran_data) {
    var html = '';
    
    jQuery.each(pembayaran_data, function(i, val) {
        // Calculate totals
        var total_bayar = 0;
        for (var k = 1; k <= 10; k++) {
            total_bayar += parseInt(val['pembayaran_' + k] || 0);
        }
        
        var grandtotal = parseInt(val.penjualan_grandtotal || 0);
        var ongkir = parseInt(val.ongkir || 0);
        var sisa = grandtotal - total_bayar;
        var lunas = total_bayar >= grandtotal;
        var bg = lunas ? '#133788' : '';
        
        // Table start
        html += '<table align="center" width="650px" border="0" style="border-collapse: collapse; border:1px solid white; margin-bottom:10px;">';
        
        // Header row
        html += '<tr style="background-color:' + bg + '">';
        html += '<td align="center" width="20%" colspan="2">Deadline ' + (i + 1) + ' : <br>' + moment(val.penjualan_tanggal_kirim).format('DD-MMM-YY') + '</td>';
        html += '<td width="15%" style="border:1px solid white;" class="text-align-center">Total : <br>' + number_format(grandtotal - ongkir) + '</td>';
        html += '<td width="20%" style="border:1px solid white;" class="text-align-center">Terbayar : <br>' + number_format(total_bayar) + '</td>';
        html += '<td width="20%" style="border:1px solid white;" class="text-align-center">Sisa : <br>' + number_format(sisa) + '</td>';
        html += '<td width="25%" colspan="2" style="border:1px solid white;" class="text-align-center card-color-orange">Ongkir : <br>' + number_format(ongkir) + '</td>';
        html += '</tr>';
        
        // Column headers
        html += '<tr class="bg-dark-gray-medium">';
        html += '<td width="15%" style="border:1px solid white;" colspan="2" class="text-align-center">Bayar</td>';
        html += '<td width="12%" style="border:1px solid white;" class="text-align-center">Tanggal</td>';
        html += '<td width="18%" style="border:1px solid white;" class="text-align-center">Bank</td>';
        html += '<td width="15%" style="border:1px solid white;" class="text-align-center">Jumlah</td>';
        html += '<td width="20%" style="border:1px solid white;" class="text-align-center">Keterangan</td>';
        html += '<td width="20%" style="border:1px solid white;" class="text-align-center">Opsi</td>';
        html += '</tr>';
        
        // Payment rows
        html += '<tbody id="table_num_tagihan_' + (i + 1) + '">';
        html += generatePaymentRowsTagihan(val, i + 1, bg, lunas, sisa, total_bayar);
        html += '</tbody>';
        
        html += '</table>';
    });
    
    return html;
}

/**
 * Generate Payment Rows (Bayar 1-10) untuk Tagihan
 */
function generatePaymentRowsTagihan(val, tableNum, bg, lunas, sisa, total_bayar) {
    var html = '';
    var hasEmptyRow = false;
    
    for (var idx = 1; idx <= 10; idx++) {
        var pay_value = parseInt(val['pembayaran_' + idx] || 0);
        var pay_tgl = val['pembayaran' + idx + '_tgl'];
        var pay_bank = val['bank_' + idx];
        var pay_ket = val['keterangan_' + idx];
        var pay_foto = val['foto_' + idx];
        var valid_cs = val['valid_cs_' + idx];
        var keterangan_reject = val['keterangan_valid_cs_' + idx];
        
        if (pay_value && pay_value != 0) {
            // Existing payment
            var row_bg = (valid_cs == 2) ? 'class="card-color-red"' : 'style="background-color:' + bg + '"';
            
            html += '<tr ' + row_bg + '>';
            html += '<td colspan="2" style="border:1px solid white;" class="text-align-center">Bayar ' + idx + '</td>';
            html += '<td style="border:1px solid white;" class="text-align-center">' + moment(pay_tgl).format('DD-MMM-YYYY') + '</td>';
            html += '<td style="border:1px solid white;" class="text-align-center">' + (pay_bank || '-') + '</td>';
            html += '<td style="border:1px solid white;" class="text-align-center">' + number_format(pay_value) + '</td>';
            html += '<td style="border:1px solid white;" class="text-align-center">' + (pay_ket || '-') + '</td>';
            
            // Opsi column
            html += '<td style="border:1px solid white;" class="text-align-center">';
            
            if (valid_cs == 2) {
                // Rejected - show Edit button
                html += '<button data-popup=".edit-pembayaran-tagihan" ';
                html += 'onclick="editPembayaranTagihanPopup(\'Bayar ' + idx + '\',\'foto_' + idx + '\',\'' + val.pembayaran_id + '\',\'' + pay_foto + '\',\'' + pay_value + '\',\'' + pay_ket + '\',\'' + pay_bank + '\',\'' + pay_tgl + '\',\'' + sisa + '\',\'' + val.penjualan_grandtotal + '\',\'' + total_bayar + '\',\'' + keterangan_reject + '\')" ';
                html += 'class="popup-open button-small button text-bold bg-dark-gray-young" style="padding:5px 10px;">Edit</button>';
            } else {
                // Not rejected - show FOTO button
                var btn_class = pay_foto ? 'card-color-blue' : 'bg-dark-gray-young';
                var btn_text_color = pay_foto ? 'color:white;' : '';
                html += '<button data-popup=".upload-foto-pembayaran-tagihan" ';
                html += 'onclick="uploadFotoPembayaranTagihan(\'foto_' + idx + '\',\'' + val.pembayaran_id + '\',\'' + pay_foto + '\')" ';
                html += 'class="popup-open button-small button text-bold ' + btn_class + '" style="padding:5px 10px;' + btn_text_color + '">FOTO</button>';
            }
            
            html += '</td>';
            html += '</tr>';
            
        } else if (!lunas && !hasEmptyRow) {
            // Empty row for new payment (only one)
            hasEmptyRow = true;
            html += generateEmptyPaymentRowTagihan(idx, val.pembayaran_id);
        }
    }
    
    return html;
}

/**
 * Generate Empty Payment Row (for new payment input)
 */
function generateEmptyPaymentRowTagihan(idx, pembayaran_id) {
    var html = '<form id="pembayaran_form_tagihan_multiple_' + idx + '_' + pembayaran_id + '">';
    html += '<tr>';
    html += '<td colspan="2" style="border:1px solid white;" class="text-align-center">Bayar ' + idx + '</td>';
    html += '<td style="border:1px solid white;" class="text-align-center">';
    html += '<input style="width:105px;text-align:center;background-color:#1c1c1d;border:1px solid #444;color:white;" ';
    html += 'id="tanggal_' + idx + '_' + pembayaran_id + '" name="tanggal_' + idx + '_' + pembayaran_id + '" type="date" ';
    html += 'value="' + moment().format('YYYY-MM-DD') + '" class="date-multiple-pembayaran-tagihan" readonly>';
    html += '</td>';
    html += '<td style="border:1px solid white;" class="text-align-center">';
    html += '<select style="width:80%;background-color:#1c1c1d;border:1px solid #444;color:white;padding:5px;" ';
    html += 'id="bank_' + idx + '_' + pembayaran_id + '" name="bank_' + idx + '_' + pembayaran_id + '">';
    html += '<option value="Mandiri" selected>Mandiri</option>';
    html += '<option value="BCA">BCA</option>';
    html += '<option value="BRI">BRI</option>';
    html += '<option value="Tunai">Tunai</option>';
    html += '</select>';
    html += '</td>';
    html += '<td style="border:1px solid white;" class="text-align-center">';
    html += '<input style="width:100%;text-align:right;background-color:#1c1c1d;border:1px solid #444;color:white;padding:5px;" ';
    html += 'class="input-pembayaran-tagihan-multiple" id="pembayaran_' + idx + '_' + pembayaran_id + '" name="pembayaran_' + idx + '_' + pembayaran_id + '" type="text">';
    html += '</td>';
    html += '<td style="border:1px solid white;" class="text-align-center">';
    html += '<input style="width:100%;background-color:#1c1c1d;border:1px solid #444;color:white;padding:5px;" ';
    html += 'id="keterangan_' + idx + '_' + pembayaran_id + '" name="keterangan_' + idx + '_' + pembayaran_id + '" type="text">';
    html += '</td>';
    html += '<td style="border:1px solid white;" class="text-align-center">';
    html += '<label class="button-small button text-bold bg-dark-gray-young" for="foto_bukti_' + idx + '_' + pembayaran_id + '" style="padding:5px 10px;cursor:pointer;">FOTO</label>';
    html += '<input style="display:none;" id="foto_bukti_' + idx + '_' + pembayaran_id + '" name="foto_bukti_' + idx + '_' + pembayaran_id + '" type="file" ';
    html += 'onchange="prosesPembayaranTagihanMultiple(' + pembayaran_id + ',' + idx + ');">';
    html += '</td>';
    html += '</tr>';
    html += '</form>';
    return html;
}

/**
 * Edit Pembayaran Tagihan Popup
 */
function editPembayaranTagihanPopup(bayar_ke, type_foto, pembayaran_id, foto_ke, pembayaran_nominal, keterangan_ke, bank_ke, pembayaran_tgl, sisa_pembayaran, penjualan_grandtotal, total_bayar, keterangan_reject) {
    jQuery('#pembayaran_id_edit_tagihan').val(pembayaran_id);
    jQuery('#bayar_ke_edit_tagihan').val(bayar_ke);
    jQuery('#pembayaran_type_foto_edit_tagihan').val(type_foto);
    jQuery('#sisa_pembayaran_edit_tagihan').val(sisa_pembayaran);
    jQuery('#penjualan_grandtotal_edit_tagihan').val(penjualan_grandtotal);
    jQuery('#total_bayar_edit_tagihan').val(total_bayar);
    jQuery('#last_bayar_edit_tagihan').val(pembayaran_nominal);
    jQuery('#uraian_reject_edit_tagihan').val(keterangan_reject);
    jQuery('#tanggal_pembayaran_edit_tagihan').val(moment(pembayaran_tgl).format('DD-MMM-YYYY'));
    jQuery('#bank_edit_tagihan').val(bank_ke);
    jQuery('#jumlah_pembayaran_edit_tagihan').val(number_format(pembayaran_nominal));
    jQuery('#keterangan_pembayaran_edit_tagihan').val(keterangan_ke);
    
    if (foto_ke != 'null' && foto_ke) {
        jQuery('#file_foto_edit_pembayaran_tagihan_view').attr('src', BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + foto_ke);
    } else {
        jQuery('#file_foto_edit_pembayaran_tagihan_view').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
    }
    
    // Show/hide reject keterangan
    if (keterangan_reject && keterangan_reject != 'null') {
        jQuery('.edit_keterangan_reject_tagihan_li').show();
        jQuery('#edit_keterangan_reject_tagihan').val(keterangan_reject);
    } else {
        jQuery('.edit_keterangan_reject_tagihan_li').hide();
    }
}

/**
 * Edit Pembayaran Tagihan Proses
 */
function editPembayaranTagihanProses() {
    var elem = jQuery('#pembayaran_type_foto_edit_tagihan').val();
    var pembayaran_ke = elem.replace(/(.*)_/, "");

    var total_harus_bayar = parseInt(jQuery('#penjualan_grandtotal_edit_tagihan').val() - (parseInt(jQuery('#total_bayar_edit_tagihan').val() - jQuery('#last_bayar_edit_tagihan').val())));
    var sudah_bayar = parseInt(jQuery('#total_bayar_edit_tagihan').val()) - parseInt(jQuery('#last_bayar_edit_tagihan').val());
    var sudah_bayar_fix = parseInt(sudah_bayar) + parseInt(jQuery('#jumlah_pembayaran_edit_tagihan').val().replace(/\,/g, ''));
    var sisa_harus_bayar = total_harus_bayar - sudah_bayar_fix;

    if (sisa_harus_bayar < 0) {
        var lebih_bayar = sudah_bayar_fix - total_harus_bayar;
        app.dialog.alert('Pembayaran Melebihi Nominal <br> <br> Nominal Lebih : ' + number_format(lebih_bayar) + ' <br><br>Bagi Pada Angsuran Berikutnya');
    } else {
        if (!jQuery('#edit_pembayaran_tagihan_popup')[0].checkValidity()) {
            app.dialog.alert('Cek Isian Form Anda');
        } else {
            var formData = new FormData(jQuery("#edit_pembayaran_tagihan_popup")[0]);
            formData.append('pembayaran_ke', pembayaran_ke);
            formData.append('user_id', localStorage.getItem("user_id"));
            
            app.dialog.confirm('Simpan perubahan pembayaran?', function() {
                jQuery.ajax({
                    type: 'POST',
                    url: BASE_API + "/proses-pembayaran-multiple-edit",
                    dataType: 'JSON',
                    data: formData,
                    contentType: false,
                    processData: false,
                    beforeSend: function () {
                        app.dialog.preloader('Harap Tunggu');
                    },
                    success: function (data) {
                        app.dialog.close();
                        if (data.status == 'success' || data.status == 'done') {
                            app.popup.close('.edit-pembayaran-tagihan');
                            app.dialog.alert('Berhasil Edit Pembayaran', function() {
                                if (typeof getDataTagihan === 'function') {
                                    getDataTagihan(currentPage || 1);
                                }
                            });
                        } else {
                            app.dialog.alert('Gagal Edit Pembayaran: ' + (data.message || 'Unknown'));
                        }
                    },
                    error: function (xhr, status, error) {
                        app.dialog.close();
                        app.dialog.alert('Error: ' + error);
                    }
                });
            });
        }
    }
}

/**
 * Proses Pembayaran Multiple (New Payment)
 */
function prosesPembayaranTagihanMultiple(pembayaran_id, number) {
    var tanggal = jQuery('#tanggal_' + number + '_' + pembayaran_id).val();
    var bank = jQuery('#bank_' + number + '_' + pembayaran_id).val();
    var nominal = jQuery('#pembayaran_' + number + '_' + pembayaran_id).val().replace(/,/g, '');
    var keterangan = jQuery('#keterangan_' + number + '_' + pembayaran_id).val();
    var foto = jQuery('#foto_bukti_' + number + '_' + pembayaran_id).prop('files')[0];
    
    if (!nominal || nominal == 0) {
        app.dialog.alert('Jumlah harus diisi');
        return;
    }
    
    if (!foto) {
        app.dialog.alert('Foto harus diupload');
        return;
    }
    
    var formData = new FormData();
    formData.append('pembayaran_id', pembayaran_id);
    formData.append('number', number);
    formData.append('tanggal', tanggal);
    formData.append('bank', bank);
    formData.append('nominal', nominal);
    formData.append('keterangan', keterangan);
    formData.append('foto_bukti', foto);
    formData.append('user_id', localStorage.getItem("user_id"));
    
    app.dialog.confirm('Simpan pembayaran Rp ' + number_format(nominal) + '?', function () {
        jQuery.ajax({
            type: "POST",
            url: BASE_API + "/proses-pembayaran-multiple-new",
            data: formData,
            contentType: false,
            processData: false,
            xhr: function () {
                var dialog = app.dialog.progress('Saving', 0);
                var xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var pct = Math.round((evt.loaded / evt.total) * 100);
                        dialog.setProgress(pct);
                        dialog.setText(pct + '%');
                    }
                }, false);
                return xhr;
            },
            success: function (data) {
                app.dialog.close();
                if (data.status == 'success') {
                    app.dialog.alert('Berhasil simpan', function() {
                        if (typeof getDataTagihan === 'function') {
                            getDataTagihan(currentPage || 1);
                        }
                    });
                } else {
                    app.dialog.alert('Gagal: ' + (data.message || 'Unknown'));
                }
            },
            error: function (xhr, status, error) {
                app.dialog.close();
                app.dialog.alert('Error: ' + error);
            }
        });
    });
}

/**
 * Proses Pembayaran Single Mode
 */
function prosesPembayaranTagihan() {
    var penjualan_id = jQuery('#pembayaran-tagihan-penjualan_id').val();
    var client_id = jQuery('#pembayaran-tagihan-client_id').val();
    
    if (!penjualan_id) {
        app.dialog.alert('Data tidak lengkap');
        return;
    }
    
    // Collect payments
    var payments = [];
    var fields = [
        {num: 1, field: 'pembayaran_tagihan_1_dp_awal', bank: 'bank_tagihan_1'},
        {num: 2, field: 'pembayaran_tagihan_2', bank: 'bank_tagihan_2'},
        {num: 3, field: 'pembayaran_tagihan_3', bank: 'bank_tagihan_3'},
        {num: 4, field: 'pembayaran_tagihan_4', bank: 'bank_tagihan_4'},
        {num: 5, field: 'pembayaran_tagihan_5', bank: 'bank_tagihan_5'},
        {num: 6, field: 'pembayaran_tagihan_6', bank: 'bank_tagihan_6'},
        {num: 7, field: 'pembayaran_tagihan_7', bank: 'bank_tagihan_7'},
        {num: 8, field: 'pembayaran_tagihan_8', bank: 'bank_tagihan_8'},
        {num: 9, field: 'pembayaran_tagihan_9', bank: 'bank_tagihan_9'},
        {num: 10, field: 'pembayaran_tagihan_10', bank: 'bank_tagihan_10'}
    ];
    
    fields.forEach(function(f) {
        var nominal = jQuery('#' + f.field).val().replace(/,/g, '');
        var bank = jQuery('#' + f.bank).val();
        
        if (nominal && parseInt(nominal) > 0) {
            payments.push({
                number: f.num,
                nominal: nominal,
                bank: bank
            });
        }
    });
    
    if (payments.length == 0) {
        app.dialog.alert('Tidak ada pembayaran');
        return;
    }
    
    app.dialog.confirm('Proses pembayaran?', function () {
        jQuery.ajax({
            type: "POST",
            url: BASE_API + "/pembayaran",
            dataType: "JSON",
            data: {
                pembayaran_1: payments.find(p => p.number === 1)?.nominal || 0,
                pembayaran_2: payments.find(p => p.number === 2)?.nominal || 0,
                pembayaran_3: payments.find(p => p.number === 3)?.nominal || 0,
                pembayaran_4: payments.find(p => p.number === 4)?.nominal || 0,
                pembayaran_5: payments.find(p => p.number === 5)?.nominal || 0,
                pembayaran_6: payments.find(p => p.number === 6)?.nominal || 0,
                pembayaran_7: payments.find(p => p.number === 7)?.nominal || 0,
                pembayaran_8: payments.find(p => p.number === 8)?.nominal || 0,
                pembayaran_9: payments.find(p => p.number === 9)?.nominal || 0,
                pembayaran_10: payments.find(p => p.number === 10)?.nominal || 0,
                bank_1: jQuery("#bank_tagihan_1").val(),
                bank_2: jQuery("#bank_tagihan_2").val(),
                bank_3: jQuery("#bank_tagihan_3").val(),
                bank_4: jQuery("#bank_tagihan_4").val(),
                bank_5: jQuery("#bank_tagihan_5").val(),
                bank_6: jQuery("#bank_tagihan_6").val(),
                bank_7: jQuery("#bank_tagihan_7").val(),
                bank_8: jQuery("#bank_tagihan_8").val(),
                bank_9: jQuery("#bank_tagihan_9").val(),
                bank_10: jQuery("#bank_tagihan_10").val(),
                karyawan_id: localStorage.getItem("user_id"),
                client_id: client_id,
                penjualan_id: penjualan_id,
            },
            beforeSend: function () {
                app.dialog.preloader('Processing...');
            },
            success: function (data) {
                app.dialog.close();
                if (data.status == 'success' || data.status == 'done') {
                    app.popup.close('.detail-pembayaran-tagihan');
                    app.dialog.alert('Berhasil proses', function() {
                        if (typeof getDataTagihan === 'function') {
                            getDataTagihan(currentPage || 1);
                        }
                    });
                } else {
                    app.dialog.alert('Gagal: ' + (data.message || 'Unknown'));
                }
            },
            error: function (xhr, status, error) {
                app.dialog.close();
                app.dialog.alert('Error: ' + error);
            }
        });
    });
}

/**
 * Upload Foto Pembayaran Tagihan
 */
function uploadFotoPembayaranTagihan(foto_urutan, pembayaran_id, isi_foto) {
    jQuery('#foto_pembayaran_tagihan_urutan').val(foto_urutan);
    jQuery('#pembayaran_id_upload_tagihan').val(pembayaran_id);
    
    if (isi_foto && isi_foto != 'null') {
        jQuery('#file_foto_pembayaran_tagihan_view_now').attr('src', BASE_PATH_IMAGE_FOTO_PEMBAYARAN + '/' + isi_foto);
    } else {
        jQuery('#file_foto_pembayaran_tagihan_view_now').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
    }
}

/**
 * Helper: Empty Value
 */
function emptyValueTagihan(inputId) {
    jQuery('#' + inputId).val('');
}

/**
 * Helper: Zoom View Foto
 */
function zoom_view_foto_bayar(src) {
    if (typeof zoom_view === 'function') {
        zoom_view(src);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================
console.log('=== TAGIHAN.JS WITH PAYMENT BUTTON LOADED ===');

// Apply mask on page load
jQuery(document).ready(function() {
    jQuery('.pembayaran_tagihan_1_dp').mask('000,000,000,000', { reverse: true });
    jQuery('.pembayaran-tagihan-input').mask('000,000,000,000', { reverse: true });
    jQuery('.input-pembayaran-tagihan-multiple').mask('000,000,000,000', { reverse: true });
    jQuery('#jumlah_pembayaran_edit_tagihan').mask('000,000,000,000', { reverse: true });
});