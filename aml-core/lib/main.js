require(["envdetect"], 
    function(env){

    var deps = [
        "lib-oop/class", 
        "w3cdom/node",
        "w3cdom/document",
        "optional!debug/console];

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
    }
};

DOMDocument.prototype.addEventListener("load", function(e){
    amlCore.documents.push(this);
})

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