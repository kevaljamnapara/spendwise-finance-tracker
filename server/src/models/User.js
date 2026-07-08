import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * User Model
 * Defines the MongoDB schema for a User and handles password hashing securely using bcrypt.
 */

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware using bcrypt.
// This pre-save hook runs automatically before a user document is saved to the database.
UserSchema.pre('save', async function () {
  // If the user isn't updating their password, skip hashing to save performance and prevent double-hashing
  if (!this.isModified('password')) {
    return;
  }
  // Generate a salt with 10 rounds (a good balance of security vs performance)
  const salt = await bcrypt.genSalt(10);
  if (this.password) {
    // Replace the plaintext password with the hashed version before saving to the DB
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Method to verify passwords during login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  // bcrypt.compare safely compares the plain text input with the stored hash
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire to 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Exclude password from the JSON response
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    return ret;
  }
});

const User = mongoose.model('User', UserSchema);
export default User;
