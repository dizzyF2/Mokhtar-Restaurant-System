import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import PosPage from "./pages/PosPage";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route 
          path="/pos" 
          element={
            <ProtectedRoute requiredRole="employee">
              <PosPage />
            </ProtectedRoute>
          } 
        />
        <Route
            path="/admin"
            element={
                <ProtectedRoute requiredRole="admin">
                    <AdminPanel />
                </ProtectedRoute>
            }
          />
      </Routes>
      <Toaster
          position="top-center"
          toastOptions={{
              success: {
                style: {
                  background: "green",
                  color: "white",
                  padding: '16px',
                  borderRadius: '8px',
                }
              },
              error: {
                style: {
                  background: "red",
                  color: "white",
                  padding: '16px',
                  borderRadius: '8px',
                }
              }
          }}
        />
    </>
  );
}

export default App;
