const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");


const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "recipeservice",
  multipleStatements : true
});
//test connection. if cannot connect then try 
//execut this in mysql workbench
//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
db.connect(function(err) {
  if(err) throw err;

  console.log("connected")
})


////////////////////////////////////////////////////
// MAIN RECIPE FUNCTIONS
////////////////////////////////////////////////////
// GET ALL RECIPES
app.get("/getallrecipes", (req, res) => {
  var query = `
    select recipe.*, image.srcpath as srcpath
    from tbl_recipe recipe, tbl_recipe_image image
    where recipe.imageId = image.id;
  `
  db.query(query, (err, data)=> {
    if (err) {
      return res.json(err)
    } else {
      if(JSON.stringify(data) == undefined){
        return res.status(400).send({
          error: "Error in getting recipes"
        });
      }
      console.log(JSON.stringify(data))
      const result = {
        recipes: data
      }
      return res.json(result);
    }
  })
})

// CREATE NEW RECIPE
app.post("/createrecipe", (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body)
  const recipe = {
    name: `'${req.body.name}'`,
    description: req.body.description ? `'${req.body.description}'` : null,
    cuisine: `'${req.body.cuisine}'`,
    prepTime: `'${req.body.prepTime}'`,
    prepTimeUom: `'${req.body.prepTimeUom}'`,
    difficulty: `'${req.body.difficulty}'`
  };
  let output = `
    ${recipe.name},
    ${recipe.description},
    ${recipe.cuisine},
    ${recipe.prepTime},
    ${recipe.prepTimeUom},
    ${recipe.difficulty}
  `
  var query = `
    INSERT into TBL_RECIPE
    (NAME, DESCRIPTION, CUISINE, PREPTIME, PREPTIMEUOM, DIFFICULTY)
    VALUES(${output});
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      return res.send({
        message: `Recipe details: ${output}, updated successfully!`
      });
    }
  })
})

// UPDATE RECIPE
app.post("/:id/updaterecipe", (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body)
  const recipeId = req.params.id
  const recipe = {
    name: `'${req.body.name}'`,
    description: req.body.description ? `'${req.body.description}'` : null,
    cuisine: `'${req.body.cuisine}'`,
    prepTime: `'${req.body.prepTime}'`,
    prepTimeUom: `'${req.body.prepTimeUom}'`,
    difficulty: `'${req.body.difficulty}'`
  };
  let output = `
  name = ${recipe.name},
  description = ${recipe.description},
  cuisine = ${recipe.cuisine},
  prepTime = ${recipe.prepTime},
  prepTimeUom = ${recipe.prepTimeUom},
  difficulty = ${recipe.difficulty}
  `
  var query = `
    UPDATE TBL_RECIPE SET
    ${output}
    where id = '${recipeId}';
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      return res.send({
        message: `Recipe details: ${output}, updated successfully!`
      });
    }
  })
})

// DELETE RECIPE
app.post("/:id/deleterecipe", (req, res) => {
  const recipeId = req.params.id
  var query = `
    DELETE FROM TBL_RECIPE where id = '${recipeId}';
    DELETE FROM TBL_RECIPE_IMAGE where recipeId = '${recipeId}';
    DELETE FROM TBL_RECIPE_INGREDIENT where recipeId = '${recipeId}';
    DELETE FROM TBL_RECIPE_STEP where recipeId = '${recipeId}';
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      return res.send({
        message: `Recipe details: ${recipeId}, deleted successfully!`
      });
    }
  })
})

// GET ALL RECIPES
app.get("/:id/getrecipedetails", (req, res) => {
  const recipeId = req.params.id
  var query = `
    SELECT * FROM TBL_RECIPE where id = '${recipeId}';
    SELECT * FROM TBL_RECIPE_IMAGE where recipeId = '${recipeId}';
    SELECT * FROM TBL_RECIPE_INGREDIENT where recipeId = '${recipeId}';
    SELECT * FROM TBL_RECIPE_STEP where recipeId = '${recipeId}' order by createdAt asc;
  `
  db.query(query, (err, data)=> {
    if (err) {
      return res.json(err)
    } else {
      if(JSON.stringify(data) == undefined){
        return res.status(400).send({
          error: "Error in getting recipes"
        });
      }
      console.log(JSON.stringify(data))
      const result = {
        recipe: data[0],
        image: data[1],
        ingredients: data[2],
        steps: data[3]
      }
      return res.json(result);
    }
  })
})

////////////////////////////////////////////////////
// RECIPE PHOTO FUNCTIONS
////////////////////////////////////////////////////
// UPLOAD RECIPE PHOTO
app.post('/:id/uploadphoto', (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body)
  const image = {
    type: req.body.mimetype,
    name: req.body.originalname,
    srcPath: "/images/uploads/" + req.body.filename 
  }
  let output = `
  '${image.type}',
  '${image.name}',
  '${image.srcPath}'
  `
  var query = `
  INSERT into TBL_RECIPE_IMAGE
  (type, name, srcPath)
  VALUES(${output});
`
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      return res.send({
        message: `Image details: ${output}, uploaded successfully!`
      });
    }
  })
})

// SAVE RECIPE PHOTO TO RECIPE
app.post('/:id/savephototorecipe', (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body)
  const imageId = req.body.imageId
  const recipeId = req.params.id

  var query = `
  UPDATE TBL_RECIPE_IMAGE
  SET recipeId = '${recipeId}'
  WHERE id = '${imageId}';
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      return res.send({
        message: `Image is saved to recipe: ${recipeId} successfully!`
      });
    }
  })
})

// GET RECIPE PHOTO
app.get('/:id/getuploadedphoto', (req, res) => {
  const recipeId = req.params.id;
  var query = `
  select image.* from tbl_recipe_image image
  where image.recipeId = '${recipeId}';
  `
  db.query(query, (err, data)=> {
    if (err) {
      return res.json(err)
    } else {
      if(JSON.stringify(data) == undefined){
        return res.status(400).send({
          error: "No photo uploaded yet"
        });
      }
      console.log(JSON.stringify(data))
      const result = {
        image: data
      }
      return res.json(result);
    }
  })
})

////////////////////////////////////////////////////
// RECIPE INGREDIENT FUNCTIONS
////////////////////////////////////////////////////
// ADD INGREDIENT
app.post('/:recipeId/addingredient',  (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body)
  const recipeId = req.params.recipeId
  const recipeIngredient = {
    name: `'${req.body.name}'`,
    amount: `'${req.body.amount}'`,
    uom: `'${req.body.uom}'`,
    description: req.body.description ? `'${req.body.description}'` : null,
    recipeId: `'${recipeId}'`
  };

  let output = `
  ${recipeIngredient.name},
  ${recipeIngredient.amount},
  ${recipeIngredient.uom},
  ${recipeIngredient.description},
  ${recipeIngredient.recipeId}
  `
  var query = `
  INSERT into TBL_RECIPE_INGREDIENT
  (name,  amount, uom, description, recipeId)
  VALUES(${output});
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      console.log(data)
      return res.send({
        message: `Recipe ingredient details: ${output}, added successfully!`
      });
    }
  })
})

// UPDATE INGREDIENT
app.post('/:recipeId/updateingredient/:ingredientId', (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body)
  const recipeId = req.params.recipeId
  const ingredientId = req.params.ingredientId

  const recipeIngredient = {
    name: `'${req.body.name}'`,
    amount: `'${req.body.amount}'`,
    uom: `'${req.body.uom}'`,
    description: req.body.description ? `'${req.body.description}'` : null,
    recipeId: `'${recipeId}'`
  };

  let output = `
  NAME = ${recipeIngredient.name},
  AMOUNT = ${recipeIngredient.amount},
  UOM = ${recipeIngredient.uom},
  DESCRIPTION = ${recipeIngredient.description},
  RECIPEID = ${recipeIngredient.recipeId}
  `
  var query = `
  UPDATE TBL_RECIPE_INGREDIENT SET
  ${output}
  WHERE id = ${ingredientId};
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      console.log(data)
      return res.send({
        message: `Recipe ingredient details: ${output}, updated successfully!`
      });
    }
  })
})

// DELETE INGREDIENT
app.post('/:recipeId/deleteingredient/:ingredientId', (req, res) => {
  const recipeId = req.params.recipeId
  const ingredientId = req.params.ingredientId
  
  var query = `
  DELETE FROM TBL_RECIPE_INGREDIENT 
  WHERE id = ${ingredientId};
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      console.log(data)
      return res.send({
        message: `Recipe ingredient details: ${ingredientId}, deleted successfully!`
      });
    }
  })
})

// GET ALL INGREDIENTS IN RECIPE
app.get('/:recipeId/getallingredients', (req, res) => {
  const recipeId = req.params.recipeId
  var query = `
  SELECT * FROM TBL_RECIPE_INGREDIENT 
  WHERE recipeId = ${recipeId};
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      const result = {
        ingredients: data
      }
      return res.json(result)
    }
  })
})

////////////////////////////////////////////////////
// RECIPE STEP FUNCTIONS
////////////////////////////////////////////////////
// ADD STEP
app.post('/:recipeId/addstep',  (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body)
  const recipeId = req.params.recipeId
  const recipeStep = {
    description: `'${req.body.description}'`,
    recipeId: `'${recipeId}'`
  };

  let output = `
  ${recipeStep.description},
  ${recipeStep.recipeId}
  `
  var query = `
  INSERT into TBL_RECIPE_STEP
  (description, recipeId)
  VALUES(${output});
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      console.log(data)
      return res.send({
        message: `Recipe step details: ${output}, added successfully!`
      });
    }
  })
})

// UPDATE STEP
app.post('/:recipeId/updatestep/:stepId', (req, res) => {
  if (JSON.stringify(req.body) == "{}") {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body)
  const recipeId = req.params.recipeId
  const stepId = req.params.stepId

  const recipeStep = {
    description: `'${req.body.description}'`,
    recipeId: `'${recipeId}'`
  };

  let output = `
  DESCRIPTION = ${recipeStep.description},
  RECIPEID = ${recipeStep.recipeId}
  `
  var query = `
  UPDATE TBL_RECIPE_STEP SET
  ${output}
  WHERE id = ${stepId};
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      console.log(data)
      return res.send({
        message: `Recipe step details: ${output}, updated successfully!`
      });
    }
  })
})

// DELETE STEP
app.post('/:recipeId/deletestep/:stepId', (req, res) => {
  const recipeId = req.params.recipeId
  const stepId = req.params.stepId
  
  var query = `
  DELETE FROM TBL_RECIPE_STEP 
  WHERE id = ${stepId};
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      console.log(data)
      return res.send({
        message: `Recipe step details: ${stepId}, deleted successfully!`
      });
    }
  })
})

// GET ALL STEPS IN RECIPE
app.get('/:recipeId/getallsteps', (req, res) => {
  const recipeId = req.params.recipeId
  var query = `
  SELECT * FROM TBL_RECIPE_STEP 
  WHERE recipeId = ${recipeId}
  order by createdAt asc;
  `
  console.log(query);
  db.query(query, (err, data)=> {
    if(err){
      return res.json(err)
    }else{
      const result = {
        steps: data
      }
      return res.json(result)
    }
  })
})

////////////////////////////////////////////////////
// FAVOURITE RECIPE FUNCTIONS
////////////////////////////////////////////////////

////////////////////////////////////////////////////
// COMMENT FUNCTIONS
////////////////////////////////////////////////////


////////////////////////////////////////////////////
// INITIALISE SERVER
////////////////////////////////////////////////////
app.listen(4003, () => {
  console.log("Listening on 4003");
});
