require.def(
    "lib-xml/xmlns", 
    ["envdetect/features"], 
    function(feat){
    
function findPrefix(xmlNode, xmlns){
    var docEl;
    if (xmlNode.nodeType == 9) {
        if (!xmlNode.documentElement)
            return false;
        if (xmlNode.documentElement.namespaceURI == xmlns)
            return xmlNode.prefix || xmlNode.scopeName;
        docEl = xmlNode.documentElement;
    }
    else {
        if (xmlNode.namespaceURI == xmlns)
            return xmlNode.prefix || xmlNode.scopeName;
        docEl = xmlNode.ownerDocument.documentElement;
        if (docEl && docEl.namespaceURI == xmlns)
            return xmlNode.prefix || xmlNode.scopeName;

        while (xmlNode.parentNode) {
            xmlNode = xmlNode.parentNode;
            if (xmlNode.namespaceURI == xmlns)
                return xmlNode.prefix || xmlNode.scopeName;
        }
    }

    if (docEl) {
        for (var i = 0; i < docEl.attributes.length; i++) {
            if (docEl.attributes[i].nodeValue == xmlns)
                return docEl.attributes[i][feat.TAGNAME]
        }
    }

    return false;
}

/*
 * Replacement for getElementsByTagNameNS because some browsers don't support
 * this call yet.
 */
return function(xmlNode, tag, xmlns, prefix){
    if (!feat.supportNamespaces) {
        if (!prefix)
            prefix = findPrefix(xmlNode, xmlns);

        if (xmlNode.style || xmlNode == document)
            return xmlNode.getElementsByTagName(tag)
        else {
            if (prefix)
                (xmlNode.nodeType == 9 ? xmlNode : xmlNode.ownerDocument)
                    .setProperty("SelectionNamespaces",
                        "xmlns:" + prefix + "='" + xmlns + "'");

            return xmlNode.selectNodes(".//" + (prefix ? prefix + ":" : "") + tag);
        }
    }
    return xmlNode.getElementsByTagNameNS(xmlns, tag);
};

    }
);