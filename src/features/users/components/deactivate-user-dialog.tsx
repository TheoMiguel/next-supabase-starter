"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deactivateUser } from "@/features/users/actions/deactivate-user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeactivateUserDialogProps {
  userId: string;
  userName: string;
}

export function DeactivateUserDialog({ userId, userName }: DeactivateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeactivate = () => {
    startTransition(async () => {
      const result = await deactivateUser(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Usuario desactivado correctamente");
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          Desactivar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Desactivar usuario?</DialogTitle>
          <DialogDescription>
            Vas a desactivar a <strong>{userName}</strong>. El usuario no podrá iniciar sesión hasta
            que sea reactivado.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDeactivate} disabled={isPending}>
            {isPending ? "Desactivando..." : "Desactivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
