import { Link } from "react-router-dom";
import { Session } from "../../types";
import { Avatar } from "../Avatar";

interface SessionCardHeaderProps {
  session: Session;
}

export const SessionCardHeader = ({ session }: SessionCardHeaderProps) => {
  if (!session.user) return null;

  return (
    <div className="mb-4 pb-3 ">
      <Link
        to={`/profile/${session.user.username}`}
        className="flex items-center space-x-3 mb-2 hover:opacity-80 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <Avatar
          src={session.user.avatarUrl}
          username={session.user.username}
          alt={session.user.name}
          size={40}
        />
        <div>
          <div className="font-semibold text-white">{session.user.name}</div>
          <div className="text-sm text-gray-600">@{session.user.username}</div>
        </div>
      </Link>

      {/* Participants */}
      {session.participants && session.participants.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
          <span>with</span>
          <div className="flex flex-wrap gap-1">
            {session.participants.map((participant: any, index: number) => (
              <Link
                key={participant.id || participant}
                to={`/profile/${
                  typeof participant === "object"
                    ? participant.username
                    : participant
                }`}
                className="font-medium text-white hover:text-primary-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {typeof participant === "object"
                  ? participant.name
                  : participant}
                {index < session.participants.length - 1 && ","}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
