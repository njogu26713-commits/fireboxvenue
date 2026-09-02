/**
 * Signal Furnace design system: keep the overall app in a cobalt-black command-deck
 * environment with Furnace Orange accents and minimal technical motion.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Solutions from "./pages/Solutions";
import Admin from "./pages/Admin";
import Support from "@/pages/Support";
import { Documentation } from "@/pages/Directory";
import Services from "@/pages/Services";
import Products from "@/pages/Products";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/admin" component={Admin} />
      <Route path="/support" component={Support} />
      <Route path="/products" component={Products} />
      <Route path="/services" component={Services} />
      <Route path="/docs" component={Documentation} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { theme } = useTheme();

  return (
    <TooltipProvider>
      <Toaster richColors theme={theme} position="bottom-right" />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
