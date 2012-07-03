var fs = require('fs');
var workingDirectory = fs.workingDirectory;

var pages = [];



if (phantom.args.length === 0) {
	    console.log('Usage: loadspeed.js <some URL>');
	    phantom.exit();
} else {
	var address = phantom.args[0];
	var nrConected = phantom.args[1];
	var totalNrConected = nrConected;
	process();
}


function process() {
	if(nrConected > 0) {
	 	nrConected = nrConected-1;
	 	console.log('Number of conected ' +  (totalNrConected - nrConected));
	   	loadSite(address, process);
	}else {
		runOnAll();
		phantom.exit();
	}
}


function loadSite(address, callback) {
	t = Date.now();
    
    var page = require('webpage').create(), t, address;

    pages.push(page);

    page.open(address, function (status) {
    	if (status !== 'success') {
            console.log('FAIL to load the address');
        } else {
            t = Date.now() - t;
            console.log('Loading time ' + t + ' msec');

           page.evaluate(function() {
				var ssAppName = 'demo';
				var ssFuncToTest = ['LoadTest'];
				var numberOfLoops = 0;

				for(var x=0; x < numberOfLoops; x++){
					for(var i=0; i < ssAppName.length; i++){
						if(typeof ssFuncToTest[i] !== "undefined")
						{
					   		ss.rpc(ssAppName + '.' + ssFuncToTest[i]);
						}
					}
				}
			});
        }

        callback.apply();
    });

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
	for(var z=0; z < pages.length; z++){
		console.log('ss.rpc call: ' + z);
		
		pages[z].evaluate(function() {
			var ssAppName = 'demo';
			var ssFuncToTest = ['LoadTest'];
			ss.rpc(ssAppName + '.' + ssFuncToTest[0]);
		});
	}
}



