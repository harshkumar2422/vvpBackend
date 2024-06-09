import jwt from 'jsonwebtoken';

export const sendToken = (user, statusCode, res, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30m', // Token expires in 30 minutes
  });
  console.log('Token:', token);

  res.status(statusCode).json({
    success: true,
    message,
    user,
    token,
  });
};
