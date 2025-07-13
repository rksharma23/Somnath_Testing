# Firefox Dashboard - Frontend

A modern React/TypeScript dashboard for guardian-ward bike tracking system with real-time data visualization and user management.

## 🚀 Overview

The frontend is a responsive dashboard built with React 18, TypeScript, and Tailwind CSS. It provides guardians with real-time monitoring of their wards' bike activities, user management, and analytics.

## 📁 Project Structure

```
client-template/
├── public/                 # Static assets
│   ├── images/            # Image assets
│   └── favicon.png        # App icon
├── src/
│   ├── components/        # Reusable components
│   │   ├── auth/         # Authentication components
│   │   ├── charts/       # Chart components
│   │   ├── common/       # Common UI components
│   │   ├── ecommerce/    # Dashboard data components
│   │   ├── form/         # Form components
│   │   ├── header/       # Header components
│   │   ├── tables/       # Table components
│   │   ├── ui/           # UI components
│   │   └── UserProfile/  # User profile components
│   ├── context/          # React contexts
│   ├── hooks/            # Custom hooks
│   ├── icons/            # SVG icons
│   ├── layout/           # Layout components
│   ├── pages/            # Page components
│   └── main.tsx          # App entry point
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **js-cookie** - Cookie management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to the client directory**
   ```bash
   cd client-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:5173 in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🔐 Authentication

### Login Credentials
Use these pre-configured accounts:

| Email | Password | Guardian |
|-------|----------|----------|
| amit.sharma@example.in | password123 | Amit Sharma |
| sneha.patel@example.in | password123 | Sneha Patel |
| priya.singh@example.in | password123 | Priya Singh |
| rahul.verma@example.in | password123 | Rahul Verma |

### Authentication Flow
1. User enters email and password
2. Backend validates credentials
3. JWT token is stored in cookies
4. User is redirected to dashboard
5. Guardian data is fetched automatically

## 📊 Dashboard Features

### Real-time Bike Data
- **Live updates** from guardian's wards' bikes
- **Speed monitoring** with status indicators
- **Distance tracking** in kilometers
- **Location data** with coordinates
- **Filtered data** - only shows guardian's ward bikes

### Analytics Components
- **EcommerceMetrics**: Summary cards with key metrics
- **MonthlySalesChart**: Cycling activity over time
- **StatisticsChart**: Detailed analytics with tabs
- **MonthlyTarget**: KM-based cycling targets
- **RecentOrders**: Real-time bike data table
- **DemographicCard**: Current location display

### User Management
- **Ward Management**: Add and view wards
- **User Profile**: Guardian information display
- **Authentication**: Login/logout functionality

## 🎨 UI Components

### Layout Components
- **AppLayout**: Main application layout
- **AppHeader**: Top navigation bar
- **AppSidebar**: Side navigation menu
- **Backdrop**: Modal backdrop component

### Form Components
- **SignInForm**: Login form
- **SignUpForm**: Registration form
- **InputField**: Reusable input component
- **Select**: Dropdown component
- **Checkbox**: Checkbox component

### Data Display
- **Table**: Data table component
- **Badge**: Status indicator
- **Chart**: Chart components
- **Modal**: Popup dialogs

## 🔄 State Management

### AuthContext
Manages authentication state and guardian data:

```typescript
interface AuthContextType {
  user: User | null;
  guardian: Guardian | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchGuardian: () => Promise<void>;
  addWard: (wardData: WardData) => Promise<void>;
}
```

### SidebarContext
Manages sidebar state and navigation:

```typescript
interface SidebarContextType {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}
```

## 📡 Real-time Communication

### Socket.IO Integration
The dashboard connects to the backend via Socket.IO for real-time updates:

```typescript
const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling"],
  timeout: 20000,
});

socket.on("bikeData", (data: BikeData) => {
  // Handle real-time bike data
});
```

### Data Filtering
Only bike data from guardian's wards is displayed:

```typescript
const guardianBikeIds = guardian?.wards?.map(ward => ward.bikeId) || [];
if (guardianBikeIds.includes(data.bikeId)) {
  // Display data
}
```

## 🎯 Key Features

### Responsive Design
- **Mobile-first** approach
- **Dark/Light theme** support
- **Responsive navigation** with collapsible sidebar
- **Touch-friendly** interface

### Real-time Updates
- **Live bike data** from wards
- **Instant notifications** for status changes
- **Auto-refresh** of dashboard components

### User Experience
- **Intuitive navigation** with breadcrumbs
- **Loading states** for better UX
- **Error handling** with user-friendly messages
- **Accessibility** features

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the client-template directory:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Firefox Dashboard
```

### Vite Configuration
The project uses Vite for fast development and building:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
```

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure
- **Components**: Reusable UI components
- **Pages**: Route-level components
- **Hooks**: Custom React hooks
- **Context**: Global state management
- **Types**: TypeScript type definitions

## 🐛 Troubleshooting

### Common Issues

1. **Build errors**
   ```bash
   npm run build
   ```
   Check for TypeScript errors and fix them.

2. **Socket connection issues**
   - Verify backend is running on port 3001
   - Check browser console for connection errors
   - Ensure CORS is properly configured

3. **Authentication problems**
   - Clear browser cookies
   - Check JWT token expiration
   - Verify backend authentication endpoints

4. **Real-time data not showing**
   - Ensure simulator is running
   - Check guardian has assigned wards
   - Verify bike IDs match guardian's wards

### Debug Mode
Enable debug logging in the browser console:

```typescript
// In any component
console.log('Guardian data:', guardian);
console.log('Bike data received:', data);
```

## 📈 Performance

### Optimization Features
- **Code splitting** with React.lazy()
- **Memoization** for expensive components
- **Efficient re-renders** with React.memo()
- **Bundle optimization** with Vite

### Best Practices
- **Component composition** over inheritance
- **Custom hooks** for reusable logic
- **TypeScript** for type safety
- **ESLint** for code quality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This frontend is designed to work with the backend server and simulator. Make sure all services are running for full functionality.
