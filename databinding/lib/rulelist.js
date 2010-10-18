define([], function(){
        
var RuleList = function(){
    this.$compiled = {};
}
RuleList.prototype = {
    $isCompiled : false,
    
    getRule : function(name, xmlNode){
        var rules = this[name];
        if (!rules) return false;
        
        //@todo Shouldn't allow async calls..., should always give a function
        for (var func, rule, i = 0, l = rules.length; i < l; i++) {
            rule = rules[i];
            if (!rule.match) 
                return rule;

            func = rule.cmatch || rule.compile("match", {injectself: true, xpathmode: 2});
            if (func && func(xmlNode))
                return rule;
        }
    },
    
    compile : function(name){
        var rules, s, c = this.$compiled, hasAml = false;

        if (name) {
            s     = [];
            rules = this[name];
            for (var rule, i = 0, l = rules.length; i < l; i++) {
                if (!(rule = rules[i]).match && !rule.value)
                    continue;

                s.push(rule.match, rule.value);
                //#ifdef __WITH_AML_BINDINGS
                if (!hasAml && rule.value)
                    hasAml = rule.hasaml || rule.value.indexOf("<a:") > -1;
                //#endif
            }
            
            //always give a function, no async calls (could also just error on execution)
            c[name] = apf.lm.compileMatch(s); 
            
            //#ifdef __WITH_AML_BINDINGS
            c[name].hasAml = hasAml;
            //#endif
            
            return c;
        }
        
        for (name in this) {
            if (name == "each")
                continue;
            
            rules  = this[name];
            if (rules.dataType != apf.ARRAY)
                continue;
            
            s = [], hasAml = false;
            for (var rule, i = 0, l = rules.length; i < l; i++) {
                if (!(rule = rules[i]).match && !rule.value)
                    continue;

                s.push(rule.match, rule.value);
                //#ifdef __WITH_AML_BINDINGS
                if (!hasAml && rule.value)
                    hasAml = rule.hasaml || rule.value.indexOf("<a:") > -1;
                //#endif
            }
            
            //always give a function, no async calls (could also just error on execution)
            c[name] = apf.lm.compileMatch(s); 
            
            //#ifdef __WITH_AML_BINDINGS
            c[name].hasAml = hasAml;
            //#endif
        }

        this.$isCompiled = true;
        
        return c;
    },
    
    getRuleIndex : function(name, index) {
        var rule = this[name][index];
        if (rule.value) {
            if (!rule.cvalue)
                rule.compile("value");
        }
        else if (rule.match) {
            if (!rule.cmatch)
                rule.compile("match");
        }
        return rule;
    },
    
    getDataNode : function(name, xmlNode, createNode, ruleList, multiple){
        var i, l, func, node, rule, rules = this[name];
        if (!rules)
            return;
        
        //@todo Shouldn't allow async calls..., should always give a function
        for (rule, i = 0, l = rules.length; i < l; i++) {
            rule = rules[i];
            
            func = rule.cvaluematch;
            if (!func) { //@todo apf3.0 cleanup
                if (rule.match && rule.value)
                    rule.valuematch = "{_n = " + rule.match + "; %[child::" 
                        + rule.value.substr(1, rule.value.length - 2)
                            .split("|").join("|child::") + "]}";
                else
                    rule.valuematch = rule.match || rule.value;
                
                func = rule.$compile("valuematch", {
                    xpathmode  : multiple ? 4 : 3, 
                    injectself : rule.match ? true : false
                });
            }
            
            if (func && (node = func(xmlNode, createNode))) {
                if (ruleList)
                    ruleList.push(rule);

                return node;
            }
        }
        
        return false;
    }
}

return RuleList;

});