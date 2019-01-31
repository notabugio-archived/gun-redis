(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("flat"), require("ramda"), require("redis"));
	else if(typeof define === 'function' && define.amd)
		define("gun-redis", ["flat", "ramda", "redis"], factory);
	else if(typeof exports === 'object')
		exports["gun-redis"] = factory(require("flat"), require("ramda"), require("redis"));
	else
		root["gun-redis"] = factory(root["flat"], root["ramda"], root["redis"]);
})(typeof self !== "undefined" ? self : this, function(__WEBPACK_EXTERNAL_MODULE_flat__, __WEBPACK_EXTERNAL_MODULE_ramda__, __WEBPACK_EXTERNAL_MODULE_redis__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client.js":
/*!***********************!*\
  !*** ./src/client.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createClient = void 0;

var _ramda = __webpack_require__(/*! ramda */ "ramda");

var _redis = __webpack_require__(/*! redis */ "redis");

var _serialize = __webpack_require__(/*! ./serialize */ "./src/serialize.js");

var GET_BATCH_SIZE = 10000;
var PUT_BATCH_SIZE = 10000;
var metaRe = /^_\..*/;
var edgeRe = /(\.#$)/;

var createClient = function createClient(Gun) {
  for (var _len = arguments.length, config = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    config[_key - 1] = arguments[_key];
  }

  var redis = _redis.createClient.apply(void 0, config);

  var get = function get(soul) {
    return new Promise(function (resolve, reject) {
      if (!soul) return resolve(null);
      redis.hgetall(soul, function (err, res) {
        if (err) {
          console.error("get error", err);
          reject(err);
        } else {
          resolve((0, _serialize.fromRedis)(res));
        }
      });
      return undefined;
    });
  };

  var read = function read(soul) {
    return get(soul).then(function (rawData) {
      var data = rawData ? { ...rawData
      } : rawData;
      if (!Gun.SEA || soul.indexOf("~") === -1) return rawData;
      (0, _ramda.without)(["_"], (0, _ramda.keys)(data)).forEach(function (key) {
        Gun.SEA.verify(Gun.SEA.opt.pack(rawData[key], key, rawData, soul), false, function (res) {
          return data[key] = Gun.SEA.opt.unpack(res, key, rawData);
        });
      });
      return data;
    });
  };

  var batchedGet = function batchedGet(soul, cb) {
    return new Promise(function (resolve, reject) {
      redis.hkeys(soul, function (err, nodeKeys) {
        if (err) {
          console.error("error", err.stack || err);
          return reject(err);
        }

        if (nodeKeys.length <= GET_BATCH_SIZE) {
          return get(soul).then(function (res) {
            cb(res);
            resolve(res);
          });
        }

        console.log("get big soul", soul, nodeKeys.length);
        var attrKeys = nodeKeys.filter(function (key) {
          return !key.match(metaRe);
        });

        var readBatch = function readBatch() {
          return new Promise(function (ok, fail) {
            var batch = attrKeys.splice(0, GET_BATCH_SIZE);
            if (!batch.length) return ok(true);
            var batchMeta = batch.map(function (key) {
              return "_.>.".concat(key).replace(edgeRe, "");
            });
            return redis.hmget(soul, batchMeta, function (err, meta) {
              if (err) {
                return console.error("hmget err", err.stack || err) || fail(err);
              }

              var obj = {
                "_.#": soul
              };
              meta.forEach(function (val, idx) {
                return obj[batchMeta[idx]] = val;
              });
              return redis.hmget(soul, batch, function (err, res) {
                if (err) {
                  return console.error("hmget err", err.stack || err) || fail(err);
                }

                res.forEach(function (val, idx) {
                  return obj[batch[idx]] = val;
                });
                var result = (0, _serialize.fromRedis)(obj);
                cb(result);
                return ok();
              });
            });
          });
        };

        var readNextBatch = function readNextBatch() {
          return readBatch().then(function (done) {
            return !done && readNextBatch;
          });
        };

        return readNextBatch().then(function (res) {
          resolve(res);
        }).catch(reject);
      });
    });
  };

  var write = function write(put) {
    return Promise.all((0, _ramda.keys)(put).map(function (soul) {
      return new Promise(function (resolve, reject) {
        var node = put[soul];
        var meta = (0, _ramda.path)(["_", ">"], node) || {};
        var nodeKeys = (0, _ramda.keys)(meta);

        var writeNextBatch = function writeNextBatch() {
          var batch = nodeKeys.splice(0, PUT_BATCH_SIZE);
          if (!batch.length) return resolve();
          var updates = (0, _serialize.toRedis)({
            _: {
              "#": soul,
              ">": (0, _ramda.pick)(batch, meta)
            },
            ...(0, _ramda.pick)(batch, node)
          });
          return redis.hmset(soul, (0, _serialize.toRedis)(updates), function (err) {
            return err ? reject(err) : writeNextBatch();
          });
        };

        return writeNextBatch();
      });
    }));
  };

  return {
    get: get,
    read: read,
    batchedGet: batchedGet,
    write: write
  };
};

exports.createClient = createClient;

/***/ }),

/***/ "./src/gun.js":
/*!********************!*\
  !*** ./src/gun.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attachToGun = void 0;

var _client = __webpack_require__(/*! ./client */ "./src/client.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var attachToGun = function attachToGun(Gun) {
  return Gun.on("create", function (db) {
    this.to.next(db);
    var redis = Gun.redis = db.redis = (0, _client.createClient)(Gun);
    db.on("get", function (request) {
      this.to.next(request);
      var dedupId = request["#"];
      var get = request.get;
      var soul = get["#"];
      redis.batchedGet(soul, function (result) {
        return db.on("in", {
          "@": dedupId,
          put: result ? _defineProperty({}, soul, result) : null,
          err: null
        });
      }).catch(function (err) {
        return console.error("error", err.stack || err) || db.on("in", {
          "@": dedupId,
          put: null,
          err: err
        });
      });
    });
    db.on("put", function (request) {
      this.to.next(request);
      var dedupId = request["#"];
      redis.write(request.put).then(function () {
        return db.on("in", {
          "@": dedupId,
          ok: true,
          err: null
        });
      }).catch(function (err) {
        return db.on("in", {
          "@": dedupId,
          ok: false,
          err: err
        });
      });
    });
  });
};

exports.attachToGun = attachToGun;

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "attachToGun", {
  enumerable: true,
  get: function get() {
    return _gun.attachToGun;
  }
});
exports.receiver = void 0;

var receiverFns = _interopRequireWildcard(__webpack_require__(/*! ./receiver */ "./src/receiver.js"));

var _gun = __webpack_require__(/*! ./gun */ "./src/gun.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var receiver = receiverFns;
exports.receiver = receiver;

/***/ }),

/***/ "./src/receiver.js":
/*!*************************!*\
  !*** ./src/receiver.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.respondToGets = void 0;

var _ramda = __webpack_require__(/*! ramda */ "ramda");

var _client = __webpack_require__(/*! ./client */ "./src/client.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var respondToGets = function respondToGets(Gun) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$skipValidation = _ref.skipValidation,
      skipValidation = _ref$skipValidation === void 0 ? true : _ref$skipValidation;

  return function (db) {
    var redis = (0, _client.createClient)(Gun);
    db.onIn(function (msg) {
      var from = msg.from,
          json = msg.json,
          fromCluster = msg.fromCluster;
      var soul = (0, _ramda.path)(["get", "#"], json);
      var dedupId = (0, _ramda.prop)("#", json);
      if (!soul || fromCluster) return msg;
      return redis.batchedGet(soul, function (result) {
        var json = {
          "#": from.msgId(),
          "@": dedupId,
          put: result ? _defineProperty({}, soul, result) : null
        };
        from.send({
          json: json,
          ignoreLeeching: true,
          skipValidation: !result || skipValidation
        });
      }).catch(function (err) {
        var json = {
          "#": from.msgId(),
          "@": dedupId,
          err: "".concat(err)
        };
        from.send({
          json: json,
          ignoreLeeching: true,
          skipValidation: skipValidation
        });
      }).then(function () {
        return msg;
      });
    });
    return db;
  };
};

exports.respondToGets = respondToGets;

/***/ }),

/***/ "./src/serialize.js":
/*!**************************!*\
  !*** ./src/serialize.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromRedis = fromRedis;
exports.toRedis = toRedis;

var _ramda = __webpack_require__(/*! ramda */ "ramda");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var flatten = __webpack_require__(/*! flat */ "flat");

var FIELD_SIZE_LIMIT = 100000;

function postUnflatten(obj) {
  // This is probably only necessary if you are stupid like me and use the default . delimiter for flatten
  if (!obj) return obj;
  var arrow = obj._ && obj._[">"] || {};
  (0, _ramda.keys)(arrow).forEach(function (key) {
    var value = arrow[key];

    if (_typeof(value) === "object") {
      var valKeys = (0, _ramda.keys)(value);
      var remainder = valKeys[0];

      if (remainder) {
        var realKey = [key, valKeys].join(".");
        var realValue = value[remainder];
        delete arrow[key];
        arrow[realKey] = realValue;
        realValue = obj[key] && obj[key][remainder] || null;
        delete obj[key];
        obj[realKey] = realValue;
      }
    }
  });
  (0, _ramda.keys)(obj).forEach(function (key) {
    if (key[0] === ".") delete [key];
  });
  return obj;
}

;

function fromRedis(obj) {
  if (!obj) return obj;
  var sorted = {};
  (0, _ramda.keys)(obj).forEach(function (key) {
    if (key[0] === ".") delete obj[key];

    if (obj[key] === "|NULL|") {
      obj[key] = null;
    }

    if (obj[key] === "|UNDEFINED|") {
      obj[key] = undefined;
    }

    if (/>\./.test(key)) {
      obj[key] = parseFloat(obj[key], 10) || obj[key];
    }

    if (obj[key] && obj[key].length > FIELD_SIZE_LIMIT) {
      obj[key] = obj[key].slice(0, FIELD_SIZE_LIMIT);
      console.log("truncated", key);
    }
  });
  obj = postUnflatten(flatten.unflatten(obj));
  Object.keys(obj).sort().forEach(function (key) {
    return sorted[key] = obj[key];
  });
  return sorted;
}

function toRedis(obj) {
  if (!obj) return obj;
  obj = flatten(obj);
  (0, _ramda.keys)(obj).forEach(function (key) {
    if (obj[key] === null) {
      obj[key] = "|NULL|";
    }

    if (obj[key] === undefined) {
      obj[key] = "|UNDEFINED|";
    }

    if (obj[key] && obj[key].length > FIELD_SIZE_LIMIT) {
      obj[key] = obj[key].slice(0, FIELD_SIZE_LIMIT);
      console.log("truncated input", key);
    }

    if (key[0] === ".") delete obj[key];
  });
  return obj;
}

/***/ }),

/***/ "flat":
/*!***********************!*\
  !*** external "flat" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_flat__;

/***/ }),

/***/ "ramda":
/*!************************!*\
  !*** external "ramda" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_ramda__;

/***/ }),

/***/ "redis":
/*!************************!*\
  !*** external "redis" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_redis__;

/***/ })

/******/ });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndW4tcmVkaXMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2d1bi1yZWRpcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvY2xpZW50LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9ndW4uanMiLCJ3ZWJwYWNrOi8vZ3VuLXJlZGlzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9yZWNlaXZlci5qcyIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvc2VyaWFsaXplLmpzIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcImZsYXRcIiIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvZXh0ZXJuYWwgXCJyYW1kYVwiIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcInJlZGlzXCIiXSwibmFtZXMiOlsiR0VUX0JBVENIX1NJWkUiLCJQVVRfQkFUQ0hfU0laRSIsIm1ldGFSZSIsImVkZ2VSZSIsImNyZWF0ZUNsaWVudCIsIkd1biIsImNvbmZpZyIsInJlZGlzIiwiZ2V0Iiwic291bCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiaGdldGFsbCIsImVyciIsInJlcyIsImNvbnNvbGUiLCJlcnJvciIsInVuZGVmaW5lZCIsInJlYWQiLCJ0aGVuIiwicmF3RGF0YSIsImRhdGEiLCJTRUEiLCJpbmRleE9mIiwiZm9yRWFjaCIsImtleSIsInZlcmlmeSIsIm9wdCIsInBhY2siLCJ1bnBhY2siLCJiYXRjaGVkR2V0IiwiY2IiLCJoa2V5cyIsIm5vZGVLZXlzIiwic3RhY2siLCJsZW5ndGgiLCJsb2ciLCJhdHRyS2V5cyIsImZpbHRlciIsIm1hdGNoIiwicmVhZEJhdGNoIiwib2siLCJmYWlsIiwiYmF0Y2giLCJzcGxpY2UiLCJiYXRjaE1ldGEiLCJtYXAiLCJyZXBsYWNlIiwiaG1nZXQiLCJtZXRhIiwib2JqIiwidmFsIiwiaWR4IiwicmVzdWx0IiwicmVhZE5leHRCYXRjaCIsImRvbmUiLCJjYXRjaCIsIndyaXRlIiwicHV0IiwiYWxsIiwibm9kZSIsIndyaXRlTmV4dEJhdGNoIiwidXBkYXRlcyIsIl8iLCJobXNldCIsImF0dGFjaFRvR3VuIiwib24iLCJkYiIsInRvIiwibmV4dCIsInJlcXVlc3QiLCJkZWR1cElkIiwicmVjZWl2ZXIiLCJyZWNlaXZlckZucyIsInJlc3BvbmRUb0dldHMiLCJza2lwVmFsaWRhdGlvbiIsIm9uSW4iLCJtc2ciLCJmcm9tIiwianNvbiIsImZyb21DbHVzdGVyIiwibXNnSWQiLCJzZW5kIiwiaWdub3JlTGVlY2hpbmciLCJmbGF0dGVuIiwicmVxdWlyZSIsIkZJRUxEX1NJWkVfTElNSVQiLCJwb3N0VW5mbGF0dGVuIiwiYXJyb3ciLCJ2YWx1ZSIsInZhbEtleXMiLCJyZW1haW5kZXIiLCJyZWFsS2V5Iiwiam9pbiIsInJlYWxWYWx1ZSIsImZyb21SZWRpcyIsInNvcnRlZCIsInRlc3QiLCJwYXJzZUZsb2F0Iiwic2xpY2UiLCJ1bmZsYXR0ZW4iLCJPYmplY3QiLCJrZXlzIiwic29ydCIsInRvUmVkaXMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxp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QyxPQUFPLENBQUNsQyxHQUFELENBQWI7QUFDQSxtQkFBS0EsR0FBTCxFQUFVMUIsT0FBVixDQUFrQixVQUFTQyxHQUFULEVBQWM7QUFDOUIsUUFBSXlCLEdBQUcsQ0FBQ3pCLEdBQUQsQ0FBSCxLQUFhLElBQWpCLEVBQXVCO0FBQ3JCeUIsU0FBRyxDQUFDekIsR0FBRCxDQUFILEdBQVcsUUFBWDtBQUNEOztBQUNELFFBQUl5QixHQUFHLENBQUN6QixHQUFELENBQUgsS0FBYVIsU0FBakIsRUFBNEI7QUFDMUJpQyxTQUFHLENBQUN6QixHQUFELENBQUgsR0FBVyxhQUFYO0FBQ0Q7O0FBQ0QsUUFBSXlCLEdBQUcsQ0FBQ3pCLEdBQUQsQ0FBSCxJQUFZeUIsR0FBRyxDQUFDekIsR0FBRCxDQUFILENBQVNVLE1BQVQsR0FBa0JtRCxnQkFBbEMsRUFBb0Q7QUFDbERwQyxTQUFHLENBQUN6QixHQUFELENBQUgsR0FBV3lCLEdBQUcsQ0FBQ3pCLEdBQUQsQ0FBSCxDQUFTMEUsS0FBVCxDQUFlLENBQWYsRUFBa0JiLGdCQUFsQixDQUFYO0FBQ0F2RSxhQUFPLENBQUNxQixHQUFSLENBQVksaUJBQVosRUFBK0JYLEdBQS9CO0FBQ0Q7O0FBQ0QsUUFBSUEsR0FBRyxDQUFDLENBQUQsQ0FBSCxLQUFXLEdBQWYsRUFBb0IsT0FBT3lCLEdBQUcsQ0FBQ3pCLEdBQUQsQ0FBVjtBQUNyQixHQVpEO0FBYUEsU0FBT3lCLEdBQVA7QUFDRCxDOzs7Ozs7Ozs7OztBQ3BGRCxrRDs7Ozs7Ozs7Ozs7QUNBQSxtRDs7Ozs7Ozs7Ozs7QUNBQSxtRCIsImZpbGUiOiJndW4tcmVkaXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJmbGF0XCIpLCByZXF1aXJlKFwicmFtZGFcIiksIHJlcXVpcmUoXCJyZWRpc1wiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcImd1bi1yZWRpc1wiLCBbXCJmbGF0XCIsIFwicmFtZGFcIiwgXCJyZWRpc1wiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJndW4tcmVkaXNcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJmbGF0XCIpLCByZXF1aXJlKFwicmFtZGFcIiksIHJlcXVpcmUoXCJyZWRpc1wiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wiZ3VuLXJlZGlzXCJdID0gZmFjdG9yeShyb290W1wiZmxhdFwiXSwgcm9vdFtcInJhbWRhXCJdLCByb290W1wicmVkaXNcIl0pO1xufSkodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24oX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9mbGF0X18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmFtZGFfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yZWRpc19fKSB7XG5yZXR1cm4gIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJpbXBvcnQgeyB3aXRob3V0LCBrZXlzLCBwYXRoLCBwaWNrIH0gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgYXMgY3JlYXRlUmVkaXNDbGllbnQgfSBmcm9tIFwicmVkaXNcIjtcbmltcG9ydCB7IHRvUmVkaXMsIGZyb21SZWRpcyB9IGZyb20gXCIuL3NlcmlhbGl6ZVwiO1xuXG5jb25zdCBHRVRfQkFUQ0hfU0laRSA9IDEwMDAwO1xuY29uc3QgUFVUX0JBVENIX1NJWkUgPSAxMDAwMDtcblxuY29uc3QgbWV0YVJlID0gL15fXFwuLiovO1xuY29uc3QgZWRnZVJlID0gLyhcXC4jJCkvO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlQ2xpZW50ID0gKEd1biwgLi4uY29uZmlnKSA9PiB7XG4gIGNvbnN0IHJlZGlzID0gY3JlYXRlUmVkaXNDbGllbnQoLi4uY29uZmlnKTtcblxuICBjb25zdCBnZXQgPSBzb3VsID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKCFzb3VsKSByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgIHJlZGlzLmhnZXRhbGwoc291bCwgZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJnZXQgZXJyb3JcIiwgZXJyKTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGZyb21SZWRpcyhyZXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0pO1xuXG4gIGNvbnN0IHJlYWQgPSBzb3VsID0+XG4gICAgZ2V0KHNvdWwpLnRoZW4ocmF3RGF0YSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gcmF3RGF0YSA/IHsgLi4ucmF3RGF0YSB9IDogcmF3RGF0YTtcblxuICAgICAgaWYgKCFHdW4uU0VBIHx8IHNvdWwuaW5kZXhPZihcIn5cIikgPT09IC0xKSByZXR1cm4gcmF3RGF0YTtcbiAgICAgIHdpdGhvdXQoW1wiX1wiXSwga2V5cyhkYXRhKSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBHdW4uU0VBLnZlcmlmeShcbiAgICAgICAgICBHdW4uU0VBLm9wdC5wYWNrKHJhd0RhdGFba2V5XSwga2V5LCByYXdEYXRhLCBzb3VsKSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICByZXMgPT4gKGRhdGFba2V5XSA9IEd1bi5TRUEub3B0LnVucGFjayhyZXMsIGtleSwgcmF3RGF0YSkpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xuXG4gIGNvbnN0IGJhdGNoZWRHZXQgPSAoc291bCwgY2IpID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmVkaXMuaGtleXMoc291bCwgKGVyciwgbm9kZUtleXMpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvclwiLCBlcnIuc3RhY2sgfHwgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGVLZXlzLmxlbmd0aCA8PSBHRVRfQkFUQ0hfU0laRSkge1xuICAgICAgICAgIHJldHVybiBnZXQoc291bCkudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgY2IocmVzKTtcbiAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcImdldCBiaWcgc291bFwiLCBzb3VsLCBub2RlS2V5cy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBhdHRyS2V5cyA9IG5vZGVLZXlzLmZpbHRlcihrZXkgPT4gIWtleS5tYXRjaChtZXRhUmUpKTtcbiAgICAgICAgY29uc3QgcmVhZEJhdGNoID0gKCkgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgob2ssIGZhaWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJhdGNoID0gYXR0cktleXMuc3BsaWNlKDAsIEdFVF9CQVRDSF9TSVpFKTtcblxuICAgICAgICAgICAgaWYgKCFiYXRjaC5sZW5ndGgpIHJldHVybiBvayh0cnVlKTtcbiAgICAgICAgICAgIGNvbnN0IGJhdGNoTWV0YSA9IGJhdGNoLm1hcChrZXkgPT5cbiAgICAgICAgICAgICAgYF8uPi4ke2tleX1gLnJlcGxhY2UoZWRnZVJlLCBcIlwiKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlZGlzLmhtZ2V0KHNvdWwsIGJhdGNoTWV0YSwgKGVyciwgbWV0YSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJobWdldCBlcnJcIiwgZXJyLnN0YWNrIHx8IGVycikgfHwgZmFpbChlcnIpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgICAgICAgXCJfLiNcIjogc291bFxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIG1ldGEuZm9yRWFjaCgodmFsLCBpZHgpID0+IChvYmpbYmF0Y2hNZXRhW2lkeF1dID0gdmFsKSk7XG4gICAgICAgICAgICAgIHJldHVybiByZWRpcy5obWdldChzb3VsLCBiYXRjaCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImhtZ2V0IGVyclwiLCBlcnIuc3RhY2sgfHwgZXJyKSB8fCBmYWlsKGVycilcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlcy5mb3JFYWNoKCh2YWwsIGlkeCkgPT4gKG9ialtiYXRjaFtpZHhdXSA9IHZhbCkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGZyb21SZWRpcyhvYmopO1xuXG4gICAgICAgICAgICAgICAgY2IocmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2soKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmVhZE5leHRCYXRjaCA9ICgpID0+XG4gICAgICAgICAgcmVhZEJhdGNoKCkudGhlbihkb25lID0+ICFkb25lICYmIHJlYWROZXh0QmF0Y2gpO1xuXG4gICAgICAgIHJldHVybiByZWFkTmV4dEJhdGNoKClcbiAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKHJlamVjdCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICBjb25zdCB3cml0ZSA9IHB1dCA9PlxuICAgIFByb21pc2UuYWxsKFxuICAgICAga2V5cyhwdXQpLm1hcChcbiAgICAgICAgc291bCA9PlxuICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBwdXRbc291bF07XG4gICAgICAgICAgICBjb25zdCBtZXRhID0gcGF0aChbXCJfXCIsIFwiPlwiXSwgbm9kZSkgfHwge307XG4gICAgICAgICAgICBjb25zdCBub2RlS2V5cyA9IGtleXMobWV0YSk7XG4gICAgICAgICAgICBjb25zdCB3cml0ZU5leHRCYXRjaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYmF0Y2ggPSBub2RlS2V5cy5zcGxpY2UoMCwgUFVUX0JBVENIX1NJWkUpO1xuXG4gICAgICAgICAgICAgIGlmICghYmF0Y2gubGVuZ3RoKSByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVzID0gdG9SZWRpcyh7XG4gICAgICAgICAgICAgICAgXzoge1xuICAgICAgICAgICAgICAgICAgXCIjXCI6IHNvdWwsXG4gICAgICAgICAgICAgICAgICBcIj5cIjogcGljayhiYXRjaCwgbWV0YSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC4uLnBpY2soYmF0Y2gsIG5vZGUpXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHJldHVybiByZWRpcy5obXNldChzb3VsLCB0b1JlZGlzKHVwZGF0ZXMpLCBlcnIgPT5cbiAgICAgICAgICAgICAgICBlcnIgPyByZWplY3QoZXJyKSA6IHdyaXRlTmV4dEJhdGNoKClcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB3cml0ZU5leHRCYXRjaCgpO1xuICAgICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcblxuICByZXR1cm4geyBnZXQsIHJlYWQsIGJhdGNoZWRHZXQsIHdyaXRlIH07XG59O1xuIiwiaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50XCI7XG5cbmV4cG9ydCBjb25zdCBhdHRhY2hUb0d1biA9IEd1biA9PiBHdW4ub24oXCJjcmVhdGVcIiwgZnVuY3Rpb24oZGIpIHtcbiAgdGhpcy50by5uZXh0KGRiKTtcbiAgY29uc3QgcmVkaXMgPSBHdW4ucmVkaXMgPSBkYi5yZWRpcyA9IGNyZWF0ZUNsaWVudChHdW4pO1xuXG4gIGRiLm9uKFwiZ2V0XCIsIGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICB0aGlzLnRvLm5leHQocmVxdWVzdCk7XG4gICAgY29uc3QgZGVkdXBJZCA9IHJlcXVlc3RbXCIjXCJdO1xuICAgIGNvbnN0IGdldCA9IHJlcXVlc3QuZ2V0O1xuICAgIGNvbnN0IHNvdWwgPSBnZXRbXCIjXCJdO1xuXG4gICAgcmVkaXMuYmF0Y2hlZEdldChzb3VsLCByZXN1bHQgPT4gZGIub24oXCJpblwiLCB7XG4gICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgIHB1dDogcmVzdWx0ID8geyBbc291bF06IHJlc3VsdCB9IDogbnVsbCxcbiAgICAgIGVycjogbnVsbFxuICAgIH0pKS5jYXRjaChlcnIgPT5cbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvclwiLCBlcnIuc3RhY2sgfHwgZXJyKSB8fFxuICAgICAgZGIub24oXCJpblwiLCB7XG4gICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICBwdXQ6IG51bGwsXG4gICAgICAgIGVyclxuICAgICAgfSlcbiAgICApO1xuICB9KTtcblxuICBkYi5vbihcInB1dFwiLCBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgdGhpcy50by5uZXh0KHJlcXVlc3QpO1xuICAgIGNvbnN0IGRlZHVwSWQgPSByZXF1ZXN0W1wiI1wiXTtcblxuICAgIHJlZGlzLndyaXRlKHJlcXVlc3QucHV0KVxuICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgZGIub24oXCJpblwiLCB7XG4gICAgICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICAgICAgb2s6IHRydWUsXG4gICAgICAgICAgZXJyOiBudWxsXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICAuY2F0Y2goZXJyID0+XG4gICAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIG9rOiBmYWxzZSxcbiAgICAgICAgICBlcnI6IGVyclxuICAgICAgICB9KVxuICAgICAgKTtcbiAgfSk7XG59KTtcbiIsImltcG9ydCAqIGFzIHJlY2VpdmVyRm5zIGZyb20gXCIuL3JlY2VpdmVyXCI7XG5leHBvcnQgeyBhdHRhY2hUb0d1biB9IGZyb20gXCIuL2d1blwiO1xuXG5leHBvcnQgY29uc3QgcmVjZWl2ZXIgPSByZWNlaXZlckZucztcbiIsImltcG9ydCB7IHBhdGgsIHByb3AgfSBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCIuL2NsaWVudFwiO1xuXG5leHBvcnQgY29uc3QgcmVzcG9uZFRvR2V0cyA9IChHdW4sIHsgc2tpcFZhbGlkYXRpb24gPSB0cnVlIH0gPSB7fSkgPT4gZGIgPT4ge1xuICBjb25zdCByZWRpcyA9IGNyZWF0ZUNsaWVudChHdW4pO1xuXG4gIGRiLm9uSW4obXNnID0+IHtcbiAgICBjb25zdCB7IGZyb20sIGpzb24sIGZyb21DbHVzdGVyIH0gPSBtc2c7XG4gICAgY29uc3Qgc291bCA9IHBhdGgoW1wiZ2V0XCIsIFwiI1wiXSwganNvbik7XG4gICAgY29uc3QgZGVkdXBJZCA9IHByb3AoXCIjXCIsIGpzb24pO1xuXG4gICAgaWYgKCFzb3VsIHx8IGZyb21DbHVzdGVyKSByZXR1cm4gbXNnO1xuICAgIHJldHVybiByZWRpc1xuICAgICAgLmJhdGNoZWRHZXQoc291bCwgcmVzdWx0ID0+IHtcbiAgICAgICAgY29uc3QganNvbiA9IHtcbiAgICAgICAgICBcIiNcIjogZnJvbS5tc2dJZCgpLFxuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIHB1dDogcmVzdWx0ID8geyBbc291bF06IHJlc3VsdCB9IDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGZyb20uc2VuZCh7XG4gICAgICAgICAganNvbixcbiAgICAgICAgICBpZ25vcmVMZWVjaGluZzogdHJ1ZSxcbiAgICAgICAgICBza2lwVmFsaWRhdGlvbjogIXJlc3VsdCB8fCBza2lwVmFsaWRhdGlvblxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc3QganNvbiA9IHtcbiAgICAgICAgICBcIiNcIjogZnJvbS5tc2dJZCgpLFxuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIGVycjogYCR7ZXJyfWBcbiAgICAgICAgfTtcblxuICAgICAgICBmcm9tLnNlbmQoeyBqc29uLCBpZ25vcmVMZWVjaGluZzogdHJ1ZSwgc2tpcFZhbGlkYXRpb24gfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4gbXNnKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRiO1xufTtcbiIsImltcG9ydCB7IGtleXMgfSBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IGZsYXR0ZW4gPSByZXF1aXJlKFwiZmxhdFwiKTtcblxuY29uc3QgRklFTERfU0laRV9MSU1JVCA9IDEwMDAwMDtcblxuZnVuY3Rpb24gcG9zdFVuZmxhdHRlbihvYmopIHtcbiAgLy8gVGhpcyBpcyBwcm9iYWJseSBvbmx5IG5lY2Vzc2FyeSBpZiB5b3UgYXJlIHN0dXBpZCBsaWtlIG1lIGFuZCB1c2UgdGhlIGRlZmF1bHQgLiBkZWxpbWl0ZXIgZm9yIGZsYXR0ZW5cbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIGxldCBhcnJvdyA9IChvYmouXyAmJiBvYmouX1tcIj5cIl0pIHx8IHt9O1xuXG4gIGtleXMoYXJyb3cpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgbGV0IHZhbHVlID0gYXJyb3dba2V5XTtcblxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCB2YWxLZXlzID0ga2V5cyh2YWx1ZSk7XG4gICAgICBsZXQgcmVtYWluZGVyID0gdmFsS2V5c1swXTtcblxuICAgICAgaWYgKHJlbWFpbmRlcikge1xuICAgICAgICBsZXQgcmVhbEtleSA9IFtrZXksIHZhbEtleXNdLmpvaW4oXCIuXCIpO1xuICAgICAgICBsZXQgcmVhbFZhbHVlID0gdmFsdWVbcmVtYWluZGVyXTtcblxuICAgICAgICBkZWxldGUgYXJyb3dba2V5XTtcbiAgICAgICAgYXJyb3dbcmVhbEtleV0gPSByZWFsVmFsdWU7XG4gICAgICAgIHJlYWxWYWx1ZSA9IChvYmpba2V5XSAmJiBvYmpba2V5XVtyZW1haW5kZXJdKSB8fCBudWxsO1xuICAgICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgICAgIG9ialtyZWFsS2V5XSA9IHJlYWxWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBrZXlzKG9iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGlmIChrZXlbMF0gPT09IFwiLlwiKSBkZWxldGUgW2tleV07XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21SZWRpcyhvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIGNvbnN0IHNvcnRlZCA9IHt9O1xuXG4gIGtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChrZXlbMF0gPT09IFwiLlwiKSBkZWxldGUgb2JqW2tleV07XG5cbiAgICBpZiAob2JqW2tleV0gPT09IFwifE5VTEx8XCIpIHtcbiAgICAgIG9ialtrZXldID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldID09PSBcInxVTkRFRklORUR8XCIpIHtcbiAgICAgIG9ialtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICgvPlxcLi8udGVzdChrZXkpKSB7XG4gICAgICBvYmpba2V5XSA9IHBhcnNlRmxvYXQob2JqW2tleV0sIDEwKSB8fCBvYmpba2V5XTtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldICYmIG9ialtrZXldLmxlbmd0aCA+IEZJRUxEX1NJWkVfTElNSVQpIHtcbiAgICAgIG9ialtrZXldID0gb2JqW2tleV0uc2xpY2UoMCwgRklFTERfU0laRV9MSU1JVCk7XG4gICAgICBjb25zb2xlLmxvZyhcInRydW5jYXRlZFwiLCBrZXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgb2JqID0gcG9zdFVuZmxhdHRlbihmbGF0dGVuLnVuZmxhdHRlbihvYmopKTtcblxuICBPYmplY3Qua2V5cyhvYmopXG4gICAgLnNvcnQoKVxuICAgIC5mb3JFYWNoKGtleSA9PiAoc29ydGVkW2tleV0gPSBvYmpba2V5XSkpO1xuXG4gIHJldHVybiBzb3J0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1JlZGlzKG9iaikge1xuICBpZiAoIW9iaikgcmV0dXJuIG9iajtcbiAgb2JqID0gZmxhdHRlbihvYmopO1xuICBrZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAob2JqW2tleV0gPT09IG51bGwpIHtcbiAgICAgIG9ialtrZXldID0gXCJ8TlVMTHxcIjtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG9ialtrZXldID0gXCJ8VU5ERUZJTkVEfFwiO1xuICAgIH1cbiAgICBpZiAob2JqW2tleV0gJiYgb2JqW2tleV0ubGVuZ3RoID4gRklFTERfU0laRV9MSU1JVCkge1xuICAgICAgb2JqW2tleV0gPSBvYmpba2V5XS5zbGljZSgwLCBGSUVMRF9TSVpFX0xJTUlUKTtcbiAgICAgIGNvbnNvbGUubG9nKFwidHJ1bmNhdGVkIGlucHV0XCIsIGtleSk7XG4gICAgfVxuICAgIGlmIChrZXlbMF0gPT09IFwiLlwiKSBkZWxldGUgb2JqW2tleV07XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ZsYXRfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmFtZGFfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmVkaXNfXzsiXSwic291cmNlUm9vdCI6IiJ9