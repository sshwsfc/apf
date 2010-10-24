define([], function(){

/**
 * Casts the first character in a string to uppercase.
 *
 * @type {String}
 */
String.prototype.uCaseFirst = function(){
    return this.substr(0, 1).toUpperCase() + this.substr(1)
};

/**
 * Removes spaces and other space-like characters from the left and right ends
 * of a string
 *
 * @type {String}
 */
String.prototype.trim = function(){
    return this.replace(/[\s\n\r]*$/, "").replace(/^[\s\n\r]*/, "");
};

/**
 * Concatenate a string with itself n-times.
 *
 * @param {Number} times Number of times to repeat the String concatenation
 * @type  {String}
 */
String.prototype.repeat = function(times){
    return Array(times + 1).join(this);
};

/**
 * Count the number of occurences of substring 'str' inside a string
 *
 * @param {String} str
 * @type  {Number}
 */
String.prototype.count = function(str){
    return this.split(str).length - 1;
};

/**
 * Remove HTML or any XML-like tags from a string
 *
 * @type {String}
 */
String.prototype.stripTags = function() {
    return this.replace(/<\/?[^>]+>/gi, "");
};

/**
 * Wrapper for the global 'escape' function for strings
 *
 * @type {String}
 */
String.prototype.escape = function() {
    return escape(this);
};

/**
 * Returns an xml document
 * @type {XMLElement}
 */
String.prototype.toXml = function(){
    var node = apf.getXml("<root>" + this + "</root>");
    if (node.childNodes.length == 1) {
        return node.childNodes[0];
    }
    else {
        var docFrag = node.ownerDocument.createDocumentFragment(),
            nodes   = node.childNodes;
        while (nodes.length)
            docFrag.appendChild(nodes[0]);
        return docFrag;
    }
};

if (typeof window != "undefined" && typeof window.document != "undefined" 
  && typeof window.document.createElement == "function") {
    /**
     * Encode HTML entities to its HTML equivalents, like '&amp;' to '&amp;amp;'
     * and '&lt;' to '&amp;lt;'.
     *
     * @type {String}
     * @todo is this fast?
     */
    String.prototype.escapeHTML = function() {
        this.escapeHTML.text.data = this;
        return this.escapeHTML.div.innerHTML;
    };

    /**
     * Decode HTML equivalent entities to characters, like '&amp;amp;' to '&amp;'
     * and '&amp;lt;' to '&lt;'.
     *
     * @type {String}
     */
    String.prototype.unescapeHTML = function() {
        var div = document.createElement("div");
        div.innerHTML = this.stripTags();
        if (div.childNodes[0]) {
            if (div.childNodes.length > 1) {
                var out = [];
                for (var i = 0; i < div.childNodes.length; i++)
                    out.push(div.childNodes[i].nodeValue);
                return out.join("");
            }
            else
                return div.childNodes[0].nodeValue;
        }
        return "";
    };

    String.prototype.escapeHTML.div  = document.createElement("div");
    String.prototype.escapeHTML.text = document.createTextNode("");
    String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);

    if ("<\n>".escapeHTML() !== "&lt;\n&gt;")
        String.prototype.escapeHTML = null;

    if ("&lt;\n&gt;".unescapeHTML() !== "<\n>")
        String.prototype.unescapeHTML = null;
}

if (!String.prototype.escapeHTML) {
    String.prototype.escapeHTML = function() {
        return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    };
}

if (!String.prototype.unescapeHTML) {
    String.prototype.unescapeHTML = function() {
        //stripTags(). ??
        return this.replace(/\&\#38;/g, "&").replace(/&lt;/g,"<").
            replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&nbsp;/g, " ");
    };
}

/**
 * Trim a string down to a specific number of characters. Optionally, append an
 * ellipsis ('...') as a suffix.
 *
 * @param {Number}  nr
 * @param {Boolean} [ellipsis] Append an ellipsis
 * @type  {String}
 */
String.prototype.truncate = function(nr, ellipsis){
    return this.length >= nr
        ? this.substring(0, nr - (ellipsis ? 4 : 1)) + (ellipsis ? "..." : "")
        : this;
};

/**
 * Pad a string at the right or left end with a string 'pad' to a specific
 * number of characters. Highly optimized version for speed, not readability.
 *
 * @param {Number}  len   Specifies the amount of characters required to pad to.
 * @param {String}  pad   Specifies the character(s) to pad the string with
 * @param {Boolean} [dir] Specifies at which end to append the 'pad' character (String.PAD_LEFT or String.PAD_RIGHT).
 * @type  {String}
 */
String.prototype.pad = function(len, pad, dir) {
    return dir ? (this + Array(len).join(pad)).slice(0, len)
        : (Array(len).join(pad) + this).slice(-len);
};

String.PAD_LEFT  = false;
String.PAD_RIGHT = true;

/**
 * Special String.split; optionally lowercase a string and trim all results from
 * the left and right.
 *
 * @param {String}  separator
 * @param {Number}  limit      Maximum number of items to return
 * @param {Boolean} bLowerCase Flag to lowercase the string prior to split
 * @type  {String}
 */
String.prototype.splitSafe = function(separator, limit, bLowerCase) {
    return (bLowerCase && this.toLowerCase() || this)
        .replace(/(?:^\s+|\n|\s+$)/g, "")
        .split(new RegExp("[\\s ]*" + separator + "[\\s ]*", "g"), limit || 999);
};

/**
 * Returns a string produced according to the formatting string. It replaces
 * all <i>%s</i> occurrences with the arguments provided.
 *
 * @link http://www.php.net/sprintf
 * @type {String}
 */
String.prototype.sprintf = function() {
    // Create a new string from the old one, don't just create a copy
    var str = this.toString(),
        i   = 0,
        inx = str.indexOf("%s");
    while (inx >= 0) {
        var replacement = arguments[i++] || " ";
        str = str.substr(0, inx) + replacement + str.substr(inx + 2);
        inx = str.indexOf("%s");
    }
    return str;
};

});