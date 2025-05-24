import Router from 'express'
import { loginPage,userLogin } from '../Controllers/LoginController.js'

const router = Router()

router.get('/login',loginPage)
router.post('/login',userLogin)
// router.get('/user/:username',userController)

export default router