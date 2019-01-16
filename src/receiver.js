import { path, prop } from "ramda";
import { createClient } from "./client";

export const respondToGets = Gun => db => {
  const redis = createClient(Gun);

  db.onIn(msg => {
    const { from, json } = msg;
    const soul = path(["get", "#"], json);
    const dedupId = prop("#", json);

    if (!soul) return msg;
    return redis
      .batchedGet(soul, result => {
        const json = {
          "#": from.msgId(),
          "@": dedupId,
          put: { [soul]: result || undefined }
        };

        from.send({ json, ignoreLeeching: true, skipValidation: !result });
      })
      .catch(err => {
        const json = {
          "#": from.msgId(),
          "@": dedupId,
          err: `${err}`
        };

        from.send({ json, ignoreLeeching: true, skipValidation: true });
      })
      .then(() => msg);
  });

  return db;
};
