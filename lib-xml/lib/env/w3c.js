module.declare(function(require, exports, module){

var getXmlDom = function(message, noError, preserveWhiteSpaces){
    var xmlParser;
    if (message) {
        if (preserveWhiteSpaces === false)
            message = message.replace(/>[\s\n\r]*</g, "><");
        
        xmlParser = new DOMParser();
        xmlParser = xmlParser.parseFromString(message, "text/xml");

        if (!noError)
            getXmlDom.xmlParseError(xmlParser, message);
    }
    else {
        xmlParser = document.implementation.createDocument("", "", null);
    }
    
    return xmlParser;
};

getXmlDom.xmlParseError = function(xml){
    //if (xml.documentElement.tagName == "parsererror") {
    if (xml.getElementsByTagName("parsererror").length) { 
        var str     = xml.documentElement.firstChild.nodeValue.split("\n"),
            linenr  = str[2].match(/\w+ (\d+)/)[1],
            message = str[0].replace(/\w+ \w+ \w+: (.*)/, "$1"),
        
            srcText = xml.documentElement.lastChild.firstChild.nodeValue;//.split("\n")[0];
        
        throw new Error(apf.formatErrorString(1050, null, 
            "XML Parse Error on line " +  linenr, message + 
            "\nSource Text : " + srcText.replace(/\t/gi, " ")));
    }
    
    return xml;
};

/**** XML Serialization ****/
if (XMLDocument.prototype.__defineGetter__) {
    //XMLDocument.xml
    XMLDocument.prototype.__defineGetter__("xml", function(){
        return (new XMLSerializer()).serializeToString(this);
    });
    XMLDocument.prototype.__defineSetter__("xml", function(){
        throw new Error(apf.formatErrorString(1042, null, "XML serializer", "Invalid assignment on read-only property 'xml'."));
    });
    
    //Node.xml
    Node.prototype.__defineGetter__("xml", function(){
        if (this.nodeType == 3 || this.nodeType == 4 || this.nodeType == 2) 
            return this.nodeValue;
        return (new XMLSerializer()).serializeToString(this);
    });
    
    //Node.xml
    Element.prototype.__defineGetter__("xml", function(){
        return (new XMLSerializer()).serializeToString(this);
    });
}

module.exports = getXmlDom;

    }
);