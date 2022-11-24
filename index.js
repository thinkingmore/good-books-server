const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    
        // API path for running CURD operation
        app.get('/categories',async(req,res)=>{
            const query= {}
            const cursor = categoriesCollection.find(query)
            const categories = await cursor.toArray();
            res.send(categories);
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