

define(["./lib-debug/dump","./lib-debug/log","./lib-parsers/js"], 	
	function(dump,log,jsparse) {
	var file = require('fs').readFileSync("./lib-xml/lib/util/xml2cgi.js").toString();

	var node = jsparse.parse(file);
	var out = jsparse.serialize(node);
	if(out!=file){
		console.log("FAIL");
		return;
	}
	
	//var nodes = node.find( "define([],function(){#return{#{/\\w+/}:");
	var nodes = node.find( "{/apf\\..*/} =" , 2);

	for(var i = 0;i<nodes.length;i++){
		console.log(nodes[i].token);
		nodes[i].token = nodes[i].token.toUpperCase();
	}

	console.log(jsparse.serialize(node));
});
