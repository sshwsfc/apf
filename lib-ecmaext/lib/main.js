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

define([], function(){

var ecma = {};

Array.prototype.dataType    = ecma.ARRAY    = 4;
Number.prototype.dataType   = ecma.NUMBER   = 1;
Date.prototype.dataType     = ecma.DATE     = 5;
Boolean.prototype.dataType  = ecma.BOOLEAN  = 2;
String.prototype.dataType   = ecma.STRING   = 3;
RegExp.prototype.dataType   = ecma.REGEXP   = 6;
Function.prototype.dataType = ecma.FUNCTION = 7;

return ecma;

});