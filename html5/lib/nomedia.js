define([
    "w3cdom/element", 
    "optional!aml", 
    "lib-oop"], 
    function(AmlElement, aml, oop){
        
var NoMedia = function(struct, tagName) {
    AmlElement.call(this, tagName || "nomedia", this.NODE_HIDDEN, struct);
};

oop.inherits(NoMedia, AmlElement);

(function() {
    this.addEventListener("DOMNodeInsertedIntoDocument", function() {
        this.parentNode.notSupported =
            apf.getXmlString(this.$aml).replace(/<\/?a:nomedia[^>]*>/g, "");
    });
}).call(NoMedia.prototype);

aml && aml.setElement("nomedia", NoMedia);

return NoMedia;

});