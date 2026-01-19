// services/procedureService.js
import api from '../api/baseapi';

export const procedureService = {
  // ดึงรายการผู้ป่วย AN ทั้งหมด
  async getANPatients() {
    try {
      // ใช้ params object แทนการต่อ query string
      const response = await api.get('/service-registrations', {
        params: {
          patientType: 'AN',
          status: 'active'
        }
      });
      return response.data; // Axios return data in .data
    } catch (error) {
      console.error('Get AN patients error:', error);
      throw error;
    }
  },

  // ดึงข้อมูล procedure types
  async getProcedureTypes() {
    try {
      const response = await api.get('/procedure-types');
      return response.data;
    } catch (error) {
      console.error('Get procedure types error:', error);
      throw error;
    }
  },

  // ดึงหมายเลขเครื่อง
  async getMachineNumbers() {
    try {
      const response = await api.get('/util/machines');
      return response.data;
    } catch (error) {
      console.error('Get machine numbers error:', error);
      throw error;
    }
  },

  // สร้างใบบันทึกการดูแล
  async createProcedureRecord(data) {
    try {
      const response = await api.post('/procedure-records', data);
      return response.data;
    } catch (error) {
      console.error('Create procedure record error:', error);
      throw error;
    }
  }
};