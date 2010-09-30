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

//#ifndef __WITH_O3

/**
 * Ajax.org Platform
 *
 * @author    Ruben Daniels (ruben AT ajax DOT org)
 * @version   3.0
 * @url       http://www.ajax.org
 *
 * @event domready      Fires when the browsers' dom is ready to be manipulated.
 * @event movefocus         Fires when the focus moves from one element to another.
 *   object:
 *   {AMLElement} toElement the element that will receive the focus.
 * @event exit              Fires when the application wants to exit.
 *   cancelable:  Prevents the application from exiting. The returnValue of the
 *   event object is displayed in a popup which asks the user for permission.
 * @event keyup         Fires when the user stops pressing a key.
 *   cancelable: Prevents the behaviour.
 *   object:
 *   {Number}  keyCode   the char code of the pressed key.
 *   {Boolean} ctrlKey   whether the ctrl key was pressed.
 *   {Boolean} shiftKey  whether the shift key was pressed.
 *   {Boolean} altKey    whether the alt key was pressed.
 *   {Object}  htmlEvent the html event object.
 * @event mousescroll   Fires when the user scrolls the mouse
 *   cancelable: Prevents the container to scroll
 *   object:
 *   {Number} delta the scroll impulse.
 * @event hotkey        Fires when the user presses a hotkey
 *   bubbles: yes
 *   cancelable: Prevents the default hotkey behaviour.
 *   object:
 *   {Number}  keyCode   the char code of the pressed key.
 *   {Boolean} ctrlKey   whether the ctrl key was pressed.
 *   {Boolean} shiftKey  whether the shift key was pressed.
 *   {Boolean} altKey    whether the alt key was pressed.
 *   {Object}  htmlEvent the html event object.
 * @event keydown       Fires when the user presses a key
 *   bubbles: yes
 *   cancelable: Prevents the behaviour.
 *   object:
 *   {Number}  keyCode   the char code of the pressed key.
 *   {Boolean} ctrlKey   whether the ctrl key was pressed.
 *   {Boolean} shiftKey  whether the shift key was pressed.
 *   {Boolean} altKey    whether the alt key was pressed.
 *   {Object}  htmlEvent the html event object.
 * @event mousedown     Fires when the user presses a mouse button
 *   object:
 *   {Event}      htmlEvent the char code of the pressed key.
 *   {AMLElement} amlNode   the element on which is clicked.
 * @event onbeforeprint Fires before the application will print.
 * @event onafterprint  Fires after the application has printed.
 * @event load          Fires after the application is loaded.
 * @event error         Fires when a communication error has occured while making a request for this element.
 *   cancelable: Prevents the error from being thrown.
 *   bubbles:
 *   object:
 *   {Error}          error     the error object that is thrown when the event callback doesn't return false.
 *   {Number}         state     the state of the call
 *     Possible values:
 *     apf.SUCCESS  the request was successfull
 *     apf.TIMEOUT  the request has timed out.
 *     apf.ERROR    an error has occurred while making the request.
 *     apf.OFFLINE  the request was made while the application was offline.
 *   {mixed}          userdata  data that the caller wanted to be available in the callback of the http request.
 *   {XMLHttpRequest} http      the object that executed the actual http request.
 *   {String}         url       the url that was requested.
 *   {Http}           tpModule  the teleport module that is making the request.
 *   {Number}         id        the id of the request.
 *   {String}         message   the error message.
 * @default_private
 */
var apf = {
    // Content Distribution Network URL:
    // #ifndef __WITH_CDN
    /**
     * The url to the content delivery network.
     * @type {String}
     */
    CDN            : "",
    /* #else
    CDN            : "http://cdn.ajax.org/platform/",
    #endif */

    

    //#ifdef __DEBUG
    debug         : true,
    debugType     : "Memory",
    debugFilter   : "!teleport",
    /* #else
    debug         : false,
    #endif */

    includeStack  : [],
    initialized   : false,
    AppModules    : [],
    
    /**
     * Boolean specifying whether apf tries to load a skin from skins.xml when no skin element is specified.
     * @type {Boolean}
     */
    autoLoadSkin  : false,
    /**
     * Boolean specifying whether apf has started loading scripts and started the init process.
     * @type {Boolean}
     */
    started       : false,
    /**
     * Namespace for all crypto libraries included with Ajax.org Platform.
     */
    crypto        : {}, //namespace
    config        : {},
    _GET          : {},
    $asyncObjects : {"apf.oHttp" : 1, "apf.ajax": 1},
    
    /**
     * String specifying the basepath for loading apf from seperate files.
     * @type {String}
     */
    basePath      : "",

    //#ifdef __PARSER_AML
    /**
     * {Object} contains several known and often used namespace URI's.
     * @private
     */
    ns : {
        apf    : "http://ajax.org/2005/aml",
        aml    : "http://ajax.org/2005/aml",
        xsd    : "http://www.w3.org/2001/XMLSchema",
        xhtml  : "http://www.w3.org/1999/xhtml",
        xslt   : "http://www.w3.org/1999/XSL/Transform",
        xforms : "http://www.w3.org/2002/xforms",
        ev     : "http://www.w3.org/2001/xml-events"
    },
    //#endif
    
    xPathAxis  : {"self":1, "following-sibling":1, "ancestor":1}, //@todo finish list
    
    hasRequireJS : window.require && typeof require.def == "function",

    

    //#ifdef __DEBUG
    /**
     * Restarts the application.
     */
    reboot : function(){
        apf.console.info("Restarting application...");

        location.href = location.href;
    },
    //#endif



    nsqueue   : {},

   /**
    * This method implements all properties and methods to this object from another class
    * @param {Function}    classRef    Class reference
    * @private
    */
    implement : function(classRef) {
        // for speed, we check for the most common  case first
        if (arguments.length == 1) {
            //#ifdef __DEBUG
            if (!classRef) {
                throw new Error(apf.formatErrorString(0, this,
                    "Implementing class",
                    "Could not implement from '" + classRef[i] + "'", this));
            }
            //#endif
            classRef.call(this);//classRef
        }
        else {
            for (var a, i = 0, l = arguments.length; i < l; i++) {
                a = arguments[i];
                //#ifdef __DEBUG
                if (!a) {
                    throw new Error(apf.formatErrorString(0, this,
                        "Implementing class",
                        "Could not implement from '" + arguments[i] + "'", this));
                }
                //#endif
                arguments[i].call(this);//classRef
            }
        }

        return this;
    },



    /**
     * Sets a reference to an object by name in the global javascript space.
     * @param {String} name the name of the reference.
     * @param {mixed}  o    the reference to the object subject to the reference.
     */
    setReference : function(name, o){
        return self[name] && self[name].hasFeature
            ? 0
            : (self[name] = o);
    },

    /* Destroy */

};



var $setTimeout  = setTimeout;
var $setInterval = setInterval;

apf.setTimeout = function(f, t){
    apf.$eventDepth++;
    return $setTimeout(function(){
        f();
        
        if (--apf.$eventDepth == 0)
            apf.queue.empty();
    }, t);
}

/*$setTimeout = function(f, ms){
    setTimeout(function(){
        console.log(f.toString());
        if (typeof f == "string") eval(f)
        else f();
    }, ms);
}*/

document.documentElement.className += " has_apf";
document.documentElement.style.display = "none";

apf.browserDetect();
apf.Init.run("apf");


