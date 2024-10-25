const express = require("express")
const port = process.env.PORT || 5000

const app = express();

app.get("/", (req, res) => {
    res.json({message: "Bienvenue sur notre API en Node JS !"})
})

const users = require("./routes/users");
app.use("/users", users);


app.listen(port, () =>{
    console.log("Serveur est en ligne !")
})