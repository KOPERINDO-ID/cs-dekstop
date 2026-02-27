
// allow user rotate
screen.orientation.unlock();

// access current orientation


document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {


}

function htmlToImage() {
  window.canvas2ImagePlugin.saveImageDataToLibrary(
    function (msg) {
      alert(msg);
    },
    function (err) {
      alert(err)
    },
    document.getElementById("myCanvas"),
    "jpeg" // format is optional, defaults to 'png'
  );
}






function changeDateDashboard() {
  getDashboardBlockOrder();
  getDashboardPenjualan();
  getFee();
}

function getDashboardBlockOrder() {

  if (jQuery("#bulan_block_order").val() == 0 || jQuery("#bulan_block_order").val() == null) {
    var month_now = moment().format('M');
  } else {
    var month_now = jQuery("#bulan_block_order").val();
  }

  $$('#bulan_block_order option[value="' + month_now + '"]').prop('selected', true);

  jQuery.ajax({
    type: 'POST',
    url: "" + BASE_API + "/get-dashboard-block-order-manager",
    dataType: 'JSON',
    data: {
      karyawan_id: jQuery('#sales_id').val(),
      bulan_block_order: month_now
    },
    beforeSend: function () {
    },
    success: function (data) {


      var add_empty_column = 0;
      if (moment(data.tahun_block_order + '-' + data.bulan_block_order).startOf('month').format('dddd') == "Saturday") {
        add_empty_column = 5;
      } else if (moment(data.tahun_block_order + '-' + data.bulan_block_order).startOf('month').format('dddd') == "Sunday") {
        add_empty_column = 6;
      } else if (moment(data.tahun_block_order + '-' + data.bulan_block_order).startOf('month').format('dddd') == "Friday") {
        add_empty_column = 4;
      } else if (moment(data.tahun_block_order + '-' + data.bulan_block_order).startOf('month').format('dddd') == "Thursday") {
        add_empty_column = 3;
      } else if (moment(data.tahun_block_order + '-' + data.bulan_block_order).startOf('month').format('dddd') == "Wednesday") {
        add_empty_column = 2;
      } else if (moment(data.tahun_block_order + '-' + data.bulan_block_order).startOf('month').format('dddd') == "Tuesday") {
        add_empty_column = 1;
      } else if (moment(data.tahun_block_order + '-' + data.bulan_block_order).startOf('month').format('dddd') == "Monday") {
        add_empty_column = 0;
      }

      var date_end = moment(data.tahun_block_order + '-' + data.bulan_block_order).endOf('month').format('D');

      app.dialog.close();
      var red = "table-color-red";
      var orange = "table-color-orange";
      var green = "table-color-green";
      var yellow = "table-color-yellow";
      var tittleDays = '';
      //week  1
      var count_days = 0;
      var week1color = '';
      var week1value = '';
      for (var i0 = 0; i0 < 7; i0++) {
        count_days = i0 + 1;
        if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('YYYY-MMMM-DD') == moment().format('YYYY-MMMM-DD')) {
          //   var warna_hari_ini = "color:white;  border:4px solid white; padding:1px;";
          var warna_hari_ini = "";
        } else {
          var warna_hari_ini = " padding:4px;";
        }

        if (i0 <= add_empty_column) {
          week1value += '<td style="' + warna_hari_ini + ' "  class="numeric-cell  text-bold text-align-center"></td>';
        } else {
          if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('dddd') == 'Sunday') {
            week1color = red;
          } else {
            if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 299) {
              week1color = red;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 199) {
              week1color = orange;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 99) {
              week1color = yellow;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 0) {
              week1color = green;
            }
          }
          week1value += '<td style="' + warna_hari_ini + '"  class="numeric-cell ' + week1color + ' text-bold text-align-center">' + ((count_days - 1) - add_empty_column) + '</td>';
        }
      }
      jQuery("#week_1").html(week1value);


      var week2color = '';
      var week2value = '';
      for (var i02 = 7; i02 < 14; i02++) {
        count_days = i02 + 1;
        if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('YYYY-MMMM-DD') == moment().format('YYYY-MMMM-DD')) {
          var warna_hari_ini = "";
        } else {
          var warna_hari_ini = " padding:4px;";
        }
        if (i02 <= add_empty_column) {
          week2value += '<td style="' + warna_hari_ini + '"  class="numeric-cell  text-bold text-align-center"></td>';
        } else {
          var count_day_number = (count_days - 1) - add_empty_column;
          if ((count_days - 1) - add_empty_column > 9) {
            var tanggal_fix = count_day_number;
          } else {
            var tanggal_fix = '0' + count_day_number;
          }
          if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + tanggal_fix).format('dddd') == 'Sunday') {
            week2color = red;
          } else {
            if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 299) {
              week2color = red;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 199) {
              week2color = orange;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 99) {
              week2color = yellow;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 0) {
              week2color = green;
            }
          }
          week2value += '<td style="' + warna_hari_ini + '"  class="numeric-cell ' + week2color + ' text-bold text-align-center">' + ((count_days - 1) - add_empty_column) + '</td>';

        }
      }
      jQuery("#week_2").html(week2value);

      var week3color = '';
      var week3value = '';
      for (var i03 = 14; i03 < 21; i03++) {

        count_days = i03 + 1;
        if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('YYYY-MMMM-DD') == moment().format('YYYY-MMMM-DD')) {
          var warna_hari_ini = "color:black;  border:10px solid #8992b3;";
          var warna_hari_ini = "color:white;  border:4px solid white; padding:1px;";
        } else {
          var warna_hari_ini = " padding:4px;";
        }
        if (i03 <= add_empty_column) {
          week3value += '<td style="' + warna_hari_ini + '"  class="numeric-cell  text-bold text-align-center"></td>';
        } else {

          var count_day_number = (count_days - 1) - add_empty_column;
          if ((count_days - 1) - add_empty_column > 9) {
            var tanggal_fix = count_day_number;
          } else {
            var tanggal_fix = '0' + count_day_number;
          }

          if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + tanggal_fix).format('dddd') == 'Sunday') {
            week3color = red;
          } else {
            if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 299) {
              week3color = red;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 199) {
              week3color = orange;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 99) {
              week3color = yellow;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 0) {
              week3color = green;
            }
          }
          week3value += '<td style="' + warna_hari_ini + '"  class="numeric-cell ' + week3color + ' text-bold text-align-center">' + ((count_days - 1) - add_empty_column) + '</td>';
        }
      }
      jQuery("#week_3").html(week3value);


      var week4color = '';
      var week4value = '';
      for (var i04 = 21; i04 < 28; i04++) {
        count_days = i04 + 1;
        if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('YYYY-MMMM-DD') == moment().format('YYYY-MMMM-DD')) {
          var warna_hari_ini = "color:white;  border:4px solid white; padding:1px;";
        } else {
          var warna_hari_ini = " padding:4px;";
        }
        if (i04 <= add_empty_column) {
          week4value += '<td style="' + warna_hari_ini + '"  class="numeric-cell  text-bold text-align-center"></td>';
        } else {
          if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('dddd') == 'Sunday') {
            week4color = red;
          } else {
            if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 299) {
              week4color = red;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 199) {
              week4color = orange;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 99) {
              week4color = yellow;
            } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 0) {
              week4color = green;
            }
          }
          week4value += '<td style="' + warna_hari_ini + '"  class="numeric-cell ' + week4color + ' text-bold text-align-center">' + ((count_days - 1) - add_empty_column) + '</td>';
        }
      }
      jQuery("#week_4").html(week4value);


      var week5color = '';
      var week5value = '';
      for (var i05 = 28; i05 < 35; i05++) {
        count_days = i05 + 1;
        if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('YYYY-MMMM-DD') == moment().format('YYYY-MMMM-DD')) {
          var warna_hari_ini = "color:white;  border:4px solid white; padding:1px;";
        } else {
          var warna_hari_ini = " padding:4px;";
        }
        if (i05 <= add_empty_column) {
          week5value += '<td style="' + warna_hari_ini + '"  class="numeric-cell  text-bold text-align-center"></td>';
        } else {
          if (((count_days - 1) - add_empty_column) <= date_end) {
            if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('dddd') == 'Sunday') {
              week5color = red;
            } else {
              if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 299) {
                week5color = red;
              } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 199) {
                week5color = orange;
              } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 99) {
                week5color = yellow;
              } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 0) {
                week5color = green;
              }
            }
            week5value += '<td style="' + warna_hari_ini + '"  class="numeric-cell ' + week5color + ' text-bold text-align-center">' + ((count_days - 1) - add_empty_column) + '</td>';
          }
        }
      }
      jQuery("#week_5").html(week5value);


      var week6color = '';
      var week6value = '';
      for (var i06 = 35; i06 < 42; i06++) {
        count_days = i06 + 1;
        if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('YYYY-MMMM-DD') == moment().format('YYYY-MMMM-DD')) {
          var warna_hari_ini = "color:white;  border:4px solid white; padding:1px;";
        } else {
          var warna_hari_ini = " padding:4px;";
        }
        if (i06 <= add_empty_column) {
          week6value += '<td style="' + warna_hari_ini + '"  class="numeric-cell  text-bold text-align-center"></td>';
        } else {
          if (((count_days - 1) - add_empty_column) <= date_end) {
            if (moment(data.tahun_block_order + '-' + data.bulan_block_order + '-' + ((count_days - 1) - add_empty_column)).format('dddd') == 'Sunday') {
              week6color = red;
            } else {
              if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 299) {
                week6color = red;
              } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 199) {
                week6color = orange;
              } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 99) {
                week6color = yellow;
              } else if (data.data[0]['tgl' + ((count_days - 1) - add_empty_column)] >= 0) {
                week6color = green;
              }
            }
            week6value += '<td style="' + warna_hari_ini + '"  class="numeric-cell ' + week6color + ' text-bold text-align-center">' + ((count_days - 1) - add_empty_column) + '</td>';
          }
        }

      }
      jQuery("#week_6").html(week6value);



    },
    error: function (xmlhttprequest, textstatus, message) { }
  });
}

function getDashboardPenjualan() {
  // if (jQuery("#bulan_block_order").val() == 0 || jQuery("#bulan_block_order").val() == null) {
  // var month_now = moment().format('M');
  // } else {
  //   var month_now = jQuery("#bulan_block_order").val();
  // }
  // jQuery.ajax({
  //   type: 'POST',
  //   url: "" + BASE_API + "/get-dashboard-penjualan-manager",
  //   dataType: 'JSON',
  //   data: {
  //     karyawan_id: jQuery('#sales_id').val(),,
  //     month_now:month_now
  //   },
  //   beforeSend: function () {
  //   },
  //   success: function (data) {

  //     var days = daysInThisMonth();
  //     var lengthDays = [];
  //     var lengthValues = [];
  //     var labelValues = [];
  //     for (var i = 0; i < days; i++) {
  //       var tgl = i + 1;
  //       lengthDays.push(i + 1);
  //       if (i + 1 != days) {
  //         lengthValues.push(data.data[0]['tgl' + tgl + '']);
  //         labelValues.push(tgl);
  //       } else {
  //         lengthValues.push(0);
  //         labelValues.push(tgl);
  //       }
  //     }


  //     var ctx = document.getElementById('chart-statistik-performa').getContext('2d');
  //     var chart = new Chart(ctx, {
  //       type: 'line',
  //       data: {
  //         labels: labelValues,
  //         datasets: [{
  //           label: 'Tanggal : ',
  //           borderColor: 'white',
  //           data: lengthValues,
  //           pointHitRadius: 5,
  //           borderWidth: 2,
  //           pointRadius: 4,
  //           pointBorderWidth: 0,
  //           pointBackgroundColor: '#000080',
  //         }]
  //       },
  //       options: {
  //         legend: {
  //           display: false
  //         },
  //         elements: {
  //           line: {
  //             tension: 0 // disables bezier curves
  //           }
  //         },
  //         responsive: false,
  //         tooltips: {
  //           callbacks: {
  //             label: function (tooltipItem) {
  //               return number_format(tooltipItem.yLabel);
  //             }
  //           }
  //         },
  //         scales: {
  //           yAxes: [{
  //             ticks: {
  //               beginAtZero: true,
  //               userCallback: function (value, index, values) {
  //                 return abbreviateNumber(value);
  //               },
  //             },
  //           }],
  //           xAxes: [{
  //             ticks: {
  //             },
  //           }]
  //         }
  //       }
  //     });
  //   },
  //   error: function (xmlhttprequest, textstatus, message) {
  //   }
  // });
}



function getDashboardProspekLine() {
  jQuery.ajax({
    type: 'POST',
    url: "" + BASE_API + "/get-dashboard-prospek-line-manager",
    dataType: 'JSON',
    data: {
      karyawan_id: jQuery("#sales_id").val()
    },
    beforeSend: function () {
    },
    success: function (data) {
      var keterangan_prospek = "";
      var prospek_line = "";
      if (data.data[0] == '' || data.data[0] == null) {
        jQuery("#last_performa").html('Tidak Ada Propsek');
      } else {
        $.each(data.data, function (val, item) {

          if (item.hasil_komunikasi != null) {
            keterangan_prospek = item.hasil_komunikasi;
          }

          if (item.hasil_pertemuan1 != null) {
            keterangan_prospek = item.hasil_pertemuan1;
          }

          if (item.hasil_pertemuan2 != null) {
            keterangan_prospek = item.hasil_pertemuan2;
          }

          if (item.hasil_pertemuan3 != null) {
            keterangan_prospek = item.hasil_pertemuan3;
          }

          prospek_line += moment(item.tanggal_janjian).format('DD/MM/YYYY') + ", " + item.client_nama + ", Ket : " + keterangan_prospek + "&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;";
        });

        jQuery("#last_performa").html(prospek_line);
      }
    },
    error: function (xmlhttprequest, textstatus, message) {
    }
  });
}

function getDashboardProspek() {
  jQuery.ajax({
    type: 'POST',
    url: "" + BASE_API + "/get-dashboard-prospek-manager",
    dataType: 'JSON',
    data: {
      karyawan_id: jQuery("#sales_id").val()
    },
    beforeSend: function () {
    },
    success: function (data) {
      if (data.data[0] !== undefined) {
        var prospek_dashboard1 = '';
        var keterangan_dashboardProspek = '';
        var keterangan_dashboardProspek2 = '';
        var keterangan_dashboardProspek3 = '';
        var keterangan_dashboardProspek4 = '';
        var keterangan_dashboardProspek5 = '';
        var keterangan_dashboardProspek6 = '';
        var keterangan_dashboardProspek7 = '';
        var keterangan_dashboardProspek8 = '';
        var keterangan_dashboardProspek9 = '';
        var keterangan_dashboardProspek10 = '';
        var keterangan_dashboardProspek11 = '';
        prospek_dashboard1 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard1 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard1 += '' + moment(data.data[0].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[0].client_nama + '';
        prospek_dashboard1 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_1"  onclick="more_open(1);"> Minimalkan';
        prospek_dashboard1 += ' </i>';
        prospek_dashboard1 += ' <i style="margin-right:6px; float:right;" id="more_close_1" onclick="more_close(1);"> Selengkapnya';
        prospek_dashboard1 += ' </i>';
        if (data.data[0].hasil_komunikasi != null) {
          keterangan_dashboardProspek = data.data[0].hasil_komunikasi;
        }

        if (data.data[0].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek = data.data[0].hasil_pertemuan1;
        }

        if (data.data[0].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek = data.data[0].hasil_pertemuan2;
        }

        if (data.data[0].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek = data.data[0].hasil_pertemuan3;
        }



        prospek_dashboard1 += ' <div  id="detail_prospek_1" style="display:none;">' + keterangan_dashboardProspek + '';

        prospek_dashboard1 += ' </div>';
        prospek_dashboard1 += ' </div>';
        prospek_dashboard1 += '</div>';

        jQuery("#prospek_dashboard1").html(prospek_dashboard1);
      }

      if (data.data[1] !== undefined) {

        if (data.data[1].hasil_komunikasi != null) {
          keterangan_dashboardProspek2 = data.data[1].hasil_komunikasi;
        }

        if (data.data[1].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek2 = data.data[1].hasil_pertemuan1;
        }

        if (data.data[1].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek2 = data.data[1].hasil_pertemuan2;
        }

        if (data.data[1].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek2 = data.data[1].hasil_pertemuan3;
        }

        var prospek_dashboard2 = '';
        prospek_dashboard2 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard2 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard2 += '' + moment(data.data[1].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[1].client_nama + '';
        prospek_dashboard2 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_2"  onclick="more_open(2);"> Minimalkan';
        prospek_dashboard2 += ' </i>';
        prospek_dashboard2 += ' <i style="margin-right:6px; float:right;" id="more_close_2" onclick="more_close(2);"> Selengkapnya';
        prospek_dashboard2 += ' </i>';
        prospek_dashboard2 += ' <div  id="detail_prospek_2" style="display:none;">' + keterangan_dashboardProspek2 + '';
        prospek_dashboard2 += ' </div>';
        prospek_dashboard2 += ' </div>';
        prospek_dashboard2 += '</div>';

        jQuery("#prospek_dashboard2").html(prospek_dashboard2);
      }

      if (data.data[2] !== undefined) {


        if (data.data[2].hasil_komunikasi != null) {
          keterangan_dashboardProspek3 = data.data[2].hasil_komunikasi;
        }

        if (data.data[2].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek3 = data.data[2].hasil_pertemuan1;
        }

        if (data.data[2].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek3 = data.data[2].hasil_pertemuan2;
        }

        if (data.data[2].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek3 = data.data[2].hasil_pertemuan3;
        }

        var prospek_dashboard3 = '';
        prospek_dashboard3 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard3 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard3 += '' + moment(data.data[2].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[2].client_nama + '';
        prospek_dashboard3 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_3"  onclick="more_open(3);"> Minimalkan';
        prospek_dashboard3 += ' </i>';
        prospek_dashboard3 += ' <i style="margin-right:6px; float:right;" id="more_close_3" onclick="more_close(3);"> Selengkapnya';
        prospek_dashboard3 += ' </i>';
        prospek_dashboard3 += ' <div  id="detail_prospek_3" style="display:none;">' + keterangan_dashboardProspek3 + '';
        prospek_dashboard3 += ' </div>';
        prospek_dashboard3 += ' </div>';
        prospek_dashboard3 += '</div>';

        jQuery("#prospek_dashboard3").html(prospek_dashboard3);
      }

      if (data.data[3] !== undefined) {
        if (data.data[3].hasil_komunikasi != null) {
          keterangan_dashboardProspek4 = data.data[3].hasil_komunikasi;
        }

        if (data.data[3].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek4 = data.data[3].hasil_pertemuan1;
        }

        if (data.data[3].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek4 = data.data[3].hasil_pertemuan2;
        }

        if (data.data[3].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek4 = data.data[3].hasil_pertemuan3;
        }

        var prospek_dashboard4 = '';
        prospek_dashboard4 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard4 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard4 += '' + moment(data.data[3].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[3].client_nama + '';
        prospek_dashboard4 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_4"  onclick="more_open(4);"> Minimalkan';
        prospek_dashboard4 += ' </i>';
        prospek_dashboard4 += ' <i style="margin-right:6px; float:right;" id="more_close_4" onclick="more_close(4);"> Selengkapnya';
        prospek_dashboard4 += ' </i>';
        prospek_dashboard4 += ' <div  id="detail_prospek_4" style="display:none;">' + keterangan_dashboardProspek4 + '';
        prospek_dashboard4 += ' </div>';
        prospek_dashboard4 += ' </div>';
        prospek_dashboard4 += '</div>';

        jQuery("#prospek_dashboard4").html(prospek_dashboard4);
      }

      if (data.data[4] !== undefined) {
        if (data.data[4].hasil_komunikasi != null) {
          keterangan_dashboardProspek5 = data.data[4].hasil_komunikasi;
        }

        if (data.data[4].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek5 = data.data[4].hasil_pertemuan1;
        }

        if (data.data[4].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek5 = data.data[4].hasil_pertemuan2;
        }

        if (data.data[4].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek5 = data.data[4].hasil_pertemuan3;
        }

        var prospek_dashboard5 = '';
        prospek_dashboard5 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard5 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard5 += '' + moment(data.data[4].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[4].client_nama + '';
        prospek_dashboard5 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_5"  onclick="more_open(5);"> Minimalkan';
        prospek_dashboard5 += ' </i>';
        prospek_dashboard5 += ' <i style="margin-right:6px; float:right;" id="more_close_5" onclick="more_close(5);"> Selengkapnya';
        prospek_dashboard5 += ' </i>';
        prospek_dashboard5 += ' <div  id="detail_prospek_5" style="display:none;">' + keterangan_dashboardProspek5 + '';
        prospek_dashboard5 += ' </div>';
        prospek_dashboard5 += ' </div>';
        prospek_dashboard5 += '</div>';

        jQuery("#prospek_dashboard5").html(prospek_dashboard5);
      }

      if (data.data[5] !== undefined) {
        if (data.data[5].hasil_komunikasi != null) {
          keterangan_dashboardProspek6 = data.data[5].hasil_komunikasi;
        }

        if (data.data[5].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek6 = data.data[5].hasil_pertemuan1;
        }

        if (data.data[5].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek6 = data.data[5].hasil_pertemuan2;
        }

        if (data.data[5].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek6 = data.data[5].hasil_pertemuan3;
        }

        var prospek_dashboard6 = '';
        prospek_dashboard6 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard6 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard6 += '' + moment(data.data[5].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[5].client_nama + '';
        prospek_dashboard6 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_6"  onclick="more_open(6);"> Minimalkan';
        prospek_dashboard6 += ' </i>';
        prospek_dashboard6 += ' <i style="margin-right:6px; float:right;" id="more_close_6" onclick="more_close(6);"> Selengkapnya';
        prospek_dashboard6 += ' </i>';
        prospek_dashboard6 += ' <div  id="detail_prospek_6" style="display:none;">' + keterangan_dashboardProspek6 + '';
        prospek_dashboard6 += ' </div>';
        prospek_dashboard6 += ' </div>';
        prospek_dashboard6 += '</div>';

        jQuery("#prospek_dashboard6").html(prospek_dashboard6);
      }

      if (data.data[6] !== undefined) {
        if (data.data[6].hasil_komunikasi != null) {
          keterangan_dashboardProspek7 = data.data[6].hasil_komunikasi;
        }

        if (data.data[6].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek7 = data.data[6].hasil_pertemuan1;
        }

        if (data.data[6].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek7 = data.data[6].hasil_pertemuan2;
        }

        if (data.data[6].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek7 = data.data[6].hasil_pertemuan3;
        }

        var prospek_dashboard7 = '';
        prospek_dashboard7 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard7 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard7 += '' + moment(data.data[6].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[6].client_nama + '';
        prospek_dashboard7 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_7"  onclick="more_open(7);"> Minimalkan';
        prospek_dashboard7 += ' </i>';
        prospek_dashboard7 += ' <i style="margin-right:6px; float:right;" id="more_close_7" onclick="more_close(7);"> Selengkapnya';
        prospek_dashboard7 += ' </i>';
        prospek_dashboard7 += ' <div  id="detail_prospek_7" style="display:none;">' + keterangan_dashboardProspek7 + '';
        prospek_dashboard7 += ' </div>';
        prospek_dashboard7 += ' </div>';
        prospek_dashboard7 += '</div>';

        jQuery("#prospek_dashboard7").html(prospek_dashboard7);
      }



      if (data.data[7] !== undefined) {
        if (data.data[7].hasil_komunikasi != null) {
          keterangan_dashboardProspek8 = data.data[7].hasil_komunikasi;
        }

        if (data.data[7].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek8 = data.data[7].hasil_pertemuan1;
        }

        if (data.data[7].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek8 = data.data[7].hasil_pertemuan2;
        }

        if (data.data[7].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek8 = data.data[7].hasil_pertemuan3;
        }

        var prospek_dashboard8 = '';
        prospek_dashboard8 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard8 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard8 += '' + moment(data.data[7].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[7].client_nama + '';
        prospek_dashboard8 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_8"  onclick="more_open(8);"> Minimalkan';
        prospek_dashboard8 += ' </i>';
        prospek_dashboard8 += ' <i style="margin-right:6px; float:right;" id="more_close_8" onclick="more_close(8);"> Selengkapnya';
        prospek_dashboard8 += ' </i>';
        prospek_dashboard8 += ' <div  id="detail_prospek_8" style="display:none;">' + keterangan_dashboardProspek8 + '';
        prospek_dashboard8 += ' </div>';
        prospek_dashboard8 += ' </div>';
        prospek_dashboard8 += '</div>';

        jQuery("#prospek_dashboard8").html(prospek_dashboard8);
      }


      if (data.data[8] !== undefined) {
        if (data.data[8].hasil_komunikasi != null) {
          keterangan_dashboardProspek9 = data.data[8].hasil_komunikasi;
        }

        if (data.data[8].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek9 = data.data[8].hasil_pertemuan1;
        }

        if (data.data[8].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek9 = data.data[8].hasil_pertemuan2;
        }

        if (data.data[8].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek9 = data.data[8].hasil_pertemuan3;
        }

        var prospek_dashboard9 = '';
        prospek_dashboard9 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard9 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard9 += '' + moment(data.data[8].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[8].client_nama + '';
        prospek_dashboard9 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_9"  onclick="more_open(9);"> Minimalkan';
        prospek_dashboard9 += ' </i>';
        prospek_dashboard9 += ' <i style="margin-right:6px; float:right;" id="more_close_9" onclick="more_close(9);"> Selengkapnya';
        prospek_dashboard9 += ' </i>';
        prospek_dashboard9 += ' <div  id="detail_prospek_9" style="display:none;">' + keterangan_dashboardProspek9 + '';
        prospek_dashboard9 += ' </div>';
        prospek_dashboard9 += ' </div>';
        prospek_dashboard9 += '</div>';

        jQuery("#prospek_dashboard9").html(prospek_dashboard9);
      }

      if (data.data[9] !== undefined) {
        if (data.data[9].hasil_komunikasi != null) {
          keterangan_dashboardProspek10 = data.data[9].hasil_komunikasi;
        }

        if (data.data[9].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek10 = data.data[9].hasil_pertemuan1;
        }

        if (data.data[9].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek10 = data.data[9].hasil_pertemuan2;
        }

        if (data.data[9].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek10 = data.data[9].hasil_pertemuan3;
        }

        var prospek_dashboard10 = '';
        prospek_dashboard10 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard10 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard10 += '' + moment(data.data[9].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[9].client_nama + '';
        prospek_dashboard10 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_10"  onclick="more_open(10);"> Minimalkan';
        prospek_dashboard10 += ' </i>';
        prospek_dashboard10 += ' <i style="margin-right:6px; float:right;" id="more_close_10" onclick="more_close(10);"> Selengkapnya';
        prospek_dashboard10 += ' </i>';
        prospek_dashboard10 += ' <div  id="detail_prospek_10" style="display:none;">' + keterangan_dashboardProspek10 + '';
        prospek_dashboard10 += ' </div>';
        prospek_dashboard10 += ' </div>';
        prospek_dashboard10 += '</div>';

        jQuery("#prospek_dashboard10").html(prospek_dashboard10);
      }

      if (data.data[10] !== undefined) {
        if (data.data[10].hasil_komunikasi != null) {
          keterangan_dashboardProspek11 = data.data[10].hasil_komunikasi;
        }

        if (data.data[10].hasil_pertemuan1 != null) {
          keterangan_dashboardProspek11 = data.data[10].hasil_pertemuan1;
        }

        if (data.data[10].hasil_pertemuan2 != null) {
          keterangan_dashboardProspek11 = data.data[10].hasil_pertemuan2;
        }

        if (data.data[10].hasil_pertemuan3 != null) {
          keterangan_dashboardProspek11 = data.data[10].hasil_pertemuan3;
        }

        var prospek_dashboard11 = '';
        prospek_dashboard11 += '<div class="card margin-6"  style="background-color:#8992b3;">';
        prospek_dashboard11 += '<div style="margin-left:6px; padding:2px;">';
        prospek_dashboard11 += '' + moment(data.data[10].tanggal_janjian).format('DD-MMM-YY') + '<br>' + data.data[10].client_nama + '';
        prospek_dashboard11 += ' <i style="display:none; margin-right:6px; float:right;" id="more_open_11"  onclick="more_open(11);"> Minimalkan';
        prospek_dashboard11 += ' </i>';
        prospek_dashboard11 += ' <i style="margin-right:6px; float:right;" id="more_close_11" onclick="more_close(11);"> Selengkapnya';
        prospek_dashboard11 += ' </i>';
        prospek_dashboard11 += ' <div  id="detail_prospek_11" style="display:none;">' + keterangan_dashboardProspek11 + '';
        prospek_dashboard11 += ' </div>';
        prospek_dashboard11 += ' </div>';
        prospek_dashboard11 += '</div>';

        jQuery("#prospek_dashboard11").html(prospek_dashboard11);
      }
    },
    error: function (xmlhttprequest, textstatus, message) {
    }
  });
}



function startTimeMain() {
  var today = new Date();
  var d = today.getDate();
  var mon = today.getMonth();
  var y = today.getFullYear();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  m = checkTimeMain(m);
  s = checkTimeMain(s);
  document.getElementById('clock_view').innerHTML =
    "<b> " + h + ":" + m + ":" + s + "<br> " + d + "/" + month_names_short[mon] + "/" + y + " </b>";
  var t = setTimeout(startTimeMain, 500);
}


function checkTimeMain(i) {
  if (i < 10) { i = "0" + i };
  return i;
}

function more_close(id) {
  $$("#detail_prospek_" + id + "").show();
  $$("#more_close_" + id + "").hide();
  $$("#more_open_" + id + "").show();
}

function more_open(id) {
  $$("#detail_prospek_" + id + "").hide();
  $$("#more_close_" + id + "").show();
  $$("#more_open_" + id + "").hide();
}

function getMenuUser() {
  var jabatan = localStorage.getItem("jabatan");
  var username = localStorage.getItem("username");

  if (jabatan == 'Sales') {
    $$('#menu_sales').show();
    $$('#menu_produksi').hide();
    $$('#menu_surat_jalan').hide();
  } else if (jabatan == 'Produksi') {
    $$('#menu_sales').hide();
    $$('#menu_produksi').show();
    $$('#menu_surat_jalan').hide();
  } else if (jabatan == 'Surat_jalan') {
    $$('#menu_sales').hide();
    $$('#menu_produksi').hide();
    $$('#menu_surat_jalan').show();
  }

  // Apply menu visibility berdasarkan username (CSO vs lainnya)
  if (username === 'CSO') {
    $$('#menuTagihan').show();
    $$('#menuBroadcast').hide();
  } else {
    $$('#menuTagihan').hide();
    $$('#menuBroadcast').show();
  }
}

function showLineGraph() {

}


function showday() {



  const getDaysByMonth = (month) => {
    const daysInMonth = moment(month).daysInMonth();
    return Array.from({ length: daysInMonth }, (v, k) => k + 1)
  };

  let month = '2020-02';
  var dayday = getDaysByMonth(month);



  for (var i = 0; i < 7; i++) {



  }



}