import React, { useState, useEffect } from "react";
import axios from "axios"; // To make HTTP requests
import Register from "./Register"; // Import the Register component
import "./styles/ProfileManagement.css"; // Ensure styles are imported

const ProfileManagement = ({ onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState("");

  // Load current profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        console.log('Token from localStorage:', token);
        if (!token) {
          throw new Error("Token not found in localStorage");
        }
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched user details:', response.data);
        setUserDetails(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError("Failed to load profile.");
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      console.log('Updating profile with data:', updatedProfile);
      await axios.put('http://localhost:5000/api/profile', updatedProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Profile updated successfully');
      setError(""); // Clear any existing errors
      if (onClose) onClose(); // Close profile management modal
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || "An error occurred while saving your profile.");
    }
  };

  return (
    <div className="profile-management-container">
      <div className="profile-management-content">
        <h2>Edit Profile</h2>
        {userDetails ? (
          <Register userDetails={userDetails} onProfileUpdate={handleProfileUpdate} />
        ) : (
          <p>Loading...</p>
        )}
        {error && <p className="error-message">{error}</p>}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileManagement;