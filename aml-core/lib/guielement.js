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

require("aml-core").__GUIELEMENT__ = 1 << 15;

module.declare(function(require, exports, module){

/**
 * All elements inheriting from this {@link term.baseclass baseclass} are an aml component.
 *
 * @constructor
 * @baseclass
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.4
 *
 * @inherits apf.Anchoring
 * @inherits apf.DelayedRender
 * @inherits apf.DragDrop
 * @inherits apf.Focussable
 * @inherits apf.Interactive
 * @inherits apf.Transaction
 * @inherits apf.Validation
 *
 * @attribute {String} span     the number of columns this element spans. Only used inside a table element.
 * @attribute {String} margin   
 * @todo attribute align
 *
 * @attribute {mixed} left the left position of this element. Depending
 * on the choosen layout method the unit can be pixels, a percentage or an
 * expression.
 *
 * @attribute {mixed} top the top position of this element. Depending
 * on the choosen layout method the unit can be pixels, a percentage or an
 * expression.
 *
 * @attribute {mixed} right the right position of this element. Depending
 * on the choosen layout method the unit can be pixels, a percentage or an
 * expression.
 *
 * @attribute {mixed} bottom the bottom position of this element. Depending
 * on the choosen layout method the unit can be pixels, a percentage or an
 * expression.
 *
 * @attribute {mixed} width the different between the left edge and the
 * right edge of this element. Depending on the choosen layout method the
 * unit can be pixels, a percentage or an expression.
 * Remarks:
 * When used as a child of a grid element the width can also be set as '*'. 
 * This will fill the rest space.
 *
 * @attribute {mixed} height the different between the top edge and the
 * bottom edge of this element. Depending on the choosen layout method the
 * unit can be pixels, a percentage or an expression.
 * Remarks:
 * When used as a child of a grid element the height can also be set as '*'. 
 * This will fill the rest space.
 *
 * @event resize Fires when the element changes width or height. 
 * 
 * @event contextmenu Fires when the user requests a context menu. Either
 * using the keyboard or mouse.
 *   bubbles: yes
 *   cancelable:  Prevents the default contextmenu from appearing.
 *   object:
 *   {Number} x         the x coordinate where the contextmenu is requested on.
 *   {Number} y         the y coordinate where the contextmenu is requested on.
 *   {Event}  htmlEvent the html event object that triggered this event from being called.
 * @event focus       Fires when this element receives focus.
 * @event blur        Fires when this element loses focus.
 * @event keydown     Fires when this element has focus and the user presses a key on the keyboard.
 *   cancelable: Prevents the default key action.
 *   bubbles:
 *   object:
 *   {Boolean} ctrlKey   whether the ctrl key was pressed.
 *   {Boolean} shiftKey  whether the shift key was pressed.
 *   {Boolean} altKey    whether the alt key was pressed.
 *   {Number}  keyCode   which key was pressed. This is an ascii number.
 *   {Event}   htmlEvent the html event object that triggered this event from being called.
 */
GuiElement = function(){
    //this.$init(true);
    DOMElement.apply(this, arguments);
};

//Inherit
oop.inherits(GuiElement, DOMElement);

//Decorate
oop.decorate(GuiElement, Anchoring);
oop.decorate(GuiElement, ContentEditable);
oop.decorate(GuiElement, LiveEdit);

(function(){
    this.$regbase    = this.$regbase | apf.__GUIELEMENT__;
    
    this.$focussable = FocusManager.KEYBOARD_MOUSE; // Each GUINODE can get the focus by default
    this.visible     = true; //default value;
    
    /*this.minwidth   = 5;
    this.minheight  = 5;
    this.maxwidth   = 10000;
    this.maxheight  = 10000;*/
    
    //#ifdef __WITH_KEYBOARD
    this.$booleanProperties["disable-keyboard"] = true;
    //#endif
    this.$booleanProperties["visible"]          = true;
    this.$booleanProperties["focussable"]       = true;
    
    //#ifdef __WITH_INTERACTIVE
    this.$supportedProperties.push("draggable", "resizable");
    //#endif
    this.$supportedProperties.push(
        "focussable", "zindex", "disabled", "tabindex",
        "disable-keyboard", "contextmenu", "visible", "autosize", 
        "loadaml", "actiontracker", "alias",
        "width", "left", "top", "height", "tooltip"
    );

    this.$setLayout = function(type, insert){
        if (!this.$drawn || !this.$pHtmlNode)
            return false;

        if (this.parentNode) {
            // #ifdef __AMLTABLE
            if (this.parentNode.localName == "table") {
                if (this.$disableCurrentLayout)
                    this.$disableCurrentLayout();
                this.parentNode.register(this, insert);
                this.$disableCurrentLayout = null;
                return type == "table";
            }else
            // #endif

            // #ifdef __AMLVBOX || __AMLHBOX
            if ("vbox|hbox".indexOf(this.parentNode.localName) > -1) {
                if (this.$disableCurrentLayout)
                    this.$disableCurrentLayout();
                this.parentNode.register(this, insert);
                this.$disableCurrentLayout = null;
                return type == this.parentNode.localName;
            } //else
            // #endif
        }
        
        // #ifdef __WITH_ANCHORING
        if (!this.$anchoringEnabled) {
            if (this.$disableCurrentLayout)
                this.$disableCurrentLayout();
            this.$enableAnchoring();
            this.$disableCurrentLayout = this.$disableAnchoring;
        }
        return type == "anchoring";
        // #endif
    }
    
    this.addEventListener("DOMNodeInserted", function(e){
        if (e.currentTarget == this 
          && "vbox|hbox|table".indexOf(this.parentNode.localName) == -1) {
            this.$setLayout();
        }
    }); 

    if (!this.show) {
        /**
         * Makes the elements visible. Call-chaining is supported.
         */
        this.show = function(){
            this.setProperty("visible", true, false, true);
            return this;
        };
    }

    if (!this.hide) {
        /**
         * Makes the elements invisible. Call-chaining is supported.
         */
        this.hide = function(){
            this.setProperty("visible", false, false, true);
            return this;
        };
    }
    
    /**
     * Activates the functions of this element. Call-chaining is supported.
     */
    this.enable  = function(){
        this.setProperty("disabled", false, false, true);
        return this;
    };

    /**
     * Deactivates the functions of this element.
     * Call-chaining is supported.
     */
    this.disable = function(){
        this.setProperty("disabled", true, false, true);
        return this;
    };

    this.hasFocus = function(){}

    this.addEventListener("DOMNodeInsertedIntoDocument", function(e){
        var x = this.$aml;

        // will $pHtmlNode be deprecated soon?
        // check used to be:
        //if (!this.$pHtmlNode && this.parentNode)
        if (this.parentNode) {
            if (this.localName == "item" 
              && this.parentNode.hasFeature(apf.__MULTISELECT__)) //special case for item nodes, using multiselect rendering
                this.$pHtmlNode = this.parentNode.$container;
            else
                this.$pHtmlNode = this.parentNode.$int; //@todo apf3.0 change this in the mutation events
        }

        if (!this.$pHtmlNode) //@todo apf3.0 retry on DOMNodeInserted
            return;
        
        this.$pHtmlDoc  = this.$pHtmlNode.ownerDocument || document;

        if (this.$initSkin)
            this.$initSkin(x);

        if (this.$draw)
            this.$draw();

        if (e.id)
            this.$ext.setAttribute("id", e.id);

        if (typeof this.visible == "undefined")
            this.visible = true;

        // #ifdef __DEBUG
        if (apf.debug && this.$ext && this.$ext.nodeType)
            this.$ext.setAttribute("uniqueId", this.$uniqueId);
        // #endif

        //#ifdef __WITH_FOCUS
        if (this.$focussable && typeof this.focussable == "undefined")
            GuiElement.propHandlers.focussable.call(this);
        //#endif
        
        this.$drawn = true;
    }, true);
    
    var f = function(e){
        if (!this.$pHtmlNode) //@todo apf3.0 retry on DOMInsert or whatever its called
            return;
        
        this.$setLayout(); //@todo apf3.0 moving an element minwidth/height should be recalced
        
        //@todo apf3.0 set this also for skin change
        if (this.$ext) {
            var hasPres = (this.hasFeature(apf.__SKIN__)) || false;
            var type        = this.$isLeechingSkin ? this.localName : "main";
            if (this.minwidth == undefined)
                this.minwidth   = util.getCoord(hasPres && parseInt(this.$getOption(type, "minwidth")), 0);
            if (this.minheight == undefined)
                this.minheight  = util.getCoord(hasPres && parseInt(this.$getOption(type, "minheight")), 0);
            if (this.maxwidth == undefined)
                this.maxwidth   = util.getCoord(hasPres && parseInt(this.$getOption(type, "maxwidth")), 10000);
            if (this.maxheight == undefined)
                this.maxheight  = util.getCoord(hasPres && parseInt(this.$getOption(type, "maxheight")), 10000);

            //#ifdef __WITH_CONTENTEDITABLE
            //@todo slow??
            var diff = apf.getDiff(this.$ext);
            this.$ext.style.minWidth = Math.max(0, this.minwidth - diff[0]) + "px";
            this.$ext.style.minHeight = Math.max(0, this.minheight - diff[1]) + "px";
            this.$ext.style.maxWidth = Math.max(0, this.maxwidth - diff[0]) + "px";
            this.$ext.style.maxHeight = Math.max(0, this.maxheight - diff[1]) + "px";
            
            if (this.$altExt && apf.isGecko) {
                this.$altExt.style.minHeight = this.$ext.style.minHeight;
                this.$altExt.style.maxHeight = this.$ext.style.maxHeight;
                this.$altExt.style.minWidth = this.$ext.style.minWidth;
                this.$altExt.style.maxWidth = this.$ext.style.maxWidth;
            }
            //#endif
        }
        
        if (this.$loadAml)
            this.$loadAml(this.$aml); //@todo replace by event
    };
    
    this.addEventListener("DOMNodeInsertedIntoDocument", f);
    this.addEventListener("$skinchange", f);
    
    //#ifdef __WITH_RESIZE
    var f;
    this.addEventListener("$event.resize", f = function(c){
        apf.layout.setRules(this.$ext, "resize", "var o = apf.all[" + this.$uniqueId + "];\
            if (o) o.dispatchEvent('resize');", true);

        apf.layout.queue(this.$ext);
        //apf.layout.activateRules(this.$ext);
        this.removeEventListener("$event.resize", f);
    });
    //#endif
}).call(GuiElement.prototype);

/**
 * @for apf.amlNode
 * @private
 */
GuiElement.propHandlers = {
    /**
     * @attribute {Number} zindex the z ordered layer in which this element is
     * drawn.
     */
    "zindex": function(value){
        this.$ext.style.zIndex = value;
    },

    /**
     * @attribute {Boolean} visible whether this element is shown.
     */
    "visible": function(value){
        if (util.isFalse(value) || typeof value == "undefined") {
            if (this.$ext)
                this.$ext.style.display = "none";
            
            if (apf.document.activeElement == this || this.canHaveChildren
              && apf.isChildOf(this, apf.document.activeElement, false)) {
                if (apf.config.allowBlur && this.hasFeature(apf.__FOCUSSABLE__))
                    this.blur();
                else
                    FocusManager.moveNext();
            }
            
            this.visible = false;
        }
        else { //if (util.isTrue(value)) default
            if (this.$ext) {
                this.$ext.style.display = ""; //Some form of inheritance detection
                if (!this.$ext.offsetHeight)
                    this.$ext.style.display = this.$display || "";
            }
            
            //#ifdef __WITH_LAYOUT
            if (apf.layout && this.$int) //apf.hasSingleRszEvent)
                apf.layout.forceResize(this.$int);//this.$int
            //#endif
            
            this.visible = true;
        }
    },

    /**
     * @attribute {Boolean} disabled whether this element's functions are active.
     * For elements that can contain other this.NODE_VISIBLE elements this
     * attribute applies to all it's children.
     */
    "disabled": function(value){
        if (!this.$drawn) {
            var _self     = this;
            //this.disabled = false;

            apf.queue.add("disable" + this.$uniqueId, function(e){
                _self.disabled = value;
                GuiElement.propHandlers.disabled.call(_self, value);
            });
            return;
        }
        else
            apf.queue.remove("disable" + this.$uniqueId);

        //For child containers we only disable its children
        if (this.canHaveChildren) {
            //@todo Fix focus here first.. else it will jump whilst looping
            if (value != -1)
                value = this.disabled = util.isTrue(value);

            var nodes = this.childNodes;
            for (var node, i = 0, l = nodes.length; i < l; i++) {
                node = nodes[i];
                if (node.nodeFunc == this.NODE_VISIBLE) {
                    if (value && node.disabled != -1)
                        node.$disabled = node.disabled || false;
                    node.setProperty("disabled", value ? -1 : false);
                }
            }

            //this.disabled = undefined;
            if (this.$isWindowContainer)
                return;
        }

        if (value == -1 || value == false) {
            //value = true;
        }
        else if (typeof this.$disabled == "boolean") {
            if (value === null) {
                value = this.$disabled;
                this.$disabled = null;
            }
            else {
                this.$disabled = value || false;
                return;
            }
        }

        if (util.isTrue(value) || value == -1) {
            this.disabled = false;
            if (apf.document.activeElement == this) {
                FocusManager.moveNext(true); //@todo should not include window
                if (apf.document.activeElement == this)
                    this.$blur();
            }

            if (this.hasFeature(apf.__SKIN__))
                this.$setStyleClass(this.$ext, this.$baseCSSname + "Disabled");

            if (this.$disable)
                this.$disable();

            //#ifdef __WITH_XFORMS
            this.dispatchEvent("xforms-disabled");
            this.dispatchEvent("xforms-readonly");
            //#endif

            this.disabled = value;
        }
        else {
            if (this.hasFeature(apf.__DATABINDING__) && apf.config.autoDisable
              && !(!this.$bindings || this.xmlRoot))
                return false;

            this.disabled = false;

            if (apf.document.activeElement == this)
                this.$focus();

            if (this.hasFeature(apf.__SKIN__))
                this.$setStyleClass(this.$ext, null, [this.$baseCSSname + "Disabled"]);

            if (this.$enable)
                this.$enable();

            //#ifdef __WITH_XFORMS
            this.dispatchEvent("xforms-enabled");
            this.dispatchEvent("xforms-readwrite");
            //#endif
        }
    },

    /**
     * @attribute {Boolean} enables whether this element's functions are active.
     * For elements that can contain other this.NODE_VISIBLE elements this
     * attribute applies to all it's children.
     */
    "enabled" : function(value){
       this.setProperty("disabled", !value);
    },

    /**
     * @attribute {Boolean} disable-keyboard whether this element receives
     * keyboard input. This allows you to disable keyboard independently from
     * focus handling.
     */
    "disable-keyboard": function(value){
        this.disableKeyboard = util.isTrue(value);
    },
    
    /**
     * @attribute {String}  tooltip  the text displayed when a user hovers with 
     * the mouse over the element.
     */
    "tooltip" : function(value){
        this.$ext.setAttribute("title", value);
    },
    
    //Load subAML
    /**
     * @attribute {String} aml the {@link term.datainstruction data instruction} 
     * that loads new aml as children of this element.
     */
    "aml": function(value){
        this.replaceMarkup(value);
    }
};

module.exports = GuiElement;

    }
);