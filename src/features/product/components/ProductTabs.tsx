"use client";
// Табы страницы товара: меню + контентные секции (фаза 3, 04.08.2026; живой API 22.10.2026)
// Вкладка выводится, только если у неё есть контент (productTabs); «Отзывы» бэк не отдаёт.
import { useState, useCallback } from "react";
import { DescriptionExpand } from "./DescriptionExpand";
import { ArticleBlock } from "@/shared/ui/ArticleBlock";
import { productTabs } from "../lib/productTabs";
import type { ProductDetailData } from "../types";
import type { ArticleBlockData } from "@/shared/types/articleBlock";

interface ProductTabsProps {
  product: ProductDetailData;
  /** Блок статьи из корня ответа; null — блока нет. */
  article: ArticleBlockData | null;
}

export function ProductTabs({ product, article }: ProductTabsProps) {
  const tabs = productTabs(product);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "");

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
          {tabs.map((tab) => (
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
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {product.description && (
        <div className="container section" id="description">
          <h2 className="section-title">Описание</h2>
          <DescriptionExpand text={product.description} />
        </div>
      )}

      {article && (
        <div className="container section">
          <ArticleBlock article={article} className="article-block" />
        </div>
      )}

      {product.availabilityText && (
        <div className="container section" id="availability">
          <h2 className="section-title">НАЛИЧИЕ</h2>
          <p className="section-content">{product.availabilityText}</p>
        </div>
      )}

      {product.deliveryText && (
        <div className="container section" id="delivery">
          <h2 className="section-title">Доставка</h2>
          <p className="section-content">{product.deliveryText}</p>
        </div>
      )}

      {product.warrantyText && (
        <div className="container section" id="warranty">
          <h2 className="section-title">Гарантия</h2>
          <p className="section-content">{product.warrantyText}</p>
        </div>
      )}
    </>
  );
}
