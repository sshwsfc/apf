define(["aml-core", "envdetect"], function(amlCore, env){

var wheel = function(e) {
    if (!e)
        e = event;

    var delta = null;
    if (e.wheelDelta) {
        delta = e.wheelDelta / 120;
        if (env.isOpera)
            delta *= -1;
    }
    else if (e.detail) {
        delta = -e.detail / 3;
    }

    if (delta !== null) {
        //Fix for scrolling too much
        if (env.isIE) {
            var el = e.srcElement || e.target;
            while (el && el.scrollHeight <= el.offsetHeight)
                el = el.parentNode || el.$parentNode;
            
            if (el && el.nodeType == 9)
                el = el.documentElement;
            
            if (!el || el.nodeType != 1) return;

            if (el && el.tagName == "BODY" && "auto|scroll".indexOf(apf.getStyle(el, "overflowY")) == -1)
                el = document.documentElement;

            if (el && "auto|scroll".indexOf(apf.getStyle(el, "overflowY")) > -1) {
                var max, dist = 0.35 * el.offsetHeight * delta;
                if (delta < 0) {
                    if (el && el.scrollTop >= (max = el.scrollHeight - el.offsetHeight + apf.getVerBorders(el)) + dist) {
                        el.scrollTop = max;
                        e.returnValue = false;
                    }
                }
                else {
                    if (el && el.scrollTop <= dist) {
                        el.scrollTop = 0;
                        e.returnValue = false;
                    }
                }
            }
        }
        
        var ev  = {
            delta     : delta, 
            target    : e.target || e.srcElement, 
            button    : e.button, 
            ctrlKey   : e.ctrlKey, 
            shiftKey  : e.shiftKey, 
            altKey    : e.altKey,
            bubbles   : true,
            htmlEvent : e
        };
        
        var amlNode = apf.findHost(e.srcElement || e.target);
        var res = (amlNode || amlCore.documents[0]).dispatchEvent("mousescroll", ev);
        if (res === false || ev.returnValue === false) {
            if (e.preventDefault)
                e.preventDefault();

            e.returnValue = false;
        }
    }
}

if (document.addEventListener)
    document.addEventListener('DOMMouseScroll', wheel, false);

window.onmousewheel   =
document.onmousewheel = wheel;

});