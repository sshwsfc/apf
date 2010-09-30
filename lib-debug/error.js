
    /**
     * Formats a Ajax.org Platform error message.
     * @param {Number}      number      the number of the error. This can be used to look up more information about the error.
     * @param {AMLElement}  control     the aml element that will throw the error.
     * @param {String}      process     the action that was being executed.
     * @param {String}      message     the actual error message.
     * @param {XMLElement}  amlContext  the xml relevant to the error. For instance a piece of Ajax.org Markup Language xml.
     */
    formatErrorString : function(number, control, process, message, amlContext, outputname, output){
        //#ifdef __DEBUG
        var str = [];
        if (amlContext && amlContext.ownerDocument) {
            if (amlContext.nodeType == 9)
                amlContext = amlContext.documentElement;

            //Determine file context
            if (amlContext.ownerDocument.documentElement) {
                var file = amlContext.ownerDocument.documentElement.getAttribute("filename");
                if (!file && amlContext.ownerDocument.documentElement.tagName == "html")
                    file = location.href;
                file = file
                    ? apf.removePathContext(apf.hostPath, file)
                    : "Unkown filename";
            }
            else file = "Unknown filename";

            //Get serialized version of context
            if (apf.$debugwin)
                var amlStr = apf.$debugwin.$serializeObject(amlContext);
            else
                var amlStr = (amlContext.outerHTML || amlContext.xml || amlContext.serialize())
                    .replace(/\<\?xml\:namespace prefix = j ns = "http\:\/\/ajax.org\/2005\/aml" \/\>/g, "")
                    .replace(/xmlns:a="[^"]*"\s*/g, "");

            //Determine line number
            var diff, linenr = 0, w = amlContext.previousSibling
                || amlContext.parentNode && amlContext.parentNode.previousSibling;
            while (w && w[apf.TAGNAME] != "body") {
                diff    = (w.outerHTML || w.xml || w.serialize()).split("\n").length;
                linenr += diff - 1;
                w       = w.previousSibling || w.parentNode && w.parentNode.previousSibling;
            }
            if (w && w[apf.TAGNAME] != "body")
                linenr = "unknown";
            else if(amlContext.ownerDocument 
              && amlContext.ownerDocument.documentElement.tagName == "html")
                linenr += apf.lineBodyStart;

            //Grmbl line numbers are wrong when \n's in attribute space

            //Set file and line number
            str.push("aml file: [line: " + linenr + "] " + file);
        }

        if (control)
            str.push("Element: "
              + (apf.$debugwin && !apf.isDebugWindow
                ? apf.$debugwin.$serializeObject(control)
                : "'" + (control.name
                    || (control.$aml ? control.getAttribute("id") : null)
                    || "{Anonymous}")
                    + "' [" + control.tagName + "]"));
        if (process)
            str.push("Process: " + process.replace(/ +/g, " "));
        if (message)
            str.push("Message: [" + number + "] " + message.replace(/ +/g, " "));
        if (outputname)
            str.push(outputname + ": " + output);
        if (amlContext && amlStr)
            str.push("Related Markup: " + amlStr);

        return (apf.lastErrorMessage = str.join("\n"));
        /*#else
        apf.lastErrorMessage = message;
        return message;
        #endif */
    },