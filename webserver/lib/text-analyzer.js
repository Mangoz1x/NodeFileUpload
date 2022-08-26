const characters = require("./analyzer/characters.json");
const dictionary = require("./analyzer/dictionary.json");
const citie_dictionary = require("./analyzer/cities.json");
const mongo = require("./../mongo_api/mongo_api");
const crypto = require("crypto");
const fs = require("fs");
const axios = require("axios").default;

global.advancedSearchRequests = 0;

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },

    enumerable: false
});

exports.advancedSearch = async (word) => {
    if (!(word || word.split(" ").join("") == "")) return { err: "invalid-word" };
    if (advancedSearchRequests > 2000) return { err: "request-day-limit-reached" };

    advancedSearchRequests++;

    let options = {
        method: 'GET',
        url: `https://wordsapiv1.p.rapidapi.com/words/${word}`,
        headers: {
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
            'x-rapidapi-key': 'a009aa9cabmshd4abda3818f2c09p16903bjsn96d28deff6d7'
        }
    };
    
    try {
        let response = await axios.request(options)
        return response?.data;
    } catch (err) {
        return { err: "fetch-err" };
    }
};

exports.analyze = async (text, userid, session, textid) => {
    let parsedText = text?.data?.toString();
    
    let splitArr = {
        original: parsedText,
        spaces: parsedText.split(" "),
        dashes: parsedText.split("-"),
    }
    
    parsedText = "";
    
    let infoArr = [];
    let definitionArr = [];
    let placesArr = [];

    for (let i = 0; i < splitArr?.spaces?.length; i++) {      
        let propper_split = splitArr.spaces[i];
        propper_split = propper_split.split(".").join("");
        propper_split = propper_split.split(",").join("");
        propper_split = propper_split.split(";").join("");
        propper_split = propper_split.split(":").join("");
        propper_split = propper_split.toLowerCase();

        let spaces = splitArr?.spaces?.[i]?.toLowerCase();
        let wordExists = false;
        let cityExists = false;

        let oneTo = splitArr?.spaces?.[i]?.toLowerCase();
        let twoTo = `${splitArr?.spaces?.[i]?.toLowerCase()} ${splitArr?.spaces?.[i+1]?.toLowerCase()}`;
        let threeTo = `${splitArr?.spaces?.[i]?.toLowerCase()} ${splitArr?.spaces?.[i+1]?.toLowerCase()} ${splitArr?.spaces?.[i+2]?.toLowerCase()}`;
        let fourTo = `${splitArr?.spaces?.[i]?.toLowerCase()} ${splitArr?.spaces?.[i+1]?.toLowerCase()} ${splitArr?.spaces?.[i+2]?.toLowerCase()} ${splitArr?.spaces?.[i+3]?.toLowerCase()}`;
        let citySplit = [oneTo, twoTo, threeTo, fourTo];

        for (let z = 0; z < definitionArr?.length; z++) {
            if (definitionArr?.[z]?.word == spaces) wordExists = true;
        }
        
        if (spaces in dictionary && wordExists == false) {
            definitionArr.push({
                word: spaces,
                definition: dictionary?.[spaces] 
            });
        }

        for (let a = 0; a < citySplit?.length; a++) {
            for (let z = 0; z < placesArr?.length; z++) {
                placesArr[z].city.name = placesArr?.[z]?.city?.name?.toLowerCase();
                if (placesArr?.[z]?.city?.name == citySplit?.[a]) cityExists = true;
            }
    
            if (citySplit?.[a] in citie_dictionary && cityExists == false && !(citySplit?.[a] in dictionary)) {
                placesArr.push({
                    city: citie_dictionary?.[citySplit?.[a]]
                });
            }
        }
    }

    return {
        info: infoArr,
        definitions: definitionArr, 
        places: placesArr
    };
};

exports.delComment = async (commentid, userid, token, textid) => {
    if (!(commentid || userid || token || textid)) return { err: "invalid-data" };
    
    await mongo.deleteOne({ 
        commentId: commentid, 
        userId: userid,
        textId: textid 
    }, "rocket-fileupload", "comments");

    return {
        status: "deleted",
        comment: commentid 
    };
};

exports.setComment = async (comment, userid, token, textid) => {
    if (!(comment || userid || token || textid)) return { err: "invalid-data" };
    let randId = crypto.randomBytes(Math.floor(Math.random() * (128 - 58) + 58)).toString("hex");

    await mongo.insertOne({ 
        comment: comment, 
        userId: userid,
        textId: textid,  
        commentId: randId
    }, "rocket-fileupload", "comments");

    return {
        status: "set",
        comment: comment 
    };
};

exports.comments = async (userid, token, textid) => {
    if (!(userid || token || textid)) return { err: "invalid-data" };

    let result = await mongo.queryLimit({
        userId: userid,
        textId: textid
    }, 150, "rocket-fileupload", "comments");

    return {
        result 
    };
};

setInterval(() => {
    advancedSearchRequests = 0;
}, 1000 * 60 * 60 * 24)

module.exports;