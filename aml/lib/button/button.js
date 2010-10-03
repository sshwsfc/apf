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

require.def(["aml-core/base/basebutton", "optional!aml", "lib-oop"], 
    function(aml, BaseButton, oop){

/**
 * Element displaying a clickable rectangle that visually confirms to the
 * user when the area is clicked and then executes a command.
 *
 * @constructor
 * @define button, submit, trigger, reset
 * @addnode elements
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.4
 *
 * @inherits apf.BaseButton
 */
function Button(struct, tagName){
    BaseButton.call(this, struct, tagName || "button", this.NODE_VISIBLE);
};

//Inherit
oop.inherits(Button, BaseButton);

(function() {
    this.$useExtraDiv;
    this.$childProperty  = "caption";
    this.$inited         = false;
    this.$isLeechingSkin = false;
    this.$canLeechSkin   = true;

    /**** Properties and Attributes ****/

    this.$focussable = true; // This object can get the focus
    this.value       = null;
    
    this.$init(function(){
        //@todo reparenting
        var forceFocus, _self = this, lastDefaultParent;
        this.$propHandlers["default"] = function(value){
            if (parseInt(value) != value)
                value = util.isTrue(value) ? 1 : 0;

            this["default"] = parseInt(value);
            
            if (!this.focussable && value || forceFocus)
                this.setAttribute("focussable", forceFocus = value);

            if (lastDefaultParent) {
                lastDefaultParent.removeEventListener("focus", setDefault);
                lastDefaultParent.removeEventListener("blur", removeDefault);
            }
            
            if (!value)
                return;

            var pNode = this.parentNode;
            while (pNode && !pNode.focussable && value--)
                pNode = pNode.parentNode;
                
            //Currrently only support for parentNode, this might need to be expanded
            if (pNode) {
                pNode.addEventListener("focus", setDefault);
                pNode.addEventListener("blur", removeDefault);
            }
        };
    
        function setDefault(e){
            if (e.defaultButtonSet || e.returnValue === false)
                return;
    
            e.defaultButtonSet = true;
    
            if (this.$useExtraDiv)
                _self.$ext.appendChild(Button.$extradiv);
    
            _self.$setStyleClass(_self.$ext, _self.$baseCSSname + "Default");
    
            if (e.srcElement != _self && _self.$focusParent) {
                _self.$focusParent.addEventListener("keydown", btnKeyDown);
            }
        }
    
        function removeDefault(e){
            if (this.$useExtraDiv && Button.$extradiv.parentNode == _self.$ext)
                _self.$ext.removeChild(Button.$extradiv);
    
            _self.$setStyleClass(_self.$ext, "", [_self.$baseCSSname + "Default"]);
    
            if (e.srcElement != _self && _self.$focusParent) {
                _self.$focusParent.removeEventListener("keydown", btnKeyDown);
            }
        }
    
        function btnKeyDown(e){
            var ml;
    
            var f = apf.document.activeElement;
            if (f) {
                if (f.hasFeature(apf.__MULTISELECT__))
                    return;
    
                ml = f.multiline;
            }
    
            if (!_self.$ext.onmouseup)
                return;
    
            if (ml && ml != "optional" && e.keyCode == 13
              && e.ctrlKey || (!ml || ml == "optional")
              && e.keyCode == 13 && !e.ctrlKey && !e.shiftKey && !e.altKey)
                _self.$ext.onmouseup(e.htmlEvent, true);
        }
    
        this.addEventListener("focus", setDefault);
        this.addEventListener("blur", removeDefault);
        
        this.$enable = function(){
            if (this["default"]) {
                setDefault({});
                if (apf.document.activeElement)
                    apf.document.activeElement.focus(true);
            }
            
            if (this.state && this.value)
                this.$setState("Down", {});
            else if (this.$mouseOver)
                this.$updateState({}, "mouseover");
            else
                this.$doBgSwitch(1);
        };
    
        this.$disable = function(){
            if (this["default"])
                removeDefault({});
    
            this.$doBgSwitch(4);
            this.$setStyleClass(this.$ext, "",
                [this.$baseCSSname + "Over", this.$baseCSSname + "Down"]);
        };
    });

    /**
     * @attribute {String}  icon     the url from which the icon image is loaded.
     * @attribute {Boolean} state    whether this boolean is a multi state button.
     * @attribute {String}  value    the initial value of a state button.
     * @attribute {String}  color    the text color of the caption of this element.
     * @attribute {String}  caption  the text displayed on this element indicating the action when the button is pressed.
     * @attribute {String}  action   one of the default actions this button can perform when pressed.
     *   Possible values:
     *   undo     Executes undo on the action tracker of the target element.
     *   redo     Executes redo on the action tracker of the target element.
     *   remove   Removes the selected node(s) of the target element.
     *   add      Adds a node to the target element.
     *   rename   Starts the rename function on the target element.
     *   login    Calls log in on the auth element with the values of the textboxes of type username and password.
     *   logout   Calls lot out on the auth element.
     *   submit   Submits the data of a model specified as the target.
     *   ok       Executes a commitTransaction() on the target element, and closes or hides that element.
     *   cancel   Executes a rollbackTransaction() on the target element, and closes or hides that element.
     *   apply    Executes a commitTransaction() on the target element.
     *   close    Closes the target element.
     * @attribute {String}  target   id of the element to apply the action to. Defaults to the parent container.
     * @attribute {Number}  default  Search depth for which this button is the default action. 1 specifies the direct parent. 2 the parent of this parent. Et cetera.
     * @attribute {String}  submenu  the name of the contextmenu to display when the button is pressed.
     */
    //this.$booleanProperties["default"] = true;
    this.$booleanProperties["state"]   = true;
    this.$supportedProperties.push("icon", "value", "tooltip", "state",
        "color", "caption", "action", "target", "default", "submenu", "hotkey");

    this.$propHandlers["icon"] = function(value){
        // #ifdef __DEBUG
        if (!this.oIcon)
            return apf.console.warn("No icon defined in the Button skin", "button");
        /* #else
        if (!this.oIcon) return;
        #endif */

        if (value)
            this.$setStyleClass(this.$ext, this.$baseCSSname + "Icon");
        else
            this.$setStyleClass(this.$ext, "", [this.$baseCSSname + "Icon"]);

        apf.skins.setIcon(this.oIcon, value, this.iconPath);
    };

    this.$propHandlers["value"] = function(value){
        if (!this.state && !this.submenu)
            return;
        
        if (value === undefined)
            value = !this.value;
        this.value = value;

        if (this.value)
            this.$setState("Down", {});
        else
            this.$setState("Out", {});
    };

    this.$propHandlers["state"] = function(value){
        if (value)
            this.$setStateBehaviour(this.value);
        else 
            this.$setNormalBehaviour();
    };

    this.$propHandlers["color"] = function(value){
        if (this.oCaption)
            this.oCaption.parentNode.style.color = value;
    };

    this.$propHandlers["caption"] = function(value){
        if (!this.oCaption)
            return;

        if (value)
            this.$setStyleClass(this.$ext, "", [this.$baseCSSname + "Empty"]);
        else
            this.$setStyleClass(this.$ext, this.$baseCSSname + "Empty");

        if (this.oCaption.nodeType == 1)
            this.oCaption.innerHTML = String(value || "").trim();
        else
            this.oCaption.nodeValue = String(value || "").trim();
    };

    //#ifdef __WITH_HOTKEY
    /**
     * @attribute {String} hotkey the key combination a user can press
     * to active the function of this element. Use any combination of
     * Ctrl, Shift, Alt, F1-F12 and alphanumerical characters. Use a
     * space, a minus or plus sign as a seperator.
     * Example:
     * <code>
     *  <a:button hotkey="Ctrl-Z">Undo</a:button>
     * </code>
     */
    this.$propHandlers["hotkey"] = function(value){
        if (this.$hotkey)
            apf.setNodeValue(this.$hotkey, value);

        if (this.$lastHotkey)
            hotkey.remove(this.$lastHotkey);

        if (value) {
            this.$lastHotkey = value;
            var _self = this;
            hotkey.register(value, function(){
                //hmm not very scalable...
                _self.$setState("Over", {});

                $setTimeout(function(){
                    _self.$setState("Out", {});
                }, 200);

                if (_self.$clickHandler && _self.$clickHandler())
                    _self.$updateState (e || event, "click");
                else
                    _self.dispatchEvent("click");
            });
        }
    }
    //#endif

    //#ifdef __AMLTOOLBAR || __INC_ALL

    //@todo move this to menu.js
    function menuKeyHandler(e){
        return;
        var key = e.keyCode;

        var next, nr = apf.getChildNumber(this);
        if (key == 37) { //left
            next = nr == 0
                ? this.parentNode.childNodes.length - 1
                : nr - 1;
            this.parentNode.childNodes[next].dispatchEvent("mouseover");
        }
        else if (key == 39) { //right
            next = (nr >= this.parentNode.childNodes.length - 1)
                ? 0
                : nr + 1;
            this.parentNode.childNodes[next].dispatchEvent("mouseover");
        }
    }

    function menuDown(e){
        var menu = self[this.submenu];

        this.value = !this.value;

        if (this.value)
            this.$setState("Down", {});

        //#ifdef __DEBUG
        if (!menu) {
            throw new Error(apf.formatErrorString(0, this,
                "Showing submenu",
                "Could not find submenu '" + this.submenu + "'"));
        }
        //#endif

        if (!this.value) {
            menu.hide();
            this.$setState("Over", {}, "toolbarover");

            this.parentNode.menuIsPressed = false;
            if (this.parentNode.hasMoved)
                this.value = false;

            if (apf.hasFocusBug)
                apf.window.$focusfix();

            return false;
        }

        this.parentNode.menuIsPressed = this;

        //var pos = apf.getAbsolutePosition(this.$ext, menu.$ext.offsetParent);
        menu.display(null, null, false, this,
            null, null, this.$ext.offsetWidth - 2);

        this.parentNode.hasMoved = false;

        if (e)
            amlCore.stopPropagation(e.htmlEvent);

        return false;
    }

    function menuOver(){
        var menuPressed = this.parentNode.menuIsPressed;

        if (!menuPressed || menuPressed == this)
            return;

        menuPressed.setValue(false);
        var oldMenu = self[menuPressed.submenu];
        oldMenu.$propHandlers["visible"].call(oldMenu, false, true);//.hide();

        this.setValue(true);
        this.parentNode.menuIsPressed = this;

        var menu = self[this.submenu];

        //#ifdef __DEBUG
        if (!menu) {
            throw new Error(apf.formatErrorString(0, this,
                "Showing submenu",
                "Could not find submenu '" + this.submenu + "'"));
        }
        //#endif

        var pos = apf.getAbsolutePosition(this.$ext, menu.$ext.offsetParent);

        menu.display(pos[0],
            pos[1] + this.$ext.offsetHeight, true, this,
            null, null, this.$ext.offsetWidth - 2);

        //apf.window.$focus(this);
        this.$focus();

        this.parentNode.hasMoved = true;

        return false;
    }

    /**
     * @attribute {string} submenu If this attribute is set, the button will
     * function like a menu button
     */
    this.$propHandlers["submenu"] = function(value){
        if (!value){
            if (this.value && this.parentNode)
                menuDown.call(this);

            this.$focussable = true;
            this.$setNormalBehaviour();
            this.removeEventListener("mousedown", menuDown);
            this.removeEventListener("mouseover", menuOver);
            this.removeEventListener("keydown", menuKeyHandler, true);
            return;
        }

        this.$focussable = false;
        this.$setStateBehaviour();

        this.addEventListener("mousedown", menuDown);
        this.addEventListener("mouseover", menuOver);
        this.addEventListener("keydown", menuKeyHandler, true);
    };
    //#endif

    /**** Public Methods ****/

    //#ifdef __WITH_CONVENIENCE_API

    /**
     * Sets the value of this element. This should be one of the values
     * specified in the values attribute.
     * @param {String} value the new value of this element
     */
    this.setValue = function(value){
        this.setProperty("value", value, false, true);
    };
    
    this.showMenu = function(){
        if (this.submenu && !this.value)
            menuDown.call(this);
    }
    
    this.hideMenu = function(){
        if (this.submenu && this.value)
            menuDown.call(this);
    }

    /**
     * Sets the text displayed as caption of this element.
     *
     * @param  {String}  value  required  The string to display.
     * @see    baseclass.validation
     */
    this.setCaption = function(value){
        this.setProperty("caption", value, false, true);
    };

    /**
     * Sets the URL of the icon displayed on this element.
     *
     * @param  {String}  value  required  The URL to the location of the icon.
     * @see    element.button
     * @see    element.modalwindow
     */
    this.setIcon = function(url){
        this.setProperty("icon", url, false, true);
    };
    
    //#endif

    /**** Private state methods ****/

    this.$setStateBehaviour = function(value){
        this.value     = value || false;
        this.isBoolean = true;
        this.$setStyleClass(this.$ext, this.$baseCSSname + "Bool");

        if (this.value) {
            this.$setStyleClass(this.$ext, this.$baseCSSname + "Down");
            this.$doBgSwitch(this.states["Down"]);
        }
    };

    this.$setNormalBehaviour = function(){
        this.value     = null;
        this.isBoolean = false;
        this.$setStyleClass(this.$ext, "", [this.$baseCSSname + "Bool"]);
    };

    this.$setState = function(state, e, strEvent){
        //if (this.disabled)
            //return;

        if (strEvent && this.dispatchEvent(strEvent, {htmlEvent: e}) === false)
            return;

        this.$doBgSwitch(this.states[state]);
        var bs = this.$baseCSSname;
        this.$setStyleClass(this.$ext, (state != "Out" ? bs + state : ""),
            [(this.value ? "" : bs + "Down"), bs + "Over"]);

        if (this.submenu) {
            bs = this.$baseCSSname + "menu";
            this.$setStyleClass(this.$ext, (state != "Out" ? bs + state : ""),
            [(this.value ? "" : bs + "Down"), bs + "Over"]);
        }

        //if (state != "Down")
            //e.cancelBubble = true;
    };

    this.$clickHandler = function(){
        // This handles the actual OnClick action. Return true to redraw the button.
        if (this.isBoolean && !this.submenu) {
            this.setProperty("value", !this.value);
            return true;
        }
    };

    //#ifdef __AMLTOOLBAR || __INC_ALL
    this.$submenu = function(hide, force){
        if (hide) {
            this.setValue(false);
            this.$setState("Out", {}, "mouseout");
            this.parentNode.menuIsPressed = false;
        }
    };
    //#endif

    /**** Init ****/

    this.$draw  = function(){
        var pNode, isToolbarButton = (pNode = this.parentNode).localName == "toolbar" 
            || pNode.parentNode && pNode.parentNode.localName == "toolbar";
        
        if (isToolbarButton) {
            if (typeof this.focussable == "undefined")
                this.focussable = false;
            
            this.$focussable = apf.KEYBOARD;
        }

        //Build Main Skin
        this.$ext     = this.$getExternal();
        this.oIcon    = this.$getLayoutNode("main", "icon", this.$ext);
        this.oCaption = this.$getLayoutNode("main", "caption", this.$ext);

        this.$useExtraDiv = util.isTrue(this.$getOption("main", "extradiv"));
        if (!Button.$extradiv && this.$useExtraDiv) {
            (Button.$extradiv = document.createElement("div"))
                .className = "extradiv"
        }

        if (this.localName == "submit")
            this.action = "submit";
        else if (this.localName == "reset")
            this.action = "reset";

        this.$setupEvents();
    };

    //#ifdef __WITH_SKIN_CHANGE
    this.addEventListener("$skinchange", function(){
        if (this.caption)
            this.$propHandlers["caption"].call(this, this.caption);

        if (this.icon)
            this.$propHandlers["icon"].call(this, this.icon);

        this.$updateState({reset:1});
        //this.$blur();

        //if (this.$focussable !== true && this.hasFocus())
            //apf.window.$focusLast(this.$focusParent);
    });
    //#endif

    //#ifdef __ENABLE_BUTTON_ACTIONS
    //@todo solve how this works with XForms
    this.addEventListener("click", function(e){
        var action = this.action;

        //#-ifdef __WITH_HTML5
        if (!action)
            action = this.localName;
        //#-endif

        var _self = this;
        $setTimeout(function(){
            (Button.actions[action] || apf.K).call(_self);
        });
    });
    //#endif
}).call(Button.prototype);

aml && aml.setElement("button",  Button);

return Button;

    }
);