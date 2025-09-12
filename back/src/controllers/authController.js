// authController.js
import AppError from '../middlewares/AppError.js';

export const makeAuthController = ({ authService, loginValidator, tokenService }) => ({
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
      if (!isValid) throw new AppError("Datos inválidos", 400, "AUTH_400", errors);

      // 3) Autentica contra BD
      const user = await authService.authenticate(body.email, body.password);
      if (!user) {
        throw new AppError("Credenciales inválidas", 401, "AUTH_401");
      }

      // 4) Genera token JWT con payload completo
      const token = tokenService.sign({
        userId: user._id || user.id,
        email: user.email,
        role: user.role || 'user',
        sub: user._id
      });

      // 5) Cookie segura con configuración adaptable
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 12 * 60 * 60 * 1000
      });

      // 6) Devolver solo el token y un mensaje de éxito
      return res.json({
        message: 'Login exitoso',
        token: null // El frontend puede ignorar este campo si usa la cookie
      });

    } catch (err) {
      next(err);
    }
  },

  logout: (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });
    res.json({ message: 'Logout exitoso' });
  },

  checkAuth: async (req, res, next) => {
    try {
      // Solo verifica si el usuario está autenticado
      res.json({ authenticated: true });
    } catch (error) {
      next(error);
    }
  }
});