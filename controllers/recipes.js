const express = require('express')
const db = require('../models')
const router = express.Router()


router.get('/', (req, res) => {
    res.render('recipes/browse.ejs')
})


router.get('/:id', (req, res) => {
    res.render('recipes/recipe.ejs')
})



module.exports = router