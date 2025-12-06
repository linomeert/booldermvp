import { US_GRADES, FR_GRADES, COLORS, COLOR_MAP } from "./constants";

interface GradeSelectorProps {
  gradeType: "us" | "fr" | "color";
  onGradeTypeChange: (type: "us" | "fr" | "color") => void;
  selectedGrade: string;
  onGradeSelect: (grade: string) => void;
  customGrading?: string[] | null;
}

export const GradeSelector = ({
  gradeType,
  onGradeTypeChange,
  selectedGrade,
  onGradeSelect,
  customGrading,
}: GradeSelectorProps) => {
  if (customGrading && customGrading.length > 0) {
    return (
      <div className="grid grid-cols-7 gap-2 py-2">
        {customGrading.map((grade) => {
          const colorKey = grade.toLowerCase();
          return (
            <button
              key={grade}
              type="button"
              onClick={() => onGradeSelect(grade)}
              className={`flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-all border-2
                ${
                  selectedGrade === grade
                    ? "ring-2 ring-primary-600 ring-offset-1 scale-110"
                    : "hover:scale-105"
                }
                ${COLOR_MAP[colorKey] || "bg-gray-200"}`}
              aria-label={grade}
            >
              {/* No text, just color */}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {/* Grade Type Tabs */}
      <div className="flex border-b border-gray-200 mb-3">
        <button
          type="button"
          onClick={() => onGradeTypeChange("us")}
          className={`px-4 py-2 font-medium transition-colors ${
            gradeType === "us"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          US (V-Scale)
        </button>
        <button
          type="button"
          onClick={() => onGradeTypeChange("fr")}
          className={`px-4 py-2 font-medium transition-colors ${
            gradeType === "fr"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          FR (Fontainebleau)
        </button>
        <button
          type="button"
          onClick={() => onGradeTypeChange("color")}
          className={`px-4 py-2 font-medium transition-colors ${
            gradeType === "color"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Color
        </button>
      </div>

      {/* Grade Selection */}
      <div className="grid grid-cols-6 gap-2">
        {gradeType === "us" &&
          US_GRADES.map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => onGradeSelect(grade)}
              className={`py-3 px-2 rounded-lg font-semibold transition-all ${
                selectedGrade === grade
                  ? "bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {grade}
            </button>
          ))}
        {gradeType === "fr" &&
          FR_GRADES.map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => onGradeSelect(grade)}
              className={`py-3 px-2 rounded-lg font-semibold transition-all ${
                selectedGrade === grade
                  ? "bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {grade}
            </button>
          ))}
        {gradeType === "color" &&
          COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onGradeSelect(color)}
              className="p-2 transition-all flex items-center justify-center"
            >
              <div
                className={`w-14 h-14 rounded-full shadow-md transition-all ${
                  selectedGrade === color
                    ? "ring-4 ring-primary-600 ring-offset-2 scale-110"
                    : "hover:scale-105"
                } ${
                  color === "White"
                    ? "bg-white border-2 border-gray-300"
                    : color === "Yellow"
                    ? "bg-yellow-400"
                    : color === "Orange"
                    ? "bg-orange-500"
                    : color === "Green"
                    ? "bg-green-600"
                    : color === "Blue"
                    ? "bg-blue-600"
                    : color === "Red"
                    ? "bg-red-600"
                    : color === "Purple"
                    ? "bg-purple-600"
                    : "bg-gray-900"
                }`}
              />
            </button>
          ))}
      </div>
    </>
  );
};
