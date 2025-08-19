declare module "lucide-react" {
  import { ComponentType } from "react";

  type IconProps = {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
    className?: string;
  };

  export const ArrowRight: ComponentType<IconProps>;
  export const CheckCircle: ComponentType<IconProps>;
  export const Search: ComponentType<IconProps>;
  export const MapPin: ComponentType<IconProps>;
  export const Calendar: ComponentType<IconProps>;
  export const Mail: ComponentType<IconProps>;
  export const AlertCircle: ComponentType<IconProps>;
  export const TagIcon: ComponentType<IconProps>;
  export const ChevronDown: ComponentType<IconProps>;
  export const ChevronUp: ComponentType<IconProps>;
  export const ChevronLeft: ComponentType<IconProps>;
  export const ChevronRight: ComponentType<IconProps>;
  export const LogIn: ComponentType<IconProps>;
  export const UserPlus: ComponentType<IconProps>;
  export const Loader2: ComponentType<IconProps>;
  export const CreditCard: ComponentType<IconProps>;
  export const User: ComponentType<IconProps>;
}
