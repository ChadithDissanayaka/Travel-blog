import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; // For API calls
import { useAuth } from '../hooks/useAuth';

const EditPost = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>(); // Get post ID from URL
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [countryName, setCountryName] = useState('');
  const [dateOfVisit, setDateOfVisit] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch the existing post data
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/blogposts/${id}`, {
          withCredentials: true,
          headers: {
            'x-csrf-token': localStorage.getItem('csrfToken'),
          } 
        });

        const postData = response.data;
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setCountryName(postData.country_name);
        setDateOfVisit(postData.date_of_visit);
      } catch (error) {
        console.error('Error fetching post data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPostData();
    }
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('countryName', countryName);
    formData.append('dateOfVisit', dateOfVisit);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.put(`http://localhost:3000/api/blogposts/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-csrf-token': localStorage.getItem('csrfToken'), 
        },
        withCredentials: true,
      });

      // Redirect to the post detail page or blog page after the edit
      navigate(`/post/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // If the post is still being loaded
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="pt-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={5}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="country_name" className="block text-sm font-medium text-gray-700">Country Name</label>
          <input
            type="text"
            id="country_name"
            value={countryName}
            onChange={(e) => setCountryName(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="date_of_visit" className="block text-sm font-medium text-gray-700">Date of Visit</label>
          <input
            type="date"
            id="date_of_visit"
            value={dateOfVisit}
            onChange={(e) => setDateOfVisit(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-md text-white ${submitting ? 'bg-gray-400' : 'bg-teal-600'}`}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
