let public_data;

function ge(elem) { return document.getElementById(elem); };

function enit_tags() {
    let dataHidden = document.getElementsByTagName("data-hidden");
    let final = {};

    for (let i = 0; i < dataHidden?.length; i++) {
        dataHidden[i].style.display = "none";

        let splitComma = dataHidden?.[i].textContent.split(",");
        let temp = [];

        splitComma.forEach((item, itt) => {
            let s = item.split("=");
            let o = { [s[0]]: s[1] };
            temp.push(o);
        });

        final[dataHidden?.[i]?.getAttribute("identifier")] = temp;
    };

    public_data = final;
}

function secondsToHms(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);

    let hDisplay = h > 0 ? h + (h == 1 ? ":" : ":") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? ":" : ":") : "0:";
    let sDisplay = s > 0 ? s + (s == 1 ? "" : "") : "00";

    return hDisplay + mDisplay + (sDisplay?.length == 1 ? `0${sDisplay}` : sDisplay); 
}

function audio_buffered() {
    let audioBuffered = ge("time-range-buffered");
    let timePlayed = ge("time-range-played");
    let audioNum = ge("time-stamp");
    
    let buffered = ge("audio_controller")?.buffered;
    let loaded;
    let played;

    if (buffered?.length) {
        loaded = 100 * buffered.end(0) / ge("audio_controller").duration;
        played = 100 * ge("audio_controller").currentTime / ge("audio_controller").duration;

        audioBuffered.style.width = `${loaded.toFixed(2)}%`;
        timePlayed.style.width = `${played.toFixed(2)}%`;
    }

    let durationTime = secondsToHms(ge("audio_controller").duration);
    let durationPlayed = secondsToHms(ge("audio_controller").currentTime);

    audioNum.textContent = `${durationPlayed}/${durationTime}`;
}

function audio_slider_listeners() {
    let mainTrack = ge("main-track");
    let audioController = ge("audio_controller");
    let audioBuffered = ge("time-range-buffered");
    let timePlayed = ge("time-range-played");

    mainTrack.addEventListener("click", (e) => {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left; 
        let full = mainTrack.clientWidth;

        let clickPercentage = (x / full) * 100;
        timePlayed.style.width = `${clickPercentage}%`;
        audioController.currentTime = (clickPercentage / 100) * audioController.duration;
    });

    mainTrack.addEventListener("mousemove", (e) => {
        if (e.buttons !== 1) return;
        e.preventDefault();
        e.stopPropagation();

        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left; 
        let full = mainTrack.clientWidth;

        if (x.toString().includes("-")) return;

        let clickPercentage = (x / full) * 100;
        timePlayed.style.width = `${clickPercentage}%`;
        audioController.currentTime = (clickPercentage / 100) * audioController.duration;
    });
}

function audio_playing_status() {
    if (ge("audio_controller").duration > 0 && !ge("audio_controller").paused) {
        play.innerHTML = `<i class="fa fa-pause play-c" aria-hidden="true"></i>`;
    } else {
        play.innerHTML = `<i class="fa fa-play play-c" aria-hidden="true"></i>`;
    }
}

function init_audio() {
    let playC = document.getElementsByClassName("play-c");

    for (let i = 0; i < playC.length; i++) playC[i].addEventListener("click", () => {
        if (ge("audio_controller").duration > 0 && !ge("audio_controller").paused) {
            ge("audio_controller").pause();
            play.innerHTML = `<i class="fa fa-play play-c" aria-hidden="true"></i>`;
        } else {
            ge("audio_controller").play();
            play.innerHTML = `<i class="fa fa-pause play-c" aria-hidden="true"></i>`;
        }
    });

    audio_slider_listeners();

    setInterval(() => {
        audio_buffered();    
    }, 100);
}

function handle_data() {
    let elms = ["image", "audio", "video", "text", "pdf"];
    let mime;
    let err;

    for (let i in public_data?.["file-data"]) {
        let tmp = public_data?.["file-data"]?.[i];
        if (Object.keys(tmp)?.[0] == "data-mime") mime = tmp?.["data-mime"];
        if (Object.keys(tmp)?.[0] == "data-err") err = tmp?.["data-err"];
    }
    
    for (let i = 0; i < document.getElementsByClassName("file_identifier"); i++) {
        let id = document.getElementsByClassName("file_identifier");
        id[i].style.display = "none";
    }

    if (err == "file-private") {
        ge("actions-panel").remove();
        ge("err").style.display = "flex";
        return;
    } else if (err == "query-length") {
        ge("actions-panel").remove();
        ge("err").style.display = "flex";

        errHeader.textContent = `This file couldn't be found`
        errCustomMsg.innerHTML = `
            This file couldn't be found in our system. This could be<br/>
            due to the file being deleted, corrupt, or removed as a result of<br/>
            terms or community guideline violations.
        `;

        return;
    }

    if (mime.includes("audio")) {
        for (let i in elms) 
            if (elms[i] !== "audio") ge(elms[i]).style.display = "none";
            else ge(elms[i]).style.display = "flex";
            ge("replace-type").type = mime;
        
        init_audio();
    } else if (mime.includes("image")) {
        for (let i in elms) 
            if (elms[i] !== "image") ge(elms[i]).style.display = "none";
            else ge(elms[i]).style.display = "flex";
    } else if (mime.includes("video")) {
        for (let i in elms) 
            if (elms[i] !== "video") ge(elms[i]).style.display = "none";
            else ge(elms[i]).style.display = "flex";
            ge("replace-type-video").type = mime;
    } else if (mime.includes("pdf")) {
        for (let i in elms) 
            if (elms[i] !== "pdf") ge(elms[i]).style.display = "none";
            else ge(elms[i]).style.display = "flex";
    } else {
        ge("err").style.display = "flex";
        errHeader.textContent = `There was an error displaying this file`
        errCustomMsg.innerHTML = `
            This file cannot be displayed due to the mime type of the file<br/>
            <strong>${mime}</strong> files cannot be displayed through our website for the following<br/>
            reasons: security, unsupported browser, or corrupt file. Other people may still<br/>
            download and use this file.
        `;
    }
}

window.addEventListener("load", () => {
    enit_tags();
    handle_data();
});