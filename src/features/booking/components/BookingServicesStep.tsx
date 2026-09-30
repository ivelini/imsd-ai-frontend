// Шаг 2: услуги, готовые комплексы и параметры авто. Цена за колесо зависит от пары
// радиус+тип: до её выбора бэк отдаёт base_price, после — unit_price
"use client";

import { useRouter } from "next/navigation";
import { BookingAlert } from "./BookingAlert";
import { BookingSteps } from "./BookingSteps";
import { BookingSummary } from "./BookingSummary";
import { useBookingCatalog } from "@/features/booking/api/useBookingCatalog";
import { useBookingDraft } from "@/features/booking/api/useBookingDraft";
import { useBookingReference } from "@/features/booking/api/useBookingReference";
import { mapBookingError, toErrorResponse } from "@/features/booking/lib/errors";
import { buildQuote, toQuoteItems } from "@/features/booking/lib/quote";
import { formatMoney } from "@/shared/lib/money";
import type { BookingComplexDto } from "@/shared/api/booking";
import type { BookingServiceDto } from "@/features/booking/types";

/** Границы количества проверяет бэк; здесь — только чтобы кнопки не уходили в минус и за 4. */
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 4;

export function BookingServicesStep() {
  const router = useRouter();
  const { draft, save } = useBookingDraft(true);
  const { data: catalog, error } = useBookingCatalog(draft?.radius ?? null, draft?.carType ?? null);
  const { data: reference } = useBookingReference();

  if (draft === null) return null;

  // Количество по умолчанию — параметр бэка (правится в админке), не константа фронта;
  // до загрузки справочника годится минимальное
  const defaultQuantity = reference?.default_quantity ?? MIN_QUANTITY;

  const services = catalog?.services ?? [];
  const quantities: Record<number, number> = Object.fromEntries(
    draft.services.map((item) => [item.id, item.quantity]),
  );
  const quote = buildQuote(toQuoteItems(services, quantities));
  const amountOf = (id: number) => quote.rows.find((row) => row.id === id)?.amount ?? 0;

  const setQuantity = (id: number, quantity: number) => {
    const rest = draft.services.filter((item) => item.id !== id);
    save({
      ...draft,
      services: quantity >= MIN_QUANTITY ? [...rest, { id, quantity }] : rest,
    });
  };

  const isSelected = (id: number) => quantities[id] !== undefined;
  // Пара радиус+тип обязательна: подтверждение записи бэк без неё не принимает (валидация),
  // поэтому шаг не пропускает дальше, пока она не выбрана
  const paramsChosen = draft.radius !== null && draft.carType !== null;
  const isFullComplex = (complex: BookingComplexDto) =>
    complex.service_ids.every((id) => isSelected(id));
  const isPartialComplex = (complex: BookingComplexDto) =>
    !isFullComplex(complex) && complex.service_ids.some((id) => isSelected(id));

  const toggleComplex = (complex: BookingComplexDto) => {
    const full = isFullComplex(complex);
    const rest = draft.services.filter((item) => !complex.service_ids.includes(item.id));

    if (full) {
      save({ ...draft, services: rest });
      return;
    }

    const added = complex.service_ids.map((id) => ({ id, quantity: defaultQuantity }));
    save({ ...draft, services: [...rest, ...added] });
  };

  const pricingMissing =
    error !== null && mapBookingError(toErrorResponse(error)).state === "pricing_missing";

  return (
    <section className="booking-section container">
      <h2>Выберите услуги</h2>
      <p className="booking-subtitle">
        Цена в прайсе — за 1 колесо: укажите количество, итог пересчитается сразу
      </p>

      <BookingSteps active={2} />

      <div className="booking-row">
        <div className="booking-form">
          {pricingMissing && (
            <div className="booking-blk">
              <BookingAlert
                title="Нет цены для выбранных параметров"
                text="Для этой пары радиуса и типа автомобиля прайс не задан — выберите другие параметры."
              />
            </div>
          )}

          {catalog && catalog.complexes.length > 0 && (
            <div className="booking-blk">
              <h3 className="booking-blk-title">Готовые комплексы</h3>
              <div className="complexes-grid">
                {catalog.complexes.map((complex) => (
                  <label
                    key={complex.id}
                    className={
                      isFullComplex(complex)
                        ? "complex-card complex-card--full"
                        : isPartialComplex(complex)
                          ? "complex-card complex-card--partial"
                          : "complex-card"
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isFullComplex(complex)}
                      onChange={() => toggleComplex(complex)}
                    />
                    <span className="complex-card-text">
                      <span className="complex-card-name">{complex.name}</span>
                      <span className="complex-card-note">
                        {complex.service_ids
                          .map((id) => services.find((s) => s.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")}{" "}
                        · × {defaultQuantity}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="booking-blk">
            <h3 className="booking-blk-title">Услуги</h3>
            <div className="services-grid">
              {services.map((service) => (
                <ServiceCheckbox
                  key={service.id}
                  service={service}
                  checked={isSelected(service.id)}
                  onToggle={() =>
                    setQuantity(
                      service.id,
                      isSelected(service.id) ? 0 : defaultQuantity,
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div className="booking-blk">
            <h3 className="booking-blk-title">Параметры автомобиля</h3>
            <p className="booking-blk-hint">
              От радиуса и типа автомобиля зависит цена за колесо: выберите параметры, чтобы увидеть
              итог
            </p>

            <div className="param-group">
              <span className="param-group-label">Радиус колеса</span>
              <div className="param-chips">
                {(catalog?.rules.radius ?? []).map((option) => (
                  <label key={option.value} className="param-chip">
                    <input
                      type="radio"
                      name="radius"
                      value={option.value}
                      checked={draft.radius === Number(option.value)}
                      onChange={() => save({ ...draft, radius: Number(option.value) })}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="param-group">
              <span className="param-group-label">Тип автомобиля</span>
              <div className="param-chips">
                {(catalog?.rules.car_type ?? []).map((option) => (
                  <label key={option.value} className="param-chip">
                    <input
                      type="radio"
                      name="car-type"
                      value={option.value}
                      checked={draft.carType === String(option.value)}
                      onChange={() => save({ ...draft, carType: String(option.value) })}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BookingSummary
          date={draft.date}
          hour={draft.hour}
          total={quote.total}
          footer={
            <>
              <button
                className="booking-btn-primary"
                type="button"
                disabled={draft.services.length === 0 || !paramsChosen}
                onClick={() => router.push("/booking/details")}
              >
                Продолжить
              </button>
              <button
                className="booking-summary-link"
                type="button"
                onClick={() => router.push("/booking")}
              >
                Изменить время
              </button>
            </>
          }
        >
          {quote.rows.length > 0 && (
            <div className="booking-summary-group">
              {quote.rows.map((row) => (
                <div key={row.id}>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">
                      {services.find((service) => service.id === row.id)?.name}
                    </span>
                    <span className="booking-summary-value booking-summary-value--price">
                      {formatMoney(amountOf(row.id))}
                    </span>
                  </div>
                  <QuantityControl
                    quantity={row.quantity}
                    onChange={(quantity) => setQuantity(row.id, quantity)}
                  />
                </div>
              ))}
            </div>
          )}
        </BookingSummary>
      </div>
    </section>
  );
}

interface ServiceCheckboxProps {
  service: BookingServiceDto;
  checked: boolean;
  onToggle: () => void;
}

function ServiceCheckbox({ service, checked, onToggle }: ServiceCheckboxProps) {
  return (
    <label className="service-checkbox">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span className="service-checkbox-name">{service.name}</span>
      <span className="service-checkbox-price">
        {formatMoney(service.unit_price ?? service.base_price)}
      </span>
    </label>
  );
}

interface QuantityControlProps {
  quantity: number;
  onChange: (quantity: number) => void;
}

function QuantityControl({ quantity, onChange }: QuantityControlProps) {
  return (
    <div className="qty-control">
      <button
        className="qty-btn"
        type="button"
        disabled={quantity <= MIN_QUANTITY}
        onClick={() => onChange(quantity - 1)}
      >
        −
      </button>
      <span className="qty-value">× {quantity}</span>
      <button
        className="qty-btn"
        type="button"
        disabled={quantity >= MAX_QUANTITY}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}

