import React from "react";

interface ThemeToggleProps {
    mode: "dark" | "light";
    onToggle: () => void;
}

const ThemeToggle = ({ mode, onToggle }: ThemeToggleProps): React.ReactElement => {
    const nextMode = mode === "dark" ? "light" : "dark";

    return (
        <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${nextMode} mode`}
            aria-pressed={mode === "light"}
            onClick={onToggle}
        >
            {mode === "dark" ? "Light mode" : "Dark mode"}
        </button>
    );
};

export default ThemeToggle;
