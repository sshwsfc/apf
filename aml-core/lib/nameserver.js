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

define(["ecmaext"],
    function(ecma){

return {
    lookup : {},
    
    add : function(type, item){
        if (!this.lookup[type])
            this.lookup[type] = [];
        
        //#ifdef __DEBUG
        if(this.onchange)
            this.onchange(type, item);
        //#endif
        
        return this.lookup[type].push(item) - 1;
    },
    
    register : function(type, id, item){
        if (!this.lookup[type])
            this.lookup[type] = {};

        //#ifdef __DEBUG
        if (this.onchange)
            this.onchange(type, item, id);
        //#endif

        return (this.lookup[type][id] = item);
    },
    
    remove : function(type, item){
        var list = this.lookup[type];
        if (list) {
            for (var prop in list) {
                if (list[prop] == item) {
                    delete list[prop];
                }
            }
        }
    },
    
    get : function(type, id){
        return this.lookup[type] ? this.lookup[type][id] : null;
    },
    
    getAll : function(type){
        var name, arr = [], l = this.lookup[type];
        if (!l) return arr;
        
        if (l.dataType == ecma.ARRAY) {
            for (var i = 0; i < l.length; i++) {
                arr.push(l[i]);
            }
        }
        else {
            for (name in l) {
                
                //#ifdef __SUPPORT_SAFARI2
                if (apf.isSafariOld && (!l[name] || typeof l[name] != "object"))
                    continue;
                //#endif
                
                arr.push(l[name]);
            }
        }
        
        return arr;
    }, 
    
    getAllNames : function(type){
        var name, arr = [];
        for (name in this.lookup[type]){
            if (parseInt(name) == name) continue;
            arr.push(name);
        }
        return arr;
    }
};

});