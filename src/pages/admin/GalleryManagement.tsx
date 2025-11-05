import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const mockImages = [
  { id: 1, title: "Sunset Landscape", category: "Nature", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
  { id: 2, title: "City Skyline", category: "Urban", url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400" },
  { id: 3, title: "Mountain View", category: "Nature", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
  { id: 4, title: "Beach Paradise", category: "Travel", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
];

export default function GalleryManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gallery Management</h1>
            <p className="text-muted-foreground">Upload and organize your images</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Images
          </Button>
        </header>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockImages.map((image) => (
            <Card key={image.id} className="p-2 hover:shadow-md transition-all">
              <div className="aspect-[4/3] rounded-md overflow-hidden mb-2">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium text-sm mb-1">{image.title}</h3>
              <Badge variant="secondary" className="mb-2">{image.category}</Badge>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
