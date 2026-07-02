import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import EditProduct from "@/app/products/[id]/edit/page";

export default function Layout() {
    return (
        <ProtectedRoute>
            <EditProduct />
        </ProtectedRoute>
    );
}
