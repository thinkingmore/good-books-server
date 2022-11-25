const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleware

app.use(cors());
app.use(express.json());

// establish database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ltn8juo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);

const run = async()=>{
    try{
        const categoriesCollection = client.db("goodBooks").collection("categories");
        const booksCollection = client.db("goodBooks").collection("books");
        const usersCollection = client.db("goodBooks").collection("users");
    
        
        // API path for running CURD operation


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