module.declare(function(require, exports, module){

/**
 * Flashes the task bar. This can be useful to signal the user that an
 * important event has occured. Only works in internet explorer under
 * certain conditions.
 */
FocusClientWindow.flash = function(){
    if (FocusManager.hasFocus() || apf.isIphone)
        return;

    if (apf.isDeskrun) {
        jdwin.Flash();
    }
    else if (apf.isIE) {
        if (!this.popup)
            this.popup = window.createPopup();

        if (FocusClientWindow.stopFlash)
            return;

        state += "x"

        function doFlash(nopopup) {
            if (FocusManager.hasFocus())
                return;

            window.focus();

            function doPopup() {
                if (FocusManager.hasFocus())
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
                    if (!FocusClientWindow.popup.isOpen
                      || !FocusClientWindow.popup.document.p.isOpen) {
                        clearInterval(FocusClientWindow.flashTimer);

                        if (!FocusManager.hasFocus()) {
                            FocusClientWindow.popup.hide();
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
                    doPopup.call(FocusClientWindow)
                }, 10);
            else
                doPopup.call(FocusClientWindow);
        }

        if ("TEXTAREA|INPUT|SELECT".indexOf(document.activeElement.tagName) > -1) {
            document.activeElement.blur();
            document.body.focus();
            FocusClientWindow.stopFlash = true;
            $setTimeout(function(){
                doFlash.call(FocusClientWindow, true);
                FocusClientWindow.stopFlash = false;
            }, 10);
        }
        else {
            doFlash.call(FocusClientWindow);
        }
    }
};

});