define([], function(){
apf.n = function(xml, xpath){
    return new apf.xmlset(xml, xpath, true);
}
apf.b = function(xml, xpath){
    return new apf.xmlset(xml, xpath);
}
apf.b.$queue = [];
apf.b.$state = 0;
/**
 * Naive jQuery like set implementation
 * @todo add dirty flags
 * @todo add query queue
 * @todo rewrite to use arrays
 */
apf.xmlset = function(xml, xpath, local, previous){
    if (typeof(xml) == "string")
        xml = apf.getXml(xml);
    
    this.$xml = xml;
    if (xml)
        this.$nodes = xml.dataType == apf.ARRAY ? xml : (xpath ? xml.selectNodes(xpath) : [xml]);
    this.$xpath = xpath || "."
    this.$local = local;
    this.$previous = previous;
};

(function(){
    this.add = function(){} //@todo not implemented
    
    this.begin = function(){
        apf.b.$state = 1;
        return this;
    }
    this.commit = function(at, rmt, uri){
        if (apf.b.$queue.length) {
            if (rmt) {
                var _self = this;
                rmt.addEventListener("rdbsend", function(e){
                    if (!uri || e.uri == uri) {
                        _self.rdbstack = e.message;
                        rmt.removeEventListener("rdbsend", arguments.callee);
                    }
                });
            }

            at.execute({
                action : 'multicall', 
                args   : apf.b.$queue
            });
            
            if (rmt)
                rmt.$processQueue(rmt);
        }
        
        apf.b.$queue = [];
        apf.b.$state = 0;
        return this;
    }
    this.rollback = function(){
        apf.b.$queue = [];
        apf.b.$state = 0;
        return this;
    }
    this.getRDBMessage = function(){
        return this.rdbstack || [];
    }
    
    this.before = function(el){
        for (var node, i = 0, l = this.$nodes.length; i < l; i++) {
            node = this.$nodes[i];
            node.parentNode.insertBefore(typeof el == "function" ? el(i) : el, node);
        }
        return this;
    }
    
    this.after = function(el){
        for (var node, i = 0, l = this.$nodes.length; i < l; i++) {
            node = this.$nodes[i];
            node.parentNode.insertBefore(typeof el == "function" ? el(i) : el, node.nextSibling);
        }
        
        return this;
    }
    
    this.andSelf = function(){}
    
    this.append = function(el){
        for (var node, child, i = 0, l = this.$nodes.length; i < l; i++) {
            node = this.$nodes[i];
            child = typeof el == "function" ? el(i, node) : el;
            
            if (apf.b.$state)
                apf.b.$queue.push({
                    action : 'appendChild',
                    args   : [node, child]
                });
            else if (this.$local)
                node.appendChild(child);
            else
                apf.xmldb.appendChild(node, child);
            
        }
        
        return this;
    }
    this.appendTo = function(target){
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            target.appendChild(this.$nodes[i]);
        }
        return this;
    }
    this.prepend = function(content){
        for (var node, i = 0, l = this.$nodes.length; i < l; i++) {
            node = this.$nodes[i];
            node.insertBefore(typeof el == "function" ? el(i, node) : el, node.firstChild);
        }
        
        return this;
    }
    this.prependTo = function(content){
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            target.insertBefore(this.$nodes[i], target.firstChild);
        }
        return this;
    }
    
    this.attr = function(attrName, value){
        if (value === undefined)
            return this.$nodes && this.$nodes[0] && this.$nodes[0].getAttribute(attrName) || "";
        else {
            for (var i = 0, l = this.$nodes.length; i < l; i++) {
                if (apf.b.$state)
                    apf.b.$queue.push({
                        action : 'setAttribute',
                        args   : [this.$nodes[i], attrName, value]
                    });
                else if (this.$local)
                    this.$nodes[i].setAttribute(attrName, value);
                else
                    apf.xmldb.setAttribute(this.$nodes[i], attrName, value);
            }
        }
        
        return this;
    }
    
    this.removeAttr = function(attrName){
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            if (apf.b.$state)
                apf.b.$queue.push({
                    action : 'removeAttribute',
                    args   : [this.$nodes[i], attrName]
                });
            else if (this.$local)
                this.$nodes[i].removeAttribute(attrName);
            else
                apf.xmldb.removeAttribute(this.$nodes[i], attrName);
        }
        
        return this;
    }
    
    this.xml = function(){
        var str = [];
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            str.push(this.$nodes[i].xml);
        }
        return str.join("\n");
    }
    
    this.get   = 
    this.index = function(idx){
        if (idx == undefined)
            return apf.getChildNumber(this.$nodes[0], this.$nodes[0].parentNode.getElementsByTagName("*"))
    }
    
    this.eq    = function(index){
        return index < 0 ? this.$nodes[this.$nodes.length - index] : this.$nodes[index];
    }
    
    this.size   = 
    this.length = function(){
        return this.$nodes.length;
    }
    this.load = function(url){
        
    }
    
    this.next = function(selector){
        if (!selector) selector = "node()[local-name()]";
        return new apf.xmlset(this.$xml, "((following-sibling::" + (this.$xpath == "." ? "node()" : this.$xpath) + ")[1])[self::" + selector.split("|").join("|self::") + "]", this.$local, this);
    }
    
    this.nextAll = function(selector){
        if (!selector) selector = "node()[local-name()]";
        return new apf.xmlset(this.$xml, "(following-sibling::" + (this.$xpath == "." ? "node()" : this.$xpath) + ")[self::" + selector.split("|").join("|self::") + "]", this.$local, this);
    }
    
    this.nextUntil = function(){}
    
    this.prev = function(selector){
        if (!selector) selector = "node()[local-name()]";
        return new apf.xmlset(this.$xml, "((preceding-sibling::" + (this.$xpath == "." ? "node()" : this.$xpath) + ")[1])[self::" + selector.split("|").join("|self::") + "]", this.$local, this);
    }
    this.prevAll = function(selector){
        if (!selector) selector = "node()[local-name()]";
        return new apf.xmlset(this.$xml, "(preceding-sibling::" + (this.$xpath == "." ? "node()" : this.$xpath) + ")[self::" + selector.split("|").join("|self::") + "]", this.$local, this);
    }
    
    this.not = function(){}

    this.parent = function(selector){
        return new apf.xmlset(this.$xml.parentNode, this.$local, this);
    }
    
    this.parents = function(selector){}
    this.pushStack = function(){}
    this.replaceAll = function(){}
    this.replaceWith = function(el){
        for (var node, child, i = 0, l = this.$nodes.length; i < l; i++) {
            node = this.$nodes[i];
            child = typeof el == "function" ? el(i, node) : el;

            if (apf.b.$state)
                apf.b.$queue.push({
                    action : 'replaceNode',
                    args   : [child, node]
                });
            else if (this.$local)
                node.parentNode.replaceChild(child, node);
            else
                apf.xmldb.replaceNode(child, node);
            
        }
        
        return this;
    }
    
    this.siblings = function(selector){
        //preceding-sibling::
        //return new apf.xmlset(this.$xml, "(" + this.$xpath + ")/node()[self::" + selector.split("|").join("|self::") + "]");
    }

    this.text = function(){
        
    }
    
    this.toArray = function(){
        var arr = [];
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            arr.push(this.$nodes[i]);
        }
        return arr;
    }
    
    this.detach = function(selector){
        var items = [];
        
        for (var node, i = 0, l = this.$nodes.length; i < l; i++) {
            node = this.$nodes[i];
            if (!node.selectSingleNode("self::node()[" + selector + "]"))
                continue;
            
            if (apf.b.$state)
                apf.b.$queue.push({
                    action : 'removeNode',
                    args   : [node]
                });
            else if (this.$local)
                node.parentNode.removeChild(node);
            else
                apf.xmldb.removeNode(node);
                
            items.push(node);
        }
        
        return new apf.xmlset(items, "", this.$local, this);
    }
    
    this.remove = function(selector){
        for (var node, n = this.$nodes, i = n.length - 1; i >= 0; i--) {
            node = n[i];
            if (selector && !node.selectSingleNode("self::node()[" + selector + "]"))
                continue;
            
            if (apf.b.$state)
                apf.b.$queue.push({
                    action : 'removeNode',
                    args   : [node]
                });
            else if (this.$local)
                node.parentNode.removeChild(node);
            else
                apf.xmldb.removeNode(node);
        }
        
        return this;
    }
    
    this.children = function(selector){
        var nodes = [];
        for (var node, child, i = 0, l = this.$nodes.length; i < l; i++) {
            var list = (node = this.$nodes[i]).selectNodes(selector);
            for (var j = 0, jl = list.length; j < jl; j++) {
                nodes.push(list[j]);
            }
        }
        return new apf.xmlset(nodes, null, this.$local, this);
    }
    
    this.children2 = function(selector){
        return new apf.xmlset(this.$xml, "(" + this.$xpath + ")/node()[self::" + selector.split("|").join("|self::") + "]", this.$local, this);
    }
    
    this.has  = 
    this.find = function(path){
        return new apf.xmlset(this.$xml, "(" + this.$xpath + ")//" + path.split("|").join("|self::"), this.$local, this);
    }
    
    this.query = function(path){
        return new apf.xmlset(this.$xml, "(" + this.$xpath + ")/" + path.split("|").join("|(" + this.$xpath + ")/"), this.$local, this);    
    }
    
    this.filter = function(filter){
        var newList = [];
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            if (this.$nodes[i].selectSingleNode("self::node()[" + filter + "]"))
                newList.push(this.$nodes[i]);
        }
        return new apf.xmlset(newList, null, this.$local, this);
    }
    
    this.end = function(){
        return this.$previous || this;
    }
    
    this.is = function(selector) {
        return this.filter(selector) ? true : false;
    }
    
    this.contents = function(){
        return this.children("node()");
    }
    
    this.has = function(){
        //return this.children(
    }
    
    this.val = function(value){
        if (value !== undefined) {
            apf.setQueryValue(this.$xml, this.$xpath, value);
            return this;
        }
        else
            return apf.queryValue(this.$xml, this.$xpath);
    }
    
    this.vals = function(){
        return apf.queryValues(this.$xml, this.$xpath);
    }
    
    this.node = function(){
        return apf.queryNode(this.$xml, this.$xpath);
    }

    this.nodes = function(){
        return apf.queryNodes(this.$xml, this.$xpath);
    }
    
    this.clone = function(deep){
        if (this.$nodes.length == 1)
            return new apf.xmlset(this.$nodes[0].cloneNode(true), "", this.$local, this);
        
        var nodes = [];
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            nodes.push(this.$nodes[i].cloneNode(deep == undefined ? true : deep));
        }
        
        return new apf.xmlset(nodes, "", this.$local, this);
    }
    
    this.context = function(){
        return this.$xml;
    }
    
    this.data = function(data){
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            apf.setQueryValue(this.$nodes[i], ".", data);
        }
        return this;
    }
    
    this.each = function(func){
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            func.call(this.$nodes[i], i);
        }
        return this;
    }
    
    this.eachrev = function(func){
        for (var i = this.$nodes.length - 1; i >= 0; i--) {
            func.call(this.$nodes[i], i);
        }
        return this;
    }
    
    this.map = function(callback){
        var values = [];
        for (var i = 0, l = this.$nodes.length; i < l; i++) {
            values.push(callback(this.$nodes[i]));
        }
        return new apf.xmlset(values, "", this.$local, this); //blrghhh
    }
    
    this.empty  = function(){
        this.children().detach();
        return this;
    }
    
    this.first = function(){
        return new apf.xmlset(this.$xml, "(" + this.$xpath + ")[1]", this.$local, this);
    }
    
    this.last = function(){
        return new apf.xmlset(this.$xml, "(" + this.$xpath + ")[last()]", this.$local, this);
    }
}).call(apf.xmlset.prototype);
})
