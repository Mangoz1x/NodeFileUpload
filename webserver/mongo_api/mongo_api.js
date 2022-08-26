const { MongoClient } = require("mongodb");
const fs = require("fs");

let mongo_api_data = fs.readFileSync("./mongo_api/connect_data.json");
mongo_api_data = JSON.parse(mongo_api_data);

const uri = `mongodb+srv://Mangoz:${mongo_api_data.password}@cluster0.1aecl.mongodb.net/`;

// await api.insertOne({ JSON: "FIELDS" }, "DATABASE", "COLLECTION/TABLE");
exports.insertOne = (obj, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).insertOne(obj, (err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });
            });
        });
    } catch (err) {
        return err;
    }
};

// await api.insertMany([{ JSON: "FIELDS" }, { JSON: "FIELDS" }, { JSON: "FIELDS" }], "DATABASE", "COLLECTION/TABLE");
exports.insertMany = (arr, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).insertMany(arr, (err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });
            });
        });
    } catch (err) {
        return err;
    }
}

// await api.findOne({ JSON: "FIELDS" }, "DATABASE", "COLLECTION/TABLE");
exports.findOne = (obj_query, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).findOne(obj_query, (err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });

            });
        });
    } catch (err) {
        return err;
    }
};

// await api.query({ JSON: "FIELDS" }, "DATABASE", "COLLECTION/TABLE");
exports.query = (obj_query, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).find(obj_query).toArray((err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });

            });
        });
    } catch (err) {
        return err;
    }
};

// await api.queryLimit({ JSON: "FIELDS" }, 10, "DATABASE", "COLLECTION/TABLE");
//                                          ^^ WILL ONLY RETURN 10 RESULTS
exports.queryLimit = (obj_query, result_limit, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).find(obj_query).limit(result_limit).toArray((err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });

            });
        });
    } catch (err) {
        return err;
    }
};

// await api.sort({ JSON: "FIELDS" }, { FIELD_KEY: 1 }, "DATABASE", "COLLECTION/TABLE");
exports.sort = (obj_query, sort_obj, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).find(obj_query).sort(sort_obj).toArray((err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });
            });
        });
    } catch (err) {
        return err;
    }
};

// api.deleteOne({ JSON_KEY: "VALUE" }, "DATABASE", "COLLECTION/TABLE");
exports.deleteOne = (obj_query, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).deleteOne(obj_query, (err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });
            });
        });
    } catch (err) {
        return err;
    }
}


// api.deleteMany({ JSON_KEY: "/^O/" }, "DATABASE", "COLLECTION/TABLE"); 
//                               ^ delete everything that starts with the letter "O"
exports.deleteMany = (obj_query, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).deleteMany(obj_query, (err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });
            });
        });
    } catch (err) {
        return err;
    }
};

// api.updateOne({ FIND_BY_KEY: "WHERE_VALUE_?" }, { $set: { KEY: "VALUE", KEY: "VALUE" } }, "DATABASE", "COLLECTION/TABLE");
exports.updateOne = (obj_query, new_obj_values, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).updateOne(obj_query, new_obj_values, (err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });
            });
        });
    } catch (err) {
        return err;
    }
};

// api.updateMany({ FIND_BY_KEY: "/^S/" }, { $set: { KEY: "VALUE" } }, "DATABASE", "COLLECTION/TABLE");
//                                ^^^^ update everything that starts with the letter "S"
exports.updateMany = (obj_query, new_obj_values, c_db, table) => {
    try {
        return new Promise((resolve, reject) => {
            MongoClient.connect(uri, (err, db) => {
                const dbo = db.db(c_db);

                dbo.collection(table).updateMany(obj_query, new_obj_values, (err, res) => {
                    if (err) return err;
                    db.close();

                    resolve(res);
                });
            });
        });
    } catch (err) {
        return err;
    }
};

module.exports;