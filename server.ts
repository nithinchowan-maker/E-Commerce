import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Interfaces mirroring the client types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  rating: number;
}

interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'admin' | 'user';
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  createdAt: string;
}

// Database JSON file path
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load/save database state
interface Database {
  products: Product[];
  users: User[];
  orders: Order[];
}

const defaultProducts: Product[] = [
  {
    id: "p1",
    name: "Quantum Noise-Canceling Headphones",
    description: "Experience absolute acoustic silence, premium dynamic audio drivers, and an ultra-soft memo-foam design for extended listening comfort. Features 40-hour wireless battery life and rapid charging.",
    price: 19999.00,
    category: "Electronics",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60",
    rating: 4.8
  },
  {
    id: "p2",
    name: "Ultra-Wide curved Monitor (34\")",
    description: "Immersive panoramic 1500R curved display sporting a rich QHD resolution, brilliant HDR colors, and 144Hz high refresh rate for high-productivity multi-tasking or intense gaming sessions.",
    price: 39999.00,
    category: "Electronics",
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60",
    rating: 4.7
  },
  {
    id: "p3",
    name: "Minimalist Leather Backpack",
    description: "Meticulously crafted from full-grain vegetable-tanned leather. Features a dedicated protective 16-inch laptop pocket, hidden luggage strap, and ergonomic shoulder padding.",
    price: 4999.00,
    category: "Accessories",
    stock: 24,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60",
    rating: 4.5
  },
  {
    id: "p4",
    name: "Smart Wellness Fitness Band",
    description: "Real-time analytics for your body. High-accuracy 24/7 heart rate monitoring, sleep tracking analytics, SpO2 blood oxygen measurements, and guided breathing exercises with 50m water resistance.",
    price: 3499.00,
    category: "Electronics",
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=60",
    rating: 4.3
  },
  {
    id: "p5",
    name: "Raw Denim Trucker Jacket",
    description: "Classic American worker style built with 100% heavy organic selvedge cotton denim. Highly durable double-needle stitching, copper reinforcement buttons, and a tapered chest silhouette tailored to last a lifetime.",
    price: 5999.00,
    category: "Apparel",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=60",
    rating: 4.6
  },
  {
    id: "p6",
    name: "Handcrafted Ceramic Vase Set",
    description: "Elegantly finished hand-thrown ceramic containers styled with a natural rough slip feel and soft organic glaze detail. Perfect as standalone home sculptures or displaying fresh seasonal botanicals.",
    price: 1899.00,
    category: "Home Decor",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=60",
    rating: 4.4
  },
  {
    id: "p7",
    name: "Ergonomic Bamboo Standing Desk",
    description: "Height-adjustable electric workspace framing highly renewable premium bamboo solid desks with dual intelligent motors, four personalized preset memory configurations, and built-in fatigue sensors.",
    price: 29999.00,
    category: "Home Decor",
    stock: 5,
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=60",
    rating: 4.9
  },
  {
    id: "p8",
    name: "Stainless Steel Insulated Bottle",
    description: "Triple-walled vacuum insulation engineered to hold warm beverages for 12 hours and iced drinks for 24 hours. Food-grade rust-resistant stainless steel with a sleek premium slip-resistant powder shell.",
    price: 1299.00,
    category: "Accessories",
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=60",
    rating: 4.2
  },
  {
    id: "p9",
    name: "Suede Chelsea Casual Boots",
    description: "Supple water-resistant Italian split calf suede with elastic entry side panels, structured leather welt construction, luxury cushioned footbeds, and solid durable crepe compound grip outsoles.",
    price: 7999.00,
    category: "Apparel",
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=60",
    rating: 4.6
  },
  {
    id: "p10",
    name: "Smart Ambient RGB Floor Lamp",
    description: "Cast beautiful fluid colors throughout your environment. Generates 16 million colors plus customized ambient presets. Connects instantly with local Alexa, Google Home, and smartphone control apps.",
    price: 2499.00,
    category: "Home Decor",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=60",
    rating: 4.5
  }
];

const defaultUsers: User[] = [
  {
    id: "u_admin",
    name: "Admin Manager",
    email: "admin@ecostore.com",
    password: "adminpassword", // In production, hash passwords securely
    role: "admin"
  },
  {
    id: "u_buyer",
    name: "Alex Buyer",
    email: "buyer@ecostore.com",
    password: "buyerpassword",
    role: "user"
  }
];

// Read from JSON DB or initialize
function getDB(): Database {
  if (!fs.existsSync(DB_FILE)) {
    const freshDb: Database = {
      products: defaultProducts,
      users: defaultUsers,
      orders: []
    };
    saveDB(freshDb);
    return freshDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, resetting to default", err);
    const freshDb: Database = {
      products: defaultProducts,
      users: defaultUsers,
      orders: []
    };
    saveDB(freshDb);
    return freshDb;
  }
}

function saveDB(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database state to file", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper middleware to verify auth status and fetch user
  const getUserFromHeader = (req: express.Request): User | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.substring(7); // Token is the user's ID
    const db = getDB();
    const user = db.users.find(u => u.id === token);
    return user || null;
  };

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getUserFromHeader(req);
    if (!user) {
      res.status(401).json({ error: "Access Denied. You must log in." });
      return;
    }
    (req as any).user = user;
    next();
  };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getUserFromHeader(req);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Access Denied. Administrator rights required." });
      return;
    }
    (req as any).user = user;
    next();
  };

  // --- API ROUTES ---

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const db = getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Return custom profile payload (excluding sensitive fields)
    const { password: _, ...userPublic } = user;
    res.json({
      user: userPublic,
      token: user.id // Our token is simply the user ID
    });
  });

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    const db = getDB();
    const existing = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: "An account with this email already exists" });
      return;
    }

    const newUser: User = {
      id: "u_" + Date.now().toString(36),
      name,
      email,
      password,
      role: "user" // Standard sign-up defaults to buyer
    };

    db.users.push(newUser);
    saveDB(db);

    const { password: _, ...userPublic } = newUser;
    res.json({
      user: userPublic,
      token: newUser.id
    });
  });

  // Products: Get Products Catalog (with search, category filters and price/rating sorting)
  app.get("/api/products", (req, res) => {
    const db = getDB();
    let result = [...db.products];

    const search = req.query.search as string;
    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string; // 'price_asc' | 'price_desc' | 'rating'

    // Filtering
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower)
      );
    }
    if (category && category !== "All") {
      result = result.filter(p => p.category === category);
    }

    // Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    res.json(result);
  });

  // Products: Get Single Product details
  app.get("/api/products/:id", (req, res) => {
    const db = getDB();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  });

  // Products: Create New (Admin Only)
  app.post("/api/products", requireAdmin, (req, res) => {
    const { name, description, price, category, stock, imageUrl } = req.body;
    
    if (!name || !description || price === undefined || !category || stock === undefined) {
      res.status(400).json({ error: "All properties (name, description, price, category, stock) are required" });
      return;
    }

    const db = getDB();
    const newProduct: Product = {
      id: "p_" + Date.now().toString(36),
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock, 10),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60",
      rating: 5.0
    };

    db.products.push(newProduct);
    saveDB(db);

    res.status(201).json(newProduct);
  });

  // Products: Update (Admin Only)
  app.put("/api/products/:id", requireAdmin, (req, res) => {
    const db = getDB();
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const { name, description, price, category, stock, imageUrl } = req.body;
    const current = db.products[index];

    db.products[index] = {
      ...current,
      name: name !== undefined ? name : current.name,
      description: description !== undefined ? description : current.description,
      price: price !== undefined ? parseFloat(price) : current.price,
      category: category !== undefined ? category : current.category,
      stock: stock !== undefined ? parseInt(stock, 10) : current.stock,
      imageUrl: imageUrl !== undefined ? imageUrl : current.imageUrl,
    };

    saveDB(db);
    res.json(db.products[index]);
  });

  // Products: Delete (Admin Only)
  app.delete("/api/products/:id", requireAdmin, (req, res) => {
    const db = getDB();
    const index = db.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const deleted = db.products.splice(index, 1)[0];
    saveDB(db);
    res.json({ message: "Product deleted successfully", product: deleted });
  });

  // Orders: Standard user checks their history or admin checks everyone
  app.get("/api/orders", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const db = getDB();

    if (user.role === "admin") {
      // Admins access total order database
      res.json(db.orders);
    } else {
      // Regular buyers access their personal transactions
      const userOrders = db.orders.filter(o => o.userId === user.id);
      res.json(userOrders);
    }
  });

  // Orders: Create new order (Buyer Checkout)
  app.post("/api/orders", requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Shopping cart items are required to place an order" });
      return;
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.phone) {
      res.status(400).json({ error: "A complete shipping address is required for checkout" });
      return;
    }

    const db = getDB();
    let totalAmount = 0;
    const verifiedItems: OrderItem[] = [];

    // Verify stock and aggregate prices for each product in checkout
    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product) {
        res.status(400).json({ error: `Product ID '${item.productId}' no longer exists in our catalog.` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({ error: `Insufficient stock for product '${product.name}'. Selected: ${item.quantity}, Available: ${product.stock}` });
        return;
      }

      totalAmount += product.price * item.quantity;
      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    // Deduct inventory stock from successfully matched products!
    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId)!;
      product.stock -= item.quantity;
    }

    const newOrder: Order = {
      id: "ord_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: user.id,
      userEmail: user.email,
      items: verifiedItems,
      totalAmount: Math.round((totalAmount + Number.EPSILON) * 100) / 100, // precise rounding
      status: "pending",
      shippingAddress,
      createdAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder); // Add to the top
    saveDB(db);

    res.status(201).json(newOrder);
  });

  // Orders: Update status (Admin Only)
  app.put("/api/orders/:id/status", requireAdmin, (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Choose one of: ${allowedStatuses.join(", ")}` });
      return;
    }

    const db = getDB();
    const orderIndex = db.orders.findIndex(o => o.id === req.params.id);
    if (orderIndex === -1) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const previousStatus = db.orders[orderIndex].status;
    db.orders[orderIndex].status = status;

    // Optional stock reversal if status transitions to cancelled!
    if (status === "cancelled" && previousStatus !== "cancelled") {
      for (const item of db.orders[orderIndex].items) {
        const product = db.products.find(p => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
        }
      }
    }

    saveDB(db);
    res.json(db.orders[orderIndex]);
  });

  // Stats Dashboard: Aggregate numbers (Admin Only)
  app.get("/api/stats", requireAdmin, (req, res) => {
    const db = getDB();
    
    const countOrders = db.orders.length;
    const countProducts = db.products.length;
    const totalSales = db.orders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStock = db.products.filter(p => p.stock <= 5).length;

    // Sales by Category
    const salesByCategory: Record<string, number> = {};
    db.orders
      .filter(o => o.status !== "cancelled")
      .forEach(order => {
        order.items.forEach(item => {
          const product = db.products.find(p => p.id === item.productId);
          const cat = product ? product.category : "Unknown";
          salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.price * item.quantity);
        });
      });

    // Formatting sales categories for Recharts compatibility
    const categoryChartData = Object.entries(salesByCategory).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }));

    res.json({
      totals: {
        totalSales: Math.round(totalSales * 100) / 100,
        ordersCount: countOrders,
        productsCount: countProducts,
        lowStockItemsCount: lowStock
      },
      categoryChartData,
      recentOrders: db.orders.slice(0, 5)
    });
  });

  // Log to monitor API route health
  app.get("/api/info", (req, res) => {
    res.json({
      dbType: "Local Persistent File JSON",
      dbPath: DB_FILE,
      sizeOnDiskBytes: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
      initializedAt: "2026-05-21T11:58:29Z",
      currentBackendTime: new Date().toISOString()
    });
  });


  // --- FRONT-END VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets compiled by `vite build`
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
  });
}

startServer();
