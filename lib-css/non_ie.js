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

// #ifdef __SUPPORT_WEBKIT || __SUPPORT_GECKO
/**
 * @private
 */
apf.runNonIe = function (){
    //#ifdef __SUPPORT_IE_API

    DocumentFragment.prototype.getElementById = function(id){
        return this.childNodes.length ? this.childNodes[0].ownerDocument.getElementById(id) : null;
    };

    //#ifdef __WITH_UIRECORDER
    /**** Event.cancelBubble ****/
    if (!apf.isOpera) {  // @todo, add solution for Opera
        if (MouseEvent.prototype.__defineSetter__) {
            //Event.cancelBubble
            MouseEvent.prototype.__defineSetter__("cancelBubble", function(b){
                if (apf.uirecorder.isRecording || apf.uirecorder.isTesting) {
                    // ignore click event
                    if (this.type != "click")
                        apf.uirecorder.capture[this.type](this);
                }
            });
        }
    }
    //#endif
    

    
    /* ******** HTML Interfaces **************************************************
        insertAdjacentHTML(), insertAdjacentText() and insertAdjacentElement()
    ****************************************************************************/
    if (typeof HTMLElement!="undefined") {
        if (!HTMLElement.prototype.insertAdjacentElement) {
            Text.prototype.insertAdjacentElement =
            HTMLElement.prototype.insertAdjacentElement = function(where,parsedNode){
                switch (where.toLowerCase()) {
                    case "beforebegin":
                        this.parentNode.insertBefore(parsedNode,this);
                        break;
                    case "afterbegin":
                        this.insertBefore(parsedNode,this.firstChild);
                        break;
                    case "beforeend":
                        this.appendChild(parsedNode);
                        break;
                    case "afterend":
                        if (this.nextSibling)
                            this.parentNode.insertBefore(parsedNode,this.nextSibling);
                        else
                            this.parentNode.appendChild(parsedNode);
                        break;
                }
            };
        }

        if (!HTMLElement.prototype.insertAdjacentHTML) {
            Text.prototype.insertAdjacentHTML =
            HTMLElement.prototype.insertAdjacentHTML = function(where,htmlStr){
                var r = this.ownerDocument.createRange();
                r.setStartBefore(apf.isWebkit
                    ? document.body
                    : (self.document ? document.body : this));
                var parsedHTML = r.createContextualFragment(htmlStr);
                this.insertAdjacentElement(where, parsedHTML);
            };
        }

        if (!HTMLBodyElement.prototype.insertAdjacentHTML) //apf.isWebkit)
            HTMLBodyElement.prototype.insertAdjacentHTML = HTMLElement.prototype.insertAdjacentHTML;
    
        if (!HTMLElement.prototype.insertAdjacentText) {
            Text.prototype.insertAdjacentText =
            HTMLElement.prototype.insertAdjacentText = function(where,txtStr){
                var parsedText = document.createTextNode(txtStr);
                this.insertAdjacentElement(where,parsedText);
            };
        }
        
        //HTMLElement.removeNode
        HTMLElement.prototype.removeNode = function(){
            if (!this.parentNode) return;

            this.parentNode.removeChild(this);
        };
        
        //Currently only supported by Gecko
        if (HTMLElement.prototype.__defineSetter__) {
            //HTMLElement.innerText
            HTMLElement.prototype.__defineSetter__("innerText", function(sText){
                var s = "" + sText;
                this.innerHTML = s.replace(/\&/g, "&amp;")
                    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
            });
        
            HTMLElement.prototype.__defineGetter__("innerText", function(){
                return this.innerHTML.replace(/<[^>]+>/g,"")
                    .replace(/\s\s+/g, " ").replace(/^\s+|\s+$/g, " ");
            });
            
            HTMLElement.prototype.__defineGetter__("outerHTML", function(){
                return (new XMLSerializer()).serializeToString(this);
            });
        }
    }
    
    /**
     * This method retrieves the current value of a property on a HTML element
     * @param {HTMLElement} el    the element to read the property from
     * @param {String}      prop  the property to read
     * @returns {String}
     */
    var getStyle = apf.getStyle = function(el, prop) {
        return (window.getComputedStyle(el, "") || {})[prop] || "";
    };
    
    /* ******** XML Compatibility ************************************************
        Extensions to the xmldb
    ****************************************************************************/

    

    if (document.body)
        document.body.focus = function(){};
    
    apf.getOpacity = function(oHtml) {
        return apf.getStyle(oHtml, "opacity");
    };
    
    apf.setOpacity = function(oHtml, value){
        oHtml.style.opacity = value;
    };
}
//#endif
