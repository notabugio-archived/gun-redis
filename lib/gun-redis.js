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
        var node = put[soul];
        var meta = R.path(["_", ">"], node) || {};
        var nodeKeys = R.keys(meta);

        var writeNextBatch = function writeNextBatch() {
          var batch = nodeKeys.splice(0, PUT_BATCH_SIZE);
          if (!batch.length) return resolve();
          var updated = {
            _: {
              "#": soul,
              ">": R.pick(batch, meta)
            },
            ...R.pick(batch, node)
          }; // return readKeyBatch(soul, batch).then(existing => {

          return get(soul).then(function (existing) {
            var modifiedKeys = batch.filter(function (key) {
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
            if (!modifiedKeys.length) return writeNextBatch();
            var diff = {
              _: R.assoc(">", R.pick(modifiedKeys, meta), updated._),
              ...R.pick(modifiedKeys, updated)
            };
            return redis.hmset(soul, (0, _serialize.toRedis)(diff), function (err) {
              err ? reject(err) : writeNextBatch();
              notifyChangeSubscribers(soul, diff);
            });
          });
        };

        return writeNextBatch();
      });
    }));
  };

  onChange(function (soul, diff) {
    return console.log("modify", soul, R.keys(diff));
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
      _ref$disableRelay = _ref.disableRelay,
      disableRelay = _ref$disableRelay === void 0 ? true : _ref$disableRelay,
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
      }).then(function () {
        return disableRelay ? R.assoc("noRelay", true, msg) : msg;
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
        return msg;
      });
    });
    return db;
  };
};

exports.respondToGets = respondToGets;

var acceptWrites = function acceptWrites(Gun) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref3$disableRelay = _ref3.disableRelay,
      disableRelay = _ref3$disableRelay === void 0 ? false : _ref3$disableRelay;

  return function (db) {
    var redis = Gun.redis = Gun.redis || (0, _client.createClient)(Gun); // eslint-disable-line

    db.onIn(function (msg) {
      if (msg.fromCluster) return msg;

      if (msg.json.put) {
        return db.getDiff(msg.json.put).then(function (diff) {
          var souls = R.keys(diff);
          if (!souls.length) return msg; // return console.log("would write", diff) || msg;

          return redis.write(diff).then(function () {
            var json = {
              "@": msg.json["#"],
              ok: true,
              err: null
            };
            msg.from && msg.from.send && msg.from.send({
              json: json,
              ignoreLeeching: true,
              skipValidation: true
            });
            return disableRelay ? R.assoc("noRelay", true, msg) : msg;
          }).catch(function (err) {
            var json = {
              "@": msg.json["#"],
              ok: false,
              err: "".concat(err)
            };
            msg.from && msg.from.send && msg.from.send({
              json: json,
              ignoreLeeching: true,
              skipValidation: true
            });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndW4tcmVkaXMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2d1bi1yZWRpcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvY2xpZW50LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9ndW4uanMiLCJ3ZWJwYWNrOi8vZ3VuLXJlZGlzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9yZWNlaXZlci5qcyIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvc2VyaWFsaXplLmpzIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcImZsYXRcIiIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvZXh0ZXJuYWwgXCJyYW1kYVwiIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcInJlZGlzXCIiXSwibmFtZXMiOlsiR0VUX0JBVENIX1NJWkUiLCJQVVRfQkFUQ0hfU0laRSIsIm1ldGFSZSIsImVkZ2VSZSIsImNyZWF0ZUNsaWVudCIsIkd1biIsImNoYW5nZVN1YnNjcmliZXJzIiwiY29uZmlnIiwicmVkaXMiLCJub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyIsInNvdWwiLCJrZXkiLCJtYXAiLCJmbiIsIm9uQ2hhbmdlIiwicHVzaCIsIm9mZkNoYW5nZSIsIlIiLCJ3aXRob3V0IiwiZ2V0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJoZ2V0YWxsIiwiZXJyIiwicmVzIiwiY29uc29sZSIsImVycm9yIiwidW5kZWZpbmVkIiwicmVhZCIsInRoZW4iLCJyYXdEYXRhIiwiZGF0YSIsIlNFQSIsImluZGV4T2YiLCJrZXlzIiwiZm9yRWFjaCIsInZlcmlmeSIsIm9wdCIsInBhY2siLCJ1bnBhY2siLCJyZWFkS2V5QmF0Y2giLCJiYXRjaCIsIm9rIiwiZmFpbCIsImJhdGNoTWV0YSIsInJlcGxhY2UiLCJobWdldCIsIm1ldGEiLCJzdGFjayIsIm9iaiIsInZhbCIsImlkeCIsImJhdGNoZWRHZXQiLCJjYiIsImhrZXlzIiwibm9kZUtleXMiLCJsZW5ndGgiLCJsb2ciLCJhdHRyS2V5cyIsImZpbHRlciIsIm1hdGNoIiwicmVhZEJhdGNoIiwic3BsaWNlIiwicmVzdWx0IiwicmVhZE5leHRCYXRjaCIsImRvbmUiLCJjYXRjaCIsIndyaXRlIiwicHV0IiwiYWxsIiwibm9kZSIsInBhdGgiLCJ3cml0ZU5leHRCYXRjaCIsInVwZGF0ZWQiLCJfIiwicGljayIsImV4aXN0aW5nIiwibW9kaWZpZWRLZXlzIiwidXBkYXRlZFZhbCIsInByb3AiLCJleGlzdGluZ1ZhbCIsInVwZGF0ZWRTb3VsIiwiZXhpc3RpbmdTb3VsIiwicGFyc2VGbG9hdCIsImRpZmYiLCJhc3NvYyIsImhtc2V0IiwiYXR0YWNoVG9HdW4iLCJvbiIsImRiIiwidG8iLCJuZXh0IiwicmVxdWVzdCIsImRlZHVwSWQiLCJyZWNlaXZlciIsInJlY2VpdmVyRm5zIiwicmVzcG9uZFRvR2V0cyIsImRpc2FibGVSZWxheSIsInNraXBWYWxpZGF0aW9uIiwib25JbiIsIm1zZyIsImZyb20iLCJqc29uIiwiZnJvbUNsdXN0ZXIiLCJtc2dJZCIsInNlbmQiLCJpZ25vcmVMZWVjaGluZyIsImFjY2VwdFdyaXRlcyIsImdldERpZmYiLCJzb3VscyIsImZsYXR0ZW4iLCJyZXF1aXJlIiwiRklFTERfU0laRV9MSU1JVCIsInBvc3RVbmZsYXR0ZW4iLCJhcnJvdyIsInZhbHVlIiwidmFsS2V5cyIsInJlbWFpbmRlciIsInJlYWxLZXkiLCJqb2luIiwicmVhbFZhbHVlIiwiZnJvbVJlZGlzIiwic29ydGVkIiwidGVzdCIsInNsaWNlIiwidW5mbGF0dGVuIiwiT2JqZWN0Iiwic29ydCIsInRvUmVkaXMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FB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R0FBVyxhQUFYO0FBQ0Q7O0FBQ0QsUUFBSXVDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBSCxJQUFZdUMsR0FBRyxDQUFDdkMsR0FBRCxDQUFILENBQVM4QyxNQUFULEdBQWtCd0QsZ0JBQWxDLEVBQW9EO0FBQ2xEL0QsU0FBRyxDQUFDdkMsR0FBRCxDQUFILEdBQVd1QyxHQUFHLENBQUN2QyxHQUFELENBQUgsQ0FBU2tILEtBQVQsQ0FBZSxDQUFmLEVBQWtCWixnQkFBbEIsQ0FBWDtBQUNBdkYsYUFBTyxDQUFDZ0MsR0FBUixDQUFZLGlCQUFaLEVBQStCL0MsR0FBL0I7QUFDRDs7QUFDRCxRQUFJQSxHQUFHLENBQUMsQ0FBRCxDQUFILEtBQVcsR0FBZixFQUFvQixPQUFPdUMsR0FBRyxDQUFDdkMsR0FBRCxDQUFWO0FBQ3JCLEdBWkQ7QUFhQSxTQUFPdUMsR0FBUDtBQUNELEM7Ozs7Ozs7Ozs7O0FDcEZELGtEOzs7Ozs7Ozs7OztBQ0FBLG1EOzs7Ozs7Ozs7OztBQ0FBLG1EIiwiZmlsZSI6Imd1bi1yZWRpcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcImZsYXRcIiksIHJlcXVpcmUoXCJyYW1kYVwiKSwgcmVxdWlyZShcInJlZGlzXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwiZ3VuLXJlZGlzXCIsIFtcImZsYXRcIiwgXCJyYW1kYVwiLCBcInJlZGlzXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImd1bi1yZWRpc1wiXSA9IGZhY3RvcnkocmVxdWlyZShcImZsYXRcIiksIHJlcXVpcmUoXCJyYW1kYVwiKSwgcmVxdWlyZShcInJlZGlzXCIpKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJndW4tcmVkaXNcIl0gPSBmYWN0b3J5KHJvb3RbXCJmbGF0XCJdLCByb290W1wicmFtZGFcIl0sIHJvb3RbXCJyZWRpc1wiXSk7XG59KSh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ZsYXRfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yYW1kYV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JlZGlzX18pIHtcbnJldHVybiAiLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImltcG9ydCAqIGFzIFIgZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgYXMgY3JlYXRlUmVkaXNDbGllbnQgfSBmcm9tIFwicmVkaXNcIjtcbmltcG9ydCB7IHRvUmVkaXMsIGZyb21SZWRpcyB9IGZyb20gXCIuL3NlcmlhbGl6ZVwiO1xuXG5jb25zdCBHRVRfQkFUQ0hfU0laRSA9IDEwMDAwO1xuY29uc3QgUFVUX0JBVENIX1NJWkUgPSAxMDAwMDtcblxuY29uc3QgbWV0YVJlID0gL15fXFwuLiovO1xuY29uc3QgZWRnZVJlID0gLyhcXC4jJCkvO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlQ2xpZW50ID0gKEd1biwgLi4uY29uZmlnKSA9PiB7XG4gIGxldCBjaGFuZ2VTdWJzY3JpYmVycyA9IFtdO1xuICBjb25zdCByZWRpcyA9IGNyZWF0ZVJlZGlzQ2xpZW50KC4uLmNvbmZpZyk7XG4gIGNvbnN0IG5vdGlmeUNoYW5nZVN1YnNjcmliZXJzID0gKHNvdWwsIGtleSkgPT5cbiAgICBjaGFuZ2VTdWJzY3JpYmVycy5tYXAoZm4gPT4gZm4oc291bCwga2V5KSk7XG4gIGNvbnN0IG9uQ2hhbmdlID0gZm4gPT4gY2hhbmdlU3Vic2NyaWJlcnMucHVzaChmbik7XG4gIGNvbnN0IG9mZkNoYW5nZSA9IGZuID0+XG4gICAgKGNoYW5nZVN1YnNjcmliZXJzID0gUi53aXRob3V0KFtmbl0sIGNoYW5nZVN1YnNjcmliZXJzKSk7XG5cbiAgY29uc3QgZ2V0ID0gc291bCA9PlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghc291bCkgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgICByZWRpcy5oZ2V0YWxsKHNvdWwsIGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZ2V0IGVycm9yXCIsIGVycik7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShmcm9tUmVkaXMocmVzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9KTtcblxuICBjb25zdCByZWFkID0gc291bCA9PlxuICAgIGdldChzb3VsKS50aGVuKHJhd0RhdGEgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IHJhd0RhdGEgPyB7IC4uLnJhd0RhdGEgfSA6IHJhd0RhdGE7XG5cbiAgICAgIGlmICghR3VuLlNFQSB8fCBzb3VsLmluZGV4T2YoXCJ+XCIpID09PSAtMSkgcmV0dXJuIHJhd0RhdGE7XG4gICAgICBSLndpdGhvdXQoW1wiX1wiXSwgUi5rZXlzKGRhdGEpKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIEd1bi5TRUEudmVyaWZ5KFxuICAgICAgICAgIEd1bi5TRUEub3B0LnBhY2socmF3RGF0YVtrZXldLCBrZXksIHJhd0RhdGEsIHNvdWwpLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHJlcyA9PiAoZGF0YVtrZXldID0gR3VuLlNFQS5vcHQudW5wYWNrKHJlcywga2V5LCByYXdEYXRhKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSk7XG5cbiAgY29uc3QgcmVhZEtleUJhdGNoID0gKHNvdWwsIGJhdGNoKSA9PlxuICAgIG5ldyBQcm9taXNlKChvaywgZmFpbCkgPT4ge1xuICAgICAgY29uc3QgYmF0Y2hNZXRhID0gYmF0Y2gubWFwKGtleSA9PiBgXy4+LiR7a2V5fWAucmVwbGFjZShlZGdlUmUsIFwiXCIpKTtcblxuICAgICAgcmV0dXJuIHJlZGlzLmhtZ2V0KHNvdWwsIGJhdGNoTWV0YSwgKGVyciwgbWV0YSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJobWdldCBlcnJcIiwgZXJyLnN0YWNrIHx8IGVycikgfHwgZmFpbChlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9iaiA9IHtcbiAgICAgICAgICBcIl8uI1wiOiBzb3VsXG4gICAgICAgIH07XG5cbiAgICAgICAgbWV0YS5mb3JFYWNoKCh2YWwsIGlkeCkgPT4gKG9ialtiYXRjaE1ldGFbaWR4XV0gPSB2YWwpKTtcbiAgICAgICAgcmV0dXJuIHJlZGlzLmhtZ2V0KHNvdWwsIGJhdGNoLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihcImhtZ2V0IGVyclwiLCBlcnIuc3RhY2sgfHwgZXJyKSB8fCBmYWlsKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcy5mb3JFYWNoKCh2YWwsIGlkeCkgPT4gKG9ialtiYXRjaFtpZHhdXSA9IHZhbCkpO1xuICAgICAgICAgIHJldHVybiBvayhmcm9tUmVkaXMob2JqKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgY29uc3QgYmF0Y2hlZEdldCA9IChzb3VsLCBjYikgPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWRpcy5oa2V5cyhzb3VsLCAoZXJyLCBub2RlS2V5cykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcImVycm9yXCIsIGVyci5zdGFjayB8fCBlcnIpO1xuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZUtleXMubGVuZ3RoIDw9IEdFVF9CQVRDSF9TSVpFKSB7XG4gICAgICAgICAgcmV0dXJuIGdldChzb3VsKS50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICBjYihyZXMpO1xuICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0IGJpZyBzb3VsXCIsIHNvdWwsIG5vZGVLZXlzLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IGF0dHJLZXlzID0gbm9kZUtleXMuZmlsdGVyKGtleSA9PiAha2V5Lm1hdGNoKG1ldGFSZSkpO1xuICAgICAgICBjb25zdCByZWFkQmF0Y2ggPSAoKSA9PlxuICAgICAgICAgIG5ldyBQcm9taXNlKChvaywgZmFpbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYmF0Y2ggPSBhdHRyS2V5cy5zcGxpY2UoMCwgR0VUX0JBVENIX1NJWkUpO1xuXG4gICAgICAgICAgICBpZiAoIWJhdGNoLmxlbmd0aCkgcmV0dXJuIG9rKHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVhZEtleUJhdGNoKHNvdWwsIGJhdGNoKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgIGNiKHJlc3VsdCk7XG4gICAgICAgICAgICAgIHJldHVybiBvaygpO1xuICAgICAgICAgICAgfSwgZmFpbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJlYWROZXh0QmF0Y2ggPSAoKSA9PlxuICAgICAgICAgIHJlYWRCYXRjaCgpLnRoZW4oZG9uZSA9PiAhZG9uZSAmJiByZWFkTmV4dEJhdGNoKTtcblxuICAgICAgICByZXR1cm4gcmVhZE5leHRCYXRjaCgpXG4gICAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChyZWplY3QpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgY29uc3Qgd3JpdGUgPSBwdXQgPT5cbiAgICBQcm9taXNlLmFsbChcbiAgICAgIFIua2V5cyhwdXQpLm1hcChcbiAgICAgICAgc291bCA9PlxuICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBwdXRbc291bF07XG4gICAgICAgICAgICBjb25zdCBtZXRhID0gUi5wYXRoKFtcIl9cIiwgXCI+XCJdLCBub2RlKSB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVLZXlzID0gUi5rZXlzKG1ldGEpO1xuICAgICAgICAgICAgY29uc3Qgd3JpdGVOZXh0QmF0Y2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGJhdGNoID0gbm9kZUtleXMuc3BsaWNlKDAsIFBVVF9CQVRDSF9TSVpFKTtcblxuICAgICAgICAgICAgICBpZiAoIWJhdGNoLmxlbmd0aCkgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZCA9IHtcbiAgICAgICAgICAgICAgICBfOiB7XG4gICAgICAgICAgICAgICAgICBcIiNcIjogc291bCxcbiAgICAgICAgICAgICAgICAgIFwiPlwiOiBSLnBpY2soYmF0Y2gsIG1ldGEpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAuLi5SLnBpY2soYmF0Y2gsIG5vZGUpXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgLy8gcmV0dXJuIHJlYWRLZXlCYXRjaChzb3VsLCBiYXRjaCkudGhlbihleGlzdGluZyA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBnZXQoc291bCkudGhlbihleGlzdGluZyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9kaWZpZWRLZXlzID0gYmF0Y2guZmlsdGVyKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkVmFsID0gUi5wcm9wKGtleSwgdXBkYXRlZCk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1ZhbCA9IFIucHJvcChrZXksIGV4aXN0aW5nKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWRWYWwgPT09IGV4aXN0aW5nVmFsKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkU291bCA9IFIucGF0aChba2V5LCBcIiNcIl0sIHVwZGF0ZWQpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdTb3VsID0gUi5wYXRoKFtrZXksIFwiI1wiXSwgZXhpc3RpbmcpO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICh1cGRhdGVkU291bCB8fCBleGlzdGluZ1NvdWwpICYmXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRTb3VsID09PSBleGlzdGluZ1NvdWxcbiAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiB1cGRhdGVkVmFsID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQoZXhpc3RpbmdWYWwpID09PSB1cGRhdGVkVmFsXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICghbW9kaWZpZWRLZXlzLmxlbmd0aCkgcmV0dXJuIHdyaXRlTmV4dEJhdGNoKCk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkaWZmID0ge1xuICAgICAgICAgICAgICAgICAgXzogUi5hc3NvYyhcIj5cIiwgUi5waWNrKG1vZGlmaWVkS2V5cywgbWV0YSksIHVwZGF0ZWQuXyksXG4gICAgICAgICAgICAgICAgICAuLi5SLnBpY2sobW9kaWZpZWRLZXlzLCB1cGRhdGVkKVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVkaXMuaG1zZXQoc291bCwgdG9SZWRpcyhkaWZmKSwgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChlcnIpIDogd3JpdGVOZXh0QmF0Y2goKTtcbiAgICAgICAgICAgICAgICAgIG5vdGlmeUNoYW5nZVN1YnNjcmliZXJzKHNvdWwsIGRpZmYpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB3cml0ZU5leHRCYXRjaCgpO1xuICAgICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcblxuICBvbkNoYW5nZSgoc291bCwgZGlmZikgPT4gY29uc29sZS5sb2coXCJtb2RpZnlcIiwgc291bCwgUi5rZXlzKGRpZmYpKSk7XG5cbiAgcmV0dXJuIHsgZ2V0LCByZWFkLCBiYXRjaGVkR2V0LCB3cml0ZSwgb25DaGFuZ2UsIG9mZkNoYW5nZSB9O1xufTtcbiIsImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCIuL2NsaWVudFwiO1xuXG5leHBvcnQgY29uc3QgYXR0YWNoVG9HdW4gPSBHdW4gPT4gR3VuLm9uKFwiY3JlYXRlXCIsIGZ1bmN0aW9uKGRiKSB7XG4gIHRoaXMudG8ubmV4dChkYik7XG4gIGNvbnN0IHJlZGlzID0gR3VuLnJlZGlzID0gZGIucmVkaXMgPSBjcmVhdGVDbGllbnQoR3VuKTtcblxuICBkYi5vbihcImdldFwiLCBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgdGhpcy50by5uZXh0KHJlcXVlc3QpO1xuICAgIGNvbnN0IGRlZHVwSWQgPSByZXF1ZXN0W1wiI1wiXTtcbiAgICBjb25zdCBnZXQgPSByZXF1ZXN0LmdldDtcbiAgICBjb25zdCBzb3VsID0gZ2V0W1wiI1wiXTtcblxuICAgIHJlZGlzLmJhdGNoZWRHZXQoc291bCwgcmVzdWx0ID0+IGRiLm9uKFwiaW5cIiwge1xuICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICBwdXQ6IHJlc3VsdCA/IHsgW3NvdWxdOiByZXN1bHQgfSA6IG51bGwsXG4gICAgICBlcnI6IG51bGxcbiAgICB9KSkuY2F0Y2goZXJyID0+XG4gICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3JcIiwgZXJyLnN0YWNrIHx8IGVycikgfHxcbiAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgcHV0OiBudWxsLFxuICAgICAgICBlcnJcbiAgICAgIH0pXG4gICAgKTtcbiAgfSk7XG5cbiAgZGIub24oXCJwdXRcIiwgZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHRoaXMudG8ubmV4dChyZXF1ZXN0KTtcbiAgICBjb25zdCBkZWR1cElkID0gcmVxdWVzdFtcIiNcIl07XG5cbiAgICByZWRpcy53cml0ZShyZXF1ZXN0LnB1dClcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIG9rOiB0cnVlLFxuICAgICAgICAgIGVycjogbnVsbFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgLmNhdGNoKGVyciA9PlxuICAgICAgICBkYi5vbihcImluXCIsIHtcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBvazogZmFsc2UsXG4gICAgICAgICAgZXJyOiBlcnJcbiAgICAgICAgfSlcbiAgICAgICk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgKiBhcyByZWNlaXZlckZucyBmcm9tIFwiLi9yZWNlaXZlclwiO1xuZXhwb3J0IHsgYXR0YWNoVG9HdW4gfSBmcm9tIFwiLi9ndW5cIjtcblxuZXhwb3J0IGNvbnN0IHJlY2VpdmVyID0gcmVjZWl2ZXJGbnM7XG4iLCJpbXBvcnQgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50XCI7XG5cbmV4cG9ydCBjb25zdCByZXNwb25kVG9HZXRzID0gKFxuICBHdW4sXG4gIHsgZGlzYWJsZVJlbGF5ID0gdHJ1ZSwgc2tpcFZhbGlkYXRpb24gPSB0cnVlIH0gPSB7fVxuKSA9PiBkYiA9PiB7XG4gIGNvbnN0IHJlZGlzID0gKEd1bi5yZWRpcyA9IEd1bi5yZWRpcyB8fCBjcmVhdGVDbGllbnQoR3VuKSk7XG5cbiAgZGIub25Jbihtc2cgPT4ge1xuICAgIGNvbnN0IHsgZnJvbSwganNvbiwgZnJvbUNsdXN0ZXIgfSA9IG1zZztcbiAgICBjb25zdCBzb3VsID0gUi5wYXRoKFtcImdldFwiLCBcIiNcIl0sIGpzb24pO1xuICAgIGNvbnN0IGRlZHVwSWQgPSBSLnByb3AoXCIjXCIsIGpzb24pO1xuXG4gICAgaWYgKCFzb3VsIHx8IGZyb21DbHVzdGVyKSByZXR1cm4gbXNnO1xuICAgIHJldHVybiByZWRpc1xuICAgICAgLmJhdGNoZWRHZXQoc291bCwgcmVzdWx0ID0+IHtcbiAgICAgICAgY29uc3QganNvbiA9IHtcbiAgICAgICAgICBcIiNcIjogZnJvbS5tc2dJZCgpLFxuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIHB1dDogcmVzdWx0ID8geyBbc291bF06IHJlc3VsdCB9IDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGZyb20uc2VuZCh7XG4gICAgICAgICAganNvbixcbiAgICAgICAgICBpZ25vcmVMZWVjaGluZzogdHJ1ZSxcbiAgICAgICAgICBza2lwVmFsaWRhdGlvbjogIXJlc3VsdCB8fCBza2lwVmFsaWRhdGlvblxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiAoZGlzYWJsZVJlbGF5ID8gUi5hc3NvYyhcIm5vUmVsYXlcIiwgdHJ1ZSwgbXNnKSA6IG1zZykpXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc3QganNvbiA9IHtcbiAgICAgICAgICBcIiNcIjogZnJvbS5tc2dJZCgpLFxuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIGVycjogYCR7ZXJyfWBcbiAgICAgICAgfTtcblxuICAgICAgICBmcm9tLnNlbmQoeyBqc29uLCBpZ25vcmVMZWVjaGluZzogdHJ1ZSwgc2tpcFZhbGlkYXRpb24gfSk7XG4gICAgICAgIHJldHVybiBtc2c7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRiO1xufTtcblxuZXhwb3J0IGNvbnN0IGFjY2VwdFdyaXRlcyA9IChHdW4sIHsgZGlzYWJsZVJlbGF5ID0gZmFsc2UgfSA9IHt9KSA9PiBkYiA9PiB7XG4gIGNvbnN0IHJlZGlzID0gKEd1bi5yZWRpcyA9IEd1bi5yZWRpcyB8fCBjcmVhdGVDbGllbnQoR3VuKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICBkYi5vbkluKG1zZyA9PiB7XG4gICAgaWYgKG1zZy5mcm9tQ2x1c3RlcikgcmV0dXJuIG1zZztcbiAgICBpZiAobXNnLmpzb24ucHV0KSB7XG4gICAgICByZXR1cm4gZGJcbiAgICAgICAgLmdldERpZmYobXNnLmpzb24ucHV0KVxuICAgICAgICAudGhlbihkaWZmID0+IHtcbiAgICAgICAgICBjb25zdCBzb3VscyA9IFIua2V5cyhkaWZmKTtcblxuICAgICAgICAgIGlmICghc291bHMubGVuZ3RoKSByZXR1cm4gbXNnO1xuICAgICAgICAgIC8vIHJldHVybiBjb25zb2xlLmxvZyhcIndvdWxkIHdyaXRlXCIsIGRpZmYpIHx8IG1zZztcbiAgICAgICAgICByZXR1cm4gcmVkaXNcbiAgICAgICAgICAgIC53cml0ZShkaWZmKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBqc29uID0geyBcIkBcIjogbXNnLmpzb25bXCIjXCJdLCBvazogdHJ1ZSwgZXJyOiBudWxsIH07XG5cbiAgICAgICAgICAgICAgbXNnLmZyb20gJiZcbiAgICAgICAgICAgICAgICBtc2cuZnJvbS5zZW5kICYmXG4gICAgICAgICAgICAgICAgbXNnLmZyb20uc2VuZCh7XG4gICAgICAgICAgICAgICAgICBqc29uLFxuICAgICAgICAgICAgICAgICAgaWdub3JlTGVlY2hpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgICBza2lwVmFsaWRhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gZGlzYWJsZVJlbGF5ID8gUi5hc3NvYyhcIm5vUmVsYXlcIiwgdHJ1ZSwgbXNnKSA6IG1zZztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgY29uc3QganNvbiA9IHsgXCJAXCI6IG1zZy5qc29uW1wiI1wiXSwgb2s6IGZhbHNlLCBlcnI6IGAke2Vycn1gIH07XG5cbiAgICAgICAgICAgICAgbXNnLmZyb20gJiZcbiAgICAgICAgICAgICAgICBtc2cuZnJvbS5zZW5kICYmXG4gICAgICAgICAgICAgICAgbXNnLmZyb20uc2VuZCh7XG4gICAgICAgICAgICAgICAgICBqc29uLFxuICAgICAgICAgICAgICAgICAgaWdub3JlTGVlY2hpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgICBza2lwVmFsaWRhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gbXNnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnIgPT5cbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3IgYWNjZXB0aW5nIHdyaXRlc1wiLCBlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbXNnO1xuICB9KTtcblxuICByZXR1cm4gZGI7XG59O1xuIiwiaW1wb3J0IHsga2V5cyB9IGZyb20gXCJyYW1kYVwiO1xuY29uc3QgZmxhdHRlbiA9IHJlcXVpcmUoXCJmbGF0XCIpO1xuXG5jb25zdCBGSUVMRF9TSVpFX0xJTUlUID0gMTAwMDAwO1xuXG5mdW5jdGlvbiBwb3N0VW5mbGF0dGVuKG9iaikge1xuICAvLyBUaGlzIGlzIHByb2JhYmx5IG9ubHkgbmVjZXNzYXJ5IGlmIHlvdSBhcmUgc3R1cGlkIGxpa2UgbWUgYW5kIHVzZSB0aGUgZGVmYXVsdCAuIGRlbGltaXRlciBmb3IgZmxhdHRlblxuICBpZiAoIW9iaikgcmV0dXJuIG9iajtcbiAgbGV0IGFycm93ID0gKG9iai5fICYmIG9iai5fW1wiPlwiXSkgfHwge307XG5cbiAga2V5cyhhcnJvdykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBsZXQgdmFsdWUgPSBhcnJvd1trZXldO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IHZhbEtleXMgPSBrZXlzKHZhbHVlKTtcbiAgICAgIGxldCByZW1haW5kZXIgPSB2YWxLZXlzWzBdO1xuXG4gICAgICBpZiAocmVtYWluZGVyKSB7XG4gICAgICAgIGxldCByZWFsS2V5ID0gW2tleSwgdmFsS2V5c10uam9pbihcIi5cIik7XG4gICAgICAgIGxldCByZWFsVmFsdWUgPSB2YWx1ZVtyZW1haW5kZXJdO1xuXG4gICAgICAgIGRlbGV0ZSBhcnJvd1trZXldO1xuICAgICAgICBhcnJvd1tyZWFsS2V5XSA9IHJlYWxWYWx1ZTtcbiAgICAgICAgcmVhbFZhbHVlID0gKG9ialtrZXldICYmIG9ialtrZXldW3JlbWFpbmRlcl0pIHx8IG51bGw7XG4gICAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICAgICAgb2JqW3JlYWxLZXldID0gcmVhbFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKGtleVswXSA9PT0gXCIuXCIpIGRlbGV0ZSBba2V5XTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUmVkaXMob2JqKSB7XG4gIGlmICghb2JqKSByZXR1cm4gb2JqO1xuICBjb25zdCBzb3J0ZWQgPSB7fTtcblxuICBrZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIG9ialtrZXldO1xuXG4gICAgaWYgKG9ialtrZXldID09PSBcInxOVUxMfFwiKSB7XG4gICAgICBvYmpba2V5XSA9IG51bGw7XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSA9PT0gXCJ8VU5ERUZJTkVEfFwiKSB7XG4gICAgICBvYmpba2V5XSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoLz5cXC4vLnRlc3Qoa2V5KSkge1xuICAgICAgb2JqW2tleV0gPSBwYXJzZUZsb2F0KG9ialtrZXldLCAxMCkgfHwgb2JqW2tleV07XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSAmJiBvYmpba2V5XS5sZW5ndGggPiBGSUVMRF9TSVpFX0xJTUlUKSB7XG4gICAgICBvYmpba2V5XSA9IG9ialtrZXldLnNsaWNlKDAsIEZJRUxEX1NJWkVfTElNSVQpO1xuICAgICAgY29uc29sZS5sb2coXCJ0cnVuY2F0ZWRcIiwga2V5KTtcbiAgICB9XG4gIH0pO1xuXG4gIG9iaiA9IHBvc3RVbmZsYXR0ZW4oZmxhdHRlbi51bmZsYXR0ZW4ob2JqKSk7XG5cbiAgT2JqZWN0LmtleXMob2JqKVxuICAgIC5zb3J0KClcbiAgICAuZm9yRWFjaChrZXkgPT4gKHNvcnRlZFtrZXldID0gb2JqW2tleV0pKTtcblxuICByZXR1cm4gc29ydGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9SZWRpcyhvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIG9iaiA9IGZsYXR0ZW4ob2JqKTtcbiAga2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKG9ialtrZXldID09PSBudWxsKSB7XG4gICAgICBvYmpba2V5XSA9IFwifE5VTEx8XCI7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgb2JqW2tleV0gPSBcInxVTkRFRklORUR8XCI7XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSAmJiBvYmpba2V5XS5sZW5ndGggPiBGSUVMRF9TSVpFX0xJTUlUKSB7XG4gICAgICBvYmpba2V5XSA9IG9ialtrZXldLnNsaWNlKDAsIEZJRUxEX1NJWkVfTElNSVQpO1xuICAgICAgY29uc29sZS5sb2coXCJ0cnVuY2F0ZWQgaW5wdXRcIiwga2V5KTtcbiAgICB9XG4gICAgaWYgKGtleVswXSA9PT0gXCIuXCIpIGRlbGV0ZSBvYmpba2V5XTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfZmxhdF9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yYW1kYV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yZWRpc19fOyJdLCJzb3VyY2VSb290IjoiIn0=