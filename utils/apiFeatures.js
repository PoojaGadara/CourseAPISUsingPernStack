class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const { keyword } = this.queryStr;
  
    if (keyword) {
      this.query += ' WHERE name ILIKE $1';
      this.queryValues.push(`%${keyword}%`);
    }
  
    return this;
  }
  
  filter() {
    const { keyword, page, limit, ...filters } = this.queryStr;
    
    let filterClauses = [];
    let values = [];
    
    // Construct filter clauses based on provided filters
    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        let operator = '=';
        if (key.startsWith('gt')) operator = '>';
        else if (key.startsWith('gte')) operator = '>=';
        else if (key.startsWith('lt')) operator = '<';
        else if (key.startsWith('lte')) operator = '<=';
        
        let field = key.replace(/^(gt|gte|lt|lte)_/, '');
        filterClauses.push(`${field} ${operator} $${filterClauses.length + 1}`);
        values.push(filters[key]);
      }
    }
    
    // Construct the SQL WHERE clause
    let whereClause = '';
    if (filterClauses.length > 0) {
      whereClause = 'WHERE ' + filterClauses.join(' AND ');
    }
  
    // Update the query
    this.query += ` ${whereClause}`;
    this.queryValues = values;
  
    return this;
  }
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const offset = resultPerPage * (currentPage - 1);
    
    this.query += ` LIMIT ${resultPerPage} OFFSET ${offset}`;
    
    return this;
  }
  }
export default ApiFeatures