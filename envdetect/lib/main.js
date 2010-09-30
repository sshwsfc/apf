require.def(function(){
    return new (function(){
        // Browser Detection, using feature inference methods where possible:
        // http://www.thespanner.co.uk/2009/01/29/detecting-browsers-javascript-hacks/
        // http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
        // http://sla.ckers.org/forum/read.php?24,31765,33730
        var sAgent = navigator.userAgent.toLowerCase() || "",
            // 1->IE, 0->FF, 2->GCrome, 3->Safari, 4->Opera, 5->Konqueror 
            b      = (typeof/./)[0]=='f'?+'1\0'?3:2:+'1\0'?5:1-'\0'?1:+{valueOf:function(x){return!x}}?4:0;

       /*
        * Fix for firefox older than 2
        * Older versions of firefox have (typeof/./) = function
        * So firefox to be treated as Chrome, since the above expresion will return 2
        * Newer versions have (typeof/./) = object
        * 
        */
        if((typeof/./)[0]=='f' && parseFloat((sAgent.match(/(?:firefox|minefield)\/([\d\.]+)/i) || {})[1]) <= 2)
            b = 0;

        if (b == 2 && sAgent.indexOf("chrome") == -1) 
            b = 3;

        /**
         * Specifies whether the application is running in the Opera browser.
         * @type {Boolean}
         */
        this.isOpera      = b===4 || b===5;//(self.opera && Object.prototype.toString.call(self.opera) == "[object Opera]");
        //b = 5 for Opera 9
        
        /**
         * Specifies whether the application is running in the Konqueror browser.
         * @type {Boolean}
         */
        this.isKonqueror  = b===5;//sAgent.indexOf("konqueror") != -1;
        
        /**
         * Specifies whether the application is running in the Safari browser.
         * @type {Boolean}
         */
        this.isSafari     = b===3;//a/.__proto__ == "//";
        
        /**
         * Specifies whether the application is running in the Safari browser version 2.4 or below.
         * @type {Boolean}
         */
        this.isSafariOld  = false;

        /**
         * Specifies whether the application is running on the Iphone.
         * @type {Boolean}
         */
        this.isIphone     = sAgent.indexOf("iphone") != -1 || sAgent.indexOf("aspen simulator") != -1;

        /**
         * Specifies whether the application is running in the Chrome browser.
         * @type {Boolean}
         */
        this.isChrome     = b===2;//Boolean(/source/.test((/a/.toString + ""))) || sAgent.indexOf("chrome") != -1;
        
        /**
         * Specifies whether the application is running in a Webkit-based browser
         * @type {Boolean}
         */
        this.isWebkit     = this.isSafari || this.isChrome || this.isKonqueror;

        if (this.isWebkit) {
            var matches   = sAgent.match(/applewebkit\/(\d+)/);
            if (matches) {
                this.webkitRev   = parseInt(matches[1])
                this.isSafariOld = parseInt(matches[1]) < 420;
            }
        }

        /**
         * Specifies whether the application is running in a Gecko based browser.
         * @type {Boolean}
         */
        this.isGecko      = b===0;//(function(o) { o[o] = o + ""; return o[o] != o + ""; })(new String("__count__"));

        /**
         * Specifies whether the application is running in the Firefox browser version 3.
         * @type {Boolean}
         */
        this.isGecko3      = this.isGecko;// && (function x(){})[-5] == "x";
        this.isGecko35     = this.isGecko && (/a/[-1] && Object.getPrototypeOf) ? true : false;
        this.versionGecko  = this.isGecko ? parseFloat(sAgent.match(/(?:gecko)\/([\d\.]+)/i)[1]) : -1;
        this.versionFF     = this.isGecko ? parseFloat(sAgent.match(/(?:firefox(-[\d.]+)?|minefield)\/([\d.]+)/i)[2]) : -1;
        this.versionSafari = this.isSafari ? parseFloat(sAgent.match(/(?:version)\/([\d\.]+)/i)[1]) : -1;
        this.versionChrome = this.isChrome ? parseFloat(sAgent.match(/(?:chrome)\/([\d\.]+)/i)[1]) : -1;
        this.versionOpera  = this.isOpera 
            ? parseFloat(sAgent.match(b===4 
                ? /(?:version)\/([\d\.]+)/i 
                : /(?:opera)\/([\d\.]+)/i)[1]) 
            : -1;

        var found;
        /**
         * Specifies whether the application is running in the Internet Explorer browser, any version.
         * @type {Boolean}
         */
        this.isIE         = b===1;//! + "\v1";
        if (this.isIE)
            this.isIE = parseFloat(sAgent.match(/msie ([\d\.]*)/)[1]);
        
        /**
         * Specifies whether the application is running in the Internet Explorer browser version 8.
         * @type {Boolean}
         */
        this.isIE8        = this.isIE == 8 && (found = true);
        
        /**
         * Specifies whether the application is running in the Internet Explorer browser version 7.
         * @type {Boolean}
         */
        this.isIE7        = !found && this.isIE == 7 && (found = true);

        //Mode detection
        if (document.documentMode == 7) { //this.isIE == 7 && 
            apf.isIE7        = true;
            apf.isIE8        = false;
            apf.isIE7Emulate = true;
            apf.isIE         = 7;
        }
        
        /**
         * Specifies whether the application is running in the Internet Explorer browser version 6.
         * @type {Boolean}
         */
        this.isIE6       = !found && this.isIE == 6 && (found = true);

        var os           = (navigator.platform.match(/mac|win|linux/i) || ["other"])[0].toLowerCase();
        /**
         * Specifies whether the application is running on the Windows operating system.
         * @type {Boolean}
         */
        this.isWin       = (os == "win");
        /**
         * Specifies whether the application is running in the OSX operating system..
         * @type {Boolean}
         */
        this.isMac       = (os == "mac");
        /**
         * Specifies whether the application is running in the OSX operating system..
         * @type {Boolean}
         */
        this.isLinux     = (os == "linux");

        /**
         * Specifies whether the application is running in the AIR runtime.
         * @type {Boolean}
         */
        this.isAIR       = sAgent.indexOf("adobeair") != -1;

        /*#ifdef __SUPPORT_GWT
        this.isGWT       = true;
        #endif*/

        //#ifdef __DESKRUN
        try {
            //this.isDeskrun = window.external.shell.runtime == 2;
        }
        catch(e) {
            /**
             * Specifies whether the application is running in the Deskrun runtime.
             * @type {Boolean}
             */
            this.isDeskrun = false;
        }
        //#endif
    });
});