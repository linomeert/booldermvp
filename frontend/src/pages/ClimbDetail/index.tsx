import { useNavigate, useParams, Link } from "react-router-dom";
import { useClimb } from "../../hooks/useClimb";
import { Avatar } from "../../components/Avatar";
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

  const { data: climb, isLoading, isError } = useClimb(id);

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
