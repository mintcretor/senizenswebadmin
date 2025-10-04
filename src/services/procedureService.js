// services/procedureService.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const procedureService = {
  // ดึงรายการผู้ป่วย AN ทั้งหมด
  async getANPatients() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/service-registrations?patientType=AN&status=active`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get AN patients error:', error);
      throw error;
    }
  },

  // ดึงข้อมูล procedure types
  async getProcedureTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/procedure-types`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get procedure types error:', error);
      throw error;
    }
  },

  // ดึงหมายเลขเครื่อง
  async getMachineNumbers() {
    try {
      const response = await fetch(`${API_BASE_URL}/machines`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get machine numbers error:', error);
      throw error;
    }
  },

  // สร้างใบบันทึกการดูแล
  async createProcedureRecord(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/procedure-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create procedure record error:', error);
      throw error;
    }
  }
};