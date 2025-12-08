import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClimb } from "../../hooks/useClimb";
import { Avatar } from "../../components/Avatar";
import { deleteClimb } from "../../api";
import { PageContainer } from "./PageContainer";
import { Message } from "./Message";
import { BackButton } from "./BackButton";
import { ClimbImages } from "./ClimbImages";
import { StatusBadge } from "./StatusBadge";
import { Location } from "./Location";
import { DetailsGrid } from "./DetailsGrid";

export const ClimbDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: climb, isLoading, isError } = useClimb(id);

  const deleteClimbMutation = useMutation({
    mutationFn: deleteClimb,
    onSuccess: () => {
      if (climb?.sessionId) {
        navigate(`/sessions/${climb.sessionId}`);
      } else {
        navigate("/feed");
      }
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["mySessions"] });
    },
  });

  if (!id) {
    return (
      <PageContainer>
        <Message variant="error">Invalid climb id.</Message>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Message>Loading climb...</Message>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <Message variant="error">Could not load climb.</Message>
      </PageContainer>
    );
  }

  if (!climb) {
    return (
      <PageContainer>
        <Message variant="error">Climb not found.</Message>
      </PageContainer>
    );
  }

  const {
    sessionId,
    images,
    mediaUrl,
    grade,
    status,
    locationType,
    gym,
    crag,
    style,
    attempts,
    createdAt,
    notes,
    user,
  } = climb;

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)} />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ClimbImages images={images} mediaUrl={mediaUrl} grade={grade} />

        <div className="p-6">
          {/* Header with Status and Grade */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <StatusBadge status={status} />
              <span className="text-3xl font-bold text-gray-900">{grade}</span>
            </div>
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this climb?")
                ) {
                  deleteClimbMutation.mutate(climb.id);
                }
              }}
              disabled={deleteClimbMutation.isPending}
              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
              title="Delete climb"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Location */}
          <Location
            locationType={locationType}
            gymName={gym?.name}
            cragName={crag?.name}
          />

          {/* Details Grid */}
          <DetailsGrid style={style} attempts={attempts} date={createdAt} />

          {/* Notes */}
          {notes && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
            </section>
          )}

          {/* Session Info */}
          {sessionId && (
            <section className="border-t pt-4">
              <div className="text-sm text-gray-600 mb-2">Part of session</div>
              <Link
                to={`/sessions/${sessionId}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View full session →
              </Link>
            </section>
          )}

          {/* Climber Info */}
          {user && (
            <section className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={climb.user?.avatarUrl}
                  username={climb.user?.username}
                  alt={climb.user?.name}
                  size={40}
                />
                <div>
                  <div className="text-sm text-gray-600">Climbed by</div>
                  <Link
                    to={`/profile/${user.username}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                  >
                    {user.name}
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ClimbDetailPage;
