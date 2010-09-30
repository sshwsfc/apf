
    /**
     * Returns the directory portion of a url
     * @param {String} url the url to retrieve from.
     * @return {String} the directory portion of a url.
     */
    getDirname : function(url){
        //(?:\w+\:\/\/)?
        return ((url || "").match(/^([^#]*\/)[^\/]*(?:$|\#)/) || {})[1]; //Mike will check out how to optimize this line
    },
    
    /**
     * Returns the file portion of a url
     * @param {String} url the url to retrieve from.
     * @return {String} the file portion of a url.
     */
    getFilename : function(url){
        return ((url || "").split("?")[0].match(/(?:\/|^)([^\/]+)$/) || {})[1];
    },
    
    /**
     * Returns an absolute url based on url.
     * @param {String} base the start of the url to which relative url's work.
     * @param {String} url  the url to transform.
     * @return {String} the absolute url.
     */
    getAbsolutePath : function(base, url){
        return url && url.charAt(0) == "/"
            ? url
            : (!url || !base || url.match(/^\w+\:\/\//) ? url : base.replace(/\/$/, "") + "/" + url.replace(/^\//, ""));
    },