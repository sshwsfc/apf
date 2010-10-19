define([
    "envdetect",
    "envdetect/features"],
    function(env, features){

return {
    /**
     * This method sets a single css rule
     * @param {String} name         the css name of the rule (i.e. '.cls' or '#id').
     * @param {String} type         the css property to change.
     * @param {String} value        the css value of the property.
     * @param {String} [stylesheet] the name of the stylesheet to change.
     */
    setStyleRule : function(name, type, value, stylesheet, win){
        name = name.toLowerCase();
        
        if (!stylesheet) {
            var sheets = (win || self).document.styleSheets;
            for (var j = sheets.length - 1; j >= 0; j--) {
                try {
                    var rules = sheets[j][features.styleSheetRules];
                    for (var i = 0; i < rules.length; i++) {
                        if (rules.item(i).selectorText.toLowerCase() == name) {
                            rules.item(i).style[type] = value;
                            return true;
                        }
                    }
                }
                catch(e){}
            }
        }
        else {
            var rules = (win || self).document.styleSheets[stylesheet || 0][features.styleSheetRules];
            for (var i = 0; i < rules.length; i++) {
                if (rules.item(i).selectorText.toLowerCase() == name) {
                    rules.item(i).style[type] = value;
                    return true;
                }
            }
        }
        
        return false;
    },
    
    /**
     * This method gets a single css rule
     * @param {String} name         the css name of the rule (i.e. '.cls' or '#id').
     * @param {String} type         the css property to change.
     * @param {String} [stylesheet] the name of the stylesheet to change.
     */
    getStyleRule : function(name, type, stylesheet, win){
        name = name.toLowerCase();
        
        if (!stylesheet) {
            var sheets = (win || self).document.styleSheets;
            for (var j = sheets.length - 1; j >= 0; j--) {
                try {
                    var rules = sheets[j][features.styleSheetRules];
                    for (var i = 0; i < rules.length; i++) {
                        if (rules.item(i).selectorText.toLowerCase() == name) {
                            return rules.item(i).style[type];
                        }
                    }
                }
                catch(e){}
            }
        }
        else {
            var rules = (win || self).document.styleSheets[stylesheet || 0][features.styleSheetRules];
            for (var i = 0; i < rules.length; i++) {
                if (rules.item(i).selectorText.toLowerCase() == name) {
                    return rules.item(i).style[type];
                }
            }
        }
        
        return false;
    },
    
    /**
     * This method retrieves the current value of a property on a HTML element
     * recursively. If the style isn't found on the element itself, it's parent is
     * checked.
     * @param {HTMLElement} el    the element to read the property from
     * @param {String}      prop  the property to read
     * @returns {String}
     */
    getStyleRecur : function(el, prop) {
        var value = features.hasComputedStyle
            ? document.defaultView.getComputedStyle(el,'').getPropertyValue(
                prop.replace(/([A-Z])/g, function(m, m1){
                    return "-" + m1.toLowerCase();
                }))
            : el.currentStyle[prop]
    
        return ((!value || value == "transparent" || value == "inherit")
          && el.parentNode && el.parentNode.nodeType == 1)
            ? this.getStyleRecur(el.parentNode, prop)
            : value;
    },
    
    /**
     * This method imports a stylesheet defined in a multidimensional array 
     * @param {Array}    def Required Multidimensional array specifying 
     * @param {Object}    win Optional Reference to a window
     * @method
     * @deprecated
     */    
    importStylesheet : function(def, win){
        for (var i = 0; i < def.length; i++) {
            if (!def[i][1]) continue;
            
            if (env.isIE)
                (win || window).document.styleSheets[0].addRule(def[i][0],
                    def[i][1]);
            else
                (win || window).document.styleSheets[0].insertRule(def[i][0]
                    + " {" + def[i][1] + "}", 0);
        }
    }
}

    }
);