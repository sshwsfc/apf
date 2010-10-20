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

define(["lib-css", "lib-css/non_ie"],
    function(css){

css.getHtmlLeft = function(oHtml){
    return oHtml.offsetLeft;
};

css.getHtmlRight = function(oHtml){
    var p;
    return (((p = oHtml.offsetParent).tagName == "BODY" 
      ? css.getWindowWidth()
      : p.offsetWidth)
        - oHtml.offsetLeft - oHtml.offsetWidth
        - (parseInt(css.getStyle(p, "borderLeftWidth")) || 0)
        - (parseInt(css.getStyle(p, "borderRightWidth")) || 0));
};

css.getHtmlTop = function(oHtml){
    return oHtml.offsetTop
};

css.getHtmlBottom = function(oHtml){
    var p;
    return (((p = oHtml.offsetParent).tagName == "BODY" 
      ? css.getWindowHeight()
      : p.offsetHeight)
        - oHtml.offsetTop - oHtml.offsetHeight
        - (parseInt(css.getStyle(p, "borderTopWidth")) || 0)
        - (parseInt(css.getStyle(p, "borderBottomWidth")) || 0));
};

css.getBorderOffset = function(oHtml){
    return [0,0];
};
    
    }
);