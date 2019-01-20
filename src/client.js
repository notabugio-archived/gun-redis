import { without, keys, path, pick } from "ramda";
import { createClient as createRedisClient } from "redis";
import { toRedis, fromRedis } from "./serialize";

const GET_BATCH_SIZE = 10000;
const PUT_BATCH_SIZE = 10000;

const metaRe = /^_\..*/;
const edgeRe = /(\.#$)/;

export const createClient = (Gun, ...config) => {
  const redis = createRedisClient(...config);

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
      without(["_"], keys(data)).forEach(key => {
        Gun.SEA.verify(
          Gun.SEA.opt.pack(rawData[key], key, rawData, soul),
          false,
          res => (data[key] = Gun.SEA.opt.unpack(res, key, rawData))
        );
      });
      return data;
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
            const batchMeta = batch.map(key =>
              `_.>.${key}`.replace(edgeRe, "")
            );

            return redis.hmget(soul, batchMeta, (err, meta) => {
              if (err) {
                return (
                  console.error("hmget err", err.stack || err) || fail(err)
                );
              }
              const obj = {
                "_.#": soul
              };

              meta.forEach((val, idx) => (obj[batchMeta[idx]] = val));
              return redis.hmget(soul, batch, (err, res) => {
                if (err) {
                  return (
                    console.error("hmget err", err.stack || err) || fail(err)
                  );
                }
                res.forEach((val, idx) => (obj[batch[idx]] = val));
                const result = fromRedis(obj);

                cb(result);
                return ok();
              });
            });
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
      keys(put).map(
        soul =>
          new Promise((resolve, reject) => {
            const node = put[soul];
            const meta = path(["_", ">"], node) || {};
            const nodeKeys = keys(meta);
            const writeNextBatch = () => {
              const batch = nodeKeys.splice(0, PUT_BATCH_SIZE);

              if (!batch.length) return resolve();
              const updates = toRedis({
                _: {
                  "#": soul,
                  ">": pick(batch, meta)
                },
                ...pick(batch, node)
              });

              return redis.hmset(soul, toRedis(updates), err =>
                err ? reject(err) : writeNextBatch()
              );
            };

            return writeNextBatch();
          })
      )
    );

  return { get, read, batchedGet, write };
};
