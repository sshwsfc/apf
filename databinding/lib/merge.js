require.def(["lib-xml"], function(getXmlDom){

/**
 * Integrates nodes as children of a parent. Optionally attributes are
 * copied as well.
 *
 * @param {XMLNode} xmlNode the data to merge.
 * @param {XMLNode} parent  the node to merge on.
 * @param {Object}  options
 *   Properties:
 *   {Boolean} [copyAttributes] whether the attributes of xmlNode are copied as well.
 *   {Boolean} [clearContents]  whether the contents of parent is cleared.
 *   {Number}  [start]          This feature is used for the virtual viewport. More information will follow.
 *   {Number}  [length]         This feature is used for the virtual viewport. More information will follow.
 *   {Number}  [documentId]     This feature is used for the virtual viewport. More information will follow.
 *   {XMLElement} [marker]      This feature is used for the virtual viewport. More information will follow.
 * @return  {XMLNode}  the created xml node
 */
return function(XMLRoot, parentNode, options){
    if (typeof parentNode != "object")
        parentNode = getElementById(parentNode);

    if (options && options.clearContents) {
        //Signal listening elements
        var node, j, i,
            nodes = parentNode.selectNodes("descendant::node()[@" + apf.xmldb.xmlListenTag + "]");
        for (i = nodes.length - 1; i >= 0; i--) {
            var s = nodes[i].getAttribute(apf.xmldb.xmlListenTag).split(";");
            for (j = s.length - 1; j >= 0; j--) {
                node = apf.all[s[j]];
                if (!node) continue;
                if (node.dataParent && node.dataParent.xpath)
                    node.dataParent.parent.signalXmlUpdate[node.$uniqueId] = true;
                else if (node.$model)
                    node.$model.$waitForXml(node);
            }
        }
        
        //clean parent
        nodes = parentNode.childNodes;
        for (i = nodes.length - 1; i >= 0; i--)
            parentNode.removeChild(nodes[i]);
    }

    // #ifdef __WITH_VIRTUALVIEWPORT
    if (options && options.start) { //Assuming each node is in count
        var reserved, beforeNode, nodes, doc, i, l, marker = options.marker;
        if (!marker){
            //optionally find marker
        }

        //This code assumes that the dataset fits inside this marker

        //Start of marker
        if (marker.getAttribute("start") - options.start == 0) {
            marker.setAttribute("start", options.start + options.length);
            reserved = parseInt(marker.getAttribute("reserved"));
            marker.setAttribute("reserved", reserved + options.length);
            beforeNode = marker;
        }
        //End of marker
        else if (options.start + options.length == marker.getAttribute("end")) {
            marker.setAttribute("end", options.start + options.length);
            beforeNode = marker.nextSibling;
            reserved = parseInt(marker.getAttribute("reserved"))
                + parseInt(marker.getAttribute("end")) - options.length;
        }
        //Middle of marker
        else {
            var m2 = marker.parentNode.insertBefore(marker.cloneNode(true), marker);
            m2.setAttribute("end", options.start - 1);
            marker.setAttribute("start", options.start + options.length);
            reserved = parseInt(marker.getAttribute("reserved"));
            marker.setAttribute("reserved", reserved + options.length);
            beforeNode = marker;
        }

        nodes = XMLRoot.childNodes;

        if (parentNode.ownerDocument.importNode) {
            doc = parentNode.ownerDocument;
            for (i = 0, l = nodes.length; i < l; i++) {
                parentNode.insertBefore(doc.importNode(nodes[i], true), beforeNode)
                  .setAttribute(apf.xmldb.xmlIdTag, options.documentId + "|" + (reserved + i));
            }
        }
        else {
            for (i = nodes.length - 1; i >= 0; i--) {
                parentNode.insertBefore(nodes[0], beforeNode)
                  .setAttribute(apf.xmldb.xmlIdTag, options.documentId + "|" + (reserved + i));
            }
        }
    }
    else
    // #endif
    {
        beforeNode = options && options.beforeNode ? options.beforeNode : util.getFirstElement(parentNode);
        nodes      = XMLRoot.childNodes;

        if (parentNode.ownerDocument.importNode) {
            doc = parentNode.ownerDocument;
            for (i = 0, l = nodes.length; i < l; i++)
                parentNode.insertBefore(doc.importNode(nodes[i], true), beforeNode);
        }
        else
            for (i = nodes.length - 1; i >= 0; i--)
                parentNode.insertBefore(nodes[0], beforeNode);
    }

    if (options && options.copyAttributes) {
        var attr = XMLRoot.attributes;
        for (i = 0; i < attr.length; i++)
            if (attr[i].nodeName != apf.xmldb.xmlIdTag)
                parentNode.setAttribute(attr[i].nodeName, attr[i].nodeValue);
    }

    return parentNode;
};

    }
);