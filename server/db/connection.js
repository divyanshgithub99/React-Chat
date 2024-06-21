const mongoose = require('mongoose');

const url = `mongodb+srv://divyanshbajpai10:Divmongodb99@cluster0.jkte1p0.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB')).catch((e)=> console.log('Error', e))