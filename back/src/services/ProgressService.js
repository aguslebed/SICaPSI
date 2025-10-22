import mongoose from "mongoose";
import UserLevelProgress from "../models/UserLevelProgress.js";
import Level from "../models/Level.js";

const toObjectId = (id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id);

class ProgressService {
  async markLevelCompleted(userId, trainingId, levelId) {
    // Upsert para idempotencia
    const doc = await UserLevelProgress.findOneAndUpdate(
      { userId: toObjectId(userId), levelId: toObjectId(levelId) },
      { userId: toObjectId(userId), trainingId: toObjectId(trainingId), levelId: toObjectId(levelId), status: "completed", completed: true, completedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc;
  }

  async getProgressByTraining(userId, trainingIds = []) {
    if (!Array.isArray(trainingIds) || trainingIds.length === 0) return {};

    const tIds = trainingIds.map(toObjectId);
    const uId = toObjectId(userId);

    // Totales de niveles por training
    const levelsAgg = await Level.aggregate([
      { $match: { trainingId: { $in: tIds } } },
      { $group: { _id: "$trainingId", totalLevels: { $sum: 1 } } }
    ]);

    const totalsMap = {};
    for (const row of levelsAgg) totalsMap[row._id.toString()] = row.totalLevels;

    // Niveles completados por usuario por training (filtrado al set dado)
    const completedAgg = await UserLevelProgress.aggregate([
      { $match: { userId: uId, completed: true, trainingId: { $in: tIds } } },
      { $group: { _id: "$trainingId", levelsCompleted: { $sum: 1 } } }
    ]);

    const completedMap = {};
    for (const row of completedAgg) completedMap[row._id.toString()] = row.levelsCompleted;

    const result = {};
    for (const tId of tIds) {
      const key = tId.toString();
      const total = totalsMap[key] || 0;
      const done = completedMap[key] || 0;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      result[key] = { totalLevels: total, levelsCompleted: done, progressPercent: pct };
    }
    return result;
  }

  async isLevelApproved(userId, trainingId, level) {
    const uId = toObjectId(userId);
    const tId = toObjectId(trainingId);
    const lId = toObjectId(level.);

  }


}
  

export default ProgressService;