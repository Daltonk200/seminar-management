// pages/api/courses/index.js
import dbConnect from '../../../lib/dbConnect';
import Course from '../../../models/Course';

export default async function handler(req, res) {
  await dbConnect();

  // GET: List all courses
  if (req.method === 'GET') {
    try {
      const courses = await Course.find({}).populate('trainer');
      return res.status(200).json({ success: true, data: courses });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST: Create a new course
  if (req.method === 'POST') {
    try {
      const course = await Course.create(req.body);
      return res.status(201).json({ success: true, data: course });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}