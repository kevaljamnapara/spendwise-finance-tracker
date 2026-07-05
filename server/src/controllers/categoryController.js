import Category from '../models/Category.js';

// @desc    Get all categories for user
// @route   GET /api/v1/categories
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private
export const createCategory = async (req, res, next) => {
  try {
    const { name, type, color } = req.body;
    
    const category = await Category.create({
      user: req.user._id,
      name,
      type,
      color: color || '#000000'
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private
export const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    if (category.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this record');
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    if (category.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this record');
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
