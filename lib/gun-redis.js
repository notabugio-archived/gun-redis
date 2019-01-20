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
          put: _defineProperty({}, soul, result || undefined)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndW4tcmVkaXMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2d1bi1yZWRpcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvY2xpZW50LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9ndW4uanMiLCJ3ZWJwYWNrOi8vZ3VuLXJlZGlzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9yZWNlaXZlci5qcyIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvc2VyaWFsaXplLmpzIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcImZsYXRcIiIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvZXh0ZXJuYWwgXCJyYW1kYVwiIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcInJlZGlzXCIiXSwibmFtZXMiOlsiR0VUX0JBVENIX1NJWkUiLCJQVVRfQkFUQ0hfU0laRSIsIm1ldGFSZSIsImVkZ2VSZSIsImNyZWF0ZUNsaWVudCIsIkd1biIsImNvbmZpZyIsInJlZGlzIiwiZ2V0Iiwic291bCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiaGdldGFsbCIsImVyciIsInJlcyIsImNvbnNvbGUiLCJlcnJvciIsInVuZGVmaW5lZCIsInJlYWQiLCJ0aGVuIiwicmF3RGF0YSIsImRhdGEiLCJTRUEiLCJpbmRleE9mIiwiZm9yRWFjaCIsImtleSIsInZlcmlmeSIsIm9wdCIsInBhY2siLCJ1bnBhY2siLCJiYXRjaGVkR2V0IiwiY2IiLCJoa2V5cyIsIm5vZGVLZXlzIiwic3RhY2siLCJsZW5ndGgiLCJsb2ciLCJhdHRyS2V5cyIsImZpbHRlciIsIm1hdGNoIiwicmVhZEJhdGNoIiwib2siLCJmYWlsIiwiYmF0Y2giLCJzcGxpY2UiLCJiYXRjaE1ldGEiLCJtYXAiLCJyZXBsYWNlIiwiaG1nZXQiLCJtZXRhIiwib2JqIiwidmFsIiwiaWR4IiwicmVzdWx0IiwicmVhZE5leHRCYXRjaCIsImRvbmUiLCJjYXRjaCIsIndyaXRlIiwicHV0IiwiYWxsIiwibm9kZSIsIndyaXRlTmV4dEJhdGNoIiwidXBkYXRlcyIsIl8iLCJobXNldCIsImF0dGFjaFRvR3VuIiwib24iLCJkYiIsInRvIiwibmV4dCIsInJlcXVlc3QiLCJkZWR1cElkIiwicmVjZWl2ZXIiLCJyZWNlaXZlckZucyIsInJlc3BvbmRUb0dldHMiLCJza2lwVmFsaWRhdGlvbiIsIm9uSW4iLCJtc2ciLCJmcm9tIiwianNvbiIsIm1zZ0lkIiwic2VuZCIsImlnbm9yZUxlZWNoaW5nIiwiZmxhdHRlbiIsInJlcXVpcmUiLCJGSUVMRF9TSVpFX0xJTUlUIiwicG9zdFVuZmxhdHRlbiIsImFycm93IiwidmFsdWUiLCJ2YWxLZXlzIiwicmVtYWluZGVyIiwicmVhbEtleSIsImpvaW4iLCJyZWFsVmFsdWUiLCJmcm9tUmVkaXMiLCJzb3J0ZWQiLCJ0ZXN0IiwicGFyc2VGbG9hdCIsInNsaWNlIiwidW5mbGF0dGVuIiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJ0b1JlZGlzIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztB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QUM5QixRQUFJeUIsR0FBRyxDQUFDekIsR0FBRCxDQUFILEtBQWEsSUFBakIsRUFBdUI7QUFDckJ5QixTQUFHLENBQUN6QixHQUFELENBQUgsR0FBVyxRQUFYO0FBQ0Q7O0FBQ0QsUUFBSXlCLEdBQUcsQ0FBQ3pCLEdBQUQsQ0FBSCxLQUFhUixTQUFqQixFQUE0QjtBQUMxQmlDLFNBQUcsQ0FBQ3pCLEdBQUQsQ0FBSCxHQUFXLGFBQVg7QUFDRDs7QUFDRCxRQUFJeUIsR0FBRyxDQUFDekIsR0FBRCxDQUFILElBQVl5QixHQUFHLENBQUN6QixHQUFELENBQUgsQ0FBU1UsTUFBVCxHQUFrQmtELGdCQUFsQyxFQUFvRDtBQUNsRG5DLFNBQUcsQ0FBQ3pCLEdBQUQsQ0FBSCxHQUFXeUIsR0FBRyxDQUFDekIsR0FBRCxDQUFILENBQVN5RSxLQUFULENBQWUsQ0FBZixFQUFrQmIsZ0JBQWxCLENBQVg7QUFDQXRFLGFBQU8sQ0FBQ3FCLEdBQVIsQ0FBWSxpQkFBWixFQUErQlgsR0FBL0I7QUFDRDs7QUFDRCxRQUFJQSxHQUFHLENBQUMsQ0FBRCxDQUFILEtBQVcsR0FBZixFQUFvQixPQUFPeUIsR0FBRyxDQUFDekIsR0FBRCxDQUFWO0FBQ3JCLEdBWkQ7QUFhQSxTQUFPeUIsR0FBUDtBQUNELEM7Ozs7Ozs7Ozs7O0FDcEZELGtEOzs7Ozs7Ozs7OztBQ0FBLG1EOzs7Ozs7Ozs7OztBQ0FBLG1EIiwiZmlsZSI6Imd1bi1yZWRpcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcImZsYXRcIiksIHJlcXVpcmUoXCJyYW1kYVwiKSwgcmVxdWlyZShcInJlZGlzXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwiZ3VuLXJlZGlzXCIsIFtcImZsYXRcIiwgXCJyYW1kYVwiLCBcInJlZGlzXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImd1bi1yZWRpc1wiXSA9IGZhY3RvcnkocmVxdWlyZShcImZsYXRcIiksIHJlcXVpcmUoXCJyYW1kYVwiKSwgcmVxdWlyZShcInJlZGlzXCIpKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJndW4tcmVkaXNcIl0gPSBmYWN0b3J5KHJvb3RbXCJmbGF0XCJdLCByb290W1wicmFtZGFcIl0sIHJvb3RbXCJyZWRpc1wiXSk7XG59KSh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ZsYXRfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yYW1kYV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JlZGlzX18pIHtcbnJldHVybiAiLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImltcG9ydCB7IHdpdGhvdXQsIGtleXMsIHBhdGgsIHBpY2sgfSBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCBhcyBjcmVhdGVSZWRpc0NsaWVudCB9IGZyb20gXCJyZWRpc1wiO1xuaW1wb3J0IHsgdG9SZWRpcywgZnJvbVJlZGlzIH0gZnJvbSBcIi4vc2VyaWFsaXplXCI7XG5cbmNvbnN0IEdFVF9CQVRDSF9TSVpFID0gMTAwMDA7XG5jb25zdCBQVVRfQkFUQ0hfU0laRSA9IDEwMDAwO1xuXG5jb25zdCBtZXRhUmUgPSAvXl9cXC4uKi87XG5jb25zdCBlZGdlUmUgPSAvKFxcLiMkKS87XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVDbGllbnQgPSAoR3VuLCAuLi5jb25maWcpID0+IHtcbiAgY29uc3QgcmVkaXMgPSBjcmVhdGVSZWRpc0NsaWVudCguLi5jb25maWcpO1xuXG4gIGNvbnN0IGdldCA9IHNvdWwgPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIXNvdWwpIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgcmVkaXMuaGdldGFsbChzb3VsLCBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcImdldCBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZnJvbVJlZGlzKHJlcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSk7XG5cbiAgY29uc3QgcmVhZCA9IHNvdWwgPT5cbiAgICBnZXQoc291bCkudGhlbihyYXdEYXRhID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSByYXdEYXRhID8geyAuLi5yYXdEYXRhIH0gOiByYXdEYXRhO1xuXG4gICAgICBpZiAoIUd1bi5TRUEgfHwgc291bC5pbmRleE9mKFwiflwiKSA9PT0gLTEpIHJldHVybiByYXdEYXRhO1xuICAgICAgd2l0aG91dChbXCJfXCJdLCBrZXlzKGRhdGEpKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIEd1bi5TRUEudmVyaWZ5KFxuICAgICAgICAgIEd1bi5TRUEub3B0LnBhY2socmF3RGF0YVtrZXldLCBrZXksIHJhd0RhdGEsIHNvdWwpLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHJlcyA9PiAoZGF0YVtrZXldID0gR3VuLlNFQS5vcHQudW5wYWNrKHJlcywga2V5LCByYXdEYXRhKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG5cbiAgY29uc3QgYmF0Y2hlZEdldCA9IChzb3VsLCBjYikgPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWRpcy5oa2V5cyhzb3VsLCAoZXJyLCBub2RlS2V5cykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcImVycm9yXCIsIGVyci5zdGFjayB8fCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZUtleXMubGVuZ3RoIDw9IEdFVF9CQVRDSF9TSVpFKSB7XG4gICAgICAgICAgcmV0dXJuIGdldChzb3VsKS50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICBjYihyZXMpO1xuICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0IGJpZyBzb3VsXCIsIHNvdWwsIG5vZGVLZXlzLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IGF0dHJLZXlzID0gbm9kZUtleXMuZmlsdGVyKGtleSA9PiAha2V5Lm1hdGNoKG1ldGFSZSkpO1xuICAgICAgICBjb25zdCByZWFkQmF0Y2ggPSAoKSA9PlxuICAgICAgICAgIG5ldyBQcm9taXNlKChvaywgZmFpbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYmF0Y2ggPSBhdHRyS2V5cy5zcGxpY2UoMCwgR0VUX0JBVENIX1NJWkUpO1xuXG4gICAgICAgICAgICBpZiAoIWJhdGNoLmxlbmd0aCkgcmV0dXJuIG9rKHRydWUpO1xuICAgICAgICAgICAgY29uc3QgYmF0Y2hNZXRhID0gYmF0Y2gubWFwKGtleSA9PlxuICAgICAgICAgICAgICBgXy4+LiR7a2V5fWAucmVwbGFjZShlZGdlUmUsIFwiXCIpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVkaXMuaG1nZXQoc291bCwgYmF0Y2hNZXRhLCAoZXJyLCBtZXRhKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImhtZ2V0IGVyclwiLCBlcnIuc3RhY2sgfHwgZXJyKSB8fCBmYWlsKGVycilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICAgICAgICBcIl8uI1wiOiBzb3VsXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgbWV0YS5mb3JFYWNoKCh2YWwsIGlkeCkgPT4gKG9ialtiYXRjaE1ldGFbaWR4XV0gPSB2YWwpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlZGlzLmhtZ2V0KHNvdWwsIGJhdGNoLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiaG1nZXQgZXJyXCIsIGVyci5zdGFjayB8fCBlcnIpIHx8IGZhaWwoZXJyKVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzLmZvckVhY2goKHZhbCwgaWR4KSA9PiAob2JqW2JhdGNoW2lkeF1dID0gdmFsKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZnJvbVJlZGlzKG9iaik7XG5cbiAgICAgICAgICAgICAgICBjYihyZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvaygpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWFkTmV4dEJhdGNoID0gKCkgPT5cbiAgICAgICAgICByZWFkQmF0Y2goKS50aGVuKGRvbmUgPT4gIWRvbmUgJiYgcmVhZE5leHRCYXRjaCk7XG5cbiAgICAgICAgcmV0dXJuIHJlYWROZXh0QmF0Y2goKVxuICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIGNvbnN0IHdyaXRlID0gcHV0ID0+XG4gICAgUHJvbWlzZS5hbGwoXG4gICAgICBrZXlzKHB1dCkubWFwKFxuICAgICAgICBzb3VsID0+XG4gICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHB1dFtzb3VsXTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBwYXRoKFtcIl9cIiwgXCI+XCJdLCBub2RlKSB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVLZXlzID0ga2V5cyhtZXRhKTtcbiAgICAgICAgICAgIGNvbnN0IHdyaXRlTmV4dEJhdGNoID0gKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBiYXRjaCA9IG5vZGVLZXlzLnNwbGljZSgwLCBQVVRfQkFUQ0hfU0laRSk7XG5cbiAgICAgICAgICAgICAgaWYgKCFiYXRjaC5sZW5ndGgpIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZXMgPSB0b1JlZGlzKHtcbiAgICAgICAgICAgICAgICBfOiB7XG4gICAgICAgICAgICAgICAgICBcIiNcIjogc291bCxcbiAgICAgICAgICAgICAgICAgIFwiPlwiOiBwaWNrKGJhdGNoLCBtZXRhKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4ucGljayhiYXRjaCwgbm9kZSlcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHJlZGlzLmhtc2V0KHNvdWwsIHRvUmVkaXModXBkYXRlcyksIGVyciA9PlxuICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChlcnIpIDogd3JpdGVOZXh0QmF0Y2goKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHdyaXRlTmV4dEJhdGNoKCk7XG4gICAgICAgICAgfSlcbiAgICAgIClcbiAgICApO1xuXG4gIHJldHVybiB7IGdldCwgcmVhZCwgYmF0Y2hlZEdldCwgd3JpdGUgfTtcbn07XG4iLCJpbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiLi9jbGllbnRcIjtcblxuZXhwb3J0IGNvbnN0IGF0dGFjaFRvR3VuID0gR3VuID0+IEd1bi5vbihcImNyZWF0ZVwiLCBmdW5jdGlvbihkYikge1xuICB0aGlzLnRvLm5leHQoZGIpO1xuICBjb25zdCByZWRpcyA9IEd1bi5yZWRpcyA9IGRiLnJlZGlzID0gY3JlYXRlQ2xpZW50KEd1bik7XG5cbiAgZGIub24oXCJnZXRcIiwgZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHRoaXMudG8ubmV4dChyZXF1ZXN0KTtcbiAgICBjb25zdCBkZWR1cElkID0gcmVxdWVzdFtcIiNcIl07XG4gICAgY29uc3QgZ2V0ID0gcmVxdWVzdC5nZXQ7XG4gICAgY29uc3Qgc291bCA9IGdldFtcIiNcIl07XG5cbiAgICByZWRpcy5iYXRjaGVkR2V0KHNvdWwsIHJlc3VsdCA9PiBkYi5vbihcImluXCIsIHtcbiAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgcHV0OiByZXN1bHQgPyB7IFtzb3VsXTogcmVzdWx0IH0gOiBudWxsLFxuICAgICAgZXJyOiBudWxsXG4gICAgfSkpLmNhdGNoKGVyciA9PlxuICAgICAgY29uc29sZS5lcnJvcihcImVycm9yXCIsIGVyci5zdGFjayB8fCBlcnIpIHx8XG4gICAgICBkYi5vbihcImluXCIsIHtcbiAgICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICAgIHB1dDogbnVsbCxcbiAgICAgICAgZXJyXG4gICAgICB9KVxuICAgICk7XG4gIH0pO1xuXG4gIGRiLm9uKFwicHV0XCIsIGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICB0aGlzLnRvLm5leHQocmVxdWVzdCk7XG4gICAgY29uc3QgZGVkdXBJZCA9IHJlcXVlc3RbXCIjXCJdO1xuXG4gICAgcmVkaXMud3JpdGUocmVxdWVzdC5wdXQpXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICBkYi5vbihcImluXCIsIHtcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgICBlcnI6IG51bGxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC5jYXRjaChlcnIgPT5cbiAgICAgICAgZGIub24oXCJpblwiLCB7XG4gICAgICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICAgIGVycjogZXJyXG4gICAgICAgIH0pXG4gICAgICApO1xuICB9KTtcbn0pO1xuIiwiaW1wb3J0ICogYXMgcmVjZWl2ZXJGbnMgZnJvbSBcIi4vcmVjZWl2ZXJcIjtcbmV4cG9ydCB7IGF0dGFjaFRvR3VuIH0gZnJvbSBcIi4vZ3VuXCI7XG5cbmV4cG9ydCBjb25zdCByZWNlaXZlciA9IHJlY2VpdmVyRm5zO1xuIiwiaW1wb3J0IHsgcGF0aCwgcHJvcCB9IGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50XCI7XG5cbmV4cG9ydCBjb25zdCByZXNwb25kVG9HZXRzID0gKEd1biwgeyBza2lwVmFsaWRhdGlvbiA9IHRydWUgfSA9IHt9KSA9PiBkYiA9PiB7XG4gIGNvbnN0IHJlZGlzID0gY3JlYXRlQ2xpZW50KEd1bik7XG5cbiAgZGIub25Jbihtc2cgPT4ge1xuICAgIGNvbnN0IHsgZnJvbSwganNvbiB9ID0gbXNnO1xuICAgIGNvbnN0IHNvdWwgPSBwYXRoKFtcImdldFwiLCBcIiNcIl0sIGpzb24pO1xuICAgIGNvbnN0IGRlZHVwSWQgPSBwcm9wKFwiI1wiLCBqc29uKTtcblxuICAgIGlmICghc291bCkgcmV0dXJuIG1zZztcbiAgICByZXR1cm4gcmVkaXNcbiAgICAgIC5iYXRjaGVkR2V0KHNvdWwsIHJlc3VsdCA9PiB7XG4gICAgICAgIGNvbnN0IGpzb24gPSB7XG4gICAgICAgICAgXCIjXCI6IGZyb20ubXNnSWQoKSxcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBwdXQ6IHsgW3NvdWxdOiByZXN1bHQgfHwgdW5kZWZpbmVkIH1cbiAgICAgICAgfTtcblxuICAgICAgICBmcm9tLnNlbmQoe1xuICAgICAgICAgIGpzb24sXG4gICAgICAgICAgaWdub3JlTGVlY2hpbmc6IHRydWUsXG4gICAgICAgICAgc2tpcFZhbGlkYXRpb246ICFyZXN1bHQgfHwgc2tpcFZhbGlkYXRpb25cbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnN0IGpzb24gPSB7XG4gICAgICAgICAgXCIjXCI6IGZyb20ubXNnSWQoKSxcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBlcnI6IGAke2Vycn1gXG4gICAgICAgIH07XG5cbiAgICAgICAgZnJvbS5zZW5kKHsganNvbiwgaWdub3JlTGVlY2hpbmc6IHRydWUsIHNraXBWYWxpZGF0aW9uIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IG1zZyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYjtcbn07XG4iLCJpbXBvcnQgeyBrZXlzIH0gZnJvbSBcInJhbWRhXCI7XG5jb25zdCBmbGF0dGVuID0gcmVxdWlyZShcImZsYXRcIik7XG5cbmNvbnN0IEZJRUxEX1NJWkVfTElNSVQgPSAxMDAwMDA7XG5cbmZ1bmN0aW9uIHBvc3RVbmZsYXR0ZW4ob2JqKSB7XG4gIC8vIFRoaXMgaXMgcHJvYmFibHkgb25seSBuZWNlc3NhcnkgaWYgeW91IGFyZSBzdHVwaWQgbGlrZSBtZSBhbmQgdXNlIHRoZSBkZWZhdWx0IC4gZGVsaW1pdGVyIGZvciBmbGF0dGVuXG4gIGlmICghb2JqKSByZXR1cm4gb2JqO1xuICBsZXQgYXJyb3cgPSAob2JqLl8gJiYgb2JqLl9bXCI+XCJdKSB8fCB7fTtcblxuICBrZXlzKGFycm93KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGxldCB2YWx1ZSA9IGFycm93W2tleV07XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgdmFsS2V5cyA9IGtleXModmFsdWUpO1xuICAgICAgbGV0IHJlbWFpbmRlciA9IHZhbEtleXNbMF07XG5cbiAgICAgIGlmIChyZW1haW5kZXIpIHtcbiAgICAgICAgbGV0IHJlYWxLZXkgPSBba2V5LCB2YWxLZXlzXS5qb2luKFwiLlwiKTtcbiAgICAgICAgbGV0IHJlYWxWYWx1ZSA9IHZhbHVlW3JlbWFpbmRlcl07XG5cbiAgICAgICAgZGVsZXRlIGFycm93W2tleV07XG4gICAgICAgIGFycm93W3JlYWxLZXldID0gcmVhbFZhbHVlO1xuICAgICAgICByZWFsVmFsdWUgPSAob2JqW2tleV0gJiYgb2JqW2tleV1bcmVtYWluZGVyXSkgfHwgbnVsbDtcbiAgICAgICAgZGVsZXRlIG9ialtrZXldO1xuICAgICAgICBvYmpbcmVhbEtleV0gPSByZWFsVmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAga2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIFtrZXldO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUmVkaXMob2JqKSB7XG4gIGlmICghb2JqKSByZXR1cm4gb2JqO1xuICBjb25zdCBzb3J0ZWQgPSB7fTtcblxuICBrZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIG9ialtrZXldO1xuXG4gICAgaWYgKG9ialtrZXldID09PSBcInxOVUxMfFwiKSB7XG4gICAgICBvYmpba2V5XSA9IG51bGw7XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSA9PT0gXCJ8VU5ERUZJTkVEfFwiKSB7XG4gICAgICBvYmpba2V5XSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoLz5cXC4vLnRlc3Qoa2V5KSkge1xuICAgICAgb2JqW2tleV0gPSBwYXJzZUZsb2F0KG9ialtrZXldLCAxMCkgfHwgb2JqW2tleV07XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSAmJiBvYmpba2V5XS5sZW5ndGggPiBGSUVMRF9TSVpFX0xJTUlUKSB7XG4gICAgICBvYmpba2V5XSA9IG9ialtrZXldLnNsaWNlKDAsIEZJRUxEX1NJWkVfTElNSVQpO1xuICAgICAgY29uc29sZS5sb2coXCJ0cnVuY2F0ZWRcIiwga2V5KTtcbiAgICB9XG4gIH0pO1xuXG4gIG9iaiA9IHBvc3RVbmZsYXR0ZW4oZmxhdHRlbi51bmZsYXR0ZW4ob2JqKSk7XG5cbiAgT2JqZWN0LmtleXMob2JqKVxuICAgIC5zb3J0KClcbiAgICAuZm9yRWFjaChrZXkgPT4gKHNvcnRlZFtrZXldID0gb2JqW2tleV0pKTtcblxuICByZXR1cm4gc29ydGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9SZWRpcyhvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIG9iaiA9IGZsYXR0ZW4ob2JqKTtcbiAga2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKG9ialtrZXldID09PSBudWxsKSB7XG4gICAgICBvYmpba2V5XSA9IFwifE5VTEx8XCI7XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvYmpba2V5XSA9IFwifFVOREVGSU5FRHxcIjtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldICYmIG9ialtrZXldLmxlbmd0aCA+IEZJRUxEX1NJWkVfTElNSVQpIHtcbiAgICAgIG9ialtrZXldID0gb2JqW2tleV0uc2xpY2UoMCwgRklFTERfU0laRV9MSU1JVCk7XG4gICAgICBjb25zb2xlLmxvZyhcInRydW5jYXRlZCBpbnB1dFwiLCBrZXkpO1xuICAgIH1cbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIG9ialtrZXldO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9mbGF0X187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JhbWRhX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JlZGlzX187Il0sInNvdXJjZVJvb3QiOiIifQ==