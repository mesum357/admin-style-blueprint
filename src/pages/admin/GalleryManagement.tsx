import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye, X, Loader2, Upload } from "lucide-react";
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
import { galleryAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface GalleryItem {
  _id: string;
  title: string;
  imageName: string;
  description: string;
  src: string;
  alt: string;
  type: string;
  category: {
    _id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  tags?: string[];
  year?: number;
  location?: string;
  photographer?: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function GalleryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageName: "",
    description: "",
    alt: "",
    category: "",
    tags: "",
    year: "",
    location: "",
    photographer: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch gallery items
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["galleryItems"],
    queryFn: async () => {
      const response = await galleryAPI.getAll();
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["galleryCategories"],
    queryFn: async () => {
      const response = await galleryAPI.getCategories();
      return response.data;
    },
  });

  // Create gallery item mutation
  const createItemMutation = useMutation({
    mutationFn: galleryAPI.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gallery item created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["galleryItems"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create gallery item",
        variant: "destructive",
      });
    },
  });

  // Update gallery item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      galleryAPI.update(id, formData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gallery item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["galleryItems"] });
      setShowEditDialog(false);
      setEditingItemId(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update gallery item",
        variant: "destructive",
      });
    },
  });

  // Delete gallery item mutation
  const deleteItemMutation = useMutation({
    mutationFn: galleryAPI.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gallery item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["galleryItems"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete gallery item",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      imageName: "",
      description: "",
      alt: "",
      category: "",
      tags: "",
      year: "",
      location: "",
      photographer: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateItem = () => {
    if (!formData.title || !formData.imageName || !imageFile) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select an image",
        variant: "destructive",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("galleryImage", imageFile);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("imageName", formData.imageName);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("alt", formData.alt || formData.imageName);
    formDataToSend.append("category", formData.category);
    if (formData.tags) formDataToSend.append("tags", JSON.stringify(formData.tags.split(",").map(t => t.trim())));
    if (formData.year) formDataToSend.append("year", formData.year);
    if (formData.location) formDataToSend.append("location", formData.location);
    if (formData.photographer) formDataToSend.append("photographer", formData.photographer);

    createItemMutation.mutate(formDataToSend);
  };

  const handleUpdateItem = () => {
    if (!editingItemId || !formData.title || !formData.imageName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formDataToSend = new FormData();
    if (imageFile) {
      formDataToSend.append("galleryImage", imageFile);
    }
    formDataToSend.append("title", formData.title);
    formDataToSend.append("imageName", formData.imageName);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("alt", formData.alt || formData.imageName);
    formDataToSend.append("category", formData.category);
    if (formData.tags) formDataToSend.append("tags", JSON.stringify(formData.tags.split(",").map(t => t.trim())));
    if (formData.year) formDataToSend.append("year", formData.year);
    if (formData.location) formDataToSend.append("location", formData.location);
    if (formData.photographer) formDataToSend.append("photographer", formData.photographer);

    updateItemMutation.mutate({ id: editingItemId, formData: formDataToSend });
  };

  const handleEditItem = async (item: GalleryItem) => {
    try {
      const response = await galleryAPI.getById(item._id);
      const itemData = response.data;
      setFormData({
        title: itemData.title,
        imageName: itemData.imageName,
        description: itemData.description || "",
        alt: itemData.alt || "",
        category: itemData.category._id,
        tags: itemData.tags?.join(", ") || "",
        year: itemData.year?.toString() || "",
        location: itemData.location || "",
        photographer: itemData.photographer || "",
      });
      setImagePreview(itemData.src);
      setEditingItemId(item._id);
      setShowEditDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load gallery item data",
        variant: "destructive",
      });
    }
  };

  const handleViewItem = (item: GalleryItem) => {
    setSelectedItem(item);
    setShowViewDialog(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const filteredItems = itemsData?.filter((item: GalleryItem) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.imageName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const categories = categoriesData || [];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gallery Management</h1>
            <p className="text-muted-foreground">Upload and manage your gallery images</p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Upload Image
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
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No gallery items found
              </div>
            ) : (
              filteredItems.map((item: GalleryItem) => (
                <Card key={item._id} className="p-2 hover:shadow-md transition-all">
                  <div className="aspect-[4/3] rounded-md overflow-hidden mb-2">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-medium text-sm mb-1 truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2 truncate">{item.imageName}</p>
                  {item.category && (
                    <Badge variant="secondary" className="mb-2">{item.category.name}</Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleViewItem(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={() => handleDeleteItem(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Create Gallery Item Dialog */}
        <Dialog
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Gallery Image</DialogTitle>
              <DialogDescription>
                Fill in the details to upload a new gallery image
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Image *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Image title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageName">Image Name *</Label>
                  <Input
                    id="imageName"
                    value={formData.imageName}
                    onChange={(e) =>
                      setFormData({ ...formData, imageName: e.target.value })
                    }
                    placeholder="Image name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Image description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input
                    id="alt"
                    value={formData.alt}
                    onChange={(e) =>
                      setFormData({ ...formData, alt: e.target.value })
                    }
                    placeholder="Alt text for accessibility"
                  />
                </div>
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
                      {categories.map((cat: Category) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    placeholder="Year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photographer">Photographer</Label>
                  <Input
                    id="photographer"
                    value={formData.photographer}
                    onChange={(e) =>
                      setFormData({ ...formData, photographer: e.target.value })
                    }
                    placeholder="Photographer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="tag1, tag2, tag3"
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
                onClick={handleCreateItem}
                disabled={createItemMutation.isPending}
              >
                {createItemMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Gallery Item Dialog */}
        <Dialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setEditingItemId(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Gallery Image</DialogTitle>
              <DialogDescription>
                Update the gallery image details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-image">Update Image (optional)</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Image title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-imageName">Image Name *</Label>
                  <Input
                    id="edit-imageName"
                    value={formData.imageName}
                    onChange={(e) =>
                      setFormData({ ...formData, imageName: e.target.value })
                    }
                    placeholder="Image name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Image description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-alt">Alt Text</Label>
                  <Input
                    id="edit-alt"
                    value={formData.alt}
                    onChange={(e) =>
                      setFormData({ ...formData, alt: e.target.value })
                    }
                    placeholder="Alt text for accessibility"
                  />
                </div>
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
                      {categories.map((cat: Category) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    placeholder="Year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-photographer">Photographer</Label>
                  <Input
                    id="edit-photographer"
                    value={formData.photographer}
                    onChange={(e) =>
                      setFormData({ ...formData, photographer: e.target.value })
                    }
                    placeholder="Photographer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingItemId(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateItem}
                disabled={updateItemMutation.isPending}
              >
                {updateItemMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Image"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Gallery Item Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem?.title}</DialogTitle>
              <DialogDescription>
                {selectedItem?.imageName}
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-6">
                <img
                  src={selectedItem.src}
                  alt={selectedItem.alt}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="space-y-4">
                  {selectedItem.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{selectedItem.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedItem.category && (
                      <div>
                        <h3 className="font-semibold mb-2">Category</h3>
                        <Badge>{selectedItem.category.name}</Badge>
                      </div>
                    )}
                    {selectedItem.year && (
                      <div>
                        <h3 className="font-semibold mb-2">Year</h3>
                        <p className="text-muted-foreground">{selectedItem.year}</p>
                      </div>
                    )}
                    {selectedItem.location && (
                      <div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <p className="text-muted-foreground">{selectedItem.location}</p>
                      </div>
                    )}
                    {selectedItem.photographer && (
                      <div>
                        <h3 className="font-semibold mb-2">Photographer</h3>
                        <p className="text-muted-foreground">{selectedItem.photographer}</p>
                      </div>
                    )}
                  </div>
                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
