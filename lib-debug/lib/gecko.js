    module.declare(function(require, exports, module){
function Error(nr, msg){
        // #ifdef __DEBUG
        if (!apf.$debugwin.nativedebug) 
            apf.$debugwin.errorHandler(msg, "", 0);
        // #endif
        
        this.message = msg;
        this.nr = nr;
    }
})
