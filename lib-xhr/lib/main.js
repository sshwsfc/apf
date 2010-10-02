(function(){
    var xhr, deps = [];
    
    //Feature Detection
    var useActiveX = typeof ActiveXObject != "undefined" 
        && typeof location != "undefined" && location.host ? 0 : 1;
    
    if (useActiveX) {
        try {
            new ActiveXObject("microsoft.XMLHTTP"); //IE
        }
        catch(e){
            useActiveX = false;
        }
    }
    
    if (!useActiveX) {
        try {
            new XMLHttpRequest(); //Modern Browsers
        }
        catch (e) {
            try {
                xhr = require("./node/XMLHttpRequest").XMLHttpRequest; //O3 Sync
            }
            catch (e) {
                try {
                    xhr = require("lib-xmlhttp/node").XMLHttpRequest; //Node Sync
                }
                catch (e) {
                    deps.push("lib-xmlhttp/iframe");
                }
            }
        }
    }

    require.def("lib-xmlhttp", deps, function(OtherXhr){
        return function(){
            return (useActiveX 
                ? new ActiveXObject("microsoft.XMLHTTP") 
                : new (xhr || OtherXhr || XMLHttpRequest)());
        };
    })
})();