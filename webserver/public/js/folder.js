function removeFolderContext() {
    for (let i = 0; i < document.getElementsByClassName("folder-context")?.length; i++) {
        let z = document.getElementsByClassName("folder-context");
        z[i].remove();
    };

    for (let i = 0; document.getElementsByClassName("folder-item")?.length; i++) {
        let z = document.getElementsByClassName("folder-item");
        if (!z[i]) return;

        z[i].style.boxShadow = "none";
    }
}

function addFolderContextListner(folder) {
    folder.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();

        removeFolderContext();

        let div = document.createElement("div");
        let button = document.createElement("button");

        div.classList.add("folder-context");

        let X = e?.clientX;
        let Y = e?.clientY;

        if (e.clientX + 220 > window.innerWidth) X = X - 220;

        div.style.left = `${X}px`;
        div.style.top = `${Y}px`;

        button.setAttribute("data-action", "delete");
        button.classList.add("folder-context-btn");
        button.textContent = "Delete";

        folder.style.boxShadow = "0px 0px 0px 2px dodgerblue";

        div.appendChild(button);
        document.body.appendChild(div);
    });
}

async function createFolder(name) {
    let load = {
        userid: getCookie("userId"),
        session: getCookie("token"),
        createFolder: true,
        name: name
    }
    
    let data = {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    };

    let f = await fetch(`/folder`, data);
    f = await f.json();

    renderFolders();
}

async function renderFolders() {
    let load = {
        userid: getCookie("userId"),
        session: getCookie("token")
    }
    
    let data = {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    };

    let f = await fetch(`/get-files`, data);
    f = await f.json();

    let con = document.getElementById("folderContainer");
    con.innerHTML = "";

    for (let i = 0; i < f?.folders?.length; i++) {
        let folder = document.createElement("div");
        folder.classList.add("folder-item");
        folder.innerText = f?.folders?.[i]?.name;

        addFolderContextListner(folder);
        con.appendChild(folder);
    }
}

window.addEventListener("load", () => {
    window.addEventListener("scroll", () => { removeFolderContext() });
    document.body.addEventListener("click", () => { removeFolderContext() });
    document.body.addEventListener("contextmenu", () => { removeFolderContext() });
});