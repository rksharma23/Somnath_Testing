# Guardian-Ward Mapping

This document shows the relationship between guardians, their wards, and the bikes assigned to each ward.

## 🏠 Guardian-Ward Relationships

### **Guardian 1: Amit Sharma (G001)**
- **User ID**: 1
- **Email**: amit.sharma@example.in
- **Phone**: 9876543210
- **Status**: Active
- **Created**: 2024-01-01

#### **Wards:**
1. **Rahul Sharma (W001)**
   - **Age**: 12 years old
   - **Grade**: 7th
   - **Bike ID**: BIKE001
   - **Bike Name**: Rahul's Mountain Bike
   - **Status**: Active
   - **Created**: 2024-01-15

2. **Priya Sharma (W002)**
   - **Age**: 10 years old
   - **Grade**: 5th
   - **Bike ID**: BIKE002
   - **Bike Name**: Priya's City Bike
   - **Status**: Active
   - **Created**: 2024-01-20

---

### **Guardian 2: Sneha Patel (G002)**
- **User ID**: 4
- **Email**: sneha.patel@example.in
- **Phone**: 9001122334
- **Status**: Active
- **Created**: 2024-01-05

#### **Wards:**
1. **Vikram Patel (W003)**
   - **Age**: 14 years old
   - **Grade**: 9th
   - **Bike ID**: BIKE003
   - **Bike Name**: Vikram's Racing Bike
   - **Status**: Active
   - **Created**: 2024-02-01

2. **Anjali Patel (W004)**
   - **Age**: 8 years old
   - **Grade**: 3rd
   - **Bike ID**: BIKE004
   - **Bike Name**: Anjali's Kids Bike
   - **Status**: Active
   - **Created**: 2024-02-10

---

### **Guardian 3: Priya Singh (G003)**
- **User ID**: 2
- **Email**: priya.singh@example.in
- **Phone**: 9123456789
- **Status**: Active
- **Created**: 2024-01-10

#### **Wards:**
- **No wards assigned yet**
- Can add wards through the Wards page in the dashboard

---

### **Guardian 4: Rahul Verma (G004)**
- **User ID**: 3
- **Email**: rahul.verma@example.in
- **Phone**: 9988776655
- **Status**: Active
- **Created**: 2024-01-12

#### **Wards:**
- **No wards assigned yet**
- Can add wards through the Wards page in the dashboard

---

## 🚴 Bike Tracking Summary

### **Active Bikes in Simulator:**
1. **BIKE001** → Rahul Sharma (Amit's ward)
2. **BIKE002** → Priya Sharma (Amit's ward)
3. **BIKE003** → Vikram Patel (Sneha's ward)
4. **BIKE004** → Anjali Patel (Sneha's ward)

### **Bike Characteristics:**
- **BIKE001**: Mountain Bike (45-60 km/h, 5-15 km rides)
- **BIKE002**: City Bike (40-55 km/h, 3-12 km rides)
- **BIKE003**: Racing Bike (50-65 km/h, 8-18 km rides)
- **BIKE004**: Kids Bike (35-50 km/h, 2-8 km rides)

---

## 📊 Statistics

### **Guardians:**
- **Total Guardians**: 4
- **Active Guardians**: 4
- **Guardians with Wards**: 2 (Amit, Sneha)
- **Guardians without Wards**: 2 (Priya, Rahul)

### **Wards:**
- **Total Wards**: 4
- **Active Wards**: 4
- **Wards with Bikes**: 4

### **Bikes:**
- **Total Bikes**: 4
- **Active Bikes**: 4
- **Bikes in Simulator**: 4

---

## 🔄 Data Flow

### **Simulator → Server:**
```
BIKE001 (Rahul) → Amit Sharma
BIKE002 (Priya) → Amit Sharma
BIKE003 (Vikram) → Sneha Patel
BIKE004 (Anjali) → Sneha Patel
```

### **Server Storage:**
- **Daily Logs**: `server/data/daily/YYYY-MM-DD.json`
- **Bike Status**: `server/data/bikes.json`
- **Guardian Data**: `server/data/guardians.json`

---

## 👥 Login Credentials

### **Test Users:**
1. **Amit Sharma**
   - Email: amit.sharma@example.in
   - Password: password123

2. **Sneha Patel**
   - Email: sneha.patel@example.in
   - Password: password123

3. **Priya Singh**
   - Email: priya.singh@example.in
   - Password: password123

4. **Rahul Verma**
   - Email: rahul.verma@example.in
   - Password: password123

---

## 📍 Location Data

All bikes are currently simulated around **Mumbai, Maharashtra**:
- **Base Location**: 19.0760°N, 72.8777°E
- **Movement Range**: ±0.005° (approximately ±500 meters)

---

## 🔧 System Files

### **Data Files:**
- `server/data/users.json` - User accounts
- `server/data/guardians.json` - Guardian-ward relationships
- `server/data/bikes.json` - Bike tracking data
- `server/data/ranks.json` - Leaderboard data

### **Log Files:**
- `server/data/daily/YYYY-MM-DD.json` - Daily bike data logs

---

*Last Updated: 2024-01-15*
*System Version: Firefox Dashboard v1.0* 