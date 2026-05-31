import { LanguageProvider } from "./context/LanguageContext";
import AppRoutes from "./routes";
import AIAssistant from "./components/AI/AIAssistant";
import "./index.css";

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <AppRoutes />
      </div>

      {/* AI Chatbot */}
      <AIAssistant />
    </LanguageProvider>
  );
}

export default App;