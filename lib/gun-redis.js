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

var R = _interopRequireWildcard(__webpack_require__(/*! ramda */ "ramda"));

var _redis = __webpack_require__(/*! redis */ "redis");

var _serialize = __webpack_require__(/*! ./serialize */ "./src/serialize.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var GET_BATCH_SIZE = 10000;
var PUT_BATCH_SIZE = 10000;
var metaRe = /^_\..*/;
var edgeRe = /(\.#$)/;

var createClient = function createClient(Gun) {
  var changeSubscribers = [];

  for (var _len = arguments.length, config = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    config[_key - 1] = arguments[_key];
  }

  var redis = _redis.createClient.apply(void 0, config);

  var notifyChangeSubscribers = function notifyChangeSubscribers(soul, key) {
    return changeSubscribers.map(function (fn) {
      return fn(soul, key);
    });
  };

  var onChange = function onChange(fn) {
    return changeSubscribers.push(fn);
  };

  var offChange = function offChange(fn) {
    return changeSubscribers = R.without([fn], changeSubscribers);
  };

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
      R.without(["_"], R.keys(data)).forEach(function (key) {
        Gun.SEA.verify(Gun.SEA.opt.pack(rawData[key], key, rawData, soul), false, function (res) {
          return data[key] = Gun.SEA.opt.unpack(res, key, rawData);
        });
      });
      return data;
    });
  };

  var readKeyBatch = function readKeyBatch(soul, batch) {
    return new Promise(function (ok, fail) {
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
          return ok((0, _serialize.fromRedis)(obj));
        });
      });
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
            return readKeyBatch(soul, batch).then(function (result) {
              cb(result);
              return ok();
            }, fail);
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
    return Promise.all(R.keys(put).map(function (soul) {
      return new Promise(function (resolve, reject) {
        var hasChanged = false;
        var node = put[soul];
        var meta = R.path(["_", ">"], node) || {};
        var nodeKeys = R.keys(meta);

        var writeNextBatch = function writeNextBatch() {
          var batch = nodeKeys.splice(0, PUT_BATCH_SIZE);

          if (!batch.length) {
            if (hasChanged) notifyChangeSubscribers(soul, hasChanged);
            return resolve();
          }

          var updated = {
            _: {
              "#": soul,
              ">": R.pick(batch, meta)
            },
            ...R.pick(batch, node)
          };
          var updates = (0, _serialize.toRedis)(updated); // return readKeyBatch(soul, batch).then(existing => {

          return get(soul).then(function (existing) {
            var modifiedKey = batch.find(function (key) {
              var updatedVal = R.prop(key, updated);
              var existingVal = R.prop(key, existing);
              if (updatedVal === existingVal) return false;
              var updatedSoul = R.path([key, "#"], updated);
              var existingSoul = R.path([key, "#"], existing);

              if ((updatedSoul || existingSoul) && updatedSoul === existingSoul) {
                return false;
              }

              if (typeof updatedVal === "number" && parseFloat(existingVal) === updatedVal) {
                return false;
              }

              return true;
            });
            if (!modifiedKey) return writeNextBatch();
            return redis.hmset(soul, (0, _serialize.toRedis)(updates), function (err) {
              hasChanged = modifiedKey;
              err ? reject(err) : writeNextBatch();
            });
          });
        };

        return writeNextBatch();
      });
    }));
  };

  onChange(function (soul, key) {
    return console.log("modify", soul, key);
  });
  return {
    get: get,
    read: read,
    batchedGet: batchedGet,
    write: write,
    onChange: onChange,
    offChange: offChange
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

    if (_typeof(obj[key]) === undefined) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndW4tcmVkaXMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2d1bi1yZWRpcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvY2xpZW50LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9ndW4uanMiLCJ3ZWJwYWNrOi8vZ3VuLXJlZGlzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9yZWNlaXZlci5qcyIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvc2VyaWFsaXplLmpzIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcImZsYXRcIiIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvZXh0ZXJuYWwgXCJyYW1kYVwiIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcInJlZGlzXCIiXSwibmFtZXMiOlsiR0VUX0JBVENIX1NJWkUiLCJQVVRfQkFUQ0hfU0laRSIsIm1ldGFSZSIsImVkZ2VSZSIsImNyZWF0ZUNsaWVudCIsIkd1biIsImNoYW5nZVN1YnNjcmliZXJzIiwiY29uZmlnIiwicmVkaXMiLCJub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyIsInNvdWwiLCJrZXkiLCJtYXAiLCJmbiIsIm9uQ2hhbmdlIiwicHVzaCIsIm9mZkNoYW5nZSIsIlIiLCJ3aXRob3V0IiwiZ2V0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJoZ2V0YWxsIiwiZXJyIiwicmVzIiwiY29uc29sZSIsImVycm9yIiwidW5kZWZpbmVkIiwicmVhZCIsInRoZW4iLCJyYXdEYXRhIiwiZGF0YSIsIlNFQSIsImluZGV4T2YiLCJrZXlzIiwiZm9yRWFjaCIsInZlcmlmeSIsIm9wdCIsInBhY2siLCJ1bnBhY2siLCJyZWFkS2V5QmF0Y2giLCJiYXRjaCIsIm9rIiwiZmFpbCIsImJhdGNoTWV0YSIsInJlcGxhY2UiLCJobWdldCIsIm1ldGEiLCJzdGFjayIsIm9iaiIsInZhbCIsImlkeCIsImJhdGNoZWRHZXQiLCJjYiIsImhrZXlzIiwibm9kZUtleXMiLCJsZW5ndGgiLCJsb2ciLCJhdHRyS2V5cyIsImZpbHRlciIsIm1hdGNoIiwicmVhZEJhdGNoIiwic3BsaWNlIiwicmVzdWx0IiwicmVhZE5leHRCYXRjaCIsImRvbmUiLCJjYXRjaCIsIndyaXRlIiwicHV0IiwiYWxsIiwiaGFzQ2hhbmdlZCIsIm5vZGUiLCJwYXRoIiwid3JpdGVOZXh0QmF0Y2giLCJ1cGRhdGVkIiwiXyIsInBpY2siLCJ1cGRhdGVzIiwiZXhpc3RpbmciLCJtb2RpZmllZEtleSIsImZpbmQiLCJ1cGRhdGVkVmFsIiwicHJvcCIsImV4aXN0aW5nVmFsIiwidXBkYXRlZFNvdWwiLCJleGlzdGluZ1NvdWwiLCJwYXJzZUZsb2F0IiwiaG1zZXQiLCJhdHRhY2hUb0d1biIsIm9uIiwiZGIiLCJ0byIsIm5leHQiLCJyZXF1ZXN0IiwiZGVkdXBJZCIsInJlY2VpdmVyIiwicmVjZWl2ZXJGbnMiLCJyZXNwb25kVG9HZXRzIiwic2tpcFZhbGlkYXRpb24iLCJvbkluIiwibXNnIiwiZnJvbSIsImpzb24iLCJmcm9tQ2x1c3RlciIsIm1zZ0lkIiwic2VuZCIsImlnbm9yZUxlZWNoaW5nIiwiZmxhdHRlbiIsInJlcXVpcmUiLCJGSUVMRF9TSVpFX0xJTUlUIiwicG9zdFVuZmxhdHRlbiIsImFycm93IiwidmFsdWUiLCJ2YWxLZXlzIiwicmVtYWluZGVyIiwicmVhbEtleSIsImpvaW4iLCJyZWFsVmFsdWUiLCJmcm9tUmVkaXMiLCJzb3J0ZWQiLCJ0ZXN0Iiwic2xpY2UiLCJ1bmZsYXR0ZW4iLCJPYmplY3QiLCJzb3J0IiwidG9SZWRpcyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbEZBOztBQUNBOztBQUNBOzs7O0FBRUEsSUFBTUEsY0FBYyxHQUFHLEtBQXZCO0FBQ0EsSUFBTUMsY0FBYyxHQUFHLEtBQXZCO0FBRUEsSUFBTUMsTUFBTSxHQUFHLFFBQWY7QUFDQSxJQUFNQyxNQUFNLEdBQUcsUUFBZjs7QUFFTyxJQUFNQyxZQUFZLEdBQUcsU0FBZkEsWUFBZSxDQUFDQyxHQUFELEVBQW9CO0FBQzlDLE1BQUlDLGlCQUFpQixHQUFHLEVBQXhCOztBQUQ4QyxvQ0FBWEMsTUFBVztBQUFYQSxVQUFXO0FBQUE7O0FBRTlDLE1BQU1DLEtBQUssR0FBRyxrQ0FBcUJELE1BQXJCLENBQWQ7O0FBQ0EsTUFBTUUsdUJBQXVCLEdBQUcsU0FBMUJBLHVCQUEwQixDQUFDQyxJQUFELEVBQU9DLEdBQVA7QUFBQSxXQUM5QkwsaUJBQWlCLENBQUNNLEdBQWxCLENBQXNCLFVBQUFDLEVBQUU7QUFBQSxhQUFJQSxFQUFFLENBQUNILElBQUQsRUFBT0MsR0FBUCxDQUFOO0FBQUEsS0FBeEIsQ0FEOEI7QUFBQSxHQUFoQzs7QUFFQSxNQUFNRyxRQUFRLEdBQUcsU0FBWEEsUUFBVyxDQUFBRCxFQUFFO0FBQUEsV0FBSVAsaUJBQWlCLENBQUNTLElBQWxCLENBQXVCRixFQUF2QixDQUFKO0FBQUEsR0FBbkI7O0FBQ0EsTUFBTUcsU0FBUyxHQUFHLFNBQVpBLFNBQVksQ0FBQUgsRUFBRTtBQUFBLFdBQ2pCUCxpQkFBaUIsR0FBR1csQ0FBQyxDQUFDQyxPQUFGLENBQVUsQ0FBQ0wsRUFBRCxDQUFWLEVBQWdCUCxpQkFBaEIsQ0FESDtBQUFBLEdBQXBCOztBQUdBLE1BQU1hLEdBQUcsR0FBRyxTQUFOQSxHQUFNLENBQUFULElBQUk7QUFBQSxXQUNkLElBQUlVLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDL0IsVUFBSSxDQUFDWixJQUFMLEVBQVcsT0FBT1csT0FBTyxDQUFDLElBQUQsQ0FBZDtBQUNYYixXQUFLLENBQUNlLE9BQU4sQ0FBY2IsSUFBZCxFQUFvQixVQUFTYyxHQUFULEVBQWNDLEdBQWQsRUFBbUI7QUFDckMsWUFBSUQsR0FBSixFQUFTO0FBQ1BFLGlCQUFPLENBQUNDLEtBQVIsQ0FBYyxXQUFkLEVBQTJCSCxHQUEzQjtBQUNBRixnQkFBTSxDQUFDRSxHQUFELENBQU47QUFDRCxTQUhELE1BR087QUFDTEgsaUJBQU8sQ0FBQywwQkFBVUksR0FBVixDQUFELENBQVA7QUFDRDtBQUNGLE9BUEQ7QUFRQSxhQUFPRyxTQUFQO0FBQ0QsS0FYRCxDQURjO0FBQUEsR0FBaEI7O0FBY0EsTUFBTUMsSUFBSSxHQUFHLFNBQVBBLElBQU8sQ0FBQW5CLElBQUk7QUFBQSxXQUNmUyxHQUFHLENBQUNULElBQUQsQ0FBSCxDQUFVb0IsSUFBVixDQUFlLFVBQUFDLE9BQU8sRUFBSTtBQUN4QixVQUFNQyxJQUFJLEdBQUdELE9BQU8sR0FBRyxFQUFFLEdBQUdBO0FBQUwsT0FBSCxHQUFvQkEsT0FBeEM7QUFFQSxVQUFJLENBQUMxQixHQUFHLENBQUM0QixHQUFMLElBQVl2QixJQUFJLENBQUN3QixPQUFMLENBQWEsR0FBYixNQUFzQixDQUFDLENBQXZDLEVBQTBDLE9BQU9ILE9BQVA7QUFDMUNkLE9BQUMsQ0FBQ0MsT0FBRixDQUFVLENBQUMsR0FBRCxDQUFWLEVBQWlCRCxDQUFDLENBQUNrQixJQUFGLENBQU9ILElBQVAsQ0FBakIsRUFBK0JJLE9BQS9CLENBQXVDLFVBQUF6QixHQUFHLEVBQUk7QUFDNUNOLFdBQUcsQ0FBQzRCLEdBQUosQ0FBUUksTUFBUixDQUNFaEMsR0FBRyxDQUFDNEIsR0FBSixDQUFRSyxHQUFSLENBQVlDLElBQVosQ0FBaUJSLE9BQU8sQ0FBQ3BCLEdBQUQsQ0FBeEIsRUFBK0JBLEdBQS9CLEVBQW9Db0IsT0FBcEMsRUFBNkNyQixJQUE3QyxDQURGLEVBRUUsS0FGRixFQUdFLFVBQUFlLEdBQUc7QUFBQSxpQkFBS08sSUFBSSxDQUFDckIsR0FBRCxDQUFKLEdBQVlOLEdBQUcsQ0FBQzRCLEdBQUosQ0FBUUssR0FBUixDQUFZRSxNQUFaLENBQW1CZixHQUFuQixFQUF3QmQsR0FBeEIsRUFBNkJvQixPQUE3QixDQUFqQjtBQUFBLFNBSEw7QUFLRCxPQU5EO0FBT0EsYUFBT0MsSUFBUDtBQUNELEtBWkQsQ0FEZTtBQUFBLEdBQWpCOztBQWVBLE1BQU1TLFlBQVksR0FBRyxTQUFmQSxZQUFlLENBQUMvQixJQUFELEVBQU9nQyxLQUFQO0FBQUEsV0FDbkIsSUFBSXRCLE9BQUosQ0FBWSxVQUFDdUIsRUFBRCxFQUFLQyxJQUFMLEVBQWM7QUFDeEIsVUFBTUMsU0FBUyxHQUFHSCxLQUFLLENBQUM5QixHQUFOLENBQVUsVUFBQUQsR0FBRztBQUFBLGVBQUksY0FBT0EsR0FBUCxFQUFhbUMsT0FBYixDQUFxQjNDLE1BQXJCLEVBQTZCLEVBQTdCLENBQUo7QUFBQSxPQUFiLENBQWxCO0FBRUEsYUFBT0ssS0FBSyxDQUFDdUMsS0FBTixDQUFZckMsSUFBWixFQUFrQm1DLFNBQWxCLEVBQTZCLFVBQUNyQixHQUFELEVBQU13QixJQUFOLEVBQWU7QUFDakQsWUFBSXhCLEdBQUosRUFBUztBQUNQLGlCQUFPRSxPQUFPLENBQUNDLEtBQVIsQ0FBYyxXQUFkLEVBQTJCSCxHQUFHLENBQUN5QixLQUFKLElBQWF6QixHQUF4QyxLQUFnRG9CLElBQUksQ0FBQ3BCLEdBQUQsQ0FBM0Q7QUFDRDs7QUFDRCxZQUFNMEIsR0FBRyxHQUFHO0FBQ1YsaUJBQU94QztBQURHLFNBQVo7QUFJQXNDLFlBQUksQ0FBQ1osT0FBTCxDQUFhLFVBQUNlLEdBQUQsRUFBTUMsR0FBTjtBQUFBLGlCQUFlRixHQUFHLENBQUNMLFNBQVMsQ0FBQ08sR0FBRCxDQUFWLENBQUgsR0FBc0JELEdBQXJDO0FBQUEsU0FBYjtBQUNBLGVBQU8zQyxLQUFLLENBQUN1QyxLQUFOLENBQVlyQyxJQUFaLEVBQWtCZ0MsS0FBbEIsRUFBeUIsVUFBQ2xCLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQzVDLGNBQUlELEdBQUosRUFBUztBQUNQLG1CQUFPRSxPQUFPLENBQUNDLEtBQVIsQ0FBYyxXQUFkLEVBQTJCSCxHQUFHLENBQUN5QixLQUFKLElBQWF6QixHQUF4QyxLQUFnRG9CLElBQUksQ0FBQ3BCLEdBQUQsQ0FBM0Q7QUFDRDs7QUFDREMsYUFBRyxDQUFDVyxPQUFKLENBQVksVUFBQ2UsR0FBRCxFQUFNQyxHQUFOO0FBQUEsbUJBQWVGLEdBQUcsQ0FBQ1IsS0FBSyxDQUFDVSxHQUFELENBQU4sQ0FBSCxHQUFrQkQsR0FBakM7QUFBQSxXQUFaO0FBQ0EsaUJBQU9SLEVBQUUsQ0FBQywwQkFBVU8sR0FBVixDQUFELENBQVQ7QUFDRCxTQU5NLENBQVA7QUFPRCxPQWhCTSxDQUFQO0FBaUJELEtBcEJELENBRG1CO0FBQUEsR0FBckI7O0FBdUJBLE1BQU1HLFVBQVUsR0FBRyxTQUFiQSxVQUFhLENBQUMzQyxJQUFELEVBQU80QyxFQUFQO0FBQUEsV0FDakIsSUFBSWxDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDL0JkLFdBQUssQ0FBQytDLEtBQU4sQ0FBWTdDLElBQVosRUFBa0IsVUFBQ2MsR0FBRCxFQUFNZ0MsUUFBTixFQUFtQjtBQUNuQyxZQUFJaEMsR0FBSixFQUFTO0FBQ1BFLGlCQUFPLENBQUNDLEtBQVIsQ0FBYyxPQUFkLEVBQXVCSCxHQUFHLENBQUN5QixLQUFKLElBQWF6QixHQUFwQztBQUNBLGlCQUFPRixNQUFNLENBQUNFLEdBQUQsQ0FBYjtBQUNEOztBQUNELFlBQUlnQyxRQUFRLENBQUNDLE1BQVQsSUFBbUJ6RCxjQUF2QixFQUF1QztBQUNyQyxpQkFBT21CLEdBQUcsQ0FBQ1QsSUFBRCxDQUFILENBQVVvQixJQUFWLENBQWUsVUFBQUwsR0FBRyxFQUFJO0FBQzNCNkIsY0FBRSxDQUFDN0IsR0FBRCxDQUFGO0FBQ0FKLG1CQUFPLENBQUNJLEdBQUQsQ0FBUDtBQUNELFdBSE0sQ0FBUDtBQUlEOztBQUNEQyxlQUFPLENBQUNnQyxHQUFSLENBQVksY0FBWixFQUE0QmhELElBQTVCLEVBQWtDOEMsUUFBUSxDQUFDQyxNQUEzQztBQUNBLFlBQU1FLFFBQVEsR0FBR0gsUUFBUSxDQUFDSSxNQUFULENBQWdCLFVBQUFqRCxHQUFHO0FBQUEsaUJBQUksQ0FBQ0EsR0FBRyxDQUFDa0QsS0FBSixDQUFVM0QsTUFBVixDQUFMO0FBQUEsU0FBbkIsQ0FBakI7O0FBQ0EsWUFBTTRELFNBQVMsR0FBRyxTQUFaQSxTQUFZO0FBQUEsaUJBQ2hCLElBQUkxQyxPQUFKLENBQVksVUFBQ3VCLEVBQUQsRUFBS0MsSUFBTCxFQUFjO0FBQ3hCLGdCQUFNRixLQUFLLEdBQUdpQixRQUFRLENBQUNJLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUIvRCxjQUFuQixDQUFkO0FBRUEsZ0JBQUksQ0FBQzBDLEtBQUssQ0FBQ2UsTUFBWCxFQUFtQixPQUFPZCxFQUFFLENBQUMsSUFBRCxDQUFUO0FBRW5CLG1CQUFPRixZQUFZLENBQUMvQixJQUFELEVBQU9nQyxLQUFQLENBQVosQ0FBMEJaLElBQTFCLENBQStCLFVBQUFrQyxNQUFNLEVBQUk7QUFDOUNWLGdCQUFFLENBQUNVLE1BQUQsQ0FBRjtBQUNBLHFCQUFPckIsRUFBRSxFQUFUO0FBQ0QsYUFITSxFQUdKQyxJQUhJLENBQVA7QUFJRCxXQVRELENBRGdCO0FBQUEsU0FBbEI7O0FBV0EsWUFBTXFCLGFBQWEsR0FBRyxTQUFoQkEsYUFBZ0I7QUFBQSxpQkFDcEJILFNBQVMsR0FBR2hDLElBQVosQ0FBaUIsVUFBQW9DLElBQUk7QUFBQSxtQkFBSSxDQUFDQSxJQUFELElBQVNELGFBQWI7QUFBQSxXQUFyQixDQURvQjtBQUFBLFNBQXRCOztBQUdBLGVBQU9BLGFBQWEsR0FDakJuQyxJQURJLENBQ0MsVUFBQUwsR0FBRyxFQUFJO0FBQ1hKLGlCQUFPLENBQUNJLEdBQUQsQ0FBUDtBQUNELFNBSEksRUFJSjBDLEtBSkksQ0FJRTdDLE1BSkYsQ0FBUDtBQUtELE9BaENEO0FBaUNELEtBbENELENBRGlCO0FBQUEsR0FBbkI7O0FBcUNBLE1BQU04QyxLQUFLLEdBQUcsU0FBUkEsS0FBUSxDQUFBQyxHQUFHO0FBQUEsV0FDZmpELE9BQU8sQ0FBQ2tELEdBQVIsQ0FDRXJELENBQUMsQ0FBQ2tCLElBQUYsQ0FBT2tDLEdBQVAsRUFBWXpELEdBQVosQ0FDRSxVQUFBRixJQUFJO0FBQUEsYUFDRixJQUFJVSxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQy9CLFlBQUlpRCxVQUFVLEdBQUcsS0FBakI7QUFDQSxZQUFNQyxJQUFJLEdBQUdILEdBQUcsQ0FBQzNELElBQUQsQ0FBaEI7QUFDQSxZQUFNc0MsSUFBSSxHQUFHL0IsQ0FBQyxDQUFDd0QsSUFBRixDQUFPLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBUCxFQUFtQkQsSUFBbkIsS0FBNEIsRUFBekM7QUFDQSxZQUFNaEIsUUFBUSxHQUFHdkMsQ0FBQyxDQUFDa0IsSUFBRixDQUFPYSxJQUFQLENBQWpCOztBQUNBLFlBQU0wQixjQUFjLEdBQUcsU0FBakJBLGNBQWlCLEdBQU07QUFDM0IsY0FBTWhDLEtBQUssR0FBR2MsUUFBUSxDQUFDTyxNQUFULENBQWdCLENBQWhCLEVBQW1COUQsY0FBbkIsQ0FBZDs7QUFFQSxjQUFJLENBQUN5QyxLQUFLLENBQUNlLE1BQVgsRUFBbUI7QUFDakIsZ0JBQUljLFVBQUosRUFBZ0I5RCx1QkFBdUIsQ0FBQ0MsSUFBRCxFQUFPNkQsVUFBUCxDQUF2QjtBQUNoQixtQkFBT2xELE9BQU8sRUFBZDtBQUNEOztBQUNELGNBQU1zRCxPQUFPLEdBQUc7QUFDZEMsYUFBQyxFQUFFO0FBQ0QsbUJBQUtsRSxJQURKO0FBRUQsbUJBQUtPLENBQUMsQ0FBQzRELElBQUYsQ0FBT25DLEtBQVAsRUFBY00sSUFBZDtBQUZKLGFBRFc7QUFLZCxlQUFHL0IsQ0FBQyxDQUFDNEQsSUFBRixDQUFPbkMsS0FBUCxFQUFjOEIsSUFBZDtBQUxXLFdBQWhCO0FBT0EsY0FBTU0sT0FBTyxHQUFHLHdCQUFRSCxPQUFSLENBQWhCLENBZDJCLENBZ0IzQjs7QUFDQSxpQkFBT3hELEdBQUcsQ0FBQ1QsSUFBRCxDQUFILENBQVVvQixJQUFWLENBQWUsVUFBQWlELFFBQVEsRUFBSTtBQUNoQyxnQkFBTUMsV0FBVyxHQUFHdEMsS0FBSyxDQUFDdUMsSUFBTixDQUFXLFVBQUF0RSxHQUFHLEVBQUk7QUFDcEMsa0JBQU11RSxVQUFVLEdBQUdqRSxDQUFDLENBQUNrRSxJQUFGLENBQU94RSxHQUFQLEVBQVlnRSxPQUFaLENBQW5CO0FBQ0Esa0JBQU1TLFdBQVcsR0FBR25FLENBQUMsQ0FBQ2tFLElBQUYsQ0FBT3hFLEdBQVAsRUFBWW9FLFFBQVosQ0FBcEI7QUFFQSxrQkFBSUcsVUFBVSxLQUFLRSxXQUFuQixFQUFnQyxPQUFPLEtBQVA7QUFDaEMsa0JBQU1DLFdBQVcsR0FBR3BFLENBQUMsQ0FBQ3dELElBQUYsQ0FBTyxDQUFDOUQsR0FBRCxFQUFNLEdBQU4sQ0FBUCxFQUFtQmdFLE9BQW5CLENBQXBCO0FBQ0Esa0JBQU1XLFlBQVksR0FBR3JFLENBQUMsQ0FBQ3dELElBQUYsQ0FBTyxDQUFDOUQsR0FBRCxFQUFNLEdBQU4sQ0FBUCxFQUFtQm9FLFFBQW5CLENBQXJCOztBQUVBLGtCQUNFLENBQUNNLFdBQVcsSUFBSUMsWUFBaEIsS0FDQUQsV0FBVyxLQUFLQyxZQUZsQixFQUdFO0FBQ0EsdUJBQU8sS0FBUDtBQUNEOztBQUNELGtCQUNFLE9BQU9KLFVBQVAsS0FBc0IsUUFBdEIsSUFDQUssVUFBVSxDQUFDSCxXQUFELENBQVYsS0FBNEJGLFVBRjlCLEVBR0U7QUFDQSx1QkFBTyxLQUFQO0FBQ0Q7O0FBQ0QscUJBQU8sSUFBUDtBQUNELGFBckJtQixDQUFwQjtBQXVCQSxnQkFBSSxDQUFDRixXQUFMLEVBQWtCLE9BQU9OLGNBQWMsRUFBckI7QUFFbEIsbUJBQU9sRSxLQUFLLENBQUNnRixLQUFOLENBQVk5RSxJQUFaLEVBQWtCLHdCQUFRb0UsT0FBUixDQUFsQixFQUFvQyxVQUFBdEQsR0FBRyxFQUFJO0FBQ2hEK0Msd0JBQVUsR0FBR1MsV0FBYjtBQUNBeEQsaUJBQUcsR0FBR0YsTUFBTSxDQUFDRSxHQUFELENBQVQsR0FBaUJrRCxjQUFjLEVBQWxDO0FBQ0QsYUFITSxDQUFQO0FBSUQsV0E5Qk0sQ0FBUDtBQStCRCxTQWhERDs7QUFrREEsZUFBT0EsY0FBYyxFQUFyQjtBQUNELE9BeERELENBREU7QUFBQSxLQUROLENBREYsQ0FEZTtBQUFBLEdBQWpCOztBQWdFQTVELFVBQVEsQ0FBQyxVQUFDSixJQUFELEVBQU9DLEdBQVA7QUFBQSxXQUFlZSxPQUFPLENBQUNnQyxHQUFSLENBQVksUUFBWixFQUFzQmhELElBQXRCLEVBQTRCQyxHQUE1QixDQUFmO0FBQUEsR0FBRCxDQUFSO0FBRUEsU0FBTztBQUFFUSxPQUFHLEVBQUhBLEdBQUY7QUFBT1UsUUFBSSxFQUFKQSxJQUFQO0FBQWF3QixjQUFVLEVBQVZBLFVBQWI7QUFBeUJlLFNBQUssRUFBTEEsS0FBekI7QUFBZ0N0RCxZQUFRLEVBQVJBLFFBQWhDO0FBQTBDRSxhQUFTLEVBQVRBO0FBQTFDLEdBQVA7QUFDRCxDQXJLTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDVlA7Ozs7QUFFTyxJQUFNeUUsV0FBVyxHQUFHLFNBQWRBLFdBQWMsQ0FBQXBGLEdBQUc7QUFBQSxTQUFJQSxHQUFHLENBQUNxRixFQUFKLENBQU8sUUFBUCxFQUFpQixVQUFTQyxFQUFULEVBQWE7QUFDOUQsU0FBS0MsRUFBTCxDQUFRQyxJQUFSLENBQWFGLEVBQWI7QUFDQSxRQUFNbkYsS0FBSyxHQUFHSCxHQUFHLENBQUNHLEtBQUosR0FBWW1GLEVBQUUsQ0FBQ25GLEtBQUgsR0FBVywwQkFBYUgsR0FBYixDQUFyQztBQUVBc0YsTUFBRSxDQUFDRCxFQUFILENBQU0sS0FBTixFQUFhLFVBQVNJLE9BQVQsRUFBa0I7QUFDN0IsV0FBS0YsRUFBTCxDQUFRQyxJQUFSLENBQWFDLE9BQWI7QUFDQSxVQUFNQyxPQUFPLEdBQUdELE9BQU8sQ0FBQyxHQUFELENBQXZCO0FBQ0EsVUFBTTNFLEdBQUcsR0FBRzJFLE9BQU8sQ0FBQzNFLEdBQXBCO0FBQ0EsVUFBTVQsSUFBSSxHQUFHUyxHQUFHLENBQUMsR0FBRCxDQUFoQjtBQUVBWCxXQUFLLENBQUM2QyxVQUFOLENBQWlCM0MsSUFBakIsRUFBdUIsVUFBQXNELE1BQU07QUFBQSxlQUFJMkIsRUFBRSxDQUFDRCxFQUFILENBQU0sSUFBTixFQUFZO0FBQzNDLGVBQUtLLE9BRHNDO0FBRTNDMUIsYUFBRyxFQUFFTCxNQUFNLHVCQUFNdEQsSUFBTixFQUFhc0QsTUFBYixJQUF3QixJQUZRO0FBRzNDeEMsYUFBRyxFQUFFO0FBSHNDLFNBQVosQ0FBSjtBQUFBLE9BQTdCLEVBSUkyQyxLQUpKLENBSVUsVUFBQTNDLEdBQUc7QUFBQSxlQUNYRSxPQUFPLENBQUNDLEtBQVIsQ0FBYyxPQUFkLEVBQXVCSCxHQUFHLENBQUN5QixLQUFKLElBQWF6QixHQUFwQyxLQUNBbUUsRUFBRSxDQUFDRCxFQUFILENBQU0sSUFBTixFQUFZO0FBQ1YsZUFBS0ssT0FESztBQUVWMUIsYUFBRyxFQUFFLElBRks7QUFHVjdDLGFBQUcsRUFBSEE7QUFIVSxTQUFaLENBRlc7QUFBQSxPQUpiO0FBWUQsS0FsQkQ7QUFvQkFtRSxNQUFFLENBQUNELEVBQUgsQ0FBTSxLQUFOLEVBQWEsVUFBU0ksT0FBVCxFQUFrQjtBQUM3QixXQUFLRixFQUFMLENBQVFDLElBQVIsQ0FBYUMsT0FBYjtBQUNBLFVBQU1DLE9BQU8sR0FBR0QsT0FBTyxDQUFDLEdBQUQsQ0FBdkI7QUFFQXRGLFdBQUssQ0FBQzRELEtBQU4sQ0FBWTBCLE9BQU8sQ0FBQ3pCLEdBQXBCLEVBQ0d2QyxJQURILENBQ1E7QUFBQSxlQUNKNkQsRUFBRSxDQUFDRCxFQUFILENBQU0sSUFBTixFQUFZO0FBQ1YsZUFBS0ssT0FESztBQUVWcEQsWUFBRSxFQUFFLElBRk07QUFHVm5CLGFBQUcsRUFBRTtBQUhLLFNBQVosQ0FESTtBQUFBLE9BRFIsRUFRRzJDLEtBUkgsQ0FRUyxVQUFBM0MsR0FBRztBQUFBLGVBQ1JtRSxFQUFFLENBQUNELEVBQUgsQ0FBTSxJQUFOLEVBQVk7QUFDVixlQUFLSyxPQURLO0FBRVZwRCxZQUFFLEVBQUUsS0FGTTtBQUdWbkIsYUFBRyxFQUFFQTtBQUhLLFNBQVosQ0FEUTtBQUFBLE9BUlo7QUFlRCxLQW5CRDtBQW9CRCxHQTVDaUMsQ0FBSjtBQUFBLENBQXZCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNGUDs7QUFDQTs7OztBQUVPLElBQU13RSxRQUFRLEdBQUdDLFdBQWpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0hQOztBQUNBOzs7O0FBRU8sSUFBTUMsYUFBYSxHQUFHLFNBQWhCQSxhQUFnQixDQUFDN0YsR0FBRDtBQUFBLGlGQUFrQyxFQUFsQztBQUFBLGlDQUFROEYsY0FBUjtBQUFBLE1BQVFBLGNBQVIsb0NBQXlCLElBQXpCOztBQUFBLFNBQXlDLFVBQUFSLEVBQUUsRUFBSTtBQUMxRSxRQUFNbkYsS0FBSyxHQUFHLDBCQUFhSCxHQUFiLENBQWQ7QUFFQXNGLE1BQUUsQ0FBQ1MsSUFBSCxDQUFRLFVBQUFDLEdBQUcsRUFBSTtBQUFBLFVBQ0xDLElBREssR0FDdUJELEdBRHZCLENBQ0xDLElBREs7QUFBQSxVQUNDQyxJQURELEdBQ3VCRixHQUR2QixDQUNDRSxJQUREO0FBQUEsVUFDT0MsV0FEUCxHQUN1QkgsR0FEdkIsQ0FDT0csV0FEUDtBQUViLFVBQU05RixJQUFJLEdBQUcsaUJBQUssQ0FBQyxLQUFELEVBQVEsR0FBUixDQUFMLEVBQW1CNkYsSUFBbkIsQ0FBYjtBQUNBLFVBQU1SLE9BQU8sR0FBRyxpQkFBSyxHQUFMLEVBQVVRLElBQVYsQ0FBaEI7QUFFQSxVQUFJLENBQUM3RixJQUFELElBQVM4RixXQUFiLEVBQTBCLE9BQU9ILEdBQVA7QUFDMUIsYUFBTzdGLEtBQUssQ0FDVDZDLFVBREksQ0FDTzNDLElBRFAsRUFDYSxVQUFBc0QsTUFBTSxFQUFJO0FBQzFCLFlBQU11QyxJQUFJLEdBQUc7QUFDWCxlQUFLRCxJQUFJLENBQUNHLEtBQUwsRUFETTtBQUVYLGVBQUtWLE9BRk07QUFHWDFCLGFBQUcsRUFBRUwsTUFBTSx1QkFBTXRELElBQU4sRUFBYXNELE1BQWIsSUFBd0I7QUFIeEIsU0FBYjtBQU1Bc0MsWUFBSSxDQUFDSSxJQUFMLENBQVU7QUFDUkgsY0FBSSxFQUFKQSxJQURRO0FBRVJJLHdCQUFjLEVBQUUsSUFGUjtBQUdSUix3QkFBYyxFQUFFLENBQUNuQyxNQUFELElBQVdtQztBQUhuQixTQUFWO0FBS0QsT0FiSSxFQWNKaEMsS0FkSSxDQWNFLFVBQUEzQyxHQUFHLEVBQUk7QUFDWixZQUFNK0UsSUFBSSxHQUFHO0FBQ1gsZUFBS0QsSUFBSSxDQUFDRyxLQUFMLEVBRE07QUFFWCxlQUFLVixPQUZNO0FBR1h2RSxhQUFHLFlBQUtBLEdBQUw7QUFIUSxTQUFiO0FBTUE4RSxZQUFJLENBQUNJLElBQUwsQ0FBVTtBQUFFSCxjQUFJLEVBQUpBLElBQUY7QUFBUUksd0JBQWMsRUFBRSxJQUF4QjtBQUE4QlIsd0JBQWMsRUFBZEE7QUFBOUIsU0FBVjtBQUNELE9BdEJJLEVBdUJKckUsSUF2QkksQ0F1QkM7QUFBQSxlQUFNdUUsR0FBTjtBQUFBLE9BdkJELENBQVA7QUF3QkQsS0E5QkQ7QUFnQ0EsV0FBT1YsRUFBUDtBQUNELEdBcEM0QjtBQUFBLENBQXRCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSFA7Ozs7QUFDQSxJQUFNaUIsT0FBTyxHQUFHQyxtQkFBTyxDQUFDLGtCQUFELENBQXZCOztBQUVBLElBQU1DLGdCQUFnQixHQUFHLE1BQXpCOztBQUVBLFNBQVNDLGFBQVQsQ0FBdUI3RCxHQUF2QixFQUE0QjtBQUMxQjtBQUNBLE1BQUksQ0FBQ0EsR0FBTCxFQUFVLE9BQU9BLEdBQVA7QUFDVixNQUFJOEQsS0FBSyxHQUFJOUQsR0FBRyxDQUFDMEIsQ0FBSixJQUFTMUIsR0FBRyxDQUFDMEIsQ0FBSixDQUFNLEdBQU4sQ0FBVixJQUF5QixFQUFyQztBQUVBLG1CQUFLb0MsS0FBTCxFQUFZNUUsT0FBWixDQUFvQixVQUFTekIsR0FBVCxFQUFjO0FBQ2hDLFFBQUlzRyxLQUFLLEdBQUdELEtBQUssQ0FBQ3JHLEdBQUQsQ0FBakI7O0FBRUEsUUFBSSxRQUFPc0csS0FBUCxNQUFpQixRQUFyQixFQUErQjtBQUM3QixVQUFJQyxPQUFPLEdBQUcsaUJBQUtELEtBQUwsQ0FBZDtBQUNBLFVBQUlFLFNBQVMsR0FBR0QsT0FBTyxDQUFDLENBQUQsQ0FBdkI7O0FBRUEsVUFBSUMsU0FBSixFQUFlO0FBQ2IsWUFBSUMsT0FBTyxHQUFHLENBQUN6RyxHQUFELEVBQU11RyxPQUFOLEVBQWVHLElBQWYsQ0FBb0IsR0FBcEIsQ0FBZDtBQUNBLFlBQUlDLFNBQVMsR0FBR0wsS0FBSyxDQUFDRSxTQUFELENBQXJCO0FBRUEsZUFBT0gsS0FBSyxDQUFDckcsR0FBRCxDQUFaO0FBQ0FxRyxhQUFLLENBQUNJLE9BQUQsQ0FBTCxHQUFpQkUsU0FBakI7QUFDQUEsaUJBQVMsR0FBSXBFLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxJQUFZdUMsR0FBRyxDQUFDdkMsR0FBRCxDQUFILENBQVN3RyxTQUFULENBQWIsSUFBcUMsSUFBakQ7QUFDQSxlQUFPakUsR0FBRyxDQUFDdkMsR0FBRCxDQUFWO0FBQ0F1QyxXQUFHLENBQUNrRSxPQUFELENBQUgsR0FBZUUsU0FBZjtBQUNEO0FBQ0Y7QUFDRixHQWxCRDtBQW1CQSxtQkFBS3BFLEdBQUwsRUFBVWQsT0FBVixDQUFrQixVQUFBekIsR0FBRyxFQUFJO0FBQ3ZCLFFBQUlBLEdBQUcsQ0FBQyxDQUFELENBQUgsS0FBVyxHQUFmLEVBQW9CLE9BQU8sQ0FBQ0EsR0FBRCxDQUFQO0FBQ3JCLEdBRkQ7QUFHQSxTQUFPdUMsR0FBUDtBQUNEOztBQUVNLFNBQVNxRSxTQUFULENBQW1CckUsR0FBbkIsRUFBd0I7QUFDN0IsTUFBSSxDQUFDQSxHQUFMLEVBQVUsT0FBT0EsR0FBUDtBQUNWLE1BQU1zRSxNQUFNLEdBQUcsRUFBZjtBQUVBLG1CQUFLdEUsR0FBTCxFQUFVZCxPQUFWLENBQWtCLFVBQVN6QixHQUFULEVBQWM7QUFDOUIsUUFBSUEsR0FBRyxDQUFDLENBQUQsQ0FBSCxLQUFXLEdBQWYsRUFBb0IsT0FBT3VDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBVjs7QUFFcEIsUUFBSXVDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxLQUFhLFFBQWpCLEVBQTJCO0FBQ3pCdUMsU0FBRyxDQUFDdkMsR0FBRCxDQUFILEdBQVcsSUFBWDtBQUNEOztBQUNELFFBQUl1QyxHQUFHLENBQUN2QyxHQUFELENBQUgsS0FBYSxhQUFqQixFQUFnQztBQUM5QnVDLFNBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxHQUFXaUIsU0FBWDtBQUNEOztBQUVELFFBQUksTUFBTTZGLElBQU4sQ0FBVzlHLEdBQVgsQ0FBSixFQUFxQjtBQUNuQnVDLFNBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxHQUFXNEUsVUFBVSxDQUFDckMsR0FBRyxDQUFDdkMsR0FBRCxDQUFKLEVBQVcsRUFBWCxDQUFWLElBQTRCdUMsR0FBRyxDQUFDdkMsR0FBRCxDQUExQztBQUNEOztBQUNELFFBQUl1QyxHQUFHLENBQUN2QyxHQUFELENBQUgsSUFBWXVDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxDQUFTOEMsTUFBVCxHQUFrQnFELGdCQUFsQyxFQUFvRDtBQUNsRDVELFNBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxHQUFXdUMsR0FBRyxDQUFDdkMsR0FBRCxDQUFILENBQVMrRyxLQUFULENBQWUsQ0FBZixFQUFrQlosZ0JBQWxCLENBQVg7QUFDQXBGLGFBQU8sQ0FBQ2dDLEdBQVIsQ0FBWSxXQUFaLEVBQXlCL0MsR0FBekI7QUFDRDtBQUNGLEdBakJEO0FBbUJBdUMsS0FBRyxHQUFHNkQsYUFBYSxDQUFDSCxPQUFPLENBQUNlLFNBQVIsQ0FBa0J6RSxHQUFsQixDQUFELENBQW5CO0FBRUEwRSxRQUFNLENBQUN6RixJQUFQLENBQVllLEdBQVosRUFDRzJFLElBREgsR0FFR3pGLE9BRkgsQ0FFVyxVQUFBekIsR0FBRztBQUFBLFdBQUs2RyxNQUFNLENBQUM3RyxHQUFELENBQU4sR0FBY3VDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBdEI7QUFBQSxHQUZkO0FBSUEsU0FBTzZHLE1BQVA7QUFDRDs7QUFFTSxTQUFTTSxPQUFULENBQWlCNUUsR0FBakIsRUFBc0I7QUFDM0IsTUFBSSxDQUFDQSxHQUFMLEVBQVUsT0FBT0EsR0FBUDtBQUNWQSxLQUFHLEdBQUcwRCxPQUFPLENBQUMxRCxHQUFELENBQWI7QUFDQSxtQkFBS0EsR0FBTCxFQUFVZCxPQUFWLENBQWtCLFVBQVN6QixHQUFULEVBQWM7QUFDOUIsUUFBSXVDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxLQUFhLElBQWpCLEVBQXVCO0FBQ3JCdUMsU0FBRyxDQUFDdkMsR0FBRCxDQUFILEdBQVcsUUFBWDtBQUNEOztBQUNELFFBQUksUUFBT3VDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBVixNQUFvQmlCLFNBQXhCLEVBQW1DO0FBQ2pDc0IsU0FBRyxDQUFDdkMsR0FBRCxDQUFILEdBQVcsYUFBWDtBQUNEOztBQUNELFFBQUl1QyxHQUFHLENBQUN2QyxHQUFELENBQUgsSUFBWXVDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxDQUFTOEMsTUFBVCxHQUFrQnFELGdCQUFsQyxFQUFvRDtBQUNsRDVELFNBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxHQUFXdUMsR0FBRyxDQUFDdkMsR0FBRCxDQUFILENBQVMrRyxLQUFULENBQWUsQ0FBZixFQUFrQlosZ0JBQWxCLENBQVg7QUFDQXBGLGFBQU8sQ0FBQ2dDLEdBQVIsQ0FBWSxpQkFBWixFQUErQi9DLEdBQS9CO0FBQ0Q7O0FBQ0QsUUFBSUEsR0FBRyxDQUFDLENBQUQsQ0FBSCxLQUFXLEdBQWYsRUFBb0IsT0FBT3VDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBVjtBQUNyQixHQVpEO0FBYUEsU0FBT3VDLEdBQVA7QUFDRCxDOzs7Ozs7Ozs7OztBQ3BGRCxrRDs7Ozs7Ozs7Ozs7QUNBQSxtRDs7Ozs7Ozs7Ozs7QUNBQSxtRCIsImZpbGUiOiJndW4tcmVkaXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJmbGF0XCIpLCByZXF1aXJlKFwicmFtZGFcIiksIHJlcXVpcmUoXCJyZWRpc1wiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcImd1bi1yZWRpc1wiLCBbXCJmbGF0XCIsIFwicmFtZGFcIiwgXCJyZWRpc1wiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJndW4tcmVkaXNcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJmbGF0XCIpLCByZXF1aXJlKFwicmFtZGFcIiksIHJlcXVpcmUoXCJyZWRpc1wiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wiZ3VuLXJlZGlzXCJdID0gZmFjdG9yeShyb290W1wiZmxhdFwiXSwgcm9vdFtcInJhbWRhXCJdLCByb290W1wicmVkaXNcIl0pO1xufSkodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24oX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9mbGF0X18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmFtZGFfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yZWRpc19fKSB7XG5yZXR1cm4gIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJpbXBvcnQgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IGFzIGNyZWF0ZVJlZGlzQ2xpZW50IH0gZnJvbSBcInJlZGlzXCI7XG5pbXBvcnQgeyB0b1JlZGlzLCBmcm9tUmVkaXMgfSBmcm9tIFwiLi9zZXJpYWxpemVcIjtcblxuY29uc3QgR0VUX0JBVENIX1NJWkUgPSAxMDAwMDtcbmNvbnN0IFBVVF9CQVRDSF9TSVpFID0gMTAwMDA7XG5cbmNvbnN0IG1ldGFSZSA9IC9eX1xcLi4qLztcbmNvbnN0IGVkZ2VSZSA9IC8oXFwuIyQpLztcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNsaWVudCA9IChHdW4sIC4uLmNvbmZpZykgPT4ge1xuICBsZXQgY2hhbmdlU3Vic2NyaWJlcnMgPSBbXTtcbiAgY29uc3QgcmVkaXMgPSBjcmVhdGVSZWRpc0NsaWVudCguLi5jb25maWcpO1xuICBjb25zdCBub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyA9IChzb3VsLCBrZXkpID0+XG4gICAgY2hhbmdlU3Vic2NyaWJlcnMubWFwKGZuID0+IGZuKHNvdWwsIGtleSkpO1xuICBjb25zdCBvbkNoYW5nZSA9IGZuID0+IGNoYW5nZVN1YnNjcmliZXJzLnB1c2goZm4pO1xuICBjb25zdCBvZmZDaGFuZ2UgPSBmbiA9PlxuICAgIChjaGFuZ2VTdWJzY3JpYmVycyA9IFIud2l0aG91dChbZm5dLCBjaGFuZ2VTdWJzY3JpYmVycykpO1xuXG4gIGNvbnN0IGdldCA9IHNvdWwgPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIXNvdWwpIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgcmVkaXMuaGdldGFsbChzb3VsLCBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcImdldCBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZnJvbVJlZGlzKHJlcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSk7XG5cbiAgY29uc3QgcmVhZCA9IHNvdWwgPT5cbiAgICBnZXQoc291bCkudGhlbihyYXdEYXRhID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSByYXdEYXRhID8geyAuLi5yYXdEYXRhIH0gOiByYXdEYXRhO1xuXG4gICAgICBpZiAoIUd1bi5TRUEgfHwgc291bC5pbmRleE9mKFwiflwiKSA9PT0gLTEpIHJldHVybiByYXdEYXRhO1xuICAgICAgUi53aXRob3V0KFtcIl9cIl0sIFIua2V5cyhkYXRhKSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBHdW4uU0VBLnZlcmlmeShcbiAgICAgICAgICBHdW4uU0VBLm9wdC5wYWNrKHJhd0RhdGFba2V5XSwga2V5LCByYXdEYXRhLCBzb3VsKSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICByZXMgPT4gKGRhdGFba2V5XSA9IEd1bi5TRUEub3B0LnVucGFjayhyZXMsIGtleSwgcmF3RGF0YSkpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xuXG4gIGNvbnN0IHJlYWRLZXlCYXRjaCA9IChzb3VsLCBiYXRjaCkgPT5cbiAgICBuZXcgUHJvbWlzZSgob2ssIGZhaWwpID0+IHtcbiAgICAgIGNvbnN0IGJhdGNoTWV0YSA9IGJhdGNoLm1hcChrZXkgPT4gYF8uPi4ke2tleX1gLnJlcGxhY2UoZWRnZVJlLCBcIlwiKSk7XG5cbiAgICAgIHJldHVybiByZWRpcy5obWdldChzb3VsLCBiYXRjaE1ldGEsIChlcnIsIG1ldGEpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKFwiaG1nZXQgZXJyXCIsIGVyci5zdGFjayB8fCBlcnIpIHx8IGZhaWwoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgXCJfLiNcIjogc291bFxuICAgICAgICB9O1xuXG4gICAgICAgIG1ldGEuZm9yRWFjaCgodmFsLCBpZHgpID0+IChvYmpbYmF0Y2hNZXRhW2lkeF1dID0gdmFsKSk7XG4gICAgICAgIHJldHVybiByZWRpcy5obWdldChzb3VsLCBiYXRjaCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJobWdldCBlcnJcIiwgZXJyLnN0YWNrIHx8IGVycikgfHwgZmFpbChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMuZm9yRWFjaCgodmFsLCBpZHgpID0+IChvYmpbYmF0Y2hbaWR4XV0gPSB2YWwpKTtcbiAgICAgICAgICByZXR1cm4gb2soZnJvbVJlZGlzKG9iaikpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIGNvbnN0IGJhdGNoZWRHZXQgPSAoc291bCwgY2IpID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmVkaXMuaGtleXMoc291bCwgKGVyciwgbm9kZUtleXMpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvclwiLCBlcnIuc3RhY2sgfHwgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGVLZXlzLmxlbmd0aCA8PSBHRVRfQkFUQ0hfU0laRSkge1xuICAgICAgICAgIHJldHVybiBnZXQoc291bCkudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgY2IocmVzKTtcbiAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcImdldCBiaWcgc291bFwiLCBzb3VsLCBub2RlS2V5cy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBhdHRyS2V5cyA9IG5vZGVLZXlzLmZpbHRlcihrZXkgPT4gIWtleS5tYXRjaChtZXRhUmUpKTtcbiAgICAgICAgY29uc3QgcmVhZEJhdGNoID0gKCkgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgob2ssIGZhaWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJhdGNoID0gYXR0cktleXMuc3BsaWNlKDAsIEdFVF9CQVRDSF9TSVpFKTtcblxuICAgICAgICAgICAgaWYgKCFiYXRjaC5sZW5ndGgpIHJldHVybiBvayh0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlYWRLZXlCYXRjaChzb3VsLCBiYXRjaCkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICBjYihyZXN1bHQpO1xuICAgICAgICAgICAgICByZXR1cm4gb2soKTtcbiAgICAgICAgICAgIH0sIGZhaWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWFkTmV4dEJhdGNoID0gKCkgPT5cbiAgICAgICAgICByZWFkQmF0Y2goKS50aGVuKGRvbmUgPT4gIWRvbmUgJiYgcmVhZE5leHRCYXRjaCk7XG5cbiAgICAgICAgcmV0dXJuIHJlYWROZXh0QmF0Y2goKVxuICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIGNvbnN0IHdyaXRlID0gcHV0ID0+XG4gICAgUHJvbWlzZS5hbGwoXG4gICAgICBSLmtleXMocHV0KS5tYXAoXG4gICAgICAgIHNvdWwgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgaGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHB1dFtzb3VsXTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBSLnBhdGgoW1wiX1wiLCBcIj5cIl0sIG5vZGUpIHx8IHt9O1xuICAgICAgICAgICAgY29uc3Qgbm9kZUtleXMgPSBSLmtleXMobWV0YSk7XG4gICAgICAgICAgICBjb25zdCB3cml0ZU5leHRCYXRjaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYmF0Y2ggPSBub2RlS2V5cy5zcGxpY2UoMCwgUFVUX0JBVENIX1NJWkUpO1xuXG4gICAgICAgICAgICAgIGlmICghYmF0Y2gubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc0NoYW5nZWQpIG5vdGlmeUNoYW5nZVN1YnNjcmliZXJzKHNvdWwsIGhhc0NoYW5nZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9IHtcbiAgICAgICAgICAgICAgICBfOiB7XG4gICAgICAgICAgICAgICAgICBcIiNcIjogc291bCxcbiAgICAgICAgICAgICAgICAgIFwiPlwiOiBSLnBpY2soYmF0Y2gsIG1ldGEpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAuLi5SLnBpY2soYmF0Y2gsIG5vZGUpXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZXMgPSB0b1JlZGlzKHVwZGF0ZWQpO1xuXG4gICAgICAgICAgICAgIC8vIHJldHVybiByZWFkS2V5QmF0Y2goc291bCwgYmF0Y2gpLnRoZW4oZXhpc3RpbmcgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gZ2V0KHNvdWwpLnRoZW4oZXhpc3RpbmcgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVkS2V5ID0gYmF0Y2guZmluZChrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFZhbCA9IFIucHJvcChrZXksIHVwZGF0ZWQpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdWYWwgPSBSLnByb3Aoa2V5LCBleGlzdGluZyk7XG5cbiAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVkVmFsID09PSBleGlzdGluZ1ZhbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFNvdWwgPSBSLnBhdGgoW2tleSwgXCIjXCJdLCB1cGRhdGVkKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nU291bCA9IFIucGF0aChba2V5LCBcIiNcIl0sIGV4aXN0aW5nKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAodXBkYXRlZFNvdWwgfHwgZXhpc3RpbmdTb3VsKSAmJlxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkU291bCA9PT0gZXhpc3RpbmdTb3VsXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdXBkYXRlZFZhbCA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KGV4aXN0aW5nVmFsKSA9PT0gdXBkYXRlZFZhbFxuICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllZEtleSkgcmV0dXJuIHdyaXRlTmV4dEJhdGNoKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVkaXMuaG1zZXQoc291bCwgdG9SZWRpcyh1cGRhdGVzKSwgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIGhhc0NoYW5nZWQgPSBtb2RpZmllZEtleTtcbiAgICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChlcnIpIDogd3JpdGVOZXh0QmF0Y2goKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gd3JpdGVOZXh0QmF0Y2goKTtcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG5cbiAgb25DaGFuZ2UoKHNvdWwsIGtleSkgPT4gY29uc29sZS5sb2coXCJtb2RpZnlcIiwgc291bCwga2V5KSk7XG5cbiAgcmV0dXJuIHsgZ2V0LCByZWFkLCBiYXRjaGVkR2V0LCB3cml0ZSwgb25DaGFuZ2UsIG9mZkNoYW5nZSB9O1xufTtcbiIsImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCIuL2NsaWVudFwiO1xuXG5leHBvcnQgY29uc3QgYXR0YWNoVG9HdW4gPSBHdW4gPT4gR3VuLm9uKFwiY3JlYXRlXCIsIGZ1bmN0aW9uKGRiKSB7XG4gIHRoaXMudG8ubmV4dChkYik7XG4gIGNvbnN0IHJlZGlzID0gR3VuLnJlZGlzID0gZGIucmVkaXMgPSBjcmVhdGVDbGllbnQoR3VuKTtcblxuICBkYi5vbihcImdldFwiLCBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgdGhpcy50by5uZXh0KHJlcXVlc3QpO1xuICAgIGNvbnN0IGRlZHVwSWQgPSByZXF1ZXN0W1wiI1wiXTtcbiAgICBjb25zdCBnZXQgPSByZXF1ZXN0LmdldDtcbiAgICBjb25zdCBzb3VsID0gZ2V0W1wiI1wiXTtcblxuICAgIHJlZGlzLmJhdGNoZWRHZXQoc291bCwgcmVzdWx0ID0+IGRiLm9uKFwiaW5cIiwge1xuICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICBwdXQ6IHJlc3VsdCA/IHsgW3NvdWxdOiByZXN1bHQgfSA6IG51bGwsXG4gICAgICBlcnI6IG51bGxcbiAgICB9KSkuY2F0Y2goZXJyID0+XG4gICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3JcIiwgZXJyLnN0YWNrIHx8IGVycikgfHxcbiAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgcHV0OiBudWxsLFxuICAgICAgICBlcnJcbiAgICAgIH0pXG4gICAgKTtcbiAgfSk7XG5cbiAgZGIub24oXCJwdXRcIiwgZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHRoaXMudG8ubmV4dChyZXF1ZXN0KTtcbiAgICBjb25zdCBkZWR1cElkID0gcmVxdWVzdFtcIiNcIl07XG5cbiAgICByZWRpcy53cml0ZShyZXF1ZXN0LnB1dClcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIG9rOiB0cnVlLFxuICAgICAgICAgIGVycjogbnVsbFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLmNhdGNoKGVyciA9PlxuICAgICAgICBkYi5vbihcImluXCIsIHtcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBvazogZmFsc2UsXG4gICAgICAgICAgZXJyOiBlcnJcbiAgICAgICAgfSlcbiAgICAgICk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgKiBhcyByZWNlaXZlckZucyBmcm9tIFwiLi9yZWNlaXZlclwiO1xuZXhwb3J0IHsgYXR0YWNoVG9HdW4gfSBmcm9tIFwiLi9ndW5cIjtcblxuZXhwb3J0IGNvbnN0IHJlY2VpdmVyID0gcmVjZWl2ZXJGbnM7XG4iLCJpbXBvcnQgeyBwYXRoLCBwcm9wIH0gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiLi9jbGllbnRcIjtcblxuZXhwb3J0IGNvbnN0IHJlc3BvbmRUb0dldHMgPSAoR3VuLCB7IHNraXBWYWxpZGF0aW9uID0gdHJ1ZSB9ID0ge30pID0+IGRiID0+IHtcbiAgY29uc3QgcmVkaXMgPSBjcmVhdGVDbGllbnQoR3VuKTtcblxuICBkYi5vbkluKG1zZyA9PiB7XG4gICAgY29uc3QgeyBmcm9tLCBqc29uLCBmcm9tQ2x1c3RlciB9ID0gbXNnO1xuICAgIGNvbnN0IHNvdWwgPSBwYXRoKFtcImdldFwiLCBcIiNcIl0sIGpzb24pO1xuICAgIGNvbnN0IGRlZHVwSWQgPSBwcm9wKFwiI1wiLCBqc29uKTtcblxuICAgIGlmICghc291bCB8fCBmcm9tQ2x1c3RlcikgcmV0dXJuIG1zZztcbiAgICByZXR1cm4gcmVkaXNcbiAgICAgIC5iYXRjaGVkR2V0KHNvdWwsIHJlc3VsdCA9PiB7XG4gICAgICAgIGNvbnN0IGpzb24gPSB7XG4gICAgICAgICAgXCIjXCI6IGZyb20ubXNnSWQoKSxcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBwdXQ6IHJlc3VsdCA/IHsgW3NvdWxdOiByZXN1bHQgfSA6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICBmcm9tLnNlbmQoe1xuICAgICAgICAgIGpzb24sXG4gICAgICAgICAgaWdub3JlTGVlY2hpbmc6IHRydWUsXG4gICAgICAgICAgc2tpcFZhbGlkYXRpb246ICFyZXN1bHQgfHwgc2tpcFZhbGlkYXRpb25cbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnN0IGpzb24gPSB7XG4gICAgICAgICAgXCIjXCI6IGZyb20ubXNnSWQoKSxcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBlcnI6IGAke2Vycn1gXG4gICAgICAgIH07XG5cbiAgICAgICAgZnJvbS5zZW5kKHsganNvbiwgaWdub3JlTGVlY2hpbmc6IHRydWUsIHNraXBWYWxpZGF0aW9uIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IG1zZyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYjtcbn07XG4iLCJpbXBvcnQgeyBrZXlzIH0gZnJvbSBcInJhbWRhXCI7XG5jb25zdCBmbGF0dGVuID0gcmVxdWlyZShcImZsYXRcIik7XG5cbmNvbnN0IEZJRUxEX1NJWkVfTElNSVQgPSAxMDAwMDA7XG5cbmZ1bmN0aW9uIHBvc3RVbmZsYXR0ZW4ob2JqKSB7XG4gIC8vIFRoaXMgaXMgcHJvYmFibHkgb25seSBuZWNlc3NhcnkgaWYgeW91IGFyZSBzdHVwaWQgbGlrZSBtZSBhbmQgdXNlIHRoZSBkZWZhdWx0IC4gZGVsaW1pdGVyIGZvciBmbGF0dGVuXG4gIGlmICghb2JqKSByZXR1cm4gb2JqO1xuICBsZXQgYXJyb3cgPSAob2JqLl8gJiYgb2JqLl9bXCI+XCJdKSB8fCB7fTtcblxuICBrZXlzKGFycm93KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGxldCB2YWx1ZSA9IGFycm93W2tleV07XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgdmFsS2V5cyA9IGtleXModmFsdWUpO1xuICAgICAgbGV0IHJlbWFpbmRlciA9IHZhbEtleXNbMF07XG5cbiAgICAgIGlmIChyZW1haW5kZXIpIHtcbiAgICAgICAgbGV0IHJlYWxLZXkgPSBba2V5LCB2YWxLZXlzXS5qb2luKFwiLlwiKTtcbiAgICAgICAgbGV0IHJlYWxWYWx1ZSA9IHZhbHVlW3JlbWFpbmRlcl07XG5cbiAgICAgICAgZGVsZXRlIGFycm93W2tleV07XG4gICAgICAgIGFycm93W3JlYWxLZXldID0gcmVhbFZhbHVlO1xuICAgICAgICByZWFsVmFsdWUgPSAob2JqW2tleV0gJiYgb2JqW2tleV1bcmVtYWluZGVyXSkgfHwgbnVsbDtcbiAgICAgICAgZGVsZXRlIG9ialtrZXldO1xuICAgICAgICBvYmpbcmVhbEtleV0gPSByZWFsVmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAga2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIFtrZXldO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21SZWRpcyhvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIGNvbnN0IHNvcnRlZCA9IHt9O1xuXG4gIGtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChrZXlbMF0gPT09IFwiLlwiKSBkZWxldGUgb2JqW2tleV07XG5cbiAgICBpZiAob2JqW2tleV0gPT09IFwifE5VTEx8XCIpIHtcbiAgICAgIG9ialtrZXldID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldID09PSBcInxVTkRFRklORUR8XCIpIHtcbiAgICAgIG9ialtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICgvPlxcLi8udGVzdChrZXkpKSB7XG4gICAgICBvYmpba2V5XSA9IHBhcnNlRmxvYXQob2JqW2tleV0sIDEwKSB8fCBvYmpba2V5XTtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldICYmIG9ialtrZXldLmxlbmd0aCA+IEZJRUxEX1NJWkVfTElNSVQpIHtcbiAgICAgIG9ialtrZXldID0gb2JqW2tleV0uc2xpY2UoMCwgRklFTERfU0laRV9MSU1JVCk7XG4gICAgICBjb25zb2xlLmxvZyhcInRydW5jYXRlZFwiLCBrZXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgb2JqID0gcG9zdFVuZmxhdHRlbihmbGF0dGVuLnVuZmxhdHRlbihvYmopKTtcblxuICBPYmplY3Qua2V5cyhvYmopXG4gICAgLnNvcnQoKVxuICAgIC5mb3JFYWNoKGtleSA9PiAoc29ydGVkW2tleV0gPSBvYmpba2V5XSkpO1xuXG4gIHJldHVybiBzb3J0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1JlZGlzKG9iaikge1xuICBpZiAoIW9iaikgcmV0dXJuIG9iajtcbiAgb2JqID0gZmxhdHRlbihvYmopO1xuICBrZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAob2JqW2tleV0gPT09IG51bGwpIHtcbiAgICAgIG9ialtrZXldID0gXCJ8TlVMTHxcIjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvYmpba2V5XSA9IFwifFVOREVGSU5FRHxcIjtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldICYmIG9ialtrZXldLmxlbmd0aCA+IEZJRUxEX1NJWkVfTElNSVQpIHtcbiAgICAgIG9ialtrZXldID0gb2JqW2tleV0uc2xpY2UoMCwgRklFTERfU0laRV9MSU1JVCk7XG4gICAgICBjb25zb2xlLmxvZyhcInRydW5jYXRlZCBpbnB1dFwiLCBrZXkpO1xuICAgIH1cbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIG9ialtrZXldO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9mbGF0X187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JhbWRhX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JlZGlzX187Il0sInNvdXJjZVJvb3QiOiIifQ==