define(['ecmatypes'],function(){

/**
 * Reliably determines whether a variable is an array.
 * @see http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 *
 * @param {mixed}   value The variable to check
 * @type  {Boolean}
 */
Array.isArray = function(o) {
    return o.dataType == ecma.ARRAY;
},

/**
 * Copy an array, like this statement would: 'this.concat([])', but then do it
 * recursively.
 */
Array.prototype.copy = function(){
    var ar = [];
    for (var i = 0, j = this.length; i < j; i++)
        ar[i] = this[i] && this[i].copy ? this[i].copy() : this[i];

    return ar;
};

/**
 * Concatenate the current Array instance with one (or more) other Arrays, like
 * Array.concat(), but return the current Array instead of a new one that
 * results from the merge.
 *
 * @param {Array} array1, array2, array3, etc.
 * @type  {Array}
 */
Array.prototype.merge = function(){
    for (var i = 0, k = arguments.length; i < k; i++) {
        for (var j = 0, l = arguments[i].length; j < l; j++) {
            this.push(arguments[i][j]);
        }
    }
};

/**
 * Add the values of one or more arrays to the current instance by using the
 * '+=' operand on each value.
 *
 * @param {Array} array1, array2, array3, etc.
 * @type  {Array}
 * @see Array.copy
 */
Array.prototype.arrayAdd = function(){
    var s = this.copy();
    for (var i = 0, k = arguments.length; i < k; i++) {
        for (var j = 0, l = s.length; j < l; j++) {
            s[j] += arguments[i][j];
        }
    }

    return s;
};

/**
 * Check if an object is contained within the current Array instance.
 *
 * @param {mixed}   obj The value to check for inside the Array
 * @type  {Boolean}
 */
Array.prototype.equals = function(obj){
    for (var i = 0, j = this.length; i < j; i++)
        if (this[i] != obj[i])
            return false;
    return true;
};

/**
 * Make sure that an array instance contains only unique values (NO duplicates).
 *
 * @type {Array}
 */
Array.prototype.makeUnique = function(){
    var i, length, newArr = [];
    for (i = 0, length = this.length; i < length; i++)
        if (newArr.indexOf(this[i]) == -1)
            newArr.push(this[i]);

    this.length = 0;
    for (i = 0, length = newArr.length; i < length; i++)
        this.push(newArr[i]);

    return this;
};

/**
 * Check if this array instance contains a value 'obj'.
 *
 * @param {mixed}  obj    The value to check for inside the array
 * @param {Number} [from] Left offset index to start the search from
 * @type  {Boolean}
 * @see Array.indexOf
 */
Array.prototype.contains = function(obj, from){
    return this.indexOf(obj, from) != -1;
};

/**
 * Search for the index of the first occurence of a value 'obj' inside an array
 * instance.
 * July 29, 2008: added 'from' argument support to indexOf()
 *
 * @param {mixed}  obj    The value to search for inside the array
 * @param {Number} [from] Left offset index to start the search from
 * @type  {Number}
 */
Array.prototype.indexOf = Array.prototype.indexOf || function(obj, from){
    var len = this.length;
    for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++) {
        if (this[i] === obj)
            return i;
    }
    return -1;
};

/**
 * Search for the index of the last occurence of a value 'obj' inside an array
 * instance.
 *
 * @param {mixed}  obj    The value to search for inside the array
 * @param {Number} [from] Left offset index to start the search from
 * @type  {Number}
 */
Array.prototype.lastIndexOf = Array.prototype.lastIndexOf || function(obj, from) {
    //same as indexOf(), but in reverse loop, JS spec 1.6
    var len = this.length;
    for (var i = (from >= len) ? len - 1 : (from < 0) ? from + len : len - 1; i >= 0; i--) {
        if (this[i] === obj)
            return i;
    }
    return -1;
};

/**
 * Like Array.push, but only invoked when the value 'item' is already present
 * inside the array instance.
 *
 * @param {mixed} item, item, ...
 * @type  {Array}
 */
Array.prototype.pushUnique = function(){
    var item,
        i = 0,
        l = arguments.length;
    for (; i < l; ++i) {
        item = arguments[i];
    if (this.indexOf(item) == -1)
        this.push(item);
    }
    return this;
};

/**
 * @todo: Ruben: could you please comment on this function? Seems to serve a very
 * specific purpose...
 *
 * I also could not find an occurrence in our codebase.
 */
Array.prototype.search = function(){
    for (var i = 0, length = arguments.length; i < length; i++) {
        if (typeof this[i] != "array")
            continue;
        for (var j = 0; j < length; j++) {
            if (this[i][j] != arguments[j])
                break;
            else if (j == (length - 1))
                return this[i];
        }
    }
};

/**
 * Iterate through each value of an array instance from left to right (front to
 * back) and execute a callback Function for each value.
 *
 * @param {Function} fn
 * @type  {Array}
 */
Array.prototype.each =
Array.prototype.forEach = Array.prototype.forEach || function(fn) {
    for (var i = 0, l = this.length; i < l; i++)
        fn.call(this, this[i], i, this);
    return this;
}

/**
 * Search for a value 'obj' inside an array instance and remove it when found.
 *
 * @type {mixed} obj
 * @type {Array}
 */
Array.prototype.remove = function(obj){
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] != obj)
            continue;

        this.splice(i, 1);
    }

    return this;
};

/**
 * Remove an item from an array instance which can be identified with key 'i'
 *
 * @param  {Number} i
 * @return {mixed}  The removed item
 */
Array.prototype.removeIndex = function(i){
    if (!this.length) return null;
    return this.splice(i, 1);
};

/**
 * Insert a new value at a specific object; alias for Array.splice.
 *
 * @param {mixed}  obj Value to insert
 * @param {Number} i   Index to insert 'obj' at
 * @type  {Number}
 */
Array.prototype.insertIndex = function(obj, i){
    this.splice(i, 0, obj);
};

/**
 * Reverses the order of the elements of an array; the first becomes the last,
 * and the last becomes the first.
 *
 * @type {Array}
 */
Array.prototype.invert =
Array.prototype.reverse = Array.prototype.reverse || function(){
    var l = this.length - 1;
    for (var temp, i = 0; i < Math.ceil(0.5 * l); i++) {
        temp        = this[i];
        this[i]     = this[l - i]
        this[l - i] = temp;
    }

    return this;
};

//#ifdef __DEPRECATED

/*
    These functions are really old, is there any browser that
    doesn't support them? I don't think so. Lets opt for
    removal
*/
/**
 * Adds one or more elements to the end of an array and returns the new length
 * of the array.
 *
 * @param {mixed} value1, value2, value3, etc.
 * @type  {Number}
 */
Array.prototype.push = Array.prototype.push || function(){
    for (var i = arguments.length - 1; i >= 0; i--)
        this[this.length] = arguments[i];
    return this.length;
};

/**
 * Removes the last element from an array and returns that element.
 *
 * @type {mixed}
 */
Array.prototype.pop = Array.prototype.pop || function(){
    var item = this[this.length - 1];
    delete this[this.length - 1];
    this.length--;
    return item;
};

/**
 * Removes the first element from an array and returns that element.
 *
 * @type {mixed}
 */
Array.prototype.shift = Array.prototype.shift || function(){
    var item = this[0];
    for (var i = 0, l = this.length; i < l; i++)
        this[i] = this[i + 1];
    this.length--;
    return item;
};

/**
 * Joins all elements of an array into a string.
 *
 * @param {String} connect
 * @type  {String}
 */
Array.prototype.join = Array.prototype.join || function(connect){
    for (var str = "", i = 0, l = this.length; i < l; i++)
        str += this[i] + (i < l - 1 ? connect : "");
    return str;
};

//#endif

/*
 * Attempt to fully comply (in terms of functionality) with the JS specification,
 * up 'till version 1.7:
 * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array
 */

/**
 * Creates a new array with all of the elements of this array for which the
 * provided filtering function returns true.
 *
 * @param {Function} fn   Function to test each element of the array.
 * @param {Object}   bind Object to use as this when executing callback.
 * @type  {Array}
 */
Array.prototype.filter = Array.prototype.filter || function(fn, bind){
    var results = [];
    for (var i = 0, l = this.length; i < l; i++) {
        if (fn.call(bind, this[i], i, this))
            results.push(this[i]);
    }
    return results;
};

/**
 * Returns true if every element in this array satisfies the provided testing
 * function.
 *
 * @param {Function} fn   Function to test for each element.
 * @param {Object}   bind Object to use as this when executing callback.
 * @type  {Boolean}
 */
Array.prototype.every = Array.prototype.every || function(fn, bind){
    for (var i = 0, l = this.length; i < l; i++) {
        if (!fn.call(bind, this[i], i, this))
            return false;
    }
    return true;
};

/**
 * Creates a new array with the results of calling a provided function on every
 * element in this array.
 *
 * @param {Function} fn   Function that produces an element of the new Array from an element of the current one.
 * @param {Object}   bind Object to use as this when executing callback.
 * @type  {Array}
 */
Array.prototype.map = Array.prototype.map || function(fn, bind){
    var results = [];
    for (var i = 0, l = this.length; i < l; i++)
        results[i] = fn.call(bind, this[i], i, this);
    return results;
};

/**
 * Tests whether some element in the array passes the test implemented by the
 * provided function.
 *
 * @param {Function} fn   Function to test for each element.
 * @param {Object}   bind Object to use as this when executing callback.
 * @type  {Boolean}
 */
Array.prototype.some = Array.prototype.some || function(fn, bind){
    for (var i = 0, l = this.length; i < l; i++) {
        if (fn.call(bind, this[i], i, this))
            return true;
    }
    return false;
};

});