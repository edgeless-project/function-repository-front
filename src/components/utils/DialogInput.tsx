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
import React, {useEffect, useState} from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface DialogInputProps {
  isOpen: boolean;
  title: string;
  description: string;
  isLoading: boolean;
  options?: Array<string>;
  onConfirm: (arg0: string) => void;
  onClose: () => void;
}

export default function DialogInput ({isOpen, title, description, isLoading, options, onConfirm, onClose}: DialogInputProps) {
  const [value, setLocalValue] = useState("");
  const [descText, setDescText] = useState("");

  useEffect(() => {
    setLocalValue("");  //Avoid value residues on open or close dialog
    if (options?.length === 0)
      setDescText("There are no possible connexions to be made");
    else 
      setDescText(description+":");
  }, [options?.length]);

  const handleClose = () => {
    onConfirm(value);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {!isLoading && <DialogDescription>
            <label>
              {descText}
              {options ? (options.length > 0 ?
                    <Select onValueChange={v => setLocalValue(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select> :
                    null):
                <input
                    className="ml-4"
                    value={value}
                    onChange={e => setLocalValue(e.target.value)}
                />}
            </label>
          </DialogDescription>}
          {isLoading && <div className="flex items-center justify-center py-5">
            <Spinner/>
          </div>}

        </DialogHeader>
        {!isLoading && <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button className="bg-edgeless-primary-color hover:bg-edgeless-secondary-color" variant={value?"default":"ghost"} disabled={!value} onClick={handleClose}>Confirm</Button>
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};