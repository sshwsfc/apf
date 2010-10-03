require.modify(
    "aml-core", 
    "aml-core/w3c", 
    ["aml-core", "ecmaext/string"]
    function(amlCore){

var serializer = new XMLSerializer();
amlCore.insertHtmlNodes = function(nodeList, htmlNode, beforeNode) {
    var node,
        frag = document.createDocumentFragment(),
        i    = 0,
        l    = nodeList.length
    for (; i < l; i++) {
        if (!(node = nodeList[i])) continue;
        frag.appendChild(node);
    }
    (beforeNode || htmlNode).insertAdjacentHTML(beforeNode
        ? "beforebegin"
        : "beforeend", serializer.serializeToString(frag)
            .unescapeHTML().replace(/<([^>]+)\/>/g, "<$1></$1>"));
};

amlCore.insertHtmlNode = function(xmlNode, htmlNode, beforeNode, s) {
    if (htmlNode.nodeType != 11 && !htmlNode.style)
        return htmlNode.appendChild(xmlNode);
    
    if (!s) {
        s = (xmlNode.serialize 
            ? xmlNode.serialize(true)
            : ((xmlNode.nodeType == 3 || xmlNode.nodeType == 4 || xmlNode.nodeType == 2)
                ? xmlNode.nodeValue
                : serializer.serializeToString(xmlNode))).unescapeHTML();
    }
    
    (beforeNode || htmlNode).insertAdjacentHTML(beforeNode
        ? "beforebegin"
        : "beforeend", s.replace(/<([^>]+)\/>/g, "<$1></$1>"));

    return beforeNode ? beforeNode.previousSibling : htmlNode.lastChild;
};

    }
);