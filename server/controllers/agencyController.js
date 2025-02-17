const Agency = require('../models/Agency');
const User = require('../models/User');

exports.createAgency = async (req, res) => {
  try {
    const agency = await Agency.create(req.body);
    res.status(201).json({ success: true, data: agency });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.json({ success: true, data: agencies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAgency = async (req, res) => {
  try {
    const agency = await Agency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    res.json({ success: true, data: agency });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAgency = async (req, res) => {
  try {
    const agency = await Agency.findByIdAndDelete(req.params.id);
    
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    // Also update any associated users
    await User.updateMany(
      { agency: req.params.id },
      { $unset: { agency: 1 } }
    );
    
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 