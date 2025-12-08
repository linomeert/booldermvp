import type { Session } from "../../types";

type SessionStatsProps = {
  session: Session;
};

export const SessionStats = ({ session }: SessionStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      <Stat
        value={session.climbCount}
        label="Total Climbs"
        valueClass="text-primary-600"
      />
      <Stat
        value={session.topsCount}
        label="Tops"
        valueClass="text-green-600"
      />
      <Stat
        value={session.projectsCount}
        label="Projects"
        valueClass="text-amber-600"
      />
      <Stat
        value={session.hardestGrade || "N/A"}
        label="Hardest Grade"
        valueClass="text-purple-600"
      />
    </div>
  );
};

type StatProps = {
  value: number | string;
  label: string;
  valueClass?: string;
};

const Stat = ({ value, label, valueClass = "" }: StatProps) => (
  <div className="text-center">
    <div className={`text-4xl font-bold ${valueClass}`}>{value}</div>
    <div className="text-sm text-gray-600 mt-1">{label}</div>
  </div>
);
