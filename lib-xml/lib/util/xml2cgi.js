

define([], function(){
/**
 * @private
 */
apf.convertMethods = {
    /**
     * Gets a JSON object containing all the name/value pairs of the elements
     * using this element as it's validation group.
     *
     * @return  {String}  the string representation of a the json object
     */
    "json": function(xml){
        return JSON.stringify(apf.xml2json(xml));
        /*
        var result = {}, filled = false, nodes = xml.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeType != 1)
                continue;
            var name = nodes[i].tagName;
            filled = true;

            //array
            var sameNodes = xml.selectNodes(x);
            if (sameNodes.length > 1) {
                var z = [];
                for (var j = 0; j < sameNodes.length; j++) {
                    z.push(this.json(sameNodes[j], result));
                }
                result[name] = z;
            }
            else //single value
                result[name] = this.json(sameNodes[j], result);
        }

        return filled ? result : apf.queryValue(xml, "text()");*/
    },

    "cgivars": function(xml, basename){
        if (!basename) 
            basename = "";
        
        var value, name, sameNodes, j, l2,
            str   = [],
            nodes = xml.childNodes,
            done  = {},
            i     = 0,
            l     = nodes.length;
        for (; i < l; ++i) {
            if (nodes[i].nodeType != 1)
                continue;
            name = nodes[i].tagName;
            if (done[name])
                continue;

            //array
            sameNodes = xml.selectNodes(name);
            if (sameNodes.length > 1) {
                done[name] = true;
                for (j = 0, l2 = sameNodes.length; j < l2; j++) {
                    value = this.cgivars(sameNodes[j], basename + name + "[" + j + "]");
                    if (value)
                        str.push(value);
                }
            }
            else { //single value
                value = this.cgivars(nodes[i], basename + name);
                if (value)
                    str.push(value);
            }
        }

        var attr = xml.attributes;
        for (i = 0, l = attr.length; i < l; i++) {
            if (attr[i].nodeValue) {
                if (basename) 
                    str.push(basename + "[" + attr[i].nodeName + "]="
                        + escape(attr[i].nodeValue));
                else
                    str.push(attr[i].nodeName + "=" + escape(attr[i].nodeValue));
            }
        }

        if (str.length)
            return str.join("&");

        value = apf.queryValue(xml, "text()");
        if (basename && value)
            return basename + "=" + escape(value);

        return "";
    },

    "cgiobjects": function(xml, basename, isSub, includeEmpty){
        if (!basename)
            basename = "";
        
        var node, name, value, a, i, j, attr, attr_len, isOnly,
            nodes    = xml.childNodes,
            output   = [],
            tagNames = {},
            nm       = "";
        
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            
            if (node.nodeType == 1) {
                name = node.tagName;
                
                isOnly = node.parentNode.selectNodes(name).length == 1 
                    ? true 
                    : false;
                
                if (typeof tagNames[name] == "undefined") {
                    tagNames[name] = 0;
                }

                nm = basename 
                   + (isSub ? "[" : "") + name + (isSub ? "]" : "") 
                   + (isOnly ? "" : "[" + tagNames[name] + "]");
                
                attr     = node.attributes;
                attr_len = node.attributes.length;
                
                if (attr_len > 0) {
                    for (j = 0; j < attr_len; j++) {
                        if (!(a = attr[j]).nodeValue) 
                            continue;
                        
                        output.push(nm + "[_" + a.nodeName + "]=" 
                            + escape(a.nodeValue.trim()));
                    }
                }
                
                value = this.cgiobjects(node, nm, true);
                
                if (value.dataType !== 1) {
                    output.push(value);
                }
                else {
                    if (node.firstChild && node.firstChild.nodeValue.trim()) {
                        output.push(nm + (attr_len > 0 ? "[_]=" : "=") 
                            + escape(node.firstChild.nodeValue.trim()));
                    }
                    else {
                        if (attr_len == 0) {
                            if (includeEmpty) {
                                output.push(nm);
                            }
                        }
                    }
                }
                
                tagNames[name]++;
            }
            //@todo, that's that ??
            //handle node values (for form submission)
            else if (node.nodeType == 3 && isSub) {
                var nval = node.nodeValue;
                
                if (nval && nval.trim() !== "") {
                    output.push(basename + "=" + escape(nval));
                }
                
                //was: output = node.nodeType;
            }
        }

        if (!isSub && xml.getAttribute("id"))
            output.push("id=" + escape(xml.getAttribute("id")));

        if (output.length)
            return output.join("&");

        return output;
    }
};

/**
 * Converts xml to another format.
 *
 * @param {XMLElement} xml  the {@link term.datanode data node} to convert.
 * @param {String}     to   the format to convert the xml to.
 *   Possible values:
 *   json       converts to a json string
 *   cgivars    converts to cgi string.
 *   cgiobjects converts to cgi objects
 * @return {String} the result of the conversion.
 */
apf.convertXml = function(xml, to){
    return apf.convertMethods[to](xml);
};

})
