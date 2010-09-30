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

// #ifdef __WITH_WINDOW

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
     * Focus the browser window.
     */
    this.focus = function(){
        if (apf.isDeskrun)
            jdwin.SetFocus();
        else
            window.focus();
    };

    /**** Focus Internals ****/

    //#ifdef __WITH_VISIBILITYMANAGER
    this.vManager = new apf.visibilitymanager();
    //#endif

    //#ifdef __WITH_ZMANAGER
    this.zManager = new apf.zmanager();
    //#endif

    //#ifdef __WITH_FOCUS
    this.fManager = new apf.focusmanager();
    //#endif

    /**** Set Window Events ****/



};
apf.window.prototype = new apf.Class().$init();
apf.window = new apf.window();


// #endif
