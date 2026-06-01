import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Paste } from "@shared/schema";

export default function RawPaste() {
  const { slug } = useParams<{ slug: string }>();

  const { data: paste, isLoading, error } = useQuery<Paste>({
    queryKey: ["/api/pastes", slug],
    enabled: !!slug,
  });

  useEffect(() => {
    if (paste) {
      document.body.style.margin = "0";
      document.body.style.padding = "1rem";
      document.body.style.fontFamily = "monospace";
      document.body.style.whiteSpace = "pre-wrap";
      document.body.style.wordBreak = "break-word";
    }
  }, [paste]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !paste) {
    return <div>Paste not found or expired.</div>;
  }

  return <>{paste.content}</>;
}
