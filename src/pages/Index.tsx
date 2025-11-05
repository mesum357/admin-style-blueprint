import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="mb-4 text-5xl font-bold text-foreground">Content Management System</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A professional admin panel for managing your blogs, gallery, and library
        </p>
        <Button 
          onClick={() => navigate("/admin/login")}
          size="lg"
          className="px-8"
        >
          Go to Admin Panel
        </Button>
      </div>
    </div>
  );
};

export default Index;
