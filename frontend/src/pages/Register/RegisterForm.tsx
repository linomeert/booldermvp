import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FormInput } from "./FormInput";
import { ErrorMessage } from "./ErrorMessage";

interface FormData {
  email: string;
  password: string;
  name: string;
  username: string;
}

export const RegisterForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <div className="space-y-4">
        <FormInput
          id="name"
          label="Full Name"
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
        />

        <FormInput
          id="username"
          label="Username"
          value={formData.username}
          onChange={(value) => handleChange("username", value)}
        />

        <FormInput
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => handleChange("email", value)}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={(value) => handleChange("password", value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Sign up"}
      </button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account?</span>{" "}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
};
