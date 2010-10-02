require.def(["env"], function(env){
    var deps = [];
    if (env.isIE)
        deps.push("./env/ie");
    else {
        deps.push("./env/non_ie.js");
        if (env.isGecko)
            deps.push("./env/gecko");
        else if (env.isWebkit)
            deps.push("./env/webkit");
        else if (env.isOpera)
            deps.push("./env/opera");
    }

    require.def(deps, function(){
        return {};
    })
});