        //#ifdef __PARSE_GET_VARS
        for (var i, l2, a, m, n, o, v, p = location.href.split(/[?&]/), l = p.length, k = 1; k < l; k++) {
            if (m = p[k].match(/(.*?)(\..*?|\[.*?\])?=([^#]*)/)) {
                n = decodeURI(m[1]).toLowerCase(), o = this._GET;
                if (m[2]) {
                    for (a = decodeURI(m[2]).replace(/\[\s*\]/g, "[-1]").split(/[\.\[\]]/), i = 0, l2 = a.length; i < l2; i++) {
                        v = a[i],
                        o = o[n]
                            ? o[n]
                            : o[n] = (parseInt(v) == v)
                                ? []
                                : {},
                        n = v.replace(/^["\'](.*)["\']$/, "$1");
                    }
                }
                o[n != "-1" ? n : o.length] = unescape(decodeURI(m[3]));
            }
        }
        //#endif