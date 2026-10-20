import http from "node:http";
import fs from "node:fs";

const OUT = "C:/Users/CH.Hemanth/AppData/Local/Temp/kpx_shots";

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const { name, data } = JSON.parse(body);
        const b64 = String(data).replace(/^data:image\/png;base64,/, "");
        const file = `${OUT}/${name}.png`;
        fs.writeFileSync(file, Buffer.from(b64, "base64"));
        console.log("saved", file, fs.statSync(file).size);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, file }));
      } catch (e) {
        console.log("err", e.message);
        res.writeHead(500);
        res.end("{}");
      }
    });
  })
  .listen(5199, "127.0.0.1", () => console.log("shot sink on 5199"));
