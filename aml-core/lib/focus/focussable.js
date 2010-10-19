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

apf.__FOCUSSABLE__ = 1 << 26;

define([
    "aml-core/focus/manager",
    "aml-core/presentation", 
    "aml-core/guielement",
    "lib-oop"], 
    function(focusManager, Presentation, GuiElement, oop){
    
var Focussable = function(){
    this.$regbase = this.$regbase | apf.__FOCUSSABLE__;

    if (this.disabled == undefined)
        this.disabled = false;
    
    /**
     * Sets the position in the list that determines the sequence
     * of elements when using the tab key to move between them.
     * Call-chaining is supported.
     * @param {Number} tabindex the position in the list
     */
    this.setTabIndex = function(tabindex){
        focusManager.$removeFocus(this);
        focusManager.$addFocus(this, tabindex);
        return this;
    };

    /**
     * Gives this element the focus. This means that keyboard events
     * are send to this element.
     */
    this.focus = function(noset, e, nofix){
        if (!noset) {
            if (this.$isWindowContainer > -1) {
                focusManager.$focusLast(this, e, true);
            }
            else {
                focusManager.$focus(this, e);

                //#ifdef __WITH_WINDOW_FOCUS
                if (!nofix && apf.hasFocusBug)
                    focusManager.$focusfix();
                //#endif
            }

            return this;
        }

        if (this.$focus && !this.editable)
            this.$focus(e);

        this.dispatchEvent("focus", Object.extend({
            bubbles    : true
        }, e));
        return this;
    };

    /**
     * Removes the focus from this element.
     * Call-chaining is supported.
     */
    this.blur = function(noset, e){
        //#ifdef __WITH_POPUP
        if (apf.popup.isShowing(this.$uniqueId))
            apf.popup.forceHide(); //This should be put in a more general position
        //#endif
        
        if (this.$blur)
            this.$blur(e);

        if (!noset)
            focusManager.$blur(this);

        this.dispatchEvent("blur", Object.extend({
            bubbles    : !e || !e.cancelBubble
        }, e));
        return this;
    };

    /**
     * Determines whether this element has the focus
     * @returns {Boolean} indicating whether this element has the focus
     */
    this.hasFocus = function(){
        return apf.document.activeElement == this || this.$isWindowContainer
            && (apf.document.activeElement || {}).$focusParent == this;
    };
};

oop.mixin(Presentation.prototype, {
    $focus : function(){
        if (!this.$ext)
            return;

        this.$setStyleClass(this.oFocus || this.$ext, this.$baseCSSname + "Focus");
    },

    $blur : function(){
        //#ifdef __WITH_RENAME
        if (this.renaming)
            this.stopRename(null, true);
        //#endif

        if (!this.$ext)
            return;

        this.$setStyleClass(this.oFocus || this.$ext, "", [this.$baseCSSname + "Focus"]);
    },

    $fixScrollBug : function(){
        if (this.$int != this.$ext)
            this.oFocus = this.$int;
        else {
            this.oFocus =
            this.$int   =
                this.$ext.appendChild(document.createElement("div"));

            this.$int.style.height = "100%";
            this.$int.className = "focusbug"
        }
    }
});

/**
 * @attribute {Boolean} focussable whether this element can receive the focus.
 * The focussed element receives keyboard event.s
 */
GuiElement.propHandlers.focussable = function(value){
    this.focussable = typeof value == "undefined" || value;

    if (!this.hasFeature(apf.__FOCUSSABLE__)) //@todo should this be on the prototype
        oop.decorate(this, Focussable);

    if (this.focussable) {
        focusManager.$addFocus(this, this.tabindex);
    }
    else {
        focusManager.$removeFocus(this);
    }
};

return Focussable;

});