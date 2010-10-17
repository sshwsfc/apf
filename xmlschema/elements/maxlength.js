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

define(["aml-core/xsdelement", "optional!aml", "lib-oop"], function(XsdElement, aml, oop){
/**
 * Specifies the maximum number of characters or list items allowed. Must be equal to or greater than zero
 */
var XsdMaxLength = function(struct, tagName){
    XsdElement.call(this, tagName || "maxlength", this.NODE_HIDDEN, struct);
};

oop.inherit(XsdMaxLength, XsdElement);


(function(){
    this.$propHandlers["value"] = function(){
        this.parentNode.$recompile();
    };
    
    //@todo This should also check for list items
    this.$compile = function(stack){
        stack.push("if (value.length > " + this.value + ") return false;");
    };
}).call(XsdMaxLength.prototype);

apf.xsd.setElement("maxlength", apf.XsdMaxLength);

return XsdMaxLength;

});