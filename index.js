//required packages
require('dotenv').config()
const express = require('express')

//app config
const app = express()
const PORT = process.env.PORT || 8000
app.set('viewengine', 'ejs')


//routes and controllers
app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.listen(PORT, () => {
    console.log(`authenticating on PORT ${PORT}`)
})