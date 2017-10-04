var nodes = [];
var topics = [];

function call_getnodes(msg, callback) {
	$.getJSON("/getnodes", function(data) {
		displayMessage(data);
		callback(data);
	});
}

function call_gettopics(msg, callback) {
	$.getJSON("/gettopics", function(data) {
		displayMessage(data);
		callback(data);
	});
}

function call_getcurrentdata(msg, callback) {
	$.getJSON("/getcurrentdata", function(data) {
		displayMessage(data);
		callback(data);
	});
}

function load_data(obj) {
	for ( var i = 0; i < obj.result.length; i++) {
		var r = obj.result[i];
		//if (r.node == 1 && r.topic == 1) {
		//	alert(nodes[r.node]);
		//	$('#entrance-temperature').text(r.payload + '°C');
		//	$('#entrance-updated').text(r.updated.replace("T", " ").replace(".000Z", ""));
		//}
		var txt = r.payload;
		if (r.topic == 1)
			txt = txt + '°C';
		if (r.topic == 2 || r.topic == 5)
			if (r.payload == 1)
				txt = 'ON';
			else if (r.payload == 0)
				txt = 'OFF';
		if (r.topic == 4)
			txt = txt + 'V';
		$(".node-" + r.node + " .topic-" + r.topic).text(txt);

		var d = new Date(r.updated);

		var diff = ((new Date()).getTime() - d.getTime()) / 1000;
		diff /= 60;
		var diffMins = Math.abs(Math.round(diff));

		d.setHours(d.getHours() + 3);
		var jqelem = $(".node-" + r.node + " .node-updated");
		jqelem.text(d.toISOString().replace("T", " ").replace(".000Z",
				""));

		if (diffMins < 10)
			jqelem.removeClass('mdl-color-text--red-500').addClass(
					'mdl-color-text--light-green-500');
		else
			jqelem.removeClass('mdl-color-text--light-green-500')
					.addClass('mdl-color-text--red-500');
	}
}

function displayMessage(msg) {
	//var timestamp = Math.round((new Date()).getTime() / 1000);
	//var timestamp = new Date().toJSON();
	//$('#message').html(timestamp + ":" + msg);
	$('#message').html(msg);
}

function loadAll() {
	call_getnodes({}, function(obj) {
		for ( var i = 0; i < obj.result.length; i++) {
			var r = obj.result[i];
			nodes[r.id_node] = r.node_name;
			$(".node-" + r.id_node + " .node-name").text(r.node_name);
		}
	});

	call_gettopics({}, function(obj) {
		for ( var i = 0; i < obj.result.length; i++) {
			var r = obj.result[i];
			topics[r.id_topic] = r.topic_name;
		}
	});

	call_getcurrentdata({}, function(obj) {
		load_data(obj);
	});
}