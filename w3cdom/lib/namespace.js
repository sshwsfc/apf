/**
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.8
 */
require.def(function(){
    function namespace(){
        this.elements = {};
        this.processingInstructions = {};
    };
    
    namespace.prototype = {
        setElement : function(tagName, fConstr){
            return this.elements[tagName] = fConstr;
        },
        
        setProcessingInstruction : function(target, fConstr){
            this.processingInstructions[target] = fConstr;
        }
    };
    
    return namespace;
});