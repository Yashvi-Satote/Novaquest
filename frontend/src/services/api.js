/**
 * API Service for Space in Time
 * Handles communication with Flask REST backend
 */

const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch backend health:', err);
    return {
      status: 'offline',
      database: 'unknown',
      database_connected: false,
      postgres_active: false,
      database_message: 'Cannot reach Flask backend server. Ensure backend is running on port 5000.',
      hardware_records_count: 0
    };
  }
}

export async function fetchFilters() {
  const res = await fetch(`${API_BASE}/filters`);
  if (!res.ok) throw new Error(`Failed to fetch filters: ${res.statusText}`);
  return await res.json();
}

export async function fetchHardware(params = {}) {
  const query = new URLSearchParams();
  
  if (params.q) query.set('q', params.q);
  if (params.destination && params.destination !== 'All') query.set('destination', params.destination);
  if (params.mission) query.set('mission', params.mission);
  if (params.status && params.status !== 'All') query.set('status', params.status);
  if (params.organization && params.organization !== 'All') query.set('organization', params.organization);
  if (params.object_type && params.object_type !== 'All') query.set('object_type', params.object_type);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);

  const res = await fetch(`${API_BASE}/hardware?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch hardware: ${res.statusText}`);
  return await res.json();
}

export async function fetchHardwareDetail(id) {
  const res = await fetch(`${API_BASE}/hardware/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch hardware detail for ID ${id}: ${res.statusText}`);
  return await res.json();
}

export async function fetchHardwareImages(id) {
  const res = await fetch(`${API_BASE}/hardware/${id}/images`);
  if (!res.ok) throw new Error(`Failed to fetch images for ID ${id}: ${res.statusText}`);
  return await res.json();
}
