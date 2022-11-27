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

        // Contains Database Collection //
        
        const categoriesCollection = client.db("goodBooks").collection("categories");
        const booksCollection = client.db("goodBooks").collection("books");
        const usersCollection = client.db("goodBooks").collection("users");
        const ordersCollection = client.db("goodBooks").collection("orders");
         
        // Contains Database Collection //
        
        
        
        
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


        
        
        // Show All Users and Create New User Upon Cient Request //
        
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

        // Show All Users and Create New User Upon Cient Request //

        
        
        
        // Collect User Related Information for Loading Dashborad Data //
        
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send(user);
        })

        // Collect User Related Information for Loading Dashboard Data //

        
        
        
        // Booking Related Operation for Buyers Starts//
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const order = await ordersCollection.find(query).toArray();
            res.send(order);
        })

        app.get('/orders',async(req,res)=>{
            const query = {};
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: (ObjectId(id)) }
            const result = await ordersCollection.deleteOne(filter);
            res.send(result);
        })
        
        // Booking Related Operation for Buyers Ends//
        
       
        
        
        
        // Admin Only Operation Starts //

        app.get('/allusers/:role',async(req,res)=>{
            const role = req.params.role;
            const cursor = usersCollection.find({ role: role });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.put('/allsellers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    seller_status: "verified"
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        
        
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: (ObjectId(id)) }
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        
        // Admin Only operation Ends //

        
        
        
        // API for All Registered Users Starts //
        
        app.get('/categories',async(req,res)=>{
            const query= {}
            const cursor = categoriesCollection.find(query)
            const categories = await cursor.toArray();
            res.send(categories);
        })

        app.get('/avertised', async (req, res) => {
            const query = { advertise: "yes" };
            const products = await booksCollection.find(query).toArray();
            res.send(products);
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

        
        // API for All Registered Users Ends //
        
        
        // Sellers CURD Operatin API Starts // 

        app.get('/myproducts/:email',async(req,res)=>{
            const email = req.params.email;
            const filter = { seller_email: email};
            const result = await booksCollection.find(filter).toArray();
            res.send(result);
        })


        app.put('/myproducts/advertise/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: (ObjectId(id)) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertise: "yes"
                }
            }
            const result = await booksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
            
        })

        app.put('/myproducts/status/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: (ObjectId(id)) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertise: "no", available: "no",
                }
            }
            const result = await booksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
            
        })
        
        
        app.delete('/books/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: (ObjectId(id)) }
            const result = await booksCollection.deleteOne(filter);
            res.send(result);
        })
      

        app.post('/books',async(req,res)=>{
            const book = req.body;
            const result = await booksCollection.insertOne(book);
            res.send(result);
        })


        // Sellers CURD Operatin API Ends //

        //code to update particular fields in database
        // app.get('/edit', async (req, res) => {
        //         const filter = {seller_status: "nay@gmail.com"}
        //         const options = { upsert: true }
        //         const updatedDoc = {
        //             $set: {
        //                 seller_status: seller_email
        //             }
        //         }
        //         const result = await usersCollection.updateOne(filter, updatedDoc, options);
        //         res.send(result);
        //     })

    }
    
    finally{
    
    }
}

run().catch(error=> console.error(error));

app.get('/',(req, res) => {
    res.send('good books server is running')
})



app.listen(port,()=> console.log(`good books server running on ${port}`))