require("dotenv").config();   // ← IMPORTANTE
require("./database/database");  // ← CONECTA MONGODB

const server = require("./config/express");

async function main() {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log("Servidor en ejecución en el puerto", PORT);
  });
}

main();
