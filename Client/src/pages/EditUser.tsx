import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditUser = () => {
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null); // Track image file
  const [username, setUsername] = useState(user?.username || '');
  const [address, setAddress] = useState(user?.address || '');
  const [description, setDescription] = useState(user?.description || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('address', address);
    formData.append('description', description);

    if (image) {
      formData.append('image', image); // Add image if present
    }

    try {
      // Make the API call to update the user details
      const response = await axios.put(
        'http://localhost:3000/api/user/profile/edit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-csrf-token': localStorage.getItem('csrfToken'), // Get CSRF token from localStorage
          },
          withCredentials: true, // Ensure cookies are sent
        }
      );

      if (response.status === 200) {
        const updatedUser = response.data;

        // Update the `user` object in localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Update the user fields from the response
        const updatedUserData = {
          ...storedUser,
          username: updatedUser.username,
          address: updatedUser.address,
          description: updatedUser.description,
          profile_picture: updatedUser.profilePicture,
        };

        // Save the updated user data back to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUserData));

        // Optional: Log the updated user object to the console for verification
        // Redirect to the blog page or wherever appropriate after success
        navigate(`/profile/${username}`); // Replace with the actual username or profile page
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700">Profile Picture</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about yourself"
            className="w-full p-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>

        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EditUser;
