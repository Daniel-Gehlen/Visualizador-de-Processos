const FilterManager = {
  filterByCompletion(problems, showCompleted = true, showIncomplete = true) {
    return problems.filter(problem => {
      if (problem.completed && !showCompleted) return false;
      if (!problem.completed && !showIncomplete) return false;
      
      if (problem.subproblems && problem.subproblems.length > 0) {
        problem.subproblems = this.filterByCompletion(problem.subproblems, showCompleted, showIncomplete);
      }
      
      return true;
    });
  },
  
  filterByTitle(problems, searchTerm) {
    if (!searchTerm) return problems;
    
    const term = searchTerm.toLowerCase();
    return problems.filter(problem => {
      const titleMatch = problem.title.toLowerCase().includes(term);
      const descriptionMatch = problem.description && problem.description.toLowerCase().includes(term);
      
      if (problem.subproblems && problem.subproblems.length > 0) {
        problem.subproblems = this.filterByTitle(problem.subproblems, searchTerm);
      }
      
      return titleMatch || descriptionMatch || (problem.subproblems && problem.subproblems.length > 0);
    });
  },
  
  filterByDepth(problems, maxDepth, currentDepth = 0) {
    if (currentDepth >= maxDepth) return [];
    
    return problems.map(problem => {
      const filteredProblem = { ...problem };
      
      if (problem.subproblems && problem.subproblems.length > 0 && currentDepth < maxDepth - 1) {
        filteredProblem.subproblems = this.filterByDepth(problem.subproblems, maxDepth, currentDepth + 1);
      } else {
        filteredProblem.subproblems = [];
      }
      
      return filteredProblem;
    });
  },
  
  hasSubproblems(problems) {
    return problems.some(problem => problem.subproblems && problem.subproblems.length > 0);
  },
  
  getLeafNodes(problems) {
    let leafNodes = [];
    
    problems.forEach(problem => {
      if (!problem.subproblems || problem.subproblems.length === 0) {
        leafNodes.push(problem);
      } else {
        leafNodes = leafNodes.concat(this.getLeafNodes(problem.subproblems));
      }
    });
    
    return leafNodes;
  },
  
  getRootNodes(problems) {
    return problems.filter(problem => !this.hasParent(problem, problems));
  },
  
  hasParent(targetProblem, problems) {
    for (const problem of problems) {
      if (problem.subproblems && problem.subproblems.includes(targetProblem)) {
        return true;
      }
      if (problem.subproblems && this.hasParent(targetProblem, problem.subproblems)) {
        return true;
      }
    }
    return false;
  }
};