"use client";

import { useState, type ChangeEvent } from "react";
import { FileCheck2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReportNoShowDialogProps {
  counterpartFirstName: string;
  onSubmit: (receiptFileName?: string, note?: string) => void | Promise<void>;
}

export function ReportNoShowDialog({
  counterpartFirstName,
  onSubmit,
}: ReportNoShowDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [fileName, setFileName] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFileName(event.target.files?.[0]?.name);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await onSubmit(fileName, note.trim() || undefined);
      setOpen(false);
      setNote("");
      setFileName(undefined);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        Report a no-show
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {counterpartFirstName} as a no-show</DialogTitle>
          <DialogDescription>
            This submits a claim for review. Attach proof of the baggage fee
            you ended up paying, if you have it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="receipt-upload">Receipt (optional)</Label>
          <label
            htmlFor="receipt-upload"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input p-4 text-sm text-muted-foreground hover:bg-muted/50"
          >
            {fileName ? (
              <>
                <FileCheck2 className="size-4 shrink-0 text-teal-600" />
                <span className="truncate text-foreground">{fileName}</span>
              </>
            ) : (
              <>
                <Upload className="size-4 shrink-0" />
                Upload a photo or PDF of your receipt
              </>
            )}
          </label>
          <input
            id="receipt-upload"
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            Prototype only — files aren&apos;t actually uploaded anywhere yet.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="no-show-note">What happened? (optional)</Label>
          <Textarea
            id="no-show-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Waited at the check-in counter until boarding closed..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
