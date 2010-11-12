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

define([
    "w3cdom/node", 
    "w3cdom/configuration", 
    "optional!lib-parsers/xpath", 
    "optional!envdetect", 
    "lib-oop"], 
    function(DOMNode, DOMConfig, xpath, env, oop){

/**
 * The aml document, this is the root of the DOM Tree and has a nodeType with 
 * value 9 (this.DOCUMENT). 
 *
 * @constructor
 * @inherits apf.DOMNode
 * @inherits apf.Class
 * @default_private 
 * @see baseclass.amldom
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.8
 */
DOMDocument = function(){
    DOMNode.apply(this, arguments);
    
    this.$prefixes      = {};
    this.$namespaceURIs = {};
    this.domConfig      = new DOMConfig();
};

//Inherit
oop.inherits(DOMDocument, DOMNode);

(function() {
    /**
     * The type of node within the document.
     *   Possible values:
     */
    this.nodeType   = this.NODE_DOCUMENT;
    this.nodeFunc   = this.NODE_HIDDEN;
    this.nodeName   = "#document";
    
    this.$amlLoaded = true;
    
    this.activeElement   = null; //@todo alias of window.foccussed;
    this.doctype         = null;
    this.domConfig       = null;
    this.implementation  = null;
    this.characterSet    = env && env.characterSet;
    
    /**
     * The root element node of the aml application. This is an element with
     * the tagName 'application'. This is similar to the 'html' element
     */
    this.documentElement = null;
    
    /**
     * Gets a aml element based on it's id.
     * @param {String} id the id of the aml element to return.
     * @return {AMLElement} the aml element with the id specified.
     */
    this.getElementById = function(id){
        return self[id];
    };
    
    this.getElementsByTagName = function(tagName){
        var docEl, res = (docEl = this.documentElement)
            .getElementsByTagName(tagName);

        if (tagName == "*" || docEl.tagName == tagName)
            res.unshift(docEl);
        return res;
    };
    
    this.getElementsByTagNameNS = function(nameSpaceURI, tagName){
        var docEl,
            res = (docEl = this.documentElement)
                .getElementsByTagNameNS(nameSpaceURI, tagName);

        if (tagName == "*" || docEl.tagName == tagName && docEl.namespaceURI == nameSpaceURI)
            res.unshift(docEl);
        return res;
    };

    /**
     * Creates a new aml element.
     * @param {mixed} tagName information about the new node to create.
     *   Possible values:
     *   {String}     the tagName of the new element to create
     *   {String}     the aml definition for a single or multiple elements.
     *   {XMLElement} the aml definition for a single or multiple elements.
     * @return {AMLElement} the created aml element.
     */
    this.createElement = function(qualifiedName){
        return this.$domParser.$createNode(this, this.NODE_ELEMENT, null,
            this.namespaceURI, qualifiedName);
    };
        
    this.createElementNS = function(namespaceURI, qualifiedName){
        return this.$domParser.$createNode(this, this.NODE_ELEMENT, null,
            namespaceURI, qualifiedName);
    };
    
    this.importNode = function(node, deep){
        if (deep && node.nodeType == 1) {
            return this.$domParser.parseFromXml(node, {
                doc   : this,
                delay : true
            }).childNodes[0];
        }
        else {
            return this.$domParser.$createNode(this, node.nodeType, node);
        }
    };
    
    //@todo
    this.createAttribute = function(nodeName){
        return this.$domParser.$createNode(this, this.NODE_ATTRIBUTE, null,
            this.nameSpaceURI, nodeName);
    };
    
    //@todo
    this.createAttributeNS = function(nameSpaceURI, nodeName){
        return this.$domParser.$createNode(this, this.NODE_ATTRIBUTE, null,
            nameSpaceURI, nodeName);
    };
    
    this.createEvent = function(){
        return new apf.AmlEvent();
    };
    
    this.createComment = function(nodeValue){
        return this.$domParser.$createNode(this, this.NODE_COMMENT, null, null,
            null, nodeValue);
    };
    
    this.createProcessingInstruction = function(target, data){
        return this.$domParser.$createNode(this, this.NODE_PROCESSING_INSTRUCTION,
            null, null, target, data);
    };
    
    this.createCDATASection = function(nodeValue){
        return this.$domParser.$createNode(this, this.NODE_CDATA_SECTION, null,
            null, null, nodeValue);
    };
    
    this.createTextNode = function(nodeValue){
        return this.$domParser.$createNode(this, this.NODE_TEXT, null, null,
            null, nodeValue);
    };
    
    this.createDocumentFragment = function(){
        return this.$domParser.$createNode(this, this.NODE_DOCUMENT_FRAGMENT);
    };

    this.querySelector = function(){};
    
    this.querySelectorAll = function(){};

    //#ifdef __WITH_AMLDOM_W3C_XPATH
    /**
     * See W3C evaluate
     */
    this.evaluate = function(sExpr, contextNode, nsResolver, type, x){
        var result = xpath.selectNodes(sExpr,
            contextNode || this.documentElement);

        /**
         * @private
         */
        return {
            snapshotLength : result.length,
            snapshotItem   : function(i){
                return result[i];
            }
        }
    };

    /**
     * See W3C createNSResolver
     */
    this.createNSResolver = function(contextNode){
        return {};
    };
    //#endif

    this.hasFocus = function(){
        
    }
}).call(DOMDocument.prototype);

return DOMDocument;

    }
);