require.def(["debug/console"], function(console){

return {
    amlParts : [],

    auto : function(){
        
    },

    //#ifdef __WITH_PARTIAL_AML_LOADING
    /**
     * @private
     */
    parsePartialAml : function(docElement){
        //#ifdef __DEBUG
        apf.console.warn("The aml namespace definition wasn't found "
                       + "on the root node of this document. We're assuming "
                       + "you want to load a partial piece of aml embedded "
                       + "in this document. Starting to search for it now.");
        //#endif

        var findAml;
        if (apf.isIE) {
            findAml = function(htmlNode){
                //#ifdef __DEBUG
                if (htmlNode.outerHTML.match(/\/>$/)) {
                    throw new Error("Cannot have self closing elements!\n"
                        + htmlNode.outerHTML);
                }
                //#endif
                
                try {
                    var tags   = {"IMG":1,"LINK":1,"META":1,"INPUT":1,"BR":1,"HR":1,"AREA":1,"BASEFONT":1},
                        regex  = new RegExp(htmlNode.outerHTML.replace(/([\(\)\|\\\.\^\$\{\}\[\]])/g, "\\$1")
                               + ".*" + htmlNode.tagName),
                        match  = htmlNode.parentNode.outerHTML.replace(/\n/g, "").match(regex),
                        strXml = match[0] + ">"
                            .replace(/(\w+)\s*=\s*([^\>="'\s ]+)( |\s|\>|\/\>)/g, "$1=\"$2\"$3")
                            .replace(/ disabled /g, " disabled='true' ")
                            .replace(/\]\]\&gt;/g, "]]>")
                            .replace(/<(\w+)(\s[^>]*[^\/])?>/g, function(m, tag, c){
                                if (tags[tag]) {
                                    return "<" + tag + (c||"") + "/>";
                                }
                                else {
                                    return m;
                                }
                            });
                } 
                catch(e) {
                    //#ifdef __DEBUG
                    throw new Error(apf.formatErrorString(0, null,
                        "Parsing inline aml (without xmlns on root node)",
                        "Could not parse inline aml. This happens when the html"
                      + "is mangled too much by Internet Explorer. Either you "
                      + "are using a cdata section or javascript containing "
                      + "symbols that throw off the browser. Please put this aml "
                      + "in a seperate file and load it using an include element."));
                    //#endif
                    
                    return;
                }

                var xmlNode = apf.getAmlDocFromString("<div jid='"
                            + (id++) + "' " + strXmlns + ">"
                            + strXml + "</div>").documentElement;

                while (xmlNode.childNodes.length > 1)
                    xmlNode.removeChild(xmlNode.lastChild);

                apf.AppNode.appendChild(xmlNode);
            }
        }
        else {
            findAml = function(htmlNode){
                var strXml  = htmlNode.outerHTML.replace(/ _moz-userdefined=""/g, ""),
                    xmlNode = apf.getAmlDocFromString("<div jid='"
                            + (id++) + "' " + strXmlns + ">"
                            + strXml + "</div>").documentElement;

                while (xmlNode.childNodes.length > 1)
                    xmlNode.removeChild(xmlNode.lastChild);

                if (apf.isWebkit)
                    xmlNode = apf.AppNode.ownerDocument.importNode(xmlNode, true);

                apf.AppNode.appendChild(xmlNode);
            }
        }

        var match = document.body.outerHTML
                    .match(/(\w+)\s*=\s*["']http:\/\/ajax\.org\/2005\/aml["']/);
        if (!match)
            return false;

        var strXmlns = "xmlns:" + match[0],
            prefix = (RegExp.$1 || "").toUpperCase();
        if (apf.isOpera)
            prefix = prefix.toLowerCase();
        if (!prefix)
            return false;

        prefix += ":";

        apf.AppNode = apf.getAmlDocFromString("<" + prefix.toLowerCase()
            + "application " + strXmlns + " />").documentElement;

        var temp, loop, cnode,
            isPrefix = false,
            id       = 0,
            node     = document.body;
        while (node) {
            isPrefix = node.nodeType == 1
                && node.tagName.substr(0,2) == prefix;

            if (isPrefix) {
                findAml(cnode = node);

                if (apf.isIE) {
                    loop = node;
                    var count = 1, next = loop.nextSibling;
                    if (next) {
                        loop.parentNode.removeChild(loop);

                        while (next && (next.nodeType != 1 || next.tagName.indexOf(prefix) > -1)){
                            if (next.nodeType == 1)
                                count += next.tagName.charAt(0) == "/" ? -1 : 1;

                            if (count == 0) {
                                if (temp)
                                    temp.parentNode.removeChild(temp);
                                temp = next;
                                break;
                            }

                            next = (loop = next).nextSibling;
                            if (!next) {
                                next = loop;
                                break;
                            }
                            if (loop.nodeType == 1) {
                                loop.parentNode.removeChild(loop);
                                if (temp) {
                                    temp.parentNode.removeChild(temp);
                                    temp = null;
                                }
                            }
                            else {
                                if (temp)
                                    temp.parentNode.removeChild(temp);

                                temp = loop;
                            }
                        }

                        node = next; //@todo item should be deleted
                        //check here for one too far
                    }
                    else {
                        if (temp)
                            temp.parentNode.removeChild(temp);
                        temp = loop;
                    }
                }
                else {
                    if (temp)
                        temp.parentNode.removeChild(temp);

                    temp = node;
                    //node = node.nextSibling;
                }

                if (apf.amlParts.length
                  && apf.amlParts[apf.amlParts.length-1][1] == cnode)
                    apf.amlParts[apf.amlParts.length-1][1] = -1;

                apf.amlParts.push([node.parentNode, apf.isIE
                    ? node.nextSibling : node.nextSibling]);
            }
            else if (node.tagName == "SCRIPT" && node.getAttribute("src")
              && (node.getAttribute("src").indexOf("ajax.org") > -1)) {
                var strXml = node.outerHTML
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&amp;/g, "&")
                    .replace(/<SCRIPT[^>]*\>\s*<\!\[CDATA\[>?/i, "")
                    .replace(/<SCRIPT[^>]*\>(?:<\!\-\-)?/i, "")
                    .replace(/(\/\/)?\s*\&\#8211;>\s*<\/SCRIPT>/i, "")
                    .replace(/\-\->\s*<\/SCRIPT>/i, "")
                    .replace(/\]\](?:\&gt\;|>)\s*<\/SCRIPT>/i, "")
                    .replace(/<\/SCRIPT>$/mi, "")
                    .replace(/<\/?\s*(?:p|br)\s*\/?>/ig, "")
                    .replace(/<\!--\s*.*?\s*-->\s*<script.*/ig, "")
                    .replace(/\\+(['"])/g, "$1");

                if (strXml.trim()) {
                    var xmlNode = apf.getAmlDocFromString("<div jid='"
                        + (id++) + "' " + strXmlns + ">"
                        + strXml + "</div>").documentElement;

                    if (apf.isWebkit)
                        xmlNode = apf.AppNode.ownerDocument.importNode(xmlNode, true);

                    apf.AppNode.appendChild(xmlNode);

                    apf.amlParts.push([node.parentNode, node.nextSibling]);
                }
            }

            //Walk entire html tree
            if (!isPrefix && node.firstChild
              || node.nextSibling) {
                if (!isPrefix && node.firstChild) {
                    node = node.firstChild;
                }
                else {
                    node = node.nextSibling;
                }
            }
            else {
                do {
                    node = node.parentNode;

                    if (node.tagName == "BODY")
                        node = null;

                } while (node && !node.nextSibling)

                if (node) {
                    node = node.nextSibling;
                }
            }
        }

        if (temp)
            temp.parentNode.removeChild(temp);
    },
    //#endif

    /**
     * @private
     */
    parseAppMarkup : function(docElement){
        var isEmptyDocument = false;
        
        //#ifdef __WITH_PARTIAL_AML_LOADING
        if (this.parseStrategy == 1 || !this.parseStrategy && !docElement
          && document.documentElement.outerHTML.split(">", 1)[0]
             .indexOf(apf.ns.aml) == -1) {
            this.parsePartialAml(docElement);

            if (this.parseStrategy == 1 || apf.amlParts.length) {
                //#ifdef __DEBUG
                if (apf.amlParts.length)
                    apf.console.warn("Aml found, parsing...");
                //#endif

                apf.isParsingPartial = true;

                apf.loadAmlIncludes(apf.AppNode);

                if (!self.ERROR_HAS_OCCURRED) {
                    apf.initialize();
                }

                return;
            }
            else {
                //#ifdef __DEBUG
                apf.console.warn("No aml found.");
                //#endif
                isEmptyDocument = true;
            }
        }
        //#endif

        //#ifdef __WITH_PARTIAL_AML_LOADING_FROM_COMMENT
        //@todo this strategy needs some updating
        if (this.parseStrategy == 11 || !this.parseStrategy && !docElement
          && document.documentElement.outerHTML.split(">", 1)[0]
             .indexOf(apf.ns.aml) == -1) {
            //#ifdef __DEBUG
            apf.console.warn("The aml namespace definition wasn't found "
                           + "on the root node of this document. We're assuming "
                           + "you want to load a partial piece of aml embedded "
                           + "in this document. Starting to search for it now.");
            //#endif

            //Walk tree
            var str, x, node = document.body;
            while (node) {
                if (node.nodeType == 8) {
                    str = node.nodeValue;
                    if  (str.indexOf("[apf]") == 0) {
                        str = str.substr(5);

                        //#ifdef __DEBUG
                        apf.console.info("Found a piece of aml. Assuming "
                                       + "namespace prefix 'a'. Starting "
                                       + "parsing now.");
                        //#endif

                        x = apf.getXml("<a:applicaton xmlns:a='"
                            + apf.ns.aml + "'>" + str + "</a:applicaton>", true);

                        if (apf.isIE) { //@todo generalize this
                            x.ownerDocument.setProperty("SelectionNamespaces",
                                "xmlns:a='" + apf.ns.aml + "'");
                        }

                        apf.loadAmlIncludes(x);
                        apf.amlParts.push([x, node]);
                    }
                }

                //Walk entire html tree
                if (node.firstChild || node.nextSibling) {
                    node = node.firstChild || node.nextSibling;
                }
                else {
                    do {
                        node = node.parentNode;
                    } while (node && !node.nextSibling)

                    if (node)
                        node = node.nextSibling;
                }
            }

            if (!self.ERROR_HAS_OCCURRED
              && (apf.amlParts.length || this.parseStrategy == 11)) {
                apf.isParsingPartial = true;

                apf.initialize();

                return;
            }
            
            isEmptyDocument = true;
        }
        //#endif

        //#ifdef __WITH_PARSE_AML_FROM_HTML
        //Load aml without reloading the page, but also fully parse javascript
        //This requires there to be no self closing elements
        if (this.parseStrategy == 2) { //!this.parseStrategy
            var xmlStr;
            if (apf.isIE) {
                xmlStr = document.documentElement.outerHTML
                    .replace(/<SCRIPT.*SCRIPT>(?:[\r\n]+)?/g, "")
                    .replace(/^<HTM./, "<a:application")//xmlns:a='" + apf.ns.aml + "'
                    .replace(/HTML>$/, "a:application>")
                    .replace(/(\w+)\s*=\s*([^"'\s]+)\s/g, "$1=\"$2\" ");
            }
            else {
                xmlStr = document.documentElement.outerHTML
                    .replace(/<script.*\/>/g, "") //@todo for debug only
                    .replace(/ _moz-userdefined=""/g, "")
                    .replace(/^<HTM./, "<a:application xmlns='" + apf.ns.xhtml + "'")
                    .replace(/HTML>$/, "a:application>")
            }

            try {
                docElement = apf.getAmlDocFromString(xmlStr);

                //Clear Body
                var nodes = document.body.childNodes;
                for (var i = nodes.length - 1; i >= 0; i--)
                    nodes[i].parentNode.removeChild(nodes[i]);
            }
            catch(e) {
                //Parsing went wrong, if we're on auto strategy we'll try loading from file
                if (this.parseStrategy)
                    throw e; //Else we'll throw an error
            }
            //Maybe for IE8??
            //else if (apf.isIE)
            //    apf.TAGNAME = "tagName";
            
            isEmptyDocument = true;
        }
        //#endif

        //#ifdef  __WITH_PARSE_DOC_BY_RELOADING
        if (isEmptyDocument && document.documentElement.outerHTML
          .split(">", 1)[0]
          .indexOf(apf.ns.aml) == -1) {
            //#ifdef __DEBUG
            apf.console.warn("The aml namespace declaration wasn't found. "
                           + "No aml elements were found in the body. Exiting");
            //#endif
            return false;
        }

        //Load current HTML document as 'second DOM'
        if (this.parseStrategy == 21 || !this.parseStrategy && !docElement) {
            return apf.oHttp.get((apf.alternativeAml 
              || document.body && document.body.getAttribute("xmlurl") 
              || location.href).split(/#/)[0], {
                //#ifdef __DEBUG
                type : "markup",
                //#endif
                callback: function(xmlString, state, extra){
                    if (state != apf.SUCCESS) {
                        var oError = new Error(apf.formatErrorString(0, null,
                            "Loading XML application data", "Could not load "
                          + "XML from remote source: " + extra.message));

                        if (extra.tpModule.retryTimeout(extra, state, null, oError) === true)
                            return true;

                        throw oError;
                    }

                    //#ifdef __DEBUG
                    apf.lineBodyStart = (xmlString.replace(/\n/g, "\\n")
                        .match(/(.*)<body/) || [""])[0].split("\\n").length;
                    //#endif

                    //@todo apf3.0 rewrite this flow
                    var str = xmlString.replace(/\<\!DOCTYPE[^>]*>/, "")
                      .replace(/^[\r\n\s]*/, ""); //.replace(/&nbsp;/g, " ") //should be html2xmlentity conversion
                    if (!apf.supportNamespaces)
                        str = str.replace(/xmlns\=\"[^"]*\"/g, "");
                    //var xmlNode = apf.getXmlDom(str);//apf.getAmlDocFromString(xmlString);

                    if (self.ERROR_HAS_OCCURRED)
                        return;

                    //Clear Body
                    if (apf.isIE)
                        document.body.innerHTML ="";
                    else {
                        var nodes = document.body.childNodes;
                        for (var i = nodes.length - 1; i >= 0; i--)
                            nodes[i].parentNode.removeChild(nodes[i]);
                    }

                    // #ifndef __SUPPORT_GWT
                    document.documentElement.style.display = "block";
                    document.body.style.display = "block"; //might wanna make this variable based on layout loading...
                    // #endif

                    apf.initialize(str);

                }, ignoreOffline: true});
        }
        else {
            // #ifndef __SUPPORT_GWT
            //might wanna make this variable based on layout loading...
            document.body.style.display = "block";
            // #endif

            if (!self.ERROR_HAS_OCCURRED)
                apf.initialize(docElement.outerHTML || docElement.xml);
        }
        //#endif
    },
    

    /**
     * @private
     */
    initialize : function(xmlStr){
        // #ifdef __DESKRUN
        if (apf.initialized) return;
        apf.initialized = true;
        // #endif

        /*#ifdef __SUPPORT_GWT
        document.body.style.display = "block"; //might wanna make this variable based on layout loading...
        #endif*/

        apf.console.info("Initializing...");
        clearInterval(apf.Init.interval);

        // Run Init
        apf.Init.run(); //Process load dependencies
        
        //#ifdef __WITH_PARTIAL_AML_LOADING
        if (apf.isParsingPartial) {
            apf.config.setDefaults();
            apf.hasSingleRszEvent = true;

            var pHtmlNode = document.body;
            var lastChild = pHtmlNode.lastChild;
            apf.AmlParser.parseMoreAml(apf.AppNode, pHtmlNode, null,
                true, false);

            var pNode, firstNode, next, info,
                lastBefore = null,
                loop       = pHtmlNode.lastChild;
            while (loop && lastChild != loop) {
                info = apf.amlParts[loop.getAttribute("jid")];
                next = loop.previousSibling;
                if (info) {
                    pNode = info[0];
                    if ("P".indexOf(pNode.tagName) > -1) {
                        lastBefore = pNode.parentNode.insertBefore(
                            apf.getNode(loop, [0]), pNode);
                    }
                    else {
                        firstNode = apf.getNode(loop, [0]);
                        while(firstNode){
                            if (firstNode) {
                                lastBefore = pNode.insertBefore(firstNode,
                                    typeof info[1] == "number" ? lastBefore : info[1]);
                            }
                            else {
                                lastBefore = typeof info[1] == "number" 
                                    ? lastBefore
                                    : info[1];
                            }
                            firstNode = apf.getNode(loop, [0]);
                        }
                    }

                    loop.parentNode.removeChild(loop);
                }
                loop = next;
            }

            //#ifdef __WITH_LAYOUT
            $setTimeout("apf.layout.forceResize();");
            // #endif
        }
        else
        //#endif
        {
            apf.window.init(xmlStr);
        }
    }
}

});