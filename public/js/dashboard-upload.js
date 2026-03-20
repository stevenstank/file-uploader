const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const folderSelect = document.getElementById("folder-select");
const uploadStatus = document.getElementById("upload-status");

if (dropZone && fileInput && folderSelect && uploadStatus) {
  const setStatus = (message, isError = false) => {
    uploadStatus.textContent = message;
    uploadStatus.style.color = isError ? "#c0392b" : "#2c3e50";
  };

  const uploadWithFormData = async (file) => {
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

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setStatus("Upload successful. Refreshing...");
      window.location.reload();
    } catch (error) {
      setStatus(error.message || "Upload failed", true);
    }
  };

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
    uploadWithFormData(droppedFile);
  });
}
