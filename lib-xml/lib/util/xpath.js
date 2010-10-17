define([
    "lib-xml", 
    "lib-xml/util",
    "optional!debug",
    "optional!databinding/xmldb"], 
    function(getXmlDom, xmlUtil, debug, xmldb){

return {
    /**
     * Creates an xml node based on an xpath statement.
     *
     * @param {DOMNode} contextNode  the dom node that is subject to the query.
     * @param {String}  xPath        the xpath query.
     * @param {Array}   [addedNodes] this array is filled with the nodes added.
     * @param {Boolean} [forceNew]   whether a new node is always created.
     * @return {DOMNode} the last element found.
     * @todo generalize this to include attributes in if format []
     */
    createNodeFromXpath : function(contextNode, xPath, addedNodes, forceNew){
        var xmlNode, foundpath = "", paths = xPath.replace(/('.*?')|(".*?")|\|/g, function(m, m1, m2){
            if (m1 || m2) return m1 || m2;
            return "-%-|-%-";
        }).split("-%-|-%-")[0].split(/\/(?!\/)/);//.split("/");
        if (!forceNew && (xmlNode = contextNode.selectSingleNode(xPath)))
            return xmlNode;
    
        var len = paths.length - 1;
        if (forceNew) {
            if (paths[len].trim().match(/^\@(.*)$|^text\(\)$/))
                len--;
        }
    
        //Directly forwarding to the document element because of a bug in the o3 xml lib
        if (!paths[0]) {
            contextNode = contextNode.ownerDocument.documentElement;
            paths.shift();paths.shift();
            len--;len--;
        }
        
        for (var addedNode, isAdding = false, i = 0; i < len; i++) {
            if (!isAdding && contextNode.selectSingleNode(foundpath
              + (i != 0 ? "/" : "") + paths[i])) {
                foundpath += (i != 0 ? "/" : "") + paths[i];// + "/";
                continue;
            }
            
            //Temp hack 
            var isAddId = paths[i].match(/(\w+)\[@([\w-]+)=(\w+)\]/);
            // #ifdef __DEBUG
            if (!isAddId && paths[i].match(/\@|\[.*\]|\(.*\)/)) {
                throw new Error(debug.formatErrorString(1041, this, 
                    "Select via xPath", 
                    "Could not use xPath to create xmlNode: " + xPath));
            }
            if (!isAddId && paths[i].match(/\/\//)) {
                throw new Error(debug.formatErrorString(1041, this, 
                    "Select via xPath", 
                    "Could not use xPath to create xmlNode: " + xPath));
            }
            // #endif
    
            if (isAddId)
                paths[i] = isAddId[1];
    
            isAdding = true;
            addedNode = contextNode.selectSingleNode(foundpath || ".")
                .appendChild(contextNode.ownerDocument.createElement(paths[i]));
    
            if (isAddId) {
                addedNode.setAttribute(isAddId[2], isAddId[3]);
                foundpath += (foundpath ? "/" : "") + isAddId[0];// + "/";
            }
            else
                foundpath += (foundpath ? "/" : "") + paths[i];// + "/";
    
            if (addedNodes)
                addedNodes.push(addedNode);
        }
    
        if (!foundpath)
            foundpath = ".";
        if (addedNodes)
            addedNodes.foundpath = foundpath;
    
        var newNode, lastpath = paths[len], 
            doc = contextNode.nodeType == 9 ? contextNode : contextNode.ownerDocument;
        do {
            if (lastpath.match(/^\@(.*)$/)) {
                (newNode || contextNode.selectSingleNode(foundpath))
                    .setAttributeNode(newNode = doc.createAttribute(RegExp.$1));
            }
            else if (lastpath.trim() == "text()") {
                newNode = (newNode || contextNode.selectSingleNode(foundpath))
                    .appendChild(doc.createTextNode(""));
            }
            else {
                var hasId = lastpath.match(/(\w+)\[@([\w-]+)=(\w+)\]/);
                if (hasId) lastpath = hasId[1];
                newNode = (newNode || contextNode.selectSingleNode(foundpath))
                    .appendChild(doc.createElement(lastpath));
                if (hasId)
                    newNode.setAttribute(hasId[2], hasId[3]);
            }
            
            if (addedNodes)
                addedNodes.push(newNode);
            
            foundpath += (foundpath ? "/" : "") + paths[len];
        } while((lastpath = paths[++len]));
    
        return newNode;
    },
    
    //@todo this function needs to be 100% proof, it's the core of the system
    //for RDB: xmlNode --> Xpath statement
    xmlToXpath : function(xmlNode, xmlContext, useAID){
        if (!xmlNode) //@todo apf3.0
            return "";
        
        if (xmldb && useAID === true && xmlNode.nodeType == 1 && xmlNode.getAttribute(xmldb.xmlIdTag)) {
            return "//node()[@" + xmldb.xmlIdTag + "='" 
                + xmlNode.getAttribute(xmldb.xmlIdTag) + "']";
        }
    
        if (apf != this && this.lookup && this.select) {
            var unique, def = this.lookup[xmlNode.tagName];
            if (def) {
                //unique should not have ' in it... -- can be fixed...
                unique = xmlNode.selectSingleNode(def).nodeValue;
                return "//" + xmlNode.tagName + "[" + def + "='" + unique + "']";
            }
            
            for (var i = 0, l = this.select.length; i < l; i++) {
                if (xmlNode.selectSingleNode(this.select[i][0])) {
                    unique = xmlNode.selectSingleNode(this.select[i][1]).nodeValue;
                    return "//" + this.select[i][0] + "[" + this.select[i][1]
                        + "='" + unique + "']";
                }
            }
        }
    
        if (xmlNode == xmlContext)
            return ".";
    
        if (xmlNode.nodeType != 2 && !xmlNode.parentNode && !xmlNode.ownerElement) {
            //#ifdef __DEBUG
            throw new Error(debug.formatErrorString(0, null, 
                "Converting XML to Xpath", 
                "Error xml node without parent and non matching context cannot\
                 be converted to xml.", xmlNode));
            //#endif
            
            return false;
        }
    
        var str = [], lNode = xmlNode;
        if (lNode.nodeType == 2) {
            str.push("@" + lNode.nodeName);
            lNode = lNode.ownerElement || xmlNode.selectSingleNode("..");
        }
    
        var id;//, pfx = "";
        while(lNode && lNode.nodeType == 1) {
            if (lNode == xmlContext) {
                //str.unshift("/");//pfx = "//";
                break;
            }
            str.unshift((lNode.nodeType == 1 ? lNode.tagName : "text()") 
                + "[" + (xmldb && useAID && (id = lNode.nodeType == 1 && lNode.getAttribute(xmldb.xmlIdTag))
                    ? "@" + xmldb.xmlIdTag + "='" + id + "'"
                    : (xmlUtil.getChildNumber(lNode, lNode.parentNode.selectNodes(lNode.nodeType == 1 ? lNode.tagName : "text()")) + 1))
                 + "]");
            lNode = lNode.parentNode;
        };
    
        return (str[0] == "/" || xmlContext && xmlContext.nodeType == 1 ? "" : "/") + str.join("/"); //pfx + 
    },
        
    //for RDB: Xpath statement --> xmlNode
    xpathToXml : function(xpath, xmlNode){
        if (!xmlNode) {
            //#ifdef __DEBUG
            throw new Error(debug.formatErrorString(0, null, 
                "Converting Xpath to XML", 
                "Error context xml node is empty, thus xml node cannot \
                 be found for '" + xpath + "'"));
            //#endif
            
            return false;
        }
        
        return xmlNode.selectSingleNode(xpath);
    }
}

    }
);