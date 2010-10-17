    define([], function(){
    var namespace = apf.config.name + ".apf.http";

    /**
     * Saves the apf http cache to the available {@link core.storage storage engine}.
     */
    this.saveCache = function(){
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
        apf.storage.put("cache_" + this.name, strResult,
            apf.config.name + ".apf.http");
    };

    /**
     * Loads the apf http cache from the available {@link core.storage storage engine}.
     */
    this.loadCache = function(){
        var strResult = apf.storage.get("cache_" + this.name,
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
    this.clearCache = function(){
        apf.storage.remove("cache_" + this.name,
            apf.config.name + ".apf.http");
    };
    });