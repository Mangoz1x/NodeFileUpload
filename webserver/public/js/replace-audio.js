function removeAttEvents(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
}

function pausePlay(cur_audio, play) {
    if (cur_audio?.duration > 0 && !cur_audio?.paused) {
        cur_audio?.pause();
        play.innerHTML = `<i class="fa fa-pause no-click-aud" aria-hidden="true"></i>`;
    } else {
        cur_audio?.play();
        play.innerHTML = `<i class="fa fa-play no-click-aud" aria-hidden="true"></i>`;
    }
}

function secondsToTime(e){
    let h = Math.floor(e / 3600).toString().padStart(2,'0'),
        m = Math.floor(e % 3600 / 60).toString().padStart(2,'0'),
        s = Math.floor(e % 60).toString().padStart(2,'0');
    
    if (h > 0) {
        return h + ':' + m + ':' + s;
    } 

    return m + ':' + s;
}

function createAudioElement(elem_id, cur_audio) {
    if (cur_audio == "use-fid") {
        cur_audio = document.querySelector(`[fileid='${elem_id}']`);
        cur_audio = cur_audio.getElementsByTagName("audio")[0];
    }

    document.getElementById("audio-play-container").style.display = "flex";
    document.getElementById("audio-play-container").setAttribute("playing", elem_id);

    let volContainer = document.getElementById("vol-container");
    let range = document.getElementById("aud-duration");
    let play = document.getElementById("play-pause");
    let durPlayed = document.getElementById("dur-count");
    let vol = document.getElementById("aud-vol-range");
    let volIc = document.getElementById("aud-vol-btn");

    volIc.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
    range.type = "range";
    vol.type = "range";
    vol.max = "10";

    durPlayed.textContent = `${secondsToTime(cur_audio?.currentTime)}/${secondsToTime(cur_audio.duration)}`;
    range.value = cur_audio?.currentTime;
    vol.value = cur_audio?.volume * 10; 

    volContainer.onmouseover = () => { vol.style.display = "block"; };
    volContainer.onmouseleave = () => { vol.style.display = "none"; };
    vol.onchange = () => {cur_audio.volume = vol?.value / 10; };

    setInterval(() => {
        durPlayed.textContent = `${secondsToTime(cur_audio?.currentTime)}/${secondsToTime(cur_audio.duration)}`;
        range.value = cur_audio?.currentTime; 
        range.max = cur_audio?.duration;
    }, 900)

    range.onchange = () => { cur_audio.currentTime = range?.value; };
    play.onclick = () => { pausePlay(cur_audio, play) };
}

function hideAudioElement(fileid, cur_audio) {
    document.getElementById("audio-play-container").style.display = "none";
}