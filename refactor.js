var dump = require("./dump");
var js = require("./js");
var fs = require('fs');

function reload(){
	function getFileList(dir,match, dont, out){
		if(!out) out = [];
		var names = fs.readdirSync(dir);
		for(var i = 0;i<names.length;i++){
			var n = names[i];
			if(n!='.' && n!='..'){
				var fp = dir+"/"+n;
				if(!dont || !fp.match(dont)){
					if(fp.match(match))
						out.push(fp);
					else if (fs.statSync(fp).isDirectory() ){
						getFileList(fp, match, dont, out);
					}
				}
			}
		}
		return out;
	}
	
	var list = getFileList("./apf", /\.js$/, /\_old/);
	var opts = {dict:{}, needcomment:1};
	// lets now parse each file
	console.log("Loading...");
	for(var i = 0;i<list.length;i++){
		var f = list[i] = {name:list[i]};
		//console.log(n.name)
		f.data = fs.readFileSync(f.name).toString().replace(/\r?\n/g,"\n");
		f.node = js.parse( f.data, opts );
		f.check = js.serialize(f.node);
		if(f.data != f.check){
			console.log("Fatal error in file " +f.name+"\n"+f.check);
			return;
		}
	}
	console.log("Done.");
	return list;
}

function step1(list){ // fix up modules and report wrong files.
	var miss = [];
	//lets see which files are not nice modules yet
	for(var i = 0;i<list.length;i++){
		var f = list[i];
		
		if(!js.find(f.node,"define").length && !js.find(f.node,"require").length && !js.find(f.node,"require.modify").length ){
			console.log("lets modularise:"+f.name)
			// we should find the ground level ifdef
			//console.log(js.dump(f.node));
			var n = js.findrx(f.node, /\/\/\s*#ifdef|\/\/\s*#endif/);
			if(n.length>=2){
				//alright now we should find at the root level: apf.* = function
				// and replace it with Tree
				var obj = js.find(f.node, "{/apf\\.[a-zA-Z].*/} =");
				var cls = "";
				if(obj.length!=1){
					miss.push(f.name+' defs:'+obj.length);
					console.log("File: "+f.name+" has wrong amount of class definitions: "+obj.length);
				} else {
					var s = obj[0].v.match(/apf\.(.*)/)[1];
					s = (s.charAt(0).toUpperCase()+s.slice(1)).replace(/\./g,"");
					cls = s;
					s = "var " + s;
					console.log("Replacing "+obj[0].v+" with "+s);
					obj[0].v = s;
				}
				
				// lets wrap this thing in a define declaration
				n[0].v = "define([], function(){\n";
				n[n.length-1].v = (cls?"\nreturn "+cls+";\n\n":"")+"});";
			
				fs.writeFileSync(f.name, js.serialize(f.node));
			}
		}
	}
	console.log(miss.join('\n'));
}

//var list = reload();
//step1(list);

function step2(list){ // fix up init code 
	for(var fi = 0;fi<list.length;fi++){
		var f = list[fi];
		var fn = js.find(f.node,"define([],function(){#.call");//({/apf\\..*/} = new {apf\\..*}())");
		for(var t = 0;t<fn.length;t++){
			try{
				var cls  = fn[t].dn.ch.v;
				var base = fn[t].dn.ch.dn.dn.dn.v;
				
				if(cls = cls.match(/^apf\.(.*)\./)[1]){ // fix up prototype
					cls = (cls.charAt(0).toUpperCase()+cls.slice(1));
					fn[t].dn.ch.v = cls+".prototype";
					fn[t].dn.ch.dn = null;
					
					if(base = base.match(/^apf\.(.*)/)[1]){ // fix up $init and oop.inherit
						base = (base.charAt(0).toUpperCase()+base.slice(1));
						var sf = js.find(f.node,"define([],function(){#var "+cls+" = function(struct, tagName){this.$init");
						if(sf.length==1){
							var n = sf[0];
							n.v = base+".call";
							n = n.dn;
							n.ch = {ws:"",dn:n.ch, pa:n, v:"this"+(n.ch?", ":""), t:0};
							if(n.ch.dn) n.ch.dn.up = n.ch;
							var n = sf[0].pa.dn.dn; // add oop.inherit
							n.dn = {ws:"", dn:n.dn, up:n, pa:n.pa, v:"\n\noop.inherit("+cls+", "+base+");\n" }, n.dn.dn.up = n.dn;
						}
					}
					// lets find the apf.aml.setElement stuff and fix it up
					var sf = js.find(f.node, "define([],function(){#apf.aml.setElement");
					if(!sf.length)
						console.log("Error, no setElement"+f.name);
					else for(var i = 0;i<sf.length;i++){
						 sf[i].v = "aml && aml.setElement";
						 var n = sf[i].dn.ch.dn.dn;
						 var t = n.v.match(/^apf\.(.*)/)[1];
						 n.v = (t.charAt(0).toUpperCase()+t.slice(1));
					}
					
					// lets fix up oop.decorate
					var sf = js.find(f.node, "this.implement(",2);
					for(var i = 0;i<sf.length;i++){
						// we shoudl check how many things we implement
						var si = js.findrx(sf[0],/apf.*/);
						// lets replace all these implement things with oop.decorate
						for(var j = 0;j<si.length;j++){
							var t = si[j].v.match(/^apf\.(.*)/)[1];
							si[j].v = "oop.decorate("+cls+", "+(t.charAt(0).toUpperCase()+t.slice(1))+");";	
							if(si[j].dn && si[j].dn.v==',')
								si[j].dn.v = '';
						}
						if(si.length>1)console.log(f.name);
						sf[0].pa.v='';
						sf[0].pa.up.v='';
						sf[0].pa.dn.v='';
					}
					// add dependencies
					var sf = js.find(f.node, "define([],function(){})");
					if(sf.length){
						// lets set the deps
						sf[0].dn.ch.ch = {ws:"",t:0,pa:sf[0].dn.ch,v:
							'"aml-core/'+base.toLowerCase()+'", "optional!aml", "lib-oop"'};
						sf[0].dn.ch.dn.dn.dn.dn.ch = {ws:"",t:0,pa:sf[0].dn.ch.dn.dn.dn.dn,v:
							base+', aml, oop'};
					}
					
					fs.writeFileSync(f.name, js.serialize(f.node));
				}
				
			}catch(e){
				console.log("Fail in: "+f.name+" "+e)
			}
			
		}
	}
}

var list = reload();
step2(list);


// lets see which files are not nice modules yet
/*for(var i = 0;i<list.length;i++){
	var f = list[i];
	if( js.replace(f.node, "define()",2, function(n){
		console.log(f.name)
	}))
		fs.writeFileSync(f.name, js.serialize(f.node));
}*/

/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 

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
}*/

