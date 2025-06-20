"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/ui/button";

type NavigationItem = {
  title: string;
  href: string;
};

type NavigationMenuProps = {
  items: NavigationItem[];
};

export function NavigationMenu({ items }: NavigationMenuProps) {
  const pathname = usePathname();

  return (
    <nav>
      {items.map(({ title, href }) => (
        <Button
          key={href}
          variant={"link"}
          isActive={pathname === href}
          asChild
        >
          <Link href={href}>{title}</Link>
        </Button>
      ))}
    </nav>
  );
}
