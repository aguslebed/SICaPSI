// Servicio concreto para reportes
import { IReportService } from '../interfaces/IReportService.js';

export class ReportService extends IReportService {
  constructor({ ReportModel, CourseModel, LevelModel }) {
    super();
    this.Report = ReportModel;
    this.Course = CourseModel;
    this.Level = LevelModel;
  }

  async getReportsForUser(userId) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return await this.Report.find({ userId, createdAt: { $gte: threeMonthsAgo } })
      .populate('courseId', 'title', this.Course)
      .populate('levelId', 'levelNumber title', this.Level)
      .sort({ createdAt: -1 })
      .exec();
  }
}

export default ReportService;
