const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { log } = require("../../logging.js");

// public routes, no auth required

module.exports = (app) => {
  app.get("/setup", async (req, res) => {
    try {
      const users = await User.getAll();

      if (!users || users.length < 1) {
        // create first user
        const username = process.env.ADMIN_USERNAME || "admin";
        const password = process.env.ADMIN_PASSWORD || "admin";

        const passwordHash = await bcrypt.hash(password, 8);

        const user = new User({
          Name: username,
          passwordhash: passwordHash,
          Role: "admin",
          Organization: 0,
          Providers: "",
          Session: 1,
        });

        const newUser = await User.create(user);

        if (newUser) {
          return res.status(200).json({ success: true });
        } else {
          return res.status(500).json({ success: false });
        }
      } else {
        return res
          .status(400)
          .json({ success: false, error: "already created" });
      }
    } catch (err) {
      log(err);
      return res.status(400).json({ success: false });
    }
  });

  app.post("/authenticate", async (req, res) => {
      try {
        let {
          body: { username, password },
        } = req;

        const user = await User.findByName(username);

        if (!user || user.length < 1) {
          return res
            .status(401)
            .json({ success: false, error: "general error" });
        }

        const { Id, Hash, Role, Session } = user[0];

        const match = await bcrypt.compare(password, Hash);
        if (!match) {
          return res
            .status(401)
            .json({ success: false, error: "general error" });
        }

        // create token
        // include user IP in token ? todo
        const token = jwt.sign(
          { Id, Role, Session },
          req.app.get("jwtstring"),
          { expiresIn: "4h" }
        );

        // log the login: "user logged in from ip"
        let user_data = {
          role: Role === "admin",
        };
        return res.status(200).json({ success: true, token, user: user_data });
      } catch (err) {
        log(err);
        return res.status(401).json({ success: false, error: "general error" });
      }
  });
};
