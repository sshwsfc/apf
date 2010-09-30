// #ifdef __TP_HTTP
    /**
     * Sends and retrieves data from remote locations over http.
     * Example:
     * <code>
     *  var content = apf.ajax("http://www.ajax.org", {
     *      method   : "POST",
     *      data     : "<data />",
     *      async    : false,
     *      callback : function( data, state ) {
     *          if (state == apf.SUCCESS)
     *              alert("Success");
     *          else
     *              alert("Failure")
     *      }
     *  });
     *  alert(content);
     * </code>
     *
     * @param {String}   url       the url that is accessed.
     * @param {Object}   options   the options for the http request
     *   Properties:
     *   {Boolean} async          whether the request is sent asynchronously. Defaults to true.
     *   {mixed}   userdata       custom data that is available to the callback function.
     *   {String}  method         the request method (POST|GET|PUT|DELETE). Defaults to GET.
     *   {Boolean} nocache        whether browser caching is prevented.
     *   {String}  data           the data sent in the body of the message.
     *   {Boolean} useXML         whether the result should be interpreted as xml.
     *   {Boolean} autoroute      whether the request can fallback to a server proxy.
     *   {Boolean} caching        whether the request should use internal caching.
     *   {Boolean} ignoreOffline  whether to ignore offline catching.
     *   {String}  contentType    the mime type of the message
     *   {Function} callback      the handler that gets called whenever the
     *                            request completes succesfully or with an error,
     *                            or when the request times out.
     */
    ajax : (function(){
        var f = function(){
            return this.oHttp.get.apply(this.oHttp, arguments);
        };
        
        f.exec = function(method, args, callback, options){
            if (method == "ajax" && args[0]) {
                var opt = args[1] || {};
                return this.oHttp.exec(opt.method || "GET", [args[0]], 
                    opt.callback, apf.extend(options || {}, opt));
            }
        };

        return f;
    })(),
    // #endif