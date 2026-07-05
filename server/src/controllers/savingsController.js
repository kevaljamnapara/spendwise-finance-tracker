import SavingsGoal from '../models/SavingsGoal.js';

// @desc    Get all savings goals for user
// @route   GET /api/v1/savings
// @access  Private
export const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new savings goal
// @route   POST /api/v1/savings
// @access  Private
export const createSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;
    
    const goal = await SavingsGoal.create({
      user: req.user._id,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal
// @route   PUT /api/v1/savings/:id
// @access  Private
export const updateSavingsGoal = async (req, res, next) => {
  try {
    let goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Savings goal not found');
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this goal');
    }

    goal = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Savings goal updated successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/v1/savings/:id
// @access  Private
export const deleteSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Savings goal not found');
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this goal');
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Savings goal deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
