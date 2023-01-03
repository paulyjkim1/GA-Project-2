const express = require('express')
const db = require('../models')
const router = express.Router()


router.get('/', async (req, res) => {
    try {
        const recipes = await db.recipe.findAll({
            include: [db.user]
        })
        console.log(recipes)
        res.render('recipes/browse.ejs', {recipes: recipes})
    }catch (err){
        console.log(error)
        res.status(400).render('main/404')
    }
    
})
router.get('/new', async (req, res) => {
    try {
        res.render('recipes/new.ejs')
    }catch (err) {
        console.log(error)
        res.status(400).render('main/404')
    }
})


router.get('/:id', (req, res) => {
    res.render('recipes/recipe.ejs')
})

router.post('/', (req,res) => {
    res.redirect('/')
})

router.put('/:id', (req, res) => {
    res.redirect(`/${req.params.id}`)
})

router.get('/:id/ingredients', (req, res) => {
    res.render('recipes/ingredients.ejs')
})

module.exports = router