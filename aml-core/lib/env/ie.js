
//IE fix
try {
    if (apf.isIE)
        document.execCommand("BackgroundImageCache", false, true);
}
catch(e) {}
 
    apf.insertHtmlNodes = function(nodeList, htmlNode, beforeNode){
        for (var str = [], i = 0, l = nodeList.length; i < l; i++)
            str[i] = nodeList[i].xml;

        str = apf.html_entity_decode(str.join(""));
        
        if (apf.isIE < 7)
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
                htmlNode.appendChild(x.childNodes[apf.hasDynamicItemList ? 0 : i]);
        }

        //Fix IE image loading bug
        if (apf.isIE < 7) {
            $setTimeout(function(){
                var nodes = htmlNode.getElementsByTagName("*");
                for (var s, i = 0, l = nodes.length; i < l; i++) {
                    if (s = nodes[i].getAttribute("find"))
                        nodes[i].style.backgroundImage = s.trim(); //@todo apf3.0 why is this needed?
                }
            });
        }
    };
    
    /* I have no idea what below code should do
    
    if (pNode.nodeType == 11) {
        id = xmlNode.getAttribute("id");
        if (!id)
            throw new Error(apf.formatErrorString(1049, null, "xmldb", "Inserting Cache Item in Document Fragment without an ID"));

        document.body.insertAdjacentHTML(beforeNode ? "beforebegin" : "beforeend", strHTML);
        pNode.appendChild(document.getElementById(id));
    }*/
    apf.insertHtmlNode = function(xmlNode, htmlNode, beforeNode, str){
        if (htmlNode.nodeType != 11 && !htmlNode.style)
            return htmlNode.appendChild(xmlNode);
        
        var pNode = beforeNode || htmlNode;
        
        if (!str)
            str = apf.html_entity_decode(xmlNode.serialize
                ? xmlNode.serialize(true)
                : xmlNode.xml || xmlNode.outerHTML || xmlNode.nodeValue);
        try {
            pNode.insertAdjacentHTML(beforeNode 
                ? "beforeBegin" 
                : "beforeEnd", str);
        }
        catch(e) {
            //#ifdef __DEBUG
            apf.console.warn("Warning found block element inside a " 
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
