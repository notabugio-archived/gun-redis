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
exports.acceptWrites = exports.respondToGets = void 0;

var R = _interopRequireWildcard(__webpack_require__(/*! ramda */ "ramda"));

var _client = __webpack_require__(/*! ./client */ "./src/client.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var respondToGets = function respondToGets(Gun) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$skipValidation = _ref.skipValidation,
      skipValidation = _ref$skipValidation === void 0 ? true : _ref$skipValidation;

  return function (db) {
    var redis = Gun.redis = Gun.redis || (0, _client.createClient)(Gun);
    db.onIn(function (msg) {
      var from = msg.from,
          json = msg.json,
          fromCluster = msg.fromCluster;
      var soul = R.path(["get", "#"], json);
      var dedupId = R.prop("#", json);
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

var acceptWrites = function acceptWrites(Gun) {
  return function (db) {
    var redis = Gun.redis = Gun.redis || (0, _client.createClient)(Gun); // eslint-disable-line

    db.onIn(function (msg) {
      if (msg.fromCluster) return msg;

      if (msg.json.put) {
        return db.getDiff(msg.json.put).then(function (diff) {
          var souls = R.keys(diff);
          if (!souls.length) return msg; // return console.log("would write", diff) || msg;

          return redis.write(diff).then(function () {
            return msg;
          });
        }).catch(function (err) {
          return console.error("error accepting writes", err.stack || err);
        });
      }

      return msg;
    });
    return db;
  };
};

exports.acceptWrites = acceptWrites;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndW4tcmVkaXMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2d1bi1yZWRpcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvY2xpZW50LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9ndW4uanMiLCJ3ZWJwYWNrOi8vZ3VuLXJlZGlzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9yZWNlaXZlci5qcyIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvc2VyaWFsaXplLmpzIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcImZsYXRcIiIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvZXh0ZXJuYWwgXCJyYW1kYVwiIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcInJlZGlzXCIiXSwibmFtZXMiOlsiR0VUX0JBVENIX1NJWkUiLCJQVVRfQkFUQ0hfU0laRSIsIm1ldGFSZSIsImVkZ2VSZSIsImNyZWF0ZUNsaWVudCIsIkd1biIsImNoYW5nZVN1YnNjcmliZXJzIiwiY29uZmlnIiwicmVkaXMiLCJub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyIsInNvdWwiLCJrZXkiLCJtYXAiLCJmbiIsIm9uQ2hhbmdlIiwicHVzaCIsIm9mZkNoYW5nZSIsIlIiLCJ3aXRob3V0IiwiZ2V0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJoZ2V0YWxsIiwiZXJyIiwicmVzIiwiY29uc29sZSIsImVycm9yIiwidW5kZWZpbmVkIiwicmVhZCIsInRoZW4iLCJyYXdEYXRhIiwiZGF0YSIsIlNFQSIsImluZGV4T2YiLCJrZXlzIiwiZm9yRWFjaCIsInZlcmlmeSIsIm9wdCIsInBhY2siLCJ1bnBhY2siLCJyZWFkS2V5QmF0Y2giLCJiYXRjaCIsIm9rIiwiZmFpbCIsImJhdGNoTWV0YSIsInJlcGxhY2UiLCJobWdldCIsIm1ldGEiLCJzdGFjayIsIm9iaiIsInZhbCIsImlkeCIsImJhdGNoZWRHZXQiLCJjYiIsImhrZXlzIiwibm9kZUtleXMiLCJsZW5ndGgiLCJsb2ciLCJhdHRyS2V5cyIsImZpbHRlciIsIm1hdGNoIiwicmVhZEJhdGNoIiwic3BsaWNlIiwicmVzdWx0IiwicmVhZE5leHRCYXRjaCIsImRvbmUiLCJjYXRjaCIsIndyaXRlIiwicHV0IiwiYWxsIiwiaGFzQ2hhbmdlZCIsIm5vZGUiLCJwYXRoIiwid3JpdGVOZXh0QmF0Y2giLCJ1cGRhdGVkIiwiXyIsInBpY2siLCJ1cGRhdGVzIiwiZXhpc3RpbmciLCJtb2RpZmllZEtleSIsImZpbmQiLCJ1cGRhdGVkVmFsIiwicHJvcCIsImV4aXN0aW5nVmFsIiwidXBkYXRlZFNvdWwiLCJleGlzdGluZ1NvdWwiLCJwYXJzZUZsb2F0IiwiaG1zZXQiLCJhdHRhY2hUb0d1biIsIm9uIiwiZGIiLCJ0byIsIm5leHQiLCJyZXF1ZXN0IiwiZGVkdXBJZCIsInJlY2VpdmVyIiwicmVjZWl2ZXJGbnMiLCJyZXNwb25kVG9HZXRzIiwic2tpcFZhbGlkYXRpb24iLCJvbkluIiwibXNnIiwiZnJvbSIsImpzb24iLCJmcm9tQ2x1c3RlciIsIm1zZ0lkIiwic2VuZCIsImlnbm9yZUxlZWNoaW5nIiwiYWNjZXB0V3JpdGVzIiwiZ2V0RGlmZiIsImRpZmYiLCJzb3VscyIsImZsYXR0ZW4iLCJyZXF1aXJlIiwiRklFTERfU0laRV9MSU1JVCIsInBvc3RVbmZsYXR0ZW4iLCJhcnJvdyIsInZhbHVlIiwidmFsS2V5cyIsInJlbWFpbmRlciIsInJlYWxLZXkiLCJqb2luIiwicmVhbFZhbHVlIiwiZnJvbVJlZGlzIiwic29ydGVkIiwidGVzdCIsInNsaWNlIiwidW5mbGF0dGVuIiwiT2JqZWN0Iiwic29ydCIsInRvUmVkaXMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztB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bUgsS0FBVCxDQUFlLENBQWYsRUFBa0JaLGdCQUFsQixDQUFYO0FBQ0F4RixhQUFPLENBQUNnQyxHQUFSLENBQVksaUJBQVosRUFBK0IvQyxHQUEvQjtBQUNEOztBQUNELFFBQUlBLEdBQUcsQ0FBQyxDQUFELENBQUgsS0FBVyxHQUFmLEVBQW9CLE9BQU91QyxHQUFHLENBQUN2QyxHQUFELENBQVY7QUFDckIsR0FaRDtBQWFBLFNBQU91QyxHQUFQO0FBQ0QsQzs7Ozs7Ozs7Ozs7QUNwRkQsa0Q7Ozs7Ozs7Ozs7O0FDQUEsbUQ7Ozs7Ozs7Ozs7O0FDQUEsbUQiLCJmaWxlIjoiZ3VuLXJlZGlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiZmxhdFwiKSwgcmVxdWlyZShcInJhbWRhXCIpLCByZXF1aXJlKFwicmVkaXNcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJndW4tcmVkaXNcIiwgW1wiZmxhdFwiLCBcInJhbWRhXCIsIFwicmVkaXNcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiZ3VuLXJlZGlzXCJdID0gZmFjdG9yeShyZXF1aXJlKFwiZmxhdFwiKSwgcmVxdWlyZShcInJhbWRhXCIpLCByZXF1aXJlKFwicmVkaXNcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImd1bi1yZWRpc1wiXSA9IGZhY3Rvcnkocm9vdFtcImZsYXRcIl0sIHJvb3RbXCJyYW1kYVwiXSwgcm9vdFtcInJlZGlzXCJdKTtcbn0pKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfZmxhdF9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JhbWRhX18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmVkaXNfXykge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiaW1wb3J0ICogYXMgUiBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCBhcyBjcmVhdGVSZWRpc0NsaWVudCB9IGZyb20gXCJyZWRpc1wiO1xuaW1wb3J0IHsgdG9SZWRpcywgZnJvbVJlZGlzIH0gZnJvbSBcIi4vc2VyaWFsaXplXCI7XG5cbmNvbnN0IEdFVF9CQVRDSF9TSVpFID0gMTAwMDA7XG5jb25zdCBQVVRfQkFUQ0hfU0laRSA9IDEwMDAwO1xuXG5jb25zdCBtZXRhUmUgPSAvXl9cXC4uKi87XG5jb25zdCBlZGdlUmUgPSAvKFxcLiMkKS87XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVDbGllbnQgPSAoR3VuLCAuLi5jb25maWcpID0+IHtcbiAgbGV0IGNoYW5nZVN1YnNjcmliZXJzID0gW107XG4gIGNvbnN0IHJlZGlzID0gY3JlYXRlUmVkaXNDbGllbnQoLi4uY29uZmlnKTtcbiAgY29uc3Qgbm90aWZ5Q2hhbmdlU3Vic2NyaWJlcnMgPSAoc291bCwga2V5KSA9PlxuICAgIGNoYW5nZVN1YnNjcmliZXJzLm1hcChmbiA9PiBmbihzb3VsLCBrZXkpKTtcbiAgY29uc3Qgb25DaGFuZ2UgPSBmbiA9PiBjaGFuZ2VTdWJzY3JpYmVycy5wdXNoKGZuKTtcbiAgY29uc3Qgb2ZmQ2hhbmdlID0gZm4gPT5cbiAgICAoY2hhbmdlU3Vic2NyaWJlcnMgPSBSLndpdGhvdXQoW2ZuXSwgY2hhbmdlU3Vic2NyaWJlcnMpKTtcblxuICBjb25zdCBnZXQgPSBzb3VsID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKCFzb3VsKSByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgIHJlZGlzLmhnZXRhbGwoc291bCwgZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJnZXQgZXJyb3JcIiwgZXJyKTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGZyb21SZWRpcyhyZXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0pO1xuXG4gIGNvbnN0IHJlYWQgPSBzb3VsID0+XG4gICAgZ2V0KHNvdWwpLnRoZW4ocmF3RGF0YSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gcmF3RGF0YSA/IHsgLi4ucmF3RGF0YSB9IDogcmF3RGF0YTtcblxuICAgICAgaWYgKCFHdW4uU0VBIHx8IHNvdWwuaW5kZXhPZihcIn5cIikgPT09IC0xKSByZXR1cm4gcmF3RGF0YTtcbiAgICAgIFIud2l0aG91dChbXCJfXCJdLCBSLmtleXMoZGF0YSkpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgR3VuLlNFQS52ZXJpZnkoXG4gICAgICAgICAgR3VuLlNFQS5vcHQucGFjayhyYXdEYXRhW2tleV0sIGtleSwgcmF3RGF0YSwgc291bCksXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgcmVzID0+IChkYXRhW2tleV0gPSBHdW4uU0VBLm9wdC51bnBhY2socmVzLCBrZXksIHJhd0RhdGEpKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcblxuICBjb25zdCByZWFkS2V5QmF0Y2ggPSAoc291bCwgYmF0Y2gpID0+XG4gICAgbmV3IFByb21pc2UoKG9rLCBmYWlsKSA9PiB7XG4gICAgICBjb25zdCBiYXRjaE1ldGEgPSBiYXRjaC5tYXAoa2V5ID0+IGBfLj4uJHtrZXl9YC5yZXBsYWNlKGVkZ2VSZSwgXCJcIikpO1xuXG4gICAgICByZXR1cm4gcmVkaXMuaG1nZXQoc291bCwgYmF0Y2hNZXRhLCAoZXJyLCBtZXRhKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihcImhtZ2V0IGVyclwiLCBlcnIuc3RhY2sgfHwgZXJyKSB8fCBmYWlsKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICAgIFwiXy4jXCI6IHNvdWxcbiAgICAgICAgfTtcblxuICAgICAgICBtZXRhLmZvckVhY2goKHZhbCwgaWR4KSA9PiAob2JqW2JhdGNoTWV0YVtpZHhdXSA9IHZhbCkpO1xuICAgICAgICByZXR1cm4gcmVkaXMuaG1nZXQoc291bCwgYmF0Y2gsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKFwiaG1nZXQgZXJyXCIsIGVyci5zdGFjayB8fCBlcnIpIHx8IGZhaWwoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzLmZvckVhY2goKHZhbCwgaWR4KSA9PiAob2JqW2JhdGNoW2lkeF1dID0gdmFsKSk7XG4gICAgICAgICAgcmV0dXJuIG9rKGZyb21SZWRpcyhvYmopKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICBjb25zdCBiYXRjaGVkR2V0ID0gKHNvdWwsIGNiKSA9PlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJlZGlzLmhrZXlzKHNvdWwsIChlcnIsIG5vZGVLZXlzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3JcIiwgZXJyLnN0YWNrIHx8IGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlS2V5cy5sZW5ndGggPD0gR0VUX0JBVENIX1NJWkUpIHtcbiAgICAgICAgICByZXR1cm4gZ2V0KHNvdWwpLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgIGNiKHJlcyk7XG4gICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCJnZXQgYmlnIHNvdWxcIiwgc291bCwgbm9kZUtleXMubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgYXR0cktleXMgPSBub2RlS2V5cy5maWx0ZXIoa2V5ID0+ICFrZXkubWF0Y2gobWV0YVJlKSk7XG4gICAgICAgIGNvbnN0IHJlYWRCYXRjaCA9ICgpID0+XG4gICAgICAgICAgbmV3IFByb21pc2UoKG9rLCBmYWlsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBiYXRjaCA9IGF0dHJLZXlzLnNwbGljZSgwLCBHRVRfQkFUQ0hfU0laRSk7XG5cbiAgICAgICAgICAgIGlmICghYmF0Y2gubGVuZ3RoKSByZXR1cm4gb2sodHJ1ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZWFkS2V5QmF0Y2goc291bCwgYmF0Y2gpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgY2IocmVzdWx0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIG9rKCk7XG4gICAgICAgICAgICB9LCBmYWlsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmVhZE5leHRCYXRjaCA9ICgpID0+XG4gICAgICAgICAgcmVhZEJhdGNoKCkudGhlbihkb25lID0+ICFkb25lICYmIHJlYWROZXh0QmF0Y2gpO1xuXG4gICAgICAgIHJldHVybiByZWFkTmV4dEJhdGNoKClcbiAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKHJlamVjdCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICBjb25zdCB3cml0ZSA9IHB1dCA9PlxuICAgIFByb21pc2UuYWxsKFxuICAgICAgUi5rZXlzKHB1dCkubWFwKFxuICAgICAgICBzb3VsID0+XG4gICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IGhhc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBwdXRbc291bF07XG4gICAgICAgICAgICBjb25zdCBtZXRhID0gUi5wYXRoKFtcIl9cIiwgXCI+XCJdLCBub2RlKSB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVLZXlzID0gUi5rZXlzKG1ldGEpO1xuICAgICAgICAgICAgY29uc3Qgd3JpdGVOZXh0QmF0Y2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJhdGNoID0gbm9kZUtleXMuc3BsaWNlKDAsIFBVVF9CQVRDSF9TSVpFKTtcblxuICAgICAgICAgICAgICBpZiAoIWJhdGNoLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChoYXNDaGFuZ2VkKSBub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyhzb3VsLCBoYXNDaGFuZ2VkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSB7XG4gICAgICAgICAgICAgICAgXzoge1xuICAgICAgICAgICAgICAgICAgXCIjXCI6IHNvdWwsXG4gICAgICAgICAgICAgICAgICBcIj5cIjogUi5waWNrKGJhdGNoLCBtZXRhKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4uUi5waWNrKGJhdGNoLCBub2RlKVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBjb25zdCB1cGRhdGVzID0gdG9SZWRpcyh1cGRhdGVkKTtcblxuICAgICAgICAgICAgICAvLyByZXR1cm4gcmVhZEtleUJhdGNoKHNvdWwsIGJhdGNoKS50aGVuKGV4aXN0aW5nID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGdldChzb3VsKS50aGVuKGV4aXN0aW5nID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RpZmllZEtleSA9IGJhdGNoLmZpbmQoa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRWYWwgPSBSLnByb3Aoa2V5LCB1cGRhdGVkKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nVmFsID0gUi5wcm9wKGtleSwgZXhpc3RpbmcpO1xuXG4gICAgICAgICAgICAgICAgICBpZiAodXBkYXRlZFZhbCA9PT0gZXhpc3RpbmdWYWwpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRTb3VsID0gUi5wYXRoKFtrZXksIFwiI1wiXSwgdXBkYXRlZCk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1NvdWwgPSBSLnBhdGgoW2tleSwgXCIjXCJdLCBleGlzdGluZyk7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgKHVwZGF0ZWRTb3VsIHx8IGV4aXN0aW5nU291bCkgJiZcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFNvdWwgPT09IGV4aXN0aW5nU291bFxuICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHVwZGF0ZWRWYWwgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChleGlzdGluZ1ZhbCkgPT09IHVwZGF0ZWRWYWxcbiAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllZEtleSkgcmV0dXJuIHdyaXRlTmV4dEJhdGNoKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVkaXMuaG1zZXQoc291bCwgdG9SZWRpcyh1cGRhdGVzKSwgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIGhhc0NoYW5nZWQgPSBtb2RpZmllZEtleTtcbiAgICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChlcnIpIDogd3JpdGVOZXh0QmF0Y2goKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gd3JpdGVOZXh0QmF0Y2goKTtcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG5cbiAgb25DaGFuZ2UoKHNvdWwsIGtleSkgPT4gY29uc29sZS5sb2coXCJtb2RpZnlcIiwgc291bCwga2V5KSk7XG5cbiAgcmV0dXJuIHsgZ2V0LCByZWFkLCBiYXRjaGVkR2V0LCB3cml0ZSwgb25DaGFuZ2UsIG9mZkNoYW5nZSB9O1xufTtcbiIsImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCIuL2NsaWVudFwiO1xuXG5leHBvcnQgY29uc3QgYXR0YWNoVG9HdW4gPSBHdW4gPT4gR3VuLm9uKFwiY3JlYXRlXCIsIGZ1bmN0aW9uKGRiKSB7XG4gIHRoaXMudG8ubmV4dChkYik7XG4gIGNvbnN0IHJlZGlzID0gR3VuLnJlZGlzID0gZGIucmVkaXMgPSBjcmVhdGVDbGllbnQoR3VuKTtcblxuICBkYi5vbihcImdldFwiLCBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgdGhpcy50by5uZXh0KHJlcXVlc3QpO1xuICAgIGNvbnN0IGRlZHVwSWQgPSByZXF1ZXN0W1wiI1wiXTtcbiAgICBjb25zdCBnZXQgPSByZXF1ZXN0LmdldDtcbiAgICBjb25zdCBzb3VsID0gZ2V0W1wiI1wiXTtcblxuICAgIHJlZGlzLmJhdGNoZWRHZXQoc291bCwgcmVzdWx0ID0+IGRiLm9uKFwiaW5cIiwge1xuICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICBwdXQ6IHJlc3VsdCA/IHsgW3NvdWxdOiByZXN1bHQgfSA6IG51bGwsXG4gICAgICBlcnI6IG51bGxcbiAgICB9KSkuY2F0Y2goZXJyID0+XG4gICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3JcIiwgZXJyLnN0YWNrIHx8IGVycikgfHxcbiAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgcHV0OiBudWxsLFxuICAgICAgICBlcnJcbiAgICAgIH0pXG4gICAgKTtcbiAgfSk7XG5cbiAgZGIub24oXCJwdXRcIiwgZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHRoaXMudG8ubmV4dChyZXF1ZXN0KTtcbiAgICBjb25zdCBkZWR1cElkID0gcmVxdWVzdFtcIiNcIl07XG5cbiAgICByZWRpcy53cml0ZShyZXF1ZXN0LnB1dClcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIG9rOiB0cnVlLFxuICAgICAgICAgIGVycjogbnVsbFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLmNhdGNoKGVyciA9PlxuICAgICAgICBkYi5vbihcImluXCIsIHtcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBvazogZmFsc2UsXG4gICAgICAgICAgZXJyOiBlcnJcbiAgICAgICAgfSlcbiAgICAgICk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgKiBhcyByZWNlaXZlckZucyBmcm9tIFwiLi9yZWNlaXZlclwiO1xuZXhwb3J0IHsgYXR0YWNoVG9HdW4gfSBmcm9tIFwiLi9ndW5cIjtcblxuZXhwb3J0IGNvbnN0IHJlY2VpdmVyID0gcmVjZWl2ZXJGbnM7XG4iLCJpbXBvcnQgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50XCI7XG5cbmV4cG9ydCBjb25zdCByZXNwb25kVG9HZXRzID0gKEd1biwgeyBza2lwVmFsaWRhdGlvbiA9IHRydWUgfSA9IHt9KSA9PiBkYiA9PiB7XG4gIGNvbnN0IHJlZGlzID0gKEd1bi5yZWRpcyA9IEd1bi5yZWRpcyB8fCBjcmVhdGVDbGllbnQoR3VuKSk7XG5cbiAgZGIub25Jbihtc2cgPT4ge1xuICAgIGNvbnN0IHsgZnJvbSwganNvbiwgZnJvbUNsdXN0ZXIgfSA9IG1zZztcbiAgICBjb25zdCBzb3VsID0gUi5wYXRoKFtcImdldFwiLCBcIiNcIl0sIGpzb24pO1xuICAgIGNvbnN0IGRlZHVwSWQgPSBSLnByb3AoXCIjXCIsIGpzb24pO1xuXG4gICAgaWYgKCFzb3VsIHx8IGZyb21DbHVzdGVyKSByZXR1cm4gbXNnO1xuICAgIHJldHVybiByZWRpc1xuICAgICAgLmJhdGNoZWRHZXQoc291bCwgcmVzdWx0ID0+IHtcbiAgICAgICAgY29uc3QganNvbiA9IHtcbiAgICAgICAgICBcIiNcIjogZnJvbS5tc2dJZCgpLFxuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIHB1dDogcmVzdWx0ID8geyBbc291bF06IHJlc3VsdCB9IDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGZyb20uc2VuZCh7XG4gICAgICAgICAganNvbixcbiAgICAgICAgICBpZ25vcmVMZWVjaGluZzogdHJ1ZSxcbiAgICAgICAgICBza2lwVmFsaWRhdGlvbjogIXJlc3VsdCB8fCBza2lwVmFsaWRhdGlvblxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc3QganNvbiA9IHtcbiAgICAgICAgICBcIiNcIjogZnJvbS5tc2dJZCgpLFxuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIGVycjogYCR7ZXJyfWBcbiAgICAgICAgfTtcblxuICAgICAgICBmcm9tLnNlbmQoeyBqc29uLCBpZ25vcmVMZWVjaGluZzogdHJ1ZSwgc2tpcFZhbGlkYXRpb24gfSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4gbXNnKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRiO1xufTtcblxuZXhwb3J0IGNvbnN0IGFjY2VwdFdyaXRlcyA9IEd1biA9PiBkYiA9PiB7XG4gIGNvbnN0IHJlZGlzID0gKEd1bi5yZWRpcyA9IEd1bi5yZWRpcyB8fCBjcmVhdGVDbGllbnQoR3VuKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICBkYi5vbkluKG1zZyA9PiB7XG4gICAgaWYgKG1zZy5mcm9tQ2x1c3RlcikgcmV0dXJuIG1zZztcbiAgICBpZiAobXNnLmpzb24ucHV0KSB7XG4gICAgICByZXR1cm4gZGJcbiAgICAgICAgLmdldERpZmYobXNnLmpzb24ucHV0KVxuICAgICAgICAudGhlbihkaWZmID0+IHtcbiAgICAgICAgICBjb25zdCBzb3VscyA9IFIua2V5cyhkaWZmKTtcblxuICAgICAgICAgIGlmICghc291bHMubGVuZ3RoKSByZXR1cm4gbXNnO1xuICAgICAgICAgIC8vIHJldHVybiBjb25zb2xlLmxvZyhcIndvdWxkIHdyaXRlXCIsIGRpZmYpIHx8IG1zZztcbiAgICAgICAgICByZXR1cm4gcmVkaXNcbiAgICAgICAgICAgIC53cml0ZShkaWZmKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gbXNnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVyciA9PlxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvciBhY2NlcHRpbmcgd3JpdGVzXCIsIGVyci5zdGFjayB8fCBlcnIpXG4gICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBtc2c7XG4gIH0pO1xuXG4gIHJldHVybiBkYjtcbn07XG4iLCJpbXBvcnQgeyBrZXlzIH0gZnJvbSBcInJhbWRhXCI7XG5jb25zdCBmbGF0dGVuID0gcmVxdWlyZShcImZsYXRcIik7XG5cbmNvbnN0IEZJRUxEX1NJWkVfTElNSVQgPSAxMDAwMDA7XG5cbmZ1bmN0aW9uIHBvc3RVbmZsYXR0ZW4ob2JqKSB7XG4gIC8vIFRoaXMgaXMgcHJvYmFibHkgb25seSBuZWNlc3NhcnkgaWYgeW91IGFyZSBzdHVwaWQgbGlrZSBtZSBhbmQgdXNlIHRoZSBkZWZhdWx0IC4gZGVsaW1pdGVyIGZvciBmbGF0dGVuXG4gIGlmICghb2JqKSByZXR1cm4gb2JqO1xuICBsZXQgYXJyb3cgPSAob2JqLl8gJiYgb2JqLl9bXCI+XCJdKSB8fCB7fTtcblxuICBrZXlzKGFycm93KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGxldCB2YWx1ZSA9IGFycm93W2tleV07XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgdmFsS2V5cyA9IGtleXModmFsdWUpO1xuICAgICAgbGV0IHJlbWFpbmRlciA9IHZhbEtleXNbMF07XG5cbiAgICAgIGlmIChyZW1haW5kZXIpIHtcbiAgICAgICAgbGV0IHJlYWxLZXkgPSBba2V5LCB2YWxLZXlzXS5qb2luKFwiLlwiKTtcbiAgICAgICAgbGV0IHJlYWxWYWx1ZSA9IHZhbHVlW3JlbWFpbmRlcl07XG5cbiAgICAgICAgZGVsZXRlIGFycm93W2tleV07XG4gICAgICAgIGFycm93W3JlYWxLZXldID0gcmVhbFZhbHVlO1xuICAgICAgICByZWFsVmFsdWUgPSAob2JqW2tleV0gJiYgb2JqW2tleV1bcmVtYWluZGVyXSkgfHwgbnVsbDtcbiAgICAgICAgZGVsZXRlIG9ialtrZXldO1xuICAgICAgICBvYmpbcmVhbEtleV0gPSByZWFsVmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAga2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIFtrZXldO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21SZWRpcyhvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIGNvbnN0IHNvcnRlZCA9IHt9O1xuXG4gIGtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChrZXlbMF0gPT09IFwiLlwiKSBkZWxldGUgb2JqW2tleV07XG5cbiAgICBpZiAob2JqW2tleV0gPT09IFwifE5VTEx8XCIpIHtcbiAgICAgIG9ialtrZXldID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldID09PSBcInxVTkRFRklORUR8XCIpIHtcbiAgICAgIG9ialtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICgvPlxcLi8udGVzdChrZXkpKSB7XG4gICAgICBvYmpba2V5XSA9IHBhcnNlRmxvYXQob2JqW2tleV0sIDEwKSB8fCBvYmpba2V5XTtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldICYmIG9ialtrZXldLmxlbmd0aCA+IEZJRUxEX1NJWkVfTElNSVQpIHtcbiAgICAgIG9ialtrZXldID0gb2JqW2tleV0uc2xpY2UoMCwgRklFTERfU0laRV9MSU1JVCk7XG4gICAgICBjb25zb2xlLmxvZyhcInRydW5jYXRlZFwiLCBrZXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgb2JqID0gcG9zdFVuZmxhdHRlbihmbGF0dGVuLnVuZmxhdHRlbihvYmopKTtcblxuICBPYmplY3Qua2V5cyhvYmopXG4gICAgLnNvcnQoKVxuICAgIC5mb3JFYWNoKGtleSA9PiAoc29ydGVkW2tleV0gPSBvYmpba2V5XSkpO1xuXG4gIHJldHVybiBzb3J0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1JlZGlzKG9iaikge1xuICBpZiAoIW9iaikgcmV0dXJuIG9iajtcbiAgb2JqID0gZmxhdHRlbihvYmopO1xuICBrZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAob2JqW2tleV0gPT09IG51bGwpIHtcbiAgICAgIG9ialtrZXldID0gXCJ8TlVMTHxcIjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvYmpba2V5XSA9IFwifFVOREVGSU5FRHxcIjtcbiAgICB9XG4gICAgaWYgKG9ialtrZXldICYmIG9ialtrZXldLmxlbmd0aCA+IEZJRUxEX1NJWkVfTElNSVQpIHtcbiAgICAgIG9ialtrZXldID0gb2JqW2tleV0uc2xpY2UoMCwgRklFTERfU0laRV9MSU1JVCk7XG4gICAgICBjb25zb2xlLmxvZyhcInRydW5jYXRlZCBpbnB1dFwiLCBrZXkpO1xuICAgIH1cbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIG9ialtrZXldO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9mbGF0X187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JhbWRhX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JlZGlzX187Il0sInNvdXJjZVJvb3QiOiIifQ==