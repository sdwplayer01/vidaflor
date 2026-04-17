const { JSDOM } = require("jsdom");
const fs = require("fs");

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`, {
  runScripts: "dangerously",
  url: "http://localhost/"
});

const file = fs.readdirSync("./dist/assets").find(f => f.endsWith(".js"));
const code = fs.readFileSync("./dist/assets/" + file, "utf8");

try {
  dom.window.eval(code);
  console.log("No unhandled ReferenceError during execution.");
} catch (err) {
  console.error("Caught error:", err);
}
