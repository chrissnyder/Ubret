(function() {
  var BaseController, Map, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseController = require('./BaseController');

  _ = require('underscore/underscore');

  Map = (function(_super) {

    __extends(Map, _super);

    Map.mapOptions = {
      attributionControl: false
    };

    L.Icon.Default.imagePath = 'css/images';

    Map.prototype.name = "Map";

    function Map() {
      this.selected = __bind(this.selected, this);

      this.plotObjects = __bind(this.plotObjects, this);

      this.plotObject = __bind(this.plotObject, this);

      this.createSky = __bind(this.createSky, this);

      this.start = __bind(this.start, this);

      this.render = __bind(this.render, this);
      Map.__super__.constructor.apply(this, arguments);
      this.circles = [];
      this.subscribe(this.subChannel, this.process);
    }

    Map.prototype.render = function() {
      return this.html(this.requireTemplate('views/map', {
        index: this.index
      }));
    };

    Map.prototype.start = function() {
      if (!this.map) {
        this.createSky();
      }
      if (this.data) {
        return this.plotObjects();
      }
    };

    Map.prototype.createSky = function() {
      this.map = L.map("sky-" + this.index, Map.mapOptions).setView([0, 180], 6);
      this.layer = L.tileLayer('/tiles/#{zoom}/#{tilename}.jpg', {
        maxZoom: 7
      });
      this.layer.getTileUrl = function(tilePoint) {
        var convertTileUrl, url, zoom;
        zoom = this._getZoomForUrl();
        convertTileUrl = function(x, y, s, zoom) {
          var d, e, f, g, pixels;
          pixels = Math.pow(2, zoom);
          d = (x + pixels) % pixels;
          e = (y + pixels) % pixels;
          f = "t";
          g = 0;
          while (g < zoom) {
            pixels = pixels / 2;
            if (e < pixels) {
              if (d < pixels) {
                f += "q";
              } else {
                f += "r";
                d -= pixels;
              }
            } else {
              if (d < pixels) {
                f += "t";
                e -= pixels;
              } else {
                f += "s";
                d -= pixels;
                e -= pixels;
              }
            }
            g++;
          }
          return {
            x: x,
            y: y,
            src: f,
            s: s
          };
        };
        url = convertTileUrl(tilePoint.x, tilePoint.y, 1, zoom);
        return "/tiles/" + zoom + "/" + url.src + ".jpg";
      };
      return this.layer.addTo(this.map);
    };

    Map.prototype.plotObject = function(subject, options) {
      var circle, coords,
        _this = this;
      coords = [subject.dec, subject.ra];
      circle = new L.marker(coords, options);
      circle.zooniverse_id = subject.zooniverse_id;
      circle.addTo(this.map);
      circle.bindPopup(this.requireTemplate('views/map_popup', {
        subject: subject
      }));
      circle.on('click', function() {
        circle.openPopup();
        return _this.publish([
          {
            message: "selected",
            item_id: circle.zooniverse_id
          }
        ]);
      });
      return this.circles.push(circle);
    };

    Map.prototype.plotObjects = function() {
      var latlng, marker, subject, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.circles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        this.map.removeLayer(marker);
      }
      this.circles = new Array;
      this.filterData();
      _ref1 = this.filteredData;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        subject = _ref1[_j];
        this.plotObject(subject);
      }
      latlng = new L.LatLng(this.data[0].dec, this.data[0].ra);
      return this.map.panTo(latlng);
    };

    Map.prototype.selected = function(itemId) {
      var c, circle, item, latlng;
      item = _.find(this.data, function(subject) {
        return subject.zooniverse_id = itemId;
      });
      latlng = new L.LatLng(item.dec, item.ra);
      circle = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.circles;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          if (c.zooniverse_id === itemId) {
            _results.push(c);
          }
        }
        return _results;
      }).call(this))[0];
      return circle.openPopup();
    };

    return Map;

  })(BaseController);

  module.exports = Map;

}).call(this);