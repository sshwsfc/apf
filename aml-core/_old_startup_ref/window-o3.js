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

// #ifdef __WITH_O3WINDOW

/**
 * Object representing the window of the aml application. The semantic is
 * similar to that of a window in the browser, except that this window is not
 * the same as the javascript global object. It handles the focussing within
 * the document and several other events such as exit and the keyboard events.
 *
 * @event blur              Fires when the browser window looses focus.
 * @event focus             Fires when the browser window receives focus.
 *
 * @constructor
 * @inherits apf.Class
 * @default_private
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.8
 */
apf.window = function(){
    this.$uniqueId = apf.all.push(this);
    this.apf       = apf;

    /**
     * Returns a string representation of this object.
     */
    this.toString = function(){
        return "[APF Component : " + (this.name || "") + " (apf.window)]";
    };

    /**
     * Retrieves the primary {@link element.actiontracker action tracker} of the application.
     */
    this.getActionTracker = function(){
        return this.$at
    };

    /**
     * @private
     */
    this.loadCodeFile = function(url){
        //if(apf.isWebkit) return;
        if (self[url])
            apf.importClass(self[url], true, this.win);
        else
            apf.include(url);//, this.document);
    };

    /**** Set Window Events ****/

    /*apf.addListener(window, "beforeunload", function(){
        return apf.dispatchEvent("exit");
    });

    //@todo apf3.x why is this loaded twice
    apf.addListener(window, "unload", function(){
        if (!apf)
            return;
        
        apf.window.isExiting = true;
        apf.window.destroy();
    });*/
    


    /**
     * @private
     */
    this.destroy = function(){
        this.$at = null;

        apf.unload(this);

        apf           =
        this.win      =
        this.window   =
        this.document = null;
    };
};
apf.window.prototype = new apf.Class().$init();
apf.window = new apf.window();

// #endif
