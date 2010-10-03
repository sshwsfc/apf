require.modify(
    "ecmaext",
    "ecmaext/is8601",
    function(){

Date.prototype.fromISO8601 = function(formattedString) {
    var match  = formattedString.match(/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/),
        result = null;

    if (match) {
        match.shift();
        if (match[1])
            match[1]--; // Javascript Date months are 0-based
        if (match[6])
            match[6] *= 1000; // Javascript Date expects fractional seconds as milliseconds

        result = new Date(match[0]||1970, match[1]||0, match[2]||1, match[3]||0, match[4]||0, match[5]||0, match[6]||0); //TODO: UTC defaults
        if (match[0] < 100)
            result.setFullYear(match[0] || 1970);

        var offset = 0,
        zoneSign = match[7] && match[7].charAt(0);
        if (zoneSign != "Z"){
            offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
            if(zoneSign != "-")
                offset *= -1;
        }
        if (zoneSign)
            offset -= result.getTimezoneOffset();
        if (offset)
            result.setTime(result.getTime() + offset * 60000);
    }
    else 
        return new Date(formattedString);

    return result; // Date or null
}

Date.prototype.toISO8601 = function(date) {
    var pad = function (amount, width) {
        var padding = "";
        while (padding.length < width - 1 && amount < Math.pow(10, width - padding.length - 1))
            padding += "0";
        return padding + amount.toString();
    }
    date = date ? date : new Date();
    var offset = date.getTimezoneOffset();
    return pad(date.getFullYear(), 4)
        + "-" + pad(date.getMonth() + 1, 2)
        + "-" + pad(date.getDate(), 2)
        + "T" + pad(date.getHours(), 2)
        + ":" + pad(date.getMinutes(), 2)
        + ":" + pad(date.getUTCSeconds(), 2)
        + (offset > 0 ? "-" : "+")
        + pad(Math.floor(Math.abs(offset) / 60), 2)
        + ":" + pad(Math.abs(offset) % 60, 2);
};
        
});