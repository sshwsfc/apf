module.declare(function(require, exports, module){

function pickRecentProgID(idList){
    var progId;
    for (var i = 0; i < idList.length; i++){
        try{
            new ActiveXObject(idList[i]);
            progId = idList[i];
            break;
        }
        catch (e){};
    };
    
    if (!progId)
        throw "Could not retreive a valid progID of Class: " 
            + idList[idList.length-1] + ". (original exception: " + e + ")";

    return progId;
};

var templateProgId, threadedDomProgId. xmlwriterProgId, domProgId;

/**
 * Basic implementation of Mozilla's XSLTProcessor for IE. 
 * Reuses the same XSLT stylesheet for multiple transforms
 * @constructor
 */
var XSLTProcessor = function(){
    if (!templateProgId)
        templateProgId = pickRecentProgID(["Msxml2.XSLTemplate.6.0", "MSXML2.XSLTemplate.3.0"]);
    if (!domProgId)
        domProgId = pickRecentProgID(["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"]);
        
    this.template = new ActiveXObject(templateProgId);
    this.processor = null;
};

(function(){
    /**
     * Imports the given XSLT DOM and compiles it to a reusable transform
     * <b>Note:</b> If the stylesheet was loaded from a URL and contains xsl:import or xsl:include elements,it will be reloaded to resolve those
     * @argument xslDoc The XSLT DOMDocument to import
     */
    this.importStylesheet = function(xslDoc){
        if(!threadedDomProgId)
            threadedDomProgId = pickRecentProgID(["MSXML2.FreeThreadedDOMDocument.6.0", "MSXML2.FreeThreadedDOMDocument.3.0"]);

        xslDoc.setProperty("SelectionLanguage", "XPath");
        xslDoc.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
        // convert stylesheet to free threaded
        var converted = new ActiveXObject(threadedDomProgId);
        // make included/imported stylesheets work if exist and xsl was originally loaded from url
        if(xslDoc.url && xslDoc.selectSingleNode("//xsl:*[local-name() = 'import' or local-name() = 'include']") != null){
            converted.async = false;
            if (threadedDomProgId == "MSXML2.FreeThreadedDOMDocument.6.0") { 
                converted.setProperty("AllowDocumentFunction", true); 
                converted.resolveExternals = true; 
            }
            converted.load(xslDoc.url);
        } else {
            converted.loadXML(xslDoc.xml);
        };
        converted.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
        var output = converted.selectSingleNode("//xsl:output");
        this.outputMethod = output ? output.getAttribute("method") : "html";
        this.template.stylesheet = converted;
        this.processor = this.template.createProcessor();
        // for getParameter and clearParameters
        this.paramsSet = new Array();
    };

    /**
     * Transform the given XML DOM and return the transformation result as a new DOM document
     * @argument sourceDoc The XML DOMDocument to transform
     * @return The transformation result as a DOM Document
     */
    this.transformToDocument = function(sourceDoc){
        // fix for bug 1549749
        if(threadedDomProgId){
            this.processor.input=sourceDoc;
            var outDoc=new ActiveXObject(domProgId);
            this.processor.output=outDoc;
            this.processor.transform();
            return outDoc;
        }
        else{
            if (!xmlwriterProgId)
                xmlwriterProgId = pickRecentProgID(["Msxml2.MXXMLWriter.6.0", "Msxml2.MXXMLWriter.3.0", "MSXML2.MXXMLWriter", "MSXML.MXXMLWriter", "Microsoft.XMLDOM"]);
            this.processor.input = sourceDoc;
            var outDoc = new ActiveXObject(xmlwriterProgId);
            this.processor.output = outDoc; 
            this.processor.transform();
            var oDoc = new ActiveXObject(domProgId);
            oDoc.loadXML(outDoc.output+"");
            return oDoc;
        };
    };
    
    /**
     * Transform the given XML DOM and return the transformation result as a new DOM fragment.
     * <b>Note</b>: The xsl:output method must match the nature of the owner document (XML/HTML).
     * @argument sourceDoc The XML DOMDocument to transform
     * @argument ownerDoc The owner of the result fragment
     * @return The transformation result as a DOM Document
     */
    this.transformToFragment = function (sourceDoc, ownerDoc) {
        this.processor.input = sourceDoc;
        this.processor.transform();
        var s = this.processor.output;
        var f = ownerDoc.createDocumentFragment();
        if (this.outputMethod == 'text') {
            f.appendChild(ownerDoc.createTextNode(s));
        } else if (ownerDoc.body && ownerDoc.body.innerHTML) {
            var container = ownerDoc.createElement('div');
            container.innerHTML = s;
            while (container.hasChildNodes()) {
                f.appendChild(container.firstChild);
            }
        }
        else {
            var oDoc = new ActiveXObject(domProgId);
            if (s.substring(0, 5) == '<?xml') {
                s = s.substring(s.indexOf('?>') + 2);
            }
            var xml = ''.concat('<my>', s, '</my>');
            oDoc.loadXML(xml);
            var container = oDoc.documentElement;
            while (container.hasChildNodes()) {
                f.appendChild(container.firstChild);
            }
        }
        return f;
    };
    
    /**
     * Set global XSLT parameter of the imported stylesheet
     * @argument nsURI The parameter namespace URI
     * @argument name The parameter base name
     * @argument value The new parameter value
     */
    this.setParameter = function(nsURI, name, value){
        // nsURI is optional but cannot be null 
        if(nsURI){
            this.processor.addParameter(name, value, nsURI);
        }else{
            this.processor.addParameter(name, value);
        };
        // update updated params for getParameter 
        if(!this.paramsSet[""+nsURI]){
            this.paramsSet[""+nsURI] = new Array();
        };
        this.paramsSet[""+nsURI][name] = value;
    };
    /**
     * Gets a parameter if previously set by setParameter. Returns null
     * otherwise
     * @argument name The parameter base name
     * @argument value The new parameter value
     * @return The parameter value if reviously set by setParameter, null otherwise
     */
    this.getParameter = function(nsURI, name){
        nsURI = nsURI || "";
        if(this.paramsSet[nsURI] && this.paramsSet[nsURI][name]){
            return this.paramsSet[nsURI][name];
        }else{
            return null;
        };
    };
    /**
     * Clear parameters (set them to default values as defined in the stylesheet itself)
     */
    this.clearParameters = function(){
        for(var nsURI in this.paramsSet){
            for(var name in this.paramsSet[nsURI]){
                if(nsURI){
                    this.processor.addParameter(name, null, nsURI);
                }else{
                    this.processor.addParameter(name, null);
                };
            };
        };
        this.paramsSet = new Array();
    };
}).call(XSLTProcessor.prototype);

module.exports = XSLTProcessor;

    }
);