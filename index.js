const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
var cookieParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 5000
//middleware
app.use(express.json())
app.use(cookieParser())

app.use(cors({

    origin: ['http://localhost:5173', 'https://online-group-study-86949.web.app', 'https://online-group-study-86949.firebaseapp.com'],
    credentials: true
}))

//verify middleware
const varifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    console.log("token middleware:", req.cookies.token)
    if (!token) {
        return res.status(401).send({ messages: 'unauthorized access' })
    }
    jwt.verify(token, process.env.JWT_Secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ messages: "unauthorized access" })
        }
        req.user = decoded;
        next()
    })
    // next()
}

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

        //auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log("jwt token:", user)
            var token = jwt.sign(user, process.env.JWT_Secret, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true })
            console.log(token)
        })
        app.post('/logout', async (req, res) => {
            const user = req.body;
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
            console.log('logout', user)
        })
        //services related api
        
        app.post('/createAssignment', async (req, res) => {
            const newAssignment = req.body;
            const result = await onlineStudyCollection.insertOne(newAssignment)
            console.log(result)
            res.send(result)
        })
        app.get('/createAssignment', async (req, res) => {
            const result = await onlineStudyCollection.find()
                .toArray();
            console.log(result)
            res.send(result)
        })
        app.get('/pagination', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            console.log(page, size)
            console.log(req.query)
            const result = await onlineStudyCollection.find()
                .skip(page * size)
                .limit(size)
                .toArray();
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
                    date: data.date,
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

        app.post('/submitedAssignment', async (req, res) => {
            const takeAssignmentDetail = req.body;

            const result = await takeAssignmentCollection.insertOne(takeAssignmentDetail)
            console.log(result)
            res.send(result);
        })
        //verify token submited assignment
        app.get('/submitedAssignment', varifyToken, async (req, res) => {
            const email = req.query.email
            const user = req.user.email
            console.log("login:", email)
            console.log("token:", user)

            if (user !== email) {
                return res.status(403).send({ messages: "forbiden" })
            }
            const result = await takeAssignmentCollection.find().toArray()
            console.log(result)
            res.send(result);
        })
        app.get('/submitedAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await takeAssignmentCollection.findOne(query)
            console.log(result)
            res.send(result);
        })

        app.put('/submitedAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const updatedMark = req.body
            const filter = { _id: new ObjectId(id) };

            const options = { upsert: true };
            // Specify the update to set a value for the plot field
            const updateDoc = {
                $set: {
                    feedBack: updatedMark.feedBack,
                    giveMark: updatedMark.giveMark,
                    status: updatedMark.status
                },
            };
            const result = await takeAssignmentCollection.updateOne(filter, updateDoc, options);
            console.log(result)
            res.send(result);
        })
        //varifytoken jwt my assignment
        app.get('/myAssignment', varifyToken, async (req, res) => {
            console.log('token owner info', req.user)
            const email = req.query.email
            const user = req.user.email
            console.log("login:", email)
            console.log("token:", user)

            if (user !== email) {
                return res.status(403).send({ messages: "forbiden" })
            }
            const query = { userEmail: email }
            const result = await takeAssignmentCollection.find(query).toArray()
            console.log(result)
            res.send(result);
        })

        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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