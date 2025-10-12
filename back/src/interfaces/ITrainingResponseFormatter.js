export class ITrainingResponseFormatter {
  format(trainingDoc) {
    throw new Error("Method 'format' must be implemented");
  }
}

export default ITrainingResponseFormatter;