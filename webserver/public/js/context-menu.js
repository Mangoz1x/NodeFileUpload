let context_menu_item_clicked;
let context_menu_multi_select = [];

function clearSelectData(e) {
    context_menu_multi_select = [];

    if (!(document.getElementsByClassName("file_div"))) return;
    let docFD = document.getElementsByClassName("file_div"); 

    for (let i = 0; i < docFD.length; i++) {
        docFD[i].style.boxShadow = "none";
    }

    if (e?.path?.[1]?.getAttribute("fileid")) {
        e.path[1].style.boxShadow = "0px 0px 0px 2px dodgerblue";
    } else if (e?.path?.[0]?.getAttribute("fileid")) {
        e.path[0].style.boxShadow = "0px 0px 0px 2px dodgerblue";
    }
}

function selectMultiElement() {
    if (!(document.getElementsByClassName("file_div"))) return;
    let docFD = document.getElementsByClassName("file_div"); 

    document.addEventListener("click", (e) => {
        if (e?.ctrlKey == false) clearSelectData(e); 
    });

    for (let i = 0; i < docFD.length; i++) {
        docFD[i].addEventListener("click", (e) => {
            if (e?.ctrlKey == false) return clearSelectData(e);

            docFD[i].style.boxShadow = "0px 0px 0px 2px dodgerblue";
            context_menu_multi_select.push(docFD[i]);
        });
    }
}

function contextMenu() {
    context_menu_item_clicked = "";
    "use strict";

    function clickInsideElement(e, className) {
        var el = e.srcElement || e.target;

        if (el.classList.contains(className)) {
            return el;
        } else {
            while (el = el.parentNode) {
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }

        return false;
    }

    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.clientX || e.pageX;
            posy = e.clientY || e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }

    var contextMenuClassName = "context-menu";
    var contextMenuItemClassName = "context-menu__item";
    var contextMenuLinkClassName = "context-menu__link";
    var contextMenuActive = "context-menu--active";

    var taskItemClassName = "file_div";
    var taskItemInContext;

    var clickCoords;
    var clickCoordsX;
    var clickCoordsY;

    var menu = document.querySelector("#context-menu");
    var menuItems = menu.querySelectorAll(".context-menu__item");
    var menuState = 0;
    var menuWidth;
    var menuHeight;
    var menuPosition;
    var menuPositionX;
    var menuPositionY;

    var windowWidth;
    var windowHeight;

    function init() {
        contextListener();
        clickListener();
        keyupListener();
        resizeListener();
    }

    function contextListener() {
        document.addEventListener("contextmenu", function (e) {
            taskItemInContext = clickInsideElement(e, taskItemClassName);

            try {
                for (let i = 0; i < e?.path?.length; i++) {        
                    if (context_menu_multi_select?.length != 0) {
                        document.getElementById("copy-context-btn").style.display = "none";
                        document.getElementById("edit-context-btn").style.display = "none";
                        document.getElementById("open-text").style.display = "none";
                        break;
                    }

                    clearSelectData(e);

                    if (e?.path?.[i]?.getAttribute("md5")) {
                        if (!(e?.path?.[i]?.getAttribute("mime").includes("image"))) {
                            document.getElementById("copy-context-btn").style.display = "none";
                            document.getElementById("image-expand").style.display = "none";
                        } else {
                            document.getElementById("copy-context-btn").style.display = "block";
                            document.getElementById("image-expand").style.display = "block";
                        }

                        if (!(e?.path?.[i]?.getAttribute("mime").includes("image"))) {
                            document.getElementById("edit-context-btn").style.display = "none";
                        } else {
                            document.getElementById("edit-context-btn").style.display = "block";
                        }

                        if (!(e?.path?.[i]?.getAttribute("mime").includes("text"))) {
                            document.getElementById("open-text").style.display = "none";
                        } else {
                            document.getElementById("open-text").style.display = "block";
                        }

                        if (!(e?.path?.[i]?.getAttribute("mime").includes("pdf"))) {
                            document.getElementById("pdfView").style.display = "none";
                        } else {
                            document.getElementById("pdfView").style.display = "block";
                        }

                        context_menu_item_clicked = e?.path?.[i];
                        e.path[i].style.boxShadow = "0px 0px 0px 2px dodgerblue";
                    }
                }
            } catch (err) { console.log("err-ln-83 : IGNORE"); }

            if (taskItemInContext) {
                e.preventDefault();
                toggleMenuOn();
                positionMenu(e);
            } else {
                taskItemInContext = null;
                toggleMenuOff();
            }
        });
    }

    function clickListener() {
        document.addEventListener("click", function (e) {
            var clickeElIsLink = clickInsideElement(e, contextMenuLinkClassName);

            if (clickeElIsLink) {
                e.preventDefault();
                menuItemListener(clickeElIsLink);
            } else {
                var button = e.which || e.button;
                if (button === 1) {
                    toggleMenuOff();
                }
            }
        });
    }

    function keyupListener() {
        window.onkeyup = function (e) {
            if (e.keyCode === 27) {
                toggleMenuOff();
            }
        }
    }

    function resizeListener() {
        window.onresize = function (e) {
            toggleMenuOff();
        };
    }

    function toggleMenuOn() {
        if (menuState !== 1) {
            menuState = 1;
            menu.classList.add(contextMenuActive);
        }
    }

    function toggleMenuOff() {
        if (menuState !== 0) {
            menuState = 0;
            menu.classList.remove(contextMenuActive);
        }
    }

    function positionMenu(e) {
        clickCoords = getPosition(e);
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        menuWidth = menu.offsetWidth + 4;
        menuHeight = menu.offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if ((windowWidth - clickCoordsX) < menuWidth) {
            menu.style.left = windowWidth - menuWidth + "px";
        } else {
            menu.style.left = clickCoordsX + "px";
        }

        if ((windowHeight - clickCoordsY) < menuHeight) {
            menu.style.top = windowHeight - menuHeight + "px";
        } else {
            menu.style.top = clickCoordsY + "px";
        }
    }

    function menuItemListener(link) {
        if (link.getAttribute("data-action") == "View") {
            overview();
        } else if (link.getAttribute("data-action") == "Delete") {
            del_files();
        } else if (link.getAttribute("data-action") == "Copy") {
            copy_file();
        } else if (link.getAttribute("data-action") == "Download") {
            download_file();
        } else if (link.getAttribute("data-action") == "Edit") {
            if (!context_menu_item_clicked || !context_menu_item_clicked?.getAttribute("fileid")) return;
            let ctx_data = context_menu_item_clicked?.getAttribute("fileid");

            window.open(`/edit?fileid=${ctx_data}`, "_blank").focus()
        } else if (link.getAttribute("data-action") == "Open") {
            if (!context_menu_item_clicked || !context_menu_item_clicked?.getAttribute("fileid")) return;
            let ctx_data = context_menu_item_clicked?.getAttribute("fileid");

            window.open(`/edit?docid=${ctx_data}`, "_blank").focus()
        } else if (link.getAttribute("data-action") == "pdfView") {
            window.open(`/pdf-viewer/web/viewer.html?file=/render?fileid=${context_menu_item_clicked?.getAttribute("fileid")}`);
        }

        toggleMenuOff();
    }

    init();
}

function download_file() {
    if (!context_menu_item_clicked) return;

    let tempA = document.createElement("a");
    tempA.href = `/render?fileid=${context_menu_item_clicked?.getAttribute("fileid")}`;
    tempA.download = `${context_menu_item_clicked?.getAttribute("name") || "undefined.txt"}`;

    // tempA.href = `https://mangoz1x.com/render?fileid=${context_menu_item_clicked?.getAttribute("fileid")}`;
    
    document.body.appendChild(tempA);
    tempA.click(); 
    tempA.remove();
};

async function copy_file() {
    if (!(context_menu_item_clicked || context_menu_item_clicked?.getAttribute("mime")?.includes("image"))) return;
    if (!context_menu_item_clicked?.getElementsByTagName("img")) return;

    let getMime = "image/png" || context_menu_item_clicked?.getAttribute("mime");
    let clipConItem = context_menu_item_clicked?.getElementsByTagName("img");
    clipConItem = clipConItem[clipConItem?.length - 1];

    let img = clipConItem;
    let canvas = document.createElement("canvas");

    canvas.width = img.width;
    canvas.height = img.height;

    canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
    canvas.toBlob((blob) => {
        navigator.clipboard.write([
            new ClipboardItem({ [getMime]: blob })
        ]);
    }, "image/png");
}

async function del_files() {
    let blank_arr = [];
    blank_arr.push(context_menu_item_clicked);

    let selected_arr = context_menu_multi_select.length == 0 ? blank_arr : context_menu_multi_select;
    let attr_arr = [];
    let ext_arr = [];

    for (let i = 0; i < selected_arr?.length; i++) {
        attr_arr.push(selected_arr?.[i]?.getAttribute("fileid"));
        ext_arr.push(selected_arr?.[i]?.getAttribute("extension"));

        selected_arr?.[i].remove();
    }

    let load = {
        userid: getCookie("userId"),
        session: getCookie("token"),
        fileid: attr_arr,
        ext: ext_arr
    }
    
    let load_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(load)
    }
    
    let response = await fetch(`${public_fetch_url}/delete`, load_data)
    response = await response.json();

    if (attr_arr.includes(document.getElementById("file-overview")?.getAttribute("fileid"))) {
        closeOverview();
    }

    let fileCount = document.getElementsByClassName("file_div");
    if (fileCount?.length == 0) noFiles();
}

function overview() {
    let overview_placeholder = document.getElementById("overview-placeholder");
    let overview_container = document.getElementById("file-overview");
    let share_link = document.getElementById("open_new_share");

    overview_placeholder.style.display = "block";
    overview_container.style.display = "block";
    
    let md5 = document.getElementById("file_md5");
    let encoding = document.getElementById("file_encoding");
    let extension = document.getElementById("file_extension");
    let fileid = document.getElementById("file_fileid");
    let dbid = document.getElementById("file_dbid");
    let mime = document.getElementById("file_mime");
    let size = document.getElementById("file_size");
    let file_name = document.getElementById("file_name");
    
    overview_container.setAttribute("fileid", context_menu_item_clicked?.getAttribute("fileid"));
    
    let attr = {
        md5: context_menu_item_clicked.getAttribute("md5"),
        encoding: context_menu_item_clicked.getAttribute("encoding"),
        extension: context_menu_item_clicked.getAttribute("extension"),
        fileid: context_menu_item_clicked.getAttribute("fileid"),
        dbid: context_menu_item_clicked.getAttribute("id"),
        mime: context_menu_item_clicked.getAttribute("mime"),
        size: context_menu_item_clicked.getAttribute("size"),
        name: context_menu_item_clicked.getAttribute("name")
    }

    share_link.href = `${window.location.href}share/${context_menu_item_clicked.getAttribute("fileid")}`;

    let itemN = document.getElementById("selector_stat");
    addPublicityEventListener(itemN, attr?.fileid);
    
    let gottenPub = getPublicity(context_menu_item_clicked);
    setPublicity(gottenPub);
    evalFileStat(attr?.fileid);

    file_name.textContent = attr?.name;
    md5.textContent = attr?.md5;
    encoding.textContent = attr?.encoding;
    extension.textContent = attr?.extension;
    fileid.textContent = attr?.fileid;
    dbid.textContent = attr?.dbid;
    mime.textContent = attr?.mime;
    size.textContent = ((attr?.size) / 1024 / 1024).toFixed(2) + "MB";
}

function closeOverview() {
    let overview_placeholder = document.getElementById("overview-placeholder");
    let overview_container = document.getElementById("file-overview");

    overview_placeholder.style.display = "none";
    overview_container.style.display = "none";
}