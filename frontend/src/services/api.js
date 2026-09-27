/**
 * PlantGuard AI API Client.
 * Handles communication with the FastAPI backend with offline resiliency and error normalization.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch backend health status and system telemetry.
 */
export async function getHealthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend currently offline or unreachable:', error.message);
    return {
      status: 'offline',
      model_loaded: false,
      demo_mode: true,
      device: 'N/A',
      error: error.message
    };
  }
}

/**
 * Upload an image file for disease prediction and Grad-CAM generation.
 * @param {File|Blob} imageFile 
 * @returns {Promise<Object>}
 */
export async function predictDisease(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.detail || `Server returned error status ${response.status}`;
      throw new Error(detail);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing disease prediction:', error);
    throw error;
  }
}

/**
 * Fetch all 38 supported disease knowledge profiles.
 */
export async function getDiseasesCatalog() {
  try {
    const response = await fetch(`${API_BASE_URL}/diseases`);
    if (!response.ok) {
      throw new Error(`Failed to load disease directory: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching disease catalog:', error);
    throw error;
  }
}

/**
 * Fetch model performance metrics and dataset telemetry.
 */
export async function getSystemStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error(`Failed to load system statistics: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return {
      total_classes: 38,
      model_status: 'Offline / Standalone',
      accuracy: null,
      dataset: { train: 0, validation: 0, test: 0, synthetic: 0 },
      gan_status: { checkpoints_available: 0, synthetic_images_generated: 0 }
    };
  }
}
