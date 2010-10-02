require.def(function() {
    var oop = {};
    
    oop.inherits = function(ctor, superCtor) {
        var tempCtor = function() {};
        tempCtor.prototype = superCtor.prototype;
        ctor.super_ = superCtor.prototype;
        ctor.prototype = new tempCtor();
        ctor.prototype.constructor = ctor;
    };

    oop.mixin = function(obj, mixin) {
        for (var key in mixin) {
            obj[key] = mixin[key];
        }
    };

    oop.implement = function(proto, mixin) {
        oop.mixin(proto, mixin);
    };
    
    oop.decorate = function(ctor, decorator){
        if (decorator)
            decorator.call(ctor.prototype);
    }

    return oop;
});