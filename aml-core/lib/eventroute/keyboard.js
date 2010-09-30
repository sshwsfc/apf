
    // Keyboard forwarding to focussed object
    apf.addListener(document, "keyup", this.$keyup = function(e){
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
        
        var aEl = apf.document && apf.document.activeElement;
        if ((aEl && !aEl.disableKeyboard
          ? aEl.dispatchEvent("keyup", ev)
          : apf.dispatchEvent("keyup", ev)) === false) {
            apf.preventDefault(e);
            return false;
        }
        //#endif
    });

    
    //var browserNavKeys = {32:1,33:1,34:1,35:1,36:1,37:1,38:1,39:1,40:1}
    
    apf.addListener(document, "keyup", function(e){
        e = e || event;

        if (e.ctrlKey && e.keyCode == 9 && apf.document.activeElement) {
            var w = apf.document.activeElement.$focusParent;
            if (w.modal) {
                if (e.preventDefault)
                    e.preventDefault();
                return false;
            }

            apf.window.moveNext(e.shiftKey,
                apf.document.activeElement.$focusParent, true);

            w = apf.document.activeElement.$focusParent;
            if (w && w.bringToFront)
                w.bringToFront();
            
            if (e.preventDefault)
                e.preventDefault();
            return false;    
        }
    });
    
    //@todo optimize this function
    apf.addListener(document, "keydown", this.$keydown = function(e){
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

        var amlNode           = apf.document.activeElement, //apf.findHost(e.srcElement || e.target),
            htmlNode          = (e.explicitOriginalTarget || e.srcElement || e.target),
            isTextInput = (ta[htmlNode.tagName]
              || htmlNode.contentEditable || htmlNode.contentEditable == "true")  //@todo apf3.0 need to loop here?
              && !htmlNode.disabled
              || amlNode && amlNode.$isTextInput
              && amlNode.$isTextInput(e) && amlNode.disabled < 1;

        //#ifdef __WITH_ACTIONTRACKER && __WITH_UNDO_KEYS
        //@todo move this to appsettings and use with_hotkey
        var o,
            ctrlKey = apf.isMac ? e.metaKey : e.ctrlKey;
        if (!isTextInput && apf.config.undokeys && ctrlKey) {
            //Ctrl-Z - Undo
            if (e.keyCode == 90) {
                o = apf.document.activeElement;
                while (o && !o.getActionTracker && !o.$at)
                    o = o.parentNode;
                if (!o) o = apf.window;
                (o.$at || o.getActionTracker()).undo();
            }
            //Ctrl-Y - Redo
            else if (e.keyCode == 89) {
                o = apf.document.activeElement;
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
            apf.stopEvent(e);
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
        else if ((!apf.config.disableTabbing || apf.document.activeElement) && e.keyCode == 9) {
            //Window focus handling
            if (e.ctrlKey && apf.document.activeElement) {
                var w = apf.document.activeElement.$focusParent;
                if (w.modal) {
                    if (e.preventDefault)
                        e.preventDefault();
                    return false;
                }

                apf.window.moveNext(e.shiftKey,
                    apf.document.activeElement.$focusParent, true);

                w = apf.document.activeElement.$focusParent;
                if (w && w.bringToFront)
                    w.bringToFront();
            }
            //Element focus handling
            else if(!apf.document.activeElement || apf.document.activeElement.tagName != "menu") {
                apf.window.moveNext(e.shiftKey);
            }

            if (e.preventDefault)
                e.preventDefault();
            return false;
        }
        //#endif

        //Disable backspace behaviour triggering the backbutton behaviour
        var altKey = apf.isMac ? e.metaKey : e.altKey;
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
        
        
        /*if (browserNavKeys[e.keyCode] && apf.document.activeElement 
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