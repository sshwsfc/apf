    //Turn this into a unique object store
    /**
     * @private
     */
    uniqueHtmlIds : 0,

    /**
     * Adds a unique id attribute to an html element.
     * @param {HTMLElement} oHtml the object getting the attribute.
     */
    setUniqueHtmlId : function(oHtml){
        var id;
        oHtml.setAttribute("id", id = "q" + this.uniqueHtmlIds++);
        return id;
    },

    /**
     * Retrieves a new unique id
     */
    getUniqueId : function(){
        return this.uniqueHtmlIds++;
    },
    