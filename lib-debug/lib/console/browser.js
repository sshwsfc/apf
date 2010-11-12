module.declare(function(require, exports, module){
    
/**
 * The console outputs to the debug screen and offers differents ways to do
 * this.
 */
var console = {
    //#ifdef __DEBUG
    /**
     * @private
     */
    data : {
        time  : {
            messages : {}
        },

        log   : {
            messages : {}
        },
        
        custom   : {
            messages : {}
        },

        warn  : {
            messages : {}
        },

        error : {
            messages : {}
        },
        
        repeat : {
            messages : {}
        }
    },

    /**
     * @private
     */
    toggle : function(node, id){
        var sPath = apf.$debugwin ? apf.$debugwin.resPath : apf.basePath + "core/debug/resources/";
        if (node.style.display == "block") {
            node.style.display = "none";
            node.parentNode.style.backgroundImage = "url(" + sPath + "splus.gif)";
            node.innerHTML = "";
        }
        else {
            node.style.display = "block";
            node.parentNode.style.backgroundImage = "url(" + sPath + "smin.gif)";
            node.innerHTML = this.cache[id]
                .replace(/\&/g, "&amp;")
                .replace(/\t/g,"&nbsp;&nbsp;&nbsp;")
                .replace(/ /g,"&nbsp;")
                .replace(/\</g, "&lt;")
                .replace(/\n/g, "<br />");

            var p  = node.parentNode.parentNode.parentNode,
                el = node.parentNode.parentNode;
            if(p.scrollTop + p.offsetHeight < el.offsetTop + el.offsetHeight)
                p.scrollTop = el.offsetTop + el.offsetHeight - p.offsetHeight;
        }
    },

    cache : [],
    history : [],
    typeLut : {time: "log", repeat: "log"},
    $lastmsg : "",
    $lastmsgcount : 0,

    $detectSameMessage : function(){
        apf.console.$lastmsg = "";
        if (apf.console.$lastmsgcount) {
            var msg = apf.console.$lastmsgcount + " times the same message";
            apf.console.$lastmsgcount = 0;
            apf.console.write(msg, "repeat");
            clearTimeout(apf.console.$timer);
        }
    },
    
    teleportList : [],
    teleport : function(log){
        if (this.teleportModel)
            log.setXml(this.teleportModel.data);
        
        this.teleportList.push(log);
    },
    setTeleportModel : function(mdl){
        if (this.teleportModel == mdl)
            return;
        
        this.teleportModel = mdl;
        var xml = apf.getXml("<teleport />");
        for (var i = 0; i < this.teleportList.length; i++) {
            this.teleportList[i].setXml(xml);
        }
        
        mdl.load(xml);
    },

    /**
     * @private
     * @event debug Fires when a message is sent to the console.
     *   object:
     *      {String} message the content of the message.
     */
    write : function(msg, type, subtype, data, forceWin, nodate){
        clearTimeout(this.$timer);
        if (msg == this.$lastmsg) {
            this.$lastmsgcount++;
            this.$timer = $setTimeout(this.$detectSameMessage, 1000);
            return;
        }

        this.$detectSameMessage();
        this.$lastmsg = msg;
        this.$timer = $setTimeout(this.$detectSameMessage, 1000);
        
        //if (!apf.debug) return;
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

        msg = (!nodate ? "<span class='console_date'>[" + date + "]</span> " : "")
                + String(msg)
                    .replace(/(<[^>]+>)| /g, function(m, tag, sp){
                        if (tag) return tag;
                        return "&nbsp;";
                    })
                    //.replace(/\n/g, "\n<br />")
                    .replace(/\t/g,"&nbsp;&nbsp;&nbsp;");
        var sPath = apf.$debugwin && apf.$debugwin.resPath
            ? apf.$debugwin.resPath
            : apf.basePath + "core/debug/resources/";

        if (data) {
            msg += "<blockquote style='margin:2px 0 0 0;"
                +  "background:url(" + sPath + "splus.gif) no-repeat 2px 3px'>"
                +  "<strong style='width:120px;cursor:default;display:block;padding:0 0 0 17px' "
                +  "onmousedown='(self.apf || window.opener.apf).console.toggle(this.nextSibling, "
                +  (this.cache.push(data) - 1) + ")'>More information"
                +  "</strong><div style='display:none;background-color:#EEEEEE;"
                +  "padding:3px 3px 20px 3px;overflow:auto;max-height:200px'>"
                +  "</div></blockquote>";
        }

        msg = "<div class='console_line console_" 
            + type + "' >" + msg + "</div>"; //\n<br style='line-height:0'/>

        //deprecated
        if (!subtype)
            subtype = "default";

        this.history.push([this.typeLut[type] || type, msg]);

        if (this.win && !this.win.closed)
            this.showWindow(msg);

        //if (apf.debugFilter.match(new RegExp("!" + subtype + "(\||$)", "i")))
        //    return;

        this.debugInfo.push(msg);

        if (self.console && (!document.all || apf.config.debug)) {
            console[type == "warn" ? "warn" : 
                (type == "error" ? "error" : "log")]
                    (msg.replace(/<[^>]*>/g, "").unescapeHTML());
        }

        if (apf.dispatchEvent)
            apf.dispatchEvent("debug", {message: msg, type: type});
    },
    
    clear : function(){
        this.history = [];
    },
    
    getAll : function(err, wrn, log) {
        var hash = {"error": err, "warn": wrn, "log": log, "custom": 1};
        var out = [];
        for (var i = 0, l = this.history.length; i < l; i++) {
            if (hash[this.history[i][0]])
                out.push(this.history[i][1]);
        }
        return out.join("");
    },
    //#endif

    /**
     * Writes a message to the console.
     * @param {String} msg      the message to display in the console.
     * @param {String} subtype  the category for this message. This is used for filtering the messages.
     * @param {String} data     extra data that might help in debugging.
     */
    debug : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.write(msg, "time", subtype, data);
        //#endif
    },

    /**
     * Writes a message to the console with the time icon next to it.
     * @param {String} msg      the message to display in the console.
     * @param {String} subtype  the category for this message. This is used for filtering the messages.
     * @param {String} data     extra data that might help in debugging.
     */
    time : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.write(msg, "time", subtype, data);
        //#endif
    },

    /**
     * Writes a message to the console.
     * @param {String} msg      the message to display in the console.
     * @param {String} subtype  the category for this message. This is used for filtering the messages.
     * @param {String} data     extra data that might help in debugging.
     */
    log : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.write(msg.escapeHTML().replace(/\n/g, "<br />"), "log", subtype, data);
        //#endif
    },

    /**
     * Writes a message to the console with the visual "info" icon and color
     * coding.
     * @param {String} msg      the message to display in the console.
     * @param {String} subtype  the category for this message. This is used for filtering the messages.
     * @param {String} data     extra data that might help in debugging.
     */
    info : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.log(msg.escapeHTML().replace(/\n/g, "<br />"), subtype, data);
        //#endif
    },

    /**
     * Writes a message to the console with the visual "warning" icon and
     * color coding.
     * @param {String} msg      the message to display in the console.
     * @param {String} subtype  the category for this message. This is used for filtering the messages.
     * @param {String} data     extra data that might help in debugging.
     */
    warn : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.write(msg.escapeHTML().replace(/\n/g, "<br />"), "warn", subtype, data);
        //#endif
    },

    /**
     * Writes a message to the console with the visual "error" icon and
     * color coding.
     * @param {String} msg      the message to display in the console.
     * @param {String} subtype  the category for this message. This is used for filtering the messages.
     * @param {String} data     extra data that might help in debugging.
     */
    error : function(msg, subtype, data){
        //#ifdef __DEBUG
        this.write(msg.replace(/\n/g, "<br />"), "error", subtype, data);
        //#endif
    },

    /**
     * Prints a listing of all properties of the object.
     * @param {mixed} obj the object for which the properties are displayed.
     */
    dir : function(obj){
        var s = apf.$debugwin.$serializeObject(obj, "Inspected via apf.console.dir");
        if (typeof s == "string") {
            this.write(s, "custom", null, null, null, true);
        }
        else {
            this.write(obj
                ? "Could not serialize object: " + s.message
                : obj, "error", null, null, null, true);
        }
        
        //this.info(apf.vardump(obj, null, false).replace(/ /g, "&nbsp;").replace(/</g, "&lt;"));
    }
    
    //#ifdef __DEBUG
    ,
    debugInfo : [],
    debugType : "",

    /**
     * Shows a browser window with the contents of the console.
     * @param {String} msg a new message to add to the new window.
     */
    showWindow : function(msg){
        if (!this.win || this.win.closed) {
            this.win = window.open("", "debug");
            this.win.document.write(
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
              + '<body style="margin:0;font-family:Verdana;font-size:8pt;"></body>');
        }
        if (!this.win) {
            if (!this.haspopupkiller)
                alert("Could not open debug window, please check your popupkiller");
            this.haspopupkiller = true;
        }
        else {
            this.win.document.write((msg || this.debugInfo.join(""))
                .replace(/\{imgpath\}/g, apf.debugwin
                    ? apf.debugwin.resPath
                    : apf.basePath + "core/debug/resources/"));
        }
    }
};

module.exports = console;

});