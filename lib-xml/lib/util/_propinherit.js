define([], function(){
/**
 * Retrieves the attribute of an xml node or the first parent node that has
 * that attribute set. If no attribute is set the value is looked for on
 * the appsettings element.
 *
 * @param {XMLElement} xml    the xml node that is the starting point of the search.
 * @param {String}     attr   the name of the attribute.
 * @param {Function}   [func] callback that is run for every node that is searched.
 * @return {String} the found value, or empty string if none was found.
 */
var GetInheritedAttribute = function(xml, attr, func){
    var result, avalue;

    //@todo optimize this and below
    if (xml.nodeType != 1)
        xml = xml.parentNode;

    while (xml && (xml.nodeType != 1 || !(result = attr 
      && ((avalue = xml.getAttribute(attr)) || typeof avalue == "string") 
      || func && func(xml)))) {
        xml = xml.parentNode;
    }
    if (avalue == "")
        return "";

    return !result && attr && apf.config
        ? apf.config[attr]
        : result;
};
})
