
    this.$tabList = [];

    this.$addFocus = function(amlNode, tabindex, isAdmin){
        if (!isAdmin) {
            amlNode.addEventListener("DOMNodeInserted", moveFocus);
            amlNode.addEventListener("DOMNodeRemoved", removeFocus);

            if (amlNode.$isWindowContainer > -2) {
                amlNode.addEventListener("focus", trackChildFocus);
                amlNode.addEventListener("blur", trackChildFocus);

                amlNode.$focusParent = amlNode;

                if (amlNode.$isWindowContainer > -1) {
                    if (!amlNode.$tabList)
                        amlNode.$tabList = [amlNode];
                    
                    this.$tabList.push(amlNode);
                    return;
                }
                else {
                    amlNode.$tabList = [amlNode];
                }
            }
        }

        var fParent = findFocusParent(amlNode),
            list    = fParent.$tabList;

        //#ifdef __DEBUG
        if (list[tabindex]) {
            apf.console.warn("Aml node already exist for tabindex " + tabindex
                             + ". Will insert " + amlNode.tagName + " ["
                             + (amlNode.name || "") + "] before existing one");
        }
        //#endif

        if (!amlNode.$isWindowContainer)
            amlNode.$focusParent = fParent;
        else
            amlNode.$focusParent2 = fParent;

        if (list[tabindex])
            list.insertIndex(amlNode, tabindex);
        else
            list.push(amlNode);
    };

    this.$removeFocus = function(amlNode){
        if (!amlNode.$focusParent)
            return;

        amlNode.$focusParent.$tabList.remove(amlNode);

        if (!amlNode.$isWindowContainer) {
            amlNode.removeEventListener("DOMNodeInserted", moveFocus);
            amlNode.removeEventListener("DOMNodeRemoved", removeFocus);
        }

        if (amlNode.$isWindowContainer > -2) {
            amlNode.removeEventListener("focus", trackChildFocus); 
            amlNode.removeEventListener("blur", trackChildFocus);
        }
    };

    var focusLoopDetect;
    this.$focus = function(amlNode, e, force){
        var aEl = this.document.activeElement;
        if (aEl == amlNode && !force)
            return; //or maybe when force do $focus

        //#ifdef __DEBUG
        var hadAlreadyFocus = aEl == amlNode;
        //#endif

        this.$settingFocus = amlNode;

        if (!e)
            e = {};

        e.toElement   = amlNode;
        e.fromElement = aEl;

        if (aEl && aEl != amlNode && focusLoopDetect != aEl) {
            focusLoopDetect = aEl;

            aEl.blur(true, e);

            //#ifdef __WITH_XFORMS
            amlNode.dispatchEvent("DOMFocusOut");
            //#endif
            
            if (focusLoopDetect != aEl)
                return false;
        }

        (apf.activeElement = this.document.activeElement = amlNode).focus(true, e);

        this.$settingFocus = null;

        apf.dispatchEvent("movefocus", {
            toElement : amlNode
        });

        //#ifdef __WITH_XFORMS
        amlNode.dispatchEvent("xforms-focus");
        amlNode.dispatchEvent("DOMFocusIn");
        //#endif

        //#ifdef __DEBUG
        if (!hadAlreadyFocus)
            apf.console.info("Focus given to " + amlNode.localName +
                " [" + (amlNode.name || "") + "]");
        //#endif

        //#ifdef __WITH_OFFLINE_STATE
        if (typeof apf.offline != "undefined" && apf.offline.state.enabled
          && apf.offline.state.realtime)
            apf.offline.state.set(this, "focus", amlNode.name || amlNode.$uniqueId);
        //#endif
    };

    this.$blur = function(amlNode){
        var aEl = this.document.activeElement;
        if (aEl != amlNode)
            return false;

        //#ifdef __DEBUG
        apf.console.info(aEl.localName + " ["
            + (aEl.name || "") + "] was blurred.");
        //#endif

        aEl.$focusParent.$lastFocussed = null;
        apf.activeElement = this.document.activeElement = null;

        apf.dispatchEvent("movefocus", {
            fromElement : amlNode
        });

        //#ifdef __WITH_XFORMS
        amlNode.dispatchEvent("DOMFocusOut");
        //#endif
    };
    
    var lastFocusParent;

    this.$focusDefault = function(amlNode, e){
        var fParent = findFocusParent(amlNode);
        this.$focusLast(fParent, e);
    };

    this.$focusRoot = function(e){
        var docEl = apf.document.documentElement;
        if (this.$focusLast(docEl, e) === false) {
            //docEl.$lastFocussed = null;
            //this.moveNext(null, apf.document.documentElement, true, e);
        }
    };

    this.$focusLast = function(amlNode, e, ignoreVisible){
        var lf = amlNode.$lastFocussed;

        if (lf && lf.parentNode && lf.$focussable === true
          && (ignoreVisible || lf.$ext.offsetHeight)) {
            this.$focus(lf, e, true);
        }
        else { //Let's find the object to focus first
            var next, node = amlNode, skip;
            while (node) {
                if (!skip && node.focussable !== false && node.$focussable === true && !node.$tabList
                  && (ignoreVisible || node.$ext && node.$ext.offsetHeight) && node.disabled < 1) {
                    this.$focus(node, e, true);
                    break;
                }
                
                //Walk sub tree
                if ((next = !skip && node.firstChild || !(skip = false) && node.nextSibling)) {
                    node = next;
                    if (node.$isWindowContainer > 0)
                        skip = true;
                }
                else if (node == amlNode) {
                    if (node.$isWindowContainer)
                        this.$focus(node, e, true);
                    return;
                }
                else {
                    do {
                        node = node.parentNode;
                    } while (node && !node.nextSibling && node != amlNode 
                      && !node.$isWindowContainer)
                    
                    if (node == amlNode) {
                        if (node.$isWindowContainer)
                            this.$focus(node, e, true);
                        return; //do nothing
                    }
                    
                    if (node) {
                        if (node.$isWindowContainer) {
                            this.$focus(node, e, true);
                            break;
                        }
                        
                        node = node.nextSibling;
                    }
                }
            }

            if (!node)
                this.$focus(apf.document.documentElement);//return false;//

            /*@todo get this back from SVN
            var node, list = amlNode.$tabList;
            for (var i = 0; i < list.length; i++) {
                node = list[i];
                if (node.focussable !== false && node.$focussable === true
                  && (ignoreVisible || node.$ext.offsetHeight)) {
                    this.$focus(node, e, true);
                    return;
                }
            }

            this.$focus(apf.document.documentElement);*/
        }
    };

    function trackChildFocus(e){
        if (e.name == "blur") {
            if (e.srcElement != this && this.$blur)
                this.$blur();
            return;
        }
        
        if (e.srcElement != this && this.$focus)
            this.$focus();
        
        if (e.srcElement == this || e.trackedChild) {
            e.trackedChild = true;
            return;
        }

        this.$lastFocussed = e.srcElement;

        if (this.localName && this.localName.indexOf("window") > -1)
            e.trackedChild = true;
    }

    function findFocusParent(amlNode){
        var node = amlNode;
        do {
            node = node.parentNode;
        } while(node && !node.$isWindowContainer);
        //(!node.$focussable || node.focussable === false)

        return node || apf.document.documentElement;
    }

    //Dom handler
    //@todo make this look at the dom tree insertion point to determine tabindex
    function moveFocus(e){
        if (e && e.currentTarget != this)
            return;
        
        if (this.$isWindowContainer)
            apf.window.$tabList.pushUnique(this);
        else
            apf.window.$addFocus(this, this.tabindex, true)
    }

    //Dom handler
    function removeFocus(e){
        if (e && (e.currentTarget != this || e.$doOnlyAdmin))
            return;

        //@todo apf3.0 this should be fixed by adding domremovenode events to all children
        var list  = this.$focusParent.$tabList;
        var nodes = this.childNodes;
        for (var i = 0, l = nodes.length; i < l; i++) {
            list.remove(nodes[i]); //@todo assuming no windows here
        }

        if (apf.document.activeElement == this)
            apf.window.moveNext();
        
        if (this.$isWindowContainer) {
            apf.window.$tabList.remove(this); //@todo this can't be right
            return;
        }

        if (!this.$focusParent)
            return;

        list.remove(this);
        //this.$focusParent = null; //@experimental to not execute this
    }

    /**** Focus API ****/

    /**
     * Determines whether a given aml element has the focus.
     * @param {AMLElement} the element to check
     * @returns {Boolean} whether the element has focus.
     */
    this.hasFocus = function(amlNode){
        return this.document.activeElement == amlNode;
    };

    /**
     * @private
     */
    this.moveNext = function(shiftKey, relObject, switchWindows, e){
        if (switchWindows && apf.document.activeElement) {
            var p = apf.document.activeElement.$focusParent;
            if (p.visible && p.modal)
                return false;
        }

        var dir, start, next,
            amlNode = relObject || apf.document.activeElement,
            fParent = amlNode
                ? (switchWindows && amlNode.$isWindowContainer 
                  && amlNode.$isWindowContainer != -1
                    ? apf.window
                    : e && e.innerList ? amlNode.$focusParent : amlNode.$focusParent2 || amlNode.$focusParent)
                : apf.document.documentElement,
            list    = fParent.$tabList;

        if (amlNode && (switchWindows || amlNode != apf.document.documentElement)) {
            start   = (list || []).indexOf(amlNode);
            if (start == -1) {
                //#ifdef __DEBUG
                apf.console.warn("Moving focus from element which isn't in the list\
                                  of it's parent. This should never happen.");
                //#endif

                return;
            }
        }
        else {
            start = -1;
        }

        if (this.document.activeElement && this.document.activeElement == amlNode
          && list.length == 1 || list.length == 0)
            return false;

        dir  = (shiftKey ? -1 : 1);
        next = start;
        if (start < 0)
            start = 0;
        do {
            next += dir;

            if (next >= list.length)
                next = 0;
            else if (next < 0)
                next = list.length - 1;

            if (start == next && amlNode) {
                if (list[0].$isWindowContainer)
                    this.$focus(list[0], e);
                
                return false; //No visible enabled element was found
            }

            amlNode = list[next];
        }
        while (!amlNode
            || amlNode.disabled > 0
            || amlNode == apf.document.activeElement
            || (switchWindows ? !amlNode.visible : amlNode.$ext && !amlNode.$ext.offsetHeight)
            || amlNode.focussable === false
            || switchWindows && !amlNode.$tabList.length);

        if (fParent == apf.window && amlNode.$isWindowContainer != -2) {
            this.$focusLast(amlNode, {mouse:true}, switchWindows);
        }
        else {
            (e || (e = {})).shiftKey = shiftKey;
            this.$focus(amlNode, e);
        }

        //#ifdef __WITH_XFORMS
        this.dispatchEvent("xforms-" + (shiftKey ? "previous" : "next"));
        //#endif
    };

    /**
     * @private
     */
    this.focusDefault = function(){
        //#ifdef __WITH_OFFLINE_STATE
        if (typeof apf.offline != "undefined" && apf.offline.state.enabled) {
            var node, id = apf.offline.state.get(this, "focus");

            if (id == -1)
                return this.$focusRoot();

            if (id)
                node = self[id] || apf.lookup(id);

            if (node) {
                if (!node.$focussable) {
                    //#ifdef __DEBUG
                    apf.console.warn("Invalid offline state detected. The "
                                   + "application was probably changed in "
                                   + "between sessions. Resetting offline state "
                                   + "and rebooting.");
                    //#endif

                    apf.offline.clear();
                    apf.offline.reboot();
                }
                else {
                    this.$focus(node);
                    return;
                }
            }
        }
        //#endif

        if (this.moveNext() === false)
            this.moveNext(null, apf.document.documentElement, true)
    };
