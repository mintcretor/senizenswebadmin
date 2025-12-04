const { ProcedureRecordModel } = require('../models/procedureRecordModel');

class ProcedureRecordController {
    // POST /api/procedure-records
    static async create(req, res) {
        try {
            const {
                serviceRegistrationId,
                patientId,
                admissionId,
                recordDate,
                recordTime,
                shift,
                note,
                procedures,
                nonChargeableProcedures,
                imageUrls,  /* 🆕 เพิ่มบรรทัดนี้ */
                createdBy
            } = req.body;

            // Validate required fields
            if (!serviceRegistrationId || !patientId || !recordDate || !recordTime || !shift) {
                return res.status(400).json({
                    success: false,
                    error: 'serviceRegistrationId, patientId, recordDate, recordTime, and shift are required'
                });
            }

            const result = await ProcedureRecordModel.create({
                serviceRegistrationId,
                patientId,
                admissionId,
                recordDate,
                recordTime,
                shift,
                note,
                procedures: procedures || [],
                nonChargeableProcedures: nonChargeableProcedures || [],
                imageUrls: imageUrls || [],  /* 🆕 เพิ่มบรรทัดนี้ */
                createdBy
            });

            res.status(201).json({
                success: true,
                data: result,
                message: 'บันทึกหัตถการสำเร็จ'
            });
        } catch (error) {
            console.error('Create procedure record error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/procedure-records
    static async getAll(req, res) {
        try {
            const filters = {
                patientId: req.query.patientId,
                serviceRegistrationId: req.query.serviceRegistrationId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                shift: req.query.shift
            };

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;

            const result = await ProcedureRecordModel.getAll(filters, limit, offset);

            const baseUrl = `https://api.thesenizens.com`;

            const dataWithFullUrls = result.data.map(record => ({
                ...record,
                image_urls: (record.image_urls || []).map(path => {
                    if (path.startsWith('http')) return path;
                    return `${baseUrl}${path}`;
                })
            }));

            res.json({
                success: true,
                data: dataWithFullUrls,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            console.error('Get procedure records error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/procedure-records/:id
    static async getById(req, res) {
        try {
            const { id } = req.params;

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID format'
                });
            }

            const record = await ProcedureRecordModel.getById(id);

            if (!record) {
                return res.status(404).json({
                    success: false,
                    error: 'Procedure record not found'
                });
            }

            const baseUrl = `https://api.thesenizens.com`;
            const recordWithFullUrls = {
                ...record,
                image_urls: (record.image_urls || []).map(path => {
                    if (path.startsWith('http')) return path;
                    return `${baseUrl}${path}`;
                })
            };

            res.json({
                success: true,
                data: recordWithFullUrls
            });
        } catch (error) {
            console.error('Get procedure record error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/procedure-records/patient/:patientId
    static async getByPatient(req, res) {
        try {
            const { patientId } = req.params;
            const records = await ProcedureRecordModel.getByPatient(patientId);

            res.json({
                success: true,
                data: records
            });
        } catch (error) {
            console.error('Get procedure records by patient error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // PUT /api/procedure-records/:id
    static async update(req, res) {
        try {
            const { id } = req.params;

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID format'
                });
            }

            const record = await ProcedureRecordModel.update(id, req.body);

            if (!record) {
                return res.status(404).json({
                    success: false,
                    error: 'Procedure record not found'
                });
            }

            res.json({
                success: true,
                data: record,
                message: 'แก้ไขหัตถการสำเร็จ'
            });
        } catch (error) {
            console.error('Update procedure record error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // DELETE /api/procedure-records/:id
    static async delete(req, res) {
        try {
            const { id } = req.params;

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID format'
                });
            }

            const result = await ProcedureRecordModel.delete(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'Procedure record not found'
                });
            }

            res.json({
                success: true,
                message: 'ลบหัตถการสำเร็จ'
            });
        } catch (error) {
            console.error('Delete procedure record error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async updateImages(req, res) {
        try {
            const { id } = req.params;
            const { imageUrls } = req.body;

            if (!Array.isArray(imageUrls)) {
                return res.status(400).json({
                    success: false,
                    error: 'imageUrls must be an array'
                });
            }

            const record = await ProcedureRecordModel.updateImages(id, imageUrls);

            if (!record) {
                return res.status(404).json({
                    success: false,
                    error: 'Procedure record not found'
                });
            }

            res.json({
                success: true,
                data: record,
                message: 'อัพเดทรูปภาพสำเร็จ'
            });
        } catch (error) {
            console.error('Update images error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/procedure-records/statistics/images
    static async getImageStatistics(req, res) {
        try {
            const stats = await ProcedureRecordModel.getImageStatistics();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

}

module.exports = ProcedureRecordController;