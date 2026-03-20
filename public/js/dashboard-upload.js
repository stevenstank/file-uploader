const dropZone = document.getElementById("drop-zone");
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const folderSelect = document.getElementById("folder-select");
const uploadButton = document.getElementById("upload-button");
const uploadStatus = document.getElementById("upload-status");
const progressBar = document.getElementById("upload-progress-bar");
const progressText = document.getElementById("upload-progress-text");
const previewBox = document.getElementById("file-preview");
const previewName = document.getElementById("preview-name");
const previewSize = document.getElementById("preview-size");

if (
  dropZone &&
  uploadForm &&
  fileInput &&
  folderSelect &&
  uploadButton &&
  uploadStatus &&
  progressBar &&
  progressText &&
  previewBox &&
  previewName &&
  previewSize
) {
  let selectedFile = null;

  const setStatus = (message, isError = false) => {
    uploadStatus.textContent = message;
    uploadStatus.style.color = isError ? "#c0392b" : "#2c3e50";
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const setProgress = (percent) => {
    const safePercent = Math.max(0, Math.min(100, percent));
    progressBar.style.width = `${safePercent}%`;
    progressText.textContent = `${safePercent}%`;
  };

  const setSelectedFile = (file) => {
    selectedFile = file || null;

    if (!selectedFile) {
      previewBox.style.display = "none";
      previewName.textContent = "";
      previewSize.textContent = "";
      uploadButton.disabled = true;
      return;
    }

    previewBox.style.display = "block";
    previewName.textContent = selectedFile.name;
    previewSize.textContent = formatBytes(selectedFile.size);
    uploadButton.disabled = false;
  };

  const uploadWithXhr = (file) => {
    if (!file) {
      return;
    }

    const data = new FormData();
    data.append("file", file);

    const selectedFolderId = (folderSelect.value || "").trim();
    data.append("folderId", selectedFolderId);

    setStatus("Uploading...");
    setProgress(0);

    console.log(
      `[upload] starting upload: ${file.name}, ${formatBytes(file.size)}, folderId=${selectedFolderId || "(none)"}`
    );

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
        console.log(
          `[upload] progress ${percent}% (${formatBytes(event.loaded)} / ${formatBytes(event.total)})`
        );
      } else {
        console.log("[upload] progress event received but total size is not computable");
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
        setStatus("File uploaded successfully");
        console.log("[upload] completed successfully");
        setSelectedFile(null);
        window.location.reload();
        return;
      }

      console.error("[upload] failed", { status: xhr.status, result });
      setStatus(result.error || "Upload failed", true);
    };

    xhr.onerror = () => {
      console.error("[upload] network error");
      setStatus("Network error while uploading", true);
    };

    xhr.send(data);
  };

  uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setStatus("Please choose a file first", true);
      return;
    }
    uploadWithXhr(selectedFile);
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0] || null;
    setSelectedFile(file);
    setStatus(file ? "File selected. Click Upload when ready." : "", false);
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
    if (!droppedFile) {
      setStatus("No file detected in drop", true);
      return;
    }

    const dt = new DataTransfer();
    dt.items.add(droppedFile);
    fileInput.files = dt.files;

    setSelectedFile(droppedFile);
    setStatus("File selected from drop zone. Click Upload to continue.");
  });

  setSelectedFile(null);
}
