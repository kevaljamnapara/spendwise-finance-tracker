import mongoose from 'mongoose';

const categorySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Please specify category type'],
    },
    color: {
      type: String,
      default: '#000000',
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
