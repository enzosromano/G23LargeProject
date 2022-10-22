const app = require("./app");
const port = 3000;
const color = require("chalk");

app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
