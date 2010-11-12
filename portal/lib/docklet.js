module.declare(function(require, exports, module){

var Docklet = function(){}

oop.inherits(Docklet, Class);

Docklet.prototype.create = function(xmlSettings, oWidget, oPortal){
    this.xmlSettings = xmlSettings
    this.oWidget = oWidget;

    if (this.$create)
        this.$create(xmlSettings, oWidget, oPortal);
};

module.exports = Docklet;

});