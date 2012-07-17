var fs = require('fs');
var workingDirectory = fs.workingDirectory;

var dataFile = '/data.ph'
var finichetFile = '/finichetInstances.ph'
var settingsFiles = '/settings.json'

var pages = [];
var resTimes = [];
var socketTimes = [];
var callsArray = [];

var numberOfErrors = 0;

var nrOfMessages = 0;

var haveSentAllMessages = false;

var timoutAllMessages;
var timoutTimer;

var nrDone;



if (phantom.args.length === 0) {
	console.log('Usage: ./LoadTest.sh <some URL> <some number of connections> <some number of processes>');
	phantom.exit();
} else {
	var address = phantom.args[0];
	var nrConected = phantom.args[1];
	var totalNrConected = nrConected;
	var totalNrOfClients = phantom.args[2];
	var clinetNr = phantom.args[3];
	var loadTestPath = phantom.args[4];
	parseJSON();
	process();
}


function process() {
	if (nrConected > 0) {
		nrConected = nrConected - 1;
		console.log('Clinet ' + clinetNr + ' has conected ' + (totalNrConected - nrConected) + ' times');
		loadSite(address, process);
	} else {
		runOnAll();
	}
}


function loadSite(address, callback) {
	var t = Date.now();

	var page = require('webpage').create(),
		t, address;

	pages.push(page);

	page.open(address, function(status) {
		if (status !== 'success') {
			console.log('FAIL to load the address');
		} else {
			t = Date.now() - t;
			console.log('Loading time ' + t + ' msec on client ' + clinetNr);
			resTimes.push(t);
		}

		callback.apply();
	});

	page.onCallback = function(data, time) {
		var time = Date.now() - time;
		console.log("Received by the 'phantom' main context: " + data + " time for socket " + time);
		nrOfMessages--;
		socketTimes.push(time);

		if (nrOfMessages == 0 && haveSentAllMessages) {
			initialKillProcess();
		}
	};

	page.onError = function(msg, trace) {
		numberOfErrors++;

		if (msg == "ReferenceError: Can't find variable: ss") {
			nrOfMessages--;
		}

		console.log('onError: ' +msg);
		trace.forEach(function(item) {
			console.log('  ', item.file, ':', item.line);
		})
	}

	page.onConsoleMessage = function(msg) {
		console.log('onConsoleMessage: ' +msg);
		if (msg == "Connection down :-(") {
			initialKillProcess();
		}
	};

	/* Remove comment if you want to see all the requests and responses for all the clients during the run
	page.onResourceRequested = function (request) {
	   	console.log('Request ' + JSON.stringify(request, undefined, 4));
	};

	page.onResourceReceived = function (response) {
		console.log('Receive ' + JSON.stringify(response, undefined, 4));
	};
	*/
}

function runOnAll() {
	try {
		if(!callsArray.length) {
			haveSentAllMessages = true;
			initialKillProcess();
		}
		for (var z = 0; z < pages.length; z++) {
			for (var x in callsArray) {

				var call = callsArray[x];
				var variable = call.variable;
				var nrRuns = call.nrRuns;

				if (variable != '') {
					variable = ', "' + variable + '"';
				}

				var t = Date.now();


				//Edit/Add frameworks 

				//SocketStream
				var evaFunc = 'function() {ss.rpc("' + call.call + '"' + variable + ', function(data) { callPhantom(data, ' + t + ')});}';
				//Socket.io
				//var evaFunc = 'function() {socket.emit("'+call.call+'", function (data) { callPhantom(data, '+ t +');});}';
				
				for (var i = 0; i < nrRuns; i++) {
					console.log('Running evaluate ' + i + ' on client ' + clinetNr);
					pages[z].evaluate(evaFunc);
					nrOfMessages++;
				}
			}
		}
	} catch (e) {
		console.log('runOnAll: ' +e);
	}
	haveSentAllMessages = true;
}

function initialKillProcess() {
	console.log('------------>initialKillProcess<------------' + clinetNr);
	writeDataFile();
	writeFinichetFile();
	redyToKill();
}

function redyToKill() {
	nrDone = getRunningProceses();
	if (nrDone >= totalNrOfClients && nrOfMessages == 0) {
		console.log('------------EXIT------------' + clinetNr);
		phantom.exit();
	}
	setTimeout("redyToKill()", 5000);
}


function getRunningProceses() {
	try {
		var fg = fs.read(loadTestPath + finichetFile);
		var array = fg.toString().split("\n");
		return array.length - 1
	} catch (e) {
		console.log('getRunningProceses:' +e);
	}
}


function writeDataFile() {
	try {
		var fd = fs.open(loadTestPath + dataFile, 'a');
		fd.writeLine('[' + resTimes + '];' + numberOfErrors + ';' + clinetNr + ';' + '[' + socketTimes + ']');
		fd.close();
	} catch (e) {
		console.log('writeDataFile: ' +e);
	}
}


function writeFinichetFile() {
	try {
		var ff = fs.open(loadTestPath + finichetFile, 'a');
		ff.writeLine('Done');
		ff.close();
	} catch (e) {
		console.log('writeFinichetFile: ' +e);
	}
}

function parseJSON() {

	try {
		var fj = fs.read(loadTestPath + settingsFiles);
		var readFromFile = fj.toString();
		var jsonAppCall = JSON.parse(readFromFile);
		var jsonFunc = jsonAppCall.calls;

		for (var i in jsonFunc) {
			if (jsonFunc.hasOwnProperty(i) && !isNaN(+i)) {
				callsArray[+i] = jsonFunc[i];
			}
		}
	} catch (e) {
		console.log('parseJSON: ' +e);
	}
}