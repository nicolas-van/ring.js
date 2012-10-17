/*
Copyright (c) 2012, Nicolas Vanhoren
Copyright (c) 2011, OpenERP S.A.
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

nova = (function() {
    var nova = {};
    nova.internal = {};

    /*
     * Modified Armin Ronacher's Classy library.
     *
     * Defines The Class object. That object can be used to define and inherit classes using
     * the $extend() method.
     *
     * Example:
     *
     * var Person = nova.Class.$extend({
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
        var probe_super = (function(){$super();}).toString().indexOf('$super') > 0;
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
            if (properties.__include__)
                for (var i = 0, n = properties.__include__.length; i != n; ++i) {
                    var mixin = properties.__include__[i];
                    if (mixin instanceof nova.Mixin) {
                        mixin = mixin.props;
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
    }).call(nova);
    // end of Armin Ronacher's code

    nova.Mixin = nova.Class.$extend({
        __init__: function() {
            this.props = {};
            _.each(_.toArray(arguments), function(el) {
                if (el instanceof nova.Mixin) {
                    _.extend(this.props, el.props);
                } else {
                    _.extend(this.props, el)
                }
            }, this);
        },
        call: function(newthis, fct_name) {
            return this.props[fct_name].apply(newthis, _.toArray(arguments).slice(2));
        }
    });

    nova.Interface = nova.Mixin.$extend({
        __init__: function(props) {
            var nprops = {};
            _.each(props, function(v, k) {
                if (typeof v === "function") {
                    nprops[k] = function() {
                        throw new nova.NotImplementedError();
                    };
                } else {
                    throw new nova.InvalidArgumentError("Any other type than function is not supported in interfaces.");
                }
            });
            this.$super(nprops);
        }
    });

    var ErrorBase = function() {
    };
    ErrorBase.prototype = new window.Error();
    ErrorBase.$extend = nova.Class.$extend;
    ErrorBase.$withData = nova.Class.$withData;

    nova.Error = ErrorBase.$extend({
        name: "nova.Error",
        defaultMessage: "",
        __init__: function(message) {
            this.message = message || this.defaultMessage;
        }
    });

    nova.NotImplementedError = nova.Error.$extend({
        name: "nova.NotImplementedError",
        defaultMessage: "This method is not implemented"
    });

    nova.InvalidArgumentError = nova.Error.$extend({
        name: "nova.InvalidArgumentError"
    });

    /**
     * Mixin to express the concept of destroying an object.
     * When an object is destroyed, it should release any resource
     * it could have reserved before.
     */
    nova.Destroyable = new nova.Mixin({
        __init__: function() {
            this.__destroyableDestroyed = false;
        },
        /**
         * Returns true if destroy() was called on the current object.
         */
        isDestroyed : function() {
            return this.__destroyableDestroyed;
        },
        /**
         * Inform the object it should destroy itself, releasing any
         * resource it could have reserved.
         */
        destroy : function() {
            this.__destroyableDestroyed = true;
        }
    });

    /**
     * Mixin to structure objects' life-cycles folowing a parent-children
     * relationship. Each object can a have a parent and multiple children.
     * When an object is destroyed, all its children are destroyed too.
     */
    nova.Parented = new nova.Mixin(nova.Destroyable, {
        __parentedMixin : true,
        __init__: function() {
            nova.Destroyable.call(this, "__init__");
            this.__parentedChildren = [];
            this.__parentedParent = null;
        },
        /**
         * Set the parent of the current object. When calling this method, the
         * parent will also be informed and will return the current object
         * when its getChildren() method is called. If the current object did
         * already have a parent, it is unregistered before, which means the
         * previous parent will not return the current object anymore when its
         * getChildren() method is called.
         */
        setParent : function(parent) {
            if (this.getParent()) {
                if (this.getParent().__parentedMixin) {
                    this.getParent().__parentedChildren = _.without(this
                            .getParent().getChildren(), this);
                }
            }
            this.__parentedParent = parent;
            if (parent && parent.__parentedMixin) {
                parent.__parentedChildren.push(this);
            }
        },
        /**
         * Return the current parent of the object (or null).
         */
        getParent : function() {
            return this.__parentedParent;
        },
        /**
         * Return a list of the children of the current object.
         */
        getChildren : function() {
            return _.clone(this.__parentedChildren);
        },
        destroy : function() {
            _.each(this.getChildren(), function(el) {
                el.destroy();
            });
            this.setParent(undefined);
            nova.Destroyable.call(this, "destroy");
        }
    });

    /*
     * Yes, we steal Backbone's events :)
     * 
     * This class just handle the dispatching of events, it is not meant to be extended,
     * nor used directly. All integration with parenting and automatic unregistration of
     * events is done in the mixin EventDispatcher.
     */
    // (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
    // Backbone may be freely distributed under the MIT license.
    // For all details and documentation:
    // http://backbonejs.org
    nova.internal.Events = nova.Class.$extend({
        on : function(events, callback, context) {
            var ev;
            events = events.split(/\s+/);
            var calls = this._callbacks || (this._callbacks = {});
            while (ev = events.shift()) {
                var list = calls[ev] || (calls[ev] = {});
                var tail = list.tail || (list.tail = list.next = {});
                tail.callback = callback;
                tail.context = context;
                list.tail = tail.next = {};
            }
            return this;
        },
        off : function(events, callback, context) {
            var ev, calls, node;
            if (!events) {
                delete this._callbacks;
            } else if (calls = this._callbacks) {
                events = events.split(/\s+/);
                while (ev = events.shift()) {
                    node = calls[ev];
                    delete calls[ev];
                    if (!callback || !node)
                        continue;
                    while ((node = node.next) && node.next) {
                        if (node.callback === callback
                                && (!context || node.context === context))
                            continue;
                        this.on(ev, node.callback, node.context);
                    }
                }
            }
            return this;
        },
        callbackList: function() {
            var lst = [];
            _.each(this._callbacks || {}, function(el, eventName) {
                var node = el;
                while ((node = node.next) && node.next) {
                    lst.push([eventName, node.callback, node.context]);
                }
            });
            return lst;
        },
        trigger : function(events) {
            var event, node, calls, tail, args, all, rest;
            if (!(calls = this._callbacks))
                return this;
            all = calls['all'];
            (events = events.split(/\s+/)).push(null);
            // Save references to the current heads & tails.
            while (event = events.shift()) {
                if (all)
                    events.push({
                        next : all.next,
                        tail : all.tail,
                        event : event
                    });
                if (!(node = calls[event]))
                    continue;
                events.push({
                    next : node.next,
                    tail : node.tail
                });
            }
            rest = Array.prototype.slice.call(arguments, 1);
            while (node = events.pop()) {
                tail = node.tail;
                args = node.event ? [ node.event ].concat(rest) : rest;
                while ((node = node.next) !== tail) {
                    node.callback.apply(node.context || this, args);
                }
            }
            return this;
        }
    });
    // end of Backbone's events class
    
    nova.EventDispatcher = new nova.Mixin(nova.Parented, {
        __eventDispatcherMixin: true,
        __init__: function() {
            nova.Parented.call(this, "__init__");
            this.__edispatcherEvents = new nova.internal.Events();
            this.__edispatcherRegisteredEvents = [];
        },
        on: function(events, dest, func) {
            var self = this;
            events = events.split(/\s+/);
            _.each(events, function(eventName) {
                self.__edispatcherEvents.on(eventName, func, dest);
                if (dest && dest.__eventDispatcherMixin) {
                    dest.__edispatcherRegisteredEvents.push({name: eventName, func: func, source: self});
                }
            });
            return this;
        },
        off: function(events, dest, func) {
            var self = this;
            events = events.split(/\s+/);
            _.each(events, function(eventName) {
                self.__edispatcherEvents.off(eventName, func, dest);
                if (dest && dest.__eventDispatcherMixin) {
                    dest.__edispatcherRegisteredEvents = _.filter(dest.__edispatcherRegisteredEvents, function(el) {
                        return !(el.name === eventName && el.func === func && el.source === self);
                    });
                }
            });
            return this;
        },
        trigger: function(events) {
            this.__edispatcherEvents.trigger.apply(this.__edispatcherEvents, arguments);
            return this;
        },
        destroy: function() {
            var self = this;
            _.each(this.__edispatcherRegisteredEvents, function(event) {
                event.source.__edispatcherEvents.off(event.name, event.func, self);
            });
            this.__edispatcherRegisteredEvents = [];
            _.each(this.__edispatcherEvents.callbackList(), function(cal) {
                this.off(cal[0], cal[2], cal[1]);
            }, this);
            this.__edispatcherEvents.off();
            nova.Parented.call(this, "destroy");
        }
    });
    
    nova.Properties = new nova.Mixin(nova.EventDispatcher, {
        __class_init__: function(proto) {
            var props = {};
            _.each(proto.__properties || {}, function(v, k) {
                props[k] = _.clone(v);
            });
            _.each(proto, function(v, k) {
                if (typeof v === "function") {
                    var res = /^((?:get)|(?:set))([A-Z]\w*)$/.exec(k);
                    if (! res)
                        return;
                    var name = res[2][0].toLowerCase() + res[2].slice(1);
                    var prop = props[name] || (props[name] = {});
                    prop[res[1]] = v;
                }
            });
            proto.__properties = props;
        },
        __init__: function() {
            nova.EventDispatcher.call(this, "__init__");
            this.__getterSetterInternalMap = {};
        },
        set: function(map) {
            var self = this;
            var changed = false;
            var tmp_set = this.__props_setting;
            this.__props_setting = false;
            _.each(map, function(val, key) {
                var prop = self.__properties[key];
                if (prop) {
                    if (! prop.set)
                        throw new nova.InvalidArgumentError("Property " + key + " does not have a setter method.");
                    prop.set.call(self, val);
                } else {
                    var tmp = self.__getterSetterInternalMap[key];
                    if (tmp === val)
                        return;
                    changed = true;
                    self.__getterSetterInternalMap[key] = val;
                    self.trigger("change:" + key, self, {
                        oldValue: tmp,
                        newValue: val
                    });
                }
            });
            this.__props_setting = tmp_set;
            if (! this.__props_setting && this.__props_setted) {
                this.__props_setted = false;
                self.trigger("change", self);
            }
        },
        get: function(key) {
            var prop = this.__properties[key];
            if (prop) {
                if (! prop.get)
                    throw new nova.InvalidArgumentError("Property " + key + " does not have a getter method.");
                return prop.get.call(this);
            } else {
                return this.__getterSetterInternalMap[key];
            }
        },
        trigger: function(name) {
            nova.EventDispatcher.call.apply(nova.EventDispatcher, [this, "trigger"].concat(_.toArray(arguments)));
            if (/(\s|^)change\:.*/.exec(name)) {
                if (! this.__props_setting)
                    this.trigger("change");
                else
                    this.__props_setted = true;
            }
        }
    });
    
    nova.Widget = nova.Class.$extend({
        __include__ : [nova.Properties],
        /**
         * Tag name when creating a default $element.
         * @type string
         */
        tagName: 'div',
        /**
         * Constructs the widget and sets its parent if a parent is given.
         *
         * @constructs openerp.web.Widget
         * @extends openerp.web.CallbackEnabled
         *
         * @param {openerp.web.Widget} parent Binds the current instance to the given Widget instance.
         * When that widget is destroyed by calling destroy(), the current instance will be
         * destroyed too. Can be null.
         * @param {String} element_id Deprecated. Sets the element_id. Only useful when you want
         * to bind the current Widget to an already existing part of the DOM, which is not compatible
         * with the DOM insertion methods provided by the current implementation of Widget. So
         * for new components this argument should not be provided any more.
         */
        __init__: function(parent) {
            nova.Properties.call(this, "__init__");
            this.$element = $(document.createElement(this.tagName));
    
            this.setParent(parent);
        },
        /**
         * Destroys the current widget, also destroys all its children before destroying itself.
         */
        destroy: function() {
            _.each(this.getChildren(), function(el) {
                el.destroy();
            });
            if(this.$element != null) {
                this.$element.remove();
            }
            nova.Properties.call(this, "destroy");
        },
        /**
         * Renders the current widget and appends it to the given jQuery object or Widget.
         *
         * @param target A jQuery object or a Widget instance.
         */
        appendTo: function(target) {
            var self = this;
            return this.__widgetRenderAndInsert(function(t) {
                self.$element.appendTo(t);
            }, target);
        },
        /**
         * Renders the current widget and prepends it to the given jQuery object or Widget.
         *
         * @param target A jQuery object or a Widget instance.
         */
        prependTo: function(target) {
            var self = this;
            return this.__widgetRenderAndInsert(function(t) {
                self.$element.prependTo(t);
            }, target);
        },
        /**
         * Renders the current widget and inserts it after to the given jQuery object or Widget.
         *
         * @param target A jQuery object or a Widget instance.
         */
        insertAfter: function(target) {
            var self = this;
            return this.__widgetRenderAndInsert(function(t) {
                self.$element.insertAfter(t);
            }, target);
        },
        /**
         * Renders the current widget and inserts it before to the given jQuery object or Widget.
         *
         * @param target A jQuery object or a Widget instance.
         */
        insertBefore: function(target) {
            var self = this;
            return this.__widgetRenderAndInsert(function(t) {
                self.$element.insertBefore(t);
            }, target);
        },
        /**
         * Renders the current widget and replaces the given jQuery object.
         *
         * @param target A jQuery object or a Widget instance.
         */
        replace: function(target) {
            return this.__widgetRenderAndInsert(_.bind(function(t) {
                this.$element.replaceAll(t);
            }, this), target);
        },
        __widgetRenderAndInsert: function(insertion, target) {
            this.renderElement();
            insertion(target);
            return this.start();
        },
        /**
         * This is the method to implement to render the Widget.
         */
        renderElement: function() {},
        /**
         * Method called after rendering. Mostly used to bind actions, perform asynchronous
         * calls, etc...
         *
         * By convention, the method should return a promise to inform the caller when
         * this widget has been initialized.
         *
         * @returns {jQuery.Deferred}
         */
        start: function() {}
    });

    return nova;
})();
