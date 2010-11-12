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
 * element specifying which menu is shown when a
 * contextmenu is requested by a user for a aml node.
 * Example:
 * This example shows a list that shows the mnuRoot menu when the user
 * right clicks on the root {@link term.datanode data node}. Otherwise the mnuItem menu is
 * shown.
 * <code>
 *  <a:list>
 *      <a:contextmenu menu="mnuRoot" match="[root]" />
 *      <a:contextmenu menu="mnuItem" />
 *  </a:list>
 * </code>
 * @attribute {String} menu   the id of the menu element.
 * @attribute {String} select the xpath executed on the selected element of the databound element which determines whether this contextmenu is shown.
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.4
 */
var Contextmenu = function(){
	DOMElement.call(this, "contextmenu", this.NODE_HIDDEN);
};

oop.inherits(Contextmenu, DOMElement);

(function(){
    this.$amlNodes = [];
    
    //1 = force no bind rule, 2 = force bind rule
    this.$attrExcludePropBind = Object.extend({
        "match" : 1
    }, this.$attrExcludePropBind);
    
    this.register = function(amlParent){
        if (!amlParent.contextmenus)
            amlParent.contextmenus = [];
        amlParent.contextmenus.push(this);
    };
    
    this.unregister = function(amlParent){
        amlParent.contextmenus.remove(this);
    };
    
    this.addEventListener("DOMNodeInsertedIntoDocument", function(e){
        this.register(this.parentNode);
    });
}).call(Contextmenu.prototype);

aml && aml.setElement("contextmenu", Contextmenu);

// #endif



    //#ifdef __AMLCONTEXTMENU
    this.addEventListener("contextmenu", function(e){
        // #ifdef __WITH_CONTENTEDITABLE
        if (this.editable) { //@todo when the event system is done proper this should be handled in ce2.js
            e.returnValue  = false;
            e.cancelBubble = true;
            return false;
        }
        // #endif
        
        if (!this.contextmenus) return;
        
        if (this.hasFeature(apf.__DATABINDING__)) {
            var contextmenu;
            var xmlNode = this.hasFeature(apf.__MULTISELECT__)
                ? this.selected
                : this.xmlRoot;

            var i, l, m, isRef, sel, menuId, cm, result;
            for (i = 0, l = this.contextmenus.length; i < l; i++) {
                isRef  = (typeof (cm = this.contextmenus[i]) == "string");
                result = null;
                if (!isRef && cm.match && xmlNode) {//@todo apf3.0 cache this statement
                    result = (cm.cmatch || (cm.cmatch = apf.lm.compile(cm.match, {
                        xpathmode  : 3,
                        injectself : true
                    })))(xmlNode)
                }

                if (isRef || xmlNode && result || !cm.match) { //!xmlNode && 
                    menuId = isRef
                        ? cm
                        : cm.menu

                    if (!self[menuId]) {
                        // #ifdef __DEBUG
                        throw new Error(apf.formatErrorString(0, this,
                            "Showing contextmenu",
                            "Could not find contextmenu by name: '" + menuId + "'"),
                            this.$aml);
                        // #endif
                        
                        return;
                    }

                    self[menuId].display(e.x, e.y, null, this, xmlNode);

                    e.returnValue  = false;//htmlEvent.
                    e.cancelBubble = true;
                    break;
                }
            }

            //IE6 compatiblity
            /*
            @todo please test that disabling this is OK
            if (!apf.config.disableRightClick) {
                document.oncontextmenu = function(){
                    document.oncontextmenu = null;
                    e.cancelBubble = true;
                    return false;
                }
            }*/
        }
        else {
            menuId = typeof this.contextmenus[0] == "string"
                ? this.contextmenus[0]
                : this.contextmenus[0].getAttribute("menu")

            if (!self[menuId]) {
                // #ifdef __DEBUG
                throw new Error(apf.formatErrorString(0, this,
                    "Showing contextmenu",
                    "Could not find contextmenu by name: '" + menuId + "'",
                    this.$aml));
                // #endif
                
                return;
            }

            self[menuId].display(e.x, e.y, null, this);

            e.returnValue = false;//htmlEvent.
            e.cancelBubble = true;
        }
    });
    
module.exports = Contextmenu;

});    
    
GuiElement.propHandlers = {
    //#ifdef __AMLCONTEXTMENU
    /**
     * @attribute {String} contextmenu the name of the menu element that will
     * be shown when the user right clicks or uses the context menu keyboard
     * shortcut.
     * Example:
     * <code>
     *  <a:menu id="mnuExample">
     *      <a:item>test</a:item>
     *      <a:item>test2</a:item>
     *  </a:menu>
     *   
     *  <a:list 
     *    contextmenu = "mnuExample" 
     *    width       = "200" 
     *    height      = "150" />
     *  <a:bar 
     *    contextmenu = "mnuExample" 
     *    width       = "200" 
     *    height      = "150" />
     * </code>
     */
    "contextmenu": function(value){
        this.contextmenus = [value];
    }
    //#endif
}