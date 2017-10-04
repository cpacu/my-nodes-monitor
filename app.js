var express = require('express');
var path = require('path');
var logger = require('./log');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require( "socket.io" );
var php = require('express-php');
var exec =  require('child_process').exec;
var authentication = require('express-authentication');
var fs = require('fs');
var pool = require('./bin/mysql-connect');

var index_route = require('./routes/index');
var login_route = require('./routes/login');
var graphs_route = require('./routes/graphs');
var logs_route = require('./routes/logs');

var app = express();

// Socket.io
var io           = socket_io();
app.io           = io;

var ping_status = require('./bin/ping-status')(io);
var udpserver = require('./bin/udpserver')(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function myauth(req, res, next) {
    // provide the data that was used to authenticate the request; if this is 
    // not set then no attempt to authenticate is registered. 
    req.challenge = req.get('Authorization');
 
    req.authenticated = req.cookies.API_KEY === 'FA93DDA611E37CCE79849D3229C32'; //secret auth key
 
    // provide the result of the authentication; generally some kind of user 
    // object on success and some kind of error as to why authentication failed 
    // otherwise. 
//    if (req.authenticated) {
//        req.authentication = { user: 'bob' };
//    } else {
//        req.authentication = { error: 'INVALID_API_KEY' };
//    }
 
    // That's it! You're done! 
    next();
});

app.use('/index', authentication.required(), index_route);
//app.use('/users', users_route);
app.use('/login', login_route);
app.use('/graphs', authentication.required(), graphs_route);
app.use('/logs', authentication.required(), logs_route);

app.get('/', function(req, res) {
    res.redirect('/index');
});

app.use(express.static(path.join(__dirname, 'public')));
//app.use(php.cgi('./httpdocs'));
//app.use(express.static('./httpdocs'));

app.post('/login', function(req, res, next) {
	res.clearCookie('API_KEY');
	res.cookie('API_KEY', req.body.inputKey, { expires: new Date(Date.now() + 365*24*60*60*1000) });
	res.redirect('/');
});

//app.get('/secret', authentication.required(), function(req, res) {
//    res.status(200).send('Hello!');
//});

//app.get('/cookies', function(req, res) {
//	res.send(req.cookies.API_KEY);
//});

/*  This is auto initiated event when Client connects to Your Machine.  */
io.on('connection',function(socket){  
    //console.log("A user is connected");
//	socket.on('sensor-data-update-all',function(what){
//		//console.log("sensor-data-update-all requested: " + what);
//		io.emit('do-sensor-data-update-all',what);
//	});	
//	socket.on('arduino-received-callback-message',function(what){
//		//console.log("arduino-received-callback-message: " + what);
//		io.emit('do-arduino-received-callback-message',what);
//	});
//	readLastLines.read('/var/www/nodejs/my-nodes-monitor/debug.log', 30)
//		.then((lines) => io.emit('do-logs-data-update', lines); );
});

app.get('/getnodes', authentication.required(), function(req, res, next) {
	pool.getConnection(function(err,connection){
        if (err) {
          res.json({ error: err  });
          return;
        }
		connection.query("SELECT * FROM s_nodes",function(err,rows){
            connection.release();
            if(!err) {
				res.json({ result: rows });
            }
			else {
				res.json({ error: "No data found!" });
			}
        });
    });	
});

app.get('/gettopics', authentication.required(), function(req, res, next) {
	pool.getConnection(function(err,connection){
        if (err) {
          res.json({ error: err  });
          return;
        }
		connection.query("SELECT * FROM s_topics",function(err,rows){
            connection.release();
            if(!err) {
				res.json({ result: rows });
            }
			else {
				res.json({ error: "No data found!" });
			}
        });
    });	
});

app.get('/getcurrentdata', authentication.required(), function(req, res, next) {
	pool.getConnection(function(err,connection){
        if (err) {
          res.json({ error: err  });
          return;
        }
		connection.query("SELECT * FROM s_current_data",function(err,rows){
            connection.release();
            if(!err) {
				res.json({ result: rows });
            }
			else {
				res.json({ error: "No data found!" });
			}
        });
    });	
});

app.get('/tvon', authentication.required(), function(req, res, next) {
	//console.log(req);
//	dir = exec('echo "on 0" | cec-client -s -d 1', function(err, stdout, stderr) {
//	  console.log(stdout);
//	  if (err) {
//		// should have err.code here?  
//		console.log("Error = " + err);
//	  }
//	  res.send(stdout);
//	});
	res.json({ error: "Not implemented!" });
});

app.get('/tvoff-living', authentication.required(), function(req, res, next) {
	dir = exec('python /home/osmc/samsung_tv_off_living.py', function(err, stdout, stderr) {
	  if (err) {
		  res.json({ error: "Error=" + err });
	  }
	  else {
		  res.json({ result: "OK" });
	  }
	});
});

app.get('/tvoff-bedroom', authentication.required(), function(req, res, next) {
	dir = exec('python /home/osmc/samsung_tv_off_bedroom.py', function(err, stdout, stderr) {
	  if (err) {
		  res.json({ error: "Error=" + err });
	  }
	  else {
		  res.json({ result: "OK" });
	  }
	});
});

//var intervalToPollMySQL = 1; //seconds
//function checkForNewRows() {
//   pool.getConnection(function(err,connection){
//        if (err) {
//          //res.json({ error: err  });
//          return;
//        }
//		connection.query("SELECT * FROM s_current_data where updated > date_sub(now(), interval "+(intervalToPollMySQL+1)+" second)",function(err,rows){
//            connection.release();
//            if(!err) {
//				//console.log('emitting.' + rows.length);
//				if (rows.length > 0) {
////					console.log(rows);
//					io.emit('do-sensor-data-update-all', { result: rows });
//				}
//				//res.json({ result: rows });
//            }
//			else {
//				//res.json({ error: "No data found!" });
//			}
//        });
//    });	
//}
//setInterval(checkForNewRows, intervalToPollMySQL*1000);

// average temperature
function getAverageTemperature(cb) {
	pool.getConnection(function(err, connection) {
		if (err) {
			cb(null);
		}
		connection.query(
				//topic is temperature and nodes are entrance or kitchen
				//and updated in the last 5 minutes
				"SELECT * FROM s_data_latest where topic=1 AND node in (1,2) AND updated > date_sub(now(), interval 1 minute)", function(err,
						rows) {
					connection.release();
					if (!err) {
						if (rows.length > 0) {
							//average results
							//to-do: sort array and remove 10% from top and 10% from bottom
//							var points = [40, 100, 1, 5, 25, 10];
//							points.sort(function(a, b){return a-b});    // Sort the numbers in the array in ascending order
							var avgtemp = 0;
							for (i = 0; i < rows.length; i++) {
								avgtemp = avgtemp + rows[i].payload; 
							}
							avgtemp = avgtemp / rows.length;
							avgtemp = avgtemp - 2.5;
//							avgtemp = (Math.round(avgtemp * 10) / 10).toFixed(1);
							avgtemp = (Math.round(avgtemp * 100) / 100).toFixed(2);
							cb({
								result : avgtemp
							});
						}
						else
							cb(null);
					} else {
						cb(null);
					}
				});
	});
}

app.get('/getavg', authentication.required(), function(req, res, next) {
	getAverageTemperature(function(data){
		if (data == null)
			res.json({ error: "No data found!" });
		else 
			res.json(data);
	});
});

//heating automation
function getRelayStatus(cb) {
	pool.getConnection(function(err, connection) {
		if (err) {
			cb(null);
		}
		connection.query(
				"SELECT * FROM s_current_data where topic=2 AND node=2", function(err,
						rows) {
					connection.release();
					if (!err) {
						if (rows.length > 0) {
							cb({
								result : rows[0].payload
							});
						}
						else
							cb(null);
					} else {
						cb(null);
					}
				});
	});
}
function getAutomationConfig() {
	var data = fs.readFileSync('/home/osmc/automation-config.json'), myObj;
	try {
		myObj = JSON.parse(data);
		//console.dir(myObj);
		return myObj;
	} catch (err) {
		console.log('There has been an error parsing your JSON.')
		console.log(err);
		return null;
	}
}
function relayOn() {
	dir = exec('/home/osmc/relay_on.sh');
}
function relayOff() {
	dir = exec('/home/osmc/relay_off.sh');
}
function checkTemperature() {
	var automationconfig = getAutomationConfig();
	if (automationconfig == null)
		return;
	
	getAverageTemperature(function(data){
		if (data == null)
			return;

		var avgtemperature = data.result;
		getRelayStatus(function(status){
			if (status == null)
				return;
			
			if (avgtemperature < automationconfig.desiredtemperature-0.2 && status.result == 0) {
				logger.info('checkTemperature:relayOn()');
				relayOn();
			}
			else if (avgtemperature > automationconfig.desiredtemperature+0.2 && status.result == 1) {
				logger.info('checkTemperature:relayOff()');
				relayOff();
			}
			else {
				//we're satisfied with the current temperature
			}			
		});
	});
}
setInterval(checkTemperature, 5000);

app.get('/getdesiredtemperature', authentication.required(), function(req, res,
		next) {
	var data = getAutomationConfig();
	if (data == null)
		res.json({
			error : "No config found!"
		});
	else
		res.json(data);
});
app.post('/setdesiredtemperature', authentication.required(), function(req, res, next) {
  var myOptions = {
    desiredtemperature: req.body.desiredtemperature
  };

  var data = JSON.stringify(myOptions);

  fs.writeFile('/home/osmc/automation-config.json', data, function (err) {
    if (err) {
      console.log('There has been an error saving your configuration data.');
      console.log(err.message);
      return;
    }
    console.log('Configuration saved successfully.')
  });
	
	res.json({result : true});
});

//graphs utility functions
app.get('/jsondata', authentication.required(), function(req, res, next) {
	pool.getConnection(function(err,connection){
        if (err) {
          res.send("MySQL error!");
          return;
        }
        
        var mysqlquery = "SELECT payload,updated FROM s_data WHERE node='" + req.query.node + 
			"' AND topic='" + req.query.topic + "' AND updated >= NOW() - INTERVAL "
			+ req.query.interval + " MINUTE ORDER BY updated ASC";
        
		connection.query(mysqlquery, function(err,rows){
            connection.release();
            if(!err) {
//				res.json({ result: rows, success: "Query:" + mysqlquery });
            	var results = "[";
            	for (i = 0; i < rows.length; i++) {
//            		results = results + "[" + rows[i].payload + ",\"" + rows[i].updated + "\"]"; 
            		results = results + "[" + rows[i].updated.getTime() //.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
            			+ "," + rows[i].payload + "],"; 
				}
            	results = results.substring(0, results.length - 1);
            	results = results + "]";
				res.send(results);
            }
			else {
	            res.send("No data found! Query:" + mysqlquery);
			}
        });
    });	
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//var Tail = require('always-tail');
//var tail_filename = "/var/www/nodejs/my-nodes-monitor/debug.log";
//if (!fs.existsSync(tail_filename)) fs.writeFileSync(tail_filename, "");
//var tail = new Tail(tail_filename, '\n', {start : 20});
//tail.on('line', function(data) {
//	io.emit('do-logs-data-update', data);
//  //console.log("Tail got line:", data);
//});
//tail.watch();
//
//setInterval(function(){
//	logger.info('Hello! Now is:' + Date.now());
//}, 2000);

module.exports = app;
