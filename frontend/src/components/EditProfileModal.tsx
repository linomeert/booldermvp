import { useState } from "react";
import type { User } from "../types";

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

export const EditProfileModal = ({
  user,
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.avatarUrl || "");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    if (password) formData.append("password", password);
    if (avatarFile) formData.append("avatar", avatarFile);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <div className="flex flex-col items-center mb-4">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mb-2">
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-4xl text-gray-400">+</span>
              )}
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <span className="text-xs text-gray-500">Click to change avatar</span>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Password (optional)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 rounded-md font-medium hover:bg-primary-700 mt-2"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};
