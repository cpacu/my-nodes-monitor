function getAvg() {
	//Update average as well
	$.getJSON("/getavg", function(data) {
		var txt = data.result;
		txt = txt + '°C';
		$(".node-feelslike .topic-1").text(txt);
	});
}

$(function() {
	var socket = io.connect();//io.connect("http://iazului.go.ro:8880/");

	$("#btn-display-latest-messages").click(function() {
		$("#btn-display-latest-messages").hide();
		$("#latest-messages").show();
	});

	$.getJSON("/getdesiredtemperature", function(data) {
	    $(".desiredtemperature").text(data.desiredtemperature);
	});
	
	loadAll(); // This will run on page load

	socket.on('do-sensor-data-update-all', function(obj) {
		load_data(obj);
	});
	
	getAvg();
	setInterval(getAvg, 5000);

	$(window).on('resize', function() {
		resizeGraphs();
	});
	$(".graph-selector-interval").change(function() {
		resizeGraphs();
	});
	
	$("#tvoff-living").click(function() {
		$.getJSON("/tvoff-living", function(data) {
			displayMessage(data);
		});
	});

	$("#tvoff-bedroom").click(function() {
		$.getJSON("/tvoff-bedroom", function(data) {
			displayMessage(data);
		});
	});
});