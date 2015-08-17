
(function() {
/* jshint es3: true, proto: true */
"use strict";

if (typeof(module) !== "undefined") {
    global.dejavu = require("dejavu");
    global.ring = require("./ring");
    global.assert = require("assert");
    global.klass = require("klass");
    global.Class = require("resig-class");
    global.jsface = require("jsface");
    global._ = require("underscore");
    global.Backbone = require("backbone");
}

test("base", function() {
    var C = ring.create({});
    assert.deepEqual(C.__mro__, [C, ring.Object]);
});

test("objectSuper", function() {
    var A = ring.create({
        constructor: function() {
            this.a = "a";
            this.$super();
        }
    });
    var B = ring.create({
        constructor: function() {
            this.b = "b";
            this.$super();
        }
    });
    var C = ring.create([A, B], {});
    assert.equal(new C().a, "a");
    assert.equal(new C().b, "b");
    var D = ring.create([B, A], {});
    assert.equal(new D().a, "a");
    assert.equal(new D().b, "b");
});

test("ringSuper", function() {
    var A = ring.create({
        constructor: function() {
            this.a = "a";
            ring.getSuper(A, this, "constructor")();
        }
    });
    var B = ring.create({
        constructor: function() {
            this.b = "b";
            ring.getSuper(B, this, "constructor")();
        }
    });
    var C = ring.create([A, B], {});
    assert.equal(new C().a, "a");
    assert.equal(new C().b, "b");
    var D = ring.create([B, A], {});
    assert.equal(new D().a, "a");
    assert.equal(new D().b, "b");
    var X = ring.create({
        val: function() {
            return "x";
        }
    });
    var Y = ring.create(X, {
        val: function() {
            return "y";
        },
        origVal: function() {
            return ring.getSuper(Y, this, "val")();
        }
    });
    assert.equal(new Y().val(), "y");
    assert.equal(new Y().origVal(), "x");
});

test("mro", function() {
    var f = ring.create([], {});
    assert.deepEqual(f.__mro__, [f, ring.Object]);
    var e = ring.create([], {});
    assert.deepEqual(e.__mro__, [e, ring.Object]);
    var d = ring.create([], {});
    assert.deepEqual(d.__mro__, [d, ring.Object]);

    var c = ring.create([d, f], {});
    assert.deepEqual(c.__mro__, [c, d, f, ring.Object]);
    var b = ring.create([d, e], {});
    assert.deepEqual(b.__mro__, [b, d, e, ring.Object]);

    var a = ring.create([b, c], {});
    assert.deepEqual(a.__mro__, [a, b, c, d, e, f, ring.Object]);
});

test("inherit", function() {
    var A = ring.create({
        x: function() { return 1; }
    });
    var B = ring.create(A, {
        y: function() { return 2; }
    });
    assert.equal(new A().x(), 1);
    assert.equal(new B().x(), 1);
    assert.equal(new B().y(), 2);
    var C = ring.create(A, {
        x: function() { return 3; }
    });
    assert.equal(new C().x(), 3);
    var D = ring.create(A, {
        x: function() { return this.$super() + 5; }
    });
    assert.equal(new D().x(), 6);
});

test("constructor", function() {
    var A = ring.create({
        constructor: function() {
            this.x = 3;
        }
    });
    assert.equal(new A().x, 3);
});

test("instance", function() {
    var A = ring.create({});
    var B = ring.create(A, {});
    assert(ring.instance(new A(), A));
    assert(ring.instance(new B(), B));
    assert(ring.instance(new B(), A));
    assert(! ring.instance(new A(), B));

    assert(ring.instance([], Array));
    assert(! ring.instance([], A));
    assert(! ring.instance(new A(), Array));

    assert(ring.instance("", "string"));
    assert(ring.instance(function(){}, "function"));
    assert(ring.instance(2, "number"));
    assert(ring.instance({}, "object"));

    assert(! ring.instance(null, A));

});

test("classInit", function() {
    var A = ring.create({
        classInit: function(proto) {
            proto.x = 2;
        }
    });
    assert.equal(new A().x, 2);
    var B = ring.create(A, {
        classInit: function(proto) {
            proto.y = 3;
        }
    });
    assert.equal(new B().x, 2);
    assert.equal(new B().y, 3);
});

test("classInit - called once", function() {
    var tmp = 0;
    var A = ring.create({
        classInit: function(proto) {
            tmp += 1;
        }
    });
    assert.equal(tmp, 1);
    tmp = 0;
    var B = ring.create(A, {});
    assert.equal(tmp, 1);
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
        assert.equal(e.message, "test");
        assert.equal(e.name, "ring.Error");
        if (hasStack)
            assert(e.stack.length > 0);
        assert(!!e.toString);
        assert(ring.instance(e, Error));
        assert(ring.instance(e, ring.Error));
    }

    try {
        throw new ring.ValueError("test");
    } catch(e) {
        assert.equal(e.message, "test");
        assert.equal(e.name, "ring.ValueError");
        if (hasStack)
            assert(e.stack.length > 0);
        assert(!!e.toString);
        assert(ring.instance(e, Error));
        assert(ring.instance(e, ring.Error));
        assert(ring.instance(e, ring.ValueError));
    }
});

test("objectCreate", function() {
    function Array2() {
        Array.apply(this, arguments);
    }
    Array2.prototype = ring.__objectCreate(Array.prototype);
    Array2.prototype.constructor = Array2;
    var a = new Array2();
    assert(a instanceof Array2);
    assert(a instanceof Array);
    assert.equal(a.constructor, Array2);
    function Array3() {
        Array2.apply(this, arguments);
    }
    Array3.prototype = ring.__objectCreate(Array2.prototype);
    Array3.prototype.constructor = Array3;
    var a3 = new Array3();
    assert(a3 instanceof Array3);
    assert(a3 instanceof Array2);
    assert(a3 instanceof Array);
    assert.equal(a3.constructor, Array3);
});

test("underscoreProto", function() {
    // testing underscore to know the exact behavior with prototypes
    function Obj() {}
    Obj.prototype.a = "a";
    var tmp = {};
    _.extend(tmp, new Obj());
    assert.equal(tmp.a, "a"); // extend traverse prototype
    tmp = {};
    _.each(new Obj(), function(v, k) {
        tmp[k] = true;
    });
    assert.equal(tmp.a, undefined); // but each does not
});

test("initRetroCompatibility", function() {
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
    assert.equal(new C().a, "a");
    assert.equal(new C().b, "b");
    var D = ring.create([B, A], {});
    assert.equal(new D().a, "a");
    assert.equal(new D().b, "b");

    A = ring.create({
        init: function() {
            this.a = "a";
            ring.getSuper(A, this, "init")();
        }
    });
    B = ring.create({
        init: function() {
            this.b = "b";
            ring.getSuper(B, this, "init")();
        }
    });
    C = ring.create([A, B], {});
    assert.equal(new C().a, "a");
    assert.equal(new C().b, "b");
    D = ring.create([B, A], {});
    assert.equal(new D().a, "a");
    assert.equal(new D().b, "b");
});

var performCompatTest = function(B) {
    var C = ring.create({
        constructor: function() {
            this.$super();
            this.c = "c";
        },
        set: function() {
            this.z = "z";
        }
    });
    var D = ring.create([B, C], {
        constructor: function() {
            this.$super();
            this.d = "d";
        },
        set: function() {
            this.$super();
            this.zz = "zz";
        }
    });
    assert.equal(D.prototype.constructor, D);
    assert.equal(D.prototype.__proto__.constructor, B);
    assert.equal(D.prototype.__proto__.__proto__.constructor, C);
    assert.equal(D.prototype.__proto__.__proto__.__proto__.constructor, ring.Object);
    var d = new D();
    d.set();
    assert.equal(d.a, "a");
    assert.equal(d.b, "b");
    assert.equal(d.c, "c");
    assert.equal(d.d, "d");
    assert.equal(d.x, "x");
    assert.equal(d.y, "y");
    assert.equal(d.z, undefined);
    assert.equal(d.zz, "zz");
    var E = ring.create(B, {
        constructor: function() {
            this.$super();
            this.e = "e";
        },
        set: function() {
            this.$super();
            this.i = "i";
        }
    });
    var F = ring.create(B, {
        constructor: function() {
            this.$super();
            this.f = "f";
        },
        set: function() {
            this.$super();
            this.j = "j";
        }
    });
    var G = ring.create([E, F], {
        constructor: function() {
            this.$super();
            this.g = "g";
        },
        set: function() {
            this.$super();
            this.k = "k";
        }
    });
    assert.equal(G.prototype.constructor, G);
    assert.equal(G.prototype.__proto__.constructor, E);
    assert.equal(G.prototype.__proto__.__proto__.constructor, F);
    assert.equal(G.prototype.__proto__.__proto__.__proto__.constructor, B);
    assert.equal(G.prototype.__proto__.__proto__.__proto__.__proto__.constructor, ring.Object);
    var g = new G();
    g.set();
    assert.equal(g.a, "a");
    assert.equal(g.b, "b");
    assert.equal(g.e, "e");
    assert.equal(g.f, "f");
    assert.equal(g.g, "g");
    assert.equal(g.x, "x");
    assert.equal(g.y, "y");
    assert.equal(g.i, "i");
    assert.equal(g.j, "j");
    assert.equal(g.k, "k");
};

test("classCompatibility", function() {
    function A() {
        this.a = "a";
    }
    A.prototype.set = function() {
        this.x = "x";
    };
    function B() {
        A.call(this);
        this.b = "b";
    }
    B.prototype = ring.__objectCreate(A.prototype);
    B.prototype.constructor = B;
    B.prototype.set = function() {
        A.prototype.set.call(this);
        this.y = "y";
    };
    performCompatTest(B);
});

test("jsfaceCompatibility", function() {
    var A = jsface.Class({
        constructor: function() {
            this.a = "a";
        },
        set: function() {
            this.x = "x";
        }
    });
    var B = jsface.Class(A, {
        constructor: function() {
            B.$super.call(this);
            this.b = "b";
        },
        set: function() {
            B.$superp.set.call(this);
            this.y = "y";
        }
    });
    performCompatTest(B);
});

test("johnresigCompatibility", function() {
    var A = Class.extend({
        init: function() {
            this.a = "a";
        },
        set: function() {
            this.x = "x";
        }
    });
    var B = A.extend({
        init: function() {
            this._super(this);
            this.b = "b";
        },
        set: function() {
            this._super(this);
            this.y = "y";
        }
    });
    performCompatTest(B);
});

test("klassCompatibility", function() {
    var A = klass(function() {
        this.a = "a";
    }).methods({
        set: function() {
            this.x = "x";
        }
    });
    var B = A.extend(function() {
        this.b = "b";
    }).methods({
        set: function() {
            this.supr(this);
            this.y = "y";
        }
    });
    performCompatTest(B);
});

if (typeof(module) === "undefined") test("classyCompatibility", function() {
    var A = Classy.$extend({
        __init__: function() {
            this.a = "a";
        },
        set: function() {
            this.x = "x";
        }
    });
    var B = A.$extend({
        __init__: function() {
            this.$super(this);
            this.b = "b";
        },
        set: function() {
            this.$super(this);
            this.y = "y";
        }
    });
    performCompatTest(B);
});

test("dejavuCompatibility", function() {
    var A = dejavu.Class.declare({
        initialize: function() {
            this.a = "a";
        },
        set: function() {
            this.x = "x";
        }
    });
    var B = dejavu.Class.declare({
        $extends: A,
        initialize: function() {
            this.$super(this);
            this.b = "b";
        },
        set: function() {
            this.$super(this);
            this.y = "y";
        }
    });
    performCompatTest(B);
});

test("dejavuClosureCompatibility", function() {
    var A = dejavu.Class.declare(function () {
        return {
            initialize: function() {
                this.a = "a";
            },
            set: function() {
                this.x = "x";
            }
        };
    });
    var B = A.extend(function($super) {
        return {
            initialize: function() {
                $super.initialize.call(this);
                this.b = "b";
            },
            set: function() {
                $super.set.call(this);
                this.y = "y";
            }
        };
    });
    performCompatTest(B);
});

// It's not possible for ring to support classify because it checks in
// its constructors that 'this' is an instance of the class created by classify
// by using 'instanceof' (which does not work because instanceof does not work
// with ringjs. Removing that test in Classify's source code make it work
// correctly with ring.
/*
test("classifyCompatibility", function() {
    var A = Classify({
        init: function() {
            this.a = "a";
        }, 
        set: function() {
            this.x = "x";
        }
    });
    var B = Classify(A, {
        init: function() {
            this.$$parent(this);
            this.b = "b";
        },
        set: function() {
            this.$$parent(this);
            this.y = "y";
        }
    });
    performCompatTest(B);
});
*/

test("coffeeCompatibility", function() {
    //    Compiled using this code:
    //
    //    class A
    //        constructor: ->
    //            @a = "a"
    //        set: ->
    //            @x = "x"
    //    class B extends A
    //        constructor: ->
    //            super
    //            @b = "b"
    //        set: ->
    //            super
    //            @y = "y"

    var A, B,
        __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key))
                    child[key] = parent[key];
            }

            function Ctor() {
                this.constructor = child;
            }
            Ctor.prototype = parent.prototype;
            child.prototype = new Ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    A = (function () {

        function A() {
            this.a = "a";
        }

        A.prototype.set = function () {
            this.x = "x";
            return this.x;
        };

        return A;

    })();

    B = (function (_super) {

        __extends(B2, _super);

        function B2() {
            B.__super__.constructor.apply(this, arguments);
            this.b = "b";
        }

        B2.prototype.set = function () {
            B.__super__.set.apply(this, arguments);
            this.y = "y";
            return this.y;
        };

        return B2;

    })(A);
    
    performCompatTest(B);
});

test("backboneCompatibility", function() {
    var A = Backbone.Model.extend({
        initialize: function() {
            this.a = "a";
        },
        set: function() {
            this.x = "x";
        }
    });
    var B = A.extend({
        initialize: function() {
            A.prototype.initialize.call(this);
            this.b = "b";
        },
        set: function() {
            A.prototype.set.call(this);
            this.y = "y";
        }
    });
    performCompatTest(B);
});

test("length", function() {
    var X = ring.create({});

    var Y = ring.create([X], {length: 33});
    var y = new Y();
    assert.equal(y.constructor.prototype.length, 33);

    var Z = ring.create([X], {length: function() { return 12; }});
    assert.equal(new Z().length(), 12);
});

})();
