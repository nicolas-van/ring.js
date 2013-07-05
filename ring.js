/*
Ring.js version 0.1

Copyright (c) 2013, Nicolas Vanhoren

Released under the MIT license

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function() {

if (typeof(exports) !== "undefined") { // nodejs
    var underscore = require("underscore");
    underscore.extend(exports, declare(underscore));
} else if (typeof(define) !== "undefined") { // amd
    define(["underscore"], declare);
} else { // define global variable
    ring = declare(_);
}


function declare(_) {
    var ring = {};

    function Object() {};
    ring.Object = Object;
    _.extend(ring.Object, {
        __mro__: [ring.Object],
        __properties__: {},
        prototype: {
            $class: ring.Object,
        },
        __class_id__: 1,
    });

    var classCounter = 2;
    var fnTest = /xyz/.test(function(){xyz;}) ? /\$super\b/ : /.*/;

    ring.class = function() {
        // arguments parsing
        var args = _.toArray(arguments);
        args.reverse();
        var props = args[0];
        var parents = args.length >= 2 ? args[1] : [];
        if (parents.length == 0)
            parents = [ring.Object];
        var id = classCounter++;
        var name = args.length >= 3 ? args[2] : "Class" + id;
        // class/function creation
        var claz = new Function("function " + name +
            "() {if (this.$init)this.$init.apply(this, arguments);}; return " + name + ";")();
        // mro creation
        var toMerge = _.pluck(parents, "__mro__");
        toMerge = toMerge.concat(parents);
        var __mro__ = [claz].concat(mergeMro(toMerge));
        claz.__mro__ = __mro__;
        //generate prototype
        claz.__properties__ = props;
        var prototype = {};
        claz.prototype = prototype;
        prototype.$class = claz;
        claz.__class_id__ = classCounter;
        var keys = {};
        _.each(claz.__mro__, function(c) {
            _.each(c.__properties__, function(v, k) {
                keys[k] = true;
            });
        });
        var getProperty = function(mro, key) {
            if (mro.length === 0)
                return undefined;
            var c = mro[0];
            if (c.__properties__[key] === undefined)
                return getProperty(_.rest(mro), key);
            var p = c.__properties__[key];
            if (typeof p !== "function" || ! fnTest.test(p))
                return p;
            var sup = getProperty(_.rest(mro), key);
            if (! typeof sup === "function")
                return p;
            return function() {
                var tmp = this.$super;
                this.$super = sup;
                var ret = p.apply(this, arguments);
                this.$super = tmp;
                return ret;
            };
        };
        _.each(keys, function(v, k) {
            claz.prototype[k] = getProperty(claz.__mro__, k);
        });
        // construct classes index
        claz.__class_index__ = {};
        _.each(claz.__mro__, function(c) {
            claz.__class_index__[c.__class_id__] = c;
        });
        claz.isSubClass = function(other) {
            return this.__class_index__[other.__class_id__] !== undefined;
        };

        return claz;
    };

    var mergeMro = function(toMerge) {
        // C3 merge() implementation
        var __mro__ = [];
        var current = _.clone(toMerge);
        while (true) {
            var found = false;
            for (var i=0; i < current.length; i++) {
                if (current[i].length == 0)
                    continue;
                var currentClass = current[i][0];
                var isInTail = _.find(current, function(lst) {
                    return _.contains(_.rest(lst), currentClass);
                });
                if (! isInTail) {
                    found = true;
                    __mro__.push(currentClass);
                    current = _.map(current, function(lst) {
                        if (_.head(lst) === currentClass)
                            return _.rest(lst);
                        else
                            return lst;
                    });
                    break;
                }
            }
            if (found)
                continue;
            if (_.all(current, function(i) { return i.length ==0; }))
                return __mro__;
            throw new Exception("Cannot create a consistent method resolution order (MRO)");
        };
    };

    ring.instance = function(obj, type) {
        if (typeof(obj) === "object" && obj.$class &&
            typeof(type) === "function" && typeof(type.__class_id__) === "number") {
            return obj.$class.isSubClass(type);
        }
        return obj instanceof type;
    };

    return ring;
};
})();
