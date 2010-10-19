
define(["aml-core/nameserver"], function(Nameserver){

//#ifdef __WITH_REGISTRY
/**
 * Object which provides a means to store key values pairs in a named context.
 * This objects primary purpose is to provide a way to serialize the state
 * of all the custom state you introduce when building the application. This way
 * you can use {@link element.offline apf.offline} to start the application in 
 * the exact state it was when your user closed the app.
 *
 * @see core.storage
 */
var Registry = Object.extend({
    /**
     * Stores a key value pair.
     * @param {String} key       the identifier of the information.
     * @param {mixed}  value     the information to store.
     * @param {String} namespace the named context into which to store the key value pair.
     */
    put : function(key, value, namespace){
        this.register(namespace, key, value);
    },
    
    /**
     * @private
     */
    getNamespaces : function(){
        
    },
    
    /**
     * Retrieves all the keys of a namespace.
     * @param {String} namespace the named context of the keys to retrieve.
     * @return {Array} the list of keys in the namespace.
     */
    getKeys : function(namespace){
        return this.getAllNames(namespace);
    },
    
    /**
     * Removes a key in a namespace.
     * @param {String} key       the identifier of the information.
     * @param {String} namespace the named context of the keys to remove.
     */
    remove : function(key, namespace){
        delete this.lookup[namespace][key];
    },
    
    /**
     * @private
     */
    clear : function(namespace){
        this.lookup = {}; //@todo
    },
    
    //#ifndef __PACKAGED
    //here for doc purposes only
    /**
     * Retrieves a keys in a namespace.
     * @param {String} key       the identifier of the information.
     * @param {String} namespace the named context of the keys to retrieve.
     * @return {mixed} the value that correspond to the key in the namespace.
     */
    get : function(){},
    //#endif
    
    $export : function(storage){
        var namespace, key;

        for (namespace in this.lookup) {
            for (key in this.lookup[namespace]) {
                storage.put(key, this.lookup[key][namespace], namespace);
            }
        }
    }
}, Nameserver);

/**
 * @private
 */
Registry.lookup = {};

Registry.get = function(key, namespace){
    return this.lookup[namespace] ? this.lookup[namespace][key] : null;
};

return Registry;

});