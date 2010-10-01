
    /**
     * Finds a aml element based on it's uniqueId
     */
    lookup : function(uniqueId){
        return this.all[uniqueId];
    },

    /**
     * Searches in the html tree from a certain point to find the
     * aml element that is responsible for rendering the specified html
     * element.
     * @param {HTMLElement} oHtml the html context to start the search from.
     */
    findHost : function(o){
        while (o && o.parentNode) { //!o.host && 
            try {
                if ((o.host || o.host === false) && typeof o.host != "string")
                    return o.host;
            }
            catch(e){}
            
            o = o.parentNode;
        }
        
        return null;
    },