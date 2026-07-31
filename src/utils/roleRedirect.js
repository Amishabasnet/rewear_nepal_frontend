export function getDashboardPath(role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    default:
      return "/seller/dashboard";
  }
}