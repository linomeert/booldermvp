import React from "react";

interface AvatarProps {
  src?: string | null;
  username?: string;
  alt?: string;
  size?: number | string; // px or tailwind class
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  username,
  alt,
  size = 40,
  className = "",
}) => {
  const fallback = username
    ? `https://avatar.iran.liara.run/public?username=${username}`
    : undefined;
  const dimension = typeof size === "number" ? `${size}px` : size;
  return (
    <img
      src={src || fallback}
      alt={alt || username || "avatar"}
      className={`rounded-full object-cover bg-gray-200 ${className}`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
      }}
      onError={(e) => {
        if (fallback && src !== fallback) {
          (e.target as HTMLImageElement).src = fallback;
        }
      }}
    />
  );
};
