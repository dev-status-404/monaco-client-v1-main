import { id } from "date-fns/locale";
import {
  Book,
  Calculator,
  Crown,
  Dock,
  Frame,
  //   LifeBuoy,
  //   Send,
  Settings2,
  Target,
  Users2Icon,
} from "lucide-react";

const FREE_MENU = {
  navMain: [
    {
      id: "menu.dashboard",
      title: "Dashboard",
      url: "/dashboard",
      icon: Dock,
      isActive: true,
    },
    {
      id: "menu.operations",
      title: "Operations",
      url: `/operations`,
      icon: Target,
    },
    { id: "menu.strategy", title: "Strategy", url: "/strategy", icon: Frame },
    {
      id: "menu.tradingJournal",
      title: "Trading Journal",
      url: "/journal",
      icon: Book,
    },
    {
      id: "menu.tools",
      title: "Tools",
      url: "/tools/calculator",
      icon: Calculator,
    },
    {
      id: "menu.plans",
      title: "Plans",
      url: "/plans",
      icon: Crown,
    },
    {
      id: "menu.settings.title",
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { id: "menu.settings.billing", title: "Billing", url: "/billing" },
        {
          id: "menu.settings.tradeAccount",
          title: "Accounts",
          url: "/accounts",
        },
      ],
    },
  ],
};

const STANDARD_MENU = {
  navMain: [
    {
      id: "menu.dashboard",
      title: "Dashboard",
      url: "/dashboard",
      icon: Dock,
      isActive: true,
    },
    {
      id: "menu.operations",
      title: "Operations",
      url: `/operations`,
      icon: Target,
    },
    { id: "menu.strategy", title: "Strategy", url: "/strategy", icon: Frame },
    {
      id: "menu.tradingJournal",
      title: "Trading Journal",
      url: "/journal",
      icon: Book,
    },
    {
      id: "menu.tools",
      title: "Tools",
      url: "/tools/calculator",
      icon: Calculator,
    },
    {
      id: "menu.plans",
      title: "Plans",
      url: "/plans",
      icon: Crown,
    },
    {
      id: "menu.podium",
      title: "Podium",
      url: "/podium",
      icon: Users2Icon,
    },
    {
      id: "menu.settings.title",
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { id: "menu.settings.billing", title: "Billing", url: "/billing" },
        {
          id: "menu.settings.tradeAccount",
          title: "Accounts",
          url: "/accounts",
        },
      ],
    },
  ],
};

const ELITE_MENU = {
  navMain: [
    {
      id: "menu.dashboard",
      title: "Dashboard",
      url: "/dashboard",
      icon: Dock,
      isActive: true,
    },
    {
      id: "menu.operations",
      title: "Operations",
      url: `/operations`,
      icon: Target,
    },
    { id: "menu.strategy", title: "Strategy", url: "/strategy", icon: Frame },
    {
      id: "menu.tradingJournal",
      title: "Trading Journal",
      url: "/journal",
      icon: Book,
    },
    {
      id: "menu.podium",
      title: "Podium",
      url: "/podium",
      icon: Users2Icon,
    },
    {
      id: "menu.tools",
      title: "Tools",
      url: "#",
      icon: Calculator,
      items: [
        {
          title: "Lot Size Calculator",
          url: "/protected-route/tools/lot-size",
        },
      ],
    },
    {
      id: "menu.plans",
      title: "Plans",
      url: "/plans",
      icon: Crown,
      items: [
        {
          title: "Lot Size Calculator",
          url: "/protected-route/tools/lot-size",
        },
      ],
    },
    {
      id: "menu.settings.title",
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { id: "menu.settings.billing", title: "Billing", url: "/billing" },
        {
          id: "menu.settings.tradeAccount",
          title: "Accounts",
          url: "/accounts",
        },
      ],
    },
  ],
};

export const MAIN_MENU = {
  ELITE: ELITE_MENU,
  STANDARD: STANDARD_MENU,
  FREE: FREE_MENU,
};