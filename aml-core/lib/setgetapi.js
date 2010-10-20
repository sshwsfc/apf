define(["aml-core/guielement", "lib-oop"],
    function(GuiElement, oop){
        
/**** Convenience functions for gui nodes ****/
oop.mixin(GuiElement, {

    /**** Geometry ****/

    /**
     * Sets the different between the left edge and the right edge of this
     * element. Depending on the choosen layout method the unit can be
     * pixels, a percentage or an expression.
     * Call-chaining is supported.
     * @param {Number} value the new width of this element.
     */
    setWidth : function(value){
        this.setProperty("width", value, false, true);
        return this;
    },

    /**
     * Sets the different between the top edge and the bottom edge of this
     * element. Depending on the choosen layout method the unit can be
     * pixels, a percentage or an expression.
     * Call-chaining is supported.
     * @param {Number} value the new height of this element.
     */
    setHeight : function(value){
        this.setProperty("height", value, false, true);
        return this;
    },

    /**
     * Sets the left position of this element. Depending on the choosen
     * layout method the unit can be pixels, a percentage or an expression.
     * Call-chaining is supported.
     * @param {Number} value the new left position of this element.
     */
    setLeft   : function(value){
        this.setProperty("left", value, false, true);
        return this;
    },

    /**
     * Sets the top position of this element. Depending on the choosen
     * layout method the unit can be pixels, a percentage or an expression.
     * Call-chaining is supported.
     * @param {Number} value the new top position of this element.
     */
    setTop    : function(value){
        this.setProperty("top", value, false, true);
        return this;
    },

    /**
     * Retrieves the calculated width in pixels for this element
     */
    getWidth  : function(){
        return (this.$ext || {}).offsetWidth;
    },

    /**
     * Retrieves the calculated height in pixels for this element
     */
    getHeight : function(){
        return (this.$ext || {}).offsetHeight;
    },

    /**
     * Retrieves the calculated left position in pixels for this element
     * relative to the offsetParent.
     */
    getLeft   : function(){
        return (this.$ext || {}).offsetLeft;
    },

    /**
     * Retrieves the calculated top position in pixels for this element
     * relative to the offsetParent.
     */
    getTop    : function(){
        return (this.$ext || {}).offsetTop;
    },

    /**** z-Index ****/

    /**
     * Moves this element to the lowest z ordered level.
     * Call-chaining is supported.
     */
    sendToBack : function(){
        this.setProperty("zindex", 0, false, true);
        return this;
    },

    /**
     * Moves this element to the highest z ordered level.
     * Call-chaining is supported.
     */
    bringToFront  : function(){
        this.setProperty("zindex", apf.all.length + 1, false, true);
        return this;
    },

    /**
     * Moves this element one z order level deeper.
     * Call-chaining is supported.
     */
    sendBackwards : function(){
        this.setProperty("zindex", this.zindex - 1, false, true);
        return this;
    },

    /**
     * Moves this element one z order level higher.
     * Call-chaining is supported.
     */
    bringForward  : function(){
        this.setProperty("zindex", this.zindex + 1, false, true);
        return this;
    }
});

});