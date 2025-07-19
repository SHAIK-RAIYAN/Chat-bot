const express = require("express");
const path = require("path");
const app = express();

let port = 3000;
app.listen(port, () => {
  console.log(`listening on port : port 3000 `);
  console.log("http://localhost:3000/");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.redirect("/chat"));
app.get("/chat", (req, res) => res.render("home"));

app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});