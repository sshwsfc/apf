
/**
 * @term baseclass A baseclass in Ajax.org Platform (apf) is a class that 
 * adds properties, methods, attributes, bindings and actions to the class that
 * inherits from it. Javascript doesn't have most object oriented concepts like
 * classes, class inheritance, interfaces, protected members and so on. When
 * using apf you will find that some of these concepts have
 * been implemented in a way that enables the core developers of apf to think in
 * those concepts. The most important one is class inheritance. Because of the
 * freedoms that javascript allows, it is possible to implement
 * {@link http://en.wikipedia.org/wiki/Inheritance_(computer_science) inheritance}
 * and even {@link http://en.wikipedia.org/wiki/Multiple_inheritance multiple inheritance}.
 * 
 * Usage:
 * In apf multiple inheritance is used on all elements to assign specific traits
 * to aml elements. Check the list of baseclasses on the right to familiarize 
 * yourself with the traits that are available (i.e. dragdrop, rename, multiselect,
 * databinding, alignment, etc). At the article of each element that inherits
 * from a baseclass you will find an inheritance tree on the right. This tree
 * will show you <strong>from which baseclasses that element has received traits</strong>.
 * Compared to Java and other strict OOP languages, the inheritance tree is
 * inverted. To give an example, in Java for instance, a Lamborghini inherits from 
 * Car which inherits from Vehicle. In apf Audi inherits from Engine, Wheels,
 * Seats and Airco. So we can make the latest Lamborghini inherit from Airco too.
 *
 * Class:
 * The apf.Class baseclass provides all basic features a apf element needs, such
 * as event system, property binding and multiple inheritance with state defined
 * by each baseclass.
 * By setting the prototype of a function to an instance of apf.Class 
 * these  <i title="an inherited characteristic (merriam-webster)">traits</i> are
 * transferred to your class.
 *
 * API:
 * The first method is the one that tells an object to implement traits from a
 * baseclass.
 * It works as follows:
 * <code>
 *  var myClass = function(){
 *      this.$init();
 *  }
 *  myClass.prototype = new apf.Class();
 * </code>
 * There is a class tree that you can use to create your own elements. For 
 * instance to create a visible element that uses skinning you can inherit from
 * apf.Presentation:
 * <code>
 *  var myElement = function(){
 *      this.$init();
 *  }
 *  myElement.prototype = new apf.Presentation();
 * </code>
 * Please find a full description of the inheritance tree below.
 *
 * To check whether an object has inherited from baseclass use the following
 * syntax:
 * <code>
 *  myObj.hasFeature(apf.__SKIN__);
 * </code>
 * Where the constant is the name of the baseclass in all caps.
 *
 * Apf supports multiple inheritance. Use the implement method to add a 
 * baseclass to your class that is not part of the inheritance tree:
 * <code>
 *  var myElement = function(){
 *      this.$init();
 *
 *      this.implement(apf.Rename);
 *  }
 *  myElement.prototype = new apf.MultiSelect();
 * </code>
 * 
 * Inheritance Tree:
 * <code>
 *  - apf.Class
 *      - apf.AmlNode
 *          - apf.AmlElement
 *              - apf.Teleport
 *              - apf.GuiElement
 *                  - apf.Presentation
 *                      - apf.BaseTab
 *                      - apf.DataBinding
 *                          - apf.StandardBinding
 *                              - apf.BaseButton
 *                              - apf.BaseSimple
 *                              - apf.Media
 *                          - apf.MultiselectBinding
 *                              - apf.MultiSelect
 *                                  - apf.BaseList
 * </code>
 * Generally elements inherit from AmlElement, Presentation, StandardBinding, 
 * MultiselectBinding, or one of the leafs.
 *
 * The following classes are implemented using the implement method:
 * <code>
 * - apf.Cache
 * - apf.ChildValue
 * - apf.LiveEdit
 * - apf.DataAction
 * - apf.Media
 * - apf.MultiCheck
 * - apf.Rename
 * - apf.Xforms
 * </code>
 *
 * The following classes are automatically implemented when needed by apf.GuiElement.
 * <code>
 * - apf.Anchoring
 * - apf.DelayedRender
 * - apf.DragDrop
 * - apf.Focussable
 * - apf.Interactive
 * - apf.Transaction
 * - apf.Validation
 * </code>
 *
 * The following class is automatically implemented by apf.MultiselectBinding
 * <code>
 * - apf.VirtualViewport
 * </code>
 */

//Turn this into a unique object store
    /**
     * @private
     */
    uniqueHtmlIds : 0,

    /**
     * Adds a unique id attribute to an html element.
     * @param {HTMLElement} oHtml the object getting the attribute.
     */
    setUniqueHtmlId : function(oHtml){
        var id;
        oHtml.setAttribute("id", id = "q" + this.uniqueHtmlIds++);
        return id;
    },

    /**
     * Retrieves a new unique id
     */
    getUniqueId : function(){
        return this.uniqueHtmlIds++;
    },
    
    /**
     * Finds a aml element based on it's uniqueId
     */
    lookup : function(uniqueId){
        return this.all[uniqueId];
    },

    /**
     * Searches in the html tree from a certain point to find the
     * aml element that is responsible for rendering the specified html
     * element.
     * @param {HTMLElement} oHtml the html context to start the search from.
     */
    findHost : function(o){
        while (o && o.parentNode) { //!o.host && 
            try {
                if ((o.host || o.host === false) && typeof o.host != "string")
                    return o.host;
            }
            catch(e){}
            
            o = o.parentNode;
        }
        
        return null;
    },
    
    /**
     * Boolean specifying whether apf is ready for dom operations.
     * @type {Boolean}
     */
    READY          : false,

    //AML nodeFunc constants
    /**
     * Constant for a hidden aml element.
     * @type {Number}
     */
    NODE_HIDDEN    : 101,
    /**
     * Constant for a visible aml element.
     * @type {Number}
     */
    NODE_VISIBLE   : 102,
    /**
     * Constant for an o3 widget.
     * @type {Number}
     */
    NODE_O3 : 103,

    /**
     * Constant for specifying that a widget is using only the keyboard to receive focus.
     * @type {Number}
     * @see baseclass.guielement.method.focus
     */
    KEYBOARD       : 2,
    /**
     * Constant for specifying that a widget is using the keyboard or the mouse to receive focus.
     * @type {Boolean}
     * @see baseclass.guielement.method.focus
     */
    KEYBOARD_MOUSE : true,

    /**
     * Constant for specifying success.
     * @type {Number}
     * @see element.teleport
     */
    SUCCESS : 1,
    /**
     * Constant for specifying a timeout.
     * @type {Number}
     * @see element.teleport
     */
    TIMEOUT : 2,
    /**
     * Constant for specifying an error.
     * @type {Number}
     * @see element.teleport
     */
    ERROR   : 3,
    /**
     * Constant for specifying the application is offline.
     * @type {Number}
     * @see element.teleport
     */
    OFFLINE : 4,
    
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
        //#ifdef __WITH_ACTIONTRACKER
        if (apf.actiontracker) {
            this.$at      = new apf.actiontracker();
            this.$at.name = "default";
            //#ifdef __WITH_NAMESERVER
            apf.nameserver.register("actiontracker", "default", this.$at);
            //#endif
        }
        
        //#ifdef __WITH_CONTENTEDITABLE || __WITH_LIVEEDIT
        this.undoManager = new apf.actiontracker();
        //#endif
        //#endif

         // #ifdef __DEBUG
        apf.console.info("Start parsing main application");
        // #endif
        // #ifdef __DEBUG
        apf.Latometer.start();
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
            // #ifndef __SUPPORT_GWT
            timeout   : apf.config.initdelay,
            // #endif
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
                    //#ifdef __DESKRUN
                    if (apf.isDeskrun)
                        apf.window.deskrun.Show();
                    //#endif
        
                    //#ifdef __WITH_FOCUS
                    //Set the default selected element
                    if (!apf.document.activeElement && (!apf.config.allowBlur 
                      || apf.document.documentElement 
                      && apf.document.documentElement.editable))
                        apf.window.focusDefault();
                    //#endif

                    apf.loaded = true;
                    $setTimeout(function() {
                        apf.dispatchEvent("load");
                        apf.addEventListener("$event.load", function(cb){
                            cb();
                        });
                    });
                }
        
                //END OF ENTIRE APPLICATION STARTUP
        
                //#ifdef __DEBUG
                apf.console.info("Initialization finished");
                //#endif
                
                // #ifdef __DEBUG
                apf.Latometer.end();
                apf.Latometer.addPoint("Total load time");
                apf.Latometer.start(true);
                // #endif
          }
        }); //async
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