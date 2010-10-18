define([
    "w3cdom/element", 
    "optional!aml", 
    "lib-oop"], 
    function(DOMElement, aml, oop){
        
var NoMedia = function(struct, tagName) {
    DOMElement.call(this, tagName || "nomedia", this.NODE_HIDDEN, struct);
};

oop.inherits(NoMedia, DOMElement);

(function() {
    this.addEventListener("DOMNodeInsertedIntoDocument", function() {
        this.parentNode.notSupported =
            apf.getXmlString(this.$aml).replace(/<\/?a:nomedia[^>]*>/g, "");
    });
}).call(NoMedia.prototype);

aml && aml.setElement("nomedia", NoMedia);

return NoMedia;

});