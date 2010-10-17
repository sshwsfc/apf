    define([],function(){
    /**
     * @private
     */
    var Popup2 = {
        cache: {},
        setContent: function(cacheId, content, style, width, height){
            if (!this.popup)
                this.init();

            this.cache[cacheId] = {
                content: content,
                style  : style,
                width  : width,
                height : height
            };
            if (content.parentNode)
                content.parentNode.removeChild(content);
            if (style)
                apf.importCssString(style, this.popup.document);

            return this.popup.document;
        },

        removeContent: function(cacheId){
            this.cache[cacheId] = null;
            delete this.cache[cacheId];
        },

        init: function(){
            this.popup = window.createPopup();

            this.popup.document.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\
                <html xmlns="http://www.w3.org/1999/xhtml" xmlns:a=' + apf.ns.aml + ' xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\
                <head>\
                    <script>\
                    var apf = {\
                        all: [],\
                        lookup:function(uniqueId){\
                            return this.all[uniqueId] || {\
                                $setStyleClass:function(){}\
                            };\
                        }\
                    };\
                    function destroy(){\
                        apf.all=null;\
                    }\
                    </script>\
                    <style>\
                    HTML{border:0;overflow:hidden;margin:0}\
                    BODY{margin:0}\
                    </style>\
                </head>\
                <body onmouseover="if(!self.apf) return;if(this.c){apf.all = this.c.all;this.c.Popup.parentDoc=self;}"></body>\
                </html>');

            var c = apf;
            this.popup.document.body.onmousemove = function(){
                this.c = c
            }
        },

        show: function(cacheId, x, y, animate, ref, width, height, callback){
            if (!this.popup)
                this.init();
            var o = this.cache[cacheId];
            //if(this.last != cacheId)
            this.popup.document.body.innerHTML = o.content.outerHTML;

            if (animate) {
                var iVal, steps = 7, i = 0, popup = this.popup;
                iVal = setInterval(function(){
                    var value = ++i * ((height || o.height) / steps);
                    popup.show(x, y, width || o.width, value, ref);
                    popup.document.body.firstChild.style.marginTop
                        = (i - steps - 1) * ((height || o.height) / steps);
                    if (i > steps) {
                        clearInterval(iVal)
                        callback(popup.document.body.firstChild);
                    }
                }, 10);
            }
            else {
                this.popup.show(x, y, width || o.width, height || o.height, ref);
            }

            this.last = cacheId;
        },

        hide: function(){
            if (this.popup)
                this.popup.hide();
        },

        forceHide: function(){
            if (this.last)
                apf.lookup(this.last).dispatchEvent("popuphide");
        },

        destroy: function(){
            if (!this.popup)
                return;
            this.popup.document.body.c = null;
            this.popup.document.body.onmouseover = null;
        }
    };
    });