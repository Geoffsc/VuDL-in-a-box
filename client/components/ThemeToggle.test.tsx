import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
    it("offers light mode while dark mode is active", () => {
        render(<ThemeToggle mode="dark" onToggle={jest.fn()} />);

        expect(screen.getByRole("button", { name: "Switch to light mode" })).toHaveTextContent("Light mode");
        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("invokes the mode toggle when activated", async () => {
        const onToggle = jest.fn();
        render(<ThemeToggle mode="light" onToggle={onToggle} />);

        await userEvent.setup().click(screen.getByRole("button", { name: "Switch to dark mode" }));

        expect(onToggle).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });
});
