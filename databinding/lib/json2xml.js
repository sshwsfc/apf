//This is somewhat of a hack and should probably be moved to elsewhere in the future
require.modify(
    "lib-xml", 
    "lib-xml/json2xml", 
    ["lib-ecmaext/json2", "lib-ecmaext/json2xml", "lib-xml"]
    function(json, json2Xml, libXml){

var parseError = libXml.xmlParseError;
libXml.xmlParseError = function(xml, message){
    try {
        parseError.call(this, xml, message);
    }
    catch(e) {
        if (json.isJson(message)) {
            try {
                var object = apf.json2Xml(message, noError);
                return object;
            }
            catch(e) {
                throw new Error(apf.formatErrorString(1051, null,
                   "JSON to XML conversion error occurred."+e.message,
                   "\nSource Text : " + message.replace(/\t/gi, " ")));
            }
        }
        throw e;
    }
}

    }
);