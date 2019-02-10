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
            return msg;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndW4tcmVkaXMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2d1bi1yZWRpcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvY2xpZW50LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9ndW4uanMiLCJ3ZWJwYWNrOi8vZ3VuLXJlZGlzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2d1bi1yZWRpcy8uL3NyYy9yZWNlaXZlci5qcyIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvLi9zcmMvc2VyaWFsaXplLmpzIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcImZsYXRcIiIsIndlYnBhY2s6Ly9ndW4tcmVkaXMvZXh0ZXJuYWwgXCJyYW1kYVwiIiwid2VicGFjazovL2d1bi1yZWRpcy9leHRlcm5hbCBcInJlZGlzXCIiXSwibmFtZXMiOlsiR0VUX0JBVENIX1NJWkUiLCJQVVRfQkFUQ0hfU0laRSIsIm1ldGFSZSIsImVkZ2VSZSIsImNyZWF0ZUNsaWVudCIsIkd1biIsImNoYW5nZVN1YnNjcmliZXJzIiwiY29uZmlnIiwicmVkaXMiLCJub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyIsInNvdWwiLCJrZXkiLCJtYXAiLCJmbiIsIm9uQ2hhbmdlIiwicHVzaCIsIm9mZkNoYW5nZSIsIlIiLCJ3aXRob3V0IiwiZ2V0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJoZ2V0YWxsIiwiZXJyIiwicmVzIiwiY29uc29sZSIsImVycm9yIiwidW5kZWZpbmVkIiwicmVhZCIsInRoZW4iLCJyYXdEYXRhIiwiZGF0YSIsIlNFQSIsImluZGV4T2YiLCJrZXlzIiwiZm9yRWFjaCIsInZlcmlmeSIsIm9wdCIsInBhY2siLCJ1bnBhY2siLCJyZWFkS2V5QmF0Y2giLCJiYXRjaCIsIm9rIiwiZmFpbCIsImJhdGNoTWV0YSIsInJlcGxhY2UiLCJobWdldCIsIm1ldGEiLCJzdGFjayIsIm9iaiIsInZhbCIsImlkeCIsImJhdGNoZWRHZXQiLCJjYiIsImhrZXlzIiwibm9kZUtleXMiLCJsZW5ndGgiLCJsb2ciLCJhdHRyS2V5cyIsImZpbHRlciIsIm1hdGNoIiwicmVhZEJhdGNoIiwic3BsaWNlIiwicmVzdWx0IiwicmVhZE5leHRCYXRjaCIsImRvbmUiLCJjYXRjaCIsIndyaXRlIiwicHV0IiwiYWxsIiwibm9kZSIsInBhdGgiLCJ3cml0ZU5leHRCYXRjaCIsInVwZGF0ZWQiLCJfIiwicGljayIsImV4aXN0aW5nIiwibW9kaWZpZWRLZXlzIiwidXBkYXRlZFZhbCIsInByb3AiLCJleGlzdGluZ1ZhbCIsInVwZGF0ZWRTb3VsIiwiZXhpc3RpbmdTb3VsIiwicGFyc2VGbG9hdCIsImRpZmYiLCJhc3NvYyIsImhtc2V0IiwiYXR0YWNoVG9HdW4iLCJvbiIsImRiIiwidG8iLCJuZXh0IiwicmVxdWVzdCIsImRlZHVwSWQiLCJyZWNlaXZlciIsInJlY2VpdmVyRm5zIiwicmVzcG9uZFRvR2V0cyIsInNraXBWYWxpZGF0aW9uIiwib25JbiIsIm1zZyIsImZyb20iLCJqc29uIiwiZnJvbUNsdXN0ZXIiLCJtc2dJZCIsInNlbmQiLCJpZ25vcmVMZWVjaGluZyIsImFjY2VwdFdyaXRlcyIsImdldERpZmYiLCJzb3VscyIsImZsYXR0ZW4iLCJyZXF1aXJlIiwiRklFTERfU0laRV9MSU1JVCIsInBvc3RVbmZsYXR0ZW4iLCJhcnJvdyIsInZhbHVlIiwidmFsS2V5cyIsInJlbWFpbmRlciIsInJlYWxLZXkiLCJqb2luIiwicmVhbFZhbHVlIiwiZnJvbVJlZGlzIiwic29ydGVkIiwidGVzdCIsInNsaWNlIiwidW5mbGF0dGVuIiwiT2JqZWN0Iiwic29ydCIsInRvUmVkaXMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0FBSCxLQUFXLEdBQWYsRUFBb0IsT0FBT3VDLEdBQUcsQ0FBQ3ZDLEdBQUQsQ0FBVjtBQUNyQixHQVpEO0FBYUEsU0FBT3VDLEdBQVA7QUFDRCxDOzs7Ozs7Ozs7OztBQ3BGRCxrRDs7Ozs7Ozs7Ozs7QUNBQSxtRDs7Ozs7Ozs7Ozs7QUNBQSxtRCIsImZpbGUiOiJndW4tcmVkaXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJmbGF0XCIpLCByZXF1aXJlKFwicmFtZGFcIiksIHJlcXVpcmUoXCJyZWRpc1wiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcImd1bi1yZWRpc1wiLCBbXCJmbGF0XCIsIFwicmFtZGFcIiwgXCJyZWRpc1wiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJndW4tcmVkaXNcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJmbGF0XCIpLCByZXF1aXJlKFwicmFtZGFcIiksIHJlcXVpcmUoXCJyZWRpc1wiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wiZ3VuLXJlZGlzXCJdID0gZmFjdG9yeShyb290W1wiZmxhdFwiXSwgcm9vdFtcInJhbWRhXCJdLCByb290W1wicmVkaXNcIl0pO1xufSkodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24oX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9mbGF0X18sIF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfcmFtZGFfXywgX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yZWRpc19fKSB7XG5yZXR1cm4gIiwiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJpbXBvcnQgKiBhcyBSIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IGFzIGNyZWF0ZVJlZGlzQ2xpZW50IH0gZnJvbSBcInJlZGlzXCI7XG5pbXBvcnQgeyB0b1JlZGlzLCBmcm9tUmVkaXMgfSBmcm9tIFwiLi9zZXJpYWxpemVcIjtcblxuY29uc3QgR0VUX0JBVENIX1NJWkUgPSAxMDAwMDtcbmNvbnN0IFBVVF9CQVRDSF9TSVpFID0gMTAwMDA7XG5cbmNvbnN0IG1ldGFSZSA9IC9eX1xcLi4qLztcbmNvbnN0IGVkZ2VSZSA9IC8oXFwuIyQpLztcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNsaWVudCA9IChHdW4sIC4uLmNvbmZpZykgPT4ge1xuICBsZXQgY2hhbmdlU3Vic2NyaWJlcnMgPSBbXTtcbiAgY29uc3QgcmVkaXMgPSBjcmVhdGVSZWRpc0NsaWVudCguLi5jb25maWcpO1xuICBjb25zdCBub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyA9IChzb3VsLCBrZXkpID0+XG4gICAgY2hhbmdlU3Vic2NyaWJlcnMubWFwKGZuID0+IGZuKHNvdWwsIGtleSkpO1xuICBjb25zdCBvbkNoYW5nZSA9IGZuID0+IGNoYW5nZVN1YnNjcmliZXJzLnB1c2goZm4pO1xuICBjb25zdCBvZmZDaGFuZ2UgPSBmbiA9PlxuICAgIChjaGFuZ2VTdWJzY3JpYmVycyA9IFIud2l0aG91dChbZm5dLCBjaGFuZ2VTdWJzY3JpYmVycykpO1xuXG4gIGNvbnN0IGdldCA9IHNvdWwgPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIXNvdWwpIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgcmVkaXMuaGdldGFsbChzb3VsLCBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcImdldCBlcnJvclwiLCBlcnIpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZnJvbVJlZGlzKHJlcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSk7XG5cbiAgY29uc3QgcmVhZCA9IHNvdWwgPT5cbiAgICBnZXQoc291bCkudGhlbihyYXdEYXRhID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSByYXdEYXRhID8geyAuLi5yYXdEYXRhIH0gOiByYXdEYXRhO1xuXG4gICAgICBpZiAoIUd1bi5TRUEgfHwgc291bC5pbmRleE9mKFwiflwiKSA9PT0gLTEpIHJldHVybiByYXdEYXRhO1xuICAgICAgUi53aXRob3V0KFtcIl9cIl0sIFIua2V5cyhkYXRhKSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBHdW4uU0VBLnZlcmlmeShcbiAgICAgICAgICBHdW4uU0VBLm9wdC5wYWNrKHJhd0RhdGFba2V5XSwga2V5LCByYXdEYXRhLCBzb3VsKSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICByZXMgPT4gKGRhdGFba2V5XSA9IEd1bi5TRUEub3B0LnVucGFjayhyZXMsIGtleSwgcmF3RGF0YSkpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xuXG4gIGNvbnN0IHJlYWRLZXlCYXRjaCA9IChzb3VsLCBiYXRjaCkgPT5cbiAgICBuZXcgUHJvbWlzZSgob2ssIGZhaWwpID0+IHtcbiAgICAgIGNvbnN0IGJhdGNoTWV0YSA9IGJhdGNoLm1hcChrZXkgPT4gYF8uPi4ke2tleX1gLnJlcGxhY2UoZWRnZVJlLCBcIlwiKSk7XG5cbiAgICAgIHJldHVybiByZWRpcy5obWdldChzb3VsLCBiYXRjaE1ldGEsIChlcnIsIG1ldGEpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKFwiaG1nZXQgZXJyXCIsIGVyci5zdGFjayB8fCBlcnIpIHx8IGZhaWwoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYmogPSB7XG4gICAgICAgICAgXCJfLiNcIjogc291bFxuICAgICAgICB9O1xuXG4gICAgICAgIG1ldGEuZm9yRWFjaCgodmFsLCBpZHgpID0+IChvYmpbYmF0Y2hNZXRhW2lkeF1dID0gdmFsKSk7XG4gICAgICAgIHJldHVybiByZWRpcy5obWdldChzb3VsLCBiYXRjaCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJobWdldCBlcnJcIiwgZXJyLnN0YWNrIHx8IGVycikgfHwgZmFpbChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMuZm9yRWFjaCgodmFsLCBpZHgpID0+IChvYmpbYmF0Y2hbaWR4XV0gPSB2YWwpKTtcbiAgICAgICAgICByZXR1cm4gb2soZnJvbVJlZGlzKG9iaikpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIGNvbnN0IGJhdGNoZWRHZXQgPSAoc291bCwgY2IpID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmVkaXMuaGtleXMoc291bCwgKGVyciwgbm9kZUtleXMpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvclwiLCBlcnIuc3RhY2sgfHwgZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGVLZXlzLmxlbmd0aCA8PSBHRVRfQkFUQ0hfU0laRSkge1xuICAgICAgICAgIHJldHVybiBnZXQoc291bCkudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgY2IocmVzKTtcbiAgICAgICAgICAgIHJlc29sdmUocmVzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcImdldCBiaWcgc291bFwiLCBzb3VsLCBub2RlS2V5cy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBhdHRyS2V5cyA9IG5vZGVLZXlzLmZpbHRlcihrZXkgPT4gIWtleS5tYXRjaChtZXRhUmUpKTtcbiAgICAgICAgY29uc3QgcmVhZEJhdGNoID0gKCkgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgob2ssIGZhaWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJhdGNoID0gYXR0cktleXMuc3BsaWNlKDAsIEdFVF9CQVRDSF9TSVpFKTtcblxuICAgICAgICAgICAgaWYgKCFiYXRjaC5sZW5ndGgpIHJldHVybiBvayh0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlYWRLZXlCYXRjaChzb3VsLCBiYXRjaCkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICBjYihyZXN1bHQpO1xuICAgICAgICAgICAgICByZXR1cm4gb2soKTtcbiAgICAgICAgICAgIH0sIGZhaWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWFkTmV4dEJhdGNoID0gKCkgPT5cbiAgICAgICAgICByZWFkQmF0Y2goKS50aGVuKGRvbmUgPT4gIWRvbmUgJiYgcmVhZE5leHRCYXRjaCk7XG5cbiAgICAgICAgcmV0dXJuIHJlYWROZXh0QmF0Y2goKVxuICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIGNvbnN0IHdyaXRlID0gcHV0ID0+XG4gICAgUHJvbWlzZS5hbGwoXG4gICAgICBSLmtleXMocHV0KS5tYXAoXG4gICAgICAgIHNvdWwgPT5cbiAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gcHV0W3NvdWxdO1xuICAgICAgICAgICAgY29uc3QgbWV0YSA9IFIucGF0aChbXCJfXCIsIFwiPlwiXSwgbm9kZSkgfHwge307XG4gICAgICAgICAgICBjb25zdCBub2RlS2V5cyA9IFIua2V5cyhtZXRhKTtcbiAgICAgICAgICAgIGNvbnN0IHdyaXRlTmV4dEJhdGNoID0gKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBiYXRjaCA9IG5vZGVLZXlzLnNwbGljZSgwLCBQVVRfQkFUQ0hfU0laRSk7XG5cbiAgICAgICAgICAgICAgaWYgKCFiYXRjaC5sZW5ndGgpIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSB7XG4gICAgICAgICAgICAgICAgXzoge1xuICAgICAgICAgICAgICAgICAgXCIjXCI6IHNvdWwsXG4gICAgICAgICAgICAgICAgICBcIj5cIjogUi5waWNrKGJhdGNoLCBtZXRhKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLi4uUi5waWNrKGJhdGNoLCBub2RlKVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIC8vIHJldHVybiByZWFkS2V5QmF0Y2goc291bCwgYmF0Y2gpLnRoZW4oZXhpc3RpbmcgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gZ2V0KHNvdWwpLnRoZW4oZXhpc3RpbmcgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVkS2V5cyA9IGJhdGNoLmZpbHRlcihrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFZhbCA9IFIucHJvcChrZXksIHVwZGF0ZWQpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdWYWwgPSBSLnByb3Aoa2V5LCBleGlzdGluZyk7XG5cbiAgICAgICAgICAgICAgICAgIGlmICh1cGRhdGVkVmFsID09PSBleGlzdGluZ1ZhbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFNvdWwgPSBSLnBhdGgoW2tleSwgXCIjXCJdLCB1cGRhdGVkKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nU291bCA9IFIucGF0aChba2V5LCBcIiNcIl0sIGV4aXN0aW5nKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAodXBkYXRlZFNvdWwgfHwgZXhpc3RpbmdTb3VsKSAmJlxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkU291bCA9PT0gZXhpc3RpbmdTb3VsXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdXBkYXRlZFZhbCA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KGV4aXN0aW5nVmFsKSA9PT0gdXBkYXRlZFZhbFxuICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIW1vZGlmaWVkS2V5cy5sZW5ndGgpIHJldHVybiB3cml0ZU5leHRCYXRjaCgpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlmZiA9IHtcbiAgICAgICAgICAgICAgICAgIF86IFIuYXNzb2MoXCI+XCIsIFIucGljayhtb2RpZmllZEtleXMsIG1ldGEpLCB1cGRhdGVkLl8pLFxuICAgICAgICAgICAgICAgICAgLi4uUi5waWNrKG1vZGlmaWVkS2V5cywgdXBkYXRlZClcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZGlzLmhtc2V0KHNvdWwsIHRvUmVkaXMoZGlmZiksIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICBlcnIgPyByZWplY3QoZXJyKSA6IHdyaXRlTmV4dEJhdGNoKCk7XG4gICAgICAgICAgICAgICAgICBub3RpZnlDaGFuZ2VTdWJzY3JpYmVycyhzb3VsLCBkaWZmKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gd3JpdGVOZXh0QmF0Y2goKTtcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG5cbiAgb25DaGFuZ2UoKHNvdWwsIGRpZmYpID0+IGNvbnNvbGUubG9nKFwibW9kaWZ5XCIsIHNvdWwsIFIua2V5cyhkaWZmKSkpO1xuXG4gIHJldHVybiB7IGdldCwgcmVhZCwgYmF0Y2hlZEdldCwgd3JpdGUsIG9uQ2hhbmdlLCBvZmZDaGFuZ2UgfTtcbn07XG4iLCJpbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiLi9jbGllbnRcIjtcblxuZXhwb3J0IGNvbnN0IGF0dGFjaFRvR3VuID0gR3VuID0+IEd1bi5vbihcImNyZWF0ZVwiLCBmdW5jdGlvbihkYikge1xuICB0aGlzLnRvLm5leHQoZGIpO1xuICBjb25zdCByZWRpcyA9IEd1bi5yZWRpcyA9IGRiLnJlZGlzID0gY3JlYXRlQ2xpZW50KEd1bik7XG5cbiAgZGIub24oXCJnZXRcIiwgZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHRoaXMudG8ubmV4dChyZXF1ZXN0KTtcbiAgICBjb25zdCBkZWR1cElkID0gcmVxdWVzdFtcIiNcIl07XG4gICAgY29uc3QgZ2V0ID0gcmVxdWVzdC5nZXQ7XG4gICAgY29uc3Qgc291bCA9IGdldFtcIiNcIl07XG5cbiAgICByZWRpcy5iYXRjaGVkR2V0KHNvdWwsIHJlc3VsdCA9PiBkYi5vbihcImluXCIsIHtcbiAgICAgIFwiQFwiOiBkZWR1cElkLFxuICAgICAgcHV0OiByZXN1bHQgPyB7IFtzb3VsXTogcmVzdWx0IH0gOiBudWxsLFxuICAgICAgZXJyOiBudWxsXG4gICAgfSkpLmNhdGNoKGVyciA9PlxuICAgICAgY29uc29sZS5lcnJvcihcImVycm9yXCIsIGVyci5zdGFjayB8fCBlcnIpIHx8XG4gICAgICBkYi5vbihcImluXCIsIHtcbiAgICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICAgIHB1dDogbnVsbCxcbiAgICAgICAgZXJyXG4gICAgICB9KVxuICAgICk7XG4gIH0pO1xuXG4gIGRiLm9uKFwicHV0XCIsIGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICB0aGlzLnRvLm5leHQocmVxdWVzdCk7XG4gICAgY29uc3QgZGVkdXBJZCA9IHJlcXVlc3RbXCIjXCJdO1xuXG4gICAgcmVkaXMud3JpdGUocmVxdWVzdC5wdXQpXG4gICAgICAudGhlbigoKSA9PlxuICAgICAgICBkYi5vbihcImluXCIsIHtcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgICBlcnI6IG51bGxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC5jYXRjaChlcnIgPT5cbiAgICAgICAgZGIub24oXCJpblwiLCB7XG4gICAgICAgICAgXCJAXCI6IGRlZHVwSWQsXG4gICAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICAgIGVycjogZXJyXG4gICAgICAgIH0pXG4gICAgICApO1xuICB9KTtcbn0pO1xuIiwiaW1wb3J0ICogYXMgcmVjZWl2ZXJGbnMgZnJvbSBcIi4vcmVjZWl2ZXJcIjtcbmV4cG9ydCB7IGF0dGFjaFRvR3VuIH0gZnJvbSBcIi4vZ3VuXCI7XG5cbmV4cG9ydCBjb25zdCByZWNlaXZlciA9IHJlY2VpdmVyRm5zO1xuIiwiaW1wb3J0ICogYXMgUiBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCIuL2NsaWVudFwiO1xuXG5leHBvcnQgY29uc3QgcmVzcG9uZFRvR2V0cyA9IChHdW4sIHsgc2tpcFZhbGlkYXRpb24gPSB0cnVlIH0gPSB7fSkgPT4gZGIgPT4ge1xuICBjb25zdCByZWRpcyA9IChHdW4ucmVkaXMgPSBHdW4ucmVkaXMgfHwgY3JlYXRlQ2xpZW50KEd1bikpO1xuXG4gIGRiLm9uSW4obXNnID0+IHtcbiAgICBjb25zdCB7IGZyb20sIGpzb24sIGZyb21DbHVzdGVyIH0gPSBtc2c7XG4gICAgY29uc3Qgc291bCA9IFIucGF0aChbXCJnZXRcIiwgXCIjXCJdLCBqc29uKTtcbiAgICBjb25zdCBkZWR1cElkID0gUi5wcm9wKFwiI1wiLCBqc29uKTtcblxuICAgIGlmICghc291bCB8fCBmcm9tQ2x1c3RlcikgcmV0dXJuIG1zZztcbiAgICByZXR1cm4gcmVkaXNcbiAgICAgIC5iYXRjaGVkR2V0KHNvdWwsIHJlc3VsdCA9PiB7XG4gICAgICAgIGNvbnN0IGpzb24gPSB7XG4gICAgICAgICAgXCIjXCI6IGZyb20ubXNnSWQoKSxcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBwdXQ6IHJlc3VsdCA/IHsgW3NvdWxdOiByZXN1bHQgfSA6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICBmcm9tLnNlbmQoe1xuICAgICAgICAgIGpzb24sXG4gICAgICAgICAgaWdub3JlTGVlY2hpbmc6IHRydWUsXG4gICAgICAgICAgc2tpcFZhbGlkYXRpb246ICFyZXN1bHQgfHwgc2tpcFZhbGlkYXRpb25cbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnN0IGpzb24gPSB7XG4gICAgICAgICAgXCIjXCI6IGZyb20ubXNnSWQoKSxcbiAgICAgICAgICBcIkBcIjogZGVkdXBJZCxcbiAgICAgICAgICBlcnI6IGAke2Vycn1gXG4gICAgICAgIH07XG5cbiAgICAgICAgZnJvbS5zZW5kKHsganNvbiwgaWdub3JlTGVlY2hpbmc6IHRydWUsIHNraXBWYWxpZGF0aW9uIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IG1zZyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYjtcbn07XG5cbmV4cG9ydCBjb25zdCBhY2NlcHRXcml0ZXMgPSBHdW4gPT4gZGIgPT4ge1xuICBjb25zdCByZWRpcyA9IChHdW4ucmVkaXMgPSBHdW4ucmVkaXMgfHwgY3JlYXRlQ2xpZW50KEd1bikpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgZGIub25Jbihtc2cgPT4ge1xuICAgIGlmIChtc2cuZnJvbUNsdXN0ZXIpIHJldHVybiBtc2c7XG4gICAgaWYgKG1zZy5qc29uLnB1dCkge1xuICAgICAgcmV0dXJuIGRiXG4gICAgICAgIC5nZXREaWZmKG1zZy5qc29uLnB1dClcbiAgICAgICAgLnRoZW4oZGlmZiA9PiB7XG4gICAgICAgICAgY29uc3Qgc291bHMgPSBSLmtleXMoZGlmZik7XG5cbiAgICAgICAgICBpZiAoIXNvdWxzLmxlbmd0aCkgcmV0dXJuIG1zZztcbiAgICAgICAgICAvLyByZXR1cm4gY29uc29sZS5sb2coXCJ3b3VsZCB3cml0ZVwiLCBkaWZmKSB8fCBtc2c7XG4gICAgICAgICAgcmV0dXJuIHJlZGlzXG4gICAgICAgICAgICAud3JpdGUoZGlmZilcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QganNvbiA9IHsgXCJAXCI6IG1zZy5qc29uW1wiI1wiXSwgb2s6IHRydWUsIGVycjogbnVsbCB9O1xuXG4gICAgICAgICAgICAgIG1zZy5mcm9tICYmXG4gICAgICAgICAgICAgICAgbXNnLmZyb20uc2VuZCAmJlxuICAgICAgICAgICAgICAgIG1zZy5mcm9tLnNlbmQoe1xuICAgICAgICAgICAgICAgICAganNvbixcbiAgICAgICAgICAgICAgICAgIGlnbm9yZUxlZWNoaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgc2tpcFZhbGlkYXRpb246IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgY29uc3QganNvbiA9IHsgXCJAXCI6IG1zZy5qc29uW1wiI1wiXSwgb2s6IGZhbHNlLCBlcnI6IGAke2Vycn1gIH07XG5cbiAgICAgICAgICAgICAgbXNnLmZyb20gJiZcbiAgICAgICAgICAgICAgICBtc2cuZnJvbS5zZW5kICYmXG4gICAgICAgICAgICAgICAgbXNnLmZyb20uc2VuZCh7XG4gICAgICAgICAgICAgICAgICBqc29uLFxuICAgICAgICAgICAgICAgICAgaWdub3JlTGVlY2hpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgICBza2lwVmFsaWRhdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gbXNnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnIgPT5cbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3IgYWNjZXB0aW5nIHdyaXRlc1wiLCBlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbXNnO1xuICB9KTtcblxuICByZXR1cm4gZGI7XG59O1xuIiwiaW1wb3J0IHsga2V5cyB9IGZyb20gXCJyYW1kYVwiO1xuY29uc3QgZmxhdHRlbiA9IHJlcXVpcmUoXCJmbGF0XCIpO1xuXG5jb25zdCBGSUVMRF9TSVpFX0xJTUlUID0gMTAwMDAwO1xuXG5mdW5jdGlvbiBwb3N0VW5mbGF0dGVuKG9iaikge1xuICAvLyBUaGlzIGlzIHByb2JhYmx5IG9ubHkgbmVjZXNzYXJ5IGlmIHlvdSBhcmUgc3R1cGlkIGxpa2UgbWUgYW5kIHVzZSB0aGUgZGVmYXVsdCAuIGRlbGltaXRlciBmb3IgZmxhdHRlblxuICBpZiAoIW9iaikgcmV0dXJuIG9iajtcbiAgbGV0IGFycm93ID0gKG9iai5fICYmIG9iai5fW1wiPlwiXSkgfHwge307XG5cbiAga2V5cyhhcnJvdykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBsZXQgdmFsdWUgPSBhcnJvd1trZXldO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IHZhbEtleXMgPSBrZXlzKHZhbHVlKTtcbiAgICAgIGxldCByZW1haW5kZXIgPSB2YWxLZXlzWzBdO1xuXG4gICAgICBpZiAocmVtYWluZGVyKSB7XG4gICAgICAgIGxldCByZWFsS2V5ID0gW2tleSwgdmFsS2V5c10uam9pbihcIi5cIik7XG4gICAgICAgIGxldCByZWFsVmFsdWUgPSB2YWx1ZVtyZW1haW5kZXJdO1xuXG4gICAgICAgIGRlbGV0ZSBhcnJvd1trZXldO1xuICAgICAgICBhcnJvd1tyZWFsS2V5XSA9IHJlYWxWYWx1ZTtcbiAgICAgICAgcmVhbFZhbHVlID0gKG9ialtrZXldICYmIG9ialtrZXldW3JlbWFpbmRlcl0pIHx8IG51bGw7XG4gICAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICAgICAgb2JqW3JlYWxLZXldID0gcmVhbFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKGtleVswXSA9PT0gXCIuXCIpIGRlbGV0ZSBba2V5XTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUmVkaXMob2JqKSB7XG4gIGlmICghb2JqKSByZXR1cm4gb2JqO1xuICBjb25zdCBzb3J0ZWQgPSB7fTtcblxuICBrZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoa2V5WzBdID09PSBcIi5cIikgZGVsZXRlIG9ialtrZXldO1xuXG4gICAgaWYgKG9ialtrZXldID09PSBcInxOVUxMfFwiKSB7XG4gICAgICBvYmpba2V5XSA9IG51bGw7XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSA9PT0gXCJ8VU5ERUZJTkVEfFwiKSB7XG4gICAgICBvYmpba2V5XSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoLz5cXC4vLnRlc3Qoa2V5KSkge1xuICAgICAgb2JqW2tleV0gPSBwYXJzZUZsb2F0KG9ialtrZXldLCAxMCkgfHwgb2JqW2tleV07XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSAmJiBvYmpba2V5XS5sZW5ndGggPiBGSUVMRF9TSVpFX0xJTUlUKSB7XG4gICAgICBvYmpba2V5XSA9IG9ialtrZXldLnNsaWNlKDAsIEZJRUxEX1NJWkVfTElNSVQpO1xuICAgICAgY29uc29sZS5sb2coXCJ0cnVuY2F0ZWRcIiwga2V5KTtcbiAgICB9XG4gIH0pO1xuXG4gIG9iaiA9IHBvc3RVbmZsYXR0ZW4oZmxhdHRlbi51bmZsYXR0ZW4ob2JqKSk7XG5cbiAgT2JqZWN0LmtleXMob2JqKVxuICAgIC5zb3J0KClcbiAgICAuZm9yRWFjaChrZXkgPT4gKHNvcnRlZFtrZXldID0gb2JqW2tleV0pKTtcblxuICByZXR1cm4gc29ydGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9SZWRpcyhvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIG9iaiA9IGZsYXR0ZW4ob2JqKTtcbiAga2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKG9ialtrZXldID09PSBudWxsKSB7XG4gICAgICBvYmpba2V5XSA9IFwifE5VTEx8XCI7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgb2JqW2tleV0gPSBcInxVTkRFRklORUR8XCI7XG4gICAgfVxuICAgIGlmIChvYmpba2V5XSAmJiBvYmpba2V5XS5sZW5ndGggPiBGSUVMRF9TSVpFX0xJTUlUKSB7XG4gICAgICBvYmpba2V5XSA9IG9ialtrZXldLnNsaWNlKDAsIEZJRUxEX1NJWkVfTElNSVQpO1xuICAgICAgY29uc29sZS5sb2coXCJ0cnVuY2F0ZWQgaW5wdXRcIiwga2V5KTtcbiAgICB9XG4gICAgaWYgKGtleVswXSA9PT0gXCIuXCIpIGRlbGV0ZSBvYmpba2V5XTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfZmxhdF9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yYW1kYV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9yZWRpc19fOyJdLCJzb3VyY2VSb290IjoiIn0=