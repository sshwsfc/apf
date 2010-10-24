define([], function(){
   
var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
    };

/**
 * @term dateformat Format a date based on small strings of characters representing
 * a variable.
 * Syntax:
 * <code>
 * d      day of the month as digits, no leading zero for single-digit days
 * dd     day of the month as digits, leading zero for single-digit days
 * ddd    day of the week as a three-letter abbreviation
 * dddd   day of the week as its full name
 * m      month as digits, no leading zero for single-digit months
 * mm     month as digits, leading zero for single-digit months
 * mmm    month as a three-letter abbreviation
 * mmmm   month as its full name
 * yy     year as last two digits, leading zero for years less than 2010
 * yyyy   year represented by four digits
 * h      hours, no leading zero for single-digit hours (12-hour clock)
 * hh     hours, leading zero for single-digit hours (12-hour clock)
 * H      hours, no leading zero for single-digit hours (24-hour clock)
 * HH     hours, leading zero for single-digit hours (24-hour clock)
 * M      minutes, no leading zero for single-digit minutes
 * MM     minutes, leading zero for single-digit minutes
 * s      seconds, no leading zero for single-digit seconds
 * ss     seconds, leading zero for single-digit seconds
 * </code>
 */
function dateFormat(date, mask, utc) {
    var dF = apf.date;

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && (typeof date == "string"
        || date instanceof String) && !/\d/.test(date)) {
        mask = date;
        date = undefined;
    }

    // Passing date through Date applies apf.date.getDateTime, if necessary
    date = date ? new Date(date) : new Date();

    if (isNaN(date)) return "NaN";//throw new SyntaxError("invalid date");

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
        mask = mask.slice(4);
        utc = true;
    }

    var	_ = utc ? "getUTC" : "get",
        d = date[_ + "Date"](),
        D = date[_ + "Day"](),
        m = date[_ + "Month"](),
        y = date[_ + "FullYear"](),
        H = date[_ + "Hours"](),
        M = date[_ + "Minutes"](),
        s = date[_ + "Seconds"](),
        L = date[_ + "Milliseconds"](),
        o = utc ? 0 : date.getTimezoneOffset(),
        flags = {
            d   : d,
            dd  : pad(d),
            ddd : dF.i18n.dayNames[D],
            dddd: dF.i18n.dayNames[D + 7],
            m   : m + 1,
            mm  : pad(m + 1),
            mmm : dF.i18n.monthNames[m],
            mmmm: dF.i18n.monthNames[m + 12],
            yy  : String(y).slice(2),
            yyyy: y,
            h   : H % 12 || 12,
            hh  : pad(H % 12 || 12),
            H   : H,
            HH  : pad(H),
            M   : M,
            MM  : pad(M),
            s   : s,
            ss  : pad(s),
            l   : pad(L, 3),
            L   : pad(L > 99 ? Math.round(L / 10) : L),
            t   : H < 12 ? "a"  : "p",
            tt  : H < 12 ? "am" : "pm",
            T   : H < 12 ? "A"  : "P",
            TT  : H < 12 ? "AM" : "PM",
            Z   : utc
                      ? "UTC"
                      : (String(date).match(timezone) 
                          || [""]).pop().replace(timezoneClip, ""),
            o   : (o > 0 ? "-" : "+") 
                     + pad(Math.floor(Math.abs(o) / 60) * 100
                     + Math.abs(o) % 60, 4),
            S   : ["th", "st", "nd", "rd"]
                  [d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
        };

    return mask.replace(token, function ($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
};


/**
 * Create a object representation of date from datetime string parsing it with
 * datetime format string
 * 
 * @param {String}   datetime   the date and time wrote in allowed format
 * @param {String}   format     style of displaying date, created using various
 *                              masks
 *     Possible masks:
 *     d      day of the month as digits, no leading zero for single-digit days
 *     dd     day of the month as digits, leading zero for single-digit days
 *     ddd    day of the week as a three-letter abbreviation
 *     dddd   day of the week as its full name
 *     m      month as digits, no leading zero for single-digit months
 *     mm     month as digits, leading zero for single-digit months
 *     mmm    month as a three-letter abbreviation
 *     mmmm   month as its full name
 *     yy     year as last two digits, leading zero for years less than 2010
 *     yyyy   year represented by four digits
 *     h      hours, no leading zero for single-digit hours (12-hour clock)
 *     hh     hours, leading zero for single-digit hours (12-hour clock)
 *     H      hours, no leading zero for single-digit hours (24-hour clock)
 *     HH     hours, leading zero for single-digit hours (24-hour clock)
 *     M      minutes, no leading zero for single-digit minutes
 *     MM     minutes, leading zero for single-digit minutes
 *     s      seconds, no leading zero for single-digit seconds
 *     ss     seconds, leading zero for single-digit seconds
 */
function getDateTime(datetime, format) {
    var token    = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC:)(?:[-+]\d{4})?)\b/g,
        alter    = 0,
        y        = new Date().getFullYear(),
        m        = 1,
        d        = 1,
        h        = 12,
        M        = 0,
        s        = 0,
        i18n     = apf.date.i18n;

    if (!format) {
        throw new Error(apf.formatErrorString(0, null,
            "date-format", "Date format is null"));
    }

    format = format.replace(timezone, "");

    var str = format.replace(token, function(str, offset, p) {
        var part = datetime.substring(p + alter, p + alter + str.length);

        switch (str) {
            case "d":
            case "m":
            case "h":
            case "H":
            case "M":
            case "s":
                if (!/[\/, :\-](d|m|h|H|M|s)$|^(d|m|h|H|M|s)[\/, :\-]|[\/, :\-](d|m|h|H|M|s)[\/, :\-]/.test(format)) {
                    throw new Error(apf.formatErrorString(0, null,
                        "date-format", "Dates without leading zero needs separators"));
                }

                var value = parseInt(datetime.substring(p + alter,
                    p + alter + 2));

                if (value.toString().length == 2)
                    alter++;
    
                return str == "d"
                    ? d = value
                    : (str == "m"
                        ? m = value
                        : (str == "M"
                            ? M = value
                            : (str == "s"
                                ? s = value
                                : h = value))); 
            case "dd":
                return d = part; //01-31
            case "dddd":
                //changeing alteration because "dddd" have no information about day number
                alter += i18n.dayNames[i18n.dayNumbers[part.substring(0,3)] + 7].length - 4;
                break;
            case "mm":
                return m = part; //01 - 11
            case "mmm":
                return m = i18n.monthNumbers[part] + 1;
            case "mmmm":
                var monthNumber = i18n.monthNumbers[part.substring(0, 3)];
                alter += i18n.monthNames[monthNumber + 12].length - 4;
                return m = monthNumber + 1;
            case "yy":
                return y = parseInt(part) < 70 ? "20" + part : part;
            case "yyyy":
                return y = part;
            case "hh":
                return h = part;
            case "HH":
                return h = part;
            case "MM":
                return M = part;
            case "ss":
                return s = part;
            case "T":
            case "Z":
                //because in date we have only T
                alter -= 2;
                break;
         }
    });

    return new Date(y, m-1, d, h, M, s);
};

Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

Date.fromStringFormat = function(datetime, format){
    return getDateTime(datetime, format);
}

});