function addStyles(obj, elm) {
    let keys = Object.keys(obj),
        values = Object.values(obj);

    for (let i = 0; i < keys.length; i++) {
        elm.style[keys[i]] = values[i];
    }
};

function fullScreenPopUp() {
    if (document.getElementsByClassName("js-fullscreen-popup")?.length > 0) return;

    let container = document.createElement("div");
    container.classList.add("js-fullscreen-popup");

    addStyles({
        position: "fixed",
        backgroundColor: "rgba(0,0,0,0.7)",
        width: "100vw",
        height: "100vh",
        top: "0",
        zIndex: "99999999999999999999999999",
        transition: "0.3s",
        opacity: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }, container);

    container.setAttribute("data-clickaction", "close");
    container.addEventListener("click", (e) => {
        for (let i = 0; i < e?.path?.length; i++) {
            if(e?.path?.[i]?.dataset?.clickaction != "close") return;
            closeFullScreen();
        };
    });

    setTimeout(() => {
        container.style.opacity = "1";
    }, 50);

    document.body.appendChild(container);
}

function closeFullScreen() {
    let container = document.getElementsByClassName("js-fullscreen-popup");
    if (container?.length < 1) return;

    for (let i = 0; i < container.length; i++) {
        container[i].style.opacity = "0";
        container[i].remove();
    }
}

function addFolderContent() {
    let container = document.getElementsByClassName("js-fullscreen-popup")?.[0];
    if (!container) return;

    let div = document.createElement("div"),
        inner = document.createElement("div"),
        h1 = document.createElement("h1"),
        input = document.createElement("input"),
        button = document.createElement("button");

    h1.textContent = "New Folder";
    button.textContent = "Create";

    input.placeholder = "Folder name";

    addStyles({
        width: "fit-content",
        height: "fit-content",
        display: "flex",
        backgroundColor: "#222",
        borderRadius: "5px",
        padding: "20px 40px"
    }, div);

    addStyles({
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column"
    }, inner);

    addStyles({
        color: "#eee",
        marginBottom: "10px"
    }, h1);

    addStyles({
        backgroundColor: "#333",
        padding: "5px 10px",
        border: "1px solid #444",
        borderRadius: "2px",
        color: "#eee",
        width: "300px"
    }, input);

    addStyles({
        marginTop: "10px",
        width: "fit-content",
        height: "fit-content",
        padding: "7px 14px",
        marginLeft: "auto",
        border: "1px solid #444",
        backgroundColor: "#333",
        color: "#eee",
        borderRadius: "2px"
    }, button);

    button.addEventListener("click", () => { 
        createFolder(input?.value) 
        closeFullScreen();
    });

    div.appendChild(inner);
    inner.appendChild(h1);
    inner.appendChild(input);
    inner.appendChild(button);    
    container.appendChild(div);
}

function init() {
    let trigger = document.getElementsByClassName("fullScreenTrigger");
    let listeners = ["click"];

    for (let i = 0; i < trigger?.length; i++) { listeners.forEach((list, a) => {
        trigger[i]?.addEventListener(list, (e) => {
            fullScreenPopUp();
            addFolderContent();
        });
    })};  
}

window.addEventListener("load", init, true);