export class TrainingResponseFormatter {
  format(training) {
    return {
      _id: training._id,
      title: training.title,
      subtitle: training.subtitle,
      description: training.description,
      image: training.image,
      isActive: training.isActive,
      totalLevels: training.totalLevels,
      introduction: training.introduction,
      createdBy: training.createdBy,
      levels: training.levels,
      report: training.report,
      progressPercentage: training.progressPercentage
    };
  }
}

export default TrainingResponseFormatter;
