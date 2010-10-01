
require.def(["debug/console"], function(console){

    apf.addListener(window, "beforeunload", function(){
        return apf.dispatchEvent("exit");
    });

    //@todo apf3.x why is this loaded twice
    apf.addListener(window, "unload", function(){
        if (!apf)
            return;
        
        apf.window.isExiting = true;
        apf.window.destroy();
    });
    
        
    apf.document = {};
    this.init = function(strAml){

    };
    
    
        /**
     * Starts the application.
     * @private
     */
    start : function(){
        this.started = true;
        var sHref = location.href.split("#")[0].split("?")[0];

        //Set Variables
        this.host     = location.hostname && sHref.replace(/(\/\/[^\/]*)\/.*$/, "$1");
        this.hostPath = sHref.replace(/\/[^\/]*$/, "") + "/";

        //#ifdef __DEBUG
        apf.console.info("Starting Ajax.org Platform Application...");
        apf.console.warn("Debug build of Ajax.org Platform " + (apf.VERSION ? "version " + apf.VERSION : ""));
        //#endif

        //mozilla root detection
        //try{ISROOT = !window.opener || !window.opener.apf}catch(e){ISROOT = true}

        //Browser Specific Stuff
        //this.browserDetect();
        this.setCompatFlags();

        if (apf.onstart && apf.onstart() === false)
            return false;

        //#ifdef __WITH_DEBUG_WIN
        apf.$debugwin.start();
        //#endif

        //Load Browser Specific Code
        // #ifdef __SUPPORT_IE
        if (this.isIE) apf.runIE();
            //this.importClass(apf.runIE, true, self);
        // #endif
        // #ifdef __SUPPORT_WEBKIT
        if (apf.isWebkit) apf.runWebkit();
            //this.importClass(apf.runSafari, true, self);
        // #endif
        // #ifdef __SUPPORT_OPERA
        if (this.isOpera) apf.runOpera();
            //this.importClass(apf.runOpera, true, self);
        // #endif
        // #ifdef __SUPPORT_GECKO
        if (this.isGecko || !this.isIE && !apf.isWebkit && !this.isOpera)
            apf.runGecko();
            //this.importClass(apf.runGecko, true, self);
        // #endif

        // #ifdef __TP_HTTP
        // Start HTTP object
        this.oHttp = new this.http();
        //#endif

        // #ifndef __SUPPORT_GWT
        // Load user defined includes
        this.Init.addConditional(this.parseAppMarkup, apf, ["body"]);
        //@todo, as an experiment I removed 'HTTP' and 'Teleport'
        // #endif

        //IE fix
        try {
            if (apf.isIE)
                document.execCommand("BackgroundImageCache", false, true);
        }
        catch(e) {}

        //#ifdef __WITH_WINDOW
        //apf.window.init();
        //#endif

        this.started = true;
        
        // #ifndef __SUPPORT_GWT
        // DOMReady already fired, so plz continue the loading and parsing
        if (this.load_done)
            this.execDeferred();
        // #endif

        //try{apf.root = !window.opener || !window.opener.apf;}
        //catch(e){apf.root = false}
        this.root = true;
        
        /* #ifdef __PACKAGED
        for (var i = 0; i < apf.$required.length; i++) {
            apf.include(apf.$required[i]);
        }
        apf.require = apf.include;
        #endif*/
        
        /*#ifdef __SUPPORT_GWT
        // Load user defined includes
        //this.parseAppMarkup();
        
        //GWT
        apf.initialize("<html xmlns:a='" + apf.ns.aml + "' xmlns='" + apf.ns.xhtml + "'><head /><body /></html>");
        #endif*/

    },
    
    
    /**
     * Unloads the aml application.
     */
    unload : function(exclude){
        //#ifdef __DEBUG
        apf.console.info("Initiating self destruct...");
        //#endif

        this.isDestroying = true;

        //#ifdef __WITH_POPUP
        this.popup.destroy();
        //#endif

        var node,
            i = 0,
            l = this.all.length;
        for (; i < l; i++) {
            node = this.all[i];
            if (node && node != exclude && node.destroy && !node.apf)
                node.destroy(false);
        }

        //this.dispatchEvent("DOMNodeRemovedFromDocument", {});//@todo apf3.0
        
        for (i = 0, l = this.availHTTP.length; i < l; i++)
            this.availHTTP[i] = null;
        
        this.availHTTP.length = 0;

        //#ifdef __WITH_XMLDATABASE
        if (apf.xmldb)
            apf.xmldb.unbind(apf.window);
        //#endif

        this.isDestroying = false;
    }
    
    /**
     * @private
     */
    this.destroy = function(){
        this.$at = null;

        apf.unload(this);

        apf           =
        this.win      =
        this.window   =
        this.document = null;

        //@todo this is not needed... maybe use apf.removeListener
        window.onfocus        =
        window.onerror        =
        window.onunload       =
        window.onbeforeunload =
        window.onbeforeprint  =
        window.onafterprint   =
        window.onmousewheel   =
        window.onblur         = null;

        //@todo use apf.removeEvent

        document.oncontextmenu =
        document.onmousedown   =
        document.onmousemove   =
        document.onmouseup     =
        document.onmousewheel  =
        document.onkeyup       =
        document.onkeydown     = null

        if (document.body) {
            document.body.onmousedown =
            document.body.onmousemove =
            document.body.onmouseup   = null;

            document.body.innerHTML = "";
        }
    };
    
    apf.document = {};
    this.init = function(strAml){
        //#ifdef __WITH_ACTIONTRACKER
        if (apf.actiontracker) {
            this.$at      = new apf.actiontracker();
            this.$at.name = "default";
            //#ifdef __WITH_NAMESERVER
            apf.nameserver.register("actiontracker", "default", this.$at);
            //#endif
        }
        //#endif

         // #ifdef __DEBUG
        apf.console.info("Start parsing main application");
        // #endif
        // #ifdef __DEBUG
        //apf.Latometer.start();
        // #endif
        
        //Put this in callback in between the two phases
        //#ifdef __WITH_SKIN_AUTOLOAD
        /*XForms and lazy devs support
        if (!nodes.length && !apf.skins.skins["default"] && apf.autoLoadSkin) {
            apf.console.warn("No skin file found, attempting to autoload the \
                              default skin file: skins.xml");
            apf.loadAmlInclude(null, doSync, "skins.xml", true);
        }*/
        //#endif 

        this.$domParser = new apf.DOMParser();
        this.document = apf.document = this.$domParser.parseFromString(strAml, 
          "text/xml", {
            timeout   : apf.config.initdelay,
            callback  : function(doc){
                //@todo apf3.0

                //Call the onload event (prevent recursion)
                if (apf.parsed != 2) {
                    //@todo apf3.0 onload is being called too often
                    var inital = apf.parsed;
                    apf.parsed = 2;
                    apf.dispatchEvent("parse", { //@todo apf3.0 document
                        initial : inital
                    });
                    apf.parsed = true;
                }
        
                if (!apf.loaded) {
                    apf.loaded = true;
                    apf.dispatchEvent("load");
                }
        
                //END OF ENTIRE APPLICATION STARTUP
        
                //#ifdef __DEBUG
                //apf.console.info("Initialization finished");
                //#endif
                
                // #ifdef __DEBUG
                //apf.Latometer.end();
                //apf.Latometer.addPoint("Total load time");
                //apf.Latometer.start(true);
                // #endif
          }
        }); //async
    };