module.declare(function(require, exports, module){

// Keyboard forwarding to focussed object
amlCore.addListener(document, "keyup", function(e){ //this.$keyup = 
    if (!e) e = event;

    //#ifdef __WITH_KEYBOARD
    var ev = {
        keyCode  : e.keyCode,
        ctrlKey  : e.ctrlKey,
        shiftKey : e.shiftKey,
        altKey   : e.altkey,
        htmlEvent: e,
        bubbles  : true //@todo is this much slower?
    };
    
    var aEl = focusManager.activeElement;
    if ((aEl && !aEl.disableKeyboard
      ? aEl.dispatchEvent("keyup", ev)
      : apf.dispatchEvent("keyup", ev)) === false) {
        amlCore.preventDefault(e);
        return false;
    }
    //#endif
});


//var browserNavKeys = {32:1,33:1,34:1,35:1,36:1,37:1,38:1,39:1,40:1}

amlCore.addListener(document, "keyup", function(e){
    e = e || event;

    if (e.ctrlKey && e.keyCode == 9 && focusManager.activeElement) {
        var w = focusManager.activeElement.$focusParent;
        if (w.modal) {
            if (e.preventDefault)
                e.preventDefault();
            return false;
        }

        FocusManager.moveNext(e.shiftKey,
            focusManager.activeElement.$focusParent, true);

        w = focusManager.activeElement.$focusParent;
        if (w && w.bringToFront)
            w.bringToFront();
        
        if (e.preventDefault)
            e.preventDefault();
        return false;    
    }
});

//@todo optimize this function
amlCore.addListener(document, "keydown", function(e){ //this.$keydown = 
    e = e || event;

    //#ifdef __WITH_DEBUG_WIN
    if (e.keyCode == 120 || e.ctrlKey && e.altKey && e.keyCode == 68) {
        apf.$debugwin.activate();
    }
    //#endif

    //#ifdef __AMLCONTEXTMENU
    if (e.keyCode == 93)
        apf.contextMenuKeyboard = true;
    // #endif

    var amlNode           = focusManager.activeElement, //apf.findHost(e.srcElement || e.target),
        htmlNode          = (e.explicitOriginalTarget || e.srcElement || e.target),
        isTextInput = (ta[htmlNode.tagName]
          || htmlNode.contentEditable || htmlNode.contentEditable == "true")  //@todo apf3.0 need to loop here?
          && !htmlNode.disabled
          || amlNode && amlNode.$isTextInput
          && amlNode.$isTextInput(e) && amlNode.disabled < 1;

    //#ifdef __WITH_ACTIONTRACKER && __WITH_UNDO_KEYS
    //@todo move this to appsettings and use with_hotkey
    var o,
        ctrlKey = env.isMac ? e.metaKey : e.ctrlKey;
    if (!isTextInput && apf.config.undokeys && ctrlKey) {
        //Ctrl-Z - Undo
        if (e.keyCode == 90) {
            o = focusManager.activeElement;
            while (o && !o.getActionTracker && !o.$at)
                o = o.parentNode;
            if (!o) o = apf.window;
            (o.$at || o.getActionTracker()).undo();
        }
        //Ctrl-Y - Redo
        else if (e.keyCode == 89) {
            o = focusManager.activeElement;
            while (o && !o.getActionTracker && !o.$at)
                o = o.parentNode;
            if (!o) o = apf.window;
            (o.$at || o.getActionTracker()).redo();
        }
    }
    //#endif

    var eInfo = {
        ctrlKey    : e.ctrlKey,
        metaKey    : e.metaKey,
        shiftKey   : e.shiftKey,
        altKey     : e.altKey,
        keyCode    : e.keyCode,
        htmlEvent  : e,
        isTextInput: isTextInput,
        bubbles    : true
    };
    
    delete eInfo.currentTarget;
    //#ifdef __WITH_KEYBOARD
    //Keyboard forwarding to focussed object
    var aEl = amlNode; //isTextInput ? amlNode :
    if ((aEl && !aEl.disableKeyboard && !aEl.editable
      ? aEl.dispatchEvent("keydown", eInfo) 
      : apf.dispatchEvent("keydown", eInfo)) === false) {
        amlCore.stopEvent(e);
        if (apf.canDisableKeyCodes) {
            try {
                e.keyCode = 0;
            }
            catch(e) {}
        }
        return false;
    }
    //#ifdef __WITH_FOCUS
    //Focus handling
    else if ((!apf.config.disableTabbing || focusManager.activeElement) && e.keyCode == 9) {
        //Window focus handling
        if (e.ctrlKey && focusManager.activeElement) {
            var w = focusManager.activeElement.$focusParent;
            if (w.modal) {
                if (e.preventDefault)
                    e.preventDefault();
                return false;
            }

            FocusManager.moveNext(e.shiftKey,
                focusManager.activeElement.$focusParent, true);

            w = focusManager.activeElement.$focusParent;
            if (w && w.bringToFront)
                w.bringToFront();
        }
        //Element focus handling
        else if(!focusManager.activeElement || focusManager.activeElement.tagName != "menu") {
            FocusManager.moveNext(e.shiftKey);
        }

        if (e.preventDefault)
            e.preventDefault();
        return false;
    }
    //#endif

    //Disable backspace behaviour triggering the backbutton behaviour
    var altKey = env.isMac ? e.metaKey : e.altKey;
    if (apf.config.disableBackspace
      && e.keyCode == 8// || (altKey && (e.keyCode == 37 || e.keyCode == 39)))
      && !isTextInput) {
        if (apf.canDisableKeyCodes) {
            try {
                e.keyCode = 0;
            }
            catch(e) {}
        }
        e.returnValue = false;
    }

    //Disable space behaviour of scrolling down the page
    /*if(Application.disableSpace && e.keyCode == 32 && e.srcElement.tagName.toLowerCase() != "input"){
        e.keyCode = 0;
        e.returnValue = false;
    }*/

    //Disable F5 refresh behaviour
    if (apf.config.disableF5 && (e.keyCode == 116 || e.keyCode == 117)) {
        if (apf.canDisableKeyCodes) {
            try {
                e.keyCode = 0;
            }
            catch(e) {}
        }
        else {
            e.preventDefault();
            e.stopPropagation();
        }
        //return false;
    }
    
    
    /*if (browserNavKeys[e.keyCode] && focusManager.activeElement 
      && apf.config.autoDisableNavKeys)
        e.returnValue = false;*/

    if (e.keyCode == 27)
        e.returnValue = false;

    if (!apf.config.allowSelect
      && e.shiftKey && (e.keyCode > 32 && e.keyCode < 41)
      && !isTextInput) {
        e.returnValue = false;
    }

    //apf.dispatchEvent("keydown", null, eInfo);

    if (e.returnValue === false && e.preventDefault)
        e.preventDefault();

    return e.returnValue;
    //#endif
});

});