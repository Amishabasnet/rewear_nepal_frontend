import { Link, useLocation } from "react-router-dom";
import { Clock3 } from "lucide-react";

export default function SellerRegistrationStatus() {
  const location = useLocation();
  const { shopName, email, message } = location.state || {};

  return (
    <div className="w-full max-w-sm text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-mustard-400/15 text-mustard-600">
        <Clock3 className="h-7 w-7" />
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-ink-900">Application submitted</h1>

      <p className="mb-6 text-sm text-ink-500">
        {message ||
          `Thanks${shopName ? `, ${shopName}` : ""}! Your seller application is now pending admin approval. We'll notify you${
            email ? ` at ${email}` : ""
          } once your shop is verified.`}
      </p>

      <div className="mb-6 rounded-xl border border-ink-100 bg-white p-4 text-left text-sm text-ink-600">
        <p className="mb-1 font-semibold text-ink-800">What happens next?</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>Our team reviews your shop details and verification document.</li>
          <li>Approval usually takes 1–2 business days.</li>
          <li>You can log in any time to check your approval status.</li>
        </ul>
      </div>

      <Link to="/login" className="btn-primary">
        Go to login
      </Link>
      <p className="mt-4 text-sm text-ink-500">
        <Link to="/" className="font-semibold text-rust-500 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
