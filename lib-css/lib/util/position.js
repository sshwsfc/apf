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

require.def([
    "lib-css",
    "envdetect",
    "envdetect/features"],
    function(css, env, features){

return {
    /**
     * This method determines if specified coordinates are within the HTMLElement.
     * @param {HTMLElement} el  the element to check
     * @param {Number}      x   the x coordinate in pixels
     * @param {Number}      y   the y coordinate in pixels
     * @returns {Boolean}
     */
    isInRect : function(oHtml, x, y){
        var pos = this.getAbsolutePosition(oHtml);
        if (x < pos[0] || y < pos[1] || x > oHtml.offsetWidth + pos[0] - 10
          || y > oHtml.offsetHeight + pos[1] - 10)
            return false;
        return true;
    },
    
    /**
     * Retrieves the parent which provides the rectangle to which the HTMLElement is
     * bound and cannot escape. In css this is accomplished by having the overflow
     * property set to hidden or auto.
     * @param {HTMLElement} o  the element to check
     * @returns {HTMLElement}
     */
    getOverflowParent : function(o){
        //not sure if this is the correct way. should be tested
    
        o = o.offsetParent;
        while (o && (this.getStyle(o, "overflow") != "hidden"
          || "absolute|relative".indexOf(this.getStyle(o, "position")) == -1)) {
            o = o.offsetParent;
        }
        return o || document.documentElement;
    },
    
    /**
     * Retrieves the first parent element which has a position absolute or
     * relative set.
     * @param {HTMLElement} o  the element to check
     * @returns {HTMLElement}
     */
    getPositionedParent : function(o){
        o = o.offsetParent;
        while (o && o.tagName.toLowerCase() != "body"
          && "absolute|relative".indexOf(this.getStyle(o, "position")) == -1) {
            o = o.offsetParent;
        }
        return o || document.documentElement;
    },
    
    /**
     * Retrieves the absolute x and y coordinates, relative to the browsers
     * drawing area or the specified refParent.
     * @param {HTMLElement} o           the element to check
     * @param {HTMLElement} [refParent] the reference parent
     * @param {Boolean}     [inclSelf]  whether to include the position of the element to check in the return value.
     * @returns {Array} the x and y coordinate of oHtml.
     */
    getAbsolutePosition : function(o, refParent, inclSelf){
        if ("getBoundingClientRect" in document.documentElement) { 
            if (features.doesNotIncludeMarginInBodyOffset && o == document.body) {
                return [
                    o.offsetLeft + (parseFloat(css.getStyle(o, "marginLeft")) || 0),
                      + (o.scrollLeft || 0),
                    o.offsetTop  + (parseFloat(css.getStyle(o, "marginTop")) || 0)
                      + (o.scrollTop || 0)
                ];
            }
            
            var box  = o.getBoundingClientRect(), 
                top  = box.top,
                left = box.left,
                corr = (env.isIE && env.isIE < 8);
    
            if (refParent && refParent != document.body) {
                var pos = this.getAbsolutePosition(refParent, null, true);
                top -= pos[1];
                left -= pos[0];
            }
            
            if (!(env.isIE && o == document.documentElement)) {
                left += (refParent || document.body).scrollLeft || document.documentElement.scrollLeft || 0;
                top  += (refParent || document.body).scrollTop  || document.documentElement.scrollTop  || 0;
            }
            
            if (inclSelf && !refParent) {
                left += parseInt(css.getStyle(o, "borderLeftWidth")) || 0
                top  += parseInt(css.getStyle(o, "borderTopWidth")) || 0;
            }
    
            return [left - (corr ? 2 : 0), top - (corr ? 2 : 0)];
        }
        
        //@todo code below might be deprecated one day
        var wt = inclSelf ? 0 : o.offsetLeft, ht = inclSelf ? 0 : o.offsetTop;
        o = inclSelf ? o : o.offsetParent || o.parentNode ;
    
        if (env.isIE8 && refParent) {
            bw = this.getStyle(o, "borderLeftWidth");
            wt -= (env.isIE && o.currentStyle.borderLeftStyle != "none" 
              && bw == "medium" ? 2 : parseInt(bw) || 0);
            bh = this.getStyle(o, "borderTopWidth");
            ht -= (env.isIE && o.currentStyle.borderTopStyle != "none" 
              && bh == "medium" ? 2 : parseInt(bh) || 0);
        }
    
        var bw, bh, fl;
        while (o && o != refParent) {//&& o.tagName.toLowerCase() != "html"
            //Border - Left
            bw = env.isOpera || env.isIE8 ? 0 : this.getStyle(o, "borderLeftWidth");
    
            wt += (env.isIE && o.currentStyle.borderLeftStyle != "none" && bw == "medium"
                ? 2
                : parseInt(bw) || 0) + o.offsetLeft;
    
            if (env.isIE && !env.isIE8 && css.getStyle(o, "styleFloat") == "none" 
              && css.getStyle(o, "position") == "relative") {
                var q = o.previousSibling;
                while (q) {
                    if (q.nodeType == 1) {
                        fl = css.getStyle(q, "styleFloat");
                        if (fl == "left") {
                            wt -= parseInt(css.getStyle(o, "marginLeft")) 
                                || 0;//-1 * (o.parentNode.offsetWidth - o.offsetWidth)/2; //assuming auto
                            break;
                        }
                        else if (fl == "right")
                            break;
                    }
                    q = q.previousSibling;
                }
            }
    
            //Border - Top
            bh = env.isOpera || env.isIE8 ? 0 : css.getStyle(o, "borderTopWidth");
            ht += (env.isIE && o.currentStyle.borderTopStyle != "none" && bh == "medium"
                ? 2
                : parseInt(bh) || 0) + o.offsetTop;
    
            //Scrolling
            if (!env.isGecko && o != refParent && (o.tagName != "HTML" || o.ownerDocument != document)) {
                wt -= o.scrollLeft;
                ht -= o.scrollTop;
            }
            
            //Table support
            if (o.tagName.toLowerCase() == "table") {
                ht -= parseInt(o.border || 0) + parseInt(o.cellSpacing || 0);
                wt -= parseInt(o.border || 0) + parseInt(o.cellSpacing || 0) * 2;
            }
            else if (o.tagName.toLowerCase() == "tr") {
                var cp;
                ht -= (cp = parseInt(o.parentNode.parentNode.cellSpacing));
                while (o.previousSibling)
                    ht -= (o = o.previousSibling).offsetHeight + cp;
            }
    
            if (env.isIE && !o.offsetParent && o.parentNode.nodeType == 1) {
                wt -= o.parentNode.scrollLeft;
                ht -= o.parentNode.scrollTop;
            }
    
            o = o.offsetParent;
        }
    
        return [wt, ht];
    }
}

    }
);