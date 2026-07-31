import Link from "next/link";
import { FOOTER_GROUPS, FOOTER_CITY, PHONE_FOOTER, SOCIALS_FOOTER } from "@/data/nav";

export function Footer() {
  return (
    <footer>
      <div className="footer-content container">
        <div className="footer-group footer-group-center">
          <p className="footer-grup-num">{PHONE_FOOTER}</p>
          <button className="footer-get-call" type="button">
            Заказать звонок
          </button>
          <div className="footer-group-city">{FOOTER_CITY}</div>
        </div>
        {FOOTER_GROUPS.map((group, i) => (
          <div className="footer-group fg-hide" key={i}>
            {group.map((item) => (
              <Link href={item.href} className="footer-group-link" key={item.label}>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="footer-group"></div>
        <div className="footer-group footer-group-center fg-hide-2">
          <p className="we-are-in-social">Мы в соцсетях</p>
          <div className="social-row">
            {SOCIALS_FOOTER.map((s) => (
              <img src={`/assets/img/${s}.svg`} alt="" className="social-row-item" key={s} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
