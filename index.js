const Express = require("express");
const { dbconnect } = require("./DB");
const { Auth } = require("./controllers/User.controller");
require("dotenv").config();
const cors = require("cors");
const { Dashboard } = require("./controllers/Dashboard.controller");

const go_rental = Express();
go_rental.use("/images", Express.static("images"));
go_rental.use(cors());
go_rental.use(Express.json());
go_rental.use("/auth", Auth);
go_rental.use("/dashboard", Dashboard);

dbconnect();

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || "localhost";

go_rental.listen(PORT, HOSTNAME, () => {
  console.log(`Server Started At http://${HOSTNAME}:${PORT}`);
});
