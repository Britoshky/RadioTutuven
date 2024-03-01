const app = require("./config/express");

async function main() {
  app.listen(3001);
  console.log("Server on port", 3001);
}

main();
