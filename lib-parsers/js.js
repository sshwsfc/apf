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
        for (var n = t; n!=null; n = n.next) {
            if ( n.type == 2)
                dump( n.child, s, l+1);
            else if(n.type!=3)
                s.push(Array(l).join('----'), n.type, " ", n.token, "\n");
        }
        if(!l) return s.join('');
    }
    
    function serialize(t, s, l){
        if(!s) s = [];
        if(!l) l = 0;
        for (var n = t; n; n = n.next) {
        	s.push( n.ws + n.token );
            if (n.type == 2)
                serialize( n.child, s, l + 1 );
        }
        if(!l) return s.join('');
	}

    function match(t1, t2){
		for(var n1 = t1, n2 = t2; (n1 && n2); n1 = n1.next, n2 = n2.next){
			if(n2.token == '{' && n2.child && n2.child.type==8){
				if(!n2.rx) 
					n2.rx = new RegExp(n2.child.token.slice(1,-1));
				
				if(!n1.token.match( n2.rx ))
					break;
				if(!n2.next)console.log(n2);
				
				n2 = n2.next;
			} else {
    			if(n1.token != n2.token)
    				break;
    			if(n2.type == 2){ // we (should)have children
    				if(n2.child){
    					var m = match( n1.child, n2.child);
    					if(!m) break;
    					if(!n2.next) return m;
    				}
					if(!n2.next) return n1.child;
    			}
			}
    	}
		if(!n2)
			return t1;
    }
    
    function scan(t1, t2, deep, results, l){
    	if(!results) results = [];
    	if(!l) l = 0;
    	
    	for (var n = t1; n; n = n.next) {
    		var m = match(n, t2);
        	
    		if(m)
    			results.push(m);
    		if(n.type == 2 && deep){
        		if(deep!=1 || 
        		  !(n.token=='{' && n.prev/*(*/ && n.prev.prev/*)*/ && n.prev.prev.prev/*function*/ && 
        		  (n.prev.prev.prev.token=='function' || (n.prev.prev.prev.prev && n.prev.prev.prev.prev.token=='function'))))
        			scan(n.child, t2, deep, results, l+1);
        	}
        }
    	if(!l)return results;
    }
    
    function find(what, deep){
     	var args = what.split("#");
     	var set = [this];
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
    
    function parse(str, needcomment){
        var root = {},     // parse tree root node
            n = root,
        	b = 0,      // block output
            depth = 0,
            type = 0,   // token type
            mode_tok = 0, // parsemode, contains char of block we parse
            n,          // tempvar
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
                        if (pre_regex[last_tok] || (n.prev && pre_regex[n.prev.token])) {
                            mode_tok = tok;
                            n = n.next = {type:type, find:find, pos:pos, ws:ws, token:tok, parent:n.parent, prev:n, depth:n.depth}, ws = "";
                            b = [tok];
                        } else 
                        	n = n.next = {type:type, find:find, pos:pos, ws:ws, token:tok, parent:n.parent, prev:n, depth:n.depth}, ws = "";
                        break;                
                    case 7: //Comment
                    	if(needcomment)
                    		n = n.next = {type:type, find:find, pos:pos, ws:ws, token:tok, parent:n.parent, prev:n, depth:n.depth}, ws = "";
                		mode_tok = tok;
                        b = [tok];
                        break;
                    case 4: //String 
                    	n = n.next = {type:type, find:find, pos:pos, ws:ws, token:tok, parent:n.parent, prev:n, depth:n.depth}, ws = "";
                        mode_tok = tok;
                        b = [tok];
                        break;
                    case 2: //[ ( {
                    	n = n.next = {type:type, find:find, pos:pos, ws:ws, token:tok, parent:n.parent, prev:n, depth:n.depth}, ws = "";
                    	n = n.child = {parent: n, depth: depth+1};
                        break;
                    case 3: // } ) ]
                        if (n.parent.token != tok_close[tok])  {
                            err.push({t: "Error closing " + tok + " (opened with: " + n.parent.token + ")", pos: pos, toString: errToString});
                        }
                        else {
                        	n.parent.last = n, n = n.parent, depth--, n.child = n.child.next; 
                        	if(n.child) delete n.child.prev;
                        	n = n.next = {type:type, find:find, pos:pos, ws:ws, token:tok, parent:n.parent, prev:n, depth:n.depth}, ws = "";
                        }
                        break;
                    case 6: // \n
                    	ws += tok;
                    	lines[lines.length] = pos;
                        break;
                    case 9: // white space
                    	ws += tok;
                        break;
                    default: // word
                    	n = n.next = {type:type, find:find, pos:pos, ws:ws, token:tok, parent:n.parent, prev:n, depth:n.depth}, ws = "";
                        break;
                }
            }
            else { //In comment or string mode
                b[b.length] = tok;
                switch (type) {
                    case 4: //String
                        if (mode_tok == tok){
                            mode_tok = 0;
                            n.token = b.join('');
                        }
                        break;
                    case 7: //Comment
                        if (tok == '*/' && mode_tok == '/*') {
                            mode_tok = 0;
                            if(needcomment)
                            	n.token = b.join('');
                            else
                            	ws += b.join('');
                        } else if (tok == '*/' && mode_tok == '/') {
                            mode_tok = 0;
                           	n.token = b.join('');
                        }
                        break;
                    case 8: // regex
                        if(mode_tok == '/'){
                            mode_tok = 0;
                            n.token = b.join('');
                        }
                        break;
                    case 6: //New line
                        lines[lines.length] = pos;
                        if (mode_tok == '//'){
                            mode_tok = 0;
                            if(needcomment)
                            	n.token = b.join('');
                            else
                            	ws += b.join('');
                        }
                        break;
                }
            }
            if(type<9)last_tok = tok;
        });
        if(ws) n = n.next = {type:0, id:"", find:find, pos:str.length, ws:ws, token:"", parent:n.parent, prev:n, depth:n.depth}, ws = "";
                
        while (n.parent){
            err.push({t: "Not closed: " + n.token, pos: n.pos});
            n.parent.last = n, n = n.parent, n.child = n.child.next;
            if(n.child) delete n.child.prev;
        }
        if (mode_tok)
            err.push({t: "Blockmode not closed of " + b[0], pos: formatPos(lines,n.pos)});
        
        root = root.next; delete root.prev;
        root.lines = lines, root.err  = err;
        
        return root;
    };
    
    return { parse: parse, dump: dump, serialize: serialize, line: lineLookup };
});
