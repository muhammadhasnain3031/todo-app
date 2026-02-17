const express = require('express');
const path = require('path');
const {MongoClient, ObjectId} = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));


const app = express();
const PORT = 4000;

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const DATABASE = 'todoApp';
const COLLECTION = 'todos';

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');
app.get('/',(req,res)=>{
    res.render('form')
})
app.post('/add', async(req,res)=>{
    const {task, priority} = req.body;
    const collection = client.db(DATABASE).collection(COLLECTION);
    await collection.insertOne({task, priority})
    res.redirect('/');
})
app.get('/show-todos', async(req,res)=>{
    const collection = client.db(DATABASE).collection(COLLECTION);
    const todos = await collection.find({}).toArray();
    res.render('show-todos', {todos})
})
app.post('/delete', async(req,res)=>{
    const id = req.body.id;
    const collection = client.db(DATABASE).collection(COLLECTION);
    await collection.deleteOne({_id:new ObjectId(id)});
    res.redirect('/show-todos');
})
app.get('/edit/:id', async(req,res)=>{
    const id = req.params.id;
    const collection = client.db(DATABASE).collection(COLLECTION);
    const todo = await collection.findOne({_id:new ObjectId(id)});
    res.render('edit-todos', {todo})
})
app.post('/edit/:id', async(req,res)=>{
    const id = req.params.id;
    const { task, priority } = req.body;
    const collection = client.db(DATABASE).collection(COLLECTION);
    await collection.updateOne({_id:new ObjectId(id)},
        {$set : {task, priority}});
    res.redirect('/show-todos')
})

async function ConnectToDatabase() {
    try{
        await client.connect()
        console.log('connected to database')
    }
    catch(err){
        console.log(err)
    }
}
ConnectToDatabase()

app.listen(PORT,()=>{
    console.log(`app is running of port ${PORT}`)
})