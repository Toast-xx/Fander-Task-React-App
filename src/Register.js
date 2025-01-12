import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ userDetails, onProfileUpdate }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Received userDetails:', userDetails);
    if (userDetails) {
      setFirstName(userDetails.firstName);
      setLastName(userDetails.lastName);
      setEmail(userDetails.email);
    }
  }, [userDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('New passwords do not match!');
      return;
    }

    try {
      if (userDetails) {
        // Update profile
        const updatedProfile = { firstName, lastName, email };
        if (newPassword) {
          updatedProfile.currentPassword = currentPassword;
          updatedProfile.newPassword = newPassword;
        }
        console.log('Sending updated profile data:', updatedProfile);
        await onProfileUpdate(updatedProfile);
        setSuccess('Profile updated successfully!');
      } else {
        // Register new user
        const newUser = { firstName, lastName, email, newPassword };
        console.log('Sending new user data:', newUser);
        const response = await axios.post('http://localhost:5000/api/auth/register', newUser);
        console.log('Registration Successful:', response);
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after 2 seconds
        }, 2000);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error registering/updating the user');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        First Name:
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </label>
      <br />
      <label>
        Last Name:
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </label>
      <br />
      <label>
        Email:
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <br />
      {userDetails && (
        <>
          <label>
            Current Password:
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </label>
          <br />
          <label>
            New Password:
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
          <br />
          <label>
            Confirm New Password:
            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
          </label>
          <br />
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <button type="submit">{userDetails ? 'Update Profile' : 'Register'}</button>
    </form>
  );
};

export default Register;