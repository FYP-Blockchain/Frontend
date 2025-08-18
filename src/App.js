import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  createRoutesFromElements,
  Route,
  Navigate,
  ScrollRestoration,
} from "react-router-dom";
import Footer from "./components/home/Footer/Footer";
import FooterBottom from "./components/home/Footer/FooterBottom";
import Header from "./components/home/Header/Header";
import HeaderBottom from "./components/home/Header/HeaderBottom";
import SpecialCase from "./components/SpecialCase/SpecialCase";
import About from "./pages/About/About";
import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import GuestBooking from "./pages/Guest Booking/GuestBooking";
import Cart from "./pages/Cart/Cart";
import Contact from "./pages/Contact/Contact";
import Home from "./pages/Home/Home";
import Checkout from "./pages/Checkout/Checkout";
import Offer from "./pages/Offer/Offer";
import Download from "./pages/Download/Download"
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Payment from "./pages/payment/Payment";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Shop from "./pages/Shop/Shop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainComponent from "./components/home/Products/MainComponent";
import CreateEvent from "./pages/Admin/CreateEvent";
import EventList from "./pages/Admin/EventList";
import AdminPanel from "./pages/Admin/AdminPanel";
import ProfilePage from "./pages/Account/Profile";
import ContactList from "./pages/Admin/ContactList";

import {jwtDecode} from "jwt-decode";  // Correct import

const token = localStorage.getItem('token');
let userRole = '';

if (token) {
  try {
    const decoded = jwtDecode(token);
    userRole = decoded.role;
  } catch (error) {
    console.error('Invalid token', error);
    localStorage.removeItem('token');
  }
}

const isAdmin = userRole === 'ADMIN';
const isUser = userRole === 'USER';

const Layout = () => (
  <div>
    <ToastContainer
      position="top-right"
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
    <Header />
    <HeaderBottom />
    <SpecialCase />
    <ScrollRestoration />
    <Outlet />
    <Footer />
    <FooterBottom />
  </div>
);

const AdminRoute = ({ element }) => {
  return isAdmin ? element : <Navigate to="/signin" />;
};

const UserRoute = ({ element }) => {
  return isUser ? element : <Navigate to="/signin" />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/guestbooking" element={<GuestBooking />}/>
        

        <Route path="/checkout" element={<UserRoute element={<Checkout />} />} />
        <Route path="/download" element={<UserRoute element={<Download />} />} />
        <Route path="/profile" element={<UserRoute element={<ProfilePage />} />} />
        <Route path="/cart" element={<Cart />} />

        
        
        
        <Route path="/category/:category" element={<Offer />}></Route>
        <Route path="/product/:_id" element={<ProductDetails />} />
        <Route path="/paymentgateway" element={<Payment />} />
        <Route path="/products" element={<MainComponent />} />
      </Route>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      
      <Route path="/admindashboard" element={<AdminRoute element={<AdminDashboard />} />} />
      <Route path="/adminpanel" element={<AdminRoute element={<AdminPanel />} />} />
      <Route path="/eventcreation" element={<AdminRoute element={<CreateEvent />} />} />
      <Route path="/eventlist" element={<AdminRoute element={<EventList />} />} />
      <Route path="/contactlist" element={<AdminRoute element={<ContactList />} />} />
    </Route>
  )
);

function App() {
  return (
    <div className="font-bodyFont">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;