const dropZone = document.getElementById("drop-zone");
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const folderSelect = document.getElementById("folder-select");
const uploadStatus = document.getElementById("upload-status");
const progressBar = document.getElementById("upload-progress-bar");
const progressText = document.getElementById("upload-progress-text");

if (dropZone && uploadForm && fileInput && folderSelect && uploadStatus && progressBar && progressText) {
  const setStatus = (message, isError = false) => {
    uploadStatus.textContent = message;
    uploadStatus.style.color = isError ? "#c0392b" : "#2c3e50";
  };

  const setProgress = (percent) => {
    const safePercent = Math.max(0, Math.min(100, percent));
    progressBar.style.width = `${safePercent}%`;
    progressText.textContent = `${safePercent}%`;
  };

  const uploadWithXhr = (file) => {
    if (!file) {
      return;
    }

    const data = new FormData();
    data.append("file", file);

    const selectedFolder = folderSelect.value;
    if (selectedFolder) {
      data.append("folderId", selectedFolder);
    }

    setStatus("Uploading...");
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      let result = { ok: false, error: "Upload failed" };

      try {
        result = JSON.parse(xhr.responseText || "{}");
      } catch (error) {
        result = { ok: false, error: "Invalid server response" };
      }

      if (xhr.status >= 200 && xhr.status < 300 && result.ok) {
        setProgress(100);
        setStatus("Upload successful. Refreshing...");
        window.location.reload();
        return;
      }

      setStatus(result.error || "Upload failed", true);
    };

    xhr.onerror = () => {
      setStatus("Network error while uploading", true);
    };

    xhr.send(data);
  };

  uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedFile = fileInput.files?.[0];
    if (!selectedFile) {
      setStatus("Please choose a file first", true);
      return;
    }
    uploadWithXhr(selectedFile);
  });

  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.style.borderColor = "#2d89ef";
    dropZone.style.backgroundColor = "#f0f8ff";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#888";
    dropZone.style.backgroundColor = "transparent";
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.style.borderColor = "#888";
    dropZone.style.backgroundColor = "transparent";

    const droppedFile = event.dataTransfer?.files?.[0];
    uploadWithXhr(droppedFile);
  });
}
