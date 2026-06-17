const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

const { adminLimiter, deleteLimiter } = require('../middlewares/rateLimiter');
const { createPriceValidator, updatePriceValidator } = require('../validators/priceValidator');
const { validate } = require('../middlewares/validate');

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));
router.use(adminLimiter);

router.get('/prices', adminController.getAllPrices);
router.post('/prices', createPriceValidator, validate, adminController.createPrice);
router.delete('/prices/:priceId', deleteLimiter, adminController.deletePrice);
router.patch('/prices/:priceId', updatePriceValidator, validate, adminController.updatePrice);
router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getStats);

// User Management CRUD
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
