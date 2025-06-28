const PriorityCalculator = {
  calculateTotalNodes(problemList) {
    let count = problemList.length;
    problemList.forEach(problem => {
      if (problem.subproblems && problem.subproblems.length > 0) {
        count += this.calculateTotalNodes(problem.subproblems);
      }
    });
    return count;
  },
  
  calculateCompletedNodes(problemList) {
    let count = 0;
    problemList.forEach(problem => {
      if (problem.completed) count++;
      if (problem.subproblems && problem.subproblems.length > 0) {
        count += this.calculateCompletedNodes(problem.subproblems);
      }
    });
    return count;
  },
  
  calculateCompletionPercentage(problemList) {
    const total = this.calculateTotalNodes(problemList);
    const completed = this.calculateCompletedNodes(problemList);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  },
  
  calculateDepth(problemList) {
    if (!problemList || problemList.length === 0) return 0;
    
    let maxDepth = 1;
    problemList.forEach(problem => {
      if (problem.subproblems && problem.subproblems.length > 0) {
        const subDepth = 1 + this.calculateDepth(problem.subproblems);
        maxDepth = Math.max(maxDepth, subDepth);
      }
    });
    
    return maxDepth;
  },
  
  calculateBranchingFactor(problemList) {
    if (!problemList || problemList.length === 0) return 0;
    
    let totalChildren = 0;
    let nodesWithChildren = 0;
    
    const traverse = (problems) => {
      problems.forEach(problem => {
        if (problem.subproblems && problem.subproblems.length > 0) {
          totalChildren += problem.subproblems.length;
          nodesWithChildren++;
          traverse(problem.subproblems);
        }
      });
    };
    
    traverse(problemList);
    
    return nodesWithChildren > 0 ? Math.round((totalChildren / nodesWithChildren) * 100) / 100 : 0;
  },
  
  findCriticalPath(problemList) {
    const paths = [];
    
    const findPaths = (problems, currentPath = []) => {
      problems.forEach(problem => {
        const newPath = [...currentPath, problem];
        
        if (!problem.subproblems || problem.subproblems.length === 0) {
          paths.push(newPath);
        } else {
          findPaths(problem.subproblems, newPath);
        }
      });
    };
    
    findPaths(problemList);
    
    return paths.reduce((longest, current) => {
      return current.length > longest.length ? current : longest;
    }, []);
  },
  
  calculateNodeImportance(problem, problemList) {
    let importance = 1;
    
    if (problem.subproblems && problem.subproblems.length > 0) {
      importance += problem.subproblems.length * 0.5;
    }
    
    if (!problem.completed) {
      importance += 0.3;
    }
    
    const depth = this.getNodeDepth(problem, problemList);
    importance += depth * 0.2;
    
    return Math.round(importance * 100) / 100;
  },
  
  getNodeDepth(targetProblem, problemList, currentDepth = 0) {
    for (const problem of problemList) {
      if (problem.id === targetProblem.id) {
        return currentDepth;
      }
      
      if (problem.subproblems && problem.subproblems.length > 0) {
        const depth = this.getNodeDepth(targetProblem, problem.subproblems, currentDepth + 1);
        if (depth !== -1) return depth;
      }
    }
    return -1;
  },
  
  getProgressAnalytics(problemList) {
    const total = this.calculateTotalNodes(problemList);
    const completed = this.calculateCompletedNodes(problemList);
    const percentage = this.calculateCompletionPercentage(problemList);
    const depth = this.calculateDepth(problemList);
    const branchingFactor = this.calculateBranchingFactor(problemList);
    const criticalPath = this.findCriticalPath(problemList);
    
    return {
      totalNodes: total,
      completedNodes: completed,
      completionPercentage: percentage,
      maxDepth: depth,
      averageBranchingFactor: branchingFactor,
      criticalPathLength: criticalPath.length,
      criticalPath: criticalPath
    };
  }
};