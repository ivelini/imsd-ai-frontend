"use client";
// Табы страницы товара: меню + контентные секции (фаза 3, 04.08.2026)
import { useState, useCallback } from "react";
import { DescriptionExpand } from "./DescriptionExpand";
import type { ProductDetailData } from "../types";

const TABS = [
  { id: "description", label: "Описание", mobileVisible: true },
  { id: "availability", label: "НАЛИЧИЕ", mobileVisible: true },
  { id: "delivery", label: "Доставка", mobileVisible: true },
  { id: "warranty", label: "Гарантия", mobileVisible: false },
  { id: "payment", label: "Оплата", mobileVisible: false },
  { id: "reviews", label: "Отзывы", mobileVisible: false },
] as const;

export function ProductTabs({ product }: { product: ProductDetailData }) {
  const [activeTab, setActiveTab] = useState("description");

  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      const el = document.getElementById(tabId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    [],
  );

  return (
    <>
      <div className="container menu-block">
        <ul className="menu">
          {TABS.map((tab) => {
            const label =
              tab.id === "reviews"
                ? `Отзывы (${product.reviewCount})`
                : tab.label;
            return (
              <li
                key={tab.id}
                className={`menu-item${!tab.mobileVisible ? " hide-on-mobile" : ""}`}
              >
                <a
                  href="#"
                  id={`link-${tab.id}`}
                  className={activeTab === tab.id ? "menu-item_active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick(tab.id);
                  }}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="container section" id="description">
        <h2 className="section-title">Описание</h2>
        <DescriptionExpand html={product.descriptionHtml} />
      </div>

      <div className="container section" id="availability">
        <h2 className="section-title">НАЛИЧИЕ</h2>
        <p className="section-content">{product.availabilityText}</p>
      </div>

      <div className="container section" id="delivery">
        <h2 className="section-title">Доставка</h2>
        <p className="section-content">{product.deliveryText}</p>
      </div>

      <div className="container section" id="warranty">
        <h2 className="section-title">Гарантия</h2>
        <p className="section-content">{product.warrantyText}</p>
      </div>

      <div className="container section" id="reviews">
        <h2 className="section-title">Отзывы</h2>
      </div>
    </>
  );
}
