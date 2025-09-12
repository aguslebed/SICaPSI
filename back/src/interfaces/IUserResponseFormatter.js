// Interface-like base class for User response formatting
export class IUserResponseFormatter {
  toPublic(userDoc) {
    throw new Error("Method 'toPublic' must be implemented");
  }
  toPublicList(pagedOrArray) {
    throw new Error("Method 'toPublicList' must be implemented");
  }
}

export default IUserResponseFormatter;