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
import { comicClassEnum } from "@/db/schema";
import { addComic } from "../actions/add-comic.action";

export function AddComicDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Comic</DialogTitle>
        </DialogHeader>
        <form action={addComic} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="picUrl">Picture URL</Label>
            <Input id="picUrl" name="picUrl" type="url" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="socialMedia">Social Media Followers</Label>
            <Input id="socialMedia" name="socialMedia" type="number" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select name="class">
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
            <Input id="time" name="time" type="number" />
          </div>
          
          <Button type="submit" className="w-full">Add Comic</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 