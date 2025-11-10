import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye, X, Check, XCircle, Loader2, Download } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { libraryAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  year: number;
  description: string;
  cover: string;
  pages: number;
  pdfUrl: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

interface Review {
  _id: string;
  userName: string;
  email?: string;
  rating: number;
  comment: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const bookCategories = [
  "History",
  "Culture",
  "Geography",
  "Archaeology",
  "Art & Heritage",
  "Literature",
];

export default function LibraryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    year: new Date().getFullYear(),
    description: "",
    pages: 0,
    cover: "",
    pdfUrl: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Fetch books
  const { data: booksData, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await libraryAPI.getAll(true);
      return response.data;
    },
  });

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: async (data: FormData) => libraryAPI.create(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create book",
        variant: "destructive",
      });
    },
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: libraryAPI.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete book",
        variant: "destructive",
      });
    },
  });

  // Approve review mutation
  const approveReviewMutation = useMutation({
    mutationFn: ({ bookId, reviewId }: { bookId: string; reviewId: string }) =>
      libraryAPI.approveReview(bookId, reviewId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review approved",
      });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      if (selectedBook) {
        fetchBookDetails(selectedBook._id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve review",
        variant: "destructive",
      });
    },
  });

  // Reject review mutation
  const rejectReviewMutation = useMutation({
    mutationFn: ({ bookId, reviewId }: { bookId: string; reviewId: string }) =>
      libraryAPI.rejectReview(bookId, reviewId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      if (selectedBook) {
        fetchBookDetails(selectedBook._id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject review",
        variant: "destructive",
      });
    },
  });

  const fetchBookDetails = async (id: string) => {
    try {
      const response = await libraryAPI.getById(id, true);
      setSelectedBook(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch book details",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      year: new Date().getFullYear(),
      description: "",
      pages: 0,
      cover: "",
      pdfUrl: "",
    });
    setCoverFile(null);
    setPdfFile(null);
  };

  const handleCreateBook = () => {
    if (!formData.title || !formData.author || !formData.category || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("author", formData.author);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("year", formData.year.toString());
    formDataToSend.append("description", formData.description);
    formDataToSend.append("pages", formData.pages.toString());

    if (coverFile) {
      formDataToSend.append("coverImage", coverFile);
    } else if (formData.cover) {
      formDataToSend.append("cover", formData.cover);
    }

    if (pdfFile) {
      formDataToSend.append("pdfFile", pdfFile);
    } else if (formData.pdfUrl) {
      formDataToSend.append("pdfUrl", formData.pdfUrl);
    }

    createBookMutation.mutate(formDataToSend);
  };

  const handleViewBook = (book: Book) => {
    fetchBookDetails(book._id);
    setShowViewDialog(true);
  };

  const handleDeleteBook = (id: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(id);
    }
  };

  const handleApproveReview = (bookId: string, reviewId: string) => {
    approveReviewMutation.mutate({ bookId, reviewId });
  };

  const handleRejectReview = (bookId: string, reviewId: string) => {
    rejectReviewMutation.mutate({ bookId, reviewId });
  };

  const filteredBooks = booksData?.filter((book: Book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Library Management</h1>
            <p className="text-muted-foreground">Manage your collection of books</p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowCreateDialog(true)}
          >
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
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No books found
              </div>
            ) : (
              filteredBooks.map((book: Book) => (
                <Card key={book._id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className="w-24 h-32 bg-muted rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                      {book.cover ? (
                        <img
                          src={book.cover.startsWith('http') ? book.cover : `http://localhost:5000${book.cover}`}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">No Cover</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                      <Badge variant="secondary" className="mb-2">{book.category}</Badge>
                      <p className="text-sm text-muted-foreground mb-3">{book.year}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewBook(book)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleDeleteBook(book._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Create Book Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new book to the library
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
                    placeholder="Book title"
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
                      {bookCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1000"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value) || new Date().getFullYear(),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Book description"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  min="0"
                  value={formData.pages}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pages: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCoverFile(file);
                  }}
                />
                {!coverFile && (
                  <Input
                    placeholder="Or enter image URL"
                    value={formData.cover}
                    onChange={(e) =>
                      setFormData({ ...formData, cover: e.target.value })
                    }
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfFile">PDF File</Label>
                <Input
                  id="pdfFile"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPdfFile(file);
                  }}
                />
                {!pdfFile && (
                  <Input
                    placeholder="Or enter PDF URL"
                    value={formData.pdfUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, pdfUrl: e.target.value })
                    }
                  />
                )}
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
                onClick={handleCreateBook}
                disabled={createBookMutation.isPending}
              >
                {createBookMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Book"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Book Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBook?.title}</DialogTitle>
              <DialogDescription>
                {selectedBook?.category} • {selectedBook?.author} • {selectedBook?.year}
              </DialogDescription>
            </DialogHeader>
            {selectedBook && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  {selectedBook.cover && (
                    <img
                      src={selectedBook.cover.startsWith('http') ? selectedBook.cover : `http://localhost:5000${selectedBook.cover}`}
                      alt={selectedBook.title}
                      className="w-32 h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm mb-4">{selectedBook.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Pages: {selectedBook.pages}</span>
                      <span>Rating: {selectedBook.rating.toFixed(1)}</span>
                      <span>Reviews: {selectedBook.reviewCount}</span>
                    </div>
                    {selectedBook.pdfUrl && (
                      <Button
                        className="mt-4"
                        onClick={() => {
                          const url = selectedBook.pdfUrl.startsWith('http')
                            ? selectedBook.pdfUrl
                            : `http://localhost:5000${selectedBook.pdfUrl}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Reviews ({selectedBook.reviews?.length || 0})
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedBook.reviews && selectedBook.reviews.length > 0 ? (
                      selectedBook.reviews.map((review: Review) => (
                        <Card key={review._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">{review.userName}</span>
                                  {review.email && (
                                    <span className="text-sm text-muted-foreground">
                                      ({review.email})
                                    </span>
                                  )}
                                  <Badge className={getStatusColor(review.status)}>
                                    {review.status}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">Rating:</span>
                                    <span className="font-semibold">{review.rating}/5</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {new Date(review.date).toLocaleString()}
                                </p>
                                <p className="text-sm">{review.comment}</p>
                              </div>
                              {review.status === "pending" && (
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleApproveReview(selectedBook._id, review._id)
                                    }
                                    disabled={approveReviewMutation.isPending}
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleRejectReview(selectedBook._id, review._id)
                                    }
                                    disabled={rejectReviewMutation.isPending}
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
                        No reviews yet
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
