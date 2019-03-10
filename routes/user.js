const bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken"),
  dotenv = require("dotenv"),
  express = require("express"),
  router = express.Router();

// fake db
const Users = [];

dotenv.config();

// middleware
router.use(
  (timelog = (req, res, next) => {
    console.log("Time: ", Date.now());
    next();
  })
);

router.post("/register", (req, res) => {
  const newUser = req.body;
  if (Users.findIndex(user => user.username === newUser.username) !== -1) {
    return res.status(400).json({ msg: "Username already taken" });
  }
  /* higher the numer, the more secure, but more expensive */
  bcrypt.hash(newUser.password, 10, (err, hash) => {
    if (err) return res.status(500).json(err);
    newUser.password = hash;
    Users.push(newUser);
    console.log({
      status: "registered",
      ...newUser
    });
    res.json({ msg: `User "${newUser.username}" is successfully registered` });
  });
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;
  // find user
  let user = Users.find(user => user.username === username);
  if (!user) return res.status(401).json({ msg: "Account not found" });
  else {
    // check if password on file match the password from req.body
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        // if passwords match, generate token and send back to client
        const token = jwt.sign(
          { subject: user.username },
          process.env.SECRET_KEY
        );
        console.log(typeof token);
        res.json({ token: token });
      } else res.status(401).json({ msg: "Invalid Password" });
    });
  }
});

const authorize = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  // if no token found, reject with 401 status
  if (!token) return res.status(401).json({ msg: "Token not found" });
  // verify if token starts with bearer and remove bearer string
  if (token.startsWith("Bearer ")) token = token.slice(7, token.length);
  // if token is found, verify it
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  if (!decoded) return res.status(401).json({ msg: "Invalid token" });
  // if token is authentic, store user at req.user
  req.user = decoded;
  next(); //calls next request handler functions
};

router.get("/user", authorize, (req, res) => {
  const username = req.user.subject;
  const user = { ...Users.find(user => user.username === username) };
  delete user.password;
  if (!user) return res.status(401).json({ msg: "Account not found" });
  else res.json(user);
});

router.post("/update-user", (req, res) => {
  let updatedUser = req.body;
  let userIndex = Users.findIndex(
    user => user.username === updatedUser.oldUsername
  );
  if (userIndex < 0) return res.status(401).json({ msg: "Account not found" });
  else {
    delete updatedUser.oldUsername;
    Users[userIndex] = {
      ...Users[userIndex],
      ...updatedUser
    };
    updatedUser = { ...Users[userIndex] };
    delete updatedUser.password;
    console.log(Users);
    res.json(updatedUser);
  }
});

module.exports = router;