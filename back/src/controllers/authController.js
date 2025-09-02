/**
 * C.Auth.Login — Controlador de autenticación
 * SRP: orquesta validación de entrada + servicio de auth + formateo de salida
 * DIP: depende de interfaces inyectadas (no de implementaciones concretas)
 *
 * Rutas esperadas:
 *   POST /api/v1/auth/login  { email, password }
 */

export const makeAuthController = ({ authService, loginValidator, responseFormatter }) => ({
  /**
   * C.Auth.Login
   */
  login: async (req, res, next) => {
    try {
      // 1) Normalización mínima (permitimos 'email' o 'mail' por compatibilidad)
      const body = {
        email: (req.body?.email ?? req.body?.mail ?? "").toString(),
        password: (req.body?.password ?? "").toString()
      };

      // 2) Valida formato (no toca BD)
      const { isValid, errors } = loginValidator.validate(body);
      if (!isValid) {
        return res
          .status(400)
          .json({ code: "AUTH_400", message: "Datos inválidos", details: errors });
      }

      // 3) Autentica contra BD (bcryptjs/bcrypt según tu service)
      const user = await authService.authenticate(body.email, body.password);
      if (!user) {
        return res
          .status(401)
          .json({ code: "AUTH_401", message: "Credenciales inválidas" });
      }

      // 4) Formatea salida (oculta sensibles si el formatter lo hace)
      const payload = responseFormatter.formatSuccess(user);
      return res.json(payload);

      // Si más adelante querés JWT:
      // import jwt from "jsonwebtoken";
      // const token = jwt.sign({ sub: user._id, role: user.tipo }, process.env.JWT_SECRET, { expiresIn: "12h" });
      // return res.json({ user: responseFormatter.formatSuccess(user), token });

    } catch (err) {
      next(err);
    }
  }
});
