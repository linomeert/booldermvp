import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Boolder</h1>
          <p className="text-xl md:text-2xl mb-4 text-primary-100">
            Track Your Climbing Journey
          </p>
          <p className="text-lg md:text-xl mb-12 text-primary-200 max-w-2xl mx-auto">
            Log sessions, track progress, connect with friends, and celebrate
            your climbing achievements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg w-full sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-600 transition-colors w-full sm:w-auto"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Track Your Progress
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Track Sessions
              </h3>
              <p className="text-gray-600">
                Log your climbing sessions with detailed stats. Track climbs,
                tops, projects, and duration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Connect with Friends
              </h3>
              <p className="text-gray-600">
                Add friends, see their sessions, give fistbumps, and climb
                together. Build your climbing community.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Rate & Reflect
              </h3>
              <p className="text-gray-600">
                Rate your sessions and note how you felt. Track your mental and
                physical progress over time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Indoor & Outdoor
              </h3>
              <p className="text-gray-600">
                Track sessions at any gym or crag. Add new locations on the fly
                as you explore.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Manage Projects
              </h3>
              <p className="text-gray-600">
                Keep track of your projects and celebrate when you finally send
                them. Log attempts and progress.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Give Fistbumps
              </h3>
              <p className="text-gray-600">
                Celebrate your friends' achievements with fistbumps. Support and
                motivate your climbing crew.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Tracking?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join climbers worldwide who are logging their progress and
            connecting with the community.
          </p>
          <Link
            to="/register"
            className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            Sign Up Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-950 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2025 Boolder. Track your climbing journey.</p>
        </div>
      </div>
    </div>
  );
};
