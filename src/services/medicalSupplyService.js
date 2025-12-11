// src/services/medicalSupplyService.js
import api from '../api/baseapi';

export const medicalSupplyService = {
  // Get all supplies
  getAllSupplies: async () => {
    return await api.get('/medical-supplies');
  },

  // Get supply by ID
  getSupplyById: async (id) => {
    return await api.get(`/medical-supplies/${id}`);
  },

  // Create supply
  createSupply: async (data) => {
    return await api.post('/medical-supplies', data);
  },

  // Update supply
  updateSupply: async (id, data) => {
    return await api.put(`/medical-supplies/${id}`, data);
  },

  // Delete supply
  deleteSupply: async (id) => {
    return await api.delete(`/medical-supplies/${id}`);
  },

  // Get categories
  getCategories: async () => {
    return await api.get('/medical-supplies/categories');
  },

  // Get units
  getUnits: async () => {
    return await api.get('/medical-supplies/units');
  },

  // Get low stock alerts
  getLowStock: async () => {
    return await api.get('/medical-supplies/low-stock');
  },

  // Adjust stock
  adjustStock: async (id, adjustment, reason) => {
    return await api.post(`/medical-supplies/${id}/adjust-stock`, {
      adjustment,
      reason
    });
  },

  // Get usage history
  getUsageHistory: async (params) => {
    return await api.get('/medical-supplies/usage-history', { params });
  }
};