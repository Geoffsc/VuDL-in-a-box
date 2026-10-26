import React, { useEffect, useMemo, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import { GlobalContextProvider } from "../context/GlobalContext";
import { PaginatorContextProvider } from "../context/PaginatorContext";
import { FetchContextProvider } from "../context/FetchContext";

import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";

import "../styles/vendor/modern-normalize.css";
import "../styles/vendor/colors-radix-light.css";

import "../styles/reset.css";
import "../styles/variables.css";
import "../styles/global.css";
import "../styles/job-paginator.css";

const themeStorageKey = "vudl-theme";

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
    const [mode, setMode] = useState<"dark" | "light">("dark");
    const [themeLoaded, setThemeLoaded] = useState(false);

    useEffect(() => {
        const savedMode = window.localStorage.getItem(themeStorageKey);
        if (savedMode === "light" || savedMode === "dark") {
            setMode(savedMode);
        }
        setThemeLoaded(true);
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = mode;
        if (themeLoaded) {
            window.localStorage.setItem(themeStorageKey, mode);
        }
    }, [mode, themeLoaded]);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary:
                        mode === "dark"
                            ? { main: "#7dd3fc", contrastText: "#082f49" }
                            : { main: "#075985", contrastText: "#ffffff" },
                    secondary:
                        mode === "dark"
                            ? { main: "#cbd5e1", contrastText: "#0f172a" }
                            : { main: "#475569", contrastText: "#ffffff" },
                    error:
                        mode === "dark"
                            ? { main: "#fca5a5", contrastText: "#450a0a" }
                            : { main: "#b91c1c", contrastText: "#ffffff" },
                    warning:
                        mode === "dark"
                            ? { main: "#fde68a", contrastText: "#422006" }
                            : { main: "#a16207", contrastText: "#ffffff" },
                    success:
                        mode === "dark"
                            ? { main: "#86efac", contrastText: "#052e16" }
                            : { main: "#166534", contrastText: "#ffffff" },
                    info:
                        mode === "dark"
                            ? { main: "#7dd3fc", contrastText: "#082f49" }
                            : { main: "#075985", contrastText: "#ffffff" },
                    background:
                        mode === "dark"
                            ? { default: "#0b1220", paper: "#111c2e" }
                            : { default: "#f8fafc", paper: "#ffffff" },
                    text:
                        mode === "dark"
                            ? { primary: "#f1f5f9", secondary: "#cbd5e1" }
                            : { primary: "#0f172a", secondary: "#475569" },
                },
                typography: {
                    fontFamily: "system-ui, ui-sans-serif, sans-serif",
                },
            }),
        [mode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalContextProvider>
                <PaginatorContextProvider>
                    <FetchContextProvider>
                        <div className="top-actions">
                            <ThemeToggle
                                mode={mode}
                                onToggle={() => setMode((currentMode) => (currentMode === "dark" ? "light" : "dark"))}
                            />
                            <LogoutButton />
                        </div>
                        <Component {...pageProps} />
                    </FetchContextProvider>
                </PaginatorContextProvider>
            </GlobalContextProvider>
        </ThemeProvider>
    );
}
export default MyApp;
