require([
    "envdetect", 
    "envdetect/features", 
    "optional!debug"], 
    function(env, features){

    var deps = [];
    if (env.isIE)
        deps.push("./env/ie");
    else {
        deps.push("./env/non_ie.js");
        if (env.isGecko)
            deps.push("./env/gecko");
        else if (env.isWebkit)
            deps.push("./env/webkit");
        else if (env.isOpera)
            deps.push("./env/opera");
    }

    require.def("lib-css", deps, function(){

return {
    /**
     * This method adds one class name to an HTMLElement and removes none or more.
     * @param {HTMLElement} oHtml        the HTMLElement to apply the css class to.
     * @param {String}      className    the name of the css class to apply.
     * @param {Array}       [exclusion]  a list of strings specifying names of css classes to remove.
     * @returns {HTMLElement}
     */
    setStyleClass : function(oHtml, className, exclusion, userAction){
        if (!oHtml || userAction && this.disabled)
            return;
    
        //#ifdef __DEBUG
        if (oHtml.nodeFunc) {
            throw new Error(debug && debug.formatErrorString(0, this,
                "Setting style class",
                "Trying to set style class on aml node. Only xml or html nodes can \
                 be passed to this function"));
        }
        //#endif
    
        if (className) {
            if (exclusion)
                exclusion[exclusion.length] = className;
            else
                exclusion = [className];
        }
    
        //Create regexp to remove classes
        //var re = new RegExp("(?:(^| +)" + (exclusion ? exclusion.join("|") : "") + "($| +))", "gi");
        var re = new RegExp("(^| +)(?:" + (exclusion ? exclusion.join("|") : "") + ")", "gi");
    
        //Set new class
        oHtml.className != null
            ? (oHtml.className = oHtml.className.replace(re, " ") + (className ? " " + className : ""))
            : oHtml.setAttribute("class", (oHtml.getAttribute("class") || "")
                .replace(re, " ") + (className ? " " + className : ""));
    
        return oHtml;
    },
    
    /**
     * This method imports a css stylesheet from a string
     * @param {String} cssString  the css definition
     * @param {Object} [doc]      the reference to the document where the css is applied on
     * @param {String} [media]    the media to which this css applies (i.e. 'print' or 'screen')
     */
    importCssString : function(cssString, doc, media){
        doc = doc || document;
        var htmlNode = doc.getElementsByTagName("head")[0];//doc.documentElement.getElementsByTagName("head")[0];
    
        //#ifdef __WITH_OPACITY_RUNTIME_FIX
        if (!features.supportOpacity) {
            cssString = cssString.replace(/opacity[ \s]*\:[ \s]*([\d\.]+)/g,
                function(m, m1){
                    return "filter:progid:DXImageTransform.Microsoft.Alpha(opacity=" + (m1*100) + ")";
                });
        }
        //#endif
    
        if (features.canCreateStyleNode) {
            //var head  = document.getElementsByTagName("head")[0];
            var style = doc.createElement("style");
            style.appendChild(doc.createTextNode(cssString));
            if (media)
                style.setAttribute('media', media);
            htmlNode.appendChild(style);
        }
        else {
            htmlNode.insertAdjacentHTML("beforeend", ".<style media='"
             + (media || "all") + "'>" + cssString + "</style>");
    
            /*if(document.body){
                document.body.style.height = "100%";
                $setTimeout('document.body.style.height = "auto"');
            }*/
        }
    },
    
    getHorBorders : function(oHtml){
        return Math.max(0,
              (parseInt(this.getStyle(oHtml, "borderLeftWidth")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderRightWidth")) || 0));
    },
    
    getVerBorders : function(oHtml){
        return Math.max(0,
              (parseInt(this.getStyle(oHtml, "borderTopWidth")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderBottomWidth")) || 0));
    },
    
    getWidthDiff : function(oHtml){
        if (features.hasFlexibleBox 
          && this.getStyle(oHtml, features.CSSPREFIX + "BoxSizing") != "content-box")
            return 0;
        
        return Math.max(0, (parseInt(this.getStyle(oHtml, "paddingLeft")) || 0)
            + (parseInt(this.getStyle(oHtml, "paddingRight")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderLeftWidth")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderRightWidth")) || 0));
    },
    
    getHeightDiff : function(oHtml){
        if (features.hasFlexibleBox 
          && this.getStyle(oHtml, features.CSSPREFIX + "BoxSizing") != "content-box")
            return 0;
        
        return Math.max(0, (parseInt(this.getStyle(oHtml, "paddingTop")) || 0)
            + (parseInt(this.getStyle(oHtml, "paddingBottom")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderTopWidth")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderBottomWidth")) || 0));
    },
    
    getDiff : function(oHtml){
        if (features.hasFlexibleBox 
          && this.getStyle(oHtml, features.CSSPREFIX + "BoxSizing") != "content-box")
            return [0,0];
        
        return [Math.max(0, (parseInt(this.getStyle(oHtml, "paddingLeft")) || 0)
            + (parseInt(this.getStyle(oHtml, "paddingRight")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderLeftWidth")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderRightWidth")) || 0)),
            Math.max(0, (parseInt(this.getStyle(oHtml, "paddingTop")) || 0)
            + (parseInt(this.getStyle(oHtml, "paddingBottom")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderTopWidth")) || 0)
            + (parseInt(this.getStyle(oHtml, "borderBottomWidth")) || 0))];
    },
    
    getMargin : function(oHtml) {
        return [(parseInt(this.getStyle(oHtml, "marginLeft")) || 0)
            + (parseInt(this.getStyle(oHtml, "marginRight")) || 0),
          (parseInt(this.getStyle(oHtml, "marginTop")) || 0)
            + (parseInt(this.getStyle(oHtml, "marginBottom")) || 0)]
    },
    
    getHtmlInnerWidth : function(oHtml){
        return (oHtml.offsetWidth
            - (parseInt(this.getStyle(oHtml, "borderLeftWidth")) || 0)
            - (parseInt(this.getStyle(oHtml, "borderRightWidth")) || 0));
    },
    
    getHtmlInnerHeight : function(oHtml){
        return (oHtml.offsetHeight
            - (parseInt(this.getStyle(oHtml, "borderTopWidth")) || 0)
            - (parseInt(this.getStyle(oHtml, "borderBottomWidth")) || 0));
    },
    
    /**
     * Returns the viewport of the a window.
     *
     * @param  {WindowImplementation} [win] The window to take the measurements of.
     * @return {Object}                     Viewport object with fields x, y, w and h.
     * @type   {Object}
     */
    getViewPort : function(win) {
        win = win || window;
        var doc = (!win.document.compatMode
          || win.document.compatMode == "CSS1Compat")
            //documentElement for an iframe
            ? win.document.html || win.document.documentElement
            : win.document.body;
    
        // Returns viewport size excluding scrollbars
        return {
            x     : win.pageXOffset || doc.scrollLeft,
            y     : win.pageYOffset || doc.scrollTop,
            width : win.innerWidth  || doc.clientWidth,
            height: win.innerHeight || doc.clientHeight
        };
    }
};

    })
});