const StorageManager = {
  problems: [],
  
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },
  
  addProblem(problem, parentId = null) {
    const newProblem = {
      id: problem.id || this.generateId(),
      title: problem.title,
      description: problem.description || '',
      subproblems: [],
      completed: false
    };
    
    if (parentId) {
      const parent = this.findProblem(parentId);
      if (parent) {
        if (!parent.subproblems) {
          parent.subproblems = [];
        }
        parent.subproblems.push(newProblem);
      }
    } else {
      this.problems.push(newProblem);
    }
    
    return newProblem;
  },
  
  updateProblem(id, updatedProblem) {
    function updateInList(list) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i] = { ...list[i], ...updatedProblem };
          return true;
        }
        if (list[i].subproblems && updateInList(list[i].subproblems)) {
          return true;
        }
      }
      return false;
    }
    return updateInList(this.problems);
  },
  
  deleteProblem(id) {
    return this.removeFromProblems(id, this.problems);
  },
  
  removeFromProblems(id, problemList) {
    for (let i = problemList.length - 1; i >= 0; i--) {
      if (problemList[i].id === id) {
        problemList.splice(i, 1);
        return true;
      }
      if (problemList[i].subproblems && this.removeFromProblems(id, problemList[i].subproblems)) {
        return true;
      }
    }
    return false;
  },
  
  findProblem(id, problemList = null) {
    const list = problemList || this.problems;
    for (const problem of list) {
      if (problem.id === id) return problem;
      if (problem.subproblems) {
        const found = this.findProblem(id, problem.subproblems);
        if (found) return found;
      }
    }
    return null;
  },
  
  completeProblem(id) {
    const problem = this.findProblem(id);
    if (problem) {
      problem.completed = true;
      return true;
    }
    return false;
  },
  
  uncompleteProblem(id) {
    const problem = this.findProblem(id);
    if (problem) {
      problem.completed = false;
      return true;
    }
    return false;
  },
  
  clearAll() {
    this.problems = [];
  },
  
  parseTextContent(text) {
    const lines = text.split('\n').filter(line => line.trim());
    this.problems = [];
    
    const stack = [];
    
    lines.forEach(line => {
      const level = (line.match(/^\s*/)[0].length / 2) || 0;
      const title = line.trim();
      
      const newProblem = {
        id: this.generateId(),
        title,
        description: '',
        subproblems: [],
        completed: false
      };
      
      while (stack.length > level) {
        stack.pop();
      }
      
      if (stack.length === 0) {
        this.problems.push(newProblem);
      } else {
        const parent = stack[stack.length - 1];
        if (!parent.subproblems) {
          parent.subproblems = [];
        }
        parent.subproblems.push(newProblem);
      }
      
      stack.push(newProblem);
    });
  },
  
  getProblems() {
    return this.problems;
  },
  
  isEmpty() {
    return this.problems.length === 0;
  }
};