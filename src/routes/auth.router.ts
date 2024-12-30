import { Router } from "express";
import {loginUser,logoutUser, forgotPassword, signupUser } from "../controller/auth.controller";


const router=Router();


router.post('/signup',signupUser);
router.post('/login',loginUser);
router.post('/logout',logoutUser);
router.post('/forgetPassword',forgotPassword);


//router.post('/auth/google',authGoogle),

export default router