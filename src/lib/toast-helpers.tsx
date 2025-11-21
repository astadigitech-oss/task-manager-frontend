// Toast Helper Functions
import { toast } from "sonner";
import { CustomToast, ConfirmToast } from "@/components/ui/custom-toast";

export const showSuccessToast = (title: string, description?: string) => {
  toast.custom(
    () => <CustomToast title={title} description={description} type="success" />,
    { duration: 3000 }
  );
};

export const showErrorToast = (title: string, description?: string) => {
  toast.custom(
    () => <CustomToast title={title} description={description} type="error" />,
    { duration: 4000 }
  );
};

export const showWarningToast = (title: string, description?: string) => {
  toast.custom(
    () => <CustomToast title={title} description={description} type="warning" />,
    { duration: 4000 }
  );
};

export const showInfoToast = (title: string, description?: string) => {
  toast.custom(
    () => <CustomToast title={title} description={description} type="info" />,
    { duration: 3000 }
  );
};

export const showConfirmToast = (
  title: string,
  description: string,
  onConfirm: () => void,
  options?: {
    confirmLabel?: string;
    cancelLabel?: string;
    duration?: number;
  }
) => {
  toast.custom(
    (t) => (
      <ConfirmToast
        title={title}
        description={description}
        onConfirm={() => {
          onConfirm();
          toast.dismiss(t);
        }}
        onCancel={() => {
          toast.dismiss(t);
        }}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
      />
    ),
    { duration: options?.duration || 10000 }
  );
};

