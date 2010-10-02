(function(){
    var xhr, deps = [];
    
    if (typeof DOMParser != "undefined")
        deps.push("lib-xml/env/w3c");
    else if (typeof ActiveXObject != "undefined") {
        try {
            new ActiveXObject("microsoft.XMLDOM"); //IE
            deps.push("lib-xml/env/ie");
        }
        catch(e){
            deps.push("lib-xml/env/iefallback");
        }
    }
    else {
        //O3
        try {
            require("node-xml-dom");
            deps.push("node-xml-dom");
        }
        catch(e){}
    }

    require.def("lib-xml", deps, function(getXmlDom){
        return getXmlDom;
    })
})();