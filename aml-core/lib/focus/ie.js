    //#ifdef __WITH_WINDOW_FOCUS

    var timer, state = "", last = "";
    this.$focusfix = function(){
        // #ifdef __SUPPORT_IPHONE
        if (apf.isIphone) return;
        // #endif
        state += "a";
        clearTimeout(timer);
        $setTimeout("window.focus();");
        timer = $setTimeout(determineAction);
    };

    this.$focusfix2 = function(){
        // #ifdef __SUPPORT_IPHONE
        if (apf.isIphone) return;
        // #endif
        state += "b";
        clearTimeout(timer);
        timer = $setTimeout(determineAction);
    };

    this.$blurfix = function(){
        // #ifdef __SUPPORT_IPHONE
        if (apf.isIphone) return;
        // #endif
        state += "c";
        clearTimeout(timer);
        timer = $setTimeout(determineAction);
    };

    function determineAction(){
        clearTimeout(timer);

        //apf.console.info(state);
        if (state == "e" || state == "c"
          || state.charAt(0) == "x" && !state.match(/eb$/)
          || state == "ce" || state == "de") { //|| state == "ae"
            if (last != "blur") {
                last = "blur";
                apf.window.dispatchEvent("blur");
                //apf.console.warn("blur");
            }
        }
        else {
            if (last != "focus") {
                last = "focus";
                apf.window.dispatchEvent("focus");
                //apf.console.warn("focus");
            }
        }

        state = "";
        timer = null;
    }

    amlCore.addListener(window, "focus", this.$focusevent = function(){
        // #ifdef __SUPPORT_IPHONE
        if (apf.isIphone)
            return apf.window.dispatchEvent("focus");
        // #endif
        if (apf.hasFocusBug) {
            state += "d";
            clearTimeout(timer);
            timer = $setTimeout(determineAction);
        }
        else {
            clearTimeout(iframeFixTimer)
            iframeFix.newState = "focus";
            //apf.console.warn("win-focus");
            iframeFixTimer = $setTimeout(iframeFix, 10);
        }
    });

    amlCore.addListener(window, "blur", this.$blurevent = function(){
        if (!apf) return;
        
        // #ifdef __SUPPORT_IPHONE
        if (apf.isIphone)
            return apf.window.dispatchEvent("blur");
        // #endif
        if (apf.hasFocusBug) {
            state += "e";
            clearTimeout(timer);
            timer = $setTimeout(determineAction);
        }
        else {
            clearTimeout(iframeFixTimer)
            iframeFix.newState = "blur";
            //apf.console.warn("win-blur");
            iframeFixTimer = $setTimeout(iframeFix, 10);
        }
    });

    var iframeFixTimer;
    function iframeFix(){
        clearTimeout(iframeFixTimer);

        var newState = iframeFix.newState;
        if (last == newState)
            return;

        last = newState;

        apf.dispatchEvent(last);
        //apf.console.warn(last);
    }

    this.hasFocus = function(){
        return (last == "focus");
    };

    //#endif
    
//#ifdef __WITH_WINDOW_FOCUS
/**
 * @private
 */
apf.sanitizeTextbox = function(oTxt){
    if (!apf.hasFocusBug)
        return;
    
    oTxt.onfocus = function(){
        if (apf.window)
            apf.window.$focusfix2();
    };

    oTxt.onblur = function(){
        if (apf.window)
            apf.window.$blurfix();
    };
};
// #endif