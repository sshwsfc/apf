
    module.declare(function(require, exports, module){
Class.prototype.$_setDynamicProperty = function(prop, pValue, fParsed, exclNr){
        //if there's xpath: Add apf.DataBinding if not inherited. 
        //Add compiled binding rule. Load databinding if not loaded. 
        var check = 1;
        if (exclNr == 2 || fParsed.xpaths.length && exclNr != 1) {
            if (StandardBinding && !this.hasFeature(StandardBinding.$regbase)) {
                oop.decorate(StandardBinding);
                if (this.$attrExcludePropBind[prop] == 1)
                    check = 0;
            }
                
            if (check)
                this.$addAttrBind(prop, fParsed, pValue);
        }
    }
    
    var setProp = this.$_setProperty;
    Class.prototype.$_setProperty = function(prop, value, forceOnMe, setAttr, inherited, isChanged){
        if (isChanged && !forceOnMe) {
            //Check if this property is bound to data
            if (this.xmlRoot && typeof value != "object"
              && (!(s = this.$attrExcludePropBind[prop]))// || s == 2
              && (r = (this.$attrBindings && this.$attrBindings[prop] 
              || prop != "value" && this.$bindings[prop] && this.$bindings[prop][0]))) {

                //Check if rule has single xpath
                if (r.cvalue.type == 3) {
                    //Set the xml value
                    return apf.setNodeValue(
                        this.$getDataNode(prop.toLowerCase(), this.xmlRoot, true),
                        value, true);
                }
            }
        }
        
        setProp.apply(this, arguments);
    }
})
