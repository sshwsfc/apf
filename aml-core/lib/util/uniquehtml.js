define(function(){
        
var uniqueHtmlIds = 0;
return {
    /**
     * Adds a unique id attribute to an html element.
     * @param {HTMLElement} oHtml the object getting the attribute.
     */
    setUniqueHtmlId : function(oHtml){
        var id;
        oHtml.setAttribute("id", id = "q" + uniqueHtmlIds++);
        return id;
    },

    /**
     * Retrieves a new unique id
     */
    getUniqueId : function(){
        return uniqueHtmlIds++;
    }
}

});