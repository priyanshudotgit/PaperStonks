import { Router } from "express";

import protect from "../middleware/auth.middleware.js";
import { register, login, getMe, refreshToken, logout } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", protect, getMe);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);

export default authRouter;