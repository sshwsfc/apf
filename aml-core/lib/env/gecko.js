module.declare(function(require, exports, module){

var serializer = new XMLSerializer();
var o = document.createElement("div");
amlCore.insertHtmlNodes = function(nodeList, htmlNode, beforeNode) {
    var frag = document.createDocumentFragment(),
        i    = nodeList.length - 1,
        l, node;
    for (; i >= 0; i--) {
        node = nodeList[i];
        frag.insertBefore(node, frag.firstChild);
    }

    o.innerHTML = serializer.serializeToString(frag).unescapeHTML()
        .replace(/<([^>]+)\/>/g, "<$1></$1>");

    frag = document.createDocumentFragment();
    for (i = 0, l = o.childNodes.length; i < l; i++) {
        node = o.childNodes[0];
        frag.appendChild(node);
    }

    if (beforeNode)
        htmlNode.insertBefore(frag, beforeNode);
    htmlNode.appendChild(frag);
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

    o.innerHTML = s.replace(/<([^>]+)\/>/g, "<$1></$1>");

    if (beforeNode)
        htmlNode.insertBefore(o.firstChild, beforeNode);
    else
        htmlNode.appendChild(o.firstChild);

    return beforeNode ? beforeNode.previousSibling : htmlNode.lastChild;
};

    }
);