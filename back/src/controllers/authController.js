/**
 * C.Auth.Login — Controlador de autenticación
 */
import jwt from 'jsonwebtoken';
import AppError from '../middlewares/AppError.js';

export const makeAuthController = ({ authService, loginValidator, responseFormatter }) => ({
  /**
   * C.Auth.Login
   */
  login: async (req, res, next) => {
    try {
      // 1) Normalización mínima
      const body = {
        email: (req.body?.email ?? req.body?.mail ?? "").toString(),
        password: (req.body?.password ?? "").toString()
      };

      // 2) Valida formato
      const { isValid, errors } = loginValidator.validate(body);
      if (!isValid) {
        throw new AppError("Datos inválidos", 400, "AUTH_400", errors);
      }

      // 3) Autentica contra BD
      const user = await authService.authenticate(body.email, body.password);
      if (!user) {
        throw new AppError("Credenciales inválidas", 401, "AUTH_401");
      }

      // 4) Genera token JWT con payload completo
      const token = jwt.sign(
        { 
          userId: user._id || user.id,
          email: user.email,
          role: user.tipo || 'user',
          sub: user._id
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: "12h" }
      );

      // 5) Cookie segura con configuración adaptable
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, // debe ser true para sameSite: 'none'
        sameSite: 'none',
        maxAge: 12 * 60 * 60 * 1000
      });

      // 6) DELEGA el formateo al responseFormatter (ya elimina contraseña)
      const payload = responseFormatter.formatSuccess(user); 
      console.log("Usuario encontrado:", payload);
      return res.json({ user: payload, message: 'Login exitoso' });

    } catch (err) {
      next(err);
    }
  },

  logout: (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.json({ message: 'Logout exitoso' });
  },

  checkAuth: (req, res) => {
    // También usa el formatter para consistencia
    const userData = responseFormatter.formatSuccess({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      tipo: req.user.role // por compatibilidad
    });
    
    res.json({ 
      authenticated: true,
      user: userData
    });
  }
});