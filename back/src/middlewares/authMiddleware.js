export const makeAuthMiddleware = ({ tokenService }) => {
  return (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    try {
      const decoded = tokenService.verify(token);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};

export default makeAuthMiddleware;