let analyzedWords = [];
let selected_tab;

const makeCustomFetch = async (data, uri, customurl) => {
    let load = data;
    
    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }
    
    if (customurl == false) {
        let tUrl = window.location.protocol == "http:" 
            ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
            : `${window.location.protocol}//${window.location.hostname}`;

        let response = await fetch(`${tUrl}${uri}`, load_data)
        response = await response.json();
        return response;
    } else {
        let response = await fetch(`${public_fetch_url}/${uri}`, load_data)
        response = await response.text();
        return response;
    }
};


const clearAnalyzeResults = () => {
    aResults.innerHTML = "";
    analyzerSearch.style.display = "block";
    addComment.style.display = "none";
}

const sendText = async () => {
    if (selected_tab == "comment") return;
    if (!(document.getElementById("aResults"))) return;

    aResults.innerHTML = "";
    analyzedWords = [];
    let doc = document.getElementById("text-editable-doc");

    let nblob = new Blob([doc?.textContent], { type: "text/plain" });
    const file = new File([nblob], `untitled.txt`, { type: "text/plain", lastModified: new Date() });

    let data = new FormData();
    data.append("file", file);
    data.append("textid", returnParams()?.docid);
    data.append("userid", getCookie("userId"));
    data.append("session", getCookie("token"));

    let load_data = {
        method: 'POST',
        body: data
    }

    let response = await fetch("/analyze-text", load_data);
    response = await response.json();

    if (response?.result?.length == 0) {
        let div = document.createElement("h2");
        div.textContent = "No results";

        div.classList.add("no-results-h2");

        return aResults.appendChild(div);
    }

    if (selected_tab == "places") {
        aResults.innerHTML = "";

        for (let i = 0; i < response?.result?.places?.length; i++) {
            let item = response?.result?.places?.[i];
            
            let div = document.createElement("div");
            div.classList.add("analyzer-item");
        
            analyzedWords.push({
                word: item?.city?.name,
                elem: div  
            });

            let ltype = document.createElement("h3");
            ltype.textContent = `City`;

            let label = document.createElement("label");
            label.textContent = `City: ${item?.city?.name}`;
            label.classList.add("item-word");

            let wordNum = document.createElement("label");
            wordNum.textContent = `Country: ${item?.city?.country}`;
            wordNum.classList.add("text-readable");

            let border = document.createElement("div");
            border.classList.add("analyzer-border");

            div.appendChild(ltype);
            div.appendChild(label);
            div.appendChild(wordNum);
            div.appendChild(border);
            aResults.appendChild(div);
        }

        return;
    }

    for (let i = 0; i < response?.result?.definitions?.length; i++) {
        let item = response?.result?.definitions?.[i];
        
        let div = document.createElement("div");
        div.classList.add("analyzer-item");
       
        analyzedWords.push({
            word: item?.word,
            elem: div  
        });

        let ltype = document.createElement("h3");
        ltype.textContent = `Definition`;

        let label = document.createElement("label");
        label.textContent = `Word: ${item?.word}`;
        label.classList.add("item-word");

        let wordNum = document.createElement("label");
        wordNum.textContent = `Definition: ${item?.definition}`;
        wordNum.classList.add("text-readable");

        let border = document.createElement("div");
        border.classList.add("analyzer-border");

        div.appendChild(ltype);
        div.appendChild(label);
        div.appendChild(wordNum);
        div.appendChild(border);
        aResults.appendChild(div);
    }
};

const filterResults = (word) => {
    let wordObj = [];

    for (let i = 0; i < analyzedWords?.length; i++) {
        if (analyzedWords?.[i]?.word.includes(word) || analyzedWords?.[i]?.word == word) {
            wordObj.push(analyzedWords?.[i]);
        }
    }

    if (wordObj?.length == 0) {
        for (let i = 0; i < document.getElementsByClassName("analyzer-item")?.length; i++) {
            document.getElementsByClassName("analyzer-item")[i].style.display = "none";
        }

        if (document.getElementsByClassName("no-results-h2")?.length > 0) {
            let el = document.getElementsByClassName("no-results-h2");

            for (let i = 0; i < el?.length; i++) {
                el[i].remove();
            }
        }

        let div = document.createElement("h2");
        div.textContent = "No results";

        div.classList.add("no-results-h2");
        return aResults.appendChild(div);
    }

    if (document.getElementsByClassName("no-results-h2")?.length > 0) {
        let el = document.getElementsByClassName("no-results-h2");

        for (let i = 0; i < el?.length; i++) {
            el[i].remove();
        }
    }

    for (let i = 0; i < document.getElementsByClassName("analyzer-item")?.length; i++) {
        for (let z = 0; z < wordObj.length; z++) {
            wordObj[z].elem.style.display = "flex";

            if (!(document.getElementsByClassName("analyzer-item")?.[i] == wordObj?.[z]?.elem)) {
                document.getElementsByClassName("analyzer-item")[i].style.display = "none";
            }
        }
    }
}

const deleteComment = async (commentId, elem) => {
    elem.style.display = "none";
    
    let s_data = {
        textid: returnParams()?.docid,
        userid: getCookie("userId"),
        session: getCookie("token"),
        comment: commentId,
        sType: "delComment"
    };

    let res = await makeCustomFetch(s_data, "/analyze-text", false);
    if (!(res?.result?.status == "deleted")) {
        elem.style.display = "flex";
        console.log("Failed to delete comment");
        return;
    } else {
        elem.remove();
    }

    if (document.getElementsByClassName("comment-item")?.length == 0) {
        if (document.getElementsByClassName("no-results-h2")?.length > 0) {
            let el = document.getElementsByClassName("no-results-h2");

            for (let i = 0; i < el?.length; i++) {
                el[i].remove();
            }
        }

        let div = document.createElement("h2");
        div.textContent = "No comments yet";

        div.classList.add("no-results-h2");
        return aResults.appendChild(div);
    }
}

const setComment = async (v) => {
    let s_data = {
        textid: returnParams()?.docid,
        userid: getCookie("userId"),
        session: getCookie("token"),
        comment: v,
        sType: "setComment"
    };

    let res = await makeCustomFetch(s_data, "/analyze-text", false);
    if (res?.result?.status == "set") {
        addComment.value = "";
        getComments();
    } else {
        console.log("Failed to set comment");
    }
}

const getComments = async () => {
    analyzerSearch.style.display = "none";
    addComment.style.display = "block";

    let s_data = {
        textid: returnParams()?.docid,
        userid: getCookie("userId"),
        session: getCookie("token"),
        sType: "getComments"
    };

    let res = await makeCustomFetch(s_data, "/analyze-text", false);
    aResults.innerHTML = "";

    if (res?.result?.result?.length == 0) {
        if (document.getElementsByClassName("no-results-h2")?.length > 0) {
            let el = document.getElementsByClassName("no-results-h2");

            for (let i = 0; i < el?.length; i++) {
                el[i].remove();
            }
        }

        let div = document.createElement("h2");
        div.textContent = "No comments yet";

        div.classList.add("no-results-h2");
        return aResults.appendChild(div);
    }

    for (let i = 0; i < res?.result?.result?.length; i++) {
        let item = res?.result?.result?.[i];

        let div = document.createElement("div");
        let commentDiv = document.createElement("div");
        let delDiv = document.createElement("div");

        commentDiv.textContent = `${item?.comment}`;
        commentDiv.setAttribute("commentId", res?.result?.result?.[i]?.["commentId"]);
        div.classList.add("comment-item");
        commentDiv.classList.add("comment-item-text");
        delDiv.innerHTML = `<i class="fa fa-trash" aria-hidden="true"></i>`;
        delDiv.classList.add("delete-comment");
        
        delDiv.addEventListener("click", async () => {
            deleteComment(res?.result?.result?.[i]?.["commentId"], div);
        });

        div.appendChild(commentDiv);
        div.appendChild(delDiv);
        aResults.appendChild(div);
    }
};

const setSideScroll = () => {
    const buttonRight = document.getElementById('slideRight');
    const buttonLeft = document.getElementById('slideLeft');

    buttonRight?.addEventListener("click", () => {
        if (buttonLeft?.style?.display == "none") buttonLeft.style.display = "block";
        let div = document.getElementById('analyze_filters');

        if (div?.scrollLeft + 90 >= (div?.scrollWidth - div?.offsetWidth)) {
            buttonRight.style.display = "none";
            div.scrollLeft = (div?.scrollWidth - div?.offsetWidth) + 78;
        } else {
            div.scrollLeft += 80;
        }
    });

    buttonLeft?.addEventListener("click", () => {
        if (buttonRight?.style?.display == "none") buttonRight.style.display = "block";
        let div = document.getElementById('analyze_filters');

        if (div?.scrollLeft - 90 <= 20) {
            buttonLeft.style.display = "none";
            div.scrollLeft = 0;
        } else {
            div.scrollLeft -= 80;
        }
    });

    if (document.getElementById("s_definitions")) s_definitions?.addEventListener("click", () => {
        selected_tab = "definitions";
        clearAnalyzeResults();
        sendText();
    });

    if (document.getElementById("s_comments")) s_comments?.addEventListener("click", () => {
        selected_tab = "comment";
        clearAnalyzeResults();
        getComments();
    });

    if (document.getElementById("s_people")) s_people?.addEventListener("click", () => {
        clearAnalyzeResults();
        
    });

    if (document.getElementById("s_props")) s_props?.addEventListener("click", () => {
        clearAnalyzeResults();
        
    });

    if (document.getElementById("s_places")) s_places?.addEventListener("click", () => {
        selected_tab = "places";
        clearAnalyzeResults();
        sendText();
    });
};

if (document.getElementById("analyzerSearch")) analyzerSearch?.addEventListener("keyup", (e) => {
    let v = analyzerSearch?.value;
    filterResults(v);
});

document.getElementById("text-editable-doc")?.addEventListener("keydown", (e) => {
    sendText();
});

window.addEventListener("load", () => {
    setSideScroll();

    if (document.getElementById("addComment")) addComment?.addEventListener("keyup", async (e) => {
        if (!(e?.keyCode == 13 || e?.key == "Enter")) return;
        
        await setComment(addComment?.value);
    });
});

setTimeout(async () => {
    sendText();
}, 500);

