module.declare(function(require, exports, module){
    
module.exports = function() {
    this.$showDragIndicator = function(sel, e){
        var x = e.offsetX + 22,
            y = e.offsetY;
        
        this.oDrag.startX = x;
        this.oDrag.startY = y;
        
        
        document.body.appendChild(this.oDrag);
        //this.oDrag.getElementsByTagName("DIV")[0].innerHTML = this.selected.innerHTML;
        //this.oDrag.getElementsByTagName("IMG")[0].src = this.selected.parentNode.parentNode.childNodes[1].firstChild.src;
        var oInt = this.$getLayoutNode("main", "caption", this.oDrag);
        if (oInt.nodeType != 1) 
            oInt = oInt.parentNode;
        
        oInt.innerHTML = this.$applyBindRule("caption", this.xmlRoot) || "";
        
        return this.oDrag;
    };
    
    this.$hideDragIndicator = function(){
        this.oDrag.style.display = "none";
    };
    
    this.$moveDragIndicator = function(e){
        this.oDrag.style.left = (e.clientX - this.oDrag.startX
            + document.documentElement.scrollLeft) + "px";
        this.oDrag.style.top  = (e.clientY - this.oDrag.startY
            + document.documentElement.scrollTop) + "px";
    };
    
    //@todo falsely assuming only attributes are used for non multiselect widgets
    this.$initDragDrop = function(){
        if (!this.getAttribute("drag"))
            return;
        
        this.oDrag = document.body.appendChild(this.$ext.cloneNode(true));
        
        zManager.set("drag", this.oDrag);
        
        this.oDrag.style.position   = "absolute";
        this.oDrag.style.cursor     = "default";
        this.oDrag.style.filter     = "progid:DXImageTransform.Microsoft.Alpha(opacity=50)";
        this.oDrag.style.MozOpacity = 0.5;
        this.oDrag.style.opacity    = 0.5;
        this.oDrag.style.display    = "none";
    };
};

});