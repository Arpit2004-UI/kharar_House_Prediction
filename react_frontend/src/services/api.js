const BASE = '/api';

/**
 * POST house features → returns { success, price } or { success, error }
 */
export async function predictPrice(formData) {
  try {
    console.log('Sending prediction request:', formData);
    const res = await fetch(`${BASE}/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(formData),
    });

    const data = await res.json();
    console.log('Prediction response:', data);
    
    if (!res.ok) {
      throw new Error(data.error || `Server error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error('Prediction error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * GET /api/health  → { status, model, r2 }
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE}/health`);
    return await res.json();
  } catch {
    return { status: 'offline' };
  }
}

/**
 * POST house features → returns { success, images, location, property_type }
 */
export async function getHouseImages(formData) {
  try {
    const res = await fetch(`${BASE}/house-images`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(formData),
    });

    if (!res.ok) throw new Error(`Server error ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * POST house features → returns { success, listings, search_criteria }
 */
export async function getHouseListings(formData) {
  try {
    const res = await fetch(`${BASE}/house-listings`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(formData),
    });

    if (!res.ok) throw new Error(`Server error ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
