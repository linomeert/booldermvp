import { Link } from "react-router-dom";
import { Session } from "../../types";
import { Avatar } from "../Avatar";

interface SessionFistbumpSectionProps {
  session: Session;
  hasFistbumped: boolean;
  isPending: boolean;
  onFistbump: (e: React.MouseEvent) => void;
}

export const SessionFistbumpSection = ({
  session,
  hasFistbumped,
  isPending,
  onFistbump,
}: SessionFistbumpSectionProps) => {
  return (
    <div className="px-6 pb-4 pt-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onFistbump}
          disabled={isPending}
          className={`flex items-center gap-2 transition-colors ${
            hasFistbumped
              ? "text-orange-600"
              : "text-gray-500 hover:text-orange-600"
          }`}
        >
          <span className="text-2xl">👊</span>
          <span className="font-medium text-sm">
            {session.fistbumpCount || 0}
          </span>
        </button>
        {/* Fistbump Avatars */}
        {Array.isArray(session.fistbumps) && session.fistbumps.length > 0 && (
          <div className="flex -space-x-2 ml-2">
            {session.fistbumps
              .slice(0, 5)
              .map((fistbumpUser: any, idx: number) => {
                // If backend populates with user objects, use avatarUrl/username, else fallback to id
                const username =
                  typeof fistbumpUser === "object" && fistbumpUser.username
                    ? fistbumpUser.username
                    : fistbumpUser;
                return (
                  <Link
                    to={`/profile/${username}`}
                    key={username || idx}
                    className="block w-7 h-7 rounded-full  shadow-sm bg-primary-100 overflow-hidden"
                    style={{ zIndex: 10 - idx }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Avatar
                      src={fistbumpUser?.avatarUrl}
                      username={username}
                      alt={username}
                      size={30}
                    />
                  </Link>
                );
              })}
            {session.fistbumps.length > 5 && (
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-xs font-semibold">
                +{session.fistbumps.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
