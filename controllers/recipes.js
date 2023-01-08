const express = require('express')
const axios = require('axios');
const db = require('../models')
const router = express.Router()
require('dotenv').config()
api_key = process.env.API_KEY


router.get('/', async (req, res) => {
    try {
        const recipes = await db.recipe.findAll({
            include: [db.user]
        })
        res.render('recipes/browse.ejs', {recipes: recipes})
    }catch (err){
        console.log(err)
        res.status(400).render('main/404')
    }
    
})
router.get('/new', async (req, res) => {
    try {
        res.render('recipes/new.ejs')
    }catch (err) {
        console.log(err)
        res.status(400).render('main/404')
    }
})


router.get('/:id', async (req, res) => {
    try {
        let recipe = await db.recipe.findOne({
            where: { id: req.params.id },
            include: [db.user, db.ingredient]
        })
        let ingredients = recipe.dataValues.ingredient_list.split(',')
        let quantities = recipe.dataValues.quantities.split(',')
        ingredients.pop()
        quantities.pop()
        let combined = []
        for (let i = 0; i <ingredients.length; i++){
            combined.push(quantities[i]+' '+ingredients[i])
        }
    

        res.render('recipes/recipe.ejs', {recipe: recipe, combined: combined})
    }catch (err) {
        console.log(err)
        res.status(400).render('main/404')
    }
   
})

router.post('/', async (req,res) => {
    try{
        // create recipe in db with form inputs
        let [post, postCreated] = await db.recipe.findOrCreate({
            where:{
                userId: req.body.userId,
                recipe_name: req.body.recipe_name,
                cook_time: req.body.cook_time,
                servings: req.body.servings,
                description: req.body.description,
                ingredient_list: req.body.ingredient_list,
                quantities: req.body.quantities,
                instructions: req.body.instructions
            }
        })
        
        //take comma separated list of ingredients (req.body.ingredient_list) and create an array, pop the last empty index
        let ingredientArray = req.body.ingredient_list.split(',')
        ingredientArray.pop()

        // loop through ingredient array and make an api call

        for(let i = 0; i<ingredientArray.length; i++) {
            let response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${api_key}&query=${ingredientArray[i]}&pageSize=1&dataType=Survey (FNDDS)`)
            //information I need to populate ingredient model (comma separated string of fdcIDs for the first 3 foods that show up from the response.data)
            //api was much slower than expected for multiple fdcId food search (had to go down to one fdcID per ingredient)
            let foodsArray = response.data.foods

            // let fdcIDList = ''
            // foodsArray.forEach(function(food) {
            //     fdcIDList = fdcIDList + food.fdcId + ','
                
            // })
            // fdcIDList = fdcIDList.substring(0, fdcIDList.length-1)

            let fdcIDList = foodsArray[0].fdcId.toString()


            //create ingredient in db
            let [ingredientPost, ingredientPostCreated] = await db.ingredient.findOrCreate({
                where: {
                    ingredient_name: response.data.foodSearchCriteria.generalSearchInput,
                    fdcID: fdcIDList
                }
            })
            // console.log(ingredientPost)

            //create the N:M relationship
            await ingredientPost.addRecipe(post)
            
        }

        res.redirect(`/recipes`)

    }catch (err) {
        console.log(err)
        res.status(400).render('main/404')
    }
})


router.get('/:id/edit', async (req,res) =>{
    try {
        
        let foundRecipe = await db.recipe.findOne({
            where:{
                id: req.params.id
            },
            include: [db.user, db.ingredient]
            
        })
        console.log(res.locals.user.username)
        console.log(foundRecipe.user.username)
        if(res.locals.user.dataValues.username === foundRecipe.user.username){
            res.render('recipes/edit.ejs', {recipe: foundRecipe})
        } else {
            res.send(`User:${res.locals.user.username} is not authorized to edit this recipe`)
        }


    }catch (err) {
        console.log(err)
        res.status(400).render('main/404')
    }
})

router.put('/:id', (req, res) => {
    res.redirect(`/recipes/${req.params.id}`)
})




router.delete('/:id', async (req, res) => {
    try{
        const numRowsDeleted = await db.recipe.destroy({
            where:{
                recipe_name:req.body.recipe_name
            }
        })
        res.redirect('/recipes')

    }catch (err) {
        console.log(err)
        res.status(400).render('main/404')
    }
})


router.get('/:id/ingredients', async (req, res) => {
    try {
        let foundRecipe = await db.recipe.findOne({
            where: { id: req.params.id },
            include: [db.user, db.ingredient]
        })

        
        let fdcIDlist = ''
        for(let i = 0; i<foundRecipe.ingredients.length; i++) {
            fdcIDlist = fdcIDlist + foundRecipe.ingredients[i].dataValues.fdcID + ','
        }
        fdcIDlist = fdcIDlist.substring(0, fdcIDlist.length-1)
        console.log(fdcIDlist)

        let response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods?api_key=${api_key}&fdcIds=${fdcIDlist}`)

        res.render('recipes/ingredients.ejs', {foundRecipe: foundRecipe, response: response})
    }catch (err) {
        console.log(err)
        res.status(400).render('main/404')
    }
})


module.exports = router