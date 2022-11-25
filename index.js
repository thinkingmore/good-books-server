const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { application } = require('express');


const port = process.env.PORT || 5000;
const app = express();

// middleware

app.use(cors());
app.use(express.json());

// establish database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ltn8juo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);


// process server request after verifying token

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


const run = async()=>{
    try{
        const categoriesCollection = client.db("goodBooks").collection("categories");
        const booksCollection = client.db("goodBooks").collection("books");
        const usersCollection = client.db("goodBooks").collection("users");
        const ordersCollection = client.db("goodBooks").collection("orders");
    
        
        // API path for running CURD operation

        // generate jwt token if the user exist in database

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });


        // create users upon client request
        app.get('/users',async(req,res)=>{
            const query = {};
            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })

        app.post('/users',async(req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // post booking data of books
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        app.get('/orders',async(req,res)=>{
            const query = {};
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })
        
        // process user dashboard loading request based on user role
        
        
        
        
        // send categories,books,and books by categories to client
        
        app.get('/categories',async(req,res)=>{
            const query= {}
            const cursor = categoriesCollection.find(query)
            const categories = await cursor.toArray();
            res.send(categories);
        })

        app.get('/books',async(req,res)=>{
            const query = {}
            const cursor = booksCollection.find(query)
            const books = await cursor.toArray();
            res.send(books);
        })

        app.get('/books/:category',async(req,res)=>{
            const category = req.params.category;
            const cursor = booksCollection.find({ category_name: category });
            const books = await cursor.toArray();
            res.send(books);
        })

        // code to update particular fields in database
        app.get('/edit', async (req, res) => {
                const filter = { seller_name: "Jerin Ahmed" }
                const options = { upsert: true }
                const updatedDoc = {
                    $set: {
                        seller_status: "verified"
                    }
                }
                const result = await booksCollection.updateMany(filter, updatedDoc, options);
                res.send(result);
            })

    }
    
    finally{
    
    }
}

run().catch(error=> console.error(error));

app.get('/',(req, res) => {
    res.send('good books server is running')
})



app.listen(port,()=> console.log(`good books server running on ${port}`))