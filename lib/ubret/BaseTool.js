(function() {
  var BaseTool,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  BaseTool = (function() {

    BaseTool.prototype.required_opts = ['data'];

    function BaseTool(opts) {
      this.prettyKey = __bind(this.prettyKey, this);

      this.extractKeys = __bind(this.extractKeys, this);

      this.selectTool = __bind(this.selectTool, this);
      if (!_.has(opts, 'data')) {
        throw 'must provide data';
      } else {
        this.data = opts.data;
      }
      if (!_.has(opts, 'selector')) {
        throw 'must provide selector';
      } else {
        this.selector = opts.selector;
      }
      this.extractKeys();
    }

    BaseTool.prototype.selectTool = function() {
      return this.tool_view = $("" + this.selector);
    };

    BaseTool.prototype.extractKeys = function() {
      var dataKey, key, value, _ref, _results;
      this.keys = [];
      _ref = this.data[0];
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        if (typeof value !== 'function') {
          dataKey = key;
        }
        if (__indexOf.call(undesiredKeys, dataKey) < 0) {
          _results.push(this.keys.push(dataKey));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BaseTool.prototype.prettyKey = function(key) {
      return this.capitalizeWords(this.underscoresToSpaces(key));
    };

    BaseTool.prototype.underscoresToSpaces = function(string) {
      return string.replace(/_/g, " ");
    };

    BaseTool.prototype.capitalizeWords = function(string) {
      return string.replace(/(\b[a-z])/g, function(char) {
        return char.toUpperCase();
      });
    };

    return BaseTool;

  })();

  module.exports = BaseTool;

}).call(this);