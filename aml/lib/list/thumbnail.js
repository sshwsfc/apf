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

define(["optional!aml", "aml/list/list"], 
    function(aml, List){

/**
 * Example:
 * A small product search application using a list to display results.
 * <code>
 *  <a:bar>
 *      <h1>Search for a product</h1>
 *      <a:textbox id="txtSearch" selectfocus="true" />
 *      <a:button onclick="search()" default="true">Search</a:button>
 *  </a:bar>
 * 
 *  <a:model id="mdlSearch">
 *      <data>
 *          <item title="Title 1" src="siteimg/slideshow_img/img1_small.jpg" descr="Descr 1"></item>
 *          <item title="Title 2" src="siteimg/slideshow_img/img2_small.jpg" descr="Descr 2"></item>
 *      </data>
 *  </a:model>
 * 
 *  <a:thumbnail 
 *    model         = "mdlSearch"
 *    autoselect    = "false" 
 *    width         = "400"
 *    height        = "400"
 *    caching       = "false" 
 *    empty-message = "No products found">
 *      <a:bindings>
 *          <a:caption match="[@title]" />
 *          <a:image match="[@src]" />
 *          <a:each match="[item]" />
 *      </a:bindings>
 *  </a:thumbnail>
 * 
 *  <a:script>
 *      function search(){
 *          mdlSearch.$loadFrom("http://localhost/search.php?keyword=" + txtSearch.getValue());
 *      }
 *  </a:script>
 * </code>
 */
var Thumbnail = function(struct, tagName){
    List.call(this, tagName || "thumbnail", this.NODE_VISIBLE, struct);
};
Thumbnail.prototype = List.prototype;
aml && aml.setElement("thumbnail",  Thumbnail);

return Thumbnail;

    }
);