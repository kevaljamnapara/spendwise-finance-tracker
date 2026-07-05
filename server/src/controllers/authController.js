import User from '../models/User.js';
import Category from '../models/Category.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Create default categories
      const defaultCategories = [
        // Expenses
        { user: user._id, name: 'Food & Dining', type: 'expense', color: '#f87171' },
        { user: user._id, name: 'Transportation', type: 'expense', color: '#60a5fa' },
        { user: user._id, name: 'Housing', type: 'expense', color: '#34d399' },
        { user: user._id, name: 'Utilities', type: 'expense', color: '#fbbf24' },
        { user: user._id, name: 'Entertainment', type: 'expense', color: '#a78bfa' },
        { user: user._id, name: 'Healthcare', type: 'expense', color: '#f472b6' },
        { user: user._id, name: 'Shopping', type: 'expense', color: '#38bdf8' },
        // Incomes
        { user: user._id, name: 'Salary', type: 'income', color: '#34d399' },
        { user: user._id, name: 'Freelance', type: 'income', color: '#60a5fa' },
        { user: user._id, name: 'Investments', type: 'income', color: '#818cf8' },
      ];
      await Category.insertMany(defaultCategories);

      generateToken(res, user._id);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully', 
    data: null 
  });
};

// @desc    Get user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.avatar !== undefined) {
        user.avatar = req.body.avatar;
      }

      // Ensure new email isn't already taken by another user
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          res.status(400);
          throw new Error('Email is already in use by another account');
        }
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/v1/auth/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { currentPassword, newPassword } = req.body;
      
      if (!(await user.matchPassword(currentPassword))) {
        res.status(401);
        throw new Error('Incorrect current password');
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully',
        data: null
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
