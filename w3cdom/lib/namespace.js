module.declare(function(require, exports, module){

//XMLDocument.selectNodes
HTMLDocument.prototype.selectNodes = XMLDocument.prototype.selectNodes = function(sExpr, contextNode){
    //Especially for webkit
    if (sExpr.substr(0,2) == "//")
        sExpr = "." + sExpr;

    try {
        var oResult = this.evaluate(sExpr, (contextNode || this),
            this.createNSResolver(this.documentElement),
            7, null); //XpathResult.ORDERED_NODE_ITERATOR_TYPE
    }
    catch(ex) {
        try {
            //Especially for webkit
            var oResult = this.evaluate("child::" + sExpr, (contextNode || this),
                this.createNSResolver(this.documentElement),
                7, null);//XPathResult.ORDERED_NODE_SNAPSHOT_TYPE
        }
        catch(ex) {
            var msg = ex.message;
            if (ex.code == ex.INVALID_EXPRESSION_ERR)
                msg = msg.replace(/the expression/i, "'" + sExpr + "'");
            throw new Error(ex.lineNumber, "XPath error: " + msg);
        }
    }

    var nodeList = new Array(oResult.snapshotLength);
    nodeList.expr = sExpr;
    for (var i = nodeList.length - 1; i >= 0; i--) 
        nodeList[i] = oResult.snapshotItem(i);
    return nodeList;
};

//Element.selectNodes
Text.prototype.selectNodes =
Attr.prototype.selectNodes =
Element.prototype.selectNodes = function(sExpr){
   return this.ownerDocument.selectNodes(sExpr, this);
};

//XMLDocument.selectSingleNode
Document.prototype.selectSingleNode     =
HTMLDocument.prototype.selectSingleNode = XMLDocument.prototype.selectSingleNode = function(sExpr, contextNode){
    try {
        var oResult = this.evaluate(sExpr, (contextNode || this),
            this.createNSResolver(this.documentElement),
            9, null); //XpathResult.FIRST_ORDERED_NODE_TYPE
    }
    catch(ex) {
        var msg = ex.message;
        if (ex.code == ex.INVALID_EXPRESSION_ERR)
            msg = msg.replace(/the expression/i, "'" + sExpr + "'");
        throw new Error(ex.lineNumber, "XPath error: " + msg);
    }
    
    return oResult.singleNodeValue;
};

//Element.selectSingleNode
Text.prototype.selectSingleNode =
Attr.prototype.selectNodes =
Element.prototype.selectSingleNode = function(sExpr){
    return this.ownerDocument.selectSingleNode(sExpr, this);
};

Array.prototype.item = function(i){return this[i];};
Array.prototype.expr = "";

    }
);