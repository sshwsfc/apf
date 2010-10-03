require.modify(
    "ecmaext",
    "ecmaext/number",
    function(){

if (typeof isFinite == "undefined") {
    function isFinite(val){
        return val + 1 != val;
    }
}

/**
 * Transform a number to a string and pad it with a zero digit its length is one.
 *
 * @type {String}
 */
Number.prototype.toPrettyDigit = Number.prototype.toPrettyDigit || function() {
    var n = this.toString();
    return (n.length == 1) ? "0" + n : n;
};
 
});