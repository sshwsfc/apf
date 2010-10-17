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

define([],function(){

/**
 * Element displaying a skinnable rectangle which can contain other 
 * aml elements. This element is used by other elements such as the 
 * toolbar and statusbar element to specify sections within those elements
 * which in turn can contain other aml elements.
 * Remarks:
 * This component is used in the accordion element to create its sections. In
 * the statusbar the panel element is an alias of bar.
 *
 * @constructor
 *
 * @define bar, panel, menubar
 * @attribute {String} icon the url pointing to the icon image.
 * @attribute {Boolean} collapsed   collapse panel on load, default is false
 * Possible values:
 *     true    panel is collapsed
 *     false   panel is not collapsed
 * @attribute {String} title   describes content in panel
 * @allowchild button
 * @allowchild {elements}, {anyaml}
 * @addnode elements
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.4
 */
apf.section = function(struct, tagName){
    this.$init(tagName || "section", this.NODE_VISIBLE, struct);
};

apf.menubar = function(struct, tagName){
    this.$init(tagName || "menubar", this.NODE_VISIBLE, struct);
};

apf.bar     = function(struct, tagName){
    this.$init(tagName || "bar", this.NODE_VISIBLE, struct);
};

/**
 * Element displaying a bar containing buttons and other aml elements.
 * This element is usually positioned in the top of an application allowing
 * the user to choose from grouped buttons.
 * Example:
 * <code>
 *  <a:menu id="menu5">
 *      <a:item>About us</a:item>
 *      <a:item>Help</a:item>
 *  </a:menu>
 *  <a:menu id="menu6">
 *      <a:item icon="email.png">Tutorials</a:item>
 *      <a:item>Live Helps</a:item>
 *      <a:divider></a:divider>
 *      <a:item>Visit Ajax.org</a:item>
 *      <a:item>Exit</a:item>
 *  </a:menu>
 *  <a:window 
 *    id          = "winMail"
 *    contextmenu = "menu6"
 *    width       = "300"
 *    height      = "200" 
 *    visible     = "true"
 *    resizable   = "true" 
 *    title       = "Mail message"
 *    icon        = "email.png">
 *      <a:toolbar>
 *          <a:menubar>
 *              <a:button submenu="menu6">File</a:button>
 *              <a:button submenu="menu5">Edit</a:button>
 *          </a:menubar>
 *      </a:toolbar>
 *  </a:window>
 * </code>
 *
 * @constructor
 * @define toolbar
 * @addnode elements
 * @allowchild bar, menubar
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.4
 *
 * @inherits apf.Presentation
 */
apf.toolbar = function(struct, tagName){
    this.$init(tagName || "toolbar", this.NODE_VISIBLE, struct);
};

/**
 * Element displaying a bar consisting of bars containing other text, icons
 * and more aml. This element is usually placed in the bottom of the screen to 
 * display context sensitive and other information about the state of the 
 * application.
 * Example:
 * <code>
 *  <a:statusbar>
 *      <a:section icon="application.png">Ajax.org</a:section>
 *      <a:section>Some status information</a:section>
 *      <a:section>
 *          <a:progressbar anchors="6 5 5 5" autostart="true" />
 *      </a:section>
 *  </a:statusbar>
 * </code>
 *
 * @constructor
 * @define statusbar
 * @allowchild bar
 * @allowchild progressbar
 * @addnode elements
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.9
 */
apf.statusbar = function(struct, tagName){
    this.$init(tagName || "statusbar", this.NODE_VISIBLE, struct);
};

/**
 * Element displaying a divider. For use in toolbars, menu's and such.
 * @define divider
 * @constructor
 */
apf.divider = function(struct, tagName){
    this.$init(tagName || "divider", this.NODE_VISIBLE, struct);
};

(function(){
    this.$focussable     = false;
    this.$canLeechSkin   = true;
    this.$isLeechingSkin = false;
    
    /** 
     * @attribute {String} caption the text displayed in the area defined by this 
     * element. 
     */
    this.$supportedProperties.push("caption");
    this.$propHandlers["caption"] = function(value){
        if (this.$caption) {
            this.$setStyleClass(this.$ext, this.$baseCSSname + "Caption");
            (this.$caption || this.$int).innerHTML = value;
        }
        else {
            this.$setStyleClass(this.$ext, "", [this.$baseCSSname + "Caption"]);
        }
    };
    
    //@todo apf3.0 refactor
    this.addEventListener("AMLReparent", 
        function(beforeNode, pNode, withinParent){
            if (!this.$amlLoaded)
                return;

            if (this.$isLeechingSkin && !withinParent
              && this.skinName != pNode.skinName
              || !this.$isLeechingSkin
              && this.parentNode.$hasLayoutNode 
              && this.parentNode.$hasLayoutNode(this.localName)) {
                this.$isLeechingSkin = true;
                this.$forceSkinChange(this.parentNode.skinName.split(":")[0] + ":" + skinName);
            }
        });

    this.$draw = function(){
        //if (this.parentNode.isPaged && this.parentNode.$buttons)
            //this.$pHtmlNode = this.parentNode.$buttons;
        
        //Build Main Skin
        this.$ext = this.$getExternal(this.$isLeechingSkin
            ? this.localName 
            : "main");

        this.$caption = this.$getLayoutNode("main", "caption", this.$ext);

        //Draggable area support, mostly for a:toolbar
        if (this.oDrag) //Remove if already exist (skin change)
            this.oDrag.parentNode.removeChild(this.oDrag);
        
        this.oDrag = this.$getLayoutNode(this.$isLeechingSkin
            ? this.localName 
            : "main", "dragger", this.$ext);
            
        this.$int = this.$getLayoutNode(this.$isLeechingSkin
            ? this.localName 
            : "main", "container", this.$ext);
    };

    this.$loadAml = function(x){
        
    };
    
    /*#ifdef __WITH_SKIN_CHANGE
    this.$skinchange = function(){
        
    }
    //#endif*/
}).call(apf.bar.prototype = new apf.Presentation());

apf.menubar.prototype   = 
apf.section.prototype   = 
apf.toolbar.prototype   = 
apf.statusbar.prototype = 
apf.divider.prototype   = apf.bar.prototype;

apf.aml.setElement("bar", apf.bar);
apf.aml.setElement("menubar", apf.menubar);
apf.aml.setElement("section", apf.section);
apf.aml.setElement("toolbar", apf.toolbar);
apf.aml.setElement("statusbar", apf.statusbar);
apf.aml.setElement("divider", apf.divider);

});