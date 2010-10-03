require.modify(
    "aml-core", 
    "aml-core/ie", 
    ["aml-core", 
    "ecmaext/string", 
    "envdetect", 
    "optional!debug/console"]
    function(amlCore, env, console){
        
//IE fix
try {
    document.execCommand("BackgroundImageCache", false, true);
}
catch(e) {}
 
amlCore.insertHtmlNodes = function(nodeList, htmlNode, beforeNode){
    for (var str = [], i = 0, l = nodeList.length; i < l; i++)
        str[i] = nodeList[i].xml;

    str = str.join("").unescapeHTML();
    
    if (env.isIE < 7)
        str = str.replace(/style="background-image:([^"]*)"/g, 
          "find='$1' style='background-image:$1'");

    try {
        (beforeNode || htmlNode).insertAdjacentHTML(beforeNode
            ? "beforebegin"
            : "beforeend", str);
    }
    catch (e) {
        //IE table hack
        document.body.insertAdjacentHTML("beforeend", "<table><tr>"
            + str + "</tr></table>");

        var x = document.body.lastChild.firstChild.firstChild;
        for (i = x.childNodes.length - 1; i >= 0; i--)
            htmlNode.appendChild(x.childNodes[0]);
    }

    //Fix IE image loading bug
    if (env.isIE < 7) {
        $setTimeout(function(){
            var nodes = htmlNode.getElementsByTagName("*");
            for (var s, i = 0, l = nodes.length; i < l; i++) {
                if (s = nodes[i].getAttribute("find"))
                    nodes[i].style.backgroundImage = s.trim(); //@todo apf3.0 why is this needed?
            }
        });
    }
};

amlCore.insertHtmlNode = function(xmlNode, htmlNode, beforeNode, str){
    if (htmlNode.nodeType != 11 && !htmlNode.style)
        return htmlNode.appendChild(xmlNode);
    
    var pNode = beforeNode || htmlNode;
    
    if (!str)
        str = (xmlNode.serialize
            ? xmlNode.serialize(true)
            : xmlNode.xml || xmlNode.outerHTML || xmlNode.nodeValue).unescapeHTML();
    try {
        pNode.insertAdjacentHTML(beforeNode 
            ? "beforeBegin" 
            : "beforeEnd", str);
    }
    catch(e) {
        //#ifdef __DEBUG
        console && console.warn("Warning found block element inside a " 
          + pNode.tagName 
          + " element. Rendering will give unexpected results");
        //#endif
        
        pNode.insertAdjacentHTML("afterEnd", str);
        return pNode.nextSibling;
    }

    if (beforeNode)
        return beforeNode.previousSibling;
    else 
        return htmlNode.lastChild.nodeType == 1 
            ? htmlNode.lastChild 
            : htmlNode.lastChild.previousSibling;
        
};

    }
);