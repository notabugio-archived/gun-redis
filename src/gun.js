import { createClient } from "./client";

export const attachToGun = Gun => Gun.on("create", function(db) {
  this.to.next(db);
  const redis = Gun.redis = db.redis = createClient(Gun);

  db.on("get", function(request) {
    this.to.next(request);
    const dedupId = request["#"];
    const get = request.get;
    const soul = get["#"];

    redis.batchedGet(soul, result => db.on("in", {
      "@": dedupId,
      put: result ? { [soul]: result } : null,
      err: null
    })).catch(err =>
      console.error("error", err.stack || err) ||
      db.on("in", {
        "@": dedupId,
        put: null,
        err
      })
    );
  });

  db.on("put", function(request) {
    this.to.next(request);
    const dedupId = request["#"];

    redis.write(request.put)
      .then(() =>
        db.on("in", {
          "@": dedupId,
          ok: true,
          err: null
        })
      )
      .catch(err =>
        db.on("in", {
          "@": dedupId,
          ok: false,
          err: err
        })
      );
  });
});
