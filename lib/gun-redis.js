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
          json = msg.json;
      var soul = (0, _ramda.path)(["get", "#"], json);
      var dedupId = (0, _ramda.prop)("#", json);
      if (!soul) return msg;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndW4tcmVkaXMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2d1bi1yZWRpcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvY2xpZW50LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9ndW4uanMiLCJ3ZWJwYWNrOi8vZ3VuLXJlZGlzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9yZWNlaXZlci5qcyIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvc2VyaWFsaXplLmpzIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcImZsYXRcIiIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvZXh0ZXJuYWwgXCJyYW1kYVwiIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcInJlZGlzXCIiXSwibmFtZXMiOlsiR0VUX0JBVENIX1NJWkUiLCJQVVRfQkFUQ0hfU0laRSIsIm1ldGFSZSIsImVkZ2VSZSIsImNyZWF0ZUNsaWVudCIsIkd1biIsImNvbmZpZyIsInJlZGlzIiwiZ2V0Iiwic291bCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiaGdldGFsbCIsImVyciIsInJlcyIsImNvbnNvbGUiLCJlcnJvciIsInVuZGVmaW5lZCIsInJlYWQiLCJ0aGVuIiwicmF3RGF0YSIsImRhdGEiLCJTRUEiLCJpbmRleE9mIiwiZm9yRWFjaCIsImtleSIsInZlcmlmeSIsIm9wdCIsInBhY2siLCJ1bnBhY2siLCJiYXRjaGVkR2V0IiwiY2IiLCJoa2V5cyIsIm5vZGVLZXlzIiwic3RhY2siLCJsZW5ndGgiLCJsb2ciLCJhdHRyS2V5cyIsImZpbHRlciIsIm1hdGNoIiwicmVhZEJhdGNoIiwib2siLCJmYWlsIiwiYmF0Y2giLCJzcGxpY2UiLCJiYXRjaE1ldGEiLCJtYXAiLCJyZXBsYWNlIiwiaG1nZXQiLCJtZXRhIiwib2JqIiwidmFsIiwiaWR4IiwicmVzdWx0IiwicmVhZE5leHRCYXRjaCIsImRvbmUiLCJjYXRjaCIsIndyaXRlIiwicHV0IiwiYWxsIiwibm9kZSIsIndyaXRlTmV4dEJhdGNoIiwidXBkYXRlcyIsIl8iLCJobXNldCIsImF0dGFjaFRvR3VuIiwib24iLCJkYiIsInRvIiwibmV4dCIsInJlcXVlc3QiLCJkZWR1cElkIiwicmVjZWl2ZXIiLCJyZWNlaXZlckZucyIsInJlc3BvbmRUb0dldHMiLCJza2lwVmFsaWRhdGlvbiIsIm9uSW4iLCJtc2ciLCJmcm9tIiwianNvbiIsIm1zZ0lkIiwic2VuZCIsImlnbm9yZUxlZWNoaW5nIiwiZmxhdHRlbiIsInJlcXVpcmUiLCJGSUVMRF9TSVpFX0xJTUlUIiwicG9zdFVuZmxhdHRlbiIsImFycm93IiwidmFsdWUiLCJ2YWxLZXlzIiwicmVtYWluZGVyIiwicmVhbEtleSIsImpvaW4iLCJyZWFsVmFsdWUiLCJmcm9tUmVkaXMiLCJzb3J0ZWQiLCJ0ZXN0IiwicGFyc2VGbG9hdCIsInNsaWNlIiwidW5mbGF0dGVuIiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJ0b1JlZGlzIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztB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QUFjO0FBQzlCLFFBQUl5QixHQUFHLENBQUN6QixHQUFELENBQUgsS0FBYSxJQUFqQixFQUF1QjtBQUNyQnlCLFNBQUcsQ0FBQ3pCLEdBQUQsQ0FBSCxHQUFXLFFBQVg7QUFDRDs7QUFDRCxRQUFJeUIsR0FBRyxDQUFDekIsR0FBRCxDQUFILEtBQWFSLFNBQWpCLEVBQTRCO0FBQzFCaUMsU0FBRyxDQUFDekIsR0FBRCxDQUFILEdBQVcsYUFBWDtBQUNEOztBQUNELFFBQUl5QixHQUFHLENBQUN6QixHQUFELENBQUgsSUFBWXlCLEdBQUcsQ0FBQ3pCLEdBQUQsQ0FBSCxDQUFTVSxNQUFULEdBQWtCa0QsZ0JBQWxDLEVBQW9EO0FBQ2xEbkMsU0FBRyxDQUFDekIsR0FBRCxDQUFILEdBQVd5QixHQUFHLENBQUN6QixHQUFELENBQUgsQ0FBU3lFLEtBQVQsQ0FBZSxDQUFmLEVBQWtCYixnQkFBbEIsQ0FBWDtBQUNBdEUsYUFBTyxDQUFDcUIsR0FBUixDQUFZLGlCQUFaLEVBQStCWCxHQUEvQjtBQUNEOztBQUNELFFBQUlBLEdBQUcsQ0FBQyxDQUFELENBQUgsS0FBVyxHQUFmLEVBQW9CLE9BQU95QixHQUFHLENBQUN6QixHQUFELENBQVY7QUFDckIsR0FaRDtBQWFBLFNBQU95QixHQUFQO0FBQ0QsQzs7Ozs7Ozs7Ozs7QUNwRkQsa0Q7Ozs7Ozs7Ozs7O0FDQUEsbUQ7Ozs7Ozs7Ozs7O0FDQUEsbUQiLCJmaWxlIjoiZ3VuLXJlZGlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiZmxhdFwiKSwgcmVxdWlyZShcInJhbWRhXCIpLCByZXF1aXJlKFwicmVkaXNcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJndW4tcmVkaXNcIiwgW1wiZmxhdFwiLCBcInJhbWRhXCIsIFwicmVkaXNcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiZ3VuLXJlZGlzXCJdID0gZmFjdG9yeShyZXF1aXJlKFwiZmxhdFwiKSwgcmVxdWlyZShcInJhbWRhXCIpLCByZXF1aXJlKFwicmVkaXNcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImd1bi1yZWRpc1wiXSA9IGZhY3Rvcnkocm9vdFtcImZsYXRcIl0sIHJvb3RbXCJyYW1kYVwiXSwgcm9vdFtcInJlZGlzXCJdKTtcbn0pKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfZmxhdF9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JhbWRhX18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmVkaXNfXykge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiaW1wb3J0IHsgd2l0aG91dCwga2V5cywgcGF0aCwgcGljayB9IGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IGFzIGNyZWF0ZVJlZGlzQ2xpZW50IH0gZnJvbSBcInJlZGlzXCI7XG5pbXBvcnQgeyB0b1JlZGlzLCBmcm9tUmVkaXMgfSBmcm9tIFwiLi9zZXJpYWxpemVcIjtcblxuY29uc3QgR0VUX0JBVENIX1NJWkUgPSAxMDAwMDtcbmNvbnN0IFBVVF9CQVRDSF9TSVpFID0gMTAwMDA7XG5cbmNvbnN0IG1ldGFSZSA9IC9eX1xcLi4qLztcbmNvbnN0IGVkZ2VSZSA9IC8oXFwuIyQpLztcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNsaWVudCA9IChHdW4sIC4uLmNvbmZpZykgPT4ge1xuICBjb25zdCByZWRpcyA9IGNyZWF0ZVJlZGlzQ2xpZW50KC4uLmNvbmZpZyk7XG5cbiAgY29uc3QgZ2V0ID0gc291bCA9PlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghc291bCkgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgICByZWRpcy5oZ2V0YWxsKHNvdWwsIGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZ2V0IGVycm9yXCIsIGVycik7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShmcm9tUmVkaXMocmVzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9KTtcblxuICBjb25zdCByZWFkID0gc291bCA9PlxuICAgIGdldChzb3VsKS50aGVuKHJhd0RhdGEgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHJhd0RhdGEgPyB7IC4uLnJhd0RhdGEgfSA6IHJhd0RhdGE7XG5cbiAgICAgIGlmICghR3VuLlNFQSB8fCBzb3VsLmluZGV4T2YoXCJ+XCIpID09PSAtMSkgcmV0dXJuIHJhd0RhdGE7XG4gICAgICB3aXRob3V0KFtcIl9cIl0sIGtleXMoZGF0YSkpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgR3VuLlNFQS52ZXJpZnkoXG4gICAgICAgICAgR3VuLlNFQS5vcHQucGFjayhyYXdEYXRhW2tleV0sIGtleSwgcmF3RGF0YSwgc291bCksXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgcmVzID0+IChkYXRhW2tleV0gPSBHdW4uU0VBLm9wdC51bnBhY2socmVzLCBrZXksIHJhd0RhdGEpKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcblxuICBjb25zdCBiYXRjaGVkR2V0ID0gKHNvdWwsIGNiKSA9PlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJlZGlzLmhrZXlzKHNvdWwsIChlcnIsIG5vZGVLZXlzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3JcIiwgZXJyLnN0YWNrIHx8IGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlS2V5cy5sZW5ndGggPD0gR0VUX0JBVENIX1NJWkUpIHtcbiAgICAgICAgICByZXR1cm4gZ2V0KHNvdWwpLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgIGNiKHJlcyk7XG4gICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCJnZXQgYmlnIHNvdWxcIiwgc291bCwgbm9kZUtleXMubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgYXR0cktleXMgPSBub2RlS2V5cy5maWx0ZXIoa2V5ID0+ICFrZXkubWF0Y2gobWV0YVJlKSk7XG4gICAgICAgIGNvbnN0IHJlYWRCYXRjaCA9ICgpID0+XG4gICAgICAgICAgbmV3IFByb21pc2UoKG9rLCBmYWlsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBiYXRjaCA9IGF0dHJLZXlzLnNwbGljZSgwLCBHRVRfQkFUQ0hfU0laRSk7XG5cbiAgICAgICAgICAgIGlmICghYmF0Y2gubGVuZ3RoKSByZXR1cm4gb2sodHJ1ZSk7XG4gICAgICAgICAgICBjb25zdCBiYXRjaE1ldGEgPSBiYXRjaC5tYXAoa2V5ID0+XG4gICAgICAgICAgICAgIGBfLj4uJHtrZXl9YC5yZXBsYWNlKGVkZ2VSZSwgXCJcIilcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiByZWRpcy5obWdldChzb3VsLCBiYXRjaE1ldGEsIChlcnIsIG1ldGEpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiaG1nZXQgZXJyXCIsIGVyci5zdGFjayB8fCBlcnIpIHx8IGZhaWwoZXJyKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgICAgICAgIFwiXy4jXCI6IHNvdWxcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBtZXRhLmZvckVhY2goKHZhbCwgaWR4KSA9PiAob2JqW2JhdGNoTWV0YVtpZHhdXSA9IHZhbCkpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVkaXMuaG1nZXQoc291bCwgYmF0Y2gsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJobWdldCBlcnJcIiwgZXJyLnN0YWNrIHx8IGVycikgfHwgZmFpbChlcnIpXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXMuZm9yRWFjaCgodmFsLCBpZHgpID0+IChvYmpbYmF0Y2hbaWR4XV0gPSB2YWwpKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBmcm9tUmVkaXMob2JqKTtcblxuICAgICAgICAgICAgICAgIGNiKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9rKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlYWROZXh0QmF0Y2ggPSAoKSA9PlxuICAgICAgICAgIHJlYWRCYXRjaCgpLnRoZW4oZG9uZSA9PiAhZG9uZSAmJiByZWFkTmV4dEJhdGNoKTtcblxuICAgICAgICByZXR1cm4gcmVhZE5leHRCYXRjaCgpXG4gICAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChyZWplY3QpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgY29uc3Qgd3JpdGUgPSBwdXQgPT5cbiAgICBQcm9taXNlLmFsbChcbiAgICAgIGtleXMocHV0KS5tYXAoXG4gICAgICAgIHNvdWwgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gcHV0W3NvdWxdO1xuICAgICAgICAgICAgY29uc3QgbWV0YSA9IHBhdGgoW1wiX1wiLCBcIj5cIl0sIG5vZGUpIHx8IHt9O1xuICAgICAgICAgICAgY29uc3Qgbm9kZUtleXMgPSBrZXlzKG1ldGEpO1xuICAgICAgICAgICAgY29uc3Qgd3JpdGVOZXh0QmF0Y2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJhdGNoID0gbm9kZUtleXMuc3BsaWNlKDAsIFBVVF9CQVRDSF9TSVpFKTtcblxuICAgICAgICAgICAgICBpZiAoIWJhdGNoLmxlbmd0aCkgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlcyA9IHRvUmVkaXMoe1xuICAgICAgICAgICAgICAgIF86IHtcbiAgICAgICAgICAgICAgICAgIFwiI1wiOiBzb3VsLFxuICAgICAgICAgICAgICAgICAgXCI+XCI6IHBpY2soYmF0Y2gsIG1ldGEpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAuLi5waWNrKGJhdGNoLCBub2RlKVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICByZXR1cm4gcmVkaXMuaG1zZXQoc291bCwgdG9SZWRpcyh1cGRhdGVzKSwgZXJyID0+XG4gICAgICAgICAgICAgICAgZXJyID8gcmVqZWN0KGVycikgOiB3cml0ZU5leHRCYXRjaCgpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gd3JpdGVOZXh0QmF0Y2goKTtcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG5cbiAgcmV0dXJuIHsgZ2V0LCByZWFkLCBiYXRjaGVkR2V0LCB3cml0ZSB9O1xufTtcbiIsImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCIuL2NsaWVudFwiO1xuXG5leHBvcnQgY29uc3QgYXR0YWNoVG9HdW4gPSBHdW4gPT4gR3VuLm9uKFwiY3JlYXRlXCIsIGZ1bmN0aW9uKGRiKSB7XG4gIHRoaXMudG8ubmV4dChkYik7XG4gIGNvbnN0IHJlZGlzID0gR3VuLnJlZGlzID0gZGIucmVkaXMgPSBjcmVhdGVDbGllbnQoR3VuKTtcblxuICBkYi5vbihcImdldFwiLCBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgdGhpcy50by5uZXh0KHJlcXVlc3QpO1xuICAgIGNvbnN0IGRlZHVwSWQgPSByZXF1ZXN0W1wiI1wiXTtcbiAgICBjb25zdCBnZXQgPSByZXF1ZXN0LmdldDtcbiAgICBjb25zdCBzb3VsID0gZ2V0W1wiI1wiXTtcblxuICAgIHJlZGlzLmJhdGNoZWRHZXQoc291bCwgcmVzdWx0ID0+IGRiLm9uKFwiaW5cIiwge1xuICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICBwdXQ6IHJlc3VsdCA/IHsgW3NvdWxdOiByZXN1bHQgfSA6IG51bGwsXG4gICAgICBlcnI6IG51bGxcbiAgICB9KSkuY2F0Y2goZXJyID0+XG4gICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3JcIiwgZXJyLnN0YWNrIHx8IGVycikgfHxcbiAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgcHV0OiBudWxsLFxuICAgICAgICBlcnJcbiAgICAgIH0pXG4gICAgKTtcbiAgfSk7XG5cbiAgZGIub24oXCJwdXRcIiwgZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHRoaXMudG8ubmV4dChyZXF1ZXN0KTtcbiAgICBjb25zdCBkZWR1cElkID0gcmVxdWVzdFtcIiNcIl07XG5cbiAgICByZWRpcy53cml0ZShyZXF1ZXN0LnB1dClcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIG9rOiB0cnVlLFxuICAgICAgICAgIGVycjogbnVsbFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLmNhdGNoKGVyciA9PlxuICAgICAgICBkYi5vbihcImluXCIsIHtcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBvazogZmFsc2UsXG4gICAgICAgICAgZXJyOiBlcnJcbiAgICAgICAgfSlcbiAgICAgICk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgKiBhcyByZWNlaXZlckZucyBmcm9tIFwiLi9yZWNlaXZlclwiO1xuZXhwb3J0IHsgYXR0YWNoVG9HdW4gfSBmcm9tIFwiLi9ndW5cIjtcblxuZXhwb3J0IGNvbnN0IHJlY2VpdmVyID0gcmVjZWl2ZXJGbnM7XG4iLCJpbXBvcnQgeyBwYXRoLCBwcm9wIH0gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiLi9jbGllbnRcIjtcblxuZXhwb3J0IGNvbnN0IHJlc3BvbmRUb0dldHMgPSAoR3VuLCB7IHNraXBWYWxpZGF0aW9uID0gdHJ1ZSB9ID0ge30pID0+IGRiID0+IHtcbiAgY29uc3QgcmVkaXMgPSBjcmVhdGVDbGllbnQoR3VuKTtcblxuICBkYi5vbkluKG1zZyA9PiB7XG4gICAgY29uc3QgeyBmcm9tLCBqc29uIH0gPSBtc2c7XG4gICAgY29uc3Qgc291bCA9IHBhdGgoW1wiZ2V0XCIsIFwiI1wiXSwganNvbik7XG4gICAgY29uc3QgZGVkdXBJZCA9IHByb3AoXCIjXCIsIGpzb24pO1xuXG4gICAgaWYgKCFzb3VsKSByZXR1cm4gbXNnO1xuICAgIHJldHVybiByZWRpc1xuICAgICAgLmJhdGNoZWRHZXQoc291bCwgcmVzdWx0ID0+IHtcbiAgICAgICAgY29uc3QganNvbiA9IHtcbiAgICAgICAgICBcIiNcIjogZnJvbS5tc2dJZCgpLFxuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIHB1dDogcmVzdWx0ID8geyBbc291bF06IHJlc3VsdCB9IDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGZyb20uc2VuZCh7XG4gICAgICAgICAganNvbixcbiAgICAgICAgICBpZ25vcmVMZWVjaGluZzogdHJ1ZSxcbiAgICAgICAgICBza2lwVmFsaWRhdGlvbjogIXJlc3VsdCB8fCBza2lwVmFsaWRhdGlvblxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc3QganNvbiA9IHtcbiAgICAgICAgICBcIiNcIjogZnJvbS5tc2dJZCgpLFxuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIGVycjogYCR7ZXJyfWBcbiAgICAgICAgfTtcblxuICAgICAgICBmcm9tLnNlbmQoeyBqc29uLCBpZ25vcmVMZWVjaGluZzogdHJ1ZSwgc2tpcFZhbGlkYXRpb24gfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4gbXNnKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRiO1xufTtcbiIsImltcG9ydCB7IGtleXMgfSBmcm9tIFwicmFtZGFcIjtcbmNvbnN0IGZsYXR0ZW4gPSByZXF1aXJlKFwiZmxhdFwiKTtcblxuY29uc3QgRklFTERfU0laRV9MSU1JVCA9IDEwMDAwMDtcblxuZnVuY3Rpb24gcG9zdFVuZmxhdHRlbihvYmopIHtcbiAgLy8gVGhpcyBpcyBwcm9iYWJseSBvbmx5IG5lY2Vzc2FyeSBpZiB5b3UgYXJlIHN0dXBpZCBsaWtlIG1lIGFuZCB1c2UgdGhlIGRlZmF1bHQgLiBkZWxpbWl0ZXIgZm9yIGZsYXR0ZW5cbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIGxldCBhcnJvdyA9IChvYmouXyAmJiBvYmouX1tcIj5cIl0pIHx8IHt9O1xuXG4gIGtleXMoYXJyb3cpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgbGV0IHZhbHVlID0gYXJyb3dba2V5XTtcblxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCB2YWxLZXlzID0ga2V5cyh2YWx1ZSk7XG4gICAgICBsZXQgcmVtYWluZGVyID0gdmFsS2V5c1swXTtcblxuICAgICAgaWYgKHJlbWFpbmRlcikge1xuICAgICAgICBsZXQgcmVhbEtleSA9IFtrZXksIHZhbEtleXNdLmpvaW4oXCIuXCIpO1xuICAgICAgICBsZXQgcmVhbFZhbHVlID0gdmFsdWVbcmVtYWluZGVyXTtcblxuICAgICAgICBkZWxldGUgYXJyb3dba2V5XTtcbiAgICAgICAgYXJyb3dbcmVhbEtleV0gPSByZWFsVmFsdWU7XG4gICAgICAgIHJlYWxWYWx1ZSA9IChvYmpba2V5XSAmJiBvYmpba2V5XVtyZW1haW5kZXJdKSB8fCBudWxsO1xuICAgICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgICAgIG9ialtyZWFsS2V5XSA9IHJlYWxWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBrZXlzKG9iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGlmIChrZXlbMF0gPT09IFwiLlwiKSBkZWxldGUgW2tleV07XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21SZWRpcyhvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIGNvbnN0IHNvcnRlZCA9IHt9O1xuXG4gIGtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChrZXlbMF0gPT09IFwiLlwiKSBkZWxldGUgb2JqW2tleV07XG5cbiAgICBpZiAob2JqW2tleV0gPT09IFwifE5VTEx8XCIpIHtcbiAgICAgIG9ialtrZXldID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldID09PSBcInxVTkRFRklORUR8XCIpIHtcbiAgICAgIG9ialtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICgvPlxcLi8udGVzdChrZXkpKSB7XG4gICAgICBvYmpba2V5XSA9IHBhcnNlRmxvYXQob2JqW2tleV0sIDEwKSB8fCBvYmpba2V5XTtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldICYmIG9ialtrZXldLmxlbmd0aCA+IEZJRUxEX1NJWkVfTElNSVQpIHtcbiAgICAgIG9ialtrZXldID0gb2JqW2tleV0uc2xpY2UoMCwgRklFTERfU0laRV9MSU1JVCk7XG4gICAgICBjb25zb2xlLmxvZyhcInRydW5jYXRlZFwiLCBrZXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgb2JqID0gcG9zdFVuZmxhdHRlbihmbGF0dGVuLnVuZmxhdHRlbihvYmopKTtcblxuICBPYmplY3Qua2V5cyhvYmopXG4gICAgLnNvcnQoKVxuICAgIC5mb3JFYWNoKGtleSA9PiAoc29ydGVkW2tleV0gPSBvYmpba2V5XSkpO1xuXG4gIHJldHVybiBzb3J0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1JlZGlzKG9iaikge1xuICBpZiAoIW9iaikgcmV0dXJuIG9iajtcbiAgb2JqID0gZmxhdHRlbihvYmopO1xuICBrZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAob2JqW2tleV0gPT09IG51bGwpIHtcbiAgICAgIG9ialtrZXldID0gXCJ8TlVMTHxcIjtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG9ialtrZXldID0gXCJ8VU5ERUZJTkVEfFwiO1xuICAgIH1cbiAgICBpZiAob2JqW2tleV0gJiYgb2JqW2tleV0ubGVuZ3RoID4gRklFTERfU0laRV9MSU1JVCkge1xuICAgICAgb2JqW2tleV0gPSBvYmpba2V5XS5zbGljZSgwLCBGSUVMRF9TSVpFX0xJTUlUKTtcbiAgICAgIGNvbnNvbGUubG9nKFwidHJ1bmNhdGVkIGlucHV0XCIsIGtleSk7XG4gICAgfVxuICAgIGlmIChrZXlbMF0gPT09IFwiLlwiKSBkZWxldGUgb2JqW2tleV07XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ZsYXRfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmFtZGFfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmVkaXNfXzsiXSwic291cmNlUm9vdCI6IiJ9