var fs = require("fs");


var dataFile = '/data.ph'

var clients = [];
var sockets = [];
var clientList = [];
var nrError = [];
var COUNTER = 1;

function getData() {
	var array = fs.readFileSync(__dirname + dataFile).toString().split("\n");
	
	for(i in array) {
		if(array[i] !== '') {
			var parameters = array[i].split(";");
			var times = parameters[0];
			var numberOfErrors = parameters[1];
			var clinetNr = parameters[2];
			var socketTimes = parameters[3];

			var client = "{name: 'Client " + clinetNr + "',data: " + times + "}";
			clients.push(client);

			var socket = "{name: 'Client " + clinetNr + "',data: " + socketTimes + "}";
			sockets.push(socket);

			clientList.push('"Client ' + clinetNr +'"');
			nrError.push(numberOfErrors);

			COUNTER++;
		}
	}
}

function createPage() {
	console.log('------------CREATING LOG------------');
	getData();

	var html = "<!DOCTYPE HTML><html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'><title>Load Test</title><script type='text/javascript' src='http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'></script><script type='text/javascript'>$(function () {var chart; $(document).ready(function() { chart = new Highcharts.Chart({ chart: { renderTo: 'container', type: 'line', marginRight: 130,},title: {text: 'Load time',x: -20 },subtitle: {text: 'First respons',x: -20},xAxis: {title: {text: 'Number of clients'},plotLines: [{value: 0,width: 1,color: '#808080'}]},yAxis: {title: {text: 'Load time in milliseconds'},plotLines: [{value: 0,width: 1,color: '#808080'}]},tooltip: {formatter: function() {return '<b>'+ this.series.name +'</b><br/>'+this.x +': '+ this.y ;}},legend: {layout: 'vertical',align: 'right',verticalAlign: 'top',x: -10,y: 100,borderWidth: 0},series: [" + clients + "]});});});</script><script type='text/javascript'>$(function () {var chart; $(document).ready(function() { chart = new Highcharts.Chart({ chart: { renderTo: 'container2', type: 'line', marginRight: 130,},title: {text: 'Load time',x: -20 },subtitle: {text: 'Websocket respons',x: -20},xAxis: {title: {text: 'Number of clients'},plotLines: [{value: 0,width: 1,color: '#808080'}]},yAxis: {title: {text: 'socket time in milliseconds'},plotLines: [{value: 0,width: 1,color: '#808080'}]},tooltip: {formatter: function() {return '<b>'+ this.series.name +'</b><br/>'+this.x +': '+ this.y ;}},legend: {layout: 'vertical',align: 'right',verticalAlign: 'top',x: -10,y: 100,borderWidth: 0},series: [" + sockets + "]});});});</script><script type='text/javascript'>$(function () {var chart;$(document).ready(function() {chart = new Highcharts.Chart({chart: {renderTo: 'container1',type: 'column'},title: {text: 'Number of errors per clinet'},xAxis: {categories: ["+clientList+"]},yAxis: {min: 0,title: {text: 'Number of errors'},stackLabels: {enabled: true,style: {fontWeight: 'bold',color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'}}},legend: {align: 'right',x: -100,verticalAlign: 'top',y: 20,floating: true,backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',borderColor: '#CCC',borderWidth: 1,shadow: false},plotOptions: {column: {stacking: 'normal',dataLabels: {enabled: true,color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'}}},series: [{name: 'Errors',data: ["+nrError+"]}]});});});</script></head><body><script src='js/highcharts.js'></script><script src='js/modules/exporting.js'></script><div id='container' style='min-width: 400px; height: 400px; margin: 0 auto'></div><div id='container2' style='min-width: 400px; height: 400px; margin: 0 auto'></div><div id='container1' style='min-width: 400px; height: 400px; margin: 0 auto'></div></body></html>"
	fs.writeFile(__dirname + '/charting.html', html, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("------------THE LOGS ARE CREATED------------");
			console.log("------------THE LOGS WILL BE OPEND IN YOUR BROWSER!------------");
		}
	});
}

createPage();