
/**
 * Excursion Controller
 * Handles CRUD operations and user listing for excursions.
 */
const mongoose = require('mongoose');
const Excursion = require('../models/Excursion');
const User = require('../models/User');
const Picture = require('../models/Picture');

/**
 * List all excursions
 * @route GET /excursions
 * @returns {Excursion[]} excursions (populated with pictures and users)
 */
exports.getAllExcursions = async (req, res) => {
  try {
    const excursions = await Excursion.find()
      .populate('pictures', 'name contentType')
      .populate('users');
    res.json(excursions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get excursion by ID
 * @route GET /excursions/:id
 * @param {string} id - Excursion document ID
 * @returns {Excursion} excursion (populated)
 */
exports.getExcursionById = async (req, res) => {
  try {
    const excursion = await Excursion.findById(req.params.id)
      .populate('pictures', 'name contentType')
      .populate('users');
    if (!excursion) return res.status(404).json({ error: 'Excursion not found' });
    res.json(excursion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create new excursion
 * @route POST /excursions
 * @body { name, description, date, location, price, type, file (multipart/form-data) }
 * @returns {Excursion} created excursion
 */
exports.createExcursion = async (req, res) => {
  try {
    const { name, description, date, returnDate, location, price, type } = req.body;
    const file = req.file;
    
    const excursionData = {
      name,
      description: description || undefined,
      date: date ? new Date(date) : undefined,
      returnDate: returnDate ? new Date(returnDate) : undefined,
      location: location || undefined,
      price: price ? Number(price) : undefined,
      type,
      pictures: []
    };

    // Handle file upload if present
    if (file) {
      const picture = new Picture({
        name: file.originalname || name || 'excursion-photo',
        data: file.buffer,
        contentType: file.mimetype
      });
      await picture.save();
      excursionData.pictures = [picture._id];
    }

    const excursion = new Excursion(excursionData);
    await excursion.save();
    
    // Populate pictures without binary data
    await excursion.populate('pictures', 'name contentType');
    res.status(201).json(excursion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Update excursion by ID
 * @route PUT /excursions/:id
 * @param {string} id - Excursion document ID
 * @body { name, description, ..., file (multipart/form-data) }
 * @returns {Excursion} updated excursion
 */
exports.updateExcursion = async (req, res) => {
  try {
    const { name, description, date, returnDate, location, price, type } = req.body;
    const file = req.file;
    
    const updateData = {
      name,
      description: description || undefined,
      date: date ? new Date(date) : undefined,
      returnDate: returnDate ? new Date(returnDate) : undefined,
      location: location || undefined,
      price: price ? Number(price) : undefined,
      type
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle file upload if present - replace existing picture
    if (file) {
      // Get existing excursion to find old picture
      const existingExcursion = await Excursion.findById(req.params.id);
      
      // Create new picture
      const picture = new Picture({
        name: file.originalname || name || 'excursion-photo',
        data: file.buffer,
        contentType: file.mimetype
      });
      await picture.save();
      
      // Replace pictures array with new single picture
      updateData.pictures = [picture._id];
      
      // Optionally delete old picture(s) to clean up
      if (existingExcursion && existingExcursion.pictures && existingExcursion.pictures.length > 0) {
        await Picture.deleteMany({ _id: { $in: existingExcursion.pictures } });
      }
    }

    const excursion = await Excursion.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!excursion) return res.status(404).json({ error: 'Excursion not found' });
    
    // Populate pictures without binary data
    await excursion.populate('pictures', 'name contentType');
    res.json(excursion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete excursion by ID
 * @route DELETE /excursions/:id
 * @param {string} id - Excursion document ID
 * @returns {Object} message
 */
exports.deleteExcursion = async (req, res) => {
  try {
    const excursion = await Excursion.findByIdAndDelete(req.params.id);
    if (!excursion) return res.status(404).json({ error: 'Excursion not found' });
    res.json({ message: 'Excursion deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * List users registered for an excursion
 * @route GET /excursions/:id/users
 * @param {string} id - Excursion document ID
 * @returns {User[]} users
 */
exports.getUsersForExcursion = async (req, res) => {
  try {
    const excursion = await Excursion.findById(req.params.id).populate('users');
    if (!excursion) return res.status(404).json({ error: 'Excursion not found' });
    res.json(excursion.users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: remove user from excursion (sync User.excursions, clear paidUsers entry)
 * @route DELETE /excursions/:excursionId/users/:userId
 */
exports.disenrollUserFromExcursion = async (req, res) => {
  const { excursionId, userId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(excursionId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid excursion or user id' });
    }
    const excursion = await Excursion.findById(excursionId);
    const user = await User.findById(userId);
    if (!excursion || !user) {
      return res.status(404).json({ error: 'Excursion or user not found' });
    }

    user.excursions = (user.excursions || []).filter((eId) => eId.toString() !== excursionId);
    await user.save();

    excursion.users = (excursion.users || []).filter((uId) => uId.toString() !== userId);
    excursion.paidUsers = (excursion.paidUsers || []).filter((pId) => pId.toString() !== userId);
    await excursion.save();

    res.json({ message: `${userId} Desinscrito com sucesso de ${excursionId}.` }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: set paid flag for an enrolled user (paidUsers array)
 * @route PATCH /excursions/:excursionId/users/:userId
 * @body { paid: boolean }
 */
exports.patchExcursionUserPaid = async (req, res) => {
  const { excursionId, userId } = req.params;
  const { paid } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(excursionId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid excursion or user id' });
    }
    if (typeof paid !== 'boolean') {
      return res.status(400).json({ error: 'Body field paid must be a boolean' });
    }

    const excursion = await Excursion.findById(excursionId);
    if (!excursion) return res.status(404).json({ error: 'Excursion not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const enrolled = (excursion.users || []).some((uId) => uId.toString() === userId);
    if (paid === true && !enrolled) {
      return res.status(400).json({ error: 'User is not enrolled in this excursion' });
    }

    excursion.paidUsers = excursion.paidUsers || [];
    if (paid === true) {
      if (!excursion.paidUsers.some((p) => p.toString() === userId)) {
        excursion.paidUsers.push(userId);
      }
    } else {
      excursion.paidUsers = excursion.paidUsers.filter((p) => p.toString() !== userId);
    }
    await excursion.save();

    res.json({ message: 'Atualizado.', excursionId, userId, paid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
