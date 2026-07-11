import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<React.ComponentProps<"input">, "ref"> {
  as?: "input" | "select";
  children?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  ({ className, type, as = "input", children, ...props }, ref) => {
    const baseClassName = cn(
      "h-14 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-3.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
      className
    );

    if (as === "select") {
      return (
        <div className="relative w-full" data-slot="input-select-wrapper">
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            className={cn(
              "appearance-none pr-10 cursor-pointer",
              baseClassName
            )}
            {...(props as React.ComponentProps<"select">)}
          >
            {children}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground select-none opacity-60" />
        </div>
      );
    }

    return (
      <InputPrimitive
        ref={ref as React.Ref<HTMLInputElement>}
        type={type}
        data-slot="input"
        className={baseClassName}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
