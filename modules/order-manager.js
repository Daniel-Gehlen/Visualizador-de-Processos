const OrderManager = {
  sortByTitle(problems, ascending = true) {
    const sorted = [...problems].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return ascending ? comparison : -comparison;
    });
    
    sorted.forEach(problem => {
      if (problem.subproblems && problem.subproblems.length > 0) {
        problem.subproblems = this.sortByTitle(problem.subproblems, ascending);
      }
    });
    
    return sorted;
  },
  
  sortByCompletion(problems, completedFirst = false) {
    const sorted = [...problems].sort((a, b) => {
      if (completedFirst) {
        return b.completed - a.completed;
      } else {
        return a.completed - b.completed;
      }
    });
    
    sorted.forEach(problem => {
      if (problem.subproblems && problem.subproblems.length > 0) {
        problem.subproblems = this.sortByCompletion(problem.subproblems, completedFirst);
      }
    });
    
    return sorted;
  },
  
  sortBySubproblemCount(problems, ascending = true) {
    const sorted = [...problems].sort((a, b) => {
      const aCount = this.getSubproblemCount(a);
      const bCount = this.getSubproblemCount(b);
      const comparison = aCount - bCount;
      return ascending ? comparison : -comparison;
    });
    
    sorted.forEach(problem => {
      if (problem.subproblems && problem.subproblems.length > 0) {
        problem.subproblems = this.sortBySubproblemCount(problem.subproblems, ascending);
      }
    });
    
    return sorted;
  },
  
  getSubproblemCount(problem) {
    if (!problem.subproblems || problem.subproblems.length === 0) {
      return 0;
    }
    
    let count = problem.subproblems.length;
    problem.subproblems.forEach(subproblem => {
      count += this.getSubproblemCount(subproblem);
    });
    
    return count;
  },
  
  sortByCreationOrder(problems, newestFirst = false) {
    const sorted = [...problems].sort((a, b) => {
      const comparison = parseInt(a.id) - parseInt(b.id);
      return newestFirst ? -comparison : comparison;
    });
    
    sorted.forEach(problem => {
      if (problem.subproblems && problem.subproblems.length > 0) {
        problem.subproblems = this.sortByCreationOrder(problem.subproblems, newestFirst);
      }
    });
    
    return sorted;
  },
  
  shuffleProblems(problems) {
    const shuffled = [...problems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    shuffled.forEach(problem => {
      if (problem.subproblems && problem.subproblems.length > 0) {
        problem.subproblems = this.shuffleProblems(problem.subproblems);
      }
    });
    
    return shuffled;
  },
  
  reverseOrder(problems) {
    const reversed = [...problems].reverse();
    
    reversed.forEach(problem => {
      if (problem.subproblems && problem.subproblems.length > 0) {
        problem.subproblems = this.reverseOrder(problem.subproblems);
      }
    });
    
    return reversed;
  }
};