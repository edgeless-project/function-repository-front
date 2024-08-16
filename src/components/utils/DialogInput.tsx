import { Button } from "@/components/ui/button";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Spinner from "@/components/utils/Spinner";
import React, {useState} from "react";

interface DialogInputProps {
  isOpen: boolean;
  title: string;
  description: string;
  isLoading: boolean;
  options?: Array<string>;
  onConfirm: (arg0: string) => void;
  onClose: () => void;
}

export default function DialogDelete ({isOpen, title, description, isLoading, options, onConfirm, onClose}: DialogInputProps) {
  const [value, setLocalValue] = useState("");

  const handleClose = () => {
    onConfirm(value);
    onClose();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {!isLoading && <DialogDescription>
            <label>
              {description}:
              {options ?
                  <select className="ml-4 my-2"
                          value={value}
                          onChange={e => setLocalValue(e.target.value)}>
                    <option/>
                    {options.map(v => (
                        <option key={v}>{v}</option>
                    ))}
                  </select> :
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
          <Button variant={value?"default":"ghost"} disabled={!value} onClick={handleClose}>Confirm</Button>
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};