const next = require("next");
const http = require("http");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => handle(req, res)).listen(port, "0.0.0.0", () => {
    console.log("Ready on port", port);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
