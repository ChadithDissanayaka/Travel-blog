import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import CountryDropdown from '../components/Common/CountryDropdown';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios'; 

interface CreatePostFormData {
  title: string;
  content: string;
  visitDate: string;
  image: File | null;
}

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreatePostFormData>();

  const onSubmit = async (data: CreatePostFormData) => {
    if (!country) {
      setError('Please select a country');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('countryName', country);
      formData.append('dateOfVisit', data.visitDate);
      if (data.image) {
        formData.append('image', data.image[0]);
      }

      // Make the API call to create the post
      const response = await axios.post(
        'http://localhost:3000/api/blogposts/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-csrf-token': localStorage.getItem('csrfToken'), // Get CSRF token from localStorage
          },
          withCredentials: true, // Ensure cookies are sent
        }
      );

      // Handle the response
      if (!response) {
        throw new Error('Failed to create post');
      }

      // Redirect to the home page or the newly created post
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Travel Story</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className="mb-4">
            <Input
              label="Title"
              placeholder="Give your travel story a catchy title"
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 5,
                  message: 'Title must be at least 5 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Title must be less than 100 characters'
                }
              })}
              error={errors.title?.message}
            />
          </div>

          <div className="mb-4">
            <CountryDropdown
              onSelect={setCountry}
              selectedCountry={country}
              error={country ? '' : errors.content?.message}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Date
            </label>
            <div className="relative">
              <Input
                type="date"
                {...register('visitDate', {
                  required: 'Visit date is required'
                })}
                error={errors.visitDate?.message}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image (optional)
            </label>
            <input
              type="file"
              {...register('image')}
              className="w-full px-3 py-2 border rounded-md shadow-sm"
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              {...register('content', {
                required: 'Content is required',
                minLength: {
                  value: 50,
                  message: 'Content must be at least 50 characters'
                }
              })}
              rows={8}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm
                ${errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}
                focus:border-transparent focus:outline-none focus:ring-2
              `}
              placeholder="Share your travel experience..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Publish Story
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
