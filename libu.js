// Generated by CoffeeScript 1.6.3
(function() {
  var BaseTool, Graph, oldU,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (this.U) {
    oldU = this.U;
  }

  this.U = {};

  this.U.NoConflict = oldU;

  this.U._bindContext = function(fns, ctx) {
    return _.map(fns, function(fn) {
      return _.bind(fn, ctx);
    });
  };

  this.U.identity = function(a) {
    return a;
  };

  this.U.dispatch = function(dispatchFn, obj, ctx) {
    var dispatch, _this;
    _this = ctx || this;
    dispatch = _.map(obj, function(fns, dispatchVal) {
      return [new RegExp("^" + dispatchVal + "$"), fns];
    });
    return function() {
      var args, dispatchVal, value;
      value = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      dispatchVal = dispatchFn.call(_this, value);
      return _.chain(dispatch).filter(function(_arg) {
        var key;
        key = _arg[0];
        return !_.isEmpty(dispatchVal.match(key));
      }).each(function(_arg) {
        var fns, key;
        key = _arg[0], fns = _arg[1];
        return _.each(fns, function(fn) {
          return fn.apply(_this, args.concat(value));
        });
      });
    };
  };

  this.U.pipeline = function() {
    var fns, _this;
    fns = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _this = this;
    return function() {
      var args, seed;
      seed = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return _.reduce(fns, (function(m, fn) {
        return fn.apply(_this, [m].concat(args));
      }), seed);
    };
  };

  this.U.listenTo = function(eventEmitter, event, fn, ctx) {
    return eventEmitter.on(event, fn, ctx);
  };

  this.U.stopListening = function(eventEmitter, event, fn, ctx) {
    return eventEmitter.off(event, fn, ctx);
  };

  this.U.EventEmitter = (function() {
    function EventEmitter(listeners, ctx) {
      this.listeners = listeners != null ? listeners : {};
      this.ctx = ctx != null ? ctx : null;
      this._listen();
    }

    EventEmitter.prototype.on = function(event, fns, ctx) {
      if (ctx == null) {
        ctx = null;
      }
      if ((ctx != null) && ctx !== this.ctx) {
        fns = U._bindContext(fns, ctx);
      }
      if (this.listeners[event] == null) {
        this.listeners[event] = [];
      }
      this.listeners[event] = this.listeners[event].concat(fns);
      return this._listen();
    };

    EventEmitter.prototype.off = function(event, fn, ctx) {
      if (event == null) {
        this.listeners = {};
      } else if (fn == null) {
        this.listeners[event] = null;
      } else {
        if (ctx != null) {
          fn = _.bind(fn, ctx);
        }
        this.listeners[event] = _.without(this.listeners[event], fn);
      }
      return this._listen();
    };

    EventEmitter.prototype.trigger = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._listeners.apply(null, args);
    };

    EventEmitter.prototype._listen = function() {
      return this._listeners = U.dispatch(U.identity, this.listeners, this.ctx);
    };

    return EventEmitter;

  })();

  this.U.State = (function(_super) {
    __extends(State, _super);

    function State(state, ctx, listeners) {
      this.state = state != null ? state : {};
      this.ctx = ctx != null ? ctx : null;
      State.__super__.constructor.call(this, listeners, this.ctx);
    }

    State.prototype.get = function() {
      var states;
      states = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (_.isEmpty(states)) {
        return _.clone(this.state);
      }
      return _.chain(states).map(this._parseStateStrToObj, this).map(function(_arg) {
        var deepState, key;
        key = _arg[0], deepState = _arg[1];
        if (key === "*") {
          return _.clone(deepState);
        } else {
          return _.clone(deepState[key]);
        }
      }).value();
    };

    State.prototype.set = function(state, value) {
      var deepState, key, _ref;
      _ref = this._parseStateStrToObj(state), key = _ref[0], deepState = _ref[1];
      if (!_.isEqual(deepState[key], value)) {
        deepState[key] = value;
        return this.trigger(state, value);
      }
    };

    State.prototype.withState = function(state, fn, ctx) {
      var _this = this;
      if (ctx == null) {
        ctx = null;
      }
      if (ctx != null) {
        _.bind(fn, ctx);
      }
      return (function() {
        return fn.apply(null, _this.get.apply(_this, state));
      });
    };

    State.prototype.whenState = function(reqState, optState, fn, ctx) {
      var allState, checkStateAndExecute, withState,
        _this = this;
      allState = reqState.concat(optState);
      withState = this.withState(allState, fn, ctx);
      checkStateAndExecute = function() {
        if (_.every(_this.get.apply(_this, reqState), (function(s) {
          return s != null;
        }), _this)) {
          return withState();
        }
      };
      return _.each(allState, (function(state) {
        return this.on(state, checkStateAndExecute);
      }), this);
    };

    State.prototype._parseStateStrToObj = function(str) {
      var finalKey, state, stateRef, toAccessor;
      toAccessor = function(a) {
        var array;
        array = a.match(/\[([0-9]+)\]/);
        if (!_.isNull(array)) {
          return parseInt(array[1]);
        } else {
          return a;
        }
      };
      state = str.split('.');
      finalKey = toAccessor(state.pop());
      stateRef = _.reduce(state, (function(m, a, i) {
        var nextKey;
        a = toAccessor(a);
        if ((m[a] != null)) {
          nextKey = state.length === i + 1 ? finalKey : state[i + 1];
          if (_.isNumber(nextKey)) {
            return m[a] = [];
          } else {
            return m[a] = {};
          }
        } else {
          return m[a];
        }
      }), this.state);
      return [finalKey, stateRef];
    };

    return State;

  })(U.EventEmitter);

  this.U.Data = (function() {
    function Data(data, omittedKeys) {
      this.data = data;
      this.omittedKeys = omittedKeys;
      this._invoked = [];
      this._perPage = 0;
      this._projection = ['*'];
      this._sortOrder = 'a';
      this._sortProp = 'uid';
      this.keys = _.chain(this.data).map(function(d) {
        return _.keys(_.omit.apply(_, [d].concat(__slice.call(this.omittedKeys))));
      }).flatten().uniq().value();
    }

    return Data;

  })();

  BaseTool = (function() {
    BaseTool.prototype.nonDisplayKeys = ['id', 'uid', 'image', 'thumb', 'plate', 'mjd', 'fiberID'];

    function BaseTool(options) {
      this._dataKeys = __bind(this._dataKeys, this);
      this.preparedData = __bind(this.preparedData, this);
      this.childData = __bind(this.childData, this);
      this.removeParentTool = __bind(this.removeParentTool, this);
      this.parentTool = __bind(this.parentTool, this);
      this.settings = __bind(this.settings, this);
      this.fields = __bind(this.fields, this);
      this.filters = __bind(this.filters, this);
      this.selectIds = __bind(this.selectIds, this);
      this.keys = __bind(this.keys, this);
      this.data = __bind(this.data, this);
      var key, value;
      _.extend(this, U.Events);
      this.opts = {
        events: {},
        selectedIds: [],
        data: [],
        filters: [],
        fields: []
      };
      this.unitsFormatter = d3.units('astro');
      this.bindEvents(this.events);
      if (options != null ? options.selector : void 0) {
        this.selector(options.selector);
        delete options.selector;
      }
      for (key in options) {
        value = options[key];
        if (_.isFunction(this[key])) {
          this[key](value);
        }
      }
    }

    BaseTool.prototype.toJSON = function() {
      var json, key, value, _ref;
      json = {};
      _ref = this.opts;
      for (key in _ref) {
        value = _ref[key];
        if (key !== 'selector') {
          json[key] = value;
        }
      }
      return json;
    };

    BaseTool.prototype.selector = function(selector) {
      if (selector == null) {
        selector = null;
      }
      this.el = document.createElement('div');
      this.el.id = selector;
      this.d3el = d3.select(this.el);
      this.trigger('selector', this.d3el);
      return this;
    };

    BaseTool.prototype.height = function(height, triggerEvent) {
      if (height == null) {
        height = 0;
      }
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      this.opts.height = height;
      if (triggerEvent) {
        this.trigger('height', this.opts.height);
      }
      return this;
    };

    BaseTool.prototype.width = function(width, triggerEvent) {
      if (width == null) {
        width = 0;
      }
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      this.opts.width = width;
      if (triggerEvent) {
        this.trigger('width', this.opts.width);
      }
      return this;
    };

    BaseTool.prototype.data = function(data, triggerEvent) {
      if (data == null) {
        data = [];
      }
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      this.opts.data = _(data).sortBy(function(d) {
        return d.uid;
      });
      this.keys(this._dataKeys(this.opts.data[0]));
      if (triggerEvent && (!_.isEmpty(this.opts.data))) {
        this.trigger('data', this.childData());
      }
      return this;
    };

    BaseTool.prototype.keys = function(keys, triggerEvent) {
      if (keys == null) {
        keys = [];
      }
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      this.opts.keys = keys;
      if (triggerEvent) {
        this.trigger('keys', this.opts.keys);
      }
      return this;
    };

    BaseTool.prototype.selectIds = function(ids, triggerEvent) {
      if (ids == null) {
        ids = [];
      }
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      if (_.isArray(ids)) {
        this.opts.selectedIds = ids;
      } else if (__indexOf.call(this.opts.selectedIds, ids) >= 0) {
        this.opts.selectedIds = _.without(this.opts.selectedIds, ids);
      } else {
        if (!_.isUndefined(ids)) {
          this.opts.selectedIds.unshift(ids);
        }
      }
      if (triggerEvent) {
        this.trigger('selection', this.opts.selectedIds);
      }
      return this;
    };

    BaseTool.prototype.filters = function(filters, triggerEvent, replace) {
      if (filters == null) {
        filters = [];
      }
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      if (replace == null) {
        replace = false;
      }
      if (_.isArray(filters)) {
        if (!replace) {
          this.opts.filters = this.opts.filters.concat(filters);
        } else {
          this.opts.filters = filters;
          this.trigger('data', this.childData());
        }
      } else {
        this.opts.filters.push(filters);
      }
      if (triggerEvent) {
        this.trigger('add-filters', filters);
        if (!_.isEmpty(this.opts.data) && ((!_.isEmpty(filters)) || _.isFunction(filters))) {
          this.trigger('data', this.childData());
        }
      }
      return this;
    };

    BaseTool.prototype.fields = function(fields, triggerEvent, replace) {
      if (fields == null) {
        fields = [];
      }
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      if (replace == null) {
        replace = false;
      }
      if (_.isArray(fields)) {
        if (!replace) {
          this.opts.fields = this.opts.fields.concat(fields);
        } else {
          this.opts.fields = fields;
          this.trigger('data', this.childData());
        }
      } else {
        this.opts.fields.push(fields);
      }
      if (triggerEvent) {
        this.trigger('add-fields', fields);
        if (!_.isEmpty(this.opts.data) && ((!_.isEmpty(fields)) || _.isObject(fields))) {
          this.trigger('data', this.childData());
        }
      }
      return this;
    };

    BaseTool.prototype.settings = function(settings, triggerEvent) {
      var setting, value;
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      for (setting in settings) {
        value = settings[setting];
        if (typeof this[setting] === 'function') {
          this[setting](value);
        } else {
          this.opts[setting] = value;
        }
        if (triggerEvent) {
          this.trigger("setting:" + setting, value);
        }
      }
      if (triggerEvent) {
        this.trigger('settings', settings);
      }
      return this;
    };

    BaseTool.prototype.parentTool = function(tool, triggerEvent) {
      if (tool == null) {
        tool = null;
      }
      if (triggerEvent == null) {
        triggerEvent = true;
      }
      if (this.opts.parentTool != null) {
        if (_.isEqual(tool, this.opts.parentTool.selector)) {
          return this;
        } else {
          this.opts.parentTool.unbind('data', this.data);
          this.opts.parentTool.unbind('selection', this.selection);
        }
      }
      this.opts.parentTool = tool;
      this.data(tool.childData()).selectIds(tool.opts.selectedIds);
      this.opts.parentTool.on({
        'data': this.data,
        'selection': this.selectIds
      });
      if (triggerEvent) {
        this.trigger('bound-to', tool);
      }
      return this;
    };

    BaseTool.prototype.removeParentTool = function() {
      if (this.opts.parentTool != null) {
        this.opts.parentTool.unbind();
        delete this.opts.parentTool;
      }
      return this;
    };

    BaseTool.prototype.childData = function() {
      return this.preparedData();
    };

    BaseTool.prototype.preparedData = function() {
      var data;
      data = this._addFields(this._filter(this.opts.data, this.opts.filters), this.opts.fields).value();
      this.keys(this._dataKeys(data[0]));
      return data;
    };

    BaseTool.prototype.formatKey = function(key) {
      return (key.replace(/_/g, " ")).replace(/(\b[a-z])/g, function(char) {
        return char.toUpperCase();
      });
    };

    BaseTool.prototype._filter = function(data, filters) {
      var filter, _i, _len;
      data = _.chain(data);
      for (_i = 0, _len = filters.length; _i < _len; _i++) {
        filter = filters[_i];
        data = data.filter(filter);
      }
      return data;
    };

    BaseTool.prototype._addFields = function(data, fields) {
      var field, _i, _len;
      for (_i = 0, _len = fields.length; _i < _len; _i++) {
        field = fields[_i];
        data = data.map(function(i) {
          i[field.field] = field.func(i);
          return i;
        });
      }
      return data;
    };

    BaseTool.prototype._dataKeys = function(datum) {
      var key, keys, value;
      keys = new Array;
      for (key in datum) {
        value = datum[key];
        if (!(__indexOf.call(this.nonDisplayKeys, key) >= 0)) {
          keys.push(key);
        }
      }
      return keys;
    };

    return BaseTool;

  })();

  U.Paginated = {
    currentPageData: function() {
      this.currentPage(this.opts.currentPage);
      return this.page(this.opts.currentPage);
    },
    page: function(number) {
      var endIndex, sortedData, startIndex;
      startIndex = number * _.result(this, 'perPage');
      endIndex = (number + 1) * _.result(this, 'perPage');
      sortedData = this.pageSort(this.preparedData());
      return sortedData.slice(startIndex, endIndex);
    },
    pages: function() {
      return Math.ceil(this.pageSort(this.preparedData()).length / _.result(this, 'perPage'));
    },
    currentPage: function(page) {
      var pages;
      if (_.isEmpty(this.preparedData())) {
        return this.opts.currentPage = page;
      }
      pages = this.pages();
      if (page < 0) {
        return this.opts.currentPage = pages - 1;
      } else if (page >= pages) {
        return this.opts.currentPage = page % pages;
      } else if (_.isNull(page) || _.isUndefined(page)) {
        return this.opts.currentPage = 0;
      } else {
        return this.opts.currentPage = page;
      }
    },
    nextPage: function() {
      return this.settings({
        currentPage: parseInt(this.opts.currentPage) + 1
      });
    },
    prevPage: function() {
      return this.settings;
    }
  };

  Graph = (function() {
    function Graph() {
      this.labelAxis2 = __bind(this.labelAxis2, this);
      this.drawAxis2 = __bind(this.drawAxis2, this);
      this.labelAxis1 = __bind(this.labelAxis1, this);
      this.drawAxis1 = __bind(this.drawAxis1, this);
      this.y = __bind(this.y, this);
      this.x = __bind(this.x, this);
      this.yDomain = __bind(this.yDomain, this);
      this.xDomain = __bind(this.xDomain, this);
      this.graphHeight = __bind(this.graphHeight, this);
      this.graphWidth = __bind(this.graphWidth, this);
      this.setupGraph = __bind(this.setupGraph, this);
      this.format = d3.format(',.02f');
      this.margin = {
        left: 70,
        top: 20,
        bottom: 80,
        right: 20
      };
      Graph.__super__.constructor.apply(this, arguments);
    }

    Graph.prototype.events = {
      'height': 'setupGraph drawAxis1 drawAxis2 drawData',
      'width': 'setupGraph drawAxis1 drawAxis2 drawData',
      'settings': 'drawAxis1 drawAxis2 drawData',
      'data': 'drawAxis1 drawAxis2 drawData',
      'selector ': 'setupGraph'
    };

    Graph.prototype.setupGraph = function() {
      if (!((this.opts.width != null) && (this.opts.height != null))) {
        return;
      }
      if (this.svg == null) {
        return this.svg = this.d3el.append('svg').attr('width', this.opts.width - 10).attr('height', this.opts.height - 20).attr('style', 'position: relative; top: 15px; left: -15px;').append('g').attr('class', 'chart').attr('transform', "translate(" + this.margin.left + ", " + this.margin.top + ")");
      } else {
        this.d3el.select('svg').attr('width', this.opts.width - 10).attr('height', this.opts.height - 10);
        return this.svg.select('g.chart').attr('width', this.opts.width - 10).attr('height', this.opts.height - 10);
      }
    };

    Graph.prototype.graphWidth = function() {
      return this.opts.width - (this.margin.left + this.margin.right);
    };

    Graph.prototype.graphHeight = function() {
      return this.opts.height - (this.margin.top + this.margin.bottom);
    };

    Graph.prototype.xDomain = function() {
      var domain;
      if (this.opts.axis1 == null) {
        return;
      }
      domain = d3.extent(_(this.preparedData()).pluck(this.opts.axis1));
      if (this.opts['x-min']) {
        domain[0] = this.opts['x-min'];
      }
      if (this.opts['x-max']) {
        domain[1] = this.opts['x-max'];
      }
      return domain;
    };

    Graph.prototype.yDomain = function() {
      var domain;
      if (this.opts.axis2 == null) {
        return;
      }
      domain = d3.extent(_(this.preparedData()).pluck(this.opts.axis2));
      if (this.opts['y-min']) {
        domain[0] = this.opts['y-min'];
      }
      if (this.opts['y-max']) {
        domain[1] = this.opts['y-max'];
      }
      return domain;
    };

    Graph.prototype.x = function() {
      var domain;
      domain = this.xDomain();
      if (domain == null) {
        return;
      }
      return d3.scale.linear().range([0, this.graphWidth()]).domain(domain);
    };

    Graph.prototype.y = function() {
      var domain;
      domain = this.yDomain();
      if (domain == null) {
        return;
      }
      return d3.scale.linear().range([this.graphHeight(), 0]).domain(domain);
    };

    Graph.prototype.drawAxis1 = function() {
      var axis, xAxis;
      if (!((this.opts.axis1 != null) && !(_.isEmpty(this.preparedData())))) {
        return;
      }
      xAxis = d3.svg.axis().scale(this.x()).orient('bottom');
      this.svg.select("g.x").remove();
      axis = this.svg.append('g').attr('class', 'x axis').attr('transform', "translate(0, " + (this.graphHeight()) + ")").call(xAxis);
      return this.labelAxis1(axis);
    };

    Graph.prototype.labelAxis1 = function(axis) {
      return axis.append('text').attr('class', 'x label').attr('text-anchor', 'middle').attr('x', this.graphWidth() / 2).attr('y', 50).text(this.unitsFormatter(this.formatKey(this.opts.axis1)));
    };

    Graph.prototype.drawAxis2 = function() {
      var axis, yAxis;
      if (!((this.opts.axis2 != null) && !(_.isEmpty(this.preparedData())))) {
        return;
      }
      yAxis = d3.svg.axis().scale(this.y()).orient('left');
      axis = this.svg.select('g.y').remove();
      axis = this.svg.append('g').attr('class', 'y axis').attr('transform', "translate(0, 0)").call(yAxis);
      return this.labelAxis2(axis);
    };

    Graph.prototype.labelAxis2 = function(axis) {
      return axis.append('text').attr('class', 'y label').attr('text-anchor', 'middle').attr('y', -40).attr('x', -(this.graphHeight() / 2)).attr('transform', "rotate(-90)").text(this.unitsFormatter(this.formatKey(this.opts.axis2)));
    };

    return Graph;

  })();

  window.U.Graph = Graph({
    currentPage: parseInt(this.opts.currentPage) - 1
  });

}).call(this);
