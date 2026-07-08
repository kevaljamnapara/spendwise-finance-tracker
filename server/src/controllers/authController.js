import User from '../models/User.js';
import Category from '../models/Category.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

/**
 * What this file does: 
 * Handles all authentication-related API requests: user registration, login, logout, and profile management.
 * 
 * Why this logic exists: 
 * Security is paramount. This controller abstracts the logic for verifying user credentials, 
 * hashing passwords (via the User model), and issuing JSON Web Tokens (JWT) for secure, stateless authentication.
 */

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
/**
 * Input: User registration details (name, email, password) from req.body.
 * Output: Success message and user data (without password), sets JWT cookie.
 * Flow:
 * 1. Check if user email already exists.
 * 2. Create the user in MongoDB.
 * 3. Seed default expense/income categories for the new user.
 * 4. Generate a JWT token and send the response.
 */
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

    // Early return if user creation failed
    if (!user) {
      res.status(400);
      throw new Error('Invalid user data');
    }

    // Create default categories for the new user to start with a usable state
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
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
/**
 * Input: Login credentials (email, password).
 * Output: User profile and JWT cookie on success; Error on failure.
 * Flow:
 * 1. Find user by email.
 * 2. Use the User model's matchPassword method to compare hashed passwords.
 * 3. Generate JWT if successful.
 */
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Ensure user exists AND the password matches the hash in DB
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

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
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
/**
 * Input: None.
 * Output: Success message.
 * Flow: Clears the HTTP-only JWT cookie to invalidate the session.
 */
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiration to the past to immediately delete the cookie
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
/**
 * Input: HTTP Request (requires valid JWT token to reach here).
 * Output: The authenticated user's profile data.
 * Flow:
 * 1. Retrieve the user ID from req.user (injected by authMiddleware).
 * 2. Fetch from DB and return.
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

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
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
/**
 * Input: New profile data (name, email, avatar).
 * Output: Updated user profile data.
 * Flow:
 * 1. Find user by ID.
 * 2. If email is changing, verify the new email isn't taken.
 * 3. Update fields and save to DB.
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

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
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/v1/auth/password
// @access  Private
/**
 * Input: Current password and new password.
 * Output: Success message.
 * Flow:
 * 1. Verify current password matches.
 * 2. Update password field.
 * 3. Save (Mongoose pre-save hook will hash the new password).
 */
export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { currentPassword, newPassword } = req.body;
    
    // Compare submitted current password with DB hash
    if (!(await user.matchPassword(currentPassword))) {
      res.status(401);
      throw new Error('Incorrect current password');
    }

    user.password = newPassword;
    await user.save(); // Hashing happens automatically in User.js pre-save middleware

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
/**
 * Input: User email address.
 * Output: Success message indicating email was sent.
 * Flow:
 * 1. Find user by email.
 * 2. Generate reset token and save hashed version to DB.
 * 3. Construct reset URL and send via email.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404);
      throw new Error('There is no user with that email');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
        html: `<p>You are receiving this email because you (or someone else) has requested the reset of a password.</p><p>Please click this link to reset your password:</p><a href="${resetUrl}" target="_blank">Reset Password</a>`,
      });

      res.status(200).json({
        success: true,
        message: 'Email sent',
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500);
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
/**
 * Input: Reset token from URL params, new password from body.
 * Output: Success message and new JWT token.
 * Flow:
 * 1. Hash the provided URL token.
 * 2. Find user by hashed token and ensure it hasn't expired.
 * 3. Update password and clear token fields.
 * 4. Generate a new JWT session.
 */
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    generateToken(res, user._id);
    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate reset password token
// @route   GET /api/v1/auth/resetpassword/:resettoken
// @access  Public
export const validateResetToken = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
    });
  } catch (error) {
    next(error);
  }
};
