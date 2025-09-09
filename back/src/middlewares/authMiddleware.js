import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  console.log('🔐 AuthMiddleware ejecutándose para:', req.url);
  console.log('Token recibido:', req.cookies.token ? 'EXISTE' : 'NO EXISTE');
  
  const token = req.cookies.token;
  if (!token) {
    console.log('❌ No hay token en cookies');
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido para usuario:', decoded.email);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Error de token:', err.message);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export default authMiddleware;
