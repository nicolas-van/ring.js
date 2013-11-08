
(function() {
/* jshint es3: true */
"use strict";

if (typeof(exports) !== "undefined") { // nodejs
    _ = require("underscore");
}

test("base", function() {
    var C = ring.create({});
    deepEqual(C.__mro__, [C, ring.Object]);
});

test("objectSuper", function() {
    var A = ring.create({
        init: function() {
            this.a = "a";
            this.$super();
        }
    });
    var B = ring.create({
        init: function() {
            this.b = "b";
            this.$super();
        }
    });
    var C = ring.create([A, B], {});
    equal(new C().a, "a");
    equal(new C().b, "b");
    var D = ring.create([B, A], {});
    equal(new D().a, "a");
    equal(new D().b, "b");
});

test("mro", function() {
    var f = ring.create([], {});
    deepEqual(f.__mro__, [f, ring.Object]);
    var e = ring.create([], {});
    deepEqual(e.__mro__, [e, ring.Object]);
    var d = ring.create([], {});
    deepEqual(d.__mro__, [d, ring.Object]);

    var c = ring.create([d, f], {});
    deepEqual(c.__mro__, [c, d, f, ring.Object]);
    var b = ring.create([d, e], {});
    deepEqual(b.__mro__, [b, d, e, ring.Object]);

    var a = ring.create([b, c], {});
    deepEqual(a.__mro__, [a, b, c, d, e, f, ring.Object]);
});

test("inherit", function() {
    var A = ring.create({
        x: function() { return 1; }
    });
    var B = ring.create([A], {
        y: function() { return 2; }
    });
    equal(new A().x(), 1);
    equal(new B().x(), 1);
    equal(new B().y(), 2);
    var C = ring.create(A, {
        x: function() { return 3; }
    });
    equal(new C().x(), 3);
    var D = ring.create([A], {
        x: function() { return this.$super() + 5; }
    });
    equal(new D().x(), 6);
});

test("init", function() {
    var A = ring.create({
        init: function() {
            this.x = 3;
        }
    });
    equal(new A().x, 3);
});

test("instance", function() {
    var A = ring.create({});
    var B = ring.create([A], {});
    ok(ring.instance(new A(), A));
    ok(ring.instance(new B(), B));
    ok(ring.instance(new B(), A));
    ok(! ring.instance(new A(), B));

    ok(ring.instance([], Array));
    ok(! ring.instance([], A));
    ok(! ring.instance(new A(), Array));

    ok(ring.instance("", "string"));
    ok(ring.instance(function(){}, "function"));
    ok(ring.instance(2, "number"));
    ok(ring.instance({}, "object"));

});

test("classInit", function() {
    var A = ring.create({
        classInit: function(proto) {
            proto.x = 2;
        }
    });
    equal(new A().x, 2);
    var B = ring.create([A], {
        classInit: function(proto) {
            proto.y = 3;
        }
    });
    equal(new B().x, 2);
    equal(new B().y, 3);
});

test("exceptions", function() {
    var hasStack = false;
    try {
        throw new Error("");
    } catch(e) {
        if (e.stack)
            hasStack = true;
    }
    try {
        throw new ring.Error("test");
    } catch(e) {
        equal(e.message, "test");
        equal(e.name, "ring.Error");
        if (hasStack)
            ok(e.stack.length > 0);
        ok(!!e.toString);
        ok(ring.instance(e, Error));
        ok(ring.instance(e, ring.Error));
    }

    try {
        throw new ring.ValueError("test");
    } catch(e) {
        equal(e.message, "test");
        equal(e.name, "ring.ValueError");
        if (hasStack)
            ok(e.stack.length > 0);
        ok(!!e.toString);
        ok(ring.instance(e, Error));
        ok(ring.instance(e, ring.Error));
        ok(ring.instance(e, ring.ValueError));
    }
});

test("objectCreate", function() {
    function Array2() {
        Array.apply(this, arguments);
    }
    Array2.prototype = ring.__objectCreate(Array.prototype);
    Array2.prototype.constructor = Array2;
    var a = new Array2();
    ok(a instanceof Array2);
    ok(a instanceof Array);
    equal(a.constructor, Array2);
    function Array3() {
        Array2.apply(this, arguments);
    }
    Array3.prototype = ring.__objectCreate(Array2.prototype);
    Array3.prototype.constructor = Array3;
    var a3 = new Array3();
    ok(a3 instanceof Array3);
    ok(a3 instanceof Array2);
    ok(a3 instanceof Array);
    equal(a3.constructor, Array3);
});


})();