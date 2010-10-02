/**
 * Sets the nodeValue of a dom node.
 *
 * @param {XMLElement} xmlNode       the xml node that should receive the nodeValue.
 *                                   When an element node is passed the first text node is set.
 * @param {String}     nodeValue     the value to set.
 * @param {Boolean}    applyChanges  whether the changes are propagated to the databound elements.
 * @param {UndoObj}    undoObj       the undo object that is responsible for archiving the changes.
 */
apf.setNodeValue = function(xmlNode, nodeValue, applyChanges, options){
    if (!xmlNode)
        return;
    
    var undoObj, xpath, newNodes;
    if (options) {
        undoObj  = options.undoObj;
        xpath    = options.xpath;
        newNodes = options.newNodes;
        
        undoObj.extra.oldValue = options.forceNew
            ? ""
            : apf.queryValue(xmlNode, xpath);

        undoObj.xmlNode        = xmlNode;
        if (xpath) {
            xmlNode = apf.createNodeFromXpath(xmlNode, xpath, newNodes, options.forceNew);
        }

        undoObj.extra.appliedNode = xmlNode;
    }
    
    if (xmlNode.nodeType == 1) {
        if (!xmlNode.firstChild)
            xmlNode.appendChild(xmlNode.ownerDocument.createTextNode("-"));

        xmlNode.firstChild.nodeValue = apf.isNot(nodeValue) ? "" : nodeValue;

        if (applyChanges)
            apf.xmldb.applyChanges("text", xmlNode, undoObj);
    }
    else {
        // @todo: this should be fixed in libxml
        if (apf.isO3 && xmlNode.nodeType == 2)
            nodeValue = nodeValue.replace(/&/g, "&amp;");
        
        var oldValue      = xmlNode.nodeValue;
        xmlNode.nodeValue = apf.isNot(nodeValue) ? "" : nodeValue;
        
        if (undoObj) {
            undoObj.name = xmlNode.nodeName; 
        }
        
        //AML support - getters/setters would be awesome
        if (xmlNode.$triggerUpdate)
            xmlNode.$triggerUpdate(null, oldValue);

        if (applyChanges)
            apf.xmldb.applyChanges(xmlNode.nodeType == 2 ? "attribute" : "text", xmlNode.parentNode
                || xmlNode.ownerElement || xmlNode.selectSingleNode(".."),
                undoObj);
    }
    
    // #ifdef __WITH_RDB
    if (applyChanges) {
        var node;
        if (xpath) {
            var node = undoObj.xmlNode;//.selectSingleNode(newNodes.foundpath);
            if (node.nodeType == 9) {
                node = node.documentElement;
                xpath = xpath.replace(/^[^\/]*\//, "");//xpath.substr(newNodes.foundpath.length);
            }
        }
        else
            node = xmlNode;
        
        apf.xmldb.applyRDB(["setValueByXpath", node, nodeValue, xpath, 
            options && options.forceNew],
            undoObj || {xmlNode: xmlNode}
        );
    }
    // #endif
};