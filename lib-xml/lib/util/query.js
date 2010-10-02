/**
 * Sets a value of an XMLNode based on an xpath statement executed on a reference XMLNode.
 *
 * @param  {XMLNode}  xmlNode  the reference xml node.
 * @param  {String}  xpath  the xpath used to select a XMLNode.
 * @param  {String}  value  the value to set.
 * @param  {Boolean}  local  whether the call updates databound UI.
 * @return  {XMLNode}  the changed XMLNode
 */
apf.setQueryValue = function(xmlNode, xpath, value, local){
    var node = apf.createNodeFromXpath(xmlNode, xpath);
    if (!node)
        return null;

    apf.setNodeValue(node, value, !local);
    //apf.xmldb.setTextNode(node, value);
    return node;
};

/**
 * Removed an XMLNode based on an xpath statement executed on a reference XMLNode.
 *
 * @param  {XMLNode}  xmlNode  the reference xml node.
 * @param  {String}  xpath  the xpath used to select a XMLNode.
 * @return  {XMLNode}  the changed XMLNode
 */
apf.removeQueryNode = function(xmlNode, xpath, local){
    var node = apf.queryNode(xmlNode, xpath);
    if (!node)
        return false;

    if (local)
        node.parentNode.removeChild(node);
    else
        apf.xmldb.removeNode(node);
    
    return node;
};

/**
 * Queries an xml node using xpath for a string value.
 * @param {XMLElement} xmlNode the xml element to query.
 * @param {String}     xpath   the xpath query.
 * @return {String} the value of the query result or empty string.
 */
apf.queryValue = function (xmlNode, xpath){
    if (!xmlNode) 
        return "";
    if (xmlNode.nodeType == 2) 
        return xmlNode.nodeValue;

    if (xpath) {
        xmlNode = xmlNode.selectSingleNode(xpath);
        if (!xmlNode) 
            return "";
    }
   return xmlNode.nodeType == 1
        ? (!xmlNode.firstChild ? "" : xmlNode.firstChild.nodeValue)
        : xmlNode.nodeValue;
};

/**
 * Queries an xml node using xpath for a string value.
 * @param {XMLElement} xmlNode the xml element to query.
 * @param {String}     xpath   the xpath query.
 * @return {Arary} list of values which are a result of the query.
 */
apf.queryValues = function(xmlNode, xpath){
    var out = [];
    if (!xmlNode) return out;

    var nodes = xmlNode.selectNodes(xpath);
    if (!nodes.length) return out;

    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.nodeType == 1)
            n = n.firstChild;
        out.push(n.nodeValue || "");
    }
    return out;
};

/**
 * Executes an xpath expression on any dom node. This is especially useful
 * for dom nodes that don't have a good native xpath processor such as html
 * in some versions of internet explorer and xml in webkit.
 *
 * @param {DOMNode} contextNode  the xml node that is subject to the query.
 * @param {String}  sExpr        the xpath expression.
 * @returns {Array} list of xml nodes found. The list can be empty.
 */
apf.queryNodes = function(contextNode, sExpr){
    if (contextNode && (apf.hasXPathHtmlSupport && contextNode.selectSingleNode || !contextNode.style))
        return contextNode.selectNodes(sExpr); //IE55
    //if (contextNode.ownerDocument != document)
    //    return contextNode.selectNodes(sExpr);

    return apf.XPath.selectNodes(sExpr, contextNode)
};

/**
 * Executes an xpath expression on any dom node. This is especially useful
 * for dom nodes that don't have a good native xpath processor such as html
 * in some versions of internet explorer and xml in webkit. This function
 * Only returns the first node found.
 *
 * @param {DOMNode} contextNode  the dom node that is subject to the query.
 * @param {String}  sExpr        the xpath expression.
 * @returns {XMLNode} the dom node found or null if none was found.
 */
apf.queryNode = function(contextNode, sExpr){
    if (contextNode && (apf.hasXPathHtmlSupport && contextNode.selectSingleNode || !contextNode.style))
        return contextNode.selectSingleNode(sExpr); //IE55
    //if (contextNode.ownerDocument != document)
    //    return contextNode.selectSingleNode(sExpr);

    var nodeList = apf.queryNodes(contextNode ? contextNode : null,
        sExpr + (apf.isIE ? "" : "[1]"));
    return nodeList.length > 0 ? nodeList[0] : null;
};