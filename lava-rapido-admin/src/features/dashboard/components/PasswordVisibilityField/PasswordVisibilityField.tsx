import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "@/theme/theme";
import "./PasswordVisibilityField.css";

interface PasswordVisibilityFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled?: boolean;
  required?: boolean;
}

export const PasswordVisibilityField = ({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled = false,
  required = false,
}: PasswordVisibilityFieldProps) => {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);
  const visibilityLabel = visible ? t("password.hide") : t("password.show");

  return (
    <div className="password-visibility-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-visibility-control">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
        />
        <button
          className="password-visibility-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visibilityLabel}
          aria-controls={id}
          aria-pressed={visible}
          disabled={disabled}
        >
          {visible ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};
