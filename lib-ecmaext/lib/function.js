require.modify(
    "ecmaext",
    "ecmaext/function",
    function(){

/**
 * Extends a Function object with properties from other objects, specified as
 * arguments.
 *
 * @param {mixed} obj1, obj2, obj3, etc.
 * @type Function
 * @see Object.extend
 */
Function.prototype.extend = function() {
    Object.extend.apply(this, [this].concat(Array.prototype.slice.call(arguments)));
    return this;
};

/**
 * Attach a Function object to an event as handler method. If apf.AbstractEvent
 * is available, the active event is extended with convinience accessors as
 * declared in apf.AbstractEvent
 *
 * @param {Object} The context the execute the Function within
 * @param {Boolean} Whether the passed event object should be extended with AbstractEvent
 * @param {mixed}  param1, param2, param3, etc.
 * @type Function
 * @see apf.AbstractEvent
 */
Function.prototype.bindWithEvent = function() {
    var __method = this, 
        args     = Array.prototype.slice.call(arguments),
        o        = args.shift(),
        ev       = args.shift();
    return function(event) {
        if (!event)
            event = window.event;
        // #ifdef __WITH_ABSTRACTEVENT
        if (ev === true)
            event = new apf.AbstractEvent(event, window);
        // #endif
        return __method.apply(o, [event].concat(args)
            .concat(Array.prototype.slice.call(arguments)));
    }
};

/**
 * The bind function creates a new function (a bound function) that calls the
 * function that is its this value (the bound function's target function) with 
 * a specified this parameter, which cannot be overridden. bind also accepts 
 * leading default arguments to provide to the target function when the bound 
 * function is called.  A bound function may also be constructed using the new 
 * operator: doing so acts as though the target function had instead been 
 * constructed.  The provided this value is ignored, while prepended arguments 
 * are provided to the emulated function.
 * 
 * @param {Object} context The 'this' context of the bound function
 * @type Function
 */
if (!Function.prototype.bind)  
    Function.prototype.bind = function(context /*, arg1, arg2... */) {  
        if (typeof this !== 'function') throw new TypeError();  
        var _arguments = Array.prototype.slice.call(arguments, 1),  
            _this = this,  
            _concat = Array.prototype.concat,  
            _function = function() {  
                return _this.apply(this instanceof _dummy ? this : context,  
                    _concat.apply(_arguments, arguments));  
            },  
            _dummy = function() {};  
        _dummy.prototype = _this.prototype;  
        _function.prototype = new _dummy();  
        return _function;  
};


});