/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 */

require.def(function(){

return {
    /**
     * Determines whether the keyboard input was a character that can influence
     * the value of an element (like a textbox).
     * @param {Number} charCode The ascii character code.
     */
    isCharacter : function(charCode){
        return (charCode < 112 || charCode > 122)
          && (charCode == 32 || charCode > 42 || charCode == 8);
    },
    
    /**
     * Adds a time stamp to the url to prevent the browser from caching it.
     * @param {String} url the url to add the timestamp to.
     * @return {String} the url with timestamp.
     */
    getNoCacheUrl : function(url){
        return url
            + (url.indexOf("?") == -1 ? "?" : "&")
            + "nocache=" + new Date().getTime();
    },
    
    /**
     * Checks if the string contains curly braces at the start and end. If so it's
     * processed as javascript, else the original string is returned.
     * @param {String} str the string to parse.
     * @return {String} the result of the parsing.
     */
    parseExpression : function(str){
        if (!this.parseExpressionRegexp.test(str))
            return str;
    
        //#ifdef __DEBUG
        try {
        //#endif
            return eval(RegExp.$1);
        //#ifdef __DEBUG
        }
        catch(e) {
            throw new Error(apf.formatErrorString(0, null,
                "Parsing Expression",
                "Invalid expression given '" + str + "'"));
        }
        //#endif
    },
    parseExpressionRegexp : /^\{([\s\S]*)\}$/,
    
    /**
     * @todo move this to Number.format() in ecmaext
     */
    formatNumber : function(num, prefix){
        var nr = parseFloat(num);
        if (!nr) return num;
    
        var str = new String(Math.round(nr * 100) / 100).replace(/(\.\d?\d?)$/, function(m1){
            return m1.pad(3, "0", apf.PAD_RIGHT);
        });
        if (str.indexOf(".") == -1)
            str += ".00";
    
        return prefix + str;
    },
    
    /**
     * Execute a script in the global scope.
     *
     * @param {String} str  the javascript code to execute.
     * @return {String} the javascript code executed.
     */
    jsexec : function(str, win){
        if (!str)
            return str;
        if (!win)
            win = self;
    
        if (apf.isO3)
            eval(str, self);
        else if (apf.hasExecScript) {
            win.execScript(str);
        }
        else {
            var head = win.document.getElementsByTagName("head")[0];
            if (head) {
                var script = win.document.createElement('script');
                script.setAttribute('type', 'text/javascript');
                script.text = str;
                head.appendChild(script);
                head.removeChild(script);
            } else
                eval(str, win);
        }
    
        return str;
    },
    
    /**
     * Shorthand for an empty function.
     */
    K : function(){},
    
    /**
     * Determines whether a string is true in the html attribute sense.
     * @param {mixed} value the variable to check
     *   Possible values:
     *   true   The function returns true.
     *   'true' The function returns true.
     *   'on'   The function returns true.
     *   1      The function returns true.
     *   '1'    The function returns true.
     * @return {Boolean} whether the string is considered to imply truth.
     */
    isTrue : function(c){
        return (c === true || c === "true" || c === "on" || typeof c == "number" && c > 0 || c === "1");
    },
    
    /**
     * Determines whether a string is false in the html attribute sense.
     * @param {mixed} value the variable to check
     *   Possible values:
     *   false   The function returns true.
     *   'false' The function returns true.
     *   'off'   The function returns true.
     *   0       The function returns true.
     *   '0'     The function returns true.
     * @return {Boolean} whether the string is considered to imply untruth.
     */
    isFalse : function(c){
        return (c === false || c === "false" || c === "off" || c === 0 || c === "0");
    },
    
    /**
     * Determines whether a value should be considered false. This excludes amongst
     * others the number 0.
     * @param {mixed} value the variable to check
     * @return {Boolean} whether the variable is considered false.
     */
    isNot : function(c){
        // a var that is null, false, undefined, Infinity, NaN and c isn't a string
        return (!c && typeof c != "string" && c !== 0 || (typeof c == "number" && !isFinite(c)));
    },
    
    /**
     * Creates a relative url based on an absolute url.
     * @param {String} base the start of the url to which relative url's work.
     * @param {String} url  the url to transform.
     * @return {String} the relative url.
     */
    removePathContext : function(base, url){
        if (!url)  return "";
    
        if (url.indexOf(base) > -1)
            return url.substr(base.length);
    
        return url;
    },
    
    isCoord = function (n){
        return n || n === 0;
    }
    
    getCoord = function (n, other){
        return n || n === 0 ? n : other;
    }
    
    /**
     * @private
     */
    getBox : function(value, base){
        if (!base) base = 0;
    
        if (value == null || (!parseInt(value) && parseInt(value) != 0))
            return [0, 0, 0, 0];
    
        var x = String(value).splitSafe(" ");
        for (var i = 0; i < x.length; i++)
            x[i] = parseInt(x[i]) || 0;
        switch (x.length) {
            case 1:
                x[1] = x[0];
                x[2] = x[0];
                x[3] = x[0];
                break;
            case 2:
                x[2] = x[0];
                x[3] = x[1];
                break;
            case 3:
                x[3] = x[1];
                break;
        }
    
        return x;
    },
    
    /**
     * Retrieves the first xml node with nodeType 1 from the children of an xml element.
     * @param {XMLElement} xmlNode the xml element that is the parent of the element to select.
     * @return {XMLElement} the first child element of the xml parent.
     * @throw error when no child element is found.
     */
    getFirstElement : function(xmlNode){
        // #ifdef __DEBUG
        try {
            xmlNode.firstChild.nodeType == 1
                ? xmlNode.firstChild
                : xmlNode.firstChild.nextSibling
        }
        catch (e) {
            throw new Error(apf.formatErrorString(1052, null,
                "Xml Selection",
                "Could not find element:\n"
                + (xmlNode ? xmlNode.xml : "null")));
        }
        // #endif
    
        return xmlNode.firstChild.nodeType == 1
            ? xmlNode.firstChild
            : xmlNode.firstChild.nextSibling;
    }
}

});