import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { comicClassEnum, SelectComic } from "@/db/schema";
import { addComic } from "../actions/add-comic.action";
import { useState } from "react";
import { updateComic } from "../actions/update-comic.action";

interface AddComicDialogProps {
  children: React.ReactNode;
  onComicAdded?: () => void;
  comic?: SelectComic;
  mode?: 'add' | 'edit';
}

export function AddComicDialog({ children, onComicAdded, comic, mode = 'add' }: AddComicDialogProps) {
  const [open, setOpen] = useState(false);

  async function onSubmit(formData: FormData) {
    if (mode === 'edit' && comic) {
      formData.append('id', comic.id);
      await updateComic(formData);
    } else {
      await addComic(formData);
    }
    setOpen(false);
    onComicAdded?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Comic' : 'Add New Comic'}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              defaultValue={comic?.name}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="picUrl">Picture URL</Label>
            <Input 
              id="picUrl" 
              name="picUrl" 
              type="url" 
              defaultValue={comic?.picUrl || ''}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              name="city" 
              defaultValue={comic?.city || ''}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="socialMedia">Social Media Followers</Label>
            <Input 
              id="socialMedia" 
              name="socialMedia" 
              type="number" 
              defaultValue={comic?.socialMedia?.toString()}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select name="class" defaultValue={comic?.class || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {(Object.values(comicClassEnum.enumValues) as string[]).map((classType) => (
                  <SelectItem key={classType} value={classType}>
                    Class {classType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Stage Time (minutes)</Label>
            <Input 
              id="time" 
              name="time" 
              type="number" 
              defaultValue={comic?.time?.toString()}
            />
          </div>
          
          <Button type="submit" className="w-full">
            {mode === 'edit' ? 'Save Changes' : 'Add Comic'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 