import { FileText, Image, BookOpen, Eye } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";

const metrics = [
  { label: "Total Blogs", value: "142", icon: FileText, color: "text-primary" },
  { label: "Gallery Items", value: "89", icon: Image, color: "text-success" },
  { label: "Library Books", value: "56", icon: BookOpen, color: "text-warning" },
  { label: "Total Views", value: "12.4K", icon: Eye, color: "text-primary" },
];

const recentActivity = [
  { action: "New blog post published", details: "Getting Started with React", time: "2 hours ago" },
  { action: "Gallery image uploaded", details: "sunset-landscape.jpg", time: "5 hours ago" },
  { action: "Book added to library", details: "The Art of Programming", time: "1 day ago" },
  { action: "Blog post updated", details: "Advanced TypeScript Tips", time: "2 days ago" },
];

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your content.</p>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card
              key={metric.label}
              className="p-6 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-5xl font-bold text-foreground mb-2">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
                <div className={`p-3 rounded-full bg-primary/10 ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <Card
                key={index}
                className="p-4 hover:bg-muted/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
