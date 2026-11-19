import { HiMenuAlt1, HiMenuAlt2, HiMenuAlt3 } from 'react-icons/hi';

type MenuIconProps = {
  isOpen: boolean;
  isHovered?: boolean;
  size?: number;
};

export default function MenuIcon({ isOpen, isHovered = false, size = 29 }: MenuIconProps) {
  if (isOpen) return <HiMenuAlt1 size={size} aria-hidden="true" />;
  if (isHovered) return <HiMenuAlt2 size={size} aria-hidden="true" />;
  return <HiMenuAlt3 size={size} aria-hidden="true" />;
}
