import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  hasPermission,
} from "../../constants/roles";

export default function PermissionRoute({
  permission,
  children,
}) {
  const {
    role,
    loading,
  } = useAuth();

  if (loading) {
    return null;
  }

  if (
    !hasPermission(
      role,
      permission
    )
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}