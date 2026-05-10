import { useCalculatorStore } from "../../store/calculatorStore";
import { StepperField } from "../fields/StepperField";
import { SelectField } from "../fields/SelectField";
import { ToggleField } from "../fields/ToggleField";

export function ParametersStep() {
  const { selectedService, fieldValues, setFieldValue } = useCalculatorStore();

  if (!selectedService) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-2">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          {selectedService.name}
        </h2>
        <p className="text-gray-500 mt-2 text-lg">Уточните параметры</p>
      </div>
      <div className="flex flex-col gap-5">
        {selectedService.fields.map((field) => {
          const value = fieldValues[field.id];

          if (field.type === "stepper") {
            return (
              <div key={field.id} className="py-4">
                <StepperField
                  label={field.label}
                  value={typeof value === "number" ? value : (field.defaultValue as number) ?? 1}
                  onChange={(v) => setFieldValue(field.id, v)}
                  min={field.min}
                  max={field.max}
                />
              </div>
            );
          }

          if (field.type === "select" && field.options) {
            return (
              <SelectField
                key={field.id}
                label={field.label}
                value={typeof value === "string" ? value : (field.defaultValue as string) ?? ""}
                options={field.options}
                onChange={(v) => setFieldValue(field.id, v)}
              />
            );
          }

          if (field.type === "toggle") {
            return (
              <ToggleField
                key={field.id}
                label={field.label}
                value={typeof value === "boolean" ? value : false}
                price={field.price}
                onChange={(v) => setFieldValue(field.id, v)}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
