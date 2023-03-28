import express from "express"
import Datastore from "nedb-promises"
const usersDB = Datastore.create("database.db")

const app = express()
const PORT = 3001
app.use(express.json())

app.get("/api/email", async (req, res) => {
    let user = await usersDB.findOne({username: req.query.name})
    let email = user?.email || null
    res.json(email)
})

app.delete("/api/remove/:user", async (req, res) => {
    if(await usersDB.findOne({username: req.params.user})) {
        usersDB.remove({username: req.params.user})
        res.json("Deleted " + req.params.user + ".")
    } else {
        res.json("Wrong username")
    }
})

app.post("/api/login", checkData, async (req, res) => {
    let sucsess = false
    const user = await usersDB.findOne({username: req.body.username})
    if(user) {
        if(user.password === req.body.password) {
            sucsess = true
            await usersDB.update({username: user.username}, {$set: {loggedIn: true}})
        }
    }
    console.log((await usersDB.find({})).length)
    res.json({sucsess})
})

app.post("/api/signup", checkData, async (req, res) => {
    let sucsess = false
    let usernameExists = true
    let emailExists = true
    if(!await usersDB.findOne({username: req.body.username})) {
        usernameExists = false
    }
    if(!await usersDB.findOne({email: req.body.email})) {
        emailExists = false
    }
    if(usernameExists === false && emailExists === false) {
        usersDB.insert({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            loggedIn: false
        })
        sucsess = true
    }
    res.json({sucsess, usernameExists, emailExists})
})

app.use((req, res) => {
    res.status(404).json({status:false, msg:"404 Not Found."})
})

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})

function checkData(req, res, next) {
    // const usernameTest = /^\w{5,20}$/
    // const emailTest = /.+@.+\..+/
    // const passwordTest = /.{6,}/
    // console.log("Data validated!")
    next()
}