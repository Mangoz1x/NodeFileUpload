//Import librarys needed
const dotenv = require('dotenv');
const sql = require("mysql");
const {promisify} = require('util');

//Get data from env file
dotenv.config({path: 'api/.env'});

//Connect to mysql database in current file
const connect = () => sql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT
});

//Insert into table
exports.insert = async function insertQuery(db, object) {
    try {
        const selfConnect = connect();
        const insertResult = await promisify(selfConnect.query.bind(selfConnect))("INSERT INTO " + db + " SET ?", object); 
        
        selfConnect.end();

        return insertResult;
    } catch (error) {console.log(error);}
} 

//Delete from table using one param
exports.delete = async function deleteQuery(db, params) {
    try {
        const selfConnect = connect();
        let objectArray = Object.keys(params).map((key) => ({[key]: params[key]}));

        const deleteMultipleResult = await promisify(selfConnect.query.bind(selfConnect))("DELETE FROM " + db + " WHERE ? " + "AND ? ".repeat(objectArray.length - 1), objectArray); 
        selfConnect.end();
        
        return deleteMultipleResult;
    } catch (error) {console.log(error);}
}

//Select from table using one param
exports.select = async function selectQuery(db, params) {
    try {
        const selfConnect = connect();
        let objectArray = Object.keys(params).map((key) => ({[key]: params[key]}));
    
        const deleteMultipleResult = await promisify(selfConnect.query.bind(selfConnect))("SELECT * FROM " + db + " WHERE ? " + "AND ? ".repeat(objectArray.length - 1), objectArray);
        selfConnect.end();

        return deleteMultipleResult;
    } catch (error) {console.log(error);}
}

//Update from table using one param
exports.update = async function updateQuery(db, setColumns, params) {
    try {
        const selfConnect = connect();
        let objectArray = Object.keys(params).map((key) => ({[key]: params[key]}));
    
        const updateResult = await promisify(selfConnect.query.bind(selfConnect))("UPDATE " + db + " SET ? WHERE ? " + "AND ? ".repeat(objectArray.length - 1), [setColumns, ...objectArray]);
        selfConnect.end();

        return updateResult;
    } catch (error) {console.log(error);}
} 

// IN TESTING
//Select from table using ands and ors
//ands and ors
exports.selectany = async function selectQuery(db, params, orparams) {
    try {
        const selfConnect = connect();
        let objectArray = Object.keys(params).map((key) => ({[key]: params[key]}));
        let orobjectArray = (orparams.length) ? orparams : Object.keys(orparams).map((key) => ({[key]: orparams[key]}));
        let totleObjectArray = objectArray.slice();
        orobjectArray.forEach((v) => {totleObjectArray.push(v)});
        let theQuery = "SELECT * FROM " + db + " WHERE ( ? " + "AND ? ".repeat(objectArray.length - 1) + ") AND ( ? " + "OR ? ".repeat(orobjectArray.length - 1) + ")";
        const deleteMultipleResult = await promisify(selfConnect.query.bind(selfConnect))(theQuery, totleObjectArray);
        selfConnect.end();

        return deleteMultipleResult;
    } catch (error) {console.log(error);}
}


//delete from table using ands and ors
//ands and ors
exports.deleteany = async function selectQuery(db, params, orparams) {
    try {
        const selfConnect = connect();
        let objectArray = Object.keys(params).map((key) => ({[key]: params[key]}));
        let orobjectArray = (orparams.length) ? orparams : Object.keys(orparams).map((key) => ({[key]: orparams[key]}));
        let totleObjectArray = objectArray.slice();
        orobjectArray.forEach((v) => {totleObjectArray.push(v)});
        let theQuery = "DELETE * FROM " + db + " WHERE ( ? " + "AND ? ".repeat(objectArray.length - 1) + ") AND ( ? " + "OR ? ".repeat(orobjectArray.length - 1) + ")";
        const deleteMultipleResult = await promisify(selfConnect.query.bind(selfConnect))(theQuery, totleObjectArray);
        selfConnect.end();

        return deleteMultipleResult;
    } catch (error) {console.log(error);}
}
