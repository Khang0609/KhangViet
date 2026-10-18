"use client";

import React from "react";
import { BrandLogo } from "./BrandLogo";
import { DesktopNav } from "./DesktopNav";
import { NavActions } from "./NavActions";
import { MobileNavToggle } from "./MobileNavToggle";
import { MobileMenu } from "./MobileMenu";
import { useNavigation } from "./hooks/useNavigation";
import { DEFAULT_NAV_ITEMS, COMPANY_CONTACT } from "./constants";
import { NavigationProps } from "./types";

export const NavigationBar: React.FC<NavigationProps> = ({
  items = DEFAULT_NAV_ITEMS,
  phoneNumber = COMPANY_CONTACT.phoneDisplay,
  phoneTel = COMPANY_CONTACT.phoneTel,
  onOpenProfile,
  className = "",
  customLogo,
}) => {
  const { isOpen, toggle, handleItemClick, handleProfileClick } = useNavigation(
    { onOpenProfile },
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#111215]/85 backdrop-blur-xl ${className}`}
    >
      <div className="mx-auto flex h-20 max-w-360 items-center justify-between gap-6 px-5 md:px-8 xl:px-12">
        {customLogo || <BrandLogo />}

        <DesktopNav items={items} />

        <NavActions
          phoneNumber={phoneNumber}
          phoneTel={phoneTel}
          onOpenProfile={onOpenProfile}
        />

        <MobileNavToggle isOpen={isOpen} onToggle={toggle} />
      </div>

      <MobileMenu
        isOpen={isOpen}
        items={items}
        onItemClick={handleItemClick}
        onOpenProfile={handleProfileClick}
      />
    </header>
  );
};

export default NavigationBar;
