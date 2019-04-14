import { keys } from "ramda";
const flatten = require("flat");

const FIELD_SIZE_LIMIT = 100000;

function postUnflatten(obj) {
  // This is probably only necessary if you are stupid like me and use the default . delimiter for flatten
  if (!obj) return obj;
  let arrow = (obj._ && obj._[">"]) || {};

  keys(arrow).forEach(function(key) {
    if (!(key in obj)) {
      delete arrow[key];

      return;
    }
    let value = arrow[key];

    if (typeof value === "object") {
      let valKeys = keys(value);
      let remainder = valKeys[0];

      if (remainder) {
        let realKey = [key, valKeys].join(".");
        let realValue = value[remainder];

        delete arrow[key];
        arrow[realKey] = realValue;
        realValue = (obj[key] && obj[key][remainder]) || null;
        delete obj[key];
        obj[realKey] = realValue;
      }
    }
  });
  keys(obj).forEach(key => {
    if (key[0] === ".") delete [key];
    if (key === "_") return;
    if (!(key in arrow)) {
      delete obj[key];
    }
  });
  return obj;
}

export function fromRedis(obj) {
  if (!obj) return obj;
  const sorted = {};

  keys(obj).forEach(function(key) {
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

  obj = postUnflatten(flatten.unflatten(obj, { object: true }));

  Object.keys(obj)
    .sort()
    .forEach(key => (sorted[key] = obj[key]));

  return sorted;
}

export function toRedis(obj) {
  if (!obj) return obj;

  obj = flatten(postUnflatten(obj));
  keys(obj).forEach(function(key) {
    if (obj[key] === null) {
      obj[key] = "|NULL|";
    }
    if (typeof obj[key] === undefined) {
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
