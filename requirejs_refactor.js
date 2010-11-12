    module.declare(function(require, exports, module){
/**
     * Loads javascript from a url.
     * 
     * @param {String}  sourceFile the url where the javascript is located.
     * @param {Boolean} [doBase]   check for basePath, otherwise prepend it
     * @param {String}  [type]     set the type of a script tag, for later use
     * @type  {void}
     */
    include : function(sourceFile, doBase, type, text, callback){
        //#ifdef __DEBUG
        if (apf.started)
            apf.console.info("including js file: " + sourceFile);
        //#endif
        
        var sSrc = doBase ? apf.getAbsolutePath(apf.basePath || "", sourceFile) : sourceFile;
        var head     = document.getElementsByTagName("head")[0],//$("head")[0]
            elScript = document.createElement("script");
        //elScript.defer = true;
        if (type)
            elScript.setAttribute("_apf_type", type);
        if (text)
            elScript.text  = text;
        else 
            elScript.src   = sSrc;
        head.appendChild(elScript);

        if (callback)
            elScript[apf.isIE ? "onreadystatechange" : "onload"] = callback;
        
        return elScript;
    },
    
// #ifndef __SUPPORT_GWT
    /**
     * @private
     */
    execDeferred: function() {
        // execute each function in the stack in the order they were added
        var len = apf.load_events.length;
        while (len--)
            (apf.load_events.shift())();
    },

    load_events: [],
    load_timer : null,
    load_done  : false,
    load_init  : null,

    /**
     * @private
     */
    addDomLoadEvent: function(func) {
        if (!this.$bdetect)
            this.browserDetect();

        if (apf.load_done)
            return func();

        // create event function stack
        //apf.done = arguments.callee.done;
        if (!apf.load_init) {
            apf.load_init = function() {
                if (apf.load_done) return;
                // kill the timer
                clearInterval(apf.load_timer);
                apf.load_timer = null;
                apf.load_done  = true;
                if (apf.started)
                    apf.execDeferred();
            };
        }

        apf.load_events.push(func);

        if (func && apf.load_events.length == 1) {
            // Catch cases where addDomLoadEvent() is called after the browser
            // event has already occurred.
            var doc = document, UNDEF = "undefined";
            if ((typeof doc.readyState != UNDEF && doc.readyState == "complete")
              || (doc.getElementsByTagName("body")[0] || doc.body))
                return apf.load_init();

            // for Mozilla/Opera9.
            // Mozilla, Opera (see further below for it) and webkit nightlies
            // currently support this event
            if (doc.addEventListener && !apf.isOpera) {
                // We're using "window" and not "document" here, because it results
                // in a memory leak, especially in FF 1.5:
                // https://bugzilla.mozilla.org/show_bug.cgi?id=241518
                // See also:
                // http://bitstructures.com/2007/11/javascript-method-callbacks
                // http://www-128.ibm.com/developerworks/web/library/wa-memleak/
                window.addEventListener("DOMContentLoaded", apf.load_init, false);
            }
            // If IE is used and is not in a frame
            else if (apf.isIE && window == top) {
                apf.load_timer = setInterval(function() {
                    try {
                        // If IE is used, use the trick by Diego Perini
                        // http://javascript.nwbox.com/IEContentLoaded/
                        doc.documentElement.doScroll("left");
                    }
                    catch(ex) {
                        $setTimeout(arguments.callee, 0);
                        return;
                    }
                    // no exceptions anymore, so we can call the init!
                    apf.load_init();
                }, 10);
            }
            else if (apf.isOpera) {
                doc.addEventListener("DOMContentLoaded", function() {
                    apf.load_timer = setInterval(function() {
                        for (var i = 0, l = doc.styleSheets.length; i < l; i++) {
                            if (doc.styleSheets[i].disabled)
                                return;
                        }
                        // all is fine, so we can call the init!
                        apf.load_init();
                    }, 10);
                }, false);
            }
            else if (apf.isWebkit && !apf.isIphone) {
                var aSheets = doc.getElementsByTagName("link"),
                    i       = aSheets.length,
                    iSheets;
                for (; i >= 0; i++) {
                    if (!aSheets[i] || aSheets[i].getAttribute("rel") != "stylesheet")
                        aSheets.splice(i, 0);
                }
                iSheets = aSheets.length;
                apf.load_timer  = setInterval(function() {
                    if (/loaded|complete/.test(doc.readyState)
                      && doc.styleSheets.length == iSheets)
                        apf.load_init(); // call the onload handler
                }, 10);
            }
            // for other browsers set the window.onload, but also execute the
            // old window.onload
            else {
                var old_onload = window.onload;
                window.onload  = function () {
                    apf.load_init();
                    if (old_onload)
                        old_onload();
                };
            }
        }
    },
    // #endif
})
