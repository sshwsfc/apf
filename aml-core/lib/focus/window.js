    //#ifdef __WITH_WINDOW_FOCUS
    var lastFocusElement;
    this.addEventListener("focus", function(e){
        if (!apf.document.activeElement && lastFocusParent && !apf.isIphone) {
            lastFocusElement.focus();
            /*
            if (lastFocusParent.$isWindowContainer < 0) {
                if (lastFocusParent.$tabList.length)
                    apf.window.moveNext(null, lastFocusParent.$tabList[0]);
                else
                    apf.window.$focus(lastFocusParent);
            }
            else 
                apf.window.$focusLast(lastFocusParent);*/
        }
    });
    this.addEventListener("blur", function(e){
        if (!apf.document.activeElement || apf.isIphone)
            return;

        apf.document.activeElement.blur(true, {srcElement: this});//, {cancelBubble: true}
        lastFocusParent   = apf.document.activeElement.$focusParent;
        lastFocusElement  = apf.document.activeElement;
        apf.activeElement = apf.document.activeElement = null;
    });
    this.getLastActiveElement = function(){
        return apf.activeElement || lastFocusElement;
    }
    //#endif