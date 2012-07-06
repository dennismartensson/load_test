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

		if(nrOfMessages == 0 && haveSentAllMessages){
			initialKillProcess();
		}
	};

	page.onError = function(msg, trace) {
		numberOfErrors++;

		if(msg == "ReferenceError: Can't find variable: ss"){
			nrOfMessages--;
		}

		console.log(msg);
		trace.forEach(function(item) {
			console.log('  ', item.file, ':', item.line);
		})
	}

	page.onConsoleMessage = function(msg) {
		console.log(msg);
		if(msg == "Connection down :-(") {
			initialKillProcess();
		}
	};

	/*
	page.onResourceRequested = function (request) {
	   	console.log('Request ' + JSON.stringify(request, undefined, 4));
	};

	page.onResourceReceived = function (response) {
		console.log('Receive ' + JSON.stringify(response, undefined, 4));
	};
	*/
}

function runOnAll() {
	for (var z = 0; z < pages.length; z++) {
		for (var x in callsArray) {

			var call = callsArray[x];
			var variable = call.variable;
			var ssNrRuns = call.nrRuns;

			if (variable != '') {
				variable = ', ' + variable;
			}

			var t = Date.now();
			var evaFunc = 'function() {ss.rpc("' + call.ssCall + '"' + variable + ', function(data) { callPhantom(data, '+t+')});}'

			for (var i = 0; i < ssNrRuns; i++) {
				console.log('Running evaluate '+i+' on client ' + clinetNr);
				pages[z].evaluate(evaFunc);
				nrOfMessages++;
			}
		}
	}
	haveSentAllMessages = true;
	//timoutAllMessages = setTimeout(initialKillProcess(), 120000);
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
	var fg = fs.read(workingDirectory + finichetFile);
	var array = fg.toString().split("\n");
	return array.length - 1
}


function writeDataFile() {
	try {
		var fd = fs.open(workingDirectory + dataFile, 'a');
		fd.writeLine('[' + resTimes + '];' + numberOfErrors + ';' + clinetNr +';' + '[' + socketTimes + ']');
		fd.close();
	} catch (e) {
		console.log(e);
	}
}


function writeFinichetFile() {
	try {
		var ff = fs.open(workingDirectory + finichetFile, 'a');
		ff.writeLine('Done');
		ff.close();
	} catch (e) {
		console.log(e);
	}
}

function parseJSON() {

	var fj = fs.read(workingDirectory + settingsFiles);
	var readFromFile = fj.toString();

	var jsonSsAppCall = JSON.parse(readFromFile);
	var jsonSsFunc = jsonSsAppCall.ssCalls;

	for (var i in jsonSsFunc) {
		if (jsonSsFunc.hasOwnProperty(i) && !isNaN(+i)) {
			callsArray[+i] = jsonSsFunc[i];
		}
	}
}