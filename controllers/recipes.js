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


router.get('/:id', (req, res) => {
    res.render('recipes/recipe.ejs')
})

router.post('/', async (req,res) => {
    try{
        console.log(req.body)
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
        let ingredientArray = req.body.ingredient_list.split(',')
        ingredientArray.pop()
        console.log(ingredientArray)
        for(let i = 0; i<ingredientArray.length; i++) {
            let response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${api_key}&query=${ingredientArray[i]}&dataType=Survey (FNDDS)`)
            console.log(response.data)
        }
        
    

        res.redirect('/recipes')

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