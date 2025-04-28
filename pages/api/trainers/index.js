// pages/api/trainers/index.js
import dbConnect from '../../../lib/dbConnect';
import Trainer from '../../../models/Trainer';

export default async function handler(req, res) {
  await dbConnect();

  // GET: List all trainers
  if (req.method === 'GET') {
    try {
      const trainers = await Trainer.find({});
      return res.status(200).json({ success: true, data: trainers });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST: Create a new trainer
  if (req.method === 'POST') {
    try {
      const trainer = await Trainer.create(req.body);
      return res.status(201).json({ success: true, data: trainer });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}