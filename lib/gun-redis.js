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

  var notifyChangeSubscribers = function notifyChangeSubscribers(soul, diff, original) {
    return changeSubscribers.map(function (fn) {
      return fn(soul, diff, original);
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
              notifyChangeSubscribers(soul, diff, existing);
            });
          });
        };

        return writeNextBatch();
      });
    }));
  }; // onChange((soul, diff) => console.log("modify", soul, R.keys(diff)));


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
              noRelay: true,
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
              noRelay: disableRelay,
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
  obj = postUnflatten(flatten.unflatten(obj, {
    object: true
  }));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndW4tcmVkaXMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2d1bi1yZWRpcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvY2xpZW50LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9ndW4uanMiLCJ3ZWJwYWNrOi8vZ3VuLXJlZGlzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9yZWNlaXZlci5qcyIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvc2VyaWFsaXplLmpzIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcImZsYXRcIiIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvZXh0ZXJuYWwgXCJyYW1kYVwiIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcInJlZGlzXCIiXSwibmFtZXMiOlsiR0VUX0JBVENIX1NJWkUiLCJQVVRfQkFUQ0hfU0laRSIsIm1ldGFSZSIsImVkZ2VSZSIsImNyZWF0ZUNsaWVudCIsIkd1biIsImNoYW5nZVN1YnNjcmliZXJzIiwiY29uZmlnIiwicmVkaXMiLCJub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyIsInNvdWwiLCJkaWZmIiwib3JpZ2luYWwiLCJtYXAiLCJmbiIsIm9uQ2hhbmdlIiwicHVzaCIsIm9mZkNoYW5nZSIsIlIiLCJ3aXRob3V0IiwiZ2V0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJoZ2V0YWxsIiwiZXJyIiwicmVzIiwiY29uc29sZSIsImVycm9yIiwidW5kZWZpbmVkIiwicmVhZCIsInRoZW4iLCJyYXdEYXRhIiwiZGF0YSIsIlNFQSIsImluZGV4T2YiLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsInZlcmlmeSIsIm9wdCIsInBhY2siLCJ1bnBhY2siLCJyZWFkS2V5QmF0Y2giLCJiYXRjaCIsIm9rIiwiZmFpbCIsImJhdGNoTWV0YSIsInJlcGxhY2UiLCJobWdldCIsIm1ldGEiLCJzdGFjayIsIm9iaiIsInZhbCIsImlkeCIsImJhdGNoZWRHZXQiLCJjYiIsImhrZXlzIiwibm9kZUtleXMiLCJsZW5ndGgiLCJsb2ciLCJhdHRyS2V5cyIsImZpbHRlciIsIm1hdGNoIiwicmVhZEJhdGNoIiwic3BsaWNlIiwicmVzdWx0IiwicmVhZE5leHRCYXRjaCIsImRvbmUiLCJjYXRjaCIsIndyaXRlIiwicHV0IiwiYWxsIiwibm9kZSIsInBhdGgiLCJ3cml0ZU5leHRCYXRjaCIsInVwZGF0ZWQiLCJfIiwicGljayIsImV4aXN0aW5nIiwibW9kaWZpZWRLZXlzIiwidXBkYXRlZFZhbCIsInByb3AiLCJleGlzdGluZ1ZhbCIsInVwZGF0ZWRTb3VsIiwiZXhpc3RpbmdTb3VsIiwicGFyc2VGbG9hdCIsImFzc29jIiwiaG1zZXQiLCJhdHRhY2hUb0d1biIsIm9uIiwiZGIiLCJ0byIsIm5leHQiLCJyZXF1ZXN0IiwiZGVkdXBJZCIsInJlY2VpdmVyIiwicmVjZWl2ZXJGbnMiLCJyZXNwb25kVG9HZXRzIiwiZGlzYWJsZVJlbGF5Iiwic2tpcFZhbGlkYXRpb24iLCJvbkluIiwibXNnIiwiZnJvbSIsImpzb24iLCJmcm9tQ2x1c3RlciIsIm1zZ0lkIiwic2VuZCIsImlnbm9yZUxlZWNoaW5nIiwiYWNjZXB0V3JpdGVzIiwiZ2V0RGlmZiIsInNvdWxzIiwibm9SZWxheSIsImZsYXR0ZW4iLCJyZXF1aXJlIiwiRklFTERfU0laRV9MSU1JVCIsInBvc3RVbmZsYXR0ZW4iLCJhcnJvdyIsInZhbHVlIiwidmFsS2V5cyIsInJlbWFpbmRlciIsInJlYWxLZXkiLCJqb2luIiwicmVhbFZhbHVlIiwiZnJvbVJlZGlzIiwic29ydGVkIiwidGVzdCIsInNsaWNlIiwidW5mbGF0dGVuIiwib2JqZWN0IiwiT2JqZWN0Iiwic29ydCIsInRvUmVkaXMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxP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QUFILElBQVljLEdBQUcsQ0FBQ2QsR0FBRCxDQUFILENBQVNxQixNQUFULEdBQWtCd0QsZ0JBQWxDLEVBQW9EO0FBQ2xEL0QsU0FBRyxDQUFDZCxHQUFELENBQUgsR0FBV2MsR0FBRyxDQUFDZCxHQUFELENBQUgsQ0FBU3lGLEtBQVQsQ0FBZSxDQUFmLEVBQWtCWixnQkFBbEIsQ0FBWDtBQUNBeEYsYUFBTyxDQUFDaUMsR0FBUixDQUFZLGlCQUFaLEVBQStCdEIsR0FBL0I7QUFDRDs7QUFDRCxRQUFJQSxHQUFHLENBQUMsQ0FBRCxDQUFILEtBQVcsR0FBZixFQUFvQixPQUFPYyxHQUFHLENBQUNkLEdBQUQsQ0FBVjtBQUNyQixHQVpEO0FBYUEsU0FBT2MsR0FBUDtBQUNELEM7Ozs7Ozs7Ozs7O0FDcEZELGtEOzs7Ozs7Ozs7OztBQ0FBLG1EOzs7Ozs7Ozs7OztBQ0FBLG1EIiwiZmlsZSI6Imd1bi1yZWRpcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcImZsYXRcIiksIHJlcXVpcmUoXCJyYW1kYVwiKSwgcmVxdWlyZShcInJlZGlzXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwiZ3VuLXJlZGlzXCIsIFtcImZsYXRcIiwgXCJyYW1kYVwiLCBcInJlZGlzXCJdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImd1bi1yZWRpc1wiXSA9IGZhY3RvcnkocmVxdWlyZShcImZsYXRcIiksIHJlcXVpcmUoXCJyYW1kYVwiKSwgcmVxdWlyZShcInJlZGlzXCIpKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJndW4tcmVkaXNcIl0gPSBmYWN0b3J5KHJvb3RbXCJmbGF0XCJdLCByb290W1wicmFtZGFcIl0sIHJvb3RbXCJyZWRpc1wiXSk7XG59KSh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0aGlzLCBmdW5jdGlvbihfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ZsYXRfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yYW1kYV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX3JlZGlzX18pIHtcbnJldHVybiAiLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImltcG9ydCAqIGFzIFIgZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgYXMgY3JlYXRlUmVkaXNDbGllbnQgfSBmcm9tIFwicmVkaXNcIjtcbmltcG9ydCB7IHRvUmVkaXMsIGZyb21SZWRpcyB9IGZyb20gXCIuL3NlcmlhbGl6ZVwiO1xuXG5jb25zdCBHRVRfQkFUQ0hfU0laRSA9IDEwMDAwO1xuY29uc3QgUFVUX0JBVENIX1NJWkUgPSAxMDAwMDtcblxuY29uc3QgbWV0YVJlID0gL15fXFwuLiovO1xuY29uc3QgZWRnZVJlID0gLyhcXC4jJCkvO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlQ2xpZW50ID0gKEd1biwgLi4uY29uZmlnKSA9PiB7XG4gIGxldCBjaGFuZ2VTdWJzY3JpYmVycyA9IFtdO1xuICBjb25zdCByZWRpcyA9IGNyZWF0ZVJlZGlzQ2xpZW50KC4uLmNvbmZpZyk7XG4gIGNvbnN0IG5vdGlmeUNoYW5nZVN1YnNjcmliZXJzID0gKHNvdWwsIGRpZmYsIG9yaWdpbmFsKSA9PlxuICAgIGNoYW5nZVN1YnNjcmliZXJzLm1hcChmbiA9PiBmbihzb3VsLCBkaWZmLCBvcmlnaW5hbCkpO1xuICBjb25zdCBvbkNoYW5nZSA9IGZuID0+IGNoYW5nZVN1YnNjcmliZXJzLnB1c2goZm4pO1xuICBjb25zdCBvZmZDaGFuZ2UgPSBmbiA9PlxuICAgIChjaGFuZ2VTdWJzY3JpYmVycyA9IFIud2l0aG91dChbZm5dLCBjaGFuZ2VTdWJzY3JpYmVycykpO1xuXG4gIGNvbnN0IGdldCA9IHNvdWwgPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIXNvdWwpIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgcmVkaXMuaGdldGFsbChzb3VsLCBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcImdldCBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZnJvbVJlZGlzKHJlcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSk7XG5cbiAgY29uc3QgcmVhZCA9IHNvdWwgPT5cbiAgICBnZXQoc291bCkudGhlbihyYXdEYXRhID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSByYXdEYXRhID8geyAuLi5yYXdEYXRhIH0gOiByYXdEYXRhO1xuXG4gICAgICBpZiAoIUd1bi5TRUEgfHwgc291bC5pbmRleE9mKFwiflwiKSA9PT0gLTEpIHJldHVybiByYXdEYXRhO1xuICAgICAgUi53aXRob3V0KFtcIl9cIl0sIFIua2V5cyhkYXRhKSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBHdW4uU0VBLnZlcmlmeShcbiAgICAgICAgICBHdW4uU0VBLm9wdC5wYWNrKHJhd0RhdGFba2V5XSwga2V5LCByYXdEYXRhLCBzb3VsKSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICByZXMgPT4gKGRhdGFba2V5XSA9IEd1bi5TRUEub3B0LnVucGFjayhyZXMsIGtleSwgcmF3RGF0YSkpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xuXG4gIGNvbnN0IHJlYWRLZXlCYXRjaCA9IChzb3VsLCBiYXRjaCkgPT5cbiAgICBuZXcgUHJvbWlzZSgob2ssIGZhaWwpID0+IHtcbiAgICAgIGNvbnN0IGJhdGNoTWV0YSA9IGJhdGNoLm1hcChrZXkgPT4gYF8uPi4ke2tleX1gLnJlcGxhY2UoZWRnZVJlLCBcIlwiKSk7XG5cbiAgICAgIHJldHVybiByZWRpcy5obWdldChzb3VsLCBiYXRjaE1ldGEsIChlcnIsIG1ldGEpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKFwiaG1nZXQgZXJyXCIsIGVyci5zdGFjayB8fCBlcnIpIHx8IGZhaWwoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgXCJfLiNcIjogc291bFxuICAgICAgICB9O1xuXG4gICAgICAgIG1ldGEuZm9yRWFjaCgodmFsLCBpZHgpID0+IChvYmpbYmF0Y2hNZXRhW2lkeF1dID0gdmFsKSk7XG4gICAgICAgIHJldHVybiByZWRpcy5obWdldChzb3VsLCBiYXRjaCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJobWdldCBlcnJcIiwgZXJyLnN0YWNrIHx8IGVycikgfHwgZmFpbChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMuZm9yRWFjaCgodmFsLCBpZHgpID0+IChvYmpbYmF0Y2hbaWR4XV0gPSB2YWwpKTtcbiAgICAgICAgICByZXR1cm4gb2soZnJvbVJlZGlzKG9iaikpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIGNvbnN0IGJhdGNoZWRHZXQgPSAoc291bCwgY2IpID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmVkaXMuaGtleXMoc291bCwgKGVyciwgbm9kZUtleXMpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvclwiLCBlcnIuc3RhY2sgfHwgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGVLZXlzLmxlbmd0aCA8PSBHRVRfQkFUQ0hfU0laRSkge1xuICAgICAgICAgIHJldHVybiBnZXQoc291bCkudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgY2IocmVzKTtcbiAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcImdldCBiaWcgc291bFwiLCBzb3VsLCBub2RlS2V5cy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBhdHRyS2V5cyA9IG5vZGVLZXlzLmZpbHRlcihrZXkgPT4gIWtleS5tYXRjaChtZXRhUmUpKTtcbiAgICAgICAgY29uc3QgcmVhZEJhdGNoID0gKCkgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgob2ssIGZhaWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJhdGNoID0gYXR0cktleXMuc3BsaWNlKDAsIEdFVF9CQVRDSF9TSVpFKTtcblxuICAgICAgICAgICAgaWYgKCFiYXRjaC5sZW5ndGgpIHJldHVybiBvayh0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlYWRLZXlCYXRjaChzb3VsLCBiYXRjaCkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICBjYihyZXN1bHQpO1xuICAgICAgICAgICAgICByZXR1cm4gb2soKTtcbiAgICAgICAgICAgIH0sIGZhaWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWFkTmV4dEJhdGNoID0gKCkgPT5cbiAgICAgICAgICByZWFkQmF0Y2goKS50aGVuKGRvbmUgPT4gIWRvbmUgJiYgcmVhZE5leHRCYXRjaCk7XG5cbiAgICAgICAgcmV0dXJuIHJlYWROZXh0QmF0Y2goKVxuICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIGNvbnN0IHdyaXRlID0gcHV0ID0+XG4gICAgUHJvbWlzZS5hbGwoXG4gICAgICBSLmtleXMocHV0KS5tYXAoXG4gICAgICAgIHNvdWwgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gcHV0W3NvdWxdO1xuICAgICAgICAgICAgY29uc3QgbWV0YSA9IFIucGF0aChbXCJfXCIsIFwiPlwiXSwgbm9kZSkgfHwge307XG4gICAgICAgICAgICBjb25zdCBub2RlS2V5cyA9IFIua2V5cyhtZXRhKTtcbiAgICAgICAgICAgIGNvbnN0IHdyaXRlTmV4dEJhdGNoID0gKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBiYXRjaCA9IG5vZGVLZXlzLnNwbGljZSgwLCBQVVRfQkFUQ0hfU0laRSk7XG5cbiAgICAgICAgICAgICAgaWYgKCFiYXRjaC5sZW5ndGgpIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSB7XG4gICAgICAgICAgICAgICAgXzoge1xuICAgICAgICAgICAgICAgICAgXCIjXCI6IHNvdWwsXG4gICAgICAgICAgICAgICAgICBcIj5cIjogUi5waWNrKGJhdGNoLCBtZXRhKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4uUi5waWNrKGJhdGNoLCBub2RlKVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIC8vIHJldHVybiByZWFkS2V5QmF0Y2goc291bCwgYmF0Y2gpLnRoZW4oZXhpc3RpbmcgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gZ2V0KHNvdWwpLnRoZW4oZXhpc3RpbmcgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVkS2V5cyA9IGJhdGNoLmZpbHRlcihrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFZhbCA9IFIucHJvcChrZXksIHVwZGF0ZWQpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdWYWwgPSBSLnByb3Aoa2V5LCBleGlzdGluZyk7XG5cbiAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVkVmFsID09PSBleGlzdGluZ1ZhbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFNvdWwgPSBSLnBhdGgoW2tleSwgXCIjXCJdLCB1cGRhdGVkKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nU291bCA9IFIucGF0aChba2V5LCBcIiNcIl0sIGV4aXN0aW5nKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAodXBkYXRlZFNvdWwgfHwgZXhpc3RpbmdTb3VsKSAmJlxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkU291bCA9PT0gZXhpc3RpbmdTb3VsXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdXBkYXRlZFZhbCA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KGV4aXN0aW5nVmFsKSA9PT0gdXBkYXRlZFZhbFxuICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIW1vZGlmaWVkS2V5cy5sZW5ndGgpIHJldHVybiB3cml0ZU5leHRCYXRjaCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlmZiA9IHtcbiAgICAgICAgICAgICAgICAgIF86IFIuYXNzb2MoXCI+XCIsIFIucGljayhtb2RpZmllZEtleXMsIG1ldGEpLCB1cGRhdGVkLl8pLFxuICAgICAgICAgICAgICAgICAgLi4uUi5waWNrKG1vZGlmaWVkS2V5cywgdXBkYXRlZClcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZGlzLmhtc2V0KHNvdWwsIHRvUmVkaXMoZGlmZiksIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICBlcnIgPyByZWplY3QoZXJyKSA6IHdyaXRlTmV4dEJhdGNoKCk7XG4gICAgICAgICAgICAgICAgICBub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyhzb3VsLCBkaWZmLCBleGlzdGluZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHdyaXRlTmV4dEJhdGNoKCk7XG4gICAgICAgICAgfSlcbiAgICAgIClcbiAgICApO1xuXG4gIC8vIG9uQ2hhbmdlKChzb3VsLCBkaWZmKSA9PiBjb25zb2xlLmxvZyhcIm1vZGlmeVwiLCBzb3VsLCBSLmtleXMoZGlmZikpKTtcblxuICByZXR1cm4geyBnZXQsIHJlYWQsIGJhdGNoZWRHZXQsIHdyaXRlLCBvbkNoYW5nZSwgb2ZmQ2hhbmdlIH07XG59O1xuIiwiaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50XCI7XG5cbmV4cG9ydCBjb25zdCBhdHRhY2hUb0d1biA9IEd1biA9PiBHdW4ub24oXCJjcmVhdGVcIiwgZnVuY3Rpb24oZGIpIHtcbiAgdGhpcy50by5uZXh0KGRiKTtcbiAgY29uc3QgcmVkaXMgPSBHdW4ucmVkaXMgPSBkYi5yZWRpcyA9IGNyZWF0ZUNsaWVudChHdW4pO1xuXG4gIGRiLm9uKFwiZ2V0XCIsIGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICB0aGlzLnRvLm5leHQocmVxdWVzdCk7XG4gICAgY29uc3QgZGVkdXBJZCA9IHJlcXVlc3RbXCIjXCJdO1xuICAgIGNvbnN0IGdldCA9IHJlcXVlc3QuZ2V0O1xuICAgIGNvbnN0IHNvdWwgPSBnZXRbXCIjXCJdO1xuXG4gICAgcmVkaXMuYmF0Y2hlZEdldChzb3VsLCByZXN1bHQgPT4gZGIub24oXCJpblwiLCB7XG4gICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgIHB1dDogcmVzdWx0ID8geyBbc291bF06IHJlc3VsdCB9IDogbnVsbCxcbiAgICAgIGVycjogbnVsbFxuICAgIH0pKS5jYXRjaChlcnIgPT5cbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvclwiLCBlcnIuc3RhY2sgfHwgZXJyKSB8fFxuICAgICAgZGIub24oXCJpblwiLCB7XG4gICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICBwdXQ6IG51bGwsXG4gICAgICAgIGVyclxuICAgICAgfSlcbiAgICApO1xuICB9KTtcblxuICBkYi5vbihcInB1dFwiLCBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgdGhpcy50by5uZXh0KHJlcXVlc3QpO1xuICAgIGNvbnN0IGRlZHVwSWQgPSByZXF1ZXN0W1wiI1wiXTtcblxuICAgIHJlZGlzLndyaXRlKHJlcXVlc3QucHV0KVxuICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgZGIub24oXCJpblwiLCB7XG4gICAgICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICAgICAgb2s6IHRydWUsXG4gICAgICAgICAgZXJyOiBudWxsXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICAuY2F0Y2goZXJyID0+XG4gICAgICAgIGRiLm9uKFwiaW5cIiwge1xuICAgICAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgICAgIG9rOiBmYWxzZSxcbiAgICAgICAgICBlcnI6IGVyclxuICAgICAgICB9KVxuICAgICAgKTtcbiAgfSk7XG59KTtcbiIsImltcG9ydCAqIGFzIHJlY2VpdmVyRm5zIGZyb20gXCIuL3JlY2VpdmVyXCI7XG5leHBvcnQgeyBhdHRhY2hUb0d1biB9IGZyb20gXCIuL2d1blwiO1xuXG5leHBvcnQgY29uc3QgcmVjZWl2ZXIgPSByZWNlaXZlckZucztcbiIsImltcG9ydCAqIGFzIFIgZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiLi9jbGllbnRcIjtcblxuZXhwb3J0IGNvbnN0IHJlc3BvbmRUb0dldHMgPSAoXG4gIEd1bixcbiAgeyBkaXNhYmxlUmVsYXkgPSB0cnVlLCBza2lwVmFsaWRhdGlvbiA9IHRydWUgfSA9IHt9XG4pID0+IGRiID0+IHtcbiAgY29uc3QgcmVkaXMgPSAoR3VuLnJlZGlzID0gR3VuLnJlZGlzIHx8IGNyZWF0ZUNsaWVudChHdW4pKTtcblxuICBkYi5vbkluKG1zZyA9PiB7XG4gICAgY29uc3QgeyBmcm9tLCBqc29uLCBmcm9tQ2x1c3RlciB9ID0gbXNnO1xuICAgIGNvbnN0IHNvdWwgPSBSLnBhdGgoW1wiZ2V0XCIsIFwiI1wiXSwganNvbik7XG4gICAgY29uc3QgZGVkdXBJZCA9IFIucHJvcChcIiNcIiwganNvbik7XG5cbiAgICBpZiAoIXNvdWwgfHwgZnJvbUNsdXN0ZXIpIHJldHVybiBtc2c7XG4gICAgcmV0dXJuIHJlZGlzXG4gICAgICAuYmF0Y2hlZEdldChzb3VsLCByZXN1bHQgPT4ge1xuICAgICAgICBjb25zdCBqc29uID0ge1xuICAgICAgICAgIFwiI1wiOiBmcm9tLm1zZ0lkKCksXG4gICAgICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICAgICAgcHV0OiByZXN1bHQgPyB7IFtzb3VsXTogcmVzdWx0IH0gOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgZnJvbS5zZW5kKHtcbiAgICAgICAgICBqc29uLFxuICAgICAgICAgIGlnbm9yZUxlZWNoaW5nOiB0cnVlLFxuICAgICAgICAgIHNraXBWYWxpZGF0aW9uOiAhcmVzdWx0IHx8IHNraXBWYWxpZGF0aW9uXG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IChkaXNhYmxlUmVsYXkgPyBSLmFzc29jKFwibm9SZWxheVwiLCB0cnVlLCBtc2cpIDogbXNnKSlcbiAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zdCBqc29uID0ge1xuICAgICAgICAgIFwiI1wiOiBmcm9tLm1zZ0lkKCksXG4gICAgICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICAgICAgZXJyOiBgJHtlcnJ9YFxuICAgICAgICB9O1xuXG4gICAgICAgIGZyb20uc2VuZCh7IGpzb24sIGlnbm9yZUxlZWNoaW5nOiB0cnVlLCBza2lwVmFsaWRhdGlvbiB9KTtcbiAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gZGI7XG59O1xuXG5leHBvcnQgY29uc3QgYWNjZXB0V3JpdGVzID0gKEd1biwgeyBkaXNhYmxlUmVsYXkgPSBmYWxzZSB9ID0ge30pID0+IGRiID0+IHtcbiAgY29uc3QgcmVkaXMgPSAoR3VuLnJlZGlzID0gR3VuLnJlZGlzIHx8IGNyZWF0ZUNsaWVudChHdW4pKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIGRiLm9uSW4obXNnID0+IHtcbiAgICBpZiAobXNnLmZyb21DbHVzdGVyKSByZXR1cm4gbXNnO1xuICAgIGlmIChtc2cuanNvbi5wdXQpIHtcbiAgICAgIHJldHVybiBkYlxuICAgICAgICAuZ2V0RGlmZihtc2cuanNvbi5wdXQpXG4gICAgICAgIC50aGVuKGRpZmYgPT4ge1xuICAgICAgICAgIGNvbnN0IHNvdWxzID0gUi5rZXlzKGRpZmYpO1xuXG4gICAgICAgICAgaWYgKCFzb3Vscy5sZW5ndGgpIHJldHVybiBtc2c7XG4gICAgICAgICAgLy8gcmV0dXJuIGNvbnNvbGUubG9nKFwid291bGQgd3JpdGVcIiwgZGlmZikgfHwgbXNnO1xuICAgICAgICAgIHJldHVybiByZWRpc1xuICAgICAgICAgICAgLndyaXRlKGRpZmYpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB7IFwiQFwiOiBtc2cuanNvbltcIiNcIl0sIG9rOiB0cnVlLCBlcnI6IG51bGwgfTtcblxuICAgICAgICAgICAgICBtc2cuZnJvbSAmJlxuICAgICAgICAgICAgICAgIG1zZy5mcm9tLnNlbmQgJiZcbiAgICAgICAgICAgICAgICBtc2cuZnJvbS5zZW5kKHtcbiAgICAgICAgICAgICAgICAgIGpzb24sXG4gICAgICAgICAgICAgICAgICBub1JlbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgaWdub3JlTGVlY2hpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgICBza2lwVmFsaWRhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gZGlzYWJsZVJlbGF5ID8gUi5hc3NvYyhcIm5vUmVsYXlcIiwgdHJ1ZSwgbXNnKSA6IG1zZztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgY29uc3QganNvbiA9IHsgXCJAXCI6IG1zZy5qc29uW1wiI1wiXSwgb2s6IGZhbHNlLCBlcnI6IGAke2Vycn1gIH07XG5cbiAgICAgICAgICAgICAgbXNnLmZyb20gJiZcbiAgICAgICAgICAgICAgICBtc2cuZnJvbS5zZW5kICYmXG4gICAgICAgICAgICAgICAgbXNnLmZyb20uc2VuZCh7XG4gICAgICAgICAgICAgICAgICBqc29uLFxuICAgICAgICAgICAgICAgICAgbm9SZWxheTogZGlzYWJsZVJlbGF5LFxuICAgICAgICAgICAgICAgICAgaWdub3JlTGVlY2hpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgICBza2lwVmFsaWRhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gbXNnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnIgPT5cbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3IgYWNjZXB0aW5nIHdyaXRlc1wiLCBlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbXNnO1xuICB9KTtcblxuICByZXR1cm4gZGI7XG59O1xuIiwiaW1wb3J0IHsga2V5cyB9IGZyb20gXCJyYW1kYVwiO1xuY29uc3QgZmxhdHRlbiA9IHJlcXVpcmUoXCJmbGF0XCIpO1xuXG5jb25zdCBGSUVMRF9TSVpFX0xJTUlUID0gMTAwMDAwO1xuXG5mdW5jdGlvbiBwb3N0VW5mbGF0dGVuKG9iaikge1xuICAvLyBUaGlzIGlzIHByb2JhYmx5IG9ubHkgbmVjZXNzYXJ5IGlmIHlvdSBhcmUgc3R1cGlkIGxpa2UgbWUgYW5kIHVzZSB0aGUgZGVmYXVsdCAuIGRlbGltaXRlciBmb3IgZmxhdHRlblxuICBpZiAoIW9iaikgcmV0dXJuIG9iajtcbiAgbGV0IGFycm93ID0gKG9iai5fICYmIG9iai5fW1wiPlwiXSkgfHwge307XG5cbiAga2V5cyhhcnJvdykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBsZXQgdmFsdWUgPSBhcnJvd1trZXldO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IHZhbEtleXMgPSBrZXlzKHZhbHVlKTtcbiAgICAgIGxldCByZW1haW5kZXIgPSB2YWxLZXlzWzBdO1xuXG4gICAgICBpZiAocmVtYWluZGVyKSB7XG4gICAgICAgIGxldCByZWFsS2V5ID0gW2tleSwgdmFsS2V5c10uam9pbihcIi5cIik7XG4gICAgICAgIGxldCByZWFsVmFsdWUgPSB2YWx1ZVtyZW1haW5kZXJdO1xuXG4gICAgICAgIGRlbGV0ZSBhcnJvd1trZXldO1xuICAgICAgICBhcnJvd1tyZWFsS2V5XSA9IHJlYWxWYWx1ZTtcbiAgICAgICAgcmVhbFZhbHVlID0gKG9ialtrZXldICYmIG9ialtrZXldW3JlbWFpbmRlcl0pIHx8IG51bGw7XG4gICAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICAgICAgb2JqW3JlYWxLZXldID0gcmVhbFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKGtleVswXSA9PT0gXCIuXCIpIGRlbGV0ZSBba2V5XTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUmVkaXMob2JqKSB7XG4gIGlmICghb2JqKSByZXR1cm4gb2JqO1xuICBjb25zdCBzb3J0ZWQgPSB7fTtcblxuICBrZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIG9ialtrZXldO1xuXG4gICAgaWYgKG9ialtrZXldID09PSBcInxOVUxMfFwiKSB7XG4gICAgICBvYmpba2V5XSA9IG51bGw7XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSA9PT0gXCJ8VU5ERUZJTkVEfFwiKSB7XG4gICAgICBvYmpba2V5XSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoLz5cXC4vLnRlc3Qoa2V5KSkge1xuICAgICAgb2JqW2tleV0gPSBwYXJzZUZsb2F0KG9ialtrZXldLCAxMCkgfHwgb2JqW2tleV07XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSAmJiBvYmpba2V5XS5sZW5ndGggPiBGSUVMRF9TSVpFX0xJTUlUKSB7XG4gICAgICBvYmpba2V5XSA9IG9ialtrZXldLnNsaWNlKDAsIEZJRUxEX1NJWkVfTElNSVQpO1xuICAgICAgY29uc29sZS5sb2coXCJ0cnVuY2F0ZWRcIiwga2V5KTtcbiAgICB9XG4gIH0pO1xuXG4gIG9iaiA9IHBvc3RVbmZsYXR0ZW4oZmxhdHRlbi51bmZsYXR0ZW4ob2JqLCB7IG9iamVjdDogdHJ1ZSB9KSk7XG5cbiAgT2JqZWN0LmtleXMob2JqKVxuICAgIC5zb3J0KClcbiAgICAuZm9yRWFjaChrZXkgPT4gKHNvcnRlZFtrZXldID0gb2JqW2tleV0pKTtcblxuICByZXR1cm4gc29ydGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9SZWRpcyhvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIG9iaiA9IGZsYXR0ZW4ob2JqKTtcbiAga2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKG9ialtrZXldID09PSBudWxsKSB7XG4gICAgICBvYmpba2V5XSA9IFwifE5VTEx8XCI7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgb2JqW2tleV0gPSBcInxVTkRFRklORUR8XCI7XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSAmJiBvYmpba2V5XS5sZW5ndGggPiBGSUVMRF9TSVpFX0xJTUlUKSB7XG4gICAgICBvYmpba2V5XSA9IG9ialtrZXldLnNsaWNlKDAsIEZJRUxEX1NJWkVfTElNSVQpO1xuICAgICAgY29uc29sZS5sb2coXCJ0cnVuY2F0ZWQgaW5wdXRcIiwga2V5KTtcbiAgICB9XG4gICAgaWYgKGtleVswXSA9PT0gXCIuXCIpIGRlbGV0ZSBvYmpba2V5XTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfZmxhdF9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yYW1kYV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yZWRpc19fOyJdLCJzb3VyY2VSb290IjoiIn0=