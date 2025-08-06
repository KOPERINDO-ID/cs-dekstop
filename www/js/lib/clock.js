	function startTime() {
		var today = new Date();

		var d = today.getDate();
		var mon = today.getMonth()+1;
		var y = today.getFullYear();
		var h = today.getHours();
		var m = today.getMinutes();
		var s = today.getSeconds();
		m = checkTime(m);
		s = checkTime(s);
		document.getElementById('clock_view').innerHTML =
		"<b>Tgl : " + d + "/" + mon + "/" + y + "<br> Jam : " + h + ":" + m + ":" + s + "</b>";
		var t = setTimeout(startTime, 500);
	}
	function checkTime(i) {
	  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	  return i;
	}