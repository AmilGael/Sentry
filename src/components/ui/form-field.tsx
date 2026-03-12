type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
} & (
  | { as?: "input" }
  | { as: "textarea" }
  | { as: "select"; options: { value: string; label: string }[] }
);

export function FormField(props: FormFieldProps) {
  const { label, name, required, defaultValue, placeholder, error } = props;
  const id = `field-${name}`;

  const baseClasses =
    "mt-1 block w-full rounded-lg border bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white text-sm";
  const borderClass = error
    ? "border-red-700 focus:border-red-500 focus:ring-red-500"
    : "border-gray-700 focus:border-white";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {"as" in props && props.as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className={`${baseClasses} ${borderClass}`}
        />
      ) : "as" in props && props.as === "select" ? (
        <select
          id={id}
          name={name}
          required={required}
          defaultValue={defaultValue}
          className={`${baseClasses} ${borderClass}`}
        >
          <option value="">Select...</option>
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={props.type ?? "text"}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`${baseClasses} ${borderClass}`}
        />
      )}

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
