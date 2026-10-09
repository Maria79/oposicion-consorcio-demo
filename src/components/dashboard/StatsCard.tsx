import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "blue" | "green" | "yellow" | "purple";
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <Icon className="h-10 w-10 opacity-60" />
        </div>
      </CardContent>
    </Card>
  );
}
