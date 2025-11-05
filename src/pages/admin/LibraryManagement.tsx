import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const mockBooks = [
  { id: 1, title: "The Art of Programming", author: "Robert Martin", category: "Technology", year: 2023 },
  { id: 2, title: "Design Patterns", author: "Gang of Four", category: "Software", year: 2022 },
  { id: 3, title: "Clean Code", author: "Robert Martin", category: "Technology", year: 2021 },
];

export default function LibraryManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Library Management</h1>
            <p className="text-muted-foreground">Manage your collection of books</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Book
          </Button>
        </header>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBooks.map((book) => (
            <Card key={book.id} className="p-4 hover:shadow-md transition-all">
              <div className="flex gap-4">
                <div className="w-24 h-32 bg-muted rounded-md flex items-center justify-center shrink-0">
                  <span className="text-muted-foreground text-xs">No Cover</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                  <Badge variant="secondary" className="mb-2">{book.category}</Badge>
                  <p className="text-sm text-muted-foreground mb-3">{book.year}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
