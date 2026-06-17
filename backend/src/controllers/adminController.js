const priceService = require('../services/priceService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Price = require('../models/Price');
const User = require('../models/User');

// Admin: Get all prices (admin view)
exports.getAllPrices = asyncHandler(async (req, res) => {
  const prices = await priceService.getAllPrices(req.query);
  res.status(200).json(new ApiResponse(200, prices, 'Admin: Prices retrieved successfully'));
});

// Admin: Create a new price record
exports.createPrice = asyncHandler(async (req, res) => {
  const newPrice = await priceService.createPrice(req.body);
  res.status(201).json(new ApiResponse(201, newPrice, 'Admin: Price created successfully'));
});

// Admin: Delete a price record
exports.deletePrice = asyncHandler(async (req, res) => {
  const deletedPrice = await priceService.deletePrice(req.params.priceId);
  if (!deletedPrice) {
    throw new ApiError(404, 'Price record not found');
  }
  res.status(200).json(new ApiResponse(200, {}, 'Admin: Price deleted successfully'));
});

// Admin: Update a price record (partial)
exports.updatePrice = asyncHandler(async (req, res) => {
  const updatedPrice = await priceService.updatePrice(req.params.priceId, req.body);
  if (!updatedPrice) {
    throw new ApiError(404, 'Price record not found');
  }
  res.status(200).json(new ApiResponse(200, updatedPrice, 'Admin: Price updated successfully'));
});

// Admin: Dashboard summary
exports.getDashboard = asyncHandler(async (req, res) => {
  const totalPrices = await Price.countDocuments();
  const totalCountries = (await Price.distinct('country')).length;
  const totalIndicators = (await Price.distinct('indicator')).length;
  const yearRange = {
    min: await Price.findOne().sort('year').select('year').lean(),
    max: await Price.findOne().sort('-year').select('year').lean()
  };

  res.status(200).json(new ApiResponse(200, {
    totalPrices,
    totalCountries,
    totalIndicators,
    yearRange: {
      from: yearRange.min?.year,
      to: yearRange.max?.year
    }
  }, 'Admin: Dashboard data retrieved'));
});

// Admin: Quick stats
exports.getStats = asyncHandler(async (req, res) => {
  const stats = await Price.aggregate([
    {
      $group: {
        _id: null,
        avgValue: { $avg: '$value' },
        maxValue: { $max: '$value' },
        minValue: { $min: '$value' },
        totalRecords: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json(new ApiResponse(200, stats[0] || {}, 'Admin: Stats retrieved'));
});

// Admin: Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json(new ApiResponse(200, users, 'Admin: Users retrieved successfully'));
});

// Admin: Create a new user
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide name, email and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const newUser = await User.create({ name, email, password, role });
  const userResponse = newUser.toObject();
  delete userResponse.password;

  res.status(201).json(new ApiResponse(201, userResponse, 'Admin: User created successfully'));
});

// Admin: Update a user
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (password) user.password = password; // pre-save hook will hash it

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json(new ApiResponse(200, userResponse, 'Admin: User updated successfully'));
});

// Admin: Delete a user
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Admin cannot delete themselves');
  }

  await User.findByIdAndDelete(req.params.userId);

  res.status(200).json(new ApiResponse(200, {}, 'Admin: User deleted successfully'));
});
