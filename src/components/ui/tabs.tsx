import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "",
        pills: "gap-1",
        underline: "rounded-none border-b bg-transparent p-0",
        card: "bg-transparent p-0 gap-2"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        pills: "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        underline: "rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 data-[state=active]:border-b-primary data-[state=active]:text-foreground",
        card: "rounded-md border border-transparent data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:shadow-sm"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Composite pattern for common tab usage scenarios
interface TabsCardProps extends React.ComponentPropsWithoutRef<typeof Tabs> {
  tabs: Array<{
    value: string;
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  variant?: VariantProps<typeof tabsListVariants>["variant"];
}

const TabsCard = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  TabsCardProps
>(({ className, tabs, variant = "default", ...props }, ref) => (
  <Tabs ref={ref} className={cn("w-full", className)} {...props}>
    <TabsList variant={variant} className="w-full">
      {tabs.map((tab) => (
        <TabsTrigger 
          key={tab.value} 
          value={tab.value}
          variant={variant}
          disabled={tab.disabled}
          className={tab.icon ? "flex items-center gap-2" : ""}
        >
          {tab.icon}
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {tabs.map((tab) => (
      <TabsContent key={tab.value} value={tab.value}>
        {tab.content}
      </TabsContent>
    ))}
  </Tabs>
));
TabsCard.displayName = "TabsCard";

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsCard };
