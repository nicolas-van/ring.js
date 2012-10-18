
module("Class");

test("base", function() {
    ok(!!nova.Class, "Class does exist");
    ok(!!nova.Class.$extend, "$extend does exist");
    var Claz = nova.Class.$extend({
        test: function() {
            return "ok";
        }
    });
    equal(new Claz().test(), "ok");
    var Claz2 = Claz.$extend({
        test: function() {
            return this.$super() + "2";
        }
    });
    equal(new Claz2().test(), "ok2");
});

test("class_init", function() {
    var test = 0;
    var Claz = nova.Class.$extend({
        testf: function() {}
    });
    var executed = false;
    var Claz2 = Claz.$extend({
        __class_init__: function(proto) {
            executed = true;
            var foundTestf = false;
            _.each(proto, function(el, k) {
                if (k === "testf")
                    foundTestf = true;
            });
            equal(foundTestf, false);
            proto.testf2 = function() {
                test = 2;
            }
        },
        testf2: function() {
            test = 1;
        }
    });
    equal(executed, true);
    new Claz2().testf2();
    equal(test, 2);
});
test("class_init_recursive", function() {
    var test = 0;
    var Claz = nova.Class.$extend({
        __class_init__: function(proto) {
            _.each(_.keys(proto), function(k) {
                proto[k] = function() {
                    test = 1;
                }
            });
        },
    });
    var Claz2 = Claz.$extend({
        test: function() {}
    });
    new Claz2().test();
    equal(test, 1);
});

module("Destroyable");

test("base", function() {
    var Claz = nova.Class.$extend({
        __include__: [nova.Destroyable],
    });
    var x = new Claz();
    equal(!!x.isDestroyed(), false);
    x.destroy();
    equal(x.isDestroyed(), true);
});

module("Parented");

test("base", function() {
    var Claz = nova.Class.$extend({
        __include__: [nova.Parented],
    });
    var x = new Claz();
    var y = new Claz();
    y.setParent(x);
    equal(y.getParent(), x);
    equal(x.getChildren()[0], y);
    x.destroy();
    equal(y.isDestroyed(), true);
});

module("Events");

test("base", function() {
    var x = new nova.internal.Events();
    var tmp = 0;
    var fct = function() {tmp = 1;};
    x.on("test", fct);
    equal(tmp, 0);
    x.trigger("test");
    equal(tmp, 1);
    tmp = 0;
    x.off("test", fct);
    x.trigger("test");
    equal(tmp, 0);
});

module("EventDispatcher");

test("base", function() {
    var Claz = nova.Class.$extend({
        __include__: [nova.EventDispatcher],
    });
    var x = new Claz();
    var y = new Claz();
    var tmp = 0;
    var fct = function() {tmp = 1;};
    x.on("test", y, fct);
    equal(tmp, 0);
    x.trigger("test");
    equal(tmp, 1);
    tmp = 0;
    x.off("test", y, fct);
    x.trigger("test");
    equal(tmp, 0);
    tmp = 0;
    x.on("test", y, fct);
    y.destroy();
    x.trigger("test");
    equal(tmp, 0);
});
test("memoryLeak", function() {
    var Claz = nova.Class.$extend({
        __include__: [nova.EventDispatcher],
    });
    var x = new Claz();
    var y = new Claz();
    equal(x.__edispatcherRegisteredEvents.length, 0);
    equal(y.__edispatcherRegisteredEvents.length, 0);
    var fct = function() {};
    x.on("test", y, fct);
    equal(x.__edispatcherRegisteredEvents.length, 0);
    equal(y.__edispatcherRegisteredEvents.length, 1);
    y.destroy();
    equal(x.__edispatcherRegisteredEvents.length, 0);
    equal(y.__edispatcherRegisteredEvents.length, 0);

    var x = new Claz();
    var y = new Claz();
    equal(x.__edispatcherRegisteredEvents.length, 0);
    equal(y.__edispatcherRegisteredEvents.length, 0);
    var fct = function() {};
    x.on("test", y, fct);
    equal(x.__edispatcherRegisteredEvents.length, 0);
    equal(y.__edispatcherRegisteredEvents.length, 1);
    x.destroy();
    equal(x.__edispatcherRegisteredEvents.length, 0);
    equal(y.__edispatcherRegisteredEvents.length, 0);
});

module("Properties");

test("base", function() {
    var Claz = nova.Class.$extend({
        __include__: [nova.DynamicProperties],
        getStuff: function() {
            return this.stuff;
        },
        setStuff: function(val) {
            this.stuff = val;
        }
    });
    var Claz2 = Claz.$extend({});
    var x = new Claz();
    x.set("stuff", "stuff");
    equal(x.get("stuff"), "stuff");
});

module("DynamicProperties");

test("base", function() {
    var Claz = nova.Class.$extend({
        __include__: [nova.DynamicProperties],
    });
    var x = new Claz();
    var y = new Claz();
    x.set({test: 1});
    equal(x.get("test"), 1);
    var tmp = 0;
    x.on("change:test", y, function(model, options) {
        tmp = 1;
        equal(options.oldValue, 1);
        equal(options.newValue, 2);
        equal(x.get("test"), 2);
        equal(model, x);
    });
    x.set({test: 2});
    equal(tmp, 1);
});

test("change event only when changed", function() {
    var Claz = nova.Class.$extend({
        __include__: [nova.DynamicProperties],
    });
    var x = new Claz();
    var exec1 = false;
    var exec2 = false;
    x.on("change:test", null, function() {exec1 = true;});
    x.on("change", null, function() {exec2 = true;});
    x.set({"test": 3});
    equal(exec1, true);
    equal(exec2, true);
    exec1 = false;
    exec2 = false;
    x.set({"test": 3});
    equal(exec1, false);
    equal(exec2, false);
});

module("Widget");

test("base", function() {
    var Claz = nova.Widget.$extend({
        tagName: "span",
        className: "mytestspan",
        attributes: {
            "id": "testspan"
        },
        render: function() {
            this.$().html("test");
        }
    });
    var x = new Claz();
    x.appendTo($("body"));
    var $el = $("#testspan");
    equal($el.length, 1);
    equal($el.parents()[0], $("body")[0]);
    equal($el.html(), "test");
    equal($el[0], $("span.mytestspan")[0]);
    
    var y = new Claz(x);
    equal(y.getParent(), x);
    
    x.destroy();
    $el = $("#testspan");
    equal($el.length, 0);
});

test("events", function() {
    var test = 0;
    var Claz = nova.Widget.$extend({
        events: {
            "testevent": function() {
                test = 1;
            },
            "testevent2 .testspan": function() {
                test = 2;
            }
        },
        render: function() {
            this.$().html("<span class='testspan'></span>");
        }
    });
    var x = new Claz();
    x.appendTo($("body"));
    equal(test, 0);
    x.$().trigger("testevent");
    equal(test, 1);
    x.$(".testspan").trigger("testevent2");
    equal(test, 2);
});

module("Mixin");

test("base", function() {
    var test = false;
    var Switcher = new nova.Mixin({
        switch: function() {
            test = true;
        },
    });
    var Claz = nova.Class.$extend({
        __include__: [Switcher],
    });
    var obj = new Claz();
    obj.switch();
    equal(test, true);
});

test("extend", function() {
    var test = 0;
    var Switcher = new nova.Mixin({
        switch: function() {
            test = 1;
        },
    });
    var Switcher2 = new nova.Mixin(Switcher, {
        switch: function() {
            equal(test, 0);
            Switcher.switch.apply(this);
            equal(test, 1);
            test = 2;
        },
    });
    var Claz = nova.Class.$extend({
        __include__: [Switcher2],
    });
    var obj = new Claz();
    obj.switch();
    equal(test, 2);
});

test("interface", function() {
    var test = 0;
    var Switcher = new nova.Interface({
        switch: function() {},
    });
    var Claz = nova.Class.$extend({
        __include__: [Switcher],
        switch: function() {
            test = 1;
        }
    });
    var obj = new Claz();
    obj.switch();
    equal(test, 1);
});

test("interface_unimplemented", function() {
    var test = 0;
    var Switcher = new nova.Interface({
        switch: function() {},
    });
    var Claz = nova.Class.$extend({
        __include__: [Switcher],
    });
    var obj = new Claz();
    try {
        obj.switch();
    } catch(e) {
        equal(e instanceof nova.NotImplementedError, true);
        test = 1;
    }
    equal(test, 1);
});

module("Error");

test("base", function() {
    try {
        throw new nova.Error("my exception");
    } catch(ex) {
        equal(ex instanceof Error, true);
        equal(ex instanceof nova.Error, true);
        equal(ex.message, "my exception");
    }
});
test("inheritance", function() {
    var Ex1 = nova.Error.$extend({});
    var Ex2 = nova.Error.$extend({});
    try {
        throw new Ex1("my exception");
    } catch(ex) {
        equal(ex instanceof Error, true);
        equal(ex instanceof nova.Error, true);
        equal(ex instanceof Ex1, true);
        equal(ex instanceof Ex2, false);
        equal(ex.message, "my exception");
    }
    try {
        throw new Ex2("my exception");
    } catch(ex) {
        equal(ex instanceof Error, true);
        equal(ex instanceof nova.Error, true);
        equal(ex instanceof Ex1, false);
        equal(ex instanceof Ex2, true);
        equal(ex.message, "my exception");
    }
});
test("debug", function() {
    var message;
    try {
        throw new Error("aie");
    } catch (e) {
        message = e.message;
    }
    try {
        throw new nova.Error("aie");
    } catch (e) {
        equal(e.message, message.replace("Error", "nova.Error"));
    }
});