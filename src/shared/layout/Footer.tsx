// Подвал (фаза 1)
import { FOOTER_COPYRIGHT, FOOTER_GROUPS, PHONE, SOCIALS } from "@/data/nav";
import { Button } from "@/shared/ui/Button";

export function Footer() {
  return (
    <footer>
      <div className="footer-content container">
        <div className="footer-group footer-group-center">
          <p className="footer-grup-num">{PHONE.footer}</p>
          <Button className="footer-get-call" type="button">Заказать звонок</Button>
          <div className="footer-group-city">{FOOTER_COPYRIGHT}</div>
        </div>
        {FOOTER_GROUPS.map((group, i) => (
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
            {SOCIALS.map((s) => (
              <img key={s} src={`/assets/img/${s}.svg`} alt="" className="social-row-item" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
