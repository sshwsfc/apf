module.declare = function(factory) { factory(require, module, exports); }

module.declare(function(require, module, exports){


//#ifdef __WITH_ALIAS
GuiElement.propHandlers = {
    /**
     * @attribute {String} alias the alternative name for this element. The 
     * alias attribute can be set on another element. Only one element can have
     * the alias at one time. This way it's easy to use different elements in
     * the same function (for instance a thumbail and a datagrid) while keeping
     * all the binding rules and events on the active element.
     * @experimental
     */
    //@todo rewrite this completely...
    "alias" : function(value){
        if (!value) //@todo think about whether this has more meaning
            return;
        //#ifdef __WITH_NAMESERVER
        var cg = nameserver.get("alias", value);
        if (!cg) {
            cg = nameserver.register("alias", value, {
                name  : value,
                props : {},
                $propertyHandler : function(prop, value, forceOnMe){
                    if (prop == "alias") return;
                    
                    this.props[prop] = value;
                    this[prop] = value;
                    
                    if (!forceOnMe)
                        this.active.setProperty(prop, value);
                },
                
                $propchange : function(e){
                    cg.setProperty(e.name, e.value, null, true);
                },
                
                /* should go via property binding 
                data : [],
                connect : function(o, dataOnly, xpath, type, noselect){
                    this.data.push([o, dataOnly, xpath, type, noselect]);
                    
                    if (this.active)
                        this.active.connect(o, dataOnly, xpath, type, noselect);
                },
                
                disconnect : function(o, type){
                    for (var data, i = 0, l = this.data.length; i < l; i++) {
                        if (this.data[i][0] == o && this.data[i][3] == type)
                            this.data.removeIndex(i);
                    }
                    
                    if (this.active)
                        this.active.disconnect(o, type);
                },*/
                
                set : function(amlNode){
                    if (this.active == amlNode)
                        return;
                    
                    //Unset active one
                    if (this.active) {
                        //Unset event listeners
                        for (var name in events) {
                            var ev = events[name];
                            for (var i = 0; i < ev.length; i++) {
                                this.active.removeEventListener(name, ev[i]);
                            }
                        }
                        for (var name in events_capture) {
                            var ev = events_capture[name];
                            for (var i = 0; i < ev.length; i++) {
                                this.active.removeEventListener(name, ev[i], true);
                            }
                        }

                        //Unset property listener
                        this.active.removeEventListener("propertychange", this.$propchange);

                        //Unset data connections
                        for (var i = 0, l = this.data.length; i < l; i++)
                            this.active.disconnect(this.data[i][0], this.data[i][3]);

                        this.active.setProperty("alias", false);
                    }
                    
                    this.active = amlNode;
                    //Set event listeners
                    for (var name in events) {
                        var ev = events[name];
                        for (var i = 0; i < ev.length; i++) {
                            this.active.addEventListener(name, ev[i]);
                        }
                    }
                    for (var name in events_capture) {
                        var ev = events_capture[name];
                        for (var i = 0; i < ev.length; i++) {
                            this.active.addEventListener(name, ev[i], true);
                        }
                    }

                    //Set properties
                    for (var prop in this.props)
                        this.setProperty(prop, this.active[prop]);
                    
                    //Set property listener
                    this.active.addEventListener("propertychange", this.$propchange);
                    
                    //Set data connections
                    for (var i = 0, l = this.data.length; i < l; i++)
                        this.active.connect.apply(this.active, this.data[i]);
                    
                    amlNode.$alias = this;
                }
            });
            //apf.makeClass(cg);
            apf.setReference(value, cg);

            var events = {}, events_capture = {};
            cg.addEventListener = function(eventName, callback, useCapture){
                var ev = useCapture ? events_capture : events;
                (ev[eventName] || (ev[eventName] = [])).pushUnique(callback);
                this.active.addEventListener(eventName, callback, useCapture);
            };

            cg.removeEventListener = function(eventName, callback, useCapture){
                var ev = useCapture ? events_capture : events;
                (ev[eventName] || (ev[eventName] = [])).remove(callback);
                this.active.addEventListener(eventName, callback, useCapture);
            };

            cg.dispatchEvent = function(eventName, options){
                this.active.dispatchEvent(eventName, options);
            };
        }
        
        cg.set(this);
        //#endif
    }
    //#endif
    
});