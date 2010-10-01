/**
 * @term propertybinding With property binding you can define the way a 
 * property is calculated. <img src="http://www.rubendaniels.com/images/propbind.gif" align="right" />
 * This statement is usually based on a javascript 
 * expression including one or more properties on other objects. The value of 
 * the property will always be kept up to date. This means that when one of the 
 * dependent properties changes, the property is recalculated. See the picture 
 * for a graphical explanation. 
 * Example:
 * Let me give you an example to make it a bit straightforward. This example 
 * sets the visibility of the slider based on the state of the checkbox.
 * <code>
 *  <a:slider visible="{myCheckbox.value}" />
 *  <a:checkbox id="myCheckbox">Toggle this</a:checkbox>
 * </code>
 *
 * Expressions:
 * The use of { and } tell Ajax.org Platform(APF) that the visible property will 
 * be bound. By specifying myCheckbox.value APF knows that the value of 
 * myCheckbox should be retrieved for this property. Whenever the checkbox 
 * changes, the slider will show or hide.
 *
 * Bidirectional:
 * Sometimes it's necessary to make a binding from one property to another one, 
 * and vice versa. Think of a slider that is connected to the position property
 * of a video element. When the video plays, the value of the slider should be 
 * updated. When the slider is dragged the video should be updated. This works 
 * in the same way as above, but instead of using curly braces 
 * you use brackets: [ and ]. The next example keeps the state of a dropdown in 
 * sync with the state of the tab page.
 * <code>
 *  <a:tab activepage="[myDropdown.value]">
 *     <a:page caption="Page 1" />
 *     <!-- etc -->
 *  </a:tab>
 *  <a:dropdown id="myDropdown">
 *     <a:item value="0">Page 1</a:item>
 *     <!-- etc -->
 *  </a:dropdown>
 * </code>
 *
 * For more information visit {@link http://www.rubendaniels.com/2008/07/04/property-binding/ this blog article}.</a>
 *
 * Internals:
 * Property binding in apf is a flavor of a {@link http://en.wikipedia.org/wiki/Publish/subscribe publish/subscribe}
 * system. When a binding is established the element that receives the value sets
 * a listener on the property of another element. There can be any number of 
 * elements referenced in a single expression. When any of the properties that 
 * are listened to change, the subscriber gets notified to update the value
 * of it's property.
 */

require.modify(
    "lib-oop/class",
    "lib-oop/propbinds",
    [
        "lib-oop/class", 
        "livemarkup", 
        "optional!livemarkup/language",
        "optional!debug/console",
        "optional!lib-oop/queue"
    ],
    function(Class, livemarkup, language, console, queue){

(function(){
    this.$attrExcludePropBind = false;
    
    /**
     * Bind a property of another compontent to a property of this element.
     *
     * @param  {String} myProp           the name of the property of this element
     *                                   of which the value is communicated to
     *                                   <code>bObject</code>.
     * @param  {Class}  bObject          the object which will receive the property
     *                                   change message.
     * @param  {String} bProp            the property of <code>bObject</code> which
     *                                   will be set using the value of
     *                                   <code>myProp</code> optionally
     *                                   processed using <code>strDynamicProp</code>.
     * @param  {String} [strDynamicProp] a javascript statement which contains the
     *                                   value of <code>myProp</code>. The string
     *                                   is used to calculate a new value.
     * @private
     */
    this.$bindProperty = function(myProp, bObject, bProp, fParsed, bRecip){
        if (!fParsed)
            return bObject.$propertyHandler(bProp, this[myProp]);

        var eventName = "prop." + myProp, eFunc, isBeingCalled, isLang;
        (this.$eventsStack[eventName] || (this.$eventsStack[eventName] = [])).push(eFunc = function(e){
            if (isBeingCalled) //Prevent circular refs
                return;
            
            //#ifdef __WITH_LANG_SUPPORT
            language.$lm_has_lang = false;
            //#endif
            isBeingCalled = true;
            
            try {
                if (fParsed.asyncs) { //if async
                    return fParsed.call(bObject, bObject.xmlRoot, function(value){
                        bObject.setProperty(bProp, value, true, false, 10);
                        
                        //#ifdef __WITH_LANG_SUPPORT
                        //@todo apf3.0
                        if (language.$lm_has_lang && !isLang) {
                            isLang = true;
                            //@todo should auto remove
                            language.addProperty(bObject, bProp, fParsed);
                        }
                        //#endif
                        
                        isBeingCalled = false;
                    }); 
                }
                else {
                    var value = fParsed.call(bObject, bObject.xmlRoot);
                }
            }
            catch(e) {
                console.warn("[331] Could not execute binding for property "
                    + bProp + "\n\n" + e.message);
                
                isBeingCalled = false;
                
                return;
            }

            //Can't do this when using xml nodes, doesnt seem needed anyway
            //if (bObject[bProp] != value)
                bObject.setProperty(bProp, value, true, false, 10);//e.initial ? 0 : 
            
            //#ifdef __WITH_LANG_SUPPORT
            //@todo apf3.0
            if (language.$lm_has_lang && !isLang) {
                isLang = true;
                //@todo should auto remove
                language.addProperty(bObject, bProp, fParsed);
            }
            //#endif
            
            isBeingCalled = false;
        });

        //Bi-directional property binding
        if (bRecip) {
            eventName = "prop." + bProp;
            var _self = this;
            // add bidirectional binding to funcHandlers for visualconnect
            //#ifdef __WITH_CONTENTEDITABLE
            if (!this.$funcHandlers[bProp])
                this.$funcHandlers[bProp] = [];
                
            this.$funcHandlers[bProp].push({
                amlNode : bObject, 
                prop    : bProp
            });
            //#endif

            (bObject.$eventsStack[eventName] || (bObject.$eventsStack[eventName] = [])).push(
                eFunc.recip = function(){
                    if (isBeingCalled) //Prevent circular refs
                        return;
                    
                    isBeingCalled = true;
                    _self.setProperty(myProp, bObject[bProp], true, false, 10);//e.initial ? 0 :  
                    isBeingCalled = false;
                });
        };
        
        //eFunc({initial: true});
        
        return eFunc;
    };
    
    /**
     * Sets a dynamic property from a string.
     * The string used for this function is the same as used in AML to set a
     * dynamic property:
     * <code>
     *  <a:button visible="{rbTest.value == 'up'}" />
     *  <a:textbox id="rbTest" value="" />
     * </code>
     *
     * @param  {String}  prop   the name of the property of this element to set
     *                          using a dynamic rule.
     * @param  {String}  pValue the dynamic property binding rule.
     */
    this.$setDynamicProperty = function(prop, pValue){
        var exclNr = this.$attrExcludePropBind[prop],
            options;

        //@todo apf3.0, please generalize this - cache objects, seems slow
        if (prop == "model" || exclNr == 3) {
            options = {
                xpathmode : 2
                //parsecode : true //@todo is this also good for exclNr 3 ?
            }
        }
        else if (exclNr == 2) {
            options = {nostring : true};
        }
        else if (exclNr === 0) {
            options = {
                parsecode : true
                /*#ifdef __DEBUG */, nothrow : this.target.match(/-debug$/) ? true : false /* #endif */
            };
        }
        
        if (this.liveedit)
            (options || (options = {})).liveedit = true;
        
        //#ifdef __DEBUG
        if (apf.config.debugLm)
            (options || (options = {})).nothrow = true;
        //#endif

        //Compile pValue through JSLT parser
        //#ifdef __WITH_AML_BINDINGS
        if (pValue && pValue.dataType == apf.FUNCTION) {
             var fParsed = pValue;
             pValue = "";
        }
        else
        //#endif
        {
            var fParsed = livemarkup.compile(pValue, options);
        }

        //Special case for model due to needed extra signalling
        if (prop == "model")
            (this.$modelParsed = fParsed).instruction = pValue
        // #ifdef __DEBUG 
        else if (exclNr === 0)
            this.$lastFParsed = fParsed;
        // #endif

        //if it's only text return setProperty()
        if (fParsed.type == 2) {
            this[prop] = !pValue; //@todo apf3.0 is this needed?
            return this.setProperty(prop, fParsed.str, null, null, 10); //@todo is 10 here right?
        }

        if (this.$_setDynamicProperty)
            this.$_setDynamicProperty(prop, pValue, fParsed, exclNr);

        //if there's prop binding: Add generated function to each obj/prop in the list
        var matches = exclNr && exclNr != 3 && prop != "model" ? {} : fParsed.props, //@todo apf3.0 sign of broken abstraction, please fix this with a bit mask
            found   = false,
            _self   = this,
            o, node, bProp, p;

        for (p in matches) {
            //#ifdef __SUPPORT_SAFARI2
            if (typeof matches[p] == "function")
                continue;
            //#endif

            o = p.split(".");
            if (o.length > 2) {
                bProp = o.pop();
                try{
                    node  = eval(o.join("."));
                }
                catch(e){
                    if (!queue || arguments[2]) {
                        console.warn("[287] Could not execute binding test : "
                            + pValue.replace(/</g, "&lt;") + "\n\n" + e.message);
                    }
                    else {
                        queue.add(prop + ":" + this.$uniqueId, function(){
                            _self.$clearDynamicProperty(prop);
                            _self.$setDynamicProperty(prop, pValue, true);
                        });
                    }
                    continue;
                }

                if (!node || typeof node != "object" || (!node.$regbase && node.$regbase !== 0)) {
                    bProp = o[1];
                    node  = self[o[0]];
                }
                else {
                    o.push(bProp);
                }
            }
            else {
                bProp = o[1];
                node  = self[o[0]] || o[0] == "this" && this;
            }

            if (!node) {
                if (!queue || arguments[2]) {
                    console.warn("[287] Could not create property binding with object."
                        + ". Element '"  + o[0] + "' does not exist.\n"
                        + pValue.replace(/</g, "&lt;").substr(0, 400));
                }
                else {
                    //@todo this is sloppy and not efficient - shouldn't clear 
                    //and reset and should check if was changed or removed when
                    //it's set
                    queue.add(prop + ":" + this.$uniqueId, function(){
                        _self.$clearDynamicProperty(prop);
                        _self.$setDynamicProperty(prop, pValue, true);
                    });
                    return;
                }
            }

            if (!node.$bindProperty)
                continue;  //return

            if (!this.$funcHandlers[prop])
                this.$funcHandlers[prop] = [];

            var last;
            this.$funcHandlers[prop].push(last = {
                amlNode : node, 
                prop    : bProp, 
                handler : node.$bindProperty(bProp, this, prop, fParsed, 
                    //@todo check if it breaks something. I removed
                    // "&& exclNr != 3" from the expression to enable two way
                    // binding of selections
                    fParsed.type == 4 && "model".indexOf(prop) == -1) /*,
                bidir   : 
                  && this.$bindProperty(prop, node, bProp, function(){
                    return _self[prop];
                  })*/
            });
            
            found = true;
        }

        if (found) {
            last.handler({initial: true});
        }
        else {
            //@todo optimize this
            if (exclNr)
                return this.setProperty(prop, pValue, null, null, 10); //@todo is 10 here right?
            
            //#ifdef __WITH_LANG_SUPPORT
            language.$lm_has_lang = false;
            //#endif
            
            try {
                if (fParsed.asyncs) { //if async
                    return fParsed.call(this, this.xmlRoot, function(value){
                        _self.setProperty(prop, value, true, null, 10); //@todo is 10 here right?
    
                        //#ifdef __WITH_LANG_SUPPORT
                        //@todo apf3.0
                        if (language.$lm_has_lang)
                            language.addProperty(_self, prop, fParsed); //@todo should auto remove
                        //#endif
                    }); 
                }
                else {
                    var value = fParsed.call(this, this.xmlRoot);
                }
            }
            catch(e){
                console.warn("[331] Could not execute binding test or: "
                    + pValue.replace(/</g, "&lt;") + "\n\n" + e.message);
                return;
            }
            
            this[prop] = !value; //@todo isnt this slow and unneccesary?
            this.setProperty(prop, value, true, null, 10); //@todo is 10 here right?

            //#ifdef __WITH_LANG_SUPPORT
            //@todo apf3.0
            if (language.$lm_has_lang)
                language.addProperty(this, prop, fParsed); //@todo should auto remove
            //#endif
        }
    };
    
    //@todo setAttribute should delete this from language when not doing
    //$setDynamicProperty
    this.$clearDynamicProperty = function(prop){
        if (this.$removeAttrBind)
            this.$removeAttrBind(prop);

        //#ifdef __WITH_LANG_SUPPORT
        //@todo apf3.0
        language.removeProperty(this, prop);
        //#endif
        
        if (this.$inheritProperties)
            delete this.$inheritProperties[prop];
        
        if (prop == "model")
            this.$modelParsed = null;
        
        //Remove any bounds if relevant
        var f, i, l, h = this.$funcHandlers[prop];
        if (h && typeof h != "function") {
            for (i = 0, l = h.length; i < l; i++) {
                (f = h[i]).amlNode.removeEventListener("prop." + f.prop, f.handler);
                if (f.handler && f.handler.recip) //@todo handler shouldn't be unset - how does this happen?
                    this.removeEventListener("prop." + prop, f.handler.recip);
            }
            delete this.$funcHandlers[prop];
        }
    };
    
    /**
     * Gets an array of properties for this element which can be bound.
     */
    this.getAvailableProperties = function(){
        return this.$supportedProperties.slice();
    };

    /**
     * Sets the value of a property of this element.
     * Note: Only the value is set, dynamic properties will remain bound and the
     * value will be overridden.
     *
     * @param  {String}  prop        the name of the property of this element to
     *                               set using a dynamic rule.
     * @param  {String}  value       the value of the property to set.
     * @param  {Boolean} [forceOnMe] whether the property should be set even when
     *                               its the same value.
     */
    this.setProperty = function(prop, value, forceOnMe, setAttr, inherited){
        var isChanged, 
            oldvalue  = this[prop],
            eventName = "prop." + prop;

        //Try catch here, because comparison of a string with xmlnode gives and error in IE
        try{
            isChanged = (typeof value == "object")
                ? value != (typeof oldvalue == "object" ? oldvalue : null)
                : String(oldvalue) !== String(value);
        } catch(e){
            isChanged = true;
        }
        
        this.$_setProperty(prop, value, forceOnMe, setAttr, inherited, isChanged);
        
        if (this.$eventsStack[eventName]) {
            this.dispatchEvent(eventName, {
                prop     : prop, 
                value    : value, 
                oldvalue : oldvalue,
                changed  : isChanged
            });
        }
        
        return value;
    };
    
    this.$_setProperty = function(){
        //Check if property has changed
        if (isChanged) {
            if (this.$propertyHandler(prop, value, forceOnMe) === false)
                return;
            
            value = this[prop];
        }
    }

    /**
     * Gets the value of a property of this element.
     *
     * @param  {String}  prop   the name of the property of this element for which to get the value.
     */
    this.getProperty = function(prop){
        return this[prop];
    };
}).call(Class);

    }
);