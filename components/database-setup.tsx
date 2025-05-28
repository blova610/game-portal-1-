"use client";

import { useState } from "react";
import {
  Database,
  Play,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  Trash2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { seedSampleGames } from "@/lib/game-utils";

const CLEANUP_SQL = `-- Clean up existing data and recreate tables
-- WARNING: This will delete all existing data!

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing tables (this will also drop all policies)
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS games CASCADE;`;

const SQL_SCRIPT = `-- Create games table
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  thumbnail TEXT NOT NULL,
  game_url TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  canonical TEXT,
  robots TEXT DEFAULT 'index, follow',
  keywords TEXT,
  json_ld JSONB
);

-- Create RLS policies for games table
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Anyone can read games
CREATE POLICY "Anyone can read games" 
ON games FOR SELECT 
USING (true);

-- Temporary policy for initial setup (will be dropped after seeding)
CREATE POLICY "Allow temporary inserts for setup" 
ON games FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Only admin users can update games
CREATE POLICY "Admin users can update games" 
ON games FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Only admin users can delete games
CREATE POLICY "Admin users can delete games" 
ON games FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Users can update their own profile (but not admin status)
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Create likes table to track user likes
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Create RLS policies for likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes count
CREATE POLICY "Anyone can read likes" 
ON likes FOR SELECT 
USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Users can insert own likes" 
ON likes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own likes
CREATE POLICY "Users can delete own likes" 
ON likes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

const SECURITY_SQL = `-- After seeding, run this to secure the games table:

-- Drop the temporary insert policy
DROP POLICY IF EXISTS "Allow temporary inserts for setup" ON games;
DROP POLICY IF EXISTS "Allow admin users to insert games" ON games;
DROP POLICY IF EXISTS "Admin users can insert games" ON games;

-- Create the final admin-only insert policy
CREATE POLICY "Admin users can insert games" 
ON games FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);`;

const ADMIN_SQL = `-- Set admin status for a user (replace 'your-email@example.com' with actual email)
-- Run this after the user has signed up at least once

UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Or if you know the user ID directly:
-- UPDATE profiles SET is_admin = true WHERE id = 'user-uuid-here';

-- To check admin users:
SELECT u.email, p.is_admin, p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.is_admin = true;`;

export default function DatabaseSetup() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleanupCopied, setIsCleanupCopied] = useState(false);
  const [isSqlCopied, setIsSqlCopied] = useState(false);
  const [isSecurityCopied, setIsSecurityCopied] = useState(false);
  const [isAdminCopied, setIsAdminCopied] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const handleCopyCleanup = async () => {
    try {
      await navigator.clipboard.writeText(CLEANUP_SQL);
      setIsCleanupCopied(true);
      setTimeout(() => setIsCleanupCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Cleanup SQL script copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy cleanup script.",
        variant: "destructive",
      });
    }
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT);
      setIsSqlCopied(true);
      setTimeout(() => setIsSqlCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "SQL script copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy SQL script.",
        variant: "destructive",
      });
    }
  };

  const handleCopySecurity = async () => {
    try {
      await navigator.clipboard.writeText(SECURITY_SQL);
      setIsSecurityCopied(true);
      setTimeout(() => setIsSecurityCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Security SQL script copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy security script.",
        variant: "destructive",
      });
    }
  };

  const handleCopyAdmin = async () => {
    try {
      await navigator.clipboard.writeText(ADMIN_SQL);
      setIsAdminCopied(true);
      setTimeout(() => setIsAdminCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Admin setup script copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy admin script.",
        variant: "destructive",
      });
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);

    try {
      const success = await seedSampleGames();

      if (success) {
        toast({
          title: "Success!",
          description: "Sample games have been added to your database.",
        });
        setShowSecurity(true);
        setStep(4);
        // Refresh the page to show the games
        setTimeout(() => window.location.reload(), 3000);
      } else {
        toast({
          title: "Info",
          description:
            "Games already exist or there was an issue seeding the database.",
        });
      }
    } catch (error: any) {
      console.error("Error seeding database:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to seed the database. Make sure the tables are created first.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            Welcome to GamePortal
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Let's set up your database to get your game portal running.
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Cleanup */}
          <Card className={step >= 1 ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Step 1: Clean Up Existing Data
              </CardTitle>
              <CardDescription>
                Remove any existing tables and data to start fresh. ⚠️ This will
                delete all existing data!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will permanently delete all
                  existing games, profiles, and likes data. Only run this if you
                  want to start completely fresh.
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-32">
                  <code>{CLEANUP_SQL}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={handleCopyCleanup}
                >
                  {isCleanupCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyCleanup}
                  variant="outline"
                  className="flex-1"
                >
                  {isCleanupCopied ? "Copied!" : "Copy Cleanup Script"}
                </Button>
                <Button onClick={() => setStep(2)} variant="default">
                  Done - Next Step
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Create Tables */}
          <Card
            className={
              step >= 2 ? "border-primary" : step < 2 ? "opacity-50" : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Step 2: Create Database Tables
              </CardTitle>
              <CardDescription>
                Create the required database tables with proper RLS policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Go to your Supabase project dashboard → SQL Editor and run the
                  following script:
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-40">
                  <code>{SQL_SCRIPT.substring(0, 200)}...</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={handleCopySQL}
                >
                  {isSqlCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopySQL}
                  variant="outline"
                  className="flex-1"
                >
                  {isSqlCopied ? "Copied!" : "Copy Full SQL Script"}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  variant="default"
                  disabled={step < 2}
                >
                  Done - Next Step
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Add Sample Games */}
          <Card
            className={
              step >= 3 ? "border-primary" : step < 3 ? "opacity-50" : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Step 3: Add Sample Games
              </CardTitle>
              <CardDescription>
                Add sample games to populate your portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Sample games include:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 2048 - Number puzzle game</li>
                  <li>• Snake Game - Classic arcade game</li>
                  <li>• Tetris - Block puzzle game</li>
                  <li>• Pac-Man - Iconic maze game</li>
                  <li>• Solitaire - Classic card game</li>
                  <li>• Chess - Strategy board game</li>
                </ul>
              </div>

              <Button
                onClick={handleSeedDatabase}
                disabled={isSeeding || step < 3}
                className="w-full"
                size="lg"
              >
                {isSeeding ? (
                  <>
                    <Database className="mr-2 h-4 w-4 animate-spin" />
                    Adding Sample Games...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Add Sample Games
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Step 4: Security */}
          {showSecurity && (
            <Card className="border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Step 4: Secure Your Database
                </CardTitle>
                <CardDescription>
                  Remove the temporary seeding policy and secure your database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Run this security script to
                    remove the temporary anonymous insert policy.
                  </AlertDescription>
                </Alert>

                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{SECURITY_SQL}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={handleCopySecurity}
                  >
                    {isSecurityCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Button
                  onClick={handleCopySecurity}
                  variant="outline"
                  className="w-full"
                >
                  {isSecurityCopied ? "Copied!" : "Copy Security Script"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Setup */}
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Setup
              </CardTitle>
              <CardDescription>
                Set up admin users to access the dashboard at{" "}
                <strong>/dashboard</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Steps to create an admin:</strong>
                  <br />
                  1. First, register a user account on your site (go to
                  /register)
                  <br />
                  2. Then run the SQL script below to make that user an admin
                  <br />
                  3. Admin users can access the dashboard at{" "}
                  <strong>/dashboard</strong>
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  <code>{ADMIN_SQL}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={handleCopyAdmin}
                >
                  {isAdminCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button
                onClick={handleCopyAdmin}
                variant="outline"
                className="w-full"
              >
                {isAdminCopied ? "Copied!" : "Copy Admin Setup Script"}
              </Button>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Admin Dashboard Access:
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Once you've set up an admin user, you can access the admin
                  dashboard at:
                  <br />
                  <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : "your-domain.com"}
                    /dashboard
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Complete Setup Process:</strong>
              <br />
              1. Clean up → 2. Create tables → 3. Add games → 4. Secure database
              → 5. Set up admin user
              <br />
              After setup, admin users can manage games at{" "}
              <strong>/dashboard</strong>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
