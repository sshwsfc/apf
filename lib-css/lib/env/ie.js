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

require.modify(
    "lib-css", 
    "lib-css/ie", 
    ["lib-css", "envdetect", "envdetect/features"]
    function(css, env, features){

/**
 * This method retrieves the current value of a property on a HTML element
 * @param {HTMLElement} el    the element to read the property from
 * @param {String}      prop  the property to read
 * @returns {String}
 */
css.getStyle = function(el, prop) {
    return el.currentStyle[prop];
};

css.getWindowWidth = function(){
    return document.documentElement.offsetWidth - features.windowHorBorder;
}

css.getWindowHeight = function(){
    return document.documentElement.offsetHeight - features.windowVerBorder;
}

css.getHtmlLeft = function(oHtml){
    return (oHtml.offsetLeft
        - (env.isIE > 7 && parseInt(oHtml.parentNode.currentStyle["borderLeftWidth"]) || 0));
};

css.getHtmlRight = function(oHtml){
    var p;
    return (((p = oHtml.offsetParent).tagName == "BODY"
      ? apf.getWindowWidth()
      : p.offsetWidth)
        - oHtml.offsetLeft - oHtml.offsetWidth
        - (env.isIE < 8 && parseInt(p.currentStyle["borderLeftWidth"]) || 0)
        - (parseInt(p.currentStyle["borderRightWidth"]) || 0));
};

css.getHtmlTop = function(oHtml){
    return (oHtml.offsetTop
        - (apf.isIE > 7 && parseInt(oHtml.offsetParent.currentStyle["borderTopWidth"]) || 0));
};

css.getHtmlBottom = function(oHtml){
    var p;
    return (((p = oHtml.offsetParent).tagName == "BODY"
      ? apf.getWindowHeight()
      : p.offsetHeight)
        - oHtml.offsetTop - oHtml.offsetHeight
        - (env.isIE < 8 && parseInt(p.currentStyle["borderTopWidth"]) || 0)
        - (parseInt(p.currentStyle["borderBottomidth"]) || 0));
};

css.getBorderOffset = function(oHtml){
    return env.isIE < 8 && [0,0] || [parseInt(oHtml.currentStyle["borderLeftWidth"]) || 0,
            parseInt(oHtml.currentStyle["borderTopWidth"]) || 0]
};

css.getOpacity = function(oHtml) {
    return parseInt(((oHtml.currentStyle["filter"] || "").match(/alpha\(opacity=(\d*)\)/) || [0,0])[1]) / 100;
};

css.setOpacity = function(oHtml, value){
    oHtml.style.filter = value == 1
        ? ""
        : "alpha(opacity=" + Math.round(value * 100) + ")";
};

    }
);