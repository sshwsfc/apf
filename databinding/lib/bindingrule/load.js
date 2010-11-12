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
 * @todo docs
 */
var BindingLoadRule = function(struct, tagName){
    BindingRule.call(this, tagName, this.NODE_HIDDEN, struct);
};

oop.inherit(BindingLoadRule, BindingRule);


(function(){
    //1 = force no bind rule, 2 = force bind rule
    this.$attrExcludePropBind = Object.extend({
        get   : 1
    }, this.$attrExcludePropBind);

    this.$propHandlers["get"] = function(value, prop){
        delete this["c" + prop];
    }
}).call(BindingLoadRule.prototype);

aml && aml.setElement("load", BindingLoadRule);
aml && aml.setElement("insert", BindingLoadRule);

module.exports = BindingLoadRule;

});
