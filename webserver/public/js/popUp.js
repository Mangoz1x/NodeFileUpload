const popUp = (message, err, duration) => {
    let animate_dur = duration || 1000;

    let div = document.createElement("div");
    div.classList.add("popup-custom");

    div.innerText = message;
    div.classList.add("fade-up");

    if (err == true) {
        div.style.color = "red";
    }

    setTimeout(() => {
        div.classList.remove("fade-up");
        div.classList.add("fade-down");
    }, animate_dur);

    setTimeout(() => {
        div.remove();
    }, animate_dur + 500);

    document.body.appendChild(div);
};

const closePopUp = () => {
    if (!(document.getElementsByClassName("popup-custom"))) return;
    let popup_context = document.getElementsByClassName("popup-custom");
    
    for (let i = 0; i < popup_context?.length; i++) {
        popup_context[i].classList.remove("fade-up");
        popup_context[i].classList.add("fade-down");

        setTimeout(() => {
            popup_context[i].remove();
        }, 500);
    }
};