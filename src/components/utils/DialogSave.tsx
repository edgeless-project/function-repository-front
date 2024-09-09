import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Spinner from "@/components/utils/Spinner";

interface DialogSaveProps {
  isOpen: boolean;
  title: string;
  description: string;
  isLoading: boolean;
  onClose: () => void;
};

export default function DialogSave ({isOpen, title, description, isLoading, onClose}: DialogSaveProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          {!isLoading && <DialogDescription>
            {description}
          </DialogDescription>}
          {isLoading && <div className="flex items-center justify-center py-5">
            <Spinner />
          </div>}
          
        </DialogHeader>
        {!isLoading && <DialogFooter className="flex justify-end">
          <Button type={"button"} variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};