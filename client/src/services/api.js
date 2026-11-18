/**
 * TheCarePal API Service Client
 */

const BASE_URL = '/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Feedback Link Validation & Submission
  async verifyToken(token) {
    const res = await fetch(`${BASE_URL}/feedback/verify/${token}`);
    return handleResponse(res);
  },

  async submitFeedback(payload) {
    const res = await fetch(`${BASE_URL}/feedback/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Dashboard Analytics
  async getMetrics() {
    const res = await fetch(`${BASE_URL}/dashboard/metrics`);
    return handleResponse(res);
  },

  async getTrends() {
    const res = await fetch(`${BASE_URL}/dashboard/trends`);
    return handleResponse(res);
  },

  async getNurses() {
    const res = await fetch(`${BASE_URL}/dashboard/nurses`);
    return handleResponse(res);
  },

  async getFeedbacks(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const res = await fetch(`${BASE_URL}/dashboard/feedbacks?${searchParams.toString()}`);
    return handleResponse(res);
  },

  // Admin & Incident Triage
  async getTriageQueue() {
    const res = await fetch(`${BASE_URL}/admin/triage`);
    return handleResponse(res);
  },

  async updateTriage(id, triageStatus, triageNotes) {
    const res = await fetch(`${BASE_URL}/admin/triage/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triageStatus, triageNotes })
    });
    return handleResponse(res);
  },

  // Demo Token Tools
  async getTokens() {
    const res = await fetch(`${BASE_URL}/admin/tokens`);
    return handleResponse(res);
  },

  async generateToken(payload) {
    const res = await fetch(`${BASE_URL}/admin/tokens/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Weekly Operations Digest
  async getWeeklyDigest() {
    const res = await fetch(`${BASE_URL}/admin/weekly-digest`);
    return handleResponse(res);
  },

  getExportCsvUrl() {
    return `${BASE_URL}/admin/export-csv`;
  }
};

export default api;
