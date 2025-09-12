const SENSITIVE_FIELDS = new Set([
  "password",
  "__v",
  "resetToken",
  "resetTokenExp",
  "verificationCode",
  "twoFactorSecret"
]);

const stripSensitive = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const clean = { ...obj };
  for (const key of SENSITIVE_FIELDS) {
    if (key in clean) delete clean[key];
  }
  return clean;
};

const toPublicOne = (userDoc) => {
  if (!userDoc || typeof userDoc !== "object") return userDoc;
  // Si es un documento de Mongoose, convertir a objeto plano
  const plain = typeof userDoc.toObject === "function" ? userDoc.toObject() : userDoc;
  const clean = stripSensitive(plain);
  return {
    _id: clean._id,
    firstName: clean.firstName,
    lastName: clean.lastName,
    documentType: clean.documentType,
    documentNumber: clean.documentNumber,
    birthDate: clean.birthDate,
    email: clean.email,
    postalCode: clean.postalCode,
    address: clean.address,
    addressNumber: clean.addressNumber,
    apartment: clean.apartment,
    province: clean.province,
    city: clean.city,
    areaCode: clean.areaCode,
    phone: clean.phone,
    role: clean.role,
    lastLogin: clean.lastLogin,
    institutionalID: clean.institutionalID,
    profileImage: clean.profileImage,
    assignedTraining: clean.assignedTraining,
    createdAt: clean.createdAt,
    updatedAt: clean.updatedAt
  };
};

export const UserResponseFormatter = {
  /**
   * Un usuario -> público
   */
  toPublic(userDoc) {
    return toPublicOne(userDoc);
  },

  /**
   * Página paginada -> público
   * Acepta forma { items, total, page, limit } o similares
   */
  toPublicList(paged = {}) {
    const items = Array.isArray(paged.items) ? paged.items : [];
    const total = Number.isFinite(paged.total) ? paged.total : items.length;
    const page = Number.isFinite(paged.page) ? paged.page : 1;
    const limit = Number.isFinite(paged.limit) ? paged.limit : items.length || 0;

    return {
      total,
      page,
      limit,
      items: items.map(toPublicOne)
    };
  }
};
export default UserResponseFormatter;