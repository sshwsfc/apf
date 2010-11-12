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

module.declare(function(require, exports, module){

module.exports = {
    /**
     * Determines whether a node is a child of another node.
     *
     * @param {DOMNode} pNode      the potential parent element.
     * @param {DOMNode} childnode  the potential child node.
     * @param {Boolean} [orItself] whether the method also returns true when pNode is the childnode.
     * @return  {Number} the child position of the node. Or false if it's not a child.
     */
    isChildOf : function(pNode, childnode, orItself){
        if (!pNode || !childnode)
            return false;
        
        if (childnode.nodeType == 2)
            childnode = childnode.ownerElement || childnode.selectSingleNode("..");
        
        if (orItself && pNode == childnode)
            return true;
    
        var loopnode = childnode.parentNode;
        while(loopnode){
            if(loopnode == pNode)
                return true;
            loopnode = loopnode.parentNode;
        }
    
        return false;
    },
    
    /**
     * Determines whether a node is it's parent's only child.
     * @param {DOMNode} node     the potential only child.
     * @param {Array}   nodeType list of the node types that this child can be.
     * @returns {Boolean} whether the node is only child and optionally of one of the specified nodeTypes.
     */
    isOnlyChild : function(node, nodeType){
        if (!node || !node.parentNode || nodeType && nodeType.indexOf(node.nodeType) == -1)
            return false;
    
        var i, l, cnode, nodes = node.parentNode.childNodes;
        for (i = 0, l = nodes.length; i < l; i++) {
            cnode = nodes[i];
            if (cnode.nodeType == 1 && cnode != node)
                return false;
            if (cnode.nodeType == 3 && !cnode.nodeValue.trim())
                return false;
        }
    
        return true;
    },
    
    /**
     * Gets the position of a dom node within the list of child nodes of it's
     * parent.
     *
     * @param {DOMNode} node the node for which the child position is determined.
     * @return {Number} the child position of the node.
     */
    getChildNumber : function(node, fromList){
        if (!node) return -1;
        
        var p = node.parentNode, j = 0;
        if (!p) return 0;
        if (!fromList)
            fromList = p.childNodes;
        
        if (fromList.indexOf) {
            var idx = fromList.indexOf(node);
            return idx == -1 ? fromList.length : idx;
        }
            
        for (var i = 0, l = fromList.length; i < l; i++) {
            if (fromList[i] == node)
                return j;
            j++;
        }
        return j;
    },
    
    /**
     * Escapes "&amp;", greater than and less than signs and quotation marks into
     * the proper XML entities.
     * 
     * @param {String} str   The string to escape
     * @returns {String}     The escaped string
     */
    escapeXML : function(str) {
        return ((str || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&apos;")
        );
    },
    
    /**
     * @private
     */
    getArrayFromNodelist : function(nodelist){
        for (var nodes = [], j = 0, l = nodelist.length; j < l; ++j)
            nodes.push(nodelist[j]);
        return nodes;
    },
    
    serializeChildren : function(xmlNode){
        var node,
            s     = [],
            nodes = xmlNode.childNodes,
            i     = 0,
            l     = nodes.length;
        for (; i < l; ++i) {
            s[i] = (node = nodes[i]).nodeType == 1 
                ? node.xml || node.serialize()
                : (node.nodeType == 8 ? "" : node.nodeValue);
        }
        return s.join("");
    },
    
    /**
     * Creates xml nodes from an xml string recursively.
     *
     * @param {String}  strXml     the xml definition.
     * @param {Boolean} [noError]  whether an exception should be thrown by the parser
     *                             when the xml is not valid.
     * @param {Boolean} [preserveWhiteSpace]  whether whitespace that is present between
     *                                        XML elements should be preserved
     * @return {XMLNode} the created xml node.
     */
    getXml : function(strXml, noError, preserveWhiteSpace){
        return getXmlDom(strXml, noError, preserveWhiteSpace).documentElement;
    };
};

    }
);