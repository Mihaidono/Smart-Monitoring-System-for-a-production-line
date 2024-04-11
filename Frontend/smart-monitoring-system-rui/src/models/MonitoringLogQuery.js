export class MonitoringLogQuery {
  constructor() {
    this.query = {
      log_id: null,
      message: null,
      severity: null,
      while_tracking: null,
      current_routine: null,
      current_module: null,
      lower_boundary: null,
      upper_boundary: null,
      current_page: null,
      limitation: null,
    };
  }

  setQuery(key, value) {
    this.query[key] = value;
  }

  getQuery() {
    return this.query;
  }
}
