async function updatePublicityFetch(publicity, fileid) {
    let newPub = publicity;

    let load = {
        userid: getCookie("userId"),
        session: getCookie("token"),
        newPublicity: newPub,
        fileid: fileid
    }
    
    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }
    
    let response = await fetch(`/update-publicity`, load_data)
    response = await response.json();
    return response;
}

function addPublicityEventListener(item, fileid) { 
    item.onchange = async () => {
        await updatePublicityFetch(item?.value, fileid);
    };
}

function getPublicity(item) {
    return item?.getAttribute("publicity");
}

function setPublicity(publicity) {
    let selector = document.getElementById("selector_stat");
    selector.value = publicity;
} 

function changePublicity(item) {
    getPublicity(item);
}