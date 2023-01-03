const express = require('express')
const db = require('../models')
const router = express.Router()


router.get('/', (req, res) => {
    res.render('recipes/browse.ejs')
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