require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require('bcrypt')
//const db = require('./db.js');


const app = express();
app.use(bodyParser.json());
app.use(cors());

// "Promise" wrapped database class

class Database {
  constructor( config ) {
      this.connection = mysql.createConnection( {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        multipleStatements : true
      } );
  }
  query( sql, args ) {
      return new Promise( ( resolve, reject ) => {
          this.connection.query( sql, args, ( err, rows ) => {
              if ( err )
                  return reject( err );
              resolve( rows );
          } );
      } );
  }
  close() {
      return new Promise( ( resolve, reject ) => {
          this.connection.end( err => {
              if ( err )
                  return reject( err );
              resolve();
          } );
      } );
  }
}

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements : true
});
//test connection. if cannot connect then try 
//execut this in mysql workbench
//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
db.connect(function(err) {
  if(err) throw err;
  console.log("connected")
})


//only allowed to crud self
app.post("/:id/updateuser", (req, res) => {
  const userid =req.params.id;
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  let output = JSON.stringify(req.body);
  output = output.toString().replace("{", "");
  output = output.toString().replace("}", "");
  output = output.toString().replace(/:/g, "=");
  if(output.toString().search("username")){
    output = output.toString().replace(`"username"`, `username`);
  };
  if(output.toString().search("password")){
    output = output.toString().replace(`"password"`, `password`);
  };
  if(output.toString().search("email")){
    output = output.toString().replace(`"email"`, `email`);
  };
  if(output.toString().search("role")){
    output = output.toString().replace(`"role"`, `role`);
  };
  if(output.toString().search("createdAt")){
    output = output.toString().replace(`"createdAt"`, `createdAt`);
  };
  if(output.toString().search("updatedAt")){
    output = output.toString().replace(`"updatedAt"`, `updatedAt`);
  };
  console.log(output);
  //UPDATE `userservice`.`tbl_user` SET `password` = '$2b$10$8A8/EfrDMyoJQ2.aPkNCH.CITxygrA9XvWoqBlYWmCj1VOnR2', `email` = '123@123.m' WHERE (`id` = '1');
  var q1 = `
  UPDATE userservice.tbl_user	SET 
		${output}
    where 
		id=${userid};`
  console.log(q1);
  db.query(q1, (err, data)=> {
    if(err){
      return res.status(400).json(err)
    }
    else{
      return res.status(200).send({
        message: `User details: ${output}, updated successfully!`
      });
    }
  })
})


app.get("/:id/deleteuser", (req, res) => {
  const userid =req.params.id;
  var q1 = `
  SELECT *
  FROM
    userservice.tbl_user 
  WHERE 
    (id = ${userid});
  DELETE FROM 
    userservice.tbl_user 
  WHERE 
    (id = ${userid});
  DELETE FROM 
    userservice.tbl_address 
  WHERE 
    (userId = ${userid});`
  
  db.query(q1, (err, data)=> {
    if(err){
      return res.json(err)
    }
    else{
      if(data[0]=''){
        res.send({
          message: "User was deleted successfully!"
        });
      }else{
        res.send({
          message: `Cannot delete User with id=${userid}. Maybe User was not found!`
        });
      }      
    }
  })
})

app.get("/:id/getuserprofile", (req, res) => {
  const userid =req.params.id;
  var q1 = `
  SELECT 
	  *
	FROM 
		userservice.tbl_user 
    where 
		id=${userid};
  SELECT 
    *
  FROM 
    userservice.tbl_address 
  where 
    userId=${userid};`
  
  db.query(q1, (err, data)=> {
    if(err){
      return res.json(err)
    }
    else{
      const result = {
        user: data[0][0],
        address: data[1][0]
      }
      return res.json(result);
    }
  })
})


//privileged to update others 

app.post("/updatetargetuser", (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      error: "Content can not be empty!"
    });
  }
  let output = JSON.stringify(req.body);
  if(!output.toString().search("id")){
    return res.status(400).send({
      error: "Must include id of target user!"
    });
  }else if(JSON.stringify(req.body.id) == `""`){
    return res.status(400).send({
      error: "Must have value for id!"
    });
  }
  const userid =req.body.id;
  output = output.toString().replace("{", "");
  output = output.toString().replace("}", "");
  output = output.toString().replace(/:/g, "=");
  if(output.toString().search("id")){
    output = output.toString().replace(`"id"`, `id`);
  };
  if(output.toString().search("username")){
    output = output.toString().replace(`"username"`, `username`);
  };
  if(output.toString().search("password")){
    output = output.toString().replace(`"password"`, `password`);
  };
  if(output.toString().search("email")){
    output = output.toString().replace(`"email"`, `email`);
  };
  if(output.toString().search("role")){
    output = output.toString().replace(`"role"`, `role`);
  };
  if(output.toString().search("createdAt")){
    output = output.toString().replace(`"createdAt"`, `createdAt`);
  };
  if(output.toString().search("updatedAt")){
    output = output.toString().replace(`"updatedAt"`, `updatedAt`);
  };
  console.log(output);
  //UPDATE `userservice`.`tbl_user` SET `password` = '$2b$10$8A8/EfrDMyoJQ2.aPkNCH.CITxygrA9XvWoqBlYWmCj1VOnR2', `email` = '123@123.m' WHERE (`id` = '1');
  var q1 = `
  SELECT *
  FROM
    userservice.tbl_user 
  WHERE 
    (id = ${userid});
  UPDATE userservice.tbl_user	SET 
		${output}
    where 
		id=${userid};`
  console.log(q1);
  db.query(q1, (err, data)=> {
    if(err){
      return res.json(err)
    }
    else{
      if(JSON.stringify(data[0][0])==undefined){
        return res.send({
          message: `Cannot update User with id=${userid}. Maybe User was not found!`
        });
      }else{
        return res.send({
          message: "User was updated successfully!"
        });
      }      
    }
  })
})


app.get("/deletetargetuser", (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      error: "Content can not be empty!"
    });
  }
  let output = JSON.stringify(req.body);
  if(!output.toString().search("id")){
    return res.status(400).send({
      error: "Must include id of target user!"
    });
  }else if(JSON.stringify(req.body.id) == `""`){
    return res.status(400).send({
      error: "Must have value for id!"
    });
  }
  const userid =req.body.id;
  var q1 = `
  SELECT *
  FROM
    userservice.tbl_user 
  WHERE 
    (id = ${userid});
  DELETE FROM 
    userservice.tbl_user 
  WHERE 
    (id = ${userid});
  DELETE FROM 
    userservice.tbl_address 
  WHERE 
    (userId = ${userid});`
  
  db.query(q1, (err, data)=> {
    if(err){
      return res.json(err)
    }
    else{
      console.log(JSON.stringify(data[0][0]))
      if(JSON.stringify(data[0][0])==undefined){
        return res.send({
          message: `Cannot delete User with id=${userid}. Maybe User was not found!`
        });
      }else{
        return res.send({
          message: "User was deleted successfully!"
        });
      }      
    }
  })
})

app.get("/gettargetuserprofile", (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      error: "Content can not be empty!"
    });
  }
  let output = JSON.stringify(req.body);
  if(!output.toString().search("id")){
    return res.status(400).send({
      error: "Must include id of target user!"
    });
  }else if(JSON.stringify(req.body.id) == `""`){
    return res.status(400).send({
      error: "Must have value for id!"
    });
  }
  const userid =req.body.id;
  var q1 = `
  SELECT 
	  *
	FROM 
		userservice.tbl_user 
    where 
		id=${userid};
  SELECT 
    *
  FROM 
    userservice.tbl_address 
  where 
    userId=${userid};`
  
  db.query(q1, (err, data)=> {
    if(err){
      return res.json(err)
    }
    else{
      if(JSON.stringify(data[0][0]) == undefined){
        return res.status(400).send({
          error: "User does not exist!"
        });
      }
      const result = {
        user: data[0][0],
        address: data[1][0]
      }
      return res.json(result);
    }
  })
})

 app.post("/login", async (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      error: "Content can not be empty!"
    });
  }
  if(req.body.email == undefined){
    return res.status(400).send({
      error: "Must include email and password of target user!"
    });
  }
  if(req.body.password == undefined){
    return res.status(400).send({
      error: "Must include email and password of target user!"
  });
  }
  if((JSON.stringify(req.body.email)) == `""` || (JSON.stringify(req.body.password) == `""`)){
    return res.status(400).send({
      error: "Must have value for email and password!"
    });
  }
  const userEmail =req.body.email;
  const userPassword = JSON.stringify(req.body.password).replace(/"/g, "");
  //UPDATE `userservice`.`tbl_user` SET `password` = '$2b$10$8A8/EfrDMyoJQ2.aPkNCH.CITxygrA9XvWoqBlYWmCj1VOnR2', `email` = '123@123.m' WHERE (`id` = '1');
  var q1 = `
  SELECT *
  FROM
    userservice.tbl_user 
  WHERE 
    (email = "${userEmail}");`
  console.log(q1);
  db.query(q1, async (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      if(JSON.stringify(data[0])==undefined){
        return res.send({
          error: `Email/password incorrect.`
        });
      }else{
        console.log(data[0].password)
        if(await bcrypt.compare(userPassword, data[0].password)){
          return res.status(200).send({
            message: "User logged in!",
            user: data[0]
          });
        }else{
          return res.status(400).send({
            error: "Email/password incorrect."
          });
        }
      }      
    }
  })
});

 app.post("/register", async (req, res) => {
  //this is abit special, because it requires it to be wrapped in a "Promise" like class
  //Because when running two separate set of mysql instructions in this case, select and insert
  // undefined behavior may happen because they are time sensitive
  // I recommend this short read up - "https://codeburst.io/node-js-mysql-and-promises-4c3be599909b"

const database=  new Database();

  //MUST PASS IN HASHED PASSWORD
  var output;
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      error: "Content can not be empty!"
    });
  }
  if(req.body.email == undefined){
    return res.status(400).send({
      error: "Must include email and password of target user!"
    });
  }
  if(req.body.password == undefined){
    return res.status(400).send({
      error: "Must include email and password of target user!"
  });
  }
  if((JSON.stringify(req.body.email)) == `""` || (JSON.stringify(req.body.password) == `""`)){
    return res.status(400).send({
      error: "Must have value for email and password!"
    });
  }
  const userEmail =req.body.email;
  const userPassword = req.body.password;
  const userUsername = req.body.username;
  // const userRole = req.body.role;
  //UPDATE `userservice`.`tbl_user` SET `password` = '$2b$10$8A8/EfrDMyoJQ2.aPkNCH.CITxygrA9XvWoqBlYWmCj1VOnR2', `email` = '123@123.m' WHERE (`id` = '1');
  //INSERT INTO `userservice`.`tbl_user` (`id`, `username`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('2', 'd1331343', '$10$bCfwzUZhdPBFV50EqSGa3O9Rpr5U60WcY832w2Fwp8BeOYsGEvOsO', '123@123.com.sg', 'CUSTOMER', '2023-04-17 22:53:33', '2023-04-17 22:53:33');

  database.query( 
    `SELECT count(*) as count FROM userservice.tbl_user 
    where 
    username = "${userUsername}" or email = "${userEmail}";` )
    .then( rows => {
        console.log(JSON.stringify(rows[0].count))
        if(JSON.stringify(rows[0].count) != "0"){
          console.log("error, cannot create")
          return database.close();
        }else{
          console.log("success, can create here")
          return database.query( 
          `
          INSERT INTO 
            userservice.tbl_user 
            (username, password, email, role, createdAt, updatedAt) 
          VALUES ('${userUsername}', '${userPassword}', '${userEmail}', 'CUSTOMER', now(), now());`
          )
        }
    }, err =>{
      return database.close().then( () => { throw err; } )
    } ).then(output =>{
      console.log(JSON.stringify(output))
      if(output == undefined){
        return res.status(400).send({
          error: "User already exists!",
          output: output
        });
      }else{
        return res.status(200).send({
          message: "User registered!",
          output: output
        });
      }
      
    }).catch( err =>{
      return res.json(err);
    })
});
app.get('/:id/getuserdetailsbyid', async (req, res) => {
  var query = `
    select * from userservice.tbl_user where id = ${req.params.id}
  `
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    } else {
      if(JSON.stringify(data) == undefined){
        return res.status(400).send({
          error: "User does not exist!"
        });
      }
      console.log(query)
      const result = {
        user: data
      }
      return res.json(result);
    }
  })
})

// Client side must provide the following in the body
// {
//   "name": "Q123",
//   "floorNo": "qwe",
//   "unitNo": "qwer",
//   "postalCode": "das",
//   "country": "asdf",
//   "userId": "mvnc"
// }
app.post("/:userId/createaddress", (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  const address = {
    name: `'${req.body.name}'`,
    floorNo: req.body.floorNo ? `'${req.body.floorNo}'` : null,
    unitNo: req.body.unitNo ? `'${req.body.unitNo}'` : null,
    postalCode: `'${req.body.postalCode}'`,
    country: `'${req.body.country}'`,
    userId: `'${req.params.userId}'`
  };
  let output = `
    ${address.name},
    ${address.floorNo},
    ${address.unitNo},
    ${address.postalCode},
    ${address.country},
    ${address.userId}
  `
  var q1 = `
  INSERT INTO userservice.tbl_address 
	(name, floorNo, unitNo, postalCode, country, userId)
  VALUE (${output});`
  console.log(q1);
  db.query(q1, (err, data)=> {
    if(err){
      return res.json(err)
    }
    else{
      const result = {
        address: data
      }
      return res.json(result)
    }
  })
})

app.get("/:addressId/getaddressbyid", (req, res) => {
  const addressId = req.params.addressId
  var query = `
    select * from userservice.tbl_address where id = ${addressId}
  `
  console.log(query)
  db.query(query, (err, data) => {
    if (err) {
      return res.json(err)
    } else {
      if(JSON.stringify(data) == undefined){
        return res.status(400).send({
          message: "No address retrieved"
        });
      }
      console.log(JSON.stringify(data))
      const result = {
        address: data[0]
      }
      return res.json(result);
    }
  })
})

app.get("/:userId/getaddressbyuserId", (req, res) => {
  const userId = req.params.userId
  var query = `
    select * from userservice.tbl_address where userId = ${userId}
  `
  console.log(query)
  db.query(query, (err, data) => {
    if (err) {
      return res.json(err)
    } else {
      if(JSON.stringify(data) == undefined){
        return res.status(400).send({
          message: "No address retrieved"
        });
      }
      console.log(JSON.stringify(data))
      const result = {
        address: data
      }
      return res.json(result);
    }
  })
})

app.post("/:addressId/updateaddress", (req, res) => {
  const addressId = req.params.addressId
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  const address = {
    name: `'${req.body.name}'`,
    floorNo: req.body.floorNo ? `'${req.body.floorNo}'` : null,
    unitNo: req.body.unitNo ? `'${req.body.unitNo}'` : null,
    postalCode: `'${req.body.postalCode}'`,
    country: `'${req.body.country}'`
  };
  let output = `
    name = ${address.name},
    floorNo = ${address.floorNo},
    unitNo = ${address.unitNo},
    postalCode = ${address.postalCode},
    country = ${address.country}
  `
  var q1 = `
  UPDATE userservice.tbl_address
  SET  ${output}
	WHERE id = ${addressId};
  `
  console.log(q1);
  db.query(q1, (err, data)=> {
    if(err){
      return res.json(err)
    } else {
      console.log(data)
      return res.send({
        message: `Address: ${addressId}, updated successfully!`
      });
    }
  })
})

app.post("/:addressId/deleteaddress", (req, res) => {
  const addressId = req.params.addressId
  var q1 = `
  DELETE FROM userservice.tbl_address
	WHERE id = ${addressId};
  `
  console.log(q1);
  db.query(q1, (err, data)=> {
    if(err){
      return res.json(err)
    } else {
      console.log(data)
      return res.send({
        message: `Address: ${addressId}, deleted successfully!`
      });
    }
  })
})

app.listen(4001, () => {
  console.log("Listening on 4001");
});
