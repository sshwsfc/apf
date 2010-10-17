define(["envdetect"], function(env){
    return new (function(){
        //Set Compatibility
        this.TAGNAME                   = env.isIE ? "baseName" : "localName";
        this.styleSheetRules           = env.isIE ? "rules" : "cssRules";
        this.brokenHttpAbort           = env.isIE6;
        this.canUseHtmlAsXml           = env.isIE;
        this.supportNamespaces         = !env.isIE;
        this.cannotSizeIframe          = env.isIE;
        this.hasConditionCompilation   = env.isIE;
        this.supportOverflowComponent  = env.isIE;
        this.hasFlexibleBox            = env.versionGecko > 2 || env.webkitRev > 2; //@todo check this
        this.hasEventSrcElement        = env.isIE;
        this.canHaveHtmlOverSelects    = !env.isIE6 && !env.isIE5;
        this.hasInnerText              = env.isIE;
        this.hasMsRangeObject          = env.isIE;
        this.descPropJs                = env.isIE;
        this.hasClickFastBug           = env.isIE;
        this.hasExecScript             = window.execScript ? true : false;
        this.canDisableKeyCodes        = env.isIE;
        this.hasTextNodeWhiteSpaceBug  = env.isIE || env.isIE >= 8;
        this.hasCssUpdateScrollbarBug  = env.isIE;
        this.canUseInnerHtmlWithTables = !env.isIE;
        this.hasSingleResizeEvent      = !env.isIE;
        this.hasStyleFilters           = env.isIE;
        this.supportOpacity            = !env.isIE;
        this.supportPng24              = !env.isIE6 && !env.isIE5;
        this.hasDynamicItemList        = !env.isIE || env.isIE >= 7;
        this.canImportNode             = env.isIE;
        this.hasSingleRszEvent         = !env.isIE;
        this.hasXPathHtmlSupport       = !env.isIE;
        this.hasFocusBug               = env.isIE;
        this.hasHeightAutoDrawBug      = env.isIE && env.isIE < 8;
        //this.hasIndexOfNodeList        = !env.isIE;
        this.hasReadyStateBug          = env.isIE50;
        this.dateSeparator             = env.isIE ? "-" : "/";
        this.canCreateStyleNode        = !env.isIE;
        this.supportFixedPosition      = !env.isIE || env.isIE >= 7;
        this.hasHtmlIdsInJs            = env.isIE && env.isIE < 8 || env.isWebkit;
        this.needsCssPx                = !env.isIE;
        this.hasCSSChildOfSelector     = !env.isIE || env.isIE >= 8;
        this.hasStyleAnchors           = !env.isIE || env.isIE >= 8;
        this.styleAttrIsObj            = env.isIE < 8;
        this.hasAutocompleteXulBug     = env.isGecko;
        this.loadsLocalFilesSync       = env.isIE || env.isGecko;
        this.mouseEventBuffer          = env.isIE ? 20 : 6;
        this.hasComputedStyle          = typeof document.defaultView != "undefined"
                                           && typeof document.defaultView.getComputedStyle != "undefined";
        this.w3cRange                  = Boolean(window["getSelection"]);
        this.locale                    = (env.isIE
                                            ? navigator.userLanguage
                                            : navigator.language).toLowerCase();
        this.characterSet              = document.characterSet || document.defaultCharset || "utf-8";
        var t = document.createElement("div");
        this.hasContentEditable        = (typeof t.contentEditable == "string"
                                       || typeof t.contentEditable == "boolean");
        env.hasContentEditableContainerBug = env.isWebkit;
        // Try transform first for forward compatibility
        var props   = ["transform", "OTransform", "KhtmlTransform", "MozTransform", "WebkitTransform"],
            prefixR = ["", "O", "Khtml", "Moz", "Webkit"],
            prefixC = ["", "o-", "khtml-", "moz-", "webkit-"],
            events  = ["transitionend", "transitionend", "transitionend", "transitionend", "webkitTransitionEnd"],
            i       = 0,
            l       = 5;
        this.supportCSSAnim            = false;
        this.supportCSSTransition      = false;
        for (; i < l && !this.supportCSSAnim; ++i) {
            if (typeof t.style[props[i]] == "undefined") continue;
            this.supportCSSAnim     = props[i];
            this.runtimeStylePrefix = prefixR[i];
            this.classNamePrefix    = prefixC[i];
            this.cssAnimEvent       = events[i];
        }
        t = null;
        delete t;

        this.supportVML                = env.isIE;
        this.supportSVG                = !env.isIE || env.isIE > 8;
        this.hasHtml5XDomain           = env.versionGecko >= 3.5;
        this.supportCanvas             = !!document.createElement("canvas").getContext;
        this.supportCanvasText         = !!(this.supportCanvas
            && typeof document.createElement("canvas").getContext("2d").fillText == "function")

        this.hasVideo                  = !!document.createElement("video")["canPlayType"];
        this.hasAudio                  = !!document.createElement("audio")["canPlayType"];
        this.supportHashChange         = ("onhashchange" in self) && (!env.isIE || env.isIE >= 8);

        if (self.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
            this.hasXhrProgress = !!xhr.upload;
            if (this.hasXhrBinary = !!(xhr.sendAsBinary || xhr.upload)) {
                this.hasHtml5File      = !!(File && File.prototype.getAsDataURL);
                this.hasHtml5FileSlice = !!(File && File.prototype.slice);
            }
        }
        else {
            this.hasXhrProgress = this.hasXhrBinary = this.hasHtml5File 
                = this.hasHtml5FileSlice = false;
        }

        this.windowHorBorder           = 
        this.windowVerBorder           = env.isIE8 && (!self.frameElement 
            || parseInt(self.frameElement.frameBorder)) ? 4 : 0;
        
        //#ifdef __WITH_HTML5_TEST
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an array
        //   containing properties that represent the 'supported' input types.
        t = document.createElement("input");
        var _self = this;
        (function(props) {
            for (var i in props) {
                t.setAttribute("type", i);
                _self["hasInput" + i.charAt(0).toUpperCase()
                    + i.substr(1).replace("-l", "L")] = !!(t.type !== "text");
            }
        })({"search":1, "tel":1, "url":1, "email":1, "datetime":1, "date":1,
            "month":1, "week":1, "time":1, "datetime-local":1, "number":1,
            "range":1, "color":1});
        t = null;
        delete t;
        //#endif

        this.enableAnim   = !env.isIE || env.isIE > 8;
        this.animSteps    = env.isIE ? 0.3 : 1;
        this.animInterval = env.isIE ? 7 : 1;

        this.CSSFLOAT    = env.isIE ? "styleFloat" : "cssFloat";
        this.CSSPREFIX   = env.isGecko ? "Moz" : (env.isWebkit ? "webkit" : "");
        this.CSSPREFIX2  = env.isGecko ? "-moz" : (env.isWebkit ? "-webkit" : "");
        this.INLINE      = env.isIE && env.isIE < 8 ? "inline" : "inline-block";

        var bodyMarginTop = parseFloat(env.isIE 
            ? document.body.currentStyle["marginTop"] 
            : (window.getComputedStyle(document.body, "") || {})["marginTop"] || "");
        apf.doesNotIncludeMarginInBodyOffset = (document.body.offsetTop !== bodyMarginTop);

        //Other settings
        this.maxHttpRetries = env.isOpera ? 0 : 3;

        this.reMatchXpath = new RegExp();
        this.reMatchXpath.compile("(^|\\|)(?!\\@|[\\w-]+::)", "g");

        //#ifdef __SUPPORT_GEARS
        //env.isGears      = !!env.initGears() || 0;
        //#endif
    });
});