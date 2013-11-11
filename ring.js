/*
Ring.js version

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
/* jshint es3: true */
"use strict";

if (typeof(exports) !== "undefined") { // nodejs
    var underscore = require("underscore");
    underscore.extend(exports, declare(underscore));
} else if (typeof(define) !== "undefined") { // amd
    define(["underscore"], declare);
} else { // define global variable
    window.ring = declare(_);
}


function declare(_) {
    var ring = {};

    function RingObject() {}
    /**
        ring.Object

        The base class of all other classes. It doesn't have much uses except
        testing testing if an object uses the Ring.js class system using
        ring.instance(x, ring.Object)
    */
    ring.Object = RingObject;
    _.extend(ring.Object, {
        __mro__: [ring.Object],
        __properties__: {init: function() {}},
        __classId__: 1,
        __parents__: [],
        __classIndex__: {"1": ring.Object},
        isSubClass: function(other) {
            return this.__classIndex__[other.__classId__] !== undefined;
        }
    });
    _.extend(ring.Object.prototype, {
        init: ring.Object.__properties__.init
    });

    var objectCreate = function(o) {
        function CreatedObject(){}
        if (o !== undefined)
            CreatedObject.prototype = o;
        var tmp = new CreatedObject();
        tmp.__proto__ = o;
        return tmp;
    };
    ring.__objectCreate = objectCreate;

    var classCounter = 3;
    var fnTest = /xyz/.test(function(){xyz();}) ? /\$super\b/ : /.*/;

    /**
        ring.create([parents,] properties)

        Creates a new class and returns it.

        properties is a dictionary of the methods and attributes that should
        be added to the new class' prototype.

        parents is a list of the classes this new class should extend. If not
        specified or an empty list is specified this class will inherit from one
        class: ring.Object.
    */
    ring.create = function() {
        // arguments parsing
        var args = _.toArray(arguments);
        args.reverse();
        var props = args[0];
        var parents = args.length >= 2 ? args[1] : [];
        if (! parents instanceof Array)
            parents = [parents];
        if (parents.length === 0)
            parents = [ring.Object];
        var id = classCounter++;
        // create real class
        var claz = function Instance() {
            this.$super = null;
            this.init.apply(this, arguments);
        };
        claz.__properties__ = props;
        // mro creation
        var toMerge = _.pluck(parents, "__mro__");
        toMerge = toMerge.concat([parents]);
        var __mro__ = [claz].concat(mergeMro(toMerge));
        //generate prototype
        var prototype = undefined;
        _.each(_.clone(__mro__).reverse(), function(claz) {
            if (prototype !== undefined)
                prototype.constructor = claz;
            var current = objectCreate(prototype);
            _.extend(current, claz.__properties__);
            _.each(_.keys(current), function(key) {
                var p = current[key];
                if (typeof p !== "function" || ! fnTest.test(p))
                    return;
                current[key] = (function(name, fct, supProto) {
                    return function() {
                        var tmp = this.$super;
                        this.$super = supProto[name];
                        try {
                            var ret = fct.apply(this, arguments);
                            return ret;
                        } finally {
                            this.$super = tmp;
                        }
                    };
                })(key, p, prototype);
            });
            prototype = current;
        });
        // remaining operations
        claz.__mro__ = __mro__;
        claz.__parents__ = parents;
        claz.prototype = prototype;
        claz.prototype.constructor = claz;
        claz.__classId__ = id;
        // construct classes index
        claz.__classIndex__ = {};
        _.each(claz.__mro__, function(c) {
            claz.__classIndex__[c.__classId__] = c;
        });
        claz.isSubClass = ring.Object.isSubClass;
        // class init
        if (claz.prototype.classInit) {
            claz.__classInit__ = claz.prototype.classInit;
            delete claz.prototype.classInit;
        }
        _.each(_.chain(claz.__mro__).clone().reverse().value(), function(c) {
            if (c.__classInit__) {
                var ret = c.__classInit__(claz.prototype);
                if (ret !== undefined)
                    claz.prototype = ret;
            }
        });

        return claz;
    };

    var mergeMro = function(toMerge) {
        /* jshint loopfunc:true */
        // C3 merge() implementation
        var __mro__ = [];
        var current = _.clone(toMerge);
        while (true) {
            var found = false;
            for (var i=0; i < current.length; i++) {
                if (current[i].length === 0)
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
            if (_.all(current, function(i) { return i.length === 0; }))
                return __mro__;
            throw new ring.ValueError("Cannot create a consistent method resolution order (MRO)");
        }
    };

    /**
        ring.instance(obj, type)

        Returns true if obj is an instance of type or an instance of a sub-class of type.

        It is necessary to use this method instead of instanceof when using the Ring.js class
        system because instanceof will not be able to detect sub-classes.

        If used with obj or type that do not use the Ring.js class system this method will
        use instanceof instead. So it should be safe to replace all usages of instanceof
        by ring.instance() in any program, whether or not it uses Ring.js.

        Additionaly this method allows to test the type of simple JavaScript types like strings.
        To do so, pass a string instead of a type as second argument. Examples:

            ring.instance("", "string") // returns true
            ring.instance(function() {}, "function") // returns true
            ring.instance({}, "object") // returns true
            ring.instance(1, "number") // returns true
    */
    ring.instance = function(obj, type) {
        if (typeof(obj) === "object" && obj.constructor && obj.constructor.isSubClass &&
            typeof(type) === "function" && typeof(type.__classId__) === "number") {
            return obj.constructor.isSubClass(type);
        }
        if (typeof(type) === "string")
            return typeof(obj) === type;
        return obj instanceof type;
    };

    /**
        A class to easily create new classes representing exceptions. This class is special
        because it is a sub-class of the standard Error class of JavaScript. Examples:

        ring.instance(e, Error)

        e instanceof Error

        This two expressions will always be true if e is an instance of ring.Error or any
        sub-class of ring.Error.

    */
    ring.Error = ring.create({
        /**
            The name attribute is used in the default implementation of the toString() method
            of the standard JavaScript Error class. According to the standard, all sub-classes
            of Error should define a new name.
        */
        name: "ring.Error",
        /**
            A default message to use in instances of this class if there is no arguments given
            to the constructor.
        */
        defaultMessage: "",
        /**
            Constructor arguments:

            message: The message to put in the instance. If there is no message specified, the
            message will be this.defaultMessage.
        */
        init: function(message) {
            this.message = message || this.defaultMessage;
        },
        classInit: function(prototype) {
            // some black magic to reconstitute a complete prototype chain
            // with Error at the end
            var protos = [];
            var gather = function(proto) {
                if (proto.__proto__ === Object.prototype)
                    return;
                protos.push(proto);
                gather(proto.__proto__);
            };
            gather(prototype);
            var current = new Error();
            _.each(_.clone(protos).reverse(), function(proto) {
                var tmp = objectCreate(current);
                _.extend(tmp, proto);
                current = tmp;
            });
            current.constructor = prototype.constructor;
            return current;
        }
    });

    /**
        A type of exception to inform that a method received an argument with an incorrect value.
    */
    ring.ValueError = ring.create([ring.Error], {
        name: "ring.ValueError"
    });

    return ring;
}
})();
