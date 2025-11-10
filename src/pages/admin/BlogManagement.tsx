import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye, X, Check, XCircle, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { blogAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Blog {
  _id: string;
  title: string;
  author: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  readTime: number;
  comments: Comment[];
}

interface Comment {
  _id: string;
  userName: string;
  email?: string;
  content: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const blogCategories = [
  "Museum Tours",
  "History",
  "Culture",
  "Archaeology",
  "Environment",
  "Other",
];

export default function BlogManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    excerpt: "",
    content: "",
    image: "",
    readTime: 1,
    date: new Date().toISOString().split("T")[0],
  });
  const queryClient = useQueryClient();

  // Fetch blogs
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await blogAPI.getAll(true);
      return response.data;
    },
  });

  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: blogAPI.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog",
        variant: "destructive",
      });
    },
  });

  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogAPI.update(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setShowEditDialog(false);
      setEditingBlogId(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update blog",
        variant: "destructive",
      });
    },
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: blogAPI.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog",
        variant: "destructive",
      });
    },
  });

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: ({ blogId, commentId }: { blogId: string; commentId: string }) =>
      blogAPI.approveComment(blogId, commentId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment approved",
      });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      if (selectedBlog) {
        fetchBlogDetails(selectedBlog._id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve comment",
        variant: "destructive",
      });
    },
  });

  // Reject comment mutation
  const rejectCommentMutation = useMutation({
    mutationFn: ({ blogId, commentId }: { blogId: string; commentId: string }) =>
      blogAPI.rejectComment(blogId, commentId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      if (selectedBlog) {
        fetchBlogDetails(selectedBlog._id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject comment",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      excerpt: "",
      content: "",
      image: "",
      readTime: 1,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const fetchBlogDetails = async (id: string) => {
    try {
      const response = await blogAPI.getById(id, true);
      setSelectedBlog(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blog details",
        variant: "destructive",
      });
    }
  };

  const handleCreateBlog = () => {
    if (!formData.title || !formData.author || !formData.category || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createBlogMutation.mutate(formData);
  };

  const handleUpdateBlog = () => {
    if (!editingBlogId) return;
    if (!formData.title || !formData.author || !formData.category || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    updateBlogMutation.mutate({ id: editingBlogId, data: formData });
  };

  const handleEditBlog = async (blog: Blog) => {
    try {
      const response = await blogAPI.getById(blog._id, true);
      const blogData = response.data;
      setFormData({
        title: blogData.title,
        author: blogData.author,
        category: blogData.category,
        excerpt: blogData.excerpt,
        content: blogData.content,
        image: blogData.image,
        readTime: blogData.readTime,
        date: blogData.date ? new Date(blogData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      });
      setEditingBlogId(blog._id);
      setShowEditDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load blog data",
        variant: "destructive",
      });
    }
  };

  const handleViewBlog = (blog: Blog) => {
    fetchBlogDetails(blog._id);
    setShowViewDialog(true);
  };

  const handleDeleteBlog = (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      deleteBlogMutation.mutate(id);
    }
  };

  const handleApproveComment = (blogId: string, commentId: string) => {
    approveCommentMutation.mutate({ blogId, commentId });
  };

  const handleRejectComment = (blogId: string, commentId: string) => {
    rejectCommentMutation.mutate({ blogId, commentId });
  };

  const filteredBlogs = blogsData?.filter((blog: Blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage your blog posts</p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowCreateDialog(true)}
          >
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
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Author</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Comments</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No blogs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBlogs.map((blog: Blog) => (
                    <TableRow key={blog._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{blog.title}</TableCell>
                      <TableCell className="text-muted-foreground">{blog.author}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{blog.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(blog.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {blog.comments?.length || 0} comments
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewBlog(blog)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditBlog(blog)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => handleDeleteBlog(blog._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Create Blog Dialog */}
        <Dialog 
          open={showCreateDialog} 
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new blog post
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Blog title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Author name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readTime">Read Time (minutes) *</Label>
                  <Input
                    id="readTime"
                    type="number"
                    min="1"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readTime: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Short description of the blog"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Full blog content"
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBlog}
                disabled={createBlogMutation.isPending}
              >
                {createBlogMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Blog"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Blog Dialog */}
        <Dialog 
          open={showEditDialog} 
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setEditingBlogId(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog</DialogTitle>
              <DialogDescription>
                Update the blog post details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Blog title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-author">Author *</Label>
                  <Input
                    id="edit-author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Author name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-readTime">Read Time (minutes) *</Label>
                  <Input
                    id="edit-readTime"
                    type="number"
                    min="1"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readTime: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Image URL *</Label>
                <Input
                  id="edit-image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-excerpt">Excerpt *</Label>
                <Textarea
                  id="edit-excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Short description of the blog"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content *</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Full blog content"
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingBlogId(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBlog}
                disabled={updateBlogMutation.isPending}
              >
                {updateBlogMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Blog"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Blog Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBlog?.title}</DialogTitle>
              <DialogDescription>
                {selectedBlog?.category} • {selectedBlog?.author} •{" "}
                {selectedBlog?.readTime} min read
              </DialogDescription>
            </DialogHeader>
            {selectedBlog && (
              <div className="space-y-6">
                {selectedBlog.image && (
                  <img
                    src={selectedBlog.image}
                    alt={selectedBlog.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedBlog.excerpt}
                  </p>
                  <p className="text-sm">{selectedBlog.content}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Comments ({selectedBlog.comments?.length || 0})
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedBlog.comments && selectedBlog.comments.length > 0 ? (
                      selectedBlog.comments.map((comment: Comment) => (
                        <Card key={comment._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">
                                    {comment.userName}
                                  </span>
                                  {comment.email && (
                                    <span className="text-sm text-muted-foreground">
                                      ({comment.email})
                                    </span>
                                  )}
                                  <Badge
                                    className={getStatusColor(comment.status)}
                                  >
                                    {comment.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {new Date(comment.date).toLocaleString()}
                                </p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              {comment.status === "pending" && (
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleApproveComment(
                                        selectedBlog._id,
                                        comment._id
                                      )
                                    }
                                    disabled={approveCommentMutation.isPending}
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleRejectComment(
                                        selectedBlog._id,
                                        comment._id
                                      )
                                    }
                                    disabled={rejectCommentMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No comments yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
