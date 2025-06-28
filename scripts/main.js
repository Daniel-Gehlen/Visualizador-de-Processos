let editingId = null;
let editingParentId = null;
let totalNodes = 0;
let completedNodes = 0;

document.addEventListener("DOMContentLoaded", () => {
  UIManager.init();
  initializeEventListeners();
  UIManager.updateButtons();
  UIManager.showEmptyState();
  updateProgressBar();
});

function initializeEventListeners() {
  UIManager.elements.fileUploadBtn.addEventListener("click", () => {
    UIManager.elements.fileInput.click();
  });

  UIManager.elements.addProblemBtn.addEventListener("click", () => {
    openModal();
  });

  UIManager.elements.closeModal.addEventListener("click", () => {
    closeModalWindow();
  });

  UIManager.elements.problemModal.addEventListener("click", (e) => {
    if (e.target === UIManager.elements.problemModal) {
      closeModalWindow();
    }
  });

  UIManager.elements.saveProblemBtn.addEventListener("click", saveProblem);
  UIManager.elements.buildTreeBtn.addEventListener("click", buildTree);
  UIManager.elements.downloadTreeBtn.addEventListener("click", downloadTree);
  UIManager.elements.clearAllBtn.addEventListener("click", clearAll);
  UIManager.elements.fileInput.addEventListener("change", handleFileUpload);

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      UIManager.elements.problemModal.style.display === "flex"
    ) {
      closeModalWindow();
    }
  });

  UIManager.onCompleteProblem = completeProblem;
  UIManager.onUncompleteProblem = uncompleteProblem;
  UIManager.onEditProblem = editProblem;
  UIManager.onAddSubproblem = addSubproblem;
  UIManager.onDeleteProblem = deleteProblem;
}

function openModal(parentId = null, title = "Adicionar Processo") {
  editingId = null;
  editingParentId = parentId;
  UIManager.openModal(parentId, title);
}

function closeModalWindow() {
  UIManager.closeModal();
  editingId = null;
  editingParentId = null;
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".txt")) {
    alert("Por favor, selecione um arquivo de texto (.txt)");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    UIManager.showFilePreview(content);
    StorageManager.parseTextContent(content);
    UIManager.updateButtons();
    if (!StorageManager.isEmpty()) {
      buildTree();
    }
  };
  reader.onerror = () => {
    alert("Erro ao ler o arquivo");
  };
  reader.readAsText(file);
}

function saveProblem() {
  const title = UIManager.elements.problemTitle.value.trim();
  const description = UIManager.elements.problemDescription.value.trim();

  if (!title) {
    alert("Por favor, insira um título para o processo");
    UIManager.elements.problemTitle.focus();
    return;
  }

  const problemData = {
    id: editingId,
    title,
    description,
  };

  if (editingId) {
    StorageManager.updateProblem(editingId, problemData);
  } else {
    StorageManager.addProblem(problemData, editingParentId);
  }

  closeModalWindow();
  UIManager.updateButtons();
  buildTree();
}

function buildTree() {
  const problems = StorageManager.getProblems();
  totalNodes = PriorityCalculator.calculateTotalNodes(problems);
  completedNodes = PriorityCalculator.calculateCompletedNodes(problems);
  updateProgressBar();
  UIManager.buildTree(problems);
}

function updateProgressBar() {
  UIManager.updateProgressBar(completedNodes, totalNodes);
}

function clearAll() {
  if (StorageManager.isEmpty()) return;

  if (confirm("Tem certeza que deseja limpar todos os processos?")) {
    StorageManager.clearAll();
    UIManager.hideFilePreview();
    UIManager.updateButtons();
    UIManager.showEmptyState();
    updateProgressBar();
  }
}

function completeProblem(id) {
  if (StorageManager.completeProblem(id)) {
    buildTree();
  }
}

function uncompleteProblem(id) {
  if (StorageManager.uncompleteProblem(id)) {
    buildTree();
  }
}

function editProblem(id) {
  const problem = StorageManager.findProblem(id);
  if (problem) {
    editingId = id;
    UIManager.openEditModal(problem);
  }
}

function deleteProblem(id) {
  if (
    confirm(
      "Tem certeza que deseja excluir este processo e todos os seus subprocessos?"
    )
  ) {
    StorageManager.deleteProblem(id);
    UIManager.updateButtons();
    buildTree();
  }
}

function addSubproblem(parentId) {
  const parentProblem = StorageManager.findProblem(parentId);
  if (parentProblem) {
    openModal(parentId, `Adicionar Subprocesso para "${parentProblem.title}"`);
  }
}

function downloadTree() {
  if (StorageManager.isEmpty()) {
    alert("Não há árvore para baixar. Adicione processos primeiro.");
    return;
  }

  const treeElement = UIManager.elements.treeContainer;
  const originalStyles = {
    overflow: treeElement.style.overflow,
    width: treeElement.style.width,
    height: treeElement.style.height,
    position: treeElement.style.position,
  };

  treeElement.style.overflow = "visible";
  treeElement.style.width = "max-content";
  treeElement.style.height = "max-content";
  treeElement.style.position = "absolute";

  const width = treeElement.scrollWidth;
  const height = treeElement.scrollHeight;

  html2canvas(treeElement, {
    backgroundColor: "#ffffff",
    scale: 2,
    width: width,
    height: height,
    scrollX: 0,
    scrollY: 0,
    windowWidth: width,
    windowHeight: height,
    logging: false,
    useCORS: true,
    allowTaint: true,
  })
    .then((canvas) => {
      const a4Width = 2480;
      const a4Height = 3508;
      const margin = 100;
      const printableWidth = a4Width - margin * 2;
      const printableHeight = a4Height - margin * 2;

      if (canvas.width <= printableWidth && canvas.height <= printableHeight) {
        downloadSinglePage(canvas);
      } else {
        splitAndDownloadPages(canvas, printableWidth, printableHeight, margin);
      }

      Object.assign(treeElement.style, originalStyles);
    })
    .catch((error) => {
      console.error("Erro ao gerar imagem:", error);
      Object.assign(treeElement.style, originalStyles);
      downloadSVGFallback();
    });
}

function downloadSinglePage(canvas) {
  const link = document.createElement("a");
  link.download = `arvore-processos-${
    new Date().toISOString().split("T")[0]
  }.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function splitAndDownloadPages(
  canvas,
  printableWidth,
  printableHeight,
  margin
) {
  const totalPagesX = Math.ceil(canvas.width / printableWidth);
  const totalPagesY = Math.ceil(canvas.height / printableHeight);

  for (let pageY = 0; pageY < totalPagesY; pageY++) {
    for (let pageX = 0; pageX < totalPagesX; pageX++) {
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = printableWidth + margin * 2;
      pageCanvas.height = printableHeight + margin * 2;
      const ctx = pageCanvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      const sx = pageX * printableWidth;
      const sy = pageY * printableHeight;
      const sw = Math.min(printableWidth, canvas.width - sx);
      const sh = Math.min(printableHeight, canvas.height - sy);

      ctx.drawImage(canvas, sx, sy, sw, sh, margin, margin, sw, sh);

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin, sw, sh);

      const pageNumber = pageY * totalPagesX + pageX + 1;
      ctx.fillStyle = "#000000";
      ctx.font = "30px Arial";
      ctx.fillText(
        `Página ${pageNumber}/${totalPagesX * totalPagesY}`,
        margin,
        margin - 20
      );

      const link = document.createElement("a");
      link.download = `arvore-processos-${
        new Date().toISOString().split("T")[0]
      }-pag${pageNumber}.png`;
      link.href = pageCanvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function downloadSVGFallback() {
  const svgData = createSVGFromTree();
  const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    const a4Width = 2480;
    const a4Height = 3508;
    const margin = 100;
    const printableWidth = a4Width - margin * 2;
    const printableHeight = a4Height - margin * 2;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    if (canvas.width <= printableWidth && canvas.height <= printableHeight) {
      downloadSinglePage(canvas);
    } else {
      splitAndDownloadPages(canvas, printableWidth, printableHeight, margin);
    }

    URL.revokeObjectURL(url);
  };
  img.onerror = function () {
    console.error("Erro ao carregar imagem SVG alternativa");
  };
  img.src = url;
}

function createSVGFromTree() {
  const problems = StorageManager.getProblems();
  const padding = 50;
  let maxWidth = 0;
  let totalHeight = padding;

  const calculateDimensions = (nodes, level = 0) => {
    nodes.forEach((node) => {
      const nodeWidth = Math.max(180, node.title.length * 8);
      maxWidth = Math.max(maxWidth, nodeWidth + level * 200);
      totalHeight += 120;
      if (node.subproblems && node.subproblems.length > 0) {
        calculateDimensions(node.subproblems, level + 1);
      }
    });
  };

  calculateDimensions(problems);
  maxWidth = Math.max(maxWidth, 800) + 2 * padding;
  totalHeight += padding;

  let svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${totalHeight}" viewBox="0 0 ${maxWidth} ${totalHeight}">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text x="${
        maxWidth / 2
      }" y="40" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold">Árvore de Processos</text>
  `;

  let yPosition = 80;

  const renderNodes = (nodes, x, y, level) => {
    nodes.forEach((node, index) => {
      const nodeWidth = Math.max(180, node.title.length * 8);
      const nodeHeight = 80;
      const color = node.completed ? "#4caf50" : "#4a6fa5";

      svgContent += `
        <rect x="${
          x - nodeWidth / 2
        }" y="${y}" width="${nodeWidth}" height="${nodeHeight}"
              fill="${color}" stroke="#333" stroke-width="2" rx="8"/>
        <text x="${x}" y="${
        y + 25
      }" text-anchor="middle" font-family="Arial" font-size="12"
              font-weight="bold" fill="white">${node.title}</text>
        <text x="${x}" y="${
        y + 45
      }" text-anchor="middle" font-family="Arial" font-size="10"
              fill="white">${node.description || "Sem descrição"}</text>
      `;

      if (node.subproblems && node.subproblems.length > 0) {
        const childY = y + nodeHeight + 60;
        const spacing = Math.min(
          200,
          (maxWidth - padding * 2) / node.subproblems.length
        );
        const startX = x - ((node.subproblems.length - 1) * spacing) / 2;

        node.subproblems.forEach((subproblem, subIndex) => {
          const childX = startX + subIndex * spacing;
          svgContent += `<line x1="${x}" y1="${
            y + nodeHeight
          }" x2="${childX}" y2="${childY}" stroke="#333" stroke-width="2"/>`;
          renderNodes([subproblem], childX, childY, level + 1);
        });
      }
    });
  };

  problems.forEach((problem) => {
    renderNodes([problem], maxWidth / 2, yPosition, 0);
    yPosition += 150;
  });

  svgContent += "</svg>";
  return svgContent;
}
