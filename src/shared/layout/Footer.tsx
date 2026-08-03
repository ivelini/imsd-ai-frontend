// Подвал: серверный, данные через props (03.08.2026)
import type { NavData } from "@/shared/api/data";
import { Button } from "@/shared/ui/Button";

interface FooterProps {
  nav: NavData;
}

export function Footer({ nav }: FooterProps) {
  return (
    <footer>
      <div className="footer-content container">
        <div className="footer-group footer-group-center">
          <p className="footer-grup-num">{nav.phone.footer}</p>
          <Button className="footer-get-call" type="button">Заказать звонок</Button>
          <div className="footer-group-city">{nav.footerCopyright}</div>
        </div>
        {nav.footerGroups.map((group, i) => (
          <div className="footer-group fg-hide" key={i}>
            {group.map((link) => (
              <a href={link.href} className="footer-group-link" key={link.label}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
        <div className="footer-group"></div>
        <div className="footer-group footer-group-center fg-hide-2">
          <p className="we-are-in-social">Мы в соцсетях</p>
          <div className="social-row">
            {nav.socials.map((s) => (
              <img key={s} src={`/assets/img/${s}.svg`} alt="" className="social-row-item" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
