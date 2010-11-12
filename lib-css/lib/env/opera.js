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
 
module.declare(function(require, exports, module) {

module.exports = function(){
	this.getHtmlLeft = function(oHtml){
	    return (oHtml.offsetLeft
	        - (parseInt(apf.getStyle(oHtml.parentNode, "borderLeftWidth")) || 0));
	};
	
	this.getHtmlRight = function(oHtml){
	    var p;
	    return (((p = oHtml.offsetParent).tagName == "BODY" 
	      ? this.getWindowWidth()
	      : p.offsetWidth)
	        - oHtml.offsetLeft - oHtml.offsetWidth
	        - (parseInt(this.getStyle(p, "borderRightWidth")) || 0));
	};
	
	this.getHtmlTop = function(oHtml){
	    return (oHtml.offsetTop
	        - (parseInt(this.getStyle(oHtml.offsetParent, "borderTopWidth")) || 0));
	};
	
	this.getHtmlBottom = function(oHtml){
	    var p;
	    return (((p = oHtml.offsetParent).tagName == "BODY" 
	      ? this.getWindowHeight()
	      : p.offsetHeight)
	        - oHtml.offsetTop - oHtml.offsetHeight
	        - (parseInt(this.getStyle(p, "borderBottomWidth")) || 0));
	};
	
	this.getBorderOffset = function(oHtml){
	    return [parseInt(apf.getStyle(oHtml, "borderLeftWidth")) || 0,
	            parseInt(apf.getStyle(oHtml, "borderTopWidth")) || 0]
	};
}

});