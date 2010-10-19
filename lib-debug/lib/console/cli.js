define([], function(){
    
/**
 * The console outputs to the debug screen
 */
var console = {
    //#ifdef __DEBUG
    write : function(msg, type, subtype, data, forceWin, nodate){
        if (!Number.prototype.toPrettyDigit) {
            Number.prototype.toPrettyDigit = function() {
                var n = this.toString();
                return (n.length == 1) ? "0" + n : n;
            }
        }

        var dt   = new Date(),
            ms   = String(dt.getMilliseconds());
        while (ms.length < 3)
            ms += "0";
        var date = dt.getHours().toPrettyDigit()   + ":"
                 + dt.getMinutes().toPrettyDigit() + ":"
                 + dt.getSeconds().toPrettyDigit() + "." + ms;
        
        sys.puts((nodate ? "" : date) + " " + msg + (data ? "Extra information:\n" + data : ""));
    },
    //#endif
    
    debug : function(){
        
    },
    
    time : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.write(msg, "time", subtype, data);
        //#endif
    },
    
    log : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.info(msg, subtype, data);
        //#endif
    },
    
    info : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.write(msg, "info", subtype, data);
        //#endif
    },
    
    warn : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.write(msg, "warn", subtype, data);
        //#endif
    },
    
    error : function(msg, subtype, data){
        //#ifdef __DEBUG
    	this.write("Error "+ "\033[35m"+msg+"\033[39m", "error",subtype,data);
        //this.write("Error: " + msg + "\nStacktrace:\n" + new Error().stack, "error", subtype, data);
        //#endif
    },
    
    dir : function(obj){
        this.info(apf.vardump(obj, null, true));
    },
    
    teleport: function() {}
};

return console;

});