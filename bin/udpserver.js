var pool = require('./mysql-connect');
var udp = require('dgram');

module.exports = function(io) {
	/** 
	 * Creating a udp server
	*/

	// creating a udp server
	var udpserver = udp.createSocket('udp4');

	// emits when any error occurs
	udpserver.on('error',function(error){
		console.log('UDP Server error: ' + error);
	//  udpserver.close();
	});

	// emits on new datagram msg
	udpserver.on('message',function(msg,info){
	//  console.log('UDP data received from client : ' + msg.toString());
	//  console.log('UDP received %d bytes from %s:%d\n',msg.length, info.address, info.port);
		
		if (msg.length == 0)
			return;
		
		var regexp = /^{"from_node":([^,]+),"to_node":([^,]+),"topic":([^,]+),"payload":([^,]+),"payload_type":([^,]+)}([^{]*)$/;
		var matches_array = msg.toString().match(regexp);

		if (matches_array != null) {
			pool.getConnection(function(err,connection){
						if (err) {
							return;
						}
						
						var mysqlquery = "INSERT INTO s_current_data (node, topic, payload, payload_type, updated) VALUES ('" 
							+ matches_array[1] + "','" + matches_array[3] + "','" + matches_array[4] + "','" + matches_array[5] + "',now()) ON DUPLICATE KEY UPDATE payload=VALUES(payload),updated=now()";
						
				connection.query(mysqlquery, function(err,rows){
								connection.release();
								if(!err) {
									//All OK
	//	            	console.log("Success!");
	//	          	  	console.log(matches_array);
									var d = new Date();
									var datestring = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
											+ " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
									var row = {
							node : matches_array[1],
							topic : matches_array[3],
							payload : matches_array[4],
							payload_type : matches_array[5],
							updated : datestring
						};
									io.emit('do-sensor-data-update-all', { result: [row] });
								}
					else {
									console.log("UDP Server data could not be inserted! Query:" + mysqlquery);
					}
						});
				});	
			
			
		}
	});

	//emits when socket is ready and listening for datagram msgs
	udpserver.on('listening',function(){
		var address = udpserver.address();
		var port = address.port;
		var family = address.family;
		var ipaddr = address.address;
		console.log('UDP Server is listening at port' + port);
		console.log('UDP Server ip :' + ipaddr);
		console.log('UDP Server is IP4/IP6 : ' + family);
	});

	udpserver.bind(54345);
};
