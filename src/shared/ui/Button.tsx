// Кнопка: базовые классы из мокапа (.primary-button, .secondary-btn, .white-button, .buy-button)
// href → рендерит <a>, иначе <button>
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  href?: string;
  anchorProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
}

export function Button({ className = "primary-button", href, children, anchorProps, ...rest }: ButtonProps) {
  if (href) {
    return (
      <a href={href} className={className} {...anchorProps}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} {...rest}>
      {children}
    </button>
  );
}
