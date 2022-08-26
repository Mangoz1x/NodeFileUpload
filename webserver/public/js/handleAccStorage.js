function handleAccountStorage(response) {
    let accountStorageMaxGB = response?.accountStorageMaxGB;
    let totalSizeTakenBytes = response?.totalSizeTakenBytes;
    let totalSizeTakenMB = response?.totalSizeTakenMB;

    let storageSettings = document.getElementById("storageSettings");
    let storageUsed = document.getElementById("storageUsed");
    let storageStat = document.getElementById("storageStat");
    let suText = document.getElementById("storageUsedText");

    storageUsed.disabled = "true";

    storageStat.textContent = `${(totalSizeTakenMB / 1000).toFixed(2)}/${accountStorageMaxGB}GB`;
    storageUsed.style.width = (totalSizeTakenMB / 1000) * 5 + "%";
    suText.textContent = `${(totalSizeTakenMB / 1000).toFixed(2)}%`
}