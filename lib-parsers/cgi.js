module.declare(function(require, exports, module){
/**
 * Converts a cgi string to a javascript object.
 * @see core.convertXml
 */
var FromCgiString = function(args) {
    if (!args)
        return false;

    var obj = {};
    args = args.split("&");
    for (var data, i = 0; i < args.length; i++) {
        data = args[i].split("=");
        data[0] = decodeURIComponent(data[0]);
        var path = data[0].replace(/\]/g, "").split("[");

        var spare = obj;
        for (var j = 0; j < path.length; j++) {
            if (spare[path[j]])
                spare = spare[path[j]];
            else if (path.length == j+1) {
                if (path[j])
                    spare[path[j]] = decodeURIComponent(data[1]);
                else
                    spare.push(decodeURIComponent(data[1]));
                break; //assuming last
            }
            else{
                spare[path[j]] = !path[j+1] ? [] : {};
                spare = spare[path[j]];
            }
        }
    }

    return obj;
}
})
