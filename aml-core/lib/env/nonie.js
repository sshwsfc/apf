if (document.body)
    document.body.focus = function(){};

    DocumentFragment.prototype.getElementById = function(id){
        return this.childNodes.length ? this.childNodes[0].ownerDocument.getElementById(id) : null;
    };

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