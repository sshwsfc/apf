require(["envdetect"], 
    function(env){

    var deps = [
        "lib-oop/class", 
        "w3cdom/node",
        "w3cdom/document",
        "optional!debug/console"];

    if (env.isIE)
        deps.push("aml-core/env/ie");
    else {
        deps.push("aml-core/env/non_ie.js");
        if (env.isGecko)
            deps.push("aml-core/env/gecko");
        else if (env.isWebkit)
            deps.push("aml-core/env/webkit");
        else if (env.isOpera)
            deps.push("aml-core/env/opera");
    }

    require.def("aml-core", deps, 
        function(Class, DOMNode, DOMDocument, console){

var amlCore = {
    documents : [],
    
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
    
    /**
     * @private
     * THIS IS A HACK - will be removed in refactor of mouse routing
     */
    cancelBubble : function(e, o, noPropagate){
        if (e.stopPropagation)
            e.stopPropagation()
        else 
            e.cancelBubble = true;
        // #ifdef __WITH_FOCUS
        //if (o.$focussable && !o.disabled)
            //apf.window.$focus(o);
        // #endif
        
        /*if (apf.isIE)
            o.$ext.fireEvent("on" + e.type, e);
        else 
            o.$ext.dispatchEvent(e.name, e);*/
        
        if (!noPropagate) {
            if (o && o.$ext && o.$ext["on" + (e.type || e.name)])
                o.$ext["on" + (e.type || e.name)](e);
            apf.window.$mousedown(e);
        }
        
        //#ifdef __WITH_UIRECORDER
        if (apf.uirecorder && apf.uirecorder.captureDetails 
          && (apf.uirecorder.isRecording || apf.uirecorder.isTesting)) {
            apf.uirecorder.capture[e.type](e);
        }
        //#endif
    },
    
    /**
     * Attempt to fix memory leaks
     * @private
     */
    destroyHtmlNode : function (element) {
        if (!element) return;
    
        if (!apf.isIE || element.ownerDocument != document) {
            if (element.parentNode)
                element.parentNode.removeChild(element);
            return;
        }
    
        var garbageBin = document.getElementById('IELeakGarbageBin');
        if (!garbageBin) {
            garbageBin    = document.createElement('DIV');
            garbageBin.id = 'IELeakGarbageBin';
            garbageBin.style.display = 'none';
            document.body.appendChild(garbageBin);
        }
    
        // move the element to the garbage bin
        garbageBin.appendChild(element);
        garbageBin.innerHTML = '';
    }
};

DOMDocument.prototype.addEventListener("beforeload", function(e){
    amlCore.documents.push(this);
    
    amlCore.dispatchEvent("createdocument", {document: this});
});

events.addListener(window, "beforeunload", function(){
    amlCore.documents.each(function(doc){
        var ret = doc.dispatchEvent("beforeunload");
    });
    return ret;
});

events.addListener(window, "unload", function(){
    //#ifdef __DEBUG
    console && console.info("Unloading AML Core...");
    //#endif

    DOMNode.isDestroying = true;

    //@todo this is a hack should be refactored
    var node,
        i = 0,
        l = Class.all.length;
    for (; i < l; i++) {
        node = Class.all[i];
        if (node && node != exclude && node.destroy && !node.apf)
            node.destroy(false);
    }

    DOMNode.isDestroying = false;
    DOMNode.destroyed    = false;
});

return amlCore;

    })
});