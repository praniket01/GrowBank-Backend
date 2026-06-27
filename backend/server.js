import app from './src/app.js'
import connectToDb from './src/config/db.js';

connectToDb();

app.listen(8000, ()=>{
    console.log('Listening on port 8000');
})