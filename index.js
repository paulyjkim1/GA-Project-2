//required packages
require('dotenv').config()
const express = require('express')

//app config
const app = express()
const PORT = process.env.PORT || 8000
app.set('viewengine', 'ejs')
// parse request bodies from the html forms
app.use(express.urlencoded({ extended: false }))


//routes and controllers
app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.use('/users', require('./controllers/users'))

app.listen(PORT, () => {
    console.log(`authenticating on PORT ${PORT}`)
})