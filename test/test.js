
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

module("Properties");

test("base", function() {
    var Claz = nova.Class.$extend({
        __include__: [nova.Properties],
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
        __include__: [nova.Properties],
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
        renderElement: function() {
            this.$element.attr("id", "testdiv");
            this.$element.html("test");
        }
    });
    var x = new Claz();
    x.appendTo($("body"));
    var $el = $("#testdiv");
    equal($el.length, 1);
    equal($el.parents()[0], $("body")[0]);
    equal($el.html(), "test");
    
    var y = new Claz(x);
    equal(y.getParent(), x);
    
    x.destroy();
    $el = $("#testdiv");
    equal($el.length, 0);
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
            Switcher.call(this, 'switch');
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
        equal(e instanceof Error, true);
        test = 1;
    }
    equal(test, 1);
});
