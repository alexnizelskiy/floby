"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LeadForm } from "@/components/forms/lead-form";

interface OrderCtaProps extends ButtonProps {
  label?: string;
  source?: string;
  defaultService?: string;
  total?: number;
}

/** Button that opens the order form in a modal. */
export function OrderCta({
  label = "Заказать уборку",
  source = "cta",
  defaultService,
  total,
  children,
  ...buttonProps
}: OrderCtaProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} {...buttonProps}>
        {children ?? label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Заказать уборку"
        description="Оставьте контакты — перезвоним и подтвердим детали."
      >
        <LeadForm
          source={source}
          defaultService={defaultService}
          total={total}
          onSuccess={() => setTimeout(() => setOpen(false), 2200)}
        />
      </Modal>
    </>
  );
}
