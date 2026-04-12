const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable, Writable } = require("node:stream");

const app = require("../app");

function createRequest(method, url, body) {
  const payload = body ? JSON.stringify(body) : "";
  const req = Readable.from(payload ? [payload] : []);

  req.method = method;
  req.url = url;
  req.headers = payload
    ? {
        "content-type": "application/json",
        "content-length": String(Buffer.byteLength(payload)),
      }
    : {};
  req.connection = {};
  req.socket = {};

  return req;
}

function createResponse(resolve) {
  const chunks = [];
  const headers = {};
  const res = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      callback();
    },
  });

  res.statusCode = 200;
  res.headersSent = false;
  res.setHeader = (name, value) => {
    headers[String(name).toLowerCase()] = value;
  };
  res.getHeader = (name) => headers[String(name).toLowerCase()];
  res.removeHeader = (name) => {
    delete headers[String(name).toLowerCase()];
  };
  res.writeHead = (statusCode, nextHeaders = {}) => {
    res.statusCode = statusCode;
    Object.entries(nextHeaders).forEach(([name, value]) => {
      res.setHeader(name, value);
    });
    res.headersSent = true;
    return res;
  };
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = (payload) => {
    if (!res.getHeader("content-type")) {
      res.setHeader("content-type", "application/json; charset=utf-8");
    }
    res.end(JSON.stringify(payload));
    return res;
  };
  res.send = (payload) => {
    res.end(payload);
    return res;
  };
  res.end = ((originalEnd) => (chunk, encoding, callback) => {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }
    res.finished = true;
    originalEnd.call(res, null, null, callback);
    resolve({
      status: res.statusCode,
      headers,
      text: Buffer.concat(chunks).toString("utf8"),
    });
  })(res.end);

  return res;
}

async function performRequest(method, url, body) {
  return new Promise((resolve, reject) => {
    const req = createRequest(method, url, body);
    const res = createResponse(resolve);

    app.handle(req, res, reject);
  });
}

test("GET /api/health returns ok", async () => {
  const response = await performRequest("GET", "/api/health");
  const payload = JSON.parse(response.text);

  assert.equal(response.status, 200);
  assert.deepEqual(payload, { ok: true });
});

test("GET /api/machines/:id rejects malformed ids", async () => {
  const response = await performRequest("GET", "/api/machines/not-a-valid-id");
  const payload = JSON.parse(response.text);

  assert.equal(response.status, 400);
  assert.equal(payload.message, "Invalid machine id");
});

test("PUT /api/machines/:id rejects malformed ids", async () => {
  const response = await performRequest("PUT", "/api/machines/not-a-valid-id", {});
  const payload = JSON.parse(response.text);

  assert.equal(response.status, 400);
  assert.equal(payload.message, "Invalid machine id");
});

test("DELETE /api/machines/:id rejects malformed ids", async () => {
  const response = await performRequest("DELETE", "/api/machines/not-a-valid-id");
  const payload = JSON.parse(response.text);

  assert.equal(response.status, 400);
  assert.equal(payload.message, "Invalid machine id");
});

test("POST /api/machines validates required fields before database access", async () => {
  const response = await performRequest("POST", "/api/machines", {});
  const payload = JSON.parse(response.text);

  assert.equal(response.status, 400);
  assert.equal(
    payload.message,
    "powerId, tableType, machineType and model are required"
  );
});
