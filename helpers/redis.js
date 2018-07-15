const redis = require("redis");
const tracer = require('../common/tracer')({});

const client = redis.createClient({
  port: process.env.REDIS_BRAIN_SVC_SERVICE_PORT,
  host: process.env.REDIS_BRAIN_SVC_SERVICE_HOST
});

client.on("error", (err) => {
  tracer.trackException(`Error ${err}`);
});

exports.get = (key) => new Promise((resolve, reject) => {
  client.get(key, (error, result) => {
    if (error) {
      reject(error);
    }
    resolve(result);
  })
})

exports.set = (key, value, duration) => new Promise((resolve, reject) => {
  tracer.trackTrace(`set cache key:[${key}], duration: [${duration}], value: [${value}]`);

  client.set(key, JSON.stringify(value), 'EX', duration, (err, result) => {
    tracer.trackTrace(`set cache key:[${key}] result: [${result}], err: [${err}]`);
    if (err) {
      return reject(err);
    }
    return resolve(true);
  })
});
