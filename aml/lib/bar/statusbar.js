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

module.declare(function(require, exports, module){

/**
 * Element displaying a bar consisting of bars containing other text, icons
 * and more aml. This element is usually placed in the bottom of the screen to 
 * display context sensitive and other information about the state of the 
 * application.
 * Example:
 * <code>
 *  <a:statusbar>
 *      <a:section icon="application.png">Ajax.org</a:section>
 *      <a:section>Some status information</a:section>
 *      <a:section>
 *          <a:progressbar anchors="6 5 5 5" autostart="true" />
 *      </a:section>
 *  </a:statusbar>
 * </code>
 *
 * @constructor
 * @define statusbar
 * @allowchild bar
 * @allowchild progressbar
 * @addnode elements
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.9
 */
var Statusbar = function (struct, tagName){
    Presentation.call(this, struct, tagName || "statusbar");
};
Statusbar.prototype = Bar.prototype;
aml && aml.setElement("statusbar",  Statusbar);

module.exports = Statusbar;

    }
);