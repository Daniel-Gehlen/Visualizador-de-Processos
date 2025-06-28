const UIManager = {
  elements: {},
  
  init() {
    this.elements = {
      addProblemBtn: document.getElementById('add-problem'),
      buildTreeBtn: document.getElementById('build-tree'),
      downloadTreeBtn: document.getElementById('download-tree'),
      clearAllBtn: document.getElementById('clear-all'),
      problemModal: document.getElementById('problem-modal'),
      closeModal: document.querySelector('.close-modal'),
      saveProblemBtn: document.getElementById('save-problem'),
      problemTitle: document.getElementById('problem-title'),
      problemDescription: document.getElementById('problem-description'),
      modalTitle: document.getElementById('modal-title'),
      treeContainer: document.getElementById('tree'),
      progressBar: document.getElementById('progress-bar'),
      fileInput: document.getElementById('file-input'),
      filePreview: document.getElementById('file-preview'),
      fileUploadBtn: document.getElementById('file-upload-btn')
    };
  },
  
  updateButtons() {
    const isEmpty = StorageManager.isEmpty();
    this.elements.buildTreeBtn.disabled = isEmpty;
    this.elements.downloadTreeBtn.disabled = isEmpty;
  },
  
  openModal(parentId = null, title = 'Adicionar Processo') {
    this.elements.modalTitle.textContent = title;
    this.elements.problemTitle.value = '';
    this.elements.problemDescription.value = '';
    this.elements.problemModal.style.display = 'flex';
    this.elements.problemTitle.focus();
    return { parentId, isEdit: false };
  },
  
  openEditModal(problem) {
    this.elements.modalTitle.textContent = 'Editar Processo';
    this.elements.problemTitle.value = problem.title;
    this.elements.problemDescription.value = problem.description || '';
    this.elements.problemModal.style.display = 'flex';
    this.elements.problemTitle.focus();
    return { problemId: problem.id, isEdit: true };
  },
  
  closeModal() {
    this.elements.problemModal.style.display = 'none';
  },
  
  showFilePreview(content) {
    this.elements.filePreview.textContent = content;
    this.elements.filePreview.style.display = 'block';
  },
  
  hideFilePreview() {
    this.elements.filePreview.style.display = 'none';
    this.elements.fileInput.value = '';
  },
  
  updateProgressBar(completed, total) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    this.elements.progressBar.style.width = `${percentage}%`;
    this.elements.progressBar.textContent = `${completed}/${total} (${percentage}%)`;
  },
  
  buildTree(problems) {
    this.elements.treeContainer.innerHTML = '';
    
    if (problems.length === 0) {
      this.showEmptyState();
      return;
    }
    
    const treeWrapper = document.createElement('div');
    treeWrapper.className = 'level';
    
    problems.forEach(problem => {
      const nodeContainer = document.createElement('div');
      nodeContainer.appendChild(this.createNodeElement(problem));
      
      if (problem.subproblems && problem.subproblems.length > 0) {
        const childrenWrapper = document.createElement('div');
        childrenWrapper.className = 'children';
        
        const connector = document.createElement('div');
        connector.className = 'connector';
        childrenWrapper.appendChild(connector);
        
        const subLevel = document.createElement('div');
        subLevel.className = 'level horizontal';
        
        problem.subproblems.forEach(subproblem => {
          subLevel.appendChild(this.createSubproblemTree(subproblem));
        });
        
        childrenWrapper.appendChild(subLevel);
        nodeContainer.appendChild(childrenWrapper);
      }
      
      treeWrapper.appendChild(nodeContainer);
    });
    
    this.elements.treeContainer.appendChild(treeWrapper);
  },
  
  createSubproblemTree(problem) {
    const container = document.createElement('div');
    container.appendChild(this.createNodeElement(problem));
    
    if (problem.subproblems && problem.subproblems.length > 0) {
      const childrenWrapper = document.createElement('div');
      childrenWrapper.className = 'children';
      
      const connector = document.createElement('div');
      connector.className = 'connector';
      childrenWrapper.appendChild(connector);
      
      const subLevel = document.createElement('div');
      subLevel.className = 'level horizontal';
      
      problem.subproblems.forEach(subproblem => {
        subLevel.appendChild(this.createSubproblemTree(subproblem));
      });
      
      childrenWrapper.appendChild(subLevel);
      container.appendChild(childrenWrapper);
    }
    
    return container;
  },
  
  createNodeElement(problem) {
    const node = document.createElement('div');
    node.className = 'node';
    node.dataset.id = problem.id;
    
    if (problem.completed) {
      node.classList.add('completed');
    }
    
    const title = document.createElement('div');
    title.className = 'node-title';
    title.textContent = problem.title;
    
    const description = document.createElement('div');
    description.className = 'node-description';
    description.textContent = problem.description || 'Sem descrição';
    
    const actions = document.createElement('div');
    actions.className = 'node-actions';
    
    if (!problem.completed) {
      const completeBtn = document.createElement('button');
      completeBtn.className = 'success';
      completeBtn.textContent = '✓ Concluir';
      completeBtn.addEventListener('click', () => this.onCompleteProblem(problem.id));
      actions.appendChild(completeBtn);
    } else {
      const uncompleteBtn = document.createElement('button');
      uncompleteBtn.className = 'warning';
      uncompleteBtn.textContent = '↶ Reabrir';
      uncompleteBtn.addEventListener('click', () => this.onUncompleteProblem(problem.id));
      actions.appendChild(uncompleteBtn);
    }
    
    const editBtn = document.createElement('button');
    editBtn.className = 'warning';
    editBtn.textContent = '✏️ Editar';
    editBtn.addEventListener('click', () => this.onEditProblem(problem.id));
    actions.appendChild(editBtn);
    
    const addSubBtn = document.createElement('button');
    addSubBtn.textContent = '➕ Sub';
    addSubBtn.addEventListener('click', () => this.onAddSubproblem(problem.id));
    actions.appendChild(addSubBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'danger';
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => this.onDeleteProblem(problem.id));
    actions.appendChild(deleteBtn);
    
    node.appendChild(title);
    node.appendChild(description);
    node.appendChild(actions);
    
    return node;
  },
  
  showEmptyState() {
    this.elements.treeContainer.innerHTML = `
      <div class="empty-state">
        <p>Nenhum processo adicionado ainda.</p>
        <p>Adicione um processo ou carregue um arquivo para começar.</p>
      </div>
    `;
  },
  
  downloadTreeAsImage() {
    const treeElement = this.elements.treeContainer;
    
    if (StorageManager.isEmpty()) {
      alert('Não há árvore para baixar. Adicione processos primeiro.');
      return;
    }
    
    html2canvas(treeElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `arvore-processos-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(error => {
      console.error('Erro ao gerar imagem:', error);
      alert('Erro ao gerar a imagem da árvore.');
    });
  },
  
  onCompleteProblem: null,
  onUncompleteProblem: null,
  onEditProblem: null,
  onAddSubproblem: null,
  onDeleteProblem: null
};