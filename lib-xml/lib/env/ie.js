/**
 * Compatibility layer for Internet Explorer.
 */
require.def(["lib-xml"]
    function(libXml){
        
var getXmlDom = function(message, noError, preserveWhiteSpaces){
    var xmlParser = new ActiveXObject("microsoft.XMLDOM");
    xmlParser.setProperty("SelectionLanguage", "XPath");
    
    if (preserveWhiteSpaces)
        xmlParser.preserveWhiteSpace = true;

    if (message) {
        xmlParser.loadXML(message);

        if (!noError)
            libXml.xmlParseError(xmlParser, message);
    }

    return xmlParser;
};

libXml.xmlParseError = function(xml){
    var xmlParseError = xml.parseError;
    if (xmlParseError != 0) {
        /*
         http://msdn.microsoft.com/library/en-us/xmlsdk30/htm/xmobjpmexmldomparseerror.asp?frame=true

         errorCode     Contains the error code of the last parse error. Read-only.
         filepos         Contains the absolute file position where the error occurred. Read-only.
         line             Specifies the line number that contains the error. Read-only.
         linepos         Contains the character position within the line where the error occurred. Read-only.
         reason         Explains the reason for the error. Read-only.
         srcText         Returns the full text of the line containing the error. Read-only.
         url             Contains the URL of the XML document containing the last error. Read-only.
         */
        throw new Error(apf.formatErrorString(1050, null,
            "XML Parse error on line " + xmlParseError.line,
            xmlParseError.reason + "Source Text:\n"
                + xmlParseError.srcText.replace(/\t/gi, " ")
        ));
    }

    return xml;
};

return getXmlDom;

    }
);