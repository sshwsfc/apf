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
	var dump = function( o, opt, s, d, r ){
		if(!s)s = [], r = [], d = 0; 
		opt = opt || {};
		var k, tabs1, tabs2, nl, l = s.length, i, j, t;
		switch(typeof(o)){
			case 'object': 
				if(o==null){
					s[l++] = "null"; break;
				}
				if(d>=(opt.depth || 99)){
					s[l++] = "{...}";break;
				}
				r.push(o);
				if(opt.pack)
					tabs1 = tabs2 = nl = "";
				else
					tabs1 = Array(d+2).join('\t'), tabs2 = Array(d+1).join('\t'), nl = "\n";
					
				if(o.constructor == Array){
					s[l++] = "[", s[l++] = nl;
					for(k = 0; k<o.length; k++){
						s[l++] = tabs1;
						if(!opt.notest)for(i = 0, t = o[k], j = r.length;i<j;i++)
							if(r[i] == t) break;
						if(i == j)
							dump(t, opt, s, d+1, r);
						else 
							s[l++] = "[nested: "+i+"]";
						l = s.length;
						s[l++]=", "+nl;
					}
					s[l-1] = nl+tabs2+"]";
				} else {
					s[l++] = "{", s[l++] = nl;
					for(k in o){
						s[l++] = tabs1 + (k.match(/[^a-zA-Z0-9_]/)?'"'+k+'"':k) + ':';
						if(!opt.notest)for(i = 0, t = o[k], j = r.length;i<j;i++)
							if(r[i] == t) break;
						if(i == j) 
							dump(t, opt, s, d+1, r);
						else 
							s[l++] = "[nested: "+i+"]";
						l = s.length;
						s[l++] = ", "+nl;
					}
					s[l-1] = nl + tabs2 + "}";
				}
				r.pop();
				break;
			case 'string':
				s[l++]='"' + o.replace(/(["\\])/g, '\\$1').replace(/\r?\n/g,"\\n") + '"';
				break;
			default:
				s.push(o);
				break;
		}
		return d?0:s.join('');
	};
	return dump;
});
