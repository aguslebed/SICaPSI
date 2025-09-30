import AppError from '../middlewares/AppError.js';



export function makeEnrollmentController({ enrollmentService }) {
  return {

    async enrollStudent(req, res, next) {
      try {
        const { userIds, trainingId } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({ error: "Se necesita un arreglo de ids de usuarios" });
        }

        const results = [];

        for (const userId of userIds) {
          try {
            const result = await enrollmentService.enrollUserToTraining(userId, trainingId);
            results.push({ userId, status: "success", message: result.message });
          } catch (err) {
            results.push({ userId, status: "error", message: err.message });
          }
        }

        res.status(201).json({ trainingId, results });
      } catch (err) {
        next(err);
      }
    },


    async unenrollStudent(req, res, next) {
      try {
        const { userIds, trainingId } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({ error: "Se necesita un arreglo de ids de usuarios" });
        }

        const results = [];

        for (const userId of userIds) {
          try {
            const result = await enrollmentService.unenrollUserToTraining(userId, trainingId);
            results.push({ userId, status: "success", message: result.message });
          } catch (err) {
            results.push({ userId, status: "error", message: err.message });
          }
        }

        res.status(201).json({ trainingId, results });
      } catch (err) {
        next(err);
      }
    }


  };
}
