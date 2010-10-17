define(["node-xml-dom"]
    function(DOMParser){
        
XMLDocument = DOMParser.parseFromString("<root />", "text/xml");
Element = XMLDocument.documentElement;
Node = Element;

var getXmlDom = function(message, noError){
    var xmlParser = DOMParser; //@todo require??
    xmlParser     = xmlParser.parseFromString(message, "text/xml");

    if (!noError)
        getXmlDom.xmlParseError(xmlParser);
    
    return xmlParser;
};

getXmlDom.xmlParseError = function(xml, message){
    if (!xml)
        apf.console.error("no xml document was passed to the xml parse error function");

    if (xml.documentElement.tagName == "parsererror") {
        var str     = xml.documentElement.firstChild.nodeValue.split("\n");
        var linenr  = str[2].match(/\w+ (\d+)/)[1];
        var message = str[0].replace(/\w+ \w+ \w+: (.*)/, "$1");
        
        var srcText = xml.documentElement.lastChild.firstChild.nodeValue.split("\n")[0];
        
        throw new Error(apf.formatErrorString(1050, null, 
            "XML Parse Error on line " +  linenr, message + 
            "\nSource Text : " + srcText.replace(/\t/gi, " ")));
    }
    
    return xml;
};

return getXmlDom;

    }
);