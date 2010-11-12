module.declare(function(require, exports, module){

//@todo refactor this needs some rethinking...    
var namespace = apf.config.name + ".apf.http";

/**
 * Saves the apf http cache to the available {@link core.storage storage engine}.
 */
Http.saveCache = function(){
    // #ifdef __DEBUG
    if (!apf.serialize)
        throw new Error(apf.formatErrorString(1079, this,
            "HTTP save cache",
            "Could not find JSON library."));
    // #endif

    // #ifdef __DEBUG
    apf.console.info("[HTTP] Loading HTTP Cache", "teleport");
    // #endif

    var strResult = apf.serialize(comm.cache);
    Storage.put("cache_" + this.name, strResult,
        apf.config.name + ".apf.http");
};

/**
 * Loads the apf http cache from the available {@link core.storage storage engine}.
 */
Http.loadCache = function(){
    var strResult = Storage.get("cache_" + this.name,
        apf.config.name + ".apf.http");

    // #ifdef __DEBUG
    apf.console.info("[HTTP] Loading HTTP Cache", "teleport");
    // #endif

    if (!strResult)
        return false;

    this.cache = apf.unserialize(strResult);

    return true;
};

/**
 * Removes the stored http cache from the available {@link core.storage storage engine}.
 */
Http.clearCache = function(){
    Storage.remove("cache_" + this.name,
        apf.config.name + ".apf.http");
};

});