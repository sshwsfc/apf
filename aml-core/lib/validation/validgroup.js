define(["lib-oop", "lib-oop/class", "aml-core/util/nameserver"], 
    function(oop, Class, nameserver){

/**
 * Object allowing for a set of AML elements to be validated, an element that 
 * is not valid shows the errorbox.
 * Example:
 * <code>
 *  <a:bar validgroup="vgForm">
 *      <a:label>Phone number</a:label>
 *      <a:textbox id="txtPhone"
 *        required   = "true"
 *        pattern    = "(\d{3}) \d{4} \d{4}"
 *        invalidmsg = "Incorrect phone number entered" />
 *
 *      <a:label>Password</a:label>
 *      <a:textbox
 *        required   = "true"
 *        mask       = "password"
 *        minlength  = "4"
 *        invalidmsg = "Please enter a password of at least four characters" />
 *  </a:bar>
 * </code>
 *
 * To check if the element has valid information entered, leaving the textbox
 * (focussing another element) will trigger a check. Programmatically a check
 * can be done using the following code:
 * <code>
 *  txtPhone.validate();
 *
 *  //Or use the html5 syntax
 *  txtPhone.checkValidity();
 * </code>
 *
 * To check for the entire group of elements use the validation group. For only
 * the first non-valid element the errorbox is shown. That element also receives
 * focus.
 * <code>
 *  vgForm.validate();
 * </code>
 *
 * @event validation Fires when the validation group isn't validated.
 *
 * @inherits apf.Class
 * @constructor
 * @default_private
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.9
 */
var ValidationGroup = function(name){
    this.$init();
    
    this.childNodes = [];
    
    if (name)
        apf.setReference(name, this);
    
    this.name = name || "validgroup" + this.$uniqueId;
    
    //#ifdef __WITH_NAMESERVER
    nameserver.register("validgroup", this.name, this);
    //#endif
};

oop.inherit(ValidationGroup, Class);

(function(){
    /**
     * When set to true, only visible elements are validated. Default is false.
     * @type Boolean
     */
    this.validateVisibleOnly = false;
    
    /**
     * When set to true, validation doesn't stop at the first invalid element. Default is false.
     * @type Boolean
     */
    this.allowMultipleErrors = false;

    /**
     * Adds a aml element to this validation group.
     */
    this.register   = function(o){ 
        if (o.hasFeature(apf.__VALIDATION__)) 
            this.childNodes.push(o);
    };
    
    /**
     * Removes a aml element from this validation group.
     */
    this.unregister = function(o){
        this.childNodes.remove(o); 
    };

    /**
     * Returns a string representation of this object.
     */
    this.toString = function(){
        return "[Validation Group]";
    };

    //Shared among all validationgroups
    var errbox;
    /**
     * Retrieves {@link element.errorbox} used for a specified element.
     *
     * @param  {DOMNode}  o  required  DOMNode specifying the element for which the Errorbox should be found. If none is found, an Errorbox is created. Use the {@link object.validationgroup.property.allowMultipleErrors} to influence when Errorboxes are created.
     * @param  {Boolean}  no_create    Boolean that specifies whether new Errorbox may be created when it doesn't exist already
     * @return  {Errorbox}  the found or created Errorbox;
     */
    this.getErrorBox = function(o, no_create){
        if (this.allowMultipleErrors || !errbox && !no_create) {
            errbox            = new apf.errorbox();
            errbox.$pHtmlNode = o.$ext.parentNode;
            errbox.skinset    = apf.getInheritedAttribute(o.parentNode, "skinset"); //@todo use skinset here. Has to be set in presentation
            errbox.dispatchEvent("DOMNodeInsertedIntoDocument");
        }
        return errbox;
    };

    /**
     * Hide all Errorboxes for the elements using this element as their validation group.
     *
     */
    this.hideAllErrors = function(){
        if (errbox && errbox.host)
            errbox.host.clearError();
    };

    function checkValidChildren(oParent, ignoreReq, nosetError){
        var found;
        //Per Element
        for (var v, i = 0; i < oParent.childNodes.length; i++) {
            var oEl = oParent.childNodes[i];

            if (!oEl)
                continue;
            if (!oEl.disabled
              && (!this.validateVisibleOnly && oEl.visible || !oEl.$ext || oEl.$ext.offsetHeight)
              && (oEl.hasFeature(apf.__VALIDATION__) && oEl.isValid && !oEl.isValid(!ignoreReq))) {
                //|| !ignoreReq && oEl.required && (!(v = oEl.getValue()) || new String(v).trim().length == 0)
                
                if (!nosetError) {
                    if (!found) {
                        oEl.validate(true, null, true);
                        found = true;
                        if (!this.allowMultipleErrors)
                            return true; //Added (again)
                    }
                    else if (oEl.errBox && oEl.errBox.host == oEl)
                        oEl.errBox.hide();
                }
                else if (!this.allowMultipleErrors)
                    return true;
            }
            if (oEl.canHaveChildren && oEl.childNodes.length) {
                found = checkValidChildren.call(this, oEl, ignoreReq, nosetError) || found;
                if (found && !this.allowMultipleErrors)
                    return true; //Added (again)
            }
        }
        return found;
    }

    /**
     * Checks if (part of) the set of element's registered to this element are
     * valid. When an element is found with an invalid value the error state can
     * be set for that element.
     *
     * @param  {Boolean}    [ignoreReq]  whether to adhere to the 'required' check.
     * @param  {Boolean}    [nosetError  whether to not set the error state of the element with an invalid value
     * @param  {AMLElement} [page]           the page for which the children will be checked. When not specified all elements of this validation group will be checked.
     * @return  {Boolean}  specifying whether the checked elements are valid.
     * @method isValid, validate, checkValidity
     */
    // #ifdef __WITH_HTML5
    this.checkValidity =
    //#endif
    
    /**
     * Checks if (part of) the set of element's registered to this element are
     * valid. When an element is found with an invalid value the error state can
     * be set for that element.
     *
     * @param  {Boolean}    [ignoreReq]  whether to adhere to the 'required' check.
     * @param  {Boolean}    [nosetError  whether to not set the error state of the element with an invalid value
     * @param  {AMLElement} [page]           the page for which the children will be checked. When not specified all elements of this validation group will be checked.
     * @return  {Boolean}  specifying whether the checked elements are valid.
     * @method isValid, validate, checkValidity
     */
    this.validate =
    
    /**
     * Checks if (part of) the set of element's registered to this element are
     * valid. When an element is found with an invalid value the error state can
     * be set for that element.
     *
     * @param  {Boolean}    [ignoreReq]  whether to adhere to the 'required' check.
     * @param  {Boolean}    [nosetError  whether to not set the error state of the element with an invalid value
     * @param  {AMLElement} [page]           the page for which the children will be checked. When not specified all elements of this validation group will be checked.
     * @return  {Boolean}  specifying whether the checked elements are valid.
     * @method isValid, validate, checkValidity
     */
    this.isValid = function(ignoreReq, nosetError, page){
        var found = checkValidChildren.call(this, page || this, ignoreReq,
            nosetError);

        if (page) {
            //#ifdef __DEBUG
            try {
            //#endif
                if (page.validation && !eval(page.validation)) {
                    alert(page.invalidmsg);
                    found = true;
                }
            //#ifdef __DEBUG
            }
            catch(e) {
                throw new Error(apf.formatErrorString(0, this,
                    "Validating Page",
                    "Error in javascript validation string of page: '"
                    + page.validation + "'", page.$aml));
            }
            //#endif
        }

        //Global Rules
        //
        //if (!found)
            //found = this.dispatchEvent("validation");

        return !found;
    };
}).call(ValidationGroup.prototype);

apf.config.$inheritProperties["validgroup"] = 1;

return ValidationGroup;

});