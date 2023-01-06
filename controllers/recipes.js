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
        let post = await db.recipe.findOrCreate({
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

        //loop through ingredient array and make an api call

        // for(let i = 0; i<ingredientArray.length; i++) {
        //     let recipePost = await db.recipe.findAll({
        //         where: {
        //             userId: req.body.userId,
        //             recipe_name: req.body.recipe_name,
        //             cook_time: req.body.cook_time,
        //             servings: req.body.servings,
        //             description: req.body.description,
        //             ingredient_list: req.body.ingredient_list,
        //             quantities: req.body.quantities,
        //             instructions: req.body.instructions
        //         }
        //     })
        //     console.log(recipePost)
        //     let response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${api_key}&query=${ingredientArray[i]}&pageSize=5&dataType=Survey (FNDDS)`)
        //     //information I need to populate ingredient model (comma separated string of fdcIDs for the first 5 foods that show up from the response.data)
        //     let foodsArray = response.data.foods
        //     let fdcIDList = ''
        //     foodsArray.forEach(function(food) {
        //         fdcIDList = fdcIDList + food.fdcId + ','
        //     })
        //     fdcIDList = fdcIDList.substring(0, fdcIDList.length-1)

        //     //create ingredient in db
        //     let ingredientPost = await db.ingredient.findOrCreate({
        //         where: {
        //             ingredient_name: response.data.foodSearchCriteria.generalSearchInput,
        //             fdcID: fdcIDList
        //         }
        //     })
        //     console.log(ingredientPost)

        //     //I believe this is the problem? Attempt to create the N:M relationship
        //     await ingredientPost.addRecipe(recipePost)
            
        // }

        let ingredientPost = await db.ingredient.findOrCreate({
            where: {
                ingredient_name: 'banana',
                fdcID: '55555555'
            }
        })
        console.log(post)
        console.log(ingredientPost)
        
        await ingredientPost.addRecipe(post)

        res.redirect(`/recipes`)

    }catch (err) {
        console.log(err)
        res.status(400).render('main/404')
    }
})

router.put('/:id', (req, res) => {
    res.redirect(`/${req.params.id}`)
})

router.get('/:id/ingredients', (req, res) => {
    res.render('recipes/ingredients.ejs')
})

module.exports = router