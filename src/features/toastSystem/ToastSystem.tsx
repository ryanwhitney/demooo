import {
  Button,
  Text,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion,
} from "react-aria-components";
import { flushSync } from "react-dom";
import * as style from "./ToastSystem.css";

interface ToastContentItems {
  title: string;
  description?: string;
}

export const toastQueue = new ToastQueue<ToastContentItems>({
  wrapUpdate(fn) {
    if ("startViewTransition" in document) {
      document.startViewTransition(() => {
        flushSync(fn);
      });
    } else {
      fn();
    }
  },
});

const ToastSystem = () => {
  return (
    <ToastRegion queue={toastQueue} className={style.toastsContainer}>
      {({ toast }) => (
        <Toast
          toast={toast}
          className={`${style.toast} toast`}
          style={{
            viewTransitionName: toast.key,
            // biome-ignore lint/suspicious/noExplicitAny: only way to use viewTransitionClass
            ["viewTransitionClass" as any]: "toast",
          }}
        >
          <ToastContent>
            <Text slot="title">{toast.content.title}</Text>
            <Text slot="description">{toast.content.description}</Text>
          </ToastContent>
          <Button className={style.toastCloseButton} slot="close">
            &times;
          </Button>
        </Toast>
      )}
    </ToastRegion>
  );
};

export default ToastSystem;
