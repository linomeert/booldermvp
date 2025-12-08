type RawParticipant = any; // if you have a type, use it instead

type SessionParticipantsProps = {
  participants: RawParticipant[];
  onAddFriendClick: () => void;
  onRemoveParticipant: (id: string) => void;
};

export const SessionParticipants = ({
  participants,
  onAddFriendClick,
  onRemoveParticipant,
}: SessionParticipantsProps) => {
  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Are you climbing with your crew?
        </h3>
        <button
          onClick={onAddFriendClick}
          className="bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Add Friend</span>
        </button>
      </div>

      {participants.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {participants.map((participant: any) => {
            const id = participant.id || participant;
            const name = participant.name || participant.username || "Friend";
            return (
              <div
                key={id}
                className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2"
              >
                <span className="text-sm font-medium">{name}</span>
                <button
                  onClick={() => onRemoveParticipant(id)}
                  className="text-red-600 hover:text-red-700 text-lg font-bold"
                  title="Remove participant"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Solo sesh for now</p>
      )}
    </div>
  );
};
