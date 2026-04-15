const API_BASE = "/api";

function getRelativePath(fullPath) {
  // Check if it's in organized
  if (fullPath.includes("organized")) {
    return "organized/" + fullPath.split("organized")[1].replace(/^[\\/]/, "").replace(/\\/g, "/");
  }
  // Check if it's in uploads
  if (fullPath.includes("uploads")) {
    return "uploads/" + fullPath.split("uploads")[1].replace(/^[\\/]/, "").replace(/\\/g, "/");
  }
  return "#";
}

function getRelativePath(fullPath) {
  // Check if it's in organized
  if (fullPath.includes("organized")) {
    return "organized/" + fullPath.split("organized")[1].replace(/^[\\/]/, "").replace(/\\/g, "/");
  }
  // Check if it's in uploads
  if (fullPath.includes("uploads")) {
    return "uploads/" + fullPath.split("uploads")[1].replace(/^[\\/]/, "").replace(/\\/g, "/");
  }
  return "#";
}

// Tabs
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');

  if (tabId === 'logs') loadLogs();
  if (tabId === 'rules') loadRules();
  if (tabId === 'folders') loadFolders();
}

// Store files globally for folder filtering
let allFiles = [];

// Folders
function loadFolders() {
  fetch(`${API_BASE}/files`)
    .then(res => res.json())
    .then(files => {
      allFiles = files; // Store files
      const grid = document.getElementById("folderGrid");
      const contents = document.getElementById("folderContents");

      // Reset view
      grid.style.display = "grid";
      contents.style.display = "none";

      // Group files by folder
      // Assuming structure: .../organized/FolderName/filename.ext
      const folders = {};

      files.forEach(f => {
        // Extract folder name from path
        // Split by 'organized' and take the first part of the remainder
        const parts = f.filePath.split(/[\\/]/); // Split by / or \
        const organizedIdx = parts.findIndex(p => p === 'organized');

        let folderName = 'Uncategorized';
        if (organizedIdx !== -1 && organizedIdx + 1 < parts.length - 1) {
          folderName = parts[organizedIdx + 1];
        } else if (organizedIdx !== -1 && parts.length > organizedIdx + 1) {
          // Case where file might be directly in organized (unlikely based on logic but possible)
          folderName = 'Root';
        }

        if (!folders[folderName]) folders[folderName] = 0;
        folders[folderName]++;
      });

      grid.innerHTML = Object.keys(folders).map(name => `
        <div class="folder-card" onclick="openFolder('${name}')">
          <span class="folder-icon">📁</span>
          <span class="folder-name">${name}</span>
          <span class="folder-count">${folders[name]} files</span>
        </div>
      `).join('');

      if (Object.keys(folders).length === 0) {
        grid.innerHTML = '<p style="color:#64748b; grid-column: 1/-1; text-align:center;">No organized files yet.</p>';
      }
    });
}

function openFolder(folderName) {
  const grid = document.getElementById("folderGrid");
  const contents = document.getElementById("folderContents");
  const title = document.getElementById("folderTitle");
  const tbody = document.getElementById("folderFileTable");

  // Filter files
  const folderFiles = allFiles.filter(f => {
    const parts = f.filePath.split(/[\\/]/);
    const organizedIdx = parts.findIndex(p => p === 'organized');
    let fName = 'Uncategorized';
    if (organizedIdx !== -1 && organizedIdx + 1 < parts.length - 1) {
      fName = parts[organizedIdx + 1];
    } else if (organizedIdx !== -1 && parts.length > organizedIdx + 1) {
      fName = 'Root';
    }
    return fName === folderName;
  });

  // Update View
  grid.style.display = "none";
  contents.style.display = "block";
  title.textContent = folderName;

  tbody.innerHTML = folderFiles.map(f => `
        <tr>
          <td>${f.originalName}</td>
          <td>${f.fileType.toUpperCase()}</td>
          <td>${(f.fileSize / 1024).toFixed(1)} KB</td>
          <td class="actions-cell">
            <button onclick="previewFile('${f._id}')" title="Preview" style="background:none; border:none; cursor:pointer; font-size:1.2rem; margin-right:10px;">
              👁️
            </button>
            <a href="/${getRelativePath(f.filePath)}" download title="Download" style="text-decoration:none; margin-right:10px; font-size:1.2rem;">
              ⬇️
            </a>
            <button onclick="deleteFile('${f._id}')" style="background:none; border:none; cursor:pointer; font-size:1.2rem;" title="Delete">
              🗑️
            </button>
          </td>
        </tr>
    `).join('');
}

function closeFolder() {
  document.getElementById("folderGrid").style.display = "grid";
  document.getElementById("folderContents").style.display = "none";
}

// Upload
function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) return alert("Select a file!");

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  fetch(`${API_BASE}/files/upload`, { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      fileInput.value = "";
      loadFiles();
      alert("File uploaded successfully!");
    })
    .catch(err => {
      console.error(err);
      alert("Upload failed: " + err.message);
    });
}

// Load Files
function loadFiles() {
  fetch(`${API_BASE}/files`)
    .then(res => res.json())
    .then(files => {
      allFiles = files; // Update global store
      const tbody = document.getElementById("fileTable");
      tbody.innerHTML = files.map(f => `
        <tr>
          <td>${f.originalName}</td>
          <td>${f.fileType.toUpperCase()}</td>
          <td>${(f.fileSize / 1024).toFixed(1)} KB</td>
          <td class="actions-cell">
            <button onclick="previewFile('${f._id}')" title="Preview" style="background:none; border:none; cursor:pointer; font-size:1.2rem; margin-right:10px;">
              👁️
            </button>
            <a href="/${getRelativePath(f.filePath)}" download title="Download" style="text-decoration:none; margin-right:10px; font-size:1.2rem;">
              ⬇️
            </a>
            <button onclick="deleteFile('${f._id}')" style="background:none; border:none; cursor:pointer; font-size:1.2rem;" title="Delete">
              🗑️
            </button>
          </td>
        </tr>
      `).join('');
    });
}

// Rules
function loadRules() {
  fetch(`${API_BASE}/rules`)
    .then(res => res.json())
    .then(rules => {
      const list = document.getElementById("ruleList");
      list.innerHTML = rules.map(r => `
        <li class="rule-item">
          <span class="rule-info">${r.name}: .${r.criteria.extension.join(', .')} &rarr; /${r.targetFolder}</span>
          <button onclick="deleteRule('${r._id}')" class="primary-btn" style="background:#ef4444; padding:4px 8px;">Delete</button>
        </li>
      `).join('');
    });
}

function addRule() {
  const name = document.getElementById('ruleName').value;
  const ext = document.getElementById('ruleExt').value.split(',').map(e => e.trim());
  const folder = document.getElementById('targetFolder').value;

  fetch(`${API_BASE}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, criteria: { extension: ext }, targetFolder: folder })
  })
    .then(() => {
      loadRules();
      document.getElementById('ruleName').value = '';
      document.getElementById('ruleExt').value = '';
      document.getElementById('targetFolder').value = '';
    });
}

function deleteRule(id) {
  fetch(`${API_BASE}/rules/${id}`, { method: 'DELETE' })
    .then(() => loadRules());
}

// Logs
function loadLogs() {
  fetch(`${API_BASE}/logs`)
    .then(res => res.json())
    .then(logs => {
      const container = document.getElementById("logContainer");
      container.innerHTML = logs.map(log => `
        <div class="log-entry">
          <span class="log-time">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span class="log-type ${log.eventType}">${log.eventType}</span>
          <span>${log.details || log.filePath}</span>
        </div>
      `).join('');
    });
}

// Actions
function deleteFile(id) {
  if (!confirm("Are you sure you want to delete this file?")) return;

  fetch(`${API_BASE}/files/${id}`, { method: "DELETE" })
    .then(() => {
      loadFiles();
      // If we were in a folder view, refresh it
      if (document.getElementById("folderContents").style.display === "block") {
        const folderName = document.getElementById("folderTitle").textContent;
        // Re-fetch all files then re-open folder
        fetch(`${API_BASE}/files`)
          .then(res => res.json())
          .then(files => {
            allFiles = files;
            openFolder(folderName);
          });
      }
    });
}

function reorganizeFiles() {
  if (!confirm("This will scan all files and move them according to your current rules. Continue?")) return;

  const originalText = event.target.innerText;
  event.target.innerText = "Sorting...";
  event.target.disabled = true;

  fetch(`${API_BASE}/files/reorganize`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      alert(`Smart Sort Complete!\n${data.result.moved} files moved.`);
      loadFiles();
      loadFolders(); // Refresh folders count
    })
    .catch(err => {
      console.error(err);
      alert("Sort failed: " + err.message);
    })
    .finally(() => {
      event.target.innerText = originalText;
      event.target.disabled = false;
    });
}

// Delete ALL files
function deleteAllFiles() {
  if (!confirm("⚠️ Are you sure you want to delete ALL files? This cannot be undone!")) return;

  fetch(`${API_BASE}/files/delete-all`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
      alert(`All files removed! (${data.count} files deleted)`);
      loadFiles();
      loadFolders();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to delete all files: " + err.message);
    });
}

// Dark / Light Mode Toggle
function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById("themeIcon");

  if (html.getAttribute("data-theme") === "dark") {
    html.removeAttribute("data-theme");
    icon.textContent = "🌙";
    localStorage.setItem("theme", "light");
  } else {
    html.setAttribute("data-theme", "dark");
    icon.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  }
}

// Load saved theme on startup
(function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    // Icon will be set once DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
      const icon = document.getElementById("themeIcon");
      if (icon) icon.textContent = "☀️";
    });
  }
})();

// Init
loadFiles();
// Auto refresh logs every 5s if on logs tab
setInterval(() => {
  if (document.getElementById('logs').classList.contains('active')) loadLogs();
}, 5000);

// Preview Modal Logic
function previewFile(fileId) {
  const file = allFiles.find(f => f._id === fileId);
  if (!file) {
    console.error("File not found for preview:", fileId);
    // Try to reload files if not found, might be stale
    return alert("File info not found. Please refresh the page.");
  }

  const modal = document.getElementById("previewModal");
  const title = document.getElementById("previewTitle");
  const body = document.getElementById("previewBody");
  const downloadBtn = document.getElementById("downloadBtn");

  const relPath = getRelativePath(file.filePath);
  const fullUrl = `/${relPath}`;

  title.textContent = file.originalName || file.filePath.split(/[\\/]/).pop();
  downloadBtn.href = fullUrl;

  // Clear body
  body.innerHTML = '';

  const type = file.fileType.toLowerCase();

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) {
    body.innerHTML = `<img src="${fullUrl}" class="preview-img" alt="Preview">`;
  }
  // Video
  else if (['mp4', 'webm', 'ogg'].includes(type)) {
    body.innerHTML = `<video src="${fullUrl}" controls class="preview-img"></video>`;
  }
  // Audio
  else if (['mp3', 'wav'].includes(type)) {
    body.innerHTML = `<audio src="${fullUrl}" controls></audio>`;
  }
  // PDF
  else if (type === 'pdf') {
    body.innerHTML = `<iframe src="${fullUrl}" class="preview-frame"></iframe>`;
  }
  // Text/Code
  else if (['txt', 'json', 'md', 'js', 'css', 'html'].includes(type)) {
    body.innerHTML = `<iframe src="${fullUrl}" class="preview-frame" style="background:white;"></iframe>`;
  }
  // Fallback
  else {
    body.innerHTML = `
        <div class="no-preview">
            <p style="font-size:3rem;">🚫</p>
            <p>No preview available for <b>${type.toUpperCase()}</b> files.</p>
            <p>Please use the download button below.</p>
        </div>
     `;
  }

  modal.style.display = "block";
}

function closePreview() {
  document.getElementById("previewModal").style.display = "none";
  document.getElementById("previewBody").innerHTML = ''; // Stop media playback
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("previewModal");
  if (event.target == modal) {
    closePreview();
  }
}
