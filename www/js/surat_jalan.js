

function SJValue(){
	jQuery('#no_surat_jalan').val('SJ_');
}

function SJEmptyValue(id){
	console.log(id);
	jQuery('#jumlah_'+id+'').val('');
}



function retur(kode_retur1,tgl_retur1,penerima1,keterangan1,retur1,kode_retur2,tgl_retur2,penerima2,keterangan2,retur2,kode_retur3,tgl_retur3,penerima3,keterangan3,retur3,kode_retur4,tgl_retur4,penerima4,keterangan4,retur4,kode_retur5,tgl_retur5,penerima5,keterangan5,retur5,kode_retur6,tgl_retur6,penerima6,keterangan6,retur6, kode_retur7,tgl_retur7,penerima7,keterangan7,retur7,kode_retur8,tgl_retur8,penerima8,keterangan8,retur8,kode_retur9,tgl_retur9,penerima9,keterangan9,retur9,kode_retur10,tgl_retur10,penerima10,keterangan10,retur10,client_id,type) {
	
	$$(".input1").prop('required',true);
	$$(".input2").removeAttr("required");
	$$(".input3").removeAttr("required");
	$$(".input4").removeAttr("required");
	$$(".input5").removeAttr("required");
	$$(".input6").removeAttr("required");

	if(number_format(retur1)!=0){
		$$('.content_retur2').show();
		$$(".input2").prop('required',true);
		jQuery('#kode_retur1').val(kode_retur1);
		jQuery('#tanggal_retur1').html(moment(tgl_retur1).format('DD-MMM'));
		jQuery('#penerima1').val(penerima1);
		jQuery('#ket_retur1').val(keterangan1);
		jQuery('#retur_qty1').val(retur1);
		$$('#kode_retur1').attr('readonly', true);
		$$('#kode_retur1').prop("onclick", null).off("click");		
		$$('#tanggal_retur1').attr('readonly', true);
		$$('#tanggal_retur1').prop("onclick", null).off("click");
		$$('#penerima1').attr('readonly', true);
		$$('#penerima1').prop("onclick", null).off("click");
		$$('#ket_retur1').attr('readonly', true);
		$$('#ket_retur1').prop("onclick", null).off("click");
		$$('#retur_qty1').attr('readonly', true);
		$$('#retur_qty1').prop("onclick", null).off("click");
	}else{
		$$('.content_retur2').hide();
		jQuery('#kode_retur1').val("");
		jQuery('#tanggal_retur1').html("Tanggal");
		jQuery('#penerima1').val("");
		jQuery('#ket_retur1').val("");
		jQuery('#retur_qty1').val("");
		$$('#kode_retur1').removeAttr("readonly");
		$$('#kode_retur1').attr('onClick','emptyValue("kode_retur1")');
		$$('#tanggal_retur1').removeAttr("readonly");
		$$('#tanggal_retur1').attr('onClick','emptyValue("tanggal_retur1")');
		$$('#penerima1').removeAttr('readonly');
		$$('#penerima1').attr('onClick','emptyValue("penerima1")');
		$$('#ket_retur1').removeAttr('readonly');
		$$('#ket_retur1').attr('onClick','emptyValue("ket_retur1")');
		$$('#retur_qty1').removeAttr("readonly");
		$$('#retur_qty1').attr('onClick','suratJalanValue("retur_qty1")');
	}

	if(number_format(retur2)!=0){
		$$('.content_retur3').show();
		$$(".input3").prop('required',true);
		jQuery('#kode_retur2').val(kode_retur2);
		jQuery('#tanggal_retur2').html(moment(tgl_retur2).format('DD-MMM'));
		jQuery('#penerima2').val(penerima2);
		jQuery('#ket_retur2').val(keterangan2);
		jQuery('#retur_qty2').val(retur2);

		$$('#kode_retur2').attr('readonly', true);
		$$('#kode_retur2').prop("onclick", null).off("click");		
		$$('#tanggal_retur2').attr('readonly', true);
		$$('#tanggal_retur2').prop("onclick", null).off("click");
		$$('#penerima2').attr('readonly', true);
		$$('#penerima2').prop("onclick", null).off("click");
		$$('#ket_retur2').attr('readonly', true);
		$$('#ket_retur2').prop("onclick", null).off("click");
		$$('#retur_qty2').attr('readonly', true);
		$$('#retur_qty2').prop("onclick", null).off("click");
	}else{
		$$('.content_retur3').hide();
		jQuery('#kode_retur2').val("");
		jQuery('#tanggal_retur2').html("Tanggal");
		jQuery('#penerima2').val("");
		jQuery('#ket_retur2').val("");
		jQuery('#retur_qty2').val("");
		$$('#kode_retur2').removeAttr("readonly");
		$$('#kode_retur2').attr('onClick','emptyValue("kode_retur2")');
		$$('#tanggal_retur2').removeAttr("readonly");
		$$('#tanggal_retur2').attr('onClick','emptyValue("tanggal_retur2")');
		$$('#penerima2').removeAttr('readonly');
		$$('#penerima2').attr('onClick','emptyValue("penerima2")');
		$$('#ket_retur2').removeAttr('readonly');
		$$('#ket_retur2').attr('onClick','emptyValue("ket_retur2")');
		$$('#retur_qty2').removeAttr("readonly");
		$$('#retur_qty2').attr('onClick','suratJalanValue("retur_qty2")');
	}

	if(number_format(retur3)!=0){
		$$('.content_retur4').show();
		$$(".input4").prop('required',true);
		jQuery('#kode_retur3').val(kode_retur3);
		jQuery('#tanggal_retur3').html(moment(tgl_retur3).format('DD-MMM'));
		jQuery('#penerima3').val(penerima3);
		jQuery('#ket_retur3').val(keterangan3);
		jQuery('#retur_qty3').val(retur3);

		$$('#kode_retur3').attr('readonly', true);
		$$('#kode_retur3').prop("onclick", null).off("click");		
		$$('#tanggal_retur3').attr('readonly', true);
		$$('#tanggal_retur3').prop("onclick", null).off("click");
		$$('#penerima3').attr('readonly', true);
		$$('#penerima3').prop("onclick", null).off("click");
		$$('#ket_retur3').attr('readonly', true);
		$$('#ket_retur3').prop("onclick", null).off("click");
		$$('#retur_qty3').attr('readonly', true);
		$$('#retur_qty3').prop("onclick", null).off("click");
	}else{
		$$('.content_retur4').hide();
		jQuery('#kode_retur3').val("");
		jQuery('#tanggal_retur3').html("Tanggal");
		jQuery('#penerima3').val("");
		jQuery('#ket_retur3').val("");
		jQuery('#retur_qty3').val("");
		$$('#kode_retur3').removeAttr("readonly");
		$$('#kode_retur3').attr('onClick','emptyValue("kode_retur3")');
		$$('#tanggal_retur3').removeAttr("readonly");
		$$('#tanggal_retur3').attr('onClick','emptyValue("tanggal_retur3")');
		$$('#penerima3').removeAttr('readonly');
		$$('#penerima3').attr('onClick','emptyValue("penerima3")');
		$$('#ket_retur3').removeAttr('readonly');
		$$('#ket_retur3').attr('onClick','emptyValue("ket_retur3")');
		$$('#retur_qty3').removeAttr("readonly");
		$$('#retur_qty3').attr('onClick','suratJalanValue("retur_qty3")');
	}


	if(number_format(retur4)!=0){
		$$('.content_retur5').show();
		$$(".input5").prop('required',true);
		jQuery('#kode_retur4').val(kode_retur4);
		jQuery('#tanggal_retur4').html(moment(tgl_retur4).format('DD-MMM'));
		jQuery('#penerima4').val(penerima4);
		jQuery('#ket_retur4').val(keterangan4);
		jQuery('#retur_qty4').val(retur4);

		$$('#kode_retur4').attr('readonly', true);
		$$('#kode_retur4').prop("onclick", null).off("click");		
		$$('#tanggal_retur4').attr('readonly', true);
		$$('#tanggal_retur4').prop("onclick", null).off("click");
		$$('#penerima4').attr('readonly', true);
		$$('#penerima4').prop("onclick", null).off("click");
		$$('#ket_retur4').attr('readonly', true);
		$$('#ket_retur4').prop("onclick", null).off("click");
		$$('#retur_qty4').attr('readonly', true);
		$$('#retur_qty4').prop("onclick", null).off("click");
	}else{
		$$('.content_retur5').hide();
		jQuery('#kode_retur4').val("");
		jQuery('#tanggal_retur4').html("Tanggal");
		jQuery('#penerima4').val("");
		jQuery('#ket_retur4').val("");
		jQuery('#retur_qty4').val("");
		$$('#kode_retur4').removeAttr("readonly");
		$$('#kode_retur4').attr('onClick','emptyValue("kode_retur4")');
		$$('#tanggal_retur4').removeAttr("readonly");
		$$('#tanggal_retur4').attr('onClick','emptyValue("tanggal_retur4")');
		$$('#penerima4').removeAttr('readonly');
		$$('#penerima4').attr('onClick','emptyValue("penerima4")');
		$$('#ket_retur4').removeAttr('readonly');
		$$('#ket_retur4').attr('onClick','emptyValue("ket_retur4")');
		$$('#retur_qty4').removeAttr("readonly");
		$$('#retur_qty4').attr('onClick','suratJalanValue("retur_qty4")');
	}

	if(number_format(retur5)!=0){
		$$('.content_retur6').show();
		jQuery('#kode_retur5').val(kode_retur5);
		jQuery('#tanggal_retur5').html(moment(tgl_retur5).format('DD-MMM'));
		jQuery('#penerima5').val(penerima5);
		jQuery('#ket_retur5').val(keterangan5);
		jQuery('#retur_qty5').val(retur5);

		$$('#kode_retur5').attr('readonly', true);
		$$('#kode_retur5').prop("onclick", null).off("click");		
		$$('#tanggal_retur5').attr('readonly', true);
		$$('#tanggal_retur5').prop("onclick", null).off("click");
		$$('#penerima5').attr('readonly', true);
		$$('#penerima5').prop("onclick", null).off("click");
		$$('#ket_retur5').attr('readonly', true);
		$$('#ket_retur5').prop("onclick", null).off("click");
		$$('#retur_qty5').attr('readonly', true);
		$$('#retur_qty5').prop("onclick", null).off("click");
	}else{
		$$('.content_retur6').hide();
		jQuery('#kode_retur5').val("");
		jQuery('#tanggal_retur5').html("Tanggal");
		jQuery('#penerima5').val("");
		jQuery('#ket_retur5').val("");
		jQuery('#retur_qty5').val("");
		$$('#kode_retur5').removeAttr("readonly");
		$$('#kode_retur5').attr('onClick','emptyValue("kode_retur5")');
		$$('#tanggal_retur5').removeAttr("readonly");
		$$('#tanggal_retur5').attr('onClick','emptyValue("tanggal_retur5")');
		$$('#penerima5').removeAttr('readonly');
		$$('#penerima5').attr('onClick','emptyValue("penerima5")');
		$$('#ket_retur5').removeAttr('readonly');
		$$('#ket_retur5').attr('onClick','emptyValue("ket_retur5")');
		$$('#retur_qty5').removeAttr("readonly");
		$$('#retur_qty5').attr('onClick','suratJalanValue("retur_qty5")');
	}

	jQuery('#client_id_retur').val(client_id);

}

function prosesRetur() {
	if (!$$('#retur_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Retur Anda');
	} else {
		jQuery.ajax({
			type: 'POST',
			url: ""+BASE_API+"/retur-proses",
			dataType: 'JSON',		 
			data: {
				client_id: jQuery("#client_id_retur").val(),
				penerima1: jQuery("#penerima1").val(),
				retur_qty1: jQuery("#retur_qty1").val(),
				tanggal_retur1: jQuery("#tanggal_retur1").val(),
				ket_retur1: jQuery("#ket_retur1").val(),
				kode_retur1: jQuery("#kode_retur1").val(),
				penerima2: jQuery("#penerima2").val(),
				retur_qty2: jQuery("#retur_qty2").val(),
				tanggal_retur2: jQuery("#tanggal_retur2").val(),
				ket_retur2: jQuery("#ket_retur2").val(),
				kode_retur2: jQuery("#kode_retur2").val(),
				penerima3: jQuery("#penerima3").val(),
				retur_qty3: jQuery("#retur_qty3").val(),
				tanggal_retur3: jQuery("#tanggal_retur3").val(),
				ket_retur3: jQuery("#ket_retur3").val(),
				kode_retur3: jQuery("#kode_retur3").val(),
				penerima4: jQuery("#penerima4").val(),
				retur_qty4: jQuery("#retur_qty4").val(),
				tanggal_retur4: jQuery("#tanggal_retur4").val(),
				ket_retur4: jQuery("#ket_retur4").val(),
				kode_retur4: jQuery("#kode_retur4").val(),
				penerima5: jQuery("#penerima5").val(),
				retur_qty5: jQuery("#retur_qty5").val(),
				tanggal_retur5: jQuery("#tanggal_retur5").val(),
				ket_retur5: jQuery("#ket_retur5").val(),
				kode_retur5: jQuery("#kode_retur5").val()
			},
			beforeSend: function() {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function(data) {	
				getHeaderPenjualanKunjungan(1);
				app.dialog.close();
				app.popup.close();
				$$('#retur_field').empty();
				if(data.status=='done'){
					app.dialog.alert('Berhasil Input Retur');
				}else if(data.status=='failed'){
					app.dialog.alert('Gagal Input Retur');
				}
			},
			error: function(xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function prosesSuratJalan() {

	var count_jumlah_item_sj = 0;
	$$('.jumlah_item_sj').each(function(){
		count_jumlah_item_sj++;
	});

	if (!$$('#surat_jalan_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Surat Anda');
	} else {
		var formData = new FormData(jQuery("#surat_jalan_form")[0]);

		formData.append('jumlah_item_sj', count_jumlah_item_sj); 
		jQuery.ajax({
			type: 'POST',
			url: ""+BASE_API+"/surat-jalan-proses",
			dataType: 'JSON',		 
			data:   formData,
			contentType: false,
			processData: false,
			beforeSend: function() {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function(data) {	
				getHeaderPenjualanKunjungan(1);
				app.dialog.close();
				app.popup.close();
				$$('#surat_jalan_field').empty();
				if(data.status=='done'){
					app.dialog.alert('Berhasil Input Surat Jalan');
				}else if(data.status=='failed'){
					app.dialog.alert('Gagal Input Surat Jalan');
				}
			},
			error: function(xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function suratJalan(kendaraan1,kendaraan2,kendaraan3,kendaraan4,kendaraan5,plat_no1,plat_no2,plat_no3,plat_no4,plat_no5,pengirim1,pengirim2,pengirim3,pengirim4,pengirim5,total_kirim,total_terkirim,penjualan_id,penjualan_detail_performa_id,kiriman_1,kiriman_2,kiriman_3,kiriman_4,kiriman_5,tgl_kirim1,tgl_kirim2,tgl_kirim3,tgl_kirim4,tgl_kirim5,surat_jalan1,surat_jalan2,surat_jalan3,surat_jalan4,surat_jalan5) {
	$$('#penjualan_detail_performa_id').val(penjualan_detail_performa_id);
	$$('#penjualan_id_surat_jalan').val(penjualan_id);
	$$('#stok_kirim_html').html(total_kirim);
	$$('#total_kirim_html').html(total_terkirim);
	var sisa = total_kirim-total_terkirim;
	$$('#sisa_kirim_html').html(sisa);

	$$(".input-sj-1").prop('required',true);
	$$(".input-sj-2").removeAttr("required");
	$$(".input-sj-3").removeAttr("required");
	$$(".input-sj-4").removeAttr("required");
	$$(".input-sj-5").removeAttr("required");
	$$(".input-sj-6").removeAttr("required");


	if(number_format(kiriman_1)!=0){
		$$('.content_kirim2').show();
		$$(".input-sj-2").prop('required',true);
		$$('#kiriman_1').val(number_format(kiriman_1));
		$$('#surat_jalan1').val(surat_jalan1);
		$$('#kendaraan1').val(kendaraan1);
		$$('#plat_no1').val(plat_no1);
		$$('#pengirim1').val(pengirim1);
		$$('#popup-kirim-1').html(moment(tgl_kirim1).format('DD-MMM'));
		$$('#kiriman_1').attr('readonly', true);
		$$('#kiriman_1').prop("onclick", null).off("click");
		$$('#plat_no1').attr('readonly', true);
		$$('#plat_no1').prop("onclick", null).off("click");
		$$('#kendaraan1').attr('readonly', true);
		$$('#kendaraan1').prop("onclick", null).off("click");
		$$('#pengirim1').attr('readonly', true);
		$$('#pengirim1').prop("onclick", null).off("click");		
		$$('#surat_jalan1').attr('readonly', true);
		$$('#surat_jalan1').prop("onclick", null).off("click");	
	}else{
		$$('#kiriman_1').val(number_format(0));
		$$('#surat_jalan1').val("");
		$$('.content_kirim2').hide();
		$$('#popup-kirim-1').html("tgl");	
		
		$$('#kiriman_1').val("");
		$$('#plat_no1').val("");
		$$('#kendaraan1').val("");
		$$('#pengirim1').val("");
		$$('#surat_jalan1').val("");

		$$('#kiriman_1').removeAttr("readonly");
		$$('#kiriman_1').attr('onClick','emptyValue("kiriman_1")');
		$$('#plat_no1').removeAttr("readonly");
		$$('#plat_no1').attr('onClick','emptyValue("plat_no1")');
		$$('#kendaraan1').removeAttr('readonly');
		$$('#kendaraan1').attr('onClick','emptyValue("kendaraan1")');
		$$('#pengirim1').removeAttr('readonly');
		$$('#pengirim1').attr('onClick','emptyValue("pengirim1")');
		$$('#surat_jalan1').removeAttr("readonly");
		$$('#surat_jalan1').attr('onClick','suratJalanValue("surat_jalan1")');
	}
	if(number_format(kiriman_2)!=0){
		$$('.content_kirim3').show();
		$$(".input-sj-3").prop('required',true);
		$$('#kiriman_2').val(number_format(kiriman_2));
		$$('#surat_jalan2').val(surat_jalan2);
		$$('#kendaraan2').val(kendaraan2);
		$$('#plat_no2').val(plat_no2);
		$$('#pengirim2').val(pengirim2);
		$$('#popup-kirim-2').html(moment(tgl_kirim2).format('DD-MMM'));
		$$('#kiriman_2').attr('readonly', true);
		$$('#kiriman_2').prop("onclick", null).off("click");
		$$('#plat_no2').attr('readonly', true);
		$$('#plat_no2').prop("onclick", null).off("click");
		$$('#kendaraan2').attr('readonly', true);
		$$('#kendaraan2').prop("onclick", null).off("click");
		$$('#pengirim2').attr('readonly', true);
		$$('#pengirim2').prop("onclick", null).off("click");
		$$('#surat_jalan2').attr('readonly', true);
		$$('#surat_jalan2').prop("onclick", null).off("click");		
	}else{
		$$('#kiriman_2').val(number_format(0));
		$$('#surat_jalan2').val("");
		$$('.content_kirim3').hide();
		$$('#popup-kirim-2').html("tgl");		
		$$('#kiriman_2').val("");
		$$('#plat_no2').val("");
		$$('#kendaraan2').val("");
		$$('#pengirim2').val("");
		$$('#surat_jalan2').val("");

		$$('#kiriman_2').removeAttr("readonly");
		$$('#kiriman_2').attr('onClick','emptyValue("kiriman_2")');
		$$('#plat_no2').removeAttr("readonly");
		$$('#plat_no2').attr('onClick','emptyValue("plat_no2")');
		$$('#kendaraan2').removeAttr('readonly');
		$$('#kendaraan2').attr('onClick','emptyValue("kendaraan2")');
		$$('#pengirim2').removeAttr('readonly');
		$$('#pengirim2').attr('onClick','emptyValue("pengirim2")');
		$$('#surat_jalan2').removeAttr("readonly");
		$$('#surat_jalan2').attr('onClick','suratJalanValue("surat_jalan2")');
	}

	if(number_format(kiriman_3)!=0){
		$$('#kiriman_3').val(number_format(kiriman_3));
		$$('#surat_jalan3').val(surat_jalan3);
		$$('#kendaraan3').val(kendaraan3);
		$$('#plat_no3').val(plat_no3);
		$$('#pengirim3').val(pengirim3);
		$$('#popup-kirim-3').html(moment(tgl_kirim3).format('DD-MMM'));		
		$$('#kiriman_3').attr('readonly', true);
		$$('.content_kirim4').show();
		$$(".input-sj-4").prop('required',true);
		$$('#kiriman_3').prop("onclick", null).off("click");
		$$('#plat_no3').attr('readonly', true);
		$$('#plat_no3').prop("onclick", null).off("click");
		$$('#kendaraan3').attr('readonly', true);
		$$('#kendaraan3').prop("onclick", null).off("click");
		$$('#pengirim3').attr('readonly', true);
		$$('#pengirim3').prop("onclick", null).off("click");		
		$$('#surat_jalan3').attr('readonly', true);
		$$('#surat_jalan3').prop("onclick", null).off("click");	
	}else{
		$$('#kiriman_3').val(number_format(0));
		$$('#surat_jalan3').val("");
		$$('.content_kirim4').hide();
		$$('#kiriman_3').val("");
		$$('#plat_no3').val("");
		$$('#kendaraan3').val("");
		$$('#pengirim3').val("");
		$$('#surat_jalan3').val("");

		$$('#popup-kirim-3').html("tgl");		
		$$('#kiriman_3').removeAttr("readonly");
		$$('#kiriman_3').attr('onClick','emptyValue("kiriman_3")');
		$$('#plat_no3').removeAttr("readonly");
		$$('#plat_no3').attr('onClick','emptyValue("plat_no3")');
		$$('#kendaraan3').removeAttr('readonly');
		$$('#kendaraan3').attr('onClick','emptyValue("kendaraan3")');
		$$('#pengirim3').removeAttr('readonly');
		$$('#pengirim3').attr('onClick','emptyValue("pengirim3")');
		$$('#surat_jalan3').removeAttr("readonly");
		$$('#surat_jalan3').attr('onClick','suratJalanValue("surat_jalan3")');
	}
	if(number_format(kiriman_4)!=0){
		$$('#kiriman_4').val(number_format(kiriman_4));
		$$('#surat_jalan4').val(surat_jalan4);
		$$('#kendaraan4').val(kendaraan4);
		$$('#plat_no4').val(plat_no4);
		$$('#pengirim4').val(pengirim4);
		$$('#popup-kirim-4').html(moment(tgl_kirim4).format('DD-MMM'));
		$$('#kiriman_4').attr('readonly', true);
		$$('.content_kirim5').show();
		$$(".input-sj-5").prop('required',true);
		$$('#kiriman_4').prop("onclick", null).off("click");
		$$('#plat_no4').attr('readonly', true);
		$$('#plat_no4').prop("onclick", null).off("click");
		$$('#kendaraan4').attr('readonly', true);
		$$('#kendaraan4').prop("onclick", null).off("click");
		$$('#pengirim4').attr('readonly', true);
		$$('#pengirim4').prop("onclick", null).off("click");	
		$$('#surat_jalan4').attr('readonly', true);
		$$('#surat_jalan4').prop("onclick", null).off("click");
	}else{
		$$('#kiriman_4').val(number_format(0));
		$$('#surat_jalan4').val("");
		$$('.content_kirim5').hide();
		$$('#popup-kirim-4').html("tgl");
		$$('#kiriman_4').val("");
		$$('#plat_no4').val("");
		$$('#kendaraan4').val("");
		$$('#pengirim4').val("");
		$$('#surat_jalan4').val("");

		$$('#kiriman_4').removeAttr("readonly");
		$$('#kiriman_4').attr('onClick','emptyValue("kiriman_4")');
		$$('#plat_no4').removeAttr("readonly");
		$$('#plat_no4').attr('onClick','emptyValue("plat_no4")');
		$$('#kendaraan4').removeAttr('readonly');
		$$('#kendaraan4').attr('onClick','emptyValue("kendaraan4")');
		$$('#pengirim4').removeAttr('readonly');
		$$('#pengirim4').attr('onClick','emptyValue("pengirim4")');
		$$('#surat_jalan4').removeAttr("readonly");
		$$('#surat_jalan4').attr('onClick','suratJalanValue("surat_jalan4")');
	}
	if(number_format(kiriman_5)!=0){
		$$('#kiriman_5').val(number_format(kiriman_5));
		$$('#surat_jalan5').val(surat_jalan5);
		$$('#kendaraan5').val(kendaraan5);
		$$('#plat_no5').val(plat_no5);
		$$('#pengirim5').val(pengirim5);
		$$('#kiriman_5').attr('readonly', true);
		$$('#popup-kirim-5').html(moment(tgl_kirim5).format('DD-MMM'));
		$$('.content_kirim6').show();
		$$(".input-sj-6").prop('required',true);
		$$('#kiriman_5').prop("onclick", null).off("click");
		$$('#plat_no5').attr('readonly', true);
		$$('#plat_no5').prop("onclick", null).off("click");
		$$('#kendaraan5').attr('readonly', true);
		$$('#kendaraan5').prop("onclick", null).off("click");
		$$('#pengirim5').attr('readonly', true);
		$$('#pengirim5').prop("onclick", null).off("click");	
		$$('#surat_jalan5').attr('readonly', true);
		$$('#surat_jalan5').prop("onclick", null).off("click");
	}else{
		$$('#kiriman_5').val(number_format(0));
		$$('#surat_jalan5').val("");
		$$('.content_kirim6').hide();
		$$('#popup-kirim-5').html("tgl");	
		$$('#kiriman_5').val("");
		$$('#plat_no5').val("");
		$$('#kendaraan5').val("");
		$$('#pengirim5').val("");
		$$('#surat_jalan5').val("");

		$$('#kiriman_5').removeAttr("readonly");
		$$('#kiriman_5').attr('onClick','emptyValue("kiriman_5")');
		$$('#plat_no5').removeAttr("readonly");
		$$('#plat_no5').attr('onClick','emptyValue("plat_no5")');
		$$('#kendaraan5').removeAttr('readonly');
		$$('#kendaraan5').attr('onClick','emptyValue("kendaraan5")');
		$$('#pengirim5').removeAttr('readonly');
		$$('#pengirim5').attr('onClick','emptyValue("pengirim5")');
		$$('#surat_jalan5').removeAttr("readonly");
		$$('#surat_jalan5').attr('onClick','suratJalanValue("surat_jalan5")');
	}
}


function getSuratJalanList(penjualan_id,penjualan_qty) {
	jQuery.ajax({
		type: 'POST',
		url: ""+BASE_API+"/get-surat-jalan-list",
		dataType: 'JSON',
		data: {
			penjualan_id : penjualan_id
		},
		beforeSend: function() {
			app.dialog.preloader('Harap Tunggu');
			$$('#terkirim_sj').html('-');
			$$('#kurang_terkirim_sj').html('-');
		},
		success: function(data) {
			app.dialog.close();

			var penjualan_value ="";
			var total_qty = 0;
			var total_stok_sj = $$('#stok_sj').html();
			
			if(data.data.length != 0){	
				$.each(data.data, function(i_qty, item_qty) {
					total_qty += item_qty.jumlah_kirim;
				});
				$$('#terkirim_sj').html(total_qty);
				$$('#kurang_terkirim_sj').html(total_stok_sj-total_qty);
			}
			
			$.each(data.data_distinct, function(i_d, item_d) {
				penjualan_value += '<tr>';
				penjualan_value += '<td  style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;" align="center"  class="label-cell">'+item_d.no_surat_jalan+'</td>';
				penjualan_value += '<td align="center" colspan="4" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">'+moment(item_d.tanggal).format('DD-MMM-YY hh:mm')+'</td>';
				penjualan_value += '</tr>';
				penjualan_value += '<tr>';
				penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Jumlah</td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Type</td>';
				penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Plat</td>';
				penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Kendaraan</td>';
				penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Pengirim</td>';
				penjualan_value += '</tr>';	
				$.each(data.data, function(i, item) {
					if(item.jumlah_kirim!=0){
						if(item_d.tanggal==item.tanggal){
							penjualan_value += '<tr>';
							penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">'+item.jumlah_kirim+'</td>';
							penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">'+item.penjualan_jenis+'</td>';
							penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">'+item.plat+'</td>';
							penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">'+item.kendaraan+'</td>';
							penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">'+item.pengirim+'</td>';
							penjualan_value += '</tr>';	
						}
					}
				});

			});
			

			$$('#detail_surat_jalan_history').html(penjualan_value);
			
		},
		error: function(xmlhttprequest, textstatus, message) {
		}
	});
}

function getSuratJalanDetail(penjualan_id,penjualan_qty) {
	jQuery.ajax({
		type: 'POST',
		url: ""+BASE_API+"/get-penjualan-surat-jalan",
		dataType: 'JSON',
		data: {
			penjualan_id : penjualan_id
		},
		beforeSend: function() {
		},
		success: function(data) {
			var total_stock = 0;
			$.each(data.data, function(i_pjl_qty, item_pjl_qty) {
				total_stock += item_pjl_qty.penjualan_qty;
			});
			
			$$('#stok_sj').html(total_stock);
			getSuratJalanList(penjualan_id,penjualan_qty);
			var penjualan_value="";
			var penjualan_value_2="";
			penjualan_value_2 += '<tr>';
			penjualan_value_2 += '<td width="50%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="height:28px; width:100%;" type="hidden" id="penjualan_total_qty_detail" name="penjualan_total_qty_detail" placeholder="penjualan_total_qty_detail" value="'+total_stock+'" required validate/> <input type="hidden" id="penjualan_id_sj" name="penjualan_id_sj" placeholder="penjualan_id_sj" value="'+penjualan_id+'" required validate/> <input type="text" style="width:100%; height:28px;" id="kendaraan" name="kendaraan" placeholder="kendaraan" required validate/></td>';
			penjualan_value_2 += '<td width="50%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="height:28px; width:100%;" type="text" id="plat" name="plat" placeholder="Plat" required validate/></td>';
			penjualan_value_2 += '</tr>';
			penjualan_value_2 += '<tr>';
			penjualan_value_2 += '<td width="50%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="height:28px; width:100%;" type="text" id="pengirim" name="pengirim" placeholder="pengirim" required validate/></td>';
			penjualan_value_2 += '<td width="50%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="height:28px; width:100%;" type="text" onclick="SJValue();" id="no_surat_jalan" name="no_surat_jalan" placeholder="No Surat Jalan" required validate/></td>';
			penjualan_value_2 += '</tr>';

			$.each(data.data, function(i2, item2) {
				jQuery.ajax({
					type: 'POST',
					url: ""+BASE_API+"/get-surat-jalan-detail",
					dataType: 'JSON',
					data: {
						penjualan_detail_performa_id : item2.penjualan_detail_performa_id
					},
					beforeSend: function() {
					},
					success: function(data) {
						var stock_item = 0;
						var jumlah_pesanan = 0;

						$.each(data.data, function(stok_detail_qty, item_stok_detail) {
							stock_item += item_stok_detail.jumlah_kirim;
						});

						$.each(data.data_sj, function(stok_detail_qty_2, item_stok_detail_2) {
							jumlah_pesanan += item_stok_detail_2.penjualan_qty;
						});
						var total_fix = parseInt(jumlah_pesanan)-parseInt(stock_item);
						console.log(parseInt(jumlah_pesanan)-parseInt(stock_item));
						$('#jumlah_stok_item_'+item2.penjualan_detail_performa_id+'').html(total_fix);
						$('#kirim_stok_item_'+item2.penjualan_detail_performa_id+'').html(stock_item);
						$('#total_stok_item_'+item2.penjualan_detail_performa_id+'').html(jumlah_pesanan);

					},
					error: function(xmlhttprequest, textstatus, message) {
					}
				});

				penjualan_value += '<tr>';
				penjualan_value += '<td width="28%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">'+item2.penjualan_jenis+'</td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="total_stok_item_'+item2.penjualan_detail_performa_id+'" ></td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="kirim_stok_item_'+item2.penjualan_detail_performa_id+'" ></td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="jumlah_stok_item_'+item2.penjualan_detail_performa_id+'" ></td>';
				penjualan_value += '<td width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="width:100%; height:28px;" type="number" class="jumlah_item_sj" id="jumlah_'+i2+'" name="jumlah_'+i2+'" placeholder="Jumlah" value="0" onclick="SJEmptyValue('+i2+');" required validate/><input  type="hidden" id="kode_'+i2+'" value="'+item2.penjualan_detail_performa_id+'" name="kode_'+i2+'" /></td>';
				penjualan_value += '</tr>'


			});


			$$('#detail_surat_jalan').html(penjualan_value);
			$$('#detail_surat_jalan2').html(penjualan_value_2);
		},
		error: function(xmlhttprequest, textstatus, message) {
		}
	});
}

var delayTimer;
function doSearchByPerusahaanSuratJalan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function() {
		getHeaderPenjualanKunjungan(1);
	}, 200); 
}

function getHeaderPenjualanKunjungan(page) {

	if(page == '' || page == null){
		var page_now = 1;
	}else{
		var page_now = page;
	}

	if(jQuery('#range-penjualan').val() == '' || jQuery('#range-penjualan').val() == null){
		var startdate = "empty";
		var enddate = "empty";
	}else{
		var startdate_new = new Date(calendarRangePenjualan.value[0]);
		var enddate_new = new Date(calendarRangePenjualan.value[1]);
		var startdate = moment(startdate_new).format('YYYY-MM-DD');
		var enddate = moment(enddate_new).format('YYYY-MM-DD');
	}
	if(jQuery('#perusahaan_penjualan_filter').val() == '' || jQuery('#perusahaan_penjualan_filter').val() == null){
		perusahaan_penjualan_value = "empty";
	}else{
		perusahaan_penjualan_value = jQuery('#perusahaan_penjualan_filter').val();
	}
	var penjualan_value="";
	var pagination_button ="";


	jQuery.ajax({
		type: 'POST',
		url: ""+BASE_API+"/get-surat-jalan?page="+page_now+"",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			startdate : startdate,
			enddate : enddate,
			perusahaan_penjualan_value : perusahaan_penjualan_value
		},
		beforeSend: function() {
		},
		success: function(data) {
			var nota2 = '';
			var nota = '';
			app.dialog.close();
			no = 1;
			for (i = 0; i < data.data.last_page; i++) {
				no = i+1;
				pagination_button += '<i onclick="getHeaderPenjualanKunjungan('+no+');"  style="border-radius:2px; width:40px; height:40px; background-color:#4c5269; padding-left:8px; padding-right:8px; margin:2px;">'+no+'</i>';
			}


			$.each(data.data.data, function(i2, item2) {
				penjualan_value += '<tr>';
				penjualan_value += '<td  style=" border-bottom:1px solid gray; border-left:1px solid gray;"  class="label-cell"  ><center><font style="color:white;" class="text-add-colour-black-soft"  >'+moment(item2.penjualan_tanggal).format('DDMMYY')+'-'+item2.penjualan_id.replace(/\INV_/g,'').replace(/^0+/, '')+'</font></center></td>';						
				penjualan_value += '<td align="left" onclick="detailPenjualanTolltip(\''+item2.penjualan_id+'\');"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >'+item2.client_nama+',PT<br><div class="detail_sales_data_tooltip_'+item2.penjualan_id+'"></div>';
				penjualan_value += '</td>';
				penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
				penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".surat-jalan" onclick="getSuratJalanDetail(\''+item2.penjualan_id+'\',\''+item2.penjualan_total_qty+'\');">S.Jalan</button>';
				penjualan_value += '</td>';
				penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
				penjualan_value += '  <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".retur" onclick="retur(\''+item2.kode_retur1+'\',\''+item2.tgl_retur1+'\',\''+item2.penerima1+'\',\''+item2.keterangan1+'\',\''+item2.retur1+'\',\''+item2.kode_retur2+'\',\''+item2.tgl_retur2+'\',\''+item2.penerima2+'\',\''+item2.keterangan2+'\',\''+item2.retur2+'\',\''+item2.kode_retur3+'\',\''+item2.tgl_retur3+'\',\''+item2.penerima3+'\',\''+item2.keterangan3+'\',\''+item2.retur3+'\',\''+item2.kode_retur4+'\',\''+item2.tgl_retur4+'\',\''+item2.penerima4+'\',\''+item2.keterangan4+'\',\''+item2.retur4+'\',\''+item2.kode_retur5+'\',\''+item2.tgl_retur5+'\',\''+item2.penerima5+'\',\''+item2.keterangan5+'\',\''+item2.retur5+'\',\''+item2.kode_retur6+'\',\''+item2.tgl_retur6+'\',\''+item2.penerima6+'\',\''+item2.keterangan6+'\',\''+item2.retur6+'\',\''+item2.kode_retur7+'\',\''+item2.tgl_retur7+'\',\''+item2.penerima7+'\',\''+item2.keterangan7+'\',\''+item2.retur7+'\',\''+item2.kode_retur8+'\',\''+item2.tgl_retur8+'\',\''+item2.penerima8+'\',\''+item2.keterangan8+'\',\''+item2.retur8+'\',\''+item2.kode_retur9+'\',\''+item2.tgl_retur9+'\',\''+item2.penerima9+'\',\''+item2.keterangan9+'\',\''+item2.retur9+'\',\''+item2.kode_retur10+'\',\''+item2.tgl_retur10+'\',\''+item2.penerima10+'\',\''+item2.keterangan10+'\',\''+item2.retur10+'\',\''+item2.client_id+'\',\''+item2.penjualan_jenis+'\');">Retur</button>';
				penjualan_value += '</td>';
				penjualan_value += '</tr>';
			});


			$$('#penjualan_value').html(penjualan_value);
			$$('#pagination_button').html(pagination_button);
			$$('#current_page').html(data.data.current_page);
			$$('#from_data').html(data.data.from);
			$$('#to_data').html(data.data.to);
			$$('#total_data').html(data.data.total);
			$.each(data.data_teratas, function(i3, item3) {
				$$(".tr_"+item3.penjualan_id+"").remove();
			});



		},
		error: function(xmlhttprequest, textstatus, message) {
		}
	});
}




