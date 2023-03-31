const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const path = require("path");

const dataBasePath = path.join(__dirname, "username.db");

let DATABASE = null;

const start = async () => {
  try {
    DATABASE = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log(`SERVER running at http://localhost:3000/`)
    );
  } catch (e) {
    console.log(`Data Base error ${e.message}`);
  }
};
start();

app.post("/register/", async (request, response) => {
  let { username, name, password, gender, location } = request.body;
  const bcryptPassword = await bcrypt.hash(password, 10);

  let x = `SELECT * FROM user  WHERE username = '${username}';`;

  let user_name = await DATABASE.get(x);

  if (user_name === undefined) {
    const postQuery = `INSERT INTO user(username,name,password,gender,location)
        VALUES 
        (
        '${username}',
        '${name}',
        '${bcryptPassword}',
        ${gender},
        '${location}'
        );`;

    if (password.length < 5) {
      response.status(400);
      response.send(" Password is too short");
    } else {
      const xx = await DATABASE.run(postQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const bcryptPASSWORD = await bcrypt.hash(password, 10);

  const checkuser = `select * from user WHERE username ='${username}';`;

  try {
    if (checkuser === undefined) {
      response.status(200);
      response.send("Invalid user");
    } else {
      const x = `INSERT INTO user(username,password)
        VALUES ('${username}', '${bcryptPASSWORD}');`;

      const pswrdmatch = await bcrypt.compare(password, x.password);

      if (pswrdmatch === true) {
        response.status(200);
        responsd.send("Successful login of the user");
      } else {
        response.status(400);
        response.send("Invalid password");
      }
    }
  } catch (e) {
    console.log(`DATA base ${e.message}`);
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;

  const bcrypted = await bcrypt.hash(oldPassword, newPassword, 10);

  const insertingPswrd = `INSERT INTO user(username,oldpassword,newpassword)
    VALUES ('${username}' , '${bcrypted.oldPassword}' ,  '${bcrypted.newPassword}');`;
  try {
    if (insertingPswrd === undefined) {
      response.status(400);
      response.send("Invalid current password");
    } else {
      if (bcrypted.newPassword.length < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        response.status(200);
        response.send("Password updated");
      }
    }
  } catch (e) {
    console.log(`DATA base error ${e.message}`);
  }
});

module.exports = app;
