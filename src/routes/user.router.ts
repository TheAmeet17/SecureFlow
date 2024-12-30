import { Router } from "express";
import { createUser, getUser, updateUser, deleteUser } from "../controller/user.controller"
import { validateUser } from "../validators/validateUser";

const router = Router();

router.post('/create', validateUser, createUser);
router.get('/get', getUser);
router.put('/update/:id', validateUser, updateUser);
router.delete('/delete/:id', deleteUser);

export default router;
