/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 */

define(function(){
    var tok_lut = {
            '"': 4, '\'': 4, '[': 2, ']': 3, '{': 2, '}': 3, '(': 2, ')': 3,
            '\n': 6, '\r\n': 6, '//': 7, '/*': 7, '*/': 7, '/':8
        },
        tok_close = {'}': '{', ']': '[', ')': '('},
        tokenizerx    = /(\r?[\n]|\/[\/*]|\*\/|["'{(\[\])}\]\/])|([ \t]+)|([\w\$._])+|(\\?[\w._?,:;!=+-\\\/^&|*"'[\]{}()%$#@~`<>])/g;    
    /**/
    
    var pre_regex = {
        'throw': 1, 'return': 1, '(': 1, '[': 1, '{':1, ',': 1, '=': 1, ":": 1
    }
    
    function lineLookup(lines,pos){
        for (var i = 0, j = lines.length; i < j && lines[i] < pos; i++);
        return {line: i+1, col: pos - lines[i - 1]};
    }
    
    function dump(t, s, l){
        if(!s) s = [];
        if(!l) l = 0;
        if(t)
        for (var n = t; n!=null; n = n.dn) {
            if ( n.t == 2){
                s.push(Array(l).join('----'), n.type, " ", n.v, "\n");
                dump( n.ch, s, l+1);
            }
            else if(n.t!=3)
                s.push(Array(l).join('----'), n.type, " ", n.v, "\n");
        }
        if(!l) return s.join('');
    }
    
    function serialize(t, s, l){
        if(!s) s = [];
        if(!l) l = 0;
        if(t)
        for (var n = t; n; n = n.dn) {
        	s.push( n.ws + n.v );
            if (n.t == 2)
                serialize( n.ch, s, l + 1 );
        }
        if(!l) return s.join('');
	}
    
    function store(t, s, w, l){
        if(!s) s = ['(function(){var z = [\n'], s.count = 0;
        if(!w) w = [];
        if(!l) l = 0;
        var d = 0;
        
        for (var n = t; n!=null; n = n.dn, d++) {
        	s.push(Array(l+1).join(' '),'{t:',n.t,
        			',v:"',n.v.replace(/\\/g,"\\\\").replace(/\"/g,'\\"').replace(/\r?\n/g,'\\n').replace(/\t/g,'\\t'),
        			'",ws:"',n.ws.replace(/\\/g,"\\\\").replace(/\"/g,'\\"').replace(/\r?\n/g,"\\n").replace(/\t/g,'\\t'),'"},\n');
        	
        	var c = s.count;
            if (n.t == 2 && n.ch){
        		w.push("z["+c+"].ch=z["+(c+1)+"]",",z["+(c+1)+"].pa=z["+c+"];\n");
        		s.count++;
            	store( n.ch, s, w, l+1);
            }else s.count++;
            
        	if( n.dn )
        		w.push("z["+c+"].dn=z["+s.count+"]",",z["+(s.count)+"].up=z["+c+"];\n");
        }
        
        if(!l){
        	s.push(']');
        	// now lets wire all that shit up
        	
        	return s.join('')+"\n"+"\nreturn z[0];})()";;
        }
    }    
    
    function match(t1, t2){
		for(var n1 = t1, n2 = t2; (n1 && n2); n1 = n1.dn, n2 = n2.dn){
			if(n2.v == '{' && n2.ch && n2.ch.type==8){
				if(!n2.rx) 
					n2.rx = new RegExp(n2.ch.v.slice(1,-1));
				
				if(!n1.v.match( n2.rx ))
					break;
				if(!n2.dn)console.log(n2);
				
				n2 = n2.dn;
			} else {
    			if(n1.v != n2.v)
    				break;
    			if(n2.type == 2){ // we (should)have children
    				if(n2.ch){
    					var m = match( n1.ch, n2.ch);
    					if(!m) break;
    					if(!n2.dn) return m;
    				}
					if(!n2.dn) return n1.ch;
    			}
			}
    	}
		if(!n2)
			return t1;
    }
    
    function scan(t1, t2, deep, results, l){
    	if(!results) results = [];
    	if(!l) l = 0;
    	
    	for (var n = t1; n; n = n.dn) {
    		var m = match(n, t2);
        	
    		if(m)
    			results.push(m);
    		if(n.type == 2 && deep){
        		if(deep!=1 || 
        		  !(n.v=='{' && n.up/*(*/ && n.up.up/*)*/ && n.up.up.up/*function*/ && 
        		  (n.up.up.up.v=='function' || (n.up.up.up.up && n.up.up.up.up.v=='function'))))
        			scan(n.ch, t2, deep, results, l+1);
        	}
        }
    	if(!l)return results;
    }
    
    function find(where, what, deep){
     	var args = what.split("#");
     	var set = where.constructor == Array?where:[where];
    	for(var i = 0;i<args.length;i++){
    		var nw = parse(args[i]);
    		var set2 = [];
    		for(var j = 0;j<set.length;j++){
    			set2.push.apply(set2, scan(set[j], nw, deep));
    		}
    		set = set2;
    	}
    	return set;
    }
    
    function replace(where, what, deep, cb){
    	var set = find(where,what,deep);
    	for(var i = 0;i<set.length;i++)
    		cb(set[i]);
    	return set.length!=0;
    }
    
    function parse(str, opts){
    	if(!opts)opts = {};
        var root = {t:0,ws:"",v:""},     // parse tree root node
            n = root,
        	b = 0,      // block output
            type = 0,   // token type
            mode_tok = 0, // parsemode, contains char of block we parse
            n,          // current node
            lines = [], // array of linepositions
            err = [];   // tokenize array
        	ws = ""; 	// store whitespace
        var last_tok = null;
        str.replace(tokenizerx, function(tok, rx_lut, rx_ws, rx_word, rx_misc, pos){
            type = rx_lut ? tok_lut[rx_lut] : (rx_ws ? 9 : (rx_word ? 5 : 0)); //5 = word
            if (!mode_tok) {
                switch (type) {
                    case 8: // regex
                        // previous is: throw return ( , [
                        if (pre_regex[last_tok]) {
                            mode_tok = tok;
                            n = n.dn = {t:type,  p:pos, ws:ws, v:tok, pa:n.pa, up:n}, ws = "";
                            b = [tok];
                        } else 
                        	n = n.dn = {t:type,  p:pos, ws:ws, v:tok, pa:n.pa, up:n}, ws = "";
                        break;                
                    case 7: //Comment
                    	if(opts.needcomment)
                    		n = n.dn = {t:type,  p:pos, ws:ws, v:tok, pa:n.pa, up:n}, ws = "";
                		mode_tok = tok;
                        b = [tok];
                        break;
                    case 4: //String 
                    	n = n.dn = {t:type,  p:pos, ws:ws, v:tok, pa:n.pa, up:n}, ws = "";
                        mode_tok = tok;
                        b = [tok];
                        break;
                    case 2: //[ ( {
                    	n = n.dn = {t:type,  p:pos, ws:ws, v:tok, pa:n.pa, up:n}, ws = "";
                    	n = n.ch = {pa: n};
                        break;
                    case 3: // } ) ]
                        if (!n.pa || n.pa.v != tok_close[tok])  {
                            err.push({t: "Error closing " + tok + " (opened with: " + (n.pa?n.pa.v:"NULL") + ")", pos: pos});
                        }
                    	if(n.pa){
	                    	n = n.pa, n.ch = n.ch.dn; 
	                    	if(n.ch) delete n.ch.up;
                    	}
	                    n = n.dn = {t:type,  p:pos, ws:ws, v:tok, pa:n.pa, up:n}, ws = "";
                        
                        break;
                    case 6: // \n
                    	ws += tok;
                    	lines[lines.length] = pos;
                        break;
                    case 9: // white space
                    	ws += tok;
                        break;
                    case 5:
                    	n = n.dn = {t:type,  p:pos, ws:ws, v:tok, pa:n.pa, up:n}, ws = "";
                    	if(opts.dict && parseFloat(tok)!=tok && tok!='toString' && tok!='valueOf' && tok != 'hasOwnProperty'){
                    		var d = opts.dict;
                    		(d[tok] || (d[tok] = [])).push(n);
                    	}
                        break;
                    default: // word
                    	n = n.dn = {t:type,  p:pos, ws:ws, v:tok, pa:n.pa, up:n}, ws = "";
                        break;
                }
            }
            else { //In comment or string mode
                b[b.length] = tok;
                switch (type) {
                    case 4: //String
                        if (mode_tok == tok){
                            mode_tok = 0;
                            n.v = b.join('');
                        }
                        break;
                    case 7: //Comment
                        if (tok == '*/' && mode_tok == '/*') {
                            mode_tok = 0;
                            if(opts.needcomment)
                            	n.v = b.join('');
                            else
                            	ws += b.join('');
                        } else if (tok == '*/' && mode_tok == '/') {
                            mode_tok = 0;
                           	n.v = b.join('');
                        }
                        break;
                    case 8: // regex
                        if(mode_tok == '/'){
                            mode_tok = 0;
                            n.v = b.join('');
                        }
                        break;
                    case 6: //New line
                        lines[lines.length] = pos;
                        if (mode_tok == '//'){
                            mode_tok = 0;
                            if(opts.needcomment)
                            	n.v = b.join('');
                            else
                            	ws += b.join('');
                        }
                        break;
                }
            }
            if(type<9)last_tok = tok;
        });
        if(mode_tok && mode_tok == '//'){
            if(opts.needcomment)
            	n.v = b.join('');
            else
            	ws += b.join('');
        }
        if(ws) n = n.dn = {t:0, p:str.length, ws:ws, v:"", pa:n.pa, up:n}, ws = "";
                
        while (n.pa){
            err.push({t: "Not closed: " + n.v, pos: n.p});
            n = n.pa, n.ch = n.ch.dn;
            if(n.ch) delete n.ch.up;
        }
        if (mode_tok)
            err.push({t: "Blockmode not closed of " + b[0], pos: n.p});
        if(root.dn){
	        root = root.dn; delete root.up;
        }
        root.lines = lines, root.err  = err;
	        
        return root;
    };
    
    return { parse: parse, store:store, find: find, replace:replace, dump: dump, serialize: serialize, line: lineLookup };
});
