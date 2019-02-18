import * as R from "ramda";
import { createClient as createRedisClient } from "redis";
import { toRedis, fromRedis } from "./serialize";

const GET_BATCH_SIZE = 10000;
const PUT_BATCH_SIZE = 10000;

const metaRe = /^_\..*/;
const edgeRe = /(\.#$)/;

export const createClient = (Gun, ...config) => {
  let changeSubscribers = [];
  const redis = createRedisClient(...config);
  const notifyChangeSubscribers = (soul, diff, original) =>
    changeSubscribers.map(fn => fn(soul, diff, original));
  const onChange = fn => changeSubscribers.push(fn);
  const offChange = fn =>
    (changeSubscribers = R.without([fn], changeSubscribers));

  const get = soul =>
    new Promise((resolve, reject) => {
      if (!soul) return resolve(null);
      redis.hgetall(soul, function(err, res) {
        if (err) {
          console.error("get error", err);
          reject(err);
        } else {
          resolve(fromRedis(res));
        }
      });
      return undefined;
    });

  const read = soul =>
    get(soul).then(rawData => {
      const data = rawData ? { ...rawData } : rawData;

      if (!Gun.SEA || soul.indexOf("~") === -1) return rawData;
      R.without(["_"], R.keys(data)).forEach(key => {
        Gun.SEA.verify(
          Gun.SEA.opt.pack(rawData[key], key, rawData, soul),
          false,
          res => (data[key] = Gun.SEA.opt.unpack(res, key, rawData))
        );
      });
      return data;
    });

  const readKeyBatch = (soul, batch) =>
    new Promise((ok, fail) => {
      const batchMeta = batch.map(key => `_.>.${key}`.replace(edgeRe, ""));

      return redis.hmget(soul, batchMeta, (err, meta) => {
        if (err) {
          return console.error("hmget err", err.stack || err) || fail(err);
        }
        const obj = {
          "_.#": soul
        };

        meta.forEach((val, idx) => (obj[batchMeta[idx]] = val));
        return redis.hmget(soul, batch, (err, res) => {
          if (err) {
            return console.error("hmget err", err.stack || err) || fail(err);
          }
          res.forEach((val, idx) => (obj[batch[idx]] = val));
          return ok(fromRedis(obj));
        });
      });
    });

  const batchedGet = (soul, cb) =>
    new Promise((resolve, reject) => {
      redis.hkeys(soul, (err, nodeKeys) => {
        if (err) {
          console.error("error", err.stack || err);
          return reject(err);
        }
        if (nodeKeys.length <= GET_BATCH_SIZE) {
          return get(soul).then(res => {
            cb(res);
            resolve(res);
          });
        }
        console.log("get big soul", soul, nodeKeys.length);
        const attrKeys = nodeKeys.filter(key => !key.match(metaRe));
        const readBatch = () =>
          new Promise((ok, fail) => {
            const batch = attrKeys.splice(0, GET_BATCH_SIZE);

            if (!batch.length) return ok(true);

            return readKeyBatch(soul, batch).then(result => {
              cb(result);
              return ok();
            }, fail);
          });
        const readNextBatch = () =>
          readBatch().then(done => !done && readNextBatch);

        return readNextBatch()
          .then(res => {
            resolve(res);
          })
          .catch(reject);
      });
    });

  const write = put =>
    Promise.all(
      R.keys(put).map(
        soul =>
          new Promise((resolve, reject) => {
            const node = put[soul];
            const meta = R.path(["_", ">"], node) || {};
            const nodeKeys = R.keys(meta);
            const writeNextBatch = () => {
              const batch = nodeKeys.splice(0, PUT_BATCH_SIZE);

              if (!batch.length) return resolve();
              const updated = {
                _: {
                  "#": soul,
                  ">": R.pick(batch, meta)
                },
                ...R.pick(batch, node)
              };

              // return readKeyBatch(soul, batch).then(existing => {
              return get(soul).then(existing => {
                const modifiedKeys = batch.filter(key => {
                  const updatedVal = R.prop(key, updated);
                  const existingVal = R.prop(key, existing);

                  if (updatedVal === existingVal) return false;
                  const updatedSoul = R.path([key, "#"], updated);
                  const existingSoul = R.path([key, "#"], existing);

                  if (
                    (updatedSoul || existingSoul) &&
                    updatedSoul === existingSoul
                  ) {
                    return false;
                  }
                  if (
                    typeof updatedVal === "number" &&
                    parseFloat(existingVal) === updatedVal
                  ) {
                    return false;
                  }

                  return true;
                });

                if (!modifiedKeys.length) return writeNextBatch();

                const diff = {
                  _: R.assoc(">", R.pick(modifiedKeys, meta), updated._),
                  ...R.pick(modifiedKeys, updated)
                };

                return redis.hmset(soul, toRedis(diff), err => {
                  err ? reject(err) : writeNextBatch();
                  notifyChangeSubscribers(soul, diff, existing);
                });
              });
            };

            return writeNextBatch();
          })
      )
    );

  onChange((soul, diff) => console.log("modify", soul, R.keys(diff)));

  return { get, read, batchedGet, write, onChange, offChange };
};
