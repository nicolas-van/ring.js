
(function() {
var TemplateEngine = function() {
    this.init();
}

_.extend(TemplateEngine.prototype, {
    init: function() {
        this.setEnvironment({});
    },
    loadFile: function(filename) {
        var self = this;
        return $.get(filename).pipe(function(content) {
            return self._parseFile(content);
        });
    },
    _parseFile: function(file_content) {
        var reg = /<\#\s*template\s+(\w+)\s*\#>([\s\S]*?)<\/\#\s*template\s*\#>/g;
        var to_add = {};
        var search;
        while (search = reg.exec(file_content)) {
            if (this[search[1]])
                throw new Error(search[1] + " is an already defined template");
            this[search[1]] = this.buildTemplate(search[2]);
        }
    },
    buildTemplate: function(template_) {
        var self = this;
        var result = template(template_);
        return function(data) {
            return result(_.extend({engine: self}, self._env, data));
        };
    },
    setEnvironment: function(env) {
        this._env = env;
    },
});

//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
templateSettings = {
    interpolate : /((?:\\\\)*)(%\{(.+?)\})/g,
    escape: /((?:\\\\)*)(\$\{([^%].*?)\})/g,
    evaluate: /((?:\\\\)*)(<%([\s\S]+?)%>|%(.+?)(?:\\n|$))/g,
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /.^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
};

for (var p in escapes) escapes[escapes[p]] = p;
var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

// Within an interpolation, evaluation, or escaping, remove HTML escaping
// that had been previously added.
var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
        return escapes[escape];
    });
};

var slashsec = function(function_) {
    return function(match, slashes, content, code1, code2) {
        slashes = slashes || "";
        var nbr = slashes.length / 2;
        var nslash = slashes.slice(0, nbr - (nbr % 2));
        if (slashes.length % 4 === 0)
            return nslash + function_(match, code1, code2);
        else
            return nslash + (content);
    };
};

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
template = function(text, data, settings) {
    settings = _.defaults(settings || {}, templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, slashsec(function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      }))
      .replace(settings.interpolate || noMatch, slashsec(function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      }))
      .replace(settings.evaluate || noMatch, slashsec(function(match, code1, code2) {
        var code = code1 || code2;
        return "';\n" + unescape(code) + "\n;__p+='";
      })) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
};

// end of Jeremy Ashkenas' code

this.TemplateEngine = TemplateEngine;

})();

