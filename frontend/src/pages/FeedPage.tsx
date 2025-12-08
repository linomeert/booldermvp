import { useAuth } from "../context/AuthContext";
import { FeedItemCard } from "../components/FeedItemCard";
import { SessionCard } from "../components/SessionCard";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { useFeed } from "../hooks/useFeed";
import simpsons from "../assets/simpsons.gif";
import alpacca from "../assets/alpacca.gif";

export const FeedPage = () => {
  const { user } = useAuth();
  const { feedItems, isLoading, error } = useFeed();

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto py-8 px-2 text-white text-center">
        <img
          src={alpacca}
          alt="Alpacca is loading"
          className="w-full rounded-lg"
        />
      </div>
    );
  if (error) return <div>Could not load feed.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold text-white mb-8 p-5">
        {`Happy climbing, ${user?.username}!`}
      </h1>
      <div className="mb-8 px-5">
        <img
          src={simpsons}
          alt="Simpsons celebration"
          className="w-full rounded-lg"
        />
      </div>

      <div className="space-y-6">
        {feedItems.length ? (
          feedItems.map((item) =>
            item.type === "climb" ? (
              <FeedItemCard key={`climb-${item.data.id}`} climb={item.data} />
            ) : (
              <SessionCard
                key={`session-${item.data.id}`}
                session={item.data}
              />
            )
          )
        ) : (
          <div className="text-center text-gray-500 py-12">
            No activity yet.
          </div>
        )}
      </div>

      <FloatingActionButton />
    </div>
  );
};
