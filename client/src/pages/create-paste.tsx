import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPasteSchema, type InsertPaste, LANGUAGES } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { createPaste } from "@/lib/localStorage";
import { useLocation } from "wouter";
import { Copy, Link as LinkIcon, FileText, Lock, Globe, EyeOff } from "lucide-react";

export default function CreatePaste() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createdPaste, setCreatedPaste] = useState<{
    slug: string;
    secret_token: string;
  } | null>(null);

  const form = useForm<InsertPaste>({
    resolver: zodResolver(insertPasteSchema),
    defaultValues: {
      title: "",
      content: "",
      language: "plaintext",
      privacy: "unlisted",
      expiration: "never",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPaste) => {
      return createPaste(data);
    },
    onSuccess: (data: any) => {
      setCreatedPaste(data);
      toast({
        title: "Paste created!",
        description: "Your paste has been created successfully.",
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

  const onSubmit = (data: InsertPaste) => {
    createMutation.mutate(data);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  if (createdPaste) {
    const pasteUrl = `${window.location.origin}/${createdPaste.slug}`;
    const rawUrl = `${window.location.origin}/raw/${createdPaste.slug}`;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold" data-testid="text-paste-created">Paste Created Successfully!</h2>
            <p className="text-muted-foreground text-sm">
              Your paste is ready to share. Save your secret token to edit or delete later.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                Paste URL
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={pasteUrl}
                  className="font-mono text-sm"
                  data-testid="input-paste-url"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(pasteUrl, "Paste URL")}
                  data-testid="button-copy-url"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                Raw URL
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={rawUrl}
                  className="font-mono text-sm"
                  data-testid="input-raw-url"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(rawUrl, "Raw URL")}
                  data-testid="button-copy-raw-url"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                Secret Token (Save this!)
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={createdPaste.secret_token}
                  className="font-mono text-sm"
                  data-testid="input-secret-token"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(createdPaste.secret_token, "Secret token")}
                  data-testid="button-copy-token"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You'll need this token to edit or delete your paste later.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => setLocation(`/${createdPaste.slug}`)}
              data-testid="button-view-paste"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              View Paste
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setCreatedPaste(null);
                form.reset();
              }}
              data-testid="button-create-another"
            >
              Create Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-2" data-testid="text-page-title">
              Create New Paste
            </h1>
            <p className="text-muted-foreground">
              Share code snippets with syntax highlighting and privacy controls
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                  Title (Optional)
                </Label>
                <Input
                  id="title"
                  placeholder="Untitled paste"
                  {...form.register("title")}
                  className="text-lg"
                  data-testid="input-title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Content *
                  </Label>
                  <Select
                    value={form.watch("language") || "plaintext"}
                    onValueChange={(value) => form.setValue("language", value)}
                  >
                    <SelectTrigger className="w-48" data-testid="select-language">
                      <SelectValue placeholder="Select language" />
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
                <Textarea
                  id="content"
                  placeholder="Paste your code here..."
                  {...form.register("content")}
                  className="min-h-96 font-mono text-sm resize-none"
                  data-testid="textarea-content"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Expiration</Label>
                  <RadioGroup
                    value={form.watch("expiration")}
                    onValueChange={(value) => form.setValue("expiration", value as any)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1h" id="exp-1h" data-testid="radio-expiration-1h" />
                      <Label htmlFor="exp-1h" className="font-normal cursor-pointer">
                        1 hour
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1d" id="exp-1d" data-testid="radio-expiration-1d" />
                      <Label htmlFor="exp-1d" className="font-normal cursor-pointer">
                        1 day
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1w" id="exp-1w" data-testid="radio-expiration-1w" />
                      <Label htmlFor="exp-1w" className="font-normal cursor-pointer">
                        1 week
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="never" id="exp-never" data-testid="radio-expiration-never" />
                      <Label htmlFor="exp-never" className="font-normal cursor-pointer">
                        Never
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Privacy</Label>
                  <RadioGroup
                    value={form.watch("privacy")}
                    onValueChange={(value) => form.setValue("privacy", value as any)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="public" id="privacy-public" className="mt-1" data-testid="radio-privacy-public" />
                      <div className="flex-1">
                        <Label htmlFor="privacy-public" className="font-normal cursor-pointer flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Visible to everyone and searchable
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="unlisted" id="privacy-unlisted" className="mt-1" data-testid="radio-privacy-unlisted" />
                      <div className="flex-1">
                        <Label htmlFor="privacy-unlisted" className="font-normal cursor-pointer flex items-center gap-2">
                          <EyeOff className="w-4 h-4" />
                          Unlisted
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Only accessible via URL
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="private" id="privacy-private" className="mt-1" data-testid="radio-privacy-private" />
                      <div className="flex-1">
                        <Label htmlFor="privacy-private" className="font-normal cursor-pointer flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Private
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requires secret token to view
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                  data-testid="button-create"
                >
                  {createMutation.isPending ? "Creating..." : "Create Paste"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => form.reset()}
                  data-testid="button-clear"
                >
                  Clear
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
