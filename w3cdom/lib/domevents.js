require.modify(
    "w3cdom/node",
    "w3cdom/domevents",
    ["w3cdom/node"], 
    function(DOMNode){

//@todo implement spec correctly, refactor elements to not abuse capturing phase
(function(){
    apf.$eventDepth = 0;
    this.$eventDepth = 0;

    /**
     * Calls all functions that are registered as listeners for an event.
     *
     * @param  {String}  eventName  the name of the event to dispatch.
     * @param  {Object}  [options]  the properties of the event object that will be created and passed through.
     *   Properties:
     *   {Boolean} bubbles  whether the event should bubble up to it's parent
     *   {Boolean} captureOnly whether only the captured event handlers should be executed
     * @return {mixed} return value of the event
     */
    //var allowEvents = {"DOMNodeInsertedIntoDocument":1,"DOMNodeRemovedFromDocument":1};
    this.dispatchEvent = function(eventName, options, e){
        var arr, result, rValue, i, l;

        apf.$eventDepth++;
        this.$eventDepth++;

        e = options && options.name ? options : e;

        /*if (this.disabled && !allowEvents[eventName]) {
            result = false;
        }
        else {*/
            //#ifdef __DEBUG
            if (options && !options.bubbles && options.currentTarget && options.currentTarget != this)
                throw new Error("Invalid use of options detected in dispatch Event");
            //#endif
        
            //@todo rewrite this and all dependencies to match w3c
            if ((!e || !e.currentTarget) && (!options || !options.currentTarget)) {
                if (!(options || (options = {})).currentTarget)
                    options.currentTarget = this;

                //Capture support
                if (arr = this.$captureStack[eventName]) {
                    for (i = 0, l = arr.length; i < l; i++) {
                        rValue = arr[i].call(this, e || (e = new apf.AmlEvent(eventName, options)));
                        if (typeof rValue != "undefined")
                            result = rValue;
                    }
                }
            }
            
            //@todo this should be the bubble point
            
            if (options && options.captureOnly) {
                return e && typeof e.returnValue != "undefined" ? e.returnValue : result;
            }
            else {
                if (this["on" + eventName]) {
                    result = this["on" + eventName].call(this, e 
                        || (e = new apf.AmlEvent(eventName, options))); //Backwards compatibility
                }
    
                if (arr = this.$eventsStack[eventName]) {
                    for (i = 0, l = arr.length; i < l; i++) {
                        if (!arr[i]) continue;
                        rValue = arr[i].call(this, e 
                            || (e = new apf.AmlEvent(eventName, options)));
                        if (typeof rValue != "undefined")
                            result = rValue;
                    }
                }
            }
        //}

        /*var p;
        while (this.$removalQueue.length) {
            p = this.$removalQueue.shift();
            p[0].remove(p[1]); 
        }*/
        
        //#ifdef __WITH_EVENT_BUBBLING
        if ((e && e.bubbles && !e.cancelBubble || !e && options && options.bubbles) && this != apf) {
            rValue = (this.parentNode || this.ownerElement || apf).dispatchEvent(eventName, options, e);
            // || (e = new apf.AmlEvent(eventName, options))

            if (typeof rValue != "undefined")
                result = rValue;
        }
        //#endif
        
        if (--apf.$eventDepth == 0 && this.ownerDocument 
          && !this.ownerDocument.$domParser.$parseContext
          && !apf.isDestroying && apf.loaded
          //#ifdef __DEBUG
          && eventName != "debug"
          //#endif
          && apf.queue
        ) {
            apf.queue.empty();
        }
        
        this.$eventDepth--;

        //#ifdef __WITH_UIRECORDER
        if (apf.uirecorder && apf.uirecorder.captureDetails) {
            if (["debug"].indexOf(eventName) == -1) { // ,"DOMNodeRemoved","DOMNodeRemovedFromDocument","DOMNodeInsertedIntoDocument"
                //if (apf.uirecorder.isLoaded) { // skip init loading and drawing of elements
                    if (apf.uirecorder.isRecording || apf.uirecorder.isTesting) { // only capture events when recording
                        apf.uirecorder.capture.captureEvent(eventName, e || (e = new apf.AmlEvent(eventName, options)));
                    } 
                //}
                // when eventName == "load" all elements are loaded and drawn
                /*
                if (eventName == "load" && this.isIE != undefined)
                    apf.uirecorder.isLoaded = true;
                */
            }
        }
        //#endif
        
        if (options) {
            try {
                delete options.currentTarget;
            }
            catch(ex) {
                options.currentTarget = null;
            }
        }
        
        return e && typeof e.returnValue != "undefined" ? e.returnValue : result;
    };

    /**
     * Add a function to be called when a event is called.
     *
     * @param  {String}   eventName the name of the event for which to register
     *                              a function.
     * @param  {function} callback  the code to be called when event is dispatched.
     */
    this.addEventListener = function(a, b, c){
        this.$bufferEvents.push([a,b,c]);
    };
    
    var realAddEventListener = function(eventName, callback, useCapture){
        //#ifdef __PROFILER
        if (apf.profiler)
            apf.profiler.wrapFunction(Profiler_functionTemplate());
        //#endif

        if (eventName.substr(0, 2) == "on")
            eventName = eventName.substr(2);

        var s, stack = useCapture ? this.$captureStack : this.$eventsStack;
        if (!(s = stack[eventName]))
            s = stack[eventName] = [];
        
        if (s.indexOf(callback) > -1)
            return;
        
        s.unshift(callback);
        
        var f;
        if (f = this.$eventsStack["$event." + eventName])
            f[0].call(this, callback);
    };

    /**
     * Remove a function registered for an event.
     *
     * @param  {String}   eventName the name of the event for which to unregister
     *                              a function.
     * @param  {function} callback  the function to be removed from the event stack.
     */
    this.removeEventListener = function(eventName, callback, useCapture){
        var stack = (useCapture ? this.$captureStack : this.$eventsStack)[eventName];

        //@todo is this the best way?
        if (stack) {
            if (this.$eventDepth)
                stack = (useCapture ? this.$captureStack : this.$eventsStack)[eventName] = stack.slice()

            stack.remove(callback);
            if (!stack.length)
                delete (useCapture ? this.$captureStack : this.$eventsStack)[eventName];
        }
    };

    /**
     * Checks if there is an event listener specified for the event.
     *
     * @param  {String}  eventName  the name of the event to check.
     * @return {Boolean} whether the event has listeners
     */
    this.hasEventListener = function(eventName){
        return (this.$eventsStack[eventName] && this.$eventsStack[eventName].length > 0);
    };
}).call(DOMNode);

    }
);