// authController.js
/**
 * C.Auth.Login — Controlador de autenticación
 */
import jwt from 'jsonwebtoken';
import AppError from '../middlewares/AppError.js';
import { getUserCompleteData } from '../services/userDataService.js';

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
        secure: true,
        sameSite: 'none',
        maxAge: 12 * 60 * 60 * 1000
      });

      // 6) OBTENER DATOS COMPLETOS DEL USUARIO
      const userCompleteData = await getUserCompleteData(user._id);

      // 7) Formatear respuesta EXACTAMENTE como espera el frontend
      console.log("📦 Datos completos que se enviarán al frontend:", JSON.stringify(userCompleteData, null, 2));

      // 8) Devolver en el formato que espera el frontend: { user: data, token: null }
      return res.json({
        user: userCompleteData, // ← Todos los datos completos aquí
        token: null // ← Tu frontend espera este campo aunque no lo use
      });

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

  checkAuth: async (req, res, next) => {
    try {
      // Obtener datos completos al verificar autenticación también
      const userCompleteData = await getUserCompleteData(req.user.userId);
      
      console.log("🔐 Datos de checkAuth:", JSON.stringify(userCompleteData, null, 2));
      
      // Devolver en el formato que espera el frontend
      res.json({ 
        user: userCompleteData,
        token: null
      });
    } catch (error) {
      next(error);
    }
  }
});