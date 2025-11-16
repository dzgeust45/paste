import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Paste } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Copy,
  Eye,
  Calendar,
  Clock,
  Code2,
  Lock,
  Globe,
  EyeOff,
  Edit,
  Trash2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES } from "@shared/schema";

declare global {
  interface Window {
    Prism: any;
  }
}

export default function ViewPaste() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [secretToken, setSecretToken] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLanguage, setEditLanguage] = useState("plaintext");

  const { data: paste, isLoading, error } = useQuery<Paste>({
    queryKey: ["/api/pastes", slug],
    enabled: !!slug,
  });

  useEffect(() => {
    if (paste && window.Prism) {
      setTimeout(() => {
        window.Prism.highlightAll();
      }, 100);
    }
  }, [paste]);

  const updateMutation = useMutation({
    mutationFn: async (data: { title?: string; content: string; language?: string; secret_token: string }) => {
      const res = await apiRequest("PUT", `/api/pastes/${slug}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pastes", slug] });
      setEditDialogOpen(false);
      setSecretToken("");
      toast({
        title: "Success",
        description: "Paste updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (secret_token: string) => {
      await apiRequest("DELETE", `/api/pastes/${slug}`, { secret_token });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Paste deleted successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handleEdit = () => {
    if (!paste) return;
    setEditTitle(paste.title || "");
    setEditContent(paste.content);
    setEditLanguage(paste.language || "plaintext");
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    updateMutation.mutate({
      title: editTitle,
      content: editContent,
      language: editLanguage,
      secret_token: secretToken,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(secretToken);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Card className="p-6">
            <Skeleton className="h-96 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-2">
            <FileText className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold" data-testid="text-paste-not-found">Paste Not Found</h2>
          <p className="text-muted-foreground">
            This paste doesn't exist, has expired, or requires a secret token to view.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-create-new">
            Create New Paste
          </Button>
        </Card>
      </div>
    );
  }

  const privacyIcon = paste.privacy === "public" ? Globe : paste.privacy === "private" ? Lock : EyeOff;
  const PrivacyIcon = privacyIcon;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2" data-testid="text-paste-title">
              {paste.title || "Untitled paste"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span data-testid="text-created-date">
                  {format(new Date(paste.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              {paste.expires_at && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span data-testid="text-expires-date">
                    Expires {format(new Date(paste.expires_at), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span data-testid="text-view-count">{paste.views} views</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5" data-testid="badge-privacy">
              <PrivacyIcon className="w-3 h-3" />
              {paste.privacy}
            </Badge>
            {paste.language && (
              <Badge variant="outline" className="flex items-center gap-1.5" data-testid="badge-language">
                <Code2 className="w-3 h-3" />
                {paste.language}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(paste.content, "Content")}
            data-testid="button-copy-content"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/raw/${slug}`, "_blank")}
            data-testid="button-view-raw"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Raw
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            data-testid="button-edit"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            data-testid="button-delete"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        <Card className="overflow-hidden">
          <pre className="line-numbers m-0 !bg-transparent !border-0" data-testid="code-block">
            <code className={`language-${paste.language || "plaintext"}`}>
              {paste.content}
            </code>
          </pre>
        </Card>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-dialog-title">Edit Paste</DialogTitle>
            <DialogDescription>
              Update your paste content. You'll need your secret token.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-token">Secret Token *</Label>
              <Input
                id="edit-token"
                type="password"
                placeholder="Enter your secret token"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                data-testid="input-edit-token"
              />
            </div>
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Untitled paste"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                data-testid="input-edit-title"
              />
            </div>
            <div>
              <Label htmlFor="edit-language">Language</Label>
              <Select value={editLanguage} onValueChange={setEditLanguage}>
                <SelectTrigger data-testid="select-edit-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                placeholder="Paste content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-64 font-mono text-sm"
                data-testid="textarea-edit-content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSecretToken("");
              }}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || !secretToken || !editContent}
              data-testid="button-save-edit"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-delete-dialog-title">Delete Paste</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Enter your secret token to confirm deletion.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="delete-token">Secret Token *</Label>
            <Input
              id="delete-token"
              type="password"
              placeholder="Enter your secret token"
              value={secretToken}
              onChange={(e) => setSecretToken(e.target.value)}
              data-testid="input-delete-token"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSecretToken("");
              }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending || !secretToken}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Paste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
