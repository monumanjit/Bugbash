import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../../db/pool.js";
import { env } from "../../config/env.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const userResult = await db.query(
      `SELECT id, organization_id, factory_id, role, email, password_hash, is_active
       FROM app_user WHERE email=$1 LIMIT 1`,
      [email]
    );

    const user = userResult.rows[0];
    if (!user || !user.is_active) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.id,
        organizationId: user.organization_id,
        factoryId: user.factory_id,
        role: user.role,
        email: user.email
      },
      env.jwtSecret,
      { expiresIn: env.jwtTtl }
    );

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});
