define([], function(){
    /**
     * Flashes the task bar. This can be useful to signal the user that an
     * important event has occured. Only works in internet explorer under
     * certain conditions.
     */
    this.flash = function(){
        if (apf.window.hasFocus() || apf.isIphone)
            return;

        if (apf.isDeskrun) {
            jdwin.Flash();
        }
        else if (apf.isIE) {
            if (!this.popup)
                this.popup = window.createPopup();

            if (apf.window.stopFlash)
                return;

            state += "x"

            function doFlash(nopopup) {
                if (apf.window.hasFocus())
                    return;

                window.focus();

                function doPopup() {
                    if (apf.window.hasFocus())
                        return;

                    this.popup.hide();
                    this.popup.show(0, 0, 0, 0, document.body);
                    this.popup.document.write("<body><script>\
                        document.p = window.createPopup();\
                        document.p.show(0, 0, 0, 0, document.body);\
                        </script></body>");
                    this.popup.document.focus();

                    clearInterval(this.flashTimer);
                    this.flashTimer = setInterval(function(){
                        if (!apf.window.popup.isOpen
                          || !apf.window.popup.document.p.isOpen) {
                            clearInterval(apf.window.flashTimer);

                            if (!apf.window.hasFocus()) {
                                apf.window.popup.hide();
                                document.body.focus();
                                state = "d";
                                determineAction();
                            }
                            //when faster might have timing error
                        }
                    }, 10);
                }

                if (nopopup)
                    $setTimeout(function(){
                        doPopup.call(apf.window)
                    }, 10);
                else
                    doPopup.call(apf.window);
            }

            if ("TEXTAREA|INPUT|SELECT".indexOf(document.activeElement.tagName) > -1) {
                document.activeElement.blur();
                document.body.focus();
                apf.window.stopFlash = true;
                $setTimeout(function(){
                    doFlash.call(apf.window, true);
                    apf.window.stopFlash = false;
                }, 10);
            }
            else {
                doFlash.call(apf.window);
            }
        }
    };
    });