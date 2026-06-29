// src/components/Album/AlbumCard.tsx
import { Link } from 'react-router-dom';
import { Images, MapPin } from 'lucide-react';
import { Album } from '../../services/album.service';

interface AlbumCardProps extends Album {
  showOwnerControls?: boolean;
  onDelete?: (id: number) => void;
  onEdit?: (album: Album) => void;
}

const AlbumCard = (props: AlbumCardProps) => {
  const { id, userId, title, description, countryName, coverImage, _count, showOwnerControls, onDelete, onEdit, createdAt, updatedAt } = props;
  const photoCount = _count?.posts ?? 0;
  const cover = coverImage;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden group hover:shadow-md transition-shadow">
      <Link to={`/albums/${id}`} className="block">
        <div className="relative h-44 bg-slate-100 overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
              <Images className="h-10 w-10 text-teal-300" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Images className="h-3 w-3" />
            {photoCount}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-semibold text-slate-800 text-base leading-snug mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
            <MapPin className="h-3 w-3" />
            {countryName}
          </div>
          {description && (
            <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
          )}
        </div>
      </Link>
      {showOwnerControls && (
        <div className="px-4 pb-3 -mt-1 flex items-center justify-between pt-3 border-t border-slate-50">
          {onEdit && (
            <button
              onClick={() => onEdit({ id, userId, title, description, countryName, coverImage, createdAt, updatedAt })}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Edit Album
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => { if (confirm('Delete this album?')) onDelete(id); }}
              className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumCard;
