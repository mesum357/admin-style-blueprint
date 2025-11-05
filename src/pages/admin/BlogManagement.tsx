import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockBlogs = [
  {
    id: 1,
    title: "Getting Started with React",
    author: "John Doe",
    category: "Tutorial",
    date: "2024-01-15",
    status: "Published",
  },
  {
    id: 2,
    title: "Advanced TypeScript Tips",
    author: "Jane Smith",
    category: "Guide",
    date: "2024-01-14",
    status: "Published",
  },
  {
    id: 3,
    title: "Building Modern UIs",
    author: "John Doe",
    category: "Tutorial",
    date: "2024-01-13",
    status: "Draft",
  },
];

export default function BlogManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage your blog posts</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Blog
          </Button>
        </header>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Blogs Table */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Author</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBlogs.map((blog) => (
                <TableRow key={blog.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell className="text-muted-foreground">{blog.author}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{blog.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{blog.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={blog.status === "Published" ? "default" : "secondary"}
                      className={
                        blog.status === "Published"
                          ? "bg-success text-success-foreground"
                          : "bg-warning text-warning-foreground"
                      }
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
