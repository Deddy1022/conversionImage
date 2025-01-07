const fileInput = document.getElementById("fileInput");
const imageInput = document.getElementById("image");
const info = document.getElementById("info");
const startProcessingBtn = document.getElementById("startProcessing");
const progressModal = document.getElementById("progressModal");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const uploadArea1 = document.getElementById("uploadArea1");
const uploadTextImage = document.querySelector(".upload-text-image");

let imageFilePassed = [];

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(area) {
  area.classList.add("highlight");
}
function unhighlight(area) {
  area.classList.remove("highlight");
}

function handleDrop(e, previewElement, inputElement) {
  const files = e.dataTransfer.files;
  displayFiles(files, previewElement);
  inputElement.files = files;
}

function displayFiles(files, previewElement) {
  previewElement.innerHTML = "";
  for (const file of files) {
    const fileName = document.createElement("span");
    fileName.textContent = file.name;
    previewElement.appendChild(fileName);
  }
}

["dragenter", "dragover"].forEach(eventName => {
  uploadArea1.addEventListener(eventName, (e) => { preventDefaults(e); highlight(uploadArea1); }, false);
});
["dragleave", "drop"].forEach(eventName => {
  uploadArea1.addEventListener(eventName, (e) => { preventDefaults(e); unhighlight(uploadArea1); }, false);
});
uploadArea1.addEventListener("drop", (e) => handleDrop(e, uploadTextImage, imageInput), false);


imageInput.addEventListener("change", () => {
  const imageExt = [".jpeg", ".jpg"];
  imageFilePassed = Array.from(imageInput.files)
    .filter(file => 
      imageExt
        .some(ext => 
          file.name
            .toLowerCase()
            .endsWith(ext.toLowerCase())
    ));
  if(imageFilePassed.length === 0)
  {
    alert("Les fichiers à importer doivent obligatoirement être des format images!");
    imageInput.value = "";
  } else
    uploadTextImage.textContent = `${imageInput.files.length} images`;
});

function showProgressModal() {
  progressModal.style.display = "block";
}

function hideProgressModal() {
  progressModal.style.display = "none";
}

function updateProgress(percentage) {
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${percentage}%`;
}

async function processWithConcurrencyLimit(tasks, concurrency, taskHandler) {
  let currentIndex = 0;
  let activeTasks = 0;

  return new Promise((resolve, reject) => {
    const results = [];
    const processNext = () => {
      if (currentIndex >= tasks.length && activeTasks === 0) {
        resolve(results);
        return;
      }

      while (activeTasks < concurrency && currentIndex < tasks.length) {
        const index = currentIndex++;
        activeTasks++;

        taskHandler(tasks[index], index)
          .then((result) => {
            results[index] = result;
            activeTasks--;
            processNext();
          })
          .catch((err) => {
            reject(err);
          });
      }
    };

    processNext();
  });
}

async function startProcessing() {
  if (imageFilePassed.length === 0) {
    alert("Aucun fichier sélectionné !");
    return;
  }

  showProgressModal();
  updateProgress(0);

  const totalFiles = imageFilePassed.length,
  corrompus = {};

  try {
    await processWithConcurrencyLimit(
      imageFilePassed,
      5,
      async (file, index) => {
        const fileBuffer = await file.arrayBuffer();
        const name = file.name.split(".")[0];
        const dossier = file.webkitRelativePath.split("/").find(folder => /\b^[0-9]{2}\_[0-9]{1,}\b$/.test(folder)) || "Unknown";

        const { corrompusParDossier } = await window.sessions.compress(fileBuffer, name, dossier);

        for (const [dos, total] of Object.entries(corrompusParDossier)) {
          if (!corrompus[dos]) {
            corrompus[dos] = 0;
          }
          corrompus[dos] += total;
        }
        const progress = Math.round(((index + 1) / totalFiles) * 100);
        updateProgress(progress);
      }
    );
    window.sessions.log(corrompus);
    updateProgress(100);
    setTimeout(() => {
      hideProgressModal();
      alert("Traitement terminé !");
    }, 500);
  } catch (err) {
    console.error("Erreur pendant le traitement :", err);
    hideProgressModal();
    alert("Une erreur est survenue pendant le traitement.");
  }
}

document.querySelector("input[type='button']").addEventListener("click", async() => {
  await startProcessing();
});