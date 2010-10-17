
(function(){
    this.$resize = function(){
        this.oImg.style.top = ((this.$ext.offsetHeight - apf.getHeightDiff(this.$ext)- this.oImg.offsetHeight) / 2) + "px";
    }
})