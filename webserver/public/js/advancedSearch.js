const openAdvancedSearch = () => {
    let container = document.getElementById("advancedSearchContainer");

    if (container.style.display == "none") {
        container.style.display = "flex";
    } else {
        container.style.display = "none";
    }
};

const checkClick = (e) => {
    if (!e?.path) return;

    if (e?.path?.[0]?.classList?.contains("advanced-search-container")) {
        openAdvancedSearch();
    } else {
        return false;
    }
}

const loadWord = (data) => {
    let elems = {
        word: document.getElementById("apiWord"),
        definition: document.getElementById("apiDefinition"),
        type: document.getElementById("apiType"),
        synonyms: document.getElementById("apiSynonyms"),
        typeOf: document.getElementById("apiTypeOf"),
        hasTypes: document.getElementById("apiHasTypes"),
        derivation: document.getElementById("apiDerivation"),
        syllables: document.getElementById("apiSyllables"),
        pronunciation: document.getElementById("apiPronunciation")
    };
    
    if (data?.result?.err) {
        elems.word.style.color = "red";
        elems.word.textContent = `ERR: ${data?.result?.err}`;

        return;
    }

    let results = data?.result; 
    let resultOne = data?.result?.results?.[0];
    let synonymsStr = "";
    let typeOfStr = "";
    let hasTypesStr = "";
    let derivationStr = "";
    let sylableStr = "";
    
    for (let i = 0; i < resultOne?.synonyms?.length; i++) {
        if ((i+1) == resultOne?.synonyms?.length) 
            synonymsStr += `${resultOne?.synonyms?.[i]}`;
        else 
            synonymsStr += `${resultOne?.synonyms?.[i]}, `;
    }
    
    for (let i = 0; i < resultOne?.typeOf?.length; i++) {
        if ((i+1) == resultOne?.typeOf?.length) 
            typeOfStr += `${resultOne?.typeOf?.[i]}`;
        else 
            typeOfStr += `${resultOne?.typeOf?.[i]}, `;
    }
    
    for (let i = 0; i < resultOne?.hasTypes?.length; i++) {
        if ((i+1) == resultOne?.hasTypes?.length) 
            hasTypesStr += `${resultOne?.hasTypes?.[i]}`;
        else 
            hasTypesStr += `${resultOne?.hasTypes?.[i]}, `;
    }
    
    for (let i = 0; i < resultOne?.derivation?.length; i++) {
        if ((i+1) == resultOne?.derivation?.length) 
            derivationStr += `${resultOne?.derivation?.[i]}`;
        else
            derivationStr += `${resultOne?.derivation?.[i]}, `;
    }

    for (let i = 0; i < results?.syllables?.list?.length; i++) {
        if ((i+1) == results?.syllables?.list?.length) 
            sylableStr += `${results?.syllables?.list?.[i]}`;
        else
            sylableStr += `${results?.syllables?.list?.[i]}, `;
    }

    elems.word.textContent = results?.word;
    elems.definition.textContent = resultOne?.definition;
    elems.type.textContent = resultOne?.partOfSpeech;
    elems.synonyms.textContent = synonymsStr;
    elems.typeOf.textContent = typeOfStr;
    elems.hasTypes.textContent = hasTypesStr;
    elems.derivation.textContent = derivationStr;
    elems.syllables.textContent = sylableStr;
    elems.pronunciation.textContent = results?.pronunciation?.all;
};

const requestWord = async (word) => {  
    let load = {
        userid: getCookie("userId"),
        session: getCookie("token"),
        advancedSearch: word,
        sType: "advancedSearch"
    };
    
    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }
    
    let tUrl = window.location.protocol == "http:" 
        ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
        : `${window.location.protocol}//${window.location.hostname}`;

    let response = await fetch(`${tUrl}/analyze-text`, load_data)
    response = await response.json();
    loadWord(response);
};

const searchQuery = () => {
    let input = document.getElementById("advanced-search-word");
    
    if (!(input?.value) || input?.value.split(" ").join("") == "") return;
    requestWord(input?.value);
};

window.addEventListener("load", () => {
    let input = document.getElementById("advanced-search-word");
    let btn = document.getElementById("manual-submit-search-word");
    let container = document.getElementById("advancedSearchContainer");

    container?.addEventListener("click", checkClick);

    input?.addEventListener("keyup", (e) => {
        if (!(e?.keyCode == 13 || e?.key == "Enter")) return;
        searchQuery();
    });

    btn?.addEventListener("click", () => {
        searchQuery();
    });
});