define([], function(){
// #ifdef __WITH_CONVERTIFRAME
/**
 * @private
 */
//@todo this is all broken. needs to be fixed before apf3.0
var ConvertIframe = function(iframe, preventSelect){
    var win = iframe.contentWindow;
    var doc = win.document;
    var pos;

    if (!apf.isIE)
        apf.importClass(apf.runNonIe, true, win);
        
    //Load Browser Specific Code
    // #ifdef __SUPPORT_WEBKIT
    if (this.isSafari) 
        this.importClass(apf.runSafari, true, win);
    // #endif
    // #ifdef __SUPPORT_OPERA
    if (this.isOpera) 
        this.importClass(apf.runOpera, true, win);
    // #endif
    // #ifdef __SUPPORT_GECKO
    if (this.isGecko || !this.isIE && !this.isSafari && !this.isOpera)
        this.importClass(apf.runGecko, true, win);
    // #endif
    
    doc.onkeydown = function(e){
        if (!e) e = win.event;

        if (document.onkeydown) 
            return document.onkeydown.call(document, e);
        //return false;
    };
    
    doc.onmousedown = function(e){
        if (!e) e = win.event;

        if (!pos)
            pos = apf.getAbsolutePosition(iframe);

        var q = {
            offsetX       : e.offsetX,
            offsetY       : e.offsetY,
            x             : e.x + pos[0],
            y             : e.y + pos[1],
            button        : e.button,
            clientX       : e.x + pos[0],
            clientY       : e.y + pos[1],
            srcElement    : iframe,
            target        : iframe,
            targetElement : iframe
        }
        
        if (document.body.onmousedown)
            document.body.onmousedown(q);
        if (document.onmousedown)
            document.onmousedown(q);
        
        if (preventSelect && !apf.isIE)
            return false;
    };
    
    if (preventSelect) {
        doc.onselectstart = function(e){
            return false;
        };
    }
    
    doc.onmouseup = function(e){
        if (!e) e = win.event;
        if (document.body.onmouseup)
            document.body.onmouseup(e);
        if (document.onmouseup)
            document.onmouseup(e);
    };
    
    doc.onclick = function(e){
        if (!e) e = win.event;
        if (document.body.onclick)
            document.body.onclick(e);
        if (document.onclick)
            document.onclick(e);
    };
    
    //all these events should actually be piped to the events of the container....
    doc.documentElement.oncontextmenu = function(e){
        if (!e) e = win.event;
        if (!pos)
            pos = apf.getAbsolutePosition(iframe);
        
        var q = {
            offsetX       : e.offsetX,
            offsetY       : e.offsetY,
            x             : e.x + pos[0],
            y             : e.y + pos[1],
            button        : e.button,
            clientX       : e.x + pos[0],
            clientY       : e.y + pos[1],
            srcElement    : e.srcElement,
            target        : e.target,
            targetElement : e.targetElement
        };

        //if(this.host && this.host.oncontextmenu) this.host.oncontextmenu(q);
        if (document.body.oncontextmenu)
            document.body.oncontextmenu(q);
        if (document.oncontextmenu)
            document.oncontextmenu(q);
        
        return false;
    };

    doc.documentElement.onmouseover = function(e){
        pos = apf.getAbsolutePosition(iframe);
    };

    doc.documentElement.onmousemove = function(e){
        if (!e) e = win.event;
        if (!pos)
            pos = apf.getAbsolutePosition(iframe);
    
        var q = {
            offsetX       : e.offsetX,
            offsetY       : e.offsetY,
            x             : e.x + pos[0],
            y             : e.y + pos[1],
            button        : e.button,
            clientX       : e.x + pos[0],
            clientY       : e.y + pos[1],
            srcElement    : e.srcElement,
            target        : e.target,
            targetElement : e.targetElement
        }

        if (iframe.onmousemove)
            iframe.onmousemove(q);
        if (document.body.onmousemove)
            document.body.onmousemove(q);
        if (document.onmousemove)
            document.onmousemove(q);
        
        return e.returnValue;
    };
    
    return doc;
};
})
