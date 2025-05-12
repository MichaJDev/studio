// src/components/forms/FileUploadForm.tsx
"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoContext } from '@/contexts/VideoContext';
import { handleGenerateDescriptionAction } from '@/app/actions';
import type { Video } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Wand2, PlusCircle, Loader2, FileVideo } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function FileUploadForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // For simulated progress

  const { addVideo } = useVideoContext();
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
        // Reset description if a new file is selected
        setDescription(''); 
        toast({ title: "File Selected", description: selectedFile.name });
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please select a video file." });
        setFile(null);
        setFilePreview(null);
      }
    }
  };

  const handleGenerateDescription = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "No File", description: "Please select a video file first." });
      return;
    }
    setIsGeneratingDescription(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const videoDataUri = reader.result as string;
        const result = await handleGenerateDescriptionAction({ videoDataUri });
        if (result.description) {
          setDescription(result.description);
          toast({ title: "Description Generated!", description: "AI has crafted a description for your video." });
        } else if (result.error) {
          toast({ variant: "destructive", title: "AI Error", description: result.error });
        }
        setIsGeneratingDescription(false);
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "File Read Error", description: "Could not read the video file." });
        setIsGeneratingDescription(false);
      };
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!file || !title) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please select a file and provide a title." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        const newVideo: Video = {
          id: crypto.randomUUID(),
          title,
          description,
          thumbnailUrl: 'https://picsum.photos/400/225?random=' + crypto.randomUUID().substring(0,5), // Placeholder thumbnail
          videoSrc: URL.createObjectURL(file), // Use object URL for local playback
          uploadedAt: new Date().toISOString(),
          duration: "N/A", // Real duration would require client-side video processing
          dataAiHint: "uploaded video"
        };
        addVideo(newVideo);
        toast({ title: "Video Added!", description: `${title} has been added to your library.` });
        setIsUploading(false);
        router.push('/'); // Redirect to home page after adding
      }
    }, 200);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <UploadCloud className="mr-3 h-7 w-7 text-primary" /> Upload New Video
        </CardTitle>
        <CardDescription>
          Add a new video to your StreamVerse library. Generate a description using AI!
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-file" className="text-base">Video File</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
              className="file:text-primary file:font-semibold hover:file:bg-primary/10"
            />
            {filePreview && file && (
              <div className="mt-4 p-4 border border-dashed rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground mb-2 flex items-center">
                  <FileVideo className="h-5 w-5 mr-2 text-primary" />
                  Preview: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
                <video src={filePreview} controls className="w-full rounded-md max-h-60 aspect-video object-contain bg-black" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Video Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Awesome Vacation"
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={!file || isGeneratingDescription}
              >
                {isGeneratingDescription ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate with AI
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A captivating description of your video..."
              rows={4}
              className="text-base"
            />
          </div>
          {isUploading && (
            <div className="space-y-2">
              <Label>Upload Progress</Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">{uploadProgress}%</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-lg py-6" disabled={isUploading || isGeneratingDescription}>
            {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {isUploading ? 'Adding to Library...' : 'Add to Library'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
