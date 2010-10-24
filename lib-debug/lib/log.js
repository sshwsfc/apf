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

define([], function(){
	return function( txt ){
		// lets find our log div
		var e = document.getElementById('_logw');
		if(!e){
			// lets inject it
         var t = "<div id='_log' style='width:100%;height:500px;overflow-y:scroll;overflow-x:scroll;white-space:break-word;background-color:black;color:gray;font-family:courier;font-size:8pt;'></div>";
         if(!document.body.insertAdjacentHTML)
             document.body.innerHTML += t;
         else
             document.body.insertAdjacentHTML("beforeend",t); 
			e = document.getElementById('_log');
		}
		if(e){
			var t = (txt+'').replace(/\</g, "&lt;").replace(/\</g, "&gt;").replace(/\n/g, "<br/>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;")+"<br/>";
         if(!e.insertAdjacentHTML)
             e.innerHTML += t;
         else
             e.insertAdjacentHTML("beforeend", t);
			e.scrollTop = e.scrollHeight;
		}
		return txt;
	}
});
