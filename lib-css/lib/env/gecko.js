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

define(function(require, exports, module){

return function() {
	this.getHtmlLeft = function(oHtml){
	    return (oHtml.offsetLeft
	        + (parseInt(this.getStyle(oHtml.parentNode, "borderLeftWidth")) || 0));
	};
	
	this.getHtmlRight = function(oHtml){
	    var p;
	    return (((p = oHtml.offsetParent).tagName == "BODY" 
	      ? this.getWindowWidth()
	      : p.offsetWidth)
	        - oHtml.offsetLeft - oHtml.offsetWidth
	        - (2 * (parseInt(this.getStyle(p, "borderLeftWidth")) || 0))
	        - (parseInt(this.getStyle(p, "borderRightWidth")) || 0));
	};
	
	this.getHtmlTop = function(oHtml){
	    return (oHtml.offsetTop
	        + (parseInt(this.getStyle(oHtml.parentNode, "borderTopWidth")) || 0));
	};
	
	this.getHtmlBottom = function(oHtml){
	    var p;
	    return (((p = oHtml.offsetParent).tagName == "BODY" 
	      ? this.getWindowHeight()
	      : p.offsetHeight)
	        - oHtml.offsetTop - oHtml.offsetHeight
	        - (2 * (parseInt(this.getStyle(p, "borderTopWidth")) || 0))
	        - (parseInt(this.getStyle(p, "borderBottomWidth")) || 0));
	};
	
	this.getBorderOffset = function(oHtml){
	    return [-1 * (parseInt(this.getStyle(oHtml, "borderLeftWidth")) || 0),
	        -1 * (parseInt(this.getStyle(oHtml, "borderTopWidth")) || 0)];
	};
	
});