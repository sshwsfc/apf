define([],function(){
apf.submit.action   =
apf.trigger.actions =
apf.reset.actions   =
apf.button.actions  = {
    // #ifdef __WITH_ACTIONTRACKER
    "undo" : function(action){
        var tracker;
        if (this.target && self[this.target]) {
            tracker = self[this.target].localName == "actiontracker"
                ? self[this.target]
                : self[this.target].getActionTracker();
        }
        else {
            var at, node = this;
            while(node.parentNode)
                at = (node = node.parentNode).$at;
        }

        (tracker || apf.window.$at)[action || "undo"]();
    },

    "redo" : function(){
        apf.button.actions.undo.call(this, "redo");
    },
    //#endif

    //#ifdef __WITH_MULTISELECT
    "remove" : function(){
        if (this.target && self[this.target])
            self[this.target].remove()
        //#ifdef __DEBUG
        else
            apf.console.warn("Target to remove wasn't found or specified:'"
                             + this.target + "'");
        //#endif
    },

    "add" : function(){
        if (this.target && self[this.target])
            self[this.target].add()
        //#ifdef __DEBUG
        else
            apf.console.warn("Target to add wasn't found or specified:'"
                             + this.target + "'");
        //#endif
    },

    "rename" : function(){
        if (this.target && self[this.target])
            self[this.target].startRename()
        //#ifdef __DEBUG
        else
            apf.console.warn("Target to rename wasn't found or specified:'"
                             + this.target + "'");
        //#endif
    },
    //#endif

    //#ifdef __WITH_AUTH
    "login" : function(){
        var parent = this.target && self[this.target]
            ? self[this.target]
            : this.parentNode;

        var vg = parent.$validgroup || new apf.ValidationGroup();
        if (!vg.childNodes.length)
            vg.childNodes = parent.childNodes.slice();

        var vars = {};
        function loopChildren(nodes){
            for (var node, i = 0, l = nodes.length; i < l; i++) {
                node = nodes[i];

                if (node.hasFeature(apf.__VALIDATION__)
                  && !node.$validgroup && !node.form) {
                    node.setProperty("validgroup", vg);
                }

                if (node.type)
                    vars[node.type] = node.getValue();

                if (vars.username && vars.password)
                    return;

                if (node.childNodes.length)
                    loopChildren(node.childNodes);
            }
        }
        loopChildren(parent.childNodes);

        if (!vg.isValid())
            return;

        if (!vars.username || !vars.password) {
            //#ifdef __DEBUG
            throw new Error(apf.formatErrorString(0, this,
                "Clicking the login button",
                "Could not find the username or password box"));
            //#endif

            return;
        }

        var auth = this.ownerDocument.getElementsByTagNameNS(apf.ns.apf,"auth")[0];
        if (!auth)
            return;
       
        auth.logIn(vars.username, vars.password);
        //apf.auth.login(vars.username, vars.password);
    },

    "logout" : function(){
        var auth = this.ownerDocument.getElementsByTagNameNS(apf.ns.apf, "auth")[0];
        if (!auth)
            return;

        auth.logOut();
    },
    //#endif

    //#ifdef __WITH_MODEL
    "submit" : function(doReset){
        var vg, model;

        var parent = this.target && self[this.target]
            ? self[this.target]
            : this.parentNode;

        if (parent.$isModel)
            model = parent;
        else {
            if (!parent.$validgroup) {
                parent.$validgroup = parent.validgroup
                    ? self[parent.validgroup]
                    : new apf.ValidationGroup();
            }

            vg = parent.$validgroup;
            if (!vg.childNodes.length)
                vg.childNodes = parent.childNodes.slice();

            function loopChildren(nodes){
                for (var node, i = 0, l = nodes.length; i < l; i++) {
                    node = nodes[i];

                    if (node.getModel) {
                        model = node.getModel();
                        if (model)
                            return false;
                    }

                    if (node.childNodes.length)
                        if (loopChildren(node.childNodes) === false)
                            return false;
                }
            }
            loopChildren(parent.childNodes);

            if (!model) {
                model = apf.globalModel;
                if (!model) {
                    //#ifdef __DEBUG
                    throw new Error(apf.formatErrorString(0, this,
                        "Finding a model to submit",
                        "Could not find a model to submit."));
                    //#endif
    
                    return;
                }
            }
        }

        if (doReset) {
            model.reset();
            return;
        }

        if (vg && !vg.isValid())
            return;

        model.submit();
    },

    "reset" : function(){
        apf.button.actions["submit"].call(this, true);
    },
    //#endif

    //#ifdef __WITH_TRANSACTION
    "ok" : function(){
        var node;

        if (this.target) {
            node = self[this.target];
        }
        else {
            var node = this.parentNode;
            while (node && !node.hasFeature(apf.__TRANSACTION__)) {
                node = node.parentNode;
            }

            if (node && !node.hasFeature(apf.__TRANSACTION__))
                return;
        }

        if (node.commit() && node.close) 
            node.close();
    },

    "cancel" : function(){
        var node;

        if (this.target) {
            node = self[this.target];
        }
        else {
            var node = this.parentNode;
            while (node && !node.hasFeature(apf.__TRANSACTION__)) {
                node = node.parentNode;
            }

            if (node && !node.hasFeature(apf.__TRANSACTION__))
                return;
        }

        node.rollback();
        if (node.close)
            node.close();
    },

    "apply" : function(){
        var node;

        if (this.target) {
            node = self[this.target];
        }
        else {
            var node = this.parentNode;
            while (node && !node.hasFeature(apf.__TRANSACTION__)) {
                node = node.parentNode;
            }

            if (node && !node.hasFeature(apf.__TRANSACTION__))
                return;
        }

        if (node.autoshow)
            node.autoshow = -1;
        if (node.commit(true))
            node.begin("update");
    },
    //#endif

    "close" : function(){
        var parent = this.target && self[this.target]
            ? self[this.target]
            : this.parentNode;

        while(parent && !parent.close)
            parent = parent.parentNode;

        if (parent && parent.close)
            parent.close();
        //#ifdef __DEBUG
        else
            apf.console.warn("Target to close wasn't found or specified:'"
                             + this.target + "'");
        //#endif
    }
};
});