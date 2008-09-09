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

// #ifdef __JCHART || __INC_ALL
// #define __WITH_PRESENTATION 1

/**
 * Component displaying a skinnable rectangle which can contain other JML components.
 *
 * @classDescription This class creates a new chart
 * @return {Chart} Returns a new chart
 * @type {Chart}
 * @constructor
 * @allowchild {components}, {anyjml}
 * @addnode components:bar
 *
 * @author      Ruben Daniels
 * @version     %I%, %G%
 * @since       0.4
 */

jpf.chart = jpf.component(jpf.GUI_NODE, function(){
    
    // Background axis 
        // window, axis draw stuff
    // Graph series (data + method)
    
    // navigation:
    // zoom / move
    
    // width and height should be from xml
    
    var style = {
        line : 2,
        color : "000000"
    }
	var space = {x:1000000, w:-2000000, y:1000000, h:-2000000};
	var engine = null;
	this.chartType = "linear";
	
    this.convertSeries2D_Array = function(s_array){
        return s_array;
        //return series.push(s_array);
    }
    this.convertSeries2D_XML = function(s_array){
        //return series.push(s_array);
    }
    
    // calculate n-dimensional array  min/maxes
    function calculateSeriesSpace(series, dims, space){
        var di, d, vi, v;
        if(!space.length){
	        for(di=0; di<dims; di++){
				space.push([series[0][di],series[0][di]]);
			}
		}
        for(di = 0; di < dims; di++){
            d = space[di];
            for(vi = series.length; vi >= 0; vi--){
                v = series[i][di];
                
                if( v < d[0]) d[0]=v; 
                if( v > d[1]) d[1]=v; 
            }
        }
    }
    /* s - space */
	function calcSpace2D(data, s){
       var vi, x, y, x1 = s.x, x2 = s.x + s.w,
       y1 = s.y, y2 = s.y + s.h;
       
	   for(vi = data.length-1; vi >= 0; vi--){
           x = data[vi][0], y = data[vi][1];
           if( x < x1) x1=x; 
           if( x > x2) x2=x; 
           if( y < y1) y1=y; 
           if( y > y2) y2=y; 
       }
       s.x = x1, s.w = x2-x1, s.y = y1, s.h = y2-y1;
    }
    
    var persist = {}, engine;
    this.drawChart = function(){
        var out = {
            dw : this.oExt.offsetWidth,
            dh : this.oExt.offsetHeight,
            vx : space.x, 
            vy : space.y, 
            vh : space.h, 
            vw : space.w, 
            tx : space.x + space.w, 
            ty : space.y + space.h,
            sw : this.oExt.offsetWidth / space.w, 
            sh : this.oExt.offsetHeight / space.w
        };
        
        engine.clear(out, persist);
        engine.grid(out, style, persist);
        engine.axes(out, persist);
        // you can now draw the graphs by doing:
        engine[this.chartType](out, series, style, persist);
    }
	
	this.loadData = function(data){		
		calcSpace2D(data, space);		
	}
    
    this.draw = function(){
        //Build Main Skin
        this.oExt = this.__getExternal();		
    }
    
    this.__loadJML = function(x){
        this.chartType = x.getAttribute("type") || "linear2D";
        
        var oInt = this.__getLayoutNode("Main", "container", this.oExt);
        this.oInt = this.oInt
            ? jpf.JMLParser.replaceNode(oInt, this.oInt)
            : jpf.JMLParser.parseChildren(x, oInt, this);
        
        engine = jpf.supportCanvas 
                ? jpf.chart.canvasDraw
                : jpf.chart.vmlDraw;
        
        engine.init(this.oInt, persist);
		this.drawChart();
    }
}).implement(jpf.Presentation);

jpf.chart.canvasDraw = {
    init : function(oHtml, persist){
        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", oHtml.offsetWidth - 45); /* -padding */
        canvas.setAttribute("height", oHtml.offsetHeight - 30); /* -padding */
        canvas.className = "canvas";
        oHtml.appendChild(canvas);
        
        persist.ctx = canvas.getContext('2d');
        persist.si   = 0;
    },
    
    clear : function(style, persist){
    
    },	
	
    grid : function(o, style, persist){
        
		function round_pow(x){
			return Math.pow(10, Math.round(Math.log(x) / Math.log(10)));
		}
		
		var dh = o.dh,dw = o.dw, vx = o.vx, vy = o.vy, vh = o.vh, vw = o.vw, 
            sw = o.sw, sh = o.sw, c = persist.ctx, gx, gy; 
        
        c.lineWidth = 1;
        c.strokeStyle = "#ebebeb";
        c.beginPath();
        
        for(var gx = round_pow(vw/(dw/25)), 
                 x = Math.round(vx / gx) * gx - vx - gx; x < vw + gx; x += gx){
           c.moveTo(x*sw, 0);
           c.lineTo(x*sw, dh);
        }
        
        for(gy = round_pow(vh / (dh / 25)), 
             y = Math.round(vy / gy) * gy - vy - gy; y < vh + gy; y += gy){
           c.moveTo(0, y * sh);
           c.lineTo(dw, y * sh);
        }
        
        c.stroke();
    },
    
    axes : function(o, style, persist){
    
    },
    
    linear : function(o, series, style, persist){
        //do stuff
    },
    
    linear2D : function(o, series, style, persist){
        var dh = o.dh,dw = o.dw, vx = o.vx, vy = o.vy, vh = o.vh, vw = o.vw, 
            sw = o.sw, sh = o.sw, c = o.c, tx = o.tx,ty = o.ty,
            len = series.length, i, si = persist.si, s, lx, d; 
    
        if (len < 2) 
            return;

        c.beginPath();
        c.strokeStyle = style.color;

        if (len < 10 || series[i + 4][0] > vx && series[len - 5][0] < tx) {
            var i, s = series[0];
            c.moveTo((s[0] - vx) * sw, dh - (s[1] - vy)*sh);
            
            for(i = 1, s = series[i]; i < len; s = series[++i])       
                c.lineTo((s[0] - vx) * sw, dh - (s[1] - vy) * sh);
            
            c.stroke();
        } 
        else {
            for(;si >= 0 && series[si][0] >= vx; si--);
            
            for(i = si + 1, s = series[i], lx = series[si][0], d = 0; 
              i < len && lx <= tx; s = series[++i]){
                if ((x = s[0]) >= vx){
                    if (!d) {
                        d++; 
                        area.moveTo((lx - vx) * sw,
                            dh - (series[persist.si = (i - 1)][1] - vy) * sh);
                    }
                    
                    c.lineTo(((lx = x) - vx) * sw, dh - (s[1] - vy) * sh);
                }
            }
        }
        
        c.stroke();
    }
}

jpf.chart.vmlDraw = {
    clear : function(opt){},
    
    linear : function(axes,series,opt){}
}

// #endif
 