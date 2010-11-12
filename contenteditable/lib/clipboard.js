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

var ClipBoard = new Class();
ClipBoard.store = null;
ClipBoard.empty = true;
ClipBoard.put = function(item){
    this.store = item;
    this.setProperty("empty", item ? false : true);
};
ClipBoard.clear = function(){
    this.setProperty("empty", true);
}
ClipBoard.get = function(){
    return this.store;
};

//#ifdef __WITH_CLIPBOARD_SELECTION
ClipBoard.$highlightSelection = function(amlNode, nodes, unset){
    for (var i = 0, l = nodes.length; i < l; i++) {
        apf.setStyleClass(apf.xmldb.getHtmlNode(nodes[i], amlNode), (unset ? '' : 'cut'), ['cut']);
    }
}
ClipBoard.copySelection = function(amlNode){
    var nodes = this.get() || [];
    this.$highlightSelection(amlNode, nodes, true);
    this.put(amlNode.getSelection());
};
ClipBoard.cutSelection = function(amlNode){
    var nodes = this.get() || [];
    this.$highlightSelection(amlNode, nodes, true);
    ClipBoard.put(nodes = amlNode.getSelection());
    this.$highlightSelection(amlNode, nodes);
};
ClipBoard.pasteSelection = function(amlNode, selected){
    var nodes = this.get();
    if (!nodes) return;

    if (!selected)
        selected = amlNode.selected || amlNode.getFirstTraverseNode();

    if (nodes[0].parentNode) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            apf.xmldb.moveNode(selected, nodes[i]);
        }
    }
    else {
        for (var i = 0, l = nodes.length; i < l; i++) {
            apf.xmldb.appendChild(selected, nodes[i]);
        }
    }
    
    this.$highlightSelection(amlNode, nodes, true);
    amlNode.selectList(nodes);
};
//#endif

module.exports = ClipBoard;

});