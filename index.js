const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
//middleware
app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.25fgudl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // create connection dataBase and collection;
        const onlineStudyCollection = client.db('onlineStudy').collection('assignment')
        const takeAssignmentCollection = client.db('onlineStudy').collection('takeAssignment')

        app.post('/createAssignment', async (req, res) => {
            const newAssignment = req.body;
            const result = await onlineStudyCollection.insertOne(newAssignment)
            console.log(result)
            res.send(result)
        })
        app.get('/createAssignment', async (req, res) => {
            const result = await onlineStudyCollection.find().toArray();
            console.log(result)
            res.send(result)
        })
        app.get('/createAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await onlineStudyCollection.findOne(query);
            console.log(result)
            res.send(result)
        })

        app.delete('/createAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await onlineStudyCollection.deleteOne(query);
            console.log(result)
            res.send(result)
        })

        app.put('/createAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            // Specify the update to set a value for the plot field
            const updateDoc = {
                $set: {
                    title: data.title,
                    PhotoUrl: data.PhotoUrl,
                    assignmentLevel: data.assignmentLevel,
                    mark: data.mark,
                    discription: data.discription
                },
            };
            const result = await onlineStudyCollection.updateOne(filter, updateDoc, options);
            console.log(result)
            res.send(result);
        })
        // filter using level
        app.get('/getAssignmentUsingLevel', async (req, res) => {
            const level = req.query.assignmentLevel;
            const query = { assignmentLevel: level }
            console.log(query)
            console.log(level)
            // // let result=[]
            if (level === 'all') {
                const result = await onlineStudyCollection.find().toArray();
                console.log(result)
                res.send(result)

            } else {
                const result = await onlineStudyCollection.find(query).toArray();
                console.log(result)
                res.send(result)
            }
            // const cursor = onlineStudyCollection.find().toArray();
            // console.log(cursor)
            // res.send(cursor)

        })
        //take assignment

        app.post('/takeAssignment', async (req, res) => {
            const takeAssignmentDetail = req.body;
            const result = await takeAssignmentCollection.insertOne(takeAssignmentDetail)
            console.log(result)
            res.send(result);
        })

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('server is connected')
})


app.listen(port, () => {
    console.log("the running port is", port)
})