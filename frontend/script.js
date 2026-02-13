const API = "http://localhost:5000/api/files";

function uploadFile() {
  const fileInput = document.getElementById("fileInput");

  if (!fileInput.files.length) {
    alert("Please select a file first");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  fetch(API + "/upload", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(() => {
      fileInput.value = ""; // clear input
      loadFiles();
    })
    .catch(err => console.error("Upload error:", err));
}

function loadFiles() {
  const sortBy = document.getElementById("sort").value;
  let url = API;

  if (sortBy) {
    url += `?sortBy=${sortBy}&order=asc`;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("fileTable");
      table.innerHTML = "";

      if (!data.length) {
        table.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center;">No files found</td>
          </tr>
        `;
        return;
      }

      data.forEach(file => {
        table.innerHTML += `
          <tr>
            <td>${file.originalName}</td>
            <td>${file.fileType}</td>
            <td>${(file.fileSize / 1024).toFixed(2)}</td>
            <td>${new Date(file.uploadDate).toLocaleString()}</td>
            <td>
              <button onclick="deleteFile('${file._id}')">Delete</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => console.error("Load error:", err));
}

function deleteFile(id) {
  if (!confirm("Are you sure you want to delete this file?")) return;

  fetch(API + "/" + id, {
    method: "DELETE"
  })
    .then(() => loadFiles())
    .catch(err => console.error("Delete error:", err));
}

// Load files on page load
loadFiles();
