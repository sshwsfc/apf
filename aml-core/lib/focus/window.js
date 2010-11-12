module.declare(function(require, exports, module){

var iframeFixTimer, lastFocusParent, lastFocusElement;
var timer, state = "", last = "";

function iframeFix(){
    clearTimeout(iframeFixTimer);

    var newState = iframeFix.newState;
    if (last == newState)
        return;

    last = newState;

    apf.dispatchEvent(last);
    //apf.console.warn(last);
}

function determineAction(){
    clearTimeout(timer);

    //apf.console.info(state);
    if (state == "e" || state == "c"
      || state.charAt(0) == "x" && !state.match(/eb$/)
      || state == "ce" || state == "de") { //|| state == "ae"
        if (last != "blur") {
            last = "blur";
            FocusManager.dispatchEvent("blur");
            //apf.console.warn("blur");
        }
    }
    else {
        if (last != "focus") {
            last = "focus";
            FocusManager.dispatchEvent("focus");
            //apf.console.warn("focus");
        }
    }

    state = "";
    timer = null;
}

FocusManager.addEventListener("focus", function(e){
    if (!FocusManager.activeElement && lastFocusParent && !apf.isIphone) {
        lastFocusElement.focus();
        /*
        if (lastFocusParent.$isWindowContainer < 0) {
            if (lastFocusParent.$tabList.length)
                FocusManager.moveNext(null, lastFocusParent.$tabList[0]);
            else
                FocusManager.$focus(lastFocusParent);
        }
        else 
            FocusManager.$focusLast(lastFocusParent);*/
    }
});

FocusManager.addEventListener("blur", function(e){
    if (!FocusManager.activeElement || apf.isIphone)
        return;

    FocusManager.activeElement.blur(true, {srcElement: this});//, {cancelBubble: true}
    lastFocusParent   = FocusManager.activeElement.$focusParent;
    lastFocusElement  = FocusManager.activeElement;
    FocusManager.activeElement = null;
});

FocusManager.getLastActiveElement = function(){
    return FocusManager.activeElement || lastFocusElement;
}

var FocusClientWindow = {
    $focusfix : function(){
        state += "a";
        clearTimeout(timer);
        $setTimeout("window.focus();");
        timer = $setTimeout(determineAction);
    },

    $focusfix2 : function(){
        state += "b";
        clearTimeout(timer);
        timer = $setTimeout(determineAction);
    },

    $blurfix : function(){
        state += "c";
        clearTimeout(timer);
        timer = $setTimeout(determineAction);
    },

    hasFocus : function(){
        return (last == "focus");
    },

    sanitizeTextbox : function(oTxt){
        if (!apf.hasFocusBug)
            return;
        
        oTxt.onfocus = function(){
            if (FocusManager)
                FocusManager.$focusfix2();
        };
    
        oTxt.onblur = function(){
            if (FocusManager)
                FocusManager.$blurfix();
        };
    }
}

amlCore.addListener(window, "focus", FocusClientWindow.$focusevent = function(){
    // #ifdef __SUPPORT_IPHONE
    if (apf.isIphone)
        return FocusManager.dispatchEvent("focus");
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

amlCore.addListener(window, "blur", FocusClientWindow.$blurevent = function(){
    if (!apf) return;
    
    // #ifdef __SUPPORT_IPHONE
    if (apf.isIphone)
        return FocusManager.dispatchEvent("blur");
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

module.exports = FocusClientWindow;

});