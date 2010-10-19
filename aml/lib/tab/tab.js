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

define(["aml-core/basetab", "optional!aml", "lib-oop"], function(BaseTab, aml, oop){

/**
 * Element displaying a page and several buttons allowing a
 * user to switch between the pages. Each page can contain
 * arbitrary aml. Each page can render it's content during
 * startup of the application or when the page is activated.
 * Example:
 * <code>
 *  <a:tab id="tab" width="300" height="100">
 *      <a:page caption="General">
 *          <a:checkbox>Example</a:checkbox>
 *          <a:button>Example</a:button>
 *      </a:page>
 *      <a:page caption="Advanced">
 *          <a:checkbox>Test checkbox</a:checkbox>
 *          <a:checkbox>Test checkbox</a:checkbox>
 *          <a:checkbox>Test checkbox</a:checkbox>
 *      </a:page>
 *      <a:page caption="Ajax.org">
 *          <a:checkbox>This ok?</a:checkbox>
 *          <a:checkbox>This better?</a:checkbox>
 *      </a:page>
 *  </a:tab>
 * </code>
 *
 * @constructor
 * @define tab, pages, switch
 * @allowchild page
 * @addnode elements
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.1
 *
 * @inherits apf.BaseTab
 */
var Tab       = function(struct, tagName){
    this.$hasButtons = true;
    this.$init(tagName || "tab", this.NODE_VISIBLE, struct);
};

(function(){
    this.$focussable = FocusManager.KEYBOARD; // This object can get the focus from the keyboard

    /**** Init ****/

    this.$draw = function(bSkinChange){
        //Build Main Skin
        this.$ext = this.$getExternal();
        this.$loadChildren();
    };
}).call(Tab.prototype);

aml && aml.setElement("tab",    Tab);


return Tab;

});