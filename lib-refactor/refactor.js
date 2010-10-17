
function getFileList(dir,match, dont, out){
	if(!out) out = [];
	var fs = require('fs')
	var names = fs.readdirSync(dir);
	for(var i = 0;i<names.length;i++){
		var n = names[i];
		if(n!='.' && n!='..'){
			var fp = dir+"/"+n;
			if(!dont || !fp.match(dont)){
				if(n.match(match))
					out.push(fp);
				else if (fs.statSync(fp).isDirectory() ){
					getFileList(fp, match, dont, out);
				}
			}
		}
	}
	return out;
}


define(["./lib-debug/dump","./lib-debug/log","./lib-parsers/js"], 	
	function(dump,log,jsparse) {
	
	var file = require('fs').readFileSync("./lib-xml/lib/util/xml2json.js").toString().replace(/\r?\n/g,"\n");
	var node = jsparse.parse(file);

	var out = jsparse.store(node);
	
	var list = getFileList(".", /\.js$/, /\_old/);
//	var list = getFileList(".", /\img.js$/, /\_old/);

	// lets now parse each file
	for(var i = 0;i<list.length;i++){
		var n = list[i] = {name:list[i]};
		console.log("Reading:"+n.name)
		n.data = require('fs').readFileSync(n.name).toString().replace(/\r?\n/g,"\n");
		n.node = jsparse.parse( n.data );
		n.check = jsparse.serialize(n.node);
		if(n.data != n.check){
			//var node = jsparse.find(n.node,"this.$resize = function(){",2);
			//console.log(jsparse.dump(n.node));
			console.log(diffString(n.data, n.check));
			/*console.log('\n\n\n\n------------------------------------------------------------\n\n\n\n\n')
			console.log(n.data);
			console.log('\n\n\n\n------------------------------------------------------------\n\n\n\n\n')
			console.log(n.check);
			console.log('\n\n\n\n------------------------------------------------------------\n\n\n\n\n')
			console.log("FAIL");*/
			return;
		}
	}
	return;
	// alright so we can read/write parse trees fast. 
	// lets now read a list of 'all' .js files in this sourcetree.
	// then we are going to parse all these source files and generate a cache dump
		
	require('fs').writeFileSync("./dumped.js", "module.exports = "+out);
	var node = require('./dumped.js');

	var out = jsparse.serialize(node);
	if(out!=file){
		console.log("FAIL");
		return;
	}
	
	var nodes = node.find( "define([],function(){#return{#{/\\w+/}:");
	var nodes = jsparse.find(node, "{/apf\\..*/} =" , 2);
    
	for(var i = 0;i<nodes.length;i++){
		console.log(nodes[i].token);
		nodes[i].token = nodes[i].token.toUpperCase();
	}

	console.log(jsparse.serialize(node));
});


/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 */

function escape(s) {
    var n = s;
    n = n.replace(/&/g, "&amp;");
    n = n.replace(/</g, "&lt;");
    n = n.replace(/>/g, "&gt;");
    n = n.replace(/"/g, "&quot;");

    return n;
}

function diffString( o, n ) {
  o = o.replace(/\s+$/, '');
  n = n.replace(/\s+$/, '');

  var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );
  var str = "";

  var oSpace = o.match(/\s+/g);
  if (oSpace == null) {
    oSpace = ["\n"];
  } else {
    oSpace.push("\n");
  }
  var nSpace = n.match(/\s+/g);
  if (nSpace == null) {
    nSpace = ["\n"];
  } else {
    nSpace.push("\n");
  }

  if (out.n.length == 0) {
      for (var i = 0; i < out.o.length; i++) {
        str += '<del>' + escape(out.o[i]) + oSpace[i] + "</del>";
      }
  } else {
    if (out.n[0].text == null) {
      for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
        str += '<del>' + escape(out.o[n]) + oSpace[n] + "</del>";
      }
    }

    for ( var i = 0; i < out.n.length; i++ ) {
      if (out.n[i].text == null) {
        str += '<ins>' + escape(out.n[i]) + nSpace[i] + "</ins>";
      } else {
        var pre = "";

        for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++ ) {
          pre += '<del>' + escape(out.o[n]) + oSpace[n] + "</del>";
        }
        str += " " + out.n[i].text + nSpace[i] + pre;
      }
    }
  }
  
  return str;
}

function randomColor() {
    return "rgb(" + (Math.random() * 100) + "%, " + 
                    (Math.random() * 100) + "%, " + 
                    (Math.random() * 100) + "%)";
}
function diffString2( o, n ) {
  o = o.replace(/\s+$/, '');
  n = n.replace(/\s+$/, '');

  var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );

  var oSpace = o.match(/\s+/g);
  if (oSpace == null) {
    oSpace = ["\n"];
  } else {
    oSpace.push("\n");
  }
  var nSpace = n.match(/\s+/g);
  if (nSpace == null) {
    nSpace = ["\n"];
  } else {
    nSpace.push("\n");
  }

  var os = "";
  var colors = new Array();
  for (var i = 0; i < out.o.length; i++) {
      colors[i] = randomColor();

      if (out.o[i].text != null) {
          os += '<span style="background-color: ' +colors[i]+ '">' + 
                escape(out.o[i].text) + oSpace[i] + "</span>";
      } else {
          os += "<del>" + escape(out.o[i]) + oSpace[i] + "</del>";
      }
  }

  var ns = "";
  for (var i = 0; i < out.n.length; i++) {
      if (out.n[i].text != null) {
          ns += '<span style="background-color: ' +colors[out.n[i].row]+ '">' + 
                escape(out.n[i].text) + nSpace[i] + "</span>";
      } else {
          ns += "<ins>" + escape(out.n[i]) + nSpace[i] + "</ins>";
      }
  }

  return { o : os , n : ns };
}

function diff( o, n ) {
  var ns = new Object();
  var os = new Object();
  
  for ( var i = 0; i < n.length; i++ ) {
    if ( ns[ n[i] ] == null )
      ns[ n[i] ] = { rows: new Array(), o: null };
    ns[ n[i] ].rows.push( i );
  }
  
  for ( var i = 0; i < o.length; i++ ) {
    if ( os[ o[i] ] == null )
      os[ o[i] ] = { rows: new Array(), n: null };
    os[ o[i] ].rows.push( i );
  }
  
  for ( var i in ns ) {
    if ( ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1 ) {
      n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
      o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
    }
  }
  
  for ( var i = 0; i < n.length - 1; i++ ) {
    if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null && 
         n[i+1] == o[ n[i].row + 1 ] ) {
      n[i+1] = { text: n[i+1], row: n[i].row + 1 };
      o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
    }
  }
  
  for ( var i = n.length - 1; i > 0; i-- ) {
    if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null && 
         n[i-1] == o[ n[i].row - 1 ] ) {
      n[i-1] = { text: n[i-1], row: n[i].row - 1 };
      o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
    }
  }
  
  return { o: o, n: n };
}

