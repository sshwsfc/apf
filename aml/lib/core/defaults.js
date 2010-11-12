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

module.declare(function(require, exports, module){

/**
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.4
 */
var Defaults = function(struct, tagName){
    DOMElement.call(this, tagName || "services", this.NODE_HIDDEN, struct);
};

oop.inherit(Defaults, DOMElement);


(function(){
    this.$parsePrio = "002";
    //#ifdef __WITH_NAMESERVER
    this.$propHandlers["for"] = function(value){
        if (this.$lastFor)
            nameserver.remove("defaults_" + this.$lastFor, this);

        nameserver.add("defaults_" + value, this);
        this.$lastFor = value;
    }
    
    //@todo apf3.x how should this work?
    this.addEventListener("DOMNodeRemovedFromDocument", function(e){
        nameserver.remove("defaults_" + this.$lastFor, this);
    });
    //#endif
}).call(Defaults.prototype);

aml && aml.setElement("defaults", Defaults);


module.exports = Defaults;

});