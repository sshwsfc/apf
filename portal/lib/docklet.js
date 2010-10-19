define(["lib-oop/class", "lib-oop"], 
    function(Class, oop){

var Docklet = function(){}

oop.inherits(Docklet, Class);

Docklet.prototype.create = function(xmlSettings, oWidget, oPortal){
    this.xmlSettings = xmlSettings
    this.oWidget = oWidget;

    if (this.$create)
        this.$create(xmlSettings, oWidget, oPortal);
};

return Docklet;

});