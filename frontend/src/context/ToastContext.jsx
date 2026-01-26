import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 5000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-xl shadow-lg border backdrop-blur transition-all duration-300 animate-in slide-in-from-right-full ${toast.type === "success"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : toast.type === "error"
                                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                                    : "bg-blue-500/10 border-blue-500/20 text-brand-blue"
                            }`}
                    >
                        {toast.type === "success" && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
                        {toast.type === "error" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                        {toast.type === "info" && <Info className="h-5 w-5 flex-shrink-0" />}

                        <p className="flex-1 text-sm font-medium">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-white/10 rounded-lg transition"
                        >
                            <X className="h-4 w-4 opacity-70" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
