var pool = require('./mysql-connect');

module.exports = function(io) {
	//PING TV1 and TV2
	var ping = require('ping');

	var hosts = [{node:'8',ip:'192.168.1.101'}, {node:'9',ip:'192.168.1.102'}];
	function samsung_tv_status() {
		hosts.forEach(function(host){
			ping.sys.probe(host.ip, function(isAlive){
				// var msg = isAlive ? 'host ' + host.ip + ' is alive' : 'host ' + host.ip + ' is dead';
				// console.log(msg);
				
				var payload_to_insert = isAlive ? '1' : '0';
				pool.getConnection(function(err,connection){
					if (err) {
					return;
					}
					
					var mysqlquery = "INSERT INTO s_current_data (node, topic, payload, payload_type, updated) VALUES ('"
						+ host.node + "','5','" + payload_to_insert + "','1',now()) ON DUPLICATE KEY UPDATE payload=VALUES(payload),updated=now()";
					
					connection.query(mysqlquery, function(err,rows){
						connection.release();
						if(!err) {
							var d = new Date();
							var datestring = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
								+ " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
							var row = {
								node : host.node,
								topic : 5,
								payload : payload_to_insert,
								payload_type : 1,
								updated : datestring
							};
							io.emit('do-sensor-data-update-all', { result: [row] });
						}
						else {
							console.log("PING data could not be inserted! Query:" + mysqlquery);
						}
					});
				}); 	
			},{
				timeout: 1
			});
		});
	}
	setInterval(samsung_tv_status, 30000);
};
