
module("Class");

test("base", function() {
    ok(!!ring.Class, "Class does exist");
    ok(!!ring.Class.$extend, "$extend does exist");
    var Claz = ring.Class.$extend({
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
    var Claz = ring.Class.$extend({
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
    var Claz = ring.Class.$extend({
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

module("Mixin");

test("base", function() {
    var test = false;
    var Switcher = new ring.Mixin({
        switch: function() {
            test = true;
        },
    });
    var Claz = ring.Class.$extend({
        __include__: [Switcher],
    });
    var obj = new Claz();
    obj.switch();
    equal(test, true);
});

test("extend", function() {
    var test = 0;
    var Switcher = new ring.Mixin({
        switch: function() {
            test = 1;
        },
    });
    var Switcher2 = new ring.Mixin(Switcher, {
        switch: function() {
            equal(test, 0);
            Switcher.switch.apply(this);
            equal(test, 1);
            test = 2;
        },
    });
    var Claz = ring.Class.$extend({
        __include__: [Switcher2],
    });
    var obj = new Claz();
    obj.switch();
    equal(test, 2);
});

test("interface", function() {
    var test = 0;
    var Switcher = new ring.Interface({
        switch: function() {},
    });
    var Claz = ring.Class.$extend({
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
    var Switcher = new ring.Interface({
        switch: function() {},
    });
    var Claz = ring.Class.$extend({
        __include__: [Switcher],
    });
    var obj = new Claz();
    try {
        obj.switch();
    } catch(e) {
        equal(e instanceof ring.NotImplementedError, true);
        test = 1;
    }
    equal(test, 1);
});

test("hasMixin", function() {
    var Mix = new ring.Mixin();
    var Mix2 = new ring.Mixin(Mix);
    var Claz = ring.Class.$extend({
        __include__: [Mix]
    });
    var Claz2 = ring.Class.$extend({
        __include__: [Mix2]
    });
    var Claz3 = Claz2.$extend({});
    equal(ring.hasMixin(new Claz(), Mix), true);
    equal(ring.hasMixin(new Claz(), Mix2), false);
    equal(ring.hasMixin(new Claz2(), Mix), true);
    equal(ring.hasMixin(new Claz2(), Mix2), true);
    equal(ring.hasMixin(new Claz3(), Mix), true);
    equal(ring.hasMixin(new Claz3(), Mix2), true);
});

module("Error");

test("base", function() {
    try {
        throw new ring.Error("my exception");
    } catch(ex) {
        equal(ex instanceof Error, true);
        equal(ex instanceof ring.Error, true);
        equal(ex.message, "my exception");
    }
});
test("inheritance", function() {
    var Ex1 = ring.Error.$extend({});
    var Ex2 = ring.Error.$extend({});
    try {
        throw new Ex1("my exception");
    } catch(ex) {
        equal(ex instanceof Error, true);
        equal(ex instanceof ring.Error, true);
        equal(ex instanceof Ex1, true);
        equal(ex instanceof Ex2, false);
        equal(ex.message, "my exception");
    }
    try {
        throw new Ex2("my exception");
    } catch(ex) {
        equal(ex instanceof Error, true);
        equal(ex instanceof ring.Error, true);
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
        throw new ring.Error("aie");
    } catch (e) {
        equal(e.message, message.replace("Error", "ring.Error"));
    }
});