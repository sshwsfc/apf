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
    "lib-css/non_ie",
    ["lib-css", "envdetect"]
    function(css, env){

/**
 * This method retrieves the current value of a property on a HTML element
 * @param {HTMLElement} el    the element to read the property from
 * @param {String}      prop  the property to read
 * @returns {String}
 */
css.getStyle = function(el, prop) {
    return (window.getComputedStyle(el, "") || {})[prop] || "";
};

css.getWindowWidth = function(){
    return window.innerWidth;
}

css.getWindowHeight = function(){
    return window.innerHeight;
}

css.getOpacity = function(oHtml) {
    return css.getStyle(oHtml, "opacity");
};

css.setOpacity = function(oHtml, value){
    oHtml.style.opacity = value;
};

    }
);