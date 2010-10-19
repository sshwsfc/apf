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

define(["w3cdom/element", "xinclude", "optional!aml", "lib-oop"], 
    function(DOMElement, xinclude, aml, oop){

/**
 * Defines a list of acceptable values
 */
XiFallback = function(struct, tagName){
    DOMElement.call(this, tagName || "fallback", this.NODE_HIDDEN, struct);
};

oop.inherit(XiInclude, DOMElement);

XiFallback.prototype = new apf.DOMElement();
XiFallback.prototype.$parsePrio = "002";

xinclude.setElement("fallback", XiFallback);
aml && aml.setElement("fallback", XiFallback);

return XiFallback;

});