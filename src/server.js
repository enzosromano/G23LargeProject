const app = require("./app");
const port = 4000;
const color = require("chalk");

app.listen(port, () =>
  console.log(`The server is listening on port ${color.green(port)}`)
);
