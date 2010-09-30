//#ifdef __PARSER_AML
    //#endif
    //#ifdef __WITH_PARTIAL_AML_LOADING
    /**
     * @private
     */
    amlParts : [],
    //#endif

    /**
     * Determines the way apf tries to render this application. Set this value
     * before apf is starts parsing.
     *   Possible values:
     *   0    auto
     *   1    partial
     *   11   partial from a comment
     *   2    full from serialized document or file fallback
     *   21   full from file
     * @type {Number}
     */
    parseStrategy : 0,

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
        
        //#ifdef __WITH_DEFAULT_SKIN
        apf.skins.defaultSkin = '<?xml version="1.0" encoding="utf-8"?>'
            + '<a:skin xmlns:a="http://ajax.org/2005/aml" xmlns="http://www.w3.org/1999/xhtml">'
            + '<a:checkbox name="checkbox"><a:style><![CDATA[.cbcontainer{padding: 2px 2px 2px 18px;'
            + '_padding: 2px; /* IE6 fix */position: relative;min-height: 13px;'
            + 'color: #4b4b4b;background: url(images/spacer.gif);_clear: both; /* IE6 fix */}'
            + '.cbcontainer span{font-family: Tahoma;font-size: 11px;cursor: default;padding: 1px 3px 2px 3px;'
            + 'margin : -1px 0 0 0;overflow: hidden;display: block;float: left;line-height: 13px;}'
            + '.cbcontainerFocus span{padding: 0px 2px 1px 2px;border: 1px dotted #BBB;}'
            + '.cbcontainerChecked.cbcontainerDown.cbcontainerFocus .checkbox {background-position: 0 -48px;}'
            + '.cbcontainer .checkbox{width: 12px;height: 12px;overflow: hidden;position: absolute;'
            + 'left: 2px;top: 2px;_position: relative; /* IE6 fix */_float: left; /* IE6 fix */_margin: -2px 4px 0 0; /* IE6 fix */'
            + 'background: url("images/checkbox.png") no-repeat 0 -12px;}.cbcontainerDown .checkbox{background-position: 0 -36px;}'
            + '.cbcontainerChecked .checkbox{background-position: 0 -24px;}.cbcontainerError span{background-color : #ffb500;color: #fbfbfb;}'
            + '.cbcontainerDisabled .checkbox{background-position: 0 -0px;}.cbcontainerDisabled span{color: #bebebe;}'
            + '.cbcontainer br{display: none;}]]></a:style><a:style condition="!apf.isIE">'
            + '<![CDATA[.cbcontainer br{line-height: 0;display: block;}]]></a:style>'
            + '<a:presentation><a:main label="span/text()"><div class="cbcontainer"><div class="checkbox"> </div>'
            + '<span>-</span><br clear="left" /></div></a:main>'
            + '</a:presentation></a:checkbox>'
            + '<a:bar name="bar"><a:style><![CDATA[#jem.apf_bar {position: relative;color: #4b4b4b;font-family: Tahoma;'
            + 'font-size: 10px;padding: 10px;border: 1px solid #f3f3f3;cursor: default;margin: 0;'
            + 'background: white url(images/resizehandle.gif) no-repeat right bottom;z-index: 10000;}'
            + '#jem.apf_bar img {position: absolute;bottom: 13px;left: 216px;}#jem.apf_bar .apf_counter {'
            + 'position: absolute;bottom: 5px;left: 40px;}#jem.apf_bar .apf_countdown {position: absolute;'
            + 'bottom: 5px;right: 142px;}#jem.apf_bar .apf_volume {position: absolute;'
            + 'bottom: 5px;right: 119px;left: auto;background: none;width: 16px;height: 16px;'
            + 'margin: 0;padding: 0;cursor: pointer;cursor: hand;}#jem.apf_bar .apf_volume span {'
            + 'margin: 0;padding: 0;width: 16px;height: 16px;}#jem.apf_bar .apf_fullscreen {'
            + 'position: absolute;bottom: 2px;right: 28px;left: auto;width: 14px;background: transparent;'
            + 'cursor: pointer;cursor: hand;}#jem.apf_bar .apf_fullscreen span {height:14px;width:14px;'
            + 'margin:3px auto 0 0;}]]></a:style><a:presentation><a:main container="." resize-corner="17">'
            + '<div class="apf_bar" id="jem"> </div></a:main></a:presentation></a:bar>'
            + '<a:label name="label"><a:style><![CDATA[#jem .apf_label{font-size: 8pt;font-family: Tahoma;'
            + 'overflow: hidden;cursor: default;line-height : 1.5em;margin : 0;}#jem .apf_labelDisabled{'
            + 'color: #bebebe;}#jem .tiny {font-size : 9px;}#jem .error .apf_label{background : url(images/alert.png) no-repeat 0 0;'
            + 'min-height : 37px;padding : 3px 0 0 45px;}]]></a:style><a:presentation>'
            + '<a:main caption="." for="@for"><div class="apf_label"> </div></a:main></a:presentation></a:label>'
            + '<a:slider name="slider"><a:style><![CDATA[#jem .apf_slider {background: url("images/bar_right.png") no-repeat top right;'
            + 'height: 8px;position: relative;font-family: Tahoma;font-size: 9px;text-align: center;'
            + 'position: absolute;bottom: 9px;right: 53px;margin: 0;}#jem .apf_sliderDisabled {'
            + 'background-position: right -8px;}#jem .apf_slider .apf_left {background: url("images/bar_left.png") no-repeat top left;'
            + 'height: 8px;overflow: hidden;margin: 0;margin-right: 4px;}#jem .apf_sliderDisabled .apf_left {'
            + 'background-position: left -8px;}#jem .apf_sliderDisabled .apf_filledbar {background-position: 0 -8px;}'
            + '#jem .apf_slider .apf_grabber {background: url("images/slider3.png") no-repeat top left;'
            + 'width: 12px;height: 8px;overflow: hidden;position: absolute;margin: 0;}#jem .apf_sliderDisabled .apf_grabber {'
            + 'background-position: left -8px;}]]></a:style><a:presentation>'
            + '<a:main slider="div[1]" container="." status2="div[2]/text()" markers="." direction="horizontal">'
            + '<div class="apf_slider"><div class="apf_grabber"> </div><div class="apf_left"> </div></div></a:main>'
            + '<marker><u> </u></marker></a:presentation></a:slider>'
            + '<a:slider name="slider16"><a:style><![CDATA[#jem .apf_slider16 {background: url("images/bar16x_right.png") no-repeat top right;'
            + 'width: 300px;height: 16px;position: relative;padding-right: 7px;font-family: Tahoma;font-size: 9px;'
            + 'text-align: center;position: absolute;bottom: 6px;left: 82px;margin: 0;}#jem .apf_slider16Disabled {background-position: right -16px;}'
            + '#jem .apf_slider16 .apf_left {background: url("images/bar16x_left.png") no-repeat top left;'
            + 'height: 16px;overflow: hidden;margin: 0;}#jem .apf_slider16Disabled .apf_left {background-position: left -16px;}'
            + '#jem .apf_slider16 .apf_grabber {background: url("images/rslider16x.png") no-repeat top right;'
            + 'width: 20px;height: 16px;overflow: hidden;position: absolute;margin: 0;}#jem .apf_slider16Disabled .apf_grabber {'
            + 'background-position: left -16px;margin-left: 7px;cursor: normal;}#jem .apf_slider16 .apf_sldprogress {'
            + 'background: #ddd;display: block;overflow: hidden;height: 4px;margin-left: 6px;margin-top: 6px;z-index: 0;}]]>'
            + '</a:style><a:presentation><a:main slider="div[1]" container="." progress="div[2]" status2="div[2]/text()" markers="." '
            + 'direction="horizontal"><div class="apf_slider16"><div class="apf_grabber"> </div><div class="apf_left"> </div></div></a:main>'
            + '<progress><span class="apf_sldprogress"></span></progress><marker><u></u></marker>'
            + '</a:presentation></a:slider>'
            + '<a:button name="button"><a:style><![CDATA[#jem .apf_button {color: #4b4b4b;font-family: Tahoma;'
            + 'font-size: 8pt;height: 21px;width: 34px;overflow: hidden;cursor: default;background: url(images/mediabtn2.png) no-repeat 0 -42px;'
            + 'position: absolute;bottom: 3px;left: 3px;margin: 0;}#jem .apf_buttonOver {background-position: 0 -21px;}'
            + '#jem .apf_buttonDisabled {background-position: 0 -42px;}#jem .apf_buttonDown {background-position: 0 0px;}'
            + '#jem .apf_button span {display: block;background: no-repeat 0 0;width: 11px;height: 10px;margin: 4px auto 0 11px;}]]>'
            + '</a:style><a:presentation><a:main background="span" icon="span"><div class="apf_button"><span></span></div>'
            + '</a:main></a:presentation></a:button>'
            + '<a:video name="video"><a:style><![CDATA[#jem .apf_video {line-height:300px;margin:0;'
            + 'padding:0;text-align:center;vertical-align:middle;overflow : hidden;background : black;}'
            + '#jem .apf_video #qt_event_source{position : absolute;left : 0;top : 0;}]]></a:style>'
            + '<a:presentation><a:main container="."><div class="apf_video"></div></a:main></a:presentation>'
            + '</a:video></a:skin>';
        if (false && !apf.skins.skins["default"] && apf.skins.defaultSkin) {
            //#ifdef __DEBUG
            apf.console.warn("No skin definition found. Using default skin.");
            //#endif

            //var xmlString = apf.skins.defaultSkin.replace('xmlns="http://www.w3.org/1999/xhtml"', '');
            //var xmlNode = apf.getAmlDocFromString(apf.skins.defaultSkin).documentElement; //@todo should get preprocessed
            //@todo apf3.0 rewrite this flow
            var str = apf.skins.defaultSkin.replace(/\<\!DOCTYPE[^>]*>/, "")
              .replace(/&nbsp;/g, " ").replace(/^[\r\n\s]*/, "");
            if (!apf.supportNamespaces)
                str = str.replace(/xmlns\=\"[^"]*\"/g, "");
            var xmlNode = apf.getXml(str);//apf.getAmlDocFromString(xmlString);
              
            xmlNode.setAttribute("media-path", apf.CDN + apf.VERSION + "/images/")
            xmlNode.setAttribute("icon-path", apf.CDN + apf.VERSION + "/icons/")
            
            apf.skins.Init(xmlNode);
        }
        //#endif
        
        var bodyMarginTop = parseFloat(apf.getStyle(document.body, "marginTop"));
        apf.doesNotIncludeMarginInBodyOffset = (document.body.offsetTop !== bodyMarginTop);

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
    },