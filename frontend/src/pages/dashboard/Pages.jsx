import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiShoppingCart,
  FiHeart,
  FiCalendar,
  FiCreditCard,
  FiLogOut,
  FiSettings,
  FiUser,
  FiPlus,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useVehicleStore } from "../../store/vehicleStore";
import { useCartStore } from "../../store/cartStore";
import { useToast } from "../../context/ToastContext";
import { bookingService } from "../../services/bookingService";
import { socketService } from "../../services/socket";
import { vehicleService } from "../../services/vehicleService";

const comingSoon = (addToast, label) => () =>
  addToast(`${label} is coming soon`, "info");

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { wishlist } = useVehicleStore();
  const { items } = useCartStore();
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const { data } = await bookingService.getUserBookings();
        setBookings(data.bookings || []);
      } catch (error) {
        setBookings([]);
      }
    };

    fetchBookings();

    const handleBookingUpdate = (payload) => {
      if (!payload?.booking) return;
      setBookings((current) => {
        const next = current.filter(
          (booking) => booking.id !== payload.booking.id,
        );
        return [payload.booking, ...next];
      });
    };

    socketService.onBookingUpdated(handleBookingUpdate);
    return () => socketService.offBookingUpdated(handleBookingUpdate);
  }, [user]);

  const stats = [
    {
      icon: FiShoppingCart,
      label: "Items in Cart",
      value: String(items.length),
      color: "text-accent-500",
    },
    {
      icon: FiCalendar,
      label: "Upcoming Bookings",
      value: String(bookings.length),
      color: "text-green-600",
    },
    {
      icon: FiHeart,
      label: "Favorites",
      value: String(wishlist.length),
      color: "text-red-500",
    },
    {
      icon: FiCreditCard,
      label: "Total Spent",
      value: "$0",
      color: "text-purple-500",
    },
  ];

  const recentActivity = [
    ...wishlist.slice(0, 3).map((v) => ({
      id: `wish-${v.id}`,
      title: `Added ${v.name} to favorites`,
    })),
    ...items.slice(0, 3).map((i) => ({
      id: `cart-${i.vehicle.id}-${i.mode}`,
      title: `Added ${i.vehicle.name} to cart`,
    })),
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Gene's InDrive</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
        <div className="bg-white dark:bg-surface-800 border-b border-slate-200 dark:border-surface-700 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Here's what's happening with your account
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card>
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            {stat.label}
                          </p>
                          <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                        <div className={stat.color}>
                          <Icon size={32} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Recent Activity
                  </h2>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
                      No activity yet — browse vehicles to get started.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-surface-700 last:border-0 last:pb-0"
                        >
                          <div className="w-2 h-2 rounded-full bg-accent-500 mt-2" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {activity.title}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Quick Actions
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={() => navigate("/vehicles")}
                  >
                    Browse Vehicles
                  </Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => navigate("/cart")}
                  >
                    View Cart
                  </Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => navigate("/saved-vehicles")}
                  >
                    My Favorites
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => navigate("/profile")}
                  >
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast("You have been signed out", "info");
    navigate("/");
  };

  return (
    <>
      <Helmet>
        <title>Profile - Gene's InDrive</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  My Profile
                </h1>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start py-3 border-b border-slate-200 dark:border-surface-700">
                      <span className="text-slate-600 dark:text-slate-400">
                        Name
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {user?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-start py-3 border-b border-slate-200 dark:border-surface-700">
                      <span className="text-slate-600 dark:text-slate-400">
                        Email
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {user?.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-start py-3">
                      <span className="text-slate-600 dark:text-slate-400">
                        Phone
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {user?.phone || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Account Settings
                  </h2>
                  <div className="space-y-3">
                    <Button
                      fullWidth
                      variant="secondary"
                      className="flex items-center gap-2"
                      onClick={comingSoon(addToast, "Profile editing")}
                    >
                      <FiSettings size={18} />
                      Edit Profile
                    </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      className="flex items-center gap-2"
                      onClick={comingSoon(addToast, "Payment methods")}
                    >
                      <FiCreditCard size={18} />
                      Payment Methods
                    </Button>
                    <Button
                      fullWidth
                      variant="danger"
                      className="flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <FiLogOut size={18} />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export const DealerDashboard = () => {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.role === "dealer" || user?.role === "owner";

  useEffect(() => {
    if (!isOwner) {
      setLoading(false);
      return;
    }

    setLoading(false);
    setVehicles([]);
  }, [isOwner]);

  return (
    <>
      <Helmet>
        <title>Dealer Dashboard - Gene's InDrive</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-surface-900">
        <div className="bg-white dark:bg-surface-800 border-b border-slate-200 dark:border-surface-700 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome, {user?.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your inventory and customer interactions
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {!isOwner ? (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Access Required
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Only account owners (dealer/owner) can manage inventory.
                  Please contact support to gain access.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Inventory status
                </h2>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-slate-500">Loading...</p>
                ) : vehicles.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Inventory sync is ready for the backend connection. Add the
                    dealer inventory API next.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="flex items-center justify-between border-b border-slate-200 dark:border-surface-700 py-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {vehicle.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {vehicle.brand} — ${vehicle.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export const AdminDashboard = () => {
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    rentalPrice: "",
    image: "",
    category: "standard",
    type: "sedan",
    fuel: "gasoline",
    transmission: "automatic",
    mileage: "",
    seats: "5",
    horsepower: "",
    color: "",
    description: "",
    featured: false,
    available: true,
    status: "available",
  });

  const loadVehicles = async () => {
    try {
      const { data } = await vehicleService.getVehicles();
      setVehicles(data.vehicles || []);
    } catch (error) {
      addToast(
        error.response?.data?.message || "Unable to load vehicles.",
        "error",
      );
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const resetForm = () => {
    setEditingVehicle(null);
    setForm({
      name: "",
      brand: "",
      model: "",
      year: "",
      price: "",
      rentalPrice: "",
      image: "",
      category: "standard",
      type: "sedan",
      fuel: "gasoline",
      transmission: "automatic",
      mileage: "",
      seats: "5",
      horsepower: "",
      color: "",
      description: "",
      featured: false,
      available: true,
      status: "available",
    });
  };

  const startEditing = (vehicle) => {
    setEditingVehicle(vehicle.id);
    setForm({
      ...vehicle,
      rentalPrice: vehicle.rentalPrice || "",
      year: vehicle.year || "",
      price: vehicle.price || "",
      mileage: vehicle.mileage || "",
      seats: vehicle.seats || 5,
      horsepower: vehicle.horsepower || "",
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Please choose an image file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setForm((current) => ({ ...current, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const request = editingVehicle
        ? vehicleService.updateVehicle(editingVehicle, form)
        : vehicleService.createVehicle(form);
      await request;
      addToast(
        editingVehicle ? "Vehicle updated." : "Vehicle added.",
        "success",
      );
      resetForm();
      await loadVehicles();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Unable to save vehicle.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete ${vehicle.name}?`)) return;
    try {
      await vehicleService.deleteVehicle(vehicle.id);
      addToast("Vehicle deleted.", "success");
      await loadVehicles();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Unable to delete vehicle.",
        "error",
      );
    }
  };

  const fields = [
    ["name", "Name"],
    ["brand", "Brand"],
    ["model", "Model"],
    ["year", "Year"],
    ["price", "Price"],
    ["rentalPrice", "Rental price"],
    ["image", "Image URL"],
    ["category", "Category"],
    ["type", "Type"],
    ["fuel", "Fuel"],
    ["transmission", "Transmission"],
    ["mileage", "Mileage"],
    ["seats", "Seats"],
    ["horsepower", "Horsepower"],
    ["color", "Color"],
  ];

  const availableCount = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  ).length;
  const featuredCount = vehicles.filter((vehicle) => vehicle.featured).length;
  const maintenanceCount = vehicles.filter(
    (vehicle) => vehicle.status === "maintenance",
  ).length;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Gene&apos;s InDrive</title>
      </Helmet>
      <div className="min-h-screen bg-[#f4f1eb] dark:bg-[#101416]">
        <header className="relative overflow-hidden bg-[#15191b] px-5 py-8 text-white sm:px-8 lg:px-12">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(135deg,transparent_20%,rgba(199,151,69,.16)_20%,rgba(199,151,69,.04)_65%,transparent_65%)]" />
          <div className="relative mx-auto flex max-w-[1440px] items-end justify-between gap-6">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]" />{" "}
                Operations / Control room
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                Good morning, Admin.
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-400">
                Keep the showroom moving. Your inventory is the heartbeat of
                every customer journey.
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Live inventory
              </p>
              <p className="mt-1 font-display text-3xl text-amber-300">
                {vehicles.length.toString().padStart(2, "0")}{" "}
                <span className="text-sm text-slate-500">units</span>
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              [
                "Available now",
                availableCount,
                "text-emerald-600",
                "bg-emerald-500",
              ],
              [
                "Total inventory",
                vehicles.length,
                "text-slate-900 dark:text-white",
                "bg-amber-500",
              ],
              [
                "Featured units",
                featuredCount,
                "text-slate-900 dark:text-white",
                "bg-sky-500",
              ],
              [
                "Needs attention",
                maintenanceCount,
                "text-rose-600",
                "bg-rose-500",
              ],
            ].map(([label, value, color, dot]) => (
              <div
                key={label}
                className="border-l-4 border-[#c79745] bg-[#fbfaf7] px-4 py-4 shadow-[0_8px_24px_rgba(17,19,21,.07)] dark:bg-[#1b2123]"
              >
                <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-slate-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  {label}
                </div>
                <p className={`font-display text-3xl font-semibold ${color}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.8fr)] xl:items-start">
            <section className="overflow-hidden border border-[#d7d5cf] bg-[#fbfaf7] shadow-[0_12px_35px_rgba(17,19,21,.08)] dark:border-surface-700 dark:bg-[#1b2123]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7d5cf] px-5 py-5 dark:border-surface-700 sm:px-7">
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-400">
                    Fleet catalogue
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                    Vehicle inventory
                  </h2>
                </div>
                <Button size="sm" onClick={resetForm}>
                  <FiPlus /> New vehicle
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="bg-[#f1eee8] text-[10px] font-bold uppercase tracking-[.14em] text-slate-500 dark:bg-[#15191b]">
                    <tr>
                      <th className="px-5 py-3 sm:px-7">Vehicle</th>
                      <th className="px-3 py-3">Position</th>
                      <th className="px-3 py-3">Price</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-5 py-3 text-right sm:px-7">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="border-b border-[#e5e2dc] last:border-0 hover:bg-[#f5f1e9] dark:border-surface-700/60 dark:hover:bg-surface-800"
                      >
                        <td className="px-5 py-4 sm:px-7">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {vehicle.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {vehicle.brand} / {vehicle.model} / {vehicle.year}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-sm capitalize text-slate-600 dark:text-slate-300">
                          {vehicle.category}
                        </td>
                        <td className="px-3 py-4 font-display text-sm text-slate-900 dark:text-white">
                          ${Number(vehicle.price).toLocaleString()}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold capitalize ${vehicle.status === "available" ? "text-emerald-700 dark:text-emerald-400" : vehicle.status === "maintenance" ? "text-rose-600 dark:text-rose-400" : "text-amber-700 dark:text-amber-400"}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right sm:px-7">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Edit ${vehicle.name}`}
                              onClick={() => startEditing(vehicle)}
                            >
                              <FiEdit2 />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Delete ${vehicle.name}`}
                              onClick={() => handleDelete(vehicle)}
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              className="border border-[#d7d5cf] bg-[#fbfaf7] shadow-[0_12px_35px_rgba(17,19,21,.08)] dark:border-surface-700 dark:bg-[#1b2123]
              "
            >
              <div className="border-b border-[#d7d5cf] px-6 py-5 dark:border-surface-700">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-400">
                  {editingVehicle ? "Editing record" : "Inventory action"}
                </p>
                <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                  {editingVehicle ? "Update vehicle" : "Add a vehicle"}
                </h2>
              </div>
              <div className="p-6">
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-2 gap-3"
                >
                  {fields.map(([name, label]) => (
                    <label
                      key={name}
                      className={`text-xs font-semibold text-slate-600 dark:text-slate-300 ${name === "image" ? "col-span-2" : ""}`}
                    >
                      {label}
                      <input
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        required={["name", "brand", "model"].includes(name)}
                        type={
                          [
                            "year",
                            "price",
                            "rentalPrice",
                            "mileage",
                            "seats",
                            "horsepower",
                          ].includes(name)
                            ? "number"
                            : "text"
                        }
                        className="mt-1.5 w-full rounded-md border border-[#d7d5cf] bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
                      />
                      {name === "image" && (
                        <span className="mt-2 block rounded-md border border-dashed border-amber-500/60 bg-amber-50/50 p-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/5 dark:text-amber-300">
                          <span className="mb-2 flex items-center gap-2"><FiPlus /> Upload from computer</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-xs file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-amber-400"
                          />
                        </span>
                      )}
                    </label>
                  ))}
                  <label className="col-span-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Description
                    <textarea
                      name="description"
                      value={form.description || ""}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1.5 w-full resize-none rounded-md border border-[#d7d5cf] bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-surface-600 dark:bg-surface-800 dark:text-white"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={handleChange}
                      className="accent-amber-500"
                    />{" "}
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      name="available"
                      checked={form.available}
                      onChange={handleChange}
                      className="accent-amber-500"
                    />{" "}
                    Available
                  </label>
                  <div className="col-span-2 flex gap-3 border-t border-[#e5e2dc] pt-5 dark:border-surface-700">
                    <Button type="submit" isLoading={isSaving} fullWidth>
                      {editingVehicle ? "Save changes" : "Add to inventory"}
                    </Button>
                    {editingVehicle && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};
