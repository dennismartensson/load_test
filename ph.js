var fs = require('fs');
var workingDirectory = fs.workingDirectory;

var dataFile = '/data.ph'
var finichetFile = '/finichetInstances.ph'

var pages = [];
var times = [];

var numberOfErrors = 0;



if (phantom.args.length === 0) {
	console.log('Usage: loadspeed.js <some URL>');
	phantom.exit();
} else {
	var address = phantom.args[0];
	var nrConected = phantom.args[1];
	var totalNrConected = nrConected;
	var totalNrOfClients = phantom.args[2];
	process();
}


function process() {
	if (nrConected > 0) {
		nrConected = nrConected - 1;
		console.log('Number of conected ' + (totalNrConected - nrConected));
		loadSite(address, process);
	} else {
		runOnAll();
		writeDataFile();
		writeFinichetFile();
		redyToKill();
	}
}


function loadSite(address, callback) {
	t = Date.now();

	var page = require('webpage').create(),
		t, address;

	pages.push(page);

	page.open(address, function(status) {
		if (status !== 'success') {
			console.log('FAIL to load the address');
		} else {
			t = Date.now() - t;
			console.log('Loading time ' + t + ' msec');
			times.push(t);
		}

		callback.apply();
	});

	page.onError = function (msg, trace) {
		numberOfErrors++;
		console.log(msg);
		trace.forEach(function(item) {
			console.log('  ', item.file, ':', item.line);
		})
	}
		
	page.onConsoleMessage = function(msg) {
		console.log(msg);
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
		try {
			pages[z].evaluate(function() {
				var ssAppName = 'demo';
				var ssFuncToTest = 'LoadTest';
				ss.rpc(ssAppName + '.' + ssFuncToTest);
			});
		} catch (e) {
			console.log(e);
		}
	}
}


function redyToKill() {
	var nrDone = getRunningProceses();
	if (nrDone >= totalNrOfClients) {
		console.log('------------EXIT------------' + 'numberOfErrors: ' + numberOfErrors);
		phantom.exit();
	} else {
		setTimeout(redyToKill(), 1000);
	}
}


function getRunningProceses() {
	fg = fs.read(workingDirectory + finichetFile);
	var array = fg.toString().split("\n");
	return array.length -1
}


function writeDataFile() {
	try {
			fd = fs.open(workingDirectory + dataFile, 'a');
			fd.writeLine('[' + times + ']');
			fd.close();
		} catch (e) {
			console.log(e);
		}
}


function writeFinichetFile() {
	try {
			ff = fs.open(workingDirectory + finichetFile, 'a');
			ff.writeLine('Done');
			ff.close();
		} catch (e) {
			console.log(e);
		}
}

