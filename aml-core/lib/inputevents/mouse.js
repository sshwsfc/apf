module.declare(function(require, exports, module){
    
amlCore.addListener(document, "contextmenu", function(e){
    if (!e)
        e = event;

    //#ifdef __AMLCONTEXTMENU
    var pos, ev,
        amlNode = apf.findHost(e.srcElement || e.target)
          || FocusManager.activeElement
          || apf.document && apf.document.documentElement;

    if (amlNode && amlNode.localName == "menu") //The menu is already visible
        return false;


    //if (amlNode && amlNode.localName == "menu")
        //amlNode = amlNode.parentNode;

    if (apf.contextMenuKeyboard) {
        if (amlNode) {
            pos = amlNode.selected
                ? cssPos.getAbsolutePosition(amlNode.$selected)
                : cssPos.getAbsolutePosition(amlNode.$ext || amlNode.$pHtmlNode);
        }
        else {
            pos = [0, 0];
        }

        ev = {
            x         : pos[0] + 10 + document.documentElement.scrollLeft,
            y         : pos[1] + 10 + document.documentElement.scrollTop,
            amlNode   : amlNode,
            htmlEvent : e
        }
    }
    else {
        if (e.htmlEvent) {
            ev = e;
        }
        else {
            ev = { //@todo probably have to deduct the border of the window
                x         : e.clientX + document.documentElement.scrollLeft,
                y         : e.clientY + document.documentElement.scrollTop,
                htmlEvent : e
            }
        }
    }

    ev.bubbles = true; //@todo discuss this, are we ok with bubbling?

    apf.contextMenuKeyboard = null;

    if ((amlNode || apf).dispatchEvent("contextmenu", ev) === false
      || ev.returnValue === false) {
        if (e.preventDefault)
            e.preventDefault();
        return false;
    }
    //#endif

    if (apf.config.disableRightClick) {
        if (e.preventDefault)
            e.preventDefault();
        return false;
    }
});

amlCore.addListener(document, "mouseup", function(e){
    if (!e) e = event;
    
    apf.dispatchEvent("mouseup", {
        htmlEvent : e
    });
});

var ta = {"INPUT":1, "TEXTAREA":1, "SELECT":1};
amlCore.addListener(document, "mousedown", this.$mousedown = function(e){
    if (!e) e = event;
    var p,
        amlNode   = apf.findHost(e.srcElement || e.target);
        /*cEditable = amlNode && amlNode.liveedit
          // #ifdef __WITH_LIVEEDIT
          || (amlNode && amlNode.hasFeature(apf.__LIVEEDIT__))
          // #endif
        ;*/

    // #ifdef __WITH_POPUP
    if (apf.popup.last && (!amlNode || apf.popup.last != amlNode.$uniqueId) 
      && !apf.isChildOf(apf.popup.cache[apf.popup.last].content, e.srcElement || e.target, true))
        apf.popup.forceHide();
    // #endif

    if (amlNode === false) 
        amlNode = FocusManager.activeElement;

    //#ifdef __WITH_FOCUS
    //Make sure the user cannot leave a modal window
    if ((!amlNode || ((!amlNode.$focussable || amlNode.focussable === false)
      && amlNode.canHaveChildren != 2 && !amlNode.$focusParent))
      && apf.config.allowBlur) {
        lastFocusParent = null;
        if (FocusManager.activeElement)
            FocusManager.activeElement.blur();
    }
    else if (amlNode) { //@todo check this for documentElement apf3.0
        if ((p = FocusManager.activeElement
          && FocusManager.activeElement.$focusParent || lastFocusParent)
          && p.visible && p.modal && amlNode.$focusParent != p) {
            FocusManager.$focusLast(p, {mouse: true, ctrlKey: e.ctrlKey});
        }
        else if (!amlNode && FocusManager.activeElement) {
            FocusManager.$focusRoot();
        }
        else if (amlNode.$isWindowContainer == -1) {
            if (amlNode.$tabList.length)
                FocusManager.moveNext(null, amlNode.$tabList[0], null, {mouse: true, innerList: true});
            else
                FocusManager.$focus(amlNode);
        }
        else if ((amlNode.disabled == undefined || amlNode.disabled < 1) 
          && amlNode.focussable !== false) {
            if (amlNode.$focussable === FocusManager.KEYBOARD_MOUSE) {
                FocusManager.$focus(amlNode, {mouse: true, ctrlKey: e.ctrlKey});
            }
            else if (amlNode.canHaveChildren == 2) {
                if (!apf.config.allowBlur || !FocusManager.activeElement 
                  || FocusManager.activeElement.$focusParent != amlNode)
                    FocusManager.$focusLast(amlNode, {mouse: true, ctrlKey: e.ctrlKey});
            }
            else {
                FocusManager.$focusDefault(amlNode, {mouse: true, ctrlKey: e.ctrlKey});
            }
        }
        else {
            FocusManager.$focusDefault(amlNode, {mouse: true, ctrlKey: e.ctrlKey});
        }

        //#ifdef __WITH_WINDOW_FOCUS
        if (apf.hasFocusBug) {
            var isTextInput = (ta[e.srcElement.tagName]
                || e.srcElement.isContentEditable) && !e.srcElement.disabled
                || amlNode.$isTextInput
                && amlNode.$isTextInput(e) && amlNode.disabled < 1;

            if (!amlNode || !isTextInput)
                FocusClientWindow.$focusfix();
        }
        else if (!last) {
            FocusClientWindow.$focusevent();
        }
        //#endif
    }
    //#endif
    
    apf.dispatchEvent("mousedown", {
        htmlEvent : e,
        amlNode   : amlNode || apf.document.documentElement
    });

    //Non IE/ iPhone selection handling
    if (apf.isIE || apf.isIphone)
        return;

    var canSelect = !((!apf.document
      && (!apf.isParsingPartial || amlNode)
      || apf.dragMode) && !ta[e.target.tagName]);

    if (canSelect && amlNode) {
        if (!e.target && e.srcElement)
            e.target = {};
        var isTextInput = (ta[e.target.tagName]
            || e.target.contentEditable == "true") && !e.target.disabled  //@todo apf3.0 need to loop here?
            || amlNode.$isTextInput
            && amlNode.$isTextInput(e) && amlNode.disabled < 1;

        //(!amlNode.canHaveChildren || !apf.isChildOf(amlNode.$int, e.srcElement))
        if (!apf.config.allowSelect && !isTextInput
          && amlNode.nodeType != amlNode.NODE_PROCESSING_INSTRUCTION 
          && !amlNode.textselect) //&& (!amlNode.$int || amlNode.$focussable) //getElementsByTagNameNS(apf.ns.xhtml, "*").length
            canSelect = false;
    }
    
    if (!canSelect && e.button != 2) { // && !cEditable
        if (e.preventDefault)
            e.preventDefault();
       
        try{  
            if (document.activeElement && document.activeElement.contentEditable == "true") //@todo apf3.0 need to loop here?
                document.activeElement.blur();
	    }catch(e){}
    }
});

//IE selection handling
amlCore.addListener(document, "selectstart", function(e){
    if (!e) e = event;

    var canSelect = !(!apf.document
      && (!apf.isParsingPartial || amlNode)
      || apf.dragMode);
    
    var amlNode = apf.findHost(e.srcElement);
    if (canSelect) {
        //(!amlNode.canHaveChildren || !apf.isChildOf(amlNode.$int, e.srcElement))
        if (!apf.config.allowSelect 
          || amlNode && amlNode.nodeType != amlNode.NODE_PROCESSING_INSTRUCTION 
          && !amlNode.textselect) //&& !amlNode.$int // getElementsByTagNameNS(apf.ns.xhtml, "*").length
            canSelect = false;
    }

    if (!canSelect) {
        e.returnValue = false;
        return false;
    }
});

});