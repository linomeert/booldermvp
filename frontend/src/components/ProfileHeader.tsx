import { User } from "../types";
import { Avatar } from "./Avatar";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export const ProfileHeader = ({
  user,
  isOwnProfile,
  onEditProfile,
}: ProfileHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start space-x-6">
        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Avatar
            src={user.avatarUrl}
            username={user.username}
            alt={user.name}
            size={96}
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600 mt-1">@{user.username}</p>

          {isOwnProfile && (
            <button
              className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onEditProfile}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {user.stats && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {user.stats.totalTops}
            </div>
            <div className="text-sm text-gray-600 mt-1">Tops</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">
              {user.stats.totalProjects}
            </div>
            <div className="text-sm text-gray-600 mt-1">Projects</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {user.stats.sessions}
            </div>
            <div className="text-sm text-gray-600 mt-1">Sessions</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {user.stats.hardestGrade}
            </div>
            <div className="text-sm text-gray-600 mt-1">Hardest</div>
          </div>
        </div>
      )}
    </div>
  );
};
