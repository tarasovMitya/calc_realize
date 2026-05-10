import type { Service, FieldValues, PriceBreakdown } from "../types/calculator";

export function calculatePrice(
  service: Service | null,
  fieldValues: FieldValues
): PriceBreakdown {
  if (!service) return { items: [], total: 0 };

  const items = [];
  let total = service.basePrice;
  let multiplier = 1;

  // find stepper with priceMultiplier first
  for (const field of service.fields) {
    if (field.type === "stepper" && field.priceMultiplier) {
      const val = fieldValues[field.id];
      multiplier = typeof val === "number" ? val : 1;
    }
  }

  items.push({
    label: `${service.name} × ${multiplier}`,
    amount: service.basePrice * multiplier,
  });
  total = service.basePrice * multiplier;

  for (const field of service.fields) {
    if (field.type === "stepper" && field.priceMultiplier) continue;

    if (field.type === "select") {
      const val = fieldValues[field.id];
      const option = field.options?.find((o) => o.value === val);
      if (option && option.price > 0) {
        const amount = option.price * multiplier;
        items.push({ label: option.label, amount });
        total += amount;
      }
    }

    if (field.type === "toggle") {
      const val = fieldValues[field.id];
      if (val === true && field.price) {
        items.push({ label: field.label, amount: field.price });
        total += field.price;
      }
    }

    if (field.type === "stepper" && !field.priceMultiplier && field.price) {
      const val = fieldValues[field.id];
      const count = typeof val === "number" ? val : 0;
      if (count > 0) {
        items.push({ label: field.label, amount: field.price * count });
        total += field.price * count;
      }
    }
  }

  return { items, total };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}
