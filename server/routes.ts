import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabaseAdmin } from "./lib/supabase";
import { generateSlug, generateSecretToken, calculateExpiresAt, isExpired, checkRateLimit } from "./lib/utils";
import { insertPasteSchema, updatePasteSchema, deletePasteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting middleware
  app.use("/api/pastes", (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    
    next();
  });

  // Create paste
  app.post("/api/pastes", async (req, res) => {
    try {
      const data = insertPasteSchema.parse(req.body);
      
      const slug = generateSlug();
      const secret_token = generateSecretToken();
      const expires_at = calculateExpiresAt(data.expiration);
      
      const { error } = await supabaseAdmin
        .from('pastes')
        .insert({
          slug,
          title: data.title || null,
          content: data.content,
          language: data.language || null,
          privacy: data.privacy,
          secret_token,
          expires_at,
        });
      
      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Failed to create paste" });
      }
      
      res.json({ slug, secret_token });
    } catch (error: any) {
      console.error("Create paste error:", error);
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  // Get paste by slug
  app.get("/api/pastes/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const { data: paste, error } = await supabaseAdmin
        .from('pastes')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error || !paste) {
        return res.status(404).json({ error: "Paste not found" });
      }
      
      // Check if expired
      if (isExpired(paste.expires_at)) {
        return res.status(410).json({ error: "Paste has expired" });
      }
      
      // Check privacy - private pastes should be handled via Edge Function
      // For now, we'll allow backend to serve them (simplified implementation)
      if (paste.privacy === 'private') {
        // In production, this should be handled by Edge Function with token verification
        // For MVP, we'll return the paste but frontend should show token requirement
      }
      
      // Increment view counter
      await supabaseAdmin
        .from('pastes')
        .update({ views: paste.views + 1 })
        .eq('slug', slug);
      
      // Don't send secret_token to client
      const { secret_token, ...pasteData } = paste;
      pasteData.views += 1; // Show updated count immediately
      
      res.json(pasteData);
    } catch (error: any) {
      console.error("Get paste error:", error);
      res.status(500).json({ error: "Failed to retrieve paste" });
    }
  });

  // Update paste
  app.put("/api/pastes/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const data = updatePasteSchema.parse(req.body);
      
      // Verify secret token
      const { data: paste, error: fetchError } = await supabaseAdmin
        .from('pastes')
        .select('secret_token, expires_at')
        .eq('slug', slug)
        .single();
      
      if (fetchError || !paste) {
        return res.status(404).json({ error: "Paste not found" });
      }
      
      if (isExpired(paste.expires_at)) {
        return res.status(410).json({ error: "Paste has expired" });
      }
      
      if (paste.secret_token !== data.secret_token) {
        return res.status(403).json({ error: "Invalid secret token" });
      }
      
      // Update paste
      const { error: updateError } = await supabaseAdmin
        .from('pastes')
        .update({
          title: data.title || null,
          content: data.content,
          language: data.language || null,
        })
        .eq('slug', slug);
      
      if (updateError) {
        console.error("Update error:", updateError);
        return res.status(500).json({ error: "Failed to update paste" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update paste error:", error);
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  // Delete paste
  app.delete("/api/pastes/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const data = deletePasteSchema.parse(req.body);
      
      // Verify secret token
      const { data: paste, error: fetchError } = await supabaseAdmin
        .from('pastes')
        .select('secret_token')
        .eq('slug', slug)
        .single();
      
      if (fetchError || !paste) {
        return res.status(404).json({ error: "Paste not found" });
      }
      
      if (paste.secret_token !== data.secret_token) {
        return res.status(403).json({ error: "Invalid secret token" });
      }
      
      // Delete paste
      const { error: deleteError } = await supabaseAdmin
        .from('pastes')
        .delete()
        .eq('slug', slug);
      
      if (deleteError) {
        console.error("Delete error:", deleteError);
        return res.status(500).json({ error: "Failed to delete paste" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete paste error:", error);
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
