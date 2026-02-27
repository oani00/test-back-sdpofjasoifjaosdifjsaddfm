const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../config/multer');

/**
 * @desc Get all users
 */
router.get('/SignUp/GetAllUsers', userController.getAllUsers);

/**
 * @desc Get a user by their ID
 */
router.get('/SignUp/GetUserById/:id', userController.getUserById);

/**
 * @desc Create a new user
 */
router.post('/SignUp/CreateUser', userController.createUser);

/**
 * @desc Delete a user by their ID
 */
router.delete('/SignUp/DeleteUserById/:id', userController.deleteUserById);

/**
 * @desc Log in a user by their ID
 */
router.post('/SignUp/login/:userId', userController.loginUser);

/**
 * @desc Change user type (promote/demote between user and admin)
 */
router.put('/SignUp/ChangeUserType/:id', userController.changeUserType);

/**
 * @desc Upload a profile picture for a user
 */
router.post('/users/:id/picture', upload.single('picture'), userController.uploadUserPicture);



//TODO documentar
router.post('/users/:userId/subscribe/:excursionId', userController.subscribeToExcursion);
router.post('/users/:userId/unsubscribe/:excursionId', userController.unsubscribeFromExcursion);


module.exports = router;
