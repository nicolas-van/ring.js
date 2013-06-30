/*
Copyright (c) 2012, Nicolas Vanhoren
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met: 

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer. 
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function() {

if (typeof(define) !== "undefined") { // requirejs
    define(["underscore"], declare);
} else if (typeof(exports) !== "undefined") { // node
    var und = require("underscore")
    und.extend(exports, declare(und));
} else { // define global variable 'ring'
    ring = declare(_);
}

function declare(_) {
    var ring = {};
    ring.internal = {};

    /*
     * Modified Armin Ronacher's Classy library.
     *
     * Defines The Class object. That object can be used to define and inherit classes using
     * the $extend() method.
     *
     * Example:
     *
     * var Person = ring.Class.$extend({
     *  __init__: function(isDancing){
     *     this.dancing = isDancing;
     *   },
     *   dance: function(){
     *     return this.dancing;
     *   }
     * });
     *
     * The __init__() method act as a constructor. This class can be instancied this way:
     *
     * var person = new Person(true);
     * person.dance();
     *
     * The Person class can also be extended again:
     *
     * var Ninja = Person.$extend({
     *   __init__: function(){
     *     this.$super( false );
     *   },
     *   dance: function(){
     *     // Call the inherited version of dance()
     *     return this.$super();
     *   },
     *   swingSword: function(){
     *     return true;
     *   }
     * });
     *
     * When extending a class, each re-defined method can use this.$super() to call the previous
     * implementation of that method.
     */
    /**
    * Classy - classy classes for JavaScript
    *
    * :copyright: (c) 2011 by Armin Ronacher. 
    * :license: BSD.
    */
    (function(){
        var
            context = this,
            disable_constructor = false;

        /* we check if $super is in use by a class if we can.  But first we have to
         check if the JavaScript interpreter supports that.  This also matches
         to false positives later, but that does not do any harm besides slightly
         slowing calls down. */
        var probe_super = (function(){this.$super();}).toString().indexOf('$super') > 0;
        function usesSuper(obj) {
            return !probe_super || /\B\$super\b/.test(obj.toString());
        }

        /* helper function to set the attribute of something to a value or
         removes it if the value is undefined. */
        function setOrUnset(obj, key, value) {
            if (value === undefined)
                delete obj[key];
            else
                obj[key] = value;
        }

        /* gets the own property of an object */
        function getOwnProperty(obj, name) {
            return Object.prototype.hasOwnProperty.call(obj, name)
                ? obj[name] : undefined;
        }

        /* instanciate a class without calling the constructor */
        function cheapNew(cls) {
            disable_constructor = true;
            var rv = new cls;
            disable_constructor = false;
            return rv;
        }

        /* the base class we export */
        var Class = function() {};

        /* extend functionality */
        Class.$extend = function(properties) {
            var super_prototype = this.prototype;

            /* disable constructors and instanciate prototype.  Because the
               prototype can't raise an exception when created, we are safe
               without a try/finally here. */
            var prototype = cheapNew(this);

            /* copy all properties of the includes over if there are any */
            prototype.__mixin_ids = _.clone(prototype.__mixin_ids || {});
            if (properties.__include__)
                for (var i = 0, n = properties.__include__.length; i != n; ++i) {
                    var mixin = properties.__include__[i];
                    if (mixin instanceof ring.Mixin) {
                        _.extend(prototype.__mixin_ids, mixin.__mixin_ids);
                        mixin = mixin.__mixin_properties;
                    }
                    for (var name in mixin) {
                        var value = getOwnProperty(mixin, name);
                        if (value !== undefined)
                            prototype[name] = mixin[name];
                    }
                }

            /* copy class vars from the superclass */
            properties.__classvars__ = properties.__classvars__ || {};
            if (prototype.__classvars__)
                for (var key in prototype.__classvars__)
                    if (!properties.__classvars__[key]) {
                        var value = getOwnProperty(prototype.__classvars__, key);
                        properties.__classvars__[key] = value;
                    }

            /* copy all properties over to the new prototype */
            for (var name in properties) {
                var value = getOwnProperty(properties, name);
                if (name === '__include__' ||
                    value === undefined)
                    continue;

                prototype[name] = typeof value === 'function' && usesSuper(value) ?
                    (function(meth, name) {
                        return function() {
                            var old_super = getOwnProperty(this, '$super');
                            this.$super = super_prototype[name];
                            try {
                                return meth.apply(this, arguments);
                            }
                            finally {
                                setOrUnset(this, '$super', old_super);
                            }
                        };
                    })(value, name) : value
            }

            var class_init = this.__class_init__ || function() {};
            var p_class_init = prototype.__class_init__ || function() {};
            delete prototype.__class_init__;
            var n_class_init = function() {
                class_init.apply(null, arguments);
                p_class_init.apply(null, arguments);
            }
            n_class_init(prototype);

            /* dummy constructor */
            var instance = function() {
                if (disable_constructor)
                    return;
                var proper_this = context === this ? cheapNew(arguments.callee) : this;
                if (proper_this.__init__)
                    proper_this.__init__.apply(proper_this, arguments);
                proper_this.$class = instance;
                return proper_this;
            }

            /* copy all class vars over of any */
            for (var key in properties.__classvars__) {
                var value = getOwnProperty(properties.__classvars__, key);
                if (value !== undefined)
                    instance[key] = value;
            }

            /* copy prototype and constructor over, reattach $extend and
               return the class */
            instance.prototype = prototype;
            instance.constructor = instance;
            instance.$extend = this.$extend;
            instance.$withData = this.$withData;
            instance.__class_init__ = n_class_init;
            return instance;
        };

        /* instanciate with data functionality */
        Class.$withData = function(data) {
            var rv = cheapNew(this);
            for (var key in data) {
                var value = getOwnProperty(data, key);
                if (value !== undefined)
                    rv[key] = value;
            }
            return rv;
        };

        /* export the class */
        this.Class = Class;
    }).call(ring);
    // end of Armin Ronacher's code

    var mixinId = 1;
    ring.Mixin = ring.Class.$extend({
        __init__: function() {
            this.__mixin_properties = {};
            this.__mixin_id = mixinId;
            mixinId++;
            this.__mixin_ids = {};
            this.__mixin_ids[this.__mixin_id] = true;
            _.each(_.toArray(arguments), function(el) {
                if (el instanceof ring.Mixin) {
                    _.extend(this.__mixin_properties, el.__mixin_properties);
                    _.extend(this.__mixin_ids, el.__mixin_ids);
                } else { // object
                    _.extend(this.__mixin_properties, el)
                }
            }, this);
            _.extend(this, this.__mixin_properties);
        }
    });

    ring.Interface = ring.Mixin.$extend({
        __init__: function() {
            var lst = [];
            _.each(_.toArray(arguments), function(el) {
                if (el instanceof ring.Interface) {
                    lst.push(el);
                } else if (el instanceof ring.Mixin) {
                    var tmp = new ring.Interface(el.__mixin_properties);
                    tmp.__mixin_ids = el.__mixin_ids;
                    lst.push(tmp);
                } else { // object
                    var nprops = {};
                    _.each(el, function(v, k) {
                        nprops[k] = function() {
                            throw new ring.NotImplementedError();
                        };
                    });
                    lst.push(nprops);
                }
            });
            this.$super.apply(this, lst);
        }
    });

    ring.hasMixin = function(object, mixin) {
        if (! object)
            return false;
        return (object.__mixin_ids || {})[mixin.__mixin_id] === true;
    };

    var ErrorBase = function() {
    };
    ErrorBase.prototype = new Error();
    ErrorBase.$extend = ring.Class.$extend;
    ErrorBase.$withData = ring.Class.$withData;

    ring.Error = ErrorBase.$extend({
        name: "ring.Error",
        defaultMessage: "",
        __init__: function(message) {
            this.message = message || this.defaultMessage;
        }
    });

    ring.NotImplementedError = ring.Error.$extend({
        name: "ring.NotImplementedError",
        defaultMessage: "This method is not implemented"
    });

    ring.InvalidArgumentError = ring.Error.$extend({
        name: "ring.InvalidArgumentError"
    });

    return ring;
};
})();
