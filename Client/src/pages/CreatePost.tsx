import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PenLine, ImagePlus, Calendar, Globe2, X } from 'lucide-react';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import CountryDropdown from '../components/Common/CountryDropdown';
import { postService } from '../services/post.service';

interface CreatePostFormData {
  title: string;
  content: string;
  visitDate: string;
  image: FileList | null;
}

const CreatePost = () => {
  const navigate = useNavigate();
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreatePostFormData>();

  // Destructure RHF's onChange separately so we can call it alongside the preview handler
  const { onChange: rhfOnChange, ...imageRegisterProps } = register('image');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Let RHF capture the file first
    rhfOnChange(e);
    // Then generate the local preview
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CreatePostFormData) => {
    if (!country) { setError('Please select a country'); return; }
    try {
      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('countryName', country);
      formData.append('dateOfVisit', data.visitDate);
      if (data.image && data.image.length > 0) formData.append('image', data.image[0]);
      await postService.create(formData);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
          <PenLine className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Write a Story</h1>
          <p className="text-slate-500 text-sm">Share your travel experience with the world</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card p-8">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-5">
          <Input
            label="Story Title"
            placeholder="Give your travel story a captivating title…"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'At least 5 characters required' },
              maxLength: { value: 100, message: 'Title must be under 100 characters' }
            })}
            error={errors.title?.message}
          />

          {/* Country & Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-slate-400" /> Country Visited
              </label>
              <CountryDropdown
                onSelect={setCountry}
                selectedCountry={country}
                error={country ? '' : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date of Visit
              </label>
              <input
                type="date"
                {...register('visitDate', { required: 'Visit date is required' })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all"
              />
              {errors.visitDate && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.visitDate.message}</p>}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ImagePlus className="h-3.5 w-3.5 text-slate-400" /> Cover Image <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden h-48 mb-2">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-3 right-3 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer transition-all">
                <ImagePlus className="h-8 w-8 text-slate-300 mb-2" />
                <span className="text-sm text-slate-400">Click to upload an image</span>
                <input
                  type="file"
                  accept="image/*"
                  {...imageRegisterProps}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Story</label>
            <textarea
              {...register('content', {
                required: 'Content is required',
                minLength: { value: 50, message: 'At least 50 characters required' }
              })}
              rows={10}
              placeholder="Describe your travel experience — what you saw, felt, tasted, and discovered…"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm text-slate-700 placeholder-slate-400 leading-relaxed
                focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none
                ${errors.content ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-teal-500 focus:bg-white'}`}
            />
            {errors.content && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.content.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <PenLine className="h-4 w-4" />
              Publish Story
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
