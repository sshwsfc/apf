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
    "databinding/rulelist", 
    "aml-core/amlelement", 
    "optional!aml", 
    "lib-oop"], 
    function(RuleList, DOMElement, aml, oop){

/**
 * @define bindings element containing all the binding rules for the data 
 * bound elements referencing this element.
 * Example:
 * <code>
 *  <a:model id="mdlList">
 *      <data>
 *          <item date="2009-11-12" deleted="0"></item>
 *          <item date="2009-11-11" deleted="0"></item>
 *      </data>
 *  </a:model>
 *  <a:bindings id="bndFolders" >
 *      <a:caption match="[@date]" />
 *      <a:icon match="[@icon]" />
 *      <a:each match="[item]" sort="[@date]" />
 *  </a:bindings>
 *  <a:list 
 *    id       = "list" 
 *    width    = "200" 
 *    height   = "200" 
 *    model    = "mdlList" 
 *    bindings = "bndFolders" />
 * </code>
 * @see element.smartbinding
 *
 * @constructor
 * @apfclass
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.8
 *
 * @default_private
 */
var Bindings = function(struct, tagName){
    DOMElement.call(this, tagName || "bindings", this.NODE_HIDDEN, struct);
    
    this.$bindings = new RuleList();
    this.$amlNodes = {};
};

oop.inherits(Bindings, DOMElement);

(function(){
    this.$smartbinding = null;

    this.register = function(amlNode){
        if (amlNode.localName == "smartbinding") {
            this.$smartbinding = amlNode;
            this.$smartbinding.add(this); //Assuming only at init
            return;
        }
        
        if (!amlNode.hasFeature(apf.__DATABINDING__))
            return;

        this.$amlNodes[amlNode.$uniqueId] = amlNode;
        
        if (!this.$amlLoaded)
            return;

        if (!this.$bindings.$isCompiled)
            this.$cbindings = this.$bindings.compile();
        
        amlNode.$bindings  = this.$bindings;
        amlNode.$cbindings = this.$cbindings;
        amlNode.$bindingsElement = this;
        
        //@todo apf3.0 should be deprecated
        amlNode.dispatchEvent("bindingsload", {
            bindings: this.$bindings, 
            compiled: this.$cbindings
        });
        this.dispatchEvent("noderegister", {
            amlNode: amlNode
        });
        amlNode.$checkLoadQueue();
    };

    this.unregister = function(amlNode){
        //unregister element
        this.$amlNodes[amlNode.$uniqueId] = null;
        delete this.$amlNodes[amlNode.$uniqueId];

        amlNode.$bindingsElement = 
        amlNode.$bindings  = 
        amlNode.$cbindings = false;
        
        amlNode.dispatchEvent("bindingsunload", {
            bindings: this.$bindings, 
            compiled: this.$cbindings
        });
    };
    
    this.reload = function(){
        for (var id in this.$amlNodes){
            this.$amlNodes[id].reload();
        }
    }
    
    /**** DOM Handlers ****/
    
    this.addEventListener("DOMNodeInsertedIntoDocument", function(e){
        var nodes = this.childNodes;
        for (var node, i = 0, l = nodes.length; i < l; i++) {
            if (!(node = nodes[i]).$amlLoaded && node.nodeType == 1)
                node.dispatchEvent("DOMNodeInsertedIntoDocument"); //{relatedParent : nodes[j].parentNode}
        }
        
        this.register(this.parentNode);
        
        for (var id in this.$amlNodes)
            this.register(this.$amlNodes[id]);
    });
}).call(Bindings.prototype);

aml && aml.setElement("bindings", Bindings);

return Bindings;
});
