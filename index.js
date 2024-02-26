import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connection from './database/connection.js';
dotenv.config();
import User  from "./User.js";
import Validation from "./Validation.js";

connection();
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.send('Hello World');

});

app.get('/insert',async (req, res) => {
    const formData = {
        username: 'aa',
        email: 'test@gmail.com',
    };

    const validationRules = {
        username: 'required|min:2|max:20',
        email: 'required|email|unique:users,email'

    };

    const validator = new Validation();
    await validator.validation(validationRules,formData);
    console.log(validator.isValid() ? 'Data is valid' : 'Data is not valid');

    if(validator.isValid()){
       console.log('Data is valid');
    }else{
        console.log(validator.getErrors());

    }

    res.send('Data inserted');

});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});