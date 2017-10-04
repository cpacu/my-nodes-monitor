$(function() {
	var socket = io.connect();//io.connect("http://iazului.go.ro:8880/");

	socket.on('do-logs-data-update', function(obj) {
		var newItem = $('<div>' + obj + '</div>');
        $("#logs-container").append(newItem);
	});
});