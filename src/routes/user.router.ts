import { Router } from "express";
import { createUser, getUser, updateUser, deleteUser } from "../controller/user.controller"
import { validateUser } from "../validators/validateUser";
import {adminMiddleware} from "../middleware/adminMiddleware"
import { approveUser } from "../controller/user.controller";

const router = Router();

router.post('/create', validateUser, createUser);

router.put('/approve/:userId', adminMiddleware, approveUser);
router.get('/get', getUser);
router.put('/update/:id', validateUser, updateUser);
router.delete('/delete/', deleteUser);

export default router;
