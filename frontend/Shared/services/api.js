/**
 * API Service for Novaquest
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

export async function fetchNovaBaseHealth() {
  try {
    const res = await fetch(`${API_BASE}/novabase/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch NovaBase health:', err);
    return {
      status: 'offline',
      total_spacecraft: 0,
      complete_spacecraft: 0,
      all_sections_populated: false,
      per_spacecraft: [],
      missing_seed_missions: [],
      errors: ['Cannot reach /api/novabase/health.'],
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

export async function fetchHardwareDetail(idOrSlug) {
  const res = await fetch(`${API_BASE}/hardware/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw new Error(`Failed to fetch hardware detail for "${idOrSlug}": ${res.statusText}`);
  return await res.json();
}

export async function fetchHardwareImages(id) {
  const res = await fetch(`${API_BASE}/hardware/${id}/images`);
  if (!res.ok) throw new Error(`Failed to fetch images for ID ${id}: ${res.statusText}`);
  return await res.json();
}

export async function fetchMissions(params = {}) {
  const query = new URLSearchParams();
  if (params.destination && params.destination !== 'All') query.set('destination', params.destination);
  const res = await fetch(`${API_BASE}/missions?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch missions: ${res.statusText}`);
  return await res.json();
}

export async function fetchMissionDetail(missionId) {
  const res = await fetch(`${API_BASE}/missions/${missionId}`);
  if (!res.ok) throw new Error(`Failed to fetch mission ${missionId}: ${res.statusText}`);
  return await res.json();
}

export async function fetchSpacecraft(params = {}) {
  return fetchHardware(params);
}

export async function fetchSpacecraftDetail(idOrSlug) {
  return fetchHardwareDetail(idOrSlug);
}

export async function fetchMapObjects(params = {}) {
  const query = new URLSearchParams();
  if (params.type && params.type !== 'all') query.set('type', params.type);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.parent && params.parent !== 'all') query.set('parent', params.parent);
  if (params.q) query.set('q', params.q);

  const res = await fetch(`${API_BASE}/map/objects?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch map objects: ${res.statusText}`);
  return await res.json();
}

export async function fetchMapFilters() {
  const res = await fetch(`${API_BASE}/map/filters`);
  if (!res.ok) throw new Error(`Failed to fetch map filters: ${res.statusText}`);
  return await res.json();
}

export async function fetchSpacecraftMissions(idOrSlug) {
  const res = await fetch(`${API_BASE}/spacecraft/${encodeURIComponent(idOrSlug)}/missions`);
  if (!res.ok) throw new Error(`Failed to fetch missions for ${idOrSlug}: ${res.statusText}`);
  return await res.json();
}

export async function fetchSpacecraftModel(idOrSlug) {
  const res = await fetch(`${API_BASE}/spacecraft/${encodeURIComponent(idOrSlug)}/model`);
  if (!res.ok) throw new Error(`Failed to fetch model for ${idOrSlug}: ${res.statusText}`);
  return await res.json();
}

export async function fetchMissionSpacecraft(idOrSlug) {
  const res = await fetch(`${API_BASE}/missions/${encodeURIComponent(idOrSlug)}/spacecraft`);
  if (!res.ok) throw new Error(`Failed to fetch spacecraft for mission ${idOrSlug}: ${res.statusText}`);
  return await res.json();
}

export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error(`Failed to fetch 3D models: ${res.statusText}`);
  return await res.json();
}

export async function fetchModelDetail(modelName) {
  const res = await fetch(`${API_BASE}/models/${encodeURIComponent(modelName)}`);
  if (!res.ok) throw new Error(`Failed to fetch model "${modelName}": ${res.statusText}`);
  return await res.json();
}

