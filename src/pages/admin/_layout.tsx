import { Navigate, Outlet, useLocation } from "react-router-dom";

import AdminPanelBar from "../../components/admin/AdminPanelBar";
import { AdminNavigationProvider } from "@/contexts/AdminNavigationContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { useAccount } from "@/contexts/AccountContext";
import Loading from "@/components/loading";
import { loginPath } from "@/utils/loginRedirect";

const AdminLayout = () => {
  return (
    <AdminNavigationProvider>
      <AdminPanelBar content={<Outlet />} />
    </AdminNavigationProvider>
  );
};

const AdminRoute = () => {
  const location = useLocation();
  const account = useAccount();

  if (account.loading) {
    return <Loading />;
  }
  if (!account.account?.logged_in) {
    return (
      <Navigate
        to={loginPath(location.pathname, location.search)}
        replace
      />
    );
  }
  return <AdminLayout />;
};

export default function Admin() {
  return (
    <AccountProvider>
      <AdminRoute />
    </AccountProvider>
  );
}
