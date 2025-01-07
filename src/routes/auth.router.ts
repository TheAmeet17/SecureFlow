import { Router } from "express";
import {loginUser,logoutUser, forgotPassword, signupUser } from "../controller/auth.controller";
import { apiLimiter } from "../utils/rateLimiting";

const router=Router();


router.post('/signup',apiLimiter,signupUser);
router.post('/login',apiLimiter,loginUser);
router.post('/logout',logoutUser);
router.post('/forgetPassword',apiLimiter,forgotPassword);


//router.post('/auth/google',authGoogle),

export default router