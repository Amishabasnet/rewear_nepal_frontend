import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapPin,
  PlusCircle,
  Tag,
  Truck,
  Wallet,
  CreditCard,
  CheckCircle2,
  Loader2,
  ShoppingBag,
} from "lucide-react";

import cartService from "../../services/cartService";
import addressService from "../../services/addressService";
import couponService from "../../services/couponService";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";

import CheckoutStepper from "../../components/checkout/CheckoutStepper";
import AddressForm from "../../components/checkout/AddressForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { formatNPR } from "../../utils/formatCurrency";

const DELIVERY_CHARGE = 150;
const FREE_DELIVERY_THRESHOLD = 5000;

export default function Checkout() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [step, setStep] = useState(1);

  // Step 1 — address
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Step 2 — coupon
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, message }

  // Step 3 — payment
  const [paymentMethod, setPaymentMethod] = useState(null); // "cod" | "online"

  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    Promise.allSettled([cartService.getCart(), addressService.getAddresses()]).then(
      ([cartRes, addressRes]) => {
        if (cartRes.status === "fulfilled") {
          setCartItems(cartRes.value.data.items || cartRes.value.data.cart?.items || []);
        }
        if (addressRes.status === "fulfilled") {
          const list = addressRes.value.data.addresses || addressRes.value.data || [];
          setAddresses(list);
          const preferred = list.find((a) => a.isDefault) || list[0];
          if (preferred) setSelectedAddressId(preferred._id || preferred.id);
        }
        setLoading(false);
      }
    );
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.quantity || 1) * (i.product?.price || 0), 0),
    [cartItems]
  );
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_CHARGE;
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);
  const selectedAddress = addresses.find((a) => (a._id || a.id) === selectedAddressId);

  const goTo = (n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveAddress = async (formValues) => {
    setSavingAddress(true);
    try {
      const { data } = await addressService.addAddress(formValues);
      const newAddress = data.address || data;
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddressId(newAddress._id || newAddress.id);
      setShowAddressForm(false);
      toast.success("Address saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data } = await couponService.applyCoupon(couponCode.trim(), subtotal);
      const discountAmount = data.discountAmount ?? data.discount ?? 0;
      if (!discountAmount) {
        toast.error(data.message || "This coupon isn't valid");
        return;
      }
      setAppliedCoupon({ code: couponCode.trim(), discount: discountAmount, message: data.message });
      toast.success(data.message || `Coupon applied — you saved ${formatNPR(discountAmount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const payload = {
        addressId: selectedAddressId,
        items: cartItems.map((i) => ({
          productId: i.product?._id || i.product?.id || i.productId,
          quantity: i.quantity || 1,
        })),
        couponCode: appliedCoupon?.code || undefined,
        paymentMethod,
        subtotal,
        deliveryCharge,
        discount,
        total,
      };

      const { data } = await orderService.createOrder(payload);
      const order = data.order || data;
      const orderId = order._id || order.id;

      if (paymentMethod === "online") {
        try {
          const { data: paymentData } = await paymentService.createPayment({
            orderId,
            amount: total,
          });
          if (paymentData.paymentUrl) {
            window.location.href = paymentData.paymentUrl;
            return;
          }
        } catch {
          toast.error("Order placed, but online payment could not be started. Please pay on delivery.");
        }
      }

      toast.success("Order placed successfully!");
      navigate(`/order-success/${orderId}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place your order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <LoadingSpinner label="Preparing checkout..." />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add something to your cart before checking out."
          size="lg"
          action={
            <Link to="/products" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
              Start shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <h1 className="mb-5 text-2xl font-semibold text-ink-900">Checkout</h1>
      <CheckoutStepper currentStep={step} onStepClick={goTo} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Step content */}
        <div className="space-y-4 lg:col-span-2">
          {step === 1 && (
            <div className="rounded-xl border border-ink-100 bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink-900">
                <MapPin className="h-4 w-4 text-rust-500" /> Delivery Address
              </h2>

              {addresses.length === 0 && !showAddressForm && (
                <p className="mb-4 text-sm text-ink-500">
                  You don't have any saved addresses yet. Add one to continue.
                </p>
              )}

              <div className="space-y-3">
                {addresses.map((addr) => {
                  const id = addr._id || addr.id;
                  const isSelected = id === selectedAddressId;
                  return (
                    <label
                      key={id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        isSelected ? "border-rust-500 bg-rust-50/40" : "border-ink-100 hover:bg-cream-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-rust-500"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(id)}
                      />
                      <div className="min-w-0 text-sm">
                        <p className="font-semibold text-ink-900">{addr.fullName}</p>
                        <p className="text-ink-600">
                          {addr.street}, {addr.city}
                          {addr.landmark ? ` — ${addr.landmark}` : ""}
                        </p>
                        <p className="text-ink-400">{addr.phone}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {showAddressForm ? (
                <div className="mt-4">
                  <AddressForm
                    onSave={handleSaveAddress}
                    onCancel={() => setShowAddressForm(false)}
                    saving={savingAddress}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="mt-4 flex items-center gap-2 text-sm font-semibold text-rust-500 hover:underline"
                >
                  <PlusCircle className="h-4 w-4" /> Add new address
                </button>
              )}

              <button
                onClick={() => goTo(2)}
                disabled={!selectedAddressId}
                className="btn-primary mt-6 disabled:opacity-50"
              >
                Continue to Order Review
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-ink-100 bg-white p-5">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink-900">
                  <MapPin className="h-4 w-4 text-rust-500" /> Delivering to
                </h2>
                {selectedAddress && (
                  <p className="text-sm text-ink-600">
                    <span className="font-semibold text-ink-900">{selectedAddress.fullName}</span> —{" "}
                    {selectedAddress.street}, {selectedAddress.city} · {selectedAddress.phone}
                  </p>
                )}
                <button
                  onClick={() => goTo(1)}
                  className="mt-2 text-xs font-semibold text-rust-500 hover:underline"
                >
                  Change address
                </button>
              </div>

              <div className="rounded-xl border border-ink-100 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-ink-900">Order Review</h2>
                <div className="divide-y divide-ink-50">
                  {cartItems.map((item) => {
                    const product = item.product || {};
                    const qty = item.quantity || 1;
                    return (
                      <div key={item._id || product._id} className="flex items-center gap-3 py-3">
                        <img
                          src={product.images?.[0] || product.image}
                          alt={product.title || product.name}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1 text-sm">
                          <p className="truncate font-medium text-ink-800">
                            {product.title || product.name}
                          </p>
                          <p className="text-xs text-ink-400">
                            {product.size && `Size ${product.size} · `}Qty {qty}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-ink-800">
                          {formatNPR(qty * (product.price || 0))}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 border-t border-dashed border-ink-200 pt-4">
                  <label className="label-field flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Coupon code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-lg bg-forest-50 px-3 py-2 text-sm">
                      <span className="font-semibold text-forest-700">
                        "{appliedCoupon.code}" applied — -{formatNPR(appliedCoupon.discount)}
                      </span>
                      <button onClick={removeCoupon} className="text-xs font-semibold text-ink-500 hover:underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="input-field"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="shrink-0 rounded-full border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition hover:bg-cream-100 disabled:opacity-50"
                      >
                        {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => goTo(1)}
                  className="flex-1 rounded-full border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-cream-100"
                >
                  Back
                </button>
                <button onClick={() => goTo(3)} className="flex-1 btn-primary">
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-ink-100 bg-white p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink-900">
                  <Wallet className="h-4 w-4 text-rust-500" /> Payment Method
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      paymentMethod === "cod" ? "border-rust-500 bg-rust-50/40" : "border-ink-100 hover:bg-cream-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="mt-1 accent-rust-500"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div className="text-sm">
                      <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                        <Truck className="h-4 w-4" /> Cash on Delivery
                      </p>
                      <p className="text-ink-500">Pay in cash when your order arrives.</p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      paymentMethod === "online"
                        ? "border-rust-500 bg-rust-50/40"
                        : "border-ink-100 hover:bg-cream-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="mt-1 accent-rust-500"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                    />
                    <div className="text-sm">
                      <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                        <CreditCard className="h-4 w-4" /> Online Payment
                      </p>
                      <p className="text-ink-500">Pay securely with card, eSewa, or Khalti.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => goTo(2)}
                  className="flex-1 rounded-full border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-cream-100"
                >
                  Back
                </button>
                <button
                  onClick={() => goTo(4)}
                  disabled={!paymentMethod}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Review &amp; Place Order
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-ink-100 bg-white p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink-900">
                  <CheckCircle2 className="h-4 w-4 text-rust-500" /> Confirm &amp; Place Order
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="rounded-lg bg-cream-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Deliver to</p>
                    <p className="mt-1 text-ink-800">
                      {selectedAddress?.fullName} · {selectedAddress?.phone}
                    </p>
                    <p className="text-ink-600">
                      {selectedAddress?.street}, {selectedAddress?.city}
                    </p>
                  </div>

                  <div className="rounded-lg bg-cream-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Items</p>
                    <p className="mt-1 text-ink-800">
                      {cartItems.length} item{cartItems.length > 1 ? "s" : ""} · {formatNPR(subtotal)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-cream-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Payment method</p>
                    <p className="mt-1 capitalize text-ink-800">
                      {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => goTo(3)}
                  disabled={placingOrder}
                  className="flex-1 rounded-full border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-cream-100 disabled:opacity-50"
                >
                  Back
                </button>
                <button onClick={handlePlaceOrder} disabled={placingOrder} className="flex-1 btn-primary">
                  {placingOrder ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Place Order — ${formatNPR(total)}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="h-fit rounded-xl border border-ink-100 bg-white p-5 lg:sticky lg:top-8">
          <h2 className="mb-4 text-base font-semibold text-ink-900">Cart Summary</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})</span>
              <span className="font-medium text-ink-800">{formatNPR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Delivery charge</span>
              <span className="font-medium text-ink-800">
                {deliveryCharge === 0 ? "Free" : formatNPR(deliveryCharge)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-forest-600">
                <span>Coupon discount</span>
                <span className="font-medium">-{formatNPR(discount)}</span>
              </div>
            )}
          </div>
          <div className="my-4 border-t border-dashed border-ink-200" />
          <div className="flex justify-between text-base font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatNPR(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
