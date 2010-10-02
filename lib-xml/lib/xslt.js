(function(){
    var deps = [];
    
    if (typeof XSLTProcessor == "undefined") {
        if (typeof ActiveXObject != "undefined") //IE
            deps.push("lib-xml/env/iexslt");
        else {
            //Node ??
        }
    }

    require.def("lib-xml/xslt", deps, function(altXSLTProcessor){
        return function(){
            return new (altXSLTProcessor || XSLTProcessor)();
        };
    })
})();