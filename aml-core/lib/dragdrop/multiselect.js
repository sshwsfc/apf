module.declare(function(require, exports, module){

module.exports = function() {
    /**** Drag & Drop ****/
    // #ifdef __WITH_DRAGDROP
    this.diffX        =
    this.diffY        = 0;
    this.multiple     = false;
    this.lastDragNode = null;
    this.lastel       = null;

    this.$showDragIndicator = function(sel, e){
        this.multiple = sel.length > 1;
        
        if (this.multiple) {
            this.diffX = e.scrollX;
            this.diffY = e.scrollY;
        }
        else {
            this.diffX = -1 * e.offsetX;
            this.diffY = -1 * e.offsetY;
        }
        
        var prefix = this.oDrag.className.split(" ")[0]
        //@todo the class should be removed here
        this.$setStyleClass(this.oDrag, (this.multiple
            ? prefix + "_multiple" : "") + (this["class"] ? " " + this["class"] : ""), [prefix + "_multiple"]);

        if (this.multiple) {
            document.body.appendChild(this.oDrag);
            return this.oDrag;
        }
        else if (this.localName == "datagrid") {
            if (this.lastDragNode)
                amlCore.destroyHtmlNode(this.lastDragNode);

            sel = this.$selected || this.$caret;
            var oDrag = sel.cloneNode(true);
            oDrag.removeAttribute("onmousedown"); oDrag.onmousedown = null;
            oDrag.removeAttribute("onmouseup"); oDrag.onmouseup = null;
            oDrag.removeAttribute("onmouseout"); oDrag.onmouseout = null;
            oDrag.removeAttribute("ondblclick"); oDrag.ondblclick = null;
            document.body.appendChild(oDrag);
            
            oDrag.style.position = "absolute";
            oDrag.style.width    = sel.offsetWidth + "px";
            oDrag.style.display  = "none";
            oDrag.removeAttribute("id");
            
            this.$setStyleClass(oDrag, "draggrid");
            var nodes = sel.childNodes;
            var dragnodes = oDrag.childNodes;
            for (var i = nodes.length - 1; i >= 0; i--) {
                if (dragnodes[i].nodeType == 1)
                    dragnodes[i].style.width = apf.getStyle(nodes[i], "width");
            }
            //@todo apf3.0 remove all the event handlers of the children.
            return (this.lastDragNode = oDrag);
        }
        else {
            var sel = this.$selected || this.$caret,
                width = apf.getStyle(this.oDrag, "width");
            
            if (!width || width == "auto")
                this.oDrag.style.width = (sel.offsetWidth - apf.getWidthDiff(this.oDrag)) + "px";
            this.$updateNode(this.selected, this.oDrag);
        }
        
        zManager.set("drag", this.oDrag);
        
        return this.oDrag;
    };
    
    this.$hideDragIndicator = function(success){
        var oDrag = this.lastDragNode || this.oDrag, _self = this;
        if (!this.multiple && !success && oDrag.style.display == "block") {
            if (!this.$selected && !this.$caret)
                return;
            
            var pos = apf.getAbsolutePosition(this.$selected || this.$caret);
            apf.tween.multi(oDrag, {
                anim     : apf.tween.easeInOutCubic,
                steps    : apf.isIE ? 15 : 20,
                interval : 15,
                tweens   : [
                    {type: "left", from: oDrag.offsetLeft, to: pos[0]},
                    {type: "top",  from: oDrag.offsetTop,  to: pos[1]}
                ],
                onfinish : function(){
                    if (_self.lastDragNode) {
                        amlCore.destroyHtmlNode(_self.lastDragNode);
                        _self.lastDragNode = null;
                    }
                    else {
                        _self.oDrag.style.display = "none";
                    }
                }
            });
        }
        else if (this.lastDragNode) {
            amlCore.destroyHtmlNode(this.lastDragNode);
            this.lastDragNode = null;
        }
        else {
            this.oDrag.style.display = "none";
        }
    };
    
    this.$moveDragIndicator = function(e){
        var oDrag = this.lastDragNode || this.oDrag;
        oDrag.style.left = (e.clientX + this.diffX) + "px";// - this.oDrag.startX
        oDrag.style.top  = (e.clientY + this.diffY + (this.multiple ? 15 : 0)) + "px";// - this.oDrag.startY
    };
    
    this.addEventListener("$skinchange", function(){
        this.$initDragDrop();
    });
    
    this.$initDragDrop = function(){
        if (!this.$hasLayoutNode("dragindicator")) 
            return;

        this.oDrag = apf.insertHtmlNode(
            this.$getLayoutNode("dragindicator"), document.body);

        zManager.set("drag", this.oDrag);
        
        this.oDrag.style.position = "absolute";
        this.oDrag.style.cursor   = "default";
        this.oDrag.style.display  = "none";
    };

    this.$findValueNode = function(el){
        if (!el) return null;

        while(el && el.nodeType == 1 
          && !el.getAttribute(apf.xmldb.htmlIdTag)) {
            if (this.$isTreeArch && el.previousSibling 
              && el.previousSibling.nodeType == 1) //@todo hack!! apf3.0 fix this.
                el = el.previousSibling;
            else
                el = el.parentNode;
        }

        return (el && el.nodeType == 1 && el.getAttribute(apf.xmldb.htmlIdTag)) 
            ? el 
            : null;
    };
    

    this.$dragout  = function(el, dragdata, extra){
        if (this.lastel)
            this.$setStyleClass(this.lastel, "", ["dragDenied", "dragInsert",
                "dragAppend", "selected", "indicate"]);
        
        var sel = this.$getSelection(true);
        for (var i = 0, l = sel.length; i < l; i++) 
            this.$setStyleClass(sel[i], "selected", ["dragDenied",
                "dragInsert", "dragAppend", "indicate"]);
        
        this.$setStyleClass(this.$ext, "", [this.$baseCSSname + "Drop"]);
        
        this.lastel = null;
    };
    
    if (!this.$dragdrop)
        this.$dragdrop = this.$dragout;

    this.$dragover = function(el, dragdata, extra){
        this.$setStyleClass(this.$ext, this.$baseCSSname + "Drop");
        
        var sel = this.$getSelection(true);
        for (var i = 0, l = sel.length; i < l; i++) 
            this.$setStyleClass(sel[i], "", ["dragDenied",
                "dragInsert", "dragAppend", "selected", "indicate"]);
        
        if (this.lastel)
            this.$setStyleClass(this.lastel, "", ["dragDenied",
                "dragInsert", "dragAppend", "selected", "indicate"]);

        var action = extra[1] && extra[1].action;
        this.lastel = this.$findValueNode(el);
        if (this.$isTreeArch && action == "list-append") {
            var htmlNode = apf.xmldb.findHtmlNode(this.getTraverseParent(apf.xmldb.getNode(this.lastel)), this);
            
            this.lastel = htmlNode
                ? this.$getLayoutNode("item", "container", htmlNode)
                : this.$container;
            
            this.$setStyleClass(this.lastel, "dragInsert");
        }
        else {
            this.$setStyleClass(this.lastel, extra
                ? (action == "insert-before" 
                    ? "dragInsert" 
                    : "dragAppend") 
                : "dragDenied");
        }
    };
    // #endif
};

});