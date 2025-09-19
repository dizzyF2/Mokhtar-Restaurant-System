import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ConfirmModalProps {
    trigger: React.ReactNode;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
}

export default function ConfirmModal({
    trigger,
    title = "Warning!",
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    }: ConfirmModalProps) {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div onClick={() => setOpen(true)}>{trigger}</div>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-900 my-5 pr-3" dir="rtl">{message}</p>

                <DialogFooter className="mt-4 flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="rounded-xl"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        className="rounded-xl"
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}