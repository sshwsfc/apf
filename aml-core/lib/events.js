fireEvent : function(el, type, e, capture){
        if (el.dispatchEvent)
            el.dispatchEvent(type, e, capture);
        else
            el.fireEvent("on" + type, e);
    },
    
    addListener : function(el, type, fn){
        if (el.addEventListener)
            el.addEventListener(type, fn, false);
        else if (el.attachEvent)
            el.attachEvent("on" + type, fn);
        return this;
    },
    
    removeListener : function(el, type, fn){
        if (el.removeEventListener)
            el.removeEventListener(type, fn, false);
        else if (el.detachEvent)
            el.detachEvent("on" + type, fn);
        return this;
    },

    stopEvent: function(e){
        this.stopPropagation(e).preventDefault(e);
        return false;
    },

    stopPropagation: function(e){
        if (e.stopPropagation)
            e.stopPropagation();
        else
            e.cancelBubble = true;
        return this;
    },

    preventDefault: function(e){
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
        return this;
    },