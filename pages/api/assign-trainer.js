// pages/api/assign-trainer.js
import dbConnect from '../../lib/dbConnect';
import Course from '../../models/Course';
import Trainer from '../../models/Trainer';
import { sendEmail } from '../../lib/mailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { courseId, trainerId, action } = req.body;

    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'courseId is required' 
      });
    }

    // Remove trainer from course
    if (action === 'remove') {
      const course = await Course.findById(courseId).populate('trainer');
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      const prevTrainer = course.trainer;
      if (!prevTrainer) {
        return res.status(400).json({ success: false, message: 'No trainer assigned to this course' });
      }
      course.trainer = null;
      await course.save();
      // Send email notification to previous trainer
      await sendEmail({
        to: prevTrainer.email,
        subject: `You have been unassigned from: ${course.name}`,
        text: `Hello ${prevTrainer.name},\n\nYou have been removed from the course: ${course.name} scheduled for ${new Date(course.date).toLocaleDateString()} at ${course.location}.\n\nThank you,\nSeminar Management System`,
        html: `<h2>Course Unassignment Notification</h2><p>Hello ${prevTrainer.name},</p><p>You have been removed from the course: <strong>${course.name}</strong> scheduled for <strong>${new Date(course.date).toLocaleDateString()}</strong> at <strong>${course.location}</strong>.</p><p>Thank you,<br>Seminar Management System</p>`
      });
      return res.status(200).json({ success: true, message: `Trainer ${prevTrainer.name} has been removed from the course and notified via email` });
    }

    // Find course and trainer
    const course = await Course.findById(courseId);
    const trainer = await Trainer.findById(trainerId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    // Check if trainer expertise matches course subject
    if (!trainer.training_subjects.includes(course.subject)) {
      return res.status(400).json({
        success: false,
        message: `Trainer ${trainer.name} isn't qualified to teach ${course.subject}`
      });
    }

    // Check if trainer is already booked for this date
    const trainerBookings = await Course.find({
      trainer: trainerId,
      date: course.date
    });

    if (trainerBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Trainer ${trainer.name} is already booked for ${new Date(course.date).toLocaleDateString()}`
      });
    }

    // Assign trainer to course
    course.trainer = trainerId;
    await course.save();

    // Send email notification to trainer
    await sendEmail({
      to: trainer.email,
      subject: `You've been assigned to teach: ${course.name}`,
      text: `
        Hello ${trainer.name},
        
        You have been assigned to teach the following course:
        
        Course: ${course.name}
        Date: ${new Date(course.date).toLocaleDateString()}
        Location: ${course.location}
        Subject: ${course.subject}
        Participants: ${course.participants}
        Your compensation: ${course.trainer_price}€
        
        Please confirm your availability.
        
        Thank you,
        Seminar Management System
      `,
      html: `
        <h2>Course Assignment Notification</h2>
        <p>Hello ${trainer.name},</p>
        <p>You have been assigned to teach the following course:</p>
        <ul>
          <li><strong>Course:</strong> ${course.name}</li>
          <li><strong>Date:</strong> ${new Date(course.date).toLocaleDateString()}</li>
          <li><strong>Location:</strong> ${course.location}</li>
          <li><strong>Subject:</strong> ${course.subject}</li>
          <li><strong>Participants:</strong> ${course.participants}</li>
          <li><strong>Your compensation:</strong> ${course.trainer_price}€</li>
        </ul>
        <p>Please confirm your availability.</p>
        <p>Thank you,<br>Seminar Management System</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: `Trainer ${trainer.name} has been assigned to the course and notified via email`
    });
    
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}