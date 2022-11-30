const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config()
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Hello World!')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lg5fruz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized" })
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "forbidden" })
        }
        req.decoded = decoded;
        next()
    });
}
async function run() {
    try {
        await client.connect();
        const carsCollection = client.db("carmania").collection("cars");
        const usersCollection = client.db("carmania").collection("users");
        const ordersCollection = client.db("carmania").collection("orders");
        //check current users role
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ user: email })
            const role = user?.role
            res.send({ role: role })
        })
        //to save a user
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            let role = req.body.role;
            const name = req.body.name;
            const filter = { user: email };
            const options = { upsert: true };
            const query = { user: email }
            const gotIt = await usersCollection.findOne(query)
            console.log(gotIt);
            if (gotIt?.role == "seller") {
                role = "seller"
            }
            if (gotIt?.role == "admin") {
                role = "admin"
            }